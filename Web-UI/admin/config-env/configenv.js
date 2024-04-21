"use strict";

async function makeboxes() {
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


    return fetch(`/v1/config/get`, {
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
            fetch(`/v1/config/envhints`, {
                method: 'GET'
            })
                .then(response => response.json())
                .then(envhints => {
                    const ifDEPARTMENTS = ["_DEPARTMENT_NAME", "_START_LETTER", "_ROLE_ID", "_PROBIB_ID"]

                    let form = document.getElementById('config');
                    form.innerHTML = ''; // Empty the div with id 'config'

                    let ifdb = [];
                    Object.keys(envhints).forEach((key) => {
                        if (envhints[key]?.onlyifDB === true) {
                            ifdb.push(key);
                        }
                    });

                    Object.keys(data).forEach((key) => {
                        let ending = "";
                        ifDEPARTMENTS.forEach((suffix) => {
                            if (key.endsWith(suffix) && data.hasOwnProperty(key) && !Object.keys(envhints).includes(key)) {
                                ending = suffix;
                            }
                        });
                        if (ifdb.includes(key) || ifdb.includes(ending) && data.MYSQL_CONNECTION_STRING == "") {
                            return;
                        }
                        if (!Object.keys(envhints).includes(key)) {
                            envhints[key] = { type: "text", required: false, default: "", description: "", descriptionusehtml: false };
                        }


                        if (envhints[key].type === 'dropdown') {
                            let element;
                            if (envhints[key].type === 'dropdown') {
                                element = document.createElement('select');
                                envhints[key].options.forEach(option => {
                                    let optionElement = document.createElement('option');
                                    optionElement.value = option;
                                    optionElement.textContent = option;
                                    element.appendChild(optionElement);
                                });
                            } else {
                                element = document.createElement('div');
                            }
                            element.className = 'block';
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

                        let textdiv = document.createElement('div');
                        textdiv.className = 'textdiv';
                        textdiv.appendChild(label);
                        textdiv.appendChild(description);
                        div.appendChild(textdiv);

                        if (envhints[key].type === 'dropdown') {
                            let element = document.createElement('select');
                            envhints[key].options.forEach(option => {
                                let optionElement = document.createElement('option');
                                optionElement.value = option;
                                optionElement.textContent = option;
                                element.appendChild(optionElement);
                            });

                            element.className = 'input geninput dropdowninput';
                            element.id = `input_${key}`;
                            element.value = data[key];

                            element.required = envhints[key]?.required || envhints[ending]?.required ? true : false;
                            if (element.required) {
                                // Create a new span element
                                let span = document.createElement('span');
                                span.textContent = '*';
                                span.style = 'color: red;';
                                span.className = 'required red';
                                label.appendChild(span);
                            }

                            div.onclick = element.onclick = function () {
                                element.focus();
                            };
                            div.appendChild(element);
                        } else {
                            // Create a new input element
                            let input = document.createElement('input');
                            input.className = 'input geninput';

                            input.type = ending != "" ? envhints[ending].type : envhints[key].type;

                            if (key == "BOT_TOKEN") {
                                input.addEventListener('focusin', mouseoverPass);
                                input.addEventListener('focusout', mouseoutPass);
                            };

                            input.required = envhints[key]?.required || envhints[ending]?.required ? true : false;

                            input.placeholder = ending != "" ? envhints[ending].default : envhints[key].default;
                            input.id = `input_${key}`;
                            if (key == "MYSQL_CONNECTION_STRING") {
                                input.addEventListener('focusin', connectionstringmouseoverPass, true);
                                input.addEventListener('focusout', connectionstringmouseoutPass, true);
                                sessionStorage.setItem('MYSQL_CONNECTION_STRING', data[key]);
                                sessionStorage.setItem('const_MYSQL_CONNECTION_STRING', data[key]);
                                input.value = data[key].replace(/(mysql:\/\/[^:@]+:)([^:@]+)(@[^:@]+:\d+\/[^:@]+)/, function (match, p1, p2, p3) {
                                    return p1 + '*'.repeat(p2.length) + p3;
                                });
                            } else {
                                input.value = data[key];
                            }
                            if (ending != "" ? envhints[ending].required : envhints[key].required) {
                                // Create a new span element
                                let span = document.createElement('span');
                                span.textContent = '*';
                                span.style = 'color: red;';
                                span.className = 'required red';
                                label.appendChild(span);
                            }

                            div.onclick = input.onclick = function () {
                                input.focus();
                            };
                            div.appendChild(input);
                        }

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

async function envpageloaded() {
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

    const ifDEPARTMENTS = ["_DEPARTMENT_NAME", "_START_LETTER", "_ROLE_ID"]

    let data = {};
    let inputs = document.getElementsByClassName('input');
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
            if (sessionStorage.getItem('const_MYSQL_CONNECTION_STRING') == sessionStorage.getItem('MYSQL_CONNECTION_STRING')) {
                delete data.MYSQL_CONNECTION_STRING
            } else {
                data.MYSQL_CONNECTION_STRING = sessionStorage.getItem('MYSQL_CONNECTION_STRING');
            }
            if (inputs[i].value != "" && !/^mysql:\/\/[^:@]+:[^:@]+@[^:@]+:\d+\/[^:@]+$/.test(inputs[i].value)) {
                announcement(
                    "Error!",
                    `Invalid MySQL connection string format!<br />The format should be: \`mysql://username:password@hostname:port/databasename\``,
                    "warning",
                    false
                );
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

    fetch(`/v1/config/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(async data => {
            if (data.status == 'OK') {
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
            if (data.status == 'OK') {
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




function mouseoverPass() {
    let obj = document.getElementById('input_BOT_TOKEN');
    obj.type = 'text';
}

function mouseoutPass() {
    let obj = document.getElementById('input_BOT_TOKEN');
    obj.type = 'password';
    obj.blur();
}

function connectionstringmouseoverPass() {
    let obj = document.getElementById('input_MYSQL_CONNECTION_STRING');
    if (obj.value.includes('*')) {
        obj.value = sessionStorage.getItem('MYSQL_CONNECTION_STRING');
    }
}

async function connectionstringmouseoutPass() {
    let obj = document.getElementById('input_MYSQL_CONNECTION_STRING');
    if (obj.value !== "") {
        sessionStorage.setItem('MYSQL_CONNECTION_STRING', obj.value)
        obj.value = obj.value.replace(/(mysql:\/\/[^:@]+:)([^:@]+)(@[^:@]+:\d+\/[^:@]+)/, function (match, p1, p2, p3) {
            return p1 + '*'.repeat(p2.length) + p3;
        });
    } else {
        sessionStorage.setItem('MYSQL_CONNECTION_STRING', obj.value);
    }
    obj.blur();
}


window.onbeforeunload = () => {
    sessionStorage.removeItem('MYSQL_CONNECTION_STRING');
    sessionStorage.removeItem('const_MYSQL_CONNECTION_STRING');
}