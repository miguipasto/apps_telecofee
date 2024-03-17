import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  currentPageClass: string | undefined;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
   
  }
}
