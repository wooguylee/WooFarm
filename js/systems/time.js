/**
 * WooFarm - 시간 시스템 (Time System)
 * 게임 내 시간 흐름, 계절 변화, 하루 주기를 관리합니다.
 */
(function () {
  'use strict';

  const eventBus = window.Utils.eventBus;

  /** 계절 목록 */
  const SEASONS = ['spring', 'summer', 'fall', 'winter'];

  /** 한국어 계절 이름 */
  const SEASON_NAMES_KR = {
    spring: '봄',
    summer: '여름',
    fall: '가을',
    winter: '겨울'
  };

  /** 시간대 구분 기준 (시) */
  const TIME_OF_DAY = {
    morning: { start: 6, end: 11 },
    afternoon: { start: 12, end: 17 },
    evening: { start: 18, end: 21 }
  };

  window.TimeSystem = {
    // ── 상수 ──────────────────────────────────────────
    HOURS_PER_DAY: 18,        // 활동 시간 (06:00 ~ 23:59)
    DAYS_PER_SEASON: 28,      // 한 계절 = 28일
    MINUTES_PER_TICK: 10,     // 틱 당 게임 내 경과 분
    BASE_TICK_INTERVAL: 2000, // 기본 틱 간격(ms), speed=1 기준

    // ── 상태 ──────────────────────────────────────────
    currentDay: 1,
    currentSeason: 'spring',
    currentHour: 6,
    currentMinute: 0,
    gameSpeed: 1,
    paused: false,
    totalDays: 1,

    /** @private 틱 타이머 ID */
    _tickTimer: null,

     // ── 초기화 ────────────────────────────────────────

    /**
     * 시간 시스템을 초기 상태로 설정합니다.
     */
    init: function () {
      this.cleanup();
      this.currentDay = 1;
      this.currentSeason = 'spring';
      this.currentHour = 6;
      this.currentMinute = 0;
      this.gameSpeed = 1;
      this.paused = false;
      this.totalDays = 1;
      this._tickTimer = null;

      console.log('[TimeSystem] 초기화 완료');
    },

    /**
     * 시간 시스템을 정리합니다.
     */
    cleanup: function () {
      this._stopTimer();
      console.log('[TimeSystem] 정리 완료');
    },

    /**
     * 시간 틱 인터벌을 시작합니다.
     */
    start: function () {
      this._stopTimer();
      this._startTimer();
      this.paused = false;

      // 첫 번째 하루의 시작을 알림
      eventBus.emit('day_start', this._buildEventData());
      console.log('[TimeSystem] 시간 흐름 시작');
    },

    // ── 일시 정지 / 재개 ──────────────────────────────

    /**
     * 시간 흐름을 일시 정지합니다.
     */
    pause: function () {
      if (this.paused) return;
      this.paused = true;
      this._stopTimer();
      console.log('[TimeSystem] 일시 정지');
    },

    /**
     * 시간 흐름을 재개합니다.
     */
    resume: function () {
      if (!this.paused) return;
      this.paused = false;
      this._startTimer();
      console.log('[TimeSystem] 재개');
    },

    // ── 속도 조절 ─────────────────────────────────────

    /**
     * 게임 속도를 변경합니다.
     * @param {number} speed - 1(느림) ~ 5(빠름)
     */
    setSpeed: function (speed) {
      speed = Math.max(1, Math.min(5, Math.floor(speed)));
      if (speed === this.gameSpeed) return;

      this.gameSpeed = speed;

      // 타이머가 돌고 있으면 재시작
      if (!this.paused && this._tickTimer !== null) {
        this._stopTimer();
        this._startTimer();
      }
      console.log('[TimeSystem] 속도 변경: x' + speed);
    },

    // ── 핵심 틱 로직 ──────────────────────────────────

    /**
     * 한 틱을 처리하여 게임 시간을 전진시킵니다.
     */
    tick: function () {
      if (this.paused) return;

      var prevHour = this.currentHour;

      // 분 증가
      this.currentMinute += this.MINUTES_PER_TICK;

      // 시 넘김 처리
      if (this.currentMinute >= 60) {
        this.currentHour += Math.floor(this.currentMinute / 60);
        this.currentMinute = this.currentMinute % 60;
      }

      // 매 틱 이벤트
      eventBus.emit('time_tick', this._buildEventData());

      // 시간이 변했으면 시간 변경 이벤트
      if (this.currentHour !== prevHour) {
        eventBus.emit('hour_changed', this._buildEventData());
      }

      // 자정(22시) 이상 도달 → 하루 종료
      if (this.currentHour >= 22) {
        this._advanceDay();
      }
    },

    /**
     * 현재 하루를 강제 종료합니다 (밤으로 건너뛰기).
     */
    endDay: function () {
      this.currentHour = 22;
      this.currentMinute = 0;
      eventBus.emit('day_end', this._buildEventData());
      this._advanceDay();
    },

    // ── 조회 메서드 ───────────────────────────────────

    /**
     * 현재 시간대를 반환합니다.
     * @returns {'morning'|'afternoon'|'evening'}
     */
    getTimeOfDay: function () {
      var h = this.currentHour;
      if (h >= TIME_OF_DAY.morning.start && h <= TIME_OF_DAY.morning.end) return 'morning';
      if (h >= TIME_OF_DAY.afternoon.start && h <= TIME_OF_DAY.afternoon.end) return 'afternoon';
      return 'evening';
    },

    /**
     * 계절 인덱스를 반환합니다 (0=봄 ~ 3=겨울).
     * @returns {number}
     */
    getSeasonIndex: function () {
      return SEASONS.indexOf(this.currentSeason);
    },

    /**
     * 현재 계절 내 일수를 반환합니다.
     * @returns {number}
     */
    getDayOfSeason: function () {
      return this.currentDay;
    },

    /**
     * 총 플레이 일수를 반환합니다.
     * @returns {number}
     */
    getTotalDays: function () {
      return this.totalDays;
    },

    /**
     * 표시용 시간 문자열을 반환합니다.
     * @returns {string} "HH:MM" 형식
     */
    getDisplayTime: function () {
      var hh = String(this.currentHour).padStart(2, '0');
      var mm = String(this.currentMinute).padStart(2, '0');
      return hh + ':' + mm;
    },

    /**
     * 현재 계절의 한국어 이름을 반환합니다.
     * @returns {string}
     */
    getSeasonName: function () {
      return SEASON_NAMES_KR[this.currentSeason] || this.currentSeason;
    },

    // ── 저장/불러오기 ────────────────────────────────

    /**
     * 직렬화 가능한 상태를 반환합니다.
     * @returns {object}
     */
    getState: function () {
      return {
        currentDay: this.currentDay,
        currentSeason: this.currentSeason,
        currentHour: this.currentHour,
        currentMinute: this.currentMinute,
        gameSpeed: this.gameSpeed,
        totalDays: this.totalDays
      };
    },

    /**
     * 저장된 상태를 복원합니다.
     * @param {object} state
     */
    loadState: function (state) {
      if (!state) return;
      this.currentDay = state.currentDay || 1;
      this.currentSeason = state.currentSeason || 'spring';
      this.currentHour = state.currentHour || 6;
      this.currentMinute = state.currentMinute || 0;
      this.gameSpeed = state.gameSpeed || 1;
      this.totalDays = state.totalDays || 1;
      console.log('[TimeSystem] 상태 복원 완료 - ' + this.getSeasonName() + ' ' + this.currentDay + '일');
    },

    // ── 내부 헬퍼 ────────────────────────────────────

    /**
     * @private 하루를 넘기고 새 날을 시작합니다.
     */
    _advanceDay: function () {
      // 하루 종료 이벤트
      eventBus.emit('day_end', this._buildEventData());

      // 다음 날로
      this.currentDay++;
      this.totalDays++;

      // 계절 전환 확인
      if (this.currentDay > this.DAYS_PER_SEASON) {
        this.currentDay = 1;
        var seasonIdx = (this.getSeasonIndex() + 1) % SEASONS.length;
        this.currentSeason = SEASONS[seasonIdx];
        eventBus.emit('season_changed', this._buildEventData());
        console.log('[TimeSystem] 계절 변경: ' + this.getSeasonName());
      }

      // 시간 초기화 (아침 6시)
      this.currentHour = 6;
      this.currentMinute = 0;

      // 새 날 시작 이벤트
      eventBus.emit('day_start', this._buildEventData());
      console.log('[TimeSystem] ' + this.totalDays + '일째 시작 (' + this.getSeasonName() + ' ' + this.currentDay + '일)');
    },

    /**
     * @private 현재 틱 간격(ms)을 계산합니다.
     * @returns {number}
     */
    _getTickInterval: function () {
      // speed 1 = 2000ms, speed 5 = 400ms
      return this.BASE_TICK_INTERVAL / this.gameSpeed;
    },

    /**
     * @private 틱 타이머를 시작합니다.
     */
    _startTimer: function () {
      var self = this;
      this._tickTimer = setInterval(function () {
        self.tick();
      }, this._getTickInterval());
    },

    /**
     * @private 틱 타이머를 정지합니다.
     */
    _stopTimer: function () {
      if (this._tickTimer !== null) {
        clearInterval(this._tickTimer);
        this._tickTimer = null;
      }
    },

    /**
     * @private 이벤트 데이터 객체를 생성합니다.
     * @returns {object}
     */
    _buildEventData: function () {
      return {
        day: this.currentDay,
        season: this.currentSeason,
        hour: this.currentHour,
        minute: this.currentMinute,
        totalDays: this.totalDays,
        timeOfDay: this.getTimeOfDay(),
        displayTime: this.getDisplayTime()
      };
    }
  };

  console.log('[TimeSystem] 모듈 로드 완료');
})();
