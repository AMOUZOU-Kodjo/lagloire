import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image, AudioLines, Video, ImageOff, Clock, Upload, Play, Pause, Download } from "lucide-react";
import { mediaApi } from "../../../api/media.api";
import { apiOrigin } from "../../../api/http";
import { useAuthStore } from "../../../store/authStore";
import { Modal, EmptyState, PageHero, Button, Badge } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { youtubeId } from "../../../lib/covers";
import MediaCard from "../components/MediaCard";
import MediaPublishModal from "../components/MediaPublishModal";

const resolveUrl = (url) => (url?.startsWith("/") ? `${apiOrigin()}${url}` : url);

async function downloadFile(url, filename) {
  try {
    const res = await fetch(resolveUrl(url));
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "media";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(resolveUrl(url), "_blank");
  }
}

function downloadName(media) {
  const ext = (media.url?.match(/\.(\w{2,5})(?:\?|$)/) || [])[1] || "jpg";
  const slug = String(media.title || "media").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug}.${ext}`;
}

const STATUS_BADGE = {
  EN_ATTENTE: { tone: "gold", label: "En attente de validation" },
  APPROUVE: { tone: "palm", label: "Publié" },
  REJETE: { tone: "brick", label: "Rejeté" },
};

const FILTERS = [
  { value: "PHOTO", label: "Photos", icon: Image },
  { value: "AUDIO", label: "Audio", icon: AudioLines },
  { value: "VIDEO", label: "Vidéos", icon: Video },
];

const TYPE_LABELS = { PHOTO: "Photo", AUDIO: "Audio", VIDEO: "Vidéo" };
const TYPE_CHIP = {
  PHOTO: { icon: Image, cls: "bg-gold/10 text-gold-dim border-gold/25" },
  AUDIO: { icon: AudioLines, cls: "bg-[#4a90e2]/10 text-[#2f6bb3] border-[#4a90e2]/25" },
  VIDEO: { icon: Video, cls: "bg-brick/10 text-brick border-brick/25" },
};

const MOCK_MEDIA = [
  { id: "1", title: "Culte de reconnaissance", type: "PHOTO", thumbnailUrl: "/gallery/culte.svg", isApproved: true },
  { id: "2", title: "Prédication — La foi qui déplace", type: "VIDEO", thumbnailUrl: "/gallery/predication.svg", duration: "48:12", isApproved: true },
  { id: "3", title: "Chorale — Fête de Noël", type: "PHOTO", thumbnailUrl: "/gallery/noel.svg", isApproved: true },
  { id: "4", title: "Louange du dimanche — Audio", type: "AUDIO", thumbnailUrl: "/gallery/louange.svg", duration: "1:12:03", isApproved: true },
  { id: "5", title: "Baptêmes — juin 2026", type: "PHOTO", thumbnailUrl: "/gallery/baptemes.svg", isApproved: true },
];

export default function GaleriePage() {
  const user = useAuthStore((s) => s.user);
  const [type, setType] = useState("PHOTO");
  const [selected, setSelected] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["media", { type }],
    queryFn: () => mediaApi.list({ type: type || undefined, limit: 20 }).then((r) => r.data),
    placeholderData: MOCK_MEDIA,
  });

  const { data: mine } = useQuery({
    queryKey: ["media", "mine"],
    queryFn: () => mediaApi.mine().then((r) => r.data),
    enabled: !!user,
  });

  const items = data ?? [];
  const activeFilter = FILTERS.find((f) => f.value === type);

  return (
    <>
      <PageHero
        eyebrow="Photos · Audio · Vidéo"
        title="Galerie"
        description="Les moments forts de la vie de la communauté, en images, en sons et en vidéos."
      />

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Filtres */}
        <Stagger delay={0.1}>
          <Item>
            <div className="flex justify-center">
              <div className="inline-flex flex-wrap justify-center gap-1 p-1.5 rounded-2xl bg-sand-2 border border-line">
                {FILTERS.map((f) => {
                  const Icon = f.icon;
                  const isActive = f.value === type;
                  return (
                    <button
                      key={f.label}
                      onClick={() => { setType(f.value); setPlayingId(null); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white text-gold-dim font-semibold shadow-sm border border-line"
                          : "text-soft hover:text-ink hover:bg-white/60 border border-transparent"
                      }`}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.25 : 2} />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Item>

          <Item>
            <p className="text-center text-xs text-soft mt-3">
              {activeFilter?.label ?? "Tout"} · {items.length} média{items.length > 1 ? "s" : ""}
            </p>
          </Item>

          <Item>
            <div className="mt-6 flex items-center justify-between gap-3">
              {user ? (
                <Button size="sm" onClick={() => setPublishOpen(true)}>
                  <Upload size={14} className="mr-1.5" /> Publier un média
                </Button>
              ) : (
                <span className="text-xs text-soft">
                  Connectez-vous pour partager vos photos, audios et vidéos.
                </span>
              )}
            </div>
          </Item>
        </Stagger>

        {/* Mes soumissions */}
        {user && mine?.length > 0 && (
          <Item>
            <div className="mt-6 card rounded-lg p-5">
              <p className="text-sm font-medium mb-3">Mes soumissions</p>
              <div className="flex flex-wrap gap-2">
                {mine.map((m) => {
                  const s = STATUS_BADGE[m.status] ?? STATUS_BADGE.EN_ATTENTE;
                  return (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-line bg-sand-2 max-w-full"
                      title={s.label}
                    >
                      <span className="truncate font-medium">{m.title}</span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </span>
                  );
                })}
              </div>
            </div>
          </Item>
        )}

        {!isPending && items.length === 0 ? (
          <EmptyState
            icon={<ImageOff size={26} />}
            title="Aucun média pour ce filtre"
            description="Revenez bientôt : la galerie s'enrichit après chaque événement."
          />
        ) : type === "AUDIO" ? (
          <Stagger className="mt-8 grid sm:grid-cols-2 gap-4" delay={0.2}>
            {items.map((media, i) => {
              const isPlaying = playingId === media.id;
              return (
                <Item key={media.id}>
                  <div className="bg-white rounded-xl border border-line overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-4 p-4">
                      <button
                        onClick={() => setPlayingId(isPlaying ? null : media.id)}
                        aria-label={isPlaying ? "Arrêter" : "Écouter"}
                        className="w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform duration-200"
                        style={{ background: "#4a90e2" }}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">{media.title}</p>
                        <p className="text-[11px] font-mono uppercase tracking-[.12em] text-soft mt-0.5">
                          Piste {String(i + 1).padStart(2, "0")} · Enregistrement audio
                        </p>
                      </div>
                      {media.duration && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-soft flex-shrink-0">
                          <Clock size={11} /> {media.duration}
                        </span>
                      )}
                      {media.status === "EN_ATTENTE" && (
                        <Badge tone="gold" className="flex-shrink-0">En attente</Badge>
                      )}
                    </div>
                    {isPlaying && (
                      <div className="px-4 pb-4">
                        <audio
                          controls
                          autoPlay
                          preload="metadata"
                          className="w-full"
                          src={resolveUrl(media.url)}
                        />
                      </div>
                    )}
                  </div>
                </Item>
              );
            })}
          </Stagger>
        ) : (
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8" delay={0.25}>
            {items.map((media) => (
              <Item key={media.id}>
                <MediaCard media={media} onClick={() => setSelected(media)} />
              </Item>
            ))}
          </Stagger>
        )}
      </section>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        className="max-w-4xl"
      >
        <div className="rounded-lg bg-sand-2 flex items-center justify-center overflow-hidden min-h-40">
          {selected?.type === "PHOTO" && (
            selected?.thumbnailUrl || selected?.url ? (
              <img
                src={resolveUrl(selected.thumbnailUrl || selected.url)}
                alt={selected.title}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
            ) : (
              <div
                className="w-full h-64 rounded-lg"
                style={{ background: "linear-gradient(135deg,#37cdbe,#1f2937)" }}
              />
            )
          )}
          {selected?.type === "VIDEO" && selected?.url && (
            youtubeId(selected.url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId(selected.url)}`}
                title={selected.title}
                className="w-full aspect-video rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full max-h-[60vh] rounded-lg" src={resolveUrl(selected.url)} />
            )
          )}
          {selected?.type === "AUDIO" && selected?.url && (
            <div className="w-full py-10 px-6 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#4a90e2]/15 text-[#4a90e2] flex items-center justify-center">
                <AudioLines size={28} />
              </div>
              <p className="font-display text-lg text-ink mb-1">{selected.title}</p>
              <p className="text-xs font-mono uppercase tracking-[.12em] text-soft mb-6">Enregistrement audio</p>
              <audio controls className="w-full max-w-md mx-auto" src={resolveUrl(selected.url)} preload="metadata" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {selected && TYPE_CHIP[selected.type] && (() => {
            const { icon: ChipIcon, cls } = TYPE_CHIP[selected.type];
            return (
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
                <ChipIcon size={12} /> {TYPE_LABELS[selected.type]}
              </span>
            );
          })()}
          {selected?.duration && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-soft px-2.5 py-1 rounded-full border border-line">
              <Clock size={11} /> {selected.duration}
            </span>
          )}
          {selected?.status === "EN_ATTENTE" && (
            <span className="text-[11px] font-semibold text-gold-dim">En attente de validation</span>
          )}
          {selected?.type === "PHOTO" && selected?.url && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => downloadFile(selected.url, downloadName(selected))}
            >
              <Download size={14} className="mr-1.5" /> Télécharger
            </Button>
          )}
        </div>

        {selected?.description && <p className="text-sm text-soft mt-3 leading-relaxed">{selected.description}</p>}
      </Modal>

      <MediaPublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  );
}