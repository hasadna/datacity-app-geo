import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-info-pane',
  templateUrl: './info-pane.component.html',
  styleUrls: ['./info-pane.component.less']
})
export class InfoPaneComponent implements OnInit, OnChanges {

  @Input() row: any;
  @Output() clear = new EventEmitter<void>();

  config: any = null;

  constructor(private content: ContentService) { 
    content.configuration.subscribe((config) => {
      this.config = config;
    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    console.log('changed!', this.row);
  }

}
