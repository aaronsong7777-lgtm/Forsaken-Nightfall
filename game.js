const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const timeEl = document.getElementById("time");
const hpEl = document.getElementById("hp");
const staminaEl = document.getElementById("stamina");
const abilityEl = document.getElementById("ability");
const gensEl = document.getElementById("gens");
const teamEl = document.getElementById("team");
const statusEl = document.getElementById("status");
const teamList = document.getElementById("teamList");
const overlay = document.getElementById("overlay");
const homeMenu = document.getElementById("homeMenu");
const endMenu = document.getElementById("endMenu");
const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const startBtn = document.getElementById("startBtn");
const homeBtn = document.getElementById("homeBtn");
const againBtn = document.getElementById("againBtn");
const modeButtons = document.querySelectorAll("[data-mode]");
const survivorGrid = document.getElementById("survivorGrid");
const killerGrid = document.getElementById("killerGrid");
const abilityNameEl = document.getElementById("abilityName");
const abilityDescEl = document.getElementById("abilityDesc");
const abilityFillEl = document.getElementById("abilityFill");
const abilityCooldownEl = document.getElementById("abilityCooldown");
const menuAbilityName = document.getElementById("menuAbilityName");
const menuAbilityDesc = document.getElementById("menuAbilityDesc");

const W = canvas.width;
const H = canvas.height;
const REQUIRED_GENS = 5;
const keys = new Set();
const walls = [
  { x: 0, y: 0, w: W, h: 24 },
  { x: 0, y: H - 24, w: W, h: 24 },
  { x: 0, y: 0, w: 24, h: H },
  { x: W - 24, y: 0, w: 24, h: H },
  { x: 112, y: 82, w: 230, h: 34 },
  { x: 478, y: 78, w: 310, h: 34 },
  { x: 202, y: 208, w: 38, h: 236 },
  { x: 392, y: 164, w: 34, h: 270 },
  { x: 568, y: 222, w: 244, h: 34 },
  { x: 108, y: 486, w: 270, h: 34 },
  { x: 598, y: 430, w: 226, h: 34 },
  { x: 720, y: 330, w: 36, h: 110 },
];

let selectedMode = "normal";
let selectedSurvivor = "Runner";
let selectedKiller = "Malice";
let state;
let running = false;
let lastTime = 0;
let interactPressed = false;
let abilityPressed = false;

const survivorData = [
  { name: "Runner", role: "Runner", color: "#65d6ff", hp: 100, stamina: 125, speed: 154, sprint: 242, repair: 1, heal: 1, ability: "Dash" },
  { name: "Medic", role: "Medic", color: "#5de096", hp: 105, stamina: 105, speed: 145, sprint: 218, repair: 0.95, heal: 1.65, ability: "Team Heal" },
  { name: "Mechanic", role: "Mechanic", color: "#ffd166", hp: 95, stamina: 100, speed: 142, sprint: 214, repair: 1.55, heal: 0.9, ability: "Overclock" },
  { name: "Scout", role: "Scout", color: "#b986ff", hp: 90, stamina: 135, speed: 158, sprint: 252, repair: 0.92, heal: 0.95, ability: "Reveal" },
  { name: "Guard", role: "Guard", color: "#f28f3b", hp: 130, stamina: 85, speed: 132, sprint: 198, repair: 0.9, heal: 0.9, ability: "Block" },
  { name: "Hacker", role: "Hacker", color: "#42f5c8", hp: 90, stamina: 100, speed: 144, sprint: 216, repair: 1.35, heal: 1, ability: "Remote Gen" },
  { name: "Brawler", role: "Brawler", color: "#ff7a7a", hp: 120, stamina: 95, speed: 138, sprint: 208, repair: 0.85, heal: 0.85, ability: "Shove" },
  { name: "Courier", role: "Courier", color: "#9ae66e", hp: 95, stamina: 145, speed: 160, sprint: 258, repair: 0.9, heal: 1, ability: "Second Wind" },
  { name: "Engineer", role: "Engineer", color: "#f8c471", hp: 100, stamina: 95, speed: 140, sprint: 210, repair: 1.75, heal: 0.85, ability: "Instant Fix" },
  { name: "Oracle", role: "Oracle", color: "#d7b7ff", hp: 88, stamina: 115, speed: 146, sprint: 226, repair: 1, heal: 1.15, ability: "Premonition" },
  { name: "Athlete", role: "Athlete", color: "#64f4ff", hp: 100, stamina: 155, speed: 162, sprint: 266, repair: 0.82, heal: 0.9, ability: "Long Sprint" },
  { name: "Caretaker", role: "Caretaker", color: "#a7f3d0", hp: 115, stamina: 100, speed: 140, sprint: 210, repair: 0.9, heal: 1.85, ability: "Revive Aura" },
];

const killerData = [
  { name: "Malice", color: "#e84a5f", hp: 999, speed: 118, damage: 32, ability: "Shadow Lunge" },
  { name: "Warden", color: "#8d99ae", hp: 999, speed: 100, damage: 42, ability: "Lockdown" },
  { name: "Hollow", color: "#c77dff", hp: 999, speed: 110, damage: 28, ability: "Blink" },
  { name: "Static", color: "#65d6ff", hp: 999, speed: 112, damage: 30, ability: "EMP" },
  { name: "Butcher", color: "#ff8fab", hp: 999, speed: 96, damage: 50, ability: "Heavy Hit" },
  { name: "Shade", color: "#7b2cbf", hp: 999, speed: 126, damage: 24, ability: "Fade" },
  { name: "Ruin", color: "#ffb703", hp: 999, speed: 108, damage: 34, ability: "Trap Surge" },
];

const abilityDescriptions = {
  Dash: "Press Q to instantly recover stamina so you can keep running.",
  "Team Heal": "Press Q to heal nearby living teammates.",
  Overclock: "Press Q to repair generators much faster for a short time.",
  Reveal: "Press Q to reveal and briefly slow the hunter.",
  Block: "Press Q to heavily reduce the next hunter hits for a few seconds.",
  "Remote Gen": "Press Q to pulse progress into the nearest unfinished generator.",
  Shove: "Press Q near the hunter to stun them and create space.",
  "Second Wind": "Press Q to refill stamina and gain a short speed boost.",
  "Instant Fix": "Press Q near a generator for a huge repair burst.",
  Premonition: "Press Q to sense the hunter and interrupt their chase rhythm.",
  "Long Sprint": "Press Q to refill stamina and gain a stronger sprint.",
  "Revive Aura": "Press Q near downed teammates to rapidly revive them.",
};

function rectsHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function center(entity) {
  return { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeSurvivor(template, x, y, ai = true) {
  return {
    name: ai ? template.name : "You",
    role: template.role,
    x,
    y,
    w: 22,
    h: 22,
    color: template.color,
    ai,
    maxHp: template.hp,
    hp: template.hp,
    maxStamina: template.stamina,
    stamina: template.stamina,
    speed: template.speed,
    sprintSpeed: template.sprint,
    state: "alive",
    target: null,
    revive: 0,
    repairBoost: template.repair,
    healBoost: template.heal,
    ability: template.ability,
    abilityCooldown: 0,
    shield: 0,
    reveal: 0,
    overclock: 0,
  };
}

function resetGame() {
  const nightmare = selectedMode === "nightmare";
  const survivorTemplate = survivorData.find((item) => item.name === selectedSurvivor) || survivorData[0];
  const killerTemplate = killerData.find((item) => item.name === selectedKiller) || killerData[0];
  const teamTemplates = survivorData.filter((item) => item.name !== survivorTemplate.name).slice(0, 3);
  state = {
    time: nightmare ? 210 : 240,
    message: "Repair generators with your team",
    won: false,
    lost: false,
    exitsOpen: false,
    flareCooldown: 0,
    alarm: 0,
    hunter: {
      x: 850,
      y: 78,
      w: 30,
      h: 30,
      name: killerTemplate.name,
      color: killerTemplate.color,
      damage: killerTemplate.damage + (nightmare ? 6 : 0),
      ability: killerTemplate.ability,
      speed: killerTemplate.speed + (nightmare ? 12 : 0),
      baseSpeed: killerTemplate.speed + (nightmare ? 8 : 0),
      stun: 0,
      attack: 0,
      rage: 0,
      abilityTimer: 3,
      phase: 0,
    },
    survivors: [
      makeSurvivor(survivorTemplate, 70, 510, false),
      makeSurvivor(teamTemplates[0], 96, 468),
      makeSurvivor(teamTemplates[1], 58, 440),
      makeSurvivor(teamTemplates[2], 118, 520),
    ],
    gens: [
      { x: 78, y: 66, w: 32, h: 32, done: false, progress: 0, noise: 0 },
      { x: 836, y: 150, w: 32, h: 32, done: false, progress: 0, noise: 0 },
      { x: 112, y: 352, w: 32, h: 32, done: false, progress: 0, noise: 0 },
      { x: 482, y: 522, w: 32, h: 32, done: false, progress: 0, noise: 0 },
      { x: 820, y: 510, w: 32, h: 32, done: false, progress: 0, noise: 0 },
      { x: 524, y: 142, w: 32, h: 32, done: false, progress: 0, noise: 0 },
      { x: 302, y: 312, w: 32, h: 32, done: false, progress: 0, noise: 0 },
    ],
    exits: [
      { x: 438, y: 8, w: 86, h: 18 },
      { x: 438, y: H - 26, w: 86, h: 18 },
    ],
    traps: [
      { x: 320, y: 146, w: 54, h: 54 },
      { x: 710, y: 316, w: 54, h: 54 },
      { x: 510, y: 354, w: 48, h: 48 },
      { x: 855, y: 365, w: 48, h: 48 },
      { x: 276, y: 532, w: 44, h: 44 },
    ],
    fogPulse: 0,
  };
  updateHud();
}

function player() {
  return state.survivors[0];
}

function aliveSurvivors() {
  return state.survivors.filter((s) => s.state === "alive");
}

function activeSurvivors() {
  return state.survivors.filter((s) => s.state === "alive" || s.state === "downed");
}

function startGame() {
  const wasRunning = running;
  homeMenu.classList.add("hidden");
  endMenu.classList.add("hidden");
  overlay.classList.add("hidden");
  resetGame();
  running = true;
  lastTime = performance.now();
  if (!wasRunning) requestAnimationFrame(loop);
}

function showHome() {
  running = false;
  overlay.classList.remove("hidden");
  homeMenu.classList.remove("hidden");
  endMenu.classList.add("hidden");
  resetGame();
  draw();
}

function finish(title, text) {
  running = false;
  endTitle.textContent = title;
  endText.textContent = text;
  homeMenu.classList.add("hidden");
  endMenu.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function updateHud() {
  const p = player();
  const minutes = Math.floor(state.time / 60);
  const seconds = Math.max(0, Math.floor(state.time % 60));
  const done = state.gens.filter((gen) => gen.done).length;
  const alive = state.survivors.filter((mate) => mate.state === "alive").length;
  timeEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  hpEl.textContent = Math.max(0, Math.ceil(p.hp));
  staminaEl.textContent = `${Math.max(0, Math.ceil(p.stamina))}/${p.maxStamina}`;
  const cooldown = Math.ceil(p.abilityCooldown);
  abilityEl.textContent = cooldown > 0 ? `${cooldown}s` : "Ready";
  abilityNameEl.textContent = `Q: ${p.ability}`;
  abilityDescEl.textContent = abilityDescriptions[p.ability] || "Press Q to use your survivor ability.";
  abilityCooldownEl.textContent = cooldown > 0 ? `Cooldown ${cooldown}s` : "Ready";
  abilityFillEl.style.width = `${cooldown > 0 ? Math.max(0, 100 - (p.abilityCooldown / 14) * 100) : 100}%`;
  gensEl.textContent = `${done}/${REQUIRED_GENS}`;
  teamEl.textContent = `${alive} alive`;
  statusEl.textContent = state.exitsOpen ? "Exits open" : state.message;
  teamList.innerHTML = "";
  for (const mate of state.survivors) {
    const row = document.createElement("div");
    row.className = "mate-row";
    row.innerHTML = `<b>${mate.name}</b><span>${mate.state} ${Math.max(0, Math.ceil(mate.hp))}hp</span>`;
    teamList.appendChild(row);
  }
}

function moveEntity(entity, dx, dy) {
  entity.x += dx;
  for (const wall of walls) {
    if (rectsHit(entity, wall)) {
      entity.x += dx > 0 ? wall.x - (entity.x + entity.w) : wall.x + wall.w - entity.x;
    }
  }
  entity.y += dy;
  for (const wall of walls) {
    if (rectsHit(entity, wall)) {
      entity.y += dy > 0 ? wall.y - (entity.y + entity.h) : wall.y + wall.h - entity.y;
    }
  }
  entity.x = clamp(entity.x, 24, W - 24 - entity.w);
  entity.y = clamp(entity.y, 24, H - 24 - entity.h);
}

function moveToward(entity, target, speed, dt) {
  const from = center(entity);
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  moveEntity(entity, (dx / length) * speed * dt, (dy / length) * speed * dt);
}

function damageSurvivor(survivor, amount) {
  if (survivor.state !== "alive") return;
  survivor.hp -= amount;
  if (survivor.hp <= 0) {
    survivor.hp = 0;
    survivor.state = "downed";
    survivor.revive = 0;
    state.message = `${survivor.name} is down`;
  }
}

function updatePlayer(dt) {
  const p = player();
  if (p.state !== "alive") return;
  p.abilityCooldown = Math.max(0, p.abilityCooldown - dt);
  p.shield = Math.max(0, p.shield - dt);
  p.reveal = Math.max(0, p.reveal - dt);
  p.overclock = Math.max(0, p.overclock - dt);
  let ax = 0;
  let ay = 0;
  if (keys.has("a")) ax -= 1;
  if (keys.has("d")) ax += 1;
  if (keys.has("w")) ay -= 1;
  if (keys.has("s")) ay += 1;
  const length = Math.hypot(ax, ay) || 1;
  const wantsSprint = keys.has("shift") && p.stamina > 0 && (ax || ay);
  const speed = wantsSprint ? p.sprintSpeed : p.speed;
  moveEntity(p, (ax / length) * speed * dt, (ay / length) * speed * dt);
  p.stamina = clamp(p.stamina + (wantsSprint ? -42 : 26) * dt, 0, p.maxStamina);

  for (const trap of state.traps) {
    if (rectsHit(p, trap)) {
      damageSurvivor(p, 16 * dt);
      state.message = "Corruption drains you";
    }
  }
}

function nearestUnfixedGen(survivor) {
  let best = null;
  let bestDistance = Infinity;
  for (const gen of state.gens) {
    if (gen.done) continue;
    const d = dist(center(survivor), center(gen));
    if (d < bestDistance) {
      best = gen;
      bestDistance = d;
    }
  }
  return best;
}

function nearestDownedTeammate(survivor) {
  let best = null;
  let bestDistance = Infinity;
  for (const mate of state.survivors) {
    if (mate === survivor || mate.state !== "downed") continue;
    const d = dist(center(survivor), center(mate));
    if (d < bestDistance) {
      best = mate;
      bestDistance = d;
    }
  }
  return best;
}

function repairGen(gen, survivor, dt) {
  if (gen.done || survivor.state !== "alive") return;
  const boost = survivor.overclock > 0 ? survivor.repairBoost + 1.1 : survivor.repairBoost;
  gen.progress += dt * boost;
  gen.noise = 1.1;
  state.alarm = Math.max(state.alarm, 0.45);
  if (gen.progress >= 3) {
    gen.done = true;
    gen.progress = 3;
    state.message = `${survivor.name} repaired a generator`;
    if (state.gens.filter((item) => item.done).length >= REQUIRED_GENS) {
      state.exitsOpen = true;
      state.message = "Exit gates powered";
    }
  }
}

function updateObjectives(dt) {
  const p = player();
  for (const gen of state.gens) {
    gen.noise = Math.max(0, gen.noise - dt);
    if (gen.done || p.state !== "alive") continue;
    const close = dist(center(p), center(gen)) < 58;
    if (close) {
      state.message = "Hold E to repair";
      if (keys.has("e")) repairGen(gen, p, dt);
    }
  }

  for (const mate of state.survivors) {
    if (mate === p || mate.state !== "downed" || p.state !== "alive") continue;
    if (dist(center(p), center(mate)) < 54) {
      state.message = "Hold E to revive";
      if (keys.has("e")) {
        mate.revive += dt * p.healBoost;
        if (mate.revive >= 2.4) {
          mate.state = "alive";
          mate.hp = 45;
          mate.revive = 0;
          state.message = `${mate.name} revived`;
        }
      }
    }
  }
}

function updateTeammates(dt) {
  for (const mate of state.survivors) {
    if (!mate.ai || mate.state !== "alive") continue;
    const hunterClose = dist(center(mate), center(state.hunter)) < 150;
    const downed = nearestDownedTeammate(mate);
    if (hunterClose) {
      const away = center(mate);
      const h = center(state.hunter);
      moveToward(mate, { x: away.x + (away.x - h.x), y: away.y + (away.y - h.y) }, 174, dt);
    } else if (downed && dist(center(mate), center(downed)) < 260) {
      moveToward(mate, center(downed), 132, dt);
      if (dist(center(mate), center(downed)) < 52) {
        downed.revive += dt * mate.healBoost;
        if (downed.revive >= 2.7) {
          downed.state = "alive";
          downed.hp = 42;
          downed.revive = 0;
          state.message = `${mate.name} revived ${downed.name}`;
        }
      }
    } else {
      const target = nearestUnfixedGen(mate);
      if (target) {
        moveToward(mate, center(target), 118, dt);
        if (dist(center(mate), center(target)) < 54) repairGen(target, mate, dt * 0.78);
      } else if (state.exitsOpen) {
        moveToward(mate, center(state.exits[1]), 132, dt);
      }
    }

    for (const trap of state.traps) {
      if (rectsHit(mate, trap)) damageSurvivor(mate, 9 * dt);
    }
  }
}

function updateExits() {
  if (!state.exitsOpen) return;
  for (const survivor of state.survivors) {
    if (survivor.state !== "alive") continue;
    for (const exit of state.exits) {
      const near = dist(center(survivor), center(exit)) < 58;
      if (near && (survivor.ai || interactPressed)) {
        survivor.state = "escaped";
        survivor.hp = 100;
        state.message = `${survivor.name} escaped`;
      }
    }
  }
}

function useFlare() {
  const p = player();
  if (!abilityPressed || p.state !== "alive" || p.abilityCooldown > 0) return;
  p.abilityCooldown = 14;
  state.flareCooldown = p.abilityCooldown;

  if (p.ability === "Dash") {
    p.stamina = Math.min(p.maxStamina, p.stamina + 42);
    state.message = "Dash refilled stamina";
  } else if (p.ability === "Team Heal") {
    for (const mate of state.survivors) {
      if (mate.state === "alive" && dist(center(p), center(mate)) < 150) mate.hp = Math.min(mate.maxHp, mate.hp + 28);
    }
    state.message = "Team heal pulsed";
  } else if (p.ability === "Overclock") {
    p.overclock = 6;
    state.message = "Repair overclock active";
  } else if (p.ability === "Reveal" || p.ability === "Premonition") {
    p.reveal = 6;
    state.hunter.stun = Math.max(state.hunter.stun, 0.45);
    state.message = "Hunter revealed";
  } else if (p.ability === "Block") {
    p.shield = 5;
    state.message = "Block shield active";
  } else if (p.ability === "Remote Gen") {
    const gen = nearestUnfixedGen(p);
    if (gen) gen.progress = Math.min(3, gen.progress + 1.35);
    state.message = "Remote generator pulse";
  } else if (p.ability === "Shove") {
    if (dist(center(p), center(state.hunter)) < 96) state.hunter.stun = 1.8;
    state.message = "Shove used";
  } else if (p.ability === "Second Wind" || p.ability === "Long Sprint") {
    p.stamina = p.maxStamina;
    p.sprintSpeed += 18;
    state.message = "Second wind";
  } else if (p.ability === "Instant Fix") {
    const gen = nearestUnfixedGen(p);
    if (gen && dist(center(p), center(gen)) < 80) gen.progress = Math.min(3, gen.progress + 2.1);
    state.message = "Instant fix burst";
  } else if (p.ability === "Revive Aura") {
    for (const mate of state.survivors) {
      if (mate.state === "downed" && dist(center(p), center(mate)) < 180) mate.revive += 1.9;
    }
    state.message = "Revive aura";
  }
}

function useKillerAbility(target, dt) {
  const h = state.hunter;
  h.abilityTimer -= dt;
  if (!target || h.stun > 0 || h.abilityTimer > 0) return;
  h.abilityTimer = selectedMode === "nightmare" ? 4 : 5.5;
  if (h.ability === "Shadow Lunge") {
    moveToward(h, center(target), 470, 0.18);
    state.message = "Malice used Shadow Lunge";
  } else if (h.ability === "Lockdown") {
    state.alarm = 2.5;
    state.message = "Warden locked the halls";
  } else if (h.ability === "Blink") {
    h.x = clamp(target.x + 70, 24, W - 60);
    h.y = clamp(target.y + 40, 24, H - 60);
    state.message = "Hollow blinked";
  } else if (h.ability === "EMP") {
    for (const gen of state.gens) if (!gen.done) gen.progress = Math.max(0, gen.progress - 0.35);
    state.message = "Static disrupted generators";
  } else if (h.ability === "Heavy Hit") {
    h.attack = 0;
    state.message = "Butcher readied Heavy Hit";
  } else if (h.ability === "Fade") {
    h.phase = 2.2;
    state.message = "Shade faded";
  } else if (h.ability === "Trap Surge") {
    state.traps.push({ x: target.x - 18, y: target.y - 18, w: 50, h: 50 });
    state.message = "Ruin spawned corruption";
  }
}

function hunterTarget() {
  let best = null;
  let bestDistance = Infinity;
  for (const survivor of state.survivors) {
    if (survivor.state !== "alive") continue;
    let d = dist(center(state.hunter), center(survivor));
    if (survivor === player()) d *= 0.82;
    if (d < bestDistance) {
      best = survivor;
      bestDistance = d;
    }
  }
  return best;
}

function updateHunter(dt) {
  const h = state.hunter;
  h.attack = Math.max(0, h.attack - dt);
  h.stun = Math.max(0, h.stun - dt);
  h.phase = Math.max(0, h.phase - dt);
  h.rage += dt * 0.7;
  state.alarm = Math.max(0, state.alarm - dt);
  if (h.stun <= 0) {
    const target = hunterTarget();
    if (target) {
      useKillerAbility(target, dt);
      const speed = h.baseSpeed + Math.min(34, h.rage) + (state.exitsOpen ? 28 : 0) + state.alarm * 35;
      moveToward(h, center(target), speed, dt);
    }
  }

  for (const survivor of state.survivors) {
    if (survivor.state !== "alive") continue;
    if (rectsHit(survivor, h) && h.attack <= 0) {
      const shielded = survivor.shield > 0;
      const damage = shielded ? 8 : state.exitsOpen ? state.hunter.damage + 8 : state.hunter.damage;
      damageSurvivor(survivor, damage);
      h.attack = 0.75;
      state.message = `Hunter hit ${survivor.name}`;
    }
  }
}

function updateWinLoss() {
  const p = player();
  const escaped = state.survivors.filter((s) => s.state === "escaped").length;
  const living = state.survivors.filter((s) => s.state === "alive").length;
  if (p.state === "escaped") {
    finish("Escaped", `You made it out with ${escaped - 1} teammate${escaped === 2 ? "" : "s"}.`);
    return;
  }
  if (p.state === "downed" && living === 0) {
    finish("Wiped Out", "The hunter downed the whole team before anyone could escape.");
    return;
  }
  if (escaped > 0 && living === 0) {
    finish("Round Over", `${escaped} survivor${escaped === 1 ? "" : "s"} escaped the night.`);
  }
}

function update(dt) {
  state.time -= dt;
  state.fogPulse += dt;
  state.flareCooldown = Math.max(0, state.flareCooldown - dt);
  if (state.time <= 0) {
    state.time = 0;
    finish("Time Up", "The gates stayed shut too long. The hunter wins.");
    return;
  }
  useFlare();
  updatePlayer(dt);
  updateObjectives(dt);
  updateTeammates(dt);
  updateExits();
  updateHunter(dt);
  updateWinLoss();
  interactPressed = false;
  abilityPressed = false;
  updateHud();
}

function drawRect(rect, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h));
}

function drawPrism(rect, color, topColor = "#3a465a", height = 12) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(rect.x + 8, rect.y + 8, rect.w, rect.h);
  ctx.fillStyle = color;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(rect.x, rect.y);
  ctx.lineTo(rect.x + height, rect.y - height);
  ctx.lineTo(rect.x + rect.w + height, rect.y - height);
  ctx.lineTo(rect.x + rect.w, rect.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#151b25";
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.w, rect.y);
  ctx.lineTo(rect.x + rect.w + height, rect.y - height);
  ctx.lineTo(rect.x + rect.w + height, rect.y + rect.h - height);
  ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
  ctx.closePath();
  ctx.fill();
}

function drawMap() {
  ctx.fillStyle = "#0b1018";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#111a26";
  for (let x = 0; x < W; x += 48) {
    for (let y = 0; y < H; y += 48) {
      if ((x + y) % 96 === 0) ctx.fillRect(x, y, 46, 46);
    }
  }
  for (let x = 70; x < W; x += 150) {
    ctx.fillStyle = "rgba(101, 214, 255, 0.07)";
    ctx.fillRect(x, 24, 12, H - 48);
  }
  for (const wall of walls) drawPrism(wall, "#2a3445", "#46536a", 10);
  for (const trap of state.traps) {
    drawPrism(trap, "#351720", "#5c1f31", 8);
    ctx.fillStyle = "#e84a5f";
    ctx.fillRect(trap.x + 12, trap.y + 12, trap.w - 24, trap.h - 24);
  }
  for (const exit of state.exits) drawPrism(exit, state.exitsOpen ? "#5de096" : "#e84a5f", "#edf3ff", 8);
}

function drawGenerators() {
  for (const gen of state.gens) {
    drawPrism(gen, gen.done ? "#5de096" : "#ffd166", "#edf3ff", 7);
    ctx.fillStyle = "#0b1018";
    ctx.fillRect(gen.x + 7, gen.y + 8, 18, 16);
    if (!gen.done) {
      ctx.fillStyle = gen.noise > 0 ? "#e84a5f" : "#65d6ff";
      ctx.fillRect(gen.x, gen.y - 9, gen.w * Math.min(1, gen.progress / 3), 5);
    }
  }
}

function drawSurvivor(survivor) {
  if (survivor.state === "escaped") return;
  const color = survivor.state === "downed" ? "#6f7786" : survivor.color;
  drawPrism(survivor, color, "#edf3ff", 5);
  ctx.fillStyle = "#08100d";
  ctx.fillRect(survivor.x + 5, survivor.y + 6, 12, 10);
  ctx.fillStyle = survivor.hp > 35 ? "#5de096" : "#e84a5f";
  ctx.fillRect(survivor.x, survivor.y - 7, survivor.w * Math.max(0, survivor.hp / 100), 4);
  if (survivor.state === "downed") {
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(survivor.x, survivor.y + survivor.h + 3, survivor.w * Math.min(1, survivor.revive / 2.7), 4);
  }
}

function drawCharacters() {
  const h = state.hunter;
  drawPrism(h, h.stun > 0 ? "#ffffff" : h.color, h.phase > 0 ? "#6d28d9" : "#ffd166", 7);
  ctx.fillStyle = "#080b10";
  ctx.fillRect(h.x + 6, h.y + 7, 5, 5);
  ctx.fillRect(h.x + 19, h.y + 7, 5, 5);
  for (const survivor of state.survivors) drawSurvivor(survivor);

  const p = player();
  ctx.fillStyle = "#5de096";
  ctx.fillRect(28, H - 18, p.stamina * 1.6, 8);
  ctx.strokeStyle = "#d9e4f2";
  ctx.strokeRect(28, H - 18, 160, 8);
  ctx.fillStyle = state.flareCooldown <= 0 ? "#ffd166" : "#596577";
  ctx.fillRect(202, H - 18, state.flareCooldown <= 0 ? 96 : 96 * (1 - state.flareCooldown / 15), 8);
  ctx.strokeRect(202, H - 18, 96, 8);
}

function drawFog() {
  const p = player();
  const radius = 190 + Math.sin(state.fogPulse * 2) * 12;
  const pc = center(p);
  const gradient = ctx.createRadialGradient(pc.x, pc.y, radius * 0.22, pc.x, pc.y, radius);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function draw() {
  drawMap();
  drawGenerators();
  drawCharacters();
  drawFog();
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  if (running) requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["w", "a", "s", "d", "e", "q", "r", "shift"].includes(key)) event.preventDefault();
  if (key === "r") {
    startGame();
    return;
  }
  if (key === "e" && !keys.has("e")) interactPressed = true;
  if (key === "q" && !keys.has("q")) abilityPressed = true;
  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

for (const button of modeButtons) {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.mode;
    for (const item of modeButtons) item.classList.toggle("active", item === button);
  });
}

function renderPickers() {
  survivorGrid.innerHTML = "";
  killerGrid.innerHTML = "";
  const selected = survivorData.find((item) => item.name === selectedSurvivor) || survivorData[0];
  menuAbilityName.textContent = selected.ability;
  menuAbilityDesc.textContent = abilityDescriptions[selected.ability] || "Press Q to use this ability.";
  for (const survivor of survivorData) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `char-card${survivor.name === selectedSurvivor ? " active" : ""}`;
    button.innerHTML = `<b>${survivor.name}</b><span>${survivor.ability} · ${survivor.stamina} stamina</span>`;
    button.addEventListener("click", () => {
      selectedSurvivor = survivor.name;
      renderPickers();
      resetGame();
      draw();
    });
    survivorGrid.appendChild(button);
  }
  for (const killer of killerData) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `char-card${killer.name === selectedKiller ? " active" : ""}`;
    button.innerHTML = `<b>${killer.name}</b><span>${killer.ability}</span>`;
    button.addEventListener("click", () => {
      selectedKiller = killer.name;
      renderPickers();
      resetGame();
      draw();
    });
    killerGrid.appendChild(button);
  }
}

startBtn.addEventListener("click", startGame);
againBtn.addEventListener("click", startGame);
homeBtn.addEventListener("click", showHome);
renderPickers();
resetGame();
draw();
