const { contactSchema, favoriteSchema } = require("../validator/validator");
const Contacts = require("./contactsModel");

const listContacts = async (req, res, next) => {
  const { _id } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;
  try {
    const contacts = await Contacts.find(
      favorite ? { owner: _id, favorite } : { owner: _id },
      "",
      {
        skip,
        limit: Number(limit),
      }
    ).populate("owner", "_id email subscription");

    res.json({ message: "Your list of contacts", code: 200, contacts });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contactByID = await Contacts.findById(contactId);

    res.json({ message: `contact by id=${contactId}`, code: 200, contactByID });
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing required name field";
      throw error;
    }
    const newContact = await Contacts.create({ ...req.body, owner: _id });

    res.status(201).json({ message: "contact created", code: 201, newContact });
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const contacts = await Contacts.findByIdAndRemove(contactId);

    res.status(200).json({ message: `contact deleted`, code: 200, contacts });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { name, email, phone, favorite } = req.body;
    const { error } = contactSchema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing fields";
      throw error;
    }

    const { contactId } = req.params;

    const contacts = await Contacts.findByIdAndUpdate(contactId, {
      name,
      email,
      phone,
      favorite,
    });

    res.status(200).json({
      message: `updated contact by id=${contactId} `,
      code: 200,
      contacts,
    });
  } catch (err) {
    next(err);
  }
};

const updateFavoriteContact = async (req, res, next) => {
  try {
    const { error } = favoriteSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "missing field favorite" });
    }

    const { contactId } = req.params;

    const updateStatusContact = await Contacts.findByIdAndUpdate(
      contactId,
      req.body,
      { new: true }
    );

    if (!updateStatusContact) {
      res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({
      message: `updated contact by id=${contactId} `,
      code: 200,
      updateStatusContact,
    });
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
  updateFavoriteContact,
};
