import express from 'express';
import session from 'express-session';
import passport from 'passport'; 
import routes from './routes.js';
import expressLayouts from 'express-ejs-layouts';

const app = express();

app.set('view engine', 'ejs');
app.use(expressLayouts); 
app.set('layout', 'layout');
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: "your-hardcoded-secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.use('/', routes);

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});