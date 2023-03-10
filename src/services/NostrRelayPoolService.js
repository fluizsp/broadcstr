import store from "../store";
import NostrRelayService from "./NostrRelayService";

let globalPoolService = null;

export const getPoolService = () => {
    if (!globalPoolService) {
        globalPoolService = new NostrRelayPoolService(store.getState().user.relays)
        globalPoolService.initialize();
        globalPoolService.addListener('open', relay => {
            console.log('pool relay opened');
        });
        globalPoolService.addListener('close', relay => {
            console.log('pool relay closed');
        });
    }
    return globalPoolService;
}

class NostrRelayPoolService {
    constructor(relaysConfigs, subscriptionOptions = { subTimeout: 3000, subLife: 30000 }) {
        this.relaysConfigs = relaysConfigs;
        this.subscriptionOptions = subscriptionOptions;
        this.relayServices = [];
    }
    initialize() {
        this.relaysConfigs.forEach(relayConfig => {
            let relayService = new NostrRelayService(relayConfig.url, relayConfig.read, relayConfig.write, this.subscriptionOptions);
            relayService.initialize();
            relayService.addListener('error', errorService => {
                this.relayServices = this.relayServices.filter(r => r.url !== errorService.url);
            })
            this.relayServices.push(relayService);
        });
    }
    addListener(type, callback) {
        this.relayServices.forEach(relayService => {
            relayService.addListener(type, callback);
        });
    }
    createSubscription(filters, options) {
        let subscriptions = [];
        this.relayServices.filter(s => s.read).forEach(relayService => {
            let sub = relayService.createSubscription(filters, options ?? this.subscriptionOptions);
            subscriptions.push(sub);
        });
        return {
            subscriptions: subscriptions,
            onEvent: (cb) => {
                subscriptions.forEach(sub => {
                    sub.onEvent(cb);
                })
            },
            onEose: (cb) => {
                subscriptions.forEach(sub => {
                    sub.onEose(cb);
                })
            }
        }
    }
    publish(event) {
        let pubs = [];
        this.relayServices.filter(s => s.write).forEach(relayService => {
            let pub = relayService.publish(event);
            pubs.push(pub);
        });
        return {
            pubs: pubs,
            onPublish: callback => {
                pubs.forEach(pub => {
                    pub.onPublish(callback);
                })
            }
        }
    }
    list(filters, options) {
        return new Promise((resolve, reject) => {
            let subscriptions = [];
            let events = [];
            let eoseCount = 0;
            this.relayServices.filter(s => s.read).forEach(relayService => {
                let sub = relayService.createSubscription(filters, options ?? this.subscriptionOptions);
                subscriptions.push(sub);
            });
            subscriptions.forEach(sub => {
                sub.onEvent(event => {
                    events.push(event);
                });
                sub.onEose(() => {
                    eoseCount++;
                    if (eoseCount === subscriptions.length)
                        resolve(events);
                });
            })
        })
    }
    updateRelays(relaysUrls) {
    }
}

export default NostrRelayPoolService;