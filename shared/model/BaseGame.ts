import { Collection } from '@shared/collection';
import { BaseBonusManager } from '@shared/manager/BaseBonusManager';
import { BaseFPSLogger } from '@shared/service/BaseFPSLogger';
import { EventEmitter } from 'events';

import { BaseAvatar, SerializedBaseAvatar } from './BaseAvatar';
import { BaseRoom } from './BaseRoom';

/**
 * BaseGame
 */
export class BaseGame extends EventEmitter {

    /**
     * Loop frame rate
     */
    static framerate = 1 / 60 * 1000;

    /**
     * Map size factor per player
     */
    static perPlayerSize = 80;

    /**
     * Time before round start
     */
    static warmupTime = 3000;

    /**
     * Time after round end
     */
    static warmdownTime = 5000;

    /**
     * Margin from borders
     */
    static spawnMargin = 0.05;

    /**
     * Angle margin from borders
     */
    static spawnAngleMargin = 0.3;

    /**
     * Borderless
     */
    static borderless = false;


    name: string;
    frame: any = null;
    avatars: Collection<BaseAvatar>;
    size: number;
    rendered: any;
    maxScore: number;
    fps: any;
    started: boolean;
    bonusManager: any;
    inRound: boolean;
    borderless: boolean;

    constructor(room: BaseRoom) {

        super();

        this.name = room.name;
        this.avatars = room.players.map<BaseAvatar>(function () { return this.getAvatar(); });
        this.size = this.getSize(this.avatars.count());
        this.rendered = null;
        this.maxScore = room.config.getMaxScore();
        this.fps = new BaseFPSLogger();
        this.started = false;
        this.bonusManager = new BaseBonusManager(this); // room.config.getBonuses(), room.config.getVariable('bonusRate')
        this.inRound = false;
    }

    /**
     * Update
     */
    update(step: number): void {
        throw new Error('Method not implemented.');
    }

    /**
     * On round end
     */
    onRoundEnd(): void {
        throw new Error('Method not implemented.');
    }

    /**
     * Get framerate
     */
    framerate(loop: any, framerate: any) {
        throw new Error('Method not implemented.');
    }

    /**
     * Remove a avatar from the game
     */
    removeAvatar(avatar: BaseAvatar) {
        if (this.avatars.exists(avatar)) {
            avatar.die();
            avatar.destroy();
        }
    }

    /**
     * On start
     */
    onStart() {
        this.rendered = new Date().getTime();
        this.bonusManager.start();
        this.fps.start();
    }

    /**
     * On stop
     */
    onStop() {
        this.rendered = null;
        this.bonusManager.stop();
        this.fps.stop();
        const size = this.getSize(this.getPresentAvatars().count());
        if (this.size !== size) {
            // this.setSize(size);
            // FIXME
        }
    }

    /**
     * On round new
     */
    onRoundNew() {
        this.borderless = BaseGame.borderless;
        this.bonusManager.clear();
        for (let i = this.avatars.items.length - 1; i >= 0; i--) {
            if (this.avatars.items[i].present) {
                this.avatars.items[i].clear();
            }
        }
    }

    /**
     * Get new frame
     */
    newFrame() {
        this.frame = setTimeout(this.loop, BaseGame.framerate);
    }

    /**
     * Clear frame
     */
    clearFrame() {
        clearTimeout(this.frame);
        this.frame = null;
    }

    /**
     * Update game size
     */
    setSize() {
        this.size = this.getSize(this.getPresentAvatars().count());
    }

    /**
     * Get size by players
     */
    getSize(players: number): number {
        const square = BaseGame.perPlayerSize * BaseGame.perPlayerSize;
        const size = Math.sqrt(square + ((players - 1) * square / 5));
        return Math.round(size);
    }

    /**
     * Are all avatars ready?
     */
    isReady(): boolean {
        return this.getLoadingAvatars().isEmpty();
    }

    /**
     * Get still loading avatars
     */
    getLoadingAvatars(): Collection<BaseAvatar> {
        return this.avatars.filter(function () { return this.present && !this.ready; });
    }

    /**
     * Get alive avatars
     */
    getAliveAvatars(): Collection<BaseAvatar> {
        return this.avatars.filter(function () { return this.alive; });
    }

    /**
     * Get present avatars
     */
    getPresentAvatars(): Collection<BaseAvatar> {
        return this.avatars.filter(function () { return this.present; });
    }

    /**
     * Sort avatars
     */
    sortAvatars(avatars: Collection<BaseAvatar>): Collection<BaseAvatar> {
        avatars = typeof (avatars) !== 'undefined' ? avatars : this.avatars;
        // tslint:disable-next-line: only-arrow-functions
        avatars.sort(function (a, b) { return a.score > b.score ? -1 : (a.score < b.score ? 1 : 0); });
        return avatars;
    }

    /**
     * Set borderless
     */
    setBorderless(borderless: boolean) {
        this.borderless = borderless ? true : false;
    }

    /**
     * Start loop
     */
    start(this: BaseGame) {
        if (!this.frame) {
            this.onStart();
            this.loop();
        }
    }

    /**
     * Stop loop
     */
    stop(this: BaseGame) {
        if (this.frame) {
            this.clearFrame();
            this.onStop();
        }
    }

    /**
     * Animation loop
     */
    loop(this: BaseGame) {
        this.newFrame();

        const now = new Date().getTime();
        const step = now - this.rendered;

        this.rendered = now;

        this.onFrame(step);
        this.fps.onFrame();
    }

    /**
     * On frame
     */
    onFrame(this: BaseGame, step: number) {
        this.update(step);
    }

    /**
     * New round
     */
    newRound(this: BaseGame, time: any) {
        this.started = true;

        if (!this.inRound) {
            this.inRound = true;
            this.onRoundNew();
            setTimeout(this.start, typeof (time) !== 'undefined' ? time : BaseGame.warmupTime);
        }
    }

    /**
     * Check end of round
     */
    endRound(this: BaseGame) {
        if (this.inRound) {
            this.inRound = false;
            this.onRoundEnd();
            setTimeout(this.stop, BaseGame.warmdownTime);
        }
    }

    /**
     * FIN DU GAME
     */
    public end(this: BaseGame) {
        if (this.started) {
            this.started = false;
            this.stop();
            this.emit('end', { game: this });

            return true;
        }

        return false;
    }

    /**
     * Serialize
     */
    serialize(): SerializedBaseGame {
        return {
            name: this.name,
            players: this.avatars.map<SerializedBaseAvatar>(function () { return this.serialize(); }).items,
            maxScore: this.maxScore
        };
    }
}

export interface SerializedBaseGame {
    name: string;
    players: SerializedBaseAvatar[];
    maxScore: number;
}
