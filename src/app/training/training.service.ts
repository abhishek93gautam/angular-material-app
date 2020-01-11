import { Exercise } from './exercise.model';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService { 

    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private fbSubs : Subscription[] = [];

    private availableExercises : Exercise[] = [];

    private runningExercise : Exercise;

    constructor(private db: AngularFirestore,private uiService : UIService){

    }

    fetchAvailableExercises(){
        this.uiService.loadingStateChanged.next(true);
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
        })).subscribe((exercises : Exercise[]) =>{
            this.uiService.loadingStateChanged.next(false);
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        }));
    }

    startExercie(selectId : string){
        //this.db.doc('availableExercises/' + selectId).update({ lastSelected : new Date() });

        const selectedExercise = this.availableExercises.find(ex=>{
            return ex.id === selectId
        })
        this.runningExercise = selectedExercise; 
        this.exerciseChanged.next({...this.runningExercise});
    } 

    completeExercise(){
        this.addDatatoDatabase({...this.runningExercise, date:new Date(), state:'completed'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress : number){
        this.addDatatoDatabase({...this.runningExercise, 
            duration:this.runningExercise.duration*(progress/100),
            calories : this.runningExercise.calories*(progress/100),
            date:new Date(), state:'cancelled'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getRunningExercise(){
        return {...this.runningExercise};
    }

    fetchCompletedOrCancelledExercises(){
        this.fbSubs.push(this.db.collection('finishedExercises').valueChanges().subscribe((exercises:Exercise[])=>{
            this.finishedExercisesChanged.next(exercises);
        }));
    }

    private addDatatoDatabase(exercise: Exercise){
        this.db.collection('finishedExercises').add(exercise);
    }

    cancelSubscriptions() {
        this.fbSubs.forEach(sub => sub.unsubscribe());
    }
}