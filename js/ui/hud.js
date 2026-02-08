/**
 * WooFarm - HUD UI 시스템
 * 상단 HUD, 도구바, 키보드 단축키를 관리합니다.
 */
(function() {
    'use strict';

    let selectedTool = 'hoe';

    window.HudUI = {
         // ── 이벤트 리스너 추적 ────────────────────────────
         _eventHandlers: {},
         
         init() {
             // 기존 리스너 정리 (중복 방지)
             this.cleanup();
             
             this.setupToolbar();
             this.setupHudButtons();
             this.setupKeyboardShortcuts();
             this.setupEventListeners();
         },

        /** HUD 전체 업데이트 */
        update() {
            try {
                // 날짜
                const dayEl = document.getElementById('display-day');
                if (dayEl) dayEl.textContent = `${TimeSystem.currentDay}일차`;

                // 계절
                const seasonEl = document.getElementById('display-season');
                if (seasonEl) seasonEl.textContent = TimeSystem.getSeasonName();

                // 날씨
                const weatherEl = document.getElementById('display-weather');
                const weatherIcon = document.getElementById('weather-icon');
                if (weatherEl) {
                    const weatherNames = {
                        sunny: '맑음', cloudy: '흐림', rainy: '비',
                        stormy: '폭풍', snowy: '눈', windy: '바람', foggy: '안개'
                    };
                    weatherEl.textContent = weatherNames[WeatherSystem.currentWeather] || '맑음';
                }
                if (weatherIcon) weatherIcon.textContent = WeatherSystem.getWeatherEmoji();

                // 시간
                const timeEl = document.getElementById('display-time');
                if (timeEl) timeEl.textContent = TimeSystem.getDisplayTime();

                // 골드
                this.updateGoldDisplay(ShopSystem.gold);

                // 레벨/경험치
                if (window.Game) {
                    const levelEl = document.getElementById('display-level');
                    if (levelEl) levelEl.textContent = Game.player.level;
                    this.updateExpBar(Game.player.exp, Game.getExpForNextLevel());
                }
            } catch(e) {
                // 시스템 초기화 전에 호출될 수 있음
            }
        },

        /** 도구바 설정 */
        setupToolbar() {
             const toolSlots = document.querySelectorAll('.tool-slot');
             toolSlots.forEach(slot => {
                 slot.addEventListener('click', () => {
                     this.selectTool(slot.dataset.tool);
                 });
             });
         },

         /** 도구 선택 */
         selectTool(toolName) {
             selectedTool = toolName;
             window.currentTool = toolName;
             document.querySelectorAll('.tool-slot').forEach(slot => {
                  slot.classList.toggle('selected', slot.dataset.tool === toolName);
             });

             // 씨앗 선택 시 씨앗 패널 표시
             const seedPanel = document.getElementById('seed-panel');
             if (toolName === 'seed') {
                 if (seedPanel) {
                     seedPanel.classList.remove('hidden');
                     InventorySystem.renderSeedPanel(TimeSystem.currentSeason);
                 }
             } else {
                 if (seedPanel) {
                     seedPanel.classList.add('hidden');
                 }
             }

             try { AudioManager.playSound('click'); } catch(e) {}
         },

        /** 현재 선택된 도구 */
        getSelectedTool() {
            return selectedTool;
        },

        /** HUD 버튼 설정 */
        setupHudButtons() {
            // 인벤토리
            const btnInv = document.getElementById('btn-inventory');
            if (btnInv) btnInv.addEventListener('click', () => {
                InventorySystem.renderInventoryModal();
                ModalUI.openModal('inventory-modal');
            });

            // 상점
            const btnShop = document.getElementById('btn-shop');
            if (btnShop) btnShop.addEventListener('click', () => {
                ShopSystem.renderShopModal('buy');
                ModalUI.openModal('shop-modal');
            });

            // 퀘스트
            const btnQuest = document.getElementById('btn-quest-log');
            if (btnQuest) btnQuest.addEventListener('click', () => {
                QuestSystem.renderQuestModal('active');
                ModalUI.openModal('quest-modal');
            });

            // 동물
            const btnAnimals = document.getElementById('btn-animals');
            if (btnAnimals) btnAnimals.addEventListener('click', () => {
                AnimalSystem.renderAnimalModal();
                ModalUI.openModal('animal-modal');
            });

            // 장식
            const btnDecor = document.getElementById('btn-decor');
            if (btnDecor) btnDecor.addEventListener('click', () => {
                DecorationSystem.renderDecorModal();
                ModalUI.openModal('decor-modal');
            });

            // 설정
            const btnSettings = document.getElementById('btn-settings');
            if (btnSettings) btnSettings.addEventListener('click', () => {
                ModalUI.openModal('settings-modal');
            });
        },

        /** 키보드 단축키 설정 */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // 모달이 열려있을 때 ESC로 닫기
                if (e.key === 'Escape') {
                    if (ModalUI.isModalOpen()) {
                        ModalUI.closeModal();
                    } else {
                        ModalUI.openModal('settings-modal');
                    }
                    return;
                }

                // 모달이 열려있으면 다른 키 무시
                if (ModalUI.isModalOpen()) return;

                // 입력 필드에 포커스가 있으면 무시
                if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

                switch(e.key) {
                    case '1': this.selectTool('hoe'); break;
                    case '2': this.selectTool('water'); break;
                    case '3': this.selectTool('seed'); break;
                    case '4': this.selectTool('harvest'); break;
                    case '5': this.selectTool('feed'); break;
                    case '6': this.selectTool('decorate'); break;
                    case 'i': case 'I':
                        InventorySystem.renderInventoryModal();
                        ModalUI.openModal('inventory-modal');
                        break;
                    case 's': case 'S':
                        ShopSystem.renderShopModal('buy');
                        ModalUI.openModal('shop-modal');
                        break;
                    case 'q': case 'Q':
                        QuestSystem.renderQuestModal('active');
                        ModalUI.openModal('quest-modal');
                        break;
                    case 'a': case 'A':
                        AnimalSystem.renderAnimalModal();
                        ModalUI.openModal('animal-modal');
                        break;
                    case 'd': case 'D':
                        DecorationSystem.renderDecorModal();
                        ModalUI.openModal('decor-modal');
                        break;
                    case ' ':
                        e.preventDefault();
                        // 스페이스바로 시간 가속
                        if (window.Game && Game.isRunning) {
                            TimeSystem.setSpeed(5);
                            setTimeout(() => TimeSystem.setSpeed(2), 3000);
                        }
                        break;
                }
            });
        },

        /** 골드 표시 업데이트 */
        updateGoldDisplay(amount) {
            const goldEl = document.getElementById('display-gold');
            if (goldEl) {
                goldEl.textContent = Utils.formatNumber(amount);
                goldEl.classList.add('gold-bounce');
                setTimeout(() => goldEl.classList.remove('gold-bounce'), 500);
            }

            // 상점 골드 표시도 업데이트
            const shopGold = document.getElementById('shop-gold-display');
            if (shopGold) shopGold.textContent = Utils.formatNumber(amount);
        },

        /** 경험치 바 업데이트 */
        updateExpBar(current, max) {
            const fill = document.getElementById('exp-bar-fill');
            if (fill) {
                const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
                fill.style.width = percent + '%';
            }
        },

        /** 날 전환 효과 */
        showDayTransition(dayNum) {
            const trans = document.createElement('div');
            trans.className = 'day-transition';
            trans.innerHTML = `<div class="day-transition-text">☀️ ${dayNum}일차</div>`;
            document.getElementById('game-screen').appendChild(trans);

            setTimeout(() => {
                trans.classList.add('day-transition-fade');
                setTimeout(() => {
                    if (trans.parentNode) trans.parentNode.removeChild(trans);
                }, 1000);
            }, 1500);
        },

         /** 이벤트 리스너 정리 (메모리 누수 방지) */
         cleanup() {
             // 등록된 이벤트 리스너 모두 제거
             if (this._eventHandlers.time_tick) {
                 Utils.eventBus.off('time_tick', this._eventHandlers.time_tick);
             }
             if (this._eventHandlers.gold_changed) {
                 Utils.eventBus.off('gold_changed', this._eventHandlers.gold_changed);
             }
             if (this._eventHandlers.level_up) {
                 Utils.eventBus.off('level_up', this._eventHandlers.level_up);
             }
             if (this._eventHandlers.day_start) {
                 Utils.eventBus.off('day_start', this._eventHandlers.day_start);
             }
             
             // DOM 이벤트 리스너 제거
             if (this._eventHandlers.gameSpeed && this._eventHandlers.gameSpeedEl) {
                 this._eventHandlers.gameSpeedEl.removeEventListener('input', this._eventHandlers.gameSpeed);
             }
             if (this._eventHandlers.sfxVol && this._eventHandlers.sfxVolEl) {
                 this._eventHandlers.sfxVolEl.removeEventListener('input', this._eventHandlers.sfxVol);
             }
             if (this._eventHandlers.bgmVol && this._eventHandlers.bgmVolEl) {
                 this._eventHandlers.bgmVolEl.removeEventListener('input', this._eventHandlers.bgmVol);
             }
             if (this._eventHandlers.seedPanelClose && this._eventHandlers.seedPanelCloseEl) {
                 this._eventHandlers.seedPanelCloseEl.removeEventListener('click', this._eventHandlers.seedPanelClose);
             }
             if (this._eventHandlers.btnSave && this._eventHandlers.btnSaveEl) {
                 this._eventHandlers.btnSaveEl.removeEventListener('click', this._eventHandlers.btnSave);
             }
             if (this._eventHandlers.btnMenu && this._eventHandlers.btnMenuEl) {
                 this._eventHandlers.btnMenuEl.removeEventListener('click', this._eventHandlers.btnMenu);
             }
             
             // 도구바 리스너 정리
             document.querySelectorAll('.tool-slot').forEach(slot => {
                 if (this._eventHandlers['toolSlot_' + slot.dataset.tool]) {
                     slot.removeEventListener('click', this._eventHandlers['toolSlot_' + slot.dataset.tool]);
                 }
             });
             
             // 모달 버튼 리스너 정리
             ['inventory', 'quest', 'shop', 'animals', 'home', 'settings'].forEach(modal => {
                 const btnId = 'btn-' + modal;
                 if (this._eventHandlers[btnId] && this._eventHandlers[btnId + '_el']) {
                     this._eventHandlers[btnId + '_el'].removeEventListener('click', this._eventHandlers[btnId]);
                 }
             });
             
             // 키보드 단축키 제거
             if (this._eventHandlers.keydown) {
                 document.removeEventListener('keydown', this._eventHandlers.keydown);
             }
             
             // 맵 초기화
             this._eventHandlers = {};
             console.log('[HudUI] 이벤트 리스너 정리 완료');
         },

         /** 이벤트 리스너 */
         setupEventListeners() {
             // 이벤트 리스너를 함수로 저장하여 나중에 제거 가능하게 함
             this._eventHandlers.time_tick = () => this.update();
             this._eventHandlers.gold_changed = (data) => this.updateGoldDisplay(data.gold);
             this._eventHandlers.level_up = () => this.update();
             this._eventHandlers.day_start = (data) => {
                 if (data && data.day) this.showDayTransition(data.day);
             };
             
             Utils.eventBus.on('time_tick', this._eventHandlers.time_tick);
             Utils.eventBus.on('gold_changed', this._eventHandlers.gold_changed);
             Utils.eventBus.on('level_up', this._eventHandlers.level_up);
             Utils.eventBus.on('day_start', this._eventHandlers.day_start);

            // 설정 슬라이더
            const gameSpeed = document.getElementById('game-speed');
            if (gameSpeed) {
                gameSpeed.addEventListener('input', (e) => {
                    const speed = parseInt(e.target.value);
                    document.getElementById('speed-display').textContent = `x${speed}`;
                    TimeSystem.setSpeed(speed);
                });
            }

            const sfxVol = document.getElementById('sfx-volume');
            if (sfxVol) {
                sfxVol.addEventListener('input', (e) => {
                    const vol = parseInt(e.target.value);
                    document.getElementById('sfx-display').textContent = `${vol}%`;
                    AudioManager.setSFXVolume(vol / 100);
                });
            }

            const bgmVol = document.getElementById('bgm-volume');
            if (bgmVol) {
                bgmVol.addEventListener('input', (e) => {
                    const vol = parseInt(e.target.value);
                    document.getElementById('bgm-display').textContent = `${vol}%`;
                    AudioManager.setBGMVolume(vol / 100);
                });
            }

            // 씨앗 패널 닫기 버튼
            const seedPanelClose = document.querySelector('#seed-panel .side-panel-close');
            if (seedPanelClose) {
                seedPanelClose.addEventListener('click', () => {
                    const seedPanel = document.getElementById('seed-panel');
                    if (seedPanel) {
                        seedPanel.classList.add('hidden');
                    }
                });
            }

            // 저장/메뉴 버튼
            const btnSave = document.getElementById('btn-save-game');
            if (btnSave) {
                btnSave.addEventListener('click', () => {
                    if (window.Game) Game.saveGame();
                    ModalUI.closeModal();
                });
            }

            const btnMenu = document.getElementById('btn-main-menu');
            if (btnMenu) {
                btnMenu.addEventListener('click', () => {
                    ModalUI.showConfirm('메인 메뉴로 돌아가시겠습니까? (자동 저장됩니다)', () => {
                        if (window.Game) Game.returnToMenu();
                    });
                });
            }
        }
    };
})();
