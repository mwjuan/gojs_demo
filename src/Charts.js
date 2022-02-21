import React, { Component } from "react";
import * as go from "gojs";
import { produce } from "immer";
import "./StructureView.css";
import { ReactDiagram, ReactPalette } from "gojs-react";
export default class StructureView extends Component {
  constructor(props) {
    super(props);
    this.diagramRef = React.createRef();
    this.handleDiagramChange = this.handleDiagramChange.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
  }
  componentDidMount() {
    if (!this.diagramRef.current) return;
  }

  componentWillUnmount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.removeDiagramListener(
        "ChangedSelection",
        this.props.onDiagramChange
      );
      diagram.removeDiagramListener(
        "ExternalObjectsDropped",
        this.props.onDiagramChange
      );
    }
  }

  initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      "undoManager.isEnabled": true, // enable undo & redo
      // "clickCreatingTool.archetypeNodeData": {
      //   text: "new node",
      //   color: "lightblue"
      // },
      model: $(go.GraphLinksModel, {
        linkKeyProperty: "key", // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        // positive keys for nodes
        makeUniqueKeyFunction: (m, data) => {
          let k = data.key || 1;
          while (m.findNodeDataForKey(k)) k++;
          data.key = k;
          return k;
        },
        // negative keys for links
        makeUniqueLinkKeyFunction: (m, data) => {
          let k = data.key || -1;
          while (m.findLinkDataForKey(k)) k--;
          data.key = k;
          return k;
        }
      })
    });

    // define a simple Node template
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      { locationSpot: go.Spot.Center },
      new go.Binding("location", "location", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      $(
        go.Shape,
        "Circle",
        {
          fill: "white",
          stroke: "gray",
          strokeWidth: 2,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: true,
          toLinkableDuplicates: true,
          fromLinkableSelfNode: true,
          toLinkableSelfNode: true
        },
        new go.Binding("stroke", "color"),
        new go.Binding("figure")
      ),
      $(
        go.TextBlock,
        {
          margin: new go.Margin(5, 5, 3, 5),
          font: "10pt sans-serif",
          minSize: new go.Size(16, 16),
          maxSize: new go.Size(120, NaN),
          textAlign: "center",
          editable: true
        },
        new go.Binding("text").makeTwoWay()
      )
    );
    function highlightGroup(e, grp, show) {
      if (!grp) return;
      e.handled = true;
      if (show) {
        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
        // instead depend on the DraggingTool.draggedParts or .copiedParts
        var tool = grp.diagram.toolManager.draggingTool;
        var map = tool.draggedParts || tool.copiedParts; // this is a Map
        // now we can check to see if the Group will accept membership of the dragged Parts
        if (grp.canAddMembers(map.toKeySet())) {
          grp.isHighlighted = true;
          return;
        }
      }
      grp.isHighlighted = false;
    }
    function makeLayout(horiz) {
      // a Binding conversion function
      if (horiz) {
        return $(go.GridLayout, {
          wrappingWidth: Infinity,
          alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1),
          spacing: new go.Size(4, 4)
        });
      } else {
        return $(go.GridLayout, {
          wrappingColumn: 1,
          alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1),
          spacing: new go.Size(4, 4)
        });
      }
    }
    function defaultColor(horiz) {
      // a Binding conversion function
      return horiz ? "#FFDD33" : "#33D3E5";
    }

    function defaultFont(horiz) {
      // a Binding conversion function
      return horiz ? "bold 18px sans-serif" : "bold 16px sans-serif";
    }
    function finishDrop(e, grp) {
      var ok =
        grp !== null
          ? grp.addMembers(grp.diagram.selection, true)
          : e.diagram.commandHandler.addTopLevelParts(
            e.diagram.selection,
            true
          );
      if (!ok) e.diagram.currentTool.doCancel();
    }
    diagram.groupTemplate = $(
      go.Group,
      "Auto",
      {
        background: "transparent",
        ungroupable: true,
        // highlight when dragging into the Group
        mouseDragEnter: function (e, grp, prev) {
          highlightGroup(e, grp, true);
        },
        mouseDragLeave: function (e, grp, next) {
          highlightGroup(e, grp, false);
        },
        computesBoundsAfterDrag: true,
        // when the selection is dropped into a Group, add the selected Parts into that Group;
        // if it fails, cancel the tool, rolling back any changes
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
        // Groups containing Groups lay out their members horizontally
        layout: makeLayout(false)
      },
      new go.Binding("layout", "horiz", makeLayout),
      new go.Binding("background", "isHighlighted", function (h) {
        return h ? "rgba(255,0,0,0.2)" : "transparent";
      }).ofObject(),
      $(
        go.Shape,
        "Rectangle",
        { fill: null, stroke: defaultColor(false), strokeWidth: 2 },
        new go.Binding("stroke", "horiz", defaultColor),
        new go.Binding("stroke", "color")
      ),
      $(
        go.Panel,
        "Vertical", // title above Placeholder
        $(
          go.Panel,
          "Horizontal", // button next to TextBlock
          {
            stretch: go.GraphObject.Horizontal,
            background: defaultColor(false)
          },
          new go.Binding("background", "horiz", defaultColor),
          new go.Binding("background", "color"),
          $("SubGraphExpanderButton", { alignment: go.Spot.Right, margin: 5 }),
          $(
            go.TextBlock,
            {
              alignment: go.Spot.Left,
              editable: true,
              margin: 5,
              font: defaultFont(false),
              opacity: 0.75, // allow some color to show through
              stroke: "#404040"
            },
            new go.Binding("font", "horiz", defaultFont),
            new go.Binding("text", "text").makeTwoWay()
          )
        ), // end Horizontal Panel
        $(go.Placeholder, { padding: 5, alignment: go.Spot.TopLeft })
      ) // end Vertical Panel
    );
    // relinking depends on modelData
    diagram.linkTemplate = $(
      go.Link,
      new go.Binding("relinkableFrom", "canRelink").ofModel(),
      new go.Binding("relinkableTo", "canRelink").ofModel(),
      new go.Binding("points", "pts").makeTwoWay(),
      $(go.Shape),
      $(go.Shape, { toArrow: "Standard" })
    );

    return diagram;
  }

  initPalette() {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette, {
      contentAlignment: go.Spot.Center,
      layout: $(go.GridLayout, {
        wrappingColumn: 1,
        cellSize: new go.Size(2, 2)
      })
    });
    palette.nodeTemplate = $(
      go.Node,
      "Auto",
      { locationSpot: go.Spot.Center },
      new go.Binding("location", "location", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      $(
        go.Shape,
        "Circle",
        {
          fill: "white",
          stroke: "gray",
          strokeWidth: 2,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: true,
          toLinkableDuplicates: true,
          fromLinkableSelfNode: true,
          toLinkableSelfNode: true
        },
        new go.Binding("stroke", "color"),
        new go.Binding("figure")
      ),
      $(
        go.TextBlock,
        {
          margin: new go.Margin(5, 5, 3, 5),
          font: "10pt sans-serif",
          minSize: new go.Size(16, 16),
          maxSize: new go.Size(120, NaN),
          textAlign: "center",
          editable: true
        },
        new go.Binding("text").makeTwoWay()
      )
    );
    return palette;
  }

  handleDiagramChange(e) {
    const name = e.name;
    switch (name) {
      case "ChangedSelection": {
        const sel = e.subject.first();
        this.setState(
          produce((draft) => {
            if (sel) {
              if (sel instanceof go.Node) {
                const idx = this.mapNodeKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const nd = draft.nodeDataArray[idx];
                  draft.selectedData = nd;
                }
              } else if (sel instanceof go.Link) {
                const idx = this.mapLinkKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const ld = draft.linkDataArray[idx];
                  draft.selectedData = ld;
                }
              }
            } else {
              draft.selectedData = null;
            }
          })
        );
        break;
      }
      case "ExternalObjectsDropped": {
        const drop = e.subject.first();
        alert(`Dropped key: ${drop.data.key}, text: ${drop.data.text}`);
        break;
      }
      default:
        break;
    }
  }

  handleModelChange(obj) {
    if (obj === null) return;
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map();
    const modifiedLinkMap = new Map();
    this.setState(
      produce((draft) => {
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
            }
          });
        }
        if (removedNodeKeys) {
          narr = narr.filter((nd) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }

        let larr = draft.linkDataArray;
        if (modifiedLinkData) {
          modifiedLinkData.forEach((ld) => {
            modifiedLinkMap.set(ld.key, ld);
            const idx = this.mapLinkKeyIdx.get(ld.key);
            if (idx !== undefined && idx >= 0) {
              larr[idx] = ld;
              if (draft.selectedData && draft.selectedData.key === ld.key) {
                draft.selectedData = ld;
              }
            }
          });
        }
        if (insertedLinkKeys) {
          insertedLinkKeys.forEach((key) => {
            const ld = modifiedLinkMap.get(key);
            const idx = this.mapLinkKeyIdx.get(key);
            if (ld && idx === undefined) {
              this.mapLinkKeyIdx.set(ld.key, larr.length);
              larr.push(ld);
            }
          });
        }
        if (removedLinkKeys) {
          larr = larr.filter((ld) => {
            if (removedLinkKeys.includes(ld.key)) {
              return false;
            }
            return true;
          });
          draft.linkDataArray = larr;
          this.refreshLinkIndex(larr);
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true; // the GoJS model already knows about these updates
      })
    );
  }

  render() {
    return (
      <div className="gojs-wrapper-div">
        <ReactPalette
          initPalette={this.initPalette}
          divClassName="palette-component"
          nodeDataArray={[
            { text: "Circle", color: "blue", loc: '175 0', figure: "Circle", fill: '#91d5ff' },
            { text: "Square", color: "purple", loc: '175 100', figure: "Square", fill: '#91d5ff' },
            { text: "Ellipse", color: "orange", figure: "Ellipse", fill: '#91d5ff' },
            { text: "Rectangle", color: "red", figure: "Rectangle", fill: '#91d5ff' },
            {
              text: "Rounded\nRectangle",
              color: "green",
              figure: "RoundedRectangle", fill: '#91d5ff'
            },
            { text: "Triangle", color: "purple", figure: "Triangle", fill: '#91d5ff' },
            {
              text: "Group 1",
              key: "GRP_1",
              isGroup: true,
              fill: '#91d5ff'
            }
          ]}
        />
        <ReactDiagram
          ref={this.diagramRef}
          divClassName="diagram-component"
          initDiagram={this.initDiagram}
          nodeDataArray={this.props.nodeDataArray}
          linkDataArray={this.props.linkDataArray}
          modelData={this.props.modelData}
          onModelChange={this.props.onModelChange}
          skipsDiagramUpdate={this.props.skipsDiagramUpdate}
        />
      </div>
    );
  }
}
