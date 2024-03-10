import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeDrinkPage } from './home-drink.page';

describe('HomeDrinkPage', () => {
  let component: HomeDrinkPage;
  let fixture: ComponentFixture<HomeDrinkPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeDrinkPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeDrinkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
