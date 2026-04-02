import * as cp from 'child_process';
import * as path from 'path';

/**
 * Run `npm install` in the given directory.
 * Returns a Promise that resolves/rejects when the child process exits.
 */
export function npmInstall(directory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command   = isWindows ? 'npm.cmd' : 'npm';

    const child = cp.spawn(command, ['install'], {
      cwd: directory,
      stdio: 'pipe',
      shell: isWindows,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install exited with code ${code} in ${path.basename(directory)}`));
      }
    });

    child.on('error', reject);
  });
}
