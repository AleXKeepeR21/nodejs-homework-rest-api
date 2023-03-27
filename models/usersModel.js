const { model, Schema } = require("mongoose");
const bcrypt = require("bcrypt");

const { USER_SUBSCR_ENUM } = require("../constants/enums");

const usersSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
      select: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "User with this email already exists"],
      lowercase: true,
    },
    subscription: {
      type: String,
      enum: Object.values(USER_SUBSCR_ENUM),
      default: USER_SUBSCR_ENUM.STARTER,
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      default: "avatars/user.webp",
    },
  },
  {
    timestamps: true,
  }
);

usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

usersSchema.methods.checkPassword = (candidate, hash) =>
  bcrypt.compare(candidate, hash);

const Users = model("user", usersSchema);

module.exports = Users;
