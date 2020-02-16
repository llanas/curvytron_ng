import { boundMethod } from 'autobind-decorator';

import { Mapper } from './mapper';

/**
 * Keyboard Mapper
 */
export class KeyboardMapper extends Mapper {

    constructor () {
        super();
    }

    /**
     * Start listening
     */
    start() {
        if (super.start()) {
            window.addEventListener('keydown', this.onKey);
            window.addEventListener('keypress', this.kill);
            return true;
        }
        return false;
    }

    /**
     * Stop listening
     */
    stop() {
        if (super.stop()) {
            window.removeEventListener('keydown', this.onKey);
            window.removeEventListener('keypress', this.kill);
            return true;
        }
        return false;
    }

    /**
     * Gues character from Key
     */
    guessChar(key: number): string {
        switch (key.toString()) {
            case '8':
                return 'Backspace';
            case '13':
                return 'Enter';
            case '16':
                return 'Maj';
            case '17':
                return 'Ctrl';
            case '18':
                return 'Alt';
            case '32':
                return 'Space';
            case '38':
                return '↑';
            case '40':
                return '↓';
            case '39':
                return '→';
            case '37':
                return '←';
            default:
                return String.fromCharCode(key);
        }
    }

    /**
     * On key pressed
     */
    @boundMethod
    onKey(e: Event) {
        e.preventDefault();
        this.stop();
        // tslint:disable-next-line: no-string-literal
        this.setValue(e['keyCode']);
        return false;
    }
}
