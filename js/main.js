/**
 * 🚀 메인 진입점
 *
 * 애플리케이션을 초기화하고 모든 모듈을 연결합니다.
 */

import { Game } from './game/Game.js';
import { setupInput } from './input.js';
import { initCanvas } from './visuals/renderer.js';
import { loadAllResources, selectSongByIndex, loadBeatmap } from './resources/loader.js';

// ==============================================
// UI 요소
// ==============================================

const ui = {
    $canvas: document.getElementById('game-canvas'),
    $score: document.getElementById('score'),
    $combo: document.getElementById('combo'),
    $maxCombo: document.getElementById('max-combo'),
    $timer: document.getElementById('timer'),
    $bpm: document.getElementById('bpm'),
    $songSelect: document.getElementById('song-select'),
    $startBtn: document.getElementById('start-btn'),
    $stopBtn: document.getElementById('stop-btn'),
    $resetBtn: document.getElementById('reset-btn'),
    $rejectBtn: document.getElementById('reject-btn'),
    $approveBtn: document.getElementById('approve-btn'),
    $judgment: document.getElementById('judgment-display'),
    $stageMessage: document.getElementById('stage-message'), // 🆕 스테이지 메시지
    $gameOver: document.getElementById('game-over'),
    $finalScore: document.getElementById('final-score'),
    $finalMaxCombo: document.getElementById('final-max-combo'),
    $restartBtn: document.getElementById('restart-btn'),
    $loading: document.getElementById('loading')
};

// ==============================================
// 초기화
// ==============================================

async function init() {
    console.log('🎮 Stage Evolution Timing Game 초기화 중...');

    try {
        // 로딩 화면 표시
        ui.$loading.classList.remove('hidden');

        // 캔버스 초기화
        console.log('🎨 캔버스 초기화...');
        initCanvas(ui.$canvas);

        // 리소스 로딩
        console.log('📦 리소스 로딩...');
        await loadAllResources();

        // 게임 인스턴스 생성
        console.log('🎮 게임 인스턴스 생성...');
        const game = new Game(ui);

        // 초기 곡 선택 (첫 번째 곡)
        console.log('🎵 음악 선택...');
        const songData = selectSongByIndex(0);
        if (songData) {
            ui.$bpm.textContent = songData.bpm;
            game.updateTempo(songData.bpm);
            game.setGameDuration(songData.duration);
            console.log(`초기 곡: ${songData.name}, BPM: ${songData.bpm}, 길이: ${songData.duration}초`);

            // 비트맵 로드 시도
            loadBeatmap(songData.audio.src.split('/').pop()).then(beatmap => {
                if (beatmap) {
                    game.setBeatmap(beatmap);
                    console.log('🎼 비트맵 적용됨!');
                } else {
                    console.log('⚠️ 비트맵 없음 - 기본 모드 사용');
                }
            });
        }

        // 곡 선택 이벤트 리스너
        ui.$songSelect.addEventListener('change', async (e) => {
            const selectedIndex = parseInt(e.target.value);
            const newSongData = selectSongByIndex(selectedIndex);

            if (newSongData) {
                ui.$bpm.textContent = newSongData.bpm;
                game.updateTempo(newSongData.bpm);
                game.setGameDuration(newSongData.duration);

                // 비트맵 로드
                const beatmap = await loadBeatmap(newSongData.audio.src.split('/').pop());
                if (beatmap) {
                    game.setBeatmap(beatmap);
                    console.log('🎼 비트맵 적용됨!');
                } else {
                    game.setBeatmap(null);
                    console.log('⚠️ 비트맵 없음 - 기본 모드 사용');
                }

                // 게임이 실행 중이 아니면 리셋
                if (!game.running) {
                    game.reset();
                }

                console.log(`곡 변경: ${newSongData.name}, BPM: ${newSongData.bpm}, 길이: ${newSongData.duration}초`);
            }
        });

        // 입력 시스템 설정
        console.log('⌨️ 입력 시스템 설정...');
        setupInput(game, ui);

        // 게임 리셋 (초기 캐릭터 생성)
        console.log('🔄 초기 상태 설정...');
        game.reset();

        // 로딩 화면 숨김
        ui.$loading.classList.add('hidden');

        console.log('✅ 초기화 완료!');
        console.log('');
        console.log('=== 게임 시작 방법 ===');
        console.log('1. 곡을 선택하세요');
        console.log('2. "시작" 버튼 클릭 또는 Space 키 누르기');
        console.log('3. 빨간색 캐릭터 → F키 (거절)');
        console.log('4. 파란색 캐릭터 → J키 (승인)');
        console.log('5. Stage 3 (가장 밝을 때) = PERFECT!');
        console.log('======================');

    } catch (error) {
        console.error('❌ 초기화 실패:', error);
        alert('게임 초기화에 실패했습니다. 콘솔을 확인하세요.');
        ui.$loading.classList.add('hidden');
    }
}

// ==============================================
// 앱 시작
// ==============================================

// DOM이 로드되면 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
