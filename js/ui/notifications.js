/**
 * WooFarm - 알림 UI 시스템 (Notification UI System)
 * 게임 내 토스트 알림을 관리합니다.
 * 
 * 주요 기능:
 * - 토스트 알림 표시 (info, success, warning, error, reward)
 * - 보상 알림 (골드, 경험치, 아이템)
 * - 레벨업 알림 (특별 애니메이션)
 * - 알림 자동 제거 및 최대 개수 관리
 * - 이벤트 리스너 메모리 관리
 */
(function() {
    'use strict';

    const MAX_NOTIFICATIONS = 5;  // 동시 표시 가능한 최대 알림 개수
    let notifications = [];        // 현재 표시 중인 알림들
    let notificationArea = null;   // 알림 컨테이너 엘리먼트

    // ── 이벤트 핸들러 추적 (메모리 누수 방지) ──
    // 모든 이벤트 리스너를 맵에 저장하여 정리 시 쉽게 제거할 수 있음
    let _eventHandlers = {};

    window.NotificationUI = {
        /**
         * 알림 UI 시스템을 초기화합니다.
         * 기존 리스너를 정리하고 새로운 리스너를 등록합니다.
         */
        init() {
            // 기존 리스너 정리 (중복 방지)
            this.cleanup();
            
            notificationArea = document.getElementById('notification-area');
            this.setupEventListeners();
        },

        /**
         * 모든 이벤트 리스너를 정리합니다.
         * 게임 시스템 재초기화 시 메모리 누수를 방지하기 위해 호출됩니다.
         */
        cleanup() {
            const bus = Utils.eventBus;
            
            // 등록된 모든 이벤트 리스너 제거
            Object.keys(_eventHandlers).forEach(eventName => {
                if (_eventHandlers[eventName]) {
                    bus.off(eventName, _eventHandlers[eventName]);
                }
            });
            
            _eventHandlers = {};
            console.log('[NotificationUI] 이벤트 리스너 정리 완료');
        },

        /**
         * 알림을 표시합니다.
         * @param {string} message - 표시할 메시지
         * @param {string} type - 알림 유형 (info, success, warning, error, reward)
         * @param {number} duration - 자동 제거 시간 (밀리초)
         */
        show(message, type = 'info', duration = 3000) {
            if (!notificationArea) return;

            // 알림 유형별 이모지 및 스타일 설정
            const typeConfig = {
                info: { emoji: 'ℹ️', className: 'notif-info' },
                success: { emoji: '✅', className: 'notif-success' },
                warning: { emoji: '⚠️', className: 'notif-warning' },
                error: { emoji: '❌', className: 'notif-error' },
                reward: { emoji: '🎁', className: 'notif-reward' }
            };

            const config = typeConfig[type] || typeConfig.info;

            // 최대 개수 초과 시 가장 오래된 알림 제거
            while (notifications.length >= MAX_NOTIFICATIONS) {
                this.removeOldest();
            }

            const notif = document.createElement('div');
            notif.className = `notification ${config.className} notif-enter`;
            notif.innerHTML = `
                <span class="notif-emoji">${config.emoji}</span>
                <span class="notif-message">${message}</span>
                <button class="notif-close">&times;</button>
            `;

            // 닫기 버튼
            notif.querySelector('.notif-close').addEventListener('click', () => {
                this.removeNotification(notif);
            });

            notificationArea.appendChild(notif);
            notifications.push(notif);

            // 입장 애니메이션 후 안정
            requestAnimationFrame(() => {
                notif.classList.remove('notif-enter');
                notif.classList.add('notif-visible');
            });

            // 자동 제거
            setTimeout(() => {
                this.removeNotification(notif);
            }, duration);
        },

         /**
         * 보상 관련 알림을 표시합니다. (전리품, 골드, 경험치 등)
         * @param {object} rewards - 보상 정보 (gold, exp, items)
         */
        showReward(rewards) {
            let msg = '🎉 보상 획득! ';
            if (rewards.gold) msg += `💰${Utils.formatNumber(rewards.gold)}G `;
            if (rewards.exp) msg += `⭐${rewards.exp}EXP `;
            if (rewards.items && rewards.items.length > 0) {
                rewards.items.forEach(item => {
                    const data = ITEM_DATA[item.id] || ITEM_DATA[item.itemId];
                    if (data) msg += `${data.emoji}${data.name} x${item.quantity || 1} `;
                });
            }
            this.show(msg, 'reward', 5000);
        },

        /**
         * 레벨업 알림을 표시합니다. (특별 애니메이션 포함)
         * @param {number} level - 새로운 레벨
         */
        showLevelUp(level) {
            const notif = document.createElement('div');
            notif.className = 'notification notif-levelup notif-enter';
            notif.innerHTML = `
                <div class="levelup-content">
                    <div class="levelup-stars">⭐✨⭐</div>
                    <div class="levelup-text">레벨 업!</div>
                    <div class="levelup-level">Lv.${level}</div>
                </div>
            `;
            notificationArea.appendChild(notif);

            // RAF를 사용한 애니메이션
            requestAnimationFrame(() => {
                notif.classList.remove('notif-enter');
                notif.classList.add('notif-visible');
            });

            // 자동 제거
            setTimeout(() => {
                this.removeNotification(notif);
            }, 4000);
        },

        /**
         * 알림을 DOM에서 제거합니다. (페이드 아웃 애니메이션)
         * @param {HTMLElement} notif - 제거할 알림 엘리먼트
         */
        removeNotification(notif) {
            if (!notif || !notif.parentNode) return;
            notif.classList.add('notif-exit');
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
                const idx = notifications.indexOf(notif);
                if (idx > -1) notifications.splice(idx, 1);
            }, 300);
        },

        /**
         * 가장 오래된 알림을 제거합니다.
         * (최대 개수 초과 시 호출)
         */
        removeOldest() {
            if (notifications.length > 0) {
                this.removeNotification(notifications[0]);
            }
        },

        /**
         * 모든 알림을 제거합니다.
         */
        clear() {
            [...notifications].forEach(n => this.removeNotification(n));
        },

        /**
         * 이벤트 리스너를 설정합니다.
         * 게임 이벤트에 대응하여 알림을 표시합니다.
         */
         setupEventListeners() {
             const bus = Utils.eventBus;
             const self = this;

             // 각 이벤트 핸들러를 함수로 저장하여 나중에 제거 가능하게 함
              _eventHandlers.crop_harvested = (data) => {
                 const crop = CROP_DATA[data.cropId];
                 if (crop) {
                     console.log(`🌾 ${crop.name} 수확!`);
                 }
              };

              _eventHandlers.crop_planted = (data) => {
                  const crop = CROP_DATA[data.cropId];
                  if (crop) {
                      console.log(`🌱 ${crop.name} 씨앗을 심었습니다`);
                  }
              };

             _eventHandlers.crop_withered = () => {
                 self.show('💀 계절이 바뀌어 작물이 시들었습니다...', 'warning');
             };

              _eventHandlers.item_purchased = (data) => {
                  const itemData = window.ITEM_DATA[data.itemId] || window.CROP_DATA[data.itemId] || window.ANIMAL_DATA[data.itemId];
                  const name = itemData ? itemData.name : '아이템';
                  console.log(`🛒 ${name} 구매 완료!`);
              };

              _eventHandlers.item_sold = (data) => {
                  const itemData = window.ITEM_DATA[data.itemId] || window.CROP_DATA[data.itemId] || window.ANIMAL_DATA[data.itemId];
                  const name = itemData ? itemData.name : '아이템';
                  console.log(`💰 ${name} 판매! +${Utils.formatNumber(data.totalGold || 0)}G`);
              };

             _eventHandlers.quest_completed = (data) => {
                 const quest = QUEST_DATA[data.questId];
                 if (quest) self.show(`📜 퀘스트 완료: ${quest.name}`, 'reward', 5000);
             };

              _eventHandlers.animal_fed = (data) => {
                  console.log(`🥕 ${data.name || '동물'}에게 먹이를 줬습니다`);
              };

              _eventHandlers.product_collected = (data) => {
                  const productName = data.product ? data.product.name : data.productName || '생산품';
                  console.log(`📦 ${productName} 수집!`);
              };

             _eventHandlers.season_changed = (data) => {
                 const seasonEmojis = { spring: '🌸', summer: '☀️', fall: '🍂', winter: '❄️' };
                 const seasonNames = { spring: '봄', summer: '여름', fall: '가을', winter: '겨울' };
                 const emoji = seasonEmojis[data.season] || '🌿';
                 const name = seasonNames[data.season] || data.season;
                 self.show(`${emoji} ${name}이 되었습니다!`, 'info', 5000);
             };

             _eventHandlers.weather_changed = (data) => {
                 if (data && data.weather) {
                     const weatherNames = {
                         sunny: '맑음', cloudy: '흐림', rainy: '비', stormy: '폭풍',
                         snowy: '눈', windy: '바람', foggy: '안개'
                     };
                     const name = weatherNames[data.weather] || data.weather;
                     self.show(`${WeatherSystem.getWeatherEmoji()} 날씨: ${name}`, 'info');
                 }
             };

             _eventHandlers.level_up = (data) => {
                 self.showLevelUp(data.level);
             };

             _eventHandlers.autoSaved = () => {
                 console.log('💾 자동 저장 완료');
             };

             // 모든 이벤트 리스너 등록
             bus.on('crop_harvested', _eventHandlers.crop_harvested);
             bus.on('crop_planted', _eventHandlers.crop_planted);
             bus.on('crop_withered', _eventHandlers.crop_withered);
             bus.on('item_purchased', _eventHandlers.item_purchased);
             bus.on('item_sold', _eventHandlers.item_sold);
             bus.on('quest_completed', _eventHandlers.quest_completed);
             bus.on('animal_fed', _eventHandlers.animal_fed);
             bus.on('product_collected', _eventHandlers.product_collected);
             bus.on('season_changed', _eventHandlers.season_changed);
             bus.on('weather_changed', _eventHandlers.weather_changed);
             bus.on('level_up', _eventHandlers.level_up);
             bus.on('autoSaved', _eventHandlers.autoSaved);
         }
    };
})();
