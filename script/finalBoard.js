(function() {

	var ScopeName = 'FinalBoard';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	var Ratio, Size, FieldTransition;

	function installCSS() {

		var r = Ratio;
		var s = Size;
		var css = Md.Css(ScopeName)
		.addSelector({
			'.holder': {
				'background-color': '#000000',
			},

			'.title': {
				color: '#FFF',
			},

			'.board': {
				padding: '1vh',
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: r.mainMenuWidth + 'vh',
				'background-color': '#CCCCCC',
				transform: 'translate3d(-50%, -50%, 0)',

				'> *': { // buttons
					'padding-left': '2vh',
					width: 'calc(100% - 2vh)',
					height: r.mainMenuButtonHeight + 'vh',
					'background-color': '#999',
					'line-height': r.mainMenuButtonHeight + 'vh',
					'font-size': '2vh',
					transition: 'transform 500ms',
					transform: 'scaleY(0)',

					'&.show': {
						transform: 'scaleY(1)',
					}
				}
			}
		})
		.mount();
	}

	// Doms
	var MainHolder;
	var Holder, Board;

	function generateDom() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.appendChildren(

			mtext('FINAL BOARD', null, 'div').addClass('title'),

			Board = mdom().addClass('board')
			.appendChildren(

				mtext('', null, 'div'), // timeElapsed
				mtext('', null, 'div'), // ballCatch
				mtext('', null, 'div'), // brickGenerate
				mtext('', null, 'div'), // brickHit
				mtext('', null, 'div'), // brickHitRecord
				mtext('', null, 'div'), // brickDestroy
				mtext('', null, 'div'), // brickCatch
				mtext('', null, 'div'), // magicMissileShot

				mtext('Exit', null, 'div').addClass('show').addEventListener('exit', 'click', function() {

					FieldTransition.goTo('menu');
				})
			)
		)
		.mount(MainHolder);
	}

	var Recordings = [
		'Time elapsed',
		'Ball catch',
		'Brick generate',
		'Brick hit',
		'Brick hit record',
		'Brick destroy',
		'Brick catch',
		'Magic missile shot',
	];

	var Method = {

		show: function(RECORDING) {

			FieldTransition.goTo('finalBoard', function() {

				document.exitPointerLock();

				var recordings = Board.children;

				for (var i = 0, l = RECORDING.length; i < l; i++) {
					recordings[i].setText(Recordings[i] + ': ' + RECORDING[i]).addClass('show');
				}
			});
		}
	};

	function Main() {

		var depends = ['mainHolder', 'ratio', 'size', 'fieldTransition'];

		ShareState
		.set('finalBoard', Method, 'bnb')
		.get(depends, function(state) {

			MainHolder = state.mainHolder;
			Ratio = state.ratio;
			Size = state.size;
			FieldTransition = state.fieldTransition;

			installCSS();
			generateDom();
			FieldTransition.addField('finalBoard', Holder);
		}, 'bnb');
	}

	window.addEventListener('load', Main);

})();