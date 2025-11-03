# 🎵 음악 비트 분석 도구

이 도구는 Librosa를 사용하여 MP3 파일의 비트를 자동으로 분석하고, 게임에서 사용할 수 있는 비트맵 JSON 파일을 생성합니다.

## 설치 방법

### 1. Python 설치 (Python 3.8 이상 필요)
```bash
# macOS/Linux
python3 --version

# Windows
python --version
```

### 2. 필요한 라이브러리 설치
```bash
cd tools
pip install -r requirements.txt

# 또는
pip3 install librosa numpy soundfile
```

## 사용 방법

### 모든 음악 파일 자동 분석
```bash
cd /path/to/gametoss2
python3 tools/analyze_music.py
```

이 명령어는 `assets/music/` 폴더의 모든 MP3 파일을 분석하고, 결과를 `assets/music/beatmaps/` 폴더에 저장합니다.

### 특정 파일만 분석
```bash
python3 tools/analyze_music.py "assets/music/DREAM RACE (Remix).mp3"
```

## 출력 결과

각 MP3 파일마다 JSON 파일이 생성됩니다:

```
assets/music/beatmaps/
├── DREAM RACE (Remix).json
├── BREAK FREE.json
└── FAKE FRIEND.json
```

### JSON 구조 예시
```json
{
  "metadata": {
    "filename": "DREAM RACE (Remix).mp3",
    "duration": 183.5,
    "bpm": 128.5,
    "analyzed_with": "librosa"
  },
  "beats": {
    "all_beats": [0.46, 0.93, 1.39, ...],
    "onsets": [0.45, 0.92, 1.38, ...],
    "downbeats": [0.46, 2.32, 4.18, ...]
  },
  "game_events": [
    {
      "time": 0.46,
      "type": "spawn_character",
      "is_downbeat": true,
      "beat_index": 0
    },
    ...
  ]
}
```

## 분석 내용

- **BPM**: 자동 감지된 곡의 템포
- **Beats**: 모든 비트 타임스탬프
- **Onsets**: 음의 시작점 (더 정확한 타이밍)
- **Downbeats**: 강박 (4/4박자 기준 첫 박)
- **Game Events**: 게임에서 사용할 이벤트 (캐릭터 생성 시점)

## 트러블슈팅

### 오류: "No module named 'librosa'"
```bash
pip3 install librosa
```

### 오류: "No module named 'soundfile'"
```bash
# macOS/Linux
pip3 install soundfile

# Windows - libsndfile 필요
# https://github.com/libsndfile/libsndfile/releases 에서 다운로드
```

### 오류: MP3 파일을 읽을 수 없음
ffmpeg 설치 필요:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# https://ffmpeg.org/download.html 에서 다운로드
```

## 다음 단계

1. 이 도구로 음악 파일 분석
2. 생성된 JSON 파일을 게임에 통합
3. 비트에 정확히 맞춰 캐릭터가 생성되도록 게임 로직 수정
