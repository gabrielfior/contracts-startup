
const curve = require("@curvefi/api");

export class CurveHandler {
    constructor(url, privateKey) {
        this.url = url;
        this.privateKey = privateKey;
    }

    async init() {
        this.curveApi = await curve.default.init('JsonRpc',
            { url: this.url, privateKey: this.privateKey },
            { gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0 });
    }

    async deposit(amount) {
        console.log('deposit amount1', amount);
        await this.init();
        console.log('deposit amount2', amount);
    }
}
