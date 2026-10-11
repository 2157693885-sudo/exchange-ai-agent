# -*- coding: utf-8 -*-
"""
fix_lang_fallback.py — 修语言回退与阿拉伯语译文
=====================================================================
修三处同类问题：
  1) agent.js「校本条目」分支用 title_en/summary_en 兜底，且 channel 直接取中文字段
     —— 阿拉伯语/俄语等会看到英文标题 + 中文渠道，属中英混排。
     改为走 KB.L(obj, field, lang)，与 matterText 保持一致。
  2) agent.js 国别名与来源分隔符用 zh 二元判断，非中文语种分隔符不符合当地标点习惯。
  3) i18n-v3.js 阿拉伯语 gateLead 的 "مرتبة بالترتيب" 语义重复（مرتبة 已表"排好"）。

用法：python fix_lang_fallback.py
"""
import io
import os
import shutil
import sys

# 脚本位于 _i18n工具/ 子目录，基准上跳一层回到「02_网页端全真系统」项目根
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENT = os.path.join(BASE, "assets", "js", "agent.js")
I18N = os.path.join(BASE, "assets", "js", "i18n-v3.js")

EDITS = [
    # ---- 1. 校本条目：标题 / 摘要 / 渠道 全部走 KB.L ----
    ('"<div><strong>" + (lang === "zh" ? it.title : (it.title_en || it.title)) + "</strong></div>" +',
     '"<div><strong>" + window.KB.L(it, "title", lang) + "</strong></div>" +'),
    ("'<p class=\"small\" style=\"margin:6px 0 0\">' + (lang === \"zh\" ? it.summary : (it.summary_en || it.summary)) + \"</p>\" +",
     "'<p class=\"small\" style=\"margin:6px 0 0\">' + window.KB.L(it, \"summary\", lang) + \"</p>\" +"),
    ("(it.channel ? '<p class=\"tiny muted\" style=\"margin:6px 0 0\">' + t(\"sourceLabel\") + (lang === \"zh\" ? \"：\" : \": \") + it.channel + \"</p>\" : \"\") +",
     "(window.KB.L(it, \"channel\", lang) ? '<p class=\"tiny muted\" style=\"margin:6px 0 0\">' + t(\"sourceLabel\") + (lang === \"zh\" ? \"：\" : \": \") + window.KB.L(it, \"channel\", lang) + \"</p>\" : \"\") +"),

    # ---- 2. 国别名：改走 KB.countryName（内部即 KB.L(c,"name")）----
    ('"country=" + (lang === "zh" ? c.zh : (c.en || c.zh)) + (p.arrival ? "；arriva',
     '"country=" + window.KB.L(c, "name", lang) + (p.arrival ? "；arriva'),
    ('"country=" + (lang === "zh" ? c.zh : (c.en || c.zh)));',
     '"country=" + window.KB.L(c, "name", lang));'),

    # ---- 3. 来源分隔符：按语种用当地标点 ----
    ('window.KB.sources(srcKeys).map(function (s) { return window.KB.L(s, "name"); }).join(lang === "zh" ? "；" : "; ")',
     'window.KB.sources(srcKeys).map(function (s) { return window.KB.L(s, "name"); }).join(sepFor(lang))'),
]


def main():
    # 备份
    for f in [AGENT, I18N]:
        shutil.copy2(f, f + ".bak_lang")

    with io.open(AGENT, "r", encoding="utf-8") as f:
        s = f.read()
    hit, miss = 0, []
    for old, new in EDITS:
        if old in s:
            s = s.replace(old, new)
            hit += 1
        else:
            miss.append(old[:80])
    print("agent.js 替换 %d/%d" % (hit, len(EDITS)))
    for m in miss:
        print("   [未命中] " + m)

    # 新增 sepFor：按语种返回列表分隔符
    if "function sepFor(" not in s:
        anchor = "  function matterText(m, lang) {"
        helper = (
            "  /* 列表分隔符：中日韩用全角顿号/分号，阿拉伯语用倒逗号，其余用半角 */\n"
            "  function sepFor(lang) {\n"
            "    var c = String(lang || \"zh\").slice(0, 2);\n"
            "    if (c === \"zh\") return \"；\";\n"
            "    if (c === \"ar\") return \"؛ \";\n"
            "    return \"; \";\n"
            "  }\n\n"
        )
        if anchor in s:
            s = s.replace(anchor, helper + anchor, 1)
            print("已插入 sepFor() 辅助函数")
        else:
            print("[警告] 未找到 matterText 锚点，sepFor 未插入")

    with io.open(AGENT, "w", encoding="utf-8") as f:
        f.write(s)

    # ---- 阿拉伯语译文去冗余 ----
    with io.open(I18N, "r", encoding="utf-8") as f:
        t = f.read()
    old_ar = "مرتبة بالترتيب: ما يجب فعله ومتى"
    new_ar = "بالترتيب الصحيح: ما يجب فعله ومتى"
    if old_ar in t:
        t = t.replace(old_ar, new_ar)
        with io.open(I18N, "w", encoding="utf-8") as f:
            f.write(t)
        print("阿拉伯语 gateLead 已去冗余：مرتبة بالترتيب → بالترتيب الصحيح")
    else:
        print("[警告] 未找到阿拉伯语待改文案")

    # ---- 校验 ----
    print("\n== 校验 ==")
    with io.open(AGENT, "r", encoding="utf-8") as f:
        a = f.read()
    left = a.count('lang === "zh" ? it.')
    print("  agent.js 残留 it.title_en 兜底: %d 处（应为 0）" % left)
    print("  agent.js 含 sepFor: %s" % ("是" if "function sepFor(" in a else "否"))
    try:
        compile(a, "agent.js", "exec")
        print("  agent.js 语法: OK")
    except SyntaxError as e:
        print("  agent.js 语法错误: %s (line %s)" % (e.msg, e.lineno))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
