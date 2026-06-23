import CommentRepository from '../../prisma/repositories/comment.repository.js';

const getUserComments = async (userId: number) => {
  const comments = await CommentRepository.getUserComments(userId);
  return comments;
}

const createComment = async (userId: number, postId: number, content: string) => {
  const comment = await CommentRepository.create({
    content,
    userId,
    postId,
  });
  return comment;
}

export default {
  getUserComments,
  createComment
}
