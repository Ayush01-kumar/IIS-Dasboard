import ISSMap from './ISSMap';
import SpeedChart from './SpeedChart';
import SkeletonBlock from './SkeletonBlock';

export default function ISSPanel({
  currentIss,
  issHistory,
  speedTrend,
  currentSpeed,
  issLoading,
  issError,
  astronautData,
  astronautsLoading,
}) {
  return (
    <div className="space-y-5">
      <div className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold md:text-xl">Live ISS Tracker</h2>
          <span className="inline-flex items-center gap-2 text-xs text-emerald-400">
            <span className="pulse-live h-2 w-2 rounded-full bg-emerald-400" />
            LIVE
          </span>
        </div>

        {issLoading ? (
          <SkeletonBlock className="h-72 w-full md:h-96" />
        ) : issError ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{issError}</p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Latitude" value={currentIss?.lat?.toFixed(4) ?? '--'} />
              <Stat label="Longitude" value={currentIss?.lon?.toFixed(4) ?? '--'} />
              <Stat label="Speed" value={`${currentSpeed.toFixed(2)} km/h`} />
            </div>
            <ISSMap currentIss={currentIss} issHistory={issHistory} />
          </>
        )}
      </div>

      <div className="glass-card p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold">Speed Trend (Last 30 Samples)</h3>
        {speedTrend.length > 0 ? (
          <SpeedChart dataPoints={speedTrend} />
        ) : (
          <SkeletonBlock className="h-52 w-full" />
        )}
      </div>

      <div className="glass-card p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold">People Currently In Space</h3>
        {astronautsLoading ? (
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-10/12" />
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-400 dark:text-slate-300">
              Total Astronauts: <span className="font-semibold">{astronautData.number}</span>
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {astronautData.people.map((person) => (
                <li key={person.name} className="rounded-lg bg-black/10 px-3 py-2 text-sm dark:bg-white/5">
                  {person.name} <span className="text-xs text-slate-400">({person.craft})</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-black/10 p-3 dark:bg-white/5">
      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
