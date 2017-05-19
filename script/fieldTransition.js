(function() {

	var ScopeName = 'FieldTransition';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;
	var transitionDuration = 250; // ms
	var Ratio, Size;

	function installCSS() {

		var css = Md.Css(ScopeName)
		.addSelector({
			'.holder': {
				'z-index': 9999,
				'background-color': '#000000',
				opacity: 0,
				transition: 'opacity ' + transitionDuration + 'ms',
				transform: 'translate3d(0, -100%, 0)',

				'&.show': {
					opacity: 1
				},

				'&.display': {
					transform: 'translate3d(0, 0, 0)'
				}
			}
		})
		.mount();
	}

	// Doms
	var MainHolder;
	var Holder;

	function generateDom() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.mount(MainHolder);
	}

	var Fields = {};
	var field, fieldName, prevFieldName;
	var timer;
	var Method = {

		transitionDuration: transitionDuration,

		start: function(CALLBACK) {

			Holder.addClass('display', 'show');

			if (CALLBACK) {
				setTimeout(CALLBACK, transitionDuration);
			}
		},

		end: function() {

			clearTimeout(Timer);

			Holder.removeClass('show');

			timer = setTimeout(function() {

				Holder.removeClass('display');
			}, transitionDuration);
		},

		addField: function(FIELD_NAME, DOM) {

			Fields[FIELD_NAME] = DOM;
		},

		goTo: function(FIELD_NAME, CALLBACK) {

			Holder.addClass('display', 'show');

			setTimeout(function() { // shadow finish

				if (field) {
					field.removeClass('$display');
					prevFieldName = fieldName;
				}

				fieldName = FIELD_NAME;
				field = Fields[FIELD_NAME];
				field.addClass('$display');
				Holder.removeClass('show');

				setTimeout(function() { // shadow remove

					Holder.removeClass('display');

					if (CALLBACK) {
						CALLBACK();
					}
				}, transitionDuration);
			}, transitionDuration);
		},

		goBack: function() {

			Method.goTo(prevFieldName || 'menu');
		}
	};

	function Main() {

		ShareState
		.set('fieldTransition', Method, 'bnb')
		.get(['mainHolder', 'ratio', 'size'], function(state) {

			MainHolder = state.mainHolder;
			Ratio = state.ratio;
			Size = state.size;

			installCSS();
			generateDom();
		}, 'bnb');
	}

	window.addEventListener('load', Main);

})();