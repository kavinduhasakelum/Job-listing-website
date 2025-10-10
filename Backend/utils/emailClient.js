import nodemailer from "nodemailer";

const SMTP_SERVICE = process.env.SMTP_SERVICE;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : undefined;
const SMTP_SECURE =
  typeof process.env.SMTP_SECURE === "string"
    ? ["true", "1", "yes", "on"].includes(
        process.env.SMTP_SECURE.toLowerCase()
      )
    : undefined;
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

let transporter = null;
let transporterInitAttempted = false;

const buildTransportOptions = () => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Email transport not configured. Set SMTP_USER and SMTP_PASS (or EMAIL_USER and EMAIL_PASS) environment variables."
    );
  }

  const options = {
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  };

  if (SMTP_HOST) {
    options.host = SMTP_HOST;
    if (SMTP_PORT !== undefined && !Number.isNaN(SMTP_PORT)) {
      options.port = SMTP_PORT;
    }
    if (typeof SMTP_SECURE === "boolean") {
      options.secure = SMTP_SECURE;
    } else if (options.port === 465) {
      options.secure = true;
    } else if (options.port === undefined) {
      options.port = 587;
      options.secure = false;
    }
  } else {
    options.service = (SMTP_SERVICE || "gmail").toLowerCase();
    if (typeof SMTP_SECURE === "boolean") {
      options.secure = SMTP_SECURE;
    }
  }

  return options;
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporterInitAttempted = true;
  const options = buildTransportOptions();
  transporter = nodemailer.createTransport(options);
  return transporter;
};

export const sendEmail = async ({ from, ...mailOptions }) => {
  try {
    const mailTransporter = getTransporter();
    const sender = from || SMTP_FROM || SMTP_USER;

    return await mailTransporter.sendMail({
      from: sender,
      ...mailOptions,
    });
  } catch (error) {
    const responseText = error?.response || error?.message || "";
    const responseCode = error?.responseCode;

    const isAuthFailure =
      error?.code === "EAUTH" ||
      responseCode === 535 ||
      /5\.7\.[08]/i.test(responseText);

    if (isAuthFailure) {
      const usingGmail =
        !SMTP_HOST && (SMTP_SERVICE || "gmail").toLowerCase() === "gmail";
      const hints = [];

      if (usingGmail) {
        hints.push(
          "Gmail rejected the credentials. Enable 2-Step Verification, then create an App Password and use it as SMTP_PASS. See https://support.google.com/mail/?p=BadCredentials"
        );
      } else if (SMTP_HOST) {
        hints.push(
          `SMTP authentication failed for host ${SMTP_HOST}. Verify the username/password and any IP allow lists.`
        );
      } else {
        hints.push(
          "SMTP authentication failed. Double-check SMTP_USER/SMTP_PASS values."
        );
      }

      const authError = new Error(`Unable to send email: ${hints.join(" ")}`);
      authError.originalError = error;
      throw authError;
    }

    if (!transporterInitAttempted) {
      throw new Error(
        "Email transport not configured. Set SMTP_USER and SMTP_PASS (or EMAIL_USER and EMAIL_PASS) environment variables."
      );
    }

    throw error;
  }
};
