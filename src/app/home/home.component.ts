import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userForm: FormGroup = new FormGroup({});
  submitted = false;
  openChat = false;
  error = '';
  constructor(private formBuilder: FormBuilder, private chatService: ChatService) {

  }
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    })
  }

  submitForm() {
    this.error = '';
    this.submitted = true;
    if (this.userForm.valid) {
      this.chatService.registerUser(this.userForm.value).subscribe(
        () => {
          this.chatService.myName = this.userForm.get('name')?.value;
          this.openChat = true;
          this.userForm.reset();
          this.submitted = false;
        },
        error => {
          this.error = "This user already exist";
        },
        () => {
          // 'onCompleted' callback.
          // No errors, route to new page here
        }
      );
    }
  }

  closeChat() {
    this.openChat = false;
  }

}