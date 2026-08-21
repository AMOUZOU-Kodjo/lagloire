import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, Building2, MapPin, Phone, Mail, Users, Pencil, Trash2, Upload, X } from "lucide-react";
import { churchApi } from "../../../api/church.api";
import { mediaApi } from "../../../api/media.api";
import { mediaFullUrl } from "../../../api/http";
import { queryKeys } from "../../../lib/queryKeys";
import { Badge, Button, Card, Modal, Input, Textarea, FormField, PageHeader, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { churchSchema, churchDefaultValues } from "../schemas/churchSchema";

export default function AdminEglisesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const fileRef = useRef(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(churchSchema),
    defaultValues: churchDefaultValues,
  });

  const imageUrl = watch("imageUrl");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    reset(editing ? {
      name: editing.name ?? "",
      city: editing.city ?? "",
      country: editing.country ?? "",
      address: editing.address ?? "",
      phone: editing.phone ?? "",
      email: editing.email ?? "",
      description: editing.description ?? "",
      imageUrl: editing.imageUrl ?? "",
    } : churchDefaultValues);
  }, [modalOpen, editing, reset]);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file);
      setValue("imageUrl", mediaFullUrl(res.data.mediaUrl), { shouldDirty: true });
    } finally {
      setUploading(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.churches.list({}),
    queryFn: () => churchApi.list().then((r) => r.data),
  });

  const createMutation = useMutationFeedback({
    mutationFn: (values) => churchApi.create(values),
    invalidate: [queryKeys.churches.all],
    successMessage: "Église créée.",
    onSuccess: () => { setModalOpen(false); setEditing(null); },
  });

  const updateMutation = useMutationFeedback({
    mutationFn: ({ id, values }) => churchApi.update(id, values),
    invalidate: [queryKeys.churches.all],
    successMessage: "Église mise à jour.",
    onSuccess: () => { setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutationFeedback({
    mutationFn: (id) => churchApi.remove(id),
    invalidate: [queryKeys.churches.all],
    successMessage: "Église supprimée.",
    onSuccess: () => setConfirmingId(null),
  });

  const churches = data ?? [];
  const submit = (values) => {
    if (editing) updateMutation.mutate({ id: editing.id, values });
    else createMutation.mutate(values);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Réseau local"
        title="Églises"
        description="Gérez les églises locales de la communauté."
        actions={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={16} className="mr-1.5" /> Ajouter une église
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : churches.length === 0 ? (
        <Card className="rounded-lg p-10 text-center text-sm text-soft">Aucune église enregistrée.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {churches.map((church) => {
            const isConfirming = confirmingId === church.id;
            return (
              <Card key={church.id} className="p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  {church.imageUrl ? (
                    <img src={church.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-line" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold-dim flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{church.name}</p>
                    <p className="text-xs text-soft flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="flex-shrink-0" /> {church.city}, {church.country}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-soft flex-1">
                  {church.phone && (
                    <p className="flex items-center gap-2"><Phone size={12} className="flex-shrink-0" /> {church.phone}</p>
                  )}
                  {church.email && (
                    <p className="flex items-center gap-2 truncate"><Mail size={12} className="flex-shrink-0" /> {church.email}</p>
                  )}
                  {church.address && (
                    <p className="flex items-center gap-2 truncate"><Building2 size={12} className="flex-shrink-0" /> {church.address}</p>
                  )}
                  {!church.phone && !church.email && !church.address && (
                    <p className="text-soft italic">Aucune coordonnée renseignée.</p>
                  )}
                </div>

                {church.description && <p className="text-xs text-soft mt-3 line-clamp-2">{church.description}</p>}

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <Badge tone="muted" className="inline-flex items-center gap-1">
                    <Users size={12} /> {church._count?.members ?? 0} membres
                  </Badge>
                  {isConfirming ? (
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(church.id)}>Supprimer</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(church); setModalOpen(true); }}>
                        <Pencil size={13} className="mr-1" /> Modifier
                      </Button>
                      <button onClick={() => setConfirmingId(church.id)} aria-label="Supprimer" className="btn btn-sm btn-outline !border-transparent !text-brick">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Modifier l'église" : "Nouvelle église"}
      >
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="NOM" name="name" error={errors.name?.message}>
            <Input placeholder="Nom de l'église" {...register("name")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="VILLE" name="city" error={errors.city?.message}>
              <Input placeholder="Ville" {...register("city")} />
            </FormField>
            <FormField label="PAYS" name="country" error={errors.country?.message}>
              <Input placeholder="Pays" {...register("country")} />
            </FormField>
          </div>
          <FormField label="ADRESSE" name="address" error={errors.address?.message}>
            <Input placeholder="Adresse" {...register("address")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="TÉLÉPHONE" name="phone" error={errors.phone?.message}>
              <Input placeholder="Téléphone" {...register("phone")} />
            </FormField>
            <FormField label="EMAIL" name="email" error={errors.email?.message}>
              <Input placeholder="Email" type="email" {...register("email")} />
            </FormField>
          </div>
          <FormField label="DESCRIPTION" name="description" error={errors.description?.message}>
            <Textarea placeholder="Description" rows={3} {...register("description")} />
          </FormField>
          <FormField label="PHOTO" name="imageUrl">
            <div className="flex items-center gap-2">
              <Input placeholder="https://… ou téléverser un fichier" {...register("imageUrl")} />
              <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <Upload size={14} className="mr-1" /> {uploading ? "Envoi…" : "Fichier"}
              </Button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
            {imageUrl && (
              <div className="relative mt-2 w-fit">
                <img src={imageUrl} alt="" className="h-20 w-32 object-cover rounded-md border border-line" />
                <button
                  type="button"
                  aria-label="Retirer la photo"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-line shadow flex items-center justify-center text-soft hover:text-brick"
                  onClick={() => setValue("imageUrl", "", { shouldDirty: true })}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </FormField>
          <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Créer l'église"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}