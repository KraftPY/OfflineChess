import {
	arrFigures,
	historyMove,
	tempFigure,
	clearChessBoard
} from '../main.js';

class ChessPiece {
	constructor() {
		this.figure = document.createElement('div');
		this.figure.addEventListener('click', () => this.click());
		this.chessBoard = document.querySelector('.chessBoard');
		this.arrTableCells = [...this.chessBoard.rows].map((row) =>
			[...row.children].map((col) => col)
		);
		arrFigures.push(this);
	}

	add(parent, pos = { x: 0, y: 0 }) {
		this.parent = parent;
		this.pos = pos;
		parent.append(this.figure);
	}

	set addClass(nameClass) {
		this.figure.classList.add(nameClass);
		this.color = (() => {
			if (nameClass.includes('_black')) return 'black';
			else if (nameClass.includes('_white')) return 'white';
			else return this.color;
		})();
	}

	set removeClass(nameClass) {
		this.figure.classList.remove(nameClass);
	}

	click() {
		let tempHistory = historyMove.filter(
			(el) => !el.li.classList.contains('following_li')
		);
		const lastMoveColor = tempHistory.length
			? tempHistory[tempHistory.length - 1].color
			: '';
		if (
			!this.figure.classList.contains('figures_out') &&
			tempFigure.firstSelectedFigure != this &&
			!this.figure.classList.contains('figures_choose')
		) {
			if (tempFigure.firstSelectedFigure) {
				if (tempFigure.firstSelectedFigure.color == this.color) {
					clearChessBoard();
					tempFigure.firstSelectedFigure = this;
					this.addClass = 'choosed';
					this.moves();
				} else if (
					(this.parent.classList.contains('figureMove') ||
						this.parent.classList.contains('figureKill')) &&
					this.color == lastMoveColor
				) {
					tempFigure.secondSelectedFigure = this;
				}
			} else if (this.color != lastMoveColor) {
				tempFigure.firstSelectedFigure = this;
				this.addClass = 'choosed';
				tempFigure.firstSelectedFigure.moves();
			}
		} else if (tempFigure.firstSelectedFigure == this) {
			this.removeClass = 'choosed';
			clearChessBoard();
		} else if (this.figure.classList.contains('figures_choose')) {
			this.parent.childNodes.forEach((el) => el.classList.remove('choosed'));
			this.addClass = 'choosed';
			tempFigure.secondSelectedFigure = this;
		}
	}

	showMoves(arrMoveCells = [], arrKillCells = []) {
		this.arrTableCells.forEach((row, i) => {
			row.forEach((col, j) => {
				// проверяем текущую ячейку есть ли она в массиве доступных ходов
				if (arrMoveCells.find((el) => el.x == j && el.y == i)) {
					// если ячейка без фигуры, тогда ставим класс 'figureMove'
					if (!col.childElementCount) col.classList.add('figureMove');
					// если ячейка с фигурой, то проверяем какого цвета фигура и ходящая фигура не пешка, тогда ставим класс 'figureKill'
					else if (
						!col.children[0].className.includes(this.color) &&
						!arrKillCells.length
					)
						col.classList.add('figureKill');
					// проверяем текущую ячейку есть ли она в массиве ходов только для пешек и если фигура другого цвета, тогда ставим класс 'figureKill'
				} else if (
					arrKillCells.find((el) => el.x == j && el.y == i) &&
					col.childElementCount &&
					!col.children[0].className.includes(this.color)
				) {
					col.classList.add('figureKill');
				}
			});
		});
	}
}

// ToDo: Добавить в один класс или сделать наследование MVC и как сделать тогда наследование??
export class King extends ChessPiece {
	moves() {
		let arrMoveCells = [];

		if (this.pos.y > 1 && this.pos.y < 8 && this.pos.x > 1 && this.pos.x < 8) {
			for (let i = this.pos.y - 1; i < this.pos.y + 2; i++) {
				for (let j = this.pos.x - 1; j < this.pos.x + 2; j++) {
					arrMoveCells.push({ y: i, x: j });
				}
			}
		} else if (this.pos.y == 8 && this.pos.x > 1 && this.pos.x < 8) {
			for (let i = this.pos.y - 1; i < this.pos.y + 1; i++) {
				for (let j = this.pos.x - 1; j < this.pos.x + 2; j++) {
					arrMoveCells.push({ y: i, x: j });
				}
			}
		} else if (this.pos.y == 1 && this.pos.x > 1 && this.pos.x < 8) {
			for (let i = this.pos.y; i < this.pos.y + 2; i++) {
				for (let j = this.pos.x - 1; j < this.pos.x + 2; j++) {
					arrMoveCells.push({ y: i, x: j });
				}
			}
		} else if (this.pos.y > 1 && this.pos.y < 8 && this.pos.x == 8) {
			for (let i = this.pos.y - 1; i < this.pos.y + 2; i++) {
				for (let j = this.pos.x - 1; j < this.pos.x + 1; j++) {
					arrMoveCells.push({ y: i, x: j });
				}
			}
		} else if (this.pos.y > 1 && this.pos.y < 8 && this.pos.x == 1) {
			for (let i = this.pos.y - 1; i < this.pos.y + 2; i++) {
				for (let j = this.pos.x; j < this.pos.x + 2; j++) {
					arrMoveCells.push({ y: i, x: j });
				}
			}
		} else if (this.pos.y == 1 && this.pos.x == 1)
			arrMoveCells.push({ y: 1, x: 2 }, { y: 2, x: 2 }, { y: 2, x: 1 });
		else if (this.pos.y == 1 && this.pos.x == 8)
			arrMoveCells.push({ y: 1, x: 7 }, { y: 2, x: 7 }, { y: 2, x: 8 });
		else if (this.pos.y == 8 && this.pos.x == 8)
			arrMoveCells.push({ y: 8, x: 7 }, { y: 7, x: 7 }, { y: 7, x: 8 });
		else if (this.pos.y == 8 && this.pos.x == 1)
			arrMoveCells.push({ y: 7, x: 1 }, { y: 7, x: 2 }, { y: 8, x: 2 });

		this.showMoves(arrMoveCells);
	}
}

export class Queen extends ChessPiece {
	moves() {
		let arrMoveCells = [],
			diffNum = null;

		// up-left move
		diffNum = this.pos.x - this.pos.y;
		end1: for (let i = this.pos.y - 1; i > 0; i--) {
			for (let j = this.pos.x - 1; j > 0; j--) {
				if (j - i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end1;
					}
				}
			}
		}

		// down-left move
		diffNum = this.pos.x + this.pos.y;
		end2: for (let i = this.pos.y + 1; i < 9; i++) {
			for (let j = this.pos.x - 1; j > 0; j--) {
				if (j + i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end2;
					}
				}
			}
		}

		// up-right move
		diffNum = this.pos.x + this.pos.y;
		end3: for (let i = this.pos.y - 1; i > 0; i--) {
			for (let j = this.pos.x + 1; j < 9; j++) {
				if (j + i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end3;
					}
				}
			}
		}

		// down-right move
		diffNum = this.pos.x - this.pos.y;
		end4: for (let i = this.pos.y + 1; i < 9; i++) {
			for (let j = this.pos.x + 1; j < 9; j++) {
				if (j - i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end4;
					}
				}
			}
		}

		// up move
		for (let i = this.pos.y - 1; i > 0; i--) {
			if (!this.arrTableCells[i][this.pos.x].childElementCount)
				arrMoveCells.push({ y: i, x: this.pos.x });
			else {
				arrMoveCells.push({ y: i, x: this.pos.x });
				break;
			}
		}

		// down move
		for (let i = this.pos.y + 1; i < 9; i++) {
			if (!this.arrTableCells[i][this.pos.x].childElementCount)
				arrMoveCells.push({ y: i, x: this.pos.x });
			else {
				arrMoveCells.push({ y: i, x: this.pos.x });
				break;
			}
		}

		// right move
		for (let i = this.pos.x + 1; i < 9; i++) {
			if (!this.arrTableCells[this.pos.y][i].childElementCount)
				arrMoveCells.push({ y: this.pos.y, x: i });
			else {
				arrMoveCells.push({ y: this.pos.y, x: i });
				break;
			}
		}

		// left move
		for (let i = this.pos.x - 1; i > 0; i--) {
			if (!this.arrTableCells[this.pos.y][i].childElementCount)
				arrMoveCells.push({ y: this.pos.y, x: i });
			else {
				arrMoveCells.push({ y: this.pos.y, x: i });
				break;
			}
		}

		this.showMoves(arrMoveCells);
	}
}

export class Bishop extends ChessPiece {
	moves() {
		let arrMoveCells = [],
			diffNum = null;
		// up-left move
		diffNum = this.pos.x - this.pos.y;
		end1: for (let i = this.pos.y - 1; i > 0; i--) {
			for (let j = this.pos.x - 1; j > 0; j--) {
				if (j - i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end1;
					}
				}
			}
		}

		// down-left move
		diffNum = this.pos.x + this.pos.y;
		end2: for (let i = this.pos.y + 1; i < 9; i++) {
			for (let j = this.pos.x - 1; j > 0; j--) {
				if (j + i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end2;
					}
				}
			}
		}

		// up-right move
		diffNum = this.pos.x + this.pos.y;
		end3: for (let i = this.pos.y - 1; i > 0; i--) {
			for (let j = this.pos.x + 1; j < 9; j++) {
				if (j + i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end3;
					}
				}
			}
		}

		// down-right move
		diffNum = this.pos.x - this.pos.y;
		end4: for (let i = this.pos.y + 1; i < 9; i++) {
			for (let j = this.pos.x + 1; j < 9; j++) {
				if (j - i == diffNum) {
					if (!this.arrTableCells[i][j].childElementCount)
						arrMoveCells.push({ y: i, x: j });
					else {
						arrMoveCells.push({ y: i, x: j });
						break end4;
					}
				}
			}
		}

		this.showMoves(arrMoveCells);
	}
}

export class Knight extends ChessPiece {
	moves() {
		let arrMoveCells = [];

		// up move
		if (this.pos.y > 2 && this.pos.x != 8 && this.pos.x != 1)
			arrMoveCells.push(
				{ y: this.pos.y - 2, x: this.pos.x - 1 },
				{ y: this.pos.y - 2, x: this.pos.x + 1 }
			);
		else if (this.pos.y > 2 && this.pos.x == 8)
			arrMoveCells.push({ y: this.pos.y - 2, x: this.pos.x - 1 });
		else if (this.pos.y > 2 && this.pos.x == 1)
			arrMoveCells.push({ y: this.pos.y - 2, x: this.pos.x + 1 });

		// down move
		if (this.pos.y < 7 && this.pos.x != 8 && this.pos.x != 1)
			arrMoveCells.push(
				{ y: this.pos.y + 2, x: this.pos.x - 1 },
				{ y: this.pos.y + 2, x: this.pos.x + 1 }
			);
		else if (this.pos.y < 7 && this.pos.x == 8)
			arrMoveCells.push({ y: this.pos.y + 2, x: this.pos.x - 1 });
		else if (this.pos.y < 7 && this.pos.x == 1)
			arrMoveCells.push({ y: this.pos.y + 2, x: this.pos.x + 1 });

		// left move
		if (this.pos.x > 2 && this.pos.y != 8 && this.pos.y != 1)
			arrMoveCells.push(
				{ y: this.pos.y - 1, x: this.pos.x - 2 },
				{ y: this.pos.y + 1, x: this.pos.x - 2 }
			);
		else if (this.pos.x > 2 && this.pos.y == 8)
			arrMoveCells.push({ y: this.pos.y - 1, x: this.pos.x - 2 });
		else if (this.pos.x > 2 && this.pos.y == 1)
			arrMoveCells.push({ y: this.pos.y + 1, x: this.pos.x - 2 });

		// right move
		if (this.pos.x < 7 && this.pos.y != 8 && this.pos.y != 1)
			arrMoveCells.push(
				{ y: this.pos.y - 1, x: this.pos.x + 2 },
				{ y: this.pos.y + 1, x: this.pos.x + 2 }
			);
		else if (this.pos.x < 7 && this.pos.y == 8)
			arrMoveCells.push({ y: this.pos.y - 1, x: this.pos.x + 2 });
		else if (this.pos.x < 7 && this.pos.y == 1)
			arrMoveCells.push({ y: this.pos.y + 1, x: this.pos.x + 2 });

		this.showMoves(arrMoveCells);
	}
}

export class Rook extends ChessPiece {
	moves() {
		let arrMoveCells = [];

		// up move
		for (let i = this.pos.y - 1; i > 0; i--) {
			if (!this.arrTableCells[i][this.pos.x].childElementCount)
				arrMoveCells.push({ y: i, x: this.pos.x });
			else {
				arrMoveCells.push({ y: i, x: this.pos.x });
				break;
			}
		}

		// down move
		for (let i = this.pos.y + 1; i < 9; i++) {
			if (!this.arrTableCells[i][this.pos.x].childElementCount)
				arrMoveCells.push({ y: i, x: this.pos.x });
			else {
				arrMoveCells.push({ y: i, x: this.pos.x });
				break;
			}
		}

		// right move
		for (let i = this.pos.x + 1; i < 9; i++) {
			if (!this.arrTableCells[this.pos.y][i].childElementCount)
				arrMoveCells.push({ y: this.pos.y, x: i });
			else {
				arrMoveCells.push({ y: this.pos.y, x: i });
				break;
			}
		}

		// left move
		for (let i = this.pos.x - 1; i > 0; i--) {
			if (!this.arrTableCells[this.pos.y][i].childElementCount)
				arrMoveCells.push({ y: this.pos.y, x: i });
			else {
				arrMoveCells.push({ y: this.pos.y, x: i });
				break;
			}
		}

		this.showMoves(arrMoveCells);
	}
}

export class Pawn extends ChessPiece {
	moves() {
		let arrMoveCells = [],
			arrKillCells = []; // pos = {x: j, y: i});
		//
		if (this.color == 'white') {
			//
			if (
				this.pos.y == 7 &&
				!this.arrTableCells[6][this.pos.x].childElementCount
			)
				arrMoveCells.push(
					{ y: this.pos.y - 1, x: this.pos.x },
					{ y: this.pos.y - 2, x: this.pos.x }
				);
			else if (this.pos.y > 1)
				arrMoveCells.push({ y: this.pos.y - 1, x: this.pos.x });
			//
			if (this.pos.x == 1)
				arrKillCells.push({ y: this.pos.y - 1, x: this.pos.x + 1 });
			else if (this.pos.x == 8)
				arrKillCells.push({ y: this.pos.y - 1, x: this.pos.x - 1 });
			else
				arrKillCells.push(
					{ y: this.pos.y - 1, x: this.pos.x - 1 },
					{ y: this.pos.y - 1, x: this.pos.x + 1 }
				);
			//
		} else if (this.color == 'black') {
			//
			if (
				this.pos.y == 2 &&
				!this.arrTableCells[3][this.pos.x].childElementCount
			)
				arrMoveCells.push(
					{ y: this.pos.y + 1, x: this.pos.x },
					{ y: this.pos.y + 2, x: this.pos.x }
				);
			else if (this.pos.y < 8)
				arrMoveCells.push({ y: this.pos.y + 1, x: this.pos.x });
			//
			if (this.pos.x == 1)
				arrKillCells.push({ y: this.pos.y + 1, x: this.pos.x + 1 });
			else if (this.pos.x == 8)
				arrKillCells.push({ y: this.pos.y + 1, x: this.pos.x - 1 });
			else
				arrKillCells.push(
					{ y: this.pos.y + 1, x: this.pos.x - 1 },
					{ y: this.pos.y + 1, x: this.pos.x + 1 }
				);
		}
		arrMoveCells.length ? this.showMoves(arrMoveCells, arrKillCells) : false;
	}
}
