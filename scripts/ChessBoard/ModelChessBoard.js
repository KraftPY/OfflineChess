export class ModelChessBoard {
	constructor() {}

	saveGameToLocalStorage(arrChessPieces, tempPieces, previousPos) {
		localStorage.setItem('saveGame', JSON.stringify({ arrChessPieces, tempPieces, previousPos }));
	}

	getSaveGame() {
		return JSON.parse(localStorage.getItem('saveGame'));
	}
}
