import UserRepository from '../../prisma/repositories/user.repository.js';

const getOne = async (id: number) => {
  const user = await UserRepository.findOne(id);
  return user;
}

const update = async (id: number, payload: { name?: string; email?: string; address?: string }) => {
  const user = await UserRepository.update(id, payload);
  return user;
}

export default {
  getOne,
  update
}
