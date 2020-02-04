import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { TrainingService } from '../training.service';
import { NgForm } from '@angular/forms';
import { Exercise } from '../exercise.model';

import * as fromTraining from "../training.reducer";
import * as fromRoot from "../../app.reducer";
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {
  exercises$ : Observable<Exercise[]>;
  isLoading$ : Observable<boolean>;
  constructor(private trainingService : TrainingService,
              private store : Store<fromTraining.State>) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    // this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(exercises=>{
    //   this.exercises = exercises;
    // })
    this.exercises$ = this.store.select(fromTraining.getAvailableExercises);
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form : NgForm) {
    this.trainingService.startExercie(form.value.exercise);
  }


}
