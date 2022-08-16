import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RoomComponent } from './components/room/room.component';
import { RoomsComponent } from './components/rooms/rooms.component';

@NgModule({
    declarations: [
        AppComponent,
        ProfileComponent,
        RoomsComponent,
        RoomComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
