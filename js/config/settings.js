/**
 * ⚙️ 게임 설정 파일
 *
 * 모든 게임 상수와 설정 값을 중앙에서 관리합니다.
 * 게임 밸런스 조정 시 이 파일만 수정하면 됩니다.
 */

// ==============================================
// 게임 기본 설정
// ==============================================

export const GAME_DURATION = 60;          // 게임 시간 (초)
export const DEFAULT_BPM = 120;           // 기본 BPM
export const MAX_CHARACTERS = 7;          // 화면에 표시될 최대 캐릭터 수

// ==============================================
// 캐릭터 설정
// ==============================================

export const CHARACTER_SIZE = 96;         // 캐릭터 기본 크기 (픽셀)
export const CHARACTER_SPACING = 80;      // 캐릭터 간 세로 간격 (픽셀)

// ==============================================
// 단계 타이밍 설정 (비트 단위)
// ==============================================

/**
 * 각 단계의 지속 시간 (비트 단위)
 *
 * BPM 120 기준:
 * - 1비트 = 60 / 120 = 0.5초
 * - stage1: 1비트 = 0.5초
 * - stage2: 1비트 = 0.5초
 * - stage3: 1비트 = 0.5초
 *
 * 총 3비트 = 1.5초 후 자동 MISS
 * 7개 인형 = 10.5초 (10초 제한에 딱 맞음!)
 */
export const STAGE_DURATIONS = {
    stage1: 1,  // Stage 1 지속 시간 (비트)
    stage2: 1,  // Stage 2 지속 시간 (비트)
    stage3: 1   // Stage 3 지속 시간 (비트)
};

// ==============================================
// 점수 설정
// ==============================================

/**
 * 판정별 기본 점수
 */
export const SCORES = {
    PERFECT: 300,   // Stage 3에서 정답
    GOOD: 200,      // Stage 2에서 정답
    NOTBAD: 100,    // Stage 1에서 정답
    MISS: 0         // 오답 또는 시간 초과
};

/**
 * 콤보 보너스 설정
 */
export const COMBO_BONUS_INTERVAL = 10;      // 보너스가 적용되는 콤보 간격
export const COMBO_BONUS_PER_INTERVAL = 10;  // 간격당 추가 점수

// ==============================================
// 애니메이션 설정
// ==============================================

/**
 * 애니메이션 속도 (프레임당 진행도 증가량)
 */
export const ANIMATION_SPEED = {
    HAMMER: 6,      // 망치 애니메이션 속도 (빠르게)
    ROBOT_ARM: 4    // 기계팔 애니메이션 속도 (부드럽게)
};

/**
 * 판정별 파티클 생성 개수
 */
export const PARTICLE_COUNT = {
    PERFECT: 24,
    GOOD: 18,
    NOTBAD: 12,
    MISS: 6
};

// ==============================================
// 시각 효과 설정
// ==============================================

/**
 * 글로우(빛) 효과 설정
 */
export const GLOW = {
    STAGE1: {
        blur: 5,
        alpha: 0.3
    },
    STAGE2: {
        blur: 10,
        alpha: 0.5
    },
    STAGE3: {
        blur: 20,
        alpha: 0.8
    }
};

/**
 * 펄스(맥동) 효과 설정
 */
export const PULSE = {
    STAGE1: {
        min: 0.95,
        max: 1.05,
        speed: 0.5
    },
    STAGE2: {
        min: 0.9,
        max: 1.1,
        speed: 1.0
    },
    STAGE3: {
        min: 0.85,
        max: 1.15,
        speed: 2.0
    }
};

// ==============================================
// 색상 설정
// ==============================================

export const COLORS = {
    RED: '#ff4b4b',
    BLUE: '#4b7bff',
    JUDGMENT: {
        PERFECT: '#FFD700',
        GOOD: '#00FF00',
        NOTBAD: '#FFA500',
        MISS: '#FF0000'
    },
    FLASH: {
        SUCCESS: 'rgba(255, 255, 255, 0.5)',
        FAIL: 'rgba(255, 0, 0, 0.5)'
    }
};

// ==============================================
// UI 설정
// ==============================================

export const UI = {
    JUDGMENT_DISPLAY_DURATION: 500,  // 판정 표시 지속 시간 (ms)
    CHARACTER_REMOVE_DELAY: 200      // 캐릭터 제거 딜레이 (ms)
};

// ==============================================
// 캐릭터 타입
// ==============================================

/**
 * 사용 가능한 캐릭터 타입 목록
 */
export const CHARACTER_TYPES = ['bear', 'cat', 'rabbit', 'dog', 'fox'];

/**
 * 캐릭터 색상 타입
 */
export const COLOR_TYPES = ['red', 'blue'];

// ==============================================
// 헬퍼 함수
// ==============================================

/**
 * BPM을 초당 비트로 변환
 * @param {number} bpm - BPM 값
 * @returns {number} 초당 비트 수
 */
export function bpmToBeatsPerSecond(bpm) {
    return bpm / 60;
}

/**
 * 비트를 초로 변환
 * @param {number} beats - 비트 수
 * @param {number} bpm - BPM 값
 * @returns {number} 초 단위 시간
 */
export function beatsToSeconds(beats, bpm) {
    return beats / bpmToBeatsPerSecond(bpm);
}

/**
 * 초를 비트로 변환
 * @param {number} seconds - 초 단위 시간
 * @param {number} bpm - BPM 값
 * @returns {number} 비트 수
 */
export function secondsToBeats(seconds, bpm) {
    return seconds * bpmToBeatsPerSecond(bpm);
}

// ==============================================
// 디버그 설정
// ==============================================

export const DEBUG = {
    SHOW_STAGE_NUMBERS: true,        // 캐릭터에 단계 번호 표시
    SHOW_HITBOXES: false,            // 히트박스 표시
    LOG_EVENTS: false,               // 이벤트 로깅
    SHOW_TIMING_INFO: false          // 타이밍 정보 표시
};
