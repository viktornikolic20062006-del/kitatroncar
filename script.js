/* RANDOM FONT SIZE */
function randomizeFontSizes() {
    document.querySelectorAll("*").forEach(el => {
        const size = Math.floor(Math.random() * 30) + 12;
        el.style.fontSize = size + "px";
        el.style.fontWeight = Math.random() > 0.5 ? "bold" : "900";
    });
}
randomizeFontSizes();

/* SOUNDBOARD */
const board = document.getElementById("soundboard");

const sounds = [];
for (let i = 1; i <= 20; i++) sounds.push({ name: "", file: "s" + i + ".mp3" });

sounds.forEach(snd => {
    const btn = document.createElement("button");
    btn.className = "sound-btn";
    btn.textContent = snd.name || snd.file;
    btn.onclick = () => {
        const a = new Audio("sounds/" + snd.file);
        a.volume = 1;
        a.play();
    };
    board.appendChild(btn);
});

/* AUDIO SETUP */
const audio = document.getElementById("audio");
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const source = ctx.createMediaElementSource(audio);

/* MASTER GAIN NODE */
const masterGain = ctx.createGain();
masterGain.gain.value = 1; // 100%

/* DRY / WET */
const dryGain = ctx.createGain();
const wetGain = ctx.createGain();

/* BASS + DISTORTION + HIGH PASS + COMPRESSOR */
const bass = ctx.createBiquadFilter();
bass.type = "lowshelf";
bass.frequency.value = 120;

const distortion = ctx.createWaveShaper();
function makeDistortion(amount) {
    const n = 44100;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) curve[i] = Math.tanh((i*2/n-1) * amount);
    return curve;
}

const highpass = ctx.createBiquadFilter();
highpass.type = "highpass";
highpass.frequency.value = 90;

const compressor = ctx.createDynamicsCompressor();
compressor.threshold.value = -24;
compressor.knee.value = 30;
compressor.ratio.value = 6;
compressor.attack.value = 0.003;
compressor.release.value = 0.25;

/* CONNECTION GRAPH */
source.connect(dryGain);
dryGain.connect(compressor);

source.connect(bass);
bass.connect(distortion);
distortion.connect(highpass);
highpass.connect(wetGain);
wetGain.connect(compressor);

/* MASTER GAIN OUTPUT */
compressor.connect(masterGain);
masterGain.connect(ctx.destination);

/* DEFAULT LEVELS */
dryGain.gain.value = 1;
wetGain.gain.value = 0;

/* MUSIC SELECT */
const songDropdown = document.getElementById("song-dropdown");
songDropdown.onchange = () => {
    const song = songDropdown.value;
    if (!song) return;
    audio.src = song;
    ctx.resume();
    audio.play();
};

/* CONTROLS */
document.getElementById("playpause").onclick = () =>
    audio.paused ? audio.play() : audio.pause();
document.getElementById("back").onclick = () =>
    audio.currentTime -= 5;
document.getElementById("forward").onclick = () =>
    audio.currentTime += 5;

/* SEEK */
const seek = document.getElementById("seek");
audio.addEventListener("timeupdate", () => {
    seek.max = audio.duration || 0;
    seek.value = audio.currentTime;
});
seek.oninput = () => audio.currentTime = seek.value;

/* VOLUME */
const volume = document.getElementById("volume");
const volumePercent = document.getElementById("volume-percent");

volume.oninput = () => {
    const val = volume.value;
    masterGain.gain.value = val / 100; // linear 0-100%
    volumePercent.textContent = val + "%";
};

/* BASS BOOST + SHAKE */
const bassSlider = document.getElementById("bass");
const tablet = document.getElementById("tablet");

bassSlider.oninput = () => {
    const val = bassSlider.value;
    bass.gain.value = val * 0.35;
    distortion.curve = makeDistortion(Math.max(0,val-25)*2);
    wetGain.gain.value = val / 120;
    dryGain.gain.value = 1 - (val/200);
    tablet.style.setProperty("--shake", Math.pow(val,1.5)/40);
};

/* FLASH CONTROL */
let flashingEnabled = true;
const flashBtn = document.getElementById("toggle-flash");
flashBtn.onclick = () => {
    flashingEnabled = !flashingEnabled;
    tablet.classList.toggle("paused", !flashingEnabled);
    flashBtn.textContent = flashingEnabled ? "🛑 FLASH" : "▶ FLASH";
};

/* RANDOM COLORS */
function randomizeColors() {
    document.querySelectorAll("*").forEach(el => {
        el.style.color = `hsl(${Math.random()*360},100%,50%)`;
        el.style.backgroundColor = `hsl(${Math.random()*360},100%,50%)`;
        el.style.borderColor = `hsl(${Math.random()*360},100%,50%)`;
    });
}
setInterval(() => { if(flashingEnabled) randomizeColors(); }, 150);
