function pageloaded() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) { changeld(); }

    fetch('/header.json')
        .then(response => response.json())
        .then(links => {
            let topbar = document.getElementById('top-bar-left');
            let logoutButton = document.createElement('button');
            let loginButton = document.createElement('button');
            logoutButton.textContent = "Logout";
            logoutButton.className = "topbarbutton";
            loginButton.textContent = "Login";
            loginButton.className = "topbarbutton";
            logoutButton.onclick = function () {
                rmun();
            };
            loginButton.onclick = function () {
                window.location.href = `/login?next=${window.location.pathname}`;
            };

            fetch('/checkCookies?cookie=userid', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.text())
                .then((data) => {
                    objkeys = Object.keys(links);
                    if (data == "true") {
                        objkeys.forEach(key => {
                            if (key == "ifAdmin") {
                                return;
                            }
                            let button = document.createElement('button');
                            button.textContent = links[key].title;
                            button.className = 'topbarbutton';
                            button.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            topbar.appendChild(button);
                        });
                        
                        let dropdown = document.createElement('div');
                        dropdown.className = 'dropdown';
                        dropdown.onclick = function () {
                            window.location.href = '/admin';
                        };
                        let button = document.createElement('button');
                        button.textContent = 'Administration';
                        button.className = 'dropbtn topbarbutton';
                        dropdown.appendChild(button);
                        let dropdownContent = document.createElement('div');
                        dropdownContent.className = 'dropdown-content topbarbutton';
                        Object.keys(links.ifAdmin).forEach(key => {
                            let a = document.createElement('a');
                            a.textContent = links.ifAdmin[key].title;
                            a.href = links.ifAdmin[key].link;
                            dropdownContent.appendChild(a);
                        });
                        dropdown.appendChild(dropdownContent);
                        topbar.appendChild(dropdown);
                        topbar.appendChild(logoutButton);
                    } else {
                        objkeys.forEach(key => {
                            if (key == "ifAdmin") {
                                return;
                            }
                            let link = links[key].link;
                            let button = document.createElement('button');
                            button.textContent = links[key].title;
                            button.onclick = function () {
                                window.location.href = link.url;
                            };
                            topbar.appendChild(button);
                        });
                        topbar.appendChild(loginButton);
                    }
                });
        });
}

async function rmun() {
    fetch('/logout', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.text())
        .then((data) => {
            window.location.href = '/login';
        });

}

async function loationbutton() {

}


function changeld() {
    const ldbutton = document.getElementById("lightdarkbutton");
    const body = document.getElementById("body");
    if (body.classList.contains("dark")) {
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