/**
 * WooFarm - 핵심 유틸리티 모듈
 * 게임 전반에서 사용되는 공통 유틸리티 함수 및 이벤트 버스 시스템
 */
window.Utils = (function () {
  // ===== 고유 ID 생성용 카운터 =====
  let _idCounter = 0;

  // ===== 수학 유틸리티 =====

  /**
   * min 이상 max 이하의 랜덤 정수를 반환한다.
   * @param {number} min - 최솟값 (포함)
   * @param {number} max - 최댓값 (포함)
   * @returns {number}
   */
  function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * min 이상 max 미만의 랜덤 실수를 반환한다.
   * @param {number} min - 최솟값 (포함)
   * @param {number} max - 최댓값 (미포함)
   * @returns {number}
   */
  function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * 배열에서 랜덤으로 하나의 요소를 선택하여 반환한다.
   * @param {Array} array - 대상 배열
   * @returns {*} 랜덤 선택된 요소
   */
  function randomChoice(array) {
    if (!array || array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 값을 min과 max 사이로 제한한다.
   * @param {number} value - 대상 값
   * @param {number} min - 최솟값
   * @param {number} max - 최댓값
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 선형 보간 (Linear Interpolation)
   * t=0이면 a, t=1이면 b를 반환한다.
   * @param {number} a - 시작값
   * @param {number} b - 끝값
   * @param {number} t - 보간 비율 (0~1)
   * @returns {number}
   */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ===== 포맷팅 유틸리티 =====

  /**
   * 숫자를 콤마가 포함된 문자열로 포맷한다.
   * 예: 1000 -> "1,000"
   * @param {number} n - 대상 숫자
   * @returns {string}
   */
  function formatNumber(n) {
    if (n === null || n === undefined) return '0';
    return Number(n).toLocaleString('en-US');
  }

  /**
   * 시간을 "HH:MM" 형식으로 포맷한다.
   * @param {number} hours - 시 (0-23)
   * @param {number} minutes - 분 (0-59)
   * @returns {string}
   */
  function formatTime(hours, minutes) {
    var h = String(Math.floor(hours)).padStart(2, '0');
    var m = String(Math.floor(minutes)).padStart(2, '0');
    return h + ':' + m;
  }

  // ===== DOM 유틸리티 =====

  /**
   * DOM 요소를 생성하고 선택적으로 부모에 추가한다.
   * @param {string} tag - HTML 태그명
   * @param {string} [className] - CSS 클래스명
   * @param {HTMLElement} [parent] - 부모 요소
   * @returns {HTMLElement} 생성된 요소
   */
  function createElement(tag, className, parent) {
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (parent) {
      parent.appendChild(el);
    }
    return el;
  }

  /**
   * 요소의 모든 자식 노드를 제거한다.
   * @param {HTMLElement} element - 대상 요소
   */
  function removeAllChildren(element) {
    if (!element) return;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * 요소를 보이게 한다 (.hidden 클래스 제거).
   * @param {HTMLElement} el - 대상 요소
   */
  function showElement(el) {
    if (el) {
      el.classList.remove('hidden');
    }
  }

  /**
   * 요소를 숨긴다 (.hidden 클래스 추가).
   * @param {HTMLElement} el - 대상 요소
   */
  function hideElement(el) {
    if (el) {
      el.classList.add('hidden');
    }
  }

  // ===== 함수 유틸리티 =====

  /**
   * 디바운스 함수 - 연속 호출 시 마지막 호출 후 delay(ms) 뒤에 실행한다.
   * @param {Function} fn - 실행할 함수
   * @param {number} delay - 지연 시간 (밀리초)
   * @returns {Function} 디바운스된 함수
   */
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        fn.apply(context, args);
        timer = null;
      }, delay);
    };
  }

  // ===== 데이터 유틸리티 =====

  /**
   * 객체를 깊은 복사한다 (JSON 직렬화 방식).
   * 함수나 순환 참조가 포함된 객체에는 사용 불가.
   * @param {*} obj - 복사할 객체
   * @returns {*} 복사된 객체
   */
  function deepClone(obj) {
    if (obj === null || obj === undefined) return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 고유한 ID 문자열을 생성한다.
   * 타임스탬프 + 카운터 + 랜덤값 조합으로 충돌을 방지한다.
   * @returns {string} 고유 ID
   */
  function generateId() {
    _idCounter++;
    return 'wf_' + Date.now().toString(36) + '_' + _idCounter.toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }

  /**
   * 배열을 Fisher-Yates 알고리즘으로 셔플한다.
   * 원본 배열은 변경하지 않고 새 배열을 반환한다.
   * @param {Array} arr - 대상 배열
   * @returns {Array} 셔플된 새 배열
   */
  function shuffleArray(arr) {
    if (!arr) return [];
    var shuffled = arr.slice(); // 원본 보존을 위한 복사
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      // 구조 분해 대입 대신 임시 변수 사용 (호환성)
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  // ===== 이벤트 버스 (Pub/Sub 시스템) =====
  // 게임 모듈 간 통신의 핵심 시스템

  var eventBus = (function () {
    /** @type {Object.<string, Function[]>} 이벤트명 -> 콜백 배열 맵 */
    var listeners = {};

    return {
      /**
       * 이벤트 리스너를 등록한다.
       * @param {string} event - 이벤트명
       * @param {Function} callback - 콜백 함수
       */
      on: function (event, callback) {
        if (typeof callback !== 'function') {
          console.warn('[EventBus] on(): callback은 함수여야 합니다.');
          return;
        }
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
      },

      /**
       * 이벤트 리스너를 제거한다.
       * @param {string} event - 이벤트명
       * @param {Function} callback - 제거할 콜백 함수
       */
      off: function (event, callback) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(function (cb) {
          return cb !== callback;
        });
        // 리스너가 비었으면 키 자체를 정리한다
        if (listeners[event].length === 0) {
          delete listeners[event];
        }
      },

      /**
       * 이벤트를 발행한다. 등록된 모든 리스너에 데이터를 전달한다.
       * @param {string} event - 이벤트명
       * @param {*} [data] - 전달할 데이터
       */
      emit: function (event, data) {
        if (!listeners[event]) return;
        // 리스너 배열 복사 후 순회 (순회 중 off 호출 시 안전)
        var cbs = listeners[event].slice();
        for (var i = 0; i < cbs.length; i++) {
          try {
            cbs[i](data);
          } catch (err) {
            console.error('[EventBus] "' + event + '" 이벤트 처리 중 오류:', err);
          }
        }
      }
    };
  })();

  // ===== 공개 API =====
  return {
    // 수학
    randomInt: randomInt,
    randomFloat: randomFloat,
    randomChoice: randomChoice,
    clamp: clamp,
    lerp: lerp,

    // 포맷팅
    formatNumber: formatNumber,
    formatTime: formatTime,

    // DOM
    createElement: createElement,
    removeAllChildren: removeAllChildren,
    showElement: showElement,
    hideElement: hideElement,

    // 함수
    debounce: debounce,

    // 데이터
    deepClone: deepClone,
    generateId: generateId,
    shuffleArray: shuffleArray,

    // 이벤트 시스템
    eventBus: eventBus
  };
})();
