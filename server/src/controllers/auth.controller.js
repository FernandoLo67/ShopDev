import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { created, success } from '../utils/response.js';

export const register = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body;
  const result = await authService.register({ nombre, email, password });
  return created(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return success(res, result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return success(res, user);
});

export default { register, login, me };
