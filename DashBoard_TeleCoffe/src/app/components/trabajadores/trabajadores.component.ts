import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.component.html',
  styleUrls: ['./trabajadores.component.css']
})
export class TrabajadoresComponent implements OnInit {
  userForm!: FormGroup;
  showPassword: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) { // aquí comparamos las dos contraseñas
    let pass = group.get('password')!.value;
    let confirmPass = group.get('confirmPassword')!.value;
  
    return pass === confirmPass ? null : { notSame: true }     
  }

  generateRandomPassword(): void {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    const passwordLength = 8;
  
    for (let i = 0; i < passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
  
    this.userForm.patchValue({
      password: password,
      confirmPassword: password 
    });
  
    this.showPassword = true;
  }
  

  onSubmit() {
    if(this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}