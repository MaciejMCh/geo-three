import { PerspectiveCamera } from 'three';
declare type Common = {
    worldCamera: PerspectiveCamera;
};
export declare class ModelUpdateLoop {
    private common;
    private updates;
    constructor(common: Common);
    add: (handler: (common: Common) => void) => void;
    tick: () => void;
}
export {};
