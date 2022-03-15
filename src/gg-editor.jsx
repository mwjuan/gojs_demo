import React from 'react';
import GGEditor, {
    Flow,
    RegisterNode,
    setAnchorPointsState,
    Item,
    ItemPanel,
    EditableLabel
} from 'gg-editor';
import './styles.css';

const GgEditor = (props) => {
    /** 
     * 流程图数据
     * node 是节点
     * id为唯一标识，label为节点显示内容，x、y为节点坐标，size为节点大小，type为节点类型，和RegisterNode name对应
     * 
     * edge 是连接节点的连线
     * id为唯一标识，label为线中显示的内容，source为连线起点node id，target为连线终点node id
     * 
     * */
    const dataSource = {
        nodes: [
            // {
            //     id: '0',
            //     label: 'Node',
            //     x: 55,
            //     y: 55,
            //     size: 50,
            //     type: 'customCircleNode'
            // },
            // {
            //     id: '1',
            //     label: 'Node',
            //     x: 55,
            //     y: 255,
            // },
        ],
        edges: [
            // {
            //     label: 'Label',
            //     source: '0',
            //     target: '1',
            // },
        ]
    };

    /**
     * RegisterNode配置
     * 
     * */
    const config = {
        setState(name, value, item) {
            // 设置连接点(锚点)的状态样式
            setAnchorPointsState.call(
                this,
                name,
                value,
                item,
                (_item, anchorPoint) => {
                    const { width, height } = _item.getKeyShape().getBBox();
                    const [x, y] = anchorPoint;
                    return {
                        x: width * x - width / 2,
                        y: height * y - height / 2
                    };
                },
                (_item, anchorPoint) => {
                    const { width, height } = _item.getKeyShape().getBBox();
                    const [x, y] = anchorPoint;
                    return {
                        x: width * x - width / 2,
                        y: height * y - height / 2
                    };
                }
            );
        },
        getAnchorPoints() {  // 节点可选的连接点集合，该点有4个可选的连接点
            return [
                [0.5, 0], // 上边中点
                [0.5, 1], // 下边中点
                [0, 0.5], // 左边中点
                [1, 0.5], // 右边中点
            ];
        },
    };

    const onAfterAddItem = (e) => {
        console.log(e.model)
    }

    const onAfterConnect = (e) => {
        console.log(e)
    }

    return (
        <GGEditor className="ggedtior">
            <ItemPanel className="itemPanel">
                {/* 模块节点 */}
                <Item
                    className="item"
                    model={{
                        type: 'customCircleNode', // 与RegisterNode中的name对应
                        size: 50,
                        label: 'Start' // 拖拽到FLow中时显示的初始内容
                    }}>
                    {/* Item显示为一张图片 */}
                    <img
                        src="https://gw.alicdn.com/tfs/TB1IRuSnRr0gK0jSZFnXXbRRXXa-110-112.png"
                        width="55"
                        height="56"
                        draggable={false}  // 设置为false时，拖拽只显示虚线框，为true时，显示为图片
                        alt=""
                    />
                </Item>
                <Item
                    className="item"
                    model={{
                        type: 'customRectNode',
                        label: 'Step'
                    }}>
                    <img
                        src="https://gw.alicdn.com/tfs/TB1reKOnUT1gK0jSZFrXXcNCXXa-178-76.png"
                        width="89"
                        height="38"
                        draggable={false}
                        alt=""
                    />
                </Item>
                <Item
                    className="item"
                    model={{
                        type: 'customEllipseNode',
                        label: '???'
                    }}>
                    <img
                        src="https://gw.alicdn.com/tfs/TB1AvmVnUH1gK0jSZSyXXXtlpXa-216-126.png"
                        width="108"
                        height="63"
                        draggable={false}
                        alt=""
                    />
                </Item>
                <Item
                    className="item"
                    model={{
                        type: 'customDiamondNode',
                        label: 'diamond'
                    }}>
                    <img
                        src="https://gw.alicdn.com/tfs/TB1EB9VnNz1gK0jSZSgXXavwpXa-178-184.png"
                        width="89"
                        height="92"
                        draggable={false}
                        alt=""
                    />
                </Item>
                <Item
                    className="item"
                    model={{
                        type: 'customCircleNode',
                        size: 50,
                        label: 'End'
                    }}>
                    <img
                        src="https://gw.alicdn.com/tfs/TB1IRuSnRr0gK0jSZFnXXbRRXXa-110-112.png"
                        width="55"
                        height="56"
                        draggable={false}
                        alt=""
                    />
                </Item>
            </ItemPanel>
            {/* 流程图组件，data为数据源 */}
            <Flow className='graph' data={dataSource} onAfterAddItem={onAfterAddItem} onAfterConnect={onAfterConnect}/>
            {/* 流程图节点，config为配置项，extend为节点形状 */}
            <RegisterNode name="customRectNode" config={config} extend="rect" />
            <RegisterNode name="customEllipseNode" config={config} extend="ellipse" />
            <RegisterNode name="customDiamondNode" config={config} extend="diamond" />
            <RegisterNode name="customCircleNode" config={config} extend="circle" />
            {/* 节点编辑标签 */}
            <EditableLabel />
        </GGEditor>
    );
};

export default GgEditor;
