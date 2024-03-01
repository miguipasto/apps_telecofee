import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignUpPage } from './signup.page';

describe('SignUpPage', () => {
  let component: SignUpPage;
  let fixture: ComponentFixture<SignUpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignUpPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
