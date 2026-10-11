import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Vertex shader
const vertexShader = `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader — quiet dot grid: slow tonal drift, a clearing behind the
// headline, a soft halo under the cursor and a faint ripple on click
const fragmentShader = `
precision highp float;

uniform vec3  uColor;
uniform vec3  uInk;
uniform vec2  uResolution;      // CSS px
uniform float uDpr;
uniform float uTime;
uniform vec2  uPointer;         // CSS px, origin bottom-left
uniform float uPointerStrength;
uniform vec4  uQuiet;           // xy = centre, zw = radii (CSS px)

const int MAX_CLICKS = 4;
uniform vec2  uClickPos[MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];
uniform vec3  uClickColor[MAX_CLICKS];

out vec4 fragColor;

float hash11(float n) { return fract(sin(n) * 43758.5453); }

float vnoise(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);
    float n000 = hash11(dot(ip,                vec3(1.,57.,113.)));
    float n100 = hash11(dot(ip + vec3(1,0,0),  vec3(1.,57.,113.)));
    float n010 = hash11(dot(ip + vec3(0,1,0),  vec3(1.,57.,113.)));
    float n110 = hash11(dot(ip + vec3(1,1,0),  vec3(1.,57.,113.)));
    float n001 = hash11(dot(ip + vec3(0,0,1),  vec3(1.,57.,113.)));
    float n101 = hash11(dot(ip + vec3(1,0,1),  vec3(1.,57.,113.)));
    float n011 = hash11(dot(ip + vec3(0,1,1),  vec3(1.,57.,113.)));
    float n111 = hash11(dot(ip + vec3(1,1,1),  vec3(1.,57.,113.)));
    vec3 w = fp * fp * fp * (fp * (fp * 6. - 15.) + 10.);
    return mix(
        mix(mix(n000, n100, w.x), mix(n010, n110, w.x), w.y),
        mix(mix(n001, n101, w.x), mix(n011, n111, w.x), w.y),
        w.z) * 2. - 1.;
}

void main() {
    vec2 fc = gl_FragCoord.xy / uDpr;
    const float gridSize = 24.0;

    // Nearest grid point
    vec2 gridPoint = (floor(fc / gridSize) + 0.5) * gridSize;
    float dist = length(fc - gridPoint);

    // Slow, large-scale drift: dots fade in and out of the paper rather than pulse
    vec3 np = vec3(gridPoint / uResolution.y * 1.6, uTime * 0.03);
    float drift = (vnoise(np) * 0.65 + vnoise(np * 2.3) * 0.35) * 0.5 + 0.5;
    float radius   = 0.9 + drift * 0.45;
    float strength = 0.5 + drift * 0.5;

    // Clearing behind the headline so the copy sits on clean paper
    float quiet = smoothstep(0.55, 1.2, length((gridPoint - uQuiet.xy) / uQuiet.zw));
    strength *= mix(0.08, 1.0, quiet);

    // Cursor halo: nearby dots swell slightly and take on ink
    float halo = exp(-pow(length(gridPoint - uPointer) / 140.0, 2.0)) * uPointerStrength;
    halo *= mix(0.25, 1.0, quiet);
    radius   += halo * 1.1;
    strength += halo * 0.5;

    // Click ripple: a single thin, short-lived ring that tints the dots it passes.
    // Each dot takes the colour to a different degree so the ring reads as scattered.
    float jitter = hash11(dot(gridPoint, vec2(12.9898, 78.233)));
    vec3  tint   = vec3(0.0);
    float tintW  = 0.0;
    for (int i = 0; i < MAX_CLICKS; i++) {
        vec2 pos = uClickPos[i];
        if (pos.x < 0.0) continue;
        float t     = max(uTime - uClickTimes[i], 0.0);
        float waveR = 260.0 * t;
        float r     = length(gridPoint - pos);
        float ring  = exp(-pow((r - waveR) / (gridSize * 1.6), 2.0));
        float atten = exp(-1.5 * t);
        float w     = ring * atten;
        radius   += w * mix(0.6, 2.4, jitter);
        strength += w * 0.6;
        tint     += uClickColor[i] * w * jitter;
        tintW    += w * jitter;
    }

    float alpha = 1.0 - smoothstep(radius - 0.5, radius + 0.5, dist);
    vec3 color = mix(uColor, uInk, halo);
    color = mix(color, tint / max(tintW, 1e-4), clamp(tintW * 2.5, 0.0, 0.9));
    fragColor = vec4(color, alpha * clamp(strength, 0.0, 1.0));
}
`;

// Initialize
const bg = document.getElementById('dithering-canvas');
if (!bg) {
    console.error('Canvas container not found');
} else {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        console.error('WebGL2 not supported');
    } else {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            context: gl,
            antialias: true,
            alpha: true
        });

        // Uniforms
        const MAX_CLICKS = 4;
        const INK = { light: '#bdbaa8', dark: '#5c5c85' };
        const RIPPLE_COLORS = ['#c8553d', '#d9a441', '#6f9a7e', '#4a6fa5', '#8a5a83']; // terracotta, ochre, sage, blue, plum
        const uniforms = {
            uResolution: { value: new THREE.Vector2() },
            uDpr: { value: 1 },
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#dedcd0') },
            uInk: { value: new THREE.Color(INK.light) },
            uPointer: { value: new THREE.Vector2(-9999, -9999) },
            uPointerStrength: { value: 0 },
            uQuiet: { value: new THREE.Vector4(-9999, -9999, 1, 1) },
            uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
            uClickTimes: { value: new Float32Array(MAX_CLICKS) },
            uClickColor: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Color()) },
        };

        // Expose uniforms so theme-toggle can update colors
        window.ditheringUniforms = uniforms;

        // Match saved theme (module loads after ThemeManager)
        const savedTheme = localStorage.getItem('uxfolio-theme');
        if (savedTheme === 'dark') {
            uniforms.uColor.value.setStyle('#2e2e44');
        }

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            glslVersion: THREE.GLSL3,
            transparent: true,
        });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

        bg.appendChild(canvas);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Keep the clearing centred on the hero copy as the page scrolls
        const hero = document.querySelector('.content > section .container');
        const updateQuiet = () => {
            if (!hero) return;
            const r = hero.getBoundingClientRect();
            uniforms.uQuiet.value.set(
                r.left + r.width / 2,
                window.innerHeight - (r.top + r.height / 2),
                Math.min(r.width, 900) * 0.52,
                r.height * 0.8
            );
        };

        // Resize handler
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
            uniforms.uResolution.value.set(w, h);
            uniforms.uDpr.value = dpr;
            updateQuiet();
        };
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', updateQuiet, { passive: true });
        resize();

        // Click ripple — listen on document so content stays interactive
        let clickIx = 0;
        let colorIx = -1;
        document.addEventListener('pointerdown', e => {
            if (reducedMotion.matches) return;
            uniforms.uClickPos.value[clickIx].set(e.clientX, window.innerHeight - e.clientY);
            uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
            // random colour, never the same twice in a row
            colorIx = (colorIx + 1 + Math.floor(Math.random() * (RIPPLE_COLORS.length - 1))) % RIPPLE_COLORS.length;
            uniforms.uClickColor.value[clickIx].setStyle(RIPPLE_COLORS[colorIx]);
            clickIx = (clickIx + 1) % MAX_CLICKS;
        });

        // Cursor halo — eased towards the pointer, fades out when it rests or leaves
        const pointerTarget = new THREE.Vector2(-9999, -9999);
        let lastMove = -Infinity;
        document.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            pointerTarget.set(e.clientX, window.innerHeight - e.clientY);
            if (uniforms.uPointerStrength.value < 0.01) uniforms.uPointer.value.copy(pointerTarget);
            lastMove = performance.now();
        });
        document.documentElement.addEventListener('pointerleave', () => { lastMove = -Infinity; });

        // Animation loop
        const clock = new THREE.Clock();
        (function animate() {
            requestAnimationFrame(animate);
            if (bg.style.opacity === '0') return; // faded out below the hero

            const dt = Math.min(clock.getDelta(), 0.1);
            if (!reducedMotion.matches) uniforms.uTime.value += dt;

            const active = !reducedMotion.matches && performance.now() - lastMove < 1800;
            const k = 1 - Math.exp(-dt * (active ? 6 : 1.5));
            uniforms.uPointerStrength.value += ((active ? 1 : 0) - uniforms.uPointerStrength.value) * k;
            uniforms.uPointer.value.lerp(pointerTarget, 1 - Math.exp(-dt * 9));

            const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
            uniforms.uInk.value.setStyle(dark ? INK.dark : INK.light);

            renderer.render(scene, camera);
        })();
    }
}
