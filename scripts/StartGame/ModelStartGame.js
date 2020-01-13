export class ModelStartGame {
	constructor() {}

	getSaveGameFromLS() {
		return JSON.parse(localStorage.getItem('history'));
	}

	getLastMoveFromSaveGame(arrFigures) {
		let firstFigure = null,
			secondFigure = null;
		const saveGame = JSON.parse(localStorage.getItem('history'));
		const swap = saveGame.lastMove.swap,
			previousPos = saveGame.lastMove.firstFigure.previousPos,
			nextPos = saveGame.lastMove.firstFigure.nextPos;

		if (swap) {
			firstFigure = arrFigures.find(
				(el) =>
					el.color == saveGame.lastMove.firstFigure.color &&
					el.constructor.name == saveGame.lastMove.firstFigure.figureName &&
					el.figure.classList.contains('figures_out')
			);
			secondFigure = arrFigures.find(
				(el) => el.pos.x == previousPos.x && el.pos.y == previousPos.y
			);
		} else {
			firstFigure = arrFigures.find(
				(el) => el.pos.x == nextPos.x && el.pos.y == nextPos.y
			);
			if (saveGame.lastMove.secondFigure.figureName) {
				secondFigure = arrFigures.find(
					(el) =>
						el.color == saveGame.lastMove.secondFigure.color &&
						el.constructor.name == saveGame.lastMove.secondFigure.figureName &&
						el.figure.classList.contains('figures_out')
				);
			}
		}
		return { firstFigure, previousPos, secondFigure, swap };
	}
}
