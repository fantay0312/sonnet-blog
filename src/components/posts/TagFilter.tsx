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
      {/* 右侧悬浮标签面板 - 水墨轻盈风 */}
      <aside className="floating-tags hidden xl:block fixed top-32 right-8 w-52 max-h-[calc(100vh-200px)] overflow-y-auto z-40">
        <div className="bg-block/40 backdrop-blur-md border border-border/40 rounded-xl px-4 py-4">
          <h3 className="zen-panel-title flex items-center gap-2 text-sm text-muted-foreground mb-3 pb-2.5 border-b border-border/40">
            <span className="icon-[lucide--tags] w-3.5 h-3.5 text-gold opacity-80" />
            {locale === "zh-cn" ? "标签筛选" : "Filter by Tag"}
          </h3>

          <div className="space-y-0.5">
            {/* 全部标签按钮 */}
            <button
              onClick={() => setSelectedTag(null)}
              className={`zen-tag-btn w-full flex items-baseline justify-between gap-2 text-left px-2.5 py-1.5 rounded-md text-sm transition-all duration-300 ${
                selectedTag === null
                  ? "text-accent font-medium bg-accent/8"
                  : "text-muted-foreground hover:text-accent hover:bg-accent/5"
              }`}
            >
              <span>{allTagsLabel}</span>
              <span className="text-xs opacity-50 tabular-nums">{posts.length}</span>
            </button>

            {/* 标签列表 */}
            {tagStats.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`zen-tag-btn w-full flex items-baseline justify-between gap-2 text-left px-2.5 py-1.5 rounded-md text-sm transition-all duration-300 ${
                  selectedTag === tag
                    ? "text-accent font-medium bg-accent/8"
                    : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                }`}
              >
                <span className="truncate">
                  <span className="opacity-45 mr-0.5">#</span>
                  {tag}
                </span>
                <span className="text-xs opacity-50 tabular-nums">{count}</span>
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
            className={`zen-tag-btn px-3 py-1 rounded-full text-sm border transition-all duration-300 ${
              selectedTag === null
                ? "border-accent/60 text-accent bg-accent/8"
                : "border-border/60 text-muted-foreground hover:border-accent/40 hover:text-accent"
            }`}
          >
            {allTagsLabel}
          </button>
          {tagStats.slice(0, 8).map(([tag]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`zen-tag-btn px-3 py-1 rounded-full text-sm border transition-all duration-300 ${
                selectedTag === tag
                  ? "border-accent/60 text-accent bg-accent/8"
                  : "border-border/60 text-muted-foreground hover:border-accent/40 hover:text-accent"
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

      {/* 文章列表 - 水墨清单 */}
      <div className="ink-list">
        {filteredPosts.map((post, index) => (
          <a
            key={post.id}
            href={post.path}
            className="ink-item"
            style={{ "--delay": `${Math.min(index, 8) * 0.06}s` } as React.CSSProperties}
          >
            <span className="ink-marker" aria-hidden="true" />

            <div className="ink-main">
              <h2 className="ink-title">
                {post.top > 0 && (
                  <span className="icon-[lucide--pin] w-3.5 h-3.5 inline-block mr-1.5 text-accent align-[-2px]" />
                )}
                {post.title}
              </h2>

              {post.description && (
                <p className="ink-desc">{post.description}</p>
              )}

              {((post.tags && post.tags.length > 0) || post.series) && (
                <div className="ink-tags">
                  {post.series && <span>{post.series}</span>}
                  {post.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={tag === selectedTag ? "tag-active" : ""}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <time className="ink-meta">{formatDate(post.timestamp)}</time>
          </a>
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
