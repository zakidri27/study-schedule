import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UniversityClass, AttendanceRecord, UNIVERSITY_DAYS, TIME_SLOTS, CLASS_COLORS } from '../types';
import { todayAppDayIndex, currentSlotIndex, todayISO } from '../utils/date';
import ComboBox from './ComboBox';

interface UniversityScheduleProps {
  classes: UniversityClass[];
  setClasses: React.Dispatch<React.SetStateAction<UniversityClass[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

export default function UniversitySchedule({ classes, setClasses, attendance, setAttendance }: UniversityScheduleProps) {
  const { t, language, savedSubjects, savedProfessors, savedRooms, addSavedSubject, addSavedProfessor, addSavedRoom } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<UniversityClass | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Attendance modal
  const [attendanceTarget, setAttendanceTarget] = useState<UniversityClass | null>(null);
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // Live clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    professor: '',
    room: '',
    color: CLASS_COLORS[0],
  });

  const openModal = (day: number, slot: number | null, existingClass?: UniversityClass) => {
    setSelectedDay(day);
    setSelectedSlot(slot);
    if (existingClass) {
      setEditingClass(existingClass);
      setFormData({
        name: existingClass.name,
        professor: existingClass.professor,
        room: existingClass.room,
        color: existingClass.color,
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        professor: '',
        room: '',
        color: CLASS_COLORS[day % CLASS_COLORS.length],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({ name: '', professor: '', room: '', color: CLASS_COLORS[0] });
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    addSavedSubject(formData.name);
    if (formData.professor.trim()) addSavedProfessor(formData.professor);
    if (formData.room.trim()) addSavedRoom(formData.room);

    if (editingClass && selectedSlot !== null) {
      setClasses(prev => prev.map(c => 
        c.id === editingClass.id 
          ? { ...c, ...formData }
          : c
      ));
    } else if (selectedSlot !== null) {
      const newClass: UniversityClass = {
        id: Date.now().toString(),
        ...formData,
        day: selectedDay,
        timeSlot: selectedSlot,
      };
      setClasses(prev => [...prev, newClass]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setAttendance(prev => prev.filter(a => a.classId !== id));
    setDeleteConfirm(null);
  };

  const getClassForSlot = (day: number, slot: number): UniversityClass | undefined => {
    return classes.find(c => c.day === day && c.timeSlot === slot);
  };

  const dayNames = UNIVERSITY_DAYS.map(d => t[d as keyof typeof t]);

  const todayIdx = todayAppDayIndex(now);
  const curSlot = currentSlotIndex(now);
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const dateLabel = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const clockLabel = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const getAttendance = (classId: string) =>
    attendance.find(a => a.classId === classId && a.date === todayISO(now) && a.attended);

  const openAttendance = (cls: UniversityClass) => {
    setAttendanceTarget(cls);
    setAttendanceNotes(getAttendance(cls.id)?.notes ?? '');
  };

  const confirmAttendance = () => {
    if (!attendanceTarget) return;
    const existing = attendance.find(a => a.classId === attendanceTarget.id && a.date === todayISO(now));
    if (existing) {
      setAttendance(prev => prev.map(a => a.id === existing.id ? { ...a, attended: true, notes: attendanceNotes } : a));
    } else {
      setAttendance(prev => [...prev, {
        id: Date.now().toString(),
        classId: attendanceTarget.id,
        date: todayISO(now),
        attended: true,
        notes: attendanceNotes,
      }]);
    }
    setAttendanceTarget(null);
  };

  const removeAttendance = () => {
    if (!attendanceTarget) return;
    setAttendance(prev => prev.filter(a => !(a.classId === attendanceTarget.id && a.date === todayISO(now))));
    setAttendanceTarget(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t.universitySchedule}</h2>
          <p className="text-sm opacity-70">8:00 AM - 5:00 PM | 1.5 hours per class</p>
        </div>
        <div className="text-sm bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
          <div className="font-semibold">📅 {t.today}: {dateLabel}</div>
          <div className="opacity-70 font-mono">🕐 {clockLabel}</div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 bg-gray-100 dark:bg-gray-900 text-sm font-semibold border-b border-r border-gray-200 dark:border-gray-700">
                {t.time}
              </th>
              {dayNames.map((day, idx) => (
                <th 
                  key={idx} 
                  className={`p-3 text-sm font-semibold border-b border-r border-gray-200 dark:border-gray-700 ${
                    idx % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-purple-50 dark:bg-purple-900/30'
                  } ${idx === todayIdx ? 'ring-2 ring-inset ring-red-400' : ''}`}
                >
                  {day}
                  {idx === todayIdx && <span className="block text-[10px] text-red-500 font-bold">● {t.today}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, slotIdx) => (
              <tr key={slotIdx}>
                <td className="p-2 text-center text-xs font-medium bg-gray-50 dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700">
                  <div>{slot.start}</div>
                  <div className="opacity-60">↓</div>
                  <div>{slot.end}</div>
                </td>
                {UNIVERSITY_DAYS.map((_, dayIdx) => {
                  const classItem = getClassForSlot(dayIdx, slotIdx);
                  const isNow = !!classItem && dayIdx === todayIdx && slotIdx === curSlot;
                  const attended = classItem ? getAttendance(classItem.id) : undefined;
                  return (
                    <td 
                      key={dayIdx} 
                      className={`p-1 border-r border-b border-gray-200 dark:border-gray-700 min-h-[80px] align-top ${
                        isNow ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      {classItem ? (
                        <div className="space-y-1">
                          <div
                            className={`relative p-2 rounded-lg text-white text-xs cursor-pointer transform transition hover:scale-[1.02] hover:shadow-lg group ${
                              isNow ? 'ring-2 ring-red-500 ring-offset-1 animate-pulse' : ''
                            }`}
                            style={{ backgroundColor: classItem.color }}
                            onClick={() => openModal(dayIdx, slotIdx, classItem)}
                          >
                            {isNow && (
                              <span className="absolute -top-2 start-1 text-[9px] bg-red-500 px-1.5 py-0.5 rounded-full font-bold">
                                ● {t.nowStudying}
                              </span>
                            )}
                            {attended && (
                              <span className="absolute -top-2 end-1 text-[9px] bg-green-600 px-1.5 py-0.5 rounded-full font-bold">
                                ✔ {t.attended}
                              </span>
                            )}
                            <div className="font-bold truncate mt-1">{classItem.name}</div>
                            {classItem.professor && (
                              <div className="opacity-90 truncate">{classItem.professor}</div>
                            )}
                            {classItem.room && (
                              <div className="opacity-75 truncate">📍 {classItem.room}</div>
                            )}
                            <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(classItem.id);
                                }}
                                className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px]"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {isNow && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAttendance(classItem);
                              }}
                              className="w-full text-[10px] py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold"
                            >
                              {attended ? `✔ ${t.attendanceToday}` : `✓ ${t.markAttended}`}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => openModal(dayIdx, slotIdx)}
                          className="w-full h-full min-h-[60px] p-2 text-xs opacity-40 hover:opacity-70 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center justify-center"
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">
              {editingClass ? t.edit : t.addClass}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.className}</label>
                <ComboBox
                  value={formData.name}
                  onChange={(v) => setFormData(prev => ({ ...prev, name: v }))}
                  options={savedSubjects}
                  placeholder={t.classNamePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.professor}</label>
                <ComboBox
                  value={formData.professor}
                  onChange={(v) => setFormData(prev => ({ ...prev, professor: v }))}
                  options={savedProfessors}
                  placeholder={t.professorPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.room}</label>
                <ComboBox
                  value={formData.room}
                  onChange={(v) => setFormData(prev => ({ ...prev, room: v }))}
                  options={savedRooms}
                  placeholder={t.roomPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.color}</label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

      {/* Attendance Modal */}
      {attendanceTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAttendanceTarget(null)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-1">📋 {t.attendance}</h3>
            <div className="mb-4">
              <div className="font-semibold" style={{ color: attendanceTarget.color }}>{attendanceTarget.name}</div>
              <div className="text-sm opacity-70">
                {t[UNIVERSITY_DAYS[attendanceTarget.day] as keyof typeof t]} · {TIME_SLOTS[attendanceTarget.timeSlot].label}
              </div>
              <div className="text-sm opacity-70">{t.today}: {dateLabel}</div>
            </div>

            <label className="block text-sm font-medium mb-1">{t.notesOptional}</label>
            <textarea
              value={attendanceNotes}
              onChange={(e) => setAttendanceNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              placeholder={t.notesPlaceholder}
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={confirmAttendance}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
              >
                ✓ {t.markAttended}
              </button>
              {getAttendance(attendanceTarget.id) && (
                <button
                  onClick={removeAttendance}
                  className="py-2 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  {t.delete}
                </button>
              )}
              <button
                onClick={() => setAttendanceTarget(null)}
                className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
    </div>
  );
}
