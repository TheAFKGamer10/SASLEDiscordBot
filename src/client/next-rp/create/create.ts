import { announcement, pageloaded } from "../../main";
import { createform, Data } from "../../public/js/form";
async function rpcreatepageloaded() {
    let data: Data = {
        "AOP": {
            type: "text",
            required: true,
            description: "The planed Area of Patrol for the server",
            hint: "Los Santos, Blaine County, Statewide, etc.",
        },
        "Timestamp": {
            type: "text",
            required: true,
            descriptionusehtml: true,
            description: 'When should the RP start. Accepts <a href="https://www.unixtimestamp.com/" target="_blank">Unix Timestamps</a> and relative time.<br />Relative: days:hours:minutes (Ex. 1:12:30 = 1 day, 12 hours, 30 minutes) or just minutes (Ex. 90 = 90 minutes)',
            hint: "1:12:30 or 1713589200",
        },
        "Ping": {
            type: "checkbox",
            description: "Ping the server when you submit the form",
            required: false,
            options: [
                {
                    value: "true",
                    text: "",
                    checked: true,
                },
            ],
        },
        "Training": {
            type: "checkbox",
            required: true,
            description: "Will training be happening during this RP",
            options: [
                {
                    value: "true",
                    text: "",
                    checked: true,
                },
            ],
        },
        "Ping At RP Time": {
            type: "checkbox",
            required: true,
            description: "Should the server be pinged at the RP time",
            options: [
                {
                    value: "true",
                    text: "",
                    checked: true,
                },
            ],
        },
    };

    createform(data);
}

async function createrpsubmit() {
    window.scrollTo({ top: 0, behavior: "smooth" });

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

    fetch(`/v1/bot/rp/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(async (data) => {
            if (data.status == "OK") {
                window.location.href = `/next-rp?created=rp`;
            } else {
                announcement("Error!", `An error occurred while submitting the information! Please check the console for error details. ${data.message != undefined ? `<br />Error: ${data.message}` : ""}`, "danger", true);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            announcement("Error!", `An error occurred while submitting the config! Please check the console for error details. ${error != undefined ? `<br />Error: ${error}` : ""}`, "danger", true);
        });
}

function onPageLoad() {
    rpcreatepageloaded();
    pageloaded();
}

window.onload = onPageLoad;
declare global {
    interface Window {
        createrpsubmit: any;
    }
}

window.createrpsubmit = createrpsubmit;
