import { Component, OnInit } from '@angular/core';
import { ContentService } from './content.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  selected: any = null;
  config: any = null;

  constructor(private content: ContentService) { 
    content.configuration.subscribe((config) => {
      this.config = config;
    });
  }

  select(row) {
    console.log('selected', row);
    this.selected = row;
  }

}
