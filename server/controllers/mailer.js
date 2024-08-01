import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import ENV from '../config.js';

let nodeConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: ENV.EMAIL, //
        pass: ENV.EMAIL_PASS, //
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
});

export const registerMail = async (req, res) => {
    const {username, userEmail, text, subject} = req.body;

    var email = {
        body: {
            name: username,
            intro: text || "Welcome to Daily Tuition! We're very excited to have you on board.",
            outro: "Need help, or have question? Just reply to this email, we'd love to help."
        }
    }

    var emailBody = MailGenerator.generate(email);

    let message = {
        from: ENV.EMAIL, //
        to: userEmail,
        subject: subject || "Signup Successful",
        html: emailBody
    }

    // send email
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({msg: "You should check an email form us."});
        })
        .catch((err) => {
            return res.status(500).send({err});
        })
}