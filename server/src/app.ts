// Import required modules
import { loadEnvConfig } from './config/env.js' // configure environment variables
import express, { Application, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectSQLite3 from 'connect-sqlite3';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import routes
import authRouter from './routes/authRoutes.js';
import apiRouter from './routes/apiRoutes.js';
import userRouter from './routes/userRoutes.js';

// Set up environment variables and Passport
loadEnvConfig();
configurePassport();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cookieParser());

// CORS setup
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // enable pre-flight requests for all routes

// database setup
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost/reviewDB';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Session store setup
const sessionStore = MongoStore.create({
  mongoUrl: mongoURI,
  ttl: 14 * 24 * 60 * 60, // 14 days
})

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'my-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../build')));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

function ensureAuthAndComplete(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.user.isProfileComplete) {
    return res.status(403).json({ error: 'Profile is incomplete' });
  }
  return next();
}

// Routes
app.use('/auth', authRouter);
app.use('/api', ensureAuthAndComplete, apiRouter); // users can only search/submit reviews if profile is complete
app.use('/user', ensureAuth, userRouter); // this is where users can complete their profile

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Error handling
app.use((err: unknown, req: Request, res: Response, next: Function) => {
  console.error('An error occurred', err);
  res.status(500).send('Something went wrong!');
});

export default app;