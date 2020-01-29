export class ModelChessBoard {
	constructor() {
		this.arrChessPieces = [];
		this.whoseMove = 'white'; // чей сейчас ход. При старте новой игры первыми всегда ходят белые фигуры
		this.isChecked = false; // Чек королю
	}

	createNewChessPiece(arrNewPiece) {
		this.arrChessPieces = arrNewPiece;
	}

	findChessPieces(...args) {
		let chessPieces = this.arrChessPieces.map((piece) => piece);
		args.forEach((arg) => {
			chessPieces = chessPieces.filter((piece) => piece[arg.name] == arg.value);
		});
		if (chessPieces.length == 1) {
			return chessPieces[0];
		} else if (chessPieces.length > 1) {
			return chessPieces;
		} else {
			return null;
		}
	}

	findChessPiecesByPos(x, y) {
		return this.arrChessPieces.find((piece) => piece.pos.x == x && piece.pos.y == y);
	}

	get arrDomNodesChessPiece() {
		return this.arrChessPieces.map((piece) => {
			return piece.div;
		});
	}

	// ToDo: в Controller нужно перезаписывать значение или можно напрямую проверять пример: this.model.whoseMove == 'white'
	get whoseMoveNow() {
		return this.whoseMove;
	}

	changeWhoseMove() {
		this.whoseMove = this.whoseMove == 'white' ? 'black' : 'white';
	}

	get isCheckedNow() {
		return this.isChecked;
	}

	// ToDo: можно ли записывать напрямую или только через метод Model
	set changeIsChecked(value) {
		this.isChecked = value;
	}

	dropFirstMovePawn() {
		this.arrChessPieces.forEach((piece) => {
			piece.pieceName == 'pawn' && piece.isFirstMove == true ? (piece.isFirstMove = false) : false;
		});
	}

	saveGameToLocalStorage(tempPieces, previousPos) {
		const save = {
			arrChessPieces: this.arrChessPieces,
			tempPieces: tempPieces,
			previousPos: previousPos
		};
		localStorage.setItem('saveGame', JSON.stringify(save));
	}

	getSaveGame() {
		return JSON.parse(localStorage.getItem('saveGame'));
	}
}
