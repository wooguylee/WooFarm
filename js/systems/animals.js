/**
 * WooFarm - 동물 관리 시스템
 * 동물 소유, 먹이 주기, 생산품 수집, 행복도 관리 등을 담당한다.
 */
window.AnimalSystem = (function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  // ===== 상수 =====

  /** @type {number} 최대 보유 가능 동물 수 */
  var MAX_ANIMALS = 12;

  // ===== 내부 상태 =====

  /** @type {Array<Object>} 소유 동물 인스턴스 목록 */
  var _ownedAnimals = [];

  // ===== 초기화 =====

  /**
   * 동물 시스템을 초기화한다.
   * 이벤트 리스너를 등록한다.
   */
  function init() {
    // 하루 시작 시 일일 업데이트 수행
    eventBus.on('day_start', dailyUpdate);

    // 아이템 구매 이벤트 감시 (동물 구매 자동 처리는 ShopSystem에서 수행)
    eventBus.on('item_purchased', _onItemPurchased);

    console.log('[AnimalSystem] 초기화 완료.');
  }

  // ===== 동물 추가/제거 =====

  /**
   * 새 동물을 추가한다.
   * @param {string} typeId - ANIMAL_DATA의 동물 타입 ID
   * @returns {Object|null} 생성된 동물 인스턴스 또는 null (한도 초과 시)
   */
  function addAnimal(typeId) {
    if (_ownedAnimals.length >= MAX_ANIMALS) {
      console.warn('[AnimalSystem] 동물 수용 한도 초과:', MAX_ANIMALS);
      return null;
    }

    var data = window.ANIMAL_DATA[typeId];
    if (!data) {
      console.warn('[AnimalSystem] 알 수 없는 동물 타입:', typeId);
      return null;
    }

    // 새 동물 인스턴스 생성
    var animal = {
      id: window.Utils.generateId(),
      typeId: typeId,
      name: data.name,                 // 기본 이름 (유저가 변경 가능)
      happiness: 100,                  // 초기 행복도 최대
      fed: false,                      // 오늘 먹이 여부
      daysSinceProduct: 0,             // 마지막 생산 이후 경과 일수
      productReady: false,             // 생산품 수집 가능 여부
      daysOwned: 0                     // 소유 일수
    };

    _ownedAnimals.push(animal);

    eventBus.emit('animal_added', {
      id: animal.id,
      typeId: typeId,
      name: animal.name
    });

    console.log('[AnimalSystem] 동물 추가:', animal.name, '(' + typeId + ')');
    return animal;
  }

  /**
   * 동물을 제거한다.
   * @param {string} id - 동물 인스턴스 고유 ID
   * @returns {boolean} 제거 성공 여부
   */
  function removeAnimal(id) {
    var index = _findAnimalIndex(id);
    if (index === -1) return false;

    var removed = _ownedAnimals.splice(index, 1)[0];
    eventBus.emit('animal_removed', {
      id: removed.id,
      typeId: removed.typeId,
      name: removed.name
    });

    console.log('[AnimalSystem] 동물 제거:', removed.name);
    return true;
  }

  // ===== 먹이 주기 =====

  /**
   * 특정 동물에게 먹이를 준다.
   * 먹이 비용은 골드에서 차감된다.
   * @param {string} id - 동물 인스턴스 고유 ID
   * @returns {boolean} 먹이 주기 성공 여부
   */
  function feedAnimal(id) {
    var animal = _findAnimal(id);
    if (!animal) return false;

    // 이미 오늘 먹이를 줬으면 무시
    if (animal.fed) {
      console.log('[AnimalSystem] 이미 먹이를 준 동물:', animal.name);
      return false;
    }

    var data = window.ANIMAL_DATA[animal.typeId];
    if (!data) return false;

    // 먹이 비용 확인 및 차감
    var feedCost = data.feedCost;
    if (window.ShopSystem && window.ShopSystem.gold < feedCost) {
      console.warn('[AnimalSystem] 먹이 비용 부족. 필요:', feedCost);
      return false;
    }

    if (window.ShopSystem) {
      window.ShopSystem.removeGold(feedCost);
    }

    // 먹이 상태 업데이트
    animal.fed = true;
    animal.happiness = Math.min(animal.happiness + 10, data.maxHappiness || 100);

    eventBus.emit('animal_fed', {
      id: animal.id,
      typeId: animal.typeId,
      name: animal.name,
      happiness: animal.happiness,
      cost: feedCost
    });

    if (window.AudioManager) window.AudioManager.play('animal_happy');

    return true;
  }

  /**
   * 모든 동물에게 먹이를 준다.
   * @returns {number} 총 소모된 골드
   */
  function feedAll() {
    var totalCost = 0;

    for (var i = 0; i < _ownedAnimals.length; i++) {
      var animal = _ownedAnimals[i];
      if (!animal.fed) {
        var data = window.ANIMAL_DATA[animal.typeId];
        if (data) {
          // 골드가 충분한지 확인 후 먹이 주기
          if (window.ShopSystem && window.ShopSystem.gold >= data.feedCost) {
            if (feedAnimal(animal.id)) {
              totalCost += data.feedCost;
            }
          }
        }
      }
    }

    return totalCost;
  }

  // ===== 생산품 수집 =====

  /**
   * 특정 동물의 생산품을 수집한다.
   * @param {string} id - 동물 인스턴스 고유 ID
   * @returns {Object|null} 수집된 생산품 정보 또는 null
   */
  function collectProduct(id) {
    var animal = _findAnimal(id);
    if (!animal) return null;

    if (!animal.productReady) {
      console.log('[AnimalSystem] 생산품이 아직 준비되지 않음:', animal.name);
      return null;
    }

    var data = window.ANIMAL_DATA[animal.typeId];
    if (!data || !data.product) return null;

    // 행복도에 따른 품질 결정
    var quality = _getProductQuality(animal.happiness);

    // 생산품 정보
    var product = {
      itemId: animal.typeId + '_product',
      name: data.product.name,
      emoji: data.product.emoji,
      quality: quality,
      animalName: animal.name
    };

    // 인벤토리에 생산품 추가
    if (window.InventorySystem) {
      window.InventorySystem.addItem(product.itemId, 1, {
        name: data.product.name,
        emoji: data.product.emoji,
        quality: quality,
        sellPrice: data.product.sellPrice
      });
    }

    // 생산 상태 초기화
    animal.daysSinceProduct = 0;
    animal.productReady = false;

    eventBus.emit('product_collected', {
      id: animal.id,
      typeId: animal.typeId,
      product: product
    });

    if (window.AudioManager) window.AudioManager.play('collect');

    return product;
  }

  /**
   * 모든 준비된 동물의 생산품을 일괄 수집한다.
   * @returns {Array} 수집된 생산품 배열
   */
  function collectAll() {
    var collected = [];

    for (var i = 0; i < _ownedAnimals.length; i++) {
      if (_ownedAnimals[i].productReady) {
        var product = collectProduct(_ownedAnimals[i].id);
        if (product) {
          collected.push(product);
        }
      }
    }

    return collected;
  }

  // ===== 일일 업데이트 =====

  /**
   * 하루 시작 시 호출되는 일일 업데이트 로직.
   * 행복도 감소, 생산 주기 진행, 먹이 상태 리셋을 처리한다.
   */
  function dailyUpdate() {
    for (var i = 0; i < _ownedAnimals.length; i++) {
      var animal = _ownedAnimals[i];
      var data = window.ANIMAL_DATA[animal.typeId];
      if (!data) continue;

      // 소유 일수 증가
      animal.daysOwned++;

      // 전날 먹이를 주지 않았으면 행복도 감소
      if (!animal.fed) {
        var decay = data.happinessDecay || 5;
        animal.happiness = Math.max(0, animal.happiness - decay);
      }

      // 먹이를 줬으면 생산 주기 진행
      if (animal.fed) {
        animal.daysSinceProduct++;
      }

      // 생산품 준비 확인
      var interval = data.product ? data.product.productionInterval : 999;
      if (animal.daysSinceProduct >= interval && animal.happiness > 30) {
        animal.productReady = true;
      }

      // 새 날을 위해 먹이 상태 리셋
      animal.fed = false;
    }

    // 동물 영역 렌더링 갱신
    renderAnimalArea();
  }

  // ===== 품질 판정 =====

  /**
   * 행복도에 따른 생산품 품질을 반환한다.
   * @private
   * @param {number} happiness - 행복도 (0-100)
   * @returns {string} 품질 등급 ('gold', 'silver', 'bronze')
   */
  function _getProductQuality(happiness) {
    if (happiness > 80) return 'gold';
    if (happiness > 50) return 'silver';
    return 'bronze';
  }

  // ===== 조회 =====

  /**
   * 특정 동물의 상세 정보 문자열을 반환한다.
   * @param {string} id - 동물 인스턴스 고유 ID
   * @returns {string} 동물 상세 정보
   */
  function getAnimalInfo(id) {
    var animal = _findAnimal(id);
    if (!animal) return '동물을 찾을 수 없습니다.';

    var data = window.ANIMAL_DATA[animal.typeId];
    if (!data) return '알 수 없는 동물 타입입니다.';

    var quality = _getProductQuality(animal.happiness);
    var qualityLabel = quality === 'gold' ? '⭐ 금성' : quality === 'silver' ? '✨ 은성' : '🔸 동성';

    var info = '';
    info += data.emoji + ' ' + animal.name + '\n';
    info += '종류: ' + data.name + '\n';
    info += '행복도: ' + animal.happiness + '/' + (data.maxHappiness || 100) + '\n';
    info += '먹이 상태: ' + (animal.fed ? '✅ 급여 완료' : '❌ 아직 안 줌') + '\n';
    info += '생산품: ' + (data.product ? data.product.emoji + ' ' + data.product.name : '없음') + '\n';
    info += '생산 품질: ' + qualityLabel + '\n';
    info += '생산 준비: ' + (animal.productReady ? '✅ 수집 가능!' : animal.daysSinceProduct + '/' + (data.product ? data.product.productionInterval : '-') + '일') + '\n';
    info += '소유 일수: ' + animal.daysOwned + '일';

    return info;
  }

  /**
   * 모든 소유 동물 목록을 반환한다.
   * @returns {Array<Object>} 동물 인스턴스 배열 (복사본)
   */
  function getOwnedAnimals() {
    return _ownedAnimals.slice();
  }

  /**
   * 소유 동물 수를 반환한다.
   * @returns {number}
   */
  function getAnimalCount() {
    return _ownedAnimals.length;
  }

  /**
   * 동물을 추가할 수 있는지 확인한다.
   * @returns {boolean}
   */
  function canAddAnimal() {
    return _ownedAnimals.length < MAX_ANIMALS;
  }

  /**
   * 소유 중인 고유 동물 타입 ID 세트를 반환한다.
   * @returns {Array<string>} 고유 typeId 배열
   */
  function getUniqueAnimalTypes() {
    var types = {};
    for (var i = 0; i < _ownedAnimals.length; i++) {
      types[_ownedAnimals[i].typeId] = true;
    }
    return Object.keys(types);
  }

  // ===== 모달 렌더링 =====

  /**
   * 동물 관리 모달을 렌더링한다.
   * 왼쪽에 동물 목록, 오른쪽에 선택된 동물 상세 정보를 표시한다.
   */
  function renderAnimalModal() {
    var listEl = document.getElementById('animal-list');
    var detailEl = document.getElementById('animal-detail');
    if (!listEl) return;

    window.Utils.removeAllChildren(listEl);

    if (_ownedAnimals.length === 0) {
      var emptyMsg = window.Utils.createElement('div', 'animal-empty', listEl);
      emptyMsg.textContent = '아직 동물이 없습니다. 상점에서 구매하세요!';
      return;
    }

    // 동물 목록 생성
    for (var i = 0; i < _ownedAnimals.length; i++) {
      _createAnimalListItem(listEl, detailEl, _ownedAnimals[i]);
    }

    // 전체 먹이 주기 버튼
    var feedAllBtn = window.Utils.createElement('button', 'pixel-btn btn-primary animal-feed-all-btn', listEl);
    feedAllBtn.textContent = '🥕 전체 먹이 주기';
    feedAllBtn.addEventListener('click', function () {
      feedAll();
      renderAnimalModal();
    });

    // 전체 수집 버튼
    var collectAllBtn = window.Utils.createElement('button', 'pixel-btn btn-secondary animal-collect-all-btn', listEl);
    collectAllBtn.textContent = '📦 전체 생산품 수집';
    collectAllBtn.addEventListener('click', function () {
      collectAll();
      renderAnimalModal();
    });
  }

  /**
   * 동물 목록 아이템 요소를 생성한다.
   * @private
   * @param {HTMLElement} listEl - 목록 컨테이너
   * @param {HTMLElement} detailEl - 상세 정보 패널
   * @param {Object} animal - 동물 인스턴스
   */
  function _createAnimalListItem(listEl, detailEl, animal) {
    var data = window.ANIMAL_DATA[animal.typeId];
    if (!data) return;

    var item = window.Utils.createElement('div', 'animal-list-item', listEl);

    // 이모지와 이름
    var header = window.Utils.createElement('div', 'animal-item-header', item);
    header.textContent = data.emoji + ' ' + animal.name;

    // 상태 아이콘
    var status = window.Utils.createElement('div', 'animal-item-status', item);
    var fedIcon = animal.fed ? '✅' : '❌';
    var productIcon = animal.productReady ? '📦' : '⏳';
    status.textContent = '먹이: ' + fedIcon + ' | 생산: ' + productIcon;

    // 행복도 바
    var happinessBar = window.Utils.createElement('div', 'animal-happiness-bar', item);
    var happinessFill = window.Utils.createElement('div', 'animal-happiness-fill', happinessBar);
    happinessFill.style.width = animal.happiness + '%';

    // 행복도에 따른 색상
    if (animal.happiness > 70) {
      happinessFill.classList.add('happiness-high');
    } else if (animal.happiness > 40) {
      happinessFill.classList.add('happiness-mid');
    } else {
      happinessFill.classList.add('happiness-low');
    }

    // 버튼 영역
    var btnArea = window.Utils.createElement('div', 'animal-item-buttons', item);

    // 먹이 주기 버튼
    var feedBtn = window.Utils.createElement('button', 'pixel-btn btn-sm btn-primary', btnArea);
    feedBtn.textContent = '🥕 먹이 (' + data.feedCost + 'G)';
    feedBtn.disabled = animal.fed;

    // 수집 버튼
    var collectBtn = window.Utils.createElement('button', 'pixel-btn btn-sm btn-secondary', btnArea);
    collectBtn.textContent = '📦 수집';
    collectBtn.disabled = !animal.productReady;

    // 이벤트 바인딩 (클로저로 ID 캡처)
    (function (animalId) {
      // 클릭 시 상세 정보 표시
      item.addEventListener('click', function () {
        if (detailEl) {
          detailEl.textContent = getAnimalInfo(animalId);
          detailEl.style.whiteSpace = 'pre-line';
        }
      });

      feedBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        feedAnimal(animalId);
        renderAnimalModal();
      });

      collectBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        collectProduct(animalId);
        renderAnimalModal();
      });
    })(animal.id);
  }

  // ===== 게임 월드 렌더링 =====

  /**
   * #animal-area에 소유 동물들의 이모지를 렌더링한다.
   * 각 동물은 간단한 애니메이션과 함께 표시된다.
   */
  function renderAnimalArea() {
    var area = document.getElementById('animal-area');
    if (!area) return;

    window.Utils.removeAllChildren(area);

    for (var i = 0; i < _ownedAnimals.length; i++) {
      var animal = _ownedAnimals[i];
      var data = window.ANIMAL_DATA[animal.typeId];
      if (!data) continue;

      var animalEl = window.Utils.createElement('div', 'pixel-animal', area);
      animalEl.textContent = data.emoji;
      animalEl.title = animal.name + ' (행복도: ' + animal.happiness + ')';

      // 격자 배치 (간단한 레이아웃)
      var col = i % 4;
      var row = Math.floor(i / 4);
      animalEl.style.left = (20 + col * 60) + 'px';
      animalEl.style.top = (10 + row * 60) + 'px';

      // 생산품 준비 시 깜빡임 효과 클래스 추가
      if (animal.productReady) {
        animalEl.classList.add('animal-product-ready');
      }

      // 행복도 낮으면 우울 표시
      if (animal.happiness <= 30) {
        animalEl.classList.add('animal-sad');
      }
    }
  }

  // ===== 내부 헬퍼 =====

  /**
   * ID로 동물 인스턴스를 찾는다.
   * @private
   * @param {string} id - 동물 고유 ID
   * @returns {Object|null}
   */
  function _findAnimal(id) {
    for (var i = 0; i < _ownedAnimals.length; i++) {
      if (_ownedAnimals[i].id === id) {
        return _ownedAnimals[i];
      }
    }
    return null;
  }

  /**
   * ID로 동물 인덱스를 찾는다.
   * @private
   * @param {string} id - 동물 고유 ID
   * @returns {number} 인덱스 (-1이면 미발견)
   */
  function _findAnimalIndex(id) {
    for (var i = 0; i < _ownedAnimals.length; i++) {
      if (_ownedAnimals[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 아이템 구매 이벤트 핸들러.
   * 동물 구매 시 자동으로 동물을 추가한다. (ShopSystem에서 이미 처리하므로 중복 방지)
   * @private
   * @param {Object} data - 구매 이벤트 데이터
   */
  function _onItemPurchased(data) {
    // ShopSystem에서 이미 addAnimal을 호출하므로 여기서는 렌더링만 갱신
    if (data && data.type === 'animal') {
      renderAnimalArea();
    }
  }

  // ===== 저장/불러오기 =====

  /**
   * 현재 상태를 반환한다 (저장용).
   * @returns {Object} 저장 상태
   */
  function getState() {
    return {
      ownedAnimals: window.Utils.deepClone(_ownedAnimals)
    };
  }

  /**
   * 저장된 상태를 불러온다.
   * @param {Object} state - 저장된 상태
   */
  function loadState(state) {
    if (!state) return;
    if (Array.isArray(state.ownedAnimals)) {
      _ownedAnimals = window.Utils.deepClone(state.ownedAnimals);
    }
    renderAnimalArea();
    console.log('[AnimalSystem] 상태 복원 완료. 동물 수:', _ownedAnimals.length);
  }

  // ===== 공개 API =====

  return {
    /** 소유 동물 목록 (직접 접근용, 읽기 전용 권장) */
    get ownedAnimals() { return _ownedAnimals; },

    init: init,
    addAnimal: addAnimal,
    removeAnimal: removeAnimal,
    feedAnimal: feedAnimal,
    feedAll: feedAll,
    collectProduct: collectProduct,
    collectAll: collectAll,
    dailyUpdate: dailyUpdate,
    getAnimalInfo: getAnimalInfo,
    getOwnedAnimals: getOwnedAnimals,
    getAnimalCount: getAnimalCount,
    canAddAnimal: canAddAnimal,
    getUniqueAnimalTypes: getUniqueAnimalTypes,
    renderAnimalModal: renderAnimalModal,
    renderAnimalArea: renderAnimalArea,
    getState: getState,
    loadState: loadState,

    /** 동물 이름을 변경한다. */
    renameAnimal: function (id, newName) {
      var animal = _findAnimal(id);
      if (animal && newName) {
        animal.name = newName;
        return true;
      }
      return false;
    }
  };
})();
