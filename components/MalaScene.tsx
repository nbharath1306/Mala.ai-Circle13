"use client";

import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const TOTAL_BEADS = 108;
const RADIUS = 4; // Radius of the mala loop

interface MalaBeadsProps {
    count: number;
}

const MalaBeads: React.FC<MalaBeadsProps> = ({ count }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize beads in a vertical circle
    useLayoutEffect(() => {
        if (!meshRef.current) return;

        for (let i = 0; i < TOTAL_BEADS; i++) {
            // Calculate position on the circle
            const angle = (i / TOTAL_BEADS) * Math.PI * 2;
            // Vertical loop: x=0, y=cos, z=sin
            // We'll rotate it slightly to face the camera better or just use standard orientation
            // Let's do a circle in the XY plane for simplicity, then rotate the group if needed.
            // Or vertical loop: X sinusoidal, Y sinusoidal.

            // Let's position them in a circle around the Y axis? No, "Vertical loop" usually means up/down.
            // Circle in XY plane.
            const x = Math.sin(angle) * RADIUS;
            const y = Math.cos(angle) * RADIUS;
            const z = 0;

            dummy.position.set(x, y, z);
            dummy.rotation.set(0, 0, -angle); // Rotate bead to align with path
            dummy.scale.set(1, 1, 1);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    // Animation loop
    useFrame((state) => {
        if (!meshRef.current) return;

        // Rotate the entire mala based on count
        // We want the "current" bead to be at the top or bottom.
        // Let's say top (12 o'clock).
        // Bead 0 is at (0, RADIUS, 0) -> Angle 0 (if cos(0)=1 is top).
        // As count increases, we want to rotate the loop so the next bead comes to the top.

        const targetRotation = (count / TOTAL_BEADS) * Math.PI * 2;
        // Smooth interpolation could be done here, but standard lerp is fine.

        // We can rotate the mesh itself
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation, 0.1);

        // Pulse effect or glowing for the active bead?
        // That requires setting color per instance, which is expensive every frame if not careful.
        // For now, let's just do rotation.
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL_BEADS]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial
                color="#8B4513" // Sandalwood base
                emissive="#ffd700" // Gold glow
                emissiveIntensity={0.2}
                roughness={0.3}
                metalness={0.1}
            />
        </instancedMesh>
    );
};

interface MalaSceneProps {
    count: number;
    round: number;
}

const MalaScene: React.FC<MalaSceneProps> = ({ count, round }) => {
    return (
        <div className="absolute inset-0 z-0 h-screen w-full bg-deep-black">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffd700" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#444" />

                <group rotation={[0, 0, 0]}>
                    <MalaBeads count={count} />
                </group>

                {/* Guru Bead (The large bead at top/bottom) */}
                <mesh position={[0, RADIUS + 0.3, 0]}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial
                        color="#AA6622"
                        emissive="#ffaa00"
                        emissiveIntensity={0.5}
                    />
                </mesh>

                <Environment preset="city" />
                {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
            </Canvas>
        </div>
    );
};

export default MalaScene;
