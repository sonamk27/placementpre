import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

if (process.platform === "win32") {
  const powershellCandidates = [
    process.env.SystemRoot
      ? path.join(
          process.env.SystemRoot,
          "System32",
          "WindowsPowerShell",
          "v1.0",
          "powershell.exe",
        )
      : null,
    "powershell.exe",
    "powershell",
    "pwsh.exe",
    "pwsh",
  ].filter(Boolean);
  const escapedProject = projectRoot.replaceAll("'", "''");
  const command = `
$project = '${escapedProject}';
$ownPid = ${process.pid};
$matches = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object {
  $_.ProcessId -ne $ownPid -and
  $_.CommandLine -notlike "*scripts/stop-dev.mjs*" -and
  (
    $_.CommandLine -like "*$project*" -or
    $_.CommandLine -like "*scripts/dev.mjs*" -or
    $_.CommandLine -like "*backend/server.js*"
  )
};
$matches | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
};
if ($matches) {
  "Stopped " + $matches.Count + " project dev process(es)."
} else {
  "No project dev processes were running."
}
`;

  let lastError;

  for (const powershell of powershellCandidates) {
    if (path.isAbsolute(powershell) && !fs.existsSync(powershell)) {
      continue;
    }

    try {
      execFileSync(
        powershell,
        ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
        { stdio: "inherit" },
      );
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }
} else {
  console.log("Use Ctrl+C in the terminal running npm run dev to stop the dev server.");
}
