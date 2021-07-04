# Install

先安装好 [Deno](https://github.com/denoland/deno)

安装依赖：

    npm install

运行测试：

    deno test demo


Deno 是新一代基于 TypeScript 语言的编程平台，是 Node 平台之外的又一选择，它们都是由 Ryan Dahl 发起的项目，鉴于 Node 的一些不足，他决定放弃 Node.js，从头写一个替代品：

Deno - A secure runtime for JavaScript and TypeScript.

Deno 是一个简单又现代化而且安全的 JavaScript/TypeScript 运行时，基于 V8 引擎和 Rust（Tokio 异步编程框架），Deno 本身也是 Rust 的一个模块。

- 初始即安全，除非明确准许，初始以沙盒状态运行（无文件、网络、环境变量访问权限）；
- 自身支持 TypeScript；
- 运行时本体以单一二进制文件形式发布；
- 拥有大量的自带工具，例如依赖检查（deno info）和代码格式化工具（deno fmt）；
- 拥有较为完备的官方标准库，确保能适配对应 Deno 版本运行；
- Deno 最初由 Node.js 原作者 Ryan Dahl 于 2018 年 5 月在 JSConf.EU 首次提出。

由于 TS 无法为 Deno runtime 生成高性能的代码，目前部分内部实现从 ts 变更为 js。

但 Deno 并没有放弃 TypeScript，Deno 依然是一个安全的 TS/JS runtime，目前 Deno 彻底用 Rust 替代 C++/C，各语言比例大概是：

- TypeScript：64.7%
- Rust：31.9%
- JavaScript：1.4%

Deno VS Node

|                    |                   Node                   |         Deno        |
|--------------------|------------------------------------------|---------------------|
| API 引用方式       | 模块导入                                 | 全局对象            |
| 模块系统           | CommonJS & 实验性 ES Module              | 全面 ES Module      |
| 安全               | 无安全限制                               | 默认安全            |
| TypeScript         | 通过第三方模块支持 ts-node               | 原生支持            |
| 包管理             | npm + node_modules                       | 原生支持            |
| 异步操作           | 回调                                     | Promise             |
| 包分发             | 中心化 npmjs.com                         | 去中心化 import url |
| 入口               | package.json 配置 import url             | 直接引入            |
| 打包、测试、格式化   | 第三方如 eslint、gulp、webpack、babel 等    | 原生支持            |


![抖音小姐姐下载](https://upload-images.jianshu.io/upload_images/5509701-ec667b8acf47a1c1.jpg)

下载速度简直不要太快：

![wifi flow](https://upload-images.jianshu.io/upload_images/5509701-0b44ed486f6e6b39.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![浏览阿婆主页](https://upload-images.jianshu.io/upload_images/5509701-c765337fefd33d03.png)

需要安装 Deno，再运行示范程序：

Usage:

    deno run -A douyin.ts
    deno run -A douyin.ts https://v.douyin.com/eh1PpKh/ https://v.douyin.com/eh1Hs4L/

代码仓库为 Deno 演示，包含 demo/douyin.ts：https://github.com/jimboyeah/deno-demo

抖音分享链接包含多种用途，可以分享用户主页、视频、订单、商品、音乐、直播等，如果是视频，可以通过链接获取到相应的 aweme_id 并查询其详细信息：

- https://www.iesdouyin.com/share/video/6715818142016212237/
- https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=6715818142016212237

此工具需要在抖音主界面上获取视频博主的分享链接，通过链接获取到视频列表后进行批量下载：

http://v.douyin.com/ehSh5Cy
https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg
https://www.iesdouyin.com/web/api/v2/aweme/licke/?sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg
https://www.iesdouyin.com/web/api/v2/aweme/post/?sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg&count=21&max_cursor=0&aid=1128&_signature=VHoupQAANAiyH7H6JvRmvVR6Lr&dytk=

URL 签名 signature 随时间变化动态生成，可以在页面使用调式工具设置 fetch breakpoints，再根据调用栈定位到 init 方法：

    function init(config) {
      dytk = config.dytk;
      params.user_id = config.uid;
      params.sec_uid = _utils2.default.getUrlParam(window.location.href, "sec_uid");

      if (params.sec_uid != "") {
        delete params.user_id;
      }

      config.sec_uid = params.sec_uid;
      nonce = config.uid;
      signature = (0, _bytedAcrawler.sign)(nonce);
      // ...
    }

根据打包机嵌入的信息找到 bytedAcrawler 的实现，其导出模块位置 vendor.a59687bc.js:1096。

所谓模块，就是一个独立命名空间的闭包，在需要使用时就请求加载它。将模块提取出来，用它对 uid 进行处理就可以得到签名。

模块提供的是混淆过的代码，参考 JavaScript Obfuscator Tool  https://obfuscator.io

由于 bytedAcrawler 提供的签名算法借用了浏览器对象 navigator 来保证算法运行环境为浏览器，否则尝试读取 userAgent 会导致运行出错，实现了运行环境安全。

通过逆向，即像脚本引擎一样破解算法内部，只需给代码打一个补订即可解决，不过时间也是花了大半天：

    .replace(/return r$/,"this.navigator = {userAgent:''};return r")


