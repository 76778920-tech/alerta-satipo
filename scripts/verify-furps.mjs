/**
 * Ejecuta la evidencia automatizada usada por la auditoría FURPS.
 * No inicia servicios remotos ni escribe datos de producción.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mobile = resolve(root, "mobile");
const npm = "npm";
const flutter = "flutter";

const checks = [
  { label: "Node.js", command: npm, args: ["test"], cwd: root },
  { label: "Python", command: npm, args: ["run", "test:python"], cwd: root },
  { label: "Navegador", command: npm, args: ["run", "test:browser"], cwd: root },
  { label: "Flutter analyze", command: flutter, args: ["analyze"], cwd: mobile },
  { label: "Flutter test", command: flutter, args: ["test"], cwd: mobile },
];

function run(check) {
  return new Promise((resolveRun) => {
    console.log(`\n=== FURPS: ${check.label} ===`);
    const windows = process.platform === "win32";
    const child = spawn(
      windows ? process.env.ComSpec ?? "cmd.exe" : check.command,
      windows ? ["/d", "/s", "/c", [check.command, ...check.args].join(" ")] : check.args,
      {
        cwd: check.cwd,
        // npm y flutter se distribuyen como scripts .cmd/.bat en Windows.
        shell: false,
        stdio: "inherit",
      },
    );
    child.on("error", (error) => resolveRun({ ...check, code: 1, error }));
    child.on("close", (code) => resolveRun({ ...check, code: code ?? 1 }));
  });
}

const results = [];
for (const check of checks) results.push(await run(check));

const failed = results.filter((result) => result.code !== 0);
console.log("\n=== Resumen FURPS ===");
for (const result of results) {
  console.log(`${result.code === 0 ? "PASS" : "FAIL"} | ${result.label}`);
}

if (failed.length) {
  console.error(`Fallaron ${failed.length} verificación(es); revise la salida anterior.`);
  process.exitCode = 1;
} else {
  console.log("Todas las verificaciones automatizadas FURPS finalizaron correctamente.");
}
