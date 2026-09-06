import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';

// These source/review archives remain in Git, but are not runtime dependencies.
export const archives = [
  'hero-weapons', 'hero-weapons-normalized', 'hero-weapons-clean',
  'boss-frame-breakdown', 'boss-atlas-before-seamfix',
  'boss-atlas-before-leftfix', 'boss-atlas-before-nobeam'
].map(name => `assets/generated/${name}/`);

export function isPublicFile(file) {
  if (file === '.nojekyll') return true;
  if (!file.includes('/')) return !file.startsWith('.') && /\.(html|css|js)$/.test(file);
  return file.startsWith('assets/') && !archives.some(prefix => file.startsWith(prefix));
}

export async function buildPages(root, output, files) {
  root = path.resolve(root); output = path.resolve(output);
  const relative = path.relative(root, output);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Output must be inside the project');
  try {
    if ((await fs.readdir(output)).length) throw new Error('Output must be empty; no existing files will be removed');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const file of files) {
    if (file.split('/').includes('..') || path.isAbsolute(file) || file.includes('\\')) throw new Error(`Unsafe path: ${file}`);
  }
  const selected = files.filter(isPublicFile);
  if (!selected.includes('index.html')) throw new Error('Missing game entry');
  const digests = [];
  let bytes = 0;
  for (const file of selected) {
    const source = path.join(root, file);
    if (!(await fs.lstat(source)).isFile()) throw new Error(`Not a regular file: ${file}`);
    const data = await fs.readFile(source);
    if (/\.(html|css|js|json)$/.test(file)) {
      const text = data.toString('utf8');
      for (const prefix of archives) {
        if (text.includes(prefix) || text.includes(prefix.split('/')[2] + '/')) throw new Error(`Excluded archive referenced by ${file}: ${prefix}`);
      }
    }
    bytes += data.length;
    digests.push([file, createHash('sha256').update(data).digest('hex')]);
  }
  // Leave headroom beneath the hosting limit for the remaining animation sets.
  if (bytes > 900_000_000) throw new Error(`Pages payload exceeds 900 MB budget: ${bytes}`);
  const registry = await fs.readFile(path.join(root, 'hero-cast-clips.js'), 'utf8');
  const context = {window:{}}; vm.runInNewContext(registry, context, {timeout:1000});
  for (const [key, clip] of Object.entries(context.window.HeroCastClips)) {
    for (const file of [clip.url, clip.url.replace(/cast-strip\.png$/, 'idle.png')]) {
      if (!selected.includes(file)) throw new Error(`Missing ${key} asset: ${file}`);
    }
  }
  for (const [file, expected] of digests) {
    const destination = path.join(output, file);
    await fs.mkdir(path.dirname(destination), {recursive:true});
    await fs.copyFile(path.join(root, file), destination);
    const actual = createHash('sha256').update(await fs.readFile(destination)).digest('hex');
    if (actual !== expected) throw new Error(`Copy hash mismatch: ${file}`);
  }
  return {files:selected.length, bytes, clips:Object.keys(context.window.HeroCastClips).length, excluded:files.length-selected.length};
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.cwd();
  const files = execFileSync('git', ['ls-files', '-z'], {cwd:root, encoding:'utf8'}).split('\0').filter(Boolean);
  console.log(JSON.stringify(await buildPages(root, process.argv[2] || '.pages-dist', files), null, 2));
}
