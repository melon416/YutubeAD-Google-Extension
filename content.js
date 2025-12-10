let idNode = document.createElement("div");
idNode.setAttribute("id", chrome.runtime.id);
idNode.setAttribute("class", "ytBookMarksIDContainer");
idNode.style.display = "none";
document.body.appendChild(idNode);

var s = document.createElement("script");
s.src = chrome.runtime.getURL("script.js");
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
