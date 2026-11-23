// 100,000 GPU Particle Neural Mycelium Engine
import * as THREE from 'three';

export function createNeuralMycelium(scene) {
  const count = 100000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  const color1 = new THREE.Color(0x00f3ff); // Cyan
  const color2 = new THREE.Color(0xbf00ff); // Electric Violet
  const color3 = new THREE.Color(0xff0077); // Hot Pink

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Spiral phyllotaxis / Lorenz-like distribution
    const radius = Math.pow(Math.random(), 0.5) * 5.0;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;

    const x = radius * Math.cos(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.sin(theta);

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    const mixRatio = Math.random();
    const c = mixRatio < 0.5 
      ? color1.clone().lerp(color2, mixRatio * 2) 
      : color2.clone().lerp(color3, (mixRatio - 0.5) * 2);

    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom Particle Shader Material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_point_size: { value: 2.5 }
    },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      uniform float u_time;
      uniform float u_point_size;

      void main() {
        vColor = color;
        vec3 p = position;
        // Action potential wave
        float wave = sin(u_time * 3.0 + length(p) * 2.0);
        p += normalize(p) * wave * 0.15;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = u_point_size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = exp(-dist * 4.0);
        gl_FragColor = vec4(vColor * 1.5, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  points.visible = false;
  scene.add(points);

  function update(time, mouse3D) {
    if (!points.visible) return;
    material.uniforms.u_time.value = time;
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < count; i += 3) {
      const i3 = i * 3;
      // Tendril vortex physics
      const x = pos[i3];
      const y = pos[i3 + 1];
      const z = pos[i3 + 2];

      // Gravity pull towards mouse
      const dx = mouse3D.x - x;
      const dy = mouse3D.y - y;
      const dz = mouse3D.z - z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.5;

      pos[i3] += (-z * 0.005 + dx / (d * d * 50.0));
      pos[i3 + 1] += (dy / (d * d * 50.0));
      pos[i3 + 2] += (x * 0.005 + dz / (d * d * 50.0));
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { points, material, update };
}
