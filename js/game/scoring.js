/**
 * 🎯 점수 계산 모듈
 *
 * 판정, 점수 계산, 콤보 보너스 등을 관리합니다.
 */

import { SCORES, COMBO_BONUS_INTERVAL, COMBO_BONUS_PER_INTERVAL, COLORS } from '../config/settings.js';

// ==============================================
// 판정 함수
// ==============================================

/**
 * 단계와 정답 여부에 따라 판정을 반환합니다.
 *
 * @param {number} stage - 현재 단계 (1, 2, 3)
 * @param {boolean} isCorrectAction - 정답 여부
 * @returns {string} 판정 ('PERFECT', 'GOOD', 'NOTBAD', 'MISS')
 */
export function getJudgment(stage, isCorrectAction) {
    // 오답이면 무조건 MISS
    if (!isCorrectAction) {
        return 'MISS';
    }

    // 정답인 경우 단계에 따라 판정
    switch (stage) {
        case 3:
            return 'PERFECT';
        case 2:
            return 'GOOD';
        case 1:
            return 'NOTBAD';
        default:
            return 'MISS';
    }
}

// ==============================================
// 점수 계산 함수
// ==============================================

/**
 * 판정에 따른 기본 점수를 반환합니다.
 *
 * @param {string} judgment - 판정 ('PERFECT', 'GOOD', 'NOTBAD', 'MISS')
 * @returns {number} 기본 점수
 */
export function getBaseScore(judgment) {
    return SCORES[judgment] || 0;
}

/**
 * 콤보에 따른 보너스 점수를 계산합니다.
 *
 * 10콤보마다 +10점
 * 예: 20콤보 = +20점, 35콤보 = +30점
 *
 * @param {number} combo - 현재 콤보 수
 * @returns {number} 보너스 점수
 */
export function getComboBonus(combo) {
    const intervals = Math.floor(combo / COMBO_BONUS_INTERVAL);
    return intervals * COMBO_BONUS_PER_INTERVAL;
}

/**
 * 최종 점수를 계산합니다 (기본 점수 + 콤보 보너스).
 *
 * @param {string} judgment - 판정
 * @param {number} combo - 현재 콤보 수
 * @returns {number} 최종 점수
 */
export function calculateFinalScore(judgment, combo) {
    const baseScore = getBaseScore(judgment);
    const bonusScore = getComboBonus(combo);
    return baseScore + bonusScore;
}

// ==============================================
// 정답 여부 확인
// ==============================================

/**
 * 캐릭터 색상과 플레이어 액션이 정답인지 확인합니다.
 *
 * @param {string} characterColor - 캐릭터 색상 ('red' 또는 'blue')
 * @param {string} action - 플레이어 액션 ('approve' 또는 'reject')
 * @returns {boolean} 정답 여부
 */
export function isCorrectAction(characterColor, action) {
    if (characterColor === 'red' && action === 'reject') {
        return true;
    }
    if (characterColor === 'blue' && action === 'approve') {
        return true;
    }
    return false;
}

// ==============================================
// UI 관련 함수
// ==============================================

/**
 * 판정에 따른 CSS 색상을 반환합니다.
 *
 * @param {string} judgment - 판정
 * @returns {string} CSS 색상
 */
export function getJudgmentColor(judgment) {
    return COLORS.JUDGMENT[judgment] || '#FFFFFF';
}

/**
 * 판정에 따른 폰트 크기를 반환합니다.
 *
 * @param {string} judgment - 판정
 * @returns {string} 폰트 크기 (CSS)
 */
export function getJudgmentSize(judgment) {
    const sizes = {
        PERFECT: '4rem',
        GOOD: '3.5rem',
        NOTBAD: '3rem',
        MISS: '3rem'
    };
    return sizes[judgment] || '3rem';
}

/**
 * 판정에 따른 CSS 클래스 이름을 반환합니다.
 *
 * @param {string} judgment - 판정
 * @returns {string} CSS 클래스
 */
export function getJudgmentClass(judgment) {
    return `judgment-${judgment.toLowerCase()}`;
}

// ==============================================
// 점수 포맷팅
// ==============================================

/**
 * 점수를 화면에 표시할 형식으로 포맷팅합니다.
 *
 * @param {number} score - 점수
 * @returns {string} 포맷된 점수 (예: "1,234")
 */
export function formatScore(score) {
    return score.toLocaleString();
}

/**
 * 판정과 점수를 함께 표시할 텍스트를 생성합니다.
 *
 * @param {string} judgment - 판정
 * @param {number} score - 획득 점수
 * @returns {string} 표시 텍스트 (예: "PERFECT +320")
 */
export function getJudgmentText(judgment, score) {
    if (judgment === 'MISS') {
        return 'MISS';
    }
    return `${judgment} +${score}`;
}

// ==============================================
// 콤보 관련 함수
// ==============================================

/**
 * 콤보가 보너스를 받을 수 있는 마일스톤인지 확인합니다.
 *
 * @param {number} combo - 콤보 수
 * @returns {boolean} 마일스톤 여부
 */
export function isComboMilestone(combo) {
    return combo > 0 && combo % COMBO_BONUS_INTERVAL === 0;
}

/**
 * 다음 콤보 마일스톤까지 남은 콤보 수를 반환합니다.
 *
 * @param {number} combo - 현재 콤보 수
 * @returns {number} 남은 콤보 수
 */
export function getComboToNextMilestone(combo) {
    const nextMilestone = Math.ceil((combo + 1) / COMBO_BONUS_INTERVAL) * COMBO_BONUS_INTERVAL;
    return nextMilestone - combo;
}
