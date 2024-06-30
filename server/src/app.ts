// Import required modules
import { loadEnvConfig } from './config/envConfig.js' // configure environment variables
import express, { Application, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { FirestoreStore } from '@google-cloud/connect-firestore';
import { Firestore } from '@google-cloud/firestore';
import connectSQLite3 from 'connect-sqlite3';
import passport from 'passport';
import { configurePassport } from './config/passportConfig.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
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
// enable pre-flight requests for all routes
app.options('*', cors(corsOptions)); 

// Session store setup
let sessionStore: any;

const dbPath = path.join(__dirname, 'var', 'db', 'sessions.db');

const firestore = new Firestore({ // TODO should this be used further down?
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

if (process.env.NODE_ENV === 'production') {
  // use Firestore in production
  sessionStore = new FirestoreStore({
    dataset: new Firestore(),
    kind: 'express-sessions',
  })
} else {
  // use SQLite in development
  const SQLiteStore = connectSQLite3(session);
  sessionStore = new SQLiteStore({ db: 'sessions.db', dir: path.dirname(dbPath) });
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'my-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      sameSite: 'lax',
    }, // TODO change for production
  })
);

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
  if (req.isAuthenticated() && req.user.isProfileComplete) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Routes
app.use('/auth', authRouter);
app.use('/api', ensureAuthAndComplete, apiRouter); // users can only search/submit reviews if profile is complete
app.use('/user', ensureAuth, userRouter); // this is where users can complete their profile

// database setup
const mongoURI = 'mongodb://localhost/reviewDB';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Error handling
app.use((err: unknown, req: Request, res: Response, next: Function) => {
  console.error('An error occurred', err);
  res.status(500).send('Something went wrong!');
});

export default app;