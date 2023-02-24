import { saveState } from "../localStorage";

export const SET_ACCOUNT = "SET_ACCOUNT";
export const ACCOUNT_INFO = "ACCOUNT_INFO";
export const LOGOUT = "LOGOUT";
export const SET_RELAYS = "SET_RELAYS";

export const setAccount = (account, accountInfo, following, likes) => {
    return {
        type: SET_ACCOUNT,
        data: { account: account, accountInfo: accountInfo, following: following, likes: likes }
    }
}

export const saveToStorage = () => {
    return (dispatch, getState) => {
        let userState=getState().user;
        saveState(userState, 'user');
    }
}

export const logout = () => {
    return {
        type: LOGOUT
    }
}