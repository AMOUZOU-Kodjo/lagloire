import { Badge } from "../../../components/ui";
import { AudioLines, Play, Clock, Image as ImageIcon } from "lucide-react";
import { mediaThumbnail } from "../../../lib/covers";

const TYPE_LABELS = { PHOTO: "Photo", AUDIO: "Audio", VIDEO: "Vidéo" };
const TYPE_ICONS = { AUDIO: AudioLines, VIDEO: Play };
const TYPE_GRADIENTS = {
  PHOTO: "linear-gradient(135deg,#2C8F86 0%,#142A2E 100%)",
  AUDIO: "linear-gradient(135deg,#2C4A8F 0%,#142A2E 100%)",
  VIDEO: "linear-gradient(135deg,#1F2937 0%,#142A2E 100%)",
};

export default function MediaCard({ media, onClick }) {
  const gradient = TYPE_GRADIENTS[media.type] ?? TYPE_GRADIENTS.PHOTO;
  const isPlayable = media.type === "AUDIO" || media.type === "VIDEO";
  const Icon = TYPE_ICONS[media.type];
  const imgSrc = mediaThumbnail(media);

  return (
    <button
      onClick={onClick}
      className="card rounded-lg overflow-hidden text-left group w-full flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={media.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} />
        )}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide bg-white/95 text-ink px-2.5 py-1 rounded-full shadow-sm">
          {media.type === "PHOTO"
            ? <ImageIcon size={11} className="text-gold-dim" />
            : <Icon size={11} className="text-gold-dim" />}
          {TYPE_LABELS[media.type]}
        </span>

        {media.status === "EN_ATTENTE" && (
          <Badge tone="gold" className="absolute top-3 right-3">En attente</Badge>
        )}

        {isPlayable && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center text-gold-dim shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Icon size={20} className="ml-0.5" />
            </span>
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-1">{media.title}</p>
        <div className="flex items-center gap-2 mt-auto">
          {media.duration && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-soft">
              <Clock size={11} /> {media.duration}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}