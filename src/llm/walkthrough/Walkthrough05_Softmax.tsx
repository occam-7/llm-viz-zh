import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";

export function walkthrough05_Softmax(args: IWalkthroughArgs) {
    let { walkthrough: wt, state } = args;

    if (wt.phase !== Phase.Input_Detail_Softmax) {
        return;
    }

    setInitialCamera(state, new Vec3(-24.350, 0.000, -1702.195), new Vec3(283.100, 0.600, 1.556));

    let c0 = commentary(wt, null, 0)`

softmax 操作在自注意力中会用到（上一节已经见过），在模型的最末端也会再次出现。

它的目标是：取一个向量，把其中的值归一化，使它们之和为 1.0。不过这并不只是除以总和那么简单。
实际上先把每个输入值取指数。

  a = exp(x_1)

这样做会让所有值都变成正数。得到指数化之后的向量后，再把每个值除以所有值之和，
就能保证总和为 1.0。由于所有指数化的值都是正的，得到的值必然介于 0.0 和 1.0 之间，
这就在原始数值上给出了一个概率分布。

softmax 就这么简单：先取指数，再除以总和。

不过还有个小问题。如果某个输入值相当大，那么指数化之后会非常大，我们就会用一个大数除以一个极大的数，
这会给浮点运算带来精度问题。

softmax 有一个很有用的性质：给所有输入值都加上同一个常数，结果不变。所以我们可以找出输入向量中的最大值，
把它从所有值中减去。这样最大值就变成 0.0，softmax 在数值上也就稳定了。

我们来看自注意力层里实际的 softmax。每一次 softmax 的输入向量，
是自注意力矩阵的一行（但只取到对角线为止）。

和层归一化一样，这里也有一个中间步骤：把一些聚合值存起来，让整个流程更高效。

对每一行，我们存下该行的最大值，以及平移并指数化之后的值的总和。
然后要生成对应的输出行，只需做几个小操作：减去最大值、取指数、除以总和。

"softmax" 这个名字是怎么来的？这个操作的"硬"版本叫 argmax，它直接找出最大值，把该位置设为 1.0，其余全部赋 0.0。
相比之下，softmax 是这个操作的"软"版本。由于 softmax 里取指数的缘故，最大值会被强调并推向 1.0，
同时仍然在所有输入值上保持一个概率分布。这样得到的表示更细腻，
不仅捕捉了最可能的选项，也捕捉了其他选项的相对可能性。
`;

}
