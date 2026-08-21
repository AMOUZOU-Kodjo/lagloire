import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { programsApi } from "../../../api/programs.api";
import { eventRegistrationsApi } from "../../../api/eventRegistrations.api";
import { donationsApi } from "../../../api/donations.api";
import { chatApi } from "../../../api/chat.api";
import { Card, Badge, Button, ArcBadge } from "../../../components/ui";
import { formatAmount } from "../../../lib/formatters";

const REGISTRATION_TONE = { VALIDE: "palm", EN_ATTENTE: "gold", ANNULE: "brick" };
const REGISTRATION_LABEL = { VALIDE: "Validée", EN_ATTENTE: "En attente", ANNULE: "Annulée" };

export default function DashboardMembrePage() {
  const { data: dailyVerse } = useQuery({
    queryKey: ["daily-verse"],
    queryFn: () => programsApi.dailyVerse().then((r) => r.data),
  });

  const { data: registrations } = useQuery({
    queryKey: ["registrations", "me"],
    queryFn: () => eventRegistrationsApi.myRegistrations().then((r) => r.data),
  });

  const { data: donations } = useQuery({
    queryKey: ["donations", "me", "dashboard"],
    queryFn: () => donationsApi.mine({ limit: 5 }).then((r) => r.data),
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.myConversations().then((r) => r.data),
  });

  const monthTotal = (donations ?? []).reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {dailyVerse && (
        <Card className="lg:col-span-2 p-7 dawn-arc bg-sand-2">
          <div className="dawn-arc-line small" />
          <div className="relative z-10">
            <Badge tone="gold">Prière du jour</Badge>
            <p className="font-display text-2xl mt-4 text-ink">{dailyVerse.title}</p>
            {dailyVerse.bibleVerse && <p className="text-sm mt-2 text-soft">« {dailyVerse.content} » — {dailyVerse.bibleVerse}</p>}
            <Button as={Link} to="/prieres-matinales" className="mt-5">Lire la prière complète</Button>
          </div>
        </Card>
      )}

      <Card className="p-6 flex flex-col items-center justify-center text-center">
        <div className="scale-150">
          <ArcBadge percent={78} />
        </div>
        <p className="text-sm font-medium mt-6">Assiduité — prières matinales</p>
        <p className="text-xs mt-1 text-soft">🔥 6 jours de suite</p>
      </Card>

      <Card className="p-6">
        <p className="font-display text-lg mb-4">Mes inscriptions</p>
        {(registrations ?? []).length === 0 ? (
          <p className="text-sm text-soft">Aucune inscription pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {registrations.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.event?.title}</span>
                <Badge tone={REGISTRATION_TONE[r.status]}>{REGISTRATION_LABEL[r.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <p className="font-display text-lg mb-4">Mes dons ce mois</p>
        <p className="font-display text-3xl">{formatAmount(monthTotal)}</p>
        <p className="text-xs mt-1 text-soft">{(donations ?? []).length} dons enregistrés</p>
        <Link to="/don" className="text-xs font-semibold mt-3 inline-block text-gold-dim">Faire un nouveau don →</Link>
      </Card>

      <Card className="p-6">
        <p className="font-display text-lg mb-4">Messages récents</p>
        {(conversations ?? []).length === 0 ? (
          <p className="text-sm text-soft">Aucune conversation.</p>
        ) : (
          <div className="space-y-3 text-sm">
            {conversations.slice(0, 2).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#37cdbe,#4a90e2)" }} />
                <p className="truncate">{c.messages?.[0]?.content ?? "Nouvelle conversation"}</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/app/messagerie" className="text-xs font-semibold mt-3 inline-block text-gold-dim">Voir la messagerie →</Link>
      </Card>
    </div>
  );
}
