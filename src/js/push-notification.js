import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Capacitor } from "@capacitor/core";

async function registerPushNotification() {
    try {
        if (Capacitor.isNativePlatform()) {
            if (Capacitor.getPlatform() === 'ios') {
                notificationAction();
            } else if (Capacitor.getPlatform() === 'android') {
                const checkPermissions = await FirebaseMessaging.checkPermissions();
                console.log("checkPermissions : " + JSON.stringify(checkPermissions))
                if (checkPermissions.receive == 'granted') {
                    notificationAction();
                } else {
                    // BT-104636 Google play store change for apk related, Samadhan S, 07/08/2023 : Start
                    setTimeout(async () => {
                        const requestPermissions = await FirebaseMessaging.requestPermissions();
                        if (requestPermissions.receive) {
                            notificationAction();
                        }
                    }, 5000);
                    // BT-104636 Google play store change for apk related, Samadhan S, 07/08/2023 : End
                }
            }
        }
    } catch (error) {
        console.log("Error : Failed to retrieve the details on the permission", error);
    }
}

function subscribeDefaultTopics() {
    try {
        let _defaultTopics = ['all', 'android', 'ios'];
        for (let index = 0; index < _defaultTopics.length; index++) {
            if (Capacitor.getPlatform() === 'android' && _defaultTopics[index].indexOf('ios') >= 0) {
                continue;
            }
            if (Capacitor.getPlatform() === 'ios' && _defaultTopics[index].indexOf('android') >= 0) {
                continue;
            }
            FirebaseMessaging.subscribeToTopic({ topic: _defaultTopics[index].toString() }).then(() => {
                alert("FCM Topic subscribed");
            }).catch((error) => {
                console.log("FCM Error in subscribe default topic ", error);
            });
        }
    } catch (error) {
        console.log("In catch, FCM Error in subscribe default topic ", error);
    }
}

function notificationAction() {
    try {
        //tokenReceived Listner called when new FCM token is received
        FirebaseMessaging.addListener('tokenReceived', (event) => {
            alert("tokenReceived : " + JSON.stringify(event));
            subscribeDefaultTopics();
        });
        FirebaseMessaging.addListener('notificationReceived', (event) => {
            alert('notificationReceived ' + JSON.stringify(event));
        });
        FirebaseMessaging.addListener('notificationActionPerformed', event => {
            alert('notificationActionPerformed ' + JSON.stringify(event));
        });

    } catch (error) {
        alert("notificationAction error : " + error);
    }
}

// Call the initializeApp function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', registerPushNotification);