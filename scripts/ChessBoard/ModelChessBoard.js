export class ModelChessBoard {
	constructor() {
		this.arrChessPieces = [];
		this.whoseMove = 'white'; // чей сейчас ход. При старте новой игры первыми всегда ходят белые фигуры
		this.isChecked = false; // Чек королю
		this.numMove = null;
	}

	createNewChessPiece(arrNewPiece, newGame = false) {
		this.arrChessPieces = arrNewPiece;
		newGame ? localStorage.setItem('saveGame', JSON.stringify([])) : false;
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

	get whoseMoveNow() {
		return this.whoseMove;
	}

	changeWhoseMove() {
		this.whoseMove = this.whoseMove == 'white' ? 'black' : 'white';
	}

	get isCheckedNow() {
		return this.isChecked;
	}

	set changeIsChecked(value) {
		this.isChecked = value;
	}

	dropFirstMovePawn() {
		this.arrChessPieces.forEach((piece) => {
			piece.pieceName == 'pawn' && piece.isFirstMove == true ? (piece.isFirstMove = false) : false;
		});
	}

	savePawnPromotion(chessPiece, pieceName) {
		chessPiece.pieceName = pieceName;
		chessPiece.div.className = `${pieceName}_${chessPiece.color}`;
		chessPiece.isPromotion = true;
	}

	saveGameToLocalStorage(tempPieces, previousPos) {
		const save = {
			arrChessPieces: this.arrChessPieces,
			tempPieces: tempPieces,
			previousPos: previousPos
		};
		let arrHistoryMove = JSON.parse(localStorage.getItem('saveGame'));
		arrHistoryMove.push(JSON.stringify(save));
		localStorage.setItem('saveGame', JSON.stringify(arrHistoryMove));
	}

	getSaveGame(num = null) {
		const saveGame = JSON.parse(localStorage.getItem('saveGame'));
		if (saveGame != null && saveGame.length != 0) {
			const saveMove = num != null ? JSON.parse(saveGame[num]) : JSON.parse(saveGame[saveGame.length - 1]);
			return saveMove;
		} else {
			return false;
		}
	}

	set changeNumMove(value) {
		this.numMove = value;
	}

	get getNumMove() {
		return this.numMove;
	}
}
