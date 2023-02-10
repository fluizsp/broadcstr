export const SET_ACCOUNT = "SET_ACCOUNT";
export const ACCOUNT_INFO = "ACCOUNT_INFO";

export const setAccount = (account, accountInfo) => {
    return {
        type: SET_ACCOUNT,
        data: { account: account, accountInfo: accountInfo }
    }
}