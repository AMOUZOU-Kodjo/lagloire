# Déploiement — Backend Render.com + Frontend Cloudflare Pages

## 1. Pousser le code sur GitHub

```bash
git init
git add .
git commit -m "Prêt pour le déploiement"
# Crée le dépôt sur github.com puis :
git remote add origin https://github.com/<ton-compte>/etdv.git
git push -u origin main
```

⚠️ Vérifie que `backend/.env` est bien dans `.gitignore` (secrets jamais sur GitHub).

## 2. Backend — Render.com

1. [render.com](https://render.com) → **New** → **Blueprint** → connecte ton dépôt GitHub
   (Render lit automatiquement le fichier `render.yaml` à la racine)
2. Remplis les variables marquées « sync: false » quand Render te le demande :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL Neon **pooled** (`-pooler`) — la même qu'en local |
| `DIRECT_URL` | URL Neon **directe** (sans `-pooler`) |
| `FRONTEND_URL` | `https://<ton-site>.pages.dev` |
| `FRONTEND_URLS` | `http://localhost:5173` (pour garder le dev local) |
| `MAIL_FROM` | `ETDV <phipsipy@gmail.com>` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | ta config Gmail (mot de passe d'application) |
| `CONTACT_NOTIFY_EMAIL` | `phipsipy@gmail.com` |
| `BREVO_API_KEY` | clé API Brevo (recommandé — voir section 5) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | voir section 5 (stockage des fichiers) |

3. Déploie → l'API sera sur `https://etdv-api.onrender.com/api`
4. Test : ouvre `https://etdv-api.onrender.com/api/health`

## 3. Frontend — Cloudflare Pages

1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project** → connecte GitHub
2. Configuration :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - Variables d'environnement (Production) :

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | `https://etdv-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://etdv-api.onrender.com` |

3. Déploie → le site sera sur `https://<ton-site>.pages.dev`
   (le fichier `public/_redirects` gère déjà le routing SPA)

## 4. Anti-veille backend + Neon — cron-job.org

1. [cron-job.org](https://cron-job.org) (gratuit) → **Create cronjob**
2. URL : `https://etdv-api.onrender.com/api/health`
3. Exécution : **toutes les 10 minutes**, 24h/24

Effet : le backend Render ne s'endort plus → il garde Neon éveillé →
les prières partent bien à 05h00 et le chat du direct reste fonctionnel.

## 5. Emails — Brevo (gratuit, 300/jour) + stockage des fichiers — Cloudinary

### Emails via Brevo (recommandé en production)

1. Crée un compte gratuit sur [brevo.com](https://www.brevo.com)
2. **Senders & IP → Senders → Add sender** : vérifie `phipsipy@gmail.com` (code reçu par email)
3. **SMTP & API → API Keys → Generate new key** (préfixe `xkeysib-`)
4. Sur Render : variable `BREVO_API_KEY` = la clé → Save

L'ordre de priorité des canaux : Brevo → Resend → SMTP. Sans aucun canal,
les codes OTP sont loggés dans la console du serveur (dev uniquement).

### Stockage Cloudinary

Les photos/vidéos/audios uploadés (galerie, églises…) sont envoyés vers **Cloudinary**
au lieu du disque éphémère de Render — ils survivent donc aux redéploiements.

1. Crée un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → **Programmable Media** → copie `Cloud name`, `API key`, `API secret`
3. Renseigne-les dans les variables Render : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Sans ces variables (dev local), les fichiers restent stockés sur le disque dans
`backend/uploads` — rien ne casse.

## 6. Après le premier déploiement

- Sur Render, onglet **Shell** : `npx prisma db push` si le schéma a changé
- Les anciens fichiers locaux (`/uploads/...`) ne sont pas migrés automatiquement :
  ré-uploade-les depuis l'admin si besoin.
- Mets à jour les URLs dans le tableau de bord Resend/Gmail si nécessaire.

## 7. Récapitulatif des URLs

| Service | URL |
|---|---|
| Site | `https://<ton-site>.pages.dev` |
| API | `https://etdv-api.onrender.com/api` |
| Santé API | `https://etdv-api.onrender.com/api/health` |
| Base de données | Neon (déjà configuré) |
