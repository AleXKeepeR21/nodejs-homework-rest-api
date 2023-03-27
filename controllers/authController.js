const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const gravatar = require("gravatar");

const Users = require("../models/usersModel");

const { registerValidator, loginValidator } = require("../validator/validator");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const register = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = registerValidator.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing required field";
      throw error;
    }

    const userEmail = await Users.findOne({ email });

    if (userEmail) {
      return res.status(409).json({
        code: 409,
        message: "Email in use",
      });
    }

    // const avatarURL = gravatar.url(email);
    const avatarURL = gravatar.url(email, { d: "wavatar" });

    const newUser = await Users.create({
      ...req.body,
      avatarURL,
    });
    newUser.password = undefined;

    const token = signToken(newUser.id);

    res.status(201).json({
      user: newUser,
      token,
      avatarURL,
    });
  } catch (error) {
    console.log(error.message);
    return error;
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = loginValidator.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing required field";
      throw error;
    }

    const user = await Users.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Email or password is wrong" });
    }

    const passwordIsValid = await user.checkPassword(password, user.password);
    if (!passwordIsValid) {
      res.status(401).json({ message: "Email or password is wrong" });
    }

    user.password = undefined;

    const token = signToken(user.id);
    await Users.findByIdAndUpdate(user.id, { token });

    res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    return error;
  }
};

const current = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await Users.findByIdAndUpdate(_id, { token: null });
  res.status(401).json({ message: "Not authorized" });
};

const updateUser = async (req, res) => {
  // if (!req.file) {
  //   throw new Error(400, "Avatar must be provided");
  // }
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const imageName = `${id}_${originalname}`;

  try {
    const resultUpload = path.join(avatarsDir, imageName);
    await fs.rename(tempUpload, resultUpload);

    const avatarURL = path.join("public", "avatars", imageName);

    await Users.findByIdAndUpdate(req.user._id, { avatarURL });

    res.status(200).json({ avatar: avatarURL, message: "avatar updated" });
  } catch (error) {
    await fs.unlink(tempUpload);

    console.log(error.message);
  }
};

module.exports = {
  register,
  login,
  current,
  logout,
  updateUser,
};
