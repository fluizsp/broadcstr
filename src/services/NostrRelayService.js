class NostrRelayService {
    constructor(url, read = true, write = true, options = { subTimeout: 3000, subLife: 30000 }) {
        this.url = url;
        this.options = options;
        this.ws = null;
        this.read = read;
        this.write = write;
        this.listeners = [];
        this.eventListeners = [];
        this.eoseListeners = [];
        this.eoseTimeouts = [];
        this.subscriptionQueue = [];
        this.activeSubscriptions = [];
        this.sendInterval = null;
        this.timeoutInterval = null;
        this.errorCount = 0;
    }
    getStatus() {
        if (!this.ws)
            return -1;
        return this.ws.readyState;
    }
    getNewSubId() {
        return 'REQ_' + Math.random().toString().slice(2);
    }
    addListener(type, callback) {
        this.listeners.push([type, callback]);
    }
    close() {
        if (this.ws) {
            this.ws.close();
            this.activeSubscriptions = [];
            this.subscriptionQueue = [];
            clearInterval(this.sendInterval);
            clearInterval(this.timeoutSubscriptions);
        }
    }
    reconnect() {
        if (this.ws && this.ws.readyState === 3 && this.errorCount < 3)
            this.initialize();
    }
    req(subId, message) {
        let reqMessage = JSON.stringify(['REQ', subId, message])
        try {
            this.ws.send(reqMessage)
        } catch (err) {
            setTimeout(() => {
                this.ws.send(reqMessage)
            }, 300)
            console.log(err)
        }
    }
    initialize() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
            console.log(`Relay ${this.url} opened.`);
            this.listeners.filter(([t, c]) => t === 'open').forEach(([t, c]) => {
                c(this);
            })
        };
        this.ws.onclose = () => {
            console.log(`Relay ${this.url} closed.`);
            this.listeners.filter(([t, c]) => t === 'close').forEach(([t, c]) => {
                c(this);
            })
        };
        this.ws.onerror = (err) => {
            console.log(`Relay ${this.url} error.`);
            this.errorCount++;
            this.listeners.filter(([t, c]) => t === 'error').forEach(([t, c]) => {
                c(this);
            })
        };
        this.ws.onmessage = message => {
            let data = JSON.parse(message.data);
            if (data[0] === 'EVENT') {
                this.eventListeners.filter(([id, cb]) => id === data[1]).forEach(([id, cb]) => {
                    cb(data[2]);
                })
            }
            if (data[0] === 'EOSE') {
                this.eoseListeners.filter(([id, cb]) => id === data[1]).forEach(([id, cb]) => {
                    cb(data);
                });
                this.closeSubscription(data[1]);
            }
        };
        this.sendInterval = setInterval(() => {
            this.sendSubscriptions();
        }, 300);
        this.timeoutInterval = setInterval(() => {
            this.timeoutSubscriptions();
        }, 3000)

    }
    sendSubscriptions() {
        if (this.activeSubscriptions.length < 5 && this.subscriptionQueue.length > 0) {
            this.reconnect();
            if (this.ws.readyState === 1) {
                let sub = this.subscriptionQueue.shift();
                this.req(sub.id, sub.filters);
                this.activeSubscriptions.push(sub);
            }
        }
    }
    timeoutSubscriptions() {
        this.activeSubscriptions.forEach(sub => {
            let timeSinceLastMessage = new Date().getTime() - sub.lastMessage;
            let timeSinceCreation = new Date().getTime() - sub.created;
            let timeout = sub.options.timeout ?? this.options.subTimeout;
            let life = sub.options.life ?? this.options.subLife;
            if (timeSinceLastMessage > timeout || timeSinceCreation > life) {
                this.eoseListeners.filter(([id, cb]) => id === sub.id).forEach(([id, cb]) => {
                    cb(null);
                });
                this.closeSubscription(sub.id);
            }
        })
    }
    createSubscription(filters, subscriptionOptions = {}) {
        let subId = this.getNewSubId();
        let subscription = {
            id: subId,
            options: subscriptionOptions,
            created: new Date().getTime(),
            lastMessage: new Date().getTime(),
            filters: filters,
            onEvent: (cb) => {
                this.eventListeners.push([subId, cb])
            },
            onEose: (cb) => {
                this.eoseListeners.push([subId, cb]);
            }
        }
        this.subscriptionQueue.push(subscription);
        return subscription;
    }
    closeSubscription(subId) {
        try {
            this.activeSubscriptions = this.activeSubscriptions.filter(sub => sub.id !== subId);
            this.ws.send(JSON.stringify(["CLOSE", subId]))
        } catch (err) {
            console.log(err)
        }
    }
}

export default NostrRelayService;