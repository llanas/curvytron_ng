import { Component, OnInit } from '@angular/core';
import { BasePlayer } from '@shared/model/BasePlayer';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';
import { ProfileService } from 'src/app/services/profile.service';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends EventEmitter implements OnInit {

    static NAME_MAX_LENGTH = BasePlayer.maxLength;
    static COLOR_MAX_LENGTH = BasePlayer.colorMaxLength;

    open = false;
    loaded = false;
    tuto = null;
    panel = null;
    controls = null;

    ngOnInit(): void {
        this.panel = document.querySelector('.panel');
        this.controls = this.panel.querySelectorAll('input.control');
        this.tuto = this.panel.querySelector('.profile-tuto');
        this.loaded = true;
        this.emit('loaded');
    }

    constructor (private profile: ProfileService) {
        super();
    }

    /**
     * Open profile
     */
    @boundMethod
    openProfile() {
        if (!this.open) {
            this.open = true;
            this.panel.classList.add('active');
            this.tuto.classList.toggle('active', !this.profile.isComplete());
            this.profile.emit('open');
        }
    }

    /**
     * Close profile
     */
    @boundMethod
    closeProfile() {
        if (this.open && this.profile.isComplete()) {
            this.open = false;
            this.panel.classList.remove('active');
            this.tuto.classList.toggle('active', !this.profile.isComplete());
            this.profile.emit('close');
        }
    }

    /**
     * Toggle profile
     */
    @boundMethod
    toggleProfile() {
        return this.open ? this.closeProfile() : this.openProfile();
    }

    /**
     * Blur controls
     */
    @boundMethod
    blurControls() {
        this.controls[0].blur();
        this.controls[1].blur();
    }
}
