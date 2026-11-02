import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, DimStyle, IWalkthroughArgs, moveCameraTo, setInitialCamera } from "./WalkthroughTools";
import { lerp, lerpSmoothstep } from "@/src/utils/math";
import { processUpTo, startProcessBefore } from "./Walkthrough00_Intro";

export function walkthrough06_Projection(args: IWalkthroughArgs) {
    let { walkthrough: wt, state, layout, tools: { breakAfter, afterTime, c_blockRef, c_dimRef, cleanup } } = args;

    if (wt.phase !== Phase.Input_Detail_Projection) {
        return;
    }

    setInitialCamera(state, new Vec3(-73.167, 0.000, -270.725), new Vec3(293.606, 2.613, 1.366));
    let block = layout.blocks[0];
    wt.dimHighlightBlocks = [...block.heads.map(h => h.vOutBlock), block.projBias, block.projWeight, block.attnOut];

    let outBlocks = block.heads.map(h => h.vOutBlock);

    commentary(wt, null, 0)`

自注意力之后，我们得到了每个头的输出。这些输出是经过 Q、K 向量影响的、恰当混合后的 V 向量。

要把各个头的 ${c_blockRef('输出向量', outBlocks)} 合并起来，只需把它们上下堆叠。以时刻
${c_dimRef('t = 4', DimStyle.T)} 为例，我们从 3 个长度为 ${c_dimRef('A = 16', DimStyle.A)} 的向量，变成长度为 ${c_dimRef('C = 48', DimStyle.C)} 的 1 个向量。`;

    breakAfter();

    let t_fadeOut = afterTime(null, 1.0, 0.5);
    // let t_zoomToStack = afterTime(null, 1.0);
    let t_stack = afterTime(null, 1.0);

    breakAfter();

    commentary(wt)`

值得一提的是，在 GPT 中，每个头内向量长度（${c_dimRef('A = 16', DimStyle.A)}）等于 ${c_dimRef('C', DimStyle.C)} / num_heads。
这样堆叠回去时，得到的正好是原来的长度 ${c_dimRef('C', DimStyle.C)}。

接下来做投影，得到这一层的输出。这是一次逐列进行的、带偏置的矩阵-向量乘法。`;

    breakAfter();

    let t_process = afterTime(null, 3.0);

    breakAfter();

    commentary(wt)`

现在得到了自注意力层的输出。我们并不直接把它送给下一个阶段，而是把它与输入嵌入按元素相加。
这个用绿色竖直箭头表示的过程，叫作 _残差连接_（residual connection）或 _残差通路_（residual pathway）。
`;

    breakAfter();

    let t_zoomOut = afterTime(null, 1.0, 0.5);
    let t_processResid = afterTime(null, 3.0);

    cleanup(t_zoomOut, [t_fadeOut, t_stack]);

    breakAfter();

    commentary(wt)`

和层归一化一样，残差通路对于让深层神经网络有效学习也很重要。

现在手上有了自注意力的结果，可以把它送进 Transformer 的下一部分：
前馈网络。
`;

    breakAfter();

    if (t_fadeOut.active) {
        for (let head of block.heads) {
            for (let blk of head.cubes) {
                if (blk !== head.vOutBlock) {
                    blk.opacity = lerpSmoothstep(1, 0, t_fadeOut.t);
                }
            }
        }
    }

    if (t_stack.active) {
        let targetZ = block.attnOut.z;
        for (let headIdx = 0; headIdx < block.heads.length; headIdx++) {
            let head = block.heads[headIdx];
            let targetY = head.vOutBlock.y + head.vOutBlock.dy * (headIdx - block.heads.length + 1);
            head.vOutBlock.y = lerp(head.vOutBlock.y, targetY, t_stack.t);
            head.vOutBlock.z = lerp(head.vOutBlock.z, targetZ, t_stack.t);
        }
    }

    let processInfo = startProcessBefore(state, block.attnOut);

    if (t_process.active) {
        processUpTo(state, t_process, block.attnOut, processInfo);
    }

    moveCameraTo(state, t_zoomOut, new Vec3(-8.304, 0.000, -175.482), new Vec3(293.606, 2.623, 2.618));

    if (t_processResid.active) {
        processUpTo(state, t_processResid, block.attnResidual, processInfo);
    }
}
