"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";

function SceneSetup() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color("#080808");
    scene.fog = new THREE.Fog("#080808", 4, 18);
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    const point1 = new THREE.PointLight(0xd4af37, 0.4, 20);
    point1.position.set(2, 2, 2);
    const point2 = new THREE.PointLight(0xfaf8f5, 0.25, 20);
    point2.position.set(-2, -1, 1);
    scene.add(ambient, point1, point2);
    return () => {
      scene.background = null;
      scene.fog = null;
      scene.remove(ambient, point1, point2);
      ambient.dispose();
      point1.dispose();
      point2.dispose();
    };
  }, [scene]);
  return null;
}

export function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      style={{ position: "absolute", inset: 0, display: "block" }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <SceneSetup />
        <HeroScene />
      </Suspense>
    </Canvas>
  );
}
