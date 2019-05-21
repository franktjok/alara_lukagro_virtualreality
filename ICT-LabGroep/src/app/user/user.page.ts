import { Component, OnInit } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';



@Component({
  selector: 'app-user',
  templateUrl: 'user.page.html',
  styleUrls: ['user.page.scss'],
})
export class UserPage {


  constructor(public navCtrl: NavController, private menuCtrl: MenuController) {
    this.menuCtrl.enable(true);
  }
}
