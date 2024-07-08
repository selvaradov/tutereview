// Import required modules
import { loadEnvConfig } from './config/env.js' // configure environment variables
import express, { Application, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import { getMongoURI } from './config/db.js';
import { getSecret } from './config/secrets.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Import routes
import authRouter from './routes/authRoutes.js';
import apiRouter from './routes/apiRoutes.js';
import userRouter from './routes/userRoutes.js';

// Set up environment variables and Passport
loadEnvConfig();
configurePassport();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cookieParser());

app.use(helmet());

// database setup
const mongoURI = await getMongoURI();
if (!mongoURI) {
  console.error('MongoURI is not set');
  process.exit(1);
}
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => {
    console.error('Could not connect to MongoDB...', err)
    process.exit(1);
  });

// Session store setup
const sessionStore = MongoStore.create({
  mongoUrl: mongoURI,
  ttl: 14 * 24 * 60 * 60, // 14 days
})

const sessionSecret = await getSecret('SESSION_SECRET')
if (!sessionSecret) {
  console.error('SESSION_SECRET is not set');
  process.exit(1);
}
app.use(
  session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
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
  if (!res.headersSent) { // avoid sending a response twice
    res.status(500).send('Something went wrong!');
  }
});

export default app;