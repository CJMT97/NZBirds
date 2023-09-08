const URL = "https://temch584.cspages.otago.ac.nz/nzbirds/data/nzbird.json";

function removeDiacritics(maoriWord) {
    return maoriWord.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Function to create a bird element
 */
function createBirdElement() {

    //Fetches the bird data from the server
    fetch("./data/nzbird.json").then((response) => response.text()).then((data) => {

        // Create variables for storing the info, search value
        let info = JSON.parse(data);
        let search = document.getElementById('search').value.toLowerCase();
        let status = document.getElementById('conservation-status').value;

        // Removes current birds from the webpage
        let birdc = document.querySelector(".bird");
        while (birdc.firstChild) {
            birdc.removeChild(birdc.firstChild);
        }

        // Create a Array with just the birds that are allowed
        let currbirds = [];
        let index = 0;
        for (let i = 0; i < info.length; i++) {
            let mName = info[i].primary_name.toLowerCase();
            let eName = info[i].english_name.toLowerCase();
            let fName = info[i].family.toLowerCase();
            let oNames = info[i].other_names;
            let isMatch = removeDiacritics(mName).startsWith(removeDiacritics(search)) || removeDiacritics(eName).startsWith(removeDiacritics(search)) || removeDiacritics(fName).startsWith(removeDiacritics(search)) || search === "";



            // loop through the othernames to see if its a match
            for (let i = 0; i < oNames.length; i++) {
                if (removeDiacritics(oNames[i].toLowerCase()).startsWith(removeDiacritics(search))) {
                    isMatch = true;
                }
            }

            let isStatus = status === info[i].status || status === "All"
            if (isMatch && isStatus) {
                currbirds[index] = info[i];
                index++;
            }
        }

        // Sort the array with respect to the sortby value
        sortBy(currbirds);

        // Creates the objects that the birds are made in
        for (let i = 0; i < currbirds.length; i++) {

            let flipbox = document.createElement('div');
            let flipbox_inner = document.createElement('div');
            let flipbox_front = document.createElement('div');
            let flipbox_back = document.createElement('div');
            let infocard = document.createElement('div');
            let circle = document.createElement('div');
            let content = document.createElement("div");

            //Set content elements
            let names = document.createElement("h3");
            names.setAttribute("class", "names");
            names.textContent = currbirds[i].primary_name + "/" + currbirds[i].english_name;
            content.append(names);

            let facts = createContent(currbirds[i]);
            content.append(facts);

            let photo_credit = document.createElement("p");
            photo_credit.setAttribute("class", "credit-p");
            photo_credit.textContent = "📷 Credit: " + currbirds[i].photo.credit;
            content.append(photo_credit);

            flipbox.setAttribute("class", "flip-box");
            flipbox_inner.setAttribute("class", "flip-box-inner");
            flipbox_front.setAttribute("class", "flip-box-front");
            flipbox_back.setAttribute("class", "flip-box-back");
            content.setAttribute("class", "info-card-back ");

            let h2 = document.createElement('h2');
            h2.textContent = currbirds[i].primary_name;
            h2.setAttribute("class", "mbirdname");

            let img = document.createElement('img');
            img.setAttribute("class", "info-card-pic");
            img.src = currbirds[i].photo.source;

            circle.setAttribute("class", "circle");
            circle.style.backgroundColor = getBirdColor(currbirds[i].status);

            infocard.setAttribute("class", "info-card");
            infocard.append(img);
            infocard.append(h2);
            infocard.append(circle);

            flipbox_front.append(infocard);
            flipbox_back.append(content);
            flipbox_inner.append(flipbox_front);
            flipbox_inner.append(flipbox_back);
            flipbox.append(flipbox_inner);
            birdc.append(flipbox);

            flipbox.addEventListener('click', toggleFlip);
        }
        let cusPadding = document.createElement("div");
        cusPadding.setAttribute("class", "cusP");
        birdc.append(cusPadding);
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function toggleFlip(flipbox) {
    flipbox = flipbox.target;
    while (!flipbox.classList.contains("flip-box")) {
        flipbox = flipbox.parentElement;
    }
    flipbox.classList.toggle("front");

    let existingPin = flipbox.querySelector(".pin");

    const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
    if (isSmallScreen) {
        if (existingPin) {
            flipbox.removeChild(existingPin);
        } else {
            let pin = document.createElement("div");
            pin.setAttribute("class", "pin");
            await delay(350);
            flipbox.append(pin);
        }
    } else {
        if (existingPin) {
            flipbox.removeChild(existingPin);
        } else {
            let pin = document.createElement("div");
            pin.setAttribute("class", "pin");
            flipbox.append(pin);
        }
    }
}


function sortBy(birds) {
    let sortbyValue = document.getElementById('sort-by').value;
    if (sortbyValue == 1) {
        birds.sort((b1, b2) => b1.size.weight.value - b2.size.weight.value);
    }
    if (sortbyValue == 2) {
        birds.sort((b1, b2) => b2.size.weight.value - b1.size.weight.value);
    }
    if (sortbyValue == 3) {
        birds.sort((b1, b2) => b1.primary_name.localeCompare(b2.primary_name));
    }
    if (sortbyValue == 4) {
        birds.sort((b1, b2) => b2.primary_name.localeCompare(b1.primary_name));
    }
    if (sortbyValue == 5) {
        birds.sort((b1, b2) => b1.english_name.localeCompare(b2.english_name));
    }
    if (sortbyValue == 6) {
        birds.sort((b1, b2) => b2.english_name.localeCompare(b1.english_name));
    }
    if (sortbyValue == 7) {
        birds.sort((b1, b2) => getStatusLevel(b1.status) - getStatusLevel(b2.status));
    }
    if (sortbyValue == 8) {
        birds.sort((b1, b2) => getStatusLevel(b2.status) - getStatusLevel(b1.status));
    }
}


function getStatusLevel(status) {
    if (status === "Not Threatened") {
        return 1;
    } else if (status === "Naturally Uncommon") {
        return 2;
    } else if (status === "Relict") {
        return 3;
    } else if (status === "Recovering") {
        return 4;
    } else if (status === "Declining") {
        return 5;
    } else if (status === "Nationally Increasing") {
        return 6;
    } else if (status === "Nationally Vulnerable") {
        return 7;
    } else if (status === "Nationally Endangered") {
        return 8;
    } else if (status === "Nationally Critical") {
        return 9;
    } else {
        return 10;
    }
}

/**
 * CreateContent function makes the element the the bird infomation is stored in
 * @param {*} data The data of the bird
 * @returns 
 */
function createContent(data) {
    let title1 = document.createElement("p");
    let title2 = document.createElement("p");
    let title3 = document.createElement("p");
    let title4 = document.createElement("p");
    let title5 = document.createElement("p");
    let title6 = document.createElement("p");

    let facts = document.createElement("div");

    facts.setAttribute("class", "grid");
    title1.setAttribute("class", "title-p");
    title2.setAttribute("class", "title-p");
    title3.setAttribute("class", "title-p");
    title4.setAttribute("class", "title-p");
    title5.setAttribute("class", "title-p");
    title6.setAttribute("class", "title-p");

    title1.innerHTML = '<strong>Scientific Name: </strong>';
    title2.innerHTML = '<strong>Family: </strong>';
    title3.innerHTML = '<strong>Order: </strong>';
    title4.innerHTML = '<strong>Status: </strong>';
    title5.innerHTML = '<strong>Length: </strong>';
    title6.innerHTML = '<strong>Weight: </strong>';

    let info1 = document.createElement("p");
    let info2 = document.createElement("p");
    let info3 = document.createElement("p");
    let info4 = document.createElement("p");
    let info5 = document.createElement("p");
    let info6 = document.createElement("p");

    info1.setAttribute("class", "info-p");
    info2.setAttribute("class", "info-p");
    info3.setAttribute("class", "info-p");
    info4.setAttribute("class", "info-p");
    info5.setAttribute("class", "info-p");
    info6.setAttribute("class", "info-p");

    info1.textContent = data.scientific_name;
    info2.textContent = data.family;
    info3.textContent = data.order;
    info4.textContent = data.status;
    info5.textContent = data.size.length.value + data.size.length.units;
    info6.textContent = data.size.weight.value + data.size.weight.units;

    facts.append(title1);
    facts.append(info1);
    facts.append(title2);
    facts.append(info2);
    facts.append(title3);
    facts.append(info3);
    facts.append(title4);
    facts.append(info4);
    facts.append(title5);
    facts.append(info5);
    facts.append(title6);
    facts.append(info6);

    return facts;
}

/**
 * getBirdColor function determines the color of the birds conservation status
 * @param {*} status 
 * @returns 
 */
function getBirdColor(status) {
    if (status === "Not Threatened") {
        return "#02a028";
    } else if (status === "Naturally Uncommon") {
        return "#649a31";
    } else if (status === "Relict") {
        return "#99cb68";
    } else if (status === "Recovering") {
        return "#fecc33";
    } else if (status === "Declining") {
        return "#fe9a01";
    } else if (status === "Nationally Increasing") {
        return "#c26967";
    } else if (status === "Nationally Vulnerable") {
        return "#9b0000";
    }
    else if (status === "Nationally Endangered") {
        return "#660032";
    }
    else if (status === "Nationally Critical") {
        return "#320033";
    }
    else {
        return "black";
    }
}

function toggleFilter() {
    let button = document.getElementById("menu");
    button.classList.toggle("change");

    var filter = document.querySelector(".filter");
    var bird = document.querySelector(".bird");
    var grid = document.querySelector(".container");

    const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
    let computedStyle = window.getComputedStyle(filter);

    if (!isSmallScreen) {
        if (computedStyle.display === "none") {
            filter.style.display = "block";
            grid.style.gridTemplateColumns = "315px 1fr";
            grid.style.gridTemplateAreas = '"header header" "filter bird" "footer footer"';
        } else {
            filter.style.display = "none";
            grid.style.gridTemplateColumns = "1fr";
            grid.style.gridTemplateAreas = '"header" "bird" "footer"';
        }
    } else {
        if (computedStyle.display === "none" || computedStyle.display === "") {
            filter.style.display = "flex";
            filter.style.flexDirection = "column";
            bird.style.display = "none";
            grid.style.gridTemplateAreas = '"header" "filter" "footer"';
        } else {
            filter.style.display = "none";
            bird.style.display = "flex";
            grid.style.gridTemplateAreas = '"header" "bird" "footer"';
        }
    }
    return;
}

function toggleFilterLayout() {
    var filter = document.querySelector(".filter");
    var bird = document.querySelector(".bird");
    var grid = document.querySelector(".container");

    const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
    let computedStyle = window.getComputedStyle(filter);
    if (isSmallScreen) {
        if (computedStyle.display == "none") {
            filter.style.display = "none";
            bird.style.display = "flex";
            grid.style.gridTemplateColumns = "1fr";
            grid.style.gridTemplateAreas = '"header" "bird" "footer"';

        } else {
            filter.style.display = "flex";
            filter.style.flexDirection = "column";
            bird.style.display = "none";
            grid.style.gridTemplateColumns = "1fr";
            grid.style.gridTemplateAreas = '"header" "filter" "footer"';
        }
    } else {
        if (computedStyle.display == "none") {
            filter.style.display = "none";
            bird.style.display = "flex";
            grid.style.gridTemplateColumns = "1fr";
            grid.style.gridTemplateAreas = '"header" "bird" "footer"';
        } else {
            filter.style.display = "fixed";
            bird.style.display = "flex";
            grid.style.gridTemplateColumns = "315px 1fr";
            grid.style.gridTemplateAreas = '"header header" "filter bird" "footer footer"';
        }
    }
}

createBirdElement();

let btnRef = document.querySelector("#filter-button");
btnRef.addEventListener('click', createBirdElement);

let menuBtn = document.querySelector("#menu-button");
menuBtn.addEventListener('click', toggleFilter);

window.addEventListener("resize", toggleFilterLayout);

let setButton = document.getElementById("menu");
setButton.classList.toggle("change");


