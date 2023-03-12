const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const contactsPath = path.join("models", "contacts.json");

const contactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  phone: Joi.string().min(3).max(30).required(),
});

const listContacts = async (req, res, next) => {
  try {
    const contacts = await fs.readFile(contactsPath, "utf-8");
    const parsedContacts = JSON.parse(contacts);
    if (!parsedContacts.length) {
      console.log("no contacts");
      return res
        .status(404)
        .json({ status: "error", code: 404, message: "Not found" });
    }

    res.json({ message: "Your list of contacts", code: 200, parsedContacts });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contacts = await fs.readFile(contactsPath, "utf-8");
    const parsedContacts = JSON.parse(contacts);
    const { contactId } = req.params;
    const contactByID = parsedContacts.filter(
      (contact) => contact.id === contactId.toString()
    );

    if (!contactByID.length) {
      const error = new Error(`Not found contacts id=${contactId}`);
      error.status = 404;
      throw error;
    }

    res.json({ message: `contact by id=${contactId}`, code: 200, contactByID });
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing required name field";
      throw error;
    }
    const { name, email, phone } = req.body;
    const contacts = await fs.readFile(contactsPath, "utf-8");
    let parsedContacts = JSON.parse(contacts);
    const newContact = {
      id: uuidv4(),
      name: name.toString(),
      email: email.toString(),
      phone: phone.toString(),
    };
    parsedContacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(parsedContacts), "utf-8");

    res.status(201).json({ message: "contact created", code: 201, newContact });
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const contacts = await fs.readFile(contactsPath, "utf-8");
    const parsedContacts = JSON.parse(contacts);

    const { contactId } = req.params;

    const contactById = parsedContacts.filter(
      (contact) => contact.id !== contactId
    );
    if (!contactById.length) {
      const error = new Error(`contact by id=${contactId} not found`);
      error.status = 404;
      throw error;
    }

    const contactsAfterRemove = parsedContacts.filter(
      (contact) => contact.id !== contactId
    );

    res
      .status(200)
      .json({ message: `contact deleted`, code: 200, contactsAfterRemove });

    await fs.writeFile(
      contactsPath,
      JSON.stringify(contactsAfterRemove),
      "utf-8"
    );
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { error } = contactSchema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing fields";
      throw error;
    }

    const { contactId } = req.params;

    const contacts = await fs.readFile(contactsPath, "utf8");
    const parsedContacts = JSON.parse(contacts);

    const contactById = parsedContacts.filter((el) => el.id !== contactId);
    if (!contactById.length) {
      const error = new Error(`contact by id=${contactId} not found`);
      error.status = 404;
      throw error;
    }

    parsedContacts.forEach((contact) => {
      if (contact.id === contactId) {
        contact.name = name;
        contact.email = email;
        contact.phone = phone;

        res.status(200).json({
          message: `updated contact by id=${contactId} `,
          code: 200,
          contact,
        });
      }
    });

    await fs.writeFile(contactsPath, JSON.stringify(parsedContacts), "utf-8");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
