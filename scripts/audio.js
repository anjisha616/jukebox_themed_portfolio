/* ============================================================
   AUDIO.JS — Sound Effects & Background Music Manager
   Generates all sounds programmatically using Web Audio API
   (No external sound files required!)
   ============================================================ */

'use strict';

const AudioManager = (() => {
  let audioCtx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let isMusicPlaying = false;
  let currentMusicSource = null;
  let volume = 0.5;
  let isMuted = false;

  // ─── Initialize Audio Context (must be triggered by user gesture) ───
  function init() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master gain -> destination
      masterGain = audioCtx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(audioCtx.destination);

      // SFX gain -> master
      sfxGain = audioCtx.createGain();
      sfxGain.gain.value = 0.6;
      sfxGain.connect(masterGain);

      // Music gain -> master
      musicGain = audioCtx.createGain();
      musicGain.gain.value = 0.15;
      musicGain.connect(masterGain);

      console.log('[Audio] Initialized successfully');
    } catch (e) {
      console.warn('[Audio] Web Audio API not supported:', e);
    }
  }

  // ─── Resume context if suspended (browser autoplay policy) ───
  function resume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // ─── Set master volume (0-1) ───
  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val));
    if (masterGain) {
      masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
  }

  function getVolume() {
    return volume;
  }

  // ─── Mute / Unmute ───
  function toggleMute() {
    isMuted = !isMuted;
    if (masterGain) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, audioCtx.currentTime);
    }
    return isMuted;
  }

  /* ===========================================================
     SOUND EFFECT GENERATORS
     All sounds are synthesized — no files needed
     =========================================================== */

  // 1. COIN DROP — Metallic clink
  function playCoinDrop() {
    if (!audioCtx) return;
    resume();

    const now = audioCtx.currentTime;

    // High metallic ping
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2800, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1).connect(sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Secondary metallic resonance
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(4200, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.2);
    gain2.gain.setValueAtTime(0.15, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2).connect(sfxGain);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.35);

    // Impact noise burst
    const bufferSize = audioCtx.sampleRate * 0.05;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    const noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 5000;
    bandpass.Q.value = 2;
    
    noiseSrc.connect(bandpass).connect(noiseGain).connect(sfxGain);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.08);
  }

  // 2. BUTTON CLICK — Mechanical chunk
  function playButtonClick() {
    if (!audioCtx) return;
    resume();

    const now = audioCtx.currentTime;

    // Click transient
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain).connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);

    // Mechanical thunk
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.05);
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc2.connect(gain2).connect(sfxGain);
    osc2.start(now);
    osc2.stop(now + 0.08);
  }

  // 3. RECORD SCRATCH — Vinyl texture
  function playRecordScratch() {
    if (!audioCtx) return;
    resume();

    const now = audioCtx.currentTime;
    const duration = 0.25;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioCtx.sampleRate;
      // Filtered noise with pitch sweep
      data[i] = (Math.random() * 2 - 1) * 
                Math.sin(t * 200 * Math.PI) * 
                Math.exp(-t * 8) * 0.4;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    src.connect(filter).connect(gain).connect(sfxGain);
    src.start(now);
    src.stop(now + duration);
  }

  // 4. JUKEBOX MOTOR — Mechanical whirring
  function playMotorStart() {
    if (!audioCtx) return;
    resume();

    const now = audioCtx.currentTime;

    // Low frequency rumble building up
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(30, now);
    osc.frequency.linearRampToValueAtTime(80, now + 1.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.04, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.linearRampToValueAtTime(200, now + 1.5);

    osc.connect(filter).connect(gain).connect(sfxGain);
    osc.start(now);
    osc.stop(now + 2);

    // Mechanical clicking
    for (let i = 0; i < 6; i++) {
      const clickOsc = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.value = 400 + i * 50;
      clickGain.gain.setValueAtTime(0.05, now + 0.2 * i);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 * i + 0.03);
      clickOsc.connect(clickGain).connect(sfxGain);
      clickOsc.start(now + 0.2 * i);
      clickOsc.stop(now + 0.2 * i + 0.03);
    }
  }

  // 5. SELECTION CONFIRMATION — Pleasant ding
  function playConfirmation() {
    if (!audioCtx) return;
    resume();

    const now = audioCtx.currentTime;

    // Two-note pleasant chime
    const notes = [880, 1320]; // A5 and E6 (perfect fifth)
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      osc.connect(gain).connect(sfxGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }

  /* ===========================================================
     BACKGROUND MUSIC GENERATOR
     Procedurally generates a 1950s-style looping groove
     using simple oscillators and patterns
     =========================================================== */

  function startBackgroundMusic() {
    if (!audioCtx || isMusicPlaying) return;
    resume();
    isMusicPlaying = true;

    // Create a simple repeating musical pattern
    const bpm = 130;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;

    // 12-bar blues-inspired progression (root notes)
    const progression = [
      // I  I  I  I   IV  IV  I  I   V   IV  I  V
      196, 196, 196, 196,  261, 261, 196, 196, 294, 261, 196, 294
    ];

    let barIndex = 0;

    function playBar() {
      if (!isMusicPlaying || !audioCtx) return;

      const now = audioCtx.currentTime;
      const root = progression[barIndex % progression.length];

      // Bass line — walking bass pattern
      const bassNotes = [root, root * 1.25, root * 1.5, root * 1.25];
      bassNotes.forEach((note, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = note / 2; // One octave down
        gain.gain.setValueAtTime(0.12, now + i * beatDuration);
        gain.gain.setValueAtTime(0.1, now + i * beatDuration + beatDuration * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * beatDuration - 0.02);
        osc.connect(gain).connect(musicGain);
        osc.start(now + i * beatDuration);
        osc.stop(now + (i + 1) * beatDuration);
      });

      // Simple chord stabs on beats 2 & 4 (swing feel)
      [1, 3].forEach(beat => {
        const chordFreqs = [root, root * 1.25, root * 1.5];
        chordFreqs.forEach(freq => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const startTime = now + beat * beatDuration + beatDuration * 0.15; // Swing offset
          gain.gain.setValueAtTime(0.04, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + beatDuration * 0.4);
          osc.connect(gain).connect(musicGain);
          osc.start(startTime);
          osc.stop(startTime + beatDuration * 0.4);
        });
      });

      // Hi-hat pattern (noise + filter)
      for (let i = 0; i < 8; i++) {
        const bufLen = audioCtx.sampleRate * 0.03;
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < bufLen; j++) {
          d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufLen * 0.2));
        }
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const g = audioCtx.createGain();
        const swingOffset = (i % 2 === 1) ? beatDuration * 0.08 : 0;
        g.gain.setValueAtTime(i % 2 === 0 ? 0.04 : 0.02, now + i * beatDuration * 0.5 + swingOffset);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * beatDuration * 0.5 + swingOffset + 0.04);
        
        const hp = audioCtx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 8000;
        
        src.connect(hp).connect(g).connect(musicGain);
        src.start(now + i * beatDuration * 0.5 + swingOffset);
        src.stop(now + i * beatDuration * 0.5 + swingOffset + 0.04);
      }

      barIndex++;

      // Schedule next bar
      currentMusicSource = setTimeout(playBar, barDuration * 1000);
    }

    playBar();
  }

  function stopBackgroundMusic() {
    isMusicPlaying = false;
    if (currentMusicSource) {
      clearTimeout(currentMusicSource);
      currentMusicSource = null;
    }
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      stopBackgroundMusic();
    } else {
      startBackgroundMusic();
    }
    return isMusicPlaying;
  }

  function isMusicActive() {
    return isMusicPlaying;
  }

  // ─── Public API ───
  return {
    init,
    resume,
    setVolume,
    getVolume,
    toggleMute,
    playCoinDrop,
    playButtonClick,
    playRecordScratch,
    playMotorStart,
    playConfirmation,
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleMusic,
    isMusicActive
  };
})();
