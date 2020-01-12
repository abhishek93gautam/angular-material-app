import {Subject} from 'rxjs/Subject';

import { AuthData } from './auth-data.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth'; 
import { TrainingService } from '../training/training.service';
import { MatSnackBar } from '@angular/material';
import { UIService } from '../shared/ui.service';

@Injectable()
export class AuthService{

    authChange = new Subject<boolean>();
    private isAuthenticated = false;

    constructor(private router : Router, 
                private afAuth : AngularFireAuth,
                private trainingService : TrainingService,
                private uiservice : UIService)
                {}

    initAuthListener() {
        this.afAuth.authState.subscribe( user => {
            if(user) {
                this.isAuthenticated = true;
                this.authChange.next(true);
                this.router.navigate(['/training']);
            }
            else {
                this.trainingService.cancelSubscriptions();
                this.isAuthenticated = false;
                this.authChange.next(false);
                this.router.navigate(['/login']);
            }
        });
    }

    registerUser(authData : AuthData){
        this.uiservice.loadingStateChanged.next(true);
        this.afAuth.auth.createUserWithEmailAndPassword(authData.email.toString(), authData.password.toString())
                            .then(result=>{
                                this.uiservice.loadingStateChanged.next(false);
                            })
                            .catch(error => {
                                this.uiservice.loadingStateChanged.next(false);
                                this.uiservice.showSnackBar(error.message, null, 3000);
                            });
    }

    login(authData : AuthData){
        this.uiservice.loadingStateChanged.next(true);
        this.afAuth.auth.signInWithEmailAndPassword(authData.email.toString(),authData.password.toString())
                            .then(result=>{
                                this.uiservice.loadingStateChanged.next(false);
                            })
                            .catch(error => {
                                this.uiservice.loadingStateChanged.next(false);
                                this.uiservice.showSnackBar(error.message, null, 3000);
                            });
    }

    logout() {
        this.afAuth.auth.signOut();        
    }

    isAuth() {
        return this.isAuthenticated;
    }
}