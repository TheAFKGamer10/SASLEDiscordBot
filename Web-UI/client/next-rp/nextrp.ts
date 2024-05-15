async function nextrppageloaded() {
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
    
    let created = new URLSearchParams(window.location.search).get("created");
    if (created == "rp") {
        announcement("Success", "You have successfully scheduled roleplay.", "success", true);
    } 

    fetch(`/v1/checkCookies?perm=2`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(isadmin => {
            if (isadmin.perm) {
                let createbuttonarea = document.getElementById('headernextto') as HTMLDivElement;
                let createbutton = document.createElement('button') as HTMLButtonElement;
                createbutton.innerHTML = 'Create RP';
                createbutton.className = 'createbtn';
                createbutton.onclick = function () {
                    window.location.href = '/next-rp/create';
                };
                createbuttonarea.appendChild(createbutton);
            }
        });

    return fetch(`/v1/bot/rp`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(rpinfo => {
            if (rpinfo.status === 'warning' || rpinfo.status === 'error') {
                (document.getElementById('Time') as HTMLParagraphElement).innerHTML = rpinfo.message;
                (document.getElementById('Countdownh3') as HTMLElement).innerHTML = '';
                return;
            }
            const userLocale = navigator.language;
            
            let Time = new Date();
            Time.setFullYear(rpinfo.time.split(' ')[0]);
            Time.setMonth(rpinfo.time.split(' ')[1] - 1);
            Time.setDate(rpinfo.time.split(' ')[2]);
            Time.setHours(rpinfo.time.split(' ')[3]);
            Time.setMinutes(rpinfo.time.split(' ')[4]);
            Time.setSeconds(0);
            Time.setMilliseconds(0);
            
            // Get the timezone offset in minutes
            const serverTimeOffset = rpinfo.servertimeoffset;
            const timezoneOffset = Time.getTimezoneOffset();
            const differenceInMinutes = serverTimeOffset - timezoneOffset;
            
            // Apply the timezone offset to the time
            Time.setMinutes(Time.getMinutes() + differenceInMinutes);
            
            const options = { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric', hour12: true };
            const formattedTime = new Date(Time).toLocaleString(userLocale, { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric', hour12: true });
            (document.getElementById('Time') as HTMLParagraphElement).innerHTML = `<h2>${formattedTime}</h2>AOP (Area of Play): ${rpinfo.aop}<br />Training will ${rpinfo.training != 1 ? `<b>not</b>` : ''} be happening.`;


            function timeRemaining() {
                const timeRemaining = Number(Time) - Number(new Date());

                // Convert the time remaining to hours, minutes, and seconds
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                // Display the countdown
                (document.getElementById('Countdown') as HTMLParagraphElement).innerHTML = `Countdown: ${hours}h ${minutes}m ${seconds}s`;

                // If the countdown has finished, display a message
                if (timeRemaining < 0) {
                    (document.getElementById('Countdown') as HTMLParagraphElement).innerHTML = 'RP has started!';
                    clearInterval(timer);
                }
            }
            timeRemaining();
            const timer = setInterval(() => { timeRemaining() }, 1000);
        })
}