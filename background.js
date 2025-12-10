chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.local.set({ bookmarks: [] }, function () {});
    }
});

let showNotification = (id, title, message) => {
    chrome.notifications.create(
        id + Date.now(),
        {
            type: "basic",
            iconUrl: "icons/100.png",
            title: title,
            message: message,
        },
        () => {}
    );
};

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.addBookmark) {
        chrome.storage.local.get("bookmarks", (data) => {
            let message;
            if (chrome.runtime.lastError) showNotification("storageGetError", "Error", chrome.runtime.lastError.message);
            else {
                let bookmarks = data.bookmarks;
                let foundBookmark;
                bookmarks.forEach((bookmark) => {
                    if (bookmark.title == request.bookmark.title) foundBookmark = bookmark;
                });
                if (foundBookmark) {
                    foundBookmark.count += 1;
                    message = "Ad already in storage";
                } else {
                    bookmarks.push(request.bookmark);
                    message = "Ad saved successfully";
                }

                chrome.storage.local.set({ bookmarks: bookmarks }, () => {
                    if (chrome.runtime.lastError) showNotification("storageSetError", "Error", chrome.runtime.lastError.message);
                    else showNotification("successMessage", "Bookmark Saved", message);
                });
            }
        });
        sendResponse("complete");
    }
});
