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