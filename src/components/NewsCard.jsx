export default function NewsCard({ article }) {
  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString()
    : 'Unknown date';

  return (
    <article className="glass-card animate-fade-in overflow-hidden">
      <div className="aspect-video w-full bg-black/10 dark:bg-white/5">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No Image</div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-indigo-400">{article.category}</p>
        <h4 className="line-clamp-2 text-sm font-semibold md:text-base">{article.title}</h4>
        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-300">{article.description}</p>
        <div className="text-xs text-slate-500 dark:text-slate-300">
          <p>By {article.author}</p>
          <p>
            {article.source} • {published}
          </p>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-medium text-indigo-400 hover:underline"
        >
          Read More
        </a>
      </div>
    </article>
  );
}
