---
name: vr-clothing
description: 'Build 3D clothing/garment assets for VR avatars (VRChat, Resonite, VTuber rigs, kisekae outfit systems) using Marvelous Designer for pattern-based cloth simulation, then pipe the result into Blender for retopology, weight transfer, PhysBones, and texture baking. Use when the user mentions "Marvelous Designer", "VR clothing", "kisekae outfit", "garment pattern", "cloth sim for avatar", "VRChat outfit", or is working in a project like example-vr-outfit. Replaces/supplements hand-rolled procedural cloth-mesh scripts with real sewing-pattern-based garments.'
metadata:
  version: "0.1.0"
---

# VR Clothing (Marvelous Designer → VR Avatar Pipeline)

Real garments for VR avatars are built from 2D sewing patterns simulated onto a 3D body, not hand-authored polygon rings. Marvelous Designer (MD) is the industry tool for this, it's what most VRChat/VTuber costume artists actually use. This skill covers the MD authoring workflow and the handoff back into Blender/Unity for a real-time VR-ready asset.

## When this replaces vs. supplements procedural scripts

Projects like `example-vr-outfit` (`${PROJECTS_ROOT}\example-vr-outfit`) built garments procedurally in Blender: polar cross-section rings raycast onto the body surface (`scripts/build_outfit_v4.py`), then a Blender Cloth modifier sim, then baked PBR textures. That approach is fast to iterate headlessly and fully scriptable, but it approximates drape with 8-direction radial sampling, it can't do real seams, darts, layered garments (hoodie over shirt), or pattern-accurate wrinkle behavior.

MD gives you real sewing patterns + industrial cloth sim (fabric presets: cotton, denim, leather, knit) + auto-generated UVs that literally match the pattern pieces. Use MD when fit/drape quality matters (hero outfit, marketplace asset, hero VRChat avatar). Keep the procedural Blender scripts for fast prototyping, body-fit testing, or programmatic variant generation.

## Pipeline overview

```
Body FBX (rigged avatar)
   → Import as Avatar in Marvelous Designer
   → Draft/place 2D pattern pieces, sew seams
   → Simulate (fabric preset + particle distance)
   → Retopologize + freeze
   → Export FBX/OBJ (pattern-based UVs come along for free)
   → Blender: cleanup, weight transfer to avatar armature, merge with body
   → Bake AO/normal/curvature onto the pattern-UV textures
   → Rig dynamics (VRChat PhysBones / Resonite DynamicBone equivalents) on loose parts (hood, drawstrings, cargo straps)
   → Check poly/material budget for target platform, export to Unity/engine
```

## Step 1: Get the avatar into Marvelous Designer

- Export the body mesh from Blender as **FBX** (or OBJ if no rig needed for draping) in **A-pose or T-pose**, not the fight/idle pose, MD sims fit best on a neutral pose.
- MD's internal unit is **cm**. Before import, sanity-check the Blender scene's `unit_settings.scale_length` (the existing `scripts/inspect_body.py` in example-vr-outfit already dumps this, rerun it if unsure) and make sure the body height comes in around 150-180 (real-world cm) after import. If it lands off by 10x/100x, the FBX exported in the wrong unit scale.
- In MD: **File → Add Avatar → Import** (not "Import Garment") so it's flagged as collision geometry for the sim, not a garment layer.
- Freeze the avatar so it doesn't get accidentally selected/moved (Avatar panel → lock icon).

## Step 2: Build or import the pattern

Two paths, pick based on the garment:

**A. Start from MD's built-in library** (fastest for common garments, hoodie, T-shirt, cargo pants, jacket are all in the default asset library under `Library` panel). Drag the template onto the avatar, then reshape pattern pieces to match the avatar's proportions (drag pattern points in 2D window, or use `Edit > Grade` for is proportional scaling).

**B. Draft from scratch** for anything custom (unique hardware, asymmetric cuts, stylized proportions):
1. Use the **Rectangle**/**Free Polygon** tool in the 2D pattern window to block out each panel (front torso, back torso, sleeve, hood, cargo pocket, etc.)
2. Position each piece near where it sits on the body in the 3D window (rough placement, the sim will pull it into place).
3. Use the **Sew** tool (line-to-line or point-to-point) to join panel edges, every seam in the real garment needs an explicit sew line or it won't hold together in sim.
4. Internal lines (**Internal Line/Polygon** tool) for topstitching, seam decoration, or pocket flaps that shouldn't be separate simulated panels.

For the current example hoodie+cargo outfit specifically: build 2 garments (hoodie as one sew group, cargo pants as a second) so they simulate as separate layers with correct hoodie-over-waistband collision, matches the existing texture set (`Hoodie_Fabric`, `Hoodie_Rib`, `Cargo_Fabric`, `Cargo_Rib`, `Hardware_Metal` already exist under `export/textures/`).

## Step 3: Simulate

- Set **Fabric** per panel/garment in the Fabric tab: cotton-ish preset for hoodie body, rib-knit preset (higher stretch) for cuffs/waistband/hood-rib, denim/canvas preset for cargo pants, leather/rigid for any strap or hardware-adjacent panel.
- **Particle Distance**: lower = higher sim fidelity + more verts. Use 15-20mm for a first-pass fit check, drop to 8-10mm for the final sim once proportions are locked, going straight to fine particle distance wastes sim time on a garment you'll still be reshaping.
- Hit **Simulate** (space bar). Use **Pin** points to hold problem areas (e.g. pin the hoodie hem to the waist while it settles) if it's sliding somewhere wrong.
- Iterate: pause sim, adjust 2D pattern points, resume, MD re-drapes live. This is the actual advantage over the procedural approach: real-time fit iteration instead of re-running a headless Blender script.

## Step 4: Retopologize + freeze

- Menu **Cloth → Retopology** (or the Retopology tool in newer MD versions), converts the dense triangulated sim mesh into a clean, lower-poly quad-dominant mesh. Do this per-garment before export; skipping it hands you a sim mesh with 10-50x more polys than a real-time asset needs.
- Freeze the simulation (**Simulation → Freeze**) once retopo + final drape look right, this locks in the pose so exported geometry doesn't jump.

## Step 5: Export

- **File → Export → FBX** (or OBJ if no skinning needed yet). MD auto-generates UVs directly from the 2D pattern layout, this is a genuine advantage: texture space maps 1:1 to garment panels, so painting/baking is intuitive.
- Export texture/UV template (**Texture → Export Texture Template**) if you need a clean pattern-layout PNG to guide texture painting or to feed into the existing procedural-texture generation approach already used for `Hoodie_Fabric_*` / `Cargo_Fabric_*` maps.

## Step 6: Back into Blender (this project's existing pipeline)

1. Import the MD FBX into `example_outfit.blend` alongside the body.
2. **Weight transfer**: MD garments export with no armature deformation. Use Blender's **Data Transfer** modifier or **Surface Deform** bound to the body, or manually weight-paint using the body's existing vertex groups (`inspect_body.py` prints these) as a reference for realistic bone influence around joints (hips, knees for cargo pants; shoulders for hoodie).
3. **Reuse the existing bake pipeline** (`scripts/build_outfit_v4.py` already has fabric texture generation logic), point it at the MD-exported UVs instead of the procedurally generated mesh's UVs; the AO/normal/basecolor/metallicsmooth/alpha map structure under `export/textures/` doesn't need to change, only what mesh + UVs they're baked onto.
4. **Dynamics for VR**: for VRChat, tag loose parts (hood back, drawstrings, cargo pocket flaps) as separate bones parented into the armature, then configure **PhysBones** in Unity (not Blender) on those bones. For Resonite, equivalent is DynamicBone/VRIK-driven cloth bones.

## Poly/material budget reality check

VRChat performance ranks ("Excellent" tier) target roughly ≤ 32k tris for a *full avatar including outfit*, ≤ 4 material slots, ≤ 1 skinned mesh where possible. A retopologized MD garment easily lands at 3-8k tris per garment piece if you retopo properly, don't skip Step 4, it's the difference between a "Poor"-rated avatar and a real one. Quest/Android targets are far stricter (10k tris avatar-wide, no PhysBones on some tiers), check current VRChat SDK docs for exact numbers before finalizing, they get revised.

## Common failure modes

- **Garment explodes in sim**: usually a missing or backwards sew line, or particle distance too coarse for a tight-fitting area (collar, cuff). Check the Sew tool list for orphaned edges.
- **Seams visible in final mesh**: retopology sometimes leaves a visible ridge at sew lines, smooth with a light relax/subdivide pass in Blender post-import, don't just crank retopo density.
- **UVs look "patchwork"**: that's actually MD's UV output working correctly (1 island per pattern piece), it's normal, not a bug, and is well-suited to texture painting per garment panel.
- **Body clipping through cloth**: increase garment ease (offset) slightly in the pattern, or add a thin collision buffer, don't just scale the whole garment up, it distorts proportions.
