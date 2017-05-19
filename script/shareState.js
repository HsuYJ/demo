var ShareState = (function() {

	function shareFinish() {
		
		for (var i = Callbacks.length - 1; i >= 0; i--) {
			var callback = Callbacks.pop();
			var depends = callback.depends;
			var isFulfilled = true;

			for (var d = depends.length - 1; d >=0; d--) {
				if (!State.hasOwnProperty(depends[d])) {
					isFulfilled = false;
					break;
				}
			}

			if (isFulfilled) {
				callback.callback(State);
			}
		}
		
		for (var m in Method) {
			delete Method[m];
		}

		State = void 0;
		ShareState = void 0;
	}

	function ruin() { // when detect wrong key request
		console.log('ruin');
		var name;

		Key = void 0;

		for (name in State) {
			delete State[name];
		}

		State = void 0;

		for (var i = Callbacks.length - 1; i >= 0; i--) {
			Callbacks.pop();
		}

		for (name in Sets) {
			delete Sets[name];
		}

		Sets = void 0;

		for (name in Gets) {
			delete Gets[name];
		}

		Gets = void 0;

		for (name in Method) {
			delete Method[name];
		}

		Method = void 0;
		ShareState = void 0;
	}

	var TotalNumber = 0;
	var Key = void 0;
	var State = {};
	var Callbacks = []; // key confirmed
	var Sets = []; // key unchecked
	var Gets = []; // key unchecked

	var Method = {

		init: function(NUMBER, KEY) {

			if (!Key) {
				Key = KEY;
				TotalNumber += NUMBER;

				var i;

				for (i = Sets.length - 1; i >=0; i--) {
					var set = Sets.pop();

					if (set.key === Key) {
						State[set.name] = set.value;
					} else {
						ruin();
						return;
					}
				}

				for (i = Gets.length - 1; i >=0; i--) {
					var get = Gets.pop();

					if (get.key === Key) {
						Callbacks.push({
							depends: get.depends,
							callback: get.callback
						});
					} else {
						ruin();
						return;
					}
				}
			} else { // repeat key init
				ruin();
				return;
			}

			return this;
		},

		set: function(NAME, VALUE, KEY) {

			if (Key) {
				if (KEY === Key) {
					State[NAME] = VALUE;
				} else {
					ruin();
					return;
				}
			} else {
				Sets.push({
					name: NAME,
					value: VALUE,
					key: KEY
				});
			}

			return this;
		},

		get: function(DEPENDS, CALLBACK, KEY) {

			var state = State;

			if (CALLBACK) {
				if (Key) {
					if (KEY === Key) {
						var isFulfilled = true;

						for (var d = DEPENDS.length - 1; d >=0; d--) {
							if (!state.hasOwnProperty(DEPENDS[d])) {
								isFulfilled = false;
								break;
							}
						}

						if (isFulfilled) {
							CALLBACK(state);
						} else {
							Callbacks.push({
								depends: DEPENDS, // array of string
								callback: CALLBACK // function
							});
						}
					} else {
						ruin();
						return;
					}
				} else {
					Gets.push({
						depends: DEPENDS, // array of string
						callback: CALLBACK, // function
						key: KEY
					});
				}
			} else {
				if (Key && KEY !== Key) {
					ruin();
					return;
				}
			}

			TotalNumber--;

			if (!TotalNumber) { // all shared
				shareFinish();
			}
		}
	};

	return Method;

})();

//var _shareState = ShareState
//.init(5, 'gg123')
//.set('boo', 'boo value', 'gg123')
//.get(['test', 'getColorLevel'], function(state) {
//
//	console.log(state.test);
//	console.log(state.getColorLevel());
//}, 'gg123');