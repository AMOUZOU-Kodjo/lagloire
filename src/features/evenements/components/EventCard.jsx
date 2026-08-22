import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "../../../lib/formatters";

const TYPE_LABEL = {
  BAPTEME: "Baptême",
  CONFERENCE: "Conférence",
  JEUNE: "Jeûne",
  FORMATION: "Formation",
  CULTE: "Culte",
  MARIAGE: "Mariage",
  REUNION: "Réunion",
  AUTRE: "Autre",
};

export default function EventCard({ event }) {
  const d = event.date ? new Date(event.date) : null;
  const time = d && (d.getHours() !== 0 || d.getMinutes() !== 0) ? formatDate(event.date, "H'h'mm") : null;

  return (
    <Link
      to={`/evenements/${event.id}`}
      className="group flex h-full w-full overflow-hidden rounded-lg border border-line bg-white transition-colors duration-200 hover:border-gold/50 hover:bg-sand/40"
    >
      {/* Colonne date */}
      {d && (
        <div className="flex w-20 sm:w-24 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-line bg-sand/60 py-5">
          <span className="font-display text-3xl leading-none text-ink">{d.getDate()}</span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-gold-dim">
            {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
          </span>
          {time && <span className="mt-1 text-[10px] font-mono text-soft">{time}</span>}
        </div>
      )}

      {/* Contenu */}
      <div className="flex flex-1 flex-col justify-between gap-2 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[15px] leading-snug text-ink">{event.title}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-soft">
            {TYPE_LABEL[event.type] ?? event.type}
            {event.maxCapacity ? ` · ${event._count?.registrations ?? 0}/${event.maxCapacity} places` : ""}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-xs text-soft">
            {event.location && (
              <>
                <MapPin size={13} className="shrink-0 text-gold-dim" />
                <span className="truncate">{event.location}</span>
              </>
            )}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gold-dim transition-transform duration-200 group-hover:translate-x-0.5">
            Détails <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
