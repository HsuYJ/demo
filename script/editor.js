var Editor = (function() {

	var ScopeName = 'editor';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	var Ratio, Size, Parameter, Settings, FieldTransition, ColorLevel, ValuePerLevel, MineLiveMultiplier;

	function installCSS() {

		var r = Ratio;
		var topRegionHeight = r.editorTopRegionHeight;
		var canvasRegionHeight = r.brickRegionHeight;
		var bottomRegionHeight = 100 - topRegionHeight - canvasRegionHeight;
		var panelColor = '#222222';

		var css = Md.Css(ScopeName)
		.addSelector({
			'.holder': {
				position: 'absolute',
				width: '100%',
				height: '100%',
				background: '#CCCCCC',
				cursor: 'default',
				'user-select': 'none',

				' button': {
					border: 0,

					':focus': {
						outline: 0
					}
				},

				'> *': {
					position: 'relative',
					margin: '0 auto',
					width: r.fieldWidth + 'vh',
				},

				'> .importCanvas': {
					display: 'none',
					position: 'absolute'
				},

				'> .topRegion': {
					height: topRegionHeight + 'vh',
					background: panelColor,

					'> button': {

					}
				},

				'> .canvasRegion': {
					overflow: 'hidden',
					height: canvasRegionHeight + 'vh',

					'&.onExtractColor': {
						cursor: 'url(./image/cursor_eyedropper.svg) 0 50, auto!important'
					},

					//':not(.onExtractColor) > .brick:hover': {
					//	'background-color': 'inherit!important',
					//},

					'&.onTool0': {
						cursor: 'url(./image/cursor_pen.svg) 0 50, auto',

						'> .brick:hover': {
							'background-color': 'inherit!important'
						}
					},

					'&.onTool1': {
						cursor: 'url(./image/cursor_paint.svg) 0 50, auto',

						'> .brick:hover': {
							'background-color': 'inherit!important'
						}
					},

					'&.onTool2': {
						cursor: 'url(./image/cursor_cross.svg) 25 25, auto'
					},

					'&.onTool3': {
						cursor: 'url(./image/cursor_ball.svg) 25 25, auto'
					},

					'&.onTool4': {
						cursor: 'url(./image/cursor_bomb.svg) 25 25, auto'
					},

					'&.onTool5': {
						cursor: 'url(./image/cursor_jelly.svg) 25 25, auto'
					},

					'> .brick': {
						position: 'absolute',
						width: r.brickWidth + 'vh',
						height: r.brickHeight + 'vh',
						'background-color': 'rgb(0, 0, 0)',
						'box-shadow': 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.5)',

						':hover': {
							'z-index': 3,
							'box-shadow': 'inset 0 0 0 1px rgba(255, 255, 255, 1), 0 0 4px 0 rgba(0, 0, 0, 0.5)',
							transform: 'scale(1.2, 1.2)'
						},

						'&.isBall': {
							'z-index': 2,
							'background-color': '#FFFFFF!important',
							'border-radius': '50%',
							'box-shadow': '0 0 4px 0 #000000',
							transform: 'scale(1.25, 1.25)'
						},

						'&.isBomb': {
							'z-index': 2,
							'background': 'url(./image/bomb.png) center center no-repeat',
							'background-color': '#000000!important',
							'background-size': '114%',
							transform: 'scale(1.4, 1.4)'
						},

						'&.isJelly': {
							'z-index': 2,
							'background': 'url(./image/jelly.png) center center no-repeat',
							'background-color': '#000000!important',
							'background-size': '114%',
							transform: 'scale(1.4, 1.4)'
						},

						'&.isWormhole': {
							'z-index': 2,
							'background': 'url(./image/wormhole.png) center center no-repeat',
							'background-color': '#FFFFFF!important',
							'background-size': '114%',
							transform: 'scale(1.4, 1.4)'
						}
					},

					'> .marqueeRegion': {
						display: 'none',
						'z-index': 2,
						position: 'absolute',
						left: 0,
						top: 0,
						'background-color': 'rgba(255, 255, 255, 0.25)',
						border: '2px dotted #0099FF',
						cursor: 'url(./image/cursor_move.svg) 25 25, auto',
						'image-rendering': 'pixelated',

						'&.show': {
							display: 'block'
						},

						'&.showButtons > .buttonHolder': {
							display: 'block'
						},

						'> canvas': {
							width: '100%',
							height: '100%'
						},

						'> .buttonHolder': {
							display: 'none',
							position: 'absolute'
						}
					}
				},

				'> .bottomRegion': {
					height: bottomRegionHeight + 'vh',
					background: panelColor,

					'> *': {
						display: 'inline-block',
						height: '100%',
						'background-color': 'inherit',
						'vertical-align': 'top',
						'box-shadow': 'inset 0 0 0 1px #000000'
					},

					'> .toolHolder': {
						width: bottomRegionHeight + 'vh',

						'> button': {
							margin: '1vh 0 0 1vh',
							width: '5vh',
							height: '5vh',
							'-webkit-mask': 'center center no-repeat',
							'-webkit-mask-size': 'cover',
							'background-color': '#FFFFFF',

							':hover': {
								transform: 'scale(1.2, 1.2)'
							},

							'&.selected': {
								'background-color': '#0099FF'
							}
						}
					},

					'> .colorInfo': {
						position: 'relative',
						width: bottomRegionHeight + 'vh',

						'> *': {
							position: 'absolute'
						},

						'> .button': {
							cursor: 'pointer'
						},
						
						'> .button, .info': {
							margin: '1vh',
							width: '5vh',
							height: '5vh',
						},

						'> .button:hover': {
							transform: 'scale(1.2, 1.2)'
						},

						'> .btn_extractColor': {
							'-webkit-mask': 'url(./image/btn_eyedropper.svg) center center no-repeat',
							'-webkit-mask-size': 'cover',
							'background-color': '#FFFFFF',

							'&.active': {
								'background-color': '#0099FF'
							}
						},

						'> .btn_saveColor': {
							right: 0,
							'background': 'url(./image/btn_add.svg) center center no-repeat',
							'background-size': 'cover'
						},

						'> .info_live': {
							bottom: '50%',
							right: 0,
							color: '#FFFFFF',
							'line-height': '5vh',
							'text-align': 'center',
							'font-family': 'monospace',
							'font-size': '3vh',
							'font-weight': 'bold'
						},

						'> .selectedColor': {
							position: 'initial',
							margin: '2vh auto',
							width: 'calc(50% - 4vh)',
							height: 'calc(50% - 4vh)',
							'background-color': '#000000',
							'border-radius': '50%',
							transition: 'background-color 500ms',

							'&.black > .eraserIndicator': {
								opacity: 1
							},

							'> .eraserIndicator': {
								position: 'relative',
								top: '25%',
								width: '100%',
								height: '50%',
								background: 'url(./image/btn_delete.svg) center center no-repeat',
								'background-size': 'auto 100%',
								opacity: 0,
								transition: 'opacity 250ms'
							},

							'> .icon_live': {
								position: 'absolute',
								bottom: '50%',
								right: '5vh',
								margin: '1vh',
								width: '5vh',
								height: '5vh',
								'-webkit-mask': 'url(./image/icon_live.svg) center center no-repeat',
								'-webkit-mask-size': 'cover',
								'background-color': 'inherit',
							}
						},

						'.colorManager': {
							bottom: 0,
							width: '100%',
							height: '50%',
							'background-color': 'inherit',

							'> *': {
								height: 'calc(100% / 3)'
							},

							'> .colorSelector': {
								//'box-shadow': 'inset 0 1px 0 0 #000000',

								'&.colorSelector0 > .cost': {

									'> *:hover': {
										'background-color': '#933!important'
									},

									'> .active': {
										'background-color': '#F33'
									}
								},

								'&.colorSelector1 > .cost': {

									'> *:hover': {
										'background-color': '#363!important'
									},

									'> .active': {
										'background-color': '#3C3'
									}
								},

								'&.colorSelector2 > .cost': {

									'> *:hover': {
										'background-color': '#229!important'
									},

									'> .active': {
										'background-color': '#22F'
									}
								},

								'> *': {
									display: 'inline-block',
									width: '25%',
									height: '100%',
									background: 'url() center center no-repeat',
									'background-size': 'cover',
									'vertical-align': 'top'
								},

								'> button:active': { // for caret(button)
									transform: 'scale(0.9, 0.9)'
								},

								'> .caret_left': {
									'background-image': 'url(./image/caret_left.svg)'
								},

								'> .caret_right': {
									'background-image': 'url(./image/caret_right.svg)'
								},

								'> .cost': {
									overflow: 'hidden',
									'margin-top': 'calc((50% / 3 - 2vh) / 2)',
									width: '50%',
									height: '2vh',
									'background-color': '#000000',
									'border-radius': '1vh',

									'> *': {
										float: 'left',
										width: 100 / ColorLevel + '%',
										height: '100%',
										'background-color': 'inherit'
									}
								}
							}
						}
					},

					'> .myPalette': {
						position: 'relative',
						'overflow-y': 'auto',
						width: 'calc(100% - ' + bottomRegionHeight * 2 + 'vh)',

						'> *': { // savedColor
							position: 'absolute',
							left: 0,
							top: 0,
							width: '4vh',
							height: '4vh',
							border: 0,
							'border-radius': '0.5vh',

							'&.canAnimate': {
								transition: 'opacity 250ms, transform 250ms'
							},

							':focus > *': {
								transform: 'rotateZ(0deg) scale(1, 1)'
							},

							'> *': { // btn_delete
								position: 'absolute',
								right: '-0.5vh',
								top: '-0.5vh',
								width: r.brickWidth * 1 + 'vh',
								height: r.brickHeight * 1 + 'vh',
								'background': 'url(./image/btn_delete.svg) center center no-repeat ' + panelColor,
								'background-size': 'cover',
								'border-radius': '50%',
								transition: 'inherit',
								transform: 'rotateZ(180deg) scale(0, 0)'
							}
						}
					}
				}
			}
		}).mount();
	}

	var MainHolder;
	var Holder,
		ImportCanvas, ImportCtx,
		EditorCanvas, MoveCanvas, MoveCtx, MarqueeRegion, MarqueeCanvas, MarqueeCtx,
		Red, Green, Blue,
		ToolHolder,
		ColorInfo,
			Btn_extractColor, Info_live,
			SelectedColor,
			ColorManager,
		MyPalette;

	function generateDom() {

		var r = Ratio;
		var s = Size;

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.appendChildren(

			ImportCanvas = mdom(null, 'canvas').addClass('importCanvas')
			.setStyles({
				width: r.brickRegionWidth / r.brickWidth + 'px',
				height: r.brickRegionHeight / r.brickHeight + 'px'
			})
			.setAttributes({
				width: r.brickRegionWidth / r.brickWidth,
				height: r.brickRegionHeight / r.brickHeight
			}),

			ButtonHolder = mdom().addClass('topRegion')
			.appendChildren(

				mtext('Back', null, 'button')
				.addEventListener('back to menu', 'click', function() {

					FieldTransition.goTo('menu');
				}),

				mtext('save', null, 'button')
				.addEventListener('save', 'click', function() {

					var data = [];

					for (var x = 0; x < BrickX; x++) {
						var container = [];

						data.push(container);

						for (var y = 0; y < BrickY; y++) {
							var brick = Bricks[x][y];
							var states = brick.states;

							container.push({
								type: states.type.value,
								rgb: states.rgb.value
							});
						}
					}

					localStorage.setItem('brickData', JSON.stringify(data));
				}),

				mtext('load', null, 'button')
				.addEventListener('load', 'click', function() {

					var datas = JSON.parse(localStorage.getItem('brickData'));

					for (var x = 0; x < BrickX; x++) {
						for (var y = 0; y < BrickY; y++) {
							var data = datas[x][y];
							var states = Bricks[x][y].states;

							states.rgb.set(data.rgb);
							states.type.set(data.type);
						}
					}
				}),

				mtext('exit', null, 'button')
				.addEventListener('exit', 'click', function() {

					Holder.setStyle('display', 'none');
				}),

				mtext('clean', null, 'button')
				.addEventListener('clean', 'click', function() {

					for (var x = 0; x < BrickX; x++) {
						for (var y = 0; y < BrickY; y++) {
							Bricks[x][y].states.rgb.erase();
						}
					}
				}),

				mtext('import', null, 'input')
				.setAttribute('type', 'file')
				.addEventListener('import', 'change', function(e) {

					var file = e.target.files[0];
					var fileReader = new FileReader();

					fileReader.onload = function(e) {

						var image = new Image();

						image.src = e.target.result;

						var imageWidth = image.width;
						var imageHeight = image.height;
						var width = ImportCanvas.getAttribute('width');
						var height = ImportCanvas.getAttribute('height');
						var ratio = height / imageHeight;
						var drawWidth = imageWidth * ratio;
						var drawHeight = height;
						var ctx = ImportCtx;

						ctx.clearRect(0, 0, width, height);
						ctx.drawImage(image,
							0, 0, imageWidth, imageHeight,
							0, 0, drawWidth, drawHeight
						);

						var imageData = ctx.getImageData(0, 0, width, height).data;

						for (var y = 0; y < BrickY; y++) {
							for (var x = 0; x < BrickX; x++) {
								var base = (y * (BrickX * 4)) + (x * 4);
								var r = imageData[base];
								var g = imageData[base + 1];
								var b = imageData[base + 2];
								var a = imageData[base + 3];
								var brick = Bricks[x][y];

								if (a) {
									brick.states.rgb.set([
										Math.round(r / ValuePerLevel),
										Math.round(g / ValuePerLevel),
										Math.round(b / ValuePerLevel)
									]);
								}
							}
						}
					};
					fileReader.readAsDataURL(file);
				})
			),

			EditorCanvas = mdom().addClass('canvasRegion')
			.addEventListener('disableContextmenu', 'contextmenu', function(e) {

				e.preventDefault();
			})
			.addEventListener('marqueeRegion_setRegionStart', 'mousedown', function(e) {

				if (selectedTool.value === 2 && e.path.indexOf(MarqueeRegion.entity) === -1) {
					var states = MarqueeRegion.states;
					var x = Math.floor((e.clientX - s.fieldLeft) / s.brickWidth);
					var y = Math.floor((e.clientY - s.editorTopRegionHeight) / s.brickHeight);

					if (states.regionConfirmed) { // modify editorCanvas
						states.regionConfirmed = false;
						drawMarqueeCanvasToEditorCanvas();
					}

					states.selectStart = [x, y];
					states.selectEnd.set([x, y]);
					MarqueeRegion.addClass('show');
				}
			})
			.addEventListener('marqueeRegion_setRegion', 'mousemove', function(e) {

				if (e.buttons === 1 && selectedTool.value === 2) {
					var states = MarqueeRegion.states;

					if (!states.regionConfirmed) {
						var x = Math.floor((e.clientX - s.fieldLeft) / s.brickWidth);
						var y = Math.floor((e.clientY - s.editorTopRegionHeight) / s.brickHeight);

						states.selectEnd.set([x, y]);
					}
				}
			})
			.appendChild(

				MarqueeRegion = mdom().addClass('marqueeRegion')
				.addState('regionConfirmed', false)
				.addState('onMove', false)
				.addState('selectStart', [0, 0])
				.addState('selectEnd', mstate([0, 0])
					.addBlocker(function(VALUE) {

						var x = VALUE[0];
						var y = VALUE[1];

						return (x < 0 || x >= BrickX || y < 0 || y >= BrickY);
					})
					.addHandler({
						handler: function() {

							var brickWidth = Size.brickWidth;
							var brickHeight = Size.brickHeight;
							var states = MarqueeRegion.states;
							var selectStart = states.selectStart;
							var selectEndValue = this.value;
							var sx = selectStart[0];
							var sy = selectStart[1];
							var ex = selectEndValue[0];
							var ey = selectEndValue[1];

							if (sx > ex) {
								var tempX = sx;

								sx = ex;
								ex = tempX;
							}

							if (sy > ey) {
								var tempY = sy;

								sy = ey;
								ey = tempY;
							}

							var left = sx * brickWidth;
							var top = sy * brickHeight;
							var widthRatio = ex - sx + 1;
							var heightRatio = ey - sy + 1;
							var width = widthRatio * brickWidth;
							var height = heightRatio * brickHeight;
							var position = states.position;

							position[0] = left;
							position[1] = top;

							MarqueeRegion.setStyles({
								left: left + 'px',
								top: top + 'px',
								width: (width - 2 * 2) + 'px', // border width is 2px
								height: (height - 2 * 2) + 'px'
							});

							MarqueeCanvas
							.setAttributes({
								width: widthRatio,
								height: heightRatio,
							});
						}
					})
				)
				.addState('moveStart', [0, 0])
				.addState('moveDelta', [0, 0])
				.addState('position', [0, 0])
				.addState('selectedData', (function() {

					var data = [];

					for (var x = 0; x < BrickX; x++) {
						var arrX = [];

						data.push(arrX);

						for (var y = 0; y < BrickY; y++) {
							arrX.push([0, 0, 0]);
						}
					}

					return data;
				}()))
				.addEventListener('moveStart', 'mousedown', function(e) {

					var states = this.states;
					var moveStart = states.moveStart;

					moveStart[0] = e.clientX;
					moveStart[1] = e.clientY;
					states.onMove = true;
				})
				.addEventListener('toggleButtons', 'contextmenu', function() {

					this.toggleClass('showButtons');
				})
				.addEventListener('hideButtons', 'click', function() {

					this.removeClass('showButtons');
				})
				.appendChildren(

					MarqueeCanvas = mdom(null, 'canvas')
					.setAttributes({
						width: r.brickRegionWidth / r.brickWidth,
						height: r.brickRegionHeight / r.brickHeight
					}),

					mdom().addClass('buttonHolder')
					.appendChildren(

						mtext('duplicate', null, 'button')
						.addEventListener('duplicate', 'click', function() {

							drawMarqueeCanvasToEditorCanvas();
						}),

						mtext('delete', null, 'button')
						.addEventListener('delete', 'click', function() {

							MarqueeRegion.states.regionConfirmed = false;
							MarqueeRegion.removeClass('show');
						})
					)
				)
			),

			mdom().addClass('bottomRegion')
			.appendChildren(

				ToolHolder = mdom().addClass('toolHolder')
				.addEventListener('chooseTool', 'click', function(e) {

					var entity = this.entity;
					var eventTarget = e.target;

					if (eventTarget !== entity) {
						var index = Array.prototype.indexOf.call(entity.children, eventTarget);

						selectedTool.set(index);
					}
				})
				.appendChildren(
					// tool0: pen
					mdom(null, 'button')
					.setAttribute('title', 'Pen')
					.setStyle('webkitMaskImage', 'url(./image/btn_pen.svg)'),
					// tool1: paint(fill)
					mdom(null, 'button')
					.setAttribute('title', 'Fill')
					.setStyle('webkitMaskImage', 'url(./image/btn_paint.svg)'),
					// tool2: marquee
					mdom(null, 'button')
					.setAttribute('title', 'Marquee')
					.setStyle('webkitMaskImage', 'url(./image/btn_marquee.svg)'),

					mdom(null, 'button')
					.setAttribute('title', 'Ball')
					.setStyle('webkitMaskImage', 'url(./image/btn_ball.svg)'),

					mdom(null, 'button')
					.setAttribute('title', 'Bomb')
					.setStyle('webkitMaskImage', 'url(./image/btn_bomb.svg)'),

					mdom(null, 'button')
					.setAttribute('title', 'Jelly')
					.setStyle('webkitMaskImage', 'url(./image/btn_jelly.svg)'),

					mdom(null, 'button')
					.setAttribute('title', 'Wormhole')
					.setStyle('webkitMaskImage', 'url(./image/btn_wormhole.svg)')
				),

				ColorInfo = mdom().addClass('colorInfo')
				.appendChildren(
					// btn_extractColor
					Btn_extractColor = mdom().addClass('button', 'btn_extractColor')
					.setAttribute('title', 'Extract color from canvas')
					.addEventListener('extractColor', 'click', function() {

						EditorCanvas.toggleClass('onExtractColor');
						this.toggleClass('active');

						if (selectedTool.value > 1) { // not pen or fill
							selectedTool.set(0);
						}
					}),
					// btn_saveColor
					mdom().addClass('button', 'btn_saveColor')
					.setAttribute('title', 'Save this color')
					.addEventListener('saveColor', 'click', function() {

						savedColor.add(selectedColor.value.slice());
						savedColor.relocate(-1); // last child
						savedColor.save();
					}),
					// info_live
					Info_live = mtext('', null, 'div').addClass('info', 'info_live')
					.setAttribute('title', 'Live of this color'),

					SelectedColor = mdom().addClass('selectedColor')
					.appendChildren(

						mdom().addClass('eraserIndicator'),

						mdom().addClass('icon_live')
					),

					ColorManager = mdom().addClass('colorManager')
					.appendChildren(

						Red = ColorSelector(0),

						Green = ColorSelector(1),

						Blue = ColorSelector(2)
					)
				),

				MyPalette = mdom().addClass('myPalette')
			)
		)
		.mount(MainHolder);

		generateBricks();
		ImportCtx = ImportCanvas.entity.getContext('2d');
		MarqueeCtx = MarqueeCanvas.entity.getContext('2d');
		// bind marquee events
		// (1) end of region-seting and (2) end of region-moving
		document.addEventListener('mouseup', function(e) {

			if (selectedTool.value === 2) {
				var states = MarqueeRegion.states;
				
				if (!states.regionConfirmed) { // set region end
					var selectStart = states.selectStart;
					var selectEnd = states.selectEnd;
					var selectEndValue = selectEnd.value;
					var selectedData = states.selectedData;
					var sx = selectStart[0];
					var sy = selectStart[1];
					var ex = selectEndValue[0];
					var ey = selectEndValue[1];

					if (ex < sx) {
						var tempX = sx;

						sx = ex;
						ex = tempX;
					}

					if (ey < sy) {
						var tempY = sy;

						sy = ey;
						ey = tempY;
					}

					states.regionConfirmed = true;
					selectStart[0] = sx;
					selectStart[1] = sy;
					selectEnd.set([ex, ey]);

					// rendering selected region to MarqueeCanvas
					MarqueeCtx.clearRect(
						0,
						0,
						MarqueeCanvas.getAttribute('width'),
						MarqueeCanvas.getAttribute('height')
					);

					for (var x = sx; x <= ex; x++) {
						for (var y = sy; y <= ey; y++) {
							var brickStates = Bricks[x][y].states;
							var color = brickStates.color.value;
							var rgb = brickStates.rgb;
							var rgbValue = rgb.value;
							var recording = selectedData[x][y];

							for (var i = 0; i < 3; i++) {
								recording[i] = rgbValue[i];
							}

							if (color !== 'black') { // transparent
								MarqueeCtx.fillStyle = color;
								MarqueeCtx.fillRect(x - sx, y - sy, 1, 1);
								rgb.erase();
							}
						}
					}
				} else if (states.onMove) { // move region end
					var brickWidth = s.brickWidth;
					var brickHeight = s.brickHeight;
					var moveDelta = states.moveDelta;
					var dx = Math.round(moveDelta[0] / brickWidth);
					var dy = Math.round(moveDelta[1] / brickHeight);
					var position = states.position;
					var left = position[0] += dx * brickWidth;
					var top = position[1] += dy * brickHeight;

					moveDelta[0] = moveDelta[1] = 0;

					MarqueeRegion
					.setStyles({
						left: left + 'px',
						top: top + 'px'
					})
					.setTransform('translate3d', '0, 0, 0');
					states.onMove = false;
				}
			}
		});
		// marquee moving event
		document.addEventListener('mousemove', function(e) {

			if (selectedTool.value === 2) {
				var states = MarqueeRegion.states;

				if (states.onMove) {// && states.regionConfirmed) {
					var moveStart = states.moveStart;
					var moveDelta = states.moveDelta;
					var translateX = e.clientX - moveStart[0];
					var translateY = e.clientY - moveStart[1];

					moveDelta[0] = translateX;
					moveDelta[1] = translateY;
					MarqueeRegion.setTransform('translate3d', translateX + 'px,' + translateY + 'px,0');
				}
			}
		});
	}

	var BrickX, BrickY;
	var Bricks = []; // color

	function generateBricks() {

		for (var x = 0; x < BrickX; x++) {
			var container = [];

			Bricks.push(container);

			for (var y = 0; y < BrickY; y++) {
				var brick = Brick(x, y);

				container.push(brick);
				EditorCanvas.appendChild(brick);
			}
		}
	}

	function Brick(X, Y) {

		var rgb = brickStateModel.rgb.newInstance([0, 0, 0]);
		var color = brickStateModel.color.newInstance('black');
		var type = brickStateModel.type.newInstance(0);
		// dom
		var holder = mdom().addClass('brick')
		.setStyles({
			left: X * Ratio.brickWidth + 'vh',
			top: Y * Ratio.brickHeight + 'vh'
		})
		.addState('rgb', rgb)
		.addState('color', color)
		.addState('type', type)
		.addEventListener('action', 'mousedown', function(e) {

			var button = e.button;

			if (EditorCanvas.containsClass('onExtractColor')) { // eyedropper tool, extract color
				if (button === 0) {
					if (!type.value) {
						var rgbValue = rgb.value; // [r, g, b]

						for (var i = 0; i < 3; i++) {
							ColorSelectors[i].setCost(rgbValue[i]);
						}
					}
				}

				requestAnimationFrame(function() { // avoid mousemove erase

					EditorCanvas.removeClass('onExtractColor');
					Btn_extractColor.removeClass('active');
				});
			} else { // tools
				if (button === 0) { // left button
					var toolIndex = selectedTool.value;

					if (toolIndex === 0) { // draw
						rgb.set(selectedColor.value.slice());
					} else if (toolIndex === 1) { // fill
						var selectedColorValue = selectedColor.value;
						var selectedColorCode = convertRGBtoColor.apply(null, selectedColorValue);
						var colorValue = color.value;

						if (colorValue !== selectedColorCode) {
							fill(X, Y, colorValue, selectedColorValue);
						}
					} else if (toolIndex === 2) { // move
						
					} else {
						type.set(toolIndex - 2);
					}
				} else if (button === 2) { // right button
					type.set(0);
					rgb.erase();
				}
			}
		})
		.addEventListener('continuouslyAction', 'mousemove', function(e) {

			if (!EditorCanvas.containsClass('onExtractColor')) {
				var pressedButton = e.buttons;

				if (pressedButton === 1) { // left button
					var toolIndex = selectedTool.value;

					if (toolIndex === 0) { // draw
						rgb.set(selectedColor.value.slice());
					} else if (toolIndex === 1) { // fill

					} else if (toolIndex === 2) { // marquee

					} else {
						type.set(toolIndex - 2);
					}
				} else if (pressedButton === 2) { // right button
					rgb.erase();
				}
			}
		});

		return holder;
	}

	var brickStateModel = {

		rgb:
			Md.StateModel()
			.addMethod('erase', function() {

				return [0, 0, 0];
			})
			.addMethod('isNotRGB', function() {

				return [-1, -1, -1];
			})
			.setBlocker(function(VALUE) {

				var value = this.value;
				var isBlocked = true;

				for (var i = 0; i < 3; i++) {
					if (VALUE[i] !== value[i]) {
						isBlocked = false;
						break;
					}
				}

				return isBlocked;
			})
			.setHandler(function() {

				var targetStates = this.target.states;

				targetStates.color.set(convertRGBtoColor.apply(null, this.value));
				targetStates.type.set(0);
			}),

		color:
			Md.StateModel()
			.setHandler(function() {

				this.target.setStyle('backgroundColor', this.value);
			}),

		type:
			Md.StateModel()
			.setHandler(function() {

				var type = this.value;
				var target = this.target;

				target.removeClass('isBall', 'isBomb', 'isJelly', 'isWormhole');

				if (type) {
					target.states.rgb.isNotRGB(null, false);

					if (type === 1) { // ball
						target.addClass('isBall');
					} else if (type === 2) { // bomb
						target.addClass('isBomb');
					} else if (type === 3) { // jelly
						target.addClass('isJelly');
					} else if (type === 4) { // wormhole
						target.addClass('isWormhole');
					}
				}
			}),
	};

	function fill(X, Y, COLOR, FILL_RGB) { // for Brick

		if (X < 0 || X >= BrickX || Y < 0 || Y >= BrickY) {
			return;
		}

		var states = Bricks[X][Y].states;

		if (states.type.value === 0 && states.color.value === COLOR) {
			states.rgb.set(FILL_RGB.slice());

			fill(X , Y - 1, COLOR, FILL_RGB);
			fill(X , Y + 1, COLOR, FILL_RGB);
			fill(X - 1 , Y, COLOR, FILL_RGB);
			fill(X + 1 , Y, COLOR, FILL_RGB);
		} else {
			// do nothing
		}
	}

	var selectedTool = mstate(-1)
		.addHandler({
			handler: function() {

				var tools = ToolHolder.children;
				var value = this.value;
				var oldValue = this.get(-1);

				if (oldValue !== -1) {
					tools[oldValue].removeClass('selected');
					EditorCanvas.removeClass('onTool' + oldValue);
				}

				tools[value].addClass('selected');
				EditorCanvas.addClass('onTool' + value);

				if (oldValue === 2) { // marquee tool
					var marqueeRegionStates = MarqueeRegion.states;

					MarqueeRegion.removeClass('show');

					if (marqueeRegionStates.regionConfirmed) {
						marqueeRegionStates.regionConfirmed = false;
						drawMarqueeCanvasToEditorCanvas();
					}
				}
			}
		});

	function drawMarqueeCanvasToEditorCanvas() {

		var s = Size;
		var states = MarqueeRegion.states;
		var selectStart = states.selectStart;
		var selectEndValue = states.selectEnd.value;
		var position = states.position;
		var selectedData = states.selectedData;
		var px = Math.round(position[0] / s.brickWidth);
		var py = Math.round(position[1] / s.brickHeight);
		var sx = selectStart[0];
		var sy = selectStart[1];
		var ex = selectEndValue[0];
		var ey = selectEndValue[1];
		var xCount = 0;
		var yCount = 0;

		for (x = sx; x <= ex; x++) {
			var brickX = px + xCount;

			xCount++;
			yCount = 0;

			if (brickX < 0 || brickX >= BrickX) {
				continue;
			}

			for (y = sy; y <= ey; y++) {
				var brickY = py + yCount;

				yCount++;

				if (brickY < 0 || brickY >= BrickY) {
					// do nothing
				} else {
					var rgb = selectedData[x][y];
					var r = rgb[0];
					var g = rgb[1];
					var b = rgb[2];

					if (r || g || b) { // not black(not transparent)
						Bricks[brickX][brickY].states.rgb.set([r, g, b]);
					}
				}
			}
		}
	}

	var selectedColor = mstate([0, 0, 0])
		.addMethod('set0', function(VALUE) { // R, use with force: true

			var value = this.value;

			value[0] = VALUE;

			return value;
		})
		.addMethod('set1', function(VALUE) { // G, use with force: true

			var value = this.value;

			value[1] = VALUE;

			return value;
		})
		.addMethod('set2', function(VALUE) { // B, use with force: true

			var value = this.value;

			value[2] = VALUE;

			return value;
		})
		.addHandler({
			handler: function() {

				var value = this.value;
				var color = convertRGBtoColor.apply(null, value);
				var r = value[0];
				var g = value[1];
				var b = value[2];
				var live = r + g + b;

				if (r === g && r === b) { // mine
					live *= MineLiveMultiplier;
				}

				SelectedColor
				.toggleClass('black', color === 'black')
				.setStyle('backgroundColor', color);
				EditorCanvas.setStyle('backgroundColor', color);
				Info_live.setText(live + '');
			}
		});

	var savedColor = {

		colors: [], // Array

		doms: [],

		selected: void 0,

		load: function() {

			var colors = localStorage.getItem('savedColors');

			if (colors) {
				var add = this.add;

				colors = JSON.parse(colors);

				for (var i = 0, l = colors.length; i < l; i++) {
					add(colors[i]);
				}

				this.relocate(0);
			}
		},

		save: function() { // get color from doms

			var colors = this.colors;
			var doms = MyPalette.children;
			var i, l;
			// make colors empty
			for (i = 0, l = colors.length; i < l; i++) {
				colors.pop();
			}
			// fill colors with existing savedColor
			for (i = 0, l = doms.length; i < l; i++) {
				colors.push(doms[i].states.color);
			}
			// save
			localStorage.setItem('savedColors', JSON.stringify(colors));
		},

		relocate: function(START, END) { // index

			var doms = MyPalette.children;
			
			if (START === -1) { // last child
				END = doms.length;
				START = END - 1;
			} else if (END === void 0) {
				END = doms.length;
			}

			for (var i = START; i < END; i++) {
				doms[i].setTransform('translate3d',
					// translateX
					((i % 8) * 6 + 2) + 'vh' + ',' +
					// translateY
					(Math.floor(i / 8) * 6 + 2) + 'vh' +
					// translateZ
					',0'
				);
			}
		},

		add: function(RGB) {

			var newDom = SavedColor(RGB);

			MyPalette.appendChild(newDom);

			setTimeout(function() { // for proper animation
				requestAnimationFrame(function() {

					newDom.addClass('canAnimate').setTransform('scale', '1, 1');
				});
			}, 0);
		},

		delete: function() {
			// this: child button of SavedColor
			var target = this.parent;
			var index = MyPalette.children.indexOf(target);

			target
			.removeEventListener('pickColor', 'click')
			.setTransform('scale', '0, 0');

			setTimeout(function() {

				requestAnimationFrame(function() {

					MyPalette.removeChild(target);
					savedColor.selected = void 0;
					savedColor.save();
					savedColor.relocate(index); // from index
				});
			}, 250);
		},

		select: function() { // Array

			var rgb = this.states.color;

			savedColor.selected = this;
			this.setTransform('scale', '1.2, 1.2');

			for (var i = 0; i < 3; i++) {
				ColorSelectors[i].setCost(rgb[i]);
			}
		}
	};
	// unselect savedColor
	document.addEventListener('mousedown', function() {

		var selected = savedColor.selected;

		if (selected) {
			selected.setTransform('scale', '1, 1');
		}

		savedColor.selected = void 0;
	});

	function SavedColor(RGB) { // Array

		var holder = mdom(null, 'button')
		.addState('color', RGB)
		.setStyle('backgroundColor', convertRGBtoColor.apply(null, RGB))
		.setTransforms(
			['translate3d', '0,0,0'],
			['scale', '0,0']
		)
		.addEventListener('pickColor', 'click', savedColor.select)
		.appendChild(

			mdom()
			.addEventListener('deleteSavedColor', 'click', savedColor.delete)
		);

		return holder;
	}

	var ColorSelectors = [];

	function ColorSelector(COLOR_ID) {
		// state
		var s_cost = mstate(0)
		.addMethod('add', function() {

			var value = this.value;

			if (value < ColorLevel) {
				value++;
			}

			return value;
		})
		.addMethod('reduce', function() {

			var value = this.value;

			if (value) {
				value--;
			}

			return value;
		})
		.addHandler({
			handler: function() {

				var value = this.value;

				cost.setAttribute('value', value);
				selectedColor['set' + COLOR_ID](value, true);

				var costPortions = cost.children;

				for (var i = 0; i < ColorLevel; i++) {
					costPortions[i].toggleClass('active', i < value);
				}
			}
		});
		// dom
		var holder, btnLeft, btnRight, cost, amount;
		var canSetCost = false;

		holder = mdom().addClass('colorSelector', 'colorSelector' + COLOR_ID)
		.addState('amount', s_cost)
		.addEventListener('enableCanSetCost', 'mousedown', function(e) {

			if (e.target !== btnLeft.entity) {
				canSetCost = true;
			}
		}, true)
		.appendChildren(

			btnLeft = mdom(null, 'button').addClass('caret_left')
			.addEventListener('reduce', 'click', function() {

				s_cost.reduce();
			})
			.addEventListener('reduce', 'mousemove', function(e) {

				if (canSetCost) {
					s_cost.reduce();
				}
			}),

			cost = mdom().addClass('cost'),

			btnRight = mdom(null, 'button').addClass('caret_right')
			.addEventListener('add', 'click', function() {

				s_cost.add();
			})
		);

		document.addEventListener('mouseup', function() {

			canSetCost = false;
		});

		var setCost = function(e) {

			if (canSetCost) {
				s_cost.set(cost.children.indexOf(this) + 1);
			}
		};

		for (var i = 0; i < ColorLevel; i++) {
			cost.appendChild(
				mdom(null, 'button')
				.addEventListener('setCost', 'mousedown', setCost)
				.addEventListener('setCost', 'mousemove', setCost)
			);
		}
		// reference
		ColorSelectors[COLOR_ID] = {

			setCost: function(NUMBER) {

				s_cost.set(NUMBER);
			}
		};

		return holder;
	}

	function convertRGBtoColor(R, G, B) {

		var color;

		if (R === 0 && R === G && R === B) {
			color = 'black';
		} else {
			color = 'rgb(' +
				R * ValuePerLevel + ',' +
				G * ValuePerLevel + ',' +
				B * ValuePerLevel + ')';
		}

		return color;
	}

	function Main() {

		ShareState
		.set('editor', Method, 'bnb')
		.get(['mainHolder', 'ratio', 'size', 'parameter', 'settings', 'fieldTransition'], function(state) {
			
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

			installCSS();
			generateDom();

			// initializing
			FieldTransition.addField('editor', Holder);
			savedColor.load();

			for (var i = 0; i < 3; i++) {
				ColorSelectors[i].setCost(ColorLevel); // white
			}

			selectedTool.set(0);
		}, 'bnb');
	}

	window.addEventListener('load', Main);

	var Method = {

		toggle: function() {

			Holder.toggleClass('$display');
		}
	};

	Method.init = function(RATIO, SIZE, COLOR_LEVEL, MINE_LIVE_MULTIPLIER) {

		/*var r = RATIO;

		Ratio = r;
		BrickX = Math.round(r.brickRegionWidth / r.brickWidth);
		BrickY = Math.round(r.brickRegionHeight / r.brickHeight);
		Size = SIZE;
		ColorLevel = COLOR_LEVEL;
		ValuePerLevel = Math.round(255 / ColorLevel);
		MineLiveMultiplier = MINE_LIVE_MULTIPLIER;

		installCSS();
		generateDom();
		savedColor.load();

		// initializing
		for (var i = 0; i < 3; i++) {
			ColorSelectors[i].setCost(ColorLevel); // white
		}

		selectedTool.set(0);*/
	};

	return Method;
})();