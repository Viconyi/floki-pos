// Email sending utility for profile confirmation, reusing central service
const { sendEmail } = require('./emailService');

async function sendConfirmationEmail(to, name) {
  return sendEmail({
    to,
    subject: "Confirm your email for Floki's",
    html: `<p>Hello ${name},</p><p>Please confirm your email for Floki's by clicking the link below:</p><p><a href="#">Confirm Email</a></p>`,
  });
}

module.exports = { sendConfirmationEmail };
