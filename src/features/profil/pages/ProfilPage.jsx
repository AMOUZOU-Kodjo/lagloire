import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../../../api/users.api";
import { useAuthStore } from "../../../store/authStore";
import { GENDERS, MARITAL_STATUSES } from "../../../lib/constants";
import { queryKeys } from "../../../lib/queryKeys";
import { Card, Avatar, RoleBadge, Button, Input, Select, Textarea, FormField } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { profileSchema, passwordSchema } from "../schemas/profileSchema";

export default function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user?.profile?.bio ?? "",
      city: user?.profile?.city ?? "",
      gender: user?.profile?.gender ?? "",
      maritalStatus: user?.profile?.maritalStatus ?? "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const { data: visitStats } = useQuery({
    queryKey: ["visit-stats", user?.id],
    queryFn: () => usersApi.visitStats().then((r) => r.data),
    enabled: !!user,
  });

  const updateProfileMutation = useMutationFeedback({
    mutationFn: (values) => usersApi.updateProfile(values),
    invalidate: [queryKeys.auth.me, queryKeys.users.all],
    successMessage: "Profil enregistré.",
    onSuccess: (res) => setUser({ ...user, profile: res.data }),
  });

  const changePasswordMutation = useMutationFeedback({
    mutationFn: (values) => usersApi.changePassword(values),
    successMessage: "Mot de passe modifié.",
    onSuccess: () => passwordForm.reset(),
  });

  return (
    <div className="max-w-4xl grid md:grid-cols-3 gap-6">
      <Card className="p-6 text-center h-fit">
        <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.profile?.avatarUrl} size="xl" className="mx-auto" />
        <p className="font-display text-lg mt-4">{user?.firstName} {user?.lastName}</p>
        <p className="text-xs text-soft">{user?.email}</p>
        {user?.role && <RoleBadge role={user.role} className="mt-2 inline-block" />}
        <Button variant="outline" className="w-full mt-5">Changer la photo</Button>

        <div className="mt-6 pt-6 text-left border-t border-line">
          <p className="text-xs font-mono mb-2 text-soft">VISITES DE PROFIL</p>
          <p className="font-display text-2xl">{visitStats?.totalVisits ?? 0}</p>
          <p className="text-xs text-soft">{visitStats?.uniqueVisitors ?? 0} visiteurs uniques</p>
        </div>
      </Card>

      <div className="md:col-span-2 space-y-6">
        <Card className="p-6">
          <p className="font-display text-lg mb-4">Informations personnelles</p>
          <form onSubmit={profileForm.handleSubmit((values) => updateProfileMutation.mutate(values))}>
            <div className="grid sm:grid-cols-2 gap-3">
              <FormField label="VILLE" name="city" error={profileForm.formState.errors.city?.message}>
                <Input {...profileForm.register("city")} />
              </FormField>
              <FormField label="GENRE" name="gender" error={profileForm.formState.errors.gender?.message}>
                <Select {...profileForm.register("gender")}>
                  <option value="">—</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g === "HOMME" ? "Homme" : "Femme"}</option>)}
                </Select>
              </FormField>
              <FormField label="SITUATION MATRIMONIALE" name="maritalStatus" error={profileForm.formState.errors.maritalStatus?.message}>
                <Select {...profileForm.register("maritalStatus")}>
                  <option value="">—</option>
                  {MARITAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="BIOGRAPHIE" name="bio" className="mt-3" error={profileForm.formState.errors.bio?.message}>
              <Textarea rows={3} {...profileForm.register("bio")} />
            </FormField>
            <Button type="submit" className="mt-4" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <p className="font-display text-lg mb-4">Sécurité</p>
          <form onSubmit={passwordForm.handleSubmit((values) => changePasswordMutation.mutate(values))}>
            <div className="grid sm:grid-cols-2 gap-3">
              <FormField label="MOT DE PASSE ACTUEL" name="currentPassword" error={passwordForm.formState.errors.currentPassword?.message}>
                <Input type="password" placeholder="Mot de passe actuel" {...passwordForm.register("currentPassword")} />
              </FormField>
              <FormField label="NOUVEAU MOT DE PASSE" name="newPassword" error={passwordForm.formState.errors.newPassword?.message}>
                <Input type="password" placeholder="Nouveau mot de passe" {...passwordForm.register("newPassword")} />
              </FormField>
            </div>
            <Button type="submit" variant="outline" className="mt-4" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Modification…" : "Modifier le mot de passe"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}