import React from 'react';
import { Phase } from "./Walkthrough";
import { commentary, embed, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";
import s from './Walkthrough.module.scss';
import { Vec3 } from '@/src/utils/vector';

let minGptLink = 'https://github.com/karpathy/minGPT';
let pytorchLink = 'https://pytorch.org/';
let andrejLink = 'https://karpathy.ai/';
let zeroToHeroLink = 'https://karpathy.ai/zero-to-hero.html';

export function walkthrough01_Prelim(args: IWalkthroughArgs) {
    let { state, walkthrough: wt } = args;

    if (wt.phase !== Phase.Intro_Prelim) {
        return;
    }

    setInitialCamera(state, new Vec3(184.744, 0.000, -636.820), new Vec3(296.000, 16.000, 13.500));

    let c0 = commentary(wt, null, 0)`
在深入算法细节之前，我们先退后一步做个铺垫。

本指南关注的是 _推理_（inference），而不是训练，因此它只是整个机器学习流程中的一小部分。
在这个例子里，模型的权重是预先训练好的，我们用推理过程来生成输出。所有这些计算都直接在你的浏览器里运行。

这里展示的模型属于 GPT（生成式预训练 Transformer）家族，可以把它描述为"基于上下文的 token 预测器"。
OpenAI 在 2018 年提出了这个家族，其中的知名成员包括 GPT-2、GPT-3 和 GPT-3.5 Turbo，最后一个正是广为使用 ChatGPT 的基础。
它也可能与 GPT-4 有关，但具体细节仍然未知。

本指南的灵感来自 ${embedLink('minGPT', minGptLink)} 这个 GitHub 项目——一个用 ${embedLink('PyTorch', pytorchLink)} 写成的最小 GPT 实现，作者是 ${embedLink('Andrej Karpathy', andrejLink)}。
他的 YouTube 系列 ${embedLink("Neural Networks: Zero to Hero", zeroToHeroLink)} 和 minGPT 项目在编写本指南的过程中提供了不可估量的帮助。这里的玩具模型就源自 minGPT 项目中的那个模型。

好了，我们开始吧！
`;

}

export function embedLink(a: React.ReactNode, href: string) {
    return embedInline(<a className={s.externalLink} href={href} target="_blank" rel="noopener noreferrer">{a}</a>);
}

export function embedInline(a: React.ReactNode) {
    return { insertInline: a };
}


// Another similar model is BERT (bidirectional encoder representations from transformers), a "context-aware text encoder" commonly
// used for tasks like document classification and search.  Newer models like Facebook's LLaMA (large language model architecture), continue to use
// a similar transformer architecture, albeit with some minor differences.
