import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";

export function walkthrough09_Output(args: IWalkthroughArgs) {
    let { walkthrough: wt, state } = args;

    if (wt.phase !== Phase.Input_Detail_Output) {
        return;
    }

    setInitialCamera(state, new Vec3(-20.203, 0.000, -1642.819), new Vec3(281.600, -7.900, 2.298));

    let c0 = commentary(wt, null, 0)`

终于来到了模型的末端。最后一个 Transformer 模块的输出先经过
层归一化，然后做一次线性变换（矩阵乘法），这一次不加偏置。

这最后一次变换把每个列向量从长度 C 变成 nvocab。因此，
它实际上为每一列、为词表中的每个词给出一个分数。这些分数有个专门的名字：logits。

"logits" 这个名字来自 "log-odds"，即每个 token 赔率的对数。之所以用 "log"，
是因为紧接着施加的 softmax 会做指数化，把赔率或概率转换回来。

为了把这些分数变成漂亮的概率，我们把它们送进 softmax。现在每一列都有了
模型为词表中每个词分配的概率。

在这个特定的模型里，它其实已经学会了如何排列三个字母的全部答案，
所以概率会大幅偏向正确答案。

当我们让模型一步步往前跑时，我们用最后一列的概率来决定
下一个要加入序列的 token。例如，如果我们已经向模型输入了六个 token，
就会使用第 6 列的输出概率。

这一列的输出是一串概率，我们必须从中挑一个作为序列中的下一个 token。做法是"从分布中采样"：
也就是按概率随机挑一个 token。比如概率为 0.9 的 token，
有 90% 的概率会被选中。

当然还有别的做法，比如总是选概率最高的那个 token。

我们还可以用温度参数来控制分布的"平滑程度"。温度越高，分布越均匀；温度越低，
分布越集中在高概率的 token 上。

具体做法是：在施加 softmax 之前，先把 logits（线性变换的输出）除以温度。
由于 softmax 中的指数运算会放大较大的数，把它们拉得更接近就会削弱这个效应。
`;

}
