/** Couvertures de repli (SVG de marque) pour les événements et actualités, tant que la base n'expose pas de champ image. */

const EVENT_COVERS = {
  BAPTEME: "/covers/bapteme.svg",
  JEUNE: "/covers/jeune.svg",
  FORMATION: "/covers/formation.svg",
  MARIAGE: "/covers/mariage.svg",
  CULTE: "/covers/culte.svg",
  CONFERENCE: "/covers/reunion.svg",
  REUNION: "/covers/reunion.svg",
  AUTRE: "/covers/aube.svg",
};

const POST_COVERS = ["/covers/aube.svg", "/covers/culte.svg", "/covers/formation.svg", "/covers/jeune.svg"];

const CHURCH_COVERS = ["/covers/culte.svg", "/covers/reunion.svg", "/covers/aube.svg", "/covers/formation.svg"];

function hashId(id) {
  return [...String(id ?? "")].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function eventCover(event) {
  return event?.imageUrl || EVENT_COVERS[event?.type] || EVENT_COVERS.AUTRE;
}

export function postCover(post) {
  if (post?.imageUrl) return post.imageUrl;
  return POST_COVERS[hashId(post?.id) % POST_COVERS.length];
}

export function churchCover(church) {
  if (church?.imageUrl) return church.imageUrl;
  return CHURCH_COVERS[hashId(church?.id) % CHURCH_COVERS.length];
}

/** Extrait l'identifiant d'une vidéo YouTube (watch, youtu.be, shorts, embed). */
export function youtubeId(url) {
  const m = String(url || "").match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

/** Meilleure image disponible pour un média : miniature fournie, fichier (photo), ou vignette YouTube auto. */
export function mediaThumbnail(media) {
  if (!media) return null;
  if (media.thumbnailUrl) return media.thumbnailUrl;
  if (media.type === "PHOTO") return media.url || null;
  if (media.type === "VIDEO") {
    const id = youtubeId(media.url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}
