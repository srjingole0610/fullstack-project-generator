import * as fs   from 'fs';
import * as path from 'path';

/**
 * Recursively create a directory (like `mkdir -p`).
 */
export function mkdirp(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Write `content` to `filePath`, creating parent directories as needed.
 */
export function writeFile(filePath: string, content: string): void {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Join path segments and normalise separators.
 */
export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}
