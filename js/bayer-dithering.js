import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Vertex shader
const vertexShader = `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader — dot grid with interactive ripples
const fragmentShader = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;

const int MAX_CLICKS = 10;
uniform vec2  uClickPos[MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

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

float fbm(vec2 uv, float t) {
    vec3 p = vec3(uv * 2.5, t);
    return (vnoise(p) * 0.5 + vnoise(p * 2.) * 0.25 + vnoise(p * 4.) * 0.125) * 0.5 + 0.5;
}

void main() {
    vec2 fc = gl_FragCoord.xy;
    const float gridSize = 24.0;

    // Nearest grid point
    vec2 gridPoint = (floor(fc / gridSize) + 0.5) * gridSize;
    float dist = length(fc - gridPoint);

    // Subtle FBM breathing of dot radius
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = gridPoint / uResolution * vec2(aspect, 1.0);
    float noise = fbm(uv, uTime * 0.025);
    float radius = 1.0 + noise * 0.7;   // 1.0 – 1.7 px base radius

    // Ripple: wave expands dot radius as it passes each grid point
    for (int i = 0; i < MAX_CLICKS; i++) {
        vec2 pos = uClickPos[i];
        if (pos.x < 0.0) continue;
        float t    = max(uTime - uClickTimes[i], 0.0);
        float waveR = 320.0 * t;                              // px/s expansion
        float r     = length(gridPoint - pos);
        float ring  = exp(-pow((r - waveR) / (gridSize * 2.0), 2.0));
        float atten = exp(-0.9 * t);
        radius += ring * atten * 6.0;
    }

    float alpha = 1.0 - smoothstep(radius - 0.5, radius + 0.5, dist);
    fragColor = vec4(uColor, alpha);
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
        const MAX_CLICKS = 10;
        const uniforms = {
            uResolution: { value: new THREE.Vector2() },
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#e8e8ff') }, // Very subtle light purple squares on white
            uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
            uClickTimes: { value: new Float32Array(MAX_CLICKS) },
            uPixelSize: { value: 3 }, // Smaller pixels for more subtle effect
        };

        // Expose uniforms so theme-toggle can update colors
        window.ditheringUniforms = uniforms;

        // Match saved theme (module loads after ThemeManager)
        const savedTheme = localStorage.getItem('uxfolio-theme');
        if (savedTheme === 'dark') {
            uniforms.uColor.value.setStyle('#222233');
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

        // Resize handler
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h, false);
            uniforms.uResolution.value.set(w, h);
        };
        window.addEventListener('resize', resize);
        resize();

        // Click ripple — listen on document so content stays interactive
        let clickIx = 0;
        const fireRipple = (x, y) => {
            const fx = x * (canvas.width / window.innerWidth);
            const fy = (window.innerHeight - y) * (canvas.height / window.innerHeight);
            uniforms.uClickPos.value[clickIx].set(fx, fy);
            uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
            clickIx = (clickIx + 1) % MAX_CLICKS;
        };

        document.addEventListener('pointerdown', e => fireRipple(e.clientX, e.clientY));

        // Subtle mousemove ripples above the fold to hint interactivity
        let lastMoveRipple = 0;
        document.addEventListener('mousemove', e => {
            if (e.clientY > window.innerHeight) return; // only above fold
            const now = uniforms.uTime.value;
            if (now - lastMoveRipple > 1.2) { // throttle: one ripple per 1.2s
                lastMoveRipple = now;
                fireRipple(e.clientX, e.clientY);
            }
        });

        // Animation loop
        const clock = new THREE.Clock();
        (function animate() {
            uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        })();
    }
}
