import {Subject} from 'rxjs/Subject';
import { AuthData } from './auth-data.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth'; 
import { TrainingService } from '../training/training.service';
import { UIService } from '../shared/ui.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';

@Injectable()
export class AuthService{

    authChange = new Subject<boolean>();
    private isAuthenticated = false;

    constructor(private router : Router, 
                private afAuth : AngularFireAuth,
                private trainingService : TrainingService,
                private uiservice : UIService,
                private store : Store<fromRoot.State>)
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
        //this.uiservice.loadingStateChanged.next(true);
        this.store.dispatch(new UI.StartLoading());
        this.afAuth.auth.createUserWithEmailAndPassword(authData.email.toString(), authData.password.toString())
                            .then(result=>{
                                //this.uiservice.loadingStateChanged.next(false);
                                this.store.dispatch(new UI.StopLoading());
                            })
                            .catch(error => {
                                //this.uiservice.loadingStateChanged.next(false);
                                this.store.dispatch(new UI.StopLoading());
                                this.uiservice.showSnackBar(error.message, null, 3000);
                            });
    }

    login(authData : AuthData){
        //this.uiservice.loadingStateChanged.next(true);
        this.store.dispatch(new UI.StartLoading());
        this.afAuth.auth.signInWithEmailAndPassword(authData.email.toString(),authData.password.toString())
                            .then(result=>{
                                //this.uiservice.loadingStateChanged.next(false);
                                this.store.dispatch(new UI.StopLoading());
                            })
                            .catch(error => {
                                //this.uiservice.loadingStateChanged.next(false);
                                this.store.dispatch(new UI.StopLoading());
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