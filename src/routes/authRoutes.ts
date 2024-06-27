import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/login', passport.authenticate('microsoft'));

router.get('/login/callback', passport.authenticate('microsoft', { failureRedirect: '/' }), // TODO tell user reason for failure (e.g. invalid domain)
  (req, res) => {
    res.redirect('/review');
  });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;