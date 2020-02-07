import { TemplateStartGame } from './TemplateStartGame.js';

export class ViewStartGame {
	constructor(newGame, loadGame) {
		this.template = TemplateStartGame;
		this.newGame = newGame;
		this.loadGame = loadGame;
		this.creatModalWnd();
	}

	creatModalWnd(newGame, loadGame) {
		this.mainModal = document.createElement('div');
		this.mainModal.classList.add('modal_window');
		this.mainModal.innerHTML = this.template.getModalWnd();
		document.body.prepend(this.mainModal);

		this.btnNew = document.querySelector('.btn_new');
		this.btnLoad = document.querySelector('.btn_load');

		// Listeners
		this.btnNew.addEventListener('click', this.newGame);
		this.btnLoad.addEventListener('click', this.loadGame);
	}

	closeModalWnd() {
		this.btnNew.removeEventListener('click', this.newGame);
		this.btnLoad.removeEventListener('click', this.loadGame);
		this.mainModal.remove();
	}
}
