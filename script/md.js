var Md = (function() {

	var Scopes = [];
	var ModelScope;
	var Doms = {}; // name
	var Ancestors = {}; // scope

	/* Dom */

	function Dom(NAME, TAG) {

		this.name = NAME;
		this.scope = '';
		this.tail = ''; // = '_' + scope
		this.entity = document.createElement(TAG || 'div');
		this.children = [];
		this.ancestor = void 0;
		this.parent = void 0;
		this.attributes = {};
		this.classList = new ClassList(this);
		this.transition = new Transition(this);
		this.transform = new Transform(this);
		this.eventListeners = {};
		this.states = {};

		// scope
		// this.doms(for ancestor)
		if (ModelScope) {
			this.startScope(ModelScope);
			ModelScope = void 0;
		} else if (!!Scopes.length) {
			var ancestor = Scopes[0];

			scope = ancestor.scope;
			this.scope = scope;
			this.tail = '_' + scope;
			this.ancestor = ancestor;

			if (NAME) {
				ancestor.doms[NAME] = this;
			}
		}

		// restore at Doms
		if (NAME) {
			var doms = Doms[NAME];

			if (!doms) {
				doms = Doms[NAME] = [];
			}

			doms.push(this);
		}
	}

	Dom.prototype = {

		constructor: Dom,

		startScope: function(SCOPE) {

			var ancestor = this.ancestor;

			if (ancestor) {
				var ancestorDoms = ancestor.doms;

				delete ancestorDoms[this.name];
				ancestorDoms[SCOPE] = this;
			}

			this.scope = SCOPE;
			this.tail = '_' + SCOPE;
			this.doms = {};
			Scopes.unshift(this);
			Ancestors[SCOPE] = this;

			return this;
		},

		endScope: function() {

			Scopes.shift();

			return this;
		},

		// attribute
		setAttribute: function(NAME, VALUE) {

			this.attributes[NAME] = VALUE;

			if (NAME === 'value') {
				this.entity.value = VALUE;
			} else {
				this.entity.setAttribute(NAME, VALUE);
			}

			return this;
		},

		setAttributes: function(ATTRIBUTES) {

			var attributes = this.attributes;
			var entity = this.entity;

			for (var name in ATTRIBUTES) {
				var value = ATTRIBUTES[name];

				attributes[name] = value;

				if (name === 'value') {
					entity.value = value;
				} else {
					entity.setAttribute(name, value);
				}
			}

			return this;
		},

		getAttribute: function(NAME) {

			var attributes = this.attributes;
			var attribute = attributes[NAME];

			if (attribute === void 0) {
				attributes[NAME] = attribute = this.entity.getAttribute(NAME);
			}

			return attribute;
		},

		removeAttribute: function(NAME) {

			delete this.attributes[NAME];
			this.entity.removeAttribute(NAME);

			return this;
		},

		// class
		addClass: function() {

			var classList = this.classList;
			// iteration is faster than apply
			for (var i = 0, l = arguments.length; i < l; i++) {
				classList.add(arguments[i]);
			}

			return this;
		},

		removeClass: function() {

			var classList = this.classList;
			// iteration is faster than apply
			for (var i = 0, l = arguments.length; i < l; i++) {
				classList.remove(arguments[i]);
			}

			return this;
		},

		toggleClass: function(CLASS_NAME, FORCE) {

			this.classList.toggle(CLASS_NAME, FORCE);

			return this;
		},

		containsClass: function(CLASS_NAME) {

			return this.classList.contains(CLASS_NAME);
		},

		// style
		setStyle: function(NAME, VALUE) {

			this.entity.style[NAME] = VALUE;

			return this;
		},

		setStyles: function(STYLES) {

			var entity = this.entity;

			for (var name in STYLES) {
				entity.style[name] = STYLES[name];
			}

			return this;
		},

		removeStyle: function(NAME) {

			this.entity.style.removeProperty(NAME);

			return this;
		},

		// transition
		setTransition: function() { // name: string, duration: number(ms), timing-function: second string

			var args = arguments;
			var transition = this.transition;
			var name = args[0];
			var props = transition[name];

			if (props) {
				var arg1 = args[1];

				if (typeof arg1 === 'number') { // duration
					props.duration = arg1;

					var arg2 = args[2];

					if (arg2) {
						props.timing = arg2;
					}
				} else { // string, timing-function
					props.timing = arg1;
				}
			} else {
				transition[name] = {
					duration: args[1],
					timing: args[2] || 'ease'
				};
			}

			transition.update();

			return this;
		},

		setTransitions: function(TRANSITIONS) { // { name: duration(ms) }

			var transition = this.transition;

			for (var i in TRANSITIONS) {
				var duration = TRANSITIONS[i];
				var prop = transition[i];

				if (prop) {
					prop.duration = duration;
				} else {
					transition[i] = {
						duration: duration,
						timing: 'ease'
					};
				}
			}

			transition.update();

			return this;
		},

		removeTransition: function(NAME) {

			var transition = this.transition;
			var props = transition[NAME];

			if (props) {
				delete transition[NAME];
				transition.update();
			}

			return this;
		},

		// transform
		addTransform: function(NAME, VALUE, SET_VALUE_ONLY) {

			var transform = this.transform;

			transform.push([NAME, VALUE]);

			if (!SET_VALUE_ONLY) {
				transform.update();
			}

			return this;
		},

		addTransforms: function() { // [name, value], [], []...

			var args = arguments;
			var transform = this.transform;

			for (var i = 0, l = args.length; i < l; i++) {
				transform.push(args[i]);
			}

			transform.update();

			return this;
		},

		setTransform: function(NAME, VALUE, INDEX) { // INDEX: undefined(last)

			var transform = this.transform;
			var length = transform.length;
			var i, l, prop, is_available;

			if (INDEX === void 0) { // last
				for (i = length - 1; i >= 0; i--) {
					prop = transform[i];

					if (prop[0] === NAME) {
						is_available = true;
						prop[1] = VALUE;
						break;
					}
				}
			} else { // INDEX is defined
				var count = 0;

				for (i = 0; i < length; i++) {
					prop = transform[i];

					if (prop[0] === NAME) {
						if (count++ === INDEX) {
							is_available = true;
							prop[1] = VALUE;
							break;
						}
					}
				}
			}

			if (is_available) {
				transform.update();
			} else {
				this.addTransform(NAME, VALUE);
			}

			return this;
		},

		setTransforms: function() { // [name, value], [], []..., update last

			var args = arguments;
			var transform = this.transform;

			for (var i = 0, il = args.length; i < il; i++) {
				var arg = args[i];
				var name = arg[0];
				var is_available = false;

				for (var j = transform.length - 1; j >= 0; j--) {
					if (transform[j][0] === name) {
						is_available = true;
						transform[j] = arg;
					}
				}

				if (!is_available) {
					this.addTransform(name, arg[1], true); // set value only
				}
			}

			transform.update();

			return this;
		},

		removeTransform: function(NAME, INDEX) { // INDEX: undefined(last)

			var transform = this.transform;
			var length = transform.length;
			var i, index;

			if (INDEX === void 0) { // last
				for (i = length - 1; i >= 0; i--) {
					if (transform[i][0] === NAME) {
						index = i;
						break;
					}
				}
			} else { // INDEX is defined
				var count = 0;

				for (i = 0; i < length; i++) {
					if (transform[i][0] === NAME) {
						if (count++ === INDEX) {
							index = i;
							break;
						}
					}
				}
			}

			if (index !== void 0) {
				transform.splice(index, 1);
				transform.update();
			}

			return this;
		},

		updateTransform: function() {

			this.transform.update();

			return this;
		},

		transforming: function(NAME, VALUE, DURATION) {

			return this.setTransition('transform', DURATION).setTransform(NAME, VALUE);
		},

		// child
		appendChild: function(CHILD) {

			var childEntity = CHILD.entity;
			var parent = CHILD.parent;

			if (parent) {
				parent.removeChild(CHILD);
			}

			this.children.push(CHILD);
			this.entity.appendChild(CHILD.entity);
			CHILD.parent = this;

			var tail = this.tail;

			if (tail) {
				var is_ancestor = !!this.doms;
				var ancestor = is_ancestor ? this : this.ancestor;

				addScopeToDescendants(CHILD, ancestor);
			}

			return this;
		},

		appendChildren: function() {

			var args = arguments;
			var length = args.length;
			var entity = this.entity;
			var children = this.children;
			var i, child;

			for (i = 0; i < length; i++) {
					child = args[i];
				var parent = child.parent;

				if (parent) {
					parent.removeChild(child);
				}

				children.push(child);
				entity.appendChild(child.entity);
				child.parent = this;
			}

			var tail = this.tail;

			if (tail) {
				var is_ancestor = !!this.doms;
				var ancestor = is_ancestor ? this : this.ancestor;

				for (i = 0; i < length; i++) {
					addScopeToDescendants(args[i], ancestor);
				}
			}

			return this;
		},

		removeChild: function(CHILD) {

			var children = this.children;
			var index = children.indexOf(CHILD);

			if (index !== -1) {
				children.splice(index, 1);
				this.entity.removeChild(CHILD.entity);
				CHILD.parent = void 0;
				removeScopeFromDescendants(CHILD);
			}

			return this;
		},

		insertBefore: function(CHILD, BEFORE_CHILD) { // U

			var children = this.children;
			var index = children.indexOf(BEFORE_CHILD);

			if ( index === -1 ) {
				console.log('Failed to execute \'insertBefore\' on \'Node\': The node before which the new node is to be inserted is not a child of this node.');
				return;
			}

			var parent = CHILD.parent;

			if (parent) {
				parent.removeChild(CHILD);
			}

			children.splice(index, 0, CHILD);
			this.entity.insertBefore(CHILD.entity, BEFORE_CHILD.entity);
			CHILD.parent = this;

			if (this.scope) {
				var is_ancestor = !!this.doms;
				var ancestor = is_ancestor ? this : this.ancestor;

				addScopeToDescendants(CHILD, ancestor);
			}
		},

		// event listener
		addEventListener: function(NAME, TYPE, LISTENER, USER_CAPTURE) {

			var eventListeners = this.eventListeners;
			var eventListener = eventListeners[NAME];
			/*var self = this;
			var listenerFunction = function(e) {

				LISTENER.call(self, e);
			};*/

			var listenerFunction = LISTENER.bind(this);
			var entity = this.entity;

			if (eventListener) { // same name
				var container = eventListener[TYPE];

				if (container) { // same type
					if (LISTENER === container.originListener) { // duplicate, ignore it
						// do nothing
					} else { // replace
						entity.removeEventListener(TYPE, container.listener, container.userCapture);
						container.originListener = LISTENER;
						container.listener = listenerFunction;
						container.userCapture = USER_CAPTURE;
						entity.addEventListener(TYPE, listenerFunction, USER_CAPTURE);
					}
				} else {
					eventListener[TYPE] = {
						originListener: LISTENER,
						listener: listenerFunction,
						userCapture: USER_CAPTURE
					};
					entity.addEventListener(TYPE, listenerFunction, USER_CAPTURE);
				}
			} else {
				eventListener = eventListeners[NAME] = {};
				eventListener[TYPE] = {
					originListener: LISTENER,
					listener: listenerFunction,
					userCapture: USER_CAPTURE
				};
				entity.addEventListener(TYPE, listenerFunction, USER_CAPTURE);
			}

			return this;
		},

		removeEventListener: function(NAME, TYPE) {

			var eventListeners = this.eventListeners;
			var eventListener = eventListeners[NAME];

			if (eventListener) {
				var container = eventListener[TYPE];

				if (container) {
					this.entity.removeEventListener(TYPE, container.listener, container.userCapture);
					delete eventListener[TYPE];
				}
			}

			return this;
		},

		// state
		addState: function(NAME, STATE) {

			this.states[NAME] = STATE;

			if (typeof STATE === 'object') {
				STATE.target = this;
			}

			return this;
		},

		// css
		addCss: function(PROPS) {

			var css = new Css(PROPS.scope || this.scope);
			var selectors = PROPS.selectors;

			if (selectors) {
				css.selectors = selectors;
			}

			var mediaQueries = PROPS.mediaQueries;

			if (mediaQueries) {
				css.mediaQueries = mediaQueries;
			}

			var keyframes = PROPS.keyframes;

			if (keyframes) {
				css.keyframes = keyframes;
			}

			css.mount();

			return this;
		},

		// mount
		mount: function(TARGET) {

			var self = this;

			if (TARGET.constructor !== Dom) {
				self = this.entity;
			}

			TARGET.appendChild(self);

			return this;
		}
	};

	function addScopeToDescendants(DOM, ANCESTOR) { // for Dom.appendChild(), .appendChildren()

		var scope = ANCESTOR.scope;
		var tail = ANCESTOR.tail;
		var ancestorDoms = ANCESTOR.doms;
		var handler = function(dom) {

			if (dom.doms) { // dom has own scope
				ancestorDoms[dom.scope] = dom;
				dom.ancestor = ANCESTOR;
				return;
			}

			var classList_backup = dom.classList.slice();
			var classNameNumber = classList_backup.length;
			var i, l;

			for (i = 0; i < classNameNumber; i++) {
				dom.removeClass(classList_backup[i]);
			}

			ancestorDoms[dom.name] = dom;
			dom.ancestor = ANCESTOR;
			dom.scope = scope;
			dom.tail = tail;

			for (i = 0; i < classNameNumber; i++) {
				dom.addClass(classList_backup[i]);
			}

			var children = dom.children;

			if (children) { // TextDom has no child
				for (i = 0, l = children.length; i < l; i++) {
					handler(children[i]);
				}
			}
		};

		handler(DOM);
	}

	function removeScopeFromDescendants(DOM) { // for Dom.removeChild()

		var ancestor = DOM.ancestor;

		if (!ancestor) { // DOM is not belonging to an ancestor
			return;
		}

		var ancestorDoms = ancestor.doms;

		if (!!DOM.doms) { // DOM has own scope
			delete ancestorDoms[DOM.scope];
			DOM.ancestor = void 0;
			return;
		}

		var tail = DOM.tail;

		if (tail) {
			var handler = function(dom) {

				if (dom.doms) { // dom has own scope
					return;
				}

				var classList_backup = dom.classList.slice();
				var classNameNumber = classList_backup.length;
				var i, l;

				for (i = 0; i < classNameNumber; i++) {
					dom.removeClass(classList_backup[i]);
				}

				delete ancestorDoms[dom.name];
				dom.ancestor = void 0;
				dom.scope = '';
				dom.tail = '';

				for (i = 0; i < classNameNumber; i++) {
					dom.addClass(classList_backup[i]);
				}

				var children = dom.children;

				if (children) { // TextDom has no child
					for (i = 0, l = children.length; i < l; i++) {
						handler(children[i]);
					}
				}
			};

			handler(DOM);
		}
	}

	/* TextDom */

	function TextDom(STRING, NAME, TAG) {

		Dom.call(this, NAME, TAG || 'span');
		delete this.children;

		this.string = STRING;
		this.entity.textContent = STRING;
	}

	TextDom.prototype = Object.create(Dom.prototype);
	TextDom.prototype.constructor = TextDom;
	delete TextDom.prototype.startScope;
	delete TextDom.prototype.endScope;
	delete TextDom.prototype.appendChild;
	delete TextDom.prototype.appendChildren;
	delete TextDom.prototype.removeChild;
	delete TextDom.prototype.insertBefore;
	TextDom.prototype.setText = function(STRING) {

		this.string = STRING;
		this.entity.textContent = STRING;

		return this;
	};

	/* CanvasDOM */

	/* classList */

	function ClassList(TARGET) {

		Object.defineProperties(this, {
			entity: {
				value: TARGET.entity.classList,
				enumerable: false
			},

			owner: {
				value: TARGET,
				enumerable: false
			}
		});
	}

	ClassList.prototype = new Array(); // this error is OK
	ClassList.prototype.constructor = ClassList;

	Object.defineProperties(ClassList.prototype, {

		value: { get: function () { // ?

			var value = '';
			var is_first = true;

			for (var i = 0, l = this.length; i < l; i++) {
				if (!is_first) {
					value += ' ';
				}

				value += this[i];
				is_first = false;
			}

			return value;
		}},

		add: { value: function() {

			var tail = this.owner.tail;
			var entity = this.entity; // classList entity
			var classNames = arguments;
			var length = classNames.length;
			var i;

			for (i = 0; i < length; i++) {
				var className = classNames[i];
				var className_scope;

				if (className[0] === '$') { // no tail
					className_scope = className.substr(1);
				} else { // add tail
					className_scope = className + tail;
				}

				this.push(className);
				entity.add(className_scope);
			}
		}},

		remove: { value: function() {

			var tail = this.owner.tail;
			var entity = this.entity; // classList entity
			var classNames = arguments;

			for (var i = classNames.length - 1; i >= 0; i--) {
				var className = classNames[i];
				var index = this.indexOf(className);

				if (index !== -1) {
					var className_scope;

					if (className[0] === '$') { // no tail
						className_scope = className.substr(1);
					} else { // add tail
						className_scope = className + tail;
					}

					this.splice(index, 1);
					entity.remove(className_scope);
				}
			}
		}},

		toggle: { value: function(CLASS_NAME, FORCE) {

			var entity = this.entity;
			var index = this.indexOf(CLASS_NAME);
			var result = true;
			var className_scope;

			if (CLASS_NAME[0] === '$') { // no tail
				className_scope = CLASS_NAME.substr(1);
			} else { // add tail
				className_scope = CLASS_NAME + this.owner.tail;
			}

			if (FORCE === void 0) {
				if (index === -1) {
					this.push(CLASS_NAME);
					entity.add(className_scope);
				} else {
					this.splice(index, 1);
					entity.remove(className_scope);
					result = false;
				}
			} else {
				result = FORCE;

				if (FORCE) {
					if (index === -1) {
						this.push(CLASS_NAME);
						entity.add(className_scope);
					}
				} else {
					if (index !== -1) {
						this.splice(index, 1);
						entity.remove(className_scope);
					}
				}
			}

			return result;
		}},

		contains: { value: function(CLASS_NAME) {

			return this.indexOf(CLASS_NAME) !== -1;
		}}
	});

	/* transition */

	function Transition(TARGET) {

		Object.defineProperty(this, 'owner', {
			value: TARGET
		});
	}

	Transition.prototype.constructor = Transition;
	Object.defineProperty(Transition.prototype, 'value', { get: function() {

		var value = '';
		var is_first = true;

		for (var i in this) {
			var prop = this[i];
			var duration = prop.duration;
			var timing = prop.timing;
			var description = i + ' ' + duration + 'ms ' + timing;

			if (!is_first) {
				if (i === 'transform') {
					value = description + ',' + value;
				} else {
					value += ',' + description;
				}
			} else {
				value = description;
				is_first = false;
			}
		}

		return value;
	}});
	Object.defineProperty(Transition.prototype, 'update', { value: function() {

		var value = this.value;
		var style = this.owner.entity.style;

		style.transition = value;
		
		// MS edge will modify transition to webkitTransition
		// so check existence of transition before set webkit one
		if (!style.transition) {
			var is_hasTransform = !!this.transform;
			
			style.webkitTransition = is_hasTransform ? '-webkit-' + value : value;// safari;
		}
	}});

	/* transform */

	function Transform(TARGET) {

		Object.defineProperty(this, 'owner', {
			value: TARGET,
			enumerable: false
		});
	}

	Transform.prototype = new Array();
	Transform.prototype.constructor = Transform;
	Object.defineProperty(Transform.prototype, 'value', { get: function() {

		var value = '';
		var is_first = true;
		// for-loop is faster then .toString().replace(/,/g, ','), .join(' ')
		for (var i = 0, l = this.length; i < l; i++) {
			var prop = this[i];

			if (!is_first) {
				value += ' ';
			} else {
				is_first = false;
			}

			value += prop[0] + '(' + prop[1] + ')';
		}

		return value;
	}});
	Transform.prototype.update = function() {

		var value = this.value;
		var style = this.owner.entity.style;
		
		style.transform = value;
		style.webkitTransform = value; // safari
		style.msTransform = value; // IE9, will turn msTransform into transform
	};

	/* model */

	var Models = {}; // store Methods

	function Model(NAME, MODEL_PROPS) {

		var scope = NAME;
		var builder = MODEL_PROPS.builder;
		var env = MODEL_PROPS.env;
		var ind = MODEL_PROPS.ind;
		var event = MODEL_PROPS.event;
		var beforeCreate = MODEL_PROPS.beforeCreate;
		var afterCreate = MODEL_PROPS.afterCreate;
		var instances = [];
		// css
		installCss_model(NAME, MODEL_PROPS.css);
		// model
		var Model = function(NAME, PROPS) {

			var self = this;
			var i;
			// instances
			instances.push(this);
			this.instances = instances;
			this.name = NAME;
			// env
			for (i in env) {
				this[i] = env[i];
			}
			// ind
			for (i in ind) {
				this[i] = ind[i].bind(this);
			}
			// event
			this.event = {};

			for (i in event) {
				(function() {

					var _event = event[i];

					self.event[i] = function(e) {

						_event.call(this, e, self);
					};
				})();
			}

			// startScope
			ModelScope = scope;

			this.props = PROPS;

			if (beforeCreate) {
				beforeCreate.call(this);
			}

			this.holder = builder.call(this);
			this.doms = this.holder.doms;

			if (afterCreate) {
				afterCreate.call(this);
			}

			// endScope
			Scopes.shift();

			return this.holder;
		};

		Model.prototype.constructor = Model;

		// method
		var Methods = {

			instances: instances,

			create: function(NAME, PROPS) {
				
				var model = new Model(NAME, PROPS);

				return model;
			},

			get: function(NAME) {

				var instance;

				for (var i = 0, l = instances.length; i < l; i++) {
					instance = instances[i];

					if (instance.name === NAME) {
						break;
					}
				}

				return instance;
			}
		};

		// store
		Models[NAME] = Methods;

		return Methods;
	}

	function installCss_model(NAME, CSS) { // for Model()

		var css = new Css(NAME);
		var selectors = CSS.selectors;

		if (selectors) {
			css.selectors = CSS.selectors;
		}

		var mediaQueries = CSS.mediaQueries;

		if (mediaQueries) {
			css.mediaQueries = CSS.mediaQueries;
		}

		var keyframes = CSS.keyframes;

		if (keyframes) {
			css.keyframes = CSS.keyframes;
		}

		css.mount();
	}

	/* state */

	var States = {};

	function State(VALUE, NAME, CAP) {

		this.initValue = VALUE;
		this.value = VALUE;
		this.prevValues = [];
		this.cap = CAP || 2; // maximum capacity of prevValue
		this.blockers = [];
		this.trimers = [];
		this.handlers = [];
		this.methods = {};
		this.target = void 0; // set by Dom.addState()
		this.props = {};

		if (NAME) {
			States[NAME] = this;
		}
	}

	State.prototype = {

		constructor: State,

		setTarget: function(DOM) {

			this.target = DOM;

			return this;
		},

		get: function(INDEX) { // undefined or 0: p(present), -1: p - 1, -2: p - 2...

			var value = this.value;
			var prevValues = this.prevValues;
			var length = prevValues.length;

			if (length && INDEX) {
				value = prevValues[length + INDEX];
			}

			return value;
		},

		set: function(VALUE, FORCE) { // FORCE: Boolean

			var i, l;

			// blocker
			var blockers = this.blockers;
			var is_blocked;

			for (i = 0, l = blockers.length; i < l; i++) {
				if (blockers[i](VALUE)) { // blocked
					is_blocked = true;
					break;
				}
			}

			if (is_blocked) {
				return this;
			}

			// trimer
			var trimers = this.trimers;

			for (i = 0, l = trimers.length; i < l; i++) {
				VALUE = trimers[i](VALUE);
			}

			// update value
			var is_change = VALUE !== this.value;
			
			if (is_change) {
				var prevValues = this.prevValues;

				prevValues.push(this.value);
				this.value = VALUE;

				if (prevValues.length > this.cap) {
					prevValues.shift();
				}
			}

			// handler
			if (FORCE === false) {
				return this;
			}

			if (is_change || FORCE) {
				var handlers = this.handlers;

				for (i = 0, l = handlers.length; i < l; i++) {
					var handler = handlers[i];
					var condition = handler.condition;

					if (!condition || condition()) { // no condition or condition is matched
						handler.handler();
					}
				}
			}

			return this;
		},

		add: function(VALUE, FORCE) {

			this.set(this.value + VALUE, FORCE);

			return this;
		},

		multiply: function(VALUE, FORCE) {

			this.set(this.value * VALUE, FORCE);

			return this;
		},

		push: function(VALUE) { // ignores blocker and trimer, will not execute handler

			var prevValues = this.prevValues;

			prevValues.push(this.value);
			this.value = VALUE;

			if (prevValues.length > this.cap) {
				prevValues.shift();
			}

			return this;
		},

		update: function() {

			var handlers = this.handlers;

			for (var i = 0, l = handlers.length; i < l; i++) {
				var handler = handlers[i];
				var condition = handler.condition;

				if (!condition || condition()) { // no condition or condition is matched
					handler.handler();
				}
			}

			return this;
		},

		reset: function(VALUE) {
			// set value directly
			if (VALUE !== void 0) {
				this.value = VALUE;
				this.initValue = VALUE;
			} else {
				this.value = this.initValue;
			}
			// clear prevValues
			var prevValues = this.prevValues;

			for (var i = prevValues.length - 1; i >= 0; i--) {
				prevValues.pop();
			}

			return this;
		},

		setProp: function(NAME, VALUE) {

			this.props[NAME] = VALUE;

			return this;
		},

		addMethod: function(NAME, METHOD) {

			var self = this;
			var method = METHOD.bind(this);

			this[NAME] = function(value, force) {

				self.set(method(value), force);
			};

			return this;
		},

		addBlocker: function(BLOCKER) {

			this.blockers.push(BLOCKER.bind(this));

			return this;
		},

		addTrimer: function(TRIMER) {

			this.trimers.push(TRIMER.bind(this));

			return this;
		},

		addHandler: function(PROPS) { // {condition: func(not necessary), handler: func}

			var condition = PROPS.condition;

			if (condition) {
				condition = condition.bind(this);
			}

			this.handlers.push({

				condition: condition,

				handler: PROPS.handler.bind(this)
			});

			return this;
		}
	};

	/* stateModel */

	function StateModel(CAP) {

		var model = function(VALUE) {

			this.value = VALUE;
			this.prevValues = [];
			this.cap = CAP || 2; // maximum capacity of prevValue
			this.target = void 0;
		};

		model.prototype = {
			constructor: model,

			setTarget: function(TARGET) {

				this.target = TARGET;

				return this;
			},

			get: function(INDEX) {

				var value = this.value;
				var prevValues = this.prevValues;
				var length = prevValues.length;

				if (length && INDEX) {
					value = prevValues[length + INDEX];
				}

				return value;
			},

			set: function(VALUE, FORCE) {
				// block test
				var is_blocked = false;

				if (this.blocker) {
					is_blocked = this.blocker(VALUE);
				}

				if (is_blocked) {
					return;
				}
				// trim
				if (this.trimer) {
					VALUE = this.trimer(VALUE);
				}
				// change test
				var is_change = VALUE !== this.value;
				// update
				if (is_change) {
					var prevValues = this.prevValues;

					prevValues.push(this.value);
					this.value = VALUE;

					if (prevValues.length > this.cap) {
						prevValues.shift();
					}
				}

				// handler
				if (FORCE === false) {
					return;
				}

				if (is_change || FORCE) {
					this.handler();
				}
			},

			add: function(VALUE, FORCE) {

				this.set(this.value + VALUE, FORCE);
			},

			multiply: function(VALUE, FORCE) {

				this.set(this.value * VALUE, FORCE);
			},

			push: function(VALUE) { // ignores blocker and trimer, will not execute handler

				var prevValues = this.prevValues;

				prevValues.push(this.value);
				this.value = VALUE;

				if (prevValues.length > this.cap) {
					prevValues.shift();
				}
			},

			update: function() {

				this.handler();
			}
		};

		this.model = model;
	}

	StateModel.prototype = {
		constructor: StateModel,

		addMethod: function(NAME, METHOD) {

			var shadowName = '_' + NAME;
			var modelPrototype = this.model.prototype;

			modelPrototype[shadowName] = METHOD;
			modelPrototype[NAME] = function(VALUE, FORCE) {

				this.set(this[shadowName](VALUE), FORCE);
			};

			return this;
		},

		setBlocker: function(BLOCKER) {

			this.model.prototype.blocker = BLOCKER;

			return this;
		},

		setTrimer: function(TRIMER) {

			this.model.prototype.trimer = TRIMER;

			return this;
		},

		setHandler: function(HANDLER) {

			this.model.prototype.handler = HANDLER;

			return this;
		},

		newInstance: function(VALUE) {

			return new this.model(VALUE);
		}
	};

	/* css */

	var Is_IE9 = document.documentMode === 9;

	function Css(SCOPE) {

		this.scope = SCOPE;
		this.entity = document.createElement('style');
		this.entity.setAttribute('type', 'text/css');

		if (SCOPE) {
			this.entity.setAttribute('scope', SCOPE);
		}

		this.selectors = {};
		this.mediaQueries = {};
		this.keyframes = {};
	}

	Css.prototype = {

		constructor: Css,

		addSelector: function(SELECTORS) {

			var selectors = this.selectors;

			for (var selector in SELECTORS) {
				selectors[selector] = SELECTORS[selector];
			}

			return this;
		},

		addMediaQuery: function(RULE, SELECTORS) {

			this.mediaQueries[RULE] = SELECTORS;

			return this;
		},

		addKeyframe: function(NAME, STEPS) {

			this.keyframes[NAME] = STEPS;

			return this;
		},

		mount: function() {

			var entity = this.entity;
			var tail = '_' + this.scope;

			// selector
			var selectorsText = generateSelectorValue(this.selectors, tail);

			entity.appendChild(document.createTextNode(selectorsText));

			// mediaQuery
			var mediaQueries = this.mediaQueries;
			var mediaqueryText = generateMediaQueryValue(mediaQueries, tail);
			
			entity.appendChild(document.createTextNode(mediaqueryText));

			// keyframe
			var keyframes = this.keyframes;
			var keyframeText = generateKeyframeValue(keyframes, tail);
			
			entity.appendChild(document.createTextNode(keyframeText));

			// mount
			document.head.appendChild(entity);

			return this;
		}
	};

	function generateSelectorValue(SELECTORS, TAIL, FROM_KEYFRAME) { // FROM_KEYFRAME: Boolean

		var subSelectors = {};
		var is_subSelectorsEmpty = true;
		var value = '\n';

		for (var selector in SELECTORS) {
			var originSelector = selector;
			// check if selector contains ":not(selector, selector...)", if so, rewrite it seprated
			if (selector.indexOf('t(') !== -1) {
				selector = rewriteNotExpression(selector);
			}

			var group = selector.split(',');
			var groupLength = group.length;
			
			if (groupLength > 1) {
				var group0 = group[0].split(' ');

				group0.pop();

				var headSelector = group0.join(' ');

				for (var g = 1; g < groupLength; g++) {
					group[g] = headSelector + group[g];

				}

				selector = group.join(', ');
			}

			var selectorSet = selector.split(' ');
			var setNumber = selectorSet.length;
			var i, l;

			for (i = 0; i < setNumber; i++) {
				selectorSet[i] = trimSelector(selectorSet[i], TAIL);
			}

			// assemble set
			selector = '';
			// for-loop is faster than .join
			for (i = 0; i < setNumber; i++) {
				selector += selectorSet[i];
			}

			selector = selector.substr(1); // remove the first space added by trimSelector()

			var props = SELECTORS[originSelector];
			var valuePart = '';
			var has_prop = false; // selector has own props

			for (var propName in props) {
				var is_transition = propName === 'transition';
				var is_animation;

				if (!is_transition) {
					is_animation = propName.indexOf('animation') !== -1;
				}

				if (Is_IE9 && (is_transition || is_animation)) {
					continue;
				}

				var prop = props[propName];
				
				if (is_transition || is_animation) {
					if (is_animation && propName === 'animation-name') {
						prop += TAIL;
					}
				} else if (typeof prop === 'object' && !FROM_KEYFRAME) { // subSelector
					subSelectors[originSelector + ' ' + propName] = prop;
					is_subSelectorsEmpty = false;
					continue;
				}

				has_prop = true;
				valuePart += ' ' + propName + ': ' + prop + ';\n';

				if (propName === 'transform') {
					valuePart += ' -webkit-transform: ' + prop + ';\n';
					valuePart += ' -moz-transform: ' + prop + ';\n';
					valuePart += ' -ms-transform: ' + prop + ';\n';
				} else if (propName === 'transform-origin') {
					valuePart += ' -webkit-transform-origin: ' + prop + ';\n';
					valuePart += ' -moz-transform-origin: ' + prop + ';\n';
					valuePart += ' -ms-transform-origin: ' + prop + ';\n';
				} else {
					if (is_transition) {
						var webkitProp = prop;
						var mozProp = prop;

						if (prop.indexOf('transform') !== -1) {
							webkitProp = webkitProp.replace('transform', '-webkit-transform');
							mozProp = mozProp.replace('transform', '-moz-transform');
						}

						valuePart += ' -webkit-transition: ' + webkitProp + ';\n';
						valuePart += ' -moz-transition: ' + mozProp + ';\n';
					} else if (is_animation) {
						valuePart += ' -webkit-' + propName + ': ' + prop + ';\n';
						valuePart += ' -moz-' + propName + ': ' + prop + ';\n';
					}
				}
			}

			if (has_prop) {
				valuePart = selector + ' {\n' + valuePart + '}\n';
			}

			if (!is_subSelectorsEmpty) {
				// generate values
				valuePart += generateSelectorValue(subSelectors, TAIL);
				// reset
				is_subSelectorsEmpty = true;

				for (var s in subSelectors) {
					delete subSelectors[s];
				}
			}

			value += valuePart;
		}

		return value;
	}

	function generateMediaQueryValue(MEDIA_QUERIES, TAIL) {

		var value = '\n';

		for (var rule in MEDIA_QUERIES) {
			var mediaQuery = MEDIA_QUERIES[rule];

			value +=
			'@media ' + rule + ' {\n' +
			generateSelectorValue(mediaQuery, TAIL) +
			'}\n';
		}

		return value;
	}

	function generateKeyframeValue(KEYFRAMES, TAIL) {

		var value = '\n';

		for (var name in KEYFRAMES) {
			var keyframe = KEYFRAMES[name];
			var stepValue = generateSelectorValue(keyframe, null, true); // FROM_KEYFRAME

			if (TAIL) {
				name += TAIL;
			}

			value +=
			'@keyframes ' + name + ' {\n' +
			stepValue +
			'}\n' +
			'@-webkit-keyframes ' + name + ' {\n' +
			stepValue +
			'}\n' +
			'@-moz-keyframes ' + name + ' {\n' +
			stepValue +
			'}\n';
		}

		return value;
	}

	// helpers of generateSelectorValue()

	function rewriteNotExpression(SELECTOR) {

		var set = SELECTOR.split(' ');
		var startIndex = -1;
		var endIndex = -1;
		var i, l, part, notIndex;

		for (i = 0, l = set.length; i < l; i++) {
			part = set[i];

			if (startIndex === -1) {
				notIndex = part.indexOf('t(');

				if (notIndex !== -1) {
					startIndex = i;
				}
			}

			if (part[part.length - 1] === ')') {
				endIndex = i;
				break;
			}
		}

		if (startIndex !== endIndex) {
			var originNotSelector = '';
			var notSelector = '';

			for (i = startIndex, l = endIndex; i <= l; i++) {
				part = set[i];
				originNotSelector += ' ' + part;
				notSelector += part;
			}

			var notSelectors = notSelector.split(',');

			notSelectors[0] = notSelectors[0].substr(notIndex + 2);

			var lastNotIndex = notSelectors.length - 1;
			var lastPart = notSelectors[lastNotIndex];

			notSelectors[lastNotIndex] = lastPart.substr(0, lastPart.length - 1);

			// combine notSelectors
			notSelector = '';

			for (i = 0; i <= lastNotIndex; i++) {
				notSelector += ' &:not(' + notSelectors[i] + ')';
			}

			SELECTOR = SELECTOR.replace(originNotSelector, notSelector);
		}

		return SELECTOR;
	}

	function trimSelector(TEXT, TAIL, WITH) { // WITH(&): Boolean, from trimSelector()

		var headText = TEXT[0];
		var selector;

		if (headText === '&') { // with(no space before, ex: .calssA.classB)
			TEXT = TEXT.substr(1);
			TEXT = trimSelector(TEXT, TAIL, WITH = true);
		} else if (headText === '$') { // no tail
			TEXT = TEXT.substr(1);
			TEXT = trimSelector(TEXT, TAIL = void 0, WITH);
		} else if (headText === '.' || headText === '#') { // class or id
			if (!WITH) {
				TEXT = ' ' + TEXT;
			}

			if (TAIL) {
				var lastIndex = TEXT.length - 1;
				var lastText = TEXT[lastIndex];
				
				if (lastText === ',') {
					TEXT = TEXT.substr(0, lastIndex) + TAIL + ',';
				} else if (lastText === ')') {
					TEXT = TEXT.substr(0, lastIndex) + TAIL + ')';
				} else {
					var colonIndex = TEXT.indexOf(':');

					if (colonIndex !== -1) {
						TEXT = TEXT.replace(':', TAIL + ':');
					} else {
						TEXT += TAIL;
					}
				}
			}
		} else if (headText === ':' || headText === '[') { // :, :: or []
			if (TEXT[4] === '(') { // :not(selector)
				selector = TEXT.substring(5, TEXT.length - 1);
				TEXT = TEXT.replace(selector, trimSelector(selector, TAIL).substr(1));

				//if (!WITH) {
				//	TEXT = ' ' + TEXT;
				//}
			}
		} else if (headText === '*') {
			if (TEXT[5] === '(') { // *:not(selector)
				selector = TEXT.substring(6, TEXT.length - 1);
				TEXT = TEXT.replace(selector, trimSelector(selector, TAIL).substr(1));
				TEXT = ' ' + TEXT;
			}
		} else { // tagName or operator, ex: span, div, >
			TEXT = ' ' + TEXT;
		}

		return TEXT;
	}

	// methods

	var Methods = {
		// test methods
		scopes: function() {

			return Scopes;
		},

		// Dom
		Dom: function(NAME, TAG) {

			return new Dom(NAME, TAG);
		},

		TextDom: function(STRING, NAME, TAG) {

			return new TextDom(STRING, NAME, TAG);
		},

		getDomByScope: function(SCOPE) {

			return Ancestors[SCOPE];
		},

		getDomsByName: function(NAME) {

			var doms = Doms[NAME];

			if (doms) {
				doms = doms.slice();
			} else {
				doms = [];
			}

			return doms;
		},

		getDomByName: function(NAME, SCOPE) {

			var doms = Doms[NAME];
			var dom;

			if (doms) {
				for (var i = 0, l = doms.length; i < l; i++) {
					dom = doms[i];

					if (dom.scope === SCOPE) {
						break;
					}
				}
			}

			return dom;
		},

		// Model
		Model: function(NAME, MODEL_PROPS) {

			return Model(NAME, MODEL_PROPS);
		},

		getModel: function(NAME) {

			return Models[NAME];
		},

		// State
		State: function(VALUE, NAME, CAP) {

			return new State(VALUE, NAME, CAP);
		},

		getState: function(NAME) {

			return States[NAME];
		},

		// StateModel

		StateModel: function() {

			return new StateModel();
		},

		// css
		Css: function(SCOPE) {

			return new Css(SCOPE);
		}
	};

	return Methods;
})();