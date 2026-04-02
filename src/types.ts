/**
 * ProjectConfig — All user-selected options collected during the wizard.
 */
export interface ProjectConfig {
  /** Root name of the project (also used as the folder name) */
  projectName: string;

  /** Which React scaffolding tool to use */
  frontendFramework: 'vite' | 'cra';

  /** Backend is always Node + Express for now; reserved for future expansion */
  backend: 'express';

  /** Authentication strategy chosen by the user */
  authType: 'jwt' | 'firebase' | 'auth0';

  /** Whether to run `npm install` in each sub-project after generation */
  installDependencies: boolean;

  /** Whether to open the newly created project in VS Code after generation */
  openProject: boolean;

  /** Absolute path to the parent folder where the project will be created */
  targetDirectory: string;
}

/** QuickPickItem extended with a typed value property */
export interface TypedQuickPickItem<T> {
  label: string;
  description?: string;
  detail?: string;
  value: T;
}
