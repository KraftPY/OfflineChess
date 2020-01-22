export class TemplateChessBoard {
	static getModalWnd(color) {
		return `  <div class="choose_out">
      <div class="figures_choose queen_${color}" data-name="queen"></div>
      <div class="figures_choose rook_${color}" data-name="rook"></div>
      <div class="figures_choose bishop_${color}" data-name="bishop"></div>
      <div class="figures_choose knight_${color}" data-name="knight"></div>
    </div>
    <button class="ok">Select figure</button>`;
	}
}
