const ul = document.getElementById("menu-tabs");
const tabsData = document.getElementsByClassName("tab-data");
const blacklistTab = document.getElementById("show-blacklist");
let blacklists = {};

chrome.runtime.sendMessage({ action: "getBlacklist" }, (response) => {
    console.log("Blacklists OK :: ", response)

    blacklists = response;

    displayBlacklist();
});

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
    console.log(blacklists);
    
    Object.entries(blacklists).forEach(([key, list]) => {
        list.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
        // console.log(list)
        // list.
        // const li = document.createElement('li');
        // li.textContent = list
    });
    blacklistTab.appendChild(ul);
};