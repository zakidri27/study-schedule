# 📚 Study Schedule — جدول المذاكرة

**تطبيق mobile (Android) لتنظيم جدول المذاكرة في الجامعة + جدول المراجعة + مواقيت الأذان.**
يعمل **بدون إنترنت** بعد التثبيت (البيانات محفوظة محليًا).

---

## ⬇️ Download / تحميل — click once / اضغط مرة واحدة

[![Download Android APK](https://img.shields.io/badge/⬇️%20Download%20Android%20APK-v1.0.0-brightgreen?style=for-the-badge&logo=android)](https://github.com/zakidri27/study-schedule/releases/download/v1.0.0/StudySchedule-release.apk)

> **للطلاب (تثبيت بخطوة واحدة):**
> 1. اضغط على الزر أعلاه لتحميل StudySchedule-release.apk.
> 2. افتح الملف من «التنزيلات» (Downloads).
> 3. إن سألك Android «مصدر غير معروف» → **السماح (Allow)** → **تثبيت (Install)**.
> 4. افتح التطبيق — لا حاجة لإنترنت (المواقيت تُنزّل مرة واحدة عند أول اتصال).

---

## ✨ الميزات
- **جدول الجامعة (University Schedule)** — 7 أيام × 8 فترات (08:00–17:00)، إضافة/حذف الحصص، تلوين، تمييز الحصة الجارية.
- **جدول المراجعة (Review Schedule)** — جلسات dated (أسبوعي أو حسب التاريخ)، مؤقت ملء الشاشة.
- **مواقيت الأذان (Prayer Times)** — لولاية **تيبازة**، Algeria (تُجلب من الإنترنت once وتعمل offline بعدها)، hijri date، الصلاة القادمة + عدّاد.
- **الإعدادات (Settings)** — تغيير اللغة (عربي/English)، الوضع الداكن، خلفية مخصصة، استيراد/تصدير JSON، خيارات محفوظة (combobox).
- **بدون إنترنت** — كل البيانات في localStorage/Capacitor WebView.

## 🛠️ البناء من المصدر
```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

## 📄 License
MIT
