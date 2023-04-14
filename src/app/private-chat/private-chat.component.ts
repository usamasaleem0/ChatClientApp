import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css']
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  @Input() toUser = '';

  constructor(public _chatService: ChatService, public activeModel: NgbActiveModal) {

  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    this._chatService.closePrivateChatMessage(this.toUser);
  }

  sendMessage(content: string) {
    this._chatService.sendPrivateMessage(this.toUser, content)
  }

}
