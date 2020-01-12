import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Exercise } from '../exercise.model';
import { TrainingService } from '../training.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-past-trainings',
  templateUrl: './past-trainings.component.html',
  styleUrls: ['./past-trainings.component.css']
})
export class PastTrainingsComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns = ['date','name','calories','duration','state'];
  dataSource = new MatTableDataSource<Exercise>();

  private exhangedSubscription : Subscription;

  @ViewChild(MatSort,{static:true}) sort : MatSort;
  @ViewChild(MatPaginator,{static:true}) paginator : MatPaginator;

  constructor(private trainingService : TrainingService) {
  }

  ngOnInit() {
    this.exhangedSubscription = this.trainingService.finishedExercisesChanged.subscribe((exercises:Exercise[])=>{
      this.dataSource.data = exercises;
    })
    this.trainingService.fetchCompletedOrCancelledExercises();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue : String){
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
    if(this.exhangedSubscription) {
      this.exhangedSubscription.unsubscribe();
    }
    
  }

}
