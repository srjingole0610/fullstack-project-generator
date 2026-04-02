import * as vscode from 'vscode';
import * as path   from 'path';
import * as fs     from 'fs';

import { collectProjectConfig }  from './wizard';
import { generateFrontend }      from './generators/frontendGenerator';
import { generateBackend }       from './generators/backendGenerator';
import { generateRootFiles }     from './generators/rootFilesGenerator';
import { npmInstall }            from './utils/installer';

/**
 * Called once when VS Code first activates the extension.
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('FullStack Project Generator is now active');

  const disposable = vscode.commands.registerCommand(
    'fullstack-generator.generate',
    generateCommand
  );

  context.subscriptions.push(disposable);
}

/**
 * Main command handler — orchestrates the wizard + file generation.
 */
async function generateCommand(): Promise<void> {
  // ── 1. Collect configuration via multi-step wizard ─────────────────────────
  const config = await collectProjectConfig();

  if (!config) {
    // User cancelled — silently return
    return;
  }

  const projectRoot = path.join(config.targetDirectory, config.projectName);

  // ── 2. Guard: prevent overwriting an existing directory ───────────────────
  if (fs.existsSync(projectRoot)) {
    const overwrite = await vscode.window.showWarningMessage(
      `A folder named "${config.projectName}" already exists at the chosen location. Overwrite it?`,
      { modal: true },
      'Overwrite',
      'Cancel'
    );

    if (overwrite !== 'Overwrite') {
      return;
    }
  }

  // ── 3. Generate files with a progress notification ────────────────────────
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `🚀 Generating "${config.projectName}"`,
      cancellable: false,
    },
    async (progress) => {
      const step = (message: string, increment: number) => {
        progress.report({ message, increment });
      };

      try {
        // Root files (README, .gitignore, docker-compose)
        step('Creating project structure…', 10);
        generateRootFiles(config, projectRoot);

        // Frontend
        step('Generating React frontend…', 25);
        generateFrontend(config, projectRoot);

        // Backend
        step('Generating Node.js backend…', 25);
        generateBackend(config, projectRoot);

        // Optional: install dependencies
        if (config.installDependencies) {
          step('Installing client dependencies (this may take a minute)…', 15);
          await npmInstall(path.join(projectRoot, 'client'));

          step('Installing server dependencies…', 15);
          await npmInstall(path.join(projectRoot, 'server'));
        }

        step('Done!', 10);

        // ── 4. Success message + actions ──────────────────────────────────
        const actions: string[] = ['Open Project', 'Show in File Explorer'];
        if (!config.installDependencies) {
          actions.push('Copy Install Commands');
        }

        const choice = await vscode.window.showInformationMessage(
          `✅ "${config.projectName}" created successfully!`,
          ...actions
        );

        if (choice === 'Open Project') {
          await vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(projectRoot),
            config.openProject // true = new window
          );
        } else if (choice === 'Show in File Explorer') {
          await vscode.commands.executeCommand(
            'revealFileInOS',
            vscode.Uri.file(projectRoot)
          );
        } else if (choice === 'Copy Install Commands') {
          const cmds = [
            `cd ${projectRoot}/client && npm install`,
            `cd ${projectRoot}/server && npm install`,
          ].join('\n');
          await vscode.env.clipboard.writeText(cmds);
          vscode.window.showInformationMessage('Install commands copied to clipboard!');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(
          `❌ Project generation failed: ${message}`
        );
        console.error('[FullStack Generator] Error:', err);
      }
    }
  );
}

/**
 * Called when the extension is deactivated (extension host shutdown).
 */
export function deactivate(): void {
  // Cleanup if needed
}
