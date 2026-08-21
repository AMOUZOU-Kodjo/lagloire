import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Target,
  Heart,
  Clock,
  Calendar,
  Church,
  Users,
  Star,
  Sparkles,
  Mail,
} from "lucide-react";
import { statsApi } from "../../../api/stats.api";
import { Stagger, Item } from "../../../components/ui/motion";

const ACCENT = "#37cdbe";

const SECTIONS = [
  {
    id: "histoire",
    title: "Notre Histoire",
    icon: BookOpen,
    content:
      "Notre communauté est née d'une vision simple : offrir à chaque personne un lieu où rencontrer Dieu, grandir dans la foi et servir ensemble notre prochain.",
    color: ACCENT,
  },
  {
    id: "mission",
    title: "Notre Mission",
    icon: Target,
    content:
      "Aimer Dieu, servir notre prochain et faire grandir la foi en Jésus-Christ. Nous proclamons l'Évangile par notre vie, nos célébrations et nos actions.",
    color: "#4a90e2",
  },
  {
    id: "engagement",
    title: "Notre Engagement",
    icon: Heart,
    content:
      "Nous servons notre communauté avec amour et dévouement : assistance, prière, enseignement et accompagnement spirituel pour chacun, sans exception.",
    color: "#36d399",
  },
];

const VALUES = [
  { icon: Heart, label: "Amour", desc: "Au cœur de tout" },
  { icon: Users, label: "Communauté", desc: "Ensemble unis" },
  { icon: Star, label: "Foi", desc: "Notre fondement" },
  { icon: Sparkles, label: "Espérance", desc: "Tournés vers l'avenir" },
];

export default function AboutPage() {
  const { data: stats } = useQuery({
    queryKey: ["stats", "global"],
    queryFn: () => statsApi.general().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const yearsOfService = new Date().getFullYear() - 2000;
  const STATS = [
    { label: "Ans d'existence", value: `${yearsOfService}+`, icon: Clock },
    { label: "Publications", value: stats?.posts ?? "—", icon: BookOpen },
    { label: "Églises", value: stats?.churches ?? "—", icon: Church },
    { label: "Événements", value: stats?.totalEvents ?? "—", icon: Calendar },
    { label: "Abonnés", value: stats ? `${stats.subscribers}+` : "—", icon: Heart },
  ];

  return (
    <>
      {/* EN-TÊTE */}
      <section className="bg-gradient-to-br from-[#f2f2f2] via-white to-[#e5e6e6]">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">
          <Stagger delay={0.05}>
            <Item>
              <div className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[.12em] mb-3" style={{ color: ACCENT }}>
                <span>À propos</span>
                <span className="h-px w-10 bg-[#e5e6e6]" />
                <span>Qui sommes-nous ?</span>
              </div>
            </Item>
            <Item>
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-[#37cdbe]">
                En savoir plus sur notre communauté
              </h1>
            </Item>
            <Item>
              <p className="text-base text-[#6b7280] max-w-2xl mx-auto mt-4">
                Découvrez notre foi, notre mission et notre engagement au service de Dieu et de la communauté.
              </p>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* HISTOIRE / MISSION / ENGAGEMENT */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" inView>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Item key={section.id}>
                <article
                  className="bg-[#f2f2f2] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 h-full"
                  style={{ borderColor: section.color }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${section.color}1A` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: section.color }} />
                  </div>
                  <h3 className="font-display text-xl text-[#1f2937]">{section.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6b7280] mt-2">{section.content}</p>
                </article>
              </Item>
            );
          })}
        </Stagger>
      </section>

      {/* NOTRE IMPACT */}
      <section className="bg-[#f2f2f2] py-14">
        <div className="max-w-7xl mx-auto px-6">
          <Stagger inView>
            <Item>
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl text-[#1f2937]">Notre Impact</h2>
                <p className="text-sm text-[#6b7280] mt-2">Les chiffres clés de notre communauté</p>
              </div>
            </Item>
          </Stagger>
          <Stagger className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5" inView>
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Item key={stat.label}>
                  <div
                    className="bg-white p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow h-full"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${ACCENT}1A` }}>
                      <Icon className="w-6 h-6" style={{ color: ACCENT }} />
                    </div>
                    <p className="font-display text-3xl" style={{ color: ACCENT }}>{stat.value}</p>
                    <p className="text-sm text-[#6b7280] mt-1">{stat.label}</p>
                  </div>
                </Item>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* NOTRE COMMUNAUTÉ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <Stagger className="grid md:grid-cols-2 gap-12 items-center" inView>
          <Item>
          <div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${ACCENT}1A` }}>
              <Church className="w-8 h-8" style={{ color: ACCENT }} />
            </div>
            <h2 className="font-display text-3xl text-[#1f2937] mb-4">Notre Communauté</h2>
            <p className="text-base leading-relaxed text-[#6b7280] mb-6">
              Rejoignez notre communauté chrétienne chaleureuse et vivante.
              Ensemble, nous grandissons dans la foi, l'amour et le service.
              Que vous soyez nouveau dans la foi ou croyant confirmé,
              vous trouverez une place parmi nous.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <Mail size={16} /> Nous contacter
              </Link>
              <Link
                to="/eglises"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border font-medium transition hover:bg-[#37cdbe]/10"
                style={{ borderColor: ACCENT, color: ACCENT }}
              >
                <Calendar size={16} /> Nos églises
              </Link>
            </div>
          </div>
          </Item>
          <Item>
          <Stagger className="grid grid-cols-2 gap-4" stagger={0.09}>
            {VALUES.map((item) => {
              const Ic = item.icon;
              return (
                <Item key={item.label}>
                  <div className="bg-[#f2f2f2] rounded-2xl p-5 text-center hover:bg-[#e5e6e6] transition-colors h-full">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${ACCENT}1A` }}>
                      <Ic className="w-5 h-5" style={{ color: ACCENT }} />
                    </div>
                    <p className="font-semibold text-[#1f2937]">{item.label}</p>
                    <p className="text-xs text-[#6b7280] mt-1">{item.desc}</p>
                  </div>
                </Item>
              );
            })}
          </Stagger>
          </Item>
        </Stagger>
      </section>

      {/* APPEL À L'ACTION */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(135deg, ${ACCENT}, #2f9e93)` }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <Stagger inView>
            <Item>
              <h2 className="font-display text-3xl md:text-4xl mb-4">Prêt à nous rejoindre ?</h2>
            </Item>
            <Item>
              <p className="text-white/90 text-base md:text-lg mb-8 max-w-xl mx-auto">
                Venez vivre la foi avec nous et faire partie de notre communauté
              </p>
            </Item>
            <Item>
              <Link
                to="/eglises"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-white font-medium transition hover:bg-white/90"
                style={{ color: ACCENT }}
              >
                <Church size={20} /> Nous rendre visite
              </Link>
            </Item>
          </Stagger>
        </div>
      </section>
    </>
  );
}