import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UIService } from 'src/app/shared/ui.service';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoading$ : Observable<boolean>;
  private loadingSubs : Subscription;
  constructor(private authService : AuthService, private uiService : UIService,
               private store : Store<fromRoot.State>) { }


  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    // this.loadingSubs = this.uiService.loadingStateChanged.subscribe(isLoadingState=>{
    //   this.isLoading = isLoadingState;
    // });
  }

  onSubmit(form:NgForm){
    this.authService.login({
      email : form.value.email,
      password : form.value.password
    });
  }

  // ngOnDestroy() {
  //   if(this.loadingSubs) {
  //     this.loadingSubs.unsubscribe();
  //   }
    
  // }

}
