import { ROLE_LABELS } from "../../lib/constants";
import { label, tone } from "../../lib/labels";

const TONES = {
  gold: "badge-gold",
  palm: "badge-palm",
  brick: "badge-brick",
  muted: "badge-muted",
};

export function Badge({ tone = "muted", className = "", children }) {
  return <span className={`badge ${TONES[tone] ?? TONES.muted} ${className}`}>{children}</span>;
}

export function RoleBadge({ role, className = "" }) {
  return <span className={`chip-role chip-${role} ${className}`}>{ROLE_LABELS[role] ?? role}</span>;
}

/** Badge de statut : libellé FR + tonalité déduits de l'enum (voir lib/labels.js). */
export function StatusBadge({ kind, status, className = "" }) {
  return (
    <Badge tone={tone(kind, status)} className={className}>
      {label(kind, status)}
    </Badge>
  );
}