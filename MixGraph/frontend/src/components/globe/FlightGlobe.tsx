/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GlobeMode, PlanePosition } from '../../types';
import aliciaAudio from '../../assets/alicia-edited.mp3';
import { airports } from '../../data/airports';
import { routeArcs } from '../../data/routes';
import { createAirplaneObject } from './AirplaneObject';
import { createEiffelTowerObject, loadEiffelTowerModel, onEiffelModelReady } from './EiffelTowerObject';

interface GlobeMethods {
  pointOfView: (pos: { lat: number; lng: number; altitude: number }, ms: number) => void;
  getCoords: (lat: number, lng: number, altitude: number) => { x: number; y: number; z: number };
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    enablePan: boolean;
  };
}

const EIFFEL_LAT = 48.8584;
const EIFFEL_LNG = 2.2945;

let aliciaPlayer: HTMLAudioElement | null = null;

interface Props {
  mode: GlobeMode;
  highlightedRouteIds: string[];
  currentRouteId: string;
  simulatedPlanePosition: PlanePosition;
  onEnterBrazil: () => void;
  eiffelUnlocked: boolean;
}

export default function FlightGlobe({
  mode, highlightedRouteIds, currentRouteId, simulatedPlanePosition, onEnterBrazil, eiffelUnlocked,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [GlobeComponent, setGlobeComponent] = useState<React.ComponentType<any> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [towerVer, setTowerVer] = useState(0); // bumped when GLTF model finishes loading

  useEffect(() => {
    import('react-globe.gl').then(mod => {
      setGlobeComponent(() => mod.default as React.ComponentType<any>);
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setDimensions({ width: el.clientWidth, height: el.clientHeight })
    );
    ro.observe(el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

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
    if (arc.id === currentRouteId) return 'rgba(255, 220, 30, 1.0)';
    if (highlightedRouteIds.includes(arc.id)) return 'rgba(250, 204, 21, 0.85)';
    switch (arc.type) {
      case 'hub':            return 'rgba(34, 211, 238, 0.55)';
      case 'regional':       return 'rgba(74, 222, 128, 0.45)';
      case 'inter_regional': return 'rgba(167, 139, 250, 0.50)';
      default:               return 'rgba(255,255,255,0.3)';
    }
  };

  const arcStroke      = (arc: { id: string }) => arc.id === currentRouteId ? 2.2 : highlightedRouteIds.includes(arc.id) ? 1.2 : 0.4;
  const arcDashLength  = (arc: { id: string }) => arc.id === currentRouteId ? 0.6 : highlightedRouteIds.includes(arc.id) ? 0.55 : 1;
  const arcDashGap     = (arc: { id: string }) => arc.id === currentRouteId ? 0.12 : highlightedRouteIds.includes(arc.id) ? 0.1 : 0;
  const arcAnimateTime = (arc: { id: string }) => arc.id === currentRouteId ? 2000 : highlightedRouteIds.includes(arc.id) ? 7000 : 0;

  const pointColor = (point: { id: string }) =>
    highlightedRouteIds.some(id => {
      const arc = routeArcs.find(a => a.id === id);
      return arc && (arc.from === point.id || arc.to === point.id);
    }) ? 'rgba(250, 204, 21, 1)' : 'rgba(34, 211, 238, 0.9)';

  // Pre-load the GLTF model as soon as the easter egg is unlocked
  useEffect(() => {
    if (!eiffelUnlocked) return;
    loadEiffelTowerModel().then(() => {
      onEiffelModelReady(() => setTowerVer(v => v + 1));
    });
  }, [eiffelUnlocked]);

  const showData = mode !== 'orbit';

  // Combine plane + Eiffel Tower into a single custom layer
  const planeItems = simulatedPlanePosition.visible
    ? [{ ...simulatedPlanePosition, _kind: 'plane' as const }]
    : [];
  const towerItems = eiffelUnlocked
    ? [{ lat: EIFFEL_LAT, lng: EIFFEL_LNG, altitude: 0.03, heading: 0, _kind: 'tower' as const, _v: towerVer }]
    : [];
  const customData = [...planeItems, ...towerItems];

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

        arcsData={showData ? routeArcs : []}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={arcColor}
        arcStroke={arcStroke}
        arcDashLength={arcDashLength}
        arcDashGap={arcDashGap}
        arcDashAnimateTime={arcAnimateTime}
        arcAltitudeAutoScale={0.3}

        onGlobeClick={handleGlobeClick}

        customLayerData={customData}
        customThreeObject={(d: any) =>
          d._kind === 'tower' ? createEiffelTowerObject() : createAirplaneObject()
        }
        customLayerLabel={(d: any) =>
          d._kind === 'tower'
            ? `<div style="background:rgba(2,6,23,0.96);border:1px solid rgba(250,204,21,0.55);border-radius:6px;padding:5px 12px;color:#fef9c3;font-size:11px;white-space:nowrap;font-style:italic;letter-spacing:0.02em">For those who come after.</div>`
            : ''
        }
        onCustomLayerClick={(d: any) => {
          if (d._kind === 'tower') {
            if (aliciaPlayer && !aliciaPlayer.paused) return;
            aliciaPlayer = new Audio(aliciaAudio);
            aliciaPlayer.play().catch(() => {});
          }
        }}
        customThreeObjectUpdate={(obj: any, d: any) => {
          if (!globeRef.current) return;
          const { x, y, z } = globeRef.current.getCoords(d.lat, d.lng, d.altitude);
          obj.position.set(x, y, z);

          if (d._kind === 'tower') {
            // Orient Y-axis radially outward so the tower stands upright on the surface
            const up = new THREE.Vector3(x, y, z).normalize();
            const ref = Math.abs(up.y) < 0.99
              ? new THREE.Vector3(0, 1, 0)
              : new THREE.Vector3(1, 0, 0);
            const right   = new THREE.Vector3().crossVectors(ref, up).normalize();
            const forward = new THREE.Vector3().crossVectors(up, right).normalize();
            obj.quaternion.setFromRotationMatrix(
              new THREE.Matrix4().makeBasis(right, up, forward)
            );
            return;
          }

          // ── Airplane orientation (unchanged) ──
          const φ = (d.lat * Math.PI) / 180;
          const λ = (d.lng * Math.PI) / 180;

          const up = new THREE.Vector3(x, y, z).normalize();
          const north = new THREE.Vector3(
            -Math.sin(φ) * Math.sin(λ),
             Math.cos(φ),
            -Math.sin(φ) * Math.cos(λ),
          ).normalize();
          const east = new THREE.Vector3(Math.cos(λ), 0, -Math.sin(λ)).normalize();

          const hRad    = (d.heading * Math.PI) / 180;
          const forward = new THREE.Vector3()
            .addScaledVector(north, Math.cos(hRad))
            .addScaledVector(east,  Math.sin(hRad))
            .normalize();

          const right = new THREE.Vector3().crossVectors(up, forward).normalize();
          const fwd   = new THREE.Vector3().crossVectors(right, up).normalize();

          obj.quaternion.setFromRotationMatrix(
            new THREE.Matrix4().makeBasis(right, up, fwd)
          );
        }}
      />
    </div>
  );
}
