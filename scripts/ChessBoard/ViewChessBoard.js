import { TemplateChessBoard } from './TemplateChessBoard.js';

export class ViewChessBoard {
	constructor(arrChessPieces, clickChessPiece, clickEmptyCell, pawnPromotion) {
		this.dom = {
			chessBoard: document.querySelector('.chessBoard'),
			blackOut: document.querySelector('.black_out'),
			whiteOut: document.querySelector('.white_out')
		};
		this.arrChessPieces = arrChessPieces;
		this.clickChessPiece = clickChessPiece;
		this.clickEmptyCell = clickEmptyCell;
		this.pawnPromotion = pawnPromotion;
		this.chessBoardCells = [...this.dom.chessBoard.rows].map((row) => [...row.children].map((col) => col));
	}

	createChessPiece(pieceName, color, i, j) {
		const symbol = '*abcdefgh'.split(''),
			number = '*87654321'.split(''),
			piece = {
				id: '' + symbol[j] + number[i],
				div: document.createElement('div'),
				pos: { x: j, y: i },
				pieceName: pieceName,
				color: color,
				isEnPassant: null
			};
		piece.div.setAttribute('data-id', piece.id);
		piece.div.classList.add(`${pieceName}_${color}`);
		this.arrChessPieces.push(piece);
		this.chessBoardCells[i][j].append(piece.div);
	}

	renderNewGame() {
		this.chessBoardCells.forEach((row, i) => {
			row.forEach((col, j) => {
				if ((i == 1 && j == 1) || (i == 1 && j == 8)) {
					this.createChessPiece('rook', 'black', i, j);
				} else if ((i == 1 && j == 2) || (i == 1 && j == 7)) {
					this.createChessPiece('knight', 'black', i, j);
				} else if ((i == 1 && j == 3) || (i == 1 && j == 6)) {
					this.createChessPiece('bishop', 'black', i, j);
				} else if (i == 1 && j == 4) {
					this.createChessPiece('queen', 'black', i, j);
				} else if (i == 1 && j == 5) {
					this.createChessPiece('king', 'black', i, j);
				} else if (i == 2 && j > 0 && j < 9) {
					this.createChessPiece('pawn', 'black', i, j);
				}
				// White figures
				if ((i == 8 && j == 1) || (i == 8 && j == 8)) {
					this.createChessPiece('rook', 'white', i, j);
				} else if ((i == 8 && j == 2) || (i == 8 && j == 7)) {
					this.createChessPiece('knight', 'white', i, j);
				} else if ((i == 8 && j == 3) || (i == 8 && j == 6)) {
					this.createChessPiece('bishop', 'white', i, j);
				} else if (i == 8 && j == 4) {
					this.createChessPiece('queen', 'white', i, j);
				} else if (i == 8 && j == 5) {
					this.createChessPiece('king', 'white', i, j);
				} else if (i == 7 && j > 0 && j < 9) {
					this.createChessPiece('pawn', 'white', i, j);
				}
			});
		});

		// Listener на шахматные фигуры
		this.arrChessPieces.forEach((chessPiece) => {
			chessPiece.div.addEventListener('click', this.clickChessPiece);
		});

		// Listener на пустые ячейки шахматной доски
		this.dom.chessBoard.addEventListener('click', this.clickEmptyCell);
	}

	renderSaveGame(saveGame) {}

	showEnPassantMove(pawn) {
		const { color, pos } = pawn;
		if (color == 'white') {
			this.chessBoardCells[pos.y + 1][pos.x].classList.add('figureKill');
		} else {
			this.chessBoardCells[pos.y - 1][pos.x].classList.add('figureKill');
		}
	}

	cancelMove(saveGame) {
		this.arrChessPieces.forEach((piece) => {
			const savePiece = saveGame.find((el) => el.id == piece.id);
			let { x, y } = savePiece.pos;
			if (piece.pos.x != x || piece.pos.y != y) {
				if (!piece.pos.x && !piece.pos.y) {
					piece.div.classList.remove('figures_out');
					piece.div.addEventListener('click', this.clickChessPiece);
				}
				this.chessBoardCells[y][x].append(piece.div);
				piece.pos = savePiece.pos;
			}
		});
	}

	showMoves({ color, arrMoveCells = [], arrKillCells = [] }) {
		this.chessBoardCells.forEach((row, i) => {
			row.forEach((col, j) => {
				// проверяем текущую ячейку есть ли она в массиве доступных ходов
				if (arrMoveCells.find((el) => el.x == j && el.y == i)) {
					// если ячейка без фигуры, тогда ставим класс 'figureMove'
					if (!col.childElementCount) col.classList.add('figureMove');
					// если ячейка с фигурой, то проверяем какого цвета фигура и ходящая фигура не пешка, тогда ставим класс 'figureKill'
					else if (!col.children[0].className.includes(color) && !arrKillCells.length)
						col.children[0].classList.add('figureKill');
					// проверяем текущую ячейку есть ли она в массиве ходов только для пешек и если фигура другого цвета, тогда ставим класс 'figureKill'
				} else if (
					arrKillCells.find((el) => el.x == j && el.y == i) &&
					col.childElementCount &&
					!col.children[0].className.includes(color)
				) {
					col.children[0].classList.add('figureKill');
				}
			});
		});
	}

	checkPieceInCell(i, j) {
		return this.chessBoardCells[i][j].childElementCount ? false : true;
	}

	renderPawnPromotion(pawn) {
		const mainModal = document.createElement('div');
		mainModal.classList.add('modal_window');
		mainModal.innerHTML = TemplateChessBoard.getModalWnd(pawn.color);
		document.body.prepend(mainModal);

		const arrPiece = document.querySelectorAll('.figures_choose');
		let pieceName = null;
		arrPiece.forEach((piece) => {
			piece.addEventListener('click', (ev) => {
				pieceName = ev.target.dataset.name;
				arrPiece.forEach((el) => el.classList.remove('choosed'));
				ev.target.classList.add('choosed');
			});
		});
		const btnSelect = document.querySelector('.ok');
		btnSelect.addEventListener('click', () => {
			if (pieceName) {
				this.pawnPromotion(pawn, pieceName);
				mainModal.remove();
			} else {
				alert('Выберите фигуру!');
			}
		});
	}

	moveToEmptyCell(chessPiece, emptyCell) {
		emptyCell.append(chessPiece.div);
		chessPiece.pos = { x: emptyCell.cellIndex, y: emptyCell.parentNode.rowIndex };
	}

	takingEnemyChessPiece({ first, second }, enPassant = false) {
		let { x, y } = second.pos;

		// убираем выбитую фигуру с доски, обнуляем ее координаты и удаляем слушатель с нее
		second.color == 'white' ? this.dom.whiteOut.append(second.div) : this.dom.blackOut.append(second.div);
		second.pos.x = null;
		second.pos.y = null;
		second.div.classList.add('figures_out');
		second.div.removeEventListener('click', this.clickChessPiece);

		// перемещаем первую фигуру на место выбитой
		if (!enPassant) {
			this.chessBoardCells[y][x].append(first.div);
			first.pos.x = x;
			first.pos.y = y;
		} else {
			if (second.color == 'white') {
				this.chessBoardCells[y + 1][x].append(first.div);
				first.pos.x = x;
				first.pos.y = y + 1;
			} else {
				this.chessBoardCells[y - 1][x].append(first.div);
				first.pos.x = x;
				first.pos.y = y - 1;
			}
		}
	}

	clearChessBoard() {
		this.chessBoardCells.forEach((row) => {
			row.forEach((cell) => {
				cell.classList.remove('figureMove');
				cell.classList.remove('figureKill');
			});
		});
		this.arrChessPieces.forEach((piece) => piece.div.classList.remove('choosed', 'figureKill'));
	}

	selectChessPiece(piece) {
		piece.div.classList.add('choosed');
	}

	kingIsBlinking(whiteKing, blackKing) {
		let king = whiteKing.div.classList.contains('figureKill') ? whiteKing : blackKing;
		king.div.classList.add('blinking');
		setTimeout(() => king.div.classList.remove('blinking'), 3000);
	}
}
