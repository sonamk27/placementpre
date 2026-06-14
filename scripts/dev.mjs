import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));

const start = (name, args) => {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  return child;
};

const processes = [
  start("api", ["server/server.js"]),
  start("web", [viteBin]),
];

let shuttingDown = false;

const stopProcess = (child) => {
  if (!child.pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
};

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  processes.forEach(stopProcess);
  process.exit(code);
};

for (const child of processes) {
  child.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code || 0);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
