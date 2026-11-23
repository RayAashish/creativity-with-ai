// Relativistic Kerr Black Hole with Gravitational Lensing & Doppler Beaming Shader
export const blackHoleVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const blackHoleFragmentShader = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_mass;           // Black hole mass (Schwarzschild radius scale)
  uniform float u_spin;           // Kerr angular spin parameter (a/M)
  uniform float u_disk_density;   // Accretion disk optical density
  uniform float u_doppler;        // Relativistic Doppler beaming intensity
  uniform float u_time_dilation;  // Time flow multiplier
  uniform vec3 u_cam_pos;
  uniform vec3 u_cam_target;
  uniform float u_warp_factor;    // Hyperspace warp stretch factor

  #define PI 3.14159265359
  #define MAX_STEPS 140
  #define STEP_SIZE 0.08
  #define EPSILON 0.005

  // 3D Simplex-like Perlin Noise for Volumetric Accretion Plasma
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; ++i) {
      v += a * noise3D(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  // Deep Space Procedural Starfield & Cosmic Nebula
  vec3 getBackgroundCosmos(vec3 rayDir) {
    // Warp streak effect during hyperjump
    vec3 dir = normalize(mix(rayDir, vec3(0.0, 0.0, -1.0), u_warp_factor * 0.6));
    
    // Star grid
    vec3 p = dir * 250.0;
    float n = hash(floor(p));
    float star = 0.0;
    if (n > 0.985) {
      float brightness = fract(n * 43758.5453);
      star = pow(brightness, 18.0) * (0.8 + 0.5 * sin(u_time * 2.0 + n * 20.0));
    }

    // Interstellar Nebula Dust (Galactic plane)
    float neb1 = fbm(dir * 2.5 + vec3(0.0, 0.1 * u_time, 0.0));
    float neb2 = fbm(dir * 5.0 - vec3(0.1 * u_time, 0.0, 0.0));
    vec3 nebColor = mix(vec3(0.05, 0.02, 0.12), vec3(0.08, 0.15, 0.35), neb1);
    nebColor += vec3(0.15, 0.05, 0.1) * pow(neb2, 2.5);

    return nebColor + vec3(star * 1.5, star * 1.4, star * 1.8);
  }

  void main() {
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Setup Camera Rays
    vec3 camPos = u_cam_pos;
    vec3 forward = normalize(u_cam_target - camPos);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);

    float fov = 1.05;
    vec3 rayDir = normalize(forward * fov + right * st.x + up * st.y);

    // Relativistic Parameters
    float rs = u_mass;                   // Event horizon radius (Schwarzschild radius)
    float r_photon = 1.5 * rs;           // Photon sphere
    float r_isco = 3.0 * rs * (1.0 - 0.45 * u_spin); // Innermost Stable Circular Orbit
    float r_disk_out = 9.5 * rs;         // Outer disk limit

    vec3 currentPos = camPos;
    vec3 currentDir = rayDir;
    vec3 totalColor = vec3(0.0);
    float transmittance = 1.0;

    // Relativistic Raymarching Loop (curved null geodesics in Schwarzschild/Kerr spacetime)
    for (int i = 0; i < MAX_STEPS; i++) {
      float r = length(currentPos);

      // 1. Check if ray entered Event Horizon (Singularity shadow)
      if (r < rs) {
        // Trapped inside black hole event horizon
        totalColor = mix(totalColor, vec3(0.0), 1.0);
        transmittance = 0.0;
        break;
      }

      // 2. Gravitational Deflection (Geodesic Acceleration)
      // Light ray bends inward toward black hole center: dV = - (1.5 * rs / r^2) * normalize(pos)
      float deflectionForce = (1.5 * rs) / (r * r + 0.001);
      currentDir = normalize(currentDir - (currentPos / r) * deflectionForce * STEP_SIZE);

      // Adaptive step size: smaller near horizon, larger in flat spacetime
      float h = max(STEP_SIZE * (r / (2.0 * rs)), 0.025);

      // Check if ray crosses the thin accretion disk plane (Y = 0)
      float nextY = currentPos.y + currentDir.y * h;
      if (currentPos.y * nextY <= 0.0) {
        // Ray crossed equatorial accretion disk plane!
        float tDisk = -currentPos.y / currentDir.y;
        vec3 diskPos = currentPos + currentDir * tDisk;
        float rDisk = length(diskPos.xz);

        if (rDisk > r_isco && rDisk < r_disk_out) {
          // Normalize disk radius coordinate
          float normR = (rDisk - r_isco) / (r_disk_out - r_isco);

          // Keplerian Orbital Velocity (v/c proportional to 1/sqrt(r))
          float orbitalSpeed = sqrt(rs / (2.0 * rDisk)) * (0.8 + 0.2 * u_spin);

          // Tangential orbital velocity vector in XZ plane
          vec3 vOrbital = normalize(vec3(-diskPos.z, 0.0, diskPos.x)) * orbitalSpeed;

          // Relativistic Doppler Beaming Factor: D = 1 / (gamma * (1 - beta * cos(theta)))
          float cosAngle = dot(normalize(vOrbital), -currentDir);
          float gamma = 1.0 / sqrt(max(0.01, 1.0 - orbitalSpeed * orbitalSpeed));
          float dopplerFactor = 1.0 / (gamma * max(0.05, (1.0 - orbitalSpeed * cosAngle)));
          dopplerFactor = pow(dopplerFactor, 2.5 * u_doppler);

          // Gravitational Redshift near horizon
          float gravRedshift = sqrt(max(0.001, 1.0 - rs / rDisk));

          // Plasma Texture & Swirl Animation
          float angle = atan(diskPos.z, diskPos.x);
          float swirlTime = u_time * (0.8 * u_time_dilation) * (1.0 / (rDisk * 0.4 + 0.1));
          vec3 sampleCoord = vec3(rDisk * 1.5, angle * 2.5 + swirlTime, diskPos.y * 5.0);
          float plasmaNoise = fbm(sampleCoord);

          // Radial temperature gradient: hottest at ISCO (~10^7 K, blue-white), cooler outside (orange/red)
          vec3 hotColor = vec3(0.85, 0.95, 1.2);    // Blueshifted hot core
          vec3 midColor = vec3(1.1, 0.65, 0.15);    // Intermediate golden-orange
          vec3 coolColor = vec3(0.9, 0.15, 0.02);   // Outer reddish cooling rim

          vec3 diskBaseColor = mix(hotColor, midColor, smoothstep(0.0, 0.35, normR));
          diskBaseColor = mix(diskBaseColor, coolColor, smoothstep(0.35, 1.0, normR));

          // Apply Doppler Beaming: Approaching side glows blinding blue-white, receding side redshifts to amber
          vec3 boostedColor = diskBaseColor * dopplerFactor * gravRedshift;
          if (dopplerFactor > 1.2) {
            boostedColor = mix(boostedColor, vec3(0.9, 1.1, 1.5) * dopplerFactor, 0.4);
          } else {
            boostedColor *= vec3(1.1, 0.8, 0.6);
          }

          float diskAlpha = smoothstep(r_isco, r_isco + 0.35 * rs, rDisk) *
                            smoothstep(r_disk_out, r_disk_out - 1.2 * rs, rDisk) *
                            (0.4 + 0.6 * plasmaNoise) * u_disk_density;

          totalColor += boostedColor * diskAlpha * transmittance * 2.2;
          transmittance *= max(0.0, 1.0 - diskAlpha * 0.9);

          if (transmittance < 0.02) break;
        }
      }

      // 3. Volumetric Polar Relativistic Magnetic Jets
      float rCyl = length(currentPos.xz);
      float hJet = abs(currentPos.y);
      if (hJet > rs * 0.8 && hJet < 12.0 * rs && rCyl < (0.15 * hJet + 0.25 * rs)) {
        float jetNoise = fbm(vec3(currentPos.xz * 3.0, currentPos.y * 0.8 - u_time * 3.0));
        float jetIntensity = exp(-rCyl * 2.5 / (0.2 * hJet + 0.1)) * (0.6 + 0.4 * jetNoise);
        vec3 jetColor = mix(vec3(0.2, 0.5, 1.0), vec3(0.8, 0.9, 1.2), hJet / 8.0);
        totalColor += jetColor * jetIntensity * 0.04 * transmittance;
      }

      currentPos += currentDir * h;

      // Escape check: ray is distant and heading away from origin
      if (r > 20.0 * rs && dot(currentPos, currentDir) > 0.0) {
        break;
      }
    }

    // 4. Background Starfield Lensed by Curved Spacetime
    if (transmittance > 0.01) {
      vec3 bgCosmos = getBackgroundCosmos(currentDir);
      totalColor += bgCosmos * transmittance;
    }

    // Relativistic Photon Ring Highlight (sharp glowing halo around black hole shadow)
    float minImpactParam = length(cross(camPos, rayDir));
    float photonRing = exp(-pow(abs(minImpactParam - 2.6 * rs), 2.0) * 12.0);
    totalColor += vec3(1.2, 0.9, 0.6) * photonRing * 0.8;

    // ACES Film Tone Mapping & Gamma Correction
    vec3 mapped = (totalColor * (2.51 * totalColor + 0.03)) / (totalColor * (2.43 * totalColor + 0.59) + 0.14);
    mapped = pow(clamp(mapped, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(mapped, 1.0);
  }
`;
