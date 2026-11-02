import React from "react";
import { findSubBlocks, splitGrid } from "../Annotations";
import { drawDataFlow } from "../components/DataFlow";
import { drawDependences } from "../Interaction";
import { clamp } from "@/src/utils/data";
import { lerp } from "@/src/utils/math";
import { Dim, Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { processUpTo, startProcessBefore } from "./Walkthrough00_Intro";
import { commentary, DimStyle, IWalkthroughArgs, moveCameraTo, setInitialCamera } from "./WalkthroughTools";

export function walkthrough03_LayerNorm(args: IWalkthroughArgs) {
    let { walkthrough: wt, layout, state, tools: { afterTime, c_str, c_blockRef, c_dimRef, breakAfter, cleanup } } = args;
    let { C } = layout.shape;

    if (wt.phase !== Phase.Input_Detail_LayerNorm) {
        return;
    }

    let ln = layout.blocks[0].ln1;

    setInitialCamera(state, new Vec3(-6.680, 0.000, -65.256), new Vec3(281.000, 9.000, 2.576));
    wt.dimHighlightBlocks = [layout.residual0, ...ln.cubes];

    commentary(wt, null, 0)`

上一节得到的 ${c_blockRef('_输入嵌入_', state.layout.residual0)} 矩阵，就是第一个 Transformer 模块的输入。

Transformer 模块的第一步，是对这个矩阵做 _层归一化_（layer normalization）。这个操作
会分别对矩阵每一列内的数值做归一化。`;
    breakAfter();

    let t_moveCamera = afterTime(null, 1.0);
    let t_hideExtra = afterTime(null, 1.0, 1.0);
    let t_moveInputEmbed = afterTime(null, 1.0);
    let t_moveCameraClose = afterTime(null, 0.5);

    breakAfter();
    commentary(wt)`
归一化是训练深层神经网络时的重要一步，它有助于提升模型在训练过程中的稳定性。

每一列都可以单独看待，所以我们现在只看第 4 列（${c_dimRef('t = 3', DimStyle.T)}）。`;

    breakAfter();
    let t_focusColumn = afterTime(null, 0.5);

    // mu ascii: \u03bc
    // sigma ascii: \u03c3
    breakAfter();
    commentary(wt)`
目标是让这一列的平均值等于 0、标准差等于 1。为此，我们先求出这两个量（${c_blockRef('均值 (\u03bc)', ln.lnAgg1)} 与 ${c_blockRef('标准差 (\u03c3)', ln.lnAgg2)}），然后减去平均值、再除以标准差。`;

    breakAfter();

    let t_calcMuAgg = afterTime(null, 0.5);
    let t_calcVarAgg = afterTime(null, 0.5);

    // 1e-5 as 1x10^-5, but with superscript: 1x10<sup>-5</sup>

    breakAfter();
    commentary(wt)`
这里我们用 E[x] 表示均值，Var[x] 表示方差（针对长度为 ${c_dimRef('C', DimStyle.C)} 的这一列）。
方差就是标准差的平方。那个 epsilon 项（ε = ${<>1&times;10<sup>-5</sup></>}）是为了防止除以零。

由于这些值要应用到整列每个元素上，我们把它计算出来并存进聚合层。

最后，得到归一化后的值之后，我们把列中每个元素乘以一个学习得到的
${c_blockRef('权重 (\u03b3)', ln.lnSigma)}，再加上一个 ${c_blockRef('偏置 (β)', ln.lnMu)}，得到 ${c_blockRef('归一化后的值', ln.lnResid)}。`;

    breakAfter();

    let t_clean_aggs = afterTime(null, 0.2);
    cleanup(t_clean_aggs, [t_calcMuAgg, t_calcVarAgg]);
    let t_colSequence = afterTime(null, 2.0);

    breakAfter();
    commentary(wt)`
我们对 ${c_blockRef('输入嵌入矩阵', layout.residual0)} 的每一列都做这个归一化操作，结果是
${c_blockRef('归一化后的输入嵌入', ln.lnResid)}，它已经准备好送进自注意力层了。
`;

    breakAfter();
    let t_cleanupSplits = afterTime(null, 0.5);
    cleanup(t_cleanupSplits, [t_focusColumn]);
    if (t_cleanupSplits.t > 0) {
        t_colSequence.t = 0;
    }
    let t_runAggFull = afterTime(null, 2.0);
    let t_runNormFull = afterTime(null, 6.0);

    moveCameraTo(state, t_moveCamera, new Vec3(21.2, 0, -102.9), new Vec3(281.5, 11, 1.7));

    let exampleIdx = 3;
    let ln1 = layout.blocks[0].ln1;
    let inputBlock = layout.residual0;

    inputBlock.highlight = lerp(0, 0.3, t_hideExtra.t);

    let relevantBlocks = new Set([
        layout.residual0,
        ...ln1.cubes,
    ]);

    for (let blk of layout.cubes) {
            if (!relevantBlocks.has(blk)) {
            blk.opacity = lerp(1.0, 0.0, t_hideExtra.t);
        }
    }

    for (let blk of relevantBlocks) {
        if (blk != layout.residual0 && blk.t !== 'w') {
            blk.access!.disable = true;
        }
    }

    let startResidualY = layout.residual0.y;
    let endResidulY = ln1.lnResid.y;
    layout.residual0.y = lerp(startResidualY, endResidulY, t_moveInputEmbed.t);

    if (t_moveInputEmbed.t >= 0.0) {
        inputBlock.highlight = lerp(0.3, 0.0, t_moveInputEmbed.t);
    }

    moveCameraTo(state, t_moveCameraClose, new Vec3(-14.1, 0, -187.1), new Vec3(270, 4, 0.7));

    let splitAmt = lerp(0.0, 2.0, t_focusColumn.t);
    let splitPos = exampleIdx + 0.5;

    let otherColOpacity = lerp(1.0, 0.3, t_focusColumn.t);
    ln1.lnAgg1.opacity = otherColOpacity;
    ln1.lnAgg2.opacity = otherColOpacity;
    ln1.lnResid.opacity = otherColOpacity;
    inputBlock.opacity = otherColOpacity;

    if (t_focusColumn.t > 0) {
        let aggMuCol = splitGrid(layout, ln1.lnAgg1, Dim.X, splitPos, splitAmt)!;
        let aggVarCol = splitGrid(layout, ln1.lnAgg2, Dim.X, splitPos, splitAmt)!;
        let residCol = splitGrid(layout, ln1.lnResid, Dim.X, splitPos, splitAmt)!;
        let inputCol = splitGrid(layout, inputBlock, Dim.X, splitPos, splitAmt)!;
        aggMuCol.opacity = 1.0;
        aggVarCol.opacity = 1.0;
        residCol.opacity = 1.0;
        inputCol.opacity = 1.0;

        let aggDestIdx = new Vec3(exampleIdx, 0, 0);
        if (t_calcMuAgg.t > 0.0) {
            let pinIdx = new Vec3(0, 10, 0);
            drawDependences(state, ln1.lnAgg1, aggDestIdx);
            drawDataFlow(state, ln1.lnAgg1, aggDestIdx, pinIdx);
            aggMuCol.access!.disable = false;
            inputCol.highlight = 0.3;
        }

        if (t_calcVarAgg.t > 0.0) {
            let pinIdx = new Vec3(9, 9, 0);
            drawDependences(state, ln1.lnAgg2, aggDestIdx);
            drawDataFlow(state, ln1.lnAgg2, aggDestIdx, pinIdx);
            aggVarCol.access!.disable = false;
        }

        if (t_colSequence.t > 0.0) {
            aggMuCol.access!.disable = false;
            aggVarCol.access!.disable = false;

            let pinIdx = new Vec3(-10, 0, 0);

            let cPos = t_colSequence.t * C;
            let cIdx = clamp(Math.floor(cPos), 0, C - 1);
            let destIdx = new Vec3(exampleIdx, cIdx, 0);
            drawDependences(state, ln1.lnResid, destIdx);
            drawDataFlow(state, ln1.lnResid, destIdx, pinIdx);

            let targetCell = splitGrid(layout, residCol, Dim.Y, cIdx + 0.5, 0.0)!;
            targetCell.highlight = 0.3;

            findSubBlocks(residCol, Dim.Y, 0, cIdx).forEach((blk) => {
                blk.access!.disable = false;
            });
        }
    }

    if (t_runAggFull.t > 0.0) {
        try {
            let processInfo = startProcessBefore(state, ln1.lnAgg1);
            processUpTo(state, t_runAggFull, ln1.lnAgg2, processInfo);
            processUpTo(state, t_runNormFull, ln1.lnResid, processInfo);
        } catch (e) {
            console.log(e);
        }
    }
}
