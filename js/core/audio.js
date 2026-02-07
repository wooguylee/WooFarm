/**
 * WooFarm - 오디오 매니저
 * Web Audio API를 사용한 절차적(procedural) 사운드 생성 시스템
 * 외부 오디오 파일 없이 순수 코드로 모든 사운드를 생성한다.
 */
window.AudioManager = (function () {
  /** @type {AudioContext|null} 오디오 컨텍스트 */
  var ctx = null;

  /** @type {GainNode|null} SFX 마스터 볼륨 노드 */
  var sfxGain = null;

  /** @type {GainNode|null} BGM 마스터 볼륨 노드 */
  var bgmGain = null;

  /** @type {number} SFX 볼륨 (0~1) */
  var sfxVolume = 0.5;

  /** @type {number} BGM 볼륨 (0~1) */
  var bgmVolume = 0.3;

  /** @type {boolean} 초기화 완료 여부 */
  var initialized = false;

  /** @type {Array} 현재 재생 중인 BGM 오실레이터들 */
  var bgmOscillators = [];

  /** @type {number|null} BGM 스케줄링 타이머 */
  var bgmTimer = null;

  /** @type {boolean} BGM 재생 중 여부 */
  var bgmPlaying = false;

  // ===== 음계 주파수 테이블 (4옥타브 기준) =====
  var NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
  };

  /**
   * AudioContext를 초기화한다.
   * 브라우저 정책상 사용자 인터랙션 이후 호출해야 한다.
   */
  function init() {
    if (initialized) return;

    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[AudioManager] Web Audio API가 지원되지 않습니다.');
        return;
      }

      ctx = new AudioCtx();

      // SFX 마스터 게인 노드 생성
      sfxGain = ctx.createGain();
      sfxGain.gain.value = sfxVolume;
      sfxGain.connect(ctx.destination);

      // BGM 마스터 게인 노드 생성
      bgmGain = ctx.createGain();
      bgmGain.gain.value = bgmVolume;
      bgmGain.connect(ctx.destination);

      initialized = true;
      console.log('[AudioManager] 초기화 완료');
    } catch (err) {
      console.error('[AudioManager] 초기화 실패:', err);
    }
  }

  /**
   * AudioContext가 생성되고 resume 상태인지 확인한다.
   * 필요 시 init()을 호출하고 suspended 상태면 resume한다.
   * @returns {boolean} 컨텍스트 사용 가능 여부
   */
  function ensureContext() {
    if (!initialized) {
      init();
    }
    if (!ctx) return false;

    // suspended 상태면 resume 시도 (브라우저 자동재생 정책 대응)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx.state !== 'closed';
  }

  // ===== 사운드 생성 헬퍼 함수들 =====

  /**
   * 단일 음을 재생하는 오실레이터를 생성한다.
   * @param {number} freq - 주파수 (Hz)
   * @param {string} type - 파형 ('sine', 'square', 'sawtooth', 'triangle')
   * @param {number} startTime - 시작 시간
   * @param {number} duration - 지속 시간 (초)
   * @param {number} volume - 볼륨 (0~1)
   * @param {GainNode} destination - 연결할 게인 노드
   */
  function playTone(freq, type, startTime, duration, volume, destination) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // 엔벨로프: 부드러운 어택과 릴리스로 클릭 노이즈 방지
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + Math.min(0.02, duration * 0.1));
    gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * 화이트 노이즈 버퍼를 생성한다 (물 소리 등에 사용).
   * @param {number} duration - 지속 시간 (초)
   * @returns {AudioBuffer}
   */
  function createNoiseBuffer(duration) {
    var sampleRate = ctx.sampleRate;
    var length = sampleRate * duration;
    var buffer = ctx.createBuffer(1, length, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ===== 개별 사운드 생성 함수들 =====

  /** 씨앗 심기 - 짧고 둔탁한 저음 */
  function soundPlant() {
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /** 물주기 - 노이즈 + 필터로 물 튀기는 소리 */
  function soundWater() {
    var t = ctx.currentTime;
    var duration = 0.3;

    // 노이즈 소스 (물방울 질감)
    var noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(duration);

    // 밴드패스 필터로 물 느낌 연출
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + duration);
    filter.Q.value = 2;

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(t);
    noise.stop(t + duration + 0.05);

    // 물방울 톤 추가
    playTone(800, 'sine', t, 0.08, 0.15, sfxGain);
    playTone(600, 'sine', t + 0.1, 0.08, 0.1, sfxGain);
  }

  /** 수확 - 밝고 경쾌한 상승 차임 */
  function soundHarvest() {
    var t = ctx.currentTime;
    var notes = [NOTE.C5, NOTE.E5, NOTE.G5];
    for (var i = 0; i < notes.length; i++) {
      playTone(notes[i], 'sine', t + i * 0.08, 0.2, 0.25, sfxGain);
      playTone(notes[i] * 2, 'sine', t + i * 0.08, 0.15, 0.1, sfxGain); // 하모닉스
    }
  }

  /** 구매 - 동전 부딪히는 소리 */
  function soundPurchase() {
    var t = ctx.currentTime;
    playTone(1200, 'square', t, 0.06, 0.15, sfxGain);
    playTone(1800, 'square', t + 0.06, 0.08, 0.12, sfxGain);
    playTone(2400, 'sine', t + 0.05, 0.12, 0.1, sfxGain);
  }

  /** 판매 - 금전등록기 딩 소리 */
  function soundSell() {
    var t = ctx.currentTime;
    playTone(800, 'sine', t, 0.05, 0.2, sfxGain);
    playTone(1200, 'sine', t + 0.05, 0.15, 0.25, sfxGain);

    // 짧은 벨 소리 질감
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, t + 0.1);
    gain.gain.setValueAtTime(0.15, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t + 0.1);
    osc.stop(t + 0.45);
  }

  /** 레벨업 - 화려한 팡파르 (다중 상승 음) */
  function soundLevelup() {
    var t = ctx.currentTime;
    var fanfare = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.E5];
    for (var i = 0; i < fanfare.length; i++) {
      playTone(fanfare[i], 'triangle', t + i * 0.1, 0.3, 0.2, sfxGain);
      playTone(fanfare[i] * 1.5, 'sine', t + i * 0.1, 0.25, 0.1, sfxGain);
    }
    // 마무리 지속음
    playTone(NOTE.C5, 'sine', t + 0.5, 0.5, 0.15, sfxGain);
    playTone(NOTE.G5, 'sine', t + 0.5, 0.5, 0.1, sfxGain);
  }

  /** 클릭 - 간단한 클릭음 */
  function soundClick() {
    var t = ctx.currentTime;
    playTone(600, 'square', t, 0.04, 0.15, sfxGain);
  }

  /** 에러 - 경고 버저음 */
  function soundError() {
    var t = ctx.currentTime;
    playTone(200, 'sawtooth', t, 0.15, 0.2, sfxGain);
    playTone(150, 'sawtooth', t + 0.15, 0.2, 0.2, sfxGain);
  }

  /** 알림 - 부드러운 딩 소리 */
  function soundNotification() {
    var t = ctx.currentTime;
    playTone(NOTE.E5, 'sine', t, 0.15, 0.2, sfxGain);
    playTone(NOTE.G5, 'sine', t + 0.12, 0.2, 0.15, sfxGain);
  }

  /** 동물 행복 - 경쾌한 짧은 멜로디 */
  function soundAnimalHappy() {
    var t = ctx.currentTime;
    var melody = [NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5];
    for (var i = 0; i < melody.length; i++) {
      playTone(melody[i], 'triangle', t + i * 0.07, 0.15, 0.2, sfxGain);
    }
  }

  /** 퀘스트 완료 - 승리의 짧은 팡파르 */
  function soundQuestComplete() {
    var t = ctx.currentTime;
    var notes = [NOTE.G4, NOTE.C5, NOTE.E5, NOTE.G5];
    for (var i = 0; i < notes.length; i++) {
      playTone(notes[i], 'triangle', t + i * 0.12, 0.25, 0.2, sfxGain);
    }
    // 화음으로 마무리
    playTone(NOTE.C5, 'sine', t + 0.48, 0.4, 0.15, sfxGain);
    playTone(NOTE.E5, 'sine', t + 0.48, 0.4, 0.12, sfxGain);
    playTone(NOTE.G5, 'sine', t + 0.48, 0.4, 0.1, sfxGain);
  }

  /** 하루 종료 - 평화로운 저녁 차임 */
  function soundDayEnd() {
    var t = ctx.currentTime;
    var chime = [NOTE.E4, NOTE.C4, NOTE.G3, NOTE.C4];
    for (var i = 0; i < chime.length; i++) {
      playTone(chime[i], 'sine', t + i * 0.25, 0.5, 0.2, sfxGain);
      playTone(chime[i] * 2, 'sine', t + i * 0.25, 0.4, 0.08, sfxGain); // 옥타브 하모닉스
    }
  }

  // ===== 사운드 이름 -> 함수 매핑 =====
  var soundMap = {
    'plant': soundPlant,
    'water': soundWater,
    'harvest': soundHarvest,
    'purchase': soundPurchase,
    'sell': soundSell,
    'levelup': soundLevelup,
    'click': soundClick,
    'error': soundError,
    'notification': soundNotification,
    'animal_happy': soundAnimalHappy,
    'quest_complete': soundQuestComplete,
    'day_end': soundDayEnd
  };

  /**
   * 이름으로 효과음을 재생한다.
   * @param {string} soundName - 사운드 이름
   */
  function playSound(soundName) {
    if (!ensureContext()) return;

    var fn = soundMap[soundName];
    if (!fn) {
      console.warn('[AudioManager] 알 수 없는 사운드:', soundName);
      return;
    }

    try {
      fn();
    } catch (err) {
      console.error('[AudioManager] 사운드 재생 오류 (' + soundName + '):', err);
    }
  }

  // ===== BGM (배경 음악) =====

  /**
   * 평화로운 농장 배경 음악을 절차적으로 생성하여 반복 재생한다.
   * 간단한 펜타토닉 멜로디 패턴을 사용한다.
   */
  function playBGM() {
    if (!ensureContext()) return;
    if (bgmPlaying) return;

    bgmPlaying = true;

    // 멜로디 패턴 (펜타토닉 스케일 기반 - 평화로운 느낌)
    var melodyNotes = [
      NOTE.C4, NOTE.E4, NOTE.G4, NOTE.A4,
      NOTE.G4, NOTE.E4, NOTE.D4, NOTE.C4,
      NOTE.D4, NOTE.E4, NOTE.G4, NOTE.E4,
      NOTE.C4, NOTE.D4, NOTE.E4, NOTE.C4
    ];

    // 베이스 패턴 (루트 음)
    var bassNotes = [
      NOTE.C3, NOTE.C3, NOTE.G3, NOTE.G3,
      NOTE.A3, NOTE.A3, NOTE.G3, NOTE.G3,
      NOTE.F3, NOTE.F3, NOTE.E3, NOTE.E3,
      NOTE.G3, NOTE.G3, NOTE.C3, NOTE.C3
    ];

    var noteLength = 0.35; // 각 음의 길이 (초)
    var totalDuration = melodyNotes.length * noteLength; // 한 루프 전체 길이

    /** 하나의 BGM 루프를 스케줄링한다 */
    function scheduleLoop() {
      if (!bgmPlaying || !ctx) return;

      var startTime = ctx.currentTime + 0.1;

      // 멜로디 라인 (부드러운 사인파)
      for (var i = 0; i < melodyNotes.length; i++) {
        playTone(melodyNotes[i], 'sine', startTime + i * noteLength, noteLength * 0.8, 0.12, bgmGain);
      }

      // 베이스 라인 (삼각파로 따뜻한 저음)
      for (var j = 0; j < bassNotes.length; j++) {
        playTone(bassNotes[j], 'triangle', startTime + j * noteLength, noteLength * 0.9, 0.08, bgmGain);
      }

      // 루프 완료 직전에 다음 루프를 예약한다
      bgmTimer = setTimeout(function () {
        scheduleLoop();
      }, totalDuration * 1000 - 100); // 약간 이른 타이밍에 다음 루프 예약
    }

    scheduleLoop();
    console.log('[AudioManager] BGM 재생 시작');
  }

  /** 배경 음악을 정지한다 */
  function stopBGM() {
    bgmPlaying = false;

    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }

    // BGM 게인을 페이드아웃하여 부드럽게 정지
    if (bgmGain && ctx) {
      bgmGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      // 페이드아웃 후 볼륨 복원
      setTimeout(function () {
        if (bgmGain) {
          bgmGain.gain.setValueAtTime(bgmVolume, ctx.currentTime);
        }
      }, 600);
    }

    console.log('[AudioManager] BGM 정지');
  }

  /**
   * SFX 볼륨을 설정한다.
   * @param {number} vol - 볼륨 (0~1)
   */
  function setSFXVolume(vol) {
    sfxVolume = Math.max(0, Math.min(1, vol));
    if (sfxGain) {
      sfxGain.gain.setValueAtTime(sfxVolume, ctx.currentTime);
    }
  }

  /**
   * BGM 볼륨을 설정한다.
   * @param {number} vol - 볼륨 (0~1)
   */
  function setBGMVolume(vol) {
    bgmVolume = Math.max(0, Math.min(1, vol));
    if (bgmGain) {
      bgmGain.gain.setValueAtTime(bgmVolume, ctx.currentTime);
    }
  }

  // ===== 공개 API =====
  return {
    init: init,
    ensureContext: ensureContext,
    playSound: playSound,
    playBGM: playBGM,
    stopBGM: stopBGM,
    setSFXVolume: setSFXVolume,
    setBGMVolume: setBGMVolume,

    /** @type {number} 현재 SFX 볼륨 (getter) */
    get sfxVolume() {
      return sfxVolume;
    },
    /** @type {number} 현재 BGM 볼륨 (getter) */
    get bgmVolume() {
      return bgmVolume;
    }
  };
})();
