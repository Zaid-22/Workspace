
/**
 * Header — app branding, date badge, streak display, language & theme toggles
 */
export default function Header({ language, setLanguage, theme, setTheme, translate, pomodoroSessions = [] }) {
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const getCurrentDate = () => {
    return new Date().toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      { weekday: 'long', month: 'long', day: 'numeric' }
    );
  };

  // Today's pomodoro count for streak badge
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = pomodoroSessions.filter(s => s.completedAt?.split('T')[0] === todayStr).length;

  return (
    <header className="glass-panel header-panel">
      <div className="header-top">
        {/* Branding */}
        <div className="header-brand">
          <h1 className="header-title">
            <span className="header-title-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </span>
            {translate('appTitle')}
          </h1>
          <p className="header-subtitle">{translate('subtitle')}</p>
        </div>

        {/* Portal Slot for Sticky Notes Toolbar */}
        <div id="header-portal-slot"></div>

        {/* Controls cluster */}
        <div className="header-controls">
          {/* Date */}
          <div className="date-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{getCurrentDate()}</span>
          </div>

          {/* Today's focus streak */}
          {todayCount > 0 && (
            <div className="streak-badge" title="Focus sessions today">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{todayCount}</span>
            </div>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="btn-icon btn-lang"
            aria-label="Toggle language"
            title={language === 'en' ? 'Switch to Arabic' : 'تحويل إلى الإنجليزية'}
          >
            <span className="lang-flag">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </span>
            <span className="lang-code">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon btn-theme"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.72" x2="5.64" y2="18.3"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
