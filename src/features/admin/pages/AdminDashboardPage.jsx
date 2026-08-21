import { useQuery } from "@tanstack/react-query";
import { Users, Wallet, Calendar, Activity, ArrowUpRight, Mail, Radio } from "lucide-react";
import { statsApi } from "../../../api/stats.api";
import { queryKeys } from "../../../lib/queryKeys";
import { formatAmount, formatRelative } from "../../../lib/formatters";
import { Card, Badge, RoleBadge, StatusBadge, PageHeader, Skeleton } from "../../../components/ui";
import { Link } from "react-router-dom";

const ICONS = {
  users: Users,
  donations: Wallet,
  events: Calendar,
  traffic: Activity,
};

const ACCENTS = {
  users: "bg-gold/10 text-gold-dim",
  donations: "bg-palm/10 text-palm",
  events: "bg-[#4a90e2]/10 text-[#4a90e2]",
  traffic: "bg-brick/10 text-brick",
};

function StatCard({ kind, label, value, footer }) {
  const Icon = ICONS[kind];
  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${ACCENTS[kind]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-mono text-soft">{label}</p>
        <p className="font-display text-2xl mt-0.5 truncate">{value}</p>
        {footer && <p className="text-xs mt-0.5 text-soft">{footer}</p>}
      </div>
    </Card>
  );
}

function Bar({ value, max, tone = "bg-gold" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-sand-2 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(pct, 3)}%` }} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: () => statsApi.dashboard().then((r) => r.data),
  });

  if (isLoading && !stats) {
    return (
      <div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }
  if (!stats) return null;

  const byRoleMax = Math.max(1, ...stats.users.byRole.map((r) => r.count));
  const byMethodMax = Math.max(1, ...stats.donations.byMethod.map((m) => m.total));
  const totalByMethod = stats.donations.byMethod.reduce((sum, m) => sum + m.total, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Tableau de bord"
        description="Activité de la communauté en un coup d'œil."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard kind="users" label="MEMBRES" value={stats.users.total} footer={`+${stats.users.newThisMonth} ce mois-ci`} />
        <StatCard kind="donations" label="DONS CE MOIS" value={formatAmount(stats.donations.totalAmount)} footer={`${stats.donations.thisMonth} dons enregistrés`} />
        <StatCard kind="events" label="ÉVÉNEMENTS À VENIR" value={stats.events.upcoming?.length ?? 0} footer={`${stats.events.total} au total`} />
        <StatCard kind="traffic" label="VUES DU SITE" value={stats.traffic.totalPageViews} footer={`${stats.traffic.today} aujourd'hui`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg">Répartition des membres</p>
            <Badge tone="muted">{stats.users.total}</Badge>
          </div>
          <div className="space-y-4 text-sm">
            {stats.users.byRole.map((r) => (
              <div key={r.role}>
                <div className="flex items-center justify-between mb-1.5">
                  <RoleBadge role={r.role} />
                  <span className="font-mono text-xs">{r.count}</span>
                </div>
                <Bar value={r.count} max={byRoleMax} tone="bg-gold" />
              </div>
            ))}
            {stats.users.byRole.length === 0 && <p className="text-sm text-soft">Aucune donnée.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg">Dons par méthode</p>
            <Badge tone="muted">{formatAmount(totalByMethod)}</Badge>
          </div>
          <div className="space-y-4 text-sm">
            {stats.donations.byMethod.map((m) => (
              <div key={m.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs">{m.method}</span>
                  <span className="font-mono text-xs text-soft">{formatAmount(m.total)}</span>
                </div>
                <Bar value={m.total} max={byMethodMax} tone="bg-palm" />
              </div>
            ))}
            {stats.donations.byMethod.length === 0 && <p className="text-sm text-soft">Aucune donnée.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-display text-lg mb-4">À traiter</p>
          <div className="space-y-2">
            <Link to="/admin/dons-contacts" className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-sand-2 transition min-w-0">
              <span className="flex items-center gap-2.5 text-sm"><Mail size={16} className="text-soft" /> Messages non lus</span>
              <Badge tone="brick">{stats.contacts.unread}</Badge>
            </Link>
            <Link to="/admin/direct" className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-sand-2 transition min-w-0">
              <span className="flex items-center gap-2.5 text-sm min-w-0"><Radio size={16} className="text-soft flex-shrink-0" /> <span className="truncate">Direct en cours</span></span>
              {stats.live ? <Badge tone="brick" className="max-w-40">{stats.live.title}</Badge> : <Badge tone="muted">Aucun</Badge>}
            </Link>
            <Link to="/admin/medias" className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-sand-2 transition">
              <span className="flex items-center gap-2.5 text-sm"><Activity size={16} className="text-soft" /> Médias à modérer</span>
              <Badge tone="gold">{stats.media?.pending ?? 0}</Badge>
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-lg">Prochains événements</p>
          {stats.events.upcoming?.length > 0 && (
            <Link to="/admin/evenements" className="text-xs font-semibold text-gold-dim hover:underline inline-flex items-center gap-1">
              Tout voir <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(stats.events.upcoming ?? []).map((e) => {
            const d = e.date ? new Date(e.date) : null;
            return (
              <Link key={e.id} to="/admin/evenements" className="group">
                <Card className="p-5 flex flex-col h-full transition group-hover:border-gold/40 group-hover:shadow-card">
                  {d && (
                    <div className="w-12 h-12 rounded-lg bg-gold/10 text-gold-dim flex flex-col items-center justify-center mb-3">
                      <span className="font-display text-lg leading-none">{d.getDate()}</span>
                      <span className="text-[10px] font-mono uppercase">{d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</span>
                    </div>
                  )}
                  <p className="font-medium truncate">{e.title}</p>
                  <p className="text-xs text-soft truncate mt-1">
                    {[e.location, e.church?.name].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="mt-auto pt-3 mt-4 border-t border-line flex items-center justify-between text-xs">
                    <StatusBadge kind="EVENT_STATUS" status={e.status} />
                    <span className="text-soft font-mono">
                      {e._count?.registrations > 0 ? `${e._count.registrations} inscrits` : formatRelative(e.date)}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
          {(stats.events.upcoming ?? []).length === 0 && (
            <Card className="p-8 text-center text-sm text-soft col-span-full">Aucun événement à venir.</Card>
          )}
        </div>
      </div>
    </div>
  );
}