export const PITCH_GAME_DURATION = 120;
export const PITCH_GAME_RESULTS_KEY = "pitchGameResults";

export type Pitch = {
    name: string;
    label: string;
    frequency: number;
    accidental: boolean;
};

export type PitchAttempt = {
    expected: string;
    selected: string;
    correct: boolean;
    solveTime: number;
    elapsedTime: number;
    orderNumber: number;
};

export type PitchGameResults = {
    score: number;
    duration: number;
    attempts: PitchAttempt[];
};

export const PITCHES: Pitch[] = [
    { name: "C", label: "C4", frequency: 261.63, accidental: false },
    { name: "C♯", label: "C♯4", frequency: 277.18, accidental: true },
    { name: "D", label: "D4", frequency: 293.66, accidental: false },
    { name: "D♯", label: "D♯4", frequency: 311.13, accidental: true },
    { name: "E", label: "E4", frequency: 329.63, accidental: false },
    { name: "F", label: "F4", frequency: 349.23, accidental: false },
    { name: "F♯", label: "F♯4", frequency: 369.99, accidental: true },
    { name: "G", label: "G4", frequency: 392, accidental: false },
    { name: "G♯", label: "G♯4", frequency: 415.3, accidental: true },
    { name: "A", label: "A4", frequency: 440, accidental: false },
    { name: "A♯", label: "A♯4", frequency: 466.16, accidental: true },
    { name: "B", label: "B4", frequency: 493.88, accidental: false },
];

export function getRandomPitch(previous?: Pitch): Pitch {
    const choices = previous ? PITCHES.filter((pitch) => pitch.name !== previous.name) : PITCHES;
    return choices[Math.floor(Math.random() * choices.length)];
}

export async function playPianoPitch(audioContext: AudioContext, pitch: Pitch): Promise<void> {
    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    const now = audioContext.currentTime;
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.025);
    masterGain.connect(audioContext.destination);

    [1, 2, 3, 4].forEach((harmonic, index) => {
        const oscillator = audioContext.createOscillator();
        const harmonicGain = audioContext.createGain();

        oscillator.type = index === 0 ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(pitch.frequency * harmonic, now);
        harmonicGain.gain.setValueAtTime(1 / (harmonic * harmonic), now);

        oscillator.connect(harmonicGain);
        harmonicGain.connect(masterGain);
        oscillator.start(now);
        oscillator.stop(now + 2.1);
    });
}
