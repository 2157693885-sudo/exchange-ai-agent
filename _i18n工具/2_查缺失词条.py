# -*- coding: utf-8 -*-
"""
find_missing2.py — 运行时检测缺失词条（setter 劫持版）
=====================================================================
上一版失败原因：页面脚本用 `var t = window.L10N.t` 提前捕获了原函数，
补丁在 30ms 轮询后才生效，捕获到的仍是原始 t，绕过探针。

本版改用属性 setter：在 window.L10N 被赋值的瞬间就替换 t，
早于任何页面脚本捕获，因此间接引用（var TAGS=[...] 再 t(k)）也能捕获。

用法：python find_missing2.py
"""
import os
import sys
import json
from playwright.sync_api import sync_playwright

CHROME = r"C:\Users\juju\AppData\Local\WPS Comate\scripts\apps\basic\tools\chromium\versions\1.61.0\chromium-1228\chrome-win64\chrome.exe"
# 脚本位于 _i18n工具/ 子目录，基准上跳一层回到「02_网页端全真系统」项目根
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "http://127.0.0.1:8901"
LANGS = ["zh", "en", "ru", "ar", "fr", "es", "vi", "th", "my", "ms"]

PROBE = r"""
(function(){
  if (window.__probe2) return;
  window.__probe2 = true;
  window.__missingKeys = {};
  var wrap = function(v){
    if (!v || typeof v.t !== "function" || v.__patched2) return v;
    var orig = v.t;
    v.t = function(key, lang){
      var r = orig.apply(this, arguments);
      // 词典缺失时 t() 会原样返回 key
      if (r === key && typeof key === "string" && /^[A-Za-z][A-Za-z0-9_]*$/.test(key)) {
        window.__missingKeys[key] = (window.__missingKeys[key] || 0) + 1;
      }
      return r;
    };
    v.__patched2 = true;
    return v;
  };
  var cur;
  try {
    Object.defineProperty(window, "L10N", {
      configurable: true,
      get: function(){ return cur; },
      set: function(v){ cur = wrap(v); }
    });
  } catch (e) {}
})();
"""


def main():
    found = {}
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=CHROME)
        ctx = br.new_context(viewport={"width": 1440, "height": 1000})
        ctx.add_init_script(PROBE)
        pg = ctx.new_page()
        installed = []

        for page in ["index.html", "student.html", "institution.html"]:
            for lang in LANGS:
                pg.goto(URL + "/" + page, wait_until="domcontentloaded")
                pg.wait_for_timeout(800)
                st = pg.evaluate("()=>({p:!!(window.L10N&&window.L10N.__patched2), n:Object.keys(window.__missingKeys||{}).length})")
                if page == "index.html" and lang == "zh":
                    installed.append(st)
                pg.evaluate("(l)=>{var b=document.querySelector('#langSeg button[data-lang=\"'+l+'\"]');if(b)b.click();}", lang)
                pg.wait_for_timeout(700)
                miss = pg.evaluate("()=>window.__missingKeys||{}")
                for k, n in miss.items():
                    d = found.setdefault(k, {"n": 0, "pages": set(), "langs": set()})
                    d["n"] += n
                    d["pages"].add(page)
                    d["langs"].add(lang)
        br.close()

    print("探针安装状态（首页首次）: %s" % installed)
    print("\n被引用但词典缺失、页面上回退成键名的词条：\n")
    if not found:
        print("  ✅ 无")
    else:
        for k in sorted(found):
            d = found[k]
            print("  %-26s 命中%4d 次 | 页面: %-46s | 语种: %s"
                  % (k, d["n"], ",".join(sorted(d["pages"])), ",".join(sorted(d["langs"]))))
    print("\n合计 %d 个" % len(found))

    with open(os.path.join(BASE, "_missing_keys.json"), "w", encoding="utf-8") as f:
        json.dump({k: {"n": v["n"], "pages": sorted(v["pages"]), "langs": sorted(v["langs"])}
                   for k, v in found.items()}, f, ensure_ascii=False, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
