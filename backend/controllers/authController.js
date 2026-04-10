const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    const token = await AuthService.register(email, password);
    res.status(201).json({ token });
  } catch (error) {
    logger.error('Registration error: ' + error.message);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    const token = await AuthService.login(email, password);
    res.status(200).json({ token });
  } catch (error) {
    logger.error('Login error: ' + error.message);
    res.status(401).json({ error: error.message });
  }
};
