(function() {

	var BaseRatio = 2.5; // 2.5
	var Size = {};
	var Ratio = (function() {

		var r = {};

		r.vh = 1;
		// main
		r.fieldWidth = 120;
		r.fieldHeight = 100;

		// main menu
		r.mainMenuWidth = 40;
		r.mainMenuButtonHeight = 6;

		// editor
		r.editorTopRegionHeight = 6;

		// playground
		r.moveRange = 1.5;
		r.power = 75;
		r.drag = 0.75;
		r.haloWidth = 2;
		r.haloWidth_x2 = r.haloWidth * 2;
		r.haloLineWidth = 0.1;
		r.shakeRange = 0.5;
		r.infoPanelHeight = 4;
		r.paddleRegionHeight = 10; // region under paddleY
		r.canvasHeight = r.fieldHeight - r.infoPanelHeight;
		// indicator
		r.indicatorY = 20;
		r.indicatorHeight = 10;
		r.breakpointIndicatorY = 20;
		r.indicatorY = 20;
		// paddle
		r.paddleY = r.fieldHeight - r.infoPanelHeight - r.paddleRegionHeight;
		// ball
		r.ballPower = 100;//r.power;
		r.ballDiameter = 2;
		r.ballRadius = r.ballDiameter / 2;
		r.ballFloor = r.paddleY - r.ballDiameter;
		// carp ball
		r.carpBallPower = 42;
		r.carpBallDiameter = 2.5;
		r.carpBallRadius = r.carpBallDiameter / 2;
		r.carpBallFloor = r.paddleY - r.carpBallDiameter;
		// paddle
		r.paddleWidth = r.ballDiameter * 6; // 6x ballDiameter
		r.paddleHeight = r.ballDiameter;
		r.paddleBottom = r.paddleY + r.paddleHeight;
		// magicMissile
		r.magicMissileDiameter = 2;
		r.magicMissileDx = 0.5;
		r.magicMissileSpeed = 0.75;
		r.magicMissilePositionRange = 0.5;
		r.magicMissileShadowMoveRange = 0.05;
		// bullet
		r.bulletSpeed = 1.5;
		r.bulletWidth = 1.5;
		r.bulletHeight = 1.5;
		// smoke
		r.smokeDiameter = BaseRatio * 10;
		r.smokeRadius = r.smokeDiameter / 2;
		// brick
		r.brickRegionWidth = 120;
		r.brickRegionHeight = 60;
		r.brickWidth = BaseRatio;
		r.brickHeight = BaseRatio;
		r.brickRadiusX = BaseRatio / 2;
		r.brickRadiusY = BaseRatio / 2;
		r.brickSizeGapHalf = (r.brickWidth - r.brickHeight) / 2;
		r.brickMargin = 0;
		// snake
		r.snakeDiameter = r.brickWidth * 1;
		r.snakeRadius = r.snakeDiameter / 2;
		// jelly
		//r.jellyFloor_paddle = r.paddleY - r.brickHeight;
		//r.jellyFloor_canvas = r.canvasHeight - r.brickHeight;
		// spring
		r.springDiameter = BaseRatio;
		r.springRadius = r.springDiameter / 2;
		r.springFloor_paddle = r.paddleY - r.brickHeight;
		r.springFloor_canvas = r.canvasHeight - r.brickHeight;
		// bomb
		r.explosionDiameter = BaseRatio * 8;
		r.explosionRadius = r.explosionDiameter / 2;
		// explosiveWave
		r.explosiveWaveDiameter = r.ballDiameter;
		r.explosiveWaveRadius = r.ballRadius;
		r.explosiveWaveSpeed = BaseRatio / 6;
		r.explosiveWavePower = 2; // hitPower
		// explosiveScrap
		r.explosiveScrapDiameter = 2;
		r.explosiveScrapMoveRange = 0.5;
		// wormhole
		r.wormholeDiameter = BaseRatio * 3;
		r.wormholeRadius = r.wormholeDiameter / 2;
		r.wormholeLightDiameter = 0.4;
		r.wormholeLightRadius = r.wormholeLightDiameter / 2;

		return r;
	})();
	var Parameter = {
		brickX: Math.round(Ratio.brickRegionWidth / Ratio.brickWidth),
		brickY: Math.round(Ratio.brickRegionHeight / Ratio.brickHeight)
	};

	function calculateSize() {

		var vh = innerHeight / 100;
		var r = Ratio;
		var s = Size;

		for (var i in Ratio) {
			s[i] = Ratio[i] * vh;
		}
		// unable to find fieldLeft
		/*s.fieldLeft = (innerWidth - s.fieldWidth) / 2; // useless

		s.ballPower = s.power;

		s.brickNumberX = Math.round(r.brickRegionWidth / r.brickWidth);
		s.brickNumberY = Math.round(r.brickRegionHeight / r.brickHeight);
		s.brickRadiusX = s.brickWidth / 2;
		s.brickRadiusY = s.brickHeight / 2;
		s.brickSizeGapHalf = (s.brickWidth - s.brickHeight) / 2;

		s.paddleBottom = s.paddleY + s.paddleHeight;

		s.smokeDiameter = s.smokeRadius * 2;

		s.explosionRadius = s.explosionRegionRadius * BaseRatio;
		s.explosionDiameter = s.explosionRadius * 2;

		s.jellyFloor_paddle = s.paddleY - s.brickHeight;
		s.jellyFloor_field = s.fieldHeight - s.brickHeight * 2;*/
	}

	function Main() {
		//alert(innerHeight);
		calculateSize();

		ShareState
		.set('ratio', Ratio, 'bnb')
		.set('size', Size, 'bnb')
		.set('parameter', Parameter, 'bnb')
		.get(null, null, 'bnb');
	}

	window.addEventListener('load', Main);

})();