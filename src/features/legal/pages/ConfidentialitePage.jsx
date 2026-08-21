import { Link } from "react-router-dom";
import { User, Database, Lock, Clock, Share2, FileCheck, ShieldCheck, Mail } from "lucide-react";
import { PageHero } from "../../../components/ui";
import LegalSection from "../components/LegalSection";

const CHURCH_INFO = {
  name: "Église Temple du Dieu Vivant",
  email: "contact@etdv-communaute.tg",
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero
        eyebrow="Vie privée"
        title="Politique de confidentialité"
        description="Comment nous collectons, utilisons et protégeons vos données personnelles."
      />

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-6">
        <LegalSection icon={User} title="Données collectées">
          <p>Dans le cadre de l'utilisation du site, nous sommes susceptibles de collecter :</p>
          <ul className="list-disc list-inside space-y-1 text-[#4b5563]">
            <li>les informations de contact (nom, adresse email, numéro de téléphone) via les formulaires du site ;</li>
            <li>les informations de compte (nom, email, rôle) lors de la création d'un espace membre ;</li>
            <li>les messages envoyés via le formulaire de contact ou la messagerie ;</li>
            <li>des données de navigation (pages visitées, durée de visite) à des fins statistiques.</li>
          </ul>
        </LegalSection>

        <LegalSection icon={Database} title="Finalités du traitement">
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul className="list-disc list-inside space-y-1 text-[#4b5563]">
            <li>répondre à vos demandes et messages ;</li>
            <li>vous envoyer la newsletter à laquelle vous avez consenti ;</li>
            <li>gérer les comptes membres et l'accès à l'espace personnel ;</li>
            <li>améliorer le contenu et le fonctionnement du site.</li>
          </ul>
        </LegalSection>

        <LegalSection icon={Lock} title="Consentement et base légale">
          <p>
            Les traitements reposent sur votre consentement, recueilli lors de la collecte
            (inscription à la newsletter, envoi d'un formulaire), ou sur l'exécution de prestations
            que vous demandez. Vous pouvez retirer votre consentement à tout moment en nous contactant.
          </p>
        </LegalSection>

        <LegalSection icon={Clock} title="Durée de conservation">
          <p>
            Vos données sont conservées uniquement le temps nécessaire aux finalités décrites :
            les messages de contact sont conservés le temps du traitement de votre demande et les
            comptes membres le temps de votre inscription. Elles sont ensuite supprimées ou anonymisées.
          </p>
        </LegalSection>

        <LegalSection icon={Share2} title="Partage des données">
          <p>
            Nous ne vendons ni ne louons vos données personnelles. Elles ne sont partagées qu'avec
            les prestataires techniques strictement nécessaires au fonctionnement du site
            (hébergement, envoi d'emails), lesquels s'engagent à respecter la confidentialité des données.
          </p>
        </LegalSection>

        <LegalSection icon={FileCheck} title="Vos droits">
          <p>Conformément à la réglementation applicable en matière de protection des données, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside space-y-1 text-[#4b5563]">
            <li>droit d'accès à vos données personnelles ;</li>
            <li>droit de rectification des données inexactes ;</li>
            <li>droit à la suppression de vos données ;</li>
            <li>droit d'opposition au traitement de vos données.</li>
          </ul>
        </LegalSection>

        <LegalSection icon={ShieldCheck} title="Sécurité">
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
            protéger vos données contre tout accès non autorisé, altération, perte ou divulgation.
          </p>
        </LegalSection>

        <LegalSection icon={Mail} title="Contact">
          <p>
            Pour exercer vos droits ou poser toute question relative à cette politique,
            contactez-nous à :{" "}
            <a href={`mailto:${CHURCH_INFO.email}`} className="text-[#37cdbe] hover:underline">
              {CHURCH_INFO.email}
            </a>
          </p>
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