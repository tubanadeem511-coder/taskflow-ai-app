import { getTaskAnalytics } from './taskUtils.js'

const STATUS_COLORS = {
  Pending: '#a3adbd',
  'In Progress': '#6375e8',
  Completed: '#43a47a',
}

function StatusChart({ breakdown, total }) {
  if (!total) {
    return <div className="analytics-empty-chart"><span>No task data yet</span><p>Add a task to see your workflow breakdown.</p></div>
  }

  return (
    <div className="status-chart">
      <div className="status-chart-bar" role="img" aria-label={breakdown.map(item => `${item.status}: ${item.count}`).join(', ')}>
        {breakdown.map(item => item.count > 0 && (
          <span
            key={item.status}
            style={{ width: `${(item.count / total) * 100}%`, background: STATUS_COLORS[item.status] }}
            title={`${item.status}: ${item.count}`}
          />
        ))}
      </div>
      <div className="status-legend">
        {breakdown.map(item => (
          <div className="legend-row" key={item.status}>
            <span><i style={{ background: STATUS_COLORS[item.status] }} />{item.status}</span>
            <strong>{item.count} <small>{item.percentage}%</small></strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriorityChart({ breakdown, total }) {
  if (!total) {
    return <div className="analytics-empty-chart"><span>No priority data yet</span><p>Task priority categories will appear here.</p></div>
  }

  const priorityClass = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' }
  return (
    <div className="priority-chart">
      {breakdown.map(item => (
        <div className="priority-row" key={item.priority}>
          <div className="priority-row-label"><span>{item.priority} priority</span><strong>{item.count}</strong></div>
          <div
            className="priority-track"
            role="progressbar"
            aria-label={`${item.priority} priority tasks`}
            aria-valuemin="0"
            aria-valuemax={total}
            aria-valuenow={item.count}
          >
            <span className={priorityClass[item.priority]} style={{ width: `${item.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage({ tasks, onOpenApp }) {
  const analytics = getTaskAnalytics(tasks)

  return (
    <div className="page-content analytics-content">
      <section className="welcome analytics-welcome">
        <div>
          <p className="eyebrow">WORKSPACE INSIGHTS</p>
          <h1>Understand your workload.</h1>
          <p className="subtitle">A live snapshot calculated from the tasks in this browser.</p>
        </div>
        <button className="analytics-action" type="button" onClick={onOpenApp}>Manage tasks <span aria-hidden="true">→</span></button>
      </section>

      <div className="analytics-source-note" role="note">
        <span aria-hidden="true">i</span>
        These metrics reflect the current task list only. TaskFlow has no timestamped activity history, so historical trends and date-range comparisons are not available.
      </div>

      <section className="analytics-kpis" aria-label="Current task metrics">
        <article className="analytics-kpi"><span>Total tasks</span><strong>{analytics.total}</strong><small>Current workspace</small></article>
        <article className="analytics-kpi"><span>Completion rate</span><strong>{analytics.completion}<small>%</small></strong><small>Completed ÷ total tasks</small></article>
        <article className="analytics-kpi"><span>In progress</span><strong>{analytics.active}</strong><small>Active right now</small></article>
        <article className="analytics-kpi"><span>Still to do</span><strong>{analytics.remaining}</strong><small>Pending or in progress</small></article>
      </section>

      <section className="analytics-grid">
        <article className="analytics-panel workflow-panel">
          <div className="analytics-panel-heading"><div><h2>Workflow distribution</h2><p>How tasks are currently progressing.</p></div><span className="live-tag"><i /> LIVE</span></div>
          <StatusChart breakdown={analytics.statusBreakdown} total={analytics.total} />
        </article>
        <article className="analytics-panel priority-panel">
          <div className="analytics-panel-heading"><div><h2>Priority mix</h2><p>Current tasks grouped by priority.</p></div></div>
          <PriorityChart breakdown={analytics.priorityBreakdown} total={analytics.total} />
        </article>
      </section>

      <section className="analytics-panel analytics-detail">
        <div className="analytics-panel-heading"><div><h2>Workspace summary</h2><p>Counts are recalculated whenever your task list changes.</p></div></div>
        {analytics.total ? (
          <div className="summary-table-wrap">
            <table className="summary-table">
              <thead><tr><th scope="col">Status</th><th scope="col">Tasks</th><th scope="col">Share</th><th scope="col">Interpretation</th></tr></thead>
              <tbody>
                {analytics.statusBreakdown.map(item => (
                  <tr key={item.status}>
                    <th scope="row"><i style={{ background: STATUS_COLORS[item.status] }} />{item.status}</th>
                    <td>{item.count}</td>
                    <td>{item.percentage}%</td>
                    <td>{item.status === 'Pending' ? 'Not started' : item.status === 'In Progress' ? 'Being worked on' : 'Finished'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="analytics-table-empty"><p>Your summary will appear when you add a task.</p><button className="text-button" type="button" onClick={onOpenApp}>Add your first task →</button></div>
        )}
      </section>
      <p className="analytics-footnote">Private by design: analytics are calculated in your browser and are not transmitted to a server.</p>
    </div>
  )
}
