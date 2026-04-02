import { ProjectConfig } from '../types';
import { writeFile, joinPath } from '../utils/fileUtils';

/**
 * Generates the entire `client/` directory for the chosen React setup.
 */
export function generateFrontend(config: ProjectConfig, root: string): void {
  const clientDir = joinPath(root, 'client');

  if (config.frontendFramework === 'vite') {
    generateViteProject(config, clientDir);
  } else {
    generateCRAProject(config, clientDir);
  }
}

// ─── Vite ────────────────────────────────────────────────────────────────────

function generateViteProject(config: ProjectConfig, clientDir: string): void {
  // package.json
  writeFile(joinPath(clientDir, 'package.json'), vitePackageJson(config));

  // vite.config.ts
  writeFile(joinPath(clientDir, 'vite.config.ts'), viteConfig());

  // tsconfig
  writeFile(joinPath(clientDir, 'tsconfig.json'), viteTsConfig());
  writeFile(joinPath(clientDir, 'tsconfig.node.json'), viteTsConfigNode());

  // index.html
  writeFile(joinPath(clientDir, 'index.html'), indexHtml(config));

  // .env
  writeFile(joinPath(clientDir, '.env'), clientEnv());
  writeFile(joinPath(clientDir, '.env.example'), clientEnvExample());

  // src files
  writeFile(joinPath(clientDir, 'src', 'main.tsx'), mainTsx());
  writeFile(joinPath(clientDir, 'src', 'App.tsx'), appTsx());
  writeFile(joinPath(clientDir, 'src', 'index.css'), globalCss());

  // API helper
  writeFile(joinPath(clientDir, 'src', 'api', 'axios.ts'), axiosSetup());
  writeFile(joinPath(clientDir, 'src', 'api', 'auth.ts'), authApi(config));

  // Auth context
  writeFile(joinPath(clientDir, 'src', 'context', 'AuthContext.tsx'), authContext(config));

  // Pages
  writeFile(joinPath(clientDir, 'src', 'pages', 'Login.tsx'), loginPage());
  writeFile(joinPath(clientDir, 'src', 'pages', 'Register.tsx'), registerPage());
  writeFile(joinPath(clientDir, 'src', 'pages', 'Dashboard.tsx'), dashboardPage());
  writeFile(joinPath(clientDir, 'src', 'pages', 'NotFound.tsx'), notFoundPage());

  // Components
  writeFile(joinPath(clientDir, 'src', 'components', 'ProtectedRoute.tsx'), protectedRoute());
  writeFile(joinPath(clientDir, 'src', 'components', 'Navbar.tsx'), navbar());

  // Types
  writeFile(joinPath(clientDir, 'src', 'types', 'index.ts'), clientTypes());
}

function generateCRAProject(config: ProjectConfig, clientDir: string): void {
  writeFile(joinPath(clientDir, 'package.json'), craPackageJson(config));
  writeFile(joinPath(clientDir, 'tsconfig.json'), craTsConfig());
  writeFile(joinPath(clientDir, '.env'), clientEnv());
  writeFile(joinPath(clientDir, '.env.example'), clientEnvExample());

  // public
  writeFile(joinPath(clientDir, 'public', 'index.html'), craIndexHtml(config));

  // src
  writeFile(joinPath(clientDir, 'src', 'index.tsx'), craSrcIndex());
  writeFile(joinPath(clientDir, 'src', 'App.tsx'), appTsx());
  writeFile(joinPath(clientDir, 'src', 'index.css'), globalCss());
  writeFile(joinPath(clientDir, 'src', 'api', 'axios.ts'), axiosSetup());
  writeFile(joinPath(clientDir, 'src', 'api', 'auth.ts'), authApi(config));
  writeFile(joinPath(clientDir, 'src', 'context', 'AuthContext.tsx'), authContext(config));
  writeFile(joinPath(clientDir, 'src', 'pages', 'Login.tsx'), loginPage());
  writeFile(joinPath(clientDir, 'src', 'pages', 'Register.tsx'), registerPage());
  writeFile(joinPath(clientDir, 'src', 'pages', 'Dashboard.tsx'), dashboardPage());
  writeFile(joinPath(clientDir, 'src', 'pages', 'NotFound.tsx'), notFoundPage());
  writeFile(joinPath(clientDir, 'src', 'components', 'ProtectedRoute.tsx'), protectedRoute());
  writeFile(joinPath(clientDir, 'src', 'components', 'Navbar.tsx'), navbar());
  writeFile(joinPath(clientDir, 'src', 'types', 'index.ts'), clientTypes());
}

// ─── Template strings ─────────────────────────────────────────────────────────

function vitePackageJson(config: ProjectConfig): string {
  return JSON.stringify({
    name: `${config.projectName}-client`,
    private: true,
    version: '0.0.1',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.22.0',
      axios: '^1.6.7',
      ...(config.authType === 'firebase'
        ? { firebase: '^10.8.0' }
        : config.authType === 'auth0'
        ? { '@auth0/auth0-react': '^2.2.4' }
        : {}),
    },
    devDependencies: {
      '@types/react': '^18.2.55',
      '@types/react-dom': '^18.2.19',
      '@vitejs/plugin-react': '^4.2.1',
      typescript: '^5.3.3',
      vite: '^5.1.0',
    },
  }, null, 2);
}

function craPackageJson(config: ProjectConfig): string {
  return JSON.stringify({
    name: `${config.projectName}-client`,
    version: '0.1.0',
    private: true,
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.22.0',
      'react-scripts': '5.0.1',
      axios: '^1.6.7',
      typescript: '^5.3.3',
      '@types/node': '^20.11.0',
      '@types/react': '^18.2.55',
      '@types/react-dom': '^18.2.19',
      ...(config.authType === 'firebase' ? { firebase: '^10.8.0' } : {}),
      ...(config.authType === 'auth0' ? { '@auth0/auth0-react': '^2.2.4' } : {}),
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
    browserslist: {
      production: ['>0.2%', 'not dead', 'not op_mini all'],
      development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
    },
  }, null, 2);
}

function viteConfig(): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to the Express backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
`;
}

function viteTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }],
  }, null, 2);
}

function viteTsConfigNode(): string {
  return JSON.stringify({
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true,
    },
    include: ['vite.config.ts'],
  }, null, 2);
}

function craTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'es5',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      module: 'esnext',
      moduleResolution: 'node',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
    },
    include: ['src'],
  }, null, 2);
}

function indexHtml(config: ProjectConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function craIndexHtml(config: ProjectConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${config.projectName}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;
}

function clientEnv(): string {
  return `# ──────────────────────────────────────────────
# Client Environment Variables
# Copy to .env and fill in your values
# ──────────────────────────────────────────────

VITE_API_URL=http://localhost:5000/api
`;
}

function clientEnvExample(): string {
  return `VITE_API_URL=http://localhost:5000/api
`;
}

function mainTsx(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing throughout the app */}
    <BrowserRouter>
      {/* AuthProvider exposes auth state (user, token, login, logout) globally */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`;
}

function craSrcIndex(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`;
}

function appTsx(): string {
  return `import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — wrapped in ProtectedRoute HOC */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
`;
}

function globalCss(): string {
  return `/* ── Global Styles ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* ── Form shared styles ── */
.form-container {
  max-width: 420px;
  margin: 4rem auto;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.form-container h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
}

.btn {
  display: inline-block;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover       { background: #4338ca; }
.btn:disabled    { opacity: 0.6; cursor: not-allowed; }

.error-msg {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.link {
  color: #4f46e5;
  text-decoration: none;
  font-size: 0.9rem;
}

.link:hover { text-decoration: underline; }
`;
}

function axiosSetup(): string {
  return `import axios from 'axios';

// Base URL read from environment variable; falls back to localhost for dev
const API_BASE_URL = import.meta.env?.VITE_API_URL
  ?? process.env.REACT_APP_API_URL
  ?? 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor — attach JWT token if it exists ──────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
`;
}

function authApi(config: ProjectConfig): string {
  if (config.authType === 'firebase') {
    return `// Firebase Auth API helpers
// Install: npm install firebase
// Configure your firebaseConfig in src/firebase.ts

export interface LoginCredentials    { email: string; password: string; }
export interface RegisterCredentials { name: string; email: string; password: string; }

// Placeholder — implement with firebase/auth (signInWithEmailAndPassword, etc.)
export const loginUser = async (_creds: LoginCredentials) => {
  throw new Error('Implement with Firebase: signInWithEmailAndPassword');
};

export const registerUser = async (_creds: RegisterCredentials) => {
  throw new Error('Implement with Firebase: createUserWithEmailAndPassword');
};

export const logoutUser = async () => {
  throw new Error('Implement with Firebase: signOut');
};
`;
  }

  if (config.authType === 'auth0') {
    return `// Auth0 Auth API helpers
// Install: npm install @auth0/auth0-react
// Wrap your app with <Auth0Provider> in main.tsx

export const loginUser = () => {
  // Use loginWithRedirect() from useAuth0() hook
  throw new Error('Use useAuth0().loginWithRedirect() in your component');
};

export const logoutUser = () => {
  // Use logout() from useAuth0() hook
  throw new Error('Use useAuth0().logout() in your component');
};
`;
  }

  // JWT (default)
  return `import apiClient from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * POST /api/auth/login
 * Returns a JWT token + user object on success.
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data;
};

/**
 * POST /api/auth/register
 * Creates a new user and returns a JWT token + user object.
 */
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
  return data;
};

/**
 * GET /api/auth/me
 * Fetches the currently authenticated user (token sent via interceptor).
 */
export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};
`;
}

function authContext(config: ProjectConfig): string {
  if (config.authType !== 'jwt') {
    return `import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User { id: string; name: string; email: string; }
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  // Implement login/logout using your auth provider SDK
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useState<User | null>(null);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
`;
  }

  return `import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { loginUser, registerUser, LoginCredentials, RegisterCredentials } from '../api/auth';

// ── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser   ] = useState<User | null>(null);
  const [token,   setToken  ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, rehydrate auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /** Authenticate with email + password, persist token & user to localStorage */
  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  /** Create account, then automatically log in */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    const data = await registerUser(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  /** Clear all auth state */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {!loading ? children : null /* prevent flash of unauthenticated content */}
    </AuthContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
`;
}

function loginPage(): string {
  return `import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email,    setEmail   ] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError   ] = useState('');
  const [loading,  setLoading ] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Sign In</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link className="link" to="/register">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
`;
}

function registerPage(): string {
  return `import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name,     setName    ] = useState('');
  const [email,    setEmail   ] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm ] = useState('');
  const [error,    setError   ] = useState('');
  const [loading,  setLoading ] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Account</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
            autoComplete="new-password"
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link className="link" to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
`;
}

function dashboardPage(): string {
  return `import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, <strong>{user?.name ?? 'User'}</strong>!</p>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        You are authenticated. This page is only visible to logged-in users.
      </p>

      {/* User info card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '480px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}
      >
        <h3 style={{ marginBottom: '0.75rem' }}>Your Profile</h3>
        <p><strong>Name: </strong>{user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <button
        className="btn"
        onClick={logout}
        style={{ marginTop: '2rem', maxWidth: '200px' }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Dashboard;
`;
}

function notFoundPage(): string {
  return `import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1 style={{ fontSize: '5rem', color: '#4f46e5' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#666', margin: '1rem 0' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link className="link" to="/">← Back to Home</Link>
    </div>
  );
}

export default NotFound;
`;
}

function protectedRoute(): string {
  return `import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props { children: ReactNode; }

/**
 * ProtectedRoute wraps any component that requires authentication.
 * If the user is not logged in, they are redirected to /login.
 * The \`state\` object preserves the intended destination for post-login redirect.
 */
function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
`;
}

function navbar(): string {
  return `import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: '#4f46e5',
        color: '#fff',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem' }}>
        🚀 MyApp
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>
              Hi, {user?.name?.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    style={{ color: '#fff', textDecoration: 'none', opacity: 0.85 }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: '6px' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
`;
}

function clientTypes(): string {
  return `// ── Shared frontend types ────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
`;
}
