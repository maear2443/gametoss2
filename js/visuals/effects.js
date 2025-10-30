/**
 * ✨ 이펙트 시스템
 *
 * 파티클, 플래시, 플로팅 텍스트 등 시각 효과를 관리합니다.
 */

import { PARTICLE_COUNT, COLORS } from '../config/settings.js';

// ==============================================
// 이펙트 데이터 구조
// ==============================================

export const effects = {
    hitFlash: {
        active: false,
        alpha: 0,
        color: '#FFFFFF'
    },
    ring: {
        active: false,
        alpha: 0,
        radius: 0,
        color: '#FFFFFF'
    },
    particles: [],
    floatTexts: []
};

// ==============================================
// 플래시 효과
// ==============================================

/**
 * 화면 플래시 효과를 시작합니다.
 *
 * @param {string} color - 플래시 색상
 */
export function startHitFlash(color) {
    effects.hitFlash.active = true;
    effects.hitFlash.alpha = 0.6;
    effects.hitFlash.color = color;
}

// ==============================================
// 링 확산 효과 (현재 미사용)
// ==============================================

/**
 * 링 확산 효과를 시작합니다.
 *
 * @param {string} color - 링 색상
 */
export function startRing(color) {
    effects.ring.active = true;
    effects.ring.alpha = 1.0;
    effects.ring.radius = 0;
    effects.ring.color = color;
}

// ==============================================
// 파티클 효과
// ==============================================

/**
 * 파티클을 생성합니다.
 *
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {string} judgment - 판정 ('PERFECT', 'GOOD', 'NOTBAD', 'MISS')
 * @param {string} color - 파티클 색상
 */
export function createParticles(x, y, judgment, color) {
    const count = PARTICLE_COUNT[judgment] || PARTICLE_COUNT.MISS;

    for (let i = 0; i < count; i++) {
        // 랜덤 방향
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;

        effects.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 5,
            color: color,
            alpha: 1.0,
            life: 1.0
        });
    }
}

// ==============================================
// 플로팅 텍스트 효과
// ==============================================

/**
 * 플로팅 텍스트를 생성합니다.
 *
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {string} text - 표시할 텍스트
 * @param {string} color - 텍스트 색상
 * @param {string} size - 폰트 크기 (CSS 형식)
 */
export function createFloatText(x, y, text, color, size = '2rem') {
    effects.floatTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        size: size,
        alpha: 1.0,
        vy: -1.5, // 위로 상승 속도
        life: 1.0
    });
}

// ==============================================
// 이펙트 업데이트
// ==============================================

/**
 * 모든 이펙트를 업데이트합니다.
 *
 * @param {number} dt - 델타 타임 (초)
 */
export function updateEffects(dt) {
    // 플래시 페이드 아웃
    if (effects.hitFlash.active) {
        effects.hitFlash.alpha -= dt * 2.5;
        if (effects.hitFlash.alpha <= 0) {
            effects.hitFlash.active = false;
            effects.hitFlash.alpha = 0;
        }
    }

    // 링 확산 및 페이드 아웃
    if (effects.ring.active) {
        effects.ring.radius += dt * 300;
        effects.ring.alpha -= dt * 2.0;
        if (effects.ring.alpha <= 0) {
            effects.ring.active = false;
            effects.ring.alpha = 0;
            effects.ring.radius = 0;
        }
    }

    // 파티클 업데이트
    effects.particles = effects.particles.filter(p => {
        // 위치 업데이트
        p.x += p.vx;
        p.y += p.vy;

        // 중력 효과
        p.vy += 0.2;

        // 라이프 감소
        p.life -= dt * 1.0;
        p.alpha = p.life;

        // 살아있는 파티클만 유지
        return p.life > 0;
    });

    // 플로팅 텍스트 업데이트
    effects.floatTexts = effects.floatTexts.filter(t => {
        // 위치 업데이트
        t.y += t.vy;

        // 라이프 감소
        t.life -= dt * 1.5;
        t.alpha = t.life;

        // 살아있는 텍스트만 유지
        return t.life > 0;
    });
}

// ==============================================
// 이펙트 렌더링
// ==============================================

/**
 * 플래시 효과를 렌더링합니다.
 *
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} width - 캔버스 너비
 * @param {number} height - 캔버스 높이
 */
export function renderFlash(ctx, width, height) {
    if (!effects.hitFlash.active) return;

    ctx.save();
    ctx.fillStyle = effects.hitFlash.color;
    ctx.globalAlpha = effects.hitFlash.alpha;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

/**
 * 링 효과를 렌더링합니다.
 *
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 * @param {number} centerX - 중심 X 좌표
 * @param {number} centerY - 중심 Y 좌표
 */
export function renderRing(ctx, centerX, centerY) {
    if (!effects.ring.active) return;

    ctx.save();
    ctx.strokeStyle = effects.ring.color;
    ctx.globalAlpha = effects.ring.alpha;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, effects.ring.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/**
 * 파티클을 렌더링합니다.
 *
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 */
export function renderParticles(ctx) {
    effects.particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

/**
 * 플로팅 텍스트를 렌더링합니다.
 *
 * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
 */
export function renderFloatTexts(ctx) {
    effects.floatTexts.forEach(t => {
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.globalAlpha = t.alpha;
        ctx.font = `bold ${t.size} Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000000';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
}

// ==============================================
// 이펙트 초기화
// ==============================================

/**
 * 모든 이펙트를 초기화합니다.
 */
export function clearEffects() {
    effects.hitFlash.active = false;
    effects.hitFlash.alpha = 0;
    effects.ring.active = false;
    effects.ring.alpha = 0;
    effects.ring.radius = 0;
    effects.particles = [];
    effects.floatTexts = [];
}
