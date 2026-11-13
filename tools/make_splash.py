#!/usr/bin/env python3
"""產生 iOS「加入主畫面」用的啟動圖 images/splash/*.png，並印出 index.html 要貼的 <link>。

用法（在專案根目錄）：python3 tools/make_splash.py
需要 Pillow。更換 icons/icon-512.png 或 images/edgedeploy-horizontal-blue.png 後請重跑，
再把印出的 <link> 與 index.html 現有的比對一次（尺寸清單沒變就不用改）。
這些圖只有 iOS 在加入主畫面時讀取，刻意不放進 sw.js 的預快取。
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'splash')

# (像素寬, 像素高, CSS 寬, CSS 高, 像素比)
SIZES = [
    (1320, 2868, 440, 956, 3),
    (1290, 2796, 430, 932, 3),
    (1206, 2622, 402, 874, 3),
    (1179, 2556, 393, 852, 3),
    (1284, 2778, 428, 926, 3),
    (1170, 2532, 390, 844, 3),
    (1125, 2436, 375, 812, 3),
    (1242, 2688, 414, 896, 3),
    (828, 1792, 414, 896, 2),
    (750, 1334, 375, 667, 2),
    (2048, 2732, 1024, 1366, 2),
    (1668, 2388, 834, 1194, 2),
    (1640, 2360, 820, 1180, 2),
    (1620, 2160, 810, 1080, 2),
]

FONTS = [
    '/System/Library/Fonts/Supplemental/Comic Sans MS Bold.ttf',
    '/Library/Fonts/Comic Sans MS Bold.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Comic_Sans_MS_Bold.ttf',
]


def load_font(size):
    for p in FONTS:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default(size)


def make(w, h):
    icon = Image.open(os.path.join(ROOT, 'icons', 'icon-512.png')).convert('RGBA')
    logo = Image.open(os.path.join(ROOT, 'images', 'edgedeploy-horizontal-blue.png')).convert('RGBA')
    short = min(w, h)
    img = Image.new('RGB', (w, h), '#ffffff')

    isz = round(short * 0.36)
    icon = icon.resize((isz, isz), Image.LANCZOS)
    img.paste(icon, ((w - isz) // 2, round(h * 0.46) - isz // 2), icon)

    lw = round(short * 0.34)
    logo = logo.resize((lw, round(lw * logo.height / logo.width)), Image.LANCZOS)
    ly = round(h * 0.90) - logo.height
    img.paste(logo, ((w - lw) // 2, ly), logo)

    font = load_font(round(short * 0.032))
    text = 'created by'
    d = ImageDraw.Draw(img)
    tw = d.textlength(text, font=font)
    d.text(((w - tw) / 2, ly - round(short * 0.065)), text, font=font, fill='#000000')

    # 白底 + 黑白圖 + 藍色標誌，調色盤量化後檔案很小
    return img.quantize(colors=16, method=Image.MEDIANCUT, dither=Image.NONE)


def main():
    os.makedirs(OUT, exist_ok=True)
    for pw, ph, cw, ch, r in SIZES:
        name = 'splash-%dx%d.png' % (pw, ph)
        make(pw, ph).save(os.path.join(OUT, name), optimize=True)
        print('<link rel="apple-touch-startup-image" media="(device-width: %dpx) and (device-height: %dpx) '
              'and (-webkit-device-pixel-ratio: %d) and (orientation: portrait)" href="images/splash/%s">'
              % (cw, ch, r, name))
    return 0


if __name__ == '__main__':
    sys.exit(main())
