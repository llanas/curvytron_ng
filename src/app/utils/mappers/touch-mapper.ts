import { boundMethod } from 'autobind-decorator';

import { Mapper } from './mapper';

/**
 * Touch Mapper
 */
export class TouchMapper extends Mapper {

    constructor () {
        super();
    }

    /**
     * Start listening
     */
    start() {
        if (super.start()) {
            window.addEventListener('touchstart', this.onTouch);
            window.addEventListener('touchend', this.kill);
            window.addEventListener('touchcancel', this.kill);
            window.addEventListener('touchleave', this.kill);
            return true;
        }
        return false;
    }

    /**
     * Stop listening
     */
    stop() {
        if (super.stop()) {
            window.removeEventListener('touchstart', this.onTouch);
            window.removeEventListener('touchend', this.kill);
            window.removeEventListener('touchcancel', this.kill);
            window.removeEventListener('touchleave', this.kill);
            return true;
        }
        return false;
    }

    /**
     * Gues character from Key
     */
    guessChar(key: number): string {
        return '✍';
    }

    /**
     * On touch pressed
     */
    @boundMethod
    onTouch(e: Event) {
        e.preventDefault();

        this.stop();
        // tslint:disable-next-line: no-string-literal
        this.setValue(e['changedTouches'][0]);

        return false;
    }
}
