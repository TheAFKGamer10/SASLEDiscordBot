function logspageloaded() {
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
    let selectrowsdropdown = document.getElementById('rows');

    const URL = window.location.hostname;
    fetch(`/v1/bot/logs/get?limit=${selectrowsdropdown.value}&URL=${URL}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                announcement('Error', data.message, 'danger', false);
                return;
            }

            let dataarea = document.getElementById('data');
            let cadettrainings = data.cadettrainings;
            let departmentjoins = data.departmentjoins;
            let cadettrainingshtml = document.createElement('table');
            let departmentjoinshtml = document.createElement('table');

            cadettrainingshtml = `<tr>
                <th>ID</th>
                <th>Passed</th>
                <th>Cadet</th>
                <th>FTO Username</th>
                <th>Timestamp</th>
            </tr>`;
            for (let i = 0; i < cadettrainings.length; i++) {
                let passed = cadettrainings[i].passed ? 'Passed' : 'Failed';
                cadettrainingshtml += `<tr>
                    <td><b>${cadettrainings[i].id}</b></td>
                    <td><b>${passed}</b></td>
                    <td><b>${cadettrainings[i].cadet_username}</b><br /><span title="Cadet ID">${cadettrainings[i].cadet_id}</span></td>
                    <td><b>${cadettrainings[i].fto_username}</b><br /><span title="FTO ID">${cadettrainings[i].fto_id}</span></td>
                    <td><b>${cadettrainings[i].timestamp}</b></td>
                </tr>`;
            }

            departmentjoinshtml = `<tr>
                <th>ID</th>
                <th>Forced</th>
                <th>Cadet</th>
                <th>Department</th>
                <th>Admin (If Forced)</th>
                <th>Timestamp</th>
            </tr>`;
            for (let i = 0; i < departmentjoins.length; i++) {
                let forced = departmentjoins[i].forced ? 'Forced' : 'Not Forced';
                departmentjoinshtml += `<tr>
                    <td><b>${departmentjoins[i].id}</b></td>
                    <td><b>${forced}</b></td>
                    <td><b>${departmentjoins[i].cadet_username}</b><br /><span title="Cadet ID">${departmentjoins[i].cadet_id}</span></td>
                    <td><b>${departmentjoins[i].department}</b></td>
                    <td><b>${departmentjoins[i].admin_forced_username}</b><br /><span title="Admin ID">${departmentjoins[i].admin_forced_id}</span></td>
                    <td><b>${departmentjoins[i].timestamp}</b></td>
                </tr>`;
            }

            dataarea.innerHTML = `
            <h2>Cadet Trainings</h2>
            <table>${cadettrainingshtml}</table>
            <br />
            <h2>Department Joins</h2>
            <table>${departmentjoinshtml}</table>
            `;
        })
        .catch((error) => {
            console.error('Error:', error);
        }); 

}