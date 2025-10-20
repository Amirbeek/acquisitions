import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/db.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }

    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    logger.error('Error hashing password:', err);
    throw new Error('Failed to hash password');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }

    if (typeof hashedPassword !== 'string' || hashedPassword.length === 0) {
      throw new Error('Hashed password must be a non-empty string');
    }

    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    logger.error('Error comparing password:', err);
    throw new Error('Failed to compare password');
  }
};

export const createUser = async ({ name, email, password, role }) => {
  try {
    // Check user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User ${newUser.email} successfully created!`);
    return newUser;
  } catch (err) {
    logger.error('Error creating user:', err);
    throw new Error('Error creating user');
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Return user without password
    logger.info(`User ${user.email} authenticated successfully`);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };
  } catch (err) {
    logger.error('Error authenticating user:', err);
    throw err;
  }
};
