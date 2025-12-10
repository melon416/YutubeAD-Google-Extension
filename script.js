let lastAdded = "";
let lookForAd = true;
let extensionId = document.querySelector(".ytBookMarksIDContainer").getAttribute("id");

let addBookmark = () => {
    let target = document.getElementById("movie_player");
    setTimeout(() => {
        let debugInfo = JSON.parse(target.getDebugText());
        let adVideoID = debugInfo.addebug_videoId;
        if (adVideoID && lastAdded != adVideoID) {
            lastAdded = adVideoID;
            let url = `https://youtube.com/watch?v=${adVideoID}`;
            let title = adVideoID;
            fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${adVideoID}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.title) title = data.title;
                    let bookmark = {
                        count: 1,
                        title: title,
                        url: url,
                    };
                    chrome.runtime.sendMessage(extensionId, { addBookmark: true, bookmark: bookmark }, () => {});
                });
        }
        lookForAd = true;
    }, 500);
};

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
            const adExists = mutation.target.classList.contains("ad-showing");
            if (adExists && lookForAd) {
                lookForAd = false;
                addBookmark();
            }
        }
    });
});

let checkForPlayer = setInterval(() => {
    const target = document.querySelector("#movie_player");
    if (target) {
        const config = { attributes: true, childList: false, subtree: false };
        observer.observe(target, config);
        clearInterval(checkForPlayer);
    }
}, 1000);
