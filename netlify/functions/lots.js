/**
 * Koh Samui Estate — écriture de la disponibilité des lots (plans interactifs).
 * Reçoit l'état complet des lots d'un programme depuis le "Mode gestion" du
 * plan interactif et le sauvegarde dans Sanity (dataset "production"), pour
 * que tous les visiteurs voient le changement — pas seulement l'éditeur.
 *
 * Variables d'environnement Netlify :
 *   SANITY_PROJECT_ID   (obligatoire)  déjà utilisé par la fonction "brochure"
 *   SANITY_WRITE_TOKEN  (obligatoire)  jeton Editor — doit couvrir le dataset
 *                                      "production" (pas seulement "leads")
 *   SANITY_DATASET      (optionnel, déf. "production")
 *   LOTS_ADMIN_SECRET   (obligatoire)  mot de passe demandé dans le
 *                                      "Mode gestion" avant toute sauvegarde
 */

const PROGRAMMES = ['eden-tropical', 'terra-mare', 'sea-view'];
const STATUSES = ['available', 'reserved', 'sold'];

function json(statusCode, body) {
  return {
    statusCode,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, {ok: false, error: 'method_not_allowed'});

  const projectId = process.env.SANITY_PROJECT_ID;
  const token = process.env.SANITY_WRITE_TOKEN;
  const dataset = process.env.SANITY_DATASET || 'production';
  const secret = process.env.LOTS_ADMIN_SECRET;

  if (!projectId || !token) return json(500, {ok: false, error: 'server_not_configured'});
  if (!secret) return json(500, {ok: false, error: 'admin_secret_not_configured'});

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, {ok: false, error: 'invalid_json'});
  }

  if (data.secret !== secret) return json(401, {ok: false, error: 'wrong_secret'});

  const slug = data.programmeSlug;
  if (PROGRAMMES.indexOf(slug) === -1) return json(422, {ok: false, error: 'invalid_programme'});

  const lots = Array.isArray(data.lots) ? data.lots : null;
  if (!lots) return json(422, {ok: false, error: 'invalid_lots'});

  const cleanLots = [];
  for (const l of lots) {
    if (!l || typeof l.lotId !== 'string' || !l.lotId) return json(422, {ok: false, error: 'invalid_lot_id'});
    const status = STATUSES.indexOf(l.status) !== -1 ? l.status : 'available';
    const entry = {
      _type: 'lotStatus',
      _key: String(l.lotId).replace(/[^a-zA-Z0-9]/g, '_') || Math.random().toString(36).slice(2),
      lotId: String(l.lotId),
      status: status,
      price: l.price ? String(l.price).slice(0, 60) : '',
    };
    if (Array.isArray(l.box) && l.box.length === 4 && l.box.every((n) => typeof n === 'number' && isFinite(n))) {
      entry.box = l.box;
    }
    cleanLots.push(entry);
  }

  const docId = 'lotplan-' + slug;
  const doc = {
    _id: docId,
    _type: 'lotPlan',
    programmeSlug: slug,
    lots: cleanLots,
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(
      'https://' + projectId + '.api.sanity.io/v2024-01-01/data/mutate/' + dataset,
      {
        method: 'POST',
        headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
        body: JSON.stringify({mutations: [{createOrReplace: doc}]}),
      }
    );
    const text = await res.text();
    if (!res.ok) {
      console.error('Sanity lotPlan ' + res.status + ': ' + text.slice(0, 500));
      return json(502, {ok: false, error: 'sanity_error', detail: text.slice(0, 300)});
    }
    return json(200, {ok: true});
  } catch (e) {
    console.error('Sanity lotPlan — exception:', e.message);
    return json(502, {ok: false, error: 'sanity_exception'});
  }
};
