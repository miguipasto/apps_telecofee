import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.component.html',
  styleUrls: ['./trabajadores.component.css']
})
export class TrabajadoresComponent implements OnInit {
  userForm!: FormGroup;
  showPassword: boolean = false;
  users: any;

  constructor(private fb: FormBuilder, public firebaseService: FirebaseService, public backendService: BackendService) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.checkPasswords });

    this.getUsers();
  }

  checkPasswords(group: FormGroup) { // aquí comparamos las dos contraseñas
    let pass = group.get('password')!.value;
    let confirmPass = group.get('confirmPassword')!.value;
  
    return pass === confirmPass ? null : { notSame: true }     
  }

  generateRandomPassword(): void {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    const passwordLength = 6;
  
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

  getUsers(){
    this.firebaseService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({
          ...user,
          create_at: this.convertirFecha(user.create_at),
        }));
        console.log(this.users);
      },
      error: (error) => console.error(error),
      complete: () => console.log('Completed')
    });
  }
  
  convertirFecha(fechaFirestore: { seconds: number; nanoseconds: number }): string {
    const fecha = new Date(fechaFirestore.seconds * 1000);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
  
  

  onSubmit() {
    if (this.userForm.valid) {
      const { nombre, apellidos, email, password } = this.userForm.value;
      // Creamos el usuario en Firebase Auth
      this.firebaseService.registerUserAuth(email, password)
        .then(result => {
          const uid = result.user.uid; 
          return this.firebaseService.registerUserFireStore(uid, nombre, apellidos, email);
        })
        .then(() => {
          alert("Usuario creado correctamente")
          console.log('Usuario registrado con éxito en Firestore');
        })
        .catch(error => {
          console.error('Error registrando el usuario: ', error);
        });
    } else {
      console.log('Formulario no válido');
    }
  }

  reset_password(email : string){
    this.firebaseService.resetPassword(email).subscribe({
      next: () => alert('Correo de restablecimiento enviado.'), 
      error: (error) => console.error('Error enviando correo de restablecimiento:', error),
    });
  }
  

  delete_account(user_id: any){
    this.backendService.deleteUser(user_id).subscribe({
      next: (compras) => {
        alert("Usuario eliminado correctamente.")
        this.getUsers();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
  
}