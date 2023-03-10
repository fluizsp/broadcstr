import { saveState } from "../localStorage";

export const SET_ACCOUNT = "SET_ACCOUNT";
export const ACCOUNT_INFO = "ACCOUNT_INFO";
export const LOGOUT = "LOGOUT";
export const SET_RELAYS = "SET_RELAYS";
export const SAVE_LANGUAGE = "SAVE_LANGUAGE";

export const setAccount = (account, accountInfo, following, likes) => {
    return {
        type: SET_ACCOUNT,
        data: { account: account, accountInfo: accountInfo, following: following, likes: likes }
    }
}

export const saveToStorage = () => {
    return (dispatch, getState) => {
        try {
            saveState(getState().user.account, 'user.account');
            saveState(getState().user.relays, 'user.relays');
            saveState(getState().user.following, 'user.following');
            saveState(getState().user.accountInfo, 'user.accountInfo');
            saveState(getState().user.usersMetadata, 'user.usersMetadata');
            saveState(getState().user.likes, 'user.likes');
        } catch {
        }
    }
}

export const logout = () => {
    return {
        type: LOGOUT
    }
}