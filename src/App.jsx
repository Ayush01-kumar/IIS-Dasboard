import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import ISSPanel from './components/ISSPanel';
import NewsPanel from './components/NewsPanel';
import ChatBot from './components/ChatBot';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { calculateSpeed } from './utils/haversine';
import { fetchAstronauts, fetchIssNow } from './services/issService';
import { fetchNewsBundle } from './services/newsService';

const ISS_POLL_MS = 15000;
const ISS_PATH_LIMIT = 15;
const SPEED_TREND_LIMIT = 30;
const NEWS_REFRESH_MS = 15 * 60 * 1000;
const ASTRONAUT_REFRESH_MS = 10 * 60 * 1000;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [issHistory, setIssHistory] = useState([]);
  const [speedTrend, setSpeedTrend] = useState([]);
  const [issLoading, setIssLoading] = useState(true);
  const [issError, setIssError] = useState('');

  const [astronautData, setAstronautData] = useState({ number: 0, people: [] });
  const [astronautsLoading, setAstronautsLoading] = useState(true);

  const [newsLoading, setNewsLoading] = useState(true);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsError, setNewsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const issToastRef = useRef(0);

  const pollIss = useCallback(async () => {
    try {
      const snapshot = await fetchIssNow();
      setIssError('');
      setIssHistory((prev) => {
        const updated = [...prev, snapshot].slice(-ISS_PATH_LIMIT);
        const previous = prev[prev.length - 1];
        if (previous) {
          const speed = calculateSpeed(previous, snapshot);
          setSpeedTrend((trend) =>
            [...trend, { timestamp: snapshot.timestamp, speed }].slice(-SPEED_TREND_LIMIT),
          );
        }
        return updated;
      });

      const now = Date.now();
      if (now - issToastRef.current > 60000) {
        issToastRef.current = now;
        toast.success('ISS location updated');
      }
    } catch (error) {
      setIssError(error.message || 'Unable to fetch ISS location');
      toast.error('ISS feed error');
    } finally {
      setIssLoading(false);
    }
  }, []);

  const pollAstronauts = useCallback(async () => {
    try {
      const astros = await fetchAstronauts();
      setAstronautData(astros);
    } catch {
      // Keep existing astronaut data if a refresh fails.
    } finally {
      setAstronautsLoading(false);
    }
  }, []);

  const pollNews = useCallback(
    async (term, sort) => {
      try {
        setNewsLoading(true);
        const bundle = await fetchNewsBundle(term, sort);
        setNewsArticles(bundle);
        setNewsError('');
        toast.message('News feed synced');
      } catch (error) {
        setNewsError(error.message || 'Unable to fetch news');
      } finally {
        setNewsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    pollIss();
    pollAstronauts();
    pollNews(searchTerm, sortBy);

    const issTimer = setInterval(pollIss, ISS_POLL_MS);
    const astroTimer = setInterval(pollAstronauts, ASTRONAUT_REFRESH_MS);
    const newsTimer = setInterval(() => pollNews(searchTerm, sortBy), NEWS_REFRESH_MS);

    return () => {
      clearInterval(issTimer);
      clearInterval(astroTimer);
      clearInterval(newsTimer);
    };
  }, [pollAstronauts, pollIss, pollNews, searchTerm, sortBy]);

  const currentIss = useMemo(() => issHistory[issHistory.length - 1], [issHistory]);
  const currentSpeed = useMemo(() => speedTrend[speedTrend.length - 1]?.speed ?? 0, [speedTrend]);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <Toaster richColors position="top-right" />

      <header className="mx-auto mb-6 flex w-full max-w-7xl items-center justify-between gap-4">
        <div>
          <h1 className="glow-text text-2xl font-bold md:text-3xl">ISS & News Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-300">
            Real-time orbit telemetry and curated space news.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="xl:col-span-7">
          <ISSPanel
            currentIss={currentIss}
            issHistory={issHistory}
            speedTrend={speedTrend}
            currentSpeed={currentSpeed}
            issLoading={issLoading}
            issError={issError}
            astronautData={astronautData}
            astronautsLoading={astronautsLoading}
          />
        </section>

        <section className="xl:col-span-5">
          <NewsPanel
            loading={newsLoading}
            error={newsError}
            articles={newsArticles}
            searchTerm={searchTerm}
            sortBy={sortBy}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
            onRefresh={() => pollNews(searchTerm, sortBy)}
          />
        </section>
      </main>

      <ChatBot
        currentIss={currentIss}
        currentSpeed={currentSpeed}
        headlines={newsArticles.map((article) => article.title)}
      />
    </div>
  );
}
