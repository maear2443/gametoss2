# 🎮 Stage Evolution Timing Game

**인형 공장 품질 관리 타이밍 게임**

캐릭터가 3단계로 진화하는 동안 적절한 타이밍에 승인/거절 버튼을 눌러 점수를 획득하는 HTML5 기반 리듬 게임입니다.

---

## 📖 게임 소개

### 게임 컨셉
- 인형 공장에서 품질 관리를 하는 테마
- 캐릭터들이 세로로 쌓여있는 상태에서 시작
- 각 캐릭터가 시간에 따라 3단계로 진화 (어두움 → 중간 → 밝음)
- 플레이어는 적절한 타이밍에 정확한 버튼을 눌러 판정

### 핵심 메카닉
- **빨간색 캐릭터**: F키로 거절 (🔨 망치)
- **파란색 캐릭터**: J키로 승인 (🤖 기계팔)
- **Stage 3 (가장 밝을 때)**: PERFECT 판정 (300점)
- **콤보 보너스**: 10콤보마다 +10점 추가

---

## 🚀 빠른 시작

### 1. 테스트 리소스 생성

게임 실행을 위해 먼저 테스트 이미지와 사운드를 생성합니다:

```bash
# Python 패키지 설치
pip install pillow numpy

# 이미지 생성 (30개: 2색상 × 5캐릭터 × 3단계)
python3 generate_images.py

# 효과음 생성 (4개)
python3 generate_sounds.py
```

### 2. 로컬 서버 실행

브라우저 보안 정책으로 인해 로컬 서버가 필요합니다:

```bash
# Python 3
python3 -m http.server 8000

# 또는 Node.js
npx http-server -p 8000
```

### 3. 게임 실행

브라우저에서 http://localhost:8000 접속

---

## 🎮 게임 방법

### 기본 조작
- **F키**: 빨간색 캐릭터 거절
- **J키**: 파란색 캐릭터 승인
- **Space**: 게임 시작/정지

### 판정 시스템
| 단계 | 타이밍 | 판정 | 점수 |
|------|--------|------|------|
| Stage 3 | 2~3초 | **PERFECT** | 300점 |
| Stage 2 | 1~2초 | **GOOD** | 200점 |
| Stage 1 | 0~1초 | **NOTBAD** | 100점 |
| 오답/시간초과 | - | **MISS** | 0점 |

### 콤보 시스템
- 연속 성공 시 콤보 증가
- **10콤보마다 +10점** 추가 보너스
- 예: 20콤보에서 PERFECT = 300 + 20 = **320점**
- MISS 시 콤보 초기화

### 게임 목표
- **제한 시간**: 60초
- **최고 점수** 달성
- **최대 콤보** 기록 갱신

---

## 📁 프로젝트 구조

```
gametoss2/
├── index.html              # 메인 HTML
├── css/
│   └── styles.css          # 스타일시트
├── js/                     # JavaScript 모듈
│   ├── main.js             # 진입점
│   ├── input.js            # 입력 처리
│   ├── config/
│   │   └── settings.js     # 게임 설정
│   ├── game/
│   │   ├── Game.js         # 게임 컨트롤러
│   │   ├── Character.js    # 캐릭터 클래스
│   │   └── scoring.js      # 점수 계산
│   ├── visuals/
│   │   ├── renderer.js     # 렌더링
│   │   ├── effects.js      # 이펙트
│   │   └── animations.js   # 애니메이션
│   └── resources/
│       └── loader.js       # 리소스 로더
├── assets/
│   ├── images/             # 캐릭터 이미지
│   │   ├── red/            # 빨간색 (거절용)
│   │   ├── blue/           # 파란색 (승인용)
│   │   └── characters.json
│   ├── music/              # 배경 음악
│   │   └── playlist.json
│   └── sounds/             # 효과음
│       └── sounds.json
├── generate_images.py      # 이미지 생성 스크립트
├── generate_sounds.py      # 사운드 생성 스크립트
└── README.md
```

---

## ⚙️ 게임 설정 커스터마이징

`js/config/settings.js`에서 게임 밸런스를 조정할 수 있습니다:

```javascript
// BPM 변경
export const DEFAULT_BPM = 120;  // 기본 120

// 단계 지속 시간 (비트 단위)
export const STAGE_DURATIONS = {
    stage1: 2,  // 1초 (BPM 120 기준)
    stage2: 2,  // 1초
    stage3: 2   // 1초
};

// 점수 조정
export const SCORES = {
    PERFECT: 300,
    GOOD: 200,
    NOTBAD: 100,
    MISS: 0
};

// 콤보 보너스
export const COMBO_BONUS_INTERVAL = 10;      // 10콤보마다
export const COMBO_BONUS_PER_INTERVAL = 10;  // +10점
```

---

## 🎨 커스텀 리소스 추가

### 캐릭터 이미지 추가

1. `assets/images/red/` 또는 `assets/images/blue/`에 이미지 추가
2. 파일명 형식: `{캐릭터명}_stage{1,2,3}.png`
3. 권장 크기: 128×128px
4. `js/config/settings.js`의 `CHARACTER_TYPES` 배열에 추가

예시:
```javascript
export const CHARACTER_TYPES = ['bear', 'cat', 'rabbit', 'dog', 'fox', 'newchar'];
```

### 음악 추가

1. `assets/music/`에 MP3 파일 추가
2. `assets/music/playlist.json` 수정:

```json
{
  "songs": [
    {
      "name": "새 음악",
      "file": "newsong.mp3",
      "bpm": 140,
      "duration": 180
    }
  ]
}
```

---

## 🔧 기술 스택

- **HTML5 Canvas**: 게임 렌더링
- **ES6 Modules**: 모듈식 구조
- **Vanilla JavaScript**: 프레임워크 없이 순수 JS
- **CSS3**: 스타일링 및 애니메이션
- **Web Audio API**: 사운드 재생

---

## 🎯 게임 플로우

```
초기화
  ↓
리소스 로딩 (이미지, 사운드, 음악)
  ↓
7개 캐릭터 생성 (랜덤 색상/타입)
  ↓
게임 시작 → 음악 재생
  ↓
게임 루프:
  - 캐릭터 단계 진화 (1→2→3→MISS)
  - 플레이어 입력 처리
  - 판정 계산 및 점수 부여
  - 이펙트 & 애니메이션
  - 캐릭터 교체
  - 렌더링
  ↓
60초 후 게임 종료
  ↓
최종 점수 표시
```

---

## 🐛 트러블슈팅

### 이미지가 보이지 않아요
- `generate_images.py` 실행 여부 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 로컬 서버로 실행 중인지 확인 (file:// 프로토콜은 불가)

### 사운드가 재생되지 않아요
- `generate_sounds.py` 실행 여부 확인
- 브라우저 자동 재생 정책으로 인해 첫 인터랙션 필요
- 볼륨 설정 확인

### 타이밍이 안 맞아요
- BPM 값 확인
- `js/config/settings.js`의 `STAGE_DURATIONS` 조정
- 브라우저 성능 확인 (60fps 유지 필요)

---

## 📊 판정 상세

### BPM 120 기준 타이밍
- **0.0~1.0초**: Stage 1 (어두움) → NOTBAD
- **1.0~2.0초**: Stage 2 (중간) → GOOD
- **2.0~3.0초**: Stage 3 (밝음) → PERFECT
- **3.0초 이후**: 자동 MISS

### 정답 여부
| 캐릭터 색상 | 올바른 액션 | 효과 |
|------------|-----------|------|
| 빨간색 | F키 (거절) | ✅ 성공 |
| 빨간색 | J키 (승인) | ❌ MISS |
| 파란색 | J키 (승인) | ✅ 성공 |
| 파란색 | F키 (거절) | ❌ MISS |

---

## 🎨 시각 효과

- **파티클**: 판정별 다른 개수 (PERFECT: 24개, GOOD: 18개, NOTBAD: 12개)
- **플래시**: 성공 시 흰색, 실패 시 빨간색
- **플로팅 텍스트**: 판정 + 획득 점수 표시
- **글로우**: 단계가 높을수록 강한 빛
- **펄스**: 단계별 맥동 효과
- **애니메이션**: 망치 (빨강), 기계팔 (파랑)

---

## 🏆 팁 & 전략

1. **Stage 3 타이밍 익히기**: 캐릭터가 가장 밝아질 때까지 기다리기
2. **색상 우선 확인**: 단계보다 먼저 색상을 파악
3. **콤보 유지**: 10콤보 단위로 보너스가 크므로 안정적인 플레이
4. **BPM 조절**: 처음엔 낮은 BPM으로 연습
5. **리듬 타기**: 음악과 함께 리듬감 있게 플레이

---

## 📝 라이선스

MIT License

---

## 🙏 크레딧

- **게임 디자인**: Stage Evolution Timing Game
- **개발**: Vanilla JavaScript + HTML5 Canvas
- **테스트 리소스**: Pillow + NumPy

---

## 📮 피드백

이슈나 제안사항이 있으시면 GitHub Issues를 통해 알려주세요!

**즐거운 게임 되세요! 🎮✨**
