/*Vue.js v2.6.10*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.Vue = factory());
}(this, function () { 'use strict';
  const emptyObject = Object.freeze({}); // 一个空的冻结对象：不可扩展，不可配置，不可写
  const isUndef = v => v === undefined || v === null // 是否为未定义，null也认为是未定义
  const isDef = v => v !== undefined && v !== null // 是否有定义，null认为是未定义
  const isTrue = v => v === true
  const isFalse = v => v === false
  const isPrimitive = v => typeof v==='string'||typeof v==='number'||typeof v==='symbol'||typeof v ==='boolean'
  const isObject = obj => obj !== null && typeof obj === 'object' // 快速对象检查，用于区分对象和原始值
  const _toString = Object.prototype.toString;
  const toRawType = v => _toString.call(v).slice(8, -1) // 比如[object Object]的Object
  const isPlainObject = obj => _toString.call(obj) === '[object Object]' // 严格的纯对象检查
  const isRegExp = v => _toString.call(v) === '[object RegExp]' // 是否是正则对象
  function isValidArrayIndex (val) { // 是否是有效的数组索引，满足：>=0; 整数; 有限数字
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }
  const isPromise = v => isDef(v) && typeof v.then === 'function' && typeof v.catch === 'function'
  const toString = v => v == null ? // 值转字符串，如果值==null则转成''
  '' : Array.isArray(v) || (isPlainObject(v) && v.toString === _toString) ? //如果是对象/数组
      JSON.stringify(v, null, 2) : String(v) //则调用JSON.stringify，否则直接调用String处理
  // JSON.stringify将一个值转换为一个JSON字符串，接收三个参数，待转换的值(通常是数组/对象)；转换函数，如果传了函数则对象的每个属性都经过它的处理，如果传了一个数组，则只有包含在数组里的属性名才会被转化到最终的JSON字符串中，如果传null或没传，则对象的所有属性都会被转化，最后一个参数是缩进格数，美化输出
  function toNumber(v) { // 转数字，转失败就返回原本值
    var n = parseFloat(v);
    return isNaN(n) ? v : n
  }
  // 在函数作用域中定义一个对象map，记录str拆分成数组的每一项，然后定义一个新的函数并返回，内层函数引用makeMap作用域内的变量map，形成了闭包，map对象并不会随着makeMap执行完毕而销毁，会继续留在内存空间。返回的新函数接收一个值，用来检测它是否存在对象map中。这个函数其实功能就一个：检查val是否是指定集合中的一员，因为函数要经常调用，不希望每次调用都创建一个map对象，所以通过闭包实现makeMap执行一次之后，map对象驻留在内存中；而且函数柯里化了，本来要传3个参数，选择参数分两次传入
  function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    str.split(',').forEach(item => {
      map[item] = true
    })
    return expectsLowerCase ?
      val => map[val.toLowerCase()] :
      val => map[val]
  }
  var isBuiltInTag = makeMap('slot,component', true)// 函数检查是否是内置的标签名
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')// 检查给定字符串是否是保留属性
  function remove(arr, item) { // 从数组中移除指定的元素，移除成功则返回被移除的项，否则无返回值
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1) 
      }
    }
  }
  let hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key) //检查对象是否有自有属性key
  // cached函数传入fn，执行返回一个新函数，新函数接收参数str，并通过闭包引用外层函数cached作用域的cache对象，cache里存放的是缓存的值
  // 新函数中，根据传入的str优先获取并返回cache对象中的缓存，如果没有对应的缓存值，则调用fn执行一次，把结果保存到缓存对象中并返回。因此cached(fn)这个函数接收相同的str就不用每次都执行fn
  function cached(fn) {
    var cache = Object.create(null)
    return str => {
      var hit = cache[str]
      return hit || (cache[str] = fn(str))
    }
  }
  // cached并不改变原函数的行为，只是通过缓存来避免重复求值。比如，camelize函数，传入'aaa-bbb'，始终返回'aaaBbb'，一个项目中可能要camelize多次同一个字符串，只需从缓存中读取即可，不用每次都执行函数
  var camelizeRE = /-(\w)/g // 匹配-和-后的一个字符(字母/数字/_)
  // 连字符转驼峰
  var camelize = cached(str => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : ''))
  // replace方法返回一个用替换值替换一些或所有匹配的模式后的新字符串。模式可以是一个字符串或者一个正则表达式，替换值可以是一个字符串或者一个每次匹配都要调用的回调函数。原字符串不会改变。
  /** str.replace(reg, ($0, $1, $2, $3) => { })
      $0: 正则匹配到的字符串
      $1: 在使用组匹配时，组匹配到的值
      $2: 匹配值在原字符串中的索引
      $3: 原字符串 */
  var capitalize = cached(str => str.charAt(0).toUpperCase() + str.slice(1)) // 首字母大写
  // 驼峰转连字符加小写  aaaBBB aaa-bbb
  var hyphenateRE = /\B([A-Z])/g // \b单词边界 \B非单词边界。匹配出非单词边界的大写字母
  var hyphenate = cached(str   => str.replace(hyphenateRE, '-$1').toLowerCase())
  // abcDef的话匹配字符D，替换成'-$1'。$n代表括号匹配到的内容，也就是D，所以变成abc-Def，再转小写abc-def
  function polyfillBind(fn, ctx) {
    function boundFn(a) {
      return arguments.length ?
        arguments.length > 1 ?
        fn.apply(ctx, arguments) :
        fn.call(ctx, a) :
        fn.call(ctx)
    }
    boundFn._length = fn.length;
    return boundFn
  }
  const nativeBind = (fn, ctx) => fn.bind(ctx)
  var bind = Function.prototype.bind ? nativeBind : polyfillBind;
  const toArray = (arrayLike, start = 0) => [...arrayLike].slice(start)// 类数组转为真数组
  function extend(a, b) { // 将对象b的属性扩展到对象a上
    for (var key in b) {
      a[key] = b[key];
    }
    return a
  }
  // 把一个对象数组的所有对象合并成一个对象 [obj1,obj2,obj3,....] => obj
  function toObject (arr) {
    var res = {};
    arr.forEach(item => {
      if (item) {
        extend(res, item)
      }
    })
    return res
  }
  function noop () {}
  var no = () => false;
  var identity = a => a;
  // 检查两个值是否松散相等 :如果他们是纯对象，他们是否有相同的"结构"
  function looseEqual(a, b) {
    if (a === b) return true 
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every((e, i) => looseEqual(e, b[i]))
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime()
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(key => looseEqual(a[key], b[key]))
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }
  function looseIndexOf (arr, val) { //寻找数组中和目标val松散相等的元素的索引
    arr.forEach((item, index) => {
      if (looseEqual(item, val)) return index // looseIndexOf区别于indexOf，后者用的===
    })
    return -1 // 没找到则返回-1
  }
  //如果你想fn只被调用一次，则once(fn)返回的函数就是
  function once (fn) {
    var called = false; // 闭包实现了一个持久性的标识
    return function (...args) {
      if (!called) { // fn执行了一次后，called从此变为真，并且是持久的，fn不能被调用了
        called = true;
        fn.apply(this, args);
      }
    }
  }
  var SSR_ATTR = 'data-server-rendered';
  var ASSET_TYPES = ['component', 'directive', 'filter']
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated', 'errorCaptured', 'serverPrefetch'];

  var config = {
    optionMergeStrategies: Object.create(null), //自定义合并策略的选项
    silent: false, //是否关闭警告，如果设为true，将不会有来自Vue内部的报错
    productionTip: "development" !== 'production', //默认在开发模式下控制台会显示 You are running Vue in development mode。设置false即可关闭该提示
    devtools: "development" !== 'production',//是否启用vue-devtools(Vue调试神器)开发者工具
    performance: false, //是否开启性能追踪
    errorHandler: null,
    warnHandler: null,
    ignoredElements: [],
    keyCodes: Object.create(null),
    isReservedTag: no, //保留标签，如果配置了，则这些标签不能注册为组件
    isReservedAttr: no,
    isUnknownElement: no,
    getTagNamespace: noop,
    parsePlatformTagName: identity,
    mustUseProp: no,
    async: true,
    _lifecycleHooks: LIFECYCLE_HOOKS
  };

  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
  function isReservedKeyword(str) { // 判断传入的字符串是否以$或_开头，即是否是保留关键字
    var c = (str + '').charCodeAt(0)
    return c === 0x24 || c === 0x5F
  }
  function def (obj, key, val, enumerable) { // 一般用来定义不可枚举属性
    Object.defineProperty(obj, key, { //def是对Object.defineProperty的封装
      value: val, //定义一个
      enumerable: !!enumerable, // 是否可枚举def的传参
      writable: true,//可写
      configurable: true //可配置
    });
  }
  var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));

  function parsePath(path) {
    // 如果正则匹配成功，说明path字符串解析失败，它在JS中不是一个合法的访问对象属性的语法，直接返回
    if (bailRE.test(path)) return;
    var segments = path.split('.');// 按.分割path字符串 产生的数组赋给segments
    // 返回一个新的函数，函数执行会遍历数组segments，逐个读值，直到读取path指定的属性值。注意，parsePath执行返回的这个函数会作为this.getter的值，只有当this.getter执行时，这个新函数才会执行。
    return obj => {
      segments.forEach(item => {
        if (!obj) return
        obj = obj[item]
      })
      return obj
    }
  }

  // 浏览器环境嗅探
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isFF = UA && UA.match(/firefox\/(\d+)/);

  var supportsPassive = false;
  if (inBrowser) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get() { supportsPassive = true; }
      }));
      window.addEventListener('test-passive', null, opts);
      //EventTarget.addEventListener将指定的监听器注册到EventTarget上，当该对象触发指定的事件时，指定的回调函数就会被执行。事件目标可以是一个文档上的元素Element,Document和Window或者任何其他支持事件的对象(比如XMLHttpRequest)
      // target.addEventListener(type, listener[, options]);type表示监听事件类型的字符串。listener是当事件触发时，会接收到一个事件通知（实现了Event接口的对象）对象。listener必须是一个实现了EventListener接口的对象，或者是一个函数。
      // options 一个指定有关 listener 属性的可选参数对象。可用的选项如下：
      // capture:  Boolean，表示 listener 会在该类型的事件捕获阶段传播到该 EventTarget 时触发。
      // once:  Boolean，表示 listener 在添加之后最多只调用一次。如果是 true， listener 会在其被调用之后自动移除。
      // passive: Boolean，设置为true时，表示 listener 永远不会调用 preventDefault()。如果listener仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告。
    } catch (e) {}
  }

  var _isServer; // 环境是不会改变的，只用求值一次
  var isServerRendering = function () {
    if (_isServer === undefined) { // 如果发现_isServer有定义，就不会重新计算，提供性能
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        // 如果不再浏览器中也不在weex中，同时global有定义，则可能是服务端渲染
        _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
        // global['process'].env.VUE_ENV是vue-server-renderer注入的。如果成立说明是服务端渲染
      } else {
        _isServer = false;
      }
    }
    return _isServer // 使用的是全局变量_isServer保存最终的值
  };

  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
  const isNative = F => typeof F === 'function' && /native code/.test(F.toString())
  var hasSymbol = typeof Symbol !== 'undefined' && isNative(Symbol) && typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);
  var warn = noop;
  var tip = noop;
  var generateComponentTrace = (noop); // work around flow check
  var formatComponentName = (noop);
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  const classify = str => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '')
  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';
    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(("[Vue warn]: " + msg + trace));
    }
  };
  tip = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg}` + vm ? generateComponentTrace(vm) : '')  
    }
  };
  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) return '<Root>'
    var options = typeof vm === 'function' && vm.cid != null ?
      vm.options :
      vm._isVue ?
      vm.$options || vm.constructor.options :
      vm;
    var name = options.name || options._componentTag;
    var file = options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }
    return (
      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
      (file && includeFile !== false ? (" at " + file) : '')
    )
  };
  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) {
        res += str;
      }
      if (n > 1) {
        str += str;
      }
      n >>= 1;
    }
    return res
  };
  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map(function (vm, i) {
          return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm) ?
            ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)") :
            formatComponentName(vm)));
        })
        .join('\n')
    } else {
      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
    }
  };
  var uid = 0;
  // Dep实例用来管理watcher实例
  class Dep {
    constructor() {
      this.id = uid++ // 每个dep实例都有唯一的id
      this.subs = [] // dep实例的subs是专门存放watcher实例的数组
    }
    addSub(sub) { // 将watcher推入到subs数组中
      this.subs.push(sub)
    }
    removeSub(sub) { // 从subs数组中移除传入的watcher
      remove(this.subs, sub)
    }
    depend() {
      if (Dep.target) { // 定义响应式属性的get函数时，已经判断过是否有Dep.target，然后才调用depend方法，在depend方法中又判断一次，这不是多此一举，因为该depend方法除了在key的get方法中用到，还在计算属性的watcher中用到。
        Dep.target.addDep(this) // depend方法并没有直接收集依赖，而是调用watcher的addDep方法，传入当前dep实例，交由addDep方法中调用dep的addSub方法。因为要对传入的dep做一些判断，避免重复的收集依赖。
      }
    }
    //模版中使用数据属性name，模版被编译成渲染函数，执行$mount进行挂载时，会调用mountComponent，会创建渲染函数的watcher，对渲染函数求值，求值的过程会读取name属性，触发name的get，这个watcher被收集到name的dep中，当后面修改name的属性值时，name的set被触发，set中调用dep.notify方法。
    notify() { // 通知watcher重新求值
      const subs = this.subs.slice() //先拷贝一份subs数组
      if (!config.async) {
        subs.sort((a, b) => a.id - b.id)
      }
      subs.forEach(sub => { // 遍历当前dep的subs数组中所有的watcher，逐个调用它的update方法
        sub.update() //触发依赖其实就是对被观察的目标的重新求值，重新求值发生在update()
      })
    }
  }
  // Dep.target是当前正在求值的watcher实例，是全局唯一的，当某个watcher调用它的get方法对被观察目标求值时，会将自己赋给Dep.target，并将自己压入targetStack，等到这个watcher求值完毕后，会从targetStack栈中取出之前的Dep.target，重新作为当前的Dep.targe
  Dep.target = null;
  var targetStack = []; // 用来存放watcher的栈
  function pushTarget(target) {
    targetStack.push(target) // 将传入的target推入targetStack数组
    Dep.target = target; // 将传入的target赋给Dep.target
  }
  function popTarget() { // 恢复之前的Dep.target，这就是targetStack栈的作用
    targetStack.pop(); // targetStack栈弹出一个watcher
    Dep.target = targetStack[targetStack.length - 1] //Dep.target继续指向targetStack的栈顶
  }

  // 虚拟DOM是解决频繁操作DOM而引发性能问题的产物，它将页面的状态抽象为JS对象，本质上是JS和真实DOM的中间层，当我们想用JS大批量进行DOM操作时，会优先对vnode这个JS对象进行操作，最后通过比对要改动的部分，通知并更新真实DOM，虽然最后还是操作了真实DOM，但将多次改动合并为一次操作，减少了DOM的重排次数，缩短了生成渲染树和绘制的时间
  // 浏览器将真实DOM设计得很复杂，不仅包含自身属性的描述，大小位置等定义，也包括DOM所有的浏览器事件等，如此复杂的结构，我们频繁去操作DOM会带来浏览器的性能问题，vnode作为数据和真实DOM之间的一层缓存，只是用来映射到真实DOM的渲染，因此不需要包含操作DOM的方法
  // VNode实例是一个包含所有渲染所需信息的载体，比如标签名、数据、子节点等信息，并没有保留跟浏览器相关的DOM API。组件初始化之后得到的VNode是一个抽象的信息化的对应于DOM树的JS对象，已经比真实DOM对象描述的内容要简单很多，vnode还有其他的属性来扩展灵活性。
  class VNode {
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
      this.tag = tag; // 节点的标签名
      this.data = data; // 节点对应的数据信息，如props,attrs,key,class,directives等
      this.children = children; // 节点的子vnode列表(数组)
      this.text = text; // 节点对应的文本
      this.elm = elm; // 节点对应的真实DOM节点
      this.ns = undefined; // 当前节点的名字空间
      this.context = context; // 当前节点的编译作用域
      this.fnContext = undefined; // 函数化组件作用域
      this.fnOptions = undefined; // 
      this.fnScopeId = undefined; // 
      this.key = data && data.key; // 节点的唯一标志，diff时候有用
      this.componentOptions = componentOptions; // 当前vnode节点对应的组件配置对象
      this.componentInstance = undefined; // 当前vnode对应的组件实例
      this.parent = undefined; // 当前节点的父节点，即组件占位符节点
      this.raw = false; //是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false
      this.isStatic = false; // 是否为静态节点
      this.isRootInsert = true; // 是否作为根节点插入
      this.isComment = false; // 是否为注释节点
      this.isCloned = false; // 是否为克隆节点
      this.isOnce = false; // 是否有v-once指令，即一次性节点
      this.asyncFactory = asyncFactory; // 
      this.asyncMeta = undefined; // 
      this.isAsyncPlaceholder = false; // 
    }
    get child() { // 已弃用
      return this.componentInstance
    }
  }
  // 创建一个空的注释vnode节点
  const createEmptyVNode = (text = '') => { 
    const node = new VNode()
    node.text = text
    node.isComment = true 
    return node
  }
  // 创建一个文本vnode节点
  let createTextVNode = val => new VNode(undefined, undefined, undefined, String(val))

  // 克隆节点是将现有节点的属性复制到新节点中，作用是优化静态节点和插槽节点
  // 以静态节点为例，它的内容不会改变，所以除了首次渲染需要执行渲染函数获取vnode外，后续更新不需要执行渲染函数重新生成静态vnode节点，因此使用克隆节点方法将vnode克隆一份，使用克隆节点进行渲染，就不用重新执行渲染函数生成新的静态节点的vnode
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      vnode.children && vnode.children.slice(),//克隆子数组，避免对原始数组进行变异
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned
  }

  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto); //创建一个空对象，原型指向Array原型
  const mutationMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

  // 一个响应式的被观测的数组，我们希望在调用数组变异方法改变数组时，能触发数组的dep收集的依赖，通过依赖执行更新。
  mutationMethods.forEach(function (method) {//遍历这7个数组变异方法的函数名，重新定义函数
    var original = arrayProto[method]; // 缓存数组原本的变异方法
    def(arrayMethods, method, function mutator(...args) { //在arrayMethods对象上定义新的同名方法，在原有功能的基础上，加入触发依赖的功能
      const result = original.apply(this, args) // 原本的方法的执行，保留它原有功能
      var ob = this.__ob__ // 数组变异方法中想要触发数组的依赖，必须引用存放依赖的dep，被观测的数组有__ob__属性，值为Observer实例，实例上有dep。数组调用变异方法时，方法中的this指向数组本身，this.__ob__.dep存放着该数组的依赖
      var inserted // 对于被观测的数组，我们会递归地观测数组的每一个元素。有的数组变异方法会往数组里增加元素，新加入的元素也需要被观测
      switch (method) {
        case 'push':
        case 'unshift': inserted = args; break
        case 'splice': inserted = args.slice(2); break
      }
      if (inserted) {// inserted是新增元素组成的数组，observeArray的调用就是observe数组每一项
        ob.observeArray(inserted);//observeArray是Observer的原型方法，ob这个Observer实例可以引用到这个方法
      }
      ob.dep.notify() // ob.dep即this.__ob__.dep，即被观测的数组的dep实例，触发它里面的依赖
      return result // 正常返回数组原本方法执行的返回值
    });
  });

  var shouldObserve = true;
  let toggleObserving = (value) => { shouldObserve = value }

  // Observer构造函数的实例化完成对value的观测(响应式化)，创建被观测的value的Observer实例，value的__ob__属性指向Observer实例，Observer实例的value属性指向被观测的value，实现了互相引用，映射的关系
  class Observer {
    constructor(value) { // 接收的value已经是数组/对象
      this.value = value; // Observer实例的value属性记录被观测的value
      this.dep = new Dep(); // Observer实例维护一个Dep实例，它保存所有依赖于value的watcher实例
      this.vmCount = 0; // 实例计数器，初始化为0
      def(value, '__ob__', this) // 给被观测的value添加一个不可枚举属性__ob__，值为当前的Observer实例。于是value.__ob__就引用到观测它的Observer实例，value.__ob__.dep就引用到属于value的Dep实例
      if (Array.isArray(value)) { // 如果观测的value是数组
        if ('__proto__' in {}) { // 如果当前环境 __proto__ 属性可用
          value.__proto__ = arrayMethods // 通过修改value的__proto__属性值，value的原型对象指向了arrayMethods，不再指向Array.prototype，因此value调用7个变异方法时，会实际调用改动的数组方法，而不是原本的数组原型方法
        } else { // 如果__proto__不可用，将改造后的数组变异方法直接挂载到被观测的数组value上
          mutationMethods.forEach(methodName => {//成为value的自身方法后，就比原型上的方法优先
            def(value, methodName, arrayMethods[methodName])
          })
        }
        this.observeArray(value) //这是递归观测数组每一个元素，因为如果数组value嵌套了数组/对象，元素项调用数组变异方法或修改属性值->数组元素改变->value本身改变，但因为不是value调用的数组变异方法而无法触发value的依赖。因此，将每一个数组元素响应式化，让它们具备触发数组本身的依赖的能力
      } else { // 如果被观测的value是对象，调用walk将每一个属性转成响应式属性
        this.walk(value)
      }
    }
    walk(obj) { 
      var keys = Object.keys(obj)
      keys.forEach(key => {// 遍历value对象的自身属性，调用defineReactive
        defineReactive$$1(obj, key) // 将对象的每一个属性转为响应式属性，当该属性值发生变化时，可以告知所有依赖该属性的watcher
        // 没传val，说明有意暂时先不获取属性值，而在函数内部获取val
        // 没传shallow，说明默认是深度观测
      })
    }
    observeArray(arr) { // 观测数组的每一项，不确定是对象/数组/其他，所以调用observe
      arr.forEach(item => { observe(item) })
    }
  }
  
  // observe函数为观测的value创建Observer实例，如果观测成功则返回新建的Observer实例/已存在的Observer实例，如果观测失败(value不需观测)则返回undefined
  function observe(value, asRootData) { // asRootData: value是否为根data
    if (!isObject(value) || value instanceof VNode) return;
    // 不是对象，不用观测，VNode实例不用观测，直接返回
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__ //条件成立代表value被观测过了，因为被观测的值传入new Observer执行后会被添加__ob__属性，属性值为Observer实例。对于被观测过的value，直接将value.__ob__，即Observer实例，赋给ob并最后返回，这是为了避免重复观测，重复创建Observer实例
    } else if ( // 没有被观测过
      shouldObserve && // “需要观测”的开关开启了
      !isServerRendering() &&  // 不是服务端渲染，服务端渲染时不观测数据
      (Array.isArray(value) || isPlainObject(value)) && // 数组或纯对象，才有必要观测
      Object.isExtensible(value) && // value是可扩展的（可以添加新属性）
      !value._isVue // 不是Vue实例，Vue实例不用观测
    ) {//没被观测过且可观测的value，为它创建Observer实例，并赋给ob
      ob = new Observer(value)
    }
    if (asRootData && ob) { //如果asRootData为真且ob值存在，ob.vmCount自增
      ob.vmCount++ // Observer实例上的vmCount>0说明是它是根data的Observer实例
    }
    return ob // Observer实例或undefined
  }

  // 观测一个纯对象，将对象的属性转为响应式属性，为属性的属性描述符添加get和set方法，当获取该响应式属性的值时，get函数被触发，进行依赖收集，当设置该响应式属性的值时，set方法被触发，通知依赖该属性的值变化了
  function defineReactive$$1(obj, key, val, customSetter, shallow) {
    var dep = new Dep();
    // 函数内部定义一个dep变量，指向一个Dep实例。函数执行结束，函数的执行上下文已经被销毁了，即从执行上下文栈中被弹出了，定义在函数内部的key的get/set函数里引用了变量dep，即使外部函数的执行上下文被销毁，但JS仍然会让dep存留在内存中，即dep不会随着函数执行结束而销毁，每次调用get/set方法都能访问这个dep。被观测对象的每个响应式key，都唯一地对应一个dep实例
    var property = Object.getOwnPropertyDescriptor(obj, key) //获取obj的自有属性key的属性描述符
    if (property && property.configurable === false) return
    // 如果key的属性描述符存在且configurable为false，说明它的属性描述符不能重新定义，并且该key不能从对象中删除，说明使用Object.defineProperty去定义key的属性描述符是无效的，直接返回

    // key可能本身就有自己的get/set，我们先缓存一份给getter/setter，因为接下来会重新定义key的get/set，在重新定义的get/set函数中，调用缓存的getter/setter，就能不改变key的原本的读写操作
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) { val = obj[key] }
    // 求出val的目的是继续观测val。(!getter||setter)的相反情况是：key有getter没setter，是只读属性，val不会改变，没有深度观测val的必要，因此val为undefined
    // 上面的if条件满足，val才会拿到值，不满足则val是undefined，observe(val)会直接返回，观测val无效
    var childOb = !shallow && observe(val); // shallow为真代表不深度观测
    // 调用observe继续观测key的val，返回值赋给childOb，如果val是数组/对象，返回val.__ob__，Observer实例，如果val是别的类型，observe(val)直接返回，childOb是undefined
    // 注意到，在key的get/set方法中，也引用着外层函数作用域中定义的childOb，产生了闭包，childOb随着函数执行完毕依然存留在内存中，相当于val拥有一个属于自己的childOb
    Object.defineProperty(obj, key, { // 直接在对象中定义或修改属性
      enumerable: true,
      configurable: true,
      get() {
        var value = getter ? getter.call(obj) : val //如果key本来就有get方法，直接执行它，返回值赋给value，这保证了key原来的读取操作正常，如果没有get方法，val赋给value，val可能是传入的val也可能是obj[key]
        if (Dep.target) { // 如果存在当前正在计算的watcher(依赖)
          dep.depend(); // 调用当前key的dep实例的depend方法，收集这个Dep.target
          if (childOb) { // 如果childOb存在，即observe(val)返回的是Observer实例，说明key的val是对象/数组，也被观测了
            // childOb === val.__ob__; childOb.dep === val.__ob__.dep
            childOb.dep.depend(); // 调用val的Observer实例的dep的depend方法，不只是key的dep收集了当前依赖，为什么key的val.__ob__.dep也要收集依赖呢？即同一个依赖分别收集到两个不同的dep
            // 我们知道修改key的val能触发key的依赖，如果val是对象/数组，也会被观测，修改val对象的属性或val数组元素调用数组变异方法，也能触发key的依赖，但给对象添加属性/数组添加元素，Object.defineProperty是检测不到这种val的变化，它只能拦截属性值的读取和修改，无法拦截给对象添加/删除属性的操作，我们希望这种改变val的方式也能触发key的依赖，于是有了Vue.set/$set方法，大致实现如下：
            /* Vue.set = function (target, key, val) {
                defineReactive(target, key, val)
                target.__ob__.dep.notify()
              } */ 
            // 响应式属性key的val是对象/数组的话，val会被递归观测，因此给val添加的属性也要被观测，调用defineReactive去定义响应式的新属性。同时，我们希望Vue.set执行能触发key的dep中存放的依赖，但在Vue.set中引用不到到key的dep，因为传入函数的target已经是key的val了。没事，val它有__ob__属性，能引用到val.__ob__.dep实例，我们让它收集和key的dep所收集的一样的依赖，于是Vue.set执行时，target.__ob__.dep.notify()，触发的是和key的dep存的相同的依赖。
            if (Array.isArray(value)) { // 当val是数组时，不止key的dep收集依赖，val.__ob__.dep收集依赖，还要让每个数组元素收集依赖
              dependArray(value) // 逐个调用元素的__ob__.dep的depend方法，收集依赖
            }
            // 比如data中有属性arr，值为数组，第一项是一个对象，首先data.arr肯定被观测了，所以存在data.arr.__ob__，data.arr[0]也被观测了，存在data.arr[0].__ob__。现在模版里使用了arr，渲染函数执行将触发arr属性的get，data.arr的dep和data.arr.__ob__.dep都存了该依赖，但data.arr[0].__ob__.dep并没有收集有依赖。如果给arr[0]增加响应式属性，即this.$set(this.data.arr[0],'b',2)执行，是无法触发依赖的，但数组元素的变化也是数组本身的变化。为了让这种情况下也能触发响应，就必须让data.arr[0].__ob__.dep也收集同一份依赖，这就是dependArray的作用。
            // 通过索引修改数组元素值是不能触发响应的，Vue通过拦截数组的变异方法，加入触发依赖的操作(依赖存在数组的__ob__的dep)，从而使通过调用变异方法改变数组能触发依赖。假如元素正好是对象，你直接通过arr[index]去修改对象，虽然arr[index]是响应式数据，但也是无法触发arr的依赖，只有通过$set给该元素对象添加/修改属性，利用data.arr[index].__ob__.dep.notify的调用。所以该dep要存一份和arr的dep存的一样的依赖。所以响应式key的val是数组时，不仅数组本身的dep要收集依赖，它的子元素也要递归收集依赖，这样的话，通过$set改变数组的元素就能触发arr的依赖。
          }
        }
        return value // 正常返回属性值，这是get方法原本的功能
      },
      set(newVal) {
        var value = getter ? getter.call(obj) : val//如果key本来就有get方法，直接执行返回值赋给value，如果没有get方法，val赋给value，val可能是传入的val也可能是obj[key]
        // 新值和旧值做比较，如果新值和旧值相同，就没有触发依赖和重新设置属性值的必要，直接返回
        if (newVal === value || (newVal !== newVal && value !== value)) return// NaN !== NaN
        if (customSetter) customSetter()
        if (getter && !setter) return //key本来就有get没set，说明属性值不可改，没有触发更新的必要
        if (setter) { // 如果key原本就有setter，调用setter来设置函数的值，保证属性原有的赋值操作不变
          setter.call(obj, newVal)
        } else { // key原本就没有set方法，直接将新值赋给val
          val = newVal;
        }
        childOb = !shallow && observe(newVal); // 设置的新val可能也要观测，返回的值覆盖给childOb
        dep.notify(); // 把key的dep里的依赖触发
      }
    });
  }

  // 给响应式的嵌套对象添加一个响应式属性，并且会触发响应式对象的依赖。受Object.defineProperty的局限，Vue无法探测对象属性的添加或删除，你往val添加了属性，却无法触发key的依赖
  function set (target, key, val) { // target是已响应化的嵌套对象 key是响应式属性 val是属性值
    if (isUndef(target) || isPrimitive(target)) warn("不能给基本类型设置响应式属性(string,number,bigint,boolean,null,undefined,symbol)")
    // 如果target是数组，set函数可以替换/新增元素，并触发数组的依赖
    if (Array.isArray(target) && isValidArrayIndex(key)) { // 索引要是有效索引
      target.length = Math.max(target.length, key) //数组的length根据key值调整，因为假如设置的元素的索引大于数组长度，无论设置多大，splice(key,1,val)都只是将val追加到数组末尾
      target.splice(key, 1, val); // 将指定索引(key)的元素替换为val
      // 因为splice是数组变异方法，target调用splice会调用ob.observeArray对新加入的元素进行观测，并会调用ob.dep.notify，触发数组的依赖。所以不用额外加入触发依赖的操作。
      return val
    }
    if (key in target && !(key in Object.prototype)) {//如果target是对象，key在target对象中或target的原型链中已有定义(但不能在Object原型上)，直接修改属性值即可
      target[key] = val; //因为target是被观测的，直接修改它的属性值可以触发依赖
      return val
    }
    var ob = (target).__ob__; // 定义ob，指向target.__ob__
    if (target._isVue || (ob && ob.vmCount)) { // ob存在且ob.vmCount>0，说明target是根data
      warn('不能给Vue实例添加属性，避免属性的覆盖。也不能用$set给根级别data添加响应式属性，你应该在初始化前就定义好所有根级别的响应式属性，哪怕赋给它一个空值，因为Vue会在实例初始化时对属性做getter/setter转化')
      return val
      // 为什么不准动态添加根级别的响应式属性，因为这样并不能触发依赖。我们观测根data，是把data的key转成响应式属性，根data的确有__ob__，值为Observer实例，但data本身不是响应式的(没有自己的get/set)，data被依赖时，读取data并不会做依赖收集。所以当Vue.set(data,'xxx',1)时，此函数内部调用了data.__ob__.dep.notify()，但这个dep里并没有依赖可触发。
    }
    if (!ob) { // target.__ob__不存在，说明target没有被观测，直接设置属性值，不用触发依赖
      target[key] = val;
      return val
    }
    defineReactive$$1(ob.value, key, val) // ob存在，说明target被观测过，给target添加响应式属性key和对应的val
    ob.dep.notify() // 触发存在target.__ob__.dep中的依赖
    return val
  }
  /**Vue.set给数组val设置响应式属性：使用splice方法替换/新增元素，能触发val对应的key的依赖。给已经存在于目标对象的或原型链上的key，直接改动其属性值，因为key原本就是响应式属性的话，改变它的属性值也会触发响应，不是响应式属性，那也直接改变它属性值就好。核心是最后两句：调用defineReactive给响应式对象定义新的响应式属性，改变了key的val，所以要触发target.__ob__.dep收集的依赖(和target对应的key的dep存的依赖相同)，key的依赖被触发*/
  
  // 当一个数据属性被依赖了，它的val是对象，你从val中删除一个属性时，这意味着val改变了，你期待key的依赖被触发，但受限于Object.defineProperty，Vue不能检测到属性被删除这个操作。Vue靠的是Vue.delete实现在删除属性时也能触发依赖。
  function del(target, key) {
    if (isUndef(target) || isPrimitive(target)) {
      warn("target是undefined、null等基本类型值，它们没有属性给你删除呀")
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1) // target是数组，肯定是响应式的，它调用数组变异方法splice时，会调用ob.dep.notify，触发数组的依赖，所以不用特别的加入依赖触发的操作
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      warn('不能删除Vue实例上的属性，这是处于安全因素考虑；也不能删除根data中的属性，是因为这触发不了响应，前面已经分析过了：data不是响应式的属性，data被读取时不会触发get函数收集依赖，所以data.__ob__.dep没有收集到依赖，比如你Vue.set(data, "aaa", 1)，data.__ob__.dep里就没有依赖给你触发。所以你把属性值设为null就好')
      return
    }
    if (!hasOwn(target, key)) return // 如果你要删除的属性不在目标对象上，直接返回
    delete target[key]; // 删除属性
    if (!ob) return // target没有被观测过，删除属性后不用触发依赖
    ob.dep.notify(); // 触发target的Observer实例的dep存放的依赖
  }

  function dependArray (v) { // 让数组的每一项的__ob__的dep收集依赖
    v.forEach(e => { // 遍历数组，如果当前元素e存在，且e是被观测的对象/数组
      e && e.__ob__ && e.__ob__.dep.depend() //让e.__ob__.dep收集当前依赖
      if (Array.isArray(e)) //有可能数组元素e依然是数组，递归调用dependArray
        dependArray(e) //嵌套数组的每个元素(数组/对象)也收集当前依赖
    })
  }

  var strats = config.optionMergeStrategies;

  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(`option "${key}" can only be used during instance ` +
      'creation with the `new` keyword.')
    }
    return defaultStrat(parent, child)
  };

  // 循环合并两个data数据对象
  function mergeData(to, from) {
    if (!from) return to // 没有from直接返回to
    var key, toVal, fromVal;
    var keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from);
    // Object.keys()返回属性key组成的数组，但不包括不可枚举的属性。Reflect.ownKeys()返回所有属性key,相当于 Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target)
    // 遍历from的key
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      if (key === '__ob__') continue //如果遍历到的key是不可枚举的__ob__，跳过本次循环
      toVal = to[key]; // to中key对应的val
      fromVal = from[key]; // from中key对应的val
      if (!hasOwn(to, key)) { // 如果to对象没有自有属性key
        set(to, key, fromVal); // 给to对象新增一个响应式的key，值为from中的val
      } else if ( // 如果to对象已经有了自身属性key，在下面情况下，才会递归调用mergeData
        toVal !== fromVal && // to from中key对应的val不相等，且他们都是对象
        isPlainObject(toVal) &&
        isPlainObject(fromVal)
      ) {
        mergeData(toVal, fromVal);
      }
    }
    return to // mergeData执行返回的才是真正的数据对象
  }

  // 我们知道无论是子组件选项还是非子组件选项，strats.data策略函数都是通过调用mergeDataOrFn处理，为什么在合并阶段，strats.data执行返回一个函数，并没有做真正的合并，而是在后面初始化阶段才调用mergeData函数进行合并处理，这么做的原因是，inject和props选项的初始化是先于data选项的，这就保证了我们能使用props初始化data中的数据。比如父组件向子组件传prop，prop数据能用在子组件的data选项里，这是因为1、props的初始化比data的初始化早，2.data选项是初始化阶段才求值的，即在初始化时才使用mergeData进行数据合并
  function mergeDataOrFn (parentVal, childVal, vm) {
    if (!vm) { // 如果没传vm，说明处理的是子组件选项，合并操作是在Vue.extend中进行的，即在处理子组件的选项，而且此时childVal和parentVal都应该是函数。那么这里真的能保证childVal和parentVal都是函数吗？其实是可以的，我们后面会讲到。
      if (!childVal) return parentVal
      if (!parentVal) return childVal
      // 如果没有childVal，也就是说子组件的选项中没有data选项，直接返回parentVal，比如下面：
      // Vue.extend({})
      // 使用Vue.extend创建子类时，传递的子组件选项是一个空对象，即没有data选项，那么此时parentVal实际是Vue.options，由于Vue.options上也没有data这个属性，所以压根不会执行strats.data策略函数，更不会执行mergeDataOrFn。既然都没有执行，那么return parentVal是不是多余？不多余，因为parentVal存在有值的情况。什么时候出现childVal不存在但是parentVal存在的情况？
      // const Parent = Vue.extend({
      //   data: function () {
      //     return {
      //       test: 1
      //     }
      //   }
      // })
      // const Child = Parent.extend({})
      // 上面代码Parent类继承了Vue，而Child又继承了Parent，我们使用Parent.extend创建Child子类时，对Child类来讲，childVal不存在，因为我们没有传递data选项，但是parentVal存在，即Parent.options下的data选项，Parent.options是哪里来的呢？实际是Vue.extend函数内使用mergeOptions生成的，所以此时parentVal必定是个函数，因为strats.data策略函数在处理data选项后返回的始终是一个函数
      // 如果没有子选项则使用父选项，没有父选项就直接使用子选项，且这两个选项都能保证是函数，如果父子选项同时存在，则继续执行下面的代码：
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
          // childVal要么是子组件的选项，要么是使用new创建实例时的选项，总之childVal要么是函数，要么是纯对象。如果是函数，就执行该函数从而获取到一个纯对象，所以上面代码判断childVal和parentVal是否是函数就是为了获取数据对象。所以mergedDataFn和mergedInstanceDataFn函数内部调用mergeData方法时传递的两个参数就是两个纯对象
        )
      }
      // 当父子选项同时存在，返回一个函数，函数里面返回了mergeData函数的执行结果
      // data策略函数在处理子组件的data选项时，调用mergeDataOrFn函数在处理子组件选项时返回的总是一个函数，这也间接导致strats.data策略函数在处理子组件选项时返回的也总是一个函数。
    } else { // 处理非子组件选项的情况，即使用new创建实例时，策略函数是mergedInstanceDataFn函数，再次说明了一个问题：mergeDataOrFn函数永远返回一个函数
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
        var defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;
        return instanceData ? mergeData(instanceData, defaultData) : defaultData
      }
    }
  }

  // 在strats策略对象上添加data的策略函数，用来合并处理data选项，为什么最终data被合并处理成一个函数，是因为通过函数返回数据对象，保证了每个组件实例都有一个唯一的数据副本，避免了组件间数据相互影响，在初始化数据状态时，是通过执行data函数来获取数据对象，并对其进行处理的
  strats.data = function (parentVal, childVal, vm) { // childVal 是子组件的data选项
    if (!vm) { // 当没传vm时，说明处理的是子组件选项
      // 首先判断是否传递了子组件的data选项(即childVal)，并且检测childVal是不是函数，如果不是函数会给警告，子组件中的data必须是一个返回对象的函数。直接返回parentVal
      if (childVal && typeof childVal !== 'function') {
        warn('组件里的"data"选项必须是一个返回单例对象的函数', vm);
        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)// 如果childVal是函数，返回mergeDataOrFn的执行结果
    }
    // 如果传了vm，说明处理的选项不是子组件的选项，而是正常使用new创建实例时的选项，这时返回mergeDataOrFn的执行结果，会多传一个vm
    return mergeDataOrFn(parentVal, childVal, vm)
  };
  // 简单总结：data选项最终被mergeOptions函数处理成了一个函数，当合并处理的是子组件的选项时data函数可能是以下三者之一：
  // 1、就是data本身，因为子组件的data选项本身就是一个函数，没有父组件的data选项就直接用子组件的data选项
  // 2、父类的data选项，如果没有子选项则使用父选项data，也是函数
  // 3、mergedDataFn函数，父子组件都有data选项
  
  // 当合并处理的是非子组件的选项时，data函数为mergedInstanceDataFn函数


  // 我们要明确一点：用户定义的生命周期函数选项是在new Vue()时通过参数传入给Vue内部，也就是Vue的构造函数能通过options参数拿到用户设置的钩子
  // 用户配置的options和Vue本来的options会合并生成新的options，赋给vm.$options，Vue内部是通过vm.$options获取用户设置的钩子的，比如vm.$options.created就拿到用户定义的created钩子
  // strats[hook]就是这个函数，作用是合并生命周期钩子选项，在mergeOptions合并options时调用
  function mergeHook(parentVal, childVal) {
    // 如果有childVal，即组件的选项中有对应名字的生命周期函数
    // 如果有childVal，则判断是否有parentVal，有，则将二者合并为一个数组
    // 如果没有parentVal，判断childVal是否是数组，如果是数组，直接返回childVal
    // 如果childVal不是数组，包装成数组，返回
    // 如果没有childVal，直接返回parentVal
    var res = childVal ?
      parentVal ?
      parentVal.concat(childVal) :
      Array.isArray(childVal) ?
      childVal : [childVal] :
      parentVal;
    // 经过处理后，组件选项的生命周期函数被合并成一个数组，中间会判断是否有childVal，即组件选项是否写了生命函数选项，如果没有直接返回parentVal，问题来了，parentVal一定是数组吗？它一定是，如果有parentVal，那么它一定是数组
    return res ? dedupeHooks(res) : res
  }
  // new Vue({
  //   created() {
  //     console.log('created')
  //   }
  // })
  // 举这个例子，对strats['created']策略函数来说（即mergeHook），它接收的childVal就是例子中的created选项，是一个函数，parentVal是什么，是Vue.options.created，但它在这里是不存在的，所以经过strats['created']函数执行后，返回一个数组 Vue.$options.create = [ function () {console.log('created')} ]
  // 如果是这样呢：
  // const Parent = Vue. extend({
  //   created() {
  //     console.log('parentVal')
  //   }
  // })
  // const Child = new Parent({ // Child是new Parent而来的
  //   created() {  // 对于Child来说，childVal是这个created函数
  //     console.log('childVal')
  //   }
  // })
  // 对Child来说，parentVal是谁。已经不是Vue.$options.created了，而是Parent.$options.created，那Parent.$options.created是什么，它是通过Vue.extend函数内部的mergeOptions处理过的，是这样：Parent.$options.created = [function () {console.log('parentVal')}]
  // 所以对于Child来说，既有parentVal又有childVal，经过mergeHook之后，parentVal和childVal合并成一个数组： [ function () {console.log('created')}, function () {console.log('parentVal')} ]
  // 注意到 Array.isArray(childVal) ? childVal : [childVal]，这说明什么，说明生命周期函数选项是可以写成数组的，Vue文档里没有写，但你可以这么写，然后里面钩子按顺序执行

  // 再举个例子：我们使用Vue.mixin里传入的钩子和实例化Vue时传入的钩子一样，即设置了同一个钩子选项，那么在触发钩子时，是要触发这两个函数的，所以我们用数组去存放可能存在的多个同名钩子，那么我们就可以猜测callHook函数其实就是获取这个数组，然后遍历数组执行每个钩子。

  function dedupeHooks (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  // strats是config.optionMergeStrategies的引用，是config上的策略对象，给它添加名为各个生命周期函数的属性，值都为mergeHook函数，这个函数是合并各个生命周期函数的策略函数
  LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook
  })

  // 配置项components/directives/filters的合并策略，策略函数都是mergeAssets
  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = function mergeAssets(parentVal, childVal, vm, key) {
      var res = Object.create(parentVal || null) // 以parentVal为原型对象创建空对象res
      // 然后判断是否有`childVal`，如果有的话使用`extend` 函数将`childVal` 上的属性混合到`res` 对象上并返回。如果没有`childVal` 则直接返回`res`。
      if (childVal) { // 如果childValoptions中有这个选项，先判断它是不是纯对象，如果不是就报警
        assertObjectType(key, childVal, vm);
        return extend(res, childVal) //把它们拷贝到ret对象上，此时即使parentVAL存在，也是放在res的原型上
      } else { // 如果没有childVal，则直接返回res对象
        return res
      }
    }
  })
  /*在任何组件的模板中都可以直接使用<transition/>组件或<keep- alive/>组件，并不需要在组件实例的components选项中显式地注册，为什么可以这样，答案就在mergeAssets函数中
    var v = new Vue({
      el: '#app',
      components: {
        ChildComponent
      }
    })
    实例化Vue时调用_init，这个根Vue实例不是组件，调用mergeOptions方法，参数parent和child分别接收Vue.options和当前options，在mergeOptions函数中，会对parent和child的每个属性执行mergeField，执行options[key] = strat(parent[key], child[key], vm, key)，strat在这里是函数mergeAssets，合并策略函数，将合并好的值赋给options[key]，在这里key是components，child是当前这个配置对象，child[key]就是{ ChildComponent }
    即mergeAssets接收的childVal是{ ChildComponent }，parentVal就是Vue.options.components
    Vue.options是下面这样：
    Vue.options = {
      components: {
        KeepAlive,
        Transition,
        TransitionGroup
      },
      directives: Object.create(null),
      directives:{
        model,
        show
      },
      filters: Object.create(null),
      _base: Vue
    }
    所以parentVal是包含三个内置组件的对象：{KeepAlive, Transition, TransitionGroup}
    let res = Object.create(parentVal || null)之后，通过res.KeepAlive就能访问到原型上的KeepAlive对象，
    然后再经过return extend(res, childVal)之后，res对象添加了ChildComponent属性
    最终res如下：
    {
      ChildComponent,
      __proto__: { KeepAlive, Transition, TransitionGroup }
    }
    所以经过策略函数的处理后，合并后的options的components对象，能通过原型链引用到3个内置组件，这就是我们不用显式地注册内置组件的原因，同时这也是内置组件的实现方式，
    最后别忘了这句是啥意思 assertObjectType(key, childVal, vm)，它是检测childVal是不是一个纯对象，因为注册组件components选项要传一个对象，如果不是纯对象，会警告。
    我们拿components讲解，对于directives和filters的合并也是一样的，都是用mergeAssets进行合并处理。
  */

  strats.watch = function (parentVal, childVal, vm, key) {
    // work around Firefox's Object.prototype.watch...
    if (!childVal) { return Object.create(parentVal || null) }
      assertObjectType(key, childVal, vm);
    if (!parentVal) return childVal 
    var ret = {};
    extend(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  // 知道了钩子函数的合并策略，再看看props methods inject computed属性的合并策略
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (parentVal, childVal, vm, key) {
    if (childVal && "development" !== 'production') { //如果child options这个选项存在，先判断它是不是对象，不是的话，报警提示
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal } //如果parent options中没有这个选项，直接返回child options的该选项
    var ret = Object.create(null);
    extend(ret, parentVal); // 把parent options的这个选项拷贝到一个新对象ret
    if (childVal) { // 如果child options这个选项存在，将它扩展到对象ret
      extend(ret, childVal); // 注意extend的逻辑是 同名属性的话，后者属性覆盖前者
    } // 也就是说，props methods等这些属性的合并，遵循同名属性后者优先覆盖
    return ret // 最后返回ret
  };
  
  strats.provide = mergeDataOrFn;

  var defaultStrat = (parentVal, childVal) => childVal === undefined ? parentVal : childVal

  function validateComponentName(name) {
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + unicodeRegExp.source + "]*$")).test(name)) {
      warn('无效的组件名字:' + name + '组件名应符合HTML5规范中的有效自定义元素名')
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn('不能使用内置的标签名(slot/component)和HTML保留的标签名' + 'id: ' + name);
    }
  }
  // 合并选项时会对props归一化规范化，数组形式将被规范化成对象形式
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) return // 传入的options中没有props，直接返回
    var res = {} // res对象存放规范化后的结果
    var val, name;
    if (Array.isArray(props)) { // 如果props是数组
      props.forEach(prop => { // 遍历props数组
        if (typeof prop ==='string') {
          name = camelize(prop) // 如果父组件的模板中使用子组件：<child one-num="123"></child>，那么子组件的props选项必须用oneNum接收，props: ['oneNum']，所以要将prop名驼峰化
          res[name] = { type: null } // res对象中，prop名作为key，value是{type: null}
        } else {
          warn('你用数组写法传props，那它里面的元素必须是字符串')
        }
      })
    } else if (isPlainObject(props)) { // 看看props是否是纯对象
      for (var key in props) { // 遍历props对象，
        val = props[key] //res对象中prop名对应的值val
        name = camelize(key)//把每一个prop名转成驼峰形式
        res[name] = isPlainObject(val) ? val : { type: val } //如果val是纯对象，直接把name和val作为键值对添加到res对象，否则，默认val是类型，val设为{type: val}再添加到res对象
      }
    } else {
      warn("无效的props选项的值，传数组或对象，你传的是" + toRawType(props), vm)
    }
    options.props = res; // 把res对象覆盖到options.props
  }

  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) return
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend({ from: key }, val)
          : { from: val };
      }
    } else {
      warn(`Invalid value for option "inject": expected an Array or an Object, but got ${toRawType(inject)}.`, vm)
    }
  }

  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (!dirs) return // options不存在directives就直接返回
    for (const key in dirs) {
      const def = dirs[key] // 正常来说def就是定义指令的对象
      if (typeof def === 'function') { // 如果def是函数就将它绑定给bind和update
        dirs[key] = { bind: def, update: def };
      }
    }
  }

  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn(`无效的option value"${name}": 期待是一个对象, 但你传了${toRawType(value)}.`, vm)
    }
  }
  // options的合并，在new Vue时调用了_init函数，_init内部调用mergeOptions将Vue.options和配置对象进行合并；Vue.mixin和子类的mixin中也用到了；Vue.extend和子类的extend中也用到了，合并父类options和扩展配置对象
  function mergeOptions (parent, child, vm) { //parent代表当前实例的构造函数的options，child代表实例化时传入的options，vm当前实例。mergeoptions方法是要合并构造函数和传入的options这两个对象。
    for (var key in child.components) {// 如果child选项对象中有components
      validateComponentName(key); // 校验components中注册的组件名是否合法
    }
    if (typeof child === 'function') { //如果child是函数，取其options作为child
      child = child.options;
    }
    normalizeProps(child, vm); // 规范化props,inject,directives属性，分别把options中它们转成对象的形式。因为有些可能以数组的形式传入
    normalizeInject(child, vm);
    normalizeDirectives(child);
    if (!child._base) { // child._base为假，说明child不是Vue.options
      // extends选项 允许声明扩展一个组件，可以传选项对象或构造函数，无需调用Vue.extend，主要是为了便于扩展简单文件组件，这和mixins类似
      // var CompA = { ... }
      // var CompB = {
      //   extends: CompA,// 没有调用Vue.extend却继承 CompA
      //   ...
      // }
      if (child.extends) { //如果child这个options传了extends选项，应该将extends的内容合并到实例的构造函数的options上(即parent的options)
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) { //如果child这个options传了mixins选项，遍历mixins数组，将每个mixin选项对象合并到实例的构造函数的options上(即parent的options)
        child.mixins.forEach(childMixin => {
          parent = mergeOptions(parent, childMixin, vm);
        })
      }
    }
    // 因为mergeOptions返回的是新的对象，上面可能调用了mergeOptions，所以经过上面代码，parent可能已经不是原来的parent，而是经过合并后产生的新对象，上面做的都是对parent和child的预处理
    var options = {}; // 最后要返回的对象
    var key;
    for (key in parent) { // 遍历parent
      mergeField(key) // 将parent的key传入mergeField执行
    }
    for (key in child) { // 遍历child对象，多了个判断
      if (!hasOwn(parent, key)) { //如果child对象的key也在parent上出现，那就不用再调用mergeField了，因为上一个forin循环中已经调用过了
        mergeField(key);
      }
    }
    function mergeField (key) { // 调用对应的策略函数合并某个字段key的选项
      var strat = strats[key] || defaultStrat //strats是config.optionMergeStrategies合并选项的策略对象，这个对象内包含很多合并特定选项的策略函数，不同的选项使用不同的合并策略
      options[key] = strat(parent[key], child[key], vm, key) //调用策略函数对parent和child的key进行合并，返回值赋给options[key]
    }
    return options
  }

  // 拿type传'components'举例，resolveAsset函数查询组件的注册信息，会先查注册的局部变量，如果找不到再沿着原型链查找，这也是局部组件只能在自身使用，全局组件能在全局使用的原因。组件在模板中使用，注册组件时可以有3种写法：和使用时保持一致/驼峰命名/首字母大写的驼峰命名。局部注册的组件构造器会存到vm.$options.components中，全局注册的组件保存在Vue.options.components中，在vm.$options.components的原型链上。
  function resolveAsset(options, type, id, warnMissing) { //type: filters components directives
    if (typeof id !== 'string') return
    // 组件名不为字符串，直接返回，获取当前options中的components对象，如果里面存在自有属性id原样/驼峰化的id/首字母大写的驼峰化的id，说明这是注册的局部组件，直接返回对应的组件构造器
    var assets = options[type]
    if (hasOwn(assets, id)) return assets[id]
    var camelizedId = camelize(id)
    if (hasOwn(assets, camelizedId)) return assets[camelizedId]
    var PascalCaseId = capitalize(camelizedId)
    if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
    // 如果上面都不成立，说明局部没有注册该组件，如果res存在，说明沿着原型链可以找到Vue.options.components对象中全局注册的组件构造器，返回res
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if (warnMissing && !res) warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options)
    return res
  }
  // 调用机会基本上是两个initProps组件创建时初始化，另一个是updateChildComponent更新子组件时
  function validateProp(key, propOptions, propsData, vm) {
    // key为propOptions的prop名，propOptions是用户配的props选项。propsData是父组件透传的props数据
    var prop = propOptions[key]; // key对应的规范化好的prop配置对象
    var absent = !hasOwn(propsData, key); //缺席：父组件没有透传该prop的数据
    var value = propsData[key]; // 父组件传的该prop的数据，没传为undefined
    // 对prop的类型为Boolean时的特殊处理
    var booleanIndex = getTypeIndex(Boolean, prop.type) //booleanIndex是Boolean在期望类型中的位置
    if (booleanIndex > -1) { // 用户在定义该prop时指定的类型中有Boolean
      if (absent && !hasOwn(prop, 'default')) { //父组件没有传该prop，用户定义该prop时也没指定默认值，既然指定了prop的类型为Boolean，则自动将该prop值设为false
        value = false
      } else if (value === '' || value === hyphenate(key)) {
        // 父组件传的是空字符串，或是一个与prop名驼峰转连字符后的字符串相同的字符串
        var stringIndex = getTypeIndex(String, prop.type) //stringIndex是String类型在期望类型中的位置
        if (stringIndex < 0 || booleanIndex < stringIndex) { //没有为该prop指定String类型，或指定了String类型但在Boolean的后面，说明优先级没有Boolean高
          value = true; // 则将该prop的值设为true，而不是字符串
        }
      }
    }   
    if (value === undefined) {//如果该prop没有接收到外界的prop值，则获取默认值
      value = getPropDefaultValue(vm, prop, key); //默认值赋给value
      var prevShouldObserve = shouldObserve // 缓存当前shouldObserve的值
      toggleObserving(true) // 开启观测开关
      observe(value) // 对该prop的默认值进行观测，因为得到的默认值是非响应式的
      toggleObserving(prevShouldObserve) // 还原shouldObserve的状态
    }
    assertProp(prop, key, value, vm, absent) //这里才是validateProp函数的真正对prop做类型校验。
    return value // validateProp最后返回prop的值，不管是透传而来的还是默认值
  }

  // 在父组件没有透传prop值且又要获取prop值时，获取prop的默认值
  function getPropDefaultValue (vm, prop, key) {
    if (!hasOwn(prop, 'default')) return undefined // 如果prop的选项对象没有配置default，说明没有设置默认值，直接返回undefined
    var def = prop.default // 定义def常量保存默认值
    if (isObject(def)) { //默认值不能直接传对象或数组，而要用一个函数去返回，和data一样，这是防止多个组件实例共享一份数据所带来的问题
      warn('无效的prop的默认值"'+key +'":'+'如果prop默认值为对象或数组，你要用工厂函数返回它', vm)
    }
    // 更新子组件调用updateChildComponent，它会更新prop数据:props[key]=validateProp(key,propOptions,propsData,vm)，更新vm._props对象中的每个prop值，然后才执行:vm.$options.propsData=propsData。即组件更新时，vm._props更新，并没有用到本次外界传入的数据，而是上一次组件更新或创建时的外界透传的数据。我们知道validateProp中，在没有接收到外界prop数据时，调用getPropDefaultValue获取默认值，所以getPropDefaultValue执行肯定是本次更新没有收到外界的prop数据，而vm.$options.propsData存的是上次组件创建或更新时接收的prop数据，如果它为undefined，说明上一次组件更新或创建时外界没有透传该prop数据。那上次组件更新或创建时，它肯定尝试获取默认值，至于能不能获取到就是另一回事。现在本次更新需要prop的默认值，有两个选择，1.获取上次更新或创建时的默认值，2.获取本次更新的prop的默认值。
    // 获取本次的默认值怎么做：直接用def，返回def.call(vm)或def，但有一种情况：默认值是工厂函数返回的对象/数组，每次获取该默认值都得到不一样的对象，虽然数据看上去一样，但它们的引用不一样，对于组件更新来说，prop值更新了，会触发无意义的响应，因为视图没有变化。因此要返回上一次的默认值，而不是在本次重新求值。
    /*props: {
        prop1: {
          default () {
            return { a: 1 }
          }
        }
      }
    问题来了，那上一次组件更新或创建时，要有默认值才行啊，上一次没有接收到外界的prop数据，如果vm._prop[key]有值，说明上一次props[key]=validateProp(key,propOptions,propsData,vm)，获取到了默认值赋给了vm._props
    */
    // 所以下面的if判断中vm.$options.propsData[key]===undefined说明上一次组件更新或创建时外界没有向组件传递该prop数据，vm._props[key]!==undefined说明该prop存在默认值的
    if (vm && vm.$options.propsData && //说明组件已创建，也接收到了父组件传的prop数据对象
      vm.$options.propsData[key] === undefined && //
      vm._props[key] !== undefined //
    ) { //当前组件处于更新状态，且没有传递该prop数据给组件，上一次更新或创建时外界也没有向组件传递该prop数据，上一次组件更新或创建时该prop就有一个不是undefined的默认值。那么此时一个返回之前的prop值，即默认值，作为本次更新的prop的默认值，为什么不重新获取默认值而是返回之前的默认值呢？
      return vm._props[key]
    }
    return typeof def === 'function' && getType(prop.type) !== 'Function' ? def.call(vm) : def
    // 因为对象或数组默认值必须从一个工厂函数获取，所以如果传的是函数且指定的type不是函数类型，执行函数来获取真正的默认值，否则直接使用def作为默认值。如果我们指定该prop的类型为函数，就不应该通过执行def来获取默认值，应该直接将def本身作为默认值
  }

  // 校验一个prop是否是有效的
  function assertProp(prop, name, value, vm, absent) {
    // prop：该prop的选项对象 name：prop名 value：该prop接收的值 absent：父组件有没有传该prop数据
    if (prop.required && absent) {//该prop必传，但外界没有传，警告提示，立即返回
      warn('缺少必传的prop:"' + name + '"', vm);
      return
    }
    if (value == null && !prop.required) return // 该prop接收的是null/undefined，且该prop没有规定必传，直接返回，不需要做后续的校验
    var type = prop.type; // 获取用户给该prop规定的type
    var valid = !type || type === true; //如果没有规定type或type值为true，都代表无论外界传说明都有效，不用校验类型，此时valid为真
    var expectedTypes = [] // expectedTypes数组用来保存期望类型的字符串表示，它的用处是当校验失败时，通过打印该数组收集的类型来提示用户该传哪些类型的值
    // if判断只有当type存在时才需要做类型的基本校验
    if (type) { //如果type存在但不是数组，强制包成数组
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) { //for循环遍历type
        // 调用assertType做类型校验，返回一个对象类似:{expectedType:'String',valid:true} expectedType值是期望的类型，valid值表示该prop值是否通过了校验
        var assertedType = assertType(value, type[i]);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
        // 某个prop的类型校验通过，valid为真，for循环终止，因为该prop值的类型只要满足期望类型中的一个即可。如果for循环结束后valid依然为假，说明该prop值的类型不在期望的类型之中
      }
    }
    if (!valid) { // 如果valid为假，提示用户传的prop值的类型不符合预期
      warn(getInvalidTypeMessage(name, value, expectedTypes), vm);
      return
    }
    // 到这里了基本校验已结束。但prop可以指定validator自定义校验函数，函数返回值为校验结果
    var validator = prop.validator
    if (validator) {
      if (!validator(value)) { // 调用validator对prop值判断，为假
        warn('无效的prop值: 自定义的validator校验prop失败"' + name + '".', vm);
      }
    }
  }

  function assertType (value, type) { // prop值 和 类型的构造函数
    var valid;
    var expectedType = getType(type); // 传入类型的构造函数，返回类型的字符串
    if (/^(String|Number|Boolean|Function|Symbol)$/.test(expectedType)) {
      // String Number Boolean Function Symbol这5种可以通过typeof区分
      var t = typeof value; // 获取prop值的typeof类型
      valid = t === expectedType.toLowerCase() //如果全等说明该prop的值与期望类型相同，valid为真
      if (!valid && t === 'object') { //如果valid为假且typeof value的值为'object'，valid为假就一定不符合期望类型吗？JS有基本包装类型，比如typeof new String('xxx')就会得到'object'，从而和expectedType不相同，但它确实是字符串，所以用typeof是不完善的，还要进一步判断value是否是type的实例。
        valid = value instanceof type //如果valid为真，说明prop值符合预期类型
      }
    } else if (expectedType === 'Object') { // 如果预期类型是对象
      valid = isPlainObject(value); // 判断是否是纯对象
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      valid = value instanceof type;
    }
    return { valid, expectedType } // 比如 { valid:true, expectedType:'Object'}
  }

  // getType接收一个函数，使用正则去匹配该函数转成的字符串，捕获函数名，如果匹配成功，则返回捕获的函数名，否则返回空字符串。
  function getType (fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ''
  }

  const isSameType = (a, b) => getType(a) === getType(b)//判断两个类型构造函数是否相同

  // getTypeIndexget获取给定的type在期望类型数组中的位置，不存在则返回-1
  function getTypeIndex (type, expectedTypes) { 
    if (!Array.isArray(expectedTypes)) {//expectedTypes不是数组，说明期待的类型只有一个，expectedTypes是单个的类型构造函数，判断它和type是否是同一个构造函数
      return isSameType(expectedTypes, type) ? 0 : -1 // 相同则返回0，不同则返回-1
    }
    // expectedTypes是数组
    for (var i = 0; i < expectedTypes.length; i++) { //遍历数组中的每一个类型构造函数
      if (isSameType(expectedTypes[i], type)) { // 给定的type和每一项做对比
        return i // 如果相同则返回当前项在数组中的位置，如果没有相同的返回-1
      }
    }
    return -1
  }
  const isBoolean = (...args) => args.some(elem => elem.toLowerCase() === 'boolean')

  function getInvalidTypeMessage (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize).join(', '));
    var expectedType = expectedTypes[0];
    var receivedType = toRawType(value);
    var expectedValue = styleValue(value, expectedType);
    var receivedValue = styleValue(value, receivedType);
    // check if we need to specify expected value
    if (expectedTypes.length === 1 &&
        isExplicable(expectedType) &&
        !isBoolean(expectedType, receivedType)) {
      message += " with value " + expectedValue;
    }
    message += ", got " + receivedType + " ";
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
      message += "with value " + receivedValue + ".";
    }
    return message
  }
  function styleValue (value, type) {
    if (type === 'String') {
      return ("\"" + value + "\"")
    } else if (type === 'Number') {
      return ("" + (Number(value)))
    } else {
      return ("" + value)
    }
  }
  function isExplicable (value) {
    const explicitTypes = ['string', 'number', 'boolean']
    return explicitTypes.some(elem => value.toLowerCase() === elem)
  }
  function handleError (err, vm, info) {
    pushTarget();
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured;
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false;
                if (capture) { return }
              } catch (e) {
                globalHandleError(e, cur, 'errorCaptured hook');
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info);
    } finally {
      popTarget();
    }
  }

  // 执行定义好的handler，try-catch用于捕获handler执行发生的错误，Promise.catch用于捕获异步任务返回错误。
  function invokeWithErrorHandling(handler, context, args, vm, info) {
    let res
    try {
      res = args ? handler.apply(context, args) : handler.call(context)
      if (res && !res._isVue && isPromise(res) && !res._handled) {
        // 当生命周期钩子函数内部执行返回promise对象是，如果捕获异常，则会对异常信息做一层包装返回
        res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
        res._handled = true
      }
    } catch (e) {
      handleError(e, vm, info)
    }
    return res
  }

  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        if (e !== err) {
          logError(e, null, 'config.errorHandler');
        }
      }
    }
    logError(err, vm, info);
  }

  function logError (err, vm, info) {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  var isUsingMicroTask = false;
  let callbacks = [] // callbacks存放通过nextTick注册的回调
  var pending = false
  function flushCallbacks () { // 执行并清空callbacks中的回调
    pending = false
    var copies = callbacks.slice(0); // 创建一份callbacks数组的拷贝
    callbacks.length = 0; // 清空callbacks数组
    copies.forEach(cb => { // 遍历拷贝的数组，逐一执行回调函数
      cb()
    })//如果$nextTick的回调中又写了$nextTick，执行cb时callbacks数组就又加进了新的回调，本次执行flushCallbacks就有可能无休止地执行cb，我们希望遍历执行的现有的callbacks数组，所以将它拷贝一份，然后把callbacks清空，新的cb加入到callbacks中并会在下一轮事件循环的flushCallbacks中执行，而不会在本次flushCallbacks中执行
  }

  var timerFunc;
  // nextTick利用微任务队列，通过promise.then或mutationobserver注册微任务。mutationobserver有更广泛的支持，但是在ios>=9.3.3的uiwebview中，当在触摸事件处理程序中触发时，触发几次后它完全停止工作。因此能用promise就用promise
  if (typeof Promise !== 'undefined' && isNative(Promise)) {// 检测当前宿主环境是否支持原生的Promise
    var p = Promise.resolve(); // 创建一个resolved的Promise实例对象
    timerFunc = () => { // 定义timerFunc函数，函数执行即p.then执行
      p.then(flushCallbacks) // 将flushCallbacks函数推入到微任务队列中
      if (isIOS) { setTimeout(noop); } // 在uiwebviews中，promise.then执行，回调被推入微任务队列中，但微任务队列没有被刷新。通过添加一个空计时器(注册一个宏任务，即使这个宏任务什么都不做)来强制触发微任务队列的刷新
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) { //MutationObserver用于监听DOM修改事件，能监听节点的属性、文本内容、子节点等的改动
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks) // MutationObserver实例 它会在指定的DOM发生变化时被调用。
    var textNode = document.createTextNode(String(counter));//新建一个文本节点
    observer.observe(textNode, { //监听这个文本节点的改动事件，以此触发flushCallbacks的执行
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2; //timerFunc的调用会手动修改文本节点的属性
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // 回退到setImmediate，它注册的是宏任务，但比setTimeout好。
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else {//HTML5中规定setTimeout的最小时间延迟是4ms，即理想环境下异步回调最快也要4ms才能触发。Vue使用这么多函数来模拟异步任务，目的就是让异步回调尽早调用。而setImmediate的延迟小于setTimeout的
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  // 当调用栈中所有任务都执行完毕，会去检查微任务队列中是否有事件存在，如果存在，则会依次执行微任务队列中事件对应的回调，直到微任务队列清空，然后去宏任务队列中取出一个事件，把对应的回调加入到当前执行栈，当执行栈中所有任务都执行完毕后，检查微任务队列中是否有事件存在，无限重复这个过程，这就叫事件循环。两个不同的宏任务之间穿插着UI的重渲染，那我们只需在微任务中把所有需要更新的数据更新，即flushCallbacks清空执行Callbacks队列，队头是flushQueueWatcher，清空执行queue中的watcher的run方法，对表达式或渲染函数重新求值，生成最新的DOM，然后queue还有用户通过$nextTick注册的一些操作最新的DOM的回调，它们的执行可以操作到最新的DOM。微任务结束后，执行宏任务，即浏览器将最新的DOM渲染到页面。所以这样只需要一次UI重渲染就能得到最新的DOM。
  function nextTick(cb, ctx) {
    var _resolve;
    callbacks.push(() => {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    // nextTick将传入的cb回调包裹进一个函数，将函数推入callbacks数组，函数执行会执行cb
    if (!pending) {
      pending = true
      timerFunc()
    }
    // pending默认为false，代表此时微任务队列为空，可以添加微任务，if语句块进来pending马上变为true，意味着本轮事件循环中，不管调用多少次nextTick，只会在第一个执行timerFunc，即把flushCallbacks推入微任务队列只会发生一次，执行flushCallbacks这个微任务时，pending恢复为false
    // timerFunc会先检测当前环境，按照Promise,MutationObserver,setImmediate,setTimeout优先级，哪个能用用哪个，将flushCallbacks加入微任务或宏任务队列中
    if (!cb && typeof Promise !== 'undefined') {// 如果调用$nextTick时没有传参
      return new Promise(resolve => { // 则$nextTick()返回一个promise实例
        _resolve = resolve;
      })
    }
  }
  // 一轮事件循环中nextTick的第一次调用，pending为false，会执行timerFunc，将flushCallbacks注册为微任务，flushCallbacks就是将callbacks数组中的回调依次执行并清空数组，数据变动之后调用$nextTick(fn)，所以queueWatcher中的nextTick(flushSchedulerQueue)要早于nextTick(fn, this)，因此在callbacks数组中，flushSchedulerQueue排在fn之前，清空执行callbacks数组时，存在执行顺序的先后
  // pending的作用就是保证本轮事件循环中不管多少次调用nextTick，只要微任务flushCallbacks还没执行，就始终只执行一次timerFunc，即flushCallbacks微任务只会注册一次，不会重复地执行timerFunc，即不会重复地向微任务队列中添加flushCallbacks任务，即flushCallbacks任务只需执行一次，执行一次就能将本次事件循环所有通过nextTick注册的回调都执行一遍，包括flushSchedulerQueue
  // waiting变量控制的是什么？因为有不同watcher要入queue等待执行更新，所以queueWatcher会被多次调用，如果没有限制，就会多次调用nextTick(flushSchedulerQuee)，从而往callbacks数组中推入了多个flushSchedulerQueue回调，但flushSchedulerQueue只需要一个就好，将queue中的watcher逐个调用run方法并清空queue，做一次就好。
  // 所以waiting保证了flushSchedulerQueue方法不会重复推入callbacks，pending保证了flushCallbacks不会重复地推入微任务队列，而且waiting在flushSchedulerQueue中，queue中的watcher全部run完，恢复为false；pending在flushCallbacks中恢复为false

  var initProxy;

  var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,require');

  var hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) { // 首先检测宿主环境是否支持Proxy
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact'); //检测给定的值是否是内置的事件修饰符
    config.keyCodes = new Proxy(config.keyCodes, {
      // 为config.keyCodes设置set代理，防止开发者在自定义键位别名时，覆盖了内置的修饰符，比如Vue.config.keyCodes.shift = 16 由于shift是内置的修饰符，所以将会得到警告
      set(target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }
  // 给vm添加_renderProxy属性，使用proxy对vm做一层代理，在开发环境给开发者一个友好的提示。生产环境下initProxy是undefined
  initProxy = function (vm) {
    if (hasProxy) { // 判断宿主环境是否支持原生的Proxy
      let handler = {
      // has方法可以看做是in操作的钩子，可以拦截xxx in proxy这样的属性查询，xxx in Object.create(proxy)这样的继承属性查询，还有with语句with(proxy){(foo);}里对变量的访问
        has(target, key) {
          var has = key in target;
          var isAllowed = allowedGlobals(key) || (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
          // has为真，表示key属性存在于vm上或它的原型链上，isAllowed为真，表示key是允许的全局对象或以_开头的不在vm.$data上的字符串，因为渲染函数中很多以_开头的内部方法，这样的key都允许被访问
          if (!has && !isAllowed) {
          // 渲染函数内部使用with语句，指定了内部代码的执行上下文this，由于渲染函数调用时用call指定了this指向vm._renderProxy，所以with语句块中的执行上下文就是vm._renderProxy，所以在with语句中访问a就相当于访问vm._renderProxy的a属性，因为vm._renderProxy是proxy代理对象，所以with语句块内访问变量会被proxy的has代理拦截，触发handler中的has函数，has函数中判断如果访问的属性既不在实例上(或原型链上)有定义，又不是全局变量，则需要提示开发者。
            if (key in target.$data) {
              warn(`${key}这个属性在vm.$data或它的原型链上存在，它必须通过$data访问，因为以“$”或“_”开头属性在Vue实例中没有代理，因为要防止和Vue内部的属性冲突`, target);
            } else { // 警告在渲染的时候引用了key，但在实例上并没有定义key这个属性或方法。
              warn(`属性或方法"${key}"在实例上没有定义但在渲染时引用了它，确保这个属性是响应式的，无论是在data选项中，还是对于基于类的组件.`, target);
            }
          }
          return has || !isAllowed // has方法返回一个boolean值
        }
      };
      vm._renderProxy = new Proxy(vm, handler) // 之后访问vm._renderProxy，如果属性值为proxy实例，则代理对象handler的has函数会拦截with语句中对变量的访问
    } else { // 宿主环境不支持原生的Proxy，vm的_renderProxy就为vm，不代理了
      vm._renderProxy = vm
    }
  };

  var seenObjects = new Set();
  // 递归地读取一个对象的每个子属性的值，以此触发它们的get，做依赖收集
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }
  function _traverse (val, seen) { // val是被观察的属性的值
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) return
    // val不是数组也不是对象，val值是被冻结了的，VNode，这样的属性值都是不用/不能进行深度观察的
    if (val.__ob__) { //如果val.__ob__存在，即val已经响应式化了，获取val.__ob__.dep.id，并把它放入seen集合中，说明已经遍历读取了val的内部值了，避免下次重复读取val的内部值，避免了循环引用，比如a:{name:b},b:{name:a}
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) return
      seen.add(depId);
    }
    if (isA) { // val是数组，遍历val数组，递归调用_traverse，传入元素值和seen
      i = val.length;
      while (i--) {
        _traverse(val[i], seen); // 传入每个元素的值，就读取了属性值，进行了依赖收集
      }
    } else { // val是对象，遍历val对象，递归调用_traverse，传入val对象中每个属性值
      keys = Object.keys(val);
      i = keys.length;
      while (i--) {
        _traverse(val[keys[i]], seen); // 读取了子属性的值，触发了属性的get，收集watcher
      }
    }
  }
  // 我们知道事件绑定如果用了修饰符，在模版编译的阶段解析标签上的属性时，会将特殊符号在事件名前面，比如@increase.once="a"，则vm.$options._parentListeners是这样的：{~increase:function(){}}。比如<a>标签是自带链接跳转默认事件的，如果用了.passive修饰符，则事件回调即便设置了阻止默认事件也是无效的，照样会默认跳转，所以passive和prevent修饰符不能同时使用。normalizeEvent就是将传入的带有特殊前缀的事件名转成具有特定值的对象。
  var normalizeEvent = cached((name) => {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name
    var once = name.charAt(0) === '~';
    name = once ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return { name, once, capture, passive } // 后三个属性值的真假，代表是否用了该修饰符
  });

  // 在开始构建实例时，是没有旧节点的，调用createFnInvoker函数生成当事件触发时真正执行的函数。它接收一个事件处理函数，也可以接收一个包含多个处理回调的数组，在函数内部定义一个invoker函数并最终返回它，它会挂载一个fns属性，用来存放传入的fns，invoker的执行会根据fns的类型执行处理器数组中的回调，或调用单个处理函数。
  function createFnInvoker (fns, vm) {
    function invoker () {
      const fns = invoker.fns // 每次invoker执行都是从invoker.fns中取回调函数执行
      if (Array.isArray(fns)) { //如果fns是数组，存放多个回调
        const cloned = fns.slice() //先把数组克隆一份
        for (let i = 0; i < cloned.length; i++) { // 遍历执行fns数组中的回调函数
          invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
        }
      } else { // fns是回调函数，执行它就好
        return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
      }
    }
    invoker.fns = fns // invoker会挂载传入的fns
    return invoker // 返回invoker，它事件真正执行的回调函数
  }

  // 如果该实例的父组件已经存在一些事件监听器，为了保证正确捕获到事件并向上冒泡，父级的事件是需要继承下来的，另外，如果在实例初始化时绑定了同名的事件处理回调，也需要为同名事件添加新的处理回调，实现同一事件绑定多个监听回调
  // updateListeners函数接收新旧事件监听器对象，事件添加和移除的函数，以及实例vm，然后遍历on对象，如果当前某个事件在oldOn对象中没有对应的回调，说明需要调用add去添加该事件的回调；相反，如果oldOn对象中某个事件在当前的on对象中没有对应的回调，说明该事件的回调需要被移除
  function updateListeners(on, oldOn, add, remove$$1, createOnceHandler, vm) {
    var name, def$$1, cur, old, event;
    for (name in on) { // 遍历新的监听器对象
      def$$1 = cur = on[name]; // 当前遍历的事件name对应的事件对象，赋给def$$1和cur
      old = oldOn[name]; // 事件name在oldOn对象中对应的事件对象
      event = normalizeEvent(name); // 规范化后的事件名对象，包含了修饰符的使用情况
      if (isUndef(cur)) { // on对象中name对应的事件对象不存在
        warn(`"${event.name}"的事件处理函数是无效的:得到的是` + String(cur), vm)
      } else if (isUndef(old)) { // oldOn对象里没有该事件的对应定义，说明该事件回调需要新增
        if (isUndef(cur.fns)) { // 如果cur对象的fns属性没有定义，说明之前没有为该事件创建过回调
          cur = on[name] = createFnInvoker(cur, vm);//调用createFnInvoker创建事件最终执行的回调
          // 叫invoker，同时把cur挂载到invoker上，执行invoker实际是执行cur
        }
        if (isTrue(event.once)) { // 如果当前事件用了.once，则创建一次性的回调函数，执行一次就删除
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params) //添加事件处理回调

      } else if (cur !== old) { //如果cur!==old，即对于同一事件，它的回调函数前后变化了，我们不需要调用add去添加一个新的事件回调，因为old指向了invoker，它的fns是真正的回调old，只需将fns属性值改为cur，即用新的处理回调覆盖。再把old赋给on[name]，即cur和on[name]指向了invoker
        old.fns = cur;
        on[name] = old; //保证了事件回调invoker只创建一次，之后更新回调只用修改invoker的fns属性值
      }
    }
    for (name in oldOn) { //遍历旧的事件监听器对象
      if (isUndef(on[name])) {//如果存在某个事件在新的on对象中没有，说明这个事件要被移除
        event = normalizeEvent(name) // 整理出标准化的事件名对象
        remove$$1(event.name, oldOn[name], event.capture); // 移除事件处理函数
      }
    }
  }

  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];
    function wrappedHook () {
      hook.apply(this, arguments);
      remove(invoker.fns, wrappedHook);
    }
    if (isUndef(oldHook)) {
      invoker = createFnInvoker([wrappedHook]);
    } else {
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }
    invoker.merged = true;
    def[hookKey] = invoker;
  }

  function extractPropsFromVNodeData(data, Ctor, tag) {
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp(res, hash, key, altKey, preserve) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }
  // 针对内部编译的渲染函数，_c函数接收的children规范化，鉴于它已经是数组了，直接遍历，如果遇到嵌套数组，调用this指向[]的concat，chilren数组作为提供的参数数组，利用[].concat(1)为[1]，[].concat([1,2])为[1,2]的特点，children数组里的每项都作为concat的参数，遇到二维数组就将它展平了
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) { 
      if (Array.isArray(children[i])) return Array.prototype.concat.apply([], children)
    }
    return children
  }

  // 这里判断children是否为基本类型值，如果是，直接基于它创建一个文本vnode节点，并放入一个数组返回，如果不是，再判断是否是数组，如果是则规范化数组形式的children，如果不是直接返回undefined
  function normalizeChildren(children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }
  const isTextNode = node => isDef(node) && isDef(node.text) && isFalse(node.isComment)

  // 函数做的事情是将创建的vnode的createElement函数的第三个参数，children数组遍历展平，不断往res数组里推入vnode，只要嵌套的是数组类型就往下递归遍历，直到是文本vnode节点，然后进行createTextVNode创建新的文本vnode节点。这样一层层从最深处构建出一个深层次的vnode
  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) { //遍历createElement传入的children数组
      c = children[i]; // c是当前遍历项
      // 如果当前项没有定义，或是一个boolean值，跳出本次循环
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1; //lastIndex是res数组末尾的索引
      last = res[lastIndex]; // last指向res数组末尾项
      if (Array.isArray(c)) { // 如果当前项是嵌套数组
        // 当前嵌套数组不是空数组，递归调用normalizeArrayChildren处理当前项，并传入第二个参数nestedIndex，当前是第一层嵌套，所以nestedIndex没传，所以(nestedIndex || '') + "_" + i为''+"_" + i，即'_i'，i为当前遍历的索引，所以normalizeArrayChildren第二个参数接收的是_1、_1_2这样的字符串，既有嵌套数组的索引信息，也有嵌套层次的信息。
        if (c.length > 0) {
          c = normalizeArrayChildren(c, (nestedIndex || '') + "_" + i);
          // 如果嵌套数组项的第一项为文本vnode节点，且res数组末尾项也是文本vnode节点，将后者的文本和前者的文本合并，基于合并的文本字符串创建一个新的文本vnode节点，覆盖res的末尾项，然后再把当前嵌套数组项的首项弹出。
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          // 将当前项(数组)剩下的元素都推入res数组中
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        // 如果当前遍历的项c不是数组，是基本类型值，判断res数组的末尾项是否是文本vnode节点，如果是，将它和c合并成一个文本字符串，然后基于它再创建一个新的文本vnode节点，再覆盖到res的末尾项。如果res的末尾项不是文本vnode节点，且当前遍历项c不是空字符串，为c创建文本vnode节点，推入res数组的末尾
        if (isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          res.push(createTextVNode(c));
        }
      } else { //当前遍历的项c既不是数组，也不是基本类型值，如果c是文本vnode节点，且res数组末尾项也是文本vnode节点，将它们俩的文本合并，创建一个新的vnode文本节点，覆盖到res数组的末尾项
        if (isTextNode(c) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else { //如果children是经历了v-for渲染转化成vnode的数组，且当前项c这个vnode对象存在tag值，且不存在key值，且存在nestedIndex(说明当前遍历的不是外层，而是嵌套的数组)，满足这些条件则让当前遍历项c增加一个key属性，值为 类似："__vlist_2_1__"，即为二层以下的嵌套vnode增加key值，因为用户并不能手动给嵌套的每一项添加key值。
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          // 添加了key值的当前遍历项c，推入到res数组的末尾
          res.push(c)
        }
      }
    }
    return res
  }

  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function' ? provide.call(vm) : provide;
    }
  }

  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach(function (key) {
        {
          defineReactive$$1(vm, key, result[key], function () {
            warn(`Avoid mutating an injected value directly since the changes will be overwritten whenever the provided component re-renders. injection being mutated: "${key}"`, vm)
          });
        }
      });
      toggleObserving(true);
    }
  }

  function resolveInject (inject, vm) {
    if (inject) {
      var result = Object.create(null);
      var keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === '__ob__') { continue }
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }


  function resolveSlots(children, context) {
    if (!children || !children.length) return {}
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) delete slots[name$1]
    }
    return slots
  }

  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  function normalizeScopedSlots(slots, normalSlots, prevSlots) {
    var res;
    var hasNormalSlots = Object.keys(normalSlots).length > 0;
    var isStable = slots ? !!slots.$stable : !hasNormalSlots;
    var key = slots && slots.$key;
    if (!slots) {
      res = {};
    } else if (slots._normalized) {
      // fast path 1: child component re-render only, parent did not change
      return slots._normalized
    } else if (
      isStable &&
      prevSlots &&
      prevSlots !== emptyObject &&
      key === prevSlots.$key &&
      !hasNormalSlots &&
      !prevSlots.$hasNormal
    ) {
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) {
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
        }
      }
    }

    for (var key$2 in normalSlots) {
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot(normalSlots, key$2);
      }
    }
    if (slots && Object.isExtensible(slots)) {
      (slots)._normalized = res;
    }
    def(res, '$stable', isStable);
    def(res, '$key', key);
    def(res, '$hasNormal', hasNormalSlots);
    return res
  }

  function normalizeScopedSlot(normalSlots, key, fn) {
    var normalized = function () {
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res);
      return res && (
        res.length === 0 ||
        (res.length === 1 && res[0].isComment) // #9658
      ) ? undefined
        : res
    }
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }

  function proxyNormalSlot(slots, key) {
    return function () { return slots[key]; }
  }
  // renderList做的就是将v-for遍历的目标，进行遍历，逐个转成对应的vnode节点，放入一个新的数组ret，然后返回ret
  function renderList(val, render) { //val接收v-for中被遍历的对象，比如什么list数组，或者xxx对象，或者一个字面量数组，也可以是一个数字类型，字符串类型，甚至可以是可迭代的对象比如原生的 Map 和 Set
    var ret, i, l, keys, key;
    // 如果val是数组或字符串，按val的长度创建一个新的数组，然后遍历val，逐个调用传入的渲染函数，生成相应的vnode节点，赋给ret[i]，这样ret数组就有了val每一项对应的vnode
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    // 如果val是number类型，比如3，则创建一个长度为3的空数组ret，然后进行3次循环，调用渲染函数，分别传入1,2,3和对应的索引0,1,2，生成相应的vnode节点，再一个个放到数组ret中
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    // 如果val是对象，分两种情况，一种是传统的对象，一种是可迭代的Map、Set对象
    } else if (isObject(val)) {
      // 如果运行环境中symbol可用。。暂时不看这个
      if (hasSymbol && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {//val是普通对象，获取它所有自身属性组成的数组，赋给keys，按keys的长度创建一个空数组ret，遍历keys数组，根据每一项，即val中的属性名，获取到对应的属性值，传入渲染函数执行，返回出vnode节点赋给ret[i]，这样ret就有了val每个属性和属性值对应的vnode
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    // 这样下来，如果ret没有定义，说明v-for遍历的目标不合要求，返回空数组ret
    if (!isDef(ret)) {
      ret = [];
    }
    (ret)._isVList = true; //给数组ret加上_isVList属性，标识已经经历了vnode的转化了
    return ret // 返回出经过了遍历的存放了vnode的数组ret
  }

  function renderSlot(name, fallback, props, bindObject) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) { // scoped slot
      props = props || {};
      if (bindObject) {
        if (!isObject(bindObject)) {
          warn('slot v-bind without argument expects an Object', this);
        }
        props = extend(extend({}, bindObject), props);
      }
      nodes = scopedSlotFn(props) || fallback;
    } else {
      nodes = this.$slots[name] || fallback;
    }
    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key
    }
  }

  function bindObjectProps(data, tag, value, asProp, isSync) {
    if (value) {
      if (!isObject(value)) {
        warn('v-bind without argument expects an Object or Array value', this);
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (key === 'class' || key === 'style' || isReservedAttribute(key)) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          var camelizedKey = camelize(key);
          var hyphenatedKey = hyphenate(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];
            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };
        for (var key in value) loop( key );
      }
    }
    return data
  }

  function renderStatic(index, isInFor) {
    var cached = this._staticTrees || (this._staticTrees = [])//vm实例的_staticTrees缓存渲染过的tree
    var tree = cached[index];
    // 如果静态树已经渲染过且不是在v-for里的，就能复用它，否则，渲染一个新的树
    if (tree && !isInFor) return tree
    // 调用staticRenderFns函数数组对应的静态渲染函数，生成一个静态树
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  function markOnce(tree, index, key) {
    markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true);
    return tree
  }
  // 标记静态节点，给它们增加isStatic key isOnce属性
  function markStatic(tree, key, isOnce) { // tree可能是单节点树或节点树组成的数组，key是标记__once__或__static__，分别代表是一次性静态节点或普通静态节点，isOnce代表是否是一次性节点
    if (Array.isArray(tree)) { //如果tree是数组，遍历数组
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {//如果元素存在且不是字符串，调用markStaticNode对它进行静态节点的标记
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else { //tree不是数组，直接进行标记
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) {
        warn('v-on without argument expects an Object value', this);
      } else {
        var on = data.on = data.on ? extend({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  function resolveScopedSlots(fns, res, hasDynamicKeys, contentHashKey) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) {
      var slot = fns[i];
      if (Array.isArray(slot)) {
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) {
        if (slot.proxy) {
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      (res).$key = contentHashKey;
    }
    return res
  }


  function bindDynamicKeys (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i];
      if (typeof key === 'string' && key) {
        baseObj[values[i]] = values[i + 1];
      } else if (key !== '' && key !== null) {
        warn("Invalid value for dynamic directive argument (expected string or null): " + key, this);
      }
    }
    return baseObj
  }

  function prependModifier (value, symbol) {
    return typeof value === 'string' ? symbol + value : value
  }

  function installRenderHelpers (target) {
    target._o = markOnce; // v-once指令的渲染处理函数
    target._n = toNumber; // 值转数字处理，处理失败返回原值
    target._s = toString; // 值转字符串处理
    target._l = renderList; //v-for指令的渲染处理
    target._t = renderSlot; // slot的渲染处理
    target._q = looseEqual; // 判断两个对象是否大体相等
    target._i = looseIndexOf; // indexOf的宽松版
    target._m = renderStatic;// 静态节点render处理
    target._f = resolveFilter; // filters指令的渲染处理
    target._k = checkKeyCodes; // checking keyCodes from config
    target._b = bindObjectProps;// v-bind render 处理，将 v-bind="object" 的属性 merge 到VNode属性中
    target._v = createTextVNode; // 创建文本节点
    target._e = createEmptyVNode; // 创建空节点
    target._u = resolveScopedSlots; // 
    target._g = bindObjectListeners; // v-on指令的渲染处理
    target._d = bindDynamicKeys;
    target._p = prependModifier;
  }

  function FunctionalRenderContext(data, props, children, parent, Ctor) {
    var this$1 = this;
    var options = Ctor.options;
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      contextVm._original = parent;
    } else {
      contextVm = parent;
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () {
      if (!this$1.$slots) {
        normalizeScopedSlots(
          data.scopedSlots,
          this$1.$slots = resolveSlots(children, parent)
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({
      enumerable: true,
      get () {
        return normalizeScopedSlots(data.scopedSlots, this.slots())
      }
    }));

    if (isCompiled) {
      this.$options = options;
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = (a, b, c, d) => createElement(contextVm, a, b, c, d, needNormalization)
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype);

  function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext(data, props, children, contextVm, Ctor);

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  var componentVNodeHooks = { //组件内部的钩子函数
    init (vnode, hydrating) {
      if (//vnode的組件實例已經創建，且組件實例沒有被銷毀，且是keepAlive組件
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        var mountedNode = vnode
        componentVNodeHooks.prepatch(mountedNode, mountedNode)
      } else { //当还没为vnode创建组件实例时，vnode.componentInstance不存在，vnode.data.keepAlive也没有值，創建子组件实例，并赋给vnode.componentInstance，组件的vnode就和组件实例有了联系
        var child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance)
        child.$mount(hydrating ? vnode.elm : undefined, hydrating)
        // 组件实例调用$mount方法进行实例的挂载渲染，非ssr时，第一个参数传undefined，即没有提供实际元素el，意味着在执行vm._render和vm._update(调用vm.__patch__创建组件的DOM树)时，并不会将组件的DOM树插入到父节点上，插入到父元素的操作将在初始化组件实例后，即createComponent中，initComponent执行后，insert执行中完成
      }
    },
    prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions//获取vnode对应的组件的配置对象
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child, // 旧vnode的组件实例，同样也是新vnode的组件实例
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },
    insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },
    destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  // 创建子组件的vnode，在最终生成的DOM树中，它不会对应一个DOM节点，即不会出现在DOM树里，只出现在vnode树里。内置组件和普通组件在编译成渲染函数时处理方式是一样的，有了渲染函数，就开始从子组件到父组件生成组件vnode的过程：_c('xxx'...)的处理，执行createElement中调用该函数去创建子组件vnode
  function createComponent(Ctor, data, context, children, tag) {
    if (isUndef(Ctor)) return // Ctor没有定义，直接返回
    var baseCtor = context.$options._base; // 基础构造器Vue
    // 局部注册组件时，会通过在父组件的options.components中添加子组件的options，这和全局注册后在Vue.options.components添加子组件构造器很类似，区别在于：1.局部注册添加的配置对象是在某个组件之下，全局注册添加的子组件构造器是在根实例下。2.局部注册添加的是一个子组件的配置对象，全局注册添加的是一个子类构造器。所以局部注册缺少了一步构建子类构造器的过程，这一步在createComponent中进行，根据Ctor是对象还是函数来区分局部和全局组件，如果是对象，则该组件是局部注册的组件，会调用Vue.extend方法去创建一个子类构造器
    if (isObject(Ctor)) Ctor = baseCtor.extend(Ctor) // 将配置对象转成一个子类构造器
    if (typeof Ctor !== 'function') { // 如果Ctor还不是一个函数，则报警
      warn(("Invalid Component definition: " + (String(Ctor))), context);
      return
    }
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
      if (Ctor === undefined) {
        return createAsyncPlaceholder(asyncFactory, data, context, children, tag)
      }
    }
    data = data || {};
    resolveConstructorOptions(Ctor) //组件构造器的options更新为当前构造器的options和它父级构造器的options的合并结果
    if (isDef(data.model)) { // 如果组件标签上使用了v-model
      transformModel(Ctor.options, data);
    }
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }
    // 当前是组件环境，使用.native添加的事件需要被视为子组件的自定义事件，而不是原生DOM事件
    var listeners = data.on; // 用变量listeners缓存一下on对象
    data.on = data.nativeOn; // data的nativeOn对象赋给data.on
    if (isTrue(Ctor.options.abstract)) { //abstract是抽象组件的标志
      var slot = data.slot; // 只保留slot属性
      data = {} // data中的其他属性被剔除，在抽象组件中它们没有意义
      if (slot) data.slot = slot
    }
    installComponentHooks(data)// 在vnode.data.hook上挂载一系列组件钩子函數
    var name = Ctor.options.name || tag;
    // 创建子组件vnode，名称以vue-component-开头
    var vnode = new VNode(`vue-component-${Ctor.cid}${name ? `-${name}` : ''}`, data, undefined, undefined, undefined, context, { Ctor, propsData, listeners, tag, children }, asyncFactory)
    return vnode
  }

  // 为组件的vnode创建组件实例，parent接收activeInstance，即正在活动状态的父组件
  function createComponentInstanceForVnode(vnode, parent) {
    // 首先准备好创建子组件时传入的options对象，里面有_isComponent属性，标识创建的是内部子组件的实例，_parentVnode记录当前子组件的占位vnode，parent记录创建当前子组件实例时，当前处于活跃状态的父组件
    var options = {
      _isComponent: true,
      _parentVnode: vnode, 
      parent
    }
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)//vnode.componentOptions.Ctor是在为组件创建vnode时传入的组件构造函数，该构造函数是基于Vue继承而来，混合了组件自身的选项(Ctor.options)，此外，创建实例时，也会传入options，但这个options跟跟创建根组件传入的options有些许区别
  }

  // 給組件的vnode.data.hook上挂载一系列組件管理的鉤子函數
  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {})
    //给vnode.data添加hook属性(对象)，遍历4个组件的钩子函数名init、prepatch、insert、destroy，如果data.hook中当前钩子和将要合并的钩子不同，且现有的钩子不存在或存在但不是合并后的钩子，则如果现有的钩子存在，调用mergeHook将两个钩子合并为一个，如果不存在现有的钩子，直接将要合并的钩子toMerge存到data.hook对象中
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i]
      var existing = hooks[key]
      var toMerge = componentVNodeHooks[key]
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
      }
    }
  }
  // 合并两个钩子成一个新的钩子，新的钩子就是f1和f2依次执行，接收同样的参数，新钩子有_merged屬性
  function mergeHook$1 (f1, f2) {
    function merged(a, b) {
      f1(a, b);
      f2(a, b);
    }
    merged._merged = true
    return merged
  }
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input'
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    var existing = on[event];
    var callback = data.model.callback;
    if (isDef(existing)) {
      if (Array.isArray(existing) ? existing.indexOf(callback) === -1 : existing !== callback) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2

  // createElement返回vnode，实际它是对_createElement函数的封装，在调用_createElement之前，对传入的参数进行处理，毕竟手写的渲染函数参数需要统一化
  function createElement (context, tag, data, children, normalizationType, alwaysNormalize) {
    // 如果第三个参数传的是数组或基本类型值，则默认没有传data，因为data一般是对象形式存在，则将第三个参数作为第四个参数使用，往上类推。
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) normalizationType = ALWAYS_NORMALIZE;
    // alwaysNormalize为false代表是内部编译生成render用到该函数，为true代表是手写render用到该函数
    return _createElement(context, tag, data, children, normalizationType)
  }

  // _createElement创建vnode节点。vnode包含的信息会告诉Vue页面需要渲染什么样的节点，包括子节点的描述信息。虚拟DOM是对由Vue组件树建立起来的整个VNode树的称呼
  function _createElement(context, tag, data, children, normalizationType) {
    // Vue可以让用户手写渲染函数，就要考虑到不确定的传参，因此_createElement在创建vnode前会先做规范性检测
    if (isDef(data) && isDef((data).__ob__)) {
      warn(`不能使用响应式对象作为vnode的data：${JSON.stringify(data)}\n 因为data在vnode渲染的过程中可能会被改变，这样会触发依赖，导致不符合预期的操作，Always create fresh vnode data objects in each render!`, context)
      return createEmptyVNode() // 返回一个空vnode节点
    }
    // 如果is属性存在，将is属性值赋给标签名tag
    if (isDef(data) && isDef(data.is)) tag = data.is
    if (!tag) return createEmptyVNode()
    // 如果tag没传，或is属性被赋予一个假值，将不知道这个组件要渲染成什么，所以返回一个空vnode节点
    // 如果data.key存在，但key值不是基本类型值，警告，必须是字符串或数字，不能是引用值
    if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
      warn('节点的key值必须是字符串/数字，不要使用引用类型值', context);
    }
    // vnode树是每个vnode以树状形式拼成的，生成真实DOM需要一个完整的vnode树，因此要保证每个子节点都是vnode类型
    if (Array.isArray(children) && typeof children[0] === 'function') {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) { //是用户编写的渲染函数，分为两种情况，1当chidren为文本节点时，调用createTextVNode创建一个文本VNode节点，2当children中有v-for时出现的嵌套数组，遍历children，对每个节点进行判断，如果依旧是数组，递归调用，直到类型为基本类型值，创建文本vnode节点，经过递归后，children也变成全是vnode的数组
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) { //内部编译模板生成的渲染函数，理论上children数组都是vnode类型的项，但有例外，函数式组件返回一个数组，所以要将嵌套数组展平成一维数组
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') { // 如果tag是字符串
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      // 如果标签是普通html标签，直接创建vnode节点
      if (config.isReservedTag(tag)) {
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children, undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) { // 调用resolveAsset根据tag获取已注册的组件构造器，可能是局部组件，也可能是全局组件，如果有值，说明该占位符组件已经注册过，调用createComponent创建子组件vnode
        vnode = createComponent(Ctor, data, context, children, tag)
      } else {
        vnode = new VNode(tag, data, children, undefined, undefined, context);
      }
    } else { // 如果tag不是字符串，执行createComponent创建一个Component对象
      //直接的component配置对象或构造函数
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) { // 如果vnode是数组，返回vnode
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); } // ns相关处理
      if (isDef(data)) { registerDeepBindings(data); } //进行Observer相关绑定
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  function initRender (vm) {
    vm._vnode = null; // vm实例的根vnode节点
    vm._staticTrees = null; // vm实例的静态树节点
    var options = vm.$options; // 获取实例的配置对象
    var parentVnode = vm.$vnode = options._parentVnode; // 获取父占位符节点
    var renderContext = parentVnode && parentVnode.context; // 父节点有没有声明上下文
    vm.$slots = resolveSlots(options._renderChildren, renderContext)
    //将子vnode节点转成格式化后的对象，赋给实例的$slots属性
    vm.$scopedSlots = emptyObject; // 初始化$scopedSlots属性为空对象
    // 上面这几行代码是有关Vue解析并处理slot的

    // 在vm上添加了_c和$createElement方法，它们是对createElement函数的封装。vm._c是模板字符串被内部编译成渲染函数时调用的方法，vm.$createElement是手写渲染函数时可以调用的方法。用户在配置render选项时，render:h=>h('h2','xxx')，第一个参数接收createElement函数，用来创建vnode节点。也可以这么写: render:()=>this.$createElement('h2','xxx')，完全等价的。vm._c和vm.$createElement唯一区别是第六个参数alwaysNormalize不同，通过模板生成的渲染函数可以保证子节点都是vnode，手写的渲染函数需要一些校验和转换
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
    var parentData = parentVnode && parentVnode.data;
    // 在vue实例对象上使用defineReactive定义两个属性：$attrs和$listeners，为了更容易创建高阶组件。并且这两个属性是响应式的。另外，在非生产环境中调用defineReactive函数时传递的第四个参数是一个函数，实际上是一个自定义的setter，会在设置$attrs或$listeners属性时触发。当你设置$attrs属性时，如果!isUpdatingChildComponent为真，提示你$attrs是只读属性，不能设置它的值。同样的，对$listeners属性也做了这样的处理。
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
    // 对节点属性和事件监听器的响应处理保证了在生命周期过程中节点属性和事件状态的更新。
  }

  var currentRenderingInstance = null;

  function renderMixin(Vue) {
    // 给Vue原型添加一些渲染函数中用到的辅助方法
    installRenderHelpers(Vue.prototype)
    //如果需要在数据更新后对新的DOM做一些操作，但在同步代码中是获取不到更新后的DOM的，因为DOM还没重新渲染。$nextTick就是供你操作更新后的DOM的API，修改数据后调用$nextTick，将操作最新的DOM操作放在回调中，回调会延迟到下次DOM更新循环之后执行(即下一次微任务队列执行)，确保操作的是更新后的DOM。
    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this) // nextTick不止用在这，还用在nextTick(flushQueueWatcher)，这是将更新DOM的回调推入callbacks数组中。所以要想在$nextTick的fn中操作最新的DOM，就必须在修改数据之后调用$nextTick(fn)，这样callbacks数组中更新DOM的回调在fn之前，存在执行的先后。
    }
    // _render是调用渲染函数生成vnode节点，用户手写渲染函数时，接收的第一个参数是createElement函数。渲染函数本质是创建vnode树，即各种递归调用createElement函数，而createElment函数就是创建Vnode
    Vue.prototype._render = function () {
      var vm = this
      var render = vm.$options.render
      var _parentVnode = vm.$options._parentVnode
      // vm指向当前实例，获取当前vm.$options.render即渲染函数，获取当前vm的父vnode节点
      if (_parentVnode) { // 如果有父级vnode节点，定义并赋值实例的$scopedSlots属性
        vm.$scopedSlots = normalizeScopedSlots(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        )
      }
      vm.$vnode = _parentVnode // 给vm实例添加$vnode属性，记录实例的父vnode节点
      var vnode
      try {
        // currentRenderingInstance记录当前渲染的实例
        currentRenderingInstance = vm
        vnode = render.call(vm._renderProxy, vm.$createElement)
        // 执行渲染函数，并用call指定this为vm._renderProxy，render函数大概长这样：
        // vm.$options.render = function () {
        //   with(this){ return _c('div', [_v(_s(a))]) }
        // }
        // 函数使用with语句块指定了内部代码的执行环境为this，由于render函数调用时用call指定了this指向vm._renderProxy，所以with语句块内代码的执行环境就是vm._renderProxy，所以在with语句块内访问a就相当于访问vm._renderProxy的a属性，with语句块内访问变量将会被Proxy的has代理拦截，所以执行了has函数内的代码。打印警告，所以这个代理的作用就是在开发阶段给一个友好提示
      } catch (e) {
        handleError(e, vm, "render");
        // 返回出错的渲染结果，或前一个vnode对象，防止渲染错误导致的空白组件
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = null;
      }
      if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      // 在渲染函数出错时，返回空的注释vnode节点
      if (!(vnode instanceof VNode)) {
        if (Array.isArray(vnode)) {
          warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
        }
        vnode = createEmptyVNode();
      }
      // 设置父vnode节点
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  function ensureCtor (comp, base) {
    if (comp.__esModule || (hasSymbol && comp[Symbol.toStringTag] === 'Module')) {
      comp = comp.default;
    }
    return isObject(comp) ? base.extend(comp) : comp
  }

  function createAsyncPlaceholder(factory, data, context, children, tag) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data, context, children, tag };
    return node
  }

  function resolveAsyncComponent(factory, baseCtor) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }
    if (isDef(factory.resolved)) {
      return factory.resolved
    }
    var owner = currentRenderingInstance;
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      // already pending
      factory.owners.push(owner);
    }
    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }
    if (owner && !isDef(factory.owners)) {
      var owners = factory.owners = [owner];
      var sync = true;
      var timerLoading = null;
      var timerTimeout = null;
      owner.$on('hook:destroyed', function () { return remove(owners, owner); });
      var forceRender = function (renderCompleted) {
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate();
        }
        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };
      var resolve = once(function (res) {
        // cache resolved
        factory.resolved = ensureCtor(res, baseCtor);
        // invoke callbacks，only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });
      var reject = once(function (reason) {
        warn("Failed to resolve async component: " + (String(factory)) + (reason ? ("\nReason: " + reason) : ''));
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });
      var res = factory(resolve, reject);
      if (isObject(res)) {
        if (isPromise(res)) {
          // () => Promise
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isPromise(res.component)) {
          res.component.then(resolve, reject);
          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }
          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }
          if (isDef(res.timeout)) {
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject("timeout (" + (res.timeout) + "ms)");
              }
            }, res.timeout);
          }
        }
      }
      sync = false;
      // return in case resolved synchronously
      return factory.loading ? factory.loadingComp : factory.resolved
    }
  }


  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }


  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  // 模版编译阶段，可以得到某个标签上的所有属性，包括v-on或@注册的事件，整个模版会编译成渲染函数(一些嵌套在一起的创建vnode节点的函数)，类似这样：_c('div'...)。当渲染流程启动后，渲染函数执行生成一份vnode，随后patch函数会使用vnode进行对比和渲染，这个过程中会创建一些元素，此时会判断当前标签是真的标签还是一个组件，如果是组件标签，则会将子组件实例化并传入一些参数，其中包括父组件在模版中使用v-on注册在子组件标签上的事件；如果是一般标签，则创建元素并插入到dom中，同时将v-on注册的事件注册到浏览器事件中。简而言之，组件标签上的v-on注册的事件会注册到子组件的事件系统中，如果是一般标签上的v-on，事件会被注册到浏览器事件中。
  // 子组件在初始化时，即初始化vm时，可能会接收父组件向子组件注册的事件，而子组件自身在模版中注册的事件，只有在渲染时才会根据vnode的对比结果来确定是注册事件还是解绑事件，所以在初始化实例时，事件的初始化指的是父组件在模版中使用v-on监听子组件内触发的事件。
  function initEvents (vm) {
    vm._events = Object.create(null); // vm实例挂载_events属性，是对象，保存所有用$on注册的事件
    vm._hasHookEvent = false; // 给vm添加_hasHookEvent属性，初始化为false
    var listeners = vm.$options._parentListeners // 初始化父级附属事件
    //在模版编译阶段，当模版解析到组件标签时，会实例化子组件，同时将组件标签注册的事件解析成对象，并通过参数传递给子组件，所以当子组件被实例化时，可以在参数中获取父组件向自己注册的事件，这些事件保存在vm.$options._parentListeners属性
    if (listeners) { //如果父级有注册了事件回调，意味着父组件有向自己注册事件，则更新当前组件的事件回调对象，即把事件注册到当前组件实例中。
      updateComponentListeners(vm, listeners);
    }
  }

  var target; // 引用组件实例
  function add(event, fn) { // 添加事件处理回调
    target.$on(event, fn);
  }
  function remove$1(event, fn) {// 移除事件处理回调
    target.$off(event, fn);
  }

  // 创建一次性的事件回调函数
  function createOnceHandler(event, fn) { // event是事件名，fn是处理回调
    var _target = target;
    return function onceHandler () {
      var res = fn.apply(null, arguments); // 调用事件回调fn，返回值赋给res
      if (res !== null) { // res如果不为空，移除事件绑定的回调
        _target.$off(event, onceHandler);
      }
    }
  }

  // 更新组件的事件监听回调，接收实例vm，新旧的存放监听回调的对象
  function updateComponentListeners(vm, listeners, oldListeners) {
    target = vm; // 将vm组件实例赋给target
    updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm)//执行更新事件回调函数，传入新旧事件回调对象，添加事件和移除事件函数，实例vm
    target = undefined; // 重置target
  }

  function eventsMixin (Vue) { //接收Vue构造函数
    var hookRE = /^hook:/; // 匹配以hook:开头的字符串
    //Vue的原型方法$on，给当前实例注册一个自定义事件，事件由$emit触发，回调函数会接收所有$emit函数的额外参数
    Vue.prototype.$on = function (event, fn) { //event接收事件名字符串或数组，fn接收处理回调
      var vm = this;
      if (Array.isArray(event)) { // 如果event参数接收的是数组，遍历数组
        for (var i = 0; i < event.length; i++) { 
          vm.$on(event[i], fn);// 为每个事件递归调用$on，注册事件回调
        }
      } else { //event参数是字符串，检查该事件的事件回调列表是否存在，已存在则直接push事件回调fn进去
        (vm._events[event] || (vm._events[event] = [])).push(fn) // 事件的回调列表是一个数组
        if (hookRE.test(event)) { 
          vm._hasHookEvent = true;
        }// vue提供了一种在组件中添加生命周期钩子的方式：在模版中通过v-on/@指令注册事件:@hook:created=".."，这个以hook:开头的事件就会被当作hookEvent，注册事件回调后，将vm._hasHookEvent置为true，因此当callHook(vm,'created')执行时，callHook内会判断vm._hasHookEvent，如果为true，执行vm.$emit('hook:created')，触发hook:created事件。所以给组件添加生命周期函数有3种办法：1在vue选项中添加；2在模版中通过@hooks:created注册事件；3直接vm.$on('hooks:created',cb)或者vm.$once('hooks:created',cb)
      }
      return vm
    };

    // $once函数是对$on函数的包装，不同于$once的是，它注册的事件是一次性的，即事件回调只触发一次，触发之后，事件就会被移除。移除的时机是，事件回调执行时，会调用$off将监听回调从事件列表中移除。
    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () { //定义一个on函数，它作为事件的回调
        vm.$off(event, on); // on函数执行时，先调用$off移除事件回调on，即本身函数，这样以后就不会再监听event
        fn.apply(vm, arguments);// 保证fn的正常执行
      }
      on.fn = fn; // 真正的回调fn挂载到函数on上，保证on能正确找到fn函数，注意到$off函数中，移除指定事件的用户指定回调fn，如果fn和事件回调列表中的cb相同，列表中的cb会被移除，但这就够了吗？我们知道通过$once注册的事件回调是改造后的函数on，它肯定和用户提供的fn不同，但这并不意味着回调on不需要被移除，所以当执行$off遍历事件回调列表时，也会检查回调的fn属性是否和用户提供的fn相同，如果相同，移除这个通过$once注册的事件回调
      vm.$on(event, on); // 函数on注册为事件的回调
      return vm
    };

    // 为Vue原型挂载$off方法，传入事件字符串或数组，和fn，移除事件的监听回调fn
    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      if (!arguments.length) {// 如果没有传参数，则清除当前组件的所有事件
        vm._events = Object.create(null);// 将vm._events置为空对象
        return vm
      }
      if (Array.isArray(event)) { //第一个参数传入的是数组，则遍历这个事件名组成的数组
        for (var i$1 = 0; i$1 < event.length; i$1++) {
          vm.$off(event[i$1], fn); //逐个递归调用$off函数。移除事件的回调
        }
        return vm
      }
      var cbs = vm._events[event]; //如果指定的是单一事件，将事件的回调数组赋给cbs
      if (!cbs) return vm // 该事件没有注册回调，什么都不做，直接返回实例vm
      if (!fn) { //如果没有指定监听回调fn，则将该事件名的所有回调移除
        vm._events[event] = null; //_events中该事件对应的回调数组置为null
        return vm
      }
      // 指定了事件名和回调fn，则遍历事件回调组成的数组cbs，移除fn。
      var cb, i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) { // 如果当前遍历的cb或cb.fn和想要移除的fn相同，则调用splice方法将cbs数组中的cb去掉。因为真正的事件回调存在于cb或cb.fn
          cbs.splice(i, 1);
          break // 已经移除想要移除的回调，终止循环
        }
      }// 注意的是，cbs的遍历是从后往前的，如果从前往后遍历，在移除当前的回调时，会影响后面未被遍历到的回调，它们位置前移，会出现数组塌陷的问题。
      return vm
    };

    // 自定义事件的原理是父组件经过编译模板后，会将定义在子组件上的自定义事件及其回调通过$on添加到子组件的_events对象中，当子组件通过$emit触发自定义事件时，会执行_events中对应的回调函数xxx，并传入$emit的额外参数。只是因为回调函数xxx是在父组件作用域内定义的，所以看起来就像是父子组件之间通信。
    Vue.prototype.$emit = function (event) {
      var vm = this;
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        //如果传入的事件名是驼峰形式，并且它的小写版事件有事件回调，则提示事件已注册，且无法使用驼峰式注册事件
        tip(`事件"${lowerCaseEvent}"被emitted在组件${formatComponentName(vm)}中。但是事件回调是为"${event}"注册的。注意，HTML属性不区分大小写，在DOM模版中使用v-on时不能传驼峰命名的事件名。你应该使用连字符形式的"${hyphenate(event)}"而不是驼峰形式的"${event}"`)
      }
      var cbs = vm._events[event];// 事件event的事件回调列表 赋给cbs
      if (cbs) { // 如果事件的回调列表存在，将数组中的回调遍历执行
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1); //获取$emit的event参数之后的参数组成的数组
        const info = `event handler for "${event}"`
        for (var i = 0; i < cbs.length; i++) { // 事件回调依次执行，并传入数组args
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm // 注意到：$on、$off、$emit函数都是返回组件实例vm
    };
  }

  var activeInstance = null; // activeInstance指向当前正在渲染的实例
  var isUpdatingChildComponent = false;
  // 将传入的vm赋给activeInstance，当前活跃的实例，返回一个函数，函数执行将activeInstance恢复为上一个活跃实例
  function setActiveInstance(vm) {
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    return () => { activeInstance = prevActiveInstance }// 这里用了闭包
  }

  function initLifecycle (vm) {
    var options = vm.$options;
    var parent = options.parent;// parent引用当前实例的父实例
    if (parent && !options.abstract) { //如果父实例存在，且当前实例不是抽象的，则开启while循环，循环的条件是父组件是抽象的，且父组件也有自己的父组件，则将父组件的父组件实例赋给parent，也就是，不断向上查找，直到遇到不抽象的父组件或抽象的但没有父组件的父组件。将当前组件实例vm推入这个父组件的$children
      while (parent.$options.abstract && parent.$parent) { 
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }
    // 如果options.abstract为真，说明当前实例是抽象的，不会执行if语句，直接设置vm.$parent和vm.$root。说明抽象实例不会被添加到父实例的$children中。如果abstract为假，说明当前实例不是抽象的，是一个普通的组件实例，因为抽象组件不能作为父级，开启while循环，目的是逐层向上寻找，找到第一个不抽象的实例作为父级，并将当前实例添加到父实例的$children属性中
    vm.$parent = parent;// 设置当前实例的$parent属性，指向父级
    vm.$root = parent ? parent.$root : vm; //如果没有父组件，根组件就是自己，如果有父组件，vm.$root就取父组件的$root。
    // 总结：将当前vm添加到父实例的$children属性里，并设置当前vm的$parent指向父实例
    vm.$children = [];
    vm.$refs = {} //一个实例的$refs对象，存放组件中所有使用了ref属性的{ref值:组件实例/DOM节点}
    vm._watcher = null; // 记录vm实例的渲染函数的watcher
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  //lifecycleMixin函数执行，会给Vue原型添加_update、$forceUpdate、$destroy方法
  function lifecycleMixin(Vue) {
    // _update的核心是__patch__方法，将vnode渲染成真实DOM/更新DOM是靠它完成。调用vm.__patch__前后会做一些处理
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this
      // vm指向当前实例，当组件未挂载时，vm.$el指向挂载点元素，vm._vnode是实例的旧的根vnode节点，将当前vm赋给activeInstance，将传入的vnode赋给vm._vnode，更新vm的根vnode节点
      var prevEl = vm.$el
      var prevVnode = vm._vnode
      var restoreActiveInstance = setActiveInstance(vm)
      vm._vnode = vnode
      // 如果不存在旧的根vnode节点，说明这是首次渲染，调用__patch__方法返回真实DOM节点赋给vm.$el，如果存在旧的根vnode节点，执行更新操作，返回真实DOM节点赋给vm.$el。然后把activeInstance恢复为原来那个
      if (!prevVnode) {
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false/*removeOnly*/)
      } else {
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance()
      if (prevEl) prevEl.__vue__ = null;
      if (vm.$el) vm.$el.__vue__ = vm;
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) vm.$parent.$el = vm.$el;
    };
    // 迫使当前实例重新渲染（包括插入插槽的子组件）
    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) { // 如果vm实例有渲染函数的watcher，执行watcher的update方法，重新渲染
        vm._watcher.update(); //当数据变化时，自动重新渲染，但这里是手动的去触发重新渲染
      } // 之所以要判断，是因为只有在非服务端渲染下，才会有渲染函数的watcher，即组件的watcher
    };
    // 完全销毁一个vue实例，不太推荐使用，最好用v-if v-for指令以数据驱动的方式控制组件的生命周期
    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) return // 正在被销毁，直接返回，不重复销毁
      callHook(vm, 'beforeDestroy'); // 销毁前调用beforeDestroy钩子函数
      vm._isBeingDestroyed = true;
      // 将自己从父组件的$children数组中删除
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // 实例的渲染函数的watcher，会被它依赖的数据属性的dep所收集，现在要从他们那删掉自己，不再需要通知这里重新渲染了
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      // 用户可能自行$watch了一些状态，自定义的这些watcher也要销毁
      var i = vm._watchers.length; //遍历组件的所有的watcher实例
      while (i--) { // 逐个执行teardown方法，就能将watcher实例从它监听的状态的dep中移除
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      vm._isDestroyed = true; // 表明这个组件已经被销毁

      vm.__patch__(vm._vnode, null); // 调用patch方法将空的vnode树渲染成真实的dom，vm._vnode代表旧的vnode，null代表新的vnode是null
      
      callHook(vm, 'destroyed');// 触发destroyed钩子
     
      vm.$off(); // 移除所有的实例上的事件监听器
      if (vm.$el) { // 在vm._update执行时，即将虚拟vnode渲染成真实dom时，会给vm.$el添加__vue__属性，值为当前vm实例，现在要把它设为null
        vm.$el.__vue__ = null; 
      }
      // 释放循环引用，这是为什么？ (#6759)
      if (vm.$vnode) { // 如果当前实例vm的父节点的vnode存在，则将父节点的父节点置为null
        vm.$vnode.parent = null;
      }
    };
  }
  // 更新子组件
  function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
    isUpdatingChildComponent = true;
    var newScopedSlots = parentVnode.data.scopedSlots;
    var oldScopedSlots = vm.$scopedSlots;
    var hasDynamicScopedSlot = !!(
      (newScopedSlots && !newScopedSlots.$stable) ||
      (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
    );
    var needsForceUpdate = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      hasDynamicScopedSlot
    );
    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // updatevm's placeholder node without re-render
    if (vm._vnode) { // updatechild tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      vm.$options.propsData = propsData;
      // vm.$options.propsData的更新是在调用 validateProp 之后，所以组件更新之前 vm.$options.propsData是上一次组件更新或创建时的数据
    }

    // updatelisteners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // resolve slots + force updateif has children
    if (needsForceUpdate) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    isUpdatingChildComponent = false;
    // isUpdatingChildComponent初始值为false，只有当updateChildComponent函数开始执行时被更新为true，执行结束时又将值还原为false。因为updateChildComponent需要更新实例对象的$attrs和$listeners属性，所以此时不需要提示$attrs和$listeners是只读属性。
  }

  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) return true 
    }
    return false
  }

  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated');
    }
  }

  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) return
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated');
    }
  }

  function callHook(vm, hook) { // 当前vm实例 和 生命周期函数名称
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget(); // 这是为什么？
    var handlers = vm.$options[hook]; // 获取钩子函数数组，注意 已经是数组了
    var info = hook + " hook";
    if (handlers) {
      handlers.forEach(handler => { // 遍历钩子数组，执行每一个钩子
        invokeWithErrorHandling(handler, vm, null, vm, info);
      })
    }
    if (vm._hasHookEvent) { //当前组件注册有hookEvent，调用emit派发'hook:' + hook这个事件
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  var MAX_UPDATE_COUNT = 100;
  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false;
  var index = 0;

  // 重置queue相关的状态，queue队列清空，activatedChildren数组清空，index为0，即当前执行的watcher在queue的索引归零。记录入列的watcher的id的has对象也置空，记录多次入列的watcher的入列次数的circular对象也置空，变量waiting恢复为false，意味着可以执行nextTick(flushSchedulerQueue)将回调推入到callbacks数组中。flushing置为false，意味着queue执行更新完毕，即flushSchedulerQueue执行完
  function resetSchedulerState() {
    index = queue.length = activatedChildren.length = 0; 
    has = {}
    circular = {}
    waiting = flushing = false;
  }

  var currentFlushTimestamp = 0;

  var getNow = Date.now;

  if (inBrowser && !isIE) {
    var performance = window.performance;
    if ( performance &&
      typeof performance.now === 'function' &&
      getNow() > document.createEvent('Event').timeStamp
    ) {
      getNow = function () { return performance.now(); };
    }
  }

  function flushSchedulerQueue() {
    currentFlushTimestamp = getNow(); // 当前清空异步watcher队列的时间戳
    flushing = true; // 当执行flushSchedulerQueue，flushing置为true
    var watcher, id;

    queue.sort((a, b) => a.id - b.id);
    // 在执行队列中的watcher之前，先将watcher按其id从小到大排序，这是为了保证：
    // 1. 确保组件的更新是先父组件再子组件，因为父组件总是在子组件之前创建，父组件的Watcher也是先于子组件的Watcher创建的，早创建的watcher的id因此比较小。
    // 2. 确保一个组件的用户自定义的watcher在渲染函数的watcher之前求值，因为前者创建的比较早，initState中的initWatch时，初始化watch选项创建watcher实例，而渲染函数的watcher的创建是$mount中的mountComponent中，
    // 3. 如果一个组件在它的父组件的watcher执行时被摧毁了，这个组件的watcher就没必要执行，可以跳过

    // 遍历queue队列中所有的watcher，执行watcher的run方法，不从queue的最后一项开始遍历，因为在执行现有的watcher的过程中可能会有更多watcher入列，不希望缓存queue的长度。如果其中某个watcher有before方法，则先执行它，它其实是执行beforeUpdate钩子函数，然后再watcher的run方法。获取当前遍历的watcher的id，清楚has对象里记录入列的watcher的该id，然后执行run方法(重新求值)
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      if (watcher.before) watcher.before()
      id = watcher.id;
      has[id] = null;
      watcher.run(); 
      // 如果清除了has对象中的该id后，它还存在该id，说明出现这种情况：循环调用update，即循环调用queueWatcher让该watcher入列了。用circular对象记录这个watcher执行update方法的次数，即记录了它入队的次数，如果超过100次，则提示：有一个无限循环的update。接着跳出queue的遍历执行。
      if (has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn('You may have an 无限的update循环 ' + (watcher.user
            ? `in watcher with expression "${watcher.expression}"`
            : `in a component render function.`), watcher.vm)
          break
        }
      }
    }

    // 保存一份过去的queue的副本，在重置状态之前
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice(); //updatedQueue存一份已经更新过的queue

    resetSchedulerState(); // 对queue相关的变量重置

    for (var i = 0; i < activatedQueue.length; i++) {
      activatedQueue[i]._inactive = true;
      activateChildComponent(activatedQueue[i], true /* true */);
    }

    var i = updatedQueue.length;
    while (i--) {
      const watcher = updatedQueue[i];
      const vm = watcher.vm
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'updated');
      }
    }
    // 遍历已执行更新的queue中的watcher，获取watcher的vm属性，即该watcher所在的组件实例vm，如果queue中的watcher存在某一个是当前组件的渲染函数的watcher。而且实例挂载好了且没有销毁，所以当前组件的渲染函数的watcher也run完了，执行更新完毕，该调用updated钩子函数

    // devtool hook
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  function queueActivatedComponent (vm) {
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  //watcher监听的数据变化->setter->dep notify->watcher update->queueWatcher。watcher被push进队列queue，调用nextTick注册一个微任务flushSchedulerQueue，用来清空执行queue中的watcher
  function queueWatcher (watcher) {
    var id = watcher.id
    if (has[id]) return
    has[id] = true
    // watcher有唯一的id，has对象利用id记录已经入queue的watcher，比方有多个数据都发生了变化，它们有一个共同的watcher，就会出现queueWatcher让同一个watcher入列，会直接返回，避免了watcher重复入列，不用多次对它执行run重新求值
    if (!flushing) {
      queue.push(watcher);
    } else { // 队列在执行更新的过程中，为什么会有watcher入列？(这里我没懂)
      var i = queue.length - 1; 
      while (i > index && queue[i].id > watcher.id) {
        i--; 
      }
      queue.splice(i + 1, 0, watcher)
    }
    // flushing代表是否正在执行flushQueue，如果它为false，即没有正在执行更新，待入列的watcher直接push到queue队尾即可；相反，如果队列正在执行更新，此时还是可能会有watcher入列，入列的watcher需要考虑插入的位置，从队尾开始遍历，index是当前正在执行的watcher在queue中的索引，从后往前，遇到id比待插入的watcher的id大的，就将i--，前挪，直到遇到id比待插入的watcher的id小的，那就插入在它后面。或者i已经减小到比index小了，即已经前挪到当前执行的watcher的前面了，那就插入到i+1，下一个就执行插入的这个watcher
    if (!waiting) {
      waiting = true;
      if (!config.async) { // 同步执行更新
        flushSchedulerQueue() // 立即调用flushSchedulerQueue执行并清空队列
        return
      }
      nextTick(flushSchedulerQueue); 
    }
    // waiting默认为false，首次执行queueWatcher会进入if语句，但进来马上变true，所以在变回false之前不管怎么调用queueWatcher也不会进入if语句，这保证了nextTick(flushSchedulerqueue)只执行一次，即flushSchedulerqueue只会被推入callbacks数组一次。等到flushSchedulerQueue执行完，即queue中的watcher执行更新并清空完，waiting才恢复为false
    // nextTick把flushSchedulerQueue包成一个新函数然后推入callbacks数组中，由于waiting，它只会被推入一次，nextTick还会将flushCallback注册到微任务队列中
  }

  var uid$2 = 0;
  class Watcher {
    constructor(vm, expOrFn, /*被观察的目标*/ cb, /*当被观察的目标的值变化时的回调函数*/ options, /*创建watcher实例的选项*/ isRenderWatcher /*观察的是否是渲染函数*/) {
      this.vm = vm // 每个watcher都有一个vm实例属性，代表该watcher属于哪个组件
      if (isRenderWatcher) { //如果创建的是渲染函数的watcher(属于组件级别的)
        vm._watcher = this // 把当前watcher赋给vm._watcher，它会监听组件内所有的状态
      }
      vm._watchers.push(this) //vm._watchers数组存放当前组件的所有watcher
      if (options) {
        this.deep = !!options.deep; //是否深度观测对象内部值的变化，使用watch选项或调用$watch可以指定deep的真假
        this.user = !!options.user; //除了渲染函数的watcher和计算属性的watcher是Vue内部创建的，其他都是开发者定义的
        this.lazy = !!options.lazy //是否是计算属性的watcher。它是Vue内部在实现计算属性时创建的watcher，并非指观察某个计算属性的watcher
        this.sync = !!options.sync //当数据变化时是否同步求值并执行回调。默认为false
        this.before = options.before // watcher的before属性值是执行beforeUpdate的函数，调用时机在数据变化之后，触发更新之前
      } else {
        this.deep = this.user = this.lazy = this.sync = false;
      }
      this.cb = cb;
      this.id = ++uid$2; // watcher的唯一标识
      this.active = true; // 是否是激活状态
      this.dirty = this.lazy; // dirty初始值和lazy相同
      this.deps = []; // watcher实例的属性deps，是一个存放的Dep实例的数组
      this.newDeps = [];
      this.depIds = new Set();
      this.newDepIds = new Set();
      this.expression = expOrFn.toString(); // 表达式expOrFn的字符串表示
      if (typeof expOrFn === 'function') { //expOrFn如果是函数，直接把它作为this.getter
        this.getter = expOrFn;
      } else { // expOrFn不是函数，则传入parsePath函数执行，执行返回的函数作为this.getter
        this.getter = parsePath(expOrFn); //parsePath返回的函数的作用就是求expOrFn表达式的值
        if (!this.getter) { // expOrFn表达式不合法，parsePath返回undefined，报警提示开发者
          this.getter = noop; // this.getter赋为一个noop函数，可见this.getter肯定是函数
          warn(`读取路径${expOrFn}失败，Watcher只接受用"."分割的路径，或请使用函数`, vm);
        }
      }
      // 计算属性的watcher在创建时不会执行this.get()，其他watcher的创建都会直接执行this.get()
      this.value = this.lazy ? undefined : this.get(); //watcher实例的value保存被观测目标的值
    }
    get() { // 对被观察目标的求值
      pushTarget(this) // 将当前watcher实例赋给Dep.target，并推入targetStack数组
      // 在执行下面的this.getter之前调用pushTarget，保证了Dep.target的存在
      var value // 定义value，接收被观察目标的求值，最后返回value
      var vm = this.vm
      try {
        value = this.getter.call(vm, vm) // 执行this.getter，即对被观察目标的求值，返回值赋给value
        // 创建watcher对被观察的目标进行求值，目的是触发数据属性的get，从而数据属性的dep收集watcher
        // 以渲染函数的watcher为例，假如模版使用了属性name，模版编译成渲染函数，渲染函数的执行会读取name，触发name的get函数，在get函数中首先判断Dep.target是否存在，如果存在则调用dep.depend收集依赖。因为渲染函数的watcher的创建要执行this.get()，get方法中，pushTarget(this)比this.getter()先调用，所以this.getter执行时，此时Dep.target存在
      } catch (e) {
        if (this.user) {
          handleError(e, vm, `getter for watcher "${this.expression} "`)
        } else {
          throw e
        }
      } finally { // 假设观察的对象a它有嵌套对象b，new Watcher时，会读取属性a的值，触发a的get函数，a的dep收集依赖，但因为没有读取a.b的值，所以b没有收集任何watcher，所以修改a.b的值无法像修改a的值那样触发依赖。要想实现深度观察，即观察对象a内部的值变化，只要在创建watcher时，在this.get()中对a求值之余再读取一下a.b的值，触发a.b的get，就能收集到当前watcher。所以如果传了deep:true，就指定了expOrFn需要深度观察。实现方式是调用traverse，传入被观察的目标的值
        if (this.deep) {
          traverse(value)// 递归地读取expOrFn值的所有子属性的值，这样所有子属性都会收集到同一个watcher
        }
        popTarget() // 求值完后，Dep.target恢复为原来的watcher
        this.cleanupDeps(); // 每次求值之后，调用cleanupDeps方法
      }
      return value
    }
    // watcher的创建是通过对被观察的目标的求值来使被观察的目标的dep收集到自己（watcher）
    addDep(dep) { // addDep方法的调用者是Dep.target，传入的参数是监听的数据属性的dep实例
      var id = dep.id; // dep实例有自己唯一的id
      if (!this.newDepIds.has(id)) {// newDepIds集合中没有该id，说明该dep实例在本次求值中还没收集过Dep.target
        this.newDepIds.add(id); // 往newDepIds集合添加一下这个id
        this.newDeps.push(dep); // 往newDeps数组添加一下这个dep实例
        if (!this.depIds.has(id)) { // depIds集合没有该id，说明上次求值中该dep实例没有收集这个Dep.target
          dep.addSub(this); // this指向Dep.target，Dep.target被添加到传入的dep实例的subs数组中
        }
      }
      // 假如模版里连着两次引用name，那么渲染函数的执行(一次求值)将两次读取name的属性值，必然会触发两次name的get，name的dep两次调用depend，导致收集两次Dep.target，这就是：一次求值中同一个依赖被某个数据的dep收集多次，所以我们不直接调用dep.addSub收集依赖，而是先调用Dep.target.addDep方法，在addDep中，判断传入的dep是否在本次求值已经传入过，如果是，说明该dep已经收集过Dep.target，什么都不做，如果没有，说明是新的dep，把dep的id和dep本身分别添加到newDepIds和newDeps中。因此一次求值中，无论一个数据属性被读取几次，它的dep只会收集一次观察它的watcher。
      // 每次求值(this.getter执行)结束，都会调用cleanupDeps，清空newDepsIds和newDeps，但在清空之前会把它们的值分别赋给depIds和deps，因此后者保存了上一次求值的newDepsId和newDep的值。在本次求值中，还会判断传进来的dep是否存在于上次求值的deps中，如果存在，说明上次求值这个dep已经收集过Dep.target，这次就不用再收集了，如果不存在，说明上次和本次求值这个dep都没有收集Dep.target，就让它收集。所以两次if判断的目的是防止一次求值收集重复依赖和多次求值收集重复依赖，newDepIds和newDeps存的总是当下求值所收集的dep对象和id，depIds和deps存的总是上一次求值中收集到的dep对象和id
    }
    cleanupDeps() { // 每次求值后，调用cleanupDeps方法
      let i = this.deps.length // this.deps数组存放的是上一次求值所收集到的dep实例
      while (i--) { //遍历上次求值收集到的dep
        const dep = this.deps[i]
        if (!this.newDepIds.has(dep.id)) { // 如果上次求值的这个dep在本次求值收集的dep中不存在
          dep.removeSub(this) // 说明本次求值中该dep和当前watcher不存在关系了，即该数据属性的dep没有收集当前watcher，即该数据不再在这被依赖了，应当将当前watcher从该dep中移除
        }
      }// 比如，一段模版中用了v-if，就可能出现本次求值某个属性不再被使用，渲染函数的watcher不用监听它了，就把watcher从这个属性的dep中移除。
      var tmp = this.depIds;
      this.depIds = this.newDepIds;
      this.newDepIds = tmp;
      this.newDepIds.clear();
      tmp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = tmp;
      this.newDeps.length = 0;
      // 每次求值后，depIds和newDepIds交换，deps和newDeps交换，newDepIds清空，newDeps数组清空
    }
    update() { //数据属性的set被触发时，它的dep调用notify，dep中所有的watcher都调用update
      if (this.lazy) { // 如果是计算属性的watcher，计算属性依赖的数据变化时，它们的set被触发，把dep存的watcher都执行update，其中包括了计算属性watcher，不会马上求值，只是将dirty置为true
        this.dirty = true; // 代表未来读取到计算属性时要重新求值，而不是使用缓存值
      } else if (this.sync) { //如果snyc为真，依赖项发生改变，update执行直接调用run()
        this.run(); //立即计算被观察的目标的值
      } else { // 不是立即调用run求值，而是将当前watcher推入一个队列中等待下一次tick时重新求值
        queueWatcher(this);
      } // 渲染函数的watcher的创建时没有传snyc，snyc默认为false，因此执行queueWatcher
    };
    run() { //被观察的目标发生变化，不管是同步更新or异步更新，更新变化的操作都是通过执行run方法
      if (!this.active) return // 如果watcher已经执行了teardown，不再观察任何状态了
      // 我们知道new Watcher时传入了cb，即被观察的目标变化后的回调，所以重新求值时run函数里肯定要执行cb，但对渲染函数的watcher而言，cb是什么都不做的noo。实际上重新求值并不是靠cb的执行
      var value = this.get(); // this.get()意味着重新求值。创建渲染函数的watcher时，第二个参数传入updateComponent，重新求值意味着updateComponent执行，vm._update(vm._render(),hydrating)渲染函数执行生成vnode，再渲染真实DOM完成重新渲染。而updateComponent没有返回值，所以对渲染函数的watcer来说，this.get()的返回值就是undefined，变量value和this.value都是undefined，所以不用执行下面的if语句块，它是给非渲染函数的watcher准备的。
      // 对被观察的目标重新求值不意味着一定执行回调cb，要看下面几个条件：
      if (value !== this.value || isObject(value) || this.deep) {
        // value是重新求值的新值，this.value是旧值，如果新值和旧值不一样，需要调用cb
        // 假如新值为对象，即使新值等于旧值，也要执行cb，因为此处相等是引用的相等，内容可能改变了
        var oldValue = this.value; // 用oldValue存一下旧值
        this.value = value; // this.value更新为新值
        if (this.user) { // 如果当前watcher是开发者定义的，即通过watch选项或$watch创建的watcher，这些watcher的cb是开发者编写的，行为不可预知，所以用try...catch包裹一下，发生错误时能给开发者一个友好的提示
          try { // 开发者编写的回调可以接收被观察目标的新值和旧值，新值在前，旧值在后。
            this.cb.call(this.vm, value, oldValue) // 执行cb回调
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else { // 不是用户创建的watcher，即渲染函数的watcher或计算属性的watcher
          this.cb.call(this.vm, value, oldValue) // 直接执行回调
        }
      }
    };
    // 只有计算属性的watcher才会调用的evaluate方法，在没有执行evaluate之前，计算属性的watcher的value属性值为undefined，执行了之后，value属性保存了计算属性的求值结果，作为缓存值。
    evaluate() { 
      this.value = this.get()
      this.dirty = false; // 计算属性求值完，dirty置为false
    };
    // watcher的depend方法只有计算属性的watcher才会调用，计算属性被读取时，计算属性的getter被触发，计算属性的watcher会调用depend，将watcher的deps数组中所有的dep执行depend，让它们收集依赖(使用了计算属性的那个watcher，一般是渲染函数的watcher)
    depend() {
      let i = this.deps.length
      while (i--) {
        this.deps[i].depend()
      }
    };
    // 将自己(watcher)从所有依赖项的dep中移除，移除后，当状态发生变化时，watcher不会收到通知
    teardown() {
      if (this.active) { // 如果当前watcher处于活跃状态，可以执行teardown
        if (!this.vm._isBeingDestroyed) { // 如果当前组件实例不是正在被销毁，仍然存在，组件实例有个_watchers属性，存放当前组件的所有watcher，当前watcher不再监听状态的变化，第一步就是把当前watcher从_watchers数组中移除，这是解除状态和watcher之间关系的第一步。由于这个操作的性能开销比较大，所以仅在组件没有正在被销毁的情况下才会执行。
          remove(this.vm._watchers, this);
        }
        let i = this.deps.length //watcher实例的deps数组，存放它依赖的所有状态的dep实例 
        while (i--) { // 遍历deps数组，将每个dep实例中的自己这个watcher移除
          this.deps[i].removeSub(this)
        } // 为一个属性创建了watcher后，属性的dep实例会收集这个watcher，同时watcher的deps数组也会将这个属性的dep实例收集，这是一个双向的关系。如果一个watcher同时观察多个属性，则它的deps数组就会有这些属性的dep实例，所以解除属性和watcher之间的关系，需要将watcher从每个属性的dep实例中移除，移除后，当数据变化，就不会触发这个watcher
        this.active = false; // 执行完teardown了，active改为false，避免重复teardown
      }
    };
  }

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function initState (vm) {
    vm._watchers = [] // 记录vm实例的所有watcher，包括渲染函数的和非渲染函数的
    var opts = vm.$options
    if (opts.props)
      initProps(vm, opts.props); // 初始化props，opts.props是经过规范化后的
    if (opts.methods)
      initMethods(vm, opts.methods); // 初始化methods
    if (opts.data) { // 如果有data，初始化data
      initData(vm);
    } else { //如果开发者没有传data选项，则将{}赋给vm._data，对它进行观测
      observe(vm._data = {}, true/*根data*/) // 根data是一个空对象
    }
    if (opts.computed)
      initComputed(vm, opts.computed); // 初始化computed
    if (opts.watch)
      initWatch(vm, opts.watch);// 初始化watch
  }

  function initProps(vm, propsOptions) { // propsOptions是规范化后的props选项对象
    var propsData = vm.$options.propsData || {}//propsData保存来自父组件的真实props数据
    var props = vm._props = {} // 定义props常量和vm._props属性，初始值为空对象
    vm.$options._propKeys = []; // 在vm.$options上添加_propKeys属性，值为一个空数组
    var isRoot = !vm.$parent; // 标识是否为根组件，vm.$parent不存在说明是根组件。
    if (!isRoot) { // 如果不是根组件，就不需要将props响应式化，根组件才要深度观测prop值
      toggleObserving(false) // 因为非根组件的prop数据的响应式与否是由父组件决定的
    }
    for (var key in propsOptions) { // 遍历props选项对象，key为prop名
      vm.$options._propKeys.push(key); // 将prop名推入vm.$options._propKeys数组中
      var value = validateProp(key, propsOptions, propsData, vm);
      // 校验prop名对应的prop数据的类型是否符合预期，并返回相应的prop的值(可能是默认值)
      var hyphenatedKey = hyphenate(key); // HTML中的属性名是大小写不敏感的，浏览器会把所有大写字符解释为小写字符，这意味着prop名用驼峰命名法，但在模板中要用连字符写法
      if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) { // 模板中的prop属性不能是Vue保留的属性：key,ref,slot,slot-scope,is，也不能是style,class
        warn((hyphenatedKey + "不能使用保留的属性名作为prop名"), vm)
      }
      // 调用defineReactive将prop定义到vm._props对象上，定义为响应式属性，并且是深度观测
      defineReactive$$1(props, key, value, () => { //customSetter，修改属性值时触发
        if (!isRoot && !isUpdatingChildComponent) { //如果当前不是根组件，且不是正在更新子组件，提示不要直接修改prop值
          warn(`不要直接修改一个prop，因为每当父组件重新渲染时，prop值就会被覆盖："${key}"`, vm)
        }
      })
      // props本质上和data一样，不同的是数据来源，data定义在组件自身，props数据来自父组件
      if (!(key in vm)) { // 如果key这个prop在vm和它的原型链上没有定义
        proxy(vm, "_props", key) // 则让vm代理vm._props中的prop，通过vm就能直接访问props中的prop
      }
      // 注意到，只有prop名在vm或它的原型链上没有定义，才会进行代理。这是一个针对子组件的优化操作，对于子组件来说这个代理工作在创建子组件构造函数时就完成了，即在Vue.extend函数中完成的，这么做的目的是避免每次创建子组件实例时都会调用proxy函数去代理，由于proxy函数中使用了Object.defineProperty，它的性能表现不佳，所以这可以提升一定性能
    }
    toggleObserving(true);
  }

  /**initData做了哪些事情：
   * 通过vm.$options.data获取真正的数据
   * 检查得到的数据是否是纯对象
   * 检查data上的key是否和props对象上的有命名冲突，props优先
   * 检查methods对象上的key是否和data对象上的key冲突，data优先
   * 在Vue实例上添加代理访问数据对象的同名的访问器属性
   * 最后调用observe 开始响应式处理之路 */
  function initData(vm) {
    var data = vm.$options.data; //获取真正的数据，经过mergeOptions后，data已经是函数，下面却还要作判断，因为在mergeOptions之后、initData之前有一个beforeCreate钩子，用户可能会在beforeCreate中修改data的值，所以在initData中要对data作类型判断
    data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {} //如果data是函数，执行getData的结果赋给vm._data，如果不是函数则将data本身赋给vm._data，如果data为空，则用赋给vm._data属性一个{}
    if (!isPlainObject(data)) { //data选项是用户编写的，可能不是纯对象
      data = {}; //如果不是纯对象，覆盖为一个空对象，并警告
      warn('data必须返回一个对象，不能返回别的类型', vm);
    }
    var keys = Object.keys(data); // 获取data对象的所有key
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) { // 遍历keys数组
      var key = keys[i];
      if (methods && hasOwn(methods, key)) {
        warn((`method中定义了和data中同名的${key}，它们都可以通过实例代理访问，命名冲突会产生覆盖的现象`), vm);
      }
      if (props && hasOwn(props, key)) {
        warn("prop中已经有了" + key + "这个定义", vm);
      } else if (!isReservedKeyword(key)) { // 如果key不是保留关键字，将data中的key代理到实例vm上，之后data的数据可以通过this来获取或设置
        proxy(vm, "_data", key); // 真正的data对象赋给了vm._data，实现vm的代理访问是通过Object.defineProperty在vm实例上定义和data数据字段同名的访问器属性，并且这些属性代理的值是vm._data上对应的属性的值，即访问vm.xxx时，实际是访问vm._data.xxx，修改vm.xxx的值时，实际也是修改vm._data.xxx
      }
    }
    observe(data, true/*根data*/) // 观测data的开始：为data调用observe创建watcher实例，data内数据变化时，依赖于该数据的watcher就会接收到通知，从而重新计算watcher表达式的值
  }

  function getData(data, vm) { 
    pushTarget(); // 防止使用props数据初始化data数据时收集冗余依赖，回头再说明
    try {
      return data.call(vm, vm) // 调用data函数获取数据对象并返回
    } catch (e) {
      handleError(e, vm, "data()");
      return {} // 如果有错误发生，返回一个空对象作为数据对象
    } finally {
      popTarget();
    }
  }

  // 初始化computed，其实就是给computed选项对象中每个计算属性创建lazy: true的watcher实例
  // 注意到computed有两种写法，一种是函数，一种是对象，对象里有get方法和set方法(可选)
  function initComputed(vm, computed) {
    var watchers = vm._computedWatchers = Object.create(null); // 共同引用一个空对象
    var isSSR = isServerRendering(); // 是否是服务端渲染的标识
    for (var key in computed) { // 遍历computed选项对象
      var userDef = computed[key]; // key对应的用户定义的属性值
      var getter = typeof userDef === 'function' ? userDef : userDef.get; //取到getter方法
      if (getter == null) { // getter不存在的话，提示计算属性没有对应的getter
        warn(("你没有传入计算属性的Getteris\"" + key + "\"."), vm);
      }
      if (!isSSR) { // 不是ssr就需要创建watcher实例；如果是ssr，计算属性只是一个普通的getter
        watchers[key] = new Watcher(vm, getter || noop, noop, { lazy: true });
        // 把创建的计算属性的watcher添加到watchers/vm._computedWatchers对象中，key是计算属性的名字，属性值是对应的watcher实例。第二个参数expOrFn被观察的目标，是用户设置的计算属性的get函数，lazy:true代表该watcher是计算属性的watcher
      }
      if (!(key in vm)) { // 如果计算属性名在vm实例中没有定义，则在vm上定义计算属性
        defineComputed(vm, key, userDef);
      } else {// 计算属性名已经存在于vm，和data中的和props中的重名都要做出警告
        if (key in vm.$data) { 
          warn(`该计算属性名"${key}"已经在data中有定义了`, vm)
        } else if (vm.$options.props && key in vm.$options.props) { 
          warn(`该计算属性名"${key}"已经在props中定义为一个prop了`, vm)
        }
        // 有可能和methods里的同名，不会报警，但也不会在vm上定义计算属性，即它会悄悄失效
      }
    }
  }

  // 用Object.defineProperty在vm实例上定义计算属性，首先就要找齐get和set函数
  function defineComputed (target, key, userDef) {
    var shouldCache = !isServerRendering() //非ssr下，计算属性才有缓存值；ssr下，计算属性只是一个普通的getter，不会利用缓存值，下面只分析非ssr的情况
    if (typeof userDef === 'function') {
      // 如果用户定义的是函数，调用createComputedGetter函数，生成计算属性的get函数
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : createGetterInvoker(userDef);
      sharedPropertyDefinition.set = noop; // 用户定义的是函数，没有指定set，set函数设为noop
    } else { // 用户定义的是一个对象，且没有指定不用缓存，调用createComputedGetter生成计算属性的get函数
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : createGetterInvoker(userDef.get)
        : noop;
      sharedPropertyDefinition.set = userDef.set || noop;// 用户定义了set就用，没有就用noop
    }
    if (sharedPropertyDefinition.set === noop) {
      sharedPropertyDefinition.set = function () {
        warn(`你正在修改计算属性，但你没有给计算属性"${key}"设置setter`, this)
      };
    }
    // 无论userDef是函数/对象，非srr下，计算属性的get函数都是createComputedGetter(key)产生
    Object.defineProperty(target, key, sharedPropertyDefinition); //在vm实例上定义和计算属性同名的属性
  }

  // 计算属性的getter函数的生成函数，传入计算属性名key
  function createComputedGetter(key) { //返回computedGetter函数
    return function computedGetter() { // 每次计算属性被读取时，这个函数就被执行
      var watcher = this._computedWatchers && this._computedWatchers[key] // 获取计算属性key的watcher实例
      if (watcher) { // ssr情况下，不会给计算属性创建watcher实例，所以是有可能没有watcher的
        if (watcher.dirty) { // 如果watcher的dirty为真，通过执行watcher的evaluate方法对计算属性重新求值，更新watcher.value
          watcher.evaluate(); //注意，evaluate只在计算属性的get被触发时执行，别的情况不会执行它
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value // 计算属性的读取，getter函数返回watcher.value
        // 假如模版里只使用一个计算属性，看似组件的watcher(渲染函数的watcher)监听的是计算属性，但你修改计算属性依赖的一个数据，模版会重新渲染，这是为啥？
        // 计算属性的watcher是惰性求值的，它在创建时，不会立即执行this.get()，即没有立即求值
        // 计算属性还没被首次读取时，它的watcher的dirty是true。并且因为没有求值，计算属性它依赖的所有数据也没有收集依赖。
        // 当计算属性被读取时(可能是被模版使用了，然后在渲染函数执行时被读取，也可能是用户自定义的watcher中对计算属性求值，我们拿渲染函数中读取计算属性来举例)，计算属性的get方法被触发。此时dirty为true，所以会调用watcher的evaluate方法，对计算属性进行求值，把值赋给了watcher.value，并把dirty改为false。
        // 计算属性求值，即this.get()的过程中，前后调用了pushTarget和popTarget，在这之间Dep.target是计算属性的watcher。计算属性求值意味着计算属性依赖的所有数据也求值了，这些数据的get被触发，收集的是计算属性的watcher，同时计算属性的watcher也把这些数据的dep实例收集到自己的deps属性数组中。
        // 计算属性求值，即this.get()中执行了popTarget后，Dep.target不再是计算属性的watcher，而是恢复为读取计算属性的渲染函数的watcher。接下来调用watcher.depend，即计算属性的watcher的deps数组中存放的所有dep实例调用depend，收集依赖，收集的是渲染函数的watcher，而不是计算属性的watcher
        // 现在计算属性依赖的所有数据的dep实例就收集了计算属性的watcher和渲染函数的watcher了。这些数据的改变的话，会触发计算属性的watcher改dirty值和组件的重新渲染。
        // 接下来有几种情况：1.计算属性依赖的数据没变，但是重渲染要读取计算属性，此时计算属性的watcher的dirty是false，不会执行evaluate，即不会对计算属性再次求值，而是返回watcher.value，即之前存的缓存值
        // 2.计算属性依赖的数据变化了，这些数据的dep存放了计算属性的watcher和渲染函数的watcher，数据的修改触发了数据的set方法，数据的dep实例调用notify方法，遍历dep实例中存的所有watcher，逐个调用watcher的update方法，对于计算属性的watcher执行update只是将dirty改为true。对于渲染函数的watcher执行update，触发重新渲染。
        // 而重新渲染会执行渲染函数，必然会再次读取计算属性，触发计算属性的get函数，此时dirty为true，便会执行watcher的evaluate方法，对计算属性重新求值，并把dirty改为false。注意这时是计算属性的第二次求值，计算属性依赖的所有数据的dep实例不会收集重复的依赖，因为多次求值并不会让数据的dep实例收集重复的watcher
        // 如此往复，重复上面1和2的过程，以上就解释了，为什么即使模版使用了只是一个计算属性，你修改计算属性依赖的一个数据，也会触发渲染函数重新渲染。
        // 所以说，组件的watcher或者叫渲染函数的watcher，它不是观察计算属性的变化，而是观察计算属性中所依赖的所有数据的变化。这些数据的变化触发计算属性的watcher改变dirty值为true，并且触发渲染函数的watcher执行update做重渲染，重渲染通过读取计算属性，触发计算属性的get，再根据dirty决定返回缓存值还是重新计算计算属性
      }
    }
  }

  function createGetterInvoker(fn) {
    return function computedGetter () {
      return fn.call(this, this)
    }
  }

  // initMethods函数将methods配置对象中的方法遍历，挂载到当前实例vm
  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      if (typeof methods[key] !== 'function') {
        warn(`组件中Method"${key}"的定义你传了"${typeof methods[key]}"类型。你正确配置函数了吗`, vm);
      }
      if (props && hasOwn(props, key)) {
        warn((`Method"${key}"已经在prop中有定义`), vm);
      }
      if ((key in vm) && isReservedKeyword(key)) {
        warn(`Method"${key}"已经存在于vm中，而且以_或$开头"`);
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
      // 挂载到vm前检测method值是否为函数，如果没有则添加noop，在vm上定义method方法，值为bind函数执行结果，将this改为vm
    }
  }

  // 对watch选项进行初始化
  function initWatch(vm, watch) {//
    for (var key in watch) { // key是需要观察的表达式
      var handler = watch[key]; //对应的回调函数/method/包含handler的对象/多个handler组成的数组 
      if (Array.isArray(handler)) {//如果handler是数组，遍历数组逐个调用createWatcher
        handler.forEach(fn => { createWatcher(vm, key, fn) })
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
  // 为watch选项中的每个需要被观察的表达式创建watcher实例，接收的handler有几种可能：包含回调函数的对象/回调函数/字符串(method名)
  function createWatcher(vm, expOrFn, handler, options) {
    if (isPlainObject(handler)) { //如果handler是纯对象
      options = handler; // 赋给options
      handler = handler.handler; // handler属性值赋给handler
    }
    if (typeof handler === 'string') { //如果handler是字符串
      handler = vm[handler] // 说明它是method，从vm中取出函数
    } // 现在handler就是函数了，直接调用vm.$watch，但$watch的定义中还要判断第二个函数是函数或对象，因为$watch不单只在这被调用，还暴露给用户使用，用户可能给第二个参数传入一个对象
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin(Vue) {
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props};
    dataDef.set = function () {
      warn('不要修改实例上的$data属性，用嵌套的data属性吧', this);
    };
    propsDef.set = function () {
      warn("不要修改$props属性，是只读的", this);
    };
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);
    // 在Vue的原型上定义了两个属性'$data''$props'，$data实际代理的是_data这个实例属性，$props实际代理的是_props这个实例属性

    Vue.prototype.$set = set; Vue.prototype.$delete = del

    // $watch函数是对new Watcher的封装，只是加入了控制项immediate和deep，既在Vue内部使用又暴露给用户使用。vm.$watch('a.b.c',(newVal,oldVal)=>{})或vm.$watch(()=>this.a+this.b,(newVal,oldVal)=>{})，后者this.a+this.b每次能得出一个不同的结果时，即a或b的值变化，处理函数都会被调用。就像监听一个未被定义的计算属性
    Vue.prototype.$watch = function (expOrFn, cb, options) {//expOrFn只接收点分割的的路径，或一个computed函数。cb接收回调或包含回调的对象，回调在被观测的目标变化后执行，回调接收的参数为新值和旧值
      var vm = this;
      if (isPlainObject(cb)) { // 如果第二个参数传的是纯对象，因为createWatcher中会对是对象的情况进行归一化处理，所以调用createWatcher讲参数归一化后，会再调用$watch
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {}; // 如果没有传第三个参数，会默认options为一个空对象
      options.user = true // 自动设为true，因为无论是watch选项定义的，还是用户调用$watch定义的，都是用户自己定义的watcher
      var watcher = new Watcher(vm, expOrFn, cb, options); // 创建watcher实例
      if (options.immediate) {//immediate:true代表$watch调用时要立即触发cb回调
        try { // 而cb的执行会传入expOrFn的新值和旧值，刚刚的new Watcher时，对expOrFn进行了一次求值，此时只有新值
          cb.call(vm, watcher.value) //new Watcher时执行watcher的get方法，返回值赋给了watcher.value
        } catch (err) { // cb是用户自己编写的，它的执行可能会有不可预知的错误
          handleError(err, vm, `立即执行的watcher的回调"${watcher.expression}"出现了错误`)
        }
      }
      return () => { //$watch返回一个函数，函数执行会调用watcher的teardown方法
        watcher.teardown() // teardown方法做的是解除当前watcher对expOrFn的观察
      }
    }
  }

  var uid$3 = 0;
  function initMixin (Vue) { // initMixin函数执行，会给Vue的原型添加_init方法
    Vue.prototype._init = function (options) {
      var vm = this;
      vm._uid = uid$3++
      vm._isVue = true; //标识是Vue实例而不是普通的对象，避免被观测 
      if (options && options._isComponent) { //_isComponent表明是内部子组件
        initInternalComponent(vm, options) // 主要为vm.$options添加一些属性
      } else { //当前Vue实例不是组件，调用mergeOptions方法，将vm的构造器的options(合并了父级构造器的options)，和当前实例化时接收的options合并
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor), options || {}, vm
        )
      }
      initProxy(vm); //指定渲染函数的执行上下文为vm的proxy代理，通过拦截函数提供友好的开发提示
      vm._self = vm; //vm._self和vm._renderProxy不同，proxy能用的话后者就是是vm的Proxy实例
      initLifecycle(vm); // 向实例挂载属性
      initEvents(vm); // 初始化事件
      initRender(vm); // 渲染的初始化
      callHook(vm, 'beforeCreate')
      initInjections(vm); // 在data/props前初始化inject
      initState(vm);
      initProvide(vm); // 在data/props后初始化 provide
      callHook(vm, 'created');
      // 执行完所有初始化后，开始挂载实例到DOM上，实例化组件构造器时，如果传了el，调用$mount开启模版编译和挂载，如果没有传，则需要用户手动调用vm.$mount，否则不会进入下一生命周期流程
      if (vm.$options.el) vm.$mount(vm.$options.el);
    };
  }
  // 为创建的内部组件的options对象手动赋值，提升性能
  function initInternalComponent(vm, options) {
    // 创建一个以vm.constructor.options为原型的空对象
    var opts = vm.$options = Object.create(vm.constructor.options);
    // 以下为手动赋值，它比动态枚举属性来赋值来得快
    var parentVnode = options._parentVnode // 获取父vnode节点
    opts.parent = options.parent; // 父DOM节点
    opts._parentVnode = parentVnode; // 给opts对象添加_parentVnode属性
    // 获取父vnode节点的componentOptions，给opts对象添加propsData等属性
    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;
    // 如果options.render存在，设置opts的render和staticRenderFns属性
    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  // 获取当前实例的构造函数的options和其所有父级的构造函数的options的合并结果
  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    // 如果Ctor的父类构造器不存在，说明Ctor是Vue，返回Vue.options
    if (!Ctor.super) return options
    var superOptions = resolveConstructorOptions(Ctor.super)
    var cachedSuperOptions = Ctor.superOptions
    // 递归调用resolveConstructorOptions，传入Ctor的父类，获取父类构造器的options，赋给superOptions。获取Ctor.superOptions，即父类的options，赋给cachedSuperOptions，如果这两个值不全等，说明父类的options改动过，这时需要更新Ctor.superOptions，比如下面Vue.mixin改变了父类的options，superOptions和cachedSuperOptions就不相等了
    //  var Profile = Vue. extend({
    //     template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>'
    //  })
    //  Vue.mixin({ data: function () {
    //    return {
    //      firstName: 'Walter',
    //      lastName: 'White',
    //      alias: 'Heisenberg'
    //    }
    //  }})
    //  new Profile().$mount('#example')
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      // 如果Ctor的options变动了，将改动/新增的项拷贝到Ctor.extendOptions，然后将Ctor.extendOptions和superOptions(所有父级构造器的options总成)合并，赋给当前子类Ctor.options，即更新了Ctor.options。如果存在name属性，则给Ctor.options.components对象添加属性name和对应的Ctor，组件构造器
      var modifiedOptions = resolveModifiedOptions(Ctor)
      if (modifiedOptions) extend(Ctor.extendOptions, modifiedOptions)
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) options.components[options.name] = Ctor;
    }
    return options
  }
  // 总结一下：首先判断是子类吗，不是，返回Ctor.options，是子类，判断父类的options改变了吗？没改，返回Ctor.options，改了，递归调用resolveConstructorOptions获取最新的所有父类的options，再判断子类你本身改变了吗？没改，将最新的父类options和自身的extendOptions合并，并返回。如果子类本身的options改了，把改动项解析出来，扩展到自身的extendOptions，再将最新的父级options和自身的extendOptions合并，并返回

  // 得出子类tor的options的变动项组成的modified对象，如果没有变动，返回undefined
  function resolveModifiedOptions(Ctor) {
    var modified;
    // latest是当前子类Ctor的options，sealed是Vue.extend执行时保存的子类Ctor的options，遍历latest，如果latest中存在和sealed中不一样的项，则说明它是改动/新增的项，将它添加到modified对象，遍历结束返回modified
    var latest = Ctor.options
    var sealed = Ctor.sealedOptions
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) modified = {};
        modified[key] = latest[key]
      }
    }
    return modified
  }

  function Vue(options) { // 内部定义的Vue构造函数，最后会返回出来
    if (!(this instanceof Vue))
      warn('Vue是一个构造函数，它的调用必须用new关键字调用')
    this._init(options); // 实例化Vue时调用_init方法进行初始化
  }
  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);
  // 每个Mixin方法都是为了给Vue的原型挂载属性和方法

  function initUse(Vue) { // initUse函数中，定义了Vue.use函数
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      // installedPlugins和Vue._installedPlugins共同指向一个数组，存放已经注册过的插件
      if (installedPlugins.indexOf(plugin) > -1) return this //如果插件已注册过，直接返回
      var args = toArray(arguments, 1); // 传入Vue.use执行的除去第一个参数以外的参数数组
      args.unshift(this); // 将Vue构造函数插入到args数组的首位
      if (typeof plugin.install === 'function') { //如果插件有install方法
        plugin.install.apply(plugin, args);//执行install方法，参数是args，第一个参数是Vue
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin); //保存注册过的插件，避免相同的插件多次注册
      return this
    };
  }
  // 定义mixn函数，接收用户传入的options对象，调用mergeOptions将它和Ctor.options合并，并覆盖Ctor.options，因为创建组件实例都会用到Ctor.options，调用了Ctor.mixin后，Ctor.options更新了，会影响之后创建的每个vm实例
  function initMixin$1(Vue) { 
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin)
      return this
    }
  }
  // 定义Vue.extend方法，用来创建一个Vue的子类，是每个实例构造器都有的方法
  function initExtend(Vue) {
    Vue.cid = 0 // Vue构造函数的cid为0
    var cid = 1 // 每个实例的构造器都有一个唯一的cid
    // Vue.extend的this指向调用extend的构造器，定义为Super(可以理解为父类)，Vue.extend接收一个选项对象extendOptions，创建一个子类并继承父类构造器上的一些属性、原型方法、静态方法等，最后返回子类，它拥有和Vue父类一样的能力，并在实例化时会执行继承来的_init方法完成子组件的初始化
    Vue.extend = function (extendOptions = {}) {
      var Super = this
      var SuperId = Super.cid // 父类的cid
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
      //扩展选项对象的_Ctor属性是一个专门缓存构造器的对象，避免重复创建子构造器，根据SuperId发现已经缓存了该构造器，就直接返回它
      if (cachedCtors[SuperId]) return cachedCtors[SuperId]
      // 获取extendOptions的name属性值，如果没有，获取父级选项对象的name值，组件就是一个构造函数，name值即为组件名，如果name存在，校验它是否是合法的组件名
      var name = extendOptions.name || Super.options.name
      if (name) validateComponentName(name)
      // 定义子类构造函数Sub，和Vue一样，Sub实例化时会调用Vue的原型方法_init进行初始化，this指向SUb实例，定义了Sub构造器后，要让它继承父类
      var Sub = function (options) {
        this._init(options)
      }
      // 首先创建一个新对象，指定它的原型对象是Super.prototype，于是这个对象除了__proto__没有别的属性，__proto__指向Super.prototype。将这个对象赋给Sub.prototype，即Sub.prototype.__proto__===Super.prototype，即Sub的原型通过__proto__指向父类的原型。Sub.prototype现在只有__proto__属性，没有constructor属性，但它作为构造函数的原型对象，应该有一个constructor属性，让它手动指向构造函数本身，Sub。这两步操作实现子类Sub继承父类Super
      Sub.prototype = Object.create(Super.prototype)
      Sub.prototype.constructor = Sub
      // 给子类Sub添加options属性，值是合并了父类options和接收的扩展选项对象的对象。给子类Sub添加super属性，值为父类
      Sub.cid = cid++;
      Sub.options = mergeOptions(Super.options, extendOptions)
      Sub['super'] = Super
      // 获取子类Sub的options的props，如果有props对象，遍历它，交给Sub的原型的_props属性代理，这样子类Sub的实例.prop名 就能访问prop的值
      var props = Sub.options.props
      if (props) { 
        for (var key in props) {
          proxy(Sub.prototype, "_props", key)
        }
      }
      // 获取子类Sub的options的computed对象，如果存在，则遍历它，将计算属性定义在Sub的原型上。将props和计算属性定义在子类Sub的原型上，是为了避免每次创建子类的实例时，都要定义props和计算属性，Sub的实例可以通过原型链在Sub.prototype上读取相应的值
      var computed = Sub.options.computed
      if (computed) {
        for (var key in computed) {
          defineComputed(Sub.prototype, key, computed[key]);
        }
      }
      // 给子类Sub也添加父类的extend、mixin、use方法，这样子类也具备扩展、混入、使用插件的能力。给子类Sub添加Sub.component、Sub.filters等全局方法，允许子类有私有资源
      Sub.extend = Super.extend
      Sub.mixin = Super.mixin
      Sub.use = Super.use;
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type]
      });
      // name是组件构造器的组件名，如果存在，将它保存在Sub.options.components对象中，name为属性名，值为构造器Sub
      if (name) Sub.options.components[name] = Sub;
      // Sub的superOptions属性存父类的options，extendOptions属性存extend时传入的扩展选项对象，sealedOptions属性存Sub.options的一份深拷贝，Sub.options是合并了父类options的和扩增的options的，即当前Sub的options
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options)
      cachedCtors[SuperId] = Sub // 子类Sub创建好了，在缓冲构造函数对象中记录一下
      return Sub // extend函数返回出创建出来的子类
    }
  }

  // 注册Vue.component和Vue.directive和Vue.filter，注册全局组件，就是在Vue实例化前，创建一个基于Vue的子类构造器，并将组件构造器保存在Vue.options.components对象中
  function initAssetRegisters(Vue) {
    ASSET_TYPES.forEach(function (type) { // ['component','directive','filter']
    // 如果Vue.components的第二个参数没传，根据传入的id从this.options.components中直接返回注册过的组件构造器。如果两个参数都传了，意味着对该组件进行注册，第二个参数definition支持两种：选项对象和构造函数
      Vue[type] = function (id, definition) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          if (type === 'component') {
            validateComponentName(id)
          }
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          // 如果是注册组件，先对组件名进行合法性校验，默认会把传入的id作为组件名，但如果definition存在name属性，则name属性值会作为组件名。如果definition传的是对象，调用Vue.extend创建Vue的子类，传入的definition都处理为构造函数
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition }
          }
          // 如果是注册指令，且传入的definition是函数，则definition改为一个对象，它的bind和update属性值为该函数，即作为这两个事件的处理回调。如果definition不是函数，说明是用户定义的指令对象，直接将它保存在this.options.directive对象中，key为id
          this.options[type + 's'][id] = definition
          return definition // 返回 自定义指令对象 / 过滤器函数 / 组件的构造函数
        }
      } // 所以注册指令、过滤器、组件，其实就是往Vue.options中对应的属性存值，将自定义指令对象、过滤器函数、组件构造器和它们对应的指令名、过滤器名、组件名以键值对存到对象中
    })
  }

  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var cachedNode = cache[key];
      if (cachedNode) {
        var name = getComponentName(cachedNode.componentOptions);
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry(cache, key, keys, current) {
    var cached$$1 = cache[key];
    if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
      cached$$1.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array]

  var builtInComponents = {
    KeepAlive: { //keep-alive不会重复渲染相同的组件，只会利用首次渲染保留的缓存结果去更新节点
      name: 'keep-alive',
      abstract: true, //指定该组件是抽象的，通过该组件创建的实例是抽象的，抽象组件的特点是不渲染真实DOM到页面的，但会提供一些有用的功能。并且抽象组件不会出现在父级关系的路径上
      props: {
        include: patternTypes,
        exclude: patternTypes,
        max: [String, Number]
      },
      created() {
        this.cache = Object.create(null)
        this.keys = []
      },
      destroyed() {
        for (const key in this.cache) {
          pruneCacheEntry(this.cache, key, this.keys)
        }
      },
      mounted() {
        this.$watch('include', val => {
          pruneCache(this, name => matches(val, name))
        })
        this.$watch('exclude', val => {
          pruneCache(this, name => !matches(val, name))
        })
      },
      render() {
        const slot = this.$slots.default
        const vnode = getFirstComponentChild(slot)
        const componentOptions = vnode && vnode.componentOptions
        if (componentOptions) {
          // check pattern
          const name = getComponentName(componentOptions)
          const { include, exclude } = this
          if (
            (include && (!name || !matches(include, name))) ||
            (exclude && name && matches(exclude, name))
          ) {
            return vnode
          }
          const { cache, keys } = this
          const key = vnode.key == null
            ?
            componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '') :
            vnode.key
          if (cache[key]) {
            vnode.componentInstance = cache[key].componentInstance
            remove(keys, key)
            keys.push(key)
          } else {
            cache[key] = vnode
            keys.push(key)
            if (this.max && keys.length > parseInt(this.max)) {
              pruneCacheEntry(cache, keys[0], keys, this._vnode)
            }
          }
          vnode.data.keepAlive = true
        }
        return vnode || (slot && slot[0])
      }
    }
  };
  // 在Vue上添加一些全局的API
  function initGlobalAPI (Vue) {
    // 给Vue定义只读属性config，读取Vue.config会触发config属性的get方法，返回全局配置对象config，可以在启动应用之前修改里面的属性
    Object.defineProperty(Vue, 'config', {
      get: () => config,
      set() { warn('不允许直接设置Vue.config值，只能修改它里面的单个属性') }
    });
    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;
    // Vue.observable方法把一个对象响应式化，调用observe来观测这个对象和它嵌套的子对象，在发生改变时会触发相应的更新，被观测的对象可以直接用于渲染函数和计算属性内。比如let state = Vue.observable({count:0})，state.count就是响应式属性，它有自己的get和set，当属性被读取时触发get，收集依赖，当属性值被修改时触发set，触发依赖
    Vue.observable = (obj) => {
      observe(obj)
      return obj
    };
    // const Demo = {
    //   render(h) {  // 响应式属性state.count直接用在渲染函数中
    //     return h('button', {
    //       on: { click: () => { state.count++ }}
    //     }, `count is: ${state.count}`
    //   }
    // }
    Vue.options = Object.create(null)
    ASSET_TYPES.forEach(type => {
      Vue.options[type + 's'] = Object.create(null) 
    })
    // Vue.options初始化为一个空对象，往Vue.options添加components,directives,filters等属性，值为空对象，给Vue.options添加_base属性，值为Vue构造函数，再将builtInComponents中的KeepAlive属性拷贝到Vue.options.components对象中
    Vue.options._base = Vue;
    extend(Vue.options.components, builtInComponents)
    initUse(Vue); // 添加Vue.use方法
    initMixin$1(Vue); // 添加Vue.mixin方法
    initExtend(Vue); //添加Vue.extend方法
    initAssetRegisters(Vue); //添加全局api:Vue.component和Vue.directive和Vue.filter
  }
  initGlobalAPI(Vue);
  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get () {
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  var isReservedAttr = makeMap('style,class');

  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = (tag, type, attr) => ((attr === 'value' && acceptValue(tag)) && type !== 'button' || (attr === 'selected' && tag === 'option') || (attr === 'checked' && tag === 'input') || (attr === 'muted' && tag === 'video'))

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

  var convertEnumeratedValue = function (key, value) {
    return isFalsyAttrValue(value) || value === 'false'
      ? 'false'// allow arbitrary string value for contenteditable
      : key === 'contenteditable' && isValidContentEditableValue(value) ? value : 'true'
  };

  var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,translate,truespeed,typemustmatch,visible');

  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var isXlink = (name) => name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  var getXlinkProp = (name) => isXlink(name) ? name.slice(6, name.length) : ''
  var isFalsyAttrValue = (val) => val == null || val === false  

  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class) ? [child.class, parent.class] : parent.class
    }
  }

  function renderClass(staticClass, dynamicClass) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    return ''
  }

  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  var namespaceMap = { svg: 'http://www.w3.org/2000/svg', math: 'http://www.w3.org/1998/Math/MathML' };
  var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot');

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true)

  var isReservedTag = tag => isHTMLTag(tag) || isSVG(tag)

  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    if (tag === 'math') return 'math'
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement (tag) {
    if (!inBrowser) return true
    if (isReservedTag(tag)) return false
    tag = tag.toLowerCase();
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url');
  // 获取document的子元素中和el字符串匹配的第一个元素，如果获取不到，则创建并返回一个div元素。如果el不是字符串，则默认为一个DOM元素，直接返回el
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el)
      if (!selected) {
        warn('找不到元素' + el);
        return document.createElement('div')
      }
      return selected 
    } else {
      return el
    }
  }

  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') return elm
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }
  const createElementNS = (namespace, tagName) => document.createElementNS(namespaceMap[namespace], tagName)
  const createTextNode = text => document.createTextNode(text)
  const createComment = text => document.createComment(text)
  function insertBefore(parentNode, newNode, referenceNode) {//在参考节点之前插入一个拥有指定父节点的子节点，如果给给定的子节点是对文档中现有节点的引用，则会将它从当前位置挪动到新位置
    parentNode.insertBefore(newNode, referenceNode);
  }
  function removeChild (node, child) { // 移除父节点的指定子节点
    node.removeChild(child);
  }
  function appendChild (node, child) {
    node.appendChild(child);
  }
  const parentNode = node => node.parentNode // 返回一个原生DOM节点的父节点
  const nextSibling = node => node.nextSibling
  const tagName = node => node.tagName
  function setTextContent (node, text) {
    node.textContent = text;
  }
  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  var nodeOps = Object.freeze({ createElement: createElement$1, createElementNS, createTextNode, createComment, insertBefore, removeChild, appendChild, parentNode, nextSibling, tagName, setTextContent, setStyleScope })

  var ref = {
    create(_, vnode) { 
      registerRef(vnode) // 给vm.$refs对象添加ref键值对
    },
    update(oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) { // 如果新旧vnode的ref值不一样
        registerRef(oldVnode, true); //将vm.$refs对象中对应的ref数据先删除
        registerRef(vnode); // 在添加新的ref数据
      }
    },
    destroy(vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref; // 获取元素上的ref值
    if (!isDef(key)) return // 如果没有 直接返回
    var vm = vnode.context; // 获取vnode对象的编译作用域
    var refInstance = vnode.componentInstance || vnode.elm //获取vnode节点对应的组件实例，如果不存在则获取vnode节点对应的真实DOM节点，所以ref其实就是组件实例或DOM节点
    var refs = vm.$refs; //获取vm实例的$refs，是一个对象
    if (isRemoval) { // 如果isRemoval传了真，即从refs对象中删除该vnode对应的ref数据
      if (Array.isArray(refs[key])) { // refs[key]是数组，将refInstance从数组中移除
        remove(refs[key], refInstance);
      } else if (refs[key] === refInstance) { // 不是数组，则将值设为undefined
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) { //refInFor值是真，即ref是在v-for中使用的，需要创建一个组件实例或DOM节点的引用数组，而非单一引用；引用信息是包含DOM节点或组件实例的数组
        if (!Array.isArray(refs[key])) { //如果在refs对象中，ref对应的值不是数组
          refs[key] = [refInstance] // 强制转换成数组，key为ref属性值，value为 [组件实例或DOM节点]
        } else if (refs[key].indexOf(refInstance) < 0) { // 是数组，且如果在refs对象中，ref值属性不存在
          refs[key].push(refInstance) // 在refs对象中，将组件实例或DOM节点push进ref值对应的数组
        }
      } else { // ref属性不是在v-for中使用
        refs[key] = refInstance; // 以键值对 ref值: 组件实例/DOM节点 的形式存入对象refs
      }
    }
  }

  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
  // 这些钩子对应patch阶段的各个时机。DOM元素相关的属性、样式、事件等都是通过这些钩⼦完成设置

  /*
  判断两个VNode节点是否是同一个节点，需要满足以下条件
  key相同
  tag（当前节点的标签名）相同
  isComment（是否为注释节点）相同
  是否data（当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息）都有定义
  当标签是<input>的时候，type必须相同
*/

  // 组件的state发生变化，重新执行渲染函数生成新的vnode，然后比对新旧vnode，想要以最小的代价更新原有视图，在patch的过程中，如果两个VNode被认为是同一个VNode，则会进行深度的比较，得出最小差异，即希望更新DOM时，尽可能复用现有的vnode，只更新修改了的地方。
  function sameVnode(a, b) {
    // key属性是v-for自动添加的或自定义的:key属性，key属性如果没有设置，默认为undefined，当v-for渲染列表时会给节点一个唯一的key，两个vnode相同就必须它们的key相同，key不一样的vnode不能复用
    // 相同的vnode必须标签名一样，且不能是一个为注释节点一个不是注释节点，不能是一个有属性一个没有任何属性(没必要复用，还不如直接渲染新的)，如果是input元素还要type属性相同，如果不同就相当于不同的元素了
    return a.key === b.key && ((
          a.tag === b.tag && 
          a.isComment === b.isComment && 
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          a.asyncFactory === b.asyncFactory &&
          isUndef(b.asyncFactory.error)
        )
      )
  }
  function sameInputType (a, b) {
    if (a.tag !== 'input') return true 
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }
  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  // createPatchFunction内部定义了很多辅助方法，最终返回patch函数，它会赋给__patch__。通过调用封装好的DOM的API，根据vnode树生成真实DOM节点，如果遇到组件的vnode时，会递归调用子组件的挂载过程
  function createPatchFunction({ nodeOps, modules }) {
    var i, j;
    var cbs = {};
    for (i = 0; i < hooks.length; ++i) { //遍历hooks
      cbs[hooks[i]] = []; //在cbs对象中为每个hook创建一个数组
      for (j = 0; j < modules.length; ++j) { //遍历modules
        if (isDef(modules[j][hooks[i]])) { // 如果当前module定义了当前hook
          cbs[hooks[i]].push(modules[j][hooks[i]]);//就会把module中hook对应的值push进cbs中该hook对应的数组里。modules模块其中包含了事件模块events，它是一个包含了create和update两个hook的对象，值为updateDOMListeners函数，即{create:updateDOMListeners,update:updateDOMListeners}，因此cbs.create数组就存放了updateDOMListeners函数
        }
      }
    }

    // 根据传入的vnode节点，根据它是什么标签类型而创建空的这个类型的vnode节点
    function emptyNodeAt (elm) { // tag是有的，data没有，子节点也没有，文本也没有
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    // 接收的childElm是vnode.elm，即vnode节点对应的真实DOM节点，listeners接收的是cbs.remove.length+1，cbs.remove是patch中remove阶段对应的回调组成的数组，而patch中的remove阶段是移除DOM节点
    function createRmCb (childElm, listeners) { // listeners其实是对cbs.remove中元素的计数
      function remove$$1() {
        //cbs.remove数组长度为1，listeners现在为2，它--，为1，不符合，说明cbs.remove数组长度为0
        if (--remove$$1.listeners === 0) { //如果cbs.remove数组为空，即不存在移除DOM节点的回调函数，则调用removeNode
          removeNode(childElm); // 
        }
      }
      remove$$1.listeners = listeners; // 挂载到remove$$1函数上，然后返回remove$$1
      return remove$$1
    }

    // 接收的是vnode对应的真实的DOM节点，函数的作用是移除将el从它的父节点中移除
    function removeNode (el) {
      var parent = nodeOps.parentNode(el) // 获取它的原生的父级DOM节点
      // element may have already been removed due to v-html / v-text
      if (isDef(parent)) { // 如果它有父节点，那么调用removeChild，将el节点移除
        nodeOps.removeChild(parent, el);
      }
    }

    // 判断vnode节点是否是未知元素。函数接收vnode对象，和inVPre，它代表了当前元素是否使用了v-pre指令，这个指令是用来跳过编译的
    function isUnknownElement$$1 (vnode, inVPre) {
      return ( // 下面条件为真，则元素是未知元素，为假则不是
        !inVPre && // 元素没有使用v-pre指令
        !vnode.ns && // 元素没有使用命名空间
        !(config.ignoredElements.length &&
          config.ignoredElements.some(ignore => isRegExp(ignore) ? ignore.test(vnode.tag) : ignore === vnode.tag)
        ) &&
        config.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;
    // 根组件是用户new Vue创建的实例，除了根组件实例之外的组件实例都称为子组件实例，而子组件都是在根组件調用__patch__的过程中创建，所以一般所說的組件都是子組件
    // createElm函数創建vnode對應的真實DOM節點，并插入到真实DOM树中。對於組件佔位vnode來說，會調用createComponent來創建vnode的組件實例，對於非組件佔位的vnode來說，會創建對應的DOM節點。
    function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
      // 如果vnode.elm存在，即该vnode已经有对应的真实DOM节点，在以前的渲染中使用过，现在它被用作一个新vnode，当它作为插入节点时，会导致潜在的patch错误，所以将vnode克隆一份，赋给ownerArray[index]和vnode
      if (isDef(vnode.elm) && isDef(ownerArray)) vnode = ownerArray[index] = cloneVNode(vnode)
      vnode.isRootInsert = !nested; // 为检查过渡动画入口
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) return
      //先調用createComponent，如果vnode是組件的vnode，则创建组件实例，，並直接結束createElm；如果該vnode不是組件佔位vnode，則繼續createElm，為非組件佔位vnode創建對應的DOM節點
      var data = vnode.data; // 获取vnode的节点信息data
      var children = vnode.children; // 获取vnode的子vnode
      var tag = vnode.tag; // 获取vnode的标签名
      if (isDef(tag)) { // 标签名存在，说明是元素节点(普通节点)
        if (data && data.pre) { //如果存在节点信息，并且使用了v-pre指令
          creatingElmInVPre++ // (在v-pre指令中创建的节点)计数器+1
        }
        if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
          warn('Unknown custom element: <' + tag + '> - did you register the component correctly? For recursive components, make sure to provide the "name" option.', vnode.context);
        }
        // 根据ns属性的真假，有2种创建节点的方式 创建节点
        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode); // 设置节点的作用域ID
        // 在web平台，先创建子节点插入父级后再一次性插入DOM中
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) { // 针对指令的处理
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm) //插入到真实DOM中
        if (data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) { // vnode对应的是注释节点
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);//创建注释节点然后插入到DOM
      } else { // vnode对应的是文本节点
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);//创建文本节点然后插入到DOM
      }
    }
    //该createComponent区别于另一个createComponent，那个是创建组件的vnode。這個是根據组件的VNode创建组件实例和整个组件的DOM树，如果parentElm存在，插入到父元素。對於非組件佔位vnode將不做任何操作，返回undefined
    function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data
      if (!isDef(i)) return // 如果vnode没有任何数据信息，直接返回
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      // 如果isReactivated为真，代表vnode的组件实例已经创建而且是keepAlive组件。
      // 如果存在vnode.data.hook.init钩子存在，说明该vnode是组件的vnode，调用init钩子，创建组件实例并挂载到vnode.componentInstance。如果传入的vnode不是组件的vnode，则不会存在init钩子，也不会创建组件的实例，函数最后返回undefined
      if (isDef(i = i.hook) && isDef(i = i.init)) i(vnode, false)
      // 如果vnode的组件实例已经创建过，调用initComponent初始化组件实例，设置vnode.elm，调用insert将vnode.elm插入到父DOM节点下，refElm之前
      if (isDef(vnode.componentInstance)) { 
        initComponent(vnode, insertedVnodeQueue)
        insert(parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated))  // 如果是keepAlive组件
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        return true
      }
    }
    // 创建了组件实例之后，初始化组件实例
    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {//子组件在创建过程中新增的所有节点加入到insertedVnodeQueue中
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
        vnode.data.pendingInsert = null;
      }
      // 获取组件实例的根DOM节点元素，赋给vnode.elm
      vnode.elm = vnode.componentInstance.$el 
      if (isPatchable(vnode)) {//组件可patch
        invokeCreateHooks(vnode, insertedVnodeQueue)//调用create钩子
        setScope(vnode); //设置scope
      } else { //组件不可patch
        registerRef(vnode);//注册组件的ref
        insertedVnodeQueue.push(vnode);//将组件占位 VNode 加入到insertedVnodeQueue
      }
    }
    
    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      insert(parentElm, vnode.elm, refElm);
    }

    function insert(parent, elm, ref$$1) {
      if (!isDef(parent)) return // 如果没有定义插入的父节点，直接返回
      if (isDef(ref$$1)) { // 如果定义了ref$$1，如果它的父节点和传入的parent全等，将elm节点插入到ref$$1节点的前面
        if (nodeOps.parentNode(ref$$1) === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else { // 如果没有定义ref$$1，将elm节点追加到父节点的子节点末尾
        nodeOps.appendChild(parent, elm);
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        checkDuplicateKeys(children);
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }
    // 一个vnode不管是普通节点的vnode还是组件的vnode，只要它存在根DOM元素节点，则它是可patch的
    // 如果vnode对应的组件实例存在，则继续循环，获取当前vnode对应的组件实例的根vnode节点，覆盖vnode，如果vnode没有对应的组件实例，跳出循环，即最后的vnode是一开始传入的vnode的第一个非组件节点对应的vnode，如果这个vnode有tag，说明传入的vnode是可patch的
    function isPatchable(vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode
      }
      return isDef(vnode.tag)
    }
    // 什么时候调用invokeCreateHooks呢？一个是在createElm调用的时候，一个是在initComponent调用时，调用会遍历cbs.create数组存放的钩子函数，依次调用updateDOMListeners
    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (isDef(i.create)) i.create(emptyNode, vnode) // 调用updateDOMListeners
        if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
      }
    }

    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    // 销毁节点，传入vnode对象
    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data; // 获取vnode对象上的data
      if (isDef(data)) { // data存在
        if (isDef(i = data.hook) && isDef(i = i.destroy)) {
          // 如果data中的hook属性有定义，且里面有destroy方法
          i(vnode) // 调用destroy方法，传入vnode
        } // destroy了vnode对应的节点后，遍历执行cbs.destroy中的回调
        for (i = 0; i < cbs.destroy.length; ++i) { //遍历cbs.destroy
          cbs.destroy[i](vnode) //将数组中的回调依次执行
        }
      }
      if (isDef(i = vnode.children)) { // 如果vnode有子节点
        for (j = 0; j < vnode.children.length; ++j) { //遍历子节点，递归调用销毁子节点
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }
    // 整个DOM节点对比更新的核心逻辑函数：
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0; // 旧节点的开始索引
      var newStartIdx = 0; // 新节点的开始索引
      var oldEndIdx = oldCh.length - 1; // 旧子节点的结束索引
      var oldStartVnode = oldCh[0]; // 旧子节点的首节点
      var oldEndVnode = oldCh[oldEndIdx]; // 旧子节点的尾节点
      var newEndIdx = newCh.length - 1; // 新子节点的结束索引
      var newStartVnode = newCh[0]; // 新子节点的首节点
      var newEndVnode = newCh[newEndIdx]; // 新子节点的尾节点
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly只用在<transition-group>的特殊标识，确保移除的元素留在正确的相对位置，在离开过渡期间
      var canMove = !removeOnly;
      checkDuplicateKeys(newCh) //检查新子节点中有没有重复的key

      // 逐一比对对应索引位置的节点，while循环只在新旧开始索引同时小于各自结束索引才继续进行
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {//如果旧的开始节点不存在，则增加旧节点的开始索引
          oldStartVnode = oldCh[++oldStartIdx] //将旧的开始节点后移一个
        } else if (isUndef(oldEndVnode)) { //旧的开始节点存在，但旧的结束节点不存在
          oldEndVnode = oldCh[--oldEndIdx] //旧的结束节点前移一个
        } else if (sameVnode(oldStartVnode, newStartVnode)) {//新旧的开始节点是同一个节点
          // 调用patchVnode，对比新旧的同一个子节点，更新DOM
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx] //旧的开始节点后移一个
          newStartVnode = newCh[++newStartIdx]; //新的开始节点后移一个
        } else if (sameVnode(oldEndVnode, newEndVnode)) { //新旧的结束节点是同一个节点
          // 调用patchVnode，对比新旧的同一个节点，更新DOM
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx] // 新的开始节点前移一个
          newEndVnode = newCh[--newEndIdx] // 新的结束节点前移一个
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // 旧的开始节点和新的结束节点相同
          // 调用patchVnode，对比，更新
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm)) //canMove为真则将当前旧首节点移动到下一兄弟节点前
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx)) {
            oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
          }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn(("Duplicate keys detected: '" + key + "'. This may cause an update error."), vnode.context);
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    // 对比新旧vnode并DOM更新。首先是按照新vnode是否是文字节点来分情况，如果是新节点是文字节点，则可以不管旧节点的情况，除非旧节点也是文本节点且内容无异，才不需要处理，其他情况下都直接将DOM元素的文本内容置为新vnode的文本。如果新节点不是文字节点，处理再细分为四种情况：1、新旧vnode的子节点都存在且不相等时，执行updateChildren。2、只有新子节点存在而旧子节点不存在，如果旧节点是文字节点，先要置空旧节点的文本内容，再向DOM元素添加新子字节点。3、只有旧子节点存在而新子节点不存在时，说明更新后没有子节点了，执行移除操作。4、新旧子节点不存在而旧节点是文字节点时，清空DOM元素的文本内容。
    function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
      if (oldVnode === vnode) return //新旧vnode相同 则直接返回
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // clone reused vnode
        vnode = ownerArray[index] = cloneVNode(vnode);
      }
      // 旧vnode挂载的DOM元素赋给新vnode的elm属性和elm变量
      var elm = vnode.elm = oldVnode.elm;

      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }
      // 如果vnode是静态节点，且旧vnode也是静态节点，且新旧vnode的key值一样，且新vnode是克隆节点或一次性节点，则旧vnode的组件实例赋给新vnode的组件实例，然后返回
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode)//如果vnode的data中有内联预处理钩子，调用传入新旧vnode
      }

      var oldCh = oldVnode.children; // 旧vnode的子节点
      var ch = vnode.children; // 新vnode的子节点
      // 如果存在更新钩子则调用
      if (isDef(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) {
          cbs.update[i](oldVnode, vnode);
        }
        if (isDef(i = data.hook) && isDef(i = i.update)) {
          i(oldVnode, vnode);
        }
      }
      if (isUndef(vnode.text)) { //如果新vnode没有text属性，说明不是文本节点
        if (isDef(oldCh) && isDef(ch)) { // 新旧vnode都有子节点
          if (oldCh !== ch) { //子节点不一样，更新子节点
            updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
            //只有当新旧vnode和各自子vnode都是元素节点时，才要调用updateChildren进行深入比较，其他的情况都可以比较简便地处理DOM节点的更新，避免了不必要的处理，提高了渲染性能
          }
        } else if (isDef(ch)) { // 只有新vnode有子节点
          checkDuplicateKeys(ch);
          if (isDef(oldVnode.text)) { //如果旧vnode的text存在，但新vnode没有
            nodeOps.setTextContent(elm, '')//将elm的textContent属性置为''
          }//调用addVnodes增加真实的子节点
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) { // 旧vnode有子节点，新vnode没有
          removeVnodes(elm, oldCh, 0, oldCh.length - 1)//移除elm的所有子节点
        } else if (isDef(oldVnode.text)) {//都没有子节点，但旧vnode是文本节点
          nodeOps.setTextContent(elm, '') //将elm的textContent赋为''
        }
      } else if (oldVnode.text !== vnode.text) {//新vnode有text
        nodeOps.setTextContent(elm, vnode.text);// 设置elm的文本内容
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
          i(oldVnode, vnode);//如果存在后置处理钩子则调用
        }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;

    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // assert node match
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deepclass bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    // 在浏览器环境，__patch__方法就是patch，patch内部会通过createElm去创建真实的DOM元素，期间遇到子vnode会递归调用createElm，递归调用过程中，判断该节点类型是否为组件占位vnode，通过createComponent方法判断，该函数和渲染vnode阶段的createComponent不同，它会调用子组件的init钩子函数进行初始化，并完成组件的DOM插入
    return function patch(oldVnode, vnode, hydrating, removeOnly) {
      // oldVnode接收旧的vnode节点或旧的真实DOM节点，vnode接收新的vnode节点
      // 如果新的vnode节点没有定义，但旧的vnode有定义，则要调用invokeDestroyHook销毁旧vnode节点，并返回，如果新旧vnode都没有定义，直接返回
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
        return
      }
      var isInitialPatch = false; //是否是初次patch
      var insertedVnodeQueue = []; //insertedVnodeQueue队列
      // 新的vnode节点存在，分两种情况：存在旧的vnode节点，不存在旧vnode节点。如果不存在oldVnode，说明属于初次patch，要调用createElm根据vnode创建新的DOM节点。
      if (isUndef(oldVnode)) {
        isInitialPatch = true
        createElm(vnode, insertedVnodeQueue)
      // 如果存在oldVnode，要判断oldVnode是否是真实的DOM元素，如果oldVnode不是真实DOM元素，且新旧vnode满足旧vnode可复用的条件，则比较新旧vnode节点，更新DOM，通过调用patchVnode实现。如果oldVnode是真实DOM元素，则生成对应的空vnode节点覆盖掉oldVnode這個真實DOM元素。
      } else {
        var isRealElement = isDef(oldVnode.nodeType) // oldVnode是否是真实DOM元素
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else { 
          if (isRealElement) { 
            // 检查是否是服务端渲染，旧vnode的节点类型是元素节点，且
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            // 上下这两个if判断，都是与服务端渲染有关，暂时不看它们
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                warn('The client-side rendered virtual DOM tree is not matching server-rendered content. This is likely caused by incorrect HTML markup, for example nesting block-level elements inside <p>, or missing <tbody>. Bailing hydration and performing full client-side render.');
              }
            }
            oldVnode = emptyNodeAt(oldVnode)
          }
          // oldVnode不是真实DOM节点，且新旧vnode不是同一节点，即旧vnode不能复用，获取旧vnode对应的原生DOM节点，再获取它的父DOM节点。然后根据新的vnode创建新的原生DOM节点，并插入到DOM树中
          var oldElm = oldVnode.elm
          var parentElm = nodeOps.parentNode(oldElm)
          createElm(
            vnode,
            insertedVnodeQueue,
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          );
          // 现在新的DOM节点被创建出来了，如果新vnode节点有父级，则递归地更新父级占位符节点元素
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            // 获取vnode的父vnode，patchable代表vnode是否patch，即它是否有根DOM节点，首先向上遍历父级vnode，调用父vnode的各个模块的destroy钩子，将父vnode销毁
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor)
              }
              // 父vnode的DOM节点设为新vnode的DOM节点，如果新vnode是可patch的，
              ancestor.elm = vnode.elm
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else { //新vnode是不可patch的
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }
          // 销毁旧节点，如果旧vnode的父DOM节点存在，则从父DOM节点移除旧节点，如果旧vnode的父DOM节点不存在，且旧vnode有tag属性，说明它是元素节点，则销毁旧节点
          if (isDef(parentElm)) {
            removeVnodes(parentElm, [oldVnode], 0, 0)
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode)
          }
        }
      }
      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)//调用新节点的插入钩子
      return vnode.elm // patch函数返回vnode的真实DOM元素
    }
  }


  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode;
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive,update。
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  function normalizeDirectives$1(dirs, vm) {
    var res = Object.create(null);
    if (!dirs) return res
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    return res
  }

  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [ref, directives];

  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) return
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) return
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }
    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur);
      }
    }
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr (el, key, value) {
    if (el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, convertEnumeratedValue(key, value));
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && value !== '' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (isUndef(data.staticClass) &&
      isUndef(data.class) &&
      (isUndef(oldData) ||
        (isUndef(oldData.staticClass) && isUndef(oldData.class))
      )) return

    var cls = genClassForVnode(vnode);

    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = { create: updateClass, update: updateClass };

  var validDivisionCharRE = /[\w).+\-_$\]]/;

  function parseFilters (exp) {
    var inSingle = false;
    var inDouble = false;
    var inTemplateString = false;
    var inRegex = false;
    var curly = 0;
    var square = 0;
    var paren = 0;
    var lastFilterIndex = 0;
    var c, prev, i, expression, filters;
    for (i = 0; i < exp.length; i++) {
      prev = c;
      c = exp.charCodeAt(i);
      if (inSingle) {
        if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
      } else if (inDouble) {
        if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
      } else if (inTemplateString) {
        if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
      } else if (inRegex) {
        if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
      } else if (
        c === 0x7C && // pipe
        exp.charCodeAt(i + 1) !== 0x7C &&
        exp.charCodeAt(i - 1) !== 0x7C &&
        !curly && !square && !paren
      ) {
        if (expression === undefined) {
          // first filter, end of expression
          lastFilterIndex = i + 1;
          expression = exp.slice(0, i).trim();
        } else {
          pushFilter();
        }
      } else {
        switch (c) {
          case 0x22: inDouble = true; break         // "
          case 0x27: inSingle = true; break         // '
          case 0x60: inTemplateString = true; break // `
          case 0x28: paren++; break                 // (
          case 0x29: paren--; break                 // )
          case 0x5B: square++; break                // [
          case 0x5D: square--; break                // ]
          case 0x7B: curly++; break                 // {
          case 0x7D: curly--; break                 // }
        }
        if (c === 0x2f) { // /
          var j = i - 1;
          var p = (void 0);
          for (; j >= 0; j--) {
            p = exp.charAt(j);
            if (p !== ' ') break
          }
          if (!p || !validDivisionCharRE.test(p)) {
            inRegex = true;
          }
        }
      }
    }
    if (expression === undefined) {
      expression = exp.slice(0, i).trim();
    } else if (lastFilterIndex !== 0)
      pushFilter();
    function pushFilter () {
      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
      lastFilterIndex = i + 1;
    }
    if (filters) {
      for (i = 0; i < filters.length; i++)
        expression = wrapFilter(expression, filters[i]);
    }
    return expression
  }

  function wrapFilter (exp, filter) {
    var i = filter.indexOf('(');
    if (i < 0) {
      return ("_f(\"" + filter + "\")(" + exp + ")")
    } else {
      var name = filter.slice(0, i);
      var args = filter.slice(i + 1);
      return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
    }
  }
  function baseWarn (msg) {
    console.error(`[Vue compiler]: ${msg}`)
  }
  function pluckModuleFunction(modules, key) {
    return modules ? modules.map(m => m[key]).filter(_ => _) : []
  }

  function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push(rangeSetItem({ name, value, dynamic }, range));
    el.plain = false;
  }

  function addAttr (el, name, value, range, dynamic) {
    var attrs = dynamic
      ? (el.dynamicAttrs || (el.dynamicAttrs = []))
      : (el.attrs || (el.attrs = []));
    attrs.push(rangeSetItem({ name, value, dynamic }, range));
    el.plain = false;
  }

  function addRawAttr (el, name, value, range) {
    el.attrsMap[name] = value;
    el.attrsList.push(rangeSetItem({ name, value }, range));
  }

  // addDirective函数给ast对象el添加directives属性，它初始化是一个数组，专门存放它的指令
  function addDirective(el, name, rawName, value, arg, isDynamicArg, modifiers, range) {
    (el.directives || (el.directives = [])).push(rangeSetItem({ name, rawName, value, arg, isDynamicArg, modifiers }, range));//比如 name:'v-model', rawName: 'v-model', value: 'xxxx'
    el.plain = false;
  }

  function prependModifierMarker (symbol, name, dynamic) {
    return dynamic ? `_p(${name},"${symbol}")` : symbol + name
  }
  // 调用event.stopPropagation() 阻止事件继续传播 <a v-on:click.stop="doThis"></a>
  // 调用event.preventDefault() 阻止默认行为的发生 <form v-on:submit.prevent="onSubmit"></form>
  // 修饰符可以串联 <a v-on:click.stop.prevent="doThat"></a>
  // 只有修饰符 <form v-on:submit.prevent></form>
  // 添加事件监听器时使用事件捕获模式 即内部元素触发的事件先在此处理，然后才交由内部元素进行处理
  // <div v-on:click.capture="doThis">...</div>
  //只当在event.target是当前元素自身时触发处理函数 即事件不是从内部元素触发的
  // <div v-on:click.self="doThat">...</div>
  // 使用修饰符时，顺序很重要；用v-on:click.prevent.self会阻止所有的点击，而v-on:click.self.prevent只会阻止对元素自身的点击。
  // 点击事件将只会触发一次 <a v-on:click.once="doThis"></a>
  // <div v-on:scroll.passive="onScroll">...</div> 滚动事件的默认行为(即滚动行为)将会立即触发，而不会等待onScroll完成，这其中包含event.preventDefault()的情况。这个passive修饰符尤其能提升移动端的性能
  // 不要把.passive和.prevent一起使用，因为.prevent将会被忽略，.passive会告诉浏览器你不想阻止事件的默认行为。

  // addHandler函数是给ast对象el添加事件相关的属性。在组件上使用v-on只会监听自定义事件(用$emit才能触发的事件)。如果要监听根元素的原生事件，可以使用.native修饰符。
  function addHandler(el, name, value, modifiers, important, warn, range, dynamic) {
    modifiers = modifiers || emptyObject;
    if (warn && modifiers.prevent && modifiers.passive) {
      warn('passive和prevent修饰符不能同时使用。因为passive的处理回调不能阻止事件的默认行为', range);
    }
    if (modifiers.right) {
      if (dynamic) {
        name = `(${name})==='click'?'contextmenu':(${name})`
      } else if (name === 'click') {
        name = 'contextmenu'
        delete modifiers.right
      }
    } else if (modifiers.middle) {
      if (dynamic) {
        name = `(${name})==='click'?'mouseup':(${name})`
      } else if (name === 'click') {
        name = 'mouseup'
      }
    }
    if (modifiers.capture) {// 如果用了capture修饰符，如果v-on指令使用了动态属性(事件名用[]包裹)，name会变成'_p(select,"!")'，如果没有使用动态属性，name变成"!select"，加了一个!
      delete modifiers.capture;
      name = prependModifierMarker('!', name, dynamic)
    }
    if (modifiers.once) {// 如果用了once修饰符，和上面相似，如果没有使用动态属性(动态参数)。name变成~select
      delete modifiers.once;
      name = prependModifierMarker('~', name, dynamic);
    }
    if (modifiers.passive) {// 如果用了passive修饰符，&select
      delete modifiers.passive;
      name = prependModifierMarker('&', name, dynamic)
    }
    // 在一个组件的占位元素上直接监听一个原生事件，必须使用.native修饰符：<my-input v-on:focus.native="onFocus"></my-input>
    let events
    if (modifiers.native) { // 如果使用了native修饰符，说明给组件占位元素添加原生DOM事件，让events指向el.nativeEvents，如果el.nativeEvents不存在，初始化为{}
      delete modifiers.native
      events = el.nativeEvents || (el.nativeEvents = {})
    } else {//如果没有使用.native，说明是在DOM元素节点上添加原生DOM事件，或给组件占位元素添加自定义事件，events指向el.events，如果el.events不存在，初始化为{}
      events = el.events || (el.events = {})
    }
    const newHandler = rangeSetItem({ value: value.trim(), dynamic }, range) //newHandler对象主要信息就在value，它是事件绑定指令的值，它描述新添加进来的事件
    if (modifiers !== emptyObject) { //如果使用了修饰符，就往newHandler对象中添加modifiers属性
      newHandler.modifiers = modifiers //modifiers对象类似：{prevent:true,stop:true}
    }
    var handlers = events[name]; //事件name的所有处理回调(同一个事件可以有多个处理回调)
    if (Array.isArray(handlers)) { //如果events[name]是数组，即事件name对应的回调有多个
      // 函数形参important决定新添加的回调是放在数组的前面还是后面，决定了是先执行还是后执行
      important ? handlers.unshift(newHandler) : handlers.push(newHandler)
    } else if (handlers) {// events[name]不是数组，但有值，说明name事件的回调只有一个
      events[name] = important ? [newHandler, handlers] : [handlers, newHandler]//创建一个数组，放入新的newHandler和原有的handlers在一块
    } else { // events[name]不存在，说明name事件还没对应的回调
      events[name] = newHandler;//直接把newHandler赋给events[name]
    }
    // 上面的处理后，事件对象(数组)被挂载到el.nativeEvents/events上，组件占位元素的原生DOM事件的处理回调被挂载到el.nativeEvents上，其余情况挂载到el.events上
    el.plain = false; // 因为这个元素承载了事件的回调信息，不是纯的元素了
  }

  const getRawBindingAttr = (el, name) => el.rawAttrsMap[`:${name}`] || el.rawAttrsMap[`v-bind:${name}`] || el.rawAttrsMap[name]

  // 获取v-bind/:绑定属性的属性值 或 普通静态属性的值
  function getBindingAttr(el, name, getStatic) {
    var dynamicValue = getAndRemoveAttr(el, `:${name}`) || getAndRemoveAttr(el, `v-bind:${name}`)
    // 获取名为name的绑定属性的值，即比如:xxx或v-bind:xxx的属性值
    if (dynamicValue != null) { //如果成功获取到绑定的属性值，调用parseFilters对值进行处理
      return parseFilters(dynamicValue) // 因为用户编写绑定的属性值可能用了filter 
    } else if (getStatic !== false) {// 没有获取到绑定的属性值，且getStatic没有传false
      var staticValue = getAndRemoveAttr(el, name) // 则转而获取静态的属性值
      if (staticValue != null) return JSON.stringify(staticValue) //如果静态属性值存在，它不被视作表达式或变量，而是一个字符串，所以用JSON.stringify处理，它保证了静态属性的属性值总是字符串。编译器生成的渲染函数是代码字符串，要new Function才能变成函数，JSON.stringify后的值在new Function后也还是字符串
    }
  }

  // 从元素描述对象的attrsMap对象中取出相应的属性，并从attrsList(attrsMap)中移除
  function getAndRemoveAttr(el, name, removeFromMap) {
    var val
    if ((val = el.attrsMap[name]) != null) { //attrsMap对象存放该元素所有属性的name:value键值对，如果属性name存在，属性值赋给val
      var list = el.attrsList; // 获取el.attrsList，遍历它
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === name) { //找出list中属性name对应的对象，删掉
          list.splice(i, 1);
          break
        }
      }
    }
    if (removeFromMap)//如果第三个参数传了真值，attrsMap中的属性name也删掉
      delete el.attrsMap[name];
    return val //函数的主要目的就是获取属性的值
  }

  function getAndRemoveAttrByRegex(el, name) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      var attr = list[i];
      if (name.test(attr.name)) {
        list.splice(i, 1);
        return attr
      }
    }
  }

  function rangeSetItem(item, range) {
    if (range) {
      if (range.start != null) {
        item.start = range.start;
      }
      if (range.end != null) {
        item.end = range.end;
      }
    }
    return item
  }

  function genComponentModel(el, value, modifiers) {
    var ref = modifiers || {};
    var number = ref.number;
    var trim = ref.trim;

    var baseValueExpression = '$$v';
    var valueExpression = baseValueExpression;
    if (trim) {
      valueExpression =
        "(typeof " + baseValueExpression + " === 'string'" +
        "? " + baseValueExpression + ".trim()" +
        ": " + baseValueExpression + ")";
    }
    if (number) {
      valueExpression = "_n(" + valueExpression + ")";
    }
    var assignment = genAssignmentCode(value, valueExpression);

    el.model = {
      value: ("(" + value + ")"),
      expression: JSON.stringify(value),
      callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
    };
  }

  // value是v-model或使用了.sync的bind指令的值，assignment是想要分配给value的真正的值。genAssignmentCode函数的目的是编写双向绑定的赋值表达式的代码。
  function genAssignmentCode(value, assignment) {
    var res = parseModel(value); // 对v-model的值的解析结果，形如: {exp:"visible", key:null}
    if (res.key === null) { //key属性值为空，说明v-model的值没有. 函数表达式是直接将assignment赋给value就好
      return `${value}=${assignment}`//生成形如"value = $event.target.value"的函数代码，在真正执行渲染函数时，就会将真正希望的求值赋给双向绑定的属性
    } else { // 如果v-model的值中有. 比如 v-model绑定的是a.b.c，res.exp就是"a.b"，res.key就是"c"，生成形如"$set('a.b','c',$event)"这样的函数代码，真正执行渲染函数时，就能给a.b添加属性c，值为真正希望的求值
      return `$set(${res.exp}, ${res.key}, ${assignment})`
    }
  }

  var len, str, chr, index$1, expressionPos, expressionEndPos;

  // val对v-model或使用了.sync的bind指令的值，对它进行解析
  function parseModel (val) {
    val = val.trim(); //允许你写的时候出现空格：v-model="obj.val "
    len = val.length;
    // v-model还允许类似这么写：v-model="a[b]"，如果不是这种写法
    if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
      index$1 = val.lastIndexOf('.'); // index$1记录.最后出现的位置，v-model的值可以这么写a.b.c
      if (index$1 > -1) { // v-model的值存在 . 比如 a.b.c
        return { // parseModel函数返回一个对象，exp值为字段 "a.b"
          exp: val.slice(0, index$1),
          key: '"' + val.slice(index$1 + 1) + '"' // key值为 "c"
        }
      } else { // 如果val字符串中没有. ，exp值就为val，key为null
        return { exp: val, key: null }
      }
    }

    str = val;
    index$1 = expressionPos = expressionEndPos = 0;

    while (!eof()) {
      chr = next();
      if (isStringStart(chr)) {
        parseString(chr);
      } else if (chr === 0x5B) {
        parseBracket(chr);
      }
    }

    return {
      exp: val.slice(0, expressionPos),
      key: val.slice(expressionPos + 1, expressionEndPos)
    }
  }

  function next () {
    return str.charCodeAt(++index$1)
  }

  function eof () {
    return index$1 >= len
  }

  function isStringStart (chr) {
    return chr === 0x22 || chr === 0x27
  }

  function parseBracket (chr) {
    var inBracket = 1;
    expressionPos = index$1;
    while (!eof()) {
      chr = next();
      if (isStringStart(chr)) {
        parseString(chr);
        continue
      }
      if (chr === 0x5B) { inBracket++; }
      if (chr === 0x5D) { inBracket--; }
      if (inBracket === 0) {
        expressionEndPos = index$1;
        break
      }
    }
  }

  function parseString (chr) {
    var stringQuote = chr;
    while (!eof()) {
      chr = next();
      if (chr === stringQuote) {
        break
      }
    }
  }

  var warn$1;

  // 在某些情况下，使用的事件必须在运行时确定，因此我们在编译期间使用了一些保留标记。
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  function model(el, dir, _warn) {
    warn$1 = _warn;
    var value = dir.value; // v-model指令的值
    var modifiers = dir.modifiers; // v-model指令的修饰符
    var tag = el.tag; // 标签名
    var type = el.attrsMap.type; // 元素的type属性的值

    // 如果标签是input且type是file，不能用v-model进行双向绑定，因为file type的inputs是只读的
    if (tag === 'input' && type === 'file') {
      warn$1(`<${el.tag} v-model="${value}" type="file">:\n File inputs are read only. Use a v-on:change listener instead.`, el.rawAttrsMap['v-model']); 
    }
    if (el.component) { // 如果是自定义组件用了v-model
      genComponentModel(el, value, modifiers);
      return false
    } else if (tag === 'select') { // 如果是select表单元素
      genSelect(el, value, modifiers);
    } else if (tag === 'input' && type === 'checkbox') { // 如果是checkbox表单元素
      genCheckboxModel(el, value, modifiers);
    } else if (tag === 'input' && type === 'radio') { // 如果是radio表单元素
      genRadioModel(el, value, modifiers);
    } else if (tag === 'input' || tag === 'textarea') { // 如果是input或textarea元素
      genDefaultModel(el, value, modifiers);
    } else if (!config.isReservedTag(tag)) {
      genComponentModel(el, value, modifiers);
      // component v-model doesn't need extra runtime
      return false
    } else { // 如果不是表单元素使用v-model，会警告，双向绑定只针对表单元素
      warn$1(`<${el.tag} v-model="${value}">: v-model is not supported on this element type. If you are working with contenteditable, it\'s recommended to wrap a library dedicated for that purpose inside a custom component.`, el.rawAttrsMap['v-model']);
    }
    // ensure runtime directive metadata
    return true
  }

  function genCheckboxModel(el, value, modifiers) {
    var number = modifiers && modifiers.number;
    var valueBinding = getBindingAttr(el, 'value') || 'null';
    var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
    var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
    addProp(el, 'checked',
      "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")")
      )
    );
    addHandler(el, 'change',
      "var $$a=" + value + "," +
          '$$el=$event.target,' +
          "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
      'if(Array.isArray($$a)){' +
        "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            '$$i=_i($$a,$$v);' +
        "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
        "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
      "}else{" + (genAssignmentCode(value, '$$c')) + "}",
      null, true
    );
  }

  function genRadioModel(el, value, modifiers) {
    var number = modifiers && modifiers.number;
    var valueBinding = getBindingAttr(el, 'value') || 'null';
    valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
    addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
    addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
  }

  function genSelect(el, value, modifiers) {
    var number = modifiers && modifiers.number;
    var selectedVal = "Array.prototype.filter" +
      ".call($event.target.options,function(o){return o.selected})" +
      ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
      "return " + (number ? '_n(val)' : 'val') + "})";
    var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
    var code = "var $$selectedVal = " + selectedVal + ";";
    code = code + " " + (genAssignmentCode(value, assignment));
    addHandler(el, 'change', code, null, true);
  }

  // 处理普通input标签或textarea标签的v-model指令
  function genDefaultModel(el, value, modifiers) {
    var type = el.attrsMap.type; // 获取属性type值，比如text，如果未指定则为undefined
    // 如果v-model的值和v-bind的值相同，会有冲突而报错
    var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value']; //获取动态绑定的value值
    var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];//获取动态绑定的type值
    if (value$1 && !typeBinding) {//如果动态绑定了value 且没有绑定type，则报错。
      var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
      warn$1(`${binding}="${value}" conflicts with v-model on the same element because the latter already expands to a value binding internally`, el.rawAttrsMap[binding]);
    }
    var ref = modifiers || {}; //modifiers存的是v-model的修饰符
    var lazy = ref.lazy;
    var number = ref.number;
    var trim = ref.trim;
    var needCompositionGuard = !lazy && type !== 'range';
    // 如果添加了lazy修饰符，将会触发的同步的事件从input改为change
    var event = lazy ? 'change' : type === 'range' ? RANGE_TOKEN : 'input';
    var valueExpression = '$event.target.value'; // 此字符串表达式是this.$event.target.value的求值
    if (trim) { // 如果有trim修饰符，则在值后面加上trim()
      valueExpression = "$event.target.value.trim()";
    }
    if (number) {//如果有number修饰符，则加上_n 即全局的toNumber函数
      valueExpression = "_n(" + valueExpression + ")";
    }
    // 传入v-model的值value，和真正想求的值valueExpression
    var code = genAssignmentCode(value, valueExpression); // 生成一个表达式字符串，valueExpression的值赋给value。例如:message=$event.target.value
    if (needCompositionGuard) { // 如果是在输入法中选择文字，这个过程不会更新，直接返回
      code = "if($event.target.composing)return;" + code;
    }
    // 双向绑定就是靠这两行代码：
    addProp(el, 'value', `(${value})`) // 给当前元素的描述对象的props数组添加一个对象，name为value，value为v-model的值
    addHandler(el, event, code, null, true); // 给el的nativeEvents属性添加event事件（input/change）
    if (trim || number) {
      addHandler(el, 'blur', '$forceUpdate()');
    }
  }

  function normalizeEvents (on) {
    if (isDef(on[RANGE_TOKEN])) { //如果on对象中存在__r，说明type=rangeie
      var event = isIE ? 'change' : 'input'; //如果是ie浏览器环境下，这个type属性只支持ie10+，并且只有change事件。
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  function createOnceHandler$1 (event, handler, capture) {
    var _target = target$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

  // add$1函数是在原生DOM上绑定事件，利用了EventTarget的addEventListener方法，target$1是vnode对应的真实DOM对象，而它可以通过原型链引用到addEventListener方法。
  function add$1(name, handler, capture, passive) {
    if (useMicrotaskFix) {
      var attachedTimestamp = currentFlushTimestamp;
      var original = handler;
      handler = original._wrapper = function (e) {
        if (e.target === e.currentTarget ||
          e.timeStamp >= attachedTimestamp ||
          e.timeStamp <= 0 ||
          e.target.ownerDocument !== document
        ) return original.apply(this, arguments)
      };
    }
    target$1.addEventListener(name, handler, supportsPassive ? { capture, passive } : capture) //将事件name注册到真实DOM对象上，当该对象触发事件name时，回调函数handler就会执行
  }

  // remove$2函数是通过调用removeEventListener来删除用addEventListener添加过的事件
  function remove$2(name, handler, capture, _target) {
    (_target || target$1).removeEventListener(name, handler._wrapper || handler, capture);
  }

  // 更新原生dom事件，区别于更新自定义事件。传入旧的和新的vnode对象
  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) return //如果新旧vnode对象都没有on，说明都没有自定义事件，直接返回
    var on = vnode.data.on || {}; // 这就是之前生成的data中对应的事件对象
    var oldOn = oldVnode.data.on || {}; // 旧vnode的on对象
    target$1 = vnode.elm; // 获取当前vnode的真实DOM对象
    normalizeEvents(on);// normalizeEvents是对事件兼容性的处理
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
    // updateListeners函数会遍历on对象，对新节点事件绑定注册事件，对旧节点移除事件监听，既要处理原生DOM事件的添加和移除，也要处理自定义事件的添加和移除。
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };
  // 在patch过程中的创建阶段和更新阶段都会执行updateDOMListeners

  var svgContainer;

  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) return
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as theuser probably wants to mutate it
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    for (key in oldProps) {
      if (!(key in props)) elm[key] = '';
    }

    for (key in props) {
      cur = props[key];
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') {
        elm._value = cur;
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
        // IE doesn't support innerHTML for SVG elements
        svgContainer = svgContainer || document.createElement('div');
        svgContainer.innerHTML = "<svg>" + cur + "</svg>";
        var svg = svgContainer.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        cur !== oldProps[key]
      ) {
        try {
          elm[key] = cur;
        } catch (e) {}
      }
    }
  }

  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty (elm, checkVal) {
    var notInFocus = true;
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef(modifiers)) {
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    return data.staticStyle ? extend(data.staticStyle, style) : style
  }

  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;
    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend(res, styleData);
      }
    }
    return res
  }


  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) return
    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};
    var oldStyle = oldStaticStyle || oldStyleBinding;
    var style = normalizeStyleBinding(vnode.data.style) || {};
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;
    var newStyle = getStyle(vnode, true);
    for (name in oldStyle) {
      if (isUndef(newStyle[name])) 
        setProp(el, name, '');
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  var whitespaceRE = /\s+/;

  function addClass (el, cls) {
    if (!cls || !(cls = cls.trim())) return
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  function removeClass (el, cls) {
    if (!cls || !(cls = cls.trim())) return

    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  function resolveTransition (def$$1) {
    if (!def$$1) return
    if (typeof def$$1 === 'object') {
      var res = {};
      if (def$$1.css !== false) {
        extend(res, autoCssTransition(def$$1.name || 'v'));
      }
      extend(res, def$$1);
      return res
    } else if (typeof def$$1 === 'string') {
      return autoCssTransition(def$$1)
    }
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  var raf = inBrowser ?
    window.requestAnimationFrame ?
    window.requestAnimationFrame.bind(window) :
    setTimeout :
    fn => fn()

  function nextFrame(fn) {
    raf(() => {
      raf(fn)
    })
  }

  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  function whenTransitionEnds(el, expectedType, cb) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
    var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
    var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);
    var type;
    var timeout = 0;
    var propCount = 0;
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0 ?
        transitionTimeout > animationTimeout ?
        TRANSITION :
        ANIMATION :
        null;
      propCount = type ?
        type === TRANSITION ?
        transitionDurations.length :
        animationDurations.length :
        0;
    }
    var hasTransform =
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type,
      timeout,
      propCount,
      hasTransform
    }
  }

  function getTimeout (delays, durations) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  function toMs (s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;
    // call leave callback now
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }
    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) return
    if (isDef(el._enterCb) || el.nodeType !== 1) return

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;
    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') return

    var startClass = isAppear && appearClass ?
      appearClass :
      enterClass;
    var activeClass = isAppear && appearActiveClass ?
      appearActiveClass :
      enterActiveClass;
    var toClass = isAppear && appearToClass ?
      appearToClass :
      enterToClass;

    var beforeEnterHook = isAppear ?
      (beforeAppear || beforeEnter) :
      beforeEnter;
    var enterHook = isAppear ?
      (typeof appear === 'function' ? appear : enter) :
      enter;
    var afterEnterHook = isAppear ?
      (afterAppear || afterEnter) :
      afterEnter;
    var enterCancelledHook = isAppear ?
      (appearCancelled || enterCancelled) :
      enterCancelled;

    var explicitEnterDuration = toNumber(isObject(duration) ? duration.enter : duration);

    if (explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave (vnode, rm) {
    var el = vnode.elm;

    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm()
    }

    if (isDef(el._leaveCb)) return

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(isObject(duration) ? duration.leave : duration);

    if (isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      if (cb.cancelled) return
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) cb();
    }
  }

  function checkDuration (val, name, vnode) {
    if (typeof val !== 'number') {
      warn("<transition> explicit " + name + " duration is not a valid number - got " + (JSON.stringify(val)) + ".", vnode.context);
    } else if (isNaN(val)) {
      warn("<transition> explicit " + name + " duration is NaN - " + 'the duration expression might be incorrect.', vnode.context);
    }
  }

  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) return false
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter (_, vnode) {
    if (vnode.data.show !== true)
      enter(vnode);
  }

  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove(vnode, rm) {
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [attrs, klass, events, domProps, style, transition];

  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps, modules })// patch函数是createPatchFunction函数的返回值，nodeOps封装了一系列操作原生DOM对象的方法，modules定义了模块的钩子函数

  if (isIE9) {
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) trigger(el, 'input')
    });
  }

  var directive = {
    inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          el.addEventListener('change', onCompositionEnd);
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },
    componentUpdated(el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
      warn("<select multiple v-model=\"" + (binding.expression) + "\"> expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)), vm);
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) option.selected = selected;
      } else {
        if (looseEqual(getValue(option), value)) {
          if (el.selectedIndex !== i) el.selectedIndex = i
          return
        }
      }
    }
    if (!isMultiple) el.selectedIndex = -1;
  }

  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  function getValue (option) {
    return '_value' in option ? option._value : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    if (!e.target.composing) return
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  const locateNode = vnode => vnode.componentInstance && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.componentInstance._vnode) : vnode

  var show = {
    bind (el, ref, vnode) {
      var value = ref.value;
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update(el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind(el, binding, vnode, oldVnode, isDestroy) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var transitionProps = { name: String, appear: Boolean, css: Boolean, mode: String, type: String, enterClass: String, leaveClass: String, enterToClass: String, leaveToClass: String, enterActiveClass: String, leaveActiveClass: String, appearClass: String, appearActiveClass: String, appearToClass: String, duration: [Number, String, Object] };

  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) return true
    }
  }

  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var isNotTextNode = (c) => c.tag || isAsyncPlaceholder(c); 

  var isVShowDirective = (d) => d.name === 'show'; 

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,
    render: function render (h) {
      var this$1 = this;
      var children = this.$slots.default;
      if (!children) return
      children = children.filter(isNotTextNode);
      if (!children.length) return
      if (children.length > 1) {
        warn('<transition> can only be used on a single element. Use ' + '<transition-group> for lists.', this.$parent); 
      }
      var mode = this.mode;
      if (mode && mode !== 'in-out' && mode !== 'out-in') {
        warn('invalid <transition> mode: ' + mode, this.$parent );
      }
      var rawChild = children[0];

      if (hasParentTransition(this.$vnode)) return rawChild
        
      var child = getRealChild(rawChild);
      if (!child)
        return rawChild
      if (this._leaving) {
        return placeholder(h, rawChild)
      }

      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true;
      }
      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {

        var oldData = oldChild.data.transition = extend({}, data);
        if (mode === 'out-in') {
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }
      return rawChild
    }
  };

  var props = extend({ tag: String, moveClass: String }, transitionProps);
  delete props.mode;
  var TransitionGroup = {
    props,
    beforeMount () {
      const update = this._update
      this._update = (vnode, hydrating) => {
        const restoreActiveInstance = setActiveInstance(this)
        this.__patch__(
          this._vnode,
          this.kept,
          false, // hydrating
          true // removeOnly (!important, avoids unnecessary moves)
        )
        this._vnode = this.kept
        restoreActiveInstance()
        update.call(this, vnode, hydrating)
      }
    },
    render (h) {
      const tag = this.tag || this.$vnode.data.tag || 'span'
      const map = Object.create(null)
      const prevChildren = this.prevChildren = this.children
      const rawChildren = this.$slots.default || []
      const children = this.children = []
      const transitionData = extractTransitionData(this)
  
      for (let i = 0; i < rawChildren.length; i++) {
        const c = rawChildren[i]
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c)
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData
          } else if (process.env.NODE_ENV !== 'production') {
            const opts = c.componentOptions
            const name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag
            warn(`<transition-group> children must be keyed: <${name}>`)
          }
        }
      }
      if (prevChildren) {
        const kept = []
        const removed = []
        for (let i = 0; i < prevChildren.length; i++) {
          const c = prevChildren[i]
          c.data.transition = transitionData
          c.data.pos = c.elm.getBoundingClientRect()
          if (map[c.key]) {
            kept.push(c)
          } else {
            removed.push(c)
          }
        }
        this.kept = h(tag, null, kept)
        this.removed = removed
      }
      return h(tag, null, children)
    },
    updated () {
      const children = this.prevChildren
      const moveClass = this.moveClass || ((this.name || 'v') + '-move')
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) return
  
      children.forEach(callPendingCbs)
      children.forEach(recordPosition)
      children.forEach(applyTranslation)
  
      this._reflow = document.body.offsetHeight
  
      children.forEach((c) => {
        if (c.data.moved) {
          const el = c.elm
          const s = el.style
          addTransitionClass(el, moveClass)
          s.transform = s.WebkitTransform = s.transitionDuration = ''
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (e && e.target !== el) {
              return
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb)
              el._moveCb = null
              removeTransitionClass(el, moveClass)
            }
          })
        }
      })
    },
    methods: {
      hasMove(el, moveClass) {
        if (!hasTransition) return false
        if (this._hasMove) return this._hasMove
        
        const clone = el.cloneNode()
        if (el._transitionClasses) {
          el._transitionClasses.forEach((cls) => { removeClass(clone, cls) })
        }
        addClass(clone, moveClass)
        clone.style.display = 'none'
        this.$el.appendChild(clone)
        const info = getTransitionInfo(clone)
        this.$el.removeChild(clone)
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs (c) {
    if (c.elm._moveCb)
      c.elm._moveCb();
    if (c.elm._enterCb)
      c.elm._enterCb();
  }

  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  // 给Vue.options.directives添加model,show属性
  extend(Vue.options.directives, {
    model: directive,//将v-model和v-show的指令信息保存到Vue.options.directives
    show  // v-model和v-show这两个指令和平台无关的，不管任何环境都可以用
  });
  extend(Vue.options.components, { // 给Vue.options.components添加Transition,TransitionGroup属性
    Transition,
    TransitionGroup
  })

  // 如果运行在浏览器，__patch__是patch，如果是服务端渲染，因为没有DOM，__patch__是一个空函数
  Vue.prototype.__patch__ = inBrowser ? patch : noop

  // 执行$mount最后都执行mountComponent，作用是将组件实例挂载到DOM元素上，其实就是将模版渲染到DOM节点中，并且以后当数据变化时，会重渲染到指定的DOM元素。
  function mountComponent (vm, el, hydrating) {
    vm.$el = el
    // 给组件实例vm添加$el属性，它存组件模板的根元素，现在赋值为el只是暂时的，是为了给patch方法使用的，实际上vm.$el会被patch方法的返回值重写
    // 如果不存在渲染函数，则将render选项设为创建空vnode节点的函数，并报警
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') || vm.$options.el || el) {
        warn('你在使用运行时版本的Vue，无法编译模板，请把模版预编译成渲染函数，或使用有编译器的版本', vm)
      } else {
        warn('挂载组件失败：模版和render函数未定义', vm)
      }
    }
    callHook(vm, 'beforeMount') // 组件实例挂载前调用beforeMount生命周期函数。
    const updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
    // 然后定义updateComponent函数，它是要被观察的函数，内部调用vm._render执行vm.$options.render渲染函数，生成一份最新的vnode树，接着执行vm._update，比对新旧vnode树，把生成的vnode树渲染成真实DOM，其核心就是vm.__patch__，总之updateComponent做的是渲染操作。
    // 挂载是持续性的，不是渲染一次就完事，渲染之后每次数据发生变化都会进行重新渲染，这是通过为updateComponent创建watcher实现的。new Watcher会对updateComponent函数求值，它的执行会间接执行渲染函数，从而触发数据属性的getter，将该渲染函数的watcher收集到dep，即渲染函数中依赖的所有数据都会被该watcher观察，当数据变化时，将重新对updateComponent函数求值，从而重新渲染
    new Watcher(vm, updateComponent, noop, { //第三个参数是cb
      before() {
        if (vm._isMounted && !vm._isDestroyed) callHook(vm, 'beforeUpdate')
      }
    }, true /*只有渲染函数的watcher才传真*/)
    // cb传noop，即当数据变化时，在run方法中执行cb时什么都不做，但this.get()会对呗观察目标求值，即执行updateComponent，重新渲染是靠重新求值而不是cb的执行。那么，updateComponent的重复执行会触发多次数据属性的get，但不会导致重复收集依赖，因为做了处理。 before选项传入了一个函数，在数据变化后，更新执行前执行。函数内容是，如果组件已经挂载完毕且没有被销毁，则调用beforeUpdate钩子函数
    hydrating = false
    // 如果vm.$vnode为空，说明当前没有父级vnode，当前实例是根实例，给根实例添加_isMounted属性，值为true，标识根实例挂载完成，再调用mounted钩子函数
    if (vm.$vnode == null) {
      vm._isMounted = true
      callHook(vm, 'mounted')
    }
    return vm
  }
  // 这是运行时版的Vue的$mount函数，核心是执行mountComponent(真正的挂载)。当我们在选项中手写渲染函数去定义渲染过程，这时并不需要包含编译器的Vue即可完整执行。当我们利用webpack进行Vue的工程化开发时，会利用Vue-loader对vue文件进行编译，尽管我们也是在写模板字符串，但此时Vue已经不需要利用编译器去进行模板编译了，这个过程交给了插件去实现
  Vue.prototype.$mount = function (el, hydrating) {
    el = el && inBrowser ? query(el) : undefined
    return mountComponent(this, el, hydrating)
  }// 编译的过程会带来性能的损耗，加入编译器的Vue的体积会增加3成，因此在实际开发中，需要借助webpack的vue-loader这类工具进行编译，即把Vue的模板编译阶段合并到webpack的构建流程中，减少了生产环境代码的体积，也提高了运行时的性能。

  if (inBrowser) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        } else {
          console[console.info ? 'info' : 'log']('Download the Vue Devtools extension for a better development experience:\nhttps://github.com/vuejs/vue-devtools');
        }
      }
      if (config.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log']("You are running Vue in development mode.\nMake sure to turn on production mode when deploying for production.\nSee more tips at https://vuejs.org/guide/deployment.html");
      }
    }, 0);
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

  var buildRegex = cached(function (delimiters) {
    var open = delimiters[0].replace(regexEscapeRE, '\\$&');
    var close = delimiters[1].replace(regexEscapeRE, '\\$&');
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
  });

  // 解析插值符号里的文本，{{}}内应当被视为表达式而不是字符串，区别于{{}}之外的静态文本
  function parseText(text, delimiters) { // 第二个参数是改变Vue原本的{{}}插值符号，比如传['${', '}']，那么插值符号就不是{{}}，而是${}
    var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
    if (!tagRE.test(text)) return // 如果没有匹配到插值符号和它里面的内容，就直接返回
    var tokens = [];
    var rawTokens = [];
    var lastIndex = tagRE.lastIndex = 0; //lastIndex属性是全局匹配时下一轮匹配的起始索引
    var match, index, tokenValue;
    while (match = tagRE.exec(text)) { // 匹配{{}}的正则调用exec，如果捕获成功捕获返回一个对象，赋给match，然后text被截去已捕获的部分，继续捕获，直到exec返回null，终止while循环，比如一开始defaultTagRE.exec('efe{{fee}}fefe{{ofefe}}efe')，match对象为：
      // [
      //   '{{fee}}',
      //   'fee',
      //   index: 3,
      //   input: 'efe{{fee}}fefe{{ofefe}}efe',
      //   groups: undefined
      // ]
      index = match.index; // index是每次捕获到{{xxx}}的在原字符串中的起始索引
      // 当前lastIndex为本次捕获之前的值，如果index大于lastIndex就说明，你本次捕获的{{}}之前还有别的字符，比如effe{{fefe}}，区别于{{fefe}}fefef
      if (index > lastIndex) {
         //出现这种情况，将text字符串截取出(lastIndex, index)的部分，即{{}}之前的没有在{{}}的字符，赋给tokenValue，同时push进rawTokens数组中。比如abc{{fefe}}中的abc
        rawTokens.push(tokenValue = text.slice(lastIndex, index));
        tokens.push(JSON.stringify(tokenValue)); // 将tokenValue的值stringify处理，保证了最后编译成函数时，它依然是字符串而不是表达式
      }
      var exp = parseFilters(match[1].trim()); // match[1]为{{}}中的内容字符串，因为{{}}中可能会使用filter过滤器，需要调用parseFilters处理一下，比如no|add(100)，解析后的字符串为:_f("add")(no,100)
      tokens.push(("_s(" + exp + ")")); //编写成函数代码字符串时，会调用_s函数，即把exp值转字符串，exp值有可能是基本类型的也有可能是数组或对象那样的引用类型值。
      rawTokens.push({ '@binding': exp });
      lastIndex = index + match[0].length; // 将lastIndex更新，跳过了已经解析的{{}}的长度，更新为下一次捕获开始的索引
    }
    // 也就是捕获完毕后，还有剩余的字符串，就把剩下的部分截取，赋给tokenValue，再推入到tokenValue数组中，stringify后的tokenValue推入tokens
    if (lastIndex < text.length) {
      rawTokens.push(tokenValue = text.slice(lastIndex));
      tokens.push(JSON.stringify(tokenValue));
    }
    return {
      expression: tokens.join('+'),
      tokens: rawTokens
    }
  }

  function transformNode (el, options) {
    var warn = options.warn || baseWarn;
    var staticClass = getAndRemoveAttr(el, 'class');
    if (staticClass) {
      var res = parseText(staticClass, options.delimiters);
      if (res) {
        warn(
          "class=\"" + staticClass + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div class="{{ val }}">, use <div :class="val">.',
          el.rawAttrsMap['class']
        );
      }
    }
    if (staticClass) {
      el.staticClass = JSON.stringify(staticClass);
    }
    var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
    if (classBinding) {
      el.classBinding = classBinding;
    }
  }

  function genData (el) {
    var data = '';
    if (el.staticClass) {
      data += "staticClass:" + (el.staticClass) + ",";
    }
    if (el.classBinding) {
      data += "class:" + (el.classBinding) + ",";
    }
    return data
  }

  function transformNode$1 (el, options) {
    var warn = options.warn || baseWarn;
    var staticStyle = getAndRemoveAttr(el, 'style');
    if (staticStyle) {
      var res = parseText(staticStyle, options.delimiters);
      if (res) {
        warn(
          "style=\"" + staticStyle + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.',
          el.rawAttrsMap['style']
        );
      }
      el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
    }

    var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
    if (styleBinding) {
      el.styleBinding = styleBinding;
    }
  }

  function genData$1 (el) {
    var data = '';
    if (el.staticStyle) {
      data += "staticStyle:" + (el.staticStyle) + ",";
    }
    if (el.styleBinding) {
      data += "style:(" + (el.styleBinding) + "),";
    }
    return data
  }

  var decoder;
  var he = { 
    decode (html) { // 比如传入'&#x26;'
      decoder = decoder || document.createElement('div');
      decoder.innerHTML = html;
      return decoder.textContent // 返回字符'&'
    }
  };

  var isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
  );

  // 匹配标签的属性 class="xxx" class='xxx' class=xxx  disabled
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  
  var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
  // XML中，标签可以自定义，比如<bug></bug>，所以不同的文档中如果定义了相同的标签，就会产生冲突，为此，XML允许用户为标签指定前缀 <k:bug></k:bug> 除了前缀还可以使用命名空间，即标签的xmlns属性，为前缀
  var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
  var startTagOpen = new RegExp(("^<" + qnameCapture))//匹配<xxx 开始标签的开头部分
  var startTagClose = /^\s*(\/?)>/ // 匹配开始标签的结束部分，> 或 />
  var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"))//匹配结束标签 比如</div>
  var doctype = /^<!DOCTYPE [^>]+>/i;
  var comment = /^<!\--/;
  var conditionalComment = /^<!\[/;

  // Special Elements (can contain anything)
  var isPlainTextElement = makeMap('script,style,textarea', true); // 检测给定的标签名是否是纯文本标签
  var reCache = {};

  var isIgnoreNewlineTag = makeMap('pre,textarea', true);
  
  var shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; 

  // 解码html实体的，转为对应的字符
  function decodeAttr (value, shouldDecodeNewlines) {
    const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
    const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;
    const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
    const decodingMap = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&amp;': '&', '&#10;': '\n', '&#9;': '\t', '&#39;': "'" };
    return value.replace(re, match => decodingMap[match])
  }

  // parseHTML 是做词法分析的。具体是通过读取字符流配合正则一点点地解析字符串，直到整个字符串都被解析完。并且每遇到一个特定的token时都会调用相应的钩子函数，将有用的参数传递过去。比如每当遇到一个开始标签都会调用options.start：
  function parseHTML(html, options) {
    var stack = [];
    // 如何判断一个2元标签是否缺少结束标签，比如parse<article><section><div></section></article>时，每遇到一个2元标签的开始标签都会将它推入stack，然后会遇到结束标签，最先遇到的结束标签是</section>，对应的应该是上次被最后压入栈的栈顶元素，但栈顶不是<section>，而是div，说明div标签缺少闭合标签，这就是检测html字符串是否缺少闭合标签的原理
    var expectHTML = options.expectHTML; //布尔值
    var isUnaryTag$$1 = options.isUnaryTag || no; // 检查标签是否是1元标签
    var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
    // parser选项大部分和编译器的选项相同，
    var index = 0; // 当前字符流的读入位置
    var last, lastTag; // last：存储未parse的字符串，lastTag：存着stack的栈顶元素
    while (html) { // 循环结束的条件：html字符串为空
      last = html; // last存储未parse的字符串，一次循环之后html应该做了截取，更新last
      if (lastTag && isPlainTextElement(lastTag)) { // 处理纯文本标签的内容
        // stack的栈顶元素存在且是纯文本标签，即上一次遇到的是纯文本标签，说明正在解析的是纯文本标签里的内容
        var endTagLength = 0; // 保存纯文本标签的结束标签的字符长度
        var stackedTag = lastTag.toLowerCase();
        var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
        // reStackedTag用来匹配纯文本标签的内容以及结束标签。假设当前html是 jwy</textarea>，匹配正则后将其替换为''，那rest$1会变成''，假如字符串是 jwy</textarea>judy，rest$1则是judy
        var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
          // all是匹配到的jwy</textarea>，text为第一个捕获组：纯文本标签的内容jwy，endTag是</textarea>
          endTagLength = endTag.length; // 更新结束标签的长度
          if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
            text = text
              .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
              .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
          }
          if (shouldIgnoreFirstNewline(stackedTag, text)) { //如果栈顶元素是<pre>或<textarea>，且文本内容的第一个字符是\n
            text = text.slice(1); // 忽略标签内容的第一个\n
          }
          if (options.chars) {
            options.chars(text); // 将纯文本标签的内容全部作为纯文本对待
          }
          return ''
        });
        index += html.length - rest$1.length; // 等号右边的差是被replace的那部分的长度
        html = rest$1; // 剩下的字符串赋给html
        parseEndTag(stackedTag, index - endTagLength, index);// 解析纯文本标签的结束标签
      } else { // 当前parse的内容不是在纯文本标签里(script style textarea)
        var textEnd = html.indexOf('<'); // textEnd是html字符串中<第一次出现的位置
        if (textEnd === 0) { // 第一个字符就是<，比如：<div>hello</div>
          if (comment.test(html)) {// 可能是注释节点：
            // 只是可能，因为完整的注释节点要以<!--开头，还要以-->结尾
            var commentEnd = html.indexOf('-->'); // html字符串中-->的位置：
            if (commentEnd >= 0) { // 确实是注释节点，否则什么事情都不做。
              if (options.shouldKeepComment) {// 获取的内容不包含注释节点的<!--和-->
                options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
              }
              // 一个注释节点parse完毕后，将已经parse完毕的字符串剔除
              advance(commentEnd + 3); // 新的html字符串将不包含已经parse的注释节点
              continue // html 字符串已经去掉parse过的部分了，进入下一次循环，继续parse
            }
          }
          // 可能是条件注释节点<![ ]>，如果没有命中，什么都不做
          if (conditionalComment.test(html)) {
            var conditionalEnd = html.indexOf(']>');
            // Vue模版不会保留条件注释节点的内容，直接advance和continue
            if (conditionalEnd >= 0) {
              advance(conditionalEnd + 2); // 更新html字符串和index
              continue // 跳出循环，继续parse
            }
          }
          // 可能是<!DOCTYPE>，匹配成功返回一个数组，数组第一项为整个匹配项的字符串
          var doctypeMatch = html.match(doctype); //匹配失败则为null
          if (doctypeMatch) { // Vue不会保留doctype节点的内容
            advance(doctypeMatch[0].length);
            continue
          }
          // 可能是开始标签：<xxx>。parseStartTag函数对开始标签进行解析
          var startTagMatch = parseStartTag(); //存在返回值说明开始标签解析成功
          if (startTagMatch) { //解析失败返回undefined。
            handleStartTag(startTagMatch); // 处理开始标签的解析结果
            if (shouldIgnoreFirstNewline(startTagMatch.tagName, html))
              advance(1);
            continue
          }
          // 可能遇到的是结束标签</xxx>
          var endTagMatch = html.match(endTag); //匹配成功是一个数组[整个结束标签,标签名]
          if (endTagMatch) {
            var curIndex = index; //curIndex记录当前index
            advance(endTagMatch[0].length); //更新html字符串和index
            parseEndTag(endTagMatch[1], curIndex, index); //解析结束标签，参数：标签名、结束标签在html字符串中起始和结束的位置
            continue // 解析完毕，结束此次循环
          }
          // 为何不直接options.end(tagName, start, end)而调用parseEndTag，说明有其他必需操作
        }
        var text = (void 0), rest = (void 0), next = (void 0);
        // 处理的第一个字符是<，但没有成功匹配标签，或干脆第一个字符不是<
        if (textEnd >= 0) { // 举个例子：'0<1<2'
          rest = html.slice(textEnd); // '<1<2'
          while (
            !endTag.test(rest) && //检测不到结束标签
            !startTagOpen.test(rest) && // 检测不到开始标签的开头部分
            !comment.test(rest) && // 检测不到注释标签和条件注释标签
            !conditionalComment.test(rest)
          ) {
            next = rest.indexOf('<', 1); // 寻找下一个<出现的位置，1表示开始查找的位置
            if (next < 0) break // 再也遇不到下一个<，退出while循环
            textEnd += next; // 更新textEnd
            rest = html.slice(textEnd); // 更新rest
            // 如此反复，直到遇到一个能成功匹配<符号位置，或再也遇不到下一个<为止，循环终止
          }
          text = html.substring(0, textEnd); // 截取后为'0<1'，被当作普通文本看待
        }
        if (textEnd < 0) { // html字符串没有出现<，整个字符串作为文本处理
          text = html;
        }
        if (text) { // 更新html字符串和index
          advance(text.length);
        }
        if (options.chars && text) {// 如果options.chars存在，则调用它将字符串text传递过去
          options.chars(text, index - text.length, index);
          // 剩余字符串继续下一次while循环，剩下'<2'，符合textEnd==0和textEnd>=0，但'<2'既不能匹配标签，也不会遇到能匹配<成标签也遇不到下一个<。所以最后会到下一个if判断
        }
      }   
      if (html === last) { //经过上面解析，html没发生变化，说明已经解析不出什么标签
        options.chars && options.chars(html); // 那就当作纯文本对待，调用options.chars
        if (!stack.length && options.warn) { // 如果此时stack为空，但仍有剩余的字符串未处理，比如<div></div><a，解析完div后，继续解析<a，但由于stack栈空了，警告html结尾是不合法标签
          options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
        }
        break // 被当作纯文本处理了，跳出while循环
      }
    }
    parseEndTag(); // html字符串解析完毕，处理stack中未处理的标签

    function advance(n) { // n是已经parse完毕的字符串的结束位置，从它开始substring。index存的是相对于原始html字符串的读入位置，需要更新
      index += n;
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen); //调用字符串的match方法匹配startTagOpen正则
      // startTagOpen是用来匹配开始标签的一部分：<和标签名，并可以捕获标签名
      if (start) { // 匹配成功，start是一个数组：第一项是<和标签名，第二项是捕获的标签名
        var match = { //定义一个match对象，拥有3个属性
          tagName: start[1], // 标签名
          attrs: [], // 存放之后匹配到的属性，开始标签是可能有属性的
          start: index // index是当前字符流读入位置在整个html字符串中的相对位置
        };
        advance(start[0].length);// <和标签名匹配完成，调用advance更新html字符串和index
        var end, attr;
        // 开启循环：还没遇到开始标签的结束部分，且匹配到了开始标签中的属性，就继续循环
        while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
          attr.start = index;// attr存放匹配开始标签的属性的结果
          advance(attr[0].length);//更新html字符串和index
          attr.end = index; //attr的start和end，分别记录了属性开始和结束的index。
          match.attrs.push(attr); //将此次循环的匹配结果attr推入到match.attrs数组中
          // 循环直到匹配到开始标签的结束部分或匹配不到属性，才终止循环
        }
        // 如果end为null，即没有匹配到开始标签的结束部分，说明这不是一个完整的开始标签。
        // 如果end存在，说明匹配到了开始标签的结束部分，end[1]为捕获的/或undefined
        if (end) {
          match.unarySlash = end[1]; //给match对象添加unarySlash属性，它有值说明匹配到1元标签
          advance(end[0].length); // 步进结束标签的长度，更新html字符串和index
          match.end = index; // 给match对象添加了end属性，值为更新后的index
          return match // 最后将match对象作为整个函数的返回值返回。说明只有end存在（确实解析到一个1元标签），函数才返回match对象，否则全部返回undefined
        }
      }
    }
    // handleStartTag处理开始标签的解析结果，传入开始标签的匹配结果 match对象
    function handleStartTag(match) {
      var tagName = match.tagName;
      var unarySlash = match.unarySlash; // '/'或undefined，前者代表结束标签有/
      // expectHTML是parser选项，是一个布尔值。
      if (expectHTML) {
        // lastTag是stack栈顶元素，即上次遇到的开始标签，所以如果上次遇到的是p标签，且当前解析的开始标签是非Phrasing元素，才会调用parseEndTag(lastTag)
        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
          parseEndTag(lastTag);
          // 根据html嵌套规则，p元素的内容模型为Phrasing, 这意味着p元素只接受Phrasing元素作为子元素，不接受像div这样的非Phrasing元素。比如<p><h2></h2></p>，首先遇到<p>，此时lastTag为p，然后遇到<h2>，h2是块级元素，不是Phrasing元素，所以调用parseEndTag闭合p标签，即强行插入了</p>，变为<p></p><h2></h2></p>，接着遇到<h2></h2>，最后遇到一个单独的</p>。当解析器遇到单独的</p>或者</br>会补全他们，最终被解析为<p></p><h2></h2><p></p>
        }
        // 如果当前在解析的标签是一个可以省略结束标签的标签，且与上次解析到的开始标签相同
        if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
          // 比如<p>one<p>two。p是可以省略结束标签的，所以当解析到一个<p>并且上一次遇到的也是<p>时，会调用parseEndTag关闭第二个<p>，然后由于第一个<p>缺少闭合标签，会发出警告。
          parseEndTag(tagName);
        }
      }
      var unary = isUnaryTag$$1(tagName) || !!unarySlash; //unary标识是否1元标签
      // isUnaryTag$$1函数即options.isUnaryTag||no，能判断标签html中1元标签，如果它false，再看unarySlash，即不存在标准html规定的1元标签，但开始标签的结束部分用了/，说明是自定义的1元标签。比如自定义组件的标签名<my-component/>
      var l = match.attrs.length; // match.attrs数组的长度
      var attrs = new Array(l); // attrs存放格式化后的数据
      for (var i = 0; i < l; i++) { //遍历match.attrs数组，格式化match.attrs数组
        var args = match.attrs[i]; // args是每个属性的解析结果，是一个数组
        var value = args[3] || args[4] || args[5] || '';
        // 第4、5、6项其中之一可能会是属性值，如果都没有获取到，设为''
        var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines;
        attrs[i] = {
          name: args[1], // 格式化后的数据只有name和value字段
          value: decodeAttr(value, shouldDecodeNewlines) // 对属性值进行html实体的解码
        };
        // attrs数组的每个元素对象：name直接取args[1]，value为什么不直接用前面的value
        // 传入decodeAttr函数执行是对属性值中所包含的html实体进行解码，转成对应的字符。
        if (options.outputSourceRange) {
          attrs[i].start = args.start + args[0].match(/^\s*/).length;
          attrs[i].end = args.end;
        }
      }
      // unary为假说明开始标签是2元标签，则将开始标签的信息对象推入stack，并将lastTag的值赋为该标签名。在parseHTML函数中，我们说过stack和lastTag是为了判断是否缺少闭合标签
      if (!unary) {
        stack.push({
          tag: tagName,
          lowerCasedTag: tagName.toLowerCase(),
          attrs,
          start: match.start,
          end: match.end
        });
        lastTag = tagName; //lastTag存的是stack栈顶元素的标签名
      }
      // 如果parser选项中有options.start函数，则调用这个钩子函数，传入开始标签的名字，格式化后的属性数组，是否为一元标签，开始标签在原html中的开始和结束位置
      if (options.start) {
        options.start(tagName, attrs, unary, match.start, match.end);
      }
    }
    // 通过参数控制让一个函数拥有多种功能，parseEndTag的3个参数都可选，它有三个功能：1、检测是否缺少闭合标签。2、处理stack栈中剩余的标签。3.解析</br>与</p> ，保持与浏览器的行为相同
    function parseEndTag(tagName, start, end) {
      var pos, lowerCasedTagName; // pos 用来判断是否有元素缺少闭合标签
      if (start == null) start = index; 
      if (end == null) end = index;  // 如果start和end没传，值设为当前字符流读入位置
      if (tagName) {//如果传了tagName，从后往前遍历stack，直到满足条件break，pos就想要的值
        lowerCasedTagName = tagName.toLowerCase(); // 将tagname转小写
        for (pos = stack.length - 1; pos >= 0; pos--) {
          // stack中的开始标签和当前结束标签全等，说明找到了当前结束标签所对应的栈中的开始标签
          if (stack[pos].lowerCasedTag === lowerCasedTagName) break
        }
      } else { // 没传tagName，pos=0，因为接下来会遍历stack，将stack中元素的索引和pos对比，pos为0始终小于i，如果stack中有未处理的标签，会逐个警告缺少闭合标签，并调用options.end将其闭合。
        pos = 0;
      }
      if (pos >= 0) {// 当pos>=0，从后往前遍历stack
        for (var i = stack.length - 1; i >= pos; i--) { // 如果发现stack中有索引大于pos的元素
          if (i > pos || !tagName && options.warn) { // 说明该元素一定缺少闭合标签，发出警告
            options.warn(`tag <${stack[i].tag}> has no matching end tag.`, { start: stack[i].start, end: stack[i].end })
          }
          if (options.end) { // 除了打印警告，还会调用options.end将其闭合，保证解析结果的正确
            options.end(stack[i].tag, start, end);
          }
        }
        stack.length = pos; // 将刚刚未闭合的标签从stack中移除
        lastTag = pos && stack[pos - 1].tag; //lastTag也相应做更新
      // pos<0的话，即tagName没有在stack中找到对应的开始标签，说明只写了结束标签没写开始标签。对于只写了</br>或</p>这种，是能被正常解析的，分别解析为<br>和<p></p>
      } else if (lowerCasedTagName === 'br') {
        if (options.start) {
          options.start(tagName, [], true, start, end);
        }
      } else if (lowerCasedTagName === 'p') {
        if (options.start) {
          options.start(tagName, [], false, start, end);
        }
        if (options.end) {
          options.end(tagName, start, end);
        }
      }
    }
    // 因此parseEndTag的使用方式有3种：1、3个参数都传：处理普通的结束标签；2、只传第一个：parseEndTag(lastTag)；3、不传参数，这是在处理stack栈剩余的标签。
  }

  var onRE = /^@|^v-on:/ //匹配以@/v-on开头的字符串
  var dirRE = /^v-|^@|^:/ //匹配以 v- @ : 开头的字符串
  var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/ //匹配v-for的属性值
  var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  var stripParensRE = /^\(|\)$/g; // 匹配v-for的值中的括号
  var dynamicArgRE = /^\[.*\]$/ // 匹配最外层用[]包裹着的字符串
  var argRE = /:(.*)$/;  // 匹配指令的参数 :xxx
  var bindRE = /^:|^\.|^v-bind:/; // 匹配:或v-bind:前缀
  var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
  var slotRE = /^v-slot(:|$)|^#/;
  var lineBreakRE = /[\r\n]/;
  var whitespaceRE$1 = /\s+/g;
  var invalidAttributeRE = /[\s"'<>\/=]/;
  var decodeHTMLCached = cached(he.decode)//he.decode用于HTML字符实体的解码
  // 比如字符实体&#x26; 代表的字符为&。所以字符串&#x26;经过解码后将变为字符&。decodeHTMLCached函数用于对纯文本的解码，如果不进行解码，则用户将无法使用字符实体编写字符
  // cached函数接收一个函数作为参数，并返回一个新的函数，返回的新函数的功能和作为参数传入的函数的功能相同，唯一不同的是新函数具有缓存值的功能。如果一个函数接收相同参数的情况下返回值总是相同的，cached函数使用的函数柯里化技术就能带来性能的提升，不用每次都执行函数的功能，返回缓存值就好。
  var emptySlotScopeToken = "_empty_";

  // createASTElement用来创建一个元素节点的描述对象(ast节点对象)，接收标签名tag、标签的属性数组attrs、父标签描述对象的引用parent。
  function createASTElement(tag, attrs, parent) {
    return {
      type: 1, //ast对象的type:1代表这个是描述元素节点的
      tag,
      attrsList: attrs,// [{name:'v-for',value:'item in list'}]
      attrsMap: makeAttrsMap(attrs), // {'v-for':'item in list'}
      rawAttrsMap: {},
      parent,
      children: []
    }
  }
  var warn$2;
  var delimiters;
  var transforms;
  var preTransforms;
  var postTransforms; //无论是前置处理/中置处理/后置处理，他们的作用等价于提供了对元素描述对象处理的钩子，让外界有能力参与不同阶段的元素描述对象的处理，这对于平台化是很重要的事情，不同平台能够通过这些处理钩子去处理那些特定平台下特有的元素或元素的属性。
  var platformIsPreTag;
  var platformMustUseProp;
  var platformGetTagNamespace;
  var maybeComponent;
  // 编译器：人为编写的高级语言所写的程序翻译成计算机能解读并运行的机器语言的程序。parser只是编译器的一部分，是对源代码处理的第一步。它是将普通的字符串转成一个对象的程序，这个对象是编译器能理解的，后续的句法分析、类型检查推导、代码优化、代码生成都依赖于这个抽象出来的对象，称为AST抽象句法树
  // Vue的编译器大致分为3个阶段：1.将模板字符串转成元素ASTs对象。2.对AST进行静态节点标记，主要用来做虚拟DOM的渲染优化。3.使用元素ASTs生成渲染函数代码字符串。parse就是第一阶段，拆家模板字符串，进行词法分析。
  function parse(template, options) { // 主要通过调用parseHTML来辅助ast的构建
    warn$2 = options.warn || baseWarn;
    platformIsPreTag = options.isPreTag || no; // 判断标签是否是pre标签
    platformMustUseProp = options.mustUseProp || no //检测一个属性在标签中是否要使用元素对象原生的prop进行绑定，这里的prop是元素对象的属性，不是Vue中prop的概念
    platformGetTagNamespace = options.getTagNamespace || no //获取元素的命名空间
    var isReservedTag = options.isReservedTag || no;
    maybeComponent = el => !!el.component || !isReservedTag(el.tag)
    transforms = pluckModuleFunction(options.modules, 'transformNode');
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
    delimiters = options.delimiters;
    var stack = [] // 当解析到一个2元标签的开始标签就push进stack，stack的栈顶元素永远是当前被解析的节点的父节点，通过stack就可以把当前节点push到父节点的children中，也可以把当前节点的parent属性设置为父节点。解析到1元自闭合标签则不用推入stack中，因为它不存在子节点。
    var preserveWhitespace = options.preserveWhitespace !== false;
    var whitespaceOption = options.whitespace;
    var root; // 即ast树，parse的执行是充实root对象的过程
    var currentParent; //每遇到一个2元标签，都会将描述该标签的ast对象赋给currentParent，当解析该2元标签的子元素时，子元素的父元素就是currentParent
    var inVPre = false; //当前解析的标签是否在v-pre标签之内
    var inPre = false; //当前解析的标签是否在<pre></pre>之内
    var warned = false; //warned的初始值为false
    function warnOnce (msg, range) {
      if (!warned) { //if语句块进去立即变为true
        warned = true;
        warn$2(msg, range) // 只会打印一次警告信息
      }
    }
    //当遇到二元标签的结束标签或一元标签时调用它，“闭合”标签，传入标签对应的ast对象
    function closeElement (element) {
      trimEndingWhitespace(element)
      //你要闭合一个标签，它的末尾子节点有可能是空文本节点，要把它从元素描述对象的children数组中弹出
      //你要闭合的标签没被解析过，且不在v-pre之中，不会被跳过编译，先处理元素ast对象上的一些属性
      if (!inVPre && !element.processed) element = processElement(element, options)
      // 每遇到一个2元标签的开始标签就会将它的ast对象推入stack，每遇到一个结束标签都会将它的ast对象从stack中弹出。如果只有一个根元素，且当前解析的就是根元素，stack一定是空的，如果当前解析的不是根元素，stack一定有元素，如果stack为空，当前解析的不是根元素，说明模板中有不止一个根元素，被当做root的元素已经解析过了。如果满足第一个根元素用了v-if，其余根元素用了v-else-if/v-else，这样就能保证多个根元素存在但最终只渲染其中一个根元素，如果不满足，则会报警提示
      if (!stack.length && element !== root) {
        // root始终指向第一个根元素的描述对象，如果它使用了v-if，且当前解析的根元素使用了v-else-if/v-else，检查当前元素是否符合根元素的要求，将当前元素ast对象添加到使用了v-if的元素ast对象的ifConnditions数组中，而且使用了v-if的元素也会将自身的描述对象，添加到它自己的fConditions数组中
        if (root.if && (element.elseif || element.else)) {
          checkRootConstraints(element)
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          })
        } else {
          warnOnce("组件模版必须包含一个根节点。你可以定义多个根元素，但必须保证最终只渲染其中一个", { start: element.start })
        }
      }
      // 当期要闭合的元素存在父元素，且当前元素不是被禁止(不被解析)的元素。则考察当前元素如果用了v-else-if/v-else，调用processIfConditions找到它上一个使用了v-if到元素，将当前元素的ast对象添加到对应的使用了v-if的元素ast对象的ifConditions数组中，而不会成为父元素的子节点。
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent)
        } else {//如果当前元素没有使用v-else-if/v-else，则当前元素的描述对象会被推入父级描述对象的children数组中，同时当前ast对象的parent属性的值设为父级描述对象，如此建立了元素ast对象之间的父子关系
          if (element.slotScope) { //如果用了slot-scope特性
            var name = element.slotTarget || '"default"';//将当前元素描述对象添加到父级元素的scopedSlots对象下
            (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
          }
          currentParent.children.push(element);
          element.parent = currentParent;
        }
      }
      element.children = element.children.filter((c) => !(c).slotScope)
      trimEndingWhitespace(element)
      // 如果当前标签使用了v-pre，闭合标签时要将inVPre重置为false。每遇到<pre>标签的开始标签时，会将inPre设为true，这代表后续解析所遇到的标签都处于<pre>之中，pre标签中所有内容解析完毕，要“闭合”标签，会将inPre重置为false。
      if (element.pre) inVPre = false; //当前标签使用了v-pre
      if (platformIsPreTag(element.tag)) inPre = false // 当前标签是<pre>
      for (var i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options);
      }
    }
    function trimEndingWhitespace(el) { // 找到当前节点的末尾子节点，如果它是一个空格的静态文本节点，就将它从当前节点的子节点children数组中弹出，因为开启的while循环，会把末尾的可能存在的所有空格对应的子节点都去掉
      if (inPre) return // 如果解析的元素处于pre标签中，直接返回。因为<pre>中的文本会按照原文件中的编排，空白符比如空格和换行符都会展示显示出来，不需要去去除空格
      var lastNode
      while ((lastNode = el.children[el.children.length - 1]) && lastNode.type === 3 && lastNode.text === ' ') { 
        el.children.pop()
      }
    }

    // 检查当前元素是否符合根元素的要求。2个约束都基于模板有且仅有一个被渲染的根元素：1是不能使用slot标签和template标签作为根元素，因为slot作为插槽，它的内容是外界决定的，插槽的内容可能渲染多个节点，template元素的内容虽然不是外界决定的，但它本身作为抽象组件不会渲染任何内容到页面，它有可能包含多个子节点。2根元素是不允许使用v-for的，因为会渲染出多个节点
    function checkRootConstraints(el) {
      if (el.tag === 'slot' || el.tag === 'template')
        warnOnce(`Cannot use <${el.tag}> as component root element because it may contain multiple nodes.`)
      if (el.attrsMap.hasOwnProperty('v-for'))
        warnOnce('Cannot use v-for on stateful component root element because it renders multiple elements.')
    }
    // 调用parseHTML函数，传入几个重要的钩子函数，在parseHTML内部会调用这几个钩子函数，对模版字符串做解析，生成一颗AST树
    parseHTML(template, {
      warn: warn$2,
      expectHTML: options.expectHTML,
      isUnaryTag: options.isUnaryTag,
      canBeLeftOpenTag: options.canBeLeftOpenTag,
      shouldDecodeNewlines: options.shouldDecodeNewlines,
      shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
      shouldKeepComment: options.comments,
      outputSourceRange: options.outputSourceRange,
      // 解析html字符串时遇到开始标签就调用start钩子，完成ast构建并建立父子关系
      start (tag, attrs, unary, start$1, end) {
        var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);
        if (isIE && ns === 'svg') {// handle IE svg bug
          attrs = guardIESVGBug(attrs);
        }
        // 每解析一个开始标签就创建一个ast节点对象，它存储当前标签的attrs，tagName等信息，并且会把当前ast对象推入到父节点的children中，同时当前的ast的parent设置为stack的栈顶元素
        let element = createASTElement(tag, attrs, currentParent)
        if (ns) { //如果当前解析的开始标签是svg/math标签/它们的子标签
          element.ns = ns; //都会比其他标签的元素描述对象多一个ns属性
        }
        if (options.outputSourceRange) {
          element.start = start$1;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
            cumulated[attr.name] = attr;
            return cumulated
          }, {});
        }
        attrs.forEach(function (attr) {
          if (invalidAttributeRE.test(attr.name)) {
            warn$2("Invalid dynamic argument expression: attribute names cannot contain spaces, quotes, <, >, / or =.", {
                start: attr.start + attr.name.indexOf("["),
                end: attr.start + attr.name.length
              }
            );
          }
        });
        if (isForbiddenTag(element) && !isServerRendering()) {
          element.forbidden = true; //给禁止的元素打上禁止标记
          warn$2(`模版只负责将状态映射到视图。避免在模板中使用例如<style>和没有指定type属性或type属性值为text/javascript的<script>标签，它们不会被解析`);
        }
        // apply pre-transforms
        for (var i = 0; i < preTransforms.length; i++) {
          element = preTransforms[i](element, options) || element;
        }
        // 如果当前解析元素不处于v-pre环境中，调用processPre检查它自己是否使用v-pre，这决定了它和它的子元素是否处于v-pre环境，如果使用了v-pre，给描述它的ast对象添加pre属性，并将inVPre变为true，意味着后续解析工作都处于v-pre中，就不会对处于v-pre的元素进行编译。同样的，如果当前元素是pre标签，也将inPre置为true
        if (!inVPre) {
          processPre(element)
          if (element.pre) inVPre = true
        }
        if (platformIsPreTag(element.tag)) inPre = true;
        // 如果当前解析的元素处于v-pre之中，用processRawAttrs处理HTML的原生属性。如果当前元素不是处于v-pre，且没有被解析过，就开始解析v-for、v-if/v-else-if/v-else、v-once指令，这些都是结构化指令，它们的属性值不承载内容信息，处理完后这些指令会从元素ast对象的ttrsList数组中移除。
        if (inVPre) { 
          processRawAttrs(element);
        } else if (!element.processed) {
          processFor(element)
          processIf(element)
          processOnce(element)
        }
        if (!root) {
          root = element;
          checkRootConstraints(root);
        }
        // 如果root还没定义，还没被赋值，说明当前解析的是根元素，直接把当前元素ast对象赋给root，然后检查它是否符合根元素的要求
        if (!unary) {
          currentParent = element
          stack.push(element);
        } else {
          closeElement(element)
        }
        // 如果是2元标签的开始标签，则将currentParent更新为当前ast对象，并将当前ast对象推入stack，于是currentParent就继续指向stack的栈顶元素。如果遇到的是1元标签，则不会将它往stack推入，因为它成为不了父节点，会调用closeElement钩子函数闭合该元素
      },
      // 每遇到一个2元标签的结束标签时，调用钩子函数end，将currentParent回退为之前的值(stack弹出栈顶元素，将currentParent指向栈顶)，这样就修正了当前元素的父元素，不会把兄弟元素当父级元素了。然后调用closeElement闭合标签
      end(tag, start, end$1) { 
        var element = stack[stack.length - 1]
        stack.length -= 1
        currentParent = stack[stack.length - 1]
        if (options.outputSourceRange) element.end = end$1
        closeElement(element)
      },
      // 每次遇到纯文本时就会调用chars函数
      chars(text, start, end) {
        // 当前解析的文本没有父元素包裹，直接像根元素那样存在，这是不可以的，会报错并直接返回。其中分为两种情况：处理的html字符串正好全是这段文本，没有别的元素，报错：需要一个根元素，不能只是文本；有根元素，但也有文本存在，报错：处于根元素之外的文本会被忽略
        if (!currentParent) {
          if (text === template) {
            warnOnce('组件模板需要一个根元素，而不仅仅是文本', { start })
          } else if ((text = text.trim())) {
            warnOnce("处于根元素之外的文本\"" + text + "\"会被忽略的", { start })
          }
          return
        }
        if (isIE && // ie浏览器有个bug，如果当前解析的文本的父级是textarea标签，并且textarea标签的placeholder的值为当前text，则无需记录这段文本text
          currentParent.tag === 'textarea' && currentParent.attrsMap.placeholder === text) return
        var children = currentParent.children; // 获取当前文本的父级的children
        // 如果当前处于pre标签中，或文本trim后还有值，父元素是否是script或style元素，如果是，不做处理，如果不是，对text中的字符实体(比如 &#x26;)进行解码。如果不处于pre标签中，且trim后text为空，如果父元素没有子元素，让text为空字符串
        if (inPre || text.trim()) {
          text = isTextTag(currentParent) ? text : decodeHTMLCached(text)
        } else if (!children.length) {
          text = '';
        } else if (whitespaceOption) {
          if (whitespaceOption === 'condense') {
            text = lineBreakRE.test(text) ? '' : ' ';
          } else {
            text = ' ';
          }
        } else {
          text = preserveWhitespace ? ' ' : '';
        }
        // 经过了上面的处理，如果text还存在
        if (text) {
          if (!inPre && whitespaceOption === 'condense')
            text = text.replace(whitespaceRE$1, ' ');
          var res, child;
          // 如果当前解析不处在v-pre之中，且text不为' '，调用parseText对text中的插值文本做解析，解析结果赋给res，如果res有值，创建一个child对象来描述这个带变量的动态文本节点，type类型为2。
          if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
            child = {
              type: 2,
              expression: res.expression,
              tokens: res.tokens,
              text // text属性存放未经parseText的文本
            };
            // text不为' '或父节点没有子节点，或父节点的末尾子文本节点不是' '，创建一个child对象来描述不带变量的静态文本节点，type类型为3
          } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
            child = {
              type: 3,
              text
            }
          }
          // 如果child存在，将它push进父节点的children数组中
          if (child) {
            if (options.outputSourceRange) {
              child.start = start;
              child.end = end;
            }
            children.push(child);
          }
        }
      },
      // 每遇到注释节点会调用comment。如果没有父元素，则直接返回。创建一个ast对象child，type属性值为3，代表它是不带变量的纯文本节点，text属性为它的文本内容，isComment为真代表是注释节点。然后把child对象推入父元素currentParent的children数组中，建立父子关系
      comment(text, start, end) {
        if (!currentParent) return
        var child = {
          type: 3,
          text,
          isComment: true
        }
        if (options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    });
    return root
  }
  // 处理v-pre指令，如果元素使用了v-pre指令，给el对象添加pre属性，值为true
  function processPre (el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) el.pre = true
  }

  // 元素处于v-pre环境下，调用processRawAttrs将该元素所有属性作为原生的属性处理，首先获取el对象的attrsList数组，如果元素没有任何属性，且没有使用v-pre，但它的父级用了v-pre指令，则给el对象上添加plain属性，值为true。
  function processRawAttrs (el) {
    var list = el.attrsList; 
    var len = list.length;
    // 该元素有属性，要将属性值强行变为普通字符串，首先创建一个长度和el.attrsList一样的数组attrs，遍历el.attrsList数组中的每个属性，将这些属性以对象的形式放入attrs数组中，包含属性名name和属性值value。list[i].value作为属性值，已经是字符串，还再JSON.stringify是为了最终生成的函数代码中，它始终是普通字符串而不是表达式。因为经过new Function转化之后，list[i].value可能变成代码字符串，而JSON.stringify(list[i].value)变成普通字符串，processRawAttrs函数的执行是在v-pre环境中，会将它的属性全部添加到el.attrs数组中，它唯一不同于attrsList数组是每个对象的value值都是JSON.stringify过，最后它被转成了字符串而不是表达式，所以跳过了被渲染，达到v-pre的目的
    if (len) {
      var attrs = el.attrs = new Array(len)
      for (var i = 0; i < len; i++) {
        attrs[i] = {
          name: list[i].name,
          value: JSON.stringify(list[i].value) 
        }
        if (list[i].start != null) {
          attrs[i].start = list[i].start;
          attrs[i].end = list[i].end;
        }
      }
    } else if (!el.pre) { 
      el.plain = true
    }
  }

  function processElement (element, options) {
    processKey(element);
    // 当结构化的属性(structural attributes)被移除之后，检查该元素是否是“纯”的
    element.plain = !element.key && !element.scopedSlots && !element.attrsList.length
    // 只有当标签没有使用key属性，没有使用scopedSlots，且只使用了结构化指令的情况下才被认为是“纯”的。
    processRef(element); // 处理 ref属性
    processSlotContent(element); // 处理(作用域)插槽
    processSlotOutlet(element);
    //1 对于<slot>，会添加el.slotName属性，值为name属性的值，并且name属性是可绑定的
    //2 对于<template>，优先获取scope属性的值，否则获取slot-scope属性的值，将获取到的值赋给el.slotScope，scope和slot-scope不是绑定属性
    //3 对于其他标签，获取slot-scope属性的值，将获取到的值赋给el.slotScope
    //4 对于非<slot>标签，尝试获取slot属性，将获取到的值赋给el.slotTarget。如果用了slot属性但没有给值，则el.slotTarget为'"default"'
    processComponent(element); //Vue内置了component组件，接收两个prop：is和inline-template
    for (var i = 0; i < transforms.length; i++) { //遍历transforms数组“中置处理”
      element = transforms[i](element, options) || element;
    }
    // v-prev-forv-if、v-else-if、v-elsekey...获取这些属性的值时，使用getAndRemoveAttr/getBindingAttr，都会将该属性从el.attrsList数组中移除。所以在调用processAttrs函数时，这些属性都已经从attrsList数组中移除了。但仍然可能存在其他属性，需要processAttrs处理剩余的属性。
    processAttrs(element);
    return element
  }

  //key的值主要用在patch函数执行时，新旧vnode对比时辨识vnode，如果不用使用key，Vue会使用最大限度减少动态元素并且尽可能尝试复用相同类型元素，使用了key，会基于的key的变化重新排列元素顺序，并且会移除key不存在的元素。有相同父元素的子元素必须有独特的key值，重复的key会造成渲染错误
  function processKey(el) { // 函数的作用是如果元素el能获取到属性key的值，则赋给el.key
    var exp = getBindingAttr(el, 'key') // 获取到属性key的属性值
    if (exp) { // key属性的值存在
      if (el.tag === 'template') { // <template>标签不能使用key属性
        warn$2("不要在<template>上用key属性，把key用在真实的标签元素", getRawBindingAttr(el, 'key'))
      }
      if (el.for) { // 如果el使用了v-for指令
        var iterator = el.iterator2 || el.iterator1;
        var parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$2("Do not use v-for index as key on <transition-group> children, this is the same as not using keys.", getRawBindingAttr(el, 'key'), true /*tip*/)
        }
      }
      el.key = exp; // key的属性值存在，添加到元素描述对象的key属性
      // <div key="id"></div> 处理后 el.key = JSON.stringify('id')
      // <div :key="id"></div> 处理后 el.key = 'id'
      // <div :key="id | featId"></div> 处理后 el.key = '_f("featId")(id)'
    }
  }

  function processRef (el) {
    var ref = getBindingAttr(el, 'ref'); // 获取元素ref属性的值
    if (!ref) return // 获取不到则直接返回
    el.ref = ref; //为元素的描述对象添加ref属性，属性值为解析后生成的表达式字符串
    el.refInFor = checkInFor(el); //添加refInFor属性，真假代表着当前元素的ref属性是否在v-for之内
  }

  // 处理v-for指令，如果存在v-for的属性值，则调用parseFor函数解析它，如果解析结果res存在({for:'list', alias:'item', iterator1:'key', iterator2:'index'})，将res对象中的属性拷贝到当前元素ast对象中，如果res不存在，即解析v-for属性值失败，报警提示
  function processFor (el) {
    var exp
    if (exp = getAndRemoveAttr(el, 'v-for')) {
      var res = parseFor(exp)
      if (res) {
        extend(el, res)
      } else {
        warn$2(`Invalid v-for expression: ${exp}`, el.rawAttrsMap['v-for']);
      }
    }
  }
  // 解析v-for的值，返回一个包含解析结果的对象，拿'(item, index) in list'作为例子，匹配成功则inMatch为['(item, index) in list','(item, index)','list'...]。匹配失败则直接返回。res为返回的解析结果，在res上添加for属性，值为'list'。变量alias代表别名，值为'item, index'，iteratorMatch为[',index','index'...]，给res添加alias属性，值为'item'。继续在res上添加iterator1属性，值是iteratorMatch数组第二个元素，为'index'。如果alias为'item, key, index'，则iteratorMatch[2]存在，为"index"，如果alias为'item'，iteratorMatch为null，自然没有iterator1和iterator2
  function parseFor(exp) {
    var inMatch = exp.match(forAliasRE)
    if (!inMatch) return
    var res = {};
    res.for = inMatch[2].trim()
    var alias = inMatch[1].trim().replace(stripParensRE, '')
    var iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim()
      res.iterator1 = iteratorMatch[1].trim()
      if (iteratorMatch[2]) {
        res.iterator2 = iteratorMatch[2].trim()
      }
    } else {
      res.alias = alias;
    } // 如果是 "(item, key, index) in list" 会被解析成下面这个对象
    return res // {for:'list', alias:'item', iterator1:'key', iterator2:'index'}
  }
  // 处理v-if指令的值，先获取它，exp，如果存在，则给添加if属性，值为exp，然后把自身元素ast对象，添加到自己的ifConditions数组中，如果exp不存在，则会看v-else，如果使用了v-else，给el添加else属性，值为true。再判断v-else-if如果有值，给给el添加elseif属性，值为v-else-if的值。可见，对于v-else/v-else-if的标签，processIf只是给el添加了else/elseif属性，没有做别的。但在闭合标签执行processIfConditions时，如果一个元素ast对象有else/elseif属性时，则它不会作为AST对象的一个节点，而是会被添加到相应的使用v-if的元素ast对象的ifConditions数组中
  function processIf(el) {
    var exp = getAndRemoveAttr(el, 'v-if')
    if (exp) {
      el.if = exp
      addIfCondition(el, {
        exp,
        block: el
      })
    } else {
      if (getAndRemoveAttr(el, 'v-else') != null) el.else = true
      var elseif = getAndRemoveAttr(el, 'v-else-if');
      if (elseif) el.elseif = elseif 
    }
  }
  //总结1、如果标签用了v-if，则该标签的元素描述对象会有if属性，值为v-if的属性值
  //2、如果标签使用了v-else，则该标签的元素描述对象会有else属性，值为 true
  //3、如果标签使用了v-else-if，则该标签的元素描述对象有elseif属性，值为v-else-if的属性值
  //4、如果标签使用了v-if，则该标签的元素描述对象的ifConditions数组中包含“自己”
  //5、如果标签使用了v-else/v-else-if，则该标签的元素描述对象会被添加到对应的有v-if的元素描述对象的ifConditions数组中。

  // 处理使用了v-else/v-else-if的元素的解析
  function processIfConditions(el, parent) {
    var prev = findPrevElement(parent.children)//找到当前元素的上一个元素描述对象
    if (prev && prev.if) { //当前el的上一个元素节点存在并且使用了v-if
      addIfCondition(prev, {//将当前el添加到prev的ifConditions数组中
        exp: el.elseif,
        block: el
      });
    } else { // 上一个元素没有使用v-if，v-else/v-else-if没有对应的v-if，是不行的
      warn$2(`v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} used on element <${el.tag}> without corresponding v-if.`, el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else'])
    }
  }

  // 用来找当前带有v-else-if/v-else的元素的前一个元素描述对象，查看父级元素的children中的最后一个元素节点是不是想要的。因为有v-else-if/v-else的元素并不会被推入父级的children中
  function findPrevElement(children) {
    var i = children.length;
    while (i--) { // 从父级标签的children的最后一个开始找，希望碰到元素节点
      if (children[i].type === 1) { // nodeType===1说明是元素节点
        return children[i] // 直接返回，它就是想要的前一个元素描述对象
      } else {// 找到元素节点之前遇到了非元素节点
        if (children[i].text !== ' ') {//如果非元素节点的text属性值不为空，会警告，因为v-if元素节点和v-else(-if)元素节点之间的非元素节点的内容会被默认地忽略掉，告诉用户避免在里面写东西。
          warn$2("text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) will be ignored.", children[i]);
        }
        children.pop(); //非元素节点会从children数组中pop掉
      }
    }
  }
  // 给元素描述对象的ifConditions属性(数组)添加condition对象
  function addIfCondition(el, condition) { 
    if (!el.ifConditions) el.ifConditions = []
    el.ifConditions.push(condition) 
  }
  // 处理v-once指令，如果使用了v-once，在el上添加once属性，值为true
  function processOnce (el) {
    var once$$1 = getAndRemoveAttr(el, 'v-once')
    if (once$$1 != null) el.once = true;
  }
  function processSlotContent (el) {
    var slotScope;
    if (el.tag === 'template') { // 如果当前解析的元素是<template> 获取标签 scope 属性的值
      slotScope = getAndRemoveAttr(el, 'scope');
      if (slotScope) {//slotScope存在，说明<template>中使用了scope属性
        warn$2(`"scope"属性在2.5.0+版本已经被slot-scope属性替代了.更推荐使用slot-scope属性，slot-scope属性不局限于 在<template>中使用`, el.rawAttrsMap['scope'], true);
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope'); // 添加slotScope属性，如果slotScope值存在，则使用它，否则通过getAndRemoveAttr获取当前标签slot-scope属性的值作为slotScope属性的值。注意，无论是获取scope属性值还是获取slot-scope属性值，都是通过getAndRemoveAttr，说明scope和slot-scope属性不是绑定属性
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {//直接获取slot-scope属性的值
      if (el.attrsMap['v-for']) { //<div slot-scope="slotProps" v-for="item of slotProps.list"></div>
        warn$2(`slot-scope属性与v-for指令共存的话。由于v-for有更高的优先级，所以v-for绑定的状态会是父组件作用域的状态，而不是子组件通过作用域插槽传递的状态。并且这么用很容易让人困惑。更好的方式是这样：
        <template slot-scope="slotProps">
          <div v-for="item of slotProps.list"></div>
        </template>
        这样就不会歧义，v-for绑定的状态就是作用域插槽传递的状态。`, el.rawAttrsMap['slot-scope'], true)
      }
      el.slotScope = slotScope; //将slotScope的值赋给元素描述对象的 slotScope 属性
    }
    // 无论是<template>还是其他标签，只要使用了slot-scope属性，则该标签元素描述对象将添加slotScope属性

    // 处理标签的slot属性,首先使用getBindingAttr获取slot属性值
    var slotTarget = getBindingAttr(el, 'slot');//意味着 slot 属性是可以绑定的
    if (slotTarget) { //<div slot></div>这样的通过getBindingAttr会得到""，此时会将 el.slotTarget设为'"default"'，否则直接将slotTarget的值赋值给el.slotTarget
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
      el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
      if (el.tag !== 'template' && !el.slotScope)
        // addAttr函数会将属性的名字和值以对象的形式添加到元素描述对象的attrs数组中
        addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
      // 保存原生影子DOM(shadow DOM)的slot属性，既然是原生影子DOM的slot属性，那么首先该元素必然应该是原生DOM，所以不能为template元素，同时作用域插槽是不会保留原生slot属性的。Vue的实现参考了原生影子DOM的slot属性
    }
    if (el.tag === 'template') {
      var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        if (el.slotTarget || el.slotScope)
          warn$2("Unexpected mixed usage of different slot syntaxes.", el);
        if (el.parent && !maybeComponent(el.parent))
          warn$2("<template v-slot> can only appear at the root level inside the receiving the component", el);
        var ref = getSlotName(slotBinding);
        var name = ref.name;
        var dynamic = ref.dynamic;
        el.slotTarget = name;
        el.slotTargetDynamic = dynamic;
        el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
      }
    } else {
      var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding$1) {
        if (!maybeComponent(el))
          warn$2("v-slot can only be used on components or <template>.", slotBinding$1);
        if (el.slotScope || el.slotTarget)
          warn$2("Unexpected mixed usage of different slot syntaxes.", el);
        if (el.scopedSlots)
          warn$2("To avoid scope ambiguity, the default slot should also use <template> syntax when there are other named slots.", slotBinding$1);
        var slots = el.scopedSlots || (el.scopedSlots = {});
        var ref$1 = getSlotName(slotBinding$1);
        var name$1 = ref$1.name;
        var dynamic$1 = ref$1.dynamic;
        var slotContainer = slots[name$1] = createASTElement('template', [], el);
        slotContainer.slotTarget = name$1;
        slotContainer.slotTargetDynamic = dynamic$1;
        slotContainer.children = el.children.filter(function (c) {
          if (!c.slotScope) {
            c.parent = slotContainer;
            return true
          }
        });
        slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken;
        el.children = [];
        el.plain = false;
      }
    }
  }

  function getSlotName (binding) {
    var name = binding.name.replace(slotRE, '');
    if (!name) {
      if (binding.name[0] !== '#') {
        name = 'default';
      } else {
        warn$2("v-slot shorthand syntax requires a slot name.", binding);
      }
    }
    return dynamicArgRE.test(name)
      ? { name: name.slice(1, -1), dynamic: true }
      : { name: ("\"" + name + "\""), dynamic: false }
  }

  // handle <slot/> outlets
  // 通过 if 语句的条件：el.tag === 'slot'，可知 if 语句块内的代码是用来处理 <slot> 插槽标签的，所以如果当前标签是 <slot> 标签，则 if 语句块内的代码将会被执行，在 if 语句块内，首先通过 getBindingAttr 函数获取标签的 name 属性值，并将获取到的值赋值给元素描述对象的 el.slotName 属性。举个例子，如果我们的 <slot> 标签如下：

  function processSlotOutlet (el) {
    if (el.tag === 'slot') { //<slot name="header"></slot>则slotName属性值为JSON.stringify('header')
      el.slotName = getBindingAttr(el, 'name');//获取标签的name属性值,值赋给元素描述对象的slotName属性
      if (el.key)  // <slot></slot> 则 el.slotName 属性的值为 undefined。
        warn$2("key属性不能用在slot标签上。和<template>一样<slot>也是抽象组件，特点是要么不渲染真实DOM，要么被不可预知的DOM元素替代。", getRawBindingAttr(el, 'key'))
    }
  }

  function processComponent(el) {
    var binding; //binding的值是通过getBindingAttr获取元素的is属性值，
    if ((binding = getBindingAttr(el, 'is')))//获取成功，将值赋给el.component属性
      el.component = binding;
    if (getAndRemoveAttr(el, 'inline-template') != null)//通过getAndRemoveAttr获取inline-template属性的值，获取成功，将el.inlineTemplate设为true
      el.inlineTemplate = true;
  }

  // 对剩余的属性进行分析。属性的处理有4种：普通属性, prop, v-on事件绑定, 指令
  function processAttrs (el) {
    var list = el.attrsList;
    var name, rawName, value, modifiers, syncGen, isDynamic;
    for (var i = 0; i < list.length; i++) {//遍历剩下的每个属性
      name = rawName = list[i].name; // name是属性名字符串
      value = list[i].value; // value是属性的值
      if (dirRE.test(name)) { //如果name以v-/@/:开头，说明这是指令
        el.hasBindings = true; // 因为指令的值必然是表达式而不是常量，标记当前元素是动态元素，
        //一个完整的指令包含指令名、指令的参数、指令的修饰符、指令的值
        modifiers = parseModifiers(name.replace(dirRE, ''))//对name解析出修饰符对象，类似：{prevent:true,stop:true}
        if (modifiers) { //如果用了修饰符，将修饰符从指令字符串name中移除
          name = name.replace(modifierRE, ''); // 比如：v-on:select
        }
        if (bindRE.test(name)) { //该指令是否是 v-bind / :
          name = name.replace(bindRE, '');//将name中的v-bind:/:去掉。name只剩绑定属性的名字了
          value = parseFilters(value);//处理绑定属性的值，但凡能够使用过滤器的地方都要用parseFilters去解析
          isDynamic = dynamicArgRE.test(name);//
          if (isDynamic) { //是否是动态特性名 v-bind:[key]="value"或:[key]="value"
            name = name.slice(1, -1);// 把[]去掉
          }
          if (value.trim().length === 0) warn$2(`v-bind指令的表达式值不能为空："v-bind:${name}"`)
          // 如果bind指令的值trim后是空的，就报警：不能为空
          if (modifiers) { //如果给v-bind提供了修饰符（它有三个修饰符prop、camel和sync）
            if (modifiers.prop && !isDynamic) { // 使用了prop修饰符，被用于绑定 DOM 属性 (property)
              name = camelize(name); // 将属性名驼峰化
              if (name === 'innerHtml') // 驼峰化之后的属性名是否等于字符串 'innerHtml'
                name = 'innerHTML'; // 换回'innerHTML'
            }
            if (modifiers.camel && !isDynamic) name = camelize(name);// 如果用了camel，将属性名name驼峰化
            // .camel修饰符允许在使用模板时将v-bind的属性名驼峰化，例如SVG的viewBox属性
            // <svg : view-box.camel="viewBox"></svg>
            /**什么情况使用sync修饰符：有些情况下我们需要对一个prop进行“双向绑定”
             * //父组件
              <button @click='show = !show'></button>
              <drag :visible='show'  @update:visible="val => show = val" />
              // update:visible事件被触发，执行回调，将传来的false赋给父组件的show
              //子组件
              <div v-if='isShow'>
                  <span @click='close'>X</span> //子组件也有控制显隐的能力，通过click触发close
              </div>
              props:[visible],//子组件的prop接收父组件的绑定的visible值，父组件的显隐会告诉子组件
              data(){
                  return {
                      isShow:false
                  }
              },
              watch:{// 通过监听visible这个prop，将prop值赋给子组件的isShow，它决定了子组件的显隐
                  visible(val){
                      this.isShow = val 
                  }
              },
              methods:{
                  close(){ //close方法中如果只是将isShow变为false，子组件是消失了，但父组件并不知道要被关闭，因为没有通知父组件，而且由于没有通知父组件，父组件也没有向自己传最新的prop值，导致自己的visible是true，没有和当前状态同步。因此需要显式地触发update:visible事件
                      this.isShow = false
                      this.$emit('update:visible', false)
                  }
              }
             * 这么写有点繁琐，于是<drag :visible='show' @update:visible="val => show = val" />等价于<drag :visible.sync='show'/>。子组件的close方法不变（子组件$emit通知父组件更新参数时必须带上update:，这在简写以后容易被忽略），当子组件触发click事件执行close方法时，不仅改变了内部的isshow，而且触发update:visible事件，将父组件的visible改变
             */
            if (modifiers.sync) { // 如果bind指令使用了sync修饰符
              syncGen = genAssignmentCode(value, "$event")//根据指令的值value和"$event"生成赋值的代码字符串
              if (!isDynamic) { // 如果不是绑定的动态参数，比如这里的name就叫visible
                // 现在update:visible就是一个事件，触发它执行回调，将父组件中的show值改变(即value变量)，形如："visible=$event"，我们知道$event是事件回调接收的形参，即把事件回调的接收的参数赋给visible
                addHandler(el, "update:" + camelize(name), syncGen, null, false, warn$2, list[i]);
                if (hyphenate(name) !== camelize(name)) {
                  addHandler(el, "update:" + hyphenate(name), syncGen, null, false, warn$2, list[i]);
                }
              } else {
                // handler w/ dynamic event name
                addHandler(el, "\"update:\"+(" + name + ")", syncGen, null, false, warn$2, list[i], true);
              }
            }
          }
          if ((modifiers && modifiers.prop) || (
            !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
          )) {
            addProp(el, name, value, list[i], isDynamic);
          } else {
            addAttr(el, name, value, list[i], isDynamic);
          }
        } else if (onRE.test(name)) { // 当前指令是v-on/@指令
          name = name.replace(onRE, ''); // 去掉指令前缀，剩下事件名比如：select
          isDynamic = dynamicArgRE.test(name); // 是否被[]包裹着
          // vue2.6新增了动态属性，就是key值可以会发生变动的属性，写法就像v-bind:[key]="value"，用[]括起来的JS表达式作为一个指令的key值，非动态属性只能修改value值
          // 比如你可以使用动态参数为一个动态的事件名绑定处理函数：v-on:[event]="handler"，当event的值为"focus"时，v-on:focus
          if (isDynamic) name = name.slice(1, -1) // 如果是动态参数，将包裹的[]去掉
          // 调用addHandler为元素的描述对象el添加事件相关的属性
          addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic)
        } else { // 普通的指令(包括v-model)
          name = name.replace(dirRE, '') // 去掉指令的前缀，v- : @ 
          var argMatch = name.match(argRE); // 匹配出指令的参数
          var arg = argMatch && argMatch[1]; // 比如v-model:dddd.feg就是dddd.feg
          isDynamic = false;
          if (arg) {
            name = name.slice(0, -(arg.length + 1)); // 去掉了前缀的指令名，比如model
            if (dynamicArgRE.test(arg)) {
              arg = arg.slice(1, -1);
              isDynamic = true;
            }
          }
          // addDirective会给el添加一个directives属性，用于保存对应的指令信息
          addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
          if (name === 'model') { // 如果处理的指令为v-model，调用函数传入元素描述对象和指令的属性值
            checkForAliasModel(el, value);
          }
        }
      } else {
        // literal attribute
          var res = parseText(value, delimiters);
          if (res) {
            warn$2(`${name}="${value}": Interpolation inside attributes has been removed. Use v-bind or the colon shorthand instead. For example, instead of <div id="{{ val }}">, use <div :id="val">.`, list[i]);
          }
        addAttr(el, name, JSON.stringify(value), list[i]);
        // #6887 firefox doesn't updatemuted state if set via attribute
        // even immediately after element creation
        if (!el.component &&
            name === 'muted' &&
            platformMustUseProp(el.tag, el.attrsMap.type, name)) {
          addProp(el, name, 'true', list[i]);
        }
      }
    }
  }
  
  // 如果一个标签用了ref属性，且它或它的父代标签用了v-for，则认为ref在v-for之内。checkInFor函数返回真假值，代表该标签的ref属性是否处于v-for之中，赋给元素描述对象refInFor属性
  function checkInFor (el) {
    var parent = el; // 从当前元素的描述对象开始
    while (parent) { // 直到遇到根节点为止
      if (parent.for !== undefined) return true // for属性的值不为undefined，返回true
      parent = parent.parent; // 向上遍历父级节点
    }
    return false //当前元素所使用的ref属性不在v-for之内，函数返回false
  }

  function parseModifiers (name) { // 解析修饰符 比如：v-on:select.prevent.stop
    var match = name.match(modifierRE); //全局匹配.以及.后面的字符; ['.prevent','.stop']
    if (match) { // 修饰符存在
      var ret = {}; //遍历match数组，用slice(1)将每项开头的.去掉，并在ret对象中记录一下
      match.forEach(m => { ret[m.slice(1)] = true })
      return ret // { prevent: true, stop: true }
    }
  }

  function makeAttrsMap(attrs) {
    var map = {}; // 遍历了attrs数组
    for (var i = 0, l = attrs.length; i < l; i++) {
      if (map[attrs[i].name] && !isIE && !isEdge) {
        warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
      }
      map[attrs[i].name] = attrs[i].value;
    } //作用就是将attrs数组的每项转成name:value键值对，逐个添加到对象map中
    return map
  }

  // 对于script/style元素，不要解码它的内容
  function isTextTag(el) { return el.tag === 'script' || el.tag === 'style' }

  function isForbiddenTag(el) { //这些标签会打上禁止标记，它们不会被解析
    return el.tag === 'style' || // style标签不会被解析
      (el.tag === 'script' && ( // 没有type属性的script标签不会被解析
      !el.attrsMap.type || // type属性为text/javascript的script标签不会被解析
        el.attrsMap.type === 'text/javascript'
      ))
  }

  var ieNSBug = /^xmlns:NS\d+/;
  var ieNSPrefix = /^NS\d+:/;

  function guardIESVGBug (attrs) {
    var res = [];
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (!ieNSBug.test(attr.name)) {
        attr.name = attr.name.replace(ieNSPrefix, '');
        res.push(attr);
      }
    }
    return res
  }

  // 检验使用了v-model的标签，逐层向上遍历它的父代标签的元素描述对象，指定根元素为止，如果发现使用了v-for标签，且alias的值和v-model指令的值相等，比如<div v-for="item of list"><input v-model="item" /></div>，报警
  function checkForAliasModel (el, value) {
    var _el = el;
    while (_el) {
      if (_el.for && _el.alias === value) {
        warn$2(`<${el.tag} v-model="${value}">: ` + "您用v-model绑定了v=for的迭代项。这将无法修改v-for源数组，因为写入别名就像修改函数局部变量。考虑使用一个对象数组，而对对象属性使用v-model。", el.rawAttrsMap['v-model']);
      }
      _el = _el.parent;
    }
  }

  function preTransformNode (el, options) {
    if (el.tag === 'input') {
      var map = el.attrsMap;
      if (!map['v-model']) return
      var typeBinding;
      if (map[':type'] || map['v-bind:type']) {
        typeBinding = getBindingAttr(el, 'type');
      }
      if (!map.type && !typeBinding && map['v-bind']) {
        typeBinding = "(" + (map['v-bind']) + ").type";
      }
      if (typeBinding) {
        var ifCondition = getAndRemoveAttr(el, 'v-if', true);
        var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
        var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
        var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
        // 1. checkbox
        var branch0 = cloneASTElement(el);
        // process for on the main node
        processFor(branch0);
        addRawAttr(branch0, 'type', 'checkbox');
        processElement(branch0, options);
        branch0.processed = true; // prevent it from double-processed
        branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
        addIfCondition(branch0, {
          exp: branch0.if,
          block: branch0
        });
        // 2. add radio else-if condition
        var branch1 = cloneASTElement(el);
        getAndRemoveAttr(branch1, 'v-for', true);
        addRawAttr(branch1, 'type', 'radio');
        processElement(branch1, options);
        addIfCondition(branch0, {
          exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
          block: branch1
        });
        // 3. other
        var branch2 = cloneASTElement(el);
        getAndRemoveAttr(branch2, 'v-for', true);
        addRawAttr(branch2, ':type', typeBinding);
        processElement(branch2, options);
        addIfCondition(branch0, {
          exp: ifCondition,
          block: branch2
        });
        if (hasElse) {
          branch0.else = true;
        } else if (elseIfCondition) {
          branch0.elseif = elseIfCondition;
        }
        return branch0
      }
    }
  }

  function cloneASTElement (el) {
    return createASTElement(el.tag, el.attrsList.slice(), el.parent)
  }

  function text (el, dir) {
    if (dir.value) {
      addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir);
    }
  }

  function html (el, dir) {
    if (dir.value) {
      addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir);
    }
  }
  let modules1 = [{
      staticKeys: ['staticClass'],
      transformNode,
      genData
    }, {
      staticKeys: ['staticStyle'],
      transformNode: transformNode$1,
      genData: genData$1
    },
    { preTransformNode }
  ]
  var baseOptions = { // 编译器的基本参数选项
    expectHTML: true,
    modules: modules1,
    directives: { model, text, html },
    isPreTag: tag => tag === 'pre',//检查标签名是否是pre标签
    isUnaryTag: makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr'),
    mustUseProp,
    canBeLeftOpenTag: makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'),
    isReservedTag,
    getTagNamespace,
    staticKeys: modules1.reduce((keys, m) => keys.concat(m.staticKeys || []), []).join(',')
  };

  var isStaticKey;
  var isPlatformReservedTag;
  var genStaticKeysCached = cached(genStaticKeys$1);

  // 模板字符串经过parse解析后，会生成一个ast树，optimize做的是优化ast树(视图里有的节点不是响应式的，是静态的和数据变化无关的，每次渲染生成的DOM节点都完全相同，optimize就是将静态节点标记出来，首次渲染之后，之后每一次patch就跳过对它们的比对)，优化了ast树后，根据ast树生成对应的渲染函数的代码字符串。
  function optimize (root, options) {
    if (!root) return 
    isStaticKey = genStaticKeysCached(options.staticKeys || '');
    isPlatformReservedTag = options.isReservedTag || no;
    markStatic$1(root) // 标记所有的静态节点，包括所有子节点
    markStaticRoots(root, false) // 标记静态根节点，false代表这个根节点没有用v-for
  }

  function genStaticKeys$1 (keys) {
    return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' + keys ? ',' + keys : '')
  }
  // 标记静态节点，传入的是ast树的根节点
  function markStatic$1 (node) { 
    node.static = isStatic(node); //每个ast对象都会添加static属性，先经过isStatic的一轮判断，node.type为2/3和别的一些情况可以先判断了，然后继续下面的判断
    if (node.type === 1) { //如果是该ast节点是描述元素节点的
      if ( //如果标签名不是html内置的标签，且又不是slot标签，且没有inline-template这个属性，直接返回不用标记
        !isPlatformReservedTag(node.tag) &&
        node.tag !== 'slot' &&
        node.attrsMap['inline-template'] == null
      ) return
      // 遍历当前ast节点的子节点数组，对每一个子节点递归调用markStatic$1，如果某个子节点不是静态节点，则作为父节点的当前ast节点也不是静态节点
      for (var i = 0, l = node.children.length; i < l; i++) {
        var child = node.children[i];
        markStatic$1(child);
        if (!child.static) {
          node.static = false;
        }
      }
      // 如果描述的元素节点使用了v-if，遍历ifConditions数组，block可能是它自己，也可能是跟随在它后面的用了v-else/v-else-if的节点，递归调用markStatic$1判断它是否是静态节点，如果存在一个不是静态节点，则这个使用了v-if的节点不是静态的
      if (node.ifConditions) {
        for (var i$1 = 1; i$1 < node.ifConditions.length; i$1++) {
          var block = node.ifConditions[i$1].block;
          markStatic$1(block);
          if (!block.static) {
            node.static = false;
          }
        }
      }
    }
  }
  // 标记静态根节点，如果当前节点是静态节点，且有子节点，并且子节点不是单个静态文本节点，那当前节点就被标记为根静态节点。所以如果一个静态节点只包含一个静态文本节点，就不会被标记为静态根节点，这么做是为了性能考虑，如果一个只包含静态文本的节点标记为根节点，带来的成本超过收益
  function markStaticRoots (node, isInFor) {
    if (node.type !== 1) return //如果不是描述元素节点的ast对象，直接返回
    if (node.static || node.once) {//如果是静态节点或是一次性节点，给节点添加staticInFor属性，赋给它isInFor，代表这个是不是处于v-for之中
      node.staticInFor = isInFor;
    }
    if (//如果当前节点是静态节点，且存在子节点
      node.static && node.children.length &&
      !(node.children.length === 1 &&
        node.children[0].type === 3)
    ) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
  // 判断一个ast对象是否是静态ast节点，满足下面这些条件才行
  function isStatic (node) {
    if (node.type === 2) return false //带变量的动态文本节点，不行
    if (node.type === 3) return true //不带变量的静态文本节点，可以
    return !!(node.pre || ( // 不用编译的节点，可以
      !node.hasBindings && // 不能使用了指令，因为它有动态绑定
      !node.if && !node.for && // 没有用v-if或v-for或v-else
      !isBuiltInTag(node.tag) && // 不是内建的标签slot,component
      isPlatformReservedTag(node.tag) && // 是普通HTML标签，不是组件
      !isDirectChildOfTemplateFor(node) && //该节点的父辈节点不能是带v-for的 template
      Object.keys(node).every(isStaticKey) //节点上不能出现额外的属性。type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap以外的属性，出现以外的属性则当前节点不是静态节点
    ))
  }

  // 如果想用v-if同时管控多个元素，可以<template>元素包裹这几个元素，在<template>上使用v-if，最终渲染结果不会包含<template>，它是不可见的。
  // <template>上可以使用v-for的，可以循环渲染一段包含多个元素的内容，比如<ul><template v-for="item in items"><li>{{ item.msg }}</li> <li class="divider" role="presentation"></li></template></ul>

  // 判断当前ast节点是否是使用了v-for的template节点的子节点。如果当前的ast节点没有父级，返回false，有父级则向父级寻找，如果遇到父辈节点是带v-for的template节点，那么返回true，如果没有遇到template节点，返回false
  function isDirectChildOfTemplateFor (node) {
    while (node.parent) {
      node = node.parent;
      if (node.tag !== 'template') return false
      if (node.for) return true
    }
    return false
  }

  var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function\s*(?:[\w$]+)?\s*\(/;
  var fnInvokeRE = /\([^)]*?\);*$/;
  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

  // KeyboardEvent.keyCode aliases
  var keyCodes = { esc: 27, tab: 9, enter: 13, space: 32, up: 38, left: 37, right: 39, down: 40, 'delete': [8, 46] };  

  // KeyboardEvent.key aliases
  var keyNames = {
    esc: ['Esc', 'Escape'],
    tab: 'Tab',
    enter: 'Enter',
    space: [' ', 'Spacebar'],
    up: ['Up', 'ArrowUp'],
    left: ['Left', 'ArrowLeft'],
    right: ['Right', 'ArrowRight'],
    down: ['Down', 'ArrowDown'],
    'delete': ['Backspace', 'Delete', 'Del']
  };

  // 阻止监听器执行的修饰符需要显式返回null，以便我们确定是否删除.once的侦听器
  const genGuard = condition => `if(${condition})return null;`

  var modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: genGuard("$event.target !== $event.currentTarget"),
    ctrl: genGuard("!$event.ctrlKey"),
    shift: genGuard("!$event.shiftKey"),
    alt: genGuard("!$event.altKey"),
    meta: genGuard("!$event.metaKey"),
    left: genGuard("'button' in $event && $event.button !== 0"),
    middle: genGuard("'button' in $event && $event.button !== 1"),
    right: genGuard("'button' in $event && $event.button !== 2")
  }

  // genHandlers函数遍历el.events或nativeEvents事件对象，对同一个事件名的事件调用genHandler函数，生成供拼接的数据对象data.nativeOn/data.on的代码字符串
  function genHandlers (events, isNative) { // isNative代表是否监听原生DOM事件
    var prefix = isNative ? 'nativeOn:' : 'on:'; // 属性值不一样，nativeOn和on
    let staticHandlers = ``
    let dynamicHandlers = `` // 针对动态事件参数
    for (const name in events) { // 遍历el的事件对象的每一个事件
      const handlerCode = genHandler(events[name]) //调用genHandler，根据该事件的处理回调生成对应的函数代码字符串
      if (events[name] && events[name].dynamic) {
        dynamicHandlers += `${name},${handlerCode},`
      } else { //如果不是动态参数，则类似这样：'"select":function($event){...}'
        staticHandlers += `"${name}":${handlerCode},`
      }
    }
    staticHandlers = `{${staticHandlers.slice(0, -1)}}` // 去掉最后一个逗号
    if (dynamicHandlers) {
      return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`
    } else { // 添加prefix前缀 比如 'on:"select":function($event){...}'
      return prefix + staticHandlers // 如果是组件占位节点上的原生事件，生成的函数代码字符串赋给data.nativeOn，如果是组件占位节点上的自定义事件，或普通DOM节点上的原生事件，生成的函数代码字符串赋给data.on上
    }
  }

  // 传入的参数是某个事件名对应的事件处理器(handler)，可能是数组也可能是对象
  function genHandler (handler) { 
    if (!handler) return 'function(){}' // 如果没有对应的事件处理器，就返回一个空函数字符串

    if (Array.isArray(handler)) { //如果handler为数组，存放着该事件的多个处理回调，数组调用map对每个回调执行getHandler方法，每个回调转成对应的函数字符串，然后数组调用jion拼接起来，再放到一个数组里，形如`[function($event){...},function($event){...},function($event){...}]`
      return `[${handler.map(handler => genHandler(handler)).join(',')}]`
    }
    // handler是对象，判断它的value属性，即指令的值。事件绑定有3种写法：@click="doThis" @click="functions(){}" @click="doThis($event)"，分别对应下面三种
    const isMethodPath = simplePathRE.test(handler.value) // handler.value是"doThis"
    const isFunctionExpression = fnExpRE.test(handler.value) //"()=>{..}"或"function(){..}"
    const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''))//"doThis($event)" fnInvokeRE匹配的内容是"($event)"，replace后剩下"doThis"
    if (!handler.modifiers) { // 如果该事件没有使用修饰符
      if (isMethodPath || isFunctionExpression) { // 如果是@click="doThis"或@click="()=>{}"
        return handler.value // 则直接返回doThis或()=>{}/function(){}
      }
      // 如果指令的值不是上面两种情况，有可能是doThis($event)，也有可能类似"console.log(11)"
      return `function($event){${isFunctionInvocation?`return ${handler.value}`:handler.value}}`
      // 包裹一层function，如果是前者情况，返回函数调用结果，如果是后者，是一个表达式，则直接作为语句放在function($event){}中
    } else { // 如果该事件使用了修饰符
      let code = '', genModifierCode = '', keys = []
      for (const key in handler.modifiers) { // 遍历modifiers上记录的修饰符
        if (modifierCode[key]) { // 根据修饰符添加对应js的代码字符串
          genModifierCode += modifierCode[key]//比如stop对应 '$event.stopPropagation();'
          if (keyCodes[key]) {// 如果修饰符是left/right
            keys.push(key)
          }
        } else if (key === 'exact') {//exact修饰符允许你控制由精确的系统修饰符组合触发的事件。@click.ctrl="onClick"即使Alt或Shift被一同按下时也会触发，@click.ctrl.exact="onCtrlClick"有且只有Ctrl被按下的时候才触发
          const modifiers = handler.modifiers; // 假设 {ctrl:true}
          genModifierCode += genGuard(
            ['ctrl', 'shift', 'alt', 'meta']
              .filter(keyModifier => !modifiers[keyModifier])//过滤掉已使用的修饰符
              .map(keyModifier => `$event.${keyModifier}Key`)//每项替换成对应的字符串
              .join('||')//如果它们拼接一起
          ) // 形成:"if($event.shiftKey||$event.altKey||$event.metaKey)return null;"
        } else { // 如果用了别的修饰符，比如 enter
          keys.push(key) // keys数组 ["enter"]
        }
      }
      if (keys.length) { // 调用genKeyFilter看看能不能生成键盘事件相关的代码字符串
        code += genKeyFilter(keys) //if(!$event.type.indexOf('key')&&_k($event.keyCode,"enter",13,$event.key,"Enter"))return null;
      }
      if (genModifierCode) {// 确保像prevent和stop这样的修饰符在键过滤之后执行
        code += genModifierCode // 将genModifierCode追加到code字符串后面
      }
      // 生成最后返回的代码字符串，根据绑定事件的不同写法
      const handlerCode = isMethodPath ? // 如果是@click="doThis"这样
        `return ${handler.value}($event)` : //`return doThis($event)`
        isFunctionExpression ?//如果是@click="functions(){}"这样，包成自执行函数，传入$event
        `return (${handler.value})($event)` : //`return ((e)=>{console.log(e)})($event)`
        isFunctionInvocation ? // 如果是@click="doThis($event)"这样
        `return ${handler.value}` : //`return doThis($event)`
        handler.value // 如果是一段表达式，就不返回，直接放进来
      return `function($event){${code}${handlerCode}}`
    }
  }

  function genKeyFilter (keys) {
    return `if(!$event.type.indexOf('key')&&${keys.map(genFilterCode).join('&&')})return null;`
  }

  function genFilterCode (key) {
    const keyVal = parseInt(key, 10)//parseInt(str,radix)将字符串str转换为radix进制的整数, 如果str的第一个字符无法被转化成数值类型，则返回NaN
    if (keyVal) return `$event.keyCode!==${keyVal}`
    const keyCode = keyCodes[key] // 13
    const keyName = keyNames[key] // "Enter"
    return `_k($event.keyCode,${JSON.stringify(key)},${JSON.stringify(keyCode)},$event.key,${JSON.stringify(keyName)})`
  }

  function on (el, dir) {
    if (dir.modifiers) {
      warn("v-on without argument does not support modifiers.");
    }
    el.wrapListeners = (code) => `_g(${code},${dir.value})`
  }

  function bind$1(el, dir) {
    el.wrapData = code => `_b(${code},'${el.tag}',${dir.value},${dir.modifiers && dir.modifiers.prop ? 'true' : 'false'}${dir.modifiers && dir.modifiers.sync ? ',true' : ''})`
  }

  var baseDirectives = { on, bind: bind$1, cloak: noop };

  var CodegenState = function CodegenState (options) {
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, 'transformCode');
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
    this.directives = extend(extend({}, baseDirectives), options.directives);
    var isReservedTag = options.isReservedTag || no;
    this.maybeComponent = function (el) {
      return !!el.component || !isReservedTag(el.tag);
    };
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
  };

  // generate函数根据抽象语法树ast编译成渲染函数字符串
  function generate (ast, options) {
    const state = new CodegenState(options)
    // 如果第一个参数ast传了，则调用genElement生成代码字符串code
    const code = ast ? genElement(ast, state) : '_c("div")'
    return {
      render: `with(this){return ${code}}`, //把ast生成的代码字符串放入with语句中，形成渲染函数
      staticRenderFns: state.staticRenderFns
    }
  }

  // 传入ast对象和state，生成对应的代码字符串
  function genElement (el, state) {
    if (el.parent) {
      el.pre = el.pre || el.parent.pre;
    }
    if (el.staticRoot && !el.staticProcessed) {
      return genStatic(el, state)
    } else if (el.once && !el.onceProcessed) {
      return genOnce(el, state)
    } else if (el.for && !el.forProcessed) { //ast对象存在for属性，并且未处理
      return genFor(el, state) // 生成v-for指令对应的代码字符串
    } else if (el.if && !el.ifProcessed) {//发现有if属性的el对象就执行genIf
      return genIf(el, state) // 生成v-if指令对应的函数表达式字符串
    } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
      return genChildren(el, state) || 'void 0'
    } else if (el.tag === 'slot') {
      return genSlot(el, state)
    } else {
      var code;
      if (el.component) { // 是组件元素
        code = genComponent(el.component, el, state);
      } else { // 其余的普通元素
        var data;
        if (!el.plain || (el.pre && state.maybeComponent(el))) {
          data = genData$2(el, state); //生成节点的数据对象
        }
        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        code = `_c('${el.tag}'${
          data ? `,${data}` : ''
          }${
          children ? `,${children}` : ''
          })`
      }
      for (var i = 0; i < state.transforms.length; i++) {
        code = state.transforms[i](el, code);
      }
      return code
    }
  }

  function genStatic (el, state) {
    el.staticProcessed = true;
    var originalPreState = state.pre;
    if (el.pre) {
      state.pre = el.pre;
    }
    state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
    state.pre = originalPreState;
    return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
  }

  function genOnce (el, state) {
    el.onceProcessed = true;
    if (el.if && !el.ifProcessed) {
      return genIf(el, state)
    } else if (el.staticInFor) {
      var key = '';
      var parent = el.parent;
      while (parent) {
        if (parent.for) {
          key = parent.key;
          break
        }
        parent = parent.parent;
      }
      if (!key) {
        state.warn(
          "v-once can only be used inside v-for that is keyed. ",
          el.rawAttrsMap['v-once']
        );
        return genElement(el, state)
      }
      return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
    } else {
      return genStatic(el, state)
    }
  }

  function genIf(el, state, altGen, altEmpty) {
    el.ifProcessed = true; // 避免递归，然后实际调用genIfConditions函数，注意这里对el的ifConditions数组slice复制了一份，避免修改了原来的数组本身
    return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
  }

  // 举个例子，
  // <div id="app">
  //   <p v-if="a===0">a等于0</p>  
  //   <p v-else-if="a>0">a大于0</p>  
  //   <p v-else>a小于0</p>  
  // </div>
  // 它经过了模版解析，最后生成的渲染函数字符串为：
  // _c('div', {  // _c的执行其实就是执行createElement函数
  //   attrs: {
  //     "id": "app"
  //   }, // 这是存放标签的属性的对象
  //   [(a === 0) ?
  //     _c('p', _v("a等于0"):
  //       (a > 0) ?
  //         _c('p', _v("a大于0")) :
  //         _c('p', _v("a小于0")))]
  // })

  function genIfConditions(conditions, state, altGen, altEmpty) {
    if (!conditions.length) { //如果conditions不存在，直接返回"null"(第四个参数传了)
      return altEmpty || '_e()' //第四个参数没传，则返回'_e()'，它的执行会创建一个注释节点的vnode对象
    }
    var condition = conditions.shift(); //获取内容：比如 {exp:"xxx==1",block:{...}}
    if (condition.exp) { //如果exp属性值存在，即v-if指令有属性值
      return `(${condition.exp})?${ // 拼凑出一个三元运算符
        genTernaryExp(condition.block)
      }:${
        genIfConditions(conditions, state, altGen, altEmpty)
      }`
    } else {
      return `${genTernaryExp(condition.block)}`
    }
    // 用了v-once指令意味着该元素或组件只渲染一次，包括它所有的子节点。渲染一次之后它们都会被当作静态内容并跳过。使用了v-if的同时用了v-once应该生成像这样的代码字符串(a)?_m(0):_m(1)
    function genTernaryExp(el) { //Ternary:三元的。生成三元表达式
      return altGen ? // 只有在slot-scoped元素中解析v-if才会传altGen，暂时不分析它，默认它没传
        altGen(el, state) :
        el.once ? // 如果元素使用了v-once指令，调用genOnce生成代码字符串
        genOnce(el, state) :
        genElement(el, state) // 如果没有用v-once，正常调用genElement生成代码
    }
  }

  // 根据ast对象中的for属性记录的v-for信息，生成对应的代码字符串
  function genFor(el, state, altGen, altHelper) {
    // 关于v-for的属性类似这样：for:'list', alias:'item', iterator1:'key', iterator2:'index'
    var exp = el.for; // exp是被v-for的对象
    var alias = el.alias;
    var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
    var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

    if (state.maybeComponent(el) &&
      el.tag !== 'slot' &&
      el.tag !== 'template' &&
      !el.key
    ) {
      state.warn(`<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with v-for should have explicit keys. See https://vuejs.org/guide/list.html#key for more info.`, el.rawAttrsMap['v-for'], true /* tip */);
    }

    el.forProcessed = true; // avoid recursion
    return `${altHelper || '_l'}((${exp}),` + // _l即renderList，接收的exp是被遍历的对象
      `function(${alias}${iterator1}${iterator2}){` + // _l还接收一个render函数
      `return ${(altGen || genElement)(el, state)}` +
    '})'
  }

  // genData$2函数根据ast元素节点上的events和nativeEvents⽣成data数据
  function genData$2 (el, state) {
    var data = '{';
    // 指令优先。指令在生成之前可能会改变el的其他属性。
    var dirs = genDirectives(el, state); // 经过genDirectives函数处理后，原来的ast树就增加了两个属性events和props，接下来是字符串生成阶段，也要处理events和props
    if (dirs) {
      data += dirs + ',';
    }
    if (el.key) {
      data += "key:" + (el.key) + ",";
    }
    if (el.ref) {
      data += "ref:" + (el.ref) + ",";
    }
    if (el.refInFor) {
      data += "refInFor:true,";
    }
    if (el.pre) {
      data += "pre:true,";
    }
    if (el.component) {
      data += "tag:\"" + (el.tag) + "\",";
    }
    for (var i = 0; i < state.dataGenFns.length; i++) {
      data += state.dataGenFns[i](el);
    }
    if (el.attrs) {
      data += "attrs:" + (genProps(el.attrs)) + ",";
    }
    // 处理props
    if (el.props) {
      data += "domProps:" + (genProps(el.props)) + ",";
    }
    if (el.events) { // el.events存在，说明要么是组件占位节点有自定义事件的处理回调，要么是原生DOM节点有原生DOM事件的处理回调，调用genHandlers生成对应的代码字符串
      data += `${genHandlers(el.events, false)},`
    }
    if (el.nativeEvents) { //el.nativeEvents存在，说明该组件占位节点上有原生DOM事件的处理回调，调用genHandlers生成对应的代码字符串
      data += `${genHandlers(el.nativeEvents, true)},`
    }
    if (el.slotTarget && !el.slotScope) {
      data += "slot:" + (el.slotTarget) + ",";
    }
    if (el.scopedSlots) {
      data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
    }
    if (el.model) {
      data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
    }
    if (el.inlineTemplate) {
      var inlineTemplate = genInlineTemplate(el, state);
      if (inlineTemplate) {
        data += inlineTemplate + ",";
      }
    }
    data = data.replace(/,$/, '') + '}'; //去掉最后一个逗号，再添上}
    if (el.dynamicAttrs) {
      data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
    }
    if (el.wrapData) {
      data = el.wrapData(data);
    }
    if (el.wrapListeners) {
      data = el.wrapListeners(data);
    }
    return data
  }

  // 生成指令相关的代码字符串
  function genDirectives (el, state) {
    var dirs = el.directives; // 获取元素描述对象的directives属性，是数组。比如[{name: "model", rawName: "v-model", value: "message", arg: null, modifiers: undefined}]
    if (!dirs) return // 如果没有directives属性则直接返回
    var res = 'directives:[' // 待返回的结果字符串res
    var hasRuntime = false;
    var i, l, dir, needRuntime;
    for (i = 0, l = dirs.length; i < l; i++) { // 遍历directives数组
      dir = dirs[i];
      needRuntime = true;
      var gen = state.directives[dir.name];// dir.name是当前指令的名称，编译器的基本参数选项中的directives属性的值为{ model, text, html }，分别对应v-model、v-text、v-html函数，比如model函数会根据不同的表单元素做不同的处理
      if (gen) { //所以gen拿到指令名对应的函数，它返回一个Boolean
        needRuntime = !!gen(el, dir, state.warn); //gen函数调用
      }
      if (needRuntime) {
        hasRuntime = true;
        res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
      }
    }
    if (hasRuntime) {
      return res.slice(0, -1) + ']' //去掉最后的逗号，最终以'directives:[..]'字符串返回
    }
  }

  function genInlineTemplate (el, state) {
    var ast = el.children[0];
    if (el.children.length !== 1 || ast.type !== 1) {
      state.warn(
        'Inline-template components must have exactly one child element.',
        { start: el.start }
      );
    }
    if (ast && ast.type === 1) {
      var inlineRenderFns = generate(ast, state.options);
      return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
    }
  }

  function genScopedSlots(el, slots, state) {
    let needsForceUpdate = el.for || Object.keys(slots).some(key => {
      var slot = slots[key];
      return (slot.slotTargetDynamic || slot.if || slot.for ||
        containsSlotChild(slot) // is passing down slot from parent which may be dynamic
      )
    });
    var needsKey = !!el.if;
    if (!needsForceUpdate) {
      var parent = el.parent;
      while (parent) {
        if (parent.slotScope && parent.slotScope !== emptySlotScopeToken || parent.for) {
          needsForceUpdate = true;
          break
        }
        if (parent.if) {
          needsKey = true;
        }
        parent = parent.parent;
      }
    }

    const generatedSlots = Object.keys(slots).map(key => genScopedSlot(slots[key], state)).join(',')

    return `scopedSlots:_u([${generatedSlots}]${needsForceUpdate ? `,null,true` : ``}${!needsForceUpdate && needsKey ? `,null,false,${hash(generatedSlots)}` : ``})`
  }

  function hash(str) {
    var hash = 5381;
    var i = str.length;
    while(i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return hash >>> 0
  }

  function containsSlotChild (el) {
    if (el.type === 1) {
      if (el.tag === 'slot') return true
      return el.children.some(containsSlotChild)
    }
    return false
  }

  function genScopedSlot(el, state) {
    var isLegacySyntax = el.attrsMap['slot-scope'];
    if (el.if && !el.ifProcessed && !isLegacySyntax) {
      return genIf(el, state, genScopedSlot, "null")
    }
    if (el.for && !el.forProcessed) {
      return genFor(el, state, genScopedSlot)
    }
    var slotScope = el.slotScope === emptySlotScopeToken ? "" : String(el.slotScope);
    
    var fn = "function(" + slotScope + "){" +
      "return " + (el.tag === 'template'
        ? el.if && isLegacySyntax
          ? ("(" + (el.if) + ")?" + (genChildren(el, state) || 'undefined') + ":undefined")
          : genChildren(el, state) || 'undefined'
        : genElement(el, state)) + "}";
    var reverseProxy = slotScope ? "" : ",proxy:true";
    return ("{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}")
  }

  function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
    var children = el.children;
    if (children.length) {
      var el$1 = children[0];
      if (children.length === 1 &&
        el$1.for &&
        el$1.tag !== 'template' &&
        el$1.tag !== 'slot'
      ) {
        var normalizationType = checkSkip ?
          state.maybeComponent(el$1) ? ",1" : ",0" :
          "";
        return `${(altGenElement || genElement)(el, state)}${normalizationType}`
      }
      var normalizationType$1 = checkSkip
        ? getNormalizationType(children, state.maybeComponent)
        : 0;
      var gen = altGenNode || genNode;
      return `[${children.map(c => gen(c, state)).join(',')}]${normalizationType ? `,${normalizationType}` : ''}`
    }
  }

  function getNormalizationType(children, maybeComponent) {
    var res = 0;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      if (el.type !== 1) {
        continue
      }
      if (needsNormalization(el) ||
          (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
        res = 2;
        break
      }
      if (maybeComponent(el) ||
          (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
        res = 1;
      }
    }
    return res
  }

  function needsNormalization (el) {
    return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
  }

  function genNode (node, state) {
    if (node.type === 1) {
      return genElement(node, state)
    } else if (node.type === 3 && node.isComment) {
      return genComment(node)
    } else {
      return genText(node)
    }
  }

  function genText (text) {
    return ("_v(" + (text.type === 2
      ? text.expression // no need for () because already wrapped in _s()
      : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
  }

  function genComment (comment) {
    return ("_e(" + (JSON.stringify(comment.text)) + ")")
  }

  function genSlot (el, state) {
    var slotName = el.slotName || '"default"';
    var children = genChildren(el, state);
    var res = "_t(" + slotName + (children ? ("," + children) : '');
    var attrs = el.attrs || el.dynamicAttrs
      ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({
          name: camelize(attr.name),
          value: attr.value,
          dynamic: attr.dynamic
        }); }))
      : null;
    var bind$$1 = el.attrsMap['v-bind'];
    if ((attrs || bind$$1) && !children) res += ",null";
    if (attrs) res += "," + attrs;
    if (bind$$1) res += (attrs ? '' : ',null') + "," + bind$$1;
    return res + ')'
  }

  function genComponent(componentName, el, state) {
    var children = el.inlineTemplate ? null : genChildren(el, state, true);
    return `_c(${componentName},${genData(el, state)}${children ? `,${children}` : ''})`
  }

  function genProps (props) {
    var staticProps = "";
    var dynamicProps = "";
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var value = transformSpecialNewlines(prop.value);
      if (prop.dynamic) {
        dynamicProps += (prop.name) + "," + value + ",";
      } else {
        staticProps += "\"" + (prop.name) + "\":" + value + ",";
      }
    }
    staticProps = "{" + (staticProps.slice(0, -1)) + "}";
    if (dynamicProps) {
      return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
    } else {
      return staticProps
    }
  }

  function transformSpecialNewlines (text) {
    return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
  }

  var prohibitedKeywordRE = new RegExp('\\b' + 'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,super,throw,while,yield,delete,export,import,return,switch,default,extends,finally,continue,debugger,function,arguments'.split(',').join('\\b|\\b') + '\\b');

  var unaryOperatorsRE = new RegExp('\\b' + 'delete,typeof,void'.split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

  var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

  function checkNode (node, warn) {
    if (node.type === 1) {
      for (var name in node.attrsMap) {
        if (dirRE.test(name)) {
          var value = node.attrsMap[name];
          if (value) {
            var range = node.rawAttrsMap[name];
            if (name === 'v-for') {
              checkFor(node, ("v-for=\"" + value + "\""), warn, range);
            } else if (onRE.test(name)) {
              checkEvent(value, (name + "=\"" + value + "\""), warn, range);
            } else {
              checkExpression(value, (name + "=\"" + value + "\""), warn, range);
            }
          }
        }
      }
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          checkNode(node.children[i], warn);
        }
      }
    } else if (node.type === 2) {
      checkExpression(node.expression, node.text, warn, node);
    }
  }

  function checkEvent (exp, text, warn, range) {
    var stipped = exp.replace(stripStringRE, '');
    var keywordMatch = stipped.match(unaryOperatorsRE);
    if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
      warn(`avoid using JavaScript unary operator as property name: "${keywordMatch[0]}" in expression ${text.trim()}`, range);
    }
    checkExpression(exp, text, warn, range);
  }

  function checkFor (node, text, warn, range) {
    checkExpression(node.for || '', text, warn, range);
    checkIdentifier(node.alias, 'v-for alias', text, warn, range);
    checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
    checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
  }

  function checkIdentifier(ident, type, text, warn, range) {
    if (typeof ident === 'string') {
      try {
        new Function(("var " + ident + "=_"));
      } catch (e) {
        warn(`invalid ${type} "${ident}" in expression: ${text.trim()}`, range)
      }
    }
  }

  function checkExpression (exp, text, warn, range) {
    try {
      new Function(("return " + exp));
    } catch (e) {
      var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
      if (keywordMatch) {
        warn(`avoid using JavaScript keyword as property name: "${keywordMatch[0]}"\n  Raw expression: ${text.trim()}`, range)
      } else {
        warn(`invalid expression: ${e.message} in\n\n ${exp}\n\n Raw expression: ${text.trim()}\n`, range)
      }
    }
  }

  var range = 2;

  function generateCodeFrame(source, start = 0, end = source.length) {
    const lines = source.split(/\r?\n/)
    let count = 0
    const res = []
    for (let i = 0; i < lines.length; i++) {
      count += lines[i].length + 1
      if (count >= start) {
        for (let j = i - range; j <= i + range || end > count; j++) {
          if (j < 0 || j >= lines.length) continue
          res.push(`${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j]}`)
          const lineLength = lines[j].length
          if (j === i) {
            const pad = start - (count - lineLength) + 1
            const length = end > count ? lineLength - pad : end - start
            res.push(`   |  ` + repeat(` `, pad) + repeat(`^`, length))
          } else if (j > i) {
            if (end > count) {
              const length = Math.min(end - count, lineLength)
              res.push(`   |  ` + repeat(`^`, length))
            }
            count += lineLength + 1
          }
        }
        break
      }
    }
    return res.join('\n')
  }

  function repeat$1 (str, n) {
    var result = '';
    if (n > 0) {
      while (true) { // eslint-disable-line
        if (n & 1) { result += str; }
        n >>>= 1;
        if (n <= 0) { break }
        str += str;
      }
    }
    return result
  }
  //将字符串形式的函数代码转成可以执行的函数
  function createFunction(code, errors) {
    try { // 通过new Function转成函数
      return new Function(code) 
    } catch (err) {
      errors.push({ err, code }) //new Function时捕获的错误推入errors中
      return noop
    }
  }
  // compileToFunctions函数做了几件事：1.缓存编译结果，不用重复编译。2.检测内容安全策略，保证new Function可用；3.调用compile将模版字符串转成渲染函数字符串，compile内部调用baseCompile。3.调用createFuntion将渲染函数字符串转成真正的渲染函数。4.打印compile和toFunction两个阶段的错误。所以compileToFunctions其实包含compile和toFunction两部分
  function createCompileToFunctionFn (compile) { //传入compile函数
    var cache = Object.create(null) //cache对象记录template的编译结果
    return function compileToFunctions(template, options, vm) {
      options = extend({}, options) //extend将选项参数混合到一个新对象中
      var warn$$1 = options.warn || warn
      delete options.warn
      try { //检测new Function()是否可用，因为代码字符串转函数要靠它实现，如果内容安全策略比较严格，它就不能用，trycatch捕获的错误e包含了unsafe-eval/CSP字样就警告
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) warn$$1('您在使用完整版本的Vue，该版本的环境具有禁止不安全评估的内容安全策略。compiler无法在此环境中工作。请考虑放宽CSP策略，或使用预编译')
      }
      // delimiters选项的作用是改变纯文本插入分隔符(默认{{}})。delimiters:['${','}']插值形式就变成了${}。这个选项只在完整构建版本中的浏览器内编译时可用。
      // 定义key常量。"${,}"+template字符串 或 template字符串
      var key = options.delimiters ? String(options.delimiters) + template : template;
      if (cache[key]) return cache[key] //如果cache[key]存在，则直接返回它，避免重复编译
      var compiled = compile(template, options); //compileToFunctions函数的核心是执行compile，生成的对象包含渲染函数字符串
      if (compiled.errors && compiled.errors.length) {//compiled对象包含两个属性errors数组和tips数组，分别包含编译过程中的错误和提示信息
        if (options.outputSourceRange) {
          compiled.errors.forEach(function (e) {
            warn$$1(`Error compiling template:\n\n${e.msg}\n\n` + generateCodeFrame(template, e.start, e.end), vm);
          });
        } else {
          warn$$1(`Error compiling template:\n\n${template}\n\n` + compiled.errors.map(e => `- ${e}`).join('\n') + '\n', vm);
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(e => tip(e.msg, vm))
        } else {
          compiled.tips.forEach(msg => tip(msg, vm))
        }
      }
      var res = {}; // res是最终返回值
      var fnGenErrors = []; // fnGenErrors数组接收createFunction过程中的错误信息
      res.render = createFunction(compiled.render, fnGenErrors) //添加res.render属性，值为createFunction生成的渲染函数，compiled.render是渲染函数的字符串
      res.staticRenderFns = compiled.staticRenderFns.map(code => createFunction(code, fnGenErrors));
      // 向res添加staticRenderFns属性，值是一个函数数组，compiled除了包含render:函数字符串外，还包含一个函数字符串数组staticRenderFns，它最终也转为真正的函数
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(`Failed togenerate render function:\n\n` + fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'), vm)
      }
      return (cache[key] = res) //将模板字符串和编译结果以键值对形式存到cache对象，因为模板编译比较费时，使用缓存可以防止重复编译，提高性能。最后返回res对象，包含了可执行的渲染函数和staticRenderFns。
    }
  }

  // 编译器创建者 的 创建者 直接返回了createCompiler，也就是编译器compile的创建者。
  // 核心是定义了complie函数，它做了这些事：第一，生成最后的编译器选项对象finalOptions。第二，对错误的收集。第三，调用baseCompile函数生成compiled对象，compiled对象是baseCompile函数的执行结果，是包含ast对象和渲染函数字符串的对象。
  function createCompilerCreator (baseCompile) {
    return function createCompiler (baseOptions) {
      // 定义了compile，然后返回一个包含compile和compileToFunctions的对象
      function compile (template, options) { //接收模版字符串和选项参数
        var finalOptions = Object.create(baseOptions);//最终的编译选项参数
        var errors = [];
        var tips = [];
        var warn = (msg, tip) => {
          (tip ? tips : errors).push(msg);
        };
        if (options) {
          if (options.outputSourceRange) {
            var leadingSpaceLength = template.match(/^\s*/)[0].length;
            warn = function (msg, range, tip) {
              var data = { msg };
              if (range) {
                if (range.start != null) {
                  data.start = range.start + leadingSpaceLength;
                }
                if (range.end != null) {
                  data.end = range.end + leadingSpaceLength;
                }
              }
              (tip ? tips : errors).push(data);
            };
          }
          if (options.modules) {
            finalOptions.modules =
              (baseOptions.modules || []).concat(options.modules);
          }
          if (options.directives) {
            finalOptions.directives = extend(
              Object.create(baseOptions.directives || null),
              options.directives
            );
          }
          for (var key in options) {
            if (key !== 'modules' && key !== 'directives') {
              finalOptions[key] = options[key];
            }
          }
        }
        finalOptions.warn = warn;
        var compiled = baseCompile(template.trim(), finalOptions);
        // compile函数对模版的编译是靠baseCompile，compiled是baseCompile对模版的编译结果，这个结果中包含了模版编译后的抽象语法树
        if (compiled.ast) {
          checkNode(compiled.ast, warn);
        }
        // 通过ast抽象语法树来检查模版中是否存在错误表达式的
        compiled.errors = errors;
        compiled.tips = tips; // 将收集到的错误和提示添加到compiled
        return compiled // 并返回
      }
      return {
        compile,
        compileToFunctions: createCompileToFunctionFn(compile)
      }
    }
  }
  // Vue利用函数柯里化这种技巧，生成编译模板的方法compileToFunctions，看似设计繁琐，实际设计十分巧妙。这样设计的原因是Vue能在不同平台运行，比如在服务器端做SSR，也可以在weex下使用。不同平台都会有编译过程，所依赖的基本编译选项baseOptions会有所不同。Vue将基础的编译过程抽离出来，并且可以在多处添加编译器选项，然后将添加的编译器选项和基本编译选项合并起来，最终灵活实现在不同平台下的编译。

  // baseCompile是compile函数的核心，模板编译就是靠baseCompile，baseCompile函数返回对模板的编译结果对象，包含了渲染函数代码字符串
  function baseCompile(template, options) { // 接收模版字符串和finalOptions
    const ast = parse(template.trim(), options) // 模版字符串解析成抽象语法树ast。这里面包括了属性/指令的解析，解析结果放入相关属性中
    if (options.optimize !== false) { // 优化ast
      optimize(ast, options);
    }
    let code = generate(ast, options) //根据解析完的ast树生成渲染函数字符串，我们知道ast对象里承载了很多属性信息指令信息，generate转化为对应的代码字符串
    return {
      ast, // 抽象语法树ast
      render: code.render, //渲染函数代码字符串
      staticRenderFns: code.staticRenderFns //静态渲染函数
    }
  }

  // createCompilerCreator执行生成createCompile函数，即compile函数的创建者
  var createCompiler = createCompilerCreator(baseCompile)
  // createCompiler函数执行返回一个包含compile函数和compileToFunctions函数的对象
  var { compile, compileToFunctions } = createCompiler(baseOptions);
  // compileToFunctions函数其实是createCompileToFunctionFn(compile)执行生成的
  // compile函数和compileToFunctions区别是compile生成字符串形式的代码，compileToFunctions生成真正可执行的代码（本身是用compileToFunctions根据compile生成的）
  // 在创建编译器时传入基本编译器选项，当真正使用编译器编译模版时，依然可以传递编译器选项，并且新的选项和基本选项会以合适的方式融合或覆盖。

  var div;
  function getShouldDecode (href) {
    div = div || document.createElement('div');
    div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
    return div.innerHTML.indexOf('&#10;') > 0
  }

  var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
  var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

  //原函数是返回id对应的元素的innerHTML字符串。同一个id多次调用，第二次开始就不再执行原函数，从缓存中取
  var idToTemplate = cached(id => {
    var el = query(id);
    return el && el.innerHTML
  });

  const mount = Vue.prototype.$mount; // 先缓存一份不带编译器的$mount函数

  // 重新定义$mount函数，在运行时的$mount的基础上增加了模版编译，即为包含编译器和不包含编译器的版本提供不同的封装，最后调用的是缓存的$mount方法。得到初始化的实例后，就开始组件的挂载，如果没有传渲染函数，就将传入的模板经过编译器的解析，生成对应的渲染函数代码，如果传了渲染函数，则跳过了模板编译过程。调用vm._render将渲染函数转为vnode，然后通过vm._update执行将vnode转为真实DOM插入到页面完成渲染。
  Vue.prototype.$mount = function (el, hydrating) {
    // 如果传了el，就获取el对应的DOM节点，即组件挂载的占位节点
    el = el && query(el)
    if (el === document.body || el === document.documentElement) {
      warn("不要把Vue实例挂载到html/body元素上，挂载点本意就是组件挂载的占位符，它将会被组件自身的模版替换掉，而body/html元素不能被替换");
      return this
    }
    var options = this.$options // 获取options，$options是在_init方法执行时产生
    // 如果用户传了渲染函数，直接调用不带编译器的$mount函数，否则使用template/el选项自己构建render函数。所有组件的渲染最后都要有渲染函数，无论是单文件.vue方式开发组件，还是传el或template选项，最后都会通过compileToFunctions转成渲染函数。没有render，先过template选项获取合适的内容作为模板字符串，template选项有可能是字符串/元素节点/其他，如果是字符串且首字符是#，则把它作为css选择符去获取对应的DOM元素，并把元素的innerHTML作为模版字符串。没有获取到对应的DOM元素，或innerHTML为空字符串，报出警告
    if (!options.render) {
      var template = options.template
      if (template) {
        if (typeof template === 'string') {
          if (template.charAt(0) === '#') {
            template = idToTemplate(template)
            if (!template) warn(("Template元素没有找到或是空的：" + (options.template)), this)
          }
        // 如果template作为字符串但第一个字符不是#，什么都不做，就用template自身作为模版字符串。如果template是元素节点，则它的innerHTML作为模版字符串，如果template不是字符串也不是DOM元素，报警提示用户传入的template选项无效
        } else if (template.nodeType) {
          template = template.innerHTML;
        } else {
          warn('无效的template选项:' + template, this)
          return this
        }
      } else if (el) { // 没传template但传了el，则使用el.outerHTML作为template字符串
        template = getOuterHTML(el);
      }
      // template有可能是空字符串，如果不为空，调用compileToFunctions编译模板字符串，从返回值中解构出render函数，添加到$options对象的render属性
      if (template) {
        var { render, staticRenderFns } = compileToFunctions(template, {
            outputSourceRange: "development" !== 'production',
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,
            delimiters: options.delimiters,
            comments: options.comments
          }, this);
        options.render = render
        options.staticRenderFns = staticRenderFns;
      }
    }
    // 前面做是获取合适的template字符串并编译成渲染函数，接着调用不含编译功能的$mount，进行真正的挂载
    return mount.call(this, el, hydrating)
  };
  // 获取描述一个DOM元素的（包括其后代）HTML字符串。注意IE9-11中SVG元素没有innerHTML和outerHTML属性，把SVG元素放到一个新建的DIV元素中，div元素的innerHTML就等价于SVG元素的outerHTML
  function getOuterHTML(el) {
    if (el.outerHTML) {
      return el.outerHTML
    } else {
      var container = document.createElement('div');
      container.appendChild(el.cloneNode(true));
      return container.innerHTML
    }
  }
  Vue.compile = compileToFunctions; // Vue暴露给开发者的工具函数，能将字符串编译为渲染函数
  return Vue;
}));
