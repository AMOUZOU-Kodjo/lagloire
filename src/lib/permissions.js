import { ROLES } from "./constants";

/** Peut publier un média/post/programme/événement/prière matinale (miroir mediaController.canPublish) */
export function canPublish(role) {
  return [ROLES.ADMIN, ROLES.APOTRE, ROLES.PASTEUR].includes(role);
}

/** Peut approuver/supprimer/masquer un contenu (miroir mediaController.canManage) */
export function canManageContent(role) {
  return [ROLES.ADMIN, ROLES.APOTRE].includes(role);
}

/** Un contenu publié par un PASTEUR nécessite une approbation avant publication publique */
export function needsApproval(role) {
  return role === ROLES.PASTEUR;
}

/** Peut gérer (modifier/supprimer) un utilisateur cible (miroir userController.canManageUser) */
export function canManageUser(actorRole, actorChurchId, targetUser) {
  if (actorRole === ROLES.ADMIN) return true;
  if (actorRole === ROLES.APOTRE) return targetUser.role !== ROLES.ADMIN;
  if (actorRole === ROLES.PASTEUR) {
    return (
      targetUser.role !== ROLES.ADMIN &&
      targetUser.role !== ROLES.APOTRE &&
      targetUser.churchId === actorChurchId
    );
  }
  return false;
}

/** Règles d'envoi de message (miroir utils/chatPermissions attendu côté backend) :
 *  tout le monde peut écrire à un responsable (ADMIN/APOTRE/PASTEUR),
 *  les fidèles/visiteurs ne peuvent pas s'écrire entre eux sans passer par un responsable. */
export function canSendMessage(senderRole, recipientRole) {
  const staff = [ROLES.ADMIN, ROLES.APOTRE, ROLES.PASTEUR];
  if (staff.includes(senderRole) || staff.includes(recipientRole)) return true;
  return false;
}

export function isStaff(role) {
  return [ROLES.ADMIN, ROLES.APOTRE, ROLES.PASTEUR].includes(role);
}

export function canAccessAdmin(role) {
  return isStaff(role);
}
