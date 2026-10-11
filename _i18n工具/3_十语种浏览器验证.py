# -*- coding: utf-8 -*-
"""
verify5.py — 十语种全量验证（含校本预设置信）
=====================================================================
逐语种核对：
  1) 手机模拟整块跟随语种、无中文残留
  2) 学生端里的校本预设条目是否显示本语种译文
  3) 语言条 10 项、当前项高亮；RTL 下读取次序是否仍与 LANGS 一致
  4) <html dir> 仅在阿语为 rtl
  5) 无 JS 报错、无 404

用法：python verify5.py
"""
import os
import re
import sys
import json
from playwright.sync_api import sync_playwright

CHROME = r"C:\Users\juju\AppData\Local\WPS Comate\scripts\apps\basic\tools\chromium\versions\1.61.0\chromium-1228\chrome-win64\chrome.exe"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "http://127.0.0.1:8901"
LANGS = ["zh", "en", "ru", "ar", "fr", "es", "vi", "th", "my", "ms"]
CJK = re.compile(r"[\u4e00-\u9fff]+")
ALLOW = ["中文", "来华交流全程助手"]

GRAB = """(extra)=>{
  var c=document.body.cloneNode(true);
  c.querySelectorAll('script,style,noscript,template,svg').forEach(function(e){e.remove()});
  c.querySelectorAll('#langSeg,.seg,.pm-langs,.skip-link').forEach(function(e){e.remove()});
  if(extra) c.querySelectorAll('.pm-status').forEach(function(e){e.remove()});
  return c.innerText || c.textContent || '';
}"""


def leaks(t):
    for a in ALLOW:
        t = t.replace(a, "\u0000")
    return [m.group(0) for m in CJK.finditer(t)]


def main():
    rows, problems, errs, bad = [], [], [], []
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=CHROME)
        pg = br.new_page(viewport={"width": 1440, "height": 1000})
        pg.on("pageerror", lambda e: errs.append(str(e)[:130]))
        pg.on("response", lambda r: bad.append("%s %s" % (r.status, r.url.split("/")[-1])) if r.status >= 400 else None)

        for lang in LANGS:
            r = {"lang": lang, "isZh": lang == "zh"}
            # ---------- 首页 ----------
            pg.goto(URL + "/index.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(800)
            pg.evaluate("(l)=>{var b=document.querySelector('#langSeg button[data-lang=\"'+l+'\"]');if(b)b.click();}", lang)
            pg.wait_for_timeout(800)

            r["dir"] = pg.evaluate("()=>document.documentElement.dir")
            r["nChip"] = pg.evaluate("()=>document.querySelectorAll('#langSeg button[data-lang]').length")
            r["onLang"] = pg.evaluate(
                "()=>{var e=document.querySelector('#langSeg button[aria-pressed=\"true\"]');return e?e.getAttribute('data-lang'):''}")
            # 语言条"读取次序"：按阅读方向（LTR 从左、RTL 从右）排列后的 code 序列
            r["segOrder"] = pg.evaluate("""()=>{
              var a=Array.prototype.slice.call(document.querySelectorAll('#langSeg button[data-lang]'));
              if(!a.length) return '';
              var rtl=document.documentElement.dir==='rtl';
              a.sort(function(x,y){
                var xr=x.getBoundingClientRect().left, yr=y.getBoundingClientRect().left;
                return rtl ? yr-xr : xr-yr;
              });
              return a.map(function(x){return x.getAttribute('data-lang')}).join(',');
            }""")
            r["mockN"] = pg.evaluate("()=>document.querySelectorAll('.pm-langs i').length")
            r["mockOnIdx"] = pg.evaluate(
                "()=>{var a=Array.prototype.slice.call(document.querySelectorAll('.pm-langs i'));return a.findIndex(function(e){return e.classList.contains('on')})}")

            mock = pg.evaluate("""()=>{
              var e=document.getElementById('phoneMock').cloneNode(true);
              e.querySelectorAll('script,style,svg,.pm-langs').forEach(function(x){x.remove()});
              return e.innerText||e.textContent||'';
            }""")
            h = leaks(mock) if not r["isZh"] else []
            r["mockLeak"], r["mockHit"] = bool(h), h[:4]

            body = pg.evaluate(GRAB, True)
            h2 = leaks(body) if not r["isZh"] else []
            r["pageLeak"], r["pageHit"] = bool(h2), h2[:6]

            # ---------- 学生端：校本条目是否本语种 ----------
            pg.goto(URL + "/student.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(700)
            pg.evaluate("""()=>{try{localStorage.setItem('ea2_v3_profile', JSON.stringify(
                {country:'PK',purpose:'degree',duration:'lt180',arrival:'2026-10-20'}));}catch(e){}}""")
            pg.reload(wait_until="domcontentloaded")
            pg.wait_for_timeout(900)
            pg.evaluate("(l)=>{var b=document.querySelector('#langSeg button[data-lang=\"'+l+'\"]');if(b)b.click();}", lang)
            pg.wait_for_timeout(1000)

            r["sysuFields"] = pg.evaluate("""()=>{
              var kb=(window.Agent&&window.Agent.localKbItems)?window.Agent.localKbItems():[];
              var m=null; kb.forEach(function(x){ if(x.id==='preset_sysu_reg') m=x; });
              if(!m) return '(未加载)';
              var has=[];
              ['title_en','title_ar','title_ru','title_es','title_fr','title_vi','title_th','title_my','title_ms'].forEach(function(k){
                if(m[k]) has.push(k.replace('title_',''));
              });
              return has.join(',');
            }""")
            r["sysuL"] = pg.evaluate("""()=>{
              var kb=(window.Agent&&window.Agent.localKbItems)?window.Agent.localKbItems():[];
              var m=null; kb.forEach(function(x){ if(x.id==='preset_sysu_reg') m=x; });
              return m ? (window.KB.L(m,'title')||'') : '(未加载)';
            }""")
            stu = pg.evaluate(GRAB, False)
            h3 = leaks(stu) if not r["isZh"] else []
            r["stuLeak"], r["stuHit"] = bool(h3), h3[:5]

            rows.append(r)
            print("[%s] %-3s dir=%-3s 条%2d 当前=%-3s | 泄漏 模拟=%-5s 首页=%-5s 学生端=%-5s"
                  % ("OK" if not (r["mockLeak"] or r["pageLeak"] or r["stuLeak"]) else "!!",
                     lang, r["dir"], r["nChip"], r["onLang"],
                     r["mockLeak"], r["pageLeak"], r["stuLeak"]))
            print("      条序=%s" % r["segOrder"])
            print("      校本条目: %s" % r["sysuL"][:72])
            if r["stuLeak"]:
                print("      学生端命中: %s" % r["stuHit"])
            if r["pageLeak"]:
                print("      首页命中: %s" % r["pageHit"])
        br.close()

    print("\n" + "=" * 78)
    for r in rows:
        want = "rtl" if r["lang"] == "ar" else "ltr"
        if r["dir"] != want:
            problems.append("%s: dir=%s 应为 %s" % (r["lang"], r["dir"], want))
        if r["nChip"] != 10:
            problems.append("%s: 语言条 %d 项 应为 10" % (r["lang"], r["nChip"]))
        if r["onLang"] != r["lang"]:
            problems.append("%s: 高亮为 %s，切换未生效" % (r["lang"], r["onLang"]))
        if r["segOrder"] != ",".join(LANGS):
            problems.append("%s: 语言条读序 %s（应为 %s）" % (r["lang"], r["segOrder"], ",".join(LANGS)))
        if r["mockN"] != 10:
            problems.append("%s: 模拟语种条 %d 项 应为 10" % (r["lang"], r["mockN"]))
        if r["mockOnIdx"] != LANGS.index(r["lang"]):
            problems.append("%s: 模拟条高亮第 %d 项 应为第 %d 项" % (r["lang"], r["mockOnIdx"], LANGS.index(r["lang"])))
        if r["mockLeak"]:
            problems.append("%s: 手机模拟残留中文 %s" % (r["lang"], r["mockHit"]))
        if r["pageLeak"]:
            problems.append("%s: 首页残留中文 %s" % (r["lang"], r["pageHit"]))
        if r["stuLeak"]:
            problems.append("%s: 学生端残留中文 %s" % (r["lang"], r["stuHit"]))
        if r["isZh"]:
            if "中山大学" not in r["sysuL"]:
                problems.append("zh: 校本条目未取到中文标题 → %s" % r["sysuL"])
        else:
            if leaks(r["sysuL"]):
                problems.append("%s: 校本条目标题仍为中文 → %s" % (r["lang"], r["sysuL"]))
    if errs:
        problems.append("JS 报错 %d: %s" % (len(errs), errs[:2]))
    if bad:
        problems.append("异常请求 %d: %s" % (len(bad), bad[:3]))

    if problems:
        print("发现 %d 个问题：" % len(problems))
        for x in problems:
            print("  [X] " + x)
    else:
        print("全部通过：方向 / 语言条读序 / 手机模拟 / 首页 / 学生端 / 校本条目译文")

    outp = os.path.join(BASE, "_i18n验证截图_20261010")
    os.makedirs(outp, exist_ok=True)
    with open(os.path.join(outp, "十语种验证结果.json"), "w", encoding="utf-8") as f:
        json.dump({"rows": rows, "problems": problems, "jsErrors": errs}, f, ensure_ascii=False, indent=2)
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
