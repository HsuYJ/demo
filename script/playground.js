/* jshint shadow:true */
(function() {
	// field
	var ScopeName = 'Playground';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	var Ratio, Size, Parameter, Settings, ColorLevel, ValuePerLevel, MineLiveMultiplier, FieldTransition, Images, Audios, FinalBoard;
	var PIDivided180 = Math.PI / 180;
	var PIx2 = Math.PI * 2;

	function installCSS() {

		var r = Ratio;
		var holderWidth = r.fieldWidth + r.infoPanelWidth;

		var css = Md.Css(ScopeName)
		.addSelector({
			'.holder': {
				//background: 'url(./image/bg.svg) center center no-repeat',
				//'background-size': 'cover',
				'background-color': '#000000',

				'> *': {
					position: 'absolute'
				}
			},

			'.doubleCenter': {
				margin: 'auto',
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},

			'.fieldHolder': {
				width: r.fieldWidth + 'vh',
				height: '100%',
				background: '#000000',
				//background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))',
				//background: '#FFFFFF',

				' *': {
					//position: 'absolute',
					width: '100%',
					'will-change': 'transform',

					'&.explosionShock': {
						'animation-name': 'explosionShock',
						'animation-duration': '1000ms',
						'animation-iteration-count': 1
					},
				},

				'> .infoHolder': {
					height: r.infoPanelHeight + 'vh',
					//'background-color': 'rgba(0, 0, 0, 0.1)'
				},

				'.canvasHolder': {
					//width: r.fieldWidth + 'vh',
					height: r.canvasHeight + 'vh',
					'box-shadow': '0 0 0 0.5vh rgba(255, 255, 255, 0.1)',
					//background: 'url(./image/bg.svg) center center no-repeat',
					//'background-size': '100%',

					'> *': {
						position: 'absolute'
					},

					'> .indicator': {
						overflow: 'hidden',
						top: Ratio.indicatorY + 'vh',
						width: '100%',
						height: Ratio.indicatorHeight + 'vh',

						'> .indicatorLayer': {
							position: 'relative',
							width: '100%',
							height: 100 * 5 + '%',

							'> *': { // infos
								position: 'relative',
								width: '100%',
								height: 100 / 5 + '%',
								background: 'center center no-repeat',
								'background-size': 'auto 100%',
								transition: 'transform 150ms'
							}
						}
					},

					'> .interlacedFilter': {
						top: 0,
						width: '100%',
						height: '100%',
						//background: 'url(./image/rect_1x2_white_5.png)',
						background: 'url(./image/rect_1x2_black_5.png)',
						'image-rendering': 'pixelated'
					},
				}
			},

			'.gameIndicator': {
				left: '50%',
				top: '20vh',
				'font-size': '10vh',
				'font-weight': 'bold',
				color: '#FFFFFF',
				/*transition: 'opacity 1000ms, transform 1000ms',
				transform: 'translate3d(-50%, -50%, 0) scale(1, 0)',

				'&.show': {
					transform: 'translate3d(-50%, -50%, 0) scale(1, 1)'
				}*/
			},

			'.floatingMenu': {
				padding: '1vh',
				display: 'none',
				left: '50%',
				top: '10vh',
				width: '40vh',
				'background-color': '#CCC',
				transform: 'translate3d(-50%, 0, 0)',

				'&.show': {
					display: 'block'
				},

				'> .title, .optionHolder > *': {
					height: '4vh',
					'line-height': '4vh'
				},

				'> .title': {
					'text-align': 'center'
				},

				'> .optionHolder': {
					'background-color': '#000',
					color: '#FFFFFF',

					'> *': {
						display: 'block',
					}
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

	var MainHolder;
	var Holder,
		FieldHolder, Field, FieldCanvas,
		Indicator, IndicatorCanvas,
		InfoHolder, InfoText;
	var GameIndicator, GameIndicator_sub;
	var FloatingMenu;

	function generateDom() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.appendChildren(

			FieldHolder = mdom().addClass('fieldHolder', 'doubleCenter')
			.appendChildren(

				InfoHolder = mdom().addClass('infoHolder')
				.appendChildren(

					InfoText = mtext('this is info')
				),

				mdom().addClass('canvasHolder')
				.appendChildren(

					Field = mdom(null, 'canvas'),

					Indicator = mdom().addClass('indicator')
					.addState('index', mstate(-1).addHandler({
						handler: function() {

							var index = this.value;
							var target = this.target.children[0];
							var infos = target.children;

							for (var i = 0, l = infos.length; i < l; i++) {
								infos[i].setTransform('scale', '1, 0');
							}

							if (index !== -1) {
								target.setTransform('translateY', -index * 20 + '%');
								infos[index].setTransform('scale', '1, 1');
							}
						}
					}))
					.appendChild(

						mdom().addClass('indicatorLayer')
						.appendChildren(

							mdom()
							.setStyle('backgroundImage', 'url(./image/indicator_getReady.svg)')
							.setTransform('translateY', 0),

							mdom()
							.setStyle('backgroundImage', 'url(./image/indicator_go.svg)')
							.setTransform('translateY', 0),

							mdom()
							.setStyle('backgroundImage', 'url(./image/indicator_victory.svg)')
							.setTransform('translateY', 0),

							mdom()
							.setStyle('backgroundImage', 'url(./image/indicator_defeated.svg)')
							.setTransform('translateY', 0)
						)
					),

					mdom().addClass('interlacedFilter')
				)
			),

			GameIndicator = mtext('VICTORY', null, 'div').addClass('gameIndicator')
			.setTransforms(
				['translateX', '-50%'],
				['scaleY', 0]
			),

			GameIndicator_sub = mtext('GO', null, 'div').addClass('gameIndicator')
			.setTransforms(
				['translateX', '-50%'],
				['scaleY', 0]
			),

			FloatingMenu = mdom().addClass('floatingMenu')
			.appendChildren(

				mtext('Menu', null, 'div').addClass('title'),

				mdom().addClass('optionHolder')
				.appendChildren(

					mtext('Continue')
					.addEventListener('continue', 'click', function() {

						//FieldCanvas.entity.requestPointerLock();
						System.requestPointerLock();
					}),

					mtext('Exit')
					.addEventListener('exit', 'click', function() {

						System.exit();
					})
				)
			)
		)
		.mount(MainHolder);

		// generate Canvas
		FieldCanvas = new Canvas(Field.entity);
		FieldCanvas.resize(Size.fieldWidth, Size.canvasHeight);
	}

	function resizeDom() {

		var s = Size;


		setProps(Paddle, {
			y: s.paddleY,
			originWidth: s.paddleWidth,
			width: s.paddleWidth,
			height: s.paddleHeight,
			//toY: s.paddleHeight + s.vh * 2 // bottom
			toY: s.paddleHeight // bottom
		});
	}

	function Canvas(CANVAS) {

		var ctx = CANVAS.getContext('2d');

		this.entity = CANVAS;
		this.ctx = ctx;
		this.width = CANVAS.width;
		this.height = CANVAS.height;
		this.toX = CANVAS.width / 2;
		this.toY = CANVAS.height / 2;
		this.delayCallbackSN = 1;
		this.delayCallbacks = [];
		this.sprites = [];
		this.backgroundSprites = [];
		this.launchTime = 0;
		this.lastFrameIndex = 0;
		this.onProgress = false;
		this.progressDuration = 16.667;
		this.progress = this.progress.bind(this);
		this.passiveCanvas = void 0;
		this.passiveCtx = void 0;
		this.onRenderPassiveCanvas = false;
		this.onTransform = 0;
		this.transforms = {
			zoomScale: { onTransform: false, targetValue : 0, delta: 0, isRound: false, next: [] }
		};
		this.zoomScale = 1;
		this.shakeProgress = 0;
		this.shakeX = 0;
		this.shakeY = 0;

		var passiveCanvas = CANVAS.cloneNode();

		this.passiveCanvas = passiveCanvas;
		this.pCtx = passiveCanvas.getContext('2d');
	}

	Canvas.prototype = {
		constructor: Canvas,

		resize: function(WIDTH, HEIGHT) {

			var entity = this.entity;
			var passiveCanvas = this.passiveCanvas;

			this.width = entity.width = passiveCanvas.width = WIDTH;
			this.height = entity.height = passiveCanvas.height = HEIGHT;
			this.toX = WIDTH / 2;
			this.toY = HEIGHT / 2;
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

		appendBackgroundSprite: function(SPRITE) {

			SPRITE.canvas = this;
			this.backgroundSprites.push(SPRITE);

			return this;
		},

		insertSpriteBefore: function(SPRITE, TARGET_SPRITE) {

			var self = this;

			this.addDelayCallback(1, function() { // wait for one frame to prevent affect order of progress

				var sprites = self.sprites;
				var index = sprites.indexOf(TARGET_SPRITE);

				SPRITE.canvas = self;
				sprites.splice(index, 0, SPRITE);
			});

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

		removeBackgroundSprite: function(SPRITE, INDEX) {

			var sprites = this.backgroundSprites;
			var index = INDEX !== void 0 ? INDEX : sprites.indexOf(SPRITE);

			SPRITE.canvas = void 0;
			sprites.splice(index, 1);

			return this;
		},

		setProgressSpeed: function(SPEED) { // 0.5 = 50%

			var progressSpeed = 1 / SPEED;

			this.progressDuration = progressSpeed * 16.667;

			return this;
		},

		launch: function() {

			if (!this.onProgress) {
				this.launchTime = performance.now();
				this.lastFrameIndex = 0;
				this.onProgress = requestAnimationFrame(this.progress);

				this.lastUpdateTime = performance.now();
			}
		},

		stop: function() {

			cancelAnimationFrame(this.onProgress);
			this.onProgress = false;
		},

		progress: function() { // not for user

			var now = performance.now();
			var progress = (now - this.lastUpdateTime) / this.progressDuration;

			this.lastUpdateTime = now;

			if (progress) { // > 0
				var onTransform = this.onTransform;
				var i;

				if (onTransform) {
					var transforms = this.transforms;

					for (i in transforms) {
						var transform = transforms[i];

						if (transform.onTransform) {
							var delta = transform.delta * progress;
							var value = this[i] + delta;
							if (transform.isRound) {
								value = Math.round(value);
							}
							var targetValue = transform.targetValue;
							var isEnd;

							if (delta > 0) {
								isEnd = value >= targetValue;
							} else {
								isEnd = value <= targetValue;
							}

							if (isEnd) { // end of transform
								this[i] = transform.targetValue;
								transform.onTransform = false;
								onTransform--;
							} else {
								this[i] = value;
							}
						}
					}

					this.onTransform = onTransform;
				}

				var shakeProgress = this.shakeProgress;

				if (shakeProgress > 0) {
					var shakeRange = Size.shakeRange * Math.pow(0.98, (60 - shakeProgress));

					this.shakeX = getRandomWay() * shakeRange;
					this.shakeY = getRandomWay() * shakeRange;
					this.shakeProgress -= progress;
				} else {
					this.shakeProgress = 0;
				}

				var sprites = this.sprites;
				var sprite;

				for (i = sprites.length - 1; i >= 0; i--) {
					sprite = sprites[i];

					if (sprite.toTop) {
						sprite.toTop = false;
						sprites.splice(i, 1);
						sprites.push(sprite);
						i++;
						break;
					} else if (!sprite.renderOnly && !sprite.isPassive) {
						sprite.update(progress);
					}

					if (sprite.isDead) {
						this.removeSprite(sprite, i);
					}
				}

				var backgroundSprites = this.backgroundSprites;

				for (i = backgroundSprites.length - 1; i >= 0; i--) {
					sprite = backgroundSprites[i];
					sprite.update(progress);

					if (sprite.isDead) {
						this.removeBackgroundSprite(sprite, i);
					}
				}

				var callbacks = this.delayCallbacks;

				for (i = callbacks.length - 1; i >= 0; i--) {
					var callback = callbacks[i];

					if (callback.remove) {
						callbacks.splice(i, 1);
					} else if ((callback.frameNumber += progress) >= callback.targetFrameNumber) {
						callback.callback();
						callbacks.splice(i, 1);
					}
				}
			}
			// render
			this.render();

			if (this.onProgress) { // request next progress
				this.onProgress = requestAnimationFrame(this.progress);
			}
		},

		progress2: function() { // not for user

			var now = performance.now();
			var frameIndex = (now - this.launchTime) / this.progressDuration;
			var progress = frameIndex - this.lastFrameIndex;

			if (progress >= 0.5) { // progress is greater than 1 after rounding, update sprites
				progress = Math.round(progress);
				this.lastFrameIndex += progress;

				var i;

				if (this.onTransform) {
					var transforms = this.transforms;

					for (i in transforms) {
						var transform = transforms[i];
						var length = transform.length;

						if (length) {
							this[i] = transform.pop();

							if (length === 1) {
								this.onTransform--;
							}
						}
					}
				}

				var shakeProgress = this.shakeProgress;

				if (shakeProgress) {
					var shakeRange = Size.shakeRange * Math.pow(0.98, (60 - shakeProgress));

					this.shakeX = getRandomWay() * shakeRange;
					this.shakeY = getRandomWay() * shakeRange;
					this.shakeProgress--;
				}

				var sprites = this.sprites;
				var sprite;

				for (i = sprites.length - 1; i >= 0; i--) {
					sprite = sprites[i];

					if (sprite.toTop) {
						sprite.toTop = false;
						sprites.splice(i, 1);
						sprites.push(sprite);
						i++;
						break;
					} if (sprite.isDead) {
						this.removeSprite(sprite, i);
					} else if (!sprite.renderOnly && !sprite.isPassive) {
						sprite.update(progress);
					}
				}

				var backgroundSprites = this.backgroundSprites;

				for (i = backgroundSprites.length - 1; i >= 0; i--) {
					sprite = backgroundSprites[i];

					if (sprite.isDead) {
						this.removeBackgroundSprite(sprite, i);
					} else {
						sprite.update(progress);
					}
				}

				var callbacks = this.delayCallbacks;

				for (i = callbacks.length - 1; i >= 0; i--) {
					var callback = callbacks[i];

					if (callback.remove) {
						callbacks.splice(i, 1);
					} else if ((callback.frameNumber += progress) >= callback.targetFrameNumber) {
						callback.callback();
						callbacks.splice(i, 1);
					}
				}
			}
			// render
			this.render();

			if (this.onProgress) { // request next progress
				this.onProgress = requestAnimationFrame(this.progress);
			}
		},

		render: function() { // not for user

			var sprites = this.sprites;
			var spriteNumber = sprites.length;
			var width = this.width;
			var height = this.height;
			var i, l, sprite;

			if (this.toRenderPassiveCanvas) {
				var pCtx = this.pCtx;

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
			
			var toX = this.toX;
			var toY = this.toY;
			var zoomScale = this.zoomScale;
			var ctx = this.ctx;

			ctx.save();
			ctx.clearRect(0, 0, width, height);
			ctx.translate(toX + this.shakeX, toY + this.shakeY);
			ctx.translate(-toX * zoomScale, -toY * zoomScale);
			ctx.scale(zoomScale, zoomScale);
			// draw background sprite to main canvas
			var backgroundSprites = this.backgroundSprites;
			var backgroundSpriteNumber = backgroundSprites.length;

			for (i = 0; i < backgroundSpriteNumber; i++) {
				backgroundSprites[i].render(ctx);
			}
			// draw passive canvas to main canvas
			ctx.drawImage(this.passiveCanvas, 0, 0);
			// draw non-passive sprite to main canvas
			for (i = 0; i < spriteNumber; i++) {
				sprite = sprites[i];

				if (sprite.display) {
					if (!sprite.isPassive) {
						sprite.render(ctx);
					}
				}
			}

			if (zoomScale > 1) {
				ctx.translate(toX + this.shakeX, toY + this.shakeY);
				ctx.translate(-toX * zoomScale, -toY * zoomScale);
				ctx.scale(zoomScale, zoomScale);
				//for (i = 0; i < 2; i++) {
					ctx.drawImage(this.entity, 0, 0);
				//}
			}

			ctx.restore();
		},

		setSpritePassive: function(SPRITE, IS_PASSIVE) {

			if (SPRITE.isPassive !== IS_PASSIVE) {
				SPRITE.isPassive = IS_PASSIVE;
				this.toRenderPassiveCanvas = true;
			}
		},

		renderPassiveCanvas: function() {

			var sprites = this.sprites;
			var pCtx = this.pCtx;

			for (var i = 0, l = sprites.length; i < l; i++) {
				sprite = sprites[i];

				if (sprite.isPassive && sprite.display) {
					sprite.render(pCtx);
				}
			}
		},

		addDelayCallback: function(FRAME_NUMBER, CALLBACK, MS) { // MS: Boolean, unit of FRAME_NUMBER is millisecond

			var sn = this.delayCallbackSN++;

			if (MS) {
				FRAME_NUMBER = Math.floor(FRAME_NUMBER / 16.667);
			}

			this.delayCallbacks.push({
				sn: sn,
				frameNumber: 0,
				targetFrameNumber: FRAME_NUMBER,
				callback: CALLBACK
			});

			return sn;
		},

		removeDelayCallback: function(SN) {

			var callbacks = this.delayCallbacks;

			for (var i = 0, l = callbacks.length; i < l; i++) {
				var callback = callbacks[i];

				if (callback.sn === SN) {
					callback.remove = true; // mark remove
					break;
				}
			}
		},

		// visual mathods

		zoomTo: function(TARGET_VALUE, DURATION) { // positive or negative integer, transition time

			var transform = this.transforms.zoomScale;
			var presentValue = this.zoomScale;
			var frameNumber = DURATION / 16.667;

			transform.onTransform = true;
			transform.targetValue = TARGET_VALUE;
			transform.delta = (TARGET_VALUE - presentValue) / frameNumber; // delta per frame
			transform.isRound = false;
			this.onTransform++;
		},

		zoomTo2: function(TARGET_VALUE, DURATION) { // positive or negative integer, transition time

			var transform = this.transforms.zoomScale;
			var presentValue = this.zoomScale;
			var gap = TARGET_VALUE - presentValue;
			var frameNumber = Math.round(DURATION / 16);
			var delta = gap / frameNumber;
			var value = presentValue;

			for (var i = 0, l = frameNumber - 1; i < l; i++) {
				transform.push(value += delta);
			}

			transform.push(TARGET_VALUE);
			transform.reverse();
			this.onTransform++;
		},

		shake: function(DURATION) {

			this.shakeProgress = 60;
		},
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
		var dpf = gap / frameNumber; // delta 
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

	function setTransforms(SPRITE, PROPS, DURATION) { // old

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

	function setTransform2(SPRITE, PROP_NAME, TARGET_VALUE, DURATION, ROUND) { // new, only Paddle use it

		var presentValue = SPRITE[PROP_NAME];
		if (typeof presentValue === 'object') { // mstate
			presentValue = presentValue.value;
		}
		var gap = TARGET_VALUE - presentValue;
		var frameNumber = DURATION / 16 || 1;
		var dpf = gap / frameNumber; // delta per frame
		var transform = SPRITE.transforms[PROP_NAME];
		var l = transform.length;
		var i;

		if (l) {
			for (i = 0; i < l; i++) {
				transform.pop();
			}

			SPRITE.onTransform--;
		}

		if (ROUND) {
			for (i = 0, l = frameNumber - 1; i < l; i++) {
				transform.push(Math.round(i * dpf + presentValue));
			}
		} else {
			for (i = 0, l = frameNumber - 1; i < l; i++) {
				transform.push(i * dpf + presentValue);
			}
		}

		transform.push(TARGET_VALUE);
		transform.reverse();
		SPRITE.onTransform++;
	}

	function setTransforms2(SPRITE, PROPS, DURATION, ROUND) { // new, only Paddle use it

		var frameNumber = DURATION / 16 || 1;
		var transforms = SPRITE.transforms;

		for (var propName in PROPS) {
			var presentValue = SPRITE[propName];
			if (typeof presentValue === 'object') { // mstate
				presentValue = presentValue.value;
			}
			var targetValue = PROPS[propName];
			var gap = targetValue - presentValue;
			var dpf = gap / frameNumber; // delta per frame
			var transform = transforms[propName];
			var l = transform.length;
			var i;

			if (l) {
				for (i = 0; i < l; i++) {
					transform.pop();
				}
				SPRITE.onTransform--;
			}

			if (ROUND) {
				for (i = 0, l = frameNumber - 1; i < l; i++) {
					transform.push(Math.round(i * dpf + presentValue));
				}
			} else {
				for (i = 0, l = frameNumber - 1; i < l; i++) {
					transform.push(i * dpf + presentValue);
				}
			}

			transform.push(targetValue);
			transform.reverse();
			SPRITE.onTransform++;
		}
	}

	function setTransform3(SPRITE, PROP_NAME, TARGET_VALUE, DURATION, ROUND, KEYFRAME) { // 0508, only Paddle use it

		var transform = SPRITE.transforms[PROP_NAME];

		if (!KEYFRAME) { // clear nexts
			var transformNext = transform.next;
			var nextNumber = transformNext.length;

			if (nextNumber) {
				for (var i = 0; i < nextNumber; i++) {
					transformNext.pop();
				}
			}
		}

		var presentValue = SPRITE[PROP_NAME];
		if (typeof presentValue === 'object') { // mstate
			presentValue = presentValue.value;
		}
		var frameNumber = (DURATION / 16.667) || 1;
		
		transform.targetValue = TARGET_VALUE;
		transform.delta = (TARGET_VALUE - presentValue) / frameNumber; // delta per frame
		transform.isRound = ROUND;

		if (!transform.onTransform) {
			transform.onTransform = true;
			SPRITE.onTransform++;
		}
	}

	function setTransforms3(SPRITE, PROPS, DURATION, ROUND) { // 0508, only Paddle use it

		var frameNumber = (DURATION / 16.667) || 1;
		var transforms = SPRITE.transforms;

		for (var propName in PROPS) {
			var transform = transforms[propName];
			var transformNext = transform.next;
			var nextNumber = transformNext.length;

			if (nextNumber) { // remove nexts
				for (var i = 0; i < nextNumber; i++) {
					transformNext.pop();
				}
			}

			var presentValue = SPRITE[propName];
			if (typeof presentValue === 'object') { // mstate
				presentValue = presentValue.value;
			}
			var targetValue = PROPS[propName];

			transform.targetValue = targetValue;
			transform.delta = (targetValue - presentValue) / frameNumber; // delta per frame
			transform.isRound = ROUND;

			if (!transform.onTransform) {
				transform.onTransform = true;
				SPRITE.onTransform++;
			}
		}
	}

	function clearTransform(SPRITE, PROP_NAME) {

		var transform = SPRITE.transforms[PROP_NAME];
		var next = transform.next;

		for (var i = 0, l = next.length; i < l; i++) {
			next.pop();
		}

		if (transform.onTransform) {
			transform.onTransform = false;
			SPRITE.onTransform--;
		}
	}

	// setKeyframes
	function setKeyframes(SPRITE, KEYFRAMES) { // old

		var keyframes = SPRITE.keyframes;
		var firstFrame = KEYFRAMES[0];

		SPRITE.onKeyframe = true;
		keyframes.number = KEYFRAMES.length;
		keyframes.index = 0;
		keyframes.set = KEYFRAMES;
		setTransforms(SPRITE, firstFrame.props, firstFrame.duration);
	}

	function setKeyframes2(SPRITE, KEYFRAMES) { // new, only Paddle use
		// multiple sets of setTransforms
		var transforms = SPRITE.transforms;
		var firstProps;

		for (var i = 0, l = KEYFRAMES.length; i < l; i++) {
			var keyframe = KEYFRAMES[i];
			var frameNumber = keyframe.duration / 16 || 1;
			var lastFrameIndex = frameNumber - 1;
			var props = keyframe.props;

			for (var propName in props) {
				var transform = transforms[propName];
				var transformNumber = transform.length;
				var presentValue;
				// get present value and check weather to remove old transform
				if (i === 0) { // first frame
					// cache firstProps
					firstProps = props;
					// remove old transform
					if (transformNumber) {
						for (var t = 0; t < transformNumber; t++) {
							transform.pop();
						}
						SPRITE.onTransform--;
					}

					presentValue = SPRITE[propName];

					if (typeof presentValue === 'object') { // value type is mstate
						presentValue = presentValue.value;
					}
				} else {
					presentValue = transform[transformNumber - 1];
				}

				var prop = props[propName];
				var targetValue = prop.value;
				var isRound = prop.isRound;
				var gap = targetValue - presentValue;
				var dpf = gap / frameNumber; // delta per frame
				var j;

				if (isRound) {
					for (j = 0; j < lastFrameIndex; j++) {
						transform.push(Math.round(j * dpf + presentValue));
					}
				} else {
					for (j = 0; j < lastFrameIndex; j++) {
						transform.push(j * dpf + presentValue);
					}
				}

				transform.push(targetValue);
			}
		}

		for (var name in firstProps) {
			transforms[name].reverse();
			SPRITE.onTransform++;
		}
	}

	function setKeyframes3(SPRITE, KEYFRAMES) { // 0508, only Paddle use
		// multiple sets of setTransforms
		var transforms = SPRITE.transforms;
		var firstKeyframe = KEYFRAMES[0];
		var firstKeyframeProps = firstKeyframe.props;
		var firstKeyframeDuration = firstKeyframe.duration;
		var propName, prop;

		for (propName in firstKeyframeProps) {
			prop = firstKeyframeProps[propName];
			setTransform3(SPRITE, propName, prop.value, firstKeyframeDuration, prop.isRound);
		}
		// push remains to next
		for (var i = 1, l = KEYFRAMES.length; i < l; i++) {
			var keyframe = KEYFRAMES[i];
			var keyframeProps = keyframe.props;
			var keyframeDuration = keyframe.duration;

			for (propName in keyframeProps) {
				var transformNext = transforms[propName].next;
					prop = keyframeProps[propName];

				transformNext.push({
					targetValue: prop.value,
					duration: keyframeDuration,
					isRound: prop.isRound
				});
			}
		}

		for (propName in firstKeyframeProps) {
			transforms[propName].next.reverse();
		}
	}

	// progressCount
	function setProgressCount(SPRITE, PROGRESS_NAME, TARGET_COUNT, CALLBACK) {

		var counts = SPRITE.counts;

		counts[PROGRESS_NAME] = {
			count: 0,
			target: TARGET_COUNT,
			callback: CALLBACK
		};

		SPRITE.onProgressCount = true;
	}

	// setAnimation
	function setAnimation(SPRITE, IMAGE, FRAME_NUMBER, FPS) { // useless this project

		var animation = SPRITE.animation;

		animation.image = IMAGE;
		animation.frameNumber = FRAME_NUMBER;
		animation.fps = FPS;
		animation.dpf = 1000 / FPS;
		animation.index = 0;
		animation.lastUpdateTime = Date.now();
	}

	// Animator
	var Animators = {};
	var AnimatorSN = 0;

	function Animator(SPRITE) {

		this.target = SPRITE;
		this.updater = void 0;
		this.testType = 0; // 0: and, 1: or
		this.endTests = [];
		this.endActions = [];
		this.forceStop = false;
		this.sn = AnimatorSN;
		Animators[AnimatorSN++] = this;
		SPRITE.onAnimator = true;
	}

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

			this.destroy();
		},

		update: function() { // launchUpdate?

			if (Game.isPause) {
				requestAnimationFrame(this.update);
			} else {
				if (this.forceStop) { // force stop from outside animator
					return;
				}

				var target = this.target;

				this.updater(target);

				if (this.forceStop) { // force stop when execute updater
					return;
				}

				var isEnd = this.endTesting();

				if (isEnd) {
					var  endActions = this.endActions;

					for (var i = 0, l = endActions.length; i < l; i++) {
						endActions[i](target);
					}

					this.destroy();
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
		},

		destroy: function() {

			this.target.onAnimator = false;
			this.target = void 0;
			delete Animators[this.sn];
		}
	};

	var PreviousIndex = Math.floor(150 / 16);
	var Paddle = {

		init: function() {

			this.reset();
			FieldCanvas.appendSprite(this);
		},

		reset: function() {

			var s = Size;

			this.x.set(s.fieldWidth / 2);
			this.y = s.paddleY;
			this.originWidth = s.paddleWidth;
			this.width.set(s.paddleWidth);
			this.height = s.paddleHeight;
			this.toY = s.paddleHeight; // bottom
		},

		alive: false,

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

		opacity: 0,

		r: 255, g: 255, b: 255,

		getColor: function() {

			return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
		},

		display: true,

		isStill: true,

		onTransform: 0,

		transforms: generateTransforms('x', 'scaleX', 'scaleY', 'opacity', 'r', 'g', 'b'),

		onSelfUpdate: true,

		update: function(PROGRESS) { // min is 1

			if (this.onTransform) {
				var transforms = this.transforms;

				for (var i in transforms) {
					var transform = transforms[i];

					if (transform.onTransform) {
						var presentValue = this[i];
						var isState = typeof presentValue === 'object'; // mstate
						if (isState) {
							presentValue = presentValue.value;
						}
						var delta = transform.delta * PROGRESS;
						var value = presentValue + delta;
						if (transform.isRound) {
							value = Math.round(value);
						}
						var targetValue = transform.targetValue;
						var isEnd;

						if (delta > 0) {
							isEnd = value >= targetValue;
						} else {
							isEnd = value <= targetValue;
						}

						if (isEnd) { // end of transform, check next transform
							if (isState) {
								this[i].set(transform.targetValue);
							} else {
								this[i] = transform.targetValue;
							}

							transform.onTransform = false;
							this.onTransform--;
							// next transform
							var transformNext = transform.next.pop();

							if (transformNext) {
								setTransform3(this, i,
									transformNext.targetValue,
									transformNext.duration,
									transformNext.isRound,
									true // keyframe
								);
							}
						} else {
							if (isState) {
								this[i].set(value);
							} else {
								this[i] = value;
							}
						}
					}
				}
			}

			if (this.onSelfUpdate) {
				this.selfUpdate(PROGRESS);
			}
		},

		update2: function(PROGRESS) { // min is 1

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

						for (var j = 0, jl = PROGRESS; j < jl; j++) {
							value = transform.pop();
						}

						var prop = this[i];

						if (typeof prop === 'object') {
							prop.set(value);
						} else {
							this[i] = value;
						}

						if (!transform.length) { // last frame
							this.onTransform--;
						}
					}
				}
			}

			if (this.selfUpdate) {
				this.selfUpdate(PROGRESS);
			}
		},

		selfUpdate: function(PROGRESS) {

			Paddle.recordX();

			if (this.alive) {
				if (this.onShadow) {
					new PaddleShadow();

					if ((this.onShadow -= PROGRESS) <= 0) {
						this.onShadow = 0;
					}
				}

				if (System.autoPlay) {
					this.autoPlay();
				}
			} else {
				this.onShadow = 0;
			}
		},

		render: function(CTX) {

			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var toX = this.toX;
			var toY = this.toY;
			var color = this.getColor();

			CTX.save();
			CTX.translate(this.x.value + toX, this.y + toY);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.globalAlpha = this.opacity;
			CTX.shadowBlur = Size.haloWidth;
			CTX.shadowColor = color;
			CTX.fillStyle = color;
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

		bounce: function(HORIZON) {

			setKeyframes3(this, this.keyframeSet.bounce[HORIZON ? 0 : 1]);
			// audio
			Audios.paddleBounce.play();
		},

		onShadow: 0,

		catch: function(TYPE, RGB, HORIZON) { // TYPE: 0(ball, maybe HORIZON), 1(brick, with RGB), 2(spring)

			this.bounce(HORIZON);

			if (RGB) { // brick
				if (this.onShadow < 60) {
					this.onShadow = 60;
				}

				this.r = RGB[0] * ValuePerLevel;
				this.g = RGB[1] * ValuePerLevel;
				this.b = RGB[2] * ValuePerLevel;
				setTransforms3(this,
					{
						r: 255,
						g: 255,
						b: 255,
					},
					1000, // 1 second
					true // round
				);
				// recording
				Game.record.brickCatch++;
			} else if (TYPE === 0) {
				Game.record.ballCatch++;
			}
		},

		keyframeSet: {
			bounce: [
				(function() { // x

					var deltaX = -0.4;
					var deltaY = 0.4;
					var duration = 160;
					var keyframes = [{
						props: {
							scaleX: { value: 1 + deltaX },
							scaleY: { value: 1 + deltaY }
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
								scaleX: {value: 1 + deltaX},
								scaleY: {value: 1 + deltaY}
							},

							duration: duration
						});

						if (isEnd) {
							break;
						}

						duration /= 2;
					}

					return keyframes;
				}()),

				(function() { // y

					var deltaX = 0.4;
					var deltaY = -0.4;
					var duration = 160;
					var keyframes = [{
						props: {
							scaleX: { value: 1 + deltaX },
							scaleY: { value: 1 + deltaY }
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
								scaleX: {value: 1 + deltaX},
								scaleY: {value: 1 + deltaY}
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
			]
		},

		destroy: function() {

			this.toY = this.height / 2;
			this.alive = false;
			this.onShadow = 0;
			setTransforms3(this, {
				scaleX: 2,
				scaleY: 2,
				opacity: 0
			}, 500);
		},

		revive: function(GENERATE_NEW_BALL) {

			var appearDuration = 500;

			Paddle.alive = true;
			Paddle.x.reset(Size.fieldWidth / 2);
			Paddle.toY = Paddle.height;
			setTransforms3(Paddle, {
				scaleX: 1,
				scaleY: 1
			}, 0);
			setTransform3(Paddle, 'opacity', 1, appearDuration);

			if (GENERATE_NEW_BALL) {
				FieldCanvas.addDelayCallback(appearDuration, function() {

					new Ball();
				}, true);
			}
		},

		updateX: function(e) {

			if (Paddle.alive) {
				Paddle.x.add(e.movementX);
			}
		},

		recordX: function() {

			var x = Paddle.x;

			x.push(x.value);
		},

		targetBall: void 0,

		autoPlay: function() {

			var ballNumber = Balls.length;

			if (ballNumber) {
				var maxY = -Infinity;
				var targetBall;
				var y;

				for (var i = 0; i < ballNumber; i++) {
					var ball = Balls[i];
						y = ball.y.value;

					if (y > maxY) {
						targetBall = ball;
						maxY = y;
					}
				}

				var presentTarget = Paddle.targetBall;

				if (!presentTarget || targetBall === presentTarget) {
					Paddle.x.set(targetBall.x.value - Paddle.width.value / 2);
					Paddle.targetBall = targetBall;
				} else {
					try {
						setTransform3(Paddle, 'x', targetBall.x.value - Paddle.width.value / 2, 150);
					} catch (e) {
						console.log(Balls, targetBall, maxY, y);
						alert('error');
					}
					FieldCanvas.addDelayCallback(150, function() {

						Paddle.targetBall = targetBall;
					}, true);
				}

			}
		}
	};

	function PaddleShadow() { // generate when Paddle catch brick

		var paddleWidth = Paddle.width.value;
		var paddleHeight = Paddle.height;
		var width = paddleWidth;
		var height = paddleHeight;
		var x = Paddle.x.value;
		var y = Paddle.y;
		var scaleX = Paddle.scaleX;

		if (scaleX !== 1) {
			width *= Paddle.scaleX;
			height *= Paddle.scaleY;
			x -= (width - paddleWidth) / 2;
			y -= (height - paddleHeight) / 2;
		}

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.opacity = 1;
		this.color = Paddle.getColor();
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	PaddleShadow.prototype = {
		constructor: PaddleShadow,

		update: function(PROGRESS) {

			var opacity = this.opacity *= Math.pow(0.8, PROGRESS);

			if (opacity <= 0.05) {
				this.isDead = true;
			}
		},

		render: function(CTX) {

			CTX.globalAlpha = this.opacity;
			CTX.fillStyle = this.color;
			CTX.fillRect(this.x, this.y, this.width, this.height);
			// restore CTX
			CTX.globalAlpha = 1;
		}
	};

	function PaddleScrap() {

		this.x = Paddle.x.value + Paddle.width.value / 2; // center of Paddle
		this.y = Size.paddleY;
		this.diameter = Size.vh * 4;
		this.scale = 1;
		this.opacity = 1;
		this.dX = Math.random() * getRandomWay();
		this.dY = Math.random();
		this.image = this.images[RGB_INDEX];
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	PaddleScrap.prototype = {
		constructor: PaddleScrap,

		images: [],

		init: function() {

			var images = this.images;

			images[0] = Images.shine_r;
			images[1] = Images.shine_g;
			images[2] = Images.shine_b;
		},

		update: function() {

			var opacity = this.opacity *= 0.96;

			if (opacity <= 0.05) {
				this.destroy();
			}

			this.x += this.dX;
			this.y += this.dY;
			this.scale *= 0.96;
		},

		render: function(CTX) {

			var diameter = this.diameter;
			var radius = diameter / 2;
			var scale = this.scale;
			var image = this.image;

			CTX.save();
			CTX.translate(this.x + radius, this.y + radius);
			CTX.translate(-radius * scale, -radius * scale);
			CTX.scale(scale, scale);
			CTX.globalAlpha = this.opacity;
			CTX.drawImage(image,
				0, 0, image.width, image.height,
				0, 0, diameter, diameter
			);
			CTX.restore();
		},

		destroy: function() {

			this.isDead = true;
		}
	};

	// ball
	var Balls = [];
	var BallPower = mstate(0).addHandler({
		handler: function() {

			BallPowerValue = this.value;

			for (var i = Balls.length - 1; i >= 0; i--) {
				Balls[i].updateDelta();
			}
		}
	});
	var BallPowerValue = 0;
	var BallScale = 1;

	function Ball(DEGREE, X, Y, WAY_X, WAY_Y) { // X, Y: center value

		var ghostNumber = Settings.ghostNumber;
		var x = mstate(0, null, ghostNumber);
		var y = mstate(0, null, ghostNumber);
		var degree = mstate(75).setTarget(this).addHandler({
			handler: BallHelper.degreeHandler
		});

		this.degree = degree;
		this.x = x;
		this.y = y;
		this.wayX = 1;
		this.wayY = -1;
		this.display = true;
		this.renderOnly = true;
		// initializing
		if (WAY_X) { // from BallBrick
			degree.reset(DEGREE);
			this.wayX = WAY_X;
			this.wayY = WAY_Y;
		} else if (DEGREE) { // Paddle
			degree.set(DEGREE);
		}

		if (X) {
			x.value = x.prevValues[0] = X;
			y.value = y.prevValues[0] = Y;

			if (BallUpdater.adaptToPaddle) {
				BallUpdater.launch();
			}
		} else if (Balls.length) {
			var ball = Balls[0];
			var xValue = ball.x.value;
			var yValue = ball.y.value;
			
			x.value = x.prevValues[0] = xValue;
			y.value = y.prevValues[0] = yValue;
		} else {
			x.value = x.prevValues[0] = Paddle.x.value + Paddle.width.value / 2;
			y.value = y.prevValues[0] = Size.paddleY - Size.ballRadius * BallScale; // prevent paddle bounce
		}

		this.updateDelta();
		Balls.push(this);

		if (FireAuras.active) {
			new FireAura(this);
		}

		FieldCanvas.appendSprite(this);
	}

	var TouchedBricks = []; // for Ball.update(), Bullet.process()

	Ball.prototype = {
		constructor: Ball,

		attackPower: mstate(1),

		ghostImage: void 0,

		init: function() {
			// generate image of ballGhost
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var diameter = Size.ballDiameter;
			var haloWidth = Size.haloWidth;
			var size = diameter + haloWidth * 2;

			canvas.width = canvas.height = size;

			ctx.beginPath();
			ctx.arc(size / 2, size / 2, Size.ballRadius, 0, PIx2);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FFFFFF';
			ctx.fillStyle = '#FFFFFF';
			ctx.fill();

			this.ghostImage = canvas; // prototype
		},

		update2: function(PROGRESS) { // update by BallUpdater

			var diameter = Size.ballDiameter * BallScale;
			var radius = Size.ballRadius * BallScale;
			var wayX = this.wayX;
			var wayY = this.wayY;
			var degree = this.degree.value;
			var prevBallX = this.x.value; // center
			var prevBallY = this.y.value; // cemter
			var ballX = prevBallX + this.dX * PROGRESS;
			var ballY = prevBallY + this.dY * PROGRESS;
			var ballTop = ballY - radius;
			var ballRight = ballX + radius;
			var ballBottom = ballY + radius;
			var ballLeft = ballX - radius;
			var collidedEdge, gap, toUpdateDelta;

			// wall
			if (ballLeft <= 0) { // left wall touched
				collidedEdge = radius;
			} else {
				var fieldWidth = Size.fieldWidth;

				if (ballRight >= fieldWidth) { // right wall touched
					collidedEdge = fieldWidth - radius;
				}
			}

			if (collidedEdge !== void 0) { // wall touched
				wayX *= -1;
				toUpdateDelta = true;
				gap = ballX - collidedEdge;
				ballX -= gap * 2;
				degree += getRandomWay() * 0.5; // to prevent infinity loop
				this.justGoThroughWormhole = false;
			}

			// ceiling and paddle touched
			if (ballTop <= 0) { // ceiling touched
				wayY = 1;
				toUpdateDelta = true;
				collidedEdge = radius;
				gap = ballY - collidedEdge;
				ballY -= gap * 2;
				this.justGoThroughWormhole = false;
			} else if (wayY > 0) { // go down
				//var ballFloor = Size.ballFloor;
				var ballFloor = Size.paddleY - diameter;

				if (ballTop >= ballFloor) {
					// autoPlay code write here
					// ...
					if (ballTop <= Size.paddleBottom) { // above paddle
						var paddleStateX = Paddle.x;
						var paddleX = paddleStateX.value;
						var paddleRight = paddleX + Paddle.width.value;
						var leftGap = ballRight - paddleX;
						var rightGap = paddleRight - ballLeft;

						if (leftGap >= 0 && rightGap >= 0) { // catched
							var xGap = Math.min(leftGap, rightGap);
							var yGap = ballTop - ballFloor;
							var isHorizontalHit;

							if (yGap > xGap) { // horizontal(x) touching
								if (leftGap < rightGap) { // left hit
									wayX = -1;
								} else { // right hit
									wayX = 1;
								}

								ballX += wayX * xGap * 2;
								degree = 0; // set degree to min
								isHorizontalHit = true;
							} else { // vertical(y) touching
								ballY -= yGap * 2;
								var paddleXGap = paddleX - paddleStateX.get(-PreviousIndex);

								degree += paddleXGap * wayX * Paddle.friction;
							}

							wayY = -1;
							toUpdateDelta = true;
							// paddle reaction
							Paddle.catch(0, null, isHorizontalHit);
						}
					} else if (ballTop >= Size.canvasHeight) { // out of vision, destroy ball
						this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
						this.destroy();
						return;
					} else { // spring hit test
						var springNumber = Springs.length;

						if (springNumber) {
							var springFloor_canvas = Size.springFloor_canvas;

							if (ballTop >= (springFloor_canvas - diameter)) {
								for (var j = 0; j < springNumber; j++) {
									var spring = Springs[j];
									var springX = spring.x;

									if ((ballX >= springX) && (ballX <= springX + Size.springDiameter)) {
										wayY = -1;
										toUpdateDelta = true;
										collidedEdge = springFloor_canvas - diameter;
										gap = ballTop - collidedEdge;
										ballY -= gap * 2;
										spring.hit(
											1,
											BallPowerValue,
											degree,
											this.wayX, // original way
											-1 // to make dropped spring jump
										);
										break;
									}
								}
							}
						}
					}

					this.justGoThroughWormhole = false;
					this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
					return;
				}
			}
			// bricks
			// get region start, end x, y
			var brickHeight = Size.brickHeight;
			var sY = ballTop / brickHeight;
			var is_underBrickRegion = sY >= BrickY;
			if (is_underBrickRegion) {
				this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
				return;
			}
			sY = Math.floor(sY);
			
			var eY = ballBottom / brickHeight;
			if (eY >= BrickY) {
				eY = BrickY - 1;
			}

			var brickWidth = Size.brickWidth;
			var sX = ballLeft / brickWidth;
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
				var minDistance = Infinity;
				var distance, closestBrick;
				// find closest brick
				for (i = 0; i < brickNumber; i++) {
					brick = TouchedBricks[i];
					distance = Math.pow(brick.cX - ballX, 2) + Math.pow(brick.cY - ballY, 2);

					if (distance < minDistance) {
						minDistance = distance;
						closestBrick = brick;
					}
				}

				if (closestBrick.constructor === Wormhole) {
					if (!this.justGoThroughWormhole) {
						var targetWormhole = Wormholes[closestBrick.wormholeId ? 0 : 1];

						ballX = targetWormhole.cX;
						ballY = targetWormhole.cY;
						this.justGoThroughWormhole = true; // to avoid instant back
					}
				} else {
					if (this.onGravity) {
						for (i = 0; i < brickNumber; i++) {
							brick = TouchedBricks[i];

							var liveValue = brick.live;

							if (typeof liveValue === 'object') { // mstate
								liveValue = liveValue.value;
							}

							brick.hit(
								liveValue,
								BallPowerValue,
								getRandomInteger(15, 75),
								this.wayX, // original way
								-1
							);

							Explosion(brick.cX, brick.cY, radius * 4);
						}
					} else {
						// adjust ball location and update way direction
						var gapCX = Math.abs(closestBrick.cX - prevBallX) - Size.brickSizeGapHalf;
						var gapCY = Math.abs(closestBrick.cY - prevBallY);

						if (gapCX > gapCY) {
							var brickX = closestBrick.x;

							if (wayX > 0) { // ball ->|
								collidedEdge = brickX - radius;
							} else { // |<- ball
								collidedEdge = brickX + brickWidth + radius;
							}

							wayX *= -1;
							toUpdateDelta = true;
							gap = ballX - collidedEdge;
							ballX -= gap * 2;
						} else if (gapCX < gapCY) {
							var brickY = closestBrick.y;

							if (wayY > 0) { // hit brick top
								collidedEdge = brickY - radius;
							} else { // hit brick bottom
								collidedEdge = brickY + brickHeight + radius;
							}

							wayY *= -1;
							toUpdateDelta = true;
							gap = ballY - collidedEdge;
							ballY -= gap * 2;
						} else { // center gaps is equal
							wayX *= -1;
							wayY *= -1;
							toUpdateDelta = true;
						}
						// modify state and view for closest brick
						closestBrick.hit(
							this.attackPower.value,
							BallPowerValue,
							degree,
							this.wayX, // original way
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

			this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
		},

		update: function(PROGRESS) { // update by BallUpdater

			var diameter = Size.ballDiameter * BallScale;
			var radius = diameter / 2;
			var wayX = this.wayX;
			var wayY = this.wayY;
			var degree = this.degree.value;
			var stateX = this.x;
			var stateY = this.y;
			var prevBallX = stateX.value; // center
			var prevBallY = stateY.value; // center
			var deltaX = this.dX * PROGRESS;
			var deltaY = this.dY * PROGRESS;
			var ballX = prevBallX + deltaX;
			var ballY = prevBallY + deltaY;
			var ballTop = ballY - radius;
			var ballRight = ballX + radius;
			var ballBottom = ballY + radius;
			var ballLeft = ballX - radius;
			var collidedEdge, gap, toUpdateDelta;

			// wall
			if (ballLeft <= 0) { // left wall touched
				collidedEdge = radius;
			} else {
				var fieldWidth = Size.fieldWidth;

				if (ballRight >= fieldWidth) { // right wall touched
					collidedEdge = fieldWidth - radius;
				}
			}

			if (collidedEdge !== void 0) { // wall touched
				wayX *= -1;
				toUpdateDelta = true;
				gap = ballX - collidedEdge;
				ballX -= gap * 2;
				degree += getRandomWay() * 0.5; // to prevent infinity loop
				this.justGoThroughWormhole = false;
			}

			// ceiling and paddle touched
			if (ballTop <= 0) { // ceiling touched
				wayY = 1;
				toUpdateDelta = true;
				collidedEdge = radius;
				gap = ballY - collidedEdge;
				ballY -= gap * 2;
				this.justGoThroughWormhole = false;
			} else if (wayY > 0) { // go down
				//var ballFloor = Size.ballFloor;
				var ballFloor = Size.paddleY - diameter;

				if (ballTop >= ballFloor) {
					if (ballTop <= Size.paddleBottom) { // above paddle
						var paddleStateX = Paddle.x;
						var paddleX = paddleStateX.value;
						var paddleRight = paddleX + Paddle.width.value;
						var leftGap = ballRight - paddleX;
						var rightGap = paddleRight - ballLeft;

						if (leftGap >= 0 && rightGap >= 0) { // catched
							var xGap = Math.min(leftGap, rightGap);
							var yGap = ballTop - ballFloor;
							var isHorizontalHit;

							if (yGap > xGap) { // horizontal(x) touching
								if (leftGap < rightGap) { // left hit
									wayX = -1;
								} else { // right hit
									wayX = 1;
								}

								ballX += wayX * xGap * 2;
								degree = 0; // set degree to min
								isHorizontalHit = true;
							} else { // vertical(y) touching
								ballY -= yGap * 2;
								var paddleXGap = paddleX - paddleStateX.get(-PreviousIndex);

								degree += paddleXGap * wayX * Paddle.friction;
							}

							wayY = -1;
							toUpdateDelta = true;
							// paddle reaction
							Paddle.catch(0, null, isHorizontalHit);
						}
					} else if (ballTop >= Size.canvasHeight) { // out of vision, destroy ball
						this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
						this.destroy();
						return;
					} else { // spring hit test
						var springNumber = Springs.length;

						if (springNumber) {
							var springFloor_canvas = Size.springFloor_canvas;

							if (ballTop >= (springFloor_canvas - diameter)) {
								for (var j = 0; j < springNumber; j++) {
									var spring = Springs[j];
									var springX = spring.x;

									if ((ballX >= springX) && (ballX <= springX + Size.springDiameter)) {
										wayY = -1;
										toUpdateDelta = true;
										collidedEdge = springFloor_canvas - diameter;
										gap = ballTop - collidedEdge;
										ballY -= gap * 2;
										spring.hit(
											1,
											BallPowerValue,
											degree,
											this.wayX, // original way
											-1 // to make dropped spring jump
										);
										break;
									}
								}
							}
						}
					}

					this.justGoThroughWormhole = false;
					this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
					return;
				}
			}
			// bricks
			var brickDiameter = Size.brickWidth;
			var brickRadius = Size.brickRadiusX;
			var definition = Math.max(brickDiameter / 6, 1);
			var detectTimes = Math.ceil(Math.max(Math.abs(deltaX / definition), Math.abs(deltaY / definition)));
			var dX = deltaX / detectTimes;
			var dY = deltaY / detectTimes;
			var _ballX = prevBallX;
			var _ballY = prevBallY;
			var isHitBrick = false;

			for (var i = 1; i <= detectTimes; i++) {
				_ballX += dX;
				_ballY += dY;

				var sY = (_ballY - radius) / brickDiameter;
				if (sY < 0) {
					sY = 0;
				} else {
					sY = Math.floor(sY);
				}

				var eY = (_ballY + radius) / brickDiameter;
				if (eY >= BrickY) {
					eY = BrickY - 1;
				}

				var sX = (_ballX - radius) / brickDiameter;
				if (sX < 0) {
					sX = 0;
				} else {
					sX = Math.floor(sX);
				}

				var eX = (_ballX + radius) / brickDiameter;
				if (eX >= BrickX) {
					eX = BrickX - 1;
				}
				// start detect
				// get all touched bricks
				for (var x = sX; x <= eX; x++) {
					var brickXs = Bricks[x];

					for (var y = sY; y <= eY; y++) {
						var brick = brickXs[y];

						if (brick && !brick.isDead) {
							TouchedBricks.push(brick);
						}
					}
				}
				// at least one brick touched
				var brickNumber = TouchedBricks.length;

				if (brickNumber) {
					isHitBrick = true;

					if (this.onGravity) {
						for (var j = 0; j < brickNumber; j++) {
							brick = TouchedBricks[j];

							var liveValue = brick.live;

							if (typeof liveValue === 'object') { // mstate
								liveValue = liveValue.value;
							}

							brick.hit(
								liveValue,
								BallPowerValue,
								getRandomInteger(15, 75),
								-wayX, // opposite
								-1
							);

							Explosion(brick.cX, brick.cY, radius * 4);
						}
					} else {
						// find closest brick
						var minDistance = Infinity;
						var closestBrick, gapCX, gapCY;

						for (var j = 0; j < brickNumber; j++) {
							var brick = TouchedBricks[j];
							var _gapCX = Math.pow(brick.cX - _ballX, 2);
							var _gapCY = Math.pow(brick.cY - _ballY, 2);
							var distance = _gapCX + _gapCY;

							if (distance < minDistance) {
								minDistance = distance;
								closestBrick = brick;
								gapCX = _gapCX;
								gapCY = _gapCY;
							}
						}
						// adjust ball location and update way direction
						toUpdateDelta = true;

						if (gapCY > gapCX) {
							var cY = closestBrick.cY;
							
							if (_ballY < cY && wayY > 0) { // top
								gap = _ballY - (closestBrick.y - radius);
								_ballY -= gap * 2;
								wayY *= -1;
								dY *= -1;
							} else if ( _ballY > cY && wayY < 0) { // bottom
								gap = _ballY - (closestBrick.y + brickDiameter + radius);
								_ballY -= gap * 2;
								wayY *= -1;
								dY *= -1;
							}
						} else if (gapCY < gapCX) {
							var cX = closestBrick.cX;

							if (_ballX > cX && wayX < 0) { // right
								gap = _ballX - (closestBrick.x + brickDiameter + radius);
								_ballX -= gap * 2;
								wayX *= -1;
								dX *= -1;
							} else if (_ballX < cX && wayX > 0) { // left
								gap = _ballX - (closestBrick.x - radius);
								_ballX -= gap * 2;
								wayX *= -1;
								dX *= -1;
							}
						}
						// modify state and view for closest brick
						closestBrick.hit(
							this.attackPower.value,
							BallPowerValue,
							degree,
							-wayX,
							-wayY
						);
					}
					// clear TouchedBricks
					for (var j = 0; j < brickNumber; j++) {
						TouchedBricks.pop();
					}
				}
			}

			if (isHitBrick) {
				ballX = _ballX;
				ballY = _ballY;
				this.justGoThroughWormhole = false;
			}

			this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
		},

		updateProps: function(WAY_X, WAY_Y, X, Y, DEGREE, UPDATE_DELTA) {

			this.wayX = WAY_X;
			this.wayY = WAY_Y;

			if (this.onGravity) {
				this.x.push(X);
			} else {
				this.x.set(X, false); // set value only
			}

			this.y.set(Y, false);
			this.degree.set(DEGREE);

			if (this.onGravity && WAY_Y === -1) {
				this.onGravity = false;

				if (DEGREE === 90) {
					this.degree.set(90 + getRandomWay());
				}
			}

			if (UPDATE_DELTA) {
				this.updateDelta();
			}
		},

		updateDelta: function() {

			var pps = 250; // process per second
			var power = BallPowerValue / pps; 
			var powerY = this.degree.value / 90 * power;
			var powerX = power - powerY;

			this.dY = powerY * this.wayY;
			this.dX = powerX * this.wayX;
		},

		render: function(CTX) {

			var s = Size;
			var xState = this.x;
			var yState = this.y;
			var radius = s.ballRadius * BallScale;

			/*if (FireAura.active) {
				CTX.beginPath();
				CTX.arc(xState.value, yState.value, radius + FireAura.radius, 0, PIx2);
				CTX.globalAlpha = 0.25;
				CTX.fillStyle = '#FF0000';
				CTX.fill();
				CTX.globalAlpha = 1;
			}*/

			CTX.beginPath();
			CTX.arc(xState.value, yState.value, radius, 0, PIx2);
			CTX.fillStyle = '#FFFFFF';
			CTX.fill();
			// render ghost
			var image = this.ghostImage;
			var imageDiameter = image.width;
			var st = Settings;
			var ghostDrawNumber = st.ghostDrawNumber;
			var ghostDrawRatio = st.ghostDrawRatio;
			var ghostNumber = Math.min(yState.prevValues.length, st.ghostNumber);
			var drawDiameter = (s.ballDiameter + s.haloWidth_x2) * BallScale;
			var scale = 1;
			var dScale = scale / ghostDrawNumber;
			var opacity = 0.4;
			var dOpacity = opacity / ghostDrawNumber;
			var onGravity = this.onGravity;

			for (var i = 0; i < ghostNumber; i += ghostDrawRatio) {
				//var x = onGravity ? xState.value : xState.get(-i);
				var x = xState.get(-i);
				var y = yState.get(-i);
				var scaledDrawDiameter = drawDiameter * scale;
				var bias = scaledDrawDiameter / 2;

				CTX.globalAlpha = opacity;
				CTX.drawImage(image,
					0, 0, imageDiameter, imageDiameter,
					x - bias, y - bias, scaledDrawDiameter, scaledDrawDiameter
				);

				scale -= dScale;
				opacity -= dOpacity;
			}
			// restore CTX
			CTX.globalAlpha = 1;
		},

		destroy: function(FROM_SYSTEM) {
			// remove self from Balls
			Balls.splice(Balls.indexOf(this), 1);
			this.isDead = true;
			// check if failed
			if (!FROM_SYSTEM && !Balls.length) { // this ball is the last ball
				Game.fail();
			}
		}
	};

	var BallHelper = {

		degreeHandler: function() {

			var degree = this.value;
			var min = 15;
			var max = 75;
			var target = this.target;
			var wayX = target.wayX;
			var wayY = target.wayY;
			var gap = degree - max;

			if (gap > 0) {
				degree = max - gap;
				wayX *= -1;
			}

			if (degree < min) {
				degree = min;
			}

			this.value = degree;
			target.wayX = wayX;
		}
	};

	var FireAura2 = {

		active: true,

		radius: 100,

		damage: 1
	};

	var FireAuras = {

		active: false,

		toggle: function() {

			var active = this.active = !this.active;

			if (active) {
				for (var i = 0, l = Balls.length; i < l; i++) {
					var ball = Balls[i];
					var fireAura = ball.fireAura;

					if (!fireAura) {
						new FireAura(ball);
					}
				}
			} else {
				for (var i = 0, l = Balls.length; i < l; i++) {
					var ball = Balls[i];
					var fireAura = ball.fireAura;

					if (fireAura) {
						fireAura.isDead = true;
						fireAura.ball = void 0;
						ball.fireAura = void 0;
					}
				}
			}
		}
	};

	function FireAura(BALL) {

		this.ball = BALL;
		this.radius = this.maxRadius;
		this.opacity = 0;
		this.onTransform = false;
		this.transforms = generateTransforms('radius', 'opacity');
		this.onSelfUpdate = true;
		this.damage = 1;
		this.display = true;

		BALL.fireAura = this;
		FieldCanvas.appendSprite(this);
		// init
		if (!this.image) {
			this.init();
		}
	}

	FireAura.prototype = {
		constructor: FireAura,

		maxRadius: 0,

		maxDistance: 0,

		image: void 0,

		init: function() {

			var radius = Size.vh * 10;

			this.maxRadius = radius;
			this.maxDistance = radius * radius;

			var haloWidth = Size.haloWidth;
			var diameter = radius * 2;
			var center = haloWidth + radius;
			var image, imageWidth, imageHeight, canvas, ctx, i;

			image = Images.fire;
			imageWidth = image.width;
			imageHeight = image.height;

			canvas = document.createElement('canvas');
			canvas.width = canvas.height = diameter + Size.haloWidth_x2;
			ctx = canvas.getContext('2d');

			ctx.beginPath();
			ctx.arc(center, center, radius, 0, PIx2);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FF0000';
			ctx.lineWidth = 4;
			ctx.strokeStyle = '#FFFFFF';

			for (i = 0; i < 4; i++) {
				ctx.stroke();
			}

			this.image = canvas;
		},

		update: Paddle.update,

		selfUpdate: function(PROGRESS) {

			if (this.isDead) {
				return;
			}

			if (this.ball.isDead) {
				this.ball = void 0;
				this.isDead = true;
			} else {
				this.castDamage();
			}

			var opacity  = this.opacity;

			if (!opacity) {
				this.fire();
			} else if (opacity === 1) {
				this.cease();
			}
		},

		render: function(CTX) {

			var ball = this.ball;
			var x = ball.x.value;
			var y = ball.y.value;

			CTX.globalAlpha = this.opacity;
			CTX.beginPath();
			CTX.arc(x, y, this.radius, 0, PIx2);
			CTX.fillStyle = 'rgba(255, 0, 0, 0.25)';
			CTX.fill();
			
			var haloWidth = Size.haloWidth;
			var drawRadius = this.maxRadius + haloWidth;
			var image = this.image;

			CTX.drawImage(image, x - drawRadius, y - drawRadius);
			CTX.globalAlpha = 1;
		},

		fire: function() {

			this.radius = 0;
			setTransforms3(this, {
				radius: this.maxRadius,
				opacity: 1
			}, 1000);
		},

		cease: function() {
			
			setTransform3(this, 'opacity', 0, 1000);
		},

		castDamage: function() {

			var s = Size;
			var brickWidth = s.brickWidth;
			var brickHeight = s.brickHeight;
			var ball = this.ball;
			var ballX = ball.x.value;
			var ballY = ball.y.value;
			var radius = this.maxRadius;
			var sX = (ballX - radius) / brickWidth;
				sX = sX < 0 ? 0 : Math.floor(sX);
			var eX = (ballX + radius) / brickWidth;
			if (eX >= BrickX) {
				eX = BrickX - 1;
			}
			var sY = (ballY - radius) / brickHeight;
				sY = sY < 0 ? 0 : Math.floor(sY);
			var eY = (ballY + radius) / brickHeight;
			if (eY >= BrickY) {
				eY = BrickY - 1;
			}
			var maxDistance = this.maxDistance;
			var damage = this.damage;

			for (var x = sX; x <= eX; x++) {
				var brickXs = Bricks[x];

				for (var y = sY; y <= eY; y++) {
					var brick = brickXs[y];

					if (brick && !brick.onFire && !brick.isDead) {
						var cX = brick.cX;
						var cY = brick.cY;
						var gapX = cX - ballX;
						var gapY = cY - ballY;
						var distance = gapX * gapX + gapY * gapY;

						if (distance <= maxDistance) {
							brick.hit(
								damage,
								BallPowerValue,
								Math.random() * 90,
								gapX > 0 ? 1 : -1,
								gapY > 0 ? 1 : -1
							);
							brick.onFire = true;
							FieldCanvas.addDelayCallback(60, function() {

								this.onFire = false;
							}.bind(brick));

							if (Math.random() < 0.5) {
								new FireParticle(brick);
								new FireParticle(brick);
								new FireParticle(brick);
							}
						}
					}
				}
			}
		}
	};

	function Fire2(TARGET) {

		this.target = TARGET;
		this.stepCount = 0;
		this.stepFrames = 1;
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	Fire2.prototype = {
		constructor: Fire2,

		update: function(PROGRESS) {

			var stepCount = this.stepCount + PROGRESS;

			if (stepCount >= this.stepFrames) {
				new FireParticle(this.target);
				this.stepCount = 0;
			}
		},

		render: function(CTX) { // empty

			// empty
		},
	};

	function Fire(TARGET) {

		var diameter = Size.brickWidth;

		this.target = TARGET;
		this.x = TARGET.x;
		this.y = TARGET.y;
		this.scaleX = 1.4;
		this.scaleY = 0.6;
		this.onTransform = false;
		this.transforms = generateTransforms('scaleX', 'scaleY');
		this.onSelfUpdate = true;
		this.onCount = true;
		this.progressCounts = {
			transform: {
				count: 30,
				target: 30,
				callback: function(COUNT) {

					setTransforms3(this, {
						scaleX: this.scaleX === 1.4 ? 0.6 : 1.4,
						scaleY: this.scaleY === 1.4 ? 0.6 : 1.4
					}, 500);

					new FireParticle(this.target);
				}.bind(this)
			},

			hit: {
				count: 0,
				target: 120,
				callback: function() {

					this.target.hit(1, BallPowerValue / 2, Math.random() * 90, getRandomWay(), -1);
				}.bind(this)
			}
		};
		this.display = true;

		if (!this.images) {
			this.init();
		}

		FieldCanvas.appendSprite(this);
	}

	Fire.prototype = {
		constructor: Fire,

		images: void 0,

		init: function() {

			var images = this.images = [];
			var haloWidth = Size.haloWidth;
			var diameter = Size.brickWidth;
			var image, imageWidth, imageHeight, canvas, ctx, i;
			// 0
			image = Images.fire;
			imageWidth = image.width;
			imageHeight = image.height;

			canvas = document.createElement('canvas');
			canvas.width = canvas.height = diameter + Size.haloWidth_x2;
			ctx = canvas.getContext('2d');
			ctx.translate(haloWidth, haloWidth);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FF0000';

			for (i = 0; i < 4; i++) {
				ctx.drawImage(image,
					0, 0, imageWidth, imageHeight,
					0, 0, diameter, diameter
				);
			}

			images[0] = canvas;
			// 1
			image = Images.fire_;
			imageWidth = image.width;
			imageHeight = image.height;

			canvas = document.createElement('canvas');
			canvas.width = canvas.height = diameter + Size.haloWidth_x2;
			ctx = canvas.getContext('2d');
			ctx.translate(haloWidth, haloWidth);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FF0000';

			for (i = 0; i < 4; i++) {
				ctx.drawImage(image,
					0, 0, imageWidth, imageHeight,
					0, 0, diameter, diameter
				);
			}

			images[1] = canvas;
		},

		update: Paddle.update,

		selfUpdate: function(PROGRESS) {

			var progressCounts = this.progressCounts;

			for (var name in progressCounts) {
				var progressCount = progressCounts[name];
				var count = progressCount.count += PROGRESS;

				if (count >= progressCount.target) {
					progressCount.callback(count);
					progressCount.count = 0;
				}
			}

			if (!this.target.live.value) {
				this.isDead = true;
			}
		},

		render: function(CTX) {

			var haloWidth = Size.haloWidth;
			var diameter = Size.brickWidth;
			var drawDiameter = diameter + Size.haloWidth_x2;
			var toX = diameter / 2;
			var toY = diameter;
			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var image = this.images[getRandomInteger(0, 1)];

			CTX.save();
			CTX.translate(this.x + toX, this.y + toY);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.drawImage(image,
				0, 0, image.width, image.height,
				-haloWidth, -haloWidth, drawDiameter, drawDiameter
			);
			CTX.restore();
		},
	};

	function FireParticle(TARGET) {

		var radius = Size.brickWidth / 4;

		this.targetCX = TARGET.cX;
		this.range = Size.brickRadiusX;
		this.x = TARGET.cX;
		this.y = TARGET.cY - Math.random() * Size.brickRadiusY;
		this.radius = radius;
		this.diameter = radius * 2;
		this.scale = 1;
		this.smokeScale = Math.random() * 0.75;
		this.onTransform = false;
		this.transforms = generateTransforms('scale');
		this.onSelfUpdate = true;
		this.display = true;

		FieldCanvas.appendSprite(this);
		// init
		setTransform3(this, 'scale', 0, 1000);
	}

	FireParticle.prototype = {
		constructor: FireParticle,

		update: Paddle.update,

		selfUpdate: function(PROGRESS) {

			if (this.scale) {
				var g = (this.x - this.targetCX) / this.range;
				var d = g > 0 ? 1 : -1;
				var r = g * d;

				this.x += (r > 0.75 ? (g > 0 ? -1 : 1) : getRandomWay()) * Math.random();
				this.y -= Size.vh * 0.05 * Math.random() * PROGRESS;
			} else {
				this.isDead = true;
			}
		},

		render: function(CTX) {

			var diameter = this.diameter;
			var radius = this.radius;
			var scale = this.scale;
			var image = scale > this.smokeScale ? Images.fireParticle : Images.smokeParticle;

			CTX.save();
			CTX.translate(this.x, this.y);
			CTX.translate(-radius * scale, -radius * scale);
			CTX.scale(scale, scale);
			CTX.drawImage(image,
				0, 0, image.width, image.height,
				0, 0, diameter, diameter
			);
			CTX.restore();
		},
	};

	var ColdTouch = {


	};

	var GravityBall = {

		isActive: false,

		active: function() {

			for (var i = Balls.length - 1; i >= 0; i--) {
				var ball = Balls[i];

				ball.onGravity = true;
				ball.degree.set(90, false);
				ball.wayY = 1;
				ball.updateDelta();
			}
		}
	};

	// carb ball
	var CarpBallHelper = {

		degreeHandler: function() {

			var degree = this.value;
			var min = 0;
			var max = 90;
			var target = this.target;
			var wayX = target.wayX;
			var wayY = target.wayY;
			var gap = degree - max;

			if (gap > 0) {
				degree = max - gap;
				wayX *= -1;
			}

			if (degree < min) {
				degree = min;
			}

			this.value = degree;
			target.wayX = wayX;
		}
	};

	function CarpBall(DEGREE, X, Y, WAY_X, WAY_Y) {

		var ghostNumber = Settings.ghostNumber;
		var x = mstate(0, null, ghostNumber);
		var y = mstate(0, null, ghostNumber);
		var degree = mstate(75).setTarget(this).addHandler({
			handler: CarpBallHelper.degreeHandler
		});

		this.degree = degree;
		this.x = x;
		this.y = y;
		this.rotateZ = 0;
		this.wayX = 1;
		this.wayY = -1;
		this.display = true;
		this.renderOnly = true;
		// initializing
		if (WAY_X) { // from BallBrick
			degree.reset(DEGREE);
			this.wayX = WAY_X;
			this.wayY = WAY_Y;
		} else if (DEGREE) { // Paddle
			degree.set(DEGREE);
		}

		if (X) {
			x.value = x.prevValues[0] = X;
			y.value = y.prevValues[0] = Y;

			if (BallUpdater.adaptToPaddle) {
				BallUpdater.launch();
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

		this.updateDelta();
		Balls.push(this);
		FieldCanvas.appendSprite(this);

		this.installGhostImage('rgb(' +
			getRandomInteger(1, ColorLevel) * ValuePerLevel + ',' +
			getRandomInteger(1, ColorLevel) * ValuePerLevel + ',' +
			getRandomInteger(1, ColorLevel) * ValuePerLevel + ')'
		);
	}

	CarpBall.prototype = {
		constructor: CarpBall,

		attackPower: mstate(1),

		ghostImage: void 0,

		ghostImages: {},

		installGhostImage: function(RGB) {

			var image = this.ghostImages[RGB];

			if (!image) {
				image = this.generateGhostImage(RGB);
			}

			this.ghostImage_ = image;
		},

		generateGhostImage: function(RGB) {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var diameter = Size.carpBallDiameter;
			var haloWidth = Size.haloWidth;
			var size = diameter + haloWidth * 2;

			canvas.width = canvas.height = size;

			ctx.arc(size / 2, size / 2, Size.carpBallRadius, 0, PIx2);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = RGB;
			ctx.fillStyle = RGB;

			for (var i = 0; i < 1; i++) {
				ctx.fill();
			}

			this.ghostImages[RGB] = canvas;

			return canvas;
		},

		init: function() {
			// generate image of ballGhost
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var diameter = Size.carpBallDiameter;
			var haloWidth = Size.haloWidth;
			var size = diameter + haloWidth * 2;

			canvas.width = canvas.height = size;

			ctx.beginPath();
			ctx.arc(size / 2, size / 2, Size.carpBallRadius, 0, PIx2);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FF0000';
			ctx.fillStyle = '#FF0000';
			ctx.fill();

			this.ghostImage = canvas; // prototype
		},

		update: function(PROGRESS) { // update by BallUpdater

			var diameter = Size.ballDiameter;
			var radius = Size.ballRadius;
			var wayX = this.wayX;
			var wayY = this.wayY;
			var degree = this.degree.value;
			var prevBallX = this.x.value;
			var prevBallY = this.y.value;
			var ballX = prevBallX + this.dX * PROGRESS;
			var ballY = prevBallY + this.dY * PROGRESS;
			var ballRight = ballX + diameter;
			var ballCX = ballX + radius;
			var ballCY = ballY + radius;
			var collidedEdge, gap, toUpdateDelta;

			// wall
			if (ballX <= 0) { // left wall touched
				collidedEdge = 0;
			} else {
				var fieldWidth = Size.fieldWidth;

				if (ballRight >= fieldWidth) { // right wall touched
					collidedEdge = fieldWidth - diameter;
				}
			}

			if (collidedEdge !== void 0) { // wall touched
				wayX *= -1;
				toUpdateDelta = true;
				gap = ballX - collidedEdge;
				ballX -= gap * 2;
				degree += getRandomWay() * 0.5; // to prevent infinity loop
				this.justGoThroughWormhole = false;
			}

			// ceiling and paddle touched
			if (ballY <= 0) { // ceiling touched
				wayY = 1;
				toUpdateDelta = true;
				collidedEdge = 0;
				gap = ballY - collidedEdge;
				ballY -= gap * 2;
				this.justGoThroughWormhole = false;
			} else if (wayY > 0) {
				var carpBallFloor = Size.carpBallFloor;

				if (ballY >= carpBallFloor) {
					// autoPlay
					//if (System.autoPlay) {
					//	setProp(Paddle, 'x', ballX - Paddle.width.value / 2);
					//}
					if (prevBallY <= Size.paddleBottom) { // above paddle
						var paddleStateX = Paddle.x;
						var paddleX = paddleStateX.value;
						var paddleRight = paddleX + Paddle.width.value;
						var leftGap = ballRight - paddleX;
						var rightGap = paddleRight - ballX;

						if (leftGap >= 0 && rightGap >= 0) { // catched
							var xGap = Math.min(leftGap, rightGap);
							var yGap = ballY - carpBallFloor;
							var isHorizontalHit;

							if (yGap > xGap) { // horizontal(x) touching
								if (leftGap < rightGap) { // left hit
									wayX = -1;
								} else { // right hit
									wayX = 1;
								}

								ballX += wayX * xGap * 2;
								degree = 0; // set degree to min
								isHorizontalHit = true;
							} else { // vertical(y) touching
								ballY -= yGap * 2;
								var paddleXGap = paddleX - paddleStateX.get(-PreviousIndex);

								degree += paddleXGap * wayX * Paddle.friction;
							}

							wayY = -1;
							toUpdateDelta = true;
							// paddle reaction
							Paddle.catch(0, null, isHorizontalHit);
						}
					} else if (ballY >= Size.canvasHeight) { // out of vision, destroy ball
						this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
						this.destroy();
						return;
					} else { // spring hit test
						var springNumber = Springs.length;

						if (springNumber) {
							var springFloor_canvas = Size.springFloor_canvas;

							if (ballY >= (springFloor_canvas - diameter)) {
								for (var j = 0; j < springNumber; j++) {
									var spring = Springs[j];
									var springX = spring.x;

									if ((ballCX >= springX) && (ballCX <= springX + Size.springDiameter)) {
										wayY = -1;
										toUpdateDelta = true;
										collidedEdge = springFloor_canvas - diameter;
										gap = ballY - collidedEdge;
										ballY -= gap * 2;
										spring.hit(
											1,
											BallPowerValue,
											degree,
											this.wayX, // original way
											-1 // to make dropped spring jump
										);
										break;
									}
								}
							}
						}
					}

					this.justGoThroughWormhole = false;
					this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
					return;
				}
			}

			// bricks
			// get region start, end x, y
			var brickHeight = Size.brickHeight;
			var sY = ballY / brickHeight;
			var is_underBrickRegion = sY >= BrickY;

			if (is_underBrickRegion) {
				this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
				return;
			}
			
			var eY = (ballY + diameter) / brickHeight;

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

						ballX = targetWormhole.getX(radius);
						ballY = targetWormhole.getY(radius);
						this.justGoThroughWormhole = true; // to avoid instant back
					}
				} else {
					// adjust ball location and update way direction
					var prevBallCX = prevBallX + radius;
					var prevBallCY = prevBallY + radius;
					var gapCX = Math.abs(closestBrick.cX - prevBallCX) - Size.brickSizeGapHalf;
					var gapCY = Math.abs(closestBrick.cY - prevBallCY);
					var gapValue;
					var direction; // 0(top), 1(right), 2(bottom), 3(left)

					if (gapCX > gapCY) {
						var brickX = closestBrick.x;

						if (wayX > 0) { // ball ->|
							collidedEdge = brickX - diameter;
							direction = 3;
						} else { // |<- ball
							collidedEdge = brickX + brickWidth; // brick right
							direction = 1;
						}

						wayX *= -1;
						toUpdateDelta = true;
						gap = ballX - collidedEdge;
						ballX -= gap * 2;
					} else if (gapCX < gapCY) {
						var brickY = closestBrick.y;

						if (wayY > 0) { // hit brick top
							collidedEdge = brickY - diameter;
							direction = 0;
						} else { // hit brick bottom
							collidedEdge = brickY + brickHeight;
							direction = 2;
						}

						wayY *= -1;
						toUpdateDelta = true;
						gap = ballY - collidedEdge;
						ballY -= gap * 2;
					} else { // center gaps is equal
						console.log('same');
						direction = wayX > 0 ? 3 : 1;
						wayX *= -1;
						wayY *= -1;
						toUpdateDelta = true;
					}
					// modify state and view for closest brick
					closestBrick.hit(
						this.attackPower.value,
						BallPowerValue,
						degree,
						this.wayX, // original way
						this.wayY
					);

					this.justGoThroughWormhole = false;
				}
				// clear TouchedBricks
				for (i = 0; i < brickNumber; i++) {
					TouchedBricks.pop();
				}
			}

			this.updateProps(wayX, wayY, ballX, ballY, degree, toUpdateDelta);
		},

		updateProps: function(WAY_X, WAY_Y, X, Y, DEGREE, UPDATE_DELTA) {

			if (Math.random() < 0.25) { // worm mode
				DEGREE += getRandomInteger(-5, 5);
				UPDATE_DELTA = true;
			}

			var rotateZ = DEGREE;
			// accounding to canvas rotate system
			if (WAY_X > 0) { // right
				if (WAY_Y > 0) { // right-bottom
					// do nothing
				} else { // right-top
					rotateZ = -DEGREE;
				}
			} else { // left
				if (WAY_Y > 0) { // left-bottom
					rotateZ = 180 - DEGREE;
				} else { // left-top
					rotateZ = 180 + DEGREE;
				}
			}

			this.wayX = WAY_X;
			this.wayY = WAY_Y;
			this.x.set(X, false); // set value only
			this.y.set(Y, false);
			this.degree.set(DEGREE);
			this.rotateZ = rotateZ;

			if (UPDATE_DELTA) {
				this.updateDelta();
			}
		},

		updateDelta: function() {

			var pps = 250; // process per second
			var power = BallPowerValue / pps; 
			var powerY = this.degree.value / 90 * power;
			var powerX = power - powerY;

			this.dY = powerY * this.wayY;
			this.dX = powerX * this.wayX;
		},

		render: function(CTX) {

			var xState = this.x;
			var yState = this.y;
			// render ghost
			var image = this.ghostImage_;
			var imageDiameter = image.width;
			var st = Settings;
			var ghostDrawNumber = st.ghostDrawNumber;
			var ghostDrawRatio = st.ghostDrawRatio;
			var ghostNumber = Math.min(yState.prevValues.length, st.ghostNumber);
			var haloWidth = Size.haloWidth;
			var haloWidth_x2 = haloWidth * 2;
			var scale = 1;
			var dScale = scale / (ghostDrawNumber + 1);
			var opacity = 0.4;
			var dOpacity = opacity / (ghostDrawNumber + 1);

			CTX.translate(-haloWidth, -haloWidth);

			for (var i = 0; i < ghostNumber; i += ghostDrawRatio) {
				var x = xState.get(-i);
				var y = yState.get(-i);
				var scaledDiameter = imageDiameter * scale;
				var translateBias = (imageDiameter - scaledDiameter) / 2;

				CTX.globalAlpha = opacity;
				CTX.drawImage(image,
					0, 0, imageDiameter, imageDiameter,
					x + translateBias, y + translateBias, scaledDiameter, scaledDiameter
				);

				opacity -= dOpacity;
				scale -= dScale;
			}
			// restore CTX
			CTX.globalAlpha = 1;
			CTX.translate(haloWidth, haloWidth);

			// tail
			var radius = Size.carpBallRadius;
			var tailNumber = Math.round(ghostNumber / 3);

			for (var i = ghostNumber - tailNumber; i < ghostNumber; i += ghostDrawRatio) {
				var x = xState.get(-i);
				var y = yState.get(-i);
				var scaledDiameter = imageDiameter * scale;
				var translateBias = (imageDiameter - scaledDiameter) / 2;
				var r = radius * scale;

				CTX.beginPath();
				CTX.arc(x + radius, y + radius, radius * scale, 0, PIx2);
				CTX.fillStyle = '#FFFFFF';
				CTX.fill();

				scale += dScale;
			}

			// render ball
			var diameter = Size.carpBallDiameter;
			var height = diameter * 1.5;
			var width = diameter * 1;
			var fixX = (width - diameter) / 2;
			var fixY = (height - diameter) / 2;
			var toX = width / 2;
			var toY = height / 2;
			var wormImage = Images.worm;

			CTX.save();
			CTX.translate(this.x.value - fixX + toX, this.y.value - fixY + toY);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-toX * 1, -toY * 1);
			CTX.scale(1, 1);
			CTX.drawImage(wormImage,
				0, 0, wormImage.width, wormImage.height,
				0, 0, width, height
			);
			CTX.restore();
		},

		destroy: function(FROM_SYSTEM) {
			// remove self from Balls
			Balls.splice(Balls.indexOf(this), 1);
			this.isDead = true;
			// check if failed
			if (!FROM_SYSTEM && !Balls.length) { // this ball is the last ball
				Game.fail();
			}
		}
	};

	var BallUpdater = {

		adaptToPaddle: true,

		updateTimer: void 0,



		init: function() {

			this.isPause = false;
			this.updateTimer = setInterval(this.update, 4); // 1000 / 250(process per second)
		},

		launch: function() { // launch ball

			this.adaptToPaddle = false;
			this.lastUpdateTime = performance.now();
		},

		stop: function() { // adapt to paddle

			this.adaptToPaddle = true;
		},

		lastUpdateTime: 0,

		isPause: true,

		update: function() { // don't use 'this'

			var i;

			if (BallUpdater.adaptToPaddle) {
				var x = Paddle.x.value + Paddle.width.value / 2;

				for (i = Balls.length - 1; i >= 0; i--) {
					Balls[i].x.set(x);
				}
			} else if (!BallUpdater.isPause) {
				var now = performance.now();
				var latency = now - BallUpdater.lastUpdateTime;
				var progress = latency / 4; // 1000 / 250(process per second)

				BallUpdater.lastUpdateTime = now;

				if (progress) { // > 0
					for (i = Balls.length - 1; i >= 0; i--) {
						Balls[i].update(progress);
					}
				}
			}
		},

		pause: function() {

			this.isPause = true;
		},

		continue: function() {

			this.isPause = false;
			this.lastUpdateTime = performance.now();
		}
	};

	function generateTransforms() { // for any sprite needs to use transform, keyframe

		var args = arguments;
		var transforms = {};

		for (var i = args.length - 1; i >= 0; i--) {
			transforms[args[i]] = {
				onTransform: false,
				targetValue: 0,
				delta: 0,
				isRound: false,
				next: []
			};
		}

		return transforms;
	}

	// brick
	var BrickX, BrickY;
	var Bricks = []; // 2d array

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
		this.width = width;
		this.height = height;
		this.toX = Size.brickRadiusX; // center
		this.toY = height; // bottom
		this.scaleX = 0;
		this.scaleY = 0;
		this.rotateZ = 0;
		this.opacity = 1;
		this.blink = 0;
		// when hit
		this.hitPower = 0;
		this.degree = 0;
		this.wayX = 0;
		this.wayY = 0;
		this.onTransform = 0;
		this.transforms = generateTransforms(
			'scaleX',
			'scaleY',
			'rotateZ',
			'opacity',
			'blink'
		);
		this.onSelfUpdate = false;
		this.colors = [0, 0, 0]; // max is 5, 51 * 5 = 255
		this.image = void 0;
		this.isPassive = true;
		this.display = false;
		this.live = mstate(0).setTarget(this)
		.addTrimer(brickStateHelper.liveTrimer)
		.addHandler({ handler: brickStateHelper.liveHandler });
		this.isMine = false;
		// recording
		Game.record.brickGenerate++;
	}

	Brick.prototype = {
		constructor: Brick,

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

				if (System.renderType === 0) {
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

		installImage: function() {

			var colors = this.colors;
			var r = colors[0] * ValuePerLevel;
			var g = colors[1] * ValuePerLevel;
			var b = colors[2] * ValuePerLevel;
			var color = 'rgb(' + r + ',' + g + ',' + b + ')';
			var images = this.images;
			var image = images[color];

			if (!image) {
				var margin = Size.brickMargin;
				var width = Size.brickWidth;
				var height = Size.brickHeight;
				var haloWidth = Size.haloWidth;
				var canvas = document.createElement('canvas');

				canvas.width = width + haloWidth * 2;
				canvas.height = height + haloWidth * 2;

				var ctx = canvas.getContext('2d');

				ctx.translate(haloWidth + margin, haloWidth + margin);

				// main color and halo color(shadowColor)
				ctx.shadowColor = color;
				ctx.shadowBlur = haloWidth;
				ctx.rect(0, 0, width - margin * 2, height - margin * 2);
				ctx.lineWidth = Size.haloLineWidth;
				ctx.strokeStyle = '#FFFFFF';

				for (var i = 0; i < 10; i++) {
					ctx.stroke();
				}

				// mine texture
				if (this.isMine) {
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(width - margin * 2, height - margin * 2);
					ctx.stroke();

					ctx.beginPath();
					ctx.moveTo(width - margin * 2, 0);
					ctx.lineTo(0, height - margin * 2);
					ctx.stroke();
				}

				image = images[color] = canvas;
			}

			this.image = image;
		},

		installImage_alien_test: function() { // no use

			var colors = this.colors;
			var r = colors[0] * ValuePerLevel;
			var g = colors[1] * ValuePerLevel;
			var b = colors[2] * ValuePerLevel;
			var color = 'rgb(' + r + ',' + g + ',' + b + ')';
			var images = this.images;
			var image = images[color];

			if (!image) {
				var margin = Size.brickMargin;
				var width = Size.brickWidth;
				var height = Size.brickHeight;
				var haloWidth = Size.haloWidth;
				var canvas = document.createElement('canvas');

				canvas.width = width + haloWidth * 2;
				canvas.height = height + haloWidth * 2;

				var ctx = canvas.getContext('2d');

				ctx.translate(haloWidth + margin, haloWidth + margin);

				// main color and halo color(shadowColor)
				ctx.shadowColor = color;
				ctx.shadowBlur = haloWidth;
				//ctx.rect(0, 0, width - margin * 2, height - margin * 2);
				var img = Images.alien_test;
				ctx.drawImage(img,
					0, 0, img.width, img.height,
					0, 0, width - margin * 2, height - margin * 2
				);
				ctx.lineWidth = Size.haloLineWidth;
				ctx.strokeStyle = '#FFFFFF';

				for (var i = 0; i < 10; i++) {
					ctx.stroke();
				}

				// mine texture
				if (this.isMine) {
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(width - margin * 2, height - margin * 2);
					ctx.stroke();

					ctx.beginPath();
					ctx.moveTo(width - margin * 2, 0);
					ctx.lineTo(0, height - margin * 2);
					ctx.stroke();
				} else { // face
					// hit
					this.images_hit[color] = canvas;
					// destroy
					this.images_destroy[color] = canvas;
				}

				image = images[color] = canvas;
			}

			this.image = image;

			if (!this.isMine) {
				this.image_hit = this.images_hit[color];
				this.image_destroy = this.images_destroy[color];
			}
		},

		update: function(PROGRESS) { // min is 1

			var onTransform = this.onTransform;
			var onSelfUpdate = this.onSelfUpdate;

			if (!onTransform && !onSelfUpdate) { // end of update and set this sprite to passive
				FieldCanvas.setSpritePassive(this, true);
				return;
			}

			if (onTransform) {
				var transforms = this.transforms;

				for (var i in transforms) {
					var transform = transforms[i];

					if (transform.onTransform) {
						// calculate value
						var presentValue = this[i];
						if (typeof presentValue === 'object') { // mstate
							presentValue = presentValue.value;
						}
						var delta = transform.delta * PROGRESS;
						var value = presentValue + delta;
						if (transform.isRound) {
							value = Math.round(value);
						}
						var targetValue = transform.targetValue;
						// check if transform end
						var isEnd;

						if (delta > 0) {
							isEnd = value >= targetValue;
						} else {
							isEnd = value <= targetValue;
						}
						// update value
						if (isEnd) { // end of transform, check next transform
							this[i] = transform.targetValue;
							transform.onTransform = false;
							this.onTransform--;
							// next transform
							var transformNext = transform.next.pop();

							if (transformNext) {
								setTransform3(this, i,
									transformNext.targetValue,
									transformNext.duration,
									transformNext.isRound,
									true // keyframe
								);
							}
						} else {
							this[i] = value;
						}
					}
				}
			}

			if (onSelfUpdate) {
				this.selfUpdate(PROGRESS);
			}
		},

		update0508: function(PROGRESS) { // min is 1

			var onTransform = this.onTransform;
			var onSelfUpdate = this.onSelfUpdate;

			if (!onTransform && !onSelfUpdate) {
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

						for (var j = 0, jl = PROGRESS; j < jl; j++) {
							value = transform.pop();
						}

						this[i] = value;

						if (!transform.length) { // last frame
							this.onTransform--;
						}
					}
				}
			}

			if (this.selfUpdate && this.onSelfUpdate) {
				this.selfUpdate(PROGRESS);
			}
		},

		selfUpdate: function(PROGRESS) {

			var s = Size;
			var width = this.width;
			var dX = this.dX;
			var x = this.x + dX * PROGRESS;
			// wall hit test
			if (x <= 0) {
				x = 0;
				dX *= -1;
			} else if (x + width > s.fieldWidth) {
				x = s.fieldWidth - width;
				dX *= -1;
			}
			// ceil floor paddle hit test
			var dY = this.dY;
			var y = this.y + dY * PROGRESS;

			if (y <= 0) { // ceil hit
				y *= -1;
				dY = 0;
			} else if (y > Size.canvasHeight) { // destroy
				this.destroy(); // end of selfUpdate
			} else if (y > s.ballFloor && y < s.paddleBottom && Paddle.alive) { // check catch
				var paddleX = Paddle.x.value;
				var paddleRight = paddleX + Paddle.width.value;
				var brickRight = x + width;

				if (brickRight > paddleX && x < paddleRight) { // catched
					this.catched(); // end of selfUpdate
				}
			}

			this.x = x;
			this.y = y;
			this.dX = dX;
			this.dY = dY + this.ddY * PROGRESS;
			this.rotateZ += dX * 2 * PROGRESS;
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

			var haloWidth = Size.haloWidth;
			var haloWidth_x2 = Size.haloWidth_x2;
			var width = this.width;
			var height = this.height;
			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var toX = this.toX;
			var toY = this.toY;
			var blink = this.blink;
			var fire = this.fire;
			var image = this.image;

			CTX.save();
			CTX.translate(this.x + toX, this.y + toY);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.globalAlpha = this.opacity;

			CTX.drawImage(image,
				0, 0, image.width, image.height,
				-haloWidth, -haloWidth, width + haloWidth_x2, height + haloWidth_x2
			); // image has halo

			if (blink) {
				CTX.globalAlpha = blink;
				CTX.fillStyle = this.onFire ? '#FF0000' : '#FFFFFF';
				CTX.fillRect(0, 0, width, height);
			}

			CTX.restore();
		},

		hit: function(ATTACK_POWER, POWER, DEGREE, WAY_X, WAY_Y) {
			// recording hit infomation
			this.hitPower = POWER;
			this.degree = DEGREE;
			this.wayX = WAY_X;
			this.wayY = WAY_Y;
			// live
			this.live.add(-ATTACK_POWER);
			// effect
			var audio;

			FieldCanvas.setSpritePassive(this, false);

			if (this.isMine) {
				this.blink = 1;
				setTransform3(this, 'blink', 0, 240);
				audio = Audios.mineHit;
			} else {
				setKeyframes3(this, this.keyframeSet.hit);
				audio = Audios.brickHit;
			}

			//if (!this.onFire) {
				// audio
				audio.currentTime = 0;
				audio.play();
				//}

			// recording
			Game.record.brickHit++;
			HitTimesIndicator.times.add(1);
		},

		revive: function() {

			FieldCanvas.setSpritePassive(this, false);
			setKeyframes3(this, this.keyframeSet.born);
			this.display = true;
		},

		drop: function() {

			FieldCanvas.setSpritePassive(this, false);
			Bricks[this.rX][this.rY] = void 0;
			this.onSelfUpdate = true;

			var s = Size;
			var power = this.hitPower / 100;
			var wayX = this.wayX;
			var wayY = this.wayY;
			var degree = this.degree;

			if (degree % 90 === 0) { // 0 or 90
				wayX = getRandomWay();
				degree += (!degree ? 1 : -1) * 15;
			}

			var powerY = power * (degree / 90);
			var powerX = power - powerY;

			this.dX = powerX * wayX;
			this.dY = powerY * wayY;
			this.ddY = s.drag / 60;
			this.toY = s.brickRadiusY; // center
			// recording
			Game.record.brickDestroy++;
		},

		catched: function() {

			this.onSelfUpdate = false;
			FieldCanvas.setSpritePassive(this, false);
			this.scaleX = 1.4;
			this.scaleY = 1.4;
			setTransforms3(this, {
				scaleX: 0,
				scaleY: 0
			}, 150);

			FieldCanvas.addDelayCallback(150, function() {

				this.destroy();
			}.bind(this), true);
			Paddle.catch(1, this.colors);
			magicMissileLauncher.fill(this.colors);

			var audio = Audios.brickCatch;

			audio.currentTime = 0;
			audio.play();
		},

		destroy: function() {

			this.isDead = true;
		},

		destroy2: function() {

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
			var canvasHeight = s.canvasHeight;
			var ballFloor = s.ballFloor;
			var paddleBottom = s.paddleBottom;
			var paddleStateX = Paddle.x;
			var paddleStateWidth = Paddle.width;
			var width = this.width;
			var self = this;
			var isCatched = false;

			Bricks[this.rX][this.rY] = void 0;
			this.toY = s.brickRadiusY; // center
			this.isDrop = true;
			FieldCanvas.setSpritePassive(this, false);
			// recording
			Game.record.brickDestroy++;
			
			if (System.renderType === 1) {
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
						Paddle.catch(1, self.colors);
						magicMissileLauncher.fill(self.colors);
					}
				}

				self.x = x;
				self.rotateZ += dX * 2;

				dY += ddY;
			})
			.addEndTest(function() {

				return (isCatched && !self.scaleX) || self.y >= canvasHeight;
			})
			.addEndAction(function() {

				self.isDead = true;

				if (Game.modeName === 'oneHit') {
					Game.mode.checkEnd();
				}
			})
			.launch();
		},

		keyframeSet: {},

		generateKeyframeSet: function() {

			var set = this.keyframeSet;

			set.hit = [
				{
					props: {
						scaleX: { value: 1.6 },
						scaleY: { value: 0.4 },
						blink: { value: 1 }
					},

					duration: 0
				},

				{
					props: {
						scaleX: { value: 0.6 },
						scaleY: { value: 1.4 },
						blink: { value: 0 }
					},

					duration: 240
				},

				{
					props: {
						scaleX: { value: 1.2 },
						scaleY: { value: 0.8 }
					},

					duration: 120
				},

				{
					props: {
						scaleX: { value: 1 },
						scaleY: { value: 1 }
					},

					duration: 60
				},
			];

			var gap = 0.4;
			var scale = 1 + gap;
			var duration = 240;
			var born = [
				{
					props: {
						scaleX: { value: scale },
						scaleY: { value: scale }
					},

					duration: duration
				}
			];

			for (var i = 0; i < i + 1; i++) {
				gap *= -0.6;
				scale = 1 + gap;
				duration *= 0.9;

				if (Math.abs(gap) < 0.1) {
					scale = 1;
					gap = 0;
				}

				born.push({
					props: {
						scaleX: { value: scale },
						scaleY: { value: scale }
					},

					duration: duration
				});

				if (!gap) {
					set.born = born;
					break;
				}
			}
		},

		remove: function() {

			Bricks[this.rX][this.rY] = void 0;
			this.isDead = true;
			FieldCanvas.toRenderPassiveCanvas = true;
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
				this.target.drop();
			} else {
				if (this.get(-1) === 0) {
					this.target.revive();
				}
			}
		},

		liveHandler2: function() {

			if (!this.value) {
				this.target.destroy();
			} else {
				if (this.get(-1) === 0) {
					this.target.revive();
				}
			}
		}
	};

	var brickFuncs = {

		init: function() {

			for (var i = 0; i < BrickX; i++) {
				Bricks.push(new Array(BrickY));
			}
		},

		generate: function(DATA) {
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
							brickClass = SpringBrick;
						} else if (type === 4) {
							brickClass = Wormhole;
						} else if (type === 5) {
							brickClass = WormBody;
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
	};

	function BallBrick(REGION_X, REGION_Y) {

		var diameter = Size.brickWidth;
		var radius = diameter / 2;
		var x = REGION_X * diameter;
		var y = REGION_Y * diameter;

		this.rX = REGION_X;
		this.rY = REGION_Y;
		this.x = x;
		this.y = y;
		this.cX = x + radius;
		this.cY = y + radius;
		this.isPassive = true;
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	BallBrick.prototype = {
		constructor: BallBrick,

		init: function() { // excute this function after Ball.prototype.init
			// set access to image
			this.image = Ball.prototype.ghostImage;
		},

		image: void 0,

		update: function() { // empty

			// empty
		},

		render: function(CTX) {

			var haloWidth = Size.haloWidth;

			CTX.drawImage(this.image, this.x - haloWidth, this.y - haloWidth);
		},

		hit: function(ATTACK_POWER, POWER, DEGREE, WAY_X, WAY_Y) {
			// destroy
			Bricks[this.rX][this.rY] = void 0;
			this.isDead = true;
			// new Ball
			new Ball(DEGREE, this.x, this.y, WAY_X, WAY_Y);
			// audio
			var audio = Audios.brickHit;

			audio.currentTime = 0;
			audio.play();
		},

		revive: function() { // empty

			// empty
		},

		destroy: function() { // empty

			// empty
		},

		remove: Brick.prototype.remove
	};

	function BombBrick(REGION_X, REGION_Y) {

		var diameter = Size.brickWidth;
		var radius = diameter / 2;
		var x = REGION_X * diameter;
		var y = REGION_Y * diameter;

		this.rX = REGION_X;
		this.rY = REGION_Y;
		this.x = x;
		this.y = y;
		this.cX = x + radius;
		this.cY = y + radius;
		this.diameter = diameter;
		this.radius = radius;
		this.scale = 0;
		this.rotateZ = 0;
		this.onTransform = 0;
		this.transforms = generateTransforms('scale', 'rotateZ');
		this.isPassive = true;
		this.display = true;
		this.live = 2;
		this.onSelfUpdate = false;
		this.image = this.images[0];
		this.stepCount = 0;
		this.step = 0;
		this.attackPower = 500;
		
		FieldCanvas.appendSprite(this);
		// init
		FieldCanvas.setSpritePassive(this, false);
		setTransform3(this, 'scale', 1, 500);
	}

	BombBrick.prototype = {
		constructor: BombBrick,

		images: [],

		init: function() {

			this.installImage();
		},

		installImage: function() {

			var haloWidth = Size.haloWidth;
			var diameter = Size.brickWidth;
			var image = Images.bomb;
			var imageWidth = image.width;
			var imageHeight = image.height;
			var canvas, ctx, i;
			// white
			canvas = document.createElement('canvas');
			canvas.width = canvas.height = diameter + Size.haloWidth_x2;
			ctx = canvas.getContext('2d');
			ctx.translate(haloWidth, haloWidth);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FFFFFF';

			for (i = 0; i < 4; i++) {
				ctx.drawImage(image,
					0, 0, imageWidth, imageHeight,
					0, 0, diameter, diameter
				);
			}

			this.images[0] = canvas;
			// red
			canvas = document.createElement('canvas');
			canvas.width = canvas.height = diameter + Size.haloWidth_x2;
			ctx = canvas.getContext('2d');
			ctx.translate(haloWidth, haloWidth);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FF0000';

			for (i = 0; i < 4; i++) {
				ctx.drawImage(image,
					0, 0, imageWidth, imageHeight,
					0, 0, diameter, diameter
				);
			}

			this.images[1] = canvas;
		},

		update: Brick.prototype.update,

		selfUpdate2: function(PROGRESS) {

			var stepCount = this.stepCount += PROGRESS;

			if (stepCount >= 15) { // 15 frames, 250ms
				this.stepCount = 0;
				this.step = !this.step ? 1 : 0;
			}
		},

		selfUpdate: function(PROGRESS) {

			var stepCount = this.stepCount += PROGRESS;

			if (stepCount >= 30) { // 15 frames, 250ms
				var step = this.step = !this.step ? 1 : 0;

				FieldCanvas.setSpritePassive(this, false);
				setTransform3(this, 'scale', (step ? 1 : 1.5), 500);
				this.image = this.images[step];
				this.stepCount = 0;
			}
		},

		render: function(CTX) {

			var haloWidth = Size.haloWidth;
			var haloWidth_x2 = Size.haloWidth_x2;
			var diameter = this.diameter;
			var radius = this.radius;
			var scale = this.scale;
			var image = this.image;
			var imageWidth = image.width;
			var imageHeight = image.height;

			CTX.save();
			CTX.translate(this.x + radius, this.y + radius);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-radius * scale, -radius * scale);
			CTX.scale(scale, scale);
			CTX.drawImage(image,
				0, 0, imageWidth, imageHeight,
				-haloWidth, -haloWidth, diameter + haloWidth_x2, diameter + haloWidth_x2
			);
			CTX.restore();
		},

		hit: function(ATTACK_POWER, POWER, DEGREE, WAY_X, WAY_Y) {


			var remainLive = this.live -= ATTACK_POWER;

			if (remainLive > 0) {
				FieldCanvas.setSpritePassive(this, false);
				setTransform3(this, 'rotateZ', WAY_X * 135, 250);
				this.onSelfUpdate = true;
				// audio
				var audio = Audios.brickHit;

				audio.currentTime = 0;
				audio.play();
			} else { // destroy
				// data
				Bricks[this.rX][this.rY] = void 0;
				this.isDead = true;
				// effect
				var cx = this.cX;
				var cy = this.cY;

				Explosion(cx, cy, this.diameter * 4);
				// physical hit
				var wayNumber = 32;
				var degreePerWay = 11.25;// 360 / wayNumber;

				FieldCanvas.addDelayCallback(1, function() { // wait for 1 frame

					for (var i = 0; i < wayNumber; i++) {
						ExplosiveWave(i * degreePerWay, cx, cy);
					}
				});
			}
		},

		remove: Brick.prototype.remove
	};

	var Springs = []; // dropped springs

	function SpringBrick(REGION_X, REGION_Y) {

		var s = Size;
		var diameter = s.springDiameter;
		var radius = s.springRadius;
		var brickWidth = s.brickWidth;
		var brickHeight = s.brickHeight;
		var x = REGION_X * brickWidth + (brickWidth - diameter) / 2;
		var y = REGION_Y * brickHeight + (brickHeight - diameter) / 2;

		this.rX = REGION_X; // region
		this.rY = REGION_Y;
		this.cX = x + radius; // center
		this.cY = y + radius;
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.toX = radius;
		this.toY = diameter;
		this.scaleX = 1;
		this.scaleY = 0;
		this.rotateZ = 0;
		this.onTransform = 0;
		this.transforms = generateTransforms('scaleX', 'scaleY', 'rotateZ');
		this.isPassive = true;
		this.display = true;
		this.onSelfUpdate = false;
		this.isDropped = false;

		FieldCanvas.appendSprite(this);
		// init
		FieldCanvas.setSpritePassive(this, false);
		setTransform3(this, 'scaleY', 1, 500);
	}

	SpringBrick.prototype = {
		constructor: SpringBrick,

		init: function() {

			this.installImage();
			this.generateKeyframeSet();
		},

		image: void 0,

		installImage: function() {

			var haloWidth = Size.haloWidth;
			var diameter = Size.springDiameter;
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			canvas.width = canvas.height = diameter + Size.haloWidth_x2;
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FFFFFF';
			ctx.translate(haloWidth, haloWidth);

			var image = Images.spring;
			var imageWidth = image.width;
			var imageHeight = image.height;

			for (var i = 0; i < 1; i++) {
				ctx.drawImage(image,
					0, 0, imageWidth, imageHeight,
					0, 0, diameter, diameter
				);
			}

			this.image = canvas;
		},

		keyframeSet: {},

		generateKeyframeSet: function() {

			var set = this.keyframeSet;
			var bounceRange = 1;
			var bounce = [{
				props: {
					scaleX: { value: 1 + bounceRange / 3 },
					scaleY: { value: 1 - bounceRange }
				},

				duration: 0
			}];
			var duration = 240;

			for (var i = 0; i < i + 1; i++) {
				bounce.push({
					props: {
						scaleX: { value: 1 - bounceRange / 3 },
						scaleY: { value: 1 + bounceRange }
					},

					duration: duration
				});

				duration *= 0.8;
				bounceRange *= -0.6;

				if (Math.abs(bounceRange) <= 0.01) {
					break;
				}
			}

			bounce.push({
				props: {
					scaleX: { value: 1 },
					scaleY: { value: 1 }
				},

				duration: duration
			});

			set.bounce = bounce;
		},

		update: Brick.prototype.update,

		selfUpdate: function(PROGRESS) {

			var s = Size;
			var dX = this.dX;
			var x = this.x + dX * PROGRESS;
			var diameter = this.diameter;
			var fieldWidth = s.fieldWidth;
			// wall hit test
			if (x <= 0) {
				x = 0;
				dX *= -1;
			} else if (x + diameter > fieldWidth) {
				x = fieldWidth - diameter;
				dX *= -1;
			}
			// ceil, floor, paddle hit test
			var dY = this.dY;
			var y = this.y + dY * PROGRESS;

			if (y <= 0) { // ceil hit
				y *= -1;
				dY = 0;
			} else if (!this.isDropped && y > s.springFloor_paddle && y < s.paddleY && Paddle.alive) {
				var paddleX = Paddle.x.value;
				var paddleRight = paddleX + Paddle.width.value;
				var right = x + diameter;

				if (right > paddleX && x < paddleRight) { // catched
					y = s.springFloor_paddle;
					dY *= -0.5;

					if (Math.abs(dY) > 1) { // still has the power to bounce on the paddle
						dX *= 0.9;
						Paddle.catch(2);
						this.bounce();
					}
				}
			} else if (y >= s.springFloor_canvas) {
				if (this.isDropped) {
					this.isDead = true;
				} else if (Math.abs(dY) <= 1) {
					this.dropped(); // end of selfUpdate
				} else {
					y = s.springFloor_canvas;
					dX *= 0.9;
					dY *= -0.5;
				}
			}

			var dRotateZ = this.dRotateZ;
			var rotateZ = this.rotateZ + dRotateZ;

			dRotateZ = dX * 2;

			if ((Math.abs(dRotateZ) < 1) && (Math.abs(rotateZ % 90) > 1)) {
				dRotateZ = dRotateZ > 0 ? 1 : -1;
			}

			this.x = x;
			this.y = y;
			this.rotateZ = rotateZ;
			this.dX = dX;
			this.dY = dY + this.ddY * PROGRESS;
			this.dRotateZ = dRotateZ;
		},

		render: function(CTX) {

			var haloWidth = Size.haloWidth;
			var haloWidth_x2 = Size.haloWidth_x2;
			var diameter = this.diameter;
			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var toX = this.toX;
			var toY = this.toY;
			var image = this.image;

			CTX.save();
			CTX.translate(this.x + toX, this.y + toY);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.drawImage(image,
				0, 0, image.width, image.height,
				-haloWidth, -haloWidth, diameter + haloWidth_x2, diameter + haloWidth_x2
			);
			CTX.restore();
		},

		hit: function(ATTACK_POWER, POWER, DEGREE, WAY_X, WAY_Y) { // ATTACK_POWER is useless
			// bounce
			this.bounce();
			this.drop(POWER, DEGREE, WAY_X, WAY_Y, this.isDropped);
		},

		drop: function(POWER, DEGREE, WAY_X, WAY_Y, DESTROY) {

			Bricks[this.rX][this.rY] = void 0;

			if (DEGREE === 90 || !DEGREE) { // DEGREE === 0
				DEGREE += (!DEGREE ? 1 : -1) * Math.random() * 15;
				WAY_X = getRandomWay();
			}

			var power = POWER / 100;
			var powerY = power * (DEGREE / 90);
			var powerX = power - powerY;
			var dX = powerX * WAY_X;
			var dY = powerY * WAY_Y;
			
			this.onSelfUpdate = true;
			this.toY = Size.springRadius; // center
			this.dX = dX;
			this.dY = dY;
			this.ddY = Size.drag / 60;
			this.dRotateZ = dX * 2;

			if (DESTROY) {
				Springs.splice(Springs.indexOf(this), 1);
			}
		},

		dropped: function() {

			this.onSelfUpdate = false;
			this.toY = this.diameter; // bottom
			this.rotateZ = 0;
			this.isDropped = true;
			Springs.push(this); // dropped springs
		},

		bounce: function() {

			FieldCanvas.setSpritePassive(this, false);
			setKeyframes3(this, this.keyframeSet.bounce);
			// audio
			var audio = Audios.jellyHit;

			audio.currentTime = 0;
			audio.play();
		},

		revive: function() { // empty

			// empty
		},

		destroy: function() { // empty

			// empty
		},

		remove: Brick.prototype.remove
	};

	function Snake(LIVE) {

		var s = Size;
		var rX = Math.round(BrickX / 2);
		var rY = Math.round(BrickY / 2);

		this.rX = rX;
		this.rY = rY;
		this.x = rX * s.brickWidth + s.brickRadiusX; // center
		this.y = rY * s.brickHeight + s.brickRadiusY; // center
		this.rotateZ = 0;
		this.blink = 0;
		this.onTransform = 0;
		this.transforms = generateTransforms('x', 'y', 'rotateZ', 'blink');
		this.onSelfUpdate = true;
		this.display = true;
		this.bodys = [];
		this.bodyNumber = 0;
		this.live = LIVE;
		this.stepFrames = 6;
		this.stepCount = 0;

		FieldCanvas.appendSprite(this);
		// init
		var nextRX = rX;
		var nextRY = rY;

		if (Math.random() < 0.5) {
			nextRX += getRandomWay();
		} else {
			nextRY += getRandomWay();
		}

		this.addPoint(rX, rY);
		this.addPoint(nextRX, nextRY);
	}

	Snake.prototype = {
		constructor: Snake,

		attackPower: mstate(1),

		headImage: void 0,

		bodyImage: void 0,

		blinkImage: void 0,

		init: function() {

			this.generateHeadImage();
			this.generateBodyImage();
			this.generateBlinkImage();
		},

		generateHeadImage: function() {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var diameter = Size.snakeDiameter * 1.6;
			var radius = diameter / 2;
			var haloWidth = Size.haloWidth;
			var size = diameter + Size.haloWidth_x2;
			var image = Images.snakeHead;
			var imageWidth = image.width;
			var imageHeight = image.height;

			canvas.width = canvas.height = size;
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#00CC00';

			for (var i = 0; i < 8; i++) {
				ctx.drawImage(image,
					0, 0, imageWidth, imageHeight,
					haloWidth, haloWidth, diameter, diameter
				);
			}

			this.headImage = canvas;
		},

		generateBodyImage: function() {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var diameter = Size.snakeDiameter;
			var radius = Size.snakeRadius;
			var haloWidth = Size.haloWidth;
			var size = diameter + Size.haloWidth_x2;

			canvas.width = canvas.height = size;
			ctx.arc(size / 2, size / 2, radius, 0, PIx2);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#00FF00';
			ctx.fillStyle = '#00FF00';

			for (var i = 0; i < 2; i++) {
				ctx.fill();
			}

			this.bodyImage = canvas;
		},

		generateBlinkImage: function() {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var diameter = Size.snakeDiameter;
			var radius = Size.snakeRadius;
			var haloWidth = Size.haloWidth;
			var size = diameter + Size.haloWidth_x2;

			canvas.width = canvas.height = size;
			ctx.arc(size / 2, size / 2, radius, 0, PIx2);
			ctx.shadowBlur = haloWidth;
			ctx.shadowColor = '#FFFFFF';
			ctx.fillStyle = '#FFFFFF';

			for (var i = 0; i < 4; i++) {
				ctx.fill();
			}

			this.blinkImage = canvas;
		},

		update: Paddle.update,

		selfUpdate: function(PROGRESS) {

			var stepCount = this.stepCount += PROGRESS;

			if (stepCount >= this.stepFrames) {
				this.progress();
				this.stepCount = 0;
			}
		},

		whichWay: function (DIRECTION, BASE_LINE) { // DIRECTION: 'rX', 'rY'; BASE_LINE: number

			var bodys = this.bodys;
			var negativeNumber = 0;
			var positiveNumber = 0;

			for (var i = 0, l = bodys.length; i < l; i++) {
				var position = bodys[i][DIRECTION];

				if (position > BASE_LINE) {
					positiveNumber++;
				} else if (position < BASE_LINE) {
					negativeNumber++;
				}
			}

			return negativeNumber < positiveNumber ? -1 : 1; // turn less brick way
		}, // progress helper

		isRepeat: function(REGION_X, REGION_Y) {

			var bodys = this.bodys;
			var isRepeat = false;

			for (var i = 0, l = bodys.length; i < l; i++) {
				var body = bodys[i];

				if (body.rX === REGION_X && body.rY === REGION_Y) {
					isRepeat = true;
					break;
				}
			}

			return isRepeat;
		}, // progress helper

		progress: function() { // !?

			var bodys = this.bodys;
			var bodyNumer = bodys.length;
			var head = bodys[bodyNumer - 1];
			var neck = bodys[bodyNumer - 2];
			var headX = head.rX;
			var headY = head.rY;
			var xGap = headX - neck.rX;
			var yGap = headY - neck.rY;
			var wayX = 0;
			var wayY = 0;
			var onUpdate = true;

			if (xGap) {
				wayX = xGap;
			} else {
				wayY = yGap;
			}

			var repeatTimes = 0;

			while (onUpdate) {
				if (repeatTimes > 3) {
					var s = Size;
					var tail = bodys[0];

					this.x = tail.cX;
					this.y = tail.cY;
					bodys.reverse();
					onUpdate = false;
				} else {
					repeatTimes++;

					var x = headX; // nextX
					var y = headY;
					var isForward = false;

					if (Math.random() < (0.75 - (repeatTimes - 1) * 0.25)) { // go forward
						if (wayX) {
							x += wayX;
						} else {
							y += wayY;
						}

						isForward = true;
					} else { // change direction
						if (wayX) {
							y += this.whichWay('rY', y); // whichWay uses 'this'
						} else {
							x += this.whichWay('rX', x);
						}
					}
					// fix
					var isFix = false;

					if (x !== headX) {
						if (x < 0 || x >= BrickX) {
							if (isForward) {
								x = headX;
								y += this.whichWay('rY', y); // whichWay uses 'this'

								if (y < 0) {
									y = 1;
								} else if (y >= BrickY) {
									y = BrickY - 2;
								}
							} else { // change direction
								if (x < 0) {
									x = 1;
								} else { // x >= BrickX
									x = BrickX - 2;
								}
							}

							isFix = true;
						}
					}

					if (!isFix && y !== headY) {
						if (y < 0 || y >= BrickY) {
							if (isForward) {
								y = headY;
								x += this.whichWay('rX', x); // whichWay uses 'this'

								if (x < 0) {
									x = 1;
								} else if (x >= BrickX) {
									x = BrickX - 2;
								}
							} else { // change direction
								if (y < 0) {
									y = 1;
								} else { // y >= BrickY
									y = BrickY - 2;
								}
							}
						}
					}

					if (!this.isRepeat(x, y)) { // not repeat
						onUpdate = false;

						var brick = Bricks[x][y];

						if (brick) {
							// write brick-eating code here(if needed)
							brick.remove();
							// effect
							Explosion(brick.cX, brick.cY, brick.width * 4);
						}

						this.addPoint(x, y);
					}
				}
			}
		},

		addPoint: function(REGION_X, REGION_Y) {
			// add new head and remove old tail(if necessary)
			var s = Size;
			var width = s.brickWidth;
			var height = s.brickHeight;
			var radiusX = s.brickRadiusX;
			var radiusY = s.brickRadiusY;
			var x = width * REGION_X;
			var y = height * REGION_Y;
			var cX = x + radiusX;
			var cY = y + radiusY;
			var bodys = this.bodys;
			var bodyNumber = bodys.length;
			var head;

			if (bodyNumber === Settings.snakeBodyNumber) {
				head = bodys.shift(); // reuse old tail object
				Bricks[head.rX][head.rY] = void 0; // head still old tail this moment
			} else {
				head = {};
			}

			head.rX = REGION_X;
			head.rY = REGION_Y;
			head.x = x;
			head.y = y;
			head.cX = cX;
			head.cY = cY;
			head.width = width;
			head.height = height;
			head.hit = this.hit.bind(this);
			Bricks[REGION_X][REGION_Y] = head;
			bodys.push(head);
			this.bodyNumber++;
			// move to new head
			var gapX = cX - this.x;
			var gapY = cY - this.y;
			var prevRotateZ = this.rotateZ;
			var rotateZ;

			if (gapX) {
				if (gapX > 0) { // 90 or -90 to 0
					rotateZ = 0;
				} else { // 90 to 180 or -90 to -180
					rotateZ = prevRotateZ > 0 ? 180 : -180;
				}
			} else {
				if (gapY > 0) { // 0 or 180 or -180 to 90
					if (prevRotateZ < 0) { // -180
						this.rotateZ += 360;
					}

					rotateZ = 90;
				} else {
					if (prevRotateZ > 0) {
						this.rotateZ -= 360;
					}

					rotateZ = -90;
				}
			}

			setTransforms3(this, {
				x: cX,
				y: cY,
				rotateZ: rotateZ
			}, 100);
		},

		render: function(CTX) {

			var s = Size;
			var brickWidth = s.brickWidth;
			var brickHeight = s.brickHeight;
			var brickRadiusX = s.brickRadiusX;
			var brickRadiusY = s.brickRadiusY;
			var bodys = this.bodys;
			var snakeBodyNumber = Math.min(Settings.snakeBodyNumber, bodys.length);
			var drawNumber = 3; // drawing times between two points
			var opacity = 1;
			var dOpacity = opacity / (snakeBodyNumber * drawNumber + 1);
			var x = this.x; // center
			var y = this.y; // center
			var prevX = x;
			var prevY = y;
			var bodyImage = this.bodyImage;
			var bodyImageDiameter = bodyImage.width;
			var blink = this.blink;
			var blinkImage = this.blinkImage;
			var originDrawSize = bodyImageDiameter;
			var drawSize = originDrawSize;
			var dDrawSize = originDrawSize / (snakeBodyNumber * drawNumber);
			var tailIndex = snakeBodyNumber / 3;
			var translateValue = -s.haloWidth - s.snakeRadius;

			CTX.translate(translateValue, translateValue);

			for (var i = snakeBodyNumber - 2; i >= 0; i--) { // from neck
				var body = bodys[i];
				var cX = body.cX;
				var cY = body.cY;
				var dX = (cX - prevX) / drawNumber;
				var dY = (cY - prevY) / drawNumber;

				for (var j = 0; j < drawNumber; j++) {
					var positionFix = 0;

					if (i < tailIndex) {
						drawSize -= dDrawSize;
						positionFix = (originDrawSize - drawSize) / 2;
					}

					CTX.globalAlpha = opacity;
					CTX.drawImage(bodyImage,
						0, 0, bodyImageDiameter, bodyImageDiameter,
						prevX + positionFix,
						prevY + positionFix,
						drawSize,
						drawSize
					);

					if (blink) {
						CTX.globalAlpha = blink;
						CTX.drawImage(blinkImage,
							0, 0, bodyImageDiameter, bodyImageDiameter,
							prevX + positionFix,
							prevY + positionFix,
							drawSize,
							drawSize
						);
					}

					prevX += dX;
					prevY += dY;
					opacity -= dOpacity;
				}

				prevX = cX;
				prevY = cY;
			}
			// restore CTX
			CTX.translate(-translateValue, -translateValue);
			CTX.globalAlpha = 1;
			// draw head
			var headImage = this.headImage;
			var headImageRadius = headImage.width / 2;

			CTX.save();
			CTX.translate(x, y);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-headImageRadius, -headImageRadius);
			CTX.drawImage(headImage, 0, 0);
			CTX.restore();
		},

		hit: function() {

			var live = this.live -= 1;

			this.blink = 1;
			setTransform3(this, 'blink', 0, 150);

			if (live <= 0) {
				this.destroy();
			}
		},

		destroy: function() {

			//alert('Snake is dead');
			var bodys = this.bodys;
			var radius = Size.snakeRadius * 4;

			for (var i = bodys.length - 1; i >= 0; i--) {
				var body = bodys[i];

				Bricks[body.rX][body.rY] = void 0;
				bodys.pop();
				new Explosion(body.cX, body.cY, radius, 0, 255, 0);
			}

			this.isDead = true;
			FieldCanvas.addDelayCallback(180, Game.win);
		}
	};

	var Wormholes = [];

	function Wormhole(REGION_X, REGION_Y) { // brick

		var s = Size;
		var diameter = s.wormholeDiameter;
		var radius = s.wormholeRadius;
		var brickWidth = s.brickWidth;
		var brickHeight = s.brickHeight;
		var x = REGION_X * brickWidth + (brickWidth - diameter) / 2;
		var y = REGION_Y * brickHeight + (brickHeight - diameter) / 2;

		this.rX = REGION_X; // region
		this.rY = REGION_Y;
		this.cX = x + radius; // center
		this.cY = y + radius;
		this.x = x;
		this.y = y;
		this.diameter = diameter;
		this.to = radius;
		this.scale = 0;
		this.rotateZ = 0;
		this.onTransform = 0;
		this.transforms = generateTransforms('scale', 'rotateZ');
		this.display = true;
		this.onSelfUpdate = true;
		this.step = 1;
		this.stepCount = 0;
		this.wormholeId = Wormholes.length;

		Wormholes.push(this);
		FieldCanvas.appendSprite(this);
		// init
		setTransform3(this, 'scale', 1, 500);
	}

	Wormhole.prototype = {
		constructor: Wormhole,

		update: Brick.prototype.update,

		selfUpdate: function(PROGRESS) {

			var stepCount = this.stepCount += PROGRESS;

			if (stepCount >= 180) { // frames
				var step = this.step = !this.step ? 1 : 0;

				FieldCanvas.setSpritePassive(this, false);
				setTransform3(this, 'scale', (step ? 0.75 : 1.25), 3000);
				this.stepCount = 0;
			}

			this.rotateZ += 0.5 * PROGRESS;

			if (Math.random() < 0.1 * PROGRESS) {
				new WormholeLight(this);
			}
		},

		render: function(CTX) {

			var diameter = this.diameter;
			var scale = this.scale;
			var to = this.to;
			var image = Images.wormhole;
			var imageWidth = image.width;
			var imageHeight = image.height;

			CTX.save();
			CTX.translate(this.x + to, this.y + to);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-to * scale, -to * scale);
			CTX.scale(scale, scale);
			CTX.drawImage(image,
				0, 0, imageWidth, imageHeight,
				0, 0, diameter, diameter
			);
			CTX.restore();
		},

		getX: function(RADIUS) { // return fixed position for target sprite

			return this.x + this.to - RADIUS / 2;
		},

		getY: function(RADIUS) { // return fixed position for target sprite

			return this.y + this.to - RADIUS / 2;
		},

		hit: function() { // empty

			// do nothing
		},

		remove: Brick.prototype.remove
	};

	function WormholeLight(WORMHOLE) {

		var s = Size;
		var radius = s.wormholeLightRadius;
		var wormholeRadius = s.wormholeRadius;
		var targetX = WORMHOLE.cX - radius;
		var targetY = WORMHOLE.cY - radius;
		var distanceX = wormholeRadius * Math.random();
		var distanceY = wormholeRadius - distanceX;

		this.x = targetX + distanceX * getRandomWay();
		this.y = targetY + distanceY * getRandomWay();
		this.radius = radius;
		this.scale = Math.random();
		this.onTransform = 0;
		this.transforms = generateTransforms('x', 'y', 'scale');
		this.onSelfUpdate = true;
		this.display = true;

		FieldCanvas.appendSprite(this);
		// init
		setTransforms3(this, {
			x: targetX,
			y: targetY,
			scale: 0
		}, 1000);
	}

	WormholeLight.prototype = {
		constructor: WormholeLight,

		update: Brick.prototype.update,

		selfUpdate: function() {

			if (!this.onTransform) {
				this.isDead = true;
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
			CTX.fillStyle = '#FFFFFF';
			CTX.fill();
			CTX.restore();
		}
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
				var canvasHeight = Size.canvasHeight;

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

					return self.y >= canvasHeight;
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

	var bulletFuncs = {

		init: function() {

			var modes = BulletMode.modes;

			for (var i in modes) {
				var mode = modes[i];
				var audioName = mode.audio;

				mode.audio = Audios[audioName];
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

				audio: 'laser_fire',

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

				audio: 'machineGun_fire',

				fire: function() {

					new Bullet(0, this.attackPower);
				}
			},

			shotgun: {

				latency: 1000,

				times: 10,

				attackPower: 0.5,

				audio: 'shotgun_fireReload',

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

				audio: 'laser_fire',

				fire: function() {

					new Bullet(0, this.attackPower);
				}
			}
		}
	};

	function MagicMissile(COLOR, EXPLOSION) {

		var s = Size;

		this.x = Paddle.x.value + (Paddle.width.value / 2) - this.radius;
		this.y = s.paddleY - this.radius;
		this.dx = s.magicMissileDx * (EXPLOSION ? 10000 : 1) * Math.random() * getRandomWay();
		this.dy = -s.magicMissileSpeed;
		this.image = this.images[COLOR];
		this.color = this.colors[COLOR];
		this.display = true;

		FieldCanvas.appendSprite(this);
		// recording
		Game.record.magicMissileShot++;
	}

	MagicMissile.prototype = {
		constructor: MagicMissile,

		diameter: 0,

		radius: 0, // magicMissileRadius

		colors: {
			r: '#FF6666',
			g: '#66FF66',
			b: '#66CCFF',
		},

		images: {},

		attackPower: mstate(1),

		hitPower: 0,

		init: function() {

			var s = Size;
			var diameter = s.magicMissileDiameter;
			var sizeHalf = diameter / 2;
			var haloWidth = s.haloWidth;
			var imageSize = diameter + haloWidth * 2;
			var imageSizeHalf = imageSize / 2;
			var colors = {
				r: ['#FF0000', '#FFCCCC'], // [blurColor, fillColor]
				g: ['#00FF00', '#CCFFCC'],
				b: ['#00CCFF', '#CCCCFF']
			};
			var images = this.images; // prototype
			var mms = MagicMissile_flare.prototype;

			this.diameter = mms.diameter = diameter; // prototype
			this.radius = mms.radius = sizeHalf; // prototype
			this.hitPower = s.magicMissileSpeed * 100; // prototype

			for (var i in colors) {
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				var color = colors[i];

				canvas.width = canvas.height = imageSize;
				ctx.shadowBlur = haloWidth;
				ctx.shadowColor = color[0];
				ctx.beginPath();
				ctx.arc(imageSizeHalf, imageSizeHalf, sizeHalf, 0, PIx2);
				ctx.fillStyle = '#FFFFFF';//color[1];

				for (var j = 0; j < 2; j++) {
					ctx.fill();
				}

				images[i] = canvas; // prototype
			}
		},

		update: function(PROGRESS) {

			var s = Size;
			var diameter = this.diameter;
			var x = this.x + this.dx * PROGRESS;
			var y = this.y + this.dy * PROGRESS;
			var isDestroy = false;

			if (x <= 0) {
				x = 0;
				this.dx *= -1;
			} else {
				var left = x + diameter;
				var fieldWidth = s.fieldWidth;

				if (left >= fieldWidth) {
					x = fieldWidth - diameter;
					this.dx *= -1;
				}
			}

			if (y <= 0) { // ceiling touched
				isDestroy = true;
			} else {
				var brickHeight = s.brickHeight;
				var sY = y / brickHeight;
				var is_underBrickRegion = sY >= BrickY;

				if (!is_underBrickRegion) {
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
					var eX = (x + diameter) / s.brickWidth;
					if (eX >= BrickX) {
						eX = BrickX - 1;
					} else {
						eX = Math.floor(eX);
					}
					// get brick regions around self
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
						var radius = this.radius;

						if (brickNumber === 1 && TouchedBricks[0].constructor === Wormhole) {
							if (!this.wormholePassed) {
								var targetWormhole = Wormholes[TouchedBricks[0].wormholeId ? 0 : 1];

								x = targetWormhole.getX(radius);
								y = targetWormhole.getY(radius);
								this.wormholePassed = true;
							}
						} else {
							var attackPower = this.attackPower.value;
							var hitPower = this.hitPower;
							var cx = x + radius;
							var cy = y + radius;

							for (i = 0; i < brickNumber; i++) {
									brick = TouchedBricks[i];
								var dx = cx - brick.cX;
								var dy = cy - brick.cY;
								var wayX = dx > 0 ? -1 : 1;
								var wayY = dy > 0 ? -1 : 1;

								if (dx < 0) { // convert dx to positive
									dx *= -1;
								}

								if (dy < 0) { // convert dy to positive
									dy *= -1;
								}

								var degree = (dy / (dx + dy)) * 90;

								brick.hit(
									attackPower,
									hitPower,
									degree,
									wayX,
									wayY
								);
							}
						
							isDestroy = true;
						}
						// clear TouchedBricks
						for (i = 0; i < brickNumber; i++) {
							TouchedBricks.pop();
						}
					}
				}
			}

			this.x = x;
			this.y = y;
			this.dy *= Math.pow(1.025, PROGRESS);

			if (isDestroy) {
				this.destroy();
			}

			if (Math.random() < PROGRESS) {
				new MagicMissile_flare(this);
			}
		},

		render: function(CTX) {

			var haloWidth = Size.haloWidth;

			CTX.drawImage(this.image, this.x - haloWidth, this.y - haloWidth);
		},

		destroy: function() {

			this.isDead = true;

			for (var i = 0; i < 3; i++) {
				new MagicMissile_flare(this, true); // destroy
			}

			var radius = this.radius;

			new ExplosiveLight(this.x + radius, this.y + radius, radius * 4);

			var audio = Audios.collect;

			audio.currentTime = 0;
			audio.play();
		}
	};

	function MagicMissile_flare(MM, DESTROY) { // MM: MagicMissile

		var positionRange = Size.magicMissilePositionRange;
		var moveRange = Size.magicMissileShadowMoveRange * (DESTROY ? 4 : 1);

		this.x = MM.x + Math.random() * getRandomWay() * positionRange;
		this.y = MM.y + Math.random() * getRandomWay() * positionRange;
		this.dx = Math.random() * getRandomWay() * moveRange;
		this.dy = Math.random() * getRandomWay() * moveRange;
		this.scale = 1;
		this.opacity = 1;
		this.dopacity = DESTROY ? 0.98 : 0.9;
		this.image = MM.image;
		this.color = MM.color;
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	MagicMissile_flare.prototype = {
		constructor: MagicMissile_flare,

		diameter: 0, // by MagicMissile.init

		radius: 0, // by MagicMissile.init

		update: function(PROGRESS) {

			var scale = this.scale *= Math.pow(0.9, PROGRESS);

			if (scale <= 0.1) {
				this.isDead = true;
			} else {
				this.x += this.dx * PROGRESS;
				this.y += this.dy * PROGRESS;
				this.opacity *= Math.pow(this.dopacity, PROGRESS);
			}
		},

		render: function(CTX) {

			var haloWidth = Size.haloWidth;
			var radius = this.radius;
			var scale = this.scale;

			CTX.save();
			CTX.globalAlpha = this.opacity;
			CTX.translate(this.x + radius, this.y + radius);
			CTX.translate(-radius * scale, -radius * scale);
			CTX.scale(scale, scale);
			CTX.drawImage(this.image, -haloWidth, -haloWidth);
			CTX.restore();
		}
	};

	var magicMissileLauncher = {

		r: 0,
		g: 0,
		b: 0,

		fill: function(RGB) {

			this.r += RGB[0];
			this.g += RGB[1];
			this.b += RGB[2];

			if (!this.onProcess) {
				this.onProcess = FieldCanvas.addDelayCallback(this.latency, this.process);
			}
		},

		explosion: function() {

			var r = this.r;
			var g = this.g;
			var b = this.b;
			var delay = 0;
			var i;

			for (i = 0; i < r; i++) {
				FieldCanvas.addDelayCallback(delay++, function() {

					new MagicMissile('r');
				});
			}

			for (i = 0; i < g; i++) {
				FieldCanvas.addDelayCallback(delay++, function() {

					new MagicMissile('g');
				});
			}

			for (i = 0; i < b; i++) {
				FieldCanvas.addDelayCallback(delay++, function() {

					new MagicMissile('b');
				});
			}

			this.reset();
		},

		latency: 6, // frame,

		onProcess: void 0,

		process: function() {

			var self = magicMissileLauncher;

			if (Paddle.alive) {
				if (self.r) {
					new MagicMissile('r');
					self.r--;
				} else if (self.g) {
					new MagicMissile('g');
					self.g--;
				} else if (self.b) {
					new MagicMissile('b');
					self.b--;
				}
			}

			if (self.r + self.g + self.b) { // request next process
				self.onProcess = FieldCanvas.addDelayCallback(self.latency, self.process);
			} else {
				self.onProcess = void 0;
			}
		},

		reset: function() {

			this.r = this.g = this.b = 0;
			this.onProcess = void 0;
		}
	};

	function ExplosiveLight(X, Y, RADIUS) { // X, Y are center value

		this.x = X - RADIUS;
		this.y = Y - RADIUS;
		this.radius = RADIUS;
		this.scale = 1;
		this.opacity = 0.75;
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	ExplosiveLight.prototype = {
		constructor: ExplosiveLight,

		update: function(PROGRESS) {

			var delta = Math.pow(0.9, PROGRESS);
			var opacity = this.opacity *= delta;

			if (opacity <= 0.05) {
				this.isDead = true;
			} else {
				this.scale *= delta;
			}
		},

		render: function(CTX) {

			var radius = this.radius;
			var scale = this.scale;

			CTX.save();
			CTX.globalAlpha = this.opacity;
			CTX.translate(this.x + radius, this.y + radius);
			CTX.translate(-radius * scale, -radius * scale);
			CTX.scale(scale, scale);
			CTX.beginPath();
			CTX.arc(radius, radius, radius, 0, PIx2);
			CTX.fillStyle = '#FFFFFF';
			CTX.fill();
			CTX.restore();
		}
	};

	function ExplosiveScrap(X, Y, R, G, B) { // center value, RGB: 0 ~ 255

		var moveRange = Size.explosiveScrapMoveRange;

		this.x = X;
		this.y = Y;
		this.dx = Math.random() * (Math.random() > 0.5 ? 1 : -1) * moveRange;
		this.dy = Math.random() * (Math.random() > 0.94 ? 1 : -1) * moveRange * 2;
		this.diameter = Math.random() * Size.explosiveScrapDiameter;
		this.opacity = 1;

		var grayLevel = this.colors[Math.floor(Math.random() * this.colorNumber)];

		this.color = 'rgb(' +
			((R || 0) + grayLevel) + ',' +
			((G || 0) + grayLevel) + ',' +
			((B || 0) + grayLevel) + ')';
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	ExplosiveScrap.prototype = {
		constructor: ExplosiveScrap,

		colors: [51, 102, 153, 204], // rgb value(hex: 3, 6, 9, C)

		colorNumber: 4, // colors.length

		update: function(PROGRESS) {

			var delta = Math.pow(0.96, PROGRESS);
			var opacity = this.opacity *= delta;

			if (opacity < 0.05) {
				this.isDead = true;
			} else {
				this.diameter *= delta;
				this.x += this.dx * PROGRESS;
				this.y += this.dy * PROGRESS;
				this.dy += 0.5 * PROGRESS;
			}
		},

		render: function(CTX) {

			var diameter = this.diameter;
			var x = this.x;
			var y = this.y;

			CTX.globalAlpha = this.opacity;
			CTX.fillStyle = this.color;
			CTX.fillRect(x, y, diameter, diameter);
			// resetore CTX
			CTX.globalAlpha = 1;
		}
	};

	// physical damage when BombBrick explosion
	function ExplosiveWave(DEGREE, CX, CY) { // center position

		var s = Size;
		var brickWidth = s.brickWidth;
		var brickHeight = s.brickHeight;
		var diameter = s.explosiveWaveDiameter;
		var radius = s.explosiveWaveRadius;
		var power = s.explosiveWavePower * 60;
		var x = CX - radius;
		var y = CY - radius;
		var attackPower = 3;
		var wayX = 1;
		var wayY = -1;

		if (DEGREE >= 270) { // right-bottom
			DEGREE = 90 - (DEGREE - 270);
			wayX = 1;
			wayY = 1;
		} else if (DEGREE > 180) { // left-bottom
			DEGREE = 90 - (DEGREE - 180);
			wayX = -1;
			wayY = 1;
		} else if (DEGREE >= 90) { // left-top
			DEGREE = 90 - (DEGREE - 90);
			wayX = -1;
			wayY = -1;
		} else { // right-top
			// do nothing
		}
		
		var powerY = DEGREE / 90;
		var powerX = 1 - powerY;
		var dX = powerX * wayX;
		var dY = powerY * wayY;
		var moveRange = Math.round(brickWidth * attackPower);

		mainLoop:
		for (var d = 0; d < moveRange; d++) {
				x += dX;
				y += dY;
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
			var sX = x / brickWidth;
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

			var brickNumber = TouchedBricks.length;
			// at least one brick touched
			if (brickNumber) {
				//shuffleArray(TouchedBricks);

				for (i = 0; i < brickNumber; i++) {
					brick = TouchedBricks[i];

					var liveState = brick.live;
					var liveValue = liveState ? liveState.value : 1;

					brick.hit(
						attackPower,
						power,
						DEGREE,
						wayX,
						wayY
					);

					attackPower -= liveValue;

					if (attackPower <= 0) {
						// clear TouchedBricks
						for (i = 0; i < brickNumber; i++) {
							TouchedBricks.pop();
						}

						break mainLoop;
					}
				}
				// clear TouchedBricks
				for (i = 0; i < brickNumber; i++) {
					TouchedBricks.pop();
				}
			}
		}
	}

	// explosion effect
	function Explosion(CX, CY, RADIUS, R, G, B) { // RGB: 0 ~ 255

		var audio = Audios.mine_explosion;

		audio.currentTime = 0;
		audio.play();

		new ExplosiveLight(CX, CY, RADIUS);

		for (var i = 0; i < 8; i++) {
			new ExplosiveScrap(CX, CY, R, G, B);
		}

		FieldCanvas.shake();
	}

	// particle
	function DustSmoke(CX, CY, DIRECTION) { // center position

		var image = Images['smoke' + Math.random() > 0.5 ? 0 : 1];
		var diameter = Size.smokeDiameter;
		var radius = Size.smokeRadius;

		this.x = CX - radius;
		this.dx = getRandomWay() * Math.random();
		this.y = CY - radius;
		this.dy = getRandomWay() * Math.random();
		this.diameter = diameter;
		this.to = radius;
		this.scale = Math.random() * 0.4 + 0.6;
		this.rotateZ = Math.random() * 360;
		this.opacity = 1;
		this.image = image;
		this.isPassive = false;
		this.display = true;

		FieldCanvas.appendSprite(this);
	}

	DustSmoke.prototype = {
		constructor: DustSmoke,

		update: function() {

			this.x += this.dx;
			this.y += this.dy;
			var scale = this.scale *= 0.98;
			this.rotateZ += 2;
			var opacity = this.opacity *= 0.96;

			if (opacity <= 0.05) {
			//if (scale >= 1) {
				this.destroy();
			}
		},

		render: function(CTX) {

			var diameter = this.diameter;
			var scale = this.scale;
			var to = this.to; // transform-origin

			CTX.save();
			CTX.translate(this.x + to, this.y + to);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-to * scale, -to * scale);
			CTX.scale(scale, scale);
			CTX.globalAlpha = this.opacity;

			var image = Images.smoke0;

			CTX.drawImage(image,
				0, 0, image.width, image.height,
				0, 0, diameter, diameter
			);
			CTX.restore();
		},

		destroy: function() {

			this.isDead = true;
		}
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
			} else if (!Game.isPause) {
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

	var Info = {

		update: function() {

			//InfoText.setText(
			//	'Ball attack power: ' + Math.round(BallAttackPower.value) + '\n' +
			//	'Paddle width: ' + Math.round(Paddle.width.value) + '\n' +
			//	'Total: ' + (Resource.r + Resource.g + Resource.b)
			//);
		}
	};

	var StarBackgroundX = mstate(0)
	.setProp('way', getRandomWay())
	.addMethod('progress', function() {

		return this.value + this.props.way * Size.vh;
	})
	.addHandler({
		condition: function() {

			var value = this.value;
			var edge = Size.fieldWidth / 4;

			return value < -edge || value > edge;
		},

		handler: function() {

			this.props.way *= -1;
		}
	});
	
	var StarBackgroundY = mstate(0)
	.setProp('way', getRandomWay())
	.addMethod('progress', function() {

		return this.value + this.props.way * Size.vh;
	})
	.addHandler({
		condition: function() {

			var value = this.value;
			var edge = Size.fieldHeight / 4;

			return value < -edge || value > edge;
		},

		handler: function() {

			this.props.way *= -1;
		}
	});

	var BackgroundSpeedMultiplier = 1;
	var BackgroundSpeedMultiplierSN = void 0;

	function StarBackground() {

		var image = Images['bg_star' + getRandomInteger(0, 3)];
		var fieldWidth = Size.fieldWidth;
		var fieldHeight = Size.fieldHeight;

		this.x = StarBackgroundX.value;
		this.y = StarBackgroundY.value;
		this.width = fieldWidth;
		this.height = fieldWidth;
		this.toX = fieldWidth / 2;
		this.toY = fieldWidth / 2;
		this.scale = 0;
		this.rotateZ = Math.random() * 360;
		this.dRotateZ = -0.5 * Math.random();
		this.opacity = 1;
		this.image = image;

		FieldCanvas.appendBackgroundSprite(this);
	}

	StarBackground.prototype = {
		constructor: StarBackground,

		update: function(PROGRESS) {

			var deltaMultiplier = BackgroundSpeedMultiplier * PROGRESS;
			var scale = this.scale += 0.008 * deltaMultiplier; // 1 / 120

			this.rotateZ += this.dRotateZ * deltaMultiplier;

			if (scale >= 1.2) {
				var opacity = this.opacity -= 0.017 * deltaMultiplier; // 1 / 60

				if (opacity <= 0) {
					this.isDead = true;
				}
			}
		},

		render: function(CTX) {

			var toX = this.toX;
			var toY = this.toY;
			var scale = this.scale;
			var image = this.image;

			CTX.save();
			CTX.translate(this.x + toX, this.y + toY);
			CTX.rotate(this.rotateZ * PIDivided180);
			CTX.translate(-toX * scale, -toY * scale);
			CTX.scale(scale, scale);
			CTX.globalAlpha = this.opacity;
			CTX.drawImage(image,
				0, 0, image.width, image.height,
				0, 0, this.width, this.height
			);
			CTX.restore();
		}
	};

	function BackgroundStar() {

		var diameter = Size.vh * 10 * Math.random();
		var power = diameter / 10;
		var degree = Math.random() * 90;
		var powerY = (90 - degree) / 90 * power;
		var powerX = power - powerY;
		var dX = getRandomWay() * powerX;
		var dY = getRandomWay() * powerY;

		this.x = StarBackgroundX.value + Size.fieldWidth / 2 + (dX * 10 * Math.random());
		this.dX = dX;
		this.y = StarBackgroundY.value + Size.fieldHeight / 2 + (dY * 10 * Math.random());
		this.dY = dY;
		this.diameter = diameter;
		this.radius = diameter / 2;
		this.dRadius = diameter / 2 / 1000;
		this.opacity = 0;
		this.dOpacity = 1 / 15;

		var colorKeys = Object.keys(Brick.prototype.images);
		var keyLength = colorKeys.length;
		var colorKey = colorKeys[getRandomInteger(0, keyLength - 1)];

		this.image = Brick.prototype.images[colorKey];
		this.updateCount = 0;

		FieldCanvas.appendBackgroundSprite(this);
	}

	BackgroundStar.prototype = {
		constructor: BackgroundStar,

		update: function() {

			var x = this.x += this.dX * BackgroundSpeedMultiplier;
			var y = this.y += this.dY * BackgroundSpeedMultiplier;

			if (
				(this.dX > 0 ? x > Size.fieldWidth : x < 0) ||
				(this.dY > 0 ? y > Size.fieldHeight : y < 0)
			) {
				this.destroy();
			}

			this.radius += this.dRadius * BackgroundSpeedMultiplier;

			var opacity = this.opacity += this.dOpacity;

			if (this.updateCount === 15) {
				this.dOpacity *= -1;
				this.updateCount = 0;
			}

			this.updateCount++;
		},

		render: function(CTX) {

			var image = this.image;

			CTX.globalAlpha = this.opacity;
			CTX.drawImage(image,
				0, 0, image.width, image.height,
				this.x, this.y, this.diameter, this.diameter
			);
			// restore
			CTX.globalAlpha = 1;
		},

		render2: function(CTX) {

			CTX.globalAlpha = this.opacity;
			CTX.beginPath();
			CTX.arc(this.x, this.y, this.radius, 0, PIx2);
			CTX.fillStyle = this.color;
			CTX.fill();
			// restore
			CTX.globalAlpha = 1;
		},

		destroy: function() {

			this.isDead = true;
		}
	};

	var HyperMode = {

		breakpoint: 100,

		duration: 300, // frame

		latency: 30, // frame

		active: false, 

		SN: void 0,

		sleep: function() {

			HyperMode.active = false;
			BackgroundSpeedMultiplier = 1;

			if (HyperMode.SN) {
				FieldCanvas.removeDelayCallback(HyperMode.SN);
				HyperMode.SN = void 0;
			}
		},

		launch: function() {

			if (Paddle.alive) {
				var duration = HyperMode.duration;
				// reset HyperMode duration
				if (HyperMode.SN) {
					FieldCanvas.removeDelayCallback(HyperMode.SN);
				}

				HyperMode.SN = FieldCanvas.addDelayCallback(duration, HyperMode.sleep);
				// set
				BackgroundSpeedMultiplier = 4;
				Paddle.onShadow = duration;
				BreakpointIndicator.show(HitTimesIndicator.times.value.toString());
				// launch process
				if (!HyperMode.active) {
					HyperMode.active = true;
					HyperMode.process();
				}
			}
		},

		process: function() {

			if (HyperMode.active) {
				new MagicMissile('r');
				FieldCanvas.addDelayCallback(HyperMode.latency, HyperMode.process);
			}
		}
	};

	var BreakpointIndicator = {

		x: 0,
		y: 0,
		width: 0,
		height: 0,
		toX: 0,
		toY: 0,
		scaleX: 1.6,
		scaleY: 0,
		onTransform: 0,
		transforms: generateTransforms('scaleX', 'scaleY'),
		display: false,
		isStill: true,
		canvas: void 0,
		ctx: void 0,

		init: function() {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var height = Size.vh * 10;

			canvas.width = height * 5;
			canvas.height = height;
			this.image = canvas;
			this.textWidth = height;
			this.ctx = ctx;
			this.y = Size.indicatorY;
			this.height = height;
			this.toY = height / 2;

			FieldCanvas.appendSprite(this);
		},

		string: '',

		show: function(STRING) {

			this.string = STRING;
			this.renderCanvas();
			//this.toTop = true;
			this.scaleX = 2.4;
			this.scaleY = 2.4;
			this.display = true;
			setTransforms3(this, {
				scaleX: 0.8,
				scaleY: 0.8
			}, 150);

			var self = this;

			FieldCanvas.addDelayCallback(30, function() {

				setTransform3(self, 'scaleY', 0, 150);
				FieldCanvas.addDelayCallback(150, function() {

					self.display = false;
				}, true);
			});

			new IndicatorBackground(this, this.y, this.height);
		},

		update: Paddle.update,

		renderCanvas: function() {

			var string = this.string;
			var letterNumber = string.length;
			var width = this.textWidth;
			var totalWidth = width * letterNumber;
			var height = this.height;
			var canvas = this.image;
			var ctx = this.ctx;

			this.x = (Size.fieldWidth - totalWidth) / 2;
			this.width = totalWidth;
			this.toX = totalWidth / 2;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (var i = 0; i < letterNumber; i++) {
				var image = Images['num_l' + string[i]];

				ctx.drawImage(image,
					0, 0, image.width, image.height,
					width * i, 0, width, height
				);
			}
		},

		render: function(CTX) {

			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var toX = this.toX;
			var toY = this.toY;

			CTX.save();
			CTX.translate(this.x + toX, this.y + toY);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.drawImage(this.image, 0, 0);
			CTX.restore();
		}
	};

	function IndicatorBackground(INDICATOR, Y, HEIGHT) {

		var width = Size.fieldWidth;

		this.y = Y;
		this.width = width;
		this.height = HEIGHT;
		this.toX = width / 2;
		this.toY = HEIGHT / 2;
		this.scaleX = 0;
		this.scaleY = 1;
		this.opacity = 1;
		this.onTransform = 0;
		this.transforms = generateTransforms('scaleX', 'scaleY', 'opacity');
		this.onSelfUpdate = true;
		this.display = true;
		this.step = 0;

		FieldCanvas.insertSpriteBefore(this, INDICATOR);
		// init
		setTransform3(this, 'scaleX', 1, 150);
	}

	IndicatorBackground.prototype = {
		constructor: IndicatorBackground,

		update: Paddle.update,

		selfUpdate: function(PROGRESS) {

			var step = this.step;

			if (!step) {
				if (this.scaleX === 1) {
					this.step = 1;
					setTransforms3(this, {
						scaleY: 0,
						opacity: 0
					}, 250);
				}
			} else if (this.scaleY === 0) {
				this.isDead = true;
			}
		},

		render: function(CTX) {

			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var toX = this.toX;
			var toY = this.toY;

			CTX.save();
			CTX.translate(0 + toX, this.y + toY);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.globalAlpha = this.opacity;
			CTX.fillStyle = Paddle.getColor();
			CTX.fillRect(0, 0, this.width, this.height);
			CTX.restore();
		}
	};

	var HitTimesIndicator = {

		x: 0,
		y: 0,
		width: 0,
		height: 0,
		toX: 0,
		toY: 0,
		scaleX: 0.5,
		scaleY: 0,
		onTransform: 0,
		transforms: generateTransforms('scaleX', 'scaleY'),
		display: true,
		isStill: true,

		times: mstate(0).addHandler({
			handler: function() {

				var value = this.value;
				var self = HitTimesIndicator;

				if (!value) { // reset
					if (self.hideSN) {
						FieldCanvas.removeDelayCallback(self.hideSN);
					}
					clearTransform(self, 'scaleX');
					clearTransform(self, 'scaleY');
					self.scaleY = 0;
					self.scaleX = 0;
				} else {
					self.renderCanvas();
					// remove/set delay hide
					if (self.hideSN) {
						FieldCanvas.removeDelayCallback(self.hideSN);
					}
					self.hideSN = FieldCanvas.addDelayCallback(120, self.hide);
					// show
					self.scaleX = 1;
					self.scaleY = 1;
					setTransforms3(self, {
						scaleX: 0.5,
						scaleY: 0.5
					}, 150);
					// breakpoint hit
					if (value % HyperMode.breakpoint === 0) {
						HyperMode.launch();
					}
				}
				// recording
				var hitRecord = Game.record.brickHitRecord;

				if (value > hitRecord) {
					Game.record.brickHitRecord = value;
				}
			}
		}),

		init: function() {

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var height = Size.vh * 5;

			canvas.width = height * 5;
			canvas.height = height;
			this.image = canvas;
			this.textWidth = height;
			this.ctx = ctx;
			this.y = Size.paddleY + Size.paddleHeight;
			this.height = height;
			this.toY = height / 2;

			FieldCanvas.appendSprite(this);
		},

		reset: function() {

			this.times.set(0, true); // force to execute handler
		},

		hideSN: void 0,
		hide: function() {

			var self = HitTimesIndicator;
			var hideDuration = 150;

			setTransform3(self, 'scaleY', 0, hideDuration);
			self.hideSN = FieldCanvas.addDelayCallback(hideDuration, function() {

				self.times.set(0);
			}, true);
		},

		renderCanvas: function() {

			var times = this.times.value.toString();
			var letterNumber = times.length;
			var width = this.textWidth;
			var totalWidth = width * letterNumber;
			var height = this.height;
			var canvas = this.image;
			var ctx = this.ctx;

			this.width = totalWidth;
			this.toX = totalWidth / 2;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (var i = 0; i < letterNumber; i++) {
				var image = Images['num_s' + times[i]];

				ctx.drawImage(image,
					0, 0, image.width, image.height,
					width * i, 0, width, height
				);
			}
		},

		update: Paddle.update,

		render: function(CTX) {

			var width = this.width;
			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var toX = this.toX;
			var toY = this.toY;

			var widthGap = width - Paddle.width.value;
			var x = Paddle.x.value - widthGap / 2;

			CTX.save();
			CTX.translate(x + toX, this.y + toY);
			CTX.translate(-toX * scaleX, -toY * scaleY);
			CTX.scale(scaleX, scaleY);
			CTX.drawImage(this.image, 0, 0);
			CTX.restore();
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

			//Ball.prototype.attackPower.add(R / 100);
			//Paddle.width.add(baseNumber * G / 100);

			Info.update();
		}
	};

	function getRandomInteger(START, END) { // return START to END

		return Math.floor(Math.random() * (++END - START) + START);
	}

	function getRandomWay() { // return 1 or -1

		return Math.random() >= 0.5 ? 1 : -1;
	}

	function getRandomBrickX() { // return 0 to (BrickX - 1)

		return Math.floor(Math.random() * BrickX);
	}

	function getRandomBrickY() { // return 0 to (BrickY - 1)

		return Math.floor(Math.random() * BrickY);
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

	var Game = {

		mode: void 0,

		modeName: void 0,

		live: mstate(0)
		.addTrimer(function(VALUE) {

			return Math.max(VALUE, 0);
		})
		.addHandler({
			handler: function() {

				var value = this.value;
				var prevValue = this.get(-1);

				if (value < prevValue) { // fail
					magicMissileLauncher.explosion();

					if (value) {
						Game.revive();
					} else {
						Game.lose();
					}
				}
			}
		}),

		record: {

			ballCatch: 0,
			brickGenerate: 0,
			brickHit: 0, // by ball, magicMissile, bombBrick(ExplosiveWave)
			brickHitRecord: 0,
			brickDestroy: 0,
			brickCatch: 0,
			magicMissileShot: 0,

			SN: void 0,

			launchRender: function() {

				var self = this;

				this.SN = requestAnimationFrame(function() {

					self.render();
				});
			},

			render: function() {

				InfoText.setStyle('color', '#FFF').setText('hit times: ' + this.brickHit);
				this.launchRender();
			},

			reset: function() {

				cancelAnimationFrame(this.SN);

				for (var i in this) {
					if (typeof this[i] !== 'function') {
						this[i] = 0;
					}
				}
			}
		},

		startTime: void 0,

		processLatency: 60,

		processSN: void 0,

		modeProcessSN: void 0,

		modes: {

			custom: {

				live: 2,

				initialData: function() {

					var data = JSON.parse(localStorage.getItem('brickData'));

					return data;
				},

				init: function() { // empty

					// empty
				},

				launch: function() { // empty

					// empty
				}
			},

			infinity: {

				live: 2,

				latency: 30, // frameNumber, the rate of process

				process: function() {

					var x = getRandomBrickX();
					var y = getRandomBrickY();
					var brick = Bricks[x][y];

					if (!brick) {
						var random = Math.random();

						if (random < 0.95) {
							var r = getRandomInteger(0, ColorLevel);
							var g = getRandomInteger(0, ColorLevel);
							var b = getRandomInteger(0, ColorLevel);

							if (r + g + b) { // not 0
								brick = new Brick(x, y);
								brick.setColor(r, g, b);
							}
						} else {
							if (Math.random() < 0.95) {
								brick = new BombBrick(x, y);
							} else {
								brick = new SpringBrick(x, y);
							}
						}

						Bricks[x][y] = brick;

						if (brick) {
							FieldCanvas.appendSprite(brick);
							FieldCanvas.toRenderPassiveCanvas = true;
						}
					}
				},

				initialData: function() {

					function randomColor(RGB) {

						RGB[0] = getRandomInteger(0, ColorLevel);
						RGB[1] = getRandomInteger(0, ColorLevel);
						RGB[2] = getRandomInteger(0, ColorLevel);
					}
					var typeChances = {
						0: 0.98, // Brick
						2: 0.01, // BombBrick
						3: 0.01 // SpringBrick
					};
					var data = [];

					for (var x = 0; x < BrickX; x++) {
						var dataXs = [];

						data.push(dataXs);

						for (var y = 0; y < BrickY; y++) {
							var chance = Math.random();
							var leftChance = 1;
							var rgb = [0, 0, 0];
							var type = 0;

							for (var i in typeChances) {
								var typeChance = typeChances[i];

								if (chance < typeChance) {
									type = i * 1;
									break;
								}

								chance -= typeChance;
							}

							if (type === 0 && Math.random() > 0.9) {
								randomColor(rgb);
							}

							dataXs.push({
								type: type,
								rgb: rgb
							});
						}
					}

					return data;
				},

				init: function() { // empty

					// empty
				},

				launch: function() { // empty

					// empty
				}
			},

			snake: {

				live: 2,

				snake: void 0,

				latency: 30, // frameNumber, the rate of process

				process: function() {

					for (var i = 0; i < i + 1; i++) {
						var x = getRandomBrickX();
						var y = getRandomBrickY();
						var brick = Bricks[x][y];

						if (!brick) { // brick is empty
							var r = getRandomInteger(0, ColorLevel);
							var g = getRandomInteger(0, ColorLevel);
							var b = getRandomInteger(0, ColorLevel);

							if (r + g + b) {
								brick = new Brick(x, y);
								brick.setColor(r, g, b);
								Bricks[x][y] = brick;
								FieldCanvas.appendSprite(brick);
								FieldCanvas.toRenderPassiveCanvas = true;
							}

							break;
						}
					}
				},

				initialData: function() {

					var data = [];
					var x, y;

					for (x = 0; x < BrickX; x++) {
						var dataXs = [];

						data.push(dataXs);

						for (y = 0; y < BrickY; y++) {
							dataXs.push({
								type: 0,
								rgb: [0, 0, 0]
							});
						}
					}

					return data;
				},

				init: function() { // empty

					Ball.prototype.attackPower.set(3 * ColorLevel * MineLiveMultiplier);
					this.snake = new Snake(10);
				},

				launch: function() {

					//this.snake.launch();
				},

				stop: function() {

					var snake = this.snake;

					if (snake.live > 0) {
						snake.destroy();
					}

					this.snake = void 0;
				}
			}
		},

		launch: function(MODE_NAME) {

			var mode = Game.modes[MODE_NAME];

			Game.reset();
			Game.mode = mode;
			Game.modeName = MODE_NAME;
			System.requestPointerLock();

			FieldCanvas.addDelayCallback(FieldTransition.transitionDuration, function() {

				var initBrickData = mode.initialData();
				var zoomDuration = 3000;

				brickFuncs.generate(initBrickData);
				mode.init();
				FieldCanvas.zoomTo(1.8, zoomDuration);
				Paddle.revive();
				//GameIndicator.setText('READY').transforming('scaleY', 1, 500);
				Indicator.states.index.set(0);

				FieldCanvas.addDelayCallback(zoomDuration + 50, function() {

					FieldCanvas.zoomTo(1, 150);
					Game.live.set(mode.live);

					new Ball();

					Game.processSN = FieldCanvas.addDelayCallback(Game.processLatency, Game.process);

					if (mode.process) {
						Game.modeProcessSN = FieldCanvas.addDelayCallback(mode.latency, Game.modeProcess);
					}

					mode.launch();
					Game.startTime = Date.now();

					var transitionDuration = 500;

					//GameIndicator.transforming('scaleY', 0, 250);
					//GameIndicator_sub.setText('GO').transforming('scaleY', 1, transitionDuration);
					Indicator.states.index.set(1);

					FieldCanvas.addDelayCallback(transitionDuration + 500, function() {

						//GameIndicator_sub.transforming('scaleY', 0, 250);
						Indicator.states.index.set(-1);
						Game.record.launchRender();
					}, true);
				}, true);
			}, true);
		},

		process: function() {

			if (Game.processSN) {
				if (!Game.isPause) {
					StarBackgroundX.progress();
					StarBackgroundY.progress();
					new StarBackground();
				}

				Game.processSN = FieldCanvas.addDelayCallback(Game.processLatency / BackgroundSpeedMultiplier, Game.process);
			}
		},

		modeProcess: function() {

			if (Game.modeProcessSN) {
				var mode = Game.mode;

				if (!Game.isPause) {
					mode.process();
				}

				Game.modeProcessSN = FieldCanvas.addDelayCallback(mode.latency, Game.modeProcess);
			}
		},

		reset: function() {

			var i;
			var sprites = FieldCanvas.sprites;

			for (i = sprites.length - 1; i >= 0; i--) {
				var sprite = sprites[i];

				if (!sprite.isStill) {
					FieldCanvas.removeSprite(sprite);
				}
				//if (sprite !== Paddle && sprite !== HitTimesIndicator) {
				//	FieldCanvas.removeSprite(sprite);
				//}
			}

			for (i in Animators) {
				Animators[i].stop();
			}

			for (i = Balls.length - 1; i >=0; i--) {
				Balls[i].destroy(true); // from system
			}

			//FieldHolder.removeTransition('transform').removeTransform('translateY');
			HitTimesIndicator.reset();
			GameIndicator.removeTransition('transform').setTransform('translateY', 0);
			FieldCanvas.zoomScale = 1;
			FieldCanvas.shakeProgress = 0;
			var transforms = FieldCanvas.transforms;

			for (i in transforms) {
				var transform = transforms[i];

				if (transform.length) {
					transforms[i] = [];
					FieldCanvas.onTransform--;
				}
			}

			delayCallbacks = FieldCanvas.delayCallbacks;

			for (i = delayCallbacks.length - 1; i >= 0; i--) {
				delayCallbacks.pop();
			}

			this.live.reset(0);
			this.record.reset();

			Ball.prototype.attackPower.reset();
			BallUpdater.stop();

			MagicMissile.prototype.attackPower.reset();
			magicMissileLauncher.reset();

			Balls = [];
			Bricks = [];
			Wormholes = [];
			//Jellys = [];
			Springs = [];
		},

		isPause: false,

		pause: function() {

			FieldCanvas.stop();
			BallUpdater.pause();
			document.removeEventListener('mousemove', Paddle.updateX);
			FloatingMenu.addClass('show');
			this.isPause = true;
		},

		continue: function() {
			
			FieldCanvas.launch();
			BallUpdater.continue();
			document.addEventListener('mousemove', Paddle.updateX);
			FloatingMenu.removeClass('show');
			this.isPause = false;
		},

		fail: function() { // when ball lose

			Paddle.destroy();
			BallUpdater.stop();
			HyperMode.sleep();
			Game.live.add(-1);
			Audios.systemFailed.play();
		},

		revive: function() { // after fail, still have live

			FieldCanvas.addDelayCallback(180, function() {

				Paddle.revive(true); // generate new ball
			});
		},

		win: function() {

			GameIndicator.setText('VICTORY').transforming('scaleY', 1, 250);
			Game.final();
		},

		lose: function() {

			GameIndicator.setText('DEFEATED').transforming('scaleY', 1, 250);
			Game.final();
		},

		final: function() {

			FieldCanvas.zoomTo(1.2, 3000);
			FieldCanvas.addDelayCallback(180, function() {

				var now = Date.now();
				var elapsed = (now - Game.startTime) / 1000;
				var records = Game.record;
				var output = [elapsed];

				for (var i in records) {
					var record = records[i];

					if (i !== 'SN' && typeof record !== 'function') {
						output.push(record);
					}
				}

				Game.stop();
				FinalBoard.show(output);
			});
		},

		stop: function() { // when final or leave playground

			FieldCanvas.removeDelayCallback(this.processSN);
			this.processSN = void 0;

			if (this.modeProcessSN) {
				FieldCanvas.removeDelayCallback(this.modeProcessSN);
				this.modeProcessSN = void 0;
			}

			var mode = this.mode;

			if (mode.stop) {
				mode.stop();
			}

			FieldHolder.removeTransition('transform').removeTransform('translateY');
			GameIndicator.removeClass('show');

			Paddle.opacity = 0;
		}
	};

	// System
	var System = {

		autoPlay: false,

		renderType: 0,

		init: function() {
			// pause/continue game when press esc key
			document.addEventListener('pointerlockchange', function toggleGame() {

				var lockElement = document.pointerLockElement;

				if (lockElement) { // on lock
					Game.continue();
				} else { // exit lock
					Game.pause();
				}
			});
			document.addEventListener('keyup', function requestPointerLock(e) {

				if (e.key === 'Escape' && Game.isPause) {
					System.requestPointerLock(); // will trigger toggleGame(), game continue
				}
			});
			// launch ball
			FieldHolder.addEventListener('launchBall', 'mousedown', function launchBall(e) {

				BallUpdater.launch();
			});
			// bind process for all modes
			var gameModes = Game.modes;

			for (var i in gameModes) {
				var gameMode = gameModes[i];
				var process = gameMode.process;

				if (process) {
					gameMode.process = process.bind(gameMode);
				}
			}
			// set progressSpeed
			FieldCanvas.setProgressSpeed(1);
		},

		requestPointerLock: function() {

			FieldCanvas.entity.requestPointerLock();
		},

		exit: function() {

			Game.stop();
			FieldTransition.goBack();
		}
	};

	var Method = {

		launchOneHitMode: function() {

			Game.launch('oneHit');
		},

		launchInfinityMode: function() {

			Game.launch('infinity');
		},

		launchSnakeMode: function() {

			Game.launch('snake');
		},

		launchCustomMode: function() {

			Game.launch('custom');
		}
	};

	function Main() {

		var depends = ['mainHolder', 'ratio', 'size', 'parameter', 'settings', 'fieldTransition', 'images', 'audios', 'finalBoard'];

		ShareState
		.set('playground', Method, 'bnb')
		.get(depends, function(state) {

			MainHolder = state.mainHolder;
			Ratio = state.ratio;
			Size = state.size;
			Parameter = state.parameter;
			BrickX = Parameter.brickX;
			BrickY = Parameter.brickY;
			Settings = state.settings;
			ColorLevel = Settings.colorLevel;
			ValuePerLevel = Settings.valuePerLevel;
			MineLiveMultiplier = Settings.mineLiveMultiplier;
			FieldTransition = state.fieldTransition;
			Images = state.images;
			Audios = state.audios;
			FinalBoard = state.finalBoard;

			installCSS();
			generateDom();

			FieldTransition.addField('playground', Holder);
			//resizeDom();
			PaddleScrap.prototype.init();
			Ball.prototype.init();
			CarpBall.prototype.init();
			Brick.prototype.generateKeyframeSet();
			BallBrick.prototype.init();
			BombBrick.prototype.init();
			SpringBrick.prototype.init();
			//SnakeBrick.prototype.init();
			Snake.prototype.init();
			MagicMissile.prototype.init();

			Paddle.init();
			BreakpointIndicator.init();
			HitTimesIndicator.init();
			BallPower.reset(Size.ballPower).update();
			BallUpdater.init();
			brickFuncs.init();
			bulletFuncs.init();
			System.init();

			var speed = 1;
			var ballSpeed = 1;
			document.addEventListener('keyup', function(e) {

				var key = e.key;
				console.log('keyup key:', key);
				if (key === '+') {
					speed += 0.25;
					BallPower.reset().multiply(speed);
					FieldCanvas.setProgressSpeed(speed);
					console.log('+', speed, BallPower.value, FieldCanvas.progressDuration);
				} else if (key === '-') {
					speed -= 0.25;
					BallPower.reset().multiply(speed);
					FieldCanvas.setProgressSpeed(speed);
					console.log('-', speed, BallPower.value, FieldCanvas.progressDuration);
				} else if (key === 'g') {
					GravityBall.active();
				} else if (key === 's') {
					BallScale = BallScale === 1 ? 2 : 1;
				} else if (key === 'a') {
					System.autoPlay = !System.autoPlay;
					console.log('auto play:', System.autoPlay);
				} else if (key === 'c') {
					console.log('add CrapBall');
					BallPower.set(Size.carpBallPower);
					new CarpBall(Math.random() * 90);
				} else if (key === 'f') {
					FireAuras.toggle();
					console.log('FireAura:', FireAuras.active);
				} else if (key === 'ArrowUp') {
					speed += 0.25;
					FieldCanvas.setProgressSpeed(speed);
					console.log('+game speed', speed);
				} else if (key === 'ArrowDown') {
					speed -= 0.25;
					FieldCanvas.setProgressSpeed(speed);
					console.log('-game speed', speed);
				} else if (key === 'ArrowRight') {
					ballSpeed += 0.25;
					BallPower.reset().multiply(ballSpeed, true);
					console.log('+ball speed(', ballSpeed, ')', BallPower.value);
				} else if (key === 'ArrowLeft') {
					ballSpeed -= 0.25;
					BallPower.reset().multiply(ballSpeed, true);
					console.log('-ball speed(', ballSpeed, ')', BallPower.value);
				}


				if (key === '1') {
					Paddle.extend(1.8);
				} else if (key === '2') {
					Paddle.extend(1);
				} else if (key === '3') {
					console.log('new Ball');
					BallPower.set(Size.ballPower);
					var degree = Math.round(Math.random() * (75 - 30)) + 30;

					new Ball(degree);
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
					System.toggle();
				} else if (key === 'm') {
					System.onMouseTest = true;
				}  else if (key === 'b') { // bomb
					for (var x = 0; x <= BrickX; x++) {
						for (var y = 0; y <= BrickY; y++) {
							var b = Bricks[x][y];

							if (b && b.constructor === BombBrick) {
								b.hit(1, 0, 0, getRandomWay(), getRandomWay());
								return;
							}
						}
					}
				} else if (key === 'l') { // load data
					var data = JSON.parse(localStorage.getItem('brickData'));
					
					game.reset();
					brickFuncs.generate(data);
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

					brickFuncs.generate(rData);
				}
			});
		}, 'bnb');
	}

	window.addEventListener('load', Main);
})();