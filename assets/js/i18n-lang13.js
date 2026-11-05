/* =========================================================================
   来华交流全程助手 · 语种数文案补丁（13 语种）
   -------------------------------------------------------------------------
   作用：把界面上的「已支持语种」文案统一为现行的 13 语种口径
        （中/英/俄/阿/法/西/越/泰/缅/马/日/韩/德）。

   原理：i18n-v3.js 采用增量合并——把词条写进 window.I18N[lg]。
        本文件在其之后加载，只覆盖 trustLang 这一个键，其余词条一律不动。

   为什么单独成文件：部署侧（GitHub Pages）的 i18n-v3.js 尚未来得及整包同步，
        而该文件体积较大；用这份 2KB 补丁即可让线上文案先正确。
        待部署侧 i18n-v3.js 整包同步完成后，本文件可安全删除
        （届时 window.I18N 内的 trustLang 已是 13 语种文案）。
   ========================================================================= */
(function () {
  "use strict";

  var TRUST_LANG = {
    zh: "中 / 英 / 俄 / 阿 / 法 / 西 / 越 / 泰 / 缅 / 马 / 日 / 韩 / 德 十三语种",
    en: "13 languages: ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    ru: "13 языков: ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    ar: "13 لغات: ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    fr: "13 langues : ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    es: "13 idiomas: ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    vi: "Mười ba ngôn ngữ: Trung / Anh / Nga / Ả Rập / Pháp / Tây Ban Nha / Việt / Thái / Miến / Mã Lai / Nhật / Hàn / Đức",
    th: "สิบสามภาษา: จีน / อังกฤษ / รัสเซีย / อาหรับ / ฝรั่งเศส / สเปน / เวียดนาม / ไทย / พม่า / มาเลย์ / ญี่ปุ่น / เกาหลี / เยอรมัน",
    my: "ဘာသာစကား ဆယ့်သုံးမျိုး: တရုတ် / အင်္ဂလိပ် / ရုရှ / အာရဗီ / ပြင်သစ် / စပိန် / ဗီယက်နမ် / ထိုင်း / မြန်မာ / မလေး / ဂျပန် / ကိုရီးယား / ဂျာမန်",
    ms: "Tiga belas bahasa: Cina / Inggeris / Rusia / Arab / Perancis / Sepanyol / Vietnam / Thai / Myanmar / Melayu / Jepun / Korea / Jerman",
    ja: "13言語：ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    ko: "13개 언어: ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE",
    de: "13 Sprachen: ZH / EN / RU / AR / FR / ES / VI / TH / MY / MS / JA / KO / DE"
  };

  window.I18N = window.I18N || {};
  Object.keys(TRUST_LANG).forEach(function (lg) {
    if (!window.I18N[lg]) { window.I18N[lg] = {}; }
    window.I18N[lg].trustLang = TRUST_LANG[lg];
  });

  /* 若本文件加载时页面已完成首渲染，补一次重绘；否则交给 ui.js 的初始化渲染 */
  function repaint() {
    try {
      if (window.L10N && typeof window.L10N.apply === "function") {
        window.L10N.apply(window.L10N.current);
      }
    } catch (e) { /* 渲染时机不当时静默忽略 */ }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repaint);
  } else {
    repaint();
  }
})();
