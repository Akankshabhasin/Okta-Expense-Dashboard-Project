import express from "express";
import "dotenv/config";

import { authCallback, ensureAuthenticated, login, logout } from "./auth.js";
import { dummyExpenseData } from './utils.js';

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", { title: "Home", user: req.user });
});

router.get("/login", login);

router.get("/authorization-code/callback", authCallback);

router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", { title: "Profile", user: req.user });
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const team = req.user?.teams || [];

  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
    team,
  });
});

router.get("/team/:id", ensureAuthenticated, (req, res) => {
  const teamId = req.params.id;
  const teamList = req.user?.teams || [];

  const team = teamList.find((team) => team.id === teamId);
  if (!team) {
    return res.status(404).send("Team not found");
  }

  const expenses = dummyExpenseData[teamId];
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  res.render("expenses", {
    title: team.name,
    user: req.user,
    team,
    expenses,
    total,
  });
});

router.get("/logout", logout);

export default router;
