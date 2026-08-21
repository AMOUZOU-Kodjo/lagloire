import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, Send, Pencil, Trash2, Sunrise, CalendarClock, FileText, Clock, Sparkles } from "lucide-react";
import { morningPrayersApi } from "../../../api/morningPrayers.api";
import { queryKeys } from "../../../lib/queryKeys";
import { formatDateTime, formatRelative } from "../../../lib/formatters";
import { Badge, Button, Card, Modal, Input, Textarea, Select, FormField, PageHeader, StatusBadge, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { prayerSchema, prayerDefaultValues, PRAYER_STATUSES } from "../schemas/prayerSchema";
import { label } from "../../../lib/labels";

const STATUS_ICONS = { BROUILLON: FileText, EN_ATTENTE: Clock, PUBLIE: Sunrise };

export default function AdminPrieresPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(7);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(prayerSchema),
    defaultValues: prayerDefaultValues,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["prayers", "admin", statusFilter],
    queryFn: () =>
      morningPrayersApi
        .list({ scope: "admin", limit: 100, ...(statusFilter ? { status: statusFilter } : {}) })
        .then((r) => r.data),
  });

  useEffect(() => {
    if (modalOpen && !editing) reset(prayerDefaultValues);
  }, [modalOpen, editing, reset]);

  function openEdit(prayer) {
    setEditing(prayer);
    reset({
      title: prayer.title ?? "",
      bibleVerse: prayer.bibleVerse ?? "",
      content: prayer.content ?? "",
      status: prayer.status ?? "EN_ATTENTE",
      scheduledFor: prayer.scheduledFor ? prayer.scheduledFor.slice(0, 16) : "",
    });
    setModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  const invalidateAll = [["prayers"], queryKeys.stats.all];

  const createMutation = useMutationFeedback({
    mutationFn: (values) => morningPrayersApi.create(values),
    invalidate: invalidateAll,
    successMessage: "Prière enregistrée.",
    onSuccess: () => setModalOpen(false),
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) => morningPrayersApi.update(id, values),
    invalidate: invalidateAll,
    successMessage: "Prière mise à jour.",
    onSuccess: () => setModalOpen(false),
  });

  const publishMutation = useMutationFeedback({
    mutationFn: (id) => morningPrayersApi.update(id, { status: "PUBLIE" }),
    invalidate: invalidateAll,
    successMessage: "Prière publiée — email envoyé aux abonnés.",
  });

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => morningPrayersApi.remove(id),
    invalidate: invalidateAll,
    successMessage: "Prière supprimée.",
    onSuccess: () => setConfirmingId(null),
  });

  const generateMutation = useMutationFeedback({
    mutationFn: (count) => morningPrayersApi.generate(count),
    invalidate: invalidateAll,
    successMessage: "Prières générées et ajoutées à la file d'attente.",
    onSuccess: () => setGenerateOpen(false),
  });

  function submit(values) {
    const payload = { ...values, scheduledFor: values.scheduledFor || null };
    if (editing) updateMutation.mutate({ id: editing.id, values: payload });
    else createMutation.mutate(payload);
  }

  const prayers = data ?? [];
  const queued = prayers.filter((p) => p.status === "EN_ATTENTE").length;

  return (
    <div>
      <PageHeader
        eyebrow="Vie de l'église"
        title="Prières matinales"
        description="Préparez vos prières à l'avance : chaque jour à l'heure programmée, la plus ancienne en attente est publiée automatiquement et envoyée par email aux abonnés."
        actions={
          <>
            <Button variant="outline" disabled={generateMutation.isPending} onClick={() => setGenerateOpen(true)}>
              <Sparkles size={16} className="mr-1.5" /> Générer
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} className="mr-1.5" /> Nouvelle prière
            </Button>
          </>
        }
      />

      <Card className="rounded-lg p-4 mb-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-ink">
          <CalendarClock size={16} className="text-gold-dim" /> File d'attente :
        </span>
        <Badge tone={queued > 0 ? "gold" : "muted"}>{queued} prière(s) en attente</Badge>
        <span className="text-xs text-soft ml-auto">
          Publication automatique quotidienne · 05:00 (heure du Togo)
        </span>
      </Card>

      <div className="flex items-center gap-2 mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-48">
          <option value="">Tous les statuts</option>
          {PRAYER_STATUSES.map((s) => (
            <option key={s} value={s}>{label("PRAYER_STATUS", s)}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : prayers.length === 0 ? (
        <Card className="rounded-lg p-10 text-center text-sm text-soft">Aucune prière pour ce filtre.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayers.map((prayer) => {
            const Icon = STATUS_ICONS[prayer.status] ?? Sunrise;
            return (
              <Card key={prayer.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    prayer.status === "PUBLIE" ? "bg-palm/10 text-palm" : "bg-gold/10 text-gold-dim"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <StatusBadge kind="PRAYER_STATUS" status={prayer.status} />
                </div>
                <p className="font-medium mt-3 line-clamp-1">{prayer.title}</p>
                {prayer.bibleVerse && (
                  <p className="text-xs italic text-gold-dim mt-0.5 line-clamp-1">{prayer.bibleVerse}</p>
                )}
                <p className="text-xs text-soft mt-1.5 line-clamp-2">{prayer.content}</p>
                <p className="text-xs text-soft mt-2">
                  {prayer.status === "EN_ATTENTE" && prayer.scheduledFor ? (
                    <>Programmée : <span className="font-mono">{formatDateTime(prayer.scheduledFor)}</span></>
                  ) : prayer.publishedAt ? (
                    <>Publiée <span className="font-mono">{formatRelative(prayer.publishedAt)}</span></>
                  ) : (
                    <>Créée <span className="font-mono">{formatRelative(prayer.createdAt)}</span></>
                  )}
                </p>

                <div className="mt-auto pt-3 mt-4 border-t border-line space-y-2">
                  {prayer.status !== "PUBLIE" && (
                    <Button size="sm" className="w-full" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate(prayer.id)}>
                      <Send size={14} className="mr-1.5" /> Publier maintenant
                    </Button>
                  )}
                  {confirmingId === prayer.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-soft flex-1">Supprimer ?</span>
                      <Button size="sm" variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(prayer.id)}>
                        Oui
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Non</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => openEdit(prayer)} className="text-xs font-semibold text-gold-dim hover:underline inline-flex items-center gap-1">
                        <Pencil size={12} /> Modifier
                      </button>
                      <button onClick={() => setConfirmingId(prayer.id)} className="text-xs font-semibold text-brick hover:underline inline-flex items-center gap-1">
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Générer automatiquement">
        <div className="space-y-4">
          <p className="text-sm text-soft-dark">
            L'outil compose des prières et messages d'encouragement à partir d'une banque de versets
            bibliques et de thèmes variés, puis les place dans la file d'attente. Le planificateur
            publiera ensuite <strong>une par jour</strong> à 05h00 et enverra l'email aux abonnés.
          </p>
          <FormField label="NOMBRE À GÉNÉRER" name="count">
            <Select value={generateCount} onChange={(e) => setGenerateCount(Number(e.target.value))}>
              <option value={1}>1 entrée (pour tester)</option>
              <option value={7}>7 jours — une semaine</option>
              <option value={14}>14 jours — deux semaines</option>
              <option value={30}>30 jours — un mois</option>
            </Select>
          </FormField>
          <Button
            className="w-full"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate(generateCount)}
          >
            {generateMutation.isPending ? "Génération…" : `Générer ${generateCount} entrée(s)`}
          </Button>
        </div>
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier la prière" : "Nouvelle prière"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="TITRE" name="title" error={errors.title?.message}>
            <Input placeholder="Ex. Marcher dans la lumière" {...register("title")} />
          </FormField>
          <FormField label="VERSET" name="bibleVerse" error={errors.bibleVerse?.message}>
            <Input placeholder="Ex. Psaume 119:105" {...register("bibleVerse")} />
          </FormField>
          <FormField label="CONTENU" name="content" error={errors.content?.message}>
            <Textarea rows={5} placeholder="Texte de la prière…" {...register("content")} />
          </FormField>
          <FormField label="STATUT" name="status" error={errors.status?.message}>
            <Select {...register("status")}>
              {PRAYER_STATUSES.map((s) => (
                <option key={s} value={s}>{label("PRAYER_STATUS", s)}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="PROGRAMMER POUR LE (optionnel)" name="scheduledFor" error={errors.scheduledFor?.message}>
            <Input type="datetime-local" {...register("scheduledFor")} />
          </FormField>
          <p className="text-xs text-soft">
            « File d'attente » : publiée automatiquement le jour prévu (ou le lendemain matin si aucune date).
            « Publiée » : envoyée immédiatement par email aux abonnés.
          </p>
          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? "Enregistrement…"
              : editing
                ? "Enregistrer les modifications"
                : "Enregistrer la prière"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
