Clobe.export('mapBuilder', function(clobe) {

	var ScopeName = 'mapBuilder';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	var State = {

		color: mstate(void 0)
		.addMethod('init', function(VALUE) {

			var color = VALUE;

			ColorPicker.setStyle('backgroundColor', color);
			ColorPicker.entity.value = VALUE;

			return color;
		})
		.addHandler({
			handler: function() {

				var color = this.value;

				ColorPicker.setStyle('color', color);
			}
		}),

		opacity: mstate(255),

		touchedBrick: mstate(void 0)
	};

	function installCSS() {

		Md.Css(ScopeName)
		.addSelector({
			'.holder': {
				'z-index': 1,
				position: 'absolute',
				top: 0,
				width: '100%',
				height: '100%',
				'background-color': '#CCCCCC'
			},

			'.toolHolder': {
				padding: '10px',
				width: 'calc(100% - 20px)',

				'> *': {
					display: 'block',
					'margin-top': '1rem',
					width: '40px',
					height: '40px'
				},

				'> .colorPicker': {
					border: 0
				},

				'> .eraser': {
					'background-color': '#FAFAFA'
				},

				'> .file': {
					width: 'initial'
				},

				'> .btn_build': {
					width: 'initial'
				}
			},

			'.canvas': {
				position: 'relative',
				margin: '0 auto',

				'> .brick': {
					position: 'absolute',
					width: BrickSize + 'px',
					height: BrickSize + 'px',
					'box-shadow': 'inset 0 0 0 1px rgba(0, 0, 0, 0.25)',
					'-webkit-box-shadow': 'inset 0 0 0 1px rgba(0, 0, 0, 0.25)',
				}
			},


		})
		.mount();
	}

	var Holder, 
		ToolHolder, ColorPicker, Eraser, FileInput,
		Canvas,
		ImportCanvas;

	function create() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.appendChildren(

			ToolHolder = mdom().addClass('toolHolder')
			.appendChildren(

				ColorPicker = mdom(null, 'input').addClass('colorPicker', '$jscolor')
				.addEventListener('pickColor', 'change', function() {

					State.color.set('#' + this.entity.value);
				})
				.addEventListener('drawMode', 'click', function() {

					State.color.set(State.color.get(-1));
				}),

				Eraser = mdom().addClass('eraser')
				.addEventListener('eraseMode', 'click', function() {

					State.color.set('transparent');
				}),

				FileInput = mdom(null, 'input').addClass('file')
				//.setStyle('display', 'none')
				.setAttribute('type', 'file')
				.addEventListener('handleFile', 'change', function() {

					var file = this.entity.files[0];
					var fileReader = new FileReader();

					fileReader.onload = function(e) {
						
						var sizeX = clobe.brickX;
						var sizeY = clobe.brickY;
						var img = mdom(null, 'img').setAttribute('src', e.target.result);
						var ctx = ImportCanvas.entity.getContext('2d');
						//var ratio = img.entity.width / img.entity.height;
						var ratio = sizeX / sizeY;

						ctx.drawImage(img.entity,
							0, 0, img.entity.width, img.entity.height,
							//0, 0, sizeX * ratio, sizeY
							0, 0, sizeX / ratio, sizeY
						);

						var imageData = ctx.getImageData(0, 0, sizeX, sizeY);
						var getHexCode = function(X, Y) {

							var y = Y * sizeX * 4;
							var start = y + X * 4;
							var r = imageData.data[start].toString(16);
							if (r.length === 1) {
								r = '0' + r;
							}
							var g = imageData.data[start + 1].toString(16);
							if (g.length === 1) {
								g = '0' + g;
							}
							var b = imageData.data[start + 2].toString(16);
							if (b.length === 1) {
								b = '0' + b;
							}
							var a = imageData.data[start + 3];
							//var a = imageData.data[start + 3].toString(16);
							var hex = a === 0 ? 'transparent' : ('#' + r + g + b);

							return [hex, a];
						};
						var data = [];

						for (var i = 0; i < sizeX; i++) {
							var dataX = [];

							data.push(dataX);

							for (var j = 0; j < sizeY; j++) {
								var d = getHexCode(i, j);

								dataX.push(d);
							}
						}
						console.log(data[0].length)
						// drow to map builder
						for (var x = 0; x < sizeX; x++) {
							for (var y = 0; y < sizeY; y++) {
								var dataValue = data[x][y];

								State.touchedBrick.set(Bricks[x][y]);
								State.color.set(dataValue[0]);
								State.opacity.set(dataValue[1]);
								draw();
							}
						}
						//clobe.build();
						//Holder.setStyle('display', 'none');
					};
					fileReader.readAsDataURL(file);
				}),

				mtext('建立', null, 'button').addClass('btn_build').addEventListener('build', 'click', function() {

					clobe.build();
					Holder.setStyle('display', 'none');
				})
			),

			Canvas = mdom().addClass('canvas')
			.addEventListener('recordTouchedBrick', 'mousemove', function(e) {

				var rX = Math.floor((e.clientX - CanvasLeft) / BrickSize);
				if (rX < 0) {
					rX = 0;
				}
				var rY = Math.floor((e.clientY - CanvasTop) / BrickSize);
				if (rY < 0) {
					rY = 0;
				}

				State.touchedBrick.set(Bricks[rX][rY]);
			})
			.addEventListener('draw', 'mousedown', function(e) {

				draw();

				this.addEventListener('drawing', 'mousemove', function() {

					draw();
				});

				Holder.addEventListener('cancelDrawing', 'mouseup', function() {

					Holder.removeEventListener('cancelDrawing', 'mouseup');
					Canvas.removeEventListener('drawing', 'mousemove');
				});
			})
			
		)
		.endScope();

		ImportCanvas = mdom(null, 'canvas').setAttributes({
			from: 'mapBuilder.js',
			width: clobe.brickX,
			height: clobe.brickY
		})
		.setStyles({
			display: 'none',
			zIndex: 100,
			position: 'relative',
			left: '100px'
		})
		.mount(document.body);
	}

	var Bricks = [];

	function Brick(X, Y) {

		var dom = mdom().addClass('brick')
		.setStyles({
			left: BrickSize * X + 'px',
			top: BrickSize * Y + 'px',
		});

		this.dom = dom;
		this.color = mstate('transparent')
		.addHandler({
			handler: function() {

				dom.setStyle('backgroundColor', this.value);
			}
		});
		this.opacity = mstate(255)
		.addHandler({
			handler: function() {

				dom.setStyle('opacity', this.value / 255);
			}
		});

		Canvas.appendChild(dom);
	}

	function createBricks() {

		for (var x = 0, xl = clobe.brickX; x < xl; x++) {
			var bricksX = [];

			Bricks.push(bricksX);

			for (var y = 0, yl = clobe.brickY; y < yl; y++) {
				var brick = new Brick(x, y);

				bricksX.push(brick);
			}
		}
	}

	function draw() {

		var touchedBrick = State.touchedBrick.value;

		touchedBrick.color.set(State.color.value);
		touchedBrick.opacity.set(State.opacity.value);
	}

	var ToolHolderHeight, CanvasLeft, CanvasTop, BrickSize;

	function manageSize() {

		var vw = innerWidth / 100;
		var vh = innerHeight / 100;
		var canvasWidth = vh * 90;

		ToolHolderHeight = vh * 10;
		ToolHolder.setStyles({
			height: (ToolHolderHeight - 20) + 'px'
		});

		CanvasLeft = (innerWidth - canvasWidth) / 2;
		CanvasTop = ToolHolderHeight;
		Canvas.setStyles({
			width: canvasWidth + 'px',
			height: canvasWidth + 'px'
		});

		BrickSize = canvasWidth / clobe.brickX;
	}

	var Method = {

		create: function() {

			create();
			manageSize();
			createBricks();
			installCSS();

			return Holder;
		},

		state: State,

		bricks: Bricks
	};

	return Method;
});