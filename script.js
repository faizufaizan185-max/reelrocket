// Simple front-end demo logic
const videoInput = document.getElementById('videoInput');
const dropZone = document.getElementById('dropZone');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const previewSection = document.getElementById('previewSection');
const player = document.getElementById('player');
const clipsArea = document.getElementById('clipsArea');

let currentFile = null;

dropZone.addEventListener('click', ()=> videoInput.click());
videoInput.addEventListener('change', handleFile);

function handleFile(e){
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('video')) { alert('Please upload a video file'); return; }
  currentFile = file;
  const url = URL.createObjectURL(file);
  player.src = url;
  previewSection.hidden = false;
  analyzeBtn.disabled = false;
  clearBtn.disabled = false;
  clipsArea.innerHTML = '';
}

clearBtn.addEventListener('click', ()=>{
  currentFile = null;
  player.src = '';
  previewSection.hidden = true;
  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
  clipsArea.innerHTML = '';
  videoInput.value = '';
});

analyzeBtn.addEventListener('click', async ()=>{
  if (!currentFile) return;
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Finding highlights...';

  // DEMO: propose 3 sample time ranges based on video duration
  const meta = await getVideoMeta(currentFile);
  const duration = meta.duration || 30;
  // simple heuristic: pick near 20%, 50%, 80%
  const ranges = [
    pickRange(duration, 0.20),
    pickRange(duration, 0.50),
    pickRange(duration, 0.80)
  ];
  renderClips(ranges);
  analyzeBtn.textContent = 'Find Highlights';
  analyzeBtn.disabled = false;
});

function getVideoMeta(file){
  return new Promise((res)=>{
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.src = URL.createObjectURL(file);
    vid.onloadedmetadata = ()=> {
      res({duration: vid.duration});
    };
  });
}

function pickRange(duration, fraction){
  const center = Math.max(2, Math.floor(duration * fraction));
  const start = Math.max(0, center - 8);
  const end = Math.min(duration, center + 7);
  return {start, end};
}

function renderClips(ranges){
  clipsArea.innerHTML = '';
  ranges.forEach((r, idx)=>{
    const div = document.createElement('div');
    div.className = 'clip';
    div.innerHTML = `
      <div style="flex:1">
        <strong>Clip #${idx+1}</strong>
        <div class="small">Start: ${formatTime(r.start)} — End: ${formatTime(r.end)}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="primary" onclick="previewRange(${r.start}, ${r.end})">Preview</button>
        <button onclick="downloadRange(${r.start}, ${r.end})">Export</button>
      </div>
    `;
    clipsArea.appendChild(div);
  });
}

function formatTime(s){
  const mm = Math.floor(s/60).toString().padStart(2,'0');
  const ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${mm}:${ss}`;
}

window.previewRange = (s,e)=>{
  if(!player.src) return;
  player.currentTime = s;
  player.play();
  const stopAt = e;
  const onTime = ()=> {
    if (player.currentTime >= stopAt - 0.2) {
      player.pause();
      player.removeEventListener('timeupdate', onTime);
    }
  };
  player.addEventListener('timeupdate', onTime);
};

window.downloadRange = (s,e)=>{
  alert('Export will be added in next update — for now this is a demo UI. I will add client-side clip extraction (ffmpeg.wasm) in the next step.');
};
