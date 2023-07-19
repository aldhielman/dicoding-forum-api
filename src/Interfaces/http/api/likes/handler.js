const ToogleLikeUseCase = require('../../../../Applications/use_case/ToogleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const toogleLikeUseCase = this._container.getInstance(
      ToogleLikeUseCase.name,
    );

    request.params.userId = request.auth.credentials.id;
    const response = await toogleLikeUseCase.execute(request.params);
    return response;
  }
}

module.exports = LikesHandler;
