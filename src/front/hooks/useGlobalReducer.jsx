import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"

const StoreContext = createContext()

export function StoreProvider({ children }) {
    const persistenceState = {
        ...initialStore(),
        token: localStorage.getItem("token") || null,
        role: localStorage.getItem("role") || null,
        userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
    };

    const [store, dispatch] = useReducer(storeReducer, persistenceState)
    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}

export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}