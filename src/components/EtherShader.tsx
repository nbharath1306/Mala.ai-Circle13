'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Data Network Shader
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 st = vUv * 10.0; // Grid scale
    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    // Simple Grid Lines
    float grid = step(0.98, fpos.x) + step(0.98, fpos.y);
    
    // Random "Data Packet" pulses
    float rnd = random(ipos);
    float pulse = step(0.98, sin(uTime * 2.0 + rnd * 10.0));
    
    // Node dots
    float dots = step(0.9, 1.0 - length(fpos - 0.5));
    
    vec3 color = vec3(0.0);
    
    // Grid color (Weak)
    color += vec3(0.1) * grid;
    
    // Active Nodes (Amber)
    if (rnd > 0.7) {
        float activePulse = smoothstep(0.0, 1.0, sin(uTime * 3.0 + rnd * 100.0));
        color += vec3(1.0, 0.6, 0.0) * dots * activePulse * 0.5;
    }

    // Vignette for depth
    float dist = distance(vUv, vec2(0.5));
    color *= smoothstep(0.8, 0.2, dist);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function NetworkPlane() {
    const mesh = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    useFrame((state) => {
        if (mesh.current) {
            (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

export default function EtherShader() { // Keeping filename for simplicity, but content is new
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <NetworkPlane />
            </Canvas>
        </div>
    );
}
