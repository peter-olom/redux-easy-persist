"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistWrapper = exports.clearPersistedState = exports.hydrate = void 0;
function createPersistor(config) {
    return function persistor(_a) {
        var _this = this;
        var getState = _a.getState;
        return function (next) { return function (action) { return __awaiter(_this, void 0, void 0, function () {
            var res, error_1, state_1, persistingState_1, whiteList, blackList, key, element, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(action.type == 'HYDRATE')) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, config.storeEngine.getItem(config.persistKey)];
                    case 2:
                        res = _c.sent();
                        Object.assign(action.payload, JSON.parse(res || "{}"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        console.log('FAILED TO HYDRATE');
                        return [3 /*break*/, 4];
                    case 4:
                        // Call the next dispatch method in the middleware chain.
                        next(action);
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        state_1 = getState();
                        persistingState_1 = {};
                        if (config.whiteList) {
                            whiteList = config.whiteList;
                            whiteList.map(function (s) {
                                // assign only objects keys in the white list
                                persistingState_1[s] = state_1[s];
                            });
                        }
                        if (config.blackList && !config.whiteList) {
                            blackList = config.blackList;
                            for (key in state_1) {
                                if (state_1.hasOwnProperty(key)) {
                                    element = state_1[key];
                                    if (blackList.indexOf(key) < 0) {
                                        //assign only object keys not in the white list
                                        persistingState_1[key] = element;
                                    }
                                }
                            }
                        }
                        if (((_a = config.whiteList) === null || _a === void 0 ? void 0 : _a.length) == 0 && ((_b = config.blackList) === null || _b === void 0 ? void 0 : _b.length) == 0) {
                            Object.assign(persistingState_1, state_1);
                        }
                        return [4 /*yield*/, config.storeEngine.setItem(config.persistKey, JSON.stringify(persistingState_1))];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _c.sent();
                        console.log('FAILED TO PERSIST STORE');
                        return [3 /*break*/, 8];
                    case 8: 
                    // return to allow next middleware execution
                    return [2 /*return*/, true];
                }
            });
        }); }; };
    };
}
exports.default = createPersistor;
function hydrate(store) {
    store.dispatch({ type: 'HYDRATE', payload: {} });
}
exports.hydrate = hydrate;
function clearPersistedState(store) {
    store.dispatch({ type: 'CLEAR_STATE', payload: {} });
}
exports.clearPersistedState = clearPersistedState;
function persistWrapper(reducers) {
    var wrappedReducers = {};
    var _loop_1 = function (key) {
        if (reducers.hasOwnProperty(key)) {
            var reducer_1 = reducers[key];
            var wrappedFunction = function (state, action) {
                if (action.type === 'HYDRATE') {
                    // @ts-ignore
                    state = action.payload[key];
                }
                if (action.type === 'CLEAR_STATE') {
                    // @ts-ignore
                    state = undefined;
                }
                return reducer_1(state, action);
            };
            //@ts-ignore
            wrappedReducers[key] = wrappedFunction;
        }
    };
    for (var key in reducers) {
        _loop_1(key);
    }
    return wrappedReducers;
}
exports.persistWrapper = persistWrapper;
