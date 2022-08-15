import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseRoom } from '@shared/model/BaseRoom';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';
import { Player } from 'src/app/models/player.model';
import { RoomRepository } from 'src/app/repositories/room.repository';
import { ChatService } from 'src/app/services/chat.service';
import { SocketClientService } from 'src/app/services/core/socket-client.service';
import { NotifierService } from 'src/app/services/notifier.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent extends EventEmitter implements OnInit {

    get nameMaxLength() {
        return BaseRoom.maxLength;
    }

    get master() {
        return this.repository.amIMaster();
    }

    name: string;
    password: string;

    controlSynchro: boolean;
    useTouch: boolean;
    launchInterval: any;
    room: any;
    launching: number | boolean;
    displayParameters: boolean;

    constructor (private socketClient: SocketClientService,
        private repository: RoomRepository,
        private route: ActivatedRoute,
        private location: Location,
        private profile: ProfileService,
        private chat: ChatService,
        private notifier: NotifierService) {

        super();

        const roomName = this.route.snapshot.params.name;
        const password = this.route.snapshot.queryParams.password;

        this.chat = chat;
        this.notifier = notifier;
        // this.hasTouch = typeof (window.ontouchstart) !== 'undefined';
        this.name = decodeURIComponent(roomName);
        this.password = typeof (password) !== 'undefined' ? password : null;
        this.controlSynchro = false;
        this.useTouch = false;
        this.launchInterval = null;

        this.repository.start();
        // gamepadListener.start();

        if (!this.profile.isComplete()) {
            this.profile.on('close', this.joinRoom);
            if (this.profile.controller.loaded) {
                this.profile.controller.openProfile();
            } else {
                this.profile.controller.on('loaded', this.profile.controller.openProfile);
            }
        } else {
            this.joinRoom();
        }
    }

    ngOnInit() {
        document.body.classList.remove('game-mode');
    }

    /**
     * Attach events
     */
    attachEvents() {
        this.repository.on('room:close', this.goHome);
        this.repository.on('player:join', this.onJoin);
        this.repository.on('room:master', this.onRoomMaster);
        this.repository.on('room:game:start', this.start);
        this.repository.on('room:config:open', this.onConfigOpen);
        this.repository.on('room:launch:start', this.onLaunchStart);
        this.repository.on('room:launch:cancel', this.onLaunchCancel);

        for (let i = this.room.players.items.length - 1; i >= 0; i--) {
            this.room.players.items[i].on('control:change', this.onControlChange);
        }
    }

    /**
     * Detach events
     */
    detachEvents() {
        this.repository.off('room:close', this.goHome);
        this.repository.off('player:join', this.onJoin);
        this.repository.off('room:master', this.onRoomMaster);
        this.repository.off('room:game:start', this.start);
        this.repository.off('room:config:open', this.onConfigOpen);
        this.repository.off('room:launch:start', this.onLaunchStart);
        this.repository.off('room:launch:cancel', this.onLaunchCancel);

        if (this.room) {
            for (let i = this.room.players.items.length - 1; i >= 0; i--) {
                this.room.players.items[i].off('control:change', this.onControlChange);
            }
        }
    }

    /**
     * Go back to the homepage
     */
    goHome() {
        this.location.go('/');
    }

    /**
     * Update current message
     */
    updateCurrentMessage() {
        const profile = this.room.players.match(function () { return this.profile; });
        const player = this.room.players.match(function () { return this.local; });

        this.chat.setPlayer(profile ? profile : player);
    }

    /**
     * Save controls
     */
    saveProfileControls() {
        const player = this.room.players.match(function () { return this.profile; });

        if (player && !this.controlSynchro) {
            this.controlSynchro = true;
            this.profile.setControls(player.getMapping());
            this.controlSynchro = false;
        }
    }

    /**
     * Set profile controls
     */
    setProfileControls(player: { controls: { loadMapping: (arg0: any) => void; }[]; }) {
        if (!this.controlSynchro) {
            this.controlSynchro = true;

            for (let i = this.profile.controls.length - 1; i >= 0; i--) {
                player.controls[i].loadMapping(this.profile.controls[i].getMapping());
            }

            this.controlSynchro = false;
        }
    }

    /**
     * Set profile name
     */
    setProfileName(player: Player) {
        if (this.profile.name !== player.name) {
            player.setName(this.profile.name);
            this.setName(player);
        }
    }

    /**
     * Set profile color
     */
    setProfileColor(player: Player) {
        if (this.profile.color !== player.color) {
            player.setColor(this.profile.color);
            this.setColor(player);
        }
    }

    /**
     * Clear launch interval
     */
    clearLaunchInterval() {
        if (this.launchInterval) {
            this.launchInterval = clearInterval(this.launchInterval);
        }
    }

    /**
     * Join room and load scope
     */
    @boundMethod
    joinRoom() {
        if (!this.socketClient.connected) {
            return this.socketClient.on('connected', this.joinRoom);
        }

        this.profile.off('close', this.joinRoom);
        this.repository.join(this.name, this.password, this.onJoined);
    }

    /**
     * On room joined
     */
    @boundMethod
    onJoined(result: any) {
        if (result.success) {
            this.room = result.room;

            this.attachEvents();
            this.addProfileUser();
        } else {
            console.error('Could not join room %s: %s', result.name, result.error);
            this.goHome();
        }
    }

    /**
     * Leave room
     */
    @boundMethod
    leaveRoom() {
        const path = this.location.go('/');

        if (this.room) {
            if (path !== this.room.getGameUrl()) {
                this.repository.leave();
            }

            this.detachEvents();
        }
    }

    /**
     * Launch game
     */
    @boundMethod
    launch() {
        if (this.repository.amIMaster()) {
            this.repository.launch();
        }
    }

    /**
     * Add player
     */
    @boundMethod
    addPlayer(name: string = this.name, color: string = null) {

        if (name) {
            this.repository.addPlayer(
                name,
                color,
                (result: { success: any; error: any; }) => {
                    if (result.success) {
                        // this.username = null;
                    } else {
                        const error = typeof (result.error) !== 'undefined' ? result.error : 'Unknown error';
                        console.error('Could not add player %s: %s', name, error);
                    }
                }
            );
        }
    }

    /**
     * Remove player
     */
    @boundMethod
    removePlayer(player: { local: any; name: any; }) {
        if (!player.local) { return; }

        this.repository.removePlayer(
            player,
            (result: { success: any; }) => {
                if (!result.success) {
                    console.error('Could not remove player %s', player.name);
                }
            }
        );
    }

    /**
     * Kick player
     */
    @boundMethod
    kickPlayer(player: Player) {

        this.repository.kickPlayer(player, (result) => {
            if (!result.success) {
                console.error('Could not kick player %s', player.name);
            }
        });
    }

    /**
     * Go room config open
     */
    @boundMethod
    onConfigOpen(e: any) {
        // this.$location.search('password', this.room.config.password);
    }

    /**
     * On join
     */
    @boundMethod
    onJoin(e: any) {
        const player = e.detail.player;

        if (player.client.id === this.socketClient.id) {
            player.on('control:change', this.onControlChange);
            player.setLocal(true);

            player.profile = this.profile.name === player.name;

            this.updateCurrentMessage();

            if (player.profile) {
                this.setProfileControls(player);
            }

            if (this.useTouch) {
                player.setTouch();
            }
        } else {
            this.notifier.notify('New player joined!');
        }
    }

    /**
     * Set player color
     */
    @boundMethod
    setColor(player: Player): any {
        if (!player.local) { return; }

        this.repository.setColor(
            player,
            player.color,
            (result) => {

                // TODO find profile attribute
                // if (player.profile) {
                //     this.profile.setColor(player.color);
                // }
            }
        );
    }

    /**
     * Set player name
     */
    @boundMethod
    setName(player: Player): any {
        if (!player.local) { return; }

        this.repository.setName(
            player,
            player.name,
            (result) => {
                if (!result.success) {
                    const error = typeof (result.error) !== 'undefined' ? result.error : 'Unknown error';
                    const name = typeof (result.name) !== 'undefined' ? result.name : null;

                    console.error('Could not rename player: %s', error);

                    if (name) {
                        player.name = name;
                    }
                }

                // TODO find profile attribute
                // if (player.profile) {
                //     this.profile.setName(player.name);
                // }
            }
        );
    }

    /**
     * Set player ready
     */
    @boundMethod
    setReady(player: { local: any; id: Player; name: any; }): any {
        if (!player.local) { return; }

        this.repository.setReady(
            player.id,
            (result) => {
                if (!result.success) {
                    console.error('Could not set player %s ready', player.name);
                }
            }
        );
    }

    /**
     * Set touch for local players
     */
    @boundMethod
    setTouch() {
        // if (!this.hasTouch) { return; }

        this.useTouch = true;

        const players = this.room.getLocalPlayers();

        for (let i = players.items.length - 1; i >= 0; i--) {
            players.items[i].setTouch();
        }
    }

    /**
     * Start Game
     */
    @boundMethod
    start(e: any) {
        const passwordQuery = (this.room.config.open) ? `password=${this.room.config.password}` : '';
        this.location.go(this.room.getGameUrl(), passwordQuery);
    }

    /**
     * Add profile user
     */
    @boundMethod
    addProfileUser() {
        if (this.room.isNameAvailable(this.profile.name)) {
            this.profile.on('change', this.updateProfile);
            this.addPlayer(this.profile.name, this.profile.color);
        }
    }

    /**
     * Update profile
     */
    @boundMethod
    updateProfile() {
        const player = this.room.players.match(function () { return this.profile; });

        if (player) {
            this.setProfileName(player);
            this.setProfileColor(player);
            this.setProfileControls(player);
        }
    }


    /**
     * Triggered when a local player changes its controls
     */
    @boundMethod
    onControlChange(e: any) {
        this.saveProfileControls();
    }

    /**
     * Toggle parameters
     */
    @boundMethod
    onRoomMaster(e: any) {
        // this.$scope.master = this.repository.amIMaster();
    }

    /**
     * On launch start
     */
    @boundMethod
    onLaunchStart(e: any) {
        this.clearLaunchInterval();
        this.launchInterval = setInterval(this.onLaunchTimer, 1000);
        this.launching = this.repository.room.launchTime / 1000;
    }

    /**
     * On launch cancel
     */
    @boundMethod
    onLaunchCancel(e: any) {
        this.clearLaunchInterval();
        this.launching = false;
    }

    /**
     * On launch timer
     */
    @boundMethod
    onLaunchTimer(e: any) {
        if (typeof this.launching === 'number') {
            this.launching--;
        }
    }

    /**
     * Toggle parameters
     */
    @boundMethod
    toggleParameters() {
        this.displayParameters = !this.displayParameters;
    }
}
