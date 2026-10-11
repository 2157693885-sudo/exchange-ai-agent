# -*- coding: utf-8 -*-
"""
rtl_logical.py — 把 RTL 硬覆盖改为 CSS 逻辑属性
=====================================================================
问题：原实现用手写 [dir="rtl"] 覆盖（9 条）来翻转布局，只 3 处用了逻辑属性。
      隐患是——以后每加一个组件，只要写了 margin-left / left:，
      在阿拉伯语下就会静默错位，且只有切到 RTL 才看得见。

做法：
  1. 把物理方向属性改成逻辑属性（margin-inline-start 等），浏览器自动翻转；
  2. 删除因此变得冗余的 [dir="rtl"] 覆盖；
  3. 清理已失效的死代码规则（.door-go / .gate-hero-rule 在原页面已无引用）；
  4. 保留必须物理化的两处并注明原因：
     - background-position（CSS 无逻辑版本）→ 补一条 RTL 覆盖
     - safe-area-inset（设备物理边缘，不随文字方向翻转）

用法：python rtl_logical.py
"""
import io
import os
import re
import shutil
import sys

# 脚本位于 _i18n工具/ 子目录，基准上跳一层回到「02_网页端全真系统」项目根
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ==================== base.css ====================
CSS_EDITS = [
    # 1) 列表缩进
    ("ul, ol { margin: 0 0 var(--sp-4); padding-left: 1.25em; }",
     "ul, ol { margin: 0 0 var(--sp-4); padding-inline-start: 1.25em; }"),
    # 2) 导航右对齐
    (".nav { display: flex; gap: var(--sp-1); margin-left: auto; flex-wrap: wrap; }",
     ".nav { display: flex; gap: var(--sp-1); margin-inline-start: auto; flex-wrap: wrap; }"),
    # 3) select 内边距（两条规则）
    ("background-repeat: no-repeat; padding-right: 34px; }",
     "background-repeat: no-repeat; padding-inline-end: 34px; }"),
    ("background-repeat: no-repeat; padding-right: 36px; }",
     "background-repeat: no-repeat; padding-inline-end: 36px; }"),
    # 4) 阶段卡文字对齐
    ("  position: relative; text-align: left; border: 1px solid var(--line); background: var(--surface);",
     "  position: relative; text-align: start; border: 1px solid var(--line); background: var(--surface);"),
    # 5) 阶段卡左侧色条
    ('.stage::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--ink-200); transition: background var(--dur) var(--ease); }',
     '.stage::before { content: ""; position: absolute; inset-block: 0; inset-inline: 0 auto; width: 4px; background: var(--ink-200); transition: background var(--dur) var(--ease); }'),
    # 6) 时间轴容器缩进
    (".timeline { position: relative; padding-left: 26px; }",
     ".timeline { position: relative; padding-inline-start: 26px; }"),
    # 7) 时间轴竖线
    ('.timeline::before { content: ""; position: absolute; left: 8px; top: 6px; bottom: 6px; width: 2px; background: var(--line); }',
     '.timeline::before { content: ""; position: absolute; inset-inline-start: 8px; inset-block: 6px; width: 2px; background: var(--line); }'),
    # 8) 时间轴节点圆点
    ('  content: ""; position: absolute; left: -22px; top: 6px; width: 11px; height: 11px; border-radius: 50%;',
     '  content: ""; position: absolute; inset-inline-start: -22px; top: 6px; width: 11px; height: 11px; border-radius: 50%;'),
    # 9) 数据表文字对齐
    ("table.data th, table.data td { padding: 11px 13px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }",
     "table.data th, table.data td { padding: 11px 13px; text-align: start; border-bottom: 1px solid var(--line); vertical-align: top; }"),
    # 10) 窄屏导航
    ("  .nav { order: 3; width: 100%; margin-left: 0; }",
     "  .nav { order: 3; width: 100%; margin-inline-start: 0; }"),
    # 11) 纸张标题
    (".paper-name { margin-left: auto; font-weight: 650; color: var(--ink-600); }",
     ".paper-name { margin-inline-start: auto; font-weight: 650; color: var(--ink-600); }"),
    # 12) 四阶段节点圆点
    ('.j-step::before{content:"";position:absolute;top:-5px;left:0;width:10px;height:10px;border-radius:50%;background:var(--line-strong)}',
     '.j-step::before{content:"";position:absolute;top:-5px;inset-inline-start:0;width:10px;height:10px;border-radius:50%;background:var(--line-strong)}'),
]

# ==================== 需要删除的 RTL 覆盖（已被逻辑属性取代）====================
CSS_DROP = """[dir="rtl"] .timeline { padding-left: 0; padding-right: 26px; }
[dir="rtl"] .timeline::before { left: auto; right: 8px; }
[dir="rtl"] .tl-item::before { left: auto; right: -22px; }
[dir="rtl"] .stage { text-align: right; }
[dir="rtl"] .stage::before { inset: 0 0 0 auto; }
[dir="rtl"] .nav { margin-left: 0; margin-right: auto; }
"""

# ==================== 死代码（原页面已无引用的方向性规则）====================
CSS_DEAD = """[dir="rtl"] .door-go svg { transform: scaleX(-1); }
[dir="rtl"] .door:hover .door-go svg { transform: translateX(-4px) scaleX(-1); }
[dir="rtl"] .gate-hero-rule { background: linear-gradient(270deg, #FFFFFF, rgba(255, 255, 255, 0)); }
"""

# 替换后的新内容：保留必要的 RTL 覆盖并注明原因
CSS_NEW_RTL = """/* =========================================================================
   RTL 方向适配
   -------------------------------------------------------------------------
   本项目已全面采用 CSS 逻辑属性（margin-inline / padding-inline /
   inset-inline 等），布局随 <html dir> 自动翻转，无需逐组件写覆盖规则。

   仅以下两类必须保持"物理方向"，因此单独处理：
     1) background-position —— CSS 没有逻辑版本，需按方向显式翻转
     2) safe-area-inset-* —— 设备物理边缘（刘海/圆角），不随文字方向改变
   ========================================================================= */

/* 下拉箭头：LTR 在右侧，RTL 镜像到左侧 */
[dir="rtl"] .select { background-position: 18px 50%, 13px 50%; }
"""


def edit(path, pairs, label):
    p = os.path.join(BASE, path)
    with io.open(p, "r", encoding="utf-8") as f:
        s = f.read()
    orig = s
    hit, miss = 0, []
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new)
            hit += 1
        else:
            miss.append(old[:64])
    if s != orig:
        with io.open(p, "w", encoding="utf-8") as f:
            f.write(s)
    print("  %-16s 替换 %d/%d" % (path, hit, len(pairs)))
    for m in miss:
        print("      [未命中] " + m)
    return hit, miss


def main():
    # 备份
    for f in ["assets/css/base.css", "index.html", "student.html", "institution.html"]:
        src = os.path.join(BASE, f)
        if os.path.exists(src):
            shutil.copy2(src, src + ".bak_i18n")

    print("== 1. base.css 物理属性 → 逻辑属性 ==")
    edit("assets/css/base.css", CSS_EDITS, "base.css")

    print("\n== 2. 删除已被取代的 RTL 覆盖 ==")
    p = os.path.join(BASE, "assets/css/base.css")
    with io.open(p, "r", encoding="utf-8") as f:
        s = f.read()
    if CSS_DROP in s:
        s = s.replace(CSS_DROP, CSS_NEW_RTL)
        print("  已删除 6 条冗余覆盖，写入新的 RTL 说明段")
    else:
        print("  [警告] 未找到待删除的 RTL 覆盖块，请人工核对")

    print("\n== 3. 清理死代码方向规则 ==")
    if CSS_DEAD in s:
        s = s.replace(CSS_DEAD, "")
        print("  已删除 3 条死代码规则（.door-go / .gate-hero-rule，页面无引用）")
    else:
        print("  [提示] 死代码块未整体匹配，逐条处理")
        for line in CSS_DEAD.strip().split("\n"):
            if line in s:
                s = s.replace(line + "\n", "")
                print("    已删: " + line[:70])

    with io.open(p, "w", encoding="utf-8") as f:
        f.write(s)

    print("\n== 4. 三个 HTML 的 inline 样式 ==")
    edit("index.html", [
        (".pm-stage em{margin-left:auto;color:#a08a6e;font-style:normal}",
         ".pm-stage em{margin-inline-start:auto;color:#a08a6e;font-style:normal}"),
    ], "index.html")
    edit("student.html", [
        (".sec-title .count{margin-left:auto;font-size:.82rem;font-weight:600;color:var(--ink-500)}",
         ".sec-title .count{margin-inline-start:auto;font-size:.82rem;font-weight:600;color:var(--ink-500)}"),
        ("  .tl::before{top:8px;bottom:20px;left:16px;right:auto;width:2px;height:auto}",
         "  .tl::before{top:8px;bottom:20px;inset-inline-start:16px;inset-inline-end:auto;width:2px;height:auto}"),
        ("  .appbar-tools{width:100%;justify-content:center;margin-left:0}",
         "  .appbar-tools{width:100%;justify-content:center;margin-inline-start:0}"),
    ], "student.html")
    edit("institution.html", [
        ('<div id="pvBody" style="max-height:460px;overflow-y:auto;padding-right:6px">',
         '<div id="pvBody" style="max-height:460px;overflow-y:auto;padding-inline-end:6px">'),
    ], "institution.html")

    print("\n== 5. 结果核对 ==")
    with io.open(os.path.join(BASE, "assets/css/base.css"), "r", encoding="utf-8") as f:
        css = f.read()
    rtl_n = len(re.findall(r'\[dir="rtl"\]', css))
    logi = len(re.findall(r"inline-start|inline-end|text-align:\s*start|inset-block", css))
    phys = len(re.findall(r"(?<![-\w])(margin|padding)-(left|right):", css))
    print("  base.css：[dir=rtl] 覆盖 %d 条（应为 1，仅 select 箭头）" % rtl_n)
    print("           逻辑属性 %d 处" % logi)
    print("           残留物理 margin/padding-left|right %d 处" % phys)
    return 0


if __name__ == "__main__":
    sys.exit(main())
