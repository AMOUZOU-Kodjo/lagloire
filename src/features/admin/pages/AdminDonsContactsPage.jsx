import { useQuery } from "@tanstack/react-query";
import { Wallet, MessageSquareText, CheckCheck } from "lucide-react";
import { donationsApi } from "../../../api/donations.api";
import { contactApi } from "../../../api/contact.api";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatAmount, formatRelative } from "../../../lib/formatters";
import { Badge, Button, Card, PageHeader, StatusBadge, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

export default function AdminDonsContactsPage() {
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: queryKeys.donations.list({ admin: true }),
    queryFn: () => donationsApi.all({ limit: 10 }).then((r) => r.data),
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: queryKeys.contacts.list({ admin: true }),
    queryFn: () => contactApi.list({ limit: 10 }).then((r) => r.data),
  });

  const confirmMutation = useMutationFeedback({
    mutationFn: (id) => donationsApi.confirm(id),
    invalidate: [queryKeys.donations.all],
    successMessage: "Don confirmé.",
  });

  const markReadMutation = useMutationFeedback({
    mutationFn: (id) => contactApi.markRead(id),
    invalidate: [queryKeys.contacts.all],
    successMessage: "Message marqué comme lu.",
  });

  const donationList = donations ?? [];
  const contactList = contacts ?? [];
  const unreadCount = contactList.filter((m) => !m.isRead).length;
  const pendingCount = donationList.filter((d) => d.status !== "CONFIRME").length;

  return (
    <div>
      <PageHeader
        eyebrow="Suivi"
        title="Dons & contacts"
        description="Suivez les dons récents et les demandes de contact."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg flex items-center gap-2">
              <Wallet size={18} className="text-palm" /> Dons récents
            </p>
            {pendingCount > 0 && <Badge tone="gold">{pendingCount} à confirmer</Badge>}
          </div>

          {donationsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : donationList.length === 0 ? (
            <Card className="rounded-lg p-8 text-center text-sm text-soft">Aucun don enregistré.</Card>
          ) : (
            <div className="space-y-3">
              {donationList.map((d) => {
                const donorName = d.anonymous ? "Don anonyme" : `${d.donor?.firstName ?? ""} ${d.donor?.lastName ?? ""}`.trim() || "—";
                return (
                  <Card key={d.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{donorName}</p>
                        <p className="text-xs text-soft truncate">
                          {[d.church?.name, d.paymentMethod ? label("PAYMENT_METHOD", d.paymentMethod) : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                          <span className="font-mono"> · {formatRelative(d.createdAt)}</span>
                        </p>
                      </div>
                      <p className="font-display text-lg flex-shrink-0">{formatAmount(d.amount, d.currency)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                      <StatusBadge kind="DONATION_STATUS" status={d.status} />
                      {d.status !== "CONFIRME" ? (
                        <Button size="sm" variant="outline" disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate(d.id)}>
                          <CheckCheck size={14} className="mr-1 text-palm" /> Confirmer
                        </Button>
                      ) : (
                        <span className="text-xs font-mono text-soft">{d.transactionId ?? d.reference}</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg flex items-center gap-2">
              <MessageSquareText size={18} className="text-gold-dim" /> Messages de contact
            </p>
            {unreadCount > 0 && <Badge tone="brick">{unreadCount} non lus</Badge>}
          </div>

          {contactsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : contactList.length === 0 ? (
            <Card className="rounded-lg p-8 text-center text-sm text-soft">Aucun message de contact.</Card>
          ) : (
            <div className="space-y-3">
              {contactList.map((msg) => (
                <Card key={msg.id} className={`p-4 ${!msg.isRead ? "border-l-2 !border-l-brick" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-sm truncate">
                      {msg.name}
                      <span className="text-xs font-normal text-soft"> → {msg.recipientType === "PASTEUR" ? "Pasteur" : "Apôtre / Coordination"}</span>
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {msg.email && <span className="hidden md:inline text-xs font-mono text-soft">{msg.email}</span>}
                      <Badge tone={msg.isRead ? "muted" : "brick"}>{msg.isRead ? "Lu" : "Non lu"}</Badge>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-soft mt-1">{formatRelative(msg.createdAt)}</p>
                  <p className="text-sm text-soft mt-2 line-clamp-3">« {msg.message} »</p>
                  {!msg.isRead && (
                    <div className="mt-3">
                      <Button size="sm" variant="outline" disabled={markReadMutation.isPending} onClick={() => markReadMutation.mutate(msg.id)}>
                        <CheckCheck size={14} className="mr-1 text-gold-dim" /> Marquer comme lu
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}