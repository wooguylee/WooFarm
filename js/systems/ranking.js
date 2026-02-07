/**
 * WooFarm - 랭킹 시스템
 * 플레이어 점수 계산 및 랭킹 관리
 */
(function() {
    'use strict';

    window.RankingSystem = {
        rankings: [],

        init() {
            this.rankings = SaveManager.getRankings() || [];
        },

        /** 점수 계산 */
        calculateScore(gameState) {
            let score = 0;
            if (!gameState) return score;

            const p = gameState.player || {};
            score += (p.totalEarnings || 0) * 0.3;
            score += (p.level || 1) * 100;
            score += (p.totalHarvests || 0) * 5;

            // 완료 퀘스트
            const questsCompleted = gameState.quests ? (gameState.quests.completed || []).length : 0;
            score += questsCompleted * 50;

            // 동물 수
            const animalCount = gameState.animals ? (gameState.animals.owned || []).length : 0;
            score += animalCount * 30;

            // 장식 수
            const decoCount = gameState.decorations ? (gameState.decorations.placed || []).length : 0;
            score += decoCount * 10;

            // 플레이 일수
            score += (p.day || 1) * 2;

            return Math.floor(score);
        },

        /** 점수 제출 */
        submitScore(playerName, gameState) {
            const score = this.calculateScore(gameState);
            const entry = {
                name: playerName || 'Farmer',
                score: score,
                level: gameState.player ? gameState.player.level : 1,
                day: gameState.player ? gameState.player.day : 1,
                timestamp: Date.now()
            };

            SaveManager.saveRanking(entry);
            this.rankings = SaveManager.getRankings() || [];
            return score;
        },

        /** 랭킹 목록 가져오기 */
        getRankings() {
            return this.rankings;
        },

        /** 랭킹 모달 렌더링 */
        renderRankingModal() {
            const list = document.getElementById('ranking-list');
            if (!list) return;

            Utils.removeAllChildren(list);
            this.rankings = SaveManager.getRankings() || [];

            if (this.rankings.length === 0) {
                list.innerHTML = '<div class="empty-ranking"><p>🏆 아직 랭킹 기록이 없습니다</p><p>게임을 플레이하고 기록을 남겨보세요!</p></div>';
                return;
            }

            this.rankings.forEach((entry, idx) => {
                const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                const date = new Date(entry.timestamp);
                const dateStr = `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;

                const row = Utils.createElement('div', 'ranking-row', list);
                row.innerHTML = `
                    <div class="rank-number">${rankEmoji}</div>
                    <div class="rank-info">
                        <span class="rank-name">${entry.name}</span>
                        <span class="rank-details">Lv.${entry.level} | ${entry.day}일차 | ${dateStr}</span>
                    </div>
                    <div class="rank-score">${Utils.formatNumber(entry.score)}점</div>
                `;

                if (idx < 3) row.classList.add('rank-top');
            });

            // 랭킹 초기화 버튼
            const clearBtn = Utils.createElement('button', 'pixel-btn btn-danger ranking-clear-btn', list);
            clearBtn.textContent = '랭킹 초기화';
            clearBtn.addEventListener('click', () => {
                ModalUI.showConfirm('정말 랭킹을 초기화하시겠습니까?', () => {
                    this.clearRankings();
                    this.renderRankingModal();
                });
            });
        },

        /** 랭킹 초기화 */
        clearRankings() {
            SaveManager.clearRankings();
            this.rankings = [];
        }
    };
})();
