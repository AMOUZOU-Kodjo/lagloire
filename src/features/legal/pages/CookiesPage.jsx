import { Link } from "react-router-dom";
import { Cookie, Info, Gauge, Settings, Mail } from "lucide-react";
import { PageHero } from "../../../components/ui";
import LegalSection from "../components/LegalSection";

const CHURCH_INFO = {
  name: "Église Temple du Dieu Vivant",
  email: "contact@etdv-communaute.tg",
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Vie privée"
        title="Politique de cookies"
        description="Ce que sont les cookies, lesquels nous utilisons et comment les gérer."
      />

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-6">
        <LegalSection icon={Info} title="Qu'est-ce qu'un cookie ?">
          <p>
            Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette,
            téléphone) lors de la visite d'un site web. Il permet de reconnaître votre navigateur,
            de mémoriser vos préférences et de mesurer l'audience du site.
          </p>
        </LegalSection>

        <LegalSection icon={Cookie} title="Cookies utilisés sur ce site">
          <ul className="list-disc list-inside space-y-1 text-[#4b5563]">
            <li>
              <strong className="text-[#1f2937]">Cookies essentiels :</strong> nécessaires au
              fonctionnement du site (session de connexion, préférences d'affichage). Ils ne
              peuvent pas être désactivés.
            </li>
            <li>
              <strong className="text-[#1f2937]">Cookies de mesure d'audience :</strong> nous
              permettent de comprendre comment le site est utilisé (pages visitées, durée de
              visite) afin de l'améliorer.
            </li>
            <li>
              <strong className="text-[#1f2937]">Cookies tiers :</strong> déposés par des services
              externes intégrés au site (polices d'écriture, cartes, vidéos). Leur utilisation est
              soumise à la politique de confidentialité du tiers concerné.
            </li>
          </ul>
        </LegalSection>

        <LegalSection icon={Gauge} title="Durée de conservation">
          <p>
            Les cookies de session sont supprimés à la fermeture de votre navigateur. Les cookies
            de préférence et de mesure d'audience sont conservés au maximum 13 mois.
          </p>
        </LegalSection>

        <LegalSection icon={Settings} title="Gérer vos cookies">
          <p>
            Vous pouvez à tout moment configurer votre navigateur pour accepter, refuser ou
            supprimer les cookies. La procédure varie selon le navigateur utilisé :
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#4b5563]">
            <li>Chrome : menu Paramètres → Confidentialité et sécurité → Cookies ;</li>
            <li>Firefox : menu Options → Vie privée et sécurité → Cookies ;</li>
            <li>Safari : menu Préférences → Confidentialité → Cookies ;</li>
            <li>Edge : menu Paramètres → Confidentialité et services → Cookies.</li>
          </ul>
          <p>
            Le refus des cookies essentiels peut empêcher certaines fonctionnalités du site de
            fonctionner correctement.
          </p>
        </LegalSection>

        <LegalSection icon={Mail} title="Contact">
          <p>
            Pour toute question relative à l'utilisation des cookies, contactez-nous à :{" "}
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