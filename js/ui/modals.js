/**
 * WooFarm - 모달 UI 시스템
 * 게임 내 모든 모달(팝업) 창을 관리합니다.
 */
(function() {
    'use strict';

    let currentModal = null;
    let overlay = null;
    let confirmCallback = null;

    window.ModalUI = {
        // ── 이벤트 리스너 추적 ────────────────────────────
        _eventHandlers: {},
        _closeButtons: [],
        _nextDayBtn: null,

        init() {
            // 기존 리스너 정리 (중복 방지)
            this.cleanup();

            overlay = document.getElementById('modal-overlay');

            // 모든 닫기 버튼에 이벤트 연결
            const modalCloseHandler = () => this.closeModal();
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', modalCloseHandler);
                this._closeButtons.push({ element: btn, handler: modalCloseHandler });
            });

            // 오버레이 클릭 시 닫기
            if (overlay) {
                const overlayClickHandler = (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                };
                overlay.addEventListener('click', overlayClickHandler);
                this._eventHandlers.overlayClick = { element: overlay, handler: overlayClickHandler };
            }

            // 다음 날 버튼
            const btnNextDay = document.getElementById('btn-next-day');
            if (btnNextDay) {
                const nextDayHandler = () => {
                    this.closeModal();
                    Utils.eventBus.emit('next_day_clicked');
                };
                btnNextDay.addEventListener('click', nextDayHandler);
                this._eventHandlers.nextDay = { element: btnNextDay, handler: nextDayHandler };
                this._nextDayBtn = { element: btnNextDay, handler: nextDayHandler };
            }
        },

        /**
         * ModalUI의 모든 이벤트 리스너를 정리합니다.
         */
        cleanup() {
            // 닫기 버튼 리스너 제거
            this._closeButtons.forEach(({ element, handler }) => {
                if (element) {
                    element.removeEventListener('click', handler);
                }
            });
            this._closeButtons = [];

            // 오버레이 리스너 제거
            if (this._eventHandlers.overlayClick) {
                const { element, handler } = this._eventHandlers.overlayClick;
                if (element) {
                    element.removeEventListener('click', handler);
                }
            }

            // 다음 날 버튼 리스너 제거
            if (this._eventHandlers.nextDay) {
                const { element, handler } = this._eventHandlers.nextDay;
                if (element) {
                    element.removeEventListener('click', handler);
                }
            }

            this._eventHandlers = {};
            this._nextDayBtn = null;
            console.log('[ModalUI] 이벤트 리스너 정리 완료');
        },

        /** 모달 열기 */
        openModal(modalId) {
            if (!overlay) return;

            // 기존 모달 숨기기
            this.hideAllModals();

            const modal = document.getElementById(modalId);
            if (!modal) return;

            Utils.showElement(overlay);
            Utils.showElement(modal);
            modal.classList.add('modal-animate-in');
            document.body.classList.add('modal-open');
            currentModal = modal;

            // 사운드
            try { AudioManager.playSound('click'); } catch(e) {}

            setTimeout(() => {
                modal.classList.remove('modal-animate-in');
            }, 300);
        },

        /** 모달 닫기 */
        closeModal() {
            if (!overlay) return;

            if (currentModal) {
                currentModal.classList.add('modal-animate-out');
                const modal = currentModal;
                setTimeout(() => {
                    Utils.hideElement(modal);
                    modal.classList.remove('modal-animate-out');
                }, 200);
            }

            setTimeout(() => {
                Utils.hideElement(overlay);
                document.body.classList.remove('modal-open');
            }, 200);

            currentModal = null;
        },

        /** 모든 모달 숨기기 */
        hideAllModals() {
            document.querySelectorAll('.modal').forEach(m => {
                Utils.hideElement(m);
                m.classList.remove('modal-animate-in', 'modal-animate-out');
            });
        },

        /** 모달이 열려있는지 */
        isModalOpen() {
            return currentModal !== null;
        },

        /** 확인 다이얼로그 */
        showConfirm(message, onConfirm, onCancel) {
            // 간단한 confirm 구현 (기존 모달 위에)
            const confirmDiv = document.createElement('div');
            confirmDiv.className = 'confirm-dialog';
            confirmDiv.innerHTML = `
                <div class="confirm-content pixel-border">
                    <p class="confirm-message">${message}</p>
                    <div class="confirm-buttons">
                        <button class="pixel-btn btn-primary confirm-yes">확인</button>
                        <button class="pixel-btn btn-secondary confirm-no">취소</button>
                    </div>
                </div>
            `;

            document.body.appendChild(confirmDiv);

            confirmDiv.querySelector('.confirm-yes').addEventListener('click', () => {
                document.body.removeChild(confirmDiv);
                if (onConfirm) onConfirm();
            });

            confirmDiv.querySelector('.confirm-no').addEventListener('click', () => {
                document.body.removeChild(confirmDiv);
                if (onCancel) onCancel();
            });
        },

        /** 하루 종료 모달 표시 */
        showDayEnd(summary) {
            const summaryDiv = document.getElementById('day-summary');
            if (!summaryDiv) return;

            const seasonNames = { spring: '봄', summer: '여름', fall: '가을', winter: '겨울' };
            const seasonName = seasonNames[summary.season] || summary.season;

            summaryDiv.innerHTML = `
                <div class="day-summary-header">
                    <h3>📅 ${summary.day}일차 - ${seasonName}</h3>
                </div>
                <div class="day-summary-stats">
                    <div class="summary-stat">
                        <span class="stat-label">💰 오늘 수입</span>
                        <span class="stat-value">${Utils.formatNumber(summary.earnings || 0)}G</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">🌾 수확 횟수</span>
                        <span class="stat-value">${summary.harvests || 0}회</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">🐄 동물 생산품</span>
                        <span class="stat-value">${summary.animalProducts || 0}개</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">📜 완료 퀘스트</span>
                        <span class="stat-value">${summary.questsCompleted || 0}개</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">⭐ 획득 경험치</span>
                        <span class="stat-value">${summary.expGained || 0}EXP</span>
                    </div>
                </div>
                <div class="day-summary-weather">
                    <span>내일 날씨 예보: ${WeatherSystem.getWeatherEmoji()} ${summary.forecast || ''}</span>
                </div>
            `;

            this.openModal('day-end-modal');
            try { AudioManager.playSound('day_end'); } catch(e) {}
        }
    };
})();
