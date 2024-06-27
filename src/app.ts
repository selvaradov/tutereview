// Import required modules
import {loadEnvConfig} from './config/envConfig.js' // configure environment variables
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

// Import routes
import authRouter from './routes/authRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';

// Set up environment variables and Passport
loadEnvConfig();
configurePassport();

const app: Application = express();

// EJS view engine setup
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// Session store setup
let sessionStore: any;

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
  sessionStore = new SQLiteStore({ db: 'sessions.db', dir: './var/db' });
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'my-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using https
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// Static folder
app.use(express.static('public'));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.render('pages/index');
});
app.use('/auth', authRouter);
app.use('/', ensureAuthenticated, reviewRouter);

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