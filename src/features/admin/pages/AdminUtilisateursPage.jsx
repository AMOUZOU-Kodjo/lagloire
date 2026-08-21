import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Mail, Calendar, UserPlus, ChevronRight, Building2, Save, Trash2 } from "lucide-react";
import { usersApi } from "../../../api/users.api";
import { churchApi } from "../../../api/church.api";
import { ROLES, ROLE_LABELS, MINISTRIES } from "../../../lib/constants";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatDateShort } from "../../../lib/formatters";
import { Avatar, RoleBadge, Badge, Button, Card, Input, Select, Modal, PageHeader, FormField, EmptyState, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { usePagination } from "../../../hooks/usePagination";
import { useDebounce } from "../../../hooks/useDebounce";

export default function AdminUtilisateursPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [managingUser, setManagingUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editValues, setEditValues] = useState({ role: "", ministry: "", phone: "", churchId: "" });
  const debouncedSearch = useDebounce(search, 300);
  const { page, setPage } = usePagination(1, [debouncedSearch, role]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: ROLES.FIDELES },
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.list({ search: debouncedSearch || undefined, role: role || undefined, page }),
    queryFn: () => usersApi.list({ search: debouncedSearch || undefined, role: role || undefined, page, limit: 9 }),
  });

  const { data: churches } = useQuery({
    queryKey: queryKeys.churches.all,
    queryFn: () => churchApi.list().then((r) => r.data),
  });

  useEffect(() => {
    setConfirmingDelete(false);
    if (managingUser) {
      setEditValues({
        role: managingUser.role ?? "",
        ministry: managingUser.ministry ?? "",
        phone: managingUser.phone ?? "",
        churchId: managingUser.churchId ?? "",
      });
    }
  }, [managingUser]);

  const createMutation = useMutationFeedback({
    mutationFn: (values) => usersApi.create(values),
    invalidate: [queryKeys.users.all],
    successMessage: "Membre ajouté.",
    onSuccess: () => setCreating(false),
  });

  const toggleActiveMutation = useMutationFeedback({
    mutationFn: ({ id, isActive }) => usersApi.update(id, { isActive }),
    invalidate: [queryKeys.users.all],
    successMessage: "Statut du compte mis à jour.",
    onSuccess: () => setManagingUser(null),
  });

  const updateUserMutation = useMutationFeedback({
    mutationFn: ({ id, values }) =>
      usersApi.update(id, {
        role: values.role || undefined,
        ministry: values.ministry || null,
        phone: values.phone || null,
        churchId: values.churchId || null,
      }),
    invalidate: [queryKeys.users.all],
    successMessage: "Membre mis à jour.",
  });

  const deleteUserMutation = useMutationFeedback({
    mutationFn: (id) => usersApi.remove(id),
    invalidate: [queryKeys.users.all],
    successMessage: "Membre supprimé.",
    onSuccess: () => setManagingUser(null),
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div>
      <PageHeader
        eyebrow="Communauté"
        title="Utilisateurs"
        description="Gérez les membres, leurs rôles et l'accès aux comptes."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} className="mr-1.5" /> Ajouter un membre
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft pointer-events-none" />
          <Input className="pl-9" placeholder="Rechercher un nom, un email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tous les rôles</option>
          {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </Select>
        {!isLoading && users.length > 0 && (
          <Badge tone="muted">{activeCount}/{users.length} actifs</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : users.length === 0 ? (
        <Card className="rounded-lg">
          <EmptyState icon="👥" title="Aucun membre trouvé" description="Ajustez la recherche ou ajoutez un nouveau membre." action={<Button onClick={() => setCreating(true)}><UserPlus size={16} className="mr-1.5" /> Ajouter un membre</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <Card
              key={u.id}
              className="p-5 flex flex-col cursor-pointer transition hover:border-gold/40 hover:shadow-card"
              onClick={() => setManagingUser(u)}
            >
              <div className="flex items-center gap-3">
                <Avatar firstName={u.firstName} lastName={u.lastName} src={u.profile?.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-soft flex items-center gap-1 truncate">
                    <Mail size={12} className="flex-shrink-0" /> {u.email}
                  </p>
                </div>
                <ChevronRight size={16} className="text-soft flex-shrink-0" />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <RoleBadge role={u.role} />
                <Badge tone={u.isActive ? "palm" : "brick"}>{u.isActive ? "Actif" : "Désactivé"}</Badge>
              </div>

              <div className="mt-auto pt-4 border-t border-line flex items-center justify-between text-xs text-soft mt-5">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Building2 size={12} className="flex-shrink-0" />
                  <span className="truncate">{u.church?.name ?? "Aucune église"}</span>
                </span>
                <span className="flex items-center gap-1 font-mono flex-shrink-0">
                  <Calendar size={11} /> {formatDateShort(u.createdAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-5">
          <span className="text-xs text-soft font-mono">Page {pagination.page} sur {pagination.pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}>Précédent</Button>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => setPage(pagination.page + 1)}>Suivant</Button>
          </div>
        </div>
      )}

      <Modal
        open={creating || !!managingUser}
        onClose={() => {
          setCreating(false);
          setManagingUser(null);
        }}
        title={creating ? "Ajouter un membre" : "Détails du membre"}
      >
        {creating ? (
          <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="PRÉNOM" name="firstName" error={errors.firstName?.message}>
                <Input placeholder="Prénom" {...register("firstName", { required: "Le prénom est requis" })} />
              </FormField>
              <FormField label="NOM" name="lastName" error={errors.lastName?.message}>
                <Input placeholder="Nom" {...register("lastName", { required: "Le nom est requis" })} />
              </FormField>
            </div>
            <FormField label="EMAIL" name="email" error={errors.email?.message}>
              <Input type="email" placeholder="Email" {...register("email", { required: "L'email est requis" })} />
            </FormField>
            <FormField label="RÔLE" name="role" error={errors.role?.message}>
              <Select {...register("role")}>
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
            </FormField>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Ajout…" : "Ajouter le membre"}
            </Button>
          </form>
        ) : (
          managingUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar firstName={managingUser.firstName} lastName={managingUser.lastName} src={managingUser.profile?.avatarUrl} size="lg" />
                <div className="min-w-0">
                  <p className="font-display text-lg truncate">{managingUser.firstName} {managingUser.lastName}</p>
                  <p className="text-xs text-soft truncate">{managingUser.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={managingUser.role} />
                <Badge tone={managingUser.isActive ? "palm" : "brick"}>{managingUser.isActive ? "Compte actif" : "Compte désactivé"}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="RÔLE">
                  <Select
                    value={editValues.role}
                    onChange={(e) => setEditValues((v) => ({ ...v, role: e.target.value }))}
                  >
                    {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </Select>
                </FormField>
                <FormField label="MINISTÈRE">
                  <Select
                    value={editValues.ministry}
                    onChange={(e) => setEditValues((v) => ({ ...v, ministry: e.target.value }))}
                  >
                    <option value="">Aucun</option>
                    {MINISTRIES.filter((m) => m !== "AUCUN").map((m) => (
                      <option key={m} value={m}>{label("MINISTRY", m)}</option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="TÉLÉPHONE">
                  <Input
                    placeholder="Ex. +228 90 00 00 00"
                    value={editValues.phone}
                    onChange={(e) => setEditValues((v) => ({ ...v, phone: e.target.value }))}
                  />
                </FormField>
                <FormField label="ÉGLISE">
                  <Select
                    value={editValues.churchId}
                    onChange={(e) => setEditValues((v) => ({ ...v, churchId: e.target.value }))}
                  >
                    <option value="">Aucune</option>
                    {(churches ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </FormField>
              </div>
              <Button
                className="w-full"
                disabled={updateUserMutation.isPending}
                onClick={() => updateUserMutation.mutate({ id: managingUser.id, values: editValues })}
              >
                <Save size={15} className="mr-1.5" />
                {updateUserMutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
              </Button>

              <p className="text-xs font-mono text-soft">
                INSCRIT LE · {formatDateShort(managingUser.createdAt)}
              </p>

              <div className="border-t border-line pt-4 space-y-3">
                <Button
                  variant={managingUser.isActive ? "danger" : "gold"}
                  className="w-full"
                  onClick={() => toggleActiveMutation.mutate({ id: managingUser.id, isActive: !managingUser.isActive })}
                  disabled={toggleActiveMutation.isPending}
                >
                  {managingUser.isActive ? "Désactiver le compte" : "Réactiver le compte"}
                </Button>

                {confirmingDelete ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-brick/30 bg-brick/5">
                    <span className="text-xs text-brick flex-1">Supprimer définitivement ce membre ?</span>
                    <Button size="sm" variant="danger" disabled={deleteUserMutation.isPending} onClick={() => deleteUserMutation.mutate(managingUser.id)}>
                      Oui, supprimer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>Annuler</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="w-full text-xs font-semibold text-brick hover:underline inline-flex items-center justify-center gap-1"
                  >
                    <Trash2 size={13} /> Supprimer le membre
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}