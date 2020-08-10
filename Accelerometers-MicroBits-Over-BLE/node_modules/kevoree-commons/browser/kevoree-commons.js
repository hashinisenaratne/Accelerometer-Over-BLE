(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.KevoreeCommons = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.Resolver      = require('./lib/Resolver');
module.exports.Bootstrapper  = require('./lib/Bootstrapper');
module.exports.KevoreeLogger = require('./lib/KevoreeLogger');
module.exports.FileSystem    = require('./lib/FileSystem');
},{"./lib/Bootstrapper":2,"./lib/FileSystem":3,"./lib/KevoreeLogger":4,"./lib/Resolver":5}],2:[function(require,module,exports){
var Class = require('pseudoclass');

/**
 * Bootstrapper API
 * @type {Bootstrapper}
 */
var Bootstrapper = Class({
    toString: 'Bootstrapper',

    /**
     *
     * @param {KevoreeLogger} logger
     * @param {Resolver} resolver
     */
    construct: function (logger, resolver) {
        if (logger) {
            this.log = logger;
            if (resolver) {
                this.resolver = resolver;
            } else {
                throw new Error('No resolver given to '+this.toString()+' (you need to give a proper Resolver to your Bootstrapper)');
            }
        } else {
            throw new Error('No logger given to '+this.toString()+' (you need to give a proper KevoreeLogger to your Bootstrapper)');
        }
    },

    /**
     *
     * @param nodeName
     * @param model
     * @param callback
     */
    bootstrapNodeType: function (nodeName, model, callback) {
        callback = callback || function () {};

        var node = model.findNodesByID(nodeName);
        if (node) {
            var meta = node.typeDefinition.select('deployUnits[name=*]/filters[name=platform,value=javascript]');
            if (meta.size() > 0) {
                this.bootstrap(meta.get(0).eContainer(), false, callback);
            } else {
                callback(new Error("No DeployUnit found for '"+nodeName+"' that matches the 'javascript' platform"));
            }
        } else {
            return callback(new Error("Unable to find '"+nodeName+"' in the given model."));
        }
    },

    /**
     *
     * @param deployUnit
     * @param forceInstall [optional] boolean to indicate whether or not we should force re-installation
     * @param callback                function(Error, Clazz, ContainerRoot)
     */
    bootstrap: function (deployUnit, forceInstall, callback) {
        if (!callback) {
            // "forceInstall" parameter is not specified (optional)
            callback = forceInstall;
            forceInstall = false;
        }

        // --- Resolvers callback
        var bootstrapper = this;
        this.resolver.resolve(deployUnit, forceInstall, function (err, EntityClass) {
            if (err) {
                bootstrapper.log.error(bootstrapper.toString(), err.stack);
                return callback(new Error("'"+deployUnit.name+'@'+deployUnit.version+"' bootstrap failed!"));
            }

            // install success
            callback(null, EntityClass);
        });
    },

    /**
     *
     * @param deployUnit
     * @param callback
     */
    uninstall: function (deployUnit, callback) {
        var bootstrapper = this;
        this.resolver.uninstall(deployUnit, function (err) {
            if (err) {
                bootstrapper.log.error(bootstrapper.toString(), err.stack);
                callback(new Error("'"+deployUnit.name+'@'+deployUnit.version+"' uninstall failed!"));
                return;
            }

            // uninstall success
            callback(null);
        });
    }
});

module.exports = Bootstrapper;

},{"pseudoclass":9}],3:[function(require,module,exports){
var Class = require('pseudoclass');

var FileSystem = Class({
    toString: 'FileSystem',

    getFileSystem: function (size, callback) {
        if (document) {
            getBrowserFileSystem(this, size, callback);
        } else {
            console.error('Kevoree FileSystem API only handles Browser FS for now.');
        }
    }
});

var getBrowserFileSystem = function getBrowserFileSystem(fsapi, size, callback) {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    navigator.persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;

    if (window.requestFileSystem && navigator.persistentStorage) {

        var successHandler = function successHandler(grantedSize) {
            window.requestFileSystem(window.PERSISTENT, grantedSize, function (fs) {
                callback.call(fsapi, null, fs);
            });
        };

        var errorHandler = function errorHandler(e) {
            callback.call(fsapi, null);
        };

        navigator.persistentStorage.requestQuota(size, successHandler, errorHandler);
    }
};

module.exports = FileSystem;
},{"pseudoclass":9}],4:[function(require,module,exports){
var Class = require('pseudoclass'),
  chalk = require('chalk');

var LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'quiet'];

var chalkInfo = chalk.grey,
  chalkWarn = chalk.grey.bgYellow,
  chalkWarnMsg = chalk.yellow,
  chalkError = chalk.white.bgRed,
  chalkErrorMsg = chalk.red,
  chalkDebug = chalk.cyan;

var KevoreeLogger = Class({
  toString: 'KevoreeLogger',

  construct: function (tag) {
    this.tag = tag;
    this.level = 2;
    this.filter = '';
  },

  info: function (tag, msg) {
    if (this.level <= LEVELS.indexOf('info')) {
      if (typeof (msg) === 'undefined') {
        msg = tag;
        tag = this.tag;
      }

      if (this.filter.length === 0 || (this.filter.length > 0 && tag === this.filter)) {
        console.log(getTime() + '  ' + chalkInfo('INFO') + '   ' + processTag(tag) + '  ' + chalkInfo(msg));
      }
    }
  },

  debug: function (tag, msg) {
    if (this.level <= LEVELS.indexOf('debug')) {
      if (typeof (msg) === 'undefined') {
        msg = tag;
        tag = this.tag;
      }

      if (this.filter.length === 0 || (this.filter.length > 0 && tag === this.filter)) {
        console.log(getTime() + '  ' + chalkDebug('DEBUG ') + ' ' + processTag(tag) + '  ' + chalkDebug(msg));
      }
    }
  },

  warn: function (tag, msg) {
    if (this.level <= LEVELS.indexOf('warn')) {
      if (typeof (msg) === 'undefined') {
        msg = tag;
        tag = this.tag;
      }

      if (this.filter.length === 0 || (this.filter.length > 0 && tag === this.filter)) {
        console.warn(getTime() + '  ' + chalkWarn('WARN') + '   ' + processTag(tag) + '  ' + chalkWarnMsg(msg));
      }
    }
  },

  error: function (tag, msg) {
    if (this.level <= LEVELS.indexOf('error')) {
      if (typeof (msg) === 'undefined') {
        msg = tag;
        tag = this.tag;
      }

      if (this.filter.length === 0 || (this.filter.length > 0 && tag === this.filter)) {
        console.error(getTime() + '  ' + chalkError('ERROR') + '  ' + processTag(tag) + '  ' + chalkErrorMsg(msg));
      }
    }
  },

  setLevel: function (level) {
    if (typeof level === 'string') {
      this.level = LEVELS.indexOf(level.trim().toLowerCase());
    } else {
      this.level = level;
    }
    console.log(getTime() + '  ' + chalkInfo('ALL ') + '   ' + processTag(this.toString()) + '  ' + chalkInfo('Set logLevel=' + LEVELS[this.level]));
  },

  setFilter: function (filter) {
    this.filter = filter;
    console.log(getTime() + '  ' + chalkInfo('ALL ') + '   ' + processTag(this.toString()) + '  ' + chalkInfo('Set logFilter="' + this.filter + '"'));
  }
});

var processTag = function processTag(tag) {
  if (tag.length >= 15) {
    tag = tag.substr(0, 14) + '.';
  } else {
    var spaces = '';
    for (var i = 0; i < 15 - tag.length; i++) spaces += ' ';
    tag += spaces;
  }

  return chalk.magenta(tag);
};

var getTime = function getTime() {
  var time = new Date();
  var hours = (time.getHours().toString().length == 1) ? '0' + time.getHours() : time.getHours();
  var mins = (time.getMinutes().toString().length == 1) ? '0' + time.getMinutes() : time.getMinutes();
  var secs = (time.getSeconds().toString().length == 1) ? '0' + time.getSeconds() : time.getSeconds();
  return chalk.grey(hours + ':' + mins + ':' + secs);
};


KevoreeLogger.ALL = LEVELS.indexOf('all');
KevoreeLogger.INFO = LEVELS.indexOf('info');
KevoreeLogger.DEBUG = LEVELS.indexOf('debug');
KevoreeLogger.WARN = LEVELS.indexOf('warn');
KevoreeLogger.ERROR = LEVELS.indexOf('error');
KevoreeLogger.QUIET = LEVELS.indexOf('quiet');

module.exports = KevoreeLogger;

},{"chalk":6,"pseudoclass":9}],5:[function(require,module,exports){
var Class = require('pseudoclass'),
    KevoreeLogger = require('./KevoreeLogger');

/**
 * Resolver API
 * @type {Resolver}
 */
var Resolver = Class({
    toString: 'Resolver',

    construct: function (modulesPath, logger) {
        this.modulesPath = modulesPath || '';
        this.log = logger || new KevoreeLogger(this.toString());
        this.repositories = [];
    },

    /**
     *
     * @param deployUnit Kevoree DeployUnit
     * @param force [optional] boolean that indicates whether or not we should force re-installation no matter what
     * @param callback function(err, Class, model)
     */
    resolve: function (deployUnit, force, callback) {},

    uninstall: function (deployUnit, force, callback) {},

    addRepository: function (url) {
        if (this.repositories.indexOf(url) === -1) {
            this.repositories.push(url);
        }
    }
});

module.exports = Resolver;

},{"./KevoreeLogger":4,"pseudoclass":9}],6:[function(require,module,exports){
'use strict';
var ansi = require('ansi-styles');
var stripAnsi = require('strip-ansi');
var hasColor = require('has-color');
var defineProps = Object.defineProperties;
var chalk = module.exports;

var styles = (function () {
	var ret = {};

	ansi.grey = ansi.gray;

	Object.keys(ansi).forEach(function (key) {
		ret[key] = {
			get: function () {
				this._styles.push(key);
				return this;
			}
		};
	});

	return ret;
})();

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				var obj = defineProps(function self() {
					var str = [].slice.call(arguments).join(' ');

					if (!chalk.enabled) {
						return str;
					}

					return self._styles.reduce(function (str, name) {
						var code = ansi[name];
						return str ? code.open + str + code.close : '';
					}, str);
				}, styles);

				obj._styles = [];

				return obj[name];
			}
		}
	});

	return ret;
}

defineProps(chalk, init());

chalk.styles = ansi;
chalk.stripColor = stripAnsi;
chalk.supportsColor = hasColor;

// detect mode if not set manually
if (chalk.enabled === undefined) {
	chalk.enabled = chalk.supportsColor;
}

},{"ansi-styles":8,"has-color":7,"strip-ansi":11}],7:[function(require,module,exports){
(function (process){
'use strict';
module.exports = (function () {
	if (process.argv.indexOf('--no-color') !== -1) {
		return false;
	}

	if (process.argv.indexOf('--color') !== -1) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require('_process'))
},{"_process":10}],8:[function(require,module,exports){
'use strict';
var styles = module.exports;

var codes = {
	reset: [0, 0],

	bold: [1, 22],
	italic: [3, 23],
	underline: [4, 24],
	inverse: [7, 27],
	strikethrough: [9, 29],

	black: [30, 39],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	magenta: [35, 39],
	cyan: [36, 39],
	white: [37, 39],
	gray: [90, 39],

	bgBlack: [40, 49],
	bgRed: [41, 49],
	bgGreen: [42, 49],
	bgYellow: [43, 49],
	bgBlue: [44, 49],
	bgMagenta: [45, 49],
	bgCyan: [46, 49],
	bgWhite: [47, 49]
};

Object.keys(codes).forEach(function (key) {
	var val = codes[key];
	var style = styles[key] = {};
	style.open = '\x1b[' + val[0] + 'm';
	style.close = '\x1b[' + val[1] + 'm';
});

},{}],9:[function(require,module,exports){
/*
	PseudoClass - JavaScript inheritance

	Construction:
		Setup and construction should happen in the construct() method.
		The construct() method is automatically chained, so all construct() methods defined by superclass methods will be called first.

	Initialization:
		Initialziation that needs to happen after all construct() methods have been called should be done in the init() method.
		The init() method is not automatically chained, so you must call this._super() if you intend to call the superclass' init method.
		init() is not passed any arguments

	Destruction:
		Teardown and destruction should happen in the destruct() method. The destruct() method is also chained.

	Mixins:
		An array of mixins can be provided with the mixins[] property. An object or the prototype of a class should be provided, not a constructor.
		Mixins can be added at any time by calling this.mixin(properties)

	Usage:
		var MyClass = Class(properties);
		var MyClass = new Class(properties);
		var MyClass = Class.extend(properties);

	Credits:
		Inspired by Simple JavaScript Inheritance by John Resig http://ejohn.org/

	Usage differences:
		construct() is used to setup instances and is chained so superclass construct() methods run automatically
		destruct() is used to tear down instances. destruct() is also chained
		init(), if defined, is called after construction is complete and is not chained
		toString() can be defined as a string or a function
		mixin() is provided to mix properties into an instance
		properties.mixins as an array results in each of the provided objects being mixed in (last object wins)
		this._super() is supported in mixins
		properties, if defined, should be a hash of property descriptors as accepted by Object.defineProperties
*/
(function(global) {
	// Extend the current context by the passed objects
	function extendThis() {
		var i, ni, objects, object, prop;
		objects = arguments;
		for (i = 0, ni = objects.length; i < ni; i++) {
			object = objects[i];
			for (prop in object) {
				this[prop] = object[prop];
			}
		}

		return this;
	}

	// Return a function that calls the specified method, passing arguments
	function makeApplier(method) {
		return function() {
			return this[method].apply(this, arguments);
		};
	}

	// Merge and define properties
	function defineAndInheritProperties(Component, properties) {
		var constructor,
			descriptor,
			property,
			propertyDescriptors,
			propertyDescriptorHash,
			propertyDescriptorQueue;

		// Set properties
		Component.properties = properties;

		// Traverse the chain of constructors and gather all property descriptors
		// Build a queue of property descriptors for combination
		propertyDescriptorHash = {};
		constructor = Component;
		do {
			if (constructor.properties) {
				for (property in constructor.properties) {
					propertyDescriptorQueue = propertyDescriptorHash[property] || (propertyDescriptorHash[property] = []);
					propertyDescriptorQueue.unshift(constructor.properties[property]);
				}
			}
			constructor = constructor.superConstructor;
		}
		while (constructor);

		// Combine property descriptors, allowing overriding of individual properties
		propertyDescriptors = {};
		for (property in propertyDescriptorHash) {
			descriptor = propertyDescriptors[property] = extendThis.apply({}, propertyDescriptorHash[property]);

			// Allow setters to be strings
			// An additional wrapping function is used to allow monkey-patching
			// apply is used to handle cases where the setter is called directly
			if (typeof descriptor.set === 'string') {
				descriptor.set = makeApplier(descriptor.set);
			}
			if (typeof descriptor.get === 'string') {
				descriptor.get = makeApplier(descriptor.get);
			}
		}

		// Store option descriptors on the constructor
		Component.properties = propertyDescriptors;
	}

	// Used for default initialization methods
	var noop = function() {};

	// Given a function, the superTest RE will match if _super is used in the function
	// The function will be serialized, then the serialized string will be searched for _super
	// If the environment isn't capable of function serialization, make it so superTest.test always returns true
	var superTest = /xyz/.test(function(){return 'xyz';}) ? /\._super\b/ : { test: function() { return true; } };

	// Bind an overriding method such that it gets the overridden method as its first argument
	var superifyDynamic = function(name, func, superPrototype) {
		return function PseudoClass_setStaticSuper() {
			// Store the old super
			var previousSuper = this._super;

			// Use the method from the superclass' prototype
			// This strategy allows monkey patching (modification of superclass prototypes)
			this._super = superPrototype[name];

			// Call the actual function
			var ret = func.apply(this, arguments);

			// Restore the previous value of super
			// This is required so that calls to methods that use _super within methods that use _super work
			this._super = previousSuper;

			return ret;
		};
	};

	var superifyStatic = function(name, func, object) {
		// Store a reference to the overridden function
		var _super = object[name];

		return function PseudoClass_setDynamicSuper() {
			// Use the method stored at declaration time
			this._super = _super;

			// Call the actual function
			return func.apply(this, arguments);
		};
	};

	// Mix the provided properties into the current context with the ability to call overridden methods with _super()
	var mixin = function(properties, superPrototype) {
		// Use this instance's prototype if no prototype provided
		superPrototype = superPrototype || this.constructor && this.constructor.prototype;
		
		// Copy the properties onto the new prototype
		for (var name in properties) {
			var value = properties[name];

			// Never mix construct or destruct
			if (name === 'construct' || name === 'destruct')
				continue;

			// Check if the property if a method that makes use of _super:
			// 1. The value should be a function
			// 2. The super prototype should have a function by the same name
			// 3. The function should use this._super somewhere
			var usesSuper = superPrototype && typeof value === 'function' && typeof superPrototype[name] === 'function' && superTest.test(value);

			if (usesSuper) {
				// Wrap the function such that this._super will be available
				if (this.hasOwnProperty(name)) {
					// Properties that exist directly on the object should be superified statically
					this[name] = superifyStatic(name, value, this);
				}
				else {
					// Properties that are part of the superPrototype should be superified dynamically
					this[name] = superifyDynamic(name, value, superPrototype);
				}
			}
			else {
				// Directly assign the property
				this[name] = value;
			}
		}
	};

	// The base Class implementation acts as extend alias, with the exception that it can take properties.extend as the Class to extend
	var PseudoClass = function(properties) {
		// If a class-like object is passed as properties.extend, just call extend on it
		if (properties && properties.extend)
			return properties.extend.extend(properties);

		// Otherwise, just create a new class with the passed properties
		return PseudoClass.extend(properties);
	};
	
	// Add the mixin method to all classes created with PseudoClass
	PseudoClass.prototype.mixin = mixin;
	
	// Creates a new PseudoClass that inherits from this class
	// Give the function a name so it can refer to itself without arguments.callee
	PseudoClass.extend = function extend(properties) {
		// The constructor handles creating an instance of the class, applying mixins, and calling construct() and init() methods
		function PseudoClass() {
			// Optimization: Requiring the new keyword and avoiding usage of Object.create() increases performance by 5x
			if (this instanceof PseudoClass === false) {
				throw new Error('Cannot create instance without new operator');
			}

			// Set properties
			var propertyDescriptors = PseudoClass.properties;
			if (propertyDescriptors) {
				Object.defineProperties(this, propertyDescriptors);
			}

			// Optimization: Avoiding conditionals in constructor increases performance of instantiation by 2x
			this.construct.apply(this, arguments);

			this.init();
		}

		var superConstructor = this;
		var superPrototype = this.prototype;

		// Store the superConstructor
		// It will be accessible on an instance as follows:
		//	instance.constructor.superConstructor
		PseudoClass.superConstructor = superConstructor;

		// Add extend() as a static method on the constructor
		PseudoClass.extend = extend;

		// Create an object with the prototype of the superclass
		// Store the extended class' prototype as the prototype of the constructor
		var prototype = PseudoClass.prototype = Object.create(superPrototype);

		// Assign prototype.constructor to the constructor itself
		// This allows instances to refer to this.constructor.prototype
		// This also allows creation of new instances using instance.constructor()
		prototype.constructor = PseudoClass;

		// Store the superPrototype
		// It will be accessible on an instance as follows:
		//	instance.superPrototype
		//	instance.constructor.prototype.superPrototype
		prototype.superPrototype = superPrototype;

		if (properties) {
			// Set property descriptors aside
			// We'll first inherit methods, then we'll apply these
			var propertyDescriptors = properties.properties;
			delete properties.properties;

			// Mix the new properties into the class prototype
			// This does not copy construct and destruct
			mixin.call(prototype, properties, superPrototype);

			// Mix in all the mixins
			// This also does not copy construct and destruct
			if (Array.isArray(properties.mixins)) {
				for (var i = 0, ni = properties.mixins.length; i < ni; i++) {
					// Mixins should be _super enabled, with the methods defined in the prototype as the superclass methods
					mixin.call(prototype, properties.mixins[i], prototype);
				}
			}

			// Define properties from this class and its parent classes
			defineAndInheritProperties(PseudoClass, propertyDescriptors);

			// Chain the construct() method (supermost executes first) if necessary
			if (properties.construct) {
				var construct = properties.construct;
				if (superPrototype.construct) {
					prototype.construct = function() {
						superPrototype.construct.apply(this, arguments);
						construct.apply(this, arguments);
					};
				}
				else {
					prototype.construct = construct;
				}
			}
			
			// Chain the destruct() method in reverse order (supermost executes last) if necessary
			if (properties.destruct) {
				var destruct = properties.destruct;
				if (superPrototype.destruct) {
					prototype.destruct = function() {
						destruct.apply(this, arguments);
						superPrototype.destruct.apply(this, arguments);
					};
				}
				else {
					prototype.destruct = destruct;
				}
			}

			// Allow definition of toString as a string (turn it into a function)
			if (typeof properties.toString === 'string') {
				var className = properties.toString;
				prototype.toString = function() { return className; };
			}
		}

		// Define construct and init as noops if undefined
		// This serves to avoid conditionals inside of the constructor
		if (typeof prototype.construct !== 'function')
			prototype.construct = noop;
		if (typeof prototype.init !== 'function')
			prototype.init = noop;

		return PseudoClass;
	};
	
	if (typeof module !== 'undefined' && module.exports) {
		// Node.js Support
		module.exports = PseudoClass;
	}
	else if (typeof global.define === 'function') {
		(function(define) {
			// AMD Support
			define(function() { return PseudoClass; });
		}(global.define));
	}
	else {
		// Browser support
		global.PseudoClass = PseudoClass;

		// Don't blow away existing Class variable
		if (!global.Class) {
			global.Class = PseudoClass;
		}
	}
}(this));

},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],11:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	return typeof str === 'string' ? str.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '') : str;
};

},{}]},{},[1])(1)
});