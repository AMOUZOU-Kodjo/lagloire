import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CalendarDays,
  CalendarHeart,
  Newspaper,
  Images,
  Church,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  Heart,
  Users,
} from "lucide-react";
import { FaFacebook, FaWhatsapp, FaTwitter, FaYoutube } from "react-icons/fa";
import { subscriptionsApi } from "../../api/subscriptions.api";
import { statsApi } from "../../api/stats.api";

const ACCENT = "#37cdbe";

const CHURCH_INFO = {
  name: "Église Temple du Dieu Vivant",
  phone: "+228 90 00 00 00",
  email: "contact@etdv-communaute.tg",
  address: "Lomé, Togo",
  founded: 2000,
  hours: [
    { day: "Lun - Ven", hours: "09:00 - 18:00" },
    { day: "Samedi", hours: "09:00 - 12:00" },
    { day: "Dimanche", hours: "08:00 - 12:00" },
  ],
};

const NAV = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/programme", label: "Programme", icon: CalendarDays },
  { to: "/evenements", label: "Événements", icon: CalendarHeart },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
  { to: "/galerie", label: "Galerie", icon: Images },
  { to: "/eglises", label: "Nos Églises", icon: Church },
  { to: "/contact", label: "Contact", icon: Mail },
];

const SOCIALS = [
  { icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=61564484227797", label: "Facebook", color: "hover:bg-[#1877f2]" },
  { icon: FaWhatsapp, url: "https://wa.me/228910387", label: "WhatsApp", color: "hover:bg-[#25d366]" },
  { icon: FaTwitter, url: "https://twitter.com/etde815", label: "Twitter", color: "hover:bg-[#1da1f2]" },
  { icon: FaYoutube, url: "https://www.youtube.com/@etde815", label: "YouTube", color: "hover:bg-[#dc2626]" },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Adresse email invalide");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await subscriptionsApi.subscribe({ email });
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]/50" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="Votre email"
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border focus:outline-none focus:ring-2 transition-all text-sm ${
            error
              ? "border-[#dc2626] focus:ring-[#dc2626]/20"
              : "border-[#e5e6e6] focus:ring-[#37cdbe]/30 focus:border-[#37cdbe]"
          }`}
        />
      </div>

      {error && (
        <p className="text-[#dc2626] text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className={`w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2 ${
          success ? "bg-[#16a34a]" : "bg-[#37cdbe] hover:bg-[#2f9e93]"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Inscription…
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Inscrit !
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            S'abonner
          </>
        )}
      </button>

      <p className="text-xs text-[#6b7280]">En vous inscrivant, vous acceptez de recevoir nos actualités.</p>
    </form>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 bg-[#37cdbe] text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
          aria-label="Retour en haut"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Footer() {
  const location = useLocation();
  const yearsActive = new Date().getFullYear() - CHURCH_INFO.founded;

  const { data: globalStats } = useQuery({
    queryKey: ["stats", "global"],
    queryFn: () => statsApi.general().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <footer className="relative bg-[#f2f2f2] text-[#1f2937] border-t border-[#e5e6e6] pt-16 pb-8 overflow-hidden">
        {/* Motif de fond décoratif */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Bande décorative en haut */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#37cdbe] via-[#4a90e2] to-[#37cdbe]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section principale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
            {/* Marque */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="/etdv_logo.png"
                  alt="Logo Église ETDV"
                  className="w-12 h-12 rounded-full object-cover border-2"
                  style={{ borderColor: ACCENT }}
                />
                <div>
                  <h3 className="font-display text-lg text-[#37cdbe] leading-tight">{CHURCH_INFO.name}</h3>
                  <p className="text-xs text-[#6b7280]">Depuis {CHURCH_INFO.founded} · Lomé, Togo</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#6b7280]">
                Une communauté de foi vivante, engagée à servir Dieu et à aimer notre prochain.
              </p>

              <div className="flex items-center gap-2">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className={`p-2.5 rounded-full border border-[#e5e6e6] bg-white text-[#4b5563] transition-all duration-300 ${s.color} hover:border-transparent hover:text-white`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e5e6e6]">
                  <Clock className="w-3.5 h-3.5 text-[#37cdbe]" />
                  <span className="text-sm font-bold text-[#37cdbe]">{yearsActive}+</span>
                  <span className="text-xs text-[#6b7280]">ans de service</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e5e6e6]">
                  <Users className="w-3.5 h-3.5 text-[#37cdbe]" />
                  <span className="text-sm font-bold text-[#37cdbe]">
                    {globalStats ? `${globalStats.members}+` : "—"}
                  </span>
                  <span className="text-xs text-[#6b7280]">membres</span>
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="lg:col-span-2">
              <h3 className="font-display text-lg text-[#37cdbe] mb-4 flex items-center gap-2">
                Navigation
                <span className="h-px flex-1 bg-gradient-to-r from-[#37cdbe] to-transparent" />
              </h3>
              <ul className="space-y-2.5">
                {NAV.map((l) => {
                  const Icon = l.icon;
                  const isActive = location.pathname === l.to;
                  return (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className={`flex items-center gap-2 text-sm transition-colors hover:text-[#37cdbe] ${
                          isActive ? "text-[#37cdbe] font-medium" : "text-[#4b5563]"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h3 className="font-display text-lg text-[#37cdbe] mb-4 flex items-center gap-2">
                Contact
                <span className="h-px flex-1 bg-gradient-to-r from-[#37cdbe] to-transparent" />
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 rounded-full bg-[#37cdbe]/10 flex items-center justify-center text-[#37cdbe] flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </span>
                  <a href="tel:+22890000000" className="text-[#4b5563] hover:text-[#37cdbe] transition-colors">
                    {CHURCH_INFO.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 rounded-full bg-[#37cdbe]/10 flex items-center justify-center text-[#37cdbe] flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <a href={`mailto:${CHURCH_INFO.email}`} className="text-[#4b5563] hover:text-[#37cdbe] transition-colors break-all">
                    {CHURCH_INFO.email}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 rounded-full bg-[#37cdbe]/10 flex items-center justify-center text-[#37cdbe] flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span className="text-[#4b5563]">{CHURCH_INFO.address}</span>
                </li>
              </ul>

              <div className="mt-5 p-3.5 bg-white/70 border border-[#e5e6e6] rounded-xl">
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-2.5 flex items-center gap-2 text-[#1f2937]">
                  <Clock className="w-3.5 h-3.5 text-[#37cdbe]" />
                  Horaires des cultes
                </h4>
                <ul className="space-y-1.5 text-xs text-[#4b5563]">
                  {CHURCH_INFO.hours.map((item, index) => (
                    <li key={index} className="flex justify-between gap-4">
                      <span>{item.day}</span>
                      <span className="font-medium text-[#1f2937] whitespace-nowrap">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <h3 className="font-display text-lg text-[#37cdbe] mb-4 flex items-center gap-2">
                Newsletter
                <span className="h-px flex-1 bg-gradient-to-r from-[#37cdbe] to-transparent" />
              </h3>

              <p className="text-sm text-[#6b7280] mb-4">
                Recevez nos dernières actualités et méditations directement dans votre boîte mail.
              </p>

              <NewsletterForm />
            </div>
          </div>

          {/* Séparateur */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#37cdbe] to-transparent my-8" />

          {/* Copyright et mentions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#6b7280]">
              © {new Date().getFullYear()}
              <span className="text-[#37cdbe] font-bold mx-1">Temple du Dieu Vivant</span>
              — Tous droits réservés
            </p>

            <div className="flex gap-4 text-xs">
              <Link to="/mentions-legales" className="text-[#6b7280] hover:text-[#37cdbe] transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="text-[#6b7280] hover:text-[#37cdbe] transition-colors">Confidentialité</Link>
              <Link to="/cookies" className="text-[#6b7280] hover:text-[#37cdbe] transition-colors">Cookies</Link>
            </div>

            <p className="text-xs text-[#6b7280] flex items-center gap-1">
              Fait avec <Heart className="w-3 h-3 text-[#dc2626] fill-current" /> pour Dieu
            </p>
          </div>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}