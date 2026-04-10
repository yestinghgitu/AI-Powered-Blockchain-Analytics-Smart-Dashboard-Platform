const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
  async register(email, password) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserRepository.createUser({ email, password: hashedPassword });
    return this.generateToken(user);
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return this.generateToken(user);
  }

  generateToken(user) {
    const payload = { user: { id: user.id, email: user.email, role: user.role } };
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }
}

module.exports = new AuthService();
