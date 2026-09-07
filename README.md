# Oriental Projects — site + back office

```
public/              Le site (HTML/CSS/JS statiques). C'est ce que Netlify publie.
netlify/functions/   Fonction serverless du formulaire brochure (Resend + Sanity).
netlify.toml         Config de déploiement Netlify.
studio/              Le back office (Sanity Studio) — déployé séparément sur *.sanity.studio.
```

Le site lit le contenu de Sanity **en direct** (côté navigateur). Modifier un prix
ou une photo dans le Studio est visible **immédiatement, sans redéploiement**.
Tant que `public/js/cms.js` n'a pas d'ID de projet, le site utilise le contenu
de repli dans `public/js/projects.js`.

---

## 1. Dépôt Git + Netlify (une fois)

1. Créer un dépôt **GitHub** vide (privé de préférence), puis depuis ce dossier :
   ```
   git remote add origin https://github.com/<compte>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
2. Sur **Netlify** → *Add new site* → *Import from Git* → choisir le dépôt.
   - Build command : *(vide)*
   - Publish directory : `public`
   - Functions directory : `netlify/functions` *(auto-détecté via netlify.toml)*
3. Reporter les variables d'environnement de l'ancien site (Site settings →
   Environment variables) : `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO`.
4. Désormais : `git push` = déploiement automatique.

---

## 2. Sanity (une fois)

Prérequis : **Node.js 18+** (installé sur cette machine).

1. Créer un compte sur https://sanity.io puis :
   ```
   cd studio
   npm install
   npx sanity login
   npx sanity init --project-plan free
   ```
   - *Create new project* → nom « Oriental Projects »
   - Dataset : **production** (public)
   - Ne pas écraser les fichiers de config existants
2. Créer le **2ᵉ dataset** pour les demandes (privé) :
   ```
   npx sanity dataset create leads --visibility private
   ```
3. Récupérer l'**ID du projet** (`npx sanity projects list` ou l'URL du Studio) et :
   - le mettre dans `studio/.env` : `SANITY_STUDIO_PROJECT_ID=xxxxxxxx`
   - le mettre dans `public/js/cms.js` : `projectId: 'xxxxxxxx'`
4. Autoriser le site à lire l'API : Sanity → *API* → *CORS origins* → ajouter
   `https://<le-site>.netlify.app` (et `http://localhost:*` pour les tests).
5. Pré-remplir le contenu depuis le site actuel :
   ```
   cd studio
   npx sanity exec scripts/import.mjs --with-user-token
   ```
6. Publier le back office :
   ```
   npx sanity deploy
   ```
   → accessible sur `https://orientalprojects.sanity.studio` (workspaces
   **Contenu** et **Demandes**). Inviter l'équipe : Sanity → *Members*.

---

## 3. Leads dans le back office

Ajouter sur **Netlify** (Environment variables) :

| Variable | Valeur |
|---|---|
| `SANITY_PROJECT_ID` | l'ID du projet Sanity |
| `SANITY_LEADS_DATASET` | `leads` |
| `SANITY_WRITE_TOKEN` | jeton **Editor** créé dans Sanity → *API* → *Tokens* |

Chaque demande de brochure crée alors une fiche dans le workspace **Demandes**
(statut : nouveau / contacté / relancé / converti / perdu + notes).
L'e-mail Resend et Netlify Forms restent actifs en parallèle.

---

## Développement local

- Site : ouvrir `public/index.html` via un petit serveur statique.
- Studio : `cd studio && npm run dev` → http://localhost:3333
- Régénérer le contenu de démo : `npm run import` (dans `studio/`)
