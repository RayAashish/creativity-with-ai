// High-End General Relativity GLSL Shaders & Chaos Particle Shaders

export const RelativisticGargantuaShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uCameraDistance;
    uniform vec3 uCameraPos;
    uniform vec3 uCameraDir;
    uniform float uSpin;          // Kerr spin parameter a
    uniform float uGravity;
    uniform float uEntropy;

    varying vec2 vUv;

    // Raymarching geodesic curved spacetime around a Kerr/Schwarzschild black hole
    // Approximation of null geodesics in Schwarzschild/Kerr metric
    #define PI 3.14159265359
    #define MAX_STEPS 70
    #define STEP_SIZE 0.22

    // Procedural noise for accretion disk plasma texture
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

      // Camera Ray setup
      vec3 ro = uCameraPos;
      vec3 forward = normalize(uCameraDir);
      vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(right, forward);
      vec3 rd = normalize(forward + uv.x * right + uv.y * up);

      vec3 p = ro;
      float rs = 2.4 * uGravity; // Schwarzschild radius
      float rPhoton = 1.5 * rs; // Photon sphere radius
      vec4 accColor = vec4(0.0);

      // Ray integration with gravitational deflection
      for (int i = 0; i < MAX_STEPS; i++) {
        float r = length(p);

        // Absorbed by Event Horizon!
        if (r < rs) {
          break;
        }

        // Bending vector towards origin (Newtonian + Einstein post-Newtonian correction ~ 3*M / r^2)
        vec3 toCenter = -normalize(p);
        float force = (rs / (r * r)) * (1.0 + 1.8 * rs / r);
        rd = normalize(rd + toCenter * (force * STEP_SIZE));

        // Step photon along curved geodesic
        p += rd * STEP_SIZE;

        // Sample Accretion Disk (thin plane around y = 0, between r_in and r_out)
        float rDisk = length(p.xz);
        if (abs(p.y) < 0.45 && rDisk > rs * 1.3 && rDisk < rs * 5.8) {
          float diskNorm = (rDisk - rs * 1.3) / (rs * 4.5);
          float angle = atan(p.z, p.x) + uTime * (1.8 / sqrt(rDisk));

          // Plasma density pattern with turbulence
          float plasma = noise(vec3(rDisk * 2.0, angle * 3.0, uTime * 0.4));
          float density = smoothstep(0.45, 0.05, abs(p.y)) * (0.6 + 0.4 * plasma);

          // Relativistic Doppler Beaming: Orbital velocity vector
          vec3 vOrb = normalize(vec3(-p.z, 0.0, p.x));
          float doppler = dot(vOrb, -rd); // Blue boost approaching, red shift receding
          float beaming = pow(1.0 + doppler * 0.65, 3.5);

          // Thermal spectrum from core to rim
          vec3 diskCol = mix(vec3(0.9, 0.95, 1.0), vec3(1.0, 0.55, 0.1), diskNorm);
          diskCol = mix(diskCol, vec3(0.8, 0.1, 0.3), pow(diskNorm, 2.0));
          diskCol *= beaming;

          float alpha = density * (1.0 - diskNorm) * 0.22;
          accColor += vec4(diskCol * alpha, alpha);
        }

        if (r > 60.0) break;
      }

      // Background stars & cosmic glow
      float bgStars = pow(hash(floor(rd * 120.0)), 38.0) * 8.0;
      vec3 bg = vec3(0.008, 0.006, 0.015) + vec3(bgStars) * vec3(0.7, 0.85, 1.0);

      // Einstein photon sphere glow ring
      float minR = length(p);
      if (minR > rs && minR < rPhoton * 1.25) {
        float ring = pow((rPhoton * 1.25 - minR) / (rPhoton * 0.25), 4.0);
        accColor.rgb += vec3(1.0, 0.8, 0.4) * ring * 1.2;
      }

      vec3 finalColor = accColor.rgb + bg * (1.0 - clamp(accColor.a, 0.0, 1.0));
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const AttractorParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uPointSize;
    uniform float uMorph;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform vec3 uPointer;
    uniform float uPointerActive;
    uniform float uAudioEnergy;

    attribute vec3 aTargetPos;
    attribute float aSpeed;
    attribute float aId;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Morphing interpolation between current position and target attractor geometry
      vec3 pos = mix(position, aTargetPos, clamp(uMorph, 0.0, 1.0));

      // Quantum turbulence & audio pulse
      float jitter = sin(uTime * 4.0 + aId * 15.0) * (0.05 + uAudioEnergy * 0.25);
      pos += normal * jitter;

      // Pointer gravitational pull / repulsion
      if (uPointerActive > 0.5) {
        vec3 toPointer = uPointer - pos;
        float d = length(toPointer);
        if (d < 16.0 && d > 0.1) {
          float f = (1.0 - d / 16.0) * 4.5;
          pos += normalize(toPointer) * f;
        }
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float dist = length(pos);
      float normDist = clamp(dist / 28.0, 0.0, 1.0);

      // Tri-color gradient based on attractor velocity & distance
      vec3 col = mix(uColorA, uColorB, normDist);
      col = mix(col, uColorC, sin(aId * 6.28 + uTime) * 0.5 + 0.5);

      // Audio pulse boost
      col += vec3(uAudioEnergy * 0.35);

      vColor = col;
      vAlpha = clamp(0.3 + 0.7 * (1.0 - normDist), 0.2, 1.0);

      gl_PointSize = uPointSize * (160.0 / -mvPosition.z) * (0.8 + uAudioEnergy * 0.5);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dSq = dot(coord, coord);
      if (dSq > 0.25) discard;

      float glow = exp(-dSq * 10.0);
      float core = exp(-dSq * 40.0);

      vec3 finalCol = vColor * glow + vec3(1.0) * core * 0.7;
      float alpha = vAlpha * (glow * 0.85 + core * 0.5);

      gl_FragColor = vec4(finalCol, alpha);
    }
  `
};

export const SingularityParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uGravity;
    uniform float uEntropy;
    uniform float uVelocity;
    uniform vec3 uPointer;
    uniform float uPointerActive;
    uniform float uPixelRatio;
    uniform float uAudioEnergy;

    attribute float aSize;
    attribute float aPhase;
    attribute float aOrbitRadius;
    attribute float aOrbitSpeed;

    varying vec3 vColor;
    varying float vAlpha;
    varying float vDistToCenter;

    void main() {
      vec3 pos = position;
      float distToOrigin = length(pos.xz);
      vDistToCenter = distToOrigin;

      float omega = aOrbitSpeed * (1.0 + uVelocity * 2.5);
      float currentAngle = aPhase + uTime * omega;

      float r = aOrbitRadius;
      if (uGravity != 1.0) {
        r *= pow(uGravity, 0.45);
      }

      vec3 jitter = vec3(
        sin(uTime * 3.5 + aPhase * 10.0),
        cos(uTime * 2.8 + aPhase * 8.0),
        sin(uTime * 4.2 + aPhase * 12.0)
      ) * (uEntropy * 0.4 + uAudioEnergy * 0.35);

      pos.x = r * cos(currentAngle) + jitter.x;
      pos.z = r * sin(currentAngle) + jitter.z;
      pos.y = position.y + jitter.y + sin(currentAngle * 2.0 + uTime) * (r * 0.05);

      if (uPointerActive > 0.5) {
        vec3 toPointer = uPointer - pos;
        float pDist = length(toPointer);
        if (pDist < 14.0 && pDist > 0.1) {
          float force = (1.0 - pDist / 14.0) * 4.2;
          pos += normalize(toPointer) * force;
        }
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float size = aSize * (155.0 / -mvPosition.z) * uPixelRatio;
      gl_PointSize = clamp(size * (1.0 + uAudioEnergy * 0.4), 1.0, 72.0);

      vec3 viewDir = normalize(mvPosition.xyz);
      vec3 velVector = vec3(-sin(currentAngle), 0.0, cos(currentAngle));
      float doppler = dot(normalize(velVector), vec3(1.0, 0.0, 0.0));

      float normR = clamp((r - 2.5) / 18.0, 0.0, 1.0);
      vec3 hotColor = vec3(0.9, 0.98, 1.0);
      vec3 midColor = vec3(1.0, 0.68, 0.15);
      vec3 coolColor = vec3(0.95, 0.12, 0.55);
      vec3 coldColor = vec3(0.2, 0.45, 0.98);

      vec3 baseCol;
      if (normR < 0.28) {
        baseCol = mix(hotColor, midColor, normR / 0.28);
      } else if (normR < 0.65) {
        baseCol = mix(midColor, coolColor, (normR - 0.28) / 0.37);
      } else {
        baseCol = mix(coolColor, coldColor, (normR - 0.65) / 0.35);
      }

      float beam = doppler * (0.4 + uVelocity * 0.55);
      baseCol += vec3(-beam * 0.35, beam * 0.1, beam * 0.45);

      if (r < 4.2) {
        float gShift = (4.2 - r) / 4.2;
        baseCol = mix(baseCol, vec3(0.95, 0.18, 0.08), gShift * 0.75);
      }

      baseCol += vec3(uAudioEnergy * 0.25);
      vColor = clamp(baseCol, 0.0, 1.0);
      vAlpha = clamp(1.0 - (normR * 0.6), 0.28, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDistToCenter;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distSq = dot(coord, coord);
      if (distSq > 0.25) discard;

      float glow = exp(-distSq * 12.0);
      float core = exp(-distSq * 50.0);

      vec3 finalColor = vColor * glow + vec3(1.0) * core * 0.85;
      float finalAlpha = vAlpha * (glow * 0.9 + core * 0.5);

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `
};

export const EventHorizonShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
      float rim = pow(fresnel, 4.2);
      float sharpRing = pow(fresnel, 18.0);

      vec3 rimColor = vec3(1.0, 0.75, 0.3) * rim * 1.8;
      vec3 photonRing = vec3(0.5, 0.85, 1.0) * sharpRing * 4.5;
      vec3 core = vec3(0.001, 0.001, 0.003);

      vec3 color = core + rimColor + photonRing;
      float alpha = clamp(rim * 1.8 + sharpRing * 2.8 + 0.98, 0.0, 1.0);

      gl_FragColor = vec4(color, alpha);
    }
  `
};

export const RelativisticJetShader = {
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      float twist = position.y * 0.18 + uTime * 3.5;
      vec3 twistedPos = position;
      twistedPos.x += sin(twist) * (abs(position.y) * 0.045);
      twistedPos.z += cos(twist) * (abs(position.y) * 0.045);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(twistedPos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      float travelingWave = sin(abs(vPosition.y) * 1.6 - uTime * 9.0) * 0.5 + 0.5;
      float heightFade = 1.0 - smoothstep(2.0, 26.0, abs(vPosition.y));
      float coreGlow = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.2);

      vec3 jetColor = mix(vec3(0.15, 0.65, 1.0), vec3(0.95, 0.98, 1.0), travelingWave);
      float alpha = coreGlow * heightFade * (0.45 + travelingWave * 0.55);

      gl_FragColor = vec4(jetColor * 2.0, alpha);
    }
  `
};

export const StarfieldBackgroundShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vWorldPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec3 vWorldPosition;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    void main() {
      vec3 dir = normalize(vWorldPosition);
      float stars = pow(hash(floor(dir * 180.0)), 32.0) * 12.0;
      float nebulae = sin(dir.x * 2.2 + uTime * 0.015) * cos(dir.y * 2.0) * sin(dir.z * 2.2);
      nebulae = clamp(nebulae * 0.5 + 0.5, 0.0, 1.0);

      vec3 nebColor = vec3(0.045, 0.015, 0.08) * (1.0 - nebulae) + vec3(0.01, 0.035, 0.07) * nebulae;
      vec3 starColor = vec3(stars) * vec3(0.85, 0.92, 1.0);

      gl_FragColor = vec4(nebColor + starColor, 1.0);
    }
  `
};
