const Joi = require("joi");

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

module.exports = { contactSchema, favoriteSchema };
