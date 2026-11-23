import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const go = process.env.GO_EXE || 'go';
const goRoot = spawnSync(go, ['env', 'GOROOT'], { encoding: 'utf8' });

if (goRoot.error?.code === 'ENOENT' && process.argv.includes('--optional')) {
  console.info('Go не найден. Для сборки консольной демонстрации нужен Go 1.22+.');
  process.exit(0);
}
if (goRoot.error) throw goRoot.error;
if (goRoot.status !== 0) throw new Error(goRoot.stderr || 'Не удалось определить GOROOT');

const output = fileURLToPath(new URL('../src/generated/go-demo/', import.meta.url));
const backend = fileURLToPath(new URL('../../backend/', import.meta.url));
const root = goRoot.stdout.trim();
const goLib = join(root, 'lib', 'wasm', 'wasm_exec.js');
const runtime = existsSync(goLib) ? goLib : join(root, 'misc', 'wasm', 'wasm_exec.js');

mkdirSync(output, { recursive: true });
execFileSync(go, ['build', '-trimpath', '-buildvcs=false', '-ldflags=-s -w', '-o', join(output, 'go-demo.wasm'), './cmd/go-demo'], {
  cwd: backend,
  env: { ...process.env, GOOS: 'js', GOARCH: 'wasm' },
  stdio: 'inherit'
});
const license = readFileSync(join(root, 'LICENSE'), 'utf8');
const source = readFileSync(runtime, 'utf8');
writeFileSync(join(output, 'wasm_exec.js'), `${source}\n/*!\n${license}\n*/\n`);
