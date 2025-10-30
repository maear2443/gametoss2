/**
 * 🎹 입력 처리 모듈
 *
 * 키보드 및 버튼 입력을 처리합니다.
 */

/**
 * 입력 시스템을 초기화합니다.
 *
 * @param {Game} game - 게임 인스턴스
 * @param {Object} ui - UI 요소 객체
 */
export function setupInput(game, ui) {
    console.log('⌨️ 입력 시스템 초기화');

    // ==============================================
    // 키보드 입력
    // ==============================================

    document.addEventListener('keydown', (e) => {
        // 중복 입력 방지
        if (e.repeat) return;

        switch (e.key.toLowerCase()) {
            case 'f':
                // F키: 거절 (Reject)
                game.handleAction('reject');
                ui.$rejectBtn.classList.add('active');
                setTimeout(() => ui.$rejectBtn.classList.remove('active'), 100);
                break;

            case 'j':
                // J키: 승인 (Approve)
                game.handleAction('approve');
                ui.$approveBtn.classList.add('active');
                setTimeout(() => ui.$approveBtn.classList.remove('active'), 100);
                break;

            case ' ':
                // Space: 시작/정지
                e.preventDefault();
                if (game.running) {
                    game.stop();
                } else {
                    game.start();
                }
                break;
        }
    });

    // ==============================================
    // 버튼 클릭
    // ==============================================

    // 시작 버튼
    ui.$startBtn.addEventListener('click', () => {
        if (game.running) {
            game.stop();
        } else {
            game.start();
        }
    });

    // 정지 버튼
    ui.$stopBtn.addEventListener('click', () => {
        game.stop();
    });

    // 리셋 버튼
    ui.$resetBtn.addEventListener('click', () => {
        game.reset();
    });

    // 거절 버튼
    ui.$rejectBtn.addEventListener('click', () => {
        game.handleAction('reject');
    });

    // 승인 버튼
    ui.$approveBtn.addEventListener('click', () => {
        game.handleAction('approve');
    });

    // 재시작 버튼 (게임 오버 화면)
    ui.$restartBtn.addEventListener('click', () => {
        game.reset();
    });

    // ==============================================
    // BPM 입력
    // ==============================================

    ui.$bpm.addEventListener('change', (e) => {
        const newBpm = parseInt(e.target.value);

        if (newBpm >= 60 && newBpm <= 200) {
            game.updateTempo(newBpm);
        } else {
            alert('BPM은 60~200 사이여야 합니다.');
            e.target.value = game.bpm;
        }
    });

    // Enter 키로 BPM 적용
    ui.$bpm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    });

    console.log('✅ 입력 시스템 초기화 완료');
    console.log('  F키: 거절 (빨간색)');
    console.log('  J키: 승인 (파란색)');
    console.log('  Space: 시작/정지');
}
