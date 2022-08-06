self.addEventListener("push", e => {
    console.log(e, e.data);
    void self.registration.showNotification(
        "SSA", // title of the notification
        {
            body: "Push notification from section.io", //the body of the push notification
            image: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
            icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/" // icon
        }
    );
});