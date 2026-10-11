# -*- coding: utf-8 -*-
"""
add_pm_keys.py — 为「首页手机模拟」补齐 10 语词条
=====================================================================
背景：index.html 的手机模拟用 zh/en 二元判断写文案，导致非中文语种
      一律显示英文（阿拉伯语、俄语、越南语全部落到英文）。
      本脚本把模拟界面所需词条补进 i18n-v3.js，十语全量。

插入位置：各语言块的 "mtPending" 之后（该键十语块中均存在，可作稳定锚点）。

用法：python add_pm_keys.py
"""
import io
import os
import re
import sys

# 脚本位于 _i18n工具/ 子目录，基准上跳一层回到「02_网页端全真系统」项目根
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "assets", "js", "i18n-v3.js")

# ============ 新增词条（key → 十语）============
# 语序：zh, en, ru, ar, fr, es, vi, th, my, ms
NEW = {
    "pmSearchPh": [
        "问任何来华问题：签证、住宿登记…",
        "Ask anything about China: visas, accommodation…",
        "Спросите о чём угодно: виза, регистрация проживания…",
        "اسأل عن أي شيء يخص الصين: التأشيرة، تسجيل السكن…",
        "Posez votre question : visa, enregistrement du logement…",
        "Pregunta lo que quieras sobre China: visado, registro de alojamiento…",
        "Hỏi bất cứ điều gì về Trung Quốc: thị thực, đăng ký nơi ở…",
        "ถามได้ทุกเรื่องเกี่ยวกับจีน: วีซ่า ทะเบียนที่พัก…",
        "တရုတ်နှင့်ပတ်သက်၍ ဘာမဆို မေးပါ — ဗီဇာ၊ နေရာထိုင်ခင်း မှတ်ပုံတင်…",
        "Tanya apa-apa tentang China: visa, pendaftaran penginapan…",
    ],
    "pmAsk": [
        "提问", "Ask", "Спросить", "اسأل", "Demander", "Preguntar",
        "Hỏi", "ถาม", "မေးပါ", "Tanya",
    ],
    "pmWeekTodoTpl": [
        "本周待办 {n} 项", "{n} to-dos this week", "Задач на неделю: {n}",
        "{n} مهام هذا الأسبوع", "{n} tâches cette semaine", "{n} tareas esta semana",
        "{n} việc cần làm tuần này", "งานสัปดาห์นี้ {n} รายการ",
        "ဒီအပတ် လုပ်ရန် {n} ခု", "{n} tugasan minggu ini",
    ],
    "pmDoneTpl": [
        "已完成 {n} 项", "{n} done", "Выполнено: {n}", "تم إنجاز {n}",
        "{n} terminée(s)", "{n} completada(s)", "Đã xong {n}", "เสร็จแล้ว {n}",
        "ပြီးစီး {n} ခု", "{n} selesai",
    ],
    "pmTip": [
        "小贴士：持 X1 签证入境后须在 30 日内申请居留许可；住宿登记须在入住后 24 小时内完成。",
        "Tip: On an X1 visa, apply for your residence permit within 30 days of entry; register your accommodation within 24 hours of check-in.",
        "Совет: с визой X1 подайте на вид на жительство в течение 30 дней после въезда; регистрация места проживания — в течение 24 часов после заселения.",
        "نصيحة: بتأشيرة X1 قدّم طلب تصريح الإقامة خلال 30 يوماً من الدخول، وسجّل محل السكن خلال 24 ساعة من الوصول.",
        "Conseil : avec un visa X1, demandez le titre de séjour dans les 30 jours suivant l'entrée ; déclarez le logement dans les 24 heures suivant l'arrivée.",
        "Consejo: con visado X1, solicita el permiso de residencia en los 30 días siguientes a la entrada; registra el alojamiento en las 24 horas posteriores.",
        "Mẹo: với thị thực X1, xin giấy phép cư trú trong 30 ngày kể từ khi nhập cảnh; đăng ký nơi ở trong 24 giờ sau khi nhận phòng.",
        "เคล็ดลับ: หากถือวีซ่า X1 ต้องยื่นขอใบอนุญาตพำนักภายใน 30 วันนับจากวันเข้าเมือง และลงทะเบียนที่พักภายใน 24 ชั่วโมงหลังเข้าพัก",
        "အကြံပြုချက် — X1 ဗီဇာဖြင့် ဝင်ရောက်ပြီး 30 ရက်အတွင်း နေထိုင်ခွင့် လျှောက်ပါ။ နေရာထိုင်ခင်းကို 24 နာရီအတွင်း မှတ်ပုံတင်ပါ။",
        "Petua: Dengan visa X1, mohon permit pemastautinan dalam 30 hari selepas masuk; daftar penginapan dalam 24 jam selepas daftar masuk.",
    ],
    "pmVisa": [
        "签证办理", "Visa", "Виза", "التأشيرة", "Visa", "Visado",
        "Thị thực", "วีซ่า", "ဗီဇာ", "Visa",
    ],
    "pmHousing": [
        "住宿登记", "Housing", "Регистрация", "تسجيل السكن", "Logement",
        "Alojamiento", "Nơi ở", "ที่พัก", "နေရာထိုင်ခင်း", "Penginapan",
    ],
    "pmHealth": [
        "就医保险", "Health", "Медицина", "الصحة", "Santé", "Salud",
        "Y tế", "สุขภาพ", "ကျန်းမာရေး", "Kesihatan",
    ],
    "pmTravel": [
        "出行支付", "Travel", "Поездки", "السفر", "Voyage", "Viajes",
        "Đi lại", "เดินทาง", "ခရီးသွား", "Perjalanan",
    ],
    "pmMore": [
        "查看全部待办", "View all to-dos", "Все задачи", "عرض كل المهام",
        "Voir toutes les tâches", "Ver todas las tareas",
        "Xem tất cả việc cần làm", "ดูงานทั้งหมด",
        "လုပ်ရန်အားလုံး ကြည့်ရန်", "Lihat semua tugasan",
    ],
}

LANGS = ["zh", "en", "ru", "ar", "fr", "es", "vi", "th", "my", "ms"]


def js_str(s):
    """安全转义为 JS 双引号字符串"""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    with io.open(SRC, "r", encoding="utf-8") as f:
        src = f.read()

    if '"pmSearchPh"' in src:
        print("已存在 pm* 词条，跳过（如需重跑请先移除）")
        return 1

    # 定位每个语言块
    blocks = []
    for i, lang in enumerate(LANGS):
        m = re.search(r'\n    "%s": \{' % lang, src)
        if not m:
            print("找不到语言块:", lang)
            return 1
        blocks.append((lang, m.start()))

    # 从后往前插入，避免偏移失效
    inserted = 0
    for lang, start in reversed(blocks):
        end = src.find("\n    },", start)
        if end < 0:
            print("找不到 %s 块结尾" % lang)
            return 1
        seg = src[start:end]
        anchor = '      "mtPending": '
        ai = seg.find(anchor)
        if ai < 0:
            print("找不到 %s 的 mtPending 锚点" % lang)
            return 1
        # 锚点行的行尾
        line_end = seg.find("\n", ai)
        idx = LANGS.index(lang)
        lines = []
        for k, vals in NEW.items():
            lines.append('      "%s": %s,' % (k, js_str(vals[idx])))
        add = "\n".join(lines)
        src = src[:start + line_end] + "\n" + add + src[start + line_end:]
        inserted += 1

    with io.open(SRC, "w", encoding="utf-8") as f:
        f.write(src)

    print("已为 %d 个语言块各补 %d 词条（合计 %d 条）" % (inserted, len(NEW), inserted * len(NEW)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
