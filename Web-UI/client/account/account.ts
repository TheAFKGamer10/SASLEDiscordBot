function accountpageload() {
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


    fetch(`/v1/users/singleuserinfo`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            if (data == undefined || data == null || Object.keys(data).length === 0) {
                announcement('Error', 'You are not logged in.', 'danger', false);
                return;
            }

            const envhints: { [key: string]: { type: string, description: string, required: boolean, default: string, options?: string[], readonly?: boolean, descriptionusehtml?: boolean } } = {
                "username": {
                    "type": "text",
                    "description": "Your username",
                    "required": true,
                    "default": data.username,
                },
                "password": {
                    "type": "password",
                    "description": "Your password. Leave blank to keep the same password.",
                    "required": false,
                    "default": "Leave blank for same password",
                }
            };

            Object.keys(data).forEach(key => {
                
                // Create a new div element
                let div = document.createElement('div') as HTMLDivElement;
                div.className = 'block';

                // Create a new label element
                let label = document.createElement('label') as HTMLLabelElement;
                // label.for = key.replace(/_/g, ' ');
                label.textContent = (key.charAt(0).toUpperCase() + key.slice(1)).replace(/_/g, ' ');
                label.className = 'inputlabel';

                // Create a new description element
                let description = document.createElement('p') as HTMLParagraphElement;
                if (envhints[key]?.descriptionusehtml) {
                    description.innerHTML = envhints[key]?.description || "";
                } else {
                    description.textContent = envhints[key]?.description || "";
                }
                description.id = `description_${key}`;
                description.className = 'description';

                let textdiv = document.createElement('div') as HTMLDivElement;
                textdiv.className = 'textdiv';
                textdiv.appendChild(label);
                textdiv.appendChild(description);
                div.appendChild(textdiv);

                if (envhints[key].type === 'dropdown') {
                    let element = document.createElement('select') as HTMLSelectElement;
                    envhints[key].options!.forEach(option => {
                        let optionElement = document.createElement('option') as HTMLOptionElement;
                        optionElement.value = option;
                        optionElement.textContent = option;
                        element.appendChild(optionElement);
                    });

                    element.className = 'input geninput dropdowninput';
                    element.id = `input_${key}`;
                    element.value = data[key];

                    element.required = envhints[key]?.required ? true : false;
                    if (element.required) {
                        // Create a new span element
                        let span = document.createElement('span') as HTMLSpanElement;
                        span.textContent = '*';
                        span.style.setProperty('color', 'red');
                        span.className = 'required red';
                        label.appendChild(span);
                    }

                    if (envhints[key].readonly) {
                        element.disabled = true;
                    }

                    div.onclick = element.onclick = function () {
                        element.focus();
                    };
                    div.appendChild(element);
                } else {
                    // Create a new input element
                    let input = document.createElement('input') as HTMLInputElement;
                    input.className = 'input geninput';

                    input.type = envhints[key].type;
                    input.placeholder = envhints[key].default;
                    input.id = `input_${key}`;
                    input.value = data[key];
                    
                    input.required = envhints[key]?.required ? true : false;
                    if (envhints[key].required) {
                        // Create a new span element
                        let span = document.createElement('span') as HTMLSpanElement;
                        span.textContent = '*';
                        span.style.setProperty('color', 'red');
                        span.className = 'required red';
                        label.appendChild(span);
                    }

                    if (envhints[key].readonly) {
                        input.disabled = true;
                    }

                    div.onclick = input.onclick = function () {
                        input.focus();
                    };
                    div.appendChild(input);
                }

                document.getElementsByClassName('config')[0].appendChild(div);
            });
        });
};

function accountsubmit() {
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

    let data: any = {};
    let elements = document.getElementsByClassName('geninput') as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let key = element.id.replace('input_', '');
        data[key] = element.value;
    }

    console.log(data);

    fetch(`/v1/users/useredit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status == 'OK') {
                announcement('Success', 'Your account has been updated.', 'success', true);
                window.location.href = `/logout?next=/login&afterlogin=${window.location.pathname}&reason=accountchange`;
            } else {
                announcement('Error', data.error, 'danger', true);
            }
        });
}