define("Cache", ["require", "exports"], function (require, exports) {
    "use strict";
    var Cache = (function () {
        function Cache() {
        }
        Cache.setup = function () {
            if ('serviceWorker' in navigator) {
                navigator["serviceWorker"].register('cache.js', { scope: './' }).then(function (reg) {
                    if (reg.installing) {
                        console.log('Service worker installing');
                    }
                    else if (reg.waiting) {
                        console.log('Service worker installed');
                    }
                    else if (reg.active) {
                        console.log('Service worker active');
                    }
                }).catch(function (error) {
                    console.log('Registration failed with ' + error);
                });
            }
        };
        return Cache;
    }());
    exports.Cache = Cache;
});
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    var Callable = (function () {
        function Callable() {
        }
        return Callable;
    }());
    exports.Callable = Callable;
    var Call = (function () {
        function Call() {
        }
        return Call;
    }());
    exports.Call = Call;
});
/// <reference path="jQuery.d.ts" />
define("Interface", ["require", "exports"], function (require, exports) {
    "use strict";
    var Interface = (function () {
        function Interface(console) {
            this.console = console;
            this.listeners = [];
        }
        Interface.prototype.addListener = function (listener) {
            this.listeners.push(listener);
        };
        Interface.prototype.newFunction = function (command, fn) {
            var wrapper = document.createElement("div");
            wrapper.classList.add("fn_def");
            wrapper.innerHTML += "<div class='name'>" + fn.name + "</div>";
            wrapper.innerHTML += "<div class='params'>" + fn.params.join(",") + "</div>";
            wrapper.innerHTML += "<div class='body'>" + fn.body + "</div>";
            $(this.console).prepend(wrapper);
            var self = this;
            wrapper.addEventListener("click", function () {
                self.trigger(command);
            });
        };
        Interface.prototype.newCall = function (command, call, result) {
            var wrapper = document.createElement("div");
            wrapper.classList.add("fn_call");
            wrapper.innerHTML += "<div class='name'>" + call.name + "</div>";
            wrapper.innerHTML += "<div class='params'>" + call.params.join(",") + "</div>";
            wrapper.innerHTML += "<div class='result'>" + result + "</div>";
            $(this.console).prepend(wrapper);
            var self = this;
            wrapper.addEventListener("click", function () {
                self.trigger(command);
            });
        };
        Interface.prototype.trigger = function (command) {
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener.setText(command);
            }
        };
        return Interface;
    }());
    exports.Interface = Interface;
});
define("Parser", ["require", "exports", "types"], function (require, exports, types_1) {
    "use strict";
    var id = "[A-Za-z_][A-Za-z0-9_]*";
    var literal = "(?:[0-9]*\.[0-9]+|[0-9]+\.?[0-9]*|" + id + ")";
    var paramList = "(?: *" + id + "(?: *, *" + id + " *)*)?";
    var argList = "(?: *" + literal + "(?: *, *" + literal + " *)*)?";
    var funDefSep = "\\s";
    var funDef = "(" + id + ")" + funDefSep + "(" + paramList + ")" + funDefSep + "(.*)";
    var funCall = "(" + id + ")(?:\\((" + argList + ")\\))?";
    var evalCmd = "^(eval)\\((.*)\\)$";
    var defCmd = "^(def) (" + id + ") (.*)";
    var regex = {
        id: new RegExp(id),
        paramList: new RegExp(paramList),
        funDef: new RegExp(funDef),
        funCall: new RegExp(funCall),
        evalCmd: evalCmd,
        defCmd: defCmd
    };
    var Parser = (function () {
        function Parser(ui) {
            this.functions = [];
            ui.addListener(this);
            this.ui = ui;
            this.inputs = [];
        }
        Parser.prototype.watch = function (input) {
            var self = this;
            input.addEventListener("keydown", function (e) {
                switch (e.keyCode) {
                    case 190:
                        if (this.value == "") {
                            this.value = self.lastCommand;
                            e.preventDefault();
                        }
                        break;
                }
            });
            input.addEventListener("keyup", function (e) {
                switch (e.keyCode) {
                    case 13:
                        if (self.parse(this.value)) {
                            this.value = "";
                        }
                        break;
                }
            });
            this.inputs.push(input);
            input.focus();
        };
        Parser.prototype.parse = function (command) {
            if (command == "") {
                command = this.lastCommand;
            }
            this.lastCommand = command;
            var matches = command.match(regex.defCmd);
            if (matches) {
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = [matches[2]];
                var result = void 0;
                try {
                    result = eval(matches[3]);
                    window[matches[2]] = result;
                }
                catch (e) {
                    result = "error";
                }
                this.assign("ans", result);
                this.ui.newCall(command, action, result);
                return true;
            }
            matches = command.match(regex.funDef);
            if (matches) {
                var action = new types_1.Callable();
                action.name = matches[1];
                action.params = this.split(matches[2], ",");
                action.body = matches[3];
                this.functions.push(action);
                this.ui.newFunction(command, action);
                this.register(action);
                return true;
            }
            matches = command.match(regex.evalCmd);
            if (matches) {
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = [];
                var result = void 0;
                try {
                    result = eval(matches[2]);
                }
                catch (e) {
                    result = "error";
                }
                this.assign("ans", result);
                this.ui.newCall(command, action, result);
                return true;
            }
            matches = command.match(regex.funCall);
            if (matches) {
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = this.split(matches[2], ",");
                var output = this.exec(action);
                this.ui.newCall(command, action, output);
                return true;
            }
            return false;
        };
        Parser.prototype.register = function (fn) {
            var content = "function(";
            content += fn.params.join(",");
            content += ") { return (" + fn.body + ");}";
            this.assign(fn.name, content);
        };
        Parser.prototype.exec = function (call) {
            for (var name_1 in this.builtin) {
                if (this.builtin.hasOwnProperty(name_1)) {
                    if (name_1 == call.name) {
                        var str = name_1 + "(" + call.params.join(",") + ")";
                        var result = eval(str);
                        this.assign("ans", result);
                        return result;
                    }
                }
            }
            for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
                var fn = _a[_i];
                if (fn.name == call.name) {
                    var expectedNum = fn.params.length;
                    var actualNum = call.params.length;
                    if (expectedNum == actualNum) {
                        for (var i = 0; i < actualNum; i++) {
                            this.assign(fn.params[i], eval(call.params[i]));
                        }
                        var result = this.eval(fn);
                        this.assign("ans", result);
                        return result;
                    }
                    else {
                        return "wrong number of arguments (expected "
                            + expectedNum + ", got " + actualNum + ")";
                    }
                }
            }
            return "undefined function '" + call.name + "'";
        };
        Parser.prototype.assign = function (name, value) {
            if (typeof value == "string") {
                value = "'" + value + "'";
            }
            eval("window." + name + "=" + value);
        };
        Parser.prototype.eval = function (fn) {
            return eval(fn.body);
        };
        Parser.prototype.setText = function (command) {
            for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                input.value = command;
            }
            this.inputs[0].focus();
        };
        Parser.prototype.loadNative = function () {
            this.functions = [
                {
                    name: "log",
                    params: ["x"],
                    body: "Math.log2(x)"
                },
                {
                    name: "log2",
                    params: ["x"],
                    body: "Math.log2(x)"
                },
                {
                    name: "log10",
                    params: ["x"],
                    body: "Math.log10(x)"
                },
                {
                    name: "ln",
                    params: ["x"],
                    body: "Math.log(x)"
                },
                {
                    name: "pow",
                    params: ["x", "y"],
                    body: "Math.pow(x,y)"
                },
                {
                    name: "sqrt",
                    params: ["x"],
                    body: "Math.sqrt(x)"
                },
                {
                    name: "cbrt",
                    params: ["x"],
                    body: "Math.cbrt(x)"
                },
                {
                    name: "rt",
                    params: ["r", "x"],
                    body: "Math.pow(x, 1/r)"
                },
                {
                    name: "abs",
                    params: ["x"],
                    body: "Math.abs(x)"
                },
                {
                    name: "exp",
                    params: ["x"],
                    body: "Math.exp(x)"
                },
                {
                    name: "floor",
                    params: ["x"],
                    body: "Math.floor(x)"
                },
                {
                    name: "ceil",
                    params: ["x"],
                    body: "Math.ceil(x)"
                },
                {
                    name: "rand",
                    params: [],
                    body: "Math.random()"
                },
                {
                    name: "ans",
                    params: [],
                    body: "ans"
                },
                {
                    name: "dist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "(abs(x1-x2) + abs(y1-y2))/2"
                },
                {
                    name: "edist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))"
                },
                {
                    name: "mdist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "abs(x1-x2) + abs(y1-y2)"
                },
                {
                    name: "cdist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "max(abs(x1-x2), abs(y1-y2))"
                }
            ];
            function avg() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i - 0] = arguments[_i];
                }
                var sum = 0;
                for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
                    var value = values_1[_a];
                    sum += value;
                }
                return sum / values.length;
            }
            ;
            function leti() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i - 0] = arguments[_i];
                }
                var average = avg.apply(void 0, values);
                var sum = 0;
                for (var _a = 0, values_2 = values; _a < values_2.length; _a++) {
                    var value = values_2[_a];
                    sum += Math.pow(value - average, 2);
                }
                return sum / (values.length - 1);
            }
            ;
            function sd() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i - 0] = arguments[_i];
                }
                return Math.sqrt(leti.apply(void 0, values));
            }
            function saes(value, key) {
                var sbox = {
                    "0000": "1001",
                    "0001": "0100",
                    "0010": "1010",
                    "0011": "1011",
                    "0100": "1101",
                    "0101": "0001",
                    "0110": "1000",
                    "0111": "0101",
                    "1000": "0110",
                    "1001": "0010",
                    "1010": "0000",
                    "1011": "0011",
                    "1100": "1100",
                    "1101": "1110",
                    "1110": "1111",
                    "1111": "0111"
                };
                var galois = [
                    [4, 6, 8, 10, 12, 14, 3, 1, 7, 5, 11, 9, 15, 13],
                    [6, 5, 12, 15, 10, 9, 11, 8, 13, 14, 7, 4, 1, 2],
                    [8, 12, 3, 7, 11, 15, 6, 2, 14, 10, 5, 1, 13, 9],
                    [10, 15, 7, 2, 13, 8, 14, 11, 4, 1, 9, 12, 3, 6],
                    [12, 10, 11, 13, 7, 1, 5, 3, 9, 15, 14, 8, 2, 4],
                    [14, 9, 15, 8, 1, 6, 13, 10, 3, 4, 2, 5, 12, 11],
                    [3, 11, 6, 14, 5, 13, 12, 4, 15, 7, 10, 2, 9, 1],
                    [1, 8, 2, 11, 3, 10, 4, 13, 5, 12, 6, 15, 7, 14],
                    [7, 13, 14, 4, 9, 3, 15, 5, 8, 2, 1, 11, 6, 12],
                    [5, 14, 10, 1, 15, 4, 7, 12, 2, 9, 13, 6, 8, 3],
                    [11, 7, 5, 9, 14, 2, 10, 6, 1, 13, 15, 3, 4, 8],
                    [9, 4, 1, 12, 8, 5, 2, 15, 11, 6, 3, 14, 10, 7],
                    [15, 1, 13, 3, 2, 12, 9, 7, 6, 8, 4, 10, 11, 5],
                    [13, 2, 9, 6, 4, 11, 1, 14, 12, 3, 8, 7, 5, 10]
                ];
                var prod = function (n1, n2) {
                    if (n1 <= 1 || n2 <= 1)
                        return n1 * n2;
                    return galois[n1 - 2][n2 - 2];
                };
                var pad = function (str, size) {
                    while (str.length < size) {
                        str = "0" + str;
                    }
                    return str;
                };
                var nibble = function (value, index) {
                    var shift = 4 * (3 - index);
                    var mask = 15 << shift;
                    return (value & mask) >> shift;
                };
                var concat = function (n1, n2) {
                    return (n1 << 4) + n2;
                };
                var concat32 = function (n1, n2) {
                    return (n1 << 8) + n2;
                };
                var rotNib = function (value) {
                    return concat(nibble(value, 3), nibble(value, 2));
                };
                var subNib = function (value) {
                    var n1 = pad(nibble(value, 2).toString(2), 4);
                    var n2 = pad(nibble(value, 3).toString(2), 4);
                    var r1 = parseInt(sbox[n1], 2);
                    var r2 = parseInt(sbox[n2], 2);
                    return concat(r1, r2);
                };
                var subNib32 = function (value) {
                    var n1 = pad(nibble(value, 0).toString(2), 4);
                    var n2 = pad(nibble(value, 1).toString(2), 4);
                    var n3 = pad(nibble(value, 2).toString(2), 4);
                    var n4 = pad(nibble(value, 3).toString(2), 4);
                    var r1 = parseInt(sbox[n1], 2);
                    var r2 = parseInt(sbox[n2], 2);
                    var r3 = parseInt(sbox[n3], 2);
                    var r4 = parseInt(sbox[n4], 2);
                    return concat32(concat(r1, r2), concat(r3, r4));
                };
                var nibbleSwap = function (value) {
                    var n1 = nibble(value, 0);
                    var n2 = nibble(value, 1);
                    var n3 = nibble(value, 2);
                    var n4 = nibble(value, 3);
                    return concat32(concat(n1, n4), concat(n3, n2));
                };
                var formattedBinary = function (value, bitCount) {
                    var bin = pad(value.toString(2), bitCount);
                    var result = "";
                    for (var i = 0; i < bitCount; i++) {
                        if (i > 0 && i % 4 == 0) {
                            result += " ";
                        }
                        result += bin[i];
                    }
                    return result;
                };
                var c1 = parseInt("10000000", 2);
                var c2 = parseInt("110000", 2);
                var w0 = concat(nibble(key, 0), nibble(key, 1));
                var w1 = concat(nibble(key, 2), nibble(key, 3));
                var w2 = w0 ^ c1 ^ subNib(rotNib(w1));
                var w3 = w2 ^ w1;
                var w4 = w2 ^ c2 ^ subNib(rotNib(w3));
                var w5 = w4 ^ w3;
                var key0 = concat32(w0, w1);
                var key1 = concat32(w2, w3);
                var key2 = concat32(w4, w5);
                var round0 = value ^ key1;
                // round 1
                var round1 = subNib32(round0);
                round1 = nibbleSwap(round1);
                var S00 = prod(1, nibble(round1, 0)) ^ prod(4, nibble(round1, 2));
                var S10 = prod(4, nibble(round1, 0)) ^ prod(1, nibble(round1, 2));
                var S01 = prod(1, nibble(round1, 1)) ^ prod(4, nibble(round1, 3));
                var S11 = prod(4, nibble(round1, 1)) ^ prod(1, nibble(round1, 3));
                var S = concat32(concat(S00, S10), concat(S01, S11));
                round1 = S ^ value;
                // round final
                var round2 = subNib32(round1);
                round2 = nibbleSwap(round2);
                round2 ^= key2;
                console.log("value = ", value, " (" + formattedBinary(value, 8) + ")");
                console.log("key = ", key, " (" + formattedBinary(key, 8) + ")");
                console.log("w0 = ", w0, " (" + formattedBinary(w0, 8) + ")");
                console.log("w1 = ", w1, " (" + formattedBinary(w1, 8) + ")");
                console.log("w2 = ", w2, " (" + formattedBinary(w2, 8) + ")");
                console.log("w3 = ", w3, " (" + formattedBinary(w3, 8) + ")");
                console.log("w4 = ", w4, " (" + formattedBinary(w4, 8) + ")");
                console.log("key0 = ", key0, " (" + formattedBinary(key0, 16) + ")");
                console.log("key1 = ", key1, " (" + formattedBinary(key1, 16) + ")");
                console.log("key2 = ", key2, " (" + formattedBinary(key2, 16) + ")");
                console.log("round0 = ", round0, " (" + formattedBinary(round0, 16) + ")");
                console.log("round1 = ", round1, " (" + formattedBinary(round1, 16) + ")");
                console.log("result = ", round2, " (" + formattedBinary(round2, 16) + ")");
                return formattedBinary(round2, 16);
            }
            var self = this;
            function help() {
                for (var _i = 0, _a = self.functions; _i < _a.length; _i++) {
                    var fn = _a[_i];
                    console.log(fn.name);
                }
                return "";
            }
            this.builtin = {
                avg: avg,
                leti: leti,
                sd: sd,
                saes: saes,
                help: help
            };
            for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
                var fn = _a[_i];
                this.register(fn);
            }
            for (var name_2 in this.builtin) {
                if (this.builtin.hasOwnProperty(name_2)) {
                    window[name_2] = this.builtin[name_2];
                }
            }
        };
        Parser.prototype.split = function (content, separator) {
            if (content) {
                return content.split(separator);
            }
            return [];
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
/// <reference path="jQuery.d.ts" />
define("main", ["require", "exports", "Cache", "Interface", "Parser"], function (require, exports, Cache_1, Interface_1, Parser_1) {
    "use strict";
    $(document).ready(function () {
        var input = document.querySelector("#command");
        var console = document.querySelector("#console");
        var submit = document.querySelector("#submit");
        var parser = new Parser_1.Parser(new Interface_1.Interface(console));
        parser.loadNative();
        parser.watch(input);
        submit.addEventListener("click", function () {
            if (parser.parse(input.value)) {
                input.value = "";
            }
        });
        Cache_1.Cache.setup();
    });
});
