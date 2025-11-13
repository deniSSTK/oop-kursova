import IMenuLoop from "../interfaces/MenuLoopInterface";

abstract class BaseMenuLoop implements IMenuLoop {
    abstract text: string;

    start(): void {
        console.log(this.text);
        this.options()
    }

    options(): void {}
}

export default BaseMenuLoop;