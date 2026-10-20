import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReviewSession, ALL_DAYS, CLASS_COLORS } from '../types';
import {
  appDayOfWeek,
  daysUntil,
  formatSessionDate,
  nextDateForAppDay,
  parseISODate,
  shortDateLabel,
  todayAppDayIndex,
  todayISO,
} from '../utils/date';
import ComboBox from './ComboBox';
import StudyTimer from './StudyTimer';

type ReviewView = 'week' | 'date';

interface ReviewScheduleProps {
  sessions: ReviewSession[];
  setSessions: React.Dispatch<React.SetStateAction<ReviewSession[]>>;
}

export default function ReviewSchedule({ sessions, setSessions }: ReviewScheduleProps) {
  const { t, language, savedSubjects, addSavedSubject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ReviewSession | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [timerSession, setTimerSession] = useState<ReviewSession | null>(null);
  const [view, setView] = useState<ReviewView>(() =>
    localStorage.getItem('reviewView') === 'date' ? 'date' : 'week'
  );

  useEffect(() => {
    localStorage.setItem('reviewView', view);
  }, [view]);

  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    date: todayISO(),
    startTime: '08:00',
    endTime: '09:30',
    notes: '',
    color: CLASS_COLORS[0],
  });

  const calculateDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const openModal = (existingSession?: ReviewSession) => {
    if (existingSession) {
      setEditingSession(existingSession);
      setFormData({
        subject: existingSession.subject,
        date: existingSession.date || nextDateForAppDay(existingSession.day ?? 0),
        startTime: existingSession.startTime,
        endTime: existingSession.endTime,
        notes: existingSession.notes,
        color: existingSession.color,
      });
    } else {
      setEditingSession(null);
      setFormData({
        subject: '',
        date: todayISO(),
        startTime: '08:00',
        endTime: '09:30',
        notes: '',
        color: CLASS_COLORS[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleSave = () => {
    if (!formData.subject.trim() || !parseISODate(formData.date)) return;
    addSavedSubject(formData.subject);

    if (editingSession) {
      setSessions(prev => prev.map(s => 
        s.id === editingSession.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      const newSession: ReviewSession = {
        id: Date.now().toString(),
        ...formData,
      };
      setSessions(prev => [...prev, newSession]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (timerSession?.id === id) setTimerSession(null);
    setDeleteConfirm(null);
  };

  const todayIdx = todayAppDayIndex();

  // Weekly view: group by the weekday of each session's date
  const dayNames = ALL_DAYS.map(d => t[d as keyof typeof t]);
  const sessionsByDay = ALL_DAYS.map((_, dayIdx) =>
    sessions
      .filter(s => appDayOfWeek(s.date) === dayIdx)
      .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.startTime.localeCompare(b.startTime))
  );

  // Date view: group by exact date, soonest first
  const dateKeys = [...new Set(sessions.map(s => s.date || todayISO()))].sort();
  const sessionsByDate = dateKeys.map(date => ({
    date,
    days: daysUntil(date),
    sessions: sessions
      .filter(s => (s.date || todayISO()) === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  const renderSessionCard = (session: ReviewSession, dateLabel?: string) => (
    <div
      key={session.id}
      className="rounded-lg p-2 text-white text-xs cursor-pointer transform transition hover:scale-[1.02] relative"
      style={{ backgroundColor: session.color }}
      onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
    >
      <div className="font-bold truncate">{session.subject}</div>
      {dateLabel && <div className="opacity-80">🗓️ {dateLabel}</div>}
      <div className="opacity-90">🕐 {session.startTime} - {session.endTime}</div>
      <div className="opacity-75">{t.duration}: {calculateDuration(session.startTime, session.endTime)} min</div>

      {/* Expanded Content */}
      {expandedSession === session.id && (
        <div className="mt-2 pt-2 border-t border-white/30 space-y-2">
          {/* Notes */}
          {session.notes && (
            <div className="bg-black/20 rounded p-2">
              <div className="font-semibold mb-1">📝 {t.notes}:</div>
              <div className="opacity-90 whitespace-pre-wrap">{session.notes}</div>
            </div>
          )}

          {/* Start fullscreen timer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTimerSession(session);
            }}
            className="w-full px-2 py-2 bg-white/25 rounded hover:bg-white/40 text-xs font-semibold"
          >
            ▶️ {t.studyTimer}
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal(session);
              }}
              className="flex-1 px-2 py-1 bg-white/20 rounded hover:bg-white/30 text-[10px]"
            >
              ✏️ {t.edit}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm(session.id);
              }}
              className="flex-1 px-2 py-1 bg-red-500/50 rounded hover:bg-red-500/70 text-[10px]"
            >
              🗑️ {t.delete}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t.reviewSchedule}</h2>
          <p className="text-sm opacity-70">{t.savedHint}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm font-medium transition ${
                view === 'week'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              📅 {t.weekView}
            </button>
            <button
              onClick={() => setView('date')}
              className={`px-3 py-2 text-sm font-medium transition ${
                view === 'date'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              🗓️ {t.dateView}
            </button>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> {t.addReviewSession}
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm opacity-70">{t.noReviewSessions}</p>
        </div>
      ) : view === 'week' ? (
        /* Weekly grid: Saturday .. Friday */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dayNames.map((dayName, dayIdx) => (
            <div key={dayIdx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className={`p-3 font-semibold text-white ${
                dayIdx % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                dayIdx % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                dayIdx % 4 === 2 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span>{dayName}</span>
                  {dayIdx === todayIdx && (
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-white/25">{t.today}</span>
                  )}
                </div>
              </div>
              <div className="p-2 min-h-[100px]">
                {sessionsByDay[dayIdx].length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">{t.noReviewSessions}</p>
                ) : (
                  <div className="space-y-2">
                    {sessionsByDay[dayIdx].map(s => renderSessionCard(s, shortDateLabel(s.date, locale)))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grouped by exact date */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sessionsByDate.map(({ date, days, sessions: dateSessions }, idx) => (
            <div
              key={date}
              className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
                days !== null && days < 0 ? 'opacity-70' : ''
              }`}
            >
              <div className={`p-3 font-semibold text-white ${
                idx % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                idx % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                idx % 4 === 2 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{formatSessionDate(date, locale)}</span>
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-white/25">
                    {days === 0 ? t.today : days !== null && days > 0 ? t.upcoming : t.past}
                  </span>
                </div>
              </div>
              <div className="p-2 min-h-[100px]">
                <div className="space-y-2">
                  {dateSessions.map(s => renderSessionCard(s))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">
              {editingSession ? t.edit : t.addReviewSession}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.subject}</label>
                <ComboBox
                  value={formData.subject}
                  onChange={(v) => setFormData(prev => ({ ...prev, subject: v }))}
                  options={savedSubjects}
                  placeholder={t.subjectPlaceholder}
                  inputClassName="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.date}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.color}</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.startTime}</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.endTime}</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.notes}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t.notesPlaceholder}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!formData.subject.trim() || !parseISODate(formData.date)}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t.save}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg mb-6">{t.confirmDelete}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm!)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                {t.yes}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen study timer */}
      {timerSession && (
        <StudyTimer
          subject={timerSession.subject}
          initialMinutes={calculateDuration(timerSession.startTime, timerSession.endTime)}
          color={timerSession.color}
          onClose={() => setTimerSession(null)}
        />
      )}
    </div>
  );
}
