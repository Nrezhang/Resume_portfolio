import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FiArrowDown, FiChevronLeft, FiChevronRight, FiMapPin } from 'react-icons/fi';
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
  jika: { lat: 18, lon: -25, label: 'Remote', pins: [], remote: true },
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

function buildTimeline(experience, education) {
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
    .sort((a, b) => a.start - b.start || a.end - b.end || kindOrder[a.kind] - kindOrder[b.kind]);
  return { items, graphItems };
}

function branchName(item) {
  const prefixes = { work: 'exp', education: 'edu', leadership: 'lead' };
  const aliases = { microsoft: 'msft', 'nyu-shanghai': 'nyu', treasury: 'treasury', medidata: 'medidata', trianz: 'trianz', jika: 'jika', tamid: 'tamid', 'tech-trek': 'tech-nyu', tjhsst: 'tjhsst' };
  return `${prefixes[item.kind]}/${aliases[item.id] || item.id}`;
}

function GitTimelineGraph({ items, rangeStart, rangeEnd, activeItem, contextIds, onSelect, reduceMotion }) {
  const width = 3000;
  const left = 100;
  const right = 2900;
  const rowGap = 22;
  const mainY = 74;
  const height = 122;
  const span = rangeEnd - rangeStart;
  const years = Array.from(
    { length: rangeEnd.getFullYear() - rangeStart.getFullYear() + 1 },
    (_, index) => rangeStart.getFullYear() + index,
  );
  const toX = (date) => left + Math.max(0, Math.min(1, (date - rangeStart) / span)) * (right - left);
  const arranged = items.map((item) => {
    const branchY = item.kind === 'education'
      ? mainY - rowGap * 2
      : item.kind === 'leadership' ? mainY - rowGap : mainY + rowGap;
    return { ...item, branchY };
  });
  const activeX = toX(activeItem.start);

  return (
    <svg className="git-graph" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="group" aria-label="Henry Zhang career branch history">
      {years.map((year) => {
        const x = toX(new Date(year, 0, 1));
        return (
          <g className="git-year" key={year}>
            <line x1={x} x2={x} y1="22" y2={height - 8} />
            <text x={x} y="16">{year}</text>
            <circle className="git-year-tick" cx={x} cy={mainY} r="2.5" />
          </g>
        );
      })}

      <motion.line
        className="git-selected-line"
        initial={false}
        animate={{ x1: activeX, x2: activeX }}
        y1="25"
        y2={height - 18}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 105, damping: 22 }}
      />
      <line className="git-main-line" x1="0" x2={right} y1={mainY} y2={mainY} />
      <circle className="git-main-origin" cx={left - 18} cy={mainY} r="5" />
      <g className="git-year git-present">
        <title>{`Present: ${rangeEnd.toLocaleDateString('en-US', { dateStyle: 'long' })}`}</title>
        <line x1={right} x2={right} y1="22" y2={height - 8} />
        <text x={right} y="16">Present · {rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</text>
        <circle className="git-main-origin" cx={right} cy={mainY} r="4" />
      </g>

      {arranged.map((item, index) => {
        const startX = toX(item.start);
        const rawEndX = toX(item.end);
        const endX = Math.min(right, Math.max(startX + 96, rawEndX));
        const direction = item.branchY < mainY ? -1 : 1;
        const curve = Math.min(12, (endX - startX) / 4);
        const path = item.current
          ? `M ${startX} ${mainY} C ${startX + curve} ${mainY} ${startX + curve} ${item.branchY} ${startX + curve * 2} ${item.branchY} L ${endX} ${item.branchY}`
          : `M ${startX} ${mainY} C ${startX + curve} ${mainY} ${startX + curve} ${item.branchY} ${startX + curve * 2} ${item.branchY} L ${endX - curve * 2} ${item.branchY} C ${endX - curve} ${item.branchY} ${endX - curve} ${mainY} ${endX} ${mainY}`;
        const isActive = item.id === activeItem.id || item.navigationEvents?.some((event) => event.id === activeItem.id);
        const isContext = contextIds.includes(item.id);
        const stateClass = isActive ? ' is-active' : isContext ? ' is-context' : '';
        const labelX = Math.min(startX + curve * 2 + 5, right - 88);
        const labelY = item.branchY + (direction < 0 ? -7 : 16);
        const labels = { microsoft: 'Microsoft', treasury: 'Treasury', medidata: 'Medidata', trianz: 'Trianz', jika: 'Jika', tamid: 'TAMID', 'tech-trek': 'Tech@NYU' };

        if (item.kind === 'education' && item.navigationEvents?.length === 2) {
          return (
            <g className={`git-branch git-branch-education${stateClass}`} key={item.id}>
              <title>{item.organization} · {item.period}</title>
              <motion.path
                className="git-branch-path"
                d={path}
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isActive || isContext ? 1 : 0.72 }}
                transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.22), ease: [0.22, 1, 0.36, 1] }}
              />
              {item.navigationEvents.map((event, eventIndex) => {
                const eventX = eventIndex === 0 ? startX : endX;
                const eventActive = event.id === activeItem.id;
                return (
                  <g
                    className={`git-education-event${eventActive ? ' is-active' : ''}`}
                    role="button"
                    tabIndex="0"
                    data-timeline-id={event.id}
                    data-timeline-anchor={event.id}
                    aria-label={`${event.title}, ${event.period}`}
                    aria-pressed={eventActive}
                    onClick={() => onSelect(event.id)}
                    onKeyDown={(eventKey) => {
                      if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                        eventKey.preventDefault();
                        onSelect(event.id);
                      }
                    }}
                    key={event.id}
                  >
                    <circle className="git-event-hit" cx={eventX} cy={mainY} r="13" />
                    <circle className={`git-commit ${eventIndex === 0 ? 'git-commit-start' : 'git-commit-merge'}`} cx={eventX} cy={mainY} r={eventActive ? 5 : 3.5} />
                    <text className="git-event-label" x={eventX + (eventIndex === 0 ? 28 : -28)} y={item.branchY - 7} textAnchor={eventIndex === 0 ? 'start' : 'end'}>{eventIndex === 0 ? 'NYU begins' : 'NYU graduation'}</text>
                  </g>
                );
              })}
            </g>
          );
        }

        return (
          <g
            className={`git-branch git-branch-${item.kind}${stateClass}`}
            role="button"
            tabIndex="0"
            data-timeline-id={item.id}
            aria-label={`${branchName(item)}: ${item.organization}, ${item.period}`}
            aria-pressed={isActive}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
            key={item.id}
          >
            <title>{item.organization} · {item.period}</title>
            <motion.path
              className="git-branch-path"
              d={path}
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isActive || isContext ? 1 : 0.58 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.22), ease: [0.22, 1, 0.36, 1] }}
            />
            <circle
              className="git-commit git-commit-start"
              data-timeline-anchor={item.id}
              cx={startX}
              cy={mainY}
              r={isActive ? 5 : 3.5}
            />
            {item.current && <circle className="git-commit git-commit-tip" cx={endX} cy={item.branchY} r="3.5" />}
            {!item.current && <circle className="git-commit git-commit-merge" cx={endX} cy={mainY} r="3" />}
            <text className="git-branch-name" x={labelX} y={labelY}>{labels[item.id] || item.organization}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ExperienceTimeline({ experience, education, toolbar, onReadEntry }) {
  const timeline = useMemo(() => buildTimeline(experience, education), [experience, education]);
  const { items, graphItems } = timeline;
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(items[0]?.id || experience[experience.length - 1]?.id);
  const buttonsRef = useRef(null);
  const trackRef = useRef(null);
  const journeyRef = useRef(null);
  const scrollTargetRef = useRef(null);
  const scrollTargetTimerRef = useRef(null);
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const active = items[activeIndex] || items[0];
  const startYear = Math.min(...items.map((item) => item.start.getFullYear()));
  const rangeStart = new Date(startYear, 0, 1);
  const rangeEnd = useMemo(() => new Date(), []);
  const educationItems = graphItems.filter((item) => item.kind === 'education');
  const concurrentEducation = educationItems.filter((item) => active.kind !== 'education' && item.start <= active.end && item.end >= active.start);

  useEffect(() => {
    const container = buttonsRef.current;
    const target = container?.querySelector(`[data-timeline-anchor="${active.id}"]`);
    if (!container || !target) return;
    const centerActive = () => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetCenter = targetRect.left - containerRect.left + container.scrollLeft + targetRect.width / 2;
      const nextScrollLeft = Math.max(0, targetCenter - container.clientWidth / 2);
      if (typeof container.scrollTo === 'function') container.scrollTo({ left: nextScrollLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      else container.scrollLeft = nextScrollLeft;
    };
    centerActive();
    window.addEventListener('resize', centerActive);
    return () => window.removeEventListener('resize', centerActive);
  }, [active.id, reduceMotion]);

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
      if (event.metaKey || event.ctrlKey || event.altKey || /input|textarea|select/i.test(event.target.tagName)) return;
      const rect = journeyRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < window.innerHeight * 0.35 || rect.top > window.innerHeight * 0.65) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      selectIndex(activeIndex + direction);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, selectIndex]);

  const handleTimelineKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const currentId = event.target.closest('[data-timeline-id]')?.dataset.timelineId;
    if (!currentId) return;
    event.preventDefault();
    event.stopPropagation();
    const currentIndex = items.findIndex((item) => item.id === currentId);
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + (event.key === 'ArrowRight' ? 1 : -1)));
    selectIndex(nextIndex);
    window.requestAnimationFrame(() => {
      buttonsRef.current?.querySelector(`[data-timeline-id="${items[nextIndex].id}"]`)?.focus({ preventScroll: true });
    });
  };

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
    <section className="journey" ref={journeyRef} aria-labelledby="experience-heading">
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
        <h2 id="experience-heading">Experience</h2>
        <div className="journey-view-choice">{toolbar}</div>
      </div>

      <div className="journey-graph-header">
      <div className="git-main-badge"><i aria-hidden="true" /><b>main</b></div>
      <div className="journey-timeline-scroll" ref={buttonsRef} onKeyDown={handleTimelineKeyDown}>
        <div className="journey-timeline">
          <GitTimelineGraph
            items={graphItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            activeItem={active}
            contextIds={concurrentEducation.map((item) => item.id)}
            onSelect={selectItem}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
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
