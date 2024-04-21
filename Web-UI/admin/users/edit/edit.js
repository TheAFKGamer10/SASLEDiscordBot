"use strict";

async function createpageloaded() {
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

    fetch(window.location.origin + `/v1/users/get?id=${new URLSearchParams(window.location.search).get('id')}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(async user => {
            if (user.status === 'error') {
                if (user.message === 'User not found') {
                    document.getElementById('sumbitbtn').style.display = 'none';
                    document.getElementById('config').innerHTML = `<h1 style="color: red;">User not found!</h1>`;
                    announcement('Error', 'User not found!', 'danger', false);
                    return;
                }
                announcement('Error', user.message, 'danger', false);
                return;
            }
            fetch(window.location.origin + `/v1/users/perms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(async roles => {
                    console.log(user);

                    let data = {
                        "Username": {
                            "type": "text",
                            "description": "The username of the user.",
                            "required": true,
                            "default": user[0].username
                        },
                        "Password": {
                            "type": "text",
                            "description": "The password of the user.",
                            "required": false
                        },
                        "Permission": {
                            "type": "dropdown",
                            "description": "The permission of the user.",
                            "options": Object.values(roles),
                            "required": true,
                            "default": user[0].permission
                        }
                    };

                    let form = document.getElementById('config');
                    form.innerHTML = ''; // Empty the div with id 'config'

                    Object.keys(data).forEach((key) => {
                        if (data[key].type === 'dropdown') {
                            let element;
                            if (data[key].type === 'dropdown') {
                                element = document.createElement('select');
                                data[key].options.forEach(option => {
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
                        if (data[key]?.descriptionusehtml) {
                            description.innerHTML = data[key]?.description || "";
                        } else {
                            description.textContent = data[key]?.description || "";
                        }
                        description.id = `description_${key}`;
                        description.className = 'description';

                        let textdiv = document.createElement('div');
                        textdiv.className = 'textdiv';
                        textdiv.appendChild(label);
                        textdiv.appendChild(description);
                        div.appendChild(textdiv);

                        if (data[key].type === 'dropdown') {
                            let element;
                            element = document.createElement('select');
                            data[key].options.forEach(option => {
                                let optionElement = document.createElement('option');
                                optionElement.value = option;
                                optionElement.textContent = option;
                                element.appendChild(optionElement);
                            });

                            element.required = data[key]?.required ? true : false;
                            if (element.required) {
                                // Create a new span element
                                let span = document.createElement('span');
                                span.textContent = '*';
                                span.style = 'color: red;';
                                span.className = 'required red';
                                label.appendChild(span);
                            }

                            element.className = 'input geninput dropdowninput';
                            element.id = `input_${key}`;
                            element.value = data[key].default;

                            div.onclick = element.onclick = function () {
                                element.focus();
                            };
                            div.appendChild(element);
                        } else if (data[key].type === 'checkbox') {
                            let element = document.createElement('input');
                            element.type = 'checkbox';
                            element.required = data[key]?.required ? true : false;
                            if (element.required) {
                                // Create a new span element
                                let span = document.createElement('span');
                                span.textContent = '*';
                                span.style = 'color: red;';
                                span.className = 'required red';
                                label.appendChild(span);
                            }
                            element.className = 'input geninput checkbox';
                            element.id = `input_${key}`;
                            element.checked = data[key].checked;

                            div.onclick = element.onclick = function () {
                                element.checked = !element.checked;
                            };
                            div.appendChild(element);
                        } else {
                            // Create a new input element
                            let input = document.createElement('input');
                            input.className = 'input geninput';
                            input.type = data[key].type;
                            input.required = data[key]?.required ? true : false;
                            input.id = `input_${key}`;
                            input.value = data[key].default || '';

                            if (input.required) {
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
                });
        });
};


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

    let data = {};
    let inputs = document.getElementsByClassName('input');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type === 'checkbox') {
            data[inputs[i].id.replace('input_', '').toLowerCase().replace(/\s/g, '')] = inputs[i].checked;
        } else {
            data[inputs[i].id.replace('input_', '').toLowerCase().replace(/\s/g, '')] = inputs[i].value;
        }

        if (inputs[i].required && inputs[i].value == "") {
            announcement(
                "Error!",
                `Fields marked with stars are required!`,
                "warning",
                true
            );
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

