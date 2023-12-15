
# hearme station
[![hearme station](docs/imgs/feedback_kiosk.png)](http://hearme.vn)

## Description

The **hearme station** module is an open-source repository that empowers clients to customize the UI and application logic according to their needs. This module enables users to create feedback kiosks tailored to their specific requirements. It is an integral part of the **hearme** CXM platform, providing a comprehensive suite of tools for collecting and analyzing customer feedback.

- **hearme station** is an open-source hybrid mobile application designed for collecting customer feedback. It utilizes services from the **hearme** platform, offering a complete set of tools for collecting and analyzing customer feedback.

- To begin using **hearme station**, you need to register an account on the **hearme** website at [hearme.vn](https://hearme.vn). Once registered, you can configure your account following the steps provided on the onboarding page.

- With **hearme station**, you can tailor the feedback screen to align with your brand or intercept feedback events before and after sending feedback. Every feedback logic is processed, and you can configure questionnaires in the administration application.

- You can manage your feedback through the **hearme** web application at [hearme.vn/zeus](https://hearme.vn/zeus) or by installing the **hearme CXM** mobile app on your iOS or Android device.

- This project uses the Ionic 2 framework.


## hearme architechture
![hearme architectur](docs/imgs/hearme_components.png)


## Demonstration:
- Kiosk feedback channel: https://www.youtube.com/watch?v=e7KJPQUzvDc
- You can configure questions, image, and trademark as you want: https://www.youtube.com/watch?v=uzsVHHXlpNY

## Help for developing application:

1. **Full Programming APIs:** [Hearme for Developers APIs version 2.0.1](https://hearme.vn/help/statics/hearme_dev_APIs_v2.0.1.pdf)
2. **Integration for Online feedback Channel:** [Hearme for Online Channel 2.0.1](https://hearme.vn/help/statics/hearme_dev_APIs_ONLINE_v2.0.1.pdf)
3. **Integration for feedback Kiosk:** [Hearme for Kiosk Channel 2.0.1](https://hearme.vn/help/statics/hearme_dev_APIs_SYN_v2.0.1.pdf)
4. **Integration with Zapier:** [Hearme - Zapier Integration](https://hearme.vn/help/statics/hearme-zapier-documentation_202208.pdf)
5. **Help:** [Other integration](https://hearme.vn/help/en/integration/)

# Steps to collect feedback through feedback kiosk

## Enviroment requirements for this project
- Nodejs >= 8.17
- Ionic >= 2


## Run poroject

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

## Getting started to collect feedbacks with hearme platform

1. Register a **hearme** account at website [hearme.vn](https://hearme.vn/) 
2. Once you have registered, you can configure your account as steps guided in the onboarding page. Please look for detail information in [help page](https://hearme.vn/help/en/implementation/)

3. Create and get QR code for kiosk device [Kiosk channel device](https://hearme.vn/help/en/admin/#kiosk-survey-channel)
4. Run mobile app from this project, then scan QR generated in step 3. Now you are ready to leave feedback with device.

5. You can attach extra information to feedback by integration. Please refer information at: [Hearme for Kiosk Channel 2.0.1](https://hearme.vn/help/statics/hearme_dev_APIs_SYN_v2.0.1.pdf)


# hearme versions and roadmap

## Version 4.x - Upcoming with AI
- CX Expert Assistant powered by AI for CX practitioners
- Employee Assistant
- Customer Assistant integrated into feedback channels

## Version 3.x
This software version brings significant improvements in user experience and introduces many important features:

- On-boarding page: helps new users easily understand and configure the system step by step.
- Dashboard system: helps administrators quickly grasp system performance and important information up to the current moment.
- Correlation data analysis: helps business leaders identify important factors and positive factors affecting customer satisfaction, thereby helping businesses come up with plans to improve customer satisfaction scores.
- System to support survey question setup: allows the creation of survey sets from sample surveys for each field, export/import survey configuration data, and preview survey screens directly on the management system. Configuring survey questions is also easier and more straightforward.
- Survey analysis features are also upgraded for a better user experience.
- System for managing alert messages and system notification messages.

## Version 2.6.0
- Integration with multi-channel sales system: nhanh.vn
- Providing an interface for system integration via Zapier
- Improved security for the hook registration function in the hearme system
- Optimized the submission of evaluation data when the device has an unstable connection

# Support information

Whenever you have a support request, you can reach out to Hearme using the following methods:

1. **Help document:** [https://hearme.vn/help/en/](https://hearme.vn/help/en/)
2. **Facebook:** [https://fb.com/hearme.vn](https://fb.com/hearme.vn)
3. **FAQs:** [http://Support.hearme.vn](http://support.hearme.vn)
4. **Email for assistance:** [contact@hearme.vn](mailto:contact@hearme.vn)