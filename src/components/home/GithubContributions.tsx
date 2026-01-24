import { useCallback, useEffect, useState, useMemo } from "react";
import { cn } from "~/lib/utils";
import Tooltip, { TooltipProvider } from "~/components/base/Tooltip";

interface Contribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface Response {
  total: {
    [year: number]: number;
    [year: string]: number;
  };
  contributions: Array<Contribution>;
}

interface ErrorData {
  error: string;
}

interface Props {
  username: string;
  tooltipEnabled: boolean;
}

// ERROR pattern configuration
const ERROR_PATTERN = [
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
] as const;

function generateErrorContributions(): Response {
  const contributions = Array.from({ length: 371 }, (_, index): Contribution => {
    const weekIndex = Math.floor(index / 7);
    const dayIndex = index % 7;

    const patternStartWeek = Math.floor((53 - 19) / 2);
    const patternStartRow = Math.floor((7 - 5) / 2);
    const relativeWeek = weekIndex - patternStartWeek;
    const relativeRow = dayIndex - patternStartRow;

    let count = 0;
    if (relativeWeek >= 0 && relativeWeek < 19 && relativeRow >= 0 && relativeRow < 5) {
      count = ERROR_PATTERN[relativeRow]?.[relativeWeek] === 1 ? 10 : 0;
    }

    return { date: "1", count, level: 0 };
  });

  return { contributions, total: { lastYear: 0 } };
}

function generatePlaceholderContributions(): Response {
  const contributions = Array.from(
    { length: 371 },
    (_, index): Contribution => ({
      date: new Date(Date.now() - (371 - index) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      count: 0,
      level: 0,
    })
  );

  return { contributions, total: { lastYear: 0 } };
}

async function fetchContributions(username: string): Promise<Response> {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
  );
  const data: Response | ErrorData = await response.json();

  if (!response.ok) {
    throw Error(
      `Fetching GitHub contribution data for "${username}" failed: ${(data as ErrorData).error}`
    );
  }

  return data as Response;
}

// 获取诗意的日期描述
function getPoeticDate(date: string): string {
  const d = new Date(date);
  const months = ['正月', '二月', '三月', '四月', '五月', '六月',
                  '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const days = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '三十一'];
  return `${months[d.getMonth()]}${days[d.getDate() - 1]}`;
}

// 获取诗意的贡献描述
function getPoeticCount(count: number): string {
  if (count === 0) return '闲云野鹤';
  if (count === 1) return '落笔一痕';
  if (count < 5) return `墨迹${count}点`;
  if (count < 10) return `挥毫${count}笔`;
  return `泼墨${count}处`;
}

export default function GithubContributions({ username, tooltipEnabled }: Props) {
  const [data, setData] = useState<Response | null>(generatePlaceholderContributions());
  const [errorVisible, setErrorVisible] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);

  const fetchData = useCallback(() => {
    fetchContributions(username)
      .then((res) => {
        setData(res);
        const total = res.total?.lastYear
          || Object.values(res.total || {}).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        setTotalContributions(total);
        setErrorVisible(false);
      })
      .catch(() => setData(generateErrorContributions()));
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (!data?.contributions) {
      return { activeDays: 0, maxDaily: 0 };
    }

    let activeDays = 0;
    let maxDaily = 0;

    for (const c of data.contributions) {
      if (c.count > 0) {
        activeDays++;
        maxDaily = Math.max(maxDaily, c.count);
      }
    }

    return { activeDays, maxDaily };
  }, [data]);

  const weeks =
    data?.contributions.reduce<Contribution[][]>((acc, day, index) => {
      const weekIndex = Math.floor(index / 7);
      if (!acc[weekIndex]) {
        acc[weekIndex] = [];
      }
      acc[weekIndex].push(day);
      return acc;
    }, []) || [];

  return (
    <TooltipProvider>
      <div className="contribution-realm relative">
        {/* 标题行 - 融合统计信息 */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary font-serif">笔耕不辍</span>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground/60">近一年</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {totalContributions > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-accent font-medium">{totalContributions}</span>
                <span>笔</span>
              </span>
            )}
            {stats.activeDays > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-accent/80">{stats.activeDays}</span>
                <span>日</span>
              </span>
            )}
            {/* 图例 */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] opacity-60">淡</span>
              <div className="flex gap-0.5">
                <div className="size-2 rounded-sm ink-empty" />
                <div className="size-2 rounded-sm ink-light" />
                <div className="size-2 rounded-sm ink-medium" />
                <div className="size-2 rounded-sm ink-heavy" />
                <div className="size-2 rounded-sm ink-splash" />
              </div>
              <span className="text-[10px] opacity-60">浓</span>
            </div>
          </div>
        </div>

        {/* 热力图 - 完整显示，自适应尺寸 */}
        <div className="heatmap-container rounded-xl border border-border/30 bg-block/20 backdrop-blur-sm p-3">
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {week.map((contribution, dayIndex) => {
                  const { date, count } = contribution;
                  const poeticDate = getPoeticDate(date);
                  const poeticCount = getPoeticCount(count);
                  const tooltipContent = `${poeticDate} · ${poeticCount}`;

                  return (
                    <Tooltip
                      key={dayIndex}
                      content={tooltipContent}
                      disabled={!tooltipEnabled || errorVisible}
                    >
                      <div
                        className={cn(
                          "ink-cell rounded-sm cursor-pointer",
                          "transition-all duration-200",
                          "hover:scale-150 hover:z-10 hover:rounded-full",
                          count === 0 && "ink-empty",
                          count > 0 && count < 3 && "ink-light",
                          count >= 3 && count < 7 && "ink-medium",
                          count >= 7 && count < 12 && "ink-heavy",
                          count >= 12 && "ink-splash"
                        )}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .contribution-realm {
            --ink-base: var(--color-accent);
          }

          /* 热力图网格 - 自适应完整显示 */
          .heatmap-grid {
            display: grid;
            grid-template-columns: repeat(53, 1fr);
            gap: 2px;
          }

          .heatmap-week {
            display: grid;
            grid-template-rows: repeat(7, 1fr);
            gap: 2px;
          }

          .ink-cell {
            aspect-ratio: 1;
            min-width: 8px;
            max-width: 14px;
          }

          /* 墨迹层次 */
          .ink-empty {
            background: var(--color-muted);
            opacity: 0.3;
          }

          .ink-light {
            background: var(--ink-base);
            opacity: 0.35;
          }

          .ink-medium {
            background: var(--ink-base);
            opacity: 0.55;
          }

          .ink-heavy {
            background: var(--ink-base);
            opacity: 0.75;
          }

          .ink-splash {
            background: var(--ink-base);
            opacity: 0.95;
            box-shadow: 0 0 3px var(--ink-base);
          }

          /* 悬浮效果 */
          .ink-cell:hover {
            box-shadow: 0 0 8px var(--ink-base);
          }

          /* 深色模式 */
          :global(.dark) .ink-empty {
            opacity: 0.15;
          }

          :global(.dark) .ink-splash {
            box-shadow: 0 0 6px var(--ink-base);
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
