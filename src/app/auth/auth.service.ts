import {Subject} from 'rxjs/Subject';

import { User } from './user.model';
import { AuthData } from './auth-data.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth'; 
import { TrainingService } from '../training/training.service';

@Injectable()
export class AuthService{

    authChange = new Subject<boolean>();
    private isAuthenticated = false;

    constructor(private router : Router, 
                private afAuth : AngularFireAuth,
                private trainingService : TrainingService)
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
        this.afAuth.auth.createUserWithEmailAndPassword(authData.email.toString(), authData.password.toString())
                            .then(result=>{
                                console.log(result);
                            })
                            .catch(error => {
                                console.log(error);
                            });
    }

    login(authData : AuthData){
        this.afAuth.auth.signInWithEmailAndPassword(authData.email.toString(),authData.password.toString())
                            .then(result=>{
                                console.log(result);
                            })
                            .catch(error => {
                                console.log(error);
                            });
    }

    logout() {
        this.afAuth.auth.signOut();        
    }

    isAuth() {
        return this.isAuthenticated;
    }
}