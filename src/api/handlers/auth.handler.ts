import { Prisma, User } from '../../generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserRepository from '../../prisma/repositories/user.repository.js';
import { env } from '../../config/enviroment.js';

const SALT_ROUND = 10;
const TOKEN_EXPIRATION = 60 * 60 * 24; // 1 day

const signUp = async (payload: Prisma.UserCreateInput) => {
  const { name, email, password } = payload;

  const salt = await bcrypt.genSalt(SALT_ROUND);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await UserRepository.create({
    name,
    email,
    password: hashPassword,
  });
  return user;
}

const login = async (payload: { email: string, password: string }) => {
  const { email, password } = payload;

  const user = await UserRepository.findOneByEmail(email, { excludeSensitiveFields: false }) as User;

  if (!user) {
    throw Error('Email or Password is not correct');
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    throw Error('Email or Password is not correct');
  };

  const token = jwt.sign({id: user.id}, env.JWT_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });

  return token;
}

export default {
  signUp,
  login
}
