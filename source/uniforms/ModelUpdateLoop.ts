import { PerspectiveCamera } from 'three';

type Common = {
    worldCamera: PerspectiveCamera;
}

export class ModelUpdateLoop {
    private updates: Array<(common: Common) => void> = [];

    constructor(private common: Common) {}

    add = (handler: (common: Common) => void) => {
        this.updates.push(handler);
    };

    tick = () => {
        this.updates.forEach(update => {
            update(this.common);
        });
    };
}
