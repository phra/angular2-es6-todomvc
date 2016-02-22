import {Component} from 'angular2/core';
import {Servizio} from '../services/servizio';
import CountTPL from './count.html';

@Component({
  selector: 'count',
  template: CountTPL
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
