const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "contact@gafarsa.com",
      pass: "contactGLS@2024",
    },
  });

 // console.log("options ", options);

  const mailOptions = {
    from: '"Gafarsa Contact" <contact@gafarsa.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);

};

module.exports = sendEmail;
