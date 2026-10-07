/* =========================================================================
   kernel.bundle.js — 小程序同源内核（自动生成，请勿手改）
   ---------------------------------------------------------------------------
   本文件由 build_bundle.py 从 08_小程序/utils/ 机械生成。
   四个模块的内容与小程序端**逐字节一致**（MD5 见 kernel.manifest.json），
   仅由CommonJS 包装为浏览器可加载形式，业务逻辑零改动。

   这是「小程序同源网页版」的硬证据：两端跑的是同一份知识库、
   同一套Agent 规则引擎、同一份多语种词表。
   ========================================================================= */
(function (global) {
  "use strict";

  var __f = {};      /* 工厂表 */
  var __c = {};      /* 缓存表 */
  var __order = [];  /* 加载顺序 */

  function __def(name, factory) { __f[name] = factory; __order.push(name); }

  function __norm(p) { return String(p).split("/").pop().replace(/\.js$/, ""); }

  function __require(path) {
    var k = __norm(path);
    if (__c[k]) return __c[k].exports;
    if (!__f[k]) throw new Error("[kernel] 模块未注册: " + path);
    var m = { exports: {} };
    __c[k] = m;
    __f[k](m, m.exports, __require);
    return m.exports;
  }

  /* ==== 模块 kb.js（内容与 08_小程序/utils/kb.js 逐字节相同） ==== */
  __def('kb', function (module, exports, require) {
/* 由网页端 assets/js/kb.js 机械移植：window.KB -> module.exports。
   知识库唯一真源，小程序与网页端共用，逻辑零改动。 */
/* =========================================================================
   来华交流全程助手 · 知识层 KB v2.0
   ---------------------------------------------------------------------------
   入库规则（与产品内"来源锚定"机制一致）：
     1) 每条事项必须携带 source（机构名 + 官方渠道入口 + 证据等级 + 核对日期）
     2) 证据等级 S1＝法规/政府一手；S2＝权威媒体/官方发布转载；S3＝公开办事指引（需属地复核）
     3) 无来源不入库；S3 级事项在产品内一律显示"待属地复核"提示
     4) 内容不构成法律意见，仅作信息聚合与流程引导
   ========================================================================= */

module.exports = (function () {
  "use strict";

  var META = {
    version: "2.0.0",
    updated: "2026-09-26",
    owner: "来华交流全程助手 · 知识运营（机构端可维护）",
    disclaimer:
      "本助手提供信息聚合与流程引导，不构成法律意见。具体办理要求以属地主管部门与所在学校最新公布为准。所有 AI 生成内容均标注待人工复核。",
    channels: [
      { name: "国家移民管理局政务服务平台", url: "https://s.nia.gov.cn/", note: "住宿登记、签证证件、停留居留业务线上入口" },
      { name: "国家移民管理局 12367 服务平台", url: "https://www.nia.gov.cn/", note: "出入境政策咨询（电话 12367）" },
      { name: "国家留学网（国家留学基金管理委员会）", url: "https://www.csc.edu.cn/", note: "中国政府奖学金、来华留学项目管理" },
      { name: "中华人民共和国教育部", url: "http://www.moe.gov.cn/", note: "来华留学政策与规范" },
      { name: "中国人大网 · 法律法规数据库", url: "http://www.npc.gov.cn/", note: "《出境入境管理法》等法律原文" },
      { name: "中国政府网", url: "https://www.gov.cn/", note: "国务院政策文件与便民服务" }
    ]
  };

  /* ---------- 证据来源 ---------- */
  var SRC = {
    law_exit: { name: "《中华人民共和国出境入境管理法》", org: "全国人大常委会", url: "http://www.npc.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_platform: { name: "国家移民管理局政务服务平台 · 外国人服务", org: "国家移民管理局", url: "https://s.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_12367: { name: "国家移民管理局 12367 服务平台", org: "国家移民管理局", url: "https://www.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_visa: { name: "外国人签证证件办理指南", org: "国家移民管理局", url: "https://s.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_240: { name: "240 小时过境免签政策", org: "国家移民管理局", url: "https://www.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    csc: { name: "国家留学网 · 来华留学", org: "国家留学基金管理委员会", url: "https://www.csc.edu.cn/", level: "S1", checked: "2026-09-26" },
    moe: { name: "教育部 · 来华留学相关规范", org: "教育部", url: "http://www.moe.gov.cn/", level: "S1", checked: "2026-09-26" },
    school: { name: "所在高校国际学生办公室办事指引", org: "所在高校", url: "", level: "S3", checked: "2026-09-26", note: "由机构端在「知识库维护」中录入本校口径" },
    custom: { name: "海关总署 · 进出境旅客通关指南", org: "海关总署", url: "https://www.customs.gov.cn/", level: "S1", checked: "2026-09-26" },
    bank: { name: "中国人民银行 · 境外来华人员支付服务指引", org: "中国人民银行", url: "https://www.pbc.gov.cn/", level: "S1", checked: "2026-09-26" }
  };

  /* ---------- 办理事项（全周期） ---------- */
  /* deadline.kind: hours | days | fixed；from: arrival | enroll | expire | none */
  var MATTERS = [
    /* ===== 阶段一：来华前 ===== */
    {
      id: "pre_visa", stage: "pre", order: 1, pri: "P0",
      title: "判定并申请来华签证类型",
      title_en: "Determine and apply for the correct China visa type",
      summary: "按来华事由与停留时长判定签证类别：长期学习（180 天以上）通常为 X1，短期学习（180 天以内）通常为 X2；访问交流 F、商务 M、旅游 L、工作 Z、过境免签等各有适用边界。签证类别与后续居留许可直接挂钩，选错会连带影响入学注册与居留办理。",
      summary_en: "Visa category follows your purpose and length of stay: X1 for long-term study (over 180 days), X2 for short-term study, plus F/M/L/Z and visa-free transit options. The category determines your later residence permit, so choose carefully.",
      deadline: { kind: "none", from: "none", label: "建议出发前 60–90 天启动" },
      docs: ["有效护照（剩余有效期建议 6 个月以上，含空白签证页）", "院校录取通知书 / 邀请函", "JW201 或 JW202 表（学习类，由学校提供）", "签证申请表与照片", "按类别要求的资金、学历、体检等附加材料"],
      channel: "向中国驻当地使领馆或签证申请服务中心递交；部分类别需先由学校完成备案。",
      risk: "签证类别与实际事由不符，可能在入境查验或后续居留许可环节被要求补正甚至不予办理。",
      source: ["nia_visa", "csc"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "pre_physical", stage: "pre", order: 2, pri: "P1",
      title: "体检与《外国人体格检查记录》",
      title_en: "Medical examination and Foreigner Physical Examination Record",
      summary: "学习类长期签证通常需提交《外国人体格检查记录》。建议在本国正规医疗机构完成检查并按表式填写、附照片与医师签章；记录自签发之日起有有效期限制，过早检查可能失效。",
      summary_en: "Long-term study visas normally require the Foreigner Physical Examination Record, completed at a licensed clinic in your home country, signed and stamped. The record has a validity window, so do not examine too early.",
      deadline: { kind: "none", from: "none", label: "签证申请前完成，注意有效期" },
      docs: ["《外国人体格检查记录》原件（含照片、医师签章）", "相关化验与检查报告", "既往病史与用药说明（如有）"],
      channel: "本国指定/正规医疗机构；入境后可能需在中国境内指定机构复检或核验。",
      risk: "记录缺项、缺章或超期，会导致签证或居留许可办理被退回。",
      source: ["nia_visa", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "pre_insurance", stage: "pre", order: 3, pri: "P1",
      title: "落实来华期间的医疗保障",
      title_en: "Arrange medical cover for your stay in China",
      summary: "多数院校要求国际学生在读期间持有有效医疗保障（校方统一投保或自行购买符合要求的商业保险）。务必确认保障范围覆盖住院、门诊与意外，并保留电子保单以便到校登记。",
      summary_en: "Most universities require valid medical cover during enrolment, either school-arranged or a compliant private policy. Confirm it covers inpatient, outpatient and accidents, and keep the policy for on-campus registration.",
      deadline: { kind: "none", from: "none", label: "报到注册前完成" },
      docs: ["保险单/电子保单（含被保险人、保障期间、保障范围）", "理赔与紧急救援联系方式"],
      channel: "学校统一投保渠道，或自行购买后向国际学生办公室备案。",
      risk: "无有效保障可能无法完成注册；就诊时自费负担显著上升。",
      source: ["school", "moe"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "pre_money", stage: "pre", order: 4, pri: "P1",
      title: "支付准备：境外卡绑定与应急现金",
      title_en: "Payment readiness: link an overseas card and keep emergency cash",
      summary: "中国日常消费高度依赖扫码支付，而境内移动支付体系历史上默认用户持有中国手机号与银行账户。当前便利化措施已支持境外发行的信用卡绑定主流支付工具、国际钱包直接扫境内商户码；但绑卡成功率与场景覆盖因发卡行而异，建议提前测试并准备少量现金应急。",
      summary_en: "Daily spending in China is largely QR-based. Facilitation measures now let overseas-issued cards be linked to major payment apps and international wallets scan domestic merchant codes, yet success rates vary by issuer. Test before departure and keep some cash.",
      deadline: { kind: "none", from: "none", label: "出发前完成测试" },
      docs: ["境外银行卡（建议 Visa / Mastercard / JCB / 银联等主流卡组织）", "护照（实名验证需要）", "少量人民币现金（应急）"],
      channel: "主流移动支付工具的国际版入口；或使用境外钱包直接扫境内商户码。",
      risk: "到店才发现无法支付，影响交通、餐饮与住宿；建议落地前完成一次小额测试。",
      source: ["bank"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "pre_luggage", stage: "pre", order: 5, pri: "P2",
      title: "行李与入境合规物品自查",
      title_en: "Luggage and customs compliance self-check",
      summary: "出发前核对限制/禁止进境物品（如部分药品、生鲜食品、种子、超额现金与贵重物品申报要求）。携带处方药应备英文处方与药品说明；超量或违禁将被扣留并可能处罚。",
      summary_en: "Check restricted and prohibited items before departure, including certain medicines, fresh food, seeds, and declaration rules for large amounts of cash or valuables. Carry an English prescription for any medication.",
      deadline: { kind: "none", from: "none", label: "打包阶段自查" },
      docs: ["英文处方/病历（如携带处方药）", "超额外币或贵重物品的申报材料"],
      channel: "以海关总署与目的地口岸公布的最新通关指南为准。",
      risk: "违禁物品被扣留、罚款，严重时影响入境。",
      source: ["custom"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },

    /* ===== 阶段二：抵达初期 ===== */
    {
      id: "arr_reg24", stage: "arrival", order: 1, pri: "P0",
      title: "入住后 24 小时内完成住宿登记",
      title_en: "Register your accommodation within 24 hours",
      summary: "外国人在旅馆以外的其他住所居住或住宿的，应当在入住后 24 小时内由本人或者留宿人向居住地公安机关办理登记（在居民家中住宿，城镇 24 小时内、农村 72 小时内）。住旅馆的由旅馆前台完成报备。自 2026 年 9 月 21 日起，非旅馆住宿登记已在全国范围内开通线上办理，与线下窗口具有同等效力。",
      summary_en: "Foreigners staying outside hotels must register with the local public security authority within 24 hours of moving in (72 hours in rural host homes). Hotels handle this at the front desk. Since 21 Sep 2026, online registration is available nationwide with equal legal effect.",
      deadline: { kind: "hours", from: "arrival", value: 24, label: "入住后 24 小时内（农村居民家中 72 小时）" },
      docs: ["本人有效护照与签证/停留证件", "住宿地址与房屋权属或租赁信息", "留宿人身份证件（由留宿人代办时）"],
      channel: "国家移民管理局政务服务平台网站 /「移民局 12367」App / 微信或支付宝小程序 →「外国人服务」→ 住宿登记；或居住地公安派出所窗口。",
      risk: "超期未登记将被处以警告，可并处二千元以下罚款；容留、藏匿非法入境或非法居留外国人的，将面临罚款甚至拘留。",
      source: ["law_exit", "nia_platform"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_school", stage: "arrival", order: 2, pri: "P0",
      title: "到校报到注册",
      title_en: "Report and register at your university",
      summary: "在院校规定时间内到国际学生办公室完成报到注册，提交护照、签证、体检记录、保险、照片等材料，领取学生证与校园卡。注册状态直接关系到后续居留许可办理与在校权益。",
      summary_en: "Report to the International Student Office within the deadline, submitting passport, visa, medical record, insurance and photos, then collect your student card. Registration status affects your residence permit application and campus rights.",
      deadline: { kind: "fixed", from: "enroll", label: "按录取通知书与学校规定的报到期" },
      docs: ["护照、签证与入境章页复印件", "录取通知书 / JW201 或 JW202 表", "体检记录", "保险凭证", "证件照片（按学校要求）"],
      channel: "所在高校国际学生办公室 / 留学生事务部门。",
      risk: "逾期未注册可能被视为自动放弃入学资格。",
      source: ["school", "moe"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_residence", stage: "arrival", order: 3, pri: "P0",
      title: "申请外国人居留许可",
      title_en: "Apply for a foreigner residence permit",
      summary: "持 X1 等长期学习签证入境者，通常需在入境后 30 日内向公安机关出入境管理机构申请居留许可。居留许可是在华合法停留与多次出入境的凭证，逾期未办属非法居留。",
      summary_en: "Holders of X1 and similar long-term study visas generally must apply for a residence permit within 30 days of entry. The permit legitimises your stay and re-entry; failure to apply leads to illegal residence.",
      deadline: { kind: "days", from: "arrival", value: 30, label: "入境后 30 日内" },
      docs: ["护照与签证", "学校出具的申请函/在学证明", "JW201 或 JW202 表", "《外国人体格检查记录》或境内体检结果", "住宿登记凭证", "照片与申请表"],
      channel: "停留地公安机关出入境管理机构；部分城市支持线上预约与进度查询。",
      risk: "逾期办理构成非法居留，可能被处以罚款、限期离境等处罚，并影响后续签证申请。",
      source: ["nia_visa", "law_exit", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "arr_physical_cn", stage: "arrival", order: 4, pri: "P1",
      title: "境内体检核验或复检",
      title_en: "Domestic medical verification or re-examination",
      summary: "部分申请人需在境内指定机构完成体检或对境外体检记录进行核验，取得《境外人员体格检查记录验证证明》。建议到校后尽快确认本校与出入境部门的具体要求与指定机构。",
      summary_en: "Some applicants must complete a domestic examination or have their overseas record verified. Confirm the designated institution and requirements with your school and the entry-exit authority soon after arrival.",
      deadline: { kind: "days", from: "arrival", value: 30, label: "通常与居留许可办理同期" },
      docs: ["境外体检记录原件", "护照", "照片", "学校或出入境部门要求的表格"],
      channel: "出入境检验检疫指定医疗机构 / 学校指定机构。",
      risk: "体检缺项会导致居留许可申请被退回，形成时限连锁风险。",
      source: ["school", "nia_visa"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "arr_bank", stage: "arrival", order: 5, pri: "P1",
      title: "银行开户与支付工具完善",
      title_en: "Open a bank account and complete payment setup",
      summary: "在学期间如有汇款、奖学金发放或长期消费需求，可凭护照、居留许可（或学校证明）到银行网点开立账户。开户后即可绑定主流移动支付工具，日常支付更顺畅。",
      summary_en: "For remittances, scholarship payments or long-term spending, open a bank account with your passport and residence permit. Linking it to major payment apps makes daily payment smoother.",
      deadline: { kind: "days", from: "enroll", value: 60, label: "建议入学后 2 个月内完成" },
      docs: ["护照与居留许可", "学校在学证明或录取材料", "手机号码（实名）"],
      channel: "各商业银行网点；建议选择校园周边网点，办理经验更成熟。",
      risk: "无本地账户时，跨境汇款与部分缴费场景会受限。",
      source: ["bank", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "arr_sim", stage: "arrival", order: 6, pri: "P1",
      title: "手机号码实名办理",
      title_en: "Get a mobile number with real-name registration",
      summary: "中国手机号是注册支付工具、预约服务、接收学校通知的基础。可凭护照到运营商营业厅办理；短期停留也可评估 eSIM 或国际漫游方案。",
      summary_en: "A Chinese mobile number underpins payment apps, bookings and school notifications. Apply at a carrier store with your passport, or evaluate eSIM/roaming for short stays.",
      deadline: { kind: "days", from: "arrival", value: 7, label: "建议抵达后 1 周内" },
      docs: ["护照", "住宿登记凭证（部分网点需要）"],
      channel: "三大运营商营业厅；校园内通常设有服务点。",
      risk: "无本地号码将显著限制线上服务使用。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_campus", stage: "arrival", order: 7, pri: "P2",
      title: "校园卡、网络与图书馆开通",
      title_en: "Activate campus card, network and library access",
      summary: "完成校园卡领取与充值、校园网络账号开通、图书馆权限激活，是使用食堂、宿舍门禁、实验楼与线上学习平台的前提。",
      summary_en: "Collecting and topping up your campus card and activating network and library accounts are prerequisites for canteens, dorm access, labs and online learning platforms.",
      deadline: { kind: "days", from: "enroll", value: 14, label: "报到后 2 周内" },
      docs: ["学生证或录取材料", "证件照片", "手机号码"],
      channel: "学校一卡通中心 / 信息化部门 / 图书馆。",
      risk: "权限未开通将影响选课、考试与宿舍生活。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_safety", stage: "arrival", order: 8, pri: "P0",
      title: "紧急联系方式与安全须知",
      title_en: "Emergency contacts and safety essentials",
      summary: "保存关键号码：报警 110、急救 120、火警 119、交通事故 122、出入境政策咨询 12367。同时保存学校国际学生办公室、宿舍管理员与本国驻华使领馆联系方式。",
      summary_en: "Save key numbers: police 110, ambulance 120, fire 119, traffic 122, entry-exit policy 12367, plus your school's international office, dorm staff and your embassy or consulate.",
      deadline: { kind: "hours", from: "arrival", value: 24, label: "抵达当日即完成" },
      docs: ["护照与签证复印件（与原件分开存放）", "紧急联系人清单", "本国驻华使领馆联系方式"],
      channel: "学校安全教育与新生指南；移民局 12367 服务平台。",
      risk: "紧急情况下无法快速求助，或证件遗失后难以证明身份。",
      source: ["nia_12367", "school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },

    /* ===== 阶段三：在学日常 ===== */
    {
      id: "stu_renew", stage: "study", order: 1, pri: "P0",
      title: "居留许可延期（到期前 30 天）",
      title_en: "Extend your residence permit (30 days before expiry)",
      summary: "居留许可有效期通常与学习期限一致。需延长学习期限的，应在居留许可到期前向出入境管理机构申请延期。建议在到期前 30 天启动，避免材料补正导致超期。",
      summary_en: "Residence permits usually match your study period. Apply for an extension before expiry, ideally starting 30 days ahead, so that supplementary documents do not push you past the deadline.",
      deadline: { kind: "days", from: "expire", value: -30, label: "到期前 30 天启动（务必早于到期日）" },
      docs: ["护照与居留许可", "学校延期证明/在学证明", "住宿登记凭证", "照片与申请表"],
      channel: "停留地公安机关出入境管理机构；学校国际学生办公室通常可提供集中办理协助。",
      risk: "到期后未获延期即构成非法居留，影响学业与后续出入境记录。",
      source: ["nia_visa", "law_exit", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "stu_change", stage: "study", order: 2, pri: "P1",
      title: "信息变更登记（住址 / 学校 / 护照）",
      title_en: "Register changes of address, school or passport",
      summary: "住址、就读院校、护照信息发生变化时，需按规定办理变更或重新登记；换发新护照后应及时更新签证证件与住宿登记信息，避免证件与登记信息不一致。",
      summary_en: "When your address, institution or passport changes, register the change. After passport renewal, update both your visa/residence documents and your accommodation registration.",
      deadline: { kind: "days", from: "none", value: 10, label: "变更后 10 日内（以属地要求为准）" },
      docs: ["新护照或变更证明", "原证件与住宿登记凭证", "学校出具的相关说明"],
      channel: "出入境管理机构与居住地派出所；学校国际学生办公室协助。",
      risk: "证件与登记信息不一致，会在查验、办理银行业务与出境时产生障碍。",
      source: ["nia_visa", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "stu_medical", stage: "study", order: 3, pri: "P1",
      title: "就医流程与医疗费用结算",
      title_en: "Seeking medical care and settling costs",
      summary: "校内就医一般先到校医院或指定医疗机构，再按需转诊；持保险就医需保留发票、病历与诊断证明用于理赔。紧急情况直接拨打 120。建议提前了解学校周边国际门诊或外语服务能力较强的医院。",
      summary_en: "Start with the campus clinic or a designated hospital and refer onward as needed. Keep invoices and medical records for insurance claims. Call 120 in emergencies. Identify hospitals with international or multilingual services in advance.",
      deadline: { kind: "none", from: "none", label: "按需；建议入学首月完成信息储备" },
      docs: ["护照/居留许可", "学生证与保险凭证", "发票、病历与诊断证明（理赔用）"],
      channel: "校医院 / 指定医院 / 国际门诊；保险理赔由承保机构受理。",
      risk: "未保留理赔材料将无法报销；语言沟通不畅可能影响诊疗判断。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_travel", stage: "study", order: 4, pri: "P2",
      title: "境内出行与实名购票",
      title_en: "Domestic travel and real-name ticketing",
      summary: "火车票、机票、长途客运均实行实名制，通常可使用护照购票与进站；部分场景支持线上购票后凭证件取票或刷证进站。出行期间仍需遵守住宿登记要求，住旅馆由旅馆报备。",
      summary_en: "Rail, air and long-distance coach tickets are real-name based; a passport generally works. Accommodation registration still applies while travelling, handled by hotels where you stay.",
      deadline: { kind: "none", from: "none", label: "按需" },
      docs: ["护照", "学生证（部分优惠适用）", "行程与住宿信息"],
      channel: "铁路 12306、航空公司与客运官方渠道；注意使用与证件一致的姓名。",
      risk: "姓名拼写与证件不一致会导致无法取票进站。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_intern", stage: "study", order: 5, pri: "P0",
      title: "勤工助学与实习的合规边界",
      title_en: "Compliance boundaries for part-time work and internships",
      summary: "外国留学生在华勤工助学、校外实习或兼职，通常需符合国家与学校规定并办理相应手续（如学校同意函、加注实习信息的居留证件等）。未获许可从事有偿工作可能构成非法就业。",
      summary_en: "Part-time work or off-campus internships by international students normally require compliance with national and school rules and relevant procedures, such as school approval letters or an internship endorsement on your residence permit. Unauthorised paid work may constitute illegal employment.",
      deadline: { kind: "none", from: "none", label: "实习/兼职开始前完成" },
      docs: ["学校同意函或实习证明", "居留许可加注材料（按属地要求）", "实习单位接收函"],
      channel: "学校国际学生办公室与就业指导部门；出入境管理机构办理加注。",
      risk: "非法就业可能被处罚并影响签证与学业记录。",
      source: ["moe", "nia_visa", "school"], applies: { purposes: ["degree", "exchange"], durations: ["lt180"] }
    },
    {
      id: "stu_faith", stage: "study", order: 6, pri: "P1",
      title: "宗教信仰活动的合法渠道指引",
      title_en: "Guidance on lawful religious practice",
      summary: "在中国境内的宗教活动应在依法登记的宗教活动场所内、按相关法律法规进行。建议通过学校国际学生办公室了解所在城市依法登记的场所信息、开放时间与礼仪要求。",
      summary_en: "Religious activities in China should take place at lawfully registered venues in accordance with relevant laws and regulations. Ask the international student office about registered venues, opening hours and etiquette.",
      deadline: { kind: "none", from: "none", label: "按需；入学首月了解" },
      docs: ["个人身份证明（部分场所登记需要）"],
      channel: "依法登记的宗教活动场所；学校国际学生办公室提供信息指引。",
      risk: "参与未依法登记的聚集活动可能带来法律风险。",
      source: ["moe", "school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_diet", stage: "study", order: 7, pri: "P2",
      title: "饮食与特殊需求适配",
      title_en: "Food and dietary adaptation",
      summary: "清真、素食、无麸质、过敏原规避等需求可通过三类渠道解决：校内食堂特定窗口、校园周边民族/国际餐厅、生鲜自炊。建议把忌口与过敏原用中文写成卡片随身携带，点餐时出示。",
      summary_en: "Halal, vegetarian, gluten-free and allergen needs can be met via dedicated canteen counters, nearby ethnic or international restaurants, or self-catering. Carry a Chinese card listing your restrictions.",
      deadline: { kind: "none", from: "none", label: "抵达后 1 周内摸清" },
      docs: ["忌口与过敏原中文卡片（本助手可生成）", "常用药清单（英文）"],
      channel: "校内食堂 / 周边餐饮 / 生鲜平台与自炊。",
      risk: "过敏原误食可能造成严重健康风险。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_psych", stage: "study", order: 8, pri: "P1",
      title: "心理支持与跨文化适应",
      title_en: "Psychological support and cross-cultural adjustment",
      summary: "语言障碍、气候差异、饮食不适与社交孤立是常见适应压力源。多数高校设有心理咨询中心，部分提供外语咨询；也可通过同伴互助、导师沟通与运动社交缓解。出现持续情绪低落应尽早求助。",
      summary_en: "Language barriers, climate, food and social isolation are common stressors. Most universities provide counselling, sometimes in foreign languages; peer support, mentor talks and sports also help. Seek help early if low mood persists.",
      deadline: { kind: "none", from: "none", label: "按需" },
      docs: [],
      channel: "学校心理咨询中心 / 国际学生办公室 / 校医院转介。",
      risk: "长期忽视可能演变为严重心理危机。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_lostpass", stage: "study", order: 9, pri: "P0",
      title: "护照遗失或被盗的应急处置",
      title_en: "Emergency steps when your passport is lost or stolen",
      summary: "三步走：一是尽快到当地公安机关报案并取得报案证明；二是联系本国驻华使领馆申请补发或办理旅行证件；三是持新证件到出入境管理机构办理签证证件补办或变更，并同步更新住宿登记信息。",
      summary_en: "Three steps: report to the local police and obtain a report; contact your embassy or consulate for a replacement or travel document; then update your visa/residence documents at the entry-exit authority and refresh your accommodation registration.",
      deadline: { kind: "hours", from: "none", value: 24, label: "发现后立即报案" },
      docs: ["报案证明", "护照复印件与签证页复印件（务必提前留存）", "照片与身份材料"],
      channel: "公安派出所 → 本国驻华使领馆 → 公安机关出入境管理机构。",
      risk: "未及时补办将导致证件与在留资格不匹配，影响出境。",
      source: ["nia_12367", "school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },

    /* ===== 阶段四：离境前后 ===== */
    {
      id: "exi_prepare", stage: "exit", order: 1, pri: "P1",
      title: "离校手续与退宿退费清单",
      title_en: "Departure checklist: clearance, dorm check-out and refunds",
      summary: "离校前通常需完成：图书馆清借、宿舍退宿与押金结算、校园卡余额退还、实验室与设备归还、财务结算、档案与证明领取。建议提前 3–4 周启动，避免因个别环节卡住影响出境。",
      summary_en: "Before leaving: clear library loans, check out of the dorm and settle the deposit, refund the campus card balance, return lab equipment, settle finances and collect certificates. Start three to four weeks ahead.",
      deadline: { kind: "days", from: "expire", value: -21, label: "预计离校前 3–4 周" },
      docs: ["学生证与校园卡", "宿舍押金凭证", "图书借阅与设备清单"],
      channel: "学校各职能部门（图书馆、后勤、财务、学院）。",
      risk: "未清缴费用或未归还物品可能被扣留证书。",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "exi_cert", stage: "exit", order: 2, pri: "P0",
      title: "学历学位证书、成绩单与学历认证",
      title_en: "Degree certificate, transcripts and credential recognition",
      summary: "领取毕业证书、学位证书与官方成绩单，并按需办理公证或学历学位认证。若计划在中国就业或继续升学，建议在离境前完成材料留存与认证咨询，避免跨国补办成本。",
      summary_en: "Collect your diploma, degree certificate and official transcripts, and arrange notarisation or credential recognition as needed. If you plan to work or study in China, sort this out before departure.",
      deadline: { kind: "days", from: "expire", value: -14, label: "离境前完成领取" },
      docs: ["护照与学生证", "离校手续完成证明", "照片（证书与公证用）"],
      channel: "学校教务/研究生院与留学生管理部门；认证按相关机构流程办理。",
      risk: "离境后补办需跨国邮寄与委托，成本高、周期长。",
      source: ["moe", "school"], applies: { purposes: ["degree", "exchange"], durations: ["lt180"] }
    },
    {
      id: "exi_bank", stage: "exit", order: 3, pri: "P2",
      title: "银行账户与手机号的处理",
      title_en: "Closing or retaining bank accounts and phone numbers",
      summary: "离境前决定账户与号码的保留或注销：注销需结清余额与绑定业务；保留则需注意后续证件过期导致的账户功能受限。建议提前 1–2 周办理。",
      summary_en: "Decide whether to keep or close your account and phone number. Closing requires clearing balances and linked services; keeping may limit functionality once your documents expire. Handle it one to two weeks ahead.",
      deadline: { kind: "days", from: "expire", value: -10, label: "离境前 1–2 周" },
      docs: ["护照", "银行卡", "手机号与实名信息"],
      channel: "银行网点与运营商营业厅。",
      risk: "遗留欠费或未解绑业务可能影响后续来华。",
      source: ["bank", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "exi_visa", stage: "exit", order: 4, pri: "P0",
      title: "签证/居留许可状态与出境核验",
      title_en: "Visa or residence status and exit verification",
      summary: "离境前核对护照与居留许可有效期，确认无逾期停留记录；如居留许可仍在有效期但需注销（如提前结束学业），应按属地要求办理。出境时配合边检查验。",
      summary_en: "Check passport and residence permit validity and confirm no overstay before leaving. If an early termination requires cancellation, follow local requirements. Cooperate with border inspection on exit.",
      deadline: { kind: "days", from: "expire", value: -7, label: "离境前 1 周核对" },
      docs: ["护照与居留许可", "离校证明（如被要求）"],
      channel: "公安机关出入境管理机构；口岸边检机关。",
      risk: "逾期停留记录会影响未来签证与入境。",
      source: ["law_exit", "nia_visa"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "exi_return", stage: "exit", order: 5, pri: "P2",
      title: "再次来华（升学/就业）与校友联系",
      title_en: "Returning to China for further study or work, and alumni ties",
      summary: "计划再次来华升学或就业的，应在离境前了解新签证类别（如学习 X1、工作 Z）的申请条件与时间窗口，并保留在华期间的学历、成绩与实习证明。同时可登记校友信息以获取后续机会。",
      summary_en: "If you plan to return for further study or work, learn the requirements and timing for the relevant visa category (X1 for study, Z for work) and keep your certificates and internship records. Register with the alumni network for future opportunities.",
      deadline: { kind: "none", from: "none", label: "离境前规划" },
      docs: ["学历学位证书与成绩单", "实习/工作证明", "推荐信与个人陈述材料"],
      channel: "中国驻当地使领馆；学校校友会与国际学生办公室。",
      risk: "材料留存不足会导致再次申请周期延长。",
      source: ["csc", "school"], applies: { purposes: ["degree", "exchange"], durations: ["lt180"] }
    }
  ];

  /* ---------- 办理路径判定规则 ---------- */
  var PATHS = [
    {
      id: "x1", match: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] },
      visa: "X1（长期学习）", visa_en: "X1 long-term study",
      headline: "长期学习：入境 30 日内必须完成居留许可",
      steps: ["pre_visa", "pre_physical", "pre_insurance", "arr_reg24", "arr_school", "arr_residence", "arr_physical_cn", "arr_bank", "stu_renew", "exi_prepare"],
      key_risk: "居留许可 30 日期限是整个流程中最容易踩线的一环；住宿登记凭证是居留许可的必备材料，必须先行完成。",
      source: ["nia_visa", "law_exit"]
    },
    {
      id: "x2", match: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["le180"] },
      visa: "X2（短期学习）/ F（访问交流）", visa_en: "X2 short-term study / F visit",
      headline: "短期学习：停留期与延期规则是重点",
      steps: ["pre_visa", "pre_insurance", "pre_money", "arr_reg24", "arr_school", "arr_sim", "arr_safety", "exi_visa"],
      key_risk: "短期停留一般不能直接转为长期居留；如需延长学习期限，应提前向出入境管理机构咨询是否可延期或需出境重新申请。",
      source: ["nia_visa", "school"]
    },
    {
      id: "transit", match: { purposes: ["transit"], durations: ["le240h"] },
      visa: "240 小时过境免签", visa_en: "240-hour visa-free transit",
      headline: "过境免签：24 小时内登记 + 活动范围限制",
      steps: ["arr_reg24", "arr_safety", "stu_travel"],
      key_risk: "过境免签禁止工作、学习、新闻采访等需事先批准的活动，且需在允许停留区域内活动；入境后 24 小时内须办理住宿登记。",
      source: ["nia_240", "law_exit"]
    },
    {
      id: "other", match: {}, visa: "按实际事由判定（F / M / L / Z 等）", visa_en: "Determined by purpose (F / M / L / Z)",
      headline: "非学习类：先明确事由，再匹配签证与登记义务",
      steps: ["pre_visa", "pre_money", "arr_reg24", "arr_safety", "exi_visa"],
      key_risk: "商务 M、旅游 L、工作 Z 等类别的停留期、延期规则与登记义务各不相同，请以公安机关出入境管理机构与 12367 咨询为准。",
      source: ["nia_visa", "nia_12367"]
    }
  ];

  /* ---------- 常见问答 ---------- */
  var FAQ = [
    { q: "我住在校外公寓，住宿登记由谁办、多久内办？", a: "由本人或留宿人（房东）在入住后 24 小时内办理。自 2026 年 9 月 21 日起，非旅馆住宿登记可在国家移民管理局政务服务平台、「移民局 12367」App 或微信/支付宝小程序线上办理，与线下窗口同等效力。建议首次由房东协助办理，信息更准确。", src: ["law_exit", "nia_platform"], level: "S1" },
    { q: "住学校宿舍需要自己办住宿登记吗？", a: "住旅馆的由旅馆前台完成报备。学校宿舍的管理方式各地各校不同：部分学校统一为国际学生完成登记报备，部分要求本人配合提供材料。请以所在学校国际学生办公室的说明为准。", src: ["school", "nia_platform"], level: "S3" },
    { q: "居留许可可以在到期当天去办吗？", a: "不建议。居留许可延期应在到期前提出，且需提交学校证明、住宿登记凭证等材料，一旦需要补正就会超期。逾期即构成非法居留，可能被罚款甚至限期离境。建议在到期前 30 天启动。", src: ["nia_visa", "law_exit"], level: "S1" },
    { q: "过境免签 240 小时可以顺便上课或打工吗？", a: "不可以。240 小时过境免签允许旅游、商务、访问、探亲等活动，禁止工作、学习、新闻采访等需事先批准的活动。如需学习或工作，应申请对应类别签证。", src: ["nia_240"], level: "S1" },
    { q: "我的银行卡在商店刷不了，是卡的问题吗？", a: "更可能是支付链路问题，通常集中在注册准入、绑卡充值、商户受理、公共出行、语言服务五个环节。建议：①提前在出发前完成绑卡测试；②确认卡片为 Visa / Mastercard / JCB / 银联等主流卡组织；③随身保留少量现金应急；④如多次失败，尝试换用支持境外卡片的聚合收款通道。", src: ["bank"], level: "S3" },
    { q: "实习需要额外办手续吗？", a: "需要。外国留学生勤工助学与校外实习通常需符合国家与学校规定，可能涉及学校同意函与居留证件加注。未获许可从事有偿工作可能构成非法就业，请务必先向学校国际学生办公室确认。", src: ["moe", "nia_visa"], level: "S1" },
    { q: "护照丢了怎么办？", a: "三步走：①立即到当地公安机关报案并取得报案证明；②联系本国驻华使领馆申请补发护照或旅行证件；③持新证件到出入境管理机构办理签证证件补办或变更，并同步更新住宿登记。平时请把护照与签证页复印件分开存放。", src: ["nia_12367"], level: "S1" },
    { q: "助手给的答案可靠吗？", a: "每条答案都会标注依据来源与核对日期，并按证据等级分为 S1（法规/政府一手）、S2（权威发布）、S3（公开办事指引，需属地复核）。标为 S3 或显示「待属地复核」的事项，请以主管部门与学校最新要求为准。所有 AI 生成内容均标注「待人工复核」，并可提交给学校国际学生办公室确认。", src: ["moe"], level: "S1" }
  ];

  /* ---------- 国别与信仰适配（沟通参考层，非官方口径） ---------- */
  /* 说明：本层为跨文化沟通提示，用于减少误解，不作为宗教或法律依据。
     机构端可在「知识库维护」中按本校生源结构增删。 */
  var COUNTRY = {
    PK: { zh: "巴基斯坦", en: "Pakistan", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精；斋月期间白天禁食", fest: ["开斋节", "古尔邦节"], tips: ["问候与递物多用右手", "斋月避免在其面前进食饮水"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol; daytime fasting during Ramadan", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Use the right hand when greeting and passing items", "Avoid eating or drinking in front of someone fasting in Ramadan"], lang: "乌尔都语 / 英语" },
    IN: { zh: "印度", en: "India", faith: "印度教为主，另有伊斯兰教、锡克教", diet: "素食比例高；忌牛肉（印度教徒）、忌猪肉（穆斯林）；咖喱口味偏好", fest: ["排灯节", "洒红节"], tips: ["避免用左手递物", "饮食禁忌个体差异大，务必逐人确认"], faith_en: "Hindu majority, with Muslim and Sikh communities", diet_en: "A high proportion are vegetarian; Hindus avoid beef, Muslims avoid pork", fest_en: ["Diwali", "Holi"], tips_en: ["Avoid passing items with the left hand", "Dietary rules vary greatly - always confirm individually"], lang: "印地语 / 英语" },
    ID: { zh: "印度尼西亚", en: "Indonesia", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精", fest: ["开斋节"], tips: ["斋月注意作息调整", "祷告时间需预留空间"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol", fest_en: ["Eid al-Fitr"], tips_en: ["Allow space and time for prayer", "Note adjusted routines during Ramadan"], lang: "印尼语" },
    MY: { zh: "马来西亚", en: "Malaysia", faith: "伊斯兰教为主，多元宗教并存", diet: "清真饮食；中餐接受度高", fest: ["开斋节", "农历新年", "屠妖节"], tips: ["多语环境，中文沟通障碍较小"], faith_en: "Muslim majority in a multi-faith society", diet_en: "Halal widely available; Chinese cuisine well accepted", fest_en: ["Hari Raya", "Chinese New Year", "Deepavali"], tips_en: ["Multilingual environment - Chinese communication is relatively easy"], lang: "马来语 / 英语 / 中文" },
    BD: { zh: "孟加拉国", en: "Bangladesh", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精；偏好米饭与鱼类", fest: ["开斋节", "古尔邦节"], tips: ["斋月注意用餐安排"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol; rice and fish are staples", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Adjust meal arrangements during Ramadan"], lang: "孟加拉语 / 英语" },
    EG: { zh: "埃及", en: "Egypt", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精", fest: ["开斋节", "古尔邦节"], tips: ["时间观念偏弹性，通知宜提前多次提醒"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Time-keeping tends to be flexible - send reminders more than once"], lang: "阿拉伯语" },
    SA: { zh: "沙特阿拉伯", en: "Saudi Arabia", faith: "伊斯兰教", diet: "清真饮食；忌猪肉与酒精", fest: ["开斋节", "古尔邦节"], tips: ["每日礼拜时间需预留", "女性着装与社交习惯需尊重"], faith_en: "Islam", diet_en: "Halal; no pork or alcohol", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Reserve time for the five daily prayers", "Respect dress and social customs"], lang: "阿拉伯语" },
    RU: { zh: "俄罗斯", en: "Russia", faith: "东正教为主", diet: "无普遍宗教忌口；部分忌食猪肉（穆斯林群体）", fest: ["东正教圣诞节", "谢肉节"], tips: ["气候差异大，需提醒冬装", "直接沟通风格，避免误解为不礼貌"], faith_en: "Mainly Orthodox Christian", diet_en: "No general religious restriction; Muslim communities avoid pork", fest_en: ["Orthodox Christmas", "Maslenitsa"], tips_en: ["Large climate difference - remind about winter clothing", "Direct communication style - do not mistake it for rudeness"], lang: "俄语" },
    KZ: { zh: "哈萨克斯坦", en: "Kazakhstan", faith: "伊斯兰教为主（世俗化程度高）", diet: "清真倾向；马肉、奶制品常见", fest: ["纳吾鲁孜节"], tips: ["俄语与哈萨克语并用"], faith_en: "Predominantly Muslim, largely secular", diet_en: "Halal-leaning; horse meat and dairy are common", fest_en: ["Nauryz"], tips_en: ["Kazakh and Russian are both used"], lang: "哈萨克语 / 俄语" },
    KR: { zh: "韩国", en: "South Korea", faith: "基督教与佛教并存", diet: "无普遍忌口；偏好辛辣", fest: ["秋夕", "农历新年"], tips: ["重视礼节与长幼秩序"], faith_en: "Christianity and Buddhism", diet_en: "No general restriction; spicy food is preferred", fest_en: ["Chuseok", "Lunar New Year"], tips_en: ["Hierarchy and courtesy matter in social interaction"], lang: "韩语" },
    JP: { zh: "日本", en: "Japan", faith: "神道教与佛教并存", diet: "无普遍忌口；重视食材来源说明", fest: ["新年", "盂兰盆节"], tips: ["注重规则与安静环境"], faith_en: "Shinto and Buddhism", diet_en: "No general restriction; attention to ingredient labelling", fest_en: ["New Year", "Obon"], tips_en: ["Rules and quiet environments are valued"], lang: "日语" },
    TH: { zh: "泰国", en: "Thailand", faith: "佛教为主", diet: "无普遍忌口；僧侣有特定饮食规范", fest: ["宋干节"], tips: ["尊重佛像与僧侣礼仪", "避免触碰他人头部"], faith_en: "Predominantly Buddhist", diet_en: "No general restriction; monks follow specific dietary rules", fest_en: ["Songkran"], tips_en: ["Respect Buddha images and monks", "Avoid touching someone's head"], lang: "泰语" },
    VN: { zh: "越南", en: "Vietnam", faith: "佛教与民间信仰为主", diet: "无普遍忌口；清淡、多香草", fest: ["春节（Tet）"], tips: ["春节假期办事窗口可能调整"], faith_en: "Buddhism and folk beliefs", diet_en: "No general restriction; light flavours with herbs", fest_en: ["Tet (Lunar New Year)"], tips_en: ["Service counters may adjust hours during Tet"], lang: "越南语" },
    ET: { zh: "埃塞俄比亚", en: "Ethiopia", faith: "基督教与伊斯兰教并存", diet: "东正教有斋戒传统；穆斯林忌猪肉", fest: ["主显节", "开斋节"], tips: ["斋戒期饮食安排需单独确认"], faith_en: "Christian and Muslim communities", diet_en: "Orthodox fasting traditions; Muslims avoid pork", fest_en: ["Timkat", "Eid al-Fitr"], tips_en: ["Confirm meal arrangements separately during fasting periods"], lang: "阿姆哈拉语 / 英语" },
    NG: { zh: "尼日利亚", en: "Nigeria", faith: "基督教与伊斯兰教并存", diet: "因宗教而异；穆斯林忌猪肉与酒精", fest: ["开斋节", "圣诞节"], tips: ["需逐人确认饮食禁忌"], faith_en: "Christian and Muslim communities", diet_en: "Varies by religion; Muslims avoid pork and alcohol", fest_en: ["Eid al-Fitr", "Christmas"], tips_en: ["Confirm dietary restrictions individually"], lang: "英语" },
    US: { zh: "美国", en: "United States", faith: "多元", diet: "无普遍忌口；过敏原需重点关注（花生、坚果、乳制品）", fest: ["感恩节", "圣诞节"], tips: ["过敏原沟通务必书面化"], faith_en: "Diverse", diet_en: "No general restriction; watch allergens (peanut, tree nut, dairy)", fest_en: ["Thanksgiving", "Christmas"], tips_en: ["Put allergen communication in writing"], lang: "英语" },
    FR: { zh: "法国", en: "France", faith: "天主教背景，世俗化程度高", diet: "无普遍忌口；清真与素食需求并存", fest: ["圣诞节", "国庆节"], tips: ["行政流程重视材料完整与预约"], faith_en: "Catholic heritage, largely secular", diet_en: "No general restriction; halal and vegetarian needs coexist", fest_en: ["Christmas", "Bastille Day"], tips_en: ["Administrative processes value complete documents and appointments"], lang: "法语" },
    DE: { zh: "德国", en: "Germany", faith: "基督教背景，世俗化程度高", diet: "无普遍忌口；素食与无麸质需求常见", fest: ["圣诞节", "复活节"], tips: ["重视守时与书面确认"], faith_en: "Christian heritage, largely secular", diet_en: "No general restriction; vegetarian and gluten-free needs are common", fest_en: ["Christmas", "Easter"], tips_en: ["Punctuality and written confirmation are valued"], lang: "德语" },
    OTHER: { zh: "其他国家 / 地区", en: "Other", faith: "请按本人情况填写", diet: "请按本人情况填写", fest: [], tips: ["可在个人资料中补充，助手将据此调整提示"], faith_en: "Please fill in as applicable", diet_en: "Please fill in as applicable", fest_en: [], tips_en: ["You may add details in your profile and the assistant will adapt its hints"], lang: "—" }
  };

  /* ---------- 资讯推送（机构端发布，学生端按画像过滤） ---------- */
  var NEWS = [
    { id: "n1", date: "2026-09-21", cat: "policy", level: "S1", title: "外国人非旅馆住宿登记全国范围开通线上办理", body: "国家移民管理局政务服务平台「外国人服务」模块已在全国推广非旅馆住宿登记线上办理，与线下窗口具有同等法律效力。建议首次办理由留宿人（房东）协助完成。", tags: ["arrival", "all"], src: "nia_platform" },
    { id: "n2", date: "2026-09-23", cat: "policy", level: "S1", title: "2024—2025 学年 38 万名国际学生在华学习交流", body: "教育部在国新办发布会上介绍，来自 191 个国家和地区的 38 万名国际学生在华学习交流，92 个国家将中文纳入国民教育体系。「十五五」期间将继续加强「留学中国」品牌和能力建设。", tags: ["all"], src: "moe" },
    { id: "n3", date: "2026-08-20", cat: "policy", level: "S1", title: "240 小时过境免签适用国家增至 57 国", body: "自 2026 年 8 月 20 日起，吉尔吉斯斯坦、越南公民可适用 240 小时过境免签政策，政策适用国家增至 57 国；海南 30 天入境免签适用国家增至 61 国。", tags: ["short", "transit"], src: "nia_240" },
    { id: "n4", date: "2026-09-15", cat: "campus", level: "S3", title: "秋季学期居留许可集中办理窗口开放", body: "（示例条目，由机构端维护）国际学生办公室将于本月开放居留许可集中办理窗口，请持住宿登记凭证、体检核验结果与在学证明按预约时段前往。", tags: ["arrival", "degree"], src: "school" },
    { id: "n5", date: "2026-09-10", cat: "campus", level: "S3", title: "校园文化周与语言伙伴计划报名", body: "（示例条目，由机构端维护）校园文化周将设置国别文化展台与语言伙伴配对，欢迎国际学生报名参与，可计入第二课堂学时。", tags: ["study"], src: "school" }
  ];

  /* ---------- 机构端内容模板 ---------- */
  var TEMPLATES = [
    { id: "t_guide", name: "国别化来华指南", name_en: "Country-tailored arrival guide", desc: "按目标国别生成行前与抵达阶段指引，自动附加饮食、宗教与节日提示", sections: ["行前准备", "入境与登记", "报到注册", "在学提示", "紧急联系"], sections_en: ["Pre-departure preparation", "Entry and registration", "Enrolment", "During study", "Emergency contacts"] },
    { id: "t_checklist", name: "行前清单", name_en: "Pre-departure checklist", desc: "按签证类别与停留时长生成材料与事项清单，可导出打印", sections: ["证件材料", "健康与保险", "支付与通信", "行李与合规"], sections_en: ["Documents", "Health and insurance", "Payment and connectivity", "Luggage and compliance"] },
    { id: "t_notice", name: "通知公告", name_en: "Official notice", desc: "生成多语种通知公告，含事项、时限、地点与联系人", sections: ["事项", "时限", "办理方式", "联系方式"], sections_en: ["Subject", "Deadline", "How to apply", "Contact"] },
    { id: "t_faq", name: "常见问答集", name_en: "FAQ set", desc: "从知识库高频问题生成多语种问答集，支持一键发布到学生端", sections: ["手续类", "生活类", "学业类"], sections_en: ["Procedures", "Daily life", "Academic"] },
    { id: "t_brief", name: "迎新简报", name_en: "Orientation brief", desc: "面向新生的首月安排与关键时限提醒", sections: ["首周", "首月", "首学期"], sections_en: ["First week", "First month", "First semester"] },
    { id: "t_emergency", name: "应急处置卡", name_en: "Emergency card", desc: "护照遗失、就医、纠纷等场景的一页式处置流程", sections: ["场景", "处置步骤", "联系方式"], sections_en: ["Scenario", "Steps", "Contacts"] }
  ];

  var LANGS = [
    { code: "zh", name: "中文", en: "Chinese", dir: "ltr", flag: "中" },
    { code: "en", name: "English", en: "English", dir: "ltr", flag: "EN" },
    { code: "ru", name: "Русский", en: "Russian", dir: "ltr", flag: "RU" },
    { code: "ar", name: "العربية", en: "Arabic", dir: "rtl", flag: "AR" },
    { code: "fr", name: "Français", en: "French", dir: "ltr", flag: "FR" },
    { code: "es", name: "Español", en: "Spanish", dir: "ltr", flag: "ES" }
  ];

  return {
    META: META, SRC: SRC, MATTERS: MATTERS, PATHS: PATHS, FAQ: FAQ,
    COUNTRY: COUNTRY, NEWS: NEWS, TEMPLATES: TEMPLATES, LANGS: LANGS,
    /* 便捷索引 */
    mattersByStage: function (stage) {
      return MATTERS.filter(function (m) { return m.stage === stage; })
        .sort(function (a, b) { return a.order - b.order; });
    },
    matter: function (id) {
      for (var i = 0; i < MATTERS.length; i++) { if (MATTERS[i].id === id) return MATTERS[i]; }
      return null;
    },
    sources: function (keys) {
      return (keys || []).map(function (k) { return SRC[k]; }).filter(Boolean);
    }
  };
})();

  });
  /* ==== 模块 i18n.js（内容与 08_小程序/utils/i18n.js 逐字节相同） ==== */
  __def('i18n', function (module, exports, require) {
/* 由网页端 assets/js/i18n.js 移植：仅保留 I18N 语言包数据，
   丢弃依赖 DOM 的 L10N.apply（小程序由 setData 驱动视图，不需要 DOM 操作）。 */

var I18N = {
  zh: {
    _label: "中文",
    appName: "来华交流全程助手",
    appSub: "EXCHANGE AI AGENT FOR CHINA",
    tagline: "覆盖来华交流全周期的多语种 AI Agent：机构侧内容生产 × 学生侧全周期服务",
    navHome: "首页", navStudent: "学生端", navOrg: "机构端", navFlow: "Agent 工作流", navData: "数据底座", navAbout: "关于",
    enterStudent: "进入学生端", enterOrg: "进入机构端", backHome: "返回首页",
    language: "语言", theme: "主题", themeLight: "浅色", themeDark: "深色", print: "打印 / 导出 PDF",
    student: "学生端", org: "机构端",
    heroTitle: "让每一次来华交流，都从「办得顺」开始",
    heroSub: "面向高校国际学生与来华交流人士的全周期多语种智能助手。把分散在多个部门的手续、时限与国别差异，整理成一条可执行的路径。",
    heroCta1: "体验学生端", heroCta2: "查看机构端",
    stages: "四个阶段", stagePre: "来华前", stageArrival: "抵达初期", stageStudy: "在学日常", stageExit: "离境前后",
    stagePreDesc: "签证、体检、保险、支付准备", stageArrivalDesc: "登记、报到、居留许可、开户",
    stageStudyDesc: "延期、就医、出行、实习合规", stageExitDesc: "离校、证书、账户、再次来华",
    myPath: "我的办理路径", checklist: "办事清单", faqTitle: "常见问答", guideTitle: "生活指引",
    newsTitle: "资讯推送", countryTitle: "国别与信仰适配", reminder: "到期提醒", dashboard: "服务看板",
    profileTitle: "建立你的服务画像",
    profileHint: "仅用于生成本地指引，数据仅保存在你的设备中，不上传、不采集证件号码。",
    nationality: "国籍 / 地区", purpose: "来华事由", duration: "预计停留时长",
    purposeDegree: "学位生（本科/硕博）", purposeExchange: "交换生 / 校际交流", purposeVisiting: "进修学者 / 访问学者",
    purposeShort: "短期研学 / 夏令营", purposeTransit: "过境免签 / 商务访问",
    durLe180: "180 天以内", durLt180: "180 天以上", durLe240: "240 小时以内",
    arrivalDate: "预计抵达日期", enrollDate: "预计报到日期", faith: "宗教 / 信仰（选填，用于饮食与礼仪提示）",
    faithNone: "不便告知", faithIslam: "伊斯兰教", faithBuddhism: "佛教", faithChristianity: "基督教",
    faithHinduism: "印度教", faithJudaism: "犹太教", faithNone2: "无宗教信仰",
    dietNeeds: "饮食需求（选填）", dietHalal: "清真", dietVegetarian: "素食", dietNoPork: "忌猪肉",
    dietNoBeef: "忌牛肉", dietNoAlcohol: "忌酒精", dietAllergy: "食物过敏",
    generate: "生成我的办理路径", regenerate: "重新生成", reset: "重置",
    pathResult: "你的专属办理路径", pathVisa: "判定签证/停留类别", pathRisk: "关键风险点", pathSteps: "建议办理顺序",
    keyDeadline: "关键时限", deadline: "时限", authority: "办理/受理机构", channel: "办理渠道",
    docsNeeded: "所需材料", riskTip: "风险提示", sourceLabel: "依据来源", checkedAt: "核对日期",
    evidenceLevel: "证据等级", levelS1: "S1 · 法规/政府一手", levelS2: "S2 · 权威发布", levelS3: "S3 · 公开指引（待属地复核）",
    needReview: "待属地复核", aiGenerated: "AI 生成 · 待人工复核", submitReview: "提交人工复核",
    reviewSent: "已生成复核工单，可交给学校国际学生办公室确认。",
    markDone: "标记已完成", done: "已完成", urgent: "紧急", soon: "临近", later: "待办",
    exportChecklist: "导出清单", copyLink: "复制分享链接", copied: "已复制到剪贴板",
    askTitle: "向助手提问", askPlaceholder: "例如：我住在校外，住宿登记谁办？多久内办？",
    askSend: "发送", thinking: "正在推理…", traceTitle: "推理轨迹（可解释）", confidence: "置信度",
    matchedKB: "命中知识条目", ruleApplied: "应用规则", noAnswer: "未在知识库中找到足够可靠的条目，已建议转人工。",
    transferHuman: "转人工 / 咨询学校国际学生办公室",
    orgTitle: "机构端 · 内容工作台", orgSub: "一套知识库，同时驱动学生端服务与机构端内容生产",
    genContent: "生成内容", genTemplate: "选择模板", genCountry: "目标国别", genLang: "目标语种",
    genTopic: "事项 / 主题", genDeadline: "时限 / 日期", genContact: "联系方式", genExtra: "补充要求",
    genRun: "生成内容", genPreview: "生成结果预览", genTranslate: "一键多语种", genPublish: "发布到学生端",
    genExport: "导出 HTML", genCopy: "复制全文", published: "已发布到学生端，学生端即时可见。",
    kbManage: "知识库维护", kbAdd: "新增条目", kbTotal: "条目总数", kbS3: "待属地复核条目",
    kbLastUpdate: "最近更新", kbSave: "保存", kbSaved: "已保存到本地知识库。",
    boardConsult: "咨询热点 Top 6", boardDeadline: "时限事项分布", boardCoverage: "知识库覆盖度",
    boardLang: "多语种生成量", boardEfficiency: "效率测算",
    opcTitle: "OPC 实践看板", opcSub: "低成本启动 · 小团队协作 · AI 辅助执行 · 快速验证 · 持续迭代",
    opcCost: "月度成本结构", opcHours: "人力工时投入", opcIter: "版本迭代日志", opcRoles: "角色与分工",
    measureTitle: "效率测算（可核查口径）", measureNote: "以下为基于公开事实与场景假设的测算，非试点实测数据；试点数据待补充。",
    planA: "假设 A：单次咨询平均耗时", planB: "假设 B：每月重复咨询量", planC: "咨询量下降比例",
    calcNow: "当前人工模式（月）", calcWith: "使用助手后（月）", calcSaved: "月度节省",
    disclaimer: "免责与合规说明", toolSource: "工具与技术来源",
    footerNote: "本助手提供信息聚合与流程引导，不构成法律意见；具体办理要求以属地主管部门与所在学校最新公布为准。",
    aiLabelNote: "AI 生成内容已标注并支持人工复核；产品默认本地化存储，不采集护照号等敏感证件信息。",
    noData: "暂无数据", loading: "加载中…", confirm: "确认", cancel: "取消", close: "关闭",
    viewDetail: "查看详情", collapse: "收起", expand: "展开", all: "全部",
    stage: "阶段", priority: "优先级", filterStage: "按阶段筛选", filterPri: "按优先级筛选",
    doneCount: "已完成", totalCount: "共", items: "项", progress: "完成进度",
    countryFaith: "宗教背景", countryDiet: "饮食要点", countryFest: "主要节日", countryTips: "沟通与礼仪提示",
    countryLang: "常用语言", countryNote: "国别适配为跨文化沟通提示，不构成宗教或法律依据，请尊重个体差异。",
    newsPolicy: "政策", newsCampus: "校园", newsAll: "全部",
    quickAsk: "快捷提问", demoNote: "演示模式", demoModeNote: "演示版 Agent 采用「意图识别 + 知识库检索 + 规则判定 + 模板生成」的可解释架构，并预留大模型接口；所有输出均附来源与复核标识。",
    flowTitle: "Agent 工作流（六步，可解释、可复核）",
    flow1: "意图识别", flow1d: "判断你要办的事属于哪一类任务",
    flow2: "画像读取", flow2d: "读取身份、事由、时长与国别适配信息",
    flow3: "知识检索", flow3d: "在来源锚定的知识库中召回相关条目",
    flow4: "规则判定", flow4d: "按法定时限与条件计算你的关键时间点",
    flow5: "内容生成", flow5d: "生成路径、清单与多语种材料",
    flow6: "合规复核", flow6d: "标注证据等级、AI 生成标识与人工复核入口",
    statStudents: "在华国际学生（2024—2025 学年）", statCountries: "生源国家和地区",
    statTransit: "240 小时过境免签适用国家", statVisaFree: "单方面免签国家",
    statUni: "个开放口岸", statCountriesN: "个国家和地区"
  },

  en: {
    _label: "English",
    appName: "Exchange AI Agent for China",
    appSub: "来华交流全程助手",
    tagline: "A multilingual AI agent covering the full cycle of studying and visiting in China — institution-side content production × student-side lifecycle service",
    navHome: "Home", navStudent: "Student", navOrg: "Institution", navFlow: "Agent workflow", navData: "Evidence base", navAbout: "About",
    enterStudent: "Open student portal", enterOrg: "Open institution console", backHome: "Back to home",
    language: "Language", theme: "Theme", themeLight: "Light", themeDark: "Dark", print: "Print / Export PDF",
    student: "Student", org: "Institution",
    heroTitle: "Make every stay in China start with things that simply work",
    heroSub: "A multilingual lifecycle assistant for international students and visitors. Scattered procedures, statutory deadlines and country-specific differences are turned into one executable path.",
    heroCta1: "Try the student portal", heroCta2: "See the institution console",
    stages: "Four stages", stagePre: "Before arrival", stageArrival: "Arrival", stageStudy: "During study", stageExit: "Departure",
    stagePreDesc: "Visa, medical, insurance, payment", stageArrivalDesc: "Registration, enrolment, residence permit, bank",
    stageStudyDesc: "Extension, healthcare, travel, internship compliance", stageExitDesc: "Clearance, certificates, accounts, return",
    myPath: "My pathway", checklist: "My checklist", faqTitle: "FAQ", guideTitle: "Living guide",
    newsTitle: "Updates", countryTitle: "Country & faith adaptation", reminder: "Deadline reminders", dashboard: "Service dashboard",
    profileTitle: "Create your service profile",
    profileHint: "Used only to generate local guidance. Data stays on your device; no ID numbers are collected.",
    nationality: "Nationality / region", purpose: "Purpose of stay", duration: "Expected length of stay",
    purposeDegree: "Degree student (BA/MA/PhD)", purposeExchange: "Exchange / inter-university", purposeVisiting: "Visiting scholar",
    purposeShort: "Short programme / summer school", purposeTransit: "Visa-free transit / business visit",
    durLe180: "Within 180 days", durLt180: "Over 180 days", durLe240: "Within 240 hours",
    arrivalDate: "Expected arrival date", enrollDate: "Expected enrolment date", faith: "Religion (optional, for dietary and etiquette hints)",
    faithNone: "Prefer not to say", faithIslam: "Islam", faithBuddhism: "Buddhism", faithChristianity: "Christianity",
    faithHinduism: "Hinduism", faithJudaism: "Judaism", faithNone2: "No religion",
    dietNeeds: "Dietary needs (optional)", dietHalal: "Halal", dietVegetarian: "Vegetarian", dietNoPork: "No pork",
    dietNoBeef: "No beef", dietNoAlcohol: "No alcohol", dietAllergy: "Food allergy",
    generate: "Generate my pathway", regenerate: "Regenerate", reset: "Reset",
    pathResult: "Your personalised pathway", pathVisa: "Visa / stay category", pathRisk: "Key risk", pathSteps: "Recommended order",
    keyDeadline: "Key deadline", deadline: "Deadline", authority: "Authority", channel: "Where to apply",
    docsNeeded: "Documents", riskTip: "Risk", sourceLabel: "Source", checkedAt: "Verified on",
    evidenceLevel: "Evidence level", levelS1: "S1 · Law / government", levelS2: "S2 · Authoritative release", levelS3: "S3 · Public guidance (verify locally)",
    needReview: "Verify locally", aiGenerated: "AI-generated · human review pending", submitReview: "Request human review",
    reviewSent: "A review ticket was created for your international student office.",
    markDone: "Mark done", done: "Done", urgent: "Urgent", soon: "Due soon", later: "To do",
    exportChecklist: "Export checklist", copyLink: "Copy share link", copied: "Copied to clipboard",
    askTitle: "Ask the agent", askPlaceholder: "e.g. I live off campus — who registers my accommodation and by when?",
    askSend: "Send", thinking: "Reasoning…", traceTitle: "Reasoning trace (explainable)", confidence: "Confidence",
    matchedKB: "Matched knowledge items", ruleApplied: "Rule applied", noAnswer: "Not enough reliable knowledge found. A human referral is suggested.",
    transferHuman: "Refer to a human / your international student office",
    orgTitle: "Institution console · Content studio", orgSub: "One knowledge base powering both student service and institutional content production",
    genContent: "Content generation", genTemplate: "Template", genCountry: "Target country", genLang: "Target language",
    genTopic: "Topic", genDeadline: "Deadline / date", genContact: "Contact", genExtra: "Additional requirements",
    genRun: "Generate", genPreview: "Preview", genTranslate: "Multilingual", genPublish: "Publish to students",
    genExport: "Export HTML", genCopy: "Copy all", published: "Published — visible in the student portal immediately.",
    kbManage: "Knowledge base", kbAdd: "Add item", kbTotal: "Total items", kbS3: "Items pending local verification",
    kbLastUpdate: "Last updated", kbSave: "Save", kbSaved: "Saved to the local knowledge base.",
    boardConsult: "Top 6 enquiries", boardDeadline: "Deadline distribution", boardCoverage: "Knowledge coverage",
    boardLang: "Multilingual output", boardEfficiency: "Efficiency model",
    opcTitle: "OPC practice board", opcSub: "Low-cost start · small team · AI-executed · fast validation · continuous iteration",
    opcCost: "Monthly cost structure", opcHours: "Human hours", opcIter: "Release log", opcRoles: "Roles",
    measureTitle: "Efficiency model (auditable basis)", measureNote: "Figures below are scenario-based estimates, not pilot measurements. Pilot data to be added.",
    planA: "Assumption A: minutes per enquiry", planB: "Assumption B: repeat enquiries per month", planC: "Reduction ratio",
    calcNow: "Manual today (monthly)", calcWith: "With the agent (monthly)", calcSaved: "Monthly saving",
    disclaimer: "Disclaimer & compliance", toolSource: "Tools and technology sources",
    footerNote: "This assistant aggregates information and guides procedures; it does not constitute legal advice. Always follow the latest requirements of local authorities and your university.",
    aiLabelNote: "AI-generated content is labelled and open to human review. Storage is local by default; no passport numbers or similar sensitive identifiers are collected.",
    noData: "No data", loading: "Loading…", confirm: "Confirm", cancel: "Cancel", close: "Close",
    viewDetail: "Details", collapse: "Collapse", expand: "Expand", all: "All",
    stage: "Stage", priority: "Priority", filterStage: "Filter by stage", filterPri: "Filter by priority",
    doneCount: "Done", totalCount: "Total", items: "items", progress: "Progress",
    countryFaith: "Religious background", countryDiet: "Dietary notes", countryFest: "Main festivals", countryTips: "Communication & etiquette",
    countryLang: "Common languages", countryNote: "Country adaptation is a cross-cultural communication aid, not a religious or legal reference. Respect individual differences.",
    newsPolicy: "Policy", newsCampus: "Campus", newsAll: "All",
    quickAsk: "Quick questions", demoNote: "Demo mode", demoModeNote: "This demo implements the agent as an explainable pipeline: intent recognition + knowledge retrieval + rule engine + template generation, with an LLM adapter reserved. Every output carries sources and a review label.",
    flowTitle: "Agent workflow (six explainable, auditable steps)",
    flow1: "Intent", flow1d: "Classify what kind of task you are asking for",
    flow2: "Profile", flow2d: "Read identity, purpose, duration and country adaptation",
    flow3: "Retrieval", flow3d: "Recall source-anchored knowledge items",
    flow4: "Rule engine", flow4d: "Compute your key dates from statutory deadlines",
    flow5: "Generation", flow5d: "Produce pathway, checklist and multilingual material",
    flow6: "Compliance", flow6d: "Label evidence level, AI origin and human review entry",
    statStudents: "International students in China (2024–2025)", statCountries: "Countries and regions of origin",
    statTransit: "Countries eligible for 240-hour transit", statVisaFree: "Unilateral visa-free countries",
    statUni: "open ports", statCountriesN: "countries and regions"
  },

  ru: {
    _label: "Русский",
    appName: "Помощник по обмену с Китаем",
    appSub: "Exchange AI Agent for China",
    tagline: "Многоязычный ИИ-агент на весь период пребывания в Китае: производство контента для вузов × сервис для студентов",
    navHome: "Главная", navStudent: "Студенту", navOrg: "Вузу", navFlow: "Работа агента", navData: "База фактов", navAbout: "О проекте",
    enterStudent: "Кабинет студента", enterOrg: "Кабинет вуза", backHome: "На главную",
    language: "Язык", theme: "Тема", themeLight: "Светлая", themeDark: "Тёмная", print: "Печать / PDF",
    student: "Студент", org: "Вуз",
    heroTitle: "Чтобы пребывание в Китае начиналось с простых и понятных действий",
    heroSub: "Многоязычный помощник для иностранных студентов и гостей Китая. Разрозненные процедуры, законные сроки и национальные особенности собраны в один выполнимый маршрут.",
    heroCta1: "Кабинет студента", heroCta2: "Кабинет вуза",
    stages: "Четыре этапа", stagePre: "До приезда", stageArrival: "По прибытии", stageStudy: "Во время учёбы", stageExit: "Перед отъездом",
    stagePreDesc: "Виза, медосмотр, страховка, оплата", stageArrivalDesc: "Регистрация, зачисление, ВНЖ, банк",
    stageStudyDesc: "Продление, медицина, поездки, стажировка", stageExitDesc: "Обходной лист, диплом, счета, возвращение",
    myPath: "Мой маршрут", checklist: "Мой чек-лист", faqTitle: "Частые вопросы", guideTitle: "Гид по жизни",
    newsTitle: "Обновления", countryTitle: "Адаптация по стране и вере", reminder: "Напоминания", dashboard: "Панель сервиса",
    profileTitle: "Создайте профиль",
    profileHint: "Данные используются только локально на вашем устройстве; номера документов не собираются.",
    nationality: "Гражданство / регион", purpose: "Цель пребывания", duration: "Планируемый срок",
    purposeDegree: "Студент программы (бакалавр/магистр)", purposeExchange: "Обмен / межвузовский", purposeVisiting: "Приглашённый исследователь",
    purposeShort: "Краткая программа / летняя школа", purposeTransit: "Безвизовый транзит / бизнес",
    durLe180: "До 180 дней", durLt180: "Более 180 дней", durLe240: "До 240 часов",
    arrivalDate: "Дата приезда", enrollDate: "Дата зачисления", faith: "Религия (необязательно)",
    faithNone: "Не указывать", faithIslam: "Ислам", faithBuddhism: "Буддизм", faithChristianity: "Христианство",
    faithHinduism: "Индуизм", faithJudaism: "Иудаизм", faithNone2: "Нет религии",
    dietNeeds: "Питание (необязательно)", dietHalal: "Халяль", dietVegetarian: "Вегетарианское", dietNoPork: "Без свинины",
    dietNoBeef: "Без говядины", dietNoAlcohol: "Без алкоголя", dietAllergy: "Аллергия",
    generate: "Построить маршрут", regenerate: "Обновить", reset: "Сброс",
    pathResult: "Ваш маршрут", pathVisa: "Категория визы / пребывания", pathRisk: "Ключевой риск", pathSteps: "Рекомендуемый порядок",
    keyDeadline: "Ключевой срок", deadline: "Срок", authority: "Орган", channel: "Куда обращаться",
    docsNeeded: "Документы", riskTip: "Риск", sourceLabel: "Источник", checkedAt: "Проверено",
    evidenceLevel: "Уровень достоверности", levelS1: "S1 · Закон/государство", levelS2: "S2 · Официальный источник", levelS3: "S3 · Публичный гид (уточняйте на месте)",
    needReview: "Уточните на месте", aiGenerated: "Создано ИИ · нужна проверка человеком", submitReview: "На проверку специалисту",
    reviewSent: "Запрос создан — обратитесь в международный отдел вуза.",
    markDone: "Отметить", done: "Готово", urgent: "Срочно", soon: "Скоро", later: "К выполнению",
    exportChecklist: "Экспорт чек-листа", copyLink: "Копировать ссылку", copied: "Скопировано",
    askTitle: "Спросить агента", askPlaceholder: "Например: я живу вне кампуса — кто и когда регистрирует адрес?",
    askSend: "Отправить", thinking: "Обработка…", traceTitle: "Ход рассуждений", confidence: "Уверенность",
    matchedKB: "Найденные записи", ruleApplied: "Применённое правило", noAnswer: "Недостаточно надёжных данных. Рекомендован специалист.",
    transferHuman: "Связаться со специалистом / международным отделом",
    orgTitle: "Кабинет вуза · Студия контента", orgSub: "Одна база знаний питает и сервис для студентов, и контент для вуза",
    genContent: "Генерация контента", genTemplate: "Шаблон", genCountry: "Страна", genLang: "Язык",
    genTopic: "Тема", genDeadline: "Срок / дата", genContact: "Контакты", genExtra: "Дополнительно",
    genRun: "Создать", genPreview: "Предпросмотр", genTranslate: "Мультиязычность", genPublish: "Опубликовать",
    genExport: "Экспорт HTML", genCopy: "Копировать", published: "Опубликовано — видно студентам сразу.",
    kbManage: "База знаний", kbAdd: "Добавить запись", kbTotal: "Всего записей", kbS3: "Записей на уточнение",
    kbLastUpdate: "Обновлено", kbSave: "Сохранить", kbSaved: "Сохранено локально.",
    boardConsult: "Топ-6 обращений", boardDeadline: "Сроки", boardCoverage: "Покрытие базы",
    boardLang: "Мультиязычный вывод", boardEfficiency: "Модель эффективности",
    opcTitle: "Панель практики OPC", opcSub: "Дешёвый старт · малая команда · ИИ-исполнение · быстрая проверка · итерации",
    opcCost: "Структура затрат", opcHours: "Часы работы", opcIter: "Журнал версий", opcRoles: "Роли",
    measureTitle: "Модель эффективности (проверяемая основа)", measureNote: "Ниже — сценарная оценка, а не данные пилота. Данные пилота будут добавлены.",
    planA: "Допущение A: минут на обращение", planB: "Допущение B: обращений в месяц", planC: "Доля снижения",
    calcNow: "Вручную (месяц)", calcWith: "С агентом (месяц)", calcSaved: "Экономия в месяц",
    disclaimer: "Отказ от ответственности", toolSource: "Инструменты и источники",
    footerNote: "Помощник агрегирует информацию и подсказывает порядок действий; это не юридическая консультация. Следуйте актуальным требованиям органов и вуза.",
    aiLabelNote: "Контент ИИ помечен и доступен для проверки человеком. Данные хранятся локально; номера паспортов не собираются.",
    noData: "Нет данных", loading: "Загрузка…", confirm: "ОК", cancel: "Отмена", close: "Закрыть",
    viewDetail: "Подробнее", collapse: "Свернуть", expand: "Развернуть", all: "Все",
    stage: "Этап", priority: "Приоритет", filterStage: "По этапу", filterPri: "По приоритету",
    doneCount: "Готово", totalCount: "Всего", items: "п.", progress: "Прогресс",
    countryFaith: "Религиозный фон", countryDiet: "Питание", countryFest: "Праздники", countryTips: "Этикет",
    countryLang: "Языки", countryNote: "Адаптация по стране — подсказка для общения, а не религиозная или юридическая норма.",
    newsPolicy: "Политика", newsCampus: "Кампус", newsAll: "Все",
    quickAsk: "Быстрые вопросы", demoNote: "Демо", demoModeNote: "Демо-версия реализует агента как объяснимый конвейер: распознавание намерения + поиск по базе + правила + шаблоны; предусмотрен адаптер LLM.",
    flowTitle: "Работа агента (шесть объяснимых шагов)",
    flow1: "Намерение", flow1d: "Определяем тип задачи",
    flow2: "Профиль", flow2d: "Читаем данные о вас",
    flow3: "Поиск", flow3d: "Находим подтверждённые записи",
    flow4: "Правила", flow4d: "Считаем ваши сроки",
    flow5: "Генерация", flow5d: "Формируем маршрут и материалы",
    flow6: "Проверка", flow6d: "Помечаем источник и необходимость проверки",
    statStudents: "Иностранных студентов в Китае (2024–2025)", statCountries: "Стран и регионов",
    statTransit: "Стран для 240-часового транзита", statVisaFree: "Стран с односторонним безвизом",
    statUni: "открытых портов", statCountriesN: "стран и регионов"
  },

  ar: {
    _label: "العربية",
    appName: "المساعد الذكي للتبادل مع الصين",
    appSub: "Exchange AI Agent for China",
    tagline: "وكيل ذكي متعدد اللغات يغطي كامل فترة الإقامة في الصين: إنتاج المحتوى للمؤسسات × خدمة الطلاب",
    navHome: "الرئيسية", navStudent: "بوابة الطالب", navOrg: "بوابة المؤسسة", navFlow: "سير عمل الوكيل", navData: "قاعدة الأدلة", navAbout: "حول",
    enterStudent: "بوابة الطالب", enterOrg: "بوابة المؤسسة", backHome: "الرئيسية",
    language: "اللغة", theme: "المظهر", themeLight: "فاتح", themeDark: "داكن", print: "طباعة / PDF",
    student: "طالب", org: "مؤسسة",
    heroTitle: "لتبدأ كل إقامة في الصين بإجراءات تسير بسلاسة",
    heroSub: "مساعد متعدد اللغات للطلاب الدوليين والزوار. نجمع الإجراءات المتفرقة والمواعيد القانونية والفروق الثقافية في مسار واحد قابل للتنفيذ.",
    heroCta1: "بوابة الطالب", heroCta2: "بوابة المؤسسة",
    stages: "أربع مراحل", stagePre: "قبل الوصول", stageArrival: "عند الوصول", stageStudy: "أثناء الدراسة", stageExit: "قبل المغادرة",
    stagePreDesc: "التأشيرة، الفحص الطبي، التأمين، الدفع", stageArrivalDesc: "التسجيل، التسجيل الجامعي، تصريح الإقامة، البنك",
    stageStudyDesc: "التمديد، الرعاية الصحية، السفر، التدريب", stageExitDesc: "المخالصة، الشهادات، الحسابات، العودة",
    myPath: "مساري", checklist: "قائمة المهام", faqTitle: "الأسئلة الشائعة", guideTitle: "دليل الحياة",
    newsTitle: "التحديثات", countryTitle: "التوافق الثقافي والديني", reminder: "تنبيهات المواعيد", dashboard: "لوحة الخدمة",
    profileTitle: "أنشئ ملفك",
    profileHint: "تُستخدم البيانات محليًا على جهازك فقط، ولا نجمع أرقام الوثائق.",
    nationality: "الجنسية / المنطقة", purpose: "سبب الإقامة", duration: "المدة المتوقعة",
    purposeDegree: "طالب درجة جامعية", purposeExchange: "تبادل جامعي", purposeVisiting: "باحث زائر",
    purposeShort: "برنامج قصير / صيفي", purposeTransit: "عبور بدون تأشيرة / أعمال",
    durLe180: "أقل من 180 يومًا", durLt180: "أكثر من 180 يومًا", durLe240: "أقل من 240 ساعة",
    arrivalDate: "تاريخ الوصول", enrollDate: "تاريخ التسجيل", faith: "الديانة (اختياري)",
    faithNone: "أفضل عدم الإفصاح", faithIslam: "الإسلام", faithBuddhism: "البوذية", faithChristianity: "المسيحية",
    faithHinduism: "الهندوسية", faithJudaism: "اليهودية", faithNone2: "بدون ديانة",
    dietNeeds: "الاحتياجات الغذائية (اختياري)", dietHalal: "حلال", dietVegetarian: "نباتي", dietNoPork: "بدون لحم خنزير",
    dietNoBeef: "بدون لحم بقر", dietNoAlcohol: "بدون كحول", dietAllergy: "حساسية غذائية",
    generate: "أنشئ مساري", regenerate: "إعادة الإنشاء", reset: "إعادة تعيين",
    pathResult: "مسارك الخاص", pathVisa: "فئة التأشيرة / الإقامة", pathRisk: "المخاطر الرئيسية", pathSteps: "الترتيب الموصى به",
    keyDeadline: "الموعد الحاسم", deadline: "الموعد", authority: "الجهة", channel: "مكان التقديم",
    docsNeeded: "المستندات", riskTip: "تنبيه", sourceLabel: "المصدر", checkedAt: "تاريخ التحقق",
    evidenceLevel: "درجة الدليل", levelS1: "S1 · قانون/جهة حكومية", levelS2: "S2 · إصدار رسمي", levelS3: "S3 · إرشاد عام (يُتحقق محليًا)",
    needReview: "يُتحقق محليًا", aiGenerated: "مُنتَج بالذكاء الاصطناعي · بحاجة لمراجعة بشرية", submitReview: "طلب مراجعة بشرية",
    reviewSent: "تم إنشاء طلب مراجعة لمكتب الطلاب الدوليين.",
    markDone: "تم", done: "مكتمل", urgent: "عاجل", soon: "قريبًا", later: "لاحقًا",
    exportChecklist: "تصدير القائمة", copyLink: "نسخ الرابط", copied: "تم النسخ",
    askTitle: "اسأل الوكيل", askPlaceholder: "مثال: أسكن خارج الحرم — من يسجل العنوان ومتى؟",
    askSend: "إرسال", thinking: "جارٍ التحليل…", traceTitle: "مسار الاستدلال", confidence: "الثقة",
    matchedKB: "المواد المطابقة", ruleApplied: "القاعدة المطبقة", noAnswer: "لا توجد بيانات موثوقة كافية. يُقترح التحويل لموظف.",
    transferHuman: "التواصل مع مكتب الطلاب الدوليين",
    orgTitle: "بوابة المؤسسة · استوديو المحتوى", orgSub: "قاعدة معرفة واحدة تخدم الطلاب والمؤسسة معًا",
    genContent: "إنشاء المحتوى", genTemplate: "القالب", genCountry: "الدولة", genLang: "اللغة",
    genTopic: "الموضوع", genDeadline: "الموعد / التاريخ", genContact: "التواصل", genExtra: "إضافات",
    genRun: "إنشاء", genPreview: "معاينة", genTranslate: "متعدد اللغات", genPublish: "نشر للطلاب",
    genExport: "تصدير HTML", genCopy: "نسخ الكل", published: "تم النشر — يظهر للطلاب فورًا.",
    kbManage: "إدارة قاعدة المعرفة", kbAdd: "إضافة مادة", kbTotal: "إجمالي المواد", kbS3: "مواد بحاجة للتحقق",
    kbLastUpdate: "آخر تحديث", kbSave: "حفظ", kbSaved: "تم الحفظ محليًا.",
    boardConsult: "أكثر 6 استفسارات", boardDeadline: "توزيع المواعيد", boardCoverage: "تغطية القاعدة",
    boardLang: "الإنتاج متعدد اللغات", boardEfficiency: "نموذج الكفاءة",
    opcTitle: "لوحة ممارسة OPC", opcSub: "بداية منخفضة التكلفة · فريق صغير · تنفيذ بالذكاء الاصطناعي · تحقق سريع · تطوير مستمر",
    opcCost: "هيكل التكلفة", opcHours: "ساعات العمل", opcIter: "سجل الإصدارات", opcRoles: "الأدوار",
    measureTitle: "نموذج الكفاءة (أساس قابل للتحقق)", measureNote: "الأرقام أدناه تقديرية حسب السيناريو وليست بيانات تجريبية.",
    planA: "الافتراض أ: دقائق للاستفسار", planB: "الافتراض ب: استفسارات شهريًا", planC: "نسبة الانخفاض",
    calcNow: "يدويًا (شهريًا)", calcWith: "مع الوكيل (شهريًا)", calcSaved: "التوفير الشهري",
    disclaimer: "إخلاء المسؤولية", toolSource: "الأدوات والمصادر",
    footerNote: "يقدّم المساعد تجميعًا للمعلومات وإرشادًا إجرائيًا ولا يُعد رأيًا قانونيًا. اتبع أحدث متطلبات الجهات والجامعة.",
    aiLabelNote: "المحتوى المُنتَج بالذكاء الاصطناعي مُوسَّم وقابل للمراجعة البشرية. التخزين محلي افتراضيًا.",
    noData: "لا توجد بيانات", loading: "جارٍ التحميل…", confirm: "تأكيد", cancel: "إلغاء", close: "إغلاق",
    viewDetail: "التفاصيل", collapse: "طي", expand: "توسيع", all: "الكل",
    stage: "المرحلة", priority: "الأولوية", filterStage: "حسب المرحلة", filterPri: "حسب الأولوية",
    doneCount: "مكتمل", totalCount: "الإجمالي", items: "عنصر", progress: "التقدم",
    countryFaith: "الخلفية الدينية", countryDiet: "ملاحظات غذائية", countryFest: "الأعياد", countryTips: "الآداب",
    countryLang: "اللغات", countryNote: "التوافق الثقافي إرشاد للتواصل وليس مرجعًا دينيًا أو قانونيًا.",
    newsPolicy: "سياسات", newsCampus: "الحرم الجامعي", newsAll: "الكل",
    quickAsk: "أسئلة سريعة", demoNote: "وضع العرض", demoModeNote: "ينفّذ العرض الوكيل كخط أنابيب قابل للتفسير: تحديد النية + استرجاع المعرفة + محرك القواعد + القوالب، مع محوّل LLM.",
    flowTitle: "سير عمل الوكيل (ست خطوات قابلة للتفسير)",
    flow1: "النية", flow1d: "تحديد نوع المهمة",
    flow2: "الملف", flow2d: "قراءة بياناتك",
    flow3: "الاسترجاع", flow3d: "استدعاء المواد الموثقة",
    flow4: "القواعد", flow4d: "حساب مواعيدك",
    flow5: "الإنشاء", flow5d: "إنتاج المسار والمواد",
    flow6: "المراجعة", flow6d: "وسم المصدر والحاجة للمراجعة",
    statStudents: "طالب دولي في الصين (2024–2025)", statCountries: "دولة ومنطقة",
    statTransit: "دولة للعبور 240 ساعة", statVisaFree: "دولة بإعفاء أحادي",
    statUni: "منفذًا مفتوحًا", statCountriesN: "دولة ومنطقة"
  },

  fr: {
    _label: "Français",
    appName: "Assistant d'échange avec la Chine",
    appSub: "Exchange AI Agent for China",
    tagline: "Un agent IA multilingue couvrant tout le séjour en Chine : production de contenu côté institution × service côté étudiant",
    navHome: "Accueil", navStudent: "Étudiant", navOrg: "Institution", navFlow: "Flux de l'agent", navData: "Base de preuves", navAbout: "À propos",
    enterStudent: "Portail étudiant", enterOrg: "Console institution", backHome: "Accueil",
    language: "Langue", theme: "Thème", themeLight: "Clair", themeDark: "Sombre", print: "Imprimer / PDF",
    student: "Étudiant", org: "Institution",
    heroTitle: "Que chaque séjour en Chine commence par des démarches fluides",
    heroSub: "Un assistant multilingue pour les étudiants internationaux et les visiteurs. Démarches dispersées, délais légaux et différences culturelles réunis en un parcours exécutable.",
    heroCta1: "Portail étudiant", heroCta2: "Console institution",
    stages: "Quatre étapes", stagePre: "Avant l'arrivée", stageArrival: "À l'arrivée", stageStudy: "Pendant les études", stageExit: "Avant le départ",
    stagePreDesc: "Visa, visite médicale, assurance, paiement", stageArrivalDesc: "Enregistrement, inscription, titre de séjour, banque",
    stageStudyDesc: "Prolongation, santé, déplacements, stage", stageExitDesc: "Départ, diplômes, comptes, retour",
    myPath: "Mon parcours", checklist: "Ma liste", faqTitle: "FAQ", guideTitle: "Guide de vie",
    newsTitle: "Actualités", countryTitle: "Adaptation pays et religion", reminder: "Rappels d'échéance", dashboard: "Tableau de service",
    profileTitle: "Créez votre profil",
    profileHint: "Utilisé uniquement en local sur votre appareil ; aucun numéro de document collecté.",
    nationality: "Nationalité / région", purpose: "Motif du séjour", duration: "Durée prévue",
    purposeDegree: "Étudiant diplômant", purposeExchange: "Échange inter-universitaire", purposeVisiting: "Chercheur invité",
    purposeShort: "Programme court / école d'été", purposeTransit: "Transit sans visa / affaires",
    durLe180: "Moins de 180 jours", durLt180: "Plus de 180 jours", durLe240: "Moins de 240 heures",
    arrivalDate: "Date d'arrivée", enrollDate: "Date d'inscription", faith: "Religion (facultatif)",
    faithNone: "Préfère ne pas répondre", faithIslam: "Islam", faithBuddhism: "Bouddhisme", faithChristianity: "Christianisme",
    faithHinduism: "Hindouisme", faithJudaism: "Judaïsme", faithNone2: "Sans religion",
    dietNeeds: "Besoins alimentaires (facultatif)", dietHalal: "Halal", dietVegetarian: "Végétarien", dietNoPork: "Sans porc",
    dietNoBeef: "Sans bœuf", dietNoAlcohol: "Sans alcool", dietAllergy: "Allergie alimentaire",
    generate: "Générer mon parcours", regenerate: "Régénérer", reset: "Réinitialiser",
    pathResult: "Votre parcours", pathVisa: "Catégorie de visa / séjour", pathRisk: "Risque clé", pathSteps: "Ordre recommandé",
    keyDeadline: "Échéance clé", deadline: "Échéance", authority: "Autorité", channel: "Où déposer",
    docsNeeded: "Documents", riskTip: "Risque", sourceLabel: "Source", checkedAt: "Vérifié le",
    evidenceLevel: "Niveau de preuve", levelS1: "S1 · Loi / gouvernement", levelS2: "S2 · Publication officielle", levelS3: "S3 · Guide public (à vérifier localement)",
    needReview: "À vérifier localement", aiGenerated: "Généré par IA · à valider par un humain", submitReview: "Demander une validation",
    reviewSent: "Demande créée pour le bureau des étudiants internationaux.",
    markDone: "Marquer fait", done: "Fait", urgent: "Urgent", soon: "Bientôt", later: "À faire",
    exportChecklist: "Exporter la liste", copyLink: "Copier le lien", copied: "Copié",
    askTitle: "Poser une question", askPlaceholder: "Ex. : je loge hors campus — qui enregistre l'adresse et sous quel délai ?",
    askSend: "Envoyer", thinking: "Analyse…", traceTitle: "Trace de raisonnement", confidence: "Confiance",
    matchedKB: "Fiches trouvées", ruleApplied: "Règle appliquée", noAnswer: "Données fiables insuffisantes. Orientation vers un humain.",
    transferHuman: "Contacter le bureau des étudiants internationaux",
    orgTitle: "Console institution · Studio de contenu", orgSub: "Une base de connaissances pour le service étudiant et la production institutionnelle",
    genContent: "Génération de contenu", genTemplate: "Modèle", genCountry: "Pays cible", genLang: "Langue cible",
    genTopic: "Sujet", genDeadline: "Échéance / date", genContact: "Contact", genExtra: "Précisions",
    genRun: "Générer", genPreview: "Aperçu", genTranslate: "Multilingue", genPublish: "Publier aux étudiants",
    genExport: "Exporter HTML", genCopy: "Tout copier", published: "Publié — visible immédiatement.",
    kbManage: "Base de connaissances", kbAdd: "Ajouter", kbTotal: "Fiches", kbS3: "Fiches à vérifier",
    kbLastUpdate: "Dernière mise à jour", kbSave: "Enregistrer", kbSaved: "Enregistré localement.",
    boardConsult: "Top 6 des demandes", boardDeadline: "Répartition des échéances", boardCoverage: "Couverture",
    boardLang: "Production multilingue", boardEfficiency: "Modèle d'efficacité",
    opcTitle: "Tableau de pratique OPC", opcSub: "Démarrage économique · petite équipe · exécution IA · validation rapide · itération continue",
    opcCost: "Structure de coûts", opcHours: "Heures travaillées", opcIter: "Journal des versions", opcRoles: "Rôles",
    measureTitle: "Modèle d'efficacité (base vérifiable)", measureNote: "Chiffres issus d'hypothèses de scénario, non d'un pilote.",
    planA: "Hypothèse A : minutes par demande", planB: "Hypothèse B : demandes par mois", planC: "Taux de réduction",
    calcNow: "Manuel (mois)", calcWith: "Avec l'agent (mois)", calcSaved: "Économie mensuelle",
    disclaimer: "Avertissement et conformité", toolSource: "Outils et sources",
    footerNote: "Cet assistant agrège des informations et guide les démarches ; il ne constitue pas un avis juridique.",
    aiLabelNote: "Les contenus générés par IA sont étiquetés et soumis à validation humaine. Stockage local par défaut.",
    noData: "Aucune donnée", loading: "Chargement…", confirm: "Confirmer", cancel: "Annuler", close: "Fermer",
    viewDetail: "Détails", collapse: "Réduire", expand: "Développer", all: "Tous",
    stage: "Étape", priority: "Priorité", filterStage: "Par étape", filterPri: "Par priorité",
    doneCount: "Fait", totalCount: "Total", items: "éléments", progress: "Progression",
    countryFaith: "Contexte religieux", countryDiet: "Alimentation", countryFest: "Fêtes", countryTips: "Étiquette",
    countryLang: "Langues", countryNote: "L'adaptation pays est une aide à la communication, non une référence religieuse ou juridique.",
    newsPolicy: "Politique", newsCampus: "Campus", newsAll: "Tout",
    quickAsk: "Questions rapides", demoNote: "Mode démo", demoModeNote: "La démo implémente l'agent comme un pipeline explicable : intention + recherche + règles + modèles, avec un adaptateur LLM.",
    flowTitle: "Flux de l'agent (six étapes explicables)",
    flow1: "Intention", flow1d: "Classer la demande",
    flow2: "Profil", flow2d: "Lire votre situation",
    flow3: "Recherche", flow3d: "Récupérer les fiches sourcées",
    flow4: "Règles", flow4d: "Calculer vos dates clés",
    flow5: "Génération", flow5d: "Produire parcours et documents",
    flow6: "Conformité", flow6d: "Étiqueter source et validation",
    statStudents: "Étudiants internationaux en Chine (2024–2025)", statCountries: "Pays et régions",
    statTransit: "Pays éligibles au transit 240 h", statVisaFree: "Pays en exemption unilatérale",
    statUni: "ports ouverts", statCountriesN: "pays et régions"
  },

  es: {
    _label: "Español",
    appName: "Asistente de intercambio con China",
    appSub: "Exchange AI Agent for China",
    tagline: "Un agente de IA multilingüe que cubre todo el ciclo en China: producción de contenido institucional × servicio al estudiante",
    navHome: "Inicio", navStudent: "Estudiante", navOrg: "Institución", navFlow: "Flujo del agente", navData: "Base de evidencia", navAbout: "Acerca de",
    enterStudent: "Portal del estudiante", enterOrg: "Consola institucional", backHome: "Inicio",
    language: "Idioma", theme: "Tema", themeLight: "Claro", themeDark: "Oscuro", print: "Imprimir / PDF",
    student: "Estudiante", org: "Institución",
    heroTitle: "Que cada estancia en China empiece con trámites que funcionan",
    heroSub: "Asistente multilingüe para estudiantes internacionales y visitantes. Trámites dispersos, plazos legales y diferencias culturales convertidos en una ruta ejecutable.",
    heroCta1: "Portal del estudiante", heroCta2: "Consola institucional",
    stages: "Cuatro etapas", stagePre: "Antes de llegar", stageArrival: "A la llegada", stageStudy: "Durante los estudios", stageExit: "Antes de salir",
    stagePreDesc: "Visado, examen médico, seguro, pagos", stageArrivalDesc: "Registro, matrícula, permiso de residencia, banco",
    stageStudyDesc: "Prórroga, salud, viajes, prácticas", stageExitDesc: "Salida, títulos, cuentas, regreso",
    myPath: "Mi ruta", checklist: "Mi lista", faqTitle: "Preguntas frecuentes", guideTitle: "Guía de vida",
    newsTitle: "Novedades", countryTitle: "Adaptación por país y religión", reminder: "Recordatorios", dashboard: "Panel de servicio",
    profileTitle: "Crea tu perfil",
    profileHint: "Solo se usa localmente en tu dispositivo; no se recogen números de documentos.",
    nationality: "Nacionalidad / región", purpose: "Motivo de la estancia", duration: "Duración prevista",
    purposeDegree: "Estudiante de grado", purposeExchange: "Intercambio universitario", purposeVisiting: "Investigador visitante",
    purposeShort: "Programa corto / escuela de verano", purposeTransit: "Tránsito sin visado / negocios",
    durLe180: "Menos de 180 días", durLt180: "Más de 180 días", durLe240: "Menos de 240 horas",
    arrivalDate: "Fecha de llegada", enrollDate: "Fecha de matrícula", faith: "Religión (opcional)",
    faithNone: "Prefiero no decirlo", faithIslam: "Islam", faithBuddhism: "Budismo", faithChristianity: "Cristianismo",
    faithHinduism: "Hinduismo", faithJudaism: "Judaísmo", faithNone2: "Sin religión",
    dietNeeds: "Necesidades alimentarias (opcional)", dietHalal: "Halal", dietVegetarian: "Vegetariano", dietNoPork: "Sin cerdo",
    dietNoBeef: "Sin ternera", dietNoAlcohol: "Sin alcohol", dietAllergy: "Alergia alimentaria",
    generate: "Generar mi ruta", regenerate: "Regenerar", reset: "Restablecer",
    pathResult: "Tu ruta personalizada", pathVisa: "Categoría de visado / estancia", pathRisk: "Riesgo clave", pathSteps: "Orden recomendado",
    keyDeadline: "Plazo clave", deadline: "Plazo", authority: "Autoridad", channel: "Dónde tramitar",
    docsNeeded: "Documentos", riskTip: "Riesgo", sourceLabel: "Fuente", checkedAt: "Verificado el",
    evidenceLevel: "Nivel de evidencia", levelS1: "S1 · Ley / gobierno", levelS2: "S2 · Publicación oficial", levelS3: "S3 · Guía pública (verificar localmente)",
    needReview: "Verificar localmente", aiGenerated: "Generado por IA · pendiente de revisión humana", submitReview: "Solicitar revisión humana",
    reviewSent: "Se creó una solicitud para la oficina de estudiantes internacionales.",
    markDone: "Marcar hecho", done: "Hecho", urgent: "Urgente", soon: "Próximo", later: "Pendiente",
    exportChecklist: "Exportar lista", copyLink: "Copiar enlace", copied: "Copiado",
    askTitle: "Preguntar al agente", askPlaceholder: "Ej.: vivo fuera del campus, ¿quién registra el domicilio y en qué plazo?",
    askSend: "Enviar", thinking: "Analizando…", traceTitle: "Traza de razonamiento", confidence: "Confianza",
    matchedKB: "Fichas encontradas", ruleApplied: "Regla aplicada", noAnswer: "Datos fiables insuficientes. Se sugiere derivar a una persona.",
    transferHuman: "Contactar con la oficina de estudiantes internacionales",
    orgTitle: "Consola institucional · Estudio de contenido", orgSub: "Una base de conocimiento que alimenta el servicio y la producción institucional",
    genContent: "Generación de contenido", genTemplate: "Plantilla", genCountry: "País objetivo", genLang: "Idioma objetivo",
    genTopic: "Tema", genDeadline: "Plazo / fecha", genContact: "Contacto", genExtra: "Requisitos adicionales",
    genRun: "Generar", genPreview: "Vista previa", genTranslate: "Multilingüe", genPublish: "Publicar a estudiantes",
    genExport: "Exportar HTML", genCopy: "Copiar todo", published: "Publicado — visible de inmediato.",
    kbManage: "Base de conocimiento", kbAdd: "Añadir ficha", kbTotal: "Fichas totales", kbS3: "Fichas por verificar",
    kbLastUpdate: "Última actualización", kbSave: "Guardar", kbSaved: "Guardado localmente.",
    boardConsult: "Top 6 de consultas", boardDeadline: "Distribución de plazos", boardCoverage: "Cobertura",
    boardLang: "Producción multilingüe", boardEfficiency: "Modelo de eficiencia",
    opcTitle: "Panel de práctica OPC", opcSub: "Arranque de bajo coste · equipo pequeño · ejecución con IA · validación rápida · iteración continua",
    opcCost: "Estructura de costes", opcHours: "Horas de trabajo", opcIter: "Registro de versiones", opcRoles: "Roles",
    measureTitle: "Modelo de eficiencia (base verificable)", measureNote: "Cifras basadas en hipótesis de escenario, no en datos piloto.",
    planA: "Supuesto A: minutos por consulta", planB: "Supuesto B: consultas al mes", planC: "Tasa de reducción",
    calcNow: "Manual (mes)", calcWith: "Con el agente (mes)", calcSaved: "Ahorro mensual",
    disclaimer: "Aviso y cumplimiento", toolSource: "Herramientas y fuentes",
    footerNote: "Este asistente agrega información y guía trámites; no constituye asesoramiento jurídico.",
    aiLabelNote: "El contenido generado por IA está etiquetado y abierto a revisión humana. Almacenamiento local por defecto.",
    noData: "Sin datos", loading: "Cargando…", confirm: "Confirmar", cancel: "Cancelar", close: "Cerrar",
    viewDetail: "Detalles", collapse: "Contraer", expand: "Expandir", all: "Todos",
    stage: "Etapa", priority: "Prioridad", filterStage: "Por etapa", filterPri: "Por prioridad",
    doneCount: "Hecho", totalCount: "Total", items: "elementos", progress: "Progreso",
    countryFaith: "Contexto religioso", countryDiet: "Alimentación", countryFest: "Fiestas", countryTips: "Etiqueta",
    countryLang: "Idiomas", countryNote: "La adaptación por país es una ayuda de comunicación, no una referencia religiosa o jurídica.",
    newsPolicy: "Política", newsCampus: "Campus", newsAll: "Todo",
    quickAsk: "Preguntas rápidas", demoNote: "Modo demo", demoModeNote: "La demo implementa el agente como un pipeline explicable: intención + recuperación + reglas + plantillas, con adaptador LLM.",
    flowTitle: "Flujo del agente (seis pasos explicables)",
    flow1: "Intención", flow1d: "Clasificar la tarea",
    flow2: "Perfil", flow2d: "Leer tu situación",
    flow3: "Recuperación", flow3d: "Recuperar fichas con fuente",
    flow4: "Reglas", flow4d: "Calcular tus fechas clave",
    flow5: "Generación", flow5d: "Producir ruta y documentos",
    flow6: "Cumplimiento", flow6d: "Etiquetar fuente y revisión",
    statStudents: "Estudiantes internacionales en China (2024–2025)", statCountries: "Países y regiones",
    statTransit: "Países elegibles para tránsito 240 h", statVisaFree: "Países con exención unilateral",
    statUni: "puertos abiertos", statCountriesN: "países y regiones"
  }
};

var current = "zh";

function t(key) {
  var pack = I18N[current] || I18N.zh;
  if (pack[key] !== undefined) return pack[key];
  if (I18N.zh[key] !== undefined) return I18N.zh[key];
  return key;
}

function setLang(code) { if (I18N[code]) current = code; }
function getLang() { return current; }

var DIRS = { zh: "ltr", en: "ltr", ru: "ltr", ar: "rtl", fr: "ltr", es: "ltr" };
function dir(code) { return DIRS[code || current] || "ltr"; }
function isRTL(code) { return dir(code) === "rtl"; }

module.exports = { I18N: I18N, t: t, setLang: setLang, getLang: getLang, dir: dir, isRTL: isRTL, DIRS: DIRS };

  });
  /* ==== 模块 md.js（内容与 08_小程序/utils/md.js 逐字节相同） ==== */
  __def('md', function (module, exports, require) {
// utils/md.js — 极简 Markdown → rich-text HTML
// 只覆盖本作品实际生成的语法：标题(##/###)、有序/无序列表、粗体、分隔线、段落。
// 输出内联样式（小程序 rich-text 不支持外部 class）。

function inline(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<span style="font-weight:700;color:#0A1F3C">$1</span>')
    .replace(/`([^`]+)`/g, '<span style="font-family:Consolas,monospace;background:#F1F5F9;padding:0 4px;border-radius:3px">$1</span>');
}

function toHtml(md) {
  const lines = String(md || '').split(/\r?\n/);
  const out = [];
  let listOpen = false;

  const closeList = () => { if (listOpen) { out.push('</div>'); listOpen = false; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\s+$/, '');
    const t = line.trim();

    if (!t) { closeList(); continue; }

    if (/^-{3,}$/.test(t)) {
      closeList();
      out.push('<div style="height:1px;background:#E1E8F1;margin:12px 0"></div>');
      continue;
    }

    let m;
    if ((m = t.match(/^####\s+(.*)$/))) {
      closeList();
      out.push('<div style="font-size:15px;font-weight:700;color:#26374F;margin:12px 0 4px">' + inline(m[1]) + '</div>');
      continue;
    }
    if ((m = t.match(/^###\s+(.*)$/))) {
      closeList();
      out.push('<div style="font-size:16px;font-weight:700;color:#123A6B;margin:14px 0 6px">' + inline(m[1]) + '</div>');
      continue;
    }
    if ((m = t.match(/^##\s+(.*)$/))) {
      closeList();
      out.push('<div style="font-size:18px;font-weight:800;color:#0A1F3C;margin:6px 0 10px;padding-bottom:6px;border-bottom:1px solid #E1E8F1">' + inline(m[1]) + '</div>');
      continue;
    }
    if ((m = t.match(/^#\s+(.*)$/))) {
      closeList();
      out.push('<div style="font-size:20px;font-weight:800;color:#0A1F3C;margin:6px 0 10px">' + inline(m[1]) + '</div>');
      continue;
    }

    if ((m = t.match(/^[-*]\s+(.*)$/))) {
      if (!listOpen) { out.push('<div style="margin:6px 0">'); listOpen = true; }
      out.push('<div style="display:flex;margin:4px 0;line-height:1.7"><span style="color:#1F66B0;font-weight:700;margin-right:6px">·</span><span style="flex:1">' + inline(m[1]) + '</span></div>');
      continue;
    }
    if ((m = t.match(/^(\d+)[.、]\s+(.*)$/))) {
      if (!listOpen) { out.push('<div style="margin:6px 0">'); listOpen = true; }
      out.push('<div style="display:flex;margin:4px 0;line-height:1.7"><span style="color:#174E8C;font-weight:700;margin-right:6px">' + m[1] + '.</span><span style="flex:1">' + inline(m[2]) + '</span></div>');
      continue;
    }

    closeList();
    out.push('<div style="margin:8px 0;line-height:1.75;color:#26374F">' + inline(t) + '</div>');
  }
  closeList();
  return out.join('');
}

module.exports = { toHtml: toHtml };

  });
  /* ==== 模块 agent.js（内容与 08_小程序/utils/agent.js 逐字节相同） ==== */
  __def('agent', function (module, exports, require) {
/* 由网页端 assets/js/agent.js 机械移植：window.Agent -> module.exports，
   window.KB -> require('./kb.js')，window.L10N -> require('./i18n.js')。
   六步 Agent 流水线逻辑零改动。 */
var KB = require('./kb.js');
var I18N = require('./i18n.js');
/* =========================================================================
   来华交流全程助手 · Agent 能力层 v2.0
   ---------------------------------------------------------------------------
   架构（可解释、可复核、可替换）：
     接入层  → 意图识别 Intent
     画像层  → 画像读取 Profile
     知识层  → 知识检索 Retrieval（来源锚定，无来源不入库）
     规则层  → 规则判定 Rule Engine（法定时限 → 你的关键日期）
     生成层  → 内容生成 Generation（路径 / 清单 / 多语种材料）
     合规层  → 合规复核 Compliance（证据等级 + AI 标识 + 人工复核入口）
   说明：本演示版将"Agent 能力"实现为可解释流水线；接口层预留大模型接入点
        （Agent.LLM_ADAPTER），替换实现不影响上层调用。
   ========================================================================= */

module.exports = (function () {
  "use strict";

  var LLM_ADAPTER = null; /* 预留：接入大模型时注入 { complete: function(prompt){ return Promise } } */

  /* ================= 1. 意图识别 ================= */
  var INTENTS = [
    { id: "register", kw: ["住宿登记", "登记", "报备", "派出所", "24小时", "24 小时", "留宿", "register", "accommodation", "police", "address"], matter: "arr_reg24" },
    { id: "residence", kw: ["居留许可", "居留", "签证延期", "延期", "续签", "30天", "residence permit", "extend", "visa"], matter: "stu_renew" },
    { id: "enroll", kw: ["报到", "注册", "入学", "新生", "学生证", "enrol", "register at", "student card"], matter: "arr_school" },
    { id: "medical", kw: ["体检", "医疗", "就医", "医院", "看病", "医保", "medical", "hospital", "doctor", "health"], matter: "stu_medical" },
    { id: "insurance", kw: ["保险", "理赔", "insurance", "claim"], matter: "pre_insurance" },
    { id: "payment", kw: ["支付", "银行卡", "开户", "汇款", "绑定", "扫码", "payment", "bank", "card", "remittance"], matter: "arr_bank" },
    { id: "sim", kw: ["手机号", "电话卡", "sim", "漫游", "esim", "网络"], matter: "arr_sim" },
    { id: "work", kw: ["实习", "兼职", "打工", "勤工", "就业", "intern", "part-time", "work permit", "job"], matter: "stu_intern" },
    { id: "faith", kw: ["宗教", "信仰", "清真寺", "礼拜", "religion", "faith", "mosque", "prayer", "church", "temple"], matter: "stu_faith" },
    { id: "diet", kw: ["饮食", "吃", "清真", "素食", "过敏", "餐厅", "食堂", "food", "diet", "halal", "vegetarian", "allergy"], matter: "stu_diet" },
    { id: "psych", kw: ["心理", "情绪", "焦虑", "孤独", "适应", "咨询", "mental", "anxiety", "lonely", "counsel"], matter: "stu_psych" },
    { id: "lostpass", kw: ["护照丢", "遗失", "被盗", "报案", "lost passport", "stolen", "report"], matter: "stu_lostpass" },
    { id: "travel", kw: ["火车", "机票", "出行", "旅游", "交通", "travel", "train", "flight", "ticket"], matter: "stu_travel" },
    { id: "exit", kw: ["离校", "退宿", "离境", "毕业", "证书", "成绩单", "认证", "graduation", "departure", "transcript", "diploma"], matter: "exi_prepare" },
    { id: "visa_apply", kw: ["签证", "x1", "x2", "jw201", "jw202", "邀请函", "visa", "invitation"], matter: "pre_visa" },
    { id: "transit", kw: ["过境免签", "240", "免签", "transit", "visa-free"], matter: "arr_reg24" },
    { id: "change", kw: ["变更", "换护照", "地址变更", "转学", "change", "new passport"], matter: "stu_change" },
    { id: "emergency", kw: ["紧急", "报警", "急救", "110", "120", "emergency", "urgent"], matter: "arr_safety" },
    { id: "safety", kw: ["安全", "注意", "防骗", "诈骗", "safety", "fraud", "scam"], matter: "arr_safety" }
  ];

  function classify(text) {
    var q = (text || "").toLowerCase().trim();
    if (!q) return { intent: "unknown", score: 0, hits: [] };
    var best = { intent: "unknown", score: 0, hits: [], matter: null };
    INTENTS.forEach(function (it) {
      var hits = it.kw.filter(function (k) { return q.indexOf(k.toLowerCase()) >= 0; });
      var s = hits.length;
      /* 长关键词加权，避免"吃"这类单字误命中 */
      hits.forEach(function (h) { if (h.length >= 4) s += 0.8; });
      if (s > best.score) best = { intent: it.id, score: s, hits: hits, matter: it.matter };
    });
    /* 程序性提问兜底 */
    if (best.score === 0) {
      var proc = ["怎么办", "怎么", "如何", "需要", "多久", "什么时候", "材料", "流程", "how", "what", "when", "need", "process"];
      if (proc.some(function (k) { return q.indexOf(k) >= 0; })) best.intent = "procedure";
    }
    return best;
  }

  /* ================= 2. 知识检索（来源锚定的轻量打分） ================= */
  function bigrams(s) {
    s = (s || "").replace(/[\s，。、？：；（）()「」"'"',.!?;:\[\]]/g, "").toLowerCase();
    var out = [];
    for (var i = 0; i < s.length - 1; i++) out.push(s.substr(i, 2));
    return out;
  }
  function score(query, doc) {
    var qb = bigrams(query), db = bigrams(doc);
    if (!qb.length || !db.length) return 0;
    var dset = {};
    db.forEach(function (b) { dset[b] = (dset[b] || 0) + 1; });
    var hit = 0;
    qb.forEach(function (b) { if (dset[b]) hit++; });
    var norm = Math.sqrt(qb.length * db.length) || 1;
    return hit / norm;
  }
  function retrieve(query, topK) {
    topK = topK || 4;
    var pool = [];
    KB.MATTERS.forEach(function (m) {
      var doc = [m.title, m.summary, (m.docs || []).join(" "), m.risk, m.channel].join(" ");
      pool.push({ type: "matter", id: m.id, item: m, s: score(query, doc) });
    });
    KB.FAQ.forEach(function (f, i) {
      pool.push({ type: "faq", id: "faq" + i, item: f, s: score(query, f.q + " " + f.a) });
    });
    pool.sort(function (a, b) { return b.s - a.s; });
    return pool.filter(function (p) { return p.s > 0.055; }).slice(0, topK);
  }

  /* ================= 3. 画像与路径判定 ================= */
  var DEFAULT_PROFILE = {
    country: "PK", purpose: "degree", duration: "lt180",
    arrival: "", enroll: "", faith: "none", diet: []
  };

  function decidePath(p) {
    var best = null;
    KB.PATHS.forEach(function (pa) {
      var m = pa.match;
      var okP = !m.purposes || m.purposes.indexOf(p.purpose) >= 0;
      var okD = !m.durations || m.durations.indexOf(p.duration) >= 0;
      var sc = (okP ? 2 : 0) + (okD ? 1 : 0);
      if (okP && okD && (!best || sc > best.sc)) best = { path: pa, sc: sc };
    });
    return best ? best.path : KB.PATHS[KB.PATHS.length - 1];
  }

  /* ================= 4. 规则判定：法定时限 → 你的关键日期 ================= */
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function addHours(d, n) { var x = new Date(d.getTime()); x.setHours(x.getHours() + n); return x; }
  function fmt(d) {
    if (!d) return "—";
    var y = d.getFullYear(), m = ("0" + (d.getMonth() + 1)).slice(-2), dd = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + dd;
  }
  function computeDeadline(m, p) {
    var base = null;
    if (m.deadline.from === "arrival" && p.arrival) base = new Date(p.arrival + "T09:00:00");
    if (m.deadline.from === "enroll" && p.enroll) base = new Date(p.enroll + "T09:00:00");
    var d = null, kind = m.deadline.kind;
    if (base && kind === "hours") d = addHours(base, m.deadline.value);
    if (base && kind === "days" && m.deadline.value >= 0) d = addDays(base, m.deadline.value);
    var urgency = "later", days = null;
    if (d) {
      days = Math.round((d - new Date()) / 86400000);
      urgency = days <= 3 ? "urgent" : (days <= 30 ? "soon" : "later");
    } else if (kind === "days" && m.deadline.value < 0) {
      urgency = "later"; /* 相对到期日的提醒，需用户提供到期日才能计算 */
    }
    return { date: d, dateStr: d ? fmt(d) : "", urgency: urgency, days: days, label: m.deadline.label };
  }

  function buildChecklist(p) {
    var path = decidePath(p);
    var ids = path.steps.slice();
    /* 依据画像补充事项 */
    if (p.duration === "lt180") ids.push("pre_physical");
    if (p.purpose === "short" || p.purpose === "transit") { /* 短期：去掉长期类事项 */ }
    if (p.diet && p.diet.length) ids.push("stu_diet");
    if (p.faith && p.faith !== "none" && p.faith !== "none2") ids.push("stu_faith");
    if (p.country) ids.push("stu_diet");
    /* 去重保序 */
    var seen = {}, list = [];
    ids.forEach(function (id) { if (!seen[id]) { seen[id] = 1; var m = KB.matter(id); if (m) list.push(m); } });
    return list.map(function (m) {
      return { matter: m, deadline: computeDeadline(m, p), done: false };
    }).sort(function (a, b) {
      var rank = { P0: 0, P1: 1, P2: 2 };
      var ra = rank[a.matter.pri], rb = rank[b.matter.pri];
      if (ra !== rb) return ra - rb;
      return (a.deadline.date ? a.deadline.date.getTime() : Infinity) - (b.deadline.date ? b.deadline.date.getTime() : Infinity);
    });
  }

  /* ================= 5. 内容生成 ================= */
  function t(key) { return I18N.t(key); }

  function matterText(m, lang) {
    var zh = lang === "zh";
    return {
      title: zh ? m.title : (m.title_en || m.title),
      summary: zh ? m.summary : (m.summary_en || m.summary)
    };
  }

  function srcLine(keys) {
    return KB.sources(keys).map(function (s) {
      return s.name + " · " + s.org + (s.url ? "（" + s.url + "）" : "") + " · " + t("checkedAt") + " " + s.checked + " · " + s.level;
    });
  }

  /* 生成结构化材料（机构端与学生端共用） */
  function renderMaterial(cfg) {
    var lang = cfg.lang || "zh";
    var isZh = lang === "zh";
    var tpl = null;
    KB.TEMPLATES.forEach(function (x) { if (x.id === cfg.template) tpl = x; });
    if (!tpl) tpl = KB.TEMPLATES[0];
    var c = KB.COUNTRY[cfg.country] || KB.COUNTRY.OTHER;
    var L = {
      zh: { head: "标题", sec: "章节", src: "依据来源", note: "本材料由机构端内容工作台生成，AI 生成内容需人工复核后发布。", country: "国别适配提示", deadline: "时限", contact: "联系方式", topic: "事项", cf: "宗教背景", cd: "饮食要点", cfe: "主要节日", cl: "常用语言", ct: "沟通与礼仪提示" },
      en: { head: "Title", sec: "Sections", src: "Sources", note: "Generated by the institution content studio. AI output requires human review before release.", country: "Country adaptation", deadline: "Deadline", contact: "Contact", topic: "Topic", cf: "Religious background", cd: "Dietary notes", cfe: "Main festivals", cl: "Common languages", ct: "Communication & etiquette" },
      ru: { head: "Заголовок", sec: "Разделы", src: "Источники", note: "Создано студией контента. Требуется проверка человеком.", country: "Адаптация по стране", deadline: "Срок", contact: "Контакты", topic: "Тема", cf: "Религиозный фон", cd: "Питание", cfe: "Праздники", cl: "Языки", ct: "Этикет" },
      ar: { head: "العنوان", sec: "الأقسام", src: "المصادر", note: "أُنشئ في استوديو المحتوى. يتطلب مراجعة بشرية.", country: "التوافق الثقافي", deadline: "الموعد", contact: "التواصل", topic: "الموضوع", cf: "الخلفية الدينية", cd: "ملاحظات غذائية", cfe: "الأعياد", cl: "اللغات", ct: "الآداب" },
      fr: { head: "Titre", sec: "Sections", src: "Sources", note: "Généré par le studio de contenu. Validation humaine requise.", country: "Adaptation pays", deadline: "Échéance", contact: "Contact", topic: "Sujet", cf: "Contexte religieux", cd: "Alimentation", cfe: "Fêtes", cl: "Langues", ct: "Étiquette" },
      es: { head: "Título", sec: "Secciones", src: "Fuentes", note: "Generado por el estudio de contenido. Requiere revisión humana.", country: "Adaptación por país", deadline: "Plazo", contact: "Contacto", topic: "Tema", cf: "Contexto religioso", cd: "Alimentación", cfe: "Fiestas", cl: "Idiomas", ct: "Etiqueta" }
    }[lang] || null;
    if (!L) L = { head: "Title", sec: "Sections", src: "Sources", note: "", country: "Country adaptation", deadline: "Deadline", contact: "Contact", topic: "Topic", cf: "Religious background", cd: "Dietary notes", cfe: "Main festivals", cl: "Common languages", ct: "Communication & etiquette" };
    var secs = isZh ? tpl.sections : (tpl.sections_en || tpl.sections);

    var title = (cfg.topic || tpl.name) + (cfg.country && cfg.country !== "OTHER" ? " · " + (isZh ? c.zh : c.en) : "");
    var body = [];
    body.push("## " + title);
    if (cfg.deadline) body.push("**" + L.deadline + "**：" + cfg.deadline);
    body.push("");
    body.push("### " + (isZh ? "一、事项说明" : "1. " + L.topic));
    body.push(isZh
      ? "本材料面向" + (isZh ? c.zh : c.en) + "籍" + (cfg.audience || "国际学生") + "，就「" + (cfg.topic || tpl.name) + "」事项提供办理指引。所有信息来源于官方渠道，标注证据等级与核对日期。"
      : "This material provides procedural guidance on \"" + (cfg.topic || tpl.name) + "\" for students from " + c.en + ". All information is drawn from official channels with evidence levels and verification dates.");
    body.push("");
    body.push("### " + (isZh ? "二、办理要点" : "2. " + (lang === "zh" ? "" : "Key steps")));
    secs.forEach(function (s, i) { body.push((i + 1) + ". " + s + (isZh ? "：请按学校与主管部门最新要求办理，并保留办理凭证。" : ": follow the latest requirements and keep your receipts.")); });
    if (c.diet || c.fest) {
      body.push("");
      body.push("### " + (isZh ? "三、" : "3. ") + L.country);
      body.push("- " + L.cf + "：" + (isZh ? c.faith : c.faith_en || c.faith));
      body.push("- " + L.cd + "：" + (isZh ? c.diet : c.diet_en || c.diet));
      if (c.fest && c.fest.length) body.push("- " + L.cfe + "：" + (isZh ? c.fest.join("、") : (c.fest_en || c.fest).join(", ")));
      if (c.lang) body.push("- " + L.cl + "：" + c.lang);
      (c.tips_en && !isZh ? c.tips_en : (c.tips || [])).forEach(function (x) { body.push("- " + x); });
      body.push("");
      body.push("> " + (isZh ? "国别适配为跨文化沟通提示，不构成宗教或法律依据，请尊重个体差异。" : "Country adaptation is a cross-cultural communication aid, not a religious or legal reference. Respect individual differences."));
    }
    if (cfg.extra) { body.push(""); body.push("### " + (isZh ? "四、补充要求" : "4. Additional")); body.push(cfg.extra); }
    if (cfg.contact) { body.push(""); body.push("**" + L.contact + "**：" + cfg.contact); }
    body.push("");
    body.push("---");
    body.push("> " + L.note);
    body.push("> " + t("footerNote"));

    var srcs = ["school", "nia_platform", "law_exit"];
    return {
      title: title, markdown: body.join("\n"),
      sources: srcLine(srcs),
      aiLabel: lang === "zh" || lang === "en" ? t("aiGenerated") : t("aiGenerated") + " / machine-translated",
      needsHuman: true, lang: lang, template: tpl.name
    };
  }

  /* 多语种术语表（用于"一键多语种"的演示：结构多语种 + 关键术语映射） */
  var GLOSSARY = {
    "住宿登记": { en: "accommodation registration", ru: "регистрация адреса", ar: "تسجيل العنوان", fr: "enregistrement du domicile", es: "registro de domicilio" },
    "居留许可": { en: "residence permit", ru: "вид на жительство", ar: "تصريح الإقامة", fr: "titre de séjour", es: "permiso de residencia" },
    "签证": { en: "visa", ru: "виза", ar: "تأشيرة", fr: "visa", es: "visado" },
    "报到注册": { en: "enrolment", ru: "зачисление", ar: "التسجيل الجامعي", fr: "inscription", es: "matrícula" },
    "体检": { en: "medical examination", ru: "медосмотр", ar: "الفحص الطبي", fr: "visite médicale", es: "examen médico" },
    "保险": { en: "insurance", ru: "страховка", ar: "تأمين", fr: "assurance", es: "seguro" },
    "办理时限": { en: "processing deadline", ru: "срок оформления", ar: "الموعد النهائي", fr: "délai de traitement", es: "plazo de tramitación" },
    "所需材料": { en: "required documents", ru: "необходимые документы", ar: "المستندات المطلوبة", fr: "documents requis", es: "documentos requeridos" },
    "紧急联系": { en: "emergency contact", ru: "экстренный контакт", ar: "جهة اتصال للطوارئ", fr: "contact d'urgence", es: "contacto de emergencia" }
  };
  function glossaryTranslate(text, lang) {
    var out = text;
    Object.keys(GLOSSARY).forEach(function (k) {
      if (out.indexOf(k) >= 0 && GLOSSARY[k][lang]) out = out.split(k).join(GLOSSARY[k][lang]);
    });
    return out;
  }

  /* ================= 6. 问答（含推理轨迹） ================= */
  function buildAnswer(query, profile, lang, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    var p = profile || DEFAULT_PROFILE;

    /* 步骤 1 意图识别 */
    var cls = classify(query);
    push(1, t("flow1"), cls.intent === "unknown" ? "未识别明确意图，转入通用检索" : ("intent=" + cls.intent + "，命中关键词 " + cls.hits.join(" / ")));

    /* 步骤 2 画像读取 */
    var c = KB.COUNTRY[p.country] || KB.COUNTRY.OTHER;
    push(2, t("flow2"), "purpose=" + p.purpose + "；duration=" + p.duration + "；country=" + c.zh + (p.arrival ? "；arrival=" + p.arrival : ""));

    /* 步骤 3 知识检索 */
    var hits = retrieve(query, 4);
    push(3, t("flow3"), hits.length ? hits.map(function (h) { return (h.type === "matter" ? h.item.title : h.item.q).slice(0, 22) + "(" + h.s.toFixed(3) + ")"; }).join("；") : "无命中条目");

    /* 步骤 4 规则判定 */
    var ruleNote = "—";
    if (hits.length && hits[0].type === "matter") {
      var dl = computeDeadline(hits[0].item, p);
      ruleNote = hits[0].item.deadline.label + (dl.dateStr ? "（按你的抵达日推算：" + dl.dateStr + "）" : "");
    } else if (hits.length) {
      ruleNote = "按 FAQ 条目直接答复，未触发时限规则";
    }
    push(4, t("flow4"), ruleNote);

    /* 步骤 5 内容生成 */
    var blocks = [], srcKeys = [], needReview = false, conf = 0;
    if (!hits.length) {
      blocks.push("<p>" + t("noAnswer") + "</p>");
      blocks.push('<p><a class="btn btn-sm btn-ghost" href="#review">' + t("transferHuman") + "</a></p>");
    } else {
      hits.slice(0, 3).forEach(function (h) {
        var it = h.item;
        if (h.type === "matter") {
          var mt = matterText(it, lang);
          var dl = computeDeadline(it, p);
          var badge = it.source.indexOf("school") >= 0 || it.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; }) ? '<span class="badge-src src-S3">' + t("needReview") + "</span>" : '<span class="badge-src src-S1">S1</span>';
          blocks.push(
            '<div style="margin-bottom:14px"><div class="row-between" style="gap:10px;align-items:flex-start">' +
            "<div><strong>" + mt.title + "</strong></div>" + badge + "</div>" +
            '<p class="small" style="margin:6px 0 0">' + mt.summary + "</p>" +
            (dl.dateStr ? '<p class="small muted" style="margin:6px 0 0">' + t("keyDeadline") + "：" + dl.dateStr + "（" + it.deadline.label + "）</p>" : '<p class="small muted" style="margin:6px 0 0">' + t("deadline") + "：" + it.deadline.label + "</p>") +
            '<p class="tiny muted" style="margin:6px 0 0">' + t("sourceLabel") + "：" + KB.sources(it.source).map(function (s) { return s.name; }).join("；") + "</p>" +
            "</div>"
          );
          it.source.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
          if (it.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; })) needReview = true;
        } else {
          blocks.push('<div style="margin-bottom:14px"><div><strong>' + it.q + "</strong></div><p class=\"small\" style=\"margin:6px 0 0\">" + it.a + "</p>" +
            '<p class="tiny muted" style="margin:6px 0 0">' + t("sourceLabel") + "：" + KB.sources(it.src).map(function (s) { return s.name; }).join("；") + "</p></div>");
          it.src.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
          if (it.level === "S3") needReview = true;
        }
      });
      conf = Math.min(0.95, 0.55 + hits[0].s * 2.2);
    }
    push(5, t("flow5"), "生成 " + blocks.length + " 个回答区块；来源 " + srcKeys.length + " 条");

    /* 步骤 6 合规复核 */
    push(6, t("flow6"), "证据等级 " + (needReview ? "含 S3（待属地复核）" : "S1/S2") + "；AI 生成标识已附加" + (needReview ? "；建议人工复核" : ""));

    var html = blocks.join("");
    html += '<div class="trace"><div class="trace-line"><span class="k">' + t("confidence") + '</span><span>' + (conf ? (conf * 100).toFixed(0) + "%" : "—") + "</span></div>";
    html += '<div class="trace-line"><span class="k">' + t("evidenceLevel") + '</span><span>' + (needReview ? t("levelS3") : t("levelS1")) + "</span></div>";
    html += '<div class="trace-line"><span class="k">' + t("checkedAt") + '</span><span>' + KB.META.updated + "</span></div></div>";
    html += '<div class="sugg"><span class="ai-tag">' + t("aiGenerated") + "</span>" +
      '<button class="btn btn-sm btn-ghost" data-action="review">' + t("submitReview") + "</button></div>";

    if (lang !== "zh") html = glossaryTranslate(html, lang);

    return { steps: steps, html: html, sources: KB.sources(srcKeys), needReview: needReview, confidence: conf };
  }

  /* 模拟逐步推理（用于演示动效） */
  function askAsync(query, profile, lang, onStep) {
    return new Promise(function (resolve) {
      var result = buildAnswer(query, profile, lang, onStep);
      resolve(result);
    });
  }

  /* ================= 7. 效率测算（可核查口径） ================= */
  function efficiencyModel(a) {
    a = a || {};
    var minPerCase = a.minPerCase || 12;      /* 单次咨询人工耗时（分钟） */
    var cases = a.cases || 260;               /* 每月重复咨询量（次） */
    var cut = a.cut || 0.55;                  /* 可自助解决比例 */
    var hourly = a.hourly || 60;              /* 综合人力成本（元/小时，含社保与间接成本） */
    var manualH = cases * minPerCase / 60;
    var agentH = cases * (1 - cut) * minPerCase / 60 + cases * 0.6 / 60; /* 剩余人工 + 复核抽检 */
    return {
      manualHours: manualH, agentHours: agentH, savedHours: manualH - agentH,
      manualCost: manualH * hourly, agentCost: agentH * hourly, savedCost: (manualH - agentH) * hourly,
      cut: cut, cases: cases, minPerCase: minPerCase, hourly: hourly
    };
  }

  return {
    classify: classify, retrieve: retrieve, decidePath: decidePath,
    computeDeadline: computeDeadline, buildChecklist: buildChecklist,
    renderMaterial: renderMaterial, askAsync: askAsync, buildAnswer: buildAnswer,
    glossaryTranslate: glossaryTranslate, efficiencyModel: efficiencyModel,
    DEFAULT_PROFILE: DEFAULT_PROFILE, LLM_ADAPTER: LLM_ADAPTER, fmt: fmt, srcLine: srcLine
  };
})();

  });

  /* ---- 统一出口---- */
  var K = {
    KB: null, I18N: null, Agent: null, MD: null, ready: false, error: null
  };

  /* ---- 页面层快捷方法：直接代理到 I18N，避免每页重复写 ==== */

  /** 取当前语种的词条 */
  K.t = function (key) { return K.I18N.t(key); };

  /** 切换语种 */
  K.setLang = function (code) { return K.I18N.setLang(code); };

  /** 取当前语种 */
  K.getLang = function () { return K.I18N.getLang(); };

  /** 取当前语种书写方向（ltr / rtl） */
  K.dir = function () { return K.I18N.dir(K.I18N.getLang()); };

  /** 该语种是否为从右往左书写 */
  K.isRTL = function () { return K.I18N.isRTL(K.I18N.getLang()); };

  K.boot = function (done) {
    try {
      K.KB = __require("./kb.js");
      K.I18N = __require("./i18n.js");
      K.MD = __require("./md.js");
      K.Agent = __require("./agent.js");
      K.ready = true;
      global.KB = K.KB;
      global.I18N = K.I18N;
      global.Agent = K.Agent;
      global.MD = K.MD;
    } catch (e) {
      K.error = e;
      console.error("[kernel] 加载失败", e);
    }
    if (typeof done === "function") done(K);
    return K;
  };

  global.K = K;
})(window);
