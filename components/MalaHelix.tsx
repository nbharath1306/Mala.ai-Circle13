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
    const velocity = useRef(0);
    const rotation = useRef(0);
    const isDragging = useRef(false);
    const lastY = useRef(0);

    const { updateTexture } = useSensoryFeedback();

    // Dummy object for instanced mesh positioning
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Material simulation for "Tulsi Wood"
    const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#8B4513', // SaddleBrown
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
    }), []);

    // Set up the Helix positions
    useEffect(() => {
        if (!meshRef.current) return;

        for (let i = 0; i < BEAD_COUNT; i++) {
            // Double Helix Parametric Equation
            const t = (i / BEAD_COUNT) * Math.PI * 8; // 4 full turns
            const radius = 2.5;
            const heightFactor = 0.15;

            const x = Math.cos(t) * radius;
            const z = Math.sin(t) * radius;
            const y = (i - BEAD_COUNT / 2) * heightFactor;

            dummy.position.set(x, y, z);
            dummy.scale.setScalar(0.2); // Bead size
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    // Inertia and Rotation Logic
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Apply Velocity
        rotation.current += velocity.current * delta;

        // Friction (Decay)
        if (!isDragging.current) {
            velocity.current *= 0.95; // Damping
        }

        // Auto-rotate slowly if idle
        if (Math.abs(velocity.current) < 0.1 && !isDragging.current) {
            rotation.current += 0.05 * delta;
        }

        // Apply Sensory Feedback
        // We pass velocity and current rotation (position) to simulate texture
        updateTexture(rotation.current, velocity.current);

        groupRef.current.rotation.y = rotation.current;
    });

    // Interaction Handlers (Pointer Events)
    const onPointerDown = (e: any) => {
        e.stopPropagation(); // Prevent orbit controls if present
        isDragging.current = true;
        lastY.current = e.clientY || e.touches?.[0]?.clientY;
        velocity.current = 0;
    };

    const onPointerMove = (e: any) => {
        if (!isDragging.current) return;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        const deltaY = clientY - lastY.current;
        lastY.current = clientY;

        // Map drag to velocity
        velocity.current = deltaY * 2.0;
    };

    const onPointerUp = () => {
        isDragging.current = false;
    };

    // Add global listeners for drag stability (outside canvas)
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
            <instancedMesh ref={meshRef} args={[undefined, undefined, BEAD_COUNT]} material={woodMaterial}>
                <sphereGeometry args={[1, 32, 32]} />
            </instancedMesh>

            {/* Guru Bead - Emissive Crystal */}
            <mesh position={[0, (BEAD_COUNT / 2) * 0.15 + 0.5, 0]}>
                <dodecahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFD700"
                    emissiveIntensity={2}
                    roughness={0}
                    metalness={1}
                />
            </mesh>
        </group>
    );
};

export default MalaHelix;
