import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Mail,
  Users,
  CalendarDays,
  ArrowLeft,
  Building2,
  Globe,
} from "lucide-react";
import { churchApi } from "../../../api/church.api";
import { eventsApi } from "../../../api/events.api";
import { Card, CardSkeleton } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import EventCard from "../../evenements/components/EventCard";
import { churchCover } from "../../../lib/covers";

const ACCENT = "#37cdbe";

export default function ChurchDetailPage() {
  const { id } = useParams();

  const { data: church, isLoading, error } = useQuery({
    queryKey: ["church", id],
    queryFn: () => churchApi.getById(id).then((r) => r.data),
    enabled: Boolean(id),
  });

  const { data: events } = useQuery({
    queryKey: ["events", "church", id],
    queryFn: () => eventsApi.list({ churchId: id, limit: 6 }).then((r) => r.data),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-6">
        <CardSkeleton className="h-64" />
        <div className="grid md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink">Église introuvable</p>
        <p className="text-sm text-soft mt-2">Cette assemblée n'existe pas ou a été supprimée.</p>
        <Link to="/eglises" className="btn mt-6" style={{ background: ACCENT }}>
          <ArrowLeft size={16} className="mr-1.5" /> Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const members = church._count?.members ?? 0;
  const upcoming = (events ?? []).filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)));

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[320px] md:h-[400px] overflow-hidden">
          <img src={churchCover(church)} alt={church.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-7xl mx-auto px-6 pb-8">
              <Link to="/eglises" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[.12em] text-white/80 hover:text-white mb-4 transition-colors">
                <ArrowLeft size={14} /> Annuaire des églises
              </Link>
              <Stagger delay={0.05}>
                <Item>
                  <h1 className="font-display text-4xl md:text-5xl text-white leading-tight">{church.name}</h1>
                </Item>
                <Item>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
                    <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {church.city}, {church.country}</span>
                    <span className="inline-flex items-center gap-1.5"><Users size={15} /> {members} membre{members > 1 ? "s" : ""}</span>
                  </p>
                </Item>
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* INFOS */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {church.description && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={16} style={{ color: ACCENT }} />
                  <h2 className="font-mono text-xs uppercase tracking-[.12em] text-soft">À propos</h2>
                </div>
                <p className="text-sm leading-relaxed text-ink whitespace-pre-line">{church.description}</p>
              </Card>
            )}

            <div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[.12em]" style={{ color: ACCENT }}>Agenda</div>
                  <h2 className="font-display text-2xl text-ink mt-1">Événements de l'assemblée</h2>
                </div>
                <Link to="/evenements" className="text-sm font-semibold hover:underline" style={{ color: ACCENT }}>
                  Tout l'agenda →
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <Card className="p-8 text-center text-sm text-soft">
                  Aucun événement à venir pour le moment.
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {upcoming.slice(0, 4).map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLONNE LATÉRALE */}
          <div className="space-y-5">
            <Card className="p-6">
              <div className="font-mono text-xs uppercase tracking-[.12em] text-soft mb-4">Coordonnées</div>
              <ul className="space-y-3 text-sm">
                {church.address && (
                  <li className="flex items-start gap-2.5 text-ink">
                    <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                    <span>{church.address}</span>
                  </li>
                )}
                {church.phone && (
                  <li className="flex items-center gap-2.5 text-ink">
                    <Phone size={15} className="flex-shrink-0" style={{ color: ACCENT }} />
                    <a href={`tel:${church.phone}`} className="hover:underline">{church.phone}</a>
                  </li>
                )}
                {church.email && (
                  <li className="flex items-center gap-2.5 text-ink min-w-0">
                    <Mail size={15} className="flex-shrink-0" style={{ color: ACCENT }} />
                    <a href={`mailto:${church.email}`} className="hover:underline truncate">{church.email}</a>
                  </li>
                )}
                {!church.address && !church.phone && !church.email && (
                  <li className="text-soft italic">Aucune coordonnée renseignée.</li>
                )}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="font-mono text-xs uppercase tracking-[.12em] text-soft mb-4">En un coup d'œil</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-line p-4 text-center">
                  <Users size={18} className="mx-auto mb-1.5" style={{ color: ACCENT }} />
                  <div className="font-display text-xl text-ink">{members}</div>
                  <div className="text-xs text-soft">Membres</div>
                </div>
                <div className="rounded-lg border border-line p-4 text-center">
                  <CalendarDays size={18} className="mx-auto mb-1.5" style={{ color: ACCENT }} />
                  <div className="font-display text-xl text-ink">{upcoming.length}</div>
                  <div className="text-xs text-soft">À venir</div>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-soft">
                <Globe size={13} /> {church.city}, {church.country}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
