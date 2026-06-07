import { useEffect } from 'react';

/**
 * Pomodoro Timer - immersive circular countdown with animated gradient ring,
 * session dots, and mode-specific color theming.
 */
export default function Timer({
  timeRemaining,
  setTimeRemaining,
  isRunning,
  setIsRunning,
  timerMode,
  switchMode,
  TIMER_DURATIONS,
  onOpenSettings,
  translate
}) {
  const initialTime = TIMER_DURATIONS[timerMode];
  const progress = initialTime > 0 ? timeRemaining / initialTime : 1;

  // SVG circle math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Dynamic document title
  useEffect(() => {
    const modeLabels = { focus: 'Focus', short: 'Break', long: 'Long Break' };
    document.title = `${displayTime} | ${modeLabels[timerMode] || 'Timer'} — Study Space`;
    return () => { document.title = 'Study Space'; };
  }, [displayTime, timerMode]);

  const handleToggle = () => setIsRunning(!isRunning);
  const handleReset = () => { setIsRunning(false); setTimeRemaining(initialTime); };

  // Mode color configs
  const modeConfig = {
    focus: {
      gradientId: 'timerGrad-focus',
      from: '#0d9488',
      to: '#0ea5e9',
      glow: 'rgba(13, 148, 136, 0.35)',
      trackGlow: 'rgba(13, 148, 136, 0.12)',
      label: translate('focus25min'),
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    short: {
      gradientId: 'timerGrad-short',
      from: '#10b981',
      to: '#34d399',
      glow: 'rgba(16, 185, 129, 0.35)',
      trackGlow: 'rgba(16, 185, 129, 0.12)',
      label: translate('shortBreak5min'),
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      )
    },
    long: {
      gradientId: 'timerGrad-long',
      from: '#06b6d4',
      to: '#60a5fa',
      glow: 'rgba(6, 182, 212, 0.35)',
      trackGlow: 'rgba(6, 182, 212, 0.12)',
      label: translate('longBreak15min'),
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 18a5 5 0 0 0-10 0"></path>
          <line x1="12" y1="2" x2="12" y2="9"></line>
          <line x1="4.22" y1="10.22" x2="9.17" y2="15.17"></line>
          <line x1="1" y1="18" x2="3" y2="18"></line>
          <line x1="21" y1="18" x2="23" y2="18"></line>
          <line x1="19.78" y1="10.22" x2="14.83" y2="15.17"></line>
          <line x1="22" y1="22" x2="2" y2="22"></line>
        </svg>
      )
    }
  };

  const cfg = modeConfig[timerMode] || modeConfig.focus;
  const pct = Math.round(progress * 100);

  return (
    <div className="glass-panel timer-section">
      {/* Mode Toggle Pills */}
      <div className="timer-modes">
        {['focus', 'short', 'long'].map(mode => (
          <button
            key={mode}
            className={`timer-mode-btn ${timerMode === mode ? 'active' : ''}`}
            onClick={() => switchMode(mode)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {modeConfig[mode].icon({ width: 14, height: 14, className: 'timer-mode-icon' })}
            <span>
              {mode === 'focus' ? translate('focus25min') :
               mode === 'short' ? translate('shortBreak5min') :
               translate('longBreak15min')}
            </span>
          </button>
        ))}
      </div>

      {/* Radial Clock */}
      <div className="timer-display-container">
        {/* Outer glow ring when running */}
        {isRunning && (
          <div
            className="timer-glow-ring"
            style={{ '--glow-color': cfg.glow }}
          />
        )}

        <svg className="timer-circle-svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id={cfg.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={cfg.from} />
              <stop offset="100%" stopColor={cfg.to} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            className="timer-circle-bg"
            cx="60" cy="60" r={radius}
          />

          {/* Progress arc */}
          <circle
            className="timer-circle-progress"
            cx="60" cy="60" r={radius}
            stroke={`url(#${cfg.gradientId})`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
          />
        </svg>

        {/* Center Content */}
        <div className={`timer-inner-content ${isRunning ? 'running' : ''}`}>
          <div
            className="timer-digits"
            style={{ color: isRunning ? cfg.from : 'var(--text-primary)' }}
          >
            {displayTime}
          </div>
          <div className="timer-mode-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            {cfg.icon({ width: 14, height: 14, style: { display: 'inline-block' } })}
            <span>{cfg.label}</span>
          </div>
          <div className="timer-pct-badge">{pct}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        <button
          className="btn-timer btn-timer-primary"
          onClick={handleToggle}
          style={{ '--btn-glow': cfg.glow }}
        >
          {isRunning ? translate('pause') : translate('start')}
        </button>
        <button
          className="btn-timer btn-timer-secondary"
          onClick={handleReset}
          disabled={timeRemaining === initialTime && !isRunning}
        >
          {translate('reset')}
        </button>
      </div>

      {/* Custom Timer Settings */}
      <button
        className="timer-settings-btn"
        onClick={onOpenSettings}
        title={translate('customDuration')}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>{translate('customDuration')}</span>
      </button>
    </div>
  );
}
