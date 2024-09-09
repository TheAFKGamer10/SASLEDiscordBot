import { announcement, pageloaded } from "../main";
function loginpageloaded() {
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

function onPageLoad() {
    loginpageloaded();
    pageloaded();
}

window.onload = onPageLoad;
declare global {
    interface Window {
        login: any;
    }
}

window.login = login;
