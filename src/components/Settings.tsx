import { useRef } from 'react';
import { useApp } from '../context/AppContext';


export default function Settings() {
  const { 
    t, 
    language, 
    setLanguage, 
    isDarkMode, 
    toggleDarkMode,
    customBackground,
    setCustomBackground,
    customTheme,
    setCustomTheme,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const theme = JSON.parse(reader.result as string);
          if (typeof theme === 'object' && theme !== null) {
            setCustomTheme(theme as Record<string, string>);
            alert(language === 'ar' ? 'تم استيراد الثيم بنجاح!' : 'Theme imported successfully!');
          }
        } catch (error) {
          alert(language === 'ar' ? 'ملف JSON غير صالح' : 'Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportTheme = () => {
    const currentTheme = customTheme || {};
    const dataStr = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t.settings}</h2>

      <div className="space-y-6">
        {/* Language */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🌐</span> {t.language}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition ${
                language === 'ar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇸🇦 العربية
            </button>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🎨</span> {t.theme}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => !isDarkMode && toggleDarkMode()}
              disabled={!isDarkMode}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                !isDarkMode
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-50'
              }`}
            >
              ☀️ {t.lightMode}
            </button>
            <button
              onClick={() => isDarkMode && toggleDarkMode()}
              disabled={isDarkMode}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                isDarkMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-50'
              }`}
            >
              🌙 {t.darkMode}
            </button>
          </div>
          <button
            onClick={toggleDarkMode}
            className="mt-3 w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {isDarkMode ? `☀️ ${t.lightMode}` : `🌙 ${t.darkMode}`}
          </button>
        </div>

        {/* Custom Background */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🖼️</span> {t.customBackground}
          </h3>
          
          {customBackground && (
            <div className="mb-3 relative rounded-lg overflow-hidden h-32">
              <img 
                src={customBackground} 
                alt="Custom background" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              📁 {t.uploadImage}
            </button>
            {customBackground && (
              <button
                onClick={() => setCustomBackground(null)}
                className="py-2 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Theme Import/Export */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>⚙️</span> {t.importTheme} / {t.exportTheme}
          </h3>
          
          <p className="text-sm opacity-70 mb-4">{t.themeJsonInfo}</p>

          {/* Current Theme Preview */}
          {customTheme && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs font-medium mb-2">Current Theme:</p>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(customTheme, null, 2)}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              ref={themeInputRef}
              type="file"
              accept=".json"
              onChange={handleThemeImport}
              className="hidden"
            />
            <button
              onClick={() => themeInputRef.current?.click()}
              className="py-2 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              📥 {t.import}
            </button>
            <button
              onClick={handleExportTheme}
              className="py-2 px-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              📤 {t.exportTheme}
            </button>
          </div>

          {/* Sample JSON Format */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-xs font-medium mb-2">Sample JSON format:</p>
            <pre className="text-[10px] overflow-x-auto text-gray-600 dark:text-gray-400">
{`{
  "primaryColor": "#3b82f6",
  "secondaryColor": "#8b5cf6",
  "accentColor": "#22c55e",
  "backgroundColor": "#f8fafc",
  "surfaceColor": "#ffffff",
  "textColor": "#1e293b",
  "darkBackgroundColor": "#1f2937",
  "darkTextColor": "#f9fafb",
  "borderRadius": "12px",
  "fontFamily": "system-ui",
  "emblem": "data:image/svg+xml;base64,...",
  "watermark": "data:image/svg+xml;base64,..."
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
