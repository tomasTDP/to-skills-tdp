# to-skills-tdp

A curated bundle of 12 agent skills for design and product teams.

Most "skill collections" are kitchen-sink dumps. This one is the opposite: a small, opinionated set picked for the way a design / product team actually works — going from idea to interface, reviewing what's built, making decisions backed by behavioral science, bootstrapping design systems, and growing the toolkit on their own.

Works with Claude Code, Codex CLI, and Cursor.

---

## The set, at a glance

The 12 skills are organized into 5 buckets. Each bucket solves one problem in the design → product loop.

| # | Bucket | Skills |
|---|---|---|
| 1 | **Figma ↔ code bridge** | `figma-generate-design`, `figma-use` |
| 2 | **Build, review, a11y** | `frontend-design`, `web-design-guidelines`, `accessibility` |
| 3 | **Decisions + AI prompts** | `marketing-psychology`, `prompt-engineer` |
| 4 | **Design system bootstrap** | `extract-design-system` |
| 5 | **Grow the toolkit** | `find-skills`, `create-skill`, `skill-creator`, `writing-skills` |

---

## Install

Pick a skill and copy its folder into your tool's skills directory.

**Claude Code**
```bash
cp -R skills/<skill-name> ~/.claude/skills/
```

**Codex CLI**
```bash
cp -R skills/<skill-name> ~/.codex/skills/
```

**Cursor**
```bash
cp -R skills/<skill-name> ~/.cursor/skills-cursor/
```

If you'd rather keep them updated as this repo evolves, symlink instead:

```bash
ln -s "$PWD/skills/<skill-name>" ~/.claude/skills/<skill-name>
```

---

## The skills

### 1. Figma ↔ code bridge

#### `figma-generate-design`
**What it does** — Translates an application page, view, or multi-section layout into Figma from code. Triggers on phrases like "write to Figma", "create in Figma from code", "push this page to Figma", "build a landing page in Figma".
**How I use it** — When I want a Figma version of something I've already built (or am building) in code. I point the agent at the page in the repo and say "push this to Figma" and it lays out the screen using the design system I have set up. Saves me the round-trip of recreating a design that already exists.

#### `figma-use`
**What it does** — Mandatory prerequisite before any `use_figma` MCP call. Foundational context that prevents the most common write/read failures.
**How I use it** — I don't invoke it directly — it loads automatically before Figma write operations. If I'm debugging weird Figma plugin behavior, the first thing I check is whether this skill loaded.

---

### 2. Build, review, accessibility

#### `frontend-design`
**What it does** — Creates distinctive, production-grade frontend interfaces with high design quality. Avoids the generic "AI aesthetic" of identical sans-serif + flat color UI. Use for new web components, pages, dashboards, landing pages, or any styling/beautify pass.
**How I use it** — Whenever I ask Claude to build a UI from scratch I want this skill on, otherwise the output drifts into generic territory. I use it for client demos, new product pages, and anytime "good taste" matters more than just "functional".

#### `web-design-guidelines`
**What it does** — Reviews UI code against Web Interface Guidelines (UX, accessibility, design conventions).
**How I use it** — As a second-pass review after I've built something. I run it on a page and ask for a structured audit. Catches things I miss when I'm too deep in the implementation — touch target sizes, focus states, type hierarchy, common UX mistakes.

#### `accessibility`
**What it does** — Audits and improves web accessibility following WCAG 2.2. Use for a11y audits, WCAG compliance, screen reader support, keyboard navigation.
**How I use it** — Before shipping anything user-facing I run an a11y pass. Pairs well with `web-design-guidelines` — that one catches design issues, this one catches compliance issues. Two different lenses on the same code.

---

### 3. Decisions + AI prompts

#### `marketing-psychology`
**What it does** — Applies psychological principles, mental models, and behavioral science to marketing decisions. Covers anchoring, social proof, scarcity, loss aversion, framing, nudge theory.
**How I use it** — When I'm writing copy for landing pages, pricing, onboarding flows, or CTAs and want to ground the decision in a real principle instead of "this feels right". Useful as a sparring partner — I describe the goal and the audience, it suggests which principles apply and how to apply them.

#### `prompt-engineer`
**What it does** — Writes, refactors, and evaluates prompts for LLMs. Generates optimized templates, structured output schemas, evaluation rubrics, and test suites.
**How I use it** — Every AI feature I build, the prompt lives somewhere as a config. I use this skill to refactor those prompts when they get flaky, to convert ad-hoc prompts to structured ones (JSON / function calling), and to write evals so I know if changes actually improved things.

---

### 4. Design system bootstrap

#### `extract-design-system`
**What it does** — Extracts design primitives (color, typography, spacing) from a public website and generates starter token files.
**How I use it** — When starting a new project I point it at a reference site (sometimes a competitor, sometimes a design I admire, sometimes my own existing site) and get back a starter set of tokens. Faster than building tokens from scratch, and gives me a real baseline to iterate from.

---

### 5. Grow the toolkit

#### `find-skills`
**What it does** — Helps discover and install agent skills when you ask "is there a skill for X?" or "how do I do Y?".
**How I use it** — When I'm about to write a custom workflow, I check first if a skill already exists. Stops me from reinventing things and surfaces skills I didn't know about.

#### `create-skill` (Cursor)
**What it does** — Authors new Cursor Agent Skills. Use when writing a new SKILL.md or asking how the skill format works.
**How I use it** — When I'm working in Cursor and notice myself repeating the same workflow more than twice, I use this to package it as a skill.

#### `skill-creator` (Codex)
**What it does** — Guides creation of effective Codex skills. Use when creating or updating a skill that extends Codex with specialized knowledge or workflows.
**How I use it** — Same idea as `create-skill` but for Codex. Includes scaffolding scripts and assets the Cursor version doesn't have.

#### `writing-skills` (Claude Code / superpowers)
**What it does** — Creates, edits, and verifies skills before deployment. Includes best practices, examples, graph conventions, and subagent-based testing.
**How I use it** — This is the most thorough of the three create-skill variants. I use it when the skill I'm building is going to be shared with others (vs. a personal one-off) because it includes the testing and verification steps the others skip.

> **Which one should you use?** If you're on Cursor, use `create-skill`. If you're on Codex, use `skill-creator`. If you're on Claude Code, use `writing-skills`. They overlap in spirit but each is tuned to its own tool.

---

## Attribution

These skills come from several upstream sources. This repo bundles them for convenience — original authors retain credit.

| Skill | Source |
|---|---|
| `figma-generate-design`, `figma-use` | Figma MCP plugin |
| `frontend-design` | [`claude-plugins-official`](https://github.com/anthropics/claude-plugins-official) marketplace |
| `web-design-guidelines`, `accessibility`, `marketing-psychology`, `prompt-engineer`, `extract-design-system`, `find-skills` | Community / `obie/agents` skill collection |
| `create-skill` | Cursor (`~/.cursor/skills-cursor/`) |
| `skill-creator` | Codex (Apache 2.0) |
| `writing-skills` | [`superpowers`](https://github.com/obra/superpowers) plugin |

If you're the author of any of these and want changes to the attribution or want the skill removed, open an issue.

---

## License

The bundling, README, and any original additions are MIT. Each individual skill retains the license of its upstream source.
