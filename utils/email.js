const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid

      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // send actucal eamil
    // 1 Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template.pug}`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2 Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3 Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token(valid for only 10 minutes)'
    );
  }
};

// const sendMail = (options) => {
//   // 1 create a trasporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // 2 create mail options
//   const mailOptions = {
//     from: 'nodemailer@gmail.com',
//     to: options.to,
//     subject: options.subject,
//     text: options.message,
//   };
//   // 3 actually send the mail
//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.log('Error sending email', err);
//     } else {
//       console.log('Email sent: ', info.response);
//     }
//   });
// };

// module.exports = sendMail;
