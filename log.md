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
