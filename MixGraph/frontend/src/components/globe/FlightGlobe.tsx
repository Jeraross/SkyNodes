/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import type { GlobeMode } from '../../types';
import { airports } from '../../data/airports';
import { routeArcs } from '../../data/routes';

// react-globe.gl has no complete TypeScript declaration file — we import it dynamically
// and use a loose type for the ref methods we need.
interface GlobeMethods {
  pointOfView: (pos: { lat: number; lng: number; altitude: number }, ms: number) => void;
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    enablePan: boolean;
  };
}

interface Props {
  mode: GlobeMode;
  highlightedRouteIds: string[];
  onEnterBrazil: () => void;
}

export default function FlightGlobe({ mode, highlightedRouteIds, onEnterBrazil }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [GlobeComponent, setGlobeComponent] = useState<React.ComponentType<any> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Dynamic import to avoid SSR issues with three.js
  useEffect(() => {
    import('react-globe.gl').then(mod => {
      setGlobeComponent(() => mod.default as React.ComponentType<any>);
    });
  }, []);

  // Track container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Camera + rotation control when mode changes
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (mode === 'orbit') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.45;
    } else {
      controls.autoRotate = false;
      globeRef.current.pointOfView({ lat: -14.235, lng: -51.9253, altitude: 1.25 }, 1800);
    }
  }, [mode]);

  const arcColor = (arc: { type: string; id: string }) => {
    if (highlightedRouteIds.includes(arc.id)) return 'rgba(250, 204, 21, 0.95)';
    switch (arc.type) {
      case 'hub': return 'rgba(34, 211, 238, 0.55)';
      case 'regional': return 'rgba(74, 222, 128, 0.45)';
      case 'inter_regional': return 'rgba(167, 139, 250, 0.50)';
      default: return 'rgba(255,255,255,0.3)';
    }
  };

  const arcStroke = (arc: { id: string }) =>
    highlightedRouteIds.includes(arc.id) ? 1.2 : 0.4;

  const arcAnimateTime = (arc: { id: string }) =>
    highlightedRouteIds.includes(arc.id) ? 1200 : 2500;

  const pointColor = (point: { id: string }) =>
    highlightedRouteIds.some(id => {
      const arc = routeArcs.find(a => a.id === id);
      return arc && (arc.from === point.id || arc.to === point.id);
    })
      ? 'rgba(250, 204, 21, 1)'
      : 'rgba(34, 211, 238, 0.9)';

  const showData = mode !== 'orbit';

  const handleGlobeClick = () => {
    if (mode === 'orbit') onEnterBrazil();
  };

  if (!GlobeComponent) {
    return <div ref={containerRef} className="h-full w-full bg-[#020617]" />;
  }

  return (
    <div ref={containerRef} className="h-full w-full" onClick={handleGlobeClick}>
      <GlobeComponent
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        width={dimensions.width || undefined}
        height={dimensions.height || undefined}
        // Points (airports)
        pointsData={showData ? airports : []}
        pointLat="lat"
        pointLng="lng"
        pointColor={pointColor}
        pointRadius={0.22}
        pointAltitude={0.015}
        pointLabel={(point: { id: string; name: string; city: string; state: string }) =>
          `<div style="background:rgba(2,6,23,0.85);border:1px solid rgba(34,211,238,0.4);border-radius:6px;padding:6px 10px;color:#e2e8f0;font-size:12px;pointer-events:none">
            <strong style="color:#67e8f9">${point.id}</strong><br/>
            ${point.name}<br/>
            ${point.city}, ${point.state}
          </div>`
        }
        // Arcs (routes)
        arcsData={showData ? routeArcs : []}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={arcColor}
        arcStroke={arcStroke}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={arcAnimateTime}
        arcAltitudeAutoScale={0.3}
        onGlobeClick={handleGlobeClick}
      />
    </div>
  );
}
