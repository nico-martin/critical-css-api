import nodemailer from 'nodemailer';

export const sendMail = async (to, subject, content) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `critical-css.io <${process.env.SMTP_USER}>`,
    to: to,
    subject: subject,
    html: content,
  });
};
