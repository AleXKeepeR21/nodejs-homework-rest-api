const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const gravatar = require("gravatar");
const uuid = require("uuid").v4;

const Users = require("../models/usersModel");
const { sendEmail } = require("../services/sendEmail");
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

    const verificationToken = uuid();

    const avatarURL = gravatar.url(email, { d: "wavatar" });

    const newUser = await Users.create({
      ...req.body,
      avatarURL,
      verificationToken,
    });
    newUser.password = undefined;

    const token = signToken(newUser.id);

    const mail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}"> Click to verify your email </a>`,
    };
    await sendEmail(mail);

    res.status(201).json({
      user: newUser,
      token,
      avatarURL,
      verificationToken,
    });
  } catch (error) {
    console.log(error.message);
    return error;
    // throw error;
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
    if (!user || !user.verify) {
      res
        .status(401)
        .json({ message: "Email is wrong or not verify or password is wrong" });
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

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  try {
    const user = await Users.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.verificationToken = null;
    user.verify = true;

    await Users.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }
};

const verifyEmailRepeat = async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });

  const { verificationToken } = user;

  if (!email) {
    return res.status(400).json({
      code: 400,
      message: "Missing required field email",
    });
  }

  if (user.verify) {
    return res.status(400).json({
      code: 400,
      message: "Verification has already been passed",
    });
  }

  const mail = {
    to: email,
    subject: "Email submission",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Submit email</a>`,
  };

  await sendEmail(mail);

  res.json({
    status: "Ok",
    code: 200,
    message: "Verification email sent",
  });
};

module.exports = {
  register,
  login,
  current,
  logout,
  updateUser,
  verifyEmail,
  verifyEmailRepeat,
};
