/**
 * 🎭 캐릭터 클래스
 *
 * 개별 캐릭터의 생명주기, 단계 변화, 렌더링을 관리합니다.
 */

import { STAGE_DURATIONS, beatsToSeconds, CHARACTER_SIZE, GLOW, PULSE, COLORS, DEBUG } from '../config/settings.js';

export class Character {
    /**
     * 캐릭터 생성
     *
     * @param {string} color - 캐릭터 색상 ('red' 또는 'blue')
     * @param {string} characterType - 캐릭터 타입 ('bear', 'cat', 등)
     * @param {number} spawnTime - 생성 시간 (초)
     * @param {number} position - 화면 위치 (0-6)
     * @param {number} bpm - 현재 BPM
     * @param {Object} images - 3단계 이미지 { stage1, stage2, stage3 }
     */
    constructor(color, characterType, spawnTime, position, bpm, images) {
        this.color = color;
        this.characterType = characterType;
        this.spawnTime = spawnTime;
        this.position = position;
        this.bpm = bpm;
        this.images = images;

        // 활성화 상태 (제일 밑의 캐릭터만 활성화)
        this.active = false;
        this.activatedTime = null;

        // 판정 상태
        this.judged = false;
        this.result = null;

        // 🆕 드롭 애니메이션
        this.isDropping = true; // 떨어지는 중
        this.dropStartTime = spawnTime;
        this.dropDuration = 0.3; // 0.3초 동안 떨어짐

        // 🆕 날아가는 애니메이션
        this.isFlyingOut = false;
        this.flyStartTime = 0;
        this.flyDuration = 0.3; // 0.3초 동안 날아감
        this.flyDirection = 1; // 1: 오른쪽, -1: 왼쪽

        // BPM 기반 타이밍 계산
        this.calculateTiming();
    }

    /**
     * BPM 기반으로 각 단계의 종료 시간을 계산합니다.
     */
    calculateTiming() {
        const stage1Duration = beatsToSeconds(STAGE_DURATIONS.stage1, this.bpm);
        const stage2Duration = beatsToSeconds(STAGE_DURATIONS.stage2, this.bpm);
        const stage3Duration = beatsToSeconds(STAGE_DURATIONS.stage3, this.bpm);

        this.stage1EndTime = this.spawnTime + stage1Duration;
        this.stage2EndTime = this.stage1EndTime + stage2Duration;
        this.stage3EndTime = this.stage2EndTime + stage3Duration;
    }

    /**
     * BPM 변경 시 타이밍을 재계산합니다.
     *
     * @param {number} newBpm - 새로운 BPM
     * @param {number} currentTime - 현재 시간 (초)
     */
    updateBPM(newBpm, currentTime) {
        // 현재 진행 상태를 비트 단위로 계산
        const elapsedTime = currentTime - this.spawnTime;
        const oldBeatsPerSecond = this.bpm / 60;
        const elapsedBeats = elapsedTime * oldBeatsPerSecond;

        // 새 BPM 적용
        this.bpm = newBpm;
        const newBeatsPerSecond = newBpm / 60;

        // 새로운 spawnTime 계산 (진행 상태 유지)
        this.spawnTime = currentTime - (elapsedBeats / newBeatsPerSecond);

        // 타이밍 재계산
        this.calculateTiming();
    }

    /**
     * 캐릭터를 활성화합니다 (제일 밑으로 왔을 때).
     *
     * @param {number} currentTime - 활성화 시간 (초)
     */
    activate(currentTime) {
        this.active = true;
        this.activatedTime = currentTime;
        this.spawnTime = currentTime;
        this.calculateTiming();
    }

    /**
     * 현재 시간 기준으로 캐릭터의 단계를 반환합니다.
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {number} 현재 단계 (1, 2, 3, 4)
     *                   4는 시간 초과 상태 (자동 MISS)
     */
    getStage(currentTime) {
        // 비활성화된 캐릭터는 항상 Stage 1 (대기 상태)
        if (!this.active) {
            return 1;
        }

        if (currentTime < this.stage1EndTime) {
            return 1;
        } else if (currentTime < this.stage2EndTime) {
            return 2;
        } else if (currentTime < this.stage3EndTime) {
            return 3;
        } else {
            return 4; // 시간 초과
        }
    }

    /**
     * 현재 단계에 맞는 이미지를 반환합니다.
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {Image|null} 현재 단계의 이미지
     */
    getImage(currentTime) {
        // 비활성 캐릭터는 항상 밝은 상태 (stage3)
        if (!this.active) {
            return this.images.stage3;
        }

        const stage = this.getStage(currentTime);
        let image;

        switch (stage) {
            case 1:
                image = this.images.stage1;
                break;
            case 2:
                image = this.images.stage2;
                break;
            case 3:
                image = this.images.stage3;
                break;
            default:
                image = this.images.stage3; // 시간 초과 시에도 stage3 이미지 사용
        }

        // 디버그: 첫 번째 캐릭터만 로그
        if (this.position === 0 && Math.random() < 0.01) {
            console.log(`[${this.color}] Stage ${stage}, Image exists:`, {
                stage1: !!this.images.stage1,
                stage2: !!this.images.stage2,
                stage3: !!this.images.stage3,
                currentImage: !!image
            });
        }

        return image;
    }

    /**
     * 현재 단계 내에서의 진행도를 반환합니다 (0.0 ~ 1.0).
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {number} 진행도 (0.0 ~ 1.0)
     */
    getStageProgress(currentTime) {
        const stage = this.getStage(currentTime);

        let stageStartTime, stageEndTime;

        switch (stage) {
            case 1:
                stageStartTime = this.spawnTime;
                stageEndTime = this.stage1EndTime;
                break;
            case 2:
                stageStartTime = this.stage1EndTime;
                stageEndTime = this.stage2EndTime;
                break;
            case 3:
                stageStartTime = this.stage2EndTime;
                stageEndTime = this.stage3EndTime;
                break;
            default:
                return 1.0;
        }

        const elapsed = currentTime - stageStartTime;
        const duration = stageEndTime - stageStartTime;

        return Math.min(1.0, Math.max(0.0, elapsed / duration));
    }

    /**
     * 펄스(맥동) 효과 값을 반환합니다.
     * 단계가 높을수록 강하게 맥동합니다.
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {number} 펄스 스케일 (0.85 ~ 1.15)
     */
    getPulse(currentTime) {
        // 비활성화된 캐릭터는 펄스 없음
        if (!this.active) {
            return 1.0;
        }

        const stage = this.getStage(currentTime);
        let pulseConfig;

        switch (stage) {
            case 1:
                pulseConfig = PULSE.STAGE1;
                break;
            case 2:
                pulseConfig = PULSE.STAGE2;
                break;
            case 3:
            default:
                pulseConfig = PULSE.STAGE3;
                break;
        }

        // 사인파를 사용한 부드러운 맥동
        const phase = currentTime * pulseConfig.speed * Math.PI * 2;
        const sine = Math.sin(phase);

        // -1 ~ 1 범위를 min ~ max 범위로 변환
        const range = pulseConfig.max - pulseConfig.min;
        return pulseConfig.min + (sine + 1) * 0.5 * range;
    }

    /**
     * 캔버스에 캐릭터를 그립니다.
     *
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {number} currentTime - 현재 시간 (초)
     * @param {number} x - X 좌표
     * @param {number} y - Y 좌표
     */
    draw(ctx, currentTime, x, y) {
        const stage = this.getStage(currentTime);
        const image = this.getImage(currentTime);
        const pulse = this.getPulse(currentTime);
        const size = CHARACTER_SIZE * pulse;

        // 글로우 효과 설정
        let glowConfig;

        // 비활성 캐릭터는 밝고 선명하게 (대기 중)
        if (!this.active) {
            glowConfig = {
                blur: 5,
                alpha: 1.0  // 완전히 불투명
            };
        } else {
            switch (stage) {
                case 1:
                    glowConfig = GLOW.STAGE1;
                    break;
                case 2:
                    glowConfig = GLOW.STAGE2;
                    break;
                case 3:
                default:
                    glowConfig = GLOW.STAGE3;
                    break;
            }
        }

        ctx.save();

        // 글로우 효과
        ctx.shadowBlur = glowConfig.blur;
        ctx.shadowColor = this.color === 'red' ? COLORS.RED : COLORS.BLUE;
        ctx.globalAlpha = glowConfig.alpha;

        // 이미지가 로드되었으면 그리기
        if (image && image.complete && image.naturalHeight !== 0) {
            ctx.drawImage(
                image,
                x - size / 2,
                y - size / 2,
                size,
                size
            );
        } else {
            // Fallback: 이미지 로딩 실패 시 색상 박스 그리기
            ctx.fillStyle = this.color === 'red' ? COLORS.RED : COLORS.BLUE;
            ctx.fillRect(
                x - size / 2,
                y - size / 2,
                size,
                size
            );
        }

        ctx.restore();

        // 디버그: 단계 번호 표시
        if (DEBUG.SHOW_STAGE_NUMBERS) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${stage}`, x, y);
        }

        // 디버그: 히트박스 표시
        if (DEBUG.SHOW_HITBOXES) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                x - size / 2,
                y - size / 2,
                size,
                size
            );
        }
    }

    /**
     * 캐릭터가 제거되어야 하는지 확인합니다.
     * (시간 초과 또는 이미 판정됨)
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {boolean} 제거 여부
     */
    shouldRemove(currentTime) {
        // 활성화된 캐릭터만 시간 초과 체크
        if (this.active && currentTime >= this.stage3EndTime) {
            return true;
        }

        // 이미 판정받고 제거 마킹됨
        if (this.judged && this.markedForRemoval) {
            return true;
        }

        return false;
    }

    /**
     * 판정 결과를 저장합니다.
     *
     * @param {string} judgment - 판정 ('PERFECT', 'GOOD', 'NOTBAD', 'MISS')
     */
    setJudgment(judgment) {
        this.judged = true;
        this.result = judgment;
    }

    /**
     * 제거 마킹을 설정합니다.
     */
    markForRemoval() {
        this.markedForRemoval = true;
    }

    /**
     * 🆕 드롭 애니메이션 진행도를 반환합니다 (0.0 ~ 1.0).
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {number} 진행도 (0.0 ~ 1.0)
     */
    getDropProgress(currentTime) {
        if (!this.isDropping) return 1.0;

        const elapsed = currentTime - this.dropStartTime;
        const progress = Math.min(1.0, elapsed / this.dropDuration);

        // 드롭 완료
        if (progress >= 1.0) {
            this.isDropping = false;
        }

        return progress;
    }

    /**
     * 🆕 날아가는 애니메이션을 시작합니다.
     *
     * @param {number} currentTime - 시작 시간 (초)
     * @param {number} direction - 방향 (1: 오른쪽, -1: 왼쪽)
     */
    startFlyOut(currentTime, direction = 1) {
        this.isFlyingOut = true;
        this.flyStartTime = currentTime;
        this.flyDirection = direction;
    }

    /**
     * 🆕 날아가는 애니메이션 진행도를 반환합니다 (0.0 ~ 1.0).
     *
     * @param {number} currentTime - 현재 시간 (초)
     * @returns {number} 진행도 (0.0 ~ 1.0)
     */
    getFlyProgress(currentTime) {
        if (!this.isFlyingOut) return 0.0;

        const elapsed = currentTime - this.flyStartTime;
        const progress = Math.min(1.0, elapsed / this.flyDuration);

        return progress;
    }
}
