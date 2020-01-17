export class TemplatePawnPromotion {
	static getModalWnd(color) {
		return `  <div class="choose_out">
      <div class="figures_choose queen_${color}"></div>
      <div class="figures_choose rook_${color}"></div>
      <div class="figures_choose bishop_${color}"></div>
      <div class="figures_choose knight_${color}"></div>
    </div>
    <button class="ok">Select figure</button>`;
	}
}
