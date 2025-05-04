let blacklistIA = [];
let blacklistFakeNews = [];
let blacklistBrainspam = [];
let blacklistUser = [];
let whitelist = [];
const temporaryAllowed = new Set();

fetch(chrome.runtime.getURL('data/blacklist.json'))
    .then(response => response.json())
    .then(data => {
        blacklistIA = data['blacklist-ia'];
        blacklistFakeNews = data['blacklist-fakenews'];
        blacklistBrainspam = data['blacklist-brainspam'];
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

chrome.runtime.onMessage.addListener((message, sender) => {
    temporaryAllowed.add(message.domain);
    console.log(`Allow to visit ${message.domain} temporary.`);
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
