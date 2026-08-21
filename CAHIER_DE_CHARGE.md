# Cahier de charge — Frontend ETDV

> Document de référence pour parfaire le frontend React avant le branchement du backend.
> Il sert de guide de développement et de grille de validation. Il est évolutif :
> chaque décision structurante prise en cours de route doit y être reportée.

---

## 1. Contexte & objectifs

Plateforme communautaire de **l'Église La Table Du Verger (ETDV)** : vitrine publique,
espace membre, back-office (admin / apôtre / pasteur), temps réel (messagerie, live).

**Objectifs du présent document**

1. Verrouiller une **architecture stable et maintenable** (frontend prêt à vivre 2+ ans).
2. **Éliminer la duplication** au profit de fichiers réutilisables (composants, hooks, schémas).
3. Formaliser les **conventions** pour que chaque futur fichier soit écrit de la même façon.
4. Servir de **liste de contrôle** avant et pendant le branchement du backend.

---

## 2. État actuel (bilan du code)

### 2.1 Ce qui est en place et qu'on garde

| Sujet | Verdict |
|---|---|
| Structure `api/` (1 fichier = 1 domaine) | ✅ Conserver |
| Structure `features/` (1 dossier = 1 domaine métier) | ✅ Conserver |
| `components/ui` + `components/layout` | ✅ Conserver |
| Auth en mémoire (Zustand) + refresh silencieux Axios (`api/http.js`) | ✅ Conserver |
| Socket rooms (`user:{id}`, `room:{roomId}`, `live:{id}`) | ✅ Conserver |
| Design system "L'Arc de l'Aube" (`styles/index.css`, tokens Tailwind) | ✅ Conserver |
| Permissions miroir backend (`lib/permissions.js`) | ✅ Conserver |
| `lib/constants.js` (miroir des enums Prisma) | ✅ Conserver |
| Date-fns (locale fr) + `lib/formatters.js` | ✅ Conserver |
| React Query + Zustand + Axios + socket.io-client | ✅ Conserver |

### 2.2 Problèmes constatés (à corriger)

| # | Problème | Impact / Statut |
|---|---|---|
| 1 | **Pas de lazy loading** — toutes les pages importées statiquement dans `router.jsx` | ✅ Corrigé (Phase 3) — bundle 552 → 358 kB, chunk par page |
| 2 | **Tables admin dupliquées** (table + `<thead>` + `<tr>` réécrits dans chaque page `Admin*`) | ✅ Corrigé (Phase 1) — via `DataTable` |
| 3 | **Formulaires ad hoc** en `useState` + `setForm((f) => …)` alors que RHF + Zod sont déjà installés | ✅ Corrigé (Phase 2) — RHF + Zod + `FormField` |
| 4 | **Icônes emojis** dans les menus (`📅`, `👥`…) alors que lucide-react est installé | ✅ Corrigé (Phase 1) — lucide-react |
| 5 | **Enums bruts affichés à l'écran** (`e.status`, `e.type`, `r.role` sans libellé) | ✅ Corrigé (Phase 1) — `labels.js` + `StatusBadge` |
| 6 | **Pas de système de retour utilisateur** (toast / feedback) pour mutations | ✅ Corrigé (Phases 1–2) — `Toaster` + `useMutationFeedback` |
| 7 | **Aucune gestion d'erreur globale** (ErrorBoundary, page d'erreur 500) | ✅ Corrigé (Phase 1) — `ErrorBoundary` dans `App.jsx` |
| 8 | **Skeletons uniquement pour les cards** — pas de pattern générique | ✅ Corrigé (Phase 1) — `Skeleton`/`CardSkeleton`/`DataTable loading` |
| 9 | **Dossier `features/auth/hooks` vide** — aucune convention de hooks établie | ✅ Amorcé (Phase 4) — `useOtpLogin`, `useAdminLogin` ; convention applicable aux autres domaines |
| 10 | **Pas de schémas Zod partagés** — les contrats API ne sont validés nulle part | ✅ Amorcé (Phase 2) — schémas des formulaires ; contrat API en Phase 4 |
| 11 | **Pas de tests** (ni Vitest ni Testing Library) | ⏳ Phase 5 |
| 12 | **`placeholderData` de mock** dans les pages publiques | ⏳ Phase 4 (item 11) |

---

## 3. Architecture cible

### 3.1 Arborescence cible

```
src/
├─ api/                      # 1 fichier = 1 domaine backend (inchangé)
│  └─ http.js                # instance axios + intercepteurs (inchangé)
├─ app/
│  ├─ router.jsx             # routes avec <lazy> + <Suspense>
│  ├─ ProtectedRoute.jsx
│  └─ providers/
│     ├─ QueryProvider.jsx
│     ├─ AuthProvider.jsx
│     └─ SocketProvider.jsx
├─ components/
│  ├─ ui/                    # design system (barrel index.js)
│  ├─ layout/                # Navbar, Footer, Sidebar, 3 shells
│  └─ feedback/              # NEW — Toast, ErrorBoundary, PageLoader
├─ features/
│  ├─ <domaine>/
│  │  ├─ pages/              # composants "route" uniquement
│  │  ├─ components/         # composants du domaine
│  │  └─ hooks/              # hooks du domaine (convention)
│  │  └─ schemas/            # NEW — schémas Zod du domaine (convention)
│  └─ ...
├─ hooks/                    # NEW — hooks transverses (usePagination, useToast…)
├─ lib/                      # constants, formatters, permissions, queryKeys
├─ store/                    # Zustand (inchangé)
└─ styles/
   └─ index.css              # design system (inchangé)
```

### 3.2 Règles de couches (interdépendances autorisées)

```
pages → components · hooks · api · lib · store
components → lib · ui
hooks → api · store · lib
api → http · lib
lib → rien (sauf constants)
store → lib
```

- **Jamais** d'import d'une page A vers une page B (créer un composant partagé à la place).
- **Jamais** d'import de `features/` vers `features/` : tout partage passe par `components/` ou `hooks/`.
- La logique métier vit dans les **hooks**, jamais dans les composants.

---

## 4. Standards & conventions de code

### 4.1 Nommage
- Fichiers : `PascalCase.jsx` (composants), `kebab-case.js` (modules, hooks, schemas).
- Exports : un **composant par fichier** en `export default` ; les utilitaires du même domaine
  peuvent être des exports nommés (ex. `Badge.jsx` → `Badge` + `RoleBadge`).
- Variables d'état : `isLoading`, `isPending`, `error` (pas de préfixe `is` pour les données).
- Constantes de domaine : MAJUSCULES (cf. `lib/constants.js`).

### 4.2 Import ordering (respecter partout)
1. React / libs externes
2. Composants internes (`../..`)
3. Hooks internes
4. API
5. Lib (constants, formatters, permissions, schemas)
6. Styles

### 4.3 Interdits
- ❌ Dupliquer un composant UI — toujours réutiliser `components/ui`.
- ❌ Écrire un `<tr>`/table admin en dur — utiliser `DataTable` (voir §5).
- ❌ Formulaires en `useState` manuel — utiliser RHF + Zod (voir §9).
- ❌ Afficher un enum brut (`{e.status}`) — toujours passer par un libellé/`Badge`.
- ❌ Écrire un `fetch`/axios brut hors de `api/`.
- ❌ Nouveau mock de données — utiliser `placeholderData` existant ou rien.
- ❌ Ajouter une dépendance sans la justifier dans ce cahier des charges.

---

## 5. Design system — composants réutilisables

### 5.1 Existants à conserver
`Button` (`as` prop), `Card`, `Badge`/`RoleBadge`, `Avatar`, `Input`/`Textarea`/`Select`,
`Tabs`, `Modal`, `EmptyState`/`Skeleton`/`CardSkeleton`, `Pagination`, `DawnArcHeader`/`ArcBadge`.

### 5.2 À créer (élimine la duplication détectée)

| Composant | Emplacement | Élimine |
|---|---|---|
| `DataTable` | `components/ui/DataTable.jsx` | Les tables dupliquées des pages `Admin*` |
| `PageHeader` | `components/ui/PageHeader.jsx` | Les en-têtes de page répétés (`flex justify-between mb-6`) |
| `StatusBadge` | `components/ui/Badge.jsx` (ou dédié) | L'affichage ad hoc des statuts (EN_ATTENTE, VALIDE…) |
| `Toast` + `Toaster` + `useToast` | `components/feedback/` | L'absence de feedback utilisateur |
| `ErrorBoundary` + `ErrorPage` | `components/feedback/` | Les crashes silencieux |
| `PageLoader` | `components/feedback/` | Le loader de l'AuthProvider réutilisé ailleurs |
| `FormField` (wrapper RHF) | `components/ui/FormField.jsx` | Les `Input` manuels dans les formulaires |
| `SearchInput` | `components/ui/` | La recherche ad hoc (annuaire, admin) |

### 5.3 Spécifications `DataTable`
```jsx
<DataTable
  columns={[{ key, label, render?, className? }]}
  rows={data}
  empty={<EmptyState … />}
  loading={isLoading}
  onRowClick?
/>
```
- Gère lui-même : en-tête, lignes vides, état chargement (skeleton), clé React.
- Le rendu de cellule passe par `render(row)`, ce qui permet d'injecter `Badge`, `formatDate`, actions.
- **Pagination optionnelle** : accepte `pagination` + `onPageChange` (délégation à `Pagination`).

### 5.4 Spécifications `StatusBadge` / libellés
Créer `lib/labels.js` : `{ EVENT: {PLANIFIE:'Planifié', EN_COURS:'En cours', …}, DONATION: …, REGISTRATION: …, LIVE: …, NOTIFICATION: … }`
+ table de tonalité par statut → `StatusBadge status={e.status} kind="EVENT"`.
**Objectif : aucun enum brut à l'écran.**

### 5.5 Navigation & icônes
- Remplacer les **emojis** des `Sidebar`/menus par des icônes **lucide-react** (déjà installé).
- `NavLink` doit porter `end` pour les routes index (déjà le cas pour `/app`).

---

## 6. Hooks transverses (`src/hooks/`)

| Hook | Responsabilité |
|---|---|
| `usePagination` | Encapsule page/pageSize, reset au changement de filtre |
| `useToast` | `toast.success/error/info` + intégration Query (voir §7) |
| `useApiQuery` | Wrapper TS-exempt autour de `useQuery` : `queryKey` centralisé, retry, refetchOnWindowFocus |
| `useMutationFeedback` | `useMutation` + toast success/error automatique + invalidation |
| `useDebounce` | Recherche avec délai (annuaire, admin) |

### 6.1 Hooks de domaine (`features/<domaine>/hooks/`)
Convention : chaque interaction métier non triviale vit dans un hook.
- Exemple cible : `features/evenements/hooks/useEventForm.js` (voir §9),
  `features/auth/hooks/useOtpLogin.js` (extraire la logique des 2 pages de connexion).
- Le dossier `features/auth/hooks/` existe déjà mais est vide : premier dossier à remplir.

---

## 7. Data fetching & état global

### 7.1 Clés de requête centralisées
Créer `lib/queryKeys.js` :
```js
export const queryKeys = {
  events: { all: ["events"], list: (params) => ["events", "list", params], detail: (id) => ["events", "detail", id] },
  users: { all: ["users"], list: (params) => ["users", "list", params] },
  // … pour chaque domaine
};
```
Règle : **aucune chaîne de queryKey en dur dans les composants.**

### 7.2 Convention mutations
- `mutationFn` reçoit les variables ; le composant n'appelle pas `api` directement.
- `onSuccess` → invalide la clé parent (`queryKeys.events.all`), toast succès, fermeture modal, reset form.
- `onError` → toast erreur avec message backend si dispo (`err.response?.data?.message`).
- Centraliser ce schéma dans `useMutationFeedback`.

### 7.3 Retrait des mocks
- Au branchement du backend : supprimer **tous** les `placeholderData` de `mockData.js`.
- Garder `mockData.js` uniquement pour Storybook/dev si besoin, sinon le supprimer.
- Pendant la transition, encapsuler le mock dans un seul endroit :
  `lib/mock.ts`/`mock.js` exportant des **fabricateurs** (`makeMockEvent()`) pour éviter le code mort disséminé.

---

## 8. Routage & lazy loading (obligatoire)

Objectif : un **chunk par page**, chargé à la demande + préchargé au survol.

### 8.1 Configuration cible (`app/router.jsx`)
```jsx
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const HomePage = lazy(() => import("../features/home/pages/HomePage"));
const ProgrammePage = lazy(() => import("../features/programme/pages/ProgrammePage"));
// … toutes les pages, y compris admin

function PageFallback() {
  return <div className="min-h-screen flex items-center justify-center"><ArcBadge /></div>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Suspense fallback={<PageFallback />}><HomePage /></Suspense> },
      …
    ],
  },
  …
]);
```
- Ne pas lazy-loader les **layouts** ni les composants déjà légers (Button, Badge…).
- Le fallback de Suspense est **unique et réutilisé** (`PageFallback`), jamais réécrit.
- Optionnel mais recommandé : `lazy()` + `preload` via un hook `usePrefetchOnHover` sur les liens de nav.

### 8.2 Consignes
- **Interdiction d'importer statiquement une page de route** hors du router.
- Vérifier le découpage avec `npm run build` (observer les `dist/assets/*.js` générés).

---

## 9. Formulaires — RHF + Zod (règle stricte)

RHF (^7) et Zod (^4) sont **déjà installés** → les utiliser partout, plus jamais de `useState` manuel.

### 9.1 Schémas par domaine (`features/<domaine>/schemas/`)
```js
// features/evenements/schemas/eventSchema.js
import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  date: z.string().min(1, "Date requise"),
  type: z.enum(EVENT_TYPES),
  location: z.string().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>; // quand TS sera adopté
```

### 9.2 Hook de formulaire réutilisable
```js
// features/evenements/hooks/useEventForm.js
export function useEventForm({ defaultValues, onSubmit }) {
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });
  const mutation = useMutationFeedback({ mutationFn: onSubmit, onSuccess: reset });
  return { register, handleSubmit: handleSubmit((v) => mutation.mutate(v)), reset, formState, isPending: mutation.isPending };
}
```

### 9.3 UI
- `FormField` (wrapper) : props `label`, `name`, `register` ; affiche `formState.errors[name]?.message`.
- Chaque champ : `aria-invalid` + message d'erreur associé (`aria-describedby`).
- Bouton submit : `disabled={isSubmitting}` + texte de chargement.

---

## 10. Temps réel (socket)

- Conserver `SocketProvider` et les stores actuels (fonctionnent bien).
- **Convention** : les émissions d'événements ne se font jamais dans les composants — les
  encapsuler dans des hooks domaine (`features/messagerie/hooks/useRoomSocket.js`,
  `features/direct/hooks/useLiveChat.js`).
- Conserver la déduplication de refresh (déjà en place dans `http.js`).

---

## 11. Gestion des erreurs & retour utilisateur

### 11.1 Retours utilisateur
- **Toutes** les mutations → toast (succès/erreur).
- Les erreurs API exposent `message` → afficher ce message (préféré) ou un fallback FR.
- État chargement : `PageLoader` (navigation) + `Skeleton`/`CardSkeleton` (contenu) + `DataTable loading`.

### 11.2 Erreurs fatales
- `ErrorBoundary` racine dans `App.jsx` (au-dessus du router) avec page de secours et bouton "Recharger".
- Ne jamais laisser un rendu de liste faire planter toute l'app : garder `?? []` et `EmptyState`.

### 11.3 Conventions
- `isLoading` vs `isPending` : `isLoading` = première charge sans données, `isPending` = re-fetch / mutation.
- Afficher `EmptyState` **après** le chargement, jamais pendant.

---

## 12. UX & accessibilité

- Icônes lucide : `aria-hidden` + label visible quand l'icône n'est pas décorative.
- Boutons : `type="submit"` explicite dans les formulaires, jamais implicite.
- Navigation clavier : `Modal` → focus trap, Escape pour fermer, restauration du focus.
- Contraste : vérifier les textes `text-soft-dark` sur fond sombre et `text-soft` sur fond clair.
- Mobile : les `Shell` layouts (Sidebar fixe) doivent prévoir un menu hamburger (à ajouter — non couvert aujourd'hui).
- Langue : tout le texte UI en FR, dates relatives en FR (`formatters.js` déjà OK).

---

## 13. Feuille de route (phases)

### Phase 1 — Fondations (avant backend) ✅
1. ✅ Créer `components/feedback/` (Toast, ErrorBoundary, PageLoader) + `useToast`.
2. ✅ Créer `lib/queryKeys.js` + `lib/labels.js` + `hooks/` transverses.
3. ✅ Créer `DataTable`, `PageHeader`, `FormField`, `StatusBadge`.
4. ✅ Refactorer les pages `Admin*` sur `DataTable` + `PageHeader` (suppression des tables dupliquées).
5. ✅ Migrer la navigation emoji → lucide-react (Sidebar, AppShellLayout, AdminShellLayout).

### Phase 2 — Qualité formulaire & erreurs ✅
6. ✅ Migrer les formulaires existants (admin, profil, don, contact) vers RHF + Zod + `FormField`.
   - Modals Admin : événement, programme, église, diffusion — RHF + schéma Zod + validation par champ.
   - Pages publiques : Contact, Don, Profil (2 formulaires) — mêmes conventions.
   - Les pages d'auth (connexion/OTP) et le footer restent en `useState` (UX multi-étapes, hors périmètre).
7. ✅ Ajouter les toasts sur toutes les mutations (`useMutationFeedback`) :
   - Admin (déjà fait), Profil, Don, Contact, inscription événement, cloche notifications.
   - Exceptions volontaires (pas de toast) : envoi de message en direct (`ChatWindow`, temps réel),
     marquage lu d'une actualité (`ActualiteDetailPage`, action silencieuse de fond).
8. ✅ Brancher l'`ErrorBoundary` racine (fait en Phase 1, dans `src/App.jsx`).

### Phase 3 — Performance ✅
9. ✅ Lazy loading complet du router (chunk par page) + `PageLoader` unique comme fallback de `Suspense`.
   - Layouts, `ProtectedRoute` et `NotFoundPage` restent statiques (conformément au cahier).
10. ✅ Vérifier le build (`npm run build`) et la taille des chunks.
    - `dist/` : 1 chunk par page (≈1–7 kB) ; bundle principal **552 kB → 358 kB** (gzip 112 kB).
    - Le warning chunk >500 kB a **disparu**. Chunks partagés : `schemas` (Zod), `ui`, `useQuery` (React Query).

### Phase 4 — Préparation backend
11. Retirer tous les `placeholderData`/mocks (garder les fabricateurs de dev si utile) — ⏳ **au branchement du backend**.
12. Valider les schémas Zod contre la réponse réelle de l'API (contrats) — ⏳ **dépend du backend**.
13. ✅ Remplir `features/auth/hooks/` : `useOtpLogin` (flux 2 étapes + premier accès) et
    `useAdminLogin` (email + mot de passe), utilisés par `ConnexionPage` et `AdminConnexionPage`.

### Phase 5 — Fiabilisation
14. Ajouter Vitest + Testing Library + MSW : tests prioritaires sur auth, permissions,
    formatters, hooks de données (cf. README §"Prochaines étapes").
15. (Optionnel) Migration TypeScript progressive, feature par feature.

---

## 14. Checklist de validation finale

- [ ] Aucun import statique de page de route hors du router.
- [ ] Aucune table/tableau dupliqué (tout passe par `DataTable`).
- [ ] Aucun formulaire en `useState` manuel (tout passe par RHF + Zod).
- [ ] Aucun enum brut affiché (tout passe par `labels.js` + `StatusBadge`).
- [ ] Aucun emoji dans la navigation (tout passe par lucide-react).
- [ ] Toutes les mutations affichent un retour (toast).
- [ ] `ErrorBoundary` racine en place.
- [ ] Les clés de requête passent par `lib/queryKeys.js`.
- [ ] `npm run build` passe et produit un chunk par page.
- [ ] `npm run lint` (oxlint) passe sans warning.
- [ ] Les tests critiques (auth, permissions, formatters) sont verts.
- [ ] Aucun `placeholderData` de mock dans les pages branchées.

---

## 15. Garde-fous / interdits (rappel)

- Ne pas réécrire un composant qui existe déjà dans `components/ui`.
- Ne pas créer de dépendance sans l'enregistrer ici.
- Ne pas contourner `api/http.js` (intercepteurs refresh obligatoires).
- Ne pas exposer de secret : les clés ne vont que dans `.env` (jamais commité) — `.env.example` documenté.
- Toute nouvelle décision structurante est reportée dans ce document avant implémentation.

---

## 16. Décisions structurantes (journal)

### 16.1 daisyUI épinglé à `5.7.4` (tailwindcss 3.4.x) — ⚠️ NE PAS MONTER
- `daisyui@5.7.5` est une publication cassée (importe `./functions/nestCssLayers.js` inexistant).
- `daisyui@5.7.6+` régresse avec Tailwind 3.4 : CSS invalide (`.carousel: [object Object];`,
  faux sur `.input:focus`, `.modal`, `.skeleton`…) qui fait échouer le minify lightningcss.
- `daisyui@5.7.4` est le dernier compatible Tailwind 3 → épinglé dans `package.json`.
- En cas de migration Tailwind 4 un jour, revoir ce pin et les layers CSS (cf. 16.2).

### 16.2 Thème `etdv` appliqué via variables CSS (pas via `config.daisyui.themes`)
- Tailwind 3 ne transmet **jamais** `config.daisyui.themes` à daisyUI 5 (le plugin est appelé
  sans arguments) → le thème custom n'était pas appliqué (boutons violets, radius 4px par défaut).
- Solution : bloc `:root:not([data-theme])` dans `src/styles/index.css` (hors layer, en fin de
  cascade) qui pose les variables daisyUI (`--color-*`, `--radius-selector/field/box`,
  `--size-selector/field`, `--border`, `--depth: 0`, `--noise: 0`, `color-scheme: light`).
- Le sélecteur `:not([data-theme])` bat aussi le thème sombre `prefers-color-scheme` par défaut.
- `tailwind.config.js` conserve le mapping `daisyTheme` comme **documentation** des tokens (non lu).
- ⚠️ Toutes les surcharges maison (`.btn-gold`, `.card`, `.badge-*`…) restent **hors `@layer`** :
  daisyUI 5 vit dans des layers imbriqués, un re-layer casserait l'ordre de cascade.

### 16.3 `usePagination` — signature verrouillée
- `usePagination(initialPage = 1, resetDeps = [])` → `{ page, setPage, reset }`.
- Reset automatique quand `resetDeps` change (implémenté via `[initialPage, ...resetDeps]` pour
  satisfaire le linter oxlint `react-hooks/exhaustive-deps` — pas d'array variable dans les deps).

### 16.4 Pagination admin pilotée par le composant
- `DataTable` délègue la pagination à `Pagination` (props `pagination` + `onPageChange`).
- `Pagination` accepte désormais `className` pour les marges extérieures.

### 16.5 Schémas Zod — emplacement selon le consommateur
- Règle du cahier : **pas d'import `features/` → `features/`**.
- Les schémas des formulaires publics vivent dans leur domaine
  (`features/contact/schemas/`, `features/don/schemas/`, `features/profil/schemas/`).
- Les schémas des formulaires de création back-office vivent dans `features/admin/schemas/`
  (seuls consommateurs : les modals Admin).
- Conventions d'écriture : `zod@4` → `z.email()`, enums via `z.enum(CONSTANTES)`,
  champs optionnels qui acceptent `""` via `z.union([z.literal(""), z.coerce.number()…])`,
  validation conditionnelle via `.superRefine`.

### 16.6 Formulaires — patron retenu (Phase 2)
- `useForm({ resolver: zodResolver(schema), defaultValues })` dans la page,
  champs rendus via `FormField` (wrapper label + erreur).
- Modals : `reset()` quand le modal s'ouvre (`useEffect` sur `modalOpen`).
- Boutons de toggle (type de don, destinataire contact…) : `type="button"` + `setValue`.
- Submit : `handleSubmit((values) => mutation.mutate(values))`, bouton `type="submit"`.

### 16.7 Lazy loading & linter
- Toutes les pages de route sont en `lazy(() => import(...))` dans `src/app/router.jsx`,
  enveloppées dans un `Suspense` dont le fallback unique est `PageLoader` (`components/feedback`).
- Le fichier `router.jsx` exporte `router` + des const `lazy` : la règle
  `react/only-export-components` y est **désactivée via `overrides`** dans `.oxlintrc.json`
  (patron standard Fast Refresh pour les fichiers de routes).

### 16.8 Logo & palette « site de référence » (header/footer/home)
- Logo `public/etdv_logo.jpg` (copie redimensionnée 512px du `logo.jpg` du site de référence,
  `C:\Users\Marcellin\Documents\eglise-etdv\frontend\src\assets\logo.jpg` — cercle bleu marine,
  croix et anneau dorés) intégré en rond dans :
  - la navbar publique (`components/layout/Navbar.jsx`),
  - le footer (`components/layout/Footer.jsx`),
  - le hero de la page d'accueil (`features/home/pages/HomePage.jsx`).
- Palette appliquée **uniquement** à ces trois zones à l'origine, puis généralisée à **tout le site**
  (décision 16.10). Fonds clairs (blanc / `#f2f2f2` / `#e5e6e6`), texte sombre `#1f2937`,
  accent teal `#37cdbe`, bleu `#4a90e2`.
- Le **hero de la page d'accueil** (`features/home/pages/HomePage.jsx`) reprend celui du site
  de référence : fond étoilé + halos animés (keyframes `hero-*` dans `src/styles/index.css`),
  badge « Temple du Dieu Vivant », titre + verset (Matthieu 11:28), CTAs « Contactez-nous » /
  « En savoir plus », icônes sociales (SVG inline `simple-icons` — lucide-react ne fournit plus
  les icônes de marques), logo rotatif avec anneaux + badge flottant « Depuis 2000 »,
  indicateur de scroll. La carte « Programme du jour »/verset dynamique a été retirée.

### 16.9 Page « À propos »
- Nouvelle page publique `features/about/pages/AboutPage.jsx`, route `/a-propos` (lazy),
  lien « À propos » ajouté à la navbar publique (après Accueil).
- Mise en page calquée sur `components/About.jsx` du site de référence (même ton clair/teal,
  pas de framer-motion) : en-tête, 3 cartes (Histoire / Mission / Engagement),
  bloc statistiques « Notre Impact » (valeurs dérivées des mocks), bloc « Notre Communauté »
  (valeurs Amour/Communauté/Foi/Espérance + CTAs), bandeau d'appel à l'action teal.

### 16.10 Généralisation de la palette « site de référence » à toutes les pages
- Les tokens de `tailwind.config.js` sont **redéfinis** vers la palette de référence (noms
  conservés, aucune retouche des composants nécessaire) :
  - `ink` #1f2937 / `ink.2` #374151 ; `gold` **#37cdbe** / `gold.dim` #2f9e93 ;
  - `brick` #dc2626 ; `palm` #16a34a ; `sand` #ffffff / `sand.2` #f2f2f2 ;
  - `line` #e5e6e6 / `line.dark` #d1d5db ; `soft` #6b7280 / `soft.dark` #4b5563.
- Le thème daisyUI `:root:not([data-theme])` (index.css) suit le thème light de référence :
  primary/accent = teal #37cdbe, secondary = bleu #4a90e2, info #3abff8, success #36d399,
  warning #fbbd23, error #f87272.
- Composants « Arc de l'Aube » sombres **éclaircis** : `Sidebar` (bg-white), `DawnArcHeader`
  (bg-sand-2), `DirectPage`, `LiveChat`, `ConnexionPage`, `AdminConnexionPage`,
  `DashboardMembrePage` (carte hero), `AuthProvider`, `PrieresMatinalesPage`.
- Variantes CSS maison adaptées au clair : `.card-dark`, `.input-dark`, `.btn-outline-light`,
  `.nav-link`, `.side-link`, `.btn-ghost`, `.btn-gold` (fond teal, texte blanc).
- Dégradés inline migrateurs (avatars, vignettes, event cards, galerie…) : or/carmin/palm
  → teal/bleu/gris (`#E3A73F→#37CDBE`, `#B24A2C→#4A90E2`, `#2F6D5C→#4A90E2`, `#1B2340→#1F2937`).
- Vérifié : build + lint (0/0), CSS de prod contient le teal `#37cdbe` (×34), plus aucune
  ancienne couleur, aucun `[object Object]`.

---

_Fin du cahier de charge. À relire et ajuster au fil du développement — il sera réutilisé comme
grille de référence avant chaque phase de branchement au backend._