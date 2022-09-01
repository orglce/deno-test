const scrollingItemHeight = 70;
const scrollingDiv = document.getElementById('div-scrolling');
const howManyItemsToAdd = 20;
let chatItems = [];

let currentOccuranceNum = 1;
let currentOccurances = []

document.getElementById("input-search").focus()
getChatItemsBySearch("drek")

document.getElementById("button-search").addEventListener('click', function () {
    getChatItemsBySearch(document.getElementById("input-search").value);

});

document.getElementById("input-search").addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        getChatItemsBySearch(document.getElementById("input-search").value);
    }
});

document.getElementById("button-search-up").addEventListener('click', function () {
   if (currentOccuranceNum > 1) {
       currentOccuranceNum--;
       document.getElementById("label-num-occurance").innerHTML = currentOccuranceNum;
       getItemsAroundID(currentOccurances[currentOccuranceNum-1][ID]);
   }
});
document.getElementById("button-search-down").addEventListener('click', function () {
    if (currentOccuranceNum < currentOccurances.length) {
        currentOccuranceNum++;
        document.getElementById("label-num-occurance").innerHTML = currentOccuranceNum;
        getItemsAroundID(currentOccurances[currentOccuranceNum-1][ID]);
    }
});

function getItemsAroundID(id) {
    fetchChatItems(id, true).then((data) => {
        for (const item of data)
            addChatItemToScrollingDiv(item, true)
        if (id < 20) // if the answer is in the first 20 messages
            scrollingDiv.children[id-1].scrollIntoView();
        else
            scrollingDiv.children[20].scrollIntoView();
    }).catch((error) => {
        console.log(error)
    });
}

function getChatItemsBySearch(text) {
    fetch('http://localhost:8000/search?'
        + new URLSearchParams({
            searchText: text,
        })).then(r => r.json()).then(data => {
        currentOccurances = data
        currentOccuranceNum = 1;
        document.getElementById("label-count-occurance").innerHTML = currentOccurances.length;
        document.getElementById("label-num-occurance").innerHTML = currentOccuranceNum;
        getItemsAroundID(data[0][ID]);
    }).catch((error) => {
        console.log(error)
        document.getElementById("label-count-occurance").innerHTML = 0;
        document.getElementById("label-num-occurance").innerHTML = 0;
    });
}

scrollingDiv.addEventListener("scroll", () => {
    const toBottom = scrollingDiv.scrollHeight - scrollingDiv.offsetHeight - scrollingDiv.scrollTop
    const toTop = scrollingDiv.scrollTop

    if (toTop !== 0) { // prevent initial scroll caused by .scrollIntoView()
        if (toBottom < scrollingItemHeight) {
            // fetch items at the end of chat
            fetchChatItems(-1, true).then((data) => {
                for (const item of data)
                    addChatItemToScrollingDiv(item, true)
            }).catch((error) => {
                console.log(error)
            });
        }
        if (toTop < scrollingItemHeight) {
            // fetch items at the start of chat
            fetchChatItems(-1, false).then((data) => {
                data.reverse()
                for (const item of data)
                    addChatItemToScrollingDiv(item, false)
            }).catch((error) => {
                console.log(error)
            });
        }
    }


});

function addChatItemToScrollingDiv(item, append) {

    // new chat item
    const text = item[BODY];
    const scrollingItem = createElement('div', "scrolling-item " + (item[SENDER] ? "sender" : "responder"));
    const dateDiv = createElement('div', "scrolling-item-date", new Date(item[DATE]).toLocaleString("sl-SI"));
    const textDiv = createElement('div', "scrolling-item-text", text);
    const reactionDiv = createElement('div', "scrolling-item-reaction", item[REACTION]);
    scrollingItem.appendChild(dateDiv);

    if (item[REPLAY_BODY] !== null) {
        const replyDiv = createElement('div', "scrolling-item-reply", item[REPLAY_BODY]);
        replyDiv.className += " " + (item[SENDER] ? "sender-reply" : "responder-reply");
        scrollingItem.appendChild(replyDiv);
    }

    scrollingItem.appendChild(textDiv);

    if (append) {
        chatItems.push(item)
        scrollingDiv.appendChild(scrollingItem);
    } else {
        console.log("drek")
        chatItems.unshift(item)
        scrollingDiv.prepend(scrollingItem);
    }

    if (item[REACTION] !== null) {
        scrollingItem.appendChild(reactionDiv);
        reactionDiv.className += item[SENDER] ? " scrolling-item-reaction-sender" : " scrolling-item-reaction-responder";
        const halfOfReaction = reactionDiv.offsetHeight / 2;
        reactionDiv.style.bottom = -halfOfReaction + "px";
        textDiv.style.marginBottom = halfOfReaction + "px";
        scrollingItem.style.marginBottom = (halfOfReaction + 10) + "px";
    }
}

async function fetchChatItems(id, append) {
    let startIndex, endIndex;

    if (id !== -1) { // if searching for specific index
        scrollingDiv.innerHTML = "";
        chatItems = [];
        startIndex = id - howManyItemsToAdd;
        endIndex = id + howManyItemsToAdd;
    } else { // if scrolling and refreshing
        if (append) {
            startIndex = chatItems[chatItems.length - 1][ID];
            endIndex = startIndex + howManyItemsToAdd;
        } else {
            endIndex = chatItems[0][ID];
            startIndex = endIndex - howManyItemsToAdd;
            console.log(startIndex, endIndex);
        }
    }

    const response = await fetch('http://localhost:8000/data?'
        + new URLSearchParams({
            startIndex: startIndex,
            endIndex: endIndex,
            date: new Date().toISOString()
        }));
    return await response.json()
}

function createElement(type, className, text) {
    const element = document.createElement(type)
    element.className = className

    if (text) {
        if (text.includes("http") || text.includes("www")) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            element.innerHTML = text.replace(urlRegex, function(url) {
                return '<a href="' + url + '" target=\"_blank\" rel=\"noopener noreferrer\">' + url + '</a><br>';
            })
        } else {
            element.innerHTML = text
        }
    }

    return element
}

