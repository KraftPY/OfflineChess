import { TemplateStartGame } from './TemplateStartGame.js'; // ToDo: здесь или во Вьюхе????

export class ViewStartGame {
	constructor() {
		this.dom = {
			chessBoard: document.querySelector('.chessBoard'),
			body: document.querySelector('body'),
			blackOut: document.querySelector('.black_out'),
			whiteOut: document.querySelector('.white_out')
		};
		this.arrTableCells = [...this.dom.chessBoard.rows].map((row) =>
			[...row.children].map((col) => col)
		);
		this.modalWnd = TemplateStartGame.getModalWnd();
	}

	creatModalWnd(newGame, loadGame) {
		this.mainModal = document.createElement('div');
		this.mainModal.classList.add('modal_window');
		this.mainModal.innerHTML = this.modalWnd;
		this.dom.body.prepend(this.mainModal);

		this.btnNew = document.querySelector('.btn_new');
		this.btnLoad = document.querySelector('.btn_load');

		// Listeners
		this.btnNew.addEventListener('click', newGame);
		this.btnLoad.addEventListener('click', loadGame);
	}

	newGame(allClassesFigures) {
		const { King, Queen, Bishop, Knight, Rook, Pawn } = allClassesFigures;
		[...this.dom.chessBoard.rows].forEach((row, i) => {
			[...row.children].forEach((col, j) => {
				// Black figures
				if ((i == 1 && j == 1) || (i == 1 && j == 8)) {
					const rook = new Rook(); // ToDo: Создание объектов во вьюхе это нормально?
					rook.add(col, { x: j, y: i });
					rook.addClass = 'rook_black';
				} else if ((i == 1 && j == 2) || (i == 1 && j == 7)) {
					const knight = new Knight();
					knight.add(col, { x: j, y: i });
					knight.addClass = 'knight_black';
				} else if ((i == 1 && j == 3) || (i == 1 && j == 6)) {
					const bishop = new Bishop();
					bishop.add(col, { x: j, y: i });
					bishop.addClass = 'bishop_black';
				} else if (i == 1 && j == 4) {
					const queen = new Queen();
					queen.add(col, { x: j, y: i });
					queen.addClass = 'queen_black';
				} else if (i == 1 && j == 5) {
					const king = new King();
					king.add(col, { x: j, y: i });
					king.addClass = 'king_black';
				} else if (i == 2 && j > 0 && j < 9) {
					const pawn = new Pawn();
					pawn.add(col, { x: j, y: i });
					pawn.addClass = 'pawn_black';
				}
				// White figures
				if ((i == 8 && j == 1) || (i == 8 && j == 8)) {
					const rook = new Rook();
					rook.add(col, { x: j, y: i });
					rook.addClass = 'rook_white';
				} else if ((i == 8 && j == 2) || (i == 8 && j == 7)) {
					const knight = new Knight();
					knight.add(col, { x: j, y: i });
					knight.addClass = 'knight_white';
				} else if ((i == 8 && j == 3) || (i == 8 && j == 6)) {
					const bishop = new Bishop();
					bishop.add(col, { x: j, y: i });
					bishop.addClass = 'bishop_white';
				} else if (i == 8 && j == 4) {
					const queen = new Queen();
					queen.add(col, { x: j, y: i });
					queen.addClass = 'queen_white';
				} else if (i == 8 && j == 5) {
					const king = new King();
					king.add(col, { x: j, y: i });
					king.addClass = 'king_white';
				} else if (i == 7 && j > 0 && j < 9) {
					const pawn = new Pawn();
					pawn.add(col, { x: j, y: i });
					pawn.addClass = 'pawn_white';
				}
			});
		});
	}

	loadGame(allClassesFigures, saveGame) {
		const { King, Queen, Bishop, Knight, Rook, Pawn } = allClassesFigures;
		if (saveGame) {
			saveGame.arrFigures.forEach((el) => {
				switch (el.figure) {
					case 'Rook':
						const rook = new Rook();
						this.placeFigure(rook, el);
						break;
					case 'Knight':
						const knight = new Knight();
						this.placeFigure(knight, el);
						break;
					case 'Bishop':
						const bishop = new Bishop();
						this.placeFigure(bishop, el);
						break;
					case 'Queen':
						const queen = new Queen();
						this.placeFigure(queen, el);
						break;
					case 'King':
						const king = new King();
						this.placeFigure(king, el);
						break;
					case 'Pawn':
						const pawn = new Pawn();
						this.placeFigure(pawn, el);
						break;

					default:
						break;
				}
			});
			return true;
		} else {
			// ToDo: сделать что-то вменяемое!
			alert('Нет сохраненной партии!');
			return false;
		}
	}

	// ToDo: Вьюха вызывает свой же метод, норм?
	placeFigure(figure, el) {
		figure.addClass =
			el.color == 'black'
				? el.figure.toLowerCase() + '_black'
				: el.figure.toLowerCase() + '_white';
		if (el.out) {
			el.color == 'black'
				? figure.add(this.dom.blackOut, el.pos)
				: figure.add(this.dom.whiteOut, el.pos);
			figure.addClass = 'figures_out';
		} else {
			figure.add(this.arrTableCells[el.pos.y][el.pos.x], el.pos);
		}
	}

	closeModalWnd() {
		this.btnNew.removeEventListener('click', () => this.newGame());
		this.btnLoad.removeEventListener('click', () => this.loadGame());
		this.mainModal.remove();
	}
}
