import PostRepository from '../../prisma/repositories/post.repository.js';

const getUserPosts = async (userId: number) => {
  const posts = await PostRepository.getUserPosts(userId);
  return posts;
}

const createPost = async (userId: number, title: string, content: string) => {
  const post = await PostRepository.create({
    title,
    content,
    authorId: userId,
  });

  return post;
}

export default {
  getUserPosts,
  createPost
}

