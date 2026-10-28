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

const STORAGE_KEY = 'taskflow.tasks.v1'

function getRoute() {
  if (window.location.pathname === '/app') return 'app'
  if (window.location.pathname === '/analytics') return 'analytics'
  return 'landing'
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
  const [route, setRoute] = useState(getRoute)
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
      setRoute(getRoute())
    }

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    document.title = route === 'landing'
      ? 'TaskFlow — Make room for meaningful progress'
      : route === 'analytics'
        ? 'Analytics — TaskFlow'
        : 'My tasks — TaskFlow'
  }, [route])

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
    : filter === 'All' ? 'My tasks' : filter

  function navigateTo(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
    setRoute(getRoute())
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
    updateTasks(current => deleteTask(current, task.id))
    setActionMessage(`Deleted "${task.title}".`)
    if (editingTaskId === task.id) setEditingTaskId(null)
  }

  if (route === 'landing') {
    return (
      <LandingPage
        tasks={tasks}
        stats={stats}
        onOpenApp={() => navigateTo('/app')}
        onOpenAnalytics={() => navigateTo('/analytics')}
      />
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => navigateTo('/')} aria-label="TaskFlow home">
          <img src="/taskflow-logo-light.svg" alt="" width="188" height="38" />
        </button>

        <p className="nav-label">WORKSPACE</p>
        <nav className="workspace-nav" aria-label="Task views">
          <button
            className={`nav-item${route === 'analytics' ? ' active' : ''}`}
            type="button"
            onClick={() => navigateTo('/analytics')}
            aria-current={route === 'analytics' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">▥</span>
            <span>Analytics</span>
          </button>
          {[
            { label: 'My tasks', value: 'All', icon: '▦' },
            { label: 'In progress', value: 'In Progress', icon: '◷' },
            { label: 'Completed', value: 'Completed', icon: '✓' },
          ].map(item => (
            <button
              className={`nav-item${route === 'app' && filter === item.value ? ' active' : ''}`}
              type="button"
              key={item.value}
              onClick={() => {
                setFilter(item.value)
                navigateTo('/app')
              }}
              aria-current={route === 'app' && filter === item.value ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.value === 'All' && <span className="nav-count">{stats.total}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-status" aria-hidden="true" />
          <span>Local workspace</span>
          <p>Tasks stay in this browser; there is no account or cloud sync.</p>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <p><span>Workspace</span><span className="breadcrumb-separator">/</span> {viewLabel}</p>
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
              <h1>Make progress, every day.</h1>
              <p className="subtitle">A clear view of what matters, and what to do next.</p>
            </div>
            <div className="workspace-chip"><span aria-hidden="true">●</span> Local workspace</div>
          </section>

          {storageMessage && <p className="storage-message" role="status">{storageMessage}</p>}

          <section className="stats" aria-label="Task statistics">
            <article className="stat-card">
              <span className="stat-label">Total tasks</span>
              <strong>{stats.total}</strong>
              <small>Across your workspace</small>
            </article>
            <article className="stat-card">
              <span className="stat-label">To do</span>
              <strong>{stats.pending}</strong>
              <small>Ready when you are</small>
            </article>
            <article className="stat-card">
              <span className="stat-label">In progress</span>
              <strong>{stats.inProgress}</strong>
              <small>Moving forward</small>
            </article>
            <article className="stat-card">
              <span className="stat-label">Completed</span>
              <strong>{stats.completed}</strong>
              <small>Work you’ve finished</small>
            </article>
            <article className="stat-card progress-stat">
              <div className="progress-label"><span className="stat-label">Completion</span><strong>{stats.completion}%</strong></div>
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
              <small>Overall progress</small>
            </article>
          </section>

          <section className="task-panel" aria-labelledby="task-heading">
            <div className="panel-heading">
              <div>
                <h2 id="task-heading">Project tasks</h2>
                <p>Plan your next step and keep work moving.</p>
              </div>
              <span className="task-count">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>

            <form className="add-form" onSubmit={addTask} noValidate>
              <div className="add-input-wrap">
                <label className="visually-hidden" htmlFor="new-task">New task title</label>
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
              <button className="primary-button" type="submit"><span aria-hidden="true">+</span> Add task</button>
            </form>

            <div className="task-tools">
              <label className="search-wrap">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <span className="visually-hidden">Search tasks</span>
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                />
              </label>
              <div className="filters" aria-label="Filter tasks by status">
                {TASK_FILTERS.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={filter === item ? 'filter active-filter' : 'filter'}
                    aria-pressed={filter === item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
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
                        <strong>{task.title}</strong>
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
                          {task.status}
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
