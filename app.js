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

cameraBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    video.srcObject = stream;
    message.hidden = true;
    cameraBtn.disabled = true;
    shadesBtn.disabled = false;
    metaBtn.disabled = !window.MediaRecorder;
    statusText.textContent = 'Camera on. Try not to be dazzled.';
  } catch (error) {
    statusText.textContent = 'Camera said nope. Allow access + use HTTPS or localhost.';
    console.error(error);
  }
});

shadesBtn.addEventListener('click', () => {
  wearing = !wearing;
  shade.classList.toggle('on', wearing);
  glasses.classList.toggle('on', wearing);
  shadesBtn.textContent = wearing ? '😎 TAKE OFF SUNGLASSES' : '🕶️ PUT ON SUNGLASSES';
  statusText.textContent = wearing ? 'WOW. It is literally darker now.' : 'Shades removed. Welcome back to the sun.';
});

metaBtn.addEventListener('click', () => {
  if (!recording) {
    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        download.href = URL.createObjectURL(blob);
        download.download = `m3ta-sunglasses-${Date.now()}.webm`;
        download.hidden = false;
        download.textContent = '⬇ Download your extremely important video';
      };
      recorder.start();
      recording = true;
      recTag.classList.add('on');
      metaBtn.textContent = '⏹ STOP M3TA';
      statusText.textContent = 'M3TA IS WATCHING. (recording...)';
    } catch (error) {
      statusText.textContent = 'Could not start recording on this browser.';
      console.error(error);
    }
  } else {
    recorder.stop();
    recording = false;
    recTag.classList.remove('on');
    metaBtn.textContent = '🔴 M3TA';
    statusText.textContent = 'Recording stopped. The evidence is ready below.';
  }
});

window.addEventListener('pagehide', () => stream?.getTracks().forEach(track => track.stop()));
