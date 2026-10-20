// Prayer times (adhan) support for Tipaza (ولاية تيبازة).
// Online: fetch a month calendar once and cache it in localStorage.
// Offline: everything the UI needs is served straight from that cache.

export const TIPAZA = {
  latitude: 36.589,
  longitude: 2.45,
  ar: 'ولاية تيبازة',
  en: 'Tipaza, Algeria',
};

// Muslim World League: Fajr 18°, Isha 17° — the same angles used by Algeria.
const CALC_METHOD = 3;
const API_URL = 'https://api.aladhan.com/v1/calendar';
const CACHE_PREFIX = 'prayerTimes.';
const KEEP_MONTHS = 12;

export const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export const DISPLAY_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerKey = (typeof DISPLAY_ORDER)[number];

export interface PrayerDay {
  date: string; // YYYY-MM-DD in Africa/Algiers
  readable: string; // "01 Oct 2026"
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  hijri: {
    day: string;
    monthAr: string;
    monthEn: string;
    year: string;
    weekdayAr: string;
    weekdayEn: string;
  };
}

export interface PrayerMonth {
  key: string; // YYYY-MM
  updatedAt: number;
  days: PrayerDay[];
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Africa/Algiers is UTC+1 all year (no DST).
export function algiersNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + (60 + now.getTimezoneOffset()) * 60000);
}

export function monthKey(d: Date = algiersNow()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function parseMonthKey(key: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (year < 2000 || month < 1 || month > 12) return null;
  return { year, month };
}

export function shiftMonth(key: string, delta: number): string | null {
  const parsed = parseMonthKey(key);
  if (!parsed) return null;
  const d = new Date(parsed.year, parsed.month - 1 + delta, 1);
  return monthKey(d);
}

export function readMonth(key: string): PrayerMonth | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const data = JSON.parse(raw) as PrayerMonth;
    if (!data || data.key !== key || !Array.isArray(data.days) || data.days.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeMonth(data: PrayerMonth): void {
  try {
    localStorage.setItem(CACHE_PREFIX + data.key, JSON.stringify(data));
    prune();
  } catch {
    // storage full / disabled — the UI still keeps working from memory
  }
}

function prune(): void {
  try {
    const limit = shiftMonth(monthKey(), -KEEP_MONTHS) || '0000-00';
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => {
        if (k.slice(CACHE_PREFIX.length) < limit) localStorage.removeItem(k);
      });
  } catch {
    // ignore
  }
}

const hhmm = (raw: string) => {
  const match = /\d{1,2}:\d{2}/.exec(raw || '');
  if (!match) return '00:00';
  return match[0].length === 4 ? `0${match[0]}` : match[0];
};

function parseDay(item: Record<string, any>): PrayerDay {
  const timings = item.timings || {};
  const gregorian = String(item.date?.gregorian?.date || '').split('-'); // DD-MM-YYYY
  const hijri = item.date?.hijri || {};
  return {
    date: gregorian.length === 3 ? `${gregorian[2]}-${gregorian[1]}-${gregorian[0]}` : '',
    readable: item.date?.readable || '',
    fajr: hhmm(timings.Fajr),
    sunrise: hhmm(timings.Sunrise),
    dhuhr: hhmm(timings.Dhuhr),
    asr: hhmm(timings.Asr),
    maghrib: hhmm(timings.Maghrib),
    isha: hhmm(timings.Isha),
    hijri: {
      day: String(hijri.day ?? ''),
      monthAr: String(hijri.month?.ar ?? ''),
      monthEn: String(hijri.month?.en ?? ''),
      year: String(hijri.year ?? ''),
      weekdayAr: String(hijri.weekday?.ar ?? ''),
      weekdayEn: String(hijri.weekday?.en ?? ''),
    },
  };
}

export async function fetchMonth(year: number, month: number): Promise<PrayerMonth> {
  const url =
    `${API_URL}?latitude=${TIPAZA.latitude}&longitude=${TIPAZA.longitude}` +
    `&method=${CALC_METHOD}&month=${month}&year=${year}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const payload = await response.json();
  if (payload?.code !== 200 || !Array.isArray(payload.data)) throw new Error('bad payload');

  const rows = payload.data as Record<string, any>[];
  const data: PrayerMonth = {
    key: `${year}-${pad(month)}`,
    updatedAt: Date.now(),
    days: rows.map(parseDay).filter(day => day.date),
  };
  writeMonth(data);
  return data;
}

export function dayOf(days: PrayerDay[], isoDate: string): PrayerDay | null {
  return days.find(d => d.date === isoDate) || null;
}

export interface Upcoming {
  key: PrayerKey;
  time: string;
  date: string;
  msLeft: number;
}

// Next prayer time from `now` (wall clock in Algiers), looking at today then tomorrow.
export function nextPrayer(days: PrayerDay[], todayISO: string, now: Date): Upcoming | null {
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const index = days.findIndex(d => d.date === todayISO);
  if (index < 0) return null;

  const candidates: { key: PrayerKey; time: string; date: string; min: number }[] = [];
  const collect = (day: PrayerDay) => {
    for (const key of PRAYER_ORDER) {
      const [h, m] = day[key].split(':').map(Number);
      candidates.push({ key, time: day[key], date: day.date, min: h * 60 + m });
    }
  };
  collect(days[index]);
  if (days[index + 1]) collect(days[index + 1]);

  const upcoming = candidates.find(c => (c.date > todayISO ? true : c.min > nowMin));
  if (!upcoming) return null;

  const msLeft =
    upcoming.date === todayISO
      ? (upcoming.min - nowMin) * 60000
      : (24 * 60 - nowMin + upcoming.min) * 60000;

  return { key: upcoming.key, time: upcoming.time, date: upcoming.date, msLeft };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function hijriLabel(day: PrayerDay, language: string): string {
  if (!day.hijri.day) return '';
  const month = language === 'ar' ? day.hijri.monthAr : day.hijri.monthEn;
  const weekday = language === 'ar' ? day.hijri.weekdayAr : day.hijri.weekdayEn;
  return `${weekday} ${day.hijri.day} ${month} ${day.hijri.year} هـ`;
}
