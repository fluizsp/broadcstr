import NostrRelayService from "./NostrRelayService";

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
        this.relayServices.forEach(relayService => {
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
    list(filters, options) {
        return new Promise((resolve, reject) => {
            let subscriptions = [];
            let events = [];
            let eoseCount = 0;
            this.relayServices.forEach(relayService => {
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