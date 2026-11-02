import React from 'react';
import { LayerView } from '@/src/llm/LayerView';
import { InfoButton } from '@/src/llm/WelcomePopup';

export const metadata = {
  title: '大语言模型可视化',
  description: '一个带漫游讲解的大语言模型 3D 交互动画可视化。',
};

import { Header } from '@/src/homepage/Header';

export default function Page() {
    return <>
        <Header title="大语言模型可视化">
            <InfoButton />
        </Header>
        <LayerView />
        <div id="portal-container"></div>
    </>;
}
