"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

interface MalaHelixProps {
    count: number;
}

const BEAD_COUNT = 108;

const MalaHelix: React.FC<MalaHelixProps> = ({ count }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { size, viewport } = useThree(); // Get viewport info for valid 1:1 mapping

    // Interaction State
    const rotation = useRef(0);
    const velocity = useRef(0);
    const isDragging = useRef(false);
    const lastY = useRef(0);
    const lastTime = useRef(0);

    const { updateTexture } = useSensoryFeedback();

    // Optimization: Re-use objects
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#B0C4DE', // LightSteelBlue
        roughness: 0.4,   // Rougher for better performance (less specular calc)
        metalness: 0.8,
    }), []);

    // Setup Geometry
    useEffect(() => {
        if (!meshRef.current) return;
        for (let i = 0; i < BEAD_COUNT; i++) {
            const t = (i / BEAD_COUNT) * Math.PI * 8;
            const radius = 2.8;
            const heightFactor = 0.12;

            const x = Math.cos(t) * radius;
            const z = Math.sin(t) * radius;
            const y = (i - BEAD_COUNT / 2) * heightFactor;

            dummy.position.set(x, y, z);
            // Remove random rotation for performance/cleaner look
            dummy.scale.setScalar(0.25);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    // Frame Loop: Momentum & Cleanup
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Apply Momentum if Not Dragging
        if (!isDragging.current) {
            // Friction Logic
            velocity.current *= 0.95; // Standard decay

            if (Math.abs(velocity.current) > 0.001) {
                rotation.current += velocity.current * delta;
                updateTexture(rotation.current, velocity.current);
            }
        }

        // Apply Rotation
        groupRef.current.rotation.y = rotation.current;
    });

    // 1:1 Interaction Handlers
    const onPointerDown = (e: any) => {
        e.stopPropagation();
        isDragging.current = true;
        lastY.current = e.clientY || e.touches?.[0]?.clientY;
        lastTime.current = performance.now();
        velocity.current = 0; // Stop momentum instantly on touch
    };

    const onPointerMove = (e: any) => {
        if (!isDragging.current) return;

        // Calculate 1:1 Delta
        const currentY = e.clientY || e.touches?.[0]?.clientY;
        const deltaPixel = currentY - lastY.current;

        // Convert Pixel Delta to Rotation Dial Delta
        // Factor needs to feel natural. 
        // Approx: Screen Height = ~Math.PI * 2 rotation? 
        // Let's try constant sensitivity based on viewport height.
        const sensitivity = 5.0 / size.height;

        const deltaRotation = deltaPixel * sensitivity;

        rotation.current += deltaRotation;

        // Calculate instant velocity for "Fling"
        const now = performance.now();
        const dt = (now - lastTime.current) / 1000;
        if (dt > 0) {
            velocity.current = deltaRotation / dt;
        }

        lastY.current = currentY;
        lastTime.current = now;

        // Trigger Haptics directly on drag
        updateTexture(rotation.current, velocity.current);
    };

    const onPointerUp = () => {
        isDragging.current = false;
    };

    // Global Listeners for safety
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
            // Native Event Handlers on mesh for better perf than R3F events sometimes?
            // Using R3F events is fine if we stopPropagation
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
        >
            <instancedMesh ref={meshRef} args={[undefined, undefined, BEAD_COUNT]} material={material}>
                <sphereGeometry args={[1, 16, 16]} /> {/* Low Poly Reps */}
            </instancedMesh>
        </group>
    );
};

export default MalaHelix;
