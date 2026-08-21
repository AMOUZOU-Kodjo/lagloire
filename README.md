# ETDV — Frontend

Frontend React (Vite) de la plateforme communautaire ETDV (Église La Table Du Verger),
construit à partir de l'API Express/Prisma fournie.

## Stack

React 18 · Vite · Tailwind CSS · React Router v6 · TanStack Query · Zustand · Axios ·
socket.io-client · date-fns · lucide-react.

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner VITE_API_URL et VITE_SOCKET_URL
npm run dev
```

L'application tourne par défaut sur `http://localhost:5173` et attend une API sur
`http://localhost:4000/api` (voir `.env.example`).

> Tant que le backend n'est pas branché, la plupart des pages publiques s'affichent quand
> même grâce à des données de démonstration (`src/lib/mockData.js`) passées en
> `placeholderData` à React Query — elles disparaissent automatiquement dès que l'API répond.

## Comptes de test

- **Fidèle / visiteur** : connexion par code (`/connexion`) — email + code à 6 chiffres envoyé
  par le backend (`/auth/otp/send`, `/auth/otp/verify`).
- **Administrateur / Apôtre / Pasteur** : connexion classique (`/admin/connexion`) avec
  email + mot de passe (`/auth/login`).

## Structure

Voir `ARCHITECTURE.md` (livré précédemment avec les maquettes) pour le détail complet. En résumé :

```
src/
├─ api/            # 1 fichier = 1 domaine backend (auth, users, church, events, ...)
├─ app/            # router, providers (query, auth, socket), garde de route
├─ components/
│  ├─ ui/          # Button, Card, Badge, Input, Modal, Tabs, Avatar, Pagination...
│  └─ layout/      # Navbar, Footer, Sidebar, PublicLayout, AppShellLayout, AdminShellLayout
├─ features/        # 1 dossier = 1 domaine métier (pages + composants + hooks dédiés)
├─ lib/             # constants, formatters, permissions (miroir des règles backend)
├─ store/           # Zustand : authStore, notificationsStore, socketStore
└─ styles/          # tokens et composants CSS ("L'Arc de l'Aube")
```

## Points d'attention

- **Auth** : `accessToken` gardé en mémoire (Zustand), jamais en `localStorage`. Le
  `refreshToken` est un cookie `httpOnly` géré par le backend ; l'intercepteur Axios
  (`src/api/http.js`) rejoue automatiquement la requête après un refresh silencieux sur 401.
- **Temps réel** : `SocketProvider` rejoint la room `user:{id}` à la connexion pour recevoir
  notifications et messages ; la messagerie et le direct rejoignent en plus une room dédiée
  (`room:{roomId}` / `live:{id}`).
- **Assiduité aux prières matinales** : le backend actuel ne trace pas la lecture des prières
  matinales (contrairement aux posts via `PostRead`). En attendant l'ajout d'un modèle
  équivalent côté API, le suivi est fait côté client (`localStorage`) — voir le commentaire
  dans `src/features/prieres-matinales/pages/PrieresMatinalesPage.jsx`.
- **Permissions** : centralisées dans `src/lib/permissions.js`, miroir des fonctions
  `canManageUser` / `canPublish` / `canManage` des controllers backend.

## Prochaines étapes suggérées

1. Brancher un vrai backend et retirer les `placeholderData` de mock.
2. Ajouter la génération de reçus PDF téléchargeables (ex. `@react-pdf/renderer`) pour
   `EvenementDetailPage`.
3. Ajouter un modèle `MorningPrayerRead` côté backend pour fiabiliser l'assiduité
   multi-appareils (actuellement en `localStorage`).
4. Écrire les tests (Vitest + Testing Library) sur les hooks et composants critiques
   (auth, permissions).
