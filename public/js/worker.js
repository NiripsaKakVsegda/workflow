self.addEventListener("push", e => {
    console.log(e, e.data);
    void self.registration.showNotification(
        "AA", // title of the notification
        {
            body: "Push notification from section.io" //the body of the push notification
        }
    );
});