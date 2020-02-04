import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UIService } from '../shared/ui.service';

import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';
import { Store } from '@ngrx/store';

@Injectable()
export class TrainingService { 
    private fbSubs : Subscription[] = [];

    constructor(private db: AngularFirestore,
                private uiService : UIService,
                private store : Store<fromTraining.State>
                ){

    }

    fetchAvailableExercises() {
        this.store.dispatch(new UI.StartLoading());
        this.fbSubs.push(this.db.collection('availableExercises')
        .snapshotChanges()
        .pipe(map(docArray => {
          return docArray.map(doc=>{
            return {
              id : doc.payload.doc.id,
              name : doc.payload.doc.data()['name'],
              calories : doc.payload.doc.data()['calories'],
              duration : doc.payload.doc.data()['duration']
            }
          })
        })).subscribe((exercises : Exercise[]) => {
            this.store.dispatch(new UI.StopLoading());
            //this.availableExercises = exercises;
            //this.exercisesChanged.next([...this.availableExercises]);
            this.store.dispatch(new Training.SetAvailableTrainings(exercises));
        }, error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackBar('Fetching exercises failed, please try again later', null, 3000);
        }));
    }

    startExercie(selectId : string){
        //this.db.doc('availableExercises/' + selectId).update({ lastSelected : new Date() });

        // const selectedExercise = this.availableExercises.find(ex=>{
        //     return ex.id === selectId
        // })
        // this.runningExercise = selectedExercise; 
        // this.exerciseChanged.next({...this.runningExercise});
        this.store.dispatch(new Training.StartTraining(selectId));
    } 

    completeExercise() {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDatatoDatabase({
                ...ex, 
                date:new Date(), 
                state:'completed'});
            //this.runningExercise = null;
            //this.exerciseChanged.next(null);
            this.store.dispatch(new Training.StopTraining());
        });
        
    }

    cancelExercise(progress : number) {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDatatoDatabase({...ex, 
                duration:ex.duration*(progress/100),
                calories : ex.calories*(progress/100),
                date:new Date(), state:'cancelled'});
            //this.runningExercise = null;
            //this.exerciseChanged.next(null);
            this.store.dispatch(new Training.StopTraining());
        });
        
    }

    // getRunningExercise(){
    //     return {...this.runningExercise};
    // }

    fetchCompletedOrCancelledExercises(){
        this.fbSubs.push(this.db.collection('finishedExercises')
        .valueChanges()
        .subscribe((exercises:Exercise[]) => {
            //this.finishedExercisesChanged.next(exercises);
            this.store.dispatch(new Training.SetFinishedTrainings(exercises));
        }));
    }

    private addDatatoDatabase(exercise: Exercise){
        this.db.collection('finishedExercises').add(exercise);
    }

    cancelSubscriptions() {
        this.fbSubs.forEach(sub => sub.unsubscribe());
    }
}