/**
 * WooFarm - 알림 UI 시스템
 * 게임 내 토스트 알림을 관리합니다.
 */
(function() {
    'use strict';

    const MAX_NOTIFICATIONS = 5;
    let notifications = [];
    let notificationArea = null;

    // ── 이벤트 핸들러 추적 (메모리 누수 방지) ──
    let _eventHandlers = {};

    window.NotificationUI = {
        init() {
            // 기존 리스너 정리 (중복 방지)
            this.cleanup();
            
            notificationArea = document.getElementById('notification-area');
            this.setupEventListeners();
        },

        /** 이벤트 리스너 정리 */
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

        /** 알림 표시 */
        show(message, type = 'info', duration = 3000) {
            if (!notificationArea) return;

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

        /** 보상 알림 */
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

        /** 레벨업 알림 */
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

            requestAnimationFrame(() => {
                notif.classList.remove('notif-enter');
                notif.classList.add('notif-visible');
            });

            setTimeout(() => {
                this.removeNotification(notif);
            }, 4000);
        },

        /** 알림 제거 */
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

        /** 가장 오래된 알림 제거 */
        removeOldest() {
            if (notifications.length > 0) {
                this.removeNotification(notifications[0]);
            }
        },

        /** 모두 제거 */
        clear() {
            [...notifications].forEach(n => this.removeNotification(n));
        },

         /** 이벤트 리스너 설정 */
         setupEventListeners() {
             const bus = Utils.eventBus;
             const self = this;

             // 각 이벤트 핸들러를 함수로 저장하여 나중에 제거 가능하게 함
             _eventHandlers.crop_harvested = (data) => {
                 const crop = CROP_DATA[data.cropId];
                 if (crop) self.show(`🌾 ${crop.name} 수확!`, 'success');
             };

             _eventHandlers.crop_planted = (data) => {
                 const crop = CROP_DATA[data.cropId];
                 if (crop) self.show(`🌱 ${crop.name} 씨앗을 심었습니다`, 'info');
             };

             _eventHandlers.crop_withered = () => {
                 self.show('💀 계절이 바뀌어 작물이 시들었습니다...', 'warning');
             };

             _eventHandlers.item_purchased = (data) => {
                 const itemData = window.ITEM_DATA[data.itemId] || window.CROP_DATA[data.itemId] || window.ANIMAL_DATA[data.itemId];
                 const name = itemData ? itemData.name : '아이템';
                 self.show(`🛒 ${name} 구매 완료!`, 'info');
             };

             _eventHandlers.item_sold = (data) => {
                 const itemData = window.ITEM_DATA[data.itemId] || window.CROP_DATA[data.itemId] || window.ANIMAL_DATA[data.itemId];
                 const name = itemData ? itemData.name : '아이템';
                 self.show(`💰 ${name} 판매! +${Utils.formatNumber(data.totalGold || 0)}G`, 'success');
             };

             _eventHandlers.quest_completed = (data) => {
                 const quest = QUEST_DATA[data.questId];
                 if (quest) self.show(`📜 퀘스트 완료: ${quest.name}`, 'reward', 5000);
             };

             _eventHandlers.animal_fed = (data) => {
                 self.show(`🥕 ${data.name || '동물'}에게 먹이를 줬습니다`, 'info');
             };

             _eventHandlers.product_collected = (data) => {
                 const productName = data.product ? data.product.name : data.productName || '생산품';
                 self.show(`📦 ${productName} 수집!`, 'success');
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
                 self.show('💾 자동 저장 완료', 'info', 2000);
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
