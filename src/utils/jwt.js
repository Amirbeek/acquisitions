import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';

export const jwttoken = {
  sign(payload) {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      logger.error('Failed to authenticate JWT', error);
      throw new Error('Unable to authenticate JWT');
    }
  },
  verify(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to authenticate JWT', error);
      throw new Error('Unable to authenticate JWT');
    }
  },
};
