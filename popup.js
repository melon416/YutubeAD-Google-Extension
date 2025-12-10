let bookmarks = [];
let currSharing = "";
let currDeleteing = "";

let formatTitle = (title, length) => {
    if (title.length > length) return title.substring(0, length) + "...";
    return title;
};

let renderList = (bookmarks) => {
    let bookmarksList = document.getElementById("bookmarks");
    bookmarksList.innerHTML = "";
    bookmarks.forEach((bookmark) => {
        bookmarksList.innerHTML += `<li class="bookmark">
                                        <a href="${bookmark.url}" class="bookmarkLink">
                                            ${formatTitle(bookmark.title, 20)} (${bookmark.count})
                                        </a>
                                        <div class="bookmarkIcons">
                                            <img data-url="${bookmark.url}" data-title="${bookmark.title}" class="icon shareIcon" src="icons/share.png" />
                                            <img data-url="${bookmark.url}" data-title="${bookmark.title}" class="icon deleteIcon" src="icons/delete.png" />
                                        </div>
                                    </li>`;
        updateLinks();
    });
};

chrome.storage.local.get("bookmarks", (data) => {
    bookmarks = data.bookmarks;
    renderList(bookmarks);
});

let toggleDiv = (div, show) => {
    if (show) div.classList.remove("d-none");
    else div.classList.add("d-none");
};

let remove = (array, key, value) => {
    const index = array.findIndex((obj) => obj[key] === value);
    return index >= 0 ? [...array.slice(0, index), ...array.slice(index + 1)] : array;
};

let updateLinks = () => {
    document.querySelectorAll(".bookmarkLink").forEach((link) => {
        link.onclick = (event) => {
            event.preventDefault();
            chrome.tabs.create({ url: link.href, active: false });
        };
    });

    document.querySelectorAll(".shareIcon").forEach((icon) => {
        icon.onclick = (event) => {
            toggleDiv(document.getElementById("deleteDiv"), false);
            let shareDiv = document.getElementById("shareDiv");
            if (currSharing == event.target.dataset) {
                toggleDiv(shareDiv, shareDiv.classList.contains("d-none"));
            } else {
                currSharing = event.target.dataset;
                if (shareDiv.classList.contains("d-none")) toggleDiv(shareDiv, true);
            }
            document.getElementById("shareTitle").innerText = formatTitle(currSharing.title, 28);
            document.getElementById("fbShareIcon").onclick = () => {
                let fbURL = "https://www.facebook.com/sharer/sharer.php?u=" + currSharing.url + "&t=" + currSharing.title;
                chrome.tabs.create({ url: fbURL, active: false });
            };
            document.getElementById("twitShareIcon").onclick = () => {
                let twitURL = "https://twitter.com/share?url=" + currSharing.url + "&text=" + currSharing.title;
                chrome.tabs.create({ url: twitURL, active: false });
            };
        };
    });

    document.querySelectorAll(".deleteIcon").forEach((icon) => {
        icon.onclick = (event) => {
            toggleDiv(document.getElementById("shareDiv"), false);
            let delDiv = document.getElementById("deleteDiv");
            if (currDeleteing == event.target.dataset) {
                toggleDiv(delDiv, delDiv.classList.contains("d-none"));
            } else {
                currDeleteing = event.target.dataset;
                if (delDiv.classList.contains("d-none")) toggleDiv(delDiv, true);
            }
            document.getElementById("deleteTitle").innerText = "Delete " + formatTitle(currDeleteing.title, 20) + "?";
            document.getElementById("cancelDelBtn").onclick = () => {
                toggleDiv(delDiv, false);
            };
            document.getElementById("confirmDelBtn").onclick = () => {
                bookmarks = remove(bookmarks, "url", currDeleteing.url);
                chrome.storage.local.set({ bookmarks: bookmarks }, () => {
                    toggleDiv(delDiv, false);
                    renderList(bookmarks);
                });
            };
        };
    });
};

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) a.splice(j--, 1);
        }
    }

    return a;
};

let getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
};

let addBookmarks = (newBookmarks) => {
    chrome.storage.local.get("bookmarks", (data) => {
        let oldBookmarks = [...data.bookmarks];
        let final = oldBookmarks.concat(newBookmarks);
        final = getUniqueListBy(final, "url");
        //Backward Compatibility
        final.forEach((bookmark) => {
            if (!bookmark.count) bookmark.count = 1;
        });
        //
        chrome.storage.local.set({ bookmarks: final }, function () {
            location.reload();
        });
    });
};

document.getElementById("settingsIcon").addEventListener("click", (e) => {
    let ieDiv = document.getElementById("ieportDiv");
    toggleDiv(ieDiv, ieDiv.classList.contains("d-none"));
});

document.getElementById("jsonInput").onchange = (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = (readerEvent) => {
        var content = readerEvent.target.result;
        if (JSON.parse(content)) {
            let data = JSON.parse(content);
            addBookmarks(data);
        }
    };
};

document.getElementById("importBtn").addEventListener("click", (e) => {
    document.getElementById("jsonInput").click();
});

document.getElementById("exportBtn").addEventListener("click", (e) => {
    const filename = "bookmarks.json";
    const jsonStr = JSON.stringify(bookmarks);

    let element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(jsonStr));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
});

// Add this new handler for Delete All button
document.getElementById("deleteAllBtn").addEventListener("click", (e) => {
    if (confirm("Are you sure you want to delete all bookmarks? This action cannot be undone.")) {
        bookmarks = [];
        chrome.storage.local.set({ bookmarks: [] }, () => {
            renderList(bookmarks);
        });
    }
});