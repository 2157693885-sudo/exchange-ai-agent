# -*- coding: utf-8 -*-
"""
shots.py — 十语种验证截图（留证）
=====================================================================
输出到 _i18n验证截图_20261010/：
  index-zh / index-en / index-ar（手机模拟特写）
  student-zh / student-ar（RTL 逻辑属性验证）
  institution-zh / institution-ar
"""
import os
import sys
from playwright.sync_api import sync_playwright

CHROME = r"C:\Users\juju\AppData\Local\WPS Comate\scripts\apps\basic\tools\chromium\versions\1.61.0\chromium-1228\chrome-win64\chrome.exe"
# 脚本位于 _i18n工具/ 子目录，基准上跳一层回到「02_网页端全真系统」项目根
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "_i18n验证截图_20261010")
URL = "http://127.0.0.1:8901"
os.makedirs(OUT, exist_ok=True)


def pick(pg, lang):
    pg.evaluate("(l)=>{var b=document.querySelector('#langSeg button[data-lang=\"'+l+'\"]');if(b)b.click();}", lang)
    pg.wait_for_timeout(900)


def main():
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=CHROME)
        pg = br.new_page(viewport={"width": 1440, "height": 1050})

        # ---------- 首页 ----------
        for lang, tag in [("zh", "中文"), ("en", "英文"), ("ar", "阿拉伯语RTL"), ("ru", "俄语")]:
            pg.goto(URL + "/index.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(900)
            pick(pg, lang)
            pg.evaluate("()=>{var e=document.querySelector('.showcase');if(e)e.scrollIntoView({block:'center'})}")
            pg.wait_for_timeout(600)
            f = os.path.join(OUT, "01_首页_%s.png" % tag)
            pg.screenshot(path=f)
            print("  [OK]", os.path.basename(f))

        # 手机模拟特写
        for lang, tag in [("zh", "中文"), ("ar", "阿拉伯语RTL")]:
            pg.goto(URL + "/index.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(900)
            pick(pg, lang)
            el = pg.query_selector("#phoneMock")
            if el:
                el.scroll_into_view_if_needed()
                pg.wait_for_timeout(500)
                f = os.path.join(OUT, "02_手机模拟_%s.png" % tag)
                el.screenshot(path=f)
                print("  [OK]", os.path.basename(f))

        # ---------- 学生端 ----------
        for lang, tag in [("zh", "中文"), ("ar", "阿拉伯语RTL")]:
            pg.goto(URL + "/student.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(900)
            pg.evaluate("""()=>{try{localStorage.setItem('ea2_v3_profile',JSON.stringify(
              {country:'PK',purpose:'degree',duration:'lt180',arrival:'2026-10-20'}));}catch(e){}}""")
            pg.reload(wait_until="domcontentloaded")
            pg.wait_for_timeout(900)
            pick(pg, lang)
            pg.wait_for_timeout(600)
            f = os.path.join(OUT, "03_学生端_%s.png" % tag)
            pg.screenshot(path=f)
            print("  [OK]", os.path.basename(f))

        # ---------- 机构端 ----------
        for lang, tag in [("zh", "中文"), ("ar", "阿拉伯语RTL")]:
            pg.goto(URL + "/institution.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(900)
            pick(pg, lang)
            pg.wait_for_timeout(600)
            f = os.path.join(OUT, "04_机构端_%s.png" % tag)
            pg.screenshot(path=f)
            print("  [OK]", os.path.basename(f))

        br.close()
    print("\n截图目录：" + OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
