(function() {

	var is_toPolyfill = true;

	for (var key in Element.prototype) {
		if (key === 'classList') {
			is_toPolyfill = false;
			break;
		}
	}

	console.log('polyfills Element.prototype.classList:', is_toPolyfill);

	if (is_toPolyfill) {
		var ClassList = function(Element) {

			Object.defineProperties(this, {

				ownerElement: {
					value: Element,
					enumerable: false
				},

				lastValue: {
					value: '',
					enumerable: false
				},
			});
		};

		ClassList.prototype = new Array();
		ClassList.prototype.constructor = ClassList;

		// define classList methods
		Object.defineProperties(ClassList.prototype, {

			value: { get: getClassListValue },

			add: { value: function() {

				update(this);

				var args = arguments;
				var is_update;

				for (var i = 0, l = args.length; i < l; i++) {
					var className = args[i];

					if (this.indexOf(className) === -1) {
						this.push(className);
						is_update = true;
					}
				}

				if (is_update) {
					updateClassAttributeForElement(this);
				}
			}},

			remove: { value: function(CLASS_NAME) {

				update(this);

				var args = arguments;
				var is_update;

				for (var i = args.length - 1; i >= 0; i--) {
					var className = args[i];
					var index = this.indexOf(className);

					if (index !== -1) {
						this.splice( index, 1);
						is_update = true;
					}
				}

				if (is_update) {
					updateClassAttributeForElement(this);
				}
			}},

			toggle: { value: function(CLASS_NAME, FORCE) {

				update(this);

				var index = this.indexOf(CLASS_NAME);
				var result = true;

				if (FORCE === void 0) {
					if (index === -1) {
						this.push(CLASS_NAME);
					} else {
						this.splice(index, 1);
						result = false;
					}

					updateClassAttributeForElement(this);
				} else {
					result = FORCE;

					if (FORCE) {
						if (index === -1) {
							this.push(CLASS_NAME);
							updateClassAttributeForElement(this);
						}
					} else {
						if (index !== -1) {
							this.splice( index, 1);
							updateClassAttributeForElement(this);
						}
					}
				}

				return result;
			}},

			contains: { value: function(CLASS_NAME) {

				update(this);

				return this.indexOf(CLASS_NAME) !== -1;
			}}
		});

		// helper functions
		var update = function(CLASS_LIST) {

			var className = CLASS_LIST.ownerElement.className;

			if (className !== CLASS_LIST.lastValue) {
				var classes = className.split(' ');
				var number = classes.length;

				CLASS_LIST.length = number;

				for (var i = 0; i < number; i++) {
					CLASS_LIST[i] = classes[i];
				}
			}
		};

		var getClassListValue = function(CLASS_LIST) {
			// faster than .join()
			var value = '';
			var is_first = true;

			for (var i = 0, l = CLASS_LIST.length; i < l; i++) {
				if (!is_first) {
					value += ' ';
				}

				value += CLASS_LIST[i];
				is_first = false;
			}

			return value;
		};

		var updateClassAttributeForElement = function(CLASS_LIST) {

			var value = getClassListValue(CLASS_LIST);

			CLASS_LIST.ownerElement.className = CLASS_LIST.lastValue = value;
		};

		// define classList for Element
		Object.defineProperty( Element.prototype, 'classList', { get: function() {

				var classList = this._classList_;

				if ( !classList ) {
					Object.defineProperty( this, '_classList_', {

						value: new ClassList( this ),
						enumerable: false
					});

					classList = this._classList_;
				}

				return classList;
			}
		});
	}
})();