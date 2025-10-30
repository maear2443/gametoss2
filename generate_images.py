#!/usr/bin/env python3
"""
테스트 이미지 생성 스크립트

실제 게임 에셋이 없을 때 테스트용 이미지를 생성합니다.
PIL (Pillow)이 필요합니다: pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 설정
COLORS = {
    'red': (255, 75, 75),
    'blue': (75, 123, 255)
}

CHARACTERS = ['bear', 'cat', 'rabbit', 'dog', 'fox']
STAGES = [1, 2, 3]
SIZE = 128

def create_character_image(color_name, character, stage):
    """캐릭터 이미지를 생성합니다."""

    # RGB 색상
    base_color = COLORS[color_name]

    # 단계별 밝기 조정
    brightness_multiplier = {
        1: 0.4,  # 어두움
        2: 0.7,  # 중간
        3: 1.0   # 밝음
    }[stage]

    color = tuple(int(c * brightness_multiplier) for c in base_color)

    # 이미지 생성
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 원형 배경
    padding = 10
    draw.ellipse(
        [padding, padding, SIZE - padding, SIZE - padding],
        fill=color + (255,),
        outline=(255, 255, 255, 128),
        width=3
    )

    # 텍스트 (캐릭터 이름)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
    except:
        font = ImageFont.load_default()

    text = f"{character.upper()}\nS{stage}"

    # 텍스트 중앙 정렬
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    position = ((SIZE - text_width) // 2, (SIZE - text_height) // 2)

    # 텍스트 그림자
    draw.text((position[0] + 2, position[1] + 2), text, fill=(0, 0, 0, 200), font=font, align='center')
    # 텍스트
    draw.text(position, text, fill=(255, 255, 255, 255), font=font, align='center')

    return img

def main():
    """모든 테스트 이미지를 생성합니다."""
    print("🎨 테스트 이미지 생성 중...")

    total = 0

    for color_name in COLORS.keys():
        color_dir = f"assets/images/{color_name}"
        os.makedirs(color_dir, exist_ok=True)

        for character in CHARACTERS:
            for stage in STAGES:
                filename = f"{character}_stage{stage}.png"
                filepath = os.path.join(color_dir, filename)

                img = create_character_image(color_name, character, stage)
                img.save(filepath)

                print(f"✅ 생성: {filepath}")
                total += 1

    print(f"\n🎉 총 {total}개 이미지 생성 완료!")
    print(f"   - {len(COLORS)} 색상 × {len(CHARACTERS)} 캐릭터 × {len(STAGES)} 단계")

if __name__ == "__main__":
    main()
