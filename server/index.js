import express from 'express';
import cors from 'cors';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Helper to communicate with MCP for Blender addon on localhost:9876
function sendToBlenderSocket(commandObj, port = 9876, host = '127.0.0.1', timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let buffer = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        client.destroy();
        reject(new Error(`Timed out waiting for Blender addon at ${host}:${port}`));
      }
    }, timeoutMs);

    client.connect(port, host, () => {
      client.write(JSON.stringify(commandObj));
    });

    client.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      try {
        const parsed = JSON.parse(buffer);
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          client.destroy();
          resolve(parsed);
        }
      } catch {
        // Wait for more chunks if JSON is incomplete
      }
    });

    client.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(err);
      }
    });

    client.on('close', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        if (buffer) {
          try {
            resolve(JSON.parse(buffer));
          } catch {
            resolve({ status: 'ok', raw: buffer });
          }
        } else {
          reject(new Error('Connection closed by Blender without response'));
        }
      }
    });
  });
}

// Find local Blender installation on Windows if available
function findBlenderExecutable() {
  const baseDir = 'C:\\Program Files\\Blender Foundation';
  try {
    if (fs.existsSync(baseDir)) {
      const dirs = fs.readdirSync(baseDir).filter(d => d.toLowerCase().startsWith('blender')).sort().reverse();
      for (const dir of dirs) {
        const exePath = path.join(baseDir, dir, 'blender.exe');
        if (fs.existsSync(exePath)) {
          return exePath;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Check Blender live bridge status
app.get('/api/blender/status', async (req, res) => {
  const port = Number(req.query.port) || 9876;
  const blenderExe = findBlenderExecutable();
  try {
    const response = await sendToBlenderSocket({ type: 'get_scene_info', params: {} }, port, '127.0.0.1', 2500);
    res.json({
      connected: true,
      port,
      blenderExe,
      sceneInfo: response?.result || response,
      message: `Connected to live Blender session on localhost:${port}`
    });
  } catch (err) {
    res.json({
      connected: false,
      port,
      blenderExe,
      message: `Blender MCP socket not listening on localhost:${port}. Open Blender → 3D Viewport Sidebar (N) → MCP for Blender → Connect, or use 'Launch in Blender' / 'Download .py Script'.`,
      error: err.message
    });
  }
});

// Push Python previz script directly to live open Blender via socket
app.post('/api/blender/push', async (req, res) => {
  const { code, port = 9876 } = req.body;
  if (!code) {
    return res.status(400).json({ ok: false, error: 'Missing Python code payload' });
  }

  try {
    const response = await sendToBlenderSocket(
      {
        type: 'execute_code',
        params: { code }
      },
      Number(port),
      '127.0.0.1',
      12000
    );
    res.json({
      ok: true,
      mode: 'socket',
      result: response,
      message: 'Previz shots, cameras, timeline markers, and proxy geometry pushed directly to your open Blender scene!'
    });
  } catch (socketErr) {
    // Save script locally in exports folder so user can also launch or load it
    const exportsDir = path.join(__dirname, '..', 'exports');
    fs.mkdirSync(exportsDir, { recursive: true });
    const scriptPath = path.join(exportsDir, 'storyforge_previz.py');
    fs.writeFileSync(scriptPath, code, 'utf8');

    res.status(200).json({
      ok: false,
      savedScriptPath: scriptPath,
      error: socketErr.message,
      message: `Could not reach live Blender socket on localhost:${port}. Saved script to ${scriptPath}. You can click "Launch Blender with Script" or run it inside Blender's Scripting tab.`
    });
  }
});

// Launch local Blender executable with the generated Python script
app.post('/api/blender/launch', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ ok: false, error: 'Missing Python code payload' });
  }

  const exportsDir = path.join(__dirname, '..', 'exports');
  fs.mkdirSync(exportsDir, { recursive: true });
  const scriptPath = path.join(exportsDir, `storyforge_previz_${Date.now()}.py`);
  fs.writeFileSync(scriptPath, code, 'utf8');

  const blenderExe = findBlenderExecutable();
  if (!blenderExe) {
    return res.json({
      ok: false,
      savedScriptPath: scriptPath,
      message: `Saved script to ${scriptPath}, but blender.exe was not found in C:\\Program Files\\Blender Foundation. Open Blender and run the script from the Scripting workspace.`
    });
  }

  try {
    const child = execFile(blenderExe, ['--python', scriptPath], { detached: true, windowsHide: false });
    child.unref();
    res.json({
      ok: true,
      blenderExe,
      savedScriptPath: scriptPath,
      message: `Launched Blender (${path.basename(path.dirname(blenderExe))}) with generated Previz scene script!`
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      savedScriptPath: scriptPath,
      error: err.message
    });
  }
});

// Optional Gemini AI generation endpoint for ideas, scripts, and storyboard prompts
app.post('/api/ai/generate', async (req, res) => {
  const { prompt, apiKey, systemInstruction } = req.body;
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(400).json({
      ok: false,
      error: 'No Gemini API key provided. Add your key in the top Studio AI drawer or use the built-in Procedural Story Engine.'
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        responseMimeType: 'application/json'
      }
    };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data?.error?.message || 'Gemini API request failed'
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    res.json({ ok: true, data: JSON.parse(text) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Reference resolver: turns an image link OR a web page link (Pinterest,
// ArtStation, Unsplash, Flickr...) into an embeddable data URL so the browser
// can extract palettes, auto-frame storyboards and export everything offline.
// ---------------------------------------------------------------------------
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StoryForgeStudio/2.0';

async function fetchImageAsDataUrl(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error(`Image fetch failed (${r.status})`);
  const type = (r.headers.get('content-type') || '').split(';')[0];
  if (!type.startsWith('image/')) throw new Error(`Not an image (${type || 'unknown'})`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 15 * 1024 * 1024) throw new Error('Image larger than 15MB');
  return `data:${type};base64,${buf.toString('base64')}`;
}

function pickMeta(html, names) {
  for (const n of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${n}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${n}["']`,
      'i'
    );
    const m = html.match(re);
    if (m) return (m[1] || m[2]).replace(/&amp;/g, '&');
  }
  return null;
}

app.get('/api/ref/resolve', async (req, res) => {
  const url = String(req.query.url || '').trim();
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ ok: false, error: 'Please provide an http(s) link.' });
  }
  try {
    const head = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    const type = (head.headers.get('content-type') || '').split(';')[0];

    if (type.startsWith('image/')) {
      const buf = Buffer.from(await head.arrayBuffer());
      return res.json({
        ok: true,
        kind: 'image',
        title: decodeURIComponent(url.split('/').pop().split('?')[0] || 'Linked image').slice(0, 60),
        dataUrl: `data:${type};base64,${buf.toString('base64')}`,
        sourceUrl: url
      });
    }

    const html = (await head.text()).slice(0, 600000);
    const title =
      pickMeta(html, ['og:title', 'twitter:title']) ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] ||
      new URL(url).hostname;
    let img = pickMeta(html, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']);

    if (img) {
      img = new URL(img, url).toString();
      try {
        const dataUrl = await fetchImageAsDataUrl(img);
        return res.json({ ok: true, kind: 'image', title: title.trim().slice(0, 80), dataUrl, sourceUrl: url, imageUrl: img });
      } catch {
        // fall through to link-only card
      }
    }
    return res.json({ ok: true, kind: 'link', title: title.trim().slice(0, 80), sourceUrl: url });
  } catch (err) {
    res.status(200).json({ ok: false, error: `Could not reach link: ${err.message}` });
  }
});

// Optional AI storyboard panel generation (Nano Banana image models) from a
// shot description + optional user reference image.
app.post('/api/ai/storyboard', async (req, res) => {
  const { apiKey, prompt, imageDataUrl } = req.body;
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) return res.status(400).json({ ok: false, error: 'Add a Gemini API key (top bar) to use AI boards.' });

  const parts = [{ text: prompt }];
  if (imageDataUrl && imageDataUrl.startsWith('data:')) {
    const [meta, b64] = imageDataUrl.split(',');
    parts.push({ inlineData: { mimeType: meta.slice(5).split(';')[0], data: b64 } });
  }

  const models = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image'];
  let lastErr = 'Unknown error';
  for (const model of models) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'], imageConfig: { aspectRatio: '16:9' } }
          })
        }
      );
      const data = await r.json();
      if (!r.ok) {
        lastErr = data?.error?.message || `HTTP ${r.status}`;
        continue;
      }
      const imgPart = (data?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData || p.inline_data);
      const inline = imgPart?.inlineData || imgPart?.inline_data;
      if (!inline) {
        lastErr = 'Model returned no image';
        continue;
      }
      return res.json({ ok: true, model, dataUrl: `data:${inline.mimeType || inline.mime_type};base64,${inline.data}` });
    } catch (err) {
      lastErr = err.message;
    }
  }
  res.status(200).json({ ok: false, error: lastErr });
});

// Serve compiled frontend build (`dist/`) so the portable EXE & single-port mode work out of the box
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`StoryForge Animation Studio running at http://localhost:${PORT}`);
});
