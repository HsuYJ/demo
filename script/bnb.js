//(function() {

	window.addEventListener('load', function() {

		//var ngui = require('nw.gui');
		//var nwin = ngui.Window.get();
		//nwin.enterFullscreen();

		Rl
		.setImagePath('./image/')
		.setAudioPath('./audio/')
		.loadImages(
			['ball', 'ball.svg'],
			['monster', 'slime.png'],
			['ani_slime_idle', 'ani_slime_idle.png'],
			['ani_slime_angry', 'ani_slime_angry.png'],
			['ani_slime_dead', 'ani_slime_dead.png'],
			['ani_orc_idle', 'ani_orc_idle.png'],
			['ani_knight_idle', 'ani_knight_idle.png'],
			['monster2', 'monster_fly.png'],
			['buff', 'buff.png'],
			['bullet_ironBall', 'bullet_ironBall.png'],
			['smoke0', 'smoke0.png'],
			['smoke1', 'smoke1.png']
		)
		.loadAudios(
			['systemFailed', 'system_failed.wav'],
			['paddleExtend', 'paddle_extend.wav'],
			['paddleExtendEnd', 'paddle_extendEnd.wav'],
			['paddleBounce', 'paddle_bounce.wav'],
			['brickHit', 'brick_hit.wav'],
			['shotgun_fireReload', 'shotgun_fireReload.mp3'],
			['machineGun_fire', 'machineGun_fire.wav'],
			['laser_fire', 'laser_fire.wav']
		)
		.whenProgress(function(PROGRESS) {

			console.log(
				'Resource loading: ' + PROGRESS.loadedNumber + '/' + PROGRESS.totalNumber + '\n' +
				'Time elapsed: ' + PROGRESS.elapsed
			);
		})
		.whenReady(function(RESOURCE) {

			var Images = RESOURCE.images;
			var Audios = RESOURCE.audios;
			var ScopeName = 'bnb';
			var mdom = Md.Dom;
			var mtext = Md.TextDom;
			var mstate = Md.State;

			for (var audioName in Audios) {
				Audios[audioName].volume = 0.3;
			}

			for (var imgName in Images) {
				var img = Images[imgName];
				var tempCanvas = mdom(null, 'canvas')
				.setAttributes({
					width: img.width,
					height: img.height
				});
				var ctx = tempCanvas.entity.getContext('2d');

				ctx.fillStyle = '#FFFFFF';
				ctx.fillRect(0, 0, img.width, img.height);
				ctx.globalCompositeOperation = 'destination-in';
				ctx.drawImage(img, 0, 0);

				Images[imgName + '_hit'] = tempCanvas.entity;
				Images[imgName].hitImage = tempCanvas.entity;
			}

			// size
			var Size = {};
			var Ratio = { // base is vh(1% of innerHeight)

				power: 100,

				fieldWidth: 120,
				fieldHeight: 100,

				ballDiameter: 2,
				ballRadius: 1,
				ballFloor: 90 - 2,
				ballDrag: 1,

				buffWidth: 4,
				buffHeight: 4,
				buffMove: 10,

				paddleRailHeight: 20,
				paddleY: 10,
				paddleWidth: 2 * 6, // 6x ballDiameter
				paddleHeight: 2,

				bulletSpeed: 1.5,
				bulletWidth: 1.5,
				bulletHeight: 1.5,

				brickRegionWidth: 120,
				brickRegionHeight: 60,
				brickWidth: 8,
				brickHeight: 8,

				drag: 1
			};

			function sizeCalculating() {

				var vh = innerHeight / 100;
				var s = Size;

				for (var i in Ratio) {
					s[i] = vh * Ratio[i];
					//s[i] = Math.ceil(vh * Ratio[i]);
					//s[i] = Math.floor(vh * Ratio[i]);
					//s[i] = Math.round(vh * Ratio[i]);
				}

				s.fieldLeft = (innerWidth - s.fieldWidth) / 2;
				s.ballPower = s.power;
				s.brickRadiusX = s.brickWidth / 2;
				s.brickRadiusY = s.brickHeight / 2;
				s.brickSizeGapHalf = (s.brickWidth - s.brickHeight) / 2;

				console.log(Size);
			}

			function resizeObjects() {

				var s = Size;

				FieldHolder.setStyles({
					width: s.fieldWidth + 'px'
				});

				FieldCanvas.resize(s.fieldWidth, s.fieldHeight);

				EffectFieldCanvas.resize(s.fieldWidth, s.fieldHeight);

				PaddleRailCanvas.resize(s.fieldWidth, s.paddleRailHeight);

				setProps(Paddle, {
					y: s.paddleY,
					originWidth: s.paddleWidth,
					width: s.paddleWidth,
					height: s.paddleHeight,
					toY: s.paddleHeight
				});

				for (var i = 0, l = Balls.length; i < l; i++) {
					Balls[i].y.set(Size.ballFloor);
				}
			}

			function installCSS() {

				Md.Css(ScopeName)
				.addSelector({
					'.holder': {
						'z-index': '9999999'
					},

					'.infoHolder': {
						position: 'absolute',
						padding: '1%',
						display: 'inline-block',
						left: 0,
						top: 0,
						//width: '20%',
						//height: '10%',
						'background-color': 'rgba(0, 0, 0, 0.75)',

						'> *': {
							display: 'block',
							color: '#FFFFFF'
						}
					},

					'.fieldHolder': {
						overflow: 'hidden',
						position: 'absolute',
						left: '50%',
						height: '100%',
						'background-color': '#2d4633',
						transform: 'translateX(-50%)',

						'.ball': {
							overflow: 'hidden',
							position: 'absolute',
							width: Ratio.ballDiameter + 'vh',
							height: Ratio.ballDiameter + 'vh',
							'border-radius': Ratio.ballRadius + 'vh',

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
						}
					},

					'.paddleRail': {
						position: 'absolute',
						bottom: 0
					},

					'canvas': {
						position: 'absolute'
					}
				})
				.mount();
			}

			// object
			var Holder,
				FieldHolder, Field, FieldCanvas, EffectField, EffectFieldCanvas, PaddleRail, PaddleRailCanvas;
			var InfoHolder, Info_autoPlay;

			function generateObjects() {

				Holder = mdom().startScope(ScopeName).addClass('holder')
				.appendChildren(

					FieldHolder = mdom().addClass('fieldHolder')
					.appendChildren(

						Field = mdom(null, 'canvas'),

						EffectField = mdom(null, 'canvas'),

						PaddleRail = mdom(null, 'canvas').addClass('paddleRail')
						.addEventListener('launchBall', 'click', function() {

							ballRender.launch();
						})
					),

					InfoHolder = mdom().addClass('infoHolder')
					.appendChildren(

						mtext('功能鍵說明:'),
						mtext('space: launch ball'),
						mtext('1: 延展 paddle'),
						mtext('2:  縮短 paddle'),
						mtext('3:  添加 ball'),
						mtext('4:  toggle Auto play'),
						mtext('5:  laser gun'),
						mtext('6:  shotgun'),
						mtext('7:  machine gun'),
						Info_autoPlay = mtext('Auto play mode: false')
					)
				)
				.mount(document.body);

				// generate Canvas
				FieldCanvas = new Canvas(Field.entity);
				EffectFieldCanvas = new Canvas(EffectField.entity);
				PaddleRailCanvas = new Canvas(PaddleRail.entity);

				// generate sprite
				PaddleRailCanvas.appendSprite(Paddle);
			}

			function Canvas(CANVAS) {

				this.entity = CANVAS;
				this.ctx = CANVAS.getContext('2d');
				this.width = CANVAS.width;
				this.height = CANVAS.height;
				this.sprites = [];
				this.onUpdate = false;
				this.updateStartTime = 0;
				this.lastFrameIndex = 0;
				this.updateQueue = [];
				this.onRender = false;
			}
			var ts = 0;
			Canvas.prototype = {
				constructor: Canvas,

				resize: function(WIDTH, HEIGHT) {

					var entity = this.entity;

					this.width = entity.width = WIDTH;
					this.height = entity.height = HEIGHT;
				},

				appendSprite: function(SPRITE) {

					var presentCanvas = SPRITE.canvas;

					if (presentCanvas) {
						presentCanvas.removeSprite(SPRITE);
					}

					SPRITE.canvas = this;
					this.sprites.push(SPRITE);

					return this;
				},

				appendSprites: function() {

					var args = arguments;
					var sprites = this.sprites;

					for (var i = 0, l = args.length; i < l; i++) {
						var sprite = args[i];
						var presentCanvas = sprite.canvas;

						if (presentCanvas) {
							presentCanvas.removeSprite(sprite);
						}

						sprite.canvas = this;
						sprite.push(args[i]);
					}

					return this;
				},

				removeSprite: function(SPRITE) {

					var sprites = this.sprites;

					sprites.splice(sprites.indexOf(SPRITE), 1);

					return this;
				},

				update: function() {

					var now = Date.now();
					var self = this;
					var frameIndex = Math.floor((now - this.updateStartTime) / 16);
					var progress = frameIndex - this.lastFrameIndex;

					this.lastFrameIndex = frameIndex;

					if (progress) {
						var queue = this.updateQueue;
						// update
						for (var i = queue.length - 1; i >= 0; i--) {
							var isEnd = queue[i].update(progress);

							if (isEnd) {
								queue.splice(i, 1);
							}
						}
						// request next update
						if (queue.length) {
							requestAnimationFrame(function() {

								self.update();
							});
						} else {
							this.onUpdate = false;
						}
						// render
						this.launchRender(true); // instant
					} else { // request next update
						requestAnimationFrame(function() {

							self.update();
						});
					}
				},

				render: function() {

					var sprites = this.sprites;
					var ctx = this.ctx;

					// sort by zIndex
					sprites.sort(function(a, b) {

						return a.zIndex - b.zIndex;
					});

					// render
					ctx.clearRect(0, 0, this.width, this.height);

					for (var i = 0, l = sprites.length; i < l; i++) {
						var sprite = sprites[i];

						if (sprite.display) {
							sprite.render(ctx);
						}
					}

					this.onRender = false;
				},

				launchUpdate: function(SPRITE) {

					var queue = this.updateQueue;

					if (queue.indexOf(SPRITE) === -1) {
						queue.push(SPRITE);
					}

					if (!this.onUpdate) {
						this.updateStartTime = Date.now();
						this.lastFrameIndex = 0;
						this.onUpdate = true;
						this.update();
					}
				},

				launchRender: function(INSTANT) {

					if (!this.onRender) {
						this.onRender = true;

						if (INSTANT) {
							this.render();
						} else {
							var self = this;

							requestAnimationFrame(function() {

								self.render();
							});
						}
					}
				},
			};

			// common sprite method
			// setProp
			function setProp(SPRITE, PROP_NAME, VALUE, SET_ONLY) {

				var prop = SPRITE[PROP_NAME];

				if (typeof prop === 'object') { // mstate
					prop.set(VALUE);
				} else {
					SPRITE[propName] = VALUE;
				}

				if (!SET_ONLY) {
					SPRITE.canvas.launchRender();
				}
			}

			function setProps(SPRITE, PROPS, SET_ONLY) {

				for (var propName in PROPS) {
					var prop = SPRITE[propName];
					var value = PROPS[propName];

					if (typeof prop === 'object') { // mstate
						prop.set(value);
					} else {
						SPRITE[propName] = value;
					}
				}

				if (!SET_ONLY) {
					SPRITE.canvas.launchRender();
				}
			}

			// setTransform
			function setTransform(SPRITE, PROP_NAME, TARGET_VALUE, DURATION) {

				var presentValue = SPRITE[PROP_NAME];
				if (typeof presentValue === 'object') { // mstate
					presentValue = presentValue.value;
				}
				var gap = TARGET_VALUE - presentValue;
				var frameNumber = DURATION / 16;
				var dpf = gap / frameNumber; // delta per frame
				var firstLetter = PROP_NAME[0];
				if (firstLetter === 's' || firstLetter === 'o' || firstLetter === 'b') { // scale, opacity, blink
					// do nothing
				} else {
					dpf = Math.round(dpf);
				}
				var transform = SPRITE.transforms[PROP_NAME];
				var l = transform.length;
				var i;

				if (l) {
					for (i = 0; i < l; i++) {
						transform.pop();
					}
					SPRITE.onTransform--;
				}

				for (i = 0, l = frameNumber - 1; i < l; i++) {
					transform.push(i * dpf + presentValue);
				}

				transform.push(TARGET_VALUE);
				SPRITE.onTransform++;
			}

			function setTransforms(SPRITE, PROPS, DURATION) {

				var frameNumber = DURATION / 16;
				var transforms = SPRITE.transforms;

				for (var propName in PROPS) {
					var presentValue = SPRITE[propName];
					if (typeof presentValue === 'object') { // mstate
						presentValue = presentValue.value;
					}
					var targetValue = PROPS[propName];
					var gap = targetValue - presentValue;
					var dpf = gap / frameNumber; // delta per frame
					var firstLetter = propName[0];
					if (firstLetter === 's' || firstLetter === 'o' || firstLetter === 'b') { // scale, opacity, blink
						// do nothing
					} else {
						dpf = Math.round(dpf);
					}
					var transform = transforms[propName];
					var l = transform.length;
					var i;

					if (l) {
						for (i = 0; i < l; i++) {
							transform.pop();
						}
						SPRITE.onTransform--;
					}

					for (i = 0, l = frameNumber - 1; i < l; i++) {
						transform.push(i * dpf + presentValue);
					}

					transform.push(targetValue);
					SPRITE.onTransform++;
				}
			}

			// setKeyframes
			function setKeyframes(SPRITE, KEYFRAMES) {

				var keyframes = SPRITE.keyframes;
				var firstFrame = KEYFRAMES[0];

				SPRITE.onKeyframe = true;
				keyframes.number = KEYFRAMES.length;
				keyframes.index = 0;
				keyframes.set = KEYFRAMES;
				setTransforms(SPRITE, firstFrame.props, firstFrame.duration);
			}

			// setAnimation
			function setAnimation(SPRITE, IMAGE, FRAME_NUMBER, FPS) {

				var animation = SPRITE.animation;

				animation.image = IMAGE;
				animation.frameNumber = FRAME_NUMBER;
				animation.fps = FPS;
				animation.dpf = 1000 / FPS;
				animation.index = 0;
				animation.lastUpdateTime = Date.now();
			}

			function Animator(SPRITE) {

				this.target = SPRITE;
				this.updater = void 0;
				this.testType = 0; // 0: and, 1: or
				this.endTests = [];
				this.endActions = [];
			}

			// Animator
			Animator.prototype = {
				constructor: Animator,

				setProps: function(PROPS) {

					for (var propName in PROPS) {
						this[propName] = PROPS[propName];
					}

					return this;
				},

				setUpdater: function(UPDATER) {

					this.updater = UPDATER.bind(this);

					return this;
				},

				addEndTest: function(TEST) {

					this.endTests.push(TEST.bind(this));

					return this;
				},

				addEndAction: function(ACTION) {

					this.endActions.push(ACTION.bind(this));

					return this;
				},

				launch: function() {

					var self = this;

					requestAnimationFrame(function() {

						self.update();
					});
				},

				update: function() {

					var target = this.target;
					var canvas = target.canvas;

					this.updater(target);

					if (target.onTransform) {
						canvas.launchUpdate(target);
					}

					canvas.launchRender();

					var isEnd = this.endTesting();

					if (isEnd) {
						var  endActions = this.endActions;

						for (var i = 0, l = endActions.length; i < l; i++) {
							endActions[i](target);
						}

						this.target = void 0;
					} else { // request next update
						var self = this;

						requestAnimationFrame(function() {

							self.update();
						});
					}
				},

				endTesting: function() {

					var target = this.target;
					var tests = this.endTests;
					var type = this.testType; // 0: and, 1: or
					var isEnd = type ? false : true;

					for (var i = 0, l = tests.length; i < l; i++) {
						var result = tests[i](target); // true: end, false: continue

						if (type) { // or
							if (result) {
								isEnd = true;
								break;
							}
						} else { // and
							if (!result) {
								isEnd = false;
								break;
							}
						}
					}

					return isEnd;
				}
			};

			var PreviousIndex = Math.floor(150 / 16);
			var Paddle = {

				alive: true,

				friction: 1,

				x: mstate(0, null, PreviousIndex)
				.addTrimer(function(VALUE) {

					if (VALUE < 0) {
						VALUE = 0;
					} else {
						var max = Size.fieldWidth - Paddle.width.value;

						if (VALUE > max) {
							VALUE = max;
						}
					}

					return VALUE;
				})
				.addHandler({
					handler: function() {

						if (!ballRender.renderTimer) {
							for (var i = 0, l = Balls.length; i < l; i++) {
								Balls[i].x.adaptToPaddle();
							}
						}
					}
				}),

				y: 0,

				originWidth: 0,

				width: mstate(0)
				.addHandler({
					handler: function() {

						var width = this.value;

						Paddle.toX = width / 2;

						var deltaX = -(width - this.get(-1)) / 2;

						Paddle.x.add(deltaX);
					}
				}),

				height: 0,

				toX: 0,

				toY: 0,

				scaleX: 1,

				scaleY: 1,

				opacity: 1,

				display: true,

				onTransform: 0,

				transforms: {
					x: [],
					y: [],
					width: [],
					height: [],
					scaleX: [],
					scaleY: [],
					opacity: [],
				},

				onKeyframe: false,

				keyframes: {
					number: 0,
					index: 0,
					set: void 0 // array
				},

				update: function(PROGRESS) { // min is 1

					var transforms = this.transforms;

					for (var i in transforms) {
						var transform = transforms[i];
						var l = transform.length;

						if (l) {
							if (PROGRESS > l) {
								PROGRESS = l;
							}

							var value;

							for (var t = 0, tl = PROGRESS; t < tl; t++) {
								value = transform.shift();
							}

							if (i === 'x' || i === 'width') {
								this[i].set(value);
							} else {
								this[i] = value;
							}

							if (!transform.length) { // last frame
								this.onTransform--;
							}
						}
					}

					if (!this.onTransform) { // 0, finished
						if (this.onKeyframe) {
							var keyframes = this.keyframes;
							var number = keyframes.number;
							var index = ++keyframes.index;

							if (index < number) {
								var keyframe = keyframes.set[index];

								setTransforms(this, keyframe.props, keyframe.duration);
							} else {
								this.onKeyframe = false;
								return true;
							}
						} else {
							return true;
						}
					}
				},

				render: function(CTX) {

					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x.value + toX, this.y + toY);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;
					CTX.fillStyle = '#CCCCCC';
					CTX.fillRect(0, 0, this.width.value, this.height);
					CTX.restore();
				},

				// action
				extend: function(SCALE) { // modify width

					//setTransform(this, 'scaleX', SCALE, 500);
					setTransform(this, 'width', this.originWidth * SCALE, 500);
					this.canvas.launchUpdate(this);
					// audio
					if (SCALE > 1) {
						Audios.paddleExtend.play();
					} else {
						Audios.paddleExtendEnd.play();
					}
				},

				bounce: function() {

					Audios.paddleBounce.play();
					// compress
					setProps(this, {

						scaleX: 1.2,
						scaleY: 0.8
					});
					// bounce
					setKeyframes(this, this.keyframeSet.bounce);
					this.canvas.launchUpdate(this);
				},

				keyframeSet: {
					bounce: (function() {

						var deltaX = 0.2;
						var deltaY = -0.2;
						var duration = 160;
						var keyframes = [];

						for (var i = 0; i < i + 1; i++) {
							var isEnd = false;

							deltaX *= -0.5;
							deltaY *= -0.5;

							if (deltaX > -0.01 && deltaX < 0.01) {
								deltaX = 0;
								deltaY = 0;
								isEnd = true;
							}

							keyframes.push({
								props: {
									scaleX: 1 + deltaX,
									scaleY: 1 + deltaY
								},

								duration: duration
							});

							if (isEnd) {
								break;
							}

							duration /= 2;
						}

						return keyframes;
					}())
				},

				destroy: function() {

					this.toY = this.height;
					setTransforms(this, {
						scaleX: 2,
						scaleY: 2,
						opacity: 0
					}, 500);
					this.canvas.launchUpdate(this);
					this.alive = false;
				},

				revive: function() {

					this.toY = this.height / 2;
					this.scaleX = 1;
					this.scaleY = 1;
					setTransform(this, 'opacity', 1, 500);
					this.canvas.launchUpdate(this);
					this.alive = true;
				},

				// adaptToCursor
				onMove: false,

				adaptToCursor: function(e) {
					// this function has throttle
					if (!Paddle.onMove) {
						Paddle.onMove = true;
						requestAnimationFrame(function() {

							setProp(Paddle, 'x', (e.clientX - Size.fieldLeft) - Paddle.width.value / 2);
							Paddle.onMove = false;
						});
					}
				}
			};

			// ball
			var Balls = [];
			var BallRender, Processor, ProcessorTimestamp;

			function Ball(DEGREE) {

				this.dom = mdom().addClass('ball')
				.setTransform('translateZ', '0px')
				.appendChildren(

					mdom().addClass('ballTexture').setTransform('translateZ', '0px'),

					mdom().addClass('ballReflection')
				);
				this.degree = mstate(DEGREE || 75).setTarget(this).addHandler({ handler: ballStateHelper.degreeHandler });
				this.powerX = Size.power;
				this.powerY = Size.power;
				this.x = mstate(0, null, 120).setTarget(this).addMethod('adaptToPaddle', ballStateHelper.xAdaptToPaddle).addHandler({ handler: ballStateHelper.xHandler });
				this.y = mstate(0, null, 120).setTarget(this).addHandler({ handler: ballStateHelper.yHandler });
				this.wayX = 1;
				this.wayY = -1;
				this.rotateZ = mstate(0).setTarget(this).addHandler({ handler: ballStateHelper.rotateZHandler });
				this.ghost = new BallGhost(this);

				// initializing
				this.x.adaptToPaddle();
				this.y.set(Size.ballFloor);
				FieldHolder.appendChild(this.dom);
				Balls.push(this);
			}

			var TouchedBricks = []; // for Ball.update(), Bullet.process()

			Ball.prototype = {
				constructor: Ball,

				update: function(PPS) { // processes per second

					var power = Size.ballPower;
					var ballDiameter = Size.ballDiameter;
					var ballRadius = Size.ballRadius;
					var wayX = this.wayX;
					var wayY = this.wayY;
					var degree = this.degree.value;
					var prevBallX = this.x.value;
					var prevBallY = this.y.value;
					var rateX = (90 - degree) / 90;
					var rateY = degree / 90;
					var powerX = power;
					var powerY = power;
					var increseX = rateX * powerX / PPS * wayX;
					var increseY = rateY * powerY / PPS * wayY;
					var increseRotateZ = rateX * powerX / PPS * wayX;
					var ballX = prevBallX + increseX;
					var ballY = prevBallY + increseY;
					var rotateZ = this.rotateZ.value + increseRotateZ;
					var ballRight = ballX + ballDiameter;
					var ballCX = ballX + ballRadius;
					var ballCY = ballY + ballRadius;
					var collidedEdge, gap;

					// wall
					if (ballX <= 0) { // left wall touched
						collidedEdge = 0;
					} else {
						var fieldWidth = Size.fieldWidth;

						if (ballRight >= fieldWidth) { // right wall touched
							collidedEdge = fieldWidth - ballDiameter;
						}
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
					} else {
						var ballFloor = Size.ballFloor;

						if (ballY >= ballFloor) { // bar touched
							// autoPlay
							if (system.autoPlay) {
								setProp(Paddle, 'x', ballX - Paddle.width.value / 2);
							}

							var fieldHeight = Size.fieldHeight;

							if (prevBallY <= (fieldHeight - Size.paddleRailHeight + Size.paddleY + Size.paddleHeight)) { // above bar
								var barStateX = Paddle.x;
								var barX = barStateX.value;
								var barWidth = Paddle.width.value;
								var barRight = barX + barWidth;

								if (ballCX >= barX && ballCX <= barRight) { // catched
									wayY = -1;
									collidedEdge = ballFloor;
									gap = ballY - collidedEdge;
									ballY -= gap * 2;

									// update degree
									var barXGap = barX - barStateX.get(-PreviousIndex);

									degree += barXGap * wayX * Paddle.friction;
									// revive power

									// bar reaction
									Paddle.bounce();
								}
							} else if (ballY >= fieldHeight) { // out of vision, destroy ball
								this.destroy(ballX, ballY);
								return;
							}

							this.updateState(powerX, powerY, wayX, wayY, ballX, ballY, rotateZ, degree);
							return;
						}
					}

					// bricks
					// get region start, end x, y
					var brickHeight = Size.brickHeight;
					var sY = ballY / brickHeight;
					var is_underBrickRegion = sY >= BrickY;

					if (is_underBrickRegion) {
						this.updateState(powerX, powerY, wayX, wayY, ballX, ballY, rotateZ);
						return;
					}
					
					var eY = (ballY + ballDiameter) / brickHeight;

					sY = Math.floor(sY);
					if (eY >= BrickY) {
						eY = BrickY - 1;
					} else {
						eY = Math.floor(eY);
					}

					var brickWidth = Size.brickWidth;
					var sX = ballX / brickWidth;
					if (sX < 0) {
						sX = 0;
					} else {
						sX = Math.floor(sX);
					}
					var eX = ballRight / brickWidth;
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

							if (brick.live.value) { // > 0
								TouchedBricks.push(brick);
							}
						}
					}
					// at least one brick touched
					var brickNumber = TouchedBricks.length;

					if (brickNumber) {
						var i;

						//if (ThruMode) {
						if (0) {
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
							var prevBallCX = prevBallX + ballRadius;
							var prevBallCY = prevBallY + ballRadius;
							var gapCX = Math.abs(closestBrick.cX - prevBallCX) - Size.brickSizeGapHalf;
							var gapCY = Math.abs(closestBrick.cY - prevBallCY);
							var gapValue;
							var direction; // 0(top), 1(right), 2(bottom), 3(left)

							if (gapCX > gapCY) {
								var brickX = closestBrick.pX;

								if (wayX > 0) { // ball ->|
									collidedEdge = brickX - ballDiameter;
									direction = 3;
								} else { // |<- ball
									collidedEdge = brickX + brickWidth; // brick right
									direction = 1;
								}

								wayX *= -1;
								gap = ballX - collidedEdge;
								ballX -= gap * 2;
							} else if (gapCX < gapCY) {
								var brickY = closestBrick.pY;

								if (wayY > 0) { // hit brick top
									collidedEdge = brickY - ballDiameter;
									direction = 0;
									//powerY *= 0.6;
								} else { // hit brick bottom
									collidedEdge = brickY + brickHeight;
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

					this.updateState(powerX, powerY, wayX, wayY, ballX, ballY, rotateZ);
				},

				updateState: function(POWER_X, POWER_Y, WAY_X, WAY_Y, X, Y, ROTATE_Z, DEGREE) {

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

				drag: function() { // x

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

						FieldHolder.removeChild(dom);
					});

					this.x.set(X);
					this.y.set(Y);
					this.ghost.destroy();
					// remove from Balls
					Balls.splice(Balls.indexOf(this), 1);
					// check if any ball existing
					if (!Balls.length) {
						system.failed();
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

					return paddleX + (Paddle.width.value - Size.ballDiameter) / 2;
				},

				xHandler: function() {

					this.target.dom.setTransform('translateX', Math.round(this.value) + 'px');
				},

				yHandler: function() {

					this.target.dom.setTransform('translateY', Math.round(this.value) + 'px');
				},

				rotateZHandler: function() {
					// texture
					this.target.dom.children[0].setTransform('rotateZ', Math.round(this.value) + 'deg');
				},
			};

			function BallGhost(BALL) {

				this.x = BALL.x;
				this.y = BALL.y;
				this.display = true;

				EffectFieldCanvas.appendSprite(this);
				this.canvas.launchUpdate(this);
			}

			BallGhost.prototype = {
				constructor: BallGhost,

				update: function() { // empty

					// do nothing
				},

				render: function(CTX) {

					var xState = this.x;
					var yState = this.y;
					var seg = 2;
					var l = xState.cap / seg;
					var opacity = 1;
					var scale = 1;
					var ballRadius = Size.ballRadius;

					for (var i = 0; i < l; i++) {
						var index = i * seg;
						var x = xState.get(-index);
						var y = yState.get(-index);

						opacity *= 0.92;
						scale *= 0.96;

						CTX.save();
						CTX.beginPath();
						CTX.arc(x + ballRadius, y + ballRadius, ballRadius * scale, 0, 2 * Math.PI);
						CTX.fillStyle = '#FFFFFF';
						CTX.globalAlpha = opacity;
						CTX.fill();
						CTX.restore();
					}
				},

				destroy: function() {

					this.canvas.removeSprite(this);
				}
			};

			var ballRender = {

				renderTimer: void 0,

				updateTimer: void 0,

				launch: function() {

					if (!this.renderTimer) {
						this.lastUpdateTime = Date.now();
						this.updateTimer = setInterval(ballRender.update, 0);
						this.renderTimer = requestAnimationFrame(ballRender.render);
					}
				},

				stop: function() {
					console.log('failed');
					clearInterval(this.updateTimer);
					cancelAnimationFrame(this.renderTimer);
					this.renderTimer = void 0;
					this.updateTimer = void 0;
				},

				lastUpdateTime: 0,

				update: function() { // don't use 'this'

					var now = Date.now();
					var latency = now - ballRender.lastUpdateTime;

					ballRender.lastUpdateTime = now;

					var pps = 1000 / latency; // processes per second
					var i;

					// ball
					for (i = Balls.length - 1; i >= 0; i--) {
						Balls[i].update(pps);
					}
				},

				render: function() { // don't use 'this'

					var i, l;
					// ball
					for (i = 0, l = Balls.length; i < l; i++) {
						Balls[i].render();//.drag();
					}
					// recording paddle x for degree modifying
					Paddle.x.push(Paddle.x.value);

					// request next frame
					if (ballRender.renderTimer) {
						ballRender.renderTimer = requestAnimationFrame(ballRender.render);
					}
				}
			};

			// brick
			var Bricks = []; // 2d array
			var BrickX = Math.round(Ratio.brickRegionWidth / Ratio.brickWidth);
			var BrickY = Math.round(Ratio.brickRegionHeight / Ratio.brickHeight);

			function Brick(REGION_X, REGION_Y) {

				var x = REGION_X * Size.brickWidth;
				var y = REGION_Y * Size.brickHeight;

				this.rX = REGION_X; // region
				this.rY = REGION_Y;
				this.pX = x; // fixed position
				this.pY = y;
				this.cX = x + Size.brickRadiusX; // center
				this.cY = y + Size.brickRadiusY;
				this.x = x;
				this.y = y;
				this.z = 0;
				this.zIndex = 0;
				this.width = Size.brickWidth;
				this.height = Size.brickHeight;
				this.toX = Size.brickRadiusX;
				this.toY = Size.brickHeight;
				this.scaleX = 1;
				this.scaleY = 1;
				this.rotateZ = 0;
				this.opacity = 1;
				this.blink = 0;
				this.onTransform = 0;
				this.transforms = {
					x: [],
					y: [],
					z: [],
					width: [],
					height: [],
					scaleX: [],
					scaleY: [],
					rotateZ: [],
					opacity: [],
					blink: []
				};
				this.onKeyframe = false;
				this.keyframes = {
					number: 0,
					index: 0,
					set: void 0
				};
				this.color = '#FFFFFF';
				this.image = Images.monster;
				this.onAnimation = false;
				this.animation = {
					lastUpdate: Date.now(),
					index: 0,
					frameNumber: 62,
					fps: 62,
					dpf: 1000 / 62,
					//image: Images.ani_orc_idle,
					image: Images.ani_slime_idle,
				};
				this.display = false;
				this.live = mstate(0).setTarget(this)
				.addTrimer(brickStateHelper.liveTrimer)
				.addHandler({ handler: brickStateHelper.liveHandler });
				this.imortal = false;
				this.phoenix = false;
				this.movable = true;
				//this.group = void 0;
				//this.hitEffect = mstate(void 0).setTarget(this)
				//.addMethod('cast', brickStateHelper.hitEffectMethodCast)
				//.addMethod('end', brickStateHelper.hitEffectMethodEnd);
			}

			Brick.prototype = {
				constructor: Brick,

				update: function(PROGRESS) { // min is 1

					var transforms = this.transforms;

					for (var i in transforms) {
						var transform = transforms[i];
						var l = transform.length;

						if (l) {
							if (PROGRESS > l) {
								PROGRESS = l;
							}

							var value;

							for (var t = 0, tl = PROGRESS; t < tl; t++) {
								value = transform.shift();
							}

							this[i] = value;

							if (!transform.length) { // last frame
								this.onTransform--;
							}
						}
					}

					if (this.onAnimation) {
						var now = Date.now();
						var animation = this.animation;
						var gap = now - animation.lastUpdate;

						if (gap >= animation.dpf) {
							animation.lastUpdate = now;

							var animationIndex = animation.index += PROGRESS;

							if (animationIndex >= animation.frameNumber) {
								animation.index = 0;
							}
						}

					}

					if (!this.onTransform && this.onKeyframe) {
						var keyframes = this.keyframes;
						var number = keyframes.number;
						var index = ++keyframes.index;

						if (index < number) {
							var keyframe = keyframes.set[index];

							setTransforms(this, keyframe.props, keyframe.duration);
						} else {
							this.onKeyframe = false;
						}
					}

					if (!this.onTransform && !this.onAnimation) { // finished
						return true;
					}
				},

				render2: function(CTX) {

					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);
					CTX.rotate(this.rotateZ * Math.PI / 180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;
					CTX.fillStyle = this.color;

					if (this.blink) {
						var blink = this.blink--;

						if (blink % 2 === 0 || blink === 1) {
							CTX.fillRect(0, 0, this.width, this.height);
							//CTX.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
						}

						if (blink <= 0) {
							this.blink = 0;
						}
					} else {
						CTX.fillRect(0, 0, this.width, this.height);
						//CTX.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
					}
					CTX.restore();
				},

				render: function(CTX) {

					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + this.z + toY);
					CTX.rotate(this.rotateZ * Math.PI / 180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;
					//CTX.fillStyle = this.color;
					//CTX.fillRect(0, 0, this.width, this.height);
					//if (this.onAnimation) {
						var animation = this.animation;
						var index = animation.index;
						var image = animation.image;
						var frameNumber = animation.frameNumber;

						CTX.drawImage(image,
							index * (image.width / frameNumber),
							0,
							(image.width / frameNumber),
							image.height,
							0, 0, this.width, this.height
						);
					//} else {
					//	CTX.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
					//}

					var blink = this.blink;

					if (blink) {
						image = image.hitImage;
						CTX.globalAlpha = blink;
						CTX.drawImage(image,
							index * (image.width / frameNumber),
							0,
							(image.width / frameNumber),
							image.height,
							0, 0, this.width, this.height
						);
					}

					CTX.restore();
				},

				hit: function(ATK, DIRECTION) {

					if (this.brickGroup) {
						this.brickGroup.hit(ATK);
					} else {
						if (!this.imortal) {
							this.blink = 1;
							setTransform(this, 'blink', 0, 250);
							Audios.brickHit.play();
							this.live.add(-ATK);

							if (this.live.value) {
								setAnimation(this, Images.ani_slime_angry, 62, 62);
								this.onAnimation = true;
								setProps(this, {
									scaleX: 1.6,
									scaleY: 0.4
								});
								setKeyframes(this, this.keyframeSet.hit);
								this.canvas.launchUpdate(this);
								//this.hitEffect.cast(DIRECTION);
								//new ScoreEffect(this.x, this.y, '100');
							}
						}
					}
				},

				revive: function() {

					this.display = true;
					this.canvas.launchRender();
				},

				destroy: function() {

					if (Math.random() < 0.25) {
						new Buff(this);
					}

					this.zIndex = 1;
					this.toY = Size.brickRadiusY;

					setAnimation(this, Images.ani_slime_dead, 62, 62);
					this.onAnimation = true;

					var power = Size.power / 60;
					var wayX = Math.random() > 0.5 ? 1 : -1;

					new Animator(this).setProps({
						wayX: wayX,
						xDelta: Math.random() * power * 0.2,
						yDelta: Math.random() * power,
						scale: 1,
						scaleDelta: Math.random() / 60,
						rotateZDelta: Math.random() * power / 2 * wayX
					})
					.setUpdater(function(TARGET) {

						var scale = this.scale += this.scaleDelta;
						var increseX = this.xDelta * scale;
						var increseY = this.yDelta * scale;
						var colorCode = this.colorCode;

						TARGET.x += increseX * this.wayX;
						TARGET.y -= increseY;
						TARGET.scaleX = scale;
						TARGET.scaleY = scale;
						TARGET.rotateZ += this.rotateZDelta;

						this.yDelta -= Size.drag / 60;
					})
					.addEndTest(function(TARGET) {

						return TARGET.y >= Size.fieldHeight;
					})
					.addEndAction(function(TARGET) {

						TARGET.zIndex = 0;
						TARGET.toY = Size.brickHeight;
						TARGET.display = false;
						TARGET.canvas.launchRender();
					})
					.launch();
				},

				generateKeyframeSet: function() {

					var set = {

						hit: [
							{
								props: {
									scaleX: 0.8,
									scaleY: 1.2,
								},

								duration: 240
							},

							{
								props: {
									scaleX: 1.1,
									scaleY: 0.9,
								},

								duration: 120
							},

							{
								props: {
									scaleX: 1,
									scaleY: 1,
								},

								duration: 60
							},
						],

						idle: [
							{
								props: {
									scaleX: 1.4,
									scaleY: 0.6,
								},

								duration: 240
							},

							{
								props: {
									z: -Size.brickHeight * 1.5,
									scaleX: 0.8,
									scaleY: 1.2,
								},

								duration: 120
							},

							{
								props: {
									z: 0,
									scaleX: 1.4,
									scaleY: 0.6,
								},

								duration: 240
							},

							{
								props: {
									scaleX: 0.8,
									scaleY: 1.2,
								},

								duration: 120
							},

							{
								props: {
									scaleX: 1.1,
									scaleY: 0.9,
								},

								duration: 60
							},

							{
								props: {
									scaleX: 1,
									scaleY: 1,
								},

								duration: 30
							}
						]
					};

					this.keyframeSet = set;
				}
			};

			var brickStateHelper = {

				liveTrimer: function(VALUE) {

					if (VALUE < 0) {
						VALUE = 0;
					}

					return VALUE;
				},

				liveHandler: function() {

					var target = this.target;

					if (!this.value) {
						target.destroy();
					} else {
						if (this.get(-1) === 0) {
							target.revive();
						}
					}
				},

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

			function generateBricks() { // init

				for (var x = 0; x < BrickX; x++) {
					var bricksX = [];

					Bricks.push(bricksX);

					for (var y = 0; y < BrickY; y++) {
						var brick = new Brick(x, y);

						bricksX.push(brick);
						FieldCanvas.appendSprite(brick);
					}
				}
			}

			function BrickGroup(START_X, START_Y, WIDTH, HEIGHT) {

				this.pX = 0; // fixed position
				this.pY = 0;
				this.x = Size.fieldWidth;
				this.y = Size.fieldHeight;
				this.z = 0;
				this.zIndex = 0;
				this.width = Size.brickWidth;
				this.height = Size.brickHeight;
				this.toX = 0;
				this.toY = 0;
				this.scaleX = 1;
				this.scaleY = 1;
				this.rotateZ = 0;
				this.opacity = 1;
				this.blink = 0;
				this.onTransform = 0;
				this.transforms = {
					x: [],
					y: [],
					z: [],
					width: [],
					height: [],
					scaleX: [],
					scaleY: [],
					rotateZ: [],
					opacity: [],
					blink: []
				};
				this.onKeyframe = false;
				this.keyframes = {
					number: 0,
					index: 0,
					set: void 0
				};
				this.color = '#FFFFFF';
				this.onAnimation = false;
				this.animation = {
					lastUpdate: Date.now(),
					index: 0,
					frameNumber: 62,
					fps: 62,
					dpf: 1000 / 62,
					image: Images.ani_knight_idle,
				};
				this.display = false;
				this.live = mstate(0).setTarget(this)
				.addTrimer(brickStateHelper.liveTrimer)
				.addHandler({ handler: brickStateHelper.liveHandler });
				this.bricks = [];

				for (var i = START_X, il = START_X + WIDTH; i < il; i++) {
					for (var j = START_Y, jl = START_Y + HEIGHT; j < jl; j++) {
						this.appendBrick(Bricks[i][j]);
					}
				}
			}

			BrickGroup.prototype = {
				constructor: BrickGroup,

				appendBrick: function(BRICK) {

					var x = this.x;
					var y = this.y;
					var brickX = BRICK.x;
					var brickY = BRICK.y;

					this.bricks.push(BRICK);
					BRICK.brickGroup = this;
					// update state
					x = this.pX = this.x = Math.min(x, brickX);
					y = this.pY = this.y = Math.min(y, brickY);
					var width = this.width = Math.max(this.width, brickX + Size.brickWidth - x);
					var height = this.height = Math.max(this.height, brickY + Size.brickHeight - y);

					this.toX = width / 2;
					this.toY = height;

					return this;
				},

				appendBricks: function() { // u

					var args = arguments;
					var bricks = this.bricks;
					var x = this.x;
					var y = this.y;
					var width = this.width;
					var height = this.height;

					for (var i = 0, l = args.length; i < l; i++) {
						var brick = args[i];

						bricks.push(brick);
						brick.brickGroup = this;
						// update state
						var brickX = brick.x;
						var brickY = brick.y;

						x = this.x = Math.min(x, brickX);
						y = this.y = Math.min(y, brickY);
						width = this.width = Math.max(width, brickX + brick.width);
					}
				},

				update: function(PROGRESS) { // min is 1

					var transforms = this.transforms;

					for (var i in transforms) {
						var transform = transforms[i];
						var l = transform.length;

						if (l) {
							if (PROGRESS > l) {
								PROGRESS = l;
							}

							var value;

							for (var t = 0, tl = PROGRESS; t < tl; t++) {
								value = transform.shift();
							}

							this[i] = value;

							if (!transform.length) { // last frame
								this.onTransform--;
							}
						}
					}

					if (this.onAnimation) {
						var now = Date.now();
						var animation = this.animation;
						var gap = now - animation.lastUpdate;

						if (gap >= animation.dpf) {
							animation.lastUpdate = now;

							var animationIndex = animation.index += PROGRESS;

							if (animationIndex >= animation.frameNumber) {
								animation.index = 0;
							}
						}

					}

					if (!this.onTransform && this.onKeyframe) {
						var keyframes = this.keyframes;
						var number = keyframes.number;
						var index = ++keyframes.index;

						if (index < number) {
							var keyframe = keyframes.set[index];

							setTransforms(this, keyframe.props, keyframe.duration);
						} else {
							this.onKeyframe = false;
						}
					}

					if (!this.onTransform && !this.onAnimation) { // finished
						return true;
					}
				},

				render: function(CTX) {

					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + this.z + toY);
					CTX.rotate(this.rotateZ * Math.PI / 180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;
					//CTX.fillStyle = this.color;
					//CTX.fillRect(0, 0, this.width, this.height);
					//if (this.onAnimation) {
						var animation = this.animation;
						var index = animation.index;
						var image = animation.image;
						var frameNumber = animation.frameNumber;

						CTX.drawImage(image,
							index * (image.width / frameNumber),
							0,
							(image.width / frameNumber),
							image.height,
							0, 0, this.width, this.height
						);
					//} else {
					//	CTX.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
					//}

					var blink = this.blink;

					if (blink) {
						image = image.hitImage;
						CTX.globalAlpha = blink;
						CTX.drawImage(image,
							index * (image.width / frameNumber),
							0,
							(image.width / frameNumber),
							image.height,
							0, 0, this.width, this.height
						);
					}

					CTX.restore();
				},

				hit: function(ATK) {

					if (!this.imortal) {
						this.blink = 1;
						setTransform(this, 'blink', 0, 250);
						Audios.brickHit.play();
						this.live.add(-ATK);

						if (this.live.value) {
							//setAnimation(this, Images.ani_slime_angry, 62, 62);
							//this.onAnimation = true;
							setProps(this, {
								scaleX: 1.4,
								scaleY: 0.6
							});
							setKeyframes(this, Brick.prototype.keyframeSet.hit);
							this.canvas.launchUpdate(this);
						}
					}
				},

				revive: function() {

					var bricks = this.bricks;

					for (var i = 0, l = bricks.length; i < l; i++) {
						bricks[i].live.set(1, false);
					}

					this.display = true;
					this.opacity = 0;
					setTransform(this, 'opacity', 1, 500);
					this.canvas.launchUpdate(this);
				},

				destroy: function() {

					var bricks = this.bricks;

					for (var i = 0, l = bricks.length; i < l; i++) {
						bricks[i].live.set(0, false);
					}

					this.zIndex = 1;
					this.toY = this.height / 2;

					var power = Size.power / 60;
					var wayX = Math.random() > 0.5 ? 1 : -1;

					new Animator(this).setProps({
						wayX: wayX,
						xDelta: Math.random() * power * 0.2,
						yDelta: Math.random() * power,
						scale: 1,
						scaleDelta: Math.random() / 60,
						rotateZDelta: Math.random() * power / 2 * wayX
					})
					.setUpdater(function(TARGET) {

						var scale = this.scale += this.scaleDelta;
						var increseX = this.xDelta * scale;
						var increseY = this.yDelta * scale;
						var colorCode = this.colorCode;

						TARGET.x += increseX * this.wayX;
						TARGET.y -= increseY;
						TARGET.scaleX = scale;
						TARGET.scaleY = scale;
						TARGET.rotateZ += this.rotateZDelta;

						this.yDelta -= Size.drag / 60;
					})
					.addEndTest(function(TARGET) {

						return TARGET.y >= Size.fieldHeight;
					})
					.addEndAction(function(TARGET) {

						TARGET.x = TARGET.pX;
						TARGET.y = TARGET.pY;
						TARGET.zIndex = 0;
						TARGET.scaleX = 1;
						TARGET.scaleY = 1;
						TARGET.rotateZ = 0;
						TARGET.toY = TARGET.height;
						TARGET.display = false;
						TARGET.canvas.launchRender();

						setTimeout(function() {

							TARGET.live.set(10);
							console.log(TARGET)
						}, 2000);
					})
					.launch();
				},
			};

			function Bullet(SIDE, ATTACK_POWER, PROPS) {

				this.x = 0;
				this.y = Size.ballFloor;
				this.width = Size.bulletWidth;
				this.height = Size.bulletHeight;
				this.scale = 1;
				this.rotateZ = 0;
				this.degree = 90; // (left)180 to 0(right)
				this.image = Images.bullet_ironBall;
				this.color = '#FFFFFF';
				this.attackPower = ATTACK_POWER || 1;
				this.speed = Size.bulletSpeed;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				this.toX = this.width / 2;
				this.toY = this.height / 2;
				this.display = true;
				// initialize
				this.x = bulletStateHelper.getInitialX(this, SIDE);
				EffectFieldCanvas.appendSprite(this);
				this.canvas.launchUpdate(this);
			}

			Bullet.prototype = {
				constructor: Bullet,

				update: function() {

					var power = this.speed;
					var degree = this.degree;
					var wayX = degree <= 90 ? 1 : -1;
					var rateY = (wayX > 0 ? degree : (180 - degree)) / 90;
					var increseY = power * rateY;
					//var y = this.y.value + increseY;
					var y = this.y - power;
					var increseX = (power - increseY) * wayX;
					var x = this.x + increseX;

					if (y <= 0) { // ceiling touched
						this.destroy();
						return true;
					} else {
						var brickHeight = Size.brickHeight;
						var sY = y / brickHeight;
						var is_underBrickRegion = sY >= BrickY;

						if (!is_underBrickRegion) {
							if (sY < 0) {
								sY = 0;
							} else {
								sY = Math.floor(sY);
							}
							var eY = (y + this.height) / brickHeight;
							if (eY >= BrickY) {
								eY = BrickY - 1;
							} else {
								eY = Math.floor(eY);
							}
							var width = this.width;
							var sX = x / brickHeight;
							if (sX < 0) {
								sX = 0;
							} else {
								sX = Math.floor(sX);
							}
							var eX = (x + width) / Size.brickWidth;
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

									if (brick.live.value) { // > 0
										TouchedBricks.push(brick);
									}
								}
							}
							// at least one brick touched
							var brickNumber = TouchedBricks.length;

							if (brickNumber) {
								for (i = 0; i < brickNumber; i++) {
										TouchedBricks[i].hit(this.attackPower, 2); // direction is bottom
								}
								// clear TouchedBricks
								for (i = 0; i < brickNumber; i++) {
									TouchedBricks.pop();
								}
								// destroy bullet
								this.destroy();
								return true;
							}
						}
					}

					this.x = x;
					this.y = y;
				},

				render: function(CTX) {

					var scale = this.scale;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);
					CTX.rotate(this.rotateZ * Math.PI / 180);
					CTX.translate(-toX * scale, -toY * scale);
					CTX.scale(scale, scale);

					var image = this.image;

					if (image) {
						CTX.drawImage(image,
							0, 0, image.width, image.height,
							0, 0, this.width, this.height
						);
					} else {
						CTX.fillStyle = this.color;
						CTX.fillRect(0, 0, this.width, this.height);
					}

					CTX.restore();
				},

				destroy: function() {

					this.canvas.removeSprite(this);
				}
			};

			var bulletStateHelper = {

				getInitialX: function(BULLET, SIDE) {

					var x = Paddle.x.value;
					var bulletWidth = BULLET.width;

					if (SIDE === -1) { // left
						x += bulletWidth;
					} else if (SIDE === 1) { // right
						x += Paddle.width.value - bulletWidth * 2;
					} else { // 0, center
						x += (Paddle.width.value - bulletWidth) / 2;
					}

					return x;
				}
			};

			var BulletMode = {

				timer: void 0,

				onMode: void 0,

				count: 0,

				times: 0,

				start: function(MODE_NAME) {

					clearInterval(this.timer);

					var mode = this.modes[MODE_NAME];

					this.onMode = mode;
					this.count = 0;
					this.times = mode.times;
					this.fire();
					this.timer = setInterval(this.fire, mode.latency);
				},

				fire: function() {

					BulletMode.onMode.fire();

					if (++BulletMode.count === BulletMode.times) { // end of firing
						clearInterval(BulletMode.timer);

						var whenCease = BulletMode.onMode.whenCease;

						if (whenCease) {
							whenCease();
						}
					}
				},

				modes: {

					laser: {

						latency: 500,

						times: 5,

						attackPower: 2,

						audio: Audios.laser_fire,

						fire: function() {

							var attackPower = this.attackPower;

							new Bullet(-1, attackPower, {
								width: Size.bulletWidth / 2,
								height: Size.bulletHeight * 2,
								image: void 0,
								color: '#FF0000'
							});
							new Bullet(1, attackPower, {
								width: Size.bulletWidth / 2,
								height: Size.bulletHeight * 4,
								image: void 0,
								color: '#FF0000'
							});
							this.audio.currentTime = 0;
							this.audio.play();
						}
					},

					machineGun: {

						latency: 100,

						times: 50,

						attackPower: 1,

						audio: Audios.machineGun_fire,

						fire: function() {

							new Bullet(0, this.attackPower);
							this.audio.currentTime = 0;
							this.audio.play();
						}
					},

					shotgun: {

						latency: 1000,

						times: 10,

						attackPower: 0.5,

						audio: Audios.shotgun_fireReload,

						rangeDegree: 90,

						number: 9,

						fire: function() {

							var rangeDegree = this.rangeDegree;
							var margin = (180 - rangeDegree) / 2;
							var attackPower = this.attackPower;
							var ballFloor = Size.ballFloor;
							var rangeY = Size.ballDiameter * 2;

							for (var i = 1, l = this.number; i <= l; i++) {
								var degree = Math.random() * rangeDegree + margin;

								new Bullet(0, attackPower, {
									y: ballFloor + Math.random() * rangeY,
									degree: degree
								});
							}

							new SmokeLauncher(
								Paddle.x.value,
								Size.fieldHeight - Size.paddleRailHeight + Size.paddleY - Images.smoke0.height / 2
							);
							this.audio.play();
						}
					}
				}
			};

			function Buff(BRICK) {

				this.x = BRICK.x;
				this.y = BRICK.y;
				this.zIndex = 0;
				this.width = Size.brickWidth;
				this.height = Size.brickHeight;
				this.toX = 0;
				this.toY = 0;
				this.scaleX = 1;
				this.scaleY = 1;
				this.opacity = 1;
				this.onTransform = 0;
				this.transforms = {
					x: [],
					y: [],
					width: [],
					height: [],
					scaleX: [],
					scaleY: [],
					opacity: []
				};
				this.image = Images.buff;
				this.catched = false;
				this.display = true;

				EffectFieldCanvas.appendSprite(this);
				EffectFieldCanvas.launchUpdate(this);
			}

			Buff.prototype = {
				constructor: Buff,

				update: function() {

					if (this.catched) {
						var opacity = this.opacity -= 0.05;

						if (opacity <= 0) {
							this.destroy();
							return true;
						}
					} else {
						var y = this.y += Size.power / 180;

						if (y >= Size.ballFloor && y <= Size.ballFloor + Size.ballDiameter + Size.paddleHeight) {
							var paddleStateX = Paddle.x;
							var paddleX = paddleStateX.value;
							var paddleWidth = Paddle.width.value;
							var paddleRight = paddleX + paddleWidth;
							var x = this.x;

							if (x + this.width >= paddleX && x <= paddleRight) { // catched
								var buffNumber = buffSet.buffs.length;
								var r = Math.random();
								var index = Math.floor(r * buffNumber);

								buffSet.exec(index);
								this.catched = true;
							}

							return;
						}

						if (y >= Size.fieldHeight) {
							this.destroy();
							return true;
						}
					}
				},

				render: function(CTX) {

					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);
					CTX.rotate(this.rotateZ * Math.PI / 180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;

					var image = this.image;

					if (image) {
						CTX.drawImage(image,
							0, 0, image.width, image.height,
							0, 0, this.width, this.height
						);
					} else {
						CTX.fillStyle = this.color;
						CTX.fillRect(0, 0, this.width, this.height);
					}

					CTX.restore();
				},

				destroy: function() {

					this.canvas.removeSprite(this);
				}
			};

			var buffSet = { // duration unit is second

				exec: function(INDEX) {

					var buff = this.buffs[INDEX];
					var end = buff.end;

					buff.buff();

					if (end) {
						clearTimeout(buff.timer);
						buff.timer = setTimeout(end, buff.duration * 1000);
					}
				},

				buffs: [
					{
						name: 'extend',

						timer: void 0,

						duration: 10,

						buff: function() {

							Paddle.extend(1.8);
						},

						end: function() {

							Paddle.extend(1);
						}
					},

					{
						name: 'addBall',

						buff: function() {

							new Ball(Math.random() * 90);
						}
					},

					{
						name: 'laserGun',

						buff: function() {

							BulletMode.start('laser');
						}
					},

					{
						name: 'shotgun',

						buff: function() {

							BulletMode.start('shotgun');
						}
					},

					{
						name: 'machineGun',

						buff: function() {

							BulletMode.start('machineGun');
						}
					},
				]
			};

			function SmokeLauncher(X, Y, PROPS) {

				this.x = X;
				this.y = Y;
				this.latency = 24;
				this.number = 15;
				this.smokeProps = void 0;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				var self = this;

				this.timer = setInterval(function() {

					self.progress();
				}, this.latency);

				new Smoke(Y, this.smokeProps);
			}

			SmokeLauncher.prototype = {
				constructor: SmokeLauncher,

				progress: function() {

					if (!this.number) { // end
						clearInterval(this.timer);
					} else {
						new Smoke(this.y, this.smokeProps);
						this.number--;
					}
				}
			};

			function Smoke(Y, PROPS) {

				var image = Images['smoke' + (Math.random() > 0.5 ? 0 : 1)];
				var width = image.width / 1;
				var height = image.height / 1;

				this.image = image;
				this.x = Paddle.x.value + (Paddle.width.value - width) / 2;
				this.y = Y;

				var wayX = Math.random() > 0.5 ? 1 : -1;

				this.dX = Math.random() * 1.5 * wayX;
				this.dY = -(Math.random() + 1) * Size.power / 100;
				this.width = width;
				this.height = height;
				this.toX = image.width / 2;
				this.toY = image.height / 2;
				this.scaleX = 0;
				this.scaleY = 0;
				this.dScaleX = 0.025;
				this.dScaleY = 0.025;
				this.rotateZ = Math.random() * 360;
				this.dRotateZ = 5 * wayX;
				this.opacity = 1;
				this.dOpacity = -0.04;
				this.display = true;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				EffectFieldCanvas.appendSprite(this);
				EffectFieldCanvas.launchUpdate(this);
			}

			Smoke.prototype = {
				constructor: Smoke,

				update: function() {

					this.x += this.dX;
					this.y += this.dY;
					this.scaleX += this.dScaleX;// * Math.random();
					this.scaleY += this.dScaleY;// * Math.random();
					this.rotateZ += this.dRotateZ;
					//this.opacity += this.dOpacity;
					this.opacity *= 0.94;

					this.dY *= 0.94;
					this.dOpacity *= 0.98;

					if (this.opacity <= 0.01) {
						this.destroy();
						return true;
					}
				},

				render: function(CTX) {

					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);
					CTX.rotate(this.rotateZ * Math.PI / 180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;

					var image = this.image;

					CTX.drawImage(image,
						0, 0, image.width, image.height,
						0, 0, this.width, this.height
					);
					CTX.restore();
				},

				destroy: function() {

					this.canvas.removeSprite(this);
				}
			};

			// system
			var system = {

				autoPlay: false,

				init: function() {

					new Ball();

					var bg = new BrickGroup(4, 2, 3, 3);
					console.log(bg);
					FieldCanvas.appendSprite(bg);
					bg.live.set(20);
					setAnimation(bg, Images.ani_knight_idle, 62, 62);
					bg.onAnimation = true;
					FieldCanvas.launchUpdate(bg);

					for (var i = 0; i < BrickX; i++) {
						for (var j = 0; j < BrickY; j++) {
							var live = Bricks[i][j].live;

							if (!live.value) {
								live.add(Math.random() > 0.5 ? 2 : 0);
							}
						}
					}

					setInterval(function() {

						for (var i = 0; i < Bricks.length; i++) {
							for (var j = 0; j < Bricks[i].length; j++) {
								var brick = Bricks[i][j];

								if (brick.live.value) {
									var r = Math.random();

									if (r > 0.98) {
										brick.onAnimation = true;
										setKeyframes(brick, brick.keyframeSet.idle);
										brick.canvas.launchUpdate(brick);
									} else if (r > 0.7) {
										brick.onAnimation = true;
										brick.canvas.launchUpdate(brick);
									} else if (r < 0.3) {
										brick.onAnimation = false;
									}
								}
							}
						}
					}, 3000);
				},

				failed: function() {

					ballRender.stop();
					Paddle.destroy();
					Audios.systemFailed.play();

					setTimeout(function() {

						Paddle.revive();
						new Ball();
					}, 2000);
				}
			};

			function init() {

				installCSS();
				generateObjects();
				sizeCalculating();
				resizeObjects();
				generateBricks();
				Brick.prototype.generateKeyframeSet();
				system.init();

				window.addEventListener('resize', function() {

					sizeCalculating();
					resizeObjects();
				});

				document.addEventListener('mousemove', Paddle.adaptToCursor);

				document.addEventListener('keyup', function(e) {

					var key = e.key;

					if (key === '1') {
						Paddle.extend(1.8);
					} else if (key === '2') {
						Paddle.extend(1);
					} else if (key === '3') {
						console.log('add ball');
						var degree = Math.round(Math.random() * (75 - 30)) + 30;

						new Ball(degree);
					} else if (key === '4') {
						console.log('auto play');
						system.autoPlay = !system.autoPlay;
						Info_autoPlay.setText(system.autoPlay ? 'Auto play mode: true' : 'Auto play mode: false');
					} else if (key === '5') {
						console.log('laser');
						BulletMode.start('laser');
					} else if (key === '6') {
						console.log('shotgun');
						BulletMode.start('shotgun');
					} else if (key === '7') {
						console.log('machineGun');
						BulletMode.start('machineGun');
					} else if (key === '8') {
						console.log('smoke');

						new SmokeLauncher(Paddle.x.value, Size.fieldHeight - Size.paddleRailHeight * 2);
					} else if (key === ' ') { // space
						ballRender.launch();
					} else if (key === 'Escape') {
						//nwin.close();
					}
				});
			}

			init();
		});
	});

//})();