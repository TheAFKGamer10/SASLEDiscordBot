import { announcement, pageloaded } from "../../../main";
import { createform, Data } from "../../../public/js/form";
async function userscreatepageloaded() {
    fetch(`/v1/users/perms`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then(async (roles) => {
            let data: Data = {
                Username: {
                    type: "text",
                    description: "The username of the user.",
                    required: true,
                },
                Password: {
                    type: "text",
                    description: "The password of the user.",
                    required: true,
                },
                Permission: {
                    type: "dropdown",
                    description: "The permission of the user.",
                    options: roles,
                    required: true,
                },
            };

            createform(data);
        });
}

async function userscreatesubmit() {
    let data = {} as { [key: string]: any };
    let inputs = document.getElementsByClassName("input") as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type === "checkbox") {
            data[inputs[i].id.replace("input_", "").toLowerCase().replace(/\s/g, "")] = inputs[i].checked;
        } else {
            data[inputs[i].id.replace("input_", "").toLowerCase().replace(/\s/g, "")] = inputs[i].value;
        }

        if (inputs[i].required && inputs[i].value == "") {
            announcement("Error!", `Fields marked with stars are required!`, "warning", true);
            return;
        }
    }

    fetch(`/v1/users/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(async (data) => {
            if (data.status == "OK") {
                window.location.href = "/admin/users?reason=created";
            } else {
                announcement("Error!", data.message || `An error occurred while submitting the config! Please check the console for error details. ${data != undefined ? `<br />Error: ${data}` : ""}`, "danger", true);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            announcement("Error!", `An error occurred while submitting the config! Please check the console for error details. ${error != undefined ? `<br />Error: ${error}` : ""}`, "danger", true);
        });
}

function onPageLoad() {
    userscreatepageloaded();
    pageloaded();
}

window.onload = onPageLoad;
declare global {
    interface Window {
        userscreatesubmit: any;
    }
}

window.userscreatesubmit = userscreatesubmit;
