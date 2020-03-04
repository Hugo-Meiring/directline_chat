"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.DirectLine = exports.ConnectionStatus = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _BehaviorSubject = require("rxjs/BehaviorSubject");

var _Observable = require("rxjs/Observable");

require("rxjs/add/operator/catch");

require("rxjs/add/operator/combineLatest");

require("rxjs/add/operator/count");

require("rxjs/add/operator/delay");

require("rxjs/add/operator/do");

require("rxjs/add/operator/filter");

require("rxjs/add/operator/map");

require("rxjs/add/operator/mergeMap");

require("rxjs/add/operator/retryWhen");

require("rxjs/add/operator/share");

require("rxjs/add/operator/take");

require("rxjs/add/observable/dom/ajax");

require("rxjs/add/observable/empty");

require("rxjs/add/observable/from");

require("rxjs/add/observable/interval");

require("rxjs/add/observable/of");

require("rxjs/add/observable/throw");

var _dedupeFilenames = _interopRequireDefault(require("./dedupeFilenames"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1;i < arguments.length;i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DIRECT_LINE_VERSION = 'DirectLine/3.0';
// These types are specific to this client library, not to Direct Line 3.0
var ConnectionStatus;
exports.ConnectionStatus = ConnectionStatus;

(function (ConnectionStatus) {
	ConnectionStatus[ConnectionStatus["Uninitialized"] = 0] = "Uninitialized";
	ConnectionStatus[ConnectionStatus["Connecting"] = 1] = "Connecting";
	ConnectionStatus[ConnectionStatus["Online"] = 2] = "Online";
	ConnectionStatus[ConnectionStatus["ExpiredToken"] = 3] = "ExpiredToken";
	ConnectionStatus[ConnectionStatus["FailedToConnect"] = 4] = "FailedToConnect";
	ConnectionStatus[ConnectionStatus["Ended"] = 5] = "Ended";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));

var lifetimeRefreshToken = 30 * 60 * 1000;
var intervalRefreshToken = lifetimeRefreshToken / 2;
var timeout = 20 * 1000;
var retries = (lifetimeRefreshToken - intervalRefreshToken) / timeout;
var POLLING_INTERVAL_LOWER_BOUND = 200; //ms

var errorExpiredToken = new Error("expired token");
var errorConversationEnded = new Error("conversation ended");
var errorFailedToConnect = new Error("failed to connect");
var konsole = {
	log: function log(message) {
		var _console;

		for (var _len = arguments.length, optionalParams = new Array(_len > 1 ? _len - 1 : 0), _key = 1;_key < _len;_key++) {
			optionalParams[_key - 1] = arguments[_key];
		}

		if (typeof window !== 'undefined' && window["botchatDebug"] && message) (_console = console).log.apply(_console, [message].concat(optionalParams));
	}
};

var DirectLine =
	/*#__PURE__*/
	function () {
		//ms
		function DirectLine(options) {
			(0, _classCallCheck2["default"])(this, DirectLine);
			(0, _defineProperty2["default"])(this, "connectionStatus$", new _BehaviorSubject.BehaviorSubject(ConnectionStatus.Uninitialized));
			(0, _defineProperty2["default"])(this, "activity$", void 0);
			(0, _defineProperty2["default"])(this, "domain", "https://directline.botframework.com/v3/directline");
			(0, _defineProperty2["default"])(this, "webSocket", void 0);
			(0, _defineProperty2["default"])(this, "conversationId", void 0);
			(0, _defineProperty2["default"])(this, "expiredTokenExhaustion", void 0);
			(0, _defineProperty2["default"])(this, "secret", void 0);
			(0, _defineProperty2["default"])(this, "token", void 0);
			(0, _defineProperty2["default"])(this, "watermark", '');
			(0, _defineProperty2["default"])(this, "streamUrl", void 0);
			(0, _defineProperty2["default"])(this, "_botAgent", '');
			(0, _defineProperty2["default"])(this, "_userAgent", void 0);
			(0, _defineProperty2["default"])(this, "referenceGrammarId", void 0);
			(0, _defineProperty2["default"])(this, "pollingInterval", 1000);
			(0, _defineProperty2["default"])(this, "tokenRefreshSubscription", void 0);
			this.secret = options.secret;
			this.token = options.secret || options.token;
			this.webSocket = (options.webSocket === undefined ? true : options.webSocket) && typeof WebSocket !== 'undefined' && WebSocket !== undefined;

			if (options.domain) {
				this.domain = options.domain;
			}

			if (options.conversationId) {
				this.conversationId = options.conversationId;
			}

			if (options.watermark) {
				this.watermark = options.watermark;
			}

			if (options.streamUrl) {
				if (options.token && options.conversationId) {
					this.streamUrl = options.streamUrl;
				} else {
					console.warn('DirectLineJS: streamUrl was ignored: you need to provide a token and a conversationid');
				}
			}

			this._botAgent = this.getBotAgent(options.botAgent);
			var parsedPollingInterval = ~~options.pollingInterval;

			if (parsedPollingInterval < POLLING_INTERVAL_LOWER_BOUND) {
				if (typeof options.pollingInterval !== 'undefined') {
					console.warn("DirectLineJS: provided pollingInterval (".concat(options.pollingInterval, ") is under lower bound (200ms), using default of 1000ms"));
				}
			} else {
				this.pollingInterval = parsedPollingInterval;
			}

			this.expiredTokenExhaustion = this.setConnectionStatusFallback(ConnectionStatus.ExpiredToken, ConnectionStatus.FailedToConnect, 5);
			this.activity$ = (this.webSocket ? this.webSocketActivity$() : this.pollingGetActivity$()).share();
		} // Every time we're about to make a Direct Line REST call, we call this first to see check the current connection status.
		// Either throws an error (indicating an error state) or emits a null, indicating a (presumably) healthy connection


		(0, _createClass2["default"])(DirectLine, [{
			key: "checkConnection",
			value: function checkConnection() {
				var _this = this;

				var once = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
				var obs = this.connectionStatus$.flatMap(function (connectionStatus) {
					if (connectionStatus === ConnectionStatus.Uninitialized) {
						_this.connectionStatus$.next(ConnectionStatus.Connecting); //if token and streamUrl are defined it means reconnect has already been done. Skipping it.


						if (_this.token && _this.streamUrl) {
							_this.connectionStatus$.next(ConnectionStatus.Online);

							return _Observable.Observable.of(connectionStatus);
						} else {
							return _this.startConversation()["do"](function (conversation) {
								_this.conversationId = conversation.conversationId;
								_this.token = _this.secret || conversation.token;
								_this.streamUrl = conversation.streamUrl;
								_this.referenceGrammarId = conversation.referenceGrammarId;
								if (!_this.secret) _this.refreshTokenLoop();

								_this.connectionStatus$.next(ConnectionStatus.Online);
							}, function (error) {
								_this.connectionStatus$.next(ConnectionStatus.FailedToConnect);
							}).map(function (_) {
								return connectionStatus;
							});
						}
					} else {
						return _Observable.Observable.of(connectionStatus);
					}
				}).filter(function (connectionStatus) {
					return connectionStatus != ConnectionStatus.Uninitialized && connectionStatus != ConnectionStatus.Connecting;
				}).flatMap(function (connectionStatus) {
					switch (connectionStatus) {
						case ConnectionStatus.Ended:
							return _Observable.Observable["throw"](errorConversationEnded);

						case ConnectionStatus.FailedToConnect:
							return _Observable.Observable["throw"](errorFailedToConnect);

						case ConnectionStatus.ExpiredToken:
							return _Observable.Observable.of(connectionStatus);

						default:
							return _Observable.Observable.of(connectionStatus);
					}
				});
				return once ? obs.take(1) : obs;
			}
		}, {
			key: "setConnectionStatusFallback",
			value: function setConnectionStatusFallback(connectionStatusFrom, connectionStatusTo) {
				var maxAttempts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
				maxAttempts--;
				var attempts = 0;
				var currStatus = null;
				return function (status) {
					if (status === connectionStatusFrom && currStatus === status && attempts >= maxAttempts) {
						attempts = 0;
						return connectionStatusTo;
					}

					attempts++;
					currStatus = status;
					return status;
				};
			}
		}, {
			key: "expiredToken",
			value: function expiredToken() {
				var connectionStatus = this.connectionStatus$.getValue();
				if (connectionStatus != ConnectionStatus.Ended && connectionStatus != ConnectionStatus.FailedToConnect) this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
				var protectedConnectionStatus = this.expiredTokenExhaustion(this.connectionStatus$.getValue());
				this.connectionStatus$.next(protectedConnectionStatus);
			}
		}, {
			key: "startConversation",
			value: function startConversation() {
				//if conversationid is set here, it means we need to call the reconnect api, else it is a new conversation
				var url = this.conversationId ? "".concat(this.domain, "/conversations/").concat(this.conversationId, "?watermark=").concat(this.watermark) : "".concat(this.domain, "/conversations");
				var method = this.conversationId ? "GET" : "POST";
				return _Observable.Observable.ajax({
					method: method,
					url: url,
					timeout: timeout,
					headers: _objectSpread({
						"Accept": "application/json"
					}, this.commonHeaders())
				}) //      .do(ajaxResponse => konsole.log("conversation ajaxResponse", ajaxResponse.response))
					.map(function (ajaxResponse) {
						return ajaxResponse.response;
					}).retryWhen(function (error$) {
						return (// for now we deem 4xx and 5xx errors as unrecoverable
							// for everything else (timeouts), retry for a while
							error$.mergeMap(function (error) {
								return error.status >= 400 && error.status < 600 ? _Observable.Observable["throw"](error) : _Observable.Observable.of(error);
							}).delay(timeout).take(retries)
						);
					});
			}
		}, {
			key: "refreshTokenLoop",
			value: function refreshTokenLoop() {
				var _this2 = this;

				this.tokenRefreshSubscription = _Observable.Observable.interval(intervalRefreshToken).flatMap(function (_) {
					return _this2.refreshToken();
				}).subscribe(function (token) {
					konsole.log("refreshing token", token, "at", new Date());
					_this2.token = token;
				});
			}
		}, {
			key: "refreshToken",
			value: function refreshToken() {
				var _this3 = this;

				return this.checkConnection(true).flatMap(function (_) {
					return _Observable.Observable.ajax({
						method: "POST",
						url: "".concat(_this3.domain, "/tokens/refresh"),
						timeout: timeout,
						headers: _objectSpread({}, _this3.commonHeaders())
					}).map(function (ajaxResponse) {
						return ajaxResponse.response.token;
					}).retryWhen(function (error$) {
						return error$.mergeMap(function (error) {
							if (error.status === 403) {
								// if the token is expired there's no reason to keep trying
								_this3.expiredToken();

								return _Observable.Observable["throw"](error);
							} else if (error.status === 404) {
								// If the bot is gone, we should stop retrying
								return _Observable.Observable["throw"](error);
							}

							return _Observable.Observable.of(error);
						}).delay(timeout).take(retries);
					});
				});
			}
		}, {
			key: "reconnect",
			value: function reconnect(conversation) {
				this.token = conversation.token;
				this.streamUrl = conversation.streamUrl;
				if (this.connectionStatus$.getValue() === ConnectionStatus.ExpiredToken) this.connectionStatus$.next(ConnectionStatus.Online);
			}
		}, {
			key: "end",
			value: function end() {
				if (this.tokenRefreshSubscription) this.tokenRefreshSubscription.unsubscribe();

				try {
					this.connectionStatus$.next(ConnectionStatus.Ended);
				} catch (e) {
					if (e === errorConversationEnded) return;
					throw e;
				}
			}
		}, {
			key: "getSessionId",
			value: function getSessionId() {
				var _this4 = this;

				// If we're not connected to the bot, get connected
				// Will throw an error if we are not connected
				konsole.log("getSessionId");
				return this.checkConnection(true).flatMap(function (_) {
					return _Observable.Observable.ajax({
						method: "GET",
						url: "".concat(_this4.domain, "/session/getsessionid"),
						withCredentials: true,
						timeout: timeout,
						headers: _objectSpread({
							"Content-Type": "application/json"
						}, _this4.commonHeaders())
					}).map(function (ajaxResponse) {
						if (ajaxResponse && ajaxResponse.response && ajaxResponse.response.sessionId) {
							konsole.log("getSessionId response: " + ajaxResponse.response.sessionId);
							return ajaxResponse.response.sessionId;
						}

						return '';
					})["catch"](function (error) {
						konsole.log("getSessionId error: " + error.status);
						return _Observable.Observable.of('');
					});
				})["catch"](function (error) {
					return _this4.catchExpiredToken(error);
				});
			}
		}, {
			key: "postActivity",
			value: function postActivity(activity) {
				var _this5 = this;

				// Use postMessageWithAttachments for messages with attachments that are local files (e.g. an image to upload)
				// Technically we could use it for *all* activities, but postActivity is much lighter weight
				// So, since WebChat is partially a reference implementation of Direct Line, we implement both.
				if (activity.type === "message" && activity.attachments && activity.attachments.length > 0) return this.postMessageWithAttachments(activity); // If we're not connected to the bot, get connected
				// Will throw an error if we are not connected

				konsole.log("postActivity", activity);
				return this.checkConnection(true).flatMap(function (_) {
					return _Observable.Observable.ajax({
						method: "POST",
						url: "".concat(_this5.domain, "/conversations/").concat(_this5.conversationId, "/activities"),
						body: activity,
						timeout: timeout,
						headers: _objectSpread({
							"Content-Type": "application/json"
						}, _this5.commonHeaders())
					}).map(function (ajaxResponse) {
						return ajaxResponse.response.id;
					})["catch"](function (error) {
						return _this5.catchPostError(error);
					});
				})["catch"](function (error) {
					return _this5.catchExpiredToken(error);
				});
			}
		}, {
			key: "postMessageWithAttachments",
			value: function postMessageWithAttachments(message) {
				var _this6 = this;

				var attachments = message.attachments; // We clean the attachments but making sure every attachment has unique name.
				// If the file do not have a name, Chrome will assign "blob" when it is appended to FormData.

				var attachmentNames = (0, _dedupeFilenames["default"])(attachments.map(function (media) {
					return media.name || 'blob';
				}));
				var cleansedAttachments = attachments.map(function (attachment, index) {
					return _objectSpread({}, attachment, {
						name: attachmentNames[index]
					});
				});
				var formData; // If we're not connected to the bot, get connected
				// Will throw an error if we are not connected

				return this.checkConnection(true).flatMap(function (_) {
					// To send this message to DirectLine we need to deconstruct it into a "template" activity
					// and one blob for each attachment.
					formData = new FormData();
					formData.append('activity', new Blob([JSON.stringify(_objectSpread({}, message, {
						// Removing contentUrl from attachment, we will send it via multipart
						attachments: cleansedAttachments.map(function (_ref) {
							var string = _ref.contentUrl,
								others = (0, _objectWithoutProperties2["default"])(_ref, ["contentUrl"]);
							return _objectSpread({}, others);
						})
					}))], {
						type: 'application/vnd.microsoft.activity'
					}));
					return _Observable.Observable.from(cleansedAttachments).flatMap(function (media) {
						return _Observable.Observable.ajax({
							method: "GET",
							url: media.contentUrl,
							responseType: 'arraybuffer'
						})["do"](function (ajaxResponse) {
							return formData.append('file', new Blob([ajaxResponse.response], {
								type: media.contentType
							}), media.name);
						});
					}).count();
				}).flatMap(function (_) {
					return _Observable.Observable.ajax({
						method: "POST",
						url: "".concat(_this6.domain, "/conversations/").concat(_this6.conversationId, "/upload?userId=").concat(message.from.id),
						body: formData,
						timeout: timeout,
						headers: _objectSpread({}, _this6.commonHeaders())
					}).map(function (ajaxResponse) {
						return ajaxResponse.response.id;
					})["catch"](function (error) {
						return _this6.catchPostError(error);
					});
				})["catch"](function (error) {
					return _this6.catchPostError(error);
				});
			}
		}, {
			key: "catchPostError",
			value: function catchPostError(error) {
				if (error.status === 403) // token has expired (will fall through to return "retry")
					this.expiredToken(); else if (error.status >= 400 && error.status < 500) // more unrecoverable errors
					return _Observable.Observable["throw"](error);
				return _Observable.Observable.of("retry");
			}
		}, {
			key: "catchExpiredToken",
			value: function catchExpiredToken(error) {
				return error === errorExpiredToken ? _Observable.Observable.of("retry") : _Observable.Observable["throw"](error);
			}
		}, {
			key: "pollingGetActivity$",
			value: function pollingGetActivity$() {
				var _this7 = this;

				var poller$ = _Observable.Observable.create(function (subscriber) {
					// A BehaviorSubject to trigger polling. Since it is a BehaviorSubject
					// the first event is produced immediately.
					var trigger$ = new _BehaviorSubject.BehaviorSubject({});
					trigger$.subscribe(function () {
						if (_this7.connectionStatus$.getValue() === ConnectionStatus.Online) {
							var startTimestamp = Date.now();

							_Observable.Observable.ajax({
								headers: _objectSpread({
									Accept: 'application/json'
								}, _this7.commonHeaders()),
								method: 'GET',
								url: "".concat(_this7.domain, "/conversations/").concat(_this7.conversationId, "/activities?watermark=").concat(_this7.watermark),
								timeout: timeout
							}).subscribe(function (result) {
								subscriber.next(result);
								setTimeout(function () {
									return trigger$.next(null);
								}, Math.max(0, _this7.pollingInterval - Date.now() + startTimestamp));
							}, function (error) {
								switch (error.status) {
									case 403:
										_this7.connectionStatus$.next(ConnectionStatus.ExpiredToken);

										setTimeout(function () {
											return trigger$.next(null);
										}, _this7.pollingInterval);
										break;

									case 404:
										_this7.connectionStatus$.next(ConnectionStatus.Ended);

										break;

									default:
										// propagate the error
										subscriber.error(error);
										break;
								}
							});
						}
					});
				});

				return this.checkConnection().flatMap(function (_) {
					return poller$["catch"](function () {
						return _Observable.Observable.empty();
					}).map(function (ajaxResponse) {
						return ajaxResponse.response;
					}).flatMap(function (activityGroup) {
						return _this7.observableFromActivityGroup(activityGroup);
					});
				});
			}
		}, {
			key: "observableFromActivityGroup",
			value: function observableFromActivityGroup(activityGroup) {
				if (activityGroup.watermark) this.watermark = activityGroup.watermark;
				return _Observable.Observable.from(activityGroup.activities);
			}
		}, {
			key: "webSocketActivity$",
			value: function webSocketActivity$() {
				var _this8 = this;

				return this.checkConnection().flatMap(function (_) {
					return _this8.observableWebSocket() // WebSockets can be closed by the server or the browser. In the former case we need to
						// retrieve a new streamUrl. In the latter case we could first retry with the current streamUrl,
						// but it's simpler just to always fetch a new one.
						.retryWhen(function (error$) {
							return error$.delay(_this8.getRetryDelay()).mergeMap(function (error) {
								return _this8.reconnectToConversation();
							});
						});
				}).flatMap(function (activityGroup) {
					return _this8.observableFromActivityGroup(activityGroup);
				});
			} // Returns the delay duration in milliseconds

		}, {
			key: "getRetryDelay",
			value: function getRetryDelay() {
				return Math.floor(3000 + Math.random() * 12000);
			} // Originally we used Observable.webSocket, but it's fairly opionated  and I ended up writing
			// a lot of code to work around their implemention details. Since WebChat is meant to be a reference
			// implementation, I decided roll the below, where the logic is more purposeful. - @billba

		}, {
			key: "observableWebSocket",
			value: function observableWebSocket() {
				var _this9 = this;

				return _Observable.Observable.create(function (subscriber) {
					konsole.log("creating WebSocket", _this9.streamUrl);
					var ws = new WebSocket(_this9.streamUrl);
					var sub;

					ws.onopen = function (open) {
						konsole.log("WebSocket open", open); // Chrome is pretty bad at noticing when a WebSocket connection is broken.
						// If we periodically ping the server with empty messages, it helps Chrome
						// realize when connection breaks, and close the socket. We then throw an
						// error, and that give us the opportunity to attempt to reconnect.

						sub = _Observable.Observable.interval(timeout).subscribe(function (_) {
							try {
								ws.send("");
							} catch (e) {
								konsole.log("Ping error", e);
							}
						});
					};

					ws.onclose = function (close) {
						konsole.log("WebSocket close", close);
						if (sub) sub.unsubscribe();
						subscriber.error(close);
					};

					ws.onmessage = function (message) {
						return message.data && subscriber.next(JSON.parse(message.data));
					}; // This is the 'unsubscribe' method, which is called when this observable is disposed.
					// When the WebSocket closes itself, we throw an error, and this function is eventually called.
					// When the observable is closed first (e.g. when tearing down a WebChat instance) then
					// we need to manually close the WebSocket.


					return function () {
						if (ws.readyState === 0 || ws.readyState === 1) ws.close();
					};
				});
			}
		}, {
			key: "reconnectToConversation",
			value: function reconnectToConversation() {
				var _this10 = this;

				return this.checkConnection(true).flatMap(function (_) {
					return _Observable.Observable.ajax({
						method: "GET",
						url: "".concat(_this10.domain, "/conversations/").concat(_this10.conversationId, "?watermark=").concat(_this10.watermark),
						timeout: timeout,
						headers: _objectSpread({
							"Accept": "application/json"
						}, _this10.commonHeaders())
					})["do"](function (result) {
						if (!_this10.secret) _this10.token = result.response.token;
						_this10.streamUrl = result.response.streamUrl;
					}).map(function (_) {
						return null;
					}).retryWhen(function (error$) {
						return error$.mergeMap(function (error) {
							if (error.status === 403) {
								// token has expired. We can't recover from this here, but the embedding
								// website might eventually call reconnect() with a new token and streamUrl.
								_this10.expiredToken();
							} else if (error.status === 404) {
								return _Observable.Observable["throw"](errorConversationEnded);
							}

							return _Observable.Observable.of(error);
						}).delay(timeout).take(retries);
					});
				});
			}
		}, {
			key: "commonHeaders",
			value: function commonHeaders() {
				return {
					"Authorization": "Bearer ".concat(this.token),
					"x-ms-bot-agent": this._botAgent
				};
			}
		}, {
			key: "getBotAgent",
			value: function getBotAgent() {
				var customAgent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
				var clientAgent = 'directlinejs';

				if (customAgent) {
					clientAgent += "; ".concat(customAgent);
				}

				return "".concat(DIRECT_LINE_VERSION, " (").concat(clientAgent, ")");
			}
		}]);
		return DirectLine;
	}();

exports.DirectLine = DirectLine;