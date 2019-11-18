// var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
// console.log('fefe.fe'.match(modifierRE))

// 在模版编译阶段，可以获得某个标签的所有属性，其中包括v-on/@注册的事件，我们会将整个模版编译成渲染函数，渲染函数就是一些嵌套在一起的创建元素节点的函数，当渲染函数执行会生成一份vnode，随后虚拟dom会使用vnode进行对比和渲染，在这个过程中会创建一些元素，会判断当前的标签是真的标签还是组件，如果是组件标签，会将子组件实例化并给它传递一些参数，其中就包括v-on注册的事件，如果是真标签，创建元素并插入到dom，并将使用v-on注册的事件注册到浏览器事件中。

// 解析到组件标签时，会实例化子组件，同时将注册的事件解析成一个对象并通过参数传给子组件，所以当子组件实例化，可以在参数中获取父组件向自己注册的事件，它保存在vm.$options._parentListeners

// updateComponentListeners使用$on将事件都注册到this._events

// console.log(Proxy.toString().match(/native code/))
// console.log( /native code/.test(Proxy.toString()))


/**queueWatcher(this)
 * 我们来思考一下，Vue的异步更新的意义。
 * 假设一种情况：模版中使用name这个属性，意味着name的dep会收集渲染函数的watcher作为依赖，我们修改name的值，会触发响应，即渲染函数会重新求值，完成重新渲染。如果，从属性值变化到完成重新渲染这个过程，是同步的，会导致什么问题？你可能同时修改很多属性的值，每次变化都要重新渲染，会导致严重的性能问题
 * 异步更新的意义，每次修改属性的值不会立即重新求值，而是将需要执行更新操作的watcher放入一个队列中，当所有同步代码执行完后，再一次性的执行队列中的 所有watcher的更新方法，清空队列
 * 我们知道，当修改一个属性的值，会触发它的get方法，从而执行它收集的所有watcher的update方法进行更新，
 */


// 则该元素描述对象的 el.if 的值为字符串 'a && b'。在设置完 el.if 属性之后，紧接着调用了 addIfCondition 函数，可以看到第一个参数就是当前元素描述对象本身，所以如果一个元素使用了 v-if 指令，那么它会把自身作为一个 条件对象 添加到自身元素描述对象的 ifConditions 数组中，补充一下这里所说的 条件对象 指的是形如 addIfCondition 函数第二个参数的对象结构：
// input标签的所有属性，包括指令相关的，都是以data属性的形式作为参数整体传入_c，即createElement函数
// 为什么说v-model是语法糖，是因为，从得到的渲染函数字符串可以看出，它最后以两部分形式存在于input元素中，一个是将value值以 props的形式存在于domProps中，另一个是以事件的形式存储 input事件，并保留在on属性中
// 在patchVnode函数执行之前，有一个生成vnode的过程，这个过程中，所有指令、属性会以data属性的形式传入构造函数VNode中，所以最后VNode实例的data会有directives、domProps和on属性

// 比如一个标签：<input type="text" v-model="value"> 它会生成下面这样的渲染函数字符串
` _c('input', 
        directives: [{name: 'model', rawName: 'v-model', value: (message), expression: '(message)' }],
        attrs: { "type": "text"},
        domProps: { "value": (message),},
        on: {"input": function ($event) {
          if($event.target.composing)return;
          (message)=$event.target.value
        }}  
      )      
      `

// console.log('start')
// async function async1(params) {
//   await async2()  //执行async2，此时会保留async1的上下文，跳出async1函数
//   console.log('async1 end')
// }
// async function async2(params) {
//   console.log('async2 end')
// }
// async1()

// setTimeout(() => {
//   console.log('setTimeout')
// }, 0);

// new Promise((resolve, reject) => {
//   console.log('Promise')
//   resolve()
// }).then(() => {
//   console.log('promise1')
// }).then(() => {
//   console.log('promise2')
// })
// console.log('end')

// 我们在模板中定义v-on事件，v-bind动态属性，v-text动态指令等，和v-on事件指令一样，它们都会在编译阶段和Vnode生成阶段创建data属性，因此invokeCreateHooks就是一个模板指令处理的任务，他分别针对不同的指令为真实阶段创建不同的任务。针对事件，这里会调用updateDOMListeners对真实的DOM节点注册事件任务。


/* <base-input v-on:focus.native="onFocus"></base-input>
在有的时候这是很有用的，不过在你尝试监听一个类似 <input> 的非常特定的元素时，这并不是个好主意。比如上述 <base-input> 组件可能做了如下重构，所以根元素实际上是一个 <label> 元素：

<label>
  {{ label }}
  <input
    v-bind="$attrs"
    v-bind:value="value"
    v-on:input="$emit('input', $event.target.value)"
  >
</label>
这时，父级的 .native 监听器将静默失败。它不会产生任何报错，但是 onFocus 处理函数不会如你预期地被调用。

为了解决这个问题，Vue 提供了一个 $listeners 属性，它是一个对象，里面包含了作用在这个组件上的所有监听器。例如： */

var argRE = /:(.*)$/
let a = 'v-model:dddd.feg'.match(argRE)[1]
a ='model:dddd.feg'.slice(0, -(a.length + 1))
console.log(a)
 
// 我们知道了模板上的事件标记在构建AST树上是怎么处理，还有如何根据构建的AST树返回正确的渲染函数，但是真正事件绑定离不开绑定注册事件。这个阶段发生在组件挂载的阶段。有了渲染函数就可以生成实例挂载需要的Vnode树，并且会进行patchVnode的环节进行真实节点的构建。有了Vnode，接下来会遍历子节点递归调用createElm为每个子节点创建真实的DOM，由于Vnode中有data属性，在创建真实DOM时会进行注册相关钩子的过程，其中一个就是注册事件相关处理。