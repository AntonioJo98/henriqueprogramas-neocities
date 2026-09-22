import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectRoot = new URL('../site/projects/coffee-wifi/', import.meta.url);

test('Coffee & WiFi page exposes search, filters, directory results, and a local suggestion form', async () => {
  const html = await readFile(new URL('index.html', projectRoot), 'utf8');

  assert.match(html, /id="cafe-search"/);
  assert.match(html, /id="wifi-filter"/);
  assert.match(html, /id="power-filter"/);
  assert.match(html, /id="cafe-results"/);
  assert.match(html, /id="result-count"/);
  assert.match(html, /id="suggestion-form"/);
  assert.match(html, /id="suggestion-status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /coffee-wifi\.mjs/);
});

test('Coffee & WiFi project has local sample data, styling, and JavaScript entry point', async () => {
  const [css, script, data] = await Promise.all([
    readFile(new URL('style.css', projectRoot), 'utf8'),
    readFile(new URL('coffee-wifi.mjs', projectRoot), 'utf8'),
    readFile(new URL('cafes.json', projectRoot), 'utf8'),
  ]);

  assert.match(css, /\.cafe-card/);
  assert.match(script, /localStorage/);
  assert.match(script, /filterCafes/);
  assert.match(data, /"demo"/i);
});
