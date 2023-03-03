import { nip57 } from "nostr-tools";

export const Nip57Service = {
    fetchLud16: lud16 => {
        return new Promise((resolve, reject) => {
            let lud16Fragments = lud16.split('@');
            let reqUrl = `https://${lud16Fragments[1]}/.well-known/lnurlp/${lud16Fragments[0]}`
            fetch(reqUrl).then(result => {
                //console.log(result);
                resolve(result.json());
            }).catch(err => {
                console.log(err);
            });
        })
    },
    fetchCallback: (callbackUrl, amount, signedZapRequest) => {
        return new Promise((resolve, reject) => {
            let zapRequestQS = JSON.stringify(signedZapRequest);
            let reqUrl = `${callbackUrl}?amount=${amount}&nostr=${encodeURIComponent(zapRequestQS)}`;
            fetch(reqUrl).then(result => {
                resolve(result.json());
            }).catch(err => {
                console.log(err);
            });
        });
    }
};