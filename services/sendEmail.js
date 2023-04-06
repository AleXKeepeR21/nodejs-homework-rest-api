const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "alexkeepersendgrid@gmail.com" };
  try {
    await sgMail.send(email);
    return true;
    //       .catch((error) => {
    //   console.error(error.message);
    // });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendEmail,
};
