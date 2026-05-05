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