# Oriental Projects — site + back office

```
public/              Le site (HTML/CSS/JS statiques). C'est ce que Netlify publie.
netlify/functions/   Fonction serverless du formulaire brochure (Resend + Sanity).
netlify.toml         Config de déploiement Netlify.
studio/              Le back office (Sanity Studio) — déployé séparément sur *.sanity.studio.
```

Le site lit le contenu de Sanity **en direct** (côté navigateur). Modifier un prix
ou une photo dans le Studio est visible **immédiatement, sans redéploiement**.
Tant que le dataset Sanity est vide, le site utilise le contenu de repli dans
`public/js/projects.js` — donc rien ne casse pendant la mise en place.

---

## État

- [x] Dépôt GitHub : `romainpaolella-hub/oriental-projects` (branche `main`)
- [x] ID projet Sanity `x3jcttot` branché dans `public/js/cms.js` et `studio/`
- [ ] Netlify relié au dépôt Git
- [ ] Dataset `leads` + import du contenu + déploiement du Studio
- [ ] CORS Sanity + variables d'env Netlify

---

## 1. Relier Netlify au dépôt Git

Sur le site **existant** `orientalpromotion` (pour garder l'URL et les variables
d'env) : Netlify → Site → *Site configuration* → *Build & deploy* → *Continuous
deployment* → **Link repository** → `oriental-projects`.

- Base directory : *(vide)*
- Build command : *(vide)*
- Publish directory : `public`
- Functions directory : `netlify/functions` *(auto via netlify.toml)*

Ensuite : chaque `git push` déploie automatiquement.

---

## 2. Sanity — commandes à lancer (terminal)

```bash
cd "D:\Promotion JD\oriental-projects\studio"
npx sanity login                       # ouvre le navigateur pour s'authentifier
npx sanity dataset list                # doit afficher "production"
npx sanity dataset create leads --visibility private
npx sanity exec scripts/import.mjs --with-user-token   # pré-remplit le contenu (upload images/vidéos/PDF)
npx sanity deploy                      # publie le back office
```

Le Studio devient accessible sur **https://orientalprojects.sanity.studio**
(deux espaces : *Contenu* et *Demandes*). Inviter l'équipe : sanity.io/manage →
projet → *Members*.

---

## 3. Autorisations & variables

### CORS (obligatoire — sinon le site ne peut pas lire Sanity)

sanity.io/manage → projet `x3jcttot` → *API* → *CORS origins* → *Add* :

| Origin | Credentials |
|---|---|
| `https://orientalpromotion.netlify.app` | non |
| `http://localhost:8777` | non |

### Variables d'environnement Netlify

Existantes à conserver : `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO`.

À ajouter (pour enregistrer les demandes dans le back office) :

| Variable | Valeur |
|---|---|
| `SANITY_PROJECT_ID` | `x3jcttot` |
| `SANITY_LEADS_DATASET` | `leads` |
| `SANITY_WRITE_TOKEN` | jeton **Editor** — sanity.io/manage → *API* → *Tokens* → *Add token* |

---

## Développement local

- Site : servir `public/` (ex. `npx serve public`) — `js/cms.js` pointe déjà sur `x3jcttot`.
- Studio : `cd studio && npm run dev` → http://localhost:3333
- Réimporter le contenu de démo : `npm run import` (dans `studio/`)
