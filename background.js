let blacklists = [];
let blacklistUser = [];
let whitelist = [];
const temporaryAllowed = new Set();

fetch(chrome.runtime.getURL('data/blacklist.json'))
    .then(response => response.json())
    .then(data => {
        blacklists = data;
        chrome.storage.local.get( {"whitelist": [] }, (result) => {
            whitelist = result["whitelist"];
            whitelist.forEach(domain => {
                checkWhitelist(domain);
            })
        });
    })
    .catch(err => console.error(err));

console.info(":: AI Noise Filter • active ::");

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        if(![...temporaryAllowed].some(domain => url.hostname.includes(domain)) && (blacklistIA.some(domain => url.hostname.includes(domain)) || blacklistFakeNews.some(domain => url.hostname.includes(domain)))) {
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
        console.log(`Allow to visit ${message.domain} temporary.`);
    }

    if (message.action === "getBlacklist") {
        const data = {
            "blacklists": blacklists,
            "blacklist-user": blacklistUser,
            "whitelist": whitelist
        };
        console.info("datas :: ", data)
        sendResponse(data);
        return true;
    }

    if (message.action === "setWhitelist") {
        domain = message.domain;

        if(!whitelist.includes(domain)) {
            whitelist.push(domain);
            chrome.storage.local.set({ 'whitelist': whitelist }, () => {
                console.info(`domaine ${domain} ajouté aux exceptions`);
                checkWhitelist(domain);

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
                console.info(`Last tab for ${domain} was closed.`);
                temporaryAllowed.delete(domain);
            }
        });
    }
});

function checkWhitelist(domain) {
    Object.entries(blacklists).forEach(([key, list]) => {
        if (list.includes(domain)) {
            const idx = list.indexOf(domain);
            list.splice(idx, 1);
        }
    });
}
