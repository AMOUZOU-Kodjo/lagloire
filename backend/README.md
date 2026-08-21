# Backend ETDV

API Node.js + Express + Prisma + Postgres, alignée **exactement** sur le contrat du frontend
(`etdv-frontend/src/api/*.js`) : enveloppe `{ success, data, pagination }`, base
`http://localhost:4000/api`, refresh token en cookie httpOnly, socket.io pour la messagerie.

## Mise en route (local)

```bash
cd backend
cp .env.example .env   # renseignez DATABASE_URL (Postgres local ou Neon)
npm install
npm run setup          # génère le client Prisma, crée les tables, seed les données démo
npm run dev            # API sur http://localhost:4000
```

Le frontend est déjà configuré : `VITE_API_URL` non défini → `http://localhost:4000/api`.

## Hébergement gratuit sur Neon (à vie)

1. Créez un compte sur https://neon.tech → **Create a project** (région proche de vous).
2. **Connect** → copiez la connection string (PostgreSQL).
3. Mettez-la dans `DATABASE_URL` du `.env` de production (ajoutez `?sslmode=require`).
4. Appliquez le schéma : `npx prisma db push` puis `npm run seed`.
5. Déployez ce dossier `backend/` sur un hébergeur Node (Render/Railway/Fly/VPS) —
   **Neon ne sert que la base de données**, pas le serveur Node.
   - Variables d'env : `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (domaine du site).
   - Commandes : `npm install && npx prisma generate` puis `npm start`.
6. Pointez le frontend sur l'API : `VITE_API_URL=https://votre-api.com/api`.

## Comptes de démonstration (seed)

| Rôle    | Email              | Mot de passe | Accès                    |
| ------- | ------------------ | ------------ | ------------------------ |
| ADMIN   | admin@eglise.com   | `123456`     | /admin/connexion (login email+mdp) |
| APOTRE  | apotre@eglise.com  | `123456`     | /admin/connexion         |
| PASTEUR | pasteur@eglise.com | `123456`     | /admin/connexion         |
| FIDÈLE  | membre@eglise.com  | OTP (voir logs) | /connexion (OTP par email) |

## Connexion des membres (OTP)

- `POST /api/auth/otp/send { email }` — génère un code à 6 chiffres (10 min).
  En développement le code est affiché dans **les logs du serveur** ; en production,
  renseignez `SMTP_*` pour l'envoi réel par email.
- `POST /api/auth/otp/verify { email, code, firstName?, lastName?, phone? }` —
  si le compte n'existe pas et que le prénom manque, l'API répond un message contenant
  « prénom » → le frontend affiche alors l'étape profil. Un deuxième appel crée le compte
  (rôle VISITEUR) et connecte l'utilisateur.

## Structure

```
backend/
  prisma/schema.prisma   # schéma Postgres (tables + enums)
  prisma/seed.js         # données de démonstration
  src/index.js           # serveur Express + socket.io
  src/lib/               # prisma client, helpers (enveloppe/erreurs)
  src/middleware/auth.js # JWT access + rôles
  src/services/otp.js    # génération/envoi du code OTP
  src/routes/*.routes.js # une route par ressource du frontend
```

## Notes

- Les uploads (médias, avatars) sont stockés sur le disque local (`backend/uploads`).
  Sur un hébergement gratuit sans disque persistant, utilisez un stockage externe
  (Cloudinary/S3) — à brancher dans `src/routes/media.routes.js` et `users.routes.js`.
- Enveloppe des réponses : `{ success: true, data, pagination? }` ; erreurs :
  `{ success: false, message }` (lues par `err.response.data.message` côté frontend).