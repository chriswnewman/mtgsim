import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { Deck } from '../shared/deck';
import { Card } from '../shared/card';
// import { BarchartComponent } from './charts/barchart/barchart.component';

@Component({
  selector: 'app-home',
  template: `
  <h3>{{deck.getLength()}}/60 Cards </h3>
  <div class="container-fluid">
    <div class="row">
      <div class="col-6">
        <!-- FORM -->
        <form (submit)="inputData()">
          <div class="row">
            <div class="col-2 form-group">
              <label for="color">Color:</label>
              <!--// <select [(ngModel)]="selectedColor" name="color" class="form-control">
              //   <option *ngFor="let i of colorOpts" [value]="i">{{i}}</option>
              // </select> -->
              <input id="typeahead-basic" name="color" type="text" class="form-control" [(ngModel)]="selectedColor" [ngbTypeahead]="search"/>
              <!--<input
              id="typeahead-focus"
              name="color"
              type="text"
              class="form-control"
              [(ngModel)]="selectedColor"
              [ngbTypeahead]="searchColorOpts"
              (focus)="focus$.next($event.target.value)"
              (click)="click$.next($event.target.value)"
              #colorInput="ngbTypeahead"
            />-->
            </div>
    
            <div class="col-2 form-group">
              <label for="cost">Cost:</label>
              <!--<select [(ngModel)]="selectedCardCost" name="cost" class="form-control">
                <option *ngFor="let i of cardCostOpts" [value]="i">{{i}}</option>
              </select> -->
              <input
              id="typeahead-focus"
              name="cost"
              type="text"
              class="form-control"
              [(ngModel)]="selectedCardCost"
              [ngbTypeahead]="searchCostOpts"
              (focus)="focus$.next($event.target.value)"
              (click)="click$.next($event.target.value)"
              #costInput="ngbTypeahead"
            />
            </div>
    
            <div class="col-3 form-group">
              <label for="type">Type:</label>
              <select [(ngModel)]="selectedCardType" name="type" class="form-control">
                <option *ngFor="let i of cardTypeOpts" [value]="i">{{i}}</option>
              </select>
            </div>
            <div class="col-3 offset-2">
              <button type="submit" class="btn btn-primary btn-add">Add</button>
              <button type="button" (click)="clearData()" class="btn btn-secondary btn-add">Reset</button>
            </div>
          </div>
        </form>
        <!-- DECK TABLE -->
        <table class="table table-fixed table-sm">
          <thead>
            <tr class="tr-border">
              <th class="col-lg-2">Color</th>
              <th class="col-lg-2">Cost</th>
              <th class="col-lg-8">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let card of deck.cards">
              <td class="col-2">{{card.color}}</td>
              <td class="col-2">{{card.cost}}</td>
              <td class="col-3">{{card.type}}</td>
              <td class="col-5"><a (click)="deleteCard(card)" href="javascript:void(0)" class="badge badge-danger">X</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="col-6">
        <app-stacked-barchart *ngIf="chartData" 
          [data]="chartData" 
          [segments]="colorOpts"
          [segmentColors]="colorValues"
          [xIndices]="chartIndices"></app-stacked-barchart>
      </div> 
    </div>
  </div>
  
  
  `,
  styles: [
    `
  .btn-add{
    margin-top: 32px;
  }
  .tr-border{
    /*border-bottom: 1px solid white;*/
  }
  .container{
    width: 100%;
  } 

  /*https://bootsnipp.com/snippets/oVlgM   fixed table header*/
  .table-fixed thead {
    width: 100%; 
  }
  .table-fixed tbody {
    height: 420px;
    overflow-y: auto;
    width: 100%;
  }
  .table-fixed thead, .table-fixed tbody, .table-fixed tr, .table-fixed td, .table-fixed th {
    display: block;
  }
  .table-fixed tbody td, .table-fixed thead > tr> th {
    float: left;
    border-bottom-width: 0;
  }
  `
  ]
})
export class HomeComponent implements OnInit {
  private chartData: any;
  private chartIndices: Array<any>;
  private totalCards: number;
  private colorOpts: Array<string>;
  private selectedColor: string;
  private cardTypeOpts: Array<string>;
  private selectedCardType: string;
  private cardCostOpts: Array<string>;
  private selectedCardCost: string;
  private colorValues: Array<string>;

  public deck: Deck;

  constructor() {}

  ngOnInit() {
    this.deck = new Deck({});
    this.chartIndices = ['Land', '1', '2', '3', '4', '5', '6', '7+']
    this.colorOpts = this.deck.colorOpts;
    this.cardTypeOpts = this.deck.typeOpts;
    this.cardCostOpts = this.deck.costOpts;
    this.colorValues = ['#f2f9f8', '#1b2223', '#107c41', '#e6452d', '#137fb8', '#cbc2bf', '#c2b26b'];
    this.clearData();
  }

  // ==================================================================================================
  // button functions
  // ==================================================================================================
  // x (pill) button fn
  deleteCard(cardToDelete){
    this.deck.deleteCard(cardToDelete);
    this.updateChartData();
  }

  // add button fn
  public inputData() {
    console.log('input data');
    // if(this.deck.length >= 60) return;
    let input: any = {};
    input.cost = this.selectedCardCost;
    input.color = this.selectedColor;
    input.type = this.selectedCardType;

    let card = new Card(input);
    // push card to deck (table)
    this.deck.addCard(card);
    // add to chart data
    this.updateChartData();
  }

  // reset button fn
  public clearData() {
    console.log('clear');
    this.deck.reset();
    this.chartData = this.deck.countColorTotals();
  }

  // ==================================================================================================
  // helper functions
  // ==================================================================================================
  // method required to update chart rendering due to onChanges implementation in chart component
  private updateChartData() {
    this.chartData = this.deck.countColorTotals();
  }

  // ==================================================================================================
  // typeahead code
  // ==================================================================================================
  @ViewChild('colorInput') colorInput: NgbTypeahead;
  @ViewChild('costInput') costInput: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 0 ? []
        : this.colorOpts.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));

  searchColorOpts = (text$: Observable<string>) =>
  text$
    .debounceTime(200).distinctUntilChanged()
    .merge(this.focus$.do(() => console.log(this.focus$)))
    .merge(this.click$.filter(() => !this.colorInput.isPopupOpen() && !this.costInput.isPopupOpen()))
    .map(term => (term === '' ? this.colorOpts : this.colorOpts.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10));

  searchCostOpts = (text$: Observable<string>) =>
  text$
    .debounceTime(200).distinctUntilChanged()
    .merge(this.focus$)
    .merge(this.click$.filter(() => !this.costInput.isPopupOpen()))
    .map(term => (term === '' ? this.cardCostOpts : this.cardCostOpts.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10));

}
