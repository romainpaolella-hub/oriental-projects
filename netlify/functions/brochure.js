/**
 * Oriental Projects — traitement du formulaire "brochure".
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
 *   ACK_TO_CUSTOMER  (optionnel)    "true" => envoie aussi un accusé au client.
 *                                   Ignoré tant que MAIL_FROM reste l'adresse
 *                                   bac à sable onboarding@resend.dev.
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
  message: 'Message',
  lang: 'Langue du site',
  consentement: 'Consentement'
};

const PROGRAMME_LABELS = {
  'sea-view': 'Villa Sea View — Ban Tai',
  'eden-tropical': 'Eden Tropical — Lipa Noi',
  'terra-mare': 'Terra Mare — Bophut',
  'tropical-golf': 'Villa clé en main (Tropical Golf)',
  'autre': 'Je ne sais pas encore'
};

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
  const keys = ['nom', 'email', 'telephone', 'pays', 'programme', 'brochure_langue', 'intention', 'message', 'lang'];
  return keys.map(function (k) {
    let val = data[k];
    if (!val) return '';
    if (k === 'programme') val = PROGRAMME_LABELS[val] || val;
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
    intention: data.intention || '',
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
  const fromHeader = from.indexOf('<') !== -1 ? from : ('Oriental Projects <' + from + '>');
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromHeader,
        to: [to],
        subject: 'Oriental Projects — test de configuration e-mail',
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

  const fromHeader = from && from.indexOf('<') !== -1 ? from : ('Oriental Projects <' + (from || '') + '>');
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
    ['nom', 'email', 'telephone', 'pays', 'brochure_langue', 'intention', 'message', 'lang']
      .filter(function (k) { return data[k]; })
      .map(function (k) { return (FIELD_LABELS[k] || k) + ' : ' + data[k]; })
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
        subject: 'Brochure — ' + (data.nom || 'Nouveau contact') + ' · ' + programmeLabel,
        html: notifHtml,
        text: notifText
      });
    } catch (err) {
      // Non bloquant : le lead est dans Forms, le visiteur reçoit sa brochure.
      console.error('Echec envoi notification (non bloquant):', err.message);
    }
  }

  // Accusé de réception au client — seulement hors bac à sable Resend.
  const fromAddr = ((from || '').match(/<([^>]+)>/) || [null, from])[1];
  const ackEnabled = String(process.env.ACK_TO_CUSTOMER || '').toLowerCase() === 'true';
  if (apiKey && ackEnabled && fromAddr && fromAddr !== SANDBOX_FROM) {
    const ackHtml =
      '<div style="max-width:620px;margin:0 auto;font-family:Arial,sans-serif;color:#252824">' +
        '<h2 style="font:600 20px/1.3 Georgia,serif;color:#33544c;margin:0 0 12px">Merci pour votre demande</h2>' +
        '<p style="font:400 15px/1.6 Arial,sans-serif">Bonjour ' + esc(data.nom) + ',</p>' +
        '<p style="font:400 15px/1.6 Arial,sans-serif">Nous avons bien reçu votre demande concernant <strong>' + esc(programmeLabel) + '</strong>. ' +
        'Notre équipe locale francophone vous répond sous 24 h avec la brochure, les disponibilités et les conditions.</p>' +
        '<p style="font:400 15px/1.6 Arial,sans-serif">Pour toute question immédiate : WhatsApp +66 655 767 871.</p>' +
        '<p style="font:400 15px/1.6 Arial,sans-serif;margin-top:20px">— Oriental Projects Promotion, Koh Samui</p>' +
      '</div>';
    try {
      await sendEmail(apiKey, {
        from: fromHeader,
        to: [data.email],
        subject: 'Votre demande de brochure — Oriental Projects',
        html: ackHtml,
        text: 'Bonjour ' + data.nom + ',\n\nNous avons bien reçu votre demande concernant ' + programmeLabel +
              '. Notre équipe vous répond sous 24 h.\n\nWhatsApp : +66 655 767 871\n\n— Oriental Projects Promotion'
      });
    } catch (err) {
      console.error('Accusé client non envoyé (non bloquant):', err.message);
    }
  }

  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
};
