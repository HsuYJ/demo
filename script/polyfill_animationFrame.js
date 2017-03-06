// window.requestAnimationFrame(),
// window.calcelAnimationFrame()
(function() {

	var vendors = ['ms', 'moz', 'webkit'];

	for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
		window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		var lastTime = 0;

		window.requestAnimationFrame = function(callback) {

			var currTime = Date.now();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime)); // execute all RAF at same time
			var id = setTimeout(function() {

				callback();
			}, timeToCall);

			lastTime = currTime + timeToCall;

			return id;
		};

		window.cancelAnimationFrame = clearTimeout;
	}
})();