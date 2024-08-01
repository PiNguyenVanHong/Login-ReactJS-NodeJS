import { Router } from "express";
const router = Router();

// import all controllers
import * as controller from '../controllers/appController.js';
import Auth, { localVariables } from '../middleware/auth.js';
import { registerMail } from "../controllers/mailer.js";

// POST Methods
router.route('/register').post(controller.register);
router.route('/registerMail').post(registerMail); // send the email
router.route('/authenticate').post((req, res) => res.end()); // authenticate user
router.route('/login').post(controller.verifyUser, controller.login);

// GET Methods
router.route('/user/:username').get(controller.getUser)
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP) // generate random OTP
router.route('/verifyOTP').get(controller.verifyUser, controller.verifyOTP)
router.route('/createResetSession').get(controller.createResetSession)

// PUT Methods
router.route('/update-user').put(Auth, controller.updateUser)
router.route('/reset-password').put(controller.verifyUser, controller.resetPassword)

export default router;