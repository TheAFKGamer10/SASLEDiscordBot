"use strict";

function pageloaded() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {changeld();} 

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