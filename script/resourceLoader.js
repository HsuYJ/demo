var Rl = (function() {

	var LoadedNumber = 0;
	var OnLoadingNumber = 0;
	var Images = {};
	var Audios = {};
	var Resource = {
		images: Images,
		audios: Audios,
	};
	var Containers = [];
	var ImagePath = '';
	var AudioPath = '';
	var WhenProgress = [];
	var ReadyTodos = [];
	var Timestamp = Date.now();

	function check(NAME, TYPE) {

		var i, l;

		LoadedNumber++;

		l = WhenProgress.length;

		if (l) {
			var progress = {
				type: TYPE,
				name: NAME,
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
				Audios[i].oncanplaythrough = void 0;
			}

			for (i = 0, l = ReadyTodos.length; i < l; i++) {
				ReadyTodos[i](Resource);
			}
		}
	}

	function loadImage(NAME, FILE_NAME, PATH) {

		OnLoadingNumber++;

		var src = (PATH || ImagePath) + FILE_NAME;
		var image = new Image();

		image.addEventListener('load', function() {

			check(NAME, 'image');
		});
		image.src = src;
		Images[NAME] = image;
	}

	function loadAudio(NAME, FILE_NAME, PATH) {

		OnLoadingNumber++;

		var src = (PATH || AudioPath) + FILE_NAME;
		var audio = new Audio(src);

		/*audio.addEventListener('canplaythrough', function() {

			check(NAME, 'audio');
		});*/

		audio.oncanplaythrough = function() {

			check(NAME, 'audio');
		};
		Audios[NAME] = audio;

		return this;
	}

	function Container(NAME) { // u

		this.path = '';
		Containers.push(this);
	}

	Container.prototype = {
		constructor: Container,

		setPath: function(PATH) {

			this.path = PATH;

			return this;
		},

		addSubcontainer: function(NAME) {

			this[NAME] = new Container(NAME);

			return this;
		},

		loadSource: function(NAME, FILE_NAME, PATH) {

			OnLoadingNumber++;

			var src = (PATH || this.path) + FILE_NAME;
			var image = new Image();

			image.addEventListener('load', check);
			image.src = src;
			Images[NAME] = image;

			return this;
		},

		loadSources: function() {


			return this;
		}
	};

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

			loadImage(NAME, FILE_NAME, PATH);

			return this;
		},

		loadImages: function() {

			for (var i = 0, l = arguments.length; i < l; i++) {
				loadImage.apply(null, arguments[i]);
			}

			return this;
		},

		loadAudio: function(NAME, FILE_NAME, PATH) {

			loadAudio(NAME, FILE_NAME, PATH);

			return this;
		},

		loadAudios: function() {

			for (var i = 0, l = arguments.length; i < l; i++) {
				loadAudio.apply(null, arguments[i]);
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