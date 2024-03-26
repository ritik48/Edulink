const fetch_status = document.querySelector(".status");
const fetchBtn = document.querySelector(".get-link");
const urlList = document.getElementById("urlList");
const link = document.querySelector(".link");

fetchBtn.addEventListener("click", () => {
    link.innerText = "";

    fetch_status.style.display = "block";
    fetch_status.classList.remove("active");
    fetch_status.innerText = "Loading...";

    chrome.runtime.sendMessage({ action: "start" });
});

chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "found") {
        const data = message.data;

        fetch_status.classList.add("active");
        fetch_status.innerText = "copy the link";

        link.style.display = "block";
        link.innerText = message.data;
    }
});


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
