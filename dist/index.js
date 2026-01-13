import require$$1 from 'tty';
import require$$1$1, { promisify, callbackify } from 'util';
import require$$0 from 'os';
import { webcrypto } from 'crypto';
import { createRequire } from 'module';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src = {exports: {}};

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/* eslint-env browser */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug');
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

var hasFlag;
var hasRequiredHasFlag;

function requireHasFlag () {
	if (hasRequiredHasFlag) return hasFlag;
	hasRequiredHasFlag = 1;

	hasFlag = (flag, argv = process.argv) => {
		const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf('--');
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
	return hasFlag;
}

var supportsColor_1;
var hasRequiredSupportsColor;

function requireSupportsColor () {
	if (hasRequiredSupportsColor) return supportsColor_1;
	hasRequiredSupportsColor = 1;
	const os = require$$0;
	const tty = require$$1;
	const hasFlag = requireHasFlag();

	const {env} = process;

	let flagForceColor;
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false') ||
		hasFlag('color=never')) {
		flagForceColor = 0;
	} else if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		flagForceColor = 1;
	}

	function envForceColor() {
		if ('FORCE_COLOR' in env) {
			if (env.FORCE_COLOR === 'true') {
				return 1;
			}

			if (env.FORCE_COLOR === 'false') {
				return 0;
			}

			return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
		}
	}

	function translateLevel(level) {
		if (level === 0) {
			return false;
		}

		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}

	function supportsColor(haveStream, {streamIsTTY, sniffFlags = true} = {}) {
		const noFlagForceColor = envForceColor();
		if (noFlagForceColor !== undefined) {
			flagForceColor = noFlagForceColor;
		}

		const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

		if (forceColor === 0) {
			return 0;
		}

		if (sniffFlags) {
			if (hasFlag('color=16m') ||
				hasFlag('color=full') ||
				hasFlag('color=truecolor')) {
				return 3;
			}

			if (hasFlag('color=256')) {
				return 2;
			}
		}

		if (haveStream && !streamIsTTY && forceColor === undefined) {
			return 0;
		}

		const min = forceColor || 0;

		if (env.TERM === 'dumb') {
			return min;
		}

		if (process.platform === 'win32') {
			// Windows 10 build 10586 is the first Windows release that supports 256 colors.
			// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
			const osRelease = os.release().split('.');
			if (
				Number(osRelease[0]) >= 10 &&
				Number(osRelease[2]) >= 10586
			) {
				return Number(osRelease[2]) >= 14931 ? 3 : 2;
			}

			return 1;
		}

		if ('CI' in env) {
			if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE', 'DRONE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
				return 1;
			}

			return min;
		}

		if ('TEAMCITY_VERSION' in env) {
			return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		}

		if (env.COLORTERM === 'truecolor') {
			return 3;
		}

		if ('TERM_PROGRAM' in env) {
			const version = Number.parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

			switch (env.TERM_PROGRAM) {
				case 'iTerm.app':
					return version >= 3 ? 3 : 2;
				case 'Apple_Terminal':
					return 2;
				// No default
			}
		}

		if (/-256(color)?$/i.test(env.TERM)) {
			return 2;
		}

		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
			return 1;
		}

		if ('COLORTERM' in env) {
			return 1;
		}

		return min;
	}

	function getSupportLevel(stream, options = {}) {
		const level = supportsColor(stream, {
			streamIsTTY: stream && stream.isTTY,
			...options
		});

		return translateLevel(level);
	}

	supportsColor_1 = {
		supportsColor: getSupportLevel,
		stdout: getSupportLevel({isTTY: tty.isatty(1)}),
		stderr: getSupportLevel({isTTY: tty.isatty(2)})
	};
	return supportsColor_1;
}

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$1;
		const util = require$$1$1;

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = requireSupportsColor();

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.format(...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		}; 
	} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src.exports;
	hasRequiredSrc = 1;
	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		src.exports = requireBrowser();
	} else {
		src.exports = requireNode();
	}
	return src.exports;
}

var srcExports = requireSrc();
var createDebug = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

const encoder = new TextEncoder();
const decoder = new TextDecoder();
function concat(...buffers) {
    const size = buffers.reduce((acc, { length }) => acc + length, 0);
    const buf = new Uint8Array(size);
    let i = 0;
    for (const buffer of buffers) {
        buf.set(buffer, i);
        i += buffer.length;
    }
    return buf;
}

function encodeBase64(input) {
    if (Uint8Array.prototype.toBase64) {
        return input.toBase64();
    }
    const CHUNK_SIZE = 0x8000;
    const arr = [];
    for (let i = 0; i < input.length; i += CHUNK_SIZE) {
        arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(''));
}
function decodeBase64(encoded) {
    if (Uint8Array.fromBase64) {
        return Uint8Array.fromBase64(encoded);
    }
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function decode(input) {
    if (Uint8Array.fromBase64) {
        return Uint8Array.fromBase64(typeof input === 'string' ? input : decoder.decode(input), {
            alphabet: 'base64url',
        });
    }
    let encoded = input;
    if (encoded instanceof Uint8Array) {
        encoded = decoder.decode(encoded);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    try {
        return decodeBase64(encoded);
    }
    catch {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
}

class JOSEError extends Error {
    static code = 'ERR_JOSE_GENERIC';
    code = 'ERR_JOSE_GENERIC';
    constructor(message, options) {
        super(message, options);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
class JWTClaimValidationFailed extends JOSEError {
    static code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    claim;
    reason;
    payload;
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified') {
        super(message, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
class JWTExpired extends JOSEError {
    static code = 'ERR_JWT_EXPIRED';
    code = 'ERR_JWT_EXPIRED';
    claim;
    reason;
    payload;
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified') {
        super(message, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
class JOSEAlgNotAllowed extends JOSEError {
    static code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    code = 'ERR_JOSE_ALG_NOT_ALLOWED';
}
class JOSENotSupported extends JOSEError {
    static code = 'ERR_JOSE_NOT_SUPPORTED';
    code = 'ERR_JOSE_NOT_SUPPORTED';
}
class JWSInvalid extends JOSEError {
    static code = 'ERR_JWS_INVALID';
    code = 'ERR_JWS_INVALID';
}
class JWTInvalid extends JOSEError {
    static code = 'ERR_JWT_INVALID';
    code = 'ERR_JWT_INVALID';
}
class JWSSignatureVerificationFailed extends JOSEError {
    static code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    constructor(message = 'signature verification failed', options) {
        super(message, options);
    }
}

function unusable(name, prop = 'algorithm.name') {
    return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
    return algorithm.name === name;
}
function getHashLength(hash) {
    return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
    switch (alg) {
        case 'ES256':
            return 'P-256';
        case 'ES384':
            return 'P-384';
        case 'ES512':
            return 'P-521';
        default:
            throw new Error('unreachable');
    }
}
function checkUsage(key, usage) {
    if (!key.usages.includes(usage)) {
        throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
    }
}
function checkSigCryptoKey(key, alg, usage) {
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512': {
            if (!isAlgorithm(key.algorithm, 'HMAC'))
                throw unusable('HMAC');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'RS256':
        case 'RS384':
        case 'RS512': {
            if (!isAlgorithm(key.algorithm, 'RSASSA-PKCS1-v1_5'))
                throw unusable('RSASSA-PKCS1-v1_5');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'PS256':
        case 'PS384':
        case 'PS512': {
            if (!isAlgorithm(key.algorithm, 'RSA-PSS'))
                throw unusable('RSA-PSS');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'Ed25519':
        case 'EdDSA': {
            if (!isAlgorithm(key.algorithm, 'Ed25519'))
                throw unusable('Ed25519');
            break;
        }
        case 'ML-DSA-44':
        case 'ML-DSA-65':
        case 'ML-DSA-87': {
            if (!isAlgorithm(key.algorithm, alg))
                throw unusable(alg);
            break;
        }
        case 'ES256':
        case 'ES384':
        case 'ES512': {
            if (!isAlgorithm(key.algorithm, 'ECDSA'))
                throw unusable('ECDSA');
            const expected = getNamedCurve(alg);
            const actual = key.algorithm.namedCurve;
            if (actual !== expected)
                throw unusable(expected, 'algorithm.namedCurve');
            break;
        }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usage);
}

function message(msg, actual, ...types) {
    types = types.filter(Boolean);
    if (types.length > 2) {
        const last = types.pop();
        msg += `one of type ${types.join(', ')}, or ${last}.`;
    }
    else if (types.length === 2) {
        msg += `one of type ${types[0]} or ${types[1]}.`;
    }
    else {
        msg += `of type ${types[0]}.`;
    }
    if (actual == null) {
        msg += ` Received ${actual}`;
    }
    else if (typeof actual === 'function' && actual.name) {
        msg += ` Received function ${actual.name}`;
    }
    else if (typeof actual === 'object' && actual != null) {
        if (actual.constructor?.name) {
            msg += ` Received an instance of ${actual.constructor.name}`;
        }
    }
    return msg;
}
var invalidKeyInput = (actual, ...types) => {
    return message('Key must be ', actual, ...types);
};
function withAlg(alg, actual, ...types) {
    return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}

function isCryptoKey(key) {
    return key?.[Symbol.toStringTag] === 'CryptoKey';
}
function isKeyObject(key) {
    return key?.[Symbol.toStringTag] === 'KeyObject';
}
var isKeyLike = (key) => {
    return isCryptoKey(key) || isKeyObject(key);
};

var isDisjoint = (...headers) => {
    const sources = headers.filter(Boolean);
    if (sources.length === 0 || sources.length === 1) {
        return true;
    }
    let acc;
    for (const header of sources) {
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
            acc = new Set(parameters);
            continue;
        }
        for (const parameter of parameters) {
            if (acc.has(parameter)) {
                return false;
            }
            acc.add(parameter);
        }
    }
    return true;
};

function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
var isObject = (input) => {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(input) === null) {
        return true;
    }
    let proto = input;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(input) === proto;
};

var checkKeyLength = (alg, key) => {
    if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== 'number' || modulusLength < 2048) {
            throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
    }
};

const formatPEM = (b64, descriptor) => {
    const newlined = (b64.match(/.{1,64}/g) || []).join('\n');
    return `-----BEGIN ${descriptor}-----\n${newlined}\n-----END ${descriptor}-----`;
};
const genericExport = async (keyType, keyFormat, key) => {
    if (isKeyObject(key)) {
        if (key.type !== keyType) {
            throw new TypeError(`key is not a ${keyType} key`);
        }
        return key.export({ format: 'pem', type: keyFormat });
    }
    if (!isCryptoKey(key)) {
        throw new TypeError(invalidKeyInput(key, 'CryptoKey', 'KeyObject'));
    }
    if (!key.extractable) {
        throw new TypeError('CryptoKey is not extractable');
    }
    if (key.type !== keyType) {
        throw new TypeError(`key is not a ${keyType} key`);
    }
    return formatPEM(encodeBase64(new Uint8Array(await crypto.subtle.exportKey(keyFormat, key))), `${keyType.toUpperCase()} KEY`);
};
const toSPKI = (key) => {
    return genericExport('public', 'spki', key);
};
const bytesEqual = (a, b) => {
    if (a.byteLength !== b.length)
        return false;
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
};
const createASN1State = (data) => ({ data, pos: 0 });
const parseLength = (state) => {
    const first = state.data[state.pos++];
    if (first & 0x80) {
        const lengthOfLen = first & 0x7f;
        let length = 0;
        for (let i = 0; i < lengthOfLen; i++) {
            length = (length << 8) | state.data[state.pos++];
        }
        return length;
    }
    return first;
};
const expectTag = (state, expectedTag, errorMessage) => {
    if (state.data[state.pos++] !== expectedTag) {
        throw new Error(errorMessage);
    }
};
const getSubarray = (state, length) => {
    const result = state.data.subarray(state.pos, state.pos + length);
    state.pos += length;
    return result;
};
const parseAlgorithmOID = (state) => {
    expectTag(state, 0x06, 'Expected algorithm OID');
    const oidLen = parseLength(state);
    return getSubarray(state, oidLen);
};
function parseSPKIHeader(state) {
    expectTag(state, 0x30, 'Invalid SPKI structure');
    parseLength(state);
    expectTag(state, 0x30, 'Expected algorithm identifier');
    const algIdLen = parseLength(state);
    const algIdStart = state.pos;
    return { algIdStart, algIdLength: algIdLen };
}
const parseECAlgorithmIdentifier = (state) => {
    const algOid = parseAlgorithmOID(state);
    if (bytesEqual(algOid, [0x2b, 0x65, 0x6e])) {
        return 'X25519';
    }
    if (!bytesEqual(algOid, [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01])) {
        throw new Error('Unsupported key algorithm');
    }
    expectTag(state, 0x06, 'Expected curve OID');
    const curveOidLen = parseLength(state);
    const curveOid = getSubarray(state, curveOidLen);
    for (const { name, oid } of [
        { name: 'P-256', oid: [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07] },
        { name: 'P-384', oid: [0x2b, 0x81, 0x04, 0x00, 0x22] },
        { name: 'P-521', oid: [0x2b, 0x81, 0x04, 0x00, 0x23] },
    ]) {
        if (bytesEqual(curveOid, oid)) {
            return name;
        }
    }
    throw new Error('Unsupported named curve');
};
const genericImport = async (keyFormat, keyData, alg, options) => {
    let algorithm;
    let keyUsages;
    const getSigUsages = () => (['verify'] );
    const getEncUsages = () => ['encrypt', 'wrapKey'] ;
    switch (alg) {
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = { name: 'RSA-PSS', hash: `SHA-${alg.slice(-3)}` };
            keyUsages = getSigUsages();
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${alg.slice(-3)}` };
            keyUsages = getSigUsages();
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            algorithm = {
                name: 'RSA-OAEP',
                hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`,
            };
            keyUsages = getEncUsages();
            break;
        case 'ES256':
        case 'ES384':
        case 'ES512': {
            const curveMap = { ES256: 'P-256', ES384: 'P-384', ES512: 'P-521' };
            algorithm = { name: 'ECDSA', namedCurve: curveMap[alg] };
            keyUsages = getSigUsages();
            break;
        }
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            try {
                const namedCurve = options.getNamedCurve(keyData);
                algorithm = namedCurve === 'X25519' ? { name: 'X25519' } : { name: 'ECDH', namedCurve };
            }
            catch (cause) {
                throw new JOSENotSupported('Invalid or unsupported key format');
            }
            keyUsages = [] ;
            break;
        }
        case 'Ed25519':
        case 'EdDSA':
            algorithm = { name: 'Ed25519' };
            keyUsages = getSigUsages();
            break;
        case 'ML-DSA-44':
        case 'ML-DSA-65':
        case 'ML-DSA-87':
            algorithm = { name: alg };
            keyUsages = getSigUsages();
            break;
        default:
            throw new JOSENotSupported('Invalid or unsupported "alg" (Algorithm) value');
    }
    return crypto.subtle.importKey(keyFormat, keyData, algorithm, options?.extractable ?? (true ), keyUsages);
};
const processPEMData = (pem, pattern) => {
    return decodeBase64(pem.replace(pattern, ''));
};
const fromSPKI = (pem, alg, options) => {
    const keyData = processPEMData(pem, /(?:-----(?:BEGIN|END) PUBLIC KEY-----|\s)/g);
    let opts = options;
    if (alg?.startsWith?.('ECDH-ES')) {
        opts ||= {};
        opts.getNamedCurve = (keyData) => {
            const state = createASN1State(keyData);
            parseSPKIHeader(state);
            return parseECAlgorithmIdentifier(state);
        };
    }
    return genericImport('spki', keyData, alg, opts);
};

function subtleMapping(jwk) {
    let algorithm;
    let keyUsages;
    switch (jwk.kty) {
        case 'AKP': {
            switch (jwk.alg) {
                case 'ML-DSA-44':
                case 'ML-DSA-65':
                case 'ML-DSA-87':
                    algorithm = { name: jwk.alg };
                    keyUsages = jwk.priv ? ['sign'] : ['verify'];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'RSA': {
            switch (jwk.alg) {
                case 'PS256':
                case 'PS384':
                case 'PS512':
                    algorithm = { name: 'RSA-PSS', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'RS256':
                case 'RS384':
                case 'RS512':
                    algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'RSA-OAEP':
                case 'RSA-OAEP-256':
                case 'RSA-OAEP-384':
                case 'RSA-OAEP-512':
                    algorithm = {
                        name: 'RSA-OAEP',
                        hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`,
                    };
                    keyUsages = jwk.d ? ['decrypt', 'unwrapKey'] : ['encrypt', 'wrapKey'];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'EC': {
            switch (jwk.alg) {
                case 'ES256':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ES384':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-384' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ES512':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-521' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ECDH-ES':
                case 'ECDH-ES+A128KW':
                case 'ECDH-ES+A192KW':
                case 'ECDH-ES+A256KW':
                    algorithm = { name: 'ECDH', namedCurve: jwk.crv };
                    keyUsages = jwk.d ? ['deriveBits'] : [];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'OKP': {
            switch (jwk.alg) {
                case 'Ed25519':
                case 'EdDSA':
                    algorithm = { name: 'Ed25519' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ECDH-ES':
                case 'ECDH-ES+A128KW':
                case 'ECDH-ES+A192KW':
                case 'ECDH-ES+A256KW':
                    algorithm = { name: jwk.crv };
                    keyUsages = jwk.d ? ['deriveBits'] : [];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        default:
            throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
    }
    return { algorithm, keyUsages };
}
var importJWK$1 = async (jwk) => {
    if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
    }
    const { algorithm, keyUsages } = subtleMapping(jwk);
    const keyData = { ...jwk };
    if (keyData.kty !== 'AKP') {
        delete keyData.alg;
    }
    delete keyData.use;
    return crypto.subtle.importKey('jwk', keyData, algorithm, jwk.ext ?? (jwk.d || jwk.priv ? false : true), jwk.key_ops ?? keyUsages);
};

async function importSPKI(spki, alg, options) {
    if (typeof spki !== 'string' || spki.indexOf('-----BEGIN PUBLIC KEY-----') !== 0) {
        throw new TypeError('"spki" must be SPKI formatted string');
    }
    return fromSPKI(spki, alg, options);
}
async function importJWK(jwk, alg, options) {
    if (!isObject(jwk)) {
        throw new TypeError('JWK must be an object');
    }
    let ext;
    alg ??= jwk.alg;
    ext ??= jwk.ext;
    switch (jwk.kty) {
        case 'oct':
            if (typeof jwk.k !== 'string' || !jwk.k) {
                throw new TypeError('missing "k" (Key Value) Parameter value');
            }
            return decode(jwk.k);
        case 'RSA':
            if ('oth' in jwk && jwk.oth !== undefined) {
                throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            }
            return importJWK$1({ ...jwk, alg, ext });
        case 'AKP': {
            if (typeof jwk.alg !== 'string' || !jwk.alg) {
                throw new TypeError('missing "alg" (Algorithm) Parameter value');
            }
            if (alg !== undefined && alg !== jwk.alg) {
                throw new TypeError('JWK alg and alg option value mismatch');
            }
            return importJWK$1({ ...jwk, ext });
        }
        case 'EC':
        case 'OKP':
            return importJWK$1({ ...jwk, alg, ext });
        default:
            throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
    }
}

var validateCrit = (Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) => {
    if (joseHeader.crit !== undefined && protectedHeader?.crit === undefined) {
        throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === undefined) {
        return new Set();
    }
    if (!Array.isArray(protectedHeader.crit) ||
        protectedHeader.crit.length === 0 ||
        protectedHeader.crit.some((input) => typeof input !== 'string' || input.length === 0)) {
        throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== undefined) {
        recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
    }
    else {
        recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit) {
        if (!recognized.has(parameter)) {
            throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
        }
        if (joseHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" is missing`);
        }
        if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
        }
    }
    return new Set(protectedHeader.crit);
};

var validateAlgorithms = (option, algorithms) => {
    if (algorithms !== undefined &&
        (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== 'string'))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
    }
    if (!algorithms) {
        return undefined;
    }
    return new Set(algorithms);
};

function isJWK(key) {
    return isObject(key) && typeof key.kty === 'string';
}
function isPrivateJWK(key) {
    return (key.kty !== 'oct' &&
        ((key.kty === 'AKP' && typeof key.priv === 'string') || typeof key.d === 'string'));
}
function isPublicJWK(key) {
    return key.kty !== 'oct' && typeof key.d === 'undefined' && typeof key.priv === 'undefined';
}
function isSecretJWK(key) {
    return key.kty === 'oct' && typeof key.k === 'string';
}

let cache;
const handleJWK = async (key, jwk, alg, freeze = false) => {
    cache ||= new WeakMap();
    let cached = cache.get(key);
    if (cached?.[alg]) {
        return cached[alg];
    }
    const cryptoKey = await importJWK$1({ ...jwk, alg });
    if (freeze)
        Object.freeze(key);
    if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
    }
    else {
        cached[alg] = cryptoKey;
    }
    return cryptoKey;
};
const handleKeyObject = (keyObject, alg) => {
    cache ||= new WeakMap();
    let cached = cache.get(keyObject);
    if (cached?.[alg]) {
        return cached[alg];
    }
    const isPublic = keyObject.type === 'public';
    const extractable = isPublic ? true : false;
    let cryptoKey;
    if (keyObject.asymmetricKeyType === 'x25519') {
        switch (alg) {
            case 'ECDH-ES':
            case 'ECDH-ES+A128KW':
            case 'ECDH-ES+A192KW':
            case 'ECDH-ES+A256KW':
                break;
            default:
                throw new TypeError('given KeyObject instance cannot be used for this algorithm');
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ['deriveBits']);
    }
    if (keyObject.asymmetricKeyType === 'ed25519') {
        if (alg !== 'EdDSA' && alg !== 'Ed25519') {
            throw new TypeError('given KeyObject instance cannot be used for this algorithm');
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
            isPublic ? 'verify' : 'sign',
        ]);
    }
    switch (keyObject.asymmetricKeyType) {
        case 'ml-dsa-44':
        case 'ml-dsa-65':
        case 'ml-dsa-87': {
            if (alg !== keyObject.asymmetricKeyType.toUpperCase()) {
                throw new TypeError('given KeyObject instance cannot be used for this algorithm');
            }
            cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
                isPublic ? 'verify' : 'sign',
            ]);
        }
    }
    if (keyObject.asymmetricKeyType === 'rsa') {
        let hash;
        switch (alg) {
            case 'RSA-OAEP':
                hash = 'SHA-1';
                break;
            case 'RS256':
            case 'PS256':
            case 'RSA-OAEP-256':
                hash = 'SHA-256';
                break;
            case 'RS384':
            case 'PS384':
            case 'RSA-OAEP-384':
                hash = 'SHA-384';
                break;
            case 'RS512':
            case 'PS512':
            case 'RSA-OAEP-512':
                hash = 'SHA-512';
                break;
            default:
                throw new TypeError('given KeyObject instance cannot be used for this algorithm');
        }
        if (alg.startsWith('RSA-OAEP')) {
            return keyObject.toCryptoKey({
                name: 'RSA-OAEP',
                hash,
            }, extractable, isPublic ? ['encrypt'] : ['decrypt']);
        }
        cryptoKey = keyObject.toCryptoKey({
            name: alg.startsWith('PS') ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
            hash,
        }, extractable, [isPublic ? 'verify' : 'sign']);
    }
    if (keyObject.asymmetricKeyType === 'ec') {
        const nist = new Map([
            ['prime256v1', 'P-256'],
            ['secp384r1', 'P-384'],
            ['secp521r1', 'P-521'],
        ]);
        const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
        if (!namedCurve) {
            throw new TypeError('given KeyObject instance cannot be used for this algorithm');
        }
        if (alg === 'ES256' && namedCurve === 'P-256') {
            cryptoKey = keyObject.toCryptoKey({
                name: 'ECDSA',
                namedCurve,
            }, extractable, [isPublic ? 'verify' : 'sign']);
        }
        if (alg === 'ES384' && namedCurve === 'P-384') {
            cryptoKey = keyObject.toCryptoKey({
                name: 'ECDSA',
                namedCurve,
            }, extractable, [isPublic ? 'verify' : 'sign']);
        }
        if (alg === 'ES512' && namedCurve === 'P-521') {
            cryptoKey = keyObject.toCryptoKey({
                name: 'ECDSA',
                namedCurve,
            }, extractable, [isPublic ? 'verify' : 'sign']);
        }
        if (alg.startsWith('ECDH-ES')) {
            cryptoKey = keyObject.toCryptoKey({
                name: 'ECDH',
                namedCurve,
            }, extractable, isPublic ? [] : ['deriveBits']);
        }
    }
    if (!cryptoKey) {
        throw new TypeError('given KeyObject instance cannot be used for this algorithm');
    }
    if (!cached) {
        cache.set(keyObject, { [alg]: cryptoKey });
    }
    else {
        cached[alg] = cryptoKey;
    }
    return cryptoKey;
};
var normalizeKey = async (key, alg) => {
    if (key instanceof Uint8Array) {
        return key;
    }
    if (isCryptoKey(key)) {
        return key;
    }
    if (isKeyObject(key)) {
        if (key.type === 'secret') {
            return key.export();
        }
        if ('toCryptoKey' in key && typeof key.toCryptoKey === 'function') {
            try {
                return handleKeyObject(key, alg);
            }
            catch (err) {
                if (err instanceof TypeError) {
                    throw err;
                }
            }
        }
        let jwk = key.export({ format: 'jwk' });
        return handleJWK(key, jwk, alg);
    }
    if (isJWK(key)) {
        if (key.k) {
            return decode(key.k);
        }
        return handleJWK(key, key, alg, true);
    }
    throw new Error('unreachable');
};

const tag = (key) => key?.[Symbol.toStringTag];
const jwkMatchesOp = (alg, key, usage) => {
    if (key.use !== undefined) {
        let expected;
        switch (usage) {
            case 'sign':
            case 'verify':
                expected = 'sig';
                break;
            case 'encrypt':
            case 'decrypt':
                expected = 'enc';
                break;
        }
        if (key.use !== expected) {
            throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
        }
    }
    if (key.alg !== undefined && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
    }
    if (Array.isArray(key.key_ops)) {
        let expectedKeyOp;
        switch (true) {
            case usage === 'verify':
            case alg === 'dir':
            case alg.includes('CBC-HS'):
                expectedKeyOp = usage;
                break;
            case alg.startsWith('PBES2'):
                expectedKeyOp = 'deriveBits';
                break;
            case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
                if (!alg.includes('GCM') && alg.endsWith('KW')) {
                    expectedKeyOp = 'unwrapKey';
                }
                else {
                    expectedKeyOp = usage;
                }
                break;
            case usage === 'encrypt':
                expectedKeyOp = 'wrapKey';
                break;
            case usage === 'decrypt':
                expectedKeyOp = alg.startsWith('RSA') ? 'unwrapKey' : 'deriveBits';
                break;
        }
        if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
            throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
        }
    }
    return true;
};
const symmetricTypeCheck = (alg, key, usage) => {
    if (key instanceof Uint8Array)
        return;
    if (isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
            return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
    }
    if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, 'CryptoKey', 'KeyObject', 'JSON Web Key', 'Uint8Array'));
    }
    if (key.type !== 'secret') {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
    }
};
const asymmetricTypeCheck = (alg, key, usage) => {
    if (isJWK(key)) {
        switch (usage) {
            case 'decrypt':
            case 'sign':
                if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
                    return;
                throw new TypeError(`JSON Web Key for this operation be a private JWK`);
            case 'encrypt':
            case 'verify':
                if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
                    return;
                throw new TypeError(`JSON Web Key for this operation be a public JWK`);
        }
    }
    if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, 'CryptoKey', 'KeyObject', 'JSON Web Key'));
    }
    if (key.type === 'secret') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
    }
    if (key.type === 'public') {
        switch (usage) {
            case 'sign':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
            case 'decrypt':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
    }
    if (key.type === 'private') {
        switch (usage) {
            case 'verify':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
            case 'encrypt':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
    }
};
var checkKeyType = (alg, key, usage) => {
    const symmetric = alg.startsWith('HS') ||
        alg === 'dir' ||
        alg.startsWith('PBES2') ||
        /^A(?:128|192|256)(?:GCM)?(?:KW)?$/.test(alg) ||
        /^A(?:128|192|256)CBC-HS(?:256|384|512)$/.test(alg);
    if (symmetric) {
        symmetricTypeCheck(alg, key, usage);
    }
    else {
        asymmetricTypeCheck(alg, key, usage);
    }
};

async function exportSPKI(key) {
    return toSPKI(key);
}

var subtleAlgorithm = (alg, algorithm) => {
    const hash = `SHA-${alg.slice(-3)}`;
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512':
            return { hash, name: 'HMAC' };
        case 'PS256':
        case 'PS384':
        case 'PS512':
            return { hash, name: 'RSA-PSS', saltLength: parseInt(alg.slice(-3), 10) >> 3 };
        case 'RS256':
        case 'RS384':
        case 'RS512':
            return { hash, name: 'RSASSA-PKCS1-v1_5' };
        case 'ES256':
        case 'ES384':
        case 'ES512':
            return { hash, name: 'ECDSA', namedCurve: algorithm.namedCurve };
        case 'Ed25519':
        case 'EdDSA':
            return { name: 'Ed25519' };
        case 'ML-DSA-44':
        case 'ML-DSA-65':
        case 'ML-DSA-87':
            return { name: alg };
        default:
            throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
};

var getSignKey = async (alg, key, usage) => {
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError(invalidKeyInput(key, 'CryptoKey', 'KeyObject', 'JSON Web Key'));
        }
        return crypto.subtle.importKey('raw', key, { hash: `SHA-${alg.slice(-3)}`, name: 'HMAC' }, false, [usage]);
    }
    checkSigCryptoKey(key, alg, usage);
    return key;
};

var verify = async (alg, key, signature, data) => {
    const cryptoKey = await getSignKey(alg, key, 'verify');
    checkKeyLength(alg, cryptoKey);
    const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
    try {
        return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
    }
    catch {
        return false;
    }
};

async function flattenedVerify(jws, key, options) {
    if (!isObject(jws)) {
        throw new JWSInvalid('Flattened JWS must be an object');
    }
    if (jws.protected === undefined && jws.header === undefined) {
        throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== undefined && typeof jws.protected !== 'string') {
        throw new JWSInvalid('JWS Protected Header incorrect type');
    }
    if (jws.payload === undefined) {
        throw new JWSInvalid('JWS Payload missing');
    }
    if (typeof jws.signature !== 'string') {
        throw new JWSInvalid('JWS Signature missing or incorrect type');
    }
    if (jws.header !== undefined && !isObject(jws.header)) {
        throw new JWSInvalid('JWS Unprotected Header incorrect type');
    }
    let parsedProt = {};
    if (jws.protected) {
        try {
            const protectedHeader = decode(jws.protected);
            parsedProt = JSON.parse(decoder.decode(protectedHeader));
        }
        catch {
            throw new JWSInvalid('JWS Protected Header is invalid');
        }
    }
    if (!isDisjoint(parsedProt, jws.header)) {
        throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header,
    };
    const extensions = validateCrit(JWSInvalid, new Map([['b64', true]]), options?.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has('b64')) {
        b64 = parsedProt.b64;
        if (typeof b64 !== 'boolean') {
            throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
    }
    const { alg } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && validateAlgorithms('algorithms', options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
        throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
    }
    if (b64) {
        if (typeof jws.payload !== 'string') {
            throw new JWSInvalid('JWS Payload must be a string');
        }
    }
    else if (typeof jws.payload !== 'string' && !(jws.payload instanceof Uint8Array)) {
        throw new JWSInvalid('JWS Payload must be a string or an Uint8Array instance');
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jws);
        resolvedKey = true;
    }
    checkKeyType(alg, key, 'verify');
    const data = concat(encoder.encode(jws.protected ?? ''), encoder.encode('.'), typeof jws.payload === 'string' ? encoder.encode(jws.payload) : jws.payload);
    let signature;
    try {
        signature = decode(jws.signature);
    }
    catch {
        throw new JWSInvalid('Failed to base64url decode the signature');
    }
    const k = await normalizeKey(key, alg);
    const verified = await verify(alg, k, signature, data);
    if (!verified) {
        throw new JWSSignatureVerificationFailed();
    }
    let payload;
    if (b64) {
        try {
            payload = decode(jws.payload);
        }
        catch {
            throw new JWSInvalid('Failed to base64url decode the payload');
        }
    }
    else if (typeof jws.payload === 'string') {
        payload = encoder.encode(jws.payload);
    }
    else {
        payload = jws.payload;
    }
    const result = { payload };
    if (jws.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jws.header !== undefined) {
        result.unprotectedHeader = jws.header;
    }
    if (resolvedKey) {
        return { ...result, key: k };
    }
    return result;
}

async function compactVerify(jws, key, options) {
    if (jws instanceof Uint8Array) {
        jws = decoder.decode(jws);
    }
    if (typeof jws !== 'string') {
        throw new JWSInvalid('Compact JWS must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split('.');
    if (length !== 3) {
        throw new JWSInvalid('Invalid Compact JWS');
    }
    const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
    const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}

var epoch = (date) => Math.floor(date.getTime() / 1000);

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs = (str) => {
    const matched = REGEX.exec(str);
    if (!matched || (matched[4] && matched[1])) {
        throw new TypeError('Invalid time period format');
    }
    const value = parseFloat(matched[2]);
    const unit = matched[3].toLowerCase();
    let numericDate;
    switch (unit) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
        case 's':
            numericDate = Math.round(value);
            break;
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
            numericDate = Math.round(value * minute);
            break;
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
            numericDate = Math.round(value * hour);
            break;
        case 'day':
        case 'days':
        case 'd':
            numericDate = Math.round(value * day);
            break;
        case 'week':
        case 'weeks':
        case 'w':
            numericDate = Math.round(value * week);
            break;
        default:
            numericDate = Math.round(value * year);
            break;
    }
    if (matched[1] === '-' || matched[4] === 'ago') {
        return -numericDate;
    }
    return numericDate;
};

const normalizeTyp = (value) => {
    if (value.includes('/')) {
        return value.toLowerCase();
    }
    return `application/${value.toLowerCase()}`;
};
const checkAudiencePresence = (audPayload, audOption) => {
    if (typeof audPayload === 'string') {
        return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
};
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
    let payload;
    try {
        payload = JSON.parse(decoder.decode(encodedPayload));
    }
    catch {
    }
    if (!isObject(payload)) {
        throw new JWTInvalid('JWT Claims Set must be a top-level JSON object');
    }
    const { typ } = options;
    if (typ &&
        (typeof protectedHeader.typ !== 'string' ||
            normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, 'typ', 'check_failed');
    }
    const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
    const presenceCheck = [...requiredClaims];
    if (maxTokenAge !== undefined)
        presenceCheck.push('iat');
    if (audience !== undefined)
        presenceCheck.push('aud');
    if (subject !== undefined)
        presenceCheck.push('sub');
    if (issuer !== undefined)
        presenceCheck.push('iss');
    for (const claim of new Set(presenceCheck.reverse())) {
        if (!(claim in payload)) {
            throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, 'missing');
        }
    }
    if (issuer &&
        !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
        throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, 'iss', 'check_failed');
    }
    if (subject && payload.sub !== subject) {
        throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, 'sub', 'check_failed');
    }
    if (audience &&
        !checkAudiencePresence(payload.aud, typeof audience === 'string' ? [audience] : audience)) {
        throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, 'aud', 'check_failed');
    }
    let tolerance;
    switch (typeof options.clockTolerance) {
        case 'string':
            tolerance = secs(options.clockTolerance);
            break;
        case 'number':
            tolerance = options.clockTolerance;
            break;
        case 'undefined':
            tolerance = 0;
            break;
        default:
            throw new TypeError('Invalid clockTolerance option type');
    }
    const { currentDate } = options;
    const now = epoch(currentDate || new Date());
    if ((payload.iat !== undefined || maxTokenAge) && typeof payload.iat !== 'number') {
        throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, 'iat', 'invalid');
    }
    if (payload.nbf !== undefined) {
        if (typeof payload.nbf !== 'number') {
            throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, 'nbf', 'invalid');
        }
        if (payload.nbf > now + tolerance) {
            throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, 'nbf', 'check_failed');
        }
    }
    if (payload.exp !== undefined) {
        if (typeof payload.exp !== 'number') {
            throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, 'exp', 'invalid');
        }
        if (payload.exp <= now - tolerance) {
            throw new JWTExpired('"exp" claim timestamp check failed', payload, 'exp', 'check_failed');
        }
    }
    if (maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === 'number' ? maxTokenAge : secs(maxTokenAge);
        if (age - tolerance > max) {
            throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, 'iat', 'check_failed');
        }
        if (age < 0 - tolerance) {
            throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, 'iat', 'check_failed');
        }
    }
    return payload;
}

async function jwtVerify(jwt, key, options) {
    const verified = await compactVerify(jwt, key, options);
    if (verified.protectedHeader.crit?.includes('b64') && verified.protectedHeader.b64 === false) {
        throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
    }
    const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
    const result = { payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}

function decodeProtectedHeader(token) {
    let protectedB64u;
    if (typeof token === 'string') {
        const parts = token.split('.');
        if (parts.length === 3 || parts.length === 5) {
            [protectedB64u] = parts;
        }
    }
    else if (typeof token === 'object' && token) {
        if ('protected' in token) {
            protectedB64u = token.protected;
        }
        else {
            throw new TypeError('Token does not contain a Protected Header');
        }
    }
    try {
        if (typeof protectedB64u !== 'string' || !protectedB64u) {
            throw new Error();
        }
        const result = JSON.parse(decoder.decode(decode(protectedB64u)));
        if (!isObject(result)) {
            throw new Error();
        }
        return result;
    }
    catch {
        throw new TypeError('Invalid Token or Protected Header formatting');
    }
}

let JwksError$1 = class JwksError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JwksError';
  }
};

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

function resolveAlg(jwk) {
  if (jwk.alg) {
    return jwk.alg;
  }

  if (jwk.kty === 'RSA') {
    return 'RS256';
  }

  if (jwk.kty === 'EC') {
    switch (jwk.crv) {
      case 'P-256':
        return 'ES256';
      case 'secp256k1':
        return 'ES256K';
      case 'P-384':
        return 'ES384';
      case 'P-521':
        return 'ES512';
    }
  }

  if (jwk.kty === 'OKP') {
    switch (jwk.crv) {
      case 'Ed25519':
      case 'Ed448':
        return 'EdDSA';
    }
  }

  throw new JwksError$1('Unsupported JWK');
}

async function retrieveSigningKeys(jwks) {
  const results = [];

  jwks = jwks
    .filter(({ use }) => use === 'sig' || use === undefined)
    .filter(({ kty }) => kty === 'RSA' || kty === 'EC' || kty === 'OKP');

  for (const jwk of jwks) {
    try {
      const key = await importJWK({ ...jwk, ext: true }, resolveAlg(jwk));
      if (key.type !== 'public') continue;
      const spkiPem = await exportSPKI(key);
      const getSpki = () => spkiPem;

      results.push({
        get publicKey() { return getSpki(); },
        get rsaPublicKey() { return getSpki(); },
        getPublicKey() { return getSpki(); },
        ...(typeof jwk.kid === 'string' && jwk.kid ? { kid: jwk.kid } : undefined),
        ...(typeof jwk.alg === 'string' && jwk.alg ? { alg: jwk.alg } : undefined)
      });
    } catch (_) {
      continue;
    }
  }

  return results;
}

// CommonJS imports
const cjsRequire$1 = createRequire(import.meta.url);
const http = cjsRequire$1('http');
const https = cjsRequire$1('https');
const urlUtil = cjsRequire$1('url');

const request = (options) => {
  if (options.fetcher) {
    return options.fetcher(options.uri);
  }

  return new Promise((resolve, reject) => {
    const {
      hostname,
      path,
      port,
      protocol
    } = urlUtil.parse(options.uri);

    const requestOptions = {
      hostname,
      path,
      port,
      method: 'GET',
      ...(options.headers && { headers: { ...options.headers } }),
      ...(options.timeout && { timeout: options.timeout }),
      ...(options.agent && { agent: options.agent })
    };

    const httpRequestLib = protocol === 'https:' ? https : http;
    const httpRequest = httpRequestLib.request(requestOptions, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const errorMsg = res.body && (res.body.message || res.body) || res.statusMessage || `Http Error ${res.statusCode}`;
          reject({ errorMsg });
        } else {
          try {
            resolve(rawData && JSON.parse(rawData));
          } catch (error) {
            reject(error);
          }
        }
      });
    });

    httpRequest
      .on('timeout', () => httpRequest.destroy())
      .on('error', (e) => reject(e))
      .end();
  });
};

const cjsRequire = createRequire(import.meta.url);
const memoizer = cjsRequire('lru-memoizer');

const logger$2 = createDebug('jwks');

function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000 }) {
  logger$2(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);
  return promisify(memoizer({
    hash: (kid) => kid,
    load: callbackify(client.getSigningKey.bind(client)),
    maxAge: cacheMaxAge,
    max: cacheMaxEntries
  }));
}

var limiter = {};

var tokenBucket;
var hasRequiredTokenBucket;

function requireTokenBucket () {
	if (hasRequiredTokenBucket) return tokenBucket;
	hasRequiredTokenBucket = 1;
	/**
	 * A hierarchical token bucket for rate limiting. See
	 * http://en.wikipedia.org/wiki/Token_bucket for more information.
	 * @author John Hurliman <jhurliman@cull.tv>
	 *
	 * @param {Number} bucketSize Maximum number of tokens to hold in the bucket.
	 *  Also known as the burst rate.
	 * @param {Number} tokensPerInterval Number of tokens to drip into the bucket
	 *  over the course of one interval.
	 * @param {String|Number} interval The interval length in milliseconds, or as
	 *  one of the following strings: 'second', 'minute', 'hour', day'.
	 * @param {TokenBucket} parentBucket Optional. A token bucket that will act as
	 *  the parent of this bucket.
	 */
	var TokenBucket = function(bucketSize, tokensPerInterval, interval, parentBucket) {
	  this.bucketSize = bucketSize;
	  this.tokensPerInterval = tokensPerInterval;

	  if (typeof interval === 'string') {
	    switch (interval) {
	      case 'sec': case 'second':
	        this.interval = 1000; break;
	      case 'min': case 'minute':
	        this.interval = 1000 * 60; break;
	      case 'hr': case 'hour':
	        this.interval = 1000 * 60 * 60; break;
	      case 'day':
	        this.interval = 1000 * 60 * 60 * 24; break;
	      default:
	        throw new Error('Invaid interval ' + interval);
	    }
	  } else {
	    this.interval = interval;
	  }

	  this.parentBucket = parentBucket;
	  this.content = 0;
	  this.lastDrip = +new Date();
	};

	TokenBucket.prototype = {
	  bucketSize: 1,
	  tokensPerInterval: 1,
	  interval: 1000,
	  parentBucket: null,
	  content: 0,
	  lastDrip: 0,

	  /**
	   * Remove the requested number of tokens and fire the given callback. If the
	   * bucket (and any parent buckets) contains enough tokens this will happen
	   * immediately. Otherwise, the removal and callback will happen when enough
	   * tokens become available.
	   * @param {Number} count The number of tokens to remove.
	   * @param {Function} callback(err, remainingTokens)
	   * @returns {Boolean} True if the callback was fired immediately, otherwise
	   *  false.
	   */
	  removeTokens: function(count, callback) {
	    var self = this;

	    // Is this an infinite size bucket?
	    if (!this.bucketSize) {
	      process.nextTick(callback.bind(null, null, count, Number.POSITIVE_INFINITY));
	      return true;
	    }

	    // Make sure the bucket can hold the requested number of tokens
	    if (count > this.bucketSize) {
	      process.nextTick(callback.bind(null, 'Requested tokens ' + count + ' exceeds bucket size ' +
	        this.bucketSize, null));
	      return false;
	    }

	    // Drip new tokens into this bucket
	    this.drip();

	    // If we don't have enough tokens in this bucket, come back later
	    if (count > this.content)
	      return comeBackLater();

	    if (this.parentBucket) {
	      // Remove the requested from the parent bucket first
	      return this.parentBucket.removeTokens(count, function(err, remainingTokens) {
	        if (err) return callback(err, null);

	        // Check that we still have enough tokens in this bucket
	        if (count > self.content)
	          return comeBackLater();

	        // Tokens were removed from the parent bucket, now remove them from
	        // this bucket and fire the callback. Note that we look at the current
	        // bucket and parent bucket's remaining tokens and return the smaller
	        // of the two values
	        self.content -= count;
	        callback(null, Math.min(remainingTokens, self.content));
	      });
	    } else {
	      // Remove the requested tokens from this bucket and fire the callback
	      this.content -= count;
	      process.nextTick(callback.bind(null, null, this.content));
	      return true;
	    }

	    function comeBackLater() {
	      // How long do we need to wait to make up the difference in tokens?
	      var waitInterval = Math.ceil(
	        (count - self.content) * (self.interval / self.tokensPerInterval));
	      setTimeout(function() { self.removeTokens(count, callback); }, waitInterval);
	      return false;
	    }
	  },

	  /**
	   * Attempt to remove the requested number of tokens and return immediately.
	   * If the bucket (and any parent buckets) contains enough tokens this will
	   * return true, otherwise false is returned.
	   * @param {Number} count The number of tokens to remove.
	   * @param {Boolean} True if the tokens were successfully removed, otherwise
	   *  false.
	   */
	  tryRemoveTokens: function(count) {
	    // Is this an infinite size bucket?
	    if (!this.bucketSize)
	      return true;

	    // Make sure the bucket can hold the requested number of tokens
	    if (count > this.bucketSize)
	      return false;

	    // Drip new tokens into this bucket
	    this.drip();

	    // If we don't have enough tokens in this bucket, return false
	    if (count > this.content)
	      return false;

	    // Try to remove the requested tokens from the parent bucket
	    if (this.parentBucket && !this.parentBucket.tryRemoveTokens(count))
	      return false;

	    // Remove the requested tokens from this bucket and return
	    this.content -= count;
	    return true;
	  },

	  /**
	   * Add any new tokens to the bucket since the last drip.
	   * @returns {Boolean} True if new tokens were added, otherwise false.
	   */
	  drip: function() {
	    if (!this.tokensPerInterval) {
	      this.content = this.bucketSize;
	      return;
	    }

	    var now = +new Date();
	    var deltaMS = Math.max(now - this.lastDrip, 0);
	    this.lastDrip = now;

	    var dripAmount = deltaMS * (this.tokensPerInterval / this.interval);
	    this.content = Math.min(this.content + dripAmount, this.bucketSize);
	  }
	};

	tokenBucket = TokenBucket;
	return tokenBucket;
}

var clock;
var hasRequiredClock;

function requireClock () {
	if (hasRequiredClock) return clock;
	hasRequiredClock = 1;
	var getMilliseconds = function() {
	  if (typeof process !== 'undefined' && process.hrtime) {
	    var hrtime = process.hrtime();
	    var seconds = hrtime[0];
	    var nanoseconds = hrtime[1];

	    return seconds * 1e3 +  Math.floor(nanoseconds / 1e6);
	  }

	  return new Date().getTime();
	};

	clock = getMilliseconds;
	return clock;
}

var rateLimiter;
var hasRequiredRateLimiter;

function requireRateLimiter () {
	if (hasRequiredRateLimiter) return rateLimiter;
	hasRequiredRateLimiter = 1;
	var TokenBucket = requireTokenBucket();
	var getMilliseconds = requireClock();

	/**
	 * A generic rate limiter. Underneath the hood, this uses a token bucket plus
	 * an additional check to limit how many tokens we can remove each interval.
	 * @author John Hurliman <jhurliman@jhurliman.org>
	 *
	 * @param {Number} tokensPerInterval Maximum number of tokens that can be
	 *  removed at any given moment and over the course of one interval.
	 * @param {String|Number} interval The interval length in milliseconds, or as
	 *  one of the following strings: 'second', 'minute', 'hour', day'.
	 * @param {Boolean} fireImmediately Optional. Whether or not the callback
	 *  will fire immediately when rate limiting is in effect (default is false).
	 */
	var RateLimiter = function(tokensPerInterval, interval, fireImmediately) {
	  this.tokenBucket = new TokenBucket(tokensPerInterval, tokensPerInterval,
	    interval, null);

	  // Fill the token bucket to start
	  this.tokenBucket.content = tokensPerInterval;

	  this.curIntervalStart = getMilliseconds();
	  this.tokensThisInterval = 0;
	  this.fireImmediately = fireImmediately;
	};

	RateLimiter.prototype = {
	  tokenBucket: null,
	  curIntervalStart: 0,
	  tokensThisInterval: 0,
	  fireImmediately: false,

	  /**
	   * Remove the requested number of tokens and fire the given callback. If the
	   * rate limiter contains enough tokens and we haven't spent too many tokens
	   * in this interval already, this will happen immediately. Otherwise, the
	   * removal and callback will happen when enough tokens become available.
	   * @param {Number} count The number of tokens to remove.
	   * @param {Function} callback(err, remainingTokens)
	   * @returns {Boolean} True if the callback was fired immediately, otherwise
	   *  false.
	   */
	  removeTokens: function(count, callback) {
	    // Make sure the request isn't for more than we can handle
	    if (count > this.tokenBucket.bucketSize) {
	      process.nextTick(callback.bind(null, 'Requested tokens ' + count +
	        ' exceeds maximum tokens per interval ' + this.tokenBucket.bucketSize,
	        null));
	      return false;
	    }

	    var self = this;
	    var now = getMilliseconds();

	    // Advance the current interval and reset the current interval token count
	    // if needed
	    if (now < this.curIntervalStart
	      || now - this.curIntervalStart >= this.tokenBucket.interval) {
	      this.curIntervalStart = now;
	      this.tokensThisInterval = 0;
	    }

	    // If we don't have enough tokens left in this interval, wait until the
	    // next interval
	    if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval) {
	      if (this.fireImmediately) {
	        process.nextTick(callback.bind(null, null, -1));
	      } else {
	        var waitInterval = Math.ceil(
	          this.curIntervalStart + this.tokenBucket.interval - now);

	        setTimeout(function() {
	          self.tokenBucket.removeTokens(count, afterTokensRemoved);
	        }, waitInterval);
	      }
	      return false;
	    }

	    // Remove the requested number of tokens from the token bucket
	    return this.tokenBucket.removeTokens(count, afterTokensRemoved);

	    function afterTokensRemoved(err, tokensRemaining) {
	      if (err) return callback(err, null);

	      self.tokensThisInterval += count;
	      callback(null, tokensRemaining);
	    }
	  },

	  /**
	   * Attempt to remove the requested number of tokens and return immediately.
	   * If the bucket (and any parent buckets) contains enough tokens and we
	   * haven't spent too many tokens in this interval already, this will return
	   * true. Otherwise, false is returned.
	   * @param {Number} count The number of tokens to remove.
	   * @param {Boolean} True if the tokens were successfully removed, otherwise
	   *  false.
	   */
	  tryRemoveTokens: function(count) {
	    // Make sure the request isn't for more than we can handle
	    if (count > this.tokenBucket.bucketSize)
	      return false;

	    var now = getMilliseconds();

	    // Advance the current interval and reset the current interval token count
	    // if needed
	    if (now < this.curIntervalStart
	      || now - this.curIntervalStart >= this.tokenBucket.interval) {
	      this.curIntervalStart = now;
	      this.tokensThisInterval = 0;
	    }

	    // If we don't have enough tokens left in this interval, return false
	    if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval)
	      return false;

	    // Try to remove the requested number of tokens from the token bucket
	    var removed = this.tokenBucket.tryRemoveTokens(count);
	    if (removed) {
	      this.tokensThisInterval += count;
	    }
	    return removed;
	  },

	  /**
	   * Returns the number of tokens remaining in the TokenBucket.
	   * @returns {Number} The number of tokens remaining.
	   */
	  getTokensRemaining: function () {
	    this.tokenBucket.drip();
	    return this.tokenBucket.content;
	  }
	};

	rateLimiter = RateLimiter;
	return rateLimiter;
}

var hasRequiredLimiter;

function requireLimiter () {
	if (hasRequiredLimiter) return limiter;
	hasRequiredLimiter = 1;
	limiter.RateLimiter = requireRateLimiter();
	limiter.TokenBucket = requireTokenBucket();
	return limiter;
}

var limiterExports = requireLimiter();

let JwksRateLimitError$1 = class JwksRateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JwksRateLimitError';
  }
};

const logger$1 = createDebug('jwks');
function rateLimitWrapper(client, { jwksRequestsPerMinute = 10 }) {
  const getSigningKey = client.getSigningKey.bind(client);
  const limiter = new limiterExports.RateLimiter(jwksRequestsPerMinute, 'minute', true);
  logger$1(`Configured rate limiting to JWKS endpoint at ${jwksRequestsPerMinute}/minute`);

  return async (kid) => await new Promise((resolve, reject) => {
    limiter.removeTokens(1, async (err, remaining) => {
      if (err) {
        reject(err);
      }

      logger$1('Requests to the JWKS endpoint available for the next minute:', remaining);
      if (remaining < 0) {
        logger$1('Too many requests to the JWKS endpoint');
        reject(new JwksRateLimitError$1('Too many requests to the JWKS endpoint'));
      } else {
        try {
          const key = await getSigningKey(kid);
          resolve(key);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

/**
 * Uses getKeysInterceptor to allow users to retrieve keys from a file,
 * external cache, or provided object before falling back to the jwksUri endpoint
 */
function getKeysInterceptor(client, { getKeysInterceptor }) {
  const getSigningKey = client.getSigningKey.bind(client);

  return async (kid) => {
    const keys = await getKeysInterceptor();

    let signingKeys;
    if (keys && keys.length) {
      signingKeys = await retrieveSigningKeys(keys);
    }

    if (signingKeys && signingKeys.length) {
      const key = signingKeys.find(k => !kid || k.kid === kid);

      if (key) {
        return key;
      }
    }

    return getSigningKey(kid);
  };
}

const callbackSupport = (client) => {
  const getSigningKey = client.getSigningKey.bind(client);

  return (kid, cb) => {
    if (cb) {
      const callbackFunc = callbackify(getSigningKey);
      return callbackFunc(kid, cb);
    }

    return getSigningKey(kid);
  };
};

let SigningKeyNotFoundError$1 = class SigningKeyNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SigningKeyNotFoundError';
  }
};

const logger = createDebug('jwks');

class JwksClient {
  constructor(options) {
    this.options = {
      rateLimit: false,
      cache: true,
      timeout: 30000,
      ...options
    };

    // Initialize wrappers.
    if (this.options.getKeysInterceptor) {
      this.getSigningKey = getKeysInterceptor(this, options);
    }

    if (this.options.rateLimit) {
      this.getSigningKey = rateLimitWrapper(this, options);
    }
    if (this.options.cache) {
      this.getSigningKey = cacheWrapper(this, options);
    }

    this.getSigningKey = callbackSupport(this);
  }

  async getKeys() {
    logger(`Fetching keys from '${this.options.jwksUri}'`);

    try {
      const res = await request({
        uri: this.options.jwksUri,
        headers: this.options.requestHeaders,
        agent: this.options.requestAgent,
        timeout: this.options.timeout,
        fetcher: this.options.fetcher
      });

      logger('Keys:', res.keys);
      return res.keys;
    } catch (err) {
      const { errorMsg } = err;
      logger('Failure:', errorMsg || err);
      throw (errorMsg ? new JwksError$1(errorMsg) : err);
    }
  }

  async getSigningKeys() {
    const keys = await this.getKeys();

    if (!keys || !keys.length) {
      throw new JwksError$1('The JWKS endpoint did not contain any keys');
    }

    const signingKeys = await retrieveSigningKeys(keys);

    if (!signingKeys.length) {
      throw new JwksError$1('The JWKS endpoint did not contain any signing keys');
    }

    logger('Signing Keys:', signingKeys);
    return signingKeys;
  }

  async getSigningKey (kid) {
    logger(`Fetching signing key for '${kid}'`);
    const keys = await this.getSigningKeys();

    const kidDefined = kid !== undefined && kid !== null;
    if (!kidDefined && keys.length > 1) {
      logger('No KID specified and JWKS endpoint returned more than 1 key');
      throw new SigningKeyNotFoundError$1('No KID specified and JWKS endpoint returned more than 1 key');
    }

    const key = keys.find(k => !kidDefined || k.kid === kid);
    if (key) {
      return key;
    } else {
      logger(`Unable to find a signing key that matches '${kid}'`);
      throw new SigningKeyNotFoundError$1(`Unable to find a signing key that matches '${kid}'`);
    }
  }
}

let ArgumentError$1 = class ArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ArgumentError';
  }
};

var supportedAlg = [
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES256K',
  'ES384',
  'ES512',
  'EdDSA'
];

const handleSigningKeyError$2 = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(err, null, null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err, null, null);
  }
};

/**
 * Wraps hapiJwt2Key with a Promise-based provider.
 * @param {object} options
 * @returns {(decoded: { header: { alg: string, kid: string } }) => Promise<{ key: string }>}
 */
function hapiJwt2KeyAsync(options) {
  const secretProvider = hapiJwt2Key(options);
  return function(decoded) {
    return new Promise((resolve, reject) => {
      const cb = (err, key) => {
        (!key || err) ? reject(err) : resolve({ key });
      };
      secretProvider(decoded, cb);
    });
  };
}

function hapiJwt2Key(options) {
  if (options === null || options === undefined) {
    throw new ArgumentError$1('An options object must be provided when initializing hapiJwt2Key');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError$2;

  return function secretProvider(decoded, cb) {
    // We cannot find a signing certificate if there is no header (no kid).
    if (!decoded || !decoded.header) {
      return cb(new Error('Cannot find a signing certificate if there is no header'), null, null);
    }

    if (!supportedAlg.includes(decoded.header.alg)) {
      return cb(new Error('Unsupported algorithm ' + decoded.header.alg + ' supplied.'), null, null);
    }

    client.getSigningKey(decoded.header.kid)
      .then(key => cb(null, key.publicKey || key.rsaPublicKey, key))
      .catch(err => onError(err, (newError) => cb(newError, null, null)));
  };
}

const handleSigningKeyError$1 = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err);
  }
};

function expressJwtSecret(options) {
  if (options === null || options === undefined) {
    throw new ArgumentError$1('An options object must be provided when initializing expressJwtSecret');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError$1;

  const expressJwt7Provider = async (req, token) => {
    if (!token) { return; }
    const header = token.header;
    if (!header || !supportedAlg.includes(header.alg)) {
      return;
    }
    try {
      const key = await client.getSigningKey(header.kid);
      return key.publicKey || key.rsaPublicKey;
    } catch (err) {
      return new Promise((resolve, reject) => {
        onError(err, (newError) => {
          if (!newError) { return resolve(); }
          reject(newError);
        });
      });
    }
  };

  return function secretProvider(req, header, payload, cb) {
    //This function has 4 parameters to make it work with express-jwt@6
    //but it also supports express-jwt@7 which only has 2.
    if (arguments.length === 4) {
      expressJwt7Provider(req, { header })
        .then(key => {
          setImmediate(cb, null, key);
        }).catch(err => {
          setImmediate(cb, err);
        });

      return;
    }

    return expressJwt7Provider(req, arguments[1]);
  };
}

function koaJwtSecret(options = {}) {
  if (!options.jwksUri) {
    throw new ArgumentError$1('No JWKS provided. Please provide a jwksUri');
  }
  const client = new JwksClient(options);
  return function secretProvider({ alg, kid } = {}) {
    return new Promise((resolve, reject) => {
      if (!supportedAlg.includes(alg)) {
        return reject(new Error('Missing / invalid token algorithm'));
      }
      client.getSigningKey(kid)
        .then(key => {
          resolve(key.publicKey || key.rsaPublicKey);
        }).catch(err => {
          if (options.handleSigningKeyError) {
            return options.handleSigningKeyError(err).then(reject);
          }
          return reject(err);
        });
    });
  };
}

const handleSigningKeyError = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err);
  }
};

function passportJwtSecret(options) {
  if (options === null || options === undefined) {
    throw new ArgumentError$1('An options object must be provided when initializing passportJwtSecret');
  }

  if (!options.jwksUri) {
    throw new ArgumentError$1('No JWKS provided. Please provide a jwksUri');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(req, rawJwtToken, cb) {
    let header;
    try {
      header = decodeProtectedHeader(rawJwtToken);
    } catch (_) {
      return cb(new Error('jwt malformed'), null);
    }

    if (!header || !supportedAlg.includes(header.alg)) {
      return cb(null, null);
    }

    client.getSigningKey(header.kid)
      .then(async key => {
        const pem = key.publicKey || key.rsaPublicKey;
        const alg = header.alg;
        try {
          // Try to import and verify first (defense in depth). If import fails, fall back to returning PEM (legacy behavior).
          let verifyKey;
          try {
            verifyKey = await importSPKI(pem, alg);
          } catch (_) {
            return cb(null, pem);
          }
          await jwtVerify(rawJwtToken, verifyKey, { algorithms: [ alg ] });
          return cb(null, pem);
        } catch (_) {
          return cb(new Error('invalid signature'));
        }
      })
      .catch(err => {
        onError(err, (newError) => cb(newError, null));
      });
  };
}

function jwksRsa(options) {
  return new JwksClient(options);
}

// Attach properties for backwards compatibility
jwksRsa.JwksClient = JwksClient;
jwksRsa.ArgumentError = ArgumentError$1;
jwksRsa.JwksError = JwksError$1;
jwksRsa.JwksRateLimitError = JwksRateLimitError$1;
jwksRsa.SigningKeyNotFoundError = SigningKeyNotFoundError$1;
jwksRsa.expressJwtSecret = expressJwtSecret;
jwksRsa.hapiJwt2Key = hapiJwt2Key;
jwksRsa.hapiJwt2KeyAsync = hapiJwt2KeyAsync;
jwksRsa.koaJwtSecret = koaJwtSecret;
jwksRsa.passportJwtSecret = passportJwtSecret;
const ArgumentError = ArgumentError$1;
const JwksError = JwksError$1;
const JwksRateLimitError = JwksRateLimitError$1;
const SigningKeyNotFoundError = SigningKeyNotFoundError$1;

export { ArgumentError, JwksClient, JwksError, JwksRateLimitError, SigningKeyNotFoundError, jwksRsa as default, expressJwtSecret, hapiJwt2Key, hapiJwt2KeyAsync, koaJwtSecret, passportJwtSecret };
//# sourceMappingURL=index.js.map
