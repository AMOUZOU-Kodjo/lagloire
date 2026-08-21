import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { donationsApi } from "../../../api/donations.api";
import { churchApi } from "../../../api/church.api";
import { useAuthStore } from "../../../store/authStore";
import { DONATION_TYPES } from "../../../lib/constants";
import { queryKeys } from "../../../lib/queryKeys";
import { Card, Button, Select, Input, Badge, FormField, PageHero } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { formatAmount } from "../../../lib/formatters";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { useToast } from "../../../hooks/useToast";
import PaymentMethodPicker from "../components/PaymentMethodPicker";
import { donationSchema, donationDefaultValues } from "../schemas/donationSchema";

const AMOUNTS = [2000, 5000, 10000];
const TYPE_LABEL = { OFFRANDE: "Offrande", DIME: "Dîme", PROJET: "Projet" };

export default function DonPage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: donationDefaultValues,
  });

  const type = watch("type");
  const amount = watch("amount");
  const customAmount = watch("customAmount");
  const method = watch("method");
  const finalAmount = Number(customAmount || amount);

  const { data: churches } = useQuery({ queryKey: queryKeys.churches.list({}), queryFn: () => churchApi.list().then((r) => r.data) });
  const { data: myDonations } = useQuery({
    queryKey: queryKeys.donations.mine,
    enabled: !!user,
    queryFn: () => donationsApi.mine({ limit: 5 }).then((r) => r.data),
  });

  const donateMutation = useMutationFeedback({
    mutationFn: (values) =>
      donationsApi.create({
        amount: Number(values.customAmount || values.amount),
        type: values.type,
        paymentMethod: values.method,
        phone: values.method === "FLOOZ" || values.method === "TMONEY" ? values.phone : undefined,
        churchId: values.churchId || undefined,
      }),
    invalidate: [queryKeys.donations.mine],
    successMessage: "Merci pour votre générosité !",
    onSuccess: (data) => {
      reset();
      if (data?.data?.transactionId) toast.info(`Transaction ${data.data.transactionId} enregistrée.`);
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Générosité & transparence"
        title="Faire un don"
        description="Offrande, dîme ou soutien à un événement — chaque don est confirmé et tracé par un identifiant de transaction."
      />

      <section className="max-w-7xl mx-auto px-6 py-12">

      <Item>
      <Card className="p-8">
        <form onSubmit={handleSubmit((values) => donateMutation.mutate(values))}>
          <span className="text-xs font-mono text-soft">TYPE DE DON</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {DONATION_TYPES.map((t) => (
              <Button key={t} type="button" variant="outline" className={type === t ? "bg-ink text-sand border-ink" : ""} onClick={() => setValue("type", t)}>
                {TYPE_LABEL[t]}
              </Button>
            ))}
          </div>

          <span className="text-xs font-mono mt-6 block text-soft">MONTANT (XAF)</span>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {AMOUNTS.map((a) => (
              <Button
                key={a}
                type="button"
                variant="outline"
                className={amount === a && !customAmount ? "bg-gold border-gold text-ink" : ""}
                onClick={() => { setValue("amount", a); setValue("customAmount", ""); }}
              >
                {new Intl.NumberFormat("fr-FR").format(a)}
              </Button>
            ))}
            <FormField name="customAmount" error={errors.customAmount?.message}>
              <Input placeholder="Autre" {...register("customAmount")} />
            </FormField>
          </div>

          <FormField label="POUR QUELLE ÉGLISE ?" name="churchId" className="mt-6" error={errors.churchId?.message}>
            <Select {...register("churchId")}>
              <option value="">Fonds général</option>
              {(churches ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>

          <span className="text-xs font-mono mt-6 block text-soft">MÉTHODE DE PAIEMENT</span>
          <PaymentMethodPicker value={method} onChange={(m) => setValue("method", m)} />

          {(method === "FLOOZ" || method === "TMONEY") && (
            <FormField label="NUMÉRO DE TÉLÉPHONE" name="phone" className="mt-6" error={errors.phone?.message}>
              <Input placeholder="+228 90 00 00 00" {...register("phone")} />
            </FormField>
          )}

          {user ? (
            <Button type="submit" className="w-full mt-7" disabled={donateMutation.isPending}>
              {donateMutation.isPending ? "Confirmation…" : `Confirmer le don de ${formatAmount(finalAmount)}`}
            </Button>
          ) : (
            <Button as={Link} to="/connexion" className="w-full mt-7">Se connecter pour faire un don</Button>
          )}
          <p className="text-xs text-center mt-3 text-soft">Vous recevrez une confirmation avec numéro de transaction.</p>
        </form>
      </Card>
      </Item>

      {user && myDonations?.length > 0 && (
        <>
          <h2 className="font-display text-lg mt-10 mb-3">Mes derniers dons</h2>
          <Stagger className="space-y-3" delay={0.1} inView>
            {myDonations.map((d) => (
              <Item key={d.id}>
                <Card className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{formatAmount(d.amount, d.currency)} · {TYPE_LABEL[d.type]}</p>
                    <p className="text-xs font-mono text-soft">{d.transactionId}</p>
                  </div>
                  <Badge tone={d.status === "CONFIRME" ? "palm" : "gold"}>{d.status === "CONFIRME" ? "Confirmé" : "En attente"}</Badge>
                </Card>
              </Item>
            ))}
          </Stagger>
        </>
      )}
      </section>
    </>
  );
}