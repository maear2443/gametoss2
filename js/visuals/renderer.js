/**
 * 🎨 렌더러
 *
 * 캔버스에 모든 비주얼 요소를 그립니다.
 */

import { CHARACTER_SPACING, CHARACTER_SIZE } from '../config/settings.js';
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
 * 인형들이 살짝 겹쳐서 쌓여있는 느낌을 줍니다.
 *
 * @param {Character[]} characters - 캐릭터 배열
 * @param {number} currentTime - 현재 시간 (초)
 */
function renderCharacters(characters, currentTime) {
    const centerX = width / 2;

    // 화면을 꽉 채우도록 설정
    const bottomY = height * 0.85; // 화면 하단 85% 지점

    // 겹침 효과를 위해 간격을 줄임 (캐릭터 크기보다 작게)
    const overlapSpacing = CHARACTER_SIZE * 0.5; // 50% 겹침

    // 역순으로 그려서 첫 번째 캐릭터가 맨 위에 오도록 (Z-index)
    for (let i = characters.length - 1; i >= 0; i--) {
        const character = characters[i];

        // 기본 위치 계산
        let x = centerX;
        let y = bottomY - i * overlapSpacing;

        // 🆕 드롭 애니메이션: 위에서 아래로 떨어지는 효과
        const dropProgress = character.getDropProgress(currentTime);
        if (dropProgress < 1.0) {
            // easeOut 효과 (빠르게 시작 → 천천히 끝)
            const eased = 1 - Math.pow(1 - dropProgress, 3);
            const dropDistance = CHARACTER_SIZE * 2; // 떨어지는 거리
            y = y - dropDistance * (1 - eased);
        }

        // 🆕 날아가는 애니메이션: 옆으로 날아가는 효과
        const flyProgress = character.getFlyProgress(currentTime);
        if (flyProgress > 0.0) {
            // easeIn 효과 (천천히 시작 → 빠르게 끝)
            const eased = Math.pow(flyProgress, 2);
            const flyDistance = width * 0.6; // 날아가는 거리
            x = x + flyDistance * eased * character.flyDirection;

            // 페이드아웃 효과
            ctx.save();
            ctx.globalAlpha = 1.0 - flyProgress;
        }

        character.draw(ctx, currentTime, x, y);

        // 날아가는 애니메이션 적용 시 restore
        if (flyProgress > 0.0) {
            ctx.restore();
        }

        // 첫 번째 캐릭터 하이라이트 (제일 밑, 맨 마지막에 그려짐)
        if (i === 0 && !character.isFlyingOut) {
            renderFirstCharacterHighlight(x, y);
        }
    }
}

/**
 * 첫 번째 캐릭터 주변에 하이라이트를 그립니다.
 * 타격 영역을 명확하게 표시합니다.
 *
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 */
function renderFirstCharacterHighlight(x, y) {
    ctx.save();

    // 펄스 효과를 위한 시간 기반 알파
    const time = performance.now() / 1000;
    const pulse = 0.5 + Math.sin(time * 4) * 0.3;

    // 타격 영역 배경 (반투명 원)
    ctx.fillStyle = `rgba(255, 255, 0, ${pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    // 외곽 원 (타격 영역 경계)
    ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
    ctx.lineWidth = 4;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.stroke();

    // 내부 원 (강조)
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.8})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);

    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.stroke();

    // "HIT!" 텍스트 표시
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('타격!', x, y + 80);

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
