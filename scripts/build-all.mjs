// Compila un dist por empresa usando .env.<empresa> (versionado en git) y los empaqueta en .zip
// Uso: npm run build:all              -> todas
//      npm run build:all -- milagro   -> solo las indicadas
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const TARGETS = ["milagro", "concentrados", "nutrimentos"];
const OUT_ROOT = "builds";

const selected = process.argv.slice(2);
const targets = selected.length ? selected : TARGETS;

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

for (const t of targets) {
  if (!existsSync(`.env.${t}`)) {
    console.error(`Falta el archivo .env.${t}`);
    process.exit(1);
  }
}

// El chequeo de tipos no depende del env: una sola vez
run("npx tsc -b");

rmSync(OUT_ROOT, { recursive: true, force: true });

for (const t of targets) {
  const outDir = path.join(OUT_ROOT, t);
  console.log(`\n=== Build ${t} ===`);
  run(`npx vite build --mode ${t} --outDir ${outDir} --emptyOutDir`);

  const zip = path.join(OUT_ROOT, `${t}.zip`);
  if (process.platform === "win32") {
    // ZipFile con includeBaseDirectory=false: el zip trae el contenido, no la carpeta
    const src = path.resolve(outDir);
    const dest = path.resolve(zip);
    run(
      `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::CreateFromDirectory('${src}', '${dest}', 'Optimal', $false)"`,
    );
  } else {
    run(`cd ${outDir} && zip -qr ../${t}.zip .`);
  }
  console.log(`-> ${zip}`);
}

console.log(`\nListo: ${targets.map((t) => `${OUT_ROOT}/${t}.zip`).join(", ")}`);
