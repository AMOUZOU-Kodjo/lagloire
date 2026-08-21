import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin, Calendar, Trash2, Pencil } from "lucide-react";
import { programsApi } from "../../../api/programs.api";
import { PROGRAM_TYPES } from "../../../lib/constants";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatDate } from "../../../lib/formatters";
import { Badge, Button, Card, Modal, Input, Textarea, Select, FormField, PageHeader, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { programSchema, programDefaultValues, WEEKDAYS } from "../schemas/programSchema";

const TYPE_TONES = {
  ANNUEL: "gold",
  MENSUEL: "palm",
  HEBDOMADAIRE: "brick",
  JOURNALIER: "muted",
};

export default function AdminProgrammesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(programSchema),
    defaultValues: programDefaultValues,
  });

  useEffect(() => {
    if (modalOpen && !editing) reset();
  }, [modalOpen, editing, reset]);

  function openEdit(p) {
    setEditing(p);
    reset({
      title: p.title ?? "",
      description: p.description ?? "",
      type: p.type ?? "HEBDOMADAIRE",
      startDate: p.startDate ? String(p.startDate).slice(0, 10) : "",
      endDate: p.endDate ? String(p.endDate).slice(0, 10) : "",
      location: p.location ?? "",
      dayOfWeek: p.dayOfWeek === null || p.dayOfWeek === undefined ? "" : String(p.dayOfWeek),
      startTime: p.startTime ?? "",
      endTime: p.endTime ?? "",
    });
    setModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.programs.list({ admin: true }),
    queryFn: () => programsApi.list({ limit: 50 }).then((r) => r.data),
  });

  const createMutation = useMutationFeedback({
    mutationFn: (values) => programsApi.create(values),
    invalidate: [queryKeys.programs.all],
    successMessage: "Programme publié.",
    onSuccess: () => setModalOpen(false),
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) => programsApi.update(id, values),
    invalidate: [queryKeys.programs.all],
    successMessage: "Programme mis à jour.",
    onSuccess: () => setModalOpen(false),
  });

  function submit(values) {
    if (editing) updateMutation.mutate({ id: editing.id, values });
    else createMutation.mutate(values);
  }

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => programsApi.remove(id),
    invalidate: [queryKeys.programs.all],
    successMessage: "Programme supprimé.",
    onSuccess: () => setConfirmingId(null),
  });

  const programs = data ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Vie de l'église"
        title="Programmes"
        description="Publiez les programmes de la communauté."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5" /> Nouveau programme
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : programs.length === 0 ? (
        <Card className="rounded-lg p-10 text-center text-sm text-soft">Aucun programme publié pour le moment.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((p) => {
            const isConfirming = confirmingId === p.id;
            return (
              <Card key={p.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium truncate">{p.title}</p>
                  <Badge tone={TYPE_TONES[p.type] ?? "muted"} className="flex-shrink-0">{label("PROGRAM_TYPE", p.type)}</Badge>
                </div>
                <div className="space-y-1.5 mt-3 text-xs text-soft">
                  {p.dayOfWeek !== null && p.dayOfWeek !== undefined ? (
                    <p className="flex items-center gap-1.5 font-medium text-gold-dim">
                      <Calendar size={12} className="flex-shrink-0" />
                      Chaque {WEEKDAYS.find((d) => d.value === String(p.dayOfWeek))?.label ?? "?"}
                      {p.startTime && ` · ${p.startTime}${p.endTime ? ` – ${p.endTime}` : ""}`}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 font-mono">
                      <Calendar size={12} className="flex-shrink-0" />
                      {formatDate(p.startDate)}{p.endDate ? ` → ${formatDate(p.endDate)}` : ""}
                    </p>
                  )}
                  {p.location && (
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="flex-shrink-0" /> {p.location}
                    </p>
                  )}
                </div>
                {p.description && <p className="text-xs text-soft mt-3 line-clamp-2">{p.description}</p>}
                <div className="mt-auto pt-3 mt-4 border-t border-line">
                  {isConfirming ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-soft">Confirmer ?</span>
                      <Button size="sm" variant="danger" className="flex-1" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(p.id)}>
                        Oui, supprimer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(p)} className="text-xs font-semibold text-gold-dim hover:underline inline-flex items-center gap-1">
                        <Pencil size={13} /> Modifier
                      </button>
                      <button onClick={() => setConfirmingId(p.id)} className="text-xs font-semibold text-brick hover:underline inline-flex items-center gap-1">
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier le programme" : "Nouveau programme"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="TITRE" name="title" error={errors.title?.message}>
            <Input placeholder="Titre" {...register("title")} />
          </FormField>
          <FormField label="DESCRIPTION" name="description" error={errors.description?.message}>
            <Textarea placeholder="Description" rows={3} {...register("description")} />
          </FormField>
          <FormField label="TYPE" name="type" error={errors.type?.message}>
            <Select {...register("type")}>
              {PROGRAM_TYPES.map((t) => <option key={t} value={t}>{label("PROGRAM_TYPE", t)}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="DATE DE DÉBUT" name="startDate" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </FormField>
            <FormField label="DATE DE FIN" name="endDate" error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </FormField>
          </div>
          <div className="rounded-lg border border-line bg-sand/60 p-3.5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-soft">
              Répétition hebdomadaire — optionnel
            </p>
            <FormField label="JOUR" name="dayOfWeek">
              <Select {...register("dayOfWeek")}>
                <option value="">Aucune (programme ponctuel)</option>
                {WEEKDAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="HEURE DE DÉBUT" name="startTime">
                <Input type="time" {...register("startTime")} />
              </FormField>
              <FormField label="HEURE DE FIN" name="endTime">
                <Input type="time" {...register("endTime")} />
              </FormField>
            </div>
          </div>
          <FormField label="LIEU" name="location" error={errors.location?.message}>
            <Input placeholder="Lieu (optionnel)" {...register("location")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? "Enregistrement…"
              : editing
                ? "Enregistrer les modifications"
                : "Publier le programme"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}