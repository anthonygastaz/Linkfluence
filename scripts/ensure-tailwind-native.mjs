import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';

const require = createRequire(import.meta.url);

const platformPackages = {
  'darwin-arm64': '@tailwindcss/oxide-darwin-arm64',
  'darwin-x64': '@tailwindcss/oxide-darwin-x64',
  'linux-arm64': '@tailwindcss/oxide-linux-arm64-gnu',
  'linux-x64': '@tailwindcss/oxide-linux-x64-gnu',
  'win32-x64': '@tailwindcss/oxide-win32-x64-msvc',
};

const key = `${process.platform}-${process.arch}`;
const pkg = platformPackages[key];

if (!pkg) {
  console.warn(`[postinstall] No Tailwind native package mapped for ${key}.`);
  process.exit(0);
}

try {
  require.resolve(pkg);
  process.exit(0);
} catch {
  console.log(`[postinstall] Installing missing Tailwind native binding: ${pkg}`);
  execSync(`npm install ${pkg}@^4.3.0 --no-save`, { stdio: 'inherit' });
}
