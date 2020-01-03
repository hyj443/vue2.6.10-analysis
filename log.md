完整版：同时包含编译器和运行时的版本
编译器：将template编译成 render function
runtime: 运行时，用来创建Vue实例，渲染并处理虚拟dom等代码，基本上就是除却编译器的其他一切

UMD版本：
    可以通过script标签直接用在浏览器中，从 https://cdn.jsdelivr.net/npm/vue 引入的文件就是runtime+compiler的UMD版本 (vue.js)
CommonJS版本，用来配合老的打包工具，只包含runtime的CommonJS版本(vue.runtime.common.js)

ES Module版本
    给 现代化打包工具提供esm，提供的默认文件是只有runtime的 ES Module构建 (vue.runtime.esm.js)

runtime+compiler 对比 runtime-only
如果需要在客户端编译模版（比如给template选项传字符串，或挂载到一个元素上并以其dom内部的html作为模版），就需要加上compiler

当使用 vue-loader 时，*.vue文件内部的模版会在构建时预编译为js，所以在最终打包好的包里是不用编译器的，只用runtime版本即可

因为runtime版本比完整版小3成，尽可能用它


观察者模式
也叫发布订阅模式


牛肉切块，别切太小，容易炖烂
水烧开，牛肉焯水，一分钟就好，去除血水
水倒掉，加油，加入拍碎的姜和蒜，还有葱，牛肉下锅翻炒，再加入料酒，酱油，五香粉
翻炒5分钟，均匀上色后加入热水（可以提前烧开，凉水也没关系，据说影响一点口感）
热水没过牛肉，大火烧20min，小火炖30min，尝尝味道，咸度够不够，不够就加点蚝油（或酱油）
加入土豆胡萝卜洋葱西红柿（自行选择），再加一点料酒（看看油够不够，不够可以加点油），小火焖至水收的差不多，这个过程大概30min
焖的过程可以把葱夹出，它煮久了会变酸


1 没有新旧vnode
    直接返回
2 有旧vnode 没有新vnode
    销毁旧vnode 再返回
3 有新vnode
    3.1 有新vnode 没有旧vnode
        调用createElm 根据新的vnode创建新的DOM节点
    3.2 有新vnode 有旧vnode
        3.2.1 旧vnode挂在真实DOM元素，且可复用
            调用patchVnode比较新旧vnode 更新DOM
        3.2.2 旧vnode挂在真实DOM元素，但不能复用
            旧vnode没有利用价值，生成空vnode节点覆盖旧vnode
    
我们看看这段代码都做了哪些事情：

复用 vnode（如果存在 elem 属性）
处理异步组件
处理静态节点
执行 prepatch（如果存在 data 属性）
执行 update（如果存在 data 属性）
比较 oldVnode 和 vnode 两个节点
执行 postpatch（如果存在 data 属性）


将子组件首次渲染创建 DOM Tree 过程中收集的insertedVnodeQueue（保存在子组件占位 VNode 的vnode.data.pendingInsert里）添加到父组件的insertedVnodeQueue
获取到组件实例的 DOM 根元素节点，赋给vnode.elm
判断组件是否是可patch的


```js
let a = 'global scope'
function fn() {
  let a = 'local scope'
  return () => a
}
let foo = fn()
console.log(foo()); // local scope
```

进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈
全局执行上下文初始化
执行fn，创建fn函数执行上下文，fn执行上下文被压入执行上下文栈
fn执行上下文初始化，创建变量对象，作用域链，this等
fn执行完毕，fn执行上下文从执行上下文栈中弹出
执行foo函数，创建foo函数的执行上下文，foo执行上下文被压入执行上下文栈
foo执行上下文初始化，创建变量对象 作用域链 this等
foo函数执行完毕，foo函数上下文从执行上下文栈中弹出

当执行foo函数时，fn函数的上下文已经被销毁了，即从执行上下文栈中被弹出了，为什么还能读取到fn函数作用域中的a的值

foo执行上下文维护了一个作用域链：
fooContext={
  Scope:[AO, fnContext.AO, globalContext.VO]
}
就是因为这个作用域链，foo函数依然可以读取到fnContext.AO的值
说明foo函数引用了fnContext.AO中的值时，即使fnContext被销毁了，但是js仍然会让fnContext.AO活在内存中，foo函数依然可以通过foo函数的作用域链找到它


当浏览器接收到一个Html文件时，JS引擎和浏览器的渲染引擎便开始工作了。从渲染引擎的角度，它首先会将html文件解析成一个DOM树，与此同时，浏览器将识别并加载CSS样式，并和DOM树一起合并为一个渲染树。有了渲染树后，渲染引擎将计算所有元素的位置信息，最后通过绘制，在屏幕上打印最终的内容。JS引擎和渲染引擎虽然是两个独立的线程，但是JS引擎却可以触发渲染引擎工作，当我们通过脚本去修改元素位置或外观时，JS引擎会利用DOM相关的API方法去操作DOM对象,此时渲染引擎变开始工作，渲染引擎会触发回流或者重绘。下面是回流重绘的两个概念：

回流： 当我们对DOM的修改引发了元素尺寸的变化时，浏览器需要重新计算元素的大小和位置，最后将重新计算的结果绘制出来，这个过程称为回流。
重绘： 当我们对DOM的修改只单纯改变元素的颜色时，浏览器此时并不需要重新计算元素的大小和位置，而只要重新绘制新样式。这个过程称为重绘。
很显然回流比重绘更加耗费性能。

通过了解浏览器基本的渲染机制，我们很容易联想到当不断的通过JS修改DOM时，不经意间会触发到渲染引擎的回流或者重绘，这个性能开销是非常巨大的。因此为了降低开销，我们需要做的是尽可能减少DOM操作。有什么方法可以做到呢？



initMixin
  _init
    _isComponent
    initInternalComponent

    mergeOptions
    resolveConstructorOptions
    initLifecycle



```javascript
// 更新节点
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  // vnode与oldVnode是否完全一样？若是，退出程序
  if (oldVnode === vnode) {
    return
  }
  const elm = vnode.elm = oldVnode.elm

  // vnode与oldVnode是否都是静态节点？若是，退出程序
  if (isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    return
  }

  const oldCh = oldVnode.children
  const ch = vnode.children
  // vnode有text属性？若没有：
  if (isUndef(vnode.text)) {
    // vnode的子节点与oldVnode的子节点是否都存在？
    if (isDef(oldCh) && isDef(ch)) {
      // 若都存在，判断子节点是否相同，不同则更新子节点
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    }
    // 若只有vnode的子节点存在
    else if (isDef(ch)) {
      /**
       * 判断oldVnode是否有文本？
       * 若没有，则把vnode的子节点添加到真实DOM中
       * 若有，则清空Dom中的文本，再把vnode的子节点添加到真实DOM中
       */
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    }
    // 若只有oldnode的子节点存在
    else if (isDef(oldCh)) {
      // 清空DOM中的子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    }
    // 若vnode和oldnode都没有子节点，但是oldnode中有文本
    else if (isDef(oldVnode.text)) {
      // 清空oldnode文本
      nodeOps.setTextContent(elm, '')
    }
    // 上面两个判断一句话概括就是，如果vnode中既没有text，也没有子节点，那么对应的oldnode中有什么就清空什么
  }
  // 若有，vnode的text属性与oldVnode的text属性是否相同？
  else if (oldVnode.text !== vnode.text) {
    // 若相同：用vnode的text替换真实DOM的文本
    nodeOps.setTextContent(elm, vnode.text)
  }
}
```


