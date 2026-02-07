/**
 * WooFarm - 장식 시스템
 * 장식 배치/제거, 배치 모드 토글, 효과 계산, 렌더링을 담당한다.
 */
window.DecorationSystem = (function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  // ===== 상수 =====

  /** @type {number} 농장 그리드 행 수 (장식 배치 범위) */
  var GRID_ROWS = 10;

  /** @type {number} 농장 그리드 열 수 (장식 배치 범위) */
  var GRID_COLS = 14;

  /** @type {number} 제거 시 환불 비율 (50%) */
  var REFUND_RATE = 0.5;

  // ===== 내부 상태 =====

  /**
   * 배치된 장식 배열
   * 각 항목: { id (인스턴스 고유 ID), decorId (DECORATION_DATA 키), row, col, placedDay }
   * @type {Array<Object>}
   */
  var _placedDecorations = [];

  /** @type {boolean} 장식 배치 모드 활성 여부 */
  var _decorMode = false;

  /** @type {string|null} 현재 선택된 장식 ID (배치용) */
  var _selectedDecor = null;

  // ===== 초기화 =====

  /**
   * 장식 시스템을 초기화한다.
   * 이벤트 리스너를 등록한다.
   */
  function init() {
    // 계절 변경 시 계절 장식 처리
    eventBus.on('season_changed', _onSeasonChanged);

    // 하루 시작 시 장식 효과 적용
    eventBus.on('day_start', _applyDailyEffects);

    console.log('[DecorationSystem] 초기화 완료.');
  }

  // ===== 배치 모드 관리 =====

  /**
   * 장식 배치 모드를 활성화한다.
   * 장식 선택 패널을 표시하고, 게임 월드에 배치 가능 위치를 시각화한다.
   */
  function enterDecorMode() {
    _decorMode = true;
    eventBus.emit('decor_mode_on', {});
    console.log('[DecorationSystem] 장식 배치 모드 ON');
  }

  /**
   * 장식 배치 모드를 비활성화한다.
   * 선택을 초기화하고 장식 패널을 닫는다.
   */
  function exitDecorMode() {
    _decorMode = false;
    _selectedDecor = null;
    eventBus.emit('decor_mode_off', {});
    console.log('[DecorationSystem] 장식 배치 모드 OFF');
  }

  /**
   * 장식 배치 모드를 토글한다.
   */
  function toggleDecorMode() {
    if (_decorMode) {
      exitDecorMode();
    } else {
      enterDecorMode();
    }
  }

  // ===== 장식 선택 =====

  /**
   * 배치할 장식을 선택한다.
   * 플레이어가 해당 장식을 구매했는지(인벤토리에 보유중인지) 확인한다.
   * @param {string} decorId - DECORATION_DATA의 장식 ID
   * @returns {boolean} 선택 성공 여부
   */
  function selectDecoration(decorId) {
    if (!window.DECORATION_DATA || !window.DECORATION_DATA[decorId]) {
      console.warn('[DecorationSystem] 알 수 없는 장식:', decorId);
      return false;
    }

    // 인벤토리에서 보유 확인 (구매된 장식)
    if (window.InventorySystem) {
      var count = window.InventorySystem.getItemCount(decorId);
      if (count <= 0) {
        console.warn('[DecorationSystem] 보유하지 않은 장식:', decorId);
        return false;
      }
    }

    _selectedDecor = decorId;
    console.log('[DecorationSystem] 장식 선택:', decorId);
    return true;
  }

  // ===== 장식 배치 =====

  /**
   * 선택된 장식을 지정 위치에 배치한다.
   * @param {number} row - 배치할 행 (0-based)
   * @param {number} col - 배치할 열 (0-based)
   * @returns {boolean} 배치 성공 여부
   */
  function placeDecoration(row, col) {
    // 배치 모드 확인
    if (!_decorMode) {
      console.warn('[DecorationSystem] 배치 모드가 아닙니다.');
      return false;
    }

    // 선택된 장식 확인
    if (!_selectedDecor) {
      console.warn('[DecorationSystem] 선택된 장식이 없습니다.');
      return false;
    }

    // 범위 확인
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      console.warn('[DecorationSystem] 배치 범위 초과:', row, col);
      return false;
    }

    // 겹침 확인
    if (getDecorationAt(row, col)) {
      console.warn('[DecorationSystem] 이미 장식이 배치된 위치:', row, col);
      return false;
    }

    var decorData = window.DECORATION_DATA[_selectedDecor];
    if (!decorData) return false;

    // 인벤토리에서 장식 소비 (구매 후 배치 방식)
    if (window.InventorySystem) {
      var hasItem = window.InventorySystem.getItemCount(_selectedDecor) > 0;
      if (hasItem) {
        window.InventorySystem.removeItem(_selectedDecor, 1);
      } else {
        // 인벤토리에 없으면 골드로 직접 구매하여 배치
        var price = decorData.price || 0;
        if (window.ShopSystem && window.ShopSystem.gold < price) {
          console.warn('[DecorationSystem] 골드 부족. 필요:', price);
          return false;
        }
        if (price > 0 && window.ShopSystem) {
          window.ShopSystem.removeGold(price);
        }
      }
    }

    // 현재 게임 일수 가져오기
    var currentDay = 1;
    if (window.TimeSystem && window.TimeSystem.getDay) {
      currentDay = window.TimeSystem.getDay();
    }

    // 장식 인스턴스 생성 및 배치
    var instance = {
      id: window.Utils.generateId(),
      decorId: _selectedDecor,
      row: row,
      col: col,
      placedDay: currentDay
    };

    _placedDecorations.push(instance);

    // 이벤트 발행
    eventBus.emit('decoration_placed', {
      id: instance.id,
      decorId: instance.decorId,
      row: row,
      col: col
    });

    // 렌더링 갱신
    renderDecorations();

    console.log('[DecorationSystem] 장식 배치:', _selectedDecor, '위치:', row, col);
    return true;
  }

  // ===== 장식 제거 =====

  /**
   * 배치된 장식을 제거하고 가격의 50%를 환불한다.
   * @param {string} instanceId - 장식 인스턴스 고유 ID
   * @returns {boolean} 제거 성공 여부
   */
  function removeDecoration(instanceId) {
    var index = -1;
    for (var i = 0; i < _placedDecorations.length; i++) {
      if (_placedDecorations[i].id === instanceId) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      console.warn('[DecorationSystem] 장식을 찾을 수 없음:', instanceId);
      return false;
    }

    var removed = _placedDecorations.splice(index, 1)[0];

    // 50% 환불
    if (window.DECORATION_DATA && window.DECORATION_DATA[removed.decorId]) {
      var price = window.DECORATION_DATA[removed.decorId].price || 0;
      var refund = Math.floor(price * REFUND_RATE);
      if (refund > 0 && window.ShopSystem) {
        window.ShopSystem.addGold(refund);
      }
    }

    // 이벤트 발행
    eventBus.emit('decoration_removed', {
      id: removed.id,
      decorId: removed.decorId,
      row: removed.row,
      col: removed.col
    });

    // 렌더링 갱신
    renderDecorations();

    console.log('[DecorationSystem] 장식 제거:', removed.decorId, '환불 처리됨');
    return true;
  }

  // ===== 조회 =====

  /**
   * 배치된 모든 장식을 반환한다.
   * @returns {Array<Object>} 장식 인스턴스 배열 (복사본)
   */
  function getPlacedDecorations() {
    return _placedDecorations.slice();
  }

  /**
   * 특정 위치에 장식이 있는지 확인한다.
   * @param {number} row
   * @param {number} col
   * @returns {Object|null} 해당 위치의 장식 인스턴스 또는 null
   */
  function getDecorationAt(row, col) {
    for (var i = 0; i < _placedDecorations.length; i++) {
      var d = _placedDecorations[i];
      if (d.row === row && d.col === col) {
        return d;
      }
    }
    return null;
  }

  /**
   * 배치된 장식 수를 반환한다.
   * @returns {number}
   */
  function getDecorationCount() {
    return _placedDecorations.length;
  }

  /**
   * 배치된 모든 장식의 효과를 합산하여 반환한다.
   * 각 장식의 effect 객체를 순회하며 동일 효과를 누적한다.
   * @returns {Object} 통합 효과 객체 (예: { growth_speed: 0.15, happiness_boost: 10, auto_water: 2 })
   */
  function getActiveEffects() {
    var effects = {};

    if (!window.DECORATION_DATA) return effects;

    for (var i = 0; i < _placedDecorations.length; i++) {
      var decorData = window.DECORATION_DATA[_placedDecorations[i].decorId];
      if (!decorData || !decorData.effects) continue;

      var effectKeys = Object.keys(decorData.effects);
      for (var j = 0; j < effectKeys.length; j++) {
        var key = effectKeys[j];
        var value = decorData.effects[key];

        if (effects[key] === undefined) {
          effects[key] = 0;
        }
        effects[key] += value;
      }
    }

    return effects;
  }

  // ===== 모달 렌더링 =====

  /**
   * 장식 모달을 렌더링한다.
   * 카테고리별로 장식을 표시하고, 클릭 시 선택 상태로 전환한다.
   */
  function renderDecorModal() {
    var categoriesEl = document.getElementById('decor-categories');
    var itemsEl = document.getElementById('decor-items');
    if (!categoriesEl || !itemsEl) return;

    window.Utils.removeAllChildren(categoriesEl);
    window.Utils.removeAllChildren(itemsEl);

    if (!window.DECORATION_DATA) {
      var emptyMsg = window.Utils.createElement('div', 'decor-empty', itemsEl);
      emptyMsg.textContent = '장식 데이터를 불러올 수 없습니다.';
      return;
    }

    // 카테고리 수집
    var categories = {};
    var decorKeys = Object.keys(window.DECORATION_DATA);
    for (var i = 0; i < decorKeys.length; i++) {
      var decor = window.DECORATION_DATA[decorKeys[i]];
      var cat = decor.category || '기타';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(decor);
    }

    var catNames = Object.keys(categories);
    var activeCat = catNames.length > 0 ? catNames[0] : null;

    // 카테고리 버튼 생성
    for (var c = 0; c < catNames.length; c++) {
      (function (catName) {
        var btn = window.Utils.createElement('button', 'pixel-btn decor-cat-btn' + (catName === activeCat ? ' active' : ''), categoriesEl);
        btn.textContent = catName;
        btn.addEventListener('click', function () {
          // 활성 카테고리 변경
          var allBtns = categoriesEl.querySelectorAll('.decor-cat-btn');
          for (var b = 0; b < allBtns.length; b++) {
            allBtns[b].classList.remove('active');
          }
          btn.classList.add('active');
          _renderDecorItems(itemsEl, categories[catName]);
        });
      })(catNames[c]);
    }

    // 초기 카테고리 아이템 렌더링
    if (activeCat) {
      _renderDecorItems(itemsEl, categories[activeCat]);
    }

    // 배치된 장식 목록 (제거용)
    if (_placedDecorations.length > 0) {
      var placedSection = window.Utils.createElement('div', 'decor-placed-section', itemsEl);
      var placedTitle = window.Utils.createElement('h4', 'decor-placed-title', placedSection);
      placedTitle.textContent = '배치된 장식 (' + _placedDecorations.length + '개)';

      for (var p = 0; p < _placedDecorations.length; p++) {
        _createPlacedDecorCard(placedSection, _placedDecorations[p]);
      }
    }
  }

  /**
   * 카테고리별 장식 아이템을 렌더링한다.
   * @private
   * @param {HTMLElement} container
   * @param {Array<Object>} items - 장식 데이터 배열
   */
  function _renderDecorItems(container, items) {
    window.Utils.removeAllChildren(container);

    for (var i = 0; i < items.length; i++) {
      _createDecorCard(container, items[i]);
    }
  }

  /**
   * 장식 아이템 카드를 생성한다.
   * @private
   * @param {HTMLElement} container
   * @param {Object} decor - 장식 데이터
   */
  function _createDecorCard(container, decor) {
    var isSelected = _selectedDecor === decor.id;
    var card = window.Utils.createElement('div', 'decor-item-card' + (isSelected ? ' selected' : ''), container);

    // 이모지
    var emoji = window.Utils.createElement('div', 'decor-item-emoji', card);
    emoji.textContent = decor.emoji || '🏠';

    // 이름
    var name = window.Utils.createElement('div', 'decor-item-name', card);
    name.textContent = decor.name;

    // 가격
    var price = window.Utils.createElement('div', 'decor-item-price', card);
    price.textContent = '💰 ' + window.Utils.formatNumber(decor.price || 0) + 'G';

    // 효과 표시
    if (decor.effects) {
      var effectEl = window.Utils.createElement('div', 'decor-item-effects', card);
      var effectTexts = [];
      var effectKeys = Object.keys(decor.effects);
      for (var e = 0; e < effectKeys.length; e++) {
        effectTexts.push(_getEffectLabel(effectKeys[e]) + ': +' + decor.effects[effectKeys[e]]);
      }
      effectEl.textContent = effectTexts.join(', ');
    }

    // 설명
    if (decor.description) {
      var desc = window.Utils.createElement('div', 'decor-item-desc', card);
      desc.textContent = decor.description;
    }

    // 클릭하여 선택
    (function (decorId) {
      card.addEventListener('click', function () {
        _selectedDecor = decorId;
        // 선택 상태 시각적 갱신
        var allCards = container.querySelectorAll('.decor-item-card');
        for (var a = 0; a < allCards.length; a++) {
          allCards[a].classList.remove('selected');
        }
        card.classList.add('selected');

        // 배치 모드가 아니면 자동 진입
        if (!_decorMode) {
          enterDecorMode();
        }
      });
    })(decor.id);
  }

  /**
   * 배치된 장식 카드를 생성한다 (제거 버튼 포함).
   * @private
   * @param {HTMLElement} container
   * @param {Object} instance - 배치된 장식 인스턴스
   */
  function _createPlacedDecorCard(container, instance) {
    var decorData = window.DECORATION_DATA ? window.DECORATION_DATA[instance.decorId] : null;

    var card = window.Utils.createElement('div', 'decor-placed-card', container);

    // 아이콘 + 이름
    var info = window.Utils.createElement('span', 'decor-placed-info', card);
    var emojiText = decorData ? decorData.emoji : '🏠';
    var nameText = decorData ? decorData.name : instance.decorId;
    info.textContent = emojiText + ' ' + nameText + ' (' + instance.row + ',' + instance.col + ')';

    // 환불 금액 표시
    var refundAmount = 0;
    if (decorData && decorData.price) {
      refundAmount = Math.floor(decorData.price * REFUND_RATE);
    }

    // 제거 버튼
    var removeBtn = window.Utils.createElement('button', 'pixel-btn btn-sm btn-danger', card);
    removeBtn.textContent = '제거 (+' + refundAmount + 'G)';

    (function (instanceId) {
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeDecoration(instanceId);
        renderDecorModal(); // 모달 갱신
      });
    })(instance.id);
  }

  /**
   * 효과 키에 대한 한글 라벨을 반환한다.
   * @private
   * @param {string} effectKey
   * @returns {string}
   */
  function _getEffectLabel(effectKey) {
    var labels = {
      'growth_speed': '성장 속도',
      'happiness_boost': '행복도 보너스',
      'auto_water': '자동 물주기',
      'harvest_bonus': '수확 보너스',
      'gold_bonus': '골드 보너스',
      'exp_bonus': '경험치 보너스',
      'beauty': '농장 미관'
    };
    return labels[effectKey] || effectKey;
  }

  // ===== 게임 월드 렌더링 =====

  /**
   * #decoration-area에 배치된 장식을 렌더링한다.
   */
  function renderDecorations() {
    var area = document.getElementById('decoration-area');
    if (!area) return;

    window.Utils.removeAllChildren(area);

    for (var i = 0; i < _placedDecorations.length; i++) {
      var instance = _placedDecorations[i];
      var decorData = window.DECORATION_DATA ? window.DECORATION_DATA[instance.decorId] : null;

      var el = window.Utils.createElement('div', 'pixel-decoration', area);
      el.textContent = decorData ? (decorData.emoji || '🏠') : '🏠';
      el.title = decorData ? decorData.name : instance.decorId;

      // 그리드 위치에 배치 (CSS grid 또는 absolute positioning)
      el.style.gridRow = (instance.row + 1).toString();
      el.style.gridColumn = (instance.col + 1).toString();

      // 배치 모드에서 클릭 시 제거 가능
      if (_decorMode) {
        el.classList.add('decor-removable');
        (function (instanceId) {
          el.addEventListener('click', function () {
            if (_decorMode && !_selectedDecor) {
              removeDecoration(instanceId);
            }
          });
        })(instance.id);
      }
    }
  }

  // ===== 일일 효과 적용 =====

  /**
   * 하루 시작 시 장식 효과를 게임 시스템에 적용한다.
   * @private
   */
  function _applyDailyEffects() {
    var effects = getActiveEffects();

    // 자동 물주기 효과가 있으면 농장 시스템에 전달
    if (effects.auto_water && effects.auto_water > 0 && window.FarmSystem) {
      if (typeof window.FarmSystem.autoWater === 'function') {
        window.FarmSystem.autoWater(Math.floor(effects.auto_water));
      }
    }

    // 행복도 보너스가 있으면 동물 시스템에 전달
    if (effects.happiness_boost && effects.happiness_boost > 0 && window.AnimalSystem) {
      var animals = window.AnimalSystem.getOwnedAnimals();
      for (var i = 0; i < animals.length; i++) {
        // 직접 행복도를 조작하지 않고 이벤트로 전달
        animals[i].happiness = Math.min((animals[i].happiness || 0) + effects.happiness_boost, 100);
      }
    }
  }

  /**
   * 계절 변경 이벤트 핸들러.
   * 계절 한정 장식 관련 처리를 수행한다.
   * @private
   * @param {Object} data - { season }
   */
  function _onSeasonChanged(data) {
    // 현재는 로그만 출력. 추후 계절 장식 자동 변경 등 확장 가능.
    console.log('[DecorationSystem] 계절 변경 감지:', data ? data.season : 'unknown');
  }

  // ===== 저장/불러오기 =====

  /**
   * 현재 상태를 반환한다 (저장용).
   * @returns {Object}
   */
  function getState() {
    return {
      placedDecorations: window.Utils.deepClone(_placedDecorations),
      decorMode: false, // 저장 시 배치 모드는 항상 해제
      selectedDecor: null
    };
  }

  /**
   * 저장된 상태를 불러온다.
   * @param {Object} state
   */
  function loadState(state) {
    if (!state) return;
    if (Array.isArray(state.placedDecorations)) {
      _placedDecorations = window.Utils.deepClone(state.placedDecorations);
    }
    _decorMode = false;
    _selectedDecor = null;

    renderDecorations();
    console.log('[DecorationSystem] 상태 복원 완료. 배치 장식 수:', _placedDecorations.length);
  }

  // ===== 공개 API =====

  return {
    /** 배치된 장식 배열 (읽기 전용) */
    get placedDecorations() { return _placedDecorations; },
    /** 배치 모드 상태 */
    get decorMode() { return _decorMode; },
    /** 선택된 장식 ID */
    get selectedDecor() { return _selectedDecor; },

    init: init,
    enterDecorMode: enterDecorMode,
    exitDecorMode: exitDecorMode,
    toggleDecorMode: toggleDecorMode,
    selectDecoration: selectDecoration,
    placeDecoration: placeDecoration,
    removeDecoration: removeDecoration,
    getPlacedDecorations: getPlacedDecorations,
    getDecorationAt: getDecorationAt,
    getDecorationCount: getDecorationCount,
    getActiveEffects: getActiveEffects,
    renderDecorModal: renderDecorModal,
    renderDecorations: renderDecorations,
    getState: getState,
    loadState: loadState
  };
})();
