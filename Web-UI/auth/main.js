async function login() {
    function announcement(h1, p, type, shouldtimeout) { // type: success, danger, warning, info
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('announcement').style.display = 'flex';
        document.getElementById('announcement-text-h1').innerHTML = h1;
        document.getElementById('announcement-text-p').innerHTML = p;
        document.getElementById("announcement").className = `announcement ${type}`;
        if (shouldtimeout) {
            setTimeout(closeAnnouncement, 5 * 1000);
        }
    }

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let next = new URLSearchParams(window.location.search).get("next");
    fetch(`/v1/process-login${next !== '' && next !== null ? `?next=${next}` : ''}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "username": username, "password": password }),
    })
        .then((response) => response.text())
        .then((data) => {
            data = JSON.parse(data);
            if (data.status === "OK") {
                window.location.href = next !== '' && next !== null ? next : '/admin';
            } else {
                announcement("Error", data.message, "danger", true);
            }
        });
};
