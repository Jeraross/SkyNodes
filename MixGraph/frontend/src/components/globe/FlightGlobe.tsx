/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GlobeMode, PlanePosition } from '../../types';
import { airports } from '../../data/airports';
import { routeArcs } from '../../data/routes';
import { createAirplaneObject } from './AirplaneObject';

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

interface Props {
  mode: GlobeMode;
  highlightedRouteIds: string[];
  currentRouteId: string;
  simulatedPlanePosition: PlanePosition;
  onEnterBrazil: () => void;
}

export default function FlightGlobe({
  mode, highlightedRouteIds, currentRouteId, simulatedPlanePosition, onEnterBrazil,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [GlobeComponent, setGlobeComponent] = useState<React.ComponentType<any> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  const arcStroke = (arc: { id: string }) => {
    if (arc.id === currentRouteId) return 2.2;
    if (highlightedRouteIds.includes(arc.id)) return 1.2;
    return 0.4;
  };

  const arcDashLength = (arc: { id: string }) => {
    if (arc.id === currentRouteId) return 0.6;
    if (highlightedRouteIds.includes(arc.id)) return 0.55;
    return 1; // linha sólida para rotas não destacadas
  };

  const arcDashGap = (arc: { id: string }) => {
    if (arc.id === currentRouteId) return 0.12;
    if (highlightedRouteIds.includes(arc.id)) return 0.1;
    return 0; // sem gap → sem animação visível
  };

  const arcAnimateTime = (arc: { id: string }) => {
    if (arc.id === currentRouteId) return 2000;
    if (highlightedRouteIds.includes(arc.id)) return 7000;
    return 0; // sem animação para rotas comuns
  };

  const pointColor = (point: { id: string }) =>
    highlightedRouteIds.some(id => {
      const arc = routeArcs.find(a => a.id === id);
      return arc && (arc.from === point.id || arc.to === point.id);
    })
      ? 'rgba(250, 204, 21, 1)'
      : 'rgba(34, 211, 238, 0.9)';

  const showData = mode !== 'orbit';
  const planeData = simulatedPlanePosition.visible ? [simulatedPlanePosition] : [];

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
        customLayerData={planeData}
        customThreeObject={() => createAirplaneObject()}
        customThreeObjectUpdate={(obj: any, d: any) => {
          if (!globeRef.current) return;
          const { x, y, z } = globeRef.current.getCoords(d.lat, d.lng, d.altitude);
          obj.position.set(x, y, z);

          const φ = (d.lat * Math.PI) / 180;
          const λ = (d.lng * Math.PI) / 180;

          // Surface normal — "up" for the airplane (globe.gl: x=cos(lat)*sin(lng), y=sin(lat), z=cos(lat)*cos(lng))
          const up = new THREE.Vector3(x, y, z).normalize();

          // North: ∂pos/∂lat normalized
          const north = new THREE.Vector3(
            -Math.sin(φ) * Math.sin(λ),
             Math.cos(φ),
            -Math.sin(φ) * Math.cos(λ),
          ).normalize();

          // East: ∂pos/∂lng normalized
          const east = new THREE.Vector3(Math.cos(λ), 0, -Math.sin(λ)).normalize();

          // Forward from heading (degrees clockwise from north)
          const hRad = (d.heading * Math.PI) / 180;
          const forward = new THREE.Vector3()
            .addScaledVector(north, Math.cos(hRad))
            .addScaledVector(east, Math.sin(hRad))
            .normalize();

          // Proper right-handed basis: up × forward = right, right × up = fwd (re-orthogonalized)
          const right = new THREE.Vector3().crossVectors(up, forward).normalize();
          const fwd = new THREE.Vector3().crossVectors(right, up).normalize();

          // X=right, Y=up (radial outward), Z=forward (direction of travel — nose)
          obj.quaternion.setFromRotationMatrix(
            new THREE.Matrix4().makeBasis(right, up, fwd)
          );
        }}
      />
    </div>
  );
}
