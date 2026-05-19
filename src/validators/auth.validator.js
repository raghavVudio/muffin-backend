import Joi from 'joi';

export const signupSchema = Joi.object({
  email:           Joi.string().email().required().lowercase().label('Email'),
  password:        Joi.string().min(8).max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({ 'string.pattern.base': 'Password must have uppercase, lowercase, and a number' })
    .label('Password'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' })
    .label('Confirm password'),
});

export const loginSchema = Joi.object({
  email:    Joi.string().email().required().lowercase(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name:      Joi.string().min(2).max(120),
  avatarUrl: Joi.string().uri().allow(null, ''),
});
