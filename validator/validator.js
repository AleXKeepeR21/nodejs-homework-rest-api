const Joi = require("joi");

const PASSWD_REGEX = /^(?=.*[a-z])(?=.*[0-9])(?=.{8,64})/;

const contactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string().min(3).max(30),
});

const favoriteSchema = Joi.object({
  favorite: Joi.boolean(),
});

const registerValidator = Joi.object({
  password: Joi.string().regex(PASSWD_REGEX).required(),
  email: Joi.string().email().required(),
  subscription: Joi.string(),
});

const loginValidator = Joi.object({
  password: Joi.string().regex(PASSWD_REGEX).required(),
  email: Joi.string().email().required(),
});

module.exports = {
  contactSchema,
  favoriteSchema,
  registerValidator,
  loginValidator,
};
