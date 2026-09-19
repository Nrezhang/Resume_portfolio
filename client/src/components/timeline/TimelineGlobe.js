import React, { lazy, Suspense } from 'react';

const GlobeGlTimelineGlobe = lazy(() => import('./GlobeGlTimelineGlobe'));

export default function TimelineGlobe({ location, reduceMotion = false }) {
  const canRender = typeof ResizeObserver !== 'undefined';

  return (
    <div className="timeline-globe-canvas" aria-hidden="true">
      {canRender && (
        <Suspense fallback={<div className="timeline-globe-loading" />}>
          <GlobeGlTimelineGlobe location={location} reduceMotion={reduceMotion} />
        </Suspense>
      )}
    </div>
  );
}
