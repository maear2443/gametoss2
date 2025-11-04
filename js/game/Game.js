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
        this.gameDuration = GAME_DURATION; // 동적으로 설정 가능
        this.timeRemaining = this.gameDuration;

        // 비트맵 모드
        this.beatmap = null;
        this.beatmapEnabled = false;
        this.nextBeatIndex = 0;

        // 🆕 스테이지 기반 시스템
        this.gamePhase = 'DROP_PHASE'; // DROP_PHASE, READY_PHASE, PLAY_PHASE, CLEAR_PHASE
        this.currentStage = 1;
        this.dropsInCurrentStage = 0;
        this.maxDropsPerStage = 7;
        this.clearedInCurrentStage = 0;
        this.phaseStartTime = 0;
        this.playPhaseTimeLimit = 10.0; // 10초 제한 (7개 인형 여유있게 처리)
        this.readyPhaseDelay = 1.0; // 준비 시간 1초

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

        // 게임 상태 설정
        this.running = true;
        this.startTime = performance.now() / 1000;
        this.lastTime = this.startTime;

        // 🆕 DROP_PHASE 시작 시간 설정 (중복 생성 방지)
        this.phaseStartTime = this.startTime;

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
        this.timeRemaining = this.gameDuration; // 동적 게임 시간 사용
        this.characters = [];
        this.nextBeatIndex = 0; // 비트맵 인덱스 리셋

        // 🆕 스테이지 시스템 초기화
        this.gamePhase = 'DROP_PHASE';
        this.currentStage = 1;
        this.dropsInCurrentStage = 0;
        this.clearedInCurrentStage = 0;
        this.phaseStartTime = 0;

        // 이펙트 초기화
        clearEffects();
        clearAnimations();

        // 음악 리셋
        resetMusic();

        // 🆕 비트맵 모드일 때는 빈 화면으로 시작 (DROP_PHASE에서 인형이 떨어짐)
        // 기본 모드일 때만 초기 캐릭터 생성
        if (!this.beatmapEnabled) {
            this.fillCharactersAtTime(0);
        }

        // 🆕 스테이지 타이머 숨기기
        if (this.ui.$stageTimer) {
            this.ui.$stageTimer.classList.add('hidden');
        }

        // UI 업데이트
        this.updateHUD();
        this.ui.$startBtn.textContent = '시작 (Space)';
        this.ui.$gameOver.classList.add('hidden');

        // 판정 표시 숨김
        this.ui.$judgment.classList.remove('show');
        this.ui.$judgment.textContent = '';

        // 초기 렌더링
        render(this.characters, 0);

        console.log(`Reset: ${this.beatmapEnabled ? '비트맵 모드' : '기본 모드'}, Created ${this.characters.length} characters`);
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
        this.timeRemaining = Math.max(0, this.gameDuration - elapsedTime);

        // 타임아웃 체크
        if (this.timeRemaining <= 0) {
            this.end();
            return;
        }

        // 🆕 스테이지 기반 시스템
        if (this.beatmapEnabled) {
            this.updateStageBasedGameplay(this.getNowSec());
        } else {
            // 기본 모드 (비트맵 없을 때)
            this.removeTimedOutCharacters(this.getNowSec());
            this.fillCharacters();
        }

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

        // 캐릭터 위치 계산 (renderer.js와 동일한 로직)
        const x = this.ui.$canvas.width / 2;
        const bottomY = this.ui.$canvas.height * 0.85; // 제일 밑 캐릭터 위치
        const y = bottomY; // 첫 번째 캐릭터는 제일 밑

        createParticles(x, y, judgment, color);
        createFloatText(x + 60, y, getJudgmentText(judgment, finalScore), color, '2rem');

        // 애니메이션 발동 (제일 밑 캐릭터 위치)
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

        // 캐릭터 판정 기록
        character.setJudgment(judgment);

        // 🆕 날아가는 애니메이션 시작 (왼쪽 또는 오른쪽)
        const flyDirection = action === 'approve' ? 1 : -1; // approve = 오른쪽, reject = 왼쪽
        character.startFlyOut(currentTime, flyDirection);

        // 300ms 후 캐릭터 제거 (날아가는 애니메이션 완료 후)
        setTimeout(() => {
            // 아직 첫 번째 캐릭터가 맞는지 확인 (게임 루프에서 이미 제거되지 않았는지)
            if (this.characters.length > 0 && this.characters[0] === character) {
                this.removeCharacter(0);
                // 비트맵 모드가 아닐 때만 자동으로 채움
                if (!this.beatmapEnabled) {
                    this.fillCharacters();
                }
            }
        }, 300); // 날아가는 애니메이션 시간 (0.3초)

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
        const wasEmpty = this.characters.length === 0;

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

        // 첫 번째 캐릭터만 활성화 (제일 밑)
        if (wasEmpty && this.characters.length > 0) {
            this.characters[0].activate(spawnTime);
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

        // 첫 번째 캐릭터를 제거한 경우, 새로운 첫 번째 캐릭터 활성화
        if (index === 0 && this.characters.length > 0) {
            const currentTime = this.getNowSec();
            this.characters[0].activate(currentTime);
            console.log(`✅ 새로운 첫 번째 캐릭터 활성화 (${this.characters[0].color} ${this.characters[0].characterType})`);
        }
    }

    /**
     * 시간 초과된 캐릭터를 제거합니다.
     *
     * @param {number} currentTime - 현재 시간 (초)
     */
    removeTimedOutCharacters(currentTime) {
        const firstCharWasRemoved = this.characters.length > 0 &&
            this.characters[0].active &&
            currentTime >= this.characters[0].stage3EndTime &&
            !this.characters[0].judged;

        this.characters = this.characters.filter(char => {
            // 시간 초과만 체크 (판정받은 캐릭터는 handleAction에서 제거)
            const isTimedOut = char.active && currentTime >= char.stage3EndTime && !char.judged;

            if (isTimedOut) {
                // 자동 MISS 처리
                this.combo = 0;
                console.log('⏰ 자동 MISS (시간 초과)');
            }

            return !isTimedOut;
        });

        // 위치 재조정
        this.characters.forEach((char, i) => {
            char.position = i;
        });

        // 첫 번째 캐릭터가 제거되었으면 새로운 첫 번째 활성화
        if (firstCharWasRemoved && this.characters.length > 0 && !this.characters[0].active) {
            this.characters[0].activate(currentTime);
            console.log(`✅ 시간 초과로 새로운 첫 번째 캐릭터 활성화`);
        }
    }

    // ==============================================
    // 스테이지 기반 시스템
    // ==============================================

    /**
     * 🆕 스테이지 기반 게임플레이 업데이트
     *
     * @param {number} currentTime - 현재 시간 (초)
     */
    updateStageBasedGameplay(currentTime) {
        switch (this.gamePhase) {
            case 'DROP_PHASE':
                this.updateDropPhase(currentTime);
                break;
            case 'READY_PHASE':
                this.updateReadyPhase(currentTime);
                break;
            case 'PLAY_PHASE':
                this.updatePlayPhase(currentTime);
                break;
            case 'CLEAR_PHASE':
                this.updateClearPhase(currentTime);
                break;
        }
    }

    /**
     * 드롭 페이즈: 비트마다 인형이 떨어짐
     */
    updateDropPhase(currentTime) {
        if (!this.beatmap || !this.beatmap.game_events) return;

        const events = this.beatmap.game_events;

        // 다음 비트 이벤트 확인
        while (this.nextBeatIndex < events.length && this.dropsInCurrentStage < this.maxDropsPerStage) {
            const event = events[this.nextBeatIndex];

            // 아직 시간이 안 됨
            if (event.time > currentTime) {
                break;
            }

            // 인형 드롭!
            const color = COLOR_TYPES[Math.floor(Math.random() * COLOR_TYPES.length)];
            const { characterType, images } = getRandomCharacter(color);

            const character = new Character(
                color,
                characterType,
                currentTime,
                this.characters.length,
                this.bpm,
                images
            );

            this.characters.push(character);
            this.dropsInCurrentStage++;

            console.log(`💧 드롭! (${this.dropsInCurrentStage}/${this.maxDropsPerStage}) ${color} ${characterType}`);

            this.nextBeatIndex++;

            // 7개 쌓이면 준비 페이즈로!
            if (this.dropsInCurrentStage >= this.maxDropsPerStage) {
                this.startReadyPhase(currentTime);
                break;
            }
        }
    }

    /**
     * 🆕 준비 페이즈 시작
     */
    startReadyPhase(currentTime) {
        this.gamePhase = 'READY_PHASE';
        this.phaseStartTime = currentTime;

        // 🆕 스테이지 시작 메시지 표시
        this.showStageMessage(`STAGE ${this.currentStage}`, 'stage-start', 1000);

        console.log(`⏸️ 준비 중... (스테이지 ${this.currentStage})`);
    }

    /**
     * 🆕 준비 페이즈: 1초 대기
     */
    updateReadyPhase(currentTime) {
        const elapsedTime = currentTime - this.phaseStartTime;

        if (elapsedTime >= this.readyPhaseDelay) {
            this.startPlayPhase(currentTime);
        }
    }

    /**
     * 플레이 페이즈 시작
     */
    startPlayPhase(currentTime) {
        this.gamePhase = 'PLAY_PHASE';
        this.phaseStartTime = currentTime;

        // 🆕 스테이지 타이머 표시 (READY_PHASE 끝나고 표시)
        this.ui.$stageTimer.classList.remove('hidden');
        this.ui.$stageTimer.classList.remove('warning');

        // 🆕 인형들은 비활성 상태 유지 (밝은 상태)
        // 제일 밑 인형만 활성화
        if (this.characters.length > 0) {
            this.characters[0].activate(currentTime);
            console.log(`✅ 제일 밑 인형 활성화 (${this.characters[0].color} ${this.characters[0].characterType})`);
        }

        console.log(`🎮 플레이 페이즈 시작! (스테이지 ${this.currentStage}) - 10초 안에 모든 인형 처리!`);
    }

    /**
     * 플레이 페이즈: 제일 밑부터 처리
     */
    updatePlayPhase(currentTime) {
        // 🆕 10초 제한 체크
        const elapsedTime = currentTime - this.phaseStartTime;
        const timeRemaining = this.playPhaseTimeLimit - elapsedTime;

        // 🆕 타이머 업데이트
        if (this.ui.$stageTimerValue) {
            this.ui.$stageTimerValue.textContent = Math.max(0, timeRemaining).toFixed(1);

            // 3초 이하일 때 경고 표시
            if (timeRemaining <= 3.0 && timeRemaining > 0) {
                this.ui.$stageTimer.classList.add('warning');
            }
        }

        if (elapsedTime >= this.playPhaseTimeLimit) {
            // 타이머 숨기기
            this.ui.$stageTimer.classList.add('hidden');

            // 시간 초과! 남은 인형들 아래로 떨어뜨리기
            if (this.characters.length > 0) {
                console.log(`⏰ 플레이 페이즈 시간 초과! 남은 인형 ${this.characters.length}개 떨어뜨림`);
                this.combo = 0; // 콤보 초기화

                // 🆕 모든 남은 인형에 아래로 떨어지는 애니메이션 시작
                this.characters.forEach(char => {
                    char.startFallDown(currentTime);
                });

                // 0.5초 후에 인형들 제거 (애니메이션 완료 후)
                setTimeout(() => {
                    this.characters = [];
                    this.startClearPhase(this.getNowSec());
                }, 500);

                return;
            }
            this.startClearPhase(currentTime);
            return;
        }

        // 시간 초과 캐릭터 제거
        this.removeTimedOutCharacters(currentTime);

        // 모두 처리했으면 클리어 페이즈로
        if (this.characters.length === 0) {
            // 타이머 숨기기
            this.ui.$stageTimer.classList.add('hidden');
            this.startClearPhase(currentTime);
        }
    }

    /**
     * 클리어 페이즈 시작
     */
    startClearPhase(currentTime) {
        this.gamePhase = 'CLEAR_PHASE';
        this.phaseStartTime = currentTime;

        // 🆕 스테이지 클리어 메시지 표시
        this.showStageMessage(`STAGE ${this.currentStage} CLEAR!`, 'stage-clear', 2000);

        console.log(`✅ 스테이지 ${this.currentStage} 클리어!`);
    }

    /**
     * 클리어 페이즈: 잠깐 쉬고 다음 스테이지
     */
    updateClearPhase(currentTime) {
        const clearDelay = 1.0; // 1초 대기

        if (currentTime - this.phaseStartTime >= clearDelay) {
            this.startNextStage(currentTime);
        }
    }

    /**
     * 다음 스테이지 시작
     */
    startNextStage(currentTime) {
        this.currentStage++;
        this.gamePhase = 'DROP_PHASE';
        this.dropsInCurrentStage = 0;
        this.clearedInCurrentStage = 0;
        this.phaseStartTime = currentTime;

        console.log(`🎬 스테이지 ${this.currentStage} 시작!`);
    }

    // ==============================================
    // 비트맵 모드 (기존 - 사용 안 함)
    // ==============================================

    /**
     * 비트맵에 따라 캐릭터를 생성합니다.
     *
     * @param {number} currentTime - 현재 시간 (초)
     */
    updateBeatmapSpawns(currentTime) {
        if (!this.beatmap || !this.beatmap.game_events) return;

        const events = this.beatmap.game_events;

        // 다음 비트 이벤트 확인
        while (this.nextBeatIndex < events.length) {
            const event = events[this.nextBeatIndex];

            // 아직 시간이 안 됨
            if (event.time > currentTime) {
                break;
            }

            // 이벤트 처리 (캐릭터 생성)
            if (event.type === 'spawn_character' && this.characters.length < MAX_CHARACTERS) {
                // 랜덤 색상
                const color = COLOR_TYPES[Math.floor(Math.random() * COLOR_TYPES.length)];

                // 랜덤 캐릭터
                const { characterType, images } = getRandomCharacter(color);

                // 캐릭터 생성
                const character = new Character(
                    color,
                    characterType,
                    currentTime,
                    this.characters.length,
                    this.bpm,
                    images
                );

                this.characters.push(character);

                // 첫 번째 캐릭터면 활성화
                if (this.characters.length === 1) {
                    character.activate(currentTime);
                }

                console.log(`🎼 비트 이벤트 (${event.beat_index}): ${color} ${characterType} @ ${event.time.toFixed(2)}s`);
            }

            this.nextBeatIndex++;
        }
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
        this.ui.$bpm.textContent = newBpm;

        // 모든 캐릭터 업데이트
        this.updateAllCharactersBPM(newBpm);
    }

    /**
     * 게임 시간을 설정합니다.
     *
     * @param {number} duration - 게임 시간 (초)
     */
    setGameDuration(duration) {
        console.log(`⏱️ 게임 시간 설정: ${duration}초`);
        this.gameDuration = duration;
        this.timeRemaining = duration;
    }

    /**
     * 비트맵을 설정합니다.
     *
     * @param {Object|null} beatmap - 비트맵 데이터 (null이면 비트맵 모드 해제)
     */
    setBeatmap(beatmap) {
        this.beatmap = beatmap;
        this.beatmapEnabled = beatmap !== null;
        this.nextBeatIndex = 0;

        if (this.beatmapEnabled) {
            console.log(`🎼 비트맵 모드 활성화! (이벤트: ${beatmap.game_events.length}개)`);
        } else {
            console.log('⚠️ 기본 모드로 전환');
        }
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

    /**
     * 🆕 스테이지 메시지를 화면에 표시합니다.
     *
     * @param {string} message - 메시지 텍스트
     * @param {string} className - CSS 클래스명 ('stage-start' 또는 'stage-clear')
     * @param {number} duration - 표시 시간 (밀리초)
     */
    showStageMessage(message, className, duration) {
        const $stageMessage = this.ui.$stageMessage;

        // 클래스 초기화
        $stageMessage.className = '';

        // 텍스트 설정
        $stageMessage.textContent = message;

        // 클래스 추가
        $stageMessage.classList.add(className);

        // 표시
        $stageMessage.classList.remove('hidden');

        // 자동 숨김
        setTimeout(() => {
            $stageMessage.classList.add('hidden');
        }, duration);
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
