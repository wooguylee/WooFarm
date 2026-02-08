/**
 * WooFarm - 상점 시스템
 * 아이템 구매/판매, 골드 관리, 계절별 상품 갱신을 담당한다.
 */
window.ShopSystem = (function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  // ===== 내부 상태 =====

  /** @type {number} 보유 골드 */
  var _gold = 500;

  /** @type {string} 현재 활성 구매 카테고리 */
  var _currentCategory = 'seeds';

  /** @type {string} 현재 활성 탭 ('buy' | 'sell') */
  var _currentTab = 'buy';

   /** @type {string|null} 현재 계절 (시즌별 할인/필터에 사용) */
   var _currentSeason = 'spring';

   /** @private 등록된 이벤트 핸들러 추적 (메모리 누수 방지) */
   var _eventHandlers = {};

   // ===== 초기화 =====

   /**
    * 상점 시스템을 정리한다 (메모리 누수 방지).
    * @private
    */
   function cleanup() {
     if (_eventHandlers.season_changed) {
       eventBus.off('season_changed', _eventHandlers.season_changed);
     }
     if (_eventHandlers.item_purchased) {
       eventBus.off('item_purchased', _eventHandlers.item_purchased);
     }
     if (_eventHandlers.item_sold) {
       eventBus.off('item_sold', _eventHandlers.item_sold);
     }
     if (_eventHandlers.gold_changed) {
       eventBus.off('gold_changed', _eventHandlers.gold_changed);
     }
     _eventHandlers = {};
   }

   /**
    * 상점 시스템을 초기화한다.
    * 이벤트 리스너를 등록하고 초기 골드를 표시한다.
    */
   function init() {
     // 기존 리스너 정리 (중복 방지)
     cleanup();

     // 계절 변경 시 상점 갱신
     _eventHandlers.season_changed = _onSeasonChanged;
     eventBus.on('season_changed', _eventHandlers.season_changed);

     // 구매/판매 이벤트 시 골드 디스플레이 갱신
     _eventHandlers.item_purchased = _updateGoldDisplay;
     _eventHandlers.item_sold = _updateGoldDisplay;
     _eventHandlers.gold_changed = _updateGoldDisplay;
     
     eventBus.on('item_purchased', _eventHandlers.item_purchased);
     eventBus.on('item_sold', _eventHandlers.item_sold);
     eventBus.on('gold_changed', _eventHandlers.gold_changed);

     // 초기 골드 디스플레이 설정
     _updateGoldDisplay();

     console.log('[ShopSystem] 초기화 완료. 보유 골드:', _gold);
     // 상점 탭 및 카테고리 버튼 클릭 이벤트 설정
     document.addEventListener('click', function(event) {
       var tabBtn = event.target.closest('.shop-tab');
       if (tabBtn && tabBtn.getAttribute('data-shop-tab')) {
         renderShopModal(tabBtn.getAttribute('data-shop-tab'));
       }
       var catBtn = event.target.closest('.shop-cat');
       if (catBtn && catBtn.getAttribute('data-cat')) {
         _currentCategory = catBtn.getAttribute('data-cat');
         _renderBuyTab();
       }
     });
   }

  // ===== 골드 관리 =====

  /**
   * 골드를 추가한다.
   * @param {number} amount - 추가할 금액 (양수)
   */
  function addGold(amount) {
    if (amount <= 0) return;
    _gold += Math.floor(amount);
    eventBus.emit('gold_changed', { gold: _gold, change: amount });
  }

  /**
   * 골드를 차감한다.
   * @param {number} amount - 차감할 금액 (양수)
   * @returns {boolean} 차감 성공 여부
   */
  function removeGold(amount) {
    if (amount <= 0) return false;
    if (_gold < amount) return false;
    _gold -= Math.floor(amount);
    eventBus.emit('gold_changed', { gold: _gold, change: -amount });
    return true;
  }

  // ===== 가격 계산 =====

  /**
   * 아이템의 구매 가격을 반환한다.
   * 현재 계절에 따라 할인이 적용될 수 있다.
   * @param {string} itemId - 아이템 ID
   * @returns {number} 구매 가격
   */
  function getBuyPrice(itemId) {
    // 작물 씨앗인 경우
    var cropData = window.CROP_DATA[itemId];
    if (cropData) {
      var price = cropData.seedPrice;
      // 현재 계절에 맞는 씨앗이면 10% 할인
      if (cropData.seasons && cropData.seasons.indexOf(_currentSeason) !== -1) {
        price = Math.floor(price * 0.9);
      }
      return price;
    }

    // 동물인 경우
    var animalData = window.ANIMAL_DATA[itemId];
    if (animalData) {
      return animalData.buyPrice;
    }

    // 장식품인 경우
    if (window.DECORATION_DATA && window.DECORATION_DATA[itemId]) {
      return window.DECORATION_DATA[itemId].price;
    }

    // 일반 아이템인 경우
    if (window.ITEM_DATA && window.ITEM_DATA[itemId]) {
      return window.ITEM_DATA[itemId].buyPrice || 0;
    }

    return 0;
  }

  /**
   * 아이템의 판매 가격을 반환한다.
   * 품질 보정이 적용될 수 있다.
   * @param {string} itemId - 아이템 ID
   * @param {string} [quality] - 품질 등급 ('gold', 'silver', 'bronze')
   * @returns {number} 판매 가격
   */
  function getSellPrice(itemId, quality) {
    var basePrice = 0;

    // 작물인 경우
    var cropData = window.CROP_DATA[itemId];
    if (cropData) {
      basePrice = cropData.sellPrice;
    }

    // 동물 생산품인 경우 — ANIMAL_DATA에서 생산품 매칭
    if (basePrice === 0) {
      var animalTypes = Object.keys(window.ANIMAL_DATA);
      for (var i = 0; i < animalTypes.length; i++) {
        var animal = window.ANIMAL_DATA[animalTypes[i]];
        if (animal.product && animal.product.name && itemId === animalTypes[i] + '_product') {
          basePrice = animal.product.sellPrice;
          break;
        }
      }
    }

    // 일반 아이템인 경우
    if (basePrice === 0 && window.ITEM_DATA && window.ITEM_DATA[itemId]) {
      basePrice = window.ITEM_DATA[itemId].sellPrice || 0;
    }

    // 작물 자체를 판매하는 경우 (수확물)
    if (basePrice === 0 && cropData) {
      basePrice = cropData.sellPrice;
    }

    // 품질 보정 배율 적용
    var qualityMultiplier = 1.0;
    if (quality === 'gold') {
      qualityMultiplier = 1.5;
    } else if (quality === 'silver') {
      qualityMultiplier = 1.25;
    } else if (quality === 'bronze') {
      qualityMultiplier = 1.0;
    }

    return Math.floor(basePrice * qualityMultiplier);
  }

  // ===== 구매 =====

  /**
   * 아이템을 구매한다.
   * @param {string} itemId - 구매할 아이템 ID
   * @param {number} [quantity=1] - 구매 수량
   * @returns {boolean} 구매 성공 여부
   */
  function buyItem(itemId, quantity) {
    quantity = quantity || 1;
    var unitPrice = getBuyPrice(itemId);
    var totalCost = unitPrice * quantity;

    // 골드 확인
    if (_gold < totalCost) {
      console.warn('[ShopSystem] 골드 부족. 필요:', totalCost, '보유:', _gold);
      return false;
    }

    // 동물 구매인 경우
    var animalData = window.ANIMAL_DATA[itemId];
    if (animalData) {
      // 동물은 한 마리씩만 구매 가능
      if (window.AnimalSystem && !window.AnimalSystem.canAddAnimal()) {
        console.warn('[ShopSystem] 동물 수용 한도 초과');
        return false;
      }
      // 골드 차감
      if (!removeGold(unitPrice)) return false;

      // 동물 시스템에 추가
      if (window.AnimalSystem) {
        window.AnimalSystem.addAnimal(itemId);
      }

      // 이벤트 발행 및 사운드 재생
      eventBus.emit('item_purchased', {
        itemId: itemId,
        type: 'animal',
        quantity: 1,
        totalCost: unitPrice
      });
      if (window.AudioManager) window.AudioManager.playSound('purchase');
      return true;
    }

    // 골드 차감
    if (!removeGold(totalCost)) return false;

    // 인벤토리에 추가
    if (window.InventorySystem) {
      // 씨앗 구매 시 아이템 ID에 '_seed' 접미사 추가 (작물 데이터 기반)
      var inventoryId = itemId;
      if (window.CROP_DATA[itemId]) {
        inventoryId = itemId + '_seed';
      }
      window.InventorySystem.addItem(inventoryId, quantity);
    }

    // 이벤트 발행 및 사운드 재생
    eventBus.emit('item_purchased', {
      itemId: itemId,
      type: _getItemType(itemId),
      quantity: quantity,
      totalCost: totalCost
    });
    if (window.AudioManager) window.AudioManager.playSound('purchase');

    return true;
  }

  // ===== 판매 =====

  /**
   * 아이템을 판매한다.
   * @param {string} itemId - 판매할 아이템 ID
   * @param {number} [quantity=1] - 판매 수량
   * @param {string} [quality] - 품질 등급
   * @returns {boolean} 판매 성공 여부
   */
  function sellItem(itemId, quantity, quality) {
    quantity = quantity || 1;

    // 인벤토리 확인
    if (window.InventorySystem) {
      var owned = window.InventorySystem.getItemCount(itemId);
      if (owned < quantity) {
        console.warn('[ShopSystem] 인벤토리 부족. 보유:', owned, '판매 시도:', quantity);
        return false;
      }
      // 인벤토리에서 제거
      window.InventorySystem.removeItem(itemId, quantity);
    }

    // 판매 대금 계산 및 골드 추가
    var unitPrice = getSellPrice(itemId, quality);
    var totalGold = unitPrice * quantity;
    addGold(totalGold);

    // 이벤트 발행 및 사운드 재생
    eventBus.emit('item_sold', {
      itemId: itemId,
      quantity: quantity,
      unitPrice: unitPrice,
      totalGold: totalGold
    });
    if (window.AudioManager) window.AudioManager.playSound('sell');

    return true;
  }

  // ===== 계절별 씨앗 목록 =====

  /**
   * 현재 계절에 구매 가능한 씨앗 목록을 반환한다.
   * @param {string} [season] - 계절 (기본: 현재 계절)
   * @returns {Array} 구매 가능한 작물 데이터 배열
   */
  function getAvailableSeeds(season) {
    season = season || _currentSeason;
    var available = [];
    var cropKeys = Object.keys(window.CROP_DATA);

    for (var i = 0; i < cropKeys.length; i++) {
      var crop = window.CROP_DATA[cropKeys[i]];
      // 해당 계절에 재배 가능한 작물만 포함
      if (crop.seasons && crop.seasons.indexOf(season) !== -1) {
        available.push(crop);
      }
    }

    return available;
  }

  /**
   * 계절 변경 시 상점 데이터를 갱신한다.
   */
  function refreshShop() {
    if (window.TimeSystem && window.TimeSystem.getSeason) {
      _currentSeason = window.TimeSystem.currentSeason;
    }
    console.log('[ShopSystem] 상점 갱신 완료. 현재 계절:', _currentSeason);
  }

  // ===== 모달 렌더링 =====

  /**
   * 상점 모달을 렌더링한다.
   * @param {string} [tab='buy'] - 활성 탭 ('buy' | 'sell')
   */
  function renderShopModal(tab) {
    _currentTab = tab || _currentTab || 'buy';

    // 골드 디스플레이 갱신
    _updateGoldDisplay();

    // 탭 활성 상태 갱신
    var shopTabs = document.querySelectorAll('.shop-tab');
    for (var t = 0; t < shopTabs.length; t++) {
      shopTabs[t].classList.toggle('active', shopTabs[t].getAttribute('data-shop-tab') === _currentTab);
    }

    var buyPanel = document.getElementById('shop-buy-panel');
    var sellPanel = document.getElementById('shop-sell-panel');

    if (_currentTab === 'buy') {
      if (buyPanel) buyPanel.classList.remove('hidden');
      if (sellPanel) sellPanel.classList.add('hidden');
      _renderBuyTab();
    } else {
      if (buyPanel) buyPanel.classList.add('hidden');
      if (sellPanel) sellPanel.classList.remove('hidden');
      _renderSellTab();
    }
  }

  /**
   * 구매 탭 내용을 렌더링한다.
   * @private
   */
  function _renderBuyTab() {
    // 카테고리 버튼 활성 상태 갱신
    var catButtons = document.querySelectorAll('.shop-cat');
    for (var c = 0; c < catButtons.length; c++) {
      catButtons[c].classList.toggle('active', catButtons[c].getAttribute('data-cat') === _currentCategory);
    }

    var container = document.getElementById('shop-items');
    if (!container) return;
    window.Utils.removeAllChildren(container);

    var items = _getItemsForCategory(_currentCategory);

    if (items.length === 0) {
      var emptyMsg = window.Utils.createElement('div', 'shop-empty', container);
      emptyMsg.textContent = '이 카테고리에 판매 중인 상품이 없습니다.';
      return;
    }

    for (var i = 0; i < items.length; i++) {
      _createBuyCard(container, items[i]);
    }
  }

  /**
   * 구매 카드 요소를 생성한다.
   * @private
   * @param {HTMLElement} container - 부모 컨테이너
   * @param {Object} item - 아이템 데이터
   */
  function _createBuyCard(container, item) {
    var price = getBuyPrice(item.id);
    var canAfford = _gold >= price;

    var card = window.Utils.createElement('div', 'shop-item-card' + (canAfford ? '' : ' disabled'), container);

    // 이모지 아이콘
    var emoji = window.Utils.createElement('div', 'shop-item-emoji', card);
    emoji.textContent = item.emoji || '📦';

    // 아이템 이름
    var name = window.Utils.createElement('div', 'shop-item-name', card);
    name.textContent = item.name;

    // 설명 (있으면 표시)
    if (item.description) {
      var desc = window.Utils.createElement('div', 'shop-item-desc', card);
      desc.textContent = item.description;
    }

    // 가격 표시
    var priceEl = window.Utils.createElement('div', 'shop-item-price', card);
    priceEl.textContent = '💰 ' + window.Utils.formatNumber(price) + 'G';

    // 계절 할인 표시 (씨앗의 경우)
    if (item.seedPrice && item.seasons && item.seasons.indexOf(_currentSeason) !== -1) {
      var discount = window.Utils.createElement('span', 'shop-discount', priceEl);
      discount.textContent = ' (-10%)';
    }

    // 구매 버튼
    var buyBtn = window.Utils.createElement('button', 'pixel-btn btn-primary shop-buy-btn', card);
    buyBtn.textContent = '구매';
    buyBtn.disabled = !canAfford;

    // 구매 이벤트 바인딩 (클로저로 item.id 캡처)
    (function (itemId) {
      buyBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (buyItem(itemId, 1)) {
          renderShopModal(_currentTab); // 구매 후 모달 갱신
        }
      });
    })(item.id);
  }

  /**
   * 판매 탭 내용을 렌더링한다.
   * @private
   */
  function _renderSellTab() {
    var container = document.getElementById('sell-items');
    if (!container) return;
    window.Utils.removeAllChildren(container);

    var sellableItems = _getSellableItems();

    if (sellableItems.length === 0) {
      var emptyMsg = window.Utils.createElement('div', 'shop-empty', container);
      emptyMsg.textContent = '판매할 수 있는 아이템이 없습니다.';
      return;
    }

    for (var i = 0; i < sellableItems.length; i++) {
      _createSellCard(container, sellableItems[i]);
    }
  }

  /**
   * 판매 카드 요소를 생성한다.
   * @private
   * @param {HTMLElement} container - 부모 컨테이너
   * @param {Object} item - { id, name, emoji, quantity, sellPrice }
   */
  function _createSellCard(container, item) {
    var card = window.Utils.createElement('div', 'shop-item-card', container);

    // 이모지 아이콘
    var emoji = window.Utils.createElement('div', 'shop-item-emoji', card);
    emoji.textContent = item.emoji || '📦';

    // 아이템 이름 + 수량
    var name = window.Utils.createElement('div', 'shop-item-name', card);
    name.textContent = item.name + ' (x' + item.quantity + ')';

    // 판매 가격
    var priceEl = window.Utils.createElement('div', 'shop-item-price', card);
    priceEl.textContent = '💰 ' + window.Utils.formatNumber(item.sellPrice) + 'G / 개';

    // 버튼 컨테이너
    var btnGroup = window.Utils.createElement('div', 'shop-btn-group', card);

    // 1개 판매 버튼
    var sellOneBtn = window.Utils.createElement('button', 'pixel-btn btn-secondary shop-sell-btn', btnGroup);
    sellOneBtn.textContent = '1개 판매';

    // 전체 판매 버튼
    var sellAllBtn = window.Utils.createElement('button', 'pixel-btn btn-primary shop-sell-btn', btnGroup);
    sellAllBtn.textContent = '전체 판매';

    // 판매 이벤트 바인딩
    (function (itemId, qty) {
      sellOneBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sellItem(itemId, 1)) {
          renderShopModal(_currentTab);
        }
      });
      sellAllBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sellItem(itemId, qty)) {
          renderShopModal(_currentTab);
        }
      });
    })(item.id, item.quantity);
  }

  // ===== 내부 헬퍼 함수 =====

  /**
   * 카테고리별 구매 가능 아이템 목록을 반환한다.
   * @private
   * @param {string} category - 카테고리 ('seeds', 'animals', 'tools', 'decorations')
   * @returns {Array} 아이템 데이터 배열
   */
  function _getItemsForCategory(category) {
    var items = [];

    switch (category) {
      case 'seeds':
        // 현재 계절에 맞는 씨앗 + 사계절 씨앗
        var cropKeys = Object.keys(window.CROP_DATA);
        for (var i = 0; i < cropKeys.length; i++) {
          var crop = window.CROP_DATA[cropKeys[i]];
          if (crop.seasons && crop.seasons.indexOf(_currentSeason) !== -1) {
            items.push({
              id: crop.id,
              name: crop.name + ' 씨앗',
              emoji: crop.emoji,
              description: crop.description,
              seedPrice: crop.seedPrice,
              seasons: crop.seasons
            });
          }
        }
        break;

      case 'animals':
        var animalKeys = Object.keys(window.ANIMAL_DATA);
        for (var a = 0; a < animalKeys.length; a++) {
          var animal = window.ANIMAL_DATA[animalKeys[a]];
          items.push({
            id: animal.id,
            name: animal.name,
            emoji: animal.emoji,
            description: animal.description
          });
        }
        break;

      case 'tools':
        // ITEM_DATA에서 도구 카테고리 아이템 추출
        if (window.ITEM_DATA) {
          var itemKeys = Object.keys(window.ITEM_DATA);
          for (var t = 0; t < itemKeys.length; t++) {
            var itemData = window.ITEM_DATA[itemKeys[t]];
            if (itemData.type === 'tool' && itemData.buyPrice) {
              items.push({
                id: itemData.id,
                name: itemData.name,
                emoji: itemData.emoji || '🔧',
                description: itemData.description
              });
            }
          }
        }
        break;

      case 'decorations':
        // DECORATION_DATA에서 장식품 추출
        if (window.DECORATION_DATA) {
          var decorKeys = Object.keys(window.DECORATION_DATA);
          for (var d = 0; d < decorKeys.length; d++) {
            var decor = window.DECORATION_DATA[decorKeys[d]];
            items.push({
              id: decor.id,
              name: decor.name,
              emoji: decor.emoji || '🏠',
              description: decor.description
            });
          }
        }
        break;
    }

    return items;
  }

  /**
   * 인벤토리에서 판매 가능한 아이템 목록을 반환한다.
   * @private
   * @returns {Array} 판매 가능 아이템 배열 [{id, name, emoji, quantity, sellPrice}]
   */
  function _getSellableItems() {
    var sellable = [];

    if (!window.InventorySystem || !window.InventorySystem.getItems) {
      return sellable;
    }

    var allItems = window.InventorySystem.getItems();

    for (var i = 0; i < allItems.length; i++) {
      var item = allItems[i];
      var price = getSellPrice(item.id);

      // 판매 가격이 0보다 큰 아이템만 판매 가능
      if (price > 0 && item.quantity > 0) {
        sellable.push({
          id: item.id,
          name: item.name || item.id,
          emoji: item.emoji || '📦',
          quantity: item.quantity,
          sellPrice: price
        });
      }
    }

    return sellable;
  }

  /**
   * 아이템 타입을 판별한다.
   * @private
   * @param {string} itemId - 아이템 ID
   * @returns {string} 아이템 타입
   */
  function _getItemType(itemId) {
    if (window.CROP_DATA[itemId]) return 'seed';
    if (window.ANIMAL_DATA[itemId]) return 'animal';
    if (window.DECORATION_DATA && window.DECORATION_DATA[itemId]) return 'decoration';
    if (window.ITEM_DATA && window.ITEM_DATA[itemId]) return window.ITEM_DATA[itemId].category || 'item';
    return 'item';
  }

  /**
   * 골드 표시를 갱신한다.
   * @private
   */
  function _updateGoldDisplay() {
    // HUD 골드 표시
    var hudGold = document.getElementById('display-gold');
    if (hudGold) {
      hudGold.textContent = window.Utils.formatNumber(_gold);
    }

    // 상점 모달 골드 표시
    var shopGold = document.getElementById('shop-gold-display');
    if (shopGold) {
      shopGold.textContent = window.Utils.formatNumber(_gold);
    }
  }

  /**
   * 계절 변경 이벤트 핸들러.
   * @private
   * @param {Object} data - { season }
   */
  function _onSeasonChanged(data) {
    if (data && data.season) {
      _currentSeason = data.season;
    }
    refreshShop();
  }

  // ===== 저장/불러오기 =====

  /**
   * 현재 상태를 반환한다 (저장용).
   * @returns {Object} 저장 상태
   */
  function getState() {
    return {
      gold: _gold,
      currentSeason: _currentSeason
    };
  }

  /**
   * 저장된 상태를 불러온다.
   * @param {Object} state - 저장된 상태
   */
  function loadState(state) {
    if (!state) return;
    if (typeof state.gold === 'number') {
      _gold = state.gold;
    }
    if (state.currentSeason) {
      _currentSeason = state.currentSeason;
    }
    _updateGoldDisplay();
  }

   // ===== 공개 API =====

   return {
     /** 보유 골드 (읽기 전용으로 사용 권장, 변경 시 addGold/removeGold 사용) */
     get gold() { return _gold; },
     set gold(val) { _gold = val; _updateGoldDisplay(); },

     init: init,
     cleanup: cleanup,
     addGold: addGold,
     removeGold: removeGold,
     getBuyPrice: getBuyPrice,
     getSellPrice: getSellPrice,
     buyItem: buyItem,
     sellItem: sellItem,
     getAvailableSeeds: getAvailableSeeds,
     refreshShop: refreshShop,
     renderShopModal: renderShopModal,
     getState: getState,
     loadState: loadState,

    /** 현재 구매 카테고리를 변경하고 모달을 갱신한다. */
    setCategory: function (category) {
      _currentCategory = category;
      renderShopModal(_currentTab);
    },

    /** 현재 탭을 변경하고 모달을 갱신한다. */
    setTab: function (tab) {
      _currentTab = tab;
      renderShopModal(tab);
    }
  };
})();
