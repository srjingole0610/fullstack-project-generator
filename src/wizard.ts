import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectConfig, TypedQuickPickItem } from './types';

/**
 * Runs the multi-step wizard that collects all project options from the user.
 * Returns `undefined` if the user cancels at any step.
 */
export async function collectProjectConfig(): Promise<ProjectConfig | undefined> {
  // ── Step 1: Project name ──────────────────────────────────────────────────
  const projectName = await vscode.window.showInputBox({
    title: 'FullStack Generator (1/5) — Project Name',
    prompt: 'Enter your project name (e.g. my-awesome-app)',
    placeHolder: 'my-fullstack-app',
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Project name cannot be empty';
      }
      if (!/^[a-z0-9-_]+$/i.test(value.trim())) {
        return 'Use only letters, numbers, hyphens, or underscores';
      }
      return undefined;
    },
  });

  if (projectName === undefined) {
    return undefined; // User pressed Escape
  }

  // ── Step 2: Frontend framework ────────────────────────────────────────────
  const frontendItems: TypedQuickPickItem<'vite' | 'cra'>[] = [
    {
      label: '$(zap) Vite + React',
      description: '(Recommended)',
      detail: 'Blazing fast builds, native ESM, hot module replacement',
      value: 'vite',
    },
    {
      label: '$(package) Create React App',
      description: '(CRA)',
      detail: 'Classic setup, Webpack-based, widely supported',
      value: 'cra',
    },
  ];

  const frontendPick = await vscode.window.showQuickPick(frontendItems, {
    title: 'FullStack Generator (2/5) — Frontend Framework',
    placeHolder: 'Select your React setup',
    ignoreFocusOut: true,
  });

  if (!frontendPick) {
    return undefined;
  }

  // ── Step 3: Authentication type ───────────────────────────────────────────
  const authItems: TypedQuickPickItem<'jwt' | 'firebase' | 'auth0'>[] = [
    {
      label: '$(key) JWT',
      description: '(JSON Web Tokens)',
      detail: 'Self-hosted auth with bcrypt password hashing & JWT tokens',
      value: 'jwt',
    },
    {
      label: '$(flame) Firebase Auth',
      description: '(Google Firebase)',
      detail: 'Google-backed auth — email/password, OAuth, magic links',
      value: 'firebase',
    },
    {
      label: '$(shield) Auth0',
      description: '(Placeholder)',
      detail: 'Enterprise-grade SSO / social login — stub scaffold generated',
      value: 'auth0',
    },
  ];

  const authPick = await vscode.window.showQuickPick(authItems, {
    title: 'FullStack Generator (3/5) — Authentication',
    placeHolder: 'Select your authentication strategy',
    ignoreFocusOut: true,
  });

  if (!authPick) {
    return undefined;
  }

  // ── Step 4: Install dependencies? ────────────────────────────────────────
  const installItems: TypedQuickPickItem<boolean>[] = [
    {
      label: '$(cloud-download) Yes — install now',
      detail: 'Run npm install in client/ and server/ (takes ~1 min)',
      value: true,
    },
    {
      label: '$(x) No — I\'ll install manually',
      detail: 'Run npm install yourself after generation',
      value: false,
    },
  ];

  const installPick = await vscode.window.showQuickPick(installItems, {
    title: 'FullStack Generator (4/5) — Install Dependencies',
    placeHolder: 'Auto-install npm packages?',
    ignoreFocusOut: true,
  });

  if (!installPick) {
    return undefined;
  }

  // ── Step 5: Target directory ──────────────────────────────────────────────
  const defaultDir =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ??
    require('os').homedir();

  const targetUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select project parent folder',
    defaultUri: vscode.Uri.file(defaultDir),
    title: 'FullStack Generator (5/5) — Choose Destination',
  });

  if (!targetUri || targetUri.length === 0) {
    return undefined;
  }

  const targetDirectory = targetUri[0].fsPath;

  // ── Open after? (quick yes/no) ────────────────────────────────────────────
  const openChoice = await vscode.window.showQuickPick(
    [
      { label: '$(folder-opened) Yes — open in VS Code', value: true },
      { label: '$(circle-slash) No thanks',              value: false },
    ],
    {
      title: 'Open project in a new VS Code window after generation?',
      ignoreFocusOut: true,
    }
  );

  return {
    projectName:       projectName.trim(),
    frontendFramework: frontendPick.value,
    backend:           'express',
    authType:          authPick.value,
    installDependencies: installPick.value,
    openProject:       openChoice?.value ?? false,
    targetDirectory,
  };
}
