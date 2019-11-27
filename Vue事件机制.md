# Vue事件机制
我们经常在模板中绑定给事件绑定回调，并且利用自定义事件去实现父子组件间的通信，这个事件和原生dom事件有什么区别，实现原理是什么？

Vue实例挂载之前，做了很多模板编译的工作，将模板字符串解析成ast树，再转成渲染函数，有了渲染函数才会进入到挂载的过程。

对于事件来说，我们使用v-on或者@在模板上给事件绑定处理回调。因此事件处理的第一步就是在编译阶段对事件指令的收集处理

```js
  function baseCompile(template, options) { // 接收模版字符串和finalOptions
    const ast = parse(template.trim(), options) 
    if (options.optimize !== false) { // 优化ast
      optimize(ast, options);
    }
    let code = generate(ast, options);
    return {
      ast, // 抽象语法树ast
      render: code.render, //渲染函数代码字符串
      staticRenderFns: code.staticRenderFns //静态渲染函数
    }
  }
```

模板编译的入口是const ast = parse(template.trim(), options)，模板字符串解析成抽象语法树ast，这里面包含了属性和指令的解析，解析的结果会放在ast对象的相关属性中

在parse函数中，主要是调用parseHTML函数对模板字符串进行解析，当遇到2元标签的结束标签或1元标签时会调用closeElement函数将标签“闭合”

```js
function closeElement (element) { // 传入的是1元标签或2元标签所对应的元素描述对象
  // ...省略
  if (!inVPre && !element.processed) {//你要闭合的标签不处于v-pre之中，且没被解析过
    element = processElement(element, options);
  }
  // ...省略
}
```

我们看到，closeElement函数中会调用processElement对没有解析过的元素进行处理

```js
  function processElement (element, options) {
    // ...省略
    processAttrs(element);
    return element
  }
```

省略的部分和之前的操作已经将模板字符串中的key属性、v-pre、v-for、v-if等指令解析出来，加入到元素描述对象的相关属性中。剩下的属性交给processAttrs处理，其中就包括了事件绑定的指令的处理

```js
  function processAttrs (el) {
    var list = el.attrsList;
    // ...
    for (var i = 0; i < list.length; i++) {//遍历每个属性
      name = rawName = list[i].name; // name是指令名字符串
      value = list[i].value; // value是指令的值
      if (dirRE.test(name)) { //如果属性名name以v- @ :开头
        // ...
        if (onRE.test(name)) { // 当前指令是v-on/@指令
          name = name.replace(onRE, ''); // 去掉指令前缀
          // ...
          // 调用addHandler为el添加事件相关的属性
          addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic)
        } 
        // 
      }
      // ...
    }
  }
```
先获取到元素描述对象的attrsList属性数组，里面存放着当前元素剩下的未处理的属性。对数组进行遍历，遍历每个属性，如果满足指令的格式：以v-或@或:开头，且是以v-on或@开头，说明是事件绑定的指令。

然后将指令的前缀v-on:或:去掉，剩下的name就是真正的事件名，现在我们有事件名name，又有指令的值value，调用addHandler给元素描述对象el添加事件相关的属性，而且addHandler还有一个重要功能，是对事件修饰符的特殊处理 

现在看看addHandler函数的实现

```js

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
    
    if (modifiers.capture) {
      delete modifiers.capture
      name = prependModifierMarker('!', name, dynamic)
    }
    if (modifiers.once) {
      delete modifiers.once;
      name = prependModifierMarker('~', name, dynamic);
    }
    if (modifiers.passive) {
      delete modifiers.passive;
      name = prependModifierMarker('&', name, dynamic)
    }
    let events
    if (modifiers.native) { 
      delete modifiers.native
      events = el.nativeEvents || (el.nativeEvents = {})
    } else {
      events = el.events || (el.events = {})
    }

    const newHandler = rangeSetItem({ value: value.trim(), dynamic }, range)
    if (modifiers !== emptyObject) { 
      newHandler.modifiers = modifiers
    }
    var handlers = events[name];
    if (Array.isArray(handlers)) { 
      important ? handlers.unshift(newHandler) : handlers.push(newHandler)
    } else if (handlers) {
      events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
    } else {
      events[name] = newHandler
    }
    el.plain = false;
  }
```

我们暂时不看使用了修饰符的情况

```js
let events
if (modifiers.native) {
  delete modifiers.native
  events = el.nativeEvents || (el.nativeEvents = {})
} else {
  events = el.events || (el.events = {})
}
```
先定义了一个events变量，如果这个事件指令使用了修饰符.native，意味着监听的是DOM原生的事件，如果没有使用修饰符.native，监听的是或者说注册的是自定义事件，只有$emit才能触发的事件。

如果使用了native修饰符，我们让变量events指向el.nativeEvents对象，如果el.nativeEvents不存在，给它初始化为空对象。

如果没有使用.native，变量events指向el.events对象，如果el.events不存在，初始化为空对象

```js
const newHandler = rangeSetItem({ value: value.trim(), dynamic }, range)
if (modifiers !== emptyObject) {
  newHandler.modifiers = modifiers
}
```

现在我们知道el对象上的nativeEvents和events属性，分别用来存放原生事件和自定义事件的

接着，我们定义newHandler，rangeSetItem函数执行的返回值赋给它，它是事件名对应的处理对象，里面存放着指令的值value。

如果当前指令使用了修饰符，就往newHandler对象添加modifiers属性，属性值为modifiers对象，类似这样：{prevent: true,stop: true}

```js
var handlers = events[name];
if (Array.isArray(handlers)) {
  important ? handlers.unshift(newHandler) : handlers.push(newHandler)
} else if (handlers) {
  events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
} else { 
  events[name] = newHandler;
}
el.plain = false;
```

我们知道events，即el.events存放的是自定义事件name和它对应的处理回调，而且同一个事件可以多个回调，events[name]就是自定义事件name对应的值，将它赋给handlers

important是addHandler传入的参数，它决定了新添加的回调是放在数组的前面还是后面，这决定了它先执行还是后执行。

首先判断handlers是否为数组，如果是，说明事件name对应的回调有不止一个，我们将新的回调newHandler，准确的说它不叫回调，是一个包含回调内容的对象，但这里方便表述就这么叫了，将newHandler加入到handlers数组中

如果handlers不是数组，但有值，说明事件name的回调有且只有一个，目前，则我们创建一个数组，将newHandler加入，和原有的handlers在一起。

如果handlers不存在，说明事件name还没有相应的回调，直接把newHandler赋给events[name]

最后给元素描述对象el添加plain属性，值为false

所以经过了addHandler的执行后，用户通过指令注册的自定义事件和原生DOM事件，都被放入到元素描述对象的events和nativeEvents属性（对象）中，即完善到了ast树中

解析完的ast树要转成渲染函数的字符串，入口就是：let code = generate(ast, options)，我们看看generate函数

```js
  function generate (ast, options) {
    const state = new CodegenState(options)
    const code = ast ? genElement(ast, state) : '_c("div")'
    return {
      render: `with(this){return ${code}}`, //把ast生成的代码字符串放入
      staticRenderFns: state.staticRenderFns
    }
  }
```
我们看到ast传了就会调用genElement函数，将ast树转成渲染函数字符串，然后生成的代码字符串放入with语句中，形成渲染函数，传给返回对象的render属性。

看看genElement函数

```js
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
          data = genData$2(el, state);
        }
        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
      }
      // module transforms
      for (var i = 0; i < state.transforms.length; i++) {
        code = state.transforms[i](el, code);
      }
      return code
    }
  }
```
关于事件的属性的处理是在
```js
 var data;
if (!el.plain || (el.pre && state.maybeComponent(el))) {
  data = genData(el, state);
}
var children = el.inlineTemplate ? null : genChildren(el, state, true);

code = `_c('${el.tag}'${
      data ? `,${data}` : '' // data
      }${
      children ? `,${children}` : '' // children
      })`
```

会调用genData函数，把返回值赋给data，然后data再编入code字符串，即渲染函数的字符串中

我们看看genData函数

```js
  function genData$2 (el, state) {
    var data = '{';
    // ...
    if (el.events) {
      data += `${genHandlers(el.events, false)},`
    }
    if (el.nativeEvents) {
      data += `${genHandlers(el.nativeEvents, true)},`
    }
  
    data = data.replace(/,$/, '') + '}'; //去掉最后一个逗号，再添上}
    // ...
    return data
  }
```
我们只看有关事件的部分

因为genData函数最后返回的是data字符串，先定义data，初始化为'{'

如果元素的el对象的events属性有值，说明它绑定有自定义事件，调用genHandlers生成一段代码字符串，拼接到data，第二个参数false代表不是原生事件

如果元素的el对象的nativeEvents属性有值，说明它通过.native绑定有原生DOM事件，调用genHandlers生成一段代码字符串，拼接到data，第二个参数true代表是原生事件

我们看看genHandlers函数，是如何根据el.events和el.nativeEvents的属性值转成对应的函数字符串的

```js
  function genHandlers (events, isNative) { // isNative代表是否监听原生DOM事件
    var prefix = isNative ? 'nativeOn:' : 'on:'; // 属性值不一样，nativeOn和on
    let staticHandlers = ``
    let dynamicHandlers = `` // 针对动态事件参数
    for (const name in events) { // 遍历el的事件对象的每一个事件
      const handlerCode = genHandler(events[name]) // 调用genHandler生成该事件对应的代码
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
      return prefix + staticHandlers
    }
  }
```

genHandlers函数遍历el.events或nativeEvents事件对象，对同一个事件名的事件调用genHandler函数，生成事件相关的供拼接的代码字符串。

```js
var prefix = isNative ? 'nativeOn:' : 'on:'
let staticHandlers = ``
let dynamicHandlers = `` 
for (const name in events) { 
  const handlerCode = genHandler(events[name]) 
  if (events[name] && events[name].dynamic) {
    dynamicHandlers += `${name},${handlerCode},`
  } else { 
    staticHandlers += `"${name}":${handlerCode},`
  }
}
```
首先根据传入的isNative的真假判断使用什么样的前缀，prefix有两种可能'nativeOn:' 和 'on:'

然后遍历事件对象的每一个事件，调用genHandler函数生成该事件对应的函数代码字符串，赋给handlerCode

如果不是动态参数，则类似这样：'"select":function($event){...},'

```js
staticHandlers = `{${staticHandlers.slice(0, -1)}}` // 去掉最后一个逗号
if (dynamicHandlers) {
  return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`
} else { //  'on:"select":function($event){...}'
  return prefix + staticHandlers
}
```
然后将staticHandlers去掉最后一个逗号，再放入一个对象中，不考虑动态参数清空，会添加前缀prefix

最后字符串长这样：'on:"select":function($event){...}'

或 'nativeOn:"click":function($event){...}'

我们看看genHandler函数的实现：

```js
  function genHandler (handler) { 
    if (!handler) return 'function(){}'
    if (Array.isArray(handler)) {
      return `[${handler.map(handler => genHandler(handler)).join(',')}]`
    }
    const isMethodPath = simplePathRE.test(handler.value)
    const isFunctionExpression = fnExpRE.test(handler.value)
    const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''))
    if (!handler.modifiers) {
      if (isMethodPath || isFunctionExpression) { 
        return handler.value 
      }
      return `function($event){${isFunctionInvocation?`return ${handler.value}`:handler.value}}`
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
```
传入genHandler的参数是具体某个事件名对应的handler，可能是数组也可能是对象

```js
if (!handler) return 'function(){}' // 如果没有对应的回调，就返回一个空函数字符串
// handler为数组，说明该事件绑定了多个回调，递归调用
if (Array.isArray(handler)) { // 把多个函数字符串，放入到数组里，形如
  return `[${handler.map(handler => genHandler(handler)).join(',')}]`
}
```
如果该事件没有对应的回调，则返回一个空函数的字符串

如果该事件的handler是数组，说明事件绑定了多个回调，要对数组里的每个回调调用getHandler方法，转成函数字符串，然后数组调用join拼接起来，再放到一个数组里，形如：`[function($event){...}, function($event){...}, function($event){...}]`，直接返回这个结果

剩下就是handler是对象，判断对象中的value属性值，即指令的值

```js
const isMethodPath = simplePathRE.test(handler.value) 
const isFunctionExpression = fnExpRE.test(handler.value) 
const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''))
```

我们知道模板中事件绑定有三种写法，分别对应上面三种
- @click="doThis"
- @click="functions(){...}"
- @click="doThis($event)"
即直接写method名，写函数表达式，写成函数传入事件对象并调用

```js
if (!handler.modifiers) {
  if (isMethodPath || isFunctionExpression) {
    return handler.value
  }
  return `function($event){${isFunctionInvocation?`return ${handler.value}`:handler.value}}`
}
```
如果该事件没有使用修饰符，如果是@click="doThis"或@click="functions(){...}"形式，则直接返回'doThis'或'()=>{...}'/'function(){...}'

如果指令的值不少上面两种情况，有可能是doThis($event)，也可能类似"console.log(11)"，则包裹在`function($event){}`里，如果是前者情况，就返回函数调用的结果，即return ${handler.value}，如果是后者，就作为表达式放在function($event){}中即可

下面是使用修饰符的部分：

```js
let code = '', genModifierCode = '', keys = []
for (const key in handler.modifiers) { 
  if (modifierCode[key]) {
    genModifierCode += modifierCode[key]
    if (keyCodes[key]) keys.push(key)
  } else if (key === 'exact') {
    // 
  } else { 
    keys.push(key)
  }
}
```
遍历modifiers上记录的修饰符，key为修饰符的名称，根据修饰符的名称在modifierCode对象中找到对应的代码字符串。

比如 stop对应 '$event.stopPropagation();'，然后追加到genModifierCode字符串中

如果修饰符是left/right，将key，即修饰符名称，推入数组keys

如果用了别的修饰符比如enter，也将key推入数组keys

```js
  if (keys.length) { 
    code += genKeyFilter(keys) 
  }
  if (genModifierCode) {
    code += genModifierCode
  }
```
如果keys数组的长度不为0，keys数组存的这些都是和键盘相关的事件，调用genKeyFilter看看能不能生成键盘事件相关的代码字符串，形如 "if(!$event.type.indexOf('key')&&_k($event.keyCode, "enter", 13, $event.key, "Enter"))return null;"

然后判断genModifierCode是否存在，存在则追加到code字符串中，这是确保了像prevent和stop这样的修饰符对应的代码字符串在键盘过滤后执行

```js
  const handlerCode = isMethodPath ?
    `return ${handler.value}($event)` : 
    isFunctionExpression ?
    `return (${handler.value})($event)` :
    isFunctionInvocation ? 
    `return ${handler.value}` : 
    handler.value // 如果是一段表达式，就不返回，直接放进来
  return `function($event){${code}${handlerCode}}`
```

最后根据绑定事件的不同写法，生成返回的代码字符串，如果是@click="doThis"这样，则最后返回的代码是这么写的：`return doThis($event)`

如果是@click="functions(){}"这样，则包成立即执行函数，并传入$event，最后返回的代码是这么写的：`return (functions(e){console.log(e)})($event)`

如果是@click="doThis($event)"这样，则最后返回的代码是这么写的：`return doThis($event)`

如果是一般表达式，比如@click="this.xxx=true"，就不用返回了，直接放进函数里

最后生成的函数代码字符串是`function($event){${code}${handlerCode}}`，前面的code字符串是有关修饰符的代码，后面的是真正的回调执行的代码

## 事件绑定

前面讲了模板上的事件绑定是怎么标记在ast树上，并且根据ast树生成正确的渲染函数，但是真正的事件绑定离不开绑定注册事件，这个阶段发生在组件挂载阶段。

有了渲染函数，就能生成实例挂载所需要的虚拟VNode树，并且会进行新旧vnode树的比较，生成真实的DOM节点

VNode树的构建过程，是VNode类的实例化，有了vnode就能遍历子节点，调用createElm为每个子节点创建真实DOM，由于vnode有data属性，在创建真实DOM时会进行注册相关钩子函数的过程，其中就是注册事件的相关处理

```js
    function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
      var data = vnode.data; // 获取vnode的节点信息data
      var tag = vnode.tag
      if (isDef(tag)) {
        if (isDef(data)) { // 针对指令的处理
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
      }
    }
```
createElm函数包含真实DOM节点的创建和插入，之前生成的vnode决定了最终应该生成何种节点，即生成的真实DOM节点依赖于vnode携带的信息

获取了vnode的标签名tag，如果标签名存在，说明vnode对应的是元素节点，即普通节点(区别于组件)，如果vnode的data属性存在，就调用invokeCreateHooks

```js
  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode) // 调用updateDOMListeners
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }
```
用户在模板定义v-on事件，v-bind动态属性，v-for等，它们都会在编译阶段和vnode生成阶段创建data属性，invokeCreateHooks调用就是处理模板中的指令

cbs是一个对象，它里面有'create', 'activate', 'update', 'remove', 'destroy'属性，属性值是一个数组，在createPatchFunction函数中，会遍历modules，如果当前module定义了当前hook，比如create，就会把create对应的函数push到cbs.create数组中

modules模块其中包含了事件模块events，它是一个包含了create和update两个hook的对象
```js
  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };
```

因此cbs.create数组里就存放了updateDOMListeners函数。

```js
for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
  cbs.create[i$1](emptyNode, vnode);
}
```
其中就包括了执行updateDOMListeners(emptyNode, vnode)

其中第一个参数是 var emptyNode = new VNode('', {}, []); 第二个参数vnode是当前vnode节点

```js
  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) return //如果新旧vnode对象都没有on，说明都没有绑定事件，直接返回
    var on = vnode.data.on || {}; // 这就是之前生成的data中对应的事件对象
    var oldOn = oldVnode.data.on || {}; // 旧vnode的on对象
    target$1 = vnode.elm; // 获取当前vnode的真实DOM对象
    normalizeEvents(on);// normalizeEvents是对事件兼容性的处理
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
    // updateListeners函数会遍历on对象，对新节点事件绑定注册事件，对旧节点移除事件监听，既要处理原生DOM事件的添加和移除，也要处理自定义事件的添加和移除。
    target$1 = undefined;
  }
```
updateDOMListeners函数的作用是更新原生DOM事件，区别于自定义事件(自定义事件只能在模板中的组件绑定)

updateDOMListeners接收旧的和新的vnode对象，如果新旧vnode的data对象都没有定义on，说明都没有绑定事件，直接返回

normalizeEvents是对事件做兼容性处理，针对v-model，它在ie浏览器中不支持change事件，只能用input事件代替

最后调用updateListeners，遍历on对象，对新vnode的事件进行绑定注册，对vnode的节点移除事件回调，而且这个函数既要处理原生DOM事件的添加和移除，也要处理自定义事件的添加和移除

```js
  function updateListeners(on, oldOn, add, remove$$1, createOnceHandler, vm) {
    var name, def$$1, cur, old, event;
    for (name in on) { 
      def$$1 = cur = on[name]; 
      old = oldOn[name];
      event = normalizeEvent(name); 
      if (isUndef(cur)) {
        warn(`"${event.name}"的事件处理函数是无效的:得到的是` + String(cur), vm)
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur, vm)
        }
        if (isTrue(event.once)) { 
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params)
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old
      }
    }
    for (name in oldOn) { //遍历旧的事件监听器对象
      if (isUndef(on[name])) {//如果存在某个事件在新的on对象中没有，说明这个事件要被移除
        event = normalizeEvent(name) // 整理出标准化的事件名对象
        remove$$1(event.name, oldOn[name], event.capture); // 移除事件处理函数
      }
    }
  }
```
updateListeners函数接收新旧事件监听器对象，事件添加和移除的函数，以及实例vm，然后遍历on对象，如果当前某个事件在oldOn对象中没有对应的回调，说明需要调用add去添加该事件的回调；相反，如果oldOn对象中某个事件在当前的on对象中没有对应的回调，说明该事件的回调需要被移除。

```js
for (name in on) {
      def$$1 = cur = on[name]
      old = oldOn[name];
      event = normalizeEvent(name); 
      if (isUndef(cur)) { 
        warn(`"${event.name}"的事件处理函数是无效的:得到的是` + String(cur), vm)
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur, vm);
        }
        if (isTrue(event.once)) { 
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params) 
      } else if (cur !== old) { //如果cur!==old，即对于同一事件，它的回调函数前后变化了，我们不需要调用add去添加一个新的事件回调，因为old指向了invoker，它的fns是真正的回调old，只需将fns属性值改为cur，即用新的处理回调覆盖。再把old赋给on[name]，即cur和on[name]指向了invoker
        old.fns = cur;
        on[name] = old; //保证了事件回调invoker只创建一次，之后更新回调只用修改invoker的fns属性值
      }
    }
```

遍历新的事件监听器对象on，def$$1 = cur = on[name] 当前遍历的事件name对应的事件对象，赋给def$$1和cur。当前的事件name在oldOn对象中对应的事件对象赋给old

然后调用normalizeEvent，生成规范化后的事件名对象，它包含了修饰符的使用情况

if (isUndef(cur)) 如果on对象中name对应的事件对象不存在，说明事件name对应的处理函数是无效的，报错提示。

如果oldOn对象没有事件name的对应的事件对象，说明该事件回调需要新增。

```js
if (isUndef(cur.fns)) {
  cur = on[name] = createFnInvoker(cur, vm)
}
```

如果cur对象，即当前事件name对应的事件对象，fns属性没有定义，说明之前没有为该事件创建过回调，则调用createFnInvoker创建事件最终执行的回调，叫invoker，赋给cur

```js
  function createFnInvoker (fns, vm) {
    function invoker () {
      const fns = invoker.fns
      if (Array.isArray(fns)) {
        const cloned = fns.slice() 
        for (let i = 0; i < cloned.length; i++) { 
          invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
        }
      } else {
        return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
      }
    }
    invoker.fns = fns 
    return invoker 
  }
```
createFnInvoker函数第一个参数fns，接收一个事件处理函数，或一个包含多个处理函数的数组

createFnInvoker函数在内部会定义一个invoker函数，并最终返回它，invoker会挂载一个fns属性，用来存放传入的fns，在invoker函数中，会根据fns的类型执行fns数组中的函数，还是fns这个单个处理函数

所以createFnInvoker作为最终的事件处理回调，它的执行其实是fns的执行，fns是数组那就遍历执行数组中的回调，fns是函数，那就直接执行fns

```js
  function invokeWithErrorHandling(handler, context, args, vm, info) {
    let res
    try {
      res = args ? handler.apply(context, args) : handler.call(context)
      if (res && !res._isVue && isPromise(res) && !res._handled) {
        res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
        res._handled = true
      }
    } catch (e) {
      handleError(e, vm, info)
    }
    return res
  }
```
invokeWithErrorHandling函数接收定义好的handler函数，用try-catch语句将handler的执行包裹，捕获执行时发生的错误，用Promise.catch捕获异步任务返回错误

```js
if (isTrue(event.once)) {
  cur = on[name] = createOnceHandler(event.name, cur, event.capture);
}
add(event.name, cur, event.capture, event.passive, event.params)
```

如果当前事件用了once修饰符，则on[name]就指向一个一次性的处理函数，执行一次就删除处理回调。

```js
  var target$1;
  function createOnceHandler (event, handler, capture) {
    var _target = target$1; 
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    } 
  }
  function remove$2(name, handler, capture, _target) {
    (_target || target$1).removeEventListener(name, handler._wrapper || handler, capture);
  }
```

createOnceHandler函数中定义了_target变量，和一个onceHandler函数，onceHandler函数是要返回的

onceHandler函数执行，会执行传入的handler，执行结果赋给res，res如果不为null，则调用remove函数，调用_target的removeEventListener，将该事件的处理函数handler移除

然后 `add(event.name, cur, event.capture, event.passive, event.params)`

```js
function add$1(name, handler, capture, passive) {
  // ....
  target$1.addEventListener(name, handler, supportsPassive ? { capture, passive } : capture)
}
```

将事件name注册到真实DOM对象上，当该对象触发事件name时，回调函数handler就会执行

```js
else if (cur !== old) {
  old.fns = cur;
  on[name] = old;
}
```

如果cur !== old，即对于同一个事件name，它前后的事件对象不一样了，因为使用了invoker和fns，我们不需要调用add去添加一个新的事件回调。old指向了invoker，invoker的fns属性是真正的回调，值为old，现在只需将invoker的fns属性值由old改为cur

再把old赋给on[name]，所以cur和on[name]就指向了invoker

这样的机制，就保证了事件回调invoker只创建一次，之后更新事件回调只用修改invoker身上的fns属性即可，不用再次创建invoker

```js
for (name in oldOn) {
  if (isUndef(on[name])) {//如果存在某个事件在新的on对象中没有，说明这个事件要被移除
    event = normalizeEvent(name) // 整理出标准化的事件名对象
    remove$$1(event.name, oldOn[name], event.capture); // 移除事件处理函数
  }
}
```
updateListeners函数中，还要遍历旧的事件监听器对象，如果存在某个事件name在新的on对象中没有，但在旧的oldOn对象中有，说明这个事件是要被移除的。

调用normalizeEvent函数整理出规范化的事件名对象

remove$$1函数调用，将事件处理函数移除

## 自定义事件

Vue处理原生的DOM事件已经讲完，但组件的自定义事件没有讲，父子组件是利用事件通信的，子组件通过vm.$emit触发父组件的事件，父组件通过v-on:注册了事件，并在事件被触发时，能接受到子组件派发的信息，并执行事件处理回调。

我们知道，普通节点只能使用原生DOM事件，而组件上却可以使用自定义事件和原生DOM事件，并且通过native修饰符区分，我们看看原生DOM事件和自定义事件有什么区别之处

我们在模板编译生成ast树阶段，addHandler函数会对事件的修饰符做不同的处理，当遇到native修饰符时，事件相关的属性方法会添加到nativeEvents属性中

```js
function genData() {
  ···
  if (el.events) {
    data += (genHandlers(el.events, false)) + ",";
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true)) + ",";
  }
}
```
不管是组件还是普通标签，事件处理代码都在genData的过程中，genHandlers用来处理事件对象并拼接字符串。处理组件的原生事件和自定义事件的区别在isNative参数，我们看最终生成的代码为：

```js
with(this){return _c('div',{attrs:{"id":"app"}},[_c('child',{on:{"myevent":myevent},nativeOn:{"click":function($event){return nativeClick($event)}}})],1)}

```
有了渲染函数接下来会根据它创建vnode实例，其中遇到组件占位符节点时会创建子组件vnode

_c

