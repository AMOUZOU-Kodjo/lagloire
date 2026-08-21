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
  const time = d && (d.getHours() !== 0 || d.getMinutes() !== 0) ? formatDate(event.date, "H'h'mm") : null;
  const registrations = event._count?.registrations ?? 0;
  const capacityPct =
    event.maxCapacity ? Math.min(100, Math.round((registrations / event.maxCapacity) * 100)) : null;

  return (
    <Link
      to={`/evenements/${event.id}`}
      className="card rounded-lg overflow-hidden group w-full flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden flex-shrink-0">
        <img
          src={eventCover(event)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent" />

        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm ${TYPE_TONE[event.type] ?? TYPE_TONE.AUTRE}`}
        >
          {TYPE_LABEL[event.type] ?? event.type}
        </span>

        {d && (
          <div className="absolute -bottom-0.5 right-4 translate-y-1/2 w-14 h-14 rounded-xl bg-white shadow-lg border border-line flex flex-col items-center justify-center group-hover:border-gold/40 transition-colors duration-300">
            <span className="font-display text-xl leading-none text-ink">{d.getDate()}</span>
            <span className="text-[9px] font-mono uppercase tracking-wide text-gold-dim mt-0.5">
              {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 pt-6 flex flex-col gap-2.5 flex-1">
        <h3 className="font-semibold text-base leading-snug line-clamp-2 min-h-[2.6em]">{event.title}</h3>

        {event.description && (
          <p className="text-xs text-soft line-clamp-2 leading-relaxed">{event.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-soft mt-auto">
          {d && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} className="text-gold-dim" />
              {formatDate(event.date, "EEEE d MMMM yyyy")}{time && ` · ${time}`}
            </span>
          )}
        </div>

        {event.location && (
          <span className="inline-flex items-center gap-1.5 text-xs text-soft min-w-0">
            <MapPin size={12} className="text-gold-dim flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </span>
        )}

        <div className="mt-auto pt-3 border-t border-line flex items-center justify-between gap-3">
          {event.maxCapacity ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-soft mb-1">
                <span className="inline-flex items-center gap-1">
                  <Users size={11} className="text-gold-dim" /> {registrations}/{event.maxCapacity}
                </span>
                <span>{capacityPct >= 100 ? "Complet" : `${capacityPct}%`}</span>
              </div>
              <div className="h-1.5 rounded-full bg-sand overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${capacityPct >= 100 ? "bg-brick" : "bg-gold"}`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-soft">
              <Users size={11} className="text-gold-dim" /> Participation libre
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-dim flex-shrink-0 group-hover:gap-2 transition-all duration-300">
            Détails <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
