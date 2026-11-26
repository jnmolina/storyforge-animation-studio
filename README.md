# 🎬 StoryForge — Iterative Animation & Storytelling Studio

> **Story-First Animation Pipeline**: Eliminate art block by iterating from a 1-sentence story beat (from a mundane micro-moment like *tying your shoes* to a high-stakes *neon alley police chase*) all the way to camera-blocked scripts, reference-driven storyboards, mood boards, a live multi-track animatic, 3D Blender Previz, temp music cutting, and offline file exports.

---

## 🚀 Quick Links & Downloads

| Edition | Link | Description |
| :--- | :--- | :--- |
| 🌐 **Live Web App** | **[https://jnmolina.github.io/storyforge-animation-studio/](https://jnmolina.github.io/storyforge-animation-studio/)** | Run directly in your desktop or mobile browser (100% client-side offline support + export center). |
| 📦 **Portable Windows EXE (`v1.0.0`)** | **[Download `StoryForge-Portable.exe` (Latest Release)](https://github.com/jnmolina/storyforge-animation-studio/releases/latest/download/StoryForge-Portable.exe)** *(or in [`portable/StoryForge-Portable.exe`](./portable/StoryForge-Portable.exe))* | **Single-file 680 KB portable `.exe`** — zero dependencies (no Node.js install required). Embeds the entire web app + local Blender TCP bridge (`localhost:9876`) + `blender.exe` CLI launcher. Double-click to launch! |

---

## ✨ 10-Stage Iterative Pipeline

### `01` · Idea Lab (`Mundane → Action`)
- **3 Complexity Tiers**:
  - **Level 1 · Mundane & Intimate** (`1–3 Shots`, e.g., *"The Morning Knot: Tying Shoes & Starting the Day"*)
  - **Level 2 · Slice of Life Twist** (`3–5 Shots`, e.g., *"Coin vs. Vending Machine"*)
  - **Level 3 · High-Stakes / Action** (`5–8 Shots`, e.g., *"Neon Alley Pursuit: Chased by Cops & Trying to Get Away"*)
- **Procedural Dice Roller + Optional Gemini AI Expand**: Roll instant story beats offline or connect an optional Gemini API key in the top bar.
- **Editable 3-Beat Story Spine**: Iterate on your **Hook**, **Escalation / Conflict**, and **Payoff / Release** in place.

### `02` · Cast & Set (`Characters & Props`)
- **Silhouette-First Character Cards**: Define recognizable 3D blockout silhouettes, scene goals, physical acting quirks, and color swatches (`SF_Char_<Name>`).
- **Scene & Previz Props Generator**: Every prop (`P01`–`P04`) spawns a labeled 3D proxy block in the generated Blender scene.

### `03` · Script & Cameras (`Blender-Ready Shots`)
- **Director's Shot Breakdown**: Configure **Shot Framing** (`EWS`, `WS`, `MS`, `CU`, `ECU`, `OTS`), **Camera Angle** (`Eye-Level`, `Low Angle`, `Worm's-Eye`, `High Angle`, `Bird's-Eye`, `Dutch Tilt`), **Camera Motion** (`Static Locked`, `Slow Push-In`, `Tracking Dolly`, `Whip Pan`, `Handheld Follow`, `Arc Orbit`, `Fast Crane Up`), **Focal Length (`mm`)**, and **Duration (`s`)**.
- **Auto-Calculated Blender Z-Up Coordinates & Top-Down Floorplan**: Selecting a framing, angle, or move automatically computes `Cam Start [X, Y, Z]`, `Cam End [X, Y, Z]`, and `Subject Mark [X, Y, Z]` in meters.

### `04` · Reference Library (`Your Images & Links`)
- **Upload, Paste (`Ctrl+V`), or Link**: Drop local images (`.jpg`, `.png`, `.webp`) or paste web/image URLs (Unsplash, Pinterest, ArtStation, Film-Grab).
- **Automatic K-Means Palette Extraction**: Extracts a 5-swatch dominant color palette from every image and auto-tags it `WARM`, `COLD`, `DARK`, or `LIGHT`.
- **Focal-Point Reticle**: Click **Focus** on any reference image to mark the subject so close-up storyboard shots automatically crop around that point.

### `05` · Storyboards (`Generated from References & Script`)
- **4 Render Modes per Panel**:
  1. **`Procedural`**: Auto-drawn 16:9 staging board with character gesture mannequins, horizon tilt, rule-of-thirds guides, and camera motion arrows.
  2. **`Ref Photo`**: Your reference image auto-framed and zoomed per shot type (`WS` → `CU` → `ECU`) around your focal point.
  3. **`Ref Sketch`**: Real-time SVG convolution edge filter that converts your reference photo into pencil-on-paper storyboard line-art.
  4. **`AI Board`**: Uses Gemini image generation to sketch a custom 16:9 panel from your reference image + shot action.
- **Built-in Grease-Pencil Sketch Pad**: Click **Draw** on any panel to sketch pose lines and notes directly over the board.

### `06` · Mood Board (`Warm · Cold · Dark · Light`)
- **Generate from Your References**: Synthesizes **5 custom mood variations** (`Your References`, `Refs · Warm`, `Refs · Cold`, `Refs · Dark`, `Refs · Light`) from your uploaded images, plus a **Reference Mood Wall** grading your photos side-by-side.
- **Studio Presets**: Includes 4 built-in color scripts (**Warm Golden Hour**, **Cold Cyber / Rain Blue**, **Dark Noir Chiaroscuro**, **Light Airy Pastel**). The active mood drives your 2D boards, animatic, and 3D Blender lighting rig.

### `07` · Animatic (`Timing & Multi-Track Edit`)
- **Director Monitor**: Plays through all shots with interpolated camera pan/push/pull motion, burned-in dialogue subtitles, sound cues, timecode, and frame counter (`12 / 24 / 30 FPS`).
- **Beat Timing & Multi-Track Timeline**: Nudge shot durations (`-0.25s` / `+0.25s`) and scrub across the proportional `V1 Storyboard` and `A1 Temp Music` tracks.

### `08` · Blender Previz Connector (`Live 3D Stage & Python Bridge`)
- **Interactive 3D Stage Preview**: Orbit, elevate, and zoom around the Z-up 3D stage to inspect camera cones, start-to-end dolly vectors, character capsules, and props right in the browser.
- **3 Ways to Send to Blender**:
  1. **Push to Open Blender (`localhost:9876`)**: Sends the `bpy` script directly to an open Blender session running the MCP for Blender socket addon.
  2. **Launch Blender**: Invokes local `blender.exe --python` automatically.
  3. **Download `.py` / Copy Code**: Generates a clean, self-contained Blender Python script with character mannequins, eyeline cones, proxy props, mood lighting, keyframed cameras, `TRACK_TO` constraints, and bound **Timeline Camera Markers**.

### `09` · Temp Music (`Find, Import, Cut & Sync`)
- **Royalty-Free Crate & Built-In Playable Synth Stems**: Quick links to Pixabay Music, Free Music Archive, Incompetech, FreePD, and ccMixter, plus 4 zero-setup playable WebAudio tracks.
- **Import & Trim Waveform**: Import any `.mp3`/`.wav`/`.ogg` file, adjust **In/Out Points**, **Timeline Offset**, and **Mix Level** against `SH1..SHn` beat markers, or click **Snap to Animatic**.

### `10` · Offline Export Center (`All Steps to Reusable Basic Files`)
Export any individual file, a per-stage `.zip`, or click **Export everything (`.zip`)** to download a complete offline production folder:
- `01_idea/` → `story.md`, `story.json`
- `02_cast_and_set/` → `cast_and_set.md`, `characters.csv`, `environment.json`
- `03_script/` → `script.fountain` (Fountain screenplay), `shooting_script.md`, `shot_list.csv`, `camera_directions.json`
- `04_references/` → `images/*`, `references.json`, `reference_board.html`
- `05_storyboards/` → `panels/SH##.png` (high-res PNGs), printable `storyboard_sheet.html`
- `06_mood_board/` → `mood_board.html`, `palettes/*.gpl` (GIMP / Krita / Inkscape palettes), `palettes.css`, `palettes.json`, `variations/*.png`
- `07_animatic/` → standalone `animatic_player.html`, `edit.edl` (CMX 3600 EDL for Resolve/Premiere), `dialogue.srt`, `timing.csv`
- `08_blender_previz/` → `storyforge_previz.py`, `shot_manifest.json`
- `09_temp_music/` → `temp_music_cut.wav` (offline-rendered 44.1kHz stereo WAV), `cue_sheet.md`, `music_sources.md`

---

## 📱 Mobile & Tablet Friendly
- **Thumb-Reach Bottom Pipeline Dock**: Swipe and tap across all 10 stages (`01 Idea` → `10 Export`) from a fixed bottom dock on phones and tablets, plus a slide-out project drawer.
- **Touch Drawing & Responsive Grids**: Touch-enabled grease-pencil drawing on storyboard panels and responsive cards across 360px+ viewports.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start the Vite dev server (http://127.0.0.1:5173)
npm run dev

# Start the Node backend for Blender live bridge & server-side link resolver (http://localhost:3001)
npm run server

# Rebuild production bundle + standalone portable Windows executable (portable/StoryForge-Portable.exe)
powershell -ExecutionPolicy Bypass -File scripts/build-portable.ps1
```
