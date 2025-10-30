/**
 * 🎨 렌더러
 *
 * 캔버스에 모든 비주얼 요소를 그립니다.
 */

import { CHARACTER_SPACING } from '../config/settings.js';
import {
    renderFlash,
    renderRing,
    renderParticles,
    renderFloatTexts
} from './effects.js';
import {
    renderHammer,
    renderRobotArm
} from './animations.js';

// ==============================================
// 캔버스 설정
// ==============================================

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;

/**
 * 캔버스를 초기화하고 리사이즈 이벤트를 등록합니다.
 *
 * @param {HTMLCanvasElement} canvasElement - 캔버스 요소
 * @returns {CanvasRenderingContext2D} 캔버스 컨텍스트
 */
export function initCanvas(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');

    // 초기 크기 설정
    resizeCanvas();

    // 리사이즈 이벤트 등록
    window.addEventListener('resize', resizeCanvas);

    return ctx;
}

/**
 * 캔버스 크기를 조정합니다.
 */
function resizeCanvas() {
    if (!canvas) return;

    const container = canvas.parentElement;
    width = container.clientWidth;
    height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;
}

/**
 * 캔버스 크기를 반환합니다.
 *
 * @returns {{width: number, height: number}} 캔버스 크기
 */
export function getCanvasSize() {
    return { width, height };
}

// ==============================================
// 메인 렌더링 함수
// ==============================================

/**
 * 게임 화면을 렌더링합니다.
 *
 * @param {Character[]} characters - 캐릭터 배열
 * @param {number} currentTime - 현재 시간 (초)
 */
export function render(characters, currentTime) {
    if (!ctx) return;

    // 배경 그리기
    renderBackground();

    // 플래시 효과
    renderFlash(ctx, width, height);

    // 캐릭터 그리기
    renderCharacters(characters, currentTime);

    // 파티클 효과
    renderParticles(ctx);

    // 플로팅 텍스트
    renderFloatTexts(ctx);

    // 애니메이션 (망치, 기계팔)
    renderHammer(ctx);
    renderRobotArm(ctx);

    // 링 효과 (중앙)
    renderRing(ctx, width / 2, height / 2);
}

// ==============================================
// 배경 렌더링
// ==============================================

/**
 * 배경 그라데이션을 그립니다.
 */
function renderBackground() {
    // 그라데이션 생성
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 격자 패턴 (선택적)
    renderGrid();
}

/**
 * 격자 패턴을 그립니다 (공장 느낌).
 */
function renderGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // 세로 선
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // 가로 선
    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    ctx.restore();
}

// ==============================================
// 캐릭터 렌더링
// ==============================================

/**
 * 모든 캐릭터를 그립니다.
 * 첫 번째 캐릭터(index 0)가 제일 밑에 위치합니다.
 *
 * @param {Character[]} characters - 캐릭터 배열
 * @param {number} currentTime - 현재 시간 (초)
 */
function renderCharacters(characters, currentTime) {
    const centerX = width / 2;
    // 첫 번째 캐릭터가 아래쪽에 오도록 계산
    const bottomY = height * 0.7; // 화면 하단 70% 지점
    const startY = bottomY - (characters.length - 1) * CHARACTER_SPACING;

    characters.forEach((character, index) => {
        const x = centerX;
        const y = startY + index * CHARACTER_SPACING;

        character.draw(ctx, currentTime, x, y);

        // 첫 번째 캐릭터 하이라이트 (제일 밑)
        if (index === 0) {
            renderFirstCharacterHighlight(x, y);
        }
    });
}

/**
 * 첫 번째 캐릭터 주변에 하이라이트를 그립니다.
 *
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 */
function renderFirstCharacterHighlight(x, y) {
    ctx.save();

    // 펄스 효과를 위한 시간 기반 알파
    const time = performance.now() / 1000;
    const pulse = 0.3 + Math.sin(time * 3) * 0.2;

    // 외곽 원 (강조)
    ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);

    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.stroke();

    // 내부 원
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.5})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

// ==============================================
// UI 렌더링
// ==============================================

/**
 * 게임 UI를 캔버스에 그립니다 (선택적).
 * 현재는 HTML로 처리하므로 미사용.
 */
export function renderUI(score, combo, timeRemaining) {
    // HTML UI를 사용하므로 비워둠
}

// ==============================================
// 디버그 렌더링
// ==============================================

/**
 * 디버그 정보를 그립니다.
 *
 * @param {Object} debugInfo - 디버그 정보
 */
export function renderDebugInfo(debugInfo) {
    if (!debugInfo) return;

    ctx.save();
    ctx.fillStyle = '#00FF00';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let y = 10;
    Object.entries(debugInfo).forEach(([key, value]) => {
        ctx.fillText(`${key}: ${value}`, 10, y);
        y += 20;
    });

    ctx.restore();
}

// ==============================================
// 화면 클리어
// ==============================================

/**
 * 캔버스를 클리어합니다.
 */
export function clearCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
}
