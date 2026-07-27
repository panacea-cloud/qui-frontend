/* QUI — i18n condiviso (D9)
 * Codici lingua ISO a due lettere, gli stessi accettati dal backend (pick_lang).
 * Aggiungere una lingua = aggiungere una chiave a DICT. Nessuna modifica al codice.
 * Il selettore mostra solo le lingue presenti in DICT.
 */
(function (global) {
  'use strict';

  var DEFAULT_LANG = 'it';
  var STORAGE_KEY = 'qui_lang';

  /* Nomi mostrati nel selettore. Ogni lingua nel proprio idioma. */
  var LANG_NAMES = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español' };

  var DICT = {
    it: {
      'nav.login': 'Accedi',
      'nav.logout': 'Esci',
      'nav.profile': 'Profilo',
      'nav.listings': 'Annunci',
      'nav.map': 'Mappa',
      'nav.apikeys': 'API Keys',
      'nav.add': '+ Aggiungi',

      'search.placeholder': 'Cerca sulla mappa…',
      'search.discover': 'Scopri',
      'search.sort': 'Ordina',
      'search.sort.nearest': 'Più vicino',
      'search.sort.recent': 'Più recente',
      'search.noresults': 'Nessun risultato in questa zona',

      'family.product': 'Prodotto',
      'family.service': 'Servizio',
      'family.experience': 'Esperienza',

      'auth.title': 'Accedi a QUI',
      'auth.tab.login': 'Accedi',
      'auth.tab.register': 'Registrati',
      'auth.email': 'EMAIL',
      'auth.password': 'PASSWORD',
      'auth.email.placeholder': 'tuaemail@esempio.it',
      'auth.password.placeholder': 'Minimo 6 caratteri',
      'auth.submit.login': 'Accedi',
      'auth.submit.register': 'Registrati',
      'auth.info.login': 'Accedi per pubblicare annunci e sbloccare contatti.',
      'auth.info.register': 'Registrandoti puoi pubblicare annunci e sbloccare contatti.',
      'auth.forgot': 'Password dimenticata?',
      'auth.forgot.title': 'Password dimenticata',
      'auth.forgot.submit': 'Invia link di reset',
      'auth.reset.newpassword': 'NUOVA PASSWORD',
      'auth.error.invalid': 'Credenziali non valide',
      'auth.error.generic': 'Errore durante l\u2019accesso',

      'security.title': 'Sicurezza',
      'security.hint': 'Cambiando password verrai disconnesso da tutti gli altri dispositivi.',
      'security.current': 'Password attuale',
      'security.new': 'Nuova password',
      'security.confirm': 'Conferma nuova password',
      'security.submit': 'Cambia password',
      'security.done': '\u2713 Password aggiornata',
      'security.mismatch': 'La nuova password e la conferma non coincidono.',
      'security.tooshort': 'La nuova password deve avere almeno 6 caratteri.',

      'common.save': 'Salva',
      'common.saved': '\u2713 Salvato',
      'common.saving': 'Salvataggio\u2026',
      'common.cancel': 'Annulla',
      'common.close': 'Chiudi',
      'common.error': 'Errore',
      'common.loading': 'Caricamento\u2026',
      'common.expired': 'Scaduto'
    },

    en: {
      'nav.login': 'Sign in',
      'nav.logout': 'Sign out',
      'nav.profile': 'Profile',
      'nav.listings': 'Listings',
      'nav.map': 'Map',
      'nav.apikeys': 'API Keys',
      'nav.add': '+ Add',

      'search.placeholder': 'Search the map\u2026',
      'search.discover': 'Discover',
      'search.sort': 'Sort',
      'search.sort.nearest': 'Nearest',
      'search.sort.recent': 'Most recent',
      'search.noresults': 'No results in this area',

      'family.product': 'Product',
      'family.service': 'Service',
      'family.experience': 'Experience',

      'auth.title': 'Sign in to QUI',
      'auth.tab.login': 'Sign in',
      'auth.tab.register': 'Sign up',
      'auth.email': 'EMAIL',
      'auth.password': 'PASSWORD',
      'auth.email.placeholder': 'youremail@example.com',
      'auth.password.placeholder': 'At least 6 characters',
      'auth.submit.login': 'Sign in',
      'auth.submit.register': 'Sign up',
      'auth.info.login': 'Sign in to publish listings and unlock contacts.',
      'auth.info.register': 'Sign up to publish listings and unlock contacts.',
      'auth.forgot': 'Forgot password?',
      'auth.forgot.title': 'Forgot password',
      'auth.forgot.submit': 'Send reset link',
      'auth.reset.newpassword': 'NEW PASSWORD',
      'auth.error.invalid': 'Invalid credentials',
      'auth.error.generic': 'Sign-in failed',

      'security.title': 'Security',
      'security.hint': 'Changing your password signs you out of all other devices.',
      'security.current': 'Current password',
      'security.new': 'New password',
      'security.confirm': 'Confirm new password',
      'security.submit': 'Change password',
      'security.done': '\u2713 Password updated',
      'security.mismatch': 'New password and confirmation do not match.',
      'security.tooshort': 'The new password must be at least 6 characters.',

      'common.save': 'Save',
      'common.saved': '\u2713 Saved',
      'common.saving': 'Saving\u2026',
      'common.cancel': 'Cancel',
      'common.close': 'Close',
      'common.error': 'Error',
      'common.loading': 'Loading\u2026',
      'common.expired': 'Expired'
    }
  };

  /* Lingua attiva: scelta salvata > ?lang= > lingua del browser > default.
     Una lingua non presente in DICT ricade sul default: mai UI vuota. */
  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && DICT[saved]) return saved;

    var q = new URLSearchParams(global.location.search).get('lang');
    if (q) { q = q.split('-')[0].toLowerCase(); if (DICT[q]) return q; }

    var nav = (global.navigator.language || '').split('-')[0].toLowerCase();
    if (DICT[nav]) return nav;

    return DEFAULT_LANG;
  }

  var currentLang = detectLang();

  /* Traduzione. Catena: lingua attiva > default > la chiave stessa.
     Restituire la chiave invece di stringa vuota rende le lacune visibili
     in sviluppo anziché silenziose in produzione. */
  function t(key, vars) {
    var s = (DICT[currentLang] && DICT[currentLang][key]);
    if (s == null) s = (DICT[DEFAULT_LANG] && DICT[DEFAULT_LANG][key]);
    if (s == null) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return s;
  }

  /* Applica le traduzioni al DOM.
     data-i18n            -> testo del nodo
     data-i18n-placeholder-> attributo placeholder
     data-i18n-title      -> attributo title */
  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    document.documentElement.setAttribute('lang', currentLang);
  }

  function setLang(lang) {
    if (!DICT[lang]) return false;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply();
    /* Le pagine che caricano dati dal backend si riagganciano qui per
       rifare le fetch con ?lang= aggiornato. */
    global.dispatchEvent(new CustomEvent('qui:langchange', { detail: { lang: lang } }));
    return true;
  }

  function getLang() { return currentLang; }

  /* Lingue disponibili: solo quelle davvero popolate in DICT. */
  function available() {
    return Object.keys(DICT).map(function (code) {
      return { code: code, name: LANG_NAMES[code] || code };
    });
  }

  /* Suffisso da accodare alle chiamate API, così i dati arrivano
     nella stessa lingua dell'interfaccia. */
  function apiParam(url) {
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'lang=' + currentLang;
  }

  global.I18N = {
    t: t, apply: apply, setLang: setLang, getLang: getLang,
    available: available, apiParam: apiParam, DICT: DICT
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    apply();
  }
})(window);
