import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Device } from '@ionic-native/device';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule, Http } from '@angular/http';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { Autostart } from '@ionic-native/autostart';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Dialogs } from '@ionic-native/dialogs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { IonicStorageModule } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { NativeAudio } from '@ionic-native/native-audio';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry } from '@ionic-native/file';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { Network } from '@ionic-native/network';

import { MyApp } from './app.component';
import { Config } from './config';

import { LoginPage } from '../pages/login/login';
import { ThanksPage } from '../pages/thanks/thanks';
import { FactorsInfoPage } from '../pages/factors-info/factors-info';
import { IdlePage } from '../pages/idle/idle';
import { CollectionPage } from '../pages/collection/collection';
import { TabsPage } from '../pages/tabs/tabs';
import { MessagePage } from '../pages/message/message';
import { WelcomePage } from '../pages/welcome/welcome';
import { IndexSurveyPage } from '../pages/index-survey/index-survey';
import { SupportSurveyPage } from '../pages/support-survey/support-survey';
import { CameraPage } from '../pages/camera/camera';

import { AuthService } from '../providers/auth-service/auth-service';
import { AppInit } from '../providers/app-init/app-init';
import { SqliteProvider } from '../providers/sqlite/sqlite';
import { Youtube } from '../pipes/youtube/youtube';
import { HttpService } from '../providers/feedback-service/http-service';
import { EventService } from '../providers/feedback-service/event-service';
import { FeedbackService} from '../providers/feedback-service/feedback-service';
import { BaseService} from '../providers/feedback-service/base-service';
import { Util} from '../providers/feedback-service/utils';

import { IonRating } from '../components/ion-rating/ion-rating';
import { IonfooterComponent } from '../components/ionfooter/ionfooter';
import { HeaderComponent } from '../components/header/header';
import { CSATComponent } from '../components/csat/csat';
import { CESComponent } from '../components/ces/ces';
import { NPSComponent } from '../components/nps/nps';
import { FLXComponent } from '../components/flx/flx';
import { STARSComponent } from '../components/stars/stars';
import { MULTISELECTIONComponent } from '../components/multi-selection/multi-selection';
import { SINGLESELECTIONComponent } from '../components/single-selection/single-selection';
import { TextComponent } from '../components/text/text';
import { FormBasedComponent } from '../components/form-based/form-based';
import { ContactComponent } from '../components/contact/contact';
import { UploaderComponent, ViewImagePage } from '../components/uploader/uploader';
import { INFOComponent } from '../components/info/info';

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        ThanksPage,
        FactorsInfoPage,
        IdlePage,
        CollectionPage,
        TabsPage,
        Youtube,
        IonRating,
        MessagePage,
        WelcomePage,
        IndexSurveyPage,
        SupportSurveyPage,
        CameraPage,
        ViewImagePage,
        IonfooterComponent,
        HeaderComponent,
        CSATComponent,
        CESComponent,
        NPSComponent,
        FLXComponent,
        STARSComponent,
        MULTISELECTIONComponent,
        SINGLESELECTIONComponent,
        TextComponent,
        FormBasedComponent,
        ContactComponent,
        UploaderComponent,
        INFOComponent
        
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        HttpModule,
        NgxQRCodeModule,
        TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [Http]
        }
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        LoginPage,
        ThanksPage,
        FactorsInfoPage,
        IdlePage,
        CollectionPage,
        TabsPage,
        MessagePage,
        WelcomePage,
        IndexSurveyPage,
        SupportSurveyPage,
        CameraPage,
        ViewImagePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        Config,
        AuthService,
        AppInit,
        Device,
        AndroidFullScreen,
        Autostart,
        ScreenOrientation,
        Dialogs,
        BarcodeScanner,
        NativeAudio,
        Camera,
        File,
        SqliteProvider,
        Toast,
        FeedbackService,
        BaseService,
        Util,
        HttpService,
        EventService,
        Network
    ]
})
export class AppModule {}


export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
