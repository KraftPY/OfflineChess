import { ViewChessBoard } from './ViewChessBoard.js';
import { ModelChessBoard } from './ModelChessBoard.js';

export class ControllerChessBoard {
	constructor(publisher) {
		this.arrChessPieces = [];
		this.view = new ViewChessBoard(
			this.arrChessPieces,
			this.clickChessPiece.bind(this),
			this.clickEmptyCell.bind(this),
			this.pawnPromotion.bind(this)
		);
		this.model = new ModelChessBoard();
		this.publisher = publisher;
		this.tempPieces = { first: null, second: null };
		this.whoseMove = 'white'; // чей сейчас ход. При старте новой игры первыми всегда ходят белые фигуры
		this.isChecked = false;
	}

	newGame() {
		this.view.renderNewGame();
	}

	loadGame() {}

	clickEmptyCell(ev) {
		// ToDo: Можно ли проверять класс в Контролере???
		if (ev.target.tagName == 'TD' && this.tempPieces.first && ev.target.classList.contains('figureMove')) {
			let previousPos = this.tempPieces.first.pos;
			let chessPiece = this.tempPieces.first;
			this.view.moveToEmptyCell(chessPiece, ev.target);

			// если пешка дошла до конца, то запускаем "обмен пешки"
			if (chessPiece.pieceName == 'pawn' && (chessPiece.pos.y == 1 || chessPiece.pos.y == 8)) {
				this.view.renderPawnPromotion(chessPiece);
			}

			// проверка пешки на первый ход
			this.checkPawnFirstMove(chessPiece);

			// Проверка на чек королю
			this.kingIsCheck(previousPos);
		} else if (ev.target.tagName == 'TD' && this.tempPieces.first && ev.target.classList.contains('figureKill')) {
			let previousPos = { x: this.tempPieces.first.pos.x, y: this.tempPieces.first.pos.y };
			this.tempPieces.second = this.arrChessPieces.find((piece) => piece.isEnPassant);
			this.view.takingEnemyChessPiece(this.tempPieces, true);

			// Проверка на чек королю
			this.kingIsCheck(previousPos);
		}
	}

	clickChessPiece(ev) {
		let chessPiece = this.arrChessPieces.find((piece) => piece.id == ev.target.dataset.id);
		if (
			this.tempPieces.first &&
			this.whoseMove != chessPiece.color &&
			chessPiece.div.classList.contains('figureKill')
		) {
			let previousPos = { x: this.tempPieces.first.pos.x, y: this.tempPieces.first.pos.y };
			this.tempPieces.second = chessPiece;
			this.view.takingEnemyChessPiece(this.tempPieces);

			// Проверка на чек королю
			this.kingIsCheck(previousPos);
		} else if (this.whoseMove == chessPiece.color && this.tempPieces.first != chessPiece) {
			this.tempPieces.first = chessPiece;
			let moves = this.getMovesPiece(this.tempPieces.first);
			this.view.clearChessBoard();
			this.view.selectChessPiece(chessPiece);
			this.view.showMoves(moves);

			// проверка на "взятие на проходе"
			this.enPassant(chessPiece);
		}
	}

	// --------------------------------------------------- enPassant ------------------------------------------------

	checkPawnFirstMove(chessPiece) {
		const { pieceName, isEnPassant, pos } = chessPiece;
		this.arrChessPieces.forEach((piece) => {
			piece.pieceName == 'pawn' && piece.isEnPassant == true ? (piece.isEnPassant = false) : false;
		});
		// если пешка делает свой первый ход через одну клетку, то записываем ей в isEnPassant = true
		if (pieceName == 'pawn' && isEnPassant == null && (pos.y == 4 || pos.y == 5)) {
			chessPiece.isEnPassant = true;
			// если пешка делает свой первый ход на одну клетку или было isEnPassant = true, то записываем ее в isEnPassant = false
		} else if (pieceName == 'pawn' && (isEnPassant == null || isEnPassant == true)) {
			chessPiece.isEnPassant = false;
		}
	}

	enPassant(chessPiece) {
		const { pieceName, color, pos } = chessPiece;
		if (pieceName == 'pawn' && color == 'white' && pos.y == 4) {
			this.getEnPassantPawn(chessPiece);
		} else if (pieceName == 'pawn' && color == 'black' && pos.y == 5) {
			this.getEnPassantPawn(chessPiece);
		}
	}

	getEnPassantPawn(chessPiece) {
		const { pieceName, color, pos } = chessPiece;
		const leftPiece = this.arrChessPieces.find((piece) => piece.pos.x == pos.x - 1 && piece.pos.y == pos.y);
		const rightPiece = this.arrChessPieces.find((piece) => piece.pos.x == pos.x + 1 && piece.pos.y == pos.y);
		if (leftPiece && leftPiece.pieceName == pieceName && leftPiece.color != color && leftPiece.isEnPassant) {
			this.view.showEnPassantMove(leftPiece);
		} else if (rightPiece && rightPiece.pieceName == pieceName && rightPiece.color != color && rightPiece.isEnPassant) {
			this.view.showEnPassantMove(rightPiece);
		}
	}

	kingIsCheck(previousPos) {
		// фильтруем фигуры которые выбиты с доски
		const arrPieces = this.arrChessPieces.filter((piece) => !piece.div.classList.contains('figures_out'));

		// находим королей и делим их на король пользователя и король противника
		const { userKing, enemyKing } = this.getKingsNow();

		// смотрим все возможные ходы всех фигур на шахматной доске
		arrPieces.forEach((piece) => {
			let moves = this.getMovesPiece(piece);
			this.view.showMoves(moves);
		});

		switch (true) {
			//	Если до этого не было шаха и после хода король противника попал под шах
			case !this.isChecked && enemyKing.div.classList.contains('figureKill'):
				this.view.kingIsBlinking(enemyKing);
				this.isChecked = true;
				this.endMove(previousPos);
				break;
			//	Если до этого не было шаха и после хода король пользователя попал под шах, отменяем ход
			case !this.isChecked && userKing.div.classList.contains('figureKill'):
			//	Если был шах и после хода король пользователя остался под шахом, отменяем ход
			case this.isChecked && userKing.div.classList.contains('figureKill'):
				this.moveBack(userKing);
				break;
			//	Если был шах и после хода шах пропал
			case this.isChecked && !userKing.div.classList.contains('figureKill'):
				this.isChecked = false;
				this.endMove(previousPos);
				break;

			default:
				this.endMove(previousPos);
				break;
		}

		this.view.clearChessBoard();
	}

	// ToDO: можно внутрь другого метода запихнуть???
	moveBack(userKing) {
		this.view.kingIsBlinking(userKing);
		let saveGame = this.model.getSaveGame();
		this.view.cancelMove(saveGame.arrChessPieces);
		this.tempPieces = { first: null, second: null };
	}

	// ToDO: можно внутрь другого метода запихнуть???
	getKingsNow() {
		const kings = {
			userKing: this.arrChessPieces.find((piece) => piece.color == this.whoseMove && piece.pieceName == 'king'),
			enemyKing: this.arrChessPieces.find((piece) => piece.color != this.whoseMove && piece.pieceName == 'king')
		};
		return kings;
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

	pawnPromotion(pawn, pieceName) {
		pawn.pieceName = pieceName;
		pawn.div.className = `${pieceName}_${pawn.color}`;
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
				return { color, arrMoveCells: arrMovesPawn, arrKillCells };
		}
	}
}
