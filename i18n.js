/* QUI — i18n condiviso
 *
 * Ogni lingua vive nel proprio file: /lang/<codice>.js, che chiama
 * I18N.register('<codice>', { chiave: 'testo', ... }).
 * Ogni pagina scarica solo la lingua attiva più quella di riserva (DEFAULT_LANG).
 *
 * AGGIUNGERE UNA LINGUA
 *   1. creare /lang/<codice>.js con le stesse chiavi di /lang/it.js
 *   2. aggiungere una riga in LANGS qui sotto
 *   Nessuna pagina va toccata: il selettore la mostra da solo.
 *
 * DOPO OGNI MODIFICA A QUESTO FILE O A /lang/*.js
 *   alzare il numero ?v= nel tag <script src="/i18n.js?v=..."> delle pagine,
 *   così i browser scaricano la versione nuova invece di quella in memoria.
 *
 * COME SI SEGNA UN TESTO
 *   HTML statico      data-i18n="chiave"  (testo del nodo)
 *                     data-i18n-placeholder / -title / -alt / -aria-label
 *   testo con markup  data-i18n-rich (il testo del dizionario può contenere <strong>, <br>)
 *   valori variabili  data-i18n-vars='{"n":3}'  →  {n} nel testo
 *   plurali           data-i18n-n="3"  →  chiave.one / chiave.other (regole Intl della lingua)
 *   da JavaScript     I18N.t(), I18N.tn()            testo semplice (alert, textContent)
 *                     I18N.html(), I18N.htmlN(), I18N.rich(), I18N.attr()   dentro HTML generato
 *                     I18N.set(), I18N.setAttr()     testi che restano a schermo
 *   Tutto ciò che porta data-i18n si aggiorna da solo al cambio lingua.
 */
(function (global) {
  'use strict';

  var DEFAULT_LANG = 'it';
  var STORAGE_KEY = 'qui_lang';

  /* Lingue disponibili, ognuna col nome nel proprio idioma. */
  var LANGS = {
    it: 'Italiano',
    en: 'English'
  };

  /* Lingue scritte da destra a sinistra. */
  var RTL = { ar: 1, he: 1, fa: 1, ur: 1 };

  var ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];

  var DICT = {};
  var waiting = {};

  /* I file delle lingue stanno accanto a questo script e ne ereditano la versione. */
  var self = document.currentScript;
  var src = self ? self.src : '/i18n.js';
  var BASE = src.replace(/i18n\.js(\?.*)?$/, '') + 'lang/';
  var VERSION = (src.match(/[?&]v=([^&#]+)/) || [])[1] || '';

  function fileUrl(lang) {
    return BASE + lang + '.js' + (VERSION ? '?v=' + VERSION : '');
  }

  function register(lang, dict) { DICT[lang] = dict; }

  /* Lingua attiva: ?lang= > scelta salvata > lingua del browser > default.
     Un link che porta la lingua è una richiesta esplicita e vince sulla scelta salvata
     (la pagina dell'annuncio sta su un altro dominio e riceve la lingua solo dal link). */
  function detectLang() {
    var q = new URLSearchParams(global.location.search).get('lang');
    if (q) { q = q.split('-')[0].toLowerCase(); if (LANGS[q]) return q; }

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && LANGS[saved]) return saved;

    var nav = (global.navigator.language || '').split('-')[0].toLowerCase();
    if (LANGS[nav]) return nav;

    return DEFAULT_LANG;
  }

  var currentLang = detectLang();

  /* Caricamento di un file lingua dopo l'apertura della pagina (cambio lingua). */
  function loadLang(lang, done) {
    if (DICT[lang]) { done(); return; }
    if (waiting[lang]) { waiting[lang].push(done); return; }
    waiting[lang] = [done];
    var s = document.createElement('script');
    s.src = fileUrl(lang);
    s.onload = s.onerror = function () {
      var list = waiting[lang]; delete waiting[lang];
      list.forEach(function (f) { f(); });
    };
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function lookup(key) {
    var d = DICT[currentLang];
    var s = d && d[key];
    if (s == null) { d = DICT[DEFAULT_LANG]; s = d && d[key]; }
    return s;
  }

  function fill(s, vars, escapeVars) {
    if (!vars) return s;
    Object.keys(vars).forEach(function (k) {
      var v = escapeVars ? esc(vars[k]) : String(vars[k]);
      s = s.split('{' + k + '}').join(v);
    });
    return s;
  }

  /* Traduzione. Catena: lingua attiva > default > la chiave stessa
     (una lacuna si vede, non resta muta). */
  function t(key, vars) {
    var s = lookup(key);
    if (s == null) return key;
    return fill(s, vars, false);
  }

  function pluralKey(key, n) {
    var cat = 'other';
    try { cat = new Intl.PluralRules(currentLang).select(n); } catch (e) {}
    if (lookup(key + '.' + cat) != null) return key + '.' + cat;
    return key + '.other';
  }

  /* Plurale secondo le regole della lingua attiva: chiave.one, chiave.other,
     e per le lingue che le hanno chiave.few, chiave.many, ... */
  function tn(key, n, vars) {
    var v = { n: n };
    if (vars) Object.keys(vars).forEach(function (k) { v[k] = vars[k]; });
    return t(pluralKey(key, n), v);
  }

  function varsAttr(vars) {
    return vars ? " data-i18n-vars='" + esc(JSON.stringify(vars)) + "'" : '';
  }

  /* Frammenti per l'HTML generato da JavaScript: portano con sé la chiave,
     quindi si aggiornano da soli al cambio lingua. */
  function html(key, vars) {
    return '<span data-i18n="' + esc(key) + '"' + varsAttr(vars) + '>' + esc(t(key, vars)) + '</span>';
  }

  function htmlN(key, n, vars) {
    return '<span data-i18n="' + esc(key) + '" data-i18n-n="' + esc(n) + '"' + varsAttr(vars) + '>' +
      esc(tn(key, n, vars)) + '</span>';
  }

  /* Testo del dizionario con markup (<strong>, <br>); i valori variabili sono sempre neutralizzati. */
  function rich(key, vars) {
    return '<span data-i18n="' + esc(key) + '" data-i18n-rich="1"' + varsAttr(vars) + '>' +
      fill(lookup(key) == null ? esc(key) : lookup(key), vars, true) + '</span>';
  }

  function attr(name, key, vars) {
    return ' ' + name + '="' + esc(t(key, vars)) + '" data-i18n-' + name + '="' + esc(key) + '"' + varsAttr(vars);
  }

  /* Testi messi a schermo da JavaScript che devono restare aggiornati. */
  function set(el, key, vars) {
    if (!el) return;
    el.setAttribute('data-i18n', key);
    if (vars) el.setAttribute('data-i18n-vars', JSON.stringify(vars));
    else el.removeAttribute('data-i18n-vars');
    el.removeAttribute('data-i18n-n');
    el.textContent = t(key, vars);
  }

  function setAttr(el, name, key, vars) {
    if (!el) return;
    el.setAttribute('data-i18n-' + name, key);
    if (vars) el.setAttribute('data-i18n-vars', JSON.stringify(vars));
    el.setAttribute(name, t(key, vars));
  }

  function readVars(el) {
    var raw = el.getAttribute('data-i18n-vars');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  /* Applica la lingua attiva a tutto ciò che porta una chiave. */
  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var vars = readVars(el);
      var n = el.getAttribute('data-i18n-n');
      var k = n != null ? pluralKey(key, Number(n)) : key;
      if (n != null) { vars = vars || {}; vars.n = Number(n); }
      if (el.hasAttribute('data-i18n-rich')) {
        var s = lookup(k);
        el.innerHTML = fill(s == null ? esc(k) : s, vars, true);
      } else {
        el.textContent = t(k, vars);
      }
    });
    ATTRS.forEach(function (name) {
      root.querySelectorAll('[data-i18n-' + name + ']').forEach(function (el) {
        el.setAttribute(name, t(el.getAttribute('data-i18n-' + name), readVars(el)));
      });
    });
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('dir', RTL[currentLang] ? 'rtl' : 'ltr');
  }

  function setLang(lang) {
    if (!LANGS[lang]) return false;
    loadLang(lang, function () {
      if (!DICT[lang]) return;   // file non arrivato: si resta sulla lingua attuale
      currentLang = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      apply();
      /* Le pagine che caricano dati dal backend si riagganciano qui per
         rifare le fetch con ?lang= aggiornato. */
      global.dispatchEvent(new CustomEvent('qui:langchange', { detail: { lang: lang } }));
    });
    return true;
  }

  function getLang() { return currentLang; }

  function available() {
    return Object.keys(LANGS).map(function (code) {
      return { code: code, name: LANGS[code] };
    });
  }

  /* Suffisso da accodare alle chiamate API, così i dati arrivano
     nella stessa lingua dell'interfaccia. */
  function apiParam(url) {
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'lang=' + currentLang;
  }

  global.I18N = {
    register: register, t: t, tn: tn, html: html, htmlN: htmlN, rich: rich, attr: attr,
    set: set, setAttr: setAttr, apply: apply, setLang: setLang, getLang: getLang,
    available: available, apiParam: apiParam
  };

  /* Durante il caricamento della pagina i file lingua si scaricano subito,
     prima del resto degli script: le pagine trovano già le parole pronte. */
  var needed = currentLang === DEFAULT_LANG ? [DEFAULT_LANG] : [DEFAULT_LANG, currentLang];
  if (document.readyState === 'loading') {
    needed.forEach(function (lang) {
      document.write('<script src="' + fileUrl(lang) + '"><\/script>');
    });
    document.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    var left = needed.length;
    needed.forEach(function (lang) {
      loadLang(lang, function () { if (--left === 0) apply(); });
    });
  }
})(window);
