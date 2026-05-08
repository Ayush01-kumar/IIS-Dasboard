const NEWS_URL = 'https://newsapi.org/v2/everything';
const SPACEFLIGHT_URL = 'https://api.spaceflightnewsapi.net/v4/articles/';
const CACHE_MS = 15 * 60 * 1000;
const CATEGORIES = ['space', 'technology'];
const PER_CATEGORY = 5;

const makeCacheKey = (searchTerm, sortBy) =>
  `iss-news-cache:${searchTerm.trim().toLowerCase()}:${sortBy}`;

function transformArticle(article, category) {
  return {
    source: article.source?.name || 'Unknown',
    author: article.author || 'Unknown',
    title: article.title || 'Untitled',
    description: article.description || '',
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: article.publishedAt,
    category,
  };
}

function sortArticles(articles, sortBy) {
  if (sortBy === 'source') {
    return [...articles].sort((a, b) => a.source.localeCompare(b.source));
  }
  return [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function transformSpaceflightArticle(article, category) {
  return {
    source: article.news_site || 'Spaceflight News',
    author: article.authors?.[0]?.name || 'Unknown',
    title: article.title || 'Untitled',
    description: article.summary || '',
    url: article.url,
    imageUrl: article.image_url,
    publishedAt: article.published_at,
    category,
  };
}

async function fetchFromNewsApi(searchTerm, sortBy, apiKey) {
  const queryTerm = searchTerm.trim();
  const requests = CATEGORIES.map(async (category) => {
    const q = queryTerm ? `${category} ${queryTerm}` : category;
    const url = new URL(NEWS_URL);
    url.searchParams.set('q', q);
    url.searchParams.set('pageSize', String(PER_CATEGORY));
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('language', 'en');
    url.searchParams.set('apiKey', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'News API unavailable');
    }
    if (data.status !== 'ok') {
      throw new Error(data.message || 'News API error');
    }
    return (data.articles ?? []).map((article) => transformArticle(article, category));
  });

  const grouped = await Promise.all(requests);
  return sortArticles(grouped.flat(), sortBy);
}

async function fetchFromSpaceflightApi(searchTerm, sortBy) {
  const queryTerm = searchTerm.trim();
  const requests = CATEGORIES.map(async (category) => {
    const url = new URL(SPACEFLIGHT_URL);
    url.searchParams.set('limit', String(PER_CATEGORY));
    url.searchParams.set('ordering', '-published_at');

    const words = [category, queryTerm].filter(Boolean).join(' ').trim();
    if (words) {
      url.searchParams.set('search', words);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Spaceflight News API unavailable');
    }

    const data = await response.json();
    return (data.results ?? []).map((article) => transformSpaceflightArticle(article, category));
  });

  const grouped = await Promise.all(requests);
  return sortArticles(grouped.flat(), sortBy);
}

export async function fetchNewsBundle(searchTerm, sortBy) {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  const cacheKey = makeCacheKey(searchTerm, sortBy);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.cachedAt < CACHE_MS) {
      return parsed.articles;
    }
  }

  let sorted = [];
  let primaryError = '';
  if (apiKey) {
    try {
      sorted = await fetchFromNewsApi(searchTerm, sortBy, apiKey);
    } catch (error) {
      primaryError = error.message || 'News API error';
    }
  }

  if (!sorted.length) {
    try {
      sorted = await fetchFromSpaceflightApi(searchTerm, sortBy);
    } catch (fallbackError) {
      if (primaryError) {
        throw new Error(`${primaryError}. Fallback source also failed.`);
      }
      throw fallbackError;
    }
  }

  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      cachedAt: Date.now(),
      articles: sorted,
    }),
  );

  return sorted;
}
