var bc = {};

(function() {

	var ScopeName = 'breakoutClone';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	// md state
	var PreviousIndex = Math.floor(150 / 16);
	// dom
	var Holder,
		Infos,
		Field, Canvas, Ctx, EffectCanvas, ECtx,
		BarCanvas, BCtx, BarHolder, BarReactor, Bar;

	function installHolder() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.appendChildren(

			Infos = mdom().addClass('infos')
			.appendChildren(

				mtext(0, 'score', 'div').addClass('score')
			),

			Field = mdom().addClass('field')
			//.addEventListener('setBallPos', 'click', function(e) {
			//	Balls[0].x.set(e.offsetX);
			//	Balls[0].y.set(e.offsetY);
			//})
			.appendChildren(

				Canvas = mdom(null, 'canvas').addClass('canvas'),

				EffectCanvas = mdom(null, 'canvas').addClass('effectCanvas')
			),

			BarCanvas = mdom(null, 'canvas').addClass('barCanvas')
			.addEventListener('launchBall', 'click', launchBall),

			BarHolder = mdom().addClass('barHolder')
			.setTransform('translateZ', '0px')
			.addEventListener('launchBall', 'click', launchBall)
			.appendChild(

				BarReactor = mdom()
				.setTransform('translateZ', '0px')
				.appendChild(

					Bar = mdom()
					.setTransform('translateZ', '0px')
				)
			)
		)
		.endScope()
		.mount(document.body);

		Ctx = Canvas.entity.getContext('2d');
		ECtx = EffectCanvas.entity.getContext('2d');
		BCtx = BarCanvas.entity.getContext('2d');
	}

	function installCSS() {

		Md.Css(ScopeName)
		.addSelector({
			'.holder': {
				overflow: 'hidden',
				position: 'absolute',
				left: '50%',
				top: '50%',
				height: '100%',
				'background-color': '#EEE',
				transform: 'translateX(-50%) translateY(-50%)',

				'> *': {
					width: '100%'
				}
			},

			'.bar, .ball, .ballTexture, .bullet, .brick': {
				'will-change': 'transform'
			},

			'.infos': {
				'background-color': '#CCC'
			},

			'.field': {
				position: 'relative',
				'background-color': '#999',
				//cursor: 'none',

				'> *': {
					position: 'absolute',
					top: 0
				},

				'.canvas': {
					//'background-color': '#000'
				},

				'.effectCanvas': {
					//'z-index': 1,
					position: 'absolute'
				},

				'> .ball': {
					overflow: 'hidden',
					//'background': 'url(./image/ball.svg) center center no-repeat',
					//'background-size': 'cover',
					'border-radius': '500px',

					'> *': {
						position: 'absolute',
						width: '100%',
						height: '100%',
						background: 'url() center center no-repeat',
						'background-size': 'cover'
					},

					'> .ballTexture': {
						'background-image': 'url(./image/ballTexture.svg)'
					},

					'> .ballReflection': {
						'background-image': 'url(./image/ballReflection.svg)'
					}
				},

				'> .bullet': {
					//'background-color': '#EEEE00',
					'background-color': '#FFF',
				},

				'> .brick': {
					//'-webkit-box-shadow': 'inset -1px -1px 0 0 #333',
					//'box-shadow': 'inset -1px -1px 0 0 #333',
					display: 'none',
					opacity: 0,

					'&.live': {
						opacity: 1
					},

					'&.hit': {
						//'background-color': 'rgba(255, 0, 0, 0.5)',
						opacity: 0.5,

						'> *': {
							opacity: 0.6
						}
					},

					'> *': { // hiting indicator
						width: '100%',
						height: '100%',
						'background-color': '#FFFFFF',
						opacity: 0
					}
				},
			},

			'.barCanvas': {
				position: 'absolute',
			},

			'.barHolder': {
				display: 'none',
				position: 'absolute',

				' *': {
					width: '100%',
					height: '100%',
					'will-change': 'transform'
				},

				'> *': { // bar reaction
					'transform-origin': 'center bottom',

					'> *': { // bar
						'background-color': '#333333',
						transition: 'transform 150ms'
					}
				}
			}
		})
		.addKeyframe('bar', {

			'0%': {
				transform: 'translateX(0%)'
			},

			'50%': {
				transform: 'translateX(-80%)'
			},

			'100%': {
				transform: 'translateX(0%)'
			},
		})
		.mount();
	}

	// system
	function start() {

		Paddle.init();
		new Ball();
	}

	var audio_failed = Ado.audio('./audio/failed.wav', 0.4);

	function failed() {

		Paddle.destroy();
		stopBall();
		audio_failed.play();
		setTimeout(function() {

			revive();
		}, 3000);
	}

	function revive() {

		Paddle.revive();
		new Ball();
	}

	// paddle(bar)
	var Paddle = {

		init: function(WIDTH, HEIGHT) {

			this.originWidth = PaddleWidth;
			this.width.set(PaddleWidth);
			this.height = PaddleHeight;
			this.toY = PaddleHeight;
			document.addEventListener('mousemove', Paddle.move);
			this.alive = true;
		},

		audio: {
			bounce: Ado.audio('./audio/barBounce.wav', 0.4),
			extend: Ado.audio('./audio/extend.wav', 0.4),
			extendEnd: Ado.audio('./audio/extendEnd.wav', 0.4)
		},

		alive: false,

		friction: 1,

		x: mstate(0, null, PreviousIndex)
		.addTrimer(function(VALUE) {

			if (VALUE < 0) {
				VALUE = 0;
			} else {
				var max = HolderWidth - Paddle.width.value;

				if (VALUE > max) {
					VALUE = max;
				}
			}

			return VALUE;
		})
		.addHandler({
			handler: function() {

				Paddle.render();

				if (!BallRender) {
					for (var i = 0, l = Balls.length; i < l; i++) {
						Balls[i].x.adaptToPaddle();
					}
				}
			}
		}),

		originWidth: 0,

		width: mstate(0)
		.addHandler({
			handler: function() {

				Paddle.toX = this.value / 2;

				var deltaX = -(this.value - this.get(-1)) / 2;

				Paddle.x.add(deltaX);
			}
		}),

		height: 0,

		toX: 0,

		toY: 0,

		scaleX: 1,

		scaleY: 1,

		opacity: 1,

		// render
		onRender: false,

		render: function() {

			if (!Paddle.onRender) {
				Paddle.onRender = true;

				var scaleX = Paddle.scaleX;
				var scaleY = Paddle.scaleY;
				var toX = Paddle.toX;
				var toY = Paddle.toY;

				BCtx.clearRect(0, 0, HolderWidth, Paddle.height);
				BCtx.save();
				BCtx.translate(Paddle.x.value + toX, toY);
				BCtx.translate(-toX * scaleX, -toY * scaleY);
				BCtx.scale(scaleX, scaleY);
				BCtx.globalAlpha = Paddle.opacity;
				BCtx.fillStyle = '#333333';
				BCtx.fillRect(0, 0, Paddle.width.value, Paddle.height);
				BCtx.restore();

				requestAnimationFrame(function() {

					Paddle.onRender = false;
				});
			}
		},

		// acrion
		extendFrameNumber: Math.floor(500 / 16),

		extend: function(SCALE) { // modify width

			Paddle.initAnime('width', Paddle.originWidth * SCALE, 500);
			// audio
			if (SCALE > 1) {
				Paddle.audio.extend.play();
			} else {
				Paddle.audio.extendEnd.play();				
			}
		},

		bounceDuration: 250,

		bounce: function(X, Y) {
			// compress
			Paddle.scaleX = X;
			Paddle.scaleY = Y;
			Paddle.render();
			Paddle.audio.bounce.play();
			// bounce
			requestAnimationFrame(function() {

				var duration = Paddle.bounceDuration;

				Paddle.initAnime('scaleX', 1, duration);
				Paddle.initAnime('scaleY', 1, duration);
			});
		},

		destroyDuration: 250,

		destroy: function() {

			var duration = Paddle.destroyDuration;

			Paddle.initAnime('scaleX', 2, duration);
			Paddle.initAnime('scaleY', 2, duration);
			Paddle.initAnime('opacity', 0, duration);
			Paddle.alive = false;
		},

		revive: function() {

			var duration = Paddle.destroyDuration;

			extendMode.end();
			Paddle.scaleX = 1;
			Paddle.scaleY = 1;
			Paddle.initAnime('opacity', 1, duration);
			Paddle.alive = true;
		},

		// animation operator
		onAnime: 0,

		animes: {
			width: [],
			scaleX: [],
			scaleY: [],
			opacity: []
		},

		initAnime: function(PROP_NAME, TARGET_VALUE, DURATION) {

			var anime = Paddle.animes[PROP_NAME];

			if (anime.length) {
				Paddle.clearAnime(anime);
			}

			var value = Paddle[PROP_NAME];
			if (PROP_NAME === 'width') {
				value = value.value;
			}
			var gap = TARGET_VALUE - value;
			var frameNumber = Math.floor(DURATION / 16);
			var dpf = gap / frameNumber; // delta per frame

			for (var i = 0; i < frameNumber - 1; i++) {
				anime.push(i * dpf + value);
			}

			anime.push(TARGET_VALUE); // last frame
			Paddle.launchAnimeUpdator();
		},

		clearAnime: function(ANIME) {

			for (var i = 0, l = ANIME.length; i < l; i++) {
				ANIME.pop();
			}

			Paddle.onAnime--;
		},

		launchAnimeUpdator: function() {

			var onAnime = Paddle.onAnime++;

			if (!onAnime) {
				Paddle.updateAnime();
			}
		},

		updateAnime: function() {

			var animes = Paddle.animes;

			for (var propName in animes) {
				var anime = animes[propName];

				if (anime.length) {
					var value = anime.shift();

					if (propName === 'width') {
						Paddle.width.set(value);
					} else { // scaleX, scaleY, opacity
						Paddle[propName] = value;
					}

					if (!anime.length) {
						Paddle.onAnime--;
					}
				}
			}

			Paddle.render();

			if (Paddle.onAnime) { // !0
				requestAnimationFrame(Paddle.updateAnime);
			}
		},

		// move
		onMove: false,

		move: function(e) {
			// this function has throttle
			if (!Paddle.onMove) {
				Paddle.onMove = true;
				requestAnimationFrame(function() {

					Paddle.x.set(Math.round((e.clientX - HolderLeft) - Paddle.width.value / 2));
					Paddle.onMove = false;
				});
			}
		}
	};

	// ball
	var Balls = [];
	var BallDiameter, BallRadius, BallPower, Power, Drag;
	var BallRender, Processor, ProcessorTimestamp;

	function Ball(DEGREE) {

		this.dom = mdom().addClass('ball')
		.setStyles({
			width: BallDiameter + 'px',
			height: BallDiameter + 'px',
			borderRadius: BallRadius + 'px'
		})
		.appendChildren(

			mdom().addClass('ballTexture').setTransform('translateZ', '0px'),

			mdom().addClass('ballReflection')
		);
		this.degree = mstate(DEGREE || 75).setTarget(this).addHandler({ handler: ballStateHelper.degreeHandler });
		this.powerX = Power;
		this.powerY = Power;
		this.x = mstate(0, null, 120).setTarget(this).addMethod('adaptToPaddle', ballStateHelper.xAdaptToPaddle).addHandler({ handler: ballStateHelper.xHandler });
		this.y = mstate(0, null, 120).setTarget(this).addHandler({ handler: ballStateHelper.yHandler });
		this.wayX = 1;
		this.wayY = -1;
		this.rotateZ = mstate(0).setTarget(this).addHandler({ handler: ballStateHelper.rotateZHandler });
		this.ghostEffect = new GhostEffect(this);

		// initializing
		this.x.adaptToPaddle();
		this.y.set(BallFloor);
		Field.appendChild(this.dom);
		Balls.push(this);
	}

	var TouchedBricks = []; // for Ball.process(), Bullet.process()

	Ball.prototype = {
		constructor: Ball,

		process: function(PPS) { // processes per second

			var wayX = this.wayX;
			var wayY = this.wayY;
			var degree = this.degree.value;
			var prevBallX = this.x.value;
			var prevBallY = this.y.value;
			var rateX = (90 - degree) / 90;
			var rateY = degree / 90;
			//var powerX = this.powerX;
			//var powerY = this.powerY;
			var powerX = BallPower;
			var powerY = BallPower;
			var increseX = rateX * powerX / PPS * wayX;
			var increseY = rateY * powerY / PPS * wayY;
			var increseRotateZ = rateX * powerX / PPS * wayX;
			var ballX = prevBallX + increseX;
			var ballY = prevBallY + increseY;
			var rotateZ = this.rotateZ.value + increseRotateZ;
			var ballRight = ballX + BallDiameter;
			var ballCX = ballX + BallRadius;
			var ballCY = ballY + BallRadius;
			var collidedEdge, gap;

			// wall
			if (ballX <= 0) { // left wall touched
				collidedEdge = 0;
			} else if (ballRight >= HolderWidth) { // right wall touched
				collidedEdge = HolderWidth - BallDiameter;
			}

			if (collidedEdge !== void 0) { // wall touched
				wayX *= -1;
				gap = ballX - collidedEdge;
				ballX -= gap * 2;
			}

			// ceiling and bar
			if (ballY <= 0) { // ceiling touched
				wayY = 1;
				collidedEdge = 0;
				gap = ballY - collidedEdge;
				ballY -= gap * 2;
			} else if (ballY >= BallFloor) { // bar touched
				if (prevBallY <= FieldHeight) { // above bar
					var barStateX = Paddle.x;
					var barX = barStateX.value;
					var barWidth = Paddle.width.value;
					var barRight = barX + barWidth;

					if (ballCX >= barX && ballCX <= barRight) { // catched
						wayY = -1;
						collidedEdge = BallFloor;
						gap = ballY - collidedEdge;
						ballY -= gap * 2;

						// update degree
						var barXGap = barX - barStateX.get(-PreviousIndex);

						degree += barXGap * wayX * Paddle.friction;
						// revive power
						if (powerY < Power) {
							powerY = Power;
						}
						// bar reaction
						Paddle.bounce(1.2, 0.8);
					}
				} else if (ballY >= FailedY) { // failed, destroy ball
					this.destroy(ballX, ballY);
					return;
				}

				this.update(powerX, powerY, wayX, wayY, ballX, ballY, rotateZ, degree);
				return;
			}

			// bricks
			// get region start, end x, y
			var sY = ballY / BrickHeight;
			var eY = (ballY + BallDiameter) / BrickHeight;
			var is_aboveBrickRegion = eY < 0;
			var is_underBrickRegion = sY >= BrickY;

			if (is_aboveBrickRegion || is_underBrickRegion) {
				this.update(powerX, powerY, wayX, wayY, ballX, ballY, rotateZ);
				return;
			}

			if (sY < 0) {
				sY = 0;
			} else {
				sY = Math.floor(sY);
			}
			if (eY >= BrickY) {
				eY = BrickY - 1;
			} else {
				eY = Math.floor(eY);
			}

			var sX = ballX / BrickWidth;
			if (sX < 0) {
				sX = 0;
			} else {
				sX = Math.floor(sX);
			}
			var eX = ballRight / BrickWidth;
			if (eX >= BrickX) {
				eX = BrickX - 1;
			} else {
				eX = Math.floor(eX);
			}
			// start detect
			// get brick regions around ball
			var brick;

			for (var x = sX; x <= eX; x++) {
				var brickXs = Bricks[x];

				for (var y = sY; y <= eY; y++) {
					brick = brickXs[y];

					if (brick.live) { // > 0
						TouchedBricks.push(brick);
					}
				}
			}
			// at least one brick touched
			var brickNumber = TouchedBricks.length;

			if (brickNumber) {
				var i;

				if (ThruMode) {
					for (i = 0; i < brickNumber; i++) {
						TouchedBricks[i].hit(1);
					}
				} else {
					var minDistance = Infinity;
					var distance, closestBrick;
					// find closest brick
					for (i = 0; i < brickNumber; i++) {
						brick = TouchedBricks[i];
						distance = Math.pow(brick.cX - ballCX, 2) + Math.pow(brick.cY - ballCY, 2);

						if (distance < minDistance) {
							minDistance = distance;
							closestBrick = brick;
						}
					}
					// adjust ball position and update way direction
					var prevBallCX = prevBallX + BallRadius;
					var prevBallCY = prevBallY + BallRadius;
					var gapCX = Math.abs(closestBrick.cX - prevBallCX) - BrickSizeGapHalf;
					var gapCY = Math.abs(closestBrick.cY - prevBallCY);
					var gapValue;
					var direction; // 0(top), 1(right), 2(bottom), 3(left)

					if (gapCX > gapCY) {
						var brickX = closestBrick.x;

						if (wayX > 0) { // ball ->|
							collidedEdge = brickX - BallDiameter;
							direction = 3;
						} else { // |<- ball
							collidedEdge = brickX + BrickWidth; // brick right
							direction = 1;
						}

						wayX *= -1;
						gap = ballX - collidedEdge;
						ballX -= gap * 2;
					} else if (gapCX < gapCY) {
						var brickY = closestBrick.y;

						if (wayY > 0) { // hit brick top
							collidedEdge = brickY - BallDiameter;
							direction = 0;
							//powerY *= 0.6;
						} else { // hit brick bottom
							collidedEdge = brickY + BrickHeight;
							direction = 2;
						}

						wayY *= -1;
						gap = ballY - collidedEdge;
						ballY -= gap * 2;
					} else { // center gaps is equal
						console.log('same');
						direction = wayX > 0 ? 3 : 1;
						wayX *= -1;
						wayY *= -1;
					}
					// modify state and view for closest brick
					closestBrick.hit(1, direction); // ATK is 1
				}
					
				// clear TouchedBricks
				for (i = 0; i < brickNumber; i++) {
					TouchedBricks.pop();
				}
			}

			this.update(powerX, powerY, wayX, wayY, ballX, ballY, rotateZ);
		},

		update: function(POWER_X, POWER_Y, WAY_X, WAY_Y, X, Y, ROTATE_Z, DEGREE) {

			this.powerX = POWER_X;
			this.powerY = POWER_Y;
			this.wayX = WAY_X;
			this.wayY = WAY_Y;
			this.x.set(X, false); // set value only
			this.y.set(Y, false);
			this.rotateZ.set(ROTATE_Z, false);

			if (DEGREE !== void 0) {
				this.degree.set(DEGREE);
			}
		},

		render: function() {

			this.x.update();
			this.y.update();
			this.rotateZ.update();

			return this;
		},

		drag: function() {

			if (this.wayY < 0) { // up
				var powerY = (this.powerY -= Drag);

				if (powerY <= 0) {
					this.wayY = 1;
					this.powerY = 0;
				}
			} else { // > 0, down
				this.powerY += Drag;
			}
		},

		destroy: function(X, Y) { // last move

			var dom = this.dom;

			requestAnimationFrame(function() {

				Field.removeChild(dom);
			});

			this.x.set(X);
			this.y.set(Y);
			this.ghostEffect.destroy();
			// remove from Balls
			Balls.splice(Balls.indexOf(this), 1);
			// check if any ball existing
			if (!Balls.length) {
				failed();
			}
		}
	};

	var ballStateHelper = {

		degreeHandler: function() {

			var degree = this.value;
			var min = 30;
			var max = 75;

			if (degree > max) {
				degree = this.value = max - (degree - max);
				this.target.wayX *= -1;
			}

			if (degree < min) {
				this.value = min;
			}
		},

		xAdaptToPaddle: function() {

			var paddleX = Paddle.x.value;

			return paddleX + (Paddle.width.value - BallDiameter) / 2;
		},

		xHandler: function() {

			this.target.dom.setTransform('translateX', Math.round(this.value) + 'px');
		},

		yHandler: function() {

			this.target.dom.setTransform('translateY', Math.round(this.value) + 'px');
		},

		rotateZHandler: function() {

			this.target.dom.children[0].setTransform('rotateZ', Math.round(this.value) + 'deg');
		},
	};

	// render

	function launchBall() {

		if (!BallRender) {
			BallRender = requestAnimationFrame(renderBall);
			ProcessorTimestamp = Date.now();
			Processor = setInterval(process, 0);
		}
	}

	function stopBall() {
		console.log('failed');
		BallRender = void 0;
		cancelAnimationFrame(BallRender);
		clearInterval(Processor);
		clearInterval(BulletShooter);
	}

	function renderBall() {

		var i, l;
		// ball
		for (i = 0, l = Balls.length; i < l; i++) {
			Balls[i].render();//.drag();
		}
		// bullet
		for (i = 0, l = Bullets.length; i < l; i++) {
			Bullets[i].render();
		}

		// recording bar x for degree modify
		Paddle.x.push(Paddle.x.value);

		// request next frame
		if (BallRender) {
			BallRender = requestAnimationFrame(renderBall);
		}
	}

	function getLatency() { // for process()

		var now = Date.now();
		var latency = now - ProcessorTimestamp;
		// update timestamp
		ProcessorTimestamp = now;

		return latency;
	}

	function process() { // drive balls and bullets

		var latency = getLatency();
		var processPerSecond = 1000 / (latency + 0);
		var i, power;

		// ball
		for (i = Balls.length - 1; i >= 0; i--) { // use i-- to avoid ball.destroy() problem
			Balls[i].process(processPerSecond);
		}

		// bullet
		var bulletNumber = Bullets.length;

		if (bulletNumber) {
			power = Power / processPerSecond * -1; // y

			for (i = bulletNumber - 1; i >= 0; i--) { // use i-- to avoid bullet.destroy() problem
				Bullets[i].process(power);
			}
		}
	}

	// enhancement
	var Enhancements = [];

	function Enhancement(BRICK) {

		this.x = BRICK.x;
		this.y = BRICK.y;
		this.width = BrickWidth;
		this.height = BrickHeight;

		addEffect(this);
	}

	Enhancement.prototype = {
		constructor: Enhancement,

		update: function() {

			var prevY = this.y;
			var y = this.y = prevY + Power / 4 / 60;
			var x = this.x;
			var width = this.width;

			if (Paddle.alive && y >= BallFloor) {
				if (prevY <= FieldHeight) { // above paddle
					var cX = x + width / 2;
					var paddleStateX = Paddle.x;
					var paddleX = paddleStateX.value;
					var paddleWidth = Paddle.width.value;
					var paddleRight = paddleX + paddleWidth;

					if (cX >= paddleX && cX <= paddleRight) { // enhancement catched
						this.destroy();
						var effect = Math.random();
						var delta = 1 / 8;

						if (effect < delta * 1) {
							console.log('laser');
							bulletMode.laser.start();
						} else if (effect < delta * 2) {
							console.log('add ball');
							var degree = Math.round(Math.random() * (75 - 30)) + 30;

							new Ball(degree);
						} else if (effect < delta * 3) {
							console.log('thru mode');
							startThruMode();
						} else if (effect < delta * 4) {
							console.log('extend mode');
							extendMode.start();
						} else if (effect < delta * 5) {
							console.log('machine gun');
							bulletMode.machineGun.start();
						} else if (effect < delta * 6) {
							console.log('shotgun');
							bulletMode.shotgun.start();
						} else if (effect < delta * 7) {
							console.log('faster');
							speedShift.shift(1.5, 5000);
						} else if (effect < delta * 8) {
							console.log('slower');
							speedShift.shift(0.5, 5000);
						}
					}
				} else if (y >= FailedY) {
					this.destroy();
				}
			}

			ECtx.save();
			ECtx.fillStyle = '#FFF';
			ECtx.fillRect(x, y, width, this.height);
			ECtx.restore();
		},

		destroy: function() {

			removeEffect(this);
		}
	};

	// mode
	var speedShift = {

		timer: false,

		shift: function(RATE, DURATION) {

			clearTimeout(speedShift.timer);
			BallPower = Power * RATE;
			speedShift.timer = setTimeout(speedShift.end, DURATION);
		},

		end: function() {

			if (speedShift.timer) {
				clearTimeout(speedShift.timer);
				speedShift.timer = false;
				BallPower = Power;
			}
		}
	};

	// thru mode
	var ThruMode = false;
	var ThruModeTimer;

	function startThruMode() {

		clearTimeout(ThruModeTimer);

		ThruMode = true;
		ThruModeTimer = setTimeout(function() {

			ThruMode = false;
		}, 5000);
	}

	// extend(paddle) mode
	var extendMode = {

		timer: false,

		duration: 10000,

		start: function() {

			clearTimeout(extendMode.timer);
			Paddle.extend(1.8);
			extendMode.timer = setTimeout(extendMode.end, extendMode.duration);
		},

		end: function() {

			if (extendMode.timer) {
				clearTimeout(extendMode.timer);
				extendMode.timer = false;
				Paddle.extend(1);
			}
		}
	};

	// bullet
	var Bullets = [];
	var BulletWidth, BulletHeight;

	function Bullet(SIDE, ATK, DEGREE) { // -1(left), 0(center), 1(right), DEGREE(shotgun)

		var dom = mdom().addClass('bullet')
		.setStyles({
			width: BulletWidth + 'px',
			height: (DEGREE ? BulletWidth : BulletHeight) + 'px',
			borderRadius: DEGREE ? BulletWidth / 2 + 'px' : '0px'
		})
		.setTransform('translateZ', '0px');
		var x = mstate(0).setTarget(this).addHandler({handler: bulletStateHelper.xHandler});
		var y = mstate(0).setTarget(this).addHandler({handler: bulletStateHelper.yHandler});

		this.dom = dom;
		this.x = x;
		this.y = y;
		this.width = BulletWidth;
		this.height = DEGREE ? BulletWidth : BulletHeight;
		this.atk = ATK;
		this.degree = DEGREE || 90; // (left)180 to 0(right)
		// initializing
		dom.setTransform('translateX', x + 'px');
		x.set(bulletStateHelper.getX(SIDE));
		y.set(BallFloor);
		Bullets.push(this);
		Field.appendChild(dom);
	}

	Bullet.prototype = {
		constructor: Bullet,

		process: function(POWER) {

			var degree = this.degree;
			var wayX = degree <= 90 ? 1 : -1;
			var rateY = (wayX > 0 ? degree : (180 - degree)) / 90;
			var increseY = POWER * rateY;
			//var y = this.y.value + increseY;
			var y = this.y.value + POWER;
			var increseX = (POWER - increseY) * wayX;
			var x = this.x.value + increseX;

			if (y <= 0) { // ceiling touched
				this.destroy(0);
			} else {
				var sY = y / BrickHeight;
				var is_underBrickRegion = sY >= BrickY;

				if (!is_underBrickRegion) {
					if (sY < 0) {
						sY = 0;
					} else {
						sY = Math.floor(sY);
					}
					var eY = (y + this.height) / BrickHeight;
					if (eY >= BrickY) {
						eY = BrickY - 1;
					} else {
						eY = Math.floor(eY);
					}
					var width = this.width;
					var sX = x / BrickHeight;
					if (sX < 0) {
						sX = 0;
					} else {
						sX = Math.floor(sX);
					}
					var eX = (x + width) / BrickWidth;
					if (eX >= BrickX) {
						eX = BrickX - 1;
					} else {
						eX = Math.floor(eX);
					}
					// get brick regions around ball
					var i, j, brick;

					for (i = sX; i <= eX; i++) {
						var brickXs = Bricks[i];

						for (j = sY; j <= eY; j++) {
							brick = brickXs[j];

							if (brick.live) { // > 0
								TouchedBricks.push(brick);
							}
						}
					}
					// at least one brick touched
					var brickNumber = TouchedBricks.length;

					if (brickNumber) {
						var cX = x + width / 2;
						var minDistance = Infinity;
						var distance, closestBrick;
						// find closest brick
						// if two bricks has the same distance to bullet, choose the last one(near the bar)
						for (i = 0; i < brickNumber; i++) {
							brick = TouchedBricks[i];
							distance = brick.cX - cX;

							if (distance < minDistance) {
								minDistance = distance;
								closestBrick = brick;
							}
						}
						// modify state and view for closest brick
						closestBrick.hit(this.atk, 2); // direction is bottom
						// destroy bullet
						this.destroy(y);
						// clear TouchedBricks
						for (i = 0; i < brickNumber; i++) {
							TouchedBricks.pop();
						}
						return;
					}
				}
			}

			this.x.set(x, false);
			this.y.set(y, false);
		},

		render: function() {

			this.x.update();
			this.y.update();
		},

		destroy: function(Y) {

			var dom = this.dom;

			requestAnimationFrame(function() {

				Field.removeChild(dom);
			});

			this.x.set(Y);
			this.y.set(Y);
			// remove from Bullets
			Bullets.splice(Bullets.indexOf(this), 1);
		}
	};

	var bulletStateHelper = {

		getX: function(SIDE) {

			var x = Paddle.x.value;

			if (SIDE === -1) { // left
				x += BulletWidth;
			} else if (SIDE === 1) { // right
				x += Paddle.width.value - BulletWidth * 2;
			} else { // 0, center
				x += (Paddle.width.value - BulletWidth) / 2;
			}

			return x;
		},

		getSX: function(X) {

			var sX = X / BrickWidth;

			if (sX < 0) {
				sX = 0;
			} else {
				sX = Math.floor(sX);
			}

			return sX;
		},

		getEX: function(X) {

			var eX = (X + BulletWidth) / BrickWidth;

			if (eX >= BrickX) {
				eX = BrickX - 1;
			} else {
				eX = Math.floor(eX);
			}

			return eX;
		},

		xHandler: function() {

			this.target.dom.setTransform('translateX', this.value + 'px');
		},

		yHandler: function() {

			this.target.dom.setTransform('translateY', this.value + 'px');
		}
	};

	var BulletShooter;
	var bulletMode = {

		laser: {

			latency: 500,

			times: 10,

			count: 0,

			atk: 2,

			audio: Ado.audio('./audio/laser.wav', 0.4),

			start: function() {

				clearInterval(BulletShooter);
				this.count = 0;
				this.shoot();
				BulletShooter = setInterval(this.shoot.bind(this), this.latency);
			},

			shoot: function() {

				var atk = this.atk;

				new Bullet(-1, atk);
				new Bullet(1, atk);
				this.audio.play();

				if (++this.count === this.times) { // end of shoot
					clearInterval(BulletShooter);
				}
			}
		},

		machineGun: {

			latency: 100,

			times: 50,

			count: 0,

			atk: 1,

			audio: Ado.audio('./audio/machineGun.wav', 0.4),

			start: function() {

				clearInterval(BulletShooter);
				this.count = 0;
				this.shoot();
				BulletShooter = setInterval(this.shoot.bind(this), this.latency);
			},

			shoot: function() {

				new Bullet(0, this.atk);
				this.audio.play();

				if (++this.count === this.times) { // end of shoot
					clearInterval(BulletShooter);
				}
			}
		},

		shotgun: {

			latency: 1000,

			times: 10,

			count: 0,

			atk: 1,

			audio: Ado.audio('./audio/shotgun.mp3', 0.3),

			start: function() {

				clearInterval(BulletShooter);
				this.count = 0;
				this.shoot();
				BulletShooter = setInterval(this.shoot.bind(this), this.latency);
			},

			shoot: function() {

				var number = 9;
				var margin = 60;
				var range = 180 - margin * 2;
				var atk = this.atk;

				for (var i = 1; i <= number; i++) {
					var degree = Math.random() * range + margin;

					new Bullet(0, atk, degree);
				}

				this.audio.play();

				if (++this.count === this.times) { // end of shoot
					clearInterval(BulletShooter);
				}
			}
		}
	};

	// bricks
	var FieldWidthRatio = 100; // % of innerHeight
	var BrickRegionHeightRatio = 60; // % of innerHeight
	var BrickWidthRatio = 2.5; // % of innerHeight
	var BrickHeightRatio = 2.5;
	var BrickWidth, BrickHeight, BrickRadiusX, BrickRadiusY, BrickSizeGapHalf;
	var BrickX = Math.round(FieldWidthRatio / BrickWidthRatio);
	var BrickY = Math.round(BrickRegionHeightRatio / BrickHeightRatio);
	var Bricks = [];

	function BrickMap() {


	}

	function BrickGroup(LIVE) {

		this.bricks = [];
		this.lives = LIVE;
	}

	BrickGroup.prototype = {
		constructor: BrickGroup,

		addBrick: function(BRICK) {

			this.bricks.push(BRICK);
			BRICK.group = this;
		},

		handleLive: function(LIVE) {

			var live = this.lives + LIVE;

			if (live <= 0) {
				this.destroy();
			} else {
				this.lives = live;
			}
		},

		hit: function(ATK) {

			this.handleLive(-ATK);
		},

		destroy: function() {

			var bricks = this.bricks;

			for (var i = 0, l = bricks.length; i < l; i++) {
				bricks[i].destory();
			}
		}
	};

	var audio_brickHit = Ado.audio('./audio/hit2.wav', 0.3);
	var audio_brickDestroy = Ado.audio('./audio/destroy.wav', 0.3);

	function Brick(REGION_X, REGION_Y) {

		var x = REGION_X * BrickWidth;
		var y = REGION_Y * BrickHeight;

		this.rX = REGION_X; // region
		this.rY = REGION_Y;
		this.x = x; // position
		this.y = y;
		this.cX = x + BrickRadiusX; // center
		this.cY = y + BrickRadiusY;
		this.eX = x; // effect position
		this.eY = y;
		this.eScaleX = 1; // effect scale
		this.eScaleY = 1;
		this.color = '#333333';
		this.opacity = 1;
		this.live = 0;
		this.imortal = false;
		this.phoenix = false;
		this.movable = true;
		this.group = void 0;
		this.hitEffect = mstate(void 0).setTarget(this)
		.addMethod('cast', brickStateHelper.hitEffectMethodCast)
		.addMethod('end', brickStateHelper.hitEffectMethodEnd);
		//this.hitSound = Ado.audio('./audio/hit.wav');
	}

	Brick.prototype = {
		constructor: Brick,

		addLive: function(LIVE) {

			var oldLive = this.live;
			var live = oldLive + LIVE;

			if (live !== oldLive) {
				if (live <= 0) {
					this.live = 0;
					destroyBrick(this);
				} else {
					this.live = live;

					if (!oldLive) {
						reviveBrick(this);
					}
				}
			}
		},

		hit: function(ATK, DIRECTION) {

			var group = this.group;

			if (group) {
				group.hit(ATK);
			} else if (!this.imortal) {
				this.addLive(-ATK);
				this.hitEffect.cast(DIRECTION);
				new ScoreEffect(this.x, this.y, '100');
			}
		}
	};

	var brickStateHelper = {

		hitEffectMethodCast: function(DIRECTION) {

			var hitEffect = this.value;

			if (hitEffect) {
				hitEffect.destroy();
			}

			var brick = this.target;
			var value;

			if (brick.live) {
				var rX = brick.rX;
				var rY = brick.rY;
				var nRX, nRY, neighbor;

				if (DIRECTION === 0) { // top
					nRX = rX;
					nRY = rY + 1;
				} else if (DIRECTION === 1) { // right
					nRX = rX - 1;
					nRY = rY;
				} else if (DIRECTION === 2) { // bottom
					nRX = rX;
					nRY = rY - 1;
				} else { // left
					nRX = rX + 1;
					nRY = rY;
				}

				if (nRX < 0 || nRX >= BrickX || nRY < 0 || nRY >= BrickY) {

				} else {
					neighbor = Bricks[nRX][nRY];
				}

				if (neighbor && neighbor.live) {
					neighbor = void 0;
				}


				value = new HitEffect(brick, neighbor, DIRECTION);
				audio_brickHit.play();
			}

			return value;
		},

		hitEffectMethodEnd: function() {

			var hitEffect = this.value;

			if (hitEffect) {
				hitEffect.destroy();
			}

			return void 0;
		}
	};

	function reviveBrick(BRICK) {

		Ctx.save();
		Ctx.globalAlpha = BRICK.opacity;
		Ctx.fillStyle = BRICK.color;
		Ctx.fillRect(BRICK.x, BRICK.y, BrickWidth, BrickHeight);
		Ctx.restore();
	}

	function destroyBrick(BRICK) {

		BRICK.hitEffect.end();

		// effect
		new DestroyEffect(BRICK);
		audio_brickDestroy.play();

		// drop enhancement
		if (Math.random() > 0.7) {
			new Enhancement(BRICK);
		}

		// revive
		if (BRICK.phoenix) {
			setTimeout(function() {

				BRICK.addLive(1);
			}, 5000);
		}
	}

	function generateBricks() { // init

		for (var x = 0; x < BrickX; x++) {
			var bricksX = [];

			Bricks.push(bricksX);

			for (var y = 0; y < BrickY; y++) {
				bricksX.push(new Brick(x, y));
			}
		}
	}

	/* effects */

	var Effects = [];
	var EffectCaster;

	function addEffect(EFFECT) {

		Effects.push(EFFECT);
		LaunchEffectCaster();
	}

	function removeEffect(EFFECT) {

		Effects.splice(Effects.indexOf(EFFECT), 1);

		if (!Effects.length) {
			ECtx.clearRect(0, 0, HolderWidth, CanvasHeight);
		}
	}

	function LaunchEffectCaster() {

		if (!EffectCaster) {
			EffectCaster = requestAnimationFrame(castEffect);
		}
	}

	function castEffect() {

		var effectNumber = Effects.length;

		if (effectNumber) {
			// clear canvas
			ECtx.clearRect(0, 0, HolderWidth, CanvasHeight);

			for (var i = effectNumber - 1; i >= 0; i--) {
				var effect = Effects[i];

				effect.update();
			}
		}
		// request next frame
		if (Effects.length) {
			EffectCaster = requestAnimationFrame(castEffect);
		} else {
			EffectCaster = false;
		}
	}

	function GhostEffect(BALL) {

		this.x = BALL.x;
		this.y = BALL.y;

		addEffect(this);
	}

	GhostEffect.prototype = {
		constructor: GhostEffect,

		update: function() {

			var xState = this.x;
			var yState = this.y;
			var seg = 2;
			var l = xState.cap / seg;
			var opacity = 1;
			var scale = 1;

			for (var i = 0; i < l; i++) {
				var index = i * seg;
				var x = xState.get(-index);
				var y = yState.get(-index);

				opacity *= 0.92;
				scale *= 0.96;

				ECtx.save();
				ECtx.beginPath();
				ECtx.arc(x + BallRadius, y + BallRadius, BallRadius * scale, 0, 2 * Math.PI);
				ECtx.fillStyle = '#000000';
				ECtx.globalAlpha = opacity;
				ECtx.fill();
				ECtx.restore();
			}
		},

		destroy: function() {

			removeEffect(this);
		}
	};

	var ScoreEffectDuration = 500; // ms
	var ScoreEffectFrames = Math.round(ScoreEffectDuration / (1000 / 60));

	function ScoreEffect(X, Y, SCORE) {

		this.x = X;
		this.y = Y;
		this.score = SCORE;
		this.wayX = Math.random() > 0.5 ? 1 : -1;
		this.xDelta = Math.random() * Power * 0.2 / 60;
		this.yDelta = 0.2 * Power / 60;
		this.frame = 0;

		addEffect(this);
	}

	ScoreEffect.prototype = {
		constructor: ScoreEffect,

		update: function() {

			var x = this.x += this.xDelta * this.wayX;
			var y = this.y -= this.yDelta;
			var score = this.score;

			ECtx.save();
			ECtx.font = '1rem Arial';
			ECtx.fillStyle = '#FFFFFF';
			ECtx.fillText(score, x, y);
			ECtx.restore();

			if (this.y >= CanvasHeight) {
				this.destroy();
			} else {
				this.yDelta -= Drag / 30;
			}

			if (this.frame++ === ScoreEffectFrames) {
				this.destroy();
			}
		},

		destroy: function() {

			removeEffect(this);
		}
	};

	var HitEffectScaleDelta = 0.4;
	var HitEffectOpacityDelta = 0.6;
	var HitEffectDuration = 250; // ms
	var HitEffectFrames = Math.round(HitEffectDuration / (1000 / 60));
	var HitEffectScaleXSteps = [];
	var HitEffectScaleYSteps = [];
	var HitEffectOpacitySteps = [];
	(function() {

		var x = 1 + HitEffectScaleDelta;
		var y = 1 - HitEffectScaleDelta;
		var o = 1 - HitEffectOpacityDelta;
		var scaleDpf = HitEffectScaleDelta / HitEffectFrames;
		var opacityDpf = HitEffectOpacityDelta / HitEffectFrames;

		for (var i = 0; i < HitEffectFrames; i++) {
			var scaleDelta = i * scaleDpf;

			HitEffectScaleXSteps.push(x - scaleDelta);
			HitEffectScaleYSteps.push(y + scaleDelta);
			HitEffectOpacitySteps.push(o + i * opacityDpf);
		}
	})();

	function HitEffect(BRICK, TARGET_BRICK, DIRECTION) {

		this.target = BRICK;
		this.direction = DIRECTION;
		this.targetBrick = TARGET_BRICK;
		this.frame = 0;
		this.toX = BrickWidth / 2; // transform-origin-x: center
		this.toY = BrickHeight; // transform-origin-y: bottom

		Ctx.clearRect(BRICK.x, BRICK.y, BrickWidth, BrickHeight);
		addEffect(this);
	}

	HitEffect.prototype = {
		constructor: HitEffect,

		update: function() {

			var frame = this.frame++;

			if (this.frame === HitEffectFrames) {
				this.destroy();
			} else {
				var brick = this.target;
				var targetBrick = this.targetBrick;

				if (targetBrick) { // movable
					var direction = this.direction;

					if (direction === 0 || direction === 2) {
						brick.eY += (targetBrick.y - brick.y) / HitEffectFrames;
					} else {
						brick.eX += (targetBrick.x - brick.x) / HitEffectFrames;
					}
				}

				var scaleX = this.eScaleX = HitEffectScaleXSteps[frame];
				var scaleY = this.eScaleY = HitEffectScaleYSteps[frame];
				var toX = this.toX;
				var toY = this.toY;

				ECtx.save();
				ECtx.translate(brick.eX + toX, brick.eY + toY);
				ECtx.translate(-toX * scaleX, -toY * scaleY);
				ECtx.scale(scaleX, scaleY);
				ECtx.globalAlpha = HitEffectOpacitySteps[frame];
				ECtx.fillStyle = brick.color;
				ECtx.fillRect(0, 0, BrickWidth, BrickHeight);
				ECtx.restore();
			}
		},

		destroy: function() {

			removeEffect(this);

			var brick = this.target;

			if (brick.live) {
				var targetBrick = this.targetBrick;
				var x = brick.x;
				var y = brick.y;

				if (targetBrick) {
					// migrate
					targetBrick.live = brick.live;
					targetBrick.color = brick.color;
					targetBrick.opacity = brick.opacity;
					// reset brick
					brick.eX = brick.x;
					brick.eY = brick.y;
					brick.live = 0;
					// change drawing position
					x = targetBrick.x;
					y = targetBrick.y;
				}

				brick.hitEffect.set(void 0);
				Ctx.save();
				Ctx.fillStyle = brick.color;
				Ctx.fillRect(x, y, BrickWidth, BrickHeight);
				Ctx.restore();
			}
		}
	};

	function DestroyEffect(BRICK) {

		var x = BRICK.x;
		var y = BRICK.y;

		this.x = x;
		this.y = y;
		this.color = BRICK.color;
		this.wayX = Math.random() > 0.5 ? 1 : -1;
		this.xDelta = Math.random() * Power * 0.2 / 60;
		this.yDelta = Math.random() * Power / 60;
		this.scaleDelta = Math.random() / 60;
		this.scale = 1;
		this.degreeDelta = Math.random() * Power * this.wayX / 60;
		this.degree = 0;
		this.opacity = 0.6;
		this.toX = BrickWidth / 2; // center
		this.toY = BrickHeight / 2; // center

		Ctx.clearRect(x, y, BrickWidth, BrickHeight);
		addEffect(this);
	}

	DestroyEffect.prototype = {
		constructor: DestroyEffect,

		update: function() {

			var degree = this.degree += this.degreeDelta;
			var scale = this.scale += this.scaleDelta;
			var increseX = this.xDelta * scale;
			var increseY = this.yDelta * scale;
			var x = this.x += increseX * this.wayX;
			var y = this.y -= increseY;
			var toX = this.toX;
			var toY = this.toY;

			ECtx.save();
			ECtx.translate(x + toX, y + toY);
			ECtx.rotate(degree * Math.PI / 180);
			ECtx.translate(-toX * scale, -toY * scale);
			ECtx.scale(scale, scale);
			ECtx.fillStyle = this.color;
			ECtx.fillRect(0, 0, BrickWidth, BrickHeight);
			ECtx.fillStyle = '#FFFFFF';
			ECtx.globalAlpha = this.opacity *= 0.98;
			ECtx.fillRect(0, 0, BrickWidth, BrickHeight);
			ECtx.restore();

			if (this.y >= CanvasHeight) {
				this.destroy();
			} else {
				this.yDelta -= Drag / 60;
			}
		},

		destroy: function() {

			removeEffect(this);
		}
	};

	// size

	var Vw, Vh,
		HolderLeft, HolderWidth,
		InfosHeight,
		FieldTop, FieldBottom, FieldHeight, FailedY, BallFloor, // px
		CanvasHeight;
	var PaddleWidth, PaddleHeight;

	function manageSize() {

		Vw = Math.round(innerWidth / 100);
		Vh = Math.round(innerHeight / 100);

		HolderWidth = Vh * FieldWidthRatio;
		HolderLeft = (innerWidth - HolderWidth) / 2;

		InfosHeight = Vh * 0;

		// ball
		var power = Vh * 100;
		var ballSize = Vh * 2;

		BallDiameter = ballSize;
		BallRadius = ballSize / 2;
		Power = power;
		BallPower = power;

		// bullet
		BulletWidth = BallRadius / 2;
		BulletHeight = BallRadius;

		FieldHeight = Vh * 90;
		FieldTop = -(FieldHeight - ballSize);
		FieldBottom = Vh * 10 + ballSize; // 100vh - fieldHeight(90) + ballSize(2)
		FailedY = FieldHeight + (innerHeight - InfosHeight - FieldHeight) + ballSize;
		BallFloor = FieldHeight - ballSize;

		CanvasHeight = Vh * 100;

		// bar
		var barWidth = ballSize * 6;

		PaddleWidth = barWidth;
		PaddleHeight = ballSize;
		BarHolder.setStyle('width', barWidth + 'px');
		BarHolder.setStyle('height', ballSize + 'px');

		// brick
		BrickWidth = Math.round(Vh * BrickWidthRatio);
		BrickHeight = Math.round(Vh * BrickHeightRatio);
		BrickRadiusX = BrickWidth / 2;
		BrickRadiusY = BrickHeight / 2;
		BrickSizeGapHalf = BrickRadiusX - BrickRadiusY;

		Drag = Vh * 0.8;

		// set dom size
		Holder.setStyle('width', HolderWidth + 'px');
		Infos.setStyle('height', InfosHeight + 'px');
		Field.setStyle('height', FieldHeight + 'px');
		Canvas.setAttributes({
			width: HolderWidth,
			height: CanvasHeight
		});
		EffectCanvas.setAttributes({
			width: HolderWidth,
			height: CanvasHeight
		});
		BarCanvas.setAttributes({
			width: HolderWidth,
			height: ballSize
		});
		console.log(ballSize, BrickWidth, BrickWidthRatio);
	}

	var MapBuilder;

	Clobe.clobe()
	.set('brickX', BrickX)
	.set('brickY', BrickY)
	.set('build', function() {

		var bricks = MapBuilder.bricks;
		var brick;
		var json = [];

		for (var i = 0; i < bricks.length; i++) {
			var jsonX = [];

			json.push(jsonX);

			for (var j = 0; j < bricks[i].length; j++) {
					brick = bricks[i][j];
				var color = brick.color.value;
				var opacity = brick.opacity.value;

				if (color === 'transparent' || opacity === 0) {
					color = 'transparent';
				}

				var jsb = {
					'color': color,
					'opacity': opacity
				};

				jsonX.push(jsb);
			}
		}

		// test stringify(for save)
		var jsons = JSON.stringify(json)
			.replace(/}\],\[{"color":"/g, '%c')
			.replace(/","opacity":/g, '%o');

		console.log('json string length:', jsons.length);

		// turn HSON string back to object
		bricks = JSON.parse(
			jsons
			.replace(/%c/g, '}\],\[{"color":"')
			.replace(/%o/g, '","opacity":')
		);

		var ctx = Canvas.entity.getContext('2d');

		for (var x = 0; x < bricks.length; x++) {
			var bricksX = bricks[x];

			for (var y = 0; y < bricksX.length; y++) {
				var state = bricksX[y];
					brick = Bricks[x][y];

				brick.silverBullet = false;
				brick.phoenix = false;
				brick.imortal = false;

				if (bricksX[y].color !== 'transparent') {
					brick.color = state.color;
					brick.opacity = state.opacity / 255;
					brick.addLive(2);
				} else {
					//brick.addLive(-brick.live);
					//Field.removeChild(brick.dom);
				}
			}
		}
	})
	.definePath('./script')
	.import('mapBuilder')
	.ready(function(clobe) {

		var mapBuilder = clobe.mapBuilder;
		var holder = mapBuilder.create();

		MapBuilder = mapBuilder;
		holder.mount(document.body);
		jscolor.installByClassName('jscolor');
		mapBuilder.state.color.init('#000000');
	});

	var monster = new Image(); monster.src = './image/monster.png';
	var monster_fly = new Image(); monster_fly.src = './image/monster_fly.png';

	function init() {

		window.addEventListener('rotate', manageSize); // vkbAndRotateDetect.js
		//document.addEventListener('mousemove', moveBar);
		//document.addEventListener('touchmove', moveBar);
		//var bgm = Ado.audio('./audio/Strange-Nature_Looping.mp3', 0.3);

		//bgm.loop(true);
		//bgm.play();

		requestAnimationFrame(function() {

			installCSS();
			installHolder();

			//require('nw.gui').Window.get().maximize();
			//setTimeout(function() {

				manageSize();
				generateBricks();
				//Paddle.init(PaddleWidth, PaddleHeight);
				start();
				//setInterval(function() {
				//setTimeout(function() {
				//	var degree = Math.round(Math.random() * (75 - 30)) + 30;
				//	new _Ball(degree);
				//}, 1000);
				document.addEventListener('keyup_', function(e) {

					var key = e.key;

					if (key === '1') {
						console.log('laser');
						bulletMode.laser.start();
					} else if (key === '2') {
						console.log('add ball');
						var degree = Math.round(Math.random() * (75 - 30)) + 30;

						new Ball(degree);
					} else if (key === '3') {
						console.log('thru mode');
						startThruMode();
					} else if (key === '4') {
						console.log('extend mode');
						extendMode.start();
					} else if (key === '5') {
						console.log('machine gun');
						bulletMode.machineGun.start();
					} else if (key === '6') {
						console.log('shotgun');
						bulletMode.shotgun.start();
					} else if (key === '7') {
						console.log('faster');
						speedShift.shift(1.5, 5000);
					} else if (key === '8') {
						console.log('slower');
						speedShift.shift(0.5, 5000);
					}
				});

			//}, 1000);
		});
	}

	window.addEventListener('load', init);

})();