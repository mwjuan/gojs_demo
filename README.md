# GoJS
GoJS是一款非常方便的开发交互式流程图、组织结构图、设计工具、规划工具、可视化语言的JavaScript图表库。[gojs官方在线预览](https://gojs.net/latest/samples/flowchart.html)
![image](https://user-images.githubusercontent.com/50393260/159124672-3f251d57-e48a-4069-9305-79ceed5696d1.png)

逻辑思路
以下在初始化中执行
- 定义两个画布：Palette和Diagram，palette用来存放定义的node模版，diagram用来操作从左侧拖拽出来的节点。
- 定义node模版：不同类型的模版显示的连线端口不同，start类型只有左右下3个可连接节点，end只有上左右3个可连接节点，comment没有节点供连接，其他则有上下左右4个连接端口。
- 定义连线模版：连线有2种使用场景，一种是普通连线，一种是连线上可输入描述文字。当节点为条件型节点时，连线就需要可输入文字。
- 定义节点连接端口：鼠标移入时显示端口，移出时隐藏端口，且当前输入端口可连接到其他节点的输出端口。
- 过滤浏览器滚动，使画布可拖拽、缩放

缺点：有水印、属于商业产品需付费

# 参考：
[gojs](https://gojs.net/latest/)

[Gojs React Examples](https://codesandbox.io/examples/package/gojs-react)
