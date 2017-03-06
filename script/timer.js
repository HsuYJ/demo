// timer.js

var Timer = (function() {

	var Timers = {};
	var Methods = {

		setTimeout: function(ID, FUNC, LATENCY) {

			if (LATENCY) {
				Timers[ID] = setTimeout(FUNC, LATENCY);
			} else { // 0
				FUNC();
			}
		},

		clearTimeout: function(ID, IS_DELETE) {

			clearTimeout(Timers[ID]);
			delete Timers[ID];
		},

		resetTimeout: function(ID, FUNC, LATENCY) {

			if (Timers[ID]) {
				clearTimeout(Timers[ID]);
			}

			this.setTimeout(ID, FUNC, LATENCY);
		},

		deleteTimeout: function(ID) {

			delete Timers[ID];
		},

		setInterval: function(ID, FUNC, INTERVAL) {

			Timers[ID] = setInterval(FUNC, INTERVAL);
		},

		clearInterval: function(ID) {

			clearInterval(Timers[ID]);
			delete Timers[ID];
		}
	};

	return Methods;

})();