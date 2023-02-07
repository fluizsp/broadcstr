import WsService from "./wssService";

class RelayService {
    constructor(addr) {
        this.addr=addr;
        this.wsS=null;
    }
    init(onMessage, onOpen) {
        this.wsS = new WsService(this.addr, onMessage, function () {
            onOpen();
        });
        //console.log(this.wsS);
    }
    getNotes() {
        let reqString=`["REQ","Bdcstr${new Date().getTime()}",{"authors":["46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184b16bd8ce4d"],"kinds":[1],"limit":50} ]`
        this.wsS.req(reqString);
    }
}

export default RelayService;