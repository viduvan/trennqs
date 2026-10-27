# River Quest Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bright, lightly 3D “Hành trình hai dòng sông” experience at `dist/hanh-trinh-hai-dong-song/` while preserving the existing root endpoint byte-for-byte.

**Architecture:** Keep the existing buildless root site frozen. Implement the second endpoint as an independent HTML/CSS/ES-module bundle that shares only the original map image; export pure knowledge, quiz, sound, and motion helpers for Node tests, then bind them to accessible DOM interactions in the browser.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Web Audio API, Node.js built-in test runner, GitHub Pages static artifact.

**Spec:** `docs/superpowers/specs/2026-10-27-two-endpoint-river-quest-design.md`

## Global Constraints

- Preserve `dist/index.html`, `dist/styles.css`, `dist/app.mjs`, and `dist/assets/ban-do-ai-cap-luong-ha.png` byte-for-byte.
- Publish the new endpoint at `dist/hanh-trinh-hai-dong-song/index.html` with relative asset paths that work under `/trennqs/hanh-trinh-hai-dong-song/`.
- Use no runtime libraries, server code, accounts, analytics, or persistent learner data.
- Keep exactly four knowledge pairs and answer A as the only correct quiz answer.
- Keep the approved conclusion text unchanged in meaning and show it only after a correct answer.
- Use CSS perspective and bounded pointer motion only; honor touch devices and `prefers-reduced-motion`.
- Preserve keyboard operation, readable Vietnamese, ARIA state, and minimum practical 44 px controls.

## Review Focus

- GitHub project-path loading: every new CSS, JS, and map URL must resolve from the nested endpoint without a leading slash.
- Legacy regression: checksums for the existing endpoint and map must remain identical.
- Audio-disabled or unsupported browsers: all learning interactions must continue without errors.
- Repeated/fast selections: matched cards cannot be reused and wrong attempts cannot erase progress.
- Mobile/reduced-motion: no page-level horizontal overflow, pointer parallax disabled, map scrolling remains contained.

---

### Task 1: Freeze the legacy endpoint and create the new semantic shell

**Files:**
- Create: `tests/legacy-checksums.json`
- Create: `tests/river-quest.test.mjs`
- Create: `dist/hanh-trinh-hai-dong-song/index.html`

**Interfaces:**
- Consumes: the approved three-stage content and shared map at `../assets/ban-do-ai-cap-luong-ha.png`.
- Produces: sections `kham-pha`, `ket-noi`, `giai-thich`; controls `data-region`, `data-card-id`, `name="answer"`, `sound-toggle`; module reference `app.mjs` and stylesheet reference `styles.css`.

- [ ] **Step 1: Record legacy SHA-256 values and write failing structure tests**

Add tests named `legacy endpoint remains byte-for-byte unchanged`, `river quest exposes exactly three journey stages`, and `nested endpoint uses relative local assets`. Assert the four recorded checksums, exact section IDs, two region controls, eight matching cards, three quiz options, `../assets/ban-do-ai-cap-luong-ha.png`, `styles.css`, and `app.mjs` with no root-relative URL.

- [ ] **Step 2: Run the suite and verify RED**

Run: `npm test`
Expected: FAIL because `dist/hanh-trinh-hai-dong-song/index.html` does not exist.

- [ ] **Step 3: Implement the accessible semantic HTML shell**

Create the three journey sections, progress navigation, map mission, region information container, exact four-pair card markup, quiz A/B/C, conclusion, reset controls, and sound toggle. Do not add placeholder links or non-functional buttons.

- [ ] **Step 4: Run the suite and verify GREEN**

Run: `npm test`
Expected: all structure and legacy checksum tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/legacy-checksums.json tests/river-quest.test.mjs dist/hanh-trinh-hai-dong-song/index.html
git commit -m "feat: add river quest endpoint shell"
```

### Task 2: Add tested learning and sound state

**Files:**
- Create: `dist/hanh-trinh-hai-dong-song/app.mjs`
- Modify: `tests/river-quest.test.mjs`

**Interfaces:**
- Produces: `PAIR_MAP: Readonly<Record<string,string>>`, `SOUND_PATTERNS`, `evaluateMatch(firstId, secondId): boolean`, `evaluateAnswer(value): {correct:boolean, kind:string}`, `nextMatchState(state, firstId, secondId)`, and `init()` guarded for browser-only execution.
- Consumes: DOM IDs and data attributes created in Task 1.

- [ ] **Step 1: Write failing domain-state tests**

Test the four exact pairs in both selection orders, wrong attempts preserving `completedIds`, matched-card reuse being ignored, A/B/C/empty quiz results, five distinct bounded sound patterns, and muted state preventing sound scheduling.

- [ ] **Step 2: Run the suite and verify RED**

Run: `npm test`
Expected: FAIL because `app.mjs` and its exports do not exist.

- [ ] **Step 3: Implement pure state helpers and DOM bindings**

Bind region opening/closing, progress count, matching feedback/reset, quiz feedback/reset/conclusion, contextual Web Audio, and the session-only sound toggle. Use the exact historical copy from the approved spec and existing endpoint.

- [ ] **Step 4: Run the suite and verify GREEN**

Run: `npm test && node --check dist/hanh-trinh-hai-dong-song/app.mjs`
Expected: all tests pass and syntax check exits 0.

- [ ] **Step 5: Commit**

```bash
git add tests/river-quest.test.mjs dist/hanh-trinh-hai-dong-song/app.mjs
git commit -m "feat: add river quest learning interactions"
```

### Task 3: Build the bright 3D visual system and bounded motion

**Files:**
- Create: `dist/hanh-trinh-hai-dong-song/styles.css`
- Modify: `dist/hanh-trinh-hai-dong-song/app.mjs`
- Modify: `tests/river-quest.test.mjs`

**Interfaces:**
- Produces: CSS tokens for cream/sand/river/earth colors; perspective map scene; raised mission and match cards; responsive breakpoints; reduced-motion rules; `calculateTilt(pointerX, pointerY, bounds): {rotateX:number, rotateY:number}` clamped to ±3 degrees.
- Consumes: semantic classes and DOM bindings from Tasks 1–2.

- [ ] **Step 1: Write failing motion and stylesheet-contract tests**

Test tilt center returns zero, corner values stay within ±3, missing/zero bounds return zero, the stylesheet defines `perspective`, focus-visible rules, `prefers-reduced-motion`, coarse-pointer behavior, and a max-width mobile breakpoint.

- [ ] **Step 2: Run the suite and verify RED**

Run: `npm test`
Expected: FAIL because `styles.css` and `calculateTilt` do not exist.

- [ ] **Step 3: Implement visual design and progressive motion**

Create the approved light palette, asymmetric river journey, layered map depth, clear selected/correct/wrong states, contained mobile map scroller, and pointer-only tilt using `requestAnimationFrame`. Disable nonessential motion for reduced-motion and coarse-pointer users.

- [ ] **Step 4: Run the suite and verify GREEN**

Run: `npm test && node --check dist/hanh-trinh-hai-dong-song/app.mjs && git diff --check`
Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add tests/river-quest.test.mjs dist/hanh-trinh-hai-dong-song/styles.css dist/hanh-trinh-hai-dong-song/app.mjs
git commit -m "feat: add bright 3d river quest design"
```

### Task 4: Browser QA and two-endpoint deployment verification

**Files:**
- Modify only if a failing test identifies a defect: files owned by Tasks 1–3.

**Interfaces:**
- Consumes: both complete static endpoints and the existing `.github/workflows/deploy-pages.yml` artifact path `dist`.
- Produces: verified desktop/mobile behavior and a publishable repository state.

- [ ] **Step 1: Run final automated verification**

Run: `npm test && node --check dist/app.mjs && node --check dist/hanh-trinh-hai-dong-song/app.mjs && git diff --check`
Expected: all commands exit 0; legacy checksum test confirms no old-endpoint drift.

- [ ] **Step 2: Verify both endpoints through a local static server**

Check `/` and `/hanh-trinh-hai-dong-song/` at desktop and 390 px mobile widths. Exercise both region panels, one wrong and all four correct matches, reset, B/C retry, A conclusion, sound toggle, keyboard focus, and reduced-motion. Inspect console and network for errors/404s.

- [ ] **Step 3: Verify the GitHub Pages artifact contract**

Confirm `.github/workflows/deploy-pages.yml` uploads `path: dist` and that both `dist/index.html` and `dist/hanh-trinh-hai-dong-song/index.html` are present at artifact roots.

- [ ] **Step 4: Commit any QA-only fixes with a focused RED→GREEN test**

If no fixes are required, do not create an empty commit.

- [ ] **Step 5: Push and verify deployment when authorized**

After pushing `main`, confirm both `https://viduvan.github.io/trennqs/` and `https://viduvan.github.io/trennqs/hanh-trinh-hai-dong-song/` load without errors and the root endpoint is visually unchanged.
