/* KOH SAMUI ESTATE — pont vers le CMS Sanity (lecture en direct, sans redéploiement).
   Si OD_CMS.projectId est vide, le site utilise le contenu de js/projects.js (repli). */

window.OD_CMS = {
  projectId: 'x3jcttot',    // projet Sanity « Koh Samui Estate »
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
    '"settings":*[_type=="siteSettings"][0]{stats[]{value,label},tagline,' +
      'phones[]{label,number,whatsapp,whatsappNote},email,contactIntro,mapQuery,footCopyright},' +
    '"hero":*[_type=="heroSlide"]|order(order asc){brand,kind,linkHref,kicker,title,sub,cta,' +
      '"video":video.asset->url,"poster":poster.asset->url,"image":image.asset->url,' +
      '"iw":image.asset->metadata.dimensions.width,"ih":image.asset->metadata.dimensions.height},' +
    '"programmes":*[_type=="programme"]|order(order asc){name,zone,"slug":slug.current,status,statusLabel,pitch,facts,' +
      '"img":cardImage.asset->url,"w":cardImage.asset->metadata.dimensions.width,"h":cardImage.asset->metadata.dimensions.height},' +
    '"dispos":*[_type=="villaDispo"]|order(order asc){name,isPlaceholder,note,statusLabel,specs,price,rentMonthly,simCosts,linkHref,' +
      '"img":images[0].asset->url,"w":images[0].asset->metadata.dimensions.width,"h":images[0].asset->metadata.dimensions.height,' +
      '"images":images[]{"url":asset->url,"w":asset->metadata.dimensions.width,"h":asset->metadata.dimensions.height},' +
      'pageHeroEyebrow,pageHeroSub,pagePresEyebrow,pagePresHeading,pagePresBody,' +
      'pageRevenueBig,pageRevenueNote,pageLegalNote,pageFacts,pageGalleryNote,' +
      'pageSpecsHeading,pageSpecs,pageSpecsNote,' +
      'pageLocHeading,pageLocBody,pageLocFacts,pageMapQuery,pageMapNote,' +
      'pageSimIntro,pageCtaHeading,pageCtaBody},' +
    '"realisations":*[_type=="realisation"]|order(order asc){name,"slug":slug.current,zone,tag,blurb,linkHref,' +
      '"cover":cover.asset->url,"w":cover.asset->metadata.dimensions.width,"h":cover.asset->metadata.dimensions.height},' +
    '"pages":*[_type=="programmePage"]{programmeSlug,title,' +
      'idx_heroEyebrow,idx_heroSub,idx_progEyebrow,idx_progHeading,idx_progBody,idx_facts,' +
      '"idx_bandeauImg":idx_bandeauImg.asset->url,idx_bandeauCaption,' +
      'idx_storyEyebrow,idx_storyHeading,idx_storyParagraphs,' +
      '"idx_storyImg":idx_storyImg.asset->url,idx_cta,' +
      '"res_hero":res_hero.asset->url,' +
      'res_eyebrow,res_heading,res_paragraphs,res_caption,res_specsIntro,res_specs,res_specsNote,res_cta,' +
      '"vil_hero":vil_hero.asset->url,' +
      'vil_eyebrow,vil_heading,vil_body,vil_cardsNote,' +
      '"vil_cards":vil_cards[]{badge,subtitle,zone,title,desc,specs,price,priceNote,linkText,linkHref,"image":image.asset->url},' +
      'vil_archEyebrow,vil_archHeading,vil_arch,vil_specsEyebrow,vil_specsHeading,vil_specs,' +
      'vil_matEyebrow,vil_matHeading,vil_matBody,vil_mat,' +
      '"vil_gallery":vil_gallery[]{"url":asset->url,alt},' +
      'vil_galEyebrow,vil_galHeading,vil_galNote,vil_galNote2,vil_cta,' +
      '"loc_hero":loc_hero.asset->url,' +
      'loc_heroEyebrow,loc_heroTitle,loc_eyebrow,loc_heading,loc_body,loc_distances,loc_distancesNote,' +
      'loc_poiEyebrow,loc_poiHeading,loc_poiNote,loc_islandEyebrow,loc_islandHeading,loc_island,loc_mapQuery,loc_cta,' +
      '"inv_hero":inv_hero.asset->url,' +
      'inv_heroTitle,inv_simEyebrow,inv_simHeading,inv_simBody,inv_simNote,' +
      'inv_stepsEyebrow,inv_stepsHeading,inv_steps,inv_stepsProse,inv_stepsNote,' +
      'inv_leaseEyebrow,inv_leaseHeading,inv_leaseIntro,inv_leaseRows,inv_leaseTotalLabel,inv_leaseTotalValue,inv_leaseTable,inv_leaseNote,' +
      'inv_faqEyebrow,inv_faqHeading,inv_faq,inv_faqNote,inv_cta,inv_sim},' +
    '"villaTypes":*[_type=="villaType"]|order(order asc){programmeSlug,name,linkHref,' +
      'badge,subtitle,zone,desc,specs,price,priceNote,linkText,' +
      '"images":images[]{"url":asset->url,"w":asset->metadata.dimensions.width,"h":asset->metadata.dimensions.height},' +
      'pageHeroEyebrow,pageHeroSub,pagePresEyebrow,pagePresHeading,pagePresBody,' +
      'pageRevenueBig,pageRevenueNote,pageLegalNote,pageFacts,pageGalleryNote,' +
      'pageSpecsHeading,pageSpecs,pageSpecsNote,' +
      'pageLocHeading,pageLocBody,pageMapQuery,pageMapNote,pageCtaHeading,pageCtaBody}' +
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

      // ---- RÉGLAGES DU SITE (footer, page Contact) ----
      window.OD_SETTINGS = d.settings || {};

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
            slug: p.slug,
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
      window.OD_DISPO_PAGES = d.dispos || [];
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

        // Calculateur de rendement de la fiche de vente (window.OD_SIM)
        if (document.getElementById('calc')) {
          var pn = location.pathname.replace(/^\/(en\/)?/, '');
          for (var di = 0; di < d.dispos.length; di++) {
            var vv = d.dispos[di];
            if (!vv.isPlaceholder && vv.linkHref === pn && vv.price) {
              var baseS = window.OD_SIM || {};
              window.OD_SIM = {
                types: [{name: vv.name, price: vv.price, rent: vv.rentMonthly || 0}],
                costs: vv.simCosts != null ? vv.simCosts : (baseS.costs != null ? baseS.costs : 30)
              };
              break;
            }
          }
        }
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

      // ---- TYPOLOGIES / PARCELLES ajoutées via Studio (type villaType) ----
      window.OD_VILLATYPES = d.villaTypes || [];

      return true;
    });
  };

  // ---- Rendu des textes de sous-pages programme (data-cms="…") ----
  // Détecte le programme depuis l'URL (/sea-view/residence.html, /en/eden-tropical/…).
  // Premier segment du chemin (après un éventuel /en/) — pas de liste fermée : un slug qui ne
  // correspond à aucun document programmePage/villaType ne fait simplement rien plus bas (no-op).
  function currentSlug() {
    var parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'en') parts.shift();
    return parts[0] || null;
  }
  function setText(node, val) { if (node && val != null && val !== '') node.textContent = val; }

  // Un alt "placeholder" (vide, ou le texte de repli des modèles génériques) peut être
  // remplacé automatiquement par un texte dérivé du contenu Sanity ; un alt déjà écrit à la
  // main sur une page réelle (ex. "Piscine et salon extérieur, villa Terra Mare") ne l'est pas.
  function isPlaceholderAlt(a) { return !a || /ajouter dans Studio|to add in Studio/i.test(a); }
  function setImg(node, url, alt) {
    if (!node || !url) return;
    node.src = window.OD_img(url, 1920);
    if (alt && isPlaceholderAlt(node.alt)) node.alt = alt;
  }

  // Les modèles génériques (nouveau programme, nouvelle typologie, nouvelle villa à vendre)
  // portent un <meta name="robots" content="noindex, follow"> par défaut (repli sûr tant
  // qu'aucun contenu réel ne leur correspond). Dès qu'un document Sanity correspond bien à
  // l'URL et que du vrai contenu s'affiche, on autorise l'indexation. Sans effet sur les
  // pages réelles du site, qui ne portent pas cette balise.
  function allowIndexing() {
    var m = document.querySelector('meta[name="robots"]');
    if (m) m.setAttribute('content', 'index, follow');
  }

  // ---- Données structurées (schema.org), injectées depuis le contenu Sanity déjà chargé ----
  // Un seul <script> par id : un rendu ultérieur remplace le précédent plutôt que d'empiler.
  function injectJsonLd(id, obj) {
    if (!obj) return;
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(obj);
  }
  function breadcrumbList(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(function (it, i) {
        return {'@type': 'ListItem', position: i + 1, name: it.name, item: location.origin + it.path};
      }),
    };
  }
  function langPrefix() { return LANG === 'en' ? '/en' : ''; }

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

  // Reconstruit un groupe d'éléments répétés (nombre variable) à partir d'un tableau de données :
  // clone le premier élément existant comme modèle (préserve ses styles/classes), vide son parent,
  // puis ajoute un clone rempli par élément. Neutralise l'opacité/transform posés par l'animation
  // data-reveal sur le modèle, sinon les clones resteraient invisibles (jamais observés par elle).
  // No-op si le tableau Sanity est vide : le contenu statique existant reste affiché tel quel.
  // Avec append=true, s'ajoute aux éléments déjà présents au lieu de les remplacer (ex. typologies
  // ajoutées via Studio, en plus des cartes existantes).
  function rebuildRepeat(sel, items, fillFn, append) {
    var first = document.querySelector('[data-cms="' + sel + '"]');
    if (!first || !items || !items.length) return;
    var parent = first.parentElement;
    if (!parent) return;
    var template = first.cloneNode(true);
    if (!append) parent.innerHTML = '';
    items.forEach(function (item, i) {
      var el = template.cloneNode(true);
      el.style.opacity = ''; el.style.transform = ''; el.style.transition = '';
      fillFn(el, item, i);
      parent.appendChild(el);
    });
  }

  // Reconstruit une liste .n01/.serif + h3/h4 + p depuis un tableau de {num,title,body}.
  function fillNumItems(sel, items) {
    rebuildRepeat(sel, items, function (el, it) {
      setText(el.querySelector('[data-cms-f="num"]') || el.querySelector('.n, .serif'), it.num);
      setText(el.querySelector('[data-cms-f="title"]') || el.querySelector('h3, h4'), pick(it.title));
      setText(el.querySelector('[data-cms-f="body"]') || el.querySelector('p'), pick(it.body));
    });
  }

  window.OD_renderProgrammePage = function () {
    var slug = currentSlug();
    if (!slug || !window.OD_PAGES || !window.OD_PAGES.length) return;
    var doc = null;
    for (var i = 0; i < window.OD_PAGES.length; i++)
      if (window.OD_PAGES[i].programmeSlug === slug) { doc = window.OD_PAGES[i]; break; }
    if (!doc) return;
    allowIndexing();

    var q = function (sel) { return document.querySelector('[data-cms="' + sel + '"]'); };
    var all = function (sel) { return document.querySelectorAll('[data-cms="' + sel + '"]'); };
    // Texte alternatif de repli pour les photos uniques (bandeau/histoire/hero de section) —
    // seulement utilisé si l'alt en place est vide ou le placeholder générique (voir setImg).
    var altFor = function (fr, en) { return doc.title ? doc.title + ' — ' + (LANG === 'en' ? en : fr) : null; };

    // ---- Données structurées : fil d'Ariane (toutes les pages du programme) + fiche
    // RealEstateListing (accueil du programme uniquement, détecté via ses champs idx.*) ----
    var crumbs = [
      {name: LANG === 'en' ? 'Home' : 'Accueil', path: langPrefix() + '/index.html'},
      {name: doc.title, path: langPrefix() + '/' + slug + '/index.html'},
    ];
    var subPage = null;
    if (q('res.heading')) subPage = {fr: 'Résidence', en: 'The Residence', path: 'residence.html'};
    else if (q('vil.heading')) subPage = {fr: 'Villas', en: 'The Villas', path: 'villas.html'};
    else if (q('loc.heading')) subPage = {fr: 'Localisation', en: 'Location', path: 'localisation.html'};
    else if (q('inv.heroTitle')) subPage = {fr: 'Investir', en: 'Invest', path: 'investissement.html'};
    if (subPage) crumbs.push({name: LANG === 'en' ? subPage.en : subPage.fr, path: langPrefix() + '/' + slug + '/' + subPage.path});
    injectJsonLd('od-schema-breadcrumb', breadcrumbList(crumbs));

    if (q('idx.heroEyebrow') || q('idx.progHeading')) {
      injectJsonLd('od-schema-listing', {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: doc.title,
        description: pick(doc.idx_heroSub) || pick(doc.idx_progBody),
        url: location.origin + location.pathname,
        image: doc.idx_bandeauImg ? window.OD_img(doc.idx_bandeauImg, 1600) : undefined,
      });
    }

    // ---- Accueil du programme ----
    setText(q('idx.heroEyebrow'), pick(doc.idx_heroEyebrow));
    setText(q('idx.heroSub'), pick(doc.idx_heroSub));
    setText(q('idx.progEyebrow'), pick(doc.idx_progEyebrow));
    setText(q('idx.progHeading'), pick(doc.idx_progHeading));
    setText(q('idx.progBody'), pick(doc.idx_progBody));
    fillFacts(all('idx.factItem'), doc.idx_facts);
    setImg(q('idx.bandeauImg'), doc.idx_bandeauImg, altFor('vue du programme', 'programme view'));
    setText(q('idx.bandeauCaption'), pick(doc.idx_bandeauCaption));
    setText(q('idx.storyEyebrow'), pick(doc.idx_storyEyebrow));
    setText(q('idx.storyHeading'), pick(doc.idx_storyHeading));
    if (doc.idx_storyParagraphs && doc.idx_storyParagraphs.length) {
      var sps = all('idx.storyP');
      for (var sj = 0; sj < sps.length && sj < doc.idx_storyParagraphs.length; sj++)
        setText(sps[sj], pick(doc.idx_storyParagraphs[sj]));
    }
    setImg(q('idx.storyImg'), doc.idx_storyImg, altFor('le quartier', 'the neighbourhood'));
    setText(q('idx.cta'), pick(doc.idx_cta));

    // ---- La Résidence ----
    setImg(q('res.hero'), doc.res_hero, altFor('la résidence', 'the residence'));
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
    setImg(q('vil.hero'), doc.vil_hero, altFor('les villas', 'the villas'));
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
    fillNumItems('vil.archItem', doc.vil_arch);
    fillNumItems('vil.matItem', doc.vil_mat);

    // cartes (parcelles / typologies) — nombre variable, clone du premier modèle existant
    var fillVilCard = function (el, cd, imgUrl, imgAlt) {
      var img = el.querySelector('img');
      if (img && imgUrl) { img.src = window.OD_img(imgUrl, 1400); img.alt = imgAlt || ''; }
      var f = function (name) { return el.querySelector('[data-cms-f="' + name + '"]'); };
      setText(f('badge'), pick(cd.badge));
      setText(f('subtitle'), pick(cd.subtitle));
      setText(f('zone'), pick(cd.zone));
      setText(f('desc'), pick(cd.desc));
      setText(f('price'), pick(cd.price));
      setText(f('priceNote'), pick(cd.priceNote));
      setText(f('link'), pick(cd.linkText));
      var ul = f('specs');
      if (ul) {
        if (cd.specs && cd.specs.length) {
          ul.innerHTML = cd.specs.map(function () { return '<li><span></span><b></b></li>'; }).join('');
          var lis = ul.querySelectorAll('li');
          cd.specs.forEach(function (s, si) {
            if (!lis[si]) return;
            setText(lis[si].querySelector('span'), pick(s.label));
            setText(lis[si].querySelector('b'), pick(s.value));
          });
        } else {
          ul.innerHTML = '';
        }
      }
      return f;
    };

    // rebuildRepeat clone la 1ère carte du fichier comme modèle pour toutes les cartes Sanity :
    // si linkHref/image n'est pas renseigné pour une carte, on retombe sur le href/photo d'origine
    // à la même position plutôt que de laisser toutes les cartes hériter de ceux de la toute
    // première (sinon plusieurs cartes distinctes pointent/affichent silencieusement la même chose).
    var vilCardOrigHrefs = Array.prototype.map.call(all('vil.card'), function (el) { return el.getAttribute('href'); });
    var vilCardOrigImgs = Array.prototype.map.call(all('vil.card'), function (el) { return el.querySelector('img'); });
    rebuildRepeat('vil.card', doc.vil_cards, function (el, cd, i) {
      el.setAttribute('href', cd.linkHref || vilCardOrigHrefs[i] || 'villas.html');
      var origImg = vilCardOrigImgs[i];
      var imgUrl = cd.image || (origImg && origImg.getAttribute('src'));
      var f = fillVilCard(el, cd, imgUrl, pick(cd.title));
      setText(f('title'), pick(cd.title));
    });

    // typologies / parcelles ajoutées via Studio (type villaType) — s'ajoutent aux cartes ci-dessus
    var typeCards = (window.OD_VILLATYPES || []).filter(function (t) { return t.programmeSlug === slug; });
    rebuildRepeat('vil.card', typeCards, function (el, cd) {
      if (cd.linkHref) el.setAttribute('href', cd.linkHref);
      var img0 = cd.images && cd.images[0];
      var f = fillVilCard(el, cd, img0 && img0.url, cd.name);
      setText(f('title'), cd.name);
    }, true);

    // galerie « Découvrez les villas » — index par index
    if (doc.vil_gallery && doc.vil_gallery.length) {
      var galItems = all('vil.galItem');
      doc.vil_gallery.forEach(function (g, gi) {
        var el = galItems[gi];
        if (!el || !g || !g.url) return;
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (!img) return;
        img.src = window.OD_img(g.url, 1920);
        var alt = pick(g.alt);
        if (alt) img.alt = alt;
      });
    }

    // ---- Localisation ----
    setImg(q('loc.hero'), doc.loc_hero, altFor('localisation', 'location'));
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
    fillNumItems('loc.islandItem', doc.loc_island);
    var locMapEl = q('loc.map');
    if (locMapEl && doc.loc_mapQuery) {
      var lang4 = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'fr';
      locMapEl.src = 'https://www.google.com/maps?q=' + encodeURIComponent(doc.loc_mapQuery) + '&hl=' + lang4 + '&z=14&output=embed';
    }
    rebuildRepeat('loc.distRow', doc.loc_distances, function (el, r) {
      setText(el.querySelector('span'), pick(r.label));
      setText(el.querySelector('b'), pick(r.value));
    });

    // ---- Investir ----
    setImg(q('inv.hero'), doc.inv_hero, altFor('investir', 'invest'));
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

    rebuildRepeat('inv.step', doc.inv_steps, function (el, s) {
      setText(el.querySelector('.pct'), pick(s.pct));
      setText(el.querySelector('.n'), pick(s.label));
      setText(el.querySelector('h4'), pick(s.title));
      setText(el.querySelector('p'), pick(s.body));
    });

    rebuildRepeat('inv.leaseRow', doc.inv_leaseRows, function (el, r) {
      var span = el.querySelector('span');
      var lbl = pick(r.label);
      if (span && lbl) {
        var tn = span.firstChild;
        if (tn && tn.nodeType === 3) tn.nodeValue = lbl; else setText(span, lbl);
      }
      setText(el.querySelector('small'), pick(r.sublabel));
      setText(el.querySelector('b'), pick(r.value));
    });
    if (doc.inv_leaseRows && doc.inv_leaseRows.length) {
      var totEl = q('inv.leaseTotal');
      if (totEl) {
        setText(totEl.querySelector('span'), pick(doc.inv_leaseTotalLabel));
        setText(totEl.querySelector('b'), pick(doc.inv_leaseTotalValue));
      }
    }

    rebuildRepeat('inv.faqItem', doc.inv_faq, function (el, it) {
      setText(el.querySelector('summary'), pick(it.q));
      setText(el.querySelector('p'), pick(it.a));
    });

    // paramétrage du simulateur de rendement (surcharge window.OD_SIM_FULL)
    var sm = doc.inv_sim;
    if (sm && sm.plots && sm.plots.length && document.getElementById('calc')) {
      var base = window.OD_SIM_FULL || {};
      var scn = (sm.scenarios && sm.scenarios.length)
        ? sm.scenarios.map(function (s) { return {name: pick(s.name), nights: s.nights, adr: s.adr}; })
        : (base.scenarios || []);
      window.OD_SIM_FULL = {
        plotLabel: pick(sm.plotLabel) || base.plotLabel,
        plots: sm.plots.map(function (p) { return {name: pick(p.name), price: p.price}; }),
        scenarios: scn,
        defaultScenario: sm.defaultScenario != null ? sm.defaultScenario : (base.defaultScenario != null ? base.defaultScenario : 1),
        costs: sm.costs != null ? sm.costs : (base.costs != null ? base.costs : 35),
        horizons: (sm.horizons && sm.horizons.length) ? sm.horizons : (base.horizons || [1, 5, 10])
      };
    }
  };

  // Remplit une série de .f (fact strip) index par index depuis [{value,label}].
  function fillFacts(nodeList, facts) {
    if (!facts || !facts.length) return;
    for (var i = 0; i < nodeList.length && i < facts.length; i++) {
      var el = nodeList[i], f = facts[i];
      if (!f) continue;
      setText(el.querySelector('b'), pick(f.value));
      setText(el.querySelector('span'), pick(f.label));
    }
  }

  // ---- Rendu du contenu d'une fiche « Villa disponible » (data-cms="page.…") ----
  // Détecte la villa depuis l'URL (linkHref stocké dans Sanity, ex. "villas-a-vendre/villa-lilouana.html").
  window.OD_renderVillaDispoPage = function () {
    if (!window.OD_DISPO_PAGES || !window.OD_DISPO_PAGES.length) return;
    var pn = location.pathname.replace(/^\/(en\/)?/, '');
    var doc = null;
    for (var i = 0; i < window.OD_DISPO_PAGES.length; i++) {
      var v = window.OD_DISPO_PAGES[i];
      if (!v.isPlaceholder && v.linkHref === pn) { doc = v; break; }
    }
    if (!doc) return;
    allowIndexing();

    var q = function (sel) { return document.querySelector('[data-cms="' + sel + '"]'); };
    var all = function (sel) { return document.querySelectorAll('[data-cms="' + sel + '"]'); };

    // nom de la villa (utile pour le modèle générique — les fiches figées l'ont déjà en dur)
    setText(q('page.name'), doc.name);

    // méta de la page : titre d'onglet, description, canonical, Open Graph
    if (doc.name) {
      document.title = doc.name + ' — Koh Samui Estate';
      var metaDesc = pick(doc.pageHeroSub) || pick(doc.pagePresBody);
      var descEl = document.querySelector('meta[name="description"]');
      if (descEl && metaDesc) descEl.setAttribute('content', metaDesc);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', doc.name + ' — Koh Samui Estate');
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && metaDesc) ogDesc.setAttribute('content', metaDesc);
      var ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', location.origin + location.pathname);
      var canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', location.origin + location.pathname);

      injectJsonLd('od-schema-listing', {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: doc.name,
        description: metaDesc,
        url: location.origin + location.pathname,
        image: (doc.images && doc.images[0]) ? window.OD_img(doc.images[0].url, 1600) : undefined,
        offers: doc.price ? {'@type': 'Offer', price: doc.price, priceCurrency: 'THB', availability: 'https://schema.org/InStock'} : undefined,
      });
      injectJsonLd('od-schema-breadcrumb', breadcrumbList([
        {name: LANG === 'en' ? 'Home' : 'Accueil', path: langPrefix() + '/index.html'},
        {name: LANG === 'en' ? 'Available villas' : 'Villas disponibles', path: langPrefix() + '/villas-a-vendre/index.html'},
        {name: doc.name, path: langPrefix() + '/' + doc.linkHref},
      ]));
    }

    setText(q('page.heroEyebrow'), pick(doc.pageHeroEyebrow));
    setText(q('page.heroSub'), pick(doc.pageHeroSub));

    // photos de la fiche (data-cms="page.heroImg/presImg/gallery") — depuis le champ "images" de la carte
    if (doc.images && doc.images.length) {
      var heroImg = q('page.heroImg');
      if (heroImg) {
        heroImg.src = window.OD_img(doc.images[0].url, 1920);
        if (doc.images[0].w) { heroImg.width = doc.images[0].w; heroImg.height = doc.images[0].h; }
        if (doc.name && isPlaceholderAlt(heroImg.alt)) heroImg.alt = doc.name;
      }
      var presImg = q('page.presImg');
      if (presImg) {
        var pImg = doc.images[1] || doc.images[0];
        presImg.src = window.OD_img(pImg.url, 1600);
        if (pImg.w) { presImg.width = pImg.w; presImg.height = pImg.h; }
        if (doc.name && isPlaceholderAlt(presImg.alt)) presImg.alt = doc.name;
      }
      var galBox = q('page.gallery');
      if (galBox) {
        galBox.innerHTML = doc.images.map(function (im, gi) {
          var cls = gi === 0 ? 'big lead' : ((gi % 7) === 3 ? 'wide' : '');
          var dim = im.w ? ' width="' + im.w + '" height="' + im.h + '"' : '';
          return '<button class="' + cls + '" onclick="openLb(' + gi + ')"><img src="' + window.OD_img(im.url, 1600) + '"' + dim + ' alt="' + doc.name + '"></button>';
        }).join('');
      }
      window.OD_GALLERY = doc.images.map(function (im) { return window.OD_img(im.url, 1920); });
    }

    setText(q('page.presEyebrow'), pick(doc.pagePresEyebrow));
    setText(q('page.presHeading'), pick(doc.pagePresHeading));
    setText(q('page.presBody'), pick(doc.pagePresBody));

    var big = pick(doc.pageRevenueBig);
    if (!big && doc.price) big = '฿' + Number(doc.price).toLocaleString('fr-FR');
    setText(q('page.revenueBig'), big);
    setText(q('page.revenueNote'), pick(doc.pageRevenueNote));
    setText(q('page.legalNote'), pick(doc.pageLegalNote));

    fillFacts(all('page.factItem'), doc.pageFacts);

    setText(q('page.galleryNote'), pick(doc.pageGalleryNote));

    setText(q('page.specsHeading'), pick(doc.pageSpecsHeading));
    fillSpecTable(q('page.specs'), doc.pageSpecs);
    setText(q('page.specsNote'), pick(doc.pageSpecsNote));

    setText(q('page.locHeading'), pick(doc.pageLocHeading));
    setText(q('page.locBody'), pick(doc.pageLocBody));
    fillFacts(all('page.locFactItem'), doc.pageLocFacts);
    setText(q('page.mapNote'), pick(doc.pageMapNote));
    var mapEl = q('page.map');
    if (mapEl && doc.pageMapQuery) {
      var lang2 = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'fr';
      mapEl.src = 'https://www.google.com/maps?q=' + encodeURIComponent(doc.pageMapQuery) + '&hl=' + lang2 + '&z=15&output=embed';
    }

    setText(q('page.simIntro'), pick(doc.pageSimIntro));

    setText(q('page.ctaHeading'), pick(doc.pageCtaHeading));
    setText(q('page.ctaBody'), pick(doc.pageCtaBody));
  };

  // ---- Rendu d'une fiche « typologie / parcelle » de programme (data-cms="type.…") ----
  // Détecte le programme depuis l'URL, puis la fiche par linkHref (relatif au dossier du
  // programme, ex. "villa-4-chambres.html") stocké dans le document villaType.
  window.OD_renderVillaTypePage = function () {
    var slug = currentSlug();
    if (!slug || !window.OD_VILLATYPES || !window.OD_VILLATYPES.length) return;
    var pn = location.pathname.replace(/^\/(en\/)?/, '');
    var doc = null;
    for (var i = 0; i < window.OD_VILLATYPES.length; i++) {
      var v = window.OD_VILLATYPES[i];
      if (v.programmeSlug === slug && v.linkHref && (slug + '/' + v.linkHref) === pn) { doc = v; break; }
    }
    if (!doc) return;
    allowIndexing();

    var q = function (sel) { return document.querySelector('[data-cms="' + sel + '"]'); };
    var all = function (sel) { return document.querySelectorAll('[data-cms="' + sel + '"]'); };

    setText(q('type.name'), doc.name);

    if (doc.name) {
      document.title = doc.name + ' — Koh Samui Estate';
      var metaDesc = pick(doc.pageHeroSub) || pick(doc.pagePresBody);
      var descEl = document.querySelector('meta[name="description"]');
      if (descEl && metaDesc) descEl.setAttribute('content', metaDesc);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', doc.name + ' — Koh Samui Estate');
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && metaDesc) ogDesc.setAttribute('content', metaDesc);
      var ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', location.origin + location.pathname);
      var canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', location.origin + location.pathname);

      var proj = null;
      for (var pj = 0; pj < (window.PROJECTS || []).length; pj++)
        if (window.PROJECTS[pj].slug === slug) { proj = window.PROJECTS[pj]; break; }
      var progName = proj ? proj.name : slug;

      injectJsonLd('od-schema-listing', {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: doc.name,
        description: metaDesc,
        url: location.origin + location.pathname,
        image: (doc.images && doc.images[0]) ? window.OD_img(doc.images[0].url, 1600) : undefined,
        offers: pick(doc.price) ? {'@type': 'Offer', price: pick(doc.price), priceCurrency: 'THB', availability: 'https://schema.org/InStock'} : undefined,
      });
      injectJsonLd('od-schema-breadcrumb', breadcrumbList([
        {name: LANG === 'en' ? 'Home' : 'Accueil', path: langPrefix() + '/index.html'},
        {name: progName, path: langPrefix() + '/' + slug + '/index.html'},
        {name: LANG === 'en' ? 'The Villas' : 'Villas', path: langPrefix() + '/' + slug + '/villas.html'},
        {name: doc.name, path: langPrefix() + '/' + slug + '/' + doc.linkHref},
      ]));
    }

    setText(q('type.heroEyebrow'), pick(doc.pageHeroEyebrow));
    setText(q('type.heroSub'), pick(doc.pageHeroSub));

    if (doc.images && doc.images.length) {
      var heroImg = q('type.heroImg');
      if (heroImg) {
        heroImg.src = window.OD_img(doc.images[0].url, 1920);
        if (doc.images[0].w) { heroImg.width = doc.images[0].w; heroImg.height = doc.images[0].h; }
        if (doc.name && isPlaceholderAlt(heroImg.alt)) heroImg.alt = doc.name;
      }
      var presImg = q('type.presImg');
      if (presImg) {
        var pImg = doc.images[1] || doc.images[0];
        presImg.src = window.OD_img(pImg.url, 1600);
        if (pImg.w) { presImg.width = pImg.w; presImg.height = pImg.h; }
        if (doc.name && isPlaceholderAlt(presImg.alt)) presImg.alt = doc.name;
      }
      var galBox = q('type.gallery');
      if (galBox) {
        galBox.innerHTML = doc.images.map(function (im, gi) {
          var cls = gi === 0 ? 'big lead' : ((gi % 7) === 3 ? 'wide' : '');
          var dim = im.w ? ' width="' + im.w + '" height="' + im.h + '"' : '';
          return '<button class="' + cls + '" onclick="openLb(' + gi + ')"><img src="' + window.OD_img(im.url, 1600) + '"' + dim + ' alt="' + doc.name + '"></button>';
        }).join('');
      }
      window.OD_GALLERY = doc.images.map(function (im) { return window.OD_img(im.url, 1920); });
    }

    setText(q('type.presEyebrow'), pick(doc.pagePresEyebrow));
    setText(q('type.presHeading'), pick(doc.pagePresHeading));
    setText(q('type.presBody'), pick(doc.pagePresBody));

    var tbig = pick(doc.pageRevenueBig) || pick(doc.price);
    setText(q('type.revenueBig'), tbig);
    setText(q('type.revenueNote'), pick(doc.pageRevenueNote));
    setText(q('type.legalNote'), pick(doc.pageLegalNote));

    fillFacts(all('type.factItem'), doc.pageFacts);

    setText(q('type.galleryNote'), pick(doc.pageGalleryNote));

    setText(q('type.specsHeading'), pick(doc.pageSpecsHeading));
    fillSpecTable(q('type.specs'), doc.pageSpecs);
    setText(q('type.specsNote'), pick(doc.pageSpecsNote));

    setText(q('type.locHeading'), pick(doc.pageLocHeading));
    setText(q('type.locBody'), pick(doc.pageLocBody));
    var typeMapEl = q('type.map');
    if (typeMapEl && doc.pageMapQuery) {
      var lang3 = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'fr';
      typeMapEl.src = 'https://www.google.com/maps?q=' + encodeURIComponent(doc.pageMapQuery) + '&hl=' + lang3 + '&z=15&output=embed';
    }
    setText(q('type.mapNote'), pick(doc.pageMapNote));

    setText(q('type.ctaHeading'), pick(doc.pageCtaHeading));
    setText(q('type.ctaBody'), pick(doc.pageCtaBody));
  };

  // ---- Habillage générique d'un nouveau programme (data-cms="chrome.…") ----
  // Utilisé uniquement par les 5 modèles génériques public/_nouveau-programme/*.html, qui
  // servent un nombre indéterminé de programmes futurs et ne peuvent donc pas coder en dur
  // le nom du programme ni la liste de ses voisins dans la sous-nav / le pied de page.
  window.OD_renderProgrammeChrome = function () {
    var slug = currentSlug();
    if (!slug || !window.PROJECTS || !window.PROJECTS.length) return;
    var doc = null;
    for (var i = 0; i < window.PROJECTS.length; i++) if (window.PROJECTS[i].slug === slug) { doc = window.PROJECTS[i]; break; }
    if (doc) {
      var nameNodes = document.querySelectorAll('[data-cms="chrome.name"]');
      for (var ni = 0; ni < nameNodes.length; ni++) setText(nameNodes[ni], doc.name);
    }
    rebuildRepeat('chrome.progLink', window.PROJECTS, function (el, p) {
      setText(el, p.name);
      el.setAttribute('href', p.slug === slug ? 'index.html' : ('../' + p.slug + '/index.html'));
    });
  };

  // Remplit une série de blocs "personne" (b + a + span) depuis [{label,number,whatsapp,whatsappNote}].
  function fillPhones(nodeList, phones) {
    if (!phones || !phones.length) return;
    for (var i = 0; i < nodeList.length && i < phones.length; i++) {
      var el = nodeList[i], p = phones[i];
      if (!p) continue;
      setText(el.querySelector('b'), p.label);
      var a = el.querySelector('a');
      if (a && p.number) {
        a.textContent = p.number;
        if (p.whatsapp) a.href = 'https://wa.me/' + p.whatsapp;
      }
      setText(el.querySelector('span'), pick(p.whatsappNote));
    }
  }

  // ---- Rendu du pied de page (data-cms="foot.…") — sur toutes les pages ----
  window.OD_renderFooter = function () {
    var s = window.OD_SETTINGS;
    if (!s) return;
    setText(document.querySelector('[data-cms="foot.tagline"]'), pick(s.tagline));
    setText(document.querySelector('[data-cms="foot.copyright"]'), s.footCopyright);
    var links = document.querySelectorAll('[data-cms="foot.phone"]');
    if (s.phones && s.phones.length) {
      for (var i = 0; i < links.length && i < s.phones.length; i++) {
        var p = s.phones[i];
        if (p && p.number) {
          links[i].textContent = p.number;
          links[i].href = 'tel:+' + p.number.replace(/[^0-9]/g, '');
        }
      }
    }
  };

  // ---- Rendu de la page Contact (data-cms="contact.…") ----
  window.OD_renderContactPage = function () {
    var s = window.OD_SETTINGS;
    if (!s) return;
    fillPhones(document.querySelectorAll('[data-cms="contact.phoneItem"]'), s.phones);
    var mailEl = document.querySelector('[data-cms="contact.email"]');
    if (mailEl && s.email) { mailEl.textContent = s.email; mailEl.href = 'mailto:' + s.email; }
    setText(document.querySelector('[data-cms="contact.intro"]'), pick(s.contactIntro));
    var mapEl = document.querySelector('[data-cms="contact.map"]');
    if (mapEl && s.mapQuery) {
      mapEl.src = 'https://www.google.com/maps?q=' + encodeURIComponent(s.mapQuery) + '&output=embed';
    }
  };
})();
