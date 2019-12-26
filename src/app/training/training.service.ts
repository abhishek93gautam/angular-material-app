import { Exercise } from './exercise.model';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';

@Injectable()
export class TrainingService { 

    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    private availableExercises : Exercise[] = [];

    private runningExercise : Exercise;
    private exercises : Exercise[] = [];

    constructor(private db: AngularFirestore){

    }

    fetchAvailableExercises(){
        this.db.collection('availableExercises')
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
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        });
    }

    startExercie(selectId : string){
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

    getCompletedOrCancelledExercises(){
        return this.exercises.slice();
    }

    private addDatatoDatabase(exercise: Exercise){
        this.db.collection('finishedExercises').add(exercise);
    }
}