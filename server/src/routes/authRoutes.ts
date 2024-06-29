import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/login', passport.authenticate('microsoft'));

router.get('/login/callback',
  passport.authenticate('microsoft', { failureRedirect: `${process.env.CLIENT_URL}/` }), // TODO tell user reason for failure (e.g. invalid domain)
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/`);
  }
);

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session', error: err });
      }
      res.clearCookie('connect.sid'); // clear the session cookie
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/status', (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated() });
});

export default router;