/**
 * WooFarm - 퀘스트 시스템
 * 퀘스트 활성화, 진행 추적, 완료 보상 지급 및 자동 해금을 담당한다.
 */
window.QuestSystem = (function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  // ===== 내부 상태 =====

  /**
   * 활성 퀘스트 배열
   * 각 항목: { questId, progress: [{ type, target, current, required }] }
   * @type {Array<Object>}
   */
  var _activeQuests = [];

  /** @type {Array<string>} 완료된 퀘스트 ID 배열 */
  var _completedQuests = [];

  // ===== 초기화 =====

  /**
   * 퀘스트 시스템을 초기화한다.
   * 이벤트 리스너를 등록하고 첫 번째 챕터 퀘스트를 자동 활성화한다.
   */
  function init() {
    // 퀘스트 진행에 영향을 주는 이벤트 리스너 등록
    eventBus.on('crop_harvested', function (data) { checkProgress('crop_harvested', data); });
    eventBus.on('item_sold', function (data) { checkProgress('item_sold', data); });
    eventBus.on('animal_added', function (data) { checkProgress('animal_added', data); });
    eventBus.on('product_collected', function (data) { checkProgress('product_collected', data); });
    eventBus.on('gold_changed', function (data) { checkProgress('gold_changed', data); });
    eventBus.on('decoration_placed', function (data) { checkProgress('decoration_placed', data); });
    eventBus.on('level_up', function (data) { checkProgress('level_up', data); });

    // 첫 챕터 퀘스트 자동 활성화
    _activateInitialQuests();

    console.log('[QuestSystem] 초기화 완료.');
  }

  /**
   * 초기 퀘스트를 활성화한다.
   * QUEST_DATA에서 선행 조건이 없는 퀘스트를 자동으로 활성화한다.
   * @private
   */
  function _activateInitialQuests() {
    if (!window.QUEST_DATA) return;

    var questKeys = Object.keys(window.QUEST_DATA);
    for (var i = 0; i < questKeys.length; i++) {
      var quest = window.QUEST_DATA[questKeys[i]];
      // 선행 퀘스트가 없거나 chapter가 1인 퀘스트를 자동 활성화
      var hasNoPrereqs = !quest.prerequisites || quest.prerequisites.length === 0;
      var isChapter1 = quest.chapter === 1;

      if (hasNoPrereqs || isChapter1) {
        activateQuest(questKeys[i]);
      }
    }
  }

  // ===== 퀘스트 활성화 =====

  /**
   * 퀘스트를 활성화한다.
   * @param {string} questId - 활성화할 퀘스트 ID
   * @returns {boolean} 활성화 성공 여부
   */
  function activateQuest(questId) {
    // 이미 활성 또는 완료된 퀘스트인지 확인
    if (_isQuestActive(questId) || _completedQuests.indexOf(questId) !== -1) {
      return false;
    }

    if (!window.QUEST_DATA || !window.QUEST_DATA[questId]) {
      console.warn('[QuestSystem] 알 수 없는 퀘스트:', questId);
      return false;
    }

    var questData = window.QUEST_DATA[questId];

    // 선행 퀘스트 조건 확인
    if (questData.prerequisites && questData.prerequisites.length > 0) {
      for (var i = 0; i < questData.prerequisites.length; i++) {
        if (_completedQuests.indexOf(questData.prerequisites[i]) === -1) {
          return false; // 선행 퀘스트 미완료
        }
      }
    }

    // 진행 상태 초기화
    var progress = [];
    if (questData.objectives && questData.objectives.length > 0) {
      for (var j = 0; j < questData.objectives.length; j++) {
        var obj = questData.objectives[j];
        progress.push({
          type: obj.type,           // 이벤트 타입 (예: 'crop_harvested')
          target: obj.target || null, // 대상 ID (예: 'turnip')
          current: 0,               // 현재 달성량
          required: obj.required || 1 // 필요 달성량
        });
      }
    }

    _activeQuests.push({
      questId: questId,
      progress: progress
    });

    eventBus.emit('quest_activated', { questId: questId });

    console.log('[QuestSystem] 퀘스트 활성화:', questId);
    return true;
  }

  // ===== 진행 확인 =====

  /**
   * 이벤트 발생 시 활성 퀘스트의 진행도를 업데이트한다.
   * @param {string} eventType - 발생한 이벤트 타입
   * @param {Object} data - 이벤트 데이터
   */
  function checkProgress(eventType, data) {
    if (!data) data = {};

    // 모든 활성 퀘스트를 순회하며 매칭되는 목표 업데이트
    for (var i = 0; i < _activeQuests.length; i++) {
      var quest = _activeQuests[i];
      var updated = false;

      for (var j = 0; j < quest.progress.length; j++) {
        var obj = quest.progress[j];

        // 이벤트 타입이 일치하는 목표만 처리
        if (obj.type !== eventType) continue;

        // 이미 완료된 목표는 건너뛴다
        if (obj.current >= obj.required) continue;

        // 타입별 진행 업데이트
        var increment = _calculateIncrement(eventType, obj, data);
        if (increment > 0) {
          obj.current = Math.min(obj.current + increment, obj.required);
          updated = true;
        }
      }

      // 퀘스트 완료 여부 확인
      if (updated && isQuestComplete(quest.questId)) {
        completeQuest(quest.questId);
        // 완료로 인해 배열이 변경되었으므로 인덱스 조정
        i--;
      }
    }
  }

  /**
   * 이벤트 타입에 따른 진행량 증분을 계산한다.
   * @private
   * @param {string} eventType - 이벤트 타입
   * @param {Object} obj - 퀘스트 목표 객체
   * @param {Object} data - 이벤트 데이터
   * @returns {number} 증가량
   */
  function _calculateIncrement(eventType, obj, data) {
    switch (eventType) {
      case 'crop_harvested':
        // target이 지정되어 있으면 특정 작물만 카운트
        if (obj.target && data.cropId !== obj.target) return 0;
        return data.quantity || 1;

      case 'item_sold':
        // target이 지정되어 있으면 특정 아이템만 카운트
        if (obj.target && data.itemId !== obj.target) return 0;
        // 골드 기반 목표인 경우 totalGold 사용
        if (obj.target === 'gold_total') return data.totalGold || 0;
        return data.quantity || 1;

      case 'animal_added':
        if (obj.target && data.typeId !== obj.target) return 0;
        return 1;

      case 'product_collected':
        if (obj.target && data.typeId !== obj.target) return 0;
        return 1;

      case 'gold_changed':
        // 골드 축적 퀘스트: 현재 보유 골드 확인
        if (data.gold !== undefined) {
          // 현재 골드가 목표 이상이면 달성
          if (data.gold >= obj.required) {
            return obj.required; // 즉시 완료
          }
          return 0; // 아직 부족
        }
        return 0;

      case 'decoration_placed':
        if (obj.target && data.decorId !== obj.target) return 0;
        return 1;

      case 'level_up':
        if (data.level !== undefined) {
          return data.level >= obj.required ? obj.required : 0;
        }
        return 1;

      default:
        return 0;
    }
  }

  // ===== 퀘스트 완료 =====

  /**
   * 퀘스트를 완료 처리한다.
   * 보상을 지급하고, 후속 퀘스트를 자동 활성화한다.
   * @param {string} questId - 완료할 퀘스트 ID
   */
  function completeQuest(questId) {
    // 활성 퀘스트에서 제거
    var index = -1;
    for (var i = 0; i < _activeQuests.length; i++) {
      if (_activeQuests[i].questId === questId) {
        index = i;
        break;
      }
    }
    if (index === -1) return;

    _activeQuests.splice(index, 1);
    _completedQuests.push(questId);

    // 보상 지급
    var questData = window.QUEST_DATA ? window.QUEST_DATA[questId] : null;
    if (questData && questData.rewards) {
      _giveRewards(questData.rewards);
    }

    // 사운드 재생
    if (window.AudioManager) window.AudioManager.playSound('quest_complete');

    // 이벤트 발행
    eventBus.emit('quest_completed', {
      questId: questId,
      rewards: questData ? questData.rewards : null
    });

    console.log('[QuestSystem] 퀘스트 완료:', questId);

    // 후속 퀘스트 자동 활성화 (이 퀘스트를 선행 조건으로 가진 퀘스트 탐색)
    _activateUnlockedQuests();
  }

  /**
   * 보상을 지급한다.
   * @private
   * @param {Object} rewards - 보상 객체 { gold, exp, items: [{id, quantity}] }
   */
  function _giveRewards(rewards) {
    // 골드 보상
    if (rewards.gold && rewards.gold > 0) {
      if (window.ShopSystem) {
        window.ShopSystem.addGold(rewards.gold);
      }
    }

    // 경험치 보상
    if (rewards.exp && rewards.exp > 0) {
      eventBus.emit('exp_gained', { amount: rewards.exp });
    }

    // 아이템 보상
    if (rewards.items && rewards.items.length > 0) {
      for (var i = 0; i < rewards.items.length; i++) {
        var item = rewards.items[i];
        if (window.InventorySystem) {
          window.InventorySystem.addItem(item.id, item.quantity || 1);
        }
      }
    }
  }

  /**
   * 선행 조건이 충족된 퀘스트를 자동으로 활성화한다.
   * @private
   */
  function _activateUnlockedQuests() {
    if (!window.QUEST_DATA) return;

    var questKeys = Object.keys(window.QUEST_DATA);
    for (var i = 0; i < questKeys.length; i++) {
      var questId = questKeys[i];
      // 이미 활성이거나 완료된 퀘스트 건너뛰기
      if (_isQuestActive(questId) || _completedQuests.indexOf(questId) !== -1) {
        continue;
      }

      var quest = window.QUEST_DATA[questId];
      if (!quest.prerequisites || quest.prerequisites.length === 0) continue;

      // 모든 선행 조건이 완료되었는지 확인
      var allMet = true;
      for (var j = 0; j < quest.prerequisites.length; j++) {
        if (_completedQuests.indexOf(quest.prerequisites[j]) === -1) {
          allMet = false;
          break;
        }
      }

      if (allMet) {
        activateQuest(questId);
      }
    }
  }

  // ===== 조회 =====

  /**
   * 퀘스트가 활성 상태인지 확인한다.
   * @private
   * @param {string} questId
   * @returns {boolean}
   */
  function _isQuestActive(questId) {
    for (var i = 0; i < _activeQuests.length; i++) {
      if (_activeQuests[i].questId === questId) return true;
    }
    return false;
  }

  /**
   * 퀘스트의 모든 목표가 달성되었는지 확인한다.
   * @param {string} questId
   * @returns {boolean}
   */
  function isQuestComplete(questId) {
    var quest = null;
    for (var i = 0; i < _activeQuests.length; i++) {
      if (_activeQuests[i].questId === questId) {
        quest = _activeQuests[i];
        break;
      }
    }
    if (!quest) return false;

    for (var j = 0; j < quest.progress.length; j++) {
      if (quest.progress[j].current < quest.progress[j].required) {
        return false;
      }
    }
    return true;
  }

  /**
   * 퀘스트의 진행률을 0-100 범위로 반환한다.
   * @param {string} questId
   * @returns {number} 진행률 (0~100)
   */
  function getQuestProgress(questId) {
    var quest = null;
    for (var i = 0; i < _activeQuests.length; i++) {
      if (_activeQuests[i].questId === questId) {
        quest = _activeQuests[i];
        break;
      }
    }
    if (!quest || quest.progress.length === 0) return 0;

    var totalProgress = 0;
    for (var j = 0; j < quest.progress.length; j++) {
      var obj = quest.progress[j];
      totalProgress += Math.min(obj.current / obj.required, 1);
    }

    return Math.floor((totalProgress / quest.progress.length) * 100);
  }

  /**
   * 활성 퀘스트 목록을 진행 정보와 함께 반환한다.
   * @returns {Array<Object>}
   */
  function getActiveQuests() {
    var result = [];
    for (var i = 0; i < _activeQuests.length; i++) {
      var q = _activeQuests[i];
      var questData = window.QUEST_DATA ? window.QUEST_DATA[q.questId] : null;
      result.push({
        questId: q.questId,
        name: questData ? questData.name : q.questId,
        description: questData ? questData.description : '',
        progress: q.progress,
        percentage: getQuestProgress(q.questId),
        rewards: questData ? questData.rewards : null
      });
    }
    return result;
  }

  /**
   * 완료된 퀘스트 ID 목록을 반환한다.
   * @returns {Array<string>}
   */
  function getCompletedQuests() {
    return _completedQuests.slice();
  }

  /**
   * 총 완료 퀘스트 수를 반환한다.
   * @returns {number}
   */
  function getTotalQuestsCompleted() {
    return _completedQuests.length;
  }

  // ===== 모달 렌더링 =====

  /**
   * 퀘스트 모달을 렌더링한다.
   * @param {string} [tab='active'] - 활성 탭 ('active' | 'completed')
   */
  function renderQuestModal(tab) {
    tab = tab || 'active';

    // 탭 활성 상태 갱신
    var questTabs = document.querySelectorAll('.quest-tab');
    for (var t = 0; t < questTabs.length; t++) {
      questTabs[t].classList.toggle('active', questTabs[t].getAttribute('data-quest-tab') === tab);
    }

    var listEl = document.getElementById('quest-list');
    if (!listEl) return;
    window.Utils.removeAllChildren(listEl);

    if (tab === 'active') {
      _renderActiveQuests(listEl);
    } else {
      _renderCompletedQuests(listEl);
    }
  }

  /**
   * 활성 퀘스트 목록을 렌더링한다.
   * @private
   * @param {HTMLElement} container
   */
  function _renderActiveQuests(container) {
    var quests = getActiveQuests();

    if (quests.length === 0) {
      var emptyMsg = window.Utils.createElement('div', 'quest-empty', container);
      emptyMsg.textContent = '진행 중인 퀘스트가 없습니다.';
      return;
    }

    for (var i = 0; i < quests.length; i++) {
      _createQuestCard(container, quests[i], false);
    }
  }

  /**
   * 완료 퀘스트 목록을 렌더링한다.
   * @private
   * @param {HTMLElement} container
   */
  function _renderCompletedQuests(container) {
    if (_completedQuests.length === 0) {
      var emptyMsg = window.Utils.createElement('div', 'quest-empty', container);
      emptyMsg.textContent = '완료된 퀘스트가 없습니다.';
      return;
    }

    for (var i = 0; i < _completedQuests.length; i++) {
      var questId = _completedQuests[i];
      var questData = window.QUEST_DATA ? window.QUEST_DATA[questId] : null;

      var info = {
        questId: questId,
        name: questData ? questData.name : questId,
        description: questData ? questData.description : '',
        percentage: 100,
        rewards: questData ? questData.rewards : null,
        progress: []
      };
      _createQuestCard(container, info, true);
    }
  }

  /**
   * 퀘스트 카드 요소를 생성한다.
   * @private
   * @param {HTMLElement} container - 부모 컨테이너
   * @param {Object} quest - 퀘스트 정보
   * @param {boolean} isCompleted - 완료 여부
   */
  function _createQuestCard(container, quest, isCompleted) {
    var card = window.Utils.createElement('div', 'quest-card' + (isCompleted ? ' quest-completed' : ''), container);

    // 퀘스트 이름
    var header = window.Utils.createElement('div', 'quest-card-header', card);
    var icon = isCompleted ? '✅' : '📋';
    header.textContent = icon + ' ' + quest.name;

    // 설명
    if (quest.description) {
      var desc = window.Utils.createElement('div', 'quest-card-desc', card);
      desc.textContent = quest.description;
    }

    // 진행률 바 (활성 퀘스트만)
    if (!isCompleted) {
      // 개별 목표 표시
      for (var i = 0; i < quest.progress.length; i++) {
        var obj = quest.progress[i];
        var objEl = window.Utils.createElement('div', 'quest-objective', card);

        var objText = window.Utils.createElement('span', 'quest-obj-text', objEl);
        objText.textContent = _getObjectiveLabel(obj) + ': ' + obj.current + '/' + obj.required;

        // 개별 진행률 바
        var bar = window.Utils.createElement('div', 'quest-progress-bar', objEl);
        var fill = window.Utils.createElement('div', 'quest-progress-fill', bar);
        var percent = Math.min((obj.current / obj.required) * 100, 100);
        fill.style.width = percent + '%';
      }

      // 전체 진행률
      var totalBar = window.Utils.createElement('div', 'quest-total-bar', card);
      var totalFill = window.Utils.createElement('div', 'quest-total-fill', totalBar);
      totalFill.style.width = quest.percentage + '%';
      var totalLabel = window.Utils.createElement('span', 'quest-total-label', card);
      totalLabel.textContent = quest.percentage + '% 완료';
    }

    // 보상 표시
    if (quest.rewards) {
      var rewardEl = window.Utils.createElement('div', 'quest-rewards', card);
      var rewardParts = [];
      if (quest.rewards.gold) rewardParts.push('💰 ' + quest.rewards.gold + 'G');
      if (quest.rewards.exp) rewardParts.push('⭐ ' + quest.rewards.exp + ' EXP');
      if (quest.rewards.items) {
        for (var r = 0; r < quest.rewards.items.length; r++) {
          var ri = quest.rewards.items[r];
          rewardParts.push('📦 ' + ri.id + ' x' + (ri.quantity || 1));
        }
      }
      rewardEl.textContent = '보상: ' + rewardParts.join(' | ');
    }
  }

  /**
   * 목표 타입에 대한 한글 라벨을 반환한다.
   * @private
   * @param {Object} obj - 목표 객체
   * @returns {string}
   */
  function _getObjectiveLabel(obj) {
    var labels = {
      'crop_harvested': '작물 수확',
      'item_sold': '아이템 판매',
      'animal_added': '동물 구매',
      'product_collected': '생산품 수집',
      'gold_changed': '골드 보유',
      'decoration_placed': '장식 배치',
      'level_up': '레벨 달성'
    };

    var label = labels[obj.type] || obj.type;
    if (obj.target && obj.target !== 'gold_total') {
      label += ' (' + obj.target + ')';
    }
    return label;
  }

  // ===== 저장/불러오기 =====

  /**
   * 현재 상태를 반환한다 (저장용).
   * @returns {Object}
   */
  function getState() {
    return {
      activeQuests: window.Utils.deepClone(_activeQuests),
      completedQuests: _completedQuests.slice()
    };
  }

  /**
   * 저장된 상태를 불러온다.
   * @param {Object} state
   */
  function loadState(state) {
    if (!state) return;
    if (Array.isArray(state.activeQuests)) {
      _activeQuests = window.Utils.deepClone(state.activeQuests);
    }
    if (Array.isArray(state.completedQuests)) {
      _completedQuests = state.completedQuests.slice();
    }
    console.log('[QuestSystem] 상태 복원 완료. 활성:', _activeQuests.length, '완료:', _completedQuests.length);
  }

  // ===== 공개 API =====

  return {
    /** 활성 퀘스트 배열 (읽기 전용) */
    get activeQuests() { return _activeQuests; },
    /** 완료 퀘스트 배열 (읽기 전용) */
    get completedQuests() { return _completedQuests; },

    init: init,
    activateQuest: activateQuest,
    checkProgress: checkProgress,
    completeQuest: completeQuest,
    isQuestComplete: isQuestComplete,
    getQuestProgress: getQuestProgress,
    getActiveQuests: getActiveQuests,
    getCompletedQuests: getCompletedQuests,
    getTotalQuestsCompleted: getTotalQuestsCompleted,
    renderQuestModal: renderQuestModal,
    getState: getState,
    loadState: loadState
  };
})();
