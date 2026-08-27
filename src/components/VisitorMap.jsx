import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// MapMyVisitors site id (replaces the discontinued ClustrMaps widget —
// cdn.clustrmaps.com stopped resolving in 2026).
const MAPMYVISITORS_ID = 'fHOFantoeZxWliMrlvm7rM8VN7HghyHp78Kff-TMZWU';

// Colors picked to match the site's .card palette (see global.css):
// cream ocean/background (#fffbe6) with brown continents/text (#5f4b3b).
const WIDGET_QUERY = `d=${MAPMYVISITORS_ID}&t=n&co=fffbe6&cl=5f4b3b&ct=5f4b3b&w=a`;

// The widget's own script only ever measures its parent element's width
// once, at load time — it has no built-in resize handling. To get it to
// re-flow across breakpoints (e.g. rotating a phone, resizing a desktop
// window) we tear it down and re-run it ourselves, debounced, whenever
// the viewport changes.
function mountWidget(container) {
  if (!container) return;
  container.innerHTML = '';

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.id = 'mapmyvisitors';
  // Cache-bust so the browser actually re-requests/re-executes the script
  // on every re-mount instead of reusing a previous run.
  script.src = `//mapmyvisitors.com/map.js?${WIDGET_QUERY}&_r=${Date.now()}`;
  container.appendChild(script);
}

export default function VisitorMap() {
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const container = containerRef.current;
    mountWidget(container);

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => mountWidget(container), 300);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="visitor-map-card">
      <div className="visitor-map-caption">{t('visitor_map')}</div>
      <div ref={containerRef} className="visitor-map-widget" />
    </div>
  );
}
