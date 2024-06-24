function loginpageloaded() {
    function announcement(h1: string, p: string, type: string, shouldtimeout: boolean) { // type: success, danger, warning, info
        window.scrollTo({ top: 0, behavior: 'smooth' });
        (document.getElementById('announcement') as HTMLDivElement).style.display = 'flex';
        (document.getElementById('announcement-text-h1') as HTMLHeadingElement).innerHTML = h1;
        (document.getElementById('announcement-text-p') as HTMLParagraphElement).innerHTML = p;
        (document.getElementById("announcement") as HTMLDivElement).className = `announcement ${type}`;
        if (shouldtimeout) {
            setTimeout(closeAnnouncement, 5 * 1000);
        }
    }
    
    let reason = new URLSearchParams(window.location.search).get("reason");
    if (reason == "accountchange") {
        announcement("Success", "You have successfully changed your account details.<br />Please log back in with the new information.", "success", true);
    }
    if (reason == "logout") {
        announcement("Success", "You have successfully logged out.", "success", true);
    }
    if (reason == "restricted") {
        announcement("Error", "You must be logged in to access this page.", "danger", true);
    }

}    

async function login() {
    function announcement(h1: string, p: string, type: string, shouldtimeout: boolean) { // type: success, danger, warning, info
        window.scrollTo({ top: 0, behavior: 'smooth' });
        (document.getElementById('announcement') as HTMLDivElement).style.display = 'flex';
        (document.getElementById('announcement-text-h1') as HTMLHeadingElement).innerHTML = h1;
        (document.getElementById('announcement-text-p') as HTMLParagraphElement).innerHTML = p;
        (document.getElementById("announcement") as HTMLDivElement).className = `announcement ${type}`;
        if (shouldtimeout) {
            setTimeout(closeAnnouncement, 5 * 1000);
        }
    }

    let username = (document.getElementById("username") as HTMLInputElement).value;
    let password = (document.getElementById("password") as HTMLInputElement).value;
    let next = new URLSearchParams(window.location.search).get("next");
    fetch(`/v1/process-login`, { //${next !== '' && next !== null ? `?next=${next}` : ''}
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "username": username, "password": password}),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status == "OK") {
                window.location.href = next !== '' && next !== null ? next : '/';
            } else {
                announcement("Error", data.message, "danger", true);
            }
        });
};