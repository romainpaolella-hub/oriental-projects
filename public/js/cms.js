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
      'res_eyebrow,res_heading,res_paragraphs,res_caption,res_specsIntro,res_specs,res_specsNote,res_cta,' +
      'vil_eyebrow,vil_heading,vil_body,vil_cards,vil_cardsNote,' +
      'vil_archEyebrow,vil_archHeading,vil_arch,vil_specsEyebrow,vil_specsHeading,vil_specs,' +
      'vil_matEyebrow,vil_matHeading,vil_matBody,vil_mat,' +
      'vil_galEyebrow,vil_galHeading,vil_galNote,vil_galNote2,vil_cta,' +
      'loc_heroEyebrow,loc_heroTitle,loc_eyebrow,loc_heading,loc_body,loc_distances,loc_distancesNote,' +
      'loc_poiEyebrow,loc_poiHeading,loc_poiNote,loc_islandEyebrow,loc_islandHeading,loc_island,loc_cta,' +
      'inv_heroTitle,inv_simEyebrow,inv_simHeading,inv_simBody,inv_simNote,' +
      'inv_stepsEyebrow,inv_stepsHeading,inv_steps,inv_stepsProse,inv_stepsNote,' +
      'inv_leaseEyebrow,inv_leaseHeading,inv_leaseIntro,inv_leaseRows,inv_leaseTotalLabel,inv_leaseTotalValue,inv_leaseTable,inv_leaseNote,' +
      'inv_faqEyebrow,inv_faqHeading,inv_faq,inv_faqNote,inv_cta}' +
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

  // Reconstruit un tableau .amen (colonnes h4 + lignes .row span/b) depuis un tableau de {title,rows:[{label,value}]}.
  function fillSpecTable(box, groups) {
    if (!box || !groups || !groups.length) return;
    var html = '';
    groups.forEach(function (col) {
      html += '<div><h4></h4>';
      (col.rows || []).forEach(function () { html += '<div class="row"><span></span><b></b></div>'; });
      html += '</div>';
    });
    box.innerHTML = html;
    var cols = box.children;
    groups.forEach(function (col, ci) {
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

  // Reconstruit une liste .n01/.serif + h3/h4 + p depuis un tableau de {num,title,body}.
  function fillNumItems(nodeList, items) {
    if (!items) return;
    for (var i = 0; i < nodeList.length && i < items.length; i++) {
      var el = nodeList[i], it = items[i];
      setText(el.querySelector('[data-cms-f="num"]') || el.querySelector('.n, .serif'), it.num);
      setText(el.querySelector('[data-cms-f="title"]') || el.querySelector('h3, h4'), pick(it.title));
      setText(el.querySelector('[data-cms-f="body"]') || el.querySelector('p'), pick(it.body));
    }
  }

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
    fillSpecTable(q('res.specs'), doc.res_specs);

    // ---- Les Villas ----
    setText(q('vil.eyebrow'), pick(doc.vil_eyebrow));
    setText(q('vil.heading'), pick(doc.vil_heading));
    setText(q('vil.body'), pick(doc.vil_body));
    setText(q('vil.cardsNote'), pick(doc.vil_cardsNote));
    setText(q('vil.archEyebrow'), pick(doc.vil_archEyebrow));
    setText(q('vil.archHeading'), pick(doc.vil_archHeading));
    setText(q('vil.specsEyebrow'), pick(doc.vil_specsEyebrow));
    setText(q('vil.specsHeading'), pick(doc.vil_specsHeading));
    setText(q('vil.matEyebrow'), pick(doc.vil_matEyebrow));
    setText(q('vil.matHeading'), pick(doc.vil_matHeading));
    setText(q('vil.matBody'), pick(doc.vil_matBody));
    setText(q('vil.galEyebrow'), pick(doc.vil_galEyebrow));
    setText(q('vil.galHeading'), pick(doc.vil_galHeading));
    setText(q('vil.galNote'), pick(doc.vil_galNote));
    setText(q('vil.galNote2'), pick(doc.vil_galNote2));
    setText(q('vil.cta'), pick(doc.vil_cta));
    fillSpecTable(q('vil.specs'), doc.vil_specs);
    fillNumItems(all('vil.archItem'), doc.vil_arch);
    fillNumItems(all('vil.matItem'), doc.vil_mat);

    // cartes (parcelles / typologies) — index par index
    if (doc.vil_cards && doc.vil_cards.length) {
      var cards = all('vil.card');
      doc.vil_cards.forEach(function (cd, ci) {
        var el = cards[ci];
        if (!el) return;
        var f = function (name) { return el.querySelector('[data-cms-f="' + name + '"]'); };
        setText(f('badge'), pick(cd.badge));
        setText(f('subtitle'), pick(cd.subtitle));
        setText(f('zone'), pick(cd.zone));
        setText(f('title'), pick(cd.title));
        setText(f('desc'), pick(cd.desc));
        setText(f('price'), pick(cd.price));
        setText(f('priceNote'), pick(cd.priceNote));
        setText(f('link'), pick(cd.linkText));
        var ul = f('specs');
        if (ul && cd.specs && cd.specs.length) {
          ul.innerHTML = cd.specs.map(function () { return '<li><span></span><b></b></li>'; }).join('');
          var lis = ul.querySelectorAll('li');
          cd.specs.forEach(function (s, si) {
            if (!lis[si]) return;
            setText(lis[si].querySelector('span'), pick(s.label));
            setText(lis[si].querySelector('b'), pick(s.value));
          });
        }
      });
    }

    // ---- Localisation ----
    setText(q('loc.heroEyebrow'), pick(doc.loc_heroEyebrow));
    setText(q('loc.heroTitle'), pick(doc.loc_heroTitle));
    setText(q('loc.eyebrow'), pick(doc.loc_eyebrow));
    setText(q('loc.heading'), pick(doc.loc_heading));
    setText(q('loc.body'), pick(doc.loc_body));
    setText(q('loc.distNote'), pick(doc.loc_distancesNote));
    setText(q('loc.poiEyebrow'), pick(doc.loc_poiEyebrow));
    setText(q('loc.poiHeading'), pick(doc.loc_poiHeading));
    setText(q('loc.poiNote'), pick(doc.loc_poiNote));
    setText(q('loc.islandEyebrow'), pick(doc.loc_islandEyebrow));
    setText(q('loc.islandHeading'), pick(doc.loc_islandHeading));
    setText(q('loc.cta'), pick(doc.loc_cta));
    fillNumItems(all('loc.islandItem'), doc.loc_island);
    if (doc.loc_distances && doc.loc_distances.length) {
      var drows = all('loc.distRow');
      doc.loc_distances.forEach(function (r, i) {
        if (!drows[i]) return;
        setText(drows[i].querySelector('span'), pick(r.label));
        setText(drows[i].querySelector('b'), pick(r.value));
      });
    }

    // ---- Investir ----
    setText(q('inv.heroTitle'), pick(doc.inv_heroTitle));
    setText(q('inv.simEyebrow'), pick(doc.inv_simEyebrow));
    setText(q('inv.simHeading'), pick(doc.inv_simHeading));
    setText(q('inv.simBody'), pick(doc.inv_simBody));
    setText(q('inv.simNote'), pick(doc.inv_simNote));
    setText(q('inv.stepsEyebrow'), pick(doc.inv_stepsEyebrow));
    setText(q('inv.stepsHeading'), pick(doc.inv_stepsHeading));
    setText(q('inv.stepsProse'), pick(doc.inv_stepsProse));
    setText(q('inv.stepsNote'), pick(doc.inv_stepsNote));
    setText(q('inv.leaseEyebrow'), pick(doc.inv_leaseEyebrow));
    setText(q('inv.leaseHeading'), pick(doc.inv_leaseHeading));
    setText(q('inv.leaseIntro'), pick(doc.inv_leaseIntro));
    setText(q('inv.leaseNote'), pick(doc.inv_leaseNote));
    setText(q('inv.faqEyebrow'), pick(doc.inv_faqEyebrow));
    setText(q('inv.faqHeading'), pick(doc.inv_faqHeading));
    setText(q('inv.faqNote'), pick(doc.inv_faqNote));
    setText(q('inv.cta'), pick(doc.inv_cta));
    fillSpecTable(q('inv.leaseTable'), doc.inv_leaseTable);

    if (doc.inv_steps && doc.inv_steps.length) {
      var steps = all('inv.step');
      doc.inv_steps.forEach(function (s, i) {
        var el = steps[i];
        if (!el) return;
        setText(el.querySelector('.pct'), pick(s.pct));
        setText(el.querySelector('.n'), pick(s.label));
        setText(el.querySelector('h4'), pick(s.title));
        setText(el.querySelector('p'), pick(s.body));
      });
    }

    if (doc.inv_leaseRows && doc.inv_leaseRows.length) {
      var lrows = all('inv.leaseRow');
      doc.inv_leaseRows.forEach(function (r, i) {
        var el = lrows[i];
        if (!el) return;
        var span = el.querySelector('span');
        var lbl = pick(r.label);
        if (span && lbl) {
          var tn = span.firstChild;
          if (tn && tn.nodeType === 3) tn.nodeValue = lbl; else setText(span, lbl);
        }
        setText(el.querySelector('small'), pick(r.sublabel));
        setText(el.querySelector('b'), pick(r.value));
      });
      var totEl = q('inv.leaseTotal');
      if (totEl) {
        setText(totEl.querySelector('span'), pick(doc.inv_leaseTotalLabel));
        setText(totEl.querySelector('b'), pick(doc.inv_leaseTotalValue));
      }
    }

    if (doc.inv_faq && doc.inv_faq.length) {
      var faqs = all('inv.faqItem');
      doc.inv_faq.forEach(function (it, i) {
        var el = faqs[i];
        if (!el) return;
        setText(el.querySelector('summary'), pick(it.q));
        setText(el.querySelector('p'), pick(it.a));
      });
    }
  };
})();
