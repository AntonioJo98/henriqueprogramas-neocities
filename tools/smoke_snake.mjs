const targetUrl = process.argv[2] ?? 'http://127.0.0.1:8765/projects/snake/';

const pages = await fetch('http://127.0.0.1:9224/json').then((response) => response.json());
const page = pages.find((entry) => entry.type === 'page');
if (!page) throw new Error('No Chrome page target found');

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let messageId = 0;
let resolvePageLoad;

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Page.loadEventFired' && resolvePageLoad) {
    resolvePageLoad();
    resolvePageLoad = undefined;
  }
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

function send(method, params = {}) {
  messageId += 1;
  const id = messageId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await send('Page.enable');
await send('Runtime.enable');
const pageLoaded = new Promise((resolve) => {
  resolvePageLoad = resolve;
});
await send('Page.navigate', { url: targetUrl });
await pageLoaded;

const before = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    title: document.title,
    ready: document.querySelector('#game-status')?.textContent,
    overlayHidden: document.querySelector('#game-overlay')?.hidden
  })`,
  returnByValue: true,
});

await send('Runtime.evaluate', {
  expression: `document.querySelector('#start-button').click()`,
});
await new Promise((resolve) => setTimeout(resolve, 350));

const after = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    status: document.querySelector('#game-status')?.textContent,
    overlayHidden: document.querySelector('#game-overlay')?.hidden,
    score: document.querySelector('#score')?.textContent
  })`,
  returnByValue: true,
});

const firstState = JSON.parse(before.result.value);
const secondState = JSON.parse(after.result.value);

console.log(JSON.stringify({ before: firstState, after: secondState }, null, 2));

if (firstState.title !== 'Snake — Henrique Programas') throw new Error('Unexpected page title');
if (firstState.overlayHidden !== false) throw new Error('Ready overlay should be visible');
if (secondState.status !== 'Game in progress.') throw new Error('Game did not start');
if (secondState.overlayHidden !== true) throw new Error('Overlay did not close');

socket.close();
