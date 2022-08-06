self.addEventListener("push", e => {
    const json = e.data.json();
    void self.registration.showNotification(
        "!!! DEDЛАЙН !!!",
        {
            body: json.body,
            image: "http://127.0.0.1:5000/images/DEADLINE.jpg"
        }
    );
});