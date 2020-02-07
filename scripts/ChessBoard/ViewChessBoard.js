import { TemplateChessBoard } from './TemplateChessBoard.js';

export class ViewChessBoard {
	constructor(clickChessPiece, clickEmptyCell) {
		this.dom = {
			chessBoard: document.querySelector('.chessBoard'),
			blackOut: document.querySelector('.black_out'),
			whiteOut: document.querySelector('.white_out')
		};
		this.clickChessPiece = clickChessPiece;
		this.clickEmptyCell = clickEmptyCell;
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
				isFirstMove: null,
				isPromotion: false
			};
		piece.div.setAttribute('data-id', piece.id);
		piece.div.classList.add(`${pieceName}_${color}`);
		this.chessBoardCells[i][j].append(piece.div);
		return piece;
	}

	renderNewGame() {
		let arrNewPiece = [];
		this.chessBoardCells.forEach((row, i) => {
			row.forEach((col, j) => {
				if ((i == 1 && j == 1) || (i == 1 && j == 8)) {
					arrNewPiece.push(this.createChessPiece('rook', 'black', i, j));
				} else if ((i == 1 && j == 2) || (i == 1 && j == 7)) {
					arrNewPiece.push(this.createChessPiece('knight', 'black', i, j));
				} else if ((i == 1 && j == 3) || (i == 1 && j == 6)) {
					arrNewPiece.push(this.createChessPiece('bishop', 'black', i, j));
				} else if (i == 1 && j == 4) {
					arrNewPiece.push(this.createChessPiece('queen', 'black', i, j));
				} else if (i == 1 && j == 5) {
					arrNewPiece.push(this.createChessPiece('king', 'black', i, j));
				} else if (i == 2 && j > 0 && j < 9) {
					arrNewPiece.push(this.createChessPiece('pawn', 'black', i, j));
				}
				// White figures
				if ((i == 8 && j == 1) || (i == 8 && j == 8)) {
					arrNewPiece.push(this.createChessPiece('rook', 'white', i, j));
				} else if ((i == 8 && j == 2) || (i == 8 && j == 7)) {
					arrNewPiece.push(this.createChessPiece('knight', 'white', i, j));
				} else if ((i == 8 && j == 3) || (i == 8 && j == 6)) {
					arrNewPiece.push(this.createChessPiece('bishop', 'white', i, j));
				} else if (i == 8 && j == 4) {
					arrNewPiece.push(this.createChessPiece('queen', 'white', i, j));
				} else if (i == 8 && j == 5) {
					arrNewPiece.push(this.createChessPiece('king', 'white', i, j));
				} else if (i == 7 && j > 0 && j < 9) {
					arrNewPiece.push(this.createChessPiece('pawn', 'white', i, j));
				}
			});
		});

		// Listener на шахматные фигуры
		arrNewPiece.forEach((chessPiece) => {
			chessPiece.div.addEventListener('click', this.clickChessPiece);
		});

		// Listener на пустые ячейки шахматной доски
		this.dom.chessBoard.addEventListener('click', this.clickEmptyCell);
		return arrNewPiece;
	}

	noLoadGame() {
		alert('Нет сохраненной игры!');
	}

	renderSaveGame(saveGame, arrChessPieces = null) {
		// удаляем все фигуры с доски и их слушатели
		if (arrChessPieces != null) {
			arrChessPieces.forEach((el) => {
				el.div.removeEventListener('click', this.clickChessPiece);
				el.div.remove();
			});
			// если загрузка сохраненой игры
		} else {
			// Listener на пустые ячейки шахматной доски
			this.dom.chessBoard.addEventListener('click', this.clickEmptyCell);
		}

		return saveGame.arrChessPieces.map((el) => {
			el.div = document.createElement('div');
			el.div.classList.add(`${el.pieceName}_${el.color}`);
			el.div.setAttribute('data-id', el.id);
			if (el.pos.x == null) {
				el.color == 'white' ? this.dom.whiteOut.append(el.div) : this.dom.blackOut.append(el.div);
				el.div.classList.add('figures_out');
			} else {
				el.div.addEventListener('click', this.clickChessPiece);
				this.chessBoardCells[el.pos.y][el.pos.x].append(el.div);
			}
			return el;
		});
	}

	showEnPassantMove(pawn) {
		const { color, pos } = pawn;
		if (color == 'white') {
			this.chessBoardCells[pos.y + 1][pos.x].classList.add('figure_kill');
		} else {
			this.chessBoardCells[pos.y - 1][pos.x].classList.add('figure_kill');
		}
	}

	cancelMove(saveGame, arrChessPieces) {
		arrChessPieces.forEach((piece) => {
			const savePiece = saveGame.find((el) => el.id == piece.id);
			let { x, y } = savePiece.pos;
			if (piece.pos.x != x || piece.pos.y != y) {
				if (!piece.pos.x && !piece.pos.y) {
					piece.div.classList.remove('figures_out');
					piece.div.addEventListener('click', this.clickChessPiece);
				}
				this.chessBoardCells[y][x].append(piece.div);
				piece.pos = savePiece.pos;
				piece.isFirstMove = savePiece.isFirstMove;
			}
		});
	}

	showMoves({ color, arrMoveCells = [], arrKillCells = [] }) {
		this.chessBoardCells.forEach((row, i) => {
			row.forEach((col, j) => {
				// проверяем текущую ячейку есть ли она в массиве доступных ходов
				if (arrMoveCells.find((el) => el.x == j && el.y == i)) {
					// если ячейка без фигуры, тогда ставим класс 'figure_move'
					if (!col.childElementCount) col.classList.add('figure_move');
					// если ячейка с фигурой, то проверяем какого цвета фигура и ходящая фигура не пешка, тогда ставим класс 'figure_kill'
					else if (!col.children[0].className.includes(color) && !arrKillCells.length)
						col.children[0].classList.add('figure_kill');
					// проверяем текущую ячейку есть ли она в массиве ходов только для пешек и если фигура другого цвета, тогда ставим класс 'figure_kill'
				} else if (
					arrKillCells.find((el) => el.x == j && el.y == i) &&
					col.childElementCount &&
					!col.children[0].className.includes(color)
				) {
					col.children[0].classList.add('figure_kill');
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
		return new Promise((resolve) => {
			btnSelect.addEventListener('click', () => {
				if (pieceName) {
					mainModal.remove();
					resolve(pieceName);
				} else {
					alert('Выберите фигуру!');
				}
			});
		});
	}

	renderCastling(king, rook) {
		if (rook.id == 'a1' || rook.id == 'a8') {
			this.chessBoardCells[rook.pos.y][rook.pos.x + 3].append(rook.div);
			rook.pos.x = rook.pos.x + 3;
			this.chessBoardCells[king.pos.y][king.pos.x - 2].append(king.div);
			king.pos.x = king.pos.x - 2;
		} else if (rook.id == 'h1' || rook.id == 'h8') {
			this.chessBoardCells[rook.pos.y][rook.pos.x - 2].append(rook.div);
			rook.pos.x = rook.pos.x - 2;
			this.chessBoardCells[king.pos.y][king.pos.x + 2].append(king.div);
			king.pos.x = king.pos.x + 2;
		}
	}

	checkCellUnderAttack(i, j) {
		return this.chessBoardCells[i][j].classList.contains('figure_move');
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

	clearChessBoard(arrDomNodesChessPiece, notChoosed = false) {
		this.chessBoardCells.forEach((row) => {
			row.forEach((cell) => {
				cell.classList.remove('figure_move');
				cell.classList.remove('figure_kill');
			});
		});
		notChoosed
			? arrDomNodesChessPiece.forEach((piece) => piece.classList.remove('figure_kill'))
			: arrDomNodesChessPiece.forEach((piece) => piece.classList.remove('choosed', 'figure_kill'));
	}

	selectChessPiece(piece) {
		piece.div.classList.add('choosed');
	}

	kingIsBlinking(whiteKing, blackKing) {
		let king = whiteKing.div.classList.contains('figure_kill') ? whiteKing : blackKing;
		king.div.classList.add('blinking');
		setTimeout(() => king.div.classList.remove('blinking'), 3000);
	}

	checkCssClass(element, className) {
		return element.classList.contains(className);
	}

	addCssClass(element, className) {
		element.classList.add(className);
	}
}
