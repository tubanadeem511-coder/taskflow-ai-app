import { useEffect, useMemo, useState } from 'react'
import {
  createTask,
  cycleTaskStatus,
  deleteTask,
  filterTasks,
  getTaskStats,
  INITIAL_TASKS,
  TASK_FILTERS,
  TASK_STATUSES,
  updateTaskTitle,
  validateTaskTitle,
} from './taskUtils.js'
import AnalyticsPage from './AnalyticsPage.jsx'
import LandingPage from './LandingPage.jsx'
import { getRoute } from './routes.js'

const STORAGE_KEY = 'taskflow.tasks.v1'

function Icon({ name, size = 18 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    tasks: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    analytics: <><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /></>,
    progress: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    completed: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    filter: <><path d="M4 7h16M7 12h10M10 17h4" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function loadWorkspace() {
  try {
    const savedTasks = window.localStorage.getItem(STORAGE_KEY)
    if (savedTasks === null) return { tasks: INITIAL_TASKS, message: '' }

    const parsedTasks = JSON.parse(savedTasks)
    const taskIds = new Set()
    const isValid = Array.isArray(parsedTasks) && parsedTasks.every(task => {
      if (
        !task
        || !Number.isSafeInteger(task.id)
        || typeof task.title !== 'string'
        || !task.title.trim()
        || !TASK_STATUSES.includes(task.status)
        || !['High', 'Medium', 'Low'].includes(task.priority)
        || taskIds.has(task.id)
      ) {
        return false
      }

      taskIds.add(task.id)
      return true
    })

    if (!isValid) throw new TypeError('Saved tasks have an invalid format.')
    return { tasks: parsedTasks, message: '' }
  } catch {
    return {
      tasks: INITIAL_TASKS,
      message: 'Saved tasks could not be loaded. Your workspace is showing starter tasks.',
    }
  }
}

export default function App() {
  const [workspace] = useState(loadWorkspace)
  const [tasks, setTasks] = useState(workspace.tasks)
  const [route, setRoute] = useState(() => getRoute(window.location.pathname))
  const [activeSection, setActiveSection] = useState(
    () => getRoute(window.location.pathname) === 'analytics' ? 'analytics' : 'dashboard',
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pendingTaskAction, setPendingTaskAction] = useState(null)
  const [hasTaskChanges, setHasTaskChanges] = useState(false)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [newTask, setNewTask] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editError, setEditError] = useState('')
  const [storageMessage, setStorageMessage] = useState(workspace.message)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    function syncRoute() {
      const nextRoute = getRoute(window.location.pathname)
      setRoute(nextRoute)
      setActiveSection(nextRoute === 'analytics' ? 'analytics' : 'dashboard')
      setIsSidebarOpen(false)
    }

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    if (!isSidebarOpen) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }

    document.getElementById('workspace-sidebar')?.querySelector('button')?.focus()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isSidebarOpen])

  useEffect(() => {
    if (route !== 'app' || !pendingTaskAction) return undefined

    const frame = window.requestAnimationFrame(() => {
      const taskPanel = document.getElementById('task-panel')
      if (pendingTaskAction === 'focus') document.getElementById('new-task')?.focus()
      taskPanel?.scrollIntoView({
        behavior: 'smooth',
        block: pendingTaskAction === 'focus' ? 'center' : 'start',
      })
      setPendingTaskAction(null)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pendingTaskAction, route])

  useEffect(() => {
    document.title = route === 'landing'
      ? 'TaskFlow — Make room for meaningful progress'
      : route === 'analytics'
        ? 'Analytics — TaskFlow'
        : `${activeSection === 'tasks' ? 'All tasks' : 'Dashboard'} — TaskFlow`
  }, [activeSection, route])

  useEffect(() => {
    if (!hasTaskChanges) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      setStorageMessage('')
    } catch {
      setStorageMessage('Changes could not be saved in this browser. Check your storage settings.')
    }
  }, [hasTaskChanges, tasks])

  const visibleTasks = useMemo(
    () => filterTasks(tasks, filter, query),
    [filter, query, tasks],
  )
  const stats = getTaskStats(tasks)
  const viewLabel = route === 'analytics'
    ? 'Analytics'
    : activeSection === 'tasks' ? 'All tasks' : filter === 'All' ? 'Dashboard' : filter

  function navigateTo(path, section) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
    const nextRoute = getRoute(path)
    setRoute(nextRoute)
    setActiveSection(section ?? (nextRoute === 'analytics' ? 'analytics' : 'dashboard'))
    setIsSidebarOpen(false)
  }

  function focusTaskCreation() {
    setFilter('All')
    setPendingTaskAction('focus')
    navigateTo('/app', 'dashboard')
  }

  function openAllTasks() {
    setFilter('All')
    setPendingTaskAction('scroll')
    navigateTo('/app', 'tasks')
  }

  function updateTasks(updater) {
    setTasks(updater)
    setHasTaskChanges(true)
  }

  function addTask(event) {
    event.preventDefault()
    const validationError = validateTaskTitle(newTask)
    if (validationError) {
      setValidationMessage(validationError)
      setActionMessage('')
      return
    }

    updateTasks(current => createTask(current, newTask))
    setActionMessage(`Added "${newTask.trim()}".`)
    setNewTask('')
    setValidationMessage('')
  }

  function changeStatus(task) {
    const nextStatus = TASK_STATUSES[
      (TASK_STATUSES.indexOf(task.status) + 1) % TASK_STATUSES.length
    ]
    updateTasks(current => cycleTaskStatus(current, task.id))
    setActionMessage(`"${task.title}" moved to ${nextStatus}.`)
  }

  function startEditing(task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditError('')
  }

  function saveEdit(event, task) {
    event.preventDefault()
    const validationError = validateTaskTitle(editTitle)
    if (validationError) {
      setEditError(validationError)
      return
    }

    updateTasks(current => updateTaskTitle(current, task.id, editTitle))
    setActionMessage(`Updated "${editTitle.trim()}".`)
    setEditingTaskId(null)
    setEditError('')
  }

  function removeTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return

    updateTasks(current => deleteTask(current, task.id))
    setActionMessage(`Deleted "${task.title}".`)
    if (editingTaskId === task.id) setEditingTaskId(null)
  }

  if (route === 'landing') {
    return (
      <LandingPage
        tasks={tasks}
        stats={stats}
        onOpenApp={() => navigateTo('/app', 'dashboard')}
        onOpenAnalytics={() => navigateTo('/analytics')}
      />
    )
  }

  return (
    <main className="app-shell">
      {isSidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar${isSidebarOpen ? ' sidebar-open' : ''}`} id="workspace-sidebar">
        <button className="brand" type="button" onClick={() => navigateTo('/')} aria-label="TaskFlow home">
          <img src="/taskflow-logo-light.svg" alt="" width="188" height="38" />
        </button>

        <p className="nav-label">WORKSPACE</p>
        <nav className="workspace-nav" aria-label="Task views">
          <button
            className={`nav-item${route === 'app' && activeSection === 'dashboard' ? ' active' : ''}`}
            type="button"
            onClick={() => {
              setFilter('All')
              navigateTo('/app', 'dashboard')
            }}
            aria-current={route === 'app' && activeSection === 'dashboard' ? 'page' : undefined}
          >
            <span className="nav-icon"><Icon name="dashboard" /></span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item${route === 'app' && activeSection === 'tasks' ? ' active' : ''}`}
            type="button"
            onClick={openAllTasks}
            aria-current={route === 'app' && activeSection === 'tasks' ? 'page' : undefined}
          >
            <span className="nav-icon"><Icon name="tasks" /></span>
            <span>All tasks</span>
            <span className="nav-count">{stats.total}</span>
          </button>
          <button
            className={`nav-item${route === 'analytics' ? ' active' : ''}`}
            type="button"
            onClick={() => navigateTo('/analytics', 'analytics')}
            aria-current={route === 'analytics' ? 'page' : undefined}
          >
            <span className="nav-icon"><Icon name="analytics" /></span>
            <span>Analytics</span>
          </button>
        </nav>

        <p className="nav-label status-nav-label">TASK STATUS</p>
        <nav className="workspace-nav status-nav" aria-label="Filter by task status">
          {[
            { label: 'Pending', value: 'Pending', icon: 'filter' },
            { label: 'In progress', value: 'In Progress', icon: 'progress' },
            { label: 'Completed', value: 'Completed', icon: 'completed' },
          ].map(item => (
            <button
              className={`nav-item${route === 'app' && filter === item.value ? ' active' : ''}`}
              type="button"
              key={item.value}
              onClick={() => {
                setFilter(item.value)
                navigateTo('/app', 'tasks')
              }}
              aria-current={route === 'app' && filter === item.value ? 'page' : undefined}
            >
              <span className="nav-icon"><Icon name={item.icon} /></span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="sidebar-create-button" type="button" onClick={focusTaskCreation}>
          <Icon name="plus" size={17} />
          <span>Create task</span>
        </button>

        <div className="sidebar-bottom">
          <span className="sidebar-status" aria-hidden="true" />
          <span>Local workspace</span>
          <p>Tasks stay in this browser; there is no account or cloud sync.</p>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="mobile-menu-button"
              type="button"
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
              aria-controls="workspace-sidebar"
              onClick={() => setIsSidebarOpen(open => !open)}
            >
              <Icon name={isSidebarOpen ? 'close' : 'menu'} />
            </button>
            <div>
              <p className="topbar-breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span> {viewLabel}</p>
              <h1 className="topbar-heading">{route === 'analytics' ? 'Analytics' : activeSection === 'tasks' ? 'All tasks' : 'Dashboard'}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            {route === 'app' && (
              <div className="search-wrap topbar-search">
                <Icon name="search" size={18} />
                <label className="visually-hidden" htmlFor="task-search">Search tasks</label>
                <input
                  id="task-search"
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search your tasks"
                />
                {query && (
                  <button
                    className="search-clear"
                    type="button"
                    aria-label="Clear task search"
                    onClick={() => setQuery('')}
                  >
                    <Icon name="close" size={15} />
                  </button>
                )}
              </div>
            )}
            {route === 'app' && (
              <button className="primary-button topbar-create-button" type="button" onClick={focusTaskCreation}>
                <Icon name="plus" size={17} />
                <span>Create task</span>
              </button>
            )}
          </div>
          <div className="profile" aria-label="TaskFlow workspace">
            <span className="profile-avatar" aria-hidden="true">TF</span>
            <span className="profile-name">My workspace</span>
          </div>
        </header>

        {route === 'analytics' ? (
          <AnalyticsPage tasks={tasks} onOpenApp={() => navigateTo('/app')} />
        ) : (
        <div className="page-content">
          <section className="welcome">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h2 className="welcome-heading">{activeSection === 'tasks' ? 'Everything on your list.' : 'Make progress, every day.'}</h2>
              <p className="subtitle">{activeSection === 'tasks' ? 'Find a task, update its status, and keep moving.' : 'A clear view of what matters, and what to do next.'}</p>
            </div>
            <div className="workspace-chip"><span aria-hidden="true" /> Local workspace</div>
          </section>

          {storageMessage && <p className="storage-message" role="status">{storageMessage}</p>}

          <section className="stats" aria-label="Task statistics">
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon total-icon"><Icon name="tasks" /></span><span className="stat-label">Total tasks</span></div>
              <strong>{stats.total}</strong>
              <small>Across your workspace</small>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon pending-icon"><Icon name="filter" /></span><span className="stat-label">Pending</span></div>
              <strong>{stats.pending}</strong>
              <small>Ready when you are</small>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon progress-icon"><Icon name="progress" /></span><span className="stat-label">In progress</span></div>
              <strong>{stats.inProgress}</strong>
              <small>Moving forward</small>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-icon completed-icon"><Icon name="completed" /></span><span className="stat-label">Completed</span></div>
              <strong>{stats.completed}</strong>
              <small>Work you’ve finished</small>
            </article>
          </section>

          <section className="task-panel" id="task-panel" aria-labelledby="task-heading">
            <div className="completion-summary">
              <div className="completion-copy"><span>Overall completion</span><strong>{stats.completion}%</strong></div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Task completion"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={stats.completion}
              >
                <span style={{ width: `${stats.completion}%` }} />
              </div>
            </div>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">TASK OVERVIEW</p>
                <h2 id="task-heading">{activeSection === 'tasks' ? 'All tasks' : 'Your tasks'}</h2>
                <p>Plan your next step and keep work moving.</p>
              </div>
              <span className="task-count">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>

            <div className="task-tools">
              <form className="add-form" onSubmit={addTask} noValidate aria-label="Create a task">
                <div className="add-input-wrap">
                  <label htmlFor="new-task">Create a task</label>
                  <input
                    id="new-task"
                    value={newTask}
                    onChange={event => {
                      setNewTask(event.target.value)
                      if (validationMessage) setValidationMessage('')
                    }}
                    placeholder="What needs to get done?"
                    aria-invalid={Boolean(validationMessage)}
                    aria-describedby={validationMessage ? 'task-validation' : undefined}
                  />
                  {validationMessage && <span className="validation-message" id="task-validation" role="alert">{validationMessage}</span>}
                </div>
                <div className="add-form-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setNewTask('')
                      setValidationMessage('')
                    }}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit"><Icon name="plus" size={17} /><span>Add task</span></button>
                </div>
              </form>
              <div className="filter-toolbar">
                <span className="filter-caption"><Icon name="filter" size={16} /> Filter</span>
                <div className="filters" aria-label="Filter tasks by status">
                  {TASK_FILTERS.map(item => (
                    <button
                      key={item}
                      type="button"
                      className={filter === item ? 'filter active-filter' : 'filter'}
                      aria-pressed={filter === item}
                      onClick={() => {
                        setFilter(item)
                        setActiveSection('tasks')
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {(filter !== 'All' || query) && (
                  <button className="reset-filters" type="button" onClick={() => { setFilter('All'); setQuery('') }}>
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {actionMessage && <p className="action-message" role="status">{actionMessage}</p>}

            <div className="task-list" aria-live="polite">
              {visibleTasks.map(task => (
                <article className="task-row" key={task.id}>
                  <span className={`task-marker ${task.status.toLowerCase().replace(' ', '-')}`} aria-hidden="true" />
                  {editingTaskId === task.id ? (
                    <form className="edit-task-form" onSubmit={event => saveEdit(event, task)} noValidate>
                      <div className="edit-input-wrap">
                        <label className="visually-hidden" htmlFor={`edit-task-${task.id}`}>Edit task title</label>
                        <input
                          id={`edit-task-${task.id}`}
                          value={editTitle}
                          onChange={event => {
                            setEditTitle(event.target.value)
                            if (editError) setEditError('')
                          }}
                          aria-invalid={Boolean(editError)}
                          aria-describedby={editError ? `edit-error-${task.id}` : undefined}
                          autoFocus
                        />
                        {editError && <span className="validation-message" id={`edit-error-${task.id}`} role="alert">{editError}</span>}
                      </div>
                      <button className="text-button save-button" type="submit">Save</button>
                      <button className="text-button" type="button" onClick={() => setEditingTaskId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <div className="task-info">
                        <strong title={task.title}>{task.title}</strong>
                        <span>TF-{task.id} <span className="meta-divider">·</span> {task.priority} priority</span>
                      </div>
                      <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <div className="task-actions">
                        <button
                          className={`status ${task.status.toLowerCase().replace(' ', '-')}`}
                          type="button"
                          onClick={() => changeStatus(task)}
                          aria-label={`Move ${task.title} from ${task.status} to the next status`}
                          title="Move to the next status"
                        >
                          <span>{task.status}</span><span className="status-chevron" aria-hidden="true">⌄</span>
                        </button>
                        <button className="icon-button" type="button" onClick={() => startEditing(task)} aria-label={`Edit ${task.title}`} title="Edit task">
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="m12.9 3.8 3.3 3.3M4 16l3.3-.7L16 6.6a1.8 1.8 0 0 0-2.6-2.6l-8.7 8.7L4 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button className="icon-button delete-button" type="button" onClick={() => removeTask(task)} aria-label={`Delete ${task.title}`} title="Delete task">
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M5 6h10m-9 0 .6 9h6.8l.6-9M8 6V4h4v2m-3 3v3m2-3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
              {visibleTasks.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">✓</span>
                  <h3>{tasks.length === 0 ? 'Your task list is clear' : 'No tasks found'}</h3>
                  <p>{tasks.length === 0 ? 'Add a task above to get started.' : 'Try a different search or status filter.'}</p>
                  {(filter !== 'All' || query) && (
                    <button className="text-button" type="button" onClick={() => { setFilter('All'); setQuery('') }}>
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="hint">Select a task’s status to move it to the next stage.</p>
          </section>
          <footer className="site-footer">TaskFlow <span>·</span> A calmer way to get work done.</footer>
        </div>
        )}
      </section>
    </main>
  )
}
