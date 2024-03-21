async function login() {
    function announcement(h1, p, type, shouldtimeout) { // type: success, danger, warning, info
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
    fetch(`/process-login${next !== '' && next !== null ? `?next=${next}` : ''}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "username": username, "password": password }),
    })
        .then((response) => response.text())
        .then((data) => {
            data = JSON.parse(data);
            console.log(data);
            if (data.status === "OK") {
                window.location.href = next !== '' && next !== null ? next : '/admin';
            } else {
                announcement("Error", data.message, "danger", true);
            }
        });
};



async function pageloaded() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) { changeld(); }

}
function changeld(isdark) {
    const ldbutton = document.getElementById("lightdarkbutton");
    const body = document.getElementById("body");
    if (body.classList.contains("dark") && isdark != "d") {
        body.classList.remove("dark");
        body.classList.add("light");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/img/sun.svg" height="25px" />`;
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/img/moon.svg" height="25px" />`;
    }
}

function closeAnnouncement() {
    document.getElementById('announcement').style.display = 'none';
}
