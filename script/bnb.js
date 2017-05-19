(function() {

	var PIDivided180 = Math.PI / 180;

	window.addEventListener('load', function() {

		Rl
		.setImagePath('./image/')
		.setAudioPath('./audio/')
		.loadImages(
			['rect_1x2_black_5', 'rect_1x2_black_5.png'],
			['smoke0', 'smoke0.png'],
			['smoke1', 'smoke1.png'],
			['bomb', 'bomb.png'],
			['wormhole', 'wormhole.png'],
			['explosion0', 'explosion0.png'],
			['explosion1', 'explosion1.png']
		)
		.loadAudios(
			['systemFailed', 'system_failed.wav'],
			['paddleExtend', 'paddle_extend.wav'],
			['paddleExtendEnd', 'paddle_extendEnd.wav'],
			['paddleBounce', 'paddle_bounce.wav'],
			['brickHit', 'brick_hit.wav'],
			['brickCatch', 'brick_catch.wav'],
			['mineHit', 'mine_hit.wav'],
			['jellyHit', 'jelly_hit.wav'],
			['shotgun_fireReload', 'shotgun_fireReload.wav'],
			['machineGun_fire', 'machineGun_fire.wav'],
			['laser_fire', 'laser_fire.wav'],
			['mine_explosion', 'mine_explosion.wav']
		)
		.whenProgress(function(PROGRESS) {

			console.log(
				'Last loaded: [' + PROGRESS.type + ']' + PROGRESS.name + '\n' +
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

			// render image blink
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

				Images[imgName + '_blink'] = tempCanvas.entity;
				Images[imgName].blinkImage = tempCanvas.entity;
			}

			// size
			var Size = {};
			var BaseRatio = 2.5;
			var BallDiameter = 2;
			var Ratio = { // base is vh(1% of innerHeight)

				power: 75, // innerHeight

				fieldWidth: 120,
				fieldHeight: 100,

				infoPanelWidth: 40,

				haloWidth: 3,

				ballDiameter: BallDiameter,
				ballRadius: BallDiameter / 2,
				ballFloor: 90 - BallDiameter, // paddleY - ballDiameter

				buffWidth: 4,
				buffHeight: 4,
				buffMove: 10,
				buffFloor: 90 - 4, // paddleY - buffHeight

				paddleY: 90,
				paddleWidth: BallDiameter * 6, // 6x ballDiameter
				paddleHeight: BallDiameter,

				bulletSpeed: 1.5,
				bulletWidth: 1.5,
				bulletHeight: 1.5,

				smokeRadius: 5 * BaseRatio,
				//smokeDiameter: smokeRadius * 2,

				brickRegionWidth: 120,
				brickRegionHeight: 60,
				brickWidth: BaseRatio,
				brickHeight: BaseRatio,

				drag: 0.75,

				// bomb
				explosionRegionRadius: 4, // radius, unit: BaseRatio
				//explosionRadius: explosionRegionRadius * BaseRatio,
				//explosionDiameter: explosionRadius * 2,

				editorTopRegionHeight: 6,
			};

			function sizeCalculating() {

				//var height = Math.min(innerHeight, 768);
				var height = innerHeight;
				var vh = height / 100;
				var r = Ratio;
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

				s.paddleBottom = s.paddleY + s.paddleHeight;

				s.smokeDiameter = s.smokeRadius * 2;

				s.explosionRadius = s.explosionRegionRadius * BaseRatio;
				s.explosionDiameter = s.explosionRadius * 2;

				s.jellyFloor_paddle = s.paddleY - s.brickHeight;
				s.jellyFloor_field = s.fieldHeight - s.brickHeight;

				console.log(Size);
			}

			function resizeObjects() {

				var s = Size;
				var fieldHolderWidth = s.fieldWidth + s.infoPanelWidth;

				FieldHolder.setStyles({
					width: fieldHolderWidth + 'px',
					left: (innerWidth - fieldHolderWidth) / 2 + 'px'
				});

				FieldCanvas.resize(s.fieldWidth, s.fieldHeight);

				InfoHolder.setStyle('width', s.infoPanelWidth + 'px');

				setProps(Paddle, {
					y: s.paddleY,
					originWidth: s.paddleWidth,
					width: s.paddleWidth,
					height: s.paddleHeight,
					toY: s.paddleHeight // bottom
				});

				for (var i = 0, l = Balls.length; i < l; i++) {
					Balls[i].y.set(Size.ballFloor);
				}

				BallGhost.prototype.generateImage();
			}

			function installCSS() {

				var r = Ratio;

				var css = Md.Css(ScopeName)
				.addSelector({
					body: {
						overflow: 'hidden'
					},

					'.fieldHolder': {
						position: 'absolute',
						height: '100%',
						'background': 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))',
						//'background': '#999',

						'> *': {
							position: 'absolute',
							'will-change': 'transform',
							//'image-rendering': 'pixelated'

							'&.explosionShock': {
								'animation-name': 'explosionShock',
								'animation-duration': '1000ms',
								'animation-iteration-count': 1
							},
						},

						'> .infoHolder': {
							right: 0,
							height: '100%',
							'background-color': '#333333',

							'> *': {
								color: '#FFFFFF'
							}
						},

						'> .interlacedFilter': {
							width: '100%',
							height: '100%',
							background: 'url(./image/rect_1x2_white_5.png)',
							'image-rendering': 'pixelated'
						}
					}
				});

				var explosionShock = {};
				var frameNumber = 30;
				var range = 0.4; // vh

				for (var i = 0; i < frameNumber - 1; i++) {
					var step = (100 / frameNumber * i) + '%';
					var wX = Math.random() > 0.5 ? 1 : -1;
					var wY = Math.random() > 0.5 ? 1 : -1;

					explosionShock[step] = {
						transform: 'translate3d(' + (range * wX) + 'vh,' + (range * wY) + 'vh,0px)'
					};

					range *= 0.98;
				}

				explosionShock['100%'] = {
					transform: 'translateY(0)'
				};

				css.addKeyframe('explosionShock', explosionShock);
				css.mount();
			}

			// object
			var Holder,
				FieldHolder, Field, FieldCanvas, PassiveFieldCanvas,
				InfoHolder, InfoText;

			function generateObjects() {

				FieldHolder = mdom().startScope(ScopeName).addClass('fieldHolder')
				.appendChildren(

					PassiveFieldCanvas = mdom(null, 'canvas'),

					Field = mdom(null, 'canvas'),

					InfoHolder = mdom().addClass('infoHolder')
					.appendChildren(

						InfoText = mtext('')
					),

					mdom().addClass('interlacedFilter')
				)
				.mount(document.body);

				// generate Canvas
				FieldCanvas = new Canvas(Field.entity);
				FieldCanvas.installPassiveCanvas(PassiveFieldCanvas.entity);

				// generate sprite
				FieldCanvas.appendSprite(Paddle);

				/*InfoHolder = mdom().addClass('infoHolder')
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
				)*/
			}

			function Canvas(CANVAS) {

				var ctx = CANVAS.getContext('2d');

				this.entity = CANVAS;
				this.ctx = ctx;
				this.width = CANVAS.width;
				this.height = CANVAS.height;
				this.sprites = [];
				this.launchTime = 0;
				this.lastFrameIndex = 0;
				this.onProgress = false;
				this.progress = this.progress.bind(this);
				this.passiveCanvas = void 0;
				this.passiveCtx = void 0;
				this.onRenderPassiveCanvas = false;
			}

			Canvas.prototype = {
				constructor: Canvas,

				installPassiveCanvas: function(CANVAS) {

					this.passiveCanvas = new PassiveCanvas(CANVAS, this);
					this.passiveCtx = CANVAS.getContext('2d');

					return this;
				},

				resize: function(WIDTH, HEIGHT) {

					var entity = this.entity;

					this.width = entity.width = WIDTH;
					this.height = entity.height = HEIGHT;

					var passiveCanvas = this.passiveCanvas;

					if (passiveCanvas) {
						passiveCanvas.resize(WIDTH, HEIGHT);
					}
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

				removeSprite: function(SPRITE, INDEX) {

					var sprites = this.sprites;
					var index = INDEX !== void 0 ? INDEX : sprites.indexOf(SPRITE);

					SPRITE.canvas = void 0;
					sprites.splice(index, 1);

					if (SPRITE.isPassive) {
						this.toRenderPassiveCanvas = true;
					}

					return this;
				},

				launch: function() {

					this.launchTime = Date.now();
					this.onProgress = requestAnimationFrame(this.progress);
				},

				stop: function() {

					cancelAnimationFrame(this.onProgress);
					this.onProgress = false;
				},

				progress: function() {

					var now = Date.now();
					var frameIndex = Math.floor((now - this.launchTime) / 16);
					var progress = frameIndex - this.lastFrameIndex;

					if (progress) { // update sprites
						this.lastFrameIndex = frameIndex;

						var sprites = this.sprites;

						for (var i = sprites.length - 1; i >= 0; i--) {
							var sprite = sprites[i];

							if (sprite.isDead) {
								this.removeSprite(sprite, i);
							} else if (!sprite.renderOnly && !sprite.isPassive) {
								sprite.update(progress);
							}
						}
					}
					// render
					this.render();

					if (this.onProgress) { // request next progress
						this.onProgress = requestAnimationFrame(this.progress);
					}
				},

				render: function() {

					var sprites = this.sprites;
					var spriteNumber = sprites.length;
					var width = this.width;
					var height = this.height;
					var i, l, sprite;
					var ctx = this.ctx;

					ctx.clearRect(0, 0, width, height);

					for (i = 0; i < spriteNumber; i++) {
						sprite = sprites[i];

						if (sprite.display) {
							if (!sprite.isPassive) {
								sprite.render(ctx);
							}
						}
					}

					if (this.toRenderPassiveCanvas) {
						var pCtx = this.passiveCtx;

						pCtx.clearRect(0, 0, width, height);

						for (i = 0; i < spriteNumber; i++) {
							sprite = sprites[i];

							if (sprite.display) {
								if (sprite.isPassive) {
									sprite.render(pCtx);
								}
							}
						}

						this.toRenderPassiveCanvas = false;
					}
				},

				setSpritePassive: function(SPRITE, IS_PASSIVE) {

					if (SPRITE.isPassive !== IS_PASSIVE) {
						SPRITE.isPassive = IS_PASSIVE;
						this.toRenderPassiveCanvas = true;
					}
				},

				renderPassiveCanvas: function() {

					var sprites = this.sprites;
					var pCtx = this.passiveCtx;

					for (var i = 0, l = sprites.length; i < l; i++) {
						sprite = sprites[i];

						if (sprite.isPassive && sprite.display) {
							sprite.render(pCtx);
						}
					}
				}
			};

			function PassiveCanvas(CANVAS, TARGET_CANVAS) {

				this.entity = CANVAS;
			}

			PassiveCanvas.prototype = {
				constructor: PassiveCanvas,

				resize: function(WIDTH, HEIGHT) {

					var entity = this.entity;

					this.width = entity.width = WIDTH;
					this.height = entity.height = HEIGHT;
				}
			};

			// common sprite method
			// setProp
			function setProp(SPRITE, PROP_NAME, VALUE) {

				var prop = SPRITE[PROP_NAME];

				if (typeof prop === 'object') { // mstate
					prop.set(VALUE);
				} else {
					SPRITE[propName] = VALUE;
				}
			}

			function setProps(SPRITE, PROPS) {

				for (var propName in PROPS) {
					var prop = SPRITE[propName];
					var value = PROPS[propName];

					if (typeof prop === 'object') { // mstate
						prop.set(value);
					} else {
						SPRITE[propName] = value;
					}
				}
			}

			// setTransform
			function setTransform(SPRITE, PROP_NAME, TARGET_VALUE, DURATION) {

				var presentValue = SPRITE[PROP_NAME];
				if (typeof presentValue === 'object') { // mstate
					presentValue = presentValue.value;
				}
				var gap = TARGET_VALUE - presentValue;
				var frameNumber = DURATION / 16 || 1;
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
				this.forceStop = false;

				SPRITE.onAnimator = true;
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

					this.update = this.update.bind(this);
					requestAnimationFrame(this.update);
				},

				stop: function(EXECUTE_END_ACTION) {

					var target = this.target;

					this.forceStop = true;

					if (EXECUTE_END_ACTION) {
						var  endActions = this.endActions;

						for (var i = 0, l = endActions.length; i < l; i++) {
							endActions[i](target);
						}

					}

					target.onAnimator = false;
					this.target = void 0;
				},

				update: function() { // launchUpdate?

					if (system.isPause) {
						requestAnimationFrame(this.update);
					} else {
						var target = this.target;
						var canvas = target.canvas;

						this.updater(target);

						if (this.forceStop) {
							return;
						}

						var isEnd = this.endTesting();

						if (isEnd) {
							var  endActions = this.endActions;

							for (var i = 0, l = endActions.length; i < l; i++) {
								endActions[i](target);
							}

							target.onAnimator = false;
							this.target = void 0;
						} else { // request next update
							requestAnimationFrame(this.update);
						}
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

				init: function() {

					document.addEventListener('pointerlockchange', function() {

						if (document.pointerLockElement === FieldCanvas.entity) {
							document.addEventListener('mousemove', Paddle.updateX);
						} else {
							document.removeEventListener('mousemove', Paddle.updateX);
						}
					});

					FieldHolder.addEventListener('requestPointerLock', 'click', function() {

						if (document.pointerLockElement !== FieldCanvas.entity) {
							FieldCanvas.entity.requestPointerLock();
						} else {
							BallUpdater.launchBall();
						}
					});

					Paddle.x.set(Size.fieldWidth / 2);
				},

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

					Paddle.recordX();

					if (this.onTransform) {
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
					CTX.shadowBlur = Size.haloWidth;
					CTX.shadowColor = '#FFFFFF';
					CTX.fillStyle = '#FFFFFF';
					CTX.fillRect(0, 0, this.width.value, this.height);
					CTX.restore();
				},

				// action
				extend: function(SCALE) { // modify width

					setTransform(this, 'width', this.originWidth * SCALE, 500);
					// audio
					if (SCALE > 1) {
						Audios.paddleExtend.play();
					} else {
						Audios.paddleExtendEnd.play();
					}
				},

				bounce: function() {

					setKeyframes(this, this.keyframeSet.bounce);
					// audio
					Audios.paddleBounce.play();
				},

				keyframeSet: {
					bounce: (function() {

						var deltaX = 0.4;
						var deltaY = -0.4;
						var duration = 160;
						var keyframes = [{
							props: {
								scaleX: 1 + deltaX,
								scaleY: 1 + deltaY
							},

							duration: 0
						}];

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

					this.alive = false;
					this.toY = this.height / 2;
					setTransforms(this, {
						scaleX: 2,
						scaleY: 2,
						opacity: 0
					}, 500);
				},

				revive: function() {

					this.alive = true;
					this.toY = this.height;
					this.scaleX = 1;
					this.scaleY = 1;
					setTransform(this, 'opacity', 1, 500);
				},

				// adaptToCursor
				onMove: false,

				updateX: function(e) {
					// this function has throttle
					if (Paddle.alive) {
						Paddle.x.add(e.movementX);
					}
				},

				recordX: function() {

					var x = Paddle.x;

					x.push(x.value);
				}
			};

			// ball
			var Balls = [];
			var BallAttackPower = mstate(1);

			function Ball(DEGREE, X, Y) {

				var x = mstate(0, null, GhostNumber);
				var y = mstate(0, null, GhostNumber);
				var degree = mstate(75).setTarget(this).addHandler({ handler: ballStateHelper.degreeHandler });

				this.degree = degree;
				this.x = x;
				this.y = y;
				this.wayX = 1;
				this.wayY = -1;
				this.rotateZ = mstate(0, null, GhostNumber);
				this.display = true;
				this.renderOnly = true;

				// initializing
				if (DEGREE) {
					degree.set(DEGREE);
				}

				if (X || Y) {
					x.value = x.prevValues[0] = X;
					y.value = y.prevValues[0] = Y;

					if (BallUpdater.adaptToPaddle) {
						BallUpdater.launchBall();
					}
				} else if (Balls.length) {
					var ball = Balls[0];
					var xValue = ball.x.value;
					var yValue = ball.y.value;
					
					x.value = x.prevValues[0] = xValue;
					y.value = y.prevValues[0] = yValue;
				} else {
					x.value = x.prevValues[0] = Paddle.x.value + (Paddle.width.value - Size.ballDiameter) / 2;
					y.value = y.prevValues[0] = Size.ballFloor - 1; // prevent paddle bounce
				}

				this.ghost = new BallGhost(this);
				FieldCanvas.appendSprite(this);
				Balls.push(this);
			}

			var TouchedBricks = []; // for Ball.update(), Bullet.process()

			Ball.prototype = {
				constructor: Ball,

				update: function(PPS) { // processes per second

					var ballPower = Size.ballPower;
					var power = ballPower / PPS;
					var ballDiameter = Size.ballDiameter;
					var ballRadius = Size.ballRadius;
					var wayX = this.wayX;
					var wayY = this.wayY;
					var degree = this.degree.value;
					var prevBallX = this.x.value;
					var prevBallY = this.y.value;
					var powerY = degree / 90 * power;
					var powerX = power - powerY;
					var dY = powerY * wayY;
					var dX = powerX * wayX;
					var dRotateZ = dX;
					var ballX = prevBallX + dX;
					var ballY = prevBallY + dY;
					var rotateZ = this.rotateZ.value + dRotateZ;
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
						this.degree.add(getRandomWay() * 0.5); // to prevent infinity loop
						this.justGoThroughWormhole = false;
					}

					// ceiling and paddle touched
					if (ballY <= 0) { // ceiling touched
						wayY = 1;
						collidedEdge = 0;
						gap = ballY - collidedEdge;
						ballY -= gap * 2;
						this.justGoThroughWormhole = false;
					} else {
						var ballFloor = Size.ballFloor;

						if (ballY >= ballFloor) {
							// autoPlay
							if (system.autoPlay) {
								setProp(Paddle, 'x', ballX - Paddle.width.value / 2);
							}

							if (prevBallY <= Size.paddleBottom) { // above paddle
								var paddleStateX = Paddle.x;
								var paddleX = paddleStateX.value;
								var paddleWidth = Paddle.width.value;
								var paddleRight = paddleX + paddleWidth;

								if (ballCX >= paddleX && ballCX <= paddleRight) { // catched
									wayY = -1;
									collidedEdge = ballFloor;
									gap = ballY - collidedEdge;
									ballY -= gap * 2;

									// update degree
									var paddleXGap = paddleX - paddleStateX.get(-PreviousIndex);

									degree += paddleXGap * wayX * Paddle.friction;
									// restore power

									// paddle reaction
									Paddle.bounce();
								}
							} else if (ballY >= Size.fieldHeight) { // out of vision, destroy ball
								this.destroy();
								return;
							} else if (ballY >= (Size.jellyFloor_field - ballDiameter)) {
								var jellys = Jellys;

								for (var j = 0, jl = jellys.length; j < jl; j++) {
									var jelly = jellys[j];
									var jellyX = jelly.x;

									if ((ballCX >= jellyX) && (ballCX <= jellyX + Size.brickWidth)) {
										wayY = -1;
										collidedEdge = Size.jellyFloor_field - ballDiameter;
										gap = ballY - collidedEdge;
										ballY -= gap * 2;
										jelly.hit(1);
										break;
									}
								}
							}

							this.justGoThroughWormhole = false;
							this.updateState(wayX, wayY, ballX, ballY, rotateZ, degree);
							return;
						}
					}

					// bricks
					// get region start, end x, y
					var brickHeight = Size.brickHeight;
					var sY = ballY / brickHeight;
					var is_underBrickRegion = sY >= BrickY;

					if (is_underBrickRegion) {
						this.updateState(wayX, wayY, ballX, ballY, rotateZ);
						return;
					}
					
					var eY = (ballY + ballDiameter) / brickHeight;

					sY = Math.floor(sY);
					if (eY >= BrickY) {
						eY = BrickY - 1;
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
					}
					// start detect
					// get brick regions around ball
					var brick;

					for (var x = sX; x <= eX; x++) {
						var brickXs = Bricks[x];

						for (var y = sY; y <= eY; y++) {
							brick = brickXs[y];

							if (brick && !brick.isDead) {
								TouchedBricks.push(brick);
							}
						}
					}
					// at least one brick touched
					var brickNumber = TouchedBricks.length;

					if (brickNumber) {
						var i;

						if (ThruMode.active) {
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

							if (closestBrick.constructor === Wormhole) {
								if (!this.justGoThroughWormhole) {
									var targetWormhole = Wormholes[closestBrick.wormholeId ? 0 : 1];

									ballX = targetWormhole.x;
									ballY = targetWormhole.y;
									this.justGoThroughWormhole = true; // to avoid instant back
								}
							} else {
								// adjust ball location and update way direction
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
								closestBrick.hit(
									BallAttackPower.value,
									ballPower,
									degree,
									this.wayX,
									this.wayY
								);

								this.justGoThroughWormhole = false;
							}
						}
							
						// clear TouchedBricks
						for (i = 0; i < brickNumber; i++) {
							TouchedBricks.pop();
						}
					}

					this.updateState(wayX, wayY, ballX, ballY, rotateZ);
				},

				updateState: function(WAY_X, WAY_Y, X, Y, ROTATE_Z, DEGREE) {

					this.wayX = WAY_X;
					this.wayY = WAY_Y;
					this.x.set(X, false); // set value only
					this.y.set(Y, false);
					this.rotateZ.set(ROTATE_Z, false);

					if (DEGREE !== void 0) {
						this.degree.set(DEGREE);
					}
				},

				render: function(CTX) {

					var radius = Size.ballRadius;

					CTX.save();
					CTX.beginPath();
					CTX.arc(this.x.value + radius, this.y.value + radius, radius, 0, Math.PI * 2);
					CTX.fillStyle = '#FFFFFF';
					CTX.fill();
					CTX.restore();
				},

				render2: function(CTX) {

					var ballRadius = Size.ballRadius;
					var ballDiameter = Size.ballDiameter;

					CTX.save();
					CTX.translate(this.x.value + ballRadius, this.y.value + ballRadius);
					CTX.rotate(this.rotateZ.value * PIDivided180);
					CTX.translate(-ballRadius, -ballRadius);
					CTX.fillStyle = '#FFFFFF';
					CTX.fillRect(0, 0, ballDiameter, ballDiameter);
					CTX.restore();
				},

				destroy: function() { // last move

					this.isDead = true;
					this.ghost.destroy();
					// remove self from Balls
					Balls.splice(Balls.indexOf(this), 1);
					
					if (!Balls.length) { // this ball is the last ball
						system.failed();
					}
				}
			};

			var ballStateHelper = {

				degreeHandler: function() {

					var degree = this.value;
					var min = 15;
					var max = 75;

					if (degree > max) {
						degree = this.value = max - (degree - max);
						this.target.wayX *= -1;
					}

					if (degree < min) {
						this.value = min;
					}
				}
			};

			var GhostNumber = 90;
			var GhostDrawNumber = 30;
			var GhostDrawRatio = Math.floor(GhostNumber / GhostDrawNumber);

			function BallGhost(BALL) {

				this.x = BALL.x;
				this.y = BALL.y;
				this.rotateZ = BALL.rotateZ;
				this.display = true;
				this.renderOnly = true;

				FieldCanvas.appendSprite(this);
			}

			BallGhost.prototype = {
				constructor: BallGhost,

				image: void 0,

				imagePadding: 0,

				generateImage: function() {

					var canvas = document.createElement('canvas');
					var ctx = canvas.getContext('2d');
					var diameter = Size.ballDiameter;
					var haloWidth = Size.haloWidth;
					var size = diameter + haloWidth * 2;

					canvas.width = canvas.height = size;
					ctx.shadowBlur = haloWidth;
					ctx.shadowColor = '#FFFFFF';
					ctx.beginPath();
					ctx.arc(size / 2, size / 2, Size.ballRadius, 0, Math.PI * 2);
					ctx.fillStyle = '#FFFFFF';
					ctx.fill();

					this.image = canvas;
					this.imagePadding = haloWidth;
				},

				update: function() { // empty

					// do nothing
				},

				render: function(CTX) {

					var xState = this.x;
					var yState = this.y;
					var image = this.image;
					var padding = this.imagePadding;
					var opacity = 0.8;
					var dOpacity = opacity / GhostDrawNumber;
					var scale = 1.25;
					var dScale = scale / GhostDrawNumber;
					var ballRadius = Size.ballRadius;
					var ballDiameter = Size.ballDiameter;

					for (var i = 0; i < GhostNumber; i += GhostDrawRatio) {
						var y = yState.get(-i);

						if (y === void 0) {
							break;
						}

						var x = xState.get(-i);

						CTX.save();
						CTX.translate(x + ballRadius, y + ballRadius);
						CTX.translate(-ballRadius * scale, -ballRadius * scale);
						CTX.scale(scale, scale);
						CTX.globalAlpha = opacity;
						CTX.drawImage(image, -padding, -padding);

						opacity -= dOpacity;
						scale -= dScale;
						CTX.restore();
					}
				},

				render3: function(CTX) {

					var xState = this.x;
					var yState = this.y;
					var rotateZState = this.rotateZ;
					var opacity = 1;
					var scale = 1;
					var ballRadius = Size.ballRadius;
					var ballDiameter = Size.ballDiameter;

					CTX.fillStyle = '#FFFFFF';

					for (var i = 0; i < GhostNumber; i += GhostDrawRatio) {
						var rotateZ = rotateZState.get(-i);

						if (rotateZ === void 0) {
							break;
						}

						var x = xState.get(-i);
						var y = yState.get(-i);

						CTX.save();
						CTX.translate(x + ballRadius, y + ballRadius);
						CTX.rotate(rotateZ * PIDivided180);
						CTX.translate(-ballRadius * scale, -ballRadius * scale);
						CTX.scale(scale, scale);
						CTX.globalAlpha = opacity;
						CTX.fillRect(0, 0, ballDiameter, ballDiameter);
						CTX.restore();

						opacity *= 0.94;
						scale *= 0.96;
					}
				},

				render2: function(CTX) {

					var xState = this.x;
					var yState = this.y;
					var seg = GhostNumber / GhostDrawNumber;
					var l = xState.cap / seg;
					var opacity = 1;
					var scale = 1;
					var ballRadius = Size.ballRadius;
					//var r = 255;
					//var g = 192;
					//var b = 76;
					//var dR = Math.floor((210 - r) / GhostNumber);
					//var dG = Math.floor((105 - g) / GhostNumber);
					//var dB = Math.floor((30 - b) / GhostNumber);
					//var r = 255;
					//var g = 255;
					//var b = 255;
					//var dR = Math.floor((51 - r) / GhostDrawNumber);
					//var dG = Math.floor((153 - g) / GhostDrawNumber);
					//var dB = Math.floor((255 - b) / GhostDrawNumber);

					CTX.save();
					CTX.fillStyle = '#FFFFFF';

					for (var i = 0; i < GhostDrawNumber; i++) {
						var index = i * seg;
						//var x = xState.get(-index) + Math.random() * 6 * (Math.random() > 0.5 ? 1 : -1);
						//var y = yState.get(-index) + Math.random() * 6 * (Math.random() > 0.5 ? 1 : -1);
						var x = xState.get(-index);
						var y = yState.get(-index);

						CTX.beginPath();
						//CTX.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
						CTX.globalAlpha = opacity;
						CTX.arc(
							x + ballRadius, y + ballRadius,
							ballRadius * scale,
							0, 2 * Math.PI
						);
						CTX.fill();

						opacity *= 0.94;
						scale *= 0.96;
						//r += dR;
						//g += dG;
						//b += dB;
					}

					CTX.restore();
				},

				destroy: function() {

					this.isDead = true;
				}
			};

			var BallUpdater = {

				adaptToPaddle: true,

				updateTimer: void 0,

				init: function() {

					this.isPause = false;
					this.updateTimer = setInterval(this.update, 0);
					new Ball();
				},

				launchBall: function() {

					this.lastUpdateTime = Date.now();
					this.adaptToPaddle = false;
				},

				stopBall: function() { // when failed

					this.adaptToPaddle = true;
				},

				lastUpdateTime: 0,

				isPause: true,

				update: function() { // don't use 'this'

					var i;

					if (BallUpdater.adaptToPaddle) {
						var x = Paddle.x.value + (Paddle.width.value - Size.ballDiameter) / 2;

						for (i = 0, l = Balls.length; i < l; i++) {
							Balls[i].x.set(x);
						}
					} else if (!BallUpdater.isPause) {
						var now = Date.now();
						var latency = now - BallUpdater.lastUpdateTime;

						BallUpdater.lastUpdateTime = now;

						var pps = 1000 / latency; // processes per second
						// ball
						for (i = Balls.length - 1; i >= 0; i--) {
							Balls[i].update(pps);
						}
					}
				},

				pause: function() {

					this.isPause = true;
				},

				continue: function() {

					this.isPause = false;
					this.lastUpdateTime = Date.now();
				}
			};

			// brick
			var ColorLevel = 5;
			var ValuePerLevel = Math.round(255 / ColorLevel);
			var MineLiveMultiplier = 3;
			var BrickX = Math.round(Ratio.brickRegionWidth / Ratio.brickWidth);
			var BrickY = Math.round(Ratio.brickRegionHeight / Ratio.brickHeight);
			var Bricks = []; // 2d array

			for (var x = 0; x < BrickX; x++) {
				Bricks.push(new Array(BrickY));
			}

			function Brick(REGION_X, REGION_Y) {

				var width = Size.brickWidth;
				var height = Size.brickHeight;
				var x = REGION_X * width;
				var y = REGION_Y * height;

				this.rX = REGION_X; // region
				this.rY = REGION_Y;
				this.pX = x; // fixed position
				this.pY = y;
				this.cX = x + Size.brickRadiusX; // center
				this.cY = y + Size.brickRadiusY;
				this.x = x;
				this.y = y;
				this.z = 0;
				//this.zIndex = 0;
				this.width = width;
				this.height = height;
				this.toX = Size.brickRadiusX; // center
				this.toY = height; // bottom
				this.scaleX = 1;
				this.scaleY = 1;
				this.rotateZ = 0;
				this.opacity = 1;
				this.blink = 0;
				// when hit
				this.hitPower = 0;
				this.degree = 0;
				this.wayX = 0;
				this.wayY = 0;

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
				this.colors = [0, 0, 0]; // max is 5, 51 * 5 = 255
				this.image = void 0;
				this.onAnimation = false;
				this.animation = {
					lastUpdate: Date.now(),
					index: 0,
					frameNumber: 62,
					fps: 62,
					dpf: 1000 / 62,
					image: Images.ani_slime_idle
				};
				this.onAnimator = false;
				this.isPassive = true;
				this.display = false;
				this.live = mstate(0).setTarget(this)
				.addTrimer(brickStateHelper.liveTrimer)
				.addHandler({ handler: brickStateHelper.liveHandler });
				this.isMine = false;
				this.group = void 0;
			}

			Brick.prototype = {
				constructor: Brick,

				addColor: function(R, G, B) {

					var colors = this.colors;
					var r = colors[0] += R;
					if (r > ColorLevel) {
						r = colors[0] = ColorLevel;
					}
					var g = colors[1] += G;
					if (g > ColorLevel) {
						g = colors[1] = ColorLevel;
					}
					var b = colors[2] += B;
					if (b > ColorLevel) {
						b = colors[2] = ColorLevel;
					}

					this.live.set(r + g + b);

					if (r === g && r === b) {
						this.isMine = true;
						this.live.multiply(5);
					} else {
						this.isMine = false;
					}

					this.installImage();
				},

				setColor: function(R, G, B) {

					var colors = this.colors;
					var r = colors[0] = R;
					if (r > ColorLevel) {
						r = colors[0] = ColorLevel;
					}
					var g = colors[1] = G;
					if (g > ColorLevel) {
						g = colors[1] = ColorLevel;
					}
					var b = colors[2] = B;
					if (b > ColorLevel) {
						b = colors[2] = ColorLevel;
					}
					var liveValue = r + g + b;

					if (liveValue) { // > 0
						var isMine = this.isMine = r === g && r === b;

						if (isMine) {
							liveValue *= MineLiveMultiplier;
						}

						this.live.set(liveValue);

						if (system.renderType === 0) {
							this.installImage();
						} else {
							this.colorValue = 'rgb(' +
								r * ValuePerLevel + ',' +
								g * ValuePerLevel + ',' +
								b * ValuePerLevel + ')';
						}
					}
				},

				images: {},

				imagePadding: 0,

				installImage: function() {

					var colors = this.colors;
					var r = colors[0] * ValuePerLevel;
					var g = colors[1] * ValuePerLevel;
					var b = colors[2] * ValuePerLevel;
					var color = 'rgb(' + r + ',' + g + ',' + b + ')';
					var images = this.images;
					var image = images[color];

					if (!image) {
						var width = Size.brickWidth;
						var height = Size.brickHeight;
						var haloWidth = Size.haloWidth;
						var canvas = document.createElement('canvas');

						canvas.width = width + haloWidth * 2;
						canvas.height = height + haloWidth * 2;

						var ctx = canvas.getContext('2d');
						var gradient = ctx.createLinearGradient(
							haloWidth, 0,
							haloWidth + width, haloWidth + height
						);

						gradient.addColorStop(0, color);
						gradient.addColorStop(0.75, color);
						gradient.addColorStop(1, color);

						var max = Math.max.apply(null, colors);
						var halo = [0, 0, 0];

						for (var i = 0; i < 3; i++) {
							if (colors[i] === max) {
								halo[i] = 255;

								if (i === 2) { // blue is max
									halo[0] = halo[1] = 255 - ValuePerLevel;
								}
							} else {
								halo[i] = 0;
							}
						}

						ctx.translate(haloWidth, haloWidth);

						// main color and halo
						ctx.shadowColor = 'rgb(' + halo[0] + ',' + halo[1] + ',' + halo[2] + ')';
						ctx.shadowBlur = haloWidth;
						ctx.fillStyle = gradient;
						ctx.fillRect(0, 0, width, height);

						// white border
						var lineWidth = width * 0.1;

						ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
						ctx.lineWidth = lineWidth;
						ctx.beginPath();
						ctx.rect(0, 0, width, height);
						ctx.stroke();

						// mine texture
						if (this.isMine) {
							var margin = width * 0.2;

							ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
							ctx.beginPath();
							ctx.moveTo(margin, height - margin);
							ctx.lineTo(margin, margin);
							ctx.lineTo(width - margin, margin);
							ctx.stroke();

							ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
							ctx.beginPath();
							ctx.moveTo(width - margin, margin);
							ctx.lineTo(width - margin, height - margin);
							ctx.lineTo(margin, height - margin);
							ctx.stroke();
						}

						image = images[color] = canvas;
						Brick.prototype.imagePadding = haloWidth;
					}

					this.image = image;
				},

				setType: function(TYPE) {

					this.type = TYPE;

					if (TYPE === 1) { // ball
						this.addColor(1, 0, 0);
						this.live.set(1);
					} else if (TYPE === 2) { // bomb
						this.addColor(1, 0, 0);
						this.image = Images.bomb;
						this.live.set(1);
					}
				},

				update: function(PROGRESS) { // min is 1

					var onTransform = this.onTransform;
					var onAnimation = this.onAnimation;
					var onAnimator = this.onAnimator;

					if (!onTransform && !onAnimation && !onAnimator) {
						FieldCanvas.setSpritePassive(this, true);
						return;
					}

					if (onTransform) {
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
					}

					if (onAnimation) {
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

					var imagePadding = this.imagePadding;
					var width = this.width;
					var height = this.height;
					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;
					var image = this.image;

					CTX.save();
					CTX.translate(this.x + toX, this.y + this.z + toY);
					CTX.rotate(this.rotateZ * PIDivided180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;

					if (system.renderType === 0 || this.constructor === JellyBrick) {
						CTX.drawImage(image,
							0, 0, image.width, image.height,
							-imagePadding, -imagePadding, width + imagePadding * 2, height + imagePadding * 2
						); // image has shadowBlur
					} else {
						CTX.beginPath();
						CTX.fillStyle = this.colorValue;
						CTX.rect(0, 0, width - 1, height - 1);
						CTX.fill();
					}

					var blink = this.blink;

					if (blink) {
						CTX.globalAlpha = blink;
						CTX.fillStyle = '#FFFFFF';
						CTX.fillRect(0, 0, width, height);
					}

					CTX.restore();
				},

				hit: function(ATTACK_POWER, POWER, DEGREE, WAY_X, WAY_Y) {

					//if (this.brickGroup) {
					//	this.brickGroup.hit(ATTACK_POWER);
					//}
					var audio = Audios.mineHit;

					FieldCanvas.setSpritePassive(this, false);
					// blink
					this.blink = 1;
					setTransform(this, 'blink', 0, 250);
					// hit
					this.hitPower = POWER;
					this.degree = DEGREE;
					this.wayX = WAY_X;
					this.wayY = WAY_Y;
					// live
					this.live.add(-ATTACK_POWER);
					// hit bounce
					if (!this.isMine) {
						setProps(this, {
							scaleX: 1.6,
							scaleY: 0.4
						});
						setKeyframes(this, this.keyframeSet.hit);
						audio = Audios.brickHit;
					}
					// play audio
					audio.currentTime = 0;
					audio.play();
				},

				revive: function() {

					this.display = true;
				},

				destroy: function() {

					var s = Size;
					var power = this.hitPower / 100;
					var wayX = this.wayX;
					var wayY = this.wayY;
					var degree = this.degree;

					if (degree === 90) {
						degree -= Math.random() * 15;
						wayX = getRandomWay();
					} else if (!degree) { // 0
						degree += Math.random() * 15;
						wayX = getRandomWay();
					}

					var powerY = power * (degree / 90);
					var powerX = power - powerY;
					var dX = powerX * wayX;
					var dY = powerY * wayY;
					var ddY = s.drag / 60;
					// get values will using at updater
					var fieldWidth = s.fieldWidth;
					var fieldHeight = s.fieldHeight;
					var ballFloor = s.ballFloor;
					var paddleBottom = s.paddleBottom;
					var paddleStateX = Paddle.x;
					var paddleStateWidth = Paddle.width;
					var width = this.width;
					var self = this;
					var isCatched = false;

					Bricks[this.rX][this.rY] = void 0;
					this.toY = s.brickRadiusY; // center
					FieldCanvas.setSpritePassive(this, false);
					
					if (system.renderType === 1) {
						var colors = this.colors; // rgb array
						var r = colors[0] + 1;
						if (r > ColorLevel) {
							r = ColorLevel;
						}
						var g = colors[1] + 1;
						if (g > ColorLevel) {
							g = ColorLevel;
						}
						var b = colors[2] + 1;
						if (b > ColorLevel) {
							b = ColorLevel;
						}

						this.colorValue = 'rgb(' +
							r * ValuePerLevel + ',' +
							g * ValuePerLevel + ',' +
							b * ValuePerLevel + ')';
					}

					new Animator(this)
					.setUpdater(function() {

						var x = self.x + dX;
						// wall hit test
						if (x < 0) {
							x = 0;
							dX *= -1;
						} else if (x + width > fieldWidth) {
							x = fieldWidth - width;
							dX *= -1;
						}
						// ceil floor paddle hit test
						var y = self.y += dY;

						if (y <= 0) { // ceil hit
							y = self.y *= -1;
							dY = 0;
						} else if (y > ballFloor && y < paddleBottom && Paddle.alive && !isCatched) {
							var paddleX = paddleStateX.value;
							var paddleRight = paddleX + paddleStateWidth.value;
							var brickRight = x + width;

							if (brickRight > paddleX && x < paddleRight) { // catched
								isCatched = true;
								dX = dY = ddY = 0;
								setProps(self, {
									scaleX: 1.4,
									scaleY: 1.4
								});
								setTransforms(self, {
									scaleX: 0,
									scaleY: 0
								}, 150);
								Resource.collect.apply(Resource, self.colors);
								Audios.brickCatch.play();
								Paddle.bounce();
							}
						}

						self.x = x;
						self.rotateZ += dX * 2;

						dY += ddY;
					})
					.addEndTest(function() {

						return (isCatched && !self.scaleX) || self.y >= fieldHeight;
					})
					.addEndAction(function() {

						self.isDead = true;
					})
					.launch();
				},

				keyframeSet: {},

				generateKeyframeSet: function() {

					var set = this.keyframeSet;

					set.hit = [
						{
							props: {
								scaleX: 0.6,
								scaleY: 1.4,
							},

							duration: 240
						},

						{
							props: {
								scaleX: 1.2,
								scaleY: 0.8,
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
					];

					set.idle = [
						{
							props: {
								scaleX: 1.4,
								scaleY: 0.6,
							},

							duration: 240
						},

						{
							props: {
								z: -Size.brickHeight * 2,
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
					];
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

					if (!this.value) {
						this.target.destroy();
					} else {
						if (this.get(-1) === 0) {
							this.target.revive();
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

			function generateBricks(DATA) { // init
				// remove existing bricks
				var sprites = FieldCanvas.sprites;

				for (var i = sprites.length - 1; i >= 0; i--) {
					var sprite = sprites[i];

					if (sprite !== Paddle) {
						var constructor = sprite.constructor;

						if (constructor !== Ball && constructor !== BallGhost) {
							sprite.isDead = true;
						}
					}
				}

				Bricks = [];
				Wormholes = [];
				Jellys = [];

				// generate bricks by data
				for (var x = 0; x < BrickX; x++) {
					var bricksX = [];

					Bricks.push(bricksX);

					for (var y = 0; y < BrickY; y++) {
						var data = DATA[x][y];
						var type = data.type;
						var brick = void 0;

						if (!type) { // 0
							var rgb = data.rgb;
							var r = rgb[0];
							var g = rgb[1];
							var b = rgb[2];

							if (r + g + b) { // not 0
								brick = new Brick(x, y);
								brick.setColor(r, g, b);
							}
						} else { // special objects
							var brickClass;

							if (type === 1) {
								brickClass = BallBrick;
							} else if (type === 2) {
								brickClass = BombBrick;
							} else if (type === 3) {
								brickClass = JellyBrick;
							} else if (type === 4) {
								brickClass = Wormhole;
							}

							brick = new brickClass(x, y);
						}

						bricksX.push(brick);

						if (brick) {
							FieldCanvas.appendSprite(brick);
						}
					}
				}
				console.log(Bricks);
				FieldCanvas.renderPassiveCanvas();
			}

			function BallBrick(REGION_X, REGION_Y) {

				Brick.call(this, REGION_X, REGION_Y);
				this.live.set(1);

				if (!this.image) {
					this.installImage();
				}
			}

			BallBrick.prototype = {
				constructor: BallBrick,

				installImage: function() {

					var diameter = Size.brickWidth;
					var radius = diameter / 2;
					var haloWidth = Size.haloWidth;
					var center = haloWidth + radius;
					var canvas = document.createElement('canvas');

					canvas.width = canvas.height = diameter + haloWidth * 2;

					var ctx = canvas.getContext('2d');

					ctx.shadowBlur = haloWidth;
					ctx.fillStyle = ctx.shadowColor = '#FFFFFF';
					ctx.arc(center, center, radius, 0, Math.PI * 2);
					ctx.fill();

					this.image = canvas;
				},

				image: void 0,

				update: function() { // empty

					// do nothing
				},

				render: function(CTX) {

					var padding = Size.haloWidth;

					CTX.drawImage(this.image, this.x - padding, this.y - padding);
				},

				hit: function(ATTACK_POWER) {

					this.live.add(-ATTACK_POWER);
					// audio
					var audio = Audios.brickHit;

					audio.currentTime = 0;
					audio.play();
				},

				revive: function() {

					this.display = true;
				},

				destroy: function() {

					this.isDead = true;
					Bricks[this.rX][this.rY] = void 0;
					new Ball(Math.random() * 360, this.x, this.y);
				}
			};

			function BombBrick(REGION_X, REGION_Y) {

				Brick.call(this, REGION_X, REGION_Y);
				this.toY = Size.brickRadiusY; // center
				this.scaleX = this.scaleY = this.baseScale;
				this.live.set(2);
				this.attackPower = 500;
			}

			BombBrick.prototype = {
				constructor: BombBrick,

				baseScale: 1.6,
				scaleRange: 0.8,

				update: Brick.prototype.update,

				render: function(CTX) {

					var width = this.width;
					var height = this.height;
					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;
					var image = Images.bomb;
					var imageWidth = image.width;
					var imageHeight = image.height;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);
					CTX.rotate(this.rotateZ * PIDivided180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;
					CTX.drawImage(image,
						0, 0, imageWidth, imageHeight,
						0, 0, width, height
					);

					var blink = this.blink;

					if (blink) {
						CTX.globalAlpha = blink;
						CTX.drawImage(image.blinkImage,
							0, 0, imageWidth, imageHeight,
							0, 0, width, height
						);
					}

					CTX.restore();
				},

				hit: function(ATTACK_POWER) {

					var live = this.live;
					var baseScale = this.baseScale;
					var scaleRange = this.scaleRange;

					this.blink = 1;
					setTransform(this, 'blink', 0, 250);
					FieldCanvas.setSpritePassive(this, false);
					live.add(-ATTACK_POWER);

					if (live.value) {
						setProps(this, {
							scaleX: baseScale + scaleRange,
							scaleY: baseScale - scaleRange
						});

						setKeyframes(this, this.keyframeSet.hit);
					}
					// audio
					var audio = Audios.brickHit;

					audio.currentTime = 0;
					audio.play();
				},

				revive: function() {

					this.display = true;
				},

				destroy: function() {

					this.isDead = true;
					Bricks[this.rX][this.rY] = void 0;
					// audio
					var audio = Audios.mine_explosion;

					audio.currentTime = 0;
					audio.play();
					// shock
					PassiveFieldCanvas.removeClass('explosionShock');
					setTimeout(function() {
						PassiveFieldCanvas.addClass('explosionShock');
					}, 16);
					// explosion
					new Particle(Explosion,
						this.x, this.y,
						{
							latency: 64,
							number: 2
						}
					)
					.addEndAction(function() {

						var x = this.x;
						var y = this.y;
						var wayNumber = 32;
						var degreePerWay = 360 / wayNumber;

						for (var i = 0; i < wayNumber; i++) {
							new ExplosionWave(i * degreePerWay, x, y);
						}
					}.bind(this))
					.launch();

					/*var x = this.x;
					var y = this.y;
					var wayNumber = 32;
					var degreePerWay = 360 / wayNumber;

					for (var i = 0; i < wayNumber; i++) {
						new ExplosionWave(i * degreePerWay, x, y);
					}*/
				},

				destroy_: function() {

					var rx = this.rX;
					var ry = this.rY;

					this.isDead = true;
					Bricks[rx][ry] = void 0;
					// audio
					var audio = Audios.mine_explosion;

					audio.currentTime = 0;
					audio.play();
					// shock
					FieldHolder.removeClass('explosionShock');
					setTimeout(function() {

						FieldHolder.addClass('explosionShock');
					}, 16);
					// explosion
					new Particle(Explosion,
						this.x, this.y,
						{
							latency: 64,
							number: 2
						}
					)
					.addEndAction(function() {

						var power = Size.power;
						var cx = this.cX;
						var cy = this.cY;
						var attackPower = this.attackPower;
						var baseAp = attackPower / ((1 + 0.7) * 4);

						var hitBrick = function(BRICK, AP) {

							var dx = BRICK.cX - cx;
							var dy = BRICK.cY - cy;
							var wayX = dx > 0 ? 1 : -1;
							var wayY = dy > 0 ? 1 : -1;
							var distance = Math.pow(dx, 2) + Math.pow(dy, 2);

							dx *= wayX;
							dy *= wayY;

							BRICK.hit(
								AP,
								power,
								dy / (dx + dy) * 90,
								wayX,
								wayY
							);
						};

						// top
						var hitTop = function(X, Y, AP) {

							var brick = Bricks[X][Y];

							if (brick && !brick.isDead) {
								var live = brick.live;
								var liveValue = live.value;
								var leftAp = AP - liveValue;
								
								hitBrick(brick, AP);

								if (leftAp > 0) {
									//var baseAp = leftAp / (3 + 0.7 * 2);
									var baseAp = leftAp / 2.4;

									// right
									//hitRight(X + 1, Y, baseAp);
									// rightTop
									hitRightTop(X + 1, Y - 1, baseAp * 0.7);
									// top
									hitTop(X, Y - 1, baseAp);
									// leftTop
									hitLeftTop(X - 1, Y - 1, baseAp * 0.7);
									// left
									//hitLeft(X - 1, Y, baseAp);
								}
							}
						};

						// rightTop
						var hitRightTop = function(X, Y, AP) {

							var brick = Bricks[X][Y];

							if (brick && !brick.isDead) {
								var live = brick.live;
								var liveValue = live.value;
								var leftAp = AP - liveValue;
								
								hitBrick(brick, AP);

								if (leftAp > 0) {
									var baseAp = leftAp / 2.7;

									// right
									hitRight(X + 1, Y, baseAp);
									// rightTop
									hitRightTop(X + 1, Y - 1, baseAp * 0.7);
									// top
									hitTop(X, Y - 1, baseAp);
								}
							}
						};

						// right
						var hitRight = function(X, Y, AP) {

							var brick = Bricks[X][Y];

							if (brick && !brick.isDead) {
								var live = brick.live;
								var liveValue = live.value;
								var leftAp = AP - liveValue;
								
								hitBrick(brick, AP);

								if (leftAp > 0) {
									//var baseAp = leftAp / (3 + 0.7 * 2);
									var baseAp = leftAp / 2.4;

									// bottom

									// rightBottom

									// right
									hitRight(X + 1, Y, baseAp);
									// rightTop
									hitRightTop(X + 1, Y - 1, baseAp * 0.7);
									// top
									//hitTop(X, Y - 1, baseAp);
								}
							}
						};

						// left
						var hitLeft = function(X, Y, AP) {

							var brick = Bricks[X][Y];

							if (brick && !brick.isDead) {
								var live = brick.live;
								var liveValue = live.value;
								var leftAp = AP - liveValue;
								
								hitBrick(brick, AP);

								if (leftAp > 0) {
									var baseAp = leftAp / (3 + 0.7 * 2);

									// top
									hitTop(X, Y - 1, baseAp);
									// leftTop
									hitLeftTop(X - 1, Y - 1, baseAp * 0.7);
									// left
									hitLeft(X - 1, Y, baseAp);
									// leftBottom

									// bottom

								}
							}
						};

						// left top
						var hitLeftTop = function(X, Y, AP) {

							var brick = Bricks[X][Y];

							if (brick && !brick.isDead) {
								var live = brick.live;
								var liveValue = live.value;
								var leftAp = AP - liveValue;
								
								hitBrick(brick, AP);

								if (leftAp > 0) {
									var baseAp = leftAp / 2.7;

									// top
									hitTop(X, Y - 1, baseAp);
									// leftTop
									hitLeftTop(X - 1, Y - 1, baseAp * 0.7);
									// left
									hitLeft(X - 1, Y, baseAp);
								}
							}
						};

						hitTop(rx, ry - 1, baseAp);
						hitLeftTop(rx - 1, ry - 1, baseAp * 0.7);
						hitLeft(rx - 1, ry, baseAp);
						hitRightTop(rx + 1, ry - 1, baseAp * 0.7);
						hitRight(rx + 1, ry, baseAp);

					}.bind(this))
					.launch();
				},

				destroy2: function() {

					var rx = this.rX;
					var ry = this.rY;

					this.isDead = true;
					Bricks[rx][ry] = void 0;
					// audio
					var audio = Audios.mine_explosion;

					audio.currentTime = 0;
					audio.play();
					// shock
					FieldHolder.removeClass('explosionShock');
					setTimeout(function() {

						FieldHolder.addClass('explosionShock');
					}, 16);
					// explosion
					new Particle(Explosion,
						this.x, this.y,
						{
							latency: 64,
							number: 2
						}
					)
					.addEndAction(function() {

						var regionRadius = Ratio.explosionRegionRadius;

						var sx = rx - regionRadius;
						if (sx < 0) {
							sx = 0;
						}
						var ex = rx + regionRadius;
						if (ex >= BrickX) {
							ex = BrickX - 1;
						}
						var sy = ry - regionRadius;
						if (sy < 0) {
							sy = 0;
						}
						var ey = ry + regionRadius;
						if (ey >= BrickY) {
							ey = BrickY - 1;
						}

						var attackPower = this.attackPower;
						var sx_ = sx - 1;
						var ex_ = ex + 1;
						var sy_ = sy - 1;
						var ey_ = ey + 1;
						//var firewallLeft = sx_;
						//var firewallTop = sy_;
						//var firewallRight = ex_;
						//var firewallBottom = ey_;
						//var firewallLT_x = sx_; // left top
						//var firewallLT_y = sy_;
						//var firewallRT_x = ex_; // right top
						//var firewallRT_y = sy_;
						//var firewallLB_x = sx_; // left bottom
						//var firewallLB_y = ey_;
						//var firewallRB_x = ex_; // right bottom
						//var firewallRB_y = ey_;

						var firewallLeft = sx;
						var firewallTop = sy;
						var firewallRight = ex;
						var firewallBottom = ey;
						var firewallLT_x = sx; // left top
						var firewallLT_y = sy;
						var firewallRT_x = ex; // right top
						var firewallRT_y = sy;
						var firewallLB_x = sx; // left bottom
						var firewallLB_y = ey;
						var firewallRB_x = ex; // right bottom
						var firewallRB_y = ey;
						var bricks = [];
						var x, y, brick;
						// find firewalls
						for (x = sx; x <= ex; x++) {
							var brickX = Bricks[x];

							for (y = sy; y <= ey; y++) {
								if (x !== rx || y !== ry) { // not bomb itself
									brick = brickX[y];

									if (brick && !brick.isDead) {
										var liveValue = brick.live.value;

										bricks.push(brick);

										if (liveValue > attackPower) { // firewall
											if (y === ry) { // left, right
												if (x < rx) { // left
													if (x > firewallLeft) {
														firewallLeft = x;
													}
												} else { // right
													if (x < firewallRight) {
														firewallRight = x;
													}
												}
											} else if (x === rx) { // top, bottom
												if (y < ry) { // top
													if (y > firewallTop) {
														firewallTop = y;
													}
												} else { // bottom
													if (y < firewallBottom) {
														firewallBottom = y;
													}
												}
											} else { // conners
												if (x < rx) { // left
													if (y < ry) { // left-top
														if (x > firewallLT_x) {
															firewallLT_x = x;
														}

														if (y > firewallLT_y) {
															firewallLT_y = y;
														}
													} else { // left-bottom
														if (x > firewallLB_x) {
															firewallLB_x = x;
														}

														if (y < firewallLB_y) {
															firewallLB_y = y;
														}
													}
												} else { // right
													if (y < ry) { // right-top
														if (x < firewallRT_x) {
															firewallRT_x = x;
														}

														if (y > firewallRT_y) {
															firewallRT_y = y;
														}
													} else { // right-bottom
														if (x < firewallRB_x) {
															firewallRB_x = x;
														}

														if (y < firewallRB_y) {
															firewallRB_y = y;
														}
													}
												}
											}
										}
									}
								}
							}
						}

						// explosion
						var cx = this.cX;
						var cy = this.cY;
						var explosionRadius = Math.pow(Size.explosionRadius, 2);
						var power = Size.power;

						for (var i = 0, l = bricks.length; i < l; i++) {
							brick = bricks[i];
							x = brick.rX;
							y = brick.rY;

							if (
								(x === rx && y >= firewallTop && y <= firewallBottom) ||
								(y === ry && x >= firewallLeft && x <= firewallRight) ||
								(
									(x !== rx && y !== ry) &&
									(x > firewallLT_x || y > firewallLT_y) &&
									(x < firewallRT_x || y > firewallRT_y) &&
									(x > firewallLB_x || y < firewallLB_y) &&
									(x < firewallRB_x || y < firewallRB_y)
								)
							) {
								var dx = brick.cX - cx;
								var dy = brick.cY - cy;
								var wayX = dx > 0 ? 1 : -1;
								var wayY = dy > 0 ? 1 : -1;
								var distance = Math.pow(dx, 2) + Math.pow(dy, 2);

								dx *= wayX;
								dy *= wayY;

								if (distance <= explosionRadius) {
									brick.hit(
										attackPower,
										power,
										dy / (dx + dy) * 90,
										wayX,
										wayY
									);
								}
							}
						}

						// hit firewall
						/*if (firewallLeft !== sx_) {
							Bricks[firewallLeft][ry].hit(attackPower, 0, 0, 0, 0);
						}

						if (firewallTop !== sy_) {
							Bricks[rx][firewallTop].hit(attackPower, 0, 0, 0, 0);
						}

						if (firewallRight !== ex_) {
							Bricks[firewallRight][ry].hit(attackPower, 0, 0, 0, 0);
						}

						if (firewallBottom !== ey_) {
							Bricks[rx][firewallBottom].hit(attackPower, 0, 0, 0, 0);
						}*/
						// left-top
						if (firewallLT_x !== sx_ && firewallLT_y !== sy_) {
							Bricks[firewallLT_x][firewallLT_y].hit(attackPower, 0, 0, 0, 0);
						}
						// right-top
						if (firewallRT_x !== ex_ && firewallRT_y !== sy_) {
							Bricks[firewallRT_x][firewallRT_y].hit(attackPower, 0, 0, 0, 0);
						}
						// left-bottom
						if (firewallLB_x !== sx_ && firewallLB_y !== ey_) {
							Bricks[firewallLB_x][firewallLB_y].hit(attackPower, 0, 0, 0, 0);
						}
						// right-bottom
						if (firewallRB_x !== ex_ && firewallRB_y !== ey_) {
							Bricks[firewallRB_x][firewallRB_y].hit(attackPower, 0, 0, 0, 0);
						}

						new Particle(Smoke,
							this.x, this.y,
							{
								latency: 32,
								number: 2,
								particleProps: {
									dX: 0,
									dY: 0
								}
							}
						).launch();
					}.bind(this))
					.launch();
				},

				keyframeSet: {},

				generateKeyframeSet: function() {

					var set = this.keyframeSet;

					set.hit = [
						{
							props: {
								scaleX: 1,
								scaleY: 2.2,
							},

							duration: 240
						},

						{
							props: {
								scaleX: 2.0,
								scaleY: 1.2,
							},

							duration: 180
						},

						{
							props: {
								scaleX: 1.4,
								scaleY: 1.8,
							},

							duration: 120
						},

						{
							props: {
								scaleX: 1.6,
								scaleY: 1.6,
							},

							duration: 60
						},
					];
				}
			};

			function ExplosionWave(DEGREE, X, Y) {

				var degree = DEGREE;
				var wayx = 1;
				var wayy = -1;

				if (degree >= 270) { // right-bottom
					degree = 90 - (degree - 270);
					wayx = 1;
					wayy = 1;
				} else if (degree > 180) { // left-bottom
					degree = 90 - (degree - 180);
					wayx = -1;
					wayy = 1;
				} else if (degree >= 90) { // left-top
					degree = 90 - (degree - 90);
					wayx = -1;
					wayy = -1;
				} else { // right-top
					// do nothing
				}

				var ballDiameter = Size.ballDiameter;
				var sizeGap = (Size.brickWidth - ballDiameter) / 2;

				this.x = X + sizeGap;
				this.y = Y + sizeGap;
				this.degree = degree;
				this.wayx = wayx;
				this.wayy = wayy;

				var power = Size.brickWidth;
				var powerY = (degree / 90) * power;
				var powerX = power - powerY;

				this.dx = powerX * wayx;
				this.dy = powerY * wayy;
				this.attackPower = 3;

				FieldCanvas.appendSprite(this);
			}

			ExplosionWave.prototype = {
				constructor: ExplosionWave,

				update: function() {

					var radius = Size.ballRadius;
					var diameter = Size.ballDiameter;
					var brickWidth = Size.brickWidth;
					var brickHeight = Size.brickHeight;
					var x = this.x += this.dx;
					var y = this.y += this.dy;
					var sY = y / brickHeight;

					if (sY < 0) {
						sY = 0;
					} else {
						sY = Math.floor(sY);
					}
					var eY = (y + diameter) / brickHeight;
					if (eY >= BrickY) {
						eY = BrickY - 1;
					} else {
						eY = Math.floor(eY);
					}
					var sX = x / brickHeight;
					if (sX < 0) {
						sX = 0;
					} else {
						sX = Math.floor(sX);
					}
					var eX = (x + diameter) / brickWidth;
					if (eX >= BrickX) {
						eX = BrickX - 1;
					} else {
						eX = Math.floor(eX);
					}
					// get brick regions around wave
					var i, j, brick;

					for (i = sX; i <= eX; i++) {
						var brickXs = Bricks[i];

						for (j = sY; j <= eY; j++) {
							brick = brickXs[j];

							if (brick && !brick.isDead) {
								TouchedBricks.push(brick);
							}
						}
					}

					var attackPower = this.attackPower;
					var brickNumber = TouchedBricks.length;
					// at least one brick touched
					if (brickNumber) {
						var degree = this.degree;
						var wayx = this.wayx;
						var wayy = this.wayy;
						var bulletPower = Size.bulletSpeed * 60;
						var cx = x + radius;
						var cy = y + radius;

						shuffleArray(TouchedBricks);

						for (i = 0; i < brickNumber; i++) {
							brick = TouchedBricks[i];

							var liveValue = brick.live.value;

							brick.hit(
								attackPower,
								bulletPower,
								degree,
								wayx,
								wayy
							);

							attackPower -= liveValue;

							if (attackPower < 0) {
								break;
							}
						}
						// clear TouchedBricks
						for (i = 0; i < brickNumber; i++) {
							TouchedBricks.pop();
						}
					} else {
						attackPower -= 1;
					}

					if (attackPower < 0) {
						this.destroy();
					} else {
						this.attackPower = attackPower;
					}
				},

				render: function(CTX) { // empty

					// empty
				},

				destroy: function() {

					this.isDead = true;
				}
			};

			var Jellys = [];

			function JellyBrick(REGION_X, REGION_Y) {

				Brick.call(this, REGION_X, REGION_Y);
				this.live.set(1);
				this.installImage();
			}

			JellyBrick.prototype = {
				constructor: JellyBrick,

				bounceRange: 0.6,

				imagePadding: 0,

				installImage: function() {

					var colors = [
						Math.floor(Math.random() * ColorLevel),
						Math.floor(Math.random() * ColorLevel),
						Math.floor(Math.random() * ColorLevel)
					];
					var r = colors[0] * ValuePerLevel;
					var g = colors[1] * ValuePerLevel;
					var b = colors[2] * ValuePerLevel;
					var color = 'rgb(' + r + ',' + g + ',' + b + ')';
					var width = Size.brickWidth;
					var height = Size.brickHeight;
					var shadowBlur = width;
					var haloWidth = Size.haloWidth;
					var canvas = document.createElement('canvas');

					canvas.width = canvas.height = width + haloWidth * 2;

					var ctx = canvas.getContext('2d');
					var gradient = ctx.createLinearGradient(
						haloWidth, 0,
						haloWidth + width, haloWidth + height
					);

					gradient.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ', 0.5)');
					gradient.addColorStop(0.5, color);
					//gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ', 0.75)');
					gradient.addColorStop(1, 'rgba(255, 255, 255, 0.75)');

					var max = Math.max.apply(null, colors);
					var halo = [0, 0, 0];

					for (var i = 0, l = colors.length; i < l; i++) {
						if (colors[i] === max) {
							halo[i] = 255;

							if (i === 2) { // b
								halo[0] = halo[1] = 255 - ValuePerLevel;
							}
						} else {
							halo[i] = 0;
						}
					}

					ctx.translate(haloWidth, haloWidth);
					ctx.shadowColor = 'rgb(' + halo[0] + ',' + halo[1] + ',' + halo[2] + ')';
					ctx.shadowBlur = haloWidth;
					ctx.fillStyle = gradient;
					ctx.fillRect(0, 0, width, height);

					// white reflection
					var margin = width * 0.15;
					var lineWidth = width * 0.05;

					ctx.lineWidth = lineWidth;
					ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
					ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
					ctx.beginPath();
					ctx.moveTo(margin, height - margin * 2);
					ctx.lineTo(margin, margin);
					ctx.lineTo(width - margin * 2, margin);
					ctx.arcTo(
						margin, margin,
						margin, height - margin * 2,
						(width - margin) / 2
					);
					ctx.stroke();
					ctx.fill();
					JellyBrick.prototype.imagePadding = haloWidth;

					this.image = canvas;
				},

				update: Brick.prototype.update,

				render: Brick.prototype.render,

				hit: function(ATTACK_POWER, POWER, DEGREE, WAY_X, WAY_Y) {
					// recod
					if (!this.dropped) {
						this.hitPower = POWER;
						this.degree = DEGREE;
						this.wayX = WAY_X;
						this.wayY = WAY_Y;
					}
					// live
					this.live.add(-ATTACK_POWER);
					// bounce
					this.bounce();
				},

				revive: function() {

					this.display = true;
				},

				destroy: function() {

					var s = Size;
					var ddy = s.drag / 60;
					var power, dx, dy;
					var self = this;

					if (this.dropped) {
						var fieldHeight = s.fieldHeight;
							power = Size.power / 180;
							dy = -power;
							dx = Math.random() * power * getRandomWay();
							dRotateZ = dx * 2;

						Jellys.splice(Jellys.indexOf(this), 1);
						this.toY = s.brickRadiusY; // center
						//FieldCanvas.setSpritePassive(this, false);

						new Animator(this)
						.setUpdater(function() {

							self.x += dx;
							self.y += dy;
							self.rotateZ += dRotateZ;

							dy += ddy;
						})
						.addEndTest(function() {

							return self.y >= fieldHeight;
						})
						.addEndAction(function() {

							self.isDead = true;
						})
						.launch();
					} else {
						var degree = this.degree;
						var wayx = this.wayX;

						if (degree === 90) {
							degree -= Math.random() * 15;
							wayx = getRandomWay();
						} else if (!degree) { // 0
							degree += Math.random() * 15;
							wayx = getRandomWay();
						}

							power = this.hitPower / 100;
						var powerY = power * (degree / 90);
						var powerX = power - powerY;
							dx = powerX * wayx;
							dy = powerY * this.wayY;
						var dyAbs = 2; // any number greater then 1
							dRotateZ = dx * 2;
						// get values will using at updater
						var fieldWidth = s.fieldWidth;
						var ballFloor = s.ballFloor;
						var paddleBottom = s.paddleBottom;
						var paddleStateX = Paddle.x;
						var paddleStateWidth = Paddle.width;
						var jellyFloor_paddle = s.jellyFloor_paddle;
						var jellyFloor_field = s.jellyFloor_field;
						var width = this.width;

						Bricks[this.rX][this.rY] = void 0;
						this.toY = s.brickRadiusY; // center

						new Animator(this)
						.setUpdater(function() {

							var x = self.x += dx;
							// wall hit test
							if (x < 0) {
								self.x = 0;
								dx *= -1;
							} else if (x + width > fieldWidth) {
								self.x = fieldWidth - width;
								dx *= -1;
							}
							// ceil floor paddle hit test
							var y = self.y += dy;

							if (y <= 0) { // ceil hit
								y = self.y *= -1;
								dy = 0;
							} else if (y > jellyFloor_paddle && y < paddleBottom && Paddle.alive) {
								var paddleX = paddleStateX.value;
								var paddleRight = paddleX + paddleStateWidth.value;
								var brickRight = x + width;

								if (brickRight > paddleX && x < paddleRight) { // catched
									self.y = jellyFloor_paddle;
									dy *= -0.5;

									if (dyAbs > 1) {
										dx *= 0.8;
										Paddle.bounce();
										self.bounce();
									}
								}
							} else if (y >= jellyFloor_field) {
								self.y = jellyFloor_field;
								dx *= 0.9;
								dy *= -0.5;
							}

							var rotateZ = self.rotateZ += dRotateZ;

							dRotateZ = dx * 2;

							if ((Math.abs(dRotateZ) < 1) && (Math.abs(rotateZ % 90) > 1)) {
								dRotateZ = dRotateZ > 0 ? 1 : -1;
							}

							dy += ddy;
							dyAbs = Math.abs(dy);
						})
						.addEndTest(function() {

							return self.y >= jellyFloor_field && dyAbs <= 1;
						})
						.addEndAction(function() {

							self.toY = self.height; // bottom
							self.rotateZ = 0;
							self.live.add(1);
							self.dropped = true;
							Jellys.push(self);
							FieldCanvas.setSpritePassive(self, true);
						})
						.launch();
					}
				},

				bounce: function() {

					var bounceRange = this.bounceRange;

					setProps(this, {
						scaleX: 1 + bounceRange,
						scaleY: 1 - bounceRange
					});
					setKeyframes(this, this.keyframeSet.hit);
					FieldCanvas.setSpritePassive(this, false);
					// play audio
					var audio = Audios.jellyHit;

					audio.currentTime = 0;
					audio.play();
				},

				keyframeSet: {},

				generateKeyframeSet: function() {

					var set = this.keyframeSet;
					var hit = [];
					var frameNumber = 6;
					var bounceRange = this.bounceRange;
					var vpf = bounceRange / frameNumber;
					var v0 = 1 + bounceRange;
					var v1 = 1 - bounceRange;
					var duration = 240;

					for (var i = 0, l = frameNumber - 1; i < l; i++) {
						var isEven = i % 2;

						v0 -= vpf;
						v1 += vpf;

						hit.push({
							props: {
								scaleX: isEven ? v0 : v1,
								scaleY: isEven ? v1 : v0
							},

							duration: duration
						});

						duration *= 0.8;
					}

					hit.push({
						props: {
							scaleX: 1,
							scaleY: 1
						},

						duration: duration
					});

					set.hit = hit;
				}
			};

			var Wormholes = [];

			function Wormhole(REGION_X, REGION_Y) {

				Brick.call(this, REGION_X, REGION_Y);

				this.toY = Size.brickHeight / 2; // center
				this.scaleX = this.scaleY = this.baseScale;
				this.scaleWay = 1;
				this.live = mstate(1);
				this.display = true;
				this.wormholeId = Wormholes.length;
				Wormholes.push(this);
				FieldCanvas.setSpritePassive(this, false);
			}

			Wormhole.prototype = {
				constructor: Wormhole,

				baseScale: 3,
				maxScale: 3.5,
				minScale: 2.5,
				dScale: 0.005,

				update: function() {

					var scaleWay = this.scaleWay;
					var scale = this.scaleX + this.dScale * scaleWay;

					if (scaleWay > 0) {
						if (scale >= this.maxScale) {
							this.scaleWay = -1;
						}
					} else {
						if (scale <= this.minScale) {
							this.scaleWay = 1;
						}
					}

					this.rotateZ += 0.5;
					this.scaleX = this.scaleY = scale;

					if (Math.random() > 0.75) {
						new Particle(WormholeLight,
							this.x,
							this.y,
							{
								latency: 16,
								number: 1
							}
						).launch();
					}
				},

				render: function(CTX) {

					var width = this.width;
					var height = this.height;
					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					var toX = this.toX;
					var toY = this.toY;
					var image = Images.wormhole;
					var imageWidth = image.width;
					var imageHeight = image.height;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);
					CTX.rotate(this.rotateZ * PIDivided180);
					CTX.translate(-toX * scaleX, -toY * scaleY);
					CTX.scale(scaleX, scaleY);
					CTX.globalAlpha = this.opacity;
					CTX.drawImage(image,
						0, 0, imageWidth, imageHeight,
						0, 0, width, height
					);

					CTX.restore();
				},

				hit: function() { // empty

					// do nothing
				},

				// no destroy function
			};

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
				this.rotateZ = 0;
				this.color = '#EEEEEE';
				this.attackPower = ATTACK_POWER || 1;
				this.speed = Size.bulletSpeed;
				this.degree = 90;
				this.dropWhenDestroy = true;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				this.toX = this.width / 2;
				this.toY = this.height / 2;
				this.display = true;

				var degree = this.degree;
				var speed = this.speed;
				var wayX = degree <= 90 ? 1 : -1;

				this.dY = speed * (wayX > 0 ? degree : (180 - degree)) / 90;
				this.dX = (speed - this.dY) * wayX;

				// initialize
				this.x = bulletStateHelper.getInitialX(this, SIDE);
				FieldCanvas.appendSprite(this);
			}

			Bullet.prototype = {
				constructor: Bullet,

				update: function() {

					var y = this.y - this.dY;
					var x = this.x + this.dX;

					if (y <= 0) { // ceiling touched
						this.destroy();
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

									if (brick && !brick.isDead) {
										TouchedBricks.push(brick);
									}
								}
							}

							var brickNumber = TouchedBricks.length;
							// at least one brick touched
							if (brickNumber) {
								var attackPower = this.attackPower;
								var bulletPower = Size.bulletSpeed * 60;
								var cx = this.x + this.toX;
								var cy = this.y + this.toY;

								for (i = 0; i < brickNumber; i++) {
									brick = TouchedBricks[i];

									var dx = cx - brick.cX;
									var dy = cy - brick.cY;
									var wayX = dx > 0 ? -1 : 1;
									var wayY = dy > 0 ? -1 : 1;

									if (dx < 0) {
										dx *= -1;
									}

									if (dy < 0) {
										dy *= -1;
									}

									var degree = (dy / (dx + dy)) * 90;

									brick.hit(
										attackPower,
										bulletPower,
										degree,
										wayX,
										wayY
									);
								}
								// clear TouchedBricks
								for (i = 0; i < brickNumber; i++) {
									TouchedBricks.pop();
								}
								// destroy bullet
								this.destroy();
							}
						}
					}

					this.x = x;
					this.y = y;
				},

				render: function(CTX) {

					var rotateZ = this.rotateZ;
					var toX = this.toX;
					var toY = this.toY;

					CTX.save();
					CTX.translate(this.x + toX, this.y + toY);

					if (rotateZ) {
						CTX.rotate(rotateZ * PIDivided180);
					}

					CTX.translate(-toX, -toY);
					CTX.fillStyle = this.color;
					CTX.fillRect(0, 0, this.width, this.height);
					CTX.restore();
				},

				destroy: function() {

					if (this.dropWhenDestroy) {
						var self = this;
						var power = Size.power / 60;
						var wayX = Math.random() > 0.5 ? 1 : -1;
						var dX = Math.random() * power * 0.2 * wayX;
						var dY = Math.random() * power;
						var ddY = Size.drag / 20;
						var dRotateZ = Math.random() * power / 2 * wayX;
						var fieldHeight = Size.fieldHeight;

						this.renderOnly = true;
						this.width /= 2;
						this.height /= 2;

						new Animator(this)
						.setUpdater(function() {

							self.x += dX;
							self.y -= dY;
							self.rotateZ += dRotateZ;

							dY -= ddY;
						})
						.addEndTest(function() {

							return self.y >= fieldHeight;
						})
						.addEndAction(function() {

							self.isDead = true;
						})
						.launch();
					} else {
						this.isDead = true;
					}
				}
			};

			var bulletStateHelper = {

				getInitialX: function(BULLET, SIDE) {

					var x;

					if (SIDE === -1) { // left
						x = BULLET.width;
					} else if (SIDE === 1) { // right
						x = Paddle.width.value - BULLET.width * 2;
					} else { // 0, center
						x = (Paddle.width.value - BULLET.width) / 2;
					}

					return Paddle.x.value + x;
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
					this.timer = setInterval(this.fire, mode.latency);
					this.fire();
				},

				fire: function() {

					var mode = BulletMode.onMode;
					var audio = mode.audio;

					mode.fire();
					audio.currentTime = 0;
					audio.play();

					if (++BulletMode.count === BulletMode.times) { // end of firing
						clearInterval(BulletMode.timer);

						var whenCease = BulletMode.onMode.whenCease;

						if (whenCease) {
							whenCease();
						}
					}
				},

				stop: function() {

					clearTimeout(this.timer);
				},

				modes: {

					laser: {

						latency: 500,

						times: 5,

						attackPower: 2,

						audio: Audios.laser_fire,

						fire: function() {

							var attackPower = this.attackPower;
							var props = {
								width: Size.bulletWidth / 2,
								height: Size.bulletHeight * 2,
								color: '#FF0000',
								dropWhenDestroy: false
							};

							new Bullet(-1, attackPower, props);
							new Bullet(1, attackPower, props);
						}
					},

					machineGun: {

						latency: 100,

						times: 50,

						attackPower: 1,

						audio: Audios.machineGun_fire,

						fire: function() {

							new Bullet(0, this.attackPower);
						}
					},

					shotgun: {

						latency: 1000,

						times: 10,

						attackPower: 0.5,

						audio: Audios.shotgun_fireReload,

						rangeDegree: 60,

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

							new Particle(Smoke,
								Paddle.x.value + Paddle.width.value / 2,
								Size.paddleY,
								{
									latency: 24,
									number: 15
								}
							).launch();
						}
					},

					singleBullet: {

						latency: 0,

						times: 1,

						attackPower: 1,

						audio: Audios.laser_fire,

						fire: function() {

							new Bullet(0, this.attackPower);
						}
					}
				}
			};

			var BallSpeed = {

				timer: void 0,

				duration: 10000,

				set: function(SCALE, DURATION) {

					var timer = this.timer;

					if (timer) {
						clearTimeout(timer);
					}

					Size.ballPower = Size.power * SCALE;

					this.timer = setTimeout(this.end, DURATION || this.duration);
				},

				end: function() {

					clearTimeout(BallSpeed.timer);
					Size.ballPower = Size.power;
				}
			};

			var ThruMode = {

				active: false,

				timer: void 0,

				duration: 5000,

				start: function() {

					clearTimeout(this.timer);

					this.active = true;
					this.timer = setTimeout(function() {

						ThruMode.active = false;
					}, this.duration);
				}
			};

			function Buff(BRICK) {

				var power = Size.power / 60;

				this.x = BRICK.x;
				this.dX = (Math.random() > 0.5 ? 1 : -1) * power / 20;
				this.y = BRICK.y;
				this.dY = -power / 6;
				this.ddY = power / 6 / 30;
				this.zIndex = 2;
				this.width = Size.brickWidth;
				this.height = Size.brickHeight;
				this.toX = this.width / 2;
				this.toY = this.height / 2;
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
				this.image = Images.buffExtend;
				this.catched = false;
				this.display = true;

				FieldCanvas.appendSprite(this);
			}

			Buff.prototype = {
				constructor: Buff,

				update: function() {

					if (this.catched) {
						var opacity = this.opacity -= 0.05;

						this.scaleX -= 0.05;
						this.scaleY -= 0.05;

						if (opacity <= 0) {
							this.destroy();
							return true;
						}
					} else {
						var x = this.x += this.dX;
						var y = this.y += this.dY;

						this.dY += this.ddY;

						if (Paddle.alive && y >= Size.buffFloor && y <= Size.paddleBottom) {
							var paddleX = Paddle.x.value;
							var paddleWidth = Paddle.width.value;
							var paddleRight = paddleX + paddleWidth;

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
					CTX.rotate(this.rotateZ * PIDivided180);
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
						name: 'speedUp',

						buff: function() {

							BallSpeed.set(1.5);
						}
					},

					{
						name: 'speedDown',

						buff: function() {

							BallSpeed.set(0.5);
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
					}
				]
			};

			function Particle(PARTICLE, X, Y, PROPS) {

				this.x = X;
				this.y = Y;
				this.latency = 0;
				this.number = 0;
				this.particle = PARTICLE;
				this.particleProps = void 0;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				this.timer = void 0;
				this.progress = this.progress.bind(this);
				this.endActions = [];
			}

			Particle.prototype = {
				constructor: Particle,

				addEndAction: function(ACTION) {

					this.endActions.push(ACTION);

					return this;
				},

				launch: function() {

					this.progress();
					this.timer = setInterval(this.progress, this.latency);
				},

				progress: function() {

					if (!this.number) { // end
						clearInterval(this.timer);

						var endActions = this.endActions;

						for (var i = 0, l = endActions.length; i < l; i++) {
							endActions[i]();
						}
					} else if (!system.isPause) {
						new this.particle(this.x, this.y, this.particleProps);
						this.number--;
					}
				}
			};

			function Smoke(X, Y, PROPS) {

				var radius = Size.smokeRadius;
				var wayX = Math.random() > 0.5 ? 1 : -1;

				this.x = X - radius;
				this.y = Y - radius;
				this.dX = Math.random() * 1.5 * wayX;
				this.dY = -(Math.random() + 1) * Size.power / 100;
				this.scale = 0.05;
				this.dScale = 0.025;
				this.rotateZ = Math.random() * 360;
				this.dRotateZ = 10 * wayX;
				this.opacity = 1;
				this.image = Images['smoke' + (Math.random() > 0.5 ? 0 : 1)];
				this.display = true;
				this.count = 0;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				FieldCanvas.appendSprite(this);
			}

			Smoke.prototype = {
				constructor: Smoke,

				update: function() {

					this.x += this.dX;
					this.y += this.dY;
					var scale = this.scale += this.dScale;
					this.rotateZ += this.dRotateZ;

					var opacity = this.opacity *= 0.94;

					//if (scale >= 1) {
					//if (opacity < 0.01) {
					if (this.count++ > 30) {
						this.destroy();
						return;
					}

					this.dY *= 0.94;
					this.dRotateZ *= 0.96;
				},

				render: function(CTX) {

					var diameter = Size.smokeDiameter;
					var radius = Size.smokeRadius;
					var scale = this.scale;

					CTX.save();
					CTX.translate(this.x + radius, this.y + radius);
					CTX.rotate(this.rotateZ * PIDivided180);
					CTX.translate(-radius * scale, -radius * scale);
					CTX.scale(scale, scale);
					CTX.globalAlpha = this.opacity;

					//var opacity = this.opacity;
					//var frameIndex = Math.floor((1 - opacity) / 0.25);
					var image = this.image;
					var imageSize = image.height;

					CTX.drawImage(image,
						//imageSize * frameIndex, 0, imageSize, imageSize,
						0, 0, imageSize, imageSize,
						0, 0, diameter, diameter
					);
					CTX.restore();
				},

				destroy: function() {

					this.isDead = true;
				}
			};

			var ScrapColors = [
				'#333333',
				'#666666',
				'#999999',
				'#CCCCCC'
			];
			var ScrapColorNumber = ScrapColors.length;

			function Explosion(X, Y, PROPS) {

				var ballRadius = Size.ballRadius; // for calculate random region
				var radius = Size.explosionRadius;
				var image = Images.explosion0;

				var biasX = (Math.random() > 0.5 ? 1 : -1) * Math.random() * ballRadius;
				var biasY = (Math.random() > 0.5 ? 1 : -1) * Math.random() * ballRadius;

				X += biasX;
				Y += biasY;

				this.x = X - radius;
				this.y = Y - radius;
				this.dX = 0;
				this.dY = 0;
				this.toX = radius;
				this.toY = radius;
				this.scale = 0.05;
				this.dScale = (0.4 + Math.random()) * 0.04;
				this.rotateZ = Math.random() * 360;
				this.dRotateZ = (Math.random() > 0.5 ? 1 : -1) * 1;
				this.opacity = 1;
				this.dOpacity = 0.96;
				this.image = Images.explosion0;
				this.display = true;
				this.count = 0;

				for (var propName in PROPS) {
					this[propName] = PROPS[propName];
				}

				var scraps = [];

				for (var i = 0; i < 2; i++) {
					scraps.push({
						size: Math.random() * ballRadius + ballRadius,
						x: X,
						y: Y,
						dx: Math.random() * (Math.random() > 0.5 ? 1 : -1) * ballRadius * 1,
						dy: Math.random() * (Math.random() > 0.95 ? 1 : -1) * ballRadius * 2,
						color: ScrapColors[Math.floor(Math.random() * ScrapColorNumber)]
					});
				}
				this.scraps = scraps;

				FieldCanvas.appendSprite(this);
			}

			Explosion.prototype = {
				constructor: Explosion,

				update: function() {

					var scale = this.scale += this.dScale;
					var opacity = this.opacity *= this.dOpacity;

					this.x += this.dX;
					this.y += this.dY;
					this.rotateZ += this.dRotateZ;
					
					///if (scale >= 1) {
					//if (opacity < 0.01) {
					if (this.count++ > 30) {
						this.destroy();
						return;
					} else if (!this.switched && scale >= 1) {
						this.image = Images.explosion1; // smoke
						this.opacity = 1;
						this.dOpacity = 0.94;
						this.dScale *= 0.5;
						this.switched = true;
					}

					this.dRotateZ *= 0.96;

					var scraps = this.scraps;

					for (var i = 0, l = scraps.length; i < l; i++) {
						var scrap = scraps[i];

						scrap.size *= 0.98;
						scrap.x += scrap.dx;
						scrap.y += scrap.dy;
						scrap.dy += 0.5;
					}
				},

				render: function(CTX) {

					var s = Size;
					var radius = s.explosionRadius;
					var diameter = s.explosionDiameter;
					var scale = this.scale;

					CTX.save();
					CTX.translate(this.x + radius, this.y + radius);
					CTX.rotate(this.rotateZ * PIDivided180);
					CTX.translate(-radius * scale, -radius * scale);
					CTX.scale(scale, scale);
					CTX.globalAlpha = this.opacity;

					var image = this.image;

					CTX.drawImage(image,
						0, 0, image.width, image.height,
						0, 0, diameter, diameter
					);
					CTX.restore();

					CTX.save();
					var scraps = this.scraps;

					for (var i = 0, l = scraps.length; i < l; i++) {
						var scrap = scraps[i];
						var size = scrap.size;

						CTX.fillStyle = scrap.color;
						CTX.fillRect(scrap.x, scrap.y, size, size);
					}
					CTX.restore();
				},

				destroy: function() {

					this.isDead = true;
				}
			};

			function WormholeLight(X, Y, PROPS) {

				var width = Size.brickWidth;
				var baseScale = Wormhole.prototype.baseScale;
				var wormholeRadius = width * baseScale / 2;
				var padding = (width * baseScale - width) / 2;
				var wayX = getRandomWay();
				var wayY = getRandomWay();
				var endX = X - padding + wormholeRadius;
				var endY = Y - padding + wormholeRadius;
				var distanceX = wormholeRadius * Math.random();
				//var distanceY = wormholeRadius * Math.random();
				var distanceY = wormholeRadius - distanceX;
				var frameNumber = this.frameNumber;

				this.endX = endX; // destination
				this.endY = endY;
				this.x = endX + distanceX * -wayX;
				this.y = endY + distanceY * -wayY;
				this.dX = distanceX / frameNumber * wayX;
				this.dY = distanceY / frameNumber * wayY;
				this.size = Math.random() * width * 0.2;
				this.radius = this.size / 2;
				this.scale = 1;
				this.opacity = Math.random();
				this.display = true;
				this.frameCount = 0;

				FieldCanvas.appendSprite(this);
			}

			WormholeLight.prototype = {
				constructor: WormholeLight,

				frameNumber: 60,

				update: function() {

					this.x += this.dX;
					this.y += this.dY;
					//this.opacity *= 0.98;
					this.scale *= 0.96;

					if (++this.frameCount === this.frameNumber) {
						this.destroy();
					}
				},

				render: function(CTX) {

					var radius = this.radius;
					var scale = this.scale;

					CTX.save();
					CTX.translate(this.x + radius, this.y + radius);
					CTX.translate(-radius * scale, -radius * scale);
					CTX.scale(scale, scale);

					CTX.beginPath();
					CTX.arc(0, 0, radius, 0, Math.PI * 2);
					//CTX.globalAlpha = this.opacity;
					CTX.fillStyle = '#FFFFFF';
					CTX.fill();
					CTX.restore();
				},

				destroy: function() {

					this.isDead = true;
				}
			};

			var Info = {

				update: function() {

					InfoText.setText(
						'Ball attack power: ' + Math.round(BallAttackPower.value) + '\n' +
						'Paddle width: ' + Math.round(Paddle.width.value) + '\n' +
						'Total: ' + (Resource.r + Resource.g + Resource.b)
					);
				}
			};

			var Resource = {

				r: 0,

				g: 0,

				b: 0,

				collect: function(R, G, B) {

					var r = this.r += R;
					var g = this.g += G;
					var b = this.b += B;
					var baseNumber = innerHeight / 100;

					BallAttackPower.add(R / 100);
					Paddle.width.add(baseNumber * G / 100);

					Info.update();
				}
			};

			function getRandomWay() {

				return Math.random() >= 0.5 ? 1 : -1;
			}

			function shuffleArray(ARRAY) {

				var l = ARRAY.length;
				var temp;

				for (var i = 0; i < l; i++) {
					var rIndex = Math.floor(Math.random() * l);

					temp = ARRAY[rIndex];
					ARRAY[rIndex] = ARRAY[0];
					ARRAY[0] = temp;
				}

				temp = null;
			}

			// system
			var system = {

				autoPlay: false,

				isPause: true,

				renderType: 0,

				init: function() {
					// generate bricks
					/*for (var i = 0; i < BrickX; i++) {
						for (var j = 0; j < BrickY; j++) {
							var brick = Bricks[i][j];

							if (!brick.live.value) {
								if (Math.random() > 0.2) {
									brick.addColor(
										Math.round(Math.random() * 3),
										Math.round(Math.random() * 3),
										Math.round(Math.random() * 3)
									);
								}
							}
						}
					}
					console.log(Bricks);*/

					//Paddle.recordX();
					//BallUpdater.init();
					// launch canvas loop
					this.continue();
				},

				toggle: function() {

					if (this.isPause) {
						this.continue();
					} else {
						this.pause();
					}
				},

				pause: function() {

					FieldCanvas.stop();
					BallUpdater.pause();
					this.isPause = true;
				},

				continue: function() {

					FieldCanvas.launch();
					BallUpdater.continue();
					this.isPause = false;
				},

				failed: function() {

					BulletMode.stop();
					BallSpeed.end();
					BallUpdater.stopBall();
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
				Brick.prototype.generateKeyframeSet();
				BombBrick.prototype.generateKeyframeSet();
				JellyBrick.prototype.generateKeyframeSet();

				window.addEventListener('resize', function() {

					sizeCalculating();
					resizeObjects();
				});

				Paddle.init();

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
						console.log('singlgBullet');

						BulletMode.start('singleBullet');
					} else if (key === '9') {
						console.log('thruMode');

						ThruMode.start();
					} else if (key === ' ') { // space
						system.toggle();
					}  else if (key === 'b') { // bomb
						for (var x = 0; x <= BrickX; x++) {
							for (var y = 0; y <= BrickY; y++) {
								var b = Bricks[x][y];

								if (b && b.live.value && b.constructor === BombBrick) {
									b.hit(1);
									return;
								}
							}
						}
					} else if (key === 'l') { // load data
						var data = JSON.parse(localStorage.getItem('brickData'));
						
						generateBricks(data);
					} else if (key === 'r') { // random mode
						var rData = [];

						for (var x = 0; x < BrickX; x++) {
							var dataXs = [];

							rData.push(dataXs);

							for (var y = 0; y < BrickY; y++) {
								var typeChance = Math.random();
								var rgb = [0, 0, 0];
								var type;

								if (typeChance < 0.98) {
									type = 0;

									if (typeChance > 0.8) {
										rgb[0] = Math.floor(Math.random() * ColorLevel);
										rgb[1] = Math.floor(Math.random() * ColorLevel);
										rgb[2] = Math.floor(Math.random() * ColorLevel);
									}
								} else if (typeChance < 0.985) {
									type = 1;
								} else if (typeChance < 0.99) {
									type = 2;
								} else if (typeChance < 0.995) {
									type = 3;
								} else if (typeChance < 1) {
									type = 4;
								}

								dataXs.push({
									type: type,
									rgb: rgb
								});
							}
						}

						generateBricks(rData);
					} else if (key === 'i') { // infinite mode
						/*var iData = [];

						for (var x = 0; x < BrickX; x++) {
							var dataXs = [];

							iData.push(dataXs);
							for (var y = 0; y < BrickY; y++) {
								dataXs.push({
									type: 0,
									rgb: [0, 0, 0]
								});
							}
						}

						generateBricks(iData);*/

						var maxTime = 3 * 60 * 1000;
						var elapsed = 0;
						var lastTime = Date.now();
						var latency = 1000;
						var generate = function() {

							if (!system.isPause) {
								var now = Date.now();

								elapsed += now - lastTime;
								lastTime = now;

								var x = Math.floor(Math.random() * BrickX);
								var y = Math.floor(Math.random() * BrickY);
								var brick = Bricks[x][y];

								if (!brick || brick.isDead) {
									var random = Math.random();

									if (random < 0.9) {
										var r = Math.floor(Math.random() * ColorLevel);
										var g = Math.floor(Math.random() * ColorLevel);
										var b = Math.floor(Math.random() * ColorLevel);

										if (r + g + b) { // not 0
											brick = new Brick(x, y);
											brick.setColor(r, g, b);
										}
									} else {
										var type = Math.ceil(Math.random() * 3);

										if (type === 1) {
											brick = new BallBrick(x, y);
										} else if (type === 2) {
											brick = new BombBrick(x, y);
										} else if (type === 3) {
											brick = new JellyBrick(x, y);
										}
									}

									Bricks[x][y] = brick;

									if (brick) {
										FieldCanvas.appendSprite(brick);
										FieldCanvas.toRenderPassiveCanvas = true;
									}
								}

								if (latency > 16) {
									latency -= 1;
								}
							} else {
								lastTime = Date.now();
							}

							if (elapsed < maxTime) {
								setTimeout(generate, latency);
							} else {
								console.log('time\'s up');
								system.pause();
							}
						};

						setTimeout(generate, latency);
					}
				});

				system.init();
				BallUpdater.init();
				Editor.init(Ratio, Size, ColorLevel, MineLiveMultiplier);
			}

			init();
		});
	});

})();