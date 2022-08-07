self.addEventListener("push", e => {
    const json = e.data.json();
    void self.registration.showNotification(
        "!!! DEDЛАЙН !!!",
        {
            body: json.body,
            image: "https://www.workflow-ctf.ninja/images/DEADLINE.jpg"
        }
    );
});