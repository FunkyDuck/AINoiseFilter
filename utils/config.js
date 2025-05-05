const ulTabs = document.getElementById("menu-tabs");
const tabsData = document.getElementsByClassName("tab-data");
const blacklistTab = document.getElementById("show-blacklist");
const addCustomListBtn = document.getElementById("add-blacklist-user-btn");
let lists = {};

setLists();

function setLists() {
    chrome.runtime.sendMessage({ action: "getBlacklist" }, (response) => {
        lists = response;
        displayBlacklist();
    });
}

addCustomListBtn.addEventListener(("click"), (event) => {
    const domain = document.getElementById("link-user").value.trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

    chrome.runtime.sendMessage({ action: "setBlacklistUser", domain: domain }, () => {
        setTimeout(() => {
            setLists();
            domain.value = null;
        }, 1);
    });
});

ulTabs.addEventListener(("click"), (event) => {
    const li = event.target.closest('li');
    const tabs = ulTabs.children;

    Array.from(tabs).forEach(tab => {
        (li.id !== tab.id) ? tab.classList.remove("active") : tab.classList.add("active");
    });

    Array.from(tabsData).forEach(tab => {
        const toDisplay = li.id.replace('tab-','');
        (toDisplay !== tab.id) ? tab.classList.add("hidden") : tab.classList.remove("hidden");
    });
});

function displayBlacklist() {
    const ul = document.createElement("ul");
    ul.classList.add("list");

    const liBlacklist = document.createElement('li');
    const hBlacklist = document.createElement('h2');
    hBlacklist.textContent = "Blacklist";
    liBlacklist.appendChild(hBlacklist);
    ul.appendChild(liBlacklist);
    
    Object.entries(lists.blacklists).forEach(([key, list]) => {
        list.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            const btn = document.createElement('button');
            btn.textContent = "Ne pas bloquer";
            btn.value = item;
            btn.addEventListener(('click'), (event) => {
                chrome.runtime.sendMessage({ action: "setWhitelist", domain: event.target.value}, () => {
                    ul.remove();
                    setTimeout(()=>{
                        setLists();
                    }, 1);
                });
            })
            li.appendChild(btn);
            ul.appendChild(li);
        });
        
    });

    const liWhitelist = document.createElement('li');
    const hWhitelist = document.createElement('h2');
    hWhitelist.textContent = "Whitelist";
    liWhitelist.appendChild(hWhitelist);
    ul.appendChild(liWhitelist);

    lists.whitelist.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        const btn = document.createElement('button');
        btn.textContent = "Bloquer";
        btn.value = item;
        btn.addEventListener(('click'), (event) => {
            chrome.runtime.sendMessage({ action: "setWhitelist", domain: event.target.value }, () => {
                ul.remove();
                setTimeout(() => {
                    setLists();
                }, 1);
            });
        });
        li.appendChild(btn);
        ul.appendChild(li);
    });

    const liBlacklistUser = document.createElement('li');
    const hBlacklistUser = document.createElement('h2');
    hBlacklistUser.textContent = "User custom blacklist";
    liBlacklistUser.appendChild(hBlacklistUser);
    ul.appendChild(liBlacklistUser);

    lists.customlist.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        const btn = document.createElement('button');
        btn.textContent = "Débloquer";
        btn.value = item;
        btn.addEventListener(('click'), (event) => {
            chrome.runtime.sendMessage({ action: "setBlacklistUser", domain: event.target.value }, () => {
                ul.remove();
                setTimeout(() => {
                    setLists();
                }, 1);
            });
        });
        li.appendChild(btn);
        ul.appendChild(li);
    });

    blacklistTab.appendChild(ul);
};