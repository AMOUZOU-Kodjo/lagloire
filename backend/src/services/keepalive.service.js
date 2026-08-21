import { prisma } from "../lib/prisma.js";

/**
 * Anti-veille Neon : la base se met en veille après ~5 min d'inactivité
 * (offre gratuite), ce qui ralentit la première requête et peut faire
 * rater le planificateur de 05h00. Un ping SQL régulier maintient
 * la connexion éveillée tant que le backend tourne.
 *
 * Variable d'environnement :
 *  - NEON_KEEPALIVE_MINUTES : intervalle du ping en minutes (défaut 4,
 *    soit juste sous le seuil de mise en veille). 0 désactive.
 */

const intervalMinutes = () => Number(process.env.NEON_KEEPALIVE_MINUTES ?? 4);

export function startKeepAlive() {
  const minutes = intervalMinutes();
  if (!minutes || minutes < 1) {
    console.log("[keepalive] Anti-veille désactivé (NEON_KEEPALIVE_MINUTES=0)");
    return;
  }

  let timer = null;
  const ping = async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.warn("[keepalive] Ping échoué :", err.message);
    }
  };

  timer = setInterval(ping, minutes * 60_000);
  // Premier ping immédiat : réveille la base au démarrage du serveur.
  ping();
  console.log(`[keepalive] Anti-veille Neon actif — ping toutes les ${minutes} min`);
}
