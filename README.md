你好呀旅行者~ 欢迎使用 InfoCard！

你之所以看到这个卡片，是因为我们第一次相见。

请阅读此卡片，它会引导你如何使用 InfoCard


## InfoCard是什么

每次打开此应用（![Web页面](https://card.gine.me/) 或 ![Chrome 扩展](https://chrome.google.com/webstore/detail/infocard/joelaehdgkmbjapdnpcfindkdkjplaka/)）时，InfoCard 会从 github 的开源图书中随机获取一个章节展示。

你可以用零碎的时间阅读，这并不会花费你很多的时间，但是你可以从中学到很多。


## 设置图书源

打开右下角的设置按钮，可以设置图书源

每次打开页面时，InfoCard 会从你勾选的图书源中随机选中一本，然后从选中的书中随机挑选一个章节展示。


## 更新图书源

更新图书源时，InfoCard会从本仓库的 `src/source.json` 中获取最新的数据。然后与已有数据对比，合并更新。
你的偏好（勾选的图书信息）设置，不会丢失。


## 提交图书源

默认的信息源，来自此项目仓库中维护的开源图书。

你可以向此仓库提交PR，与他人分享你想看的开源图书。


## 图书源配置说明

你可以参考下面的说明，提交新的图书源。
例
```javascript
{
    "eastlakeside/interpy-zh/master": {
        "name": "python进阶",
        "chapterPath": [
            ".",
            "__DIR__"
        ],
        "tags": [
            "python"
        ],
        "type": "md"
    },
}  
```
说明
```javascript
{
    "<username>/<repo>/<branch>": {
        "name": "图书名称",
        "chapterPath": [
            ".", //图书章节的父级目录
            "__DIR__" // 如果图书存在章目录保留这个标记，具体解释参考下方关于章节的说明
        ],
        "tags": [
            "python" // 展示在卡片上方的tag，帮助阅读者快速了解此图书的概要
        ],
        "type": "md" // 开源图书采用何种文件格式组织，目前对md支持良好，rst的解析存在一定的问题。
    },
}  
```

### 关于章节的说明

一般开源图书的组织格式

```
book
    第一章
        第一节.md
        第二节.md
    第二章
        第一节.md
        第二节.md
```
对应的 `chapterPath`

```
["book","__DIR__"]
```

不存在二级目录的组织格式，例如
```
book
    第一节.md
    第二节.md
    第三节.md
    第四节.md
```
对应的 `chapterPath`

```
["book"]
```
