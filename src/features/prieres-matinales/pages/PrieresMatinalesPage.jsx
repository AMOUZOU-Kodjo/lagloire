import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, ChevronRight, Quote, Sparkles } from "lucide-react";
import { morningPrayersApi } from "../../../api/morningPrayers.api";
import { Card, Badge, Button, Avatar, ArcBadge, PageHero, Modal, EmptyState } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { formatDate } from "../../../lib/formatters";
import { ROLE_LABELS } from "../../../lib/constants";

// NOTE : le backend actuel ne trace pas la lecture des prières matinales (contrairement aux
// posts via PostRead). En attendant l'ajout d'un modèle équivalent côté API, la lecture est
// suivie localement afin de proposer l'expérience d'assiduité prévue dans les maquettes.
const READ_KEY = "etdv:morning-prayers-read";

function getReadIds() {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY)) ?? [];
  } catch {
    return [];
  }
}

function markReadLocally(id) {
  const ids = new Set(getReadIds());
  ids.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export default function PrieresMatinalesPage() {
  const [readIds, setReadIds] = useState(getReadIds());
  const [openPrayer, setOpenPrayer] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["morning-prayers"],
    queryFn: () => morningPrayersApi.list({ limit: 10 }).then((r) => r.data),
  });

  const prayers = data ?? [];
  const [today, ...previous] = prayers;
  const readCount = previous.filter((p) => readIds.includes(p.id)).length;
  const percent = previous.length ? Math.round((readCount / previous.length) * 100) : 0;

  function handleMarkRead(id) {
    markReadLocally(id);
    setReadIds(getReadIds());
  }

  function openAndMark(prayer) {
    setOpenPrayer(prayer);
    if (!readIds.includes(prayer.id)) handleMarkRead(prayer.id);
  }

  return (
    <>
      <PageHero
        eyebrow="Rituel du matin"
        title="Prières matinales"
        description="Chaque matin, un responsable partage une pensée, un verset et une prière pour commencer la journée."
      />

      <section className="max-w-7xl mx-auto px-6 -mt-12 relative pb-16">
        {/* Assiduité */}
        <Item>
          <Card className="p-5 flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 min-w-0">
              <ArcBadge percent={percent} />
              <div className="min-w-0">
                <p className="text-sm font-medium">Votre assiduité récente</p>
                <p className="text-xs text-soft">
                  {readCount} prière{readCount > 1 ? "s" : ""} lue{readCount > 1 ? "s" : ""} sur {previous.length}
                  {percent === 100 && previous.length > 0 && " — parfait, continuez ainsi !"}
                </p>
              </div>
            </div>
            <Badge tone="gold" className="inline-flex items-center gap-1.5">
              <Sparkles size={12} /> Rituel quotidien
            </Badge>
          </Card>
        </Item>

        {/* Prière du jour */}
        {today && (
          <Item delay={0.05}>
            <Card className="p-7 md:p-10 rounded-lg relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide bg-gold text-ink px-3 py-1.5 rounded-full font-semibold">
                    <Sparkles size={12} /> Prière du jour
                  </span>
                  <span className="font-mono text-xs text-soft">{formatDate(today.createdAt)}</span>
                </div>

                <h2 className="font-display text-2xl md:text-3xl mt-5 leading-tight [text-wrap:balance]">{today.title}</h2>

                {today.content && (
                  <p className="text-sm md:text-[15px] mt-4 leading-relaxed text-soft max-w-3xl">{today.content}</p>
                )}

                {today.bibleVerse && (
                  <blockquote className="mt-6 border-l-2 border-gold pl-4 py-1 flex items-start gap-3 max-w-2xl">
                    <BookOpen size={18} className="text-gold-dim flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-sm text-gold-dim font-semibold">{today.bibleVerse}</p>
                      <p className="text-xs text-soft mt-0.5">Verset à méditer dans la journée</p>
                    </div>
                  </blockquote>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-line">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      firstName={today.author?.firstName}
                      lastName={today.author?.lastName}
                      src={today.author?.profile?.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium truncate">
                        {today.author?.firstName} {today.author?.lastName}
                      </p>
                      <p className="text-xs text-soft">{ROLE_LABELS[today.author?.role] ?? "Responsable"}</p>
                    </div>
                  </div>
                  <Button
                    variant={readIds.includes(today.id) ? "outline" : undefined}
                    onClick={() => handleMarkRead(today.id)}
                    disabled={readIds.includes(today.id)}
                  >
                    {readIds.includes(today.id) ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-palm" /> Lue
                      </span>
                    ) : (
                      "Marquer comme lue"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </Item>
        )}

        {/* Prières précédentes */}
        {previous.length > 0 && (
          <>
            <h3 className="font-display text-xl mt-12 mb-5">Prières précédentes</h3>
            <Stagger className="grid md:grid-cols-2 gap-4" delay={0.1}>
              {previous.map((prayer) => {
                const isRead = readIds.includes(prayer.id);
                return (
                  <Item key={prayer.id}>
                    <button
                      onClick={() => openAndMark(prayer)}
                      className={`card rounded-lg p-5 w-full text-left group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ${isRead ? "opacity-80" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm leading-snug line-clamp-2 flex items-center gap-2">
                            {!isRead && <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" aria-hidden />}
                            {prayer.title}
                          </p>
                          <p className="text-xs font-mono mt-2 text-soft">
                            {formatDate(prayer.createdAt)} · {prayer.author?.firstName} {prayer.author?.lastName}
                          </p>
                          {prayer.bibleVerse && (
                            <p className="text-xs text-gold-dim font-mono mt-1.5 inline-flex items-center gap-1">
                              <Quote size={10} /> {prayer.bibleVerse}
                            </p>
                          )}
                        </div>
                        <span className="flex-shrink-0 mt-0.5">
                          {isRead ? (
                            <CheckCircle2 size={18} className="text-palm" />
                          ) : (
                            <ChevronRight size={18} className="text-soft group-hover:text-gold-dim group-hover:translate-x-0.5 transition-all" />
                          )}
                        </span>
                      </div>
                    </button>
                  </Item>
                );
              })}
            </Stagger>
          </>
        )}

        {!isLoading && prayers.length === 0 && (
          <EmptyState icon="🌅" title="Aucune prière pour le moment" description="Revenez demain matin pour une nouvelle pensée." />
        )}
      </section>

      {/* Lecture complète */}
      <Modal open={!!openPrayer} onClose={() => setOpenPrayer(null)} title={openPrayer?.title}>
        {openPrayer && (
          <div className="space-y-5">
            <p className="text-xs font-mono text-soft">
              {formatDate(openPrayer.createdAt)} · {openPrayer.author?.firstName} {openPrayer.author?.lastName}
              {openPrayer.author?.role ? ` — ${ROLE_LABELS[openPrayer.author.role] ?? ""}` : ""}
            </p>
            {openPrayer.content && <p className="text-sm leading-relaxed whitespace-pre-line">{openPrayer.content}</p>}
            {openPrayer.bibleVerse && (
              <blockquote className="border-l-2 border-gold pl-4 py-1 flex items-start gap-3 bg-sand-2 p-4 rounded-r-md">
                <BookOpen size={16} className="text-gold-dim flex-shrink-0 mt-0.5" />
                <p className="font-mono text-sm text-gold-dim font-semibold">{openPrayer.bibleVerse}</p>
              </blockquote>
            )}
            <Button className="w-full" onClick={() => setOpenPrayer(null)}>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Amen — terminer la lecture
              </span>
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}