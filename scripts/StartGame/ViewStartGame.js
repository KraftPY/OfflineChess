export class ViewStartGame {
	constructor() {
		this.dom = {
			board: document.querySelector('.board'),
			body: document.querySelector('body'),
			blackOut: document.querySelector('.black_out'),
			whiteOut: document.querySelector('.white_out')
		};
		this.arrTableCells = [...this.dom.board.rows].map((row) =>
			[...row.children].map((col) => col)
		);
	}

	creatModalWnd(newGame, loadGame) {
		this.ModalDOM = {
			mainModal: document.createElement('div'),
			modalForm: document.createElement('div'),
			question: document.createElement('p'),
			contBtn: document.createElement('div'),
			btnLoad: document.createElement('button'),
			btnNew: document.createElement('button')
		};

		// Add classList
		this.ModalDOM.mainModal.classList.add('modal_window');
		this.ModalDOM.modalForm.classList.add('q_form');
		this.ModalDOM.question.classList.add('question');
		this.ModalDOM.contBtn.classList.add('container_btn');
		this.ModalDOM.btnLoad.classList.add('btn_Load');
		this.ModalDOM.btnNew.classList.add('btn_New');

		// Add content
		this.ModalDOM.question.innerText = `Вы хотите начать новую игру или продолжить предыдущую?`;
		this.ModalDOM.btnLoad.innerText = `Продолжить`;
		this.ModalDOM.btnNew.innerText = `Начать новую`;

		this.ModalDOM.contBtn.append(this.ModalDOM.btnNew, this.ModalDOM.btnLoad);
		this.ModalDOM.modalForm.append(
			this.ModalDOM.question,
			this.ModalDOM.contBtn
		);
		this.ModalDOM.mainModal.append(this.ModalDOM.modalForm);
		this.dom.body.prepend(this.ModalDOM.mainModal);

		// Listeners
		this.ModalDOM.btnNew.addEventListener('click', newGame);
		this.ModalDOM.btnLoad.addEventListener('click', loadGame);
	}

	newGame(allClassesFigures) {
		const { King, Queen, Elephant, Horse, Tower, Pawn } = allClassesFigures;
		[...this.dom.board.rows].forEach((row, i) => {
			[...row.children].forEach((col, j) => {
				// Black figures
				if ((i == 1 && j == 1) || (i == 1 && j == 8)) {
					const tower = new Tower();
					tower.add(col, { x: j, y: i });
					tower.addClass = 'tower_black';
				} else if ((i == 1 && j == 2) || (i == 1 && j == 7)) {
					const horse = new Horse();
					horse.add(col, { x: j, y: i });
					horse.addClass = 'horse_black';
				} else if ((i == 1 && j == 3) || (i == 1 && j == 6)) {
					const elephant = new Elephant();
					elephant.add(col, { x: j, y: i });
					elephant.addClass = 'elephant_black';
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
					const tower = new Tower();
					tower.add(col, { x: j, y: i });
					tower.addClass = 'tower_white';
				} else if ((i == 8 && j == 2) || (i == 8 && j == 7)) {
					const horse = new Horse();
					horse.add(col, { x: j, y: i });
					horse.addClass = 'horse_white';
				} else if ((i == 8 && j == 3) || (i == 8 && j == 6)) {
					const elephant = new Elephant();
					elephant.add(col, { x: j, y: i });
					elephant.addClass = 'elephant_white';
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
		const { King, Queen, Elephant, Horse, Tower, Pawn } = allClassesFigures;
		if (saveGame) {
			saveGame.arrFigures.forEach((el) => {
				switch (el.figure) {
					case 'Tower':
						const tower = new Tower();
						this.placeFigure(tower, el);
						break;
					case 'Horse':
						const horse = new Horse();
						this.placeFigure(horse, el);
						break;
					case 'Elephant':
						const elephant = new Elephant();
						this.placeFigure(elephant, el);
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
		this.ModalDOM.btnNew.removeEventListener('click', () => this.newGame());
		this.ModalDOM.btnLoad.removeEventListener('click', () => this.loadGame());
		this.ModalDOM.mainModal.remove();
	}
}
