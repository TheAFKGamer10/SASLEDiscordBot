"use strict";

function pageloaded() {
    fetch('/header.json')
        .catch(error => console.error('Error:', error))
        .then(response => response.json())
        .then(links => {
            let topbarleft = document.getElementById('top-bar-left');
            let logoutButton = document.createElement('button');
            let loginButton = document.createElement('button');
            logoutButton.textContent = "Logout";
            logoutButton.className = 'topbarbutton';
            loginButton.textContent = "Login";
            loginButton.className = 'topbarbutton';



            const hamburgerButton = document.createElement('button');
            const hamburgerIcon = document.createElement('img');
            hamburgerIcon.src = '/img/bars.svg';
            hamburgerIcon.className = 'hamburger-icon';
            hamburgerButton.appendChild(hamburgerIcon);
            hamburgerButton.className = 'hamburger-button';
            const topbarright = document.getElementById('top-bar-right');
            topbarright.appendChild(hamburgerButton);

            const menu = document.createElement('div');
            menu.className = 'menu';
            topbarright.appendChild(menu);

            hamburgerButton.addEventListener('click', function () {
                menu.classList.toggle('show');
            });

            let closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.className = 'close-button';
            closeButton.onclick = function () {
                document.querySelector('.menu').classList.toggle('show');
            };
            document.querySelector('.menu').appendChild(closeButton);


            logoutButton.onclick = function () {
                fetch('/logout', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then((response) => response.text())
                    .then((data) => {
                        window.location.reload();
                    });
            };
            loginButton.onclick = function () {
                window.location.href = `/login?next=${window.location.pathname}`;
            };

            fetch('/v1/checkCookies?cookie=userid&perm=1', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .catch(error => console.error('Error:', error))
                .then((response) => response.json())
                .then((data) => {
                    let objkeys = Object.keys(links);
                    if (data.perm) {
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
                            topbarleft.appendChild(button);

                            let handburgeritem = document.createElement('button');
                            handburgeritem.textContent = links[key].title;
                            handburgeritem.className = 'handburgeritem';
                            handburgeritem.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            document.querySelector('.menu').appendChild(handburgeritem);
                        });

                        let dropdown = document.createElement('div');
                        dropdown.className = 'dropdown';
                        dropdown.onclick = function () {
                            window.location.href = '/admin';
                        };
                        let button = document.createElement('button');
                        button.textContent = 'Administration';
                        button.className = 'dropbtn topbarbutton';
                        const arrowIcon = document.createElement('img');
                        arrowIcon.src = '/img/down-arrow.svg';
                        arrowIcon.className = 'arrow-icon';
                        button.appendChild(arrowIcon);
                        dropdown.appendChild(button);

                        let dropdownarea = document.createElement('div');
                        dropdownarea.className = 'dropdown-area';

                        let dropdownContent = document.createElement('div');
                        dropdownContent.className = 'dropdown-content topbarbutton';
                        Object.keys(links.ifAdmin).forEach(key => {
                            if (links.ifAdmin[key].title == null) {
                                return;
                            }
                            let a = document.createElement('a');
                            a.textContent = links.ifAdmin[key].title;
                            a.href = links.ifAdmin[key].link;
                            dropdownContent.appendChild(a);
                        });


                        let dropdownMenu = document.createElement('div');
                        dropdownMenu.className = 'hamburger-dropdown';
                        let dropdownContentMenu = document.createElement('div');
                        dropdownContentMenu.className = 'hamburger-dropdown-content';

                        Object.keys(links.ifAdmin).forEach(key => {
                            let a = document.createElement('a');
                            a.textContent = links.ifAdmin[key].title;
                            a.href = links.ifAdmin[key].link;
                            dropdownContentMenu.appendChild(a);
                        });

                        let showItemsButton = document.createElement('button');
                        showItemsButton.textContent = 'Administration';
                        const HamburgerarrowIcon = document.createElement('img');
                        HamburgerarrowIcon.src = '/img/down-arrow.svg';
                        HamburgerarrowIcon.className = 'arrow-icon';
                        showItemsButton.appendChild(HamburgerarrowIcon);
                        showItemsButton.className = 'show-items-button handburgeritem';
                        showItemsButton.onclick = function () {
                            dropdownMenu.classList.toggle('show');
                            dropdownContentMenu.classList.toggle('show');
                        };
                        document.querySelector('.menu').appendChild(showItemsButton);

                        dropdownMenu.appendChild(dropdownContentMenu);
                        document.querySelector('.menu').appendChild(dropdownMenu);

                        dropdownarea.appendChild(dropdownContent);
                        dropdown.appendChild(dropdownarea);
                        topbarleft.appendChild(dropdown);


                        // Footer
                        if (document.getElementById('footer')) {
                            document.getElementById('footer').innerHTML = ` <!-- Plaese do not remove footer. It helps the developer of this softwear. But, it is open source, do what every you want (While still following the license). -->
                                <p><a href="https://github.com/TheAFKGamer10/SASLEDiscordBot" target="_blank" class="footerlink">FiveM Discord Bot</a> by <a href="https://afkht.us/foot" target="_blank" class="footerlink">The AFK Gamer</a></p>
                                <p style="font-size: 8px;">FiveM Discord Bot is not an official Discord or FiveM product. It is not affiliated with nor endorsed by Discord Inc. or Cfx.re.</p>
                            `;
                        }
                    } else {
                        topbarleft.style.marginBottom = '0px';
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
                            topbarleft.appendChild(button);

                            let handburgeritem = document.createElement('button');
                            handburgeritem.textContent = links[key].title;
                            handburgeritem.className = 'handburgeritem';
                            handburgeritem.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            document.querySelector('.menu').appendChild(handburgeritem);
                        });
                    }

                    if (data.cookie) {
                        topbarleft.appendChild(logoutButton);
                    } else {
                        topbarleft.appendChild(loginButton);
                    }

                    if (window.innerWidth > 800) {
                        document.getElementById('top-bar-left').style.display = 'block';
                        document.querySelector('.menu').style.display = 'none';
                        document.querySelector('.menu').classList.remove('show');
                        document.querySelector('.hamburger-button').style.display = 'none';
                    } else {
                        document.getElementById('top-bar-left').style.display = 'none';
                        document.querySelector('.menu').style.display = 'block';
                        document.querySelector('.menu').style.justifyContent = 'center';
                        document.querySelector('.menu').style.alignItems = 'center';

                        if (data.cookie) {
                            document.querySelector('.menu').appendChild(logoutButton);
                        } else {
                            document.querySelector('.menu').appendChild(loginButton);
                        }

                        loginButton.classList.remove('topbarbutton');
                        logoutButton.classList.remove('topbarbutton');
                        loginButton.classList.add('handburgeritem');
                        logoutButton.classList.add('handburgeritem');
                    }
                });
        });
};


function changeld() {
    const ldbutton = document.getElementById("lightdarkbutton");
    const body = document.getElementById("body");
    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
        body.classList.add("light");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/sun.svg" height="25px" /> `;
        sessionStorage.setItem("lightdark", "light");
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/moon.svg" height="25px" /> `;
        sessionStorage.setItem("lightdark", "dark");
    }
}

// Add the following code to restore the saved color on page reload
window.addEventListener("DOMContentLoaded", function () {
    const body = document.getElementById("body");
    const ldbutton = document.getElementById("lightdarkbutton");
    const savedColor = sessionStorage.getItem("lightdark");
    if (savedColor === "light") {
        body.classList.remove("dark");
        body.classList.add("light");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/sun.svg" height="25px" /> `;
    } else if (savedColor === "dark") {
        body.classList.remove("light");
        body.classList.add("dark");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/moon.svg" height="25px" /> `;
    } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            body.classList.remove("light");
            body.classList.add("dark");
            ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/moon.svg" height="25px" /> `;
        } else {
            body.classList.remove("dark");
            body.classList.add("light");
            ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/sun.svg" height="25px" /> `;
        }
    }
});


function closeAnnouncement() {
    document.getElementById('announcement').style.display = 'none';
}

var previousWidth = window.innerWidth;
window.addEventListener("resize", function () {
    var currentWidth = window.innerWidth;
    if (currentWidth > 800 && previousWidth <= 800) {
        location.reload();
    } else if (currentWidth <= 800 && previousWidth > 800) {
        location.reload();
    }
    previousWidth = currentWidth;
});

