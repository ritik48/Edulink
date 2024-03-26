let capturedUrls = [];
let base_url;

function fetchRequest(result) {
    const { url } = result;

    if (
        url.includes("q=submission&userId=") &&
        url.includes("&peerSubmissionId=")
    ) {
        const urlParts = url.split("~");
        const requiredPart = urlParts[2].split("&")[0];

        chrome.runtime.sendMessage({
            action: "found",
            data: base_url + requiredPart,
        });
    }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "start") {
        chrome.tabs.query(
            { active: true, currentWindow: true },

            function (tabs) {
                if (tabs && tabs.length > 0) {
                    console.log(tabs);
                    const activeTab = tabs[0];
                    const url = activeTab?.url;

                    if (url.includes("/submit")) {
                        base_url = url.replace("/submit", "/review/");
                        chrome.tabs.reload(activeTab.id);
                    } else {
                        base_url = url + "/review/";
                        chrome.tabs.update(
                            activeTab.id,
                            { url: url + "/submit" },
                            function () {}
                        );
                    }
                }
            }
        );
        console.log("=============== LISTENER ADDED ===================");
        chrome.webRequest.onBeforeRequest.addListener(
            fetchRequest,
            { urls: ["<all_urls>"] },
            ["requestBody"]
        );
    }
});
