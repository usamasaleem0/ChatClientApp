import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { StreamInvocationMessage } from '@microsoft/signalr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @Output() closeChatEmitter = new EventEmitter();


  constructor(public _chatService: ChatService, private modelService: NgbModal) {

  }
  ngOnDestroy(): void {
    this._chatService.stopChatConnection();
  }

  ngOnInit(): void {
    this._chatService.createChatConnection();
  }


  backToHome() {
    this.closeChatEmitter.emit();
  }

  sendMessage(content: string) {
    this._chatService.sendMessage(content);
  }

  openPrivateChat(toUser: string) {
    const modelRef = this.modelService.open(PrivateChatComponent);
    modelRef.componentInstance.toUser = toUser;
  }
}
