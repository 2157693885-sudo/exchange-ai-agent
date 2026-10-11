# -*- coding: utf-8 -*-
"""
recover_keys.py — 从 2.0 归档逐字恢复丢失词条
=====================================================================
3.0 词典重建成对象格式时丢了 3 个键，运行时检测确认它们会在页面上
直接显示键名（showTag1/showTag2/showTag3），十语种全缺。

做法：解析 2.0 归档 i18n-v3.js 的行表格式 ["key","zh","en",...]，
      逐字取出译文，注入 3.0 的对应语言块（同 _add_pm_keys.py 的锚点策略）。
      不手抄，避免转写错误。

用法：python recover_keys.py
"""
import io
import os
import re
import sys

# 脚本位于 _i18n工具/ 子目录，基准上跳一层回到「02_网页端全真系统」项目根
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(BASE, "assets", "js", "i18n-v3.js")
ARCH = os.path.abspath(os.path.join(BASE, "..", "..", "..",
                                    "工作台2.0", "02_产品", "01_网页端",
                                    "assets", "js", "i18n-v3.js"))
LANGS = ["zh", "en", "ru", "ar", "fr", "es", "vi", "th", "my", "ms"]
TARGETS = ["showTag1", "showTag2", "showTag3"]


def parse_archive(path):
    """从 2.0 行表里取出 {key: [zh, en, ru, ar, fr, es, vi, th, my, ms]}"""
    with io.open(path, "r", encoding="utf-8") as f:
        s = f.read()
    out = {}
    for key in TARGETS:
        # 行形如：  ["showTag1", "四阶段…", "Four stages…", …],
        m = re.search(r'\["' + key + r'",\s*(.*?)\]\s*,?\s*\n', s, re.S)
        if not m:
            print("  [X] 归档中找不到 %s" % key)
            continue
        row = m.group(1)
        # 逐字提取双引号字符串（支持 \" 转义）
        vals = re.findall(r'"((?:[^"\\]|\\.)*)"', row)
        if len(vals) < 10:
            print("  [!] %s 只取到 %d 列（应 10）" % (key, len(vals)))
        out[key] = vals
    return out


def js_str(s):
    """还原成 JS 双引号字面量"""
    return '"' + s.replace('\\"', '\x00').replace('"', '\\"').replace("\x00", '\\"') + '"'


def main():
    if not os.path.exists(ARCH):
        print("找不到归档: " + ARCH)
        return 1
    data = parse_archive(ARCH)
    if not data:
        print("未能从归档解析出任何词条")
        return 1

    print("从归档解析到：")
    for k, v in data.items():
        print("  %-10s 中文=%s" % (k, v[0]))

    with io.open(DST, "r", encoding="utf-8") as f:
        src = f.read()
    if '"showTag1"' in src:
        print("\n目标文件已有 showTag1，跳过")
        return 1

    # 定位语言块（从后往前插，避免偏移失效）
    blocks = []
    for lang in LANGS:
        m = re.search(r'\n    "%s": \{' % lang, src)
        if not m:
            print("找不到语言块: " + lang)
            return 1
        blocks.append((lang, m.start()))

    for lang, start in reversed(blocks):
        end = src.find("\n    },", start)
        if end < 0:
            print("找不到 %s 块结尾" % lang)
            return 1
        seg = src[start:end]
        anchor = '      "mtPending": '
        ai = seg.find(anchor)
        if ai < 0:
            print("找不到 %s 的锚点" % lang)
            return 1
        line_end = seg.find("\n", ai)
        idx = LANGS.index(lang)
        lines = []
        for key in TARGETS:
            if key not in data:
                continue
            vals = data[key]
            v = vals[idx] if idx < len(vals) else vals[1]
            lines.append('      "%s": %s,' % (key, js_str(v)))
        add = "\n".join(lines)
        src = src[:start + line_end] + "\n" + add + src[start + line_end:]

    with io.open(DST, "w", encoding="utf-8") as f:
        f.write(src)
    print("\n已注入 %d 个键 × %d 语种 = %d 条" % (len(TARGETS), len(LANGS), len(TARGETS) * len(LANGS)))

    # 校验
    with io.open(DST, "r", encoding="utf-8") as f:
        chk = f.read()
    ok = True
    for key in TARGETS:
        n = len(re.findall(r'"' + key + r'"', chk))
        if n != 10:
            ok = False
        print("  %s 出现 %d 次（应 10）" % (key, n))
    print("\n结论：" + ("全部到位" if ok else "数量不符，请检查"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
