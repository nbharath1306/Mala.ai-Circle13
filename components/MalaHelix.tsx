"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

interface MalaHelixProps {
    count: number; // Current chant count
}

const BEAD_COUNT = 108;

const MalaHelix: React.FC<MalaHelixProps> = ({ count }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Physics State
    const velocity = useRef(0);
    const rotation = useRef(0);
    const isDragging = useRef(false);
    const lastY = useRef(0);

    const { updateTexture } = useSensoryFeedback();

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Material: Machined Steel / Titanium
    const titaniumMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#B0C4DE', // LightSteelBlue base
        roughness: 0.15, // Polished
        metalness: 1.0,  // Full Metal
        envMapIntensity: 1.0,
    }), []);

    const guruBeadMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        emissive: '#FFFFFF',
        emissiveIntensity: 0.2, // Subtle bioluminescence
        clearcoat: 1,
        roughness: 0,
        metalness: 0.5,
        transmission: 0.5
    }), []);

    // Set up the Helix positions
    useEffect(() => {
        if (!meshRef.current) return;

        for (let i = 0; i < BEAD_COUNT; i++) {
            // Precise Mathematical Helix
            const t = (i / BEAD_COUNT) * Math.PI * 8; // 4 turns
            const radius = 2.8; // Slightly wider
            const heightFactor = 0.12; // More compact

            const x = Math.cos(t) * radius;
            const z = Math.sin(t) * radius;
            const y = (i - BEAD_COUNT / 2) * heightFactor;

            dummy.position.set(x, y, z);
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0); // Random bead rotation
            dummy.scale.setScalar(0.25); // Slightly larger, heavier beads
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    // Heavy Inertia Physics
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Apply Velocity
        rotation.current += velocity.current * delta;

        // Friction (Damping) - Heavy feel
        // Higher damping = heavier object that stops faster but resists movement
        if (!isDragging.current) {
            velocity.current *= 0.92; // Stronger decay than 0.95
        }

        // Auto-rotate: Very slow, precise movement if idle
        if (Math.abs(velocity.current) < 0.05 && !isDragging.current) {
            // Subtle drift
            rotation.current += 0.02 * delta;
        }

        // Apply Sensory Feedback
        updateTexture(rotation.current, velocity.current);

        groupRef.current.rotation.y = rotation.current;
    });

    // Interaction Handlers
    const onPointerDown = (e: any) => {
        e.stopPropagation();
        isDragging.current = true;
        lastY.current = e.clientY || e.touches?.[0]?.clientY;
        velocity.current = 0;
    };

    const onPointerMove = (e: any) => {
        if (!isDragging.current) return;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        const deltaY = clientY - lastY.current;
        lastY.current = clientY;

        // Map drag to velocity - Lower sensitivity for "Heavy" feel
        velocity.current += deltaY * 0.05; // Accumulate force rather than direct mapping

        // Clamp max velocity to prevent "spinning top" effect
        velocity.current = Math.max(Math.min(velocity.current, 5), -5);
    };

    const onPointerUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        const handleUp = () => { isDragging.current = false; };
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, []);

    return (
        <group
            ref={groupRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
        >
            <instancedMesh ref={meshRef} args={[undefined, undefined, BEAD_COUNT]} material={titaniumMaterial} castShadow receiveShadow>
                <sphereGeometry args={[1, 32, 32]} />
            </instancedMesh>

            {/* Guru Bead - The Crystal Prism */}
            <mesh position={[0, (BEAD_COUNT / 2) * 0.12 + 0.6, 0]} material={guruBeadMaterial}>
                <icosahedronGeometry args={[0.5, 0]} />
            </mesh>
        </group>
    );
};

export default MalaHelix;
