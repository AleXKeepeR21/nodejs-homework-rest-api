const express = require("express");
const router = express.Router();

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavoriteContact,
} = require("../../models/contacts");

const authMiddleware = require("../../middlewares/authMiddleware");

router.get("/", authMiddleware.protect, listContacts);

router.get("/:contactId", getContactById);

router.post("/", authMiddleware.protect, addContact);

router.delete("/:contactId", removeContact);

router.put("/:contactId", updateContact);

router.patch("/:contactId/favorite/", updateFavoriteContact);

module.exports = router;
