const allowedRatios = [
  { width: 1280, height: 720 },
  { width: 720, height: 1280 },
  { width: 1104, height: 832 },
  { width: 832, height: 1104 },
  { width: 960, height: 960 },
  { width: 1584, height: 672 },
];

function findClosestRatio(width, height) {
  const inputRatio = width / height;
  let closest = allowedRatios[0];
  let minDiff = Math.abs(inputRatio - (closest.width / closest.height));
  for (const ratio of allowedRatios) {
    const ratioValue = ratio.width / ratio.height;
    const diff = Math.abs(inputRatio - ratioValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ratio;
    }
  }
  return `${closest.width}:${closest.height}`;
}

function getImageSize(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({width: img.naturalWidth, height: img.naturalHeight});
    img.onerror = reject;
    img.src = url;
  });
}

function loadSaved() {
  const saved = JSON.parse(localStorage.getItem('videos') || '[]');
  saved.forEach(v => addVideo(v.url));
}

function addVideo(url) {
  const container = document.getElementById('videos');
  const wrap = document.createElement('div');
  wrap.className = 'video-item';
  wrap.innerHTML = `<video controls autoplay loop muted src="${url}"></video>`;
  const rm = document.createElement('div');
  rm.textContent = 'remove';
  rm.className = 'remove';
  rm.onclick = () => {
    wrap.remove();
    const videos = JSON.parse(localStorage.getItem('videos') || '[]').filter(v => v.url !== url);
    localStorage.setItem('videos', JSON.stringify(videos));
  };
  wrap.appendChild(rm);
  container.prepend(wrap);
}

loadSaved();

async function generate() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const imageUrl = document.getElementById('imageUrl').value.trim();
  const prompt = document.getElementById('prompt').value.trim();
  if(!apiKey || !imageUrl || !prompt) {
    document.getElementById('status').textContent = 'Fill in all fields.';
    return;
  }
  document.getElementById('status').textContent = 'Starting generation...';
  try {
    const {width, height} = await getImageSize(imageUrl);
    const ratio = findClosestRatio(width, height);
    const resp = await fetch('/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({apiKey, imageUrl, prompt, ratio})
    });
    const data = await resp.json();
    if(!resp.ok) throw new Error(data.error || 'Request failed');
    addVideo(data.videoUrl);
    const videos = JSON.parse(localStorage.getItem('videos') || '[]');
    videos.push({url: data.videoUrl});
    localStorage.setItem('videos', JSON.stringify(videos));
    document.getElementById('status').textContent = '';
  } catch(err) {
    document.getElementById('status').textContent = 'Error: ' + err.message;
  }
}

document.getElementById('generate').addEventListener('click', generate);
