import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Eye, EyeOff, Pencil, Trash2, ImageOff } from "lucide-react";
import { mediaApi } from "../../../api/media.api";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatRelative } from "../../../lib/formatters";
import { mediaThumbnail } from "../../../lib/covers";
import { Badge, Button, Card, Modal, Input, Textarea, PageHeader, Skeleton, EmptyState } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

const FILTERS = [
  { value: "", label: "Tous" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "APPROUVE", label: "Publiés" },
];

const TYPE_ICONS = { PHOTO: "📷", AUDIO: "♪", VIDEO: "▶" };

export default function AdminMediasPage() {
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", thumbnailUrl: "" });

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.media.all, "manage", filter],
    queryFn: () => mediaApi.manage(filter ? { status: filter } : {}).then((r) => r.data),
  });

  function openEdit(media) {
    setEditing(media);
    setForm({
      title: media.title ?? "",
      description: media.description ?? "",
      thumbnailUrl: media.thumbnailUrl ?? "",
    });
  }

  const approveMutation = useMutationFeedback({
    mutationFn: (id) => mediaApi.approve(id),
    invalidate: [queryKeys.media.all],
    successMessage: "Média approuvé et publié.",
  });

  const rejectMutation = useMutationFeedback({
    mutationFn: (id) => mediaApi.remove(id),
    invalidate: [queryKeys.media.all],
    successMessage: "Média rejeté.",
  });

  const visibilityMutation = useMutationFeedback({
    mutationFn: (id) => mediaApi.toggleVisibility(id),
    invalidate: [queryKeys.media.all],
    successMessage: "Visibilité mise à jour.",
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) =>
      mediaApi.update(id, {
        title: values.title,
        description: values.description,
        thumbnailUrl: values.thumbnailUrl || null,
      }),
    invalidate: [queryKeys.media.all],
    successMessage: "Média mis à jour.",
    onSuccess: () => setEditing(null),
  });

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => mediaApi.remove(id),
    invalidate: [queryKeys.media.all],
    successMessage: "Média supprimé.",
    onSuccess: () => setConfirmingId(null),
  });

  const items = data ?? [];
  const pendingCount = filter === "" ? items.filter((m) => m.status === "EN_ATTENTE").length : null;

  return (
    <div>
      <PageHeader
        eyebrow="Galerie"
        title="Médias"
        description="Gérez les photos, audios et vidéos de la communauté : validation, visibilité, modification."
        actions={
          <div className="flex gap-1 p-1 rounded-xl bg-sand-2 border border-line">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f.value ? "bg-white text-gold-dim shadow-sm border border-line" : "text-soft hover:text-ink"
                }`}
              >
                {f.label}
                {f.value === "EN_ATTENTE" && pendingCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-white bg-brick rounded-full px-1.5 py-0.5">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-lg">
          <EmptyState icon={<ImageOff size={26} />} title="Aucun média" description="Aucun média ne correspond à ce filtre." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((media) => {
            const thumb = mediaThumbnail(media);
            const isPending = media.status === "EN_ATTENTE";
            const isConfirming = confirmingId === media.id;
            return (
              <Card key={media.id} className="p-0 flex flex-col overflow-hidden">
                <div
                  className="h-36 flex items-center justify-center text-white text-3xl flex-shrink-0 relative"
                  style={{ background: thumb ? `url(${thumb}) center/cover` : "linear-gradient(135deg,#1f2937,#37cdbe)" }}
                >
                  {!thumb && TYPE_ICONS[media.type]}
                  {media.visible === false && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-mono bg-ink/80 text-white px-2 py-1 rounded-full">
                      <EyeOff size={11} /> Masqué
                    </span>
                  )}
                  {isPending && (
                    <span className="absolute top-2 right-2"><Badge tone="gold">En attente</Badge></span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{media.title}</p>
                  <p className="text-xs mt-1 text-soft truncate">
                    {label("MEDIA_TYPE", media.type)} · {media.author?.firstName ?? ""} {media.author?.lastName ?? ""}
                    {media.createdAt && <span className="font-mono"> · {formatRelative(media.createdAt)}</span>}
                  </p>

                  <div className="mt-auto pt-3 mt-3 border-t border-line space-y-2">
                    {isPending ? (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" disabled={approveMutation.isPending} onClick={() => approveMutation.mutate(media.id)}>
                          <CheckCircle2 size={13} className="mr-1" /> Approuver
                        </Button>
                        <Button size="sm" variant="danger" className="flex-1" disabled={rejectMutation.isPending} onClick={() => rejectMutation.mutate(media.id)}>
                          <XCircle size={13} className="mr-1" /> Rejeter
                        </Button>
                      </div>
                    ) : isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-soft flex-1">Supprimer ?</span>
                        <Button size="sm" variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(media.id)}>
                          Oui
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Non</Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          disabled={visibilityMutation.isPending}
                          onClick={() => visibilityMutation.mutate(media.id)}
                        >
                          {media.visible === false ? <Eye size={13} className="mr-1" /> : <EyeOff size={13} className="mr-1" />}
                          {media.visible === false ? "Afficher" : "Masquer"}
                        </Button>
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => openEdit(media)} className="text-xs font-semibold text-gold-dim hover:underline inline-flex items-center gap-1">
                            <Pencil size={12} /> Modifier
                          </button>
                          <button onClick={() => setConfirmingId(media.id)} className="text-xs font-semibold text-brick hover:underline inline-flex items-center gap-1">
                            <Trash2 size={12} /> Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le média">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({ id: editing.id, values: form });
          }}
          className="space-y-4"
        >
          <Input
            label="TITRE"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="DESCRIPTION"
            rows={3}
            placeholder="Quelques mots sur ce média…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="MINIATURE (URL)"
            type="url"
            placeholder="https://…/miniature.jpg"
            value={form.thumbnailUrl}
            onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
          />
          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}