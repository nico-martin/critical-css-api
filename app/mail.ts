import nodemailer from 'nodemailer';

export const sendMail = async (
  to: string,
  subject: string,
  content: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
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
