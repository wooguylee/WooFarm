/**
 * WooFarm - 메인 게임 오케스트레이터
 * 모든 시스템을 초기화하고 연결하는 중앙 관리 모듈
 */
(function() {
    'use strict';

    window.Game = {
        // 플레이어 상태
        player: {
            name: 'Farmer',
            level: 1,
            exp: 0,
            totalEarnings: 0,
            totalHarvests: 0
        },

        // 게임 상태
        currentScreen: 'loading',
        isRunning: false,

        // 하루 통계 (매일 리셋)
        dailyStats: {
            earnings: 0,
            harvests: 0,
            animalProducts: 0,
            questsCompleted: 0,
            expGained: 0
        },

        // 레벨별 필요 경험치 테이블
        expTable: [
            0,      // Lv.0 (사용안함)
            100,    // Lv.1 -> Lv.2
            250,    // Lv.2 -> Lv.3
            500,    // Lv.3 -> Lv.4
            800,    // Lv.4 -> Lv.5
            1200,   // Lv.5 -> Lv.6
            1700,   // Lv.6 -> Lv.7
            2300,   // Lv.7 -> Lv.8
            3000,   // Lv.8 -> Lv.9
            3800,   // Lv.9 -> Lv.10
            4800,   // Lv.10 -> Lv.11
            6000,   // Lv.11 -> Lv.12
            7500,   // Lv.12 -> Lv.13
            9500,   // Lv.13 -> Lv.14
            12000,  // Lv.14 -> Lv.15
            15000,  // Lv.15 -> Lv.16
            18500,  // Lv.16 -> Lv.17
            22500,  // Lv.17 -> Lv.18
            27000,  // Lv.18 -> Lv.19
            32000,  // Lv.19 -> Lv.20
            40000   // Lv.20+
        ],

        /** 다음 레벨 필요 경험치 */
        getExpForNextLevel() {
            const idx = Math.min(this.player.level, this.expTable.length - 1);
            return this.expTable[idx];
        },

        /** 게임 초기화 (로딩) */
        async init() {
            const loadingBar = document.getElementById('loading-bar');
            const loadingText = document.getElementById('loading-text');

            const steps = [
                { text: '유틸리티 로딩...', progress: 10 },
                { text: '사운드 시스템 준비...', progress: 20 },
                { text: '저장 데이터 확인...', progress: 30 },
                { text: '작물 데이터 로딩...', progress: 40 },
                { text: '동물 데이터 로딩...', progress: 50 },
                { text: '아이템 데이터 로딩...', progress: 60 },
                { text: '퀘스트 데이터 로딩...', progress: 70 },
                { text: '장식 데이터 로딩...', progress: 80 },
                { text: 'UI 준비...', progress: 90 },
                { text: '완료!', progress: 100 }
            ];

            for (const step of steps) {
                if (loadingText) loadingText.textContent = step.text;
                if (loadingBar) loadingBar.style.width = step.progress + '%';
                await this.delay(200);
            }

            await this.delay(500);
            this.showMainMenu();
        },

        /** 딜레이 유틸리티 */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /** 메인 메뉴 표시 */
        showMainMenu() {
            this.currentScreen = 'menu';

            Utils.hideElement(document.getElementById('loading-screen'));
            Utils.hideElement(document.getElementById('game-screen'));
            Utils.hideElement(document.getElementById('toolbar'));
            Utils.hideElement(document.getElementById('seed-panel'));
            Utils.hideElement(document.getElementById('log-panel'));
            Utils.showElement(document.getElementById('main-menu'));

            // LogManager 초기화
            if (window.LogManager) {
                window.LogManager.init();
            }

            // 이어하기 버튼 상태
            const btnLoad = document.getElementById('btn-load-game');
            if (btnLoad) {
                if (SaveManager.hasSave()) {
                    btnLoad.disabled = false;
                    btnLoad.classList.remove('btn-disabled');
                } else {
                    btnLoad.disabled = true;
                    btnLoad.classList.add('btn-disabled');
                }
            }

            // 메뉴 버튼 이벤트
            const btnNew = document.getElementById('btn-new-game');
            if (btnNew) {
                btnNew.onclick = () => this.startNewGame();
            }

            if (btnLoad) {
                btnLoad.onclick = () => this.loadGame();
            }

            const btnHow = document.getElementById('btn-how-to-play');
            if (btnHow) {
                btnHow.onclick = () => {
                    // 간단히 모달 UI 초기화 후 표시
                    ModalUI.init();
                    ModalUI.openModal('howto-modal');
                };
            }

            const btnRank = document.getElementById('btn-ranking');
            if (btnRank) {
                btnRank.onclick = () => {
                    ModalUI.init();
                    RankingSystem.init();
                    RankingSystem.renderRankingModal();
                    ModalUI.openModal('ranking-modal');
                };
            }
        },

        /** 새 게임 시작 */
        startNewGame() {
            // 화면 전환
            Utils.hideElement(document.getElementById('main-menu'));
            Utils.showElement(document.getElementById('game-screen'));
            this.currentScreen = 'game';

            // 플레이어 초기화
            this.player = {
                name: 'Farmer',
                level: 1,
                exp: 0,
                totalEarnings: 0,
                totalHarvests: 0
            };

            this.resetDailyStats();

            // 모든 시스템 초기화
            this.initAllSystems();

            // 시작 아이템 지급
            this.giveStartingItems();

            // UI 초기화
            this.initUI();

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 시간 시작
            TimeSystem.start();
            this.isRunning = true;

            // 날씨 시각 효과 적용
            WeatherSystem.applyWeatherVisuals();

            // 동물 영역 렌더링
            AnimalSystem.renderAnimalArea();

            // 장식 렌더링
            DecorationSystem.renderDecorations();

            // 환영 알림
            NotificationUI.show('🌾 WooFarm에 오신 것을 환영합니다! 농장을 가꿔보세요!', 'success', 5000);

            // 도구바와 씨앗 패널, 로그 패널 표시
            const toolbar = document.getElementById('toolbar');
            if (toolbar) Utils.showElement(toolbar);
            
            const logPanel = document.getElementById('log-panel');
            if (logPanel) Utils.showElement(logPanel);

            // HUD 업데이트
            HudUI.update();
        },

        /** 게임 불러오기 */
        loadGame() {
            const saveData = SaveManager.load();
            if (!saveData) {
                NotificationUI.show('저장 데이터가 없습니다.', 'error');
                return;
            }

            // 화면 전환
            Utils.hideElement(document.getElementById('main-menu'));
            Utils.showElement(document.getElementById('game-screen'));
            this.currentScreen = 'game';

            // 플레이어 상태 복원
            if (saveData.player) {
                this.player = { ...this.player, ...saveData.player };
            }

            this.resetDailyStats();

            // 시스템 초기화
            this.initAllSystems();

            // 저장 데이터로 시스템 복원
            if (saveData.farm) FarmSystem.loadGridState(saveData.farm);
            if (saveData.inventory) InventorySystem.loadState(saveData.inventory);
            if (saveData.animals) AnimalSystem.loadState(saveData.animals);
            if (saveData.quests) QuestSystem.loadState(saveData.quests);
            if (saveData.decorations) DecorationSystem.loadState(saveData.decorations);

            // 시간/날씨 복원
            if (saveData.time) {
                TimeSystem.currentDay = saveData.time.currentDay || 1;
                TimeSystem.currentSeason = saveData.time.currentSeason || 'spring';
                TimeSystem.currentHour = saveData.time.currentHour || 6;
                TimeSystem.currentMinute = saveData.time.currentMinute || 0;
            }

            if (saveData.weather) {
                WeatherSystem.currentWeather = saveData.weather.currentWeather || 'sunny';
                WeatherSystem.forecast = saveData.weather.forecast || 'sunny';
            }

            // 골드 복원
            if (saveData.player && saveData.player.gold !== undefined) {
                ShopSystem.gold = saveData.player.gold;
            }

            // 설정 복원
            if (saveData.settings) {
                const gs = document.getElementById('game-speed');
                if (gs) gs.value = saveData.settings.gameSpeed || 2;
                TimeSystem.setSpeed(saveData.settings.gameSpeed || 2);

                const sfx = document.getElementById('sfx-volume');
                if (sfx) sfx.value = (saveData.settings.sfxVolume || 0.7) * 100;

                const bgm = document.getElementById('bgm-volume');
                if (bgm) bgm.value = (saveData.settings.bgmVolume || 0.5) * 100;
            }

            // UI 초기화
            this.initUI();
            this.setupEventListeners();

            // 시간 시작
            TimeSystem.start();
            this.isRunning = true;

            // 시각 효과
             WeatherSystem.applyWeatherVisuals();
             FarmSystem.renderGrid();
             AnimalSystem.renderAnimalArea();
             DecorationSystem.renderDecorations();

              // 도구바와 로그 패널 표시
              const toolbar = document.getElementById('toolbar');
              if (toolbar) Utils.showElement(toolbar);
              
              const logPanel = document.getElementById('log-panel');
              if (logPanel) Utils.showElement(logPanel);

              // HUD 업데이트
              HudUI.update();

              NotificationUI.show('💾 게임을 불러왔습니다!', 'success');
        },

        /** 모든 시스템 초기화 */
        initAllSystems() {
            TimeSystem.init();
            WeatherSystem.init();
            FarmSystem.init();
            InventorySystem.init();
            ShopSystem.init();
            AnimalSystem.init();
            QuestSystem.init();
            DecorationSystem.init();
            RankingSystem.init();
        },

        /** UI 초기화 */
        initUI() {
            ModalUI.init();
            NotificationUI.init();
            HudUI.init();
        },

        /** 시작 아이템 지급 */
        giveStartingItems() {
            // 기본 씨앗
            InventorySystem.addItem('turnip_seed', 5);
            InventorySystem.addItem('potato_seed', 5);
            InventorySystem.addItem('wheat_seed', 3);

            // 시작 골드
            ShopSystem.gold = 500;
        },

        /** 이벤트 리스너 설정 */
        setupEventListeners() {
            const bus = Utils.eventBus;

            // 하루 종료
            bus.on('day_end', () => this.handleDayEnd());

            // 다음 날 버튼
            bus.on('next_day_clicked', () => this.startNextDay());

            // 수확 처리
            bus.on('crop_harvested', (data) => this.handleHarvest(data));

            // 판매 추적
            bus.on('item_sold', (data) => {
                const amount = data.totalGold || 0;
                this.player.totalEarnings += amount;
                this.dailyStats.earnings += amount;
            });

            // 퀘스트 완료
            bus.on('quest_completed', (data) => {
                this.dailyStats.questsCompleted++;
                this.handleQuestReward(data);
            });

            // 동물 생산품 수집
            bus.on('product_collected', () => {
                this.dailyStats.animalProducts++;
            });

            // 골드 변동
            bus.on('gold_changed', () => {
                HudUI.updateGoldDisplay(ShopSystem.gold);
            });

            // 자동 저장
            bus.on('time_tick', () => {
                if (this.isRunning) {
                    SaveManager.autoSave(this.getGameState());
                }
            });
        },

        /** 하루 종료 처리 */
        handleDayEnd() {
            TimeSystem.pause();
            this.isRunning = false;

            const weatherNames = {
                sunny: '맑음', cloudy: '흐림', rainy: '비', stormy: '폭풍',
                snowy: '눈', windy: '바람', foggy: '안개'
            };

            const summary = {
                day: TimeSystem.currentDay,
                season: TimeSystem.currentSeason,
                earnings: this.dailyStats.earnings,
                harvests: this.dailyStats.harvests,
                animalProducts: this.dailyStats.animalProducts,
                questsCompleted: this.dailyStats.questsCompleted,
                expGained: this.dailyStats.expGained,
                forecast: weatherNames[WeatherSystem.getForecast()] || '맑음'
            };

            ModalUI.showDayEnd(summary);
        },

        /** 다음 날 시작 */
        startNextDay() {
            this.resetDailyStats();

            // 다음 날로 진행
            TimeSystem.currentDay++;
            TimeSystem.currentHour = 6;
            TimeSystem.currentMinute = 0;

            // 계절 변경 체크
            if (TimeSystem.getDayOfSeason() > TimeSystem.DAYS_PER_SEASON) {
                const seasons = ['spring', 'summer', 'fall', 'winter'];
                const idx = seasons.indexOf(TimeSystem.currentSeason);
                TimeSystem.currentSeason = seasons[(idx + 1) % 4];
                TimeSystem.currentDay = 1;
                Utils.eventBus.emit('season_changed', { season: TimeSystem.currentSeason });
            }

            // 날씨 업데이트
            WeatherSystem.advanceDay();
            WeatherSystem.applyWeatherVisuals();
            Utils.eventBus.emit('weather_changed', { weather: WeatherSystem.currentWeather });

            // day_start 이벤트 발생
            Utils.eventBus.emit('day_start', { day: TimeSystem.currentDay, season: TimeSystem.currentSeason });

            // 시간 재개
            TimeSystem.resume();
            this.isRunning = true;

            // HUD 업데이트
            HudUI.update();

            // 자동 저장
            this.saveGame();
        },

        /** 수확 처리 */
        handleHarvest(data) {
            if (!data) return;

            const crop = CROP_DATA[data.cropId];
            if (!crop) return;

            this.player.totalHarvests++;
            this.dailyStats.harvests++;

            // 경험치 획득
            const exp = crop.exp || 10;
            this.addExp(exp);

        },

        /** 퀘스트 보상 처리 */
        handleQuestReward(data) {
            if (!data || !data.questId) return;

            const quest = QUEST_DATA[data.questId];
            if (!quest || !quest.rewards) return;

            NotificationUI.showReward(quest.rewards);
        },

        /** 경험치 추가 */
        addExp(amount) {
            this.player.exp += amount;
            this.dailyStats.expGained += amount;

            // 레벨업 체크
            while (this.player.exp >= this.getExpForNextLevel() && this.player.level < 20) {
                this.player.exp -= this.getExpForNextLevel();
                this.player.level++;
                this.handleLevelUp();
            }

            HudUI.updateExpBar(this.player.exp, this.getExpForNextLevel());
        },

        /** 레벨업 처리 */
        handleLevelUp() {
            Utils.eventBus.emit('level_up', { level: this.player.level });
            try { AudioManager.playSound('levelup'); } catch(e) {}
        },

        /** 일일 통계 리셋 */
        resetDailyStats() {
            this.dailyStats = {
                earnings: 0,
                harvests: 0,
                animalProducts: 0,
                questsCompleted: 0,
                expGained: 0
            };
        },

        /** 게임 저장 */
        saveGame() {
            const state = this.getGameState();
            SaveManager.save(state);
            NotificationUI.show('💾 게임이 저장되었습니다!', 'success', 2000);
        },

        /** 게임 상태 수집 */
        getGameState() {
            return {
                player: {
                    ...this.player,
                    gold: ShopSystem.gold,
                    day: TimeSystem.currentDay
                },
                farm: FarmSystem.getGridState(),
                inventory: InventorySystem.getState(),
                animals: AnimalSystem.getState(),
                quests: QuestSystem.getState(),
                decorations: DecorationSystem.getState(),
                time: {
                    currentDay: TimeSystem.currentDay,
                    currentSeason: TimeSystem.currentSeason,
                    currentHour: TimeSystem.currentHour,
                    currentMinute: TimeSystem.currentMinute
                },
                weather: {
                    currentWeather: WeatherSystem.currentWeather,
                    forecast: WeatherSystem.forecast
                },
                settings: {
                    gameSpeed: TimeSystem.gameSpeed || 2,
                    sfxVolume: AudioManager.sfxVolume || 0.7,
                    bgmVolume: AudioManager.bgmVolume || 0.5
                },
                timestamp: Date.now()
            };
        },

        /** 메인 메뉴로 돌아가기 */
        returnToMenu() {
            // 저장
            this.saveGame();

            // 랭킹 제출
            RankingSystem.submitScore(this.player.name, this.getGameState());

            // 시간 정지
            TimeSystem.pause();
            this.isRunning = false;

            // 모달 닫기
            ModalUI.closeModal();

            // 화면 전환
            this.showMainMenu();
        }
    };

    // DOM 로드 완료 시 게임 시작
    document.addEventListener('DOMContentLoaded', () => {
        Game.init();
    });
})();
