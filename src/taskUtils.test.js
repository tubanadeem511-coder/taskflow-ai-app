import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createTask,
  cycleTaskStatus,
  deleteTask,
  filterTasks,
  getTaskAnalytics,
  getTaskStats,
  INITIAL_TASKS,
  updateTaskTitle,
  validateTaskTitle,
} from './taskUtils.js'

test('rejects blank and whitespace-only task titles', () => {
  assert.notEqual(validateTaskTitle(''), '')
  assert.notEqual(validateTaskTitle('   '), '')
  assert.throws(() => createTask(INITIAL_TASKS, ''), /title before adding/)
  assert.throws(() => createTask(INITIAL_TASKS, '   '), /title before adding/)
})

test('rejects non-string task titles', () => {
  assert.notEqual(validateTaskTitle(null), '')
  assert.throws(() => createTask(INITIAL_TASKS, null), /title before adding/)
})

test('accepts a valid title and trims it when creating a task', () => {
  assert.equal(validateTaskTitle('Write tests'), '')
  assert.equal(createTask([], '  Write tests  ')[0].title, 'Write tests')
})

test('creates a trimmed pending task with a unique id without mutating tasks', () => {
  const tasks = createTask(INITIAL_TASKS, '  Review release  ')

  assert.equal(tasks.length, INITIAL_TASKS.length + 1)
  assert.deepEqual(tasks.at(-1), {
    id: 5,
    title: 'Review release',
    status: 'Pending',
    priority: 'Medium',
  })
  assert.equal(INITIAL_TASKS.length, 4)
})

test('updates and deletes tasks without mutating the original collection', () => {
  const renamedTasks = updateTaskTitle(INITIAL_TASKS, 2, '  Review integrations  ')
  assert.equal(renamedTasks[1].title, 'Review integrations')
  assert.equal(INITIAL_TASKS[1].title, 'Connect Jira and GitHub')
  assert.throws(() => updateTaskTitle(INITIAL_TASKS, 2, '  '), /title before adding/)

  const remainingTasks = deleteTask(INITIAL_TASKS, 2)
  assert.equal(remainingTasks.length, INITIAL_TASKS.length - 1)
  assert.equal(remainingTasks.some(task => task.id === 2), false)
  assert.equal(INITIAL_TASKS.length, 4)
  assert.throws(() => deleteTask(null, 2), /Tasks must be an array/)
})

test('filters tasks by status and case-insensitive title search', () => {
  assert.deepEqual(
    filterTasks(INITIAL_TASKS, 'Pending').map(task => task.title),
    ['Create reusable AI skill', 'Add automated tests'],
  )
  assert.deepEqual(
    filterTasks(INITIAL_TASKS, 'In Progress').map(task => task.title),
    ['Connect Jira and GitHub'],
  )
  assert.deepEqual(
    filterTasks(INITIAL_TASKS, 'Completed').map(task => task.title),
    ['Set up project structure'],
  )
  assert.deepEqual(
    filterTasks(INITIAL_TASKS, 'All', 'JIRA').map(task => task.title),
    ['Connect Jira and GitHub'],
  )
  assert.deepEqual(
    filterTasks(INITIAL_TASKS, 'In Progress', 'JIRA').map(task => task.title),
    ['Connect Jira and GitHub'],
  )
  assert.equal(filterTasks(INITIAL_TASKS, 'Completed', 'missing').length, 0)
  assert.throws(() => filterTasks(INITIAL_TASKS, 'Unknown'), /Unknown task filter/)
})

test('cycles task status and leaves other tasks unchanged', () => {
  const nextTasks = cycleTaskStatus(INITIAL_TASKS, 3)

  assert.equal(nextTasks[2].status, 'In Progress')
  assert.equal(nextTasks[0], INITIAL_TASKS[0])
  assert.equal(cycleTaskStatus(nextTasks, 3)[2].status, 'Completed')
  assert.equal(cycleTaskStatus(cycleTaskStatus(nextTasks, 3), 3)[2].status, 'Pending')
  assert.throws(
    () => cycleTaskStatus([{ id: 9, title: 'Invalid', status: 'Unknown' }], 9),
    /Unknown task status/,
  )
})

test('calculates task statistics, including the empty-task completion rate', () => {
  assert.deepEqual(getTaskStats(INITIAL_TASKS), {
    total: 4,
    pending: 2,
    inProgress: 1,
    completed: 1,
    completion: 25,
  })
  assert.deepEqual(getTaskStats([]), {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completion: 0,
  })
})

test('calculates analytics breakdowns from current task records', () => {
  assert.deepEqual(getTaskAnalytics(INITIAL_TASKS), {
    total: 4,
    pending: 2,
    inProgress: 1,
    completed: 1,
    completion: 25,
    active: 1,
    remaining: 3,
    statusBreakdown: [
      { status: 'Pending', count: 2, percentage: 50 },
      { status: 'In Progress', count: 1, percentage: 25 },
      { status: 'Completed', count: 1, percentage: 25 },
    ],
    priorityBreakdown: [
      { priority: 'High', count: 2, percentage: 50 },
      { priority: 'Medium', count: 2, percentage: 50 },
      { priority: 'Low', count: 0, percentage: 0 },
    ],
  })
  assert.equal(getTaskAnalytics([]).statusBreakdown.every(item => item.percentage === 0), true)
  assert.throws(() => getTaskAnalytics(null), /Tasks must be an array/)
})

test('reports malformed task collection inputs instead of silently accepting them', () => {
  assert.throws(() => createTask(null, 'Task'), /Tasks must be an array/)
  assert.throws(() => filterTasks(null, 'All'), /Tasks must be an array/)
  assert.throws(() => getTaskStats(null), /Tasks must be an array/)
})
