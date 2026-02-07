/**
 * WooFarm - 인벤토리 시스템 (Inventory System)
 * 아이템 보관, 씨앗 관리, 인벤토리 UI를 처리합니다.
 */
(function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  /** 인벤토리 최대 슬롯 수 */
  var MAX_SLOTS = 30;

  /** 기본 최대 스택 수량 (아이템 데이터에 명시되지 않은 경우) */
  var DEFAULT_MAX_STACK = 99;

  window.InventorySystem = {
    // ── 상수 ──────────────────────────────────────────
    MAX_SLOTS: MAX_SLOTS,

    // ── 상태 ──────────────────────────────────────────
    /** @type {Array<{id: string, itemId: string, quantity: number}>} */
    items: [],

    /** @type {string|null} 현재 선택된 씨앗 ID */
    _selectedSeed: null,

    /** @private 슬롯 ID 카운터 */
    _nextSlotId: 1,

    // ── 초기화 ────────────────────────────────────────

    /**
     * 인벤토리 시스템을 초기화합니다.
     */
    init: function () {
      this.items = [];
      this._selectedSeed = null;
      this._nextSlotId = 1;
      this._bindEvents();
      console.log('[InventorySystem] 초기화 완료 (최대 ' + MAX_SLOTS + '슬롯)');
    },

    // ── 아이템 추가/제거 ─────────────────────────────

    /**
     * 인벤토리에 아이템을 추가합니다.
     * @param {string} itemId - 아이템 ID
     * @param {number} [quantity=1] - 추가할 수량
     * @returns {boolean} 성공 여부 (공간 부족 시 false)
     */
    addItem: function (itemId, quantity) {
      quantity = quantity || 1;
      if (quantity <= 0) return false;

      var itemData = this._getItemData(itemId);
      var stackable = itemData ? (itemData.stackable !== false) : true;
      var maxStack = itemData ? (itemData.maxStack || DEFAULT_MAX_STACK) : DEFAULT_MAX_STACK;

      var remaining = quantity;

      // 스택 가능한 아이템: 기존 슬롯에 먼저 채우기
      if (stackable) {
        for (var i = 0; i < this.items.length && remaining > 0; i++) {
          if (this.items[i].itemId === itemId) {
            var canAdd = maxStack - this.items[i].quantity;
            if (canAdd > 0) {
              var toAdd = Math.min(remaining, canAdd);
              this.items[i].quantity += toAdd;
              remaining -= toAdd;
            }
          }
        }
      }

      // 남은 수량은 새 슬롯에 배치
      while (remaining > 0) {
        if (this.items.length >= MAX_SLOTS) {
          console.warn('[InventorySystem] 인벤토리가 가득 찼습니다 (남은 수량: ' + remaining + ')');
          // 일부만 추가된 경우에도 변경 알림
          if (remaining < quantity) {
            eventBus.emit('inventory_changed', { items: this.getItems() });
          }
          return false;
        }

        var slotQuantity = stackable ? Math.min(remaining, maxStack) : 1;
        this.items.push({
          id: 'slot_' + this._nextSlotId++,
          itemId: itemId,
          quantity: slotQuantity
        });
        remaining -= slotQuantity;
      }

      eventBus.emit('inventory_changed', { items: this.getItems() });
      console.log('[InventorySystem] 아이템 추가: ' + itemId + ' x' + quantity);
      return true;
    },

    /**
     * 인벤토리에서 아이템을 제거합니다.
     * @param {string} itemId - 아이템 ID
     * @param {number} [quantity=1] - 제거할 수량
     * @returns {boolean} 성공 여부 (수량 부족 시 false)
     */
    removeItem: function (itemId, quantity) {
      quantity = quantity || 1;
      if (quantity <= 0) return false;

      // 충분한 수량이 있는지 먼저 확인
      if (!this.hasItem(itemId, quantity)) {
        console.warn('[InventorySystem] 아이템 부족: ' + itemId + ' (필요: ' + quantity + ', 보유: ' + this.getItemCount(itemId) + ')');
        return false;
      }

      var remaining = quantity;

      // 뒤에서부터 제거 (가장 최근에 추가된 것부터)
      for (var i = this.items.length - 1; i >= 0 && remaining > 0; i--) {
        if (this.items[i].itemId === itemId) {
          if (this.items[i].quantity <= remaining) {
            remaining -= this.items[i].quantity;
            this.items.splice(i, 1);
          } else {
            this.items[i].quantity -= remaining;
            remaining = 0;
          }
        }
      }

      eventBus.emit('inventory_changed', { items: this.getItems() });
      console.log('[InventorySystem] 아이템 제거: ' + itemId + ' x' + quantity);
      return true;
    },

    // ── 조회 메서드 ───────────────────────────────────

    /**
     * 특정 아이템을 충분히 보유 중인지 확인합니다.
     * @param {string} itemId
     * @param {number} [quantity=1]
     * @returns {boolean}
     */
    hasItem: function (itemId, quantity) {
      quantity = quantity || 1;
      return this.getItemCount(itemId) >= quantity;
    },

    /**
     * 특정 아이템의 총 보유 수량을 반환합니다.
     * @param {string} itemId
     * @returns {number}
     */
    getItemCount: function (itemId) {
      var total = 0;
      for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].itemId === itemId) {
          total += this.items[i].quantity;
        }
      }
      return total;
    },

    /**
     * 모든 아이템 배열의 복사본을 반환합니다.
     * @returns {Array<{id: string, itemId: string, quantity: number}>}
     */
    getItems: function () {
      return this.items.map(function (item) {
        return { id: item.id, itemId: item.itemId, quantity: item.quantity };
      });
    },

    /**
     * 특정 타입의 아이템만 필터링하여 반환합니다.
     * @param {string} type - 아이템 타입 (예: 'seed', 'crop', 'tool')
     * @returns {Array<{id: string, itemId: string, quantity: number}>}
     */
    getItemsByType: function (type) {
      var self = this;
      return this.items.filter(function (item) {
        var data = self._getItemData(item.itemId);
        return data && data.type === type;
      }).map(function (item) {
        return { id: item.id, itemId: item.itemId, quantity: item.quantity };
      });
    },

    /**
     * 현재 계절에 심을 수 있는 씨앗 목록을 반환합니다.
     * @param {string} season - 현재 계절
     * @returns {Array<{id: string, itemId: string, quantity: number, cropData: object}>}
     */
    getSeedsForSeason: function (season) {
      var seeds = this.getItemsByType('seed');
      var result = [];

      for (var i = 0; i < seeds.length; i++) {
        var seed = seeds[i];
        // 씨앗 ID에서 작물 ID 추출
        var cropId = seed.itemId.replace('_seed', '');
        var cropData = window.CROP_DATA ? window.CROP_DATA[cropId] : null;

        // 계절 제한 확인
        if (cropData && cropData.seasons && cropData.seasons.indexOf(season) !== -1) {
          result.push({
            id: seed.id,
            itemId: seed.itemId,
            quantity: seed.quantity,
            cropId: cropId,
            cropData: cropData
          });
        }
      }

      return result;
    },

    /**
     * 사용 중인 슬롯 수를 반환합니다.
     * @returns {number}
     */
    getSlotCount: function () {
      return this.items.length;
    },

    /**
     * 인벤토리가 가득 찼는지 확인합니다.
     * @returns {boolean}
     */
    isFull: function () {
      return this.items.length >= MAX_SLOTS;
    },

    /**
     * 인벤토리를 비웁니다.
     */
    clear: function () {
      this.items = [];
      this._selectedSeed = null;
      eventBus.emit('inventory_changed', { items: [] });
      console.log('[InventorySystem] 인벤토리 초기화');
    },

    // ── 씨앗 선택 ─────────────────────────────────────

    /**
     * 현재 선택된 씨앗 ID를 반환합니다.
     * @returns {string|null}
     */
    getSelectedSeed: function () {
      return this._selectedSeed;
    },

    /**
     * 심을 씨앗을 선택합니다.
     * @param {string|null} seedId - 씨앗 아이템 ID (null이면 선택 해제)
     */
    setSelectedSeed: function (seedId) {
      this._selectedSeed = seedId;
      eventBus.emit('seed_selected', { seedId: seedId });
      console.log('[InventorySystem] 씨앗 선택: ' + (seedId || '없음'));
    },

    // ── 저장/불러오기 ────────────────────────────────

    /**
     * 직렬화 가능한 인벤토리 상태를 반환합니다.
     * @returns {object}
     */
    getState: function () {
      return {
        items: this.items.map(function (item) {
          return { id: item.id, itemId: item.itemId, quantity: item.quantity };
        }),
        nextSlotId: this._nextSlotId
      };
    },

    /**
     * 저장된 상태에서 인벤토리를 복원합니다.
     * @param {object} state
     */
    loadState: function (state) {
      if (!state) return;

      if (Array.isArray(state.items)) {
        this.items = state.items.map(function (item) {
          return {
            id: item.id || ('slot_' + Math.random().toString(36).substr(2, 6)),
            itemId: item.itemId,
            quantity: item.quantity || 1
          };
        });
      }

      if (state.nextSlotId) {
        this._nextSlotId = state.nextSlotId;
      }

      this._selectedSeed = null;
      eventBus.emit('inventory_changed', { items: this.getItems() });
      console.log('[InventorySystem] 상태 복원 완료 (' + this.items.length + '개 슬롯)');
    },

    // ── UI 렌더링 ─────────────────────────────────────

    /**
     * 인벤토리 모달을 렌더링합니다.
     * #inventory-grid 요소에 아이템 슬롯을 채웁니다.
     */
    renderInventoryModal: function () {
      var container = document.getElementById('inventory-grid');
      if (!container) {
        console.warn('[InventorySystem] #inventory-grid 요소를 찾을 수 없습니다');
        return;
      }

      var self = this;
      container.innerHTML = '';

      // 아이템이 있는 슬롯 렌더링
      for (var i = 0; i < this.items.length; i++) {
        var slotEl = this._createItemSlotElement(this.items[i], i);
        container.appendChild(slotEl);
      }

      // 빈 슬롯 렌더링 (최대 슬롯까지)
      for (var j = this.items.length; j < MAX_SLOTS; j++) {
        var emptySlot = document.createElement('div');
        emptySlot.className = 'inventory-slot inventory-slot-empty';
        container.appendChild(emptySlot);
      }
    },

    /**
     * 현재 계절에 심을 수 있는 씨앗 패널을 렌더링합니다.
     * #seed-list 요소에 씨앗 목록을 채웁니다.
     * @param {string} season - 현재 계절
     */
    renderSeedPanel: function (season) {
      var container = document.getElementById('seed-list');
      if (!container) {
        console.warn('[InventorySystem] #seed-list 요소를 찾을 수 없습니다');
        return;
      }

      var self = this;
      container.innerHTML = '';

      var seeds = this.getSeedsForSeason(season);

      if (seeds.length === 0) {
        var emptyMsg = document.createElement('div');
        emptyMsg.className = 'seed-list-empty';
        emptyMsg.textContent = '심을 수 있는 씨앗이 없습니다';
        container.appendChild(emptyMsg);
        return;
      }

      for (var i = 0; i < seeds.length; i++) {
        var seedEl = this._createSeedElement(seeds[i]);
        container.appendChild(seedEl);
      }
    },

    // ── 내부 헬퍼 ────────────────────────────────────

    /**
     * @private 이벤트 리스너를 바인딩합니다.
     */
    _bindEvents: function () {
      var self = this;

      // 수확 시 자동으로 인벤토리에 추가
      eventBus.on('crop_harvested', function (data) {
        if (data && data.itemId) {
          var added = self.addItem(data.itemId, data.quantity || 1);
          if (!added) {
            console.warn('[InventorySystem] 인벤토리가 가득 차서 수확물을 보관할 수 없습니다');
          }
        }
      });
    },

    /**
     * @private 아이템 데이터를 조회합니다.
     * @param {string} itemId
     * @returns {object|null}
     */
    _getItemData: function (itemId) {
      if (window.ITEM_DATA && window.ITEM_DATA[itemId]) {
        return window.ITEM_DATA[itemId];
      }
      return null;
    },

    /**
     * @private 아이템 슬롯 DOM 요소를 생성합니다.
     * @param {object} item - 아이템 데이터
     * @param {number} index - 슬롯 인덱스
     * @returns {HTMLElement}
     */
    _createItemSlotElement: function (item, index) {
      var self = this;
      var data = this._getItemData(item.itemId);
      var emoji = data ? (data.emoji || '\uD83D\uDCE6') : '\uD83D\uDCE6'; // 📦 기본
      var name = data ? (data.name || item.itemId) : item.itemId;

      var slotEl = document.createElement('div');
      slotEl.className = 'inventory-slot';
      slotEl.setAttribute('data-item-id', item.itemId);
      slotEl.setAttribute('data-slot-index', index);
      slotEl.title = name;

      // 이모지
      var emojiEl = document.createElement('span');
      emojiEl.className = 'slot-emoji';
      emojiEl.textContent = emoji;
      slotEl.appendChild(emojiEl);

      // 수량 뱃지 (1 초과일 때만 표시)
      if (item.quantity > 1) {
        var badge = document.createElement('span');
        badge.className = 'slot-quantity';
        badge.textContent = item.quantity;
        slotEl.appendChild(badge);
      }

      // 클릭 → 아이템 정보 표시
      slotEl.addEventListener('click', function () {
        self._showItemInfo(item.itemId, item.quantity);
      });

      return slotEl;
    },

    /**
     * @private 씨앗 선택 DOM 요소를 생성합니다.
     * @param {object} seed - 씨앗 정보 객체
     * @returns {HTMLElement}
     */
    _createSeedElement: function (seed) {
      var self = this;
      var data = this._getItemData(seed.itemId);
      var emoji = data ? (data.emoji || '\uD83C\uDF31') : '\uD83C\uDF31'; // 🌱 기본
      var name = data ? (data.name || seed.itemId) : seed.itemId;
      var cropData = seed.cropData;

      var el = document.createElement('div');
      el.className = 'seed-item';
      if (this._selectedSeed === seed.itemId) {
        el.classList.add('seed-selected');
      }

      // 이모지
      var emojiEl = document.createElement('span');
      emojiEl.className = 'seed-emoji';
      emojiEl.textContent = emoji;
      el.appendChild(emojiEl);

      // 이름 + 수량
      var infoEl = document.createElement('div');
      infoEl.className = 'seed-info';

      var nameEl = document.createElement('span');
      nameEl.className = 'seed-name';
      nameEl.textContent = name;
      infoEl.appendChild(nameEl);

      var qtyEl = document.createElement('span');
      qtyEl.className = 'seed-quantity';
      qtyEl.textContent = 'x' + seed.quantity;
      infoEl.appendChild(qtyEl);

      // 성장 시간 표시
      if (cropData && cropData.growthTime) {
        var timeEl = document.createElement('span');
        timeEl.className = 'seed-growth-time';
        timeEl.textContent = '성장: ' + cropData.growthTime + '시간';
        infoEl.appendChild(timeEl);
      }

      el.appendChild(infoEl);

      // 클릭 → 씨앗 선택
      el.addEventListener('click', function () {
        self.setSelectedSeed(seed.itemId);
        // 선택 상태 UI 갱신
        var allSeeds = document.querySelectorAll('.seed-item');
        for (var j = 0; j < allSeeds.length; j++) {
          allSeeds[j].classList.remove('selected');
        }
        el.classList.add('selected');
      });

      return el;
    },

    /**
     * @private 아이템 정보를 표시합니다.
     * @param {string} itemId
     * @param {number} quantity
     */
    _showItemInfo: function (itemId, quantity) {
      var data = this._getItemData(itemId);
      if (!data) {
        console.log('[InventorySystem] 아이템 정보 없음: ' + itemId);
        return;
      }

      var infoPanel = document.getElementById('item-info');
      if (!infoPanel) return;

      var emoji = data.emoji || '\uD83D\uDCE6';
      var name = data.name || itemId;
      var desc = data.description || '';
      var type = data.type || '';

      infoPanel.innerHTML = '';
      infoPanel.style.display = 'block';

      // 이모지 + 이름
      var header = document.createElement('div');
      header.className = 'item-info-header';
      header.textContent = emoji + ' ' + name;
      infoPanel.appendChild(header);

      // 수량
      var qtyEl = document.createElement('div');
      qtyEl.className = 'item-info-quantity';
      qtyEl.textContent = '보유: ' + quantity + '개';
      infoPanel.appendChild(qtyEl);

      // 타입
      if (type) {
        var typeEl = document.createElement('div');
        typeEl.className = 'item-info-type';
        typeEl.textContent = '종류: ' + this._getTypeNameKR(type);
        infoPanel.appendChild(typeEl);
      }

      // 설명
      if (desc) {
        var descEl = document.createElement('div');
        descEl.className = 'item-info-desc';
        descEl.textContent = desc;
        infoPanel.appendChild(descEl);
      }

      // 판매 가격
      if (data.sellPrice) {
        var priceEl = document.createElement('div');
        priceEl.className = 'item-info-price';
        priceEl.textContent = '판매가: ' + data.sellPrice + 'G';
        infoPanel.appendChild(priceEl);
      }
    },

    /**
     * @private 아이템 타입의 한국어 이름을 반환합니다.
     * @param {string} type
     * @returns {string}
     */
    _getTypeNameKR: function (type) {
      var names = {
        seed: '씨앗',
        crop: '작물',
        tool: '도구',
        material: '재료',
        food: '음식',
        decoration: '장식',
        quest: '퀘스트 아이템',
        animal_product: '축산물'
      };
      return names[type] || type;
    }
  };

  console.log('[InventorySystem] 모듈 로드 완료');
})();
