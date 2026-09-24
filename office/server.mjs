// Agent Office — live monitor for the agent team.
// Zero deps. Reads Claude Code session transcripts and serves an office floor view.
//   node office/server.mjs      ->  http://localhost:4600
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);
const PORT = Number(process.env.PORT || 4600);

// Claude Code slugs the cwd by replacing every non-alphanumeric char with "-"
const PROJECT_DIR = join(homedir(), ".claude", "projects", REPO.replace(/[^a-zA-Z0-9]/g, "-"));

// An agent counts as "working" while its transcript is still being written to.
const ACTIVE_WINDOW_MS = 90_000;

// ---------------------------------------------------------------- desk roster
const DESKS = [
  { id: "lead",           name: "Lead",           seat: "Planning + final call" },
  { id: "ui-designer",    name: "UI Designer",    seat: "Color, type, spacing" },
  { id: "frontend-dev",   name: "Frontend Dev",   seat: "Components, pages, state" },
  { id: "backend-dev",    name: "Backend Dev",    seat: "API, data, auth" },
  { id: "sanity-checker", name: "Sanity Checker", seat: "Responsive, a11y, correctness" },
];

// Subagents are often launched as `general-purpose` with the role stated in the
// prompt ("You are the **Frontend Dev**"), so match on whatever we can find.
function roleOf(agentType = "", text = "") {
  const hay = `${agentType} ${text}`.toLowerCase();
  for (const d of DESKS) {
    if (agentType === d.id) return d.id;
    if (hay.includes(`**${d.name.toLowerCase()}**`)) return d.id;
  }
  for (const d of DESKS) if (hay.includes(d.name.toLowerCase())) return d.id;
  return "lead";
}

async function readJsonl(file) {
  const raw = await readFile(file, "utf8").catch(() => "");
  const out = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* half-written tail line */ }
  }
  return out;
}

const blocksOf = (row) => {
  const c = row?.message?.content;
  return Array.isArray(c) ? c : [];
};

// -------------------------------------------------- what is this agent doing?
function describeTool(name, input = {}) {
  const short = (p) => String(p || "").replace(REPO + "/", "");
  switch (name) {
    case "Read":     return `reading ${short(input.file_path)}`;
    case "Write":    return `writing ${short(input.file_path)}`;
    case "Edit":     return `editing ${short(input.file_path)}`;
    case "Bash":     return input.description || `running \`${String(input.command || "").slice(0, 60)}\``;
    case "Grep":     return `searching for "${input.pattern}"`;
    case "Glob":     return `looking for ${input.pattern}`;
    case "Skill":    return `using the ${input.skill} skill`;
    case "Agent":    return `delegating: ${input.description}`;
    case "WebFetch": return `reading ${input.url}`;
    default:         return `${name}`;
  }
}

function summarise(rows) {
  let action = "thinking", turns = 0, thinking = false, lastAt = null;
  const files = new Set();
  const trail = [];

  for (const row of rows) {
    if (row.timestamp) lastAt = row.timestamp;
    if (row.type !== "assistant") continue;
    turns++;
    for (const b of blocksOf(row)) {
      if (b.type === "thinking") { thinking = true; }
      if (b.type === "text" && b.text?.trim()) { action = b.text.trim().split("\n")[0].slice(0, 140); thinking = false; }
      if (b.type === "tool_use") {
        action = describeTool(b.name, b.input);
        thinking = false;
        trail.push({ at: row.timestamp, text: action });
        const f = b.input?.file_path;
        if (f && (b.name === "Write" || b.name === "Edit")) files.add(String(f).replace(REPO + "/", ""));
      }
    }
  }
  return { action, turns, thinking, lastAt, files: [...files], trail: trail.slice(-12).reverse() };
}

// ------------------------------------------------------------- gather workers
async function collectWorkers() {
  if (!existsSync(PROJECT_DIR)) return [];
  const sessions = (await readdir(PROJECT_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => join(PROJECT_DIR, e.name, "subagents"))
    .filter(existsSync);

  const workers = [];
  for (const dir of sessions) {
    for (const file of (await readdir(dir)).filter((f) => f.endsWith(".meta.json"))) {
      const id = basename(file, ".meta.json");
      const meta = JSON.parse(await readFile(join(dir, file), "utf8").catch(() => "{}"));
      const transcript = join(dir, `${id}.jsonl`);
      if (!existsSync(transcript)) continue;

      const rows = await readJsonl(transcript);
      const mtime = (await stat(transcript)).mtimeMs;
      const s = summarise(rows);
      const prompt = rows.find((r) => r.type === "user")?.message?.content;
      const promptText = typeof prompt === "string" ? prompt : JSON.stringify(prompt || "");

      workers.push({
        id,
        role: roleOf(meta.agentType, `${promptText} ${meta.description || ""}`),
        task: meta.description || "untitled task",
        agentType: meta.agentType || "general-purpose",
        startedAt: rows[0]?.timestamp || null,
        lastAt: s.lastAt,
        idleMs: Date.now() - mtime,
        status: Date.now() - mtime < ACTIVE_WINDOW_MS ? "working" : "done",
        action: s.action,
        thinking: s.thinking,
        turns: s.turns,
        files: s.files,
        trail: s.trail,
      });
    }
  }
  return workers.sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
}

async function worklog() {
  const raw = await readFile(join(REPO, "memory", "worklog.md"), "utf8").catch(() => "");
  return raw
    .split("\n")
    .filter((l) => /^\d{4}-\d{2}-\d{2}\s*\|/.test(l))
    .slice(0, 12)
    .map((l) => {
      const [date, agent, what, files] = l.split("|").map((s) => s.trim());
      return { date, agent, what, files };
    });
}

async function buildState() {
  const workers = await collectWorkers();
  const desks = DESKS.map((desk) => {
    const mine = workers.filter((w) => w.role === desk.id);
    const live = mine.find((w) => w.status === "working") || mine[0] || null;
    return {
      ...desk,
      status: live ? live.status : "empty",
      current: live,
      history: mine.filter((w) => w !== live).slice(0, 4),
    };
  });
  return {
    now: new Date().toISOString(),
    project: basename(REPO),
    watching: PROJECT_DIR,
    desks,
    worklog: await worklog(),
    counts: {
      working: desks.filter((d) => d.status === "working").length,
      done: workers.filter((w) => w.status === "done").length,
    },
  };
}

// -------------------------------------------------------------------- serving
createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/state")) {
      const body = JSON.stringify(await buildState());
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      return res.end(body);
    }
    const page = await readFile(join(HERE, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(String(err));
  }
}).listen(PORT, () => {
  console.log(`Agent Office  →  http://localhost:${PORT}`);
  console.log(`watching      →  ${PROJECT_DIR}`);
});
