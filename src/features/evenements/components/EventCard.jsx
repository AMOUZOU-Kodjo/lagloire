import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { formatDate } from "../../../lib/formatters";
import { eventCover } from "../../../lib/covers";

const TYPE_TONE = {
  BAPTEME: "bg-brick/10 text-brick border-brick/25",
  CONFERENCE: "bg-gold/10 text-gold-dim border-gold/25",
  JEUNE: "bg-palm/10 text-palm border-palm/25",
  FORMATION: "bg-[#4a90e2]/10 text-[#2f6bb3] border-[#4a90e2]/25",
  CULTE: "bg-gold/10 text-gold-dim border-gold/25",
  MARIAGE: "bg-brick/10 text-brick border-brick/25",
  REUNION: "bg-sand-2 text-soft border-line",
  AUTRE: "bg-sand-2 text-soft border-line",
};

const TYPE_LABEL = {
  BAPTEME: "Baptême",
  CONFERENCE: "Conférence",
  JEUNE: "Jeûne & prière",
  FORMATION: "Formation",
  CULTE: "Culte",
  MARIAGE: "Mariage",
  REUNION: "Réunion",
  AUTRE: "Autre",
};

export default function EventCard({ event }) {
  const d = event.date ? new Date(event.date) : null;

  return (
    <Link
      to={`/evenements/${event.id}`}
      className="card rounded-lg overflow-hidden group w-full flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        <img
          src={eventCover(event)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300" />

        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full border shadow-sm ${TYPE_TONE[event.type] ?? TYPE_TONE.AUTRE}`}
        >
          {TYPE_LABEL[event.type] ?? event.type}
        </span>

        {d && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-white/95 shadow-lg flex flex-col items-center justify-center">
              <span className="font-display text-2xl leading-none text-ink">{d.getDate()}</span>
              <span className="text-[10px] font-mono uppercase text-gold-dim mt-0.5">
                {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2">{event.title}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-soft">
          {d && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} className="text-gold-dim" /> {formatDate(event.date, "d MMM yyyy")}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin size={11} className="text-gold-dim flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-line flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-soft min-w-0">
            <Users size={11} className="text-gold-dim flex-shrink-0" />
            <span className="truncate">
              {event.maxCapacity
                ? `${event._count?.registrations ?? 0}/${event.maxCapacity} inscrits`
                : "Places libres"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
            Détails <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}