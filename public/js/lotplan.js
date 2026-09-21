/* KOH SAMUI ESTATE — plan des lots interactif générique (nouveaux programmes, Phase D).
   Page autonome (pas de dépendance à cms.js/site.js), sur le modèle des plans
   déjà construits à la main (terra-mare/eden-tropical/sea-view), mais entièrement
   piloté par Sanity : image de fond, liste des lots, position, statut, prix,
   caractéristiques — rien n'est codé en dur. Mode gestion : ajout/suppression/
   déplacement/redimensionnement de lot, sauvegarde via /api/lots (même mécanisme
   que les 3 plans existants). */

(function () {
  var PROJECT_ID = 'x3jcttot';
  var DATASET = 'production';

  function currentSlug() {
    var parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'en') parts.shift();
    return parts[0] || null;
  }
  var SLUG = currentSlug();
  var qsLang = new URLSearchParams(location.search).get('lang');
  var htmlLang = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  var lang = (qsLang === 'en' || (!qsLang && htmlLang === 'en')) ? 'en' : 'fr';

  function imgUrl(url, w) {
    if (!url) return '';
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep + 'auto=format&q=72' + (w ? '&w=' + w : '');
  }

  var I18N = {
    fr: {
      pick: 'Sélectionnez un lot sur le plan pour voir son détail.',
      empty: 'Aucun lot pour l’instant. Activez le Mode gestion pour en ajouter.',
      lg_a: 'Disponible', lg_r: 'Réservé', lg_s: 'Vendu',
      s_available: 'Disponible', s_reserved: 'Réservé', s_sold: 'Vendu',
      manage: '⚙︎ Mode gestion',
      m_hint: 'Mode gestion — cliquez « + Ajouter un lot », glissez-le sur le plan pour le positionner (poignées aux coins = redimensionner, flèches du clavier = ajustement fin, Maj+flèches = taille). Renseignez son nom, statut, prix et caractéristiques ci-dessous. Entrez le mot de passe une fois : « Appliquer » enregistre alors en direct, visible par tous les visiteurs.',
      m_add: '+ Ajouter un lot', m_del: 'Supprimer ce lot', m_apply: 'Appliquer', m_reload: 'Recharger depuis le serveur',
      m_name: 'Nom', m_status: 'Statut', m_price: 'Prix', m_specs: 'Caractéristiques (une par ligne, « Intitulé : Valeur »)',
      onreq: 'Prix sur demande', d_ref: 'Référence', noimg: 'Téléversez une image du plan depuis Studio (document « Plan des lots », champ « Image du plan »).',
      pwreq: 'Mot de passe requis pour sauvegarder', wrongpw: 'Mot de passe incorrect', savefail: 'Échec de l’enregistrement',
      savedok: 'Enregistré — visible par tous', reloaded: 'Rechargé depuis le serveur', nosel: 'Sélectionnez d’abord un lot',
    },
    en: {
      pick: 'Select a plot on the plan to see its details.',
      empty: 'No plots yet. Turn on Manage mode to add one.',
      lg_a: 'Available', lg_r: 'Reserved', lg_s: 'Sold',
      s_available: 'Available', s_reserved: 'Reserved', s_sold: 'Sold',
      manage: '⚙︎ Manage mode',
      m_hint: 'Manage mode — click “+ Add plot”, then drag it on the plan to position it (corner handles = resize, arrow keys = fine adjustment, Shift+arrows = size). Fill in its name, status, price and specs below. Enter the password once: “Apply” then saves live, visible to every visitor.',
      m_add: '+ Add plot', m_del: 'Delete this plot', m_apply: 'Apply', m_reload: 'Reload from server',
      m_name: 'Name', m_status: 'Status', m_price: 'Price', m_specs: 'Specs (one per line, “Label: Value”)',
      onreq: 'Price on request', d_ref: 'Reference', noimg: 'Upload a plan image in Studio (“Lot plan” document, “Plan image” field).',
      pwreq: 'Password required to save', wrongpw: 'Wrong password', savefail: 'Save failed',
      savedok: 'Saved — visible to everyone', reloaded: 'Reloaded from server', nosel: 'Select a plot first',
    },
  };
  function t(k) { return I18N[lang][k] || k; }
  var STL = {available: 's_available', reserved: 's_reserved', sold: 's_sold'};

  var stage = document.getElementById('stage');
  var detail = document.getElementById('detail');
  var legend = document.getElementById('legend');
  var toastEl = document.getElementById('toast');
  var mHint = document.getElementById('mHint');
  var mName = document.getElementById('mName');
  var mStatus = document.getElementById('mStatus');
  var mPrice = document.getElementById('mPrice');
  var mSpecs = document.getElementById('mSpecs');
  var mSecret = document.getElementById('mSecret');
  var mApply = document.getElementById('mApply');
  var mDel = document.getElementById('mDel');
  var mPos = document.getElementById('mPos');
  var manageToggle = document.getElementById('manageToggle');

  var lots = [];
  var selected = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  function round2(v) { return Math.round(v * 100) / 100; }
  function clampSize(v) { return Math.max(2, round2(v)); }
  function cssid(id) { return id.replace(/\+/g, '\\2B '); }

  function nextId() {
    var n = 1;
    lots.forEach(function (l) { var v = parseInt(l.id, 10); if (!isNaN(v) && v >= n) n = v + 1; });
    return String(n);
  }

  function specsFromText(str) {
    return (str || '').split('\n').map(function (line) {
      var i = line.indexOf(':');
      if (i === -1) return null;
      var label = line.slice(0, i).trim(), value = line.slice(i + 1).trim();
      if (!label && !value) return null;
      return {label: label, value: value};
    }).filter(Boolean);
  }
  function specsToText(specs) {
    return (specs || []).map(function (s) { return (s.label || '') + ': ' + (s.value || ''); }).join('\n');
  }

  /* ---------- Chargement depuis Sanity (lecture publique) ---------- */
  var READ_URL = 'https://' + PROJECT_ID + '.apicdn.sanity.io/v2024-01-01/data/query/' + DATASET +
    '?query=' + encodeURIComponent('*[_type=="lotPlan" && programmeSlug=="' + SLUG + '"][0]{' +
      'lots,"planImage":planImage.asset->url,"planW":planImage.asset->metadata.dimensions.width,"planH":planImage.asset->metadata.dimensions.height}');

  function setBackground(url, w, h) {
    if (!stage) return;
    var ratio = (w && h) ? (w + '/' + h) : '8/5';
    stage.style.aspectRatio = ratio;
    var bg = url ? imgUrl(url, 1600) : '/images/villa-template/placeholder.jpg';
    stage.style.backgroundImage = 'url("' + bg + '")';
  }

  async function fetchLiveLots() {
    if (!SLUG) return;
    try {
      var r = await fetch(READ_URL);
      var j = await r.json();
      var doc = j.result || null;
      setBackground(doc && doc.planImage, doc && doc.planW, doc && doc.planH);
      lots = ((doc && doc.lots) || []).map(function (o) {
        return {
          id: o.lotId, status: o.status || 'available', price: o.price || '', name: o.name || '',
          specs: o.specs || [], box: (Array.isArray(o.box) && o.box.length === 4) ? o.box.slice() : [40, 40, 16, 16],
        };
      });
      buildPlan(); renderDetail();
    } catch (e) {
      setBackground(null);
      console.warn('lotPlan fetch failed', e);
    }
  }

  /* ---------- Rendu du plan ---------- */
  function buildPlan() {
    if (!stage) return;
    stage.querySelectorAll('.lot,.handle').forEach(function (n) { n.remove(); });
    lots.forEach(function (l) {
      var b = document.createElement('button');
      b.className = 'lot ' + l.status;
      b.dataset.id = l.id;
      b.style.left = l.box[0] + '%'; b.style.top = l.box[1] + '%';
      b.style.width = l.box[2] + '%'; b.style.height = l.box[3] + '%';
      b.textContent = l.name || l.id;
      b.addEventListener('click', function () { select(l.id); });
      attachDrag(b, l);
      stage.appendChild(b);
    });
    renderHandles();
  }

  function attachDrag(b, l) {
    b.addEventListener('dragstart', function (e) { e.preventDefault(); });
    b.addEventListener('pointerdown', function (e) {
      if (!document.body.classList.contains('managing')) return;
      if (e.target.closest('.handle')) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, startBox = l.box.slice(), dragging = false;
      function onMove(e2) {
        var rect = stage.getBoundingClientRect();
        var dxPct = (e2.clientX - sx) / rect.width * 100, dyPct = (e2.clientY - sy) / rect.height * 100;
        if (!dragging && (Math.abs(dxPct) > 0.3 || Math.abs(dyPct) > 0.3)) dragging = true;
        if (!dragging) return;
        l.box[0] = round2(startBox[0] + dxPct); l.box[1] = round2(startBox[1] + dyPct);
        b.style.left = l.box[0] + '%'; b.style.top = l.box[1] + '%';
        updatePosReadout();
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        select(l.id);
        if (dragging) toast(lang === 'fr' ? 'Position déplacée — cliquez Appliquer pour enregistrer' : 'Position moved — click Apply to save');
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  }
  function applyBoxToDom(l) {
    var btn = stage.querySelector('.lot[data-id="' + cssid(l.id) + '"]');
    if (btn) { btn.style.left = l.box[0] + '%'; btn.style.top = l.box[1] + '%'; btn.style.width = l.box[2] + '%'; btn.style.height = l.box[3] + '%'; }
  }
  function renderHandles() {
    stage.querySelectorAll('.handle').forEach(function (h) { h.remove(); });
    if (!document.body.classList.contains('managing') || !selected) return;
    var l = lots.find(function (x) { return x.id === selected; }); if (!l) return;
    var btn = stage.querySelector('.lot[data-id="' + cssid(l.id) + '"]'); if (!btn) return;
    ['nw', 'ne', 'sw', 'se'].forEach(function (pos) {
      var h = document.createElement('div');
      h.className = 'handle ' + pos;
      h.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); startResize(pos, l, btn, e); });
      btn.appendChild(h);
    });
  }
  function startResize(pos, l, btn, e) {
    var sx = e.clientX, sy = e.clientY, start = l.box.slice();
    var rect = stage.getBoundingClientRect();
    function onMove(e2) {
      var dxPct = (e2.clientX - sx) / rect.width * 100, dyPct = (e2.clientY - sy) / rect.height * 100;
      var left = start[0], top = start[1], w = start[2], h = start[3];
      if (pos === 'se') { w = clampSize(start[2] + dxPct); h = clampSize(start[3] + dyPct); }
      else if (pos === 'sw') { w = clampSize(start[2] - dxPct); left = round2(start[0] + dxPct); h = clampSize(start[3] + dyPct); }
      else if (pos === 'ne') { w = clampSize(start[2] + dxPct); h = clampSize(start[3] - dyPct); top = round2(start[1] + dyPct); }
      else if (pos === 'nw') { w = clampSize(start[2] - dxPct); left = round2(start[0] + dxPct); h = clampSize(start[3] - dyPct); top = round2(start[1] + dyPct); }
      l.box = [left, top, w, h];
      btn.style.left = left + '%'; btn.style.top = top + '%'; btn.style.width = w + '%'; btn.style.height = h + '%';
      updatePosReadout();
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      toast(lang === 'fr' ? 'Taille modifiée — cliquez Appliquer pour enregistrer' : 'Size changed — click Apply to save');
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }
  function updatePosReadout() {
    if (!mPos) return;
    var l = lots.find(function (x) { return x.id === selected; });
    mPos.textContent = l ? ('x:' + l.box[0].toFixed(1) + ' y:' + l.box[1].toFixed(1) + ' w:' + l.box[2].toFixed(1) + ' h:' + l.box[3].toFixed(1)) : '';
  }
  document.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('managing') || !selected) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) === -1) return;
    var l = lots.find(function (x) { return x.id === selected; }); if (!l) return;
    e.preventDefault();
    var step = (e.ctrlKey || e.metaKey) ? 1 : 0.25;
    if (e.shiftKey) {
      if (e.key === 'ArrowRight') l.box[2] = clampSize(l.box[2] + step);
      else if (e.key === 'ArrowLeft') l.box[2] = clampSize(l.box[2] - step);
      else if (e.key === 'ArrowDown') l.box[3] = clampSize(l.box[3] + step);
      else if (e.key === 'ArrowUp') l.box[3] = clampSize(l.box[3] - step);
    } else {
      if (e.key === 'ArrowLeft') l.box[0] = round2(l.box[0] - step);
      else if (e.key === 'ArrowRight') l.box[0] = round2(l.box[0] + step);
      else if (e.key === 'ArrowUp') l.box[1] = round2(l.box[1] - step);
      else if (e.key === 'ArrowDown') l.box[1] = round2(l.box[1] + step);
    }
    applyBoxToDom(l); updatePosReadout();
  });

  /* ---------- Sélection & détail ---------- */
  function select(id) {
    selected = id;
    stage.querySelectorAll('.lot').forEach(function (n) { n.classList.toggle('sel', n.dataset.id === id); });
    renderDetail(); syncManage(); renderHandles(); updatePosReadout();
  }
  function priceFor(l) { return l.price || t('onreq'); }
  function renderDetail() {
    if (!detail) return;
    if (!lots.length) { detail.innerHTML = '<div class="ph">' + t('empty') + '</div>'; return; }
    var l = lots.find(function (x) { return x.id === selected; });
    if (!l) { detail.innerHTML = '<div class="ph">' + t('pick') + '</div>'; return; }
    var rows = (l.specs || []).map(function (s) {
      return '<div class="row"><span>' + escapeHtml(s.label) + '</span><b>' + escapeHtml(s.value) + '</b></div>';
    }).join('');
    detail.innerHTML =
      '<h3><span class="disp">' + escapeHtml(l.name || l.id) + '</span> <span class="badge ' + l.status + '">' + t(STL[l.status]) + '</span></h3>' +
      '<div class="rows">' + rows +
      '<div class="row"><span>' + t('m_price') + '</span><b>' + escapeHtml(priceFor(l)) + '</b></div>' +
      '<div class="row"><span>' + t('d_ref') + '</span><b>' + escapeHtml(l.id) + '</b></div>' +
      '</div>';
  }
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------- Mode gestion ---------- */
  function syncManage() {
    var l = lots.find(function (x) { return x.id === selected; });
    var has = !!l;
    [mName, mStatus, mPrice, mSpecs, mApply, mDel].forEach(function (el) { if (el) el.disabled = !has; });
    if (l) { mName.value = l.name || ''; mStatus.value = l.status; mPrice.value = l.price || ''; mSpecs.value = specsToText(l.specs); }
  }
  if (manageToggle) manageToggle.addEventListener('click', function () {
    document.body.classList.toggle('managing');
    manageToggle.classList.toggle('on', document.body.classList.contains('managing'));
    renderHandles();
  });
  var mAdd = document.getElementById('mAdd');
  if (mAdd) mAdd.addEventListener('click', function () {
    var id = nextId();
    lots.push({id: id, status: 'available', price: '', name: '', specs: [], box: [40, 40, 16, 16]});
    buildPlan(); select(id);
  });
  if (mDel) mDel.addEventListener('click', function () {
    if (!selected) { toast(t('nosel')); return; }
    lots = lots.filter(function (x) { return x.id !== selected; });
    selected = null;
    buildPlan(); renderDetail(); syncManage();
    toast(lang === 'fr' ? 'Lot supprimé — cliquez Appliquer pour enregistrer' : 'Plot deleted — click Apply to save');
  });
  [mName, mStatus, mPrice, mSpecs].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      var l = lots.find(function (x) { return x.id === selected; }); if (!l) return;
      l.name = mName.value.trim(); l.status = mStatus.value; l.price = mPrice.value.trim(); l.specs = specsFromText(mSpecs.value);
      var btn = stage.querySelector('.lot[data-id="' + cssid(l.id) + '"]');
      if (btn) { btn.className = 'lot ' + l.status + (selected === l.id ? ' sel' : ''); btn.textContent = l.name || l.id; }
      renderDetail();
    });
  });
  function getSecret() {
    var s = mSecret.value.trim();
    if (!s) { try { s = sessionStorage.getItem('lots_secret') || ''; } catch (e) {} if (s) mSecret.value = s; }
    return s;
  }
  if (mApply) mApply.addEventListener('click', async function () {
    var secret = getSecret();
    if (!secret) { toast(t('pwreq')); return; }
    mApply.disabled = true;
    try {
      var res = await fetch('/api/lots', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          programmeSlug: SLUG, secret: secret,
          lots: lots.map(function (x) { return {lotId: x.id, status: x.status, price: x.price || '', box: x.box, name: x.name || '', specs: x.specs || []}; }),
        }),
      });
      var j = await res.json().catch(function () { return {}; });
      if (res.ok && j.ok) { try { sessionStorage.setItem('lots_secret', secret); } catch (e) {} toast(t('savedok')); }
      else if (res.status === 401) { toast(t('wrongpw')); try { sessionStorage.removeItem('lots_secret'); } catch (e) {} }
      else { toast(t('savefail')); }
    } catch (e) { toast(t('savefail')); }
    mApply.disabled = false; syncManage();
  });
  var mReload = document.getElementById('mReload');
  if (mReload) mReload.addEventListener('click', async function () {
    selected = null;
    await fetchLiveLots();
    toast(t('reloaded'));
  });

  /* ---------- Init ---------- */
  function applyLang() {
    if (legend) legend.innerHTML =
      '<span class="lg"><i class="available"></i>' + t('lg_a') + '</span>' +
      '<span class="lg"><i class="reserved"></i>' + t('lg_r') + '</span>' +
      '<span class="lg"><i class="sold"></i>' + t('lg_s') + '</span>';
    if (mHint) mHint.textContent = t('m_hint');
    if (manageToggle) manageToggle.textContent = t('manage');
    if (mAdd) mAdd.textContent = t('m_add');
    if (mDel) mDel.textContent = t('m_del');
    if (mApply) mApply.textContent = t('m_apply');
    if (mReload) mReload.textContent = t('m_reload');
    var lblName = document.getElementById('lblName'); if (lblName) lblName.textContent = t('m_name');
    var lblStatus = document.getElementById('lblStatus'); if (lblStatus) lblStatus.textContent = t('m_status');
    var lblPrice = document.getElementById('lblPrice'); if (lblPrice) lblPrice.textContent = t('m_price');
    var lblSpecs = document.getElementById('lblSpecs'); if (lblSpecs) lblSpecs.textContent = t('m_specs');
    var mStatusA = document.getElementById('mStatusA'); if (mStatusA) mStatusA.textContent = t('s_available');
    var mStatusR = document.getElementById('mStatusR'); if (mStatusR) mStatusR.textContent = t('s_reserved');
    var mStatusS = document.getElementById('mStatusS'); if (mStatusS) mStatusS.textContent = t('s_sold');
  }
  applyLang();
  renderDetail();
  fetchLiveLots();
})();
