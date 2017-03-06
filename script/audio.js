var Ado = (function() {

	function Audio(SRC, VOLUME, START, END) {

		var audio = document.createElement('audio');

		audio.src = SRC;
		audio.volume = VOLUME || 1;
		this.audio = audio;
		this.start = START || 0;
		this.end = END;
		this.sectionDuration = 0;
		this.isPaussed = false;
		this.timer = void 0;
	}

	Audio.prototype = {
		constructor: Audio,

		volume: function(VOLUME) {

			this.audio.volume = VOLUME;
		},

		loop: function(BOOLEAN) {

			this.audio.loop = BOOLEAN;
		},

		section: function(DURATION) {

			this.sectionDuration = DURATION;
		},

		playSection: function(NUMBER) { // first value is 0

			var audio = this.audio;
			var sectionDuration = this.sectionDuration;
			var start = sectionDuration * NUMBER;

			audio.pause();
			clearTimeout(this.timer);
			audio.currentTime = start / 1000;
			audio.play();
			this.timer = setTimeout(function() {

				audio.pause();
			}, sectionDuration);
		},

		play: function() {

			var audio = this.audio;
			var start = this.start;
			var end = this.end;

			if (!this.isPaussed) {
				audio.currentTime = start;
			}

			this.isPaussed = false;

			audio.play();

			if (end) {
				this.timer = setTimeout(function() {

					audio.pause();
				}, (end - start) * 1000);
			}
		},

		pause: function() {

			this.isPaussed = true;
			this.audio.pause();
		},

		stop: function() {
			
			var audio = this.audio;

			audio.pause();
			audio.currentTime = this.start;
		}
	};

	var Method = {

		audio: function(SRC, VOLUME, START, END) {

			return new Audio(SRC, VOLUME, START, END);
		}
	};

	return Method;
})();