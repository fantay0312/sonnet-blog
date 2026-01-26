/**
 * 标签筛选组件 - 右侧悬浮面板
 * 支持点击标签筛选文章
 */
import { useState, useMemo } from "react";

interface Post {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  tags: string[];
  series?: string;
  top?: number;
  path: string;
}

interface Props {
  posts: Post[];
  locale: string;
  allTagsLabel: string;
  noResultsLabel: string;
}

export default function TagFilter({ posts, locale, allTagsLabel, noResultsLabel }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 统计所有标签及其数量
  const tagStats = useMemo(() => {
    const stats = new Map<string, number>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => {
        stats.set(tag, (stats.get(tag) || 0) + 1);
      });
    });
    // 按数量排序
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  // 根据选中标签筛选文章
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter((post) => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "zh-cn" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* 右侧悬浮标签面板 */}
      <aside className="floating-tags hidden xl:block fixed top-32 right-8 w-52 max-h-[calc(100vh-200px)] overflow-y-auto z-40">
        <div className="bg-block/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="icon-[lucide--tags] w-4 h-4" />
            {locale === "zh-cn" ? "标签筛选" : "Filter by Tag"}
          </h3>

          <div className="space-y-1">
            {/* 全部标签按钮 */}
            <button
              onClick={() => setSelectedTag(null)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedTag === null
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {allTagsLabel}
              <span className="float-right opacity-60">{posts.length}</span>
            </button>

            {/* 标签列表 */}
            {tagStats.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedTag === tag
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-accent/70">#</span>
                {tag}
                <span className="float-right opacity-60">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 移动端标签选择器 */}
      <div className="xl:hidden mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedTag === null
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent/20"
            }`}
          >
            {allTagsLabel}
          </button>
          {tagStats.slice(0, 8).map(([tag]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                selectedTag === tag
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent/20"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 当前筛选状态 */}
      {selectedTag && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{locale === "zh-cn" ? "当前筛选:" : "Filtering:"}</span>
          <span className="px-2 py-0.5 bg-accent/20 text-accent rounded">
            #{selectedTag}
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <span className="icon-[lucide--x] w-4 h-4" />
          </button>
        </div>
      )}

      {/* 文章列表 */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <article key={post.id} className="group">
            <a
              href={post.path}
              className="block p-6 bg-block rounded-lg border border-border hover:border-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-medium text-foreground group-hover:text-accent transition-colors">
                  {post.top && post.top > 0 && (
                    <span className="inline-block mr-2 text-accent">
                      <span className="icon-[lucide--pin] w-4 h-4 inline-block" />
                    </span>
                  )}
                  {post.title}
                </h2>
                <time className="text-sm text-muted-foreground shrink-0">
                  {formatDate(post.timestamp)}
                </time>
              </div>

              {post.description && (
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.description}
                </p>
              )}

              <div className="flex items-center gap-4">
                {post.series && (
                  <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                    {post.series}
                  </span>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs ${
                          tag === selectedTag
                            ? "text-accent font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          </article>
        ))}

        {filteredPosts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {noResultsLabel}
          </p>
        )}
      </div>
    </div>
  );
}
