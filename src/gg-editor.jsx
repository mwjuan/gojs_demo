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

const GgEditor = () => {
    const dataSource = {
        nodes: [],
        edges: [
            {
                source: '0',
                sourceAnchor: 1,
                target: '1',
                targetAnchor: 0
            },
            {
                source: '1',
                sourceAnchor: 1,
                target: '2',
                targetAnchor: 0
            },
            {
                source: '2',
                sourceAnchor: 1,
                target: '3',
                targetAnchor: 0
            },
            {
                source: '3',
                sourceAnchor: 1,
                target: '4',
                targetAnchor: 0
            }
        ]
    };

    const config = {
        setState(name, value, item) {
            console.log({name,value,item})
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
        getAnchorPoints() {
            return [
                [0.5, 0],
                [0.5, 1],
                [0, 0.5],
                [1, 0.5]
            ];
        }
    };

    const onAfterUpdateItem = (e) => {
        // console.log('e: ', e)
    };

    const onAfterAddItem = (e) => {
        dataSource.nodes = [
            ...dataSource.nodes,
            {
                id: `${dataSource.nodes.length}`,
                x: e.model.x,
                y: e.model.y,
                label: e.model.label,
                type: 'customCircleNode',
                size: 50
            }
        ];
        console.log(dataSource);
    };

    return (
        <GGEditor className="ggedtior">
            <ItemPanel className="itemPanel">
                <Item
                    className="item"
                    model={{
                        type: 'customCircleNode',
                        size: 50,
                        label: 'Start'
                    }}>
                    <img
                        src="https://gw.alicdn.com/tfs/TB1IRuSnRr0gK0jSZFnXXbRRXXa-110-112.png"
                        width="55"
                        height="56"
                        draggable={false}
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
            <Flow
                className="graph"
                data={dataSource}
                onAfterUpdateItem={onAfterUpdateItem}
                onAfterAddItem={onAfterAddItem}
            />
            <RegisterNode name="customRectNode" config={config} extend="rect" />
            <RegisterNode name="customEllipseNode" config={config} extend="ellipse" />
            <RegisterNode name="customDiamondNode" config={config} extend="diamond" />
            <RegisterNode name="customCircleNode" config={config} extend="circle" />
            <EditableLabel />
        </GGEditor>
    );
};

export default GgEditor;
