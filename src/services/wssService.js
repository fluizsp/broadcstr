class WsService {
    constructor(addr, onMessage, onOpen) {
        this.addr = addr;
        this.opened = false;
        this.ws = new WebSocket(addr);
        this.onMessage = onMessage;
        this.openReq = null;
        this.ws.onopen = onOpen;
        this.ws.onmessage = onMessage;
    }
    req(params) {
        this.ws.send(params);
    }
}

export default WsService;