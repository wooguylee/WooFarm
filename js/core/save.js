/**
 * WooFarm - 세이브 매니저
 * localStorage를 이용한 게임 데이터 저장/로드 및 랭킹 시스템
 */
window.SaveManager = (function () {
  /** localStorage 저장 키 */
  var SAVE_KEY = 'woofarm_save';
  var RANKING_KEY = 'woofarm_ranking';

  /** 자동 저장 딜레이 (밀리초) */
  var AUTO_SAVE_DELAY = 30000; // 30초

  /** @type {number|null} 자동 저장 디바운스 타이머 */
  var autoSaveTimer = null;

  // ===== 저장 / 로드 =====

  /**
   * 게임 상태를 localStorage에 저장한다.
   * @param {Object} gameState - 저장할 게임 상태 객체
   * @param {Object} gameState.player - 플레이어 정보 { name, level, exp, gold, day, season, totalEarnings, totalHarvests }
   * @param {Object} gameState.farm - 농장 정보 { grid (2D 타일 배열), upgrades }
   * @param {Object} gameState.inventory - 인벤토리 { items 배열 }
   * @param {Object} gameState.animals - 동물 { owned 배열 }
   * @param {Object} gameState.quests - 퀘스트 { active, completed }
   * @param {Object} gameState.decorations - 장식 { placed 배열 }
   * @param {Object} gameState.settings - 설정 { gameSpeed, sfxVolume, bgmVolume }
   * @returns {boolean} 저장 성공 여부
   */
  function save(gameState) {
    try {
      if (!gameState) {
        console.warn('[SaveManager] 저장할 게임 상태가 없습니다.');
        return false;
      }

      // 저장 시점 타임스탬프 추가
      var saveData = {
        player: gameState.player || {},
        farm: gameState.farm || {},
        inventory: gameState.inventory || {},
        animals: gameState.animals || {},
        quests: gameState.quests || {},
        decorations: gameState.decorations || {},
        settings: gameState.settings || {},
        timestamp: Date.now()
      };

      var json = JSON.stringify(saveData);
      localStorage.setItem(SAVE_KEY, json);

      console.log('[SaveManager] 게임 저장 완료 (' + _formatBytes(json.length) + ')');
      return true;
    } catch (err) {
      console.error('[SaveManager] 저장 실패:', err);
      // localStorage 용량 초과 등의 경우 처리
      if (err.name === 'QuotaExceededError') {
        console.error('[SaveManager] localStorage 용량이 부족합니다.');
      }
      return false;
    }
  }

  /**
   * localStorage에서 게임 상태를 로드한다.
   * @returns {Object|null} 파싱된 게임 상태 객체, 또는 저장 데이터가 없으면 null
   */
  function load() {
    try {
      var json = localStorage.getItem(SAVE_KEY);
      if (!json) {
        console.log('[SaveManager] 저장된 데이터가 없습니다.');
        return null;
      }

      var saveData = JSON.parse(json);

      // 기본 유효성 검증
      if (!saveData || typeof saveData !== 'object') {
        console.warn('[SaveManager] 저장 데이터 형식이 올바르지 않습니다.');
        return null;
      }

      console.log('[SaveManager] 게임 로드 완료 (저장 시각: ' + new Date(saveData.timestamp).toLocaleString() + ')');
      return saveData;
    } catch (err) {
      console.error('[SaveManager] 로드 실패:', err);
      return null;
    }
  }

  /**
   * 저장 데이터 존재 여부를 확인한다.
   * @returns {boolean}
   */
  function hasSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (err) {
      console.error('[SaveManager] 저장 확인 실패:', err);
      return false;
    }
  }

  /**
   * 저장 데이터를 삭제한다.
   * @returns {boolean} 삭제 성공 여부
   */
  function deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      console.log('[SaveManager] 저장 데이터 삭제 완료');
      return true;
    } catch (err) {
      console.error('[SaveManager] 저장 삭제 실패:', err);
      return false;
    }
  }

  // ===== 내보내기 / 가져오기 =====

  /**
   * 현재 저장 데이터를 Base64 인코딩 문자열로 내보낸다.
   * 다른 브라우저나 기기로 데이터를 옮길 때 사용한다.
   * @returns {string|null} Base64 인코딩된 세이브 문자열, 또는 실패 시 null
   */
  function exportSave() {
    try {
      var json = localStorage.getItem(SAVE_KEY);
      if (!json) {
        console.warn('[SaveManager] 내보낼 저장 데이터가 없습니다.');
        return null;
      }

      // UTF-8 문자열을 안전하게 Base64 인코딩
      var encoded = btoa(unescape(encodeURIComponent(json)));
      console.log('[SaveManager] 세이브 데이터 내보내기 완료');
      return encoded;
    } catch (err) {
      console.error('[SaveManager] 내보내기 실패:', err);
      return null;
    }
  }

  /**
   * Base64 인코딩된 세이브 문자열을 가져와서 localStorage에 저장한다.
   * @param {string} str - Base64 인코딩된 세이브 문자열
   * @returns {boolean} 가져오기 성공 여부
   */
  function importSave(str) {
    try {
      if (!str || typeof str !== 'string') {
        console.warn('[SaveManager] 가져올 데이터가 유효하지 않습니다.');
        return false;
      }

      // Base64 디코딩
      var json = decodeURIComponent(escape(atob(str)));

      // JSON 유효성 검증
      var parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') {
        console.warn('[SaveManager] 가져온 데이터 형식이 올바르지 않습니다.');
        return false;
      }

      // 필수 필드 존재 확인
      if (!parsed.timestamp) {
        console.warn('[SaveManager] 유효한 WooFarm 세이브 데이터가 아닙니다.');
        return false;
      }

      localStorage.setItem(SAVE_KEY, json);
      console.log('[SaveManager] 세이브 데이터 가져오기 완료');
      return true;
    } catch (err) {
      console.error('[SaveManager] 가져오기 실패:', err);
      return false;
    }
  }

  // ===== 자동 저장 =====

  /**
   * 디바운스된 자동 저장을 수행한다.
   * 30초 이내에 다시 호출되면 타이머가 리셋된다.
   * @param {Object} gameState - 저장할 게임 상태 객체
   */
  function autoSave(gameState) {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    autoSaveTimer = setTimeout(function () {
      var success = save(gameState);
      if (success) {
        console.log('[SaveManager] 자동 저장 완료');
        // 이벤트 버스가 있으면 자동 저장 완료 알림
        if (window.Utils && window.Utils.eventBus) {
          window.Utils.eventBus.emit('autoSaved', { timestamp: Date.now() });
        }
      }
      autoSaveTimer = null;
    }, AUTO_SAVE_DELAY);
  }

  // ===== 랭킹 시스템 =====

  /**
   * 랭킹 항목을 저장한다.
   * 기존 랭킹에 추가하고, 점수 내림차순으로 정렬하여 상위 10개만 유지한다.
   * @param {Object} entry - 랭킹 항목
   * @param {string} entry.name - 플레이어 이름
   * @param {number} entry.score - 점수
   * @param {number} entry.day - 도달 일수
   * @param {number} entry.level - 도달 레벨
   * @param {number} [entry.timestamp] - 기록 시각 (자동 생성)
   * @returns {boolean} 저장 성공 여부
   */
  function saveRanking(entry) {
    try {
      if (!entry || typeof entry.score !== 'number') {
        console.warn('[SaveManager] 유효하지 않은 랭킹 항목입니다.');
        return false;
      }

      // 타임스탬프가 없으면 현재 시각으로 설정
      if (!entry.timestamp) {
        entry.timestamp = Date.now();
      }

      // 기존 랭킹 로드
      var rankings = getRankings();

      // 새 항목 추가
      rankings.push({
        name: entry.name || '이름없음',
        score: entry.score,
        day: entry.day || 0,
        level: entry.level || 1,
        timestamp: entry.timestamp
      });

      // 점수 내림차순 정렬
      rankings.sort(function (a, b) {
        return b.score - a.score;
      });

      // 상위 10개만 유지
      if (rankings.length > 10) {
        rankings = rankings.slice(0, 10);
      }

      localStorage.setItem(RANKING_KEY, JSON.stringify(rankings));
      console.log('[SaveManager] 랭킹 저장 완료 (총 ' + rankings.length + '개)');
      return true;
    } catch (err) {
      console.error('[SaveManager] 랭킹 저장 실패:', err);
      return false;
    }
  }

  /**
   * 저장된 랭킹 목록을 가져온다.
   * 점수 내림차순으로 정렬된 상위 10개 항목을 반환한다.
   * @returns {Array} 랭킹 배열
   */
  function getRankings() {
    try {
      var json = localStorage.getItem(RANKING_KEY);
      if (!json) return [];

      var rankings = JSON.parse(json);

      // 배열 유효성 검증
      if (!Array.isArray(rankings)) return [];

      // 점수 내림차순 정렬 후 상위 10개 반환
      rankings.sort(function (a, b) {
        return b.score - a.score;
      });

      return rankings.slice(0, 10);
    } catch (err) {
      console.error('[SaveManager] 랭킹 로드 실패:', err);
      return [];
    }
  }

  /**
   * 모든 랭킹 데이터를 삭제한다.
   * @returns {boolean} 삭제 성공 여부
   */
  function clearRankings() {
    try {
      localStorage.removeItem(RANKING_KEY);
      console.log('[SaveManager] 랭킹 데이터 초기화 완료');
      return true;
    } catch (err) {
      console.error('[SaveManager] 랭킹 삭제 실패:', err);
      return false;
    }
  }

  // ===== 내부 헬퍼 =====

  /**
   * 바이트 수를 읽기 쉬운 문자열로 변환한다.
   * @param {number} bytes - 바이트 수
   * @returns {string} 포맷된 문자열 (예: "1.5 KB")
   * @private
   */
  function _formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ===== 공개 API =====
  return {
    SAVE_KEY: SAVE_KEY,
    RANKING_KEY: RANKING_KEY,

    // 저장 / 로드
    save: save,
    load: load,
    hasSave: hasSave,
    deleteSave: deleteSave,

    // 내보내기 / 가져오기
    exportSave: exportSave,
    importSave: importSave,

    // 자동 저장
    autoSave: autoSave,

    // 랭킹
    saveRanking: saveRanking,
    getRankings: getRankings,
    clearRankings: clearRankings
  };
})();
