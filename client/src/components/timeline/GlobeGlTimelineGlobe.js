import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Globe from 'globe.gl';
import { flightEase, flightPoint, greatCircleAngle, surfacePath } from './flightPath';
import createFlightVisual from './createFlightVisual';

const DAY_TEXTURE = `${process.env.PUBLIC_URL}/globe/earth-day.jpg`;
const NIGHT_TEXTURE = `${process.env.PUBLIC_URL}/globe/earth-night.jpg`;
const BUMP_TEXTURE = `${process.env.PUBLIC_URL}/globe/earth-topology.png`;

function locationPins(location) {
  if (!location || location.remote) return [];
  const pins = location.pins?.length ? location.pins : [{ lat: location.lat ?? 20, lon: location.lon ?? 0 }];
  return pins.map((pin, index) => ({ ...pin, primary: index === 0 }));
}

function concurrentPaths(pins) {
  return pins.slice(1).map((pin) => ({ points: surfacePath(pins[0], pin), concurrent: true, progress: 1 }));
}

export default function GlobeGlTimelineGlobe({ location, reduceMotion = false }) {
  const hostRef = useRef(null);
  const globeRef = useRef(null);
  const previousLocationRef = useRef(null);
  const initialLocationRef = useRef(location);
  const flightFrameRef = useRef(0);
  const arrivalTimerRef = useRef(0);
  const travelPositionRef = useRef(null);
  const flightVisualRef = useRef(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const initial = initialLocationRef.current;
    const initialPins = locationPins(initial);
    const light = document.documentElement.dataset.theme === 'light';
    const globe = new Globe(host, { animateIn: false })
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(light ? DAY_TEXTURE : NIGHT_TEXTURE)
      .bumpImageUrl(BUMP_TEXTURE)
      .showAtmosphere(true)
      .atmosphereColor(light ? '#8bc9e8' : '#6d9ed0')
      .atmosphereAltitude(0.08)
      .showGraticules(false)
      .pointsData(initialPins)
      .pointLat('lat').pointLng('lon')
      .pointRadius((point) => point.traveler ? 0.2 : point.primary ? 0.3 : 0.2)
      .pointAltitude((point) => point.traveler ? point.altitude + 0.002 : 0.004)
      .pointColor((point) => point.traveler ? '#fff9da' : point.primary ? '#f2d663' : '#f1f5f3')
      .pointsTransitionDuration(0)
      .ringsData([]).ringLat('lat').ringLng('lon')
      .ringColor(() => ['rgba(242,214,99,.65)', 'rgba(242,214,99,0)'])
      .ringMaxRadius(2.5).ringPropagationSpeed(2).ringRepeatPeriod(850)
      .pathsData(concurrentPaths(initialPins))
      .pathPoints('points').pathPointLat('lat').pathPointLng('lon')
      .pathPointAlt((point) => point.altitude ?? 0.002).pathResolution(0.5)
      .pathColor((path) => path.concurrent ? '#75c5a6' : `rgba(242,214,99,${path.opacity ?? 1})`)
      .pathStroke(1.8)
      .pathDashLength((path) => path.progress)
      .pathDashGap(2).pathDashInitialGap((path) => path.offset || 0).pathDashAnimateTime(0)
      .pathTransitionDuration(0)
      .pointOfView({ lat: initial?.lat ?? 0, lng: initial?.lon ?? 0, altitude: 0.95 }, 0);

    const controls = globe.controls();
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enableDamping = false;
    globeRef.current = globe;
    previousLocationRef.current = initial;

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      globe.width(Math.max(1, Math.round(width))).height(Math.max(1, Math.round(height)))
        .globeOffset([width * (width < 760 ? 0.23 : 0.22), height * 0.1]);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    const themeObserver = new MutationObserver(() => {
      const isLight = document.documentElement.dataset.theme === 'light';
      globe.globeImageUrl(isLight ? DAY_TEXTURE : NIGHT_TEXTURE).atmosphereColor(isLight ? '#8bc9e8' : '#6d9ed0');
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      window.cancelAnimationFrame(flightFrameRef.current);
      window.clearTimeout(arrivalTimerRef.current);
      flightVisualRef.current?.dispose();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      globe.pauseAnimation();
      controls.dispose?.();
      globe.renderer()?.dispose?.();
      globeRef.current = null;
      host.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    const previous = previousLocationRef.current;
    if (!globe || !location || (previous === location && !reduceMotion)) return undefined;
    window.cancelAnimationFrame(flightFrameRef.current);
    window.clearTimeout(arrivalTimerRef.current);
    const pins = locationPins(location);
    const previousPins = locationPins(previous);
    const start = travelPositionRef.current || previousPins[0];
    const end = pins[0];
    const cameraStart = globe.pointOfView();
    const cameraOrigin = { lat: cameraStart.lat, lon: cameraStart.lng };
    const destination = end || { lat: location.lat ?? 20, lon: location.lon ?? 0 };
    const angle = start && end ? greatCircleAngle(start, end) : greatCircleAngle(cameraOrigin, destination);
    const destinationAltitude = location.remote ? 1.2 : Math.min(1.08, 0.78 + angle * 0.12);
    const hasRoute = start && end && angle > 0.0001;
    const contextPaths = concurrentPaths(pins);
    previousLocationRef.current = location;
    travelPositionRef.current = null;

    if (reduceMotion) {
      globe.pointsData(pins).pathsData(contextPaths).ringsData([])
        .pointOfView({ lat: destination.lat, lng: destination.lon, altitude: destinationAltitude }, 0);
      return undefined;
    }

    const visual = hasRoute ? createFlightVisual(globe, start, end, angle) : null;
    flightVisualRef.current = visual;
    visual?.update(0);
    const duration = hasRoute ? 2400 + angle * 650 : 1100;
    const departure = performance.now();
    globe.pointsData(hasRoute ? [start, ...pins] : pins).pathsData(hasRoute ? [] : contextPaths).ringsData([]);
    const animateFlight = (now) => {
      const t = Math.min(1, (now - departure) / duration);
      const progress = flightEase(t);
      const cameraPoint = flightPoint(cameraOrigin, destination, progress);
      // One continuous movement; an interrupted flight starts at the current camera.
      const altitude = cameraStart.altitude + (destinationAltitude - cameraStart.altitude) * progress
        + Math.sin(Math.PI * progress) ** 2 * Math.min(0.65, angle * 0.3);
      globe.pointOfView({ lat: cameraPoint.lat, lng: cameraPoint.lon, altitude }, 0);
      if (visual) travelPositionRef.current = visual.update(progress);
      if (t < 1) {
        flightFrameRef.current = window.requestAnimationFrame(animateFlight);
      } else {
        travelPositionRef.current = null;
        globe.pointsData(pins).ringsData(end ? [end] : []);
        arrivalTimerRef.current = window.setTimeout(() => globe.ringsData([]), 1500);
        if (visual) {
          const fadeRoute = (time) => {
            const opacity = 1 - flightEase((time - now - 250) / 900);
            visual.fade(opacity);
            if (opacity > 0) flightFrameRef.current = window.requestAnimationFrame(fadeRoute);
            else { visual.dispose(); globe.pathsData(contextPaths); }
          };
          flightFrameRef.current = window.requestAnimationFrame(fadeRoute);
        }
      }
    };
    flightFrameRef.current = window.requestAnimationFrame(animateFlight);
    return () => {
      window.cancelAnimationFrame(flightFrameRef.current);
      window.clearTimeout(arrivalTimerRef.current);
      visual?.dispose();
    };
  }, [location, reduceMotion]);

  return <div ref={hostRef} className="timeline-globe-renderer globe-gl-renderer" />;
}
