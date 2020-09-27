import { BasePlayer } from '@shared/model/BasePlayer';
import { boundMethod } from 'autobind-decorator';

import { Client } from './client.model';
import { PlayerControl } from './player-control.model';

/**
 * Player
 */
export class Player extends BasePlayer {

    local = false;
    controls: PlayerControl[] = null;
    vote = false;
    kicked = false;
    position: string;
    client: Client;

    constructor (id: string, client: Client, name: string, color: string, ready: boolean) {

        super(client.id, name, color, ready);

        this.id = id;
        this.position = this.client.id + '-' + this.id;
        this.client.players.add(this);
    }

    /**
     * Set local
     */
    setLocal(local: boolean) {
        this.local = local;
        this.initControls();
    }

    /**
     * Init controls
     */
    initControls() {
        if (!this.controls) {
            this.controls = [
                new PlayerControl(37, 'icon-left-dir'),
                new PlayerControl(39, 'icon-right-dir')
            ];
            for (let i = this.controls.length - 1; i >= 0; i--) {
                this.controls[i].on('change', this.onControlChange);
            }
        }
    }

    /**
     * Get controls mapping
     */
    getMapping(): Array<{ mapper: string, value: number }> {
        const mapping = new Array(this.controls.length);
        for (let i = this.controls.length - 1; i >= 0; i--) {
            mapping[i] = this.controls[i].getMapping();
        }
        return mapping;
    }

    /**
     * Set touch
     */
    // setTouch() {
    //     const touch = document.createTouch(window, window, new Date().getTime(), 0, 0, 0, 0);
    //     for (let i = this.controls.length - 1; i >= 0; i--) {
    //         this.controls[i].mappers.getById('touch').setValue(touch);
    //     }
    // }

    /**
     * Get binding
     */
    getBinding(): number[] {
        //TODO bindings propres ..
        return [this.controls[0].mapper.value, this.controls[1].mapper.value, 38, 40];
    }

    /**
     * Should this player be considered master?
     */
    isMaster(): boolean {
        return this.client.master && this.client.players.getIdIndex(this.id) === 0;
    }

    /**
     * On change
     */
    @boundMethod
    onControlChange() {
        this.emit('control:change');
    }
}
