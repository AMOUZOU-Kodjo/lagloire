import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaYoutube,
  FaHeart,
  FaCross,
  FaBible,
} from "react-icons/fa";
import { eventsApi } from "../../../api/events.api";
import { postsApi } from "../../../api/posts.api";
import { churchApi } from "../../../api/church.api";
import { liveStreamApi } from "../../../api/liveStream.api";
import { statsApi } from "../../../api/stats.api";
import { queryKeys } from "../../../lib/queryKeys";
import { Card } from "../../../components/ui";
import EventCard from "../../evenements/components/EventCard";
import { truncate } from "../../../lib/formatters";
import { churchCover } from "../../../lib/covers";
import { Clock, Users, Church, Calendar, MapPin } from "lucide-react";

const ACCENT = "#37cdbe";

const BIBLE_VERSE = {
  text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
  reference: "Matthieu 11:28",
};

const SOCIALS = [
  {
    icon: FaFacebook,
    url: "https://www.facebook.com/profile.php?id=61564484227797",
    label: "Facebook",
    color: "hover:bg-[#2563eb]",
  },
  {
    icon: FaWhatsapp,
    url: "https://wa.me/228910387",
    label: "WhatsApp",
    color: "hover:bg-[#16a34a]",
  },
  {
    icon: FaTwitter,
    url: "https://twitter.com/etde815",
    label: "Twitter",
    color: "hover:bg-[#0ea5e9]",
  },
  {
    icon: FaYoutube,
    url: "https://www.youtube.com/@etde815",
    label: "YouTube",
    color: "hover:bg-[#dc2626]",
  },
];

const FEATURES = [
  { icon: FaHeart, text: "Amour et Compassion" },
  { icon: FaCross, text: "Foi et Espérance" },
  { icon: FaBible, text: "Enseignement Biblique" },
];

// Composant pour les icônes sociales
function SocialIcon({ Icon, url, label, color }) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`
        group relative rounded-full border-2 border-[#37cdbe] p-3.5 text-xl
        text-[#37cdbe] transition-all duration-300 hover:text-white
        hover:shadow-lg hover:-translate-y-1 ${color}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="transition-transform duration-300 group-hover:scale-110" />

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2
                       text-xs bg-[#e5e6e6] px-2 py-1 rounded opacity-0
                       group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-[#1f2937]">
        {label}
      </span>
    </motion.a>
  );
}

// Composant pour les fonctionnalités
function FeatureCard({ Icon, text, index }) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-[#f2f2f2]/50 rounded-lg"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="p-2 bg-[#37cdbe]/10 rounded-full">
        <Icon className="text-[#37cdbe] text-xl" />
      </div>
      <span className="text-[#1f2937]/80 font-medium">{text}</span>
    </motion.div>
  );
}

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[.12em] mb-2" style={{ color: ACCENT }}>
      <span>{children}</span>
      <span className="h-px flex-1 bg-[#e5e6e6]" />
    </div>
  );
}

export default function HomePage() {
  const { data: currentLive } = useQuery({
    queryKey: queryKeys.live.current,
    queryFn: () => liveStreamApi.current().then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: events } = useQuery({
    queryKey: ["events", "home"],
    queryFn: () => eventsApi.list({ limit: 3, status: "PLANIFIE" }).then((r) => r.data),
  });

  const { data: posts } = useQuery({
    queryKey: ["posts", "home"],
    queryFn: () => postsApi.list({ limit: 2 }).then((r) => r.data),
  });

  const { data: churches } = useQuery({
    queryKey: ["churches", "home"],
    queryFn: () => churchApi.list().then((r) => r.data),
  });

  const { data: globalStats } = useQuery({
    queryKey: ["stats", "global"],
    queryFn: () => statsApi.general().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const serviceStartYear = 2000;
  const yearsOfService = new Date().getFullYear() - serviceStartYear;
  const stats = [
    { key: "years", value: `${yearsOfService}+`, label: "Années de service", icon: Clock },
    { key: "members", value: `${globalStats?.members ?? "—"}`, label: "Membres", icon: Users },
    { key: "churches", value: `${globalStats?.churches ?? "—"}`, label: "Églises", icon: Church },
    {
      key: "events",
      value: `${globalStats?.upcomingEvents ?? "—"}`,
      label: "Événements à venir",
      icon: Calendar,
    },
  ];

  // Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f2f2f2] to-[#e5e6e6]">
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

        {/* Élément décoratif flottant */}
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 bg-[#37cdbe]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#37cdbe] mb-2">
              Bienvenue Au Temple du Dieu Vivant
            </h1>
            <p className="text-lg md:text-xl text-[#1f2937]/60 mb-8">
              Un lieu de paix, d'amour et de renaissance spirituelle
            </p>
          </motion.div>

          <div className="flex flex-col-reverse lg:flex-row justify-center items-center gap-12">
            {/* Section Texte */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="lg:w-[58%]"
            >
              <div className="relative">
                {/* Badge de bienvenue */}
                <motion.div
                  className="absolute -top-9 left-4 bg-[#37cdbe] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg"
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  🙏 Béni soit Dieu
                </motion.div>

                <div className="bg-[#f2f2f2]/80 backdrop-blur-sm border-l-4 border-[#37cdbe] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  {/* Message d'accueil */}
                  <p className="text-[#1f2937]/80 leading-relaxed text-lg">
                    Nous sommes heureux de vous accueillir sur le site officiel de
                    notre communauté chrétienne. Ici, chaque âme est précieuse,
                    chaque cœur est une promesse, et chaque visite est une bénédiction.
                  </p>

                  {/* Verset biblique */}
                  <motion.div
                    className="my-8 p-6 bg-gradient-to-r from-[#37cdbe]/20 to-transparent rounded-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <blockquote className="text-center">
                      <p className="text-xl font-bold mb-3">"{BIBLE_VERSE.text}"</p>
                      <footer className="text-[#37cdbe] font-semibold">
                        — {BIBLE_VERSE.reference}
                      </footer>
                    </blockquote>
                  </motion.div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                    {FEATURES.map((feature, index) => (
                      <FeatureCard
                        key={feature.text}
                        Icon={feature.icon}
                        text={feature.text}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mt-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/contact"
                        className="btn btn-accent px-8 py-3.5 text-base gap-2.5 shadow-lg hover:shadow-xl transition-all"
                      >
                        <span>Contactez-nous</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </motion.div>

                    {/* Réseaux sociaux */}
                    <div className="flex gap-3">
                      {SOCIALS.map((social, index) => (
                        <SocialIcon
                          key={index}
                          Icon={social.icon}
                          url={social.url}
                          label={social.label}
                          color={social.color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section Image */}
            <motion.div
              className="lg:w-[42%] flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative group">
                {/* Cercles décoratifs */}
                <div className="absolute inset-0 rounded-full bg-[#37cdbe]/20 blur-3xl group-hover:bg-[#37cdbe]/30 transition-all duration-500" />

                {/* Image principale */}
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="/etdv_logo.png"
                    alt="Logo de l'église - Temple du Dieu Vivant"
                    className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-full
                             shadow-2xl border-4 border-[#37cdbe]
                             group-hover:shadow-[#37cdbe]/50 transition-all duration-300"
                    loading="lazy"
                  />
                </motion.div>

                {/* Badge flottant */}
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-[#37cdbe] text-white
                             px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-20"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Depuis 2000 ✨
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATISTIQUES ===== */}
      <section className="bg-[#f2f2f2] py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.key}
                  className="bg-white rounded-xl p-6 text-center shadow-sm border border-[#e5e6e6] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#37cdbe]/10 text-[#37cdbe] flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <div className="text-3xl font-bold text-[#1f2937] font-display">{stat.value}</div>
                  <div className="text-sm text-[#1f2937]/60 mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BANDE LIVE */}
      {currentLive?.status === "EN_DIRECT" && (
        <div className="bg-red-500 text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span className="font-semibold">EN DIRECT :</span> {currentLive.title}
            </div>
            <Link to="/direct" className="underline underline-offset-2 font-medium">Rejoindre →</Link>
          </div>
        </div>
      )}

      {/* EGLISES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div className="flex-1">
            <Eyebrow>Nos assemblées</Eyebrow>
            <h2 className="font-display text-3xl text-[#1f2937]">Cinq églises, une même famille</h2>
          </div>
          <Link to="/eglises" className="text-sm font-semibold text-[#37cdbe]">Voir toutes les églises →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {(churches ?? []).slice(0, 3).map((church) => (
            <Link key={church.id} to={`/eglises/${church.id}`} className="group">
              <Card className="overflow-hidden p-0 h-full hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[16/9] overflow-hidden bg-[#e5e6e6]">
                  <img
                    src={churchCover(church)}
                    alt={church.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="font-display text-lg text-[#1f2937]">{church.name}</p>
                  <p className="text-sm mt-1 text-[#6b7280] flex items-center gap-1.5">
                    <MapPin size={14} /> {church.city} — {church._count?.members ?? 0} membres
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* EVENEMENTS */}
      <section className="bg-[#f2f2f2] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div className="flex-1">
              <Eyebrow>Agenda</Eyebrow>
              <h2 className="font-display text-3xl text-[#1f2937]">Prochains événements</h2>
            </div>
            <Link to="/evenements" className="text-sm font-semibold text-[#37cdbe]">Tout l'agenda →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {(events ?? []).slice(0, 3).map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ACTUALITES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div className="flex-1">
            <Eyebrow>Vie de la communauté</Eyebrow>
            <h2 className="font-display text-3xl text-[#1f2937]">Dernières actualités</h2>
          </div>
          <Link to="/actualites" className="text-sm font-semibold text-[#37cdbe]">Toutes les actualités →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {(posts ?? []).map((post, i) => (
            <Link key={post.id} to={`/actualites/${post.id}`} className="card rounded-lg p-6 flex flex-col sm:flex-row gap-5 hover:shadow-lg transition">
              <div
                className="w-full h-32 sm:w-24 sm:h-24 rounded-md flex-shrink-0"
                style={{ background: i % 2 ? "linear-gradient(135deg,#37cdbe,#4a90e2)" : "linear-gradient(135deg,#4a90e2,#1f2937)" }}
              />
              <div>
                <p className="text-xs font-mono text-[#6b7280]">{post.category?.name}</p>
                <p className="font-display text-lg mt-1">{post.title}</p>
                <p className="text-sm mt-2 text-[#6b7280]">{truncate(post.excerpt, 120)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}