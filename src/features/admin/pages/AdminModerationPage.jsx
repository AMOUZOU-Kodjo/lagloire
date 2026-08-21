import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { mediaApi } from "../../../api/media.api";
import { queryKeys } from "../../../lib/queryKeys";
import { label } from "../../../lib/labels";
import { formatRelative } from "../../../lib/formatters";
import { mediaThumbnail } from "../../../lib/covers";
import { Badge, Button, Card, EmptyState, PageHeader, Tabs, Skeleton } from "../../../components/ui";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

const TABS = [
  { value: "media", label: "Médias" },
  { value: "posts", label: "Publications" },
];

const ICONS = { AUDIO: "♪", VIDEO: "▶", PHOTO: "📷" };
const GRADIENTS = [
  "linear-gradient(135deg,#1f2937,#37cdbe)",
  "linear-gradient(135deg,#4a90e2,#1f2937)",
  "linear-gradient(135deg,#4a90e2,#37cdbe)",
  "linear-gradient(135deg,#37cdbe,#4a90e2)",
];

export default function AdminModerationPage() {
  const [tab, setTab] = useState("media");

  const { data: pending, isLoading } = useQuery({
    queryKey: queryKeys.media.pending,
    queryFn: () => mediaApi.pending().then((r) => r.data),
    enabled: tab === "media",
  });

  const approveMutation = useMutationFeedback({
    mutationFn: (id) => mediaApi.approve(id),
    invalidate: [queryKeys.media.pending],
    successMessage: "Média approuvé et publié.",
  });

  const rejectMutation = useMutationFeedback({
    mutationFn: (id) => mediaApi.remove(id),
    invalidate: [queryKeys.media.pending],
    successMessage: "Média rejeté.",
  });

  const items = pending ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Validation"
        title="Modération de contenu"
        description="Validez les médias soumis avant leur publication publique."
        actions={
          <Tabs
            tabs={TABS.map((t) => ({ ...t, label: t.value === "media" ? `${t.label} (${items.length})` : t.label }))}
            active={tab}
            onChange={setTab}
          />
        }
      />

      {tab === "media" && (
        <>
          <p className="text-sm mb-5 text-soft">
            Ces médias ont été soumis par des pasteurs et attendent votre approbation avant publication publique.
          </p>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : items.length === 0 ? (
            <Card className="rounded-lg">
              <EmptyState icon="✅" title="Rien à modérer" description="Tous les médias soumis ont été traités." />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((media, i) => {
                const thumb = mediaThumbnail(media);
                return (
                <Card key={media.id} className="p-0 flex flex-col overflow-hidden">
                  <div
                    className="h-36 flex items-center justify-center text-white text-2xl flex-shrink-0"
                    style={{
                      background: thumb ? `url(${thumb}) center/cover` : GRADIENTS[i % GRADIENTS.length],
                    }}
                  >
                    {!thumb && ICONS[media.type]}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="gold">En attente</Badge>
                      <Badge tone="muted">{label("MEDIA_TYPE", media.type)}</Badge>
                    </div>
                    <p className="font-medium mt-2 truncate">{media.title}</p>
                    <p className="text-xs mt-1 text-soft">
                      Soumis par {media.author?.firstName ?? ""} {media.author?.lastName ?? ""}
                      {media.createdAt && <span className="font-mono"> · {formatRelative(media.createdAt)}</span>}
                    </p>
                    <div className="mt-auto pt-4 mt-4 border-t border-line flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(media.id)}
                      >
                        <CheckCircle2 size={14} className="mr-1.5" /> Approuver
                      </Button>
                      <Button size="sm" variant="danger" className="flex-1" disabled={rejectMutation.isPending} onClick={() => rejectMutation.mutate(media.id)}>
                        <XCircle size={14} className="mr-1.5" /> Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "posts" && (
        <Card className="rounded-lg">
          <EmptyState
            icon="📝"
            title="Modération des publications"
            description="Les publications d'ADMIN/APOTRE/PASTEUR sont publiées directement ; cette section permet de les dépublier si besoin."
            action={
              <span className="inline-flex items-center gap-2 text-xs font-mono text-soft">
                <ShieldCheck size={14} /> Admin · Apôtre uniquement
              </span>
            }
          />
        </Card>
      )}
    </div>
  );
}