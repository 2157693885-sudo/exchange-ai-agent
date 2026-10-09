/* =========================================================================
   来华交流全程助手 · 知识层 KB v2.0
   ---------------------------------------------------------------------------
   入库规则（与产品内"来源锚定"机制一致）：
     1) 每条事项必须携带 source（机构名 + 官方渠道入口 + 证据等级 + 核对日期）
     2) 证据等级 S1＝法规/政府一手；S2＝权威媒体/官方发布转载；S3＝公开办事指引（需属地复核）
     3) 无来源不入库；S3 级事项在产品内一律显示"待属地复核"提示
     4) 内容不构成法律意见，仅作信息聚合与流程引导
   ========================================================================= */

window.KB = (function () {
  "use strict";

  var META = {
    version: "2.0.0",
    updated: "2026-09-26",
    owner: "来华交流全程助手 · 知识运营（机构端可维护）",
    disclaimer:
      "本助手提供信息聚合与流程引导，不构成法律意见。具体办理要求以属地主管部门与所在学校最新公布为准。所有 AI 生成内容均标注待人工复核。",
    disclaimer_en: "This assistant aggregates information and guides you through procedures; it does not constitute legal advice. Always follow the latest requirements published by the competent local authorities and your host institution. All AI-generated content is marked for human review before publication.",
    disclaimer_en: "This assistant aggregates information and guides you through procedures; it does not constitute legal advice. Always follow the latest requirements published by the competent local authorities and your host institution. All AI-generated content is marked for human review before publication.",
    channels: [
      { name: "国家移民管理局政务服务平台", url: "https://s.nia.gov.cn/", name_en: "National Immigration Administration Service Platform", note: "住宿登记、签证证件、停留居留业务线上入口", note_en: "Online entry for accommodation registration, visa/residence documents and stay services" },
      { name: "国家移民管理局 12367 服务平台", url: "https://www.nia.gov.cn/", name_en: "NIA 12367 Service Platform", note: "出入境政策咨询（电话 12367）", note_en: "Entry-exit policy enquiries (hotline 12367)" },
      { name: "国家留学网（国家留学基金管理委员会）", url: "https://www.csc.edu.cn/", name_en: "China Scholarship Council (CSC)", note: "中国政府奖学金、来华留学项目管理", note_en: "Chinese Government Scholarship and study-in-China programme administration" },
      { name: "中华人民共和国教育部", url: "http://www.moe.gov.cn/", name_en: "Ministry of Education of the PRC", note: "来华留学政策与规范", note_en: "Study-in-China policies and regulations" },
      { name: "中国人大网 · 法律法规数据库", url: "http://www.npc.gov.cn/", name_en: "NPC Website - Laws and Regulations Database", note: "《出境入境管理法》等法律原文", note_en: "Full texts of laws such as the Exit and Entry Administration Law" },
      { name: "中国政府网", url: "https://www.gov.cn/", name_en: "The State Council of the PRC (gov.cn)", note: "国务院政策文件与便民服务", note_en: "State Council policy documents and public services" }
    ]
  };

  /* ---------- 证据来源 ---------- */
  var SRC = {
    law_exit: { name: "《中华人民共和国出境入境管理法》", name_en: "Exit and Entry Administration Law of the PRC", org: "全国人大常委会", org_en: "Standing Committee of the National People's Congress", url: "http://www.npc.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_platform: { name: "国家移民管理局政务服务平台 · 外国人服务", name_en: "NIA Service Platform - Foreigner Services", org: "国家移民管理局", org_en: "National Immigration Administration", url: "https://s.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_12367: { name: "国家移民管理局 12367 服务平台", name_en: "NIA 12367 Service Platform", org: "国家移民管理局", org_en: "National Immigration Administration", url: "https://www.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_visa: { name: "外国人签证证件办理指南", name_en: "Guidance on Foreigner Visa and Stay Documents", org: "国家移民管理局", org_en: "National Immigration Administration", url: "https://s.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    nia_240: { name: "240 小时过境免签政策", name_en: "240-hour visa-free transit policy", org: "国家移民管理局", org_en: "National Immigration Administration", url: "https://www.nia.gov.cn/", level: "S1", checked: "2026-09-26" },
    csc: { name: "国家留学网 · 来华留学", name_en: "China Scholarship Council - Study in China", org: "国家留学基金管理委员会", org_en: "China Scholarship Council", url: "https://www.csc.edu.cn/", level: "S1", checked: "2026-09-26" },
    moe: { name: "教育部 · 来华留学相关规范", name_en: "Ministry of Education - study-in-China regulations", org: "教育部", org_en: "Ministry of Education", url: "http://www.moe.gov.cn/", level: "S1", checked: "2026-09-26" },
    school: { name: "所在高校国际学生办公室办事指引", name_en: "Your host university's International Student Office procedures", org: "所在高校", org_en: "Your university", url: "", level: "S3", checked: "2026-09-26", note: "由机构端在「知识库维护」中录入本校口径" },
    custom: { name: "海关总署 · 进出境旅客通关指南", name_en: "General Administration of Customs - traveller clearance guide", org: "海关总署", org_en: "General Administration of Customs", url: "https://www.customs.gov.cn/", level: "S1", checked: "2026-09-26" },
    bank: { name: "中国人民银行 · 境外来华人员支付服务指引", name_en: "People's Bank of China - payment guide for foreign visitors", org: "中国人民银行", org_en: "People's Bank of China", url: "https://www.pbc.gov.cn/", level: "S1", checked: "2026-09-26" }
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
      deadline: { kind: "none", from: "none", label: "建议出发前 60–90 天启动", label_en: "Start 60-90 days before departure" },
      docs: ["有效护照（剩余有效期建议 6 个月以上，含空白签证页）", "院校录取通知书 / 邀请函", "JW201 或 JW202 表（学习类，由学校提供）", "签证申请表与照片", "按类别要求的资金、学历、体检等附加材料"],
      channel: "向中国驻当地使领馆或签证申请服务中心递交；部分类别需先由学校完成备案。",
      risk: "签证类别与实际事由不符，可能在入境查验或后续居留许可环节被要求补正甚至不予办理。",
      docs_en: ["Valid passport (recommend 6+ months validity remaining, with blank visa pages)", "Admission notice / invitation letter from the university", "JW201 or JW202 form (study category, issued by the school)", "Visa application form and photos", "Additional materials by category: funds, education records, medical report"],
      channel_en: "Submit to the Chinese embassy or consulate in your home country or a visa application service centre; some categories require the school to complete a filing first.",
      risk_en: "If the visa category does not match the actual purpose, you may be asked to correct it during border inspection or the later residence permit process, or the application may be refused.",
      source: ["nia_visa", "csc"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "pre_physical", stage: "pre", order: 2, pri: "P1",
      title: "体检与《外国人体格检查记录》",
      title_en: "Medical examination and Foreigner Physical Examination Record",
      summary: "学习类长期签证通常需提交《外国人体格检查记录》。建议在本国正规医疗机构完成检查并按表式填写、附照片与医师签章；记录自签发之日起有有效期限制，过早检查可能失效。",
      summary_en: "Long-term study visas normally require the Foreigner Physical Examination Record, completed at a licensed clinic in your home country, signed and stamped. The record has a validity window, so do not examine too early.",
      deadline: { kind: "none", from: "none", label: "签证申请前完成，注意有效期", label_en: "Complete before the visa application; note the validity window" },
      docs: ["《外国人体格检查记录》原件（含照片、医师签章）", "相关化验与检查报告", "既往病史与用药说明（如有）"],
      channel: "本国指定/正规医疗机构；入境后可能需在中国境内指定机构复检或核验。",
      risk: "记录缺项、缺章或超期，会导致签证或居留许可办理被退回。",
      docs_en: ["Original Foreigner Physical Examination Record (with photo and physician's signature/stamp)", "Related laboratory and examination reports", "Medical history and medication notes (if any)"],
      channel_en: "A licensed/designated medical institution in your home country; re-examination or verification at a designated institution in China may be required after entry.",
      risk_en: "Missing items, missing stamps or an expired record can cause the visa or residence permit application to be returned.",
      source: ["nia_visa", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "pre_insurance", stage: "pre", order: 3, pri: "P1",
      title: "落实来华期间的医疗保障",
      title_en: "Arrange medical cover for your stay in China",
      summary: "多数院校要求国际学生在读期间持有有效医疗保障（校方统一投保或自行购买符合要求的商业保险）。务必确认保障范围覆盖住院、门诊与意外，并保留电子保单以便到校登记。",
      summary_en: "Most universities require valid medical cover during enrolment, either school-arranged or a compliant private policy. Confirm it covers inpatient, outpatient and accidents, and keep the policy for on-campus registration.",
      deadline: { kind: "none", from: "none", label: "报到注册前完成", label_en: "Complete before enrolment registration" },
      docs: ["保险单/电子保单（含被保险人、保障期间、保障范围）", "理赔与紧急救援联系方式"],
      channel: "学校统一投保渠道，或自行购买后向国际学生办公室备案。",
      risk: "无有效保障可能无法完成注册；就诊时自费负担显著上升。",
      docs_en: ["Insurance policy / e-policy (with insured person, coverage period and scope)", "Claims and emergency assistance contact details"],
      channel_en: "The university's unified insurance channel, or purchase a policy yourself and file it with the International Student Office.",
      risk_en: "Without valid cover you may not complete registration; out-of-pocket medical costs rise significantly.",
      source: ["school", "moe"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "pre_money", stage: "pre", order: 4, pri: "P1",
      title: "支付准备：境外卡绑定与应急现金",
      title_en: "Payment readiness: link an overseas card and keep emergency cash",
      summary: "中国日常消费高度依赖扫码支付，而境内移动支付体系历史上默认用户持有中国手机号与银行账户。当前便利化措施已支持境外发行的信用卡绑定主流支付工具、国际钱包直接扫境内商户码；但绑卡成功率与场景覆盖因发卡行而异，建议提前测试并准备少量现金应急。",
      summary_en: "Daily spending in China is largely QR-based. Facilitation measures now let overseas-issued cards be linked to major payment apps and international wallets scan domestic merchant codes, yet success rates vary by issuer. Test before departure and keep some cash.",
      deadline: { kind: "none", from: "none", label: "出发前完成测试", label_en: "Test before departure" },
      docs: ["境外银行卡（建议 Visa / Mastercard / JCB / 银联等主流卡组织）", "护照（实名验证需要）", "少量人民币现金（应急）"],
      channel: "主流移动支付工具的国际版入口；或使用境外钱包直接扫境内商户码。",
      risk: "到店才发现无法支付，影响交通、餐饮与住宿；建议落地前完成一次小额测试。",
      docs_en: ["Overseas bank card (major schemes: Visa / Mastercard / JCB / UnionPay)", "Passport (required for real-name verification)", "A small amount of RMB cash (emergency)"],
      channel_en: "International entry of the major mobile payment apps; or use an overseas wallet to scan domestic merchant QR codes directly.",
      risk_en: "If payment fails at the counter, transport, dining and accommodation are affected. Test with a small amount before landing.",
      source: ["bank"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "pre_luggage", stage: "pre", order: 5, pri: "P2",
      title: "行李与入境合规物品自查",
      title_en: "Luggage and customs compliance self-check",
      summary: "出发前核对限制/禁止进境物品（如部分药品、生鲜食品、种子、超额现金与贵重物品申报要求）。携带处方药应备英文处方与药品说明；超量或违禁将被扣留并可能处罚。",
      summary_en: "Check restricted and prohibited items before departure, including certain medicines, fresh food, seeds, and declaration rules for large amounts of cash or valuables. Carry an English prescription for any medication.",
      deadline: { kind: "none", from: "none", label: "打包阶段自查", label_en: "Self-check while packing" },
      docs: ["英文处方/病历（如携带处方药）", "超额外币或贵重物品的申报材料"],
      channel: "以海关总署与目的地口岸公布的最新通关指南为准。",
      risk: "违禁物品被扣留、罚款，严重时影响入境。",
      docs_en: ["English prescription / medical record (if carrying prescription medication)", "Declaration materials for excess foreign currency or valuables"],
      channel_en: "Follow the latest clearance guidance published by the General Administration of Customs and the port of entry.",
      risk_en: "Prohibited items may be confiscated and fined; serious cases can affect entry.",
      source: ["custom"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },

    /* ===== 阶段二：抵达初期 ===== */
    {
      id: "arr_reg24", stage: "arrival", order: 1, pri: "P0",
      title: "入住后 24 小时内完成住宿登记",
      title_en: "Register your accommodation within 24 hours",
      summary: "外国人在旅馆以外的其他住所居住或住宿的，应当在入住后 24 小时内由本人或者留宿人向居住地公安机关办理登记（在居民家中住宿，城镇 24 小时内、农村 72 小时内）。住旅馆的由旅馆前台完成报备。自 2026 年 9 月 21 日起，非旅馆住宿登记已在全国范围内开通线上办理，与线下窗口具有同等效力。",
      summary_en: "Foreigners staying outside hotels must register with the local public security authority within 24 hours of moving in (72 hours in rural host homes). Hotels handle this at the front desk. Since 21 Sep 2026, online registration is available nationwide with equal legal effect.",
      deadline: { kind: "hours", from: "arrival", value: 24, label: "入住后 24 小时内（农村居民家中 72 小时）", label_en: "Within 24 hours of moving in (72 hours in rural host homes)" },
      docs: ["本人有效护照与签证/停留证件", "住宿地址与房屋权属或租赁信息", "留宿人身份证件（由留宿人代办时）"],
      channel: "国家移民管理局政务服务平台网站 /「移民局 12367」App / 微信或支付宝小程序 →「外国人服务」→ 住宿登记；或居住地公安派出所窗口。",
      risk: "超期未登记将被处以警告，可并处二千元以下罚款；容留、藏匿非法入境或非法居留外国人的，将面临罚款甚至拘留。",
      docs_en: ["Valid passport and visa / stay documents", "Accommodation address and ownership or tenancy information", "Host's identity document (when registered by the host)"],
      channel_en: "NIA service platform website / '12367' app / WeChat or Alipay mini-program → 'Foreigner Services' → accommodation registration; or the local public security sub-bureau window.",
      risk_en: "Late registration may result in a warning and a fine of up to 2,000 yuan; harbouring or hiding foreigners who entered or stayed illegally can lead to fines or even detention.",
      source: ["law_exit", "nia_platform"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_school", stage: "arrival", order: 2, pri: "P0",
      title: "到校报到注册",
      title_en: "Report and register at your university",
      summary: "在院校规定时间内到国际学生办公室完成报到注册，提交护照、签证、体检记录、保险、照片等材料，领取学生证与校园卡。注册状态直接关系到后续居留许可办理与在校权益。",
      summary_en: "Report to the International Student Office within the deadline, submitting passport, visa, medical record, insurance and photos, then collect your student card. Registration status affects your residence permit application and campus rights.",
      deadline: { kind: "fixed", from: "enroll", label: "按录取通知书与学校规定的报到期", label_en: "Per the admission notice and the university's registration period" },
      docs: ["护照、签证与入境章页复印件", "录取通知书 / JW201 或 JW202 表", "体检记录", "保险凭证", "证件照片（按学校要求）"],
      channel: "所在高校国际学生办公室 / 留学生事务部门。",
      risk: "逾期未注册可能被视为自动放弃入学资格。",
      docs_en: ["Photocopies of passport, visa and entry stamp pages", "Admission notice / JW201 or JW202 form", "Medical examination record", "Insurance certificate", "ID photos (as required by the school)"],
      channel_en: "International Student Office / student affairs office of your university.",
      risk_en: "Failing to register by the deadline may be treated as giving up your admission.",
      source: ["school", "moe"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_residence", stage: "arrival", order: 3, pri: "P0",
      title: "申请外国人居留许可",
      title_en: "Apply for a foreigner residence permit",
      summary: "持 X1 等长期学习签证入境者，通常需在入境后 30 日内向公安机关出入境管理机构申请居留许可。居留许可是在华合法停留与多次出入境的凭证，逾期未办属非法居留。",
      summary_en: "Holders of X1 and similar long-term study visas generally must apply for a residence permit within 30 days of entry. The permit legitimises your stay and re-entry; failure to apply leads to illegal residence.",
      deadline: { kind: "days", from: "arrival", value: 30, label: "入境后 30 日内", label_en: "Within 30 days of entry" },
      docs: ["护照与签证", "学校出具的申请函/在学证明", "JW201 或 JW202 表", "《外国人体格检查记录》或境内体检结果", "住宿登记凭证", "照片与申请表"],
      channel: "停留地公安机关出入境管理机构；部分城市支持线上预约与进度查询。",
      risk: "逾期办理构成非法居留，可能被处以罚款、限期离境等处罚，并影响后续签证申请。",
      docs_en: ["Passport and visa", "Application letter / enrolment certificate from the school", "JW201 or JW202 form", "Foreigner Physical Examination Record or domestic medical result", "Accommodation registration receipt", "Photos and application form"],
      channel_en: "Entry-exit administration of the public security authority where you stay; some cities support online appointment and progress tracking.",
      risk_en: "Applying late constitutes illegal residence and may lead to fines, an order to leave, and impact on future visa applications.",
      source: ["nia_visa", "law_exit", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "arr_physical_cn", stage: "arrival", order: 4, pri: "P1",
      title: "境内体检核验或复检",
      title_en: "Domestic medical verification or re-examination",
      summary: "部分申请人需在境内指定机构完成体检或对境外体检记录进行核验，取得《境外人员体格检查记录验证证明》。建议到校后尽快确认本校与出入境部门的具体要求与指定机构。",
      summary_en: "Some applicants must complete a domestic examination or have their overseas record verified. Confirm the designated institution and requirements with your school and the entry-exit authority soon after arrival.",
      deadline: { kind: "days", from: "arrival", value: 30, label: "通常与居留许可办理同期", label_en: "Usually alongside the residence permit application" },
      docs: ["境外体检记录原件", "护照", "照片", "学校或出入境部门要求的表格"],
      channel: "出入境检验检疫指定医疗机构 / 学校指定机构。",
      risk: "体检缺项会导致居留许可申请被退回，形成时限连锁风险。",
      docs_en: ["Original overseas medical examination record", "Passport", "Photos", "Forms required by the school or entry-exit authority"],
      channel_en: "Medical institutions designated by entry-exit inspection and quarantine / designated by the school.",
      risk_en: "Missing examination items will cause the residence permit application to be returned, creating a chain of deadline risks.",
      source: ["school", "nia_visa"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "arr_bank", stage: "arrival", order: 5, pri: "P1",
      title: "银行开户与支付工具完善",
      title_en: "Open a bank account and complete payment setup",
      summary: "在学期间如有汇款、奖学金发放或长期消费需求，可凭护照、居留许可（或学校证明）到银行网点开立账户。开户后即可绑定主流移动支付工具，日常支付更顺畅。",
      summary_en: "For remittances, scholarship payments or long-term spending, open a bank account with your passport and residence permit. Linking it to major payment apps makes daily payment smoother.",
      deadline: { kind: "days", from: "enroll", value: 60, label: "建议入学后 2 个月内完成", label_en: "Within 2 months after enrolment" },
      docs: ["护照与居留许可", "学校在学证明或录取材料", "手机号码（实名）"],
      channel: "各商业银行网点；建议选择校园周边网点，办理经验更成熟。",
      risk: "无本地账户时，跨境汇款与部分缴费场景会受限。",
      docs_en: ["Passport and residence permit", "Enrolment certificate or admission materials from the school", "Mobile number (real-name registered)"],
      channel_en: "Branch outlets of commercial banks; campuses-adjacent branches are recommended as they are more experienced with international students.",
      risk_en: "Without a local account, cross-border remittances and some payment scenarios are restricted.",
      source: ["bank", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "arr_sim", stage: "arrival", order: 6, pri: "P1",
      title: "手机号码实名办理",
      title_en: "Get a mobile number with real-name registration",
      summary: "中国手机号是注册支付工具、预约服务、接收学校通知的基础。可凭护照到运营商营业厅办理；短期停留也可评估 eSIM 或国际漫游方案。",
      summary_en: "A Chinese mobile number underpins payment apps, bookings and school notifications. Apply at a carrier store with your passport, or evaluate eSIM/roaming for short stays.",
      deadline: { kind: "days", from: "arrival", value: 7, label: "建议抵达后 1 周内", label_en: "Within 1 week after arrival" },
      docs: ["护照", "住宿登记凭证（部分网点需要）"],
      channel: "三大运营商营业厅；校园内通常设有服务点。",
      risk: "无本地号码将显著限制线上服务使用。",
      docs_en: ["Passport", "Accommodation registration receipt (required by some outlets)"],
      channel_en: "Stores of the three major carriers; service points usually exist on campus.",
      risk_en: "Without a local number, access to many online services is significantly limited.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_campus", stage: "arrival", order: 7, pri: "P2",
      title: "校园卡、网络与图书馆开通",
      title_en: "Activate campus card, network and library access",
      summary: "完成校园卡领取与充值、校园网络账号开通、图书馆权限激活，是使用食堂、宿舍门禁、实验楼与线上学习平台的前提。",
      summary_en: "Collecting and topping up your campus card and activating network and library accounts are prerequisites for canteens, dorm access, labs and online learning platforms.",
      deadline: { kind: "days", from: "enroll", value: 14, label: "报到后 2 周内", label_en: "Within 2 weeks after enrolment" },
      docs: ["学生证或录取材料", "证件照片", "手机号码"],
      channel: "学校一卡通中心 / 信息化部门 / 图书馆。",
      risk: "权限未开通将影响选课、考试与宿舍生活。",
      docs_en: ["Student ID or admission materials", "ID photos", "Mobile number"],
      channel_en: "University card centre / IT department / library.",
      risk_en: "Unactivated access affects course selection, exams and dormitory life.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "arr_safety", stage: "arrival", order: 8, pri: "P0",
      title: "紧急联系方式与安全须知",
      title_en: "Emergency contacts and safety essentials",
      summary: "保存关键号码：报警 110、急救 120、火警 119、交通事故 122、出入境政策咨询 12367。同时保存学校国际学生办公室、宿舍管理员与本国驻华使领馆联系方式。",
      summary_en: "Save key numbers: police 110, ambulance 120, fire 119, traffic 122, entry-exit policy 12367, plus your school's international office, dorm staff and your embassy or consulate.",
      deadline: { kind: "hours", from: "arrival", value: 24, label: "抵达当日即完成", label_en: "On the day of arrival" },
      docs: ["护照与签证复印件（与原件分开存放）", "紧急联系人清单", "本国驻华使领馆联系方式"],
      channel: "学校安全教育与新生指南；移民局 12367 服务平台。",
      risk: "紧急情况下无法快速求助，或证件遗失后难以证明身份。",
      docs_en: ["Photocopies of passport and visa (kept separately from the originals)", "Emergency contact list", "Contact details of your embassy or consulate in China"],
      channel_en: "University safety education and orientation guide; NIA 12367 service platform.",
      risk_en: "In an emergency you cannot get help quickly, or you struggle to prove your identity after losing your documents.",
      source: ["nia_12367", "school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },

    /* ===== 阶段三：在学日常 ===== */
    {
      id: "stu_renew", stage: "study", order: 1, pri: "P0",
      title: "居留许可延期（到期前 30 天）",
      title_en: "Extend your residence permit (30 days before expiry)",
      summary: "居留许可有效期通常与学习期限一致。需延长学习期限的，应在居留许可到期前向出入境管理机构申请延期。建议在到期前 30 天启动，避免材料补正导致超期。",
      summary_en: "Residence permits usually match your study period. Apply for an extension before expiry, ideally starting 30 days ahead, so that supplementary documents do not push you past the deadline.",
      deadline: { kind: "days", from: "expire", value: -30, label: "到期前 30 天启动（务必早于到期日）", label_en: "Start 30 days before expiry (always earlier than the expiry date)" },
      docs: ["护照与居留许可", "学校延期证明/在学证明", "住宿登记凭证", "照片与申请表"],
      channel: "停留地公安机关出入境管理机构；学校国际学生办公室通常可提供集中办理协助。",
      risk: "到期后未获延期即构成非法居留，影响学业与后续出入境记录。",
      docs_en: ["Passport and residence permit", "School extension certificate / enrolment certificate", "Accommodation registration receipt", "Photos and application form"],
      channel_en: "Entry-exit administration of the public security authority where you stay; the school's International Student Office often offers centralised application support.",
      risk_en: "If no extension is granted by expiry, you become an illegal resident, affecting your studies and future entry-exit records.",
      source: ["nia_visa", "law_exit", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "stu_change", stage: "study", order: 2, pri: "P1",
      title: "信息变更登记（住址 / 学校 / 护照）",
      title_en: "Register changes of address, school or passport",
      summary: "住址、就读院校、护照信息发生变化时，需按规定办理变更或重新登记；换发新护照后应及时更新签证证件与住宿登记信息，避免证件与登记信息不一致。",
      summary_en: "When your address, institution or passport changes, register the change. After passport renewal, update both your visa/residence documents and your accommodation registration.",
      deadline: { kind: "days", from: "none", value: 10, label: "变更后 10 日内（以属地要求为准）", label_en: "Within 10 days of the change (per local requirements)" },
      docs: ["新护照或变更证明", "原证件与住宿登记凭证", "学校出具的相关说明"],
      channel: "出入境管理机构与居住地派出所；学校国际学生办公室协助。",
      risk: "证件与登记信息不一致，会在查验、办理银行业务与出境时产生障碍。",
      docs_en: ["New passport or change certificate", "Original documents and accommodation registration receipt", "Relevant statement from the school"],
      channel_en: "Entry-exit administration and the local police sub-bureau; assisted by the school's International Student Office.",
      risk_en: "Inconsistency between documents and registration records causes problems during checks, banking and departure.",
      source: ["nia_visa", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "stu_medical", stage: "study", order: 3, pri: "P1",
      title: "就医流程与医疗费用结算",
      title_en: "Seeking medical care and settling costs",
      summary: "校内就医一般先到校医院或指定医疗机构，再按需转诊；持保险就医需保留发票、病历与诊断证明用于理赔。紧急情况直接拨打 120。建议提前了解学校周边国际门诊或外语服务能力较强的医院。",
      summary_en: "Start with the campus clinic or a designated hospital and refer onward as needed. Keep invoices and medical records for insurance claims. Call 120 in emergencies. Identify hospitals with international or multilingual services in advance.",
      deadline: { kind: "none", from: "none", label: "按需；建议入学首月完成信息储备", label_en: "As needed; build your information reserve in the first month" },
      docs: ["护照/居留许可", "学生证与保险凭证", "发票、病历与诊断证明（理赔用）"],
      channel: "校医院 / 指定医院 / 国际门诊；保险理赔由承保机构受理。",
      risk: "未保留理赔材料将无法报销；语言沟通不畅可能影响诊疗判断。",
      docs_en: ["Passport / residence permit", "Student ID and insurance certificate", "Invoices, medical records and diagnosis certificates (for claims)"],
      channel_en: "Campus clinic / designated hospital / international outpatient; insurance claims are handled by the insurer.",
      risk_en: "Without claim documents you cannot be reimbursed; language barriers may affect diagnosis and treatment.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_travel", stage: "study", order: 4, pri: "P2",
      title: "境内出行与实名购票",
      title_en: "Domestic travel and real-name ticketing",
      summary: "火车票、机票、长途客运均实行实名制，通常可使用护照购票与进站；部分场景支持线上购票后凭证件取票或刷证进站。出行期间仍需遵守住宿登记要求，住旅馆由旅馆报备。",
      summary_en: "Rail, air and long-distance coach tickets are real-name based; a passport generally works. Accommodation registration still applies while travelling, handled by hotels where you stay.",
      deadline: { kind: "none", from: "none", label: "按需", label_en: "As needed" },
      docs: ["护照", "学生证（部分优惠适用）", "行程与住宿信息"],
      channel: "铁路 12306、航空公司与客运官方渠道；注意使用与证件一致的姓名。",
      risk: "姓名拼写与证件不一致会导致无法取票进站。",
      docs_en: ["Passport", "Student ID (for applicable discounts)", "Itinerary and accommodation information"],
      channel_en: "Rail 12306, airlines and official coach channels; use the name exactly as written on your documents.",
      risk_en: "A name mismatch between your ticket and documents means you cannot collect the ticket or pass the gate.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_intern", stage: "study", order: 5, pri: "P0",
      title: "勤工助学与实习的合规边界",
      title_en: "Compliance boundaries for part-time work and internships",
      summary: "外国留学生在华勤工助学、校外实习或兼职，通常需符合国家与学校规定并办理相应手续（如学校同意函、加注实习信息的居留证件等）。未获许可从事有偿工作可能构成非法就业。",
      summary_en: "Part-time work or off-campus internships by international students normally require compliance with national and school rules and relevant procedures, such as school approval letters or an internship endorsement on your residence permit. Unauthorised paid work may constitute illegal employment.",
      deadline: { kind: "none", from: "none", label: "实习/兼职开始前完成", label_en: "Before starting the internship / part-time work" },
      docs: ["学校同意函或实习证明", "居留许可加注材料（按属地要求）", "实习单位接收函"],
      channel: "学校国际学生办公室与就业指导部门；出入境管理机构办理加注。",
      risk: "非法就业可能被处罚并影响签证与学业记录。",
      docs_en: ["School approval letter or internship certificate", "Residence permit endorsement materials (per local requirements)", "Acceptance letter from the internship employer"],
      channel_en: "International Student Office and careers office; the entry-exit authority handles the endorsement.",
      risk_en: "Illegal employment can lead to penalties and affect your visa and academic record.",
      source: ["moe", "nia_visa", "school"], applies: { purposes: ["degree", "exchange"], durations: ["lt180"] }
    },
    {
      id: "stu_faith", stage: "study", order: 6, pri: "P1",
      title: "宗教信仰活动的合法渠道指引",
      title_en: "Guidance on lawful religious practice",
      summary: "在中国境内的宗教活动应在依法登记的宗教活动场所内、按相关法律法规进行。建议通过学校国际学生办公室了解所在城市依法登记的场所信息、开放时间与礼仪要求。",
      summary_en: "Religious activities in China should take place at lawfully registered venues in accordance with relevant laws and regulations. Ask the international student office about registered venues, opening hours and etiquette.",
      deadline: { kind: "none", from: "none", label: "按需；入学首月了解", label_en: "As needed; learn about it in the first month" },
      docs: ["个人身份证明（部分场所登记需要）"],
      channel: "依法登记的宗教活动场所；学校国际学生办公室提供信息指引。",
      risk: "参与未依法登记的聚集活动可能带来法律风险。",
      docs_en: ["Personal identification (required for registration at some venues)"],
      channel_en: "Lawfully registered religious venues; the school's International Student Office provides information and guidance.",
      risk_en: "Participating in unregistered gatherings may carry legal risks.",
      source: ["moe", "school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_diet", stage: "study", order: 7, pri: "P2",
      title: "饮食与特殊需求适配",
      title_en: "Food and dietary adaptation",
      summary: "清真、素食、无麸质、过敏原规避等需求可通过三类渠道解决：校内食堂特定窗口、校园周边民族/国际餐厅、生鲜自炊。建议把忌口与过敏原用中文写成卡片随身携带，点餐时出示。",
      summary_en: "Halal, vegetarian, gluten-free and allergen needs can be met via dedicated canteen counters, nearby ethnic or international restaurants, or self-catering. Carry a Chinese card listing your restrictions.",
      deadline: { kind: "none", from: "none", label: "抵达后 1 周内摸清", label_en: "Figure it out within the first week" },
      docs: ["忌口与过敏原中文卡片（本助手可生成）", "常用药清单（英文）"],
      channel: "校内食堂 / 周边餐饮 / 生鲜平台与自炊。",
      risk: "过敏原误食可能造成严重健康风险。",
      docs_en: ["A Chinese card listing your dietary restrictions and allergens (the assistant can generate one)", "List of regular medications (in English)"],
      channel_en: "Campus canteen / nearby restaurants / fresh-food platforms and self-catering.",
      risk_en: "Accidental allergen exposure can create serious health risks.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_psych", stage: "study", order: 8, pri: "P1",
      title: "心理支持与跨文化适应",
      title_en: "Psychological support and cross-cultural adjustment",
      summary: "语言障碍、气候差异、饮食不适与社交孤立是常见适应压力源。多数高校设有心理咨询中心，部分提供外语咨询；也可通过同伴互助、导师沟通与运动社交缓解。出现持续情绪低落应尽早求助。",
      summary_en: "Language barriers, climate, food and social isolation are common stressors. Most universities provide counselling, sometimes in foreign languages; peer support, mentor talks and sports also help. Seek help early if low mood persists.",
      deadline: { kind: "none", from: "none", label: "按需", label_en: "As needed" },
      docs: [],
      channel: "学校心理咨询中心 / 国际学生办公室 / 校医院转介。",
      risk: "长期忽视可能演变为严重心理危机。",
      docs_en: [],
      channel_en: "University counselling centre / International Student Office / referral through the campus clinic.",
      risk_en: "Long-term neglect can develop into a serious psychological crisis.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "stu_lostpass", stage: "study", order: 9, pri: "P0",
      title: "护照遗失或被盗的应急处置",
      title_en: "Emergency steps when your passport is lost or stolen",
      summary: "三步走：一是尽快到当地公安机关报案并取得报案证明；二是联系本国驻华使领馆申请补发或办理旅行证件；三是持新证件到出入境管理机构办理签证证件补办或变更，并同步更新住宿登记信息。",
      summary_en: "Three steps: report to the local police and obtain a report; contact your embassy or consulate for a replacement or travel document; then update your visa/residence documents at the entry-exit authority and refresh your accommodation registration.",
      deadline: { kind: "hours", from: "none", value: 24, label: "发现后立即报案", label_en: "Report immediately upon discovery" },
      docs: ["报案证明", "护照复印件与签证页复印件（务必提前留存）", "照片与身份材料"],
      channel: "公安派出所 → 本国驻华使领馆 → 公安机关出入境管理机构。",
      risk: "未及时补办将导致证件与在留资格不匹配，影响出境。",
      docs_en: ["Police report certificate", "Photocopies of passport and visa pages (keep these in advance)", "Photos and identity materials"],
      channel_en: "Police sub-bureau → your embassy or consulate in China → entry-exit administration of the public security authority.",
      risk_en: "Without timely replacement your documents and residence status no longer match, affecting departure.",
      source: ["nia_12367", "school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },

    /* ===== 阶段四：离境前后 ===== */
    {
      id: "exi_prepare", stage: "exit", order: 1, pri: "P1",
      title: "离校手续与退宿退费清单",
      title_en: "Departure checklist: clearance, dorm check-out and refunds",
      summary: "离校前通常需完成：图书馆清借、宿舍退宿与押金结算、校园卡余额退还、实验室与设备归还、财务结算、档案与证明领取。建议提前 3–4 周启动，避免因个别环节卡住影响出境。",
      summary_en: "Before leaving: clear library loans, check out of the dorm and settle the deposit, refund the campus card balance, return lab equipment, settle finances and collect certificates. Start three to four weeks ahead.",
      deadline: { kind: "days", from: "expire", value: -21, label: "预计离校前 3–4 周", label_en: "3-4 weeks before expected departure" },
      docs: ["学生证与校园卡", "宿舍押金凭证", "图书借阅与设备清单"],
      channel: "学校各职能部门（图书馆、后勤、财务、学院）。",
      risk: "未清缴费用或未归还物品可能被扣留证书。",
      docs_en: ["Student ID and campus card", "Dormitory deposit receipt", "Library loan and equipment lists"],
      channel_en: "University departments (library, logistics, finance, faculty).",
      risk_en: "Unsettled fees or unreturned items may result in certificates being withheld.",
      source: ["school"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "exi_cert", stage: "exit", order: 2, pri: "P0",
      title: "学历学位证书、成绩单与学历认证",
      title_en: "Degree certificate, transcripts and credential recognition",
      summary: "领取毕业证书、学位证书与官方成绩单，并按需办理公证或学历学位认证。若计划在中国就业或继续升学，建议在离境前完成材料留存与认证咨询，避免跨国补办成本。",
      summary_en: "Collect your diploma, degree certificate and official transcripts, and arrange notarisation or credential recognition as needed. If you plan to work or study in China, sort this out before departure.",
      deadline: { kind: "days", from: "expire", value: -14, label: "离境前完成领取", label_en: "Collect before departure" },
      docs: ["护照与学生证", "离校手续完成证明", "照片（证书与公证用）"],
      channel: "学校教务/研究生院与留学生管理部门；认证按相关机构流程办理。",
      risk: "离境后补办需跨国邮寄与委托，成本高、周期长。",
      docs_en: ["Passport and student ID", "Certificate of completed departure procedures", "Photos (for certificates and notarisation)"],
      channel_en: "Academic affairs/graduate school and the international student management office; recognition follows the relevant authority's procedures.",
      risk_en: "Arranging after departure requires cross-border postage and delegation - costly and slow.",
      source: ["moe", "school"], applies: { purposes: ["degree", "exchange"], durations: ["lt180"] }
    },
    {
      id: "exi_bank", stage: "exit", order: 3, pri: "P2",
      title: "银行账户与手机号的处理",
      title_en: "Closing or retaining bank accounts and phone numbers",
      summary: "离境前决定账户与号码的保留或注销：注销需结清余额与绑定业务；保留则需注意后续证件过期导致的账户功能受限。建议提前 1–2 周办理。",
      summary_en: "Decide whether to keep or close your account and phone number. Closing requires clearing balances and linked services; keeping may limit functionality once your documents expire. Handle it one to two weeks ahead.",
      deadline: { kind: "days", from: "expire", value: -10, label: "离境前 1–2 周", label_en: "1-2 weeks before departure" },
      docs: ["护照", "银行卡", "手机号与实名信息"],
      channel: "银行网点与运营商营业厅。",
      risk: "遗留欠费或未解绑业务可能影响后续来华。",
      docs_en: ["Passport", "Bank card", "Mobile number and real-name information"],
      channel_en: "Bank branches and carrier stores.",
      risk_en: "Outstanding fees or unlinked services may affect future visits to China.",
      source: ["bank", "school"], applies: { purposes: ["degree", "exchange", "visiting"], durations: ["lt180"] }
    },
    {
      id: "exi_visa", stage: "exit", order: 4, pri: "P0",
      title: "签证/居留许可状态与出境核验",
      title_en: "Visa or residence status and exit verification",
      summary: "离境前核对护照与居留许可有效期，确认无逾期停留记录；如居留许可仍在有效期但需注销（如提前结束学业），应按属地要求办理。出境时配合边检查验。",
      summary_en: "Check passport and residence permit validity and confirm no overstay before leaving. If an early termination requires cancellation, follow local requirements. Cooperate with border inspection on exit.",
      deadline: { kind: "days", from: "expire", value: -7, label: "离境前 1 周核对", label_en: "Check 1 week before departure" },
      docs: ["护照与居留许可", "离校证明（如被要求）"],
      channel: "公安机关出入境管理机构；口岸边检机关。",
      risk: "逾期停留记录会影响未来签证与入境。",
      docs_en: ["Passport and residence permit", "Departure certificate (if requested)"],
      channel_en: "Entry-exit administration of the public security authority; border inspection at the port.",
      risk_en: "An overstay record will affect future visa applications and entry.",
      source: ["law_exit", "nia_visa"], applies: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["lt180", "le180"] }
    },
    {
      id: "exi_return", stage: "exit", order: 5, pri: "P2",
      title: "再次来华（升学/就业）与校友联系",
      title_en: "Returning to China for further study or work, and alumni ties",
      summary: "计划再次来华升学或就业的，应在离境前了解新签证类别（如学习 X1、工作 Z）的申请条件与时间窗口，并保留在华期间的学历、成绩与实习证明。同时可登记校友信息以获取后续机会。",
      summary_en: "If you plan to return for further study or work, learn the requirements and timing for the relevant visa category (X1 for study, Z for work) and keep your certificates and internship records. Register with the alumni network for future opportunities.",
      deadline: { kind: "none", from: "none", label: "离境前规划", label_en: "Plan before departure" },
      docs: ["学历学位证书与成绩单", "实习/工作证明", "推荐信与个人陈述材料"],
      channel: "中国驻当地使领馆；学校校友会与国际学生办公室。",
      risk: "材料留存不足会导致再次申请周期延长。",
      docs_en: ["Degree certificates and transcripts", "Internship / work certificates", "Recommendation letters and personal statement materials"],
      channel_en: "Chinese embassy or consulate in your home country; the university alumni association and International Student Office.",
      risk_en: "Insufficient retained materials prolong the re-application cycle.",
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
      headline_en: "Long-term study: residence permit required within 30 days of entry",
      key_risk_en: "The 30-day residence permit deadline is the easiest step to miss. The accommodation registration receipt is a required document for the permit, so complete it first.",
      source: ["nia_visa", "law_exit"]
    },
    {
      id: "x2", match: { purposes: ["degree", "exchange", "visiting", "short"], durations: ["le180"] },
      visa: "X2（短期学习）/ F（访问交流）", visa_en: "X2 short-term study / F visit",
      headline: "短期学习：停留期与延期规则是重点",
      steps: ["pre_visa", "pre_insurance", "pre_money", "arr_reg24", "arr_school", "arr_sim", "arr_safety", "exi_visa"],
      key_risk: "短期停留一般不能直接转为长期居留；如需延长学习期限，应提前向出入境管理机构咨询是否可延期或需出境重新申请。",
      headline_en: "Short-term study: watch your stay period and extension rules",
      key_risk_en: "A short-term stay generally cannot be converted directly into long-term residence. If you need to extend your studies, ask the entry-exit authority whether an extension is possible or whether you must leave and re-apply.",
      source: ["nia_visa", "school"]
    },
    {
      id: "transit", match: { purposes: ["transit"], durations: ["le240h"] },
      visa: "240 小时过境免签", visa_en: "240-hour visa-free transit",
      headline: "过境免签：24 小时内登记 + 活动范围限制",
      steps: ["arr_reg24", "arr_safety", "stu_travel"],
      key_risk: "过境免签禁止工作、学习、新闻采访等需事先批准的活动，且需在允许停留区域内活动；入境后 24 小时内须办理住宿登记。",
      headline_en: "Visa-free transit: register within 24 hours and respect the area limit",
      key_risk_en: "Visa-free transit prohibits work, study, news reporting and other activities that require prior approval, and you must stay within the permitted area. Accommodation registration is required within 24 hours of entry.",
      source: ["nia_240", "law_exit"]
    },
    {
      id: "other", match: {}, visa: "按实际事由判定（F / M / L / Z 等）", visa_en: "Determined by purpose (F / M / L / Z)",
      headline: "非学习类：先明确事由，再匹配签证与登记义务",
      steps: ["pre_visa", "pre_money", "arr_reg24", "arr_safety", "exi_visa"],
      key_risk: "商务 M、旅游 L、工作 Z 等类别的停留期、延期规则与登记义务各不相同，请以公安机关出入境管理机构与 12367 咨询为准。",
      headline_en: "Non-study purposes: clarify your purpose first, then match visa and registration duties",
      key_risk_en: "Stay periods, extension rules and registration duties differ for business (M), tourism (L), work (Z) and other categories. Always confirm with the local entry-exit authority and the 12367 hotline.",
      source: ["nia_visa", "nia_12367"]
    }
  ];

  /* ---------- 常见问答 ---------- */
  var FAQ = [
    { q: "拿到学习签证（X1）入境后，先做什么？", a: "按顺序办三件事：①入住后 24 小时内完成住宿登记（非旅馆住所由本人或房东办理，可线上办）；②按录取通知书时间到校报到注册，领取学生证与校园卡；③入境后 30 日内申请外国人居留许可，住宿登记凭证是必备材料。建议先办住宿登记，再办报到与居留许可，材料环环相扣。", q_en: "After entering with a study visa (X1), what should I do first?", a_en: "Three things in order: 1) Register your accommodation within 24 hours of moving in (for non-hotel stays, you or your host can register online); 2) report and register at your university by the date on your admission notice and collect your student card; 3) apply for a foreigner residence permit within 30 days of entry - the accommodation registration receipt is a required document. Register accommodation first, then enrol and apply for the permit, as the documents build on each other.", q_en: "After entering with a study visa (X1), what should I do first?", a_en: "Three things in order: 1) Register your accommodation within 24 hours of moving in (for non-hotel stays, you or your host can register online); 2) report and register at your university by the date on your admission notice and collect your student card; 3) apply for a foreigner residence permit within 30 days of entry - the accommodation registration receipt is a required document. Register accommodation first, then enrol and apply for the permit, as the documents build on each other.", src: ["law_exit", "nia_platform", "nia_visa", "school"], level: "S1" },
    { q: "我住在校外公寓，住宿登记由谁办、多久内办？", a: "由本人或留宿人（房东）在入住后 24 小时内办理。自 2026 年 9 月 21 日起，非旅馆住宿登记可在国家移民管理局政务服务平台、「移民局 12367」App 或微信/支付宝小程序线上办理，与线下窗口同等效力。建议首次由房东协助办理，信息更准确。", q_en: "I live in an off-campus apartment. Who registers my accommodation and how soon?", a_en: "You or your host must register within 24 hours of moving in. Since 21 September 2026, non-hotel accommodation registration can be completed online via the NIA service platform, the 12367 app or WeChat/Alipay mini-programs, with the same legal effect as an in-person window. First time, it is often more accurate to have your landlord help.", q_en: "I live in an off-campus apartment. Who registers my accommodation and how soon?", a_en: "You or your host must register within 24 hours of moving in. Since 21 September 2026, non-hotel accommodation registration can be completed online via the NIA service platform, the 12367 app or WeChat/Alipay mini-programs, with the same legal effect as an in-person window. First time, it is often more accurate to have your landlord help.", src: ["law_exit", "nia_platform"], level: "S1" },
    { q: "住学校宿舍需要自己办住宿登记吗？", a: "住旅馆的由旅馆前台完成报备。学校宿舍的管理方式各地各校不同：部分学校统一为国际学生完成登记报备，部分要求本人配合提供材料。请以所在学校国际学生办公室的说明为准。", q_en: "Do I need to register accommodation myself if I live in a university dormitory?", a_en: "Hotels handle registration at the front desk. Dormitory practices vary by university: some institutions register international students centrally, others ask students to provide materials. Follow your university's International Student Office instructions.", q_en: "Do I need to register accommodation myself if I live in a university dormitory?", a_en: "Hotels handle registration at the front desk. Dormitory practices vary by university: some institutions register international students centrally, others ask students to provide materials. Follow your university's International Student Office instructions.", src: ["school", "nia_platform"], level: "S3" },
    { q: "居留许可可以在到期当天去办吗？", a: "不建议。居留许可延期应在到期前提出，且需提交学校证明、住宿登记凭证等材料，一旦需要补正就会超期。逾期即构成非法居留，可能被罚款甚至限期离境。建议在到期前 30 天启动。", q_en: "Can I apply for a residence permit extension on the expiry day itself?", a_en: "Not advisable. Extensions must be applied for before expiry, and materials such as a school certificate and accommodation registration receipt are required. If anything needs correcting, you will exceed the deadline. Overstaying constitutes illegal residence and may lead to fines or an order to leave. Start 30 days before expiry.", q_en: "Can I apply for a residence permit extension on the expiry day itself?", a_en: "Not advisable. Extensions must be applied for before expiry, and materials such as a school certificate and accommodation registration receipt are required. If anything needs correcting, you will exceed the deadline. Overstaying constitutes illegal residence and may lead to fines or an order to leave. Start 30 days before expiry.", src: ["nia_visa", "law_exit"], level: "S1" },
    { q: "过境免签 240 小时可以顺便上课或打工吗？", a: "不可以。240 小时过境免签允许旅游、商务、访问、探亲等活动，禁止工作、学习、新闻采访等需事先批准的活动。如需学习或工作，应申请对应类别签证。", q_en: "Can I attend classes or work during the 240-hour visa-free transit?", a_en: "No. The 240-hour visa-free transit allows tourism, business, visits and family reunions, but prohibits work, study, news reporting and other activities that require prior approval. For study or work, apply for the corresponding visa category.", q_en: "Can I attend classes or work during the 240-hour visa-free transit?", a_en: "No. The 240-hour visa-free transit allows tourism, business, visits and family reunions, but prohibits work, study, news reporting and other activities that require prior approval. For study or work, apply for the corresponding visa category.", src: ["nia_240"], level: "S1" },
    { q: "我的银行卡在商店刷不了，是卡的问题吗？", a: "更可能是支付链路问题，通常集中在注册准入、绑卡充值、商户受理、公共出行、语言服务五个环节。建议：①提前在出发前完成绑卡测试；②确认卡片为 Visa / Mastercard / JCB / 银联等主流卡组织；③随身保留少量现金应急；④如多次失败，尝试换用支持境外卡片的聚合收款通道。", q_en: "My bank card fails in shops - is it the card's fault?", a_en: "More likely a payment-chain issue, usually in one of five links: registration access, card linking/top-up, merchant acceptance, public transport or language services. Suggestions: 1) test card linking before departure; 2) confirm the card is from a major scheme (Visa/Mastercard/JCB/UnionPay); 3) carry some cash for emergencies; 4) if failures persist, try an aggregator channel that accepts foreign cards.", q_en: "My bank card fails in shops - is it the card's fault?", a_en: "More likely a payment-chain issue, usually in one of five links: registration access, card linking/top-up, merchant acceptance, public transport or language services. Suggestions: 1) test card linking before departure; 2) confirm the card is from a major scheme (Visa/Mastercard/JCB/UnionPay); 3) carry some cash for emergencies; 4) if failures persist, try an aggregator channel that accepts foreign cards.", src: ["bank"], level: "S3" },
    { q: "实习需要额外办手续吗？", a: "需要。外国留学生勤工助学与校外实习通常需符合国家与学校规定，可能涉及学校同意函与居留证件加注。未获许可从事有偿工作可能构成非法就业，请务必先向学校国际学生办公室确认。", q_en: "Do internships require extra procedures?", a_en: "Yes. Part-time work and off-campus internships by international students must comply with national and university rules and may involve a school approval letter and an endorsement on your residence documents. Unauthorised paid work may constitute illegal employment - always confirm with your International Student Office first.", q_en: "Do internships require extra procedures?", a_en: "Yes. Part-time work and off-campus internships by international students must comply with national and university rules and may involve a school approval letter and an endorsement on your residence documents. Unauthorised paid work may constitute illegal employment - always confirm with your International Student Office first.", src: ["moe", "nia_visa"], level: "S1" },
    { q: "护照丢了怎么办？", a: "三步走：①立即到当地公安机关报案并取得报案证明；②联系本国驻华使领馆申请补发护照或旅行证件；③持新证件到出入境管理机构办理签证证件补办或变更，并同步更新住宿登记。平时请把护照与签证页复印件分开存放。", q_en: "What should I do if I lose my passport?", a_en: "Three steps: 1) report to the local police immediately and obtain the report certificate; 2) contact your embassy or consulate for a replacement passport or travel document; 3) with the new document, update your visa/residence documents at the entry-exit authority and refresh your accommodation registration. Keep photocopies of your passport and visa pages in a separate place.", q_en: "What should I do if I lose my passport?", a_en: "Three steps: 1) report to the local police immediately and obtain the report certificate; 2) contact your embassy or consulate for a replacement passport or travel document; 3) with the new document, update your visa/residence documents at the entry-exit authority and refresh your accommodation registration. Keep photocopies of your passport and visa pages in a separate place.", src: ["nia_12367"], level: "S1" },
    { q: "助手给的答案可靠吗？", a: "每条答案都会标注依据来源与核对日期，并按证据等级分为 S1（法规/政府一手）、S2（权威发布）、S3（公开办事指引，需属地复核）。标为 S3 或显示「待属地复核」的事项，请以主管部门与学校最新要求为准。所有 AI 生成内容均标注「待人工复核」，并可提交给学校国际学生办公室确认。", q_en: "How reliable are the assistant's answers?", a_en: "Every answer cites its sources and verification date, graded by evidence level: S1 (laws/government primary), S2 (authoritative publications), S3 (public procedural guidance, subject to local verification). Items marked S3 or 'pending local verification' should be confirmed against the latest requirements of the competent authority and your school. All AI-generated content is marked 'pending human review' and can be sent to your university's International Student Office for confirmation.", q_en: "How reliable are the assistant's answers?", a_en: "Every answer cites its sources and verification date, graded by evidence level: S1 (laws/government primary), S2 (authoritative publications), S3 (public procedural guidance, subject to local verification). Items marked S3 or 'pending local verification' should be confirmed against the latest requirements of the competent authority and your school. All AI-generated content is marked 'pending human review' and can be sent to your university's International Student Office for confirmation.", src: ["moe"], level: "S1" }
  ];

  /* ---------- 国别与信仰适配（沟通参考层，非官方口径） ---------- */
  /* 说明：本层为跨文化沟通提示，用于减少误解，不作为宗教或法律依据。
     机构端可在「知识库维护」中按本校生源结构增删。 */
  var COUNTRY = {
    PK: { zh: "巴基斯坦", en: "Pakistan", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精；斋月期间白天禁食", fest: ["开斋节", "古尔邦节"], tips: ["问候与递物多用右手", "斋月避免在其面前进食饮水"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol; daytime fasting during Ramadan", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Use the right hand when greeting and passing items", "Avoid eating or drinking in front of someone fasting in Ramadan"], lang: "乌尔都语 / 英语", lang_en: "Urdu / English" },
    IN: { zh: "印度", en: "India", faith: "印度教为主，另有伊斯兰教、锡克教", diet: "素食比例高；忌牛肉（印度教徒）、忌猪肉（穆斯林）；咖喱口味偏好", fest: ["排灯节", "洒红节"], tips: ["避免用左手递物", "饮食禁忌个体差异大，务必逐人确认"], faith_en: "Hindu majority, with Muslim and Sikh communities", diet_en: "A high proportion are vegetarian; Hindus avoid beef, Muslims avoid pork", fest_en: ["Diwali", "Holi"], tips_en: ["Avoid passing items with the left hand", "Dietary rules vary greatly - always confirm individually"], lang: "印地语 / 英语", lang_en: "Hindi / English" },
    ID: { zh: "印度尼西亚", en: "Indonesia", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精", fest: ["开斋节"], tips: ["斋月注意作息调整", "祷告时间需预留空间"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol", fest_en: ["Eid al-Fitr"], tips_en: ["Allow space and time for prayer", "Note adjusted routines during Ramadan"], lang: "印尼语", lang_en: "Indonesian" },
    MY: { zh: "马来西亚", en: "Malaysia", faith: "伊斯兰教为主，多元宗教并存", diet: "清真饮食；中餐接受度高", fest: ["开斋节", "农历新年", "屠妖节"], tips: ["多语环境，中文沟通障碍较小"], faith_en: "Muslim majority in a multi-faith society", diet_en: "Halal widely available; Chinese cuisine well accepted", fest_en: ["Hari Raya", "Chinese New Year", "Deepavali"], tips_en: ["Multilingual environment - Chinese communication is relatively easy"], lang: "马来语 / 英语 / 中文", lang_en: "Malay / English / Chinese" },
    BD: { zh: "孟加拉国", en: "Bangladesh", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精；偏好米饭与鱼类", fest: ["开斋节", "古尔邦节"], tips: ["斋月注意用餐安排"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol; rice and fish are staples", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Adjust meal arrangements during Ramadan"], lang: "孟加拉语 / 英语", lang_en: "Bengali / English" },
    EG: { zh: "埃及", en: "Egypt", faith: "伊斯兰教为主", diet: "清真饮食；忌猪肉与酒精", fest: ["开斋节", "古尔邦节"], tips: ["时间观念偏弹性，通知宜提前多次提醒"], faith_en: "Predominantly Muslim", diet_en: "Halal; no pork or alcohol", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Time-keeping tends to be flexible - send reminders more than once"], lang: "阿拉伯语", lang_en: "Arabic" },
    SA: { zh: "沙特阿拉伯", en: "Saudi Arabia", faith: "伊斯兰教", diet: "清真饮食；忌猪肉与酒精", fest: ["开斋节", "古尔邦节"], tips: ["每日礼拜时间需预留", "女性着装与社交习惯需尊重"], faith_en: "Islam", diet_en: "Halal; no pork or alcohol", fest_en: ["Eid al-Fitr", "Eid al-Adha"], tips_en: ["Reserve time for the five daily prayers", "Respect dress and social customs"], lang: "阿拉伯语", lang_en: "Arabic" },
    RU: { zh: "俄罗斯", en: "Russia", faith: "东正教为主", diet: "无普遍宗教忌口；部分忌食猪肉（穆斯林群体）", fest: ["东正教圣诞节", "谢肉节"], tips: ["气候差异大，需提醒冬装", "直接沟通风格，避免误解为不礼貌"], faith_en: "Mainly Orthodox Christian", diet_en: "No general religious restriction; Muslim communities avoid pork", fest_en: ["Orthodox Christmas", "Maslenitsa"], tips_en: ["Large climate difference - remind about winter clothing", "Direct communication style - do not mistake it for rudeness"], lang: "俄语", lang_en: "Russian" },
    KZ: { zh: "哈萨克斯坦", en: "Kazakhstan", faith: "伊斯兰教为主（世俗化程度高）", diet: "清真倾向；马肉、奶制品常见", fest: ["纳吾鲁孜节"], tips: ["俄语与哈萨克语并用"], faith_en: "Predominantly Muslim, largely secular", diet_en: "Halal-leaning; horse meat and dairy are common", fest_en: ["Nauryz"], tips_en: ["Kazakh and Russian are both used"], lang: "哈萨克语 / 俄语", lang_en: "Kazakh / Russian" },
    KR: { zh: "韩国", en: "South Korea", faith: "基督教与佛教并存", diet: "无普遍忌口；偏好辛辣", fest: ["秋夕", "农历新年"], tips: ["重视礼节与长幼秩序"], faith_en: "Christianity and Buddhism", diet_en: "No general restriction; spicy food is preferred", fest_en: ["Chuseok", "Lunar New Year"], tips_en: ["Hierarchy and courtesy matter in social interaction"], lang: "韩语", lang_en: "Korean" },
    JP: { zh: "日本", en: "Japan", faith: "神道教与佛教并存", diet: "无普遍忌口；重视食材来源说明", fest: ["新年", "盂兰盆节"], tips: ["注重规则与安静环境"], faith_en: "Shinto and Buddhism", diet_en: "No general restriction; attention to ingredient labelling", fest_en: ["New Year", "Obon"], tips_en: ["Rules and quiet environments are valued"], lang: "日语", lang_en: "Japanese" },
    TH: { zh: "泰国", en: "Thailand", faith: "佛教为主", diet: "无普遍忌口；僧侣有特定饮食规范", fest: ["宋干节"], tips: ["尊重佛像与僧侣礼仪", "避免触碰他人头部"], faith_en: "Predominantly Buddhist", diet_en: "No general restriction; monks follow specific dietary rules", fest_en: ["Songkran"], tips_en: ["Respect Buddha images and monks", "Avoid touching someone's head"], lang: "泰语", lang_en: "Thai" },
    VN: { zh: "越南", en: "Vietnam", faith: "佛教与民间信仰为主", diet: "无普遍忌口；清淡、多香草", fest: ["春节（Tet）"], tips: ["春节假期办事窗口可能调整"], faith_en: "Buddhism and folk beliefs", diet_en: "No general restriction; light flavours with herbs", fest_en: ["Tet (Lunar New Year)"], tips_en: ["Service counters may adjust hours during Tet"], lang: "越南语", lang_en: "Vietnamese" },
    ET: { zh: "埃塞俄比亚", en: "Ethiopia", faith: "基督教与伊斯兰教并存", diet: "东正教有斋戒传统；穆斯林忌猪肉", fest: ["主显节", "开斋节"], tips: ["斋戒期饮食安排需单独确认"], faith_en: "Christian and Muslim communities", diet_en: "Orthodox fasting traditions; Muslims avoid pork", fest_en: ["Timkat", "Eid al-Fitr"], tips_en: ["Confirm meal arrangements separately during fasting periods"], lang: "阿姆哈拉语 / 英语", lang_en: "Amharic / English" },
    NG: { zh: "尼日利亚", en: "Nigeria", faith: "基督教与伊斯兰教并存", diet: "因宗教而异；穆斯林忌猪肉与酒精", fest: ["开斋节", "圣诞节"], tips: ["需逐人确认饮食禁忌"], faith_en: "Christian and Muslim communities", diet_en: "Varies by religion; Muslims avoid pork and alcohol", fest_en: ["Eid al-Fitr", "Christmas"], tips_en: ["Confirm dietary restrictions individually"], lang: "英语", lang_en: "English" },
    US: { zh: "美国", en: "United States", faith: "多元", diet: "无普遍忌口；过敏原需重点关注（花生、坚果、乳制品）", fest: ["感恩节", "圣诞节"], tips: ["过敏原沟通务必书面化"], faith_en: "Diverse", diet_en: "No general restriction; watch allergens (peanut, tree nut, dairy)", fest_en: ["Thanksgiving", "Christmas"], tips_en: ["Put allergen communication in writing"], lang: "英语", lang_en: "English" },
    FR: { zh: "法国", en: "France", faith: "天主教背景，世俗化程度高", diet: "无普遍忌口；清真与素食需求并存", fest: ["圣诞节", "国庆节"], tips: ["行政流程重视材料完整与预约"], faith_en: "Catholic heritage, largely secular", diet_en: "No general restriction; halal and vegetarian needs coexist", fest_en: ["Christmas", "Bastille Day"], tips_en: ["Administrative processes value complete documents and appointments"], lang: "法语", lang_en: "French" },
    DE: { zh: "德国", en: "Germany", faith: "基督教背景，世俗化程度高", diet: "无普遍忌口；素食与无麸质需求常见", fest: ["圣诞节", "复活节"], tips: ["重视守时与书面确认"], faith_en: "Christian heritage, largely secular", diet_en: "No general restriction; vegetarian and gluten-free needs are common", fest_en: ["Christmas", "Easter"], tips_en: ["Punctuality and written confirmation are valued"], lang: "德语", lang_en: "German" },
    OTHER: { zh: "其他国家 / 地区", en: "Other", faith: "请按本人情况填写", diet: "请按本人情况填写", fest: [], tips: ["可在个人资料中补充，助手将据此调整提示"], faith_en: "Please fill in as applicable", diet_en: "Please fill in as applicable", fest_en: [], tips_en: ["You may add details in your profile and the assistant will adapt its hints"], lang: "—", lang_en: "—" }
  };

  /* ---------- 资讯推送（机构端发布，学生端按画像过滤） ---------- */
  var NEWS = [
    { id: "n1", date: "2026-09-21", cat: "policy", level: "S1", title: "外国人非旅馆住宿登记全国范围开通线上办理", title_en: "Online accommodation registration for non-hotel stays is now available nationwide", body: "国家移民管理局政务服务平台「外国人服务」模块已在全国推广非旅馆住宿登记线上办理，与线下窗口具有同等法律效力。建议首次办理由留宿人（房东）协助完成。", body_en: "The 'Foreigner Services' module of the NIA service platform has rolled out online accommodation registration for non-hotel stays nationwide, with the same legal effect as an in-person window. For a first registration, it is advisable to be assisted by your host.", tags: ["arrival", "all"], src: "nia_platform" },
    { id: "n2", date: "2026-09-23", cat: "policy", level: "S1", title: "2024—2025 学年 38 万名国际学生在华学习交流", title_en: "380,000 international students studied in China in the 2024-2025 academic year", body: "教育部在国新办发布会上介绍，来自 191 个国家和地区的 38 万名国际学生在华学习交流，92 个国家将中文纳入国民教育体系。「十五五」期间将继续加强「留学中国」品牌和能力建设。", body_en: "The Ministry of Education reported at a State Council Information Office press conference that 380,000 international students from 191 countries and regions studied in China, and 92 countries have incorporated Chinese into their national education systems. The 'Study in China' brand and capacity building will continue during the 15th Five-Year Plan.", tags: ["all"], src: "moe" },
    { id: "n3", date: "2026-08-20", cat: "policy", level: "S1", title: "240 小时过境免签适用国家增至 57 国", title_en: "240-hour visa-free transit now covers 57 countries", body: "自 2026 年 8 月 20 日起，吉尔吉斯斯坦、越南公民可适用 240 小时过境免签政策，政策适用国家增至 57 国；海南 30 天入境免签适用国家增至 61 国。", body_en: "Since 20 August 2026, citizens of Kyrgyzstan and Vietnam qualify for the 240-hour visa-free transit policy, bringing the eligible countries to 57; the 30-day visa-free entry for Hainan now covers 61 countries.", tags: ["short", "transit"], src: "nia_240" },
    { id: "n4", date: "2026-09-15", cat: "campus", level: "S3", title: "秋季学期居留许可集中办理窗口开放", title_en: "Autumn-semester window for residence permit processing opens", body: "（示例条目，由机构端维护）国际学生办公室将于本月开放居留许可集中办理窗口，请持住宿登记凭证、体检核验结果与在学证明按预约时段前往。", body_en: "(Sample entry, maintained by institutions) The International Student Office will open a centralised window for residence permit processing this month. Bring your accommodation registration receipt, medical verification result and enrolment certificate and visit at your booked time slot.", tags: ["arrival", "degree"], src: "school" },
    { id: "n5", date: "2026-09-10", cat: "campus", level: "S3", title: "校园文化周与语言伙伴计划报名", title_en: "Campus culture week and language partner programme - sign up now", body: "（示例条目，由机构端维护）校园文化周将设置国别文化展台与语言伙伴配对，欢迎国际学生报名参与，可计入第二课堂学时。", body_en: "(Sample entry, maintained by institutions) Campus culture week will feature country booths and language partner pairing. International students are welcome to join; participation counts toward second-classroom hours.", tags: ["study"], src: "school" }
  ];

  /* ---------- 机构端内容模板 ---------- */
  var TEMPLATES = [
    { id: "t_guide", name: "国别化来华指南", name_en: "Country-tailored arrival guide", desc: "按目标国别生成行前与抵达阶段指引，自动附加饮食、宗教与节日提示", desc_en: "Pre-departure and arrival guidance for a target country, with automatic notes on diet, religion and festivals", sections: ["行前准备", "入境与登记", "报到注册", "在学提示", "紧急联系"], sections_en: ["Pre-departure preparation", "Entry and registration", "Enrolment", "During study", "Emergency contacts"] },
    { id: "t_checklist", name: "行前清单", name_en: "Pre-departure checklist", desc: "按签证类别与停留时长生成材料与事项清单，可导出打印", desc_en: "Document and task checklist by visa type and length of stay; exportable and printable", sections: ["证件材料", "健康与保险", "支付与通信", "行李与合规"], sections_en: ["Documents", "Health and insurance", "Payment and connectivity", "Luggage and compliance"] },
    { id: "t_notice", name: "通知公告", name_en: "Official notice", desc: "生成多语种通知公告，含事项、时限、地点与联系人", desc_en: "Multilingual notice covering subject, deadline, location and contact", sections: ["事项", "时限", "办理方式", "联系方式"], sections_en: ["Subject", "Deadline", "How to apply", "Contact"] },
    { id: "t_faq", name: "常见问答集", name_en: "FAQ set", desc: "从知识库高频问题生成多语种问答集，支持一键发布到学生端", desc_en: "Multilingual FAQ set built from the most frequent knowledge-base questions; publish to students in one click", sections: ["手续类", "生活类", "学业类"], sections_en: ["Procedures", "Daily life", "Academic"] },
    { id: "t_brief", name: "迎新简报", name_en: "Orientation brief", desc: "面向新生的首月安排与关键时限提醒", desc_en: "First-month schedule and key deadline reminders for new students", sections: ["首周", "首月", "首学期"], sections_en: ["First week", "First month", "First semester"] },
    { id: "t_emergency", name: "应急处置卡", name_en: "Emergency card", desc: "护照遗失、就医、纠纷等场景的一页式处置流程", desc_en: "One-page response procedure for lost passports, medical care and disputes", sections: ["场景", "处置步骤", "联系方式"], sections_en: ["Scenario", "Steps", "Contacts"] }
  ];

  var LANGS = [
    { code: "zh", name: "中文", en: "Chinese", dir: "ltr", flag: "中" },
    { code: "en", name: "English", en: "English", dir: "ltr", flag: "EN" },
    { code: "ru", name: "Русский", en: "Russian", dir: "ltr", flag: "RU" },
    { code: "ar", name: "العربية", en: "Arabic", dir: "rtl", flag: "AR" },
    { code: "fr", name: "Français", en: "French", dir: "ltr", flag: "FR" },
    { code: "es", name: "Español", en: "Spanish", dir: "ltr", flag: "ES" },
    { code: "vi", name: "Tiếng Việt", en: "Vietnamese", dir: "ltr", flag: "VI" },
    { code: "th", name: "ไทย", en: "Thai", dir: "ltr", flag: "TH" },
    { code: "my", name: "မြန်မာ", en: "Burmese", dir: "ltr", flag: "MY" },
    { code: "ms", name: "Bahasa Melayu", en: "Malay", dir: "ltr", flag: "MS" }
  ];

  return {
    META: META, SRC: SRC, MATTERS: MATTERS, PATHS: PATHS, FAQ: FAQ,
    COUNTRY: COUNTRY, NEWS: NEWS, TEMPLATES: TEMPLATES, LANGS: LANGS,

    /* =====================================================================
       内容层多语取值器（v11 新增）
       用法：KB.L(matter, "title")  →  当前语种 title_ru / title_ar …
       回退链：当前语种 → 英文 → 中文
       设计目标：内容层缺某语种译文时，宁可显示英文，也绝不把中文暴露给非中文语种。
       数组字段（fest/tips/docs/sections）原样返回。
       ===================================================================== */
    L: function (o, f, forceLang) {
      if (!o) return "";
      /* 语种优先级：显式入参 → 材料语种覆盖（机构端生成材料时） → 界面语种 */
      var c = forceLang || window.KB_LANG_OVERRIDE || (window.L10N && window.L10N.current) || "zh";
      c = String(c).slice(0, 2);
      var zhMode = c === "zh";
      var v = zhMode ? o[f] : (o[f + "_" + c] !== undefined ? o[f + "_" + c] : o[f + "_en"]);
      if (v === undefined || v === null || v === "") v = zhMode ? o[f + "_en"] : o[f];
      return v === undefined || v === null ? "" : v;
    },
    /* 当前语种代码（两位） */
    lang: function () { return String((window.L10N && window.L10N.current) || "zh").slice(0, 2); },

    /* 国别名称（多语）：zh/en 原生 + name_xx 译文 */
    countryName: function (c) {
      if (!c) return "";
      return this.L(c, "name") || c.zh || "";
    },
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
