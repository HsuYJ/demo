var Cn = (function() {

	var PIDividedBy180 = Math.PI / 180;

	function Canvas(WIDTH, HEIGHT, CANVAS) {

		var canvas = CANVAS;

		if (!canvas) {
			canvas = document.createElement('Canvas');

			canvas.width = WIDTH;
			canvas.height = HEIGHT;
		}

		this.entity = canvas;
		this.ctx = canvas.getContext('2d');
		this.width = WIDTH || canvas.width;
		this.height = HEIGHT || canvas.height;
		this.onRender = false;
		this.render = render.bind(this);
		this.sprites = [];
		this.onAnimeSprites = []; // both onTransform and onAction sprites will push to there
	}

	Canvas.prototype = {
		constructor: Canvas,

		setSize: function(WIDTH, HEIGHT) {

			if (WIDTH) {
				this.width = WIDTH;
				this.entity.width = WIDTH;
			}

			if (HEIGHT) {
				this.height = HEIGHT;
				this.entity.height = HEIGHT;
			}

			return this;
		},

		appendSprite: function(SPRITE) {

			this.sprites.push(SPRITE);
			SPRITE.canvas = this;
			SPRITE.ctx = this.ctx;

			if (SPRITE.standAction) {
				SPRITE.action.play();
			}

			return this;
		},

		mount: function(DOM) {

			DOM.appendChild(this.entity);
			this.render();

			return this;
		},

		// call from Sprite
		launchRender: function() {

			if (!this.onRender) {
				this.onRender = true;
				requestAnimationFrame(this.render);
			}
		},

		launchAnime: function(SPRITE) {

			var onAnimeSprites = this.onAnimeSprites;

			if (onAnimeSprites.indexOf(SPRITE) === -1) {
				onAnimeSprites.push(SPRITE);
			}

			if (!this.onRender) {
				this.onRender = true;
				requestAnimationFrame(this.render);
			}
		},
	};

	function render() { // this = Canvas

		var onAnimeSprites = this.onAnimeSprites;
		var onAnimeSpriteNumber = onAnimeSprites.length;
		var i, l;
		// update sprite anime
		if (onAnimeSpriteNumber) {
			var now = Date.now();

			for (i = onAnimeSpriteNumber - 1; i >= 0; i--) {
				var isSpriteAnimeEnd = onAnimeSprites[i].updateAnime(now);

				if (isSpriteAnimeEnd) {
					onAnimeSprites.splice(i, 1);
				}
			}
		}
		// sorting sprites by z value for rendering priority

		// render sprite
		var sprites = this.sprites;

		this.ctx.clearRect(0, 0, this.width, this.height);

		for (i = 0, l = sprites.length; i < l; i++) {
			sprites[i].render();
		}
		// request next frame
		if (onAnimeSprites.length) { // onAnimeSprites is not empty, request next frame
			requestAnimationFrame(this.render);
		} else {
			this.onRender = false;
		}
	}

	function Sprite() {

		this.canvas = void 0;
		this.ctx = void 0;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.color = void 0;
		this.image = void 0;
		this.toX = 0.5; // transform-origin, 0(left, top), 0.5(center), 1(right, bottom)
		this.toY = 0.5;
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotateZ = 0;
		this.opacity = 1;
		this.onTransform = 0;
		this.transforms = {
			x: [],
			y: [],
			width: [],
			height: [],
			scaleX: [],
			scaleY: [],
			rotateZ: [],
			opacity: []
		};
		this.animes = {};
		this.anime = void 0;
		this.action = void 0;
		this.standAction = void 0; // when there is no action or when action is end, run standAction
		this.lastActionUpdateTime = 0;
		this.actions = {};
		//this.speed = 0;
	}

	Sprite.prototype = {
		constructor: Sprite,

		setProp: function(PROP_NAME, VALUE, SET_VALUE_ONLY) {

			this[PROP_NAME] = VALUE;

			var canvas = this.canvas;

			if (canvas && !SET_VALUE_ONLY) {
				canvas.launchRender();
			}

			return this;
		},

		setProps: function(PROPS, SET_VALUE_ONLY) {

			for (var propName in PROPS) {
				this[propName] = PROPS[propName];
			}

			var canvas = this.canvas;

			if (canvas && !SET_VALUE_ONLY) {
				canvas.launchRender();
			}

			return this;
		},

		setTransform: function(PROP_NAME, TARGET_VALUE, DURATION, SET_VALUE_ONLY) {

			var value = this[PROP_NAME];
			var gap = TARGET_VALUE - value;
			var frameNumber = Math.floor(DURATION / 16);
			var dpf = gap / frameNumber; // delta per frame
			var transform = this.transforms[PROP_NAME];
			var l = transform.length;
			var i;

			if (l) { // clear unfinished transform
				this.onTransform--;

				for (i = 0; i < l; i++) {
					transform.pop();
				}
			}

			for (i = 0, l = frameNumber - 1; i < l; i++) {
				transform.push(i * dpf + value);
			}

			transform.push(TARGET_VALUE);
			this.onTransform++;

			if (!SET_VALUE_ONLY) {
				this.canvas.launchAnime(this);
			}

			return this;
		},

		setTransforms: function(PROPS, DURATION, SET_VALUE_ONLY) {

			var transforms = this.transforms;
			var frameNumber = Math.floor(DURATION / 16);

			for (var propName in PROPS) {
				var value = this[propName];
				var targetValue = PROPS[propName];
				var gap = targetValue - value;
				var dpf = gap / frameNumber; // delta per frame
				var transform = transforms[propName];
				var l = transform.length;
				var i;

				if (l) { // clear unfinished transform
					this.onTransform--;

					for (i = 0; i < l; i++) {
						transform.pop();
					}
				}

				for (i = 0, l = frameNumber - 1; i < l; i++) {
					transform.push(i * dpf + value);
				}

				transform.push(targetValue);
				this.onTransform++;
			}

			if (!SET_VALUE_ONLY) {
				this.canvas.launchAnime(this);
			}

			return this;
		},

		stopTransform: function(PROP_NAME) {

			var transform = this.transforms[PROP_NAME];
			var l = transform.length;

			if (l) {
				this.onTransform--;

				for (var i = 0; i < l; i++) {
					transform.pop();
				}
			}

			return this;
		},

		setAnime: function(NAME, ANIME) {

			this.animes[NAME] = ANIME;
			ANIME.sprite = this;

			return this;
		},

		addStandAction: function(NAME, ACTION) {

			this.addAction(NAME, ACTION);
			this.standAction = ACTION;

			if (!this.action) {
				this.action = ACTION;
			}

			return this;
		},

		addAction: function(NAME, ACTION) {

			this.actions[NAME] = ACTION;
			ACTION.sprite = this;

			var width = this.width;
			var image = ACTION.image;
			var imageWidth = image.width;

			if (imageWidth) {
				ACTION.frameNumber = Math.round(image.width / width);
			} else {
				image.onload = function() {

					ACTION.frameNumber = Math.round(image.width / width);
				};
			}

			return this;
		},

		updateAnime: function(NOW) {

			// transforms
			if (this.onTransform) {
				var transforms = this.transforms;

				for (var propName in transforms) {
					var transform = transforms[propName];
					var frameNumber = transform.length;

					if (frameNumber) {
						var a = this[propName] = transform.shift();

						if (frameNumber === 1) { // this updating of [propName] is last frame
							this.onTransform--;
						}
					}
				}
			}

			if (!this.onTransform) {
				var anime = this.anime;

				if (anime) {
					anime.nextFrame();
				}
			}
			// action frame
			var action = this.action;

			if (action) {
				var isActionEnd = action.update(NOW);

				if (isActionEnd) {
					var standAction = this.standAction;

					if (standAction) {
						if (action !== standAction) {
							standAction.play(true);
						}
					} else {
						this.action = void 0;
					}
				}
			}
			// check if transform or action is end
			if (!this.onTransform && !this.action) { // end
				return true; // remove this sprite from Canvas.onAnimeSprites
			}
		},

		render: function() {

			var width = this.width;
			var height = this.height;
			var sX = 0;	// corp
			var sY = 0;
			var color = this.color;
			var image = this.image;
			var action = this.action;
			if (action) {
				sX = action.frameIndex * width;
				image = action.image;
			}
			var x = this.x;
			var y = this.y;
			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var rotateZ = this.rotateZ;
			var opacity = this.opacity;
			var toX = this.toX * width;
			var toY = this.toY * height;
			var ctx = this.ctx;
			var toRotate = rotateZ % 360 !== 0;
			var toScale = scaleX !== 1 || scaleY !== 1;

			ctx.save();
			ctx.globalAlpha = opacity;
			
			if (toRotate || toScale) {
				ctx.translate(x + toX, y + toY);
				if (toRotate) {
					ctx.rotate(rotateZ * PIDividedBy180);
				}
				ctx.translate(-toX * scaleX, -toY * scaleY);
				if (toScale) {
					ctx.scale(scaleX, scaleY);
				}
				if (color) {
					ctx.fillStyle = color;
					ctx.fillRect(0, 0, width, height);
				}
				if (image) {
					ctx.drawImage(
						image,
						sX, sY, width, height, // corp region
						0, 0, width, height
					);
				}
			} else {
				if (color) {
					ctx.fillStyle = color;
					ctx.fillRect(x, y, width, height);
				}
				if (image) {
					ctx.drawImage(
						image,
						sX, sY, width, height, // corp region
						x, y, width, height
					);
				}
			}
			ctx.restore();
		},

		requestRender: function() {

			this.canvas.launchRender();

			return this;
		},

		requestAnime: function() {

			this.canvas.launchAnime(this);

			return this;
		}
	};

	function Anime(PROPS) {

		this.sprite = void 0;
		this.keyframes = [];
		this.frameIndex = 0;
	}

	Anime.prototype = {
		constructor: Anime,

		addKeyframe: function(PROPS, DURATION) {

			this.keyframes.push({
				props: PROPS,
				duration: DURATION
			});

			return this;
		},

		play: function() {

			var keyframe = this.keyframes[0];
			var duration = keyframe.duration;
			var sprite = this.sprite;

			this.frameIndex = 0;
			sprite.anime = this;
			sprite.setTransforms(keyframe.props, duration);
		},

		stop: function() {

			var sprite = this.sprite;
			var props = this.keyframes[this.frameIndex].props;

			for (var propName in props) {
				sprite.stopTransform(propName);
			}

			sprite.anime = void 0;
		},

		nextFrame: function() { // called by Sprite.updateAnime()

			var frameIndex = this.frameIndex + 1;
			var keyframes = this.keyframes;

			if (frameIndex === keyframes.length) {
				frameIndex = 0;
			}

			this.frameIndex = frameIndex;

			var keyframe = keyframes[frameIndex];
			var duration = keyframe.duration;

			this.sprite.setTransforms(keyframe.props, duration);
		},
	};

	function Action(PROPS) { // unfinish

		this.sprite = void 0;
		this.fps = 60; // frames per second
		this.frameIndex = 0;
		this.frameNumber = 0; // set when owning by Sprite
		this.frameDirection = 1; // 1: ->, -1: <-
		this.reverseWhenEnd = false;
		this.image = void 0;
		this.todo = void 0;
		this.isPaused = false;
		this.loop = false;
		this.cancelable = true;

		for (var propName in PROPS) {
			if (this.hasOwnProperty(propName)) {
				this[propName] = PROPS[propName];
			}
		}

		this.dpf = Math.floor(1000 / this.fps); // duration per frame
	}

	Action.prototype = {
		constructor: Action,

		update: function(NOW) {

			var sprite = this.sprite;
			var toUpdate = Math.floor((NOW - sprite.lastActionUpdateTime) / this.dpf) > 1;
			var isEnd = false;

			if (toUpdate) {
				sprite.lastActionUpdateTime = NOW;

				var direction = this.frameDirection;
				var index = this.frameIndex += direction;

				if (this.reverseWhenEnd) {
					if (direction > 0) {
						var frameNumber = this.frameNumber;

						if (index === frameNumber) {
							this.frameIndex = frameNumber - 2;
							this.frameDirection = -1;
							isEnd = true; // end
						}
					} else {
						if (index === -1) {
							this.frameIndex = 1;
							this.frameDirection = 1;
							isEnd = true; // end
						}
					}
				} else {
					if (index === this.frameNumber) {
						this.frameIndex = 0;
						isEnd = true; // end
					}
				}
			}

			return this.loop ? false : isEnd;
		},

		beStand: function() {

			this.sprite.standAction = this;
		},

		play: function(INTERRUPT) {

			var sprite = this.sprite;
			var presentAction = sprite.action;

			if (INTERRUPT || !presentAction || presentAction.cancelable) {
				if (presentAction !== this) {
					this.frameIndex = 0;
					this.frameDirection = 1;
					this.isPaused = false;
					sprite.action = this;
					sprite.lastActionUpdateTime = Date.now();
					sprite.requestAnime();
				}
			}
		},

		stop: function() {

			this.sprite.action = void 0;
		},

		pause: function() {

			this.isPaused = true;
		}
	};

	var Method = {

		Canvas: function(WIDTH, HEIGHT, CANVAS) {

			return new Canvas(WIDTH, HEIGHT, CANVAS);
		},

		Sprite: function(WIDTH, HEIGHT) {

			return new Sprite();
		},

		Anime: function(PROPS) {

			return new Anime(PROPS);
		},

		Action: function(PROPS) {

			return new Action(PROPS);
		}
	};

	return Method;

})();

/*var c, s, b;

window.addEventListener('load', function() {

	Rl
	.setImagePath('./image/')
	.setAudioPath('./audio/')
	.loadImages(
		['stand', 'stand.png'],
		['walk', 'knight.png'],
		['attack', 'atk.png']
	)
	.whenProgress(function(PROGRESS) {

		console.log(
			'Resource loading: ' + PROGRESS.loadedNumber + '/' + PROGRESS.totalNumber + '\n' +
			'Time elapsed: ' + PROGRESS.elapsed
		);
	})
	.whenReady(function(RESOURCE) {

		var images = RESOURCE.image;
		var Paddle;

		c = Cn.Canvas(800, 800)
		.appendSprite(

			Paddle = Cn.Sprite()
			.setProps({
				x: 100,
				y: 800 - 50,
				width: 120,
				height: 50,
				toY: 1,
				color: '#333333'
			})
			.setAnime('idle', Cn.Anime()
				.addKeyframe({
					scaleX: 1.2,
					scaleY: 0.8,
				}, 500)
				.addKeyframe({
					scaleX: 0.8,
					scaleY: 1.2,
				}, 500)
			)
		)
		.mount(document.body);

		Paddle.animes.idle.play();
		document.addEventListener('mousemove', function(e) {

			Paddle.setProp('x', e.clientX);
		});

		c.entity.style.cssText +=
			'z-index: 1000;' +
			'position: absolute;' +
			'background-color: #FFF;';
	});
});*/