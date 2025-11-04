#!/usr/bin/env python3
"""
음악 비트 분석 도구
Librosa를 사용해서 MP3 파일의 비트를 감지하고 JSON으로 저장합니다.
"""

import librosa
import numpy as np
import json
import os
from pathlib import Path

def analyze_song(mp3_path, output_dir="assets/music/beatmaps"):
    """
    MP3 파일을 분석해서 비트맵을 생성합니다.

    Args:
        mp3_path: MP3 파일 경로
        output_dir: 비트맵 JSON 저장 디렉토리
    """
    print(f"🎵 분석 중: {mp3_path}")

    # 음악 로드
    y, sr = librosa.load(mp3_path)

    # 곡 길이 계산
    duration = librosa.get_duration(y=y, sr=sr)

    # BPM 추출
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

    # tempo가 배열이면 첫 번째 값 추출
    if isinstance(tempo, np.ndarray):
        tempo = tempo.item() if tempo.size == 1 else tempo[0]
    tempo = float(tempo)

    # 비트 타임스탬프 계산
    beat_times = librosa.frames_to_time(beats, sr=sr)

    # Onset (음의 시작점) 감지 - 더 정확한 타이밍
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # 다운비트 감지 (강박)
    # 4/4박자 기준으로 4비트마다 다운비트
    downbeat_interval = 4
    downbeats = beat_times[::downbeat_interval]

    # 음악의 에너지 레벨 분석 (난이도 조절에 활용 가능)
    # RMS (Root Mean Square) 에너지
    rms = librosa.feature.rms(y=y)[0]
    rms_times = librosa.frames_to_time(range(len(rms)), sr=sr)

    # 비트맵 데이터 구조
    beatmap = {
        "metadata": {
            "filename": os.path.basename(mp3_path),
            "duration": float(duration),
            "bpm": tempo,  # 이미 float으로 변환됨
            "analyzed_with": "librosa"
        },
        "beats": {
            "all_beats": beat_times.tolist(),
            "onsets": onset_times.tolist(),
            "downbeats": downbeats.tolist()
        },
        "game_events": []
    }

    # 게임 이벤트 생성 (비트마다 캐릭터 생성)
    # 옵션 1: 모든 비트에 캐릭터 생성
    for i, beat_time in enumerate(beat_times):
        is_downbeat = i % downbeat_interval == 0
        beatmap["game_events"].append({
            "time": float(beat_time),
            "type": "spawn_character",
            "is_downbeat": bool(is_downbeat),
            "beat_index": int(i)
        })

    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)

    # JSON 저장
    song_name = Path(mp3_path).stem
    output_path = os.path.join(output_dir, f"{song_name}.json")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(beatmap, f, indent=2, ensure_ascii=False)

    print(f"✅ 분석 완료!")
    print(f"   - 곡 길이: {duration:.2f}초")
    print(f"   - BPM: {tempo:.1f}")
    print(f"   - 감지된 비트: {len(beat_times)}개")
    print(f"   - 감지된 온셋: {len(onset_times)}개")
    print(f"   - 다운비트: {len(downbeats)}개")
    print(f"   - 저장 위치: {output_path}")

    return beatmap

def analyze_all_songs(music_dir="assets/music", output_dir="assets/music/beatmaps"):
    """
    음악 폴더의 모든 MP3 파일을 분석합니다.
    """
    print("🎼 음악 파일 검색 중...")

    mp3_files = list(Path(music_dir).glob("*.mp3")) + list(Path(music_dir).glob("*.MP3"))

    if not mp3_files:
        print("❌ MP3 파일을 찾을 수 없습니다.")
        return

    print(f"📁 {len(mp3_files)}개의 MP3 파일을 찾았습니다.\n")

    for mp3_file in mp3_files:
        try:
            analyze_song(str(mp3_file), output_dir)
            print()
        except Exception as e:
            print(f"❌ 오류 발생: {mp3_file}")
            print(f"   {str(e)}\n")

    print("🎉 모든 분석 완료!")

if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("🎵 음악 비트 분석 도구")
    print("=" * 60)
    print()

    # 사용법
    if len(sys.argv) > 1:
        # 특정 파일 분석
        mp3_path = sys.argv[1]
        analyze_song(mp3_path)
    else:
        # 모든 파일 분석
        analyze_all_songs()
