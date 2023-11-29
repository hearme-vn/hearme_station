import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SqliteProvider } from '../providers/sqlite/sqlite';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
    //@ViewChild('hearme') nav: NavController;

    rootPage:any = TabsPage;
    
    ngOnInit() {
        //console.log("Init application first time");
    }
    
    constructor(platform: Platform, 
		statusBar: StatusBar, 
		splashScreen: SplashScreen,
		sqlite:SqliteProvider ) {
			
        platform.ready().then(() => {
            statusBar.hide();
            splashScreen.hide();
            sqlite.openDb();
        });
    }
    
}

