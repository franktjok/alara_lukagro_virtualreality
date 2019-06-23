import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  page;

  constructor(private events: Events,
                  private navParams: NavParams,
                  private popoverController: PopoverController) { }

  ngOnInit() {
  this.page = this.navParams.get('data');
  }

  eventFromPopover() {
      this.events.publish('fromPopoverEvent');
      this.popoverController.dismiss();
    }

}
