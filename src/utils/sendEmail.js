import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    });

    return info;
  } catch (error) {
    console.log("sendEmail error:", error);
    throw new Error(error.message || "Failed to send email");
  }
};

export default sendEmail;