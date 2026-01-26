import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true, 
  imports: [FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  newUser: User = { name: '', email: '', password: '' };

  @Output() userAdded = new EventEmitter<User>();

  constructor(private userService: UserService) {}

  onSubmit() {
  if (!this.newUser.name || !this.newUser.email || !this.newUser.password) return;

  this.userService.addUser(this.newUser).subscribe({
    next: (user) => {
      this.userAdded.emit(user);
      this.newUser = { name: '', email: '', password: '' }; 
    },
    error: (err) => console.error('Erreur lors de l’ajout', err)
  });
}

}
