const ul = document.getElementById("menu-tabs");
const tabsData = document.getElementsByClassName("tab-data");
const blacklistTab = document.getElementById("show-blacklist");
let blacklists = {};

setLists();

function setLists() {
    chrome.runtime.sendMessage({ action: "getBlacklist" }, (response) => {
        blacklists = response;
        displayBlacklist();
    });
}

ul.addEventListener(("click"), (event) => {
    const li = event.target.closest('li');
    const tabs = ul.children;
    console.log("UL CHILDS : " , tabs[0].id)
    console.log("target :: ["+li.id+"]")

    Array.from(tabs).forEach(tab => {
        (li.id !== tab.id) ? tab.classList.remove("active") : tab.classList.add("active");
    });

    Array.from(tabsData).forEach(tab => {
        const toDisplay = li.id.replace('tab-','');
        (toDisplay !== tab.id) ? tab.classList.add("hidden") : tab.classList.remove("hidden");
    });


});

function displayBlacklist() {
    console.info("DISPLAY BLACKLIST")
    const ul = document.createElement("ul");
    ul.classList.add("list");
    console.log('THE BLACKLIST // ',blacklists.blacklists);
    
    Object.entries(blacklists.blacklists).forEach(([key, list]) => {
        list.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            const btn = document.createElement('button');
            btn.textContent = "Ne pas bloquer";
            btn.value = item;
            btn.addEventListener(('click'), (event) => {
                chrome.runtime.sendMessage({ action: "setWhitelist", domain: event.target.value}, () => {
                    setLists();
                });
            })
            li.appendChild(btn);
            ul.appendChild(li);
        });
        
    });
    blacklistTab.appendChild(ul);
};