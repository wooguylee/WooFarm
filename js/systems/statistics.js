/**
 * WooFarm - 통계 시스템 (Statistics System)
 * 게임 내 다양한 통계를 추적하고 관리합니다.
 */
(function () {
  'use strict';

  const eventBus = window.Utils.eventBus;
  const STORAGE_KEY = 'woofarm_statistics';

  /** 통계 초기값 */
  const DEFAULT_STATS = {
    // 일일 통계 (매일 리셋)
    daily: {
      cropHarvested: 0,
      goldEarned: 0,
      animalProductCollected: 0,
      questsCompleted: 0,
      itemSold: 0,
      itemBought: 0,
      stepsTaken: 0,
      timeSpent: 0 // 초 단위
    },

    // 주간 통계 (7일)
    weekly: {
      cropHarvested: 0,
      goldEarned: 0,
      animalProductCollected: 0,
      questsCompleted: 0
    },

    // 월간 통계 (28일)
    monthly: {
      cropHarvested: 0,
      goldEarned: 0,
      animalProductCollected: 0,
      questsCompleted: 0
    },

    // 누적 통계
    total: {
      cropHarvested: 0,
      goldEarned: 0,
      goldSpent: 0,
      animalProductCollected: 0,
      questsCompleted: 0,
      playtime: 0, // 초 단위
      maxGold: 0,
      currentLevel: 1,
      maxLevel: 1
    },

    // 작물별 통계
    crops: {}, // { crop_name: { harvested: 0, goldEarned: 0 } }

    // 동물별 통계
    animals: {}, // { animal_name: { collected: 0, fed: 0 } }

    // 시작/마지막 플레이
    firstPlayTime: null,
    lastPlayTime: null
  };

  let _stats = JSON.parse(JSON.stringify(DEFAULT_STATS));
  let _eventHandlers = {};
  let _lastDayReset = null;
  let _playtimeInterval = null;

  window.StatisticsSystem = {
    // ── 초기화 ────────────────────────────────────────

    /**
     * 통계 시스템을 초기화합니다.
     */
    init: function () {
      this.cleanup();
      this.load();
      this._setupEventListeners();
      this._startPlaytimeCounter();
      this._checkDayReset();
      console.log('[StatisticsSystem] 초기화 완료');
      console.log('[StatisticsSystem] 이벤트 리스너 정리 완료');
    },

    /**
     * 통계 시스템을 정리합니다.
     */
    cleanup: function () {
      Object.keys(_eventHandlers).forEach(key => {
        const handler = _eventHandlers[key];
        if (handler && typeof handler === 'function') {
          eventBus.off(key, handler);
        }
      });
      _eventHandlers = {};
      if (_playtimeInterval) {
        clearInterval(_playtimeInterval);
        _playtimeInterval = null;
      }
    },

    // ── 통계 로드/저장 ────────────────────────────────

    /**
     * 로컬 스토리지에서 통계를 로드합니다.
     */
    load: function () {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          _stats = { ...DEFAULT_STATS, ...JSON.parse(saved) };
          console.log('[StatisticsSystem] 통계 로드 완료');
        }
      } catch (e) {
        console.error('[StatisticsSystem] 통계 로드 실패:', e);
      }
    },

    /**
     * 현재 통계를 로컬 스토리지에 저장합니다.
     */
    save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_stats));
        _stats.lastPlayTime = new Date().toISOString();
      } catch (e) {
        console.error('[StatisticsSystem] 통계 저장 실패:', e);
      }
    },

    /**
     * 모든 통계를 초기화합니다.
     */
    reset: function () {
      _stats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      _stats.firstPlayTime = new Date().toISOString();
      this.save();
      console.log('[StatisticsSystem] 통계 초기화 완료');
      eventBus.emit('statistics_reset', { stats: _stats });
    },

    // ── 통계 조회 ────────────────────────────────────

    /**
     * 일일 통계를 가져옵니다.
     */
    getDailyStats: function () {
      return { ..._stats.daily };
    },

    /**
     * 주간 통계를 가져옵니다.
     */
    getWeeklyStats: function () {
      return { ..._stats.weekly };
    },

    /**
     * 월간 통계를 가져옵니다.
     */
    getMonthlyStats: function () {
      return { ..._stats.monthly };
    },

    /**
     * 누적 통계를 가져옵니다.
     */
    getTotalStats: function () {
      return { ..._stats.total };
    },

    /**
     * 전체 통계를 가져옵니다.
     */
    getAllStats: function () {
      return JSON.parse(JSON.stringify(_stats));
    },

    // ── 통계 업데이트 ────────────────────────────────

    /**
     * 작물 수확 통계를 업데이트합니다.
     */
    recordHarvest: function (cropName, gold) {
      _stats.daily.cropHarvested++;
      _stats.weekly.cropHarvested++;
      _stats.monthly.cropHarvested++;
      _stats.total.cropHarvested++;

      if (gold) {
        _stats.daily.goldEarned += gold;
        _stats.weekly.goldEarned += gold;
        _stats.monthly.goldEarned += gold;
        _stats.total.goldEarned += gold;
      }

      // 작물별 통계
      if (!_stats.crops[cropName]) {
        _stats.crops[cropName] = { harvested: 0, goldEarned: 0 };
      }
      _stats.crops[cropName].harvested++;
      if (gold) {
        _stats.crops[cropName].goldEarned += gold;
      }

      this.save();
      eventBus.emit('statistic_updated', { type: 'harvest', crop: cropName, gold: gold });
    },

    /**
     * 퀘스트 완료 통계를 업데이트합니다.
     */
    recordQuestComplete: function () {
      _stats.daily.questsCompleted++;
      _stats.weekly.questsCompleted++;
      _stats.monthly.questsCompleted++;
      _stats.total.questsCompleted++;
      this.save();
      eventBus.emit('statistic_updated', { type: 'quest' });
    },

    /**
     * 물품 판매 통계를 업데이트합니다.
     */
    recordItemSale: function (itemName, gold) {
      _stats.daily.itemSold++;
      _stats.daily.goldEarned += gold;
      _stats.weekly.goldEarned += gold;
      _stats.monthly.goldEarned += gold;
      _stats.total.goldEarned += gold;
      this.save();
    },

    /**
     * 물품 구매 통계를 업데이트합니다.
     */
    recordItemPurchase: function (itemName, gold) {
      _stats.daily.itemBought++;
      _stats.total.goldSpent += gold;
      this.save();
    },

    /**
     * 동물 제품 수집 통계를 업데이트합니다.
     */
    recordAnimalProduct: function (animalName) {
      _stats.daily.animalProductCollected++;
      _stats.weekly.animalProductCollected++;
      _stats.monthly.animalProductCollected++;
      _stats.total.animalProductCollected++;

      if (!_stats.animals[animalName]) {
        _stats.animals[animalName] = { collected: 0, fed: 0 };
      }
      _stats.animals[animalName].collected++;

      this.save();
    },

    /**
     * 동물 먹이 주기 통계를 업데이트합니다.
     */
    recordAnimalFed: function (animalName) {
      if (!_stats.animals[animalName]) {
        _stats.animals[animalName] = { collected: 0, fed: 0 };
      }
      _stats.animals[animalName].fed++;
      this.save();
    },

    /**
     * 최대 골드를 업데이트합니다.
     */
    updateMaxGold: function (gold) {
      if (gold > _stats.total.maxGold) {
        _stats.total.maxGold = gold;
        this.save();
      }
    },

    /**
     * 레벨 정보를 업데이트합니다.
     */
    updateLevel: function (currentLevel, maxLevel) {
      _stats.total.currentLevel = currentLevel;
      if (maxLevel > _stats.total.maxLevel) {
        _stats.total.maxLevel = maxLevel;
      }
      this.save();
    },

    // ── 통계 리셋 ────────────────────────────────────

    /**
     * 일일 통계를 초기화합니다. (새로운 날에 호출)
     */
    resetDailyStats: function () {
      _stats.daily = {
        cropHarvested: 0,
        goldEarned: 0,
        animalProductCollected: 0,
        questsCompleted: 0,
        itemSold: 0,
        itemBought: 0,
        stepsTaken: 0,
        timeSpent: 0
      };
      console.log('[StatisticsSystem] 일일 통계 초기화 완료');
      eventBus.emit('daily_statistics_reset', { date: new Date().toISOString() });
    },

    // ── 내부 함수 ────────────────────────────────────

    /**
     * 게임 플레이 시간을 추적합니다.
     */
    _startPlaytimeCounter: function () {
      if (!_stats.firstPlayTime) {
        _stats.firstPlayTime = new Date().toISOString();
      }

      _playtimeInterval = setInterval(() => {
        _stats.daily.timeSpent++;
        _stats.total.playtime++;
        if (_stats.daily.timeSpent % 300 === 0) { // 5분마다 저장
          this.save();
        }
      }, 1000);
    },

    /**
     * 날짜가 변경되었는지 확인하고 필요시 일일 통계를 초기화합니다.
     */
    _checkDayReset: function () {
      const today = new Date().toLocaleDateString();
      if (_lastDayReset !== today) {
        _lastDayReset = today;
        this.resetDailyStats();
      }
    },

    /**
     * 이벤트 리스너를 설정합니다.
     */
    _setupEventListeners: function () {
      // 작물 수확
      _eventHandlers.crop_harvested = (data) => {
        if (data
