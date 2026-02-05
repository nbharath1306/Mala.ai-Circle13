"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AuraMaterial = {
    uniforms: {
        u_time: { value: 0 },
        u_count: { value: 0 },
        u_intensity: { value: 0 }, // From mic
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float u_time;
    uniform float u_count;
    varying vec2 vUv;

    // Simplex noise function (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        // Slow shifting background
        float noise = snoise(vUv * 3.0 + u_time * 0.1);
        
        // Color palette based on count progress (0 -> 108)
        float progress = min(u_count / 108.0, 1.0);
        
        vec3 colorStart = vec3(0.02, 0.02, 0.05); // Deep Blue/Black
        vec3 colorMid = vec3(0.1, 0.05, 0.2);     // Purple hint
        vec3 colorEnd = vec3(0.2, 0.15, 0.05);    // Gold hint
        
        vec3 baseColor = mix(colorStart, colorMid, noise + 0.5);
        baseColor = mix(baseColor, colorEnd, progress * 0.5);
        
        // Add a glow ring
        float dist = distance(vUv, vec2(0.5));
        float ring = smoothlyStep(0.4, 0.38, dist) - smoothlyStep(0.3, 0.28, dist);
        // Using simplified smoothstep logic manually if needed or standard
        
        float glow = 1.0 - smoothstep(0.0, 0.8, dist);
        
        gl_FragColor = vec4(baseColor + glow * 0.05, 1.0);
    }
  `
};

interface AuraShaderProps {
    count: number;
}

const AuraShader: React.FC<AuraShaderProps> = ({ count }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const planeRef = useRef<THREE.Mesh>(null);

    // Create shader material only once
    const shaderArgs = useMemo(() => ({
        uniforms: {
            u_time: { value: 0 },
            u_count: { value: 0 },
            u_intensity: { value: 0 }
        },
        vertexShader: AuraMaterial.vertexShader,
        fragmentShader: AuraMaterial.fragmentShader,
        side: THREE.DoubleSide
    }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
            // Smoothly interpolate count for visual effect if needed, but direct assignment is okay
            materialRef.current.uniforms.u_count.value = count;
        }
    });

    return (
        <mesh ref={planeRef} scale={[20, 20, 1]} position={[0, 0, -2]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial ref={materialRef} args={[shaderArgs]} />
        </mesh>
    );
};

export default AuraShader;
