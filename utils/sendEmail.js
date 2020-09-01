const nodemailer = require('nodemailer');
const Email = require('../models/Email');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (options) => {
  const from = `${process.env.FROM_NAME}, <${process.env.FROM_EMAIL}>`; // sender address

  const msg = {
    from,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };


  try {
    const info = await transporter.sendMail(msg);
    console.log('Message sent: %s', info.messageId);

    await Email.create({
      subject: options.subject,
      content: options.message,
      messageID: info.messageId,
      from,
      sentTo: options.email,
    }).catch((e) => { console.log('Couldnt save email', e); });
  } catch (error) {
    await Email.create({
      subject: options.subject,
      content: options.message,
      error,
      from,
      sentTo: options.email,
    }).catch((e) => { console.log('Couldnt save email', e); });

    throw error;
  }
};


module.exports = sendEmail;
