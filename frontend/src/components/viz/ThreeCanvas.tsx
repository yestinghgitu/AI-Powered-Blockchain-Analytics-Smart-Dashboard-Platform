import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.cos(time / 4) * 0.2;
    mesh.current.rotation.y = Math.sin(time / 4) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={mesh} args={[1, 100, 100]} scale={1.5}>
        <MeshDistortMaterial
          color="#06b6d4"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
        />
      </Sphere>
    </Float>
  );
};

const ThreeCanvas = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <AnimatedShape />
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;
