import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "../../../api/posts.api";
import { Button, EmptyState, PageHero } from "../../../components/ui";
import { Stagger, Item } from "../../../components/ui/motion";
import { formatDate, truncate } from "../../../lib/formatters";
import { postCover } from "../../../lib/covers";

export default function ActualitesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts", "list"],
    queryFn: () => postsApi.list({ limit: 10 }).then((r) => r.data),
  });

  const posts = data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Vie de la communauté"
        title="Actualités"
        description="Les nouvelles de nos assemblées, publiées par les responsables."
      />

      <section className="max-w-7xl mx-auto px-6 py-10">

      {!isLoading && posts.length === 0 ? (
        <EmptyState icon="📰" title="Aucune actualité publiée" />
      ) : (
        <Stagger className="grid gap-6 mt-10" delay={0.1}>
          {posts.map((post) => (
            <Item key={post.id}>
              <Link to={`/actualites/${post.id}`} className="card rounded-lg p-6 md:flex md:flex-row gap-6 hover:shadow-lg transition group">
                <div className="w-full md:w-56 h-40 md:h-auto rounded-md flex-shrink-0 mb-4 md:mb-0 overflow-hidden">
                  <img
                    src={postCover(post)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-muted">{post.category?.name ?? "Actualité"}</span>
                    <span className="text-xs font-mono text-soft">{formatDate(post.publishedAt)}</span>
                  </div>
                  <p className="font-display text-xl mt-3">{post.title}</p>
                  <p className="text-sm mt-2 text-soft">{truncate(post.excerpt, 180)}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-soft">
                    <div className="w-6 h-6 rounded-full" style={{ background: "linear-gradient(135deg,#4a90e2,#37cdbe)" }} />
                    {post.author?.firstName} {post.author?.lastName}
                  </div>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
      )}

      <div className="flex justify-center mt-10">
        <Button variant="outline">Charger plus d'actualités</Button>
      </div>
      </section>
    </>
  );
}
