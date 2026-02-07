/**
 * LogManager - 게임 로그를 관리하고 표시합니다
 * ========================================================================== */

window.LogManager = (function () {
  'use strict';

  const MAX_LOGS = 100; // 최대 로그 개수
  const logs = [];
  let originalConsoleLog;
  let originalConsoleWarn;
  let originalConsoleError;

  return {
    /**
     * LogManager를 초기화합니다
     */
    init: function () {
      // 콘솔 메서드를 오버라이드하여 로그를 캡처합니다
      originalConsoleLog = console.log;
      originalConsoleWarn = console.warn;
      originalConsoleError = console.error;

      const self = this;

      console.log = function () {
        originalConsoleLog.apply(console, arguments);
        self.addLog(Array.from(arguments).join(' '), 'info');
      };

      console.warn = function () {
        originalConsoleWarn.apply(console, arguments);
        self.addLog(Array.from(arguments).join(' '), 'warning');
      };

      console.error = function () {
        originalConsoleError.apply(console, arguments);
        self.addLog(Array.from(arguments).join(' '), 'error');
      };

      // 로그 패널의 clear 버튼
      const clearBtn = document.querySelector('.log-panel-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clear());
      }

      console.log('[LogManager] 초기화 완료');
    },

    /**
     * 로그를 추가합니다
     * @param {string} message - 로그 메시지
     * @param {string} level - 로그 레벨 ('info', 'success', 'warning', 'error')
     */
    addLog: function (message, level = 'info') {
      // [SystemName] 패턴 추출 (예: [TimeSystem])
      const systemMatch = message.match(/\[(\w+)\]/);
      const systemName = systemMatch ? systemMatch[1] : '';

      // 로그 객체 생성
      const logEntry = {
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        message: message,
        level: level,
        system: systemName
      };

      logs.unshift(logEntry); // 맨 앞에 추가 (최신 로그가 위에)

      // 최대 개수 초과 시 제거
      if (logs.length > MAX_LOGS) {
        logs.pop();
      }

      this.renderLogs();
    },

    /**
     * 성공 로그를 추가합니다
     * @param {string} message
     */
    success: function (message) {
      this.addLog(message, 'success');
    },

    /**
     * 경고 로그를 추가합니다
     * @param {string} message
     */
    warn: function (message) {
      this.addLog(message, 'warning');
    },

    /**
     * 에러 로그를 추가합니다
     * @param {string} message
     */
    error: function (message) {
      this.addLog(message, 'error');
    },

    /**
     * 로그를 화면에 렌더링합니다
     */
    renderLogs: function () {
      const logContent = document.getElementById('log-content');
      if (!logContent) return;

      // 전체 HTML 재생성 (성능 최적화 필요 시 개선)
      logContent.innerHTML = logs
        .map((log) => {
          const timeStr = `[${log.timestamp}]`;
          const message = log.message
            .replace(/\[\w+\]/g, (match) => `<span class="log-system">${match}</span>`)
            .replace(/ @ /g, '<span class="log-location"> @ </span>');

          return `<div class="log-entry ${log.level}"><span class="log-time">${timeStr}</span> ${message}</div>`;
        })
        .join('');

      // 자동 스크롤: 새 로그가 추가되면 맨 위로
      logContent.scrollTop = 0;
    },

    /**
     * 모든 로그를 삭제합니다
     */
    clear: function () {
      logs.length = 0;
      this.renderLogs();
      originalConsoleLog('[LogManager] 로그가 삭제되었습니다');
    },

    /**
     * 현재 로그 개수를 반환합니다
     */
    getCount: function () {
      return logs.length;
    },

    /**
     * 특정 레벨의 로그만 필터링하여 반환합니다
     * @param {string} level
     */
    getLogsByLevel: function (level) {
      return logs.filter((log) => log.level === level);
    },

    /**
     * 특정 시스템의 로그만 필터링하여 반환합니다
     * @param {string} system
     */
    getLogsBySystem: function (system) {
      return logs.filter((log) => log.system === system);
    },

    /**
     * 모든 로그를 반환합니다
     */
    getLogs: function () {
      return [...logs];
    }
  };
})();
