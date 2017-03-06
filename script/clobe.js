var Clobe = (function() {

	var exps = {};
	var reqs = {};

	/* request operator */
	function Clobe() {

		this.path = '';
		this.requestNumber = 0;
		this.loadedNumber = 0;
		this.readyCallback = void 0;
	}

	Clobe.prototype = {

		constructor: Clobe,

		set: function(NAME, VALUE) {

			this[NAME] = VALUE;

			return this;
		},

		definePath: function(PATH) {

			this.path = PATH;

			return this;
		},

		import: function(NAME, PATH) {

			var exp = exps[NAME];

			if (exp) { // exp is existing
				this[NAME] = exp(this);
			} else {
				var path = PATH ? PATH : this.path + '/' + NAME + '.js';

				InstallExp(path);
				this.requestNumber++;
				reqs[NAME] = this;
			}

			return this;
		},

		ready: function(CALLBACK) {

			this.readyCallback = CALLBACK;
			CheckIfReady(this);
		}
	};

	function InstallExp(PATH) {

		var script = document.createElement('script');

		script.type = 'text/javascript';
		script.src = PATH;
		document.head.appendChild(script);
	}

	function CheckIfReady(CLOBE) {

		var loadedNumber = CLOBE.loadedNumber;

		if (loadedNumber && loadedNumber === CLOBE.requestNumber) { // all requests are loaded
			CLOBE.readyCallback(CLOBE);
			exps = void 0;
			reqs = void 0;
		}
	}

	/* methods */

	function Export(NAME, EXP) {

		exps[NAME] = EXP;

		var req = reqs[NAME];

		if (req) {
			req.import(NAME);
			req.loadedNumber++;
			CheckIfReady(req);
		}
	}

	var Methods = {

		export: Export,

		clobe: function() {

			return new Clobe();
		}
	};

	return Methods;

})();

/*(function() {

	CLOBE.clobe()
	.set('envKey', 'ENV_KEY')
	.set('lastName', 'Cruise')
	.definePath('./script')
	.import('demo') // use predefined path
	.import('info', './script/info.js') // specific path
	.ready(function(clobe) {

		var demo = clobe.demo;
		var info = clobe.info;

		console.log('1st', demo.get());
		demo.set('demo');
		console.log('2nd', demo.get());
		info.set('Rex');
		console.log('3rd', demo.get());
		clobe.envKey = 'KEY_ENV';
		console.log('4th', demo.get());
	});

})();*/



