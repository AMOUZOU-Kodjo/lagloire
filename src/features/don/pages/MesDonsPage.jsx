import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { donationsApi } from "../../../api/donations.api";
import { Card, Badge, Button, EmptyState } from "../../../components/ui";
import { formatAmount, formatDate } from "../../../lib/formatters";

const TYPE_LABEL = { OFFRANDE: "Offrande", DIME: "Dîme", PROJET: "Projet" };

export default function MesDonsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["donations", "me", "full"],
    queryFn: () => donationsApi.mine({ limit: 50 }).then((r) => r.data),
  });

  const donations = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Mes dons</h1>
        <Button as={Link} to="/don">+ Faire un don</Button>
      </div>

      {!isLoading && donations.length === 0 ? (
        <EmptyState icon="🎁" title="Aucun don enregistré" action={<Button as={Link} to="/don">Faire mon premier don</Button>} />
      ) : (
        <div className="space-y-3">
          {donations.map((d) => (
            <Card key={d.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{formatAmount(d.amount, d.currency)} · {TYPE_LABEL[d.type]}</p>
                <p className="text-xs font-mono text-soft">{d.transactionId} · {formatDate(d.createdAt)}</p>
                {d.church && <p className="text-xs text-soft">{d.church.name}</p>}
              </div>
              <Badge tone={d.status === "CONFIRME" ? "palm" : "gold"}>{d.status === "CONFIRME" ? "Confirmé" : "En attente"}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
