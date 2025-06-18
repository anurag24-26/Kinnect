const nodemailer = require("nodemailer");
const { welcomeTemplate } = require("../utils/emailTemplates");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendWelcomeEmail = async (to, username) => {
  await transporter.sendMail({
    from: `"Kinnect" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: "Welcome to Kinnect 🎉",
    html: welcomeTemplate(username),
  });
};
