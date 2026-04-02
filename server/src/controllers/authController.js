import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

export async function register(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const { user, token } = await authService.loginUser(req.body);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const user = await authService.updateProfile(req.user._id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const result = await authService.changePassword(req.user._id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
