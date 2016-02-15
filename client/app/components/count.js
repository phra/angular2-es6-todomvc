import {Component} from 'angular2/core';
import {Servizio} from '../services/servizio';

@Component({
  selector: 'count',
  template: `<p>{{TEXT}} -> <strong>{{count}}</strong></p>
    <button (click)="dec()">-1</button>
  `
})

export class Count {
  _TEXT = 'COUNT';
  _servizio;

  constructor(servizio : Servizio) {
    this._servizio = servizio;
  }

  get count() {
    return this._servizio.count;
  }

  get TEXT() {
    return this._TEXT;
  }

  dec() {
    this._servizio.dec();
  }
}
