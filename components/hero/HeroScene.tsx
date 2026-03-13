"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type PointerState, subscribePointer } from "@/lib/pointer";

const PARTICLE_COUNT = 2800;
const CREAM = new THREE.Color("#faf8f5");
const GOLD = new THREE.Color("#d4af37");

function useParticles() {
  return useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const scales = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread in a large volume behind the view
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;

      const t = Math.random();
      const c = CREAM.clone().lerp(GOLD, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      scales[i] = 0.015 + Math.random() * 0.04;
      speeds[i] = 0.2 + Math.random() * 0.6;
    }

    return { positions, colors, scales, speeds };
  }, []);
}

export function HeroScene() {
  const pointsRef = useRef<THREE.Points>(null);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, ndcX: 0, ndcY: 0 });
  const { positions, colors, scales, speeds } = useParticles();

  const [geometry, material] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("scale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, [positions, colors, scales, speeds]);

  useEffect(() => {
    const unsubscribe = subscribePointer((state) => {
      pointerRef.current = state;
    });
    return unsubscribe;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speed = pointsRef.current.geometry.attributes.speed.array as Float32Array;
    const speedFactor = 0.7;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += delta * speed[i] * speedFactor;
      if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] -= 16;
      if (pos[i * 3 + 1] < -8) pos[i * 3 + 1] += 16;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Subtle pointer-based rotation for an interactive, Astro-style feel
    const { ndcX, ndcY } = pointerRef.current;
    const targetRotY = ndcX * 0.3;
    const targetRotX = ndcY * 0.2;
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      targetRotY,
      0.08
    );
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      targetRotX,
      0.08
    );
  });

  // R3F points element; R3F JSX intrinsics typed as 'never' in this Next build — use createElement
  return React.createElement("points", {
    ref: pointsRef,
    geometry,
    material,
    frustumCulled: false,
  });
}

