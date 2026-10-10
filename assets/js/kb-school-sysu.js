/* =========================================================================
   试点预置校本库 · 中山大学（示例）
   -------------------------------------------------------------------------
   数据来源：中山大学外国留学生办公室官网 iso.sysu.edu.cn 公开信息（2026 检索核验）。
   每条均为 S3 级"待属地复核"示例：以学校最新公布为准，机构端可一键删除/修改。
   机构端一旦通过「AI 提炼导入」保存自有数据，本条自动让位（localStorage 优先）。

   多语约定（与 kb-i18n.js 一致）：
     title_en / summary_en / label_en / channel_en / risk_en 为英文回退字段。
     KB.L(obj, field) 取值顺序：当前语种 → 英文 → 中文。
     非中文语种若缺本语种译文，回退英文；补齐 _en 即可避免中文暴露。
     （八语种明细译文由 kb-i18n-*.js 覆盖，校本预设暂以英文回退）
   ========================================================================= */
window.SYSU_PRESET_KB = [
  {
    id: "preset_sysu_reg", _local: true, _preset: true, stage: "arrival", order: 1, pri: "P0",
    title: "中山大学报到注册（校本）",
    title_en: "SYSU Enrolment & Registration (School)",
    summary: "被录取学生须按《录取通知书》上要求的报到日期和报到地点来校办理报到、注册手续，不接受提前报到；请携带录取通知书、护照原件及 JW201/JW202 表，报到后领取学生证与校园卡。",
    summary_en: "Admitted students must register in person at the date and campus specified in the Admission Letter; early arrival is not accepted. Bring the admission letter, original passport and JW201/JW202 form, and collect your student card after enrolment.",
    deadline: { kind: "none", from: "none", label: "以录取通知书指定日期为准", label_en: "Per the date stated in your Admission Letter" },
    docs: [],
    channel: "中山大学外国留学生办公室（校本示例）",
    channel_en: "SYSU International Students Office (school sample)",
    risk: "示例数据，以学校最新公布为准；详情见官网 iso.sysu.edu.cn",
    risk_en: "Sample data. Refer to the university's latest official notice; see iso.sysu.edu.cn"
  },
  {
    id: "preset_sysu_res", _local: true, _preset: true, stage: "study", order: 2, pri: "P1",
    title: "签证转居留许可（校本时限）",
    title_en: "Convert X1 Visa to Residence Permit (School)",
    summary: "持 X1 学习签证入境后，须在入境之日起 30 天内，凭录取通知书与 JW201/JW202 表到校办理报到注册，并前往出入境管理部门将 X1 签证转为学习类居留许可。",
    summary_en: "After entering with an X1 study visa, complete registration at SYSU and convert the X1 visa into a student residence permit at the exit-entry administration within 30 days of entry.",
    deadline: { kind: "none", from: "none", label: "入境后 30 天内", label_en: "Within 30 days of entry" },
    docs: [],
    channel: "中山大学外国留学生办公室（校本示例）",
    channel_en: "SYSU International Students Office (school sample)",
    risk: "示例数据，以学校最新公布为准；详情见官网 iso.sysu.edu.cn",
    risk_en: "Sample data. Refer to the university's latest official notice; see iso.sysu.edu.cn"
  },
  {
    id: "preset_sysu_pay", _local: true, _preset: true, stage: "arrival", order: 3, pri: "P1",
    title: "学费与住宿缴费（校本渠道）",
    title_en: "Tuition & Dormitory Payment (School)",
    summary: "学费与住宿费通过“中山大学缴费平台”在线缴纳，支持支付宝、微信、银联在线及 VISA / MasterCard / JCB / American Express 国际银行卡；住宿费实行“先缴费、后入住”。",
    summary_en: "Pay tuition and dormitory fees online via the SYSU Payment Platform, supporting Alipay, WeChat, UnionPay and international cards (VISA / MasterCard / JCB / AMEX). Dormitory entry requires payment in advance.",
    deadline: { kind: "none", from: "none", label: "按缴费平台通知时间", label_en: "Per the Payment Platform's announced schedule" },
    docs: [],
    channel: "中山大学外国留学生办公室（校本示例）",
    channel_en: "SYSU International Students Office (school sample)",
    risk: "示例数据，以学校最新公布为准；详情见官网 iso.sysu.edu.cn",
    risk_en: "Sample data. Refer to the university's latest official notice; see iso.sysu.edu.cn"
  },
  {
    id: "preset_sysu_contact", _local: true, _preset: true, stage: "pre", order: 4, pri: "P2",
    title: "中山大学官方联系渠道（校本）",
    title_en: "SYSU Official Contacts (School)",
    summary: "招生与事务信息：iso.sysu.edu.cn；网上申请报名：apply.sysu.edu.cn；咨询邮箱 admissions@mail.sysu.edu.cn；招生咨询电话 0086（20）84110819。",
    summary_en: "Programme & affairs: iso.sysu.edu.cn; online application: apply.sysu.edu.cn; email: admissions@mail.sysu.edu.cn; admission hotline: +86 (20) 84110819.",
    deadline: { kind: "none", from: "none", label: "" },
    docs: [],
    channel: "中山大学外国留学生办公室（校本示例）",
    channel_en: "SYSU International Students Office (school sample)",
    risk: "示例数据，以学校最新公布为准",
    risk_en: "Sample data. Refer to the university's latest official notice."
  },
  {
    id: "preset_sysu_guide", _local: true, _preset: true, stage: "pre", order: 5, pri: "P2",
    title: "官方入学指南（校本材料）",
    title_en: "Official Registration Guides (School)",
    summary: "官网帮助中心提供《2026 年国际学生新生入学指南》《2026 年国际新生报到前指引》等官方材料，涵盖报到、签证、住宿、缴费与体检等全流程说明，建议行前通读。",
    summary_en: "The official help centre publishes the Registration Guide for New International Students 2026 and the Pre-arrival Guide, covering enrolment, visa, dormitory, payment and health check. Read them before departure.",
    deadline: { kind: "none", from: "none", label: "" },
    docs: [],
    channel: "中山大学外国留学生办公室（校本示例）",
    channel_en: "SYSU International Students Office (school sample)",
    risk: "示例数据，以学校最新公布为准；详见 iso.sysu.edu.cn/cn/bz",
    risk_en: "Sample data. Refer to the university's latest official notice; see iso.sysu.edu.cn/cn/bz"
  }
];

/* -------------------------------------------------------------------------
   让八语种内容包覆盖到本文件。
   原因：kb-i18n-*.js 的内容包在本文件之前加载，applyPack 执行时
        SYSU_PRESET_KB 尚未定义，preset_* 的译文会被静默丢弃。
        数据到位后主动重应用一次即可补齐（幂等，不会重复写入）。
   ------------------------------------------------------------------------- */
if (window.KBI18N && typeof window.KBI18N.applyAll === "function") {
  window.KBI18N.applyAll();
}
