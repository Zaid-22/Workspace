import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Animated stat number hook utilizing GSAP
 */
function useCountUp(target, duration = 0.6) {
  const [count, setCount] = useState(target);
  const prevRef = useRef(target);
  const objRef = useRef({ value: target });

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    prevRef.current = to;

    if (from === to) return;

    objRef.current.value = from;
    const tween = gsap.to(objRef.current, {
      value: to,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        setCount(Math.round(objRef.current.value));
      }
    });

    return () => {
      tween.kill();
    };
  }, [target, duration]);

  return count;
}

/**
 * Statistics panel with animated numbers, gradient stat cards, pomodoro dots
 */
export default function Stats({ todos, pomodoroSessions, translate }) {
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = pomodoroSessions.filter(s => s.completedAt?.split('T')[0] === todayStr);
  const todayPomodorosCount = todaySessions.length;

  const animatedActive = useCountUp(activeCount);
  const animatedCompleted = useCountUp(completedCount);
  const animatedPomodoros = useCountUp(pomodoroSessions.length);
  const animatedRate = useCountUp(completionRate);

  // Last 8 sessions dots (today)
  const sessionDots = Array.from({ length: 8 }, (_, i) => ({
    filled: i < todayPomodorosCount
  }));

  return (
    <div className="glass-panel stats-panel">
      <div className="stats-grid">
        {/* Active Tasks */}
        <div className="stat-card stat-card-active">
          <div className="stat-icon-wrap">
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </span>
          </div>
          <div className="stat-value stat-value-active">{animatedActive}</div>
          <div className="stat-label">{translate('activeTasks')}</div>
        </div>

        {/* Completed Tasks */}
        <div className="stat-card stat-card-completed">
          <div className="stat-icon-wrap">
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
          <div className="stat-value stat-value-completed">{animatedCompleted}</div>
          <div className="stat-label">{translate('completedTasks')}</div>
        </div>

        {/* Pomodoros */}
        <div className="stat-card stat-card-pomodoro">
          <div className="stat-icon-wrap">
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
          </div>
          <div className="stat-value stat-value-pomodoro">{animatedPomodoros}</div>
          <div className="stat-label">{translate('pomodoros')}</div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="stats-progress-section">
        <div className="completion-progress-header">
          <span className="completion-label">{translate('completion')}</span>
          <span className="completion-pct">{animatedRate}%</span>
        </div>
        <div className="completion-progress-bar-bg">
          <div
            className="completion-progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Pomodoro session dots */}
      <div className="session-dots-row">
        <span className="session-dots-label">
          {translate('todaySessions', { count: todayPomodorosCount })}
        </span>
        <div className="session-dots">
          {sessionDots.map((dot, i) => (
            <div
              key={i}
              className={`session-dot ${dot.filled ? 'filled' : ''}`}
              title={dot.filled ? `Session ${i + 1} complete` : `Session ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
