
import {Injectable} from '@angular/core';

@Injectable()
export class BannerService {
    public hide:boolean;
    constructor() {
        this.hide = false;
    }

    setHide(value) {
        this.hide = value;
    }

    getHide() {
        return this.hide;
    }

}
