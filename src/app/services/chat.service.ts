import { HttpClient } from '@angular/common/http';
import { Injectable, NgModuleRef } from '@angular/core';
import { environment } from 'src/environments/environment.ts';
import { User } from '../models/user';
import { HubConnection } from '@microsoft/signalr';
import { HubConnectionBuilder } from '@microsoft/signalr/dist/esm/HubConnectionBuilder'
import { Message } from '../models/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  myName: string = '';
  onlineUsers: string[] = [];
  messages: Message[] = [];
  privateMessages: Message[] = [];
  private chatConnection?: HubConnection;
  privateMessageInitiated = false;

  constructor(private httpClient: HttpClient, private modelService: NgbModal) { }

  registerUser(user: User) {
    return this.httpClient.post(`${environment.apiUrl}api/chat/register-user`, user, { responseType: 'text' });
  }

  createChatConnection() {
    this.chatConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}hubs/chat`).withAutomaticReconnect().build();
    this.chatConnection.start().catch(error => {
      console.log(error)
    })

    this.chatConnection.on('UserConnected', () => {
      this.addUserConnectionId();
    })

    this.chatConnection.on('OnlineUsers', (onlineUsers) => {
      this.onlineUsers = [...onlineUsers];
    })

    this.chatConnection.on('newMessage', (newMessage: Message) => {
      this.messages = [...this.messages, newMessage]
    })

    this.chatConnection.on('OpenPrivateChat', (newMessage: Message) => {
      this.privateMessages = [...this.privateMessages, newMessage]
      this.privateMessageInitiated = true;
      const modelRef = this.modelService.open(PrivateChatComponent)
      modelRef.componentInstance.toUser = newMessage.from;

    })

    this.chatConnection.on('NewPrivateMessage', (newPrivateMessage: Message) => {
      this.privateMessages = [...this.privateMessages, newPrivateMessage]
    })

    this.chatConnection.on('ClosePrivateChat', (newMessage: Message) => {
      this.privateMessages = []
      this.privateMessageInitiated = false;
      this.modelService.dismissAll()


    })

  }

  stopChatConnection() {
    this.chatConnection?.stop().catch(error => console.log(error));
  }

  async addUserConnectionId() {
    return this.chatConnection?.invoke('AddUserConnectionId', this.myName)
      .catch(error => { console.log(error) });
  }

  async sendMessage(content: string) {
    const message: Message = {
      from: this.myName,
      content: content
    }
    return this.chatConnection?.invoke('ReceiveMessage', message)
      .catch(error => console.log(error));
  }

  async sendPrivateMessage(to: string, content: string) {
    const message: Message = {
      from: this.myName,
      content: content,
      to: to
    }
    if (!this.privateMessageInitiated) {
      this.privateMessageInitiated = true;
      return this.chatConnection?.invoke('CreatePrivateChat', message).then(() => {
        this.privateMessages = [...this.privateMessages, message]
      })
        .catch(error => console.log(error));
    } else {
      return this.chatConnection?.invoke('ReceivePrivateMessage', message)
        .catch(error => console.log(error));
    }

  }

  async closePrivateChatMessage(otherUser: string) {
    return this.chatConnection?.invoke('RemovePrivateChat', this.myName, otherUser)
      .catch(error => console.log(error));
  }


}
