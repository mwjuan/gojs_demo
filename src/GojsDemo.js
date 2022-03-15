import React from 'react';
import './assets/css/main.css'; //引入破解版样式
import go from './assets/js/go.js'; //引入破解版资源文件

var myDiagram = null;

function init() {
    var $ = go.GraphObject.make;  // 定义gojs在全局的符号
    /**
     * 定义流程图画布的基本属性，myDiagramDiv为画布的id
     * 
     */
    myDiagram = $(go.Diagram, "myDiagramDiv",
        {
            initialContentAlignment: go.Spot.Center,//画布的位置设置（居中，靠左等）
            allowDrop: true,  // 必须为true才能接受从左侧拖拽出来的流程图模块
            "LinkDrawn": showLinkLabel, // 生成连线
            "LinkRelinked": showLinkLabel,
            "animationManager.duration": 800, //画布刷新的加载速度
            "undoManager.isEnabled": true,  // enable undo & redo
            allowZoom: true,    //允许缩放
            isReadOnly: false, //是否禁用编辑
            //ismodelfied:true //禁止拖拽
        });

   /**
    * 以下4种nodeTemplateMap定义常规的node节点
    * 第一个参数为节点类型，以下分为4种类型，每种类型可连线端口不同
    */ 
    var lightText = 'whitesmoke';

    myDiagram.nodeTemplateMap.add("",  
        $(go.Node, "Spot", nodeStyle(),
            // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
            $(go.Panel, "Auto",
                $(go.Shape, "Rectangle", //节点形状和背景颜色的设置
                    { fill: "#00A9C9", stroke: null },
                    new go.Binding("figure", "figure")), 
                $(go.TextBlock,
                    {
                        font: "bold 11pt Helvetica, Arial, sans-serif",
                        stroke: lightText,//边框颜色 
                        margin: 8,
                        maxSize: new go.Size(160, NaN),//最大大小,超过就会自动换行
                        wrap: go.TextBlock.WrapFit, //自动换行
                        editable: true //可编辑
                    },
                    new go.Binding("text").makeTwoWay())
            ),
            // 四个节点端口，每侧一个，供后续连线
            makePort("T", go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, false)
        ));

    myDiagram.nodeTemplateMap.add("Start",
        $(go.Node, "Spot", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Circle",
                    { minSize: new go.Size(40, 40), fill: "#79C900", stroke: null }),
                $(go.TextBlock, "Start",
                    { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: lightText },
                    new go.Binding("text"))
            ),
            // three named ports, one on each side except the top, all output only:
            makePort("L", go.Spot.Left, true, false),
            makePort("R", go.Spot.Right, true, false),
            makePort("B", go.Spot.Bottom, true, false)
        ));

    myDiagram.nodeTemplateMap.add("End",
        $(go.Node, "Spot", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Circle",
                    { minSize: new go.Size(40, 40), fill: "#DC3C00", stroke: null }),
                $(go.TextBlock, "End",
                    { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: lightText },
                    new go.Binding("text"))
            ),
            // three named ports, one on each side except the bottom, all input only:
            makePort("T", go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, false, true),
            makePort("R", go.Spot.Right, false, true)
        ));

    myDiagram.nodeTemplateMap.add("Comment",
        $(go.Node, "Auto", nodeStyle(),
            $(go.Shape, "File",
                { fill: "#EFFAB4", stroke: null }),
            $(go.TextBlock,
                {
                    margin: 5,
                    maxSize: new go.Size(200, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    editable: true,
                    font: "Arial",
                    stroke: '#454545'
                },
                new go.Binding("text").makeTwoWay())
            // no ports, because no links are allowed to connect with a comment
        ));


    // 定义连线模版，如果节点是条件节点，则连线中会出现label标签
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5, toShortLength: 4,
                relinkableFrom: true,
                relinkableTo: true,
                reshapable: true,
                resegmentable: true,
                // 鼠标悬停显示链接
                mouseEnter: function (e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
                mouseLeave: function (e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
            },
            new go.Binding("points").makeTwoWay(),
            $(go.Shape,  // 高光形状，通常是透明的
                { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
            $(go.Shape,  // 链接路径形状
                { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
            $(go.Shape,  // 箭头
                { toArrow: "standard", stroke: null, fill: "gray" }),
            $(go.Panel, "Auto",  // 链接标签，通常不可见
                { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
                new go.Binding("visible", "visible").makeTwoWay(),
                $(go.Shape, "RoundedRectangle",  // 标签形状
                    { fill: "#F8F8F8", stroke: null }),
                $(go.TextBlock, "Yes",  // 默认标签内容及样式
                    {
                        textAlign: "center",
                        font: "10pt helvetica, arial, sans-serif",
                        stroke: "#333333",
                        editable: true
                    },
                    new go.Binding("text").makeTwoWay())
            )
        );

   /**
    * 
    * 如果节点标签来自“conditional”节点，则使连线可见。
    * 此侦听器由“LinkDrawed”和“LinkRelinked”图事件调用
    * */ 
    function showLinkLabel(e) {
        var label = e.subject.findObject("LABEL");
        if (label !== null) label.visible = (e.subject.fromNode.data.figure === "Diamond");
    }

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
    // myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    // myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    //load();  // 从JSON文本中加载初始图表 加载原有流程

    // 初始化页面左侧的面板
    var myPalette =
        $(go.Palette, "myPaletteDiv",  // 引用DIV HTML元素
            {
                "animationManager.duration": 800, // 800毫秒动画
                nodeTemplateMap: myDiagram.nodeTemplateMap,  //共享myDiagram使用的模板
                model: new go.GraphLinksModel([  // 指定面板的内容，有5种节点
                    { category: "Start", text: "Start" },
                    { text: "Step" },
                    { text: "main", figure: "Diamond" },
                    { category: "End", text: "End" },
                    { category: "Comment", text: "Comment" }
                ])
            });

    // 覆盖GoJS focus以阻止浏览器滚动
    function customFocus() {
        var x = window.scrollX || window.pageXOffset;
        var y = window.scrollY || window.pageYOffset;
        go.Diagram.prototype.doFocus.call(this);
        window.scrollTo(x, y);
    }

    /**
     * 
     * 节点模板的帮助器定义
     * 使各个节点垂直对齐
     */
    function nodeStyle() {
        return [
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            {
                locationSpot: go.Spot.Center,
                // 鼠标移入移出事件，显示/隐藏节点连线端口
                mouseEnter: function (e, obj) { showPorts(obj.part, true); },
                mouseLeave: function (e, obj) { showPorts(obj.part, false); }
            }
        ];
    }

    /**
     * 定义节点连线端口的输入输出，显示可连接的圆形端口
     * @param {*} name 节点名称
     * @param {*} spot 连接位置
     * @param {*} output 输出端口
     * @param {*} input 输入端口
     * @returns 
     */
    
    function makePort(name, spot, output, input) {
        return $(go.Shape, "Circle",
            {
                fill: "transparent",
                stroke: null,  // this is changed to "white" in the showPorts function
                desiredSize: new go.Size(8, 8), 
                alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                portId: name,  // declare this object to be a "port"
                fromSpot: spot, toSpot: spot,  // 声明链接在此端口的连接位置
                fromLinkable: output, toLinkable: input,  // 声明用户是否可以在此处绘制链接
                cursor: "pointer"  // 显示不同的光标以指示潜在的链接点
            });
    }

    myDiagram.doFocus = customFocus;
    myPalette.doFocus = customFocus;
} // end init

// 根据条件判断是否显示节点的连线端口
function showPorts(node, show) {
    var diagram = node.diagram;
    if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
    node.ports.each(function (port) {
        port.stroke = (show ? "white" : null);
    });
}

/*
 * 以JSON格式显示图表的模型，供用户编辑
 */
function load() {
    myDiagram.model = go.Model.fromJson({
        "class": "go.GraphLinksModel",
        "linkFromPortIdProperty": "fromPort",
        "linkToPortIdProperty": "toPort",
        "nodeDataArray": [
        ],
        "linkDataArray": [
        ]
    });
}

function GojsDemo(props) {
    return (
        <div>
            <div id="sample">
                <div style={{ width: '100%', whiteSpace: 'nowrap' }}>
                    {/* 左侧模块区域 */}
                    <span style={{ display: 'inline-block', verticalAlign: 'top', width: '100px' }}>
                        <div id="myPaletteDiv" style={{ border: 'solid 1px black', height: '560px' }}></div>
                    </span>

                    {/* 右侧流程图编辑区域 */}
                    <span style={{ display: 'inline-block', verticalAlign: 'top', width: '80%' }}>
                        <div id="myDiagramDiv" style={{ border: 'solid 1px black', height: '560px' }}></div>
                    </span>
                </div>
            </div>
        </div>
    )
}

let hoc = WrappedComponent => {
    return class EnhancedComponent extends React.Component {
        componentDidMount() {
            init();
        }

        render() {
            return <WrappedComponent />
        }
    }
}

export default hoc(GojsDemo);