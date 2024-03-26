const fetch_status = document.querySelector(".status");
const fetchBtn = document.querySelector(".get-link");
const urlList = document.getElementById("urlList");
const link = document.querySelector(".link");

let allowed = false;

fetchBtn.addEventListener("click", () => {
    if (!allowed) {
        return;
    }
    link.innerText = "";

    fetch_status.style.display = "block";
    fetch_status.classList.remove("active");
    fetch_status.innerText = "Loading...";

    chrome.runtime.sendMessage({ action: "start" });
});

// when user click on the extension, then extension will ask for the current tab url from the background script,
// and then will decide whether the current site is valid or not not fetch the link
chrome.runtime.sendMessage({ action: "get_tab_status" });

chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "website_status") {
        changeExtensionStatus(message.allowed);
    }
    if (message.action === "found") {
        const data = message.data;

        fetch_status.classList.add("active");
        fetch_status.innerText = "copy the link";

        link.style.display = "block";
        link.innerText = data;
    }
});

const changeExtensionStatus = (active) => {
    if (active) {
        allowed = true;
    } else {
        link.style.display = "block";
        link.innerText = "Cannot use this extension on this page.\nGo to coursera assignment page.";
        fetchBtn.disabled = true;
        fetchBtn.style.cursor = "not-allowed";
        allowed = false;
    }
};

fetch_status.addEventListener("click", function () {
    // Copy text to clipboard
    if (!fetch_status.classList.contains("active")) {
        return;
    }
    navigator.clipboard
        .writeText(link.innerText)
        .then(() => {
            fetch_status.innerText = "copied.";
            setTimeout(() => {
                fetch_status.innerText = "copy link";
            }, 2000);
        })
        .catch(() => console.log("cannot copy the link"));
});
