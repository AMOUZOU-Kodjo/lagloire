import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Radio, CalendarClock, Play } from "lucide-react";
import { liveStreamApi } from "../../../api/liveStream.api";
import { queryKeys } from "../../../lib/queryKeys";
import { EmptyState, CardSkeleton } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import LiveChat from "../components/LiveChat";
import { formatDateTime } from "../../../lib/formatters";

/** URL intégrable : YouTube (id ou lien collé) → embed ; sinon l'URL telle quelle. */
function toEmbedUrl(stream) {
  if (!stream) return null;
  if (stream.type === "YOUTUBE" && stream.youtubeVideoId)
    return `https://www.youtube.com/embed/${stream.youtubeVideoId}`;
  const url = stream.embedUrl || stream.streamUrl;
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}

const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export default function DirectPage() {
  const { id } = useParams();

  const { data: live, isLoading } = useQuery({
    queryKey: id ? queryKeys.live.detail(id) : queryKeys.live.current,
    queryFn: () =>
      (id ? liveStreamApi.getById(id) : liveStreamApi.current()).then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: replays } = useQuery({
    queryKey: queryKeys.live.list({ status: "TERMINE", limit: 8 }),
    queryFn: () => liveStreamApi.list({ status: "TERMINE", limit: 8 }).then((r) => r.data),
  });

  const isLive = live?.status === "EN_DIRECT";
  const embedUrl = toEmbedUrl(live);

  if (isLoading) {
    return (
      <div className="bg-sand min-h-screen">
        <nav className="max-w-7xl mx-auto px-6 py-5">
          <Link to="/" className="text-sm text-soft-dark">← Retour au site</Link>
        </nav>
        <div className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-[1fr_360px] gap-6">
          <CardSkeleton className="aspect-video rounded-lg" />
          <CardSkeleton className="h-[560px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="bg-sand min-h-screen">
        <nav className="max-w-7xl mx-auto px-6 py-5">
          <Link to="/" className="text-sm text-soft-dark">← Retour au site</Link>
        </nav>
        <div className="max-w-3xl mx-auto px-6 pb-10">
          <EmptyState
            icon="📡"
            title="Aucun direct en ce moment"
            description="Revenez lors du prochain culte — vous serez informés par email si vous êtes abonné à la newsletter."
            action={<Link to="/" className="text-sm font-semibold text-gold-dim">Retour à l'accueil →</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sand min-h-screen">
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-sm text-soft-dark">← Retour au site</Link>
        {!isLive && (
          <Link to="/direct" className="text-sm font-semibold text-gold-dim">Voir le direct en cours →</Link>
        )}
      </nav>

      <section className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <Stagger delay={0.1}>
          <Item>
            <div>
              <div className="rounded-lg overflow-hidden aspect-video relative bg-ink">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={live.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: "linear-gradient(135deg,#1f2937,#4a90e2)" }}>
                    {isLive && (
                      <span className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-brick">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        EN DIRECT
                      </span>
                    )}
                    <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play size={26} className="text-ink ml-1" fill="currentColor" />
                    </span>
                    <p className="text-white/80 text-sm px-6 text-center">
                      Le flux vidéo n'est pas encore disponible — la diffusion va commencer.
                    </p>
                  </div>
                )}
              </div>

              <h1 className="font-display text-2xl mt-5 text-ink">{live.title}</h1>
              <p className="text-sm mt-1 text-soft-dark">
                {live.startedAt ? `Diffusion démarrée le ${formatDateTime(live.startedAt)}` : "Diffusion à venir"}
                {live.author ? ` · ${live.author.firstName} ${live.author.lastName}` : ""}
                {live.endedAt ? ` · Terminé le ${formatDateTime(live.endedAt)}` : ""}
              </p>
            </div>
          </Item>

          {(replays?.length ?? 0) > 0 && (
            <Item delay={0.15}>
              <div className="mt-10">
                <h2 className="font-display text-lg text-ink mb-4">Rediffusions récentes</h2>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {replays
                    .filter((r) => r.id !== live.id)
                    .map((r) => (
                      <Link key={r.id} to={`/direct/${r.id}`} className="card rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="aspect-video relative bg-ink overflow-hidden">
                          {r.youtubeVideoId ? (
                            <img src={ytThumb(r.youtubeVideoId)} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/60"><Play size={28} /></div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-ink line-clamp-1">{r.title}</p>
                          <p className="text-xs text-soft mt-1 flex items-center gap-1.5">
                            <CalendarClock size={12} /> {r.startedAt ? formatDateTime(r.startedAt) : "—"}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </Item>
          )}
        </Stagger>

        {isLive ? (
          <LiveChat roomId={`live:${live.id}`} />
        ) : (
          <div className="card rounded-lg p-6 text-sm text-soft-dark lg:sticky lg:top-6">
            <p className="flex items-center gap-2 font-semibold text-ink mb-2">
              <Radio size={16} className="text-gold-dim" /> Chat du direct
            </p>
            La discussion s'ouvre automatiquement dès le début de la diffusion.
          </div>
        )}
      </section>
    </div>
  );
}
