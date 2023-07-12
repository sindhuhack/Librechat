const { setAuthTokens } = require('../../services/auth.service');
const Session = require('../../../models/Session');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

const loginController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // If user doesn't exist, return error
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = await setAuthTokens(user._id, res);

    return res.status(200).send({ token, user });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  loginController
};
