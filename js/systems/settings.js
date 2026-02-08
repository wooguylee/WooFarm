/**
 * WooFarm - 설정 시스템 (Settings System)
 * 게임의 각종 설정을 관리합니다.
 */
(function () {
  'use strict';

  const eventBus = window.Utils.eventBus;
  const STORAGE_KEY = 'woofarm_settings';

  /** 기본 설정값 */
  const DEFAULT_SETTINGS = {
    // 사운드
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,

    // 게임플레이
    gameSpeed: 1, // 1x, 2x, 4x
    autoSaveInterval: 30, // 초 단위
    enableNotifications: true,
    enableScreenShake: true,

    // UI
    showFPS: false,
    showDebugInfo: false,
    textSize: 1.0, // 0.8, 1.0, 1.2
    brightness: 1.0,

    // 접근성
    enableColorBlindMode: false,
    enableHighContrast: false
  };

  let _settings = { ...DEFAULT_SETTINGS };
  let _eventHandlers = {};

  window.SettingsSystem = {
    // ── 초기화 ────────────────────────────────────────

    /**
     * 설정 시스템을 초기화합니다.
     */
    init: function () {
      this.cleanup();
      this.load();
      this._setupEventListeners();
      console.log('[SettingsSystem] 초기화 완료');
      console.log('[SettingsSystem] 이벤트 리스너 정리 완료');
    },

    /**
     * 설정 시스템을 정리합니다.
     */
    cleanup: function () {
      Object.keys(_eventHandlers).forEach(key => {
        const handler = _eventHandlers[key];
        if (handler && typeof handler === 'function') {
          eventBus.off(key, handler);
        }
      });
      _eventHandlers = {};
      console.log('[SettingsSystem] 이벤트 리스너 정리 완료');
    },

    // ── 설정 로드/저장 ────────────────────────────────

    /**
     * 로컬 스토리지에서 설정을 로드합니다.
     */
    load: function () {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          _settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
          console.log('[SettingsSystem] 설정 로드 완료');
        }
      } catch (e) {
        console.error('[SettingsSystem] 설정 로드 실패:', e);
      }
    },

    /**
     * 현재 설정을 로컬 스토리지에 저장합니다.
     */
    save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_settings));
        console.log('[SettingsSystem] 설정 저장 완료');
        eventBus.emit('settings_saved', { settings: _settings });
      } catch (e) {
        console.error('[SettingsSystem] 설정 저장 실패:', e);
      }
    },

    /**
     * 설정을 기본값으로 초기화합니다.
     */
    reset: function () {
      _settings = { ...DEFAULT_SETTINGS };
      this.save();
      console.log('[SettingsSystem] 설정 초기화 완료');
      eventBus.emit('settings_reset', { settings: _settings });
    },

    // ── 설정 접근 ────────────────────────────────────

    /**
     * 특정 설정값을 가져옵니다.
     */
    get: function (key) {
      return _settings[key];
    },

    /**
     * 특정 설정값을 변경합니다.
     */
    set: function (key, value) {
      if (key in _settings) {
        _settings[key] = value;
        this.save();
        eventBus.emit('setting_changed', { key: key, value: value });
        console.log(`[SettingsSystem] ${key} = ${value}`);
      }
    },

    /**
     * 모든 설정을 가져옵니다.
     */
    getAll: function () {
      return { ..._settings };
    },

    /**
     * 여러 설정을 한 번에 변경합니다.
     */
    setMultiple: function (settingsObj) {
      Object.keys(settingsObj).forEach(key => {
        if (key in _settings) {
          _settings[key] = settingsObj[key];
        }
      });
      this.save();
      eventBus.emit('settings_changed_multiple', { settings: _settings });
    },

    // ── 게임 속도 ────────────────────────────────────

    /**
     * 게임 속도를 변경합니다. (1, 2, 4)
     */
    setGameSpeed: function (speed) {
      const validSpeeds = [1, 2, 4];
      if (validSpeeds.includes(speed)) {
        this.set('gameSpeed', speed);
        if (window.TimeSystem) {
          window.TimeSystem.setGameSpeed(speed);
        }
      }
    },

    /**
     * 게임 속도를 가져옵니다.
     */
    getGameSpeed: function () {
      return this.get('gameSpeed');
    },

    /**
     * 게임 속도를 증가시킵니다.
     */
    increaseGameSpeed: function () {
      const current = this.get('gameSpeed');
      const nextSpeed = current === 1 ? 2 : current === 2 ? 4 : 1;
      this.setGameSpeed(nextSpeed);
      console.log(`[SettingsSystem] 게임 속도: ${nextSpeed}x`);
      eventBus.emit('game_speed_changed', { speed: nextSpeed });
    },

    // ── 음량 조절 ────────────────────────────────────

    /**
     * 마스터 볼륨을 설정합니다.
     */
    setMasterVolume: function (volume) {
      const v = Math.max(0, Math.min(1, volume));
      this.set('masterVolume', v);
      if (window.AudioSystem) {
        window.AudioSystem.setMasterVolume(v);
      }
    },

    /**
     * 음악 볼륨을 설정합니다.
     */
    setMusicVolume: function (volume) {
      const v = Math.max(0, Math.min(1, volume));
      this.set('musicVolume', v);
      if (window.AudioSystem) {
        window.AudioSystem.setMusicVolume(v);
      }
    },

    /**
     * 효과음 볼륨을 설정합니다.
     */
    setSFXVolume: function (volume) {
      const v = Math.max(0, Math.min(1, volume));
      this.set('sfxVolume', v);
      if (window.AudioSystem) {
        window.AudioSystem.setSFXVolume(v);
      }
    },

    // ── 내부 함수 ────────────────────────────────────

    /**
     * 이벤트 리스너를 설정합니다.
     */
    _setupEventListeners: function () {
      // 게임 시작 시 설정 적용
      _eventHandlers.game_started = () => {
        if (window.TimeSystem) {
          window.TimeSystem.setGameSpeed(this.get('gameSpeed'));
        }
      };
      eventBus.on('game_started', _eventHandlers.game_started);
    }
  };

  // 전역 단축키 설정
  if (typeof window !== 'undefined') {
    document.addEventListener('keydown', function (e) {
      // Ctrl/Cmd + . 로 게임 속도 변경
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault();
        if (window.SettingsSystem) {
          window.SettingsSystem.increaseGameSpeed();
        }
      }
    });
  }
})();
