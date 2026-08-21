import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Eye, Share2, ThumbsUp } from "lucide-react";
import { postsApi } from "../../../api/posts.api";
import { mockPosts } from "../../../lib/mockData";
import { Card, Avatar } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { formatDate } from "../../../lib/formatters";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../hooks/useToast";
import { postCover } from "../../../lib/covers";

export default function ActualiteDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [liked, setLiked] = useState(false);

  const { data: post } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getById(id).then((r) => r.data),
    placeholderData: mockPosts.find((p) => p.id === id) ?? mockPosts[0],
  });

  const markReadMutation = useMutation({ mutationFn: () => postsApi.markRead(id) });

  useEffect(() => {
    if (user && id) markReadMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  if (!post) return null;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers !");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[340px] md:h-[420px] overflow-hidden">
        <img src={postCover(post)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-[#111827]/45 to-[#111827]/25" />

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col">
          <div className="pt-6">
            <Link
              to="/actualites"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition"
            >
              <ArrowLeft size={16} /> Toutes les actualités
            </Link>
          </div>

          <div className="mt-auto pb-10 max-w-3xl min-w-0">
            <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full border bg-white/90 text-ink border-line">
              {post.category?.name ?? "Actualité"}
            </span>
            <h1 className="font-display text-3xl md:text-5xl text-white mt-3 leading-tight [text-wrap:balance]">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <Avatar
                  firstName={post.author?.firstName}
                  lastName={post.author?.lastName}
                  src={post.author?.profile?.avatarUrl}
                  size="xs"
                />
                <span className="font-medium">
                  {post.author?.firstName} {post.author?.lastName}
                </span>
              </span>
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                  <Calendar size={13} /> {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <Eye size={13} /> {post._count?.reads ?? 0} lectures
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Corps */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <Stagger delay={0.1} className="max-w-3xl mx-auto">
          <Item>
            <Card className="rounded-lg p-6 md:p-10">
              {post.excerpt && (
                <blockquote className="border-l-2 border-gold pl-4 text-base italic text-soft mb-6">
                  {post.excerpt}
                </blockquote>
              )}
              {post.content ? (
                <div className="text-[15px] leading-relaxed whitespace-pre-line text-ink/90">{post.content}</div>
              ) : (
                <p className="text-sm italic text-soft">Le contenu de cet article sera publié prochainement.</p>
              )}
            </Card>
          </Item>

          <Item>
            <Card className="rounded-lg p-5 mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setLiked((v) => !v)}
                  aria-pressed={liked}
                  className={`btn btn-outline btn-sm ${liked ? "!border-gold !text-gold-dim !bg-gold/10" : ""}`}
                >
                  <ThumbsUp size={14} className={liked ? "fill-gold/30" : ""} />
                  {liked ? "Encouragé" : "Encourager"}
                </button>
                <button onClick={handleShare} className="btn btn-outline btn-sm">
                  <Share2 size={14} /> Partager
                </button>
              </div>
              <span className="text-xs font-mono text-soft inline-flex items-center gap-1.5">
                <Eye size={12} /> {post._count?.reads ?? 0} lecteurs
              </span>
            </Card>
          </Item>

          {post.author && (
            <Item>
              <Card className="rounded-lg p-6 mt-6 flex items-center gap-4 bg-sand-2">
                <Avatar
                  firstName={post.author.firstName}
                  lastName={post.author.lastName}
                  src={post.author.profile?.avatarUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-wide text-soft uppercase">Publié par</p>
                  <p className="font-medium text-sm truncate">
                    {post.author.firstName} {post.author.lastName}
                  </p>
                  <p className="text-xs text-soft">Rédaction ETDV</p>
                </div>
              </Card>
            </Item>
          )}
        </Stagger>
      </section>
    </>
  );
}