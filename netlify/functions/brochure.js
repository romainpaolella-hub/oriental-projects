/**
 * Koh Samui Estate — traitement du formulaire "brochure".
 * Envoie un e-mail de notification via l'API Resend (aucune dépendance npm).
 *
 * Variables d'environnement Netlify :
 *   RESEND_API_KEY   (obligatoire)  clé API Resend
 *   MAIL_FROM        (obligatoire)  expéditeur — ex. "onboarding@resend.dev"
 *                                   (bac à sable Resend : ne délivre qu'à l'e-mail
 *                                    du propriétaire du compte Resend)
 *   MAIL_TO          (obligatoire)  destinataire de la notification (votre boîte).
 *                                   Avec l'expéditeur bac à sable, doit être
 *                                   l'e-mail du compte Resend.
 *   MAIL_TO_CC       (optionnel)    adresses en copie, séparées par des virgules
 *   ACK_TO_CUSTOMER  (optionnel)    "false" => n'envoie PAS l'e-mail de confirmation (avec lien
 *                                   de la brochure) au visiteur. Actif par défaut ; ignoré tant que
 *                                   MAIL_FROM reste l'adresse bac à sable onboarding@resend.dev.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const SANDBOX_FROM = 'onboarding@resend.dev';

const FIELD_LABELS = {
  nom: 'Nom & prénom',
  email: 'E-mail',
  telephone: 'Téléphone',
  pays: 'Pays de résidence',
  programme: 'Programme',
  brochure_langue: 'Langue de la brochure',
  intention: 'Intention',
  rappel: 'Rappel',
  message: 'Message',
  lang: 'Langue du site',
  consentement: 'Consentement'
};

const PROGRAMME_LABELS = {
  'sea-view': 'Villa Sea View — Ban Tai',
  'eden-tropical': 'Eden Tropical — Lipa Noi',
  'terra-mare': 'Terra Mare — Bophut',
  'palm-sea-view': 'Palm Sea View — Bo Phut',
  'tropical-golf-villa-1': 'Tropical Golf — Villa 1',
  'tropical-golf-villa-2': 'Tropical Golf — Villa 2 (louée)',
  'villa-lilouana': 'Villa Lilouana — Maenam',
  'ocean-180': 'Ocean 180 — Bo Phut',
  'villa-aurora': 'Villa Aurora Signature — Plai Laem',
  'luxury-dream-house-sea-view': 'Luxury Dream House Sea View — Bo Phut',
  'hidden-jungle': 'Hidden Jungle — Mae Nam (à venir)',
  'autre': 'Je ne sais pas encore'
};

// Brochures statiques (mêmes fichiers que public/js/site.js). Les brochures téléversées dans
// Sanity sont transmises par le navigateur (brochure_url) et validées ci-dessous.
const BROCHURE_FILES = {
  'sea-view': 'villa-sea-view-%L%.pdf',
  'eden-tropical': 'eden-tropical-%L%.pdf',
  'terra-mare': 'terra-mare-%L%.pdf',
  'tropical-golf-villa-2': 'tropical-golf-villa-2-%L%.pdf',
  'villa-lilouana': 'villa-lilouana-en.pdf',
  'ocean-180': 'ocean-180-en.pdf'
};

// URL de brochure à mettre dans l'e-mail : celle envoyée par le navigateur si elle pointe bien
// vers notre site ou notre CDN Sanity (jamais un lien arbitraire), sinon le fichier statique.
function resolveBrochureUrl(data) {
  const origin = (process.env.URL || 'https://kohsamuiestate.com').replace(/\/+$/, '');
  const pid = process.env.SANITY_PROJECT_ID || 'x3jcttot';
  const u = String(data.brochure_url || '');
  if (u.indexOf(origin + '/brochures/') === 0 || u.indexOf('https://cdn.sanity.io/files/' + pid + '/') === 0) {
    if (!/[\s"'<>]/.test(u)) return u;
  }
  const tpl = BROCHURE_FILES[data.programme];
  if (!tpl) return '';
  return origin + '/brochures/' + tpl.replace('%L%', data.brochure_langue === 'en' ? 'en' : 'fr');
}

function parseBody(event) {
  const ct = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  if (ct.indexOf('application/json') !== -1) {
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
  }
  const out = {};
  new URLSearchParams(raw).forEach(function (v, k) { out[k] = v; });
  return out;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function buildRows(data) {
  const keys = ['nom', 'email', 'telephone', 'pays', 'programme', 'brochure_langue', 'intention', 'rappel', 'message', 'lang'];
  return keys.map(function (k) {
    let val = data[k];
    if (!val) return '';
    if (k === 'programme') val = PROGRAMME_LABELS[val] || val;
    if (k === 'rappel') val = 'OUI — à rappeler au lancement du programme';
    val = esc(val).replace(/\n/g, '<br>');
    return '<tr>' +
      '<td style="padding:8px 14px;background:#f4f0e7;font:600 13px/1.4 Arial,sans-serif;color:#252824;white-space:nowrap;vertical-align:top">' + esc(FIELD_LABELS[k] || k) + '</td>' +
      '<td style="padding:8px 14px;font:400 14px/1.5 Arial,sans-serif;color:#252824">' + val + '</td>' +
      '</tr>';
  }).join('');
}

async function sendEmail(apiKey, payload) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error('Resend ' + res.status + ': ' + text.slice(0, 500));
  }
  return text;
}

// Enregistre aussi la demande dans l'onglet "Forms" de Netlify (best-effort).
async function forwardToNetlifyForms(siteUrl, data) {
  if (!siteUrl) return;
  const body = new URLSearchParams(Object.assign({ 'form-name': data['form-name'] || 'brochure' }, data)).toString();
  try {
    await fetch(siteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });
  } catch (e) { /* non bloquant */ }
}

// Crée un document "lead" dans Sanity (dataset privé). Best-effort.
// Variables d'env : SANITY_PROJECT_ID, SANITY_LEADS_DATASET (déf. "leads"),
//                   SANITY_WRITE_TOKEN (jeton Editor sur ce dataset).
async function saveLeadToSanity(data, pageUrl) {
  const projectId = process.env.SANITY_PROJECT_ID;
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!projectId || !token) return;
  const dataset = process.env.SANITY_LEADS_DATASET || 'leads';
  const doc = {
    _type: 'lead',
    status: 'nouveau',
    name: data.nom || '',
    email: data.email || '',
    phone: data.telephone || '',
    country: data.pays || '',
    programme: data.programme || '',
    brochureLang: data.brochure_langue || '',
    intention: data.intention || (data.rappel ? 'Rappel au lancement' : ''),
    message: data.message || '',
    pageUrl: pageUrl || '',
    createdAt: new Date().toISOString()
  };
  try {
    const res = await fetch(
      'https://' + projectId + '.api.sanity.io/v2024-01-01/data/mutate/' + dataset,
      {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutations: [{ create: doc }] })
      }
    );
    if (!res.ok) console.error('Sanity lead ' + res.status + ': ' + (await res.text()).slice(0, 300));
  } catch (e) {
    console.error('Sanity lead — échec (non bloquant):', e.message);
  }
}

// Diagnostic : GET /api/brochure?selftest=1
// Révèle uniquement la PRÉSENCE des variables (pas les secrets) et, si Resend
// est configuré, tente un vrai envoi vers MAIL_TO en renvoyant le code/erreur.
async function runSelfTest() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO;
  const fromAddr = ((from || '').match(/<([^>]+)>/) || [null, from])[1] || null;
  const report = {
    env: {
      RESEND_API_KEY: !!apiKey,
      MAIL_FROM: from || null,
      MAIL_TO: to || null,
      MAIL_TO_CC: process.env.MAIL_TO_CC || null,
      ACK_TO_CUSTOMER: process.env.ACK_TO_CUSTOMER || null,
      SANITY_PROJECT_ID: !!process.env.SANITY_PROJECT_ID,
      SANITY_WRITE_TOKEN: !!process.env.SANITY_WRITE_TOKEN,
      SANITY_LEADS_DATASET: process.env.SANITY_LEADS_DATASET || 'leads',
      URL: process.env.URL || null
    },
    sandboxFrom: fromAddr === SANDBOX_FROM,
    resend: null
  };
  if (!apiKey || !from || !to) {
    report.verdict = 'config_incomplete';
    report.hint = 'Il manque ' + ['RESEND_API_KEY', 'MAIL_FROM', 'MAIL_TO'].filter(function (k) {
      return k === 'RESEND_API_KEY' ? !apiKey : k === 'MAIL_FROM' ? !from : !to;
    }).join(', ') + ' dans les variables Netlify.';
    return report;
  }
  const fromHeader = from.indexOf('<') !== -1 ? from : ('Koh Samui Estate <' + from + '>');
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromHeader,
        to: [to],
        subject: 'Koh Samui Estate — test de configuration e-mail',
        text: 'Si vous recevez ce message, l\'envoi des notifications de brochure fonctionne.\n\nEnvoyé le ' + new Date().toISOString()
      })
    });
    const text = await res.text();
    report.resend = { status: res.status, ok: res.ok, body: text.slice(0, 600) };
    report.verdict = res.ok ? 'ok_email_sent' : 'resend_error';
  } catch (e) {
    report.resend = { error: String(e && e.message || e) };
    report.verdict = 'resend_exception';
  }
  return report;
}

exports.handler = async function (event) {
  const JSON_HEADERS = { 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  }
  if (event.httpMethod === 'GET') {
    const qs = event.queryStringParameters || {};
    if (qs.selftest === '1') {
      const report = await runSelfTest();
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(report, null, 2) };
    }
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'method_not_allowed' }) };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'method_not_allowed' }) };
  }

  const data = parseBody(event);

  // Honeypot anti-spam : champ "bot-field" rempli => on ignore en simulant un succès.
  if (data['bot-field']) {
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
  }

  if (!data.nom || !isEmail(data.email)) {
    return { statusCode: 422, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'invalid_input' }) };
  }

  // Le prospect a rempli le formulaire : on enregistre TOUJOURS le lead
  // (Netlify Forms + Sanity) avant toute chose, pour ne rien perdre même
  // si l'envoi d'e-mail échoue.
  const pageUrl = (event.headers.referer || event.headers.Referer || '');
  await forwardToNetlifyForms(process.env.URL, data);
  await saveLeadToSanity(data, pageUrl);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO;

  const fromHeader = from && from.indexOf('<') !== -1 ? from : ('Koh Samui Estate <' + (from || '') + '>');
  const cc = (process.env.MAIL_TO_CC || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const programmeLabel = PROGRAMME_LABELS[data.programme] || data.programme || '—';

  const notifHtml =
    '<div style="max-width:620px;margin:0 auto;font-family:Arial,sans-serif;color:#252824">' +
      '<h2 style="font:600 20px/1.3 Georgia,serif;color:#33544c;margin:0 0 4px">Nouvelle demande de brochure</h2>' +
      '<p style="font:400 13px/1.5 Arial,sans-serif;color:#4a5142;margin:0 0 18px">Programme : <strong>' + esc(programmeLabel) + '</strong></p>' +
      '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;border:1px solid #e5ddce">' +
        buildRows(data) +
      '</table>' +
      '<p style="font:400 12px/1.5 Arial,sans-serif;color:#8a8577;margin:16px 0 0">Répondez directement à cet e-mail pour écrire au prospect.</p>' +
    '</div>';

  const notifText =
    'Nouvelle demande de brochure\n' +
    'Programme : ' + programmeLabel + '\n\n' +
    ['nom', 'email', 'telephone', 'pays', 'brochure_langue', 'intention', 'rappel', 'message', 'lang']
      .filter(function (k) { return data[k]; })
      .map(function (k) { return (FIELD_LABELS[k] || k) + ' : ' + (k === 'rappel' ? 'OUI — à rappeler au lancement du programme' : data[k]); })
      .join('\n');

  if (!apiKey || !from || !to) {
    // Lead déjà enregistré dans Forms — on n'échoue pas la requête côté visiteur,
    // mais on trace la config manquante.
    console.error('E-mail non envoyé — config manquante: RESEND_API_KEY / MAIL_FROM / MAIL_TO');
  } else {
    try {
      await sendEmail(apiKey, {
        from: fromHeader,
        to: [to],
        cc: cc.length ? cc : undefined,
        reply_to: data.email,
        subject: (data.rappel ? 'Brochure + RAPPEL AU LANCEMENT — ' : 'Brochure — ') + (data.nom || 'Nouveau contact') + ' · ' + programmeLabel,
        html: notifHtml,
        text: notifText
      });
    } catch (err) {
      // Non bloquant : le lead est dans Forms, le visiteur reçoit sa brochure.
      console.error('Echec envoi notification (non bloquant):', err.message);
    }
  }

  // E-mail de confirmation au visiteur, avec le lien de la brochure (bilingue).
  // Envoyé par défaut ; ACK_TO_CUSTOMER=false le désactive. Ignoré avec l'expéditeur bac à sable Resend.
  let acked = false;
  const fromAddr = ((from || '').match(/<([^>]+)>/) || [null, from])[1];
  const ackOff = String(process.env.ACK_TO_CUSTOMER || '').toLowerCase() === 'false';
  if (apiKey && !ackOff && fromAddr && fromAddr !== SANDBOX_FROM) {
    const en = String(data.lang || '').toLowerCase() === 'en';
    const url = data.rappel ? '' : resolveBrochureUrl(data);
    const prog = programmeLabel;
    const progShort = programmeLabel.split(' — ')[0];
    const P = 'font:400 15px/1.6 Arial,sans-serif;margin:0 0 14px';
    const txt = en ? {
      subject: url ? 'Your ' + progShort + ' brochure — Koh Samui Estate' : 'Your request — Koh Samui Estate',
      title: 'Thank you for your request',
      hi: 'Hello ' + data.nom + ',',
      got: 'We have received your request about <strong>' + esc(prog) + '</strong>.',
      soon: 'We will send you the brochure as soon as it is published and call you back when the programme launches.',
      noFile: 'Our local team will email you the brochure, availability and terms within 24 hours.',
      withFile: 'Your brochure is ready:',
      btn: 'Download the brochure (PDF)',
      fallback: 'If the button does not work, copy this link into your browser:',
      team: 'Our local English- and French-speaking team will also get back to you within 24 hours. You can reply directly to this email.',
      wa: 'For anything urgent: WhatsApp +66 655 767 871.',
      sign: '— Koh Samui Estate, Koh Samui'
    } : {
      subject: url ? 'Votre brochure ' + progShort + ' — Koh Samui Estate' : 'Votre demande — Koh Samui Estate',
      title: 'Merci pour votre demande',
      hi: 'Bonjour ' + data.nom + ',',
      got: 'Nous avons bien reçu votre demande concernant <strong>' + esc(prog) + '</strong>.',
      soon: 'Nous vous enverrons la brochure dès sa publication et nous vous rappellerons au lancement du programme.',
      noFile: 'Notre équipe locale vous envoie la brochure, les disponibilités et les conditions sous 24 h.',
      withFile: 'Votre brochure est prête :',
      btn: 'Télécharger la brochure (PDF)',
      fallback: 'Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :',
      team: 'Notre équipe locale francophone vous recontacte aussi sous 24 h. Vous pouvez répondre directement à cet e-mail.',
      wa: 'Pour toute question urgente : WhatsApp +66 655 767 871.',
      sign: '— Koh Samui Estate, Koh Samui'
    };
    const ackHtml =
      '<div style="max-width:620px;margin:0 auto;font-family:Arial,sans-serif;color:#252824">' +
        '<h2 style="font:600 20px/1.3 Georgia,serif;color:#33544c;margin:0 0 14px">' + txt.title + '</h2>' +
        '<p style="' + P + '">' + esc(txt.hi) + '</p>' +
        '<p style="' + P + '">' + txt.got + ' ' + (data.rappel ? txt.soon : (url ? '' : txt.noFile)) + '</p>' +
        (url
          ? '<p style="' + P + '">' + txt.withFile + '</p>' +
            '<p style="margin:0 0 14px"><a href="' + esc(url) + '" style="display:inline-block;background:#33544c;color:#ffffff;text-decoration:none;font:500 14px/1 Arial,sans-serif;letter-spacing:.06em;padding:15px 26px;border-radius:2px">' + txt.btn + '</a></p>' +
            '<p style="font:400 12px/1.5 Arial,sans-serif;color:#8a8577;margin:0 0 18px">' + txt.fallback + '<br>' + esc(url) + '</p>'
          : '') +
        '<p style="' + P + '">' + txt.team + '</p>' +
        '<p style="' + P + '">' + txt.wa + '</p>' +
        '<p style="font:400 15px/1.6 Arial,sans-serif;margin-top:20px">' + txt.sign + '</p>' +
      '</div>';
    const ackText = [txt.hi, '', txt.got.replace(/<[^>]+>/g, '') + ' ' + (data.rappel ? txt.soon : (url ? '' : txt.noFile)),
      url ? '\n' + txt.withFile + '\n' + url : '', '', txt.team, txt.wa, '', txt.sign].join('\n');
    try {
      await sendEmail(apiKey, {
        from: fromHeader,
        to: [data.email],
        reply_to: to || undefined,
        subject: txt.subject,
        html: ackHtml,
        text: ackText
      });
      acked = true;
    } catch (err) {
      console.error('Accusé client non envoyé (non bloquant):', err.message);
    }
  }

  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, ack: acked }) };
};
