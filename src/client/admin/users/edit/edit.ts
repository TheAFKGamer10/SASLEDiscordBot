import { announcement, pageloaded } from "../../../main";
import { createform, Data } from "../../../public/js/form";
async function usereditpageloaded() {
    fetch(`/v1/users/get?id=${new URLSearchParams(window.location.search).get('id')}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(async user => {
            if (user.status === 'error') {
                if (user.message === 'User not found') {
                    (document.getElementById('sumbitbtn') as HTMLButtonElement).style.display = 'none';
                    (document.getElementById('config') as HTMLDivElement).innerHTML = `<h1 style="color: red;">User not found!</h1>`;
                    announcement('Error', 'User not found!', 'danger', false);
                    return;
                }
                announcement('Error', user.message, 'danger', false);
                return;
            }
            fetch(`/v1/users/perms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(async roles => {

                    let data: Data = {
                        "Username": {
                            "type": "text",
                            "description": "The username of the user.",
                            "required": true,
                            "value": user.username
                        },
                        "Password": {
                            "type": "text",
                            "description": "The password of the user.",
                            "required": false,
                            "hint": "Leave blank for same password"
                        },
                        "Permission": {
                            "type": "dropdown",
                            "description": "The permission of the user.",
                            "options": roles,
                            "required": true,
                            "value": user.permission.value
                        }
                    };

                    createform(data);
                });
        });
};


async function userseditsubmit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

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

    data.id = new URLSearchParams(window.location.search).get('id');

    fetch(`/v1/users/edit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(async data => {
            if (data.status == 'OK') {
                window.location.href = '/admin/users?reason=edited';
            } else {
                announcement(
                    "Error!",
                    data.message || `An error occurred while submitting the config! Please check the console for error details. ${(data != undefined) ? `<br />Error: ${data}` : ""}`,
                    "danger",
                    true
                );
            }
        })
        .catch((error) => {
            announcement(
                "Error!",
                `An error occurred while submitting the config! Please check the console for error details. ${(error != undefined) ? `<br />Error: ${error}` : ""}`,
                "danger",
                true
            );
        });

}

function onPageLoad() {
    usereditpageloaded();
    pageloaded();
}

window.onload = onPageLoad;
declare global {
    interface Window {
        userseditsubmit: any;
    }
}

window.userseditsubmit = userseditsubmit;
