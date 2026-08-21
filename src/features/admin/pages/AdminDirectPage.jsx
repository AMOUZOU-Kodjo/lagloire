import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, Play, Square, RadioTower, Pencil, Trash2 } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { liveStreamApi } from "../../../api/liveStream.api";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatRelative } from "../../../lib/formatters";
import { Badge, Button, Card, Modal, Input, Select, FormField, PageHeader, StatusBadge, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { liveSchema, liveDefaultValues } from "../schemas/liveSchema";

export default function AdminDirectPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(liveSchema),
    defaultValues: liveDefaultValues,
  });

  const streamType = watch("type");

  useEffect(() => {
    if (modalOpen && !editing) reset();
  }, [modalOpen, editing, reset]);

  function openEdit(stream) {
    setEditing(stream);
    reset({
      title: stream.title ?? "",
      type: stream.type ?? "YOUTUBE",
      youtubeVideoId: stream.youtubeVideoId ?? "",
      streamUrl: stream.streamUrl ?? "",
    });
    setModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.live.list({ admin: true }),
    queryFn: () => liveStreamApi.list({ limit: 20 }).then((r) => r.data),
  });

  const createMutation = useMutationFeedback({
    mutationFn: (values) => liveStreamApi.create(values),
    invalidate: [queryKeys.live.all],
    successMessage: "Diffusion créée.",
    onSuccess: () => setModalOpen(false),
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) => liveStreamApi.update(id, values),
    invalidate: [queryKeys.live.all],
    successMessage: "Diffusion mise à jour.",
    onSuccess: () => setModalOpen(false),
  });

  function submit(values) {
    if (editing) updateMutation.mutate({ id: editing.id, values });
    else createMutation.mutate(values);
  }

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => liveStreamApi.remove(id),
    invalidate: [queryKeys.live.all],
    successMessage: "Diffusion supprimée.",
    onSuccess: () => setConfirmingId(null),
  });

  const goLiveMutation = useMutationFeedback({
    mutationFn: (id) => liveStreamApi.update(id, { status: "EN_DIRECT" }),
    invalidate: [queryKeys.live.all],
    successMessage: "Diffusion lancée en direct.",
  });

  const endMutation = useMutationFeedback({
    mutationFn: (id) => liveStreamApi.update(id, { status: "TERMINE" }),
    invalidate: [queryKeys.live.all],
    successMessage: "Diffusion terminée.",
  });

  const streams = data ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Direct"
        title="Diffusions"
        description="Planifiez et gérez les diffusions en direct."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5" /> Nouvelle diffusion
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : streams.length === 0 ? (
        <Card className="rounded-lg p-10 text-center text-sm text-soft">Aucune diffusion planifiée.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream) => (
            <Card key={stream.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    stream.status === "EN_DIRECT" ? "bg-brick/10 text-brick" : "bg-gold/10 text-gold-dim"
                  }`}
                >
                  {stream.type === "YOUTUBE" ? <FaYoutube size={18} /> : <RadioTower size={18} />}
                </div>
                <StatusBadge kind="LIVE_STATUS" status={stream.status} />
              </div>
              <p className="font-medium mt-3 truncate">{stream.title}</p>
              <p className="text-xs text-soft mt-1">
                <Badge tone="muted">{label("LIVE_TYPE", stream.type)}</Badge>
                {stream.author ? ` · Par ${stream.author.firstName ?? ""} ${stream.author.lastName ?? ""}` : null}
                {stream.createdAt && <span className="font-mono"> · {formatRelative(stream.createdAt)}</span>}
              </p>
              <div className="mt-auto pt-3 mt-4 border-t border-line space-y-2">
                {stream.status === "PLANIFIE" && (
                  <Button size="sm" className="w-full" disabled={goLiveMutation.isPending} onClick={() => goLiveMutation.mutate(stream.id)}>
                    <Play size={14} className="mr-1.5" /> Démarrer
                  </Button>
                )}
                {stream.status === "EN_DIRECT" && (
                  <Button size="sm" variant="danger" className="w-full" disabled={endMutation.isPending} onClick={() => endMutation.mutate(stream.id)}>
                    <Square size={14} className="mr-1.5" /> Terminer
                  </Button>
                )}
                {stream.status === "TERMINE" && (
                  <p className="text-xs text-soft text-center font-mono">Diffusion terminée</p>
                )}

                {confirmingId === stream.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-soft flex-1">Supprimer ?</span>
                    <Button size="sm" variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(stream.id)}>
                      Oui
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Non</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => openEdit(stream)} className="text-xs font-semibold text-gold-dim hover:underline inline-flex items-center gap-1">
                      <Pencil size={12} /> Modifier
                    </button>
                    <button onClick={() => setConfirmingId(stream.id)} className="text-xs font-semibold text-brick hover:underline inline-flex items-center gap-1">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier la diffusion" : "Nouvelle diffusion"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="TITRE" name="title" error={errors.title?.message}>
            <Input placeholder="Titre" {...register("title")} />
          </FormField>
          <FormField label="TYPE" name="type" error={errors.type?.message}>
            <Select {...register("type")}>
              <option value="YOUTUBE">{label("LIVE_TYPE", "YOUTUBE")}</option>
              <option value="INTERNE">{label("LIVE_TYPE", "INTERNE")}</option>
            </Select>
          </FormField>
          {streamType === "YOUTUBE" ? (
            <FormField label="ID VIDÉO YOUTUBE" name="youtubeVideoId" error={errors.youtubeVideoId?.message}>
              <Input placeholder="ID de la vidéo YouTube" {...register("youtubeVideoId")} />
            </FormField>
          ) : (
            <FormField label="URL DU FLUX" name="streamUrl" error={errors.streamUrl?.message}>
              <Input placeholder="URL du flux" {...register("streamUrl")} />
            </FormField>
          )}
          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? "Enregistrement…"
              : editing
                ? "Enregistrer les modifications"
                : "Créer la diffusion"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}