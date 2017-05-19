var Imatext =  (function() {

	function _imatext(JSON_DATA_STRING) {

		var data = JSON.parse(JSON_DATA_STRING.replace(/\\/g, ''));
		var words = {};

		for (var word in data) {
			var image = new Image();

			image.src = data[word];
			words[word] = image;
		}

		this.words = words;
	}

	_imatext.prototype = {
		constructor: _imatext,

		drawText: function(CTX, WORD, X, Y, PERCENT_X, PERCENT_Y) {

			var word = this.words[word];
			var width = word.width;
			var height = word.height;

			CTX.drawImage(word,
				0, 0, width, height,
				X, Y, width * PERCENT_X, height * PERCENT_Y
			);
		}
	};

	function _setting(ARGS) {

		var wordsArray = (
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
			'abcdefghijklmnopqrstuvwxyz' +
			'0123456789' +
			'~!@#$%^&*()_+{}|:"<>?-=[];,./\\\'' +
			(ARGS.words || '')
		).split('');
		var words = {};

		for (var i = 0, l = wordsArray.length; i < l; i++) {
			var word = wordsArray[i];

			words[word] = word;
		}

		this.words = words;
		this.font = 'Arial';
		this.size = 12;
		this.sizeUnit = 'px'; // px or vh
		this.color = '#000000';
		this.adjX = 0;
		this.adjY = 0;

		delete ARGS.words;

		for (var argName in ARGS) {
			this[argName] = ARGS[argName];
		}
	}

	function render(ARGS) {

		var aa = 2;
		var st = new _setting(ARGS);
		var words = st.words;
		var font = st.font;
		var size = st.size;
		var sizeUnit = st.sizeUnit;
		var color = st.color;
		var adjX = st.adjX;
		var adjY = st.adjY;
		var sizeMeasurer = document.createElement('span');
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var output = {};

		sizeMeasurer.style.fontSize = size + sizeUnit;
		sizeMeasurer.style.fontFamily = font;
		document.body.appendChild(sizeMeasurer);

		for (var word in words) {
			sizeMeasurer.textContent = word;

			var textWidth = sizeMeasurer.offsetWidth;
			var textHeight = sizeMeasurer.offsetHeight;
			var shadowSize = textHeight / 50 * aa;

			canvas.width = textWidth * aa;
			canvas.height = textHeight * aa;
			ctx.font = size * aa + sizeUnit + ' ' + font;
			ctx.textBaseline = 'top';
			ctx.fillStyle = color;
			ctx.shadowColor = color;
			ctx.shadowBlur = shadowSize;
			ctx.fillText(word, adjX, adjY);

			var textCanvas = canvas.cloneNode();

			textCanvas.width = textWidth;
			textCanvas.height = textHeight;
			textCanvas.getContext('2d').drawImage(canvas,
				0, 0, canvas.width, canvas.height,
				0, 0, textWidth, textHeight
			);

			output[word] = textCanvas.toDataURL();
		}

		document.body.removeChild(sizeMeasurer);

		return JSON.stringify(output);
	}

	var Methods = {

		render: function(ARGS) { // Array

			return render(ARGS || {});
		},

		init: function(JSON_DATA_STRING) { // Object, output from render()

			return new _imatext(JSON_DATA_STRING);
		}
	};

	return Methods;
})();