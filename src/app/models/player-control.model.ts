import { Collection } from '@shared/collection';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { KeyboardMapper } from '../utils/mappers/keyboard-mapper';
import { Mapper } from '../utils/mappers/mapper';
import { TouchMapper } from '../utils/mappers/touch-mapper';

/**
 * Player control
 */
export class PlayerControl extends EventEmitter {

    icon: any;
    listening = false;
    mappers: Collection<Mapper>;
    mapper: Mapper;

    constructor (value: number, icon: string) {

        super();

        this.icon = icon;
        this.listening = false;
        this.mappers = new Collection<Mapper>();

        this.addMapper('keyboard', new KeyboardMapper());
        this.addMapper('touch', new TouchMapper());

        this.mapper = this.mappers.getById('keyboard');
        this.mapper.setValue(value);
    }

    /**
     * Create mapper
     */
    addMapper(id: string, mapper: Mapper) {
        mapper.id = id;
        mapper.on('change', (e) => this.setMapper(mapper));
        mapper.on('listening:stop', this.stop);
        this.mappers.add(mapper);
    }

    /**
     * Set mapper
     */
    setMapper(mapper: Mapper) {
        this.mapper = mapper;
        this.emit('change');
    }

    /**
     * Get mapping
     */
    getMapping(): { mapper: string, value: number } {
        return {
            mapper: this.mapper.id,
            value: this.mapper.value
        };
    }

    /**
     * Load mapping
     */
    loadMapping({ id, value }: { id: string, value: number }) {
        const mapper = this.mappers.getById(id);
        if (mapper) {
            this.setMapper(mapper);
            this.mapper.setValue(value);
        }
    }

    /**
     * Toggle
     */
    toggle() {
        if (this.mapper.listening) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Start listening
     */
    @boundMethod
    start() {
        for (let i = this.mappers.items.length - 1; i >= 0; i--) {
            this.mappers.items[i].start();
        }
    }

    /**
     * Start listening
     */
    @boundMethod
    stop() {
        for (let i = this.mappers.items.length - 1; i >= 0; i--) {
            this.mappers.items[i].stop();
        }
    }
}
