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

// var argRE = /:(.*)$/
// let a = 'v-model:dddd.feg'.match(argRE)[1]
// a ='model:dddd.feg'.slice(0, -(a.length + 1))
// console.log(a)

// 我们知道了模板上的事件标记在构建AST树上是怎么处理，还有如何根据构建的AST树返回正确的渲染函数，但是真正事件绑定离不开绑定注册事件。这个阶段发生在组件挂载的阶段。有了渲染函数就可以生成实例挂载需要的Vnode树，并且会进行patchVnode的环节进行真实节点的构建。有了Vnode，接下来会遍历子节点递归调用createElm为每个子节点创建真实的DOM，由于Vnode中有data属性，在创建真实DOM时会进行注册相关钩子的过程，其中一个就是注册事件相关处理。


// 如果ref属性在指令v-for内，就需要创建一个组件实例或DOM节点的引用数组，而非单一引用，这需要refInFor来区分


// valid为假，警告开发者所传的prop值的类型不符合预期。打印expectedTypes数组中的类型字符串告诉开发者该prop所期望的类型。同时通过toRawType 函数获取真正的 prop 值的类型并提示


// 在 processRawAttrs 函数内部首先定义了 l 常量，，接着使用一个 if 语句判断 l 是否为真，如果，此时会执行 if 语句块内的代码，在 if 语句块内首先定义了 attrs 常量，它与 el.attrs 属性有着相同的引用，初始值是长度为 l 的数组。接着使用 for 循环，并：


function parse(template, options) { // 主要通过调用parseHTML来辅助ast的构建
  warn$2 = options.warn || baseWarn; // 打印警告信息
  platformIsPreTag = options.isPreTag || no; //通过给定的标签名判断标签是否是pre标签
  platformMustUseProp = options.mustUseProp || no //检测一个属性在标签中是否要使用元素对象原生的prop进行绑定
  platformGetTagNamespace = options.getTagNamespace || no //获取元素的命名空间
  var isReservedTag = options.isReservedTag || no;
  maybeComponent = el => !!el.component || !isReservedTag(el.tag)
  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
  delimiters = options.delimiters;
  var stack = [] // 当解析到一个开始标签或文本，stack的栈顶元素永远是当前被解析的节点的父节点，通过stack就可以把当前节点push到父节点的children中，也可以把当前节点的parent属性设置为父节点
  var preserveWhitespace = options.preserveWhitespace !== false;
  var whitespaceOption = options.whitespace;
  var root; //root就是ast树，parse的执行是为了充实root对象
  var currentParent; //每遇到一个2元标签时，都会将该标签的描述对象作为currentParent的值，这样当解析这个2元标签的子元素时，子元素的父元素就是currentParent
  var inVPre = false; //当前解析的标签是否在v-pre标签之内
  var inPre = false; //当前解析的标签是否在 <pre></pre>之内
  var warned = false;
  function warnOnce(msg, range) {
    if (!warned) { //warned的初始值为false，if进去就变为true
      warned = true;
      warn$2(msg, range) // 只会打印一次警告信息
    }
  }
  //当遇到二元标签的结束标签或一元标签时调用，“闭合”标签
  function closeElement(element) { // 传入的是1元标签所对应的el对象，或2元标签对应el对象
    trimEndingWhitespace(element) // 你要闭合一个标签，那么它的末尾子节点有可能是空文本节点，要把它从元素描述对象的children数组中弹出
    if (!inVPre && !element.processed) {//你要闭合的标签不处于v-pre之中，且没被解析过
      element = processElement(element, options) //处理元素描述对象上的一些属性
    }
    if (!stack.length && element !== root) { //我们知道每遇到一个2元标签的开始标签就会将它的描述对象推入stack中，每遇到一个结束标签时都会将它的描述对象从stack中弹出。如果只有一个根元素，正常解析完一段html代码后，stack应该为空，或者说，当stack被清空则说明整个模板字符串已经解析完。现在当前解析的元素是root元素，则stack一定为空，如果当前解析的不是根元素，且stack为空，则说明模板中有不止一个根元素，只是现在解析的没有被当做root。
      // 事实上，满足一定条件是可以定义几个根元素的，但root始终指向第一个根元素的描述对象，如果不满足条件，则会报警说不能定义多个根元素
      if (root.if && (element.elseif || element.else)) {//root第一个定义的根元素用了v-if，当前元素用了v-else-if/v-else，这样所有的根元素都是由v-if/v-else-if/v-else等控制，间接保证了被渲染的根元素只有一个
        checkRootConstraints(element); //检查当前元素是否符合作为根元素的要求
        addIfCondition(root, {
          exp: element.elseif,
          block: element
        });//具有v-else-if/v-else属性的元素的描述对象会被添加到具有v-if属性的元素描述对象的ifConnditions数组中。后面你会发现有v-if的元素也会将自身的元素描述对象添加到自己的ifConditions数组中
      } else { //如果条件不满足，会给出友好提示
        warnOnce("组件模版必须包含一个根节点。你可以定义多个根元素，但必须保证最终只渲染其中一个", { start: element.start })
      }
    }
    if (currentParent && !element.forbidden) {
      // 当前要闭合的元素存在父级，并且当前元素不是被禁止的元素
      if (element.elseif || element.else) { //如果当前元素用了v-else-if/v-else，检查上一个元素有没有使用v-if。当前元素是不会成为父级的子节点的，而是会被添加到相应的用了v-if的元素描述对象的ifConditions中
        processIfConditions(element, currentParent)
      } else { //如果当前元素没有使用v-else-if/v-else，会被推入父级的children数组中
        if (element.slotScope) { //如果用了slot-scope特性
          var name = element.slotTarget || '"default"';//将当前元素描述对象添加到父级元素的scopedSlots对象下
          (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }
        currentParent.children.push(element);//把当前的元素描述对象推入父级描述对象的children数组中
        element.parent = currentParent;//同时将当前元素描述对象的parent属性指向父级元素对象，这样就建立了元素描述对象间的父子关系
      }
    }

    element.children = element.children.filter((c) => !(c).slotScope)
    trimEndingWhitespace(element);
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {// 判断当前元素是否是<pre>。实际上inPre与inVPre的作用相同，inPre标识当前解析环境是否在 <pre>内，因为<pre>内的解析行为与其他 =html标签不同。体现在：<pre>会对其包含的html字符实体进行解码。<pre>会保留html字符串编写时的空白
      inPre = false;
    }
    for (var i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }
  function trimEndingWhitespace(el) {
    if (!inPre) { // 如果解析的元素不是出于pre标签中
      var lastNode;
      while ( // 取出el.children数组的最后一项，即末尾子节点存在
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 && // 末尾子节点的类型是文本元素
        lastNode.text === ' ' // 末尾子节点是一个空格的字符串
      ) { // while循环把末尾的可能存在的所有空格去掉
        el.children.pop(); // 把代表空格的末尾文本节点从children数组中弹出
      }
    }
  }

  // 检查当前元素是否符合根元素的要求。我们知道编写模板时有两个约束：1模板有且仅有一个被渲染的根元素，2是不能使用slot标签和template标签作为模板的根元素，不能是slot和template标签作为根元素，因为slot作为插槽，它的内容是外界决定的，插槽的内容可能渲染多个节点，template元素的内容虽然不是外界决定的，但它本身作为抽象组件不会渲染任何内容到页面，它有可能包含多个子节点，这些限制都是基于必须有且只有一个根元素
  function checkRootConstraints(el) {
    if (el.tag === 'slot' || el.tag === 'template')
      warnOnce(`不能使用slot节点或template标签作为模版的根节点`)
    if (el.attrsMap.hasOwnProperty('v-for'))
      warnOnce('根节点不能使用v-for指令，因为v-for指令会渲染多个节点')
  }
  // parseHTML的调用接收几个重要的钩子函数，主要是start end这两个钩子，对模版字符串做词法解析，parse在此基础上做句法分析，生成一颗AST
  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    // 解析html字符串时每次遇到开始标签就调用它，完成ast构建并建立父子级关系
    start(tag, attrs, unary, start$1, end) {
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);
      if (isIE && ns === 'svg') {// handle IE svg bug
        attrs = guardIESVGBug(attrs);
      }
      let element = createASTElement(tag, attrs, currentParent) // 创建元素节点的描述对象
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
        warn$2(`模版只负责将状态映射到视图。避免在模板中使用带有副作用的标签，例如<style>和没有指定type属性或type属性值为text/javascript的<script>，它们不会被解析`);
      }
      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }
      if (!inVPre) { // 当前解析的元素不处于v-pre环境中，调用processPre检查它自己是否使用v-pre，这决定了它和它的子元素是否处于v-pre环境
        processPre(element); // 如果该元素用了v-pre，给描述它的el对象添加pre属性
        if (element.pre) {// 如果当前元素用了v-pre，则将inVPre变真，意味着后续的所有解析工作都处于v-pre指令下，编译器就会跳过拥有v-pre的元素和它子元素，不对它们进行编译
          inVPre = true
        }
      }
      if (platformIsPreTag(element.tag)) inPre = true;

      if (inVPre) { // 如果当前元素的解析处于v-pre环境中
        processRawAttrs(element);//调用processRawAttrs对元素描述对象进行加工
      } else if (!element.processed) {//当前元素的解析没有处于v-pre环境，且没有被解析过
        processFor(element); // 解析使用了v-for的开始标签
        processIf(element);// 解析使用了v-if/v-else-if/v-else指令的开始标签
        //总结1、如果标签用了v-if，则该标签的元素描述对象会有if属性，值为v-if的属性值
        //2、如果标签使用了v-else，则该标签的元素描述对象会有else属性，值为 true
        //3、如果标签使用了v-else-if，则该标签的元素描述对象有elseif属性，值为v-else-if的属性值
        //4、如果标签使用了v-if，则该标签的元素描述对象的ifConditions数组中包含“自己”
        //5、如果标签使用了v-else/v-else-if，则该标签的元素描述对象会被添加到对应的有v-if的元素描述对象的ifConditions数组中。
        processOnce(element); //处理使用了v-once指令的标签
        // v-for v-if/v-else-if/v-else v-once被认为是结构化指令。它们经过processFor、processIf、processOnce处理后，会把这些指令从元素描述对象的attrsList数组中移除，因为它们的属性值并不承载内容信息。
      }
      if (!root) { //root未定义，说明还没开始填充ast树，说明当前解析的是根元素
        root = element; // 直接把当前的元素描述对象赋给root
        checkRootConstraints(root); //检查根元素是否符合要求
      }
      if (!unary) {//如果是2元标签，则将当前el推入栈stack，并将当前解析元素的父元素指向stack的栈顶元素
        currentParent = element
        stack.push(element);
      } else { // 如果是1元标签，调用closeElement钩子函数闭合该元素
        closeElement(element); //不往stack推是因为1元标签不能成为父节点
      }
    },
    end(tag, start, end$1) { // 解析html字符串时每当遇到一个2元标签的结束标签时，调用钩子函数end，将currentParent回退为之前的值，这样就修正了当前元素的父级元素，不会把兄弟元素当父级元素了
      var element = stack[stack.length - 1] // 获取栈顶元素
      stack.length -= 1; // 栈弹出一个元素描述对象
      currentParent = stack[stack.length - 1]; // currentParent指向栈顶
      if (options.outputSourceRange) {
        element.end = end$1;
      }
      closeElement(element) // 调用closeElement结束
    },
    // 解析html字符串时每次遇到纯文本时就会调用chars函数
    chars(text, start, end) {
      if (!currentParent) { //不存在currentParent，即当前解析的是文本是没有父元素包裹的，直接像根元素那样存在，是要报错的，并且return
        if (text === template) { // 如果处理的html字符串正好就是这段纯文本，即<template>{{name}}fefe</template>这样，会报错
          warnOnce('组件模板需要一个根元素，而不仅仅是文本', { start })
        } else if ((text = text.trim())) { // 将处理的纯文本去掉空格后仍存在文本，会提示：
          warnOnce("处于根元素之外的文本\"" + text + "\"会被忽略的", { start })
        }
        return
      }
      if (isIE && // ie浏览器有个bug，如果当前解析的文本的父级是textarea标签，并且textarea标签的placeholder的值为当前text，则无需记录这段文本text
        currentParent.tag === 'textarea' && currentParent.attrsMap.placeholder === text) return
      var children = currentParent.children; // 获取当前文本的父级的children
      if (inPre || text.trim()) { //如果处于pre标签的环境中，或text trim后还有值
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text)//父级是script或style标签的话，不对text中的字符实体(比如'&#x26;')进行解码
      } else if (!children.length) { // 如果父级的没有子元素，让text为空字符串
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
      if (text) { //经过了上面的处理，如果text还存在
        if (!inPre && whitespaceOption === 'condense') {
          text = text.replace(whitespaceRE$1, ' ');
        }
        var res;
        var child;
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          //如果当前解析不处在v-pre之中，且text不为一个空格的字符串，调用parseText对text文本做解析，然后把解析的结果赋给res，解析成功，创建一个对象child
          child = {
            type: 2, // type为2 代表它是这是文本对象
            expression: res.expression,
            tokens: res.tokens,
            text // text属性存放文本text
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = { type: 3, text };
        }
        if (child) {
          if (options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          children.push(child);
        }
      }
    },
    // 解析html字符串每次遇到注释节点会调用该函数
    comment(text, start, end) {
      if (currentParent) {
        var child = { type: 3, text, isComment: true };
        if (options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    }
  });
  return root
}