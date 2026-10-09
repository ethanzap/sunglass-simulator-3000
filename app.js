const video = document.querySelector('#preview');
const cameraBtn = document.querySelector('#cameraBtn');
const shadesBtn = document.querySelector('#shadesBtn');
const metaBtn = document.querySelector('#metaBtn');
const statusText = document.querySelector('#status');
const message = document.querySelector('#message');
const shade = document.querySelector('#shade');
const glasses = document.querySelector('.fake-glasses');
const recTag = document.querySelector('#recTag');
const download = document.querySelector('#download');

let stream;
let recorder;
let chunks = [];
let wearing = false;
let recording = false;

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = 'Camera access is unavailable here. Open this page in Safari or Chrome over HTTPS.';
    return;
  }

  cameraBtn.disabled = true;
  statusText.textContent = 'Starting camera…';
  try {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
    } catch (preferredCameraError) {
      // Some mobile browsers reject the facingMode constraint even when a camera is available.
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    }

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    message.hidden = true;
    shadesBtn.disabled = false;
    metaBtn.disabled = !window.MediaRecorder;
    cameraBtn.hidden = true;
    statusText.textContent = 'Camera on.';
  } catch (error) {
    stream?.getTracks().forEach(track => track.stop());
    stream = undefined;
    cameraBtn.disabled = false;
    statusText.textContent = error.name === 'NotAllowedError'
      ? 'Camera permission was blocked. Allow it in browser settings, then try again.'
      : 'Could not start the camera. Try opening this page in Safari or Chrome.';
    console.error('Camera startup failed:', error);
  }
}

cameraBtn.addEventListener('click', startCamera);

shadesBtn.addEventListener('click', () => {
  wearing = !wearing;
  shade.classList.toggle('on', wearing);
  glasses.classList.toggle('on', wearing);
  shadesBtn.textContent = wearing ? 'Take off' : 'Put on sunglasses';
  statusText.textContent = wearing ? 'Sunglasses on.' : 'Sunglasses off.';
});

metaBtn.addEventListener('click', () => {
  if (!recording) {
    const types = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mimeType = types.find(type => MediaRecorder.isTypeSupported(type));
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type });
        download.href = URL.createObjectURL(blob);
        download.download = 'sunglass-sim-' + Date.now() + '.' + (type.includes('mp4') ? 'mp4' : 'webm');
        download.hidden = false;
        download.textContent = 'Download recording';
      };
      recorder.start();
      recording = true;
      recTag.classList.add('on');
      metaBtn.classList.add('recording');
      metaBtn.textContent = 'Stop';
      statusText.textContent = 'Recording…';
    } catch (error) {
      statusText.textContent = 'Recording is unavailable in this browser.';
      console.error('Recording failed:', error);
    }
  } else {
    recorder.stop();
    recording = false;
    recTag.classList.remove('on');
    metaBtn.classList.remove('recording');
    metaBtn.textContent = 'M3TA';
    statusText.textContent = 'Recording saved below.';
  }
});

window.addEventListener('pagehide', () => stream?.getTracks().forEach(track => track.stop()));
