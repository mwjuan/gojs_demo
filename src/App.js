import StructureView from "./Charts";
import React from 'react';
import GgEditor from './gg-editor';
import './styles.css';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const EnterPage = () => {
  return (
    <div>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="gojs" key="1">
        <StructureView />
        </TabPane>
        <TabPane tab="GGEditor" key="2">
          <GgEditor />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default EnterPage;

