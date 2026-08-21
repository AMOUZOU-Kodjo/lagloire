import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarRange, CalendarClock, CalendarCheck, MapPin, Clock } from "lucide-react";
import { programsApi } from "../../../api/programs.api";
import { Card, Badge, EmptyState, PageHero, CardSkeleton } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { formatDate } from "../../../lib/formatters";

const TABS = [
  { value: "JOURNALIER", label: "Journalier", icon: CalendarDays },
  { value: "HEBDOMADAIRE", label: "Hebdomadaire", icon: CalendarRange },
  { value: "MENSUEL", label: "Mensuel", icon: CalendarClock },
  { value: "ANNUEL", label: "Annuel", icon: CalendarCheck },
];

const TAB_DESCRIPTIONS = {
  JOURNALIER: "Les rendez-vous de chaque jour pour nourrir votre foi.",
  HEBDOMADAIRE: "Les rendez-vous qui rythment la semaine de la communauté.",
  MENSUEL: "Les grands rendez-vous du mois à ne pas manquer.",
  ANNUEL: "Les événements marquants de l'année au sein de la communauté.",
};

const TONE = { JOURNALIER: "gold", HEBDOMADAIRE: "palm", MENSUEL: "muted", ANNUEL: "brick" };

function getStatus(program) {
  const now = new Date();
  const start = new Date(program.startDate);
  const end = program.endDate ? new Date(program.endDate) : null;
  if (end && end < now) return { label: "Terminé", dot: "bg-line", text: "text-soft" };
  if (start > now) return { label: "À venir", dot: "bg-palm", text: "text-palm" };
  return { label: "En cours", dot: "bg-gold", text: "text-gold-dim" };
}

function ProgramCard({ program }) {
  const status = getStatus(program);
  const typeLabel = TABS.find((t) => t.value === program.type)?.label ?? program.type;
  const range = program.endDate
    ? `${formatDate(program.startDate, "d MMM yyyy")} — ${formatDate(program.endDate, "d MMM yyyy")}`
    : formatDate(program.startDate, "d MMM yyyy");

  return (
    <Card className="p-5 flex items-start gap-4 transition-all duration-300 hover:border-gold/40 hover:shadow-card">
      <div className="flex flex-col items-center justify-center w-16 shrink-0 rounded-lg bg-gold/10 border border-gold/20 py-2">
        <span className="font-display text-xl text-gold leading-none">{formatDate(program.startDate, "d")}</span>
        <span className="text-[10px] uppercase tracking-wide text-soft mt-1">{formatDate(program.startDate, "MMM")}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-ink">{program.title}</h3>
          <Badge tone={TONE[program.type] ?? "muted"}>{typeLabel}</Badge>
        </div>
        {program.description && (
          <p className="text-sm text-soft mt-1.5 line-clamp-2 leading-relaxed">{program.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-soft">
          {program.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              {program.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold" />
            {range}
          </span>
          <span className={`inline-flex items-center gap-1.5 ${status.text}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function ProgrammePage() {
  const [active, setActive] = useState("JOURNALIER");

  const { data, isLoading } = useQuery({
    queryKey: ["programs", active],
    queryFn: () => programsApi.list({ type: active, isActive: true }).then((r) => r.data),
  });

  const programs = data ?? [];
  const activeTab = TABS.find((t) => t.value === active);

  return (
    <>
      <PageHero
        eyebrow="Rythme de la communauté"
        title="Programme"
        description="Les cultes, enseignements et rencontres qui rythment la vie de la communauté, jour après jour."
      />

      <section className="max-w-7xl mx-auto px-6 -mt-12 relative pb-16">
        <Item>
          <Card className="p-5 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActive(tab.value)}
                    className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                      isActive
                        ? "text-[#37cdbe] bg-[#37cdbe]/10 font-medium"
                        : "text-[#4b5563] hover:text-[#37cdbe] hover:bg-[#37cdbe]/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-soft mt-4">{TAB_DESCRIPTIONS[active]}</p>
          </Card>
        </Item>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : programs.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title={`Aucun programme ${activeTab?.label.toLowerCase()}`}
            description="Aucun programme n'est publié pour cette période pour le moment. Revenez bientôt."
          />
        ) : (
          <Stagger className="grid md:grid-cols-2 gap-5" delay={0.15}>
            {programs.map((program) => (
              <Item key={program.id}><ProgramCard program={program} /></Item>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}