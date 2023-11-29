# Description
- This is an open source hybrid mobile application for collecting customer feedbacks.
- It uses service from hearme platform.
- You must register account in website: https://hearme.vn. And then configure account as steps guided in onboarding page 
- With hearme station, you can modify feedback screen as you want to satisfy you brand or intercept feedback event: before and after sending feedback. Every feedback logic is processed, and you can configure questionaire in administration application.
- You can adminis your feedback through web application at: https://hearme.vn/zeus or just install mobile app: hearme CXM (in both iOS and Android OS)

This project use Ionic 2 framework

# Demonstration:
- Kiosk feedback channel: https://www.youtube.com/watch?v=e7KJPQUzvDc
- You can configure questions, image, and trademark as you want: https://www.youtube.com/watch?v=uzsVHHXlpNY


## Enviroment requirements
- Nodejs >= 8.17
- Ionic >= 2


### Running with Ionic CLI:

Install and start web platform

```bash
$ sudo npm install -g ionic cordova
$ ionic serve
```

Run in ios mobile platform:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.

Build to release:

```
$ ionic cordova plugin rm cordova-plugin-console  # remove it before generating the release builds
$ ionic cordova build --release android
```

# Current version 3.5.0
- Adjust notification message for NPS: change max score from 11 to 10 (0-10)
- Update labels in thank pages
- Add field severity to feedback
- Improve form based UI
- Get focus and open keyboard for open question page and contact page
- Setting little bit delay before emiting event
- Default sound when there is not thank page

# Contact and support
hearme Limited company

Add: Toong office, 3th Floor, No. 8 Trang Thi, Hoan Kiem Dist., Hanoi, Vietnam

Tel: +84 24 66 635 539

Mobile: +84 912 083 463

Email: contact@hearme.vn 

Website: https://hearme.vn