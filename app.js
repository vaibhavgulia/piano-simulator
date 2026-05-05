const { Renderer, Program, Triangle, Mesh } = OGL;

const canvas = document.getElementById('ripple-canvas');
const renderer = new Renderer({ canvas, alpha: true });
const gl = renderer.gl;
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 mousePosition;
uniform float mouseInfluence;
varying vec2 vUv;
float pi = 3.141592;
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;
  float dist = length(uv);
  float func = sin(pi * (iTime - dist));
  vec2 rippleUv = uv + uv * func * 0.05;
  vec2 mouseUv = (mousePosition * 2.0 - 1.0);
  mouseUv.x *= iResolution.x / iResolution.y;
  float mouseDist = length(uv - mouseUv);
  float mWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * mouseInfluence * exp(-mouseDist * mouseDist / 1.0);
  rippleUv += normalize(uv - mouseUv + vec2(0.001)) * mWave * 0.015;
  vec2 a = sin(10.0 * 0.5 * pi * rippleUv - pi / 2.0);
  vec2 b = abs(a);
  vec3 color = vec3(0.0);
  color += exp(-15.0 * b.x);
  color += exp(-15.0 * b.y);
  float fade = exp(-2.0 * clamp(pow(dist, 1.5), 0.0, 1.0));
  float alpha = length(color) * fade * 0.4;
  gl_FragColor = vec4(color * vec3(0.3, 0.5, 1.0) * fade * 0.4, alpha);
}`;

const uniforms = {
  iTime: { value: 0 },
  iResolution: { value: [window.innerWidth, window.innerHeight] },
  mousePosition: { value: [0.5, 0.5] },
  mouseInfluence: { value: 0 }
};

const geometry = new Triangle(gl);
const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
const mesh = new Mesh(gl, { geometry, program });

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.iResolution.value = [window.innerWidth, window.innerHeight];
});
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('mousemove', e => {
  uniforms.mousePosition.value = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
  uniforms.mouseInfluence.value = 1.0;
});

requestAnimationFrame(function render(t) {
  uniforms.iTime.value = t * 0.001;
  uniforms.mouseInfluence.value *= 0.98;
  renderer.render({ scene: mesh });
  requestAnimationFrame(render);
});
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

const notes = [
  { note: 'C4', freq: 261.63, type: 'white', key: 'a' },
  { note: 'D4', freq: 293.66, type: 'white', key: 's' },
  { note: 'E4', freq: 329.63, type: 'white', key: 'd' },
  { note: 'F4', freq: 349.23, type: 'white', key: 'f' },
  { note: 'G4', freq: 392.00, type: 'white', key: 'g' },
  { note: 'A4', freq: 440.00, type: 'white', key: 'h' },
  { note: 'B4', freq: 493.88, type: 'white', key: 'j' },
  { note: 'C#4', freq: 277.18, type: 'black', key: 'w' },
  { note: 'D#4', freq: 311.13, type: 'black', key: 'e' },
  { note: 'F#4', freq: 369.99, type: 'black', key: 't' },
  { note: 'G#4', freq: 415.30, type: 'black', key: 'y' },
  { note: 'A#4', freq: 466.16, type: 'black', key: 'u' },
];

function playNote(freq) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.start();
  osc.stop(ctx.currentTime + 1.5);
}

const keyboard = document.getElementById('keyboard');
const whiteKeys = notes.filter(n => n.type === 'white');
const blackKeys = notes.filter(n => n.type === 'black');
const blackPositions = [0, 1, 3, 4, 5];

whiteKeys.forEach((note, i) => {
  const key = document.createElement('div');
  key.classList.add('key', 'white');
  key.dataset.freq = note.freq;
  key.dataset.key = note.key;
  key.addEventListener('mousedown', () => {
    playNote(note.freq);
    key.classList.add('active');
  });
  key.addEventListener('mouseup', () => key.classList.remove('active'));
  keyboard.appendChild(key);
});

blackKeys.forEach((note, i) => {
  const key = document.createElement('div');
  key.classList.add('key', 'black');
  key.dataset.freq = note.freq;
  key.dataset.key = note.key;
  key.style.left = `${blackPositions[i] * 60 + 42}px`;
  key.addEventListener('mousedown', () => {
    playNote(note.freq);
    key.classList.add('active');
  });
  key.addEventListener('mouseup', () => key.classList.remove('active'));
  keyboard.appendChild(key);
});

document.addEventListener('keydown', e => {
  const note = notes.find(n => n.key === e.key);
  if (note) {
    playNote(note.freq);
    const key = document.querySelector(`[data-key="${e.key}"]`);
    if (key) key.classList.add('active');
  }
});

document.addEventListener('keyup', e => {
  const key = document.querySelector(`[data-key="${e.key}"]`);
  if (key) key.classList.remove('active');
});