import { ProjectConfig } from '../types';
import { writeFile, joinPath } from '../utils/fileUtils';

/**
 * Generates the entire `server/` directory.
 */
export function generateBackend(config: ProjectConfig, root: string): void {
  const serverDir = joinPath(root, 'server');

  writeFile(joinPath(serverDir, 'package.json'),        serverPackageJson(config));
  writeFile(joinPath(serverDir, 'tsconfig.json'),       serverTsConfig());
  writeFile(joinPath(serverDir, '.env'),                serverEnv());
  writeFile(joinPath(serverDir, '.env.example'),        serverEnvExample());
  writeFile(joinPath(serverDir, 'src', 'server.ts'),    serverEntry());
  writeFile(joinPath(serverDir, 'src', 'app.ts'),       appFile());

  // Config
  writeFile(joinPath(serverDir, 'src', 'config', 'db.ts'),  dbConfig());
  writeFile(joinPath(serverDir, 'src', 'config', 'env.ts'), envConfig());

  // Models
  writeFile(joinPath(serverDir, 'src', 'models', 'User.ts'), userModel());

  // Middleware
  writeFile(joinPath(serverDir, 'src', 'middleware', 'auth.ts'),        authMiddleware(config));
  writeFile(joinPath(serverDir, 'src', 'middleware', 'errorHandler.ts'), errorHandler());
  writeFile(joinPath(serverDir, 'src', 'middleware', 'validate.ts'),     validateMiddleware());

  // Routes
  writeFile(joinPath(serverDir, 'src', 'routes', 'index.ts'),        routeIndex());
  writeFile(joinPath(serverDir, 'src', 'routes', 'auth.routes.ts'),  authRoutes(config));
  writeFile(joinPath(serverDir, 'src', 'routes', 'user.routes.ts'),  userRoutes());

  // Controllers
  writeFile(joinPath(serverDir, 'src', 'controllers', 'auth.controller.ts'), authController(config));
  writeFile(joinPath(serverDir, 'src', 'controllers', 'user.controller.ts'), userController());

  // Types
  writeFile(joinPath(serverDir, 'src', 'types', 'index.ts'), serverTypes());

  // Utils
  writeFile(joinPath(serverDir, 'src', 'utils', 'jwt.ts'),    jwtUtils());
  writeFile(joinPath(serverDir, 'src', 'utils', 'crypto.ts'), cryptoUtils());
}

// ─── package.json ────────────────────────────────────────────────────────────

function serverPackageJson(config: ProjectConfig): string {
  return JSON.stringify({
    name: `${config.projectName}-server`,
    version: '1.0.0',
    description: 'Express + MongoDB API server',
    main: 'dist/server.js',
    scripts: {
      dev: 'ts-node-dev --respawn --transpile-only src/server.ts',
      build: 'tsc',
      start: 'node dist/server.js',
      lint: 'eslint src --ext .ts',
    },
    dependencies: {
      express: '^4.18.3',
      mongoose: '^8.1.1',
      bcryptjs: '^2.4.3',
      jsonwebtoken: '^9.0.2',
      cors: '^2.8.5',
      dotenv: '^16.4.1',
      'express-rate-limit': '^7.1.5',
      helmet: '^7.1.0',
      morgan: '^1.10.0',
      joi: '^17.12.0',
    },
    devDependencies: {
      '@types/bcryptjs': '^2.4.6',
      '@types/cors': '^2.8.17',
      '@types/express': '^4.17.21',
      '@types/jsonwebtoken': '^9.0.5',
      '@types/morgan': '^1.9.9',
      '@types/node': '^20.11.0',
      'ts-node-dev': '^2.0.0',
      typescript: '^5.3.3',
    },
  }, null, 2);
}

// ─── tsconfig ────────────────────────────────────────────────────────────────

function serverTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ['src'],
    exclude: ['node_modules', 'dist'],
  }, null, 2);
}

// ─── Environment ─────────────────────────────────────────────────────────────

function serverEnv(): string {
  return `# ──────────────────────────────────────────────
# Server Environment Variables
# Copy to .env and fill in your values
# NEVER commit the actual .env to source control
# ──────────────────────────────────────────────

NODE_ENV=development
PORT=5000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/myapp

# JWT secret — use a long, random string in production
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=7d

# CORS — comma-separated allowed origins
CORS_ORIGIN=http://localhost:3000
`;
}

function serverEnvExample(): string {
  return `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
`;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

function serverEntry(): string {
  return `import dotenv from 'dotenv';
dotenv.config(); // Must be called before any other imports that read env vars

import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const PORT = env.PORT;

async function start() {
  try {
    // Connect to MongoDB first, then start listening
    await connectDB();

    app.listen(PORT, () => {
      console.log(\`✅ Server running on http://localhost:\${PORT}\`);
      console.log(\`🌍 Environment: \${env.NODE_ENV}\`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
`;
}

// ─── Express app ─────────────────────────────────────────────────────────────

function appFile(): string {
  return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { env } from './config/env';

const app: Application = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging (dev only) ────────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
`;
}

// ─── Config ──────────────────────────────────────────────────────────────────

function dbConfig(): string {
  return `import mongoose from 'mongoose';
import { env } from './env';

/**
 * Establish a Mongoose connection to MongoDB.
 * Resolves on success; throws on failure so the caller can handle it.
 */
export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Mongoose 7+ no longer needs these options, but kept for clarity
    });
    console.log(\`🗄️  MongoDB connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
`;
}

function envConfig(): string {
  return `/**
 * Centralised, typed access to environment variables.
 * Throws at startup if a required variable is missing — fail fast.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(\`Missing required environment variable: \${key}\`);
  }
  return value;
}

export const env = {
  NODE_ENV:    process.env.NODE_ENV ?? 'development',
  PORT:        parseInt(process.env.PORT ?? '5000', 10),
  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET:  requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
} as const;
`;
}

// ─── User Model ──────────────────────────────────────────────────────────────

function userModel(): string {
  return `import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  /** Compare a plain-text password against the stored hash */
  comparePassword(candidate: string): Promise<boolean>;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password field by default
    },
  },
  { timestamps: true }
);

// ── Pre-save hook: hash password before storing ───────────────────────────────

userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified (avoids double-hashing)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method ───────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ── Sanitise output — exclude password from JSON serialisation ────────────────

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
`;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

function authMiddleware(_config: ProjectConfig): string {
  return `import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

/**
 * Extend Express Request to carry the authenticated user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string };
    }
  }
}

/**
 * protect — middleware that validates the JWT from the Authorization header.
 *
 * Usage: router.get('/me', protect, handler)
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decoded = verifyToken(token);

    // Fetch user from DB (ensures user still exists and is active)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request for downstream handlers
    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
`;
}

function errorHandler(): string {
  return `import { Request, Response, NextFunction } from 'express';

/**
 * ApiError — throw this anywhere in your route handlers / services
 * to return a structured error response with the correct HTTP status.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string>[]
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handler — must be registered LAST with app.use().
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.errors && { details: err.errors }),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(422).json({ error: 'Validation failed', details: err.message });
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({ error: 'Duplicate value — that record already exists' });
    return;
  }

  // Default 500
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};
`;
}

function validateMiddleware(): string {
  return `import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * validate — factory that returns Express middleware validating req.body
 * against the provided Joi schema.
 *
 * Usage: router.post('/register', validate(registerSchema), handler)
 */
export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      res.status(422).json({ error: 'Validation failed', details });
      return;
    }

    next();
  };

// ── Shared validation schemas ─────────────────────────────────────────────────

export const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});
`;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

function routeIndex(): string {
  return `import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
`;
}

function authRoutes(_config: ProjectConfig): string {
  return `import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

export default router;
`;
}

function userRoutes(): string {
  return `import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getAllUsers, getUserById } from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(protect);

// GET /api/users
router.get('/', getAllUsers);

// GET /api/users/:id
router.get('/:id', getUserById);

export default router;
`;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

function authController(_config: ProjectConfig): string {
  return `import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../middleware/errorHandler';

// ── POST /api/auth/register ───────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Check for existing user
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  // Create user (password hashed by pre-save hook in User model)
  const user = await User.create({ name, email, password });

  // Generate JWT
  const token = generateToken({ id: user.id });

  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Fetch user with password (select: false by default in schema)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    // Intentionally vague — don't reveal which field is wrong
    throw new ApiError(401, 'Invalid email or password');
  }

  // Compare plain-text password with hashed value
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({ id: user.id });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ user });
};
`;
}

function userController(): string {
  return `import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../middleware/errorHandler';

// ── GET /api/users ────────────────────────────────────────────────────────────

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users, total: users.length });
};

// ── GET /api/users/:id ────────────────────────────────────────────────────────

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json({ user });
};
`;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function jwtUtils(): string {
  return `import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  id: string;
}

/**
 * Sign a new JWT token containing the given payload.
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify and decode a JWT token.
 * Throws a JsonWebTokenError / TokenExpiredError on failure.
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
`;
}

function cryptoUtils(): string {
  return `import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token string.
 * Useful for password reset tokens, email verification links, etc.
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a token for safe storage (e.g. password reset tokens stored in DB).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
`;
}

// ─── Server types ─────────────────────────────────────────────────────────────

function serverTypes(): string {
  return `import { Request } from 'express';

/** Express Request extended with authenticated user */
export interface AuthRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/** Standard API success response shape */
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

/** Standard pagination query params */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
}
`;
}
