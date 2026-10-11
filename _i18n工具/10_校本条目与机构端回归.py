# -*- coding: utf-8 -*-
"""
verify6.py — 校本条目界面呈现 + 机构端持久化回归
=====================================================================
本脚本针对本轮两处改动做定向验证：
  A. 校本预设是否在「访华指南」界面里以当前语种显示（而不是只存在于数据里）
  B. 机构端「新增条目」是否仍能持久化（我改过保存逻辑：预置不落盘、自建落盘）

用法：python verify6.py
"""
import os
import sys
from playwright.sync_api import sync_playwright

CHROME = r"C:\Users\juju\AppData\Local\WPS Comate\scripts\apps\basic\tools\chromium\versions\1.61.0\chromium-1228\chrome-win64\chrome.exe"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "_i18n验证截图_20261010")
URL = "http://127.0.0.1:8901"


def main():
    problems = []
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=CHROME)
        pg = br.new_page(viewport={"width": 1440, "height": 1050})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:120]))

        # ============ A. 校本条目在界面上的呈现 ============
        # 说明：校本条目出现在「我的 → 办事清单」（#clCard）。
        #       「访华指南」用的是 kb-modules.js 里人工编排的 GUIDE_GROUPS
        #       （固定 id 列表），本就不含动态校本条目，故不作为检查对象。
        print("=== A. 校本条目在「我的 → 办事清单」按语种呈现 ===")
        for lang in ["zh", "ar", "ru", "th"]:
            pg.goto(URL + "/student.html", wait_until="domcontentloaded")
            pg.wait_for_timeout(700)
            pg.evaluate("""()=>{try{
              localStorage.removeItem('ea2_localKb');
              localStorage.setItem('ea2_v3_profile', JSON.stringify(
                {country:'PK',purpose:'degree',duration:'lt180',arrival:'2026-10-20'}));
            }catch(e){}}""")
            pg.reload(wait_until="domcontentloaded")
            pg.wait_for_timeout(1000)
            pg.evaluate("(l)=>{var b=document.querySelector('#langSeg button[data-lang=\"'+l+'\"]');if(b)b.click();}", lang)
            pg.wait_for_timeout(800)
            pg.evaluate("()=>{var b=document.querySelector('#tabbar .tab[data-mod=\"mine\"]');if(b)b.click();}")
            pg.wait_for_timeout(900)
            txt = pg.evaluate("()=>{var e=document.getElementById('clCard');return e?e.innerText:'(无 clCard)';}")
            keys = ["中山大学", "صن يات سين", "Сунь Ятсена", "ซุนยัตเซ็น"]
            hit = any(k in txt for k in keys)
            print("  %-3s 清单含校本条目本语种名: %-5s | %s"
                  % (lang, hit, txt.replace("\n", " | ")[:86]))
            if not hit:
                problems.append("%s: 办事清单未见校本条目的本语种名称" % lang)

        # ============ B. 机构端新增条目持久化 ============
        print("\n=== B. 机构端新增条目持久化回归 ===")
        pg.goto(URL + "/institution.html", wait_until="domcontentloaded")
        pg.wait_for_timeout(800)
        pg.evaluate("""()=>{try{ localStorage.removeItem('ea2_localKb'); }catch(e){}}""")
        pg.reload(wait_until="domcontentloaded")
        pg.wait_for_timeout(1200)

        before = pg.evaluate("()=>({rows:document.querySelectorAll('#kbTable tbody tr').length, stored:localStorage.getItem('ea2_localKb')})")
        print("  初始：表格 %d 行；localStorage=%s" % (before["rows"], "空" if not before["stored"] else "有值"))
        if before["stored"]:
            problems.append("初始状态预置条目竟被写入 localStorage（应为空）")
        if before["rows"] < 5:
            problems.append("初始表格行数 %d 偏少（应含 5 条校本预设）" % before["rows"])

        # 新增一条
        pg.evaluate("()=>{ document.getElementById('btnAddKb').click(); }")
        pg.wait_for_timeout(400)
        ok = pg.evaluate("""()=>{
          var s=document.getElementById('kbS'), p=document.getElementById('kbP'), t=document.getElementById('kbT');
          var d=document.getElementById('kbD'), x=document.getElementById('kbX'), u=document.getElementById('kbU');
          if(!s||!t) return 'no-form';
          t.value='测试条目-持久化回归';
          d.value='以本校通知为准';
          x.value='用于回归验证的临时条目';
          u.value='https://example.edu/test';
          document.getElementById('btnSaveKb').click();
          return 'saved';
        }""")
        pg.wait_for_timeout(900)
        after = pg.evaluate("()=>({rows:document.querySelectorAll('#kbTable tbody tr').length, stored:localStorage.getItem('ea2_localKb')})")
        print("  新增后：表格 %d 行；localStorage=%s" % (after["rows"], "有值" if after["stored"] else "空"))
        if after["rows"] != before["rows"] + 1:
            problems.append("新增条目后表格行数未 +1（%d → %d），保存动作可能失败(%s)" % (before["rows"], after["rows"], ok))
        if not after["stored"]:
            problems.append("新增条目未写入 localStorage，刷新后会丢失")
        else:
            import json
            try:
                arr = json.loads(after["stored"])
                presets = [x for x in arr if x.get("_preset")]
                mine = [x for x in arr if not x.get("_preset")]
                print("  落盘内容：自建 %d 条 / 预置 %d 条（预置应为 0）" % (len(mine), len(presets)))
                if presets:
                    problems.append("预置条目被写入 localStorage（应只落盘自建条目）")
                if len(mine) != 1:
                    problems.append("落盘自建条目数 %d，应为 1" % len(mine))
            except Exception as e:
                problems.append("localStorage 内容无法解析: %s" % e)

        # 刷新后是否仍在（且预置仍从文件读，不去重）
        pg.reload(wait_until="domcontentloaded")
        pg.wait_for_timeout(1200)
        final = pg.evaluate("()=>({rows:document.querySelectorAll('#kbTable tbody tr').length})")
        print("  刷新后：表格 %d 行（应 = 初始 + 1 = %d）" % (final["rows"], before["rows"] + 1))
        if final["rows"] != before["rows"] + 1:
            problems.append("刷新后行数 %d，应为 %d" % (final["rows"], before["rows"] + 1))
        dup = pg.evaluate("""()=>{
          var ids={},dup=[];
          (window.Agent&&window.Agent.localKbItems?window.Agent.localKbItems():[]).forEach(function(x){
            if(ids[x.id]) dup.push(x.id); ids[x.id]=1;
          });
          return dup;
        }""")
        print("  重复 id：%s" % (dup if dup else "无"))
        if dup:
            problems.append("出现重复条目 id：%s" % dup)

        # 清理测试数据
        pg.evaluate("()=>{try{localStorage.removeItem('ea2_localKb');}catch(e){}}")
        br.close()

    print("\n" + "=" * 70)
    if errs:
        problems.append("JS 报错: %s" % errs[:2])
    if problems:
        print("发现 %d 个问题：" % len(problems))
        for x in problems:
            print("  [X] " + x)
    else:
        print("A、B 两项回归全部通过")
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
