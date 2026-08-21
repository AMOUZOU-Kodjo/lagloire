import { prisma } from "../lib/prisma.js";

/**
 * Générateur automatique de prières matinales et messages d'encouragement.
 * Combine versets bibliques, thèmes et gabarits rédactionnels pour produire
 * un contenu varié, sans répétition récente, prêt à être mis en file d'attente.
 */

const VERSES = [
  { ref: "Psaumes 23:1", text: "L'Éternel est mon berger : je ne manquerai de rien." },
  { ref: "Psaumes 46:2", text: "Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse." },
  { ref: "Psaumes 118:24", text: "C'est ici la journée que l'Éternel a faite : qu'elle soit pour nous un sujet d'allégresse et de joie !" },
  { ref: "Psaumes 119:105", text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier." },
  { ref: "Psaumes 121:1-2", text: "Je lève mes yeux vers les montagnes… D'où viendra mon secours ? Le secours me vient de l'Éternel, qui a fait les cieux et la terre." },
  { ref: "Proverbes 3:5-6", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse. Reconnais-le dans toutes tes voies, et il aplanira tes sentiers." },
  { ref: "Ésaïe 40:31", text: "Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles." },
  { ref: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu ; je te fortifie, je viens à ton secours." },
  { ref: "Ésaïe 43:19", text: "Voici, je vais faire une chose nouvelle, sur le point d'arriver : ne la connaîtrez-vous pas ? Je mettrai un chemin dans le désert, et des fleuves dans la solitude." },
  { ref: "Jérémie 29:11", text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance." },
  { ref: "Jérémie 33:3", text: "Crie vers moi, et je te répondrai ; je t'annoncerai de grandes choses, des choses cachées, que tu ne connais pas." },
  { ref: "Lamentations 3:22-23", text: "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin." },
  { ref: "Michée 6:8", text: "Homme, il t'a été déclaré ce qui est bien, ce que l'Éternel demande de toi : pratique la justice, aime la miséricorde, et humilie-toi devant ton Dieu." },
  { ref: "Sophonie 3:17", text: "L'Éternel, ton Dieu, est au milieu de toi, comme un héros qui sauve ; il fera de toi sa plus grande joie." },
  { ref: "Zacharie 4:6", text: "Ce n'est ni par la puissance ni par la force, mais c'est par mon esprit, dit l'Éternel des armées." },
  { ref: "Matthieu 6:33", text: "Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus." },
  { ref: "Matthieu 11:28", text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos." },
  { ref: "Marc 9:23", text: "Tout est possible à celui qui croit." },
  { ref: "Luc 1:37", text: "Rien n'est impossible à Dieu." },
  { ref: "Jean 8:12", text: "Je suis la lumière du monde ; celui qui me suit ne marchera pas dans les ténèbres, mais il aura la lumière de la vie." },
  { ref: "Jean 14:27", text: "Je vous laisse la paix, je vous donne ma paix. Que votre cœur ne se trouble point, et ne s'effraie point." },
  { ref: "Jean 16:33", text: "Vous aurez des tribulations dans le monde ; mais prenez courage, j'ai vaincu le monde." },
  { ref: "Actes 1:8", text: "Vous recevrez une puissance, le Saint-Esprit surviendra sur vous, et vous serez mes témoins." },
  { ref: "Romains 8:28", text: "Toutes choses concourent au bien de ceux qui aiment Dieu." },
  { ref: "Romains 8:31", text: "Si Dieu est pour nous, qui sera contre nous ?" },
  { ref: "Romains 12:12", text: "Ayez dans l'espérance une joie ferme, soyez patients dans l'affliction, persévérez avec instance dans la prière." },
  { ref: "Romains 15:13", text: "Que le Dieu de l'espérance vous remplisse de toute joie et de toute paix dans la foi !" },
  { ref: "1 Corinthiens 15:58", text: "Soyez fermes, inébranlables, travaillant de mieux en mieux pour le Seigneur, sachant que votre travail ne sera pas vain dans le Seigneur." },
  { ref: "2 Corinthiens 4:16", text: "Notre homme intérieur se renouvelle de jour en jour." },
  { ref: "2 Corinthiens 5:17", text: "Si quelqu'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles." },
  { ref: "Galates 6:9", text: "Ne nous lassons pas de faire le bien ; car nous moissonnerons au temps convenable, si nous ne nous relâchons pas." },
  { ref: "Éphésiens 3:20", text: "Celui qui peut faire, par la puissance qui agit en nous, infiniment au-delà de tout ce que nous demandons ou pensons…" },
  { ref: "Éphésiens 6:10-11", text: "Fortifiez-vous dans le Seigneur, et par sa puissance toute-puissante. Revêtez-vous de toutes les armes de Dieu." },
  { ref: "Philippiens 4:6-7", text: "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces." },
  { ref: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },
  { ref: "Colossiens 3:2", text: "Pensez aux choses d'en haut, et non à celles qui sont sur la terre." },
  { ref: "1 Thessaloniciens 5:16-18", text: "Réjouissez-vous toujours. Priez sans cesse. Rendez grâces en toutes choses." },
  { ref: "2 Timothée 1:7", text: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse." },
  { ref: "Hébreux 11:1", text: "La foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas." },
  { ref: "Hébreux 4:16", text: "Approchons-nous donc avec confiance du trône de la grâce, afin d'obtenir miséricorde et de trouver grâce, pour être secourus dans nos besoins." },
  { ref: "Jacques 1:5", text: "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu, qui donne à tous avec simplicité et sans reproche, et elle lui sera donnée." },
  { ref: "Jacques 5:16", text: "La prière fervente du juste peut beaucoup." },
  { ref: "1 Pierre 5:7", text: "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous." },
  { ref: "1 Jean 4:18", text: "La parfaite amour bannit la crainte." },
  { ref: "1 Jean 5:14", text: "Nous avons auprès de lui cette assurance : si nous demandons quelque chose selon sa volonté, il nous écoute." },
  { ref: "Psaumes 34:8", text: "Goûtez et voyez combien l'Éternel est bon ! Heureux l'homme qui cherche en lui son refuge !" },
  { ref: "Psaumes 37:5", text: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira." },
  { ref: "Psaumes 91:1-2", text: "Celui qui demeure à l'abri du Très-Haut repose à l'ombre du Tout-Puissant. Je dis de l'Éternel : mon refuge et ma forteresse, mon Dieu en qui je me confie !" },
];

const THEMES = [
  {
    name: "la gratitude",
    demandes: [
      "apprends-nous à compter Tes bienfaits et à Te rendre grâce en toute circonstance",
      "ouvre nos yeux sur les merveilles que Tu opères chaque jour autour de nous",
    ],
    encouragements: [
      "Commence cette journée par la louange : un cœur reconnaissant ouvre la porte aux bénédictions.",
      "Avant de demander, remercie. La gratitude change notre regard sur la journée qui commence.",
    ],
  },
  {
    name: "la force",
    demandes: [
      "revêts-nous de Ta force pour affronter les défis de ce jour sans faiblir",
      "soutiens ceux qui sont fatigués, découragés ou accablés, et renouvelle leurs forces",
    ],
    encouragements: [
      "Tu n'es pas seul : Celui qui te fortifie marche devant toi dès ce matin.",
      "Ta force du jour ne dépend pas de toi, mais de Celui qui te soutient.",
    ],
  },
  {
    name: "la paix",
    demandes: [
      "répands Ta paix dans nos cœurs, nos familles et notre assemblée",
      "calme chaque tempête intérieure et garde nos pensées attachées à Toi",
    ],
    encouragements: [
      "Laisse Sa paix garder ton cœur comme une forteresse aujourd'hui.",
      "La vraie paix ne vient pas des circonstances, mais de la présence de Dieu en toi.",
    ],
  },
  {
    name: "la sagesse",
    demandes: [
      "accorde-nous Ta sagesse pour prendre les bonnes décisions en ce jour",
      "éclaire nos choix, nos paroles et nos engagements par Ta vérité",
    ],
    encouragements: [
      "Devant chaque décision, incline ton cœur : Dieu donne largement la sagesse à qui la lui demande.",
      "Le début de la sagesse, c'est d'écouter avant de parler et de prier avant d'agir.",
    ],
  },
  {
    name: "la protection",
    demandes: [
      "place-nous sous Ton abri, garde nos allées et venues en ce jour",
      "protège les enfants, les familles et tous ceux qui prennent la route en ce matin",
    ],
    encouragements: [
      "Sous l'abri du Très-Haut, aucune flèche de l'ennemi ne t'atteindra aujourd'hui.",
      "Dors ou veille, tu es gardé : le Protecteur d'Israël ne sommeille jamais.",
    ],
  },
  {
    name: "la foi",
    demandes: [
      "augmente notre foi et aide notre incrédulité",
      "enseigne-nous à marcher par la foi et non par la vue",
    ],
    encouragements: [
      "Petite foi placée dans un grand Dieu déplace des montagnes.",
      "Crois encore une fois : le temps favorable de la moisson approche.",
    ],
  },
  {
    name: "la famille",
    demandes: [
      "bénis nos foyers, restaure les liens brisés et remplis nos maisons de Ton amour",
      "garde l'unité entre frères et sœurs, parents et enfants, dans la joie du Saint-Esprit",
    ],
    encouragements: [
      "Prie pour ta maison aujourd'hui : la bénédiction d'une famille commence à genoux.",
      "Que Christ règne au centre de ton foyer, et la paix suivra.",
    ],
  },
  {
    name: "la provision",
    demandes: [
      "pourvois à nos besoins selon Ta richesse, dans la gloire de Christ",
      "bénis le travail de nos mains et ouvre les portes que nul ne peut fermer",
    ],
    encouragements: [
      "Le Berger pourvoira : ne crains pas le lendemain, Il connaît déjà tes besoins.",
      "Sème avec générosité : Celui qui nourrit les oiseaux du ciel prendra soin de toi.",
    ],
  },
  {
    name: "l'évangélisation",
    demandes: [
      "fais de nous des témoins de Ton amour partout où nous irons aujourd'hui",
      "ouvre des portes pour l'Évangile et prépare les cœurs à Te recevoir",
    ],
    encouragements: [
      "Porte la lumière là où tu iras : quelqu'un attend peut-être ton témoignage aujourd'hui.",
      "Sois un ambassadeur de Christ : tes actes parlent aussi de Lui.",
    ],
  },
  {
    name: "la guérison",
    demandes: [
      "guéris les corps, les âmes et les cœurs blessés, selon Ta miséricorde",
      "relève ceux qui sont sur le lit de maladie et console ceux qui pleurent",
    ],
    encouragements: [
      "Le Seigneur qui a porté nos souffrances veut encore guérir aujourd'hui.",
      "Présente-Lui tes blessures : le Médecin parfait n'est jamais à court de remède.",
    ],
  },
];

const TITLES_PRIERE = [
  "Prière du matin — {theme}",
  "{theme} : commençons la journée avec Dieu",
  "Prière pour {theme}",
  "Ce matin, cherchons {theme}",
];
const TITLES_MESSAGE = [
  "Message d'encouragement — {theme}",
  "Une parole pour ce matin : {theme}",
  "Force pour aujourd'hui — {theme}",
];

const OUVERTURES = [
  "Seigneur, en ce nouveau jour que Tu fais, nous venons à Toi avec un cœur humble.",
  "Père céleste, merci pour cette nuit passée et pour ce matin qui se lève.",
  "Éternel, notre refuge, nous entrons dans cette journée sous Ton regard bienveillant.",
  "Dieu tout-puissant, Ta compassion se renouvelle ce matin encore envers nous.",
];

const TRANSITIONS = [
  "Ta Parole nous le rappelle : ",
  "Nous nous appuyons sur Ta promesse : ",
  "Comme il est écrit dans Ta Parole : ",
];

const CONCLUSIONS = [
  "Que Ta volonté soit faite en tout, et que Ton nom soit glorifié à travers notre journée. Au nom de Jésus-Christ, Amen.",
  "Garde-nous dans Ta paix jusqu'au soir, et fais de nous des instruments de Ta joie. En Jésus-Christ, Amen.",
  "Nous Te confions ce jour tout entier : nos pas, nos paroles et nos pensées. Au nom puissant de Jésus, Amen.",
  "Merci, Père, de marcher avec nous. Béni sois-Tu pour toujours. Amen, Alléluia !",
];

function pick(list, exclude) {
  const options = exclude ? list.filter((x) => x !== exclude) : list;
  return options[Math.floor(Math.random() * options.length)];
}

/** Construit une entrée complète (titre, contenu, verset) sans doublon de verset récent. */
function buildEntry(kind, usedRefs) {
  let verse;
  let attempts = 0;
  do {
    verse = VERSES[Math.floor(Math.random() * VERSES.length)];
    attempts += 1;
  } while (usedRefs.has(verse.ref) && attempts < 25);
  usedRefs.add(verse.ref);

  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const themeLabel = theme.name;

  if (kind === "MESSAGE") {
    const title = pick(TITLES_MESSAGE).replace("{theme}", themeLabel.charAt(0).toUpperCase() + themeLabel.slice(1));
    const content =
      `${pick(theme.encouragements)}\n\n` +
      `« ${verse.text} » (${verse.ref})\n\n` +
      `Prends un instant ce matin pour confier ta journée au Seigneur : Il s'occupe de toi, ` +
      `dans les grands défis comme dans les petits détails. Bonne journée bénie ! 🙏`;
    return { title, content, bibleVerse: `${verse.text} — ${verse.ref}` };
  }

  const title = pick(TITLES_PRIERE).replace("{theme}", themeLabel);
  const content =
    `${pick(OUVERTURES)} ${pick(TRANSITIONS)}« ${verse.text} » (${verse.ref}).\n\n` +
    `Aujourd'hui, nous Te prions : ${pick(theme.demandes)}. ` +
    `Que Ta présence nous accompagne à chaque instant, au travail, à la maison et partout où Tu nous enverras.\n\n` +
    pick(CONCLUSIONS);
  return { title, content, bibleVerse: `${verse.text} — ${verse.ref}` };
}

/**
 * Génère `count` entrées variées et les met en file d'attente (EN_ATTENTE).
 * Le planificateur les publiera ensuite une par jour, la plus ancienne d'abord.
 */
export async function generatePrayers({ count = 7, authorId }) {
  const recent = await prisma.morningPrayer.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 90 * 24 * 3600 * 1000) } },
    select: { bibleVerse: true },
    orderBy: { createdAt: "desc" },
    take: 120,
  });
  const usedRefs = new Set(
    recent.map((r) => r.bibleVerse?.match(/\(([^)]+)\)\s*$/)?.[1]).filter(Boolean)
  );

  const created = [];
  for (let i = 0; i < count; i += 1) {
    const kind = i % 3 === 2 ? "MESSAGE" : "PRIERE"; // ~1 message pour 2 prières
    const entry = buildEntry(kind, usedRefs);
    created.push(
      await prisma.morningPrayer.create({
        data: { ...entry, status: "EN_ATTENTE", authorId },
      })
    );
  }
  return created;
}
