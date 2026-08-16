/**
 * dsh-theme-machine — browser half (Person-of-Interest / THE MACHINE skin).
 *
 * This file is the body of the closure-factory client bundle: scripts/build.mjs
 * wraps it with the window.__ModuleLoader__.load({ id, factory }) handoff and
 * defines __MACHINE_CSS__ (the inlined skin.css). It runs inside the dsh web shell's
 * frozen module table, so the only permitted require() targets are platform
 * modules — here just 'react'. Everything else arrives through cordis services.
 *
 * Three contributions, all unloaded cleanly by ctx.effect:
 *   1. a theme token override layer (ctx.theme.overrideTokens) — the palette;
 *   2. HUD chrome — skin.css <style data-plugin> plus grid/scanline divs;
 *   3. a shell.overlay telemetry panel fed by the live session snapshot and
 *      the token-meter projections (useSession / useProjection standard hooks).
 */
const React = require('react')

const SOURCE = 'dsh-theme-machine'

/* ---------- 1. THE MACHINE palette --------------------------------------
 * Dark-only skin: both palette modes receive the same values so the
 * surveillance-terminal look survives the user's light/dark preference. */
const CY = '#dce5ea'      /* machine white (bluish-grey), the show's only "data" color */
const CY_HI = '#ffffff'
const RED = '#e5484d'     /* the show's alert brick-red */
const GREEN = '#8fb59d'   /* desaturated — POI uses white for normal states */
const AMBER = '#d9a406'

const both = (value) => ({ light: value, dark: value })

const TOKENS = {
  // surfaces — deep blue-black
  '--dsw-alias-bg-base': both('#05080c'),
  '--dsw-alias-bg-layer-1': both('#080d13'),
  '--dsw-alias-bg-layer-2': both('#0c141c'),
  '--dsw-alias-bg-layer-3': both('#101a24'),
  '--dsw-alias-bg-overlay': both('#0c141c'),
  '--dsw-alias-bg-module-platform': both('#0c141c'),
  '--dsw-alias-bg-multi-select': both('#0c141c'),
  '--dsw-alias-bg-skeleton': both('rgba(220, 229, 236, .06)'),
  // borders — cold steel
  '--dsw-alias-border-l1': both('#16222e'),
  '--dsw-alias-border-l2': both('#1e2c3a'),
  '--dsw-alias-border-l3': both('#26374a'),
  '--dsw-alias-border-l4': both('#2f4459'),
  // brand — machine cyan
  '--dsw-alias-brand-primary': both(CY),
  '--dsw-alias-brand-text': both(CY),
  '--dsw-alias-brand-primary-invert': both('#03110f'),
  '--dsw-alias-button-primary-fill': both(CY),
  '--dsw-alias-button-primary-hover': both(CY_HI),
  // elevated buttons pair with label-primary ink (light in this skin), so
  // the plate must be a dark surface — stock keeps it near-white
  '--dsw-alias-button-elevated-fill': both('#101a24'),
  '--dsw-alias-button-floating-hover': both('#18242f'),
  // send/stop circle (InputBar .primary): white glyph, so the plate must be
  // dark. Steel-cyan — cold, on-palette, reads like the machine's "lock on".
  '--dsw-alias-button-info-fill': both('#2f7d95'),
  '--dsw-alias-button-info-hover': both('#3c93ad'),
  '--dsw-alias-label-primary-foreground': both('#03110f'),
  // text
  '--dsw-alias-label-primary': both('#d7e3ec'),
  // knocked-out text on light plates (e.g. the HARNESS badge — its plate is
  // currentColor, which this skin renders light in both palette modes)
  '--dsw-alias-label-primary-inverted': both('#0b0f14'),
  '--dsw-alias-label-secondary': both('#7d93a6'),
  '--dsw-alias-label-tertiary': both('#4a5f72'),
  '--dsw-alias-label-caption': both('#3a4a5a'),
  '--dsw-alias-label-primary-bluish': both('#d7e3ec'),
  '--dsw-alias-label-primary-dimmed': both('#b9c6d2'),
  // interaction tints
  '--dsw-alias-interactive-bg-hover': both('rgba(220, 229, 236, .07)'),
  '--dsw-alias-interactive-bg-active': both('rgba(220, 229, 236, .13)'),
  '--dsw-alias-interactive-bg-hover-accent': both('rgba(220, 229, 236, .15)'),
  '--dsw-alias-interactive-bg-hover-solid': both('#0f1a24'),
  '--dsw-alias-interactive-bg-hover-danger': both('rgba(255, 77, 94, .1)'),
  // state — threat red / asset green / trace amber
  '--dsw-alias-state-error-primary': both(RED),
  '--dsw-alias-state-error-secondary': both('#ff7a86'),
  '--dsw-alias-state-error-tertiary': both('rgba(229, 72, 77, .16)'),
  '--dsw-alias-state-success-primary': both(GREEN),
  '--dsw-alias-state-success-secondary': both('#a8c9b3'),
  '--dsw-alias-state-success-tertiary': both('rgba(143, 181, 157, .16)'),
  '--dsw-alias-state-warn-primary': both(AMBER),
  '--dsw-alias-state-warn-secondary': both('#e8bc45'),
  '--dsw-alias-state-warn-tertiary': both('rgba(217, 166, 6, .18)'),
  '--dsw-alias-state-business-primary': both(CY),
  '--dsw-alias-state-business-secondary': both('#9fb0bd'),
  '--dsw-alias-state-business-tertiary': both('rgba(220, 229, 236, .1)'),
  // chrome
  '--dsw-specific-sidebar-fill': both('#080d13'),
  '--dsw-specific-sidebar-nav-item-active': both('rgba(220, 229, 236, .1)'),
  '--dsw-specific-sidebar-nav-item-active-accent': both('rgba(220, 229, 236, .18)'),
  '--dsw-specific-sidebar-nav-item-hover': both('#0c141c'),
  '--dsw-specific-bubble': both('#0c141c'),
  '--dsw-specific-bubble-highlight': both('rgba(220, 229, 236, .12)'),
  '--dsw-specific-input-major': both('#0c141c'),
  '--dsw-specific-selector': both('#0f1a24'),
  '--dsw-specific-tip': both('#0f1a24'),
  '--dsw-alias-tooltip-bg': both('#0f1a24'),
  '--dsw-alias-toast-bg': both('#0f1a24'),
  // markdown surface
  '--dsw-alias-markdown-code-block': both('#080d13'),
  '--dsw-alias-markdown-code-block-banner': both('#0a1118'),
  '--dsw-alias-markdown-inline-code': both('#0c141c'),
  '--dsw-alias-markdown-citation': both('#0f1a24'),
  '--dsw-alias-markdown-tag': both('#0f1a24'),
  '--dsw-alias-markdown-placeholder': both('#0c141c'),
  // scrollbars
  '--dsw-alias-scrollbar-bg-l1': both('#1c2a38'),
  '--dsw-alias-scrollbar-bg-l2': both('#1c2a38'),
  '--dsw-alias-scrollbar-hover-l1': both('#2a3c4e'),
  '--dsw-alias-scrollbar-hover-l2': both('#2a3c4e'),
}

/* ---------- 2. HUD chrome ----------------------------------------------- */

function injectChrome(ctx) {
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = SOURCE
    tag.dataset.pluginCss = `${SOURCE}/skin.css`
    tag.textContent = __MACHINE_CSS__
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'machine: skin stylesheet')

  ctx.effect(() => {
    const grid = document.createElement('div')
    grid.className = 'dsh-machine-grid'
    grid.dataset.plugin = SOURCE
    const scan = document.createElement('div')
    scan.className = 'dsh-machine-scanline'
    scan.dataset.plugin = SOURCE
    document.body.append(grid, scan)
    return () => { grid.remove(); scan.remove() }
  }, 'machine: atmosphere layers')
}

/* ---------- 3. Telemetry panel ------------------------------------------ */

const h = React.createElement

function formatTokens(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(Math.round(n))
}

function pad2(n) { return String(n).padStart(2, '0') }
function hhmmss(ms) {
  const d = new Date(ms)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/** Fold conversation nodes into tool-call telemetry. */
function deriveTelemetry(snap) {
  const events = []
  let ok = 0
  let err = 0
  for (const node of snap.nodes) {
    if (node.kind === 'tool-result') {
      const name = node.call ? node.call.name : node.callId
      const dur = node.callTime !== null ? Math.max(0, node.time - node.callTime) : null
      if (node.isError) err += 1; else ok += 1
      events.push({ time: node.time, name, isError: node.isError, durationMs: dur, running: false })
    }
  }
  for (const call of snap.runningCalls) {
    events.push({ time: call.time ?? Date.now(), name: call.name ?? 'tool', isError: false, durationMs: null, running: true })
  }
  events.sort((a, b) => a.time - b.time)
  const settled = ok + err
  return {
    running: snap.running,
    successPct: settled === 0 ? null : Math.round((ok / settled) * 100),
    riskPct: settled === 0 ? null : Math.round((err / settled) * 100),
    counts: { ok, err, active: snap.runningCalls.length },
    events: events.slice(-9).reverse(),
  }
}

/** Latest decode throughput (tok/s) over assistant nodes carrying both legs. */
function deriveThroughput(snap) {
  let decodeMs = 0
  let output = 0
  for (const node of snap.nodes) {
    if (node.kind !== 'assistant' || node.usage == null || node.timing == null) continue
    const t = node.timing
    if (t.firstTokenTime === null) continue
    const tokens = typeof node.usage.outputTokens === 'number' ? node.usage.outputTokens : null
    if (tokens === null) continue
    decodeMs += Math.max(0, t.completedTime - t.firstTokenTime)
    output += tokens
  }
  return decodeMs > 0 && output > 0 ? output / (decodeMs / 1000) : null
}

/** Tick step ladder for the session tape: densest step keeping ≤48 minor ticks. */
const TAPE_STEPS = [10e3, 30e3, 60e3, 3e5, 6e5, 18e5, 36e5]

function tapeStep(span) {
  for (const s of TAPE_STEPS) if (span / s <= 48) return s
  return 72e5
}

/**
 * SESSION TAPE — the show's archival-playback ruler, fed by the live log:
 * minor ticks on a time grid, tall ticks per turn (turnTimings), red ticks
 * per failed tool call, a dashed playback frame over the latest turn, and a
 * REC playhead pinned at now.
 */
function SessionTape(props) {
  const snap = props.snap
  const nodes = snap.nodes
  if (nodes.length === 0) return null
  const t0 = nodes[0].time
  const now = Date.now()
  const span = Math.max(now - t0, 60000)
  const step = tapeStep(span)
  const pct = (t) => Math.min(100, Math.max(0, ((t - t0) / span) * 100))

  const marks = []
  for (let t = Math.ceil(t0 / step) * step, i = 0; t <= now; t += step, i += 1) {
    const labeled = t % (step * 5) === 0
    marks.push(h('i', { key: `m${i}`, className: labeled ? 'tick lab' : 'tick', style: { left: `${pct(t)}%` } }))
  }
  const turns = [...snap.turnTimings.values()]
  turns.forEach((timing, i) => {
    marks.push(h('i', { key: `n${i}`, className: 'tick turn', style: { left: `${pct(timing.startTime)}%` } }))
  })
  nodes.forEach((n, i) => {
    if (n.kind === 'tool-result' && n.isError) {
      marks.push(h('i', { key: `e${i}`, className: 'tick err', style: { left: `${pct(n.time)}%` } }))
    }
  })
  if (turns.length > 0) {
    const last = turns[turns.length - 1]
    const end = last.endTime ?? now
    marks.push(h('i', {
      key: 'frame', className: 'frame',
      style: { left: `${pct(last.startTime)}%`, width: `${Math.max(1.5, ((end - last.startTime) / span) * 100)}%` },
    }))
  }
  marks.push(h('i', { key: 'play', className: props.running ? 'play rec' : 'play' }))

  return h('div', { className: 'dsh-machine-tape' },
    h('div', { className: 'dsh-machine-tape-ruler' }, marks),
    h('div', { className: 'dsh-machine-tape-labels' },
      h('span', null, hhmmss(t0).slice(0, 5)),
      h('span', null, hhmmss(t0 + span / 2).slice(0, 5)),
      h('span', null, hhmmss(t0 + span).slice(0, 5)),
    ),
  )
}

/* Data-driven radar: ring arc = context %, sweep speed = tok/s, blips = running tools. */
const RADAR_R = 24
const RADAR_C = 2 * Math.PI * RADAR_R
function Radar({ pct, tps, running, active }) {
  const ms = running ? Math.max(1.8, Math.min(8, 220 / Math.max(tps ?? 8, 8))) : 0
  const sweepStyle = running
    ? { transformOrigin: '28px 28px', animation: `dsh-machine-sweep ${ms}s linear infinite` }
    : undefined
  const c = Math.max(0, Math.min(100, pct ?? 0))
  const blips = []
  for (let i = 0; i < Math.min(Math.max(active, 0), 3); i += 1) {
    blips.push(h('circle', { key: i, cx: 15 + i * 13, cy: 11 + i * 8, r: 2, className: 'blip' }))
  }
  return h('svg', { viewBox: '0 0 56 56', width: 56, height: 56, className: 'dsh-machine-radar' },
    h('circle', { cx: 28, cy: 28, r: RADAR_R, className: 'ring' }),
    h('circle', { cx: 28, cy: 28, r: 13, className: 'ring' }),
    h('line', { x1: 28, y1: 4, x2: 28, y2: 52, className: 'ring' }),
    h('line', { x1: 4, y1: 28, x2: 52, y2: 28, className: 'ring' }),
    h('circle', {
      cx: 28, cy: 28, r: RADAR_R, className: 'ring-fill',
      strokeDasharray: `${(c / 100) * RADAR_C} ${RADAR_C}`,
      transform: 'rotate(-90 28 28)',
    }),
    h('g', { style: sweepStyle }, h('path', { d: `M28 28 L28 ${28 - RADAR_R} A ${RADAR_R} ${RADAR_R} 0 0 1 47 12 Z`, className: 'sweep' })),
    blips,
  )
}

function Bar(props) {
  return h('div', { className: 'dsh-machine-prob-row', title: props.title },
    h('span', { className: 'lab' }, props.label),
    h('span', { className: 'bar' }, h('i', { className: props.tone, style: { width: `${props.pct}%` } })),
    h('span', { className: 'val' }, `${props.pct}%`),
  )
}

/** Session-scoped seat: receives useSession / useProjection standard hooks. */
function TelemetrySeat(props) {
  const open = props.open
  const onToggle = props.onToggle
  const snap = props.useSession((s) => s)
  const pressure = props.useProjection('contextPressure')
  const usage = props.useProjection('tokenUsage')

  const tele = React.useMemo(() => deriveTelemetry(snap), [snap])
  const tps = React.useMemo(() => deriveThroughput(snap), [snap])
  // Keep the tape's playhead honest while the session idles between emits.
  const [, beat] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => {
    const id = setInterval(beat, 30000)
    return () => { clearInterval(id) }
  }, [])

  const ctxPct = pressure != null
    && typeof pressure.projectedTokens === 'number'
    && typeof pressure.contextWindow === 'number'
    && pressure.contextWindow > 0
    ? Math.min(100, Math.round((pressure.projectedTokens / pressure.contextWindow) * 100))
    : null

  if (!open) {
    return h('button', {
      className: `dsh-machine-pill${tele.running ? ' running' : ''}`,
      onClick: onToggle,
      title: 'dsh-theme-machine telemetry',
    }, h('span', { className: 'live' }), tele.running ? 'MACHINE · ACTIVE' : 'MACHINE LINK')
  }

  const stream = tele.events.length === 0
    ? h('div', { className: 'empty' }, 'AWAITING SIGNAL…')
    : tele.events.map((ev, i) => h('div', { key: `${ev.time}-${i}` },
        h('span', { className: 't' }, `${hhmmss(ev.time)} `),
        `${ev.name} → `,
        ev.running
          ? h('span', { className: 'run' }, 'RUNNING…')
          : ev.isError
            ? h('span', { className: 'err' }, 'ERROR')
            : h('span', { className: 'ok' }, `OK${ev.durationMs !== null ? ` ${(ev.durationMs / 1000).toFixed(2)}s` : ''}`),
      ))

  return h('div', { className: `dsh-machine-panel${tele.running ? ' running' : ''}` },
    h('div', { className: 'dsh-machine-panel-head' },
      h('span', null, 'TARGET ANALYSIS'),
      h('button', { onClick: onToggle, title: 'collapse' }, '—'),
    ),
    h('div', { className: 'dsh-machine-panel-body' },
      h('div', { className: 'dsh-machine-radar-row' },
        h(Radar, { pct: ctxPct, tps, running: tele.running, active: tele.counts.active }),
        h('div', { className: 'dsh-machine-agent-state' },
          h('div', null, 'AGENT ', h('b', null, tele.running ? 'ACTIVE' : 'IDLE')),
          h('div', null, `TOOLS ${tele.counts.ok + tele.counts.err} SETTLED · ${tele.counts.active} RUNNING`),
          usage && typeof usage.outputTokens === 'number'
            ? h('div', null, `OUTPUT ${formatTokens(usage.outputTokens)} TOK`)
            : null,
        ),
      ),
      h('dl', { className: 'dsh-machine-kv' },
        h('dt', null, 'SESSION'),
        h('dd', null, String(props.sessionId).slice(0, 18)),
        tps !== null ? h('dt', null, 'THROUGHPUT') : null,
        tps !== null ? h('dd', null, `${tps.toFixed(1)} tok/s`) : null,
      ),
      tele.successPct !== null
        ? h(Bar, { label: 'SUCCESS', pct: tele.successPct, tone: '', title: 'settled tool calls without error' })
        : null,
      tele.riskPct !== null
        ? h(Bar, { label: 'RISK', pct: tele.riskPct, tone: 'r', title: 'tool calls returned isError' })
        : null,
      ctxPct !== null
        ? h(Bar, {
            label: 'CONTEXT', pct: ctxPct, tone: 'g',
            title: `context pressure ~${formatTokens(pressure.projectedTokens)} / ${formatTokens(pressure.contextWindow)}`,
          })
        : null,
      h(SessionTape, { snap, running: tele.running }),
      h('div', { className: 'dsh-machine-stream' }, stream),
    ),
  )
}

/** Root overlay entry: owns the collapsed state, renders the session seat. */
function TelemetryHost(props) {
  const [open, setOpen] = React.useState(false)
  const toggle = React.useCallback(() => { setOpen((v) => !v) }, [])
  return h('div', { className: `dsh-machine-overlay${open ? ' open' : ''}` },
    props.renderSlot('machine.telemetry', { open, onToggle: toggle }),
  )
}

function registerTelemetry(ctx) {
  ctx.effect(() => ctx.slots.register({
    name: 'shell.overlay',
    id: 'machine.telemetry',
    order: 90,
    children: {
      'machine.telemetry': { kind: 'single', scope: 'session' },
    },
  }, TelemetryHost), 'machine: overlay seat')

  ctx.effect(() => ctx.slots.register({
    name: 'machine.telemetry',
    id: 'machine.panel',
  }, TelemetrySeat), 'machine: telemetry panel')
}

/* ---------- 4. Moving reticle tracker ------------------------------------- */

const RETICLE_TRACKS = [
  { selector: '[role="treeitem"][aria-selected="true"]', threat: () => false },
  {
    selector: 'tr[data-trajectory-row-key][aria-selected="true"]',
    threat: (el) => el.getAttribute('data-error') === 'true',
  },
  {
    selector: '[data-timeline-span][data-current]',
    threat: (el) => el.getAttribute('data-error') === 'true',
  },
]

/**
 * The machine's crosshair: one floating reticle per tracked selection. When
 * the selection moves, the reticle GLIDES to the newly selected row via CSS
 * transitions instead of blinking out and in — target tracking, not target
 * switching. Positions re-sync on attribute mutations, scroll, resize, plus
 * a slow interval as a safety net for virtualized lists.
 */
function startReticleTracker(ctx) {
  ctx.effect(() => {
    const tracks = RETICLE_TRACKS.map((track) => {
      const el = document.createElement('div')
      el.className = 'dsh-machine-reticle'
      el.dataset.plugin = SOURCE
      el.hidden = true
      document.body.appendChild(el)
      return { ...track, el, target: null }
    })
    const sync = () => {
      for (const track of tracks) {
        const next = document.querySelector(track.selector)
        if (next !== null) track.target = next
        else if (track.target !== null && !track.target.isConnected) track.target = null
        const el = track.el
        if (track.target === null) { el.hidden = true; continue }
        const r = track.target.getBoundingClientRect()
        if (r.width < 4 || r.height < 4) { el.hidden = true; continue }
        el.hidden = false
        el.classList.add('locked')
        el.classList.toggle('threat', track.threat(track.target))
        el.style.top = `${r.top - 1}px`
        el.style.left = `${r.left - 1}px`
        el.style.width = `${r.width + 2}px`
        el.style.height = `${r.height + 2}px`
      }
    }
    let raf = 0
    const schedule = () => {
      if (raf !== 0) return
      raf = requestAnimationFrame(() => { raf = 0; sync() })
    }
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected', 'data-error', 'data-current'],
    })
    window.addEventListener('resize', schedule)
    document.addEventListener('scroll', schedule, true)
    const id = setInterval(sync, 500)
    sync()
    return () => {
      mo.disconnect()
      clearInterval(id)
      if (raf !== 0) cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('scroll', schedule, true)
      for (const track of tracks) track.el.remove()
    }
  }, 'machine: reticle tracker')
}

/* ---------- plugin body -------------------------------------------------- */

function apply(ctx) {
  ctx.effect(() => ctx.theme.overrideTokens(SOURCE, TOKENS), 'machine: token layer')
  injectChrome(ctx)
  registerTelemetry(ctx)
  startReticleTracker(ctx)
}

module.exports = { name: SOURCE, inject: ['theme', 'slots'], apply }
