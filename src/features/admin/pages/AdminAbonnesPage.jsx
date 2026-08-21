import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, MailCheck, MailX, Search, UserCheck } from "lucide-react";
import { subscriptionsApi } from "../../../api/subscriptions.api";
import { queryKeys } from "../../../lib/queryKeys";
import { Badge, Button, Card, Input, PageHeader, Pagination, CardSkeleton } from "../../../components/ui";
import { formatDateShort } from "../../../lib/formatters";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

export default function AdminAbonnesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subscriptions.list({ page }),
    queryFn: () => subscriptionsApi.list({ page, limit: 20 }),
  });

  const statusMutation = useMutationFeedback({
    mutationFn: ({ id, active }) => subscriptionsApi.setStatus(id, active),
    invalidate: [queryKeys.subscriptions.all],
    successMessage: "Statut de l'abonné mis à jour.",
  });

  const items = (data?.data ?? []).filter((s) =>
    search ? `${s.email} ${s.name ?? ""}`.toLowerCase().includes(search.toLowerCase()) : true
  );
  const all = data?.data ?? [];
  const activeCount = all.filter((s) => s.active).length;

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Abonnés newsletter"
        description="Personnes qui reçoivent les emails automatiques (événements, actualités, prières, directs)."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-gold/10 text-gold-dim flex items-center justify-center flex-shrink-0">
            <Users size={20} />
          </span>
          <div>
            <p className="font-display text-2xl leading-none">{data?.pagination?.total ?? "—"}</p>
            <p className="text-xs text-soft mt-1">Total inscrits</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-palm/10 text-palm flex items-center justify-center flex-shrink-0">
            <MailCheck size={20} />
          </span>
          <div>
            <p className="font-display text-2xl leading-none">{isLoading ? "—" : activeCount}</p>
            <p className="text-xs text-soft mt-1">Actifs (reçoivent les emails)</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-brick/10 text-brick flex items-center justify-center flex-shrink-0">
            <MailX size={20} />
          </span>
          <div>
            <p className="font-display text-2xl leading-none">{isLoading ? "—" : all.length - activeCount}</p>
            <p className="text-xs text-soft mt-1">Désactivés</p>
          </div>
        </Card>
      </div>

      <div className="relative max-w-sm mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none flex">
          <Search size={16} />
        </span>
        <Input className="pl-10" placeholder="Rechercher un email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <CardSkeleton className="h-64" />
      ) : items.length === 0 ? (
        <Card className="rounded-lg p-10 text-center text-sm text-soft">Aucun abonné trouvé.</Card>
      ) : (
        <Card className="rounded-lg overflow-x-auto p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.email}</td>
                  <td>{s.name ?? "—"}</td>
                  <td><Badge tone="muted">{s.type ?? "abonné"}</Badge></td>
                  <td>
                    {s.active ? <Badge tone="palm">Actif</Badge> : <Badge tone="brick">Désactivé</Badge>}
                  </td>
                  <td className="whitespace-nowrap text-soft">{formatDateShort(s.createdAt)}</td>
                  <td className="text-right whitespace-nowrap">
                    {s.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: s.id, active: false })}
                      >
                        <UserCheck size={13} className="mr-1" /> Désactiver
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="gold"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: s.id, active: true })}
                      >
                        <MailCheck size={13} className="mr-1" /> Activer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination pagination={data?.pagination} onPageChange={setPage} />
    </div>
  );
}
