"use strict";

async function makeboxes() {
    function announcement(h1, p, type, shouldtimeout) { // type: success, danger, warning, info

        document.getElementById('announcement').style.display = 'flex';
        document.getElementById('announcement-text-h1').innerHTML = h1;
        document.getElementById('announcement-text-p').innerHTML = p;
        document.getElementById("announcement").className = `announcement ${type}`;
        if (shouldtimeout) {
            setTimeout(closeAnnouncement, 5 * 1000);
        }
    }

    const URL = window.location.origin;
    return fetch(URL + `/v1/config/get`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            if (data == null || data == undefined || data.status == 'error') {
                announcement(
                    "Error!",
                    `An error occurred while fetching the information! Please check the console for error details. ${(data.message != undefined) ? `<br />Error: ${data.message}` : ""}`,
                    "danger",
                    true
                );
                return "error";
            }
            fetch(URL + `/v1/config/envhints`, {
                method: 'GET'
            })
                .then(response => response.json())
                .then(envhints => {
                    const ifDEPARTMENTS = ["_DEPARTMENT_NAME", "_START_LETTER", "_ROLE_ID", "_PROBIB_ID"]

                    let form = document.getElementById('config');
                    form.innerHTML = ''; // Empty the div with id 'config'+

                    let ifdb = [];
                    Object.keys(envhints).forEach((key) => {
                        if (envhints[key]?.onlyifDB === true) {
                            ifdb.push(key);
                        }
                    });
                    console.log(ifdb);

                    Object.keys(data).forEach((key) => {
                        let ending = "";
                        ifDEPARTMENTS.forEach((suffix) => {
                            if (key.endsWith(suffix) && data.hasOwnProperty(key) && !Object.keys(envhints).includes(key)) {
                                ending = suffix;
                            }
                        });
                        if (ifdb.includes(key) || ifdb.includes(ending) && data.MYSQL_CONNECTION_STRING == "") {
                            console.log(key);
                            return;
                        } 
                        if (!Object.keys(envhints).includes(key)) {
                            envhints[key] = { type: "text", required: false, default: "", description: "", descriptionusehtml: false};
                        }

                        // Create a new div element
                        let div = document.createElement('div');
                        div.className = 'block';

                        // Create a new label element
                        let label = document.createElement('label');
                        label.for = key.replace(/_/g, ' ');
                        label.textContent = key.replace(/_/g, ' ');
                        label.className = 'inputlabel';

                        // Create a new description element
                        let description = document.createElement('p');
                        if (envhints[key]?.descriptionusehtml || envhints[ending]?.descriptionusehtml) {
                            description.innerHTML = envhints[key]?.description || envhints[ending]?.description || "";
                        } else {
                            description.textContent = envhints[key]?.description || envhints[ending]?.description || "";
                        }
                        description.id = `description_${key}`;
                        description.className = 'description';

                        // Create a new input element
                        let input = document.createElement('input');
                        input.className = 'input envinput';

                        input.type = envhints[key].type;
                        if (envhints[key]?.required || envhints[ending]?.required) {
                            input.required = true;
                        } else {
                            input.required = false;
                        }

                        if (ending != "") {
                            input.placeholder = envhints[ending].default;
                        } else {
                            input.placeholder = envhints[key].default;
                        }
                        input.id = `input_${key}`;
                        if (key == "MYSQL_CONNECTION_STRING") {
                            input.value = data[key].replace(/(mysql:\/\/[^:@]+:)[^:@]+(@[^:@]+:\d+\/[^:@]+)/, '$1*****$2');
                        } else {
                            input.value = data[key];
                        }
                        if (input.required) {
                            // Create a new span element
                            let span = document.createElement('span');
                            span.textContent = '*';
                            span.style = 'color: red;';
                            span.className = 'required red';
                            label.appendChild(span);
                        }

                        // Append the label, description, and input elements to the div
                        let textdiv = document.createElement('div');
                        textdiv.className = 'textdiv';
                        textdiv.appendChild(label);
                        textdiv.appendChild(description);
                        div.appendChild(textdiv);
                        div.appendChild(input);
                        // Append the div to the form
                        form.appendChild(div);
                    });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}

async function pageloaded() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) { changeld(); }

    makeboxes();
}

async function submit() {
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
    const URL = window.location.origin;

    const required = ["BOT_TOKEN", "CLIENT_ID", "GUILD_ID", "LOG_CHANNEL_ID", "LIST_OF_DEPARTMENTS", "COOKIE_SECRET"]
    const ifMYSQL = ["MYSQL_CONNECTION_STRING", 'JOIN_SERVER_ROLE_ID', "LEO_ROLE_ID", "CADET_ROLE_ID"]
    const ifDEPARTMENTS = ["_DEPARTMENT_NAME", "_START_LETTER", "_ROLE_ID"]

    let data = {};
    let inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        data[inputs[i].id.replace('input_', '')] = inputs[i].value;
        if (inputs[i].required && inputs[i].value == "") {
            announcement(
                "Error!",
                `Fields marked with stars are required!`,
                "warning",
                true
            );
            return;
        }
        if (inputs[i].id == "input_MYSQL_CONNECTION_STRING") {
            if (inputs[i].value.includes('*****')) {
                delete data.MYSQL_CONNECTION_STRING
            }
            if (inputs[i].value != "" && !/^mysql:\/\/[^:@]+:[^:@]+@[^:@]+:\d+\/[^:@]+$/.test(inputs[i].value)) {
                announcement(
                    "Error!",
                    `Invalid MySQL connection string format!<br />The format should be: \`mysql://username:password@hostname:port/databasename\``,
                    "warning",
                    false
                );
                console.log('Invalid connection string');
                return;
            }
        }
    }
    data.LIST_OF_DEPARTMENTS = JSON.stringify(data.LIST_OF_DEPARTMENTS.split(',').map(department => department.toUpperCase().trim()));
    let newdepartment = {};
    JSON.parse(data.LIST_OF_DEPARTMENTS).forEach((department) => {
        ifDEPARTMENTS.forEach((suffix) => {
            if (!Object.keys(data).includes(department + suffix)) {
                newdepartment[department + suffix] = "";
            }
        });
    });
    data = { ...data, ...JSON.parse(JSON.stringify(newdepartment)) };

    fetch(URL + `/v1/config/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(async data => {
            console.log(data);
            if (data.status == 'ok') {
                announcement(
                    "Config submitted!",
                    "The config has been submitted successfully!",
                    "success",
                    true
                );
                await makeboxes();

            } else {
                announcement(
                    "Error!",
                    `An error occurred while submitting the information! Please check the console for error details. ${(data.message != undefined) ? `<br />Error: ${data.message}` : ""}`,
                    "danger",
                    true
                );
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            announcement(
                "Error!",
                `An error occurred while submitting the config! Please check the console for error details. ${(error != undefined) ? `<br />Error: ${error}` : ""}`,
                "danger",
                true
            );
        });

}

async function removeVariable(key) {
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
    // Remove the value from the list
    key = key.replace('remove_', '');

    // Remove the variable from the .env file
    fetch('/v1/config/removeVariable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key }),
    })
        .then(response => response.json())
        .then(async data => {
            console.log(data);
            if (data.status == 'ok') {
                await makeboxes();

                announcement(
                    "Variable removed!",
                    `${key} has been removed successfully!`,
                    "success",
                    true
                );
            } else {
                announcement(
                    "Error!",
                    `An error occurred while removing the variable! Please check the console for error details. ${(data.message != undefined) ? `<br />Error: ${data.message}` : ""}`,
                    "danger",
                    true
                );
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

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
