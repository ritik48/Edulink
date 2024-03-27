let capturedUrls = [];
let base_url;

let tabChangeMessage = {};

function getCode(url, code) {
    const regex = new RegExp(`${code}~[^/?&!@#$%^*()+={}[\\]\\\|;:'",<>.]*`);

    const match = url.match(regex);

    if (match) {
        const extractedString = match[0];
        return extractedString;
    } else {
        return false;
    }
}

function getPeerCode(url) {
    const regex = /\/peer\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);

    if (!match) return false;
    return match[1];
}

function fetchRequest(result) {
    const { url } = result;

    const peerCode = getPeerCode(base_url);
    let code = getCode(url, peerCode);

    if (code && peerCode) {
        let requiredPart = code.split("~")[1];
        chrome.runtime.sendMessage({
            action: "found",
            data: base_url + requiredPart,
        });
    }
}

function checkAndSendMessage(url) {
    const allowedUrls = [
        "https://www.coursera.com/learn",
        "https://www.coursera.org/learn",
    ];

    if (allowedUrls.some((allowedUrl) => url.startsWith(allowedUrl))) {
        tabChangeMessage = {
            url: url,
            allowed: true,
            action: "website_status",
        };
        chrome.runtime.sendMessage(tabChangeMessage);
    } else {
        tabChangeMessage = {
            url: url,
            allowed: false,
            action: "website_status",
        };
        chrome.runtime.sendMessage(tabChangeMessage);
    }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "start") {
        chrome.tabs.query(
            { active: true, currentWindow: true },

            function (tabs) {
                if (tabs && tabs.length > 0) {
                    const activeTab = tabs[0];
                    const url = activeTab?.url;

                    if (url.match(/\/submit$/)) {
                        base_url = url.replace(/\/submit$/, "/review/");
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

    // when the user clicks on the extension the popup script send background script a message with flag = "get tab status" ,
    // to fetch the current tab url
    if (message.action === "get_tab_status") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url; // Get the URL of the active tab
            checkAndSendMessage(url); // Call function to check and send message
        });
    }
});
