const multer = require("multer");
const uuid = require("uuid").v4;
const path = require("path");

const tmpDir = path.join(__dirname, "../", "tmp");

const multerStorage = multer.diskStorage({
  destination: (req, file, cbk) => {
    cbk(null, tmpDir);
  },
  filename: (req, file, cbk) => {
    const ext = file.mimetype.split("/")[1];
    cbk(null, `${req.user.id}-${uuid()}.${ext}`);
  },
});

const multerFilter = (req, file, cbk) => {
  if (file.mimetype.startsWith("image")) {
    cbk(null, true);
  } else {
    cbk(new Error(401, "Not valenok"), false);
  }
};

const uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single("avatars");

module.exports = { uploadUserPhoto };
