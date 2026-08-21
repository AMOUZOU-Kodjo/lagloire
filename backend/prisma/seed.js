// Seed de démonstration — données alignées sur src/lib/mockData.js du frontend.
// Comptes :
//   admin@eglise.com   / 123456   → ADMIN   (login email + mot de passe)
//   apotre@eglise.com  / 123456   → APOTRE
//   pasteur@eglise.com / 123456   → PASTEUR
//   membre@eglise.com             → FIDELES (connexion par code OTP)
// Le code OTP est affiché dans la console du serveur en développement.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (plain) => bcrypt.hashSync(plain, 10);
const daysFromNow = (days, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d;
};

async function main() {
  console.log("[seed] nettoyage de la base…");
  await prisma.$transaction([
    prisma.pageView.deleteMany(),
    prisma.otpCode.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.chatMessage.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.donation.deleteMany(),
    prisma.liveStream.deleteMany(),
    prisma.media.deleteMany(),
    prisma.postRead.deleteMany(),
    prisma.post.deleteMany(),
    prisma.postCategory.deleteMany(),
    prisma.morningPrayer.deleteMany(),
    prisma.program.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.event.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.church.deleteMany(),
  ]);

  console.log("[seed] églises…");
  const [lome, agoe, kara, sokode, atakpame] = await Promise.all([
    prisma.church.create({ data: { name: "Église Centrale de Bè-Kpota", city: "Lomé", country: "Togo", address: "Quartier Bè, rue des Armées", phone: "+228 22 21 45 67", description: "Siège de l'église ETDV." } }),
    prisma.church.create({ data: { name: "Église ETDV Agoè-Nyivé", city: "Lomé", country: "Togo", address: "Agoè-Nyivé, PK 10", phone: "+228 90 12 34 56" } }),
    prisma.church.create({ data: { name: "Église ETDV Kara", city: "Kara", country: "Togo", address: "Centre-ville, avenue de la Paix" } }),
    prisma.church.create({ data: { name: "Église ETDV Sokodé", city: "Sokodé", country: "Togo" } }),
    prisma.church.create({ data: { name: "Église ETDV Atakpamé", city: "Atakpamé", country: "Togo" } }),
  ]);

  console.log("[seed] utilisateurs…");
  const admin = await prisma.user.create({
    data: {
      email: "admin@eglise.com", password: hash("123456"), firstName: "Comlan", lastName: "Adjahouinou",
      role: "ADMIN", ministry: "PASTEUR_TITULAIRE", churchId: lome.id,
      profile: { create: { city: "Lomé", bio: "Pasteur principal de l'église ETDV.", gender: "HOMME", maritalStatus: "MARIE" } },
    },
  });
  const apotre = await prisma.user.create({
    data: {
      email: "apotre@eglise.com", password: hash("123456"), firstName: "Ayao", lastName: "Mensah",
      role: "APOTRE", ministry: "APOTRE", churchId: lome.id,
      profile: { create: { city: "Lomé", bio: "Apotre de l'œuvre, supervise les cinq assemblées.", gender: "HOMME", maritalStatus: "MARIE" } },
    },
  });
  const pasteur = await prisma.user.create({
    data: {
      email: "pasteur@eglise.com", password: hash("123456"), firstName: "Kwami", lastName: "Sedjro",
      role: "PASTEUR", ministry: "PASTEUR_ADJOINT", churchId: lome.id,
      profile: { create: { city: "Lomé", bio: "Pasteur adjoint, responsable de la jeunesse.", gender: "HOMME", maritalStatus: "MARIE" } },
    },
  });
  const membre = await prisma.user.create({
    data: {
      email: "membre@eglise.com", firstName: "Emefa", lastName: "Kodjo",
      role: "FIDELES", ministry: "RESPONSABLE_ADORATION", churchId: lome.id,
      profile: { create: { city: "Lomé", bio: "Membre du groupe d'adoration.", gender: "FEMME", maritalStatus: "CELIBATAIRE" } },
    },
  });
  await prisma.user.create({
    data: {
      email: "visiteur@example.com", firstName: "Bénoît", lastName: "Dossou",
      role: "VISITEUR", churchId: agoe.id,
      profile: { create: { city: "Lomé", gender: "HOMME" } },
    },
  });
  const fideles = await Promise.all([
    prisma.user.create({ data: { email: "afi@gmail.com", firstName: "Afi", lastName: "Sewonou", role: "FIDELES", churchId: lome.id, profile: { create: { city: "Lomé", gender: "FEMME", maritalStatus: "MARIE" } } } }),
    prisma.user.create({ data: { email: "koffi@gmail.com", firstName: "Koffi", lastName: "Agbeko", role: "FIDELES", churchId: agoe.id, profile: { create: { city: "Lomé", gender: "HOMME", maritalStatus: "CELIBATAIRE" } } } }),
    prisma.user.create({ data: { email: "adjoa@gmail.com", firstName: "Adjoa", lastName: "Tossou", role: "FIDELES", churchId: kara.id, profile: { create: { city: "Kara", gender: "FEMME", maritalStatus: "MARIE" } } } }),
    prisma.user.create({ data: { email: "sena@gmail.com", firstName: "Sena", lastName: "Amouzou", role: "FIDELES", churchId: sokode.id, profile: { create: { city: "Sokodé", gender: "HOMME" } } } }),
    prisma.user.create({ data: { email: "mawo@gmail.com", firstName: "Mawo", lastName: "Doh", role: "FIDELES", churchId: atakpame.id, profile: { create: { city: "Atakpamé", gender: "FEMME" } } } }),
    prisma.user.create({ data: { email: "yao@gmail.com", firstName: "Yao", lastName: "Gbadoe", role: "FIDELES", churchId: lome.id, profile: { create: { city: "Lomé", gender: "HOMME", maritalStatus: "DIVORCE" } } } }),
  ]);

  console.log("[seed] événements…");
  const events = await Promise.all([
    prisma.event.create({ data: { title: "Baptême par immersion", type: "BAPTEME", date: daysFromNow(20, 9), startTime: "09:00", endTime: "12:00", location: "Plage de Lomé", maxCapacity: 60, description: "Ce baptême par immersion rassemble les candidats de nos cinq assemblées ayant suivi le catéchisme des nouveaux croyants.", churchId: lome.id } }),
    prisma.event.create({ data: { title: "Conférence des jeunes couples", type: "CONFERENCE", date: daysFromNow(12, 15), startTime: "15:00", endTime: "18:00", location: "Église Centrale", description: "Thème : bâtir un foyer selon le cœur de Dieu.", churchId: lome.id } }),
    prisma.event.create({ data: { title: "3 jours de jeûne communautaire", type: "JEUNE", date: daysFromNow(5, 6), location: "Centrale", maxCapacity: 200, description: "Jeûne et prière communautaires sur trois jours.", churchId: lome.id } }),
    prisma.event.create({ data: { title: "École des diacres — session 4", type: "FORMATION", date: daysFromNow(8, 14), startTime: "14:00", endTime: "17:00", location: "Agoè-Nyivé", maxCapacity: 40, churchId: agoe.id } }),
    prisma.event.create({ data: { title: "Culte de consécration", type: "CULTE", date: daysFromNow(30, 9), startTime: "09:00", endTime: "12:00", location: "Église Centrale", churchId: lome.id } }),
    prisma.event.create({ data: { title: "Mariage communautaire", type: "MARIAGE", date: daysFromNow(45, 10), location: "Esplanade du Palais des Congrès", maxCapacity: 300, churchId: lome.id } }),
  ]);
  await prisma.eventRegistration.createMany({
    data: [
      { eventId: events[1].id, userId: membre.id, status: "VALIDE", validatedAt: new Date() },
      { eventId: events[1].id, userId: admin.id, status: "VALIDE", validatedAt: new Date() },
      { eventId: events[2].id, userId: membre.id },
      { eventId: events[2].id, userId: fideles[0].id },
      { eventId: events[2].id, userId: fideles[1].id },
    ],
  });

  console.log("[seed] programmes…");
  await Promise.all([
    prisma.program.create({ data: { title: "Grande conférence annuelle", type: "ANNUEL", startDate: daysFromNow(60), endDate: daysFromNow(63), location: "Palais des Congrès de Lomé", description: "Trois jours d'enseignements avec des ministres invités.", churchId: lome.id } }),
    prisma.program.create({ data: { title: "Jeûne mensuel de l'église", type: "MENSUEL", startDate: daysFromNow(2, 6), endDate: daysFromNow(3, 18), location: "Centrale", churchId: lome.id } }),
    prisma.program.create({ data: { title: "Culte de mercredi", type: "HEBDOMADAIRE", startDate: daysFromNow(1, 18), endDate: daysFromNow(1, 20), location: "Église Centrale", churchId: lome.id } }),
    prisma.program.create({ data: { title: "Culte de dimanche", type: "HEBDOMADAIRE", startDate: daysFromNow(4, 9), endDate: daysFromNow(4, 12), location: "Église Centrale", churchId: lome.id } }),
    prisma.program.create({ data: { title: "Veillée de prière", type: "HEBDOMADAIRE", startDate: daysFromNow(6, 21), endDate: daysFromNow(6, 24), location: "Église Centrale", churchId: lome.id } }),
    prisma.program.create({ data: { title: "Prière de 6h", type: "JOURNALIER", startDate: daysFromNow(0, 6), endDate: daysFromNow(0, 7), location: "Église Centrale", churchId: lome.id } }),
  ]);

  console.log("[seed] prières matinales…");
  await Promise.all([
    prisma.morningPrayer.create({ data: { title: "Marcher par la foi, pas à pas", content: "Ce matin, retenons que la foi ne demande pas de voir tout le chemin, mais de faire le prochain pas.", bibleVerse: "Jérémie 29:11", authorId: pasteur.id } }),
    prisma.morningPrayer.create({ data: { title: "La force du silence", content: "Avant d'agir, apprenons à nous taire et à écouter la voix de l'Esprit.", bibleVerse: "Psaume 46:10", authorId: apotre.id } }),
    prisma.morningPrayer.create({ data: { title: "Un cœur reconnaissant", content: "La gratitude ouvre la porte des bénédictions. Remercions avant de demander.", bibleVerse: "1 Thessaloniciens 5:18", authorId: admin.id } }),
  ]);

  console.log("[seed] catégories + actualités…");
  const [vie, formation, temoignage] = await Promise.all([
    prisma.postCategory.create({ data: { name: "Vie d'église" } }),
    prisma.postCategory.create({ data: { name: "Formation" } }),
    prisma.postCategory.create({ data: { name: "Témoignages" } }),
  ]);
  const posts = await Promise.all([
    prisma.post.create({ data: { title: "Retour sur la campagne d'évangélisation à Agoè", excerpt: "Plus de 240 personnes touchées en trois jours, 38 nouvelles décisions pour Christ…", content: "La campagne d'évangélisation menée à Agoè-Nyivé a été une saison de grâce. Des équipes de prière, des visites de proximité et des soirées d'évangélisation ont marqué ces trois jours. 38 personnes ont pris la décision de suivre Christ et seront accompagnées dans les cellules.", categoryId: vie.id, publishedAt: daysFromNow(-3), authorId: admin.id } }),
    prisma.post.create({ data: { title: "Nouvelle session de l'école des diacres", excerpt: "Les inscriptions ouvrent ce lundi pour les responsables de cellule…", content: "L'école des diacres reprend pour une quatrième session. Les modules couvrent le service pratique, la conduite des cellules et la gestion des assemblées locales.", categoryId: formation.id, publishedAt: daysFromNow(-6), authorId: pasteur.id } }),
    prisma.post.create({ data: { title: "Témoignage : guérie après 7 ans de maladie", excerpt: "Une sœur de l'assemblée de Kara témoigne de sa guérison…", content: "Après sept années de maladie, une sœur de l'assemblée de Kara rend gloire à Dieu pour sa guérison totale, au terme d'une chaîne de prière menée par les anciens.", categoryId: temoignage.id, publishedAt: daysFromNow(-10), authorId: apotre.id } }),
  ]);
  await prisma.postRead.createMany({
    data: [
      { postId: posts[0].id, userId: membre.id },
      { postId: posts[0].id, userId: fideles[0].id },
      { postId: posts[0].id, userId: fideles[1].id },
      { postId: posts[1].id, userId: membre.id },
    ],
  });

  console.log("[seed] médias…");
  await Promise.all([
    prisma.media.create({ data: { type: "PHOTO", title: "Campagne d'évangélisation Agoè", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", status: "APPROUVE", authorId: admin.id } }),
    prisma.media.create({ data: { type: "PHOTO", title: "Chorale des jeunes à Bè-Kpota", url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800", status: "APPROUVE", authorId: pasteur.id } }),
    prisma.media.create({ data: { type: "VIDEO", title: "Culte de dimanche — rediffusion", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", status: "APPROUVE", authorId: pasteur.id } }),
    prisma.media.create({ data: { type: "PHOTO", title: "Baptême à la plage de Lomé", url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800", status: "APPROUVE", authorId: admin.id } }),
    prisma.media.create({ data: { type: "PHOTO", title: "Photo soumise — session jeunes", url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800", status: "EN_ATTENTE", authorId: pasteur.id } }),
    prisma.media.create({ data: { type: "AUDIO", title: "Prédication — audio en attente", url: "https://example.com/audio.mp3", status: "EN_ATTENTE", authorId: pasteur.id } }),
  ]);

  console.log("[seed] directs…");
  await prisma.liveStream.create({
    data: {
      title: "Culte de restauration — Église Centrale, Bè-Kpota",
      type: "YOUTUBE", status: "EN_DIRECT", youtubeVideoId: "dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      startedAt: new Date(), authorId: pasteur.id,
    },
  });
  await prisma.liveStream.create({
    data: { title: "Veillée de prière — vendredi", type: "INTERNE", status: "PLANIFIE", streamUrl: null, authorId: apotre.id },
  });

  console.log("[seed] dons…");
  await Promise.all([
    prisma.donation.create({ data: { type: "OFFRANDE", amount: 25000, method: "FLOOZ", phone: "+22890000000", status: "CONFIRME", donorId: membre.id, churchId: lome.id } }),
    prisma.donation.create({ data: { type: "DIME", amount: 45000, method: "TMONEY", phone: "+22891111111", status: "CONFIRME", donorId: fideles[0].id, churchId: lome.id } }),
    prisma.donation.create({ data: { type: "PROJET", amount: 150000, method: "FLOOZ", phone: "+22892222222", status: "EN_ATTENTE", name: "Frère David", email: "david@example.com", churchId: kara.id } }),
    prisma.donation.create({ data: { type: "OFFRANDE", amount: 8000, method: "PAYPAL", status: "CONFIRME", name: "Sœur Ruth", email: "ruth@example.com", anonymous: true, churchId: lome.id } }),
  ]);

  console.log("[seed] messages de contact…");
  await Promise.all([
    prisma.contactMessage.create({ data: { name: "Kossi Atti", email: "kossi@example.com", subject: "Inscription au baptême", message: "Bonjour, je souhaite inscrire mon fils au prochain baptême par immersion. Quelles sont les conditions ?", recipientType: "PASTEUR", recipientId: pasteur.id } }),
    prisma.contactMessage.create({ data: { name: "Ama D.", email: "ama@example.com", subject: "Merci", message: "Merci pour les prières matinales quotidiennes, elles me fortifient chaque jour.", recipientType: "EGLISE", isRead: true, readAt: new Date() } }),
    prisma.contactMessage.create({ data: { name: "Jean-Marc", email: "jm@example.com", subject: "Location de la salle", message: "L'église d'Agoè peut-elle accueillir un mariage de 150 personnes en novembre ?", recipientType: "EGLISE" } }),
  ]);

  console.log("[seed] abonnés newsletter…");
  await Promise.all([
    prisma.subscription.create({ data: { email: "abonne1@example.com", name: "Afi", active: true } }),
    prisma.subscription.create({ data: { email: "abonne2@example.com", active: true } }),
    prisma.subscription.create({ data: { email: "ancien@example.com", active: false } }),
  ]);

  console.log("[seed] conversation + messages…");
  const conv = await prisma.conversation.create({
    data: { participants: { create: [{ userId: membre.id }, { userId: pasteur.id }] } },
  });
  await prisma.chatMessage.createMany({
    data: [
      { conversationId: conv.id, senderId: membre.id, content: "Bonjour Pasteur, je voulais savoir si la répétition de l'adoration a lieu ce soir ?", messageType: "TEXTE" },
      { conversationId: conv.id, senderId: pasteur.id, content: "Bonjour Emefa, oui à 18h à l'église. À tout à l'heure !", messageType: "TEXTE" },
    ],
  });
  await prisma.notification.createMany({
    data: [
      { userId: membre.id, type: "MESSAGE", title: "Nouveau message", message: "Pasteur Kwami Sedjro vous a écrit.", link: "/messagerie" },
      { userId: membre.id, type: "EVENT", title: "Événement à venir", message: "3 jours de jeûne communautaire dans 5 jours.", isRead: true },
    ],
  });

  console.log("[seed] visites (analytics)…");
  await prisma.pageView.createMany({
    data: Array.from({ length: 40 }, (_, i) => ({
      path: i % 2 ? "/accueil" : "/actualites",
      date: new Date(Date.now() - i * 3600 * 1000),
    })),
  });

  console.log("✅ Seed terminé.");
  console.log("   Admin  : admin@eglise.com / 123456");
  console.log("   Apotre : apotre@eglise.com / 123456");
  console.log("   Pasteur: pasteur@eglise.com / 123456");
  console.log("   Membre : membre@eglise.com (code OTP affiché dans la console serveur)");
}

main()
  .catch((e) => {
    console.error("[seed] erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());