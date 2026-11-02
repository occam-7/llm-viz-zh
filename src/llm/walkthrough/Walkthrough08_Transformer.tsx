import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";

export function walkthrough08_Transformer(args: IWalkthroughArgs) {
    let { walkthrough: wt, state } = args;

    if (wt.phase !== Phase.Input_Detail_Transformer) {
        return;
    }

    setInitialCamera(state, new Vec3(-135.531, 0.000, -353.905), new Vec3(291.100, 13.600, 5.706));

    let c0 = commentary(wt, null, 0)`

这就是一个完整的 Transformer 模块！

它们构成了任何 GPT 模型的主体，并被重复若干次，前一个模块的输出接进下一个模块，残差通路一路延续。

和深度学习中常见的情况一样，很难说清每一层到底在做什么，但我们有一些大致的认识：
靠前的层倾向于学习较低层次的特征和模式，靠后的层则学习识别和理解
更高层次的抽象与关系。就自然语言处理而言，
较底层的层可能在学语法、句法和简单的词语联想，而较高的层
可能捕捉更复杂的语义关系、篇章结构以及依赖上下文的意义。

`;

}
