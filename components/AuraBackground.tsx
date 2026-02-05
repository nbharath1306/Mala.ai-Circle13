"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AuraBackgroundProps {
    intensity?: number;
}

const AuraBackground: React.FC<AuraBackgroundProps> = ({ intensity = 0 }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
            meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;

            // Pulse scale slightly with intensity
            const scale = 5 + intensity * 0.5;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <>
            <Environment preset="city" blur={0.8} />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
                <mesh ref={meshRef} position={[0, 0, -5]}>
                    <sphereGeometry args={[1, 64, 64]} />
                    {/* Metal/Glass Look using Standard Material - Faster than Transmission */}
                    <meshPhysicalMaterial
                        color="#111111"
                        roughness={0.15}
                        metalness={0.9}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        reflectivity={1}
                        emissive="#4B0082" // Deep Indigo Glow
                        emissiveIntensity={0.2 + intensity * 0.5}
                    />
                </mesh>
            </Float>

            {/* Simple Particle Dust for depth (Billboards = Cheap) */}
            {/* Omitted for pure performance focus now, can add back if needed */}
        </>
    );
};

export default AuraBackground;
