// Import statements adjusted for ESM syntax
import passport, { Profile } from 'passport';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { getSecret } from './secrets.js';
import User from '../models/user.js';

// see https://stackoverflow.com/questions/70632958/property-id-does-not-exist-on-type-user-with-passport-and-typescript
declare global {
  namespace Express {
    interface User {
      id: string; // Passport JS does not declare properties of User object so need to extend it
      microsoftId: string;
      displayName: string;
      email: string;
      isProfileComplete: boolean;
    }
  }
}

export async function configurePassport() {
  const clientSecret = await getSecret('MS_CLIENT_SECRET');

  if (typeof clientSecret === 'undefined') {
    throw new Error(
      'MS_CLIENT_SECRET is undefined. Please check your secret configuration.',
    );
  }

  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MS_CLIENT_ID as string,
        clientSecret: clientSecret,
        callbackURL: `${process.env.BASE_URL}${process.env.MS_REDIRECT_PATH}`,
        scope: ['user.read'],
      },
      async function callback(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (
          err: any,
          user?: any,
          options?: { message: string } | undefined,
        ) => void,
      ) {
        try {
          const userEmail = profile.emails && profile.emails[0].value;
          if (userEmail && userEmail.endsWith('.ox.ac.uk')) {
            let user = await User.findOne({ microsoftId: profile.id });
            if (!user) {
              user = await User.create({
                microsoftId: profile.id,
                displayName: profile.displayName,
                email: userEmail,
                isProfileComplete: false,
              });
            }
            done(null, user);
          } else {
            done(null, false, { message: 'Invalid host domain' });
          }
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize user by their database ID
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id); // Deserialize user by their database ID
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
