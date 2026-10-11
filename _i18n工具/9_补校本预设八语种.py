# -*- coding: utf-8 -*-
"""
add_sysu_i18n.py — 把中山大学校本预设补进八语种内容包
=====================================================================
背景：kb-school-sysu.js 的 5 条 preset_sysu_* 只有中/英字段，
      阿/俄/西/法/越/泰/缅/马 八语种全部回退英文。

做法：按项目既有架构（内容层多语走 kb-i18n-*.js 包），
      把 5 条预设的 title/summary/channel/risk/label 写入各包 matter 段。
      与既有 27 条事项完全同构，不新造机制。

用法：python add_sysu_i18n.py
"""
import io
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(BASE, "assets", "js")

LANGS = ["ar", "ru", "es", "fr", "vi", "th", "my", "ms"]

# 共性文案：5 条预设的渠道与风险提示基本相同
CHANNEL = {
    "ar": "مكتب الطلاب الدوليين بجامعة صن يات سين (نموذج خاص بالمؤسسة)",
    "ru": "Отдел по работе с иностранными студентами Университета Сунь Ятсена (пример учреждения)",
    "es": "Oficina de Estudiantes Internacionales de la SYSU (ejemplo del centro)",
    "fr": "Bureau des étudiants internationaux de la SYSU (exemple d'établissement)",
    "vi": "Phòng Sinh viên Quốc tế Đại học Trung Sơn (ví dụ theo đơn vị)",
    "th": "สำนักงานนักศึกษาต่างชาติ มหาวิทยาลัยซุนยัตเซ็น (ตัวอย่างตามสถานศึกษา)",
    "my": "ဆန်ယက်ဆန် တက္ကသိုလ် နိုင်ငံခြားကျောင်းသားရေးရာရုံး (အဖွဲ့အစည်း နမူနာ)",
    "ms": "Pejabat Pelajar Antarabangsa SYSU (contoh institusi)",
}
RISK_LONG = {
    "ar": "بيانات نموذجية. يُرجى الرجوع إلى أحدث إعلان رسمي من الجامعة؛ انظر iso.sysu.edu.cn",
    "ru": "Демонстрационные данные. Сверяйтесь с последним официальным объявлением университета; см. iso.sysu.edu.cn",
    "es": "Datos de ejemplo. Consulte el último aviso oficial de la universidad; véase iso.sysu.edu.cn",
    "fr": "Données d'exemple. Reportez-vous au dernier avis officiel de l'université ; voir iso.sysu.edu.cn",
    "vi": "Dữ liệu minh hoạ. Vui lòng tham khảo thông báo chính thức mới nhất của nhà trường; xem iso.sysu.edu.cn",
    "th": "ข้อมูลตัวอย่าง โปรดอ้างอิงประกาศอย่างเป็นทางการล่าสุดของมหาวิทยาลัย ดู iso.sysu.edu.cn",
    "my": "နမူနာ အချက်အလက် ဖြစ်သည်။ တက္ကသိုလ်၏ နောက်ဆုံး တရားဝင် ကြေညာချက်ကို ကိုးကားပါ။ iso.sysu.edu.cn",
    "ms": "Data contoh. Rujuk pengumuman rasmi terkini universiti; lihat iso.sysu.edu.cn",
}
RISK_SHORT = {
    "ar": "بيانات نموذجية. يُرجى الرجوع إلى أحدث إعلان رسمي من الجامعة.",
    "ru": "Демонстрационные данные. Сверяйтесь с последним официальным объявлением университета.",
    "es": "Datos de ejemplo. Consulte el último aviso oficial de la universidad.",
    "fr": "Données d'exemple. Reportez-vous au dernier avis officiel de l'université.",
    "vi": "Dữ liệu minh hoạ. Vui lòng tham khảo thông báo chính thức mới nhất của nhà trường.",
    "th": "ข้อมูลตัวอย่าง โปรดอ้างอิงประกาศอย่างเป็นทางการล่าสุดของมหาวิทยาลัย",
    "my": "နမူနာ အချက်အလက် ဖြစ်သည်။ တက္ကသိုလ်၏ နောက်ဆုံး တရားဝင် ကြေညာချက်ကို ကိုးကားပါ။",
    "ms": "Data contoh. Rujuk pengumuman rasmi terkini universiti.",
}
RISK_GUIDE = {
    "ar": "بيانات نموذجية. يُرجى الرجوع إلى أحدث إعلان رسمي من الجامعة؛ انظر iso.sysu.edu.cn/cn/bz",
    "ru": "Демонстрационные данные. Сверяйтесь с последним официальным объявлением университета; см. iso.sysu.edu.cn/cn/bz",
    "es": "Datos de ejemplo. Consulte el último aviso oficial de la universidad; véase iso.sysu.edu.cn/cn/bz",
    "fr": "Données d'exemple. Reportez-vous au dernier avis officiel de l'université ; voir iso.sysu.edu.cn/cn/bz",
    "vi": "Dữ liệu minh hoạ. Vui lòng tham khảo thông báo chính thức mới nhất của nhà trường; xem iso.sysu.edu.cn/cn/bz",
    "th": "ข้อมูลตัวอย่าง โปรดอ้างอิงประกาศอย่างเป็นทางการล่าสุดของมหาวิทยาลัย ดู iso.sysu.edu.cn/cn/bz",
    "my": "နမူနာ အချက်အလက် ဖြစ်သည်။ တက္ကသိုလ်၏ နောက်ဆုံး တရားဝင် ကြေညာချက်ကို ကိုးကားပါ။ iso.sysu.edu.cn/cn/bz",
    "ms": "Data contoh. Rujuk pengumuman rasmi terkini universiti; lihat iso.sysu.edu.cn/cn/bz",
}

T = {
    "preset_sysu_reg": {
        "ar": dict(
            title="تسجيل الالتحاق بجامعة صن يات سين (خاص بالمؤسسة)",
            summary="على الطلاب المقبولين إتمام إجراءات التسجيل والالتحاق شخصياً في التاريخ والحرم الجامعي المحددين في إشعار القبول؛ لا يُقبل الحضور المبكر. اصطحب إشعار القبول وجواز السفر الأصلي واستمارة JW201/JW202، واستلم بطاقة الطالب وبطاقة الحرم الجامعي بعد التسجيل.",
            label="حسب التاريخ المحدد في إشعار القبول",
        ),
        "ru": dict(
            title="Регистрация и зачисление в Университет Сунь Ятсена (по учреждению)",
            summary="Зачисленные студенты обязаны лично пройти регистрацию и оформление в дату и в кампусе, указанные в уведомлении о зачислении; досрочный приезд не принимается. Возьмите уведомление о зачислении, оригинал паспорта и форму JW201/JW202; студенческий билет и кампусную карту выдают после регистрации.",
            label="По дате, указанной в уведомлении о зачислении",
        ),
        "es": dict(
            title="Matrícula y registro en la SYSU (centro)",
            summary="El alumnado admitido debe formalizar la matrícula y el registro presencialmente en la fecha y el campus indicados en la carta de admisión; no se admite la llegada anticipada. Lleve la carta de admisión, el pasaporte original y el formulario JW201/JW202; el carné de estudiante y la tarjeta del campus se entregan tras el registro.",
            label="Según la fecha indicada en la carta de admisión",
        ),
        "fr": dict(
            title="Inscription et enregistrement à la SYSU (établissement)",
            summary="Les étudiants admis doivent accomplir en personne les formalités d'inscription à la date et sur le campus indiqués dans la lettre d'admission ; aucune arrivée anticipée n'est acceptée. Munissez-vous de la lettre d'admission, du passeport original et du formulaire JW201/JW202 ; la carte d'étudiant et la carte de campus sont remises après l'inscription.",
            label="Selon la date indiquée dans la lettre d'admission",
        ),
        "vi": dict(
            title="Đăng ký nhập học tại Đại học Trung Sơn (theo đơn vị)",
            summary="Sinh viên được nhận phải trực tiếp làm thủ tục đăng ký, nhập học đúng ngày và đúng cơ sở ghi trong Giấy báo nhập học; không tiếp nhận đến sớm. Mang theo giấy báo nhập học, hộ chiếu bản gốc và mẫu JW201/JW202; thẻ sinh viên và thẻ khuôn viên được phát sau khi đăng ký.",
            label="Theo ngày ghi trong Giấy báo nhập học",
        ),
        "th": dict(
            title="การลงทะเบียนเรียนที่มหาวิทยาลัยซุนยัตเซ็น (ตามสถานศึกษา)",
            summary="นักศึกษาที่ได้รับตอบรับต้องมาทำการลงทะเบียนด้วยตนเอง ณ วันที่และวิทยาเขตที่ระบุในหนังสือตอบรับ ไม่รับการเดินทางมาก่อนกำหนด โปรดนำหนังสือตอบรับ หนังสือเดินทางฉบับจริง และแบบฟอร์ม JW201/JW202 โดยจะได้รับบัตรนักศึกษาและบัตรวิทยาเขตหลังลงทะเบียน",
            label="ตามวันที่ระบุในหนังสือตอบรับ",
        ),
        "my": dict(
            title="ဆန်ယက်ဆန် တက္ကသိုလ် စာရင်းသွင်းခြင်း (အဖွဲ့အစည်းအလိုက်)",
            summary="ဝင်ခွင့်ရရှိသော ကျောင်းသားများသည် ဝင်ခွင့်စာတမ်းတွင် ဖော်ပြထားသည့် ရက်စွဲနှင့် ကျောင်းဝင်းတွင် ကိုယ်တိုင် စာရင်းသွင်းရမည်။ ကြိုတင်ရောက်ရှိခြင်းကို လက်မခံပါ။ ဝင်ခွင့်စာတမ်း၊ မူရင်းနိုင်ငံကူးလက်မှတ်နှင့် JW201/JW202 ဖောင်ကို ယူဆောင်လာပါ။",
            label="ဝင်ခွင့်စာတမ်းတွင် ဖော်ပြသည့် ရက်စွဲအတိုင်း",
        ),
        "ms": dict(
            title="Pendaftaran dan enrolmen SYSU (mengikut institusi)",
            summary="Pelajar yang diterima mesti hadir sendiri untuk mendaftar pada tarikh dan kampus yang dinyatakan dalam Surat Tawaran; ketibaan awal tidak diterima. Bawa surat tawaran, pasport asal dan borang JW201/JW202; kad pelajar dan kad kampus diberikan selepas pendaftaran.",
            label="Mengikut tarikh yang dinyatakan dalam surat tawaran",
        ),
    },
    "preset_sysu_res": {
        "ar": dict(
            title="تحويل تأشيرة X1 إلى تصريح إقامة (مدة المؤسسة)",
            summary="بعد الدخول بتأشيرة الدراسة X1، يجب إتمام التسجيل في الجامعة ثم تحويل التأشيرة إلى تصريح إقامة دراسية لدى إدارة الدخول والخروج خلال 30 يوماً من تاريخ الدخول، وذلك بإشعار القبول واستمارة JW201/JW202.",
            label="خلال 30 يوماً من الدخول",
        ),
        "ru": dict(
            title="Замена визы X1 на вид на жительство (сроки учреждения)",
            summary="После въезда по учебной визе X1 необходимо оформить регистрацию в университете и в течение 30 дней с даты въезда заменить визу X1 на учебный вид на жительство в органе миграционного учёта, предъявив уведомление о зачислении и форму JW201/JW202.",
            label="В течение 30 дней после въезда",
        ),
        "es": dict(
            title="Convertir el visado X1 en permiso de residencia (plazo del centro)",
            summary="Tras entrar con un visado de estudios X1, hay que completar el registro en la universidad y convertir el visado X1 en permiso de residencia de estudios en la administración de entrada y salida en un plazo de 30 días desde la entrada, presentando la carta de admisión y el formulario JW201/JW202.",
            label="En los 30 días siguientes a la entrada",
        ),
        "fr": dict(
            title="Convertir le visa X1 en titre de séjour (délai de l'établissement)",
            summary="Après une entrée avec un visa d'études X1, il faut finaliser l'inscription à l'université puis convertir le visa X1 en titre de séjour étudiant auprès de l'administration des entrées et sorties dans les 30 jours suivant l'entrée, avec la lettre d'admission et le formulaire JW201/JW202.",
            label="Dans les 30 jours suivant l'entrée",
        ),
        "vi": dict(
            title="Chuyển thị thực X1 sang giấy phép cư trú (thời hạn theo đơn vị)",
            summary="Sau khi nhập cảnh bằng thị thực du học X1, phải hoàn tất đăng ký tại trường và chuyển thị thực X1 sang giấy phép cư trú du học tại cơ quan quản lý xuất nhập cảnh trong vòng 30 ngày kể từ ngày nhập cảnh, kèm giấy báo nhập học và mẫu JW201/JW202.",
            label="Trong vòng 30 ngày kể từ ngày nhập cảnh",
        ),
        "th": dict(
            title="เปลี่ยนวีซ่า X1 เป็นใบอนุญาตพำนัก (ระยะเวลาตามสถานศึกษา)",
            summary="หลังจากเดินทางเข้าด้วยวีซ่านักเรียน X1 ต้องลงทะเบียนที่มหาวิทยาลัยให้เสร็จ และเปลี่ยนวีซ่า X1 เป็นใบอนุญาตพำนักประเภทศึกษาที่สำนักงานตรวจคนเข้าเมืองภายใน 30 วันนับจากวันเข้าเมือง โดยใช้หนังสือตอบรับและแบบฟอร์ม JW201/JW202",
            label="ภายใน 30 วันนับจากวันเข้าเมือง",
        ),
        "my": dict(
            title="X1 ဗီဇာကို နေထိုင်ခွင့်သို့ ပြောင်းလဲခြင်း (အဖွဲ့အစည်း သတ်မှတ်ကာလ)",
            summary="X1 ကျောင်းသား ဗီဇာဖြင့် ဝင်ရောက်ပြီးနောက် တက္ကသိုလ်တွင် စာရင်းသွင်းမှု ပြီးစီးပြီး ဝင်ရောက်သည့်နေ့မှ 30 ရက်အတွင်း လူဝင်မှုကြီးကြပ်ရေးရုံးတွင် X1 ဗီဇာကို ကျောင်းသား နေထိုင်ခွင့်အဖြစ် ပြောင်းလဲရမည်။",
            label="ဝင်ရောက်ပြီး 30 ရက်အတွင်း",
        ),
        "ms": dict(
            title="Tukar visa X1 kepada permit pemastautinan (tempoh institusi)",
            summary="Selepas masuk dengan visa pelajar X1, lengkapkan pendaftaran di universiti dan tukar visa X1 kepada permit pemastautinan pelajar di jabatan imigresen dalam tempoh 30 hari selepas masuk, dengan surat tawaran dan borang JW201/JW202.",
            label="Dalam 30 hari selepas masuk",
        ),
    },
    "preset_sysu_pay": {
        "ar": dict(
            title="سداد الرسوم الدراسية ورسوم السكن (قناة المؤسسة)",
            summary="تُسدَّد الرسوم الدراسية ورسوم السكن إلكترونياً عبر منصة الدفع بجامعة صن يات سين، وتدعم علي باي ووي تشات ويونيون باي والبطاقات الدولية (VISA / MasterCard / JCB / American Express)؛ ويُشترط السداد المسبق قبل دخول السكن.",
            label="حسب الجدول المعلن على منصة الدفع",
        ),
        "ru": dict(
            title="Оплата обучения и общежития (канал учреждения)",
            summary="Плата за обучение и общежитие вносится онлайн через платёжную платформу Университета Сунь Ятсена; поддерживаются Alipay, WeChat, UnionPay и международные карты (VISA / MasterCard / JCB / American Express). Заселение в общежитие — только после оплаты.",
            label="По графику, объявленному на платёжной платформе",
        ),
        "es": dict(
            title="Pago de matrícula y alojamiento (canal del centro)",
            summary="Las tasas de matrícula y alojamiento se abonan en línea a través de la plataforma de pagos de la SYSU, que admite Alipay, WeChat, UnionPay y tarjetas internacionales (VISA / MasterCard / JCB / American Express). El acceso al alojamiento exige el pago previo.",
            label="Según el calendario publicado en la plataforma de pagos",
        ),
        "fr": dict(
            title="Paiement des frais de scolarité et de logement (canal de l'établissement)",
            summary="Les frais de scolarité et de logement se règlent en ligne via la plateforme de paiement de la SYSU, qui accepte Alipay, WeChat, UnionPay et les cartes internationales (VISA / MasterCard / JCB / American Express). L'accès au logement exige un paiement préalable.",
            label="Selon le calendrier annoncé sur la plateforme de paiement",
        ),
        "vi": dict(
            title="Nộp học phí và phí ký túc xá (kênh của đơn vị)",
            summary="Học phí và phí ký túc xá được nộp trực tuyến qua nền tảng thanh toán của Đại học Trung Sơn, hỗ trợ Alipay, WeChat, UnionPay và thẻ quốc tế (VISA / MasterCard / JCB / American Express); phải nộp trước khi vào ở ký túc xá.",
            label="Theo lịch thông báo trên nền tảng thanh toán",
        ),
        "th": dict(
            title="การชำระค่าเล่าเรียนและค่าหอพัก (ช่องทางของสถานศึกษา)",
            summary="ค่าเล่าเรียนและค่าหอพักชำระออนไลน์ผ่านแพลตฟอร์มชำระเงินของมหาวิทยาลัยซุนยัตเซ็น รองรับ Alipay, WeChat, UnionPay และบัตรระหว่างประเทศ (VISA / MasterCard / JCB / American Express) ต้องชำระก่อนเข้าพักหอพัก",
            label="ตามกำหนดการที่แจ้งบนแพลตฟอร์มชำระเงิน",
        ),
        "my": dict(
            title="ကျောင်းလခနှင့် အဆောင်ခ ပေးသွင်းခြင်း (အဖွဲ့အစည်း လမ်းကြောင်း)",
            summary="ကျောင်းလခနှင့် အဆောင်ခကို ဆန်ယက်ဆန် တက္ကသိုလ် ငွေပေးချေမှု ပလက်ဖောင်းမှတစ်ဆင့် အွန်လိုင်း ပေးသွင်းနိုင်သည်။ Alipay၊ WeChat၊ UnionPay နှင့် နိုင်ငံတကာ ကတ်များ ပံ့ပိုးသည်။ အဆောင်သို့ မဝင်မီ ကြိုတင်ပေးသွင်းရမည်။",
            label="ငွေပေးချေမှု ပလက်ဖောင်းတွင် ကြေညာသည့် အချိန်အတိုင်း",
        ),
        "ms": dict(
            title="Bayaran yuran pengajian dan asrama (saluran institusi)",
            summary="Yuran pengajian dan asrama dibayar dalam talian melalui platform pembayaran SYSU, menyokong Alipay, WeChat, UnionPay dan kad antarabangsa (VISA / MasterCard / JCB / American Express). Kemasukan ke asrama memerlukan bayaran terlebih dahulu.",
            label="Mengikut jadual yang diumumkan di platform pembayaran",
        ),
    },
    "preset_sysu_contact": {
        "ar": dict(
            title="قنوات التواصل الرسمية بجامعة صن يات سين (خاص بالمؤسسة)",
            summary="شؤون البرامج والطلاب: iso.sysu.edu.cn؛ التقديم الإلكتروني: apply.sysu.edu.cn؛ البريد الإلكتروني: admissions@mail.sysu.edu.cn؛ هاتف القبول: 0086 (20) 84110819.",
        ),
        "ru": dict(
            title="Официальные контакты Университета Сунь Ятсена (по учреждению)",
            summary="Программы и текущие вопросы: iso.sysu.edu.cn; онлайн-заявка: apply.sysu.edu.cn; почта: admissions@mail.sysu.edu.cn; телефон приёмной комиссии: 0086 (20) 84110819.",
        ),
        "es": dict(
            title="Canales oficiales de contacto de la SYSU (centro)",
            summary="Programas y trámites: iso.sysu.edu.cn; solicitud en línea: apply.sysu.edu.cn; correo: admissions@mail.sysu.edu.cn; teléfono de admisión: 0086 (20) 84110819.",
        ),
        "fr": dict(
            title="Canaux de contact officiels de la SYSU (établissement)",
            summary="Programmes et démarches : iso.sysu.edu.cn ; candidature en ligne : apply.sysu.edu.cn ; courriel : admissions@mail.sysu.edu.cn ; téléphone admissions : 0086 (20) 84110819.",
        ),
        "vi": dict(
            title="Kênh liên hệ chính thức của Đại học Trung Sơn (theo đơn vị)",
            summary="Chương trình và thủ tục: iso.sysu.edu.cn; đăng ký trực tuyến: apply.sysu.edu.cn; email: admissions@mail.sysu.edu.cn; điện thoại tuyển sinh: 0086 (20) 84110819.",
        ),
        "th": dict(
            title="ช่องทางติดต่ออย่างเป็นทางการของมหาวิทยาลัยซุนยัตเซ็น (ตามสถานศึกษา)",
            summary="หลักสูตรและงานทั่วไป: iso.sysu.edu.cn; สมัครออนไลน์: apply.sysu.edu.cn; อีเมล: admissions@mail.sysu.edu.cn; โทรศัพท์ฝ่ายรับสมัคร: 0086 (20) 84110819",
        ),
        "my": dict(
            title="ဆန်ယက်ဆန် တက္ကသိုလ် တရားဝင် ဆက်သွယ်ရေးလမ်းကြောင်း (အဖွဲ့အစည်းအလိုက်)",
            summary="သင်တန်းနှင့် လုပ်ငန်းများ: iso.sysu.edu.cn; အွန်လိုင်း လျှောက်လွှာ: apply.sysu.edu.cn; အီးမေးလ်: admissions@mail.sysu.edu.cn; ဝင်ခွင့် ဖုန်း: 0086 (20) 84110819",
        ),
        "ms": dict(
            title="Saluran hubungan rasmi SYSU (mengikut institusi)",
            summary="Program dan urusan: iso.sysu.edu.cn; permohonan dalam talian: apply.sysu.edu.cn; e-mel: admissions@mail.sysu.edu.cn; telefon kemasukan: 0086 (20) 84110819.",
        ),
    },
    "preset_sysu_guide": {
        "ar": dict(
            title="الأدلة الرسمية للتسجيل (مواد المؤسسة)",
            summary="ينشر مركز المساعدة الرسمي «دليل التحاق الطلاب الدوليين الجدد 2026» و«دليل ما قبل الوصول» وغيرهما من المواد الرسمية، وتشمل التسجيل والتأشيرة والسكن والرسوم والفحص الطبي؛ يُنصح بقراءتها قبل السفر.",
        ),
        "ru": dict(
            title="Официальные руководства по поступлению (материалы учреждения)",
            summary="Официальный справочный центр публикует «Руководство для новых иностранных студентов 2026» и «Руководство перед приездом», охватывающие регистрацию, визу, общежитие, оплату и медицинский осмотр. Рекомендуется прочитать до отъезда.",
        ),
        "es": dict(
            title="Guías oficiales de matrícula (materiales del centro)",
            summary="El centro de ayuda oficial publica la «Guía de matrícula para nuevos estudiantes internacionales 2026» y la «Guía previa a la llegada», que cubren matrícula, visado, alojamiento, pagos y reconocimiento médico. Se recomienda leerlas antes de viajar.",
        ),
        "fr": dict(
            title="Guides officiels d'inscription (documents de l'établissement)",
            summary="Le centre d'aide officiel publie le « Guide d'inscription des nouveaux étudiants internationaux 2026 » et le « Guide avant l'arrivée », couvrant inscription, visa, logement, paiements et visite médicale. À lire avant le départ.",
        ),
        "vi": dict(
            title="Hướng dẫn nhập học chính thức (tài liệu của đơn vị)",
            summary="Trung tâm trợ giúp chính thức công bố «Hướng dẫn nhập học cho sinh viên quốc tế mới 2026» và «Hướng dẫn trước khi đến», bao gồm đăng ký, thị thực, ký túc xá, thanh toán và khám sức khoẻ. Nên đọc trước khi lên đường.",
        ),
        "th": dict(
            title="คู่มือการลงทะเบียนอย่างเป็นทางการ (เอกสารของสถานศึกษา)",
            summary="ศูนย์ช่วยเหลืออย่างเป็นทางการเผยแพร่ «คู่มือการลงทะเบียนสำหรับนักศึกษาต่างชาติใหม่ ปี 2026» และ «คู่มือก่อนเดินทาง» ครอบคลุมการลงทะเบียน วีซ่า หอพัก การชำระเงิน และการตรวจสุขภาพ ควรอ่านก่อนเดินทาง",
        ),
        "my": dict(
            title="တရားဝင် ဝင်ခွင့်လမ်းညွှန်များ (အဖွဲ့အစည်း စာရွက်စာတမ်း)",
            summary="တရားဝင် အကူအညီစင်တာတွင် «၂၀၂၆ နိုင်ငံခြားကျောင်းသား အသစ်များအတွက် စာရင်းသွင်းလမ်းညွှန်» နှင့် «မရောက်မီ လမ်းညွှန်» ကို ထုတ်ပြန်ထားပြီး စာရင်းသွင်းခြင်း၊ ဗီဇာ၊ အဆောင်၊ ငွေပေးချေမှုနှင့် ကျန်းမာရေးစစ်ဆေးမှု ပါဝင်သည်။",
        ),
        "ms": dict(
            title="Panduan pendaftaran rasmi (bahan institusi)",
            summary="Pusat bantuan rasmi menerbitkan «Panduan Pendaftaran Pelajar Antarabangsa Baharu 2026» dan «Panduan Sebelum Tiba», merangkumi pendaftaran, visa, asrama, bayaran dan pemeriksaan kesihatan. Digalakkan membaca sebelum bertolak.",
        ),
    },
}


def j(s):
    return json.dumps(s, ensure_ascii=False)


def block_for(lang):
    """生成该语种的 preset 条目块（缩进 4 空格，位于 matter 段内）"""
    out = ["    /* ---- 试点校本预设（中山大学，S3 待属地复核）---- */"]
    for pid in ["preset_sysu_reg", "preset_sysu_res", "preset_sysu_pay",
                "preset_sysu_contact", "preset_sysu_guide"]:
        e = T[pid][lang]
        out.append("    %s: {" % pid)
        out.append("      title: %s," % j(e["title"]))
        out.append("      summary: %s," % j(e["summary"]))
        out.append("      channel: %s," % j(CHANNEL[lang]))
        has_label = bool(e.get("label"))
        if pid == "preset_sysu_contact":
            risk = RISK_SHORT[lang]
        elif pid == "preset_sysu_guide":
            risk = RISK_GUIDE[lang]
        else:
            risk = RISK_LONG[lang]
        # 注意：后面还有 label 时必须带尾逗号，否则 JS 语法错误
        out.append("      risk: %s%s" % (j(risk), "," if has_label else ""))
        if has_label:
            out.append("      label: %s" % j(e["label"]))
        out.append("    },")
    return "\n".join(out) + "\n"


def main():
    total = 0
    for lang in LANGS:
        p = os.path.join(JS, "kb-i18n-%s.js" % lang)
        if not os.path.exists(p):
            print("  [X] 缺文件: " + p)
            return 1
        with io.open(p, "r", encoding="utf-8") as f:
            s = f.read()
        if "preset_sysu_reg" in s:
            print("  [跳过] kb-i18n-%s.js 已含校本预设" % lang)
            continue
        m = re.search(r"\n  matter: \{\n", s)
        if not m:
            print("  [X] kb-i18n-%s.js 找不到 matter 段" % lang)
            return 1
        s = s[:m.end()] + block_for(lang) + s[m.end():]
        with io.open(p, "w", encoding="utf-8") as f:
            f.write(s)
        n = block_for(lang).count(": {")
        total += 1
        print("  [OK] kb-i18n-%-3s.js 注入 5 条预设（阿/俄/西/法/越/泰/缅/马 之一）" % lang)

    print("\n共写入 %d 个语言包" % total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
