export interface UniversityClass {
  id: string;
  name: string;
  professor: string;
  room: string;
  day: number; // 0 = Saturday, 1 = Sunday, ..., 5 = Thursday
  timeSlot: number; // 0 = 8:00-9:30, 1 = 9:30-11:00, etc.
  color: string;
}

export interface ReviewSession {
  id: string;
  subject: string;
  date: string; // "YYYY-MM-DD" — the exact calendar date of this session
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  notes: string;
  color: string;
  day?: number; // legacy weekday field (migrated to `date` on load)
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  attended: boolean;
  notes: string;
}

export interface SavedOptions {
  subjects: string[];
  professors: string[];
  rooms: string[];
}

export const UNIVERSITY_DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;
export const ALL_DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export const TIME_SLOTS = [
  { start: '08:00', end: '09:30', label: '8:00 - 9:30' },
  { start: '09:30', end: '11:00', label: '9:30 - 11:00' },
  { start: '11:00', end: '12:30', label: '11:00 - 12:30' },
  { start: '12:30', end: '14:00', label: '12:30 - 14:00' },
  { start: '14:00', end: '15:30', label: '14:00 - 15:30' },
  { start: '15:30', end: '17:00', label: '15:30 - 17:00' },
];

export const CLASS_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#14b8a6', // teal
];
