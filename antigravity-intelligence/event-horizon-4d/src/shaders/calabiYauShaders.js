// 4D Calabi-Yau String Theory Manifold Raymarching Shader
export const calabiYauVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const calabiYauFragmentShader = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_dim_morph;      // 4D morphing parameter
  uniform float u_hyper_rot;      // 4D hyper-rotation angle
  uniform vec3 u_cam_pos;
  uniform vec3 u_cam_target;

  #define MAX_STEPS 90
  #define SURF_DIST 0.002
  #define MAX_DIST 15.0

  // 4D to 3D Calabi-Yau Cross Section Signed Distance Function
  // Approximates the 6D compactified Kähler manifold z1^n + z2^n = 1
  float calabiYauSDF(vec3 p) {
    // 4D Hyper-rotation
    float theta4 = u_time * 0.4 + u_hyper_rot;
    float c4 = cos(theta4);
    float s4 = sin(theta4);

    // Coordinate projection
    float w = p.z * s4 + 0.5 * sin(u_dim_morph * 3.0);
    vec3 pRot = vec3(p.x * c4 - p.y * s4, p.x * s4 + p.y * c4, p.z * c4 - w * s4);

    float r = length(pRot);
    float phi = atan(pRot.y, pRot.x);
    float theta = acos(clamp(pRot.z / (r + 0.001), -1.0, 1.0));

    // N-fold Calabi-Yau petals
    float n = 5.0 + 2.0 * sin(u_dim_morph * 1.5);
    float modR = 1.0 + 0.35 * sin(n * phi + u_time * 0.5) * cos(3.0 * theta + theta4);
    modR += 0.15 * sin(theta * 6.0) * cos(phi * 4.0);

    // Toroidal / manifold embedding
    float d1 = length(vec2(length(pRot.xy) - 2.2 * modR, pRot.z)) - 0.45;
    float d2 = length(pRot) - 1.2 * modR;

    return mix(d1, d2, 0.4 + 0.3 * sin(u_time * 0.3));
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.002, 0.0);
    return normalize(vec3(
      calabiYauSDF(p + e.xyy) - calabiYauSDF(p - e.xyy),
      calabiYauSDF(p + e.yxy) - calabiYauSDF(p - e.yxy),
      calabiYauSDF(p + e.yyx) - calabiYauSDF(p - e.yyx)
    ));
  }

  // Thin-film Iridescent Color Dispersion (Fresnel rainbow)
  vec3 iridescent(float cosTheta) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * (1.0 - cosTheta) + d));
  }

  void main() {
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    vec3 camPos = u_cam_pos;
    vec3 forward = normalize(u_cam_target - camPos);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);

    vec3 rayDir = normalize(forward * 1.2 + right * st.x + up * st.y);

    float dO = 0.0;
    vec3 col = vec3(0.02, 0.015, 0.04); // Deep quantum vacuum background
    float glow = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = camPos + rayDir * dO;
      float dS = calabiYauSDF(p);

      glow += 0.015 / (abs(dS) * 12.0 + 0.2);

      if (dS < SURF_DIST) {
        vec3 norm = calcNormal(p);
        vec3 lightPos = vec3(4.0, 5.0, 6.0);
        vec3 lightDir = normalize(lightPos - p);

        float diff = max(dot(norm, lightDir), 0.0);
        float fresnel = pow(1.0 - max(dot(-rayDir, norm), 0.0), 3.0);

        vec3 iriColor = iridescent(fresnel);
        vec3 spec = vec3(1.0) * pow(max(dot(reflect(-lightDir, norm), -rayDir), 0.0), 32.0);

        col = mix(iriColor * (diff * 0.8 + 0.2), vec3(0.9, 0.95, 1.0), fresnel * 0.7) + spec;
        break;
      }

      dO += dS;
      if (dO > MAX_DIST) break;
    }

    // Add quantum vacuum glow
    col += vec3(0.15, 0.35, 0.85) * glow;

    // ACES tone mapping
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
  }
`;
