/**
*	virtualKeyboardDetect.js
*	2017/01/13
*/
(function() {

	var Timer;
	var Width = innerWidth;
	var	Height = innerHeight;
	//var MaxLength = Math.max(Width, Height);
	//var ScreenHeight = Math.min(screen.width, screen.height);
	var Is_landscape = Width > Height;
	var Is_keyborderVisible; // Boolean

	function detect() {

		var width = innerWidth;
		var height = innerHeight;
		var is_rotate = width !== Width;
		var is_keyborderPop = !is_rotate && height < Height;
		var is_keyborderFold = !is_rotate && height > Height;
		//var is_F11PressBack = ScreenHeight - Height < 5; // some browser will retain 1px at screen top

		// update state
		//MaxLength = Math.max(MaxLength, width, height);
		Width = width;
		Height = height;

		// update global state
		if (is_rotate) {
			//Is_landscape = width >= MaxLength;
		} else {
			Is_keyborderVisible = is_keyborderPop;
		}

		// dispatch event
		var customEvent;

		if (is_rotate) {
			window.dispatchEvent(new CustomEvent('rotate'));
		} else if (is_keyborderPop || is_keyborderFold) {
			var eventType = is_keyborderPop ? 'keyboardpop' : 'keyboardfold';

			document.dispatchEvent(new CustomEvent(eventType));
		}
	}

	window.addEventListener('resize', function() {

		clearTimeout(Timer);
		Timer = setTimeout(detect, 500);
	});

	/**
	*	polyfill CustomEvent
	*/
	(function () {
		// if CustomEvent() is native supported, modify nothing
		if (typeof CustomEvent === 'function') { return; }
		
		function customEvent(event, params) {
			
			params = params || {bubbles: false, cancelable: false, detail: undefined};

			var evt = document.createEvent('CustomEvent');

			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

			return evt;
		}

		customEvent.prototype = window.Event.prototype;
		window.CustomEvent = customEvent;
	})();

})();