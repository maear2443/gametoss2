#!/usr/bin/env python3
"""
테스트 사운드 생성 스크립트

실제 게임 에셋이 없을 때 테스트용 효과음을 생성합니다.
numpy가 필요합니다: pip install numpy
"""

import numpy as np
import wave
import os

SAMPLE_RATE = 44100  # 44.1kHz
DURATION = 0.2       # 0.2초

def generate_tone(frequency, duration, sample_rate=SAMPLE_RATE):
    """단순한 사인파 톤을 생성합니다."""
    t = np.linspace(0, duration, int(sample_rate * duration))
    tone = np.sin(2 * np.pi * frequency * t)

    # 페이드 아웃
    fade_samples = int(sample_rate * 0.05)
    fade = np.linspace(1, 0, fade_samples)
    tone[-fade_samples:] *= fade

    return tone

def generate_success_sound():
    """성공 효과음 (상승 톤)."""
    tone1 = generate_tone(523, DURATION * 0.5)  # C5
    tone2 = generate_tone(659, DURATION * 0.5)  # E5
    return np.concatenate([tone1, tone2])

def generate_fail_sound():
    """실패 효과음 (하강 톤)."""
    tone1 = generate_tone(440, DURATION * 0.5)  # A4
    tone2 = generate_tone(349, DURATION * 0.5)  # F4
    return np.concatenate([tone1, tone2])

def save_wav(filename, data, sample_rate=SAMPLE_RATE):
    """WAV 파일로 저장합니다."""
    # 정규화 및 16비트 변환
    data = np.int16(data / np.max(np.abs(data)) * 32767)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # 모노
        wav_file.setsampwidth(2)  # 16비트
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(data.tobytes())

def main():
    """모든 테스트 효과음을 생성합니다."""
    print("🔊 테스트 효과음 생성 중...")

    sounds_dir = "assets/sounds"
    os.makedirs(sounds_dir, exist_ok=True)

    sounds = {
        'approve_success.wav': generate_success_sound(),
        'reject_success.wav': generate_success_sound(),
        'approve_fail.wav': generate_fail_sound(),
        'reject_fail.wav': generate_fail_sound()
    }

    for filename, data in sounds.items():
        filepath = os.path.join(sounds_dir, filename)
        save_wav(filepath, data)
        print(f"✅ 생성: {filepath}")

    print(f"\n🎉 총 {len(sounds)}개 효과음 생성 완료!")

if __name__ == "__main__":
    main()
