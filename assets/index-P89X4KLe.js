(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class extends Error{field;constructor(e,t){super(`[cad-blueprint] ${e}: ${t}`),this.name=`CadError`,this.field=e}},t=class extends e{constructor(e,t){super(e,t),this.name=`CadSettingsError`}};Object.freeze([`cartesian`,`screen`]);function n(e){return e===`cartesian`||e===`screen`}function r(e,r=`coordinateSystem`){if(!n(e))throw new t(r,`must be "cartesian" or "screen", got ${String(e)}`)}function i(e,t){return e===`cartesian`?[t[0],t[1]===0?0:-t[1]]:[t[0],t[1]]}function a(e,t){return i(e,t)}function o(e,n){if(typeof e!=`number`||!Number.isFinite(e)||e<0)throw new t(n,`must be a non-negative finite number, got ${String(e)}`);return e}function s(e,n=`padding`){if(typeof e==`number`){let t=o(e,n);return Object.freeze({top:t,right:t,bottom:t,left:t})}if(Array.isArray(e)){let r=e;if(r.length===2){let e=o(r[0],`${n}[0]`),t=o(r[1],`${n}[1]`);return Object.freeze({top:e,right:t,bottom:e,left:t})}if(r.length===4)return Object.freeze({top:o(r[0],`${n}[0]`),right:o(r[1],`${n}[1]`),bottom:o(r[2],`${n}[2]`),left:o(r[3],`${n}[3]`)});throw new t(n,`array form must have 2 or 4 items, got ${r.length}`)}if(typeof e!=`object`||!e)throw new t(n,`invalid value ${String(e)}`);let r=e;return Object.freeze({top:o(r.top??0,`${n}.top`),right:o(r.right??0,`${n}.right`),bottom:o(r.bottom??0,`${n}.bottom`),left:o(r.left??0,`${n}.left`)})}function c(e,n=`precision`){if(typeof e!=`number`||!Number.isInteger(e)||e<0||e>10)throw new t(n,`must be an integer in range 0…10, got ${String(e)}`)}function l(e,t){if(!Number.isFinite(e))return e;let n=Number(e.toFixed(t));return n===0?0:n}Object.freeze(`1:1,1:2,1:2.5,1:4,1:5,1:10,1:15,1:20,1:25,1:40,1:50,1:75,1:100,1:200,1:400,1:500,1:800,1:1000,2:1,2.5:1,4:1,5:1,10:1,20:1,40:1,50:1,100:1`.split(`,`));var u=/^\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*$/;function d(e,n){if(typeof e!=`number`||!Number.isFinite(e)||e<=0)throw new t(n,`must be a positive finite number, got ${String(e)}`)}function f(e,n=`scale`){if(typeof e==`string`){let r=u.exec(e);if(!r)throw new t(n,`invalid scale "${e}", expected format "1:50"`);let i=Number(r[1]),a=Number(r[2]);return d(i,n),d(a,n),Object.freeze({numerator:i,denominator:a})}if(typeof e!=`object`||!e)throw new t(n,`invalid scale ${String(e)}`);return d(e.numerator,`${n}.numerator`),d(e.denominator,`${n}.denominator`),Object.freeze({numerator:e.numerator,denominator:e.denominator})}function p(e){return e.numerator/e.denominator}function m(e){return`${e.numerator}:${e.denominator}`}var h=Object.freeze({mm:{id:`mm`,suffix:`mm`,mmPerUnit:1,dxfInsUnits:4},cm:{id:`cm`,suffix:`cm`,mmPerUnit:10,dxfInsUnits:5},m:{id:`m`,suffix:`m`,mmPerUnit:1e3,dxfInsUnits:6},inch:{id:`inch`,suffix:`in`,mmPerUnit:25.4,dxfInsUnits:1}});Object.freeze([`mm`,`cm`,`m`,`inch`]);function g(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(h,e)}function _(e){let n=h[e];if(!n)throw new t(`units`,`unknown unit "${String(e)}"`);return n}var v=Object.freeze({units:`mm`,precision:3,scale:Object.freeze({numerator:1,denominator:1}),annotationScale:Object.freeze({numerator:1,denominator:1}),coordinateSystem:`cartesian`,padding:Object.freeze({top:10,right:10,bottom:10,left:10})});function y(e={},n=v){let i=e.units??n.units;if(!g(i))throw new t(`units`,`must be one of mm | cm | m | inch, got ${String(i)}`);let a=e.precision??n.precision;c(a);let o=e.coordinateSystem??n.coordinateSystem;r(o);let l=e.scale===void 0?n.scale:f(e.scale,`scale`),u=e.annotationScale===void 0?n.annotationScale:e.annotationScale===`auto`?l:f(e.annotationScale,`annotationScale`),d=e.padding===void 0?n.padding:s(e.padding);return Object.freeze({units:i,precision:a,scale:l,annotationScale:u,coordinateSystem:o,padding:d})}function b(e,t){return y(t,e)}function x(e){if(e==null)return v;if(typeof e!=`object`||Array.isArray(e))throw new t(`settings`,`must be an object`);return y(e)}function S(e){let t=_(e.units).mmPerUnit,n=p(e.scale),r=p(e.annotationScale),o=t=>l(t,e.precision),s=e=>e/(t*n);return Object.freeze({settings:e,mmPerUnit:t,scaleFactor:n,annotationFactor:r,round:o,roundPoint:e=>[o(e[0]),o(e[1])],modelToPaperMm:e=>e*t*n,paperMmToModel:s,annotationToModel:e=>e/(t*r),paddingInModelUnits:()=>{let t=e.padding;return{top:s(t.top),right:s(t.right),bottom:s(t.bottom),left:s(t.left)}},toScreen:t=>i(e.coordinateSystem,t),fromScreen:t=>a(e.coordinateSystem,t)})}var C=class extends e{constructor(e,t){super(e,t),this.name=`CadLayerError`}},w=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i;function T(e,t=`color`){if(typeof e!=`string`||!w.test(e))throw new C(t,`must be a hex color like "#rrggbb" or "#rgb", got ${String(e)}`);let n=e.slice(1).toLowerCase();return n.length===3?`#${n[0]}${n[0]}${n[1]}${n[1]}${n[2]}${n[2]}`:`#${n}`}function E(e){let t=T(e);return[parseInt(t.slice(1,3),16),parseInt(t.slice(3,5),16),parseInt(t.slice(5,7),16)]}function D(e,t=`dxfColorIndex`){if(typeof e!=`number`||!Number.isInteger(e)||e<1||e>255)throw new C(t,`must be an integer in range 1…255, got ${String(e)}`)}var O=[[1,[255,0,0]],[2,[255,255,0]],[3,[0,255,0]],[4,[0,255,255]],[5,[0,0,255]],[6,[255,0,255]],[7,[255,255,255]],[7,[0,0,0]],[8,[128,128,128]],[9,[192,192,192]],[252,[132,132,132]],[253,[173,173,173]],[254,[214,214,214]]];function k(e){let[t,n,r]=E(e),i=7,a=1/0;for(let[e,[o,s,c]]of O){let l=(t-o)**2+(n-s)**2+(r-c)**2;l<a&&(a=l,i=e)}return i}var A=Object.freeze([`continuous`,`dashed`,`dashdot`,`dotted`]),j=Object.freeze({continuous:Object.freeze([]),dashed:Object.freeze([6,2]),dashdot:Object.freeze([12,3,2,3]),dotted:Object.freeze([1,2])});function M(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(j,e)}function N(e,t,n=!1){if(!Array.isArray(e))throw new C(t,`must be an array of numbers, got ${String(e)}`);let r=e;if(r.length===0){if(n)return Object.freeze([]);throw new C(t,`pattern must not be empty`)}if(r.length%2!=0||r.length>12)throw new C(t,`must have an even number of items (2…12), got ${r.length}`);let i=[];return r.forEach((e,n)=>{if(typeof e!=`number`||!Number.isFinite(e)||e<=0||e>1e3)throw new C(`${t}[${n}]`,`must be a positive number (mm), got ${String(e)}`);i.push(e)}),Object.freeze(i)}function ee(e,t=`lineType`){if(typeof e==`string`){if(M(e))return e;throw new C(t,`unknown preset "${e}", expected one of ${A.join(` | `)}`)}return N(e,t)}function P(e){return typeof e==`string`?j[e]:e}function te(e){return typeof e==`string`?e.toUpperCase():`CUSTOM_${e.map(e=>String(e).replace(`.`,`P`)).join(`_`)}`}function ne(e){return P(e).map((e,t)=>t%2==0?e:-e)}var re=Object.freeze({angle:45,spacing:3,lineWidth:.18,offset:0}),ie=1e3,ae=[`angle`,`spacing`,`lineWidth`,`color`,`dash`,`offset`];function F(e,t){if(typeof e!=`number`||!Number.isFinite(e))throw new C(t,`must be a finite number, got ${String(e)}`);return e}function oe(e){let t=(e%180+180)%180;return t===0?0:t}function I(e,t){let n=F(e.spacing??re.spacing,`${t}.spacing`);if(n<=0||n>1e3)throw new C(`${t}.spacing`,`must be in range (0, ${ie}] mm, got ${n}`);let r=F(e.lineWidth??re.lineWidth,`${t}.lineWidth`);if(r<0)throw new C(`${t}.lineWidth`,`must be >= 0, got ${r}`);let i=F(e.offset??re.offset,`${t}.offset`);return Object.freeze({angle:oe(F(e.angle??re.angle,`${t}.angle`)),spacing:n,lineWidth:r,color:e.color===void 0||e.color===null?null:T(e.color,`${t}.color`),dash:e.dash===void 0?Object.freeze([]):N(e.dash,`${t}.dash`,!0),offset:i})}function se(e={}){if(typeof e!=`object`||!e)throw new C(`hatch`,`must be an object, got ${String(e)}`);let t=ae.some(t=>e[t]!==void 0),n;if(e.families!==void 0){if(t)throw new C(`hatch`,`use either "families" or the simple fields (angle, spacing, …), not both`);if(!Array.isArray(e.families)||e.families.length>8)throw new C(`hatch.families`,`must be an array of up to 8 items`);n=e.families.map((e,t)=>I(e,`hatch.families[${t}]`))}else n=t?[I(e,`hatch`)]:[];let r=e.background===void 0||e.background===null?null:T(e.background,`hatch.background`);if(n.length===0&&r===null)throw new C(`hatch`,`is empty: set line fields, "families" or "background" (or use null for no hatch)`);if(e.name!==void 0&&(typeof e.name!=`string`||e.name.length>100))throw new C(`hatch.name`,`must be a string up to 100 characters`);return Object.freeze({name:e.name??`custom`,families:Object.freeze(n),background:r})}function ce(e,t){let n=T(t,`layerColor`);return e.families.every(e=>e.color!==null)?e:Object.freeze({...e,families:Object.freeze(e.families.map(e=>e.color===null?Object.freeze({...e,color:n}):e))})}var le=Object.freeze({"steel-45":se({name:`steel-45`,angle:45,spacing:2,lineWidth:.18}),"board-45":se({name:`board-45`,angle:135,spacing:3,lineWidth:.18}),"cladding-45":se({name:`cladding-45`,angle:45,spacing:4,lineWidth:.13}),"wall-45":se({name:`wall-45`,angle:135,spacing:3,lineWidth:.25}),concrete:se({name:`concrete`,angle:45,spacing:2.5,lineWidth:.3,dash:[.3,2.2],offset:1.25})}),ue=Object.freeze(Object.keys(le));function de(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(le,e)}function L(e){if(!de(e))throw new C(`hatch`,`unknown preset "${e}", expected one of ${ue.join(` | `)}`);return le[e]}var fe=Object.freeze([0,.05,.09,.13,.15,.18,.2,.25,.3,.35,.4,.5,.53,.6,.7,.8,.9,1,1.06,1.2,1.4,1.58,2,2.11]);function pe(e,t=`lineWeight`){if(typeof e!=`number`||!Number.isFinite(e)||e<0||e>10)throw new C(t,`must be a number in range 0…10 (mm), got ${String(e)}`)}function me(e){let t=0,n=1/0;for(let r of fe){let i=Math.abs(r-e);i<n&&(n=i,t=r)}return t}function R(e){return Math.round(me(e)*100)}var he=Object.freeze({color:`#000000`,dxfColorIndex:7,lineWeight:.25,lineType:`continuous`,opacity:1,visible:!0,locked:!1,hatch:null}),z=/[<>/\\":;?*|=,`]/;function B(e,t=`name`){if(typeof e!=`string`||e.length===0)throw new C(t,`must be a non-empty string`);if(e.length>255)throw new C(t,`must be at most 255 characters`);if(e!==e.trim())throw new C(t,`must not start or end with whitespace, got "${e}"`);if(z.test(e))throw new C(t,`contains forbidden characters (< > / \\ " : ; ? * | = , \`): "${e}"`)}function ge(e){return e.toLowerCase()}function _e(e){return typeof e==`string`?L(e):se(e)}function ve(e,t={},n=he){if(B(e),typeof t!=`object`||!t)throw new C(e,`layer properties must be an object, got ${String(t)}`);let r=t.color===void 0?n.color:T(t.color),i;t.dxfColorIndex===`auto`?i=k(r):t.dxfColorIndex===void 0?i=t.color===void 0?n.dxfColorIndex:k(r):(D(t.dxfColorIndex),i=t.dxfColorIndex);let a=t.lineWeight??n.lineWeight;pe(a);let o=t.opacity??n.opacity;if(typeof o!=`number`||!Number.isFinite(o)||o<0||o>1)throw new C(`opacity`,`must be a number in range 0…1, got ${String(o)}`);let s=t.visible??n.visible,c=t.locked??n.locked;if(typeof s!=`boolean`)throw new C(`visible`,`must be boolean, got ${String(s)}`);if(typeof c!=`boolean`)throw new C(`locked`,`must be boolean, got ${String(c)}`);let l=t.hatch===void 0?n.hatch:t.hatch===null?null:_e(t.hatch);return Object.freeze({name:e,color:r,dxfColorIndex:i,lineWeight:a,lineType:t.lineType===void 0?n.lineType:ee(t.lineType),opacity:o,visible:s,locked:c,hatch:l})}var ye=class e{layers=new Map;listeners=new Set;currentKey=ge(`0`);constructor(e=[]){this.layers.set(ge(`0`),ve(`0`));for(let t of e){let{name:e,...n}=t;ge(e)===ge(`0`)?this.layers.set(ge(e),ve(`0`,n,this.requireKey(ge(e)))):this.layers.set(ge(e),this.assertNew(e,n))}}get size(){return this.layers.size}get current(){return this.requireKey(this.currentKey)}has(e){return this.layers.has(ge(e))}get(e){return this.layers.get(ge(e))}require(e){return this.requireKey(ge(e),e)}list(){return[...this.layers.values()]}names(){return this.list().map(e=>e.name)}[Symbol.iterator](){return this.layers.values()}create(e,t={}){let n=this.assertNew(e,t);return this.layers.set(ge(e),n),this.emit({type:`create`,layer:n}),n}update(e,t){let n=this.require(e),r=ve(n.name,t,n);return this.layers.set(ge(n.name),r),this.emit({type:`update`,layer:r,previous:n}),r}rename(e,t){let n=this.require(e);if(B(t,`newName`),ge(n.name)===ge(`0`))throw new C(n.name,`layer "0" cannot be renamed`);let r=ge(n.name),i=ge(t);if(i!==r&&this.layers.has(i))throw new C(`newName`,`layer "${t}" already exists`);let a=ve(t,{},n),o=new Map;for(let[e,t]of this.layers)e===r?o.set(i,a):o.set(e,t);this.layers.clear();for(let[e,t]of o)this.layers.set(e,t);return this.currentKey===r&&(this.currentKey=i),this.emit({type:`rename`,layer:a,previous:n}),a}clone(e,t,n={}){let r=this.require(e);if(B(t,`newName`),this.has(t))throw new C(`newName`,`layer "${t}" already exists`);let i=ve(t,n,r);return this.layers.set(ge(t),i),this.emit({type:`create`,layer:i}),i}delete(e){let t=this.require(e),n=ge(t.name);if(n===ge(`0`))throw new C(t.name,`layer "0" cannot be deleted`);if(n===this.currentKey)throw new C(t.name,`the current layer cannot be deleted; switch to another layer first`);this.layers.delete(n),this.emit({type:`delete`,layer:t})}setCurrent(e){let t=this.require(e);return this.currentKey=ge(t.name),this.emit({type:`current`,layer:t}),t}setVisible(e,t){return this.update(e,{visible:t})}setLocked(e,t){return this.update(e,{locked:t})}isolate(e){let t=this.require(e);for(let e of this.list()){let n=e.name===t.name;e.visible!==n&&this.update(e.name,{visible:n})}}showAll(){for(let e of this.list())e.visible||this.update(e.name,{visible:!0})}onChange(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}toJSON(){return{current:this.current.name,layers:this.list()}}static fromJSON(t){if(typeof t!=`object`||!t||Array.isArray(t))throw new C(`layers`,`must be an object { current, layers }`);let{current:n,layers:r}=t;if(!Array.isArray(r))throw new C(`layers`,`must be an array of layer definitions`);let i=new e(r);if(n!==void 0){if(typeof n!=`string`)throw new C(`current`,`must be a string`);i.setCurrent(n)}return i}requireKey(e,t=e){let n=this.layers.get(e);if(!n)throw new C(t,`layer not found`);return n}assertNew(e,t){if(B(e),this.layers.has(ge(e)))throw new C(e,`layer already exists`);return ve(e,t)}emit(e){for(let t of[...this.listeners])t(e)}},V=class extends e{constructor(e,t){super(e,t),this.name=`CadTypographyError`}},be=1e5;function xe(e,t){if(typeof e!=`number`||!Number.isFinite(e)||e<=0||e>be)throw new V(t,`must be a positive number up to ${be}, got ${String(e)}`);return e}function Se(e,t){if(typeof e!=`number`||!Number.isFinite(e)||e<0||e>be)throw new V(t,`must be a number in range 0…${be}, got ${String(e)}`);return e}function Ce(e){let t={};for(let[n,r]of e)for(let e of n)t[e]=r;return t}function we(e,t){let n=Array.from(e);if(n.length!==t.length)throw Error(`font-metrics: ${n.length} chars vs ${t.length} widths`);let r={};return n.forEach((e,n)=>{r[e]=t[n]}),r}var Te=`АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ`,Ee=`абвгдеёжзийклмнопрстуфхцчшщъыьэюя`,De={...we(Te,[667,667,667,556,700,667,667,900,611,722,722,667,690,833,722,778,722,667,722,611,667,800,667,725,667,960,990,790,900,650,667,1e3,700]),...we(Ee,[556,556,535,400,580,556,556,760,480,560,560,500,540,640,540,556,540,556,500,460,500,750,500,570,520,800,830,600,700,520,500,760,520]),...Ce([[`І`,278],[`і`,222],[`ї`,278],[`Ї`,278],[`Є`,722],[`є`,500],[`Ґ`,556],[`ґ`,400],[`Ў`,667],[`ў`,500]])},Oe=Ce([[`°`,400],[`±`,584],[`×`,584],[`÷`,584],[`≈`,584],[`≤`,584],[`≥`,584],[`≠`,584],[`–`,556],[`—`,1e3],[`…`,1e3],[`‘`,222],[`’`,222],[`“`,333],[`”`,333],[`«`,556],[`»`,556],[`²`,333],[`³`,333],[`№`,1e3],[`€`,556],[`Ø`,778],[`ø`,611],[`Ω`,768],[`µ`,576],[`\xA0`,278]]),ke={...Oe,...Ce([[` !,./:;I[\\]ft`,278],[`ijl`,222],[`'`,191],["()-`r",333],[`"`,355],[`*`,389],[`^`,469],[`Jcksvxyz`,500],[`0123456789#$?_abdeghnopquL`,556],[`+<=>~`,584],[`|`,260],[`{}`,334],[`FTZ`,611],[`ABEKPSVXY&`,667],[`CDHNRUw`,722],[`GOQ`,778],[`Mm`,833],[`%`,889],[`W`,944],[`@`,1015]]),...De},Ae=Object.fromEntries(Object.entries(De).map(([e,t])=>[e,Math.round(t*.92)])),je={...Oe,...Ce([[` ,.`,250],[`/:;ijlt\\`,278],["!()-[]`Ifr",333],[`'`,180],[`"`,408],[`?acez`,444],[`sJ`,389],[`{}`,480],[`0123456789#$*_bdghknopquvxy`,500],[`~`,541],[`FPS`,556],[`+<=>`,564],[`ELTZ`,611],[`BCR`,667],[`ADGHKNOQUVXYw`,722],[`&m`,778],[`%`,833],[`M`,889],[`@`,921],[`W`,944],[`|`,200],[`^`,469]]),...Ae};function Me(){let e=Ce([[`I`,200],[`EFLTГЕТЬ`,500],[`MWЖМШЫЮФ`,800],[`ЩЦ`,900],[`1`,400],[`.,:;'!|і`,200],[`()`,300],[`-`,400],[`ijl`,200],[`frtг`,400],[`mwмшыю`,700],[`щфж`,800],[`abcdeghknopqsuvxyz`,500],[`абвдеёзийклнопрстухцчъьэя`,500]]),t={},n=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`+Te+Ee+`.,:;'!|()-+=<>/*%#@$&?_[]{}~^\`"\\°±×÷≈–—…«»²³№Ø`;for(let r of n)t[r]=(e[r]??600)+200;return t[` `]=600,t[`\xA0`]=600,t}function Ne(e){return Object.freeze({...e,advances:Object.freeze({...e.advances})})}var Pe=Object.freeze({sans:Ne({unitsPerEm:1e3,capHeight:716,xHeight:519,descent:212,defaultAdvance:556,advances:ke}),serif:Ne({unitsPerEm:1e3,capHeight:662,xHeight:450,descent:217,defaultAdvance:500,advances:je}),mono:Ne({unitsPerEm:1e3,capHeight:562,xHeight:426,descent:157,defaultAdvance:600,advances:{}}),"gost-b":Ne({unitsPerEm:1e3,capHeight:1e3,xHeight:700,descent:300,defaultAdvance:800,advances:Me()})}),Fe=Object.freeze(Object.keys(Pe));function Ie(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(Pe,e)}function Le(e){for(let t of Fe)if(Pe[t]===e)return t;return null}function Re(e,t){if(typeof e!=`object`||!e||Array.isArray(e))throw new V(t,`must be an object { "char": advance }`);let n={};for(let[r,i]of Object.entries(e)){if(Array.from(r).length!==1)throw new V(`${t}["${r}"]`,`key must be exactly one character`);n[r]=Se(i,`${t}["${r}"]`)}return n}function ze(e=`sans`,t=`metrics`){if(typeof e==`string`){if(!Ie(e))throw new V(t,`unknown metrics preset "${e}", expected one of ${Fe.join(` | `)}`);return Pe[e]}if(typeof e!=`object`||!e||Array.isArray(e))throw new V(t,`must be a preset name or an object, got ${String(e)}`);if(Le(e)!==null)return e;let n=e;if(n.base!==void 0&&!Ie(n.base))throw new V(`${t}.base`,`unknown metrics preset "${String(n.base)}"`);let r=n.base===void 0?void 0:Pe[n.base],i=e=>{let i=n[e]??r?.[e];if(i===void 0)throw new V(`${t}.${e}`,`is required (or set "base")`);return xe(i,`${t}.${e}`)},a=n.descent??r?.descent;if(a===void 0)throw new V(`${t}.descent`,`is required (or set "base")`);let o={...r?.advances??{},...n.advances===void 0?{}:Re(n.advances,`${t}.advances`)};return Ne({unitsPerEm:i(`unitsPerEm`),capHeight:i(`capHeight`),xHeight:i(`xHeight`),descent:Se(a,`${t}.descent`),defaultAdvance:i(`defaultAdvance`),advances:o})}function Be(e,t){let n=e.advances[t];if(n!==void 0)return n;let r=t.codePointAt(0)??0;return r<32&&t!==`	`||r>=768&&r<=879||r===8203||r===8204||r===8205||r===65279?0:e.defaultAdvance}var Ve=Object.freeze([`sans-serif`,`serif`,`monospace`]),He=4e3,Ue=`sans`;function We(e){return e.toLowerCase()}var Ge=/[\u0000-\u001f\u007f"'\\<>{};`]/,Ke=/[\s\u0000-\u001f\u007f"'()\\<>`]/,qe=/[\u0000-\u001f\u007f"'\\/<>:|?*]/;function Je(e,t=`id`){if(typeof e!=`string`||e.length===0)throw new V(t,`must be a non-empty string`);if(e.length>100)throw new V(t,`must be at most 100 characters`);if(e!==e.trim())throw new V(t,`must not start or end with whitespace, got "${e}"`);if(Ge.test(e))throw new V(t,`contains forbidden characters (control, quotes, \\ < > { } ; \`): "${e}"`)}function Ye(e,t=`family`){Je(e,t)}function Xe(e,t){if(typeof e!=`number`||!Number.isInteger(e)||e<100||e>900||e%100!=0)throw new V(t,`must be one of 100, 200, … 900, got ${String(e)}`)}function Ze(e,t=`url`){if(typeof e!=`string`||e.length===0||e.length>He)throw new V(t,`must be a non-empty string up to ${He} characters`);if(Ke.test(e))throw new V(t,`must not contain whitespace, quotes, parentheses, backslashes or < > (encode them in the URL)`);let n=e.toLowerCase();if(/^[a-z][a-z0-9+.-]*:/.test(n)&&!/^(https?:\/\/|data:(font|application)\/)/.test(n))throw new V(t,`only http(s), relative and data:font/… URLs are allowed`)}var Qe=Object.freeze({woff2:`woff2`,woff:`woff`,ttf:`truetype`,otf:`opentype`}),$e=Object.freeze([`woff2`,`woff`,`truetype`,`opentype`]),et=Object.freeze([`normal`,`italic`,`oblique`]);function tt(e){let t=/^data:[a-z-]+\/(?:x-)?(?:font-)?(woff2|woff|ttf|otf)/i.exec(e);if(t)return Qe[(t[1]??``).toLowerCase()]??null;let n=e.split(/[?#]/)[0]??``,r=/\.([a-z0-9]+)$/i.exec(n)?.[1]?.toLowerCase();return r===void 0?null:Qe[r]??null}function nt(e,t){if(typeof e!=`object`||!e)throw new V(t,`must be an object, got ${String(e)}`);Ze(e.url,`${t}.url`);let n=e.weight??400;Xe(n,`${t}.weight`);let r=e.style??`normal`;if(!et.includes(r))throw new V(`${t}.style`,`must be one of ${et.join(` | `)}, got ${String(r)}`);let i;if(e.format===void 0)i=tt(e.url);else if(e.format===null)i=null;else if($e.includes(e.format))i=e.format;else throw new V(`${t}.format`,`must be one of ${$e.join(` | `)}, got ${String(e.format)}`);return Object.freeze({url:e.url,format:i,weight:n,style:r})}function rt(e,t,n){if(e===null||e===!1)return null;let r=e===!0?{}:e;if(typeof r!=`object`)throw new V(n,`must be boolean, an object or null, got ${String(e)}`);let i=r.family??t;Ye(i,`${n}.family`);let a=r.weights??[400];if(!Array.isArray(a)||a.length===0||a.length>9)throw new V(`${n}.weights`,`must be a non-empty array of up to 9 weights`);a.forEach((e,t)=>Xe(e,`${n}.weights[${t}]`));let o=[...new Set(a)].sort((e,t)=>e-t),s=r.italic??!1;if(typeof s!=`boolean`)throw new V(`${n}.italic`,`must be boolean, got ${String(s)}`);return Object.freeze({family:i,weights:Object.freeze(o),italic:s})}function it(e,t,n){if(e==null)return null;if(typeof e!=`string`||e.length===0||e.length>255||qe.test(e))throw new V(t,`must be a file name without path, got ${String(e)}`);let r=e.toLowerCase();if(!n.some(e=>r.endsWith(e)))throw new V(t,`must end with ${n.join(` | `)}, got "${e}"`);return e}function at(e,t){if(e===null)return null;if(typeof e!=`object`)throw new V(t,`must be an object or null, got ${String(e)}`);let n=it(e.shx,`${t}.shx`,[`.shx`]),r=it(e.ttf,`${t}.ttf`,[`.ttf`,`.ttc`,`.otf`]),i=it(e.bigFont,`${t}.bigFont`,[`.shx`]);if(n===null&&r===null)throw new V(t,`set "shx" or "ttf" (or use null for no mapping)`);return Object.freeze({shx:n,ttf:r,bigFont:i})}function ot(e,t){if(!Array.isArray(e)||e.length>16)throw new V(t,`must be an array of up to 16 font ids or family names`);let n=new Set,r=[];return e.forEach((e,i)=>{Je(e,`${t}[${i}]`);let a=We(e);n.has(a)||(n.add(a),r.push(e))}),Object.freeze(r)}function st(e,t={},n){if(Je(e),typeof t!=`object`||!t||Array.isArray(t))throw new V(e,`font properties must be an object, got ${String(t)}`);let r=t.family??n?.family??e;Ye(r,`family`);let i=t.generic??n?.generic??`sans-serif`;if(!Ve.includes(i))throw new V(`generic`,`must be one of ${Ve.join(` | `)}, got ${String(i)}`);let a;if(t.faces===void 0)a=n?.faces??Object.freeze([]);else{if(!Array.isArray(t.faces)||t.faces.length>16)throw new V(`faces`,`must be an array of up to 16 items`);a=Object.freeze(t.faces.map((e,t)=>nt(e,`faces[${t}]`)))}let o=t.google===void 0?n?.google??null:rt(t.google,r,`google`),s=t.dxf===void 0?n?.dxf??null:at(t.dxf,`dxf`),c=t.fallbacks===void 0?n?.fallbacks??Object.freeze([]):ot(t.fallbacks,`fallbacks`),l=t.metrics===void 0?n?.metrics??ze(`sans`):ze(t.metrics);return Object.freeze({id:e,family:r,generic:i,faces:a,google:o,dxf:s,fallbacks:c,metrics:l})}function ct(e){return`"${e}"`}function lt(e,t){let n=t.format===null?``:` format("${t.format}")`;return`@font-face{font-family:${ct(e)};src:url("${t.url}")${n};font-weight:${t.weight};font-style:${t.style};font-display:swap}`}function ut(e){return encodeURIComponent(e).replace(/%20/g,`+`)}function dt(e){let t=ut(e.family);return e.italic?`family=${t}:ital,wght@${[0,1].flatMap(t=>e.weights.map(e=>`${t},${e}`)).join(`;`)}`:`family=${t}:wght@${e.weights.join(`;`)}`}function ft(e){return e.length===0?null:`https://fonts.googleapis.com/css2?${e.map(dt).join(`&`)}&display=swap`}var pt=Object.freeze({shx:`txt.shx`,ttf:null,bigFont:null,sourceId:null}),mt=Object.freeze([{id:`sans`,family:`Arial`,generic:`sans-serif`,fallbacks:[`Helvetica`],dxf:{ttf:`arial.ttf`},metrics:`sans`},{id:`serif`,family:`Times New Roman`,generic:`serif`,fallbacks:[`Times`],dxf:{ttf:`times.ttf`},metrics:`serif`},{id:`mono`,family:`Courier New`,generic:`monospace`,fallbacks:[`Courier`],dxf:{ttf:`cour.ttf`},metrics:`mono`}]),ht=class e{fonts=new Map;listeners=new Set;constructor(e=[]){for(let e of mt){let{id:t,...n}=e;this.fonts.set(We(t),st(t,n))}for(let t of e){let{id:e,...n}=t,r=this.fonts.get(We(e));this.fonts.set(We(e),r?st(r.id,n,r):st(e,n))}}get size(){return this.fonts.size}has(e){return this.fonts.has(We(e))}get(e){return this.fonts.get(We(e))}require(e){let t=this.get(e);if(!t)throw new V(e,`font not found`);return t}list(){return[...this.fonts.values()]}ids(){return this.list().map(e=>e.id)}[Symbol.iterator](){return this.fonts.values()}create(e,t={}){if(Je(e),this.has(e))throw new V(e,`font already exists`);let n=st(e,t);return this.fonts.set(We(e),n),this.emit({type:`create`,font:n}),n}update(e,t){let n=this.require(e),r=st(n.id,t,n);return this.fonts.set(We(n.id),r),this.emit({type:`update`,font:r,previous:n}),r}clone(e,t,n={}){let r=this.require(e);if(Je(t,`newId`),this.has(t))throw new V(`newId`,`font "${t}" already exists`);let i=st(t,n,r);return this.fonts.set(We(t),i),this.emit({type:`create`,font:i}),i}delete(e){let t=this.require(e),n=We(t.id);if(n===We(`sans`))throw new V(t.id,`font "${Ue}" is the default font and cannot be deleted`);this.fonts.delete(n),this.emit({type:`delete`,font:t});for(let e of this.list())e.fallbacks.some(e=>We(e)===n)&&this.update(e.id,{fallbacks:e.fallbacks.filter(e=>We(e)!==n)})}get fallbackMap(){let e={};for(let t of this.fonts.values())t.fallbacks.length>0&&(e[t.id]=t.fallbacks);return Object.freeze(e)}setFallbacks(e,t){return this.update(e,{fallbacks:t})}setFallbackMap(e){if(typeof e!=`object`||!e||Array.isArray(e))throw new V(`fallbackMap`,`must be an object { fontId: [fallbacks] }`);let t=Object.entries(e).map(([e,t])=>{let n=this.require(e);return st(n.id,{fallbacks:t},n),[n.id,t]});for(let[e,n]of t)this.update(e,{fallbacks:n})}getFontChain(e){let t=[],n=new Set,r=e=>{let i=We(e.id);if(!n.has(i)){n.add(i),t.push(e);for(let t of e.fallbacks){let e=this.get(t);e&&r(e)}}};return r(this.require(e)),t}getCssFontFamily(e){let t=this.require(e),n=[],r=new Set,i=e=>{let t=e.toLowerCase();r.has(t)||(r.add(t),n.push(ct(e)))},a=(e,t)=>{if(!t.has(We(e.id))){t.add(We(e.id)),i(e.family);for(let n of e.fallbacks){let e=this.get(n);e?a(e,t):i(n)}}};return a(t,new Set),`${n.join(`, `)}, ${t.generic}`}resolveDxfFont(e){for(let t of this.getFontChain(e))if(t.dxf)return Object.freeze({...t.dxf,sourceId:t.id});return pt}getGoogleSources(e){let t=new Map;for(let n of this.select(e)){if(!n.google)continue;let e=n.google.family.toLowerCase(),r=t.get(e);t.set(e,r?Object.freeze({family:r.family,weights:Object.freeze([...new Set([...r.weights,...n.google.weights])].sort((e,t)=>e-t)),italic:r.italic||n.google.italic}):n.google)}return[...t.values()]}getGoogleFontsUrl(e){return ft(this.getGoogleSources(e))}buildFontFaceCss(e){let t=this.select(e),n=[],r=ft(this.getGoogleSources(t.map(e=>e.id)));r!==null&&n.push(`@import url("${r}");`);for(let e of t)for(let t of e.faces)n.push(lt(e.family,t));return n.join(`
`)}onChange(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}toJSON(){return{fonts:this.list().map(e=>({...e,metrics:Le(e.metrics)??e.metrics}))}}static fromJSON(t){if(typeof t!=`object`||!t||Array.isArray(t))throw new V(`fonts`,`must be an object { fonts }`);let{fonts:n}=t;if(!Array.isArray(n))throw new V(`fonts`,`must be an array of font definitions`);return n.forEach((e,t)=>{if(typeof e!=`object`||!e||Array.isArray(e))throw new V(`fonts[${t}]`,`must be an object`)}),new e(n)}select(e){if(e===void 0)return this.list();let t=new Set,n=[];for(let r of e){let e=this.require(r);t.has(We(e.id))||(t.add(We(e.id)),n.push(e))}return n}emit(e){for(let t of[...this.listeners])t(e)}},gt=`Standard`,_t=.1,vt=1e3,yt=.01,bt=-.5,xt=.5,St=Object.freeze({fontFamily:Ue,height:3.5,letterSpacing:0,lineHeight:1.5,obliqueAngle:0,widthFactor:1}),Ct=/[\u0000-\u001f\u007f<>/\\":;?*|=,`]/;function wt(e,t=`name`){if(typeof e!=`string`||e.length===0)throw new V(t,`must be a non-empty string`);if(e.length>255)throw new V(t,`must be at most 255 characters`);if(e!==e.trim())throw new V(t,`must not start or end with whitespace, got "${e}"`);if(Ct.test(e))throw new V(t,`contains forbidden characters (control, < > / \\ " : ; ? * | = , \`): "${e}"`)}function Tt(e){return e.toLowerCase()}function Et(e,t,n,r){if(typeof e!=`number`||!Number.isFinite(e)||e<n||e>r)throw new V(t,`must be a number in range ${n}…${r}, got ${String(e)}`);return e}function Dt(e){return Et(e,`slantFromBaselineDeg`,5,175),90-e}function Ot(e,t={},n=St,r){if(wt(e),typeof t!=`object`||!t||Array.isArray(t))throw new V(e,`style properties must be an object, got ${String(t)}`);let i=t.fontFamily??n.fontFamily;if(Je(i,`fontFamily`),r&&!r.has(i))throw new V(`fontFamily`,`font "${i}" is not registered in FontManager`);return Object.freeze({name:e,fontFamily:i,height:Et(t.height??n.height,`height`,_t,vt),letterSpacing:Et(t.letterSpacing??n.letterSpacing,`letterSpacing`,bt,5),lineHeight:Et(t.lineHeight??n.lineHeight,`lineHeight`,xt,10),obliqueAngle:Et(t.obliqueAngle??n.obliqueAngle,`obliqueAngle`,-85,85),widthFactor:Et(t.widthFactor??n.widthFactor,`widthFactor`,yt,100)})}var kt=class e{fonts;styles=new Map;listeners=new Set;currentKey=Tt(gt);constructor(e,t=[]){this.fonts=e;let n=Tt(gt);this.styles.set(n,Ot(gt,{},void 0,e));for(let r of t){let{name:t,...i}=r;if(Tt(t)===n){let t=this.requireKey(n);this.styles.set(n,Ot(gt,i,t,e))}else this.styles.set(Tt(t),this.assertNew(t,i))}}get size(){return this.styles.size}get current(){return this.requireKey(this.currentKey)}has(e){return this.styles.has(Tt(e))}get(e){return this.styles.get(Tt(e))}require(e){return this.requireKey(Tt(e),e)}list(){return[...this.styles.values()]}names(){return this.list().map(e=>e.name)}[Symbol.iterator](){return this.styles.values()}create(e,t={}){let n=this.assertNew(e,t);return this.styles.set(Tt(e),n),this.emit({type:`create`,style:n}),n}update(e,t){let n=this.require(e),r=Ot(n.name,t,n,this.fonts);return this.styles.set(Tt(n.name),r),this.emit({type:`update`,style:r,previous:n}),r}rename(e,t){let n=this.require(e);wt(t,`newName`);let r=Tt(n.name);if(r===Tt(`Standard`))throw new V(n.name,`style "${gt}" cannot be renamed`);let i=Tt(t);if(i!==r&&this.styles.has(i))throw new V(`newName`,`style "${t}" already exists`);let a=Ot(t,{},n,this.fonts),o=new Map;for(let[e,t]of this.styles)o.set(e===r?i:e,e===r?a:t);this.styles.clear();for(let[e,t]of o)this.styles.set(e,t);return this.currentKey===r&&(this.currentKey=i),this.emit({type:`rename`,style:a,previous:n}),a}clone(e,t,n={}){let r=this.require(e);if(wt(t,`newName`),this.has(t))throw new V(`newName`,`style "${t}" already exists`);let i=Ot(t,n,r,this.fonts);return this.styles.set(Tt(t),i),this.emit({type:`create`,style:i}),i}delete(e){let t=this.require(e),n=Tt(t.name);if(n===Tt(`Standard`))throw new V(t.name,`style "${gt}" cannot be deleted`);if(n===this.currentKey)throw new V(t.name,`the current style cannot be deleted; switch to another style first`);this.styles.delete(n),this.emit({type:`delete`,style:t})}setCurrent(e){let t=this.require(e);return this.currentKey=Tt(t.name),this.emit({type:`current`,style:t}),t}fontsInUse(){let e=new Set,t=[];for(let n of this.styles.values()){let r=We(n.fontFamily);e.has(r)||(e.add(r),t.push(this.fonts.get(n.fontFamily)?.id??n.fontFamily))}return t}missingFonts(){return this.fontsInUse().filter(e=>!this.fonts.has(e))}onChange(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}toJSON(){return{current:this.current.name,styles:this.list()}}static fromJSON(t,n){if(typeof n!=`object`||!n||Array.isArray(n))throw new V(`styles`,`must be an object { current, styles }`);let{current:r,styles:i}=n;if(!Array.isArray(i))throw new V(`styles`,`must be an array of text style definitions`);let a=new e(t,i);if(r!==void 0){if(typeof r!=`string`)throw new V(`current`,`must be a string`);a.setCurrent(r)}return a}requireKey(e,t=e){let n=this.styles.get(e);if(!n)throw new V(t,`text style not found`);return n}assertNew(e,t){if(wt(e),this.styles.has(Tt(e)))throw new V(e,`text style already exists`);return Ot(e,t,void 0,this.fonts)}emit(e){for(let t of[...this.listeners])t(e)}},At=Object.freeze([`top-left`,`top-center`,`top-right`,`middle-left`,`middle-center`,`middle-right`,`bottom-left`,`bottom-center`,`bottom-right`]);function jt(e){return typeof e==`string`&&At.includes(e)}function Mt(e,t){if(typeof e!=`number`||!Number.isFinite(e)||e<=0)throw new V(t,`must be a positive finite number, got ${String(e)}`)}function Nt(e,t){let n=0,r=0,i=Be(t,` `);for(let a of e)n+=a===`	`?i*4:Be(t,a),r+=1;return{advance:n,count:r}}function Pt(e,t,n,r={}){if(typeof e!=`string`)throw new V(`text`,`must be a string, got ${String(e)}`);let i=r.height??t.height;Mt(i,`height`);let a=r.anchor??`bottom-left`;if(!jt(a))throw new V(`anchor`,`must be one of ${At.join(` | `)}, got ${String(a)}`);let o=n.require(t.fontFamily).metrics,s=i/o.capHeight,c=r.includeDescenders===!0?o.descent*s:0,l=t.lineHeight*i,u=e.split(/\r\n|\r|\n/),d=u.map(e=>{let{advance:n,count:r}=Nt(e,o);return(n*s+Math.max(0,r-1)*t.letterSpacing*i)*t.widthFactor}),f=Math.max(0,...d),p=(u.length-1)*l+i+c,[m,h]=a.split(`-`),g=h===`left`?0:h===`center`?.5:1,_=-f*g,v=m===`top`?0:m===`middle`?p/2:p,y=Math.tan(t.obliqueAngle*Math.PI/180),b=-c*y,x=i*y,S=Math.min(b,x),C=Math.max(b,x),w=1/0,T=-1/0,E=u.map((e,t)=>{let n=d[t],r=_+(f-n)*g;return w=Math.min(w,r+S),T=Math.max(T,r+n+C),Object.freeze({text:e,width:n,x:r,baselineY:v-i-t*l})});return Object.freeze({lines:Object.freeze(E),fontHeight:i,width:f,height:p,box:Object.freeze({minX:w,minY:v-p,maxX:T,maxY:v}),anchor:a})}function Ft(e,t,n,r,i={}){let{paperHeight:a,...o}=i,s=a??t.height;return Mt(s,`paperHeight`),Pt(e,t,n,{...o,height:r.annotationToModel(s)})}function It(e,t={}){let n=t.position??[0,0],r=t.rotationDeg??0,i=t.padding??0;if(n.length!==2||!n.every(e=>Number.isFinite(e)))throw new V(`position`,`must be a finite [x, y] point`);if(!Number.isFinite(r))throw new V(`rotationDeg`,`must be a finite number, got ${String(r)}`);if(!Number.isFinite(i)||i<0)throw new V(`padding`,`must be a number >= 0, got ${String(i)}`);let{minX:a,minY:o,maxX:s,maxY:c}=e.box,l=[[a-i,o-i],[s+i,o-i],[s+i,c+i],[a-i,c+i]],u=r*Math.PI/180,d=Math.cos(u),f=Math.sin(u),p=l.map(([e,t])=>[n[0]+e*d-t*f,n[1]+e*f+t*d]),m=p.map(e=>e[0]),h=p.map(e=>e[1]),g={minX:Math.min(...m),minY:Math.min(...h),maxX:Math.max(...m),maxY:Math.max(...h)};return Object.freeze({corners:Object.freeze(p.map(e=>Object.freeze(e))),bounds:Object.freeze(g),center:Object.freeze([(g.minX+g.maxX)/2,(g.minY+g.maxY)/2]),position:Object.freeze([n[0],n[1]]),rotationDeg:r})}function Lt(e,t,n=e.position){if(!Number.isFinite(t))throw new V(`axisAngleDeg`,`must be a finite number, got ${String(t)}`);let r=t*Math.PI/180,i=Math.cos(r),a=Math.sin(r),o=e.corners.map(e=>(e[0]-n[0])*i+(e[1]-n[1])*a),s=Math.min(...o),c=Math.max(...o);return Object.freeze({start:s,end:c,length:c-s})}var Rt=`gost-b`,zt=`GOST`,Bt=Object.freeze({id:Rt,family:`GOST type B`,generic:`sans-serif`,fallbacks:Object.freeze([`ISOCPEUR`,`osifont`,`Arial Narrow`]),dxf:Object.freeze({ttf:`isocpeur.ttf`}),metrics:`gost-b`}),Vt=Object.freeze({fontFamily:Rt,height:3.5,letterSpacing:0,lineHeight:1.7,obliqueAngle:Dt(75),widthFactor:1});function Ht(e,t){if(!e.has(`gost-b`)){let{id:t,...n}=Bt;e.create(t,n)}return t?t.get(`GOST`)??t.create(`GOST`,Vt):null}var H=class extends e{constructor(e,t){super(e,t),this.name=`CadDimStyleError`}},Ut=Object.freeze([`arrow-closed`,`arrow-open`,`tick`,`dot`,`circle`,`none`]);function Wt(e){return typeof e==`string`&&Ut.includes(e)}function Gt(e,t=`terminatorType`){if(e===`oblique`)return`tick`;if(!Wt(e))throw new H(t,`must be one of ${Ut.join(` | `)} (or "oblique" as an alias of "tick"), got ${String(e)}`);return e}var Kt=(e,t)=>Object.freeze([e,t]);function qt(e,t,n={}){if(!Wt(e))throw new H(`type`,`must be one of ${Ut.join(` | `)}, got ${String(e)}`);if(typeof t!=`number`||!Number.isFinite(t)||t<=0)throw new H(`size`,`must be a positive finite number, got ${String(t)}`);let r=n.arrowAngle??20;if(typeof r!=`number`||!Number.isFinite(r)||r<=0||r>=180)throw new H(`arrowAngle`,`must be a number in range 0…180 (exclusive), got ${String(r)}`);let i=[],a=0,o=0;switch(e){case`arrow-closed`:case`arrow-open`:{let n=t*Math.tan(r*Math.PI/360),o=Kt(0,0),s=Kt(-t,n),c=Kt(-t,-n);i=[e===`arrow-closed`?{kind:`polygon`,points:Object.freeze([o,s,c])}:{kind:`polyline`,points:Object.freeze([s,o,c])}],a=t;break}case`tick`:{let e=t/(2*Math.SQRT2);i=[{kind:`line`,from:Kt(-e,-e),to:Kt(e,e)}];break}case`dot`:i=[{kind:`circle`,center:Kt(0,0),radius:t/2,fill:!0}],a=t/2;break;case`circle`:i=[{kind:`circle`,center:Kt(0,0),radius:t/2,fill:!1}],a=t/2,o=t/2}return Object.freeze({type:e,shapes:Object.freeze(i.map(e=>Object.freeze(e))),extent:a,lineTrim:o})}var Jt=Object.freeze([`above`,`centered`,`outside`]),Yt=Object.freeze([`aligned`,`horizontal`]),Xt=Object.freeze([`.`,`,`]),Zt=`Standard`,Qt=.1,$t=.1,en=Object.freeze({terminatorType:`arrow-closed`,terminatorSize:3,arrowAngle:20,dimLineOvershoot:0,baselineSpacing:7,extensionOffset:0,extensionOvershoot:2,hideFirstExtensionLine:!1,hideSecondExtensionLine:!1,textStyle:`Standard`,textPosition:`above`,textOrientation:`aligned`,textGap:1,prefix:``,suffix:``,radiusPrefix:`R`,diameterPrefix:`Ø`,angleSuffix:`°`,decimals:0,angleDecimals:1,decimalSeparator:`.`,trimTrailingZeros:!0,lineColor:null,lineWeight:null,textColor:null}),tn=new Set(Object.keys(en)),nn=/[\u0000-\u001f\u007f<>/\\":;?*|=,`]/,rn=/[\u0000-\u001f\u007f]/;function an(e,t=`name`){if(typeof e!=`string`||e.length===0)throw new H(t,`must be a non-empty string`);if(e.length>255)throw new H(t,`must be at most 255 characters`);if(e!==e.trim())throw new H(t,`must not start or end with whitespace, got "${e}"`);if(nn.test(e))throw new H(t,`contains forbidden characters (control, < > / \\ " : ; ? * | = , \`): "${e}"`)}function on(e){return e.toLowerCase()}function sn(e,t,n,r){if(typeof e!=`number`||!Number.isFinite(e)||e<n||e>r)throw new H(t,`must be a number in range ${n}…${r}, got ${String(e)}`);return e}function cn(e,t,n,r){if(typeof e!=`number`||!Number.isInteger(e)||e<n||e>r)throw new H(t,`must be an integer in range ${n}…${r}, got ${String(e)}`);return e}function ln(e,t,n){if(typeof e!=`string`||!n.includes(e))throw new H(t,`must be one of ${n.join(` | `)}, got ${String(e)}`);return e}function un(e,t){if(typeof e!=`boolean`)throw new H(t,`must be a boolean, got ${String(e)}`);return e}function dn(e,t){if(typeof e!=`string`)throw new H(t,`must be a string, got ${String(e)}`);if(e.length>32)throw new H(t,`must be at most 32 characters`);if(rn.test(e))throw new H(t,`must not contain control characters`);return e}function fn(t,n){if(t===null)return null;try{return T(t,n)}catch(r){throw r instanceof e?new H(n,`must be null or a hex color like "#rrggbb", got ${String(t)}`):r}}function pn(e){return an(e,`textStyle`),e}function mn(e,t={},n=en){if(an(e),typeof t!=`object`||!t||Array.isArray(t))throw new H(e,`style properties must be an object, got ${String(t)}`);for(let e of Object.keys(t))if(!tn.has(e))throw new H(e,`unknown dimension style property`);let r=e=>t[e]===void 0?n[e]:t[e],i=r(`lineWeight`);return Object.freeze({name:e,terminatorType:Gt(r(`terminatorType`)),terminatorSize:sn(r(`terminatorSize`),`terminatorSize`,Qt,50),arrowAngle:sn(r(`arrowAngle`),`arrowAngle`,5,90),dimLineOvershoot:sn(r(`dimLineOvershoot`),`dimLineOvershoot`,0,20),baselineSpacing:sn(r(`baselineSpacing`),`baselineSpacing`,$t,200),extensionOffset:sn(r(`extensionOffset`),`extensionOffset`,0,50),extensionOvershoot:sn(r(`extensionOvershoot`),`extensionOvershoot`,0,50),hideFirstExtensionLine:un(r(`hideFirstExtensionLine`),`hideFirstExtensionLine`),hideSecondExtensionLine:un(r(`hideSecondExtensionLine`),`hideSecondExtensionLine`),textStyle:pn(r(`textStyle`)),textPosition:ln(r(`textPosition`),`textPosition`,Jt),textOrientation:ln(r(`textOrientation`),`textOrientation`,Yt),textGap:sn(r(`textGap`),`textGap`,0,20),prefix:dn(r(`prefix`),`prefix`),suffix:dn(r(`suffix`),`suffix`),radiusPrefix:dn(r(`radiusPrefix`),`radiusPrefix`),diameterPrefix:dn(r(`diameterPrefix`),`diameterPrefix`),angleSuffix:dn(r(`angleSuffix`),`angleSuffix`),decimals:cn(r(`decimals`),`decimals`,0,8),angleDecimals:cn(r(`angleDecimals`),`angleDecimals`,0,8),decimalSeparator:ln(r(`decimalSeparator`),`decimalSeparator`,Xt),trimTrailingZeros:un(r(`trimTrailingZeros`),`trimTrailingZeros`),lineColor:fn(r(`lineColor`),`lineColor`),lineWeight:i===null?null:sn(i,`lineWeight`,0,10),textColor:fn(r(`textColor`),`textColor`)})}var hn=class e{textStyles;styles=new Map;listeners=new Set;currentKey=on(Zt);constructor(e,t=[]){this.textStyles=e;let n=on(Zt);this.styles.set(n,this.finalize(mn(Zt)));for(let e of t){if(typeof e!=`object`||!e||Array.isArray(e))throw new H(`styles`,`each style must be an object with a name, got ${String(e)}`);let{name:t,...r}=e;if(on(t)===n){let e=this.requireKey(n);this.styles.set(n,this.finalize(mn(Zt,r,e)))}else this.styles.set(on(t),this.assertNew(t,r))}}get size(){return this.styles.size}get current(){return this.requireKey(this.currentKey)}has(e){return this.styles.has(on(e))}get(e){return this.styles.get(on(e))}require(e){return this.requireKey(on(e),e)}list(){return[...this.styles.values()]}names(){return this.list().map(e=>e.name)}[Symbol.iterator](){return this.styles.values()}resolveTextStyle(e){let t=typeof e==`string`?this.require(e):e,n=this.textStyles.get(t.textStyle);if(!n)throw new H(t.name,`text style "${t.textStyle}" is not registered in TextStyleTable`);return n}create(e,t={}){let n=this.assertNew(e,t);return this.styles.set(on(e),n),this.emit({type:`create`,style:n}),n}update(e,t){let n=this.require(e),r=this.finalize(mn(n.name,t,n));return this.styles.set(on(n.name),r),this.emit({type:`update`,style:r,previous:n}),r}rename(e,t){let n=this.require(e);an(t,`newName`);let r=on(n.name);if(r===on(`Standard`))throw new H(n.name,`style "${Zt}" cannot be renamed`);let i=on(t);if(i!==r&&this.styles.has(i))throw new H(`newName`,`style "${t}" already exists`);let a=mn(t,{},n),o=new Map;for(let[e,t]of this.styles)o.set(e===r?i:e,e===r?a:t);this.styles.clear();for(let[e,t]of o)this.styles.set(e,t);return this.currentKey===r&&(this.currentKey=i),this.emit({type:`rename`,style:a,previous:n}),a}clone(e,t,n={}){let r=this.require(e);if(an(t,`newName`),this.has(t))throw new H(`newName`,`style "${t}" already exists`);let i=this.finalize(mn(t,n,r));return this.styles.set(on(t),i),this.emit({type:`create`,style:i}),i}delete(e){let t=this.require(e),n=on(t.name);if(n===on(`Standard`))throw new H(t.name,`style "${Zt}" cannot be deleted`);if(n===this.currentKey)throw new H(t.name,`the current style cannot be deleted; switch to another style first`);this.styles.delete(n),this.emit({type:`delete`,style:t})}setCurrent(e){let t=this.require(e);return this.currentKey=on(t.name),this.emit({type:`current`,style:t}),t}textStylesInUse(){let e=new Set,t=[];for(let n of this.styles.values()){let r=n.textStyle.toLowerCase();e.has(r)||(e.add(r),t.push(n.textStyle))}return t}missingTextStyles(){return this.textStylesInUse().filter(e=>!this.textStyles.has(e))}onChange(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}toJSON(){return{current:this.current.name,styles:this.list()}}static fromJSON(t,n){if(typeof n!=`object`||!n||Array.isArray(n))throw new H(`dimStyles`,`must be an object { current, styles }`);let{current:r,styles:i}=n;if(!Array.isArray(i))throw new H(`styles`,`must be an array of dimension style definitions`);let a=new e(t,i);if(r!==void 0){if(typeof r!=`string`)throw new H(`current`,`must be a string`);a.setCurrent(r)}return a}requireKey(e,t=e){let n=this.styles.get(e);if(!n)throw new H(t,`dimension style not found`);return n}assertNew(e,t){if(an(e),this.styles.has(on(e)))throw new H(e,`dimension style already exists`);return this.finalize(mn(e,t))}finalize(e){let t=this.textStyles.get(e.textStyle);if(!t)throw new H(`textStyle`,`text style "${e.textStyle}" is not registered in TextStyleTable`);return t.name===e.textStyle?e:mn(e.name,{textStyle:t.name},e)}emit(e){for(let t of[...this.listeners])t(e)}};function gn(e,t){if(typeof e!=`number`||!Number.isFinite(e))throw new H(`value`,`must be a finite number, got ${String(e)}`);let{decimals:n,separator:r=`.`,trimTrailingZeros:i=!1}=t;if(!Number.isInteger(n)||n<0||n>8)throw new H(`decimals`,`must be an integer in range 0…8, got ${String(n)}`);let a=l(e,n).toFixed(n);return i&&a.includes(`.`)&&(a=a.replace(/\.?0+$/,``)),r===`,`?a.replace(`.`,`,`):a}function _n(e,t,n=`linear`){let r=gn(e,{decimals:n===`angular`?t.angleDecimals:t.decimals,separator:t.decimalSeparator,trimTrailingZeros:t.trimTrailingZeros});switch(n){case`linear`:return`${t.prefix}${r}${t.suffix}`;case`radius`:return`${t.radiusPrefix}${r}${t.suffix}`;case`diameter`:return`${t.diameterPrefix}${r}${t.suffix}`;case`angular`:return`${r}${t.angleSuffix}`;default:throw new H(`kind`,`must be one of linear | radius | diameter | angular, got ${String(n)}`)}}function vn(e,t){let n=e=>t.annotationToModel(e),r=n(e.terminatorSize),i=n(e.dimLineOvershoot);return Object.freeze({terminatorSize:r,dimLineOvershoot:i,baselineSpacing:n(e.baselineSpacing),extensionOffset:n(e.extensionOffset),extensionOvershoot:n(e.extensionOvershoot),textGap:n(e.textGap),effectiveDimLineOvershoot:e.terminatorType===`tick`?i:0,terminator:qt(e.terminatorType,r,{arrowAngle:e.arrowAngle})})}var yn=1e-9;function bn(e){let t=(e%360+360)%360;return t>=359.999999999?0:t}function xn(e,t,n,r,i){if(typeof e!=`string`)throw new H(`text`,`must be a string, got ${String(e)}`);let a=i.lineAngleDeg;if(typeof a!=`number`||!Number.isFinite(a))throw new H(`lineAngleDeg`,`must be a finite number, got ${String(a)}`);let o=n.get(t.textStyle);if(!o)throw new H(t.name,`text style "${t.textStyle}" is not registered in TextStyleTable`);let s=r.annotationToModel(t.textGap),c=i.paperHeight===void 0?{}:{paperHeight:i.paperHeight},l=t=>Ft(e,o,n.fonts,r,{anchor:t,...c}),u=bn(a),d=t.textOrientation===`aligned`,f=d&&u>90.000000001&&u<=270.000000001,p=d?f?u-180:u>270.000000001?u-360:u:0,m=a*Math.PI/180,h={x:Math.cos(m),y:Math.sin(m)},g={x:-h.y,y:h.x},_,v=0,y={from:`middle`,offset:0},b,x,S=null;switch(t.textPosition){case`above`:if(d)_=`bottom-center`,b=l(_),x=It(b,{rotationDeg:p}),v=f?-s:s;else{let e=g.y>yn||Math.abs(g.y)<=yn&&g.x<0?1:-1;_=`middle-center`,b=l(_),x=It(b,{rotationDeg:0});let t=Lt(x,a+90,[0,0]);v=e===1?s-t.start:-s-t.end}break;case`centered`:_=`middle-center`,b=l(_),x=It(b,{rotationDeg:p}),S=Lt(It(b,{rotationDeg:p,padding:s}),a,[0,0]);break;case`outside`:y={from:`end`,offset:s},_=d?f?`middle-right`:`middle-left`:h.x>yn?`middle-left`:h.x<-1e-9?`middle-right`:h.y>0?`bottom-center`:`top-center`,b=l(_),x=It(b,{rotationDeg:p});break;default:throw new H(`textPosition`,`must be one of above | centered | outside, got ${String(t.textPosition)}`)}return Object.freeze({text:e,position:t.textPosition,orientation:t.textOrientation,rotationDeg:p,flipped:f,anchor:_,across:v,along:Object.freeze(y),gap:s,layout:b,placed:x,lineBreak:S===null?null:Object.freeze(S)})}var Sn=Object.freeze({terminatorType:`arrow-closed`,terminatorSize:3.5,arrowAngle:20,dimLineOvershoot:0,baselineSpacing:7,extensionOffset:0,extensionOvershoot:2,textStyle:zt,textPosition:`above`,textOrientation:`aligned`,textGap:1,decimals:0,angleDecimals:1,decimalSeparator:`,`,trimTrailingZeros:!0});function Cn(e){return Ht(e.textStyles.fonts,e.textStyles),e.get(`GOST`)??e.create(`GOST`,Sn)}var wn=class extends e{constructor(e,t){super(e,t),this.name=`CadGeometryError`}},Tn=Math.PI/180;function En(e){return e===0?0:e}function Dn(e,t){return Object.freeze([En(e),En(t)])}function On(e){return typeof e==`number`&&Number.isFinite(e)}function kn(e){return Array.isArray(e)&&e.length===2&&On(e[0])&&On(e[1])}var An=(e,t)=>[e[0]+t[0],e[1]+t[1]],jn=(e,t)=>[e[0]-t[0],e[1]-t[1]],Mn=(e,t)=>[e[0]*t,e[1]*t],Nn=(e,t)=>e[0]*t[0]+e[1]*t[1],Pn=e=>Math.hypot(e[0],e[1]),Fn=(e,t)=>Math.hypot(t[0]-e[0],t[1]-e[1]),In=e=>[-e[1],e[0]];function Ln(e){let t=Pn(e);if(t<=1e-9)throw new wn(`vector`,`cannot normalize a zero-length vector`);return[e[0]/t,e[1]/t]}function Rn(e){let t=(e%360+360)%360;return t===0?[1,0]:t===90?[0,1]:t===180?[-1,0]:t===270?[0,-1]:[Math.cos(t*Tn),Math.sin(t*Tn)]}function zn(e){return En(Math.atan2(e[1],e[0])/Tn)}var Bn=Object.freeze([1,0,0,1,0,0]);function Vn(e,t){return[1,0,0,1,e,t]}function Hn(e){let[t,n]=Rn(e);return[t,n,-n,t,0,0]}function Un(e,t=e){return[e,0,0,t,0,0]}function Wn(e,t){let[n,r,i,a,o,s]=e,[c,l,u,d,f,p]=t;return[n*c+i*l,r*c+a*l,n*u+i*d,r*u+a*d,n*f+i*p+o,r*f+a*p+s]}function Gn(...e){return e.reduce((e,t)=>Wn(e,t),Bn)}function Kn(e,t){return[En(e[0]*t[0]+e[2]*t[1]+e[4]),En(e[1]*t[0]+e[3]*t[1]+e[5])]}function qn(e,t){return[e[0]*t[0]+e[2]*t[1],e[1]*t[0]+e[3]*t[1]]}function Jn(e){return e[0]*e[3]-e[1]*e[2]}function Yn(e,t=1e-12){return e.every((e,n)=>Math.abs(e-Bn[n])<=t)}function Xn(e,t=1e-9){let[n,r,i,a]=e,o=Math.hypot(n,r),s=Math.hypot(i,a),c=n*i+r*a;return Math.abs(o-s)<=t*Math.max(1,o)&&Math.abs(c)<=t*Math.max(1,o*s)}function Zn(e){return Math.sqrt(Math.abs(Jn(e)))}var Qn=Object.freeze({minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0});function $n(e){return!(e.minX<=e.maxX&&e.minY<=e.maxY)}var er=class{minX=1/0;minY=1/0;maxX=-1/0;maxY=-1/0;addPoint(e){return e[0]<this.minX&&(this.minX=e[0]),e[0]>this.maxX&&(this.maxX=e[0]),e[1]<this.minY&&(this.minY=e[1]),e[1]>this.maxY&&(this.maxY=e[1]),this}addBounds(e){return $n(e)?this:(this.addPoint([e.minX,e.minY]),this.addPoint([e.maxX,e.maxY]))}get empty(){return $n(this)}build(){return this.empty?Qn:Object.freeze({minX:this.minX,minY:this.minY,maxX:this.maxX,maxY:this.maxY})}};function tr(e){return[(e.minX+e.maxX)/2,(e.minY+e.maxY)/2]}function nr(e,t){if($n(e))return e;let n=typeof t==`number`?{top:t,right:t,bottom:t,left:t}:t;return Object.freeze({minX:e.minX-n.left,minY:e.minY-n.bottom,maxX:e.maxX+n.right,maxY:e.maxY+n.top})}function rr(e){return[[e.minX,e.minY],[e.maxX,e.minY],[e.maxX,e.maxY],[e.minX,e.maxY]]}var ir=Math.PI*2;function ar(e,t){let n=Math.cos(t),r=Math.sin(t);return[e.center[0]+e.u[0]*n+e.v[0]*r,e.center[1]+e.u[1]*n+e.v[1]*r]}function or(e,t,n){if(Math.abs(n)>=ir-1e-12)return!0;let r=n>=0?e-t:t-e;return r=(r%ir+ir)%ir,r<=Math.abs(n)+1e-12}function sr(e,t=new er){Math.abs(e.sweep)>=ir-1e-12||(t.addPoint(ar(e,e.t0)),t.addPoint(ar(e,e.t0+e.sweep)));let n=[Math.atan2(e.v[0],e.u[0]),Math.atan2(e.v[1],e.u[1])];for(let r of n)for(let n of[r,r+Math.PI])or(n,e.t0,e.sweep)&&t.addPoint(ar(e,n));return t}function cr(e,t){let n=e.map(e=>[e[0],e[1]]);for(;n.length>1;){let e=[];for(let r=0;r<n.length-1;r++){let i=n[r],a=n[r+1];e.push([i[0]+(a[0]-i[0])*t,i[1]+(a[1]-i[1])*t])}n=e}let r=n[0];return[r[0],r[1]]}function lr(e){let t=[],n=e=>{e>1e-12&&e<1-1e-12&&t.push(e)};if(e.length===3){let[t,r,i]=e,a=t-2*r+i;Math.abs(a)>1e-15&&n((t-r)/a)}else if(e.length===4){let[t,r,i,a]=e,o=-t+3*r-3*i+a,s=2*(t-2*r+i),c=r-t;if(Math.abs(o)<1e-15)Math.abs(s)>1e-15&&n(-c/s);else{let e=s*s-4*o*c;if(e>=0){let t=Math.sqrt(e);n((-s+t)/(2*o)),n((-s-t)/(2*o))}}}return t}function ur(e,t=new er){if(e.length<2||e.length>4)throw new wn(`bezier`,`supports degree 1…3 (2…4 points), got ${e.length} points`);t.addPoint(e[0]),t.addPoint(e[e.length-1]);for(let n of[0,1])for(let r of lr(e.map(e=>e[n])))t.addPoint(cr(e,r));return t}function dr(e,t){let n=e;if(n<t+1)throw new wn(`spline`,`needs at least ${t+1} control points for degree ${t}, got ${n}`);let r=n-t,i=[];for(let e=0;e<=t;e++)i.push(0);for(let e=1;e<r;e++)i.push(e/r);for(let e=0;e<=t;e++)i.push(1);return i}function fr(e,t,n,r=`knots`){if(e.length!==t+n+1)throw new wn(r,`must have controlPoints + degree + 1 = ${t+n+1} values, got ${e.length}`);for(let t=0;t<e.length;t++){let n=e[t];if(!Number.isFinite(n))throw new wn(`${r}[${t}]`,`must be a finite number`);if(t>0&&n<e[t-1])throw new wn(r,`must be non-decreasing`)}if(e[t]<=e[n])throw new wn(r,`the curve domain [knots[degree], knots[n]] is empty`)}function pr(e,t,n,r){let i=e;for(;i<t.length-e-2&&t[i+1]<=r;)i++;let a=[];for(let t=0;t<=i-e;t++)a.push(n[t]);for(let o=i-e+1;o<=i;o++){let i=t[o],s=t[o+e]-i,c=s===0?0:(r-i)/s,l=n[o-1],u=n[o];a.push([(1-c)*l[0]+c*u[0],(1-c)*l[1]+c*u[1]])}for(let e=i;e<n.length;e++)a.push(n[e]);return{knots:[...t.slice(0,i+1),r,...t.slice(i+1)],pts:a}}function mr(e,t,n){if(!Number.isInteger(e)||e<1||e>3)throw new wn(`spline.degree`,`must be 1, 2 or 3, got ${String(e)}`);fr(n,t.length,e);let r=[...n],i=t.map(e=>[e[0],e[1]]),a=r[e],o=r[t.length],s=[...new Set(r.filter(e=>e>=a&&e<=o))].sort((e,t)=>e-t);for(let t of s){let n=r.filter(e=>e===t).length;for(;n<e;)({knots:r,pts:i}=pr(e,r,i,t)),n++}let c=[];for(let t=e;t<r.length-e-1;t++){let n=r[t],s=r[t+1];s<=n||n<a||s>o||c.push(i.slice(t-e,t+1))}return c}function hr(e,t,n,r){let i=t.length,a=n[e],o=n[i],s=Math.min(Math.max(r,a),o),c=e;for(;c<i-1&&n[c+1]<=s;)c++;let l=[];for(let n=0;n<=e;n++){let r=t[n+c-e];l.push([r[0],r[1]])}for(let t=1;t<=e;t++)for(let r=e;r>=t;r--){let i=r+c-e,a=n[i],o=n[i+e-t+1]-a,u=o===0?0:(s-a)/o,d=l[r],f=l[r-1];l[r]=[(1-u)*f[0]+u*d[0],(1-u)*f[1]+u*d[1]]}let u=l[e];return[u[0],u[1]]}function gr(e){let t=0;for(let n=0;n<e.length;n++){let r=e[n],i=e[(n+1)%e.length];t+=r[0]*i[1]-i[0]*r[1]}return t/2}function _r(e,t){let n=!1;for(let r=0,i=t.length-1;r<t.length;i=r++){let a=t[r],o=t[i];if(a[1]>e[1]!=o[1]>e[1]){let t=(o[0]-a[0])*(e[1]-a[1])/(o[1]-a[1])+a[0];e[0]<t&&(n=!n)}}return n}function vr(e){let t=e.length,n=0,r=0;for(let t of e)n+=t[0],r+=t[1];let i=[n/t,r/t];if(_r(i,e))return i;let a=gr(e);for(let n=0;n<t;n++){let r=e[n],i=e[(n+1)%t],o=Math.hypot(i[0]-r[0],i[1]-r[1]);if(o===0)continue;let s=-(i[1]-r[1])/o*Math.sign(a||1),c=(i[0]-r[0])/o*Math.sign(a||1),l=o*1e-4,u=[(r[0]+i[0])/2+s*l,(r[1]+i[1])/2+c*l];if(_r(u,e))return u}return i}function yr(e){let t=e.map(e=>Math.abs(gr(e))),n=e.map(e=>vr(e)),r=e.map(()=>-1);for(let i=0;i<e.length;i++){let a=-1;for(let r=0;r<e.length;r++)i===r||t[r]<=t[i]||_r(n[i],e[r])&&(a===-1||t[r]<t[a])&&(a=r);r[i]=a}let i=e=>{let t=0,n=r[e];for(;n!==-1;)t++,n=r[n];return t},a=new Map,o=[];return e.forEach((e,t)=>{if(i(t)%2==0){let e=[];a.set(t,e),o.push({outer:t,holes:e})}}),e.forEach((e,t)=>{i(t)%2==1&&a.get(r[t])?.push(t)}),o}var U=class extends e{constructor(e,t){super(e,t),this.name=`CadPathError`}},br=1e-9,xr=Math.PI*2,Sr=180/Math.PI;function Cr(e,t){return Math.hypot(t[0]-e[0],t[1]-e[1])}function wr(e,t){return Cr(e,t)<=br}function Tr(e){return e===0?0:e}function Er(e,t){return Math.abs(e)<1e-12*Math.max(1,t)?0:e}function Dr(e){return Tr(Number((e*Sr%360+360).toFixed(10))%360)}function Or(e,t){return Object.freeze([Tr(e),Tr(t)])}function kr(e){let t=(e%360+360)%360;if(t===0)return[1,0];if(t===90)return[0,1];if(t===180)return[-1,0];if(t===270)return[0,-1];let n=t*Math.PI/180;return[Math.cos(n),Math.sin(n)]}function Ar(e){let t=e%xr;return t<0?t+xr:t}function jr(e,t,n){let r=Cr(e,t);if(r<=1e-9)throw new U(`arc`,`start and end points coincide: an arc needs a non-zero chord`);let i=n>0,a=4*Math.atan(Math.abs(n)),o=r/(2*Math.sin(a/2)),s=Er(o*Math.cos(a/2),o),c=(e[0]+t[0])/2,l=(e[1]+t[1])/2,u=-(t[1]-e[1])/r,d=(t[0]-e[0])/r,f=i?s:-s,p=Or(Er(c+u*f,o+Math.abs(c)),Er(l+d*f,o+Math.abs(l))),m=Math.atan2(e[1]-p[1],e[0]-p[0]),h=Math.atan2(t[1]-p[1],t[0]-p[0]);return Object.freeze({type:`arc`,from:e,to:t,center:p,radius:o,startAngleDeg:Dr(m),endAngleDeg:Dr(h),counterclockwise:i,sweepDeg:a*Sr,bulge:n,length:o*a})}function Mr(e,t){let n=Math.tan(e/4);return Math.abs(n-1)<1e-14&&(n=1),t?n:-n}function Nr(e,t,n,r,i){if(!Number.isFinite(n)||n<=0)throw new U(`arc.radius`,`must be a positive number, got ${String(n)}`);let a=Cr(e,t);if(a<=1e-9)throw new U(`arc`,`start and end points coincide: an arc needs a non-zero chord`);let o=a/(2*n);if(o>1+1e-9)throw new U(`arc.radius`,`${n} is too small for a chord of ${a} (needs at least ${a/2})`);let s=Math.asin(Math.min(1,o));return Mr(i?xr-2*s:2*s,r)}function Pr(e,t,n,r){let i=Cr(n,e),a=Cr(n,t);if(i<=1e-9)throw new U(`arc.center`,`coincides with the start point`);if(Math.abs(i-a)>1e-6*Math.max(1,i))throw new U(`arc.center`,`is not equidistant from the start (${i}) and the end (${a})`);if(Cr(e,t)<=1e-9)throw new U(`arc`,`start and end points coincide: a full circle cannot be built with arcTo`);let o=Math.atan2(e[1]-n[1],e[0]-n[0]),s=Math.atan2(t[1]-n[1],t[0]-n[0]);return Mr(Ar(r?s-o:o-s),r)}function Fr(e,t,n){let r=(t[0]-e[0])*(n[1]-t[1])-(t[1]-e[1])*(n[0]-t[0]),i=Math.max(1,Cr(e,t),Cr(t,n));if(Math.abs(r)<=1e-12*i*i)throw new U(`arc.through`,`the three points are collinear: no circle passes through them`);if(wr(e,n))throw new U(`arc`,`start and end points coincide: a full circle cannot be built with arcTo`);let a=r>0,[o,s]=e,[c,l]=t,[u,d]=n,f=2*(o*(l-d)+c*(d-s)+u*(s-l)),p=((o*o+s*s)*(l-d)+(c*c+l*l)*(d-s)+(u*u+d*d)*(s-l))/f,m=((o*o+s*s)*(u-c)+(c*c+l*l)*(o-u)+(u*u+d*d)*(c-o))/f,h=Math.atan2(s-m,o-p),g=Math.atan2(d-m,u-p);return Mr(Ar(a?g-h:h-g),a)}function Ir(e,t,n){let r=t[0]-e[0],i=t[1]-e[1];if(Math.hypot(r,i)<=1e-9)throw new U(`arc`,`start and end points coincide: an arc needs a non-zero chord`);let a=n[0]*i-n[1]*r,o=n[0]*r+n[1]*i;if(Math.abs(a)<=1e-9*Math.hypot(r,i))throw new U(`arc.tangent`,o>0?`the end point lies on the tangent line: use lineTo`:`the end point lies behind the tangent line: no tangent arc exists`);return Math.tan(Math.atan2(a,o)/2)}function Lr(e){let t=Math.atan2(e.to[1]-e.center[1],e.to[0]-e.center[0]);return e.counterclockwise?Or(-Math.sin(t),Math.cos(t)):Or(Math.sin(t),-Math.cos(t))}function Rr(e,t,n,r,i){let a=Cr(t,e),o=Cr(t,n);if(a<=1e-9||o<=1e-9)throw new U(i,`a segment next to the corner has zero length`);let s=[(e[0]-t[0])/a,(e[1]-t[1])/a],c=[(n[0]-t[0])/o,(n[1]-t[1])/o],l=s[0]*c[0]+s[1]*c[1],u=s[0]*c[1]-s[1]*c[0],d=Math.abs(u);if(d<=1e-9)throw new U(i,l>0?`the segments fold back onto each other (180° turn): there is no corner to round`:`the segments are collinear: there is no corner to round`);let f,p,m=0;if(r.kind===`fillet`){let e=r.radius;if(!Number.isFinite(e)||e<=0)throw new U(`${i}.radius`,`must be a positive number, got ${String(e)}`);let t=e*(1+l)/d;f=t,p=t,m=Mr(Math.PI-Math.acos(Math.max(-1,Math.min(1,l))),-u>0)}else{let{d1:e,d2:t}=r;for(let[n,r]of[[`d1`,e],[`d2`,t]])if(!Number.isFinite(r)||r<=0)throw new U(`${i}.${n}`,`must be a positive number, got ${String(r)}`);f=e,p=t}let h=e=>1e-9*Math.max(1,e);if(f>a+h(a)||p>o+h(o))throw new U(i,`${r.kind===`fillet`?`radius ${r.radius}`:`distances ${r.d1} / ${r.d2}`} does not fit: it needs ${f} on the previous and ${p} on the next segment, but they are ${a} and ${o} long`);return{trimPrev:f,trimNext:p,from:Or(t[0]+s[0]*f,t[1]+s[1]*f),to:Or(t[0]+c[0]*p,t[1]+c[1]*p),bulge:m}}function zr(e,t){if(typeof e!=`number`||!Number.isFinite(e))throw new U(t,`must be a finite number, got ${String(e)}`)}function Br(e,t){if(!Array.isArray(e)||e.length!==2)throw new U(t,`must be a point [x, y]`);zr(e[0],`${t}[0]`),zr(e[1],`${t}[1]`)}var Vr=[`bulge`,`radius`,`center`,`through`,`tangent`],Hr={bulge:[`bulge`],radius:[`radius`,`sweep`,`large`],center:[`center`,`sweep`],through:[`through`],tangent:[`tangent`]},Ur=class e{startPoint=Or(0,0);segs=[];closedFlag=!1;corners=new Map;ySign;system;constructor(e={}){let t=e.coordinateSystem??`cartesian`;if(t!==`cartesian`&&t!==`screen`)throw new U(`coordinateSystem`,`must be "cartesian" or "screen", got ${String(t)}`);this.system=t,this.ySign=t===`cartesian`?1:-1}static start(t=0,n=0,r={}){return new e(r).moveTo(t,n)}static fromVertices(t,n=!1,r={}){if(!Array.isArray(t)||t.length<2)throw new U(`vertices`,`at least two vertices are required`);let i=new e(r);t.forEach((e,t)=>{zr(e[0],`vertices[${t}][0]`),zr(e[1],`vertices[${t}][1]`),e[2]!==void 0&&zr(e[2],`vertices[${t}][2]`)});let a=t[0];i.moveTo(a[0],a[1]);let o=t.length-1;for(let e=0;e<o;e++){let n=t[e+1];i.addSegment(n[0],n[1],t[e][2]??0,`vertices[${e}]`)}let s=t[o][2]??0;if(n)s!==0&&i.addSegment(a[0],a[1],s,`vertices[${o}]`),i.close();else if(s!==0)throw new U(`vertices[${o}]`,`the last vertex of an open path cannot carry a bulge`);return i}clone(){let t=new e({coordinateSystem:this.system});t.startPoint=this.startPoint,t.segs.push(...this.segs),t.closedFlag=this.closedFlag;for(let[e,n]of this.corners)t.corners.set(e,n);return t}get current(){let e=this.segs[this.segs.length-1];return this.closedFlag||!e?this.startPoint:e.to}get startPosition(){return this.startPoint}get isClosed(){return this.closedFlag}get segmentCount(){return this.segs.length}moveTo(e,t){if(zr(e,`moveTo.x`),zr(t,`moveTo.y`),this.segs.length>0)throw new U(`moveTo`,`a path is one continuous contour: moveTo is only allowed before the first segment (use a new CadPath for another contour)`);return this.startPoint=Or(e,t),this}lineTo(e,t){return zr(e,`lineTo.x`),zr(t,`lineTo.y`),this.addSegment(e,t,0,`lineTo`)}lineBy(e,t){zr(e,`lineBy.dx`),zr(t,`lineBy.dy`);let[n,r]=this.current;return this.addSegment(n+e,r+t,0,`lineBy`)}right(e){return zr(e,`right`),this.stepBy(e,0,`right`)}left(e){return zr(e,`left`),this.stepBy(-e,0,`left`)}up(e){return zr(e,`up`),this.stepBy(0,this.ySign*e,`up`)}down(e){return zr(e,`down`),this.stepBy(0,-this.ySign*e,`down`)}polar(e,t){zr(e,`polar.length`),zr(t,`polar.angleDeg`);let[n,r]=kr(t);return this.stepBy(e*n,this.ySign*e*r,`polar`)}arcTo(e,t,n){return zr(e,`arcTo.x`),zr(t,`arcTo.y`),this.addArc([e,t],n,[0,0],`arcTo`)}arcBy(e,t,n){zr(e,`arcBy.dx`),zr(t,`arcBy.dy`);let[r,i]=this.current;return this.addArc([r+e,i+t],n,[r,i],`arcBy`)}close(){if(this.assertOpen(`close`),this.segs.length===0)throw new U(`close`,`the path has no segments`);let e=this.segs[this.segs.length-1];wr(e.to,this.startPoint)?this.segs[this.segs.length-1]={to:this.startPoint,bulge:e.bulge}:this.segs.push({to:this.startPoint,bulge:0});let t=this.segs.every(e=>e.bulge===0);if(this.segs.length<2||t&&this.segs.length<3)throw new U(`close`,`a closed contour needs at least three straight segments (or two with an arc)`);return this.closedFlag=!0,this}fillet(e,t={}){return zr(e,`fillet.radius`),this.setCorner({kind:`fillet`,radius:e},t,`fillet`)}chamfer(e,t=e,n={}){return zr(e,`chamfer.d1`),zr(t,`chamfer.d2`),this.setCorner({kind:`chamfer`,d1:e,d2:t},n,`chamfer`)}filletAll(e){return zr(e,`filletAll.radius`),this.setAllCorners({kind:`fillet`,radius:e},`filletAll`)}chamferAll(e,t=e){return zr(e,`chamferAll.d1`),zr(t,`chamferAll.d2`),this.setAllCorners({kind:`chamfer`,d1:e,d2:t},`chamferAll`)}build(){let e=this.segs.length;if(e===0)throw new U(`build`,`the path is empty: add at least one segment`);let t=this.closedFlag,n=new Map;for(let[e,t]of this.corners){let r=t.kind;n.set(e,Rr(this.vertexAt(e-1),this.vertexAt(e),this.vertexAt(e+1),t,`${r}[vertex ${e}]`))}let r=[];for(let i=0;i<e;i++){let a=this.segs[i],o=this.vertexAt(i),s=this.vertexAt(i+1),c=n.get(i),l=n.get(t?(i+1)%e:i+1);if(a.bulge===0){let e=Cr(o,s),t=c?.trimNext??0,n=l?.trimPrev??0;if(t+n>e+1e-9*Math.max(1,e))throw new U(`build`,`corners overlap on segment ${i}: they need ${t} + ${n}, but the segment is ${e} long`);let a=(s[0]-o[0])/e,u=(s[1]-o[1])/e,d=t>0?Or(o[0]+a*t,o[1]+u*t):o,f=n>0?Or(s[0]-a*n,s[1]-u*n):s;Cr(d,f)>1e-9&&r.push({from:d,to:f,bulge:0})}else r.push({from:o,to:s,bulge:a.bulge});let u=n.get(t?(i+1)%e:i+1);u&&(t||i+1<e)&&r.push({from:u.from,to:u.to,bulge:u.bulge})}let i=r.map(e=>Object.freeze(e.bulge===0?[e.from[0],e.from[1]]:[e.from[0],e.from[1],e.bulge]));if(!t){let e=r[r.length-1].to;i.push(Object.freeze([e[0],e[1]]))}let a=r.map(e=>e.bulge===0?Object.freeze({type:`line`,from:e.from,to:e.to,length:Cr(e.from,e.to)}):jr(e.from,e.to,e.bulge)),o=a.reduce((e,t)=>e+t.length,0);return Object.freeze({vertices:Object.freeze(i),closed:t,segments:Object.freeze(a),length:o})}assertOpen(e){if(this.closedFlag)throw new U(e,`the path is already closed`)}vertexAt(e){let t=this.segs.length,n=this.closedFlag?(e%t+t)%t:e;return n===0?this.startPoint:this.segs[n-1].to}stepBy(e,t,n){let[r,i]=this.current;return this.addSegment(r+e,i+t,0,n)}addSegment(e,t,n,r){this.assertOpen(r);let i=this.current,a=Or(e,t);if(n===0){if(wr(i,a))return this;this.segs.push({to:a,bulge:0})}else jr(i,a,n),this.segs.push({to:a,bulge:n});return this}addArc(e,t,n,r){if(this.assertOpen(r),typeof t!=`object`||!t)throw new U(`${r}.options`,`must be an object like { radius }, { bulge }, { center }, { through } or { tangent: true }`);let i=Object.keys(t),a=Vr.filter(e=>i.includes(e));if(a.length!==1)throw new U(`${r}.options`,`exactly one of ${Vr.join(` | `)} is required, got ${a.length===0?`none`:a.join(` + `)}`);let o=a[0],s=i.filter(e=>!Hr[o].includes(e));if(s.length>0)throw new U(`${r}.options`,`unknown option(s) for "${o}": ${s.join(`, `)}`);let c=this.current,l=Or(e[0],e[1]),u=t,d=()=>{let e=u.sweep??`ccw`;if(e!==`ccw`&&e!==`cw`)throw new U(`${r}.sweep`,`must be "ccw" or "cw", got ${String(e)}`);return e===`ccw`==(this.ySign===1)},f;switch(o){case`bulge`:zr(u.bulge,`${r}.bulge`),f=u.bulge;break;case`radius`:{zr(u.radius,`${r}.radius`);let e=u.large??!1;if(typeof e!=`boolean`)throw new U(`${r}.large`,`must be a boolean`);f=Nr(c,l,u.radius,d(),e);break}case`center`:{let e=u.center;Br(e,`${r}.center`),f=Pr(c,l,Or(e[0]+n[0],e[1]+n[1]),d());break}case`through`:{let e=u.through;Br(e,`${r}.through`),f=Fr(c,Or(e[0]+n[0],e[1]+n[1]),l);break}case`tangent`:if(u.tangent!==!0)throw new U(`${r}.tangent`,`must be true`);f=Ir(c,l,this.endDirection(r))}return this.addSegment(l[0],l[1],f,r)}endDirection(e){let t=this.segs.length;if(t===0)throw new U(`${e}.tangent`,`there is no previous segment to be tangent to`);let n=this.segs[t-1],r=this.vertexAt(t-1);if(n.bulge!==0)return Lr(jr(r,n.to,n.bulge));let i=Cr(r,n.to);return Or((n.to[0]-r[0])/i,(n.to[1]-r[1])/i)}setCorner(e,t,n){let r=this.segs.length,i;if(t.vertex===void 0){if(this.closedFlag)i=0;else if(r>=2)i=r-1;else throw new U(n,`there is no corner yet: add two segments first (or pass { vertex })`)}else{if(i=t.vertex,!Number.isInteger(i))throw new U(`${n}.vertex`,`must be an integer, got ${String(i)}`);let e=+!this.closedFlag,a=r-1;if(i<e||i>a)throw new U(`${n}.vertex`,`${i} is not a corner of this path (corners: ${e}…${a})`)}return this.assertStraightCorner(i,n),Rr(this.vertexAt(i-1),this.vertexAt(i),this.vertexAt(i+1),e,n),this.corners.set(i,e),this}setAllCorners(e,t){let n=this.segs.length;if(n===0)throw new U(t,`the path is empty`);let r=+!this.closedFlag;for(let i=r;i<n;i++){if(!this.isStraightLines(i))continue;let n=this.vertexAt(i-1),r=this.vertexAt(i),a=this.vertexAt(i+1),o=Cr(n,r),s=Cr(r,a),c=((n[0]-r[0])*(a[1]-r[1])-(n[1]-r[1])*(a[0]-r[0]))/(o*s),l=((n[0]-r[0])*(a[0]-r[0])+(n[1]-r[1])*(a[1]-r[1]))/(o*s);Math.abs(c)<=1e-9&&l<0||(Rr(n,r,a,e,`${t}[vertex ${i}]`),this.corners.set(i,e))}return this}isStraightLines(e){let t=this.segs.length,n=this.segs[this.closedFlag?((e-1)%t+t)%t:e-1],r=this.segs[this.closedFlag?e%t:e];return n!==void 0&&r!==void 0&&n.bulge===0&&r.bulge===0}assertStraightCorner(e,t){if(!this.isStraightLines(e))throw new U(t,`vertex ${e} touches an arc: only corners between two straight segments are supported`)}},W=class extends e{constructor(e,t){super(e,t),this.name=`CadPrimitiveError`}},Wr=Object.freeze([`point`,`line`,`circle`,`arc`,`ellipse`,`rect`,`polyline`,`text`,`mtext`,`spline`,`bezier`]),Gr=1e4,Kr=/[\u0000-\u001f\u007f]/;function qr(e,t){if(typeof e!=`object`||!e||Array.isArray(e))throw new W(t,`must be an object, got ${e===null?`null`:typeof e}`)}function Jr(e,t){if(typeof e!=`number`||!Number.isFinite(e))throw new W(t,`must be a finite number, got ${String(e)}`);return e===0?0:e}function Yr(e,t){let n=Jr(e,t);if(n<=0)throw new W(t,`must be > 0, got ${n}`);return n}function Xr(e,t){let n=Jr(e,t);if(n<0)throw new W(t,`must be >= 0, got ${n}`);return n}function Zr(e,t,n){if(e===void 0)return n;if(typeof e!=`boolean`)throw new W(t,`must be boolean, got ${String(e)}`);return e}function Qr(e,t){if(!kn(e))throw new W(t,`must be a finite point [x, y], got ${JSON.stringify(e)}`);return Dn(e[0],e[1])}function $r(e,t,n){if(!Array.isArray(e))throw new W(t,`must be an array of points [x, y]`);if(e.length<n)throw new W(t,`needs at least ${n} points, got ${e.length}`);return e.map((e,n)=>Qr(e,`${t}[${n}]`))}function ei(e,t){let n=Jr(e,t),r=Number(((n%360+360)%360).toFixed(10))%360;return r===0?0:r}function ti(e,t,n){if(e==null)return null;if(typeof e!=`string`)throw new W(t,`must be a string or null, got ${typeof e}`);if(e.length===0||e.length>n)throw new W(t,`must be 1…${n} characters`);if(Kr.test(e))throw new W(t,`must not contain control characters`);return e}function ni(e,t,n){if(typeof e!=`string`)throw new W(t,`must be a string, got ${typeof e}`);if(e.length>1e4)throw new W(t,`must be at most ${Gr} characters`);let r=e.replace(/\r\n?/g,`
`);if(!n&&r.includes(`
`))throw new W(t,`single-line text must not contain line breaks: use mtext`);if(/[\u0000-\u0008\u000b-\u001f\u007f]/.test(r))throw new W(t,`must not contain control characters (except \\n and \\t)`);return r}function ri(e,t=`fill`){if(e==null)return null;if(e===`hatch`||e===`solid`)return e;if(typeof e==`string`)return T(e,t);throw new W(t,`must be 'hatch' | 'solid' | '#rrggbb' | null, got ${String(e)}`)}function ii(e,t=`entity`){let n=e.layer??`0`;B(n,`${t}.layer`);let r=e.lineWeight??null;return r!==null&&pe(r,`${t}.lineWeight`),{id:ti(e.id,`${t}.id`,128),layer:n,color:e.color===void 0||e.color===null?null:T(e.color,`${t}.color`),lineWeight:r,lineType:e.lineType===void 0||e.lineType===null?null:ee(e.lineType,`${t}.lineType`)}}var ai=[`id`,`layer`,`color`,`lineWeight`,`lineType`];function oi(e,t,n){for(let r of Object.keys(e))if(r!==`type`&&!t.includes(r)&&!ai.includes(r))throw new W(`${n}.${r}`,`unknown property`)}function si(e){return Object.freeze(e)}var ci=1e5;function li(e){return qr(e,`point`),oi(e,[`position`],`point`),si({type:`point`,...ii(e,`point`),position:Qr(e.position,`point.position`)})}function ui(e){return qr(e,`line`),oi(e,[`from`,`to`],`line`),si({type:`line`,...ii(e,`line`),from:Qr(e.from,`line.from`),to:Qr(e.to,`line.to`)})}function di(e){return qr(e,`circle`),oi(e,[`center`,`radius`,`fill`],`circle`),si({type:`circle`,...ii(e,`circle`),center:Qr(e.center,`circle.center`),radius:Yr(e.radius,`circle.radius`),fill:ri(e.fill,`circle.fill`)})}function fi(e){qr(e,`arc`),oi(e,[`center`,`radius`,`startAngleDeg`,`endAngleDeg`,`counterclockwise`],`arc`);let t=ei(e.startAngleDeg,`arc.startAngleDeg`),n=ei(e.endAngleDeg,`arc.endAngleDeg`);if(t===n)throw new W(`arc`,`start and end angles coincide: use circle for a full circle`);return si({type:`arc`,...ii(e,`arc`),center:Qr(e.center,`arc.center`),radius:Yr(e.radius,`arc.radius`),startAngleDeg:t,endAngleDeg:n,counterclockwise:Zr(e.counterclockwise,`arc.counterclockwise`,!0)})}function pi(e,t,n,r={}){let i=Qr(e,`arc.start`),a=Qr(t,`arc.through`),o=Qr(n,`arc.end`),s=jr(i,o,Fr(i,a,o));return fi({...r,center:s.center,radius:s.radius,startAngleDeg:s.startAngleDeg,endAngleDeg:s.endAngleDeg,counterclockwise:s.counterclockwise})}function mi(e){qr(e,`ellipse`),oi(e,[`center`,`radiusX`,`radiusY`,`rotationDeg`,`startAngleDeg`,`endAngleDeg`,`fill`],`ellipse`);let t=Jr(e.startAngleDeg??0,`ellipse.startAngleDeg`),n=Jr(e.endAngleDeg??360,`ellipse.endAngleDeg`),r=ei(t,`ellipse.startAngleDeg`),i=n-t;if(i=Math.abs(i)>=360-1e-10?360:Number(((i%360+360)%360).toFixed(10)),i===0)throw new W(`ellipse`,`start and end angles coincide (use 0 … 360 for a full ellipse)`);return si({type:`ellipse`,...ii(e,`ellipse`),center:Qr(e.center,`ellipse.center`),radiusX:Yr(e.radiusX,`ellipse.radiusX`),radiusY:Yr(e.radiusY,`ellipse.radiusY`),rotationDeg:Jr(e.rotationDeg??0,`ellipse.rotationDeg`),startAngleDeg:r,endAngleDeg:r+i,fill:ri(e.fill,`ellipse.fill`)})}function hi(e){return e.endAngleDeg-e.startAngleDeg>=360-1e-10}function gi(e){qr(e,`rect`),oi(e,[`x`,`y`,`width`,`height`,`cornerRadius`,`fill`],`rect`);let t=Yr(e.width,`rect.width`),n=Yr(e.height,`rect.height`),r=Xr(e.cornerRadius??0,`rect.cornerRadius`);if(r>Math.min(t,n)/2+1e-12)throw new W(`rect.cornerRadius`,`${r} exceeds half of the shorter side (${Math.min(t,n)/2})`);return si({type:`rect`,...ii(e,`rect`),x:Jr(e.x,`rect.x`),y:Jr(e.y,`rect.y`),width:t,height:n,cornerRadius:Math.min(r,Math.min(t,n)/2),fill:ri(e.fill,`rect.fill`)})}function _i(e,t){if(!Array.isArray(e)||e.length!==2&&e.length!==3)throw new W(t,`must be [x, y] or [x, y, bulge], got ${JSON.stringify(e)}`);let n=Jr(e[0],`${t}[0]`),r=Jr(e[1],`${t}[1]`),i=e.length===3?Jr(e[2],`${t}[2]`):0;return Object.freeze(i===0?[n,r]:[n,r,i])}function vi(e,t,n){if(!Array.isArray(e))throw new W(t,`must be an array of vertices`);if(e.length<2)throw new W(t,`needs at least 2 vertices, got ${e.length}`);if(e.length>ci)throw new W(t,`has more than ${ci} vertices`);let r=e.map((e,n)=>_i(e,`${t}[${n}]`)),i=n?r.length:r.length-1;for(let e=0;e<i;e++){let n=r[e],i=r[(e+1)%r.length];if(n[2]!==void 0&&Fn([n[0],n[1]],[i[0],i[1]])<=1e-12)throw new W(`${t}[${e}]`,`an arc segment (bulge ≠ 0) must not have coincident end points`)}if(!n){let e=r[r.length-1];e.length===3&&(r[r.length-1]=Object.freeze([e[0],e[1]]))}if(n&&r.length>2){let e=r[0],t=r[r.length-1];t[2]===void 0&&Fn([e[0],e[1]],[t[0],t[1]])<=1e-12&&r.pop()}return r}function yi(e){qr(e,`polyline`),oi(e,[`vertices`,`closed`,`holes`,`fill`],`polyline`);let t=Zr(e.closed,`polyline.closed`,!1),n=vi(e.vertices,`polyline.vertices`,t),r=e.holes??[];if(!Array.isArray(r))throw new W(`polyline.holes`,`must be an array of contours`);if(r.length>0&&!t)throw new W(`polyline.holes`,`are allowed only for a closed polyline`);let i=r.map((e,t)=>Object.freeze(vi(e,`polyline.holes[${t}]`,!0)));return si({type:`polyline`,...ii(e,`polyline`),vertices:Object.freeze(n),closed:t,holes:Object.freeze(i),fill:ri(e.fill,`polyline.fill`)})}function bi(e,t){qr(e,t),oi(e,[`position`,`value`,`style`,`height`,`rotationDeg`,`anchor`],t);let n=e.anchor??`bottom-left`;if(!jt(n))throw new W(`${t}.anchor`,`must be one of ${At.join(` | `)}, got ${String(n)}`);let r=e.height===void 0||e.height===null?null:Yr(e.height,`${t}.height`);return{...ii(e,t),position:Qr(e.position,`${t}.position`),value:ni(e.value,`${t}.value`,t===`mtext`),style:ti(e.style,`${t}.style`,255),height:r,rotationDeg:Jr(e.rotationDeg??0,`${t}.rotationDeg`),anchor:n}}function xi(e){return si({type:`text`,...bi(e,`text`)})}function Si(e){return si({type:`mtext`,...bi(e,`mtext`)})}function Ci(e){qr(e,`spline`),oi(e,[`controlPoints`,`degree`,`knots`],`spline`);let t=e.degree??3;if(!Number.isInteger(t)||t<1||t>3)throw new W(`spline.degree`,`must be 1, 2 or 3, got ${String(t)}`);let n=$r(e.controlPoints,`spline.controlPoints`,t+1),r;if(e.knots===void 0)r=dr(n.length,t);else{if(!Array.isArray(e.knots))throw new W(`spline.knots`,`must be an array of numbers`);r=e.knots.map((e,t)=>Jr(e,`spline.knots[${t}]`)),fr(r,n.length,t,`spline.knots`)}return si({type:`spline`,...ii(e,`spline`),degree:t,controlPoints:Object.freeze(n),knots:Object.freeze(r)})}function wi(e){qr(e,`bezier`),oi(e,[`points`],`bezier`);let t=$r(e.points,`bezier.points`,4);if((t.length-1)%3!=0)throw new W(`bezier.points`,`must contain 3n + 1 points (p0, c1, c2, p1, …), got ${t.length}`);return si({type:`bezier`,...ii(e,`bezier`),points:Object.freeze(t)})}function Ti(e,t={}){return li({...t,position:e})}function Ei(e,t,n={}){return ui({...n,from:e,to:t})}function Di(e,t,n={}){return di({...n,center:e,radius:t})}function Oi(e,t,n,r,i={}){return fi({...i,center:e,radius:t,startAngleDeg:n,endAngleDeg:r})}function ki(e,t,n,r={}){return pi(e,t,n,r)}function Ai(e,t,n,r={}){return mi({...r,center:e,radiusX:t,radiusY:n})}function ji(e,t,n,r,i={}){return gi({...i,x:e,y:t,width:n,height:r})}function Mi(e){return typeof e==`object`&&!!e&&!Array.isArray(e)&&`vertices`in e&&`segments`in e}function Ni(e,t={}){let{holes:n,...r}=t,i=Mi(e)?e.vertices:e,a=r.closed??(Mi(e)?e.closed:!1),o={...r,vertices:i,closed:a};return n!==void 0&&(o.holes=n.map(e=>Mi(e)?e.vertices:e)),yi(o)}function Pi(e,t={}){return Ni(e,{...t,closed:!0})}function Fi(e,t,n={}){return xi({...n,position:e,value:t})}function Ii(e,t,n={}){return Si({...n,position:e,value:t})}function Li(e,t={}){return Ci({...t,controlPoints:e})}function Ri(e,t={}){return wi({...t,points:e})}function zi(e,t={}){let{tension:n=0,...r}=t;if(!Array.isArray(e)||e.length<2)throw new W(`points`,`needs at least 2 points`);if(!Number.isFinite(n)||n<0||n>1)throw new W(`tension`,`must be in range 0…1, got ${String(n)}`);let i=(1-n)/6,a=[e[0]];for(let t=0;t<e.length-1;t++){let n=e[t-1]??e[t],r=e[t],o=e[t+1],s=e[t+2]??o;a.push([r[0]+(o[0]-n[0])*i,r[1]+(o[1]-n[1])*i]),a.push([o[0]-(s[0]-r[0])*i,o[1]-(s[1]-r[1])*i]),a.push(o)}return wi({...r,points:a})}function Bi(e,t,n={}){let{amplitude:r,waves:i=2,...a}=n,o=Fn(e,t);if(o<=0)throw new W(`breakLine`,`from and to coincide`);if(!Number.isInteger(i)||i<1||i>1e3)throw new W(`waves`,`must be an integer 1…1000, got ${String(i)}`);let s=r??o/20;if(!Number.isFinite(s)||s<=0)throw new W(`amplitude`,`must be > 0, got ${String(s)}`);let c=(t[0]-e[0])/o,l=(t[1]-e[1])/o,u=-l,d=c,f=i*2,p=o/f,m=4/3*s,h=(t,n)=>[e[0]+c*t+u*n,e[1]+l*t+d*n],g=[h(0,0)];for(let e=0;e<f;e++){let t=e%2==0?1:-1;g.push(h(e*p+p/3,t*m),h(e*p+2*p/3,t*m),h((e+1)*p,0))}return wi({...a,points:g})}function Vi(e,t,n={}){let{size:r,...i}=n,a=Fn(e,t);if(a<=0)throw new W(`zigzagBreakLine`,`from and to coincide`);let o=r??Math.min(a/6,a);if(!Number.isFinite(o)||o<=0||o*2>a)throw new W(`size`,`must be in range (0, ${a/2}], got ${String(o)}`);let s=(t[0]-e[0])/a,c=(t[1]-e[1])/a,l=-c,u=s,d=a/2,f=(t,n)=>[e[0]+s*t+l*n,e[1]+c*t+u*n];return yi({...i,vertices:[f(0,0),f(d-o/2,0),f(d-o/4,o),f(d+o/4,-o),f(d+o/2,0),f(a,0)]})}var Hi=Math.PI/180;function Ui(e,t){let n=[],r=e.length,i=t?r:r-1;for(let t=0;t<i;t++){let i=e[t],a=e[(t+1)%r],o=Dn(i[0],i[1]),s=Dn(a[0],a[1]),c=i[2]??0;c===0?n.push(Object.freeze({type:`line`,from:o,to:s,length:Math.hypot(s[0]-o[0],s[1]-o[1])})):n.push(jr(o,s,c))}return n}function Wi(e){let{x:t,y:n,width:r,height:i,cornerRadius:a}=e;return a<=0?[[t,n],[t+r,n],[t+r,n+i],[t,n+i]]:[...Ur.start(t,n).right(r).up(i).left(r).close().filletAll(a).build().vertices]}function Gi(e){return{center:e.center,u:[e.radius,0],v:[0,e.radius],t0:0,sweep:Math.PI*2}}function Ki(e){let t=((e.counterclockwise?e.endAngleDeg-e.startAngleDeg:e.startAngleDeg-e.endAngleDeg)%360+360)%360;return t===0?360:t}function qi(e){let t=Ki(e)*Hi;return{center:e.center,u:[e.radius,0],v:[0,e.radius],t0:e.startAngleDeg*Hi,sweep:e.counterclockwise?t:-t}}function Ji(e){let[t,n]=Rn(e.rotationDeg);return{center:e.center,u:[t*e.radiusX,n*e.radiusX],v:[-n*e.radiusY,t*e.radiusY],t0:e.startAngleDeg*Hi,sweep:(e.endAngleDeg-e.startAngleDeg)*Hi}}function Yi(e){return{center:e.center,u:[e.radius,0],v:[0,e.radius],t0:e.startAngleDeg*Hi,sweep:(e.counterclockwise?1:-1)*e.sweepDeg*Hi}}var Xi=180/Math.PI;function Zi(e,t,n=5){let r=Ui(e,t);if(r.length===0)return e.map(e=>[e[0],e[1]]);let i=[r[0].from];for(let e of r){if(e.type===`line`){i.push(e.to);continue}let t=Math.max(2,Math.ceil(e.sweepDeg/n)),r=e.counterclockwise?1:-1;for(let n=1;n<=t;n++){let a=(e.startAngleDeg+r*e.sweepDeg*n/t)/Xi;i.push(n===t?e.to:[e.center[0]+e.radius*Math.cos(a),e.center[1]+e.radius*Math.sin(a)])}}return t&&i.pop(),i}function Qi(e,t,n){let r=e.u,i=e.v,a=e.t0,o=e.t0+e.sweep;r[0]*i[1]-r[1]*i[0]<0&&(i=[-i[0],-i[1]],[a,o]=[-a,-o]),o<a&&([a,o]=[o,a]);let s=.5*Math.atan2(2*(r[0]*i[0]+r[1]*i[1]),r[0]*r[0]+r[1]*r[1]-(i[0]*i[0]+i[1]*i[1])),c=[r[0]*Math.cos(s)+i[0]*Math.sin(s),r[1]*Math.cos(s)+i[1]*Math.sin(s)],l=[-r[0]*Math.sin(s)+i[0]*Math.cos(s),-r[1]*Math.sin(s)+i[1]*Math.cos(s)],u=Math.abs(e.sweep)>=Math.PI*2-1e-12;return mi({id:t.id,layer:t.layer,color:t.color,lineWeight:t.lineWeight,lineType:t.lineType,center:e.center,radiusX:Pn(c),radiusY:Pn(l),rotationDeg:zn(c),startAngleDeg:u?0:(a-s)*Xi,endAngleDeg:u?360:(o-s)*Xi,fill:n})}function $i(e,t){return{center:Kn(t,e.center),u:qn(t,e.u),v:qn(t,e.v),t0:e.t0,sweep:e.sweep}}function ea(e){return{id:e.id,layer:e.layer,color:e.color,lineWeight:e.lineWeight,lineType:e.lineType}}function ta(e,t,n,r,i){return r?e.map(e=>{let[t,r]=Kn(n,[e[0],e[1]]),a=e[2]??0;return a===0?[t,r]:[t,r,i?-a:a]}):Zi(e,t).map(e=>Kn(n,e))}function na(e,t,n=`cartesian`){if(Yn(t))return e;let r=Xn(t),i=Jn(t)<0,a=Zn(t),o=ea(e);switch(e.type){case`point`:return li({...o,position:Kn(t,e.position)});case`line`:return ui({...o,from:Kn(t,e.from),to:Kn(t,e.to)});case`circle`:return r?di({...o,center:Kn(t,e.center),radius:e.radius*a,fill:e.fill}):Qi($i(Gi(e),t),e,e.fill);case`arc`:{if(!r)return Qi($i(qi(e),t),e,null);let n=Kn(t,e.center),s=e.startAngleDeg/Xi,c=e.endAngleDeg/Xi,l=Kn(t,[e.center[0]+e.radius*Math.cos(s),e.center[1]+e.radius*Math.sin(s)]),u=Kn(t,[e.center[0]+e.radius*Math.cos(c),e.center[1]+e.radius*Math.sin(c)]);return fi({...o,center:n,radius:e.radius*a,startAngleDeg:zn([l[0]-n[0],l[1]-n[1]]),endAngleDeg:zn([u[0]-n[0],u[1]-n[1]]),counterclockwise:i?!e.counterclockwise:e.counterclockwise})}case`ellipse`:return Qi($i(Ji(e),t),e,e.fill);case`rect`:return yi({...o,vertices:ta(Wi(e),!0,t,r,i),closed:!0,fill:e.fill});case`polyline`:{let n=e;return yi({...o,vertices:ta(n.vertices,n.closed,t,r,i),closed:n.closed,holes:n.holes.map(e=>ta(e,!0,t,r,i)),fill:n.fill})}case`text`:case`mtext`:{let r=qn(t,[1,0]),a=qn(t,[0,1]),s=e.type===`text`?xi:Si,c=(n===`screen`?-zn(r):zn(r))+e.rotationDeg,l=(c%360+360)%360;return i&&l>90&&l<=270&&(c-=180),s({...o,position:Kn(t,e.position),value:e.value,style:e.style,height:e.height===null?null:e.height*Pn(a),rotationDeg:c,anchor:e.anchor})}case`spline`:return Ci({...o,degree:e.degree,controlPoints:e.controlPoints.map(e=>Kn(t,e)),knots:e.knots});case`bezier`:return wi({...o,points:e.points.map(e=>Kn(t,e))})}}var ra=class extends e{constructor(e,t){super(e,t),this.name=`CadDimensionError`}},ia=Object.freeze([`dim-linear`,`dim-aligned`,`dim-chain`,`dim-baseline`,`dim-angular`,`dim-radius`,`dim-diameter`,`leader`]),aa=1e3,oa=1e3;function sa(e,t){return ti(e,t,255)}function ca(e,t){if(e==null)return null;let n=ni(e,t,!0);if(n.length>aa)throw new ra(t,`must be at most ${aa} characters`);return n}function la(e,t,n,r){return e===void 0?Math.abs(r[0]-n[0])>=Math.abs(r[1]-n[1])?0:90:e===`horizontal`?0:e===`vertical`?90:Jr(e,t)}function ua(e,t,n,r){if(e.offset!==void 0&&e.at!==void 0)throw new ra(r,`set either "offset" or "at", not both`);if(e.at!==void 0){let i=Qr(e.at,`${r}.at`),a=In(Rn(n)),o=Nn(jn(i,t),a);return o===0?0:o}return Jr(e.offset??0,`${r}.offset`)}var da=[`offset`,`at`];function fa(e){qr(e,`dim-linear`),oi(e,[`p1`,`p2`,`direction`,`style`,`text`,...da],`dim-linear`);let t=Qr(e.p1,`dim-linear.p1`),n=Qr(e.p2,`dim-linear.p2`),r=la(e.direction,`dim-linear.direction`,t,n);return si({type:`dim-linear`,...ii(e,`dim-linear`),style:sa(e.style,`dim-linear.style`),text:ca(e.text,`dim-linear.text`),p1:t,p2:n,angleDeg:r,offset:ua(e,t,r,`dim-linear`)})}function pa(e){qr(e,`dim-aligned`),oi(e,[`p1`,`p2`,`style`,`text`,...da],`dim-aligned`);let t=Qr(e.p1,`dim-aligned.p1`),n=Qr(e.p2,`dim-aligned.p2`);if(Math.hypot(n[0]-t[0],n[1]-t[1])<=1e-12)throw new ra(`dim-aligned`,`p1 and p2 coincide`);let r=Math.atan2(n[1]-t[1],n[0]-t[0])*180/Math.PI;return si({type:`dim-aligned`,...ii(e,`dim-aligned`),style:sa(e.style,`dim-aligned.style`),text:ca(e.text,`dim-aligned.text`),p1:t,p2:n,offset:ua(e,t,r,`dim-aligned`)})}function ma(e){qr(e,`dim-chain`),oi(e,[`points`,`direction`,`style`,`texts`,...da],`dim-chain`);let t=$r(e.points,`dim-chain.points`,2);if(t.length>oa)throw new ra(`dim-chain.points`,`at most ${oa} points`);let n=la(e.direction,`dim-chain.direction`,t[0],t[t.length-1]),r=null;if(e.texts!==void 0&&e.texts!==null){if(!Array.isArray(e.texts)||e.texts.length!==t.length-1)throw new ra(`dim-chain.texts`,`must be an array of ${t.length-1} items (one per segment)`);r=e.texts.map((e,t)=>ca(e,`dim-chain.texts[${t}]`))}return si({type:`dim-chain`,...ii(e,`dim-chain`),style:sa(e.style,`dim-chain.style`),text:null,points:Object.freeze(t),angleDeg:n,offset:ua(e,t[0],n,`dim-chain`),texts:r===null?null:Object.freeze(r)})}function ha(e){qr(e,`dim-baseline`),oi(e,[`base`,`points`,`direction`,`style`,`spacing`,...da],`dim-baseline`);let t=Qr(e.base,`dim-baseline.base`),n=$r(e.points,`dim-baseline.points`,1);if(n.length>oa)throw new ra(`dim-baseline.points`,`at most ${oa} points`);let r=n.reduce((e,n)=>Math.hypot(n[0]-t[0],n[1]-t[1])>Math.hypot(e[0]-t[0],e[1]-t[1])?n:e),i=la(e.direction,`dim-baseline.direction`,t,r),a=e.spacing===void 0||e.spacing===null?null:Yr(e.spacing,`dim-baseline.spacing`);return si({type:`dim-baseline`,...ii(e,`dim-baseline`),style:sa(e.style,`dim-baseline.style`),text:null,base:t,points:Object.freeze(n),angleDeg:i,offset:ua(e,t,i,`dim-baseline`),spacing:a})}function ga(e){qr(e,`dim-angular`),oi(e,[`center`,`start`,`end`,`radius`,`counterclockwise`,`style`,`text`],`dim-angular`);let t=Qr(e.center,`dim-angular.center`),n=Qr(e.start,`dim-angular.start`),r=Qr(e.end,`dim-angular.end`),i=Math.hypot(n[0]-t[0],n[1]-t[1]),a=Math.hypot(r[0]-t[0],r[1]-t[1]);if(i<=1e-12||a<=1e-12)throw new ra(`dim-angular`,`start and end must differ from center`);return si({type:`dim-angular`,...ii(e,`dim-angular`),style:sa(e.style,`dim-angular.style`),text:ca(e.text,`dim-angular.text`),center:t,start:n,end:r,radius:e.radius===void 0?Math.min(i,a):Yr(e.radius,`dim-angular.radius`),counterclockwise:Zr(e.counterclockwise,`dim-angular.counterclockwise`,!0)})}function _a(e,t){return qr(t,e),oi(t,[`center`,`radius`,`angleDeg`,`style`,`text`],e),{type:e,...ii(t,e),style:sa(t.style,`${e}.style`),text:ca(t.text,`${e}.text`),center:Qr(t.center,`${e}.center`),radius:Yr(t.radius,`${e}.radius`),angleDeg:Jr(t.angleDeg??45,`${e}.angleDeg`)}}function va(e){return si(_a(`dim-radius`,e))}function ya(e){return si(_a(`dim-diameter`,e))}function ba(e){qr(e,`leader`),oi(e,[`points`,`text`,`style`,`shelf`,`shelfLength`],`leader`);let t=$r(e.points,`leader.points`,2),n=e.shelfLength===void 0||e.shelfLength===null?null:Yr(e.shelfLength,`leader.shelfLength`),r=ni(e.text,`leader.text`,!0);if(r.length>aa)throw new ra(`leader.text`,`must be at most ${aa} characters`);return si({type:`leader`,...ii(e,`leader`),points:Object.freeze(t),text:r,style:sa(e.style,`leader.style`),shelf:Zr(e.shelf,`leader.shelf`,!0),shelfLength:n})}var xa=(e,t,n={})=>fa({...n,p1:e,p2:t}),Sa=(e,t,n={})=>pa({...n,p1:e,p2:t}),Ca=(e,t={})=>ma({...t,points:e}),wa=(e,t,n={})=>ha({...n,base:e,points:t}),Ta=(e,t,n,r={})=>ga({...r,center:e,start:t,end:n}),Ea=(e,t,n={})=>va({...n,center:e,radius:t}),Da=(e,t,n={})=>ya({...n,center:e,radius:t}),Oa=(e,t,n={})=>ba({...n,points:e,text:t}),ka=1e-9,Aa=Math.PI/180,ja=class{ctx;style;metrics;curves=[];texts=[];values=[];constructor(e,t,n){this.ctx=e,this.style=t,this.metrics=n}line(e,t,n,r=!1,i=!1){Math.hypot(n[0]-t[0],n[1]-t[1])<=ka||this.curves.push({kind:`line`,role:e,from:t,to:n,startTerminator:r,endTerminator:i})}arc(e,t,n,r,i,a,o=!1,s=!1){Math.abs(i-r)*n<=ka||this.curves.push({kind:`arc`,role:e,center:t,radius:n,startAngleDeg:Ma(r),endAngleDeg:Ma(i),counterclockwise:a,startTerminator:o,endTerminator:s})}text(e,t,n,r,i,a,o){let s=It(i,{position:t,rotationDeg:n});this.texts.push({text:e,position:t,rotationDeg:n,anchor:r,textStyle:a,paperHeight:o,height:i.fontHeight,layout:i,corners:s.corners})}};function Ma(e){let t=Number(((e%360+360)%360).toFixed(10))%360;return t===0?0:t}function Na(e,t){if(t===null)return e.dimStyles.current;let n=e.dimStyles.get(t);if(!n)throw new ra(`style`,`dimension style "${t}" is not registered`);return n}function Pa(e,t){return e===null?t:e.split(`<>`).join(t)}function Fa(e){return e.terminatorType!==`tick`&&e.terminatorType!==`none`}function Ia(e,t,n){return Lt(It(e,{rotationDeg:t}),n,[0,0]).length}function La(e,t,n,r,i,a){let{style:o,metrics:s,ctx:c}=e,l=Rn(r),u=In(l),d=Nn(t,u)+i,f=d-Nn(t,u),p=d-Nn(n,u),m=An(t,Mn(u,f)),h=An(n,Mn(u,p)),g=Math.abs(Nn(jn(n,t),l));if(e.values.push(g),g<=ka)throw new ra(`points`,`the measured distance along the dimension direction is zero`);let _=(t,n,r)=>{if(Math.abs(r)<=s.extensionOffset+ka)return;let i=Math.sign(r);e.line(`extension`,An(t,Mn(u,i*s.extensionOffset)),An(n,Mn(u,i*s.extensionOvershoot)))};!a.hideExt1&&!o.hideFirstExtensionLine&&_(t,m,f),!a.hideExt2&&!o.hideSecondExtensionLine&&_(n,h,p);let v=Ln(jn(h,m)),y=zn(v),b=g,x=s.terminator.extent,S=Fa(o)&&b<2*x+s.textGap,C=2*x,w=Pa(a.text,_n(g,o,`linear`)),T=c.dimStyles.resolveTextStyle(o),E=xn(w,o,c.dimStyles.textStyles,c.drawing,{lineAngleDeg:y}),D=Ia(E.layout,E.rotationDeg,y),O=b-(S?0:2*x),k=E.position===`outside`||D+2*s.textGap<=O,A=[(m[0]+h[0])/2,(m[1]+h[1])/2],j=In(v),M=null;if(k&&E.position!==`outside`){let t=An(An(A,Mn(v,E.along.offset)),Mn(j,E.across));e.text(w,t,E.rotationDeg,E.anchor,E.layout,T.name,T.height),E.lineBreak&&(M=E.lineBreak)}else{let t=An(h,Mn(v,(S?C:0)+s.textGap));if(o.textPosition===`above`){let n=D+2*s.textGap;e.line(`dimension`,h,An(t,Mn(v,n-s.textGap)));let r=An(An(t,Mn(v,n/2-s.textGap)),Mn(j,E.across));e.text(w,r,E.rotationDeg,E.anchor,E.layout,T.name,T.height)}else{let n=xn(w,{...o,textPosition:`outside`},c.dimStyles.textStyles,c.drawing,{lineAngleDeg:y});e.text(w,t,n.rotationDeg,n.anchor,n.layout,T.name,T.height)}}if(S){e.line(`dimension`,jn(m,Mn(v,C)),m,!1,!0),e.line(`dimension`,m,h),e.line(`dimension`,An(h,Mn(v,C)),h,!1,!0);return}let N=s.effectiveDimLineOvershoot;N>0&&(e.line(`dimension`,jn(m,Mn(v,N)),m),e.line(`dimension`,h,An(h,Mn(v,N)))),M?(e.line(`dimension`,m,An(A,Mn(v,M.start)),!0,!1),e.line(`dimension`,An(A,Mn(v,M.end)),h,!1,!0)):e.line(`dimension`,m,h,!0,!0)}function Ra(e,t){let{style:n,metrics:r,ctx:i}=e,a=t.center,o=zn(jn(t.start,a)),s=zn(jn(t.end,a)),c=Math.hypot(t.start[0]-a[0],t.start[1]-a[1]),l=Math.hypot(t.end[0]-a[0],t.end[1]-a[1]);t.counterclockwise||([o,s]=[s,o],[c,l]=[l,c]);let u=Ma(s-o);if(u<=1e-9)throw new ra(`dim-angular`,`the two rays coincide: the angle is zero`);s=o+u,e.values.push(u);let d=t.radius,f=(t,n)=>{let i=Rn(t);d>n+r.extensionOffset?e.line(`extension`,An(a,Mn(i,n+r.extensionOffset)),An(a,Mn(i,d+r.extensionOvershoot))):d<n-r.extensionOffset&&e.line(`extension`,An(a,Mn(i,n-r.extensionOffset)),An(a,Mn(i,Math.max(0,d-r.extensionOvershoot))))};n.hideFirstExtensionLine||f(o,c),n.hideSecondExtensionLine||f(s,l);let p=d*u*Aa,m=r.terminator.extent,h=Fa(n)&&p<2*m+r.textGap,g=Pa(t.text,_n(u,n,`angular`)),_=i.dimStyles.resolveTextStyle(n),v=o+u/2,y=v-90,b=n.textPosition===`centered`?`centered`:`above`,x=xn(g,{...n,textPosition:b},i.dimStyles.textStyles,i.drawing,{lineAngleDeg:y}),S=An(a,Mn(Rn(v),d)),C=null;if(x.lineBreak&&!h){let e=v-x.lineBreak.end/d/Aa,t=v-x.lineBreak.start/d/Aa;e-o>m/d/Aa&&s-t>m/d/Aa&&(C=[e,t])}if(x.lineBreak&&!C){let t=xn(g,{...n,textPosition:`above`},i.dimStyles.textStyles,i.drawing,{lineAngleDeg:y});e.text(g,An(S,Mn(Rn(v),t.across)),t.rotationDeg,t.anchor,t.layout,_.name,_.height)}else e.text(g,An(S,Mn(Rn(v),x.across)),x.rotationDeg,x.anchor,x.layout,_.name,_.height);if(h){let t=2*m/d/Aa;e.arc(`dimension`,a,d,o-t,o,!0,!1,!0),e.arc(`dimension`,a,d,o,s,!0),e.arc(`dimension`,a,d,s+t,s,!1,!1,!0);return}let w=r.effectiveDimLineOvershoot/d/Aa;w>0&&(e.arc(`dimension`,a,d,o-w,o,!0),e.arc(`dimension`,a,d,s,s+w,!0)),C?(e.arc(`dimension`,a,d,o,C[0],!0,!0,!1),e.arc(`dimension`,a,d,C[1],s,!0,!1,!0)):e.arc(`dimension`,a,d,o,s,!0,!0,!0)}function za(e,t){let{style:n,metrics:r,ctx:i}=e,a=t.type===`dim-diameter`,o=Rn(t.angleDeg),s=t.center,c=t.radius,l=An(s,Mn(o,c)),u=a?jn(s,Mn(o,c)):s,d=a?2*c:c;e.values.push(d);let f=Pa(t.text,_n(d,n,a?`diameter`:`radius`)),p=i.dimStyles.resolveTextStyle(n),m=xn(f,n,i.dimStyles.textStyles,i.drawing,{lineAngleDeg:t.angleDeg}),h=Ia(m.layout,m.rotationDeg,t.angleDeg),g=r.terminator.extent,_=(a?2*c:c)-(a?2:1)*g,v=m.position!==`outside`&&h+2*r.textGap<=_,y=In(o);if(v){let t=a?s:An(s,Mn(o,c/2)),n=An(An(t,Mn(o,m.along.offset)),Mn(y,m.across));e.text(f,n,m.rotationDeg,m.anchor,m.layout,p.name,p.height),m.lineBreak?(e.line(`dimension`,u,An(t,Mn(o,m.lineBreak.start)),a,!1),e.line(`dimension`,An(t,Mn(o,m.lineBreak.end)),l,!1,!0)):e.line(`dimension`,u,l,a,!0);return}e.line(`dimension`,u,l,a,!0);let b=An(l,Mn(o,r.textGap));if(n.textPosition===`above`){let t=h+2*r.textGap;e.line(`dimension`,l,An(l,Mn(o,t+r.textGap)));let n=An(An(l,Mn(o,r.textGap+t/2)),Mn(y,m.across));e.text(f,n,m.rotationDeg,m.anchor,m.layout,p.name,p.height)}else{let r=xn(f,{...n,textPosition:`outside`},i.dimStyles.textStyles,i.drawing,{lineAngleDeg:t.angleDeg});e.text(f,b,r.rotationDeg,r.anchor,r.layout,p.name,p.height)}}function Ba(e,t){let{style:n,metrics:r,ctx:i}=e,a=t.points;for(let t=0;t<a.length-1;t++)e.line(`leader`,a[t],a[t+1],t===0,!1);let o=a[a.length-1],s=a[a.length-2],c=o[0]-s[0]<-1e-9?-1:1,l=i.dimStyles.resolveTextStyle(n),u=r.textGap;if(t.shelf){let n=c>0?`bottom-left`:`bottom-right`,r=Ft(t.text,l,i.dimStyles.textStyles.fonts,i.drawing,{anchor:n}),a=r.box.maxX-r.box.minX,s=t.shelfLength===null?a+2*u:i.drawing.annotationToModel(t.shelfLength);e.line(`shelf`,o,[o[0]+c*s,o[1]]),e.text(t.text,[o[0]+c*u,o[1]+u],0,n,r,l.name,l.height)}else{let n=c>0?`middle-left`:`middle-right`,r=Ft(t.text,l,i.dimStyles.textStyles.fonts,i.drawing,{anchor:n});e.text(t.text,[o[0]+c*u,o[1]],0,n,r,l.name,l.height)}}var Va=e=>[e[0],e[1]===0?0:-e[1]];function Ha(e){switch(e.type){case`dim-linear`:return{...e,p1:Va(e.p1),p2:Va(e.p2),angleDeg:-e.angleDeg,offset:-e.offset};case`dim-aligned`:return{...e,p1:Va(e.p1),p2:Va(e.p2),offset:-e.offset};case`dim-chain`:return{...e,points:e.points.map(Va),angleDeg:-e.angleDeg,offset:-e.offset};case`dim-baseline`:return{...e,base:Va(e.base),points:e.points.map(Va),angleDeg:-e.angleDeg,offset:-e.offset};case`dim-angular`:return{...e,center:Va(e.center),start:Va(e.start),end:Va(e.end),counterclockwise:!e.counterclockwise};case`dim-radius`:case`dim-diameter`:return{...e,center:Va(e.center),angleDeg:-e.angleDeg};case`leader`:return{...e,points:e.points.map(Va)}}}function Ua(e){return{...e,curves:e.curves.map(e=>e.kind===`line`?{...e,from:Va(e.from),to:Va(e.to)}:{...e,center:Va(e.center),startAngleDeg:Ma(-e.startAngleDeg),endAngleDeg:Ma(-e.endAngleDeg),counterclockwise:!e.counterclockwise}),terminators:e.terminators.map(e=>({tip:Va(e.tip),angleDeg:-e.angleDeg})),texts:e.texts.map(e=>({...e,position:Va(e.position),corners:e.corners.map(Va)}))}}function Wa(e){let t=[];for(let n of e)if(n.kind===`line`){let e=zn(jn(n.to,n.from));n.endTerminator&&t.push({tip:n.to,angleDeg:e}),n.startTerminator&&t.push({tip:n.from,angleDeg:e+180})}else{let e=e=>An(n.center,Mn(Rn(e),n.radius)),r=n.counterclockwise?1:-1;n.endTerminator&&t.push({tip:e(n.endAngleDeg),angleDeg:n.endAngleDeg+r*90}),n.startTerminator&&t.push({tip:e(n.startAngleDeg),angleDeg:n.startAngleDeg-r*90})}return t.map(e=>({tip:e.tip,angleDeg:Ma(e.angleDeg)}))}function Ga(e,t){let n=Na(t,e.style),r=vn(n,t.drawing),i=t.drawing.settings.coordinateSystem===`screen`,a=i?Ha(e):e,o=new ja(t,n,r);switch(a.type){case`dim-linear`:La(o,a.p1,a.p2,a.angleDeg,a.offset,{hideExt1:!1,hideExt2:!1,text:a.text});break;case`dim-aligned`:{let e=zn(jn(a.p2,a.p1));La(o,a.p1,a.p2,e,a.offset,{hideExt1:!1,hideExt2:!1,text:a.text});break}case`dim-chain`:Ka(o,a);break;case`dim-baseline`:qa(o,a);break;case`dim-angular`:Ra(o,a);break;case`dim-radius`:case`dim-diameter`:za(o,a);break;case`leader`:Ba(o,a);break;default:throw new ra(`type`,`unknown dimension type ${String(a.type)}`)}let s={style:n,metrics:r,values:o.values,curves:o.curves,terminators:Wa(o.curves),texts:o.texts};return i?Ua(s):s}function Ka(e,t){let n=In(Rn(t.angleDeg)),r=Nn(t.points[0],n)+t.offset;for(let i=0;i<t.points.length-1;i++){let a=t.points[i],o=t.points[i+1];La(e,a,o,t.angleDeg,r-Nn(a,n),{hideExt1:i>0,hideExt2:!1,text:t.texts?.[i]??null})}}function qa(e,t){let n=Rn(t.angleDeg),r=t.spacing===null?e.metrics.baselineSpacing:e.ctx.drawing.annotationToModel(t.spacing),i=t.offset<0?-1:1,a=[...t.points].sort((e,r)=>Math.abs(Nn(jn(e,t.base),n))-Math.abs(Nn(jn(r,t.base),n)));a.forEach((n,o)=>{La(e,t.base,n,t.angleDeg,t.offset+i*o*r,{hideExt1:o<a.length-1,hideExt2:!1,text:null})})}var Ja=class extends e{constructor(e,t){super(e,t),this.name=`CadBlockError`}},Ya=Object.freeze([...Wr,...ia,`insert`,`viewport`]);new Set(Wr);var Xa=new Set(ia),Za=new Set(Ya);function Qa(e){return typeof e==`string`&&Za.has(e)}function $a(e){return typeof e==`object`&&!!e&&Qa(e.type)&&Object.isFrozen(e)}function eo(e){return Xa.has(e.type)}var to=1e6;function no(e,t=`name`){try{B(e,t)}catch(e){throw new Ja(t,e.message.replace(/^\[cad-blueprint\] [^:]+: /,``))}if(e.startsWith(`*`))throw new Ja(t,`must not start with "*" (reserved for DXF service blocks)`)}function ro(e){return e.toLowerCase()}function io(e,t,n={}){if(no(e),!Array.isArray(t))throw new Ja(`${e}.entities`,`must be an array of entities`);if(t.length>1e6)throw new Ja(`${e}.entities`,`at most ${to} entities`);return t.forEach((t,n)=>{if(!$a(t))throw new Ja(`${e}.entities[${n}]`,`must be an entity created by a factory (or parseEntity)`)}),Object.freeze({name:e,basePoint:Qr(n.basePoint??[0,0],`${e}.basePoint`),entities:Object.freeze([...t]),description:ti(n.description,`${e}.description`,1e3)})}function ao(e){let t=new Map,n=e=>{for(let r of e)r.type===`insert`?t.has(ro(r.block))||t.set(ro(r.block),r.block):r.type===`viewport`&&n(r.entities)};return n(e),[...t.values()]}function oo(e,t){let n=Jr(e,t);if(n===0)throw new Ja(t,`must not be 0`);return n}function so(e){if(qr(e,`insert`),oi(e,[`block`,`position`,`scale`,`scaleX`,`scaleY`,`rotationDeg`],`insert`),B(e.block,`insert.block`),e.scale!==void 0&&(e.scaleX!==void 0||e.scaleY!==void 0))throw new Ja(`insert`,`set either "scale" or "scaleX" / "scaleY", not both`);let t=e.scale===void 0?null:oo(e.scale,`insert.scale`);return si({type:`insert`,...ii(e,`insert`),block:e.block,position:Qr(e.position??[0,0],`insert.position`),scaleX:t??oo(e.scaleX??1,`insert.scaleX`),scaleY:t??oo(e.scaleY??1,`insert.scaleY`),rotationDeg:Jr(e.rotationDeg??0,`insert.rotationDeg`)})}function co(e,t=[0,0],n={}){return so({...n,block:e,position:t})}function lo(e,t){return Gn(Vn(e.position[0],e.position[1]),Hn(e.rotationDeg),Un(e.scaleX,e.scaleY),Vn(-t.basePoint[0],-t.basePoint[1]))}var uo=255;function fo(e){if(qr(e,`viewport`),oi(e,[`entities`,`position`,`target`,`scale`,`rotationDeg`,`title`,`clip`,`frame`],`viewport`),!Array.isArray(e.entities))throw new Ja(`viewport.entities`,`must be an array of entities`);e.entities.forEach((e,t)=>{if(!$a(e))throw new Ja(`viewport.entities[${t}]`,`must be an entity created by a factory (or parseEntity)`)});let t=null;if(e.scale!==void 0&&e.scale!==null)try{t=f(e.scale)}catch(e){throw new Ja(`viewport.scale`,e.message)}let n=null;if(e.clip!==void 0&&e.clip!==null){let t=e.clip;qr(t,`viewport.clip`);let r=Jr(t.minX,`viewport.clip.minX`),i=Jr(t.minY,`viewport.clip.minY`),a=Jr(t.maxX,`viewport.clip.maxX`),o=Jr(t.maxY,`viewport.clip.maxY`);if(a<=r||o<=i)throw new Ja(`viewport.clip`,`must have maxX > minX and maxY > minY`);n=Object.freeze({minX:r,minY:i,maxX:a,maxY:o})}let r=Zr(e.frame,`viewport.frame`,!1);if(r&&n===null)throw new Ja(`viewport.frame`,`needs "clip" (the frame is drawn along the clip boundary)`);return si({type:`viewport`,...ii(e,`viewport`),position:Qr(e.position??[0,0],`viewport.position`),target:Qr(e.target??[0,0],`viewport.target`),scale:t,rotationDeg:Jr(e.rotationDeg??0,`viewport.rotationDeg`),entities:Object.freeze([...e.entities]),title:ti(e.title,`viewport.title`,uo),clip:n,frame:r})}function po(e,t={}){return fo({...t,entities:e})}function mo(e,t){return e.scale===null?1:p(e.scale)/t.scaleFactor}function ho(e,t){let n=mo(e,t);return Gn(Vn(e.position[0],e.position[1]),Hn(e.rotationDeg),Un(n,n),Vn(-e.target[0],-e.target[1]))}function go(e,t){return e.scale===null?t:S(b(t.settings,{scale:e.scale,annotationScale:e.scale}))}var _o=32;function vo(e){let{type:t,...n}=e;return n}function yo(e,t){let{angleDeg:n,text:r,...i}=vo(e),a={...i};if(n!==void 0&&(a.direction=n),!t&&r!==void 0&&(a.text=r),t&&r!=null)throw new W(`${String(e.type)}.text`,`is not supported here (use "texts" for a chain)`);return a}function bo(e,t=`entity`,n=0){if(typeof e!=`object`||!e||Array.isArray(e))throw new W(t,`must be an object with a "type"`);if(n>_o)throw new W(t,`nesting is deeper than ${_o} levels`);let r=e,i=vo(r);try{switch(r.type){case`point`:return li(i);case`line`:return ui(i);case`circle`:return di(i);case`arc`:return fi(i);case`ellipse`:return mi(i);case`rect`:return gi(i);case`polyline`:return yi(i);case`text`:return xi(i);case`mtext`:return Si(i);case`spline`:return Ci(i);case`bezier`:return wi(i);case`dim-linear`:return fa(yo(r,!1));case`dim-aligned`:return pa(i);case`dim-chain`:return ma(yo(r,!0));case`dim-baseline`:return ha(yo(r,!0));case`dim-angular`:return ga(i);case`dim-radius`:return va(i);case`dim-diameter`:return ya(i);case`leader`:return ba(i);case`insert`:return so(i);case`viewport`:{if(!Array.isArray(i.entities))throw new W(`${t}.entities`,`must be an array`);let e=i.entities.map((e,r)=>bo(e,`${t}.entities[${r}]`,n+1));return fo({...i,entities:e})}default:throw new W(`${t}.type`,`must be one of ${Ya.join(` | `)}, got ${String(r.type)}`)}}catch(e){throw e instanceof Error&&t!==`entity`&&!e.message.includes(t)&&(e.message=`${e.message} (at ${t})`),e}}function xo(e,t=`entities`){if(!Array.isArray(e))throw new W(t,`must be an array`);return e.map((e,n)=>bo(e,`${t}[${n}]`))}var So=class e{blocks=new Map;listeners=new Set;constructor(e=[]){for(let t of e)this.add(t)}get size(){return this.blocks.size}has(e){return this.blocks.has(ro(e))}get(e){return this.blocks.get(ro(e))}require(e){let t=this.get(e);if(!t)throw new Ja(e,`block is not defined`);return t}list(){return[...this.blocks.values()]}names(){return this.list().map(e=>e.name)}[Symbol.iterator](){return this.blocks.values()}define(e,t,n={}){if(this.has(e))throw new Ja(e,`block already exists (use redefine)`);return this.add(io(e,t,n))}add(e){let t=io(e.name,e.entities,{basePoint:e.basePoint,description:e.description});if(this.has(t.name))throw new Ja(t.name,`block already exists (use redefine)`);return this.assertNoCycle(t),this.blocks.set(ro(t.name),t),this.emit({type:`define`,block:t}),t}redefine(e,t,n={}){let r=this.require(e),i=io(r.name,t,{basePoint:n.basePoint??r.basePoint,description:n.description===void 0?r.description:n.description});return this.assertNoCycle(i),this.blocks.set(ro(r.name),i),this.emit({type:`redefine`,block:i,previous:r}),i}delete(e){let t=this.require(e),n=this.list().filter(n=>n!==t&&ao(n.entities).some(t=>ro(t)===ro(e)));if(n.length>0)throw new Ja(t.name,`is used by block(s) ${n.map(e=>`"${e.name}"`).join(`, `)}`);this.blocks.delete(ro(e)),this.emit({type:`delete`,block:t})}dependencies(e){let t=new Map,n=e=>{let r=this.get(e);if(r)for(let e of ao(r.entities))t.has(ro(e))||(t.set(ro(e),this.get(e)?.name??e),n(e))};return n(e),t.delete(ro(e)),[...t.values()]}missingBlocks(){let e=new Map;for(let t of this.blocks.values())for(let n of ao(t.entities))this.has(n)||e.set(ro(n),n);return[...e.values()]}topologicalOrder(){let e=[],t=new Set,n=r=>{if(!t.has(ro(r.name))){t.add(ro(r.name));for(let e of ao(r.entities)){let t=this.get(e);t&&n(t)}e.push(r)}};for(let e of this.blocks.values())n(e);return e}onChange(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}toJSON(){return this.list().map(e=>({name:e.name,basePoint:[e.basePoint[0],e.basePoint[1]],entities:e.entities,...e.description===null?{}:{description:e.description}}))}static fromJSON(t){if(!Array.isArray(t))throw new Ja(`blocks`,`must be an array of block definitions`);let n=new e,r=t.map((e,t)=>Co(e,`blocks[${t}]`));for(let e of r)n.add(e);return n}assertNoCycle(e){let t=ro(e.name),n=new Set,r=(i,a)=>{for(let o of i){let i=ro(o);if(i===t)throw new Ja(e.name,`circular block reference: ${[...a,o].join(` → `)}`);if(n.has(i))continue;n.add(i);let s=this.get(o);s&&r(ao(s.entities),[...a,o])}};r(ao(e.entities),[e.name])}emit(e){for(let t of[...this.listeners])t(e)}};function Co(e,t=`block`){if(typeof e!=`object`||!e||Array.isArray(e))throw new Ja(t,`must be an object`);let n=e;if(no(n.name,`${t}.name`),!Array.isArray(n.entities))throw new Ja(`${t}.entities`,`must be an array`);let r=n.entities.map((e,n)=>bo(e,`${t}.entities[${n}]`));return io(n.name,r,{basePoint:Qr(n.basePoint??[0,0],`${t}.basePoint`),description:n.description??null})}var wo=class extends e{constructor(e,t){super(e,t),this.name=`CadDocumentError`}},To=/^[A-Za-z0-9_-]{1,64}$/,Eo=class e{id;items=[];nameValue;constructor(t,n,r=[]){if(this.id=t,!To.test(t))throw new wo(`sheet.id`,`must match ${String(To)}, got "${t}"`);this.nameValue=e.checkName(n),this.add(...r)}get name(){return this.nameValue}set name(t){this.nameValue=e.checkName(t)}get entities(){return this.items}get size(){return this.items.length}add(...e){return e.forEach((e,t)=>{if(!$a(e))throw new wo(`sheet "${this.id}".entities[${this.items.length+t}]`,`must be an entity created by a factory`)}),this.items.push(...e),this}remove(e){let t=this.items.length;return this.items=this.items.filter(t=>typeof e==`string`?t.id!==e:t!==e),t-this.items.length}replace(e,t){if(!$a(t))throw new wo(`replace`,`must be an entity created by a factory`);let n=this.items.findIndex(t=>typeof e==`string`?t.id===e:t===e);return n<0?!1:(this.items[n]=t,!0)}find(e){return this.items.find(t=>t.id===e)}clear(){return this.items=[],this}set(e){return this.items=[],this.add(...e)}toJSON(){return{id:this.id,name:this.name,entities:this.items}}static checkName(e){if(typeof e!=`string`||e.length===0||e.length>255)throw new wo(`sheet.name`,`must be a string of 1…255 characters`);return e}},Do=class e{fonts;textStyles;dimStyles;layers;blocks;settingsValue;metricsCache=null;sheetList=[];constructor(e={}){this.settingsValue=y({annotationScale:`auto`,...e.settings}),this.fonts=new ht,this.textStyles=new kt(this.fonts),this.dimStyles=new hn(this.textStyles),this.layers=new ye,this.blocks=new So,e.gost&&(Cn(this.dimStyles),this.textStyles.setCurrent(`GOST`),this.dimStyles.setCurrent(`GOST`))}static fromParts(t){let n=Object.create(e.prototype),r=t.dimStyles??new hn(new kt(new ht));return Object.assign(n,{settingsValue:t.settings??y(),metricsCache:null,sheetList:[...t.sheets??[]],fonts:r.textStyles.fonts,textStyles:r.textStyles,dimStyles:r,layers:t.layers??new ye,blocks:t.blocks??new So}),n}get settings(){return this.settingsValue}updateSettings(e){return this.settingsValue=b(this.settingsValue,e),this.metricsCache=null,this.settingsValue}get drawing(){return this.metricsCache??=S(this.settingsValue),this.metricsCache}get sheets(){return this.sheetList}addSheet(e=`Лист`,t=[],n){let r=n;if(r===void 0){let e=this.sheetList.length+1;for(;this.sheetList.some(t=>t.id===`sheet-${e}`);)e++;r=`sheet-${e}`}if(this.sheetList.some(e=>e.id===r))throw new wo(`sheet.id`,`sheet "${r}" already exists`);let i=new Eo(r,e,t);return this.sheetList.push(i),i}getSheet(e){return this.sheetList.find(t=>t.id===e)??this.sheetList.find(t=>t.name===e)}requireSheet(e){let t=e===void 0?this.sheetList[0]:this.getSheet(e);if(!t)throw new wo(`sheet`,e===void 0?`the document has no sheets`:`sheet "${e}" not found`);return t}removeSheet(e){let t=this.sheetList.findIndex(t=>t.id===e);return t<0?!1:(this.sheetList.splice(t,1),!0)}context(){return Object.freeze({drawing:this.drawing,layers:this.layers,fonts:this.fonts,textStyles:this.textStyles,dimStyles:this.dimStyles,blocks:this.blocks})}audit(){let e=[],t=(n,r)=>{n.forEach((n,i)=>{let a=`${r} / entities[${i}]`;this.layers.has(n.layer)||e.push({severity:`warning`,path:a,message:`layer "${n.layer}" is not defined (drawn as layer "0")`}),n.type!==`text`&&n.type!==`mtext`||n.style===null||this.textStyles.has(n.style)||e.push({severity:`warning`,path:a,message:`text style "${n.style}" is not defined (drawn as "Standard")`}),`style`in n&&n.type!==`text`&&n.type!==`mtext`&&n.style!==null&&!this.dimStyles.has(n.style)&&e.push({severity:`error`,path:a,message:`dimension style "${n.style}" is not defined`}),n.type===`insert`&&!this.blocks.has(n.block)&&e.push({severity:`error`,path:a,message:`block "${n.block}" is not defined`}),n.type===`viewport`&&t(n.entities,a)})};for(let e of this.sheetList)t(e.entities,`sheet "${e.id}"`);for(let e of this.blocks)t(e.entities,`block "${e.name}"`);for(let t of this.textStyles.missingFonts())e.push({severity:`error`,path:`textStyles`,message:`text style "${t}" uses a font that is not registered`});for(let t of this.dimStyles.missingTextStyles())e.push({severity:`error`,path:`dimStyles`,message:`dimension style "${t}" uses a text style that is not registered`});return e}usedBlocks(){let e=new Map,t=n=>{for(let r of n)e.has(r.toLowerCase())||(e.set(r.toLowerCase(),this.blocks.get(r)?.name??r),t(this.blocks.dependencies(r).concat()))};for(let e of this.sheetList)t(ao(e.entities));return[...e.values()]}toJSON(){return{format:`cad-blueprint`,version:1,settings:this.settingsValue,fonts:this.fonts.toJSON(),textStyles:this.textStyles.toJSON(),dimStyles:this.dimStyles.toJSON(),layers:this.layers.toJSON(),blocks:this.blocks.toJSON(),sheets:this.sheetList.map(e=>e.toJSON())}}static fromJSON(t){if(typeof t!=`object`||!t||Array.isArray(t))throw new wo(`document`,`must be an object`);let n=t;if(n.format!==`cad-blueprint`)throw new wo(`format`,`must be "cad-blueprint", got ${String(n.format)}`);if(n.version!==1)throw new wo(`version`,`unsupported version ${String(n.version)}`);let r=ht.fromJSON(n.fonts),i=kt.fromJSON(r,n.textStyles),a=hn.fromJSON(i,n.dimStyles),o=n.sheets;if(!Array.isArray(o))throw new wo(`sheets`,`must be an array`);let s=o.map((e,t)=>{if(typeof e!=`object`||!e)throw new wo(`sheets[${t}]`,`must be an object`);let n=e;return new Eo(String(n.id),String(n.name),xo(n.entities,`sheets[${t}].entities`))});return e.fromParts({settings:x(n.settings),dimStyles:a,layers:ye.fromJSON(n.layers),blocks:So.fromJSON(n.blocks),sheets:s})}};function Oo(e={}){let t=y({annotationScale:`auto`,...e.settings}),n=e.dimStyles??new hn(e.textStyles??new kt(e.fonts??new ht));return Object.freeze({drawing:S(t),layers:e.layers??new ye,fonts:n.textStyles.fonts,textStyles:n.textStyles,dimStyles:n,blocks:e.blocks??new So})}function ko(e,t){let n=go(t,e.drawing);return n===e.drawing?e:Object.freeze({...e,drawing:n})}function Ao(e,t){return t!==null&&e.toLowerCase()===`0`?t:e}function jo(e,t){return e.layers.get(t)??e.layers.require(`0`)}function Mo(e,t,n,r={}){let i=r.visibleOnly??!1,a=(e,t,r)=>{for(let o of e){let e=Ao(o.layer,t.inheritedLayer),s=jo(t.ctx,e);if(!i||s.visible){if(o.type===`insert`){let i=t.ctx.blocks.get(o.block);if(!i)throw new Ja(o.block,`block is not defined (inserted at `+JSON.stringify(o.position)+`)`);if(r.length>=32||r.includes(i.name.toLowerCase()))throw new Ja(i.name,`circular or too deep block nesting`);if(n.insert?.(o,i,s,t)===!1)continue;let c=Wn(t.matrix,lo(o,i));a(i.entities,{matrix:c,ctx:t.ctx,inheritedLayer:e,depth:t.depth+1},[...r,i.name.toLowerCase()])}else if(o.type===`viewport`){if(n.viewport?.(o,s,t)===!1)continue;if(t.depth>=32)throw new Ja(`viewport`,`too deep nesting`);let e=Wn(t.matrix,ho(o,t.ctx.drawing));a(o.entities,{matrix:e,ctx:ko(t.ctx,o),inheritedLayer:t.inheritedLayer,depth:t.depth+1},r)}else eo(o)?n.dimension?.(o,s,t):n.primitive?.(o,s,t)}}};a(e,{matrix:r.matrix??Bn,ctx:t,inheritedLayer:r.inheritedLayer??null,depth:0},[])}function No(e,t){return t===null?e.textStyles.current:e.textStyles.get(t)??e.textStyles.require(`Standard`)}function Po(e,t){let n=No(t,e.style),r=e.height??n.height,i=Ft(e.value,n,t.fonts,t.drawing,{anchor:e.anchor,paperHeight:r}),a=It(i,{rotationDeg:e.rotationDeg}),o=t.drawing.settings.coordinateSystem===`screen`?-1:1,[s,c]=e.position;return{style:n,layout:i,paperHeight:r,corners:a.corners.map(e=>[s+e[0],c+o*e[1]])}}function Fo(e,t){return{center:Kn(t,e.center),u:qn(t,e.u),v:qn(t,e.v),t0:e.t0,sweep:e.sweep}}function Io(e,t,n,r){for(let i of Ui(e,t))i.type===`line`?(r.addPoint(Kn(n,i.from)),r.addPoint(Kn(n,i.to))):sr(Fo(Yi(i),n),r);if(e.length===1){let t=e[0];r.addPoint(Kn(n,[t[0],t[1]]))}}function Lo(e,t,n=Bn,r=new er){switch(e.type){case`point`:return r.addPoint(Kn(n,e.position));case`line`:return r.addPoint(Kn(n,e.from)).addPoint(Kn(n,e.to));case`circle`:return sr(Fo(Gi(e),n),r);case`arc`:return sr(Fo(qi(e),n),r);case`ellipse`:return sr(Fo(Ji(e),n),r);case`rect`:return Io(Wi(e),!0,n,r),r;case`polyline`:return Io(e.vertices,e.closed,n,r),r;case`text`:case`mtext`:for(let i of Po(e,t).corners)r.addPoint(Kn(n,i));return r;case`spline`:{let t=e.controlPoints.map(e=>Kn(n,e));for(let n of mr(e.degree,t,e.knots))ur(n,r);return r}case`bezier`:{let t=e.points.map(e=>Kn(n,e));for(let e=0;e+3<t.length;e+=3)ur(t.slice(e,e+4),r);return r}}}function Ro(e,t=Bn,n=new er){for(let r of e.curves)if(r.kind===`line`)n.addPoint(Kn(t,r.from)).addPoint(Kn(t,r.to));else{let e=(((r.counterclockwise?r.endAngleDeg-r.startAngleDeg:r.startAngleDeg-r.endAngleDeg)%360+360)%360||360)*(Math.PI/180);sr(Fo({center:r.center,u:[r.radius,0],v:[0,r.radius],t0:r.startAngleDeg*Math.PI/180,sweep:r.counterclockwise?e:-e},t),n)}let r=e.metrics.terminator;for(let i of e.terminators){let[e,a]=Rn(i.angleDeg),o=n=>Kn(t,[i.tip[0]+n[0]*e-n[1]*a,i.tip[1]+n[0]*a+n[1]*e]);for(let e of r.shapes)if(e.kind===`line`)n.addPoint(o(e.from)).addPoint(o(e.to));else if(e.kind===`circle`)sr({center:Kn(t,[i.tip[0]+e.center[0],i.tip[1]+e.center[1]]),u:qn(t,[e.radius,0]),v:qn(t,[0,e.radius]),t0:0,sweep:Math.PI*2},n);else for(let t of e.points)n.addPoint(o(t))}for(let r of e.texts)for(let e of r.corners)n.addPoint(Kn(t,e));return n}function zo(e,t,n){if(e.title===null||$n(n))return null;let r=t.drawing.annotationToModel(3),i=t.drawing.settings.coordinateSystem===`screen`;return Si({position:[(n.minX+n.maxX)/2,i?n.minY-r:n.maxY+r],value:e.title,anchor:`bottom-center`,height:5,layer:e.layer})}function Bo(e,t,n=Bn,r={}){let i=Wn(n,ho(e,t.drawing));if(e.clip){let t=new er;for(let n of rr(e.clip))t.addPoint(Kn(i,n));return t.build()}return Vo(e.entities,ko(t,e),{...r,matrix:i})}function Vo(e,t,n={}){let r=new er;return Mo(e,t,{primitive:(e,t,n)=>{Lo(e,n.ctx,n.matrix,r)},dimension:(e,t,n)=>{Ro(Ga(e,n.ctx),n.matrix,r)},viewport:(e,t,i)=>{let a=Bo(e,i.ctx,Bn,n),o=zo(e,i.ctx,a);return e.clip?(r.addBounds(Bo(e,i.ctx,i.matrix,n)),o&&Lo(o,i.ctx,i.matrix,r),!1):(o&&Lo(o,i.ctx,i.matrix,r),!0)}},{visibleOnly:n.visibleOnly??!1,matrix:n.matrix??Bn}),r.build()}function Ho(e,t){if(!Number.isFinite(e))return`0`;let n=e.toFixed(t),r=n.includes(`.`)?n.replace(/0+$/,``).replace(/\.$/,``):n;return r===`-0`?`0`:r}function Uo(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function Wo(e){return Uo(e).replace(/"/g,`&quot;`)}function Go(e,t){let n=Math.max(t,6);return`matrix(${Ho(e[0],n)} ${Ho(e[1],n)} ${Ho(e[2],n)} ${Ho(e[3],n)} ${Ho(e[4],t)} ${Ho(e[5],t)})`}function Ko(e){let t=``;for(let[n,r]of Object.entries(e))r!=null&&r!==``&&(t+=` ${n}="${Wo(String(r))}"`);return t}var qo=/^[A-Za-z][A-Za-z0-9_-]{0,31}$/,Jo=[1,0,0,1];function Yo(e,t){return[e[0]*t[0]+e[2]*t[1],e[1]*t[0]+e[3]*t[1],e[0]*t[2]+e[2]*t[3],e[1]*t[2]+e[3]*t[3]]}var Xo=e=>[e[0],e[1],e[2],e[3]],Zo=e=>e[0]*e[3]-e[1]*e[2]<0,Qo={left:`right`,right:`left`,center:`center`},$o={top:`bottom`,bottom:`top`,middle:`middle`},es=class{root;options;precision;flip;prefix;styleRules=[];styleClasses=new Map;layerIndex=new Map;layerClasses=new Map;defs=[];defIds=new Map;fontsUsed=new Set;textClasses=new Map;counter=0;constructor(e,t){if(this.root=e,this.options=t,this.precision=t.precision??e.drawing.settings.precision,this.flip=e.drawing.settings.coordinateSystem===`cartesian`,this.prefix=t.idPrefix??`cad`,!qo.test(this.prefix))throw new Ja(`idPrefix`,`must match ${String(qo)}`);e.layers.list().forEach((e,t)=>this.layerIndex.set(e.name.toLowerCase(),t))}n(e){return Ho(e,this.precision)}p(e){return`${this.n(e[0])} ${this.n(this.flip?-e[1]:e[1])}`}y(e){return this.flip?-e:e}svgMatrix(e){if(!this.flip)return e;let t=Un(1,-1);return Gn(t,e,t)}nextId(e){return this.counter+=1,`${this.prefix}-${e}${this.counter}`}layerIdx(e){let t=e.name.toLowerCase(),n=this.layerIndex.get(t);return n===void 0&&(n=this.layerIndex.size,this.layerIndex.set(t,n)),n}visibilityClass(e){let t=`${this.prefix}-L${this.layerIdx(e)}`;return this.layerClasses.has(e.name)||(this.layerClasses.set(e.name,t),e.visible||this.styleRules.push(`.${t}{display:none}`)),t}dash(e,t){let n=P(e);return n.length===0?null:n.map(e=>this.n(e*t)).join(` `)}styleClass(e,t){let n=`${e.name.toLowerCase()}|${t.unitsPerMm.toPrecision(9)}`,r=this.styleClasses.get(n);if(r)return r;r=`${this.prefix}-s${this.styleClasses.size}`,this.styleClasses.set(n,r);let i=this.dash(e.lineType,t.unitsPerMm),a=[`stroke:${e.color}`,`stroke-width:${this.n(Math.max(e.lineWeight,.05)*t.unitsPerMm)}`,`fill:none`,`stroke-linecap:round`,`stroke-linejoin:round`,`stroke-dasharray:${i??`none`}`,`opacity:${e.opacity}`].filter(Boolean);return this.styleRules.push(`.${r}{${a.join(`;`)}}`,`text.${r}{fill:${e.color};stroke:none}`),r}textClass(e){let t=this.textClasses.get(e.toLowerCase());return t||(t=`${this.prefix}-f${this.textClasses.size}`,this.textClasses.set(e.toLowerCase(),t),this.fontsUsed.add(e),this.styleRules.push(`.${t}{font-family:${this.root.fonts.getCssFontFamily(e)};white-space:pre}`),t)}def(e,t,n){let r=this.defIds.get(e);if(r)return r;let i=this.nextId(t);return this.defIds.set(e,i),this.defs.push(n(i)),i}marker(e,t,n,r){if(e.shapes.length===0)return null;let i=`mk|${e.type}|${e.extent.toPrecision(9)}|${r}|${t}|${n.toPrecision(6)}`;return this.def(i,`mk`,r=>{let i=e=>`${this.n(e[0])} ${this.n(-e[1])}`;return`<marker id="${r}" markerUnits="userSpaceOnUse" orient="auto-start-reverse" overflow="visible" refX="0" refY="0" markerWidth="1" markerHeight="1">${e.shapes.map(e=>{switch(e.kind){case`polygon`:return`<path d="M${e.points.map(i).join(` L`)} Z" fill="${t}" stroke="${t}" stroke-width="${this.n(n)}" stroke-linejoin="miter"/>`;case`polyline`:return`<path d="M${e.points.map(i).join(` L`)}" fill="none" stroke="${t}" stroke-width="${this.n(n)}"/>`;case`line`:return`<path d="M${i(e.from)} L${i(e.to)}" fill="none" stroke="${t}" stroke-width="${this.n(n*1.5)}" stroke-linecap="butt"/>`;case`circle`:return`<circle cx="${this.n(e.center[0])}" cy="${this.n(-e.center[1])}" r="${this.n(e.radius)}" fill="${e.fill?t:`none`}" stroke="${t}" stroke-width="${this.n(n)}"/>`}}).join(``)}</marker>`})}hatchPattern(e,t,n){let r=`hp|${JSON.stringify(e)}|${t}|${n.toPrecision(9)}`;return this.def(r,`hp`,r=>{let i=e.spacing*n,a=e.dash.reduce((e,t)=>e+t,0)*n,o=a>0?a:i,s=Math.max(e.lineWidth,.05)*n,c=e.offset===0?``:` skewX(${Ho(Math.atan2(e.offset,e.spacing)*180/Math.PI,6)})`,l=e.dash.length>0?` stroke-dasharray="${e.dash.map(e=>this.n(e*n)).join(` `)}"`:``;return`<pattern id="${r}" patternUnits="userSpaceOnUse" width="${this.n(o)}" height="${this.n(i)}" patternTransform="rotate(${Ho(-e.angle,6)})${c}"><path d="M0 ${this.n(i/2)} H${this.n(o)}" stroke="${t}" stroke-width="${this.n(s)}"${l}/></pattern>`})}addDef(e){this.defs.push(e)}buildStyle(){let e=this.options.embedFonts===!1||this.fontsUsed.size===0?``:this.root.fonts.buildFontFaceCss([...this.fontsUsed]);return`<style>${e}${e?`
`:``}${this.styleRules.join(`
`)}</style>`}buildDefs(){return this.defs.length===0?``:`<defs>${this.defs.join(``)}</defs>`}};function ts(e,t,n){let r=Ui(t,n);if(r.length===0)return``;let i=`M${e.p(r[0].from)}`;for(let t of r)if(t.type===`line`)i+=` L${e.p(t.to)}`;else{let n=+(t.sweepDeg>180),r=e.flip?!t.counterclockwise:t.counterclockwise;i+=` A${e.n(t.radius)} ${e.n(t.radius)} 0 ${n} ${+!!r} ${e.p(t.to)}`}return n?`${i} Z`:i}function ns(e,t,n,r,i,a){let o=Rn(r),s=Rn(i),c=[t[0]+o[0]*n,t[1]+o[1]*n],l=[t[0]+s[0]*n,t[1]+s[1]*n],u=a?i-r:r-i;u=(u%360+360)%360||360;let d=e.flip?!a:a;if(u>=360-1e-9){let r=[t[0]-o[0]*n,t[1]-o[1]*n];return`M${e.p(c)} A${e.n(n)} ${e.n(n)} 0 0 ${+!!d} ${e.p(r)} A${e.n(n)} ${e.n(n)} 0 0 ${+!!d} ${e.p(c)}`}return`M${e.p(c)} A${e.n(n)} ${e.n(n)} 0 ${+(u>180)} ${+!!d} ${e.p(l)}`}function rs(e,t){switch(t.type){case`circle`:return ns(e,t.center,t.radius,0,360,!0);case`rect`:return ts(e,Wi(t),!0);case`polyline`:return t.closed?[ts(e,t.vertices,!0),...t.holes.map(t=>ts(e,t,!0))].join(` `):null;case`ellipse`:return hi(t)?is(e,t.center,t.radiusX,t.radiusY,t.rotationDeg,0,360):null;default:return null}}function is(e,t,n,r,i,a,o){let[s,c]=Rn(i),l=e=>{let[i,a]=Rn(e);return[t[0]+s*n*i-c*r*a,t[1]+c*n*i+s*r*a]},u=e.flip?-i:i,d=+!e.flip,f=o-a;return f>=360-1e-9?`M${e.p(l(a))} A${e.n(n)} ${e.n(r)} ${Ho(u,6)} 0 ${d} ${e.p(l(a+180))} A${e.n(n)} ${e.n(r)} ${Ho(u,6)} 0 ${d} ${e.p(l(a))} Z`:`M${e.p(l(a))} A${e.n(n)} ${e.n(r)} ${Ho(u,6)} ${+(f>180)} ${d} ${e.p(l(o))}`}function as(e,t){switch(t.type){case`line`:return`M${e.p(t.from)} L${e.p(t.to)}`;case`arc`:return ns(e,t.center,t.radius,t.startAngleDeg,t.endAngleDeg,t.counterclockwise);case`ellipse`:return is(e,t.center,t.radiusX,t.radiusY,t.rotationDeg,t.startAngleDeg,t.endAngleDeg);case`polyline`:return[ts(e,t.vertices,t.closed),...t.holes.map(t=>ts(e,t,!0))].join(` `);case`spline`:{let n=mr(t.degree,t.controlPoints,t.knots);if(n.length===0)return``;let r=`M${e.p(n[0][0])}`;for(let t of n)t.length===2?r+=` L${e.p(t[1])}`:t.length===3?r+=` Q${e.p(t[1])} ${e.p(t[2])}`:r+=` C${e.p(t[1])} ${e.p(t[2])} ${e.p(t[3])}`;return r}case`bezier`:{let n=`M${e.p(t.points[0])}`;for(let r=1;r+2<t.points.length;r+=3)n+=` C${e.p(t.points[r])} ${e.p(t.points[r+1])} ${e.p(t.points[r+2])}`;return n}default:return rs(e,t)??``}}function os(e,t,n,r,i,a={}){let o={};t.color!==null&&(o.stroke=t.color),t.lineWeight!==null&&(o[`stroke-width`]=e.n(Math.max(t.lineWeight,.05)*r.unitsPerMm)),t.lineType!==null&&(o[`stroke-dasharray`]=e.dash(t.lineType,r.unitsPerMm)??`none`),Object.assign(o,a);let s={class:i,style:Object.entries(o).filter(([,e])=>e!==void 0).map(([e,t])=>`${e}:${t}`).join(`;`)||void 0};return e.options.dataAttributes!==!1&&(t.id!==null&&(s[`data-id`]=t.id),s[`data-layer`]=n.name),s}function ss(e,t,n,r,i,a){if(n===null)return``;let o=t.color??r.color;if(n===`solid`)return`<path d="${a}" fill="${o}" stroke="none" fill-rule="evenodd"/>`;if(n!==`hatch`)return`<path d="${a}" fill="${n}" stroke="none" fill-rule="evenodd"/>`;if(!r.hatch)return``;let s=ce(r.hatch,o),c=s.background?`<path d="${a}" fill="${s.background}" stroke="none" fill-rule="evenodd"/>`:``;for(let t of s.families){let n=e.hatchPattern(t,t.color??o,i.unitsPerMm);c+=`<path d="${a}" fill="url(#${n})" stroke="none" fill-rule="evenodd"/>`}return c}function cs(e,t,n,r,i){let a=t,o=``;if(Zo(r.linear)){let e=-a.rotationDeg*Math.PI/180,t=Yo(r.linear,[Math.cos(e),Math.sin(e),-Math.sin(e),Math.cos(e)]),[n,i]=a.anchor.split(`-`);-t[0]>=-1e-9?(o=` scale(-1 1)`,a={...a,anchor:`${n}-${Qo[i]??i}`}):(o=` scale(1 -1)`,a={...a,anchor:`${$o[n]??n}-${i}`})}let s=Po(a,r.ctx),c=r.ctx.fonts.require(s.style.fontFamily),l=s.layout.fontHeight*c.metrics.unitsPerEm/c.metrics.capHeight,u=a.anchor.split(`-`)[1],d=u===`left`?`start`:u===`center`?`middle`:`end`,f=s.style.widthFactor,p=`translate(${e.p(a.position)})`+(a.rotationDeg===0?``:` rotate(${Ho(-a.rotationDeg,6)})`)+o+(s.style.obliqueAngle===0?``:` skewX(${Ho(-s.style.obliqueAngle,6)})`)+(f===1?``:` scale(${Ho(f,6)} 1)`),m=os(e,{...a,color:null,lineWeight:null,lineType:null},n,r,`${i} ${e.textClass(s.style.fontFamily)}`,a.color===null?{}:{fill:a.color}),h=s.style.letterSpacing===0?void 0:e.n(s.style.letterSpacing*s.layout.fontHeight),g=s.layout.lines,_=g.length===1?Uo(g[0].text):g.map(t=>`<tspan x="0" y="${e.n(-t.baselineY)}">${Uo(t.text)}</tspan>`).join(``),v=g.length===1?e.n(-g[0].baselineY):void 0;return`<text${Ko({...m,x:`0`,y:v,transform:p,"font-size":e.n(l),"text-anchor":d,"letter-spacing":h})}>${_}</text>`}function ls(e,t){if(t<=0||e.kind!==`line`)return e;let n=e.to[0]-e.from[0],r=e.to[1]-e.from[1],i=Math.hypot(n,r),a=n/i,o=r/i,s=e.startTerminator?Math.min(t,i/2):0,c=e.endTerminator?Math.min(t,i/2):0;return{...e,from:[e.from[0]+a*s,e.from[1]+o*s],to:[e.to[0]-a*c,e.to[1]-o*c]}}function us(e,t,n,r,i){let a=Ga(t,r.ctx),o=a.style,s=t.color??o.lineColor??n.color,c=t.color??o.textColor??n.color,l=(t.lineWeight??o.lineWeight??n.lineWeight)*r.unitsPerMm,u=e.marker(a.metrics.terminator,s,Math.max(l,.01),o.arrowAngle),d={};(t.color!==null||o.lineColor!==null)&&(d.stroke=s),(t.lineWeight!==null||o.lineWeight!==null)&&(d[`stroke-width`]=e.n(Math.max(l,.01)));let f=`<g${Ko(os(e,{...t,color:null,lineWeight:null},n,r,i,d))}>`;for(let t of a.curves){let n=ls(t,a.metrics.terminator.lineTrim),r=n.kind===`line`?`M${e.p(n.from)} L${e.p(n.to)}`:ns(e,n.center,n.radius,n.startAngleDeg,n.endAngleDeg,n.counterclockwise),i=u&&n.startTerminator?` marker-start="url(#${u})"`:``,o=u&&n.endTerminator?` marker-end="url(#${u})"`:``;f+=`<path d="${r}"${i}${o}/>`}for(let o of a.texts){let a=Object.freeze({type:`text`,id:null,layer:t.layer,color:c===n.color?null:c,lineWeight:null,lineType:null,position:o.position,value:o.text,style:o.textStyle,height:o.paperHeight,rotationDeg:o.rotationDeg,anchor:o.anchor});f+=cs(e,a.value.includes(`
`)?{...a,type:`mtext`}:a,n,r,i)}return`${f}</g>`}function ds(e,t,n,r,i){if(t.type===`text`||t.type===`mtext`)return cs(e,t,n,r,i);if(t.type===`point`){let a=.5*r.unitsPerMm,[o,s]=[t.position[0],e.y(t.position[1])];return`<circle${Ko({...os(e,{...t,color:null},n,r,i,{fill:t.color??n.color,stroke:`none`}),cx:e.n(o),cy:e.n(s),r:e.n(a)})}/>`}let a=``;if(`fill`in t&&t.fill!==null){let i=rs(e,t);i&&(a+=ss(e,t,t.fill,n,r,i))}let o=os(e,t,n,r,i);if(t.type===`rect`&&t.cornerRadius===0){let n=e.flip?-(t.y+t.height):t.y;a+=`<rect${Ko({...o,x:e.n(t.x),y:e.n(n),width:e.n(t.width),height:e.n(t.height)})}/>`}else if(t.type===`circle`)a+=`<circle${Ko({...o,cx:e.n(t.center[0]),cy:e.n(e.y(t.center[1])),r:e.n(t.radius)})}/>`;else{let n=as(e,t);n&&(a+=`<path${Ko({...o,d:n,"fill-rule":t.type===`polyline`&&t.holes.length>0?`evenodd`:void 0})}/>`)}return a}function fs(e,t,n){let r=``;for(let i of t){let t=Ao(i.layer,n.inheritedLayer),a=jo(n.ctx,t);if(!a.visible&&e.options.hiddenLayers!==`hide`)continue;let o=`${e.visibilityClass(a)} ${e.styleClass(a,n)}`;i.type===`insert`?r+=ps(e,i,a,t,n,o):i.type===`viewport`?r+=ms(e,i,a,n,o):eo(i)?r+=us(e,i,a,n,o):r+=ds(e,i,a,n,o)}return r}function ps(e,t,n,r,i,a){let o=i.ctx.blocks.get(t.block);if(!o)throw new Ja(t.block,`block is not defined`);let s=o.name.toLowerCase();if(i.stack.includes(s)||i.depth>=32)throw new Ja(o.name,`circular or too deep block nesting`);let c=Math.abs(t.scaleX*t.scaleY),l=e.svgMatrix(lo(t,o)),u={ctx:i.ctx,linear:Yo(i.linear,Xo(l)),unitsPerMm:i.unitsPerMm/Math.sqrt(c),inheritedLayer:r,depth:i.depth+1,stack:[...i.stack,s]},d=Zo(u.linear)?`|m${u.linear.map(e=>e.toPrecision(6)).join(`,`)}`:``,f=`sym|${s}|${u.unitsPerMm.toPrecision(9)}|${r.toLowerCase()}|${i.ctx.drawing.annotationFactor}${d}`,p={class:a,href:`#${e.def(f,`b`,t=>`<symbol id="${t}" overflow="visible" data-block="${Wo(o.name)}">${fs(e,o.entities,u)}</symbol>`)}`,transform:Go(l,e.precision)};return e.options.dataAttributes!==!1&&(t.id!==null&&(p[`data-id`]=t.id),p[`data-layer`]=n.name),`<use${Ko(p)}/>`}function ms(e,t,n,r,i){if(r.depth>=32)throw new Ja(`viewport`,`too deep nesting`);let a=ko(r.ctx,t),o=ho(t,r.ctx.drawing),s=Math.sqrt(Math.abs(Jn(o))),c={ctx:a,linear:Yo(r.linear,Xo(e.svgMatrix(o))),unitsPerMm:r.unitsPerMm/s,inheritedLayer:r.inheritedLayer,depth:r.depth+1,stack:r.stack},l=fs(e,t.entities,c);if(t.clip){let r=e.nextId(`clip`),i=t.clip,a=e.flip?-i.maxY:i.minY;if(e.addDef(`<clipPath id="${r}"><rect x="${e.n(i.minX)}" y="${e.n(a)}" width="${e.n(i.maxX-i.minX)}" height="${e.n(i.maxY-i.minY)}"/></clipPath>`),l=`<g clip-path="url(#${r})">${l}</g>`,t.frame){let t=`${e.visibilityClass(n)} ${e.styleClass(n,c)}`;l+=`<rect class="${t}" x="${e.n(i.minX)}" y="${e.n(a)}" width="${e.n(i.maxX-i.minX)}" height="${e.n(i.maxY-i.minY)}"/>`}}let u={transform:Go(e.svgMatrix(o),e.precision)};e.options.dataAttributes!==!1&&t.id!==null&&(u[`data-id`]=t.id);let d=`<g${Ko(u)}>${l}</g>`,f=zo(t,r.ctx,Bo(t,r.ctx));return f&&(d+=ds(e,f,n,r,i)),d}function hs(e,t,n={}){let r=new es(t,n),i=fs(r,e,{ctx:t,linear:Jo,unitsPerMm:t.drawing.paperMmToModel(1),inheritedLayer:null,depth:0,stack:[]}),a=n.bounds??Vo(e,t,{visibleOnly:n.hiddenLayers!==`hide`});$n(a)&&(a={minX:0,minY:0,maxX:1,maxY:1}),n.padding!==!1&&(a=nr(a,t.drawing.paddingInModelUnits()));let o=Math.max(a.maxX-a.minX,1e-9),s=Math.max(a.maxY-a.minY,1e-9),c={x:a.minX,y:r.flip?-a.maxY:a.minY,width:o,height:s},l=n.size??`paper`,u=``;if(l===`paper`)u=` width="${Ho(t.drawing.modelToPaperMm(o),3)}mm" height="${Ho(t.drawing.modelToPaperMm(s),3)}mm"`;else if(l!==`none`){let e=`width`in l?{w:l.width,h:l.width*s/o}:{w:l.height*o/s,h:l.height};u=` width="${Ho(e.w,2)}" height="${Ho(e.h,2)}"`}let d=`${r.n(c.x)} ${r.n(c.y)} ${r.n(c.width)} ${r.n(c.height)}`,f=n.background?`<rect class="${r.prefix}-paper cad-paper" x="${r.n(c.x)}" y="${r.n(c.y)}" width="${r.n(c.width)}" height="${r.n(c.height)}" fill="${Wo(n.background)}"/>`:``,p=n.title?`<title>${Uo(n.title)}</title>`:``;return{svg:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${d}"${u} class="${r.prefix}">${p}${r.buildStyle()}${r.buildDefs()}${f}<g class="${r.prefix}-content">${i}</g></svg>`,viewBox:c,bounds:a,layerClasses:r.layerClasses,idPrefix:r.prefix}}function gs(e){let t=``;for(let n of e){let e=n.codePointAt(0);if(e>=32&&e<127)t+=n;else if(e<=65535)t+=`\\U+${e.toString(16).toUpperCase().padStart(4,`0`)}`;else{let n=Math.floor((e-65536)/1024)+55296,r=(e-65536)%1024+56320;t+=`\\U+${n.toString(16).toUpperCase()}\\U+${r.toString(16).toUpperCase()}`}}return t}function _s(e){return e.replace(/\\U\+([0-9A-Fa-f]{4})/g,(e,t)=>String.fromCharCode(parseInt(t,16)))}function vs(e){return gs(e.replace(/\\/g,`\\\\`).replace(/\{/g,`\\{`).replace(/\}/g,`\\}`).replace(/\t/g,`^I`).replace(/\n/g,`\\P`))}function ys(e){return e.replace(/%/g,`%%%`)}function bs(e){return gs(ys(e))}function xs(e){let t=_s(e);return t=t.replace(/\\P/g,`
`).replace(/\^I/g,`	`),t=t.replace(/\\[ACcFfHhQqTtWw][^;\\{}]*;/g,``),t=t.replace(/\\[LlOoKk]/g,``),t=t.replace(/\\S([^;]*)\^([^;]*);/g,`$1/$2`),t=t.replace(/\\~/g,` `),t=t.replace(/(?<!\\)[{}]/g,``),t=t.replace(/\\([\\{}])/g,`$1`),t}function Ss(e){let t={"%":`%`,d:`°`,c:`Ø`,p:`±`,u:``,o:``};return _s(e).replace(/%%([%dDcCpPuUoO])/g,(e,n)=>t[n.toLowerCase()]??``)}var Cs=180/Math.PI;function ws(e){return e.replace(/\\/g,`\\\\`).replace(/\{/g,`\\{`).replace(/\}/g,`\\}`).replace(/\t/g,`^I`).replace(/\n/g,`\\P`)}function Ts(e,t){if(!Number.isFinite(e))return`0`;let n=e.toFixed(t),r=n.includes(`.`)?n.replace(/0+$/,``).replace(/\.$/,``):n;return r===`-0`?`0`:r}var Es=class{root;utf8;out=[];handle=32;precision;flip;lineTypes=new Map;blocks=[];blockNames=new Map;pending=[];vpCounter=0;tableOwner=`0`;constructor(e,t,n){this.root=e,this.utf8=n,this.precision=t,this.flip=e.drawing.settings.coordinateSystem===`screen`}newHandle(){return this.handle+=1,this.handle.toString(16).toUpperCase()}get handseed(){return(this.handle+1).toString(16).toUpperCase()}str(e){return this.utf8?e:gs(e)}text(e){return this.utf8?ys(e):bs(e)}mtext(e){return this.utf8?ws(e):vs(e)}tag(e,t){this.out.push(String(e),typeof t==`number`?this.num(t):t)}num(e){return Ts(e,this.precision)}P(e){return this.flip?[e[0],e[1]===0?0:-e[1]]:e}point(e,t,n=!0){let r=this.P(t);this.tag(e,r[0]),this.tag(e+10,r[1]),n&&this.tag(e+20,0)}A(e){return this.flip?-e:e}take(){let e=this.out;return this.out=[],e}pushRaw(e){this.out.push(...e)}registerLineType(e){let t=te(e);return t!==`CONTINUOUS`&&!this.lineTypes.has(t)&&this.lineTypes.set(t,e),t===`CONTINUOUS`?`Continuous`:t}blockFor(e,t){let n=t.ctx.drawing.annotationFactor,r=`${e.name.toLowerCase()}|${n}|${t.ltScale}`,i=this.blockNames.get(r);if(i)return i;let a=[...this.blockNames.keys()].filter(t=>t.startsWith(`${e.name.toLowerCase()}|`)).length;return i=a===0?e.name:`${e.name}$A${a}`,this.blockNames.set(r,i),this.pending.push({name:i,basePoint:e.basePoint,entities:e.entities,space:t,record:this.newHandle()}),i}viewportBlock(e,t,n){this.vpCounter+=1;let r=`_VIEWPORT${this.vpCounter}`;return this.pending.push({name:r,basePoint:t,entities:e,space:n,record:this.newHandle()}),r}flushBlocks(e){for(;this.pending.length>0;){let t=this.pending.shift(),n=this.take();e(t.entities,{...t.space,owner:t.record});let r=this.take();this.pushRaw(n),this.blocks.push({name:t.name,record:t.record,basePoint:t.basePoint,body:r})}}get blockList(){return this.blocks}};function Ds(e,t,n,r,i,a,o){e.tag(0,t),e.tag(5,e.newHandle()),e.tag(330,n),e.tag(100,`AcDbEntity`),e.tag(8,e.str(r)),i.lineType!==null&&e.tag(6,e.str(e.registerLineType(i.lineType))),i.color!==null&&(e.tag(62,k(i.color)),e.utf8&&e.tag(420,parseInt(i.color.slice(1),16))),i.lineWeight!==null&&e.tag(370,R(i.lineWeight)),a.ltScale!==1&&e.tag(48,a.ltScale),e.tag(100,o)}function Os(e,t,n,r,i,a){Ds(e,`LINE`,t.owner,n,r,t,`AcDbLine`),e.point(10,i),e.point(11,a)}function ks(e,t,n,r,i,a,o,s,c){let l=e.A(o),u=e.A(s),d=e.flip?!c:c;d||=([l,u]=[u,l],!0),Ds(e,`ARC`,t.owner,n,r,t,`AcDbCircle`),e.point(10,i),e.tag(40,a),e.tag(100,`AcDbArc`),e.tag(50,(l%360+360)%360),e.tag(51,(u%360+360)%360)}function As(e,t,n,r,i,a){Ds(e,`CIRCLE`,t.owner,n,r,t,`AcDbCircle`),e.point(10,i),e.tag(40,a)}function js(e,t){return t.map(t=>{let[n,r]=e.P([t[0],t[1]]),i=t[2]??0;return i===0?[n,r]:[n,r,e.flip?-i:i]})}function Ms(e,t,n,r,i,a,o=0){Ds(e,`LWPOLYLINE`,t.owner,n,r,t,`AcDbPolyline`),e.tag(90,i.length),e.tag(70,+!!a),o>0&&e.tag(43,o);for(let t of js(e,i))e.tag(10,t[0]),e.tag(20,t[1]),t[2]!==void 0&&t[2]!==0&&e.tag(42,t[2])}function Ns(e,t,n,r,i){let a=i.radiusX>=i.radiusY,o=i.rotationDeg+(a?0:90),s=a?i.radiusX:i.radiusY,c=a?i.radiusY/i.radiusX:i.radiusX/i.radiusY,l=a?0:90,u=i.startAngleDeg-l,d=i.endAngleDeg-l,[f,p]=Rn(o),m=[f*s,p*s];e.flip&&(m=[m[0],-m[1]],[u,d]=[-d,-u]),Ds(e,`ELLIPSE`,t.owner,n,r,t,`AcDbEllipse`),e.point(10,i.center),e.tag(11,m[0]),e.tag(21,m[1]),e.tag(31,0),e.tag(40,c);let h=hi(i);e.tag(41,h?0:u/Cs),e.tag(42,h?Math.PI*2:d/Cs)}function Ps(e,t,n,r,i,a,o){Ds(e,`SPLINE`,t.owner,n,r,t,`AcDbSpline`),e.tag(210,0),e.tag(220,0),e.tag(230,1),e.tag(70,8),e.tag(71,i),e.tag(72,o.length),e.tag(73,a.length),e.tag(74,0),e.tag(42,1e-10),e.tag(43,1e-10);for(let t of o)e.tag(40,t);for(let t of a)e.point(10,t)}var Fs={left:0,center:1,right:2},Is={bottom:0,middle:2,top:3},Ls={"top-left":1,"top-center":2,"top-right":3,"middle-left":4,"middle-center":5,"middle-right":6,"bottom-left":7,"bottom-center":8,"bottom-right":9};function Rs(e,t,n,r,i){let a=Po(i,t.ctx),o=a.layout.fontHeight,s=i.type===`mtext`||i.value.includes(`
`),c=e.str(a.style.name),l={color:r.color,lineWeight:null,lineType:null};if(!s){let[r,s]=i.anchor.split(`-`);Ds(e,`TEXT`,t.owner,n,l,t,`AcDbText`),e.point(10,i.position),e.tag(40,o),e.tag(1,e.text(i.value)),i.rotationDeg!==0&&e.tag(50,i.rotationDeg),a.style.widthFactor!==1&&e.tag(41,a.style.widthFactor),a.style.obliqueAngle!==0&&e.tag(51,a.style.obliqueAngle),e.tag(7,c);let u=Fs[s]??0,d=Is[r]??0;u!==0&&e.tag(72,u),(u!==0||d!==0)&&e.point(11,i.position),e.tag(100,`AcDbText`),d!==0&&e.tag(73,d);return}Ds(e,`MTEXT`,t.owner,n,l,t,`AcDbMText`),e.point(10,i.position),e.tag(40,o),e.tag(41,0),e.tag(71,Ls[i.anchor]),e.tag(72,1);let u=e.mtext(i.value);for(let t=0;t+250<u.length;t+=250)e.tag(3,u.slice(t,t+250));e.tag(1,u.slice(Math.floor(Math.max(0,u.length-1)/250)*250)),e.tag(7,c);let[d,f]=Rn(i.rotationDeg);e.tag(11,d),e.tag(21,f),e.tag(31,0),e.tag(73,2),e.tag(44,Math.min(4,Math.max(.25,a.style.lineHeight/(5/3))))}function zs(e){switch(e.type){case`circle`:return[{kind:`circle`,center:e.center,radius:e.radius}];case`rect`:return[{kind:`poly`,vertices:Wi(e)}];case`polyline`:return e.closed?[{kind:`poly`,vertices:e.vertices},...e.holes.map(e=>({kind:`poly`,vertices:e}))]:null;case`ellipse`:return hi(e)?[{kind:`ellipse`,e}]:null;default:return null}}function Bs(e,t,n,r,i,a){if(Ds(e,`HATCH`,t.owner,n,{color:r,lineWeight:null,lineType:null},t,`AcDbHatch`),e.tag(10,0),e.tag(20,0),e.tag(30,0),e.tag(210,0),e.tag(220,0),e.tag(230,1),e.tag(2,a.solid?`SOLID`:a.families.length===1?`_USER`:`CB_CUSTOM`),e.tag(70,+!!a.solid),e.tag(71,0),e.tag(91,i.length),i.forEach((t,n)=>{let r=+(n===0);if(t.kind===`poly`){let n=js(e,t.vertices),i=n.some(e=>e[2]!==void 0&&e[2]!==0);e.tag(92,2|r),e.tag(72,+!!i),e.tag(73,1),e.tag(93,n.length);for(let t of n)e.tag(10,t[0]),e.tag(20,t[1]),i&&e.tag(42,t[2]??0);e.tag(97,0)}else if(t.kind===`circle`){e.tag(92,r),e.tag(93,1),e.tag(72,2);let n=e.P(t.center);e.tag(10,n[0]),e.tag(20,n[1]),e.tag(40,t.radius),e.tag(50,0),e.tag(51,360),e.tag(73,1),e.tag(97,0)}else{let n=t.e,i=n.radiusX>=n.radiusY,a=n.rotationDeg+(i?0:90),o=i?n.radiusX:n.radiusY,[s,c]=Rn(a),l=e.flip?[s*o,-c*o]:[s*o,c*o];e.tag(92,r),e.tag(93,1),e.tag(72,3);let u=e.P(n.center);e.tag(10,u[0]),e.tag(20,u[1]),e.tag(11,l[0]),e.tag(21,l[1]),e.tag(40,i?n.radiusY/n.radiusX:n.radiusX/n.radiusY),e.tag(50,0),e.tag(51,360),e.tag(73,1),e.tag(97,0)}}),e.tag(75,0),e.tag(76,a.solid?1:a.families.length===1?0:2),!a.solid){e.tag(52,0),e.tag(41,1),e.tag(77,0),e.tag(78,a.families.length);for(let t of a.families){let[n,r]=Rn(t.angle);e.tag(53,t.angle),e.tag(43,0),e.tag(44,0),e.tag(45,t.offset*n-t.spacing*r),e.tag(46,t.offset*r+t.spacing*n),e.tag(79,t.dash.length),t.dash.forEach((t,n)=>e.tag(49,n%2==0?t:-t))}}e.tag(98,0)}function Vs(e,t,n,r,i,a){let o=zs(i);if(!o)return;if(a===`solid`)return Bs(e,t,n,i.color,o,{solid:!0});if(a!==`hatch`)return Bs(e,t,n,a,o,{solid:!0});if(!r.hatch)return;let s=ce(r.hatch,i.color??r.color);if(s.background&&Bs(e,t,n,s.background,o,{solid:!0}),s.families.length===0)return;let c=e=>t.ctx.drawing.paperMmToModel(e),l=new Map;for(let e of s.families){let t=e.color??``;l.set(t,[...l.get(t)??[],e])}for(let[r,a]of l)Bs(e,t,n,r===``?i.color:r,o,{solid:!1,families:a.map(e=>({angle:e.angle,spacing:c(e.spacing),offset:c(e.offset),dash:e.dash.map(c)}))})}function Hs(e,t,n,r,i){`fill`in t&&t.fill!==null&&Vs(e,i,n,r,t,t.fill);let a=t;switch(t.type){case`point`:Ds(e,`POINT`,i.owner,n,a,i,`AcDbPoint`),e.point(10,t.position);return;case`line`:return Os(e,i,n,a,t.from,t.to);case`circle`:return As(e,i,n,a,t.center,t.radius);case`arc`:return ks(e,i,n,a,t.center,t.radius,t.startAngleDeg,t.endAngleDeg,t.counterclockwise);case`ellipse`:return Ns(e,i,n,a,t);case`rect`:return Ms(e,i,n,a,Wi(t),!0);case`polyline`:Ms(e,i,n,a,t.vertices,t.closed);for(let r of t.holes)Ms(e,i,n,a,r,!0);return;case`text`:case`mtext`:return Rs(e,i,n,a,t);case`spline`:return Ps(e,i,n,a,t.degree,t.controlPoints,t.knots);case`bezier`:{let r=(t.points.length-1)/3,o=[0,0,0,0];for(let e=1;e<r;e++)o.push(e,e,e);return o.push(r,r,r,r),Ps(e,i,n,a,3,t.points,o)}}}function Us(e,t,n,r){let i=Ga(t,r.ctx),a=t.color??i.style.lineColor,o=t.color??i.style.textColor,s={color:a,lineWeight:t.lineWeight??i.style.lineWeight,lineType:t.lineType};for(let t of i.curves)t.kind===`line`?Os(e,r,n,s,t.from,t.to):ks(e,r,n,s,t.center,t.radius,t.startAngleDeg,t.endAngleDeg,t.counterclockwise);let c=i.metrics.terminator;for(let t of i.terminators){let[i,o]=Rn(t.angleDeg),l=e=>[t.tip[0]+e[0]*i-e[1]*o,t.tip[1]+e[0]*o+e[1]*i];for(let t of c.shapes)if(t.kind===`polygon`){let i=t.points.map(l);Ds(e,`SOLID`,r.owner,n,{color:a,lineWeight:null,lineType:null},r,`AcDbTrace`),(i.length===3?[i[0],i[1],i[2],i[2]]:[i[0],i[1],i[3],i[2]]).forEach((t,n)=>e.point(10+n,t))}else if(t.kind===`polyline`){let i=t.points.map(l);for(let t=0;t+1<i.length;t++)Os(e,r,n,s,i[t],i[t+1])}else if(t.kind===`line`)Os(e,r,n,s,l(t.from),l(t.to));else{let i=l(t.center);if(t.fill){let o=t.radius/2;Ms(e,r,n,{color:a,lineWeight:null,lineType:null},[[i[0]-o,i[1],1],[i[0]+o,i[1],1]],!0,t.radius)}else As(e,r,n,s,i,t.radius)}}for(let a of i.texts){let i=Object.freeze({type:a.text.includes(`
`)?`mtext`:`text`,id:null,layer:t.layer,color:o,lineWeight:null,lineType:null,position:a.position,value:a.text,style:a.textStyle,height:a.paperHeight,rotationDeg:a.rotationDeg,anchor:a.anchor});Rs(e,r,n,{color:o,lineWeight:null,lineType:null},i)}}function Ws(e,t,n,r,i){Ds(e,`INSERT`,i.owner,r,n,i,`AcDbBlockReference`),e.tag(2,e.str(t)),e.point(10,n.position),n.scaleX!==1&&e.tag(41,n.scaleX),n.scaleY!==1&&e.tag(42,n.scaleY);let a=e.A(n.rotationDeg);a!==0&&e.tag(50,(a%360+360)%360)}function Gs(e,t,n){for(let r of t){let t=r.layer,i=n.ctx.layers.get(t)??n.ctx.layers.require(`0`),a=n.ctx.layers.has(t)?i.name:`0`;if(r.type===`insert`){let t=n.ctx.blocks.get(r.block);if(!t)throw new Ja(r.block,`block is not defined`);if(n.stack.includes(t.name.toLowerCase())||n.depth>=32)throw new Ja(t.name,`circular or too deep block nesting`);Ws(e,e.blockFor(t,{ctx:n.ctx,ltScale:n.ltScale,depth:n.depth+1,stack:[...n.stack,t.name.toLowerCase()]}),r,a,n)}else r.type===`viewport`?Ks(e,r,a,n):eo(r)?Us(e,r,a,n):Hs(e,r,a,i,n)}}function Ks(e,t,n,r){if(r.depth>=32)throw new Ja(`viewport`,`too deep nesting`);let i=mo(t,r.ctx.drawing),a=ko(r.ctx,t),o=[...t.entities];if(Ws(e,e.viewportBlock(o,t.target,{ctx:a,ltScale:r.ltScale/i,depth:r.depth+1,stack:r.stack}),{position:t.position,scaleX:i,scaleY:i,rotationDeg:t.rotationDeg,color:null,lineWeight:null,lineType:null},n,r),t.clip&&t.frame){let a=e=>{let[n,r]=Rn(t.rotationDeg),a=(e[0]-t.target[0])*i,o=(e[1]-t.target[1])*i;return[t.position[0]+a*n-o*r,t.position[1]+a*r+o*n]},o=t.clip,s=[a([o.minX,o.minY]),a([o.maxX,o.minY]),a([o.maxX,o.maxY]),a([o.minX,o.maxY])];Ms(e,r,n,{color:t.color,lineWeight:t.lineWeight,lineType:t.lineType},s,!0)}let s=zo(t,r.ctx,Bo(t,r.ctx));s&&Rs(e,r,n,{color:t.color,lineWeight:null,lineType:null},s)}function qs(e,t,n,r,i){let a=e.newHandle();e.tag(0,`TABLE`),e.tag(2,t),e.tag(5,a),e.tag(330,`0`),e.tag(100,`AcDbSymbolTable`),e.tag(70,r),i?.(),e.tableOwner=a,n(),e.tag(0,`ENDTAB`)}function Js(e,t,n,r=5){e.tag(0,t),e.tag(r,e.newHandle()),e.tag(330,e.tableOwner),e.tag(100,`AcDbSymbolTableRecord`),e.tag(100,n)}function Ys(e,t,n={}){let r=n.version??`R2007`,i=new Es(t,n.precision??Math.max(t.drawing.settings.precision,6),r===`R2007`),a=i.newHandle(),o=i.newHandle();Gs(i,e,{ctx:t,ltScale:1,depth:0,stack:[],owner:a}),i.flushBlocks((e,t)=>Gs(i,e,t));let s=i.take();for(let e of t.layers)i.registerLineType(e.lineType);let c=Vo(e,t),l=$n(c)?{minX:0,minY:0,maxX:0,maxY:0}:c,u=i.P([l.minX,i.flip?l.maxY:l.minY]),d=i.P([l.maxX,i.flip?l.minY:l.maxY]),f=()=>{qs(i,`VPORT`,()=>{Js(i,`VPORT`,`AcDbViewportTableRecord`),i.tag(2,`*ACTIVE`),i.tag(70,0),i.tag(10,0),i.tag(20,0),i.tag(11,1),i.tag(21,1),i.tag(12,(u[0]+d[0])/2),i.tag(22,(u[1]+d[1])/2),i.tag(40,Math.max(d[1]-u[1],1)*1.1),i.tag(41,Math.max((d[0]-u[0])/Math.max(d[1]-u[1],1),.1))},1);let e=[...i.lineTypes.entries()];qs(i,`LTYPE`,()=>{for(let[e,t]of[[`ByBlock`,``],[`ByLayer`,``],[`Continuous`,`Solid line`]])Js(i,`LTYPE`,`AcDbLinetypeTableRecord`),i.tag(2,e),i.tag(70,0),i.tag(3,t),i.tag(72,65),i.tag(73,0),i.tag(40,0);for(let[n,r]of e){let e=ne(r).map(e=>t.drawing.paperMmToModel(e));Js(i,`LTYPE`,`AcDbLinetypeTableRecord`),i.tag(2,i.str(n)),i.tag(70,0),i.tag(3,n),i.tag(72,65),i.tag(73,e.length),i.tag(40,e.reduce((e,t)=>e+Math.abs(t),0));for(let t of e)i.tag(49,t),i.tag(74,0)}},3+e.length);let n=t.layers.list();qs(i,`LAYER`,()=>{for(let e of n)Js(i,`LAYER`,`AcDbLayerTableRecord`),i.tag(2,i.str(e.name)),i.tag(70,e.locked?4:0),i.tag(62,e.visible?e.dxfColorIndex:-e.dxfColorIndex),i.tag(6,i.str(i.registerLineType(e.lineType))),i.tag(370,R(e.lineWeight))},n.length);let r=t.textStyles.list();qs(i,`STYLE`,()=>{for(let e of r){let n=t.fonts.has(e.fontFamily)?t.fonts.resolveDxfFont(e.fontFamily):{shx:`txt.shx`,ttf:null,bigFont:null};Js(i,`STYLE`,`AcDbTextStyleTableRecord`),i.tag(2,i.str(e.name)),i.tag(70,0),i.tag(40,0),i.tag(41,e.widthFactor),i.tag(50,e.obliqueAngle),i.tag(71,0),i.tag(42,t.drawing.annotationToModel(e.height)),i.tag(3,i.str(n.ttf??n.shx??`txt.shx`)),i.tag(4,i.str(n.bigFont??``))}},r.length),qs(i,`VIEW`,()=>void 0,0),qs(i,`UCS`,()=>void 0,0),qs(i,`APPID`,()=>{Js(i,`APPID`,`AcDbRegAppTableRecord`),i.tag(2,`ACAD`),i.tag(70,0)},1),qs(i,`DIMSTYLE`,()=>{Js(i,`DIMSTYLE`,`AcDbDimStyleTableRecord`,105),i.tag(2,`Standard`),i.tag(70,0)},1,()=>i.tag(100,`AcDbDimStyleTable`));let s=i.blockList;qs(i,`BLOCK_RECORD`,()=>{let e=(e,t)=>{i.tag(0,`BLOCK_RECORD`),i.tag(5,e),i.tag(330,i.tableOwner),i.tag(100,`AcDbSymbolTableRecord`),i.tag(100,`AcDbBlockTableRecord`),i.tag(2,t)};e(a,`*Model_Space`),e(o,`*Paper_Space`);for(let t of s)e(t.record,i.str(t.name))},2+s.length)},p=()=>{let e=(e,t,n,r)=>{i.tag(0,`BLOCK`),i.tag(5,i.newHandle()),i.tag(330,e),i.tag(100,`AcDbEntity`),i.tag(8,`0`),i.tag(100,`AcDbBlockBegin`),i.tag(2,t),i.tag(70,0),i.point(10,n),i.tag(3,t),i.tag(1,``),i.pushRaw(r),i.tag(0,`ENDBLK`),i.tag(5,i.newHandle()),i.tag(330,e),i.tag(100,`AcDbEntity`),i.tag(8,`0`),i.tag(100,`AcDbBlockEnd`)};e(a,`*Model_Space`,[0,0],[]),e(o,`*Paper_Space`,[0,0],[]);for(let t of i.blockList)e(t.record,i.str(t.name),t.basePoint,t.body)},m=_(t.drawing.settings.units).dxfInsUnits,h=e=>{i.tag(0,`SECTION`),i.tag(2,`HEADER`),i.tag(9,`$ACADVER`),i.tag(1,r===`R2007`?`AC1021`:`AC1015`),i.tag(9,`$DWGCODEPAGE`),i.tag(3,`ANSI_1252`),i.tag(9,`$INSBASE`),i.point(10,[0,0]),i.tag(9,`$EXTMIN`),i.tag(10,u[0]),i.tag(20,u[1]),i.tag(30,0),i.tag(9,`$EXTMAX`),i.tag(10,d[0]),i.tag(20,d[1]),i.tag(30,0),i.tag(9,`$LTSCALE`),i.tag(40,1),i.tag(9,`$INSUNITS`),i.tag(70,m),i.tag(9,`$MEASUREMENT`),i.tag(70,t.drawing.settings.units===`inch`?0:1),i.tag(9,`$LWDISPLAY`),i.tag(290,1),i.tag(9,`$HANDSEED`),i.tag(5,e),i.tag(0,`ENDSEC`)};i.tag(0,`SECTION`),i.tag(2,`CLASSES`),i.tag(0,`ENDSEC`),i.tag(0,`SECTION`),i.tag(2,`TABLES`),f(),i.tag(0,`ENDSEC`),i.tag(0,`SECTION`),i.tag(2,`BLOCKS`),p(),i.tag(0,`ENDSEC`),i.tag(0,`SECTION`),i.tag(2,`ENTITIES`),i.pushRaw(s),i.tag(0,`ENDSEC`);let g=i.newHandle(),v=i.newHandle();i.tag(0,`SECTION`),i.tag(2,`OBJECTS`),i.tag(0,`DICTIONARY`),i.tag(5,g),i.tag(330,`0`),i.tag(100,`AcDbDictionary`),i.tag(281,1),i.tag(3,`ACAD_GROUP`),i.tag(350,v),i.tag(0,`DICTIONARY`),i.tag(5,v),i.tag(330,g),i.tag(100,`AcDbDictionary`),i.tag(281,1),i.tag(0,`ENDSEC`),i.tag(0,`EOF`);let y=i.take();return h(i.handseed),[...i.take(),...y].join(`
`)+`
`}function Xs(e,t={}){return Ys(e.requireSheet(t.sheet).entities,e.context(),t)}var Zs={1:`#ff0000`,2:`#ffff00`,3:`#00ff00`,4:`#00ffff`,5:`#0000ff`,6:`#ff00ff`,7:`#000000`,8:`#808080`,9:`#c0c0c0`},Qs=[`#333333`,`#5b5b5b`,`#848484`,`#adadad`,`#d6d6d6`,`#ffffff`],$s=[1,1,.8,.8,.6,.6,.5,.5,.3,.3];function ec(e){return Math.round(Math.max(0,Math.min(255,e))).toString(16).padStart(2,`0`)}function tc(e,t,n){let r=n*t,i=r*(1-Math.abs(e/60%2-1)),a=n-r,[o,s,c]=e<60?[r,i,0]:e<120?[i,r,0]:e<180?[0,r,i]:e<240?[0,i,r]:e<300?[i,0,r]:[r,0,i];return`#${ec((o+a)*255)}${ec((s+a)*255)}${ec((c+a)*255)}`}function nc(e){let t=Math.abs(Math.trunc(e));if(t===0||t>=256)return null;if(Zs[t])return Zs[t];if(t>=250)return Qs[t-250];let n=Math.floor((t-10)/10)*15,r=(t-10)%10;return tc(n,r%2==0?1:.5,$s[r])}function rc(e){return`#${(e&16777215).toString(16).padStart(6,`0`)}`}var ic=class extends e{constructor(e,t){super(e,t),this.name=`CadDxfError`}},ac=globalThis.TextDecoder;function oc(e){if(typeof e==`string`)return e;let t=e instanceof Uint8Array?e:new Uint8Array(e),n=new ac(`latin1`).decode(t.subarray(0,Math.min(t.length,65536)));if((/\$ACADVER\s*\r?\n\s*1\s*\r?\n\s*(AC\d+)/.exec(n)?.[1]??`AC1009`)>=`AC1021`)return new ac(`utf-8`).decode(t);let r=/\$DWGCODEPAGE\s*\r?\n\s*3\s*\r?\n\s*(\S+)/.exec(n)?.[1]?.toUpperCase()??`ANSI_1252`,i=/ANSI_(\d+)/.exec(r),a=i?`windows-${i[1]}`:`windows-1252`;try{return new ac(a).decode(t)}catch{return new ac(`latin1`).decode(t)}}function sc(e){let t=e.split(/\r\n|\r|\n/),n=[];for(let e=0;e+1<t.length;e+=2){let r=t[e].trim();if(r===``){--e;continue}let i=Number(r);if(!Number.isInteger(i))throw new ic(`dxf`,`invalid group code "${r}" at line ${e+1}`);n.push([i,t[e+1].replace(/\s+$/,``)])}return n}function cc(e){let t=new Map;for(let n=0;n<e.length;n++){let r=e[n];if(r[0]===0&&r[1]===`SECTION`){let r=e[n+1]?.[1]??``,i=n+2,a=i;for(;a<e.length&&(e[a][0]!==0||e[a][1]!==`ENDSEC`);)a++;t.set(r,e.slice(i,a)),n=a}}return t}function lc(e){let t=[],n=null,r=null;for(let i of e)i[0]===0?(n&&(r&&n.type===`VERTEX`?r.vertices.push(n):n.type!==`SEQEND`&&t.push(n)),i[1]===`SEQEND`&&(r=null),n={type:i[1],tags:[]},i[1]===`POLYLINE`&&(r={type:`POLYLINE`,tags:n.tags,vertices:[]},n=r)):n?.tags.push(i);return n&&n.type!==`SEQEND`&&!(r&&n.type===`VERTEX`)&&t.push(n),t}var G=(e,t,n=0)=>{let r=e.tags.find(e=>e[0]===t),i=r?Number(r[1]):n;return Number.isFinite(i)?i:n},uc=(e,t)=>e.tags.find(e=>e[0]===t)?.[1],dc=(e,t)=>e.tags.filter(e=>e[0]===t).map(e=>Number(e[1]));function fc(e,t){let n=[],r=null;for(let[i,a]of e.tags)i===t?r=Number(a):i===t+10&&r!==null&&(n.push([r,Number(a)]),r=null);return n}var pc={1:{unit:`inch`,mm:25.4},2:{unit:`feet`,mm:304.8},4:{unit:`mm`,mm:1},5:{unit:`cm`,mm:10},6:{unit:`m`,mm:1e3},14:{unit:`dm`,mm:100}};function mc(e,t,n){let r=t.decode(uc(e,8)??`0`);r===`0`&&n!==null&&(r=n);try{B(r)}catch{r=r.replace(/[<>/\\":;?*|=,`]/g,`_`).trim()||`0`}let i={layer:r};if(t.opts.colors===`keep`){let t=uc(e,420),n=uc(e,62),r=t===void 0?n===void 0?null:nc(Number(n)):rc(Number(t));r&&(i.color=T(r))}let a=uc(e,370);return a!==void 0&&Number(a)>=0&&(i.lineWeight=Math.min(10,Number(a)/100)),i}var hc={0:`left`,1:`center`,2:`right`,3:`center`,4:`center`,5:`center`},gc={0:`bottom`,1:`bottom`,2:`middle`,3:`top`},_c={1:`top-left`,2:`top-center`,3:`top-right`,4:`middle-left`,5:`middle-center`,6:`middle-right`,7:`bottom-left`,8:`bottom-center`,9:`bottom-right`};function vc(e,t,n,r,i){let a=mc(e,t,n),o=[],s=e=>{o.push(e)};switch(e.type){case`LINE`:s(ui({...a,from:[G(e,10),G(e,20)],to:[G(e,11),G(e,21)]}));break;case`POINT`:s(li({...a,position:[G(e,10),G(e,20)]}));break;case`CIRCLE`:s(di({...a,center:[G(e,10),G(e,20)],radius:G(e,40)}));break;case`ARC`:{let t=G(e,50),n=G(e,51);Math.abs(((n-t)%360+360)%360)<1e-9?s(di({...a,center:[G(e,10),G(e,20)],radius:G(e,40)})):s(fi({...a,center:[G(e,10),G(e,20)],radius:G(e,40),startAngleDeg:t,endAngleDeg:n}));break}case`ELLIPSE`:{let t=G(e,11),n=G(e,21),r=Math.hypot(t,n),i=G(e,41,0)*180/Math.PI,o=G(e,42,Math.PI*2)*180/Math.PI;o<=i&&(o+=360),s(mi({...a,center:[G(e,10),G(e,20)],radiusX:r,radiusY:r*G(e,40,1),rotationDeg:Math.atan2(n,t)*180/Math.PI,startAngleDeg:i,endAngleDeg:o-i>=360-1e-9?i+360:o}));break}case`LWPOLYLINE`:{let t=[],n=null;for(let[r,i]of e.tags)r===10?n=Number(i):r===20&&n!==null?(t.push([n,Number(i),0]),n=null):r===42&&t.length>0&&(t[t.length-1][2]=Number(i));let r=(G(e,70)&1)==1;t.length>=2&&s(yi({...a,vertices:yc(t,r),closed:r}));break}case`POLYLINE`:{let n=G(e,70);if(n&88){t.warnings.push(`POLYLINE: 3D polylines and meshes are skipped`);break}let r=(e.vertices??[]).map(e=>[G(e,10),G(e,20),G(e,42)]),i=(n&1)==1;r.length>=2&&s(yi({...a,vertices:yc(r,i),closed:i}));break}case`SOLID`:case`TRACE`:{let t=[10,11,12,13].map(t=>[G(e,t),G(e,t+10)]),n=[t[0],t[1],t[3],t[2]];s(yi({...a,vertices:yc(n.map(e=>[e[0],e[1],0]),!0),closed:!0,fill:`solid`}));break}case`SPLINE`:{let n=G(e,71,3),r=dc(e,40),i=fc(e,10),o=fc(e,11);if(dc(e,41).some(e=>Math.abs(e-1)>1e-9)&&t.warnings.push(`SPLINE: rational weights are ignored`),i.length>=n+1&&n>=1&&n<=3){let e=r.length===i.length+n+1;s(Ci({...a,degree:n,controlPoints:i,knots:e?r:dr(i.length,n)}))}else if(i.length>=2&&n>3&&r.length===i.length+n+1){let e=r[n],o=r[i.length],c=Math.max(16,i.length*8),l=[];for(let t=0;t<=c;t++)l.push(hr(n,i,r,e+(o-e)*t/c));s(zi(l,a)),t.warnings.push(`SPLINE: degree ${n} approximated by Bezier curves`)}else o.length>=2&&s(zi(o,a));break}case`TEXT`:case`ATTRIB`:{if(!t.opts.text)break;let n=G(e,72),r=G(e,73),i=(n!==0||r!==0)&&uc(e,11)!==void 0?[G(e,11),G(e,21)]:[G(e,10),G(e,20)],o=Ss(t.decode(uc(e,1)??``));if(o.trim()===``)break;s(xi({...a,position:i,value:o.replace(/\n/g,` `),height:Math.max(.1,G(e,40,2.5)*t.textScale),rotationDeg:G(e,50),anchor:`${gc[r]??`bottom`}-${hc[n]??`left`}`}));break}case`MTEXT`:{if(!t.opts.text)break;let n=e.tags.filter(e=>e[0]===3).map(e=>e[1]).join(``)+(uc(e,1)??``),r=xs(t.decode(n));if(r.trim()===``)break;let i=uc(e,11)===void 0?G(e,50):Math.atan2(G(e,21),G(e,11))*180/Math.PI;s(Si({...a,position:[G(e,10),G(e,20)],value:r,height:Math.max(.1,G(e,40,2.5)*t.textScale),rotationDeg:i,anchor:_c[G(e,71,1)]??`top-left`}));break}case`INSERT`:{let n=t.decode(uc(e,2)??``),s=t.blocks.get(n.toLowerCase());if(!s){t.warnings.push(`INSERT: block "${n}" not found`);break}if(i>16){t.warnings.push(`INSERT: block "${n}" nested too deep`);break}(G(e,70,1)>1||G(e,71,1)>1)&&t.warnings.push(`INSERT "${n}": MINSERT arrays are imported as a single copy`);let c=t.blocks.get(`${n.toLowerCase()}#base`)?.[0],l=c?G(c,10):0,u=c?G(c,20):0,d=G(e,41,1),f=G(e,42,1),p=Gn(Vn(G(e,10),G(e,20)),Hn(G(e,50)),Un(d||1,f||1),Vn(-l,-u)),m=a.layer??`0`;for(let e of s)o.push(...vc(e,t,m,p,i+1));return o.map(e=>na(e,r))}case`DIMENSION`:t.warnings.push(`DIMENSION entities are skipped`);break;case`HATCH`:case`VIEWPORT`:case`ATTDEF`:break;default:t.warnings.push(`${e.type}: entity type is not supported`)}return o.map(e=>na(e,r))}function yc(e,t){let n=[];for(let t of e){let e=n[n.length-1];if(e&&Math.hypot(t[0]-e[0],t[1]-e[1])<=1e-12)continue;let r=t[2]??0;n.push(r===0?[t[0],t[1]]:[t[0],t[1],r])}if(t&&n.length>2){let e=n[0],t=n[n.length-1];Math.hypot(e[0]-t[0],e[1]-t[1])<=1e-12&&n.pop()}return n}function bc(e,t){let n=[];e.forEach((e,t)=>{if(e.type===`polyline`&&e.closed&&e.holes.length===0&&e.vertices.length>=2)n.push({index:t,entity:e,vertices:[...e.vertices],polygon:Zi(e.vertices,!0)});else if(e.type===`circle`){let[r,i]=e.center,a=[[r-e.radius,i,1],[r+e.radius,i,1]];n.push({index:t,entity:e,vertices:a,polygon:Zi(a,!0)})}});let r=new Map;for(let e of n)r.set(e.entity.layer,[...r.get(e.entity.layer)??[],e]);let i=new Set,a=new Map;for(let e of r.values()){let n=yr(e.map(e=>e.polygon));for(let r of n){let n=e[r.outer];if(r.holes.length===0){t!==null&&n.entity.type===`polyline`&&a.set(n.index,{...n.entity,fill:t}),t!==null&&n.entity.type===`circle`&&a.set(n.index,di({...n.entity,fill:t}));continue}let o=n.entity;a.set(n.index,yi({id:o.id,layer:o.layer,color:o.color,lineWeight:o.lineWeight,lineType:o.lineType,vertices:n.vertices,closed:!0,holes:r.holes.map(t=>e[t].vertices),fill:t}));for(let t of r.holes)i.add(e[t].index)}}return e.flatMap((e,t)=>i.has(t)?[]:[a.get(t)??e])}function xc(e,t={}){let n=cc(sc(oc(e))),r=n.get(`HEADER`)??[],i=e=>{let t=r.findIndex(t=>t[0]===9&&t[1]===e);return t>=0?r[t+1]?.[1]:void 0},a=(i(`$ACADVER`)??`AC1009`)>=`AC1021`?e=>e:_s,o=pc[Number(i(`$INSUNITS`)??0)]??null,s=t.units??`mm`,c=_(s).mmPerUnit,l=o?o.mm/c:1,u=new Map,d=n.get(`BLOCKS`)??[],m=null,h=[];for(let e of lc(d))e.type===`BLOCK`?(m=a(uc(e,2)??``),h=[],u.set(`${m.toLowerCase()}#base`,[e])):e.type===`ENDBLK`?(m!==null&&u.set(m.toLowerCase(),h),m=null):m!==null&&h.push(e);let g=[],v=n.get(`TABLES`)??[];for(let e of lc(v)){if(e.type!==`LAYER`)continue;let t=a(uc(e,2)??``);if(!t)continue;try{B(t)}catch{continue}let n=G(e,62,7),r=uc(e,420),i={name:t,color:r===void 0?nc(n)??`#000000`:rc(Number(r)),visible:n>=0},o=uc(e,370);o!==void 0&&Number(o)>=0&&(i.lineWeight=Math.min(10,Number(o)/100)),g.push(i)}let y=p(f(t.annotationScale??`1:1`,`annotationScale`)),b={opts:{colors:`bylayer`,text:!0,...t},blocks:u,warnings:[],decode:a,textScale:c*y,unitsToMm:c},x=t.source??`entities`,S=x===`entities`?lc(n.get(`ENTITIES`)??[]):u.get(x.toLowerCase());if(!S)throw new ic(`source`,`block "${x}" not found in the DXF file`);let C=t.coordinateSystem===`screen`,w=Gn(Un(l,C?-l:l)),T=[];for(let e of S)try{T.push(...vc(e,b,null,Sc,0).map(e=>na(e,w,t.coordinateSystem??`cartesian`)))}catch(t){b.warnings.push(`${e.type}: skipped (${t.message})`)}if(t.layer!==void 0&&t.layer!==null){let e=t.layer;T=T.map(t=>({...t,layer:e})).map(e=>Object.freeze(e))}t.detectHoles===!1?t.fill&&(T=bc(T.map(e=>e),t.fill)):T=bc(T,t.fill??null);let E=[0,0],D=t.basePoint??`origin`;if(D===`min`||D===`center`){let e=Oo({settings:{units:s,annotationScale:t.annotationScale??`1:1`,coordinateSystem:t.coordinateSystem??`cartesian`}}),n=new er;for(let t of T)Lo(t,e,void 0,n);let r=n.build();$n(r)||(E=D===`min`?[r.minX,C?r.maxY:r.minY]:tr(r))}else Array.isArray(D)&&(E=[D[0],D[1]]);return{block:io(t.name??`Imported`,T,{basePoint:E}),layers:g,fileUnits:o?.unit??null,warnings:[...new Set(b.warnings)]}}var Sc=[1,0,0,1,0,0],K=class extends e{constructor(e,t){super(e,t),this.name=`CadFormatError`}};function Cc(e){return t=>{let n=Number(t.toFixed(e));return n===0?0:n}}var wc=Cc(10),q=(e,t,n)=>n===void 0?{key:e,kind:t}:{key:e,kind:t,def:n},Tc={point:{code:`P`,fields:[q(`position`,`pt`)]},line:{code:`L`,fields:[q(`from`,`pt`),q(`to`,`pt`)]},circle:{code:`C`,fields:[q(`center`,`pt`),q(`radius`,`len`),q(`fill`,`raw`,null)]},arc:{code:`A`,fields:[q(`center`,`pt`),q(`radius`,`len`),q(`startAngleDeg`,`num`),q(`endAngleDeg`,`num`),q(`counterclockwise`,`bool`,!0)]},ellipse:{code:`E`,fields:[q(`center`,`pt`),q(`radiusX`,`len`),q(`radiusY`,`len`),q(`rotationDeg`,`num`,0),q(`startAngleDeg`,`num`,0),q(`endAngleDeg`,`num`,360),q(`fill`,`raw`,null)]},rect:{code:`R`,fields:[q(`x`,`len`),q(`y`,`len`),q(`width`,`len`),q(`height`,`len`),q(`cornerRadius`,`len`,0),q(`fill`,`raw`,null)]},polyline:{code:`PL`,fields:[q(`vertices`,`verts`),q(`closed`,`bool`,!1),q(`holes`,`holes`,[]),q(`fill`,`raw`,null)]},text:{code:`T`,fields:[q(`position`,`pt`),q(`value`,`raw`),q(`style`,`raw`,null),q(`height`,`num`,null),q(`rotationDeg`,`num`,0),q(`anchor`,`anchor`,`bottom-left`)]},mtext:{code:`MT`,fields:[q(`position`,`pt`),q(`value`,`raw`),q(`style`,`raw`,null),q(`height`,`num`,null),q(`rotationDeg`,`num`,0),q(`anchor`,`anchor`,`bottom-left`)]},spline:{code:`S`,fields:[q(`controlPoints`,`pts`),q(`degree`,`raw`,3),q(`knots`,`knots`,null)]},bezier:{code:`B`,fields:[q(`points`,`pts`)]},"dim-linear":{code:`DL`,fields:[q(`p1`,`pt`),q(`p2`,`pt`),q(`angleDeg`,`num`),q(`offset`,`len`),q(`style`,`raw`,null),q(`text`,`raw`,null)]},"dim-aligned":{code:`DA`,fields:[q(`p1`,`pt`),q(`p2`,`pt`),q(`offset`,`len`),q(`style`,`raw`,null),q(`text`,`raw`,null)]},"dim-chain":{code:`DC`,fields:[q(`points`,`pts`),q(`angleDeg`,`num`),q(`offset`,`len`),q(`style`,`raw`,null),q(`texts`,`raw`,null)]},"dim-baseline":{code:`DB`,fields:[q(`base`,`pt`),q(`points`,`pts`),q(`angleDeg`,`num`),q(`offset`,`len`),q(`style`,`raw`,null),q(`spacing`,`num`,null)]},"dim-angular":{code:`DG`,fields:[q(`center`,`pt`),q(`start`,`pt`),q(`end`,`pt`),q(`radius`,`len`),q(`counterclockwise`,`bool`,!0),q(`style`,`raw`,null),q(`text`,`raw`,null)]},"dim-radius":{code:`DR`,fields:[q(`center`,`pt`),q(`radius`,`len`),q(`angleDeg`,`num`),q(`style`,`raw`,null),q(`text`,`raw`,null)]},"dim-diameter":{code:`DD`,fields:[q(`center`,`pt`),q(`radius`,`len`),q(`angleDeg`,`num`),q(`style`,`raw`,null),q(`text`,`raw`,null)]},leader:{code:`LD`,fields:[q(`points`,`pts`),q(`text`,`raw`),q(`style`,`raw`,null),q(`shelf`,`bool`,!0),q(`shelfLength`,`num`,null)]},insert:{code:`I`,fields:[q(`block`,`raw`),q(`position`,`pt`),q(`scaleX`,`num`,1),q(`scaleY`,`num`,1),q(`rotationDeg`,`num`,0)]},viewport:{code:`V`,fields:[q(`entities`,`ents`),q(`position`,`pt`),q(`target`,`pt`,[0,0]),q(`scale`,`scale`,null),q(`rotationDeg`,`num`,0),q(`title`,`raw`,null),q(`clip`,`clip`,null),q(`frame`,`bool`,!1)]}},Ec=new Map(Object.entries(Tc).map(([e,t])=>[t.code,{type:e,fields:t.fields}]));function Dc(e,t){return JSON.stringify(e)===JSON.stringify(t)}function Oc(e,t,n){switch(e){case`pt`:{let e=t;return[n.round(e[0]),n.round(e[1])]}case`pts`:return t.map(e=>[n.round(e[0]),n.round(e[1])]);case`len`:return n.round(t);case`num`:return t===null?null:wc(t);case`bool`:return+!!t;case`verts`:return t.map(e=>e.length===3?[n.round(e[0]),n.round(e[1]),wc(e[2])]:[n.round(e[0]),n.round(e[1])]);case`holes`:return t.map(e=>Oc(`verts`,e,n));case`anchor`:return At.indexOf(t);case`knots`:return t===null?null:t.map(wc);case`ents`:return t.map(e=>Ac(e,n));case`scale`:return t===null?null:m(t);case`clip`:{if(t===null)return null;let e=t;return[n.round(e.minX),n.round(e.minY),n.round(e.maxX),n.round(e.maxY)]}case`raw`:return t}}function kc(e,t,n,r,i){switch(e){case`bool`:return t===1||t===!0;case`anchor`:{let e=At[t];if(e===void 0)throw new K(n,`unknown text anchor index ${String(t)}`);return e}case`ents`:if(!Array.isArray(t))throw new K(n,`must be an array of entities`);return t.map((e,t)=>Mc(e,r,`${n}[${t}]`,i+1));case`scale`:return t===null?null:f(t,n);case`clip`:if(t===null)return null;if(!Array.isArray(t)||t.length!==4)throw new K(n,`must be [minX, minY, maxX, maxY]`);return{minX:t[0],minY:t[1],maxX:t[2],maxY:t[3]};default:return t}}function Ac(e,t){let n=Tc[e.type];if(!n)throw new K(`entity`,`unknown type ${e.type}`);let r=e,i=n.fields.map(n=>{let i=r[n.key];if(e.type===`spline`&&n.key===`knots`){let t=e;Dc(t.knots,dr(t.controlPoints.length,t.degree))&&(i=null)}return{fd:n,v:Oc(n.kind,i,t)}});for(;i.length>0;){let e=i[i.length-1];if(e.fd.def===void 0)break;let n=Oc(e.fd.kind,e.fd.def,t);if(!Dc(e.v,n))break;i=i.slice(0,-1)}let a=t.layerIndex.get(e.layer.toLowerCase()),o=[n.code,a??e.layer,...i.map(e=>e.v)],s={};return e.id!==null&&(s.i=e.id),e.color!==null&&(s.c=e.color),e.lineWeight!==null&&(s.w=e.lineWeight),e.lineType!==null&&(s.t=e.lineType),Object.keys(s).length>0&&o.push(s),o}var jc=32;function Mc(e,t,n,r=0){if(!Array.isArray(e)||e.length<2)throw new K(n,`must be an entity tuple [code, layer, …]`);if(r>jc)throw new K(n,`nesting is too deep`);let[i,a,...o]=e,s=Ec.get(String(i));if(!s)throw new K(n,`unknown entity code ${String(i)}`);let c={},l=o[o.length-1];if(typeof l==`object`&&l&&!Array.isArray(l)&&(c=l,o.pop()),o.length>s.fields.length)throw new K(n,`too many fields for ${s.type}`);let u=typeof a==`number`?t[a]:a;if(typeof u!=`string`)throw new K(`${n}.layer`,`unknown layer reference ${String(a)}`);let d={type:s.type,layer:u};s.fields.forEach((e,i)=>{if(i>=o.length){if(e.def===void 0)throw new K(`${n}.${e.key}`,`is missing`);d[e.key]=e.def}else d[e.key]=kc(e.kind,o[i],`${n}.${e.key}`,t,r)}),s.type===`spline`&&d.knots===null&&delete d.knots;for(let[e,t]of[[`i`,`id`],[`c`,`color`],[`w`,`lineWeight`],[`t`,`lineType`]])c[e]!==void 0&&(d[t]=c[e]);return bo(d,n)}function Nc(e){return[e.units,e.precision,m(e.scale),m(e.annotationScale),e.coordinateSystem===`screen`?`s`:`c`,[e.padding.top,e.padding.right,e.padding.bottom,e.padding.left]]}function Pc(e){if(!Array.isArray(e))throw new K(`s`,`settings must be an array`);let[t,n,r,i,a,o]=e;return y({units:t,precision:n,scale:r,annotationScale:i,coordinateSystem:a===`s`?`screen`:`cartesian`,padding:o})}function Fc(e){let t=+!!e.visible|(e.locked?2:0),n=[e.name,e.color,e.dxfColorIndex,e.lineWeight,e.lineType,e.opacity,t,e.hatch];for(;n.length>6&&(n[n.length-1]===null||n.length===7&&n[6]===1);)n.pop();return n}function Ic(e,t){if(!Array.isArray(e)||e.length<6)throw new K(`l[${t}]`,`layer must be [name, color, aci, lineWeight, lineType, opacity, flags?, hatch?]`);let[n,r,i,a,o,s,c=1,l=null]=e,u={name:n,color:r,dxfColorIndex:i,lineWeight:a,opacity:s,visible:(c&1)==1,locked:(c&2)==2};return o!==void 0&&(u.lineType=o),l!=null&&(u.hatch=l),u}function Lc(e){return[e.name,e.fontFamily,e.height,e.letterSpacing,e.lineHeight,e.obliqueAngle,e.widthFactor]}function Rc(e){let t={};for(let[n,r]of Object.entries(en)){let i=e[n];Dc(i,r)||(t[n]=i)}return Object.keys(t).length===0?[e.name]:[e.name,t]}function zc(e,t){return[e.name,[t.round(e.basePoint[0]),t.round(e.basePoint[1])],e.description,e.entities.map(e=>Ac(e,t))]}function Bc(e,t,n){if(!Array.isArray(e)||e.length!==4)throw new K(`b[${n}]`,`block must be [name, basePoint, description, entities]`);let[r,i,a,o]=e;if(!Array.isArray(o))throw new K(`b[${n}].entities`,`must be an array`);return io(r,o.map((e,r)=>Mc(e,t,`b[${n}].entities[${r}]`)),{basePoint:i,description:a})}function Vc(e,t={}){let n=t.precision??e.settings.precision,r=e.layers.list(),i={round:Cc(n),layerIndex:new Map(r.map((e,t)=>[e.name.toLowerCase(),t]))};return{f:`cbp`,v:1,s:Nc(e.settings),fo:[...e.fonts.toJSON().fonts],ts:[e.textStyles.current.name,e.textStyles.list().map(Lc)],ds:[e.dimStyles.current.name,e.dimStyles.list().map(Rc)],l:[e.layers.current.name,r.map(Fc)],b:e.blocks.list().map(e=>zc(e,i)),sh:e.sheets.map(e=>[e.id,e.name,e.entities.map(e=>Ac(e,i))])}}function Hc(e){let t=e;if(typeof e==`string`)try{t=JSON.parse(e)}catch(e){throw new K(`json`,`invalid JSON: ${e.message}`)}if(typeof t!=`object`||!t||Array.isArray(t))throw new K(`document`,`must be an object`);let n=t;if(n.f!==`cbp`)throw new K(`f`,`must be "cbp", got ${String(n.f)}`);if(n.v!==1)throw new K(`v`,`unsupported version ${String(n.v)} (expected 1)`);let r=e=>{let t=n[e];if(!Array.isArray(t))throw new K(e,`must be an array`);return t},i=Pc(n.s),a=ht.fromJSON({fonts:r(`fo`)}),[o,s]=r(`ts`);if(!Array.isArray(s))throw new K(`ts`,`must be [current, styles]`);let c=kt.fromJSON(a,{current:o,styles:s.map((e,t)=>{if(!Array.isArray(e)||e.length!==7)throw new K(`ts[${t}]`,`must be [name, font, height, letterSpacing, lineHeight, oblique, widthFactor]`);let[n,r,i,a,o,s,c]=e;return{name:n,fontFamily:r,height:i,letterSpacing:a,lineHeight:o,obliqueAngle:s,widthFactor:c}})}),[l,u]=r(`ds`);if(!Array.isArray(u))throw new K(`ds`,`must be [current, styles]`);let d=hn.fromJSON(c,{current:l,styles:u.map((e,t)=>{if(!Array.isArray(e)||e.length<1)throw new K(`ds[${t}]`,`must be [name, changes?]`);return{name:e[0],...e[1]??{}}})}),[f,p]=r(`l`);if(!Array.isArray(p))throw new K(`l`,`must be [current, layers]`);let m=p.map(Ic),h=ye.fromJSON({current:f,layers:m}),g=m.map(e=>e.name);g.some(e=>e===`0`)||g.unshift(`0`);let _=new So;for(let e of r(`b`).map((e,t)=>Bc(e,g,t)))_.add(e);let v=r(`sh`).map((e,t)=>{if(!Array.isArray(e)||e.length!==3)throw new K(`sh[${t}]`,`sheet must be [id, name, entities]`);let[n,r,i]=e;if(!Array.isArray(i))throw new K(`sh[${t}].entities`,`must be an array`);return new Eo(n,r,i.map((e,n)=>Mc(e,g,`sh[${t}].entities[${n}]`)))});return Do.fromParts({settings:i,dimStyles:d,layers:h,blocks:_,sheets:v})}function Uc(e,t={}){return JSON.stringify(Vc(e,t))}function Wc(e,t={}){let n=t.layers?.list()??[],r={round:Cc(t.precision??3),layerIndex:new Map(n.map((e,t)=>[e.name.toLowerCase(),t]))};return e.map(e=>Ac(e,r))}function Gc(e,t={}){if(!Array.isArray(e))throw new K(`entities`,`must be an array`);let n=t.layers?.names()??[];return e.map((e,t)=>Mc(e,n,`entities[${t}]`))}var Kc=Uint8Array,qc=Uint16Array,Jc=Int32Array,Yc=new Kc([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Xc=new Kc([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Zc=new Kc([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Qc=function(e,t){for(var n=new qc(31),r=0;r<31;++r)n[r]=t+=1<<e[r-1];for(var i=new Jc(n[30]),r=1;r<30;++r)for(var a=n[r];a<n[r+1];++a)i[a]=a-n[r]<<5|r;return{b:n,r:i}},$c=Qc(Yc,2),el=$c.b,tl=$c.r;el[28]=258,tl[258]=28;for(var nl=Qc(Xc,0),rl=nl.b,il=nl.r,al=new qc(32768),ol=0;ol<32768;++ol){var sl=(ol&43690)>>1|(ol&21845)<<1;sl=(sl&52428)>>2|(sl&13107)<<2,sl=(sl&61680)>>4|(sl&3855)<<4,al[ol]=((sl&65280)>>8|(sl&255)<<8)>>1}for(var cl=(function(e,t,n){for(var r=e.length,i=0,a=new qc(t);i<r;++i)e[i]&&++a[e[i]-1];var o=new qc(t);for(i=1;i<t;++i)o[i]=o[i-1]+a[i-1]<<1;var s;if(n){s=new qc(1<<t);var c=15-t;for(i=0;i<r;++i)if(e[i])for(var l=i<<4|e[i],u=t-e[i],d=o[e[i]-1]++<<u,f=d|(1<<u)-1;d<=f;++d)s[al[d]>>c]=l}else for(s=new qc(r),i=0;i<r;++i)e[i]&&(s[i]=al[o[e[i]-1]++]>>15-e[i]);return s}),ll=new Kc(288),ol=0;ol<144;++ol)ll[ol]=8;for(var ol=144;ol<256;++ol)ll[ol]=9;for(var ol=256;ol<280;++ol)ll[ol]=7;for(var ol=280;ol<288;++ol)ll[ol]=8;for(var ul=new Kc(32),ol=0;ol<32;++ol)ul[ol]=5;var dl=cl(ll,9,0),fl=cl(ll,9,1),pl=cl(ul,5,0),ml=cl(ul,5,1),hl=function(e){for(var t=e[0],n=1;n<e.length;++n)e[n]>t&&(t=e[n]);return t},gl=function(e,t,n){var r=t/8|0;return(e[r]|e[r+1]<<8)>>(t&7)&n},_l=function(e,t){var n=t/8|0;return(e[n]|e[n+1]<<8|e[n+2]<<16)>>(t&7)},vl=function(e){return(e+7)/8|0},yl=function(e,t,n){return(t==null||t<0)&&(t=0),(n==null||n>e.length)&&(n=e.length),new Kc(e.subarray(t,n))},bl=[`unexpected EOF`,`invalid block type`,`invalid length/literal`,`invalid distance`,`stream finished`,`no stream handler`,,`no callback`,`invalid UTF-8 data`,`extra field too long`,`date not in range 1980-2099`,`filename too long`,`stream finishing`,`invalid zip data`],xl=function(e,t,n){var r=Error(t||bl[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,xl),!n)throw r;return r},Sl=function(e,t,n,r){var i=e.length,a=r?r.length:0;if(!i||t.f&&!t.l)return n||new Kc(0);var o=!n,s=o||t.i!=2,c=t.i;o&&(n=new Kc(i*3));var l=function(e){var t=n.length;if(e>t){var r=new Kc(Math.max(t*2,e));r.set(n),n=r}},u=t.f||0,d=t.p||0,f=t.b||0,p=t.l,m=t.d,h=t.m,g=t.n,_=i*8;do{if(!p){u=gl(e,d,1);var v=gl(e,d+1,3);if(d+=3,!v){var y=vl(d)+4,b=e[y-4]|e[y-3]<<8,x=y+b;if(x>i){c&&xl(0);break}s&&l(f+b),n.set(e.subarray(y,x),f),t.b=f+=b,t.p=d=x*8,t.f=u;continue}if(v==1)p=fl,m=ml,h=9,g=5;else if(v==2){var S=gl(e,d,31)+257,C=gl(e,d+10,15)+4,w=S+gl(e,d+5,31)+1;d+=14;for(var T=new Kc(w),E=new Kc(19),D=0;D<C;++D)E[Zc[D]]=gl(e,d+D*3,7);d+=C*3;for(var O=hl(E),k=(1<<O)-1,A=cl(E,O,1),D=0;D<w;){var j=A[gl(e,d,k)];d+=j&15;var y=j>>4;if(y<16)T[D++]=y;else{var M=0,N=0;for(y==16?(N=3+gl(e,d,3),d+=2,M=T[D-1]):y==17?(N=3+gl(e,d,7),d+=3):y==18&&(N=11+gl(e,d,127),d+=7);N--;)T[D++]=M}}var ee=T.subarray(0,S),P=T.subarray(S);h=hl(ee),g=hl(P),p=cl(ee,h,1),m=cl(P,g,1)}else xl(1);if(d>_){c&&xl(0);break}}s&&l(f+131072);for(var te=(1<<h)-1,ne=(1<<g)-1,re=d;;re=d){var M=p[_l(e,d)&te],ie=M>>4;if(d+=M&15,d>_){c&&xl(0);break}if(M||xl(2),ie<256)n[f++]=ie;else if(ie==256){re=d,p=null;break}else{var ae=ie-254;if(ie>264){var D=ie-257,F=Yc[D];ae=gl(e,d,(1<<F)-1)+el[D],d+=F}var oe=m[_l(e,d)&ne],I=oe>>4;oe||xl(3),d+=oe&15;var P=rl[I];if(I>3){var F=Xc[I];P+=_l(e,d)&(1<<F)-1,d+=F}if(d>_){c&&xl(0);break}s&&l(f+131072);var se=f+ae;if(f<P){var ce=a-P,le=Math.min(P,se);for(ce+f<0&&xl(3);f<le;++f)n[f]=r[ce+f]}for(;f<se;++f)n[f]=n[f-P]}}t.l=p,t.p=re,t.b=f,t.f=u,p&&(u=1,t.m=h,t.d=m,t.n=g)}while(!u);return f!=n.length&&o?yl(n,0,f):n.subarray(0,f)},Cl=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8},wl=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8,e[r+2]|=n>>16},Tl=function(e,t){for(var n=[],r=0;r<e.length;++r)e[r]&&n.push({s:r,f:e[r]});var i=n.length,a=n.slice();if(!i)return{t:Ml,l:0};if(i==1){var o=new Kc(n[0].s+1);return o[n[0].s]=1,{t:o,l:1}}n.sort(function(e,t){return e.f-t.f}),n.push({s:-1,f:25001});var s=n[0],c=n[1],l=0,u=1,d=2;for(n[0]={s:-1,f:s.f+c.f,l:s,r:c};u!=i-1;)s=n[n[l].f<n[d].f?l++:d++],c=n[l!=u&&n[l].f<n[d].f?l++:d++],n[u++]={s:-1,f:s.f+c.f,l:s,r:c};for(var f=a[0].s,r=1;r<i;++r)a[r].s>f&&(f=a[r].s);var p=new qc(f+1),m=El(n[u-1],p,0);if(m>t){var r=0,h=0,g=m-t,_=1<<g;for(a.sort(function(e,t){return p[t.s]-p[e.s]||e.f-t.f});r<i;++r){var v=a[r].s;if(p[v]>t)h+=_-(1<<m-p[v]),p[v]=t;else break}for(h>>=g;h>0;){var y=a[r].s;p[y]<t?h-=1<<t-p[y]++-1:++r}for(;r>=0&&h;--r){var b=a[r].s;p[b]==t&&(--p[b],++h)}m=t}return{t:new Kc(p),l:m}},El=function(e,t,n){return e.s==-1?Math.max(El(e.l,t,n+1),El(e.r,t,n+1)):t[e.s]=n},Dl=function(e){for(var t=e.length;t&&!e[--t];);for(var n=new qc(++t),r=0,i=e[0],a=1,o=function(e){n[r++]=e},s=1;s<=t;++s)if(e[s]==i&&s!=t)++a;else{if(!i&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(i),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(i);a=1,i=e[s]}return{c:n.subarray(0,r),n:t}},Ol=function(e,t){for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},kl=function(e,t,n){var r=n.length,i=vl(t+2);e[i]=r&255,e[i+1]=r>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var a=0;a<r;++a)e[i+a+4]=n[a];return(i+4+r)*8},Al=function(e,t,n,r,i,a,o,s,c,l,u){Cl(t,u++,n),++i[256];for(var d=Tl(i,15),f=d.t,p=d.l,m=Tl(a,15),h=m.t,g=m.l,_=Dl(f),v=_.c,y=_.n,b=Dl(h),x=b.c,S=b.n,C=new qc(19),w=0;w<v.length;++w)++C[v[w]&31];for(var w=0;w<x.length;++w)++C[x[w]&31];for(var T=Tl(C,7),E=T.t,D=T.l,O=19;O>4&&!E[Zc[O-1]];--O);var k=l+5<<3,A=Ol(i,ll)+Ol(a,ul)+o,j=Ol(i,f)+Ol(a,h)+o+14+3*O+Ol(C,E)+2*C[16]+3*C[17]+7*C[18];if(c>=0&&k<=A&&k<=j)return kl(t,u,e.subarray(c,c+l));var M,N,ee,P;if(Cl(t,u,1+(j<A)),u+=2,j<A){M=cl(f,p,0),N=f,ee=cl(h,g,0),P=h;var te=cl(E,D,0);Cl(t,u,y-257),Cl(t,u+5,S-1),Cl(t,u+10,O-4),u+=14;for(var w=0;w<O;++w)Cl(t,u+3*w,E[Zc[w]]);u+=3*O;for(var ne=[v,x],re=0;re<2;++re)for(var ie=ne[re],w=0;w<ie.length;++w){var ae=ie[w]&31;Cl(t,u,te[ae]),u+=E[ae],ae>15&&(Cl(t,u,ie[w]>>5&127),u+=ie[w]>>12)}}else M=dl,N=ll,ee=pl,P=ul;for(var w=0;w<s;++w){var F=r[w];if(F>255){var ae=F>>18&31;wl(t,u,M[ae+257]),u+=N[ae+257],ae>7&&(Cl(t,u,F>>23&31),u+=Yc[ae]);var oe=F&31;wl(t,u,ee[oe]),u+=P[oe],oe>3&&(wl(t,u,F>>5&8191),u+=Xc[oe])}else wl(t,u,M[F]),u+=N[F]}return wl(t,u,M[256]),u+N[256]},jl=new Jc([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Ml=new Kc(0),Nl=function(e,t,n,r,i,a){var o=a.z||e.length,s=new Kc(r+o+5*(1+Math.ceil(o/7e3))+i),c=s.subarray(r,s.length-i),l=a.l,u=(a.r||0)&7;if(t){u&&(c[0]=a.r>>3);for(var d=jl[t-1],f=d>>13,p=d&8191,m=(1<<n)-1,h=a.p||new qc(32768),g=a.h||new qc(m+1),_=Math.ceil(n/3),v=2*_,y=function(t){return(e[t]^e[t+1]<<_^e[t+2]<<v)&m},b=new Jc(25e3),x=new qc(288),S=new qc(32),C=0,w=0,T=a.i||0,E=0,D=a.w||0,O=0;T+2<o;++T){var k=y(T),A=T&32767,j=g[k];if(h[A]=j,g[k]=A,D<=T){var M=o-T;if((C>7e3||E>24576)&&(M>423||!l)){u=Al(e,c,0,b,x,S,w,E,O,T-O,u),E=C=w=0,O=T;for(var N=0;N<286;++N)x[N]=0;for(var N=0;N<30;++N)S[N]=0}var ee=2,P=0,te=p,ne=A-j&32767;if(M>2&&k==y(T-ne))for(var re=Math.min(f,M)-1,ie=Math.min(32767,T),ae=Math.min(258,M);ne<=ie&&--te&&A!=j;){if(e[T+ee]==e[T+ee-ne]){for(var F=0;F<ae&&e[T+F]==e[T+F-ne];++F);if(F>ee){if(ee=F,P=ne,F>re)break;for(var oe=Math.min(ne,F-2),I=0,N=0;N<oe;++N){var se=T-ne+N&32767,ce=se-h[se]&32767;ce>I&&(I=ce,j=se)}}}A=j,j=h[A],ne+=A-j&32767}if(P){b[E++]=268435456|tl[ee]<<18|il[P];var le=tl[ee]&31,ue=il[P]&31;w+=Yc[le]+Xc[ue],++x[257+le],++S[ue],D=T+ee,++C}else b[E++]=e[T],++x[e[T]]}}for(T=Math.max(T,D);T<o;++T)b[E++]=e[T],++x[e[T]];u=Al(e,c,l,b,x,S,w,E,O,T-O,u),l||(a.r=u&7|c[u/8|0]<<3,u-=7,a.h=g,a.p=h,a.i=T,a.w=D)}else{for(var T=a.w||0;T<o+l;T+=65535){var de=T+65535;de>=o&&(c[u/8|0]=l,de=o),u=kl(c,u+1,e.subarray(T,de))}a.i=o}return yl(s,0,r+vl(u)+i)},Pl=(function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var n=t,r=9;--r;)n=(n&1&&-306674912)^n>>>1;e[t]=n}return e})(),Fl=function(){var e=-1;return{p:function(t){for(var n=e,r=0;r<t.length;++r)n=Pl[n&255^t[r]]^n>>>8;e=n},d:function(){return~e}}},Il=function(e,t,n,r,i){if(!i&&(i={l:1},t.dictionary)){var a=t.dictionary.subarray(-32768),o=new Kc(a.length+e.length);o.set(a),o.set(e,a.length),e=o,i.w=a.length}return Nl(e,t.level==null?6:t.level,t.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,n,r,i)},Ll=function(e,t){var n={};for(var r in e)n[r]=e[r];for(var r in t)n[r]=t[r];return n},Rl=function(e,t){return e[t]|e[t+1]<<8},zl=function(e,t){return(e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24)>>>0},Bl=function(e,t){return zl(e,t)+zl(e,t+4)*4294967296},Vl=function(e,t,n){for(;n;++t)e[t]=n,n>>>=8};function Hl(e,t){return Il(e,t||{},0,0)}function Ul(e,t){return Sl(e,{i:2},t&&t.out,t&&t.dictionary)}var Wl=function(e,t,n,r){for(var i in e){var a=e[i],o=t+i,s=r;Array.isArray(a)&&(s=Ll(r,a[1]),a=a[0]),ArrayBuffer.isView(a)?n[o]=[a,s]:(n[o+=`/`]=[new Kc(0),s],Wl(a,o,n,r))}},Gl=typeof TextEncoder<`u`&&new TextEncoder,Kl=typeof TextDecoder<`u`&&new TextDecoder;try{Kl.decode(Ml,{stream:!0})}catch{}var ql=function(e){for(var t=``,n=0;;){var r=e[n++],i=(r>127)+(r>223)+(r>239);if(n+i>e.length)return{s:t,r:yl(e,n-1)};i?i==3?(r=((r&15)<<18|(e[n++]&63)<<12|(e[n++]&63)<<6|e[n++]&63)-65536,t+=String.fromCharCode(55296|r>>10,56320|r&1023)):i&1?t+=String.fromCharCode((r&31)<<6|e[n++]&63):t+=String.fromCharCode((r&15)<<12|(e[n++]&63)<<6|e[n++]&63):t+=String.fromCharCode(r)}};function Jl(e,t){if(t){for(var n=new Kc(e.length),r=0;r<e.length;++r)n[r]=e.charCodeAt(r);return n}if(Gl)return Gl.encode(e);for(var i=e.length,a=new Kc(e.length+(e.length>>1)),o=0,s=function(e){a[o++]=e},r=0;r<i;++r){if(o+5>a.length){var c=new Kc(o+8+(i-r<<1));c.set(a),a=c}var l=e.charCodeAt(r);l<128||t?s(l):l<2048?(s(192|l>>6),s(128|l&63)):l>55295&&l<57344?(l=65536+(l&1047552)|e.charCodeAt(++r)&1023,s(240|l>>18),s(128|l>>12&63),s(128|l>>6&63),s(128|l&63)):(s(224|l>>12),s(128|l>>6&63),s(128|l&63))}return yl(a,0,o)}function Yl(e,t){if(t){for(var n=``,r=0;r<e.length;r+=16384)n+=String.fromCharCode.apply(null,e.subarray(r,r+16384));return n}if(Kl)return Kl.decode(e);var i=ql(e),a=i.s,n=i.r;return n.length&&xl(8),a}var Xl=function(e,t){return t+30+Rl(e,t+26)+Rl(e,t+28)},Zl=function(e,t,n){var r=Rl(e,t+28),i=Rl(e,t+30),a=Yl(e.subarray(t+46,t+46+r),!(Rl(e,t+8)&2048)),o=t+46+r,s=Ql(e,o,i,n,zl(e,t+20),zl(e,t+24),zl(e,t+42)),c=s[0],l=s[1],u=s[2];return[Rl(e,t+10),c,l,a,o+i+Rl(e,t+32),u]},Ql=function(e,t,n,r,i,a,o){var s=i==4294967295,c=a==4294967295,l=o==4294967295,u=t+n,d=s+c+l;if(r&&d){for(;t+4<u;t+=4+Rl(e,t+2))if(Rl(e,t)==1)return[s?Bl(e,t+4+8*c):i,c?Bl(e,t+4):a,l?Bl(e,t+4+8*(c+s)):o,1];r<2&&xl(13)}return[i,a,o,0]},$l=function(e){var t=0;if(e)for(var n in e){var r=e[n].length;r>65535&&xl(9),t+=r+4}return t},eu=function(e,t,n,r,i,a,o,s){var c=r.length,l=n.extra,u=s&&s.length,d=$l(l);Vl(e,t,o==null?67324752:33639248),t+=4,o!=null&&(e[t++]=20,e[t++]=n.os),e[t]=20,t+=2,e[t++]=n.flag<<1|(a<0&&8),e[t++]=i&&8,e[t++]=n.compression&255,e[t++]=n.compression>>8;var f=new Date(n.mtime==null?Date.now():n.mtime),p=f.getFullYear()-1980;if((p<0||p>119)&&xl(10),Vl(e,t,p<<25|f.getMonth()+1<<21|f.getDate()<<16|f.getHours()<<11|f.getMinutes()<<5|f.getSeconds()>>1),t+=4,a!=-1&&(Vl(e,t,n.crc),Vl(e,t+4,a<0?-a-2:a),Vl(e,t+8,n.size)),Vl(e,t+12,c),Vl(e,t+14,d),t+=16,o!=null&&(Vl(e,t,u),Vl(e,t+6,n.attrs),Vl(e,t+10,o),t+=14),e.set(r,t),t+=c,d)for(var m in l){var h=l[m],g=h.length;Vl(e,t,+m),Vl(e,t+2,g),e.set(h,t+4),t+=4+g}return u&&(e.set(s,t),t+=u),t},tu=function(e,t,n,r,i){Vl(e,t,101010256),Vl(e,t+8,n),Vl(e,t+10,n),Vl(e,t+12,r),Vl(e,t+16,i)};function nu(e,t){t||={};var n={},r=[];Wl(e,``,n,t);var i=0,a=0;for(var o in n){var s=n[o],c=s[0],l=s[1],u=l.level==0?0:8,d=Jl(o),f=d.length,p=l.comment,m=p&&Jl(p),h=m&&m.length,g=$l(l.extra);f>65535&&xl(11);var _=u?Hl(c,l):c,v=_.length,y=Fl();y.p(c),r.push(Ll(l,{size:c.length,crc:y.d(),c:_,f:d,m,u:f!=o.length||m&&p.length!=h,o:i,compression:u})),i+=30+f+g+v,a+=76+2*(f+g)+(h||0)+v}for(var b=new Kc(a+22),x=i,S=a-i,C=0;C<r.length;++C){var d=r[C];eu(b,d.o,d,d.f,d.u,d.c.length);var w=30+d.f.length+$l(d.extra);b.set(d.c,d.o+w),eu(b,i,d,d.f,d.u,d.c.length,d.o,d.m),i+=16+w+(d.m?d.m.length:0)}return tu(b,i,r.length,S,x),b}function ru(e,t){for(var n={},r=e.length-22;zl(e,r)!=101010256;--r)(!r||e.length-r>65558)&&xl(13);var i=Rl(e,r+8);if(!i)return{};var a=zl(e,r+16),o=zl(e,r-20)==117853008;if(o){var s=zl(e,r-12);o=zl(e,s)==101075792,o&&(i=zl(e,s+32),a=zl(e,s+48))}for(var c=t&&t.filter,l=0;l<i;++l){var u=Zl(e,a,o),d=u[0],f=u[1],p=u[2],m=u[3],h=u[4],g=u[5],_=Xl(e,g);a=h,(!c||c({name:m,size:f,originalSize:p,compression:d}))&&(d?d==8?n[m]=Ul(e.subarray(_,_+f),{out:new Kc(p)}):xl(14,`unknown compression type `+d):n[m]=yl(e,_,_+f))}return n}var iu=`vcad`,au=268435456,ou=1e4,su=/^(?![./])(?!.*\.\.)(?!.*\/\/)[\w\-./ ]{1,200}$/;function cu(e){if(!su.test(e)||e.endsWith(`/`))throw new K(`assets`,`invalid asset path "${e}" (relative path without "..")`);return`assets/${e}`}function lu(e,t){let n={};return{files:n,list:e.map((e,r)=>{let i=`blocks/${String(r+1).padStart(4,`0`)}.json`,a=[e.name,[e.basePoint[0],e.basePoint[1]],e.description,Wc(e.entities,{precision:t})];return n[i]=Jl(JSON.stringify(a)),{name:e.name,file:i}})}}function uu(e,t,n,r,i){let{files:a,list:o}=lu(n,r),s=Object.keys(i.assets??{});for(let e of s)a[cu(e)]=i.assets[e];let c={format:iu,version:1,generator:`cad-blueprint`,created:(i.created??new Date).toISOString(),kind:e,blocks:o,assets:s,...i.meta?{meta:i.meta}:{}};a[`manifest.json`]=Jl(JSON.stringify(c,null,2)),t&&(a[`document.json`]=Jl(JSON.stringify({...t,b:[]})));let l=i.created??new Date,u=l.getTime()<Date.UTC(1980,0,2)?new Date(Date.UTC(1980,0,2)):l;return nu(a,{level:i.level??6,mtime:u})}function du(e,t={}){let n=t.precision??e.settings.precision;return uu(`document`,Vc(e,{precision:n}),e.blocks.topologicalOrder(),n,t)}function fu(e,t){let n=e[t];if(!n)throw new K(t,`is missing in the archive`);try{return JSON.parse(Yl(n))}catch(e){throw new K(t,`invalid JSON: ${e.message}`)}}function pu(e){let t=e instanceof Uint8Array?e:new Uint8Array(e),n=0,r=0,i;try{i=ru(t,{filter:e=>{if(r+=1,n+=e.originalSize,r>1e4)throw new K(`vcad`,`more than ${ou} files`);if(n>268435456)throw new K(`vcad`,`unpacked size exceeds ${au} bytes`);return!0}})}catch(e){throw e instanceof K?e:new K(`vcad`,`not a valid ZIP archive: ${e.message}`)}let a=fu(i,`manifest.json`);if(typeof a!=`object`||!a||a.format!==`vcad`)throw new K(`manifest.format`,`must be "${iu}"`);if(a.version!==1)throw new K(`manifest.version`,`unsupported version ${String(a.version)}`);if(!Array.isArray(a.blocks)||!Array.isArray(a.assets))throw new K(`manifest`,`blocks and assets must be arrays`);let o=a.blocks.map((e,t)=>{let n=fu(i,e.file);if(!Array.isArray(n)||n.length!==4)throw new K(e.file,`block must be [name, basePoint, description, entities]`);let[r,a,o,s]=n;if(r!==e.name)throw new K(`manifest.blocks[${t}]`,`name "${e.name}" does not match the file ("${r}")`);return io(r,Gc(s),{basePoint:a,description:o})}),s=null;if(a.kind===`document`){s=Hc(fu(i,`document.json`));for(let e of o)s.blocks.add(e)}let c={};for(let e of a.assets){let t=i[cu(e)];if(!t)throw new K(`assets/${e}`,`is listed in the manifest but missing`);c[e]=t}return{manifest:a,document:s,blocks:o,assets:c}}var mu={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},hu={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},gu=1e3,_u=1001,vu=1002,yu=1003,bu=1004,xu=1005,Su=1006,Cu=1007,wu=1008,Tu=1009,Eu=1010,Du=1011,Ou=1012,ku=1013,Au=1014,ju=1015,Mu=1016,Nu=1017,Pu=1018,Fu=1020,Iu=35902,Lu=1021,Ru=1022,zu=1023,Bu=1024,Vu=1025,Hu=1026,Uu=1027,Wu=1028,Gu=1029,Ku=1030,qu=1031,Ju=1033,Yu=33776,Xu=33777,Zu=33778,Qu=33779,$u=35840,ed=35841,td=35842,nd=35843,rd=36196,id=37492,ad=37496,od=37808,sd=37809,cd=37810,ld=37811,ud=37812,dd=37813,fd=37814,pd=37815,md=37816,hd=37817,gd=37818,_d=37819,vd=37820,yd=37821,bd=36492,xd=36494,Sd=36495,Cd=36283,wd=36284,Td=36285,Ed=36286,Dd=2300,Od=2301,kd=2302,Ad=2400,jd=2401,Md=2402,Nd=3200,Pd=3201,Fd=`srgb`,Id=`srgb-linear`,Ld=`linear`,Rd=`srgb`,zd=7680,Bd=35044,Vd=2e3,Hd=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let e=n.indexOf(t);e!==-1&&n.splice(e,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let t=0,r=n.length;t<r;t++)n[t].call(this,e);e.target=null}}},Ud=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Wd=1234567,Gd=Math.PI/180,Kd=180/Math.PI;function qd(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Ud[e&255]+Ud[e>>8&255]+Ud[e>>16&255]+Ud[e>>24&255]+`-`+Ud[t&255]+Ud[t>>8&255]+`-`+Ud[t>>16&15|64]+Ud[t>>24&255]+`-`+Ud[n&63|128]+Ud[n>>8&255]+`-`+Ud[n>>16&255]+Ud[n>>24&255]+Ud[r&255]+Ud[r>>8&255]+Ud[r>>16&255]+Ud[r>>24&255]).toLowerCase()}function Jd(e,t,n){return Math.max(t,Math.min(n,e))}function Yd(e,t){return(e%t+t)%t}function Xd(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Zd(e,t,n){return e===t?0:(n-e)/(t-e)}function Qd(e,t,n){return(1-n)*e+n*t}function $d(e,t,n,r){return Qd(e,t,1-Math.exp(-n*r))}function ef(e,t=1){return t-Math.abs(Yd(e,t*2)-t)}function tf(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function nf(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function rf(e,t){return e+Math.floor(Math.random()*(t-e+1))}function af(e,t){return e+Math.random()*(t-e)}function of(e){return e*(.5-Math.random())}function sf(e){e!==void 0&&(Wd=e);let t=Wd+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function cf(e){return e*Gd}function lf(e){return e*Kd}function uf(e){return!(e&e-1)&&e!==0}function df(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function ff(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function pf(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function mf(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function hf(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var gf={DEG2RAD:Gd,RAD2DEG:Kd,generateUUID:qd,clamp:Jd,euclideanModulo:Yd,mapLinear:Xd,inverseLerp:Zd,lerp:Qd,damp:$d,pingpong:ef,smoothstep:tf,smootherstep:nf,randInt:rf,randFloat:af,randFloatSpread:of,seededRandom:sf,degToRad:cf,radToDeg:lf,isPowerOfTwo:uf,ceilPowerOfTwo:df,floorPowerOfTwo:ff,setQuaternionFromProperEuler:pf,normalize:hf,denormalize:mf},J=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Jd(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Y=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(_f.makeScale(e,t)),this}rotate(e){return this.premultiply(_f.makeRotation(-e)),this}translate(e,t){return this.premultiply(_f.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},_f=new Y;function vf(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function yf(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function bf(){let e=yf(`canvas`);return e.style.display=`block`,e}var xf={};function Sf(e){e in xf||(xf[e]=!0,console.warn(e))}function Cf(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}function wf(e){let t=e.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Tf(e){let t=e.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var Ef={enabled:!0,workingColorSpace:Id,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Df(e.r),e.g=Df(e.g),e.b=Df(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Of(e.r),e.g=Of(e.g),e.b=Of(e.b))),e},fromWorkingColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},toWorkingColorSpace:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Ld:this.spaces[e].transfer},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}};function Df(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Of(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var kf=[.64,.33,.3,.6,.15,.06],Af=[.2126,.7152,.0722],jf=[.3127,.329],Mf=new Y().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Nf=new Y().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ef.define({[Id]:{primaries:kf,whitePoint:jf,transfer:Ld,toXYZ:Mf,fromXYZ:Nf,luminanceCoefficients:Af,workingColorSpaceConfig:{unpackColorSpace:Fd},outputColorSpaceConfig:{drawingBufferColorSpace:Fd}},[Fd]:{primaries:kf,whitePoint:jf,transfer:Rd,toXYZ:Mf,fromXYZ:Nf,luminanceCoefficients:Af,outputColorSpaceConfig:{drawingBufferColorSpace:Fd}}});var Pf,Ff=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Pf===void 0&&(Pf=yf(`canvas`)),Pf.width=e.width,Pf.height=e.height;let n=Pf.getContext(`2d`);e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Pf}return t.width>2048||t.height>2048?(console.warn(`THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons`,e),t.toDataURL(`image/jpeg`,.6)):t.toDataURL(`image/png`)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=yf(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Df(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Df(t[e]/255)*255):t[e]=Df(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},If=0,Lf=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:If++}),this.uuid=qd(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Rf(r[t].image)):e.push(Rf(r[t]))}else e=Rf(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Rf(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ff.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var zf=0,Bf=class e extends Hd{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=_u,i=_u,a=Su,o=wu,s=zu,c=Tu,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:zf++}),this.uuid=qd(),this.name=``,this.source=new Lf(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new J(0,0),this.repeat=new J(1,1),this.center=new J(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Y,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case gu:e.x-=Math.floor(e.x);break;case _u:e.x=e.x<0?0:1;break;case vu:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case gu:e.y-=Math.floor(e.y);break;case _u:e.y=e.y<0?0:1;break;case vu:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Bf.DEFAULT_IMAGE=null,Bf.DEFAULT_MAPPING=300,Bf.DEFAULT_ANISOTROPY=1;var Vf=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Hf=class extends Hd{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Vf(0,0,e,t),this.scissorTest=!1,this.viewport=new Vf(0,0,e,t);let r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Su,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let i=new Bf(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);i.flipY=!1,i.generateMipmaps=n.generateMipmaps,i.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let e=0;e<a;e++)this.textures[e]=i.clone(),this.textures[e].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++)this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Lf(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},Uf=class extends Hf{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Wf=class extends Bf{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=yu,this.minFilter=yu,this.wrapR=_u,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Gf=class extends Bf{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=yu,this.minFilter=yu,this.wrapR=_u,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Kf=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0)e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;else if(o===1)e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;else{if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<2**-52?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Jd(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},X=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Jf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Jf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return qf.copy(this).projectOnVector(e),this.sub(qf)}reflect(e){return this.sub(qf.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Jd(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},qf=new X,Jf=new Kf,Yf=class{constructor(e=new X(1/0,1/0,1/0),t=new X(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Zf.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Zf.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Zf.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Zf):Zf.fromBufferAttribute(r,t),Zf.applyMatrix4(e.matrixWorld),this.expandByPoint(Zf);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Qf.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Qf.copy(e.boundingBox)),Qf.applyMatrix4(e.matrixWorld),this.union(Qf)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zf),Zf.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ap),op.subVectors(this.max,ap),$f.subVectors(e.a,ap),ep.subVectors(e.b,ap),tp.subVectors(e.c,ap),np.subVectors(ep,$f),rp.subVectors(tp,ep),ip.subVectors($f,tp);let t=[0,-np.z,np.y,0,-rp.z,rp.y,0,-ip.z,ip.y,np.z,0,-np.x,rp.z,0,-rp.x,ip.z,0,-ip.x,-np.y,np.x,0,-rp.y,rp.x,0,-ip.y,ip.x,0];return!lp(t,$f,ep,tp,op)||(t=[1,0,0,0,1,0,0,0,1],!lp(t,$f,ep,tp,op))?!1:(sp.crossVectors(np,rp),t=[sp.x,sp.y,sp.z],lp(t,$f,ep,tp,op))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zf).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zf).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Xf[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Xf[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Xf[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Xf[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Xf[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Xf[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Xf[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Xf[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Xf)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Xf=[new X,new X,new X,new X,new X,new X,new X,new X],Zf=new X,Qf=new Yf,$f=new X,ep=new X,tp=new X,np=new X,rp=new X,ip=new X,ap=new X,op=new X,sp=new X,cp=new X;function lp(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){cp.fromArray(e,a);let o=i.x*Math.abs(cp.x)+i.y*Math.abs(cp.y)+i.z*Math.abs(cp.z),s=t.dot(cp),c=n.dot(cp),l=r.dot(cp);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var up=new Yf,dp=new X,fp=new X,pp=class{constructor(e=new X,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?up.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;dp.subVectors(e,this.center);let t=dp.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(dp,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(fp.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(dp.copy(e.center).add(fp)),this.expandByPoint(dp.copy(e.center).sub(fp))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},mp=new X,hp=new X,gp=new X,_p=new X,vp=new X,yp=new X,bp=new X,xp=class{constructor(e=new X,t=new X(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,mp)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=mp.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(mp.copy(this.origin).addScaledVector(this.direction,t),mp.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){hp.copy(e).add(t).multiplyScalar(.5),gp.copy(t).sub(e).normalize(),_p.copy(this.origin).sub(hp);let i=e.distanceTo(t)*.5,a=-this.direction.dot(gp),o=_p.dot(this.direction),s=-_p.dot(gp),c=_p.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(hp).addScaledVector(gp,d),f}intersectSphere(e,t){mp.subVectors(e.center,this.origin);let n=mp.dot(this.direction),r=mp.dot(mp)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,mp)!==null}intersectTriangle(e,t,n,r,i){vp.subVectors(t,e),yp.subVectors(n,e),bp.crossVectors(vp,yp);let a=this.direction.dot(bp),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;_p.subVectors(this.origin,e);let s=o*this.direction.dot(yp.crossVectors(_p,yp));if(s<0)return null;let c=o*this.direction.dot(vp.cross(_p));if(c<0||s+c>a)return null;let l=-o*_p.dot(bp);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Sp=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Cp.setFromMatrixColumn(e,0).length(),i=1/Cp.setFromMatrixColumn(e,1).length(),a=1/Cp.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Tp,e,Ep)}lookAt(e,t,n){let r=this.elements;return kp.subVectors(e,t),kp.lengthSq()===0&&(kp.z=1),kp.normalize(),Dp.crossVectors(n,kp),Dp.lengthSq()===0&&(Math.abs(n.z)===1?kp.x+=1e-4:kp.z+=1e-4,kp.normalize(),Dp.crossVectors(n,kp)),Dp.normalize(),Op.crossVectors(kp,Dp),r[0]=Dp.x,r[4]=Op.x,r[8]=kp.x,r[1]=Dp.y,r[5]=Op.y,r[9]=kp.y,r[2]=Dp.z,r[6]=Op.z,r[10]=kp.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],ee=r[7],P=r[11],te=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*ee,i[8]=a*C+o*D+s*j+c*P,i[12]=a*w+o*O+s*M+c*te,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*ee,i[9]=l*C+u*D+d*j+f*P,i[13]=l*w+u*O+d*M+f*te,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*ee,i[10]=p*C+m*D+h*j+g*P,i[14]=p*w+m*O+h*M+g*te,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*ee,i[11]=_*C+v*D+y*j+b*P,i[15]=_*w+v*O+y*M+b*te,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=Cp.set(r[0],r[1],r[2]).length(),a=Cp.set(r[4],r[5],r[6]).length(),o=Cp.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],wp.copy(this);let s=1/i,c=1/a,l=1/o;return wp.elements[0]*=s,wp.elements[1]*=s,wp.elements[2]*=s,wp.elements[4]*=c,wp.elements[5]*=c,wp.elements[6]*=c,wp.elements[8]*=l,wp.elements[9]*=l,wp.elements[10]*=l,t.setFromRotationMatrix(wp),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=Vd){let s=this.elements,c=2*i/(t-e),l=2*i/(n-r),u=(t+e)/(t-e),d=(n+r)/(n-r),f,p;if(o===2e3)f=-(a+i)/(a-i),p=-2*a*i/(a-i);else if(o===2001)f=-a/(a-i),p=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return s[0]=c,s[4]=0,s[8]=u,s[12]=0,s[1]=0,s[5]=l,s[9]=d,s[13]=0,s[2]=0,s[6]=0,s[10]=f,s[14]=p,s[3]=0,s[7]=0,s[11]=-1,s[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Vd){let s=this.elements,c=1/(t-e),l=1/(n-r),u=1/(a-i),d=(t+e)*c,f=(n+r)*l,p,m;if(o===2e3)p=(a+i)*u,m=-2*u;else if(o===2001)p=i*u,m=-1*u;else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return s[0]=2*c,s[4]=0,s[8]=0,s[12]=-d,s[1]=0,s[5]=2*l,s[9]=0,s[13]=-f,s[2]=0,s[6]=0,s[10]=m,s[14]=-p,s[3]=0,s[7]=0,s[11]=0,s[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Cp=new X,wp=new Sp,Tp=new X(0,0,0),Ep=new X(1,1,1),Dp=new X,Op=new X,kp=new X,Ap=new Sp,jp=new Kf,Mp=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(Jd(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-Jd(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(Jd(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-Jd(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(Jd(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-Jd(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ap.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ap,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return jp.setFromEuler(this),this.setFromQuaternion(jp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Mp.DEFAULT_ORDER=`XYZ`;var Np=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Pp=0,Fp=new X,Ip=new Kf,Lp=new Sp,Rp=new X,zp=new X,Bp=new X,Vp=new Kf,Hp=new X(1,0,0),Up=new X(0,1,0),Wp=new X(0,0,1),Gp={type:`added`},Kp={type:`removed`},qp={type:`childadded`,child:null},Jp={type:`childremoved`,child:null},Yp=class e extends Hd{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Pp++}),this.uuid=qd(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new X,n=new Mp,r=new Kf,i=new X(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Sp},normalMatrix:{value:new Y}}),this.matrix=new Sp,this.matrixWorld=new Sp,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Np,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ip.setFromAxisAngle(e,t),this.quaternion.multiply(Ip),this}rotateOnWorldAxis(e,t){return Ip.setFromAxisAngle(e,t),this.quaternion.premultiply(Ip),this}rotateX(e){return this.rotateOnAxis(Hp,e)}rotateY(e){return this.rotateOnAxis(Up,e)}rotateZ(e){return this.rotateOnAxis(Wp,e)}translateOnAxis(e,t){return Fp.copy(e).applyQuaternion(this.quaternion),this.position.add(Fp.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Hp,e)}translateY(e){return this.translateOnAxis(Up,e)}translateZ(e){return this.translateOnAxis(Wp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Lp.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Rp.copy(e):Rp.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),zp.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Lp.lookAt(zp,Rp,this.up):Lp.lookAt(Rp,zp,this.up),this.quaternion.setFromRotationMatrix(Lp),r&&(Lp.extractRotation(r.matrixWorld),Ip.setFromRotationMatrix(Lp),this.quaternion.premultiply(Ip.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Gp),qp.child=e,this.dispatchEvent(qp),qp.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kp),Jp.child=e,this.dispatchEvent(Jp),Jp.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Lp.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Lp.multiply(e.parent.matrixWorld)),e.applyMatrix4(Lp),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Gp),qp.child=e,this.dispatchEvent(qp),qp.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zp,e,Bp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zp,Vp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(e=>({boxInitialized:e.boxInitialized,boxMin:e.box.min.toArray(),boxMax:e.box.max.toArray(),sphereInitialized:e.sphereInitialized,sphereRadius:e.sphere.radius,sphereCenter:e.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};Yp.DEFAULT_UP=new X(0,1,0),Yp.DEFAULT_MATRIX_AUTO_UPDATE=!0,Yp.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xp=new X,Zp=new X,Qp=new X,$p=new X,em=new X,tm=new X,nm=new X,rm=new X,im=new X,am=new X,om=new Vf,sm=new Vf,cm=new Vf,lm=class e{constructor(e=new X,t=new X,n=new X){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Xp.subVectors(e,t),r.cross(Xp);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Xp.subVectors(r,t),Zp.subVectors(n,t),Qp.subVectors(e,t);let a=Xp.dot(Xp),o=Xp.dot(Zp),s=Xp.dot(Qp),c=Zp.dot(Zp),l=Zp.dot(Qp),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,$p)!==null&&$p.x>=0&&$p.y>=0&&$p.x+$p.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,$p)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,$p.x),s.addScaledVector(a,$p.y),s.addScaledVector(o,$p.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return om.setScalar(0),sm.setScalar(0),cm.setScalar(0),om.fromBufferAttribute(e,t),sm.fromBufferAttribute(e,n),cm.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(om,i.x),a.addScaledVector(sm,i.y),a.addScaledVector(cm,i.z),a}static isFrontFacing(e,t,n,r){return Xp.subVectors(n,t),Zp.subVectors(e,t),Xp.cross(Zp).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Xp.subVectors(this.c,this.b),Zp.subVectors(this.a,this.b),Xp.cross(Zp).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;em.subVectors(r,n),tm.subVectors(i,n),rm.subVectors(e,n);let s=em.dot(rm),c=tm.dot(rm);if(s<=0&&c<=0)return t.copy(n);im.subVectors(e,r);let l=em.dot(im),u=tm.dot(im);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(em,a);am.subVectors(e,i);let f=em.dot(am),p=tm.dot(am);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(tm,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return nm.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(nm,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(em,a).addScaledVector(tm,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},um={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},dm={h:0,s:0,l:0},fm={h:0,s:0,l:0};function pm(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var mm=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Fd){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ef.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=Ef.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ef.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=Ef.workingColorSpace){if(e=Yd(e,1),t=Jd(t,0,1),n=Jd(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=pm(i,r,e+1/3),this.g=pm(i,r,e),this.b=pm(i,r,e-1/3)}return Ef.toWorkingColorSpace(this,r),this}setStyle(e,t=Fd){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Fd){let n=um[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Df(e.r),this.g=Df(e.g),this.b=Df(e.b),this}copyLinearToSRGB(e){return this.r=Of(e.r),this.g=Of(e.g),this.b=Of(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Fd){return Ef.fromWorkingColorSpace(hm.copy(this),e),Math.round(Jd(hm.r*255,0,255))*65536+Math.round(Jd(hm.g*255,0,255))*256+Math.round(Jd(hm.b*255,0,255))}getHexString(e=Fd){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ef.workingColorSpace){Ef.fromWorkingColorSpace(hm.copy(this),t);let n=hm.r,r=hm.g,i=hm.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Ef.workingColorSpace){return Ef.fromWorkingColorSpace(hm.copy(this),t),e.r=hm.r,e.g=hm.g,e.b=hm.b,e}getStyle(e=Fd){Ef.fromWorkingColorSpace(hm.copy(this),e);let t=hm.r,n=hm.g,r=hm.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(dm),this.setHSL(dm.h+e,dm.s+t,dm.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(dm),e.getHSL(fm);let n=Qd(dm.h,fm.h,t),r=Qd(dm.s,fm.s,t),i=Qd(dm.l,fm.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},hm=new mm;mm.NAMES=um;var gm=0,_m=class extends Hd{static get type(){return`Material`}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=qd(),this.name=``,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new mm(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=zd,this.stencilZFail=zd,this.stencilZPass=zd,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn(`Material: onBuild() has been removed.`)}},vm=class extends _m{static get type(){return`MeshBasicMaterial`}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new mm(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mp,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ym=new X,bm=new J,xm=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Bd,this.updateRanges=[],this.gpuType=ju,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)bm.fromBufferAttribute(this,t),bm.applyMatrix3(e),this.setXY(t,bm.x,bm.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ym.fromBufferAttribute(this,t),ym.applyMatrix3(e),this.setXYZ(t,ym.x,ym.y,ym.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ym.fromBufferAttribute(this,t),ym.applyMatrix4(e),this.setXYZ(t,ym.x,ym.y,ym.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ym.fromBufferAttribute(this,t),ym.applyNormalMatrix(e),this.setXYZ(t,ym.x,ym.y,ym.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ym.fromBufferAttribute(this,t),ym.transformDirection(e),this.setXYZ(t,ym.x,ym.y,ym.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=mf(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=hf(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=mf(t,this.array)),t}setX(e,t){return this.normalized&&(t=hf(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=mf(t,this.array)),t}setY(e,t){return this.normalized&&(t=hf(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=mf(t,this.array)),t}setZ(e,t){return this.normalized&&(t=hf(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=mf(t,this.array)),t}setW(e,t){return this.normalized&&(t=hf(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=hf(t,this.array),n=hf(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=hf(t,this.array),n=hf(n,this.array),r=hf(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=hf(t,this.array),n=hf(n,this.array),r=hf(r,this.array),i=hf(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},Sm=class extends xm{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Cm=class extends xm{constructor(e,t,n){super(new Uint32Array(e),t,n)}},wm=class extends xm{constructor(e,t,n){super(new Float32Array(e),t,n)}},Tm=0,Em=new Sp,Dm=new Yp,Om=new X,km=new Yf,Am=new Yf,jm=new X,Mm=class e extends Hd{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Tm++}),this.uuid=qd(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(vf(e)?Cm:Sm)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new Y().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Em.makeRotationFromQuaternion(e),this.applyMatrix4(Em),this}rotateX(e){return Em.makeRotationX(e),this.applyMatrix4(Em),this}rotateY(e){return Em.makeRotationY(e),this.applyMatrix4(Em),this}rotateZ(e){return Em.makeRotationZ(e),this.applyMatrix4(Em),this}translate(e,t,n){return Em.makeTranslation(e,t,n),this.applyMatrix4(Em),this}scale(e,t,n){return Em.makeScale(e,t,n),this.applyMatrix4(Em),this}lookAt(e){return Dm.lookAt(e),Dm.updateMatrix(),this.applyMatrix4(Dm.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Om).negate(),this.translate(Om.x,Om.y,Om.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new wm(t,3))}else{for(let n=0,r=t.count;n<r;n++){let r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Yf);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new X(-1/0,-1/0,-1/0),new X(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];km.setFromBufferAttribute(n),this.morphTargetsRelative?(jm.addVectors(this.boundingBox.min,km.min),this.boundingBox.expandByPoint(jm),jm.addVectors(this.boundingBox.max,km.max),this.boundingBox.expandByPoint(jm)):(this.boundingBox.expandByPoint(km.min),this.boundingBox.expandByPoint(km.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new pp);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new X,1/0);else if(e){let n=this.boundingSphere.center;if(km.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Am.setFromBufferAttribute(n),this.morphTargetsRelative?(jm.addVectors(km.min,Am.min),km.expandByPoint(jm),jm.addVectors(km.max,Am.max),km.expandByPoint(jm)):(km.expandByPoint(Am.min),km.expandByPoint(Am.max))}km.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)jm.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(jm));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)jm.fromBufferAttribute(a,t),o&&(Om.fromBufferAttribute(e,t),jm.add(Om)),r=Math.max(r,n.distanceToSquared(jm))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new xm(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new X,s[e]=new X;let c=new X,l=new X,u=new X,d=new J,f=new J,p=new J,m=new X,h=new X;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new X,y=new X,b=new X,x=new X;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new xm(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new X,i=new X,a=new X,o=new X,s=new X,c=new X,l=new X,u=new X;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)jm.fromBufferAttribute(e,t),jm.normalize(),e.setXYZ(t,jm.x,jm.y,jm.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new xm(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.6,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Nm=new Sp,Pm=new xp,Fm=new pp,Im=new X,Lm=new X,Rm=new X,zm=new X,Bm=new X,Vm=new X,Hm=new X,Um=new X,Wm=class extends Yp{constructor(e=new Mm,t=new vm){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Vm.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Bm.fromBufferAttribute(s,e),a?Vm.addScaledVector(Bm,r):Vm.addScaledVector(Bm.sub(t),r))}t.add(Vm)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Fm.copy(n.boundingSphere),Fm.applyMatrix4(i),Pm.copy(e.ray).recast(e.near),Fm.containsPoint(Pm.origin)===!1&&(Pm.intersectSphere(Fm,Im)===null||Pm.origin.distanceToSquared(Im)>(e.far-e.near)**2)||(Nm.copy(i).invert(),Pm.copy(e.ray).applyMatrix4(Nm),(n.boundingBox===null||Pm.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Pm)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Km(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Km(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Km(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Km(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Gm(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Um.copy(s),Um.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Um);return l<n.near||l>n.far?null:{distance:l,point:Um.clone(),object:e}}function Km(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Lm),e.getVertexPosition(c,Rm),e.getVertexPosition(l,zm);let u=Gm(e,t,n,r,Lm,Rm,zm,Hm);if(u){let e=new X;lm.getBarycoord(Hm,Lm,Rm,zm,e),i&&(u.uv=lm.getInterpolatedAttribute(i,s,c,l,e,new J)),a&&(u.uv1=lm.getInterpolatedAttribute(a,s,c,l,e,new J)),o&&(u.normal=lm.getInterpolatedAttribute(o,s,c,l,e,new X),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new X,materialIndex:0};lm.getNormal(Lm,Rm,zm,t.normal),u.face=t,u.barycoord=e}return u}var qm=class e extends Mm{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new wm(c,3)),this.setAttribute(`normal`,new wm(l,3)),this.setAttribute(`uv`,new wm(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new X;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Jm(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function Ym(e){let t={};for(let n=0;n<e.length;n++){let r=Jm(e[n]);for(let e in r)t[e]=r[e]}return t}function Xm(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Zm(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Ef.workingColorSpace}var Qm={clone:Jm,merge:Ym},$m=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,eh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,th=class extends _m{static get type(){return`ShaderMaterial`}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=$m,this.fragmentShader=eh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Jm(e.uniforms),this.uniformsGroups=Xm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},nh=class extends Yp{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Sp,this.projectionMatrix=new Sp,this.projectionMatrixInverse=new Sp,this.coordinateSystem=Vd}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},rh=new X,ih=new J,ah=new J,oh=class extends nh{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Kd*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Gd*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Kd*2*Math.atan(Math.tan(Gd*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){rh.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(rh.x,rh.y).multiplyScalar(-e/rh.z),rh.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(rh.x,rh.y).multiplyScalar(-e/rh.z)}getViewSize(e,t){return this.getViewBounds(e,ih,ah),t.subVectors(ah,ih)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Gd*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},sh=-90,ch=1,lh=class extends Yp{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new oh(sh,ch,e,t);r.layers=this.layers,this.add(r);let i=new oh(sh,ch,e,t);i.layers=this.layers,this.add(i);let a=new oh(sh,ch,e,t);a.layers=this.layers,this.add(a);let o=new oh(sh,ch,e,t);o.layers=this.layers,this.add(o);let s=new oh(sh,ch,e,t);s.layers=this.layers,this.add(s);let c=new oh(sh,ch,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},uh=class extends Bf{constructor(e,t,n,r,i,a,o,s,c,l){e=e===void 0?[]:e,t=t===void 0?301:t,super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},dh=class extends Uf{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new uh(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0&&t.generateMipmaps,this.texture.minFilter=t.minFilter===void 0?Su:t.minFilter}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new qm(5,5,5),i=new th({name:`CubemapFromEquirect`,uniforms:Jm(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Wm(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=Su),new lh(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,r){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},fh=new X,ph=new X,mh=new Y,hh=class{constructor(e=new X(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=fh.subVectors(n,t).cross(ph.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(fh),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||mh.getNormalMatrix(e),r=this.coplanarPoint(fh).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},gh=new pp,_h=new X,vh=class{constructor(e=new hh,t=new hh,n=new hh,r=new hh,i=new hh,a=new hh){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Vd){let n=this.planes,r=e.elements,i=r[0],a=r[1],o=r[2],s=r[3],c=r[4],l=r[5],u=r[6],d=r[7],f=r[8],p=r[9],m=r[10],h=r[11],g=r[12],_=r[13],v=r[14],y=r[15];if(n[0].setComponents(s-i,d-c,h-f,y-g).normalize(),n[1].setComponents(s+i,d+c,h+f,y+g).normalize(),n[2].setComponents(s+a,d+l,h+p,y+_).normalize(),n[3].setComponents(s-a,d-l,h-p,y-_).normalize(),n[4].setComponents(s-o,d-u,h-m,y-v).normalize(),t===2e3)n[5].setComponents(s+o,d+u,h+m,y+v).normalize();else if(t===2001)n[5].setComponents(o,u,m,v).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gh.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gh.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gh)}intersectsSprite(e){return gh.center.set(0,0,0),gh.radius=.7071067811865476,gh.applyMatrix4(e.matrixWorld),this.intersectsSphere(gh)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(_h.x=r.normal.x>0?e.max.x:e.min.x,_h.y=r.normal.y>0?e.max.y:e.min.y,_h.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(_h)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function yh(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function bh(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var xh=class e extends Mm{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new wm(p,3)),this.setAttribute(`normal`,new wm(m,3)),this.setAttribute(`uv`,new wm(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Z={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Q={common:{diffuse:{value:new mm(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Y}},envmap:{envMap:{value:null},envMapRotation:{value:new Y},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Y}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Y}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Y},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Y},normalScale:{value:new J(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Y},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Y}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Y}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Y}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new mm(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new mm(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0},uvTransform:{value:new Y}},sprite:{diffuse:{value:new mm(16777215)},opacity:{value:1},center:{value:new J(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}}},Sh={basic:{uniforms:Ym([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.fog]),vertexShader:Z.meshbasic_vert,fragmentShader:Z.meshbasic_frag},lambert:{uniforms:Ym([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new mm(0)}}]),vertexShader:Z.meshlambert_vert,fragmentShader:Z.meshlambert_frag},phong:{uniforms:Ym([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new mm(0)},specular:{value:new mm(1118481)},shininess:{value:30}}]),vertexShader:Z.meshphong_vert,fragmentShader:Z.meshphong_frag},standard:{uniforms:Ym([Q.common,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.roughnessmap,Q.metalnessmap,Q.fog,Q.lights,{emissive:{value:new mm(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag},toon:{uniforms:Ym([Q.common,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.gradientmap,Q.fog,Q.lights,{emissive:{value:new mm(0)}}]),vertexShader:Z.meshtoon_vert,fragmentShader:Z.meshtoon_frag},matcap:{uniforms:Ym([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,{matcap:{value:null}}]),vertexShader:Z.meshmatcap_vert,fragmentShader:Z.meshmatcap_frag},points:{uniforms:Ym([Q.points,Q.fog]),vertexShader:Z.points_vert,fragmentShader:Z.points_frag},dashed:{uniforms:Ym([Q.common,Q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Z.linedashed_vert,fragmentShader:Z.linedashed_frag},depth:{uniforms:Ym([Q.common,Q.displacementmap]),vertexShader:Z.depth_vert,fragmentShader:Z.depth_frag},normal:{uniforms:Ym([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,{opacity:{value:1}}]),vertexShader:Z.meshnormal_vert,fragmentShader:Z.meshnormal_frag},sprite:{uniforms:Ym([Q.sprite,Q.fog]),vertexShader:Z.sprite_vert,fragmentShader:Z.sprite_frag},background:{uniforms:{uvTransform:{value:new Y},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Z.background_vert,fragmentShader:Z.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Y}},vertexShader:Z.backgroundCube_vert,fragmentShader:Z.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Z.cube_vert,fragmentShader:Z.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Z.equirect_vert,fragmentShader:Z.equirect_frag},distanceRGBA:{uniforms:Ym([Q.common,Q.displacementmap,{referencePosition:{value:new X},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Z.distanceRGBA_vert,fragmentShader:Z.distanceRGBA_frag},shadow:{uniforms:Ym([Q.lights,Q.fog,{color:{value:new mm(0)},opacity:{value:1}}]),vertexShader:Z.shadow_vert,fragmentShader:Z.shadow_frag}};Sh.physical={uniforms:Ym([Sh.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Y},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Y},clearcoatNormalScale:{value:new J(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Y},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Y},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Y},sheen:{value:0},sheenColor:{value:new mm(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Y},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Y},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Y},transmissionSamplerSize:{value:new J},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Y},attenuationDistance:{value:0},attenuationColor:{value:new mm(0)},specularColor:{value:new mm(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Y},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Y},anisotropyVector:{value:new J},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Y}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag};var Ch={r:0,b:0,g:0},wh=new Mp,Th=new Sp;function Eh(e,t,n,r,i,a,o){let s=new mm(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new Wm(new qm(1,1,1),new th({name:`BackgroundCubeMaterial`,uniforms:Jm(Sh.backgroundCube.uniforms),vertexShader:Sh.backgroundCube.vertexShader,fragmentShader:Sh.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),wh.copy(n.backgroundRotation),wh.x*=-1,wh.y*=-1,wh.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(wh.y*=-1,wh.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Th.makeRotationFromEuler(wh)),u.material.toneMapped=Ef.getTransfer(r.colorSpace)!==Rd,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new Wm(new xh(2,2),new th({name:`BackgroundMaterial`,uniforms:Jm(Sh.background.uniforms),vertexShader:Sh.background.vertexShader,fragmentShader:Sh.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Ef.getTransfer(r.colorSpace)!==Rd,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Ch,Zm(e)),r.buffers.color.setClear(Ch.r,Ch.g,Ch.b,n,o)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g}}function Dh(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Oh(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function kh(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reverseDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Ah(e){let t=this,n=null,r=0,i=!1,a=!1,o=new hh,s=new Y,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function jh(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new dh(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Mh=class extends nh{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Nh=4,Ph=[.125,.215,.35,.446,.526,.582],Fh=20,Ih=new Mh,Lh=new mm,Rh=null,zh=0,Bh=0,Vh=!1,Hh=(1+Math.sqrt(5))/2,Uh=1/Hh,Wh=[new X(-Hh,Uh,0),new X(Hh,Uh,0),new X(-Uh,0,Hh),new X(Uh,0,Hh),new X(0,Hh,-Uh),new X(0,Hh,Uh),new X(-1,1,-1),new X(1,1,-1),new X(-1,1,1),new X(1,1,1)],Gh=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Rh=this._renderer.getRenderTarget(),zh=this._renderer.getActiveCubeFace(),Bh=this._renderer.getActiveMipmapLevel(),Vh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let i=this._allocateTargets();return i.depthBuffer=!0,this._sceneToCubeUV(e,n,r,i),t>0&&this._blur(i,0,0,t),this._applyPMREM(i),this._cleanup(i),i}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Zh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Rh,zh,Bh),this._renderer.xr.enabled=Vh,e.scissorTest=!1,Jh(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Rh=this._renderer.getRenderTarget(),zh=this._renderer.getActiveCubeFace(),Bh=this._renderer.getActiveMipmapLevel(),Vh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Su,minFilter:Su,generateMipmaps:!1,type:Mu,format:zu,colorSpace:Id,depthBuffer:!1},r=qh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=qh(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Kh(r)),this._blurMaterial=Yh(r,e,t)}return r}_compileMaterial(e){let t=new Wm(this._lodPlanes[0],e);this._renderer.compile(t,Ih)}_sceneToCubeUV(e,t,n,r){let i=new oh(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],s=this._renderer,c=s.autoClear,l=s.toneMapping;s.getClearColor(Lh),s.toneMapping=0,s.autoClear=!1;let u=new vm({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),d=new Wm(new qm,u),f=!1,p=e.background;p?p.isColor&&(u.color.copy(p),e.background=null,f=!0):(u.color.copy(Lh),f=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(i.up.set(0,a[t],0),i.lookAt(o[t],0,0)):n===1?(i.up.set(0,0,a[t]),i.lookAt(0,o[t],0)):(i.up.set(0,a[t],0),i.lookAt(0,0,o[t]));let c=this._cubeSize;Jh(r,n*c,t>2?c:0,c,c),s.setRenderTarget(r),f&&s.render(d,i),s.render(e,i)}d.geometry.dispose(),d.material.dispose(),s.toneMapping=l,s.autoClear=c,e.background=p}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Zh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xh());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new Wm(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Jh(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Ih)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Wh[(r-t-1)%Wh.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new Wm(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):Fh;m>Fh&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Fh}`);let h=[],g=0;for(let e=0;e<Fh;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Jh(t,3*v*(r>_-Nh?r-_+Nh:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Ih)}};function Kh(e){let t=[],n=[],r=[],i=e,a=e-Nh+1+Ph.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Nh?s=Ph[o-e+Nh-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Mm;h.setAttribute(`position`,new xm(f,3)),h.setAttribute(`uv`,new xm(p,2)),h.setAttribute(`faceIndex`,new xm(m,1)),t.push(h),i>Nh&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function qh(e,t,n){let r=new Uf(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Jh(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Yh(e,t,n){let r=new Float32Array(Fh),i=new X(0,1,0);return new th({name:`SphericalGaussianBlur`,defines:{n:Fh,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Qh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Xh(){return new th({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Qh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Zh(){return new th({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Qh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Qh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function $h(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new Gh(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new Gh(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function eg(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Sf(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function tg(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);for(let e in s.morphAttributes){let n=s.morphAttributes[e];for(let e=0,r=n.length;e<r;e++)t.remove(n[e])}s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER);let i=n.morphAttributes;for(let n in i){let r=i[n];for(let n=0,i=r.length;n<i;n++)t.update(r[n],e.ARRAY_BUFFER)}}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(vf(n)?Cm:Sm)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function ng(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function rg(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function ig(e,t,n){let r=new WeakMap,i=new Vf;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Wf(h,p,m,u);g.type=ju,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new J(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function ag(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var og=class extends Bf{constructor(e,t,n,r,i,a,o,s,c,l=Hu){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);n===void 0&&l===1026&&(n=Au),n===void 0&&l===1027&&(n=Fu),super(null,r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o===void 0?yu:o,this.minFilter=s===void 0?yu:s,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},sg=new Bf,cg=new og(1,1),lg=new Wf,ug=new Gf,dg=new uh,fg=[],pg=[],mg=new Float32Array(16),hg=new Float32Array(9),gg=new Float32Array(4);function _g(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=fg[i];if(a===void 0&&(a=new Float32Array(i),fg[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function vg(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function yg(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function bg(e,t){let n=pg[t];n===void 0&&(n=new Int32Array(t),pg[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function xg(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Sg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(vg(n,t))return;e.uniform2fv(this.addr,t),yg(n,t)}}function Cg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(vg(n,t))return;e.uniform3fv(this.addr,t),yg(n,t)}}function wg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(vg(n,t))return;e.uniform4fv(this.addr,t),yg(n,t)}}function Tg(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(vg(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),yg(n,t)}else{if(vg(n,r))return;gg.set(r),e.uniformMatrix2fv(this.addr,!1,gg),yg(n,r)}}function Eg(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(vg(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),yg(n,t)}else{if(vg(n,r))return;hg.set(r),e.uniformMatrix3fv(this.addr,!1,hg),yg(n,r)}}function Dg(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(vg(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),yg(n,t)}else{if(vg(n,r))return;mg.set(r),e.uniformMatrix4fv(this.addr,!1,mg),yg(n,r)}}function Og(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function kg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(vg(n,t))return;e.uniform2iv(this.addr,t),yg(n,t)}}function Ag(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(vg(n,t))return;e.uniform3iv(this.addr,t),yg(n,t)}}function jg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(vg(n,t))return;e.uniform4iv(this.addr,t),yg(n,t)}}function Mg(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Ng(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(vg(n,t))return;e.uniform2uiv(this.addr,t),yg(n,t)}}function Pg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(vg(n,t))return;e.uniform3uiv(this.addr,t),yg(n,t)}}function Fg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(vg(n,t))return;e.uniform4uiv(this.addr,t),yg(n,t)}}function Ig(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(cg.compareFunction=515,a=cg):a=sg,n.setTexture2D(t||a,i)}function Lg(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||ug,i)}function Rg(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||dg,i)}function zg(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||lg,i)}function Bg(e){switch(e){case 5126:return xg;case 35664:return Sg;case 35665:return Cg;case 35666:return wg;case 35674:return Tg;case 35675:return Eg;case 35676:return Dg;case 5124:case 35670:return Og;case 35667:case 35671:return kg;case 35668:case 35672:return Ag;case 35669:case 35673:return jg;case 5125:return Mg;case 36294:return Ng;case 36295:return Pg;case 36296:return Fg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ig;case 35679:case 36299:case 36307:return Lg;case 35680:case 36300:case 36308:case 36293:return Rg;case 36289:case 36303:case 36311:case 36292:return zg}}function Vg(e,t){e.uniform1fv(this.addr,t)}function Hg(e,t){let n=_g(t,this.size,2);e.uniform2fv(this.addr,n)}function Ug(e,t){let n=_g(t,this.size,3);e.uniform3fv(this.addr,n)}function Wg(e,t){let n=_g(t,this.size,4);e.uniform4fv(this.addr,n)}function Gg(e,t){let n=_g(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Kg(e,t){let n=_g(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function qg(e,t){let n=_g(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Jg(e,t){e.uniform1iv(this.addr,t)}function Yg(e,t){e.uniform2iv(this.addr,t)}function Xg(e,t){e.uniform3iv(this.addr,t)}function Zg(e,t){e.uniform4iv(this.addr,t)}function Qg(e,t){e.uniform1uiv(this.addr,t)}function $g(e,t){e.uniform2uiv(this.addr,t)}function e_(e,t){e.uniform3uiv(this.addr,t)}function t_(e,t){e.uniform4uiv(this.addr,t)}function n_(e,t,n){let r=this.cache,i=t.length,a=bg(n,i);vg(r,a)||(e.uniform1iv(this.addr,a),yg(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||sg,a[e])}function r_(e,t,n){let r=this.cache,i=t.length,a=bg(n,i);vg(r,a)||(e.uniform1iv(this.addr,a),yg(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||ug,a[e])}function i_(e,t,n){let r=this.cache,i=t.length,a=bg(n,i);vg(r,a)||(e.uniform1iv(this.addr,a),yg(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||dg,a[e])}function a_(e,t,n){let r=this.cache,i=t.length,a=bg(n,i);vg(r,a)||(e.uniform1iv(this.addr,a),yg(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||lg,a[e])}function o_(e){switch(e){case 5126:return Vg;case 35664:return Hg;case 35665:return Ug;case 35666:return Wg;case 35674:return Gg;case 35675:return Kg;case 35676:return qg;case 5124:case 35670:return Jg;case 35667:case 35671:return Yg;case 35668:case 35672:return Xg;case 35669:case 35673:return Zg;case 5125:return Qg;case 36294:return $g;case 36295:return e_;case 36296:return t_;case 35678:case 36198:case 36298:case 36306:case 35682:return n_;case 35679:case 36299:case 36307:return r_;case 35680:case 36300:case 36308:case 36293:return i_;case 36289:case 36303:case 36311:case 36292:return a_}}var s_=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Bg(t.type)}},c_=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=o_(t.type)}},l_=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},u_=/(\w+)(\])?(\[|\.)?/g;function d_(e,t){e.seq.push(t),e.map[t.id]=t}function f_(e,t,n){let r=e.name,i=r.length;for(u_.lastIndex=0;;){let a=u_.exec(r),o=u_.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){d_(n,l===void 0?new s_(s,e,t):new c_(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new l_(s),d_(n,e)),n=e}}}var p_=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);f_(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function m_(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var h_=37297,g_=0;function __(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var v_=new Y;function y_(e){Ef._getMatrix(v_,Ef.workingColorSpace,e);let t=`mat3( ${v_.elements.map(e=>e.toFixed(4))} )`;switch(Ef.getTransfer(e)){case Ld:return[t,`LinearTransferOETF`];case Rd:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function b_(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=e.getShaderInfoLog(t).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+__(e.getShaderSource(t),r)}return i}function x_(e,t){let n=y_(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function S_(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var C_=new X;function w_(){return Ef.getLuminanceCoefficients(C_),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${C_.x.toFixed(4)}, ${C_.y.toFixed(4)}, ${C_.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function T_(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(O_).join(`
`)}function E_(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function D_(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function O_(e){return e!==``}function k_(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function A_(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var j_=/^[ \t]*#include +<([\w\d./]+)>/gm;function M_(e){return e.replace(j_,P_)}var N_=new Map;function P_(e,t){let n=Z[t];if(n===void 0){let e=N_.get(t);if(e!==void 0)n=Z[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return M_(n)}var F_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function I_(e){return e.replace(F_,L_)}function L_(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function R_(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function z_(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function B_(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function V_(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function H_(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function U_(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function W_(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=z_(n),l=B_(n),u=V_(n),d=H_(n),f=U_(n),p=T_(n),m=E_(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(O_).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(O_).join(`
`),_.length>0&&(_+=`
`)):(g=[R_(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGDEPTHBUF`:``,n.reverseDepthBuffer?`#define USE_REVERSEDEPTHBUF`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(O_).join(`
`),_=[R_(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGDEPTHBUF`:``,n.reverseDepthBuffer?`#define USE_REVERSEDEPTHBUF`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Z.tonemapping_pars_fragment,n.toneMapping===0?``:S_(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Z.colorspace_pars_fragment,x_(`linearToOutputTexel`,n.outputColorSpace),w_(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(O_).join(`
`)),o=M_(o),o=k_(o,n),o=A_(o,n),s=M_(s),s=k_(s,n),s=A_(s,n),o=I_(o),s=I_(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=m_(i,i.VERTEX_SHADER,y),S=m_(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h).trim(),r=i.getShaderInfoLog(x).trim(),a=i.getShaderInfoLog(S).trim(),o=!0,s=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(o=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=b_(i,x,`vertex`),r=b_(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+n+`
`+e+`
`+r)}}else n===``?(r===``||a===``)&&(s=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,n);s&&(t.diagnostics={runnable:o,programLog:n,vertexShader:{log:r,prefix:g},fragmentShader:{log:a,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new p_(i,h),T=D_(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,h_)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=g_++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var G_=0,K_=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new q_(e),t.set(e,n)),n}},q_=class{constructor(e){this.id=G_++,this.code=e,this.usedTimes=0}};function J_(e,t,n,r,i,a,o){let s=new Np,c=new K_,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Sh[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),N=_.isInstancedMesh===!0,ee=_.isBatchedMesh===!0,P=!!a.map,te=!!a.matcap,ne=!!x,re=!!a.aoMap,ie=!!a.lightMap,ae=!!a.bumpMap,F=!!a.normalMap,oe=!!a.displacementMap,I=!!a.emissiveMap,se=!!a.metalnessMap,ce=!!a.roughnessMap,le=a.anisotropy>0,ue=a.clearcoat>0,de=a.dispersion>0,L=a.iridescence>0,fe=a.sheen>0,pe=a.transmission>0,me=le&&!!a.anisotropyMap,R=ue&&!!a.clearcoatMap,he=ue&&!!a.clearcoatNormalMap,z=ue&&!!a.clearcoatRoughnessMap,B=L&&!!a.iridescenceMap,ge=L&&!!a.iridescenceThicknessMap,_e=fe&&!!a.sheenColorMap,ve=fe&&!!a.sheenRoughnessMap,ye=!!a.specularMap,V=!!a.specularColorMap,be=!!a.specularIntensityMap,xe=pe&&!!a.transmissionMap,Se=pe&&!!a.thicknessMap,Ce=!!a.gradientMap,we=!!a.alphaMap,Te=a.alphaTest>0,Ee=!!a.alphaHash,De=!!a.extensions,Oe=0;a.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Oe=e.toneMapping);let ke={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:ee,batchingColor:ee&&_._colorsTexture!==null,instancing:N,instancingColor:N&&_.instanceColor!==null,instancingMorph:N&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Id,alphaToCoverage:!!a.alphaToCoverage,map:P,matcap:te,envMap:ne,envMapMode:ne&&x.mapping,envMapCubeUVHeight:S,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:F,displacementMap:f&&oe,emissiveMap:I,normalMapObjectSpace:F&&a.normalMapType===1,normalMapTangentSpace:F&&a.normalMapType===0,metalnessMap:se,roughnessMap:ce,anisotropy:le,anisotropyMap:me,clearcoat:ue,clearcoatMap:R,clearcoatNormalMap:he,clearcoatRoughnessMap:z,dispersion:de,iridescence:L,iridescenceMap:B,iridescenceThicknessMap:ge,sheen:fe,sheenColorMap:_e,sheenRoughnessMap:ve,specularMap:ye,specularColorMap:V,specularIntensityMap:be,transmission:pe,transmissionMap:xe,thicknessMap:Se,gradientMap:Ce,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:we,alphaTest:Te,alphaHash:Ee,combine:a.combine,mapUv:P&&h(a.map.channel),aoMapUv:re&&h(a.aoMap.channel),lightMapUv:ie&&h(a.lightMap.channel),bumpMapUv:ae&&h(a.bumpMap.channel),normalMapUv:F&&h(a.normalMap.channel),displacementMapUv:oe&&h(a.displacementMap.channel),emissiveMapUv:I&&h(a.emissiveMap.channel),metalnessMapUv:se&&h(a.metalnessMap.channel),roughnessMapUv:ce&&h(a.roughnessMap.channel),anisotropyMapUv:me&&h(a.anisotropyMap.channel),clearcoatMapUv:R&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:he&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:z&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:B&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:ge&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:ve&&h(a.sheenRoughnessMap.channel),specularMapUv:ye&&h(a.specularMap.channel),specularColorMapUv:V&&h(a.specularColorMap.channel),specularIntensityMapUv:be&&h(a.specularIntensityMap.channel),transmissionMapUv:xe&&h(a.transmissionMap.channel),thicknessMapUv:Se&&h(a.thicknessMap.channel),alphaMapUv:we&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(F||le),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(P||we),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:M,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Oe,decodeVideoTexture:P&&a.map.isVideoTexture===!0&&Ef.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:I&&a.emissiveMap.isVideoTexture===!0&&Ef.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:De&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(De&&a.extensions.multiDraw===!0||ee)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return ke.vertexUv1s=l.has(1),ke.vertexUv2s=l.has(2),ke.vertexUv3s=l.has(3),l.clear(),ke}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reverseDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Sh[t];n=Qm.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new W_(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Y_(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function X_(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Z_(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Q_(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||X_),r.length>1&&r.sort(t||Z_),i.length>1&&i.sort(t||Z_)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function $_(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Q_,e.set(t,[i])):n>=r.length?(i=new Q_,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function ev(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new X,color:new mm};break;case`SpotLight`:n={position:new X,direction:new X,color:new mm,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new X,color:new mm,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new X,skyColor:new mm,groundColor:new mm};break;case`RectAreaLight`:n={color:new mm,position:new X,halfWidth:new X,halfHeight:new X}}return e[t.id]=n,n}}}function tv(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var nv=0;function rv(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function iv(e){let t=new ev,n=tv(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new X);let i=new X,a=new Sp,o=new Sp;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(rv);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Q.LTC_FLOAT_1,r.rectAreaLTC2=Q.LTC_FLOAT_2):(r.rectAreaLTC1=Q.LTC_HALF_1,r.rectAreaLTC2=Q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=nv++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function av(e){let t=new iv(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function ov(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new av(e),t.set(n,[a])):r>=i.length?(a=new av(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var sv=class extends _m{static get type(){return`MeshDepthMaterial`}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Nd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},cv=class extends _m{static get type(){return`MeshDistanceMaterial`}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},lv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,uv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function dv(e,t,n){let r=new vh,i=new J,a=new J,o=new Vf,s=new sv({depthPacking:Pd}),c=new cv,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new th({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new J},radius:{value:4}},vertexShader:lv,fragmentShader:uv}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Mm;m.setAttribute(`position`,new xm(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new Wm(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:yu,magFilter:yu};d.map!==null&&d.map.dispose(),d.map=new Uf(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Uf(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var fv={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function pv(e,t){function n(){let t=!1,n=new Vf,r=null,i=new Vf(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let e=t.get(`EXT_clip_control`);r?e.clipControlEXT(e.LOWER_LEFT_EXT,e.ZERO_TO_ONE_EXT):e.clipControlEXT(e.LOWER_LEFT_EXT,e.NEGATIVE_ONE_TO_ONE_EXT);let n=o;o=null,this.setClear(n)}r=e},getReversed:function(){return r},setTest:function(t){t?I(e.DEPTH_TEST):se(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=fv[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?I(e.STENCIL_TEST):se(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new mm(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,N=0,ee=e.getParameter(e.VERSION);ee.indexOf(`WebGL`)===-1?ee.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),M=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(ee)[1]),M=N>=1);let P=null,te={},ne=e.getParameter(e.SCISSOR_BOX),re=e.getParameter(e.VIEWPORT),ie=new Vf().fromArray(ne),ae=new Vf().fromArray(re);function F(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let oe={};oe[e.TEXTURE_2D]=F(e.TEXTURE_2D,e.TEXTURE_2D,1),oe[e.TEXTURE_CUBE_MAP]=F(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[e.TEXTURE_2D_ARRAY]=F(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),oe[e.TEXTURE_3D]=F(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),I(e.DEPTH_TEST),o.setFunc(3),me(!1),R(1),I(e.CULL_FACE),fe(0);function I(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function se(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ce(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function le(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ue(t){return m!==t&&(e.useProgram(t),m=t,!0)}let de={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};de[103]=e.MIN,de[104]=e.MAX;let L={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function fe(t,n,r,i,a,o,s,c,l,u){if(t===0)h===!0&&(se(e.BLEND),h=!1);else if(h===!1&&(I(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.ZERO,e.SRC_COLOR,e.ZERO,e.SRC_ALPHA);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.SRC_ALPHA,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFunc(e.ZERO,e.SRC_COLOR);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}}else a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(de[n],de[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(L[r],L[i],L[o],L[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function pe(t,n){t.side===2?se(e.CULL_FACE):I(e.CULL_FACE);let r=t.side===1;n&&(r=!r),me(r),t.blending===1&&t.transparent===!1?fe(0):fe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),z(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?I(e.SAMPLE_ALPHA_TO_COVERAGE):se(e.SAMPLE_ALPHA_TO_COVERAGE)}function me(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function R(t){t===0?se(e.CULL_FACE):(I(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function he(t){t!==O&&(M&&e.lineWidth(t),O=t)}function z(t,n,r){t?(I(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):se(e.POLYGON_OFFSET_FILL)}function B(t){t?I(e.SCISSOR_TEST):se(e.SCISSOR_TEST)}function ge(t){t===void 0&&(t=e.TEXTURE0+j-1),P!==t&&(e.activeTexture(t),P=t)}function _e(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+j-1:P);let i=te[r];i===void 0&&(i={type:void 0,texture:void 0},te[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||oe[t]),i.type=t,i.texture=n)}function ve(){let t=te[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function ye(){try{e.compressedTexImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function V(){try{e.compressedTexImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function be(){try{e.texSubImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function xe(){try{e.texSubImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexSubImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.compressedTexSubImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texStorage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texStorage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.texImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function ke(t){ae.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ae.copy(t))}function Ae(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function je(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Me(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},P=null,te={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new mm(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ie.set(0,0,e.canvas.width,e.canvas.height),ae.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:I,disable:se,bindFramebuffer:ce,drawBuffers:le,useProgram:ue,setBlending:fe,setMaterial:pe,setFlipSided:me,setCullFace:R,setLineWidth:he,setPolygonOffset:z,setScissorTest:B,activeTexture:ge,bindTexture:_e,unbindTexture:ve,compressedTexImage2D:ye,compressedTexImage3D:V,texImage2D:Ee,texImage3D:De,updateUBOMapping:Ae,uniformBlockBinding:je,texStorage2D:we,texStorage3D:Te,texSubImage2D:be,texSubImage3D:xe,compressedTexSubImage2D:Se,compressedTexSubImage3D:Ce,scissor:Oe,viewport:ke,reset:Me}}function mv(e,t,n,r){let i=hv(r);switch(n){case Lu:return e*t;case Bu:return e*t;case Vu:return e*t*2;case Wu:return e*t/i.components*i.byteLength;case Gu:return e*t/i.components*i.byteLength;case Ku:return e*t*2/i.components*i.byteLength;case qu:return e*t*2/i.components*i.byteLength;case Ru:return e*t*3/i.components*i.byteLength;case zu:return e*t*4/i.components*i.byteLength;case Ju:return e*t*4/i.components*i.byteLength;case Yu:case Xu:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Zu:case Qu:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ed:case nd:return Math.max(e,16)*Math.max(t,8)/4;case $u:case td:return Math.max(e,8)*Math.max(t,8)/2;case rd:case id:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ad:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case od:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case sd:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case cd:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ld:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ud:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case dd:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case fd:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case pd:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case md:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case hd:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case gd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case _d:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case vd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case yd:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case bd:case xd:case Sd:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Cd:case wd:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Td:case Ed:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function hv(e){switch(e){case Tu:case Eu:return{byteLength:1,components:1};case Ou:case Du:case Mu:return{byteLength:2,components:1};case Nu:case Pu:return{byteLength:2,components:4};case Au:case ku:case ju:return{byteLength:4,components:1};case Iu:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}function gv(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new J,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):yf(`canvas`)}function h(e,t,n){let r=1,i=B(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),r===e.RGBA){let t=o?Ld:Ef.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function k(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function A(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function j(t,i){let a=r.get(t);if(t.isVideoTexture&&he(t),t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{ae(a,t,i);return}}n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function M(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?ae(a,t,i):n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?ae(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ee(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?F(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let P={[gu]:e.REPEAT,[_u]:e.CLAMP_TO_EDGE,[vu]:e.MIRRORED_REPEAT},te={[yu]:e.NEAREST,[bu]:e.NEAREST_MIPMAP_NEAREST,[xu]:e.NEAREST_MIPMAP_LINEAR,[Su]:e.LINEAR,[Cu]:e.LINEAR_MIPMAP_NEAREST,[wu]:e.LINEAR_MIPMAP_LINEAR},ne={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function re(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,P[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,P[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,P[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,te[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,te[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ne[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ie(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=A(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ae(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ie(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=Ef.getPrimaries(Ef.workingColorSpace),r=o.colorSpace===``?null:Ef.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=z(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);re(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===Uu,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,p.width,p.height,m,v,p.data)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=mv(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=mv(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=B(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=B(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function F(t,o,s){if(o.image.length!==6)return;let c=ie(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Ef.getPrimaries(Ef.workingColorSpace),r=o.colorSpace===``?null:Ef.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=z(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);re(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=B(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function oe(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),R(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,me(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function I(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=me(n);R(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=me(n);r&&R(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):R(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function se(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,a.__webglTexture&&i.depthTexture.image.width===i.width&&i.depthTexture.image.height===i.height||(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),j(i.depthTexture,0);let o=a.__webglTexture,c=me(i);if(i.depthTexture.format===1026)R(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)R(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function ce(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);se(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),I(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),I(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function le(t,n,i){let a=r.get(t);n!==void 0&&oe(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&ce(t)}function ue(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&R(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=me(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),I(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),re(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)oe(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else oe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a);n.bindTexture(e.TEXTURE_2D,o.__webglTexture),re(e.TEXTURE_2D,a),oe(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,e.TEXTURE_2D,0),g(a)&&_(e.TEXTURE_2D)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),re(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)oe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else oe(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&ce(t)}function de(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let L=[],fe=[];function pe(t){if(t.samples>0){if(R(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(L.length=0,fe.length=0,L.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(L.push(l),fe.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,fe)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,L))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function me(e){return Math.min(i.maxSamples,e.samples)}function R(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function he(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function z(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Ef.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function B(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=j,this.setTexture2DArray=M,this.setTexture3D=N,this.setTextureCube=ee,this.rebindTextures=le,this.setupRenderTarget=ue,this.updateRenderTargetMipmap=de,this.updateMultisampleRenderTarget=pe,this.setupDepthRenderbuffer=ce,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=R}function _v(e,t){function n(n,r=``){let i,a=Ef.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1024)return e.LUMINANCE;if(n===1025)return e.LUMINANCE_ALPHA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36492)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var vv=class extends oh{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},yv=class extends Yp{constructor(){super(),this.isGroup=!0,this.type=`Group`}},bv={type:`move`},xv=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new yv,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new yv,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new X,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new X),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new yv,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new X,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new X),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(bv)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new yv;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Sv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Cv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,wv=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let r=new Bf,i=e.properties.get(r);i.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new th({vertexShader:Sv,fragmentShader:Cv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Wm(new xh(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Tv=class extends Hd{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=new wv,h=t.getContextAttributes(),g=null,_=null,v=[],y=[],b=new J,x=null,S=new oh;S.viewport=new Vf;let C=new oh;C.viewport=new Vf;let w=[S,C],T=new vv,E=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=v[e];return t===void 0&&(t=new xv,v[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=v[e];return t===void 0&&(t=new xv,v[e]=t),t.getGripSpace()},this.getHand=function(e){let t=v[e];return t===void 0&&(t=new xv,v[e]=t),t.getHandSpace()};function O(e){let t=y.indexOf(e.inputSource);if(t===-1)return;let n=v[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function k(){r.removeEventListener(`select`,O),r.removeEventListener(`selectstart`,O),r.removeEventListener(`selectend`,O),r.removeEventListener(`squeeze`,O),r.removeEventListener(`squeezestart`,O),r.removeEventListener(`squeezeend`,O),r.removeEventListener(`end`,k),r.removeEventListener(`inputsourceschange`,A);for(let e=0;e<v.length;e++){let t=y[e];t!==null&&(y[e]=null,v[e].disconnect(t))}E=null,D=null,m.reset(),e.setRenderTarget(g),f=null,d=null,u=null,r=null,_=null,re.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(b.width,b.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(g=e.getRenderTarget(),r.addEventListener(`select`,O),r.addEventListener(`selectstart`,O),r.addEventListener(`selectend`,O),r.addEventListener(`squeeze`,O),r.addEventListener(`squeezestart`,O),r.addEventListener(`squeezeend`,O),r.addEventListener(`end`,k),r.addEventListener(`inputsourceschange`,A),h.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0){let n={antialias:h.antialias,alpha:!0,depth:h.depth,stencil:h.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new Uf(f.framebufferWidth,f.framebufferHeight,{format:zu,type:Tu,colorSpace:e.outputColorSpace,stencilBuffer:h.stencil})}else{let n=null,a=null,o=null;h.depth&&(o=h.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=h.stencil?Uu:Hu,a=h.stencil?Fu:Au);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=new XRWebGLBinding(r,t),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),_=new Uf(d.textureWidth,d.textureHeight,{format:zu,type:Tu,depthTexture:new og(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:h.stencil,colorSpace:e.outputColorSpace,samples:h.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),re.setContext(r),re.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function A(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=y.indexOf(n);r>=0&&(y[r]=null,v[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=y.indexOf(n);if(r===-1){for(let e=0;e<v.length;e++)if(e>=y.length){y.push(n),r=e;break}else if(y[e]===null){y[e]=n,r=e;break}if(r===-1)break}let i=v[r];i&&i.connect(n)}}let j=new X,M=new X;function N(e,t,n){j.setFromMatrixPosition(t.matrixWorld),M.setFromMatrixPosition(n.matrixWorld);let r=j.distanceTo(M),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ee(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;m.texture!==null&&(m.depthNear>0&&(t=m.depthNear),m.depthFar>0&&(n=m.depthFar)),T.near=C.near=S.near=t,T.far=C.far=S.far=n,(E!==T.near||D!==T.far)&&(r.updateRenderState({depthNear:T.near,depthFar:T.far}),E=T.near,D=T.far),S.layers.mask=e.layers.mask|2,C.layers.mask=e.layers.mask|4,T.layers.mask=S.layers.mask|C.layers.mask;let i=e.parent,a=T.cameras;ee(T,i);for(let e=0;e<a.length;e++)ee(a[e],i);a.length===2?N(T,S,C):T.projectionMatrix.copy(S.projectionMatrix),P(e,T,i)};function P(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Kd*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return T},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(T)};let te=null;function ne(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(_,f.framebuffer),e.setRenderTarget(_));let n=!1;t.length!==T.cameras.length&&(T.cameras.length=0,n=!0);for(let r=0;r<t.length;r++){let i=t[r],a=null;if(f!==null)a=f.getViewport(i);else{let t=u.getViewSubImage(d,i);a=t.viewport,r===0&&(e.setRenderTargetTextures(_,t.colorTexture,d.ignoreDepthValues?void 0:t.depthStencilTexture),e.setRenderTarget(_))}let o=w[r];o===void 0&&(o=new oh,o.layers.enable(r),o.viewport=new Vf,w[r]=o),o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(i.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),r===0&&(T.matrix.copy(o.matrix),T.matrix.decompose(T.position,T.quaternion,T.scale)),n===!0&&T.cameras.push(o)}let i=r.enabledFeatures;if(i&&i.includes(`depth-sensing`)){let n=u.getDepthInformation(t[0]);n&&n.isValid&&n.texture&&m.init(e,n,r.renderState)}}for(let e=0;e<v.length;e++){let t=y[e],n=v[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}te&&te(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let re=new yh;re.setAnimationLoop(ne),this.setAnimationLoop=function(e){te=e},this.dispose=function(){}}},Ev=new Mp,Dv=new Sp;function Ov(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Zm(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Ev.copy(o),Ev.x*=-1,Ev.y*=-1,Ev.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Ev.y*=-1,Ev.z*=-1),e.envMapRotation.value.setFromMatrix4(Dv.makeRotationFromEuler(Ev)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function kv(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Av=class{constructor(e={}){let{canvas:t=bf(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Fd,this.toneMapping=0,this.toneMappingExposure=1;let y=this,b=!1,x=0,S=0,C=null,w=-1,T=null,E=new Vf,D=new Vf,O=null,k=new mm(0),A=0,j=t.width,M=t.height,N=1,ee=null,P=null,te=new Vf(0,0,j,M),ne=new Vf(0,0,j,M),re=!1,ie=new vh,ae=!1,F=!1,oe=new Sp,I=new Sp,se=new X,ce=new Vf,le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ue=!1;function de(){return C===null?N:1}let L=n;function fe(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r170`),t.addEventListener(`webglcontextlost`,Fe,!1),t.addEventListener(`webglcontextrestored`,Ie,!1),t.addEventListener(`webglcontextcreationerror`,Le,!1),L===null){let t=`webgl2`;if(L=fe(t,e),L===null)throw fe(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let pe,me,R,he,z,B,ge,_e,ve,ye,V,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me;function Ne(){pe=new eg(L),pe.init(),Ae=new _v(L,pe),me=new kh(L,pe,e,Ae),R=new pv(L,pe),me.reverseDepthBuffer&&d&&R.buffers.depth.setReversed(!0),he=new rg(L),z=new Y_,B=new gv(L,pe,R,z,me,Ae,he),ge=new jh(y),_e=new $h(y),ve=new bh(L),je=new Dh(L,ve),ye=new tg(L,ve,he,je),V=new ag(L,ye,ve,he),De=new ig(L,me,B),we=new Ah(z),be=new J_(y,ge,_e,pe,me,je,we),xe=new Ov(y,z),Se=new $_,Ce=new ov(pe),Ee=new Eh(y,ge,_e,R,V,f,s),Te=new dv(y,V,me),Me=new kv(L,he,me,R),Oe=new Oh(L,pe,he),ke=new ng(L,pe,he),he.programs=be.programs,y.capabilities=me,y.extensions=pe,y.properties=z,y.renderLists=Se,y.shadowMap=Te,y.state=R,y.info=he}Ne();let Pe=new Tv(y,L);this.xr=Pe,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let e=pe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=pe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(e){e!==void 0&&(N=e,this.setSize(j,M,!1))},this.getSize=function(e){return e.set(j,M)},this.setSize=function(e,n,r=!0){Pe.isPresenting?console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`):(j=e,M=n,t.width=Math.floor(e*N),t.height=Math.floor(n*N),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(j*N,M*N).floor()},this.setDrawingBufferSize=function(e,n,r){j=e,M=n,N=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(te)},this.setViewport=function(e,t,n,r){e.isVector4?te.set(e.x,e.y,e.z,e.w):te.set(e,t,n,r),R.viewport(E.copy(te).multiplyScalar(N).round())},this.getScissor=function(e){return e.copy(ne)},this.setScissor=function(e,t,n,r){e.isVector4?ne.set(e.x,e.y,e.z,e.w):ne.set(e,t,n,r),R.scissor(D.copy(ne).multiplyScalar(N).round())},this.getScissorTest=function(){return re},this.setScissorTest=function(e){R.setScissorTest(re=e)},this.setOpaqueSort=function(e){ee=e},this.setTransparentSort=function(e){P=e},this.getClearColor=function(e){return e.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor.apply(Ee,arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha.apply(Ee,arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ee.getClearColor(),r=Ee.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,L.clearBufferuiv(L.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,L.clearBufferiv(L.COLOR,0,m))}else r|=L.COLOR_BUFFER_BIT}t&&(r|=L.DEPTH_BUFFER_BIT),n&&(r|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Fe,!1),t.removeEventListener(`webglcontextrestored`,Ie,!1),t.removeEventListener(`webglcontextcreationerror`,Le,!1),Se.dispose(),Ce.dispose(),z.dispose(),ge.dispose(),_e.dispose(),V.dispose(),je.dispose(),Me.dispose(),be.dispose(),Pe.dispose(),Pe.removeEventListener(`sessionstart`,We),Pe.removeEventListener(`sessionend`,Ge),Ke.stop()};function Fe(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ie(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=he.autoReset,t=Te.enabled,n=Te.autoUpdate,r=Te.needsUpdate,i=Te.type;Ne(),he.autoReset=e,Te.enabled=t,Te.autoUpdate=n,Te.needsUpdate=r,Te.type=i}function Le(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Re(e){let t=e.target;t.removeEventListener(`dispose`,Re),ze(t)}function ze(e){Be(e),z.remove(e)}function Be(e){let t=z.get(e).programs;t!==void 0&&(t.forEach(function(e){be.releaseProgram(e)}),e.isShaderMaterial&&be.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=le);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=tt(e,t,n,r,i);R.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=ye.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;je.setup(i,r,s,n,c);let h,g=Oe;if(c!==null&&(h=ve.get(c),g=ke,g.setIndex(h)),i.isMesh)r.wireframe===!0?(R.setLineWidth(r.wireframeLinewidth*de()),g.setMode(L.LINES)):g.setMode(L.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),R.setLineWidth(e*de()),i.isLineSegments?g.setMode(L.LINES):i.isLineLoop?g.setMode(L.LINE_LOOP):g.setMode(L.LINE_STRIP)}else i.isPoints?g.setMode(L.POINTS):i.isSprite&&g.setMode(L.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(pe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ve.get(c).bytesPerElement:1,o=z.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(L,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ve(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Qe(e,t,n),e.side=0,e.needsUpdate=!0,Qe(e,t,n),e.side=2):Qe(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Ce.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ve(a,n,e),r.add(a)}else Ve(t,n,e),r.add(t)}}),v.pop(),g=null,r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){z.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}pe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let He=null;function Ue(e){He&&He(e)}function We(){Ke.stop()}function Ge(){Ke.start()}let Ke=new yh;Ke.setAnimationLoop(Ue),typeof self<`u`&&Ke.setContext(self),this.setAnimationLoop=function(e){He=e,Pe.setAnimationLoop(e),e===null?Ke.stop():Ke.start()},Pe.addEventListener(`sessionstart`,We),Pe.addEventListener(`sessionend`,Ge),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Pe.enabled===!0&&Pe.isPresenting===!0&&(Pe.cameraAutoUpdate===!0&&Pe.updateCamera(t),t=Pe.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Ce.get(e,v.length),g.init(t),v.push(g),I.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ie.setFromProjectionMatrix(I),F=this.localClippingEnabled,ae=we.init(this.clippingPlanes,F),h=Se.get(e,_.length),h.init(),_.push(h),Pe.enabled===!0&&Pe.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&qe(e,t,-1/0,y.sortObjects)}qe(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(ee,P),ue=Pe.enabled===!1||Pe.isPresenting===!1||Pe.hasDepthSensing()===!1,ue&&Ee.addToRenderList(h,e),this.info.render.frame++,ae===!0&&we.beginShadows();let n=g.state.shadowsArray;Te.render(n,e,t),ae===!0&&we.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];Ye(r,i,e,a)}ue&&Ee.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];Je(h,e,r,r.viewport)}}else i.length>0&&Ye(r,i,e,t),ue&&Ee.render(e),Je(h,e,t);C!==null&&(B.updateMultisampleRenderTarget(C),B.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),je.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],ae===!0&&we.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function qe(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ie.intersectsSprite(e)){r&&ce.setFromMatrixPosition(e.matrixWorld).applyMatrix4(I);let t=V.update(e),i=e.material;i.visible&&h.push(e,t,i,n,ce.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ie.intersectsObject(e))){let t=V.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ce.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ce.copy(e.boundingSphere.center)),ce.applyMatrix4(e.matrixWorld).applyMatrix4(I)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,ce.z,o)}}else i.visible&&h.push(e,t,i,n,ce.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)qe(i[e],t,n,r)}function Je(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),ae===!0&&we.setGlobalState(y.clippingPlanes,n),r&&R.viewport(E.copy(r)),i.length>0&&Xe(i,t,n),a.length>0&&Xe(a,t,n),o.length>0&&Xe(o,t,n),R.buffers.depth.setTest(!0),R.buffers.depth.setMask(!0),R.buffers.color.setMask(!0),R.setPolygonOffset(!1)}function Ye(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new Uf(1,1,{generateMipmaps:!0,type:pe.has(`EXT_color_buffer_half_float`)||pe.has(`EXT_color_buffer_float`)?Mu:Tu,minFilter:wu,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ef.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z,o.w);let s=y.getRenderTarget();y.setRenderTarget(a),y.getClearColor(k),A=y.getClearAlpha(),A<1&&y.setClearColor(16777215,.5),y.clear(),ue&&Ee.render(n);let c=y.toneMapping;y.toneMapping=0;let l=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),ae===!0&&we.setGlobalState(y.clippingPlanes,r),Xe(e,n,r),B.updateMultisampleRenderTarget(a),B.updateRenderTargetMipmap(a),pe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,Ze(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(B.updateMultisampleRenderTarget(a),B.updateRenderTargetMipmap(a))}y.setRenderTarget(s),y.setClearColor(k,A),l!==void 0&&(r.viewport=l),y.toneMapping=c}function Xe(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=r===null?a.material:r,l=a.group;o.layers.test(n.layers)&&Ze(o,t,n,s,c,l)}}function Ze(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function Qe(e,t,n){t.isScene!==!0&&(t=le);let r=z.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=be.getParameters(e,i.state,a,t,n),c=be.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?_e:ge).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Re),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return et(e,s),u}else s.uniforms=be.getUniforms(e),e.onBeforeCompile(s,y),u=be.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=we.uniform),et(e,s),r.needsLights=rt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function $e(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=p_.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function et(e,t){let n=z.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function tt(e,t,n,r,i){t.isScene!==!0&&(t=le),B.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Id,c=(r.isMeshStandardMaterial?_e:ge).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=z.get(r),b=g.state.lights;if(ae===!0&&(F===!0||e!==T)){let t=e===T&&r.id===w;we.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==we.numPlanes||v.numIntersection!==we.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=Qe(r,t,i));let E=!1,D=!1,O=!1,k=S.getUniforms(),A=v.uniforms;if(R.useProgram(S.program)&&(E=!0,D=!0,O=!0),r.id!==w&&(w=r.id,D=!0),E||T!==e){R.buffers.depth.getReversed()?(oe.copy(e.projectionMatrix),wf(oe),Tf(oe),k.setValue(L,`projectionMatrix`,oe)):k.setValue(L,`projectionMatrix`,e.projectionMatrix),k.setValue(L,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(L,se.setFromMatrixPosition(e.matrixWorld)),me.logarithmicDepthBuffer&&k.setValue(L,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(L,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,D=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(L,i,`bindMatrix`),k.setOptional(L,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(L,`boneTexture`,e.boneTexture,B))}i.isBatchedMesh&&(k.setOptional(L,i,`batchingTexture`),k.setValue(L,`batchingTexture`,i._matricesTexture,B),k.setOptional(L,i,`batchingIdTexture`),k.setValue(L,`batchingIdTexture`,i._indirectTexture,B),k.setOptional(L,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(L,`batchingColorTexture`,i._colorsTexture,B));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&De.update(i,n,S),(D||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,k.setValue(L,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),D&&(k.setValue(L,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&nt(A,O),a&&r.fog===!0&&xe.refreshFogUniforms(A,a),xe.refreshMaterialUniforms(A,r,N,M,g.state.transmissionRenderTarget[e.id]),p_.upload(L,$e(v),A,B)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(p_.upload(L,$e(v),A,B),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(L,`center`,i.center),k.setValue(L,`modelViewMatrix`,i.modelViewMatrix),k.setValue(L,`normalMatrix`,i.normalMatrix),k.setValue(L,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Me.update(n,S),Me.bind(n,S)}}return S}function nt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function rt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){z.get(e.texture).__webglTexture=t,z.get(e.depthTexture).__webglTexture=n;let r=z.get(e);r.__hasExternalTextures=!0,r.__autoAllocateDepthBuffer=n===void 0,r.__autoAllocateDepthBuffer||pe.has(`WEBGL_multisampled_render_to_texture`)===!0&&(console.warn(`THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided`),r.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(e,t){let n=z.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){C=e,x=t,S=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=z.get(e);if(s.__useDefaultFramebuffer!==void 0)R.bindFramebuffer(L.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)B.setupRenderTarget(e);else if(s.__hasExternalTextures)B.rebindTextures(e,z.get(e.texture).__webglTexture,z.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&z.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);B.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=z.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&B.useMultisampledRTT(e)===!1?z.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),D.copy(e.scissor),O=e.scissorTest}else E.copy(te).multiplyScalar(N).floor(),D.copy(ne).multiplyScalar(N).floor(),O=re;if(R.bindFramebuffer(L.FRAMEBUFFER,i)&&r&&R.drawBuffers(e,i),R.viewport(E),R.scissor(D),R.setScissorTest(O),a){let r=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=z.get(e.texture),i=t||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,r.__webglTexture,n||0,i)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let s=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(s=s[o]),s){R.bindFramebuffer(L.FRAMEBUFFER,s);try{let o=e.texture,s=o.format,c=o.type;if(!me.textureFormatReadable(s)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!me.textureTypeReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&L.readPixels(t,n,r,i,Ae.convert(s),Ae.convert(c),a)}finally{let e=C===null?null:z.get(C).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let s=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(s=s[o]),s){let o=e.texture,c=o.format,l=o.type;if(!me.textureFormatReadable(c))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!me.textureTypeReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){R.bindFramebuffer(L.FRAMEBUFFER,s);let e=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,e),L.bufferData(L.PIXEL_PACK_BUFFER,a.byteLength,L.STREAM_READ),L.readPixels(t,n,r,i,Ae.convert(c),Ae.convert(l),0);let o=C===null?null:z.get(C).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,o);let u=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Cf(L,u,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,e),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,a),L.deleteBuffer(e),L.deleteSync(u),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){e.isTexture!==!0&&(Sf(`WebGLRenderer: copyFramebufferToTexture function signature has changed.`),t=arguments[0]||null,e=arguments[1]);let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;B.setTexture2D(e,0),L.copyTexSubImage2D(L.TEXTURE_2D,n,0,0,o,s,i,a),R.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0){e.isTexture!==!0&&(Sf(`WebGLRenderer: copyTextureToTexture function signature has changed.`),r=arguments[0]||null,e=arguments[1],t=arguments[2],i=arguments[3]||0,n=null);let a,o,s,c,l,u,d,f,p,m=e.isCompressedTexture?e.mipmaps[i]:e.image;n===null?(a=m.width,o=m.height,s=m.depth||1,c=0,l=0,u=0):(a=n.max.x-n.min.x,o=n.max.y-n.min.y,s=n.isBox3?n.max.z-n.min.z:1,c=n.min.x,l=n.min.y,u=n.isBox3?n.min.z:0),r===null?(d=0,f=0,p=0):(d=r.x,f=r.y,p=r.z);let h=Ae.convert(t.format),g=Ae.convert(t.type),_;t.isData3DTexture?(B.setTexture3D(t,0),_=L.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(B.setTexture2DArray(t,0),_=L.TEXTURE_2D_ARRAY):(B.setTexture2D(t,0),_=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,t.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,t.unpackAlignment);let v=L.getParameter(L.UNPACK_ROW_LENGTH),y=L.getParameter(L.UNPACK_IMAGE_HEIGHT),b=L.getParameter(L.UNPACK_SKIP_PIXELS),x=L.getParameter(L.UNPACK_SKIP_ROWS),S=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,m.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,m.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,c),L.pixelStorei(L.UNPACK_SKIP_ROWS,l),L.pixelStorei(L.UNPACK_SKIP_IMAGES,u);let C=e.isDataArrayTexture||e.isData3DTexture,w=t.isDataArrayTexture||t.isData3DTexture;if(e.isRenderTargetTexture||e.isDepthTexture){let n=z.get(e),r=z.get(t),m=z.get(n.__renderTarget),h=z.get(r.__renderTarget);R.bindFramebuffer(L.READ_FRAMEBUFFER,m.__webglFramebuffer),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,h.__webglFramebuffer);for(let n=0;n<s;n++)C&&L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(e).__webglTexture,i,u+n),e.isDepthTexture?(w&&L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(t).__webglTexture,i,p+n),L.blitFramebuffer(c,l,a,o,d,f,a,o,L.DEPTH_BUFFER_BIT,L.NEAREST)):w?L.copyTexSubImage3D(_,i,d,f,p+n,c,l,a,o):L.copyTexSubImage2D(_,i,d,f,p+n,c,l,a,o);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else w?e.isDataTexture||e.isData3DTexture?L.texSubImage3D(_,i,d,f,p,a,o,s,h,g,m.data):t.isCompressedArrayTexture?L.compressedTexSubImage3D(_,i,d,f,p,a,o,s,h,m.data):L.texSubImage3D(_,i,d,f,p,a,o,s,h,g,m):e.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,i,d,f,a,o,h,g,m.data):e.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,i,d,f,m.width,m.height,h,m.data):L.texSubImage2D(L.TEXTURE_2D,i,d,f,a,o,h,g,m);L.pixelStorei(L.UNPACK_ROW_LENGTH,v),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,y),L.pixelStorei(L.UNPACK_SKIP_PIXELS,b),L.pixelStorei(L.UNPACK_SKIP_ROWS,x),L.pixelStorei(L.UNPACK_SKIP_IMAGES,S),i===0&&t.generateMipmaps&&L.generateMipmap(_),R.unbindTexture()},this.copyTextureToTexture3D=function(e,t,n=null,r=null,i=0){return e.isTexture!==!0&&(Sf(`WebGLRenderer: copyTextureToTexture3D function signature has changed.`),n=arguments[0]||null,r=arguments[1]||null,e=arguments[2],t=arguments[3],i=arguments[4]||0),Sf(`WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.`),this.copyTextureToTexture(e,t,n,r,i)},this.initRenderTarget=function(e){z.get(e).__webglFramebuffer===void 0&&B.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?B.setTextureCube(e,0):e.isData3DTexture?B.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?B.setTexture2DArray(e,0):B.setTexture2D(e,0),R.unbindTexture()},this.resetState=function(){x=0,S=0,C=null,R.reset(),je.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Vd}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=Ef._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ef._getUnpackColorSpace()}},jv=class extends Yp{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mp,this.environmentIntensity=1,this.environmentRotation=new Mp,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Mv=class extends _m{static get type(){return`LineBasicMaterial`}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new mm(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Nv=new X,Pv=new X,Fv=new Sp,Iv=new xp,Lv=new pp,Rv=new X,zv=new X,Bv=class extends Yp{constructor(e=new Mm,t=new Mv){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Nv.fromBufferAttribute(t,e-1),Pv.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Nv.distanceTo(Pv);e.setAttribute(`lineDistance`,new wm(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Lv.copy(n.boundingSphere),Lv.applyMatrix4(r),Lv.radius+=i,e.ray.intersectsSphere(Lv)===!1)return;Fv.copy(r).invert(),Iv.copy(e.ray).applyMatrix4(Fv);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Vv(this,e,Iv,s,n,r);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Vv(this,e,Iv,s,i,a);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Vv(this,e,Iv,s,i,i+1);n&&t.push(n)}if(this.isLineLoop){let i=Vv(this,e,Iv,s,r-1,n);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Vv(e,t,n,r,i,a){let o=e.geometry.attributes.position;if(Nv.fromBufferAttribute(o,i),Pv.fromBufferAttribute(o,a),n.distanceSqToSegment(Nv,Pv,Rv,zv)>r)return;Rv.applyMatrix4(e.matrixWorld);let s=t.ray.origin.distanceTo(Rv);if(!(s<t.near||s>t.far))return{distance:s,point:zv.clone().applyMatrix4(e.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:e}}var Hv=new X,Uv=new X,Wv=class extends Bv{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Hv.fromBufferAttribute(t,e),Uv.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Hv.distanceTo(Uv);e.setAttribute(`lineDistance`,new wm(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Gv=class extends Bv{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},Kv=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200}getPoint(){return console.warn(`THREE.Curve: .getPoint() not implemented.`),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new J:new X);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new X,r=[],i=[],a=[],o=new X,s=new Sp;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new X)}i[0]=new X,a[0]=new X;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(Jd(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(Jd(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},qv=class extends Kv{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new J){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Jv=class extends qv{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Yv(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Xv=new X,Zv=new Yv,Qv=new Yv,$v=new Yv,ey=class extends Kv{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new X){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Xv.subVectors(r[0],r[1]).add(r[0]),c=Xv);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Xv.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Xv),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Zv.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Qv.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),$v.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Zv.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Qv.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),$v.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Zv.calc(s),Qv.calc(s),$v.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new X().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ty(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function ny(e,t){let n=1-e;return n*n*t}function ry(e,t){return 2*(1-e)*e*t}function iy(e,t){return e*e*t}function ay(e,t,n,r){return ny(e,t)+ry(e,n)+iy(e,r)}function oy(e,t){let n=1-e;return n*n*n*t}function sy(e,t){let n=1-e;return 3*n*n*e*t}function cy(e,t){return 3*(1-e)*e*e*t}function ly(e,t){return e*e*e*t}function uy(e,t,n,r,i){return oy(e,t)+sy(e,n)+cy(e,r)+ly(e,i)}var dy=class extends Kv{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(uy(e,r.x,i.x,a.x,o.x),uy(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},fy=class extends Kv{constructor(e=new X,t=new X,n=new X,r=new X){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new X){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(uy(e,r.x,i.x,a.x,o.x),uy(e,r.y,i.y,a.y,o.y),uy(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},py=class extends Kv{constructor(e=new J,t=new J){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new J){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},my=class extends Kv{constructor(e=new X,t=new X){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new X){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new X){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},hy=class extends Kv{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(ay(e,r.x,i.x,a.x),ay(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},gy=class extends Kv{constructor(e=new X,t=new X,n=new X){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new X){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(ay(e,r.x,i.x,a.x),ay(e,r.y,i.y,a.y),ay(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},_y=class extends Kv{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new J){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(ty(o,s.x,c.x,l.x,u.x),ty(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new J().fromArray(n))}return this}},vy=Object.freeze({__proto__:null,ArcCurve:Jv,CatmullRomCurve3:ey,CubicBezierCurve:dy,CubicBezierCurve3:fy,EllipseCurve:qv,LineCurve:py,LineCurve3:my,QuadraticBezierCurve:hy,QuadraticBezierCurve3:gy,SplineCurve:_y}),yy=class extends Kv{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new vy[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new vy[n.type]().fromJSON(n))}return this}},by=class extends yy{constructor(e){super(),this.type=`Path`,this.currentPoint=new J,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new py(this.currentPoint.clone(),new J(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new hy(this.currentPoint.clone(),new J(e,t),new J(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new dy(this.currentPoint.clone(),new J(e,t),new J(n,r),new J(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new _y([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new qv(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},xy=new X,Sy=new X,Cy=new X,wy=new lm,Ty=class extends Mm{constructor(e=null,t=1){if(super(),this.type=`EdgesGeometry`,this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=1e4,r=Math.cos(Gd*t),i=e.getIndex(),a=e.getAttribute(`position`),o=i?i.count:a.count,s=[0,0,0],c=[`a`,`b`,`c`],l=[,,,],u={},d=[];for(let e=0;e<o;e+=3){i?(s[0]=i.getX(e),s[1]=i.getX(e+1),s[2]=i.getX(e+2)):(s[0]=e,s[1]=e+1,s[2]=e+2);let{a:t,b:o,c:f}=wy;if(t.fromBufferAttribute(a,s[0]),o.fromBufferAttribute(a,s[1]),f.fromBufferAttribute(a,s[2]),wy.getNormal(Cy),l[0]=`${Math.round(t.x*n)},${Math.round(t.y*n)},${Math.round(t.z*n)}`,l[1]=`${Math.round(o.x*n)},${Math.round(o.y*n)},${Math.round(o.z*n)}`,l[2]=`${Math.round(f.x*n)},${Math.round(f.y*n)},${Math.round(f.z*n)}`,l[0]!==l[1]&&l[1]!==l[2]&&l[2]!==l[0])for(let e=0;e<3;e++){let t=(e+1)%3,n=l[e],i=l[t],a=wy[c[e]],o=wy[c[t]],f=`${n}_${i}`,p=`${i}_${n}`;p in u&&u[p]?(Cy.dot(u[p].normal)<=r&&(d.push(a.x,a.y,a.z),d.push(o.x,o.y,o.z)),u[p]=null):f in u||(u[f]={index0:s[e],index1:s[t],normal:Cy.clone()})}}for(let e in u)if(u[e]){let{index0:t,index1:n}=u[e];xy.fromBufferAttribute(a,t),Sy.fromBufferAttribute(a,n),d.push(xy.x,xy.y,xy.z),d.push(Sy.x,Sy.y,Sy.z)}this.setAttribute(`position`,new wm(d,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Ey=class extends by{constructor(e){super(e),this.uuid=qd(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new by().fromJSON(n))}return this}},Dy={triangulate:function(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=Oy(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l,u,d,f,p;if(r&&(a=Fy(e,t,a,n)),e.length>80*n){s=l=e[0],c=u=e[1];for(let t=n;t<i;t+=n)d=e[t],f=e[t+1],d<s&&(s=d),f<c&&(c=f),d>l&&(l=d),f>u&&(u=f);p=Math.max(l-s,u-c),p=p===0?0:32767/p}return Ay(a,o,n,s,c,p,0),o}};function Oy(e,t,n,r,i){let a,o;if(i===ib(e,t,n,r)>0)for(a=t;a<n;a+=r)o=tb(a,e[a],e[a+1],o);else for(a=n-r;a>=t;a-=r)o=tb(a,e[a],e[a+1],o);return o&&qy(o,o.next)&&(nb(o),o=o.next),o}function ky(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(qy(n,n.next)||Ky(n.prev,n,n.next)===0)){if(nb(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function Ay(e,t,n,r,i,a,o){if(!e)return;!o&&a&&By(e,r,i,a);let s=e,c,l;for(;e.prev!==e.next;)if(c=e.prev,l=e.next,a?My(e,r,i,a):jy(e))t.push(c.i/n|0),t.push(e.i/n|0),t.push(l.i/n|0),nb(e),e=l.next,s=l.next;else if(e=l,e===s){o?o===1?(e=Ny(ky(e),t,n),Ay(e,t,n,r,i,a,2)):o===2&&Py(e,t,n,r,i,a):Ay(ky(e),t,n,r,i,a,1);break}}function jy(e){let t=e.prev,n=e,r=e.next;if(Ky(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=i<a?i<o?i:o:a<o?a:o,d=s<c?s<l?s:l:c<l?c:l,f=i>a?i>o?i:o:a>o?a:o,p=s>c?s>l?s:l:c>l?c:l,m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Wy(i,s,a,c,o,l,m.x,m.y)&&Ky(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function My(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Ky(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=s<c?s<l?s:l:c<l?c:l,m=u<d?u<f?u:f:d<f?d:f,h=s>c?s>l?s:l:c>l?c:l,g=u>d?u>f?u:f:d>f?d:f,_=Hy(p,m,t,n,r),v=Hy(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Wy(s,u,c,d,l,f,y.x,y.y)&&Ky(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Wy(s,u,c,d,l,f,b.x,b.y)&&Ky(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Wy(s,u,c,d,l,f,y.x,y.y)&&Ky(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Wy(s,u,c,d,l,f,b.x,b.y)&&Ky(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Ny(e,t,n){let r=e;do{let i=r.prev,a=r.next.next;!qy(i,a)&&Jy(i,r,r.next,a)&&Qy(i,a)&&Qy(a,i)&&(t.push(i.i/n|0),t.push(r.i/n|0),t.push(a.i/n|0),nb(r),nb(r.next),r=e=a),r=r.next}while(r!==e);return ky(r)}function Py(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Gy(o,e)){let s=eb(o,e);o=ky(o,o.next),s=ky(s,s.next),Ay(o,t,n,r,i,a,0),Ay(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Fy(e,t,n,r){let i=[],a,o,s,c,l;for(a=0,o=t.length;a<o;a++)s=t[a]*r,c=a<o-1?t[a+1]*r:e.length,l=Oy(e,s,c,r,!1),l===l.next&&(l.steiner=!0),i.push(Uy(l));for(i.sort(Iy),a=0;a<i.length;a++)n=Ly(i[a],n);return n}function Iy(e,t){return e.x-t.x}function Ly(e,t){let n=Ry(e,t);if(!n)return t;let r=eb(n,e);return ky(r,r.next),ky(n,n.next)}function Ry(e,t){let n=t,r=-1/0,i,a=e.x,o=e.y;do{if(o<=n.y&&o>=n.next.y&&n.next.y!==n.y){let e=n.x+(o-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=a&&e>r&&(r=e,i=n.x<n.next.x?n:n.next,e===a))return i}n=n.next}while(n!==t);if(!i)return null;let s=i,c=i.x,l=i.y,u=1/0,d;n=i;do a>=n.x&&n.x>=c&&a!==n.x&&Wy(o<l?a:r,o,c,l,o<l?r:a,o,n.x,n.y)&&(d=Math.abs(o-n.y)/(a-n.x),Qy(n,e)&&(d<u||d===u&&(n.x>i.x||n.x===i.x&&zy(i,n)))&&(i=n,u=d)),n=n.next;while(n!==s);return i}function zy(e,t){return Ky(e.prev,e,t.prev)<0&&Ky(t.next,e,e.next)<0}function By(e,t,n,r){let i=e;do i.z===0&&(i.z=Hy(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,Vy(i)}function Vy(e){let t,n,r,i,a,o,s,c,l=1;do{for(n=e,e=null,a=null,o=0;n;){for(o++,r=n,s=0,t=0;t<l&&(s++,r=r.nextZ,r);t++);for(c=l;s>0||c>0&&r;)s!==0&&(c===0||!r||n.z<=r.z)?(i=n,n=n.nextZ,s--):(i=r,r=r.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;n=r}a.nextZ=null,l*=2}while(o>1);return e}function Hy(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Uy(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Wy(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Gy(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Zy(e,t)&&(Qy(e,t)&&Qy(t,e)&&$y(e,t)&&(Ky(e.prev,e,t.prev)||Ky(e,t.prev,t))||qy(e,t)&&Ky(e.prev,e,e.next)>0&&Ky(t.prev,t,t.next)>0)}function Ky(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function qy(e,t){return e.x===t.x&&e.y===t.y}function Jy(e,t,n,r){let i=Xy(Ky(e,t,n)),a=Xy(Ky(e,t,r)),o=Xy(Ky(n,r,e)),s=Xy(Ky(n,r,t));return!!(i!==a&&o!==s||i===0&&Yy(e,n,t)||a===0&&Yy(e,r,t)||o===0&&Yy(n,e,r)||s===0&&Yy(n,t,r))}function Yy(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Xy(e){return e>0?1:e<0?-1:0}function Zy(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Jy(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Qy(e,t){return Ky(e.prev,e,e.next)<0?Ky(e,t,e.next)>=0&&Ky(e,e.prev,t)>=0:Ky(e,t,e.prev)<0||Ky(e,e.next,t)<0}function $y(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function eb(e,t){let n=new rb(e.i,e.x,e.y),r=new rb(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function tb(e,t,n,r){let i=new rb(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function nb(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function rb(e,t,n){this.i=e,this.x=t,this.y=n,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function ib(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var ab=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];ob(e),sb(n,e);let a=e.length;t.forEach(ob);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,sb(n,t[e]);let o=Dy.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function ob(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function sb(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var cb=class e extends Mm{constructor(e=new Ey([new J(.5,.5),new J(-.5,.5),new J(-.5,-.5),new J(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new wm(r,3)),this.setAttribute(`uv`,new wm(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?lb:t.UVGenerator,g,_=!1,v,y,b,x;m&&(g=m.getSpacedPoints(s),_=!0,l=!1,v=m.computeFrenetFrames(s,!1),y=new X,b=new X,x=new X),l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!ab.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];ab.isClockWise(t)&&(w[e]=t.reverse())}}let T=ab.triangulateShape(C,w),E=C;for(let e=0,t=w.length;e<t;e++){let t=w[e];C=C.concat(t)}function D(e,t,n){return t||console.error(`THREE.ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let O=C.length,k=T.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new J(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new J(r/a,i/a)}let j=[];for(let e=0,t=E.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),j[e]=A(E[e],E[n],E[r]);let M=[],N,ee=j.concat();for(let e=0,t=w.length;e<t;e++){let t=w[e];N=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),N[e]=A(t[e],t[r],t[i]);M.push(N),ee=ee.concat(N)}for(let e=0;e<p;e++){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=E.length;e<t;e++){let t=D(E[e],j[e],r);ie(t.x,t.y,-n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];N=M[e];for(let e=0,i=t.length;e<i;e++){let i=D(t[e],N[e],r);ie(i.x,i.y,-n)}}}let P=d+f;for(let e=0;e<O;e++){let t=l?D(C[e],ee[e],P):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),ie(x.x,x.y,x.z)):ie(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<O;t++){let n=l?D(C[t],ee[t],P):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),ie(x.x,x.y,x.z)):ie(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=E.length;e<t;e++){let t=D(E[e],j[e],r);ie(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];N=M[e];for(let e=0,i=t.length;e<i;e++){let i=D(t[e],N[e],r);_?ie(i.x,i.y+g[s-1].y,g[s-1].x+n):ie(i.x,i.y,c+n)}}}te(),ne();function te(){let e=r.length/3;if(l){let e=0,t=O*e;for(let e=0;e<k;e++){let n=T[e];ae(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=O*e;for(let e=0;e<k;e++){let n=T[e];ae(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<k;e++){let t=T[e];ae(t[2],t[1],t[0])}for(let e=0;e<k;e++){let t=T[e];ae(t[0]+O*s,t[1]+O*s,t[2]+O*s)}}n.addGroup(e,r.length/3-e,0)}function ne(){let e=r.length/3,t=0;re(E,t),t+=E.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];re(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function re(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=O*e,a=O*(e+1);F(t+r+n,t+i+n,t+i+a,t+r+a)}}}function ie(e,t,n){a.push(e),a.push(t),a.push(n)}function ae(e,t,i){oe(e),oe(t),oe(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);I(o[0]),I(o[1]),I(o[2])}function F(e,t,i,a){oe(e),oe(t),oe(a),oe(t),oe(i),oe(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);I(s[0]),I(s[1]),I(s[3]),I(s[1]),I(s[2]),I(s[3])}function oe(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function I(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return ub(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new vy[i.type]().fromJSON(i)),new e(r,t.options)}},lb={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new J(a,o),new J(s,c),new J(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new J(o,1-c),new J(l,1-d),new J(f,1-m),new J(h,1-_)]:[new J(s,1-c),new J(u,1-d),new J(p,1-m),new J(g,1-_)]}};function ub(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var db=class extends _m{static get type(){return`MeshStandardMaterial`}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:``},this.color=new mm(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new mm(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mp,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function fb(e,t,n){return!e||!n&&e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function pb(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var mb=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},hb=class extends mb{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ad,endingEnd:Ad}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case jd:i=e,o=2*t-n;break;case Md:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case jd:a=e,s=2*n-t;break;case Md:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},gb=class extends mb{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},_b=class extends mb{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},vb=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=fb(t,this.TimeBufferType),this.values=fb(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:fb(e.times,Array),values:fb(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new _b(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new gb(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new hb(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Dd:t=this.InterpolantFactoryMethodDiscrete;break;case Od:t=this.InterpolantFactoryMethodLinear;break;case kd:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Dd;case this.InterpolantFactoryMethodLinear:return Od;case this.InterpolantFactoryMethodSmooth:return kd}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&pb(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===kd,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};vb.prototype.TimeBufferType=Float32Array,vb.prototype.ValueBufferType=Float32Array,vb.prototype.DefaultInterpolation=Od;var yb=class extends vb{constructor(e,t,n){super(e,t,n)}};yb.prototype.ValueTypeName=`bool`,yb.prototype.ValueBufferType=Array,yb.prototype.DefaultInterpolation=Dd,yb.prototype.InterpolantFactoryMethodLinear=void 0,yb.prototype.InterpolantFactoryMethodSmooth=void 0;var bb=class extends vb{};bb.prototype.ValueTypeName=`color`;var xb=class extends vb{};xb.prototype.ValueTypeName=`number`;var Sb=class extends mb{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Kf.slerpFlat(i,0,a,c-o,a,c,s);return i}},Cb=class extends vb{InterpolantFactoryMethodLinear(e){return new Sb(this.times,this.values,this.getValueSize(),e)}};Cb.prototype.ValueTypeName=`quaternion`,Cb.prototype.InterpolantFactoryMethodSmooth=void 0;var wb=class extends vb{constructor(e,t,n){super(e,t,n)}};wb.prototype.ValueTypeName=`string`,wb.prototype.ValueBufferType=Array,wb.prototype.DefaultInterpolation=Dd,wb.prototype.InterpolantFactoryMethodLinear=void 0,wb.prototype.InterpolantFactoryMethodSmooth=void 0;var Tb=class extends vb{};Tb.prototype.ValueTypeName=`vector`;var Eb=class extends Yp{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new mm(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Db=class extends Eb{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Yp.DEFAULT_UP),this.updateMatrix(),this.groundColor=new mm(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ob=new Sp,kb=new X,Ab=new X,jb=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new J(512,512),this.map=null,this.mapPass=null,this.matrix=new Sp,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new vh,this._frameExtents=new J(1,1),this._viewportCount=1,this._viewports=[new Vf(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;kb.setFromMatrixPosition(e.matrixWorld),t.position.copy(kb),Ab.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ab),t.updateMatrixWorld(),Ob.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ob),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ob)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Mb=class extends jb{constructor(){super(new Mh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Nb=class extends Eb{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Yp.DEFAULT_UP),this.updateMatrix(),this.target=new Yp,this.shadow=new Mb}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Pb=`\\[\\]\\.:\\/`,Fb=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ib=`[^\\[\\]\\.:\\/]`,Lb=`[^`+Pb.replace(`\\.`,``)+`]`,Rb=`((?:WC+[\\/:])*)`.replace(`WC`,Ib),zb=`(WCOD+)?`.replace(`WCOD`,Lb),Bb=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ib),Vb=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ib),Hb=RegExp(`^`+Rb+zb+Bb+Vb+`$`),Ub=[`material`,`materials`,`bones`,`map`],Wb=class{constructor(e,t,n){let r=n||Gb.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Gb=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Fb,``)}static parseTrackName(e){let t=Hb.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ub.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.needsUpdate===void 0?t.matrixWorldNeedsUpdate!==void 0&&(s=this.Versioning.MatrixWorldNeedsUpdate):s=this.Versioning.NeedsUpdate;let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Gb.Composite=Wb,Gb.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Gb.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Gb.prototype.GetterByBindingType=[Gb.prototype._getValue_direct,Gb.prototype._getValue_array,Gb.prototype._getValue_arrayElement,Gb.prototype._getValue_toArray],Gb.prototype.SetterByBindingTypeAndVersioning=[[Gb.prototype._setValue_direct,Gb.prototype._setValue_direct_setNeedsUpdate,Gb.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Gb.prototype._setValue_array,Gb.prototype._setValue_array_setNeedsUpdate,Gb.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Gb.prototype._setValue_arrayElement,Gb.prototype._setValue_arrayElement_setNeedsUpdate,Gb.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Gb.prototype._setValue_fromArray,Gb.prototype._setValue_fromArray_setNeedsUpdate,Gb.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Kb=new Sp,qb=class{constructor(e,t,n=0,r=1/0){this.ray=new xp(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Np,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Kb.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Kb),this}intersectObject(e,t=!0,n=[]){return Yb(e,this,n,t),n.sort(Jb),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Yb(e[r],this,n,t);return n.sort(Jb),n}};function Jb(e,t){return e.distance-t.distance}function Yb(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Yb(r[e],t,n,!0)}}var Xb=class{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){let e=1e-6;return this.phi=Math.max(e,Math.min(Math.PI-e,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Jd(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},Zb=class extends Hd{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`170`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`170`);var Qb=Math.PI/180;function $b(e){return{kind:`segments`,segments:Ui(e,!0),polygon:Zi(e,!0)}}function ex(e){switch(e.type){case`polyline`:return e.closed&&e.vertices.length>=2?[$b(e.vertices),...e.holes.map(e=>$b(e))]:[];case`rect`:return[$b(Wi(e))];case`circle`:{let[t,n]=e.center;return[$b([[t-e.radius,n,1],[t+e.radius,n,1]])]}case`ellipse`:{if(!hi(e))return[];let t=[],n=Math.cos(e.rotationDeg*Qb),r=Math.sin(e.rotationDeg*Qb);for(let i=0;i<72;i++){let a=i/72*Math.PI*2,o=e.radiusX*Math.cos(a),s=e.radiusY*Math.sin(a);t.push([e.center[0]+o*n-s*r,e.center[1]+o*r+s*n])}return[{kind:`ellipse`,center:e.center,rx:e.radiusX,ry:e.radiusY,rotation:e.rotationDeg*Qb,polygon:t}]}default:return[]}}function tx(e,t,n){if(t.kind===`ellipse`){e.absellipse(t.center[0],n*t.center[1],t.rx,t.ry,0,Math.PI*2,!1,n*t.rotation);return}let r=t.segments[0];if(r){e.moveTo(r.from[0],n*r.from[1]);for(let r of t.segments)if(r.type===`line`)e.lineTo(r.to[0],n*r.to[1]);else{let t=n>0?r.counterclockwise:!r.counterclockwise,i=n*r.startAngleDeg*Qb,a=n*r.endAngleDeg*Qb;e.absarc(r.center[0],n*r.center[1],r.radius,i,a,!t)}e.closePath()}}function nx(e,t={}){let n=Oo(t.blocks?{blocks:t.blocks}:{}),r=t.layers?new Set(t.layers.map(e=>e.toLowerCase())):null,i=[];Mo(e,n,{primitive:(e,t,n)=>{(!r||r.has(t.name.toLowerCase()))&&i.push(...ex(na(e,n.matrix)))}});let a=t.flipY?-1:1;return yr(i.map(e=>e.polygon)).map(e=>{let t=new Ey;tx(t,i[e.outer],a);for(let n of e.holes){let e=new by;tx(e,i[n],a),t.holes.push(e)}return t})}function rx(e,t={}){let[n,r]=e.basePoint,i=nx(e.entities,t);if(n!==0||r!==0){let e=t.flipY?-1:1;for(let t of i)ix(t,-n,-e*r)}return i}function ix(e,t,n){for(let r of e.curves){for(let e of[`v0`,`v1`,`v2`,`v3`]){let i=r[e];i&&(i.x+=t,i.y+=n)}typeof r.aX==`number`&&(r.aX+=t,r.aY+=n)}let r=e.currentPoint;if(r.x+=t,r.y+=n,e instanceof Ey)for(let r of e.holes)ix(r,t,n)}function ax(e,t,n={}){return new cb(rx(e,n),{bevelEnabled:!1,curveSegments:24,...t})}function ox(t,n={}){let r=t.normal.clone().normalize(),i=n.up?.clone()??new X(0,1,0);!n.up&&Math.abs(r.dot(i))>.99&&(i=new X(0,0,-1));let a=i.sub(r.clone().multiplyScalar(i.dot(r)));if(a.lengthSq()<1e-20)throw new e(`section.up`,`is parallel to the plane normal`);a.normalize();let o=new X().crossVectors(a,r).normalize();return{origin:n.origin?.clone()??t.coplanarPoint(new X),xAxis:o,yAxis:a,normal:r}}function sx(e,t,n,r,i,a){let o=e.getAttribute(`position`);if(!o)return;let s=e.getIndex(),c=s?s.count:o.count,l=new X,u=new X,d=new X,f=e=>{let t=e.clone().sub(r.origin),n=t.dot(r.xAxis),i=t.dot(r.yAxis);return[n===0?0:n,i===0?0:i]},p=(e,n)=>n.fromBufferAttribute(o,s?s.getX(e):e).applyMatrix4(t);for(let e=0;e+2<c;e+=3){let t=[p(e,l),p(e+1,u),p(e+2,d)],r=t.map(e=>n.distanceToPoint(e)),o=r.map(e=>e>i?1:e<-i?-1:0);if(o.every(e=>e===0)||o.every(e=>e>0)||o.every(e=>e<0))continue;let s=[];for(let e=0;e<3;e++){let n=t[e],i=t[(e+1)%3],a=o[e],c=o[(e+1)%3],l=r[e],u=r[(e+1)%3];a===0&&s.push(n.clone()),a*c<0&&s.push(n.clone().lerp(i,l/(l-u)))}let c=[];for(let e of s)c.some(t=>t.distanceTo(e)<=i)||c.push(e);c.length===2&&a.push([f(c[0]),f(c[1])])}}function cx(e,t=1e-6){let n=Math.max(t*10,1e-12),r=e=>`${Math.round(e[0]/n)},${Math.round(e[1]/n)}`,i=new Set,a=[];for(let[t,n]of e){let e=r(t),o=r(n);if(e===o)continue;let s=e<o?`${e}|${o}`:`${o}|${e}`;i.has(s)||(i.add(s),a.push({a:e,b:o,pa:t,pb:n,used:!1}))}let o=new Map;a.forEach((e,t)=>{o.set(e.a,[...o.get(e.a)??[],t]),o.set(e.b,[...o.get(e.b)??[],t])});let s=[],c=(e,t)=>{let n=[t],r=e;for(;;){let t=(o.get(r)??[]).find(e=>!a[e].used);if(t===void 0)break;let i=a[t];i.used=!0;let s=i.a===r;if(r=s?i.b:i.a,n.push(s?i.pb:i.pa),r===e)return n.pop(),{points:n,closed:!0}}return{points:n,closed:!1}};for(let[e,t]of o)if(t.length===1&&!a[t[0]].used){let n=a[t[0]];s.push(c(e,n.a===e?n.pa:n.pb))}for(let e of a)e.used||s.push(c(e.a,e.pa));return s.filter(e=>e.points.length>=2)}function lx(e,t,n={}){let r=n.tolerance??1e-6,i=ox(t,n),a=[];return e.updateMatrixWorld(!0),e.traverse(e=>{e instanceof Wm&&e.geometry&&sx(e.geometry,e.matrixWorld,t,i,r,a)}),{basis:i,segments:a,loops:cx(a,r)}}function ux(e,t,n=1e-6){if(e.length<3)return[...e];let r=[],i=e.length;for(let a=0;a<i;a++){let o=r[r.length-1]??(t?e[i-1]:void 0),s=e[a],c=t?e[(a+1)%i]:e[a+1];if(!o||!c){r.push(s);continue}let l=Math.hypot(c[0]-o[0],c[1]-o[1]),u=(s[0]-o[0])*(c[1]-o[1])-(s[1]-o[1])*(c[0]-o[0]);l>0&&Math.abs(u)/l<=n||r.push(s)}return r}function dx(e,t,n={}){let r=n.tolerance??1e-6,i=n.layer??`0`,a=e.loops.filter(e=>e.closed).map(e=>ux(e.points,!0,r)).filter(e=>e.length>=3&&Math.abs(gr(e))>r*r),o=yr(a).map(e=>yi({layer:i,vertices:a[e.outer],closed:!0,holes:e.holes.map(e=>a[e]),fill:n.fill===void 0?`hatch`:n.fill}));if(n.includeOpen)for(let t of e.loops.filter(e=>!e.closed))o.push(yi({layer:i,vertices:ux(t.points,!1,r)}));return io(t,o,n.basePoint?{basePoint:n.basePoint}:{})}function fx(e,t,n=0){let r=Math.max(t.width-2*n,1),i=Math.max(t.height-2*n,1),a=Math.max(e.width,1e-9),o=Math.max(e.height,1e-9),s=Math.max(a/r,o/i),c=t.width*s,l=t.height*s;return{x:e.x+a/2-c/2,y:e.y+o/2-l/2,width:c,height:l}}function px(e,t){return e.width/Math.max(t.width,1)}function mx(e,t,n,r){return[e.x+n/Math.max(t.width,1)*e.width,e.y+r/Math.max(t.height,1)*e.height]}function hx(e,t,n,r,i){let[a,o]=mx(e,t,r,i),s=e.width/n,c=e.height/n;return{x:a-r/Math.max(t.width,1)*s,y:o-i/Math.max(t.height,1)*c,width:s,height:c}}function gx(e,t,n,r){let i=px(e,t);return{...e,x:e.x-n*i,y:e.y-r*i}}function _x(e,t,n){let r=px(e,t),i=e.x+e.width/2,a=e.y+e.height/2,o=n.width*r,s=n.height*r;return{x:i-o/2,y:a-s/2,width:o,height:s}}function vx(e,t,n){return[e,n?-t:t]}var yx=0;function bx(t){if(t instanceof Do)return t;if(t instanceof Uint8Array||t instanceof ArrayBuffer){let n=pu(t);if(!n.document)throw new e(`viewer`,`the .vcad file is a block library without sheets`);return n.document}return Hc(t)}var xx=class{container;options;element;stage;layerStyle;svg=null;doc;sheetId;result=null;view={x:0,y:0,width:1,height:1};fitView={x:0,y:0,width:1,height:1};size={width:1,height:1};visibility=new Map;listeners=new Set;pointers=new Map;pinchDistance=0;dragMoved=!1;prefix;resizeObserver=null;cleanup=[];constructor(e,t,n={}){this.container=e,this.options=n,yx+=1,this.prefix=`cbv${yx}`,this.doc=bx(t),this.sheetId=n.sheet;let r=e.ownerDocument;this.element=r.createElement(`div`),this.element.className=`cad-viewer`,this.element.style.cssText=`position:relative;width:100%;height:100%;overflow:hidden;touch-action:none;user-select:none;background:${n.background??`#ffffff`}`,this.stage=r.createElement(`div`),this.stage.style.cssText=`position:absolute;inset:0;cursor:grab`,this.layerStyle=r.createElement(`style`),this.element.append(this.layerStyle,this.stage),n.toolbar&&this.element.append(this.buildToolbar()),e.append(this.element),this.bindEvents(),this.render()}get document(){return this.doc}get sheet(){return this.doc.requireSheet(this.sheetId).id}get viewBox(){return this.view}get zoom(){return this.fitView.width/this.view.width}setDocument(e,t={}){this.doc=bx(e),this.visibility.clear(),this.render(t)}setSheet(e){this.doc.requireSheet(e),this.sheetId=e,this.render()}render(e={}){let t=this.doc.requireSheet(this.sheetId);this.result=hs(t.entities,this.doc.context(),{size:`none`,hiddenLayers:`hide`,idPrefix:this.prefix,padding:this.options.paper!==void 0,background:this.options.paper??null}),this.svg=this.mountSvg(this.result.svg),this.svg&&(this.svg.setAttribute(`width`,`100%`),this.svg.setAttribute(`height`,`100%`),this.svg.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),this.svg.style.display=`block`),this.measure();let n=e.keepView===!0&&this.view.width>0;this.fitView=fx(this.result.viewBox,this.size,this.options.fitMargin??16),n||(this.view=this.fitView),this.applyLayerStyle(),this.applyView(),this.emit({type:`render`})}fitToView(){this.measure(),this.result&&(this.fitView=fx(this.result.viewBox,this.size,this.options.fitMargin??16)),this.view=this.fitView,this.applyView()}zoomBy(e,t){let n=this.clampZoom(this.zoom*e)/this.zoom;Number.isFinite(n)&&n!==1&&(this.view=hx(this.view,this.size,n,t?.x??this.size.width/2,t?.y??this.size.height/2),this.applyView())}zoomIn(){this.zoomBy(this.options.wheelFactor??1.2)}zoomOut(){this.zoomBy(1/(this.options.wheelFactor??1.2))}layers(){return this.doc.layers.list().map(e=>({name:e.name,color:e.color,visible:this.visibility.get(e.name.toLowerCase())??e.visible}))}setLayerVisible(e,t){let n=this.doc.layers.require(e);this.visibility.set(n.name.toLowerCase(),t),this.applyLayerStyle(),this.emit({type:`layers`,layers:this.layers()})}toggleLayer(e){let t=!(this.layers().find(t=>t.name.toLowerCase()===e.toLowerCase())?.visible??!0);return this.setLayerVisible(e,t),t}isolateLayer(e){let t=this.doc.layers.require(e).name.toLowerCase();for(let e of this.doc.layers)this.visibility.set(e.name.toLowerCase(),e.name.toLowerCase()===t);this.applyLayerStyle(),this.emit({type:`layers`,layers:this.layers()})}showAllLayers(){for(let e of this.doc.layers)this.visibility.set(e.name.toLowerCase(),!0);this.applyLayerStyle(),this.emit({type:`layers`,layers:this.layers()})}exportLayers(){let e=ye.fromJSON(JSON.parse(JSON.stringify(this.doc.layers)));for(let t of e.list()){let n=this.visibility.get(t.name.toLowerCase());n!==void 0&&n!==t.visible&&e.update(t.name,{visible:n})}return e}toSvgString(){return hs(this.doc.requireSheet(this.sheetId).entities,{...this.doc.context(),layers:this.exportLayers()},{background:`#ffffff`}).svg}toDxfString(){let e=this.doc.requireSheet(this.sheetId);return Xs(Do.fromParts({settings:this.doc.settings,dimStyles:this.doc.dimStyles,layers:this.exportLayers(),blocks:this.doc.blocks,sheets:[e]}),this.options.dxf)}toVcadBytes(){return du(this.doc)}downloadVcad(e=this.options.fileName??`drawing`){this.download(`${e}.vcad`,this.toVcadBytes(),`application/zip`)}downloadSvg(e=this.options.fileName??`drawing`){this.download(`${e}.svg`,this.toSvgString(),`image/svg+xml`)}downloadDxf(e=this.options.fileName??`drawing`){this.download(`${e}.dxf`,this.toDxfString(),`application/dxf`)}on(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}destroy(){for(let e of this.cleanup.splice(0))e();this.resizeObserver?.disconnect(),this.listeners.clear(),this.element.remove()}emit(e){for(let t of[...this.listeners])t(e)}mountSvg(e){let t=this.container.ownerDocument,n=t.defaultView?.DOMParser;if(n){let r=new n().parseFromString(e,`image/svg+xml`),i=r.documentElement;if(i&&i.nodeName.toLowerCase()===`svg`&&!r.getElementsByTagName(`parsererror`).length){let e=t.importNode(i,!0);return this.stage.replaceChildren(e),e}}return this.stage.innerHTML=e,this.stage.querySelector(`svg`)}measure(){let e=this.stage.getBoundingClientRect();this.size={width:e.width||this.container.clientWidth||800,height:e.height||this.container.clientHeight||600}}clampZoom(e){return Math.min(this.options.maxZoom??200,Math.max(this.options.minZoom??.05,e))}applyView(){if(!this.svg)return;let e=this.view;this.svg.setAttribute(`viewBox`,`${e.x} ${e.y} ${e.width} ${e.height}`),this.emit({type:`view`,viewBox:e,zoom:this.zoom})}applyLayerStyle(){if(!this.result)return;let e=[];for(let[t,n]of this.result.layerClasses){let r=this.doc.layers.get(t),i=this.visibility.get(t.toLowerCase())??r?.visible??!0;e.push(`.${this.prefix} .${n}{display:${i?`inline`:`none`} !important}`)}this.layerStyle.textContent=e.join(`
`)}download(e,t,n){let r=this.container.ownerDocument,i=r.defaultView;if(!i)return;let a=i.URL.createObjectURL(new i.Blob([t],{type:n})),o=r.createElement(`a`);o.href=a,o.download=e,o.style.display=`none`,r.body.append(o),o.click(),o.remove(),i.setTimeout(()=>i.URL.revokeObjectURL(a),1e3)}local(e){let t=this.stage.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}listen(e,t,n,r){e.addEventListener(t,n,r),this.cleanup.push(()=>e.removeEventListener(t,n,r))}bindEvents(){let e=this.stage;this.listen(e,`wheel`,e=>{e.preventDefault();let t=this.options.wheelFactor??1.2;this.zoomBy(e.deltaY<0?t:1/t,this.local(e))},{passive:!1}),this.listen(e,`pointerdown`,t=>{(t.button===0||t.button===1)&&(e.setPointerCapture?.(t.pointerId),this.pointers.set(t.pointerId,this.local(t)),this.dragMoved=!1,this.pointers.size===2&&(this.pinchDistance=this.currentPinch()),e.style.cursor=`grabbing`)}),this.listen(e,`pointermove`,e=>{let t=this.pointers.get(e.pointerId);if(!t)return;let n=this.local(e);if(this.pointers.size===1)Math.abs(n.x-t.x)+Math.abs(n.y-t.y)>0&&(this.dragMoved=!0),this.view=gx(this.view,this.size,n.x-t.x,n.y-t.y),this.pointers.set(e.pointerId,n),this.applyView();else if(this.pointers.size===2){this.pointers.set(e.pointerId,n);let t=this.currentPinch(),r=[...this.pointers.values()],i={x:((r[0]?.x??0)+(r[1]?.x??0))/2,y:((r[0]?.y??0)+(r[1]?.y??0))/2};this.pinchDistance>0&&t>0&&this.zoomBy(t/this.pinchDistance,i),this.pinchDistance=t,this.dragMoved=!0}});let t=t=>{let n=this.dragMoved;this.pointers.delete(t.pointerId),this.pointers.size<2&&(this.pinchDistance=0),e.style.cursor=`grab`,t.type===`pointerup`&&!n&&this.pointers.size===0&&this.select(t)};this.listen(e,`pointerup`,t),this.listen(e,`pointercancel`,t),this.listen(e,`dblclick`,()=>this.fitToView());let n=this.container.ownerDocument.defaultView?.ResizeObserver;if(n){let e=new n(()=>{let e=this.size;this.measure(),(e.width!==this.size.width||e.height!==this.size.height)&&(this.view=_x(this.view,e,this.size),this.result&&(this.fitView=fx(this.result.viewBox,this.size,this.options.fitMargin??16)),this.applyView())});e.observe(this.stage),this.resizeObserver=e}}currentPinch(){let[e,t]=[...this.pointers.values()];return e&&t?Math.hypot(e.x-t.x,e.y-t.y):0}select(e){let t=e.target,n=t?.closest?.(`[data-id]`)??null,r=t?.closest?.(`[data-layer]`)??null,i=this.local(e),[a,o]=mx(this.view,this.size,i.x,i.y),s=this.doc.settings.coordinateSystem===`cartesian`;this.emit({type:`select`,id:n?.getAttribute(`data-id`)??null,layer:r?.getAttribute(`data-layer`)??null,point:vx(a,o,s)})}buildToolbar(){let e=this.container.ownerDocument,t=e.createElement(`div`);t.style.cssText=`position:absolute;top:8px;right:8px;display:flex;gap:4px;font:12px/1 system-ui,sans-serif;z-index:1`;let n=(t,n,r)=>{let i=e.createElement(`button`);return i.type=`button`,i.textContent=t,i.title=n,i.style.cssText=`padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer`,i.addEventListener(`click`,r),i};t.append(n(`⤢`,`Вписать в окно`,()=>this.fitToView()),n(`+`,`Приблизить`,()=>this.zoomIn()),n(`−`,`Отдалить`,()=>this.zoomOut()),n(`SVG`,`Скачать SVG`,()=>this.downloadSvg()),n(`DXF`,`Скачать DXF`,()=>this.downloadDxf()));for(let e of[`pointerdown`,`dblclick`,`wheel`])t.addEventListener(e,e=>e.stopPropagation());return t}},Sx={en:{layers:{outline:`Outline`,steel:`Section-Steel`,wood:`Section-Wood`,concrete:`Concrete`,wall:`Wall`,mesh:`Mesh-Custom`,hidden:`Hidden`,axes:`Axes`,dims:`Dimensions`,annot:`Annotations`},blocks:{profile:`Profile-AL`,profileDesc:`Aluminium profile 80×60 with chamber`,tread:`Tread-WPC`,treadDesc:`Tread 300×25 with drip nose`,fastener:`Fastener`,section:`Section-3D`},sheets:{primitives:`Primitives`,dimensions:`Dimensions`,blocks:`Blocks & Viewports`,parametric:`Parametric`,section:`3D Section`},primTitle1:`Layer hatches, holes and CadPath`,primTitle2:`Arcs, B-splines, Bézier curves and GOST 2.303 break lines`,primMText:`Multiline MText (GOST type B)
Second line: Ø12 ±0.1 mm · 45°`,dimStep:`<> (step)`,leaderSteel:`Steel St3sp, t = 8 mm`,leaderHole:`Hole Ø80 H9`,vpDetailA:`Detail A (1:2)`,vpDetailB:`Detail B, tread (1:4)`,leaderDrip:`Drip nose R6`,planTitle:`Model plan (top view)`,cutLabel:`A`,vpSectionTitle:e=>`Section A–A from 3D, Z = ${e} mm (1:2)`},ru:{layers:{outline:`Контур`,steel:`Сечение-Сталь`,wood:`Сечение-Дерево`,concrete:`Бетон`,wall:`Стена`,mesh:`Сетка-Кастом`,hidden:`Скрытые`,axes:`Оси`,dims:`Размеры`,annot:`Аннотации`},blocks:{profile:`Профиль-АЛ`,profileDesc:`Алюминиевый профиль 80×60 с камерой`,tread:`Ступень-ДПК`,treadDesc:`Ступень 300×25 с капельником`,fastener:`Крепёж`,section:`Разрез-3D`},sheets:{primitives:`Примитивы`,dimensions:`Размеры`,blocks:`Блоки и экраны`,parametric:`Параметрика`,section:`3D-разрез`},primTitle1:`Штриховки слоёв, вырезы (holes) и CadPath`,primTitle2:`Дуги, B-сплайны, Безье и линии обрыва ГОСТ 2.303`,primMText:`Многострочный MText (ГОСТ тип Б)
Вторая строка: Ø12 ±0,1 мм · 45°`,dimStep:`<> (шаг)`,leaderSteel:`Сталь Ст3сп, t = 8 мм`,leaderHole:`Отв. Ø80 H9`,vpDetailA:`Узел А (1:2)`,vpDetailB:`Узел Б, ступень (1:4)`,leaderDrip:`Капельник R6`,planTitle:`План модели (вид сверху)`,cutLabel:`А`,vpSectionTitle:e=>`Разрез А–А из 3D, Z = ${e} мм (1:2)`}},Cx={x:130,y:20,z:200,w:50,h:40,d:160};function wx(e,t){let n=Sx[t.lang].layers;e.dimStyles.update(`GOST`,{terminatorType:t.terminatorType,textPosition:t.textPosition,textOrientation:t.textOrientation,dimLineOvershoot:t.terminatorType===`tick`?2:0,decimalSeparator:t.lang===`en`?`.`:`,`}),e.layers.create(n.outline,{color:`#0f172a`,lineWeight:.5}),e.layers.create(n.steel,{color:`#1e3a8a`,lineWeight:.5,hatch:`steel-45`}),e.layers.create(n.wood,{color:`#78350f`,lineWeight:.4,hatch:`board-45`}),e.layers.create(n.concrete,{color:`#475569`,lineWeight:.35,hatch:`concrete`}),e.layers.create(n.wall,{color:`#334155`,lineWeight:.4,hatch:`wall-45`}),e.layers.create(n.mesh,{color:`#0f766e`,lineWeight:.35,hatch:se({families:[{angle:45,spacing:3,lineWidth:.15},{angle:135,spacing:3,lineWidth:.15}],background:`#f0fdfa`})}),e.layers.create(n.hidden,{color:`#64748b`,lineWeight:.25,lineType:`dashed`}),e.layers.create(n.axes,{color:`#dc2626`,lineWeight:.18,lineType:`dashdot`}),e.layers.create(n.dims,{color:`#0284c7`,lineWeight:.2}),e.layers.create(n.annot,{color:`#0f172a`,lineWeight:.25})}function Tx(e,t){let n=Sx[t],r=Ur.start(0,0).right(80).up(60).left(25).down(18).left(30).up(18).left(25).close().filletAll(4).build(),i=Ur.start(10,10).right(60).up(22).left(60).close().filletAll(2).build();e.blocks.define(n.blocks.profile,[Pi(r,{holes:[i],layer:n.layers.steel,fill:`hatch`,id:`block-profile-body`}),Ei([-8,21],[88,21],{layer:n.layers.axes})],{description:n.blocks.profileDesc});let a=Ur.start(0,0).right(300).down(35).fillet(6).left(22).up(10).left(278).close().chamfer(4,4,{vertex:0}).build();e.blocks.define(n.blocks.tread,[Pi(a,{layer:n.layers.wood,fill:`hatch`,id:`block-tread`})],{description:n.blocks.treadDesc}),e.blocks.define(n.blocks.fastener,[Di([0,0],8),Ei([-12,0],[12,0]),Ei([0,-12],[0,12])])}function Ex(e,t){let n=Sx[t],r=e.addSheet(n.sheets.primitives,[],`primitives`);r.add(Fi([0,540],n.primTitle1,{layer:n.layers.annot,height:3.5}),Pi(Ur.start(0,320).right(260).up(180).left(260).close().fillet(25,{vertex:1}).chamfer(25,25,{vertex:2}).build(),{id:`prim-poly-holes`,layer:n.layers.steel,fill:`hatch`,holes:[Ur.start(30,360).right(80).up(100).left(80).close().filletAll(12).build(),[[150,410,1],[220,410,1]]]}),ji(310,320,180,180,{cornerRadius:24,layer:n.layers.wood,fill:`hatch`,id:`prim-rect-wood`}),Di([610,410],90,{layer:n.layers.concrete,fill:`hatch`,id:`prim-circle-concrete`}),Ai([840,410],110,65,{rotationDeg:25,layer:n.layers.mesh,fill:`hatch`,id:`prim-ellipse-mesh`}),Ei([500,410],[720,410],{layer:n.layers.axes}),Ei([610,300],[610,520],{layer:n.layers.axes}));let i=Ur.start(0,120).right(80).arcTo(180,200,{tangent:!0}).arcTo(280,120,{tangent:!0}).right(60).build();r.add(Fi([0,265],n.primTitle2,{layer:n.layers.annot,height:3.5}),Ni(i,{layer:n.layers.outline,id:`prim-scurve`}),Oi([430,150],70,20,240,{layer:n.layers.outline,id:`prim-arc`}),Ti([430,150],{layer:n.layers.axes,id:`prim-center-pt`}),ki([540,100],[610,220],[680,110],{layer:n.layers.steel,id:`prim-arc-3pt`}),Li([[720,100],[770,230],[850,60],[930,220],[1e3,120]],{degree:3,layer:n.layers.outline,id:`prim-spline`}),zi([[1040,110],[1100,210],[1170,90],[1240,190]],{layer:n.layers.axes,id:`prim-fit-bezier`}),Ri([[0,30],[60,90],[120,-30],[180,30]],{layer:n.layers.hidden,id:`prim-bezier`}),Bi([260,-10],[260,90],{waves:3,amplitude:8,layer:n.layers.outline,id:`prim-break-wave`}),Vi([340,40],[560,40],{size:36,layer:n.layers.outline,id:`prim-break-zigzag`}),Ii([720,40],n.primMText,{layer:n.layers.annot,height:3.5,anchor:`top-left`,id:`prim-mtext`}))}function Dx(e,t){let n=Sx[t],r=e.addSheet(n.sheets.dimensions,[],`dimensions`),i=Ur.start(0,0).right(700).up(120).left(180).polar(220,135).left(200).fillet(40).close().build(),a=[520-220*Math.SQRT1_2,120+220*Math.SQRT1_2];r.add(Pi(i,{layer:n.layers.outline,fill:`#f8fafc`,holes:[[[140,110,1],[220,110,1]],[[460,80,1],[500,80,1]]],id:`dim-part`}),Ei([120,110],[240,110],{layer:n.layers.axes}),Ei([180,50],[180,170],{layer:n.layers.axes}),Ei([445,80],[515,80],{layer:n.layers.axes}),Ei([480,45],[480,115],{layer:n.layers.axes}),Ca([[0,0],[180,0],[480,0],[700,0]],{offset:-70,layer:n.layers.dims,texts:[null,n.dimStep,null],id:`dim-chain`}),wa([0,0],[[180,0],[480,0],[700,0]],{offset:-150,layer:n.layers.dims,id:`dim-baseline`}),xa([700,0],[700,120],{direction:`vertical`,offset:-80,layer:n.layers.dims,id:`dim-vertical`}),xa([520,120],[700,120],{offset:30,layer:n.layers.dims,id:`dim-shelf`}),xa([180,110],[198,110],{offset:150,layer:n.layers.dims,id:`dim-tight`}),Sa([520,120],a,{offset:-60,layer:n.layers.dims,id:`dim-aligned-slope`}),Ta([520,120],[700,120],a,{radius:110,layer:n.layers.dims,id:`dim-angle`}),Da([180,110],40,{angleDeg:35,layer:n.layers.dims,id:`dim-dia`}),Ea([480,80],20,{angleDeg:-45,layer:n.layers.dims,id:`dim-rad`}),Oa([[600,60],[780,220]],n.leaderSteel,{layer:n.layers.dims,id:`leader-right`}),Oa([[150,140],[40,360]],n.leaderHole,{layer:n.layers.dims,id:`leader-left`}))}function Ox(e,t){let n=Sx[t];e.addSheet(n.sheets.blocks,[],`blocks`).add(...[0,1,2,3].flatMap(e=>[co(n.blocks.tread,[e*270,(e+1)*160],{id:`tread-${e+1}`}),co(n.blocks.fastener,[e*270+60,(e+1)*160-12],{layer:n.layers.axes,id:`fastener-${e+1}`})]),co(n.blocks.profile,[0,0],{id:`profile-left`}),co(n.blocks.profile,[1150,0],{scaleX:-1,id:`profile-right-mirrored`}),Fi([1070,80],`scaleX: −1`,{layer:n.layers.annot,height:2.5,anchor:`bottom-center`}),xa([0,0],[1150,0],{offset:-90,layer:n.layers.dims}),Ca([[0,0],[270,0],[540,0],[810,0],[1110,0]],{offset:-170,layer:n.layers.dims}),po([co(n.blocks.profile,[0,0]),co(n.blocks.fastener,[40,21],{layer:n.layers.axes,scale:.5}),xa([0,0],[80,0],{offset:-14,layer:n.layers.dims}),xa([80,0],[80,60],{direction:`vertical`,offset:-14,layer:n.layers.dims})],{id:`vp-detail-a`,position:[150,-560],target:[40,30],scale:`1:2`,clip:{minX:-20,minY:-32,maxX:112,maxY:72},frame:!0,title:n.vpDetailA,layer:n.layers.annot}),po([co(n.blocks.tread,[0,0]),xa([0,0],[300,0],{offset:22,layer:n.layers.dims}),Oa([[290,-30],[230,-70]],n.leaderDrip,{layer:n.layers.dims})],{id:`vp-detail-b`,position:[860,-560],target:[150,-15],scale:`1:4`,clip:{minX:-20,minY:-90,maxX:320,maxY:50},frame:!0,title:n.vpDetailB,layer:n.layers.annot}))}function kx(e,t){let n=Sx[t.lang],r=e.addSheet(n.sheets.parametric,[],`parametric`),{width:i,height:a,cornerRadius:o}=t,s=Ur.start(0,0).right(i).up(a).left(i).close(),c=Math.min(o,Math.min(i,a)/2-1);c>0&&s.filletAll(c);let l=Ur.start(i*.2,a*.25).right(i*.35).up(a*.5).left(i*.35).close().filletAll(Math.min(20,a*.24)).build();r.add(Pi([[-25,0],[-25,a+25],[i+25,a+25],[i+25,0],[i,0],[i,a],[0,a],[0,0]],{layer:n.layers.wall,fill:`hatch`,id:`param-wall`}),Pi(s.build(),{layer:n.layers.outline,fill:`#fef9c3`,holes:[l],id:`param-countertop`}),Di([i*.375,a*.85],17.5,{layer:n.layers.outline,id:`param-mixer-hole`}),wa([0,a+25],[[i,a+25],[i+25,a+25]],{offset:40,layer:n.layers.dims}),xa([0,0],[0,a],{direction:`vertical`,offset:85,layer:n.layers.dims}),Ca([[0,0],[i*.2,0],[i*.55,0],[i,0]],{offset:-60,layer:n.layers.dims}),Da([i*.375,a*.85],17.5,{angleDeg:45,layer:n.layers.dims}),...c>0?[Ea([i-c,a-c],c,{angleDeg:45,layer:n.layers.dims})]:[])}function Ax(e,t,n){let r=Sx[t.lang],i=e.addSheet(r.sheets.section,[],`section`),a=t.cutZ,o=Cx;i.add(Fi([0,40],r.planTitle,{layer:r.layers.annot,height:3.5}),ji(0,-400,80,400,{layer:r.layers.outline,fill:`#dbeafe`,id:`plan-profile`}),ji(o.x-o.w/2,-(o.z+o.d/2),o.w,o.d,{layer:r.layers.outline,fill:`#e0e7ff`,id:`plan-cross`}),xa([0,0],[0,-400],{direction:`vertical`,offset:90,layer:r.layers.dims}),xa([o.x+o.w/2,-(o.z-o.d/2)],[o.x+o.w/2,-(o.z+o.d/2)],{direction:`vertical`,offset:-25,layer:r.layers.dims}),Ei([-40,-a],[o.x+o.w/2+40,-a],{layer:r.layers.axes,id:`cut-line`}),Fi([-45,-a],r.cutLabel,{layer:r.layers.annot,height:5,anchor:`middle-right`}),Fi([o.x+o.w/2+45,-a],r.cutLabel,{layer:r.layers.annot,height:5,anchor:`middle-left`})),e.blocks.add(dx(n,r.blocks.section,{layer:r.layers.steel,fill:`hatch`}));let s=Math.abs(a-o.z)<o.d/2;i.add(po([co(r.blocks.section,[0,0],{id:`three-section`}),xa([0,0],[80,0],{offset:-14,layer:r.layers.dims}),...s?[xa([80,0],[o.x+o.w/2,0],{offset:-14,layer:r.layers.dims})]:[],xa([0,0],[0,60],{direction:`vertical`,offset:14,layer:r.layers.dims})],{id:`vp-section`,position:[760,-200],target:[80,30],scale:`1:2`,title:r.vpSectionTitle(a),layer:r.layers.annot}))}function jx(e){let t=new yv,n=new Wm(ax(e.blocks.get(Sx.en.blocks.profile)??e.blocks.require(Sx.ru.blocks.profile),{depth:400}));n.name=`profile`,t.add(n);let r=Cx,i=new Wm(new qm(r.w,r.h,r.d));return i.name=`cross`,i.position.set(r.x,r.y,r.z),t.add(i),t.updateMatrixWorld(!0),t}function Mx(e){return new hh(new X(0,0,1),-e)}function Nx(e,t){let n=new Do({gost:!0,settings:{units:`mm`,precision:2,scale:e.scale,annotationScale:`auto`,coordinateSystem:`cartesian`,padding:[12,16]}});return wx(n,e),Tx(n,e.lang),Ex(n,e.lang),Dx(n,e.lang),Ox(n,e.lang),kx(n,e),Ax(n,e,lx(t??jx(n),Mx(e.cutZ))),n}var Px=`cad-blueprint-demo-lang`;function Fx(){try{let e=new URLSearchParams(window.location.search).get(`lang`);if(e===`en`||e===`ru`)return e;let t=window.localStorage.getItem(Px);if(t===`en`||t===`ru`)return t}catch{}return`en`}function Ix(e){try{window.localStorage.setItem(Px,e)}catch{}try{let t=new URL(window.location.href);e===`en`?t.searchParams.delete(`lang`):t.searchParams.set(`lang`,e),window.history.replaceState(null,``,t)}catch{}}var Lx={en:{pageTitle:`cad-blueprint · demo`,brandMeta:`v0.3 · demo`,docsLink:`Documentation →`,fitTitle:`Fit to view`,zoomOutTitle:`Zoom out`,zoomInTitle:`Zoom in`,importDxf:`Import DXF`,importDxfTitle:`Open DXF as a new sheet`,dxf2000Title:`DXF R2000 for legacy CAD software`,vcadTitle:`Full document: JSON + manifest in zip`,layersHeading:`Layers`,showAllLayers:`show all`,isolateLayer:`only`,isolateLayerTitle:`Show only this layer`,dimStyleHeading:`Dimension style`,terminatorLabel:`Terminators`,terminators:{"arrow-closed":`Arrow (closed)`,"arrow-open":`Arrow (open)`,tick:`Tick 45° (GOST)`,dot:`Dot`,circle:`Circle`,none:`None`},textPosLabel:`Text position`,textPositions:{above:`Above line`,centered:`Centered (break line)`,outside:`Outside`},textOrientLabel:`Text orientation`,textOrientations:{aligned:`Aligned with line`,horizontal:`Horizontal`},scaleLabel:`Drawing scale`,parametricHeading:`Parametric`,widthLabel:`Width`,depthLabel:`Depth`,cornerRadiusLabel:`Corner radius`,cutZLabel:`Section Z`,mmUnit:`mm`,statusDefault:`Wheel — zoom, drag — pan, double-click — fit, click — select entity`,threeHeading:`3D & section`,threeHintHtml:`Drag the <b>red plane</b> to move the section. Orbit with drag, zoom with wheel.`,docSizeHeading:`Document size`,sizeVerboseLabel:`JSON (verbose)`,sizeCompactLabel:`Compact JSON`,sizeVcadLabel:`.vcad (zip)`,jsonPreviewHeading:`Sheet compact JSON`,bytesUnit:`B`,kbUnit:`KB`,sizeRatio:e=>`${e}× smaller`,auditOk:`audit: ok`,auditIssues:e=>`audit: ${e} issue${e===1?``:`s`}`,importSuccess:(e,t,n)=>`Imported: ${e} entities, file units: ${t??`unspecified`}`+(n.length?` · skipped: ${n.join(`; `)}`:``),importError:e=>`Failed to read DXF: ${e}`,selectEntity:(e,t,n)=>`Entity id="${e}", layer "${t??``}", point ${n}`,selectPoint:(e,t)=>`Model point ${e}${t?`, layer "${t}"`:``}`,webglError:e=>`WebGL unavailable: ${e}`},ru:{pageTitle:`cad-blueprint · демо`,brandMeta:`v0.3 · демо`,docsLink:`Документация →`,fitTitle:`Вписать в окно`,zoomOutTitle:`Отдалить`,zoomInTitle:`Приблизить`,importDxf:`Импорт DXF`,importDxfTitle:`Открыть DXF как новый лист`,dxf2000Title:`DXF R2000 для старых программ`,vcadTitle:`Весь документ: JSON + манифест в zip`,layersHeading:`Слои`,showAllLayers:`показать все`,isolateLayer:`только`,isolateLayerTitle:`Показать только этот слой`,dimStyleHeading:`Стиль размеров`,terminatorLabel:`Засечки`,terminators:{"arrow-closed":`Стрелка (закрытая)`,"arrow-open":`Стрелка (открытая)`,tick:`Засечка 45° (ГОСТ)`,dot:`Точка`,circle:`Кружок`,none:`Нет`},textPosLabel:`Положение текста`,textPositions:{above:`Над линией`,centered:`В разрыве линии`,outside:`Снаружи`},textOrientLabel:`Ориентация текста`,textOrientations:{aligned:`Вдоль линии`,horizontal:`Горизонтально`},scaleLabel:`Масштаб чертежа`,parametricHeading:`Параметрика`,widthLabel:`Ширина`,depthLabel:`Глубина`,cornerRadiusLabel:`Радиус углов`,cutZLabel:`Разрез по Z`,mmUnit:`мм`,statusDefault:`Колесо — зум, перетаскивание — панорама, двойной клик — вписать, клик — выбор объекта`,threeHeading:`3D и сечение`,threeHintHtml:`Тяни <b>красную плоскость</b> мышью, чтобы двигать разрез. Остальное вращает камеру, колесо — зум.`,docSizeHeading:`Размер документа`,sizeVerboseLabel:`JSON (подробный)`,sizeCompactLabel:`Компактный JSON`,sizeVcadLabel:`.vcad (zip)`,jsonPreviewHeading:`Компактный JSON листа`,bytesUnit:`Б`,kbUnit:`КБ`,sizeRatio:e=>`в ${e} раза меньше`,auditOk:`audit: без замечаний`,auditIssues:e=>`audit: ${e} замеч.`,importSuccess:(e,t,n)=>`Импортировано: ${e} объектов, единицы файла: ${t??`не заданы`}`+(n.length?` · пропущено: ${n.join(`; `)}`:``),importError:e=>`Не удалось прочитать DXF: ${e}`,selectEntity:(e,t,n)=>`Объект id="${e}", слой «${t??``}», точка ${n}`,selectPoint:(e,t)=>`Точка модели ${e}${t?`, слой «${t}»`:``}`,webglError:e=>`WebGL недоступен: ${e}`}},Rx={type:`change`},zx={type:`start`},Bx={type:`end`},Vx=new xp,Hx=new hh,Ux=Math.cos(70*gf.DEG2RAD),Wx=new X,Gx=2*Math.PI,Kx={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},qx=1e-6,Jx=class extends Zb{constructor(e,t=null){super(e,t),this.state=Kx.NONE,this.enabled=!0,this.target=new X,this.cursor=new X,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:mu.ROTATE,MIDDLE:mu.DOLLY,RIGHT:mu.PAN},this.touches={ONE:hu.ROTATE,TWO:hu.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new X,this._lastQuaternion=new Kf,this._lastTargetPosition=new X,this._quat=new Kf().setFromUnitVectors(e.up,new X(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Xb,this._sphericalDelta=new Xb,this._scale=1,this._panOffset=new X,this._rotateStart=new J,this._rotateEnd=new J,this._rotateDelta=new J,this._panStart=new J,this._panEnd=new J,this._panDelta=new J,this._dollyStart=new J,this._dollyEnd=new J,this._dollyDelta=new J,this._dollyDirection=new X,this._mouse=new J,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Xx.bind(this),this._onPointerDown=Yx.bind(this),this._onPointerUp=Zx.bind(this),this._onContextMenu=iS.bind(this),this._onMouseWheel=eS.bind(this),this._onKeyDown=tS.bind(this),this._onTouchStart=nS.bind(this),this._onTouchMove=rS.bind(this),this._onMouseDown=Qx.bind(this),this._onMouseMove=$x.bind(this),this._interceptControlDown=aS.bind(this),this._interceptControlUp=oS.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=`auto`}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Rx),this.update(),this.state=Kx.NONE}update(e=null){let t=this.object.position;Wx.copy(t).sub(this.target),Wx.applyQuaternion(this._quat),this._spherical.setFromVector3(Wx),this.autoRotate&&this.state===Kx.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=Gx:n>Math.PI&&(n-=Gx),r<-Math.PI?r+=Gx:r>Math.PI&&(r-=Gx),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let i=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),i=e!=this._spherical.radius}if(Wx.setFromSpherical(this._spherical),Wx.applyQuaternion(this._quatInverse),t.copy(this.target).add(Wx),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=Wx.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),i=!!n}else if(this.object.isOrthographicCamera){let t=new X(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),i=n!==this.object.zoom;let r=new X(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=Wx.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(Vx.origin.copy(this.object.position),Vx.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Vx.direction))<Ux?this.object.lookAt(this.target):(Hx.setFromNormalAndCoplanarPoint(this.object.up,this.target),Vx.intersectPlane(Hx,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),i=!0)}return this._scale=1,this._performCursorZoom=!1,i||this._lastPosition.distanceToSquared(this.object.position)>qx||8*(1-this._lastQuaternion.dot(this.object.quaternion))>qx||this._lastTargetPosition.distanceToSquared(this.target)>qx?(this.dispatchEvent(Rx),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?Gx/60/60*this.autoRotateSpeed:Gx/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Wx.setFromMatrixColumn(t,0),Wx.multiplyScalar(-e),this._panOffset.add(Wx)}_panUp(e,t){this.screenSpacePanning===!0?Wx.setFromMatrixColumn(t,1):(Wx.setFromMatrixColumn(t,0),Wx.crossVectors(this.object.up,Wx)),Wx.multiplyScalar(e),this._panOffset.add(Wx)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;Wx.copy(r).sub(this.target);let i=Wx.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Gx*this._rotateDelta.x/t.clientHeight),this._rotateUp(Gx*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(Gx*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-Gx*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(Gx*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-Gx*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Gx*this._rotateDelta.x/t.clientHeight),this._rotateUp(Gx*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new J,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Yx(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.addEventListener(`pointermove`,this._onPointerMove),this.domElement.addEventListener(`pointerup`,this._onPointerUp)),this._isTrackingPointer(e)||(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e)))}function Xx(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function Zx(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(Bx),this.state=Kx.NONE;break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y})}}function Qx(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case mu.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=Kx.DOLLY;break;case mu.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=Kx.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=Kx.ROTATE}break;case mu.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=Kx.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=Kx.PAN}break;default:this.state=Kx.NONE}this.state!==Kx.NONE&&this.dispatchEvent(zx)}function $x(e){switch(this.state){case Kx.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case Kx.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case Kx.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e)}}function eS(e){this.enabled!==!1&&this.enableZoom!==!1&&this.state===Kx.NONE&&(e.preventDefault(),this.dispatchEvent(zx),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(Bx))}function tS(e){this.enabled!==!1&&this.enablePan!==!1&&this._handleKeyDown(e)}function nS(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case hu.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=Kx.TOUCH_ROTATE;break;case hu.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=Kx.TOUCH_PAN;break;default:this.state=Kx.NONE}break;case 2:switch(this.touches.TWO){case hu.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=Kx.TOUCH_DOLLY_PAN;break;case hu.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=Kx.TOUCH_DOLLY_ROTATE;break;default:this.state=Kx.NONE}break;default:this.state=Kx.NONE}this.state!==Kx.NONE&&this.dispatchEvent(zx)}function rS(e){switch(this._trackPointer(e),this.state){case Kx.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case Kx.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case Kx.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case Kx.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=Kx.NONE}}function iS(e){this.enabled!==!1&&e.preventDefault()}function aS(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function oS(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}var sS=class{host;options;renderer;camera;world=new jv;controls;plane;planeEdge;contour=new yv;raycaster=new qb;dragging=!1;hover=!1;cutZ;frame=0;constructor(e,t){this.host=e,this.options=t,this.cutZ=t.cutZ;let{width:n,height:r}=this.size();this.camera=new oh(38,n/r,1,1e4),this.camera.position.set(330,240,640),this.renderer=new Av({antialias:!0,alpha:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.setSize(n,r),e.append(this.renderer.domElement),this.controls=new Jx(this.camera,this.renderer.domElement),this.controls.target.set(80,30,200),this.controls.enableDamping=!1,this.controls.addEventListener(`change`,()=>this.requestRender()),this.controls.update(),this.world.add(new Db(16777215,9741240,1.1));let i=new Nb(16777215,1.4);i.position.set(300,500,400),this.world.add(i);let a=e=>new db({color:e,metalness:.25,roughness:.55,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1});t.scene.traverse(e=>{e instanceof Wm&&(e.material=a(e.name===`cross`?6514417:6333946),e.add(new Wv(new Ty(e.geometry,25),new Mv({color:1981066}))))}),this.world.add(t.scene);let o=Cx,s=o.x+o.w/2+60;this.plane=new Wm(new xh(s,110),new vm({color:15680580,transparent:!0,opacity:.18,side:2,depthWrite:!1})),this.plane.position.set(s/2-30,30,this.cutZ),this.planeEdge=new Wv(new Ty(this.plane.geometry),new Mv({color:15680580})),this.plane.add(this.planeEdge),this.world.add(this.plane,this.contour),this.bindDrag(),new ResizeObserver(()=>this.resize()).observe(e),this.requestRender()}setCut(e,t){this.cutZ=e,this.plane.position.z=e,t&&this.setContour(t),this.requestRender()}setContour(e){for(let e of[...this.contour.children])this.contour.remove(e),e.geometry.dispose();let{origin:t,xAxis:n,yAxis:r}=e.basis,i=new Mv({color:14427686,depthTest:!1});for(let a of e.loops){let e=a.points.map(([e,i])=>t.clone().addScaledVector(n,e).addScaledVector(r,i)),o=new Mm().setFromPoints(e),s=a.closed?new Gv(o,i):new Bv(o,i);s.renderOrder=10,this.contour.add(s)}this.requestRender()}size(){return{width:Math.max(this.host.clientWidth,1),height:Math.max(this.host.clientHeight,1)}}resize(){let{width:e,height:t}=this.size();this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t),this.requestRender()}requestRender(){this.frame||=requestAnimationFrame(()=>{this.frame=0,this.renderer.render(this.world,this.camera)})}pointer(e){let t=this.renderer.domElement.getBoundingClientRect();return new J((e.clientX-t.left)/t.width*2-1,-((e.clientY-t.top)/t.height)*2+1)}hitsPlane(e){return this.raycaster.setFromCamera(this.pointer(e),this.camera),this.raycaster.intersectObject(this.plane,!1).length>0}zUnderPointer(e){this.raycaster.setFromCamera(this.pointer(e),this.camera);let t=new X(0,0,1),n=this.plane.position.clone(),r=this.camera.position.clone().sub(n),i=r.sub(t.clone().multiplyScalar(r.dot(t)));if(i.lengthSq()<1e-9)return null;let a=new hh().setFromNormalAndCoplanarPoint(i.normalize(),n),o=this.raycaster.ray.intersectPlane(a,new X);return o?o.z:null}setHover(e){this.hover!==e&&(this.hover=e,this.plane.material.opacity=e||this.dragging?.32:.18,this.renderer.domElement.style.cursor=e?`ns-resize`:``,this.requestRender())}bindDrag(){let e=this.renderer.domElement,t=0;e.addEventListener(`pointerdown`,n=>{if(n.button!==0||!this.hitsPlane(n))return;let r=this.zUnderPointer(n);r!==null&&(this.dragging=!0,t=this.cutZ-r,this.controls.enabled=!1,e.setPointerCapture(n.pointerId),n.stopImmediatePropagation())},{capture:!0}),e.addEventListener(`pointermove`,e=>{if(!this.dragging){this.setHover(this.hitsPlane(e));return}let n=this.zUnderPointer(e);if(n===null)return;let r=Math.round(Math.min(this.options.maxZ,Math.max(this.options.minZ,n+t)));r!==this.cutZ&&(this.cutZ=r,this.plane.position.z=r,this.requestRender(),this.options.onCut(r))});let n=t=>{this.dragging&&(this.dragging=!1,this.controls.enabled=!0,e.hasPointerCapture(t.pointerId)&&e.releasePointerCapture(t.pointerId),this.setHover(this.hitsPlane(t)))};e.addEventListener(`pointerup`,n),e.addEventListener(`pointercancel`,n)}},$=e=>{let t=document.getElementById(e);if(!t)throw Error(`#${e} not found`);return t},cS=Fx(),lS={lang:cS,terminatorType:`arrow-closed`,textPosition:`above`,textOrientation:`aligned`,scale:`1:5`,width:1200,height:600,cornerRadius:40,cutZ:180},uS=jx(Nx(lS)),dS=[];function fS(){let e=Nx(lS,uS);for(let t of dS)t.build(e);return e}var pS=new xx($(`viewer-host`),fS(),{sheet:`primitives`,background:`transparent`,paper:`#ffffff`,fitMargin:24,fileName:`cad-blueprint-demo`});function mS(){let e=$(`sheet-tabs`);e.replaceChildren();for(let t of pS.document.sheets){let n=document.createElement(`button`);n.type=`button`,n.className=`tab-btn${t.id===pS.sheet?` active`:``}`,n.textContent=t.name,n.addEventListener(`click`,()=>hS(t.id)),e.append(n)}}function hS(e){pS.sheet!==e&&pS.setSheet(e),mS(),gS()}function gS(){let e=$(`layer-list`);e.replaceChildren();for(let t of pS.layers()){let n=document.createElement(`label`);n.className=`layer-row`;let r=document.createElement(`input`);r.type=`checkbox`,r.checked=t.visible,r.addEventListener(`change`,()=>pS.setLayerVisible(t.name,r.checked));let i=document.createElement(`span`);i.className=`layer-dot`,i.style.background=t.color;let a=document.createElement(`span`);a.className=`layer-name`,a.textContent=t.name;let o=document.createElement(`button`);o.type=`button`,o.className=`link-btn`,o.textContent=Lx[cS].isolateLayer,o.title=Lx[cS].isolateLayerTitle,o.addEventListener(`click`,e=>{e.preventDefault(),pS.isolateLayer(t.name),gS()}),n.append(r,i,a,o),e.append(n)}}$(`btn-show-all-layers`).addEventListener(`click`,()=>{pS.showAllLayers(),gS()});var _S=e=>new TextEncoder().encode(e).length,vS=e=>{let t=Lx[cS];return e<1024?`${e} ${t.bytesUnit}`:`${(e/1024).toFixed(1)} ${t.kbUnit}`};function yS(){let e=pS.document,t=_S(JSON.stringify(e)),n=Uc(e);$(`size-verbose`).textContent=vS(t),$(`size-compact`).textContent=vS(_S(n)),$(`size-vcad`).textContent=vS(du(e).byteLength),$(`size-ratio`).textContent=Lx[cS].sizeRatio((t/_S(n)).toFixed(1));let r=Vc(e).sh.find(e=>Array.isArray(e)&&e[0]===pS.sheet),i=JSON.stringify(r??[]);$(`json-preview`).textContent=i.length>1500?`${i.slice(0,1500)}…`:i;let a=e.audit(),o=$(`status-audit`);o.textContent=a.length===0?Lx[cS].auditOk:Lx[cS].auditIssues(a.length),o.title=a.map(e=>`${e.path}: ${e.message}`).join(`
`)}var bS=0;function xS(e=!0){bS||=requestAnimationFrame(()=>{bS=0;let t=pS.layers().filter(e=>!e.visible).map(e=>e.name);pS.setDocument(fS(),{keepView:e});for(let e of t)pS.document.layers.has(e)&&pS.setLayerVisible(e,!1);mS(),gS(),yS()})}function SS(e,t,n=!0){let r=$(e);r.value=String(lS[t]),r.addEventListener(`change`,()=>{lS[t]=r.value,xS(n)})}SS(`sel-terminator`,`terminatorType`),SS(`sel-text-pos`,`textPosition`),SS(`sel-text-orient`,`textOrientation`),SS(`sel-scale`,`scale`,!1);function CS(e,t,n){let r=$(e),i=$(`${e}-val`);r.value=String(lS[t]),i.textContent=String(lS[t]),r.addEventListener(`input`,()=>{lS[t]=Number(r.value),i.textContent=r.value,t===`cutZ`&&DS?.setCut(lS.cutZ,lx(uS,Mx(lS.cutZ))),pS.sheet!==n&&pS.setSheet(n),xS(!0)})}CS(`rng-w`,`width`,`parametric`),CS(`rng-h`,`height`,`parametric`),CS(`rng-r`,`cornerRadius`,`parametric`),CS(`rng-cut`,`cutZ`,`section`),$(`btn-fit`).addEventListener(`click`,()=>pS.fitToView()),$(`btn-zoom-in`).addEventListener(`click`,()=>pS.zoomIn()),$(`btn-zoom-out`).addEventListener(`click`,()=>pS.zoomOut()),$(`btn-svg`).addEventListener(`click`,()=>pS.downloadSvg(`cad-${pS.sheet}`)),$(`btn-dxf`).addEventListener(`click`,()=>pS.downloadDxf(`cad-${pS.sheet}-r2007`)),$(`btn-dxf-2000`).addEventListener(`click`,()=>{wS(`cad-${pS.sheet}-r2000.dxf`,Xs(pS.document,{sheet:pS.sheet,version:`R2000`}),`application/dxf`)}),$(`btn-vcad`).addEventListener(`click`,()=>wS(`cad-blueprint-demo.vcad`,du(pS.document,{meta:{demo:!0}}),`application/zip`));function wS(e,t,n){let r=URL.createObjectURL(new Blob([t],{type:n})),i=document.createElement(`a`);i.href=r,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(r),1e3)}var TS=$(`input-dxf`);TS.addEventListener(`change`,async()=>{let e=TS.files?.[0];if(TS.value=``,e)try{let t=await e.arrayBuffer(),n=e.name.replace(/\.dxf$/i,``),r=dS.length+1,i=`dxf-${r}`,a=`DXF-${r}`,o=xc(t,{name:a,fill:`hatch`,basePoint:`min`});dS.push({sheetId:i,title:n,build:e=>{for(let t of o.layers)e.layers.has(t.name)||e.layers.create(t.name,t);e.blocks.add(o.block),e.addSheet(`DXF: ${n}`,[co(a,[0,0],{id:`dxf-${r}`})],i)}}),pS.setDocument(fS()),hS(i),yS(),ES(Lx[cS].importSuccess(o.block.entities.length,o.fileUnits,o.warnings))}catch(e){ES(Lx[cS].importError(e.message),!0)}});function ES(e,t=!1){let n=$(`status-select`);n.textContent=e,n.classList.toggle(`error`,t)}pS.on(e=>{if(e.type===`view`)$(`zoom-label`).textContent=`${Math.round(e.zoom*100)}%`;else if(e.type===`select`){let[t,n]=e.point,r=`(${t.toFixed(1)}; ${n.toFixed(1)})`;ES(e.id?Lx[cS].selectEntity(e.id,e.layer,r):Lx[cS].selectPoint(r,e.layer))}});var DS=null;try{DS=new sS($(`three-preview`),{scene:uS,cutZ:lS.cutZ,minZ:0,maxZ:400,onCut:e=>{lS.cutZ=e,$(`rng-cut`).value=String(e),$(`rng-cut-val`).textContent=String(e),DS?.setContour(lx(uS,Mx(e))),pS.sheet!==`section`&&pS.setSheet(`section`),xS(!0)}}),DS.setContour(lx(uS,Mx(lS.cutZ)))}catch(e){$(`three-preview`).textContent=Lx[cS].webglError(e.message)}function OS(e,t){let n=$(e);for(let e of n.options){let n=t[e.value];n!==void 0&&(e.textContent=n)}}function kS(){let e=Lx[cS];document.documentElement.lang=cS,document.title=e.pageTitle,$(`brand-meta`).textContent=e.brandMeta;let t=$(`docs-link`);t.textContent=e.docsLink,t.href=cS===`en`?`./docs.html`:`./docs.html?lang=ru`,$(`btn-fit`).title=e.fitTitle,$(`btn-zoom-out`).title=e.zoomOutTitle,$(`btn-zoom-in`).title=e.zoomInTitle,$(`lbl-import-dxf`).textContent=e.importDxf,$(`lbl-import-dxf-btn`).title=e.importDxfTitle,$(`btn-dxf-2000`).title=e.dxf2000Title,$(`btn-vcad`).title=e.vcadTitle,$(`btn-lang-en`).classList.toggle(`active`,cS===`en`),$(`btn-lang-ru`).classList.toggle(`active`,cS===`ru`),$(`lbl-layers`).textContent=e.layersHeading,$(`btn-show-all-layers`).textContent=e.showAllLayers,$(`lbl-dim-style`).textContent=e.dimStyleHeading,$(`lbl-terminator`).textContent=e.terminatorLabel,OS(`sel-terminator`,e.terminators),$(`lbl-text-pos`).textContent=e.textPosLabel,OS(`sel-text-pos`,e.textPositions),$(`lbl-text-orient`).textContent=e.textOrientLabel,OS(`sel-text-orient`,e.textOrientations),$(`lbl-scale`).textContent=e.scaleLabel,$(`lbl-parametric`).textContent=e.parametricHeading,$(`lbl-w`).textContent=e.widthLabel,$(`lbl-h`).textContent=e.depthLabel,$(`lbl-r`).textContent=e.cornerRadiusLabel,$(`lbl-cut`).textContent=e.cutZLabel;for(let t of document.querySelectorAll(`.unit-mm`))t.textContent=e.mmUnit;ES(e.statusDefault),$(`lbl-three`).textContent=e.threeHeading,$(`lbl-three-hint`).innerHTML=e.threeHintHtml,$(`lbl-doc-size`).textContent=e.docSizeHeading,$(`lbl-size-verbose`).textContent=e.sizeVerboseLabel,$(`lbl-size-compact`).textContent=e.sizeCompactLabel,$(`lbl-size-vcad`).textContent=e.sizeVcadLabel,$(`lbl-json-preview`).textContent=e.jsonPreviewHeading}function AS(e){cS!==e&&(cS=e,lS.lang=e,Ix(e),kS(),xS(!0))}$(`btn-lang-en`).addEventListener(`click`,()=>AS(`en`)),$(`btn-lang-ru`).addEventListener(`click`,()=>AS(`ru`)),kS(),mS(),gS(),yS();