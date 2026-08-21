import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import AppShellLayout from "../components/layout/AppShellLayout";
import AdminShellLayout from "../components/layout/AdminShellLayout";
import ScrollToTop from "../components/layout/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";
import AdminPageGuard from "../features/admin/components/AdminPageGuard";
import PageLoader from "../components/feedback/PageLoader";

import NotFoundPage from "../pages/NotFoundPage";
import { STAFF_ROLES } from "../lib/constants";

const HomePage = lazy(() => import("../features/home/pages/HomePage"));
const AboutPage = lazy(() => import("../features/about/pages/AboutPage"));
const ConnexionPage = lazy(() => import("../features/auth/pages/ConnexionPage"));
const AdminConnexionPage = lazy(() => import("../features/auth/pages/AdminConnexionPage"));
const ProgrammePage = lazy(() => import("../features/programme/pages/ProgrammePage"));
const EvenementsPage = lazy(() => import("../features/evenements/pages/EvenementsPage"));
const EvenementDetailPage = lazy(() => import("../features/evenements/pages/EvenementDetailPage"));
const ActualitesPage = lazy(() => import("../features/actualites/pages/ActualitesPage"));
const ActualiteDetailPage = lazy(() => import("../features/actualites/pages/ActualiteDetailPage"));
const GaleriePage = lazy(() => import("../features/galerie/pages/GaleriePage"));
const PrieresMatinalesPage = lazy(() => import("../features/prieres-matinales/pages/PrieresMatinalesPage"));
const DirectPage = lazy(() => import("../features/direct/pages/DirectPage"));
const AnnuairePage = lazy(() => import("../features/eglises/pages/AnnuairePage"));
const ChurchDetailPage = lazy(() => import("../features/eglises/pages/ChurchDetailPage"));
const DonPage = lazy(() => import("../features/don/pages/DonPage"));
const ContactPage = lazy(() => import("../features/contact/pages/ContactPage"));
const MentionsLegalesPage = lazy(() => import("../features/legal/pages/MentionsLegalesPage"));
const ConfidentialitePage = lazy(() => import("../features/legal/pages/ConfidentialitePage"));
const CookiesPage = lazy(() => import("../features/legal/pages/CookiesPage"));

const DashboardMembrePage = lazy(() => import("../features/dashboard/pages/DashboardMembrePage"));
const ProfilPage = lazy(() => import("../features/profil/pages/ProfilPage"));
const MessageriePage = lazy(() => import("../features/messagerie/pages/MessageriePage"));
const MesDonsPage = lazy(() => import("../features/don/pages/MesDonsPage"));

const AdminDashboardPage = lazy(() => import("../features/admin/pages/AdminDashboardPage"));
const AdminActualitesPage = lazy(() => import("../features/admin/pages/AdminActualitesPage"));
const AdminUtilisateursPage = lazy(() => import("../features/admin/pages/AdminUtilisateursPage"));
const AdminMediasPage = lazy(() => import("../features/admin/pages/AdminMediasPage"));
const AdminModerationPage = lazy(() => import("../features/admin/pages/AdminModerationPage"));
const AdminDonsContactsPage = lazy(() => import("../features/admin/pages/AdminDonsContactsPage"));
const AdminEglisesPage = lazy(() => import("../features/admin/pages/AdminEglisesPage"));
const AdminAbonnesPage = lazy(() => import("../features/admin/pages/AdminAbonnesPage"));
const AdminEvenementsPage = lazy(() => import("../features/admin/pages/AdminEvenementsPage"));
const AdminProgrammesPage = lazy(() => import("../features/admin/pages/AdminProgrammesPage"));
const AdminDirectPage = lazy(() => import("../features/admin/pages/AdminDirectPage"));
const AdminPrieresPage = lazy(() => import("../features/admin/pages/AdminPrieresPage"));

const PageFallback = <PageLoader />;

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <PublicLayout />
      </>
    ),
    children: [
      { path: "/", element: <Suspense fallback={PageFallback}><HomePage /></Suspense> },
      { path: "/a-propos", element: <Suspense fallback={PageFallback}><AboutPage /></Suspense> },
      { path: "/programme", element: <Suspense fallback={PageFallback}><ProgrammePage /></Suspense> },
      { path: "/evenements", element: <Suspense fallback={PageFallback}><EvenementsPage /></Suspense> },
      { path: "/evenements/:id", element: <Suspense fallback={PageFallback}><EvenementDetailPage /></Suspense> },
      { path: "/actualites", element: <Suspense fallback={PageFallback}><ActualitesPage /></Suspense> },
      { path: "/actualites/:id", element: <Suspense fallback={PageFallback}><ActualiteDetailPage /></Suspense> },
      { path: "/galerie", element: <Suspense fallback={PageFallback}><GaleriePage /></Suspense> },
      { path: "/prieres-matinales", element: <Suspense fallback={PageFallback}><PrieresMatinalesPage /></Suspense> },
      { path: "/eglises", element: <Suspense fallback={PageFallback}><AnnuairePage /></Suspense> },
      { path: "/eglises/:id", element: <Suspense fallback={PageFallback}><ChurchDetailPage /></Suspense> },
      { path: "/don", element: <Suspense fallback={PageFallback}><DonPage /></Suspense> },
      { path: "/contact", element: <Suspense fallback={PageFallback}><ContactPage /></Suspense> },
      { path: "/mentions-legales", element: <Suspense fallback={PageFallback}><MentionsLegalesPage /></Suspense> },
      { path: "/confidentialite", element: <Suspense fallback={PageFallback}><ConfidentialitePage /></Suspense> },
      { path: "/cookies", element: <Suspense fallback={PageFallback}><CookiesPage /></Suspense> },
    ],
  },
  { path: "/connexion", element: <Suspense fallback={PageFallback}><ConnexionPage /></Suspense> },
  { path: "/admin/connexion", element: <Suspense fallback={PageFallback}><AdminConnexionPage /></Suspense> },
  { path: "/direct", element: <Suspense fallback={PageFallback}><DirectPage /></Suspense> },
  { path: "/direct/:id", element: <Suspense fallback={PageFallback}><DirectPage /></Suspense> },

  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <ScrollToTop />
        <AppShellLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={PageFallback}><DashboardMembrePage /></Suspense> },
      { path: "profil", element: <Suspense fallback={PageFallback}><ProfilPage /></Suspense> },
      { path: "messagerie", element: <Suspense fallback={PageFallback}><MessageriePage /></Suspense> },
      { path: "messagerie/:roomId", element: <Suspense fallback={PageFallback}><MessageriePage /></Suspense> },
      { path: "dons", element: <Suspense fallback={PageFallback}><MesDonsPage /></Suspense> },
    ],
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={STAFF_ROLES}>
        <ScrollToTop />
        <AdminShellLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminPageGuard path="/admin"><Suspense fallback={PageFallback}><AdminDashboardPage /></Suspense></AdminPageGuard> },
      { path: "actualites", element: <AdminPageGuard path="/admin/actualites"><Suspense fallback={PageFallback}><AdminActualitesPage /></Suspense></AdminPageGuard> },
      { path: "utilisateurs", element: <AdminPageGuard path="/admin/utilisateurs"><Suspense fallback={PageFallback}><AdminUtilisateursPage /></Suspense></AdminPageGuard> },
      { path: "messagerie", element: <Suspense fallback={PageFallback}><MessageriePage /></Suspense> },
      { path: "messagerie/:roomId", element: <Suspense fallback={PageFallback}><MessageriePage /></Suspense> },
      { path: "medias", element: <AdminPageGuard path="/admin/medias"><Suspense fallback={PageFallback}><AdminMediasPage /></Suspense></AdminPageGuard> },
      { path: "moderation", element: <AdminPageGuard path="/admin/moderation"><Suspense fallback={PageFallback}><AdminModerationPage /></Suspense></AdminPageGuard> },
      { path: "dons-contacts", element: <AdminPageGuard path="/admin/dons-contacts"><Suspense fallback={PageFallback}><AdminDonsContactsPage /></Suspense></AdminPageGuard> },
      { path: "eglises", element: <AdminPageGuard path="/admin/eglises"><Suspense fallback={PageFallback}><AdminEglisesPage /></Suspense></AdminPageGuard> },
      { path: "abonnes", element: <AdminPageGuard path="/admin/abonnes"><Suspense fallback={PageFallback}><AdminAbonnesPage /></Suspense></AdminPageGuard> },
      { path: "evenements", element: <AdminPageGuard path="/admin/evenements"><Suspense fallback={PageFallback}><AdminEvenementsPage /></Suspense></AdminPageGuard> },
      { path: "programmes", element: <AdminPageGuard path="/admin/programmes"><Suspense fallback={PageFallback}><AdminProgrammesPage /></Suspense></AdminPageGuard> },
      { path: "direct", element: <AdminPageGuard path="/admin/direct"><Suspense fallback={PageFallback}><AdminDirectPage /></Suspense></AdminPageGuard> },
      { path: "prieres", element: <AdminPageGuard path="/admin/prieres"><Suspense fallback={PageFallback}><AdminPrieresPage /></Suspense></AdminPageGuard> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);