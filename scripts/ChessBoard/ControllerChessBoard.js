import { ViewChessBoard } from './ViewChessBoard.js';
import { ModelChessBoard } from './ModelChessBoard.js';

export class ControllerChessBoard {
	constructor(publisher) {
		this.arrChessPieces = [];
		this.view = new ViewChessBoard(this.clickChessPiece.bind(this), this.clickEmptyCell.bind(this));
		this.model = new ModelChessBoard();
		this.publisher = publisher;
		// ???????????????????????????????????????????
		this.tempPieces = { first: null, second: null };
	}

	newGame() {
		let arrNewPiece = this.view.renderNewGame();
		this.model.createNewChessPiece(arrNewPiece);
		this.arrChessPieces = arrNewPiece;
	}

	loadGame() {}

	clickEmptyCell(ev) {
		if (ev.target.tagName == 'TD' && this.tempPieces.first && this.view.checkCssClass(ev.target, 'figure_move')) {
			let previousPos = this.tempPieces.first.pos;
			let chessPiece = this.tempPieces.first;
			this.view.moveToEmptyCell(chessPiece, ev.target);

			// если пешка дошла до конца, то запускаем "обмен пешки"
			this.pawnPromotion(chessPiece);
			// проверка пешки на первый ход
			this.checkPawnFirstMove(chessPiece);

			// Проверка на чек королю
			this.kingIsCheck(previousPos);

			// взятие на проходе
		} else if (ev.target.tagName == 'TD' && this.tempPieces.first && this.view.checkCssClass(ev.target, 'figure_kill')) {
			let previousPos = { x: this.tempPieces.first.pos.x, y: this.tempPieces.first.pos.y };

			let arg1 = { name: 'pieceName', value: 'pawn' },
				arg2 = { name: 'isFirstMove', value: true };
			this.tempPieces.second = this.model.findChessPieces(arg1, arg2);
			this.view.takingEnemyChessPiece(this.tempPieces, true);

			// Проверка на чек королю
			this.kingIsCheck(previousPos);
		}
	}

	clickChessPiece(ev) {
		let chessPiece = this.model.findChessPieces({ name: 'id', value: ev.target.dataset.id });
		if (
			this.tempPieces.first &&
			this.model.whoseMoveNow != chessPiece.color &&
			this.view.checkCssClass(chessPiece.div, 'figure_kill')
		) {
			let previousPos = { x: this.tempPieces.first.pos.x, y: this.tempPieces.first.pos.y };
			this.tempPieces.second = chessPiece;
			this.view.takingEnemyChessPiece(this.tempPieces);

			// если пешка дошла до конца, то запускаем "обмен пешки"
			this.pawnPromotion(this.tempPieces.first);

			// проверка пешки на первый ход и короля с ладьёй
			this.checkPawnFirstMove(chessPiece);
			this.checkKingRookFirstMove(chessPiece);

			// проверка на "Рокировку"
			this.castling(chessPiece.color);

			// Проверка на чек королю
			this.kingIsCheck(previousPos);
		} else if (this.model.whoseMoveNow == chessPiece.color && this.tempPieces.first != chessPiece) {
			this.tempPieces.first = chessPiece;
			let moves = this.getMovesPiece(this.tempPieces.first);
			this.view.clearChessBoard(this.model.arrDomNodesChessPiece);
			this.view.selectChessPiece(chessPiece);
			this.view.showMoves(moves);

			// проверка на "взятие на проходе"
			this.enPassant(chessPiece);
		}
	}

	// --------------------------------------------------- Castling -------------------------------------------------
	castling(color) {}

	checkKingRookFirstMove(chessPiece) {
		if (chessPiece.pieceName == 'king' || chessPiece.pieceName == 'rook' || chessPiece.isFirstMove == null) {
			chessPiece.isFirstMove = true;
		}
	}
	// --------------------------------------------------- enPassant ------------------------------------------------

	checkPawnFirstMove(chessPiece) {
		if (!this.model.isCheckedNow) {
			const { pieceName, isFirstMove, pos } = chessPiece;

			// если у какой-то пешки прошлый ход был первым, то записываем в isFirstMove = false
			this.model.dropFirstMovePawn();

			// если пешка делает свой первый ход через одну клетку, то записываем ей в isFirstMove = true
			if (pieceName == 'pawn' && isFirstMove == null && (pos.y == 4 || pos.y == 5)) {
				chessPiece.isFirstMove = true;

				// если пешка делает свой первый ход на одну клетку или было isFirstMove = true, то записываем ее в isFirstMove = false
			} else if (pieceName == 'pawn' && (isFirstMove == null || isFirstMove == true)) {
				chessPiece.isFirstMove = false;
			}
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

		const leftPiece = this.model.findChessPiecesByPos(pos.x - 1, pos.y);
		const rightPiece = this.model.findChessPiecesByPos(pos.x + 1, pos.y);
		if (leftPiece && leftPiece.pieceName == pieceName && leftPiece.color != color && leftPiece.isFirstMove) {
			this.view.showEnPassantMove(leftPiece);
		} else if (rightPiece && rightPiece.pieceName == pieceName && rightPiece.color != color && rightPiece.isFirstMove) {
			this.view.showEnPassantMove(rightPiece);
		}
	}

	// -----------------------------------------------------------------------------------------------------------------

	kingIsCheck(previousPos) {
		// фильтруем фигуры которые выбиты с доски
		const arrPieces = this.model.arrChessPieces.filter((piece) => !this.view.checkCssClass(piece.div, 'figures_out'));

		// находим королей и делим их на король пользователя и король противника
		const { userKing, enemyKing } = this.getKingsNow();

		// смотрим все возможные ходы всех фигур на шахматной доске
		arrPieces.forEach((piece) => {
			let moves = this.getMovesPiece(piece);
			this.view.showMoves(moves);
		});

		switch (true) {
			//	Если до этого не было шаха и после хода король противника попал под шах
			case !this.model.isCheckedNow && this.view.checkCssClass(enemyKing.div, 'figure_kill'):
				this.view.kingIsBlinking(enemyKing);
				this.model.changeIsChecked = true;
				this.endMove(previousPos);
				break;
			//	Если до этого не было шаха и после хода король пользователя попал под шах, отменяем ход
			case !this.model.isCheckedNow && this.view.checkCssClass(userKing.div, 'figure_kill'):
			//	Если был шах и после хода король пользователя остался под шахом, отменяем ход
			case this.model.isCheckedNow && this.view.checkCssClass(userKing.div, 'figure_kill'):
				this.moveBack(userKing);
				break;
			//	Если был шах и после хода шах пропал
			case this.model.isCheckedNow && !this.view.checkCssClass(userKing.div, 'figure_kill'):
				this.model.changeIsChecked = false;
				this.endMove(previousPos);
				break;

			default:
				this.endMove(previousPos);
				break;
		}

		this.view.clearChessBoard(this.model.arrDomNodesChessPiece);
	}

	moveBack(userKing) {
		this.view.kingIsBlinking(userKing);
		let saveGame = this.model.getSaveGame();
		this.view.cancelMove(saveGame.arrChessPieces, this.model.arrChessPieces);
		this.tempPieces = { first: null, second: null };
	}

	getKingsNow() {
		let userColor = this.model.whoseMoveNow == 'white' ? 'white' : 'black',
			enemyColor = this.model.whoseMoveNow == 'white' ? 'black' : 'white';
		const kings = {
			userKing: this.model.findChessPieces({ name: 'color', value: userColor }, { name: 'pieceName', value: 'king' }),
			enemyKing: this.model.findChessPieces({ name: 'color', value: enemyColor }, { name: 'pieceName', value: 'king' })
		};
		return kings;
	}

	endMove(previousPos) {
		// сохраняем позиции всех фигур после хода и последний ход
		this.model.saveGameToLocalStorage(this.tempPieces, previousPos);

		// очищаем доску от возможных ходов, а так же обнуляем временные фигуры
		this.view.clearChessBoard(this.model.arrDomNodesChessPiece);
		this.tempPieces = { first: null, second: null };

		// передаем ход другому игроку
		this.model.changeWhoseMove();

		// Оповещаем что ход сделан
		this.publisher.publish('moveEnd');
	}

	pawnPromotion(chessPiece) {
		if (!this.model.isCheckedNow && chessPiece.pieceName == 'pawn' && (chessPiece.pos.y == 1 || chessPiece.pos.y == 8)) {
			this.view.renderPawnPromotion(chessPiece).then((pieceName) => {
				chessPiece.pieceName = pieceName;
				chessPiece.div.className = `${pieceName}_${chessPiece.color}`;
			});
		}
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
