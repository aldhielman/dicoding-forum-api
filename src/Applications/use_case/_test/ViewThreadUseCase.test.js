const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ViewThreadUseCase = require('../ViewThreadUseCase');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

describe('ViewUserUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockDetailThread = new DetailThread({
      id: useCasePayload.threadId,
      title: 'Title 1',
      body: 'Body 1',
      date: new Date().toISOString(),
      username: 'dicoding',
      comments: [
        new DetailComment({
          id: 'comment-123',
          username: 'dicodingother',
          date: '2021-08-08T07:22:33.555Z',
          content: 'Comment 1',
          replies: [],
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'dicodingotheragain',
          date: '2022-08-08T07:22:33.555Z',
          content: 'Comment 2',
          replies: [
            new DetailReply({
              id: 'reply-123',
              username: 'dicoding',
              date: '2021-09-08T07:22:33.555Z',
              content: 'Reply 1',
            }),
          ],
        }),
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */

    mockThreadRepository.viewThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));

    /** creating use case instance */
    const getThreadUseCase = new ViewThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual(mockDetailThread);

    expect(mockThreadRepository.viewThread).toBeCalledWith(
      useCasePayload.threadId
    );
  });
});
