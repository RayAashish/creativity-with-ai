// Custom GLSL Shaders for the Antigravity Singularity & Cosmic Particles

export const SingularityParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uGravity;
    uniform float uEntropy;
    uniform float uVelocity;
    uniform vec3 uPointer;
    uniform float uPointerActive;
    uniform float uPixelRatio;

    attribute float aSize;
    attribute float aPhase;
    attribute float aOrbitRadius;
    attribute float aOrbitSpeed;
    attribute vec3 aOriginalPos;

    varying vec3 vColor;
    varying float vAlpha;
    varying float vDistToCenter;

    // Relativistic Doppler & Keplerian velocity
    void main() {
      vec3 pos = position;
      float distToOrigin = length(pos.xz);
      vDistToCenter = distToOrigin;

      // Keplerian angular velocity: omega proportional to r^(-1.5)
      float omega = aOrbitSpeed * (1.0 + uVelocity * 2.0);
      float currentAngle = aPhase + uTime * omega;

      // Recompute orbital position with gravitational perturbations
      float r = aOrbitRadius;
      if (uGravity != 1.0) {
        r *= pow(uGravity, 0.4);
      }

      // Add entropy chaos / thermal jitter
      vec3 jitter = vec3(
        sin(uTime * 3.0 + aPhase * 10.0),
        cos(uTime * 2.5 + aPhase * 8.0),
        sin(uTime * 4.0 + aPhase * 12.0)
      ) * (uEntropy * 0.35);

      pos.x = r * cos(currentAngle) + jitter.x;
      pos.z = r * sin(currentAngle) + jitter.z;
      pos.y = position.y + jitter.y + sin(currentAngle * 2.0 + uTime) * (r * 0.04);

      // Interactive Pointer tidal forces (Graviton nexus)
      if (uPointerActive > 0.5) {
        vec3 toPointer = uPointer - pos;
        float pDist = length(toPointer);
        if (pDist < 12.0 && pDist > 0.1) {
          float force = (1.0 - pDist / 12.0) * 3.5;
          // Warp towards or away from cursor
          pos += normalize(toPointer) * force;
        }
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Point size with perspective attenuation & pixel ratio
      float size = aSize * (150.0 / -mvPosition.z) * uPixelRatio;
      gl_PointSize = clamp(size, 1.0, 64.0);

      // Color computation: Doppler shift & temperature gradient
      // Particles moving towards viewer (in view space) get blueshifted, receding get redshifted
      vec3 viewDir = normalize(mvPosition.xyz);
      vec3 velVector = vec3(-sin(currentAngle), 0.0, cos(currentAngle));
      float doppler = dot(normalize(velVector), vec3(1.0, 0.0, 0.0));

      // Thermal gradient: core = electric cyan/white, middle = gold/amber, outer = deep magenta/violet
      float normR = clamp((r - 2.5) / 18.0, 0.0, 1.0);
      vec3 hotColor = vec3(0.85, 0.95, 1.0);       // Ultra-hot inner disk
      vec3 midColor = vec3(1.0, 0.65, 0.2);        // Glowing accretion gold
      vec3 coolColor = vec3(0.9, 0.15, 0.5);       // Relativistic rim magenta
      vec3 coldColor = vec3(0.2, 0.4, 0.95);       // Ethereal outer blue

      vec3 baseCol;
      if (normR < 0.3) {
        baseCol = mix(hotColor, midColor, normR / 0.3);
      } else if (normR < 0.7) {
        baseCol = mix(midColor, coolColor, (normR - 0.3) / 0.4);
      } else {
        baseCol = mix(coolColor, coldColor, (normR - 0.7) / 0.3);
      }

      // Apply Doppler beaming (blue boost on approaching side, red shift on receding side)
      float beam = doppler * (0.35 + uVelocity * 0.45);
      baseCol += vec3(-beam * 0.3, 0.0, beam * 0.4);

      // Gravitational redshift near event horizon
      if (r < 4.0) {
        float gShift = (4.0 - r) / 4.0;
        baseCol = mix(baseCol, vec3(0.95, 0.2, 0.1), gShift * 0.7);
      }

      vColor = clamp(baseCol, 0.0, 1.0);
      vAlpha = clamp(1.0 - (normR * 0.65), 0.25, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDistToCenter;

    void main() {
      // Soft radial circular particle with gaussian core
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distSq = dot(coord, coord);
      if (distSq > 0.25) discard;

      // Volumetric glow profile
      float glow = exp(-distSq * 12.0);
      float core = exp(-distSq * 45.0);

      vec3 finalColor = vColor * glow + vec3(1.0) * core * 0.8;
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

      // Fresnel rim lighting (Einstein ring / photon sphere lensing)
      float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
      float rim = pow(fresnel, 4.5);
      float sharpRing = pow(fresnel, 16.0);

      // Deep void black hole core + brilliant incandescent rim
      vec3 rimColor = vec3(1.0, 0.8, 0.4) * rim * 1.5;
      vec3 photonRing = vec3(0.5, 0.8, 1.0) * sharpRing * 4.0;
      vec3 core = vec3(0.002, 0.002, 0.005); // Absolute black absorbing all light

      vec3 color = core + rimColor + photonRing;
      float alpha = clamp(rim * 1.8 + sharpRing * 2.5 + 0.98, 0.0, 1.0);

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
      // Slight magnetic corkscrew twist
      float twist = position.y * 0.15 + uTime * 3.0;
      vec3 twistedPos = position;
      twistedPos.x += sin(twist) * (abs(position.y) * 0.04);
      twistedPos.z += cos(twist) * (abs(position.y) * 0.04);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(twistedPos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      // Traveling shock knots along jet length
      float travelingWave = sin(abs(vPosition.y) * 1.5 - uTime * 8.0) * 0.5 + 0.5;
      float heightFade = 1.0 - smoothstep(2.0, 25.0, abs(vPosition.y));
      float coreGlow = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0);

      vec3 jetColor = mix(vec3(0.2, 0.6, 1.0), vec3(0.9, 0.95, 1.0), travelingWave);
      float alpha = coreGlow * heightFade * (0.4 + travelingWave * 0.5);

      gl_FragColor = vec4(jetColor * 1.8, alpha);
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
    uniform vec3 uSingularityPos;
    varying vec3 vWorldPosition;

    // Pseudo-random hash
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    void main() {
      vec3 dir = normalize(vWorldPosition);
      
      // Cosmic background dust & stellar density
      float stars = pow(hash(floor(dir * 180.0)), 32.0) * 12.0;
      float nebulae = sin(dir.x * 2.0 + uTime * 0.02) * cos(dir.y * 2.0) * sin(dir.z * 2.0);
      nebulae = clamp(nebulae * 0.5 + 0.5, 0.0, 1.0);

      vec3 nebColor = vec3(0.04, 0.015, 0.07) * (1.0 - nebulae) + vec3(0.01, 0.03, 0.06) * nebulae;
      vec3 starColor = vec3(stars) * vec3(0.8, 0.9, 1.0);

      gl_FragColor = vec4(nebColor + starColor, 1.0);
    }
  `
};
