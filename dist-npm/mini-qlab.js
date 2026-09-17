import { useCallback as e, useEffect as t, useMemo as n, useRef as r, useState as i } from "react";
import { Fragment as a, jsx as o, jsxs as s } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var c = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region src/components/ActiveCuePanel.jsx
function l({ groups: e, open: t }) {
	if (!t) return null;
	let n = e.flatMap((e) => e.cues.filter((e) => e.status === "LIVE").map((t) => ({
		group: e.name,
		cue: t
	})));
	return /* @__PURE__ */ s("aside", {
		"aria-label": "Active cues",
		className: "w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 text-base shadow-sm lg:w-80 dark:border-slate-800 dark:bg-slate-900",
		children: [
			/* @__PURE__ */ o("h2", {
				className: "text-xl font-black",
				children: "Active cues"
			}),
			/* @__PURE__ */ o("p", {
				className: "mb-4 text-base text-slate-500",
				children: "Currently waiting to dispatch"
			}),
			n.length ? n.map(({ group: e, cue: t }) => /* @__PURE__ */ s("div", {
				className: "mb-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30",
				children: [/* @__PURE__ */ o("strong", { children: t.command || "Untitled cue" }), /* @__PURE__ */ s("p", {
					className: "text-sm",
					children: [
						e,
						" · ",
						t.progress,
						"%"
					]
				})]
			}, t.id)) : /* @__PURE__ */ o("p", {
				className: "rounded-lg border border-dashed border-slate-300 p-4 text-base text-slate-500 dark:border-slate-700",
				children: "No live cues"
			})
		]
	});
}
//#endregion
//#region src/lib/cueColumns.js
var u = [
	{
		id: "status",
		label: "Status",
		width: 96,
		min: 80
	},
	{
		id: "name",
		label: "Name",
		width: 160,
		min: 100
	},
	{
		id: "content",
		label: "Type / Content",
		width: 420,
		min: 300
	},
	{
		id: "hotkey",
		label: "HKey.",
		width: 90,
		min: 72
	},
	{
		id: "ltc",
		label: "LTC Trigger",
		width: 160,
		min: 120
	},
	{
		id: "clock",
		label: "Clock",
		width: 176,
		min: 130
	},
	{
		id: "before",
		label: "Before-wait(ms)",
		width: 152,
		min: 120
	},
	{
		id: "after",
		label: "After-wait(ms)",
		width: 152,
		min: 120
	},
	{
		id: "actions",
		label: "Actions",
		width: 208,
		min: 190
	}
], d = Object.fromEntries(u.map((e) => [e.id, e.width]));
function f(e) {
	let t = e && typeof e == "object" ? e : {};
	return Object.fromEntries(u.map((e) => {
		let n = Number(t[e.id]);
		return [e.id, Number.isFinite(n) && n >= e.min ? Math.round(n) : e.width];
	}));
}
function p(e, t) {
	let n = u.find((t) => t.id === e);
	if (!n) return null;
	let r = Number(t);
	return Number.isFinite(r) ? Math.max(n.min, Math.round(r)) : n.width;
}
function m(e) {
	return u.reduce((t, n) => t + (e[n.id] ?? n.width), 0);
}
//#endregion
//#region ../../../Library/pnpm/store/v11/links/@/cron-parser/5.10.0/6d72743d171964c9eadfc729c98f702d86491f16855dac974321e2362cf35d6f/node_modules/cron-parser/dist/fields/types.js
var h = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
})), g = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronField = void 0, e.CronField = class e {
		#e = !1;
		#t = !1;
		#n = !1;
		#r = [];
		options = { rawValue: "" };
		/* istanbul ignore next */ static get min() {
			/* istanbul ignore next */
			throw Error("min must be overridden");
		}
		/* istanbul ignore next */ static get max() {
			/* istanbul ignore next */
			throw Error("max must be overridden");
		}
		/* istanbul ignore next */ static get chars() {
			/* istanbul ignore next - this is overridden */
			return Object.freeze([]);
		}
		static get validChars() {
			return /^[?,*\dH/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
		}
		static get constraints() {
			return {
				min: this.min,
				max: this.max,
				chars: this.chars,
				validChars: this.validChars
			};
		}
		constructor(t, n = { rawValue: "" }) {
			if (!Array.isArray(t)) throw Error(`${this.constructor.name} Validation error, values is not an array`);
			if (!(t.length > 0)) throw Error(`${this.constructor.name} Validation error, values contains no values`);
			this.options = {
				...n,
				rawValue: n.rawValue ?? ""
			}, this.#r = [...t].sort(e.sorter), this.#n = this.options.wildcard === void 0 ? this.#i() : this.options.wildcard, this.#e = this.options.rawValue.includes("L") || t.includes("L"), this.#t = this.options.rawValue.includes("?") || t.includes("?");
		}
		get min() {
			return this.constructor.min;
		}
		get max() {
			return this.constructor.max;
		}
		get chars() {
			return this.constructor.chars;
		}
		get hasLastChar() {
			return this.#e;
		}
		get hasQuestionMarkChar() {
			return this.#t;
		}
		get isWildcard() {
			return this.#n;
		}
		get values() {
			return this.#r;
		}
		static sorter(e, t) {
			let n = typeof e == "number", r = typeof t == "number";
			return n && r ? e - t : !n && !r ? e.localeCompare(t) : n ? /* istanbul ignore next - A will always be a number until L-2 is supported */ -1 : 1;
		}
		static findNearestValueInList(e, t, n) {
			if (n) {
				for (let n = e.length - 1; n >= 0; n--) if (e[n] < t) return e[n];
				return null;
			}
			for (let n = 0; n < e.length; n++) if (e[n] > t) return e[n];
			return null;
		}
		findNearestValue(e, t) {
			return this.constructor.findNearestValueInList(this.values, e, t);
		}
		serialize() {
			return {
				wildcard: this.#n,
				values: this.#r
			};
		}
		validate() {
			let e, t = this.chars.length > 0 ? ` or chars ${this.chars.join("")}` : "", n = (e) => (t) => RegExp(`^\\d{0,2}${t}$`).test(e);
			if (!this.#r.every((t) => (e = t, typeof t == "number" ? t >= this.min && t <= this.max : this.chars.some(n(t))))) throw Error(`${this.constructor.name} Validation error, got value ${e} expected range ${this.min}-${this.max}${t}`);
			let r = this.#r.find((e, t) => this.#r.indexOf(e) !== t);
			if (r) throw Error(`${this.constructor.name} Validation error, duplicate values found: ${r}`);
		}
		#i() {
			return this.options.rawValue.length > 0 ? ["*", "?"].includes(this.options.rawValue) : Array.from({ length: this.max - this.min + 1 }, (e, t) => t + this.min).every((e) => this.#r.includes(e));
		}
	};
})), _ = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 });
	var t = class extends Error {}, n = class extends t {
		constructor(e) {
			super(`Invalid DateTime: ${e.toMessage()}`);
		}
	}, r = class extends t {
		constructor(e) {
			super(`Invalid Interval: ${e.toMessage()}`);
		}
	}, i = class extends t {
		constructor(e) {
			super(`Invalid Duration: ${e.toMessage()}`);
		}
	}, a = class extends t {}, o = class extends t {
		constructor(e) {
			super(`Invalid unit ${e}`);
		}
	}, s = class extends t {}, c = class extends t {
		constructor() {
			super("Zone is an abstract class");
		}
	}, l = "numeric", u = "short", d = "long", f = {
		year: l,
		month: l,
		day: l
	}, p = {
		year: l,
		month: u,
		day: l
	}, m = {
		year: l,
		month: u,
		day: l,
		weekday: u
	}, h = {
		year: l,
		month: d,
		day: l
	}, g = {
		year: l,
		month: d,
		day: l,
		weekday: d
	}, _ = {
		hour: l,
		minute: l
	}, v = {
		hour: l,
		minute: l,
		second: l
	}, y = {
		hour: l,
		minute: l,
		second: l,
		timeZoneName: u
	}, b = {
		hour: l,
		minute: l,
		second: l,
		timeZoneName: d
	}, x = {
		hour: l,
		minute: l,
		hourCycle: "h23"
	}, S = {
		hour: l,
		minute: l,
		second: l,
		hourCycle: "h23"
	}, C = {
		hour: l,
		minute: l,
		second: l,
		hourCycle: "h23",
		timeZoneName: u
	}, w = {
		hour: l,
		minute: l,
		second: l,
		hourCycle: "h23",
		timeZoneName: d
	}, T = {
		year: l,
		month: l,
		day: l,
		hour: l,
		minute: l
	}, E = {
		year: l,
		month: l,
		day: l,
		hour: l,
		minute: l,
		second: l
	}, D = {
		year: l,
		month: u,
		day: l,
		hour: l,
		minute: l
	}, ee = {
		year: l,
		month: u,
		day: l,
		hour: l,
		minute: l,
		second: l
	}, te = {
		year: l,
		month: u,
		day: l,
		weekday: u,
		hour: l,
		minute: l
	}, ne = {
		year: l,
		month: d,
		day: l,
		hour: l,
		minute: l,
		timeZoneName: u
	}, re = {
		year: l,
		month: d,
		day: l,
		hour: l,
		minute: l,
		second: l,
		timeZoneName: u
	}, ie = {
		year: l,
		month: d,
		day: l,
		weekday: d,
		hour: l,
		minute: l,
		timeZoneName: d
	}, ae = {
		year: l,
		month: d,
		day: l,
		weekday: d,
		hour: l,
		minute: l,
		second: l,
		timeZoneName: d
	}, O = class {
		get type() {
			throw new c();
		}
		get name() {
			throw new c();
		}
		get ianaName() {
			return this.name;
		}
		get isUniversal() {
			throw new c();
		}
		offsetName(e, t) {
			throw new c();
		}
		formatOffset(e, t) {
			throw new c();
		}
		offset(e) {
			throw new c();
		}
		equals(e) {
			throw new c();
		}
		get isValid() {
			throw new c();
		}
	}, oe = null, se = class e extends O {
		static get instance() {
			return oe === null && (oe = new e()), oe;
		}
		get type() {
			return "system";
		}
		get name() {
			return new Intl.DateTimeFormat().resolvedOptions().timeZone;
		}
		get isUniversal() {
			return !1;
		}
		offsetName(e, { format: t, locale: n }) {
			return At(e, t, n);
		}
		formatOffset(e, t) {
			return Pt(this.offset(e), t);
		}
		offset(e) {
			return -new Date(e).getTimezoneOffset();
		}
		equals(e) {
			return e.type === "system";
		}
		get isValid() {
			return !0;
		}
	}, k = /* @__PURE__ */ new Map();
	function A(e) {
		let t = k.get(e);
		return t === void 0 && (t = new Intl.DateTimeFormat("en-US", {
			hour12: !1,
			timeZone: e,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			era: "short"
		}), k.set(e, t)), t;
	}
	var ce = {
		year: 0,
		month: 1,
		day: 2,
		era: 3,
		hour: 4,
		minute: 5,
		second: 6
	};
	function le(e, t) {
		let n = e.format(t).replace(/\u200E/g, ""), [, r, i, a, o, s, c, l] = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(n);
		return [
			a,
			r,
			i,
			o,
			s,
			c,
			l
		];
	}
	function ue(e, t) {
		let n = e.formatToParts(t), r = [];
		for (let e = 0; e < n.length; e++) {
			let { type: t, value: i } = n[e], a = ce[t];
			t === "era" ? r[a] = i : G(a) || (r[a] = parseInt(i, 10));
		}
		return r;
	}
	var de = /* @__PURE__ */ new Map(), j = class e extends O {
		static create(t) {
			let n = de.get(t);
			return n === void 0 && de.set(t, n = new e(t)), n;
		}
		static resetCache() {
			de.clear(), k.clear();
		}
		static isValidSpecifier(e) {
			return this.isValidZone(e);
		}
		static isValidZone(e) {
			if (!e) return !1;
			try {
				return new Intl.DateTimeFormat("en-US", { timeZone: e }).format(), !0;
			} catch {
				return !1;
			}
		}
		constructor(t) {
			super(), this.zoneName = t, this.valid = e.isValidZone(t);
		}
		get type() {
			return "iana";
		}
		get name() {
			return this.zoneName;
		}
		get isUniversal() {
			return !1;
		}
		offsetName(e, { format: t, locale: n }) {
			return At(e, t, n, this.name);
		}
		formatOffset(e, t) {
			return Pt(this.offset(e), t);
		}
		offset(e) {
			if (!this.valid) return NaN;
			let t = new Date(e);
			if (isNaN(t)) return NaN;
			let n = A(this.name), [r, i, a, o, s, c, l] = n.formatToParts ? ue(n, t) : le(n, t);
			o === "BC" && (r = -Math.abs(r) + 1);
			let u = Et({
				year: r,
				month: i,
				day: a,
				hour: s === 24 ? 0 : s,
				minute: c,
				second: l,
				millisecond: 0
			}), d = +t, f = d % 1e3;
			return d -= f >= 0 ? f : 1e3 + f, (u - d) / 6e4;
		}
		equals(e) {
			return e.type === "iana" && e.name === this.name;
		}
		get isValid() {
			return this.valid;
		}
	}, M = {};
	function fe(e, t = {}) {
		let n = JSON.stringify([e, t]), r = M[n];
		return r || (r = new Intl.ListFormat(e, t), M[n] = r), r;
	}
	var pe = /* @__PURE__ */ new Map();
	function N(e, t = {}) {
		let n = JSON.stringify([e, t]), r = pe.get(n);
		return r === void 0 && (r = new Intl.DateTimeFormat(e, t), pe.set(n, r)), r;
	}
	var P = /* @__PURE__ */ new Map();
	function me(e, t = {}) {
		let n = JSON.stringify([e, t]), r = P.get(n);
		return r === void 0 && (r = new Intl.NumberFormat(e, t), P.set(n, r)), r;
	}
	var F = /* @__PURE__ */ new Map();
	function he(e, t = {}) {
		let { base: n, ...r } = t, i = JSON.stringify([e, r]), a = F.get(i);
		return a === void 0 && (a = new Intl.RelativeTimeFormat(e, t), F.set(i, a)), a;
	}
	var ge = null;
	function _e() {
		return ge || (ge = new Intl.DateTimeFormat().resolvedOptions().locale, ge);
	}
	var ve = /* @__PURE__ */ new Map();
	function ye(e) {
		let t = ve.get(e);
		return t === void 0 && (t = new Intl.DateTimeFormat(e).resolvedOptions(), ve.set(e, t)), t;
	}
	var be = /* @__PURE__ */ new Map();
	function xe(e) {
		let t = be.get(e);
		if (!t) {
			let n = new Intl.Locale(e);
			t = "getWeekInfo" in n ? n.getWeekInfo() : n.weekInfo, "minimalDays" in t || (t = {
				...ke,
				...t
			}), be.set(e, t);
		}
		return t;
	}
	function Se(e) {
		let t = e.indexOf("-x-");
		t !== -1 && (e = e.substring(0, t));
		let n = e.indexOf("-u-");
		if (n === -1) return [e];
		{
			let t, r;
			try {
				t = N(e).resolvedOptions(), r = e;
			} catch {
				let i = e.substring(0, n);
				t = N(i).resolvedOptions(), r = i;
			}
			let { numberingSystem: i, calendar: a } = t;
			return [
				r,
				i,
				a
			];
		}
	}
	function Ce(e, t, n) {
		return n || t ? (e.includes("-u-") || (e += "-u"), n && (e += `-ca-${n}`), t && (e += `-nu-${t}`), e) : e;
	}
	function I(e) {
		let t = [];
		for (let n = 1; n <= 12; n++) {
			let r = $.utc(2009, n, 1);
			t.push(e(r));
		}
		return t;
	}
	function we(e) {
		let t = [];
		for (let n = 1; n <= 7; n++) {
			let r = $.utc(2016, 11, 13 + n);
			t.push(e(r));
		}
		return t;
	}
	function L(e, t, n, r) {
		let i = e.listingMode();
		return i === "error" ? null : i === "en" ? n(t) : r(t);
	}
	function Te(e) {
		return e.numberingSystem && e.numberingSystem !== "latn" ? !1 : e.numberingSystem === "latn" || !e.locale || e.locale.startsWith("en") || ye(e.locale).numberingSystem === "latn";
	}
	var Ee = class {
		constructor(e, t, n) {
			this.padTo = n.padTo || 0, this.floor = n.floor || !1;
			let { padTo: r, floor: i, ...a } = n;
			if (!t || Object.keys(a).length > 0) {
				let t = {
					useGrouping: !1,
					...n
				};
				n.padTo > 0 && (t.minimumIntegerDigits = n.padTo), this.inf = me(e, t);
			}
		}
		format(e) {
			if (this.inf) {
				let t = this.floor ? Math.floor(e) : e;
				return this.inf.format(t);
			}
			return q(this.floor ? Math.floor(e) : St(e, 3), this.padTo);
		}
	}, De = class {
		constructor(e, t, n) {
			this.opts = n, this.originalZone = void 0;
			let r;
			if (this.opts.timeZone) this.dt = e;
			else if (e.zone.type === "fixed") {
				let t = -1 * (e.offset / 60), n = t >= 0 ? `Etc/GMT+${t}` : `Etc/GMT${t}`;
				e.offset !== 0 && j.create(n).valid ? (r = n, this.dt = e) : (r = "UTC", this.dt = e.offset === 0 ? e : e.setZone("UTC").plus({ minutes: e.offset }), this.originalZone = e.zone);
			} else e.zone.type === "system" ? this.dt = e : e.zone.type === "iana" ? (this.dt = e, r = e.zone.name) : (r = "UTC", this.dt = e.setZone("UTC").plus({ minutes: e.offset }), this.originalZone = e.zone);
			let i = { ...this.opts };
			i.timeZone = i.timeZone || r, this.dtf = N(t, i);
		}
		format() {
			return this.originalZone ? this.formatToParts().map(({ value: e }) => e).join("") : this.dtf.format(this.dt.toJSDate());
		}
		formatToParts() {
			let e = this.dtf.formatToParts(this.dt.toJSDate());
			return this.originalZone ? e.map((e) => {
				if (e.type === "timeZoneName") {
					let t = this.originalZone.offsetName(this.dt.ts, {
						locale: this.dt.locale,
						format: this.opts.timeZoneName
					});
					return {
						...e,
						value: t
					};
				}
				return e;
			}) : e;
		}
		resolvedOptions() {
			return this.dtf.resolvedOptions();
		}
	}, Oe = class {
		constructor(e, t, n) {
			this.opts = {
				style: "long",
				...n
			}, !t && dt() && (this.rtf = he(e, n));
		}
		format(e, t) {
			return this.rtf ? this.rtf.format(e, t) : $t(t, e, this.opts.numeric, this.opts.style !== "long");
		}
		formatToParts(e, t) {
			return this.rtf ? this.rtf.formatToParts(e, t) : [];
		}
	}, ke = {
		firstDay: 1,
		minimalDays: 4,
		weekend: [6, 7]
	}, R = class e {
		static fromOpts(t) {
			return e.create(t.locale, t.numberingSystem, t.outputCalendar, t.weekSettings, t.defaultToEN);
		}
		static create(t, n, r, i, a = !1) {
			let o = t || H.defaultLocale, s = o || (a ? "en-US" : _e()), c = n || H.defaultNumberingSystem, l = r || H.defaultOutputCalendar, u = _t(i) || H.defaultWeekSettings;
			return new e(s, c, l, u, o);
		}
		static resetCache() {
			ge = null, pe.clear(), P.clear(), F.clear(), ve.clear(), be.clear();
		}
		static fromObject({ locale: t, numberingSystem: n, outputCalendar: r, weekSettings: i } = {}) {
			return e.create(t, n, r, i);
		}
		constructor(e, t, n, r, i) {
			let [a, o, s] = Se(e);
			this.locale = a, this.numberingSystem = t || o || null, this.outputCalendar = n || s || null, this.weekSettings = r, this.intl = Ce(this.locale, this.numberingSystem, this.outputCalendar), this.weekdaysCache = {
				format: {},
				standalone: {}
			}, this.monthsCache = {
				format: {},
				standalone: {}
			}, this.meridiemCache = null, this.eraCache = {}, this.specifiedLocale = i, this.fastNumbersCached = null;
		}
		get fastNumbers() {
			return this.fastNumbersCached ??= Te(this), this.fastNumbersCached;
		}
		listingMode() {
			let e = this.isEnglish(), t = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
			return e && t ? "en" : "intl";
		}
		clone(t) {
			return !t || Object.getOwnPropertyNames(t).length === 0 ? this : e.create(t.locale || this.specifiedLocale, t.numberingSystem || this.numberingSystem, t.outputCalendar || this.outputCalendar, _t(t.weekSettings) || this.weekSettings, t.defaultToEN || !1);
		}
		redefaultToEN(e = {}) {
			return this.clone({
				...e,
				defaultToEN: !0
			});
		}
		redefaultToSystem(e = {}) {
			return this.clone({
				...e,
				defaultToEN: !1
			});
		}
		months(e, t = !1) {
			return L(this, e, zt, () => {
				let n = this.intl === "ja" || this.intl.startsWith("ja-");
				t &= !n;
				let r = t ? {
					month: e,
					day: "numeric"
				} : { month: e }, i = t ? "format" : "standalone";
				if (!this.monthsCache[i][e]) {
					let t = n ? (e) => this.dtFormatter(e, r).format() : (e) => this.extract(e, r, "month");
					this.monthsCache[i][e] = I(t);
				}
				return this.monthsCache[i][e];
			});
		}
		weekdays(e, t = !1) {
			return L(this, e, Ut, () => {
				let n = t ? {
					weekday: e,
					year: "numeric",
					month: "long",
					day: "numeric"
				} : { weekday: e }, r = t ? "format" : "standalone";
				return this.weekdaysCache[r][e] || (this.weekdaysCache[r][e] = we((e) => this.extract(e, n, "weekday"))), this.weekdaysCache[r][e];
			});
		}
		meridiems() {
			return L(this, void 0, () => Wt, () => {
				if (!this.meridiemCache) {
					let e = {
						hour: "numeric",
						hourCycle: "h12"
					};
					this.meridiemCache = [$.utc(2016, 11, 13, 9), $.utc(2016, 11, 13, 19)].map((t) => this.extract(t, e, "dayperiod"));
				}
				return this.meridiemCache;
			});
		}
		eras(e) {
			return L(this, e, Jt, () => {
				let t = { era: e };
				return this.eraCache[e] || (this.eraCache[e] = [$.utc(-40, 1, 1), $.utc(2017, 1, 1)].map((e) => this.extract(e, t, "era"))), this.eraCache[e];
			});
		}
		extract(e, t, n) {
			let r = this.dtFormatter(e, t).formatToParts().find((e) => e.type.toLowerCase() === n);
			return r ? r.value : null;
		}
		numberFormatter(e = {}) {
			return new Ee(this.intl, e.forceSimple || this.fastNumbers, e);
		}
		dtFormatter(e, t = {}) {
			return new De(e, this.intl, t);
		}
		relFormatter(e = {}) {
			return new Oe(this.intl, this.isEnglish(), e);
		}
		listFormatter(e = {}) {
			return fe(this.intl, e);
		}
		isEnglish() {
			return this.locale === "en" || this.locale.toLowerCase() === "en-us" || ye(this.intl).locale.startsWith("en-us");
		}
		getWeekSettings() {
			return this.weekSettings ? this.weekSettings : ft() ? xe(this.locale) : ke;
		}
		getStartOfWeek() {
			return this.getWeekSettings().firstDay;
		}
		getMinDaysInFirstWeek() {
			return this.getWeekSettings().minimalDays;
		}
		getWeekendDays() {
			return this.getWeekSettings().weekend;
		}
		equals(e) {
			return this.locale === e.locale && this.numberingSystem === e.numberingSystem && this.outputCalendar === e.outputCalendar;
		}
		toString() {
			return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
		}
	}, Ae = null, z = class e extends O {
		static get utcInstance() {
			return Ae === null && (Ae = new e(0)), Ae;
		}
		static instance(t) {
			return t === 0 ? e.utcInstance : new e(t);
		}
		static parseSpecifier(t) {
			if (t) {
				let n = t.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
				if (n) return new e(jt(n[1], n[2]));
			}
			return null;
		}
		constructor(e) {
			super(), this.fixed = e;
		}
		get type() {
			return "fixed";
		}
		get name() {
			return this.fixed === 0 ? "UTC" : `UTC${Pt(this.fixed, "narrow")}`;
		}
		get ianaName() {
			return this.fixed === 0 ? "Etc/UTC" : `Etc/GMT${Pt(-this.fixed, "narrow")}`;
		}
		offsetName() {
			return this.name;
		}
		formatOffset(e, t) {
			return Pt(this.fixed, t);
		}
		get isUniversal() {
			return !0;
		}
		offset() {
			return this.fixed;
		}
		equals(e) {
			return e.type === "fixed" && e.fixed === this.fixed;
		}
		get isValid() {
			return !0;
		}
	}, je = class extends O {
		constructor(e) {
			super(), this.zoneName = e;
		}
		get type() {
			return "invalid";
		}
		get name() {
			return this.zoneName;
		}
		get isUniversal() {
			return !1;
		}
		offsetName() {
			return null;
		}
		formatOffset() {
			return "";
		}
		offset() {
			return NaN;
		}
		equals() {
			return !1;
		}
		get isValid() {
			return !1;
		}
	};
	function Me(e, t) {
		if (G(e) || e === null) return t;
		if (e instanceof O) return e;
		if (lt(e)) {
			let n = e.toLowerCase();
			return n === "default" ? t : n === "local" || n === "system" ? se.instance : n === "utc" || n === "gmt" ? z.utcInstance : z.parseSpecifier(n) || j.create(e);
		}
		return st(e) ? z.instance(e) : typeof e == "object" && "offset" in e && typeof e.offset == "function" ? e : new je(e);
	}
	var Ne = {
		arab: "[٠-٩]",
		arabext: "[۰-۹]",
		bali: "[᭐-᭙]",
		beng: "[০-৯]",
		deva: "[०-९]",
		fullwide: "[０-９]",
		gujr: "[૦-૯]",
		hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
		khmr: "[០-៩]",
		knda: "[೦-೯]",
		laoo: "[໐-໙]",
		limb: "[᥆-᥏]",
		mlym: "[൦-൯]",
		mong: "[᠐-᠙]",
		mymr: "[၀-၉]",
		orya: "[୦-୯]",
		tamldec: "[௦-௯]",
		telu: "[౦-౯]",
		thai: "[๐-๙]",
		tibt: "[༠-༩]",
		latn: "\\d"
	}, Pe = {
		arab: [1632, 1641],
		arabext: [1776, 1785],
		bali: [6992, 7001],
		beng: [2534, 2543],
		deva: [2406, 2415],
		fullwide: [65296, 65303],
		gujr: [2790, 2799],
		khmr: [6112, 6121],
		knda: [3302, 3311],
		laoo: [3792, 3801],
		limb: [6470, 6479],
		mlym: [3430, 3439],
		mong: [6160, 6169],
		mymr: [4160, 4169],
		orya: [2918, 2927],
		tamldec: [3046, 3055],
		telu: [3174, 3183],
		thai: [3664, 3673],
		tibt: [3872, 3881]
	}, Fe = Ne.hanidec.replace(/[\[|\]]/g, "").split("");
	function Ie(e) {
		let t = parseInt(e, 10);
		if (isNaN(t)) {
			t = "";
			for (let n = 0; n < e.length; n++) {
				let r = e.charCodeAt(n);
				if (e[n].search(Ne.hanidec) !== -1) t += Fe.indexOf(e[n]);
				else for (let e in Pe) {
					let [n, i] = Pe[e];
					r >= n && r <= i && (t += r - n);
				}
			}
			return parseInt(t, 10);
		}
		return t;
	}
	var Le = /* @__PURE__ */ new Map();
	function Re() {
		Le.clear();
	}
	function B({ numberingSystem: e }, t = "") {
		let n = e || "latn", r = Le.get(n);
		r === void 0 && (r = /* @__PURE__ */ new Map(), Le.set(n, r));
		let i = r.get(t);
		return i === void 0 && (i = RegExp(`${Ne[n]}${t}`), r.set(t, i)), i;
	}
	var V = () => Date.now(), ze = "system", Be = null, Ve = null, He = null, Ue = 60, We, Ge = null, H = class {
		static get now() {
			return V;
		}
		static set now(e) {
			V = e;
		}
		static set defaultZone(e) {
			ze = e;
		}
		static get defaultZone() {
			return Me(ze, se.instance);
		}
		static get defaultLocale() {
			return Be;
		}
		static set defaultLocale(e) {
			Be = e;
		}
		static get defaultNumberingSystem() {
			return Ve;
		}
		static set defaultNumberingSystem(e) {
			Ve = e;
		}
		static get defaultOutputCalendar() {
			return He;
		}
		static set defaultOutputCalendar(e) {
			He = e;
		}
		static get defaultWeekSettings() {
			return Ge;
		}
		static set defaultWeekSettings(e) {
			Ge = _t(e);
		}
		static get twoDigitCutoffYear() {
			return Ue;
		}
		static set twoDigitCutoffYear(e) {
			Ue = e % 100;
		}
		static get throwOnInvalid() {
			return We;
		}
		static set throwOnInvalid(e) {
			We = e;
		}
		static resetCaches() {
			R.resetCache(), j.resetCache(), $.resetCache(), Re();
		}
	}, U = class {
		constructor(e, t) {
			this.reason = e, this.explanation = t;
		}
		toMessage() {
			return this.explanation ? `${this.reason}: ${this.explanation}` : this.reason;
		}
	}, Ke = [
		0,
		31,
		59,
		90,
		120,
		151,
		181,
		212,
		243,
		273,
		304,
		334
	], qe = [
		0,
		31,
		60,
		91,
		121,
		152,
		182,
		213,
		244,
		274,
		305,
		335
	];
	function W(e, t) {
		return new U("unit out of range", `you specified ${t} (of type ${typeof t}) as a ${e}, which is invalid`);
	}
	function Je(e, t, n) {
		let r = new Date(Date.UTC(e, t - 1, n));
		e < 100 && e >= 0 && r.setUTCFullYear(r.getUTCFullYear() - 1900);
		let i = r.getUTCDay();
		return i === 0 ? 7 : i;
	}
	function Ye(e, t, n) {
		return n + (Ct(e) ? qe : Ke)[t - 1];
	}
	function Xe(e, t) {
		let n = Ct(e) ? qe : Ke, r = n.findIndex((e) => e < t), i = t - n[r];
		return {
			month: r + 1,
			day: i
		};
	}
	function Ze(e, t) {
		return (e - t + 7) % 7 + 1;
	}
	function Qe(e, t = 4, n = 1) {
		let { year: r, month: i, day: a } = e, o = Ye(r, i, a), s = Ze(Je(r, i, a), n), c = Math.floor((o - s + 14 - t) / 7), l;
		return c < 1 ? (l = r - 1, c = Ot(l, t, n)) : c > Ot(r, t, n) ? (l = r + 1, c = 1) : l = r, {
			weekYear: l,
			weekNumber: c,
			weekday: s,
			...Ft(e)
		};
	}
	function $e(e, t = 4, n = 1) {
		let { weekYear: r, weekNumber: i, weekday: a } = e, o = Ze(Je(r, 1, t), n), s = wt(r), c = i * 7 + a - o - 7 + t, l;
		c < 1 ? (l = r - 1, c += wt(l)) : c > s ? (l = r + 1, c -= wt(r)) : l = r;
		let { month: u, day: d } = Xe(l, c);
		return {
			year: l,
			month: u,
			day: d,
			...Ft(e)
		};
	}
	function et(e) {
		let { year: t, month: n, day: r } = e;
		return {
			year: t,
			ordinal: Ye(t, n, r),
			...Ft(e)
		};
	}
	function tt(e) {
		let { year: t, ordinal: n } = e, { month: r, day: i } = Xe(t, n);
		return {
			year: t,
			month: r,
			day: i,
			...Ft(e)
		};
	}
	function nt(e, t) {
		if (!G(e.localWeekday) || !G(e.localWeekNumber) || !G(e.localWeekYear)) {
			if (!G(e.weekday) || !G(e.weekNumber) || !G(e.weekYear)) throw new a("Cannot mix locale-based week fields with ISO-based week fields");
			return G(e.localWeekday) || (e.weekday = e.localWeekday), G(e.localWeekNumber) || (e.weekNumber = e.localWeekNumber), G(e.localWeekYear) || (e.weekYear = e.localWeekYear), delete e.localWeekday, delete e.localWeekNumber, delete e.localWeekYear, {
				minDaysInFirstWeek: t.getMinDaysInFirstWeek(),
				startOfWeek: t.getStartOfWeek()
			};
		}
		return {
			minDaysInFirstWeek: 4,
			startOfWeek: 1
		};
	}
	function rt(e, t = 4, n = 1) {
		let r = ct(e.weekYear), i = K(e.weekNumber, 1, Ot(e.weekYear, t, n)), a = K(e.weekday, 1, 7);
		return r ? i ? !a && W("weekday", e.weekday) : W("week", e.weekNumber) : W("weekYear", e.weekYear);
	}
	function it(e) {
		let t = ct(e.year), n = K(e.ordinal, 1, wt(e.year));
		return t ? !n && W("ordinal", e.ordinal) : W("year", e.year);
	}
	function at(e) {
		let t = ct(e.year), n = K(e.month, 1, 12), r = K(e.day, 1, Tt(e.year, e.month));
		return t ? n ? !r && W("day", e.day) : W("month", e.month) : W("year", e.year);
	}
	function ot(e) {
		let { hour: t, minute: n, second: r, millisecond: i } = e, a = K(t, 0, 23) || t === 24 && n === 0 && r === 0 && i === 0, o = K(n, 0, 59), s = K(r, 0, 59), c = K(i, 0, 999);
		return a ? o ? s ? !c && W("millisecond", i) : W("second", r) : W("minute", n) : W("hour", t);
	}
	function G(e) {
		return e === void 0;
	}
	function st(e) {
		return typeof e == "number";
	}
	function ct(e) {
		return typeof e == "number" && e % 1 == 0;
	}
	function lt(e) {
		return typeof e == "string";
	}
	function ut(e) {
		return Object.prototype.toString.call(e) === "[object Date]";
	}
	function dt() {
		try {
			return typeof Intl < "u" && !!Intl.RelativeTimeFormat;
		} catch {
			return !1;
		}
	}
	function ft() {
		try {
			return typeof Intl < "u" && !!Intl.Locale && ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype);
		} catch {
			return !1;
		}
	}
	function pt(e) {
		return Array.isArray(e) ? e : [e];
	}
	function mt(e, t, n) {
		if (e.length !== 0) return e.reduce((e, r) => {
			let i = [t(r), r];
			return e && n(e[0], i[0]) === e[0] ? e : i;
		}, null)[1];
	}
	function ht(e, t) {
		return t.reduce((t, n) => (t[n] = e[n], t), {});
	}
	function gt(e, t) {
		return Object.prototype.hasOwnProperty.call(e, t);
	}
	function _t(e) {
		if (e == null) return null;
		if (typeof e != "object") throw new s("Week settings must be an object");
		if (!K(e.firstDay, 1, 7) || !K(e.minimalDays, 1, 7) || !Array.isArray(e.weekend) || e.weekend.some((e) => !K(e, 1, 7))) throw new s("Invalid week settings");
		return {
			firstDay: e.firstDay,
			minimalDays: e.minimalDays,
			weekend: Array.from(e.weekend)
		};
	}
	function K(e, t, n) {
		return ct(e) && e >= t && e <= n;
	}
	function vt(e, t) {
		return e - t * Math.floor(e / t);
	}
	function q(e, t = 2) {
		let n = e < 0, r;
		return r = n ? "-" + ("" + -e).padStart(t, "0") : ("" + e).padStart(t, "0"), r;
	}
	function yt(e) {
		if (!(G(e) || e === null || e === "")) return parseInt(e, 10);
	}
	function bt(e) {
		if (!(G(e) || e === null || e === "")) return parseFloat(e);
	}
	function xt(e) {
		if (!(G(e) || e === null || e === "")) {
			let t = parseFloat("0." + e) * 1e3;
			return Math.floor(t);
		}
	}
	function St(e, t, n = "round") {
		let r = 10 ** t;
		switch (n) {
			case "expand": return e > 0 ? Math.ceil(e * r) / r : Math.floor(e * r) / r;
			case "trunc": return Math.trunc(e * r) / r;
			case "round": return Math.round(e * r) / r;
			case "floor": return Math.floor(e * r) / r;
			case "ceil": return Math.ceil(e * r) / r;
			default: throw RangeError(`Value rounding ${n} is out of range`);
		}
	}
	function Ct(e) {
		return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
	}
	function wt(e) {
		return Ct(e) ? 366 : 365;
	}
	function Tt(e, t) {
		let n = vt(t - 1, 12) + 1, r = e + (t - n) / 12;
		return n === 2 ? Ct(r) ? 29 : 28 : [
			31,
			null,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31
		][n - 1];
	}
	function Et(e) {
		let t = Date.UTC(e.year, e.month - 1, e.day, e.hour, e.minute, e.second, e.millisecond);
		return e.year < 100 && e.year >= 0 && (t = new Date(t), t.setUTCFullYear(e.year, e.month - 1, e.day)), +t;
	}
	function Dt(e, t, n) {
		return -Ze(Je(e, 1, t), n) + t - 1;
	}
	function Ot(e, t = 4, n = 1) {
		let r = Dt(e, t, n), i = Dt(e + 1, t, n);
		return (wt(e) - r + i) / 7;
	}
	function kt(e) {
		return e > 99 ? e : e > H.twoDigitCutoffYear ? 1900 + e : 2e3 + e;
	}
	function At(e, t, n, r = null) {
		let i = new Date(e), a = {
			hourCycle: "h23",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		};
		r && (a.timeZone = r);
		let o = {
			timeZoneName: t,
			...a
		}, s = new Intl.DateTimeFormat(n, o).formatToParts(i).find((e) => e.type.toLowerCase() === "timezonename");
		return s ? s.value : null;
	}
	function jt(e, t) {
		let n = parseInt(e, 10);
		Number.isNaN(n) && (n = 0);
		let r = parseInt(t, 10) || 0, i = n < 0 || Object.is(n, -0) ? -r : r;
		return n * 60 + i;
	}
	function Mt(e) {
		let t = Number(e);
		if (typeof e == "boolean" || e === "" || !Number.isFinite(t)) throw new s(`Invalid unit value ${e}`);
		return t;
	}
	function Nt(e, t) {
		let n = {};
		for (let r in e) if (gt(e, r)) {
			let i = e[r];
			if (i == null) continue;
			n[t(r)] = Mt(i);
		}
		return n;
	}
	function Pt(e, t) {
		let n = Math.trunc(Math.abs(e / 60)), r = Math.trunc(Math.abs(e % 60)), i = e >= 0 ? "+" : "-";
		switch (t) {
			case "short": return `${i}${q(n, 2)}:${q(r, 2)}`;
			case "narrow": return `${i}${n}${r > 0 ? `:${r}` : ""}`;
			case "techie": return `${i}${q(n, 2)}${q(r, 2)}`;
			default: throw RangeError(`Value format ${t} is out of range for property format`);
		}
	}
	function Ft(e) {
		return ht(e, [
			"hour",
			"minute",
			"second",
			"millisecond"
		]);
	}
	var It = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	], Lt = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	], Rt = [
		"J",
		"F",
		"M",
		"A",
		"M",
		"J",
		"J",
		"A",
		"S",
		"O",
		"N",
		"D"
	];
	function zt(e) {
		switch (e) {
			case "narrow": return [...Rt];
			case "short": return [...Lt];
			case "long": return [...It];
			case "numeric": return [
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"10",
				"11",
				"12"
			];
			case "2-digit": return [
				"01",
				"02",
				"03",
				"04",
				"05",
				"06",
				"07",
				"08",
				"09",
				"10",
				"11",
				"12"
			];
			default: return null;
		}
	}
	var Bt = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday"
	], Vt = [
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat",
		"Sun"
	], Ht = [
		"M",
		"T",
		"W",
		"T",
		"F",
		"S",
		"S"
	];
	function Ut(e) {
		switch (e) {
			case "narrow": return [...Ht];
			case "short": return [...Vt];
			case "long": return [...Bt];
			case "numeric": return [
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7"
			];
			default: return null;
		}
	}
	var Wt = ["AM", "PM"], Gt = ["Before Christ", "Anno Domini"], Kt = ["BC", "AD"], qt = ["B", "A"];
	function Jt(e) {
		switch (e) {
			case "narrow": return [...qt];
			case "short": return [...Kt];
			case "long": return [...Gt];
			default: return null;
		}
	}
	function Yt(e) {
		return Wt[e.hour < 12 ? 0 : 1];
	}
	function Xt(e, t) {
		return Ut(t)[e.weekday - 1];
	}
	function Zt(e, t) {
		return zt(t)[e.month - 1];
	}
	function Qt(e, t) {
		return Jt(t)[e.year < 0 ? 0 : 1];
	}
	function $t(e, t, n = "always", r = !1) {
		let i = {
			years: ["year", "yr."],
			quarters: ["quarter", "qtr."],
			months: ["month", "mo."],
			weeks: ["week", "wk."],
			days: [
				"day",
				"day",
				"days"
			],
			hours: ["hour", "hr."],
			minutes: ["minute", "min."],
			seconds: ["second", "sec."]
		}, a = [
			"hours",
			"minutes",
			"seconds"
		].indexOf(e) === -1;
		if (n === "auto" && a) {
			let n = e === "days";
			switch (t) {
				case 1: return n ? "tomorrow" : `next ${i[e][0]}`;
				case -1: return n ? "yesterday" : `last ${i[e][0]}`;
				case 0: return n ? "today" : `this ${i[e][0]}`;
			}
		}
		let o = Object.is(t, -0) || t < 0, s = Math.abs(t), c = s === 1, l = i[e], u = r ? c ? l[1] : l[2] || l[1] : c ? i[e][0] : e;
		return o ? `${s} ${u} ago` : `in ${s} ${u}`;
	}
	function en(e, t) {
		let n = "";
		for (let r of e) r.literal ? n += r.val : n += t(r.val);
		return n;
	}
	var tn = {
		D: f,
		DD: p,
		DDD: h,
		DDDD: g,
		t: _,
		tt: v,
		ttt: y,
		tttt: b,
		T: x,
		TT: S,
		TTT: C,
		TTTT: w,
		f: T,
		ff: D,
		fff: ne,
		ffff: ie,
		F: E,
		FF: ee,
		FFF: re,
		FFFF: ae
	}, J = class e {
		static create(t, n = {}) {
			return new e(t, n);
		}
		static parseFormat(e) {
			let t = null, n = "", r = !1, i = [];
			for (let a = 0; a < e.length; a++) {
				let o = e.charAt(a);
				o === "'" ? ((n.length > 0 || r) && i.push({
					literal: r || /^\s+$/.test(n),
					val: n === "" ? "'" : n
				}), t = null, n = "", r = !r) : r || o === t ? n += o : (n.length > 0 && i.push({
					literal: /^\s+$/.test(n),
					val: n
				}), n = o, t = o);
			}
			return n.length > 0 && i.push({
				literal: r || /^\s+$/.test(n),
				val: n
			}), i;
		}
		static macroTokenToFormatOpts(e) {
			return tn[e];
		}
		constructor(e, t) {
			this.opts = t, this.loc = e, this.systemLoc = null;
		}
		formatWithSystemDefault(e, t) {
			return this.systemLoc === null && (this.systemLoc = this.loc.redefaultToSystem()), this.systemLoc.dtFormatter(e, {
				...this.opts,
				...t
			}).format();
		}
		dtFormatter(e, t = {}) {
			return this.loc.dtFormatter(e, {
				...this.opts,
				...t
			});
		}
		formatDateTime(e, t) {
			return this.dtFormatter(e, t).format();
		}
		formatDateTimeParts(e, t) {
			return this.dtFormatter(e, t).formatToParts();
		}
		formatInterval(e, t) {
			return this.dtFormatter(e.start, t).dtf.formatRange(e.start.toJSDate(), e.end.toJSDate());
		}
		resolvedOptions(e, t) {
			return this.dtFormatter(e, t).resolvedOptions();
		}
		num(e, t = 0, n = void 0) {
			if (this.opts.forceSimple) return q(e, t);
			let r = { ...this.opts };
			return t > 0 && (r.padTo = t), n && (r.signDisplay = n), this.loc.numberFormatter(r).format(e);
		}
		formatDateTimeFromString(t, n) {
			let r = this.loc.listingMode() === "en", i = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", a = (e, n) => this.loc.extract(t, e, n), o = (e) => t.isOffsetFixed && t.offset === 0 && e.allowZ ? "Z" : t.isValid ? t.zone.formatOffset(t.ts, e.format) : "", s = () => r ? Yt(t) : a({
				hour: "numeric",
				hourCycle: "h12"
			}, "dayperiod"), c = (e, n) => r ? Zt(t, e) : a(n ? { month: e } : {
				month: e,
				day: "numeric"
			}, "month"), l = (e, n) => r ? Xt(t, e) : a(n ? { weekday: e } : {
				weekday: e,
				month: "long",
				day: "numeric"
			}, "weekday"), u = (n) => {
				let r = e.macroTokenToFormatOpts(n);
				return r ? this.formatWithSystemDefault(t, r) : n;
			}, d = (e) => r ? Qt(t, e) : a({ era: e }, "era");
			return en(e.parseFormat(n), (e) => {
				switch (e) {
					case "S": return this.num(t.millisecond);
					case "u":
					case "SSS": return this.num(t.millisecond, 3);
					case "s": return this.num(t.second);
					case "ss": return this.num(t.second, 2);
					case "uu": return this.num(Math.floor(t.millisecond / 10), 2);
					case "uuu": return this.num(Math.floor(t.millisecond / 100));
					case "m": return this.num(t.minute);
					case "mm": return this.num(t.minute, 2);
					case "h": return this.num(t.hour % 12 == 0 ? 12 : t.hour % 12);
					case "hh": return this.num(t.hour % 12 == 0 ? 12 : t.hour % 12, 2);
					case "H": return this.num(t.hour);
					case "HH": return this.num(t.hour, 2);
					case "Z": return o({
						format: "narrow",
						allowZ: this.opts.allowZ
					});
					case "ZZ": return o({
						format: "short",
						allowZ: this.opts.allowZ
					});
					case "ZZZ": return o({
						format: "techie",
						allowZ: this.opts.allowZ
					});
					case "ZZZZ": return t.zone.offsetName(t.ts, {
						format: "short",
						locale: this.loc.locale
					});
					case "ZZZZZ": return t.zone.offsetName(t.ts, {
						format: "long",
						locale: this.loc.locale
					});
					case "z": return t.zoneName;
					case "a": return s();
					case "d": return i ? a({ day: "numeric" }, "day") : this.num(t.day);
					case "dd": return i ? a({ day: "2-digit" }, "day") : this.num(t.day, 2);
					case "c": return this.num(t.weekday);
					case "ccc": return l("short", !0);
					case "cccc": return l("long", !0);
					case "ccccc": return l("narrow", !0);
					case "E": return this.num(t.weekday);
					case "EEE": return l("short", !1);
					case "EEEE": return l("long", !1);
					case "EEEEE": return l("narrow", !1);
					case "L": return i ? a({
						month: "numeric",
						day: "numeric"
					}, "month") : this.num(t.month);
					case "LL": return i ? a({
						month: "2-digit",
						day: "numeric"
					}, "month") : this.num(t.month, 2);
					case "LLL": return c("short", !0);
					case "LLLL": return c("long", !0);
					case "LLLLL": return c("narrow", !0);
					case "M": return i ? a({ month: "numeric" }, "month") : this.num(t.month);
					case "MM": return i ? a({ month: "2-digit" }, "month") : this.num(t.month, 2);
					case "MMM": return c("short", !1);
					case "MMMM": return c("long", !1);
					case "MMMMM": return c("narrow", !1);
					case "y": return i ? a({ year: "numeric" }, "year") : this.num(t.year);
					case "yy": return i ? a({ year: "2-digit" }, "year") : this.num(t.year.toString().slice(-2), 2);
					case "yyyy": return i ? a({ year: "numeric" }, "year") : this.num(t.year, 4);
					case "yyyyyy": return i ? a({ year: "numeric" }, "year") : this.num(t.year, 6);
					case "G": return d("short");
					case "GG": return d("long");
					case "GGGGG": return d("narrow");
					case "kk": return this.num(t.weekYear.toString().slice(-2), 2);
					case "kkkk": return this.num(t.weekYear, 4);
					case "W": return this.num(t.weekNumber);
					case "WW": return this.num(t.weekNumber, 2);
					case "n": return this.num(t.localWeekNumber);
					case "nn": return this.num(t.localWeekNumber, 2);
					case "ii": return this.num(t.localWeekYear.toString().slice(-2), 2);
					case "iiii": return this.num(t.localWeekYear, 4);
					case "o": return this.num(t.ordinal);
					case "ooo": return this.num(t.ordinal, 3);
					case "q": return this.num(t.quarter);
					case "qq": return this.num(t.quarter, 2);
					case "X": return this.num(Math.floor(t.ts / 1e3));
					case "x": return this.num(t.ts);
					default: return u(e);
				}
			});
		}
		formatDurationFromString(t, n) {
			let r = this.opts.signMode === "negativeLargestOnly" ? -1 : 1, i = (e) => {
				switch (e[0]) {
					case "S": return "milliseconds";
					case "s": return "seconds";
					case "m": return "minutes";
					case "h": return "hours";
					case "d": return "days";
					case "w": return "weeks";
					case "M": return "months";
					case "y": return "years";
					default: return null;
				}
			}, a = (e, t) => (n) => {
				let a = i(n);
				if (a) {
					let i = t.isNegativeDuration && a !== t.largestUnit ? r : 1, o;
					return o = this.opts.signMode === "negativeLargestOnly" && a !== t.largestUnit ? "never" : this.opts.signMode === "all" ? "always" : "auto", this.num(e.get(a) * i, n.length, o);
				}
				return n;
			}, o = e.parseFormat(n), s = o.reduce((e, { literal: t, val: n }) => t ? e : e.concat(n), []), c = t.shiftTo(...s.map(i).filter((e) => e));
			return en(o, a(c, {
				isNegativeDuration: c < 0,
				largestUnit: Object.keys(c.values)[0]
			}));
		}
	}, nn = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
	function rn(...e) {
		let t = e.reduce((e, t) => e + t.source, "");
		return RegExp(`^${t}$`);
	}
	function an(...e) {
		return (t) => e.reduce(([e, n, r], i) => {
			let [a, o, s] = i(t, r);
			return [
				{
					...e,
					...a
				},
				o || n,
				s
			];
		}, [
			{},
			null,
			1
		]).slice(0, 2);
	}
	function on(e, ...t) {
		if (e == null) return [null, null];
		for (let [n, r] of t) {
			let t = n.exec(e);
			if (t) return r(t);
		}
		return [null, null];
	}
	function sn(...e) {
		return (t, n) => {
			let r = {}, i = 0;
			for (; i < e.length; i++) r[e[i]] = yt(t[n + i]);
			return [
				r,
				null,
				n + i
			];
		};
	}
	var cn = /(?:([Zz])|([+-]\d\d)(?::?(\d\d))?)/, ln = `(?:${cn.source}?(?:\\[(${nn.source})\\])?)?`, un = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/, dn = RegExp(`${un.source}${ln}`), fn = RegExp(`(?:[Tt]${dn.source})?`), pn = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/, mn = /(\d{4})-?W(\d\d)(?:-?(\d))?/, hn = /(\d{4})-?(\d{3})/, gn = sn("weekYear", "weekNumber", "weekDay"), _n = sn("year", "ordinal"), vn = /(\d{4})-(\d\d)-(\d\d)/, yn = RegExp(`${un.source} ?(?:${cn.source}|(${nn.source}))?`), bn = RegExp(`(?: ${yn.source})?`);
	function xn(e, t, n) {
		let r = e[t];
		return G(r) ? n : yt(r);
	}
	function Sn(e, t) {
		return [
			{
				year: xn(e, t),
				month: xn(e, t + 1, 1),
				day: xn(e, t + 2, 1)
			},
			null,
			t + 3
		];
	}
	function Cn(e, t) {
		return [
			{
				hours: xn(e, t, 0),
				minutes: xn(e, t + 1, 0),
				seconds: xn(e, t + 2, 0),
				milliseconds: xt(e[t + 3])
			},
			null,
			t + 4
		];
	}
	function wn(e, t) {
		let n = !e[t] && !e[t + 1], r = jt(e[t + 1], e[t + 2]);
		return [
			{},
			n ? null : z.instance(r),
			t + 3
		];
	}
	function Tn(e, t) {
		return [
			{},
			e[t] ? j.create(e[t]) : null,
			t + 1
		];
	}
	var En = RegExp(`^T?${un.source}$`), Dn = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
	function On(e) {
		let [t, n, r, i, a, o, s, c, l] = e, u = t[0] === "-", d = c && c[0] === "-", f = (e, t = !1) => e !== void 0 && (t || e && u) ? -e : e;
		return [{
			years: f(bt(n)),
			months: f(bt(r)),
			weeks: f(bt(i)),
			days: f(bt(a)),
			hours: f(bt(o)),
			minutes: f(bt(s)),
			seconds: f(bt(c), c === "-0"),
			milliseconds: f(xt(l), d)
		}];
	}
	var kn = {
		GMT: 0,
		EDT: -240,
		EST: -300,
		CDT: -300,
		CST: -360,
		MDT: -360,
		MST: -420,
		PDT: -420,
		PST: -480
	};
	function An(e, t, n, r, i, a, o) {
		let s = {
			year: t.length === 2 ? kt(yt(t)) : yt(t),
			month: Lt.indexOf(n) + 1,
			day: yt(r),
			hour: yt(i),
			minute: yt(a)
		};
		return o && (s.second = yt(o)), e && (s.weekday = e.length > 3 ? Bt.indexOf(e) + 1 : Vt.indexOf(e) + 1), s;
	}
	var jn = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
	function Mn(e) {
		let [, t, n, r, i, a, o, s, c, l, u, d] = e, f = An(t, i, r, n, a, o, s), p;
		return p = c ? kn[c] : l ? 0 : jt(u, d), [f, new z(p)];
	}
	function Nn(e) {
		return e.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
	}
	var Pn = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/, Fn = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/, In = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
	function Ln(e) {
		let [, t, n, r, i, a, o, s] = e;
		return [An(t, i, r, n, a, o, s), z.utcInstance];
	}
	function Rn(e) {
		let [, t, n, r, i, a, o, s] = e;
		return [An(t, s, n, r, i, a, o), z.utcInstance];
	}
	var zn = rn(pn, fn), Bn = rn(mn, fn), Vn = rn(hn, fn), Hn = rn(dn), Un = an(Sn, Cn, wn, Tn), Wn = an(gn, Cn, wn, Tn), Gn = an(_n, Cn, wn, Tn), Kn = an(Cn, wn, Tn);
	function qn(e) {
		return on(e, [zn, Un], [Bn, Wn], [Vn, Gn], [Hn, Kn]);
	}
	function Jn(e) {
		return on(Nn(e), [jn, Mn]);
	}
	function Yn(e) {
		return on(e, [Pn, Ln], [Fn, Ln], [In, Rn]);
	}
	function Xn(e) {
		return on(e, [Dn, On]);
	}
	var Zn = an(Cn);
	function Qn(e) {
		return on(e, [En, Zn]);
	}
	var $n = rn(vn, bn), er = rn(yn), tr = an(Cn, wn, Tn);
	function nr(e) {
		return on(e, [$n, Un], [er, tr]);
	}
	var rr = "Invalid Duration", ir = {
		weeks: {
			days: 7,
			hours: 168,
			minutes: 10080,
			seconds: 604800,
			milliseconds: 6048e5
		},
		days: {
			hours: 24,
			minutes: 1440,
			seconds: 86400,
			milliseconds: 864e5
		},
		hours: {
			minutes: 60,
			seconds: 3600,
			milliseconds: 36e5
		},
		minutes: {
			seconds: 60,
			milliseconds: 6e4
		},
		seconds: { milliseconds: 1e3 }
	}, ar = {
		years: {
			quarters: 4,
			months: 12,
			weeks: 52,
			days: 365,
			hours: 8760,
			minutes: 525600,
			seconds: 31536e3,
			milliseconds: 31536e6
		},
		quarters: {
			months: 3,
			weeks: 13,
			days: 91,
			hours: 2184,
			minutes: 131040,
			seconds: 7862400,
			milliseconds: 78624e5
		},
		months: {
			weeks: 4,
			days: 30,
			hours: 720,
			minutes: 43200,
			seconds: 2592e3,
			milliseconds: 2592e6
		},
		...ir
	}, Y = 146097 / 400, or = 146097 / 4800, sr = {
		years: {
			quarters: 4,
			months: 12,
			weeks: Y / 7,
			days: Y,
			hours: Y * 24,
			minutes: Y * 24 * 60,
			seconds: Y * 24 * 60 * 60,
			milliseconds: Y * 24 * 60 * 60 * 1e3
		},
		quarters: {
			months: 3,
			weeks: Y / 28,
			days: Y / 4,
			hours: Y * 24 / 4,
			minutes: Y * 24 * 60 / 4,
			seconds: Y * 24 * 60 * 60 / 4,
			milliseconds: Y * 24 * 60 * 60 * 1e3 / 4
		},
		months: {
			weeks: or / 7,
			days: or,
			hours: or * 24,
			minutes: or * 24 * 60,
			seconds: or * 24 * 60 * 60,
			milliseconds: or * 24 * 60 * 60 * 1e3
		},
		...ir
	}, cr = [
		"years",
		"quarters",
		"months",
		"weeks",
		"days",
		"hours",
		"minutes",
		"seconds",
		"milliseconds"
	], lr = cr.slice(0).reverse();
	function ur(e, t, n = !1) {
		return new X({
			values: n ? t.values : {
				...e.values,
				...t.values || {}
			},
			loc: e.loc.clone(t.loc),
			conversionAccuracy: t.conversionAccuracy || e.conversionAccuracy,
			matrix: t.matrix || e.matrix
		});
	}
	function dr(e, t) {
		let n = t.milliseconds ?? 0;
		for (let r of lr.slice(1)) t[r] && (n += t[r] * e[r].milliseconds);
		return n;
	}
	function fr(e, t) {
		let n = dr(e, t) < 0 ? -1 : 1;
		cr.reduceRight((r, i) => {
			if (G(t[i])) return r;
			if (r) {
				let a = t[r] * n, o = e[i][r], s = Math.floor(a / o);
				t[i] += s * n, t[r] -= s * o * n;
			}
			return i;
		}, null), cr.reduce((n, r) => {
			if (G(t[r])) return n;
			if (n) {
				let i = t[n] % 1;
				t[n] -= i, t[r] += i * e[n][r];
			}
			return r;
		}, null);
	}
	function pr(e) {
		let t = {};
		for (let [n, r] of Object.entries(e)) r !== 0 && (t[n] = r);
		return t;
	}
	var X = class e {
		constructor(e) {
			let t = e.conversionAccuracy === "longterm" || !1, n = t ? sr : ar;
			e.matrix && (n = e.matrix), this.values = e.values, this.loc = e.loc || R.create(), this.conversionAccuracy = t ? "longterm" : "casual", this.invalid = e.invalid || null, this.matrix = n, this.isLuxonDuration = !0;
		}
		static fromMillis(t, n) {
			return e.fromObject({ milliseconds: t }, n);
		}
		static fromObject(t, n = {}) {
			if (typeof t != "object" || !t) throw new s(`Duration.fromObject: argument expected to be an object, got ${t === null ? "null" : typeof t}`);
			return new e({
				values: Nt(t, e.normalizeUnit),
				loc: R.fromObject(n),
				conversionAccuracy: n.conversionAccuracy,
				matrix: n.matrix
			});
		}
		static fromDurationLike(t) {
			if (st(t)) return e.fromMillis(t);
			if (e.isDuration(t)) return t;
			if (typeof t == "object") return e.fromObject(t);
			throw new s(`Unknown duration argument ${t} of type ${typeof t}`);
		}
		static fromISO(t, n) {
			let [r] = Xn(t);
			return r ? e.fromObject(r, n) : e.invalid("unparsable", `the input "${t}" can't be parsed as ISO 8601`);
		}
		static fromISOTime(t, n) {
			let [r] = Qn(t);
			return r ? e.fromObject(r, n) : e.invalid("unparsable", `the input "${t}" can't be parsed as ISO 8601`);
		}
		static invalid(t, n = null) {
			if (!t) throw new s("need to specify a reason the Duration is invalid");
			let r = t instanceof U ? t : new U(t, n);
			if (H.throwOnInvalid) throw new i(r);
			return new e({ invalid: r });
		}
		static normalizeUnit(e) {
			let t = {
				year: "years",
				years: "years",
				quarter: "quarters",
				quarters: "quarters",
				month: "months",
				months: "months",
				week: "weeks",
				weeks: "weeks",
				day: "days",
				days: "days",
				hour: "hours",
				hours: "hours",
				minute: "minutes",
				minutes: "minutes",
				second: "seconds",
				seconds: "seconds",
				millisecond: "milliseconds",
				milliseconds: "milliseconds"
			}[e && e.toLowerCase()];
			if (!t) throw new o(e);
			return t;
		}
		static isDuration(e) {
			return e && e.isLuxonDuration || !1;
		}
		get locale() {
			return this.isValid ? this.loc.locale : null;
		}
		get numberingSystem() {
			return this.isValid ? this.loc.numberingSystem : null;
		}
		toFormat(e, t = {}) {
			let n = {
				...t,
				floor: t.round !== !1 && t.floor !== !1
			};
			return this.isValid ? J.create(this.loc, n).formatDurationFromString(this, e) : rr;
		}
		toHuman(e = {}) {
			if (!this.isValid) return rr;
			let t = e.showZeros !== !1, n = cr.map((n) => {
				let r = this.values[n];
				return G(r) || r === 0 && !t ? null : this.loc.numberFormatter({
					style: "unit",
					unitDisplay: "long",
					...e,
					unit: n.slice(0, -1)
				}).format(r);
			}).filter((e) => e);
			return this.loc.listFormatter({
				type: "conjunction",
				style: e.listStyle || "narrow",
				...e
			}).format(n);
		}
		toObject() {
			return this.isValid ? { ...this.values } : {};
		}
		toISO() {
			if (!this.isValid) return null;
			let e = "P";
			return this.years !== 0 && (e += this.years + "Y"), (this.months !== 0 || this.quarters !== 0) && (e += this.months + this.quarters * 3 + "M"), this.weeks !== 0 && (e += this.weeks + "W"), this.days !== 0 && (e += this.days + "D"), (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) && (e += "T"), this.hours !== 0 && (e += this.hours + "H"), this.minutes !== 0 && (e += this.minutes + "M"), (this.seconds !== 0 || this.milliseconds !== 0) && (e += St(this.seconds + this.milliseconds / 1e3, 3) + "S"), e === "P" && (e += "T0S"), e;
		}
		toISOTime(e = {}) {
			if (!this.isValid) return null;
			let t = this.toMillis();
			return t < 0 || t >= 864e5 ? null : (e = {
				suppressMilliseconds: !1,
				suppressSeconds: !1,
				includePrefix: !1,
				format: "extended",
				...e,
				includeOffset: !1
			}, $.fromMillis(t, { zone: "UTC" }).toISOTime(e));
		}
		toJSON() {
			return this.toISO();
		}
		toString() {
			return this.toISO();
		}
		[Symbol.for("nodejs.util.inspect.custom")]() {
			return this.isValid ? `Duration { values: ${JSON.stringify(this.values)} }` : `Duration { Invalid, reason: ${this.invalidReason} }`;
		}
		toMillis() {
			return this.isValid ? dr(this.matrix, this.values) : NaN;
		}
		valueOf() {
			return this.toMillis();
		}
		plus(t) {
			if (!this.isValid) return this;
			let n = e.fromDurationLike(t), r = {};
			for (let e of cr) (gt(n.values, e) || gt(this.values, e)) && (r[e] = n.get(e) + this.get(e));
			return ur(this, { values: r }, !0);
		}
		minus(t) {
			if (!this.isValid) return this;
			let n = e.fromDurationLike(t);
			return this.plus(n.negate());
		}
		mapUnits(e) {
			if (!this.isValid) return this;
			let t = {};
			for (let n of Object.keys(this.values)) t[n] = Mt(e(this.values[n], n));
			return ur(this, { values: t }, !0);
		}
		get(t) {
			return this[e.normalizeUnit(t)];
		}
		set(t) {
			if (!this.isValid) return this;
			let n = {
				...this.values,
				...Nt(t, e.normalizeUnit)
			};
			return ur(this, { values: n });
		}
		reconfigure({ locale: e, numberingSystem: t, conversionAccuracy: n, matrix: r } = {}) {
			let i = {
				loc: this.loc.clone({
					locale: e,
					numberingSystem: t
				}),
				matrix: r,
				conversionAccuracy: n
			};
			return ur(this, i);
		}
		as(e) {
			return this.isValid ? this.shiftTo(e).get(e) : NaN;
		}
		normalize() {
			if (!this.isValid) return this;
			let e = this.toObject();
			return fr(this.matrix, e), ur(this, { values: e }, !0);
		}
		rescale() {
			if (!this.isValid) return this;
			let e = pr(this.normalize().shiftToAll().toObject());
			return ur(this, { values: e }, !0);
		}
		shiftTo(...t) {
			if (!this.isValid || t.length === 0) return this;
			t = t.map((t) => e.normalizeUnit(t));
			let n = {}, r = {}, i = this.toObject(), a;
			for (let e of cr) if (t.indexOf(e) >= 0) {
				a = e;
				let t = 0;
				for (let n in r) t += this.matrix[n][e] * r[n], r[n] = 0;
				st(i[e]) && (t += i[e]);
				let o = Math.trunc(t);
				n[e] = o, r[e] = (t * 1e3 - o * 1e3) / 1e3;
			} else st(i[e]) && (r[e] = i[e]);
			for (let e in r) r[e] !== 0 && (n[a] += e === a ? r[e] : r[e] / this.matrix[a][e]);
			return fr(this.matrix, n), ur(this, { values: n }, !0);
		}
		shiftToAll() {
			return this.isValid ? this.shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds") : this;
		}
		negate() {
			if (!this.isValid) return this;
			let e = {};
			for (let t of Object.keys(this.values)) e[t] = this.values[t] === 0 ? 0 : -this.values[t];
			return ur(this, { values: e }, !0);
		}
		removeZeros() {
			if (!this.isValid) return this;
			let e = pr(this.values);
			return ur(this, { values: e }, !0);
		}
		get years() {
			return this.isValid ? this.values.years || 0 : NaN;
		}
		get quarters() {
			return this.isValid ? this.values.quarters || 0 : NaN;
		}
		get months() {
			return this.isValid ? this.values.months || 0 : NaN;
		}
		get weeks() {
			return this.isValid ? this.values.weeks || 0 : NaN;
		}
		get days() {
			return this.isValid ? this.values.days || 0 : NaN;
		}
		get hours() {
			return this.isValid ? this.values.hours || 0 : NaN;
		}
		get minutes() {
			return this.isValid ? this.values.minutes || 0 : NaN;
		}
		get seconds() {
			return this.isValid ? this.values.seconds || 0 : NaN;
		}
		get milliseconds() {
			return this.isValid ? this.values.milliseconds || 0 : NaN;
		}
		get isValid() {
			return this.invalid === null;
		}
		get invalidReason() {
			return this.invalid ? this.invalid.reason : null;
		}
		get invalidExplanation() {
			return this.invalid ? this.invalid.explanation : null;
		}
		equals(e) {
			if (!this.isValid || !e.isValid || !this.loc.equals(e.loc)) return !1;
			function t(e, t) {
				return e === void 0 || e === 0 ? t === void 0 || t === 0 : e === t;
			}
			for (let n of cr) if (!t(this.values[n], e.values[n])) return !1;
			return !0;
		}
	}, mr = "Invalid Interval";
	function hr(e, t) {
		return !e || !e.isValid ? gr.invalid("missing or invalid start") : !t || !t.isValid ? gr.invalid("missing or invalid end") : t < e ? gr.invalid("end before start", `The end of an interval must be after its start, but you had start=${e.toISO()} and end=${t.toISO()}`) : null;
	}
	var gr = class e {
		constructor(e) {
			this.s = e.start, this.e = e.end, this.invalid = e.invalid || null, this.isLuxonInterval = !0;
		}
		static invalid(t, n = null) {
			if (!t) throw new s("need to specify a reason the Interval is invalid");
			let i = t instanceof U ? t : new U(t, n);
			if (H.throwOnInvalid) throw new r(i);
			return new e({ invalid: i });
		}
		static fromDateTimes(t, n) {
			let r = _i(t), i = _i(n);
			return hr(r, i) ?? new e({
				start: r,
				end: i
			});
		}
		static after(t, n) {
			let r = X.fromDurationLike(n), i = _i(t);
			return e.fromDateTimes(i, i.plus(r));
		}
		static before(t, n) {
			let r = X.fromDurationLike(n), i = _i(t);
			return e.fromDateTimes(i.minus(r), i);
		}
		static fromISO(t, n) {
			let [r, i] = (t || "").split("/", 2);
			if (r && i) {
				let t, a;
				try {
					t = $.fromISO(r, n), a = t.isValid;
				} catch {
					a = !1;
				}
				let o, s;
				try {
					o = $.fromISO(i, n), s = o.isValid;
				} catch {
					s = !1;
				}
				if (a && s) return e.fromDateTimes(t, o);
				if (a) {
					let r = X.fromISO(i, n);
					if (r.isValid) return e.after(t, r);
				} else if (s) {
					let t = X.fromISO(r, n);
					if (t.isValid) return e.before(o, t);
				}
			}
			return e.invalid("unparsable", `the input "${t}" can't be parsed as ISO 8601`);
		}
		static isInterval(e) {
			return e && e.isLuxonInterval || !1;
		}
		get start() {
			return this.isValid ? this.s : null;
		}
		get end() {
			return this.isValid ? this.e : null;
		}
		get lastDateTime() {
			return this.isValid && this.e ? this.e.minus(1) : null;
		}
		get isValid() {
			return this.invalidReason === null;
		}
		get invalidReason() {
			return this.invalid ? this.invalid.reason : null;
		}
		get invalidExplanation() {
			return this.invalid ? this.invalid.explanation : null;
		}
		length(e = "milliseconds") {
			return this.isValid ? this.toDuration(e).get(e) : NaN;
		}
		count(e = "milliseconds", t) {
			if (!this.isValid) return NaN;
			let n = this.start.startOf(e, t), r;
			return r = t != null && t.useLocaleWeeks ? this.end.reconfigure({ locale: n.locale }) : this.end, r = r.startOf(e, t), Math.floor(r.diff(n, e).get(e)) + (r.valueOf() !== this.end.valueOf());
		}
		hasSame(e) {
			return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, e) : !1;
		}
		isEmpty() {
			return this.s.valueOf() === this.e.valueOf();
		}
		isAfter(e) {
			return this.isValid ? this.s > e : !1;
		}
		isBefore(e) {
			return this.isValid ? this.e <= e : !1;
		}
		contains(e) {
			return this.isValid ? this.s <= e && this.e > e : !1;
		}
		set({ start: t, end: n } = {}) {
			return this.isValid ? e.fromDateTimes(t || this.s, n || this.e) : this;
		}
		splitAt(...t) {
			if (!this.isValid) return [];
			let n = t.map(_i).filter((e) => this.contains(e)).sort((e, t) => e.toMillis() - t.toMillis()), r = [], { s: i } = this, a = 0;
			for (; i < this.e;) {
				let t = n[a] || this.e, o = +t > +this.e ? this.e : t;
				r.push(e.fromDateTimes(i, o)), i = o, a += 1;
			}
			return r;
		}
		splitBy(t) {
			let n = X.fromDurationLike(t);
			if (!this.isValid || !n.isValid || n.as("milliseconds") === 0) return [];
			let { s: r } = this, i = 1, a, o = [];
			for (; r < this.e;) {
				let t = this.start.plus(n.mapUnits((e) => e * i));
				a = +t > +this.e ? this.e : t, o.push(e.fromDateTimes(r, a)), r = a, i += 1;
			}
			return o;
		}
		divideEqually(e) {
			return this.isValid ? this.splitBy(this.length() / e).slice(0, e) : [];
		}
		overlaps(e) {
			return this.e > e.s && this.s < e.e;
		}
		abutsStart(e) {
			return this.isValid ? +this.e == +e.s : !1;
		}
		abutsEnd(e) {
			return this.isValid ? +e.e == +this.s : !1;
		}
		engulfs(e) {
			return this.isValid ? this.s <= e.s && this.e >= e.e : !1;
		}
		equals(e) {
			return !this.isValid || !e.isValid ? !1 : this.s.equals(e.s) && this.e.equals(e.e);
		}
		intersection(t) {
			if (!this.isValid) return this;
			let n = this.s > t.s ? this.s : t.s, r = this.e < t.e ? this.e : t.e;
			return n >= r ? null : e.fromDateTimes(n, r);
		}
		union(t) {
			if (!this.isValid) return this;
			let n = this.s < t.s ? this.s : t.s, r = this.e > t.e ? this.e : t.e;
			return e.fromDateTimes(n, r);
		}
		static merge(e) {
			let [t, n] = e.sort((e, t) => e.s - t.s).reduce(([e, t], n) => t ? t.overlaps(n) || t.abutsStart(n) ? [e, t.union(n)] : [e.concat([t]), n] : [e, n], [[], null]);
			return n && t.push(n), t;
		}
		static xor(t) {
			let n = null, r = 0, i = [], a = t.map((e) => [{
				time: e.s,
				type: "s"
			}, {
				time: e.e,
				type: "e"
			}]), o = Array.prototype.concat(...a).sort((e, t) => e.time - t.time);
			for (let t of o) r += t.type === "s" ? 1 : -1, r === 1 ? n = t.time : (n && +n != +t.time && i.push(e.fromDateTimes(n, t.time)), n = null);
			return e.merge(i);
		}
		difference(...t) {
			return e.xor([this].concat(t)).map((e) => this.intersection(e)).filter((e) => e && !e.isEmpty());
		}
		toString() {
			return this.isValid ? `[${this.s.toISO()} – ${this.e.toISO()})` : mr;
		}
		[Symbol.for("nodejs.util.inspect.custom")]() {
			return this.isValid ? `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }` : `Interval { Invalid, reason: ${this.invalidReason} }`;
		}
		toLocaleString(e = f, t = {}) {
			return this.isValid ? J.create(this.s.loc.clone(t), e).formatInterval(this) : mr;
		}
		toISO(e) {
			return this.isValid ? `${this.s.toISO(e)}/${this.e.toISO(e)}` : mr;
		}
		toISODate() {
			return this.isValid ? `${this.s.toISODate()}/${this.e.toISODate()}` : mr;
		}
		toISOTime(e) {
			return this.isValid ? `${this.s.toISOTime(e)}/${this.e.toISOTime(e)}` : mr;
		}
		toFormat(e, { separator: t = " – " } = {}) {
			return this.isValid ? `${this.s.toFormat(e)}${t}${this.e.toFormat(e)}` : mr;
		}
		toDuration(e, t) {
			return this.isValid ? this.e.diff(this.s, e, t) : X.invalid(this.invalidReason);
		}
		mapEndpoints(t) {
			return e.fromDateTimes(t(this.s), t(this.e));
		}
	}, _r = class {
		static hasDST(e = H.defaultZone) {
			let t = $.now().setZone(e).set({ month: 12 });
			return !e.isUniversal && t.offset !== t.set({ month: 6 }).offset;
		}
		static isValidIANAZone(e) {
			return j.isValidZone(e);
		}
		static normalizeZone(e) {
			return Me(e, H.defaultZone);
		}
		static getStartOfWeek({ locale: e = null, locObj: t = null } = {}) {
			return (t || R.create(e)).getStartOfWeek();
		}
		static getMinimumDaysInFirstWeek({ locale: e = null, locObj: t = null } = {}) {
			return (t || R.create(e)).getMinDaysInFirstWeek();
		}
		static getWeekendWeekdays({ locale: e = null, locObj: t = null } = {}) {
			return (t || R.create(e)).getWeekendDays().slice();
		}
		static months(e = "long", { locale: t = null, numberingSystem: n = null, locObj: r = null, outputCalendar: i = "gregory" } = {}) {
			return (r || R.create(t, n, i)).months(e);
		}
		static monthsFormat(e = "long", { locale: t = null, numberingSystem: n = null, locObj: r = null, outputCalendar: i = "gregory" } = {}) {
			return (r || R.create(t, n, i)).months(e, !0);
		}
		static weekdays(e = "long", { locale: t = null, numberingSystem: n = null, locObj: r = null } = {}) {
			return (r || R.create(t, n, null)).weekdays(e);
		}
		static weekdaysFormat(e = "long", { locale: t = null, numberingSystem: n = null, locObj: r = null } = {}) {
			return (r || R.create(t, n, null)).weekdays(e, !0);
		}
		static meridiems({ locale: e = null } = {}) {
			return R.create(e).meridiems();
		}
		static eras(e = "short", { locale: t = null } = {}) {
			return R.create(t, null, "gregory").eras(e);
		}
		static features() {
			return {
				relative: dt(),
				localeWeek: ft()
			};
		}
	};
	function vr(e, t) {
		let n = (e) => e.toUTC(0, { keepLocalTime: !0 }).startOf("day").valueOf(), r = n(t) - n(e);
		return Math.floor(X.fromMillis(r).as("days"));
	}
	function yr(e, t, n) {
		let r = [
			["years", (e, t) => t.year - e.year],
			["quarters", (e, t) => t.quarter - e.quarter + (t.year - e.year) * 4],
			["months", (e, t) => t.month - e.month + (t.year - e.year) * 12],
			["weeks", (e, t) => {
				let n = vr(e, t);
				return (n - n % 7) / 7;
			}],
			["days", vr]
		], i = {}, a = e, o, s;
		for (let [c, l] of r) n.indexOf(c) >= 0 && (o = c, i[c] = l(e, t), s = a.plus(i), s > t ? (i[c]--, e = a.plus(i), e > t && (s = e, i[c]--, e = a.plus(i))) : e = s);
		return [
			e,
			i,
			s,
			o
		];
	}
	function br(e, t, n, r) {
		let [i, a, o, s] = yr(e, t, n), c = t - i, l = n.filter((e) => [
			"hours",
			"minutes",
			"seconds",
			"milliseconds"
		].indexOf(e) >= 0);
		l.length === 0 && (o < t && (o = i.plus({ [s]: 1 })), o !== i && (a[s] = (a[s] || 0) + c / (o - i)));
		let u = X.fromObject(a, r);
		return l.length > 0 ? X.fromMillis(c, r).shiftTo(...l).plus(u) : u;
	}
	var xr = "missing Intl.DateTimeFormat.formatToParts support";
	function Z(e, t = (e) => e) {
		return {
			regex: e,
			deser: ([e]) => t(Ie(e))
		};
	}
	var Sr = "[ \xA0]", Cr = new RegExp(Sr, "g");
	function wr(e) {
		return e.replace(/\./g, "\\.?").replace(Cr, Sr);
	}
	function Tr(e) {
		return e.replace(/\./g, "").replace(Cr, " ").toLowerCase();
	}
	function Q(e, t) {
		return e === null ? null : {
			regex: RegExp(e.map(wr).join("|")),
			deser: ([n]) => e.findIndex((e) => Tr(n) === Tr(e)) + t
		};
	}
	function Er(e, t) {
		return {
			regex: e,
			deser: ([, e, t]) => jt(e, t),
			groups: t
		};
	}
	function Dr(e) {
		return {
			regex: e,
			deser: ([e]) => e
		};
	}
	function Or(e) {
		return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	}
	function kr(e, t) {
		let n = B(t), r = B(t, "{2}"), i = B(t, "{3}"), a = B(t, "{4}"), o = B(t, "{6}"), s = B(t, "{1,2}"), c = B(t, "{1,3}"), l = B(t, "{1,6}"), u = B(t, "{1,9}"), d = B(t, "{2,4}"), f = B(t, "{4,6}"), p = (e) => ({
			regex: RegExp(Or(e.val)),
			deser: ([e]) => e,
			literal: !0
		}), m = ((m) => {
			if (e.literal) return p(m);
			switch (m.val) {
				case "G": return Q(t.eras("short"), 0);
				case "GG": return Q(t.eras("long"), 0);
				case "y": return Z(l);
				case "yy": return Z(d, kt);
				case "yyyy": return Z(a);
				case "yyyyy": return Z(f);
				case "yyyyyy": return Z(o);
				case "M": return Z(s);
				case "MM": return Z(r);
				case "MMM": return Q(t.months("short", !0), 1);
				case "MMMM": return Q(t.months("long", !0), 1);
				case "L": return Z(s);
				case "LL": return Z(r);
				case "LLL": return Q(t.months("short", !1), 1);
				case "LLLL": return Q(t.months("long", !1), 1);
				case "d": return Z(s);
				case "dd": return Z(r);
				case "o": return Z(c);
				case "ooo": return Z(i);
				case "HH": return Z(r);
				case "H": return Z(s);
				case "hh": return Z(r);
				case "h": return Z(s);
				case "mm": return Z(r);
				case "m": return Z(s);
				case "q": return Z(s);
				case "qq": return Z(r);
				case "s": return Z(s);
				case "ss": return Z(r);
				case "S": return Z(c);
				case "SSS": return Z(i);
				case "u": return Dr(u);
				case "uu": return Dr(s);
				case "uuu": return Z(n);
				case "a": return Q(t.meridiems(), 0);
				case "kkkk": return Z(a);
				case "kk": return Z(d, kt);
				case "W": return Z(s);
				case "WW": return Z(r);
				case "E":
				case "c": return Z(n);
				case "EEE": return Q(t.weekdays("short", !1), 1);
				case "EEEE": return Q(t.weekdays("long", !1), 1);
				case "ccc": return Q(t.weekdays("short", !0), 1);
				case "cccc": return Q(t.weekdays("long", !0), 1);
				case "Z":
				case "ZZ": return Er(RegExp(`([+-]${s.source})(?::(${r.source}))?`), 2);
				case "ZZZ": return Er(RegExp(`([+-]${s.source})(${r.source})?`), 2);
				case "z": return Dr(/[a-z_+-/]{1,256}?/i);
				case " ": return Dr(/[^\S\n\r]/);
				default: return p(m);
			}
		})(e) || { invalidReason: xr };
		return m.token = e, m;
	}
	var Ar = {
		year: {
			"2-digit": "yy",
			numeric: "yyyyy"
		},
		month: {
			numeric: "M",
			"2-digit": "MM",
			short: "MMM",
			long: "MMMM"
		},
		day: {
			numeric: "d",
			"2-digit": "dd"
		},
		weekday: {
			short: "EEE",
			long: "EEEE"
		},
		dayperiod: "a",
		dayPeriod: "a",
		hour12: {
			numeric: "h",
			"2-digit": "hh"
		},
		hour24: {
			numeric: "H",
			"2-digit": "HH"
		},
		minute: {
			numeric: "m",
			"2-digit": "mm"
		},
		second: {
			numeric: "s",
			"2-digit": "ss"
		},
		timeZoneName: {
			long: "ZZZZZ",
			short: "ZZZ"
		}
	};
	function jr(e, t, n) {
		let { type: r, value: i } = e;
		if (r === "literal") {
			let e = /^\s+$/.test(i);
			return {
				literal: !e,
				val: e ? " " : i
			};
		}
		let a = t[r], o = r;
		r === "hour" && (o = t.hour12 == null ? t.hourCycle == null ? n.hour12 ? "hour12" : "hour24" : t.hourCycle === "h11" || t.hourCycle === "h12" ? "hour12" : "hour24" : t.hour12 ? "hour12" : "hour24");
		let s = Ar[o];
		if (typeof s == "object" && (s = s[a]), s) return {
			literal: !1,
			val: s
		};
	}
	function Mr(e) {
		return [`^${e.map((e) => e.regex).reduce((e, t) => `${e}(${t.source})`, "")}$`, e];
	}
	function Nr(e, t, n) {
		let r = e.match(t);
		if (r) {
			let e = {}, t = 1;
			for (let i in n) if (gt(n, i)) {
				let a = n[i], o = a.groups ? a.groups + 1 : 1;
				!a.literal && a.token && (e[a.token.val[0]] = a.deser(r.slice(t, t + o))), t += o;
			}
			return [r, e];
		}
		return [r, {}];
	}
	function Pr(e) {
		let t = (e) => {
			switch (e) {
				case "S": return "millisecond";
				case "s": return "second";
				case "m": return "minute";
				case "h":
				case "H": return "hour";
				case "d": return "day";
				case "o": return "ordinal";
				case "L":
				case "M": return "month";
				case "y": return "year";
				case "E":
				case "c": return "weekday";
				case "W": return "weekNumber";
				case "k": return "weekYear";
				case "q": return "quarter";
				default: return null;
			}
		}, n = null, r;
		return G(e.z) || (n = j.create(e.z)), G(e.Z) || (n ||= new z(e.Z), r = e.Z), G(e.q) || (e.M = (e.q - 1) * 3 + 1), G(e.h) || (e.h < 12 && e.a === 1 ? e.h += 12 : e.h === 12 && e.a === 0 && (e.h = 0)), e.G === 0 && e.y && (e.y = -e.y), G(e.u) || (e.S = xt(e.u)), [
			Object.keys(e).reduce((n, r) => {
				let i = t(r);
				return i && (n[i] = e[r]), n;
			}, {}),
			n,
			r
		];
	}
	var Fr = null;
	function Ir() {
		return Fr ||= $.fromMillis(1555555555555), Fr;
	}
	function Lr(e, t) {
		if (e.literal) return e;
		let n = Hr(J.macroTokenToFormatOpts(e.val), t);
		return n == null || n.includes(void 0) ? e : n;
	}
	function Rr(e, t) {
		return Array.prototype.concat(...e.map((e) => Lr(e, t)));
	}
	var zr = class {
		constructor(e, t) {
			if (this.locale = e, this.format = t, this.tokens = Rr(J.parseFormat(t), e), this.units = this.tokens.map((t) => kr(t, e)), this.disqualifyingUnit = this.units.find((e) => e.invalidReason), !this.disqualifyingUnit) {
				let [e, t] = Mr(this.units);
				this.regex = RegExp(e, "i"), this.handlers = t;
			}
		}
		explainFromTokens(e) {
			if (this.isValid) {
				let [t, n] = Nr(e, this.regex, this.handlers), [r, i, o] = n ? Pr(n) : [
					null,
					null,
					void 0
				];
				if (gt(n, "a") && gt(n, "H")) throw new a("Can't include meridiem when specifying 24-hour format");
				return {
					input: e,
					tokens: this.tokens,
					regex: this.regex,
					rawMatches: t,
					matches: n,
					result: r,
					zone: i,
					specificOffset: o
				};
			}
			return {
				input: e,
				tokens: this.tokens,
				invalidReason: this.invalidReason
			};
		}
		get isValid() {
			return !this.disqualifyingUnit;
		}
		get invalidReason() {
			return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
		}
	};
	function Br(e, t, n) {
		return new zr(e, n).explainFromTokens(t);
	}
	function Vr(e, t, n) {
		let { result: r, zone: i, specificOffset: a, invalidReason: o } = Br(e, t, n);
		return [
			r,
			i,
			a,
			o
		];
	}
	function Hr(e, t) {
		if (!e) return null;
		let n = J.create(t, e).dtFormatter(Ir()), r = n.formatToParts(), i = n.resolvedOptions();
		return r.map((t) => jr(t, e, i));
	}
	var Ur = "Invalid DateTime", Wr = 864e13;
	function Gr(e) {
		return new U("unsupported zone", `the zone "${e.name}" is not supported`);
	}
	function Kr(e) {
		return e.weekData === null && (e.weekData = Qe(e.c)), e.weekData;
	}
	function qr(e) {
		return e.localWeekData === null && (e.localWeekData = Qe(e.c, e.loc.getMinDaysInFirstWeek(), e.loc.getStartOfWeek())), e.localWeekData;
	}
	function Jr(e, t) {
		let n = {
			ts: e.ts,
			zone: e.zone,
			c: e.c,
			o: e.o,
			loc: e.loc,
			invalid: e.invalid
		};
		return new $({
			...n,
			...t,
			old: n
		});
	}
	function Yr(e, t, n) {
		let r = e - t * 60 * 1e3, i = n.offset(r);
		if (t === i) return [r, t];
		r -= (i - t) * 60 * 1e3;
		let a = n.offset(r);
		return i === a ? [r, i] : [e - Math.min(i, a) * 60 * 1e3, Math.max(i, a)];
	}
	function Xr(e, t) {
		e += t * 60 * 1e3;
		let n = new Date(e);
		return {
			year: n.getUTCFullYear(),
			month: n.getUTCMonth() + 1,
			day: n.getUTCDate(),
			hour: n.getUTCHours(),
			minute: n.getUTCMinutes(),
			second: n.getUTCSeconds(),
			millisecond: n.getUTCMilliseconds()
		};
	}
	function Zr(e, t, n) {
		return Yr(Et(e), t, n);
	}
	function Qr(e, t) {
		let n = e.o, r = e.c.year + Math.trunc(t.years), i = e.c.month + Math.trunc(t.months) + Math.trunc(t.quarters) * 3, a = {
			...e.c,
			year: r,
			month: i,
			day: Math.min(e.c.day, Tt(r, i)) + Math.trunc(t.days) + Math.trunc(t.weeks) * 7
		}, o = X.fromObject({
			years: t.years - Math.trunc(t.years),
			quarters: t.quarters - Math.trunc(t.quarters),
			months: t.months - Math.trunc(t.months),
			weeks: t.weeks - Math.trunc(t.weeks),
			days: t.days - Math.trunc(t.days),
			hours: t.hours,
			minutes: t.minutes,
			seconds: t.seconds,
			milliseconds: t.milliseconds
		}).as("milliseconds"), [s, c] = Yr(Et(a), n, e.zone);
		return o !== 0 && (s += o, c = e.zone.offset(s)), {
			ts: s,
			o: c
		};
	}
	function $r(e, t, n, r, i, a) {
		let { setZone: o, zone: s } = n;
		if (e && Object.keys(e).length !== 0 || t) {
			let r = t || s, i = $.fromObject(e, {
				...n,
				zone: r,
				specificOffset: a
			});
			return o ? i : i.setZone(s);
		}
		return $.invalid(new U("unparsable", `the input "${i}" can't be parsed as ${r}`));
	}
	function ei(e, t, n = !0) {
		return e.isValid ? J.create(R.create("en-US"), {
			allowZ: n,
			forceSimple: !0
		}).formatDateTimeFromString(e, t) : null;
	}
	function ti(e, t, n) {
		let r = e.c.year > 9999 || e.c.year < 0, i = "";
		if (r && e.c.year >= 0 && (i += "+"), i += q(e.c.year, r ? 6 : 4), n === "year") return i;
		if (t) {
			if (i += "-", i += q(e.c.month), n === "month") return i;
			i += "-";
		} else if (i += q(e.c.month), n === "month") return i;
		return i += q(e.c.day), i;
	}
	function ni(e, t, n, r, i, a, o) {
		let s = !n || e.c.millisecond !== 0 || e.c.second !== 0, c = "";
		switch (o) {
			case "day":
			case "month":
			case "year": break;
			default:
				if (c += q(e.c.hour), o === "hour") break;
				if (t) {
					if (c += ":", c += q(e.c.minute), o === "minute") break;
					s && (c += ":", c += q(e.c.second));
				} else {
					if (c += q(e.c.minute), o === "minute") break;
					s && (c += q(e.c.second));
				}
				if (o === "second") break;
				s && (!r || e.c.millisecond !== 0) && (c += ".", c += q(e.c.millisecond, 3));
		}
		return i && (e.isOffsetFixed && e.offset === 0 && !a ? c += "Z" : e.o < 0 ? (c += "-", c += q(Math.trunc(-e.o / 60)), c += ":", c += q(Math.trunc(-e.o % 60))) : (c += "+", c += q(Math.trunc(e.o / 60)), c += ":", c += q(Math.trunc(e.o % 60)))), a && (c += "[" + e.zone.ianaName + "]"), c;
	}
	var ri = {
		month: 1,
		day: 1,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0
	}, ii = {
		weekNumber: 1,
		weekday: 1,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0
	}, ai = {
		ordinal: 1,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0
	}, oi = [
		"year",
		"month",
		"day",
		"hour",
		"minute",
		"second",
		"millisecond"
	], si = [
		"weekYear",
		"weekNumber",
		"weekday",
		"hour",
		"minute",
		"second",
		"millisecond"
	], ci = [
		"year",
		"ordinal",
		"hour",
		"minute",
		"second",
		"millisecond"
	];
	function li(e) {
		let t = {
			year: "year",
			years: "year",
			month: "month",
			months: "month",
			day: "day",
			days: "day",
			hour: "hour",
			hours: "hour",
			minute: "minute",
			minutes: "minute",
			quarter: "quarter",
			quarters: "quarter",
			second: "second",
			seconds: "second",
			millisecond: "millisecond",
			milliseconds: "millisecond",
			weekday: "weekday",
			weekdays: "weekday",
			weeknumber: "weekNumber",
			weeksnumber: "weekNumber",
			weeknumbers: "weekNumber",
			weekyear: "weekYear",
			weekyears: "weekYear",
			ordinal: "ordinal"
		}[e.toLowerCase()];
		if (!t) throw new o(e);
		return t;
	}
	function ui(e) {
		switch (e.toLowerCase()) {
			case "localweekday":
			case "localweekdays": return "localWeekday";
			case "localweeknumber":
			case "localweeknumbers": return "localWeekNumber";
			case "localweekyear":
			case "localweekyears": return "localWeekYear";
			default: return li(e);
		}
	}
	function di(e) {
		if (hi === void 0 && (hi = H.now()), e.type !== "iana") return e.offset(hi);
		let t = e.name, n = gi.get(t);
		return n === void 0 && (n = e.offset(hi), gi.set(t, n)), n;
	}
	function fi(e, t) {
		let n = Me(t.zone, H.defaultZone);
		if (!n.isValid) return $.invalid(Gr(n));
		let r = R.fromObject(t), i, a;
		if (G(e.year)) i = H.now();
		else {
			for (let t of oi) G(e[t]) && (e[t] = ri[t]);
			let t = at(e) || ot(e);
			if (t) return $.invalid(t);
			let r = di(n);
			[i, a] = Zr(e, r, n);
		}
		return new $({
			ts: i,
			zone: n,
			loc: r,
			o: a
		});
	}
	function pi(e, t, n) {
		let r = G(n.round) ? !0 : n.round, i = G(n.rounding) ? "trunc" : n.rounding, a = (e, a) => (e = St(e, r || n.calendary ? 0 : 2, n.calendary ? "round" : i), t.loc.clone(n).relFormatter(n).format(e, a)), o = (r) => n.calendary ? t.hasSame(e, r) ? 0 : t.startOf(r).diff(e.startOf(r), r).get(r) : t.diff(e, r).get(r);
		if (n.unit) return a(o(n.unit), n.unit);
		for (let e of n.units) {
			let t = o(e);
			if (Math.abs(t) >= 1) return a(t, e);
		}
		return a(e > t ? -0 : 0, n.units[n.units.length - 1]);
	}
	function mi(e) {
		let t = {}, n;
		return e.length > 0 && typeof e[e.length - 1] == "object" ? (t = e[e.length - 1], n = Array.from(e).slice(0, e.length - 1)) : n = Array.from(e), [t, n];
	}
	var hi, gi = /* @__PURE__ */ new Map(), $ = class e {
		constructor(e) {
			let t = e.zone || H.defaultZone, n = e.invalid || (Number.isNaN(e.ts) ? new U("invalid input") : null) || (t.isValid ? null : Gr(t));
			this.ts = G(e.ts) ? H.now() : e.ts;
			let r = null, i = null;
			if (!n) {
				if (e.old && e.old.ts === this.ts && e.old.zone.equals(t)) [r, i] = [e.old.c, e.old.o];
				else {
					let a = st(e.o) && !e.old ? e.o : t.offset(this.ts);
					r = Xr(this.ts, a), n = Number.isNaN(r.year) ? new U("invalid input") : null, r = n ? null : r, i = n ? null : a;
				}
			}
			this._zone = t, this.loc = e.loc || R.create(), this.invalid = n, this.weekData = null, this.localWeekData = null, this.c = r, this.o = i, this.isLuxonDateTime = !0;
		}
		static now() {
			return new e({});
		}
		static local() {
			let [e, t] = mi(arguments), [n, r, i, a, o, s, c] = t;
			return fi({
				year: n,
				month: r,
				day: i,
				hour: a,
				minute: o,
				second: s,
				millisecond: c
			}, e);
		}
		static utc() {
			let [e, t] = mi(arguments), [n, r, i, a, o, s, c] = t;
			return e.zone = z.utcInstance, fi({
				year: n,
				month: r,
				day: i,
				hour: a,
				minute: o,
				second: s,
				millisecond: c
			}, e);
		}
		static fromJSDate(t, n = {}) {
			let r = ut(t) ? t.valueOf() : NaN;
			if (Number.isNaN(r)) return e.invalid("invalid input");
			let i = Me(n.zone, H.defaultZone);
			return i.isValid ? new e({
				ts: r,
				zone: i,
				loc: R.fromObject(n)
			}) : e.invalid(Gr(i));
		}
		static fromMillis(t, n = {}) {
			if (!st(t)) throw new s(`fromMillis requires a numerical input, but received a ${typeof t} with value ${t}`);
			return t < -864e13 || t > Wr ? e.invalid("Timestamp out of range") : new e({
				ts: t,
				zone: Me(n.zone, H.defaultZone),
				loc: R.fromObject(n)
			});
		}
		static fromSeconds(t, n = {}) {
			if (st(t)) return new e({
				ts: t * 1e3,
				zone: Me(n.zone, H.defaultZone),
				loc: R.fromObject(n)
			});
			throw new s("fromSeconds requires a numerical input");
		}
		static fromObject(t, n = {}) {
			t ||= {};
			let r = Me(n.zone, H.defaultZone);
			if (!r.isValid) return e.invalid(Gr(r));
			let i = R.fromObject(n), o = Nt(t, ui), { minDaysInFirstWeek: s, startOfWeek: c } = nt(o, i), l = H.now(), u = G(n.specificOffset) ? r.offset(l) : n.specificOffset, d = !G(o.ordinal), f = !G(o.year), p = !G(o.month) || !G(o.day), m = f || p, h = o.weekYear || o.weekNumber;
			if ((m || d) && h) throw new a("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
			if (p && d) throw new a("Can't mix ordinal dates with month/day");
			let g = h || o.weekday && !m, _, v, y = Xr(l, u);
			g ? (_ = si, v = ii, y = Qe(y, s, c)) : d ? (_ = ci, v = ai, y = et(y)) : (_ = oi, v = ri);
			let b = !1;
			for (let e of _) {
				let t = o[e];
				G(t) ? o[e] = b ? v[e] : y[e] : b = !0;
			}
			let x = (g ? rt(o, s, c) : d ? it(o) : at(o)) || ot(o);
			if (x) return e.invalid(x);
			let [S, C] = Zr(g ? $e(o, s, c) : d ? tt(o) : o, u, r), w = new e({
				ts: S,
				zone: r,
				o: C,
				loc: i
			});
			return o.weekday && m && t.weekday !== w.weekday ? e.invalid("mismatched weekday", `you can't specify both a weekday of ${o.weekday} and a date of ${w.toISO()}`) : w.isValid ? w : e.invalid(w.invalid);
		}
		static fromISO(e, t = {}) {
			let [n, r] = qn(e);
			return $r(n, r, t, "ISO 8601", e);
		}
		static fromRFC2822(e, t = {}) {
			let [n, r] = Jn(e);
			return $r(n, r, t, "RFC 2822", e);
		}
		static fromHTTP(e, t = {}) {
			let [n, r] = Yn(e);
			return $r(n, r, t, "HTTP", t);
		}
		static fromFormat(t, n, r = {}) {
			if (G(t) || G(n)) throw new s("fromFormat requires an input string and a format");
			let { locale: i = null, numberingSystem: a = null } = r, [o, c, l, u] = Vr(R.fromOpts({
				locale: i,
				numberingSystem: a,
				defaultToEN: !0
			}), t, n);
			return u ? e.invalid(u) : $r(o, c, r, `format ${n}`, t, l);
		}
		static fromString(t, n, r = {}) {
			return e.fromFormat(t, n, r);
		}
		static fromSQL(e, t = {}) {
			let [n, r] = nr(e);
			return $r(n, r, t, "SQL", e);
		}
		static invalid(t, r = null) {
			if (!t) throw new s("need to specify a reason the DateTime is invalid");
			let i = t instanceof U ? t : new U(t, r);
			if (H.throwOnInvalid) throw new n(i);
			return new e({ invalid: i });
		}
		static isDateTime(e) {
			return e && e.isLuxonDateTime || !1;
		}
		static parseFormatForOpts(e, t = {}) {
			let n = Hr(e, R.fromObject(t));
			return n ? n.map((e) => e ? e.val : null).join("") : null;
		}
		static expandFormat(e, t = {}) {
			return Rr(J.parseFormat(e), R.fromObject(t)).map((e) => e.val).join("");
		}
		static resetCache() {
			hi = void 0, gi.clear();
		}
		get(e) {
			return this[e];
		}
		get isValid() {
			return this.invalid === null;
		}
		get invalidReason() {
			return this.invalid ? this.invalid.reason : null;
		}
		get invalidExplanation() {
			return this.invalid ? this.invalid.explanation : null;
		}
		get locale() {
			return this.isValid ? this.loc.locale : null;
		}
		get numberingSystem() {
			return this.isValid ? this.loc.numberingSystem : null;
		}
		get outputCalendar() {
			return this.isValid ? this.loc.outputCalendar : null;
		}
		get zone() {
			return this._zone;
		}
		get zoneName() {
			return this.isValid ? this.zone.name : null;
		}
		get year() {
			return this.isValid ? this.c.year : NaN;
		}
		get quarter() {
			return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
		}
		get month() {
			return this.isValid ? this.c.month : NaN;
		}
		get day() {
			return this.isValid ? this.c.day : NaN;
		}
		get hour() {
			return this.isValid ? this.c.hour : NaN;
		}
		get minute() {
			return this.isValid ? this.c.minute : NaN;
		}
		get second() {
			return this.isValid ? this.c.second : NaN;
		}
		get millisecond() {
			return this.isValid ? this.c.millisecond : NaN;
		}
		get weekYear() {
			return this.isValid ? Kr(this).weekYear : NaN;
		}
		get weekNumber() {
			return this.isValid ? Kr(this).weekNumber : NaN;
		}
		get weekday() {
			return this.isValid ? Kr(this).weekday : NaN;
		}
		get isWeekend() {
			return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
		}
		get localWeekday() {
			return this.isValid ? qr(this).weekday : NaN;
		}
		get localWeekNumber() {
			return this.isValid ? qr(this).weekNumber : NaN;
		}
		get localWeekYear() {
			return this.isValid ? qr(this).weekYear : NaN;
		}
		get ordinal() {
			return this.isValid ? et(this.c).ordinal : NaN;
		}
		get monthShort() {
			return this.isValid ? _r.months("short", { locObj: this.loc })[this.month - 1] : null;
		}
		get monthLong() {
			return this.isValid ? _r.months("long", { locObj: this.loc })[this.month - 1] : null;
		}
		get weekdayShort() {
			return this.isValid ? _r.weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
		}
		get weekdayLong() {
			return this.isValid ? _r.weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
		}
		get offset() {
			return this.isValid ? +this.o : NaN;
		}
		get offsetNameShort() {
			return this.isValid ? this.zone.offsetName(this.ts, {
				format: "short",
				locale: this.locale
			}) : null;
		}
		get offsetNameLong() {
			return this.isValid ? this.zone.offsetName(this.ts, {
				format: "long",
				locale: this.locale
			}) : null;
		}
		get isOffsetFixed() {
			return this.isValid ? this.zone.isUniversal : null;
		}
		get isInDST() {
			return this.isOffsetFixed ? !1 : this.offset > this.set({
				month: 1,
				day: 1
			}).offset || this.offset > this.set({ month: 5 }).offset;
		}
		getPossibleOffsets() {
			if (!this.isValid || this.isOffsetFixed) return [this];
			let e = 864e5, t = 6e4, n = Et(this.c), r = this.zone.offset(n - e), i = this.zone.offset(n + e), a = this.zone.offset(n - r * t), o = this.zone.offset(n - i * t);
			if (a === o) return [this];
			let s = n - a * t, c = n - o * t, l = Xr(s, a), u = Xr(c, o);
			return l.hour === u.hour && l.minute === u.minute && l.second === u.second && l.millisecond === u.millisecond ? [Jr(this, { ts: s }), Jr(this, { ts: c })] : [this];
		}
		get isInLeapYear() {
			return Ct(this.year);
		}
		get daysInMonth() {
			return Tt(this.year, this.month);
		}
		get daysInYear() {
			return this.isValid ? wt(this.year) : NaN;
		}
		get weeksInWeekYear() {
			return this.isValid ? Ot(this.weekYear) : NaN;
		}
		get weeksInLocalWeekYear() {
			return this.isValid ? Ot(this.localWeekYear, this.loc.getMinDaysInFirstWeek(), this.loc.getStartOfWeek()) : NaN;
		}
		resolvedLocaleOptions(e = {}) {
			let { locale: t, numberingSystem: n, calendar: r } = J.create(this.loc.clone(e), e).resolvedOptions(this);
			return {
				locale: t,
				numberingSystem: n,
				outputCalendar: r
			};
		}
		toUTC(e = 0, t = {}) {
			return this.setZone(z.instance(e), t);
		}
		toLocal() {
			return this.setZone(H.defaultZone);
		}
		setZone(t, { keepLocalTime: n = !1, keepCalendarTime: r = !1 } = {}) {
			if (t = Me(t, H.defaultZone), t.equals(this.zone)) return this;
			if (t.isValid) {
				let e = this.ts;
				if (n || r) {
					let n = t.offset(this.ts), r = this.toObject();
					[e] = Zr(r, n, t);
				}
				return Jr(this, {
					ts: e,
					zone: t
				});
			}
			return e.invalid(Gr(t));
		}
		reconfigure({ locale: e, numberingSystem: t, outputCalendar: n } = {}) {
			let r = this.loc.clone({
				locale: e,
				numberingSystem: t,
				outputCalendar: n
			});
			return Jr(this, { loc: r });
		}
		setLocale(e) {
			return this.reconfigure({ locale: e });
		}
		set(e) {
			if (!this.isValid) return this;
			let t = Nt(e, ui), { minDaysInFirstWeek: n, startOfWeek: r } = nt(t, this.loc), i = !G(t.weekYear) || !G(t.weekNumber) || !G(t.weekday), o = !G(t.ordinal), s = !G(t.year), c = !G(t.month) || !G(t.day), l = s || c, u = t.weekYear || t.weekNumber;
			if ((l || o) && u) throw new a("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
			if (c && o) throw new a("Can't mix ordinal dates with month/day");
			let d;
			i ? d = $e({
				...Qe(this.c, n, r),
				...t
			}, n, r) : G(t.ordinal) ? (d = {
				...this.toObject(),
				...t
			}, G(t.day) && (d.day = Math.min(Tt(d.year, d.month), d.day))) : d = tt({
				...et(this.c),
				...t
			});
			let [f, p] = Zr(d, this.o, this.zone);
			return Jr(this, {
				ts: f,
				o: p
			});
		}
		plus(e) {
			if (!this.isValid) return this;
			let t = X.fromDurationLike(e);
			return Jr(this, Qr(this, t));
		}
		minus(e) {
			if (!this.isValid) return this;
			let t = X.fromDurationLike(e).negate();
			return Jr(this, Qr(this, t));
		}
		startOf(e, { useLocaleWeeks: t = !1 } = {}) {
			if (!this.isValid) return this;
			let n = {}, r = X.normalizeUnit(e);
			switch (r) {
				case "years": n.month = 1;
				case "quarters":
				case "months": n.day = 1;
				case "weeks":
				case "days": n.hour = 0;
				case "hours": n.minute = 0;
				case "minutes": n.second = 0;
				case "seconds": n.millisecond = 0;
			}
			if (r === "weeks") {
				if (t) {
					let e = this.loc.getStartOfWeek(), { weekday: t } = this;
					t < e && (n.weekNumber = this.weekNumber - 1), n.weekday = e;
				} else n.weekday = 1;
			}
			return r === "quarters" && (n.month = (Math.ceil(this.month / 3) - 1) * 3 + 1), this.set(n);
		}
		endOf(e, t) {
			return this.isValid ? this.plus({ [e]: 1 }).startOf(e, t).minus(1) : this;
		}
		toFormat(e, t = {}) {
			return this.isValid ? J.create(this.loc.redefaultToEN(t)).formatDateTimeFromString(this, e) : Ur;
		}
		toLocaleString(e = f, t = {}) {
			return this.isValid ? J.create(this.loc.clone(t), e).formatDateTime(this) : Ur;
		}
		toLocaleParts(e = {}) {
			return this.isValid ? J.create(this.loc.clone(e), e).formatDateTimeParts(this) : [];
		}
		toISO({ format: e = "extended", suppressSeconds: t = !1, suppressMilliseconds: n = !1, includeOffset: r = !0, extendedZone: i = !1, precision: a = "milliseconds" } = {}) {
			if (!this.isValid) return null;
			a = li(a);
			let o = e === "extended", s = ti(this, o, a);
			return oi.indexOf(a) >= 3 && (s += "T"), s += ni(this, o, t, n, r, i, a), s;
		}
		toISODate({ format: e = "extended", precision: t = "day" } = {}) {
			return this.isValid ? ti(this, e === "extended", li(t)) : null;
		}
		toISOWeekDate() {
			return ei(this, "kkkk-'W'WW-c");
		}
		toISOTime({ suppressMilliseconds: e = !1, suppressSeconds: t = !1, includeOffset: n = !0, includePrefix: r = !1, extendedZone: i = !1, format: a = "extended", precision: o = "milliseconds" } = {}) {
			return this.isValid ? (o = li(o), (r && oi.indexOf(o) >= 3 ? "T" : "") + ni(this, a === "extended", t, e, n, i, o)) : null;
		}
		toRFC2822() {
			return ei(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", !1);
		}
		toHTTP() {
			return ei(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
		}
		toSQLDate() {
			return this.isValid ? ti(this, !0) : null;
		}
		toSQLTime({ includeOffset: e = !0, includeZone: t = !1, includeOffsetSpace: n = !0 } = {}) {
			let r = "HH:mm:ss.SSS";
			return (t || e) && (n && (r += " "), t ? r += "z" : e && (r += "ZZ")), ei(this, r, !0);
		}
		toSQL(e = {}) {
			return this.isValid ? `${this.toSQLDate()} ${this.toSQLTime(e)}` : null;
		}
		toString() {
			return this.isValid ? this.toISO() : Ur;
		}
		[Symbol.for("nodejs.util.inspect.custom")]() {
			return this.isValid ? `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }` : `DateTime { Invalid, reason: ${this.invalidReason} }`;
		}
		valueOf() {
			return this.toMillis();
		}
		toMillis() {
			return this.isValid ? this.ts : NaN;
		}
		toSeconds() {
			return this.isValid ? this.ts / 1e3 : NaN;
		}
		toUnixInteger() {
			return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
		}
		toJSON() {
			return this.toISO();
		}
		toBSON() {
			return this.toJSDate();
		}
		toObject(e = {}) {
			if (!this.isValid) return {};
			let t = { ...this.c };
			return e.includeConfig && (t.outputCalendar = this.outputCalendar, t.numberingSystem = this.loc.numberingSystem, t.locale = this.loc.locale), t;
		}
		toJSDate() {
			return new Date(this.isValid ? this.ts : NaN);
		}
		diff(e, t = "milliseconds", n = {}) {
			if (!this.isValid || !e.isValid) return X.invalid("created by diffing an invalid DateTime");
			let r = {
				locale: this.locale,
				numberingSystem: this.numberingSystem,
				...n
			}, i = pt(t).map(X.normalizeUnit), a = e.valueOf() > this.valueOf(), o = br(a ? this : e, a ? e : this, i, r);
			return a ? o.negate() : o;
		}
		diffNow(t = "milliseconds", n = {}) {
			return this.diff(e.now(), t, n);
		}
		until(e) {
			return this.isValid ? gr.fromDateTimes(this, e) : this;
		}
		hasSame(e, t, n) {
			if (!this.isValid) return !1;
			let r = e.valueOf(), i = this.setZone(e.zone, { keepLocalTime: !0 });
			return i.startOf(t, n) <= r && r <= i.endOf(t, n);
		}
		equals(e) {
			return this.isValid && e.isValid && this.valueOf() === e.valueOf() && this.zone.equals(e.zone) && this.loc.equals(e.loc);
		}
		toRelative(t = {}) {
			if (!this.isValid) return null;
			let n = t.base || e.fromObject({}, { zone: this.zone }), r = t.padding ? this < n ? -t.padding : t.padding : 0, i = [
				"years",
				"months",
				"days",
				"hours",
				"minutes",
				"seconds"
			], a = t.unit;
			return Array.isArray(t.unit) && (i = t.unit, a = void 0), pi(n, this.plus(r), {
				...t,
				numeric: "always",
				units: i,
				unit: a
			});
		}
		toRelativeCalendar(t = {}) {
			return this.isValid ? pi(t.base || e.fromObject({}, { zone: this.zone }), this, {
				...t,
				numeric: "auto",
				units: [
					"years",
					"months",
					"days"
				],
				calendary: !0
			}) : null;
		}
		static min(...t) {
			if (!t.every(e.isDateTime)) throw new s("min requires all arguments be DateTimes");
			return mt(t, (e) => e.valueOf(), Math.min);
		}
		static max(...t) {
			if (!t.every(e.isDateTime)) throw new s("max requires all arguments be DateTimes");
			return mt(t, (e) => e.valueOf(), Math.max);
		}
		static fromFormatExplain(e, t, n = {}) {
			let { locale: r = null, numberingSystem: i = null } = n;
			return Br(R.fromOpts({
				locale: r,
				numberingSystem: i,
				defaultToEN: !0
			}), e, t);
		}
		static fromStringExplain(t, n, r = {}) {
			return e.fromFormatExplain(t, n, r);
		}
		static buildFormatParser(e, t = {}) {
			let { locale: n = null, numberingSystem: r = null } = t;
			return new zr(R.fromOpts({
				locale: n,
				numberingSystem: r,
				defaultToEN: !0
			}), e);
		}
		static fromFormatParser(t, n, r = {}) {
			if (G(t) || G(n)) throw new s("fromFormatParser requires an input string and a format parser");
			let { locale: i = null, numberingSystem: a = null } = r, o = R.fromOpts({
				locale: i,
				numberingSystem: a,
				defaultToEN: !0
			});
			if (!o.equals(n.locale)) throw new s(`fromFormatParser called with a locale of ${o}, but the format parser was created for ${n.locale}`);
			let { result: c, zone: l, specificOffset: u, invalidReason: d } = n.explainFromTokens(t);
			return d ? e.invalid(d) : $r(c, l, r, `format ${n.format}`, t, u);
		}
		static get DATE_SHORT() {
			return f;
		}
		static get DATE_MED() {
			return p;
		}
		static get DATE_MED_WITH_WEEKDAY() {
			return m;
		}
		static get DATE_FULL() {
			return h;
		}
		static get DATE_HUGE() {
			return g;
		}
		static get TIME_SIMPLE() {
			return _;
		}
		static get TIME_WITH_SECONDS() {
			return v;
		}
		static get TIME_WITH_SHORT_OFFSET() {
			return y;
		}
		static get TIME_WITH_LONG_OFFSET() {
			return b;
		}
		static get TIME_24_SIMPLE() {
			return x;
		}
		static get TIME_24_WITH_SECONDS() {
			return S;
		}
		static get TIME_24_WITH_SHORT_OFFSET() {
			return C;
		}
		static get TIME_24_WITH_LONG_OFFSET() {
			return w;
		}
		static get DATETIME_SHORT() {
			return T;
		}
		static get DATETIME_SHORT_WITH_SECONDS() {
			return E;
		}
		static get DATETIME_MED() {
			return D;
		}
		static get DATETIME_MED_WITH_SECONDS() {
			return ee;
		}
		static get DATETIME_MED_WITH_WEEKDAY() {
			return te;
		}
		static get DATETIME_FULL() {
			return ne;
		}
		static get DATETIME_FULL_WITH_SECONDS() {
			return re;
		}
		static get DATETIME_HUGE() {
			return ie;
		}
		static get DATETIME_HUGE_WITH_SECONDS() {
			return ae;
		}
	};
	function _i(e) {
		if ($.isDateTime(e)) return e;
		if (e && e.valueOf && st(e.valueOf())) return $.fromJSDate(e);
		if (e && typeof e == "object") return $.fromObject(e);
		throw new s(`Unknown datetime argument: ${e}, of type ${typeof e}`);
	}
	e.DateTime = $, e.Duration = X, e.FixedOffsetZone = z, e.IANAZone = j, e.Info = _r, e.Interval = gr, e.InvalidZone = je, e.Settings = H, e.SystemZone = se, e.VERSION = "3.7.2", e.Zone = O;
})), v = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronDate = e.DAYS_IN_MONTH = e.DateMathOp = e.TimeUnit = void 0;
	var t = _(), n;
	(function(e) {
		e.Second = "Second", e.Minute = "Minute", e.Hour = "Hour", e.Day = "Day", e.Month = "Month", e.Year = "Year";
	})(n || (e.TimeUnit = n = {}));
	var r;
	(function(e) {
		e.Add = "Add", e.Subtract = "Subtract";
	})(r || (e.DateMathOp = r = {})), e.DAYS_IN_MONTH = Object.freeze([
		31,
		29,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	]);
	var i = class i {
		#e;
		#t = null;
		#n = null;
		#r = null;
		constructor(e, n) {
			let r = { zone: n };
			if (e ? e instanceof i ? (this.#e = e.#e, this.#t = e.#t, this.#n = e.#n, this.#r = e.#r) : e instanceof Date ? this.#e = t.DateTime.fromJSDate(e, r) : typeof e == "number" ? this.#e = t.DateTime.fromMillis(e, r) : (this.#e = t.DateTime.fromISO(e, r), this.#e.isValid || (this.#e = t.DateTime.fromRFC2822(e, r)), this.#e.isValid || (this.#e = t.DateTime.fromSQL(e, r)), this.#e.isValid || (this.#e = t.DateTime.fromFormat(e, "EEE, d MMM yyyy HH:mm:ss", r))) : this.#e = t.DateTime.local(), !this.#e.isValid) throw Error(`CronDate: unhandled timestamp: ${e}`);
			n && n !== this.#e.zoneName && (this.#e = this.#e.setZone(n));
		}
		static #i(e) {
			return e % 4 == 0 && e % 100 != 0 || e % 400 == 0;
		}
		get dstStart() {
			return this.#t;
		}
		get dstStartLandingHour() {
			return this.#n;
		}
		clearDstStart() {
			this.#t = null, this.#n = null;
		}
		get dstEnd() {
			return this.#r;
		}
		set dstEnd(e) {
			this.#r = e;
		}
		addYear() {
			this.#e = this.#e.plus({ years: 1 });
		}
		addMonth() {
			this.#e = this.#e.plus({ months: 1 }).startOf("month");
		}
		addDay() {
			this.#e = this.#e.plus({ days: 1 }).startOf("day");
		}
		addHour() {
			this.#e = this.#e.plus({ hours: 1 }).startOf("hour");
		}
		addMinute() {
			this.#e = this.#e.plus({ minutes: 1 }).startOf("minute");
		}
		addSecond() {
			this.#e = this.#e.plus({ seconds: 1 });
		}
		subtractYear() {
			this.#e = this.#e.minus({ years: 1 });
		}
		subtractMonth() {
			this.#e = this.#e.minus({ months: 1 }).endOf("month").startOf("second");
		}
		subtractDay() {
			this.#e = this.#e.minus({ days: 1 }).endOf("day").startOf("second");
		}
		subtractHour() {
			this.#e = this.#e.minus({ hours: 1 }).endOf("hour").startOf("second");
		}
		subtractMinute() {
			this.#e = this.#e.minus({ minutes: 1 }).endOf("minute").startOf("second");
		}
		subtractSecond() {
			this.#e = this.#e.minus({ seconds: 1 });
		}
		addUnit(e) {
			switch (e) {
				case n.Year: return this.addYear();
				case n.Month: return this.addMonth();
				case n.Day: return this.addDay();
				case n.Hour: return this.addHour();
				case n.Minute: return this.addMinute();
				case n.Second: return this.addSecond();
			}
		}
		subtractUnit(e) {
			switch (e) {
				case n.Year: return this.subtractYear();
				case n.Month: return this.subtractMonth();
				case n.Day: return this.subtractDay();
				case n.Hour: return this.subtractHour();
				case n.Minute: return this.subtractMinute();
				case n.Second: return this.subtractSecond();
			}
		}
		invokeDateOperation(e, t) {
			if (e === r.Add) {
				this.addUnit(t);
				return;
			}
			if (e === r.Subtract) {
				this.subtractUnit(t);
				return;
			}
			/* istanbul ignore next - this would only happen if an end user call the handleMathOp with an invalid verb */
			throw Error(`Invalid verb: ${e}`);
		}
		getDate() {
			return this.#e.day;
		}
		getFullYear() {
			return this.#e.year;
		}
		getDay() {
			let e = this.#e.weekday;
			return e === 7 ? 0 : e;
		}
		getMonth() {
			return this.#e.month - 1;
		}
		getHours() {
			return this.#e.hour;
		}
		getMinutes() {
			return this.#e.minute;
		}
		getSeconds() {
			return this.#e.second;
		}
		getMilliseconds() {
			return this.#e.millisecond;
		}
		getUTCOffset() {
			return this.#e.offset;
		}
		setStartOfDay() {
			this.#e = this.#e.startOf("day");
		}
		setEndOfDay() {
			this.#e = this.#e.endOf("day");
		}
		getTime() {
			return this.#e.valueOf();
		}
		getUTCDate() {
			return this.#a().day;
		}
		getUTCFullYear() {
			return this.#a().year;
		}
		getUTCDay() {
			let e = this.#a().weekday;
			return e === 7 ? 0 : e;
		}
		getUTCMonth() {
			return this.#a().month - 1;
		}
		getUTCHours() {
			return this.#a().hour;
		}
		getUTCMinutes() {
			return this.#a().minute;
		}
		getUTCSeconds() {
			return this.#a().second;
		}
		toISOString() {
			return this.#e.toUTC().toISO();
		}
		toJSON() {
			return this.#e.toJSON();
		}
		setDate(e) {
			this.#e = this.#e.set({ day: e });
		}
		setFullYear(e) {
			this.#e = this.#e.set({ year: e });
		}
		setDay(e) {
			this.#e = this.#e.set({ weekday: e });
		}
		setMonth(e) {
			this.#e = this.#e.set({ month: e + 1 });
		}
		setHours(e) {
			this.#e = this.#e.set({ hour: e });
		}
		setMinutes(e) {
			this.#e = this.#e.set({ minute: e });
		}
		setSeconds(e) {
			this.#e = this.#e.set({ second: e });
		}
		setMilliseconds(e) {
			this.#e = this.#e.set({ millisecond: e });
		}
		toString() {
			return this.toDate().toString();
		}
		toDate() {
			return this.#e.toJSDate();
		}
		isLastDayOfMonth() {
			let { day: t, month: n } = this.#e;
			if (n === 2) {
				let r = i.#i(this.#e.year);
				return t === e.DAYS_IN_MONTH[n - 1] - +!r;
			}
			return t === e.DAYS_IN_MONTH[n - 1];
		}
		isLastWeekdayOfMonth() {
			let { day: t, month: n } = this.#e, r;
			return r = n === 2 ? e.DAYS_IN_MONTH[n - 1] - +!i.#i(this.#e.year) : e.DAYS_IN_MONTH[n - 1], t > r - 7;
		}
		applyDateOperation(e, t, i) {
			if (t === n.Month || t === n.Day) {
				this.invokeDateOperation(e, t);
				return;
			}
			let a = this.getHours(), o = this.getUTCOffset();
			this.invokeDateOperation(e, t);
			let s = this.getHours(), c = (s - a + 24) % 24;
			e === r.Add && this.getUTCOffset() > o && c >= 2 ? i !== 24 && (this.#t = (a + 1) % 24, this.#n = s) : c === 0 && this.getMinutes() === 0 && this.getSeconds() === 0 && i !== 24 && (this.dstEnd = s);
		}
		#a() {
			return this.#e.toUTC();
		}
	};
	e.CronDate = i, e.default = i;
})), y = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronMonth = void 0;
	var t = v(), n = g(), r = 1, i = 12, a = Object.freeze([]);
	e.CronMonth = class extends n.CronField {
		static get min() {
			return r;
		}
		static get max() {
			return i;
		}
		static get chars() {
			return a;
		}
		static get daysInMonth() {
			return t.DAYS_IN_MONTH;
		}
		constructor(e, t) {
			super(e, t), this.validate();
		}
		get values() {
			return super.values;
		}
	};
})), b = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronDayOfMonth = void 0;
	var t = g(), n = y(), r = 1, i = 31, a = Object.freeze(["L"]);
	e.CronDayOfMonth = class e extends t.CronField {
		static fromMonth(t, r, i) {
			if (t.length !== 1) return new e(r, i);
			let a = n.CronMonth.daysInMonth[t[0] - 1], o = r.filter((e) => typeof e != "number" || e <= a);
			return new e(o.length > 0 ? o : r, i);
		}
		static get min() {
			return r;
		}
		static get max() {
			return i;
		}
		static get chars() {
			return a;
		}
		static get validChars() {
			return /^[?,*\dLH/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
		}
		constructor(e, t) {
			super(e, t), this.validate();
		}
		get values() {
			return super.values;
		}
	};
})), x = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronDayOfWeek = void 0;
	var t = g(), n = 0, r = 7, i = Object.freeze(["L"]);
	e.CronDayOfWeek = class extends t.CronField {
		static get min() {
			return n;
		}
		static get max() {
			return r;
		}
		static get chars() {
			return i;
		}
		static get validChars() {
			return /^[?,*\dLH#/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
		}
		constructor(e, t) {
			if (super(e, t), this.validate(), this.values.some((e) => e === "L")) throw Error(`${this.constructor.name} Validation error, unexpected standalone L`);
		}
		get values() {
			return super.values;
		}
		get nthDay() {
			return this.options.nthDayOfWeek ?? 0;
		}
	};
})), S = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronHour = void 0;
	var t = g(), n = 0, r = 23, i = Object.freeze([]);
	e.CronHour = class extends t.CronField {
		static get min() {
			return n;
		}
		static get max() {
			return r;
		}
		static get chars() {
			return i;
		}
		constructor(e, t) {
			super(e, t), this.validate();
		}
		get values() {
			return super.values;
		}
	};
})), C = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronMinute = void 0;
	var t = g(), n = 0, r = 59, i = Object.freeze([]);
	e.CronMinute = class extends t.CronField {
		static get min() {
			return n;
		}
		static get max() {
			return r;
		}
		static get chars() {
			return i;
		}
		constructor(e, t) {
			super(e, t), this.validate();
		}
		get values() {
			return super.values;
		}
	};
})), w = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronSecond = void 0;
	var t = g(), n = 0, r = 59, i = Object.freeze([]);
	e.CronSecond = class extends t.CronField {
		static get min() {
			return n;
		}
		static get max() {
			return r;
		}
		static get chars() {
			return i;
		}
		constructor(e, t) {
			super(e, t), this.validate();
		}
		get values() {
			return super.values;
		}
	};
})), T = /* @__PURE__ */ c(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), n(h(), e), n(b(), e), n(x(), e), n(g(), e), n(S(), e), n(C(), e), n(y(), e), n(w(), e);
})), E = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronFieldCollection = void 0;
	var t = T();
	e.CronFieldCollection = class e {
		#e;
		#t;
		#n;
		#r;
		#i;
		#a;
		static from(n, r) {
			return new e({
				second: this.resolveField(t.CronSecond, n.second, r.second),
				minute: this.resolveField(t.CronMinute, n.minute, r.minute),
				hour: this.resolveField(t.CronHour, n.hour, r.hour),
				dayOfMonth: this.resolveField(t.CronDayOfMonth, n.dayOfMonth, r.dayOfMonth),
				month: this.resolveField(t.CronMonth, n.month, r.month),
				dayOfWeek: this.resolveField(t.CronDayOfWeek, n.dayOfWeek, r.dayOfWeek)
			});
		}
		static resolveField(e, n, r) {
			return r ? r instanceof t.CronField ? r : new e(r) : n;
		}
		constructor({ second: e, minute: n, hour: r, dayOfMonth: i, month: a, dayOfWeek: o }) {
			if (!e) throw Error("Validation error, Field second is missing");
			if (!n) throw Error("Validation error, Field minute is missing");
			if (!r) throw Error("Validation error, Field hour is missing");
			if (!i) throw Error("Validation error, Field dayOfMonth is missing");
			if (!a) throw Error("Validation error, Field month is missing");
			if (!o) throw Error("Validation error, Field dayOfWeek is missing");
			if (a.values.length === 1 && !i.hasLastChar && o.isWildcard && !(parseInt(i.values[0], 10) <= t.CronMonth.daysInMonth[a.values[0] - 1])) throw Error("Invalid explicit day of month definition");
			this.#e = e, this.#t = n, this.#n = r, this.#i = a, this.#a = o, this.#r = i;
		}
		get second() {
			return this.#e;
		}
		get minute() {
			return this.#t;
		}
		get hour() {
			return this.#n;
		}
		get dayOfMonth() {
			return this.#r;
		}
		get month() {
			return this.#i;
		}
		get dayOfWeek() {
			return this.#a;
		}
		static compactField(e) {
			if (e.length === 0) return [];
			let t = [], n;
			return e.forEach((e, r, i) => {
				if (n === void 0) {
					n = {
						start: e,
						count: 1
					};
					return;
				}
				let a = i[r - 1] || n.start, o = i[r + 1];
				if (e === "L" || e === "W") {
					t.push(n), t.push({
						start: e,
						count: 1
					}), n = void 0;
					return;
				}
				if (n.step === void 0 && o !== void 0) {
					let t = e - a;
					if (t <= o - e) {
						n = {
							...n,
							count: 2,
							end: e,
							step: t
						};
						return;
					}
					n.step = 1;
				}
				e - (n.end ?? 0) === n.step ? (n.count++, n.end = e) : (n.count === 1 ? t.push({
					start: n.start,
					count: 1
				}) : n.count === 2 ? (t.push({
					start: n.start,
					count: 1
				}), t.push({
					start: n.end ?? /* istanbul ignore next - see above */ a,
					count: 1
				})) : t.push(n), n = {
					start: e,
					count: 1
				});
			}), n && t.push(n), t;
		}
		static #o(e, n, r) {
			let i = n.step;
			return i ? i === 1 && n.start === e.min && n.end && n.end >= r ? (e instanceof t.CronDayOfMonth || e instanceof t.CronDayOfWeek) && !e.isWildcard ? null : e.hasQuestionMarkChar ? "?" : "*" : i !== 1 && n.start === e.min && n.end && n.end >= r - i + 1 ? `*/${i}` : null : null;
		}
		static #s(e) {
			let t = e.step;
			if (t === 1) return `${e.start}-${e.end}`;
			let n = e.start === 0 ? e.count - 1 : e.count;
			/* istanbul ignore if */
			if (!t) throw Error("Unexpected range step");
			/* istanbul ignore if */
			if (!e.end) throw Error("Unexpected range end");
			if (t * n > e.end) {
				let n = (n, r) => {
					/* istanbul ignore if */
					if (typeof e.start != "number") throw Error("Unexpected range start");
					return r % t === 0 ? e.start + r : null;
				};
				/* istanbul ignore if */
				if (typeof e.start != "number") throw Error("Unexpected range start");
				let r = { length: e.end - e.start + 1 };
				return Array.from(r, n).filter((e) => e !== null).join(",");
			}
			return `${e.start}-${e.end}/${t}`;
		}
		stringifyField(n) {
			let r = n.max, i = n.values;
			if (n instanceof t.CronDayOfWeek) {
				r = 6;
				let e = this.#a.values;
				i = e[e.length - 1] === 7 ? e.slice(0, -1) : e;
			}
			n instanceof t.CronDayOfMonth && (r = this.#i.values.length === 1 ? t.CronMonth.daysInMonth[this.#i.values[0] - 1] : n.max);
			let a = e.compactField(i);
			if (a.length === 1) {
				let t = e.#o(n, a[0], r);
				if (t) return t;
			}
			return a.map((r) => {
				let i = r.count === 1 ? r.start.toString() : e.#s(r);
				return n instanceof t.CronDayOfWeek && n.nthDay > 0 ? `${i}#${n.nthDay}` : i;
			}).join(",");
		}
		stringify(e = !1) {
			let t = [];
			return e && t.push(this.stringifyField(this.#e)), t.push(this.stringifyField(this.#t), this.stringifyField(this.#n), this.stringifyField(this.#r), this.stringifyField(this.#i), this.stringifyField(this.#a)), t.join(" ");
		}
		serialize() {
			return {
				second: this.#e.serialize(),
				minute: this.#t.serialize(),
				hour: this.#n.serialize(),
				dayOfMonth: this.#r.serialize(),
				month: this.#i.serialize(),
				dayOfWeek: this.#a.serialize()
			};
		}
	};
})), D = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronExpression = e.LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE = e.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE = void 0;
	var t = v();
	e.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE = "Out of the time span range", e.LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE = "Invalid expression, loop limit exceeded";
	var n = 1e4, r = class r {
		#e;
		#t;
		#n;
		#r;
		#i;
		#a;
		#o = null;
		#s = !1;
		constructor(e, n) {
			this.#e = n, this.#t = n.tz, this.#r = n.startDate ? new t.CronDate(n.startDate, this.#t) : null, this.#i = n.endDate ? new t.CronDate(n.endDate, this.#t) : null;
			let r = n.currentDate ?? n.startDate;
			if (r) {
				let e = new t.CronDate(r, this.#t);
				this.#r && e.getTime() < this.#r.getTime() ? r = this.#r : this.#i && e.getTime() > this.#i.getTime() && (r = this.#i);
			}
			this.#n = new t.CronDate(r, this.#t), this.#a = e;
		}
		get fields() {
			return this.#a;
		}
		static fieldsToExpression(e, t) {
			return new r(e, t || {});
		}
		static #c(e, t) {
			return t.some((t) => t === e);
		}
		#l(e, t) {
			return e[t ? e.length - 1 : 0];
		}
		#u(e) {
			let n = `${e.getFullYear()}-${e.getMonth() + 1}-${e.getDate()}`;
			if (this.#o === n) return this.#s;
			let r = new t.CronDate(e);
			r.setStartOfDay();
			let i = new t.CronDate(e);
			return i.setEndOfDay(), this.#o = n, this.#s = r.getUTCOffset() !== i.getUTCOffset(), this.#s;
		}
		#d(e, n, r) {
			let i = this.#a.second.values, a = e.getSeconds(), o = this.#a.second.findNearestValue(a, r);
			if (o !== null) {
				e.setSeconds(o);
				return;
			}
			e.applyDateOperation(n, t.TimeUnit.Minute, this.#a.hour.values.length), e.setSeconds(this.#l(i, r));
		}
		#f(e, n, r) {
			let i = this.#a.minute.values, a = this.#a.second.values, o = e.getMinutes(), s = this.#a.minute.findNearestValue(o, r);
			if (s !== null) {
				e.setMinutes(s), e.setSeconds(this.#l(a, r));
				return;
			}
			e.applyDateOperation(n, t.TimeUnit.Hour, this.#a.hour.values.length), e.setMinutes(this.#l(i, r)), e.setSeconds(this.#l(a, r));
		}
		static #p(e, t) {
			if (!t.isLastWeekdayOfMonth()) return !1;
			let n = t.getDay();
			return e.some((e) => n === parseInt(e.toString().charAt(0), 10) % 7);
		}
		static #m(e, t) {
			return e <= 0 || Math.ceil(t.getDate() / 7) === e;
		}
		next() {
			return this.#v();
		}
		prev() {
			return this.#v(!0);
		}
		hasNext() {
			let e = this.#n;
			try {
				return this.#v(), !0;
			} catch {
				return !1;
			} finally {
				this.#n = e;
			}
		}
		hasPrev() {
			let e = this.#n;
			try {
				return this.#v(!0), !0;
			} catch {
				return !1;
			} finally {
				this.#n = e;
			}
		}
		take(e) {
			let t = [];
			if (e >= 0) for (let n = 0; n < e; n++) try {
				t.push(this.next());
			} catch {
				return t;
			}
			else for (let n = 0; n > e; n--) try {
				t.push(this.prev());
			} catch {
				return t;
			}
			return t;
		}
		reset(e) {
			this.#n = new t.CronDate(e || this.#e.currentDate, this.#t);
		}
		stringify(e = !1) {
			return this.#a.stringify(e);
		}
		includesDate(e) {
			let { second: n, minute: r, hour: i, month: a } = this.#a, o = new t.CronDate(e, this.#t);
			return !(!n.values.includes(o.getSeconds()) || !r.values.includes(o.getMinutes()) || !i.values.includes(o.getHours()) || !a.values.includes(o.getMonth() + 1) || !this.#h(o));
		}
		toString() {
			/* istanbul ignore next - should be impossible under normal use to trigger the or branch */
			return this.#e.expression || this.stringify(!0);
		}
		#h(e) {
			let t = this.#a.dayOfMonth.isWildcard, n = !t, i = this.#a.dayOfWeek.isWildcard, a = !i, o = r.#c(e.getDate(), this.#a.dayOfMonth.values) || this.#a.dayOfMonth.hasLastChar && e.isLastDayOfMonth(), s = this.#a.dayOfWeek.nthDay, c = r.#c(e.getDay(), this.#a.dayOfWeek.values) && r.#m(s, e) || this.#a.dayOfWeek.hasLastChar && r.#p(this.#a.dayOfWeek.values, e);
			return !!(n && a && (o || c) || o && !a || t && !i && c);
		}
		#g(e, n, i) {
			let a = this.#a.hour.values, o = a, s = e.getHours(), c = r.#c(s, a), l = e.dstEnd === s;
			if (e.dstStart !== null && e.dstStartLandingHour === s) {
				for (let t = e.dstStart; t !== s; t = (t + 1) % 24) if (r.#c(t, a)) return !0;
			}
			if (l && !i) return e.dstEnd = null, e.applyDateOperation(t.DateMathOp.Add, t.TimeUnit.Hour, o.length), !1;
			if (c) return !0;
			e.clearDstStart();
			let u = this.#a.hour.findNearestValue(s, i);
			if (u === null) return e.applyDateOperation(n, t.TimeUnit.Day, o.length), !1;
			if (this.#u(e)) {
				let r = i ? s - u : u - s;
				for (let a = 0; a < r && (e.applyDateOperation(n, t.TimeUnit.Hour, o.length), !(!i && e.getHours() >= u || i && e.getHours() <= u)); a++);
			} else e.setHours(u);
			return e.setMinutes(this.#l(this.#a.minute.values, i)), e.setSeconds(this.#l(this.#a.second.values, i)), !1;
		}
		#_(t) {
			if (!this.#r && !this.#i) return;
			let n = t.getTime();
			if (this.#r && n < this.#r.getTime() || this.#i && n > this.#i.getTime()) throw Error(e.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE);
		}
		#v(i = !1) {
			let a = i ? t.DateMathOp.Subtract : t.DateMathOp.Add, o = new t.CronDate(this.#n), s = o.getTime();
			o.getMilliseconds() > 0 && (o.setMilliseconds(0), i || o.applyDateOperation(t.DateMathOp.Add, t.TimeUnit.Second, this.#a.hour.values.length));
			let c = 0;
			for (; ++c < n;) {
				if (this.#_(o), !this.#h(o)) {
					o.applyDateOperation(a, t.TimeUnit.Day, this.#a.hour.values.length);
					continue;
				}
				if (!r.#c(o.getMonth() + 1, this.#a.month.values)) {
					o.applyDateOperation(a, t.TimeUnit.Month, this.#a.hour.values.length);
					continue;
				}
				if (this.#g(o, a, i)) {
					if (!r.#c(o.getMinutes(), this.#a.minute.values)) {
						this.#f(o, a, i);
						continue;
					}
					if (!r.#c(o.getSeconds(), this.#a.second.values)) {
						this.#d(o, a, i);
						continue;
					}
					if (s === o.getTime()) {
						o.applyDateOperation(a, t.TimeUnit.Second, this.#a.hour.values.length);
						continue;
					}
					break;
				}
			}
			if (c >= n) throw Error(e.LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE);
			return this.#n = o, o;
		}
		[Symbol.iterator]() {
			return { next: () => {
				try {
					return {
						value: this.#v(),
						done: !1
					};
				} catch {
					return {
						value: void 0,
						done: !0
					};
				}
			} };
		}
	};
	e.CronExpression = r, e.default = r;
})), ee = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.seededRandom = r;
	function t(e) {
		let t = 2166136261;
		for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
		return () => t >>> 0;
	}
	function n(e) {
		return () => {
			let t = e += 1831565813;
			return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}
	function r(e) {
		return n(e ? t(e)() : Math.floor(Math.random() * 1e10));
	}
})), te = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronExpressionParser = e.DayOfWeek = e.Months = e.CronUnit = e.PredefinedExpressions = void 0;
	var t = E(), n = D(), r = ee(), i = T(), a;
	(function(e) {
		e["@yearly"] = "0 0 0 1 1 *", e["@annually"] = "0 0 0 1 1 *", e["@monthly"] = "0 0 0 1 * *", e["@weekly"] = "0 0 0 * * 0", e["@daily"] = "0 0 0 * * *", e["@hourly"] = "0 0 * * * *", e["@minutely"] = "0 * * * * *", e["@secondly"] = "* * * * * *", e["@weekdays"] = "0 0 0 * * 1-5", e["@weekends"] = "0 0 0 * * 0,6";
	})(a || (e.PredefinedExpressions = a = {}));
	var o;
	(function(e) {
		e.Second = "Second", e.Minute = "Minute", e.Hour = "Hour", e.DayOfMonth = "DayOfMonth", e.Month = "Month", e.DayOfWeek = "DayOfWeek";
	})(o || (e.CronUnit = o = {}));
	var s;
	(function(e) {
		e[e.jan = 1] = "jan", e[e.feb = 2] = "feb", e[e.mar = 3] = "mar", e[e.apr = 4] = "apr", e[e.may = 5] = "may", e[e.jun = 6] = "jun", e[e.jul = 7] = "jul", e[e.aug = 8] = "aug", e[e.sep = 9] = "sep", e[e.oct = 10] = "oct", e[e.nov = 11] = "nov", e[e.dec = 12] = "dec";
	})(s || (e.Months = s = {}));
	var c;
	(function(e) {
		e[e.sun = 0] = "sun", e[e.mon = 1] = "mon", e[e.tue = 2] = "tue", e[e.wed = 3] = "wed", e[e.thu = 4] = "thu", e[e.fri = 5] = "fri", e[e.sat = 6] = "sat";
	})(c || (e.DayOfWeek = c = {})), e.CronExpressionParser = class e {
		static parse(s, c = {}) {
			let { strict: l = !1, hashSeed: u } = c, d = (0, r.seededRandom)(u);
			s = a[s] || s;
			let f = e.#e(s, l);
			if (f.dayOfMonth !== "*" && f.dayOfWeek !== "*" && l) throw Error("Cannot use both dayOfMonth and dayOfWeek together in strict mode!");
			let p = e.#t(o.Second, f.second, i.CronSecond.constraints, d, l), m = e.#t(o.Minute, f.minute, i.CronMinute.constraints, d, l), h = e.#t(o.Hour, f.hour, i.CronHour.constraints, d, l), g = e.#t(o.Month, f.month, i.CronMonth.constraints, d, l), _ = e.#t(o.DayOfMonth, f.dayOfMonth, i.CronDayOfMonth.constraints, d, l), { dayOfWeek: v, nthDayOfWeek: y } = e.#m(f.dayOfWeek), b = e.#t(o.DayOfWeek, v, i.CronDayOfWeek.constraints, d, l), x = new t.CronFieldCollection({
				second: new i.CronSecond(p, { rawValue: f.second }),
				minute: new i.CronMinute(m, { rawValue: f.minute }),
				hour: new i.CronHour(h, { rawValue: f.hour }),
				dayOfMonth: i.CronDayOfMonth.fromMonth(g, _, { rawValue: f.dayOfMonth }),
				month: new i.CronMonth(g, { rawValue: f.month }),
				dayOfWeek: new i.CronDayOfWeek(b, {
					rawValue: f.dayOfWeek,
					nthDayOfWeek: y
				})
			});
			return new n.CronExpression(x, {
				...c,
				expression: s
			});
		}
		static #e(e, t) {
			if (t && !e.length) throw Error("Invalid cron expression");
			e ||= "0 * * * * *";
			let n = e.trim().split(/\s+/);
			if (t && n.length < 6) throw Error("Invalid cron expression, expected 6 fields");
			if (n.length > 6) throw Error("Invalid cron expression, too many fields");
			let r = [
				"0",
				"*",
				"*",
				"*",
				"*",
				"*"
			];
			n.length < r.length && n.unshift(...r.slice(0, r.length - n.length));
			let [i, a, o, s, c, l] = n;
			return {
				second: i,
				minute: a,
				hour: o,
				dayOfMonth: s,
				month: c,
				dayOfWeek: l
			};
		}
		static #t(e, t, n, r, i) {
			if ((e === o.Month || e === o.DayOfWeek) && (t = t.replace(/[a-z]{3}/gi, (e) => {
				e = e.toLowerCase();
				let t = s[e] || c[e];
				if (t === void 0) throw Error(`Validation error, cannot resolve alias "${e}"`);
				return t.toString();
			})), !n.validChars.test(t)) throw Error(`Invalid characters, got value: ${t}`);
			return t = this.#n(t, n), t = this.#r(t, n, r, e, i), this.#c(e, t, n);
		}
		static #n(e, t) {
			return e.replace(/[*?]/g, t.min + "-" + t.max);
		}
		static #r(t, n, r, i, a) {
			let o = r();
			return t.replace(/H(?:\((\d+)-(\d+)\))?(?:\/(\d+))?/g, (t, r, s, c) => {
				if (r && s && c) {
					let t = parseInt(r, 10), l = parseInt(s, 10), u = parseInt(c, 10);
					if (u <= 0) throw Error(`Invalid step: ${u}, must be positive`);
					let d = e.#o(t, l, n, i, a);
					return e.#s(o, d.min, d.max, u, i, a);
				}
				if (r && s) {
					let t = parseInt(r, 10), c = parseInt(s, 10), l = e.#o(t, c, n, i, a);
					return String(e.#i(o, l.min, l.max));
				}
				if (c) {
					let t = parseInt(c, 10);
					if (t <= 0) throw Error(`Invalid step: ${t}, must be positive`);
					return e.#s(o, n.min, n.max, t, i, a);
				}
				return String(e.#i(o, n.min, n.max));
			});
		}
		static #i(e, t, n) {
			return Math.floor(e * (n - t + 1)) + t;
		}
		static #a(e) {
			return e.charAt(0).toLowerCase() + e.slice(1);
		}
		static #o(t, n, r, i, a) {
			if (t > n) throw Error(`Invalid range: ${t}-${n}, min > max`);
			if (a && (t < r.min || n > r.max)) throw Error(`Invalid range: ${t}-${n}, outside the ${r.min}-${r.max} range of the ${e.#a(i)} field`);
			let o = Math.max(t, r.min), s = Math.min(n, r.max);
			if (o > s) throw Error(`Invalid range: ${t}-${n}, no usable value in the ${e.#a(i)} field`);
			return {
				min: o,
				max: s
			};
		}
		static #s(t, n, r, i, a, o) {
			if (o && i > r - n + 1) throw Error(`Invalid step: ${i}, wider than the ${n}-${r} range of the ${e.#a(a)} field`);
			let s = Math.floor(t * i), c = [];
			for (let e = Math.floor(n / i) * i + s; e <= r; e += i) e >= n && c.push(e);
			return c.length === 0 ? String(e.#i(t, n, r)) : c.join(",");
		}
		static #c(t, n, r) {
			let i = [];
			function a(n, r) {
				if (Array.isArray(n)) i.push(...n);
				else if (e.#h(r, n)) i.push(n);
				else {
					let e = parseInt(n.toString(), 10);
					if (!(e >= r.min && e <= r.max)) throw Error(`Constraint error, got value ${n} expected range ${r.min}-${r.max}`);
					i.push(t === o.DayOfWeek ? e % 7 : n);
				}
			}
			return n.split(",").forEach((n) => {
				if (!(n.length > 0)) throw Error("Invalid list value format");
				a(e.#l(t, n, r), r);
			}), i;
		}
		static #l(t, n, r) {
			let i = n.split("/");
			if (i.length > 2) throw Error(`Invalid repeat: ${n}`);
			return i.length === 2 ? (i[0].includes("-") || (i[0] = `${i[0]}-${r.max}`), e.#p(t, i[0], parseInt(i[1], 10), r)) : e.#p(t, n, 1, r);
		}
		static #u(e, t, n) {
			if (!(!isNaN(e) && !isNaN(t) && e >= n.min && t <= n.max)) throw Error(`Constraint error, got range ${e}-${t} expected range ${n.min}-${n.max}`);
			if (e > t) throw Error(`Invalid range: ${e}-${t}, min(${e}) > max(${t})`);
		}
		static #d(e) {
			if (!(!isNaN(e) && e > 0)) throw Error(`Constraint error, cannot repeat at every ${e} time.`);
		}
		static #f(e, t, n, r) {
			let i = [];
			e === o.DayOfWeek && n % 7 == 0 && (n - t) % r === 0 && i.push(0);
			for (let e = t; e <= n; e += r) i.indexOf(e) === -1 && i.push(e);
			return i;
		}
		static #p(e, t, n, r) {
			let i = t.split("-");
			if (i.length <= 1) return isNaN(+t) ? t : +t;
			let [a, o] = i.map((e) => parseInt(e, 10));
			return this.#u(a, o, r), this.#d(n), this.#f(e, a, o, n);
		}
		static #m(e) {
			let t = e.split("#");
			if (t.length <= 1) return { dayOfWeek: t[0] };
			let n = +t[t.length - 1], r = e.match(/([,\-/])/);
			if (r !== null) throw Error(`Constraint error, invalid dayOfWeek \`#\` and \`${r?.[0]}\` special characters are incompatible`);
			if (!(t.length <= 2 && !isNaN(n) && n >= 1 && n <= 5)) throw Error("Constraint error, invalid dayOfWeek occurrence number (#)");
			return {
				dayOfWeek: t[0],
				nthDayOfWeek: n
			};
		}
		static #h(e, t) {
			return e.chars.some((e) => t.toString().includes(e));
		}
	};
})), ne = /* @__PURE__ */ c(((e, t) => {
	t.exports = {};
})), re = /* @__PURE__ */ c(((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronFileParser = void 0;
	var t = te();
	e.CronFileParser = class e {
		static async parseFile(t) {
			let { readFile: n } = ne(), r = await n(t, "utf8");
			return e.#e(r);
		}
		static parseFileSync(t) {
			let { readFileSync: n } = ne(), r = n(t, "utf8");
			return e.#e(r);
		}
		static #e(t) {
			let n = t.split("\n"), r = {
				variables: {},
				expressions: [],
				errors: {}
			};
			for (let t of n) {
				let n = t.trim();
				if (n.length === 0 || n.startsWith("#")) continue;
				let i = n.match(/^(.*)=(.*)$/);
				if (i) {
					let [, e, t] = i;
					r.variables[e] = t.replace(/["']/g, "");
					continue;
				}
				try {
					let t = e.#t(n);
					r.expressions.push(t.interval);
				} catch (e) {
					r.errors[n] = e;
				}
			}
			return r;
		}
		static #t(e) {
			let n = e.split(" ");
			return {
				interval: t.CronExpressionParser.parse(n.slice(0, 5).join(" ")),
				command: n.slice(5, n.length)
			};
		}
	};
})), ie = (/* @__PURE__ */ c(((e) => {
	var t = e && e.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), n = e && e.__exportStar || function(e, n) {
		for (var r in e) r !== "default" && !Object.prototype.hasOwnProperty.call(n, r) && t(n, e, r);
	};
	Object.defineProperty(e, "__esModule", { value: !0 }), e.CronFileParser = e.CronExpressionParser = e.CronExpression = e.CronFieldCollection = e.CronDate = void 0;
	/* istanbul ignore file */
	var r = te(), i = v();
	Object.defineProperty(e, "CronDate", {
		enumerable: !0,
		get: function() {
			return i.CronDate;
		}
	});
	var a = E();
	Object.defineProperty(e, "CronFieldCollection", {
		enumerable: !0,
		get: function() {
			return a.CronFieldCollection;
		}
	});
	var o = D();
	Object.defineProperty(e, "CronExpression", {
		enumerable: !0,
		get: function() {
			return o.CronExpression;
		}
	});
	var s = te();
	Object.defineProperty(e, "CronExpressionParser", {
		enumerable: !0,
		get: function() {
			return s.CronExpressionParser;
		}
	});
	var c = re();
	Object.defineProperty(e, "CronFileParser", {
		enumerable: !0,
		get: function() {
			return c.CronFileParser;
		}
	}), n(T(), e), e.default = r.CronExpressionParser;
})))();
function ae(e, t) {
	if (!e?.trim()) return !1;
	try {
		let n = new Date(t);
		n.setMilliseconds(0);
		let r = /* @__PURE__ */ new Date(n.getTime() - 1e3);
		return ie.CronExpressionParser.parse(e, { currentDate: r }).next().getTime() === n.getTime();
	} catch {
		return !1;
	}
}
function O(e, t = /* @__PURE__ */ new Date()) {
	if (!e?.trim()) return null;
	try {
		return ie.CronExpressionParser.parse(e, { currentDate: t }).next().toDate();
	} catch {
		return null;
	}
}
function oe() {
	let e = /* @__PURE__ */ new Map();
	return {
		shouldDispatch(t, n, r) {
			let i = `${t}:${n}`;
			return e.get(i) !== r && (e.set(i, r), !0);
		},
		clear(t) {
			for (let n of e.keys()) (!t || n.startsWith(`${t}:`)) && e.delete(n);
		}
	};
}
function se(e, { timecode: t, key: n, date: r }) {
	let i = [];
	return e.forEach((e, a) => e.cues.forEach((o) => {
		e.timecodeEnabled && t && o.ltcTrigger === t && i.push({
			group: e,
			groupIndex: a,
			cue: o,
			source: "timecode",
			observedValue: t
		}), e.hotkeyEnabled && n && o.hotkey.toLowerCase() === n.toLowerCase() && i.push({
			group: e,
			groupIndex: a,
			cue: o,
			source: "hotkey",
			observedValue: n.toLowerCase()
		}), e.clockEnabled && r && ae(o.cron, r) && i.push({
			group: e,
			groupIndex: a,
			cue: o,
			source: "cron",
			observedValue: r.toISOString().slice(0, 19)
		});
	})), i;
}
//#endregion
//#region src/components/CueTable.jsx
var k = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100", A = "min-h-8 min-w-8 rounded-md border border-slate-300 px-1 text-sm font-bold hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-60 disabled:hover:border-slate-200 dark:border-slate-700 dark:disabled:border-slate-800 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";
function ce(e, t) {
	return e.status === "DONE" ? 100 : e.status === "LIVE" ? e[t] ?? 0 : 0;
}
function le(e, t) {
	if (!e.cron?.trim()) return "—";
	let n = O(e.cron, t);
	if (!n) return "invalid cron";
	let r = (e) => String(e).padStart(2, "0");
	return `next ${r(n.getHours())}:${r(n.getMinutes())}:${r(n.getSeconds())}`;
}
var ue = [
	[
		"every-second",
		"Every second",
		"* * * * * *"
	],
	[
		"every-minute",
		"Every minute",
		"0 * * * * *"
	],
	[
		"every-hour",
		"Every hour",
		"0 0 * * * *"
	],
	[
		"interval",
		"Every custom interval",
		null
	],
	[
		"daily",
		"Every day at a time",
		null
	],
	[
		"weekly",
		"Every week on a day",
		null
	],
	[
		"custom",
		"Advanced cron expression",
		null
	]
], de = [
	"seconds",
	"minutes",
	"hours",
	"day of month",
	"month",
	"day of week"
];
function j(e) {
	let t = String(e ?? "").trim().split(/\s+/).filter(Boolean), n = t.length === 5 ? ["0", ...t] : t;
	return Array.from({ length: 6 }, (e, t) => n[t] ?? "*");
}
function M(e, t, n, r, i, a) {
	if (e === "custom") return r;
	if (e === "interval") {
		let e = Math.max(1, Number(i) || 1);
		return a === "minutes" ? `0 */${Math.min(e, 59)} * * * *` : a === "hours" ? `0 0 */${Math.min(e, 23)} * * *` : a === "days" ? `0 0 0 */${Math.min(e, 31)} * *` : `*/${Math.min(e, 59)} * * * * *`;
	}
	let [o, s] = t.split(":").map(Number);
	return e === "daily" || e === "weekly" ? `0 ${s || 0} ${o || 0} * * ${e === "weekly" ? n : "*"}` : ue.find(([t]) => t === e)?.[2] ?? "";
}
function fe(e) {
	let t = e.trim();
	if (!t) return {
		valid: !1,
		message: "Enter a cron expression."
	};
	let n = O(t, /* @__PURE__ */ new Date());
	if (!n) return {
		valid: !1,
		message: "Invalid cron expression."
	};
	let r = (e) => String(e).padStart(2, "0");
	return {
		valid: !0,
		message: `Valid cron expression · Next run: ${n.toLocaleDateString()} ${r(n.getHours())}:${r(n.getMinutes())}:${r(n.getSeconds())}`
	};
}
function pe({ cue: e, onApply: n, onClose: r }) {
	let [a, c] = i("custom"), [l, u] = i("12:00"), [d, f] = i("1"), [p, m] = i("1"), [h, g] = i("seconds"), [_, v] = i(e.cron || "* * * * * *"), [y, b] = i(() => j(e.cron || "* * * * * *")), x = M(a, l, d, _, p, h), S = fe(x);
	t(() => {
		a !== "custom" && b(j(x));
	}, [a, x]);
	let C = (e, t) => {
		let n = y.map((n, r) => r === e ? t : n);
		b(n), v(n.join(" ")), c("custom");
	};
	return /* @__PURE__ */ o("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4",
		role: "presentation",
		children: /* @__PURE__ */ s("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "clock-schedule-title",
			className: "w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900",
			children: [
				/* @__PURE__ */ o("h2", {
					id: "clock-schedule-title",
					className: "text-lg font-black",
					children: "Clock schedule"
				}),
				/* @__PURE__ */ o("p", {
					className: "mt-1 text-sm text-slate-500",
					children: "Choose a friendly schedule or enter cron directly."
				}),
				/* @__PURE__ */ s("label", {
					className: "mt-4 block text-sm font-bold",
					children: ["Schedule frequency", /* @__PURE__ */ o("select", {
						className: `${k} mt-1`,
						"aria-label": "Schedule frequency",
						value: a,
						onChange: (e) => c(e.target.value),
						children: ue.map(([e, t]) => /* @__PURE__ */ o("option", {
							value: e,
							children: t
						}, e))
					})]
				}),
				(a === "daily" || a === "weekly") && /* @__PURE__ */ s("label", {
					className: "mt-3 block text-sm font-bold",
					children: ["Time", /* @__PURE__ */ o("input", {
						className: `${k} mt-1`,
						type: "time",
						value: l,
						onChange: (e) => u(e.target.value)
					})]
				}),
				a === "weekly" && /* @__PURE__ */ s("label", {
					className: "mt-3 block text-sm font-bold",
					children: ["Day", /* @__PURE__ */ s("select", {
						className: `${k} mt-1`,
						value: d,
						onChange: (e) => f(e.target.value),
						children: [
							/* @__PURE__ */ o("option", {
								value: "0",
								children: "Sunday"
							}),
							/* @__PURE__ */ o("option", {
								value: "1",
								children: "Monday"
							}),
							/* @__PURE__ */ o("option", {
								value: "2",
								children: "Tuesday"
							}),
							/* @__PURE__ */ o("option", {
								value: "3",
								children: "Wednesday"
							}),
							/* @__PURE__ */ o("option", {
								value: "4",
								children: "Thursday"
							}),
							/* @__PURE__ */ o("option", {
								value: "5",
								children: "Friday"
							}),
							/* @__PURE__ */ o("option", {
								value: "6",
								children: "Saturday"
							})
						]
					})]
				}),
				a === "interval" && /* @__PURE__ */ s("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ s("label", {
						className: "text-sm font-bold",
						children: ["Interval amount", /* @__PURE__ */ o("input", {
							className: `${k} mt-1`,
							type: "number",
							min: "1",
							"aria-label": "Interval amount",
							value: p,
							onChange: (e) => m(e.target.value)
						})]
					}), /* @__PURE__ */ s("label", {
						className: "text-sm font-bold",
						children: ["Interval unit", /* @__PURE__ */ s("select", {
							className: `${k} mt-1`,
							"aria-label": "Interval unit",
							value: h,
							onChange: (e) => g(e.target.value),
							children: [
								/* @__PURE__ */ o("option", {
									value: "seconds",
									children: "Seconds"
								}),
								/* @__PURE__ */ o("option", {
									value: "minutes",
									children: "Minutes"
								}),
								/* @__PURE__ */ o("option", {
									value: "hours",
									children: "Hours"
								}),
								/* @__PURE__ */ o("option", {
									value: "days",
									children: "Days"
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ s("label", {
					className: "mt-3 block text-sm font-bold",
					children: ["Cron expression", /* @__PURE__ */ o("input", {
						className: `${k} mt-1 font-mono`,
						"aria-label": "Custom cron expression",
						value: x,
						onChange: (e) => {
							v(e.target.value), b(j(e.target.value)), c("custom");
						}
					})]
				}),
				/* @__PURE__ */ s("fieldset", {
					className: "mt-3",
					children: [
						/* @__PURE__ */ o("legend", {
							className: "text-sm font-bold",
							children: "Full cron fields"
						}),
						/* @__PURE__ */ o("p", {
							className: "mt-1 text-xs text-slate-500",
							children: "Use values, ranges (`1-5`), lists (`1,5`), or steps (`*/10`)."
						}),
						/* @__PURE__ */ o("div", {
							className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3",
							children: de.map((e, t) => /* @__PURE__ */ s("label", {
								className: "text-xs font-bold capitalize",
								children: [e, /* @__PURE__ */ o("input", {
									className: `${k} mt-1 font-mono`,
									"aria-label": `Cron ${e}`,
									value: y[t],
									onChange: (e) => C(t, e.target.value)
								})]
							}, e))
						})
					]
				}),
				/* @__PURE__ */ o("p", {
					role: "status",
					"aria-live": "polite",
					className: `mt-3 text-sm font-semibold ${S.valid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`,
					children: S.message
				}),
				/* @__PURE__ */ s("div", {
					className: "mt-5 flex justify-end gap-2",
					children: [/* @__PURE__ */ o("button", {
						className: A,
						onClick: r,
						children: "Cancel"
					}), /* @__PURE__ */ o("button", {
						className: `${A} border-cyan-500 bg-cyan-500 text-white`,
						onClick: () => {
							n(x.trim()), r();
						},
						children: "Apply schedule"
					})]
				})
			]
		})
	});
}
function N({ cues: e, groups: n, now: c, enabledModes: l = {}, columnWidths: f = d, onColumnResize: p = () => {}, onColumnReset: h = () => {}, onChange: g, onBlurCommand: _, onInsert: v, onMove: y, onRemove: b, onDuplicate: x = () => {}, audioMediaByCueId: S = {}, onAudioFileSelect: C = () => {}, onAudioClear: w = () => {} }) {
	let [T, E] = i(null), D = u.filter((e) => (e.id !== "hotkey" || l.hotkey) && (e.id !== "ltc" || l.timecode) && (e.id !== "clock" || l.clock)), ee = m(Object.fromEntries(D.map((e) => [e.id, f[e.id] ?? e.width]))), te = f.content ?? u.find((e) => e.id === "content").width, ne = ee - te, re = r(null), [ie, ae] = i(0), O = Math.max(u.find((e) => e.id === "content").min, ie ? ie - ne : te), oe = r(null);
	t(() => () => oe.current?.(), []), t(() => {
		let e = re.current;
		if (!e || typeof ResizeObserver > "u") return;
		let t = new ResizeObserver(([e]) => ae(e.contentRect.width));
		return t.observe(e), () => t.disconnect();
	}, []);
	let se = (e, t) => {
		e.preventDefault(), e.stopPropagation(), oe.current?.();
		let n = e.clientX, r = f[t.id] ?? t.width, i = (e) => p(t.id, r + e.clientX - n), a = () => {
			window.removeEventListener("pointermove", i), window.removeEventListener("pointerup", a), oe.current = null;
		};
		oe.current = a, window.addEventListener("pointermove", i), window.addEventListener("pointerup", a);
	}, ue = (e, t) => {
		[
			"ArrowLeft",
			"ArrowRight",
			"Home"
		].includes(e.key) && (e.preventDefault(), e.key === "Home" ? h(t.id) : p(t.id, (f[t.id] ?? t.width) + (e.key === "ArrowRight" ? 10 : -10)));
	};
	return /* @__PURE__ */ s("div", {
		ref: re,
		className: "overflow-x-auto border-t border-slate-200 dark:border-slate-800",
		children: [/* @__PURE__ */ s("table", {
			className: "table-fixed text-left text-base",
			style: {
				width: "100%",
				minWidth: "100%"
			},
			children: [
				/* @__PURE__ */ o("colgroup", { children: D.map((e) => /* @__PURE__ */ o("col", {
					"data-column": e.id,
					style: { width: e.id === "content" ? O : f[e.id] ?? e.width }
				}, e.id)) }),
				/* @__PURE__ */ o("thead", {
					className: "bg-slate-100 text-sm uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400",
					children: /* @__PURE__ */ o("tr", { children: D.map((e) => /* @__PURE__ */ s("th", {
						className: "relative select-none px-3 py-3 pr-5",
						children: [e.label, /* @__PURE__ */ o("span", {
							role: "separator",
							tabIndex: 0,
							"aria-label": `Resize ${e.label} column`,
							"aria-orientation": "vertical",
							"aria-valuemin": e.min,
							"aria-valuemax": 2e3,
							"aria-valuenow": f[e.id] ?? e.width,
							className: "absolute inset-y-0 right-0 z-10 w-3 cursor-col-resize touch-none border-r border-slate-300 hover:border-cyan-500 focus:border-cyan-500 focus:outline-none dark:border-slate-700",
							onPointerDown: (t) => se(t, e),
							onDoubleClick: () => h(e.id),
							onKeyDown: (t) => ue(t, e)
						})]
					}, e.id)) })
				}),
				/* @__PURE__ */ o("tbody", { children: e.map((t, r) => /* @__PURE__ */ s("tr", {
					className: "border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50",
					children: [
						/* @__PURE__ */ o("td", {
							className: "px-3 py-3",
							children: /* @__PURE__ */ o("span", {
								className: `rounded-full px-2 py-1 text-sm font-bold ${t.status === "LIVE" ? "bg-amber-100 text-amber-800" : t.status === "DONE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`,
								children: t.status
							})
						}),
						/* @__PURE__ */ o("td", {
							className: "px-2",
							children: /* @__PURE__ */ s("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ o("span", {
									"aria-label": `${t.type === "audio" ? "Audio" : t.type === "trigger" ? "Trigger" : "Command"} cue`,
									className: "text-sm",
									children: t.type === "audio" ? "♪" : t.type === "trigger" ? "↪" : "⌘"
								}), /* @__PURE__ */ o("input", {
									className: k,
									"aria-label": `Name for cue ${r + 1}`,
									value: t.name,
									onChange: (e) => g(t.id, { name: e.target.value })
								})]
							})
						}),
						/* @__PURE__ */ o("td", {
							className: "px-2",
							children: /* @__PURE__ */ s("div", {
								className: `grid gap-2 ${t.type === "trigger" ? "grid-cols-4" : "grid-cols-[minmax(7rem,.7fr)_minmax(10rem,1.3fr)]"}`,
								children: [/* @__PURE__ */ s("select", {
									className: k,
									"aria-label": `Type for cue ${r + 1}`,
									value: t.type,
									onChange: (e) => g(t.id, {
										type: e.target.value,
										audioAction: e.target.value === "audio" ? "play" : t.audioAction,
										targetGroupName: "",
										targetCueName: ""
									}),
									children: [
										/* @__PURE__ */ o("option", {
											value: "command",
											children: "Command"
										}),
										/* @__PURE__ */ o("option", {
											value: "trigger",
											children: "Trigger cue"
										}),
										/* @__PURE__ */ o("option", {
											value: "audio",
											children: "Audio"
										})
									]
								}), t.type === "trigger" ? /* @__PURE__ */ s(a, { children: [
									/* @__PURE__ */ s("select", {
										className: k,
										"aria-label": `Target group for cue ${r + 1}`,
										value: t.targetGroupName,
										onChange: (e) => g(t.id, {
											targetGroupName: e.target.value,
											targetCueName: ""
										}),
										children: [/* @__PURE__ */ o("option", {
											value: "",
											children: "Target group…"
										}), n.map((e) => /* @__PURE__ */ o("option", {
											value: e.name,
											children: e.name
										}, e.id))]
									}),
									/* @__PURE__ */ s("select", {
										className: k,
										"aria-label": `Target cue for cue ${r + 1}`,
										value: t.targetCueName,
										onChange: (e) => g(t.id, { targetCueName: e.target.value }),
										children: [/* @__PURE__ */ o("option", {
											value: "",
											children: "Target cue…"
										}), n.find((e) => e.name === t.targetGroupName)?.cues.map((e) => /* @__PURE__ */ o("option", {
											value: e.name,
											children: e.name
										}, e.id))]
									}),
									/* @__PURE__ */ s("select", {
										className: k,
										"aria-label": `Trigger action for cue ${r + 1}`,
										value: t.targetAction,
										onChange: (e) => g(t.id, { targetAction: e.target.value }),
										children: [
											/* @__PURE__ */ o("option", {
												value: "start",
												children: "Start"
											}),
											/* @__PURE__ */ o("option", {
												value: "pause",
												children: "Pause"
											}),
											/* @__PURE__ */ o("option", {
												value: "stop",
												children: "Stop"
											})
										]
									})
								] }) : t.type === "audio" ? /* @__PURE__ */ s("div", {
									className: "flex min-w-0 items-center gap-1",
									children: [
										/* @__PURE__ */ s("select", {
											className: `${k} !w-28 shrink-0`,
											"aria-label": `Audio action for cue ${r + 1}`,
											value: t.audioAction,
											onChange: (e) => g(t.id, { audioAction: e.target.value }),
											children: [
												/* @__PURE__ */ o("option", {
													value: "play",
													children: "Play"
												}),
												/* @__PURE__ */ o("option", {
													value: "pause",
													children: "Pause"
												}),
												/* @__PURE__ */ o("option", {
													value: "stop",
													children: "Stop"
												})
											]
										}),
										/* @__PURE__ */ s("label", {
											className: `${A} shrink-0 cursor-pointer`,
											children: [
												/* @__PURE__ */ s("span", {
													className: "sr-only",
													children: ["Audio track for cue ", r + 1]
												}),
												"File",
												/* @__PURE__ */ o("input", {
													className: "sr-only",
													type: "file",
													accept: "audio/mpeg,audio/wav,.mp3,.wav",
													"aria-label": `Audio track for cue ${r + 1}`,
													onChange: (e) => {
														C(t.id, e.target.files?.[0]), e.target.value = "";
													}
												})
											]
										}),
										S[t.id] && /* @__PURE__ */ o("button", {
											className: `${A} shrink-0`,
											"aria-label": `Clear audio track for cue ${r + 1}`,
											onClick: () => w(t.id),
											children: "×"
										}),
										/* @__PURE__ */ o("span", {
											className: "min-w-0 truncate text-sm",
											children: S[t.id]?.name || ""
										})
									]
								}) : /* @__PURE__ */ o("input", {
									className: k,
									"aria-label": `Command for cue ${r + 1}`,
									value: t.command,
									onChange: (e) => g(t.id, { command: e.target.value }),
									onBlur: () => _(t.id)
								})]
							})
						}),
						l.hotkey && /* @__PURE__ */ o("td", {
							className: "px-2",
							children: /* @__PURE__ */ o("input", {
								className: k,
								maxLength: 1,
								"aria-label": `Hotkey for cue ${r + 1}`,
								value: t.hotkey,
								onChange: (e) => g(t.id, { hotkey: e.target.value.slice(0, 1) })
							})
						}),
						l.timecode && /* @__PURE__ */ o("td", {
							className: "px-2",
							children: /* @__PURE__ */ o("input", {
								className: k,
								"aria-label": `LTC trigger for cue ${r + 1}`,
								placeholder: "01:00:00:00",
								value: t.ltcTrigger,
								onChange: (e) => g(t.id, { ltcTrigger: e.target.value })
							})
						}),
						l.clock && /* @__PURE__ */ o("td", {
							className: "px-2",
							children: /* @__PURE__ */ s("div", {
								className: "flex flex-col gap-1",
								children: [/* @__PURE__ */ o("input", {
									className: k,
									"aria-label": `Cron for cue ${r + 1}`,
									placeholder: "* * * * * *",
									value: t.cron,
									readOnly: !0,
									onClick: () => E(t)
								}), /* @__PURE__ */ o("span", {
									className: "px-1 font-mono text-sm text-slate-500 dark:text-slate-400",
									children: le(t, c)
								})]
							})
						}),
						/* @__PURE__ */ s("td", {
							className: "px-2",
							children: [
								/* @__PURE__ */ o("input", {
									className: k,
									type: "number",
									min: "0",
									"aria-label": `Before-wait for cue ${r + 1}`,
									value: t.beforeWaitMs,
									onChange: (e) => g(t.id, { beforeWaitMs: Math.max(0, Number(e.target.value) || 0) })
								}),
								/* @__PURE__ */ o("div", {
									className: "mt-1 h-[3px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
									"aria-label": `Before-wait progress for cue ${r + 1}`,
									children: /* @__PURE__ */ o("div", {
										className: "h-full bg-violet-500 transition-[width]",
										style: { width: `${ce(t, "beforeProgress")}%` }
									})
								}),
								/* @__PURE__ */ s("span", {
									className: "sr-only",
									children: [ce(t, "beforeProgress"), "% before-wait"]
								})
							]
						}),
						/* @__PURE__ */ s("td", {
							className: "px-2",
							children: [
								/* @__PURE__ */ o("input", {
									className: k,
									type: "number",
									min: "0",
									"aria-label": `After-wait for cue ${r + 1}`,
									value: t.afterWaitMs,
									onChange: (e) => g(t.id, { afterWaitMs: Math.max(0, Number(e.target.value) || 0) })
								}),
								/* @__PURE__ */ o("div", {
									className: "mt-1 h-[3px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
									"aria-label": `After-wait progress for cue ${r + 1}`,
									children: /* @__PURE__ */ o("div", {
										className: "h-full bg-cyan-500 transition-[width]",
										style: { width: `${ce(t, "afterProgress")}%` }
									})
								}),
								/* @__PURE__ */ s("span", {
									className: "sr-only",
									children: [ce(t, "afterProgress"), "% after-wait"]
								})
							]
						}),
						/* @__PURE__ */ o("td", {
							className: "px-2",
							children: /* @__PURE__ */ s("div", {
								className: "flex flex-wrap gap-1",
								children: [
									/* @__PURE__ */ o("button", {
										className: A,
										"aria-label": `Insert after cue ${r + 1}`,
										onClick: () => v(r),
										children: "+"
									}),
									/* @__PURE__ */ o("button", {
										className: A,
										"aria-label": `Duplicate cue ${r + 1}`,
										onClick: () => x(r),
										children: "⧉"
									}),
									/* @__PURE__ */ o("button", {
										className: A,
										"aria-label": `Move cue ${r + 1} up`,
										disabled: r === 0,
										onClick: () => y(r, -1),
										children: "↑"
									}),
									/* @__PURE__ */ o("button", {
										className: A,
										"aria-label": `Move cue ${r + 1} down`,
										disabled: r === e.length - 1,
										onClick: () => y(r, 1),
										children: "↓"
									}),
									/* @__PURE__ */ o("button", {
										className: `${A} text-rose-600`,
										"aria-label": `Delete cue ${r + 1}`,
										onClick: () => b(t.id),
										children: "×"
									})
								]
							})
						})
					]
				}, t.id)) })
			]
		}), T && /* @__PURE__ */ o(pe, {
			cue: T,
			onApply: (e) => {
				g(T.id, { cron: e }), E(null);
			},
			onClose: () => E(null)
		})]
	});
}
//#endregion
//#region src/components/MobileCueCards.jsx
var P = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100", me = "min-h-11 min-w-11 rounded-md border border-slate-300 px-2 text-base font-bold hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700";
function F(e, t) {
	if (!e.cron?.trim()) return "—";
	let n = O(e.cron, t);
	return n ? `next ${n.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: !1
	})}` : "invalid cron";
}
function he({ cues: e, groups: t, now: n, onChange: r, onBlurCommand: i, onInsert: a, onMove: c, onRemove: l }) {
	return /* @__PURE__ */ o("div", {
		className: "space-y-3 border-t border-slate-200 p-3 dark:border-slate-800",
		"data-testid": "mobile-cue-cards",
		children: e.map((e, u) => /* @__PURE__ */ s("article", {
			className: "rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950/40",
			"aria-label": `Cue ${u + 1} card`,
			children: [
				/* @__PURE__ */ s("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [
						/* @__PURE__ */ o("span", {
							className: `rounded-full px-2 py-1 text-sm font-bold ${e.status === "LIVE" ? "bg-amber-100 text-amber-800" : e.status === "DONE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`,
							children: e.status
						}),
						/* @__PURE__ */ o("span", {
							"aria-label": `${e.type === "audio" ? "Audio" : e.type === "trigger" ? "Trigger" : "Command"} cue`,
							className: "text-sm",
							children: e.type === "audio" ? "♪" : e.type === "trigger" ? "↪" : "⌘"
						}),
						/* @__PURE__ */ s("span", {
							className: "text-sm font-bold text-slate-500",
							children: ["CUE ", u + 1]
						})
					]
				}),
				/* @__PURE__ */ s("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ s("label", {
							className: "text-sm font-bold text-slate-500",
							children: ["Name", /* @__PURE__ */ o("input", {
								className: `${P} mt-1`,
								"aria-label": `Name for cue ${u + 1}`,
								value: e.name,
								onChange: (t) => r(e.id, { name: t.target.value })
							})]
						}),
						/* @__PURE__ */ s("label", {
							className: "text-sm font-bold text-slate-500",
							children: ["Type", /* @__PURE__ */ s("select", {
								className: `${P} mt-1`,
								"aria-label": `Type for cue ${u + 1}`,
								value: e.type,
								onChange: (t) => r(e.id, {
									type: t.target.value,
									audioAction: t.target.value === "audio" ? "play" : e.audioAction,
									targetGroupName: "",
									targetCueName: ""
								}),
								children: [
									/* @__PURE__ */ o("option", {
										value: "command",
										children: "Command"
									}),
									/* @__PURE__ */ o("option", {
										value: "trigger",
										children: "Trigger cue"
									}),
									/* @__PURE__ */ o("option", {
										value: "audio",
										children: "Audio"
									})
								]
							})]
						}),
						e.type === "trigger" ? /* @__PURE__ */ s("div", {
							className: "grid gap-3",
							children: [/* @__PURE__ */ s("label", {
								className: "text-sm font-bold text-slate-500",
								children: ["Target group", /* @__PURE__ */ s("select", {
									className: `${P} mt-1`,
									"aria-label": `Target group for cue ${u + 1}`,
									value: e.targetGroupName,
									onChange: (t) => r(e.id, {
										targetGroupName: t.target.value,
										targetCueName: ""
									}),
									children: [/* @__PURE__ */ o("option", {
										value: "",
										children: "Target group…"
									}), t.map((e) => /* @__PURE__ */ o("option", {
										value: e.name,
										children: e.name
									}, e.id))]
								})]
							}), /* @__PURE__ */ s("label", {
								className: "text-sm font-bold text-slate-500",
								children: ["Target cue", /* @__PURE__ */ s("select", {
									className: `${P} mt-1`,
									"aria-label": `Target cue for cue ${u + 1}`,
									value: e.targetCueName,
									onChange: (t) => r(e.id, { targetCueName: t.target.value }),
									children: [/* @__PURE__ */ o("option", {
										value: "",
										children: "Target cue…"
									}), t.find((t) => t.name === e.targetGroupName)?.cues.map((e) => /* @__PURE__ */ o("option", {
										value: e.name,
										children: e.name
									}, e.id))]
								})]
							})]
						}) : e.type === "audio" ? /* @__PURE__ */ s("label", {
							className: "text-sm font-bold text-slate-500",
							children: ["Audio action", /* @__PURE__ */ s("select", {
								className: `${P} mt-1`,
								"aria-label": `Audio action for cue ${u + 1}`,
								value: e.audioAction,
								onChange: (t) => r(e.id, { audioAction: t.target.value }),
								children: [
									/* @__PURE__ */ o("option", {
										value: "play",
										children: "Play"
									}),
									/* @__PURE__ */ o("option", {
										value: "pause",
										children: "Pause"
									}),
									/* @__PURE__ */ o("option", {
										value: "stop",
										children: "Stop"
									})
								]
							})]
						}) : /* @__PURE__ */ s("label", {
							className: "text-sm font-bold text-slate-500",
							children: ["Command", /* @__PURE__ */ o("input", {
								className: `${P} mt-1`,
								"aria-label": `Command for cue ${u + 1}`,
								value: e.command,
								onChange: (t) => r(e.id, { command: t.target.value }),
								onBlur: () => i(e.id)
							})]
						}),
						/* @__PURE__ */ s("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ s("label", {
								className: "text-sm font-bold text-slate-500",
								children: ["Hotkey", /* @__PURE__ */ o("input", {
									className: `${P} mt-1`,
									maxLength: 1,
									"aria-label": `Hotkey for cue ${u + 1}`,
									value: e.hotkey,
									onChange: (t) => r(e.id, { hotkey: t.target.value.slice(0, 1) })
								})]
							}), /* @__PURE__ */ s("label", {
								className: "text-sm font-bold text-slate-500",
								children: ["LTC trigger", /* @__PURE__ */ o("input", {
									className: `${P} mt-1`,
									"aria-label": `LTC trigger for cue ${u + 1}`,
									placeholder: "01:00:00:00",
									value: e.ltcTrigger,
									onChange: (t) => r(e.id, { ltcTrigger: t.target.value })
								})]
							})]
						}),
						/* @__PURE__ */ s("label", {
							className: "text-sm font-bold text-slate-500",
							children: [
								"Cron",
								/* @__PURE__ */ o("input", {
									className: `${P} mt-1`,
									"aria-label": `Cron for cue ${u + 1}`,
									placeholder: "* * * * * *",
									value: e.cron,
									onChange: (t) => r(e.id, { cron: t.target.value })
								}),
								/* @__PURE__ */ o("span", {
									className: "mt-1 block font-mono text-sm font-normal",
									children: F(e, n)
								})
							]
						}),
						/* @__PURE__ */ s("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ s("label", {
								className: "text-sm font-bold text-slate-500",
								children: ["Before-wait (ms)", /* @__PURE__ */ o("input", {
									className: `${P} mt-1`,
									type: "number",
									min: "0",
									"aria-label": `Before-wait for cue ${u + 1}`,
									value: e.beforeWaitMs,
									onChange: (t) => r(e.id, { beforeWaitMs: Math.max(0, Number(t.target.value) || 0) })
								})]
							}), /* @__PURE__ */ s("label", {
								className: "text-sm font-bold text-slate-500",
								children: ["After-wait (ms)", /* @__PURE__ */ o("input", {
									className: `${P} mt-1`,
									type: "number",
									min: "0",
									"aria-label": `After-wait for cue ${u + 1}`,
									value: e.afterWaitMs,
									onChange: (t) => r(e.id, { afterWaitMs: Math.max(0, Number(t.target.value) || 0) })
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ s("div", {
					className: "mt-3 flex gap-2",
					children: [
						/* @__PURE__ */ o("button", {
							className: me,
							"aria-label": `Insert after cue ${u + 1}`,
							onClick: () => a(u),
							children: "+"
						}),
						/* @__PURE__ */ o("button", {
							className: me,
							"aria-label": `Move cue ${u + 1} up`,
							onClick: () => c(u, -1),
							children: "↑"
						}),
						/* @__PURE__ */ o("button", {
							className: me,
							"aria-label": `Move cue ${u + 1} down`,
							onClick: () => c(u, 1),
							children: "↓"
						}),
						/* @__PURE__ */ o("button", {
							className: `${me} text-rose-600`,
							"aria-label": `Delete cue ${u + 1}`,
							onClick: () => l(e.id),
							children: "×"
						})
					]
				})
			]
		}, e.id))
	});
}
//#endregion
//#region src/hooks/useToggleFeedback.js
function ge() {
	let [e, t] = i("");
	return {
		bouncing: e,
		trigger(e, n) {
			n(), t(e);
		},
		clear() {
			t("");
		}
	};
}
//#endregion
//#region src/components/CueGroup.jsx
var _e = "min-h-12 rounded-lg border border-slate-300 px-4 text-base font-bold transition hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700";
function ve() {
	let [e, n] = i(() => globalThis.innerWidth < 640);
	return t(() => {
		let e = () => n(globalThis.innerWidth < 640);
		return globalThis.addEventListener("resize", e), () => globalThis.removeEventListener("resize", e);
	}, []), e;
}
function ye({ group: e, groups: t, index: n, lastKey: r, now: i, columnWidths: a, onColumnResize: c, onColumnReset: l, onGroupChange: u, onGo: d, onStop: f, onMove: p, onRemove: m, onCueChange: h, onCueBlur: g, onCueInsert: _, onCueMove: v, onCueRemove: y, onCueDuplicate: b, audioMediaByCueId: x, onAudioFileSelect: S, onAudioClear: C }) {
	let w = [
		["clockEnabled", "Clock"],
		["timecodeEnabled", "TC/LTC"],
		["loopEnabled", "Loop"],
		["hotkeyEnabled", "Hotkey"]
	], T = ve(), E = ge();
	return /* @__PURE__ */ s("section", {
		className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
		style: e.backgroundColor ? { backgroundColor: `${e.backgroundColor}18` } : void 0,
		"aria-label": `Cue group ${e.name}`,
		children: [
			/* @__PURE__ */ s("div", {
				className: "flex flex-wrap items-center gap-2 p-3",
				children: [
					/* @__PURE__ */ o("button", {
						className: _e,
						"aria-label": `${e.expanded ? "Collapse" : "Expand"} ${e.name}`,
						onClick: () => u({ expanded: !e.expanded }),
						children: e.expanded ? "−" : "+"
					}),
					/* @__PURE__ */ s("div", { children: [/* @__PURE__ */ o("p", {
						className: "text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400",
						children: "Cue"
					}), /* @__PURE__ */ o("h2", {
						className: "text-xl font-black",
						children: "Group"
					})] }),
					/* @__PURE__ */ o("input", {
						className: "min-h-12 min-w-48 flex-1 rounded-lg border border-slate-300 bg-transparent px-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700",
						"aria-label": `Name for group ${n + 1}`,
						value: e.name,
						onChange: (e) => u({ name: e.target.value })
					}),
					/* @__PURE__ */ s("label", {
						className: "flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 px-3 text-base font-semibold dark:border-slate-700",
						children: [/* @__PURE__ */ o("span", {}), /* @__PURE__ */ o("input", {
							className: "h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0",
							type: "color",
							"aria-label": `Background color for ${e.name}`,
							value: e.backgroundColor || "#ffffff",
							onChange: (e) => E.trigger("color", () => u({ backgroundColor: e.target.value }))
						})]
					}),
					/* @__PURE__ */ o("button", {
						className: _e,
						"aria-label": `Reset background color for ${e.name}`,
						disabled: !e.backgroundColor,
						onClick: () => u({ backgroundColor: "" }),
						children: "↺"
					}),
					w.map(([t, n]) => /* @__PURE__ */ s("label", {
						className: "flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-base font-semibold dark:border-slate-700",
						children: [
							/* @__PURE__ */ o("input", {
								type: "checkbox",
								checked: e[t],
								onChange: (e) => E.trigger(t, () => u({ [t]: e.target.checked }))
							}),
							/* @__PURE__ */ o("span", {
								onAnimationEnd: E.clear,
								className: `h-2 w-2 rounded-full ${e[t] ? "bg-emerald-500" : "bg-slate-400"} ${E.bouncing === t ? "toggle-bounce" : ""}`
							}),
							n
						]
					}, t)),
					/* @__PURE__ */ o("button", {
						className: _e,
						"aria-label": `Move ${e.name} up`,
						onClick: () => p(-1),
						children: "↑"
					}),
					/* @__PURE__ */ o("button", {
						className: _e,
						"aria-label": `Move ${e.name} down`,
						onClick: () => p(1),
						children: "↓"
					}),
					/* @__PURE__ */ o("button", {
						className: `${_e} text-rose-600`,
						"aria-label": `Remove ${e.name}`,
						onClick: m,
						children: "×"
					}),
					/* @__PURE__ */ o("button", {
						className: `${_e} border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600`,
						"aria-label": `GO ${e.name}`,
						onClick: d,
						children: "GO"
					}),
					/* @__PURE__ */ o("button", {
						className: `${_e} border-rose-500 bg-rose-500 text-white hover:bg-rose-600`,
						"aria-label": `STOP ${e.name}`,
						onClick: f,
						children: "STOP"
					})
				]
			}),
			e.expanded && (T ? /* @__PURE__ */ o(he, {
				cues: e.cues,
				groups: t,
				now: i,
				onChange: h,
				onBlurCommand: g,
				onInsert: _,
				onMove: v,
				onRemove: y,
				audioMediaByCueId: x,
				onAudioFileSelect: S,
				onAudioClear: C
			}) : /* @__PURE__ */ o(N, {
				cues: e.cues,
				groups: t,
				now: i,
				columnWidths: a,
				enabledModes: {
					clock: e.clockEnabled,
					timecode: e.timecodeEnabled,
					hotkey: e.hotkeyEnabled
				},
				onColumnResize: c,
				onColumnReset: l,
				onChange: h,
				onBlurCommand: g,
				onInsert: _,
				audioMediaByCueId: x,
				onAudioFileSelect: S,
				onAudioClear: C,
				onMove: v,
				onRemove: y,
				onDuplicate: b
			})),
			/* @__PURE__ */ s("footer", {
				className: "flex flex-wrap gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400",
				children: [
					/* @__PURE__ */ s("span", { children: ["GROUP ", n + 1] }),
					/* @__PURE__ */ s("span", { children: ["MODES ", w.filter(([t]) => e[t]).map(([, e]) => e).join(" · ") || "MANUAL"] }),
					/* @__PURE__ */ s("span", { children: ["KEY ", r || "—"] })
				]
			})
		]
	});
}
//#endregion
//#region src/components/Toolbar.jsx
var be = "min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-1 text-base font-semibold text-slate-100 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200", xe = "text-body bg-neutral-primary-soft border border-default py-1 hover:bg-neutral-secondary-medium hover:text-heading focus:ring-3 focus:ring-neutral-tertiary-soft font-medium leading-5 text-sm px-3 py-2 focus:outline-none";
function Se({ onGoAll: e, onStopAll: t, theme: n, onThemeChange: r, panelOpen: i, onPanelToggle: a, onAddGroup: c, onRemoveGroup: l, onReset: u, onExport: d, onImport: f }) {
	let p = ge();
	return /* @__PURE__ */ o("header", {
		className: "border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur sm:px-4 dark:border-slate-800 dark:bg-slate-950/90",
		children: /* @__PURE__ */ s("div", {
			className: "mx-auto flex w-full flex-wrap items-center gap-2 sm:w-[90%]",
			children: [
				/* @__PURE__ */ o("img", {
					alt: "decade.tw",
					className: "filter-none dark:invert",
					width: "120",
					src: "https://www.decade.tw/images/logo/decade_logo.png",
					onClick: () => {}
				}),
				/* @__PURE__ */ s("div", {
					className: "mr-auto sm:mr-3",
					children: [/* @__PURE__ */ o("p", {
						className: "text-xs font-bold uppercase tracking-[.16em] text-cyan-600 sm:text-sm sm:tracking-[.2em]",
						children: "DECADE.TW"
					}), /* @__PURE__ */ o("h1", {
						className: "text-xl font-black tracking-tight sm:text-2xl",
						children: "Mini QLab"
					})]
				}),
				/* @__PURE__ */ o("button", {
					className: xe,
					"aria-label": n === "dark" ? "Use light theme" : "Use dark theme",
					onClick: () => p.trigger("theme", () => r(n === "dark" ? "light" : "dark")),
					children: /* @__PURE__ */ s("span", {
						className: "relative size-13",
						children: [
							/* @__PURE__ */ o("span", { className: " absolute mr-8 h-full w-2  animate-ping rounded-full bg-sky-400 opacity-75" }),
							/* @__PURE__ */ o("span", { className: " absolute mr-8 h-full w-2  rounded-full bg-sky-500" }),
							"\xA0 \xA0 \xA0",
							n === "dark" ? "Light" : "Dark"
						]
					})
				}),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ s("div", {
					className: "inline-flex rounded-base shadow-xs -space-x-px",
					role: "group",
					children: [
						/* @__PURE__ */ o("button", {
							type: "button",
							className: xe,
							children: "Q-Group"
						}),
						/* @__PURE__ */ o("button", {
							type: "button",
							className: xe,
							onClick: c,
							children: "+"
						}),
						/* @__PURE__ */ o("button", {
							type: "button",
							className: xe,
							onClick: l,
							children: "-"
						})
					]
				}),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ o("button", {
					className: xe,
					onClick: d,
					children: "Export"
				}),
				/* @__PURE__ */ s("label", {
					className: `${xe} cursor-pointer`,
					children: ["Import", /* @__PURE__ */ o("input", {
						className: "sr-only",
						type: "file",
						accept: "application/json,.json",
						"aria-label": "Import cue groups",
						onChange: (e) => {
							f(e.target.files?.[0]), e.target.value = "";
						}
					})]
				}),
				/* @__PURE__ */ o("button", {
					className: xe,
					onClick: u,
					children: "Reset"
				}),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ s("button", {
					className: xe,
					"aria-pressed": i,
					"aria-label": i ? "Hide active cues" : "Show active cues",
					onClick: () => p.trigger("active-cues", a),
					children: [/* @__PURE__ */ o("span", {
						"data-testid": "active-cues-toggle-dot",
						onAnimationEnd: p.clear,
						"aria-hidden": "true",
						className: `mr-2 inline-block h-2 w-2 rounded-full ${i ? "bg-cyan-500" : "bg-slate-400"} ${p.bouncing === "active-cues" ? "toggle-bounce" : ""}`
					}), "Active cues"]
				}),
				/* @__PURE__ */ o("span", { className: "hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" }),
				/* @__PURE__ */ o("button", {
					className: `${be} !border-rose-500 !bg-rose-500 !text-slate-950 hover:!bg-rose-600 dark:!text-white`,
					onClick: t,
					children: "STOP-ALL"
				}),
				/* @__PURE__ */ o("button", {
					className: `${be} !border-emerald-500 !bg-emerald-500 !text-slate-950 hover:!bg-emerald-600 dark:!text-white`,
					onClick: e,
					children: "GO-ALL"
				})
			]
		})
	});
}
var Ce = 6e4;
function I(e) {
	let t = Number(e);
	return Number.isFinite(t) ? Math.max(0, Math.round(t)) : 0;
}
function we(e, t = 100) {
	let n = Math.max(1, I(t));
	return Math.max(0, Math.round(I(e) / n) * n);
}
function L(e, t) {
	return I(e) * t / 1e3;
}
function Te(e, t) {
	return !Number.isFinite(e) || !Number.isFinite(t) || t <= 0 ? 0 : e * 1e3 / t;
}
function Ee(e = []) {
	let t = 0;
	return e.map((e, n) => {
		let r = I(e.beforeWaitMs), i = I(e.afterWaitMs), a = t + r, o = {
			cue: e,
			index: n,
			beforeMs: r,
			afterMs: i,
			startMs: a,
			endMs: a + i
		};
		return t = o.endMs, o;
	});
}
function De(e = []) {
	return Math.max(0, ...e.map((e) => Ee(e.cues).at(-1)?.endMs ?? 0));
}
function Oe(e, t, n = Ce) {
	let r = Math.max(1e3, I(n)), i = Math.max(I(e), I(t));
	return Math.max(r, Math.ceil(i / r) * r);
}
function ke({ scrollLeft: e, pointerOffset: t, oldPixelsPerSecond: n, newPixelsPerSecond: r }) {
	let i = Number(n), a = Number(r);
	if (!(i > 0) || !(a > 0)) return Math.max(0, Number(e) || 0);
	let o = Number(t) || 0, s = Te((Number(e) || 0) + o, i);
	return Math.max(0, L(s, a) - o);
}
function R(e, t) {
	let n = I(t), r = Ee(e), i = r.findIndex((e) => e.startMs > n);
	i < 0 && (i = r.length);
	let a = i > 0 ? r[i - 1].endMs : 0;
	return {
		index: i,
		beforeWaitMs: we(Math.max(0, n - a))
	};
}
function Ae(e) {
	let t = Number(e);
	return Number.isFinite(t) ? Math.min(1, Math.max(0, t / 100)) : 0;
}
function z(e = [], t = Date.now()) {
	let n = Ee(e);
	if (!n.length) return {
		positionMs: 0,
		endMs: 0,
		moving: !1
	};
	let r = n.find((e) => e.cue.status === "LIVE");
	if (r) {
		let e = r.startMs - r.beforeMs, n = Number.isFinite(Number(r.cue.phaseStartedAt)) ? Math.max(0, Number(t) - Number(r.cue.phaseStartedAt)) : null, i = e + (n === null ? r.beforeMs * Ae(r.cue.beforeProgress) : Math.min(r.beforeMs, n));
		return {
			positionMs: i,
			endMs: r.startMs,
			moving: i < r.startMs
		};
	}
	let i = [...n].reverse().find((e) => e.cue.status === "DONE" && Ae(e.cue.afterProgress) < 1);
	if (i) {
		let e = Number.isFinite(Number(i.cue.phaseStartedAt)) ? Math.max(0, Number(t) - Number(i.cue.phaseStartedAt)) : null, n = i.startMs + (e === null ? i.afterMs * Ae(i.cue.afterProgress) : Math.min(i.afterMs, e));
		return {
			positionMs: n,
			endMs: i.endMs,
			moving: n < i.endMs
		};
	}
	if (n.every((e) => e.cue.status === "DONE")) {
		let e = n.at(-1).endMs;
		return {
			positionMs: e,
			endMs: e,
			moving: !1
		};
	}
	return null;
}
//#endregion
//#region src/lib/cues.js
var je = "qlab_cues", Me = "TX_JSON_CMD", Ne = 0;
function Pe(e) {
	try {
		return globalThis.crypto?.randomUUID?.() ?? `${e}-${++Ne}`;
	} catch {
		return `${e}-${++Ne}`;
	}
}
function Fe(e) {
	let t = String(e ?? "").trim().replace(/\/+$/, "");
	return t ? `${t}/` : "";
}
function Ie(e) {
	let t = String(e ?? "").trim();
	return /^#[0-9a-f]{6}$/i.test(t) ? t.toLowerCase() : "";
}
function Le(e = {}) {
	let t = [
		"command",
		"trigger",
		"audio"
	].includes(e.type) ? e.type : "command", n = [
		"play",
		"pause",
		"stop"
	].includes(e.audioAction) ? e.audioAction : "play";
	return {
		id: e.id || Pe("cue"),
		name: String(e.name ?? e.number ?? "Cue 1"),
		type: t,
		audioAction: n,
		targetGroupName: String(e.targetGroupName ?? ""),
		targetCueName: String(e.targetCueName ?? ""),
		targetAction: [
			"start",
			"pause",
			"stop"
		].includes(e.targetAction) ? e.targetAction : "start",
		hotkey: String(e.hotkey ?? "").slice(0, 1),
		command: String(e.command ?? ""),
		ltcTrigger: String(e.ltcTrigger ?? ""),
		cron: String(e.cron ?? ""),
		beforeWaitMs: Math.max(0, Number(e.beforeWaitMs) || 0),
		afterWaitMs: Math.max(0, Number(e.afterWaitMs) || 0),
		status: "IDLE",
		beforeProgress: 0,
		afterProgress: 0,
		startedAt: null
	};
}
function Re(e = {}) {
	let t = Array.isArray(e.cues) ? e.cues : [Le()];
	return {
		id: e.id || Pe("group"),
		name: String(e.name ?? "Cue Group"),
		expanded: e.expanded !== !1,
		loopEnabled: !!e.loopEnabled,
		clockEnabled: !!e.clockEnabled,
		timecodeEnabled: !!e.timecodeEnabled,
		hotkeyEnabled: !!e.hotkeyEnabled,
		backgroundColor: Ie(e.backgroundColor),
		cues: t.map((e, t) => Le({
			...e,
			name: e?.name ?? e?.number ?? `Cue ${t + 1}`
		}))
	};
}
function B() {
	return [Re({
		name: "Main Sequence",
		cues: [Le({
			name: "Welcome",
			command: "/cue/welcome/",
			afterWaitMs: 500
		})]
	})];
}
function V(e) {
	return String(e ?? "").trim().toLocaleLowerCase();
}
function ze(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) {
		let e = V(n.name);
		if (!e) throw Error("Every cue group must have a name.");
		if (t.has(e)) throw Error(`Duplicate cue group name: ${n.name}.`);
		t.add(e);
		let r = /* @__PURE__ */ new Set();
		for (let e of n.cues) {
			let t = V(e.name);
			if (!t) throw Error(`Every cue in ${n.name} must have a name.`);
			if (r.has(t)) throw Error(`Duplicate cue name in ${n.name}: ${e.name}.`);
			r.add(t);
		}
	}
	return e;
}
function Be(e) {
	if (!Array.isArray(e)) throw Error("Imported MiniQ cue lists must be a JSON array.");
	return ze(e.map((e) => {
		if (!e || typeof e != "object" || !Array.isArray(e.cues)) throw Error("Each cue group must contain a cues array.");
		return Re(e);
	}));
}
function Ve(e) {
	return e.map(({ cues: e, localAudioFile: t, audioTrack: n, ...r }) => ({
		...r,
		cues: e.map(({ number: e, status: t, beforeProgress: n, afterProgress: r, startedAt: i, phaseStartedAt: a, ...o }) => o)
	}));
}
function He(e) {
	try {
		let t = e?.getItem(je);
		return t ? Be(JSON.parse(t)) : null;
	} catch {
		return null;
	}
}
function Ue(e, t) {
	try {
		return e?.setItem(je, JSON.stringify(Ve(t))), !0;
	} catch {
		return !1;
	}
}
function We(e) {
	try {
		let t = e?.getItem(Me);
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function Ge(e, t) {
	try {
		return e?.setItem(Me, JSON.stringify(t)), !0;
	} catch {
		return !1;
	}
}
//#endregion
//#region src/components/TimelineEditor.jsx
var H = 152, U = 50, Ke = 5, qe = 1, W = 240;
function Je(e) {
	return e.name || e.command || "Unnamed cue";
}
function Ye(e) {
	return e.type === "trigger" ? `Trigger → ${e.targetGroupName || "group"} / ${e.targetCueName || "cue"}` : Fe(e.command) || "Command";
}
function Xe(e) {
	let t = e instanceof Date ? e : new Date(e), n = (e, t = 2) => String(e).padStart(t, "0");
	return `${n(t.getHours())}:${n(t.getMinutes())}:${n(t.getSeconds())}.${n(t.getMilliseconds(), 3)}`;
}
function Ze() {
	let [e, n] = i(() => Date.now());
	return t(() => {
		let e, t = () => {
			n(Date.now()), e = requestAnimationFrame(t);
		};
		return e = requestAnimationFrame(t), () => cancelAnimationFrame(e);
	}, []), /* @__PURE__ */ s("time", {
		"aria-label": "Timeline now time",
		className: "rounded-md bg-slate-200 px-2 py-1 font-mono text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200",
		children: ["NOW ", Xe(e)]
	});
}
function Qe(e) {
	let t = [];
	for (let n = 0; n <= e; n += 1e3) t.push(n);
	return t;
}
function $e(e) {
	return {
		name: String(e.name ?? e.number ?? ""),
		type: [
			"command",
			"trigger",
			"audio"
		].includes(e.type) ? e.type : "command",
		audioAction: [
			"play",
			"pause",
			"stop"
		].includes(e.audioAction) ? e.audioAction : "play",
		targetGroupName: String(e.targetGroupName ?? ""),
		targetCueName: String(e.targetCueName ?? ""),
		hotkey: String(e.hotkey ?? "").slice(0, 1),
		command: String(e.command ?? ""),
		ltcTrigger: String(e.ltcTrigger ?? ""),
		cron: String(e.cron ?? ""),
		beforeWaitMs: I(e.beforeWaitMs),
		afterWaitMs: I(e.afterWaitMs)
	};
}
function et({ group: e, groupEndMs: n, pixelsPerSecond: i }) {
	let a = r(null), s = r(0);
	return t(() => {
		let t = a.current;
		if (!t) return;
		let r = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? !1, o, c = (e) => {
			let r = Math.min(n, Math.max(0, e));
			s.current = r, t.style.transform = `translate3d(${L(r, i)}px, 0, 0)`, t.dataset.playheadMs = String(Math.round(r));
		}, l = z(e.cues);
		if (!l) {
			c(s.current);
			return;
		}
		if (c(l.positionMs), r || !l.moving) return;
		let u = () => {
			let t = z(e.cues);
			t && (c(t.positionMs), t.moving && (o = requestAnimationFrame(u)));
		};
		return o = requestAnimationFrame(u), () => cancelAnimationFrame(o);
	}, [
		e.cues,
		n,
		i
	]), /* @__PURE__ */ o("div", {
		ref: a,
		"aria-label": `Playhead for ${e.name}`,
		"data-playhead-ms": "0",
		className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-0.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,.8)] will-change-transform"
	});
}
function tt({ editor: e, groups: t, onChange: n, onCancel: r, onSave: i, onRemove: c }) {
	let l = "rounded-md border border-slate-600 bg-slate-950 px-2 py-2 text-base text-white focus:border-cyan-400 focus:outline-none", u = e.draft, d = (e) => n({
		...u,
		...e
	}), f = Math.min(window.innerWidth * .9, 768);
	return /* @__PURE__ */ s("div", {
		role: "dialog",
		"aria-label": e.mode === "create" ? "Add cue" : "Edit cue",
		className: "fixed z-50 w-[min(90vw,48rem)] rounded-xl border border-slate-600 bg-slate-900 p-4 text-base text-slate-100 shadow-2xl",
		style: {
			left: Math.min(e.x, Math.max(8, window.innerWidth - f - 8)),
			top: Math.min(e.y, Math.max(8, window.innerHeight - 580))
		},
		onPointerDown: (e) => e.stopPropagation(),
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ o("h3", {
				className: "mb-3 text-xl font-black",
				children: e.mode === "create" ? "Add cue" : "Edit cue"
			}),
			/* @__PURE__ */ s("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ s("label", {
						className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
						children: ["Name", /* @__PURE__ */ o("input", {
							autoFocus: !0,
							className: l,
							value: u.name,
							onChange: (e) => d({ name: e.target.value })
						})]
					}),
					/* @__PURE__ */ s("label", {
						className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
						children: ["Hotkey", /* @__PURE__ */ o("input", {
							className: l,
							maxLength: 1,
							value: u.hotkey,
							onChange: (e) => d({ hotkey: e.target.value.slice(0, 1) })
						})]
					}),
					/* @__PURE__ */ o("div", {
						className: "col-span-2 overflow-x-auto",
						children: /* @__PURE__ */ s("div", {
							className: `grid gap-2 ${u.type === "trigger" ? "min-w-[42rem] grid-cols-3" : "min-w-[32rem] grid-cols-2"}`,
							children: [/* @__PURE__ */ s("label", {
								className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
								children: ["Type", /* @__PURE__ */ s("select", {
									className: l,
									value: u.type,
									onChange: (e) => d({
										type: e.target.value,
										audioAction: e.target.value === "audio" ? "play" : u.audioAction,
										targetGroupName: "",
										targetCueName: ""
									}),
									children: [
										/* @__PURE__ */ o("option", {
											value: "command",
											children: "Command"
										}),
										/* @__PURE__ */ o("option", {
											value: "trigger",
											children: "Trigger cue"
										}),
										/* @__PURE__ */ o("option", {
											value: "audio",
											children: "Audio"
										})
									]
								})]
							}), u.type === "trigger" ? /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ s("label", {
								className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
								children: ["Target group", /* @__PURE__ */ s("select", {
									className: l,
									value: u.targetGroupName,
									onChange: (e) => d({
										targetGroupName: e.target.value,
										targetCueName: ""
									}),
									children: [/* @__PURE__ */ o("option", {
										value: "",
										children: "Select group…"
									}), t.map((e) => /* @__PURE__ */ o("option", {
										value: e.name,
										children: e.name
									}, e.id))]
								})]
							}), /* @__PURE__ */ s("label", {
								className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
								children: ["Target cue", /* @__PURE__ */ s("select", {
									className: l,
									value: u.targetCueName,
									onChange: (e) => d({ targetCueName: e.target.value }),
									children: [/* @__PURE__ */ o("option", {
										value: "",
										children: "Select cue…"
									}), t.find((e) => e.name === u.targetGroupName)?.cues.map((e) => /* @__PURE__ */ o("option", {
										value: e.name,
										children: e.name
									}, e.id))]
								})]
							})] }) : u.type === "audio" ? /* @__PURE__ */ s("label", {
								className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
								children: ["Audio action", /* @__PURE__ */ s("select", {
									className: l,
									value: u.audioAction,
									onChange: (e) => d({ audioAction: e.target.value }),
									children: [
										/* @__PURE__ */ o("option", {
											value: "play",
											children: "Play"
										}),
										/* @__PURE__ */ o("option", {
											value: "pause",
											children: "Pause"
										}),
										/* @__PURE__ */ o("option", {
											value: "stop",
											children: "Stop"
										})
									]
								})]
							}) : /* @__PURE__ */ s("label", {
								className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
								children: ["Command", /* @__PURE__ */ o("input", {
									className: l,
									value: u.command,
									onChange: (e) => d({ command: e.target.value })
								})]
							})]
						})
					}),
					/* @__PURE__ */ s("label", {
						className: "col-span-2 flex flex-col gap-1 text-sm font-bold text-slate-400",
						children: ["LTC trigger", /* @__PURE__ */ o("input", {
							className: l,
							placeholder: "01:00:00:00",
							value: u.ltcTrigger,
							onChange: (e) => d({ ltcTrigger: e.target.value })
						})]
					}),
					/* @__PURE__ */ s("label", {
						className: "col-span-2 flex flex-col gap-1 text-sm font-bold text-slate-400",
						children: ["Cron", /* @__PURE__ */ o("input", {
							className: l,
							placeholder: "* * * * * *",
							value: u.cron,
							onChange: (e) => d({ cron: e.target.value })
						})]
					}),
					/* @__PURE__ */ s("label", {
						className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
						children: ["Before-wait (ms)", /* @__PURE__ */ o("input", {
							className: l,
							type: "number",
							min: "0",
							value: u.beforeWaitMs,
							onChange: (e) => d({ beforeWaitMs: e.target.value })
						})]
					}),
					/* @__PURE__ */ s("label", {
						className: "flex flex-col gap-1 text-sm font-bold text-slate-400",
						children: ["After-wait (ms)", /* @__PURE__ */ o("input", {
							className: l,
							type: "number",
							min: "0",
							value: u.afterWaitMs,
							onChange: (e) => d({ afterWaitMs: e.target.value })
						})]
					})
				]
			}),
			/* @__PURE__ */ s("div", {
				className: "mt-4 flex gap-2",
				children: [
					e.mode === "edit" && /* @__PURE__ */ o("button", {
						className: "rounded-md border border-rose-500 px-3 py-2 text-base font-bold text-rose-400",
						onClick: c,
						children: "Remove"
					}),
					/* @__PURE__ */ o("button", {
						className: "ml-auto rounded-md border border-slate-600 px-3 py-2 text-base font-bold",
						onClick: r,
						children: "Cancel"
					}),
					/* @__PURE__ */ o("button", {
						className: "rounded-md bg-cyan-500 px-3 py-2 text-base font-black text-slate-950",
						onClick: i,
						children: "Save"
					})
				]
			})
		]
	});
}
function nt({ groups: e, audioMediaByCueId: c = {}, collapsed: l = !1, onCollapsedChange: u = () => {}, onCueAdd: d, onCueChange: f, onCueRemove: p, onCueReorder: m }) {
	let [h, g] = i(80), [_, v] = i(30), [y, b] = i(() => Oe(0, De(e) + 1e3)), [x, S] = i(null), [C, w] = i(null), T = ge(), E = r(null), D = Oe(y, De(e) + 1e3), ee = L(D, h), te = n(() => Qe(D), [D]);
	t(() => {
		D !== y && b(D);
	}, [y, D]), t(() => {
		l && (w(null), S(null));
	}, [l]), t(() => {
		if (!C) return;
		let e = (e) => {
			e.key === "Escape" && w(null);
		}, t = (e) => {
			e.target.closest("[role=\"dialog\"]") || w(null);
		};
		return window.addEventListener("keydown", e), window.addEventListener("pointerdown", t), () => {
			window.removeEventListener("keydown", e), window.removeEventListener("pointerdown", t);
		};
	}, [C]), t(() => {
		if (!x) return;
		let t = () => S(null), n = (n) => {
			if (x.mode === "pan") {
				E.current && (E.current.scrollLeft = Math.max(0, x.initialScrollLeft - (n.clientX - x.originX)));
				return;
			}
			let r = e.find((e) => e.id === x.groupId), i = r?.cues.findIndex((e) => e.id === x.cueId) ?? -1;
			if (!r || i < 0) return t();
			let a = n.clientX - x.originX, o = n.clientY - x.originY, s = x.mode;
			if (s === "pending") {
				if (Math.max(Math.abs(a), Math.abs(o)) < Ke) return;
				s = Math.abs(o) > Math.abs(a) ? "reorder" : "move", S((e) => e ? {
					...e,
					mode: s
				} : null);
			}
			if (s === "resize") f(x.groupId, x.cueId, { afterWaitMs: we(x.initialAfter + Te(a, h)) });
			else if (s === "move") f(x.groupId, x.cueId, { beforeWaitMs: we(x.initialBefore + Te(a, h)) });
			else if (s === "reorder") {
				let e = Math.max(0, Te(n.clientX - x.trackLeft, h)), t = Ee(r.cues), a = t.findIndex((t) => e < (t.startMs + t.endMs) / 2);
				a < 0 && (a = t.length - 1), a !== i && m(x.groupId, i, a);
			}
		};
		return window.addEventListener("pointermove", n), window.addEventListener("pointerup", t), window.addEventListener("pointercancel", t), () => {
			window.removeEventListener("pointermove", n), window.removeEventListener("pointerup", t), window.removeEventListener("pointercancel", t);
		};
	}, [
		e,
		x,
		f,
		m,
		h
	]);
	let ne = (e, t, n, r) => {
		if (e.button !== 0) return;
		e.preventDefault(), e.stopPropagation();
		let i = e.currentTarget.closest("[data-timeline-track]");
		S({
			mode: r,
			groupId: t.id,
			cueId: n.id,
			originX: e.clientX,
			originY: e.clientY,
			trackLeft: i?.getBoundingClientRect().left ?? H,
			initialBefore: I(n.beforeWaitMs),
			initialAfter: I(n.afterWaitMs)
		});
	}, re = (e) => {
		e.button === 0 && e.target === e.currentTarget && (e.preventDefault(), S({
			mode: "pan",
			originX: e.clientX,
			initialScrollLeft: E.current?.scrollLeft ?? 0
		}));
	}, ie = (e, t) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		let n = Te(e.clientX - e.currentTarget.getBoundingClientRect().left, h), r = R(t.cues, n), i = t.cues.length + 1;
		for (; t.cues.some((e) => e.name.toLocaleLowerCase() === `cue ${i}`.toLocaleLowerCase());) i++;
		w({
			mode: "create",
			groupId: t.id,
			index: r.index,
			x: e.clientX,
			y: e.clientY,
			draft: $e({
				name: `Cue ${i}`,
				beforeWaitMs: r.beforeWaitMs,
				afterWaitMs: 1e3
			})
		});
	}, ae = (e, t, n) => {
		e.preventDefault(), e.stopPropagation(), w({
			mode: "edit",
			groupId: t.id,
			cueId: n.id,
			x: e.clientX,
			y: e.clientY,
			draft: $e(n)
		});
	}, O = () => {
		let e = {
			...C.draft,
			command: Fe(C.draft.command),
			hotkey: String(C.draft.hotkey).slice(0, 1),
			beforeWaitMs: I(C.draft.beforeWaitMs),
			afterWaitMs: I(C.draft.afterWaitMs)
		};
		C.mode === "create" ? d(C.groupId, C.index, e) : f(C.groupId, C.cueId, e), w(null);
	}, oe = (e) => {
		e.preventDefault();
		let t = E.current;
		if (!t) return;
		let n = Math.min(W, Math.max(qe, h + (e.deltaY < 0 ? 1 : -1)));
		if (n === h) return;
		let r = e.clientX - t.getBoundingClientRect().left, i = ke({
			scrollLeft: t.scrollLeft,
			pointerOffset: r,
			oldPixelsPerSecond: h,
			newPixelsPerSecond: n
		});
		g(n), requestAnimationFrame(() => {
			E.current && (E.current.scrollLeft = i);
		});
	};
	t(() => {
		let e = E.current;
		if (!l && e) return e.addEventListener("wheel", oe, { passive: !1 }), () => e.removeEventListener("wheel", oe);
	}, [l, h]);
	let se = (e) => {
		let t = e.currentTarget;
		t.scrollWidth - t.clientWidth - t.scrollLeft < 500 && b((e) => Oe(e, e + 6e4));
	}, k = Math.max(1, Math.ceil(48 * _ / h));
	return /* @__PURE__ */ s("section", {
		"aria-label": "Cue timeline",
		className: "overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
		onContextMenu: (e) => e.preventDefault(),
		children: [/* @__PURE__ */ s("header", {
			className: `flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-900 ${l ? "" : "border-b border-slate-200 dark:border-slate-700"}`,
			children: [
				/* @__PURE__ */ o("button", {
					className: "h-10 w-10 rounded-md border border-slate-300 bg-white text-base font-bold dark:border-slate-600 dark:bg-slate-900",
					"aria-label": l ? "Expand cue timeline" : "Collapse cue timeline",
					"aria-expanded": !l,
					onClick: () => T.trigger("collapse", () => u(!l)),
					children: /* @__PURE__ */ o("span", {
						"data-testid": "timeline-collapse-icon",
						onAnimationEnd: T.clear,
						className: `inline-block ${T.bouncing === "collapse" ? "toggle-bounce" : ""}`,
						children: l ? "+" : "−"
					})
				}),
				/* @__PURE__ */ s("div", { children: [/* @__PURE__ */ o("p", {
					className: "text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400",
					children: "Timeline"
				}), /* @__PURE__ */ o("h2", {
					className: "text-xl font-black",
					children: "Cue timeline"
				})] }),
				/* @__PURE__ */ o(Ze, {}),
				!l && /* @__PURE__ */ s("div", {
					className: "ml-auto flex items-center gap-2",
					"aria-label": "Timeline zoom controls",
					children: [
						/* @__PURE__ */ s("label", {
							className: "flex items-center gap-1 text-sm font-bold",
							children: ["FPS", /* @__PURE__ */ o("input", {
								className: "h-10 w-16 rounded-md border border-slate-300 bg-white px-2 font-mono dark:border-slate-600 dark:bg-slate-900",
								type: "number",
								min: "1",
								max: "120",
								"aria-label": "Timeline frames per second",
								value: _,
								onChange: (e) => v(Math.min(120, Math.max(1, Number(e.target.value) || 1)))
							})]
						}),
						/* @__PURE__ */ o("button", {
							className: "h-10 w-10 rounded-md border border-slate-300 bg-white text-base font-bold hover:border-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-cyan-400",
							"aria-label": "Zoom timeline out",
							onClick: () => g((e) => Math.max(qe, e - 1)),
							children: "−"
						}),
						/* @__PURE__ */ s("span", {
							className: "w-20 text-center font-mono text-sm",
							children: [h, "px/s"]
						}),
						/* @__PURE__ */ o("button", {
							className: "h-10 w-10 rounded-md border border-slate-300 bg-white text-base font-bold hover:border-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-cyan-400",
							"aria-label": "Zoom timeline in",
							onClick: () => g((e) => Math.min(W, e + 1)),
							children: "+"
						})
					]
				})
			]
		}), !l && /* @__PURE__ */ s(a, { children: [
			/* @__PURE__ */ o("div", {
				ref: E,
				className: "overflow-x-auto",
				"data-testid": "timeline-scroll",
				onScroll: se,
				children: /* @__PURE__ */ s("div", {
					style: { minWidth: H + ee },
					children: [
						/* @__PURE__ */ s("div", {
							className: "flex h-8 border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80",
							children: [/* @__PURE__ */ o("div", {
								className: "sticky left-0 z-20 shrink-0 border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900",
								style: { width: H }
							}), /* @__PURE__ */ o("div", {
								className: "relative",
								style: { width: ee },
								children: te.map((e) => /* @__PURE__ */ s("span", {
									className: "absolute bottom-1 font-mono text-xs text-slate-500 dark:text-slate-400",
									style: { left: L(e, h) },
									children: [e / 1e3, "s"]
								}, e))
							})]
						}),
						/* @__PURE__ */ s("div", {
							className: "flex h-6 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80",
							children: [/* @__PURE__ */ o("div", {
								className: "sticky left-0 z-20 shrink-0 border-r border-slate-200 dark:border-slate-700",
								style: { width: H }
							}), /* @__PURE__ */ o("div", {
								className: "relative",
								style: { width: ee },
								children: Array.from({ length: Math.floor(y / 1e3 * _) + 1 }, (e, t) => t).filter((e) => e % k === 0).map((e) => /* @__PURE__ */ s("span", {
									className: "absolute bottom-1 font-mono text-[10px] text-slate-400",
									style: { left: L(e * 1e3 / _, h) },
									children: [e, "f"]
								}, e))
							})]
						}),
						e.map((e) => {
							let t = Ee(e.cues), n = t.at(-1)?.endMs ?? 0;
							return /* @__PURE__ */ s("div", {
								className: "flex h-20 border-b border-slate-200 last:border-b-0 dark:border-slate-800",
								children: [/* @__PURE__ */ o("div", {
									className: "sticky left-0 z-20 flex shrink-0 items-center border-r border-slate-200 bg-slate-100 px-3 dark:border-slate-700 dark:bg-slate-900",
									style: {
										width: "clamp(96px, 24vw, 152px)",
										backgroundColor: e.backgroundColor ? `${e.backgroundColor}18` : void 0
									},
									children: /* @__PURE__ */ o("span", {
										className: "truncate text-base font-bold",
										title: e.name,
										children: e.name
									})
								}), /* @__PURE__ */ s("div", {
									className: `relative bg-slate-50 bg-[linear-gradient(to_right,rgba(100,116,139,.2)_1px,transparent_1px)] dark:bg-slate-950/80 dark:bg-[linear-gradient(to_right,rgba(100,116,139,.18)_1px,transparent_1px)] ${x?.mode === "pan" ? "cursor-grabbing" : "cursor-grab"}`,
									"data-timeline-track": e.id,
									style: {
										width: ee,
										backgroundColor: e.backgroundColor || void 0,
										backgroundSize: `${h}px 100%`
									},
									onPointerDown: re,
									onContextMenu: (t) => ie(t, e),
									children: [
										t.map((t) => {
											let n = t.cue.status, r = n === "LIVE" ? "border-amber-300 bg-amber-500 text-slate-950" : n === "DONE" ? "border-emerald-400 bg-emerald-700" : t.cue.type === "trigger" ? "border-violet-400 bg-violet-800" : "border-cyan-400 bg-cyan-800", i = c[t.cue.id], a = Math.max(U, L(i?.durationMs || t.afterMs, h)), l = Ye(t.cue);
											return /* @__PURE__ */ s("div", {
												role: "button",
												tabIndex: 0,
												"aria-label": `${Je(t.cue)} timeline cue`,
												"data-cue-id": t.cue.id,
												className: `absolute top-3 flex h-14 select-none items-center overflow-hidden rounded-md border shadow-lg ${r}`,
												style: {
													left: L(t.startMs, h),
													width: a,
													backgroundColor: n === "IDLE" && e.backgroundColor ? e.backgroundColor : void 0,
													touchAction: "none"
												},
												onPointerDown: (n) => ne(n, e, t.cue, "pending"),
												onContextMenu: (n) => ae(n, e, t.cue),
												children: [/* @__PURE__ */ s("span", {
													className: "min-w-0 flex-1 px-3",
													title: `${Je(t.cue)} · ${l}`,
													children: [
														/* @__PURE__ */ s("span", {
															className: "block truncate text-sm font-bold",
															children: [t.cue.type === "audio" ? "♪ " : t.cue.type === "trigger" ? "↪ " : "⌘ ", Je(t.cue)]
														}),
														i?.peaks?.length > 0 && /* @__PURE__ */ o("span", {
															"data-testid": `audio-waveform-${t.cue.id}`,
															className: "flex h-5 items-center gap-px px-1",
															children: i.peaks.map((e, t) => /* @__PURE__ */ o("i", {
																className: "w-px bg-white/70",
																style: { height: `${Math.max(8, e * 100)}%` }
															}, t))
														}),
														a >= 180 && /* @__PURE__ */ o("span", {
															className: "block truncate text-xs opacity-80",
															children: l
														})
													]
												}), /* @__PURE__ */ o("span", {
													role: "separator",
													"aria-label": `Resize ${Je(t.cue)}`,
													className: "h-full w-3 shrink-0 cursor-ew-resize border-l border-white/40 bg-black/20",
													onPointerDown: (n) => ne(n, e, t.cue, "resize")
												})]
											}, t.cue.id);
										}),
										e.loopEnabled && /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ o("span", {
											"aria-label": `Loop start for ${e.name}`,
											className: "pointer-events-none absolute top-0 z-20 -translate-x-1/2 text-base text-cyan-300",
											style: { left: 0 },
											children: "↻"
										}), /* @__PURE__ */ o("span", {
											"aria-label": `Loop end for ${e.name}`,
											className: `pointer-events-none absolute z-20 -translate-x-1/2 text-base text-cyan-300 ${n === 0 ? "top-5" : "top-0"}`,
											style: { left: L(n, h) },
											children: "↻"
										})] }),
										/* @__PURE__ */ o(et, {
											group: e,
											groupEndMs: n,
											pixelsPerSecond: h
										})
									]
								})]
							}, e.id);
						}),
						!e.length && /* @__PURE__ */ o("p", {
							className: "p-6 text-center text-base text-slate-500 dark:text-slate-400",
							children: "Add a cue group to begin editing the timeline."
						})
					]
				})
			}),
			/* @__PURE__ */ o("footer", {
				className: "border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
				children: "Left-drag empty space to pan · wheel to zoom · right-click to add or edit · drag cues to retime"
			}),
			C && /* @__PURE__ */ o(tt, {
				editor: C,
				groups: e,
				onChange: (e) => w((t) => ({
					...t,
					draft: e
				})),
				onCancel: () => w(null),
				onSave: O,
				onRemove: () => {
					p(C.groupId, C.cueId), w(null);
				}
			})
		] })]
	});
}
//#endregion
//#region src/components/WebSocketPanel.jsx
var rt = {
	connected: "bg-emerald-500",
	connecting: "bg-amber-500",
	error: "bg-rose-500",
	off: "bg-slate-400"
}, it = {
	connected: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
	connecting: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
	disconnected: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	sent: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
	received: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
	error: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
};
function at(e) {
	let t = new Date(e);
	return t.toLocaleTimeString("en-GB", { hour12: !1 }) + "." + String(t.getMilliseconds()).padStart(3, "0");
}
function ot({ config: e, status: t, entries: n, collapsed: r, onCollapsedChange: i, onConfigChange: a }) {
	let c = ge();
	return /* @__PURE__ */ s("section", {
		"aria-label": "WebSocket panel",
		className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
		children: [/* @__PURE__ */ s("header", {
			className: `flex flex-wrap items-center gap-3 px-4 py-3 ${r ? "" : "border-b border-slate-200 dark:border-slate-800"}`,
			children: [
				/* @__PURE__ */ o("button", {
					className: "min-h-10 min-w-10 rounded-lg border border-slate-300 text-base font-bold dark:border-slate-700",
					"aria-label": r ? "Expand WebSocket panel" : "Collapse WebSocket panel",
					"aria-expanded": !r,
					onClick: () => c.trigger("panel", () => i(!r)),
					children: /* @__PURE__ */ o("span", {
						"data-testid": "websocket-collapse-icon",
						onAnimationEnd: c.clear,
						className: `inline-block ${c.bouncing === "panel" ? "toggle-bounce" : ""}`,
						children: r ? "+" : "−"
					})
				}),
				/* @__PURE__ */ s("div", { children: [/* @__PURE__ */ o("p", {
					className: "text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400",
					children: "Socket"
				}), /* @__PURE__ */ o("h2", {
					className: "text-xl font-black",
					children: "Websocket"
				})] }),
				/* @__PURE__ */ s("label", {
					className: "flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-base font-semibold dark:border-slate-700",
					children: [
						/* @__PURE__ */ o("input", {
							type: "checkbox",
							"aria-label": "Enable WebSocket",
							checked: e.enabled,
							onChange: (t) => c.trigger("enabled", () => a({
								...e,
								enabled: t.target.checked
							}))
						}),
						/* @__PURE__ */ o("span", {
							"data-testid": "websocket-enable-dot",
							onAnimationEnd: c.clear,
							className: `h-2 w-2 rounded-full ${e.enabled ? "bg-emerald-500" : "bg-slate-400"} ${c.bouncing === "enabled" ? "toggle-bounce" : ""}`
						}),
						/* @__PURE__ */ o("span", { children: "Enable" })
					]
				}),
				/* @__PURE__ */ o("input", {
					className: "w-36 rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
					"aria-label": "WebSocket host",
					placeholder: "host",
					value: e.host,
					disabled: !e.enabled,
					onChange: (t) => a({
						...e,
						host: t.target.value
					})
				}),
				/* @__PURE__ */ o("input", {
					className: "w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
					"aria-label": "WebSocket port",
					placeholder: "port",
					inputMode: "numeric",
					value: e.port,
					disabled: !e.enabled,
					onChange: (t) => a({
						...e,
						port: t.target.value.replace(/[^0-9]/g, "")
					})
				}),
				/* @__PURE__ */ s("span", {
					className: `flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-white ${rt[t] ?? rt.off}`,
					children: [/* @__PURE__ */ o("span", { className: "h-1.5 w-1.5 rounded-full bg-white" }), t === "connected" ? "Connected" : t === "connecting" ? "Connecting" : t === "error" ? "Error" : "Off"]
				}),
				/* @__PURE__ */ s("p", {
					className: "ml-auto font-mono text-sm text-slate-500",
					children: [
						n.length,
						" EVENT",
						n.length === 1 ? "" : "S"
					]
				})
			]
		}), !r && (n.length ? /* @__PURE__ */ o("ul", {
			"aria-label": "WebSocket event log",
			className: "max-h-80 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800",
			children: n.map((e, t) => /* @__PURE__ */ s("li", {
				className: "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 font-mono text-base",
				children: [
					/* @__PURE__ */ o("span", {
						className: "text-slate-500 dark:text-slate-400",
						children: at(e.timestamp)
					}),
					/* @__PURE__ */ o("span", {
						className: `rounded-full px-2 py-0.5 text-sm font-bold ${it[e.type] ?? it.disconnected}`,
						children: e.type
					}),
					/* @__PURE__ */ o("span", {
						className: "min-w-0 flex-1 truncate",
						title: e.detail,
						children: e.detail
					})
				]
			}, `${e.timestamp}-${t}`))
		}) : /* @__PURE__ */ o("p", {
			className: "p-6 text-center text-base text-slate-500",
			children: "No WebSocket events yet"
		}))]
	});
}
//#endregion
//#region src/lib/cueEngine.js
var G = 100, st = class {
	constructor({ onStatus: e = () => {}, onEvent: t = () => {}, now: n = () => /* @__PURE__ */ new Date() } = {}) {
		this.onStatus = e, this.onEvent = t, this.now = n, this.runs = /* @__PURE__ */ new Map();
	}
	event(e, t, n, r, i = {}) {
		let a = {
			type: e,
			timestamp: this.now().toISOString(),
			group: {
				id: t.id,
				index: n,
				name: t.name
			},
			...i
		};
		r && (a.cue = { ...r }), this.onEvent(a);
	}
	start({ group: e, groupIndex: t, singleCueId: n, startCueId: r, source: i }) {
		this.stop(e.id, t, e.name, !1);
		let a = {
			cancelled: !1,
			timers: /* @__PURE__ */ new Set(),
			waits: /* @__PURE__ */ new Set(),
			source: i,
			group: e,
			cueId: n ?? null
		};
		return this.runs.set(e.id, a), e.cues.forEach((t) => this.onStatus(e.id, t.id, {
			status: "IDLE",
			beforeProgress: 0,
			afterProgress: 0,
			startedAt: null,
			phaseStartedAt: null
		})), this.event("sequence:started", e, t), this.runCue(a, e, t, ((t) => n ? e.cues.findIndex((e) => e.id === n) : r ? e.cues.findIndex((e) => e.id === r) : t)(0), n, this.now().getTime()), a;
	}
	runCue(e, t, n, r, i, a) {
		let o = t.cues[r];
		if (!o) {
			this.runs.delete(t.id);
			return;
		}
		let s = Math.max(0, Number(o.beforeWaitMs) || 0), c = Math.max(0, Number(o.afterWaitMs) || 0), l = a + s, u = l + c, d = (n, r, i) => {
			let a = Math.max(0, i - r);
			if (a <= 0) return;
			let s = () => {
				if (e.cancelled) return;
				let i = Math.max(0, this.now().getTime() - r), c = Math.min(99, Math.round(i / a * 100));
				if (this.onStatus(t.id, o.id, n === "before" ? { beforeProgress: c } : { afterProgress: c }), i < a) {
					let t = setTimeout(() => {
						e.timers.delete(t), s();
					}, G);
					e.timers.add(t);
				}
			};
			s();
		}, f = () => {
			if (c <= 0) {
				this.advance(e, t, n, r, i, u);
				return;
			}
			this.onStatus(t.id, o.id, {
				afterProgress: 0,
				phaseStartedAt: l
			}), d("after", l, u), this.waitUntil(e, u).then((a) => {
				a && !e.cancelled && this.advance(e, t, n, r, i, u);
			});
		};
		if (s > 0) {
			this.onStatus(t.id, o.id, {
				status: "LIVE",
				beforeProgress: 0,
				afterProgress: 0,
				startedAt: a,
				phaseStartedAt: a
			}), this.event("cue:started", t, n, o), d("before", a, l), this.waitUntil(e, l).then((r) => {
				r && !e.cancelled && (this.onStatus(t.id, o.id, { beforeProgress: 100 }), this.dispatchCue(e, t, n, o, l), this.onStatus(t.id, o.id, { status: "DONE" }), !e.cancelled && f());
			});
			return;
		}
		this.onStatus(t.id, o.id, {
			status: "DONE",
			beforeProgress: 100,
			afterProgress: 0,
			startedAt: a,
			phaseStartedAt: a
		}), this.event("cue:started", t, n, o), this.dispatchCue(e, t, n, o, l), !e.cancelled && f();
	}
	advance(e, t, n, r, i, a) {
		if (e.cancelled) return;
		if (this.onStatus(t.id, t.cues[r].id, {
			afterProgress: 100,
			phaseStartedAt: null
		}), i) {
			this.runs.delete(t.id);
			return;
		}
		let o = r + 1;
		if (o < t.cues.length) {
			this.runCue(e, t, n, o, i, a);
			return;
		}
		if (this.event("sequence:completed", t, n), t.loopEnabled) {
			t.cues.forEach((e) => this.onStatus(t.id, e.id, {
				status: "IDLE",
				beforeProgress: 0,
				afterProgress: 0,
				startedAt: null,
				phaseStartedAt: null
			})), this.runCue(e, t, n, 0, i, this.now().getTime());
			return;
		}
		this.runs.get(t.id) === e && this.runs.delete(t.id);
	}
	dispatchCue(e, t, n, r, i = this.now().getTime()) {
		let a = Math.max(0, this.now().getTime() - i), o = a > 0 ? {
			lateMs: a,
			scheduledAt: new Date(i).toISOString()
		} : {};
		if (r.type === "trigger") {
			this.event("cue:target-requested", t, n, r, {
				targetGroupName: r.targetGroupName,
				targetCueName: r.targetCueName,
				targetAction: r.targetAction,
				source: e.source ?? "sequence",
				...o
			});
			return;
		}
		this.event("cue:dispatched", t, n, r, {
			command: r.command,
			source: e.source ?? "sequence",
			...o
		});
	}
	isRunning(e) {
		return this.runs.has(e);
	}
	isSingleCueRunning(e, t) {
		return this.runs.get(e)?.cueId === t;
	}
	waitUntil(e, t) {
		return new Promise((n) => {
			if (e.cancelled) {
				n(!1);
				return;
			}
			if (t <= this.now().getTime()) {
				n(!0);
				return;
			}
			let r = {
				deadline: t,
				timer: null,
				complete: null
			};
			r.complete = (t) => {
				e.waits.delete(r) && (r.timer !== null && (clearTimeout(r.timer), e.timers.delete(r.timer)), n(t));
			}, r.timer = setTimeout(() => r.complete(!0), Math.max(0, t - this.now().getTime())), e.waits.add(r), e.timers.add(r.timer);
		});
	}
	reconcile() {
		let e = this.now().getTime();
		for (let t of this.runs.values()) for (let n of [...t.waits]) n.deadline <= e && n.complete(!0);
	}
	stop(e, t = 0, n = "", r = !0) {
		let i = this.runs.get(e);
		if (!i) return !1;
		i.cancelled = !0;
		for (let e of i.timers) clearTimeout(e);
		i.timers.clear();
		for (let e of [...i.waits]) e.complete(!1);
		if (this.runs.delete(e), i.source) this.onStatus(e, i.cueId, {
			status: "IDLE",
			beforeProgress: 0,
			afterProgress: 0,
			startedAt: null,
			phaseStartedAt: null
		});
		else {
			for (let t of i.group.cues) this.onStatus(e, t.id, {
				status: "IDLE",
				beforeProgress: 0,
				afterProgress: 0,
				startedAt: null,
				phaseStartedAt: null
			});
			r && this.event("sequence:stopped", {
				id: e,
				name: n
			}, t);
		}
		return !0;
	}
	stopAll(e) {
		e.forEach((e, t) => this.stop(e.id, t, e.name));
	}
	dispose() {
		for (let [e, t] of this.runs) {
			t.cancelled = !0;
			for (let e of t.timers) clearTimeout(e);
			t.timers.clear();
			for (let e of [...t.waits]) e.complete(!1);
			if (t.source) this.onStatus(e, t.cueId, {
				status: "IDLE",
				beforeProgress: 0,
				afterProgress: 0,
				startedAt: null,
				phaseStartedAt: null
			});
			else for (let n of t.group.cues) this.onStatus(e, n.id, {
				status: "IDLE",
				beforeProgress: 0,
				afterProgress: 0,
				startedAt: null,
				phaseStartedAt: null
			});
			this.runs.delete(e);
		}
	}
};
//#endregion
//#region src/lib/localAudioTracks.js
function ct(e, t = 96) {
	let n = Array.from({ length: t }, () => 0), r = Math.max(1, Number(e.numberOfChannels) || 1), i = Math.max(1, Number(e.length) || 1);
	for (let a = 0; a < t; a++) {
		let o = Math.floor(a * i / t), s = Math.max(o + 1, Math.floor((a + 1) * i / t));
		for (let t = 0; t < r; t++) {
			let r = e.getChannelData(t);
			for (let e = o; e < Math.min(s, r.length); e++) n[a] = Math.max(n[a], Math.abs(r[e]));
		}
	}
	return n;
}
async function lt(e) {
	let t = globalThis.AudioContext || globalThis.webkitAudioContext;
	if (!t || typeof e.arrayBuffer != "function") return {
		durationMs: 0,
		peaks: []
	};
	let n = new t();
	try {
		let t = await n.decodeAudioData(await e.arrayBuffer());
		return {
			durationMs: Math.round(t.duration * 1e3),
			peaks: ct(t)
		};
	} finally {
		await n.close?.();
	}
}
function ut({ createAudio: e = (e) => new Audio(e), createObjectURL: t = (e) => URL.createObjectURL(e), revokeObjectURL: n = (e) => URL.revokeObjectURL(e), decodeAudioData: r = lt } = {}) {
	let i = /* @__PURE__ */ new Map();
	function a(e) {
		let t = i.get(e);
		t && (t.audio.pause(), t.audio.src = "", n(t.url), i.delete(e));
	}
	return {
		async set(n, o) {
			a(n);
			let s = {
				name: o.name,
				url: t(o),
				audio: null,
				durationMs: 0,
				peaks: []
			};
			s.audio = e(s.url), i.set(n, s);
			try {
				let e = await r(o);
				i.get(n) === s && Object.assign(s, e);
			} catch {}
		},
		get(e) {
			let t = i.get(e);
			return t && {
				name: t.name,
				durationMs: t.durationMs,
				peaks: t.peaks
			};
		},
		async run(e, t) {
			let n = i.get(e);
			if (!n) return {
				ok: !1,
				message: "No local audio track selected."
			};
			if (t === "play") try {
				return await n.audio.play(), { ok: !0 };
			} catch (e) {
				return {
					ok: !1,
					message: `Audio playback failed: ${e?.message || "unknown error"}`
				};
			}
			return t === "pause" ? (n.audio.pause(), { ok: !0 }) : t === "stop" ? (n.audio.pause(), n.audio.currentTime = 0, { ok: !0 }) : {
				ok: !1,
				message: "Unknown audio action."
			};
		},
		clear: a,
		dispose() {
			[...i.keys()].forEach(a);
		}
	};
}
//#endregion
//#region src/lib/websocketCueControl.js
function dt(e) {
	let t = typeof e == "string" ? e.trim() : "";
	if (!t) return {
		ok: !1,
		reason: "Received an empty message."
	};
	let n = t;
	if (t.startsWith("{")) try {
		let e = JSON.parse(t);
		if (!e || typeof e.command != "string") return {
			ok: !1,
			reason: "Received JSON does not contain a command string."
		};
		n = e.command.trim();
	} catch {
		return {
			ok: !1,
			reason: "Received invalid JSON."
		};
	}
	let r = /^\/cue\/([^/]+)\/(start|stop)$/i.exec(n);
	if (!r) return {
		ok: !1,
		reason: `Unsupported received command: ${n}`
	};
	try {
		let e = decodeURIComponent(r[1]).trim();
		return e ? {
			ok: !0,
			command: n,
			cueName: e,
			action: r[2].toLowerCase()
		} : {
			ok: !1,
			reason: "Cue name is required."
		};
	} catch {
		return {
			ok: !1,
			reason: "Cue name contains invalid URI encoding."
		};
	}
}
//#endregion
//#region src/PAGEXQ.jsx
var ft = "mini-qlab-theme", pt = "mini-qlab-ws", mt = "mini-qlab-timeline-collapsed", ht = "mini-qlab-ws-panel-collapsed", gt = "mini-qlab-cue-column-widths", _t = 200, K = {
	sequence: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
	cron: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
	timecode: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
	hotkey: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
	info: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
	warning: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
};
function vt(e) {
	return new Date(e).toLocaleTimeString("en-GB", { hour12: !1 }) + "." + String(new Date(e).getMilliseconds()).padStart(3, "0");
}
function q(e) {
	try {
		return localStorage.getItem(e) === "true";
	} catch {
		return !1;
	}
}
function yt() {
	try {
		return f(JSON.parse(localStorage.getItem(gt) || "{}"));
	} catch {
		return { ...d };
	}
}
function bt(e, t, n) {
	let r = t + n;
	if (r < 0 || r >= e.length) return e;
	let i = [...e];
	return [i[t], i[r]] = [i[r], i[t]], i;
}
function xt(e, t, n) {
	if (t === n || t < 0 || n < 0 || t >= e.length || n >= e.length) return e;
	let r = [...e], [i] = r.splice(t, 1);
	return r.splice(n, 0, i), r;
}
function St(e) {
	return typeof e.text == "function" ? e.text() : new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(r.result), r.onerror = () => n(r.error), r.readAsText(e);
	});
}
function Ct({ onEvent: n, rxJson: a, initialGroups: c }) {
	let [u, f] = i(() => He(globalThis.localStorage) ?? Be(c ?? B())), [m, h] = i(!1), [g, _] = i(""), [v, y] = i(() => {
		try {
			return localStorage.getItem(ft) || "dark";
		} catch {
			return "dark";
		}
	}), [b, x] = i(""), [S, C] = i(() => We(globalThis.localStorage)), [w, T] = i([]), [, E] = i(0), [D, ee] = i([]), [te, ne] = i(() => q(mt)), [re, ie] = i(() => q(ht)), [ae, O] = i(yt), [k, A] = i(() => /* @__PURE__ */ new Date()), [ce, le] = i(() => {
		try {
			let e = localStorage.getItem(pt);
			if (!e) return {
				enabled: !1,
				host: "127.0.0.1",
				port: "8888"
			};
			let t = JSON.parse(e);
			return {
				enabled: !!t.enabled,
				host: String(t.host ?? ""),
				port: String(t.port ?? "")
			};
		} catch {
			return {
				enabled: !1,
				host: "127.0.0.1",
				port: "8888"
			};
		}
	}), [ue, de] = i("off"), j = r(null), M = r(u), fe = r(n), pe = r(oe()), N = r(null);
	N.current ||= ut(), M.current = u, fe.current = n;
	let P = e((e, t) => ee((n) => [{
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		type: e,
		detail: t
	}, ...n].slice(0, _t)), []), me = e((e) => {
		if (e.type === "cue:dispatched") {
			if (e.cue?.type === "audio") {
				N.current.run(e.cue.id, e.cue.audioAction).then((t) => {
					t.ok || T((n) => [{
						timestamp: e.timestamp,
						source: "warning",
						group: e.group.name,
						command: t.message
					}, ...n].slice(0, _t));
				});
				return;
			}
			let t = {
				command: e.command,
				timestamp: e.timestamp
			};
			C(t), Ge(globalThis.localStorage, t);
			let n = JSON.stringify(t), r = j.current;
			if (r && r.readyState === 1) try {
				r.send(n), P("sent", e.command || "Empty command");
			} catch (e) {
				P("error", `Send failed: ${e?.message || "unknown error"}`);
			}
			T((t) => [{
				timestamp: e.timestamp,
				source: e.lateMs > 0 ? "warning" : e.source,
				group: e.group?.name ?? "",
				command: e.lateMs > 0 ? `Late ${e.lateMs}ms · ${e.command}` : e.command
			}, ...t].slice(0, _t));
		} else if (e.type === "cue:target-requested") {
			let t = M.current, n = t.find((t) => V(t.name) === V(e.targetGroupName)), r = n?.cues.find((t) => V(t.name) === V(e.targetCueName)), i = "warning", a;
			if (!n) a = `Target group not found: ${e.targetGroupName || "unnamed"}`;
			else if (!r) a = `Target cue not found: ${e.targetCueName || "unnamed"}`;
			else if (r.type === "audio") {
				i = "info";
				let t = e.targetAction === "start" ? "play" : e.targetAction;
				a = `${t === "play" ? "Started" : t === "pause" ? "Paused" : "Stopped"} ${r.name}`, N.current.run(r.id, t).then((t) => {
					t.ok || T((r) => [{
						timestamp: e.timestamp,
						source: "warning",
						group: n.name,
						command: t.message
					}, ...r].slice(0, _t));
				});
			} else e.targetAction === "start" ? F.current.isRunning(n.id) ? a = `Ignored: ${n.name} is already running` : (i = "info", a = `Started ${n.name} from ${r.name}`, F.current.start({
				group: n,
				groupIndex: t.indexOf(n),
				startCueId: r.id
			})) : a = `${e.targetAction === "pause" ? "Pause" : "Stop"} requires an Audio cue.`;
			T((t) => [{
				timestamp: e.timestamp,
				source: i,
				group: e.group?.name ?? "",
				command: a,
				ws: !1
			}, ...t].slice(0, _t)), fe.current?.({
				...e,
				type: "cue:target-result",
				result: i === "info" ? "started" : "ignored",
				detail: a
			});
		}
		fe.current?.(e);
	}, [P]), F = r(null);
	F.current ||= new st({
		onStatus: (e, t, n) => f((r) => r.map((r) => r.id === e ? {
			...r,
			cues: r.cues.map((e) => e.id === t ? {
				...e,
				...n
			} : e)
		} : r)),
		onEvent: me
	});
	let he = e(({ group: e, groupIndex: t, cue: n, source: r }) => {
		F.current.start({
			group: {
				...e,
				loopEnabled: !1
			},
			groupIndex: t,
			singleCueId: n.id,
			source: r
		});
	}, []), ge = e((e) => {
		let t = typeof e == "string" ? e : String(e ?? "");
		P("received", t || "Empty message");
		let n = dt(t), r = (e, t) => T((n) => [{
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			source: e,
			group: "WebSocket",
			command: t,
			ws: !0
		}, ...n].slice(0, _t));
		if (!n.ok) {
			r("warning", n.reason);
			return;
		}
		let i = M.current.flatMap((e, t) => e.cues.filter((e) => V(e.name) === V(n.cueName)).map((n) => ({
			group: e,
			groupIndex: t,
			cue: n
		})));
		if (!i.length) {
			r("warning", `No cue named ${n.cueName} found.`);
			return;
		}
		if (n.action === "start") {
			i.forEach(({ group: e, groupIndex: t, cue: n }) => F.current.start({
				group: {
					...e,
					loopEnabled: !1
				},
				groupIndex: t,
				singleCueId: n.id,
				source: "websocket"
			})), r("info", `WebSocket started ${i.length} cue${i.length === 1 ? "" : "s"} named ${n.cueName}.`);
			return;
		}
		let a = i.filter(({ group: e, cue: t }) => F.current.isSingleCueRunning(e.id, t.id));
		a.forEach(({ group: e, groupIndex: t }) => F.current.stop(e.id, t, e.name)), r(a.length ? "info" : "warning", a.length ? `WebSocket stopped ${a.length} cue${a.length === 1 ? "" : "s"} named ${n.cueName}.` : `No running WebSocket cue named ${n.cueName}.`);
	}, [P]);
	t(() => {
		Ue(globalThis.localStorage, u);
	}, [u]), t(() => {
		document.querySelectorAll("option[value=\"play\"]").forEach((e) => {
			e.textContent = "Start";
		});
	}), t(() => {
		try {
			localStorage.setItem(mt, String(te));
		} catch {}
	}, [te]), t(() => {
		try {
			localStorage.setItem(ht, String(re));
		} catch {}
	}, [re]), t(() => {
		try {
			localStorage.setItem(gt, JSON.stringify(ae));
		} catch {}
	}, [ae]), t(() => {
		try {
			localStorage.setItem(ft, v);
		} catch {}
		document.documentElement.classList.toggle("dark", v === "dark");
	}, [v]), t(() => () => {
		F.current?.dispose(), N.current?.dispose();
	}, []), t(() => {
		let e = () => {
			document.visibilityState === "visible" && F.current?.reconcile();
		};
		return document.addEventListener("visibilitychange", e), window.addEventListener("focus", e), () => {
			document.removeEventListener("visibilitychange", e), window.removeEventListener("focus", e);
		};
	}, []), t(() => {
		try {
			localStorage.setItem(pt, JSON.stringify(ce));
		} catch {}
		let e = j.current;
		if (e && (e.onclose = null, e.onerror = null, e.onopen = null, e.onmessage = null, e.close(), j.current = null), !ce.enabled) {
			de("off");
			return;
		}
		let t = ce.host.trim(), n = ce.port.trim();
		if (!t || !n) {
			de("off"), P("error", "Host and port are required");
			return;
		}
		let r;
		try {
			r = new WebSocket(`ws://${t}:${n}`);
		} catch (e) {
			de("error"), P("error", `Connection failed: ${e?.message || "unknown error"}`);
			return;
		}
		return j.current = r, r.onopen = () => {
			de("connected"), P("connected", `Connected to ws://${t}:${n}`);
		}, r.onmessage = (e) => ge(e.data), r.onerror = () => {
			de("error"), P("error", `Connection error at ws://${t}:${n}`);
		}, r.onclose = () => {
			j.current === r && (j.current = null, de("off"), P("disconnected", `Disconnected from ws://${t}:${n}`));
		}, de("connecting"), P("connecting", `Connecting to ws://${t}:${n}`), () => {
			r.onclose = null, r.onerror = null, r.onopen = null, r.onmessage = null;
			try {
				r.close();
			} catch {}
			j.current === r && (j.current = null);
		};
	}, [
		ce,
		P,
		ge
	]), t(() => {
		let e = setInterval(() => A(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(e);
	}, []), t(() => {
		let e = (e) => {
			_(e.key), se(M.current, { key: e.key }).filter((e) => e.source === "hotkey").forEach(he);
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}, [he]);
	let _e = a?.TC?.string;
	t(() => {
		_e && se(M.current, { timecode: _e }).filter((e) => e.source === "timecode").forEach((e) => {
			pe.current.shouldDispatch("timecode", e.cue.id, e.observedValue) && he(e);
		});
	}, [_e, he]), t(() => {
		let e = setInterval(() => {
			let e = /* @__PURE__ */ new Date();
			se(M.current, { date: e }).filter((e) => e.source === "cron").forEach((e) => {
				pe.current.shouldDispatch("cron", e.cue.id, e.observedValue) && he(e);
			});
		}, 1e3);
		return () => clearInterval(e);
	}, [he]);
	let ve = (e, t) => f((n) => {
		if ("name" in t) {
			let r = String(t.name).trim();
			if (!r || n.some((t) => t.id !== e && V(t.name) === V(r))) return x(r ? `Group name already exists: ${r}.` : "Group name cannot be empty."), n;
		}
		return n.map((n) => n.id === e ? {
			...n,
			...t
		} : n);
	}), be = (e, t, n) => f((r) => {
		let i = r.find((t) => t.id === e);
		if ("name" in n) {
			let e = String(n.name).trim();
			if (!e || i?.cues.some((n) => n.id !== t && V(n.name) === V(e))) return x(e ? `Cue name already exists in ${i?.name}: ${e}.` : "Cue name cannot be empty."), r;
		}
		return r.map((r) => r.id === e ? {
			...r,
			cues: r.cues.map((e) => e.id === t ? {
				...e,
				...n
			} : e)
		} : r);
	}), xe = (e, t) => {
		F.current.stop(e.id, t, e.name);
	};
	async function Ce(e) {
		if (e) try {
			f(Be(JSON.parse(await St(e)))), x("Import complete.");
		} catch (e) {
			x(`Import failed: ${e.message}`);
		}
	}
	function I() {
		try {
			let e = URL.createObjectURL(new Blob([JSON.stringify(Ve(u), null, 2)], { type: "application/json" })), t = document.createElement("a");
			t.href = e, t.download = "mini-qlab-cues.json", t.click(), URL.revokeObjectURL(e), x("Export complete.");
		} catch (e) {
			x(`Export failed: ${e.message}`);
		}
	}
	return /* @__PURE__ */ s("div", {
		className: "min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100",
		children: [
			/* @__PURE__ */ o(Se, {
				onGoAll: () => M.current.forEach((e, t) => F.current.start({
					group: e,
					groupIndex: t
				})),
				onStopAll: () => {
					F.current.stopAll(M.current);
				},
				theme: v,
				onThemeChange: y,
				panelOpen: m,
				onPanelToggle: () => h((e) => !e),
				onAddGroup: () => f((e) => {
					let t = e.length + 1;
					for (; e.some((e) => V(e.name) === V(`Cue Group ${t}`));) t++;
					return [...e, Re({ name: `Cue Group ${t}` })];
				}),
				onRemoveGroup: () => f((e) => (e.at(-1)?.cues.forEach((e) => N.current.clear(e.id)), e.slice(0, -1))),
				onReset: () => {
					F.current.dispose(), N.current.dispose(), f(B()), x("Default configuration restored.");
				},
				onExport: I,
				onImport: Ce
			}),
			/* @__PURE__ */ s("div", {
				className: "mx-auto flex w-full flex-col gap-4 px-3 py-4 sm:w-[90%] sm:px-0 lg:flex-row",
				children: [/* @__PURE__ */ s("main", {
					className: "min-w-0 flex-1 space-y-4",
					children: [
						/* @__PURE__ */ s("div", {
							className: "flex items-end justify-between",
							children: [/* @__PURE__ */ s("div", { children: [/* @__PURE__ */ o("p", {
								className: "text-sm font-bold uppercase tracking-[.2em] text-cyan-600",
								children: "Workspace"
							}), /* @__PURE__ */ o("h2", {
								className: "text-3xl font-black",
								children: "Cue groups"
							})] }), /* @__PURE__ */ s("p", {
								className: "font-mono text-sm text-slate-500",
								children: [
									u.length,
									" GROUP",
									u.length === 1 ? "" : "S"
								]
							})]
						}),
						/* @__PURE__ */ o(nt, {
							groups: u,
							audioMediaByCueId: Object.fromEntries(u.flatMap((e) => e.cues.map((e) => [e.id, N.current.get(e.id)]))),
							collapsed: te,
							onCollapsedChange: ne,
							onCueChange: be,
							onCueAdd: (e, t, n) => f((r) => r.map((r) => r.id === e ? !V(n.name) || r.cues.some((e) => V(e.name) === V(n.name)) ? (x(`Cue name must be unique in ${r.name}.`), r) : {
								...r,
								cues: [
									...r.cues.slice(0, t),
									Le(n),
									...r.cues.slice(t)
								]
							} : r)),
							onCueRemove: (e, t) => f((n) => n.map((n) => n.id === e ? {
								...n,
								cues: n.cues.filter((e) => e.id !== t)
							} : n)),
							onCueReorder: (e, t, n) => f((r) => r.map((r) => r.id === e ? {
								...r,
								cues: xt(r.cues, t, n)
							} : r))
						}),
						u.map((e, t) => /* @__PURE__ */ o(ye, {
							group: e,
							groups: u,
							index: t,
							lastKey: g,
							columnWidths: ae,
							onColumnResize: (e, t) => O((n) => ({
								...n,
								[e]: p(e, t)
							})),
							onColumnReset: (e) => O((t) => ({
								...t,
								[e]: d[e]
							})),
							now: k,
							onGroupChange: (t) => ve(e.id, t),
							onGo: () => F.current.start({
								group: e,
								groupIndex: t
							}),
							onStop: () => xe(e, t),
							onMove: (e) => f((n) => bt(n, t, e)),
							onRemove: () => {
								e.cues.forEach((e) => N.current.clear(e.id)), E((e) => e + 1), f((t) => t.filter((t) => t.id !== e.id));
							},
							audioMediaByCueId: Object.fromEntries(e.cues.map((e) => [e.id, N.current.get(e.id)])),
							onAudioFileSelect: (e, t) => {
								t && (N.current.set(e, t).then(() => E((e) => e + 1)), E((e) => e + 1));
							},
							onAudioClear: (e) => {
								N.current.clear(e), E((e) => e + 1);
							},
							onCueChange: (t, n) => be(e.id, t, n),
							onCueBlur: (t) => {
								let n = M.current.find((t) => t.id === e.id)?.cues.find((e) => e.id === t);
								be(e.id, t, { command: Fe(n?.command) });
							},
							onCueInsert: (t) => f((n) => n.map((n) => n.id === e.id ? {
								...n,
								cues: [
									...n.cues.slice(0, t + 1),
									Le({ name: `Cue ${n.cues.length + 1}` }),
									...n.cues.slice(t + 1)
								]
							} : n)),
							onCueMove: (t, n) => f((r) => r.map((r) => r.id === e.id ? {
								...r,
								cues: bt(r.cues, t, n)
							} : r)),
							onCueDuplicate: (t) => f((n) => n.map((n) => n.id === e.id ? {
								...n,
								cues: [
									...n.cues.slice(0, t + 1),
									Le({
										...n.cues[t],
										id: void 0,
										name: `${n.cues[t].name} copy`
									}),
									...n.cues.slice(t + 1)
								]
							} : n)),
							onCueRemove: (t) => f((n) => n.map((n) => n.id === e.id ? {
								...n,
								cues: n.cues.filter((e) => e.id !== t)
							} : n))
						}, e.id)),
						!u.length && /* @__PURE__ */ s("div", {
							className: "rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700",
							children: [/* @__PURE__ */ o("p", {
								className: "text-lg font-bold",
								children: "No cue groups"
							}), /* @__PURE__ */ o("p", {
								className: "text-base text-slate-500",
								children: "Use Q-Group + to start a sequence."
							})]
						}),
						/* @__PURE__ */ s("section", {
							"aria-label": "Cue log",
							className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
							children: [/* @__PURE__ */ s("header", {
								className: "flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800",
								children: [/* @__PURE__ */ s("div", { children: [/* @__PURE__ */ o("p", {
									className: "text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400",
									children: "Log"
								}), /* @__PURE__ */ o("h2", {
									className: "text-xl font-black",
									children: "event"
								})] }), /* @__PURE__ */ s("p", {
									className: "ml-auto font-mono text-sm text-slate-500",
									children: [
										w.length,
										" EVENT",
										w.length === 1 ? "" : "S"
									]
								})]
							}), w.length ? /* @__PURE__ */ o("ul", {
								className: "max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800",
								children: w.map((e, t) => /* @__PURE__ */ s("li", {
									className: "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 font-mono text-base",
									children: [
										/* @__PURE__ */ o("span", {
											className: "text-slate-500 dark:text-slate-400",
											children: vt(e.timestamp)
										}),
										/* @__PURE__ */ o("span", {
											className: `rounded-full px-2 py-0.5 text-sm font-bold ${K[e.source] ?? "bg-slate-200 text-slate-700"}`,
											children: e.source
										}),
										/* @__PURE__ */ o("span", {
											className: "text-slate-500 dark:text-slate-400",
											children: e.group
										}),
										/* @__PURE__ */ o("span", {
											className: "min-w-0 flex-1 truncate text-slate-900 dark:text-slate-100",
											title: e.command,
											children: e.command || "—"
										})
									]
								}, `${e.timestamp}-${t}`))
							}) : /* @__PURE__ */ o("p", {
								className: "p-6 text-center text-base text-slate-500",
								children: "No dispatched cues yet"
							})]
						}),
						/* @__PURE__ */ o(ot, {
							config: ce,
							status: ue,
							entries: D,
							collapsed: re,
							onCollapsedChange: ie,
							onConfigChange: le
						})
					]
				}), /* @__PURE__ */ o(l, {
					groups: u,
					open: m
				})]
			}),
			/* @__PURE__ */ o("div", {
				className: "sr-only",
				"aria-label": "TX_JSON_CMD",
				children: S ? JSON.stringify(S) : ""
			}),
			/* @__PURE__ */ o("div", {
				role: "status",
				"aria-live": "polite",
				className: "fixed bottom-4 right-4 max-w-sm rounded-lg bg-slate-900 px-4 py-3 text-base text-white shadow-xl empty:hidden",
				children: b
			})
		]
	});
}
//#endregion
export { Ct as default };
