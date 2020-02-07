export class ModelHistoryOfMoves {
	constructor() {
		// this.arrMoves = [];
	}

	getMoveFromLocalStorage() {
		const saveGame = JSON.parse(localStorage.getItem('saveGame')),
			lastElem = JSON.parse(saveGame[saveGame.length - 1]);

		return {
			firstPiece: lastElem.tempPieces.first,
			secondPiece: lastElem.tempPieces.second,
			previousPos: lastElem.previousPos
		};
	}

	getAllMoveFromLS() {
		const saveGame = JSON.parse(localStorage.getItem('saveGame'));
		return saveGame.map((el) => {
			let move = JSON.parse(el);
			return {
				firstPiece: move.tempPieces.first,
				secondPiece: move.tempPieces.second,
				previousPos: move.previousPos
			};
		});
	}

	deleteChoosedMovesFromLS(num) {
		const saveGame = JSON.parse(localStorage.getItem('saveGame'));
		saveGame.splice(num, saveGame.length - (num + 1));
		localStorage.setItem('saveGame', JSON.stringify(saveGame));
	}
}
