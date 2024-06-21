function logspageloaded() {
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

    if (window.innerWidth < 800) {
        announcement('Caution', 'This page may not be formated properly for mobile devices.', 'warning', false);
    }

    fetch(`/v1/bot/logs/get?limit=${(document.getElementById('rows') as HTMLSelectElement).value}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                announcement('Error', data.message, 'danger', false);
                return;
            }

            let dataarea = document.getElementById('data') as HTMLDivElement;
            let cadettrainings = data.cadettrainings;
            let departmentjoins = data.departmentjoins;
            let pastrp = data.pastrp;
            let cadettrainingshtml = document.createElement('table') as HTMLTableElement;
            let departmentjoinshtml = document.createElement('table') as HTMLTableElement;
            let pastrphtml = document.createElement('table') as HTMLTableElement;

            cadettrainingshtml.innerHTML = `<tr>
                <th>ID</th>
                <th>Passed</th>
                <th>Cadet</th>
                <th>FTO Username</th>
                <th>Timestamp</th>
            </tr>`;
            for (let i = 0; i < cadettrainings.length; i++) {
                let passed = cadettrainings[i].passed ? 'Passed' : 'Failed';
                cadettrainingshtml.innerHTML += `<tr>
                    <td><b>${cadettrainings[i].id}</b></td>
                    <td><b>${passed}</b></td>
                    <td><b>${cadettrainings[i].cadet_username}</b><br /><span title="Cadet ID">${cadettrainings[i].cadet_id}</span></td>
                    <td><b>${cadettrainings[i].fto_username}</b><br /><span title="FTO ID">${cadettrainings[i].fto_id}</span></td>
                    <td><b>${cadettrainings[i].timestamp}</b></td>
                </tr>`;
            };

            departmentjoinshtml.innerHTML = `<tr>
                <th>ID</th>
                <th>Forced</th>
                <th>Cadet</th>
                <th>Department</th>
                <th>Admin (If Forced)</th>
                <th>Timestamp</th>
            </tr>`;
            for (let i = 0; i < departmentjoins.length; i++) {
                let forced = departmentjoins[i].forced ? 'Forced' : 'Not Forced';
                departmentjoinshtml.innerHTML += `<tr>
                    <td><b>${departmentjoins[i].id}</b></td>
                    <td><b>${forced}</b></td>
                    <td><b>${departmentjoins[i].cadet_username}</b><br /><span title="Cadet ID">${departmentjoins[i].cadet_id}</span></td>
                    <td><b>${departmentjoins[i].department}</b></td>
                    <td><b>${departmentjoins[i].admin_forced_username}</b><br /><span title="Admin ID">${departmentjoins[i].admin_forced_id}</span></td>
                    <td><b>${departmentjoins[i].timestamp}</b></td>
                </tr>`;
            };

            pastrphtml.innerHTML = `<tr>
                <th>ID</th>
                <th>AOP</th>
                <th>Timestamp (Year Month Day Hour Minute)</th>
                <th>User</th>
                <th>Ping</th>
                <th>Training</th>
                <th>Ping At RP Time</th>
            </tr>`;
            for (let i = 0; i < pastrp.length; i++) {
                pastrphtml.innerHTML += `<tr>
                    <td><b>${pastrp[i].id}</b></td>
                    <td><b>${pastrp[i].aop}</b></td>
                    <td><b>${pastrp[i].timestamp}</b></td>
                    <td><b>${pastrp[i].user}</b></td>
                    <td><b>${pastrp[i].ping ? 'True' : 'False'}</b></td>
                    <td><b>${pastrp[i].training ? 'True' : 'False'}</b></td>
                    <td><b>${pastrp[i].pingatrptime ? 'True' : 'False'}</b></td>
                </tr>`;
            };

            dataarea.innerHTML = `
            <h2>Cadet Trainings</h2>
            <table>${cadettrainingshtml.innerHTML}</table>
            <br />
            <h2>Department Joins</h2>
            <table>${departmentjoinshtml.innerHTML}</table>
            <br />
            <h2>Past Roleplays</h2>
            <table>${pastrphtml.innerHTML}</table>
            `;
        })
        .catch((error) => {
            console.error('Error:', error);
        }); 

}