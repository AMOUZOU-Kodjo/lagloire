import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet, MessageSquareText, CheckCheck, Mail, Trash2, X,
} from "lucide-react";
import { donationsApi } from "../../../api/donations.api";
import { contactApi } from "../../../api/contact.api";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatAmount, formatRelative, formatDate } from "../../../lib/formatters";
import { Badge, Button, Card, PageHeader, StatusBadge, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

const RECIPIENT_LABEL = (t) => (t === "PASTEUR" ? "Pasteur" : "Apôtre / Coordination");

export default function AdminDonsContactsPage() {
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: queryKeys.donations.list({ admin: true }),
    refetchInterval: 30_000,
    queryFn: () => donationsApi.all({ limit: 10 }).then((r) => r.data),
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: queryKeys.contacts.list({ admin: true }),
    refetchInterval: 30_000,
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
    onSuccess: () => setSelected((s) => (s ? { ...s, isRead: true } : s)),
  });

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => contactApi.remove(id),
    invalidate: [queryKeys.contacts.all],
    successMessage: "Message supprimé.",
    onSuccess: () => {
      setSelected(null);
      setConfirmDelete(false);
    },
  });

  const donationList = donations ?? [];
  const contactList = contacts ?? [];
  const unreadCount = contactList.filter((m) => !m.isRead).length;
  const pendingCount = donationList.filter((d) => d.status !== "CONFIRME").length;

  const openMessage = (msg) => {
    setSelected(msg);
    setConfirmDelete(false);
    if (!msg.isRead) markReadMutation.mutate(msg.id);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Suivi"
        title="Dons & contacts"
        description="Suivez les dons récents et gérez les demandes de contact."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ===================== DONS ===================== */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
                const donorName =
                  d.anonymous
                    ? "Don anonyme"
                    : `${d.donor?.firstName ?? ""} ${d.donor?.lastName ?? ""}`.trim() || "—";
                return (
                  <Card key={d.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{donorName}</p>
                        <p className="text-xs text-soft break-words">
                          {[d.church?.name, d.paymentMethod ? label("PAYMENT_METHOD", d.paymentMethod) : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                        <p className="text-xs font-mono text-soft mt-0.5">{formatRelative(d.createdAt)}</p>
                      </div>
                      <p className="font-display text-lg flex-shrink-0 whitespace-nowrap">{formatAmount(d.amount, d.currency)}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-line">
                      <StatusBadge kind="DONATION_STATUS" status={d.status} />
                      {d.status !== "CONFIRME" ? (
                        <Button size="sm" variant="outline" disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate(d.id)}>
                          <CheckCheck size={14} className="mr-1 text-palm" /> Confirmer
                        </Button>
                      ) : (
                        <span className="text-xs font-mono text-soft truncate max-w-[180px]">{d.transactionId ?? d.reference}</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================== MESSAGES ===================== */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
                <Card key={msg.id} className={`p-4 cursor-pointer hover:shadow-md transition ${!msg.isRead ? "border-l-2 !border-l-brick" : ""}`}>
                  {/* Clic sur la carte = ouverture du message */}
                  <button type="button" onClick={() => openMessage(msg)} className="w-full text-left min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm min-w-0">
                        <span className="truncate inline-block max-w-full align-bottom">{msg.name}</span>
                      </p>
                      <Badge tone={msg.isRead ? "muted" : "brick"}>{msg.isRead ? "Lu" : "Non lu"}</Badge>
                    </div>
                    <p className="text-xs text-gold-dim mt-0.5">→ {RECIPIENT_LABEL(msg.recipientType)}</p>
                    <p className="text-xs font-mono text-soft mt-1">{formatRelative(msg.createdAt)}</p>
                    <p className="text-sm text-soft mt-2 line-clamp-2">« {msg.message} »</p>
                  </button>

                  {/* Actions rapides toujours accessibles */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-line">
                    {msg.email && (
                      <Button as="a" href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: votre message`)}`} size="sm" variant="outline">
                        <Mail size={14} className="mr-1 text-gold-dim" /> Répondre
                      </Button>
                    )}
                    {!msg.isRead && (
                      <Button size="sm" variant="outline" disabled={markReadMutation.isPending} onClick={() => markReadMutation.mutate(msg.id)}>
                        <CheckCheck size={14} className="mr-1 text-palm" /> Lu
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto !text-brick hover:!bg-brick/10"
                      disabled={deleteMutation.isPending}
                      onClick={() => { setSelected(msg); setConfirmDelete(true); }}
                    >
                      <Trash2 size={14} /> <span className="hidden sm:inline ml-1">Supprimer</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===================== MODALE MESSAGE ===================== */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setSelected(null); setConfirmDelete(false); }} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-white">
              <p className="font-display text-lg">Message de {selected.name}</p>
              <button
                type="button"
                onClick={() => { setSelected(null); setConfirmDelete(false); }}
                aria-label="Fermer"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-soft hover:bg-sand-2 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><dt className="text-[11px] font-mono uppercase text-soft">Email</dt><dd className="break-all">{selected.email || "—"}</dd></div>
                <div><dt className="text-[11px] font-mono uppercase text-soft">Téléphone</dt><dd>{selected.phone || "—"}</dd></div>
                <div><dt className="text-[11px] font-mono uppercase text-soft">Destinataire</dt><dd>{RECIPIENT_LABEL(selected.recipientType)}</dd></div>
                <div><dt className="text-[11px] font-mono uppercase text-soft">Reçu le</dt><dd>{formatDate(selected.createdAt, "d MMMM yyyy 'à' HH:mm")}</dd></div>
              </dl>

              <div className="bg-sand rounded-lg border-l-2 border-gold p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed">{selected.message}</p>
              </div>

              {!confirmDelete ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  {selected.email && (
                    <Button as="a" href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: votre message")}`} className="sm:flex-1">
                      <Mail size={15} className="mr-2" /> Répondre par email
                    </Button>
                  )}
                  {!selected.isRead && (
                    <Button variant="outline" disabled={markReadMutation.isPending} onClick={() => markReadMutation.mutate(selected.id)}>
                      <CheckCheck size={15} className="mr-2 text-palm" /> Marquer comme lu
                    </Button>
                  )}
                  <Button variant="ghost" className="!text-brick hover:!bg-brick/10 sm:ml-auto" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={15} className="mr-2" /> Supprimer
                  </Button>
                </div>
              ) : (
                <div className="bg-brick/10 border border-brick/25 rounded-lg p-4">
                  <p className="text-sm font-medium text-brick">Supprimer définitivement ce message ?</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="!bg-brick !border-brick" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(selected.id)}>
                      {deleteMutation.isPending ? "Suppression…" : "Oui, supprimer"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Annuler</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
