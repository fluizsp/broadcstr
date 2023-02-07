class WsService {
    constructor(addr, onMessage, onOpen) {
        this.addr = addr;
        this.opened = false;
        this.ws = new WebSocket(addr);
        this.onMessage = onMessage;
        this.ws.onopen = onOpen;
        this.ws.onmessage = onMessage;
    }
    req(params) {
        if (this.ws.readyState === 1) {
            this.ws.send(params);
        } else {
            let that = this;
            setTimeout(() => {
                that.req(params);
            }, 500);
        }
    }
}

export default WsService;