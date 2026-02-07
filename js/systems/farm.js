/**
 * WooFarm - 농장 시스템 (Farm System)
 * 밭 그리드 관리, 작물 심기/성장/수확, 도구 사용을 처리합니다.
 */
(function () {
  'use strict';

  var eventBus = window.Utils.eventBus;

  /** 그리드 크기 상수 */
  var GRID_ROWS = 6;
  var GRID_COLS = 8;

  /** 성장 단계 수 (0~4) */
  var MAX_GROWTH_STAGE = 4;

  /** 시간당 수분 감소량 */
  var WATER_DECAY_PER_HOUR = 5;

  /** 최대 수분 레벨 */
  var MAX_WATER_LEVEL = 100;

  /** 타일 상태별 CSS 클래스 접두어 */
  var TILE_STATE_CLASS_PREFIX = 'tile-';

  /** 성장 단계별 이모지 (기본값, 작물 데이터가 없을 때 사용) */
  var DEFAULT_GROWTH_EMOJI = ['\uD83C\uDF31', '\uD83C\uDF31', '\uD83C\uDF3F', '\uD83C\uDF3F', '\uD83C\uDF3E'];
  //                           🌱             🌱             🌿             🌿             🌾

  /** 타일 상태별 이모지 */
  var TILE_EMOJI = {
    empty: '',
    tilled: '',
    watered: '\uD83D\uDCA7' // 💧
  };

  window.FarmSystem = {
    // ── 상수 (외부 접근용) ────────────────────────────
    GRID_ROWS: GRID_ROWS,
    GRID_COLS: GRID_COLS,

    // ── 상태 ──────────────────────────────────────────
    grid: null,

    // ── 초기화 ────────────────────────────────────────

    /**
     * 농장 시스템을 초기화합니다.
     * 빈 그리드를 생성하고 DOM에 렌더링합니다.
     */
    init: function () {
      this.grid = this._createEmptyGrid();
      this.renderGrid();
      this._bindEvents();
      console.log('[FarmSystem] 초기화 완료 (' + GRID_ROWS + 'x' + GRID_COLS + ')');
    },

    // ── 렌더링 ────────────────────────────────────────

    /**
     * 전체 농장 그리드를 DOM에 렌더링합니다.
     */
    renderGrid: function () {
      var container = document.getElementById('farm-grid');
      if (!container) {
        console.warn('[FarmSystem] #farm-grid 요소를 찾을 수 없습니다');
        return;
      }

      container.innerHTML = '';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = 'repeat(' + GRID_COLS + ', 1fr)';
      container.style.gridTemplateRows = 'repeat(' + GRID_ROWS + ', 1fr)';

      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          var tileEl = this._createTileElement(r, c);
          container.appendChild(tileEl);
        }
      }
    },

    /**
     * 특정 타일의 DOM 상태를 갱신합니다.
     * @param {number} row - 행 인덱스
     * @param {number} col - 열 인덱스
     */
    updateTile: function (row, col) {
      var tile = this.grid[row][col];
      var el = document.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
      if (!el) return;

      // CSS 클래스 갱신
      el.className = 'farm-tile ' + TILE_STATE_CLASS_PREFIX + tile.state;
      if (tile.waterLevel > 0 && tile.state !== 'empty') {
        el.classList.add('tile-wet');
      }

      // 이모지 표시 갱신
      var emojiEl = el.querySelector('.tile-emoji');
      if (!emojiEl) {
        emojiEl = document.createElement('span');
        emojiEl.className = 'tile-emoji';
        el.appendChild(emojiEl);
      }

      emojiEl.textContent = this._getTileEmoji(tile);

      // 수분 바 표시
      var waterBar = el.querySelector('.water-bar');
      if (tile.state !== 'empty' && tile.state !== 'tilled') {
        if (!waterBar) {
          waterBar = document.createElement('div');
          waterBar.className = 'water-bar';
          var waterFill = document.createElement('div');
          waterFill.className = 'water-fill';
          waterBar.appendChild(waterFill);
          el.appendChild(waterBar);
        }
        waterBar.querySelector('.water-fill').style.width = tile.waterLevel + '%';
        waterBar.style.display = '';
      } else if (waterBar) {
        waterBar.style.display = 'none';
      }
    },

    // ── 도구 사용 ─────────────────────────────────────

    /**
     * 타일에 도구를 사용합니다.
     * @param {number} row - 행 인덱스
     * @param {number} col - 열 인덱스
     * @param {string} tool - 도구 종류 ('hoe'|'water'|'seed'|'harvest')
     */
    useTool: function (row, col, tool) {
      if (!this._isValidTile(row, col)) return;

      var tile = this.grid[row][col];

      switch (tool) {
        case 'hoe':
          this._useHoe(row, col, tile);
          break;

        case 'water':
          this._useWateringCan(row, col, tile);
          break;

        case 'seed':
          this._useSeed(row, col, tile);
          break;

        case 'harvest':
          this._useHarvest(row, col, tile);
          break;

        default:
          console.warn('[FarmSystem] 알 수 없는 도구: ' + tool);
      }
    },

    // ── 작물 심기 ─────────────────────────────────────

    /**
     * 타일에 작물을 심습니다.
     * @param {number} row - 행 인덱스
     * @param {number} col - 열 인덱스
     * @param {string} cropId - 작물 ID
     * @returns {boolean} 심기 성공 여부
     */
    plantCrop: function (row, col, cropId) {
      if (!this._isValidTile(row, col)) return false;

      var tile = this.grid[row][col];
      if (tile.state !== 'tilled') {
        console.warn('[FarmSystem] 밭이 경작되지 않았습니다');
        return false;
      }

      // 작물 데이터 확인
      var cropData = window.CROP_DATA ? window.CROP_DATA[cropId] : null;
      if (!cropData) {
        console.warn('[FarmSystem] 알 수 없는 작물: ' + cropId);
        return false;
      }

      // 계절 확인
      var currentSeason = window.TimeSystem ? window.TimeSystem.currentSeason : 'spring';
      if (cropData.seasons && cropData.seasons.indexOf(currentSeason) === -1) {
        console.warn('[FarmSystem] 현재 계절(' + currentSeason + ')에 심을 수 없는 작물입니다');
        return false;
      }

      // 씨앗 소모 확인
      var seedItemId = cropData.seedId || (cropId + '_seed');
      if (window.InventorySystem && !window.InventorySystem.hasItem(seedItemId, 1)) {
        console.warn('[FarmSystem] 씨앗이 부족합니다: ' + seedItemId);
        return false;
      }

      // 씨앗 소모
      if (window.InventorySystem) {
        window.InventorySystem.removeItem(seedItemId, 1);
      }

      // 타일 상태 갱신
      tile.state = 'planted';
      tile.crop = cropId;
      tile.growthStage = 0;
      tile.growthProgress = 0;
      tile.plantedDay = window.TimeSystem ? window.TimeSystem.totalDays : 0;
      tile.lastWatered = 0;

      this.updateTile(row, col);

      eventBus.emit('crop_planted', {
        row: row,
        col: col,
        cropId: cropId,
        season: currentSeason
      });

      if (window.AudioManager && window.AudioManager.play) {
        window.AudioManager.playSound('plant');
      }

      console.log('[FarmSystem] 작물 심기 완료: ' + cropId + ' (' + row + ',' + col + ')');
      return true;
    },

    // ── 성장 처리 ─────────────────────────────────────

    /**
     * 모든 심어진 작물의 성장을 처리합니다.
     * 매 시간 틱마다 호출됩니다.
     */
    growCrops: function () {
      var weatherEffects = window.WeatherSystem ? window.WeatherSystem.getWeatherEffects() : { growthModifier: 1.0 };

      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          var tile = this.grid[r][c];

          // 심어진 상태 또는 성장 중인 타일만 처리
          if (tile.state !== 'planted' && tile.state !== 'growing' && tile.state !== 'watered') {
            continue;
          }

          // 작물 데이터가 없으면 건너뛰기
          if (!tile.crop) continue;

          // 수분 감소
          tile.waterLevel = Math.max(0, tile.waterLevel - WATER_DECAY_PER_HOUR);

          // 수분이 없으면 성장 정지
          if (tile.waterLevel <= 0) {
            this.updateTile(r, c);
            continue;
          }

          // 성장 진행
          var cropData = window.CROP_DATA ? window.CROP_DATA[tile.crop] : null;
          var growthTime = cropData ? (cropData.growthTime || 24) : 24; // 기본 24시간(틱)

          // 날씨 보정 적용
          var growthIncrement = (1 / growthTime) * weatherEffects.growthModifier;
          tile.growthProgress = Math.min(1.0, (tile.growthProgress || 0) + growthIncrement);

          // 성장 단계 계산
          var newStage = Math.min(MAX_GROWTH_STAGE, Math.floor(tile.growthProgress * (MAX_GROWTH_STAGE + 1)));

          if (newStage !== tile.growthStage) {
            tile.growthStage = newStage;
          }

          // 상태 갱신
          if (tile.growthStage >= MAX_GROWTH_STAGE) {
            tile.state = 'ready';
          } else if (tile.state === 'planted' || tile.state === 'watered') {
            tile.state = 'growing';
          }

          this.updateTile(r, c);
        }
      }
    },

    /**
     * 비가 오면 모든 심어진 타일에 물을 줍니다.
     */
    waterAllFromRain: function () {
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          var tile = this.grid[r][c];
          if (tile.state === 'planted' || tile.state === 'growing' ||
              tile.state === 'watered' || tile.state === 'tilled') {
            tile.waterLevel = MAX_WATER_LEVEL;
            if (tile.state === 'tilled') {
              // 빈 밭에는 상태 변경 없이 수분만 채움
            }
            this.updateTile(r, c);
          }
        }
      }
      console.log('[FarmSystem] 비로 인해 모든 밭에 물이 줘졌습니다');
    },

    // ── 수확 ──────────────────────────────────────────

    /**
     * 수확 가능한 타일의 작물 데이터를 반환합니다.
     * @param {number} row
     * @param {number} col
     * @returns {object|null} 작물 정보 또는 null
     */
    getHarvestedCrop: function (row, col) {
      if (!this._isValidTile(row, col)) return null;

      var tile = this.grid[row][col];
      if (tile.state !== 'ready' || !tile.crop) return null;

      var cropData = window.CROP_DATA ? window.CROP_DATA[tile.crop] : null;
      return {
        cropId: tile.crop,
        data: cropData,
        plantedDay: tile.plantedDay
      };
    },

    // ── 타일 정보 조회 ───────────────────────────────

    /**
     * 타일의 사람이 읽을 수 있는 정보 문자열을 반환합니다.
     * @param {number} row
     * @param {number} col
     * @returns {string}
     */
    getTileInfo: function (row, col) {
      if (!this._isValidTile(row, col)) return '잘못된 위치';

      var tile = this.grid[row][col];
      var info = '위치: (' + row + ', ' + col + ')\n';
      info += '상태: ' + this._getStateNameKR(tile.state) + '\n';

      if (tile.crop) {
        var cropData = window.CROP_DATA ? window.CROP_DATA[tile.crop] : null;
        var cropName = cropData ? (cropData.name || tile.crop) : tile.crop;
        info += '작물: ' + cropName + '\n';
        info += '성장 단계: ' + tile.growthStage + '/' + MAX_GROWTH_STAGE + '\n';
        info += '성장률: ' + Math.round((tile.growthProgress || 0) * 100) + '%\n';
      }

      info += '수분: ' + tile.waterLevel + '%';
      return info;
    },

    // ── 통계 메서드 ───────────────────────────────────

    /**
     * 특정 작물의 심어진/성장 중/수확 대기 개수를 셉니다.
     * @param {string} cropId
     * @returns {number}
     */
    countCropsByType: function (cropId) {
      var count = 0;
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          if (this.grid[r][c].crop === cropId) {
            count++;
          }
        }
      }
      return count;
    },

    /**
     * 빈 타일 수를 반환합니다.
     * @returns {number}
     */
    getEmptyTileCount: function () {
      return this._countTilesByState('empty');
    },

    /**
     * 심어진(planted + growing + watered) 타일 수를 반환합니다.
     * @returns {number}
     */
    getPlantedTileCount: function () {
      var count = 0;
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          var state = this.grid[r][c].state;
          if (state === 'planted' || state === 'growing' || state === 'watered') {
            count++;
          }
        }
      }
      return count;
    },

    /**
     * 수확 준비된 타일 수를 반환합니다.
     * @returns {number}
     */
    getReadyTileCount: function () {
      return this._countTilesByState('ready');
    },

    // ── 저장/불러오기 ────────────────────────────────

    /**
     * 직렬화 가능한 그리드 상태를 반환합니다.
     * @returns {Array<Array<object>>}
     */
    getGridState: function () {
      var state = [];
      for (var r = 0; r < GRID_ROWS; r++) {
        state[r] = [];
        for (var c = 0; c < GRID_COLS; c++) {
          var tile = this.grid[r][c];
          state[r][c] = {
            state: tile.state,
            crop: tile.crop,
            growthStage: tile.growthStage,
            growthProgress: tile.growthProgress,
            waterLevel: tile.waterLevel,
            plantedDay: tile.plantedDay,
            lastWatered: tile.lastWatered
          };
        }
      }
      return state;
    },

    /**
     * 저장된 상태에서 그리드를 복원합니다.
     * @param {Array<Array<object>>} state
     */
    loadGridState: function (state) {
      if (!state || !Array.isArray(state)) return;

      for (var r = 0; r < GRID_ROWS && r < state.length; r++) {
        for (var c = 0; c < GRID_COLS && c < state[r].length; c++) {
          var saved = state[r][c];
          this.grid[r][c] = {
            state: saved.state || 'empty',
            crop: saved.crop || null,
            growthStage: saved.growthStage || 0,
            growthProgress: saved.growthProgress || 0,
            waterLevel: saved.waterLevel || 0,
            plantedDay: saved.plantedDay || 0,
            lastWatered: saved.lastWatered || 0
          };
        }
      }

      this.renderGrid();
      // 모든 타일 갱신
      for (var r2 = 0; r2 < GRID_ROWS; r2++) {
        for (var c2 = 0; c2 < GRID_COLS; c2++) {
          this.updateTile(r2, c2);
        }
      }

      console.log('[FarmSystem] 그리드 상태 복원 완료');
    },

    // ── 내부 헬퍼 ────────────────────────────────────

    /**
     * @private 이벤트 리스너를 바인딩합니다.
     */
    _bindEvents: function () {
      var self = this;

      // 매 시간 틱마다 작물 성장
      eventBus.on('time_tick', function () {
        self.growCrops();
      });

      // 새 하루 시작 → 비 관개 확인
      eventBus.on('day_start', function () {
        var effects = window.WeatherSystem ? window.WeatherSystem.getWeatherEffects() : {};
        if (effects.watersCrops) {
          self.waterAllFromRain();
        }
      });

      // 계절 변경 → 계절 부적합 작물 시들기
      eventBus.on('season_changed', function (data) {
        self._wiltOutOfSeasonCrops(data ? data.season : null);
      });
    },

    /**
     * @private 빈 그리드를 생성합니다.
     * @returns {Array<Array<object>>}
     */
    _createEmptyGrid: function () {
      var grid = [];
      for (var r = 0; r < GRID_ROWS; r++) {
        grid[r] = [];
        for (var c = 0; c < GRID_COLS; c++) {
          grid[r][c] = this._createEmptyTile();
        }
      }
      return grid;
    },

    /**
     * @private 빈 타일 객체를 생성합니다.
     * @returns {object}
     */
    _createEmptyTile: function () {
      return {
        state: 'empty',
        crop: null,
        growthStage: 0,
        growthProgress: 0,
        waterLevel: 0,
        plantedDay: 0,
        lastWatered: 0
      };
    },

    /**
     * @private 타일 DOM 요소를 생성합니다.
     * @param {number} row
     * @param {number} col
     * @returns {HTMLElement}
     */
    _createTileElement: function (row, col) {
      var self = this;
      var el = document.createElement('div');
      el.className = 'farm-tile ' + TILE_STATE_CLASS_PREFIX + 'empty';
      el.setAttribute('data-row', row);
      el.setAttribute('data-col', col);

      var emojiSpan = document.createElement('span');
      emojiSpan.className = 'tile-emoji';
      el.appendChild(emojiSpan);

      // 클릭 핸들러 - 현재 선택된 도구 사용
      el.addEventListener('click', function () {
        var currentTool = window.currentTool || 'hoe';
        self.useTool(row, col, currentTool);
      });

      return el;
    },

    /**
     * @private 괭이 도구를 사용합니다.
     */
    _useHoe: function (row, col, tile) {
      if (tile.state !== 'empty') return;

      tile.state = 'tilled';
      this.updateTile(row, col);

      eventBus.emit('tile_tilled', { row: row, col: col });

      if (window.AudioManager && window.AudioManager.play) {
        window.AudioManager.playSound('hoe');
      }
    },

    /**
     * @private 물뿌리개 도구를 사용합니다.
     */
    _useWateringCan: function (row, col, tile) {
      if (tile.state === 'empty') return;

      tile.waterLevel = MAX_WATER_LEVEL;
      tile.lastWatered = window.TimeSystem ? window.TimeSystem.totalDays : 0;

      // planted 상태면 watered로 변경하지 않고 수분만 채움
      this.updateTile(row, col);

      eventBus.emit('tile_watered', { row: row, col: col, waterLevel: tile.waterLevel });

      if (window.AudioManager && window.AudioManager.play) {
        window.AudioManager.playSound('water');
      }
    },

    /**
     * @private 씨앗 도구를 사용합니다 (씨앗 선택 패널 열기).
     */
    _useSeed: function (row, col, tile) {
      if (tile.state !== 'tilled') return;

      // InventorySystem에서 선택된 씨앗 확인
      if (window.InventorySystem) {
        var selectedSeed = window.InventorySystem.getSelectedSeed();
        if (selectedSeed) {
          // 씨앗 ID에서 작물 ID 추출 (예: 'tomato_seed' → 'tomato')
          var cropId = selectedSeed.replace('_seed', '');
          this.plantCrop(row, col, cropId);
        } else {
          // 씨앗이 선택되지 않았으면 씨앗 패널 열기
          var season = window.TimeSystem ? window.TimeSystem.currentSeason : 'spring';
          window.InventorySystem.renderSeedPanel(season);
        }
      }
    },

    /**
     * @private 수확 도구를 사용합니다.
     */
    _useHarvest: function (row, col, tile) {
      if (tile.state !== 'ready' || !tile.crop) return;

      var harvestInfo = this.getHarvestedCrop(row, col);

      // 수확물을 인벤토리에 추가
      var cropData = window.CROP_DATA ? window.CROP_DATA[tile.crop] : null;
      var harvestItemId = cropData ? (cropData.harvestId || tile.crop) : tile.crop;
      var harvestQuantity = cropData ? (cropData.harvestQuantity || 1) : 1;

      // 타일 초기화 (경작 상태로 되돌림)
      var cropId = tile.crop;
      tile.state = 'tilled';
      tile.crop = null;
      tile.growthStage = 0;
      tile.growthProgress = 0;
      tile.waterLevel = 0;
      tile.plantedDay = 0;

      this.updateTile(row, col);

      eventBus.emit('crop_harvested', {
        row: row,
        col: col,
        cropId: cropId,
        itemId: harvestItemId,
        quantity: harvestQuantity,
        data: harvestInfo
      });

      if (window.AudioManager && window.AudioManager.play) {
        window.AudioManager.playSound('harvest');
      }

      console.log('[FarmSystem] 수확 완료: ' + cropId + ' x' + harvestQuantity);
    },

    /**
     * @private 계절에 맞지 않는 작물을 시들게 합니다.
     * @param {string} newSeason - 새 계절
     */
    _wiltOutOfSeasonCrops: function (newSeason) {
      if (!newSeason) return;

      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          var tile = this.grid[r][c];
          if (!tile.crop) continue;

          var cropData = window.CROP_DATA ? window.CROP_DATA[tile.crop] : null;
          if (!cropData || !cropData.seasons) continue;

          // 새 계절에서 자랄 수 없는 작물은 시들기
          if (cropData.seasons.indexOf(newSeason) === -1) {
            var wiltedCropId = tile.crop;

            tile.state = 'tilled';
            tile.crop = null;
            tile.growthStage = 0;
            tile.growthProgress = 0;
            tile.waterLevel = 0;

            this.updateTile(r, c);

            // 시들기 애니메이션을 위한 클래스 추가
            var el = document.querySelector('[data-row="' + r + '"][data-col="' + c + '"]');
            if (el) {
              el.classList.add('tile-wilt');
              // 애니메이션 후 클래스 제거
              setTimeout((function (element) {
                return function () {
                  element.classList.remove('tile-wilt');
                };
              })(el), 1000);
            }

            eventBus.emit('crop_withered', {
              row: r,
              col: c,
              cropId: wiltedCropId,
              reason: 'season_change'
            });
          }
        }
      }

      console.log('[FarmSystem] 계절 변경으로 부적합 작물 시들기 처리 완료');
    },

    /**
     * @private 타일에 표시할 이모지를 결정합니다.
     * @param {object} tile
     * @returns {string}
     */
    _getTileEmoji: function (tile) {
      switch (tile.state) {
        case 'empty':
          return TILE_EMOJI.empty;

        case 'tilled':
          return TILE_EMOJI.tilled;

        case 'planted':
        case 'growing':
        case 'watered':
        case 'ready':
          // 작물 데이터에서 단계별 이모지 가져오기
          if (tile.crop && window.CROP_DATA && window.CROP_DATA[tile.crop]) {
            var cropData = window.CROP_DATA[tile.crop];
            if (cropData.stageEmoji && cropData.stageEmoji[tile.growthStage]) {
              return cropData.stageEmoji[tile.growthStage];
            }
            // 수확 준비 이모지
            if (tile.state === 'ready' && cropData.emoji) {
              return cropData.emoji;
            }
          }
          // 기본 성장 이모지
          return DEFAULT_GROWTH_EMOJI[tile.growthStage] || '\uD83C\uDF31';

        default:
          return '';
      }
    },

    /**
     * @private 타일 좌표 유효성을 검증합니다.
     */
    _isValidTile: function (row, col) {
      return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
    },

    /**
     * @private 특정 상태의 타일 수를 셉니다.
     */
    _countTilesByState: function (state) {
      var count = 0;
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          if (this.grid[r][c].state === state) count++;
        }
      }
      return count;
    },

    /**
     * @private 타일 상태의 한국어 이름을 반환합니다.
     */
    _getStateNameKR: function (state) {
      var names = {
        empty: '빈 땅',
        tilled: '경작된 땅',
        planted: '씨앗 심어짐',
        watered: '물 줌',
        growing: '성장 중',
        ready: '수확 가능'
      };
      return names[state] || state;
    }
  };

  console.log('[FarmSystem] 모듈 로드 완료');
})();
