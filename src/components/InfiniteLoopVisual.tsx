'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleRing() {
    const ref = useRef<THREE.Points>(null);

    const particlesPosition = useMemo(() => {
        const count = 4000; // Doubled density
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 4 + Math.random() * 2; // Wider spread

            const x = Math.cos(angle) * radius;
            const y = (Math.random() - 0.5) * 4; // Taller vertical spread
            const z = Math.sin(angle) * radius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.05;
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#fbbf24"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

export default function InfiniteLoopVisual() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: false }}>
                <ParticleRing />
            </Canvas>
        </div>
    );
}
