import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeSnackPage } from './home-snack.page';

describe('HomeSnackPage', () => {
  let component: HomeSnackPage;
  let fixture: ComponentFixture<HomeSnackPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeSnackPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeSnackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
