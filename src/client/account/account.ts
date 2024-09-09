import { announcement, pageloaded } from "../main";
import { createform, Data } from "../public/js/form";
function accountpageload() {
    fetch(`/v1/account`, {
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {
            if (data == undefined || data == null || Object.keys(data).length === 0) {
                announcement("Error", "You are not logged in.", "danger", false);
                return;
            }

            const envhints: Data = {
                "Account Details": {
                    type: "header",
                    value: "Account Details",
                    description: "Your account details",
                    required: false,
                },
                "Username": {
                    type: "text",
                    description: "Your username",
                    required: true,
                    value: data.username,
                },
                "Password": {
                    type: "password",
                    description: "Your Password. Leave blank to keep the same password.",
                    required: false,
                    hint: "Leave blank for same password",
                },
            };
            
            createform(envhints);
        });
}

function accountsubmit() {
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

    fetch(`/v1/account/edit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.status == "OK") {
                announcement("Success", "Your account has been updated.", "success", true);
                window.location.href = `/logout?next=/login&afterlogin=${window.location.pathname}&reason=accountchange`;
            } else {
                announcement("Error", data.error, "danger", true);
            }
        });
}

function onPageLoad() {
    accountpageload();
    pageloaded();
}

window.onload = onPageLoad;
declare global {
    interface Window {
        accountsubmit: any;
    }
}

window.accountsubmit = accountsubmit;
