import UserRepository from '../../prisma/repositories/user.repository.js';

const getOne = async (id: number) => {
  const user = await UserRepository.findOne(id);
  return user;
}

export default {
  getOne
}
