import { Store } from "redux";
export interface getItem {
    (key: string): Promise<string | null>;
}
export interface setItem {
    (key: string, value: string): Promise<void>;
}
export interface StoreEngine {
    getItem: getItem;
    setItem: setItem;
}
export interface Persistor {
    persistKey: string;
    storeEngine: StoreEngine;
    whiteList?: Array<string>;
    blackList?: Array<string>;
}
export default function createPersistor(config: Persistor): ({ getState }: any) => (next: (arg0: any) => any) => (action: any) => Promise<boolean>;
export declare function hydrate(store: Store): void;
export declare function clearPersistedState(store: Store): void;
export declare function persistWrapper(reducers: any): {};
