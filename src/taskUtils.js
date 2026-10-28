export const TASK_FILTERS = ['All', 'Pending', 'In Progress', 'Completed']
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed']

export const INITIAL_TASKS = [
  { id: 1, title: 'Set up project structure', status: 'Completed', priority: 'High' },
  { id: 2, title: 'Connect Jira and GitHub', status: 'In Progress', priority: 'High' },
  { id: 3, title: 'Create reusable AI skill', status: 'Pending', priority: 'Medium' },
  { id: 4, title: 'Add automated tests', status: 'Pending', priority: 'Medium' },
]

export function validateTaskTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Enter a task title before adding a task.'
  }

  return ''
}

export function createTask(tasks, title) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }

  const validationMessage = validateTaskTitle(title)
  if (validationMessage) {
    throw new TypeError(validationMessage)
  }

  const nextId = tasks.reduce((maximum, task) => (
    Number.isSafeInteger(task.id) ? Math.max(maximum, task.id) : maximum
  ), 0) + 1

  return [
    ...tasks,
    {
      id: nextId,
      title: title.trim(),
      status: 'Pending',
      priority: 'Medium',
    },
  ]
}

export function updateTaskTitle(tasks, id, title) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }

  const validationMessage = validateTaskTitle(title)
  if (validationMessage) {
    throw new TypeError(validationMessage)
  }

  return tasks.map(task => (
    task.id === id ? { ...task, title: title.trim() } : task
  ))
}

export function deleteTask(tasks, id) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }

  return tasks.filter(task => task.id !== id)
}

export function filterTasks(tasks, filter, query = '') {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }
  if (!TASK_FILTERS.includes(filter)) {
    throw new RangeError(`Unknown task filter: ${filter}`)
  }

  const normalizedQuery = query.trim().toLowerCase()

  return tasks.filter(task => (
    (filter === 'All' || task.status === filter)
    && task.title.toLowerCase().includes(normalizedQuery)
  ))
}

export function cycleTaskStatus(tasks, id) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }

  return tasks.map(task => {
    if (task.id !== id) return task

    const statusIndex = TASK_STATUSES.indexOf(task.status)
    if (statusIndex === -1) {
      throw new RangeError(`Unknown task status: ${task.status}`)
    }

    return { ...task, status: TASK_STATUSES[(statusIndex + 1) % TASK_STATUSES.length] }
  })
}

export function getTaskStats(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }

  const total = tasks.length
  const pending = tasks.filter(task => task.status === 'Pending').length
  const inProgress = tasks.filter(task => task.status === 'In Progress').length
  const completed = tasks.filter(task => task.status === 'Completed').length

  return {
    total,
    pending,
    inProgress,
    completed,
    completion: total ? Math.round((completed / total) * 100) : 0,
  }
}

export function getTaskAnalytics(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array.')
  }

  const stats = getTaskStats(tasks)
  const priorities = ['High', 'Medium', 'Low']
  const statusBreakdown = TASK_STATUSES.map(status => {
    const count = tasks.filter(task => task.status === status).length
    return {
      status,
      count,
      percentage: stats.total ? Math.round((count / stats.total) * 100) : 0,
    }
  })
  const priorityBreakdown = priorities.map(priority => {
    const count = tasks.filter(task => task.priority === priority).length
    return {
      priority,
      count,
      percentage: stats.total ? Math.round((count / stats.total) * 100) : 0,
    }
  })

  return {
    ...stats,
    active: stats.inProgress,
    remaining: stats.pending + stats.inProgress,
    statusBreakdown,
    priorityBreakdown,
  }
}
