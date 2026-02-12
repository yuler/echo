# Echo

> Fine-tune your ears

## Background

- 这是一个英语听力练习的网站

- 帮我设计两个页面，纯静态， 使用 tailwindcss 和 stimulus, 适当的抽像到 partials 里面
- 首页: 主要包含不同 episode 的列表，点击查看详情页面，页面切换的时候需要有 page view transition
- 详情页面: 点看详情页面就开始播放 episode 的 audio, 显示 episode 的 english 内容， 悬浮一个按钮可以切换，显示双语。audio 的 controller fixed 到顶部。对应的英文句子会高亮显示，最好逐个 word 高亮
- 以上设计移动端优先, 风格简约，dom 元素结构简单, 线框设计不需要圆角