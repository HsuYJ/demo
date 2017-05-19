(function() {

	var ScopeName = 'MainMenu';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	var Ratio, Size, FieldTransition, Editor, Playground;

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

			'.menu': {
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
					'font-size': '2vh'
				}
			}
		})
		.mount();
	}

	// Doms
	var MainHolder;
	var Holder, Menu;

	function generateDom() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.appendChildren(

			mtext('BNB', null, 'div').addClass('title'),

			Menu = mdom().addClass('menu')
			.appendChildren(

				mtext('Campaign', null, 'div')
				.addEventListener('campaign', 'click', function() {

					FieldTransition.goTo('playground');
				}),

				mtext('Snake Mode', null, 'div')
				.addEventListener('snakeMode', 'click', function() {

					FieldTransition.goTo('playground');
					Playground.launchSnakeMode();
				}),

				mtext('Infinite Mode', null, 'div')
				.addEventListener('infinityMode', 'click', function() {

					FieldTransition.goTo('playground');
					Playground.launchInfinityMode();
				}),

				mtext('Custom Stage', null, 'div')
				.addEventListener('open editor', 'click', function() {

					FieldTransition.goTo('playground');
					Playground.launchCustomMode();
				}),

				mtext('Stage Editor', null, 'div')
				.addEventListener('open editor', 'click', function() {

					FieldTransition.goTo('editor');
				}),

				mtext('Settings', null, 'div')
			)
		)
		.mount(MainHolder);
	}

	var Method = {

		toggle: function() {

			Holder.toggleClass('$display');
		}
	};

	function Main() {

		var depends = ['mainHolder', 'ratio', 'size', 'fieldTransition', 'editor', 'playground'];

		ShareState
		.set('menu', Method, 'bnb')
		.get(depends, function(state) {

			MainHolder = state.mainHolder;
			Ratio = state.ratio;
			Size = state.size;
			FieldTransition = state.fieldTransition;
			Editor = state.editor;
			Playground = state.playground;

			installCSS();
			generateDom();
			FieldTransition.addField('menu', Holder);
			FieldTransition.goTo('menu');
		}, 'bnb');
	}

	window.addEventListener('load', Main);

})();