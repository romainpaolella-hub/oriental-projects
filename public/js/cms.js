/* ORIENTAL PROJECTS — pont vers le CMS Sanity (lecture en direct, sans redéploiement).
   Si OD_CMS.projectId est vide, le site utilise le contenu de js/projects.js (repli). */

window.OD_CMS = {
  projectId: 'x3jcttot',    // projet Sanity « Oriental Projects »
  dataset: 'production',
  apiVersion: '2024-01-01',
};

(function () {
  var C = window.OD_CMS;

  // ---- URL d'image Sanity avec redimensionnement / WebP automatiques ----
  window.OD_img = function (url, w) {
    if (!url) return '';
    if (url.indexOf('cdn.sanity.io') === -1) return url;
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep + 'auto=format&q=72' + (w ? '&w=' + w : '');
  };
  var LANG = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'fr';
  var pick = function (v) {
    if (!v || typeof v !== 'object') return v || '';
    if (!('fr' in v || 'en' in v)) return v || '';
    return LANG === 'en' ? (v.en || v.fr || '') : (v.fr || v.en || '');
  };
  var locArr = function (a) { return (a || []).map(pick); };

  var GROQ =
    '{' +
    '"settings":*[_type=="siteSettings"][0]{stats[]{value,label}},' +
    '"hero":*[_type=="heroSlide"]|order(order asc){brand,kind,linkHref,kicker,title,sub,cta,' +
      '"video":video.asset->url,"poster":poster.asset->url,"image":image.asset->url,' +
      '"iw":image.asset->metadata.dimensions.width,"ih":image.asset->metadata.dimensions.height},' +
    '"programmes":*[_type=="programme"]|order(order asc){name,zone,"slug":slug.current,status,statusLabel,pitch,facts,' +
      '"img":cardImage.asset->url,"w":cardImage.asset->metadata.dimensions.width,"h":cardImage.asset->metadata.dimensions.height},' +
    '"dispos":*[_type=="villaDispo"]|order(order asc){name,isPlaceholder,note,statusLabel,specs,price,rentMonthly,linkHref,' +
      '"img":images[0].asset->url,"w":images[0].asset->metadata.dimensions.width,"h":images[0].asset->metadata.dimensions.height},' +
    '"realisations":*[_type=="realisation"]|order(order asc){name,"slug":slug.current,zone,tag,blurb,linkHref,' +
      '"cover":cover.asset->url,"w":cover.asset->metadata.dimensions.width,"h":cover.asset->metadata.dimensions.height},' +
    '"pages":*[_type=="programmePage"]{programmeSlug,' +
      'res_eyebrow,res_heading,res_paragraphs,res_caption,res_specsIntro,res_specs,res_specsNote,res_cta}' +
    '}';

  window.OD_loadCMS = function () {
    if (!C.projectId) return Promise.resolve(false);
    var url =
      'https://' + C.projectId + '.apicdn.sanity.io/v' + C.apiVersion +
      '/data/query/' + C.dataset + '?query=' + encodeURIComponent(GROQ);

    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Sanity ' + r.status);
      return r.json();
    }).then(function (res) {
      var d = res.result || {};

      // ---- STATS ----
      if (d.settings && d.settings.stats && d.settings.stats.length) {
        window.STATS = d.settings.stats.map(function (s) { return {n: s.value, l: pick(s.label)}; });
      }

      // ---- HERO ----
      if (d.hero && d.hero.length) {
        window.HERO = d.hero.map(function (s) {
          var isVideo = s.kind === 'video';
          return {
            brand: !!s.brand,
            type: isVideo ? 'video' : 'image',
            src: isVideo ? s.video : undefined,
            poster: s.poster ? OD_img(s.poster, 1600) : undefined,
            img: !isVideo ? OD_img(s.image, 1920) : undefined,
            w: !isVideo ? s.iw : undefined,
            h: !isVideo ? s.ih : undefined,
            kicker: pick(s.kicker),
            title: s.title || '',
            sub: pick(s.sub),
            href: s.linkHref,
            cta: pick(s.cta),
          };
        });
      }

      // ---- PROGRAMMES (fiches accueil) ----
      if (d.programmes && d.programmes.length) {
        window.PROJECTS = d.programmes.map(function (p) {
          return {
            name: p.name,
            zone: p.zone,
            img: OD_img(p.img, 1400),
            w: p.w, h: p.h,
            status: p.status === 'livre' ? 'livre' : 'plan',
            statusLabel: pick(p.statusLabel),
            pitch: pick(p.pitch),
            facts: locArr(p.facts),
            href: (p.slug || '') + '/index.html',
          };
        });
      }

      // ---- VILLAS À VENDRE ----
      if (d.dispos && d.dispos.length) {
        window.DISPOS = d.dispos.map(function (v) {
          if (v.isPlaceholder) return {placeholder: true, name: v.name, note: pick(v.note)};
          return {
            name: v.name,
            img: OD_img(v.img, 1200),
            w: v.w, h: v.h,
            statusLabel: pick(v.statusLabel),
            specs: locArr(v.specs),
            price: v.price,
            rentMonthly: v.rentMonthly,
            href: v.linkHref || 'contact.html',
          };
        });
      }

      // ---- RÉALISATIONS (grille accueil) ----
      if (d.realisations && d.realisations.length) {
        window.REALISATIONS_VILLAS = d.realisations.map(function (r) {
          return {
            slug: r.slug,
            name: r.name,
            zone: pick(r.zone),
            tag: pick(r.tag),
            cover: OD_img(r.cover, 1400),
            w: r.w, h: r.h,
            blurb: pick(r.blurb),
            href: r.linkHref || 'realisations/' + r.slug + '.html',
          };
        });
      }

      // ---- PAGES PROGRAMME (textes des sous-pages) ----
      window.OD_PAGES = d.pages || [];

      return true;
    });
  };

  // ---- Rendu des textes de sous-pages programme (data-cms="…") ----
  // Détecte le programme depuis l'URL (/sea-view/residence.html, /en/eden-tropical/…).
  var SLUGS = ['sea-view', 'eden-tropical', 'terra-mare'];
  function currentSlug() {
    var parts = location.pathname.split('/').filter(Boolean);
    for (var i = 0; i < parts.length; i++) if (SLUGS.indexOf(parts[i]) !== -1) return parts[i];
    return null;
  }
  function setText(node, val) { if (node && val != null && val !== '') node.textContent = val; }

  window.OD_renderProgrammePage = function () {
    var slug = currentSlug();
    if (!slug || !window.OD_PAGES || !window.OD_PAGES.length) return;
    var doc = null;
    for (var i = 0; i < window.OD_PAGES.length; i++)
      if (window.OD_PAGES[i].programmeSlug === slug) { doc = window.OD_PAGES[i]; break; }
    if (!doc) return;

    var q = function (sel) { return document.querySelector('[data-cms="' + sel + '"]'); };
    var all = function (sel) { return document.querySelectorAll('[data-cms="' + sel + '"]'); };

    // ---- La Résidence ----
    setText(q('res.eyebrow'), pick(doc.res_eyebrow));
    setText(q('res.heading'), pick(doc.res_heading));
    setText(q('res.caption'), pick(doc.res_caption));
    setText(q('res.cta'), pick(doc.res_cta));
    if (doc.res_specsIntro) {
      setText(q('res.specsEyebrow'), pick(doc.res_specsIntro.eyebrow));
      setText(q('res.specsHeading'), pick(doc.res_specsIntro.heading));
    }
    setText(q('res.specsNote'), pick(doc.res_specsNote));

    // paragraphes (dans l'ordre)
    if (doc.res_paragraphs && doc.res_paragraphs.length) {
      var ps = all('res.p');
      for (var j = 0; j < ps.length && j < doc.res_paragraphs.length; j++)
        setText(ps[j], pick(doc.res_paragraphs[j]));
    }

    // tableau « ce qui est livré » (Eden / Terra)
    var specBox = q('res.specs');
    if (specBox && doc.res_specs && doc.res_specs.length) {
      var html = '';
      doc.res_specs.forEach(function (col) {
        html += '<div><h4></h4>';
        (col.rows || []).forEach(function (r) {
          html += '<div class="row"><span></span><b></b></div>';
        });
        html += '</div>';
      });
      specBox.innerHTML = html;
      var cols = specBox.children;
      doc.res_specs.forEach(function (col, ci) {
        var el = cols[ci];
        if (!el) return;
        setText(el.querySelector('h4'), pick(col.title));
        var rws = el.querySelectorAll('.row');
        (col.rows || []).forEach(function (r, ri) {
          if (!rws[ri]) return;
          setText(rws[ri].querySelector('span'), pick(r.label));
          setText(rws[ri].querySelector('b'), pick(r.value));
        });
      });
    }
  };
})();
