'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 800;

function GoldenDust({ tiltX = 0, tiltY = 0 }: { tiltX?: number; tiltY?: number }) {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { positions, velocities, sizes } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Spread particles in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 2 + Math.random() * 3;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi) - 2; // Push back in Z

            // Slow brownian velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.002;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;

            // Varied sizes
            sizes[i] = 0.5 + Math.random() * 1.5;
        }

        return { positions, velocities, sizes };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uTiltX: { value: 0 },
        uTiltY: { value: 0 },
    }), []);

    useFrame((state) => {
        if (!pointsRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();
        materialRef.current.uniforms.uTime.value = time;
        materialRef.current.uniforms.uTiltX.value = tiltX;
        materialRef.current.uniforms.uTiltY.value = tiltY;

        // Update positions with brownian motion
        const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            posArray[i * 3] += velocities[i * 3] + Math.sin(time * 0.5 + i) * 0.001;
            posArray[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(time * 0.3 + i * 0.5) * 0.001;
            posArray[i * 3 + 2] += velocities[i * 3 + 2];

            // Wrap around bounds
            if (Math.abs(posArray[i * 3]) > 5) velocities[i * 3] *= -1;
            if (Math.abs(posArray[i * 3 + 1]) > 5) velocities[i * 3 + 1] *= -1;
            if (posArray[i * 3 + 2] > 1 || posArray[i * 3 + 2] < -5) velocities[i * 3 + 2] *= -1;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Apply tilt-based rotation for parallax
        pointsRef.current.rotation.y = tiltX * 0.1;
        pointsRef.current.rotation.x = tiltY * 0.1;
    });

    const vertexShader = `
        attribute float size;
        uniform float uTime;
        varying float vAlpha;
        
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Twinkle effect
            float twinkle = sin(uTime * 2.0 + position.x * 10.0) * 0.5 + 0.5;
            vAlpha = 0.3 + twinkle * 0.7;
            
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        varying float vAlpha;
        
        void main() {
            // Soft circular particle
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
            
            // Golden color with slight variation
            vec3 gold = vec3(1.0, 0.84, 0.0);
            vec3 amber = vec3(1.0, 0.6, 0.2);
            vec3 color = mix(gold, amber, gl_PointCoord.y);
            
            gl_FragColor = vec4(color, alpha * 0.6);
        }
    `;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={PARTICLE_COUNT}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

interface StardustParticlesProps {
    tiltX?: number;
    tiltY?: number;
}

export default function StardustParticles({ tiltX = 0, tiltY = 0 }: StardustParticlesProps) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 3], fov: 60 }}
                gl={{ alpha: true, antialias: true }}
                style={{ background: 'transparent' }}
            >
                <GoldenDust tiltX={tiltX} tiltY={tiltY} />
            </Canvas>
        </div>
    );
}
