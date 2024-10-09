// Inizializza il contesto audio
let audioContext;

// Funzione per inizializzare l'audio (deve essere chiamata da un'interazione utente)
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Funzione per creare un oscillatore (per TB-303)
function createTB303Sound(frequency, cutoff, resonance, envMod) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, audioContext.currentTime);
    filter.Q.setValueAtTime(resonance, audioContext.currentTime);

    const envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Funzione per creare suoni di batteria
function createDrumSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;
    
    switch(type) {
        case 'kick':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
            gainNode.gain.setValueAtTime(1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            break;
        case 'snare':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(100, now);
            gainNode.gain.setValueAtTime(1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            
            // Aggiunge rumore bianco per il caratteristico suono dello snare
            const noise = audioContext.createBufferSource();
            const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseBuffer.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            noise.buffer = noiseBuffer;
            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(1, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            noise.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            noise.start(now);
            break;
        case 'hihat':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            break;
        case 'clap':
            const fundamental = 600;
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(fundamental, now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            // Aggiunge più oscillatori per un suono più ricco
            for (let i = 1; i <= 3; i++) {
                const osc = audioContext.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(fundamental * (1 + i * 0.5), now);
                osc.connect(gainNode);
                osc.start(now);
                osc.stop(now + 0.1);
            }
            break;
        case 'cowbell':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, now);
            const osc2 = audioContext.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(540, now);
            osc2.connect(gainNode);
            osc2.start(now);
            osc2.stop(now + 0.1);
            gainNode.gain.setValueAtTime(0.7, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            break;
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
}

// Event Listeners
document.getElementById('playButton').addEventListener('click', () => {
    initAudio();
    console.log('Play');
    // Implementa la logica di riproduzione
});

document.getElementById('stopButton').addEventListener('click', () => {
    console.log('Stop');
    // Implementa la logica di stop
});

document.querySelectorAll('.button[data-sound]').forEach(button => {
    button.addEventListener('click', () => {
        initAudio();
        createDrumSound(button.dataset.sound);
    });
});

document.getElementById('tempoSlider').addEventListener('input', (e) => {
    const tempo = e.target.value;
    document.getElementById('tempoDisplay').textContent = `${tempo} BPM`;
    // Implementa la logica per cambiare il tempo
});

// TB-303 controls
document.querySelector('.button[data-action="play303"]').addEventListener('click', () => {
    initAudio();
    const frequency = 440; // La4
    const cutoff = 1000;
    const resonance = 10;
    const envMod = 0.5;
    createTB303Sound(frequency, cutoff, resonance, envMod);
});

// Implementa la logica per i knob e gli altri controlli