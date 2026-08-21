import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../../../api/events.api";
import { EVENT_TYPES } from "../../../lib/constants";
import { Pagination, CardSkeleton, EmptyState, PageHero } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import EventCard from "../components/EventCard";

const TYPE_LABEL = {
  CULTE: "Cultes", CONFERENCE: "Conférences", REUNION: "Réunions", BAPTEME: "Baptêmes",
  MARIAGE: "Mariages", JEUNE: "Jeûne & prière", FORMATION: "Formations", AUTRE: "Autres",
};

export default function EvenementsPage() {
  const [type, setType] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["events", { type, page }],
    queryFn: () => eventsApi.list({ type: type || undefined, page, limit: 9 }).then((r) => r),
  });

  const events = data?.data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Agenda de la communauté"
        title="Événements"
        description="Les cultes, conférences, baptêmes et rencontres qui rythment la vie de la communauté."
      />

      <section className="max-w-7xl mx-auto px-6 py-10">
        <Item>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setType(null)}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                !type
                  ? "text-[#37cdbe] bg-[#37cdbe]/10 font-medium"
                  : "text-[#4b5563] hover:text-[#37cdbe] hover:bg-[#37cdbe]/10"
              }`}
            >
              Tous
            </button>
            {EVENT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  type === t
                    ? "text-[#37cdbe] bg-[#37cdbe]/10 font-medium"
                    : "text-[#4b5563] hover:text-[#37cdbe] hover:bg-[#37cdbe]/10"
                }`}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </Item>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : events.length === 0 ? (
          <EmptyState icon="📅" title="Aucun événement" description="Il n'y a pas d'événement correspondant à ce filtre pour le moment." />
        ) : (
          <Stagger className="grid md:grid-cols-3 gap-6" delay={0.15}>
            {events.map((event) => (
              <Item key={event.id}><EventCard event={event} index={events.indexOf(event)} /></Item>
            ))}
          </Stagger>
        )}

        <Pagination pagination={data?.pagination} onPageChange={setPage} />
      </section>
    </>
  );
}
