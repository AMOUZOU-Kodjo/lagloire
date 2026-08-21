// Données de démonstration — utilisées en `placeholderData` de React Query.
// Elles ne remplacent jamais une réponse réelle du backend : dès que l'API répond, ces
// données disparaissent automatiquement au profit des vraies données.

export const mockEvents = [
  { id: "1", title: "Baptême par immersion", type: "BAPTEME", date: "2026-07-20", location: "Plage de Lomé", maxCapacity: 60, description: "Ce baptême par immersion rassemble les candidats de nos cinq assemblées ayant suivi le catéchisme des nouveaux croyants." },
  { id: "2", title: "Conférence des jeunes couples", type: "CONFERENCE", date: "2026-08-02", location: "Église Centrale", maxCapacity: null },
  { id: "3", title: "3 jours de jeûne communautaire", type: "JEUNE", date: "2026-08-14", location: "Centrale", maxCapacity: 200 },
  { id: "4", title: "École des diacres — session 4", type: "FORMATION", date: "2026-07-28", location: "Agoè-Nyivé", maxCapacity: 40 },
];

export const mockPosts = [
  { id: "1", title: "Retour sur la campagne d'évangélisation à Agoè", excerpt: "Plus de 240 personnes touchées en trois jours, 38 nouvelles décisions pour Christ...", publishedAt: "2026-07-02", author: { firstName: "Comlan", lastName: "Adjahouinou" }, category: { name: "Vie d'église" } },
  { id: "2", title: "Nouvelle session de l'école des diacres", excerpt: "Les inscriptions ouvrent ce lundi pour les responsables de cellule...", publishedAt: "2026-06-28", author: { firstName: "Kwami", lastName: "Sedjro" }, category: { name: "Formation" } },
];

export const mockChurches = [
  { id: "1", name: "Église Centrale de Bè-Kpota", city: "Lomé", _count: { members: 812 } },
  { id: "2", name: "Église ETDV Agoè-Nyivé", city: "Lomé", _count: { members: 340 } },
  { id: "3", name: "Église ETDV Kara", city: "Kara", _count: { members: 198 } },
];

export const mockDailyVerse = {
  title: "Marcher par la foi, pas à pas",
  content: "Ce matin, retenons que la foi ne demande pas de voir tout le chemin, mais de faire le prochain pas.",
  bibleVerse: "Jérémie 29:11",
  author: { firstName: "Ayao", lastName: "Mensah", role: "PASTEUR" },
};

export const mockLive = {
  id: "1",
  title: "Culte de restauration — Église Centrale, Bè-Kpota",
  status: "EN_DIRECT",
  startedAt: new Date().toISOString(),
  author: { firstName: "Ayao", lastName: "Mensah" },
};
