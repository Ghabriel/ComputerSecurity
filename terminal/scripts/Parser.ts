import {Call, Callable} from "./types"
import {Interface} from "./Interface"

const id = "[A-Za-z_][A-Za-z0-9_]*";
const literal = "(?:[0-9]*\.[0-9]+|[0-9]+\.?[0-9]*|" + id + ")";
const paramList = "(?: *" + id + "(?: *, *" + id + " *)*)?";
const argList = "(?: *" + literal + "(?: *, *" + literal + " *)*)?";
const funDefSep = "\\s";
const funDef = "(" + id + ")" + funDefSep + "(" + paramList + ")" + funDefSep + "(.*)";
const funCall = "(" + id + ")(?:\\((" + argList + ")\\))?";
const evalCmd = "^(eval)\\((.*)\\)$";
const defCmd = "^(def) (" + id + ") (.*)";
const regex = {
	id: new RegExp(id),
	paramList: new RegExp(paramList),
	funDef: new RegExp(funDef),
	funCall: new RegExp(funCall),
	evalCmd: evalCmd,
	defCmd: defCmd
};

export class Parser {
	constructor(ui: Interface) {
		ui.addListener(this);
		this.ui = ui;
		this.inputs = [];
	}

	watch(input: HTMLInputElement) {
		let self = this;
		input.addEventListener("keydown", function(e) {
			switch (e.keyCode) {
				case 190:
					if (this.value == "") {
						this.value = self.lastCommand;
						e.preventDefault();
					}
					break;
			}
		});
		input.addEventListener("keyup", function(e) {
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
	}

	parse(command: string): boolean {
		if (command == "") {
			command = this.lastCommand;
		}
		this.lastCommand = command;

		let matches = command.match(regex.defCmd);
		if (matches) {
			let action = new Call();
			action.name = matches[1];
			action.params = [matches[2]];
			let result;
			try {
				result = eval(matches[3]);
				window[matches[2]] = result;
			} catch(e) {
				result = "error";
			}
			this.assign("ans", result);
			this.ui.newCall(command, action, result);
			return true;
		}

		matches = command.match(regex.funDef);
		if (matches) {
			let action = new Callable();
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
			let action = new Call();
			action.name = matches[1];
			action.params = [];
			let result;
			try {
				result = eval(matches[2]);
			} catch(e) {
				result = "error";
			}
			this.assign("ans", result);
			this.ui.newCall(command, action, result);
			return true;
		}

		matches = command.match(regex.funCall);
		if (matches) {
			let action = new Call();
			action.name = matches[1];
			action.params = this.split(matches[2], ",");
			let output = this.exec(action);
			this.ui.newCall(command, action, output);
			return true;
		}

		return false;
	}

	register(fn: Callable): void {
		let content = "function(";
		content += fn.params.join(",");
		content += ") { return (" + fn.body + ");}";
		this.assign(fn.name, content);
	}

	exec(call: Call): string {
		for (let name in this.builtin) {
			if (this.builtin.hasOwnProperty(name)) {
				if (name == call.name) {
					let str = name + "(" + call.params.join(",") + ")";
					let result = eval(str);
					this.assign("ans", result);
					return result;
				}
			}
		}

		for (let fn of this.functions) {
			if (fn.name == call.name) {
				let expectedNum = fn.params.length;
				let actualNum = call.params.length;
				if (expectedNum == actualNum) {
					for (let i = 0; i < actualNum; i++) {
						this.assign(fn.params[i], eval(call.params[i]));
					}
					let result = this.eval(fn);
					this.assign("ans", result);
					return result;
				} else {
					return "wrong number of arguments (expected "
						+ expectedNum + ", got " + actualNum + ")";
				}
			}
		}

		return "undefined function '" + call.name + "'";
	}

	assign(name: string, value: any): void {
		if (typeof value == "string") {
			value = "'" + value + "'";
		}
		eval("window." + name + "=" + value);
	}

	eval(fn: Callable): string {
		return eval(fn.body);
	}

	setText(command: string): void {
		for (let input of this.inputs) {
			input.value = command;
		}
		this.inputs[0].focus();
	}

	loadNative(): void {
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
				params: ["x","y"],
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
				params: ["r","x"],
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
				params: ["x1","y1","x2","y2"],
				body: "(abs(x1-x2) + abs(y1-y2))/2"
			},
			{
				name: "edist",
				params: ["x1","y1","x2","y2"],
				body: "Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))"
			},
			{
				name: "mdist",
				params: ["x1","y1","x2","y2"],
				body: "abs(x1-x2) + abs(y1-y2)"
			},
			{
				name: "cdist",
				params: ["x1","y1","x2","y2"],
				body: "max(abs(x1-x2), abs(y1-y2))"
			}
		];

		function avg(...values: number[]) {
			let sum = 0;
			for (let value of values) {
				sum += value;
			}
			return sum / values.length;
		};

		function leti(...values: number[]) {
			let average = avg(...values);
			let sum = 0;
			for (let value of values) {
				sum += Math.pow(value - average, 2);
			}
			return sum / (values.length - 1);
		};

		function sd(...values: number[]) {
			return Math.sqrt(leti(...values));
		}

		function saes(value, key) {
			let sbox = {
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
				"1111": "0111",
			};

			let galois = [
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

			let prod = function(n1, n2): number {
				if (n1 <= 1 || n2 <= 1) return n1 * n2;
				return galois[n1 - 2][n2 - 2];
			};

			let pad = function(str, size): string {
				while (str.length < size) {
					str = "0" + str;
				}
				return str;
			}

			let nibble = function(value, index): number {
				let shift = 4 * (3 - index);
				let mask = 15 << shift;
				return (value & mask) >> shift;
			};

			let concat = function(n1, n2): number {
				return (n1 << 4) + n2;
			};

			let concat32 = function(n1, n2): number {
				return (n1 << 8) + n2;
			}

			let rotNib = function(value) {
				return concat(nibble(value, 3), nibble(value, 2));
			};

			let subNib = function(value) {
				let n1 = pad(nibble(value, 2).toString(2), 4);
				let n2 = pad(nibble(value, 3).toString(2), 4);
				let r1 = parseInt(sbox[n1], 2);
				let r2 = parseInt(sbox[n2], 2);
				return concat(r1, r2);
			};

			let subNib32 = function(value) {
				let n1 = pad(nibble(value, 0).toString(2), 4);
				let n2 = pad(nibble(value, 1).toString(2), 4);
				let n3 = pad(nibble(value, 2).toString(2), 4);
				let n4 = pad(nibble(value, 3).toString(2), 4);
				let r1 = parseInt(sbox[n1], 2);
				let r2 = parseInt(sbox[n2], 2);
				let r3 = parseInt(sbox[n3], 2);
				let r4 = parseInt(sbox[n4], 2);
				return concat32(concat(r1, r2), concat(r3, r4));
			};

			let nibbleSwap = function(value) {
				let n1 = nibble(value, 0);
				let n2 = nibble(value, 1);
				let n3 = nibble(value, 2);
				let n4 = nibble(value, 3);
				return concat32(concat(n1, n4), concat(n3, n2));
			}

			let formattedBinary = function(value, bitCount): string {
				let bin = pad(value.toString(2), bitCount);
				let result = "";
				for (let i = 0; i < bitCount; i++) {
					if (i > 0 && i % 4 == 0) {
						result += " ";
					}
					result += bin[i];
				}
				return result;
			}

			let c1 = parseInt("10000000", 2);
			let c2 = parseInt("110000", 2);

			let w0 = concat(nibble(key, 0), nibble(key, 1));
			let w1 = concat(nibble(key, 2), nibble(key, 3));
			let w2 = w0 ^ c1 ^ subNib(rotNib(w1));
			let w3 = w2 ^ w1;
			let w4 = w2 ^ c2 ^ subNib(rotNib(w3));
			let w5 = w4 ^ w3;

			let key0 = concat32(w0, w1);
			let key1 = concat32(w2, w3);
			let key2 = concat32(w4, w5);

			let round0 = value ^ key0;
			// round 1
			let round1 = subNib32(round0);
			round1 = nibbleSwap(round1);
			let S00 = prod(1, nibble(round1, 0)) ^ prod(4, nibble(round1, 2));
			let S10 = prod(4, nibble(round1, 0)) ^ prod(1, nibble(round1, 2));
			let S01 = prod(1, nibble(round1, 1)) ^ prod(4, nibble(round1, 3));
			let S11 = prod(4, nibble(round1, 1)) ^ prod(1, nibble(round1, 3));
			let S = concat32(concat(S00, S10), concat(S01, S11));
			round1 = S ^ key1;

			// round final
			let round2 = subNib32(round1);
			round2 = nibbleSwap(round2);
			round2 ^= key2;

			console.log("value = ", value, " (" + formattedBinary(value, 8) + ")");
			console.log("key = ", key, " (" + formattedBinary(key, 8) + ")");
			console.log("w0 = ", w0, " (" + formattedBinary(w0, 8) + ")");
			console.log("w1 = ", w1, " (" + formattedBinary(w1, 8) + ")");
			console.log("w2 = ", w2, " (" + formattedBinary(w2, 8) + ")");
			console.log("w3 = ", w3, " (" + formattedBinary(w3, 8) + ")");
			console.log("w4 = ", w4, " (" + formattedBinary(w4, 8) + ")");
			console.log("w5 = ", w5, " (" + formattedBinary(w5, 8) + ")");
			console.log("key0 = ", key0, " (" + formattedBinary(key0, 16) + ")");
			console.log("key1 = ", key1, " (" + formattedBinary(key1, 16) + ")");
			console.log("key2 = ", key2, " (" + formattedBinary(key2, 16) + ")");
			console.log("round0 = ", round0, " (" + formattedBinary(round0, 16) + ")");
			console.log("round1 = ", round1, " (" + formattedBinary(round1, 16) + ")");
			console.log("result = ", round2, " (" + formattedBinary(round2, 16) + ")");
			return formattedBinary(round2, 16);
		}

		let self = this;
		function help() {
			for (let fn of self.functions) {
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

		for (let fn of this.functions) {
			this.register(fn);
		}

		for (let name in this.builtin) {
			if (this.builtin.hasOwnProperty(name)) {
				window[name] = this.builtin[name];
			}
		}
	}

	private split(content: string, separator: string): string[] {
		if (content) {
			return content.split(separator);
		}
		return [];
	}

	private functions: Callable[] = [];
	private builtin: any;
	private ui: Interface;
	private lastCommand: string;
	private inputs: HTMLInputElement[];
}
