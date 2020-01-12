import { ControllerStartGame } from './StartGame/ControllerStartGame.js';

const dom = {
	board: document.querySelector('.board'), // chess board
	whiteOut: document.querySelector('.white_out'), // the place where the dead white figure are stored
	blackOut: document.querySelector('.black_out'), // the place where the dead black figure are stored
	mainModalSwap: null,
	listStory: document.querySelector('.list_moves'),
	scrollList: document.querySelector('.story_list')
};

let firstCheckKing = false;

export const tempFigure = {
	firstSelectedFigure: null, // временная переменная где хранится выбраная первая фигура
	secondSelectedFigure: null // временная переменная где хранится вторая фигура, если первая уже выбрана
};
export let arrFigures = [];
export let historyMove = [];

// очищаем все ячейки от классов 'figureMove' и 'figureKill' и обнуляем временные переменные tempFigure.firstSelectedFigure и tempFigure.secondSelectedFigure
export function clearBoard(onlyMoves = false) {
	if (onlyMoves) {
		[...dom.board.rows].forEach((row) =>
			[...row.children].forEach((col) =>
				col.classList.remove('figureMove', 'figureKill')
			)
		);
	} else {
		[...dom.board.rows].forEach((row) =>
			[...row.children].forEach((col) =>
				col.classList.remove('figureMove', 'figureKill')
			)
		);
		tempFigure.firstSelectedFigure
			? (tempFigure.firstSelectedFigure.removeClass = 'choosed')
			: false;
		dom.mainModalSwap ? true : (tempFigure.firstSelectedFigure = null);
		tempFigure.secondSelectedFigure = null;
	}
}

function pawnEndBoard() {
	if (
		tempFigure.firstSelectedFigure.color == 'black' &&
		dom.blackOut.children.length
	) {
		swapOutVsChoose('black');
	} else if (
		tempFigure.firstSelectedFigure.color == 'white' &&
		dom.whiteOut.children.length
	) {
		swapOutVsChoose('white');
	}
}

function swapOutVsChoose(color, outToChoose = true) {
	const parent = color == 'black' ? dom.blackOut : dom.whiteOut;
	if (outToChoose) {
		const divChooseFigure = createModalWndSwap();
		arrFigures.forEach((el) => {
			if (el.figure.classList.contains('figures_out') && el.color == color) {
				el.figure.classList.remove('figures_out');
				el.figure.classList.add('figures_choose');
				el.add(divChooseFigure);
			}
		});
	} else {
		arrFigures.forEach((el) => {
			if (el.figure.classList.contains('figures_choose') && el.color == color) {
				el.figure.classList.remove('figures_choose');
				el.figure.classList.add('figures_out');
				el.add(parent);
			}
		});
	}
}

function createModalWndSwap() {
	const divChooseFigure = document.createElement('div'),
		btnOK = document.createElement('button');
	dom.mainModalSwap = document.createElement('div');

	dom.mainModalSwap.classList.add('modal_window');
	divChooseFigure.classList.add('choose_out');
	btnOK.classList.add('ok');
	btnOK.innerText = 'Select figure';
	dom.mainModalSwap.append(divChooseFigure, btnOK);
	document.body.append(dom.mainModalSwap);
	btnOK.addEventListener('click', () => swapFigure());
	return divChooseFigure;
}

function swapFigure() {
	let parent = tempFigure.firstSelectedFigure.parent,
		previousPos = tempFigure.firstSelectedFigure.pos;

	tempFigure.firstSelectedFigure.add(tempFigure.secondSelectedFigure.parent);
	tempFigure.firstSelectedFigure.addClass = 'figures_choose';
	tempFigure.secondSelectedFigure.add(parent, previousPos);
	tempFigure.secondSelectedFigure.removeClass = 'figures_choose';
	tempFigure.secondSelectedFigure.removeClass = 'choosed';
	swapOutVsChoose(tempFigure.secondSelectedFigure.color, false);
	dom.mainModalSwap.remove();
	dom.mainModalSwap = null;
	firstCheckKing = checkToTheKing().status;
	keepMoveInStory(
		tempFigure.firstSelectedFigure,
		previousPos,
		tempFigure.secondSelectedFigure,
		true
	);
	clearBoard();
}

// document.addEventListener('DOMContentLoaded', startGame);
document.addEventListener('keydown', (ev) =>
	ev.code == 'Escape' ? clearBoard() : false
);
dom.board.addEventListener('click', (ev) => {
	// ход в пустую ячейку
	if (ev.target.tagName == 'TD' && tempFigure.firstSelectedFigure) {
		// если ячейка с классом figureMove (этим классом помечены ячейки куда фигура может ходить)
		if (ev.target.classList.contains('figureMove')) {
			let previousPos = tempFigure.firstSelectedFigure.pos,
				previousParent = tempFigure.firstSelectedFigure.parent;
			tempFigure.firstSelectedFigure.add(ev.target, {
				x: ev.target.cellIndex,
				y: ev.target.parentElement.rowIndex
			});

			// (если шах королю и после хода фигуры шах не пропал) или (после хода фигуры шах королю и фигура одного цвета с королем)
			let checkKing = checkToTheKing();
			if (
				(firstCheckKing && checkKing.status) ||
				(checkKing.status &&
					tempFigure.firstSelectedFigure.color == checkKing.king.color)
			) {
				tempFigure.firstSelectedFigure.add(previousParent, previousPos);
			} else {
				keepMoveInStory(tempFigure.firstSelectedFigure, previousPos);
			}

			// если пешка дошла до конца доски
			if (
				tempFigure.firstSelectedFigure.constructor.name == 'Pawn' &&
				(tempFigure.firstSelectedFigure.pos.y == 1 ||
					tempFigure.firstSelectedFigure.pos.y == 8)
			) {
				pawnEndBoard(tempFigure.firstSelectedFigure);
			}
		}
		firstCheckKing = checkToTheKing().status;
		clearBoard();

		// ход в ячейку где есть фигура
	} else if (
		tempFigure.firstSelectedFigure &&
		tempFigure.secondSelectedFigure &&
		!(tempFigure.secondSelectedFigure.constructor.name == 'King')
	) {
		// если ячейка с классом figureKill (этим классом помечены ячейки куда фигура может ходить и где находится другая фигура)
		if (
			tempFigure.secondSelectedFigure.parent.classList.contains('figureKill')
		) {
			let parent = tempFigure.secondSelectedFigure.parent,
				pos = tempFigure.secondSelectedFigure.pos,
				previousPos = tempFigure.firstSelectedFigure.pos,
				previousParent = tempFigure.firstSelectedFigure.parent;
			// если вторая(битая) фигура черного цвета, тогда она перемещается в блок убитых фигур "div.black_out"
			if (tempFigure.secondSelectedFigure.color == 'black') {
				tempFigure.secondSelectedFigure.add(dom.blackOut);
				tempFigure.secondSelectedFigure.addClass = 'figures_out';
				// если белая, то в блок "div.white_out"
			} else {
				tempFigure.secondSelectedFigure.add(dom.whiteOut);
				tempFigure.secondSelectedFigure.addClass = 'figures_out';
			}
			tempFigure.firstSelectedFigure.add(parent, {
				x: parent.cellIndex,
				y: parent.parentElement.rowIndex
			});

			// (если шах королю и после хода фигуры шах не пропал) или (после хода фигуры шах королю и фигура одного цвета с королем)
			let checkKing = checkToTheKing();
			if (
				(firstCheckKing && checkKing.status) ||
				(checkKing.status &&
					tempFigure.firstSelectedFigure.color == checkKing.king.color)
			) {
				tempFigure.firstSelectedFigure.add(previousParent, previousPos);
				tempFigure.secondSelectedFigure.add(parent, pos);
				tempFigure.secondSelectedFigure.removeClass = 'figures_out';
			} else {
				keepMoveInStory(
					tempFigure.firstSelectedFigure,
					previousPos,
					tempFigure.secondSelectedFigure
				);
			}

			// если пешка дошла до конца доски
			if (
				tempFigure.firstSelectedFigure.constructor.name == 'Pawn' &&
				(tempFigure.firstSelectedFigure.pos.y == 1 ||
					tempFigure.firstSelectedFigure.pos.y == 8)
			) {
				pawnEndBoard();
			}
		}
		firstCheckKing = checkToTheKing().status;
		clearBoard();
	}
});

function keepMoveInStory(
	firstFigure,
	previousPos,
	secondFigure = null,
	swap = false
) {
	const moveFigure = new MoveFigure(arrFigures, firstFigure.color);

	if (historyMove.length) {
		historyMove = historyMove.filter((el) => {
			if (!el.li.classList.contains('following_li')) return el;
			else el.li.remove();
		});
	}
	moveFigure.addToList(firstFigure, previousPos, secondFigure, swap);
}

function checkToTheKing() {
	const whiteKing = arrFigures.find(
			(el) => el.color != 'white' && el.constructor.name == 'King'
		),
		blackKing = arrFigures.find(
			(el) => el.color != 'black' && el.constructor.name == 'King'
		),
		checkKing = { status: false, king: null };

	clearBoard(true);
	arrFigures.forEach((el) => {
		el.moves();
		if (whiteKing.parent.classList.contains('figureKill')) {
			checkKing.status = true;
			checkKing.king = whiteKing;
			blinkingKing(whiteKing.parent);
		} else if (blackKing.parent.classList.contains('figureKill')) {
			checkKing.status = true;
			checkKing.king = blackKing;
			blinkingKing(blackKing.parent);
		}
	});
	clearBoard(true);
	return checkKing;
}

function blinkingKing(cell) {
	cell.classList.add('blinking');
	setTimeout(() => cell.classList.remove('blinking'), 2000);
}
// ---------------------------------- Classes---------------------------------

class MoveFigure {
	constructor(allFigures, color) {
		this.li = document.createElement('li');
		this.li.addEventListener('click', () => this.click());
		this.arrFiguresPosition = this.saveFigurePosition(allFigures);
		this.color = color;
		historyMove.push(this);
	}
	click() {
		this.arrFiguresPosition.forEach((el) => {
			if (el.objFigure.parent != el.parent) {
				el.objFigure.add(el.parent, el.pos);
				el.objFigure.figure.className = el.className;
				el.objFigure.removeClass = 'choosed';
			}
		});
		let findEl = false;
		historyMove.forEach((el, i) => {
			if (findEl) {
				el.li.classList.add('following_li');
			} else {
				el.li.classList.remove('following_li');
			}
			if (el == this) findEl = true;
		});
		firstCheckKing = checkToTheKing().status;
		clearBoard();
	}
	addToList(firstFigure, previousPos, secondFigure, swap) {
		const symbol = 'abcdefgh'.split(''),
			number = '87654321'.split(''),
			saveMove = {
				// объект для сохранения в LocalStorage последнего хода из list_moves
				firstFigure: {
					figureName: firstFigure.constructor.name,
					color: firstFigure.color,
					previousPos: previousPos,
					nextPos: firstFigure.pos
				},
				secondFigure: {
					figureName: secondFigure ? secondFigure.constructor.name : false,
					color: secondFigure ? secondFigure.color : false
				},
				swap: swap
			};

		if (swap) {
			this.li.innerHTML = `${firstFigure.constructor.name} (${
				firstFigure.color
			}) - ${symbol[previousPos.x - 1]}${
				number[previousPos.y - 1]
			} swap to <br>${secondFigure.constructor.name} (${secondFigure.color})`;
		} else {
			this.li.innerHTML = `${firstFigure.constructor.name} (${
				firstFigure.color
			}) - ${symbol[previousPos.x - 1]}${number[previousPos.y - 1]} move to ${
				symbol[firstFigure.pos.x - 1]
			}${number[firstFigure.pos.y - 1]}`;
			secondFigure
				? (this.li.innerHTML += `<br>(killed ${secondFigure.constructor.name} (${secondFigure.color}))`)
				: false;
		}
		dom.listStory.append(this.li);
		dom.scrollList.scrollTop = dom.scrollList.scrollHeight;
		this.saveHistoryToLocalStorage(this.arrFiguresPosition, saveMove);
	}
	saveFigurePosition(allFigures) {
		return allFigures.map((el) => {
			let figureData = {
				objFigure: el,
				parent: el.parent,
				pos: el.pos,
				className: el.figure.className
			};
			return figureData;
		});
	}

	// сохраняем в LocalStorage массив позиций всех фигур и последнюю запись(ход) из list_moves
	saveHistoryToLocalStorage(arrFiguresPosition, saveMove) {
		let arr = arrFiguresPosition.map((el) => {
			let figureData = {
				figure: el.objFigure.constructor.name,
				color: el.objFigure.color,
				pos: el.pos,
				out: el.objFigure.figure.classList.contains('figures_out')
					? true
					: false
			};
			return figureData;
		});

		localStorage.setItem(
			'history',
			JSON.stringify({ arrFigures: arr, lastMove: saveMove })
		);
	}
}

// ---------------------Start-------------------------------

function startGame() {
	const mainModal = document.createElement('div'),
		modalForm = document.createElement('div'),
		question = document.createElement('p'),
		contBtn = document.createElement('div'),
		btnLoad = document.createElement('button'),
		btnNew = document.createElement('button');

	// Add classList
	mainModal.classList.add('modal_window');
	modalForm.classList.add('q_form');
	question.classList.add('question');
	contBtn.classList.add('container_btn');
	btnLoad.classList.add('btn_Load');
	btnNew.classList.add('btn_New');

	// Add content
	question.innerText = `Вы хотите начать новую игру или продолжить предыдущую?`;
	btnLoad.innerText = `Продолжить`;
	btnNew.innerText = `Начать новую`;

	contBtn.append(btnNew, btnLoad);
	modalForm.append(question, contBtn);
	mainModal.append(modalForm);
	document.querySelector('body').prepend(mainModal);

	// Listeners
	btnNew.addEventListener('click', newGame);
	btnLoad.addEventListener('click', loadGame);

	function closeModalWnd() {
		btnNew.removeEventListener('click', newGame);
		btnLoad.removeEventListener('click', loadGame);
		mainModal.remove();
	}

	function newGame() {
		[...dom.board.rows].forEach((row, i) => {
			[...row.children].forEach((col, j) => {
				// Black figures
				if ((i == 1 && j == 1) || (i == 1 && j == 8)) {
					let figure = new Tower();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'tower_black';
				} else if ((i == 1 && j == 2) || (i == 1 && j == 7)) {
					let figure = new Horse();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'horse_black';
				} else if ((i == 1 && j == 3) || (i == 1 && j == 6)) {
					let figure = new Elephant();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'elephant_black';
				} else if (i == 1 && j == 4) {
					let figure = new Queen();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'queen_black';
				} else if (i == 1 && j == 5) {
					let figure = new King();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'king_black';
				} else if (i == 2 && j > 0 && j < 9) {
					let figure = new Pawn();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'pawn_black';
				}
				// White figures
				if ((i == 8 && j == 1) || (i == 8 && j == 8)) {
					let figure = new Tower();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'tower_white';
				} else if ((i == 8 && j == 2) || (i == 8 && j == 7)) {
					let figure = new Horse();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'horse_white';
				} else if ((i == 8 && j == 3) || (i == 8 && j == 6)) {
					let figure = new Elephant();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'elephant_white';
				} else if (i == 8 && j == 4) {
					let figure = new Queen();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'queen_white';
				} else if (i == 8 && j == 5) {
					let figure = new King();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'king_white';
				} else if (i == 7 && j > 0 && j < 9) {
					let figure = new Pawn();
					figure.add(col, { x: j, y: i });
					figure.addClass = 'pawn_white';
				}
			});
		});
		closeModalWnd();
	}

	function loadGame() {
		let historyFromLS = JSON.parse(localStorage.getItem('history'));
		if (historyFromLS) {
			historyFromLS.arrFigures.forEach((el) => {
				let figure;
				switch (el.figure) {
					case 'Tower':
						figure = new Tower();
						placeFigure(figure, el);
						break;
					case 'Horse':
						figure = new Horse();
						placeFigure(figure, el);
						break;
					case 'Elephant':
						figure = new Elephant();
						placeFigure(figure, el);
						break;
					case 'Queen':
						figure = new Queen();
						placeFigure(figure, el);
						break;
					case 'King':
						figure = new King();
						placeFigure(figure, el);
						break;
					case 'Pawn':
						figure = new Pawn();
						placeFigure(figure, el);
						break;

					default:
						break;
				}
			});
			closeModalWnd();
			addLastMove();
		} else {
			newGame();
			alert('Нет сохраненной партии!');
		}

		function placeFigure(figure, el) {
			figure.addClass =
				el.color == 'black'
					? el.figure.toLowerCase() + '_black'
					: el.figure.toLowerCase() + '_white';
			if (el.out) {
				el.color == 'black'
					? figure.add(dom.blackOut, el.pos)
					: figure.add(dom.whiteOut, el.pos);
				figure.addClass = 'figures_out';
			} else {
				figure.add(arrTableCells[el.pos.y][el.pos.x], el.pos);
			}
		}

		function addLastMove() {
			let firstFigure = null,
				secondFigure = null;
			const swap = historyFromLS.lastMove.swap;

			if (swap) {
				firstFigure = arrFigures.find(
					(el) =>
						el.color == historyFromLS.lastMove.firstFigure.color &&
						el.constructor.name ==
							historyFromLS.lastMove.firstFigure.figureName &&
						el.figure.classList.contains('figures_out')
				);
				secondFigure = arrFigures.find(
					(el) =>
						el.pos.x == historyFromLS.lastMove.firstFigure.previousPos.x &&
						el.pos.y == historyFromLS.lastMove.firstFigure.previousPos.y
				);
			} else {
				firstFigure = arrFigures.find(
					(el) =>
						el.pos.x == historyFromLS.lastMove.firstFigure.nextPos.x &&
						el.pos.y == historyFromLS.lastMove.firstFigure.nextPos.y
				);
				if (historyFromLS.lastMove.secondFigure.figureName) {
					secondFigure = arrFigures.find(
						(el) =>
							el.color == historyFromLS.lastMove.secondFigure.color &&
							el.constructor.name ==
								historyFromLS.lastMove.secondFigure.figureName &&
							el.figure.classList.contains('figures_out')
					);
				}
			}

			keepMoveInStory(
				firstFigure,
				historyFromLS.lastMove.firstFigure.previousPos,
				secondFigure,
				swap
			);
		}
	}
}

const newGame = new ControllerStartGame();
