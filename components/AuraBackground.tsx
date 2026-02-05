"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

// Register custom shader material
const AuraShaderMaterial = shaderMaterial(
    {
        u_time: 0,
        u_intensity: 0, // Driven by mic/chant speed
        u_color1: new THREE.Color('#050505'), // Deep Void
        u_color2: new THREE.Color('#220033'), // Deep Indigo
        u_color3: new THREE.Color('#FFD700'), // Gold
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float u_time;
    uniform float u_intensity;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    varying vec2 vUv;

    // Simplex Noise (standard implementation)
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
        // Dynamic turbulent flow
        float time = u_time * (0.2 + u_intensity * 0.5); // Speed up with intensity
        
        // Multi-layered noise for "smoke"
        float n1 = snoise(vUv * 3.0 + vec2(0.0, time));
        float n2 = snoise(vUv * 6.0 - vec2(time * 0.5, 0.0));
        float noise = n1 * 0.5 + n2 * 0.25;
        
        // Circular glow center
        float dist = distance(vUv, vec2(0.5));
        float glow = 1.0 - smoothstep(0.0, 1.2, dist);
        
        // Mix colors
        vec3 bg = mix(u_color1, u_color2, noise + 0.5);
        
        // Add Gold pulse based on intensity
        float goldPulse = smoothstep(0.4, 0.6, noise + glow * 0.5) * u_intensity;
        vec3 finalColor = mix(bg, u_color3, goldPulse);
        
        // Add subtle bloom thresholding
        float brightness = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
        if(brightness > 0.8) finalColor *= 1.5; // Artificial boost for Bloom
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ AuraShaderMaterial });

interface AuraBackgroundProps {
    intensity?: number; // 0 to 1
}

const AuraBackground: React.FC<AuraBackgroundProps> = ({ intensity = 0 }) => {
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.u_time = state.clock.elapsedTime;
            // Smoothly interpolate intensity
            materialRef.current.u_intensity = THREE.MathUtils.lerp(
                materialRef.current.u_intensity,
                intensity,
                0.05
            );
        }
    });

    return (
        <>
            <mesh scale={[100, 100, 1]} position={[0, 0, -10]}>
                <planeGeometry args={[1, 1]} />
                {/* @ts-ignore */}
                <auraShaderMaterial ref={materialRef} />
            </mesh>

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.2}
                    mipmapBlur
                    intensity={1.5 + intensity * 2} // Bloom gets stronger with intensity
                    radius={0.8}
                />
            </EffectComposer>
        </>
    );
};

export default AuraBackground;
