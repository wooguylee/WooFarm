/**
 * WooFarm - 날씨 시스템 (Weather System)
 * 계절별 날씨 생성, 날씨 효과, 시각적 연출을 관리합니다.
 */
(function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  /** 날씨 유형 목록 */
  var WEATHER_TYPES = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'windy', 'foggy'];

  /** 날씨별 이모지 */
  var WEATHER_EMOJI = {
    sunny: '\u2600\uFE0F',   // ☀️
    cloudy: '\uD83C\uDF24\uFE0F', // 🌤️
    rainy: '\uD83C\uDF27\uFE0F',  // 🌧️
    stormy: '\u26C8\uFE0F',  // ⛈️
    snowy: '\u2744\uFE0F',   // ❄️
    windy: '\uD83C\uDF2C\uFE0F',  // 🌬️
    foggy: '\uD83C\uDF2B\uFE0F'   // 🌫️
  };

  /** 날씨별 한국어 이름 */
  var WEATHER_NAMES_KR = {
    sunny: '맑음',
    cloudy: '흐림',
    rainy: '비',
    stormy: '폭풍',
    snowy: '눈',
    windy: '바람',
    foggy: '안개'
  };

  /**
   * 계절별 날씨 확률표
   * 각 계절마다 날씨 유형의 가중치(%)를 정의합니다.
   * 합계가 100이 되어야 합니다.
   */
  var SEASON_WEATHER_PROB = {
    spring: { sunny: 40, cloudy: 20, rainy: 25, stormy: 5,  snowy: 0,  windy: 10, foggy: 0 },
    summer: { sunny: 50, cloudy: 15, rainy: 15, stormy: 10, snowy: 0,  windy: 10, foggy: 0 },
    fall:   { sunny: 30, cloudy: 25, rainy: 20, stormy: 5,  snowy: 5,  windy: 10, foggy: 5 },
    winter: { sunny: 15, cloudy: 20, rainy: 10, stormy: 5,  snowy: 35, windy: 10, foggy: 5 }
  };

  /** 날씨별 게임 효과 정의 */
  var WEATHER_EFFECTS = {
    sunny:  { watersCrops: false, growthModifier: 1.0, happinessModifier: 1.1 },
    cloudy: { watersCrops: false, growthModifier: 0.9, happinessModifier: 1.0 },
    rainy:  { watersCrops: true,  growthModifier: 1.2, happinessModifier: 0.9 },
    stormy: { watersCrops: true,  growthModifier: 1.2, happinessModifier: 0.8 },
    snowy:  { watersCrops: false, growthModifier: 0.3, happinessModifier: 0.9 },
    windy:  { watersCrops: false, growthModifier: 0.8, happinessModifier: 0.95 },
    foggy:  { watersCrops: false, growthModifier: 0.7, happinessModifier: 0.95 }
  };

  /** 비/눈 파티클 최대 개수 */
  var MAX_PARTICLES = 40;

   window.WeatherSystem = {
     // ── 상태 ──────────────────────────────────────────
     currentWeather: 'sunny',
     forecast: 'sunny',
     _eventHandlers: {},

    // ── 초기화 ────────────────────────────────────────

     /**
      * 날씨 시스템을 초기화하고 이벤트 리스너를 등록합니다.
      */
     init: function () {
       this.cleanup();
       var season = window.TimeSystem ? window.TimeSystem.currentSeason : 'spring';
       this.currentWeather = this.generateWeather(season);
       this.forecast = this.generateWeather(season);

       // 이벤트 리스너 등록
       this._bindEvents();

       console.log('[WeatherSystem] 초기화 완료 - 현재: ' +
         WEATHER_NAMES_KR[this.currentWeather] + ', 예보: ' +
         WEATHER_NAMES_KR[this.forecast]);
     },

     /**
      * 날씨 시스템을 정리합니다.
      */
     cleanup: function () {
       if (this._eventHandlers) {
         Object.keys(this._eventHandlers).forEach(key => {
           if (this._eventHandlers[key]) {
             eventBus.off(key, this._eventHandlers[key]);
           }
         });
         this._eventHandlers = {};
       }
       console.log('[WeatherSystem] 정리 완료');
     },

    // ── 날씨 생성 ────────────────────────────────────

    /**
     * 계절 확률표에 따라 무작위 날씨를 생성합니다.
     * @param {string} season - 계절 이름
     * @returns {string} 날씨 유형
     */
    generateWeather: function (season) {
      var probs = SEASON_WEATHER_PROB[season];
      if (!probs) {
        console.warn('[WeatherSystem] 알 수 없는 계절: ' + season + ', 기본값 사용');
        probs = SEASON_WEATHER_PROB.spring;
      }

      // 가중치 기반 랜덤 선택
      var roll = Math.random() * 100;
      var cumulative = 0;

      for (var i = 0; i < WEATHER_TYPES.length; i++) {
        var type = WEATHER_TYPES[i];
        cumulative += (probs[type] || 0);
        if (roll < cumulative) {
          return type;
        }
      }

      // 부동소수점 오차 안전장치
      return 'sunny';
    },

    /**
     * 하루를 넘기며 날씨를 갱신합니다.
     * 현재 날씨 = 어제의 예보, 새 예보를 생성합니다.
     */
    advanceDay: function () {
      var prevWeather = this.currentWeather;
      this.currentWeather = this.forecast;

      var season = window.TimeSystem ? window.TimeSystem.currentSeason : 'spring';
      this.forecast = this.generateWeather(season);

      // 날씨가 바뀌었을 때만 이벤트 발생
      if (prevWeather !== this.currentWeather) {
        eventBus.emit('weather_changed', {
          weather: this.currentWeather,
          previous: prevWeather,
          forecast: this.forecast,
          effects: this.getWeatherEffects()
        });
      }

      // 시각 효과 적용
      this.applyWeatherVisuals();

      console.log('[WeatherSystem] 날씨 갱신 - 현재: ' +
        WEATHER_NAMES_KR[this.currentWeather] + ', 내일 예보: ' +
        WEATHER_NAMES_KR[this.forecast]);
    },

    // ── 조회 메서드 ───────────────────────────────────

    /**
     * 현재 날씨를 반환합니다.
     * @returns {string}
     */
    getCurrentWeather: function () {
      return this.currentWeather;
    },

    /**
     * 내일 날씨 예보를 반환합니다.
     * @returns {string}
     */
    getForecast: function () {
      return this.forecast;
    },

    /**
     * 현재 날씨에 해당하는 이모지를 반환합니다.
     * @returns {string}
     */
    getWeatherEmoji: function () {
      return WEATHER_EMOJI[this.currentWeather] || '\u2600\uFE0F';
    },

    /**
     * 현재 날씨의 한국어 이름을 반환합니다.
     * @returns {string}
     */
    getWeatherName: function () {
      return WEATHER_NAMES_KR[this.currentWeather] || this.currentWeather;
    },

    /**
     * 현재 날씨의 게임 효과를 반환합니다.
     * @returns {{ watersCrops: boolean, growthModifier: number, happinessModifier: number }}
     */
    getWeatherEffects: function () {
      var effects = WEATHER_EFFECTS[this.currentWeather];
      if (!effects) {
        return { watersCrops: false, growthModifier: 1.0, happinessModifier: 1.0 };
      }
      // 원본 오염 방지를 위해 복사본 반환
      return {
        watersCrops: effects.watersCrops,
        growthModifier: effects.growthModifier,
        happinessModifier: effects.happinessModifier
      };
    },

    // ── 시각 효과 ─────────────────────────────────────

    /**
     * DOM에 날씨 시각 효과를 적용합니다.
     * - 날씨 레이어에 파티클(비/눈) 추가
     * - 시간대에 따른 오버레이 조정
     */
    applyWeatherVisuals: function () {
      this._applyWeatherParticles();
      this._applyTimeOverlay();
    },

    // ── 저장/불러오기 ────────────────────────────────

    /**
     * 직렬화 가능한 상태를 반환합니다.
     * @returns {object}
     */
    getState: function () {
      return {
        currentWeather: this.currentWeather,
        forecast: this.forecast
      };
    },

    /**
     * 저장된 상태를 복원합니다.
     * @param {object} state
     */
    loadState: function (state) {
      if (!state) return;
      this.currentWeather = state.currentWeather || 'sunny';
      this.forecast = state.forecast || 'sunny';
      this.applyWeatherVisuals();
      console.log('[WeatherSystem] 상태 복원 완료');
    },

    // ── 내부 헬퍼 ────────────────────────────────────

    /**
     * @private 이벤트 리스너를 바인딩합니다.
     */
     _bindEvents: function () {
       var self = this;

       // 새 하루 시작 시 날씨 갱신
       this._eventHandlers.day_start = function () {
         self.advanceDay();
       };
       eventBus.on('day_start', this._eventHandlers.day_start);

       // 시간 변경 시 시간대 시각 효과 갱신
       this._eventHandlers.hour_changed = function () {
         self._applyTimeOverlay();
       };
       eventBus.on('hour_changed', this._eventHandlers.hour_changed);
     },

    /**
     * @private 날씨 파티클(비/눈)을 #weather-layer에 렌더링합니다.
     */
    _applyWeatherParticles: function () {
      var weatherLayer = document.getElementById('weather-layer');
      if (!weatherLayer) return;

      // 기존 파티클 제거
      weatherLayer.innerHTML = '';

      // 날씨 CSS 클래스 초기화
      weatherLayer.className = 'weather-layer';
      weatherLayer.classList.add('weather-' + this.currentWeather);

      // 비 파티클 생성
      if (this.currentWeather === 'rainy' || this.currentWeather === 'stormy') {
        this._createParticles(weatherLayer, 'rain-drop', MAX_PARTICLES);
      }
      // 눈 파티클 생성
      else if (this.currentWeather === 'snowy') {
        this._createParticles(weatherLayer, 'snowflake', MAX_PARTICLES);
      }
      // 안개 오버레이
      else if (this.currentWeather === 'foggy') {
        var fogOverlay = document.createElement('div');
        fogOverlay.className = 'fog-overlay';
        weatherLayer.appendChild(fogOverlay);
      }
    },

    /**
     * @private 파티클 요소들을 생성합니다.
     * @param {HTMLElement} container - 부모 요소
     * @param {string} className - CSS 클래스 이름
     * @param {number} count - 생성할 파티클 수
     */
    _createParticles: function (container, className, count) {
      for (var i = 0; i < count; i++) {
        var particle = document.createElement('div');
        particle.className = className;
        // 랜덤 위치와 애니메이션 딜레이
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = (Math.random() * 2).toFixed(2) + 's';
        particle.style.animationDuration = (0.5 + Math.random() * 1.5).toFixed(2) + 's';
        // 폭풍일 때 바람 효과를 위한 추가 기울기
        if (this.currentWeather === 'stormy') {
          particle.style.transform = 'rotate(' + (15 + Math.random() * 15) + 'deg)';
        }
        container.appendChild(particle);
      }
    },

    /**
     * @private 시간대에 따른 화면 오버레이(틴트)를 적용합니다.
     */
    _applyTimeOverlay: function () {
      var overlay = document.getElementById('time-overlay');
      if (!overlay) return;

      var timeOfDay = window.TimeSystem ? window.TimeSystem.getTimeOfDay() : 'morning';
      var hour = window.TimeSystem ? window.TimeSystem.currentHour : 12;

      // 기존 시간대 클래스 제거
      overlay.classList.remove('time-morning', 'time-afternoon', 'time-evening', 'time-night');

      // 시간대별 오버레이 설정
      switch (timeOfDay) {
        case 'morning':
          overlay.classList.add('time-morning');
          // 이른 아침일수록 약간 어둡게
          overlay.style.opacity = Math.max(0, 0.15 - (hour - 6) * 0.025);
          break;

        case 'afternoon':
          overlay.classList.add('time-afternoon');
          overlay.style.opacity = '0'; // 낮에는 오버레이 없음
          break;

        case 'evening':
          overlay.classList.add('time-evening');
          // 저녁으로 갈수록 점점 어둡게
          var eveningProgress = (hour - 18) / 4; // 0.0 ~ 1.0
          overlay.style.opacity = (0.1 + eveningProgress * 0.4).toFixed(2);
          break;

        default:
          overlay.style.opacity = '0';
      }
    }
  };

  console.log('[WeatherSystem] 모듈 로드 완료');
})();
