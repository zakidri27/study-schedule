import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UniversityClass, ReviewSession, AttendanceRecord } from './types';
import { nextDateForAppDay, parseISODate } from './utils/date';
import UniversitySchedule from './components/UniversitySchedule';
import ReviewSchedule from './components/ReviewSchedule';
import PrayerTimes from './components/PrayerTimes';
import Settings from './components/Settings';

type TabType = 'university' | 'review' | 'prayer' | 'settings';

// Older versions stored a weekday index (`day`) instead of an exact date.
// Convert those entries to their next upcoming occurrence so nothing is lost.
function migrateSessions(raw: unknown): ReviewSession[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => {
      const legacyDay = typeof item.day === 'number' ? item.day : 0;
      const date =
        typeof item.date === 'string' && parseISODate(item.date)
          ? item.date
          : nextDateForAppDay(Math.min(Math.max(legacyDay, 0), 6));
      const rest = { ...item } as Record<string, unknown>;
      delete rest.day;
      return { ...rest, date } as ReviewSession;
    });
}

function AppContent() {
  const { isDarkMode, customBackground, customTheme, t } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('university');
  
  // Load data from localStorage
  const [classes, setClasses] = useState<UniversityClass[]>(() => {
    const saved = localStorage.getItem('universityClasses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [sessions, setSessions] = useState<ReviewSession[]>(() => {
    try {
      return migrateSessions(JSON.parse(localStorage.getItem('reviewSessions') || '[]'));
    } catch {
      return [];
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('universityClasses', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('reviewSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Apply custom theme CSS variables
  useEffect(() => {
    if (customTheme) {
      const root = document.documentElement;
      Object.entries(customTheme).forEach(([key, value]) => {
        if (value && key !== 'emblem' && key !== 'watermark') {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });
    } else {
      const root = document.documentElement;
      ['primaryColor', 'secondaryColor', 'backgroundColor', 'surfaceColor', 'textColor', 'accentColor', 'darkBackgroundColor', 'darkTextColor', 'borderRadius', 'fontFamily'].forEach(key => {
        root.style.removeProperty(`--theme-${key}`);
      });
    }
  }, [customTheme]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'university', label: t.universitySchedule, icon: '🏫' },
    { id: 'review', label: t.reviewSchedule, icon: '📚' },
    { id: 'prayer', label: t.prayerTimes, icon: '🕌' },
    { id: 'settings', label: t.settings, icon: '⚙️' },
  ];

  return (
    <div 
      className={`relative min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'dark' : ''
      }`}
      style={{
        ...(customBackground && { 
          backgroundImage: `url(${customBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }),
        backgroundColor: isDarkMode
          ? (customTheme?.darkBackgroundColor || '#1f2937')
          : (customTheme?.backgroundColor || '#f8fafc'),
      }}
    >
      {/* Overlay for better readability with background image */}
      {customBackground && (
        <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm -z-10" />
      )}

      {/* Faint theme watermark / logo */}
      {customTheme?.watermark && (
        <img
          src={customTheme.watermark}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none fixed inset-0 m-auto h-[70vmin] w-[70vmin] object-contain opacity-[0.06]"
          style={{ zIndex: 0 }}
        />
      )}

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                {customTheme?.emblem ? (
                  <img src={customTheme.emblem} alt="" className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-2xl">📅</span>
                )}
                <span className="hidden sm:inline">{t.appName}</span>
              </h1>
              
              {/* Theme Mode Toggle */}
              <button
                onClick={() => useApp().toggleDarkMode()}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-1 mt-3 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto">
          {activeTab === 'university' && (
            <UniversitySchedule
              classes={classes}
              setClasses={setClasses}
              attendance={attendance}
              setAttendance={setAttendance}
            />
          )}
          {activeTab === 'review' && (
            <ReviewSchedule sessions={sessions} setSessions={setSessions} />
          )}
          {activeTab === 'prayer' && <PrayerTimes />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* Footer */}
        <footer className="mt-8 py-4 text-center text-sm opacity-50 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
          <p>📅 Study Schedule App © 2026</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
