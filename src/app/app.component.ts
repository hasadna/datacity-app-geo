import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  selected: any = null;

  select(row) {
    console.log('selected', row);
    this.selected = row;
  }

}
