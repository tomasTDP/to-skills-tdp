# Sprite generation prompts

Twelve heroes, twelve prompts. Generate each one as a PNG with a transparent background and drop it into `landing/sprites/<hero-id>.png`. Once the file is there it replaces the CSS placeholder automatically.

## Style anchors (paste into every prompt)

> **STYLE**: 16-bit pixel art character sprite, full body, front view, idle pose, transparent background, 64×64 native resolution upscaled to 256×256 with nearest-neighbor (crisp edges, no blur, no anti-aliasing). Limited NES-inspired palette: 4–5 colors per sprite plus black outline and one highlight color. Slight chunky proportions, big head, expressive helmet/visor, defined silhouette readable at 32 pixels. Inspired by Mighty Morphin Power Rangers, Mega Man, Sentai team color schemes.

## Recommended tools

| Tool | Strength | Notes |
|---|---|---|
| **Recraft.ai** | Has a "pixel art" style preset | Most consistent results out of the box |
| **Sora / DALL-E 3** (ChatGPT) | Built-in for ChatGPT users | Tends to soften pixels — ask for "no anti-aliasing, crisp 1-pixel edges" |
| **Midjourney** | Best variety | Add `--style raw --ar 1:1` and "pixel art, no anti-aliasing" |
| **Flux + pixel-art LoRA** (fal.ai / Replicate) | Most authentic 8-bit feel | Needs API key |

After generating, you may need to **post-process** with a pixelation pass (Photoshop > Image > Pixelate, or [pixelator.app](https://pixelator.app)) if the model produces a smooth painting instead of true pixel art.

---

## Hero 1 — `figma-use` // THE MCP WIZARD

> **STYLE** + a 16-bit pixel art **mage / wizard hero** in cyan armor (#00ddff) with a glowing cyan circuit-pattern cape. Holds a small floating screen / monitor sprite in one hand, casting a beam of cyan light. Helmet has a single vertical visor slit. Background: transparent.

---

## Hero 2 — `figma-generate-design` // THE PORTAL OPENER

> **STYLE** + a 16-bit pixel art **portal mage hero** in royal blue armor (#0077ff) with a swirling portal sprite behind them. Holding a glowing rectangular frame (suggesting a Figma frame) in both hands. Helmet has dual antennas. Cape: deep blue with white star pattern. Background: transparent.

---

## Hero 3 — `frontend-design` // THE ARCHITECT

> **STYLE** + a 16-bit pixel art **architect hero** in hot pink/magenta armor (#ff00aa) holding a glowing T-square and a paintbrush, one in each hand. Chest emblem: a stylized "A" or geometric shape. Confident pose, slight smirk. Cape: magenta with grid pattern. Background: transparent.

---

## Hero 4 — `web-design-guidelines` // THE INSPECTOR

> **STYLE** + a 16-bit pixel art **inspector hero** in violet armor (#aa00ff) wearing a magnifying glass attachment over the visor, like a steampunk monocle. Holding a small checklist clipboard sprite. Chest emblem: stylized eye. Background: transparent.

---

## Hero 5 — `accessibility` // THE GUARDIAN

> **STYLE** + a 16-bit pixel art **paladin hero** in emerald green armor (#00ff88) holding a large round shield with a universal accessibility symbol (stylized person) on it. Pose: shield raised in defense. Helmet has wing details on the sides. Background: transparent.

---

## Hero 6 — `marketing-psychology` // THE PERSUADER

> **STYLE** + a 16-bit pixel art **bard / strategist hero** in orange armor (#ff7700) holding a small scroll with persuasion symbols. Wears a small crown above the helmet. Chest emblem: brain icon. Background: transparent.

---

## Hero 7 — `prompt-engineer` // THE WHISPERER

> **STYLE** + a 16-bit pixel art **mystic / oracle hero** in violet-purple armor (#cc66ff) with a hood over the helmet. Holding a floating glowing rune or text bubble. Chest emblem: stylized "{}" curly braces. Cape: deep purple with star constellation pattern. Background: transparent.

---

## Hero 8 — `extract-design-system` // THE SCAVENGER

> **STYLE** + a 16-bit pixel art **scavenger / engineer hero** in yellow/gold armor (#ffdd00) wearing a tool-belt with small tokens (color swatches, type ruler) attached. Holding a tiny eyedropper tool. Helmet has a single goggle. Background: transparent.

---

## Hero 9 — `find-skills` // THE SEEKER

> **STYLE** + a 16-bit pixel art **scout hero** in lime green armor (#88ff00) holding a glowing compass that points to a distant icon. Wears a small backpack and binoculars hanging from neck. Helmet has a single antenna with a radar dish on top. Background: transparent.

---

## Hero 10 — `create-skill` // THE CURSOR FORGER (Cursor)

> **STYLE** + a 16-bit pixel art **blacksmith hero** in red armor (#ff3344) holding a glowing hammer mid-strike. Anvil sprite at their feet with sparks. Chest emblem: a stylized cursor arrow ▲. Helmet has a single horn on top. Background: transparent.

---

## Hero 11 — `skill-creator` // THE CODEX FORGER (Codex)

> **STYLE** + a 16-bit pixel art **blacksmith hero** in orange-red armor (#ff6633), similar pose to Hero 10 but with a different stance — holding a chisel and small tablet/codex book. Chest emblem: stylized book ▲. Helmet has dual horns. Background: transparent.

---

## Hero 12 — `writing-skills` // THE GRAND FORGER (Claude Code)

> **STYLE** + a 16-bit pixel art **grand blacksmith hero** in gold/amber armor (#ffaa00) holding both a hammer and an open scroll mid-air. More elaborate armor than the other two forgers (cape, shoulder pads). Chest emblem: glowing book/scroll. Helmet has a small crown integrated. Background: transparent.

---

## Notes

- Try to use the **same hand-drawn / engine settings** across all 12 prompts (same seed if possible, or same model + same params) so the team feels cohesive.
- If a model gives you something close but not perfect, you can iterate with "same character, but [tweak]" prompts.
- Save each as `landing/sprites/<hero-id>.png`. The hero IDs are:
  ```
  figma-use, figma-generate-design, frontend-design, web-design-guidelines,
  accessibility, marketing-psychology, prompt-engineer, extract-design-system,
  find-skills, create-skill, skill-creator, writing-skills
  ```
- The landing falls back to CSS placeholder sprites when a PNG is missing, so you can ship the page now and replace sprites as you generate them.
