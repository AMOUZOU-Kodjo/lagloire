import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2 } from "lucide-react";
import { eventsApi } from "../../../api/events.api";
import { eventRegistrationsApi } from "../../../api/eventRegistrations.api";
import { useAuthStore } from "../../../store/authStore";
import { mockEvents } from "../../../lib/mockData";
import { queryKeys } from "../../../lib/queryKeys";
import { Card, Button, Avatar } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { formatDate } from "../../../lib/formatters";
import { eventCover } from "../../../lib/covers";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

const TYPE_LABEL = {
  BAPTEME: "Baptême", CONFERENCE: "Conférence", JEUNE: "Jeûne & prière", FORMATION: "Formation",
  CULTE: "Culte", MARIAGE: "Mariage", REUNION: "Réunion", AUTRE: "Autre",
};

const TYPE_TONE = {
  BAPTEME: "bg-brick text-white border-brick",
  CONFERENCE: "bg-gold text-ink border-gold",
  JEUNE: "bg-palm text-white border-palm",
  FORMATION: "bg-[#4a90e2] text-white border-[#4a90e2]",
  CULTE: "bg-gold text-ink border-gold",
  MARIAGE: "bg-brick text-white border-brick",
  REUNION: "bg-white/90 text-ink border-line",
  AUTRE: "bg-white/90 text-ink border-line",
};

function InfoTile({ icon: Icon, label, value }) {
  return (
    <Card className="p-5 rounded-lg flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gold/10 text-gold-dim flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] tracking-wide text-soft">{label}</span>
        <span className="block text-sm font-medium mt-0.5 break-words">{value}</span>
      </span>
    </Card>
  );
}

export default function EvenementDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);

  const { data: event } = useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsApi.getById(id).then((r) => r.data),
    placeholderData: mockEvents.find((e) => e.id === id) ?? mockEvents[0],
  });

  const registerMutation = useMutationFeedback({
    mutationFn: () => eventRegistrationsApi.register(id),
    invalidate: [queryKeys.events.detail(id)],
    successMessage: "Inscription envoyée, merci !",
  });

  if (!event) return null;

  const d = event.date ? new Date(event.date) : null;
  const filled = event._count?.registrations ?? 32;
  const capacity = event.maxCapacity ?? null;
  const percent = capacity ? Math.min(100, Math.round((filled / capacity) * 100)) : 0;
  const remaining = capacity ? Math.max(0, capacity - filled) : null;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[340px] md:h-[420px] overflow-hidden">
        <img src={eventCover(event)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-[#111827]/45 to-[#111827]/25" />

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col">
          <div className="pt-6">
            <Link
              to="/evenements"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition"
            >
              <ArrowLeft size={16} /> Tous les événements
            </Link>
          </div>

          <div className="mt-auto pb-10 flex items-end justify-between gap-6">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full border ${TYPE_TONE[event.type] ?? TYPE_TONE.AUTRE}`}
              >
                {TYPE_LABEL[event.type] ?? event.type}
              </span>
              <h1 className="font-display text-3xl md:text-5xl text-white mt-3 leading-tight [text-wrap:balance]">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-white/85 font-mono">
                {d && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} /> {formatDate(event.date, "d MMMM yyyy")}
                  </span>
                )}
                {(event.startTime || event.endTime) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} /> {event.startTime ?? "—"}{event.endTime ? ` — ${event.endTime}` : ""}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} /> {event.location}
                  </span>
                )}
              </div>
            </div>

            {d && (
              <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-white/95 backdrop-blur shadow-xl flex-col items-center justify-center flex-shrink-0">
                <span className="font-display text-3xl leading-none text-ink">{d.getDate()}</span>
                <span className="text-[11px] font-mono uppercase text-gold-dim mt-1">
                  {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <Stagger className="grid lg:grid-cols-3 gap-8 items-start" delay={0.1}>
          <Item className="lg:col-span-2 min-w-0 space-y-6">
            <Card className="p-6 md:p-8 rounded-lg">
              <h2 className="font-display text-xl mb-3">À propos de l'événement</h2>
              {event.description ? (
                <p className="text-sm leading-relaxed text-soft whitespace-pre-line">{event.description}</p>
              ) : (
                <p className="text-sm italic text-soft">
                  Le programme détaillé de cet événement sera communiqué prochainement.
                </p>
              )}
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <InfoTile icon={Calendar} label="DATE" value={d ? formatDate(event.date) : "—"} />
              <InfoTile
                icon={Clock}
                label="HORAIRE"
                value={event.startTime ? `${event.startTime}${event.endTime ? ` — ${event.endTime}` : ""}` : "À confirmer"}
              />
              <InfoTile
                icon={MapPin}
                label="LIEU"
                value={[event.location, event.address].filter(Boolean).join(", ") || "À confirmer"}
              />
            </div>

            {event.organizer && (
              <Card className="p-6 md:p-8 rounded-lg">
                <h2 className="font-display text-xl mb-4">Organisé par</h2>
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={event.organizer.firstName}
                    lastName={event.organizer.lastName}
                    src={event.organizer.profile?.avatarUrl}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {event.organizer.firstName} {event.organizer.lastName}
                    </p>
                    <p className="text-xs text-soft">Équipe ETDV</p>
                  </div>
                </div>
              </Card>
            )}
          </Item>

          <Item className="min-w-0">
            <div className="lg:sticky lg:top-6">
              <Card className="p-6 md:p-7 rounded-lg bg-sand-2 border-gold/30">
                <p className="font-display text-lg">Réserver ma place</p>

                {capacity ? (
                  <>
                    <div className="mt-4 h-2 rounded-full overflow-hidden bg-line">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs font-mono text-soft">
                      <span>{filled} sur {capacity} places prises</span>
                      <span>{percent}%</span>
                    </div>
                    {remaining !== null && remaining > 0 && remaining <= Math.ceil(capacity * 0.2) && (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brick">
                        <Users size={13} /> Plus que {remaining} place{remaining > 1 ? "s" : ""} !
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-soft">Entrée libre — aucune jauge de places.</p>
                )}

                {user ? (
                  <Button
                    className="w-full mt-5"
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending || registerMutation.isSuccess}
                  >
                    {registerMutation.isSuccess ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> Inscription envoyée
                      </span>
                    ) : registerMutation.isPending ? (
                      "Envoi…"
                    ) : (
                      "S'inscrire à l'événement"
                    )}
                  </Button>
                ) : (
                  <Button as={Link} to="/connexion" className="w-full mt-5">
                    Se connecter pour s'inscrire
                  </Button>
                )}

                <p className="text-xs mt-3 text-soft">
                  Vous recevrez un reçu numérique à présenter le jour J.
                </p>
              </Card>
            </div>
          </Item>
        </Stagger>
      </section>
    </>
  );
}