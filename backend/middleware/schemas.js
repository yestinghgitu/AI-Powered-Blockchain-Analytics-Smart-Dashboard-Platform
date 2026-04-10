const { z } = require('zod');

const schemas = {
  aiChat: z.object({
    body: z.object({
      message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
      context: z.any().optional().default({})
    })
  }),
  // Additional schemas can be added here
  authLogin: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })
  }),
  authRegister: z.object({
    body: z.object({
      username: z.string().min(3, 'Username must be at least 3 characters').max(30),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })
  })
};

module.exports = schemas;
