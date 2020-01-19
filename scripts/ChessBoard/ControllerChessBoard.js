import { ViewChessBoard } from './ViewChessBoard.js';
import { ModelChessBoard } from './ModelChessBoard.js';

export class ControllerChessBoard {
	constructor(publisher) {
		this.arrChessPieces = [];
		this.view = new ViewChessBoard(
			this.arrChessPieces,
			this.clickChessPiece.bind(this),
			this.clickEmptyCell.bind(this)
		);
		this.model = new ModelChessBoard();
		this.publisher = publisher;
		this.tempPieces = { first: null, second: null };
		this.whoseMove = 'white'; // чей сейчас ход. При старте новой игры первыми всегда ходят белые фигуры
		this.isChecked = false;
	}

	newGame() {
		this.view.renderNewGame();

		// сразу находим королей, чтоб потом проверяти их на чек
		this.whiteKing = this.arrChessPieces.find((piece) => piece.id == 'e1');
		this.blackKing = this.arrChessPieces.find((piece) => piece.id == 'e8');
	}

	loadGame() {}

	clickEmptyCell(ev) {
		// ToDo: Можно ли проверять класс в Контролере???
		if (ev.target.tagName == 'TD' && this.tempPieces.first && ev.target.classList.contains('figureMove')) {
			let previousPos = this.tempPieces.first.pos;
			this.view.moveToEmptyCell(this.tempPieces.first, ev.target);

			// Проверка на чек королю
			if (this.kingIsCheck()) {
				this.endMove(previousPos);
			}
		}
	}

	clickChessPiece(ev) {
		let piece = this.arrChessPieces.find((piece) => piece.id == ev.target.dataset.id);
		if (this.tempPieces.first && this.whoseMove != piece.color && piece.div.classList.contains('figureKill')) {
			let previousPos = { x: this.tempPieces.first.pos.x, y: this.tempPieces.first.pos.y };
			this.tempPieces.second = piece;
			this.view.takingEnemyChessPiece(this.tempPieces);

			// Проверка на чек королю
			if (this.kingIsCheck()) {
				this.endMove(previousPos);
			}
		} else if (this.whoseMove == piece.color && this.tempPieces.first != piece) {
			this.tempPieces.first = piece;
			let moves = this.getMovesPiece(this.tempPieces.first);
			// очищаем доску от возможных ходов и взятий
			this.view.clearChessBoard();
			this.view.selectChessPiece(piece);
			this.view.showMoves(moves);
		} else if (this.tempPieces.first == piece) {
			this.view.clearChessBoard();
			this.tempPieces.first = null;
		}
	}

	endMove(previousPos) {
		// сохраняем позиции всех фигур после хода и последний ход
		this.model.saveGameToLocalStorage(this.arrChessPieces, this.tempPieces, previousPos);

		// очищаем доску от возможных ходов, а так же обнуляем временные фигуры
		this.view.clearChessBoard();
		this.tempPieces = { first: null, second: null };

		// передаем ход другому игроку
		this.whoseMove = this.whoseMove == 'white' ? 'black' : 'white';

		// Оповещаем что ход сделан
		this.publisher.publish('moveEnd');
	}

	kingIsCheck() {
		let saveMove = true;
		// фильтруем фигуры которые выбиты с доски
		const arrPieces = this.arrChessPieces.filter((piece) => !piece.div.classList.contains('figures_out'));

		// смотрим все возможные ходы всех фигур на шахматной доске
		arrPieces.forEach((piece) => {
			let moves = this.getMovesPiece(piece);
			this.view.showMoves(moves);
		});

		//	Если был шах и после хода он не пропал, отменяем ход
		if (
			this.isChecked &&
			(this.whiteKing.div.classList.contains('figureKill') || this.blackKing.div.classList.contains('figureKill'))
		) {
			this.loadGame();
			saveMove = false;
			//	Если не было шаха, но после хода он появился
		} else if (
			!this.isChecked &&
			(this.whiteKing.div.classList.contains('figureKill') || this.blackKing.div.classList.contains('figureKill'))
		) {
			this.isChecked = true;

			// Если был шах и после хода он пропал
		} else if (this.isChecked) {
			this.isChecked = false;
		}
		this.view.clearChessBoard();
		return saveMove;
	}

	getMovesPiece({ pieceName, pos, color }) {
		switch (pieceName) {
			case 'king': // -------------------------------- King ----------------------------------
				let arrMovesKing = [];

				if (pos.y > 1 && pos.y < 8 && pos.x > 1 && pos.x < 8) {
					for (let i = pos.y - 1; i < pos.y + 2; i++) {
						for (let j = pos.x - 1; j < pos.x + 2; j++) {
							arrMovesKing.push({ y: i, x: j });
						}
					}
				} else if (pos.y == 8 && pos.x > 1 && pos.x < 8) {
					for (let i = pos.y - 1; i < pos.y + 1; i++) {
						for (let j = pos.x - 1; j < pos.x + 2; j++) {
							arrMovesKing.push({ y: i, x: j });
						}
					}
				} else if (pos.y == 1 && pos.x > 1 && pos.x < 8) {
					for (let i = pos.y; i < pos.y + 2; i++) {
						for (let j = pos.x - 1; j < pos.x + 2; j++) {
							arrMovesKing.push({ y: i, x: j });
						}
					}
				} else if (pos.y > 1 && pos.y < 8 && pos.x == 8) {
					for (let i = pos.y - 1; i < pos.y + 2; i++) {
						for (let j = pos.x - 1; j < pos.x + 1; j++) {
							arrMovesKing.push({ y: i, x: j });
						}
					}
				} else if (pos.y > 1 && pos.y < 8 && pos.x == 1) {
					for (let i = pos.y - 1; i < pos.y + 2; i++) {
						for (let j = pos.x; j < pos.x + 2; j++) {
							arrMovesKing.push({ y: i, x: j });
						}
					}
				} else if (pos.y == 1 && pos.x == 1) {
					arrMovesKing.push({ y: 1, x: 2 }, { y: 2, x: 2 }, { y: 2, x: 1 });
				} else if (pos.y == 1 && pos.x == 8) {
					arrMovesKing.push({ y: 1, x: 7 }, { y: 2, x: 7 }, { y: 2, x: 8 });
				} else if (pos.y == 8 && pos.x == 8) {
					arrMovesKing.push({ y: 8, x: 7 }, { y: 7, x: 7 }, { y: 7, x: 8 });
				} else if (pos.y == 8 && pos.x == 1) {
					arrMovesKing.push({ y: 7, x: 1 }, { y: 7, x: 2 }, { y: 8, x: 2 });
				}
				return { color, arrMoveCells: arrMovesKing };

			case 'queen': // -------------------------------- Queen ----------------------------------
				let arrMovesQueen = [],
					diffNum = null;

				// up-left move
				diffNum = pos.x - pos.y;
				end1: for (let i = pos.y - 1; i > 0; i--) {
					for (let j = pos.x - 1; j > 0; j--) {
						if (j - i == diffNum) {
							if (this.view.checkPieceInCell(i, j)) arrMovesQueen.push({ y: i, x: j });
							else {
								arrMovesQueen.push({ y: i, x: j });
								break end1;
							}
						}
					}
				}

				// down-left move
				diffNum = pos.x + pos.y;
				end2: for (let i = pos.y + 1; i < 9; i++) {
					for (let j = pos.x - 1; j > 0; j--) {
						if (j + i == diffNum) {
							if (this.view.checkPieceInCell(i, j)) arrMovesQueen.push({ y: i, x: j });
							else {
								arrMovesQueen.push({ y: i, x: j });
								break end2;
							}
						}
					}
				}

				// up-right move
				diffNum = pos.x + pos.y;
				end3: for (let i = pos.y - 1; i > 0; i--) {
					for (let j = pos.x + 1; j < 9; j++) {
						if (j + i == diffNum) {
							if (this.view.checkPieceInCell(i, j)) arrMovesQueen.push({ y: i, x: j });
							else {
								arrMovesQueen.push({ y: i, x: j });
								break end3;
							}
						}
					}
				}

				// down-right move
				diffNum = pos.x - pos.y;
				end4: for (let i = pos.y + 1; i < 9; i++) {
					for (let j = pos.x + 1; j < 9; j++) {
						if (j - i == diffNum) {
							if (this.view.checkPieceInCell(i, j)) arrMovesQueen.push({ y: i, x: j });
							else {
								arrMovesQueen.push({ y: i, x: j });
								break end4;
							}
						}
					}
				}

				// up move
				for (let i = pos.y - 1; i > 0; i--) {
					if (this.view.checkPieceInCell(i, pos.x)) arrMovesQueen.push({ y: i, x: pos.x });
					else {
						arrMovesQueen.push({ y: i, x: pos.x });
						break;
					}
				}

				// down move
				for (let i = pos.y + 1; i < 9; i++) {
					if (this.view.checkPieceInCell(i, pos.x)) arrMovesQueen.push({ y: i, x: pos.x });
					else {
						arrMovesQueen.push({ y: i, x: pos.x });
						break;
					}
				}

				// right move
				for (let i = pos.x + 1; i < 9; i++) {
					if (this.view.checkPieceInCell(pos.y, i)) arrMovesQueen.push({ y: pos.y, x: i });
					else {
						arrMovesQueen.push({ y: pos.y, x: i });
						break;
					}
				}

				// left move
				for (let i = pos.x - 1; i > 0; i--) {
					if (this.view.checkPieceInCell(pos.y, i)) arrMovesQueen.push({ y: pos.y, x: i });
					else {
						arrMovesQueen.push({ y: pos.y, x: i });
						break;
					}
				}
				return { color, arrMoveCells: arrMovesQueen };

			case 'rook': // -------------------------------- Rook ----------------------------------
				let arrMovesRook = [];

				// up move
				for (let i = pos.y - 1; i > 0; i--) {
					if (this.view.checkPieceInCell(i, pos.x)) arrMovesRook.push({ y: i, x: pos.x });
					else {
						arrMovesRook.push({ y: i, x: pos.x });
						break;
					}
				}

				// down move
				for (let i = pos.y + 1; i < 9; i++) {
					if (this.view.checkPieceInCell(i, pos.x)) arrMovesRook.push({ y: i, x: pos.x });
					else {
						arrMovesRook.push({ y: i, x: pos.x });
						break;
					}
				}

				// right move
				for (let i = pos.x + 1; i < 9; i++) {
					if (this.view.checkPieceInCell(pos.y, i)) arrMovesRook.push({ y: pos.y, x: i });
					else {
						arrMovesRook.push({ y: pos.y, x: i });
						break;
					}
				}

				// left move
				for (let i = pos.x - 1; i > 0; i--) {
					if (this.view.checkPieceInCell(pos.y, i)) arrMovesRook.push({ y: pos.y, x: i });
					else {
						arrMovesRook.push({ y: pos.y, x: i });
						break;
					}
				}

				return { color, arrMoveCells: arrMovesRook };

			case 'bishop': // -------------------------------- Bishop ----------------------------------
				let arrMovesBishop = [],
					diffNum1 = null;
				// up-left move
				diffNum1 = pos.x - pos.y;
				end1: for (let i = pos.y - 1; i > 0; i--) {
					for (let j = pos.x - 1; j > 0; j--) {
						if (j - i == diffNum1) {
							if (this.view.checkPieceInCell(i, j)) arrMovesBishop.push({ y: i, x: j });
							else {
								arrMovesBishop.push({ y: i, x: j });
								break end1;
							}
						}
					}
				}

				// down-left move
				diffNum1 = pos.x + pos.y;
				end2: for (let i = pos.y + 1; i < 9; i++) {
					for (let j = pos.x - 1; j > 0; j--) {
						if (j + i == diffNum1) {
							if (this.view.checkPieceInCell(i, j)) arrMovesBishop.push({ y: i, x: j });
							else {
								arrMovesBishop.push({ y: i, x: j });
								break end2;
							}
						}
					}
				}

				// up-right move
				diffNum1 = pos.x + pos.y;
				end3: for (let i = pos.y - 1; i > 0; i--) {
					for (let j = pos.x + 1; j < 9; j++) {
						if (j + i == diffNum1) {
							if (this.view.checkPieceInCell(i, j)) arrMovesBishop.push({ y: i, x: j });
							else {
								arrMovesBishop.push({ y: i, x: j });
								break end3;
							}
						}
					}
				}

				// down-right move
				diffNum1 = pos.x - pos.y;
				end4: for (let i = pos.y + 1; i < 9; i++) {
					for (let j = pos.x + 1; j < 9; j++) {
						if (j - i == diffNum1) {
							if (this.view.checkPieceInCell(i, j)) arrMovesBishop.push({ y: i, x: j });
							else {
								arrMovesBishop.push({ y: i, x: j });
								break end4;
							}
						}
					}
				}

				return { color, arrMoveCells: arrMovesBishop };

			case 'knight': // -------------------------------- Knight ----------------------------------
				let arrMovesKnight = [];

				// up move
				if (pos.y > 2 && pos.x != 8 && pos.x != 1)
					arrMovesKnight.push({ y: pos.y - 2, x: pos.x - 1 }, { y: pos.y - 2, x: pos.x + 1 });
				else if (pos.y > 2 && pos.x == 8) arrMovesKnight.push({ y: pos.y - 2, x: pos.x - 1 });
				else if (pos.y > 2 && pos.x == 1) arrMovesKnight.push({ y: pos.y - 2, x: pos.x + 1 });

				// down move
				if (pos.y < 7 && pos.x != 8 && pos.x != 1)
					arrMovesKnight.push({ y: pos.y + 2, x: pos.x - 1 }, { y: pos.y + 2, x: pos.x + 1 });
				else if (pos.y < 7 && pos.x == 8) arrMovesKnight.push({ y: pos.y + 2, x: pos.x - 1 });
				else if (pos.y < 7 && pos.x == 1) arrMovesKnight.push({ y: pos.y + 2, x: pos.x + 1 });

				// left move
				if (pos.x > 2 && pos.y != 8 && pos.y != 1)
					arrMovesKnight.push({ y: pos.y - 1, x: pos.x - 2 }, { y: pos.y + 1, x: pos.x - 2 });
				else if (pos.x > 2 && pos.y == 8) arrMovesKnight.push({ y: pos.y - 1, x: pos.x - 2 });
				else if (pos.x > 2 && pos.y == 1) arrMovesKnight.push({ y: pos.y + 1, x: pos.x - 2 });

				// right move
				if (pos.x < 7 && pos.y != 8 && pos.y != 1)
					arrMovesKnight.push({ y: pos.y - 1, x: pos.x + 2 }, { y: pos.y + 1, x: pos.x + 2 });
				else if (pos.x < 7 && pos.y == 8) arrMovesKnight.push({ y: pos.y - 1, x: pos.x + 2 });
				else if (pos.x < 7 && pos.y == 1) arrMovesKnight.push({ y: pos.y + 1, x: pos.x + 2 });
				return { color, arrMoveCells: arrMovesKnight };

			case 'pawn': // -------------------------------- Pawn ----------------------------------
				let arrMovesPawn = [],
					arrKillCells = [];
				//
				if (color == 'white') {
					//
					if (pos.y == 7 && this.view.checkPieceInCell(6, pos.x))
						arrMovesPawn.push({ y: pos.y - 1, x: pos.x }, { y: pos.y - 2, x: pos.x });
					else if (pos.y > 1) arrMovesPawn.push({ y: pos.y - 1, x: pos.x });
					//
					if (pos.x == 1) arrKillCells.push({ y: pos.y - 1, x: pos.x + 1 });
					else if (pos.x == 8) arrKillCells.push({ y: pos.y - 1, x: pos.x - 1 });
					else arrKillCells.push({ y: pos.y - 1, x: pos.x - 1 }, { y: pos.y - 1, x: pos.x + 1 });
					//
				} else if (color == 'black') {
					//
					if (pos.y == 2 && this.view.checkPieceInCell(3, pos.x))
						arrMovesPawn.push({ y: pos.y + 1, x: pos.x }, { y: pos.y + 2, x: pos.x });
					else if (pos.y < 8) arrMovesPawn.push({ y: pos.y + 1, x: pos.x });
					//
					if (pos.x == 1) arrKillCells.push({ y: pos.y + 1, x: pos.x + 1 });
					else if (pos.x == 8) arrKillCells.push({ y: pos.y + 1, x: pos.x - 1 });
					else arrKillCells.push({ y: pos.y + 1, x: pos.x - 1 }, { y: pos.y + 1, x: pos.x + 1 });
				}
				// arrMovesPawn.length
				// 	? this.showMoves(arrMovesPawn, arrKillCells)
				// 	: false;
				return { color, arrMoveCells: arrMovesPawn, arrKillCells };
		}
	}
}
