import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin, Clock, Users, Trash2, Pencil } from "lucide-react";
import { eventsApi } from "../../../api/events.api";
import { EVENT_TYPES } from "../../../lib/constants";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatDateTime } from "../../../lib/formatters";
import { Badge, Button, Card, Modal, Input, Textarea, Select, FormField, PageHeader, StatusBadge, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { eventSchema, eventDefaultValues } from "../schemas/eventSchema";

export default function AdminEvenementsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: eventDefaultValues,
  });

  useEffect(() => {
    if (modalOpen && !editing) reset();
  }, [modalOpen, editing, reset]);

  function openEdit(e) {
    setEditing(e);
    reset({
      title: e.title ?? "",
      description: e.description ?? "",
      date: e.date ? String(e.date).slice(0, 10) : "",
      startTime: e.startTime ?? "",
      endTime: e.endTime ?? "",
      location: e.location ?? "",
      type: e.type ?? "CULTE",
      maxCapacity: e.maxCapacity ?? "",
    });
    setModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.events.list({ admin: true }),
    queryFn: () => eventsApi.list({ limit: 50 }).then((r) => r.data),
  });

  const createMutation = useMutationFeedback({
    mutationFn: (values) =>
      eventsApi.create({
        ...values,
        maxCapacity: values.maxCapacity === "" ? undefined : Number(values.maxCapacity),
      }),
    invalidate: [queryKeys.events.all],
    successMessage: "Événement publié.",
    onSuccess: () => setModalOpen(false),
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) =>
      eventsApi.update(id, {
        ...values,
        maxCapacity: values.maxCapacity === "" ? null : Number(values.maxCapacity),
      }),
    invalidate: [queryKeys.events.all],
    successMessage: "Événement mis à jour.",
    onSuccess: () => setModalOpen(false),
  });

  function submit(values) {
    if (editing) updateMutation.mutate({ id: editing.id, values });
    else createMutation.mutate(values);
  }

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => eventsApi.remove(id),
    invalidate: [queryKeys.events.all],
    successMessage: "Événement supprimé.",
    onSuccess: () => setConfirmingId(null),
  });

  const events = data ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Événements"
        description="Publiez et gérez les événements de la communauté."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5" /> Nouvel événement
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : events.length === 0 ? (
        <Card className="rounded-lg p-10 text-center text-sm text-soft">Aucun événement publié pour le moment.</Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((e) => {
            const d = e.date ? new Date(e.date) : null;
            const isConfirming = confirmingId === e.id;
            return (
              <Card key={e.id} className="p-5 flex gap-4">
                {d && (
                  <div className="w-14 h-16 rounded-lg bg-gold/10 text-gold-dim flex flex-col items-center justify-center flex-shrink-0">
                    <span className="font-display text-xl leading-none">{d.getDate()}</span>
                    <span className="text-[10px] font-mono uppercase mt-0.5">{d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium truncate">{e.title}</p>
                    <Badge tone="gold" className="flex-shrink-0">{label("EVENT", e.type)}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-soft">
                    {e.date && <span className="flex items-center gap-1 font-mono"><Clock size={12} /> {formatDateTime(e.date)}</span>}
                    {e.location && <span className="flex items-center gap-1 truncate"><MapPin size={12} /> {e.location}</span>}
                    {e.maxCapacity > 0 && <span className="flex items-center gap-1"><Users size={12} /> {e.maxCapacity} places</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                    <StatusBadge kind="EVENT_STATUS" status={e.status} />
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-soft">Confirmer ?</span>
                        <Button size="sm" variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(e.id)}>
                          Oui, supprimer
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Annuler</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(e)} className="text-xs font-semibold text-gold-dim hover:underline inline-flex items-center gap-1">
                          <Pencil size={13} /> Modifier
                        </button>
                        <button onClick={() => setConfirmingId(e.id)} className="text-xs font-semibold text-brick hover:underline inline-flex items-center gap-1">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'événement" : "Nouvel événement"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="TITRE" name="title" error={errors.title?.message}>
            <Input placeholder="Titre" {...register("title")} />
          </FormField>
          <FormField label="DESCRIPTION" name="description" error={errors.description?.message}>
            <Textarea placeholder="Description" rows={3} {...register("description")} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="DATE" name="date" error={errors.date?.message}>
              <Input type="date" {...register("date")} />
            </FormField>
            <FormField label="TYPE" name="type" error={errors.type?.message}>
              <Select {...register("type")}>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{label("EVENT", t)}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="HEURE DE DÉBUT" name="startTime" error={errors.startTime?.message}>
              <Input placeholder="Ex. 09:00" {...register("startTime")} />
            </FormField>
            <FormField label="HEURE DE FIN" name="endTime" error={errors.endTime?.message}>
              <Input placeholder="Ex. 11:00" {...register("endTime")} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="LIEU" name="location" error={errors.location?.message}>
              <Input placeholder="Lieu" {...register("location")} />
            </FormField>
            <FormField label="CAPACITÉ MAXIMUM" name="maxCapacity" error={errors.maxCapacity?.message}>
              <Input type="number" placeholder="Optionnel" {...register("maxCapacity")} />
            </FormField>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? "Enregistrement…"
              : editing
                ? "Enregistrer les modifications"
                : "Publier l'événement"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}