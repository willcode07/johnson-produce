/**
 * GitHub Pages build.
 *
 * .github/workflows/nextjs.yml runs `npm run build` and uploads ./out.
 * `output: 'export'` cannot prerender App Router route handlers, and those
 * handlers need a Node server that GitHub Pages does not provide. Orders are
 * emailed with FormSubmit instead. This script moves src/app/api aside for
 * the static build, then puts it back so local `next dev` can still use it.
 */
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const apiDir = path.join(root, 'src', 'app', 'api');
const markerPath = path.join(root, '.api-hold-path');
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

let moved = false;
let holdDir = '';
let child = null;

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function restore() {
  if (!moved && !(await exists(markerPath))) return;
  const recorded = holdDir || (await readFile(markerPath, 'utf8')).trim();
  if (!recorded || !(await exists(recorded))) {
    await rm(markerPath, { force: true });
    moved = false;
    return;
  }
  if (await exists(apiDir)) {
    throw new Error('src/app/api exists and a held copy also exists. Refusing to overwrite it.');
  }
  await rename(recorded, apiDir);
  await rm(path.dirname(recorded), { recursive: true, force: true });
  await rm(markerPath, { force: true });
  moved = false;
  holdDir = '';
}

async function holdApiRoutes() {
  if (!(await exists(apiDir)) && (await exists(markerPath))) {
    await restore();
  }
  if (!(await exists(apiDir))) {
    throw new Error('src/app/api is missing, so the static build cannot continue safely.');
  }
  const holdRoot = path.join(os.tmpdir(), `johnson-produce-api-${process.pid}`);
  holdDir = path.join(holdRoot, 'api');
  await mkdir(holdRoot, { recursive: true });
  await rename(apiDir, holdDir);
  moved = true;
  await writeFile(markerPath, holdDir);
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, [nextBin, 'build', '--turbopack'], {
      cwd: root,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function assertExport() {
  const indexPath = path.join(root, 'out', 'index.html');
  const orderPath = path.join(root, 'out', 'order', 'index.html');
  const thanksPath = path.join(root, 'out', 'order', 'thanks', 'index.html');
  const noJekyll = path.join(root, 'out', '.nojekyll');
  for (const file of [indexPath, orderPath, thanksPath, noJekyll]) {
    if (!(await exists(file))) {
      throw new Error(`Static export is missing ${path.relative(root, file)}`);
    }
  }
  const home = await readFile(indexPath, 'utf8');
  for (const name of ['Ackee', 'Jackfruit', 'Starfruit', 'Naseberry', 'Out of season']) {
    if (!home.includes(name)) {
      throw new Error(`Homepage export is missing "${name}"`);
    }
  }
  const order = await readFile(orderPath, 'utf8');
  if (!order.includes('Place an order') || !order.includes('produce@junltd.com')) {
    throw new Error('Order page export is missing the form heading or email fallback.');
  }
  if (!order.includes('https://formsubmit.co/produce@junltd.com')) {
    throw new Error('Order page export is missing the FormSubmit form action.');
  }
  const thanks = await readFile(thanksPath, 'utf8');
  if (!thanks.includes('Thank you')) {
    throw new Error('Thanks page export is missing the confirmation heading.');
  }
}

async function main() {
  await holdApiRoutes();
  let code = 1;
  try {
    code = await runNextBuild();
    if (code === 0) await assertExport();
  } finally {
    await restore();
  }
  if (code !== 0) process.exit(code);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (child) child.kill(signal);
    restore()
      .catch((error) => console.error(error))
      .finally(() => process.exit(1));
  });
}

main().catch(async (error) => {
  console.error(error);
  try {
    await restore();
  } catch (restoreError) {
    console.error(restoreError);
  }
  process.exit(1);
});
