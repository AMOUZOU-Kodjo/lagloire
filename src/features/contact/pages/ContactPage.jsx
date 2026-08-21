import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Info, Mail, Phone, MapPin, Send, User, FileText, AlertCircle, Shield, Check, Copy, Loader } from "lucide-react";
import { contactApi } from "../../../api/contact.api";
import { churchApi } from "../../../api/church.api";
import { queryKeys } from "../../../lib/queryKeys";
import { Select, PageHero } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";
import { contactSchema, contactDefaultValues } from "../schemas/contactSchema";

const CHURCH_INFO = {
  name: "Église Temple du Dieu Vivant",
  email: "contact@etdv-communaute.tg",
  phone: "+228 90 00 00 00",
  phoneHref: "tel:+22890000000",
  address: "Lomé, Togo",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.123456!2d0.914092!3d6.683333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1026bf002690c053%3A0x34ca13adae2ad0f!2sETDV+BANIKOP%C3%89+(Temple+B%C3%A9thel),+Togo!5e0!3m2!1sfr!2stg!4v1690000000000!5m2!1sfr!2stg",
};

function Field({ label, required, icon: Icon, error, children }) {
  const inputCls = `w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
    error
      ? "border-[#dc2626] focus:ring-[#dc2626]/20 focus:border-[#dc2626]"
      : "border-[#e5e6e6] focus:ring-[#37cdbe]/30 focus:border-[#37cdbe]"
  } ${Icon ? "pl-10" : ""}`;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#374151]">
          {label} {required && <span className="text-[#37cdbe] ml-1">*</span>}
        </span>
        {error && (
          <span className="text-xs text-[#dc2626] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </span>
        )}
      </div>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]/50">
            <Icon className="w-4 h-4" />
          </span>
        )}
        {children({ inputCls })}
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, href, text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 group">
      <span className="shrink-0 w-10 h-10 bg-[#37cdbe]/10 rounded-lg flex items-center justify-center text-[#37cdbe] group-hover:bg-[#37cdbe]/20 transition-colors">
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm text-[#6b7280] flex items-center gap-2">
          {label}
          {href && (
            <button
              type="button"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copier"
            >
              {copied ? <Check className="w-3 h-3 text-[#16a34a]" /> : <Copy className="w-3 h-3 text-[#6b7280] hover:text-[#374151]" />}
            </button>
          )}
        </p>
        {href ? (
          <a href={href} className="text-[#1f2937] hover:text-[#37cdbe] transition-colors font-medium break-all">
            {text}
          </a>
        ) : (
          <p className="text-[#1f2937] font-medium">{text}</p>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: contactDefaultValues,
  });

  const recipientType = watch("recipientType");

  const { data: leaders } = useQuery({
    queryKey: ["leadership", "public"],
    queryFn: () => churchApi.leadership({}).then((r) => r.data).catch(() => []),
  });

  const sendMutation = useMutationFeedback({
    mutationFn: (values) =>
      contactApi.send({
        ...values,
        recipientId: values.recipientType === "PASTEUR" ? values.recipientId : undefined,
      }),
    invalidate: [queryKeys.contacts.all],
    successMessage: "Votre message a bien été envoyé, merci !",
    onSuccess: () => reset(),
  });

  const pastors = (leaders ?? []).filter((l) => l.role === "PASTEUR");

  const segmented = (value) =>
    `py-2.5 rounded-lg text-sm font-medium transition ${
      recipientType === value
        ? "bg-white text-[#37cdbe] shadow-sm border border-[#e5e6e6]"
        : "text-[#6b7280] hover:text-[#37cdbe]"
    }`;

  return (
    <>
      <PageHero
        eyebrow="Nous écrire"
        title="Contactez-nous"
        description="Nous sommes là pour répondre à vos questions et prier avec vous."
      />

      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Informations de contact + formulaire */}
        <Stagger className="grid lg:grid-cols-2 gap-8 items-stretch" inView delay={0.05}>
        <Item className="flex">
        <div className="flex flex-col overflow-hidden rounded-2xl flex-1">
          <div className="p-8 grow">
            <h2 className="font-display text-2xl mb-6 text-[#37cdbe] flex items-center gap-2">
              <Info className="w-6 h-6" />
              {CHURCH_INFO.name}
            </h2>

            <div className="space-y-6">
              <ContactInfo icon={Mail} href={`mailto:${CHURCH_INFO.email}`} text={CHURCH_INFO.email} label="Email" />
              <ContactInfo icon={Phone} href={CHURCH_INFO.phoneHref} text={CHURCH_INFO.phone} label="Téléphone" />
              <ContactInfo icon={MapPin} text={CHURCH_INFO.address} label="Adresse" />
            </div>
          </div>

          <div className="h-64 w-full mt-auto">
            <iframe
              src={CHURCH_INFO.mapUrl}
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
              title="Localisation de l'église"
            />
          </div>
        </div>
        </Item>

        {/* Formulaire de contact */}
        <Item className="flex">
        <div className="p-8 rounded-2xl border-t lg:border-t-0 lg:border-l border-[#e5e6e6] lg:pl-8 flex-1">
          <h2 className="font-display text-2xl mb-6 text-[#37cdbe] flex items-center gap-2">
            <Send className="w-6 h-6" />
            Envoyez-nous un message
          </h2>

          <form onSubmit={handleSubmit((values) => sendMutation.mutate(values))} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[#374151]">
                  Destinataire <span className="text-[#37cdbe] ml-1">*</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 bg-[#f2f2f2] rounded-xl p-1">
                <button type="button" onClick={() => setValue("recipientType", "APOTRE")} className={segmented("APOTRE")}>
                  L'apôtre / coordination
                </button>
                <button type="button" onClick={() => setValue("recipientType", "PASTEUR")} className={segmented("PASTEUR")}>
                  Un pasteur
                </button>
              </div>

              {recipientType === "PASTEUR" && (
                <div className="mt-3">
                  <Select {...register("recipientId")}>
                    <option value="">Choisir un pasteur</option>
                    {pastors.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.church?.name}</option>)}
                  </Select>
                  {errors.recipientId?.message && (
                    <span className="text-xs text-[#dc2626] flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.recipientId.message}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom complet" required icon={User} error={errors.name?.message}>
                {({ inputCls }) => <input className={inputCls} placeholder="Kodjo Marcellin" {...register("name")} />}
              </Field>

              <Field label="Adresse email" required icon={Mail} error={errors.email?.message}>
                {({ inputCls }) => <input type="email" className={inputCls} placeholder="contact@gmail.com" {...register("email")} />}
              </Field>
            </div>

            <Field label="Sujet" required icon={FileText} error={errors.subject?.message}>
              {({ inputCls }) => <input className={inputCls} placeholder="Question sur les cultes" {...register("subject")} />}
            </Field>

            <Field label="Message" required error={errors.message?.message}>
              {({ inputCls }) => <textarea rows={5} className={`${inputCls} resize-none`} placeholder="Décrivez votre demande en détail…" {...register("message")} />}
            </Field>

            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2f9e93] text-white text-sm font-medium hover:bg-[#2b8d83] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-[#6b7280] pt-1">
              <Shield className="w-3 h-3" />
              <span>Vos données sont protégées et ne seront jamais partagées</span>
            </div>
          </form>
        </div>
        </Item>
        </Stagger>
      </section>
    </>
  );
}