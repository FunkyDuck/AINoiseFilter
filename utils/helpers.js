document.getElementById("view-site-btn").addEventListener("click", function() {
    const targetUrl = decodeURIComponent(window.location.search.replace('?url=',''));

    try {
        const parsedUrl = new URL(targetUrl);
        let hostname = parsedUrl.hostname;

        if(hostname.startsWith("www.")) {
            hostname = hostname.slice(4);
        }

        const domainParts = hostname.split(".");
        const domain = domainParts.slice(-2).join(".");

        chrome.runtime.sendMessage({
            action: "allowTemporarily",
            domain: domain
        });

        window.location.href = targetUrl;
    }
    catch (err) {
        console.error(err);
    }
});

document.getElementById("back-btn").addEventListener("click", function() {
    window.history.back();
});