import { resolveMood } from '../data/storyEngine';

/**
 * Generates a self-contained, studio-grade Blender Python (bpy) script
 * that sets up:
 * 1. Collection "StoryForge_Previz" (cleans previous run safely)
 * 2. Mood-calibrated World & 3-Point Lighting (Warm, Cold, Dark, Light)
 * 3. Simple Geometry Environment & Props (Bench/Doorway or Alley/Cruiser/Dumpster)
 * 4. Character Blockout Rig (Head + Torso + Eye-line direction pointer animated per shot)
 * 5. Per-shot Cameras with Focal Length, Keyframed Movement, Track-To Target, and Timeline Camera Binding Markers
 */
export function generateBlenderPrevizScript(project, fps = 24) {
  const mood = resolveMood(project);
  // strip heavy image payloads (sketches, AI boards) from the Python script
  const shots = (project.shots || []).map(({ sketchDataUrl, aiImage, referenceImageUrl, ...s }) => s);
  const characters = project.characters || [];
  const env = project.environment || {};

  const safeJson = JSON.stringify(
    {
      title: project.title,
      tier: project.tier,
      moodKey: project.moodKey,
      mood,
      fps,
      environment: env,
      characters,
      shots
    },
    null,
    2
  );

  return `import bpy
import math
import json

# ==============================================================================
# STORYFORGE ANIMATION STUDIO — BLENDER 3D PREVIZ GENERATOR
# Story: ${project.title || 'Untitled Story'}
# Mood Variation: ${mood.name} (${project.moodKey})
# Shots: ${shots.length} | FPS: ${fps}
# ==============================================================================

PROJECT_DATA = json.loads(r'''${safeJson}''')

def make_material(name, rgba, roughness=0.55, emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    mat.diffuse_color = (rgba[0], rgba[1], rgba[2], rgba[3] if len(rgba) > 3 else 1.0)
    nodes = mat.node_tree.nodes
    bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = (rgba[0], rgba[1], rgba[2], 1.0)
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if emission_strength > 0:
            for em_name in ("Emission Color", "Emission"):
                if em_name in bsdf.inputs:
                    bsdf.inputs[em_name].default_value = (rgba[0], rgba[1], rgba[2], 1.0)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

def hex_to_rgb(hex_str):
    h = hex_str.lstrip('#')
    if len(h) != 6:
        return (0.8, 0.6, 0.3)
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def link_only_to_collection(obj, target_col):
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    target_col.objects.link(obj)

def build_storyforge_previz():
    scene = bpy.context.scene
    fps = int(PROJECT_DATA.get("fps", 24))
    scene.render.fps = fps

    # Clean up previous StoryForge_Previz collection if it exists
    col_name = "StoryForge_Previz"
    old_col = bpy.data.collections.get(col_name)
    if old_col:
        for obj in list(old_col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(old_col)

    previz_col = bpy.data.collections.new(col_name)
    scene.collection.children.link(previz_col)

    # Clear existing timeline markers created by StoryForge
    for m in list(scene.timeline_markers):
        if m.name.startswith("SH"):
            scene.timeline_markers.remove(m)

    # 1. Configure Mood World Background
    mood = PROJECT_DATA["mood"]
    bg_rgb = mood.get("blenderBgColor", [0.08, 0.08, 0.12])
    if not scene.world:
        scene.world = bpy.data.worlds.new("StoryForge_World")
    scene.world.use_nodes = True
    bg_node = next((n for n in scene.world.node_tree.nodes if n.type == "BACKGROUND"), None)
    if bg_node:
        bg_node.inputs[0].default_value = (bg_rgb[0], bg_rgb[1], bg_rgb[2], 1.0)
        bg_node.inputs[1].default_value = 0.8

    # 2. Ground Plane & Simple Environment Blockout
    ground_hex = PROJECT_DATA["environment"].get("groundColor", "#1E293B")
    ground_mat = make_material("SF_Ground_Mat", hex_to_rgb(ground_hex), roughness=0.45)

    bpy.ops.mesh.primitive_plane_add(size=18.0, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "SF_Env_Ground"
    ground.data.materials.append(ground_mat)
    link_only_to_collection(ground, previz_col)

    wall_mat = make_material("SF_Wall_Mat", (bg_rgb[0]*1.8 + 0.08, bg_rgb[1]*1.8 + 0.08, bg_rgb[2]*1.8 + 0.1), roughness=0.75)
    prop_mat = make_material("SF_Prop_Mat", (0.55, 0.42, 0.28), roughness=0.6)
    accent_mat = make_material("SF_Accent_Mat", mood.get("blenderKeyColor", [1.0, 0.8, 0.5]), roughness=0.3, emission_strength=1.5)

    # Back / Side Reference Architecture Cubes
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 4.2, 2.0))
    back_wall = bpy.context.active_object
    back_wall.name = "SF_Env_BackWall"
    back_wall.scale = (8.0, 0.25, 4.0)
    back_wall.data.materials.append(wall_mat)
    link_only_to_collection(back_wall, previz_col)

    # Create recognizable simple props from project environment with their chosen layout shapes & slider sizes
    props = PROJECT_DATA["environment"].get("props", [])
    prop_shapes = PROJECT_DATA["environment"].get("propShapes", [])
    prop_scales = PROJECT_DATA["environment"].get("propScales", [])
    for idx, prop_label in enumerate(props[:4]):
        px = -2.2 + idx * 1.5
        py = 1.6 if idx % 2 == 0 else 0.8
        p_shape = prop_shapes[idx] if idx < len(prop_shapes) else "box"
        p_sc = prop_scales[idx] if idx < len(prop_scales) else {}
        pw = float(p_sc.get("w", 1.0)) if isinstance(p_sc, dict) else 1.0
        ph = float(p_sc.get("h", 0.9)) if isinstance(p_sc, dict) else 0.9
        if p_shape == "circle":
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(px, py, 0.5 * ph))
            bpy.context.active_object.scale = (pw, pw, ph)
        elif p_shape == "triangle":
            bpy.ops.mesh.primitive_cone_add(radius1=0.55 * pw, depth=1.1 * ph, location=(px, py, 0.55 * ph))
        elif p_shape == "tall":
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, 0.5 * ph))
            bpy.context.active_object.scale = (pw, 0.4, ph)
        elif p_shape == "wide":
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, 0.5 * ph))
            bpy.context.active_object.scale = (pw, 0.75, ph)
        else:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, 0.5 * ph))
            bpy.context.active_object.scale = (pw, 0.65 * pw, ph)
        p_obj = bpy.context.active_object
        p_obj.name = f"SF_Prop_{idx+1}_{prop_label[:14].replace(' ', '_')}"
        p_obj.data.materials.append(prop_mat if idx % 2 == 0 else accent_mat)
        link_only_to_collection(p_obj, previz_col)

    # 3. Create Character Proxy Mannequins matching Shape Language (circle/square/triangle), Body Preset & Custom Size Sliders
    char_rigs = []
    characters = PROJECT_DATA.get("characters", [])
    if not characters:
        characters = [{"name": "Hero", "colorHex": "#F59E0B", "shape": "circle", "bodyType": "tall", "scale": [0.85, 0.85, 1.75]}]

    body_Presets = {
        "tall":  (0.82, 0.82, 1.26),
        "short": (0.95, 0.95, 0.68),
        "thin":  (0.54, 0.54, 1.14),
        "wide":  (1.55, 1.15, 0.96),
        "round": (1.42, 1.42, 0.86),
        "boxy":  (1.35, 1.05, 1.02)
    }

    for c_idx, char_data in enumerate(characters):
        c_name = char_data.get("name", f"Char_{c_idx+1}")
        c_shape = char_data.get("shape", "circle")
        c_body = char_data.get("bodyType", "tall")
        def_bx, def_by, def_bz = body_Presets.get(c_body, (1.0, 1.0, 1.0))
        bx = float(char_data.get("customWidth", def_bx))
        by = bx * 0.9
        bz = float(char_data.get("customHeightM", def_bz * 1.65)) / 1.65
        head_mult = float(char_data.get("customHead", 1.0))
        c_mat = make_material(f"SF_CharMat_{c_name}", hex_to_rgb(char_data.get("colorHex", "#F59E0B")), roughness=0.35)

        root = bpy.data.objects.new(f"SF_Char_{c_name}_Root", None)
        root.empty_display_type = 'CIRCLE'
        root.empty_display_size = 0.65
        previz_col.objects.link(root)

        torso_z = 0.65 * bz
        head_z = 1.48 * bz

        # Torso block matching shape language (circle / square / triangle)
        if c_shape == "square" or c_body == "boxy":
            bpy.ops.mesh.primitive_cube_add(size=0.58, location=(0, 0, torso_z))
            torso = bpy.context.active_object
            torso.scale = (bx, by, 1.85 * bz)
        elif c_shape == "triangle":
            bpy.ops.mesh.primitive_cone_add(radius1=0.36 * bx, radius2=0.14 * bx, depth=1.1 * bz, location=(0, 0, torso_z))
            torso = bpy.context.active_object
        else:
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(0, 0, torso_z))
            torso = bpy.context.active_object
            torso.scale = (bx, by, 1.7 * bz)
        torso.name = f"SF_Char_{c_name}_Torso_{c_shape}_{c_body}"
        torso.data.materials.append(c_mat)
        torso.parent = root
        link_only_to_collection(torso, previz_col)

        # Head matching shape language & Head Size Slider
        if c_shape == "square" or c_body == "boxy":
            bpy.ops.mesh.primitive_cube_add(size=0.44 * head_mult, location=(0, 0, head_z))
        elif c_shape == "triangle":
            bpy.ops.mesh.primitive_cone_add(radius1=0.26 * head_mult, depth=0.48 * head_mult, location=(0, 0, head_z))
        else:
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24 * head_mult, location=(0, 0, head_z))
        head = bpy.context.active_object
        head.name = f"SF_Char_{c_name}_Head_{c_shape}"
        head.data.materials.append(c_mat)
        head.parent = root
        link_only_to_collection(head, previz_col)

        # Eye-line direction cone so animators see head orientation immediately
        bpy.ops.mesh.primitive_cone_add(radius1=0.10, depth=0.32, location=(0, -0.28, head_z), rotation=(math.radians(90), 0, 0))
        visor = bpy.context.active_object
        visor.name = f"SF_Char_{c_name}_Eyeline"
        visor.data.materials.append(accent_mat)
        visor.parent = root
        link_only_to_collection(visor, previz_col)

        char_rigs.append(root)

    # 4. Mood-Calibrated 3-Point Lighting
    key_col = mood.get("blenderKeyColor", [1.0, 0.8, 0.5])
    fill_col = mood.get("blenderFillColor", [0.4, 0.6, 0.9])

    key_data = bpy.data.lights.new(name="SF_KeyLight", type='AREA')
    key_data.energy = float(mood.get("keyEnergy", 4.5)) * 120.0
    key_data.color = (key_col[0], key_col[1], key_col[2])
    key_data.size = 3.5
    key_obj = bpy.data.objects.new(name="SF_KeyLight", object_data=key_data)
    key_obj.location = (3.5, -3.5, 4.5)
    key_obj.rotation_euler = (math.radians(45), 0, math.radians(42))
    previz_col.objects.link(key_obj)

    fill_data = bpy.data.lights.new(name="SF_FillLight", type='AREA')
    fill_data.energy = float(mood.get("fillEnergy", 1.8)) * 90.0
    fill_data.color = (fill_col[0], fill_col[1], fill_col[2])
    fill_data.size = 4.0
    fill_obj = bpy.data.objects.new(name="SF_FillLight", object_data=fill_data)
    fill_obj.location = (-4.0, -2.5, 3.0)
    fill_obj.rotation_euler = (math.radians(55), 0, math.radians(-48))
    previz_col.objects.link(fill_obj)

    # 5. Build Multi-Camera Sequencer Shots & Keyframe Movement
    current_frame = 1
    shots = PROJECT_DATA.get("shots", [])

    for idx, shot in enumerate(shots):
        dur_sec = float(shot.get("duration", 2.0))
        shot_frames = max(12, int(round(dur_sec * fps)))
        start_f = current_frame
        end_f = current_frame + shot_frames - 1

        subj_pos = shot.get("subjectPos", [0, 0, 0])
        cam_start = shot.get("camStart", [0, -3.5, 1.5])
        cam_end = shot.get("camEnd", cam_start)
        focal = float(shot.get("focalLength", 35))

        # Animate primary character root to this shot's staging mark
        if char_rigs:
            hero = char_rigs[0]
            hero.location = (subj_pos[0], subj_pos[1], subj_pos[2])
            hero.keyframe_insert(data_path="location", frame=start_f)
            hero.keyframe_insert(data_path="location", frame=end_f)

            # Secondary character offset if present (e.g., pursuer)
            if len(char_rigs) > 1:
                pursuer = char_rigs[1]
                pursuer.location = (subj_pos[0] - 1.2, subj_pos[1] - 2.2, 0)
                pursuer.keyframe_insert(data_path="location", frame=start_f)
                pursuer.location = (subj_pos[0] - 0.6, subj_pos[1] - 1.3, 0)
                pursuer.keyframe_insert(data_path="location", frame=end_f)

        # Aim target empty for camera
        aim_target = bpy.data.objects.new(f"SF_Aim_SH{idx+1:02d}", None)
        aim_target.empty_display_type = 'PLAIN_AXES'
        aim_target.empty_display_size = 0.35
        aim_target.location = (subj_pos[0], subj_pos[1], subj_pos[2] + 1.25)
        previz_col.objects.link(aim_target)

        # Create Shot Camera
        cam_data = bpy.data.cameras.new(name=f"SF_Cam_SH{idx+1:02d}")
        cam_data.lens = focal
        cam_data.passepartout_alpha = 0.85
        cam_obj = bpy.data.objects.new(name=f"SF_Cam_SH{idx+1:02d}_{shot.get('shotType', 'MS')}", object_data=cam_data)
        previz_col.objects.link(cam_obj)

        # Keyframe Camera Start -> End
        cam_obj.location = (cam_start[0], cam_start[1], cam_start[2])
        cam_obj.keyframe_insert(data_path="location", frame=start_f)
        cam_obj.location = (cam_end[0], cam_end[1], cam_end[2])
        cam_obj.keyframe_insert(data_path="location", frame=end_f)

        # Linear interpolation for crisp previz camera motion
        if cam_obj.animation_data and cam_obj.animation_data.action:
            for fcurve in getattr(cam_obj.animation_data.action, "fcurves", []):
                for kp in fcurve.keyframe_points:
                    kp.interpolation = 'LINEAR'

        # Track-To Constraint so camera stays framed on subject
        track = cam_obj.constraints.new(type='TRACK_TO')
        track.target = aim_target
        track.track_axis = 'TRACK_NEGATIVE_Z'
        track.up_axis = 'UP_Y'

        # Bind camera to timeline marker so Blender switches cameras automatically on playback
        marker_name = f"SH{idx+1:02d}_{shot.get('shotType', 'MS')}_{shot.get('title', '')[:14]}"
        marker = scene.timeline_markers.new(name=marker_name, frame=start_f)
        marker.camera = cam_obj

        if idx == 0:
            scene.camera = cam_obj

        current_frame = end_f + 1

    scene.frame_start = 1
    scene.frame_end = max(24, current_frame - 1)
    scene.frame_current = 1

    print(f"StoryForge Previz Built: {len(shots)} shots, {scene.frame_end} frames at {fps} FPS.")

build_storyforge_previz()
`;
}
