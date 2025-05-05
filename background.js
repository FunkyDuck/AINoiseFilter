let blacklists = [];
let blacklistUser = [];
let whitelist = [];
const temporaryAllowed = new Set();

fetchLists();

console.info(":: AI Noise Filter • active ::");

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        if(![...temporaryAllowed].some(domain => url.hostname.includes(domain)) && (blacklists["blacklist-ia"].some(domain => url.hostname.includes(domain)) || blacklists["blacklist-brainspam"].some(domain => url.hostname.includes(domain)) || blacklists['blacklist-fakenews'].some(domain => url.hostname.includes(domain)) || blacklistUser.some(domain => url.hostname.includes(domain)))) {
            console.warn("! BLACKLISTED DOMAIN FOUND !");
            return { redirectUrl: chrome.runtime.getURL(`index.html?url=${encodeURIComponent(details.url)}`) };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "allowTemporarily") {
        temporaryAllowed.add(message.domain);
        console.info(`Allow to visit ${message.domain} temporary.`);
    }

    if (message.action === "getBlacklist") {
        const data = {
            "blacklists": blacklists,
            "customlist": blacklistUser,
            "whitelist": whitelist
        };
        sendResponse(data);
        return true;
    }

    if (message.action === "setWhitelist") {
        domain = message.domain;

        if(!whitelist.includes(domain)) {
            whitelist.push(domain);
            chrome.storage.local.set({ 'whitelist': whitelist }, () => {
                console.info(`domain ${domain} added to exceptions`);
                checkWhitelist(domain);
            });
        }
        else {
            const idx = whitelist.indexOf(domain);
            whitelist.splice(idx, 1);
            chrome.storage.local.set({ 'whitelist': whitelist }, () => {
                console.info(`Domain ${domain} removed from exceptions`);
                fetchLists();
            });
        }
    }

    if (message.action === "setBlacklistUser") {
        domain = message.domain;

        if (!blacklistUser.includes(domain)) {
            blacklistUser.push(domain);
            chrome.storage.local.set({ 'customlist': blacklistUser }, () => {
                console.info(`Domain ${domain} added to your custom blacklist`);
            });
        }
        else {
            const idx = blacklistUser.indexOf(domain);
            blacklistUser.splice(idx, 1);
            chrome.storage.local.set({ 'customlist': blacklistUser }, () => {
                console.info(`Domain ${domain} removed from your custom blacklist`);
                fetchLists();
            });
        }
    }
});

chrome.tabs.onRemoved.addListener((closedTab) => {
    for (const domain of temporaryAllowed) {
        chrome.tabs.query({}, (tabs) => {
            const stillOpen = tabs.some(tab => {
                try {
                    const url = new URL(tab.url);
                    return url.hostname.endsWith(domain);
                } catch (err) {
                    console.error(err);
                    return false;
                }
            });

            if(!stillOpen) {
                console.info(`Last tab for excepted ${domain} was closed.`);
                temporaryAllowed.delete(domain);
            }
        });
    }
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

function fetchLists() {
    fetch(chrome.runtime.getURL('data/blacklist.json'))
    .then(response => response.json())
    .then(data => {
        blacklists = data;
        chrome.storage.local.get( {"whitelist": [], "customlist": [] }, (result) => {
            whitelist = result["whitelist"];
            whitelist.forEach(domain => {
                checkWhitelist(domain);
            })
            blacklistUser = result["customlist"];
        });
    })
    .catch(err => console.error(err));
}

function checkWhitelist(domain) {
    Object.entries(blacklists).forEach(([key, list]) => {
        if (list.includes(domain)) {
            const idx = list.indexOf(domain);
            list.splice(idx, 1);
        }
    });
}
