import { Exercise } from './exercise.model';
import { Subject } from 'rxjs/Subject';

export class TrainingService { 

    exerciseChanged = new Subject<Exercise>();

    private availableExercises : Exercise[] = [
        {id : 'crunches',name : 'Crunches' , duration:30, calories:8},
        {id : 'touch-toes',name : 'Touch Toes' , duration:180, calories:15},
        {id : 'side-lunges',name : 'Side Lunges' , duration:120, calories:10},
        {id : 'burpees',name : 'Burpees' , duration:60, calories:8}
    ];

    private runningExercise : Exercise;
    private exercises : Exercise[] = [];

    getAvailableExercises(){
        return this.availableExercises.slice();
    }

    startExercie(selectId : string){
        const selectedExercise = this.availableExercises.find(ex=>{
            return ex.id === selectId
        })
        this.runningExercise = selectedExercise;   
        this.exerciseChanged.next({...this.runningExercise});
    } 

    completeExercise(){
        this.exercises.push({...this.runningExercise, date:new Date(), state:'completed'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress : number){
        this.exercises.push({...this.runningExercise, 
            duration:this.runningExercise.duration*(progress/100),
            calories : this.runningExercise.duration*(progress/100),
            date:new Date(), state:'cancelled'});
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getRunningExercise(){
        return {...this.runningExercise};
    }
}