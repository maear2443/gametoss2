/**
 * 🎬 애니메이션 시스템
 *
 * 망치와 기계팔 애니메이션을 관리합니다.
 */

import { ANIMATION_SPEED } from '../config/settings.js';

// ==============================================
// 애니메이션 데이터 구조
// ==============================================

export const animations = {
    hammer: {
        active: false,
        progress: 0,    // 0.0 ~ 1.0
        x: 0,
        y: 0
    },
    robotArm: {
        active: false,
        progress: 0,    // 0.0 ~ 1.0
        x: 0,
        y: 0
    }
};

// ==============================================
// 애니메이션 트리거
// ==============================================

/**
 * 망치 애니메이션을 시작합니다 (red 캐릭터용).
 *
 * @param {number} x - 애니메이션 X 좌표
 * @param {number} y - 애니메이션 Y 좌표
 */
export function triggerHammer(x, y) {
    animations.hammer.active = true;
    animations.hammer.progress = 0;
    animations.hammer.x = x;
    animations.hammer.y = y;
}

/**
 * 기계팔 애니메이션을 시작합니다 (blue 캐릭터용).
 *
 * @param {number} x - 애니메이션 X 좌표
 * @param {number} y - 애니메이션 Y 좌표
 */
export function triggerRobotArm(x, y) {
    animations.robotArm.active = true;
    animations.robotArm.progress = 0;
    animations.robotArm.x = x;
    animations.robotArm.y = y;
}

// ==============================================
// 애니메이션 업데이트
// ==============================================

/**
 * 모든 애니메이션을 업데이트합니다.
 *
 * @param {number} dt - 델타 타임 (초)
 */
export function updateAnimations(dt) {
    // 망치 애니메이션 업데이트
    if (animations.hammer.active) {
        animations.hammer.progress += dt * ANIMATION_SPEED.HAMMER;

        if (animations.hammer.progress >= 1.0) {
            animations.hammer.active = false;
            animations.hammer.progress = 0;
        }
    }

    // 기계팔 애니메이션 업데이트
    if (animations.robotArm.active) {
        animations.robotArm.progress += dt * ANIMATION_SPEED.ROBOT_ARM;

        if (animations.robotArm.progress >= 1.0) {
            animations.robotArm.active = false;
            animations.robotArm.progress = 0;
        }
    }
}

// ==============================================
// 애니메이션 렌더링
// ==============================================

/**
 * 망치 애니메이션을 렌더링합니다.
 *
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 */
export function renderHammer(ctx) {
    if (!animations.hammer.active) return;

    const { x, y, progress } = animations.hammer;

    // 이징 함수: easeOutBounce
    const easedProgress = easeOutBounce(progress);

    ctx.save();

    // 망치 위치 계산 (위에서 아래로)
    const startY = y - 100;
    const endY = y;
    const currentY = startY + (endY - startY) * easedProgress;

    // 회전 각도 (내려칠 때 회전)
    const rotation = progress * Math.PI * 0.25;

    ctx.translate(x, currentY);
    ctx.rotate(rotation);

    // 망치 그리기
    // 손잡이
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-5, -40, 10, 40);

    // 망치 머리
    ctx.fillStyle = '#666666';
    ctx.fillRect(-20, -50, 40, 20);

    // 금속 광택 효과
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(-15, -48, 10, 5);

    ctx.restore();
}

/**
 * 기계팔 애니메이션을 렌더링합니다.
 *
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 */
export function renderRobotArm(ctx) {
    if (!animations.robotArm.active) return;

    const { x, y, progress } = animations.robotArm;

    // 이징 함수: easeInOutCubic
    const easedProgress = easeInOutCubic(progress);

    ctx.save();

    // 기계팔 위치 계산 (오른쪽에서 왼쪽으로)
    const startX = x + 100;
    const endX = x;
    const currentX = startX + (endX - startX) * easedProgress;

    // 집게 열림/닫힘 애니메이션
    const clawOpen = progress < 0.5 ? 20 : 20 - (progress - 0.5) * 40;

    ctx.translate(currentX, y);

    // 기계팔 본체
    ctx.fillStyle = '#4A5568';
    ctx.fillRect(-30, -8, 60, 16);

    // 관절
    ctx.fillStyle = '#2D3748';
    ctx.beginPath();
    ctx.arc(-30, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // 집게 (위)
    ctx.fillStyle = '#718096';
    ctx.fillRect(25, -clawOpen, 30, 8);

    // 집게 (아래)
    ctx.fillRect(25, clawOpen - 8, 30, 8);

    // 금속 광택
    ctx.fillStyle = '#A0AEC0';
    ctx.fillRect(-25, -4, 50, 3);

    ctx.restore();
}

// ==============================================
// 이징 함수
// ==============================================

/**
 * easeOutBounce 이징 함수
 *
 * @param {number} t - 진행도 (0.0 ~ 1.0)
 * @returns {number} 이징된 값
 */
function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}

/**
 * easeInOutCubic 이징 함수
 *
 * @param {number} t - 진행도 (0.0 ~ 1.0)
 * @returns {number} 이징된 값
 */
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ==============================================
// 애니메이션 초기화
// ==============================================

/**
 * 모든 애니메이션을 초기화합니다.
 */
export function clearAnimations() {
    animations.hammer.active = false;
    animations.hammer.progress = 0;
    animations.robotArm.active = false;
    animations.robotArm.progress = 0;
}
