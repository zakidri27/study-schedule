import { TIME_SLOTS } from '../types';

// JS getDay(): 0=Sunday..6=Saturday. App week starts Saturday (index 0).
export function jsDayToAppDay(jsDay: number): number {
  return (jsDay + 1) % 7;
}

export function todayAppDayIndex(d: Date = new Date()): number {
  return jsDayToAppDay(d.getDay());
}

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Index of the current time slot, or null if outside all slots.
export function currentSlotIndex(d: Date = new Date()): number | null {
  const mins = d.getHours() * 60 + d.getMinutes();
  for (let i = 0; i < TIME_SLOTS.length; i++) {
    const [sh, sm] = TIME_SLOTS[i].start.split(':').map(Number);
    const [eh, em] = TIME_SLOTS[i].end.split(':').map(Number);
    if (mins >= sh * 60 + sm && mins < eh * 60 + em) return i;
  }
  return null;
}

// App weekday index (0 = Saturday) -> JS weekday index (0 = Sunday).
export function appDayToJsDay(appDay: number): number {
  return (appDay + 6) % 7;
}

// Next calendar occurrence of an app weekday, starting from `from` (today included).
export function nextDateForAppDay(appDay: number, from: Date = new Date()): string {
  const target = appDayToJsDay(appDay);
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + ((target - d.getDay() + 7) % 7));
  return todayISO(d);
}

export function parseISODate(dateISO: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return null;
  const [y, m, d] = dateISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

// Whole days from today until `dateISO`: 0 = today, positive = future, negative = past.
export function daysUntil(dateISO: string, from: Date = new Date()): number | null {
  const date = parseISODate(dateISO);
  if (!date) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function formatSessionDate(dateISO: string, locale: string): string {
  const date = parseISODate(dateISO);
  return date ? date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : dateISO;
}

export function appDayOfWeek(dateISO: string): number | null {
  const date = parseISODate(dateISO);
  return date ? jsDayToAppDay(date.getDay()) : null;
}

// Compact label such as "22 Oct" / "22 أكت".
export function shortDateLabel(dateISO: string, locale: string): string {
  const date = parseISODate(dateISO);
  return date ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '';
}
