/* KOH SAMUI ESTATE v3 — interactions */
(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var LANG=(document.documentElement.lang||'fr').slice(0,2).toLowerCase()==='en'?'en':'fr';
  var baht=function(n){return '฿'+Math.round(n).toLocaleString(LANG==='en'?'en-US':'fr-FR').replace(/[  ]/g,' ')};
  var num1=function(n){var s=n.toFixed(1);return LANG==='en'?s:s.replace('.',',')};
  var pct=function(n){return num1(n)+' %'};
  var yrs=function(n){return LANG==='en'?(n===1?' yr':' yrs'):(n===1?' an':' ans')};
  var I18N={
    fr:{discover:'Découvrir le programme →', seePhotos:'Voir les photos →', info:'Info →',
        soonName:'Villa à venir', soonNote:'Photos & détails bientôt', delivered:'Livrée',
        realisation:'Réalisation', photo:'photo',
        rentLine:function(r,g){return 'Loué '+r+'/mois · ≈ '+g+' brut'},
        thanksDl:'Merci ! Votre brochure se télécharge. Notre équipe locale francophone vous recontacte sous 24 h. ',
        thanksNoDl:'Merci ! Votre demande a bien été envoyée. Notre équipe vous envoie la brochure adaptée sous 24 h.',
        errInput:'Vérifiez votre nom et votre adresse e-mail, puis réessayez.',
        errSend:function(hasDl){return "L'envoi n'a peut-être pas abouti"+(hasDl?', mais votre brochure se télécharge ci-dessous':'')+". En cas de doute, écrivez-nous sur WhatsApp au +66 655 767 871."},
        c:{price:'Prix de la villa', rent:'Loyer mensuel estimé', rentHint:'Location longue durée ou saisonnière lissée',
           costs:'Charges & gestion', costsHint:'du revenu locatif', gross:'Rendement brut',
           annual:'Revenu locatif annuel', netY:'Rendement net estimé',
           chooseVilla:'Choisissez votre villa', scenario:'Scénario locatif',
           nightsYr:'Nuits louées par an', adr:'Prix moyen par nuit', holding:'Durée de détention',
           grossEst:'Rendement brut estimé', netAnnual:'Revenu net annuel', monthly:'Revenu mensuel moyen',
           cumul:'Revenus nets cumulés', share:'Part du prix couverte', payback:'Retour sur investissement',
           nights:'nuits', night:'nuit', nightsPerYr:'nuits / an', cumulOver:'Revenus nets cumulés sur'}},
    en:{discover:'Explore the programme →', seePhotos:'View photos →', info:'Details →',
        soonName:'Villa coming soon', soonNote:'Photos & details soon', delivered:'Delivered',
        realisation:'Project', photo:'photo',
        rentLine:function(r,g){return 'Let at '+r+'/month · ≈ '+g+' gross'},
        thanksDl:'Thank you! Your brochure is downloading. Our local English-speaking team will get back to you within 24 h. ',
        thanksNoDl:'Thank you! Your request has been sent. Our team will email you the relevant brochure within 24 h.',
        errInput:'Please check your name and email address, then try again.',
        errSend:function(hasDl){return "Your request may not have gone through"+(hasDl?', but your brochure is downloading below':'')+'. If in doubt, message us on WhatsApp at +66 655 767 871.'},
        c:{price:'Villa price', rent:'Estimated monthly rent', rentHint:'Long-term or averaged seasonal rental',
           costs:'Charges & management', costsHint:'of rental income', gross:'Gross yield',
           annual:'Annual rental income', netY:'Estimated net yield',
           chooseVilla:'Choose your villa', scenario:'Rental scenario',
           nightsYr:'Nights let per year', adr:'Average price per night', holding:'Holding period',
           grossEst:'Estimated gross yield', netAnnual:'Annual net income', monthly:'Average monthly income',
           cumul:'Cumulative net income', share:'Share of price covered', payback:'Payback period',
           nights:'nights', night:'night', nightsPerYr:'nights / yr', cumulOver:'Cumulative net income over'}}
  };
  var T=I18N[LANG];

  function initHeader(){var h=$('header');if(!h)return;var f=function(){h.classList.toggle('solid',window.scrollY>60||window.innerWidth<=960);document.documentElement.style.setProperty('--hdr',h.offsetHeight+'px')};window.addEventListener('scroll',f,{passive:true});window.addEventListener('resize',f);f();}
  function initMenu(){var b=$('.burger');if(!b)return;b.addEventListener('click',function(){document.documentElement.classList.toggle('mnav-open')});document.querySelectorAll('.mnav a').forEach(function(a){a.addEventListener('click',function(){document.documentElement.classList.remove('mnav-open')})});}

  /* ---------- Carrousel hero ---------- */
  function renderHero(){
    var box=$('#hero'); if(!box||!window.HERO)return;
    var H=window.HERO, cur=0, timer=null;
    box.innerHTML=H.map(function(s,i){
      var dim = s.w ? ' width="'+s.w+'" height="'+s.h+'"' : '';
      var media = s.type==='video'
        ? '<video src="'+s.src+'" poster="'+(s.poster||'')+'"'+dim+' muted playsinline preload="'+(i===0?'auto':'metadata')+'"></video>'
        : '<img src="'+s.img+'"'+dim+' alt="'+(s.title||'')+'">';
      /* slide de marque : fond vidéo nu + wordmark "KOH SAMUI ESTATE" superposé
         en HTML/CSS (masque PNG responsive), on n'ajoute qu'un CTA discret en bas. */
      var overlay = s.brand
        ? '<div class="hbrand" aria-hidden="true"><span class="hbrand-glow"></span>'
          + '<span class="hbrand-dust"><i style="left:8%;--d:10s;--delay:0s"></i><i style="left:24%;--d:12s;--delay:2.4s"></i><i style="left:40%;--d:9s;--delay:1.1s"></i><i style="left:56%;--d:13s;--delay:3.3s"></i><i style="left:72%;--d:10.5s;--delay:.7s"></i><i style="left:88%;--d:11.5s;--delay:2s"></i></span>'
          + '<span class="hbrand-mark" role="img" aria-label="Koh Samui Estate">KOH SAMUI ESTATE</span></div>'
        : '';
      var inner = s.brand
        ? '<a class="btn" style="margin-top:auto;background:var(--brass-bright);border-color:var(--brass-bright);color:#2a2015" href="'+s.href+'">'+s.cta+'</a>'
        : '<div class="k">'+s.kicker+'</div><h2>'+s.title+'</h2><div class="s">'+s.sub+'</div><a class="btn" href="'+s.href+'">'+s.cta+' →</a>';
      return '<div class="hslide'+(i===0?' on':'')+(s.brand?' hslide-v-brand':'')+'" data-i="'+i+'">'+media+overlay+'<div class="hslide-in'+(s.brand?' hslide-brand':'')+'">'+inner+'</div></div>';
    }).join('')
    + '<button class="hero-arrow hero-prev" aria-label="Précédent">‹</button><button class="hero-arrow hero-next" aria-label="Suivant">›</button>'
    + '<div class="hero-dots">'+H.map(function(s,i){return '<button type="button" data-i="'+i+'"'+(i===0?' class="on"':'')+' aria-label="Afficher la vue '+(i+1)+' sur '+H.length+'"></button>'}).join('')+'</div>';
    var slides=box.querySelectorAll('.hslide'), dots=box.querySelectorAll('.hero-dots button');

    function play(i){
      slides.forEach(function(sl){ sl.querySelectorAll('video').forEach(function(v){ try{v.pause();}catch(e){} }); });
      clearTimeout(timer);
      var s=H[i], sl=slides[i], v=sl.querySelector('video');
      if(v){
        v.loop=true; // chaque clip boucle jusqu'à ce que le carrousel avance
        try{v.currentTime=0;var p=v.play();if(p&&p.catch)p.catch(function(){});}catch(e){}
        var arm=function(){
          clearTimeout(timer);
          var d=(v.duration&&isFinite(v.duration))?v.duration*1000:13000;
          timer=setTimeout(next, Math.max(12000, Math.min(d, 16000))); // durée d'affichage homogène
        };
        if(v.readyState>=1 && v.duration){ arm(); }
        else { timer=setTimeout(next, 13000); v.addEventListener('loadedmetadata', arm, {once:true}); }
      } else { timer=setTimeout(next, 6500); }
    }
    function go(i){cur=(i+H.length)%H.length;
      slides.forEach(function(sl,k){sl.classList.toggle('on',k===cur)});
      dots.forEach(function(d,k){d.classList.toggle('on',k===cur)});
      play(cur);
    }
    function next(){go(cur+1)}
    box.querySelector('.hero-next').addEventListener('click',function(){go(cur+1)});
    box.querySelector('.hero-prev').addEventListener('click',function(){go(cur-1)});
    dots.forEach(function(d){d.addEventListener('click',function(){go(+d.dataset.i)})});
    play(0);
  }

  /* ---------- Encarts programmes ---------- */
  function renderEncarts(){
    var box=$('#encarts'); if(!box||!window.PROJECTS)return;
    box.innerHTML=window.PROJECTS.map(function(p){
      return '<a class="encart" href="'+p.href+'">'
        +'<div class="media"><img src="'+p.img+'"'+(p.w?' width="'+p.w+'" height="'+p.h+'"':'')+' alt="'+p.name+'" loading="lazy" decoding="async"><span class="badge '+p.status+'">'+p.statusLabel+'</span></div>'
        +'<div class="body"><div class="zn">'+p.zone+'</div><h2>'+p.name+'</h2>'
        +'<p class="pitch">'+p.pitch+'</p>'
        +'<div class="kfacts">'+p.facts.map(function(f){return '<span>'+f+'</span>'}).join('')+'</div>'
        +'<span class="link-under">'+T.discover+'</span></div></a>';
    }).join('');
  }

  /* ---------- Villas en vente ---------- */
  function renderDispos(){
    var box=$('#dispos'); if(!box||!window.DISPOS)return;
    box.innerHTML=window.DISPOS.map(function(v){
      if(v.placeholder) return '<div class="vcard soon"><div><div class="tag">'+(v.name||T.soonName)+'</div><div class="sub">'+(v.note||T.soonNote)+'</div></div></div>';
      var gross=(v.rentMonthly*12/v.price*100);
      return '<div class="vcard">'
        +'<div class="im"><img src="'+v.img+'"'+(v.w?' width="'+v.w+'" height="'+v.h+'"':'')+' alt="'+v.name+'" loading="lazy" decoding="async"><span class="badge dispo">'+v.statusLabel+'</span></div>'
        +'<div class="bd"><h3>'+v.name+'</h3>'
        + v.specs.map(function(s){return '<div class="li">'+s+'</div>'}).join('')
        +'<div class="ft"><div class="pr">'+baht(v.price)+'<small>'+T.rentLine(baht(v.rentMonthly),pct(gross))+'</small></div><a class="link-under" href="'+(v.href||'contact.html')+'">'+T.info+'</a></div>'
        +'</div></div>';
    }).join('');
  }

  /* ---------- Réassurance ---------- */
  function renderStats(){var box=$('#stats');if(box&&window.STATS)box.innerHTML=window.STATS.map(function(s){return '<div class="st"><b>'+s.n+'</b><span>'+s.l+'</span></div>'}).join('');}

  /* ---------- Réalisations (cartes villa, accueil) ---------- */
  function realisationUrls(v){
    if(v.files) return v.files.map(function(f){return (v.folder||'')+f});
    var out=[]; for(var i=1;i<=v.count;i++){out.push('images/realisations/'+v.slug+'/'+('0'+i).slice(-2)+'.jpg')}
    return out;
  }
  function renderRealisations(){
    var box=$('#realisations-grid'); if(!box||!window.REALISATIONS_VILLAS)return;
    box.innerHTML=window.REALISATIONS_VILLAS.map(function(v){
      return '<a class="parcel" href="'+v.href+'" style="display:block;color:inherit">'
        +'<div class="im"><img src="'+v.cover+'"'+(v.w?' width="'+v.w+'" height="'+v.h+'"':'')+' alt="'+v.name+'" loading="lazy" decoding="async"><span class="badge dispo" style="top:14px;left:14px">'+(v.tag||T.delivered)+'</span></div>'
        +'<div class="bd"><div class="st">'+v.zone+'</div><h4>'+v.name+'</h4><p>'+v.blurb+'</p>'
        +'<span class="link-under" style="margin-top:14px;font-size:10px">'+T.seePhotos+'</span></div></a>';
    }).join('');
  }

  /* ---------- Réalisations (galerie d'une villa, page dédiée) ---------- */
  function renderRealisationGallery(){
    var box=$('#rgal'); if(!box||!window.OD_RGAL)return;
    var C=window.OD_RGAL, base=C.base||'';
    var urls = C.files
      ? C.files.map(function(f){return base+(C.folder||'')+f})
      : (function(){var a=[];for(var i=1;i<=C.count;i++){a.push(base+'images/realisations/'+C.slug+'/'+('0'+i).slice(-2)+'.jpg')}return a})();
    var dims = (C.dims || []).slice();
    if(C.lead && C.lead>=1 && C.lead<=urls.length){ urls.unshift(urls.splice(C.lead-1,1)[0]); if(dims.length>=C.lead){ dims.unshift(dims.splice(C.lead-1,1)[0]); } }
    window.OD_GALLERY=urls;
    box.innerHTML=urls.map(function(u,i){
      var cls = i===0 ? 'big lead' : ((i%7)===3 ? 'wide' : '');
      var d = dims[i], dim = (d && d[0]) ? ' width="'+d[0]+'" height="'+d[1]+'"' : '';
      return '<button class="'+cls+'" onclick="openLb('+i+')"><img src="'+u+'"'+dim+' alt="'+(C.alt||T.realisation)+' — '+T.photo+' '+(i+1)+'" loading="lazy"></button>';
    }).join('');
  }

  /* ---------- Lightbox ---------- */
  var li=0;
  window.openLb=function(i){var g=window.OD_GALLERY||[];if(!g.length)return;li=i;$('#lb-img').src=g[i];$('#lb').classList.add('open');document.body.style.overflow='hidden'};
  window.closeLb=function(){var el=$('#lb');if(el){el.classList.remove('open');document.body.style.overflow=''}};
  window.navLb=function(d){var g=window.OD_GALLERY||[];li=(li+d+g.length)%g.length;$('#lb-img').src=g[li]};
  function initLb(){var el=$('#lb');if(!el)return;el.addEventListener('click',function(e){if(e.target.id==='lb')closeLb()});document.addEventListener('keydown',function(e){if(!el.classList.contains('open'))return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')navLb(-1);if(e.key==='ArrowRight')navLb(1)});}

  /* ---------- Simulateur ---------- */
  function initCalc(){
    var box=$('#calc'); if(!box||!window.OD_SIM)return;
    var cfg=window.OD_SIM, cost=cfg.costs||35;
    var seg=cfg.types.length>1 ? '<div class="seg">'+cfg.types.map(function(t,i){return '<button data-i="'+i+'"'+(i===0?' class="on"':'')+'>'+t.name+'</button>'}).join('')+'</div>' : '';
    box.innerHTML='<div class="calc-controls">'+seg
      +'<div class="cf"><label>'+T.c.price+' <b id="c-price"></b></label><input type="range" id="r-price"></div>'
      +'<div class="cf"><label>'+T.c.rent+' <b id="c-rent"></b></label><input type="range" id="r-rent" min="15000" max="200000" step="5000"><div class="hint">'+T.c.rentHint+'</div></div>'
      +'<div class="cf"><label>'+T.c.costs+' <b id="c-cost"></b></label><input type="range" id="r-cost" min="25" max="45" step="1" value="'+cost+'"><div class="hint">'+T.c.costsHint+'</div></div></div>'
      +'<div class="calc-out"><div class="donut" id="donut"><div class="donut-in"><b><span id="c-gross">0</span>%</b><span>'+T.c.gross+'</span></div></div>'
      +'<div class="calc-lines"><div><span>'+T.c.annual+'</span><b id="c-annual"></b></div><div><span>'+T.c.netY+'</span><b id="c-net"></b></div></div></div>';
    var rP=$('#r-price'),rR=$('#r-rent'),rC=$('#r-cost');
    function load(i){var t=cfg.types[i];rP.min=Math.round(t.price*0.85/1e5)*1e5;rP.max=Math.round(t.price*1.3/1e5)*1e5;rP.step=1e5;rP.value=t.price;rR.value=t.rent}
    function calc(){var price=+rP.value,rent=+rR.value,c=+rC.value;var annual=rent*12,gross=annual/price*100,net=annual*(1-c/100)/price*100;
      $('#c-price').textContent=baht(price);$('#c-rent').textContent=baht(rent);$('#c-cost').textContent=c+' %';
      $('#c-gross').textContent=num1(gross);$('#c-annual').textContent=baht(annual);$('#c-net').textContent=pct(net);
      $('#donut').style.setProperty('--p',Math.max(0,Math.min(100,gross/15*100)));}
    [rP,rR,rC].forEach(function(r){r.addEventListener('input',calc)});
    box.querySelectorAll('.seg button').forEach(function(b){b.addEventListener('click',function(){box.querySelectorAll('.seg button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');load(+b.dataset.i);calc()})});
    load(0);calc();
  }

  /* ---------- Simulateur complet (parcelle + scénario + durée) ---------- */
  function initFullCalc(){
    var box=$('#calc'); if(!box||!window.OD_SIM_FULL)return;
    var C=window.OD_SIM_FULL, cost=(C.costs||35)/100;
    var st={plot:0, scen:(C.defaultScenario!=null?C.defaultScenario:1), nights:0, adr:0, years:(C.horizons&&C.horizons[1])||5};
    st.nights=C.scenarios[st.scen].nights; st.adr=C.scenarios[st.scen].adr;
    var plotBtns=C.plots.map(function(p,i){return '<button data-i="'+i+'"><span class="t">'+p.name+'</span><span class="p">'+baht(p.price)+'</span></button>'}).join('');
    var scenBtns=C.scenarios.map(function(s,i){return '<button data-i="'+i+'"><span class="t">'+s.name+'</span><span class="d">'+s.nights+' '+T.c.nights+' · '+baht(s.adr)+' / '+T.c.night+'</span></button>'}).join('');
    var hzBtns=(C.horizons||[1,5,10]).map(function(h){return '<button data-h="'+h+'">'+h+yrs(h)+'</button>'}).join('');
    box.innerHTML='<div class="fcalc"><div class="fgrid">'
      +'<div class="fcol fcol-controls">'
        +'<div class="frow"><span class="flabel">'+(C.plotLabel||T.c.chooseVilla)+'</span><div class="fseg" id="f-plots">'+plotBtns+'</div></div>'
        +'<div class="frow"><span class="flabel">'+T.c.scenario+'</span><div class="fseg" id="f-scen">'+scenBtns+'</div></div>'
        +'<label><span>'+T.c.nightsYr+' <b id="f-nights-v"></b></span><input type="range" id="f-nights" min="60" max="300" step="1"></label>'
        +'<label><span>'+T.c.adr+' <b id="f-adr-v"></b></span><input type="range" id="f-adr" min="1000" max="15000" step="100"></label>'
        +'<span class="flabel">'+T.c.holding+'</span><div class="fseg hz" id="f-hz">'+hzBtns+'</div>'
      +'</div><div class="fcol fcol-result">'
        +'<span class="fkick">'+T.c.grossEst+'</span><div class="fbig" id="f-gross">—</div>'
        +'<div class="fnet"><b id="f-net">—</b></div>'
        +'<div class="fline"><span>'+T.c.annual+'</span><b id="f-annual"></b></div>'
        +'<div class="fline"><span>'+T.c.netAnnual+'</span><b id="f-netannual"></b></div>'
        +'<div class="fline"><span>'+T.c.monthly+'</span><b id="f-monthly"></b></div>'
        +'<div class="fline"><span id="f-cumul-l">'+T.c.cumul+'</span><b id="f-cumul"></b></div>'
        +'<div class="fline"><span>'+T.c.share+'</span><b id="f-share"></b></div>'
        +'<div class="fline"><span>'+T.c.payback+'</span><b id="f-payback"></b></div>'
      +'</div></div></div>';
    var rN=$('#f-nights'),rA=$('#f-adr');
    function setActive(sel,i,attr){box.querySelectorAll(sel+' button').forEach(function(b){b.classList.toggle('on',(b.getAttribute(attr))==String(i))})}
    function draw(){
      var price=C.plots[st.plot].price, annual=st.nights*st.adr, gross=annual/price*100;
      var netAnnual=annual*(1-cost), netY=netAnnual/price*100, cumul=netAnnual*st.years, share=cumul/price*100, payback=price/annual, monthly=annual/12;
      rN.value=st.nights; rA.value=st.adr;
      $('#f-nights-v').textContent=st.nights+' '+T.c.nightsPerYr;
      $('#f-adr-v').textContent=baht(st.adr)+' / '+T.c.night;
      $('#f-gross').textContent=num1(gross)+' %';
      $('#f-net').textContent=pct(netY);
      $('#f-annual').textContent=baht(annual);
      $('#f-netannual').textContent=baht(netAnnual);
      $('#f-monthly').textContent=baht(monthly);
      $('#f-cumul-l').textContent=T.c.cumulOver+' '+st.years+yrs(st.years);
      $('#f-cumul').textContent=baht(cumul);
      $('#f-share').textContent=share.toFixed(0)+' %';
      $('#f-payback').textContent=num1(payback)+yrs(payback<=1?1:2);
      setActive('#f-plots',st.plot,'data-i'); setActive('#f-scen',st.scen,'data-i'); setActive('#f-hz',st.years,'data-h');
    }
    box.querySelector('#f-plots').addEventListener('click',function(e){var b=e.target.closest('button');if(b){st.plot=+b.dataset.i;draw()}});
    box.querySelector('#f-scen').addEventListener('click',function(e){var b=e.target.closest('button');if(b){st.scen=+b.dataset.i;st.nights=C.scenarios[st.scen].nights;st.adr=C.scenarios[st.scen].adr;draw()}});
    box.querySelector('#f-hz').addEventListener('click',function(e){var b=e.target.closest('button');if(b){st.years=+b.dataset.h;draw()}});
    rN.addEventListener('input',function(){st.nights=+rN.value;st.scen=-1;draw()});
    rA.addEventListener('input',function(){st.adr=+rA.value;st.scen=-1;draw()});
    draw();
  }

  /* ---------- Sous-nav collante (surlignage) ---------- */
  function initSubnav(){
    var nav=$('.subnav'); if(!nav)return;
    // Uniquement pour les sous-navs à ancres (#section). Les sous-navs qui
    // pointent vers d'autres pages gardent leur classe .active du HTML.
    var links=[].slice.call(nav.querySelectorAll('a')).filter(function(a){
      return (a.getAttribute('href')||'').charAt(0)==='#';
    });
    if(!links.length) return;
    var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))}).filter(Boolean);
    window.addEventListener('scroll',function(){
      var y=window.scrollY+120, act=secs[0];
      secs.forEach(function(s){if(s.offsetTop<=y)act=s});
      links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+(act&&act.id))});
    },{passive:true});
  }

  /* ---------- Formulaire contact ---------- */
  var BROCHURES={
    'sea-view':'brochures/villa-sea-view-%L%.pdf',
    'eden-tropical':'brochures/eden-tropical-%L%.pdf',
    'terra-mare':'brochures/terra-mare-%L%.pdf',
    'tropical-golf':'brochures/tropical-golf-villa-2-%L%.pdf'
  };
  function brochureUrl(programme,langue){
    var tpl=BROCHURES[programme]; if(!tpl) return '';
    return '/'+tpl.replace('%L%', langue==='en'?'en':'fr');
  }
  function triggerDownload(url){
    try{
      var a=document.createElement('a');
      a.href=url; a.setAttribute('download',''); a.rel='noopener'; a.style.display='none';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ a.remove(); }, 0);
    }catch(e){ try{ window.open(url,'_blank','noopener'); }catch(e2){} }
  }

  function initContactForm(){
    var form=$('#contact-form'); if(!form)return;

    // Langue de la page -> champ caché + présélection de la langue de brochure
    var lang=(document.documentElement.lang||'fr').slice(0,2).toLowerCase();
    var lf=form.querySelector('input[name=lang]'); if(lf) lf.value=lang;
    var bl=form.querySelector('select[name=brochure_langue]'); if(bl) bl.value=(lang==='en'?'en':'fr');

    // Chips "intention" -> input caché (valeurs multiples, séparées par des virgules)
    var chips=form.querySelectorAll('#intention-chips button');
    var hid=form.querySelector('input[name=intention]');
    function syncChips(){
      var v=[]; chips.forEach(function(b){ if(b.classList.contains('on')) v.push(b.dataset.v||b.textContent.trim()); });
      if(hid) hid.value=v.join(', ');
    }
    chips.forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('on'); syncChips(); }); });

    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=$('#contact-thanks'), err=$('#contact-error');
      if(err) err.hidden=true;
      var btn=form.querySelector('button[type=submit]');
      if(btn){ btn.disabled=true; btn.style.opacity=.5; }
      syncChips();
      var data={}; new FormData(form).forEach(function(v,k){ data[k]=v; });
      var tText=$('#thanks-text'), dl=$('#brochure-dl');
      function succeed(){
        form.querySelectorAll('input,select,textarea').forEach(function(el){ if(el.type!=='hidden') el.disabled=true; });
        var url=brochureUrl(data.programme, data.brochure_langue);
        if(url){
          if(tText) tText.textContent=T.thanksDl;
          if(dl){ dl.href=url; dl.hidden=false; }
          triggerDownload(url);
        } else {
          if(tText) tText.textContent=T.thanksNoDl;
          if(dl) dl.hidden=true;
        }
        if(ok) ok.hidden=false;
      }
      fetch('/api/brochure',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){ return r.json().catch(function(){return {ok:r.ok}}); })
        .then(function(res){
          if(res && res.error==='invalid_input') throw new Error('invalid_input');
          succeed();
        })
        .catch(function(e){
          if(e && e.message==='invalid_input'){
            if(err){ err.textContent=T.errInput; err.hidden=false; }
            if(btn){ btn.disabled=false; btn.style.opacity=1; }
            return;
          }
          // Échec réseau : le formulaire a bien été rempli. On donne quand même
          // la brochure et on invite à confirmer par WhatsApp.
          var url=brochureUrl(data.programme, data.brochure_langue);
          if(err){ err.textContent=T.errSend(!!url); err.hidden=false; }
          if(btn){ btn.disabled=false; btn.style.opacity=1; }
          if(url){ if(dl){ dl.href=url; dl.hidden=false; } triggerDownload(url); }
        });
    });
  }

  /* ---------- Reveal ---------- */
  function initReveal(){if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window))return;
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='none';io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
    document.querySelectorAll('[data-reveal]').forEach(function(el,i){el.style.opacity=0;el.style.transform='translateY(22px)';el.style.transition='opacity .7s ease '+((i%3)*70)+'ms, transform .7s '+((i%3)*70)+'ms';io.observe(el)});}

  function renderContent(){
    renderHero();renderEncarts();renderDispos();renderStats();renderRealisations();renderRealisationGallery();
    if(typeof window.OD_renderProgrammePage==='function') try{window.OD_renderProgrammePage()}catch(e){}
    // (re)construit les simulateurs après application du paramétrage CMS ;
    // no-op si la page n'a pas de #calc. Les fonctions relisent window.OD_SIM(_FULL).
    initCalc();initFullCalc();
  }

  document.addEventListener('DOMContentLoaded',function(){
    initHeader();initMenu();initLb();initCalc();initFullCalc();initSubnav();initContactForm();initReveal();
    var cms = (typeof window.OD_loadCMS === 'function') ? window.OD_loadCMS() : Promise.resolve(false);
    cms.catch(function(e){ if(window.console) console.warn('CMS indisponible, contenu par défaut :', e && e.message); })
       .then(renderContent);
  });
})();
