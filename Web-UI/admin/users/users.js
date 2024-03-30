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
        });
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
            </tr>`;
            for (let i = 0; i < data.length; i++) {
                usershtml += `<tr>
                    <td>${data[i].id}</td>
                    <td>${data[i].username}</td>
                    <td>${data[i].permission}</td>
                </tr>`;
            }

            dataarea.innerHTML = `<table>${usershtml}</table>`;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}