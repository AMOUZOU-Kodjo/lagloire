import { Link } from "react-router-dom";
import { Landmark, Server, Copyright, ShieldAlert, Mail, Phone, MapPin } from "lucide-react";
import { PageHero } from "../../../components/ui";
import LegalSection from "../components/LegalSection";

const CHURCH_INFO = {
  name: "Église Temple du Dieu Vivant",
  email: "contact@etdv-communaute.tg",
  phone: "+228 90 00 00 00",
  address: "Lomé, Togo",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero
        eyebrow="Informations"
        title="Mentions légales"
        description="Les informations légales relatives au site de la communauté ETDV."
      />

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-6">
        <LegalSection icon={Landmark} title="Éditeur du site">
          <p>Le site <strong className="text-[#1f2937]">{CHURCH_INFO.name}</strong> (ci-après « ETDV ») est édité par :</p>
          <ul className="list-disc list-inside space-y-1 text-[#4b5563]">
            <li>Dénomination : {CHURCH_INFO.name}</li>
            <li>Adresse : {CHURCH_INFO.address}</li>
            <li>Email : {CHURCH_INFO.email}</li>
            <li>Téléphone : {CHURCH_INFO.phone}</li>
          </ul>
        </LegalSection>

        <LegalSection icon={Server} title="Hébergement">
          <p>
            Le site est hébergé par un prestataire d'hébergement web externe. Les coordonnées
            complètes de l'hébergeur peuvent être fournies sur simple demande via le formulaire de contact.
          </p>
        </LegalSection>

        <LegalSection icon={Copyright} title="Propriété intellectuelle">
          <p>
            L'ensemble des contenus présents sur ce site (textes, images, logos, photos, vidéos,
            éléments graphiques) est la propriété exclusive d'ETDV, sauf mention contraire.
            Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation
            écrite préalable est interdite et constitue une contrefaçon.
          </p>
        </LegalSection>

        <LegalSection icon={ShieldAlert} title="Responsabilité">
          <p>
            ETDV s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur
            ce site, mais ne peut garantir l'absence d'erreurs ou d'omissions. Les informations
            publiées sont fournies à titre indicatif et ne sauraient engager la responsabilité d'ETDV.
          </p>
        </LegalSection>

        <LegalSection icon={Mail} title="Contact">
          <p>Pour toute question relative aux mentions légales, vous pouvez nous joindre :</p>
          <ul className="space-y-2 text-[#4b5563]">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#37cdbe]" />
              <a href={`mailto:${CHURCH_INFO.email}`} className="hover:text-[#37cdbe] transition-colors">{CHURCH_INFO.email}</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#37cdbe]" />
              <a href="tel:+22890000000" className="hover:text-[#37cdbe] transition-colors">{CHURCH_INFO.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#37cdbe]" />
              {CHURCH_INFO.address}
            </li>
          </ul>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: "#37cdbe" }}
            >
              <Mail size={16} /> Nous contacter
            </Link>
          </div>
        </LegalSection>

        <p className="text-xs text-[#6b7280] pt-2">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </div>
    </>
  );
}