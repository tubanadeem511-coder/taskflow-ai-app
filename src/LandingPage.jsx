function Brand({ onClick, light = false }) {
  return (
    <button className={`site-brand${light ? ' site-brand-light' : ''}`} type="button" onClick={onClick} aria-label="TaskFlow home">
      <img src={light ? '/taskflow-logo-light.svg' : '/taskflow-logo.svg'} alt="" width="188" height="38" />
    </button>
  )
}

function ProductPreview({ tasks, stats }) {
  const previewTasks = tasks.slice(0, 3)

  return (
    <div className="landing-preview" aria-label="Preview of the TaskFlow task workspace">
      <div className="preview-topbar">
        <div className="preview-window-controls" aria-hidden="true"><i /><i /><i /></div>
        <span>YOUR WORKSPACE</span>
        <span className="preview-live"><i /> Saved locally</span>
      </div>
      <div className="preview-body">
        <div className="preview-heading">
          <div>
            <p>OVERVIEW</p>
            <h2>Good work starts with clarity.</h2>
          </div>
          <span className="preview-date">Workspace snapshot</span>
        </div>
        <div className="preview-metrics">
          <div><span>Open tasks</span><strong>{stats.pending + stats.inProgress}</strong><i>Ready to move forward</i></div>
          <div><span>Completed</span><strong>{stats.completed}</strong><i>{stats.completion}% of your tasks</i></div>
          <div><span>In progress</span><strong>{stats.inProgress}</strong><i>On your plate now</i></div>
        </div>
        <div className="preview-list">
          <div className="preview-list-heading"><strong>Recent tasks</strong><span>Live workspace data</span></div>
          {previewTasks.length ? previewTasks.map(task => (
            <div className="preview-task" key={task.id}>
              <span className={`preview-task-dot ${task.status.toLowerCase().replace(' ', '-')}`} />
              <span>{task.title}</span>
              <i className={`preview-status ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</i>
            </div>
          )) : <p className="preview-no-tasks">Your task list is ready when you are.</p>}
        </div>
      </div>
      <span className="preview-note">Starter tasks are examples. Your workspace is yours to shape.</span>
    </div>
  )
}

export default function LandingPage({ tasks, stats, onOpenApp, onOpenAnalytics }) {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <button type="button" onClick={onOpenAnalytics}>Analytics</button>
        </nav>
        <button className="landing-nav-cta" type="button" onClick={onOpenApp}>Open workspace <span aria-hidden="true">→</span></button>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="hero-copy">
            <p className="landing-eyebrow"><span /> FOCUS ON WHAT MOVES YOU</p>
            <h1>Make room for<br /><em>meaningful progress.</em></h1>
            <p className="hero-description">
              A calmer place to organize your work, see what matters, and keep good ideas moving.
              No clutter. Just your next clear step.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" type="button" onClick={onOpenApp}>Go to your workspace <span aria-hidden="true">→</span></button>
              <a className="hero-secondary" href="#how-it-works"><span className="play-icon" aria-hidden="true">↓</span> See how it works</a>
            </div>
            <p className="hero-reassurance"><span aria-hidden="true">✓</span> Free to use <span className="reassurance-divider">·</span> Saved privately in this browser</p>
          </div>
          <ProductPreview tasks={tasks} stats={stats} />
        </div>
        <div className="hero-bottom-note"><span /> YOUR WORK, IN A BETTER FLOW</div>
      </section>

      <section className="landing-features landing-section" id="features">
        <div className="section-intro">
          <p className="landing-eyebrow">LESS BUSYWORK, MORE MOMENTUM</p>
          <h2>Simple tools for a<br />more focused day.</h2>
          <p>Thoughtful essentials that help you spend less time managing work and more time doing it.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon feature-icon-lavender" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M7 5h10M7 10h10M7 15h6M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </span>
            <h3>A task list that stays clear</h3>
            <p>Add, edit, and complete tasks without losing sight of what comes next. Search and filter when you need to focus.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon feature-icon-green" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8v-6m4 6V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3>Progress you can understand</h3>
            <p>See your current workload and completion at a glance, with analytics calculated directly from your tasks.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon feature-icon-peach" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5 19 6v5.5c0 4.1-2.8 7.5-7 9-4.2-1.5-7-4.9-7-9V6l7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3>Your work stays yours</h3>
            <p>No account or setup required. Tasks stay in your browser’s local storage and are not sent to a server.</p>
          </article>
        </div>
      </section>

      <section className="how-section landing-section" id="how-it-works">
        <div className="how-copy">
          <p className="landing-eyebrow">A GENTLER WORKFLOW</p>
          <h2>From scattered thoughts<br />to steady progress.</h2>
          <p>TaskFlow gives your day enough structure to move forward, while staying simple enough to get out of your way.</p>
          <button className="how-cta" type="button" onClick={onOpenApp}>Open your workspace <span aria-hidden="true">→</span></button>
        </div>
        <div className="steps-list">
          <article className="step-card"><span>01</span><div><h3>Capture what matters</h3><p>Write down the next thing you need to do. Keep the task list focused and easy to scan.</p></div></article>
          <article className="step-card"><span>02</span><div><h3>Move one step at a time</h3><p>Update task status as work changes, and use filters to give your attention a clear direction.</p></div></article>
          <article className="step-card"><span>03</span><div><h3>Notice your progress</h3><p>Check your live task breakdown and completion rate. Your numbers update as your work does.</p></div></article>
        </div>
      </section>

      <section className="landing-final-cta">
        <div><p className="landing-eyebrow">START WHERE YOU ARE</p><h2>Your next step is closer than you think.</h2><p>Open your workspace and make a little progress today.</p></div>
        <button type="button" onClick={onOpenApp}>Go to TaskFlow <span aria-hidden="true">→</span></button>
      </section>

      <footer className="landing-footer">
        <Brand light onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <p>A calmer way to get work done.</p>
        <div><a href="#features">Features</a><a href="#how-it-works">How it works</a><button type="button" onClick={onOpenAnalytics}>Analytics</button></div>
        <small>© {new Date().getFullYear()} TaskFlow. Your work stays in your browser.</small>
      </footer>
    </main>
  )
}
