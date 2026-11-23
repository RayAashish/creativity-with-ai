// Quantum Foam 3D Mandelbulb Fractal Raymarching Shader
export const mandelbulbVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const mandelbulbFragmentShader = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_power;         // Mandelbulb fractal power (e.g. 7.0 - 9.0)
  uniform vec3 u_cam_pos;
  uniform vec3 u_cam_target;

  #define MAX_STEPS 85
  #define SURF_DIST 0.002
  #define MAX_DIST 14.0

  // 3D Mandelbulb Signed Distance Function with Orbit Trap
  float mandelbulbSDF(vec3 p, out float trap) {
    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;
    float power = u_power + 0.6 * sin(u_time * 0.25);
    trap = 1e10;

    for (int i = 0; i < 7; i++) {
      r = length(z);
      if (r > 3.5) break;

      trap = min(trap, length(z));

      // Convert to spherical coordinates
      float theta = acos(clamp(z.z / (r + 0.0001), -1.0, 1.0));
      float phi = atan(z.y, z.x);
      dr = pow(r, power - 1.0) * power * dr + 1.0;

      // Scale and rotate
      float zr = pow(r, power);
      theta = theta * power;
      phi = phi * power;

      // Convert back to cartesian coordinates
      z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
      z += p;
    }

    return 0.5 * log(r) * r / dr;
  }

  vec3 calcNormal(vec3 p) {
    float dummy;
    vec2 e = vec2(0.002, 0.0);
    return normalize(vec3(
      mandelbulbSDF(p + e.xyy, dummy) - mandelbulbSDF(p - e.xyy, dummy),
      mandelbulbSDF(p + e.yxy, dummy) - mandelbulbSDF(p - e.yxy, dummy),
      mandelbulbSDF(p + e.yyx, dummy) - mandelbulbSDF(p - e.yyx, dummy)
    ));
  }

  void main() {
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    vec3 camPos = u_cam_pos;
    vec3 forward = normalize(u_cam_target - camPos);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);

    vec3 rayDir = normalize(forward * 1.15 + right * st.x + up * st.y);

    float dO = 0.0;
    vec3 col = vec3(0.01, 0.015, 0.03); // Deep cosmic void
    float glow = 0.0;
    float finalTrap = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = camPos + rayDir * dO;
      float trap;
      float dS = mandelbulbSDF(p, trap);

      glow += 0.012 / (abs(dS) * 10.0 + 0.15);

      if (dS < SURF_DIST) {
        finalTrap = trap;
        vec3 norm = calcNormal(p);
        vec3 lightDir = normalize(vec3(2.5, 4.0, 3.0));

        float diff = max(dot(norm, lightDir), 0.0);
        float fresnel = pow(1.0 - max(dot(-rayDir, norm), 0.0), 2.5);

        // Palette based on orbit trap
        vec3 c1 = vec3(0.1, 0.8, 0.9);   // Cyan plasma
        vec3 c2 = vec3(0.9, 0.2, 0.6);   // Magenta quantum excitation
        vec3 c3 = vec3(1.0, 0.8, 0.2);   // Solar gold

        vec3 fractalCol = mix(c1, c2, clamp(finalTrap * 1.5, 0.0, 1.0));
        fractalCol = mix(fractalCol, c3, fresnel);

        col = fractalCol * (diff * 0.75 + 0.25) + vec3(0.8, 0.9, 1.0) * pow(max(dot(reflect(-lightDir, norm), -rayDir), 0.0), 16.0);
        break;
      }

      dO += dS;
      if (dO > MAX_DIST) break;
    }

    col += vec3(0.4, 0.2, 0.9) * glow;

    // ACES tone mapping
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
  }
`;
