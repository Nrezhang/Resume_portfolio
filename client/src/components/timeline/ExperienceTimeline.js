import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FiArrowDown, FiArrowDownRight, FiChevronLeft, FiChevronRight, FiMapPin } from 'react-icons/fi';
import SkillTags from '../common/SkillTags';
import TimelineGlobe from './TimelineGlobe';

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

const LOCATION_DATA = {
  treasury: { lat: 38.9072, lon: -77.0369, label: 'Washington, DC', countryCodes: ['US'], pins: [{ lat: 38.9072, lon: -77.0369 }] },
  trianz: { lat: 38.9696, lon: -77.3861, label: 'Herndon, Virginia', countryCodes: ['US'], pins: [{ lat: 38.9696, lon: -77.3861 }] },
  medidata: { lat: 40.7128, lon: -74.006, label: 'New York City', countryCodes: ['US'], pins: [{ lat: 40.7128, lon: -74.006 }] },
  microsoft: { lat: 31.2304, lon: 121.4737, label: 'Shanghai, China', countryCodes: ['CN'], pins: [{ lat: 31.2304, lon: 121.4737 }] },
  jika: { lat: 32.0853, lon: 34.7818, label: 'Tel Aviv, Israel', countryCodes: ['IL'], pins: [{ lat: 32.0853, lon: 34.7818 }] },
  'nyu-shanghai': {
    lat: 31.2304,
    lon: 121.4737,
    label: 'Shanghai + New York City',
    countryCodes: ['CN', 'US'],
    pins: [{ lat: 31.2304, lon: 121.4737 }, { lat: 40.7128, lon: -74.006 }],
  },
  tamid: { lat: 31.2304, lon: 121.4737, label: 'Shanghai, China', countryCodes: ['CN'], pins: [{ lat: 31.2304, lon: 121.4737 }] },
  'tech-trek': { lat: 40.7128, lon: -74.006, label: 'New York City', countryCodes: ['US'], pins: [{ lat: 40.7128, lon: -74.006 }] },
  tjhsst: { lat: 38.8048, lon: -77.0469, label: 'Alexandria, Virginia', countryCodes: ['US'], pins: [{ lat: 38.8048, lon: -77.0469 }] },
};

function parseDate(value, fallbackMonth = 0) {
  const normalized = value.trim().toLowerCase();
  const year = Number(normalized.match(/\b(19|20)\d{2}\b/)?.[0]);
  const monthName = Object.keys(MONTHS).find((month) => normalized.includes(month));
  return new Date(year || 2021, monthName ? MONTHS[monthName] : fallbackMonth, 1);
}

function parsePeriod(period) {
  const parts = period.split(/\s+[–-]\s+/);
  if (/graduated/i.test(period)) {
    const date = parseDate(period, 4);
    return { start: date, end: new Date(date.getFullYear(), date.getMonth() + 1, 1), milestone: true };
  }
  const start = parseDate(parts[0]);
  const end = !parts[1] || /present/i.test(parts[1]) ? new Date() : parseDate(parts[1], 11);
  return { start, end, milestone: false };
}

export function buildTimeline(experience, education) {
  const work = experience.map((item) => ({
    ...item,
    ...parsePeriod(item.period),
    kind: 'work',
    current: /present/i.test(item.period),
    title: item.role,
    organization: item.company,
    locationLabel: item.location,
    entryId: `work-entry-${item.id}`,
    locationData: LOCATION_DATA[item.id] || { lat: 20, lon: 0, label: item.location, pins: [] },
  }));
  const schools = education.filter((item) => item.id === 'nyu-shanghai' || item.brand === 'nyu').map((item) => ({
    ...item,
    ...parsePeriod(item.period),
    kind: 'education',
    title: item.degree,
    organization: item.school,
    locationLabel: item.locations,
    skills: item.coursework,
    entryId: `education-entry-${item.id}`,
    locationData: LOCATION_DATA[item.id] || { lat: 20, lon: 0, label: item.locations, pins: [] },
  }));
  const leadership = education.flatMap((school) => (school.leadership || []).map((item) => ({
    ...item,
    ...parsePeriod(item.period),
    kind: 'leadership',
    title: item.role,
    organization: item.company,
    locationLabel: item.location,
    parentEducationId: school.id,
    entryId: `leadership-entry-${item.id}`,
    locationData: LOCATION_DATA[item.id] || { lat: 20, lon: 0, label: item.location, pins: [] },
  })));
  const educationEvents = schools.flatMap((school) => {
    const startEvent = {
      ...school,
      id: `${school.id}-start`,
      start: school.start,
      end: new Date(school.start.getFullYear(), school.start.getMonth() + 1, 1),
      milestone: true,
      eventType: 'start',
      title: 'Started at NYU Shanghai',
      period: school.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      description: `Began ${school.degree}, starting a four-year education spanning Shanghai and New York City.`,
      locationData: { lat: 31.2304, lon: 121.4737, label: 'Shanghai, China', countryCodes: ['CN'], pins: [{ lat: 31.2304, lon: 121.4737 }] },
    };
    const graduationEvent = {
      ...school,
      id: `${school.id}-graduation`,
      start: school.end,
      end: new Date(school.end.getFullYear(), school.end.getMonth() + 1, 1),
      milestone: true,
      eventType: 'graduation',
      title: 'Graduated from NYU Shanghai',
      period: school.end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      description: `Completed ${school.degree} after studying across Shanghai and New York City.`,
      locationData: { lat: 31.2304, lon: 121.4737, label: 'Shanghai, China', countryCodes: ['CN'], pins: [{ lat: 31.2304, lon: 121.4737 }] },
    };
    school.navigationEvents = [startEvent, graduationEvent];
    return [startEvent, graduationEvent];
  });

  const graphItems = [...work, ...leadership, ...schools]
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const kindOrder = { education: 0, leadership: 1, work: 2 };
  const items = [...work, ...leadership, ...educationEvents]
    .sort((a, b) => b.start - a.start || b.end - a.end || kindOrder[a.kind] - kindOrder[b.kind]);
  return { items, graphItems };
}

export function GitBranchIndex({ items, graphItems, keyboardItems = items, activeItem, contextIds = [], onSelect, reduceMotion }) {
  const containerRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const lastSelectionRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const selectionInset = 32;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => setViewportHeight(container.clientHeight);
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(container);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const geometry = useMemo(() => {
    // A constant month scale preserves durations and overlaps; the viewport scrolls.
    const rowHeight = 56;
    const monthIndex = (date) => date.getFullYear() * 12 + date.getMonth();
    const latestMonth = Math.max(...graphItems.map((branch) => monthIndex(branch.end)));
    const dateY = (date) => 32 + (latestMonth - monthIndex(date)) * 36;
    // Keep touching intervals in separate lanes too, so a merge cannot be
    // mistaken for the next role continuing down the same branch.
    const lanes = [];
    const branches = [...graphItems].sort((a, b) => a.start - b.start || b.end - a.end).map((branch) => {
      let lane = branch.kind === 'education' ? 0 : branch.kind === 'leadership' ? 1 : 2;
      while (lanes[lane] >= monthIndex(branch.start)) lane += 1;
      lanes[lane] = monthIndex(branch.end);
      const startY = dateY(branch.start), endY = dateY(branch.end);
      const handoff = graphItems.some((other) => other.id !== branch.id && !other.current && monthIndex(other.end) === monthIndex(branch.start));
      // Separate the merge and fork ports within a shared month, not the dates.
      const forkY = startY - (handoff ? 16 : 0);
      return { ...branch, lane, startY, endY, forkY, nodeY: forkY - 18 };
    });
    // Labels are collision-free even when two roles start in the same month.
    // Their dates and branch endpoints remain on the shared month scale.
    const rows = items.map((item) => ({
      key: item.id, item, date: item.start, phase: item.eventType || 'role',
      branch: branches.find((branch) => branch.id === item.id || branch.navigationEvents?.some((event) => event.id === item.id)),
    }));
    rows.forEach((row, index) => {
      const anchorY = row.phase === 'graduation' ? row.branch.endY : row.branch.nodeY;
      row.y = Math.max(anchorY, index ? rows[index - 1].y + rowHeight : rowHeight / 2);
    });
    const height = Math.max(...branches.map((branch) => branch.startY), ...rows.map((row) => row.y + rowHeight / 2)) + 36;
    const laneCount = Math.max(3, ...branches.map((branch) => branch.lane + 1));
    const laneX = (lane) => 24 + lane * (40 / Math.max(2, laneCount - 1));
    return { rows, branches, rowHeight, height, laneX };
  }, [graphItems, items]);
  const selectedRow = geometry.rows.find((row) => row.item.id === activeItem.id);
  // Leave enough trailing room to align even the final chapter near the top.
  const lastRow = geometry.rows[geometry.rows.length - 1];
  const scrollHeight = Math.max(geometry.height, (lastRow?.y || 0) - geometry.rowHeight / 2 + viewportHeight - selectionInset);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedRow) return;
    const changed = lastSelectionRef.current !== null && lastSelectionRef.current !== selectedRow.key;
    lastSelectionRef.current = selectedRow.key;
    const top = Math.max(0, selectedRow.y - geometry.rowHeight / 2 - selectionInset);
    // Animate the scroll position itself: native smooth scrolling has a
    // browser-defined duration and can race through long gaps in the history.
    if (changed && !reduceMotion) {
      const animation = animate(container.scrollTop, top, {
        duration: 1.1,
        ease: [0.4, 0, 0.2, 1],
        onUpdate: (value) => { container.scrollTop = value; },
      });
      scrollAnimationRef.current = animation;
      return () => {
        animation.stop();
        scrollAnimationRef.current = null;
      };
    }
    container.scrollTop = top;
  }, [selectedRow, geometry.rowHeight, reduceMotion, viewportHeight]);
  const interruptScroll = () => scrollAnimationRef.current?.stop();
  const handleKeyDown = (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const focusedRow = event.target.closest('[data-timeline-id]');
    if (!focusedRow || !keyboardItems.length) return;
    const buttons = [...event.currentTarget.querySelectorAll('[data-timeline-id]')]
      .filter((button) => keyboardItems.some((item) => item.id === button.dataset.timelineId));
    const focusedIndex = buttons.indexOf(focusedRow);
    // In the reading view, tabbing onto a school row must not change the
    // work-only arrow sequence. Continue from the role currently being read.
    const currentIndex = focusedIndex >= 0 ? focusedIndex : Math.max(0, keyboardItems.findIndex((item) => item.id === activeItem.id));
    event.preventDefault();
    event.stopPropagation();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : Math.max(0, Math.min(buttons.length - 1, currentIndex + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1)));
    buttons[nextIndex].click();
    buttons[nextIndex].focus({ preventScroll: true });
  };
  const names = { 'nyu-shanghai': 'NYU Shanghai', microsoft: 'Microsoft', treasury: 'Treasury', medidata: 'Medidata', trianz: 'Trianz', jika: 'Jika', tamid: 'TAMID', 'tech-trek': 'Tech@NYU' };
  return <nav className="branch-index" aria-label="Career branch index" onKeyDown={handleKeyDown}>
    <div className="branch-index-main"><i aria-hidden="true" /> main <span>Scroll history ↓</span></div>
    <div className="branch-index-chart" ref={containerRef} onWheel={interruptScroll} onTouchStart={interruptScroll} onPointerDown={interruptScroll}>
      <div className="branch-index-chart-inner" style={{ height: scrollHeight }}>
        {geometry.rows.map((row) => {
          const isActive = row.key === selectedRow?.key;
          const eventLabel = row.phase === 'start' ? 'Started' : row.phase === 'graduation' ? 'Graduated' : null;
          const startDate = row.branch.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const endDate = row.branch.current ? 'Present' : row.branch.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          return <button key={row.key} type="button" data-timeline-id={row.item.id} data-event-key={row.key} data-event-date={+row.date}
            className={`branch-event-row branch-index-${row.branch.kind}${isActive ? ' is-active' : ''}`}
            style={{ top: row.y - geometry.rowHeight / 2, height: geometry.rowHeight }} aria-pressed={isActive}
            aria-label={`${row.item.organization}: ${row.item.title}, ${row.item.period}`}
            onClick={() => onSelect(row.item.id)}>
            <span className="branch-event-copy"><span className="branch-event-name">{names[row.branch.id] || row.item.organization}</span><span className="branch-event-meta">{eventLabel}{eventLabel ? <time dateTime={row.date.toISOString()}>{row.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</time> : <span className="branch-role-period">{startDate} – {endDate}</span>}</span></span>
          </button>;
        })}
        <svg className="branch-time-graph" style={{ height: geometry.height }} viewBox={`0 0 72 ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
          <path className="branch-time-trunk" d={`M 8 0 V ${geometry.height}`} />
          {geometry.branches.map((branch) => {
            const x = geometry.laneX(branch.lane);
            const isActive = branch.id === selectedRow?.branch.id;
            const start = branch.forkY, end = branch.endY;
            return <g key={branch.id} data-branch-id={branch.id} data-start={+branch.start} data-end={+branch.end} data-lane={branch.lane} data-start-y={branch.startY} data-end-y={end} className={`branch-time-lane branch-index-${branch.kind}${isActive ? ' is-active' : ''}${contextIds.includes(branch.id) ? ' is-context' : ''}`}>
              <path className="branch-time-path" d={`M 8 ${start} C 8 ${start - 9},${x} ${start - 9},${x} ${branch.nodeY} V ${branch.current ? 12 : end + 18}${branch.current ? '' : ` C ${x} ${end + 9},8 ${end + 9},8 ${end}`}`} />
              <circle cx={x} cy={branch.nodeY} r="3.8" />
              {branch.current
                ? <path className="branch-time-ongoing" d={`M ${x - 4} 18 L ${x} 12 L ${x + 4} 18`} />
                : <path className="branch-time-merge" d={`M 8 ${end - 4} l 4 4 -4 4 -4 -4 Z`} />}
            </g>;
          })}
        </svg>
      </div>
    </div>
  </nav>;
}

export default function ExperienceTimeline({ name, experience, education, toolbar, onReadEntry }) {
  const timeline = useMemo(() => buildTimeline(experience, education), [experience, education]);
  const { items, graphItems } = timeline;
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(items[0]?.id || experience[experience.length - 1]?.id);
  const trackRef = useRef(null);
  const journeyRef = useRef(null);
  const scrollTargetRef = useRef(null);
  const scrollTargetTimerRef = useRef(null);
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const active = items[activeIndex] || items[0];
  const educationItems = graphItems.filter((item) => item.kind === 'education');
  const concurrentEducation = educationItems.filter((item) => active.kind !== 'education' && item.start <= active.end && item.end >= active.start);

  const scrollToIndex = useCallback((index) => {
    const track = trackRef.current;
    const journey = journeyRef.current;
    if (!track || !journey || items.length < 2) return;
    const headerOffset = track.closest('.chat-shell') ? 0 : window.innerWidth <= 760 ? 64 : 72;
    const trackTop = window.scrollY + track.getBoundingClientRect().top;
    const scrollRange = Math.max(1, track.offsetHeight - journey.offsetHeight);
    const targetTop = trackTop - headerOffset + (scrollRange * index) / (items.length - 1);

    scrollTargetRef.current = index;
    window.clearTimeout(scrollTargetTimerRef.current);
    scrollTargetTimerRef.current = window.setTimeout(() => {
      scrollTargetRef.current = null;
    }, reduceMotion ? 80 : 900);
    window.scrollTo({ top: targetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [items.length, reduceMotion]);

  const selectIndex = useCallback((index) => {
    const nextIndex = Math.max(0, Math.min(items.length - 1, index));
    setActiveId(items[nextIndex].id);
    scrollToIndex(nextIndex);
  }, [items, scrollToIndex]);

  const selectItem = useCallback((id) => {
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) selectIndex(index);
  }, [items, selectIndex]);

  const selectRelative = (direction) => {
    selectIndex(activeIndex + direction);
  };

  useEffect(() => {
    let frame = 0;
    const syncToScroll = () => {
      frame = 0;
      const track = trackRef.current;
      const journey = journeyRef.current;
      if (!track || !journey || items.length < 2) return;
      if (!track.offsetHeight || !journey.offsetHeight) return;
      const headerOffset = track.closest('.chat-shell') ? 0 : window.innerWidth <= 760 ? 64 : 72;
      const rect = track.getBoundingClientRect();
      const scrollRange = Math.max(1, track.offsetHeight - journey.offsetHeight);
      const progress = Math.max(0, Math.min(1, (headerOffset - rect.top) / scrollRange));
      const nextIndex = Math.round(progress * (items.length - 1));
      const targetIndex = scrollTargetRef.current;

      if (targetIndex !== null) {
        const targetProgress = targetIndex / (items.length - 1);
        if (Math.abs(progress - targetProgress) > 0.025) return;
        scrollTargetRef.current = null;
      }
      setActiveId((currentId) => currentId === items[nextIndex].id ? currentId : items[nextIndex].id);
    };
    const requestSync = () => {
      if (!frame) frame = window.requestAnimationFrame(syncToScroll);
    };

    syncToScroll();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    return () => {
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(scrollTargetTimerRef.current);
    };
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const journey = journeyRef.current;
      const target = event.target;
      if (target instanceof Element) {
        if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
        // Do not steal arrows from navigation or controls elsewhere on the page.
        if (target !== document.body && target !== document.documentElement && !journey?.contains(target)) return;
      }
      const rect = journey?.getBoundingClientRect();
      if (!rect || rect.bottom < window.innerHeight * 0.35 || rect.top > window.innerHeight * 0.65) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      selectIndex(activeIndex + direction);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, selectIndex]);

  const revealFullEntry = () => {
    if (onReadEntry) { onReadEntry(active); return; }
    document.getElementById(active.entryId)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  if (!active) return null;

  return (
    <div
      className="journey-scroll-track"
      ref={trackRef}
      style={{ '--journey-scroll-distance': `${Math.max(0, items.length - 1) * 42}svh` }}
    >
    <section className="journey journey-open-index" ref={journeyRef} aria-labelledby="experience-heading">
      <div className="journey-progress-track" aria-hidden="true">
        <motion.div className="journey-progress-fill" initial={false}
          animate={{ scaleX: items.length > 1 ? activeIndex / (items.length - 1) : 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <input className="journey-progress" type="range" min="0" max={Math.max(1, items.length - 1)} step="1"
        value={activeIndex} onChange={(event) => selectIndex(Number(event.target.value))}
        aria-label="Experience progress" aria-valuetext={`${active.organization}, ${active.period}`}
        style={{ '--journey-progress': `${items.length > 1 ? activeIndex / (items.length - 1) * 100 : 100}%` }} />
      <div className="journey-globe" aria-hidden="true">
        <TimelineGlobe location={active.locationData} reduceMotion={reduceMotion} />
      </div>
      <div className="journey-topline">
        <div className="experience-index-meta"><span>Experience / {name}</span><span>Portfolio</span></div>
        <div className="journey-index-intro"><h1 id="experience-heading">Experience <FiArrowDownRight aria-hidden="true" /></h1><p>Engineering, product, and the places in between.</p></div>
        <div className="journey-view-choice">{toolbar}</div>
      </div>

      <div className="journey-branch-index">
        <GitBranchIndex items={items} graphItems={graphItems} activeItem={active} contextIds={concurrentEducation.map((item) => item.id)} onSelect={selectItem} reduceMotion={reduceMotion} />
      </div>

      <div className="journey-stage">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.article
            className="journey-card"
            aria-live="polite"
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="journey-card-meta">
              <span className={`journey-type journey-type-${active.kind}`}>{active.kind}</span>
              <span>{active.period}</span>
            </div>
            <p className="journey-card-location"><FiMapPin aria-hidden="true" /> {active.locationLabel}</p>
            <h4>{active.title}</h4>
            <p className="journey-organization">{active.organization}</p>
            {concurrentEducation.length > 0 && (
              <p className="journey-context">Alongside {concurrentEducation.map((item) => item.organization).join(', ')}</p>
            )}
            <p className="journey-summary">{active.description}</p>
          <SkillTags items={(active.skills || []).slice(0, 4)} />
            <button className="journey-details-link" type="button" onClick={revealFullEntry}>Read full entry <FiArrowDown /></button>
          </motion.article>
        </AnimatePresence>

        <div className="journey-controls" aria-label="Timeline navigation">
          <button type="button" onClick={() => selectRelative(-1)} aria-label="Previous chapter" disabled={activeIndex === 0}><FiChevronLeft /></button>
          <span><b>{String(activeIndex + 1).padStart(2, '0')}</b> / {String(items.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => selectRelative(1)} aria-label="Next chapter" disabled={activeIndex === items.length - 1}><FiChevronRight /></button>
        </div>
      </div>
    </section>
    </div>
  );
}
