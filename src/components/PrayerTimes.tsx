import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DISPLAY_ORDER,
  PrayerKey,
  PrayerMonth,
  TIPAZA,
  algiersNow,
  dayOf,
  fetchMonth,
  formatRemaining,
  hijriLabel,
  monthKey,
  nextPrayer,
  readMonth,
  shiftMonth,
  toISO,
} from '../utils/prayer';

type Status = 'loading' | 'ready' | 'waiting' | 'error';
type Notice = 'offline' | 'failed' | null;

export default function PrayerTimes() {
  const { t, language } = useApp();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const [now, setNow] = useState(() => algiersNow());
  const [online, setOnline] = useState(() => navigator.onLine);
  const [month, setMonth] = useState<PrayerMonth | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [notice, setNotice] = useState<Notice>(null);
  const [showMonth, setShowMonth] = useState(false);
  const inFlight = useRef<Set<string>>(new Set());

  const currentKey = monthKey(now);
  const todayISO = toISO(now);

  const load = useCallback(async (key: string, force = false) => {
    if (inFlight.current.has(key)) return;
    const cached = readMonth(key);

    if (cached && !force) {
      setMonth(cached);
      setStatus('ready');
      setNotice(null);
      return;
    }

    if (!navigator.onLine) {
      if (cached) {
        setMonth(cached);
        setStatus('ready');
        setNotice(null);
      } else {
        setMonth(null);
        setStatus('waiting');
        setNotice('offline');
      }
      return;
    }

    setStatus('loading');
    inFlight.current.add(key);
    try {
      const [year, month] = key.split('-').map(Number);
      const data = await fetchMonth(year, month);
      setMonth(data);
      setStatus('ready');
      setNotice(null);
    } catch {
      if (cached) {
        setMonth(cached);
        setStatus('ready');
        setNotice('failed');
      } else {
        setMonth(null);
        setStatus('error');
        setNotice('failed');
      }
    } finally {
      inFlight.current.delete(key);
    }
  }, []);

  // Cache a neighbour month in the background so month rollover stays offline.
  const warm = useCallback(async (key: string | null) => {
    if (!key || !navigator.onLine || readMonth(key) || inFlight.current.has(key)) return;
    inFlight.current.add(key);
    try {
      const [year, month] = key.split('-').map(Number);
      await fetchMonth(year, month);
    } catch {
      // silent: warm-up failures are retried on the next load
    } finally {
      inFlight.current.delete(key);
    }
  }, []);

  useEffect(() => {
    load(currentKey);
    warm(shiftMonth(currentKey, 1));
    warm(shiftMonth(currentKey, -1));
  }, [currentKey, load, warm]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      load(currentKey);
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentKey, load]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(algiersNow()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const today = month ? dayOf(month.days, todayISO) : null;
  const upcoming = month && today ? nextPrayer(month.days, todayISO, now) : null;
  const locationLabel = language === 'ar' ? TIPAZA.ar : TIPAZA.en;
  const refreshing = status === 'loading';

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">🕌 {t.prayerTimes}</h2>
          <p className="text-sm opacity-70">
            {locationLabel} {online ? '· 🌐' : '· 📴'}
          </p>
        </div>
        <button
          onClick={() => load(currentKey, true)}
          disabled={refreshing || !online}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔄 {t.refreshTimes}
        </button>
      </div>

      {refreshing && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-sm text-blue-700 dark:text-blue-300">
          ⏳ {t.fetching}
        </div>
      )}
      {notice === 'offline' && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-sm text-amber-700 dark:text-amber-300">
          📴 {t.offlineHint}
        </div>
      )}
      {notice === 'failed' && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-sm text-red-700 dark:text-red-300">
          ⚠️ {t.updateFailed}
        </div>
      )}

      {!month && !refreshing && status !== 'error' && (
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <p className="text-3xl mb-2">🕌</p>
          <p className="text-sm opacity-70">{t.offlineHint}</p>
        </div>
      )}

      {month && (
        <>
          {today && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="font-semibold">{hijriLabel(today, language)}</div>
              <div className="text-sm opacity-70">{today.readable}</div>
            </div>
          )}

          {upcoming && (
            <div className="mb-5 rounded-2xl p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide opacity-80">{t.nextPrayer}</div>
                <div className="text-3xl font-bold">
                  {t[upcoming.key]} <span className="text-xl">{upcoming.time}</span>
                </div>
                {upcoming.date !== todayISO && (
                  <div className="text-xs opacity-80 mt-1">⏳ {t.tomorrow}</div>
                )}
              </div>
              <div className="text-end">
                <div className="text-xs uppercase tracking-wide opacity-80">{t.remaining}</div>
                <div className="text-2xl font-mono font-bold">{formatRemaining(upcoming.msLeft)}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {DISPLAY_ORDER.map((key: PrayerKey) => {
              const time = today?.[key] || '--:--';
              const isActive = upcoming?.key === key && upcoming.date === todayISO;
              const isSunrise = key === 'sunrise';
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-4 text-center ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                  }`}
                >
                  <div className={`text-sm mb-1 ${isSunrise ? 'opacity-60' : 'opacity-80'}`}>
                    {isSunrise ? '🌅' : '🕌'} {t[key]}
                  </div>
                  <div className={`text-xl font-bold ${isSunrise ? 'opacity-70' : ''}`}>{time}</div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <button
              onClick={() => setShowMonth(v => !v)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              🗓️ {t.monthTimes}
            </button>
            <div className="text-xs opacity-70">
              ✅ {t.offlineReady} · {t.lastUpdated}:{' '}
              {new Date(month.updatedAt).toLocaleString(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          </div>

          {showMonth && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t.date}</th>
                    {DISPLAY_ORDER.map(key => (
                      <th key={key} className="px-3 py-2 font-semibold whitespace-nowrap">
                        {t[key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {month.days.map(day => {
                    const isToday = day.date === todayISO;
                    return (
                      <tr
                        key={day.date}
                        className={`border-t border-gray-200 dark:border-gray-700 ${
                          isToday ? 'bg-emerald-50 dark:bg-emerald-900/30 font-semibold' : ''
                        }`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap">{day.readable}</td>
                        {DISPLAY_ORDER.map(key => (
                          <td key={key} className="px-3 py-2 whitespace-nowrap">
                            {day[key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
