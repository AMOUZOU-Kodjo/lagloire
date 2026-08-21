import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Newspaper, Eye } from "lucide-react";
import { postsApi } from "../../../api/posts.api";
import { queryKeys } from "../../../lib/queryKeys";
import { formatDate } from "../../../lib/formatters";
import { Badge, Button, Card, Modal, Input, Textarea, Select, FormField, PageHeader, Skeleton, EmptyState } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

const postSchema = z.object({
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Contenu requis (min 10 caractères)"),
  categoryId: z.string().optional(),
  status: z.enum(["BROUILLON", "PUBLIE"]),
});

const postDefaultValues = {
  title: "",
  excerpt: "",
  content: "",
  categoryId: "",
  status: "BROUILLON",
};

export default function AdminActualitesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: postDefaultValues,
  });
  const status = watch("status");

  const { data: posts, isLoading } = useQuery({
    queryKey: queryKeys.posts.list({ admin: true }),
    queryFn: () => postsApi.list({ limit: 50 }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: categories } = useQuery({
    queryKey: ["post-categories"],
    queryFn: () => postsApi.categories().then((r) => r.data),
  });

  useEffect(() => {
    if (modalOpen && !editing) reset(postDefaultValues);
  }, [modalOpen, editing, reset]);

  function openEdit(p) {
    setEditing(p);
    reset({
      title: p.title ?? "",
      excerpt: p.excerpt ?? "",
      content: p.content ?? "",
      categoryId: p.category?.id ?? "",
      status: p.publishedAt ? "PUBLIE" : "BROUILLON",
    });
    setModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  const createMutation = useMutationFeedback({
    mutationFn: ({ values }) => postsApi.create(values),
    invalidate: [queryKeys.posts.all],
    successMessage: "Actualité enregistrée.",
    onSuccess: () => setModalOpen(false),
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) => postsApi.update(id, values),
    invalidate: [queryKeys.posts.all],
    successMessage: "Actualité mise à jour.",
    onSuccess: () => setModalOpen(false),
  });

  const categoryMutation = useMutationFeedback({
    mutationFn: (name) => postsApi.createCategory(name),
    invalidate: [["post-categories"]],
    successMessage: "Catégorie créée.",
    onSuccess: () => setNewCategory(""),
  });

  function handleNewCategory() {
    const name = newCategory.trim();
    if (name.length >= 2) categoryMutation.mutate(name);
  }

  function submit(values) {
    const payload = {
      title: values.title,
      excerpt: values.excerpt || null,
      content: values.content,
      categoryId: values.categoryId || null,
      // Publication : conserve la date d'origine si l'article était déjà publié
      publishedAt:
        values.status === "PUBLIE"
          ? editing?.publishedAt ?? new Date().toISOString()
          : null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, values: payload });
    else createMutation.mutate({ values: payload });
  }

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => postsApi.remove(id),
    invalidate: [queryKeys.posts.all],
    successMessage: "Actualité supprimée.",
    onSuccess: () => setConfirmingId(null),
  });

  const list = posts ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Actualités"
        description="Publiez les nouvelles de la communauté. À la publication, tous les abonnés sont notifiés par email."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5" /> Nouvelle actualité
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="📰"
          title="Aucune actualité"
          description="Publiez votre première actualité pour informer la communauté."
        />
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const isConfirming = confirmingId === p.id;
            const published = Boolean(p.publishedAt);
            return (
              <Card key={p.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-ink">{p.title}</h3>
                      {published ? (
                        <Badge tone="palm">Publié</Badge>
                      ) : (
                        <Badge tone="muted">Brouillon</Badge>
                      )}
                      {p.category && <Badge tone="gold">{p.category.name}</Badge>}
                    </div>
                    {p.excerpt && <p className="text-sm text-soft mt-1 line-clamp-1">{p.excerpt}</p>}
                    <p className="text-xs text-soft mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{published ? formatDate(p.publishedAt) : "Non publié"}</span>
                      {p.author && <span>— {p.author.firstName} {p.author.lastName}</span>}
                      {typeof p.reads === "number" && (
                        <span className="inline-flex items-center gap-1"><Eye size={12} /> {p.reads}</span>
                      )}
                    </p>
                  </div>

                  {isConfirming ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-soft">Supprimer définitivement ?</span>
                      <Button size="sm" variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(p.id)}>
                        Oui, supprimer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'actualité" : "Nouvelle actualité"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="TITRE" error={errors.title?.message}>
            <Input placeholder="Titre de l'actualité" {...register("title")} />
          </FormField>

          <FormField label="CATÉGORIE" error={errors.categoryId?.message}>
            <Select {...register("categoryId")}>
              <option value="">Aucune catégorie</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c._count?.posts ?? 0})</option>
              ))}
            </Select>
          </FormField>

          <div className="flex gap-2">
            <Input
              placeholder="Nouvelle catégorie…"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleNewCategory();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleNewCategory} disabled={categoryMutation.isPending || newCategory.trim().length < 2}>
              <Plus size={14} />
            </Button>
          </div>

          <FormField label="RÉSUMÉ (accroche des cartes)" error={errors.excerpt?.message}>
            <Textarea placeholder="Un court résumé affiché sur les cartes" rows={2} {...register("excerpt")} />
          </FormField>

          <FormField label="CONTENU" error={errors.content?.message}>
            <Textarea placeholder="Le texte complet de l'actualité…" rows={8} {...register("content")} />
          </FormField>

          <FormField label="STATUT" error={errors.status?.message}>
            <Select {...register("status")}>
              <option value="BROUILLON">Brouillon (invisible du public)</option>
              <option value="PUBLIE">Publié (visible + email aux abonnés à la création)</option>
            </Select>
          </FormField>
          {status === "PUBLIE" && !editing && (
            <p className="text-xs text-gold-dim bg-gold/10 border border-gold/20 rounded-lg p-3">
              📧 La publication enverra une notification email à tous les abonnés actifs.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Créer l'actualité"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
