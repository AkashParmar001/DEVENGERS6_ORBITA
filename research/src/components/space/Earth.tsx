'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface EarthProps {
  scale?: number
  rotationSpeed?: number
  className?: string
}

const earthVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const earthFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Simple noise function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Generate procedural landmass
    vec2 uv = vUv * 6.0;
    float landNoise = fbm(uv + vec2(uTime * 0.002, 0.0));
    float landMask = smoothstep(0.42, 0.58, landNoise);

    // Deep ocean color
    vec3 oceanDeep = vec3(0.02, 0.06, 0.18);
    vec3 oceanShallow = vec3(0.04, 0.14, 0.32);

    // Land colors (desert/brown to green)
    vec3 landLow = vec3(0.28, 0.22, 0.12);
    vec3 landMid = vec3(0.18, 0.28, 0.14);
    vec3 landHigh = vec3(0.24, 0.30, 0.18);

    // Ice caps
    float polarMask = smoothstep(0.78, 0.88, abs(vUv.y - 0.5) * 2.0);
    vec3 iceColor = vec3(0.82, 0.88, 0.92);

    // Ocean with depth variation
    float oceanDepth = noise(uv * 3.0);
    vec3 oceanColor = mix(oceanDeep, oceanShallow, oceanDepth * 0.6);

    // Land with elevation variation
    float elevation = fbm(uv * 2.0 + vec2(5.0, 3.0));
    vec3 landColor = mix(landLow, landMid, smoothstep(0.3, 0.6, elevation));
    landColor = mix(landColor, landHigh, smoothstep(0.6, 0.85, elevation));

    // Combine ocean and land
    vec3 surfaceColor = mix(oceanColor, landColor, landMask);

    // Apply ice caps
    surfaceColor = mix(surfaceColor, iceColor, polarMask);

    // Simple lighting
    vec3 lightDir = normalize(vec3(1.0, 0.5, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.15;

    vec3 finalColor = surfaceColor * (ambient + diffuse * 0.85);

    // Subtle specular on ocean
    float specular = pow(max(dot(reflect(-lightDir, vNormal), normalize(-vPosition)), 0.0), 20.0);
    float oceanSpecular = specular * (1.0 - landMask) * 0.3;
    finalColor += vec3(oceanSpecular);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 3.0);

    vec3 atmosphereColor = vec3(0.18, 0.44, 0.72);
    float alpha = fresnel * 0.6;

    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`

const cloudVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv * 4.0;
    float cloudNoise = noise(uv + vec2(uTime * 0.005, uTime * 0.002));
    cloudNoise += noise(uv * 2.0 + vec2(uTime * 0.008, 0.0)) * 0.5;
    cloudNoise = cloudNoise / 1.5;

    float cloudMask = smoothstep(0.45, 0.65, cloudNoise);

    float fresnel = 1.0 - abs(dot(normalize(cameraPosition), vNormal));
    float alpha = cloudMask * 0.45 * (0.6 + fresnel * 0.4);

    gl_FragColor = vec4(vec3(0.92, 0.95, 1.0), alpha);
  }
`

export function Earth({ scale = 1, rotationSpeed = 0.03 }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const earthUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  const cloudUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((_, delta) => {
    const time = performance.now() * 0.001
    earthUniforms.uTime.value = time
    cloudUniforms.uTime.value = time

    if (earthRef.current) {
      earthRef.current.rotation.y += delta * rotationSpeed
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * (rotationSpeed * 1.15)
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Earth surface */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[2, 48, 48]} />
        <shaderMaterial
          vertexShader={cloudVertexShader}
          fragmentShader={cloudFragmentShader}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Atmospheric glow */}
      <mesh ref={atmosphereRef} scale={1.08}>
        <sphereGeometry args={[2, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
