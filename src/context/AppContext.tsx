import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  // Header/Nav
  appName: string;
  universitySchedule: string;
  reviewSchedule: string;
  settings: string;
  
  // University Schedule
  saturday: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  addClass: string;
  className: string;
  classNamePlaceholder: string;
  professor: string;
  professorPlaceholder: string;
  room: string;
  roomPlaceholder: string;
  time: string;
  color: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  noClasses: string;
  
  // Review Schedule
  addReviewSession: string;
  subject: string;
  subjectPlaceholder: string;
  date: string;
  weekView: string;
  dateView: string;
  startTime: string;
  endTime: string;
  notes: string;
  notesPlaceholder: string;
  startTimer: string;
  pauseTimer: string;
  resetTimer: string;
  timerRunning: string;
  noReviewSessions: string;
  duration: string;
  
  // Settings
  language: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  customBackground: string;
  uploadImage: string;
  removeBackground: string;
  importTheme: string;
  exportTheme: string;
  themeJsonInfo: string;
  import: string;
  
  // Common
  confirmDelete: string;
  yes: string;
  no: string;

  // Attendance / tracking
  today: string;
  past: string;
  upcoming: string;
  now: string;
  nowStudying: string;
  markAttended: string;
  attended: string;
  attendance: string;
  attendanceToday: string;
  notesOptional: string;
  saveNotes: string;

  // Study timer
  studyTimer: string;
  hours: string;
  minutes: string;
  adjustDuration: string;
  close: string;
  timeUp: string;

  // Prayer times (adhan)
  prayerTimes: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: string;
  remaining: string;
  tomorrow: string;
  offlineReady: string;
  offlineHint: string;
  updateFailed: string;
  refreshTimes: string;
  monthTimes: string;
  fetching: string;
  lastUpdated: string;

  // Saved values
  savedHint: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Study Schedule',
    universitySchedule: 'University Schedule',
    reviewSchedule: 'Review Schedule',
    settings: 'Settings',
    
    saturday: 'Saturday',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    addClass: 'Add Class',
    className: 'Class Name',
    classNamePlaceholder: 'e.g., Mathematics 101',
    professor: 'Professor',
    professorPlaceholder: 'e.g., Dr. Smith',
    room: 'Room',
    roomPlaceholder: 'e.g., Room 201',
    time: 'Time',
    color: 'Color',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    noClasses: 'No classes scheduled for this day',
    
    addReviewSession: 'Add Review Session',
    subject: 'Subject',
    subjectPlaceholder: 'e.g., Physics Chapter 5',
    date: 'Date',
    weekView: 'Weekly',
    dateView: 'By date',
    startTime: 'Start Time',
    endTime: 'End Time',
    notes: 'Notes',
    notesPlaceholder: 'Add your study notes here...',
    startTimer: 'Start Timer',
    pauseTimer: 'Pause Timer',
    resetTimer: 'Reset Timer',
    timerRunning: 'Timer Running',
    noReviewSessions: 'No review sessions scheduled',
    duration: 'Duration',
    
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    customBackground: 'Custom Background',
    uploadImage: 'Upload Image',
    removeBackground: 'Remove Background',
    importTheme: 'Import Theme',
    exportTheme: 'Export Theme',
    themeJsonInfo: 'Upload a JSON file to customize colors and styles',
    import: 'Import',
    
    confirmDelete: 'Are you sure you want to delete this item?',
    yes: 'Yes',
    no: 'No',

    today: 'Today',
    past: 'Past',
    upcoming: 'Upcoming',
    now: 'Now',
    nowStudying: 'Studying now',
    markAttended: 'Mark attended',
    attended: 'Attended',
    attendance: 'Attendance',
    attendanceToday: 'Attended today',
    notesOptional: 'Notes (optional)',
    saveNotes: 'Save',

    studyTimer: 'Study Timer',
    hours: 'Hours',
    minutes: 'Minutes',
    adjustDuration: 'Adjust study duration',
    close: 'Close',
    timeUp: 'Time is up!',

    prayerTimes: 'Prayer Times',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    nextPrayer: 'Next prayer',
    remaining: 'Remaining',
    tomorrow: 'Tomorrow',
    offlineReady: 'Saved for offline use',
    offlineHint: 'Connect once to download the times for this month',
    updateFailed: 'Could not update right now, showing the last saved times',
    refreshTimes: 'Refresh',
    monthTimes: 'Full month',
    fetching: 'Updating prayer times...',
    lastUpdated: 'Last update',

    savedHint: 'Saved values appear as suggestions',
  },
  ar: {
    appName: 'جدول المذاكرة',
    universitySchedule: 'جدول الجامعة',
    reviewSchedule: 'جدول المراجعة',
    settings: 'الإعدادات',
    
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    addClass: 'إضافة حصة',
    className: 'اسم المادة',
    classNamePlaceholder: 'مثال: رياضيات 101',
    professor: 'الأستاذ',
    professorPlaceholder: 'مثال: د. محمد',
    room: 'القاعة',
    roomPlaceholder: 'مثال: قاعة 201',
    time: 'الوقت',
    color: 'اللون',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    noClasses: 'لا توجد حصص مجدولة لهذا اليوم',
    
    addReviewSession: 'إضافة جلسة مراجعة',
    subject: 'الموضوع',
    subjectPlaceholder: 'مثال: الفيزياء الفصل الخامس',
    date: 'التاريخ',
    weekView: 'أسبوعي',
    dateView: 'بتاريخ',
    startTime: 'وقت البداية',
    endTime: 'وقت النهاية',
    notes: 'ملاحظات',
    notesPlaceholder: 'أضف ملاحظاتك هنا...',
    startTimer: 'بدء المؤقت',
    pauseTimer: 'إيقاف المؤقت',
    resetTimer: 'إعادة تعيين المؤقت',
    timerRunning: 'المؤقت يعمل',
    noReviewSessions: 'لا توجد جلسات مراجعة مجدولة',
    duration: 'المدة',
    
    language: 'اللغة',
    theme: 'المظهر',
    lightMode: 'وضع فاتح',
    darkMode: 'وضع داكن',
    customBackground: 'خلفية مخصصة',
    uploadImage: 'رفع صورة',
    removeBackground: 'إزالة الخلفية',
    importTheme: 'استيراد ثيم',
    exportTheme: 'تصدير الثيم',
    themeJsonInfo: 'ارفع ملف JSON لتخصيص الألوان والأنماط',
    import: 'استيراد',
    
    confirmDelete: 'هل أنت متأكد من حذف هذا العنصر؟',
    yes: 'نعم',
    no: 'لا',

    today: 'اليوم',
    past: 'الماضي',
    upcoming: 'قادم',
    now: 'الآن',
    nowStudying: 'تدرس الآن',
    markAttended: 'تم الحضور',
    attended: 'حضرت',
    attendance: 'الحضور',
    attendanceToday: 'حضرت اليوم',
    notesOptional: 'ملاحظات (اختياري)',
    saveNotes: 'حفظ',

    studyTimer: 'مؤقت الدراسة',
    hours: 'ساعات',
    minutes: 'دقائق',
    adjustDuration: 'عدّل مدة الدراسة',
    close: 'إغلاق',
    timeUp: 'انتهى الوقت!',

    prayerTimes: 'مواقيت الأذان',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    nextPrayer: 'الصلاة القادمة',
    remaining: 'المتبقي',
    tomorrow: 'غدًا',
    offlineReady: 'محفوظة — تعمل بدون إنترنت',
    offlineHint: 'اتصل بالإنترنت مرة واحدة لتحميل مواقيت هذا الشهر',
    updateFailed: 'تعذّر التحديث الآن — تُعرض آخر مواقيت محفوظة',
    refreshTimes: 'تحديث',
    monthTimes: 'الشهر كاملًا',
    fetching: 'جارٍ تحديث المواقيت...',
    lastUpdated: 'آخر تحديث',

    savedHint: 'القيم المحفوظة تظهر كاقتراحات',
  },
};

// Fix Arabic translation for "no" will be done in the object directly

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  customBackground: string | null;
  setCustomBackground: (bg: string | null) => void;
  customTheme: Record<string, string> | null;
  setCustomTheme: (theme: Record<string, string> | null) => void;
  isRtl: boolean;
  savedSubjects: string[];
  savedProfessors: string[];
  savedRooms: string[];
  addSavedSubject: (value: string) => void;
  addSavedProfessor: (value: string) => void;
  addSavedRoom: (value: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    return localStorage.getItem('customBackground');
  });
  
  const [customTheme, setCustomTheme] = useState<Record<string, string> | null>(() => {
    const saved = localStorage.getItem('customTheme');
    return saved ? JSON.parse(saved) : null;
  });

  const readList = (key: string): string[] => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };

  const [savedSubjects, setSavedSubjects] = useState<string[]>(() => readList('savedSubjects'));
  const [savedProfessors, setSavedProfessors] = useState<string[]>(() => readList('savedProfessors'));
  const [savedRooms, setSavedRooms] = useState<string[]>(() => readList('savedRooms'));

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
  };

  const handleSetCustomBackground = (bg: string | null) => {
    setCustomBackground(bg);
    if (bg) {
      localStorage.setItem('customBackground', bg);
    } else {
      localStorage.removeItem('customBackground');
    }
  };

  const handleSetCustomTheme = (theme: Record<string, string> | null) => {
    setCustomTheme(theme);
    if (theme) {
      localStorage.setItem('customTheme', JSON.stringify(theme));
    } else {
      localStorage.removeItem('customTheme');
    }
  };

  const addToList = (
    key: string,
    value: string,
    setter: (updater: (prev: string[]) => string[]) => void
  ) => {
    const v = value.trim();
    if (!v) return;
    setter(prev => {
      if (prev.includes(v)) return prev;
      const next = [v, ...prev].slice(0, 50);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const addSavedSubject = (value: string) => addToList('savedSubjects', value, setSavedSubjects);
  const addSavedProfessor = (value: string) => addToList('savedProfessors', value, setSavedProfessors);
  const addSavedRoom = (value: string) => addToList('savedRooms', value, setSavedRooms);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const value: AppContextType = {
    language,
    setLanguage,
    t: translations[language],
    isDarkMode,
    toggleDarkMode,
    customBackground,
    setCustomBackground: handleSetCustomBackground,
    customTheme,
    setCustomTheme: handleSetCustomTheme,
    isRtl: language === 'ar',
    savedSubjects,
    savedProfessors,
    savedRooms,
    addSavedSubject,
    addSavedProfessor,
    addSavedRoom,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
