import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import Stats from './components/Stats';
import Timer from './components/Timer';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Modal from './components/Modal';
import Toast from './components/Toast';
import StickyNotes from './components/StickyNotes';
import ConfirmModal from './components/ConfirmModal';

// ==================== TAB TRANSITION WRAPPER ====================
function TabTransitionWrapper({ children }) {
  const elRef = useRef(null);
  useEffect(() => {
    if (elRef.current) {
      const isRtl = document.documentElement.dir === 'rtl';
      const startX = isRtl ? -20 : 20;
      gsap.fromTo(elRef.current,
        { opacity: 0, x: startX },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, []);

  return (
    <div ref={elRef} className="tab-pane-wrapper">
      {children}
    </div>
  );
}


// ==================== TRANSLATIONS ====================
const TRANSLATIONS = {
  en: {
    appTitle: 'Study Space',
    subtitle: 'Stay focused, get things done!',
    totalTasks: 'Total Tasks',
    activeTasks: 'Active Tasks',
    completedTasks: 'Completed',
    completion: 'Completion',
    pomodoros: 'Pomodoros',
    focusTime: 'Focus Time',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    focus25min: 'Focus',
    shortBreak5min: 'Short Break',
    longBreak15min: 'Long Break',
    customDuration: 'Custom Timer',
    todaySessions: 'Today: {count} sessions',
    searchTasks: 'Search tasks...',
    addNewTask: 'Add a study task...',
    noCategory: 'No Category',
    work: 'Work',
    personal: 'Personal',
    shopping: 'Shopping',
    health: 'Health',
    study: 'Study',
    other: 'Other',
    lowPriority: 'Low Priority',
    mediumPriority: 'Medium Priority',
    highPriority: 'High Priority',
    addNote: 'Add Note',
    addNotes: 'Add notes or description...',
    addTask: '+ Add',
    moreOptions: 'More Options',
    lessOptions: 'Less Options',
    more: 'More',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    today: 'Today',
    overdue: 'Overdue',
    export: '📥 Export Data',
    import: '📤 Import Data',
    noTasks: 'No tasks found. Add one to get started!',
    taskAdded: 'Task added successfully!',
    taskCompleted: 'Task completed!',
    taskDeleted: 'Task deleted',
    taskUpdated: 'Task updated!',
    timerFinished: "Time's up! Great job!",
    dashboardTab: 'Workspace',
    notesTab: 'Sticky Notes',
    snapToGrid: 'Snap to Grid',
    clearAllNotes: 'Clear Canvas',
    doubleClickSpawn: 'Double-click anywhere to add a note',
    notePlaceholder: 'Type note here...',
    noteColor: 'Note Color:'
  },
  ar: {
    appTitle: 'مساحة الدراسة',
    subtitle: 'ابقَ مركزاً، أنجز المهام!',
    totalTasks: 'إجمالي المهام',
    activeTasks: 'مهام نشطة',
    completedTasks: 'مكتملة',
    completion: 'نسبة الإنجاز',
    pomodoros: 'بومودورو',
    focusTime: 'وقت التركيز',
    start: 'ابدأ',
    pause: 'إيقاف',
    reset: 'إعادة',
    focus25min: 'تركيز',
    shortBreak5min: 'استراحة قصيرة',
    longBreak15min: 'استراحة طويلة',
    customDuration: 'مؤقت مخصص',
    todaySessions: 'جلسات اليوم: {count}',
    searchTasks: 'ابحث عن المهام...',
    addNewTask: 'أضف مهمة دراسية...',
    noCategory: 'بلا تصنيف',
    work: 'عمل',
    personal: 'شخصي',
    shopping: 'تسوق',
    health: 'صحة',
    study: 'دراسة',
    other: 'أخرى',
    lowPriority: 'أولوية منخفضة',
    mediumPriority: 'أولوية متوسطة',
    highPriority: 'أولوية عالية',
    addNote: 'إضافة ملاحظة',
    addNotes: 'أضف ملاحظات أو وصف...',
    addTask: '+ إضافة',
    moreOptions: 'خيارات إضافية',
    lessOptions: 'خيارات أقل',
    more: 'المزيد',
    all: 'الكل',
    active: 'نشطة',
    completed: 'مكتملة',
    today: 'اليوم',
    overdue: 'متأخرة',
    export: '📥 تصدير البيانات',
    import: '📤 استيراد البيانات',
    noTasks: 'لا توجد مهام حالياً. أضف مهمة جديدة للبدء!',
    taskAdded: 'تم إضافة المهمة بنجاح!',
    taskCompleted: 'تم إكمال المهمة!',
    taskDeleted: 'تم حذف المهمة',
    taskUpdated: 'تم تحديث المهمة!',
    timerFinished: 'انتهى الوقت! عمل رائع!',
    dashboardTab: 'مساحة العمل',
    notesTab: 'الملاحظات اللاصقة',
    snapToGrid: 'محاذاة للشبكة',
    clearAllNotes: 'مسح لوحة الملاحظات',
    doubleClickSpawn: 'انقر مرتين في أي مكان لإضافة ملاحظة',
    notePlaceholder: 'اكتب ملاحظتك هنا...',
    noteColor: 'لون الملاحظة:'
  }
};

export default function App() {
  // ==================== PERSISTENT STORAGE STATE ====================
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage('pomodoroSessions', []);
  const [timerSettings, setTimerSettings] = useLocalStorage('timerSettings', {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  });
  const [language, setLanguage] = useLocalStorage('language', 'en');
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [notes, setNotes] = useLocalStorage('notes', []);
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'dashboard');

  // ==================== INTERACTION STATES ====================
  const [timerMode, setTimerMode] = useState('focus');
  const [timeRemaining, setTimeRemaining] = useState(timerSettings.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Toasts state
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  
  // Custom Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });


  // Settings input states
  const [tempFocus, setTempFocus] = useState(timerSettings.focus / 60);
  const [tempShort, setTempShort] = useState(timerSettings.short / 60);
  const [tempLong, setTempLong] = useState(timerSettings.long / 60);

  const fileInputRef = useRef(null);

  // ==================== TRANSLATION UTILITY ====================
  const translate = useCallback((key, params = {}) => {
    const dictionary = TRANSLATIONS[language] || TRANSLATIONS.en;
    const translation = dictionary[key] || key;
    return translation.replace(/{(\w+)}/g, (match, param) => params[param] || match);
  }, [language]);

  // ==================== TOAST FEEDBACK ====================
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ==================== AUDIO NOTIFICATION ====================
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tone 1: High Pitch
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(660, audioCtx.currentTime); // Mi
      gain1.gain.setValueAtTime(0, audioCtx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.4);

      // Tone 2: Higher Pitch (Arpeggio effect)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // La
        gain2.gain.setValueAtTime(0, audioCtx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.5);
      }, 150);

    } catch (e) {
      console.warn('Audio device blocked or unavailable for chime:', e);
    }
  }, []);

  // ==================== TIMER HANDLERS ====================
  const switchMode = useCallback((mode) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeRemaining(timerSettings[mode]);
  }, [timerSettings]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    playNotificationSound();
    
    // Add completed Pomodoro session (only if in Focus mode)
    if (timerMode === 'focus') {
      const newSession = {
        id: Date.now(),
        duration: timerSettings.focus,
        mode: 'focus',
        completedAt: new Date().toISOString()
      };
      setPomodoroSessions((prev) => [...prev, newSession]);
      showToast(translate('timerFinished'), 'success');
      
      // Auto transition to short break
      switchMode('short');
    } else {
      showToast(translate('timerFinished'), 'success');
      // Auto transition back to focus
      switchMode('focus');
    }
  }, [timerMode, timerSettings, playNotificationSound, switchMode, translate, showToast, setPomodoroSessions]);

  // ==================== SIDE EFFECTS ====================
  // Theme updates
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Language & layout direction updates
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  // Notes tab class toggle for full-screen layout breakout
  useEffect(() => {
    const root = document.documentElement;
    if (activeTab === 'notes') {
      root.classList.add('notes-mode');
    } else {
      root.classList.remove('notes-mode');
    }
    return () => root.classList.remove('notes-mode');
  }, [activeTab]);

  // Timer Tick Interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Handle completion in reaction to timeRemaining hitting 0
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      const timer = setTimeout(() => {
        handleTimerComplete();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // ==================== TODO CRUD ACTIONS ====================
  const handleAddTodo = (taskData) => {
    const newTodo = {
      id: Date.now(),
      text: taskData.text,
      time: taskData.time,
      priority: taskData.priority,
      category: taskData.category,
      note: taskData.note,
      completed: false,
      createdAt: new Date().toISOString(),
      order: todos.length
    };
    
    setTodos((prev) => [...prev, newTodo]);
    showToast(translate('taskAdded'), 'success');
  };

  const handleToggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const completed = !todo.completed;
          showToast(completed ? translate('taskCompleted') : translate('active'), 'success');
          return { ...todo, completed };
        }
        return todo;
      })
    );
  };

  const handleDeleteTodo = (id) => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'حذف المهمة' : 'Delete Task',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?',
      onConfirm: () => {
        const el = document.querySelector(`.todo-item-card[data-id="${id}"]`);
        if (el) {
          gsap.to(el, {
            opacity: 0,
            scale: 0.9,
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            borderWidth: 0,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
              setTodos((prev) => prev.filter((t) => t.id !== id));
              showToast(translate('taskDeleted'), 'warning');
            }
          });
        } else {
          setTodos((prev) => prev.filter((t) => t.id !== id));
          showToast(translate('taskDeleted'), 'warning');
        }
      }
    });
  };

  const handleSaveEditTodo = (id, newText) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
    showToast(translate('taskUpdated'), 'success');
  };

  const handleReorderTodos = (draggedId, targetId) => {
    const draggedIndex = todos.findIndex((t) => t.id === draggedId);
    const targetIndex = todos.findIndex((t) => t.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const reorderedList = [...todos];
      const [removed] = reorderedList.splice(draggedIndex, 1);
      reorderedList.splice(targetIndex, 0, removed);
      
      // Update order markers
      const updatedList = reorderedList.map((t, idx) => ({ ...t, order: idx }));
      setTodos(updatedList);
    }
  };

  const handleViewDetails = (id) => {
    setSelectedTodoId(id);
    setIsDetailsOpen(true);
  };

  // ==================== TIMER SETTINGS ACTIONS ====================
  const handleOpenSettings = () => {
    setTempFocus(timerSettings.focus / 60);
    setTempShort(timerSettings.short / 60);
    setTempLong(timerSettings.long / 60);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    const focusSeconds = Math.max(1, parseInt(tempFocus) || 25) * 60;
    const shortSeconds = Math.max(1, parseInt(tempShort) || 5) * 60;
    const longSeconds = Math.max(1, parseInt(tempLong) || 15) * 60;

    const newSettings = {
      focus: focusSeconds,
      short: shortSeconds,
      long: longSeconds
    };
    
    setTimerSettings(newSettings);
    setTimeRemaining(newSettings[timerMode]);
    setIsRunning(false);
    setIsSettingsOpen(false);
    showToast(translate('taskUpdated'), 'success');
  };

  // ==================== IMPORT / EXPORT ====================
  const handleExportData = () => {
    const data = {
      todos,
      pomodoroSessions,
      notes,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.todos && Array.isArray(data.todos)) {
          setConfirmModal({
            isOpen: true,
            title: language === 'ar' ? 'استيراد البيانات' : 'Import Data',
            message: language === 'ar' 
              ? 'الاستيراد سيستبدل جميع المهام الحالية. هل تريد المتابعة؟' 
              : 'Import will overwrite all current tasks. Continue?',
            onConfirm: () => {
              setTodos(data.todos);
              if (data.pomodoroSessions && Array.isArray(data.pomodoroSessions)) {
                setPomodoroSessions(data.pomodoroSessions);
              }
              if (data.notes && Array.isArray(data.notes)) {
                setNotes(data.notes);
              }
              showToast('Backup restored successfully!', 'success');
            }
          });
        } else {
          showToast('Invalid file format', 'error');
        }
      } catch {
        showToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // ==================== FILTERING & SORTING LOGIC ====================
  const getFilteredTodos = () => {
    let list = [...todos];
    const todayStr = new Date().toISOString().split('T')[0];

    // Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.text.toLowerCase().includes(query) ||
          (t.note && t.note.toLowerCase().includes(query))
      );
    }

    // Status / Mode Tab Filters
    switch (currentFilter) {
      case 'active':
        list = list.filter((t) => !t.completed);
        break;
      case 'completed':
        list = list.filter((t) => t.completed);
        break;
      case 'high':
        list = list.filter((t) => t.priority === 'high');
        break;
      case 'today':
        // Show tasks created today
        list = list.filter((t) => !t.createdAt || t.createdAt.split('T')[0] === todayStr);
        break;
      case 'all':
      default:
        break;
    }

    // Sort criteria: Incomplete first, then Priority (high->medium->low), then Target time, then Order
    list.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      if (priorityWeights[a.priority] !== priorityWeights[b.priority]) {
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return (a.order || 0) - (b.order || 0);
    });

    return list;
  };

  const filteredTodos = getFilteredTodos();
  const selectedTodo = todos.find((t) => t.id === selectedTodoId);

  return (
    <div className="app-container">
      {/* Toast container */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header Panel */}
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        translate={translate}
        pomodoroSessions={pomodoroSessions}
      />

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          {translate('dashboardTab')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          {translate('notesTab')}
        </button>
      </div>

      {/* Main Switch Content */}
      {activeTab === 'dashboard' ? (
        <TabTransitionWrapper>
          <div className="dashboard-grid">
            {/* Left Column: Timer & Stats */}
            <div className="dash-col">
              <Timer
                timeRemaining={timeRemaining}
                setTimeRemaining={setTimeRemaining}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                timerMode={timerMode}
                switchMode={switchMode}
                TIMER_DURATIONS={timerSettings}
                onOpenSettings={handleOpenSettings}
                translate={translate}
              />

              <Stats
                todos={todos}
                pomodoroSessions={pomodoroSessions}
                translate={translate}
              />

              {/* Import/Export strip */}
              <div className="glass-panel io-strip">
                <button className="btn-io" onClick={handleExportData}>
                  {translate('export')}
                </button>
                <button className="btn-io" onClick={() => fileInputRef.current?.click()}>
                  {translate('import')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportData}
                />
              </div>
            </div>

            {/* Right Column: Tasks */}
            <div className="dash-col">
              <TodoForm onAddTodo={handleAddTodo} translate={translate} />
              
              <TodoList
                todos={filteredTodos}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onSaveEdit={handleSaveEditTodo}
                onViewDetails={handleViewDetails}
                onReorderTodos={handleReorderTodos}
                translate={translate}
                language={language}
              />
            </div>
          </div>
        </TabTransitionWrapper>
      ) : (
        <TabTransitionWrapper>
          <StickyNotes
            notes={notes}
            setNotes={setNotes}
            translate={translate}
            language={language}
          />
        </TabTransitionWrapper>
      )}

      {/* ==================== TIMER SETTINGS DIALOG ==================== */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={translate('customDuration')}
      >
        <div className="option-field">
          <label>{translate('focusTime')} ({language === 'ar' ? 'دقائق' : 'minutes'})</label>
          <input
            type="number"
            className="input-sub"
            min="1"
            max="120"
            value={tempFocus}
            onChange={(e) => setTempFocus(e.target.value)}
          />
        </div>
        <div className="option-field">
          <label>{translate('shortBreak5min').split(' ')[0] /* Break label */ || 'Short Break'} ({language === 'ar' ? 'دقائق' : 'minutes'})</label>
          <input
            type="number"
            className="input-sub"
            min="1"
            max="60"
            value={tempShort}
            onChange={(e) => setTempShort(e.target.value)}
          />
        </div>
        <div className="option-field">
          <label>{translate('longBreak15min').split(' ')[0] || 'Long Break'} ({language === 'ar' ? 'دقائق' : 'minutes'})</label>
          <input
            type="number"
            className="input-sub"
            min="1"
            max="60"
            value={tempLong}
            onChange={(e) => setTempLong(e.target.value)}
          />
        </div>
        <div className="modal-footer" style={{ border: 'none', padding: '0', marginTop: '1rem' }}>
          <button className="btn-timer btn-timer-primary" onClick={handleSaveSettings}>
            {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
          </button>
        </div>
      </Modal>

      {/* ==================== TASK DETAILS DIALOG ==================== */}
      <Modal
        isOpen={isDetailsOpen && !!selectedTodo}
        onClose={() => setIsDetailsOpen(false)}
        title={language === 'ar' ? 'تفاصيل المهمة' : 'Task Details'}
      >
        {selectedTodo && (
          <>
            <div className="detail-item">
              <span className="detail-label">{language === 'ar' ? 'العنوان' : 'Title'}</span>
              <span className="detail-value">{selectedTodo.text}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">{language === 'ar' ? 'الحالة' : 'Status'}</span>
              <span className="detail-value">
                {selectedTodo.completed 
                  ? (language === 'ar' ? 'مكتملة' : 'Completed')
                  : (language === 'ar' ? 'نشطة' : 'Active')}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">{language === 'ar' ? 'التصنيف' : 'Category'}</span>
              <span className="detail-value">
                {translate(selectedTodo.category) || selectedTodo.category}
              </span>
            </div>

            {selectedTodo.time && (
              <div className="detail-item">
                <span className="detail-label">{language === 'ar' ? 'وقت الإنجاز' : 'Target Time'}</span>
                <span className="detail-value">{selectedTodo.time}</span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">{language === 'ar' ? 'الأولوية' : 'Priority'}</span>
              <span className="detail-value">
                {translate(selectedTodo.priority + 'Priority')}
              </span>
            </div>

            {selectedTodo.note && (
              <div className="detail-item">
                <span className="detail-label">{language === 'ar' ? 'الملاحظات' : 'Notes'}</span>
                <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selectedTodo.note}</span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</span>
              <span className="detail-value">
                {new Date(selectedTodo.createdAt).toLocaleString(
                  language === 'ar' ? 'ar-SA' : 'en-US'
                )}
              </span>
            </div>
          </>
        )}
      </Modal>
      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        language={language}
      />
    </div>
  );
}
