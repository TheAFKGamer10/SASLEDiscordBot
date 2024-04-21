function userspageloaded() {
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

    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    if (reason == 'created') {
        announcement('Success', 'User created successfully.', 'success', true);
    } else if (reason == 'edited') {
        announcement('Success', 'User edited successfully.', 'success', true);
    } else if (reason == 'deleted') {
        announcement('Success', 'User deleted successfully.', 'success', true);
    }


    fetch(`/v1/checkCookies?perm=0`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(isadmin => {
            if (isadmin.perm) {
                let createbuttonarea = document.getElementById('header');
                let createbutton = document.createElement('button');
                createbutton.innerHTML = 'Create User';
                createbutton.className = 'createbtn';
                createbutton.onclick = function () {
                    window.location.href = '/admin/users/create';
                };
                createbuttonarea.appendChild(createbutton);
            }

            fetch(`/v1/users/get`, {
                method: 'GET'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'error') {
                        announcement('Error', data.message, 'danger', false);
                        return;
                    }
                    let dataarea = document.getElementById('data');

                    usershtml = `<tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Permission</th>
                        ${isadmin.perm ? `<th></th>` : ''}
                    </tr>`;
                    for (let i = 0; i < data.length; i++) {
                        usershtml += `<tr>
                            <td>${data[i].id}</td>
                            <td>${data[i].username}</td>
                            <td>${data[i].permission}</td>
                            ${isadmin.perm ? `<td><button id="editbtn" class="editbtn" onclick="window.location.href = '/admin/users/edit?id=${data[i].id}';">Edit</button></td>` : ''}
                        </tr>`;
                    }

                    dataarea.innerHTML = `<table>${usershtml}</table>`;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

        });
}