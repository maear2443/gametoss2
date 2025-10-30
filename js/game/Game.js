/**
 * 🎮 게임 메인 컨트롤러
 *
 * 게임의 모든 로직을 관리하는 핵심 클래스입니다.
 */

import { Character } from './Character.js';
import {
    getJudgment,
    calculateFinalScore,
    isCorrectAction,
    getJudgmentText,
    getJudgmentColor,
    getJudgmentSize,
    getJudgmentClass,
    formatScore
} from './scoring.js';
import { GAME_DURATION, MAX_CHARACTERS, DEFAULT_BPM, COLOR_TYPES, UI, COLORS } from '../config/settings.js';
import { render } from '../visuals/renderer.js';
import {
    startHitFlash,
    createParticles,
    createFloatText,
    updateEffects,
    clearEffects
} from '../visuals/effects.js';
import {
    triggerHammer,
    triggerRobotArm,
    updateAnimations,
    clearAnimations
} from '../visuals/animations.js';
import { getRandomCharacter, playSound, playMusic, stopMusic, resetMusic } from '../resources/loader.js';

export class Game {
    /**
     * 게임 인스턴스 생성
     *
     * @param {Object} ui - UI 요소 객체
     */
    constructor(ui) {
        this.ui = ui;

        // 게임 상태
        this.bpm = DEFAULT_BPM;
        this.running = false;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.characters = [];
        this.timeRemaining = GAME_DURATION;

        // 타이밍
        this.rafId = null;
        this.lastTime = 0;
        this.startTime = 0;
    }

    // ==============================================
    // 게임 제어
    // ==============================================

    /**
     * 게임을 시작합니다.
     */
    start() {
        if (this.running) return;

        console.log('🎮 게임 시작!');

        // BPM 적용
        const bpmValue = parseInt(this.ui.$bpm.value) || DEFAULT_BPM;
        this.updateTempo(bpmValue);

        // 게임 상태 설정
        this.running = true;
        this.startTime = performance.now() / 1000;
        this.lastTime = this.startTime;

        // 음악 재생
        playMusic();

        // 게임 루프 시작
        this.gameLoop(performance.now());

        // UI 업데이트
        this.ui.$startBtn.textContent = '일시정지';
    }

    /**
     * 게임을 정지합니다.
     */
    stop() {
        if (!this.running) return;

        console.log('⏸️ 게임 정지');

        this.running = false;

        // 음악 정지
        stopMusic();

        // 루프 취소
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // UI 업데이트
        this.ui.$startBtn.textContent = '계속 (Space)';
    }

    /**
     * 게임을 리셋합니다.
     */
    reset() {
        console.log('🔄 게임 리셋');

        // 게임 정지
        this.stop();

        // 상태 초기화
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeRemaining = GAME_DURATION;
        this.characters = [];

        // 이펙트 초기화
        clearEffects();
        clearAnimations();

        // 음악 리셋
        resetMusic();

        // 캐릭터 생성 (시간 0 기준)
        this.fillCharactersAtTime(0);

        // UI 업데이트
        this.updateHUD();
        this.ui.$startBtn.textContent = '시작 (Space)';
        this.ui.$gameOver.classList.add('hidden');

        // 판정 표시 숨김
        this.ui.$judgment.classList.remove('show');
        this.ui.$judgment.textContent = '';

        // 초기 렌더링
        render(this.characters, 0);

        console.log(`Reset: Created ${this.characters.length} characters`);
    }

    /**
     * 게임을 종료합니다 (타임아웃).
     */
    end() {
        console.log('🏁 게임 종료!');

        // 게임 정지
        this.stop();

        // 최종 점수 표시
        this.ui.$finalScore.textContent = formatScore(this.score);
        this.ui.$finalMaxCombo.textContent = this.maxCombo;
        this.ui.$gameOver.classList.remove('hidden');
    }

    // ==============================================
    // 게임 루프
    // ==============================================

    /**
     * 메인 게임 루프
     *
     * @param {number} timestamp - 현재 타임스탬프 (밀리초)
     */
    gameLoop(timestamp) {
        if (!this.running) return;

        const currentTime = timestamp / 1000;
        const dt = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // 게임 시간 업데이트
        const elapsedTime = currentTime - this.startTime;
        this.timeRemaining = Math.max(0, GAME_DURATION - elapsedTime);

        // 타임아웃 체크
        if (this.timeRemaining <= 0) {
            this.end();
            return;
        }

        // 시간 초과 캐릭터 제거
        this.removeTimedOutCharacters(this.getNowSec());

        // 캐릭터 채우기
        this.fillCharacters();

        // 이펙트 업데이트
        updateEffects(dt);

        // 애니메이션 업데이트
        updateAnimations(dt);

        // 렌더링
        render(this.characters, this.getNowSec());

        // HUD 업데이트
        this.updateHUD();

        // 다음 프레임
        this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    // ==============================================
    // 플레이어 입력 처리
    // ==============================================

    /**
     * 플레이어의 액션을 처리합니다.
     *
     * @param {string} action - 'approve' 또는 'reject'
     */
    handleAction(action) {
        if (!this.running || this.characters.length === 0) return;

        const character = this.characters[0];
        const currentTime = this.getNowSec();
        const stage = character.getStage(currentTime);

        // 시간 초과 체크
        if (stage >= 4) {
            console.log('⏰ 시간 초과!');
            return;
        }

        // 정답 여부 확인
        const isCorrect = isCorrectAction(character.color, action);

        // 판정 계산
        const judgment = getJudgment(stage, isCorrect);

        // 점수 계산
        const finalScore = calculateFinalScore(judgment, this.combo);

        // 점수 추가
        this.score += finalScore;

        // 콤보 업데이트
        if (judgment !== 'MISS') {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
        } else {
            this.combo = 0;
        }

        // 이펙트 발동
        const color = getJudgmentColor(judgment);
        const flashColor = judgment === 'MISS' ? COLORS.FLASH.FAIL : COLORS.FLASH.SUCCESS;

        startHitFlash(flashColor);

        // 캐릭터 위치 (화면 중앙)
        const x = this.ui.$canvas.width / 2;
        const y = this.ui.$canvas.height / 2 - (this.characters.length - 1) * 40;

        createParticles(x, y, judgment, color);
        createFloatText(x + 60, y, getJudgmentText(judgment, finalScore), color, '2rem');

        // 애니메이션 발동
        if (character.color === 'red') {
            triggerHammer(x, y);
        } else {
            triggerRobotArm(x, y);
        }

        // 효과음 재생
        const soundName = isCorrect
            ? `${action}_success`
            : `${action}_fail`;
        playSound(soundName);

        // 판정 표시
        this.showJudgment(judgment);

        // 캐릭터 제거 마킹
        character.setJudgment(judgment);
        character.markForRemoval();

        // 200ms 후 캐릭터 교체
        setTimeout(() => {
            this.removeCharacter(0);
            this.fillCharacters();
        }, UI.CHARACTER_REMOVE_DELAY);

        console.log(`${judgment} | Stage ${stage} | ${isCorrect ? '✅' : '❌'} | Score: +${finalScore} | Combo: ${this.combo}`);
    }

    // ==============================================
    // 캐릭터 관리
    // ==============================================

    /**
     * 캐릭터 배열을 MAX_CHARACTERS까지 채웁니다.
     */
    fillCharacters() {
        this.fillCharactersAtTime(this.getNowSec());
    }

    /**
     * 특정 시간 기준으로 캐릭터를 채웁니다.
     *
     * @param {number} spawnTime - 생성 시간 (초)
     */
    fillCharactersAtTime(spawnTime) {
        while (this.characters.length < MAX_CHARACTERS) {
            // 랜덤 색상
            const color = COLOR_TYPES[Math.floor(Math.random() * COLOR_TYPES.length)];

            // 랜덤 캐릭터
            const { characterType, images } = getRandomCharacter(color);

            // 캐릭터 생성
            const character = new Character(
                color,
                characterType,
                spawnTime,
                this.characters.length,
                this.bpm,
                images
            );

            this.characters.push(character);
        }
    }

    /**
     * 특정 인덱스의 캐릭터를 제거합니다.
     *
     * @param {number} index - 제거할 인덱스
     */
    removeCharacter(index) {
        this.characters.splice(index, 1);

        // 위치 재조정
        this.characters.forEach((char, i) => {
            char.position = i;
        });
    }

    /**
     * 시간 초과된 캐릭터를 제거합니다.
     *
     * @param {number} currentTime - 현재 시간 (초)
     */
    removeTimedOutCharacters(currentTime) {
        this.characters = this.characters.filter(char => {
            const shouldRemove = char.shouldRemove(currentTime);

            if (shouldRemove && !char.judged) {
                // 자동 MISS 처리
                this.combo = 0;
                console.log('⏰ 자동 MISS (시간 초과)');
            }

            return !shouldRemove;
        });

        // 위치 재조정
        this.characters.forEach((char, i) => {
            char.position = i;
        });
    }

    // ==============================================
    // BPM 관리
    // ==============================================

    /**
     * 모든 캐릭터의 BPM을 업데이트합니다.
     *
     * @param {number} newBpm - 새 BPM
     */
    updateAllCharactersBPM(newBpm) {
        const currentTime = this.getNowSec();

        this.characters.forEach(char => {
            char.updateBPM(newBpm, currentTime);
        });
    }

    /**
     * 템포(BPM)를 변경합니다.
     *
     * @param {number} newBpm - 새 BPM
     */
    updateTempo(newBpm) {
        console.log(`🎵 BPM 변경: ${this.bpm} → ${newBpm}`);

        this.bpm = newBpm;
        this.ui.$bpm.value = newBpm;

        // 모든 캐릭터 업데이트
        this.updateAllCharactersBPM(newBpm);
    }

    // ==============================================
    // UI 업데이트
    // ==============================================

    /**
     * HUD를 업데이트합니다.
     */
    updateHUD() {
        this.ui.$score.textContent = formatScore(this.score);
        this.ui.$combo.textContent = this.combo;
        this.ui.$maxCombo.textContent = this.maxCombo;
        this.ui.$timer.textContent = Math.ceil(this.timeRemaining);
    }

    /**
     * 판정을 화면에 표시합니다.
     *
     * @param {string} judgment - 판정
     */
    showJudgment(judgment) {
        const $judgment = this.ui.$judgment;

        // 클래스 초기화
        $judgment.className = '';

        // 텍스트 설정
        $judgment.textContent = judgment;

        // 스타일 설정
        $judgment.style.color = getJudgmentColor(judgment);
        $judgment.style.fontSize = getJudgmentSize(judgment);
        $judgment.classList.add(getJudgmentClass(judgment));

        // 표시
        $judgment.classList.add('show');

        // 자동 숨김
        setTimeout(() => {
            $judgment.classList.remove('show');
        }, UI.JUDGMENT_DISPLAY_DURATION);
    }

    // ==============================================
    // 헬퍼 함수
    // ==============================================

    /**
     * 현재 게임 시간을 초 단위로 반환합니다.
     *
     * @returns {number} 현재 시간 (초)
     */
    getNowSec() {
        if (!this.running) return 0;
        return this.lastTime - this.startTime;
    }
}
