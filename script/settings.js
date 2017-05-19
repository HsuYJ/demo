(function() {

	var ColorLevel = 5;
	var MineLiveMultiplier = 3;
	var GhostNumber = 60;
	var GhostDrawNumber = 30;

	function Main() {

		ShareState
		.set('settings', {
			// brick
			colorLevel: ColorLevel,
			valuePerLevel: 255 / ColorLevel,
			mineLiveMultiplier: MineLiveMultiplier,
			// ballGhost
			ghostNumber: GhostNumber,
			ghostDrawNumber: GhostDrawNumber,
			ghostDrawRatio: Math.floor(GhostNumber / GhostDrawNumber),
			// snake body
			snakeBodyNumber: 18
		}, 'bnb')
		.get(null, null, 'bnb');
	}

	window.addEventListener('load', Main);

})();