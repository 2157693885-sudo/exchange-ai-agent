/* =========================================================================
   来华交流全程助手 · 内容层多语包（v11）
   ---------------------------------------------------------------------------
   职责：为 kb.js / kb-modules.js 的内容字段提供 ru/ar/fr/es/vi/th/my/ms 译文。
   机制：各语言包调用 window.KBI18N.register(lang, pack)，本文件把译文展开为
        obj["field_" + lang]，交由 KB.L(obj, field) 取值。
   取材链：当前语种 → 英文 → 中文（由 KB.L 负责）。
   约定：译文缺失即留空，前端自动回退英文，绝不把中文暴露给非中文语种。
   ========================================================================= */
window.KBI18N = (function () {
  "use strict";

  var DATA = {};

  function setF(obj, f, v, lang) {
    if (!obj || v === undefined || v === null) return;
    obj[f + "_" + lang] = v;
  }

  /* 事项查找：内置事项（KB.MATTERS）+ 试点校本预设（SYSU_PRESET_KB）。
     两者共用同一套 id 空间与字段约定（title/summary/docs/channel/risk/label），
     因此多语包只需一份条目即可同时覆盖，无需为校本数据另建机制。 */
  function findMatter(id) {
    var i;
    var builtin = (window.KB && window.KB.MATTERS) || [];
    for (i = 0; i < builtin.length; i++) { if (builtin[i].id === id) return builtin[i]; }
    var preset = window.SYSU_PRESET_KB || [];
    for (i = 0; i < preset.length; i++) { if (preset[i].id === id) return preset[i]; }
    return null;
  }

  function applyPack(lang, P) {
    var KB = window.KB, KBM = window.KBM;
    if (!KB) return;

    /* ---------- 国别适配 ---------- */
    Object.keys(P.country || new Object()).forEach(function (id) {
      var c = KB.COUNTRY[id];
      if (!c) return;
      if (!c.name) { c.name = c.zh; c.name_en = c.en; }
      var e = P.country[id];
      setF(c, "name", e.name, lang);
      setF(c, "faith", e.faith, lang);
      setF(c, "diet", e.diet, lang);
      setF(c, "lang", e.lang, lang);
      setF(c, "fest", e.fest, lang);
      setF(c, "tips", e.tips, lang);
    });

    /* ---------- 办理事项 ---------- */
    Object.keys(P.matter || new Object()).forEach(function (id) {
      var m = findMatter(id);
      if (!m) return;
      var e = P.matter[id];
      setF(m, "title", e.title, lang);
      setF(m, "summary", e.summary, lang);
      setF(m, "docs", e.docs, lang);
      setF(m, "channel", e.channel, lang);
      setF(m, "risk", e.risk, lang);
      if (m.deadline) setF(m.deadline, "label", e.label, lang);
    });

    /* ---------- 常见问答（按序号） ---------- */
    Object.keys(P.faq || new Object()).forEach(function (i) {
      var f = (KB.FAQ || [])[+i];
      if (!f) return;
      setF(f, "q", P.faq[i].q, lang);
      setF(f, "a", P.faq[i].a, lang);
    });

    /* ---------- 证据来源 ---------- */
    function srcMap(map, table) {
      if (!table) return;
      Object.keys(map || new Object()).forEach(function (k) {
        var s = table[k];
        if (!s) return;
        setF(s, "name", map[k].name, lang);
        setF(s, "org", map[k].org, lang);
        setF(s, "note", map[k].note, lang);
      });
    }
    srcMap(P.src, KB.SRC);
    if (KBM) srcMap(P.ksrc, KBM.SRC);

    /* ---------- 内容模板 ---------- */
    Object.keys(P.tpl || new Object()).forEach(function (id) {
      var t = null;
      (KB.TEMPLATES || []).forEach(function (x) { if (x.id === id) t = x; });
      if (!t) return;
      setF(t, "name", P.tpl[id].name, lang);
      setF(t, "desc", P.tpl[id].desc, lang);
      setF(t, "sections", P.tpl[id].sections, lang);
    });

    /* ---------- 免责声明 ---------- */
    setF(KB.META, "disclaimer", (P.meta || new Object()).disclaimer, lang);

    if (!KBM) return;

    /* ---------- 指南分组 ---------- */
    Object.keys(P.grp || new Object()).forEach(function (id) {
      (KBM.GUIDE_GROUPS || []).forEach(function (g) {
        if (String(g.id) !== String(id)) return;
        setF(g, "title", P.grp[id].title, lang);
        setF(g, "desc", P.grp[id].desc, lang);
      });
    });

    /* ---------- 数组型集合 ---------- */
    function arrBy(arr, map, fields) {
      Object.keys(map || new Object()).forEach(function (id) {
        (arr || []).forEach(function (x, i) {
          if (String(x.id || i) !== String(id)) return;
          fields.forEach(function (f) { setF(x, f, map[id][f], lang); });
        });
      });
    }
    arrBy(KBM.CAMPUS, P.campus, ["name", "title", "desc"]);
    arrBy(KBM.DAILY, P.daily, ["title", "desc"]);
    arrBy(KBM.EMERGENCY, P.emg, ["label", "note"]);
    arrBy(KBM.ORG_FEATURES, P.orgf, ["title", "desc"]);
    arrBy(KBM.MATERIAL_TYPES, P.mat, ["title", "desc"]);
  }

  return {
    version: "v11",
    langs: [],
    register: function (lang, pack) {
      if (!lang || !pack) return this;
      /* 分批合并：同一语种可分多次注册，按集合深度合并 */
      var cur = DATA[lang];
      if (!cur) { cur = new Object(); DATA[lang] = cur; }
      Object.keys(pack).forEach(function (k) {
        var v = pack[k];
        if (v && typeof v === "object" && !Array.isArray(v) && cur[k] && typeof cur[k] === "object") {
          Object.keys(v).forEach(function (id) { cur[k][id] = v[id]; });
        } else { cur[k] = v; }
      });
      if (this.langs.indexOf(lang) < 0) this.langs.push(lang);
      try { applyPack(lang, pack); }
      catch (e) { if (window.console) console.warn("[KBI18N] " + lang + " 应用失败", e); }
      return this;
    },
    /* 重新应用全部已注册语言包。
       用途：内容包可能先于目标数据（如校本预设）加载，此时 applyPack 查不到对象、
       译文会被静默丢弃。数据到位后调用本方法即可补齐。
       重复应用是幂等的——只覆盖 *_lang 字段，不新增或删除条目。 */
    applyAll: function () {
      var self = this;
      (self.langs || []).slice().forEach(function (l) {
        try { applyPack(l, DATA[l]); }
        catch (e) { if (window.console) console.warn("[KBI18N] 重新应用失败 " + l, e); }
      });
      return self;
    },
    stats: function () {
      var o = {};
      Object.keys(DATA).forEach(function (l) { o[l] = Object.keys(DATA[l]).length; });
      return o;
    }
  };
})();
