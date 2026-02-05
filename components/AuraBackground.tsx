"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AuraBackgroundProps {
    intensity?: number;
}

const AuraBackground: React.FC<AuraBackgroundProps> = ({ intensity = 0 }) => {
    const materialRef = useRef<any>(null);
    const lightRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // Liquid undulation
        if (materialRef.current) {
            // Animate distortion scale or roughness based on intensity
            // Transmission material allows configuring distortion
            materialRef.current.distortion = 0.5 + intensity * 2.0;
            materialRef.current.distortionScale = 0.5 + Math.sin(t * 0.5) * 0.2;
            materialRef.current.temporalDistortion = 0.1 + intensity * 0.5;

            // Subtle color shift based on intensity (Void -> Gold Tint)
            const targetColor = new THREE.Color(intensity > 0.5 ? '#221100' : '#000000');
            materialRef.current.color.lerp(targetColor, 0.05);
        }

        // Rotate lights for dynamic reflections
        if (lightRef.current) {
            lightRef.current.rotation.y = t * 0.2;
            lightRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
        }
    });

    return (
        <>
            {/* Studio Lighting Environment */}
            <Environment preset="studio" blur={1} />

            {/* Dynamic Light Rig */}
            <group ref={lightRef}>
                <pointLight position={[10, 10, 10]} intensity={2.0} color="#FFFFFF" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#446688" />
                <rectAreaLight position={[0, 0, 5]} width={10} height={10} intensity={1.5} color="#FFFFFF" />
            </group>

            {/* The Liquid Object */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh scale={[8, 8, 8]} position={[0, 0, -5]}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <MeshTransmissionMaterial
                        ref={materialRef}
                        backside
                        samples={4} // Lower samples for mobile performance
                        thickness={2}
                        roughness={0.1}
                        chromaticAberration={0.1}
                        anisotropy={0.3}
                        distortion={0.5}
                        distortionScale={0.5}
                        temporalDistortion={0.1}
                        transmission={0.95}
                        color="#000000"
                        metalness={0.2}
                    />
                </mesh>
            </Float>

            {/* Background Backdrop (Void) */}
            <mesh scale={[100, 100, 1]} position={[0, 0, -20]}>
                <planeGeometry />
                <meshBasicMaterial color="#000000" />
            </mesh>
        </>
    );
};

export default AuraBackground;
