import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users, HeartHandshake, UserPlus, Church, Search, Building2, Sparkles,
  MapPin, Lock, X, ArrowRight, SearchX, LayoutGrid, Table2, Printer,
} from "lucide-react";
import { churchApi } from "../../../api/church.api";
import { useAuthStore } from "../../../store/authStore";
import { MINISTRIES, ROLE_LABELS } from "../../../lib/constants";
import { churchCover } from "../../../lib/covers";
import { Select, Input, Card, Pagination, EmptyState, PageHero, Button, CardSkeleton } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import MemberCard from "../components/MemberCard";

const TABS = [
  { value: "leadership", label: "Responsables", icon: Users },
  { value: "members", label: "Fidèles", icon: HeartHandshake },
  { value: "visitors", label: "Visiteurs", icon: UserPlus },
  { value: "churches", label: "Nos Églises", icon: Church },
];

const TAB_DESCRIPTIONS = {
  leadership: "Les pasteurs, anciens et responsables de nos assemblées.",
  members: "Les fidèles inscrits de la communauté.",
  visitors: "Les personnes de passage qui nous rendent visite.",
  churches: "Les églises locales du Temple du Dieu Vivant.",
};

const formatMinistry = (m) =>
  m.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");

function ChurchCard({ church }) {
  const members = church._count?.members ?? 0;
  const cover = churchCover(church);
  return (
    <Card className="p-0 overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className="relative h-24 overflow-hidden">
        {church.imageUrl ? (
          <img
            src={cover}
            alt={church.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/25 via-gold/10 to-transparent flex items-center justify-center">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full border-t border-gold/30" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-t border-gold/20" />
            <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/95 shadow-md flex items-center justify-center text-gold-dim">
              <Church size={22} strokeWidth={2} />
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="font-display text-lg text-ink truncate">{church.name}</p>
        <p className="text-xs text-soft mt-1 flex items-center gap-1.5">
          <MapPin size={12} className="flex-shrink-0 text-gold-dim" />
          {church.city}, {church.country}
        </p>
        <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-soft">
            <Users size={13} className="text-gold-dim" />
            {members} membre{members > 1 ? "s" : ""}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[.12em] text-soft group-hover:text-gold-dim transition-colors">
            Église locale
          </span>
        </div>
      </div>
    </Card>
  );
}

function ViewToggle({ view, setView }) {
  return (
    <div className="inline-flex gap-1 p-1 rounded-lg bg-sand-2 border border-line">
      {[
        { value: "cards", icon: LayoutGrid, label: "Cartes" },
        { value: "table", icon: Table2, label: "Tableau" },
      ].map((v) => {
        const Icon = v.icon;
        const isActive = view === v.value;
        return (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            title={v.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              isActive ? "bg-white text-gold-dim shadow-sm" : "text-soft hover:text-ink"
            }`}
          >
            <Icon size={14} /> {v.label}
          </button>
        );
      })}
    </div>
  );
}

function MemberTable({ members }) {
  return (
    <div className="card rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-sand-2 text-left text-[11px] font-mono uppercase tracking-wider text-soft">
            <th className="px-4 py-3 w-10">#</th>
            <th className="px-4 py-3">Nom complet</th>
            <th className="px-4 py-3">Rôle</th>
            <th className="px-4 py-3">Ministère</th>
            <th className="px-4 py-3">Église</th>
            <th className="px-4 py-3">Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.id} className="border-t border-line hover:bg-sand-2/60 transition-colors">
              <td className="px-4 py-2.5 text-soft font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
              <td className="px-4 py-2.5 font-medium text-ink">{m.firstName} {m.lastName}</td>
              <td className="px-4 py-2.5">{ROLE_LABELS[m.role] ?? m.role}</td>
              <td className="px-4 py-2.5">{m.ministry && m.ministry !== "AUCUN" ? formatMinistry(m.ministry) : "—"}</td>
              <td className="px-4 py-2.5">{m.church?.name ?? "—"}</td>
              <td className="px-4 py-2.5 whitespace-nowrap">{m.phone ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChurchTable({ churches }) {
  return (
    <div className="card rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-sand-2 text-left text-[11px] font-mono uppercase tracking-wider text-soft">
            <th className="px-4 py-3 w-10">#</th>
            <th className="px-4 py-3">Église</th>
            <th className="px-4 py-3">Ville</th>
            <th className="px-4 py-3">Pays</th>
            <th className="px-4 py-3">Membres</th>
            <th className="px-4 py-3">Téléphone</th>
            <th className="px-4 py-3">Email</th>
          </tr>
        </thead>
        <tbody>
          {churches.map((c, i) => (
            <tr key={c.id} className="border-t border-line hover:bg-sand-2/60 transition-colors">
              <td className="px-4 py-2.5 text-soft font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
              <td className="px-4 py-2.5 font-medium text-ink">{c.name}</td>
              <td className="px-4 py-2.5">{c.city}</td>
              <td className="px-4 py-2.5">{c.country}</td>
              <td className="px-4 py-2.5">{c._count?.members ?? 0}</td>
              <td className="px-4 py-2.5 whitespace-nowrap">{c.phone ?? "—"}</td>
              <td className="px-4 py-2.5">{c.email ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Filters({ churches = [], churchId, setChurchId, ministry, setMinistry, search, setSearch, tab }) {
  const hasFilters = Boolean(churchId || ministry || search);
  const reset = () => {
    setChurchId("");
    setMinistry("");
    setSearch("");
  };

  return (
    <Card className="p-4 mt-8">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none flex">
            <Search size={16} />
          </span>
          <Input
            className="pl-10"
            placeholder="Rechercher un nom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative lg:w-64">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none flex">
            <Building2 size={16} />
          </span>
          <Select className="pl-10" value={churchId} onChange={(e) => setChurchId(e.target.value)}>
            <option value="">Toutes les églises</option>
            {churches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>

        {tab !== "visitors" && (
          <div className="relative lg:w-64">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none flex">
              <Sparkles size={16} />
            </span>
            <Select className="pl-10" value={ministry} onChange={(e) => setMinistry(e.target.value)}>
              <option value="">Tous les ministères</option>
              {MINISTRIES.filter((m) => m !== "AUCUN").map((m) => (
                <option key={m} value={m}>{formatMinistry(m)}</option>
              ))}
            </Select>
          </div>
        )}

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={reset} className="self-center lg:self-auto">
            <X size={14} className="mr-1.5" /> Réinitialiser
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function AnnuairePage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState("leadership");
  const [churchId, setChurchId] = useState("");
  const [ministry, setMinistry] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("cards");

  const { data: churches, isLoading: churchesLoading } = useQuery({
    queryKey: ["churches"],
    queryFn: () => churchApi.list().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["directory", tab, { churchId, ministry, page }],
    enabled: !!user, // l'annuaire nécessite une authentification côté backend
    queryFn: () => {
      const params = { churchId: churchId || undefined, ministry: ministry || undefined, page };
      if (tab === "leadership") return churchApi.leadership(params);
      if (tab === "members") return churchApi.members({ ...params });
      if (tab === "visitors") return churchApi.visitors(params);
      return Promise.resolve({ data: [], pagination: null });
    },
  });

  const items = (data?.data ?? []).filter((m) =>
    search ? `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) : true
  );

  const switchTab = (value) => {
    setTab(value);
    setPage(1);
    setSearch("");
    setMinistry("");
  };

  return (
    <>
      <PageHero
        eyebrow="Communauté ETDV"
        title="Nos Églises & l'annuaire"
        description={
          user
            ? "Retrouvez les églises locales, les responsables et les membres de la communauté."
            : "Connectez-vous pour consulter l'annuaire complet des membres."
        }
      />

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Onglets */}
        <Stagger delay={0.1}>
          <Item>
            <div className="flex justify-center">
              <div className="inline-flex flex-wrap justify-center gap-1 p-1.5 rounded-2xl bg-sand-2 border border-line">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const isActive = t.value === tab;
                  return (
                    <button
                      key={t.value}
                      onClick={() => switchTab(t.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white text-gold-dim font-semibold shadow-sm border border-line"
                          : "text-soft hover:text-ink hover:bg-white/60 border border-transparent"
                      }`}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.25 : 2} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Item>
          <Item>
            <p className="text-center text-xs text-soft mt-3">{TAB_DESCRIPTIONS[tab]}</p>
          </Item>
        </Stagger>

        {tab === "churches" ? (
          <>
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-soft">
                {churchesLoading ? "Chargement…" : `${(churches ?? []).length} église${(churches ?? []).length > 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-2">
                <ViewToggle view={view} setView={setView} />
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1.5" /> Imprimer
                </Button>
              </div>
            </div>
            {churchesLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (churches ?? []).length === 0 ? (
              <EmptyState icon={<Church size={26} />} title="Aucune église enregistrée" />
            ) : view === "table" ? (
              <div className="mt-5">
                <ChurchTable churches={churches ?? []} />
              </div>
            ) : (
              <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5" delay={0.2}>
                {(churches ?? []).map((church) => (
                  <Item key={church.id}>
                    <Link to={`/eglises/${church.id}`} className="block">
                      <ChurchCard church={church} />
                    </Link>
                  </Item>
                ))}
              </Stagger>
            )}
          </>
        ) : !user ? (
          <Item>
            <Card className="mt-8 p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold-dim">
              <Lock size={24} />
            </div>
            <p className="font-display text-xl mt-4">Annuaire réservé aux membres</p>
            <p className="text-sm text-soft mt-2 max-w-sm mx-auto">
              Connectez-vous pour découvrir les responsables, fidèles et visiteurs de nos assemblées.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button as={Link} to="/connexion">
                Se connecter <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button as={Link} to="/connexion" variant="outline">
                Créer un compte
              </Button>
            </div>
          </Card>
          </Item>
        ) : (
          <>
            <Item>
              <Filters
                churches={churches ?? []}
                churchId={churchId} setChurchId={setChurchId}
                ministry={ministry} setMinistry={setMinistry}
                search={search} setSearch={setSearch}
                tab={tab}
              />
            </Item>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-soft">
                {isLoading ? "Chargement…" : `${items.length} membre${items.length > 1 ? "s" : ""} affiché${items.length > 1 ? "s" : ""}`}
                {!isLoading && data?.pagination?.total != null && ` sur ${data.pagination.total}`}
              </p>
              <div className="flex items-center gap-2">
                <ViewToggle view={view} setView={setView} />
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1.5" /> Imprimer
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={<SearchX size={26} />}
                title={search ? "Aucun résultat pour votre recherche" : "Aucun membre dans cette catégorie"}
                description={search ? `Essayez un autre nom ou réinitialisez les filtres.` : undefined}
                action={
                  search || churchId || ministry ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSearch(""); setChurchId(""); setMinistry(""); }}
                    >
                      <X size={14} className="mr-1.5" /> Réinitialiser les filtres
                    </Button>
                  ) : undefined
                }
              />
            ) : view === "table" ? (
              <div className="mt-5">
                <MemberTable members={items} />
              </div>
            ) : (
              <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5" delay={0.2}>
                {items.map((member) => (
                  <Item key={member.id}><MemberCard member={member} /></Item>
                ))}
              </Stagger>
            )}

            <Pagination pagination={data?.pagination} onPageChange={setPage} />
          </>
        )}
      </section>

      {/* ===== ZONE D'IMPRESSION A4 (masquée à l'écran) ===== */}
      <div id="print-area" className="print-only">
        <div className="pa-header">
          <div className="pa-brand">
            <img src="/etdv_logo.png" alt="Logo ETDV" className="pa-logo" />
            <div>
              <p className="pa-org">Temple du Dieu Vivant</p>
              <p className="pa-tagline">Une famille, cinq assemblées — Lomé, Togo</p>
            </div>
          </div>
          <div className="pa-doc">
            <p className="pa-doc-title">
              {tab === "churches"
                ? "Liste des églises locales"
                : tab === "leadership"
                  ? "Annuaire des responsables"
                  : tab === "members"
                    ? "Annuaire des fidèles"
                    : "Annuaire des visiteurs"}
            </p>
            <p className="pa-doc-meta">
              Édité le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="pa-doc-meta">
              {tab === "churches" ? (churches ?? []).length : items.length} entrée(s)
              {ministry && ministry !== "AUCUN" ? ` · Ministère : ${formatMinistry(ministry)}` : ""}
            </p>
          </div>
        </div>
        <div className="pa-rule" />

        {tab === "churches" ? <ChurchTable churches={churches ?? []} /> : <MemberTable members={items} />}

        <div className="pa-footer">
          <span>Document interne — Temple du Dieu Vivant</span>
          <span>www.etdv.org</span>
        </div>
      </div>
    </>
  );
}