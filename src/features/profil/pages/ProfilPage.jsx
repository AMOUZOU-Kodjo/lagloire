import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { usersApi } from "../../../api/users.api";
import { useAuthStore } from "../../../store/authStore";
import { GENDERS, MARITAL_STATUSES } from "../../../lib/constants";
import { queryKeys } from "../../../lib/queryKeys";
import { Card, Avatar, RoleBadge, Button, Input, Select, Textarea, FormField } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { profileSchema, passwordSchema, setPasswordSchema } from "../schemas/profileSchema";

/** Redimensionne l'image choisie côté navigateur (max 400px, JPEG ~40 Ko) → data URI stockable en base. */
function fileToAvatarDataUri(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Choisissez une image."));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    img.src = url;
  });
}

export default function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef(null);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user?.profile?.bio ?? "",
      city: user?.profile?.city ?? "",
      gender: user?.profile?.gender ?? "",
      maritalStatus: user?.profile?.maritalStatus ?? "",
    },
  });

  const hasPassword = Boolean(user?.hasPassword);
  const passwordForm = useForm({
    resolver: zodResolver(hasPassword ? passwordSchema : setPasswordSchema),
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
    onSuccess: (res) => setUser(res.data),
  });

  const changePasswordMutation = useMutationFeedback({
    mutationFn: (values) =>
      usersApi.changePassword(hasPassword ? values : { newPassword: values.newPassword }),
    successMessage: hasPassword ? "Mot de passe modifié." : "Mot de passe défini — vous pouvez maintenant vous connecter avec.",
    onSuccess: (res) => {
      passwordForm.reset();
      setUser({ ...user, hasPassword: res.data?.hasPassword ?? true });
    },
  });

  const onPickPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const avatarUrl = await fileToAvatarDataUri(file);
      updateProfileMutation.mutate({ avatarUrl });
    } catch (err) {
      console.warn(err.message);
    }
  };

  return (
    <div className="max-w-4xl grid md:grid-cols-3 gap-6">
      <Card className="p-6 text-center h-fit">
        <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.profile?.avatarUrl} size="xl" className="mx-auto" />
        <p className="font-display text-lg mt-4">{user?.firstName} {user?.lastName}</p>
        <p className="text-xs text-soft">{user?.email}</p>
        {user?.role && <RoleBadge role={user.role} className="mt-2 inline-block" />}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        <Button
          type="button"
          variant="outline"
          className="w-full mt-5"
          disabled={updateProfileMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={15} className="mr-2" />
          {updateProfileMutation.isPending ? "Envoi…" : "Changer la photo"}
        </Button>

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
          <p className="font-display text-lg mb-1">Sécurité</p>
          <p className="text-xs text-soft mb-4">
            {hasPassword
              ? "Modifiez votre mot de passe, ou connectez-vous avec le code reçu par email."
              : "Définissez un mot de passe pour vous connecter avec votre email — ou continuez d'utiliser le code reçu par email."}
          </p>
          <form onSubmit={passwordForm.handleSubmit((values) => changePasswordMutation.mutate(values))}>
            {hasPassword && (
              <FormField label="MOT DE PASSE ACTUEL" name="currentPassword" error={passwordForm.formState.errors.currentPassword?.message}>
                <Input type="password" placeholder="Mot de passe actuel" {...passwordForm.register("currentPassword")} />
              </FormField>
            )}
            <FormField label={hasPassword ? "NOUVEAU MOT DE PASSE" : "MOT DE PASSE (6 caractères minimum)"} name="newPassword" error={passwordForm.formState.errors.newPassword?.message} className={hasPassword ? "" : ""}>
              <Input type="password" placeholder={hasPassword ? "Nouveau mot de passe" : "Choisir un mot de passe"} {...passwordForm.register("newPassword")} />
            </FormField>
            <Button type="submit" variant="outline" className={`mt-4 ${hasPassword ? "" : "w-full sm:w-auto"}`} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Modification…" : hasPassword ? "Modifier le mot de passe" : "Définir mon mot de passe"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}