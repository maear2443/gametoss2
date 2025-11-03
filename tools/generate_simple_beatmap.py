#!/usr/bin/env python3
"""
간단한 비트맵 생성 도구 (Librosa 없이)
BPM 정보를 기반으로 기본 비트맵을 생성합니다.
"""

import json
import os

def generate_beatmap(song_name, bpm, duration, output_dir="assets/music/beatmaps"):
    """
    BPM 정보를 기반으로 간단한 비트맵을 생성합니다.
    반박(0.5비트)마다 이벤트 생성으로 더 빠른 게임플레이!
    """
    print(f"🎵 비트맵 생성 중: {song_name}")

    # 비트 간격 계산 (초)
    beat_interval = 60.0 / bpm

    # 반박 간격 (0.5 비트 = 더 촘촘하게!)
    half_beat_interval = beat_interval / 2.0

    # 전체 비트 수 계산 (기존 비트)
    num_beats = int(duration / beat_interval)

    # 반박 기준 이벤트 수
    num_half_beats = int(duration / half_beat_interval)

    # 비트 타임스탬프 생성 (정박만)
    beats = [i * beat_interval for i in range(num_beats)]

    # 반박 타임스탬프 생성 (0.5비트마다)
    half_beats = [i * half_beat_interval for i in range(num_half_beats)]

    # 다운비트 (4비트마다)
    downbeats = [beats[i] for i in range(0, len(beats), 4)]

    # 게임 이벤트 생성 - 반박마다!
    game_events = []
    for i, event_time in enumerate(half_beats):
        # 정박인지 확인 (짝수 인덱스)
        is_full_beat = i % 2 == 0
        # 다운비트인지 확인 (8 반박 = 4 비트마다)
        is_downbeat = i % 8 == 0

        game_events.append({
            "time": round(event_time, 3),
            "type": "spawn_character",
            "is_downbeat": is_downbeat,
            "is_half_beat": not is_full_beat,
            "beat_index": i
        })

    # 비트맵 데이터 구조
    beatmap = {
        "metadata": {
            "filename": song_name,
            "duration": duration,
            "bpm": bpm,
            "analyzed_with": "simple_generator"
        },
        "beats": {
            "all_beats": [round(b, 3) for b in beats],
            "onsets": [round(b, 3) for b in beats],  # 간단 버전에서는 비트와 동일
            "downbeats": [round(b, 3) for b in downbeats]
        },
        "game_events": game_events
    }

    # 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)

    # JSON 저장
    output_path = os.path.join(output_dir, f"{song_name.replace('.mp3', '')}.json")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(beatmap, f, indent=2, ensure_ascii=False)

    print(f"✅ 완료!")
    print(f"   - BPM: {bpm}")
    print(f"   - 곡 길이: {duration}초")
    print(f"   - 비트 간격: {beat_interval:.3f}초")
    print(f"   - 반박 간격: {half_beat_interval:.3f}초 (2배 빠름!)")
    print(f"   - 총 비트: {len(beats)}개")
    print(f"   - 총 반박: {len(half_beats)}개")
    print(f"   - 게임 이벤트: {len(game_events)}개")
    print(f"   - 저장 위치: {output_path}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("🎵 간단한 비트맵 생성 도구")
    print("=" * 60)
    print()

    # playlist.json 정보 기반
    songs = [
        {
            "name": "DREAM RACE (Remix).mp3",
            "bpm": 120,
            "duration": 183
        },
        {
            "name": "BREAK FREE.mp3",
            "bpm": 140,
            "duration": 277
        },
        {
            "name": "FAKE FRIEND.mp3",
            "bpm": 130,
            "duration": 195
        }
    ]

    for song in songs:
        generate_beatmap(song["name"], song["bpm"], song["duration"])

    print("🎉 모든 비트맵 생성 완료!")
    print()
    print("💡 참고: 이것은 BPM 기반 간단 비트맵입니다.")
    print("   더 정확한 분석을 위해서는 analyze_music.py를 사용하세요.")
