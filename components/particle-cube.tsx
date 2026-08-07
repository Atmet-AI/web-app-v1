"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import * as THREE from "three";

const CUBELET_LABELS = [
  "Founders",
  "Sales",
  "Marketing",
  "Engineering",
  "Development",
  "Design",
  "Product",
  "Finance",
  "Legal",
  "Operations",
  "HR",
  "Customer Support",
  "Customer Success",
  "Data",
  "Analytics",
  "Security",
  "IT",
  "Procurement",
  "Research",
  "Content",
  "QA",
  "Logistics",
  "Partnerships",
  "Leadership",
  "RevOps",
  "Compliance",
  "Strategy",
];

function CubeParticles({
  activeCubelet,
  dragRotation,
  onActiveCubeletChange,
  scale,
}: {
  activeCubelet: number | null;
  dragRotation: { x: number; y: number };
  onActiveCubeletChange: (cubeletIndex: number | null) => void;
  scale: number;
}) {
  const count = 52000;
  const radius = 2.25;
  const groupRef = useRef<THREE.Group>(null);
  const autoRotationYRef = useRef(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    const cubelets = new Float32Array(count);
    const cubeletSpacing = radius * 0.74;
    const cubeletRadius = radius * 0.23;

    for (let index = 0; index < count; index += 1) {
      const cubeletIndex = index % 27;
      const cubeX = (cubeletIndex % 3) - 1;
      const cubeY = (Math.floor(cubeletIndex / 3) % 3) - 1;
      const cubeZ = Math.floor(cubeletIndex / 9) - 1;

      let x = cubeX * cubeletSpacing + (Math.random() * 2 - 1) * cubeletRadius;
      let y = cubeY * cubeletSpacing + (Math.random() * 2 - 1) * cubeletRadius;
      let z = cubeZ * cubeletSpacing + (Math.random() * 2 - 1) * cubeletRadius;
      const borderBias = Math.random();

      if (borderBias < 0.58) {
        const lockedAxes = borderBias < 0.44 ? 1 : borderBias < 0.56 ? 2 : 3;
        const axes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, lockedAxes);

        for (const axis of axes) {
          const value =
            (Math.random() < 0.5 ? -1 : 1) *
            (cubeletRadius + (Math.random() - 0.5) * 0.025);

          if (axis === 0) x = cubeX * cubeletSpacing + value;
          if (axis === 1) y = cubeY * cubeletSpacing + value;
          if (axis === 2) z = cubeZ * cubeletSpacing + value;
        }
      }

      const distortion =
        Math.sin(x * 3.1 + z * 1.4) * 0.025 +
        Math.cos(y * 2.8 - x) * 0.018 +
        (Math.random() - 0.5) * 0.08;

      positions[index * 3] = x + distortion;
      positions[index * 3 + 1] = y - distortion * 0.6;
      positions[index * 3 + 2] = z + distortion * 0.8;
      sizes[index] = 0.38 + Math.random() * 0.92;
      randoms[index] = Math.random();
      cubelets[index] = cubeletIndex;
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nextGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    nextGeometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    nextGeometry.setAttribute("aCubelet", new THREE.BufferAttribute(cubelets, 1));

    return nextGeometry;
  }, []);

  const cubeletHitAreas = useMemo(() => {
    const cubeletSpacing = radius * 0.74;
    const cubeletRadius = radius * 0.32;

    return Array.from({ length: 27 }, (_, cubeletIndex) => ({
      index: cubeletIndex,
      position: new THREE.Vector3(
        ((cubeletIndex % 3) - 1) * cubeletSpacing,
        ((Math.floor(cubeletIndex / 3) % 3) - 1) * cubeletSpacing,
        (Math.floor(cubeletIndex / 9) - 1) * cubeletSpacing,
      ),
      size: cubeletRadius * 2.15,
    }));
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      blending: THREE.NormalBlending,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uActiveCubelet: { value: -1 },
        uActiveParticleColor: { value: new THREE.Color("#050505") },
        uParticleColor: { value: new THREE.Color("#111111") },
        uPixelRatio: { value: 1 },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aRandom;
        attribute float aCubelet;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uActiveCubelet;
        varying float vAlpha;
        varying float vActive;

        void main() {
          vActive = 1.0 - step(0.5, abs(aCubelet - uActiveCubelet));
          float twinkle = 0.72 + 0.28 * sin(uTime * (1.0 + aRandom * 1.55) + aRandom * 48.0);
          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

          gl_Position = projectionMatrix * modelViewPosition;
          vAlpha = twinkle * mix(1.0, 1.95, vActive);
          gl_PointSize = aSize * mix(2.25, 3.1, vActive) * uPixelRatio * (7.0 / -modelViewPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uParticleColor;
        uniform vec3 uActiveParticleColor;
        varying float vAlpha;
        varying float vActive;

        void main() {
          vec2 centeredPoint = gl_PointCoord - 0.5;
          float distanceFromCenter = length(centeredPoint);
          float brightCore = smoothstep(0.26, 0.0, distanceFromCenter);
          float softGlow = smoothstep(0.5, 0.0, distanceFromCenter) * 0.24;
          float alpha = (brightCore + softGlow) * vAlpha * 0.92;

          if (alpha < 0.015) discard;

          gl_FragColor = vec4(mix(uParticleColor, uActiveParticleColor, vActive), alpha);
        }
      `,
    });
  }, []);

  useEffect(() => {
    function updatePixelRatio() {
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }

    updatePixelRatio();
    window.addEventListener("resize", updatePixelRatio);

    return () => {
      window.removeEventListener("resize", updatePixelRatio);
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(updateThemeColor);

    function updateThemeColor() {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }

    updateThemeColor();
    observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true });
    mediaQuery.addEventListener("change", updateThemeColor);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateThemeColor);
    };
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    (material.uniforms.uParticleColor.value as THREE.Color).set(isDarkMode ? "#ffffff" : "#111111");
    (material.uniforms.uActiveParticleColor.value as THREE.Color).set(isDarkMode ? "#ffffff" : "#050505");
    material.uniforms.uActiveCubelet.value = activeCubelet ?? -1;

    const dragInfluence = Math.min(1, Math.hypot(dragRotation.x, dragRotation.y) / 0.4);
    autoRotationYRef.current += delta * 0.12 * (1 - dragInfluence * 0.72);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0.55 + dragRotation.x, 0.08);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, autoRotationYRef.current + dragRotation.y, 0.08);
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0.22, 0.025);
    group.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.055;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <points geometry={geometry} material={material} />
      {cubeletHitAreas.map((cubelet) => (
        <mesh
          key={cubelet.index}
          onPointerMove={(event) => {
            event.stopPropagation();
            onActiveCubeletChange(cubelet.index);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            onActiveCubeletChange(null);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onActiveCubeletChange(cubelet.index);
          }}
          position={cubelet.position}
        >
          <boxGeometry args={[cubelet.size, cubelet.size, cubelet.size]} />
          <meshBasicMaterial depthWrite={false} opacity={0} transparent />
        </mesh>
      ))}
    </group>
  );
}

function ResponsiveCubeParticles(props: Omit<Parameters<typeof CubeParticles>[0], "scale">) {
  const { viewport } = useThree();
  const scale = Math.min(1.56, viewport.width / 4.44);

  return <CubeParticles {...props} scale={scale} />;
}

export function ParticleCube({ className = "" }: { className?: string }) {
  const [activeCubelet, setActiveCubelet] = useState<number | null>(null);
  const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    rotationX: 0,
    rotationY: 0,
  });

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    dragStateRef.current.dragging = true;
    dragStateRef.current.lastX = event.clientX;
    dragStateRef.current.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const dragState = dragStateRef.current;

    if (!dragState.dragging) return;

    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;

    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
    dragState.rotationX += deltaY * 0.012;
    dragState.rotationY += deltaX * 0.012;

    setDragRotation({
      x: dragState.rotationX,
      y: dragState.rotationY,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    dragStateRef.current.dragging = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerLeave() {
    dragStateRef.current.dragging = false;
    setActiveCubelet(null);
  }

  return (
    <section
      className={`relative cursor-grab touch-none active:cursor-grabbing ${className} [&_canvas]:block [&_canvas]:size-full`}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        camera={{
          far: 100,
          fov: 64,
          near: 0.1,
          position: [0, 0, 12.4],
        }}
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ResponsiveCubeParticles
          activeCubelet={activeCubelet}
          dragRotation={dragRotation}
          onActiveCubeletChange={setActiveCubelet}
        />
      </Canvas>
      {activeCubelet !== null ? (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-white px-2 py-1 text-xs font-medium text-black shadow-[0_8px_24px_rgba(0,0,0,0.24)] dark:bg-white dark:text-black"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 14,
          }}
        >
          {CUBELET_LABELS[activeCubelet]}
        </div>
      ) : null}
    </section>
  );
}
