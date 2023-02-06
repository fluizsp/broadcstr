import WsService from "./wssService";

class RelayService {    
    constructor(){
        this.wssList=[];
    }
    init(addr, onMessage, onOpen) {
        this.wssList[0]=new WsService(addr, onMessage, onOpen);
    }
    req(addr) {
        console.log(addr);
        this.wssList[0].req('["REQ", "my-sub", {"kinds":[1]}]');
    }
}

export default RelayService;