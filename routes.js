import express from "express";
import passport from "passport";
import "dotenv/config"; 

import { expensesByTeam } from './expensesData.js';

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.get("/", (req, res) => {
  res.render("home", { title: "Home", user: req.user });
});

router.get("/login", passport.authenticate("oidc"));

router.get(
  "/authorization-code/callback",
  passport.authenticate("oidc", { failureRedirect: "/login", failureMessage: true }),
  function (req, res) {
    res.redirect("/");
  }
);

router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", { title: "Profile", user: req.user });
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const teams = req.user?.profile?.teams || [];

  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
    teams
  });
});

router.get("/teams/:id", ensureAuthenticated, (req, res) => {
  const teamId = req.params.id;
  const teams = req.user?.profile?.teams || [];

  const team = teams.find((team) => team.id === teamId);
  if (!team) {
    return res.status(404).send("Team not found");
  }

  const expenses = expensesByTeam[teamId];
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  res.render("expenses", {
    title: team.name,
    user: req.user,
    team,
    expenses,
    total,
  });
});

router.get("/logout", (req, res) => {
  const id_token = req.user?.profile.idToken;
  req.logout(() => {
    req.session.destroy(() => {
      const logoutUrl = `${process.env.OKTA_ISSUER}/v1/logout?id_token_hint=${id_token}&post_logout_redirect_uri=${process.env.POST_LOGOUT_URL}`;
      res.redirect(logoutUrl);
    });
  });
});

export default router;