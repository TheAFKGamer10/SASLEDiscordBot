"use strict";

function pageloaded() {
    fetch(`/v1/pageload?l=${window.location.pathname}`, { // This chacks only the first request send to the page and does not request every a link is loaded.
        method: "GET"
    })
        .catch(error => console.error('Error:', error))
        .then((response: Response | void) => response!.json())
        .then((data: any) => {
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        });

    fetch('/header.json')
        .catch(error => console.error('Error:', error))
        .then((response: Response | void) => response!.json())
        .then(links => {
            let topbarleft = document.getElementById('top-bar-left') as HTMLDivElement;
            let logoutButton = document.createElement('button') as HTMLButtonElement;
            let loginButton = document.createElement('button') as HTMLButtonElement;
            logoutButton.textContent = "Logout";
            logoutButton.className = 'topbarbutton';
            loginButton.textContent = "Login";
            loginButton.className = 'topbarbutton';



            const hamburgerButton = document.createElement('button') as HTMLButtonElement;
            const hamburgerIcon = document.createElement('img') as HTMLImageElement; // Change the type to HTMLImageElement
            hamburgerIcon.src = '/img/bars.svg';
            hamburgerIcon.className = 'hamburger-icon';
            hamburgerButton.appendChild(hamburgerIcon);
            hamburgerButton.className = 'hamburger-button';
            const topbarright = document.getElementById('top-bar-right') as HTMLDivElement;
            topbarright.appendChild(hamburgerButton);

            const mobilemenu = document.createElement('div') as HTMLDivElement;
            mobilemenu.className = 'menu';

            topbarright.appendChild(mobilemenu);

            hamburgerButton.addEventListener('click', function () {
                mobilemenu.classList.toggle('show');
            });

            let closeButton = document.createElement('button') as HTMLButtonElement;
            closeButton.textContent = 'X';
            closeButton.className = 'close-button';
            closeButton.onclick = function () {
                mobilemenu.classList.toggle('show');
            };
            mobilemenu.appendChild(closeButton);


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
                .then((response: Response | void) => response!.json())
                .then((data: any) => {
                    let objkeys = Object.keys(links);
                    if (data.perm) {
                        objkeys.forEach(key => {
                            if (key == "ifAdmin") {
                                return;
                            }
                            let button = document.createElement('button') as HTMLButtonElement;
                            button.textContent = links[key].title;
                            button.className = 'topbarbutton';
                            button.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            topbarleft.appendChild(button);

                            let handburgeritem = document.createElement('button') as HTMLButtonElement;
                            handburgeritem.textContent = links[key].title;
                            handburgeritem.className = 'handburgeritem';
                            handburgeritem.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            mobilemenu.appendChild(handburgeritem);
                        });

                        let dropdown = document.createElement('div') as HTMLDivElement;
                        dropdown.className = 'dropdown';
                        dropdown.onclick = function () {
                            window.location.href = '/admin';
                        };
                        let button = document.createElement('button') as HTMLButtonElement;
                        button.textContent = 'Administration';
                        button.className = 'dropbtn topbarbutton';
                        const arrowIcon = document.createElement('img') as HTMLImageElement;
                        arrowIcon.src = '/img/down-arrow.svg';
                        arrowIcon.className = 'arrow-icon';
                        button.appendChild(arrowIcon);
                        dropdown.appendChild(button);

                        let dropdownarea = document.createElement('div') as HTMLDivElement;
                        dropdownarea.className = 'dropdown-area';

                        let dropdownContent = document.createElement('div') as HTMLDivElement;
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


                        let dropdownMenu = document.createElement('div') as HTMLDivElement;
                        dropdownMenu.className = 'hamburger-dropdown';
                        let dropdownContentMenu = document.createElement('div') as HTMLDivElement;
                        dropdownContentMenu.className = 'hamburger-dropdown-content';

                        Object.keys(links.ifAdmin).forEach(key => {
                            let a = document.createElement('a');
                            a.textContent = links.ifAdmin[key].title;
                            a.href = links.ifAdmin[key].link;
                            dropdownContentMenu.appendChild(a);
                        });

                        let showItemsButton = document.createElement('button') as HTMLButtonElement;
                        showItemsButton.textContent = 'Administration';
                        const HamburgerarrowIcon = document.createElement('img') as HTMLImageElement;
                        HamburgerarrowIcon.src = '/img/down-arrow.svg';
                        HamburgerarrowIcon.className = 'arrow-icon';
                        showItemsButton.appendChild(HamburgerarrowIcon);
                        showItemsButton.className = 'show-items-button handburgeritem';
                        showItemsButton.onclick = function () {
                            dropdownMenu.classList.toggle('show');
                            dropdownContentMenu.classList.toggle('show');
                        };
                        mobilemenu.appendChild(showItemsButton);

                        dropdownMenu.appendChild(dropdownContentMenu);
                        mobilemenu.appendChild(dropdownMenu);

                        dropdownarea.appendChild(dropdownContent);
                        dropdown.appendChild(dropdownarea);
                        topbarleft.appendChild(dropdown);

                    } else {
                        topbarleft.style.marginBottom = '0px';
                        objkeys.forEach(key => {
                            if (key == "ifAdmin") {
                                return;
                            }
                            let button = document.createElement('button') as HTMLButtonElement;
                            button.textContent = links[key].title;
                            button.className = 'topbarbutton';
                            button.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            topbarleft.appendChild(button);

                            let handburgeritem = document.createElement('button') as HTMLButtonElement;
                            handburgeritem.textContent = links[key].title;
                            handburgeritem.className = 'handburgeritem';
                            handburgeritem.onclick = function () {
                                window.location.href = links[key].link;
                            };
                            mobilemenu.appendChild(handburgeritem);
                        });
                    }

                    if (data.cookie) {
                        topbarleft.appendChild(logoutButton);

                        // Account
                        let account = document.createElement('button') as HTMLButtonElement;
                        account.id = 'account';
                        account.className = 'topbarbutton';
                        account.onclick = function () {
                            window.location.href = '/account';
                        };
                        account.textContent = 'Account';

                        mobilemenu.appendChild(account);
                        topbarright.appendChild(account);

                        // Footer
                        (document.getElementById('footer') as HTMLDivElement).innerHTML = ` <!-- Plaese do not remove footer. It helps the developer of this software. --><p class="bigfooter"><a href="https://github.com/TheAFKGamer10/SASLEDiscordBot" target="_blank" class="footerlink">FiveM Discord Bot</a> by <a href="https://afkht.us/foot" target="_blank" class="footerlink">The AFK Gamer</a></p><p class="smallfooter">FiveM Discord Bot is not an official Discord or FiveM product. It is not affiliated with nor endorsed by Discord Inc. or Cfx.re.</p>`;
                    } else {
                        topbarleft.appendChild(loginButton);
                    }


                    // Light Dark Mode
                    const colourmodeDiv = document.createElement('div') as HTMLDivElement;
                    colourmodeDiv.id = 'colourmode';
                    colourmodeDiv.className = 'colourmode';

                    const lightdarkbutton = document.createElement('button') as HTMLButtonElement;
                    lightdarkbutton.id = 'lightdarkbutton';
                    lightdarkbutton.className = 'ldbutton';
                    lightdarkbutton.onclick = changeld;

                    const ldicon = document.createElement('img') as HTMLImageElement;
                    ldicon.id = 'ldicon';
                    ldicon.className = 'ldicon';

                    lightdarkbutton.appendChild(ldicon);
                    colourmodeDiv.appendChild(lightdarkbutton);
                    topbarright.appendChild(colourmodeDiv);

                    const body = document.getElementById("body") as HTMLBodyElement;
                    const savedColor = sessionStorage.getItem("lightdark");
                    if (savedColor === "light") {
                        body.classList.remove("dark");
                        body.classList.add("light");
                        ldicon.src = "/public/img/sun.svg";
                    } else if (savedColor === "dark") {
                        body.classList.remove("light");
                        body.classList.add("dark");
                        ldicon.src = "/public/img/moon.svg";
                    } else {
                        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                            body.classList.remove("light");
                            body.classList.add("dark");
                            ldicon.src = "/public/img/moon.svg";
                        } else {
                            body.classList.remove("dark");
                            body.classList.add("light");
                            ldicon.src = "/public/img/sun.svg";
                        }
                    }


                    if (window.innerWidth > 800) {
                        // document.getElementById('top-bar-left').style.display = 'block';
                        mobilemenu.style.display = 'none';
                        mobilemenu.classList.remove('show');
                        hamburgerButton.style.display = 'none';
                    } else {
                        // document.getElementById('top-bar-left').style.display = 'none';
                        mobilemenu.style.display = 'block';
                        mobilemenu.style.justifyContent = 'center';
                        mobilemenu.style.alignItems = 'center';

                        if (data.cookie) {
                            mobilemenu.appendChild(logoutButton);
                        } else {
                            mobilemenu.appendChild(loginButton);
                        }

                        let colourmodeDiv = document.getElementById('colourmode') as HTMLDivElement;
                        loginButton.classList.remove('topbarbutton');
                        logoutButton.classList.remove('topbarbutton');
                        loginButton.classList.add('handburgeritem');
                        logoutButton.classList.add('handburgeritem');
                        topbarright.prepend(colourmodeDiv);

                        if (data.cookie) {
                            let account = document.getElementById('account') as HTMLButtonElement;
                            account.classList.remove('topbarbutton');
                            account.classList.add('handburgeritem');
                            topbarright.removeChild(account);
                            mobilemenu.insertBefore(account, mobilemenu.lastChild);
                        }
                    }
                });
        });
};


function changeld() {
    const ldbutton = document.getElementById("lightdarkbutton") as HTMLButtonElement;
    const body = document.getElementById("body") as HTMLBodyElement;
    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
        body.classList.add("light");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/sun.svg" /> `;
        sessionStorage.setItem("lightdark", "light");
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        ldbutton.innerHTML = `<img id="ldicon" class="ldicon" src="/public/img/moon.svg" /> `;
        sessionStorage.setItem("lightdark", "dark");
    }
}

function closeAnnouncement() {
    const announcement = document.getElementById('announcement') as HTMLDivElement;
    if (announcement) {
        announcement.style.display = 'none';
    }
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

