import NewsCard from './NewsCard';
import SkeletonBlock from './SkeletonBlock';

export default function NewsPanel({
  loading,
  error,
  articles,
  searchTerm,
  sortBy,
  onSearchChange,
  onSortChange,
  onRefresh,
}) {
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold md:text-xl">News Dashboard</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-indigo-400/40 px-3 py-1 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/10"
        >
          Refresh
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search news..."
          className="rounded-lg border border-slate-500/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-slate-500/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="date">Sort: Date</option>
          <option value="source">Sort: Source</option>
        </select>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card overflow-hidden p-3">
              <SkeletonBlock className="mb-3 h-32 w-full" />
              <SkeletonBlock className="mb-2 h-4 w-5/6" />
              <SkeletonBlock className="mb-2 h-3 w-full" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {articles.map((article) => (
            <NewsCard key={`${article.url}-${article.title}`} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
