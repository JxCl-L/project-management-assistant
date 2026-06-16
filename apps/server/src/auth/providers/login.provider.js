const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const getUserByEmail = require("../../users/providers/getUserByEmail.provider.js");
const bcrypt = require("bcrypt");
const generateTokenProvider = require("./generateTokenProvider.js");

async function loginProvider(req, res) {
  const validatedData = req.body;

  // console.log("Login attempt:", {
  //     email: validatedData.email,
  //     passwordProvided: !!validatedData.password,
  //     passwordLength: validatedData.password?.length
  // });

  try {
    // Authentication step 1: Get user from DB
    const user = await getUserByEmail(validatedData.email);

    console.log("Try to login with:", validatedData);
    console.log("User lookup result:", {
      userFound: !!user,
      userHasPassword: user && !!user.password,
      userPasswordLength: user?.password?.length,
    });

    // Check if user exists BEFORE accessing user.password
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        // .json({ message: "The email is not registered." });
        .json({ message: "Invalid email or password." }); // Avoid revealing whether email or password is incorrect
    }

    // Authentication step 2: Compare hashed password with the password from request
    const result = await bcrypt.compare(validatedData.password, user.password);

    if (!result) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        // .json({ message: "Please check your password and try again." });
        .json({ message: "Invalid email or password." }); // Avoid revealing whether email or password is incorrect
    }

    // Authentication step 3: Generate JWT token
    const token = generateTokenProvider(user);

    // Authentication step 4: Send the token to the client
    res.status(StatusCodes.OK).json({
      accessToken: token,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    errorLogger("Error while trying to login", req, error);
    return res
      .status(StatusCodes.GATEWAY_TIMEOUT)
      .json({
        reason: "Unable to process your request, please try again later.",
      });
  }
}

module.exports = loginProvider;
