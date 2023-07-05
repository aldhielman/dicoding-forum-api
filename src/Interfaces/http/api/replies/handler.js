const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    // this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    request.payload.commentId = request.params.commentId;
    request.payload.userId = request.auth.credentials.id;
    const addedReply = await addReplyUseCase.execute(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  // async deleteCommentHandler(request, h) {
  //   const deleteCommentUseCase = this._container.getInstance(
  //     DeleteCommentUseCase.name
  //   );
  //   request.params.userId = request.auth.credentials.id;
  //   await deleteCommentUseCase.execute(request.params);

  //   return { status: 'success' };
  // }
}

module.exports = RepliesHandler;
