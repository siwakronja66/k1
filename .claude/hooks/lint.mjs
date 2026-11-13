// PostToolUse hook: syntax-check the file Claude just edited.
//   .js / .mjs  -> node --check
//   .php        -> php -l inside the running `web` container (skipped if stack is down)
//   .json       -> JSON.parse
// Exit 2 + stderr feeds the error back to Claude so it fixes it in the same turn.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch { process.exit(0); }
let file;
try {
    const j = JSON.parse(input);
    file = j.tool_input?.file_path || j.tool_response?.filePath;
} catch { process.exit(0); }
if (!file) process.exit(0);

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || path.join(import.meta.dirname, '..', '..'));
const rel = path.relative(projectDir, path.resolve(file));
if (rel.startsWith('..') || rel.includes('node_modules') || rel.startsWith(path.join('public', 'vendor'))) process.exit(0);

const fail = (msg) => { process.stderr.write(`Syntax check failed for ${rel}:\n${msg}\n`); process.exit(2); };
const ext = path.extname(file).toLowerCase();

try {
    if (ext === '.js' || ext === '.mjs') {
        execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } else if (ext === '.json' || ext === '.webmanifest') {
        JSON.parse(readFileSync(file, 'utf8'));
    } else if (ext === '.php') {
        let running = '';
        try {
            running = execFileSync('docker', ['compose', 'ps', '--status', 'running', '-q', 'web'], { cwd: projectDir, stdio: 'pipe', timeout: 10000 }).toString().trim();
        } catch { /* docker not available */ }
        if (!running) process.exit(0);
        const inContainer = '/var/www/app/' + rel.split(path.sep).join('/');
        execFileSync('docker', ['compose', 'exec', '-T', 'web', 'php', '-l', inContainer], {
            cwd: projectDir, stdio: 'pipe', timeout: 20000, env: { ...process.env, MSYS_NO_PATHCONV: '1' },
        });
    }
} catch (err) {
    fail(((err.stderr && err.stderr.toString()) || (err.stdout && err.stdout.toString()) || err.message).trim());
}
process.exit(0);
