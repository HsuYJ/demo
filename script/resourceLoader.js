var Rl = (function() {

	var LoadedNumber = 0;
	var OnLoadingNumber = 0;
	var Images = {};
	var Audios = {};
	var Resource = {
		images: Images,
		audios: Audios,
	};
	var ImagePath = '';
	var AudioPath = '';
	var WhenProgress = [];
	var ReadyTodos = [];
	var Timestamp = Date.now();

	function check() {

		var i, l;

		LoadedNumber++;

		l = WhenProgress.length;

		if (l) {
			var progress = {
				loadedNumber: LoadedNumber,
				totalNumber: OnLoadingNumber,
				elapsed: Date.now() - Timestamp
			};

			for (i = 0; i < l; i++) {
				WhenProgress[i](progress);
			}
		}

		if (LoadedNumber === OnLoadingNumber) { // all resources are loaded
			for (i in Images) {
				Images[i].removeEventListener('load', check);
			}

			for (i in Audios) {
				Audios[i].removeEventListener('canplaythrough', check);
			}

			for (i = 0, l = ReadyTodos.length; i < l; i++) {
				ReadyTodos[i](Resource);
			}
		}
	}

	var Method = {

		setImagePath: function(PATH) {

			ImagePath = PATH;

			return this;
		},

		setAudioPath: function(PATH) {

			AudioPath = PATH;

			return this;
		},

		loadImage: function(NAME, FILE_NAME, PATH) {

			OnLoadingNumber++;

			var src = (PATH || ImagePath) + FILE_NAME;
			var image = new Image();

			image.addEventListener('load', check);
			image.src = src;
			Images[NAME] = image;

			return this;
		},

		loadImages: function() {

			var args = arguments;
			var l = args.length;

			OnLoadingNumber += l;

			for (var i = 0; i < l; i++) {
				var arg = args[i];
				var src = (arg[2] || ImagePath) + arg[1];
				var image = new Image();

				image.addEventListener('load', check);
				image.src = src;
				Images[arg[0]] = image;
			}

			return this;
		},

		loadAudio: function(NAME, FILE_NAME, PATH) {

			OnLoadingNumber++;

			var src = (PATH || AudioPath) + FILE_NAME;
			var audio = new Audio(src);

			audio.addEventListener('canplaythrough', check);
			Audios[NAME] = audio;

			return this;
		},

		loadAudios: function() {

			var args = arguments;
			var l = args.length;

			OnLoadingNumber += l;

			for (var i = 0; i < l; i++) {
				var arg = args[i];
				var src = (arg[2] || AudioPath) + arg[1];
				var audio = new Audio(src);

				audio.addEventListener('canplaythrough', check);
				Audios[arg[0]] = audio;
			}

			return this;
		},

		whenProgress: function(CALLBACK) {

			WhenProgress.push(CALLBACK);

			return this;
		},

		whenReady: function(CALLBACK) {

			ReadyTodos.push(CALLBACK);

			return this;
		},
	};

	return Method;

})();

/*var rs;

Rl
.setImagePath('./image/')
.setAudioPath('./audio/')
.loadImages(
	['knight', 'knight.png'],
	['monster', 'monster.png'],
	['action_stand', 'stand.png', './image/']
)
.loadAudios(
	['hit', 'hit_level.mp3'],
	['destroy', 'destroy.wav', './audio/']
)
.whenProgress(function(PROGRESS) {

	console.log(
		'Resource loading: ' + PROGRESS.loadedNumber + '/' + PROGRESS.totalNumber + '\n' +
		'Time elapsed: ' + PROGRESS.elapsed
	);
})
.whenReady(function(RESOURCE) {

	console.log('loaded', RESOURCE);
})
.whenReady(function(RESOURCE) {

	console.log('loaded2');

	rs = RESOURCE;
});*/