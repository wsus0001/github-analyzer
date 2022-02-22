// 14/10/2019 update: changed HTML elements from let to const and refactored the names from lowerCamelCase to ALL_CAPS_WITH_UNDERSCORES to follow naming conventions
const ISSUE_COUNTER = document.getElementById("issueCounter"), ISSUE_LIST = document.getElementById("issueList"), SEARCH_BAR = document.getElementById("searchBar"), ISSUE_TIME = document.getElementById("issueTime"), ALL = document.getElementById("all"), OPEN = document.getElementById("open"), CLOSED = document.getElementById("closed"), TEN = document.getElementById("ten"), THIRTY = document.getElementById("thirty"), FIFTY = document.getElementById("fifty"), HUNDRED = document.getElementById("hundred"), PAGINATION = document.getElementById("pagination");
let totalIssues, openIssues, arrayOfIssues, sigmaTimeToSolveIssue = 0, muTimeToSolveIssue = 0, sigmaResponseTime = 0, muResponseTime = 0, stateFilter = "", perPage = 10, currentPage = 1;
// 10/10/2019 update: now it can get the appropriate url!
const LOCAL_STORAGE_URL = sessionStorage.getItem("url"), REGEX = LOCAL_STORAGE_URL.match(/(?<=github.com\/).*/g);


async function getRepos() {
    // show loading
    ISSUE_LIST.innerHTML = "Loading..."
    // find the number of open issues
    const URL = "https://api.github.com/repos/" + REGEX;
    const RESPONSE = await fetch(URL);
    const RESULT = await RESPONSE.json();
    openIssues = RESULT.open_issues;
    // find the total number of issues
    const URL2 = "https://api.github.com/search/issues?q=repo:" + REGEX + "+type:issue?";
    const RESPONSE2 = await fetch(URL2);
    const RESULT2 = await RESPONSE2.json();
    totalIssues = RESULT2.total_count;
    // update issue counter on top of page
    ISSUE_COUNTER.innerHTML = "Total issues: " + totalIssues + " | Open issues: " + openIssues;

    // get array of issues
    const URL3 = "https://api.github.com/repos/" + REGEX + "/issues?state=" + (stateFilter == ""? "all": stateFilter.replace("state:", "")) + "&per_page=" + perPage + "&page=" + currentPage;
    const RESPONSE3 = await fetch(URL3);
    const RESULT3 = await RESPONSE3.json();
    let innerHTMLOfIssueList = "";
    // iterate through array of issues
    for (let i = 0; i < RESULT3.length; i++) {
        // issue title and number
        // 10/10/2019 update: I fixed the table so that it can now wrap text
        innerHTMLOfIssueList += "<li class = \"list-group-item\"><table width = \"100%\" style = \"margin: 0px; table-layout: fixed; word-wrap: break-word; max-width: 100%\">" +
            "<tr><td width = \"90%\"><h3 style = \"font-family: Helvetica, Arial, sans-serif\">" + RESULT3[i].title + "</h3></td>" +
            "<td width = \"10%\" style = \"text-align: right\"><h4>#" + RESULT3[i].number + "</h4></td></tr>";
        // labels
        innerHTMLOfIssueList += "<tr><td style = \"margin: 0px; table-layout: fixed; word-wrap: break-word; max-width: 100%\"><h6>Labels: "
        for (let j = 0; j < RESULT3[i].labels.length; j++) {
            innerHTMLOfIssueList += "<em style = \"color: #" + RESULT3[i].labels[j].color + "\">" + RESULT3[i].labels[j].name + "</em>, ";
        }
        innerHTMLOfIssueList += "</h6></td></tr>"
        // status
        if (RESULT3[i].state == "open") {
            innerHTMLOfIssueList += "<tr><td><h5 style = \"color: #00C000\">Open</h5></td></tr>";
        } else if (RESULT3[i].state == "closed") {
            innerHTMLOfIssueList += "<tr><td><h5 style = \"color: #C00000\">Closed</h5></td></tr>";
        }

        // user, issue open time and comments count, as well as main assignee/contributor to issue
        innerHTMLOfIssueList += "<tr><td width = \"90%\"><p>opened on "+ RESULT3[i].created_at.replace("T", " ").replace("Z", "") +" (UTC) by " + RESULT3[i].user.login +"</p></td>" +
            "<td width = \"10%\" style = \"text-align: right\"><img src = \"Comments-512.png\" width = 32 height = 32>"+ RESULT3[i].comments +"</td></tr>"
            + "<tr><td width = \"100%\"><p>" + (RESULT3[i].assignee != null? "Assignee: " + RESULT3[i].assignee: "No main assignee to issue") + "</p></td></tr>";
        
        // check whether progress bar is enabled
        // checkbox for progress bars
        // [ ] = not yet done
        // [x] = done
        if (RESULT3[i].body != null && (RESULT3[i].body.includes("[ ]") || RESULT3[i].body.includes("[x]"))) {
            tasksDone = RESULT3[i].body.split("[x]").length - 1;
            tasksNotDone = RESULT3[i].body.split("[ ]").length - 1;
            totalTasks = tasksDone + tasksNotDone;
            innerHTMLOfIssueList += "<tr><td width = 50% style = \"text-align: left\">Progress:</td><td width = 50% style = \"text-align: right\">"+ tasksDone + "/" + totalTasks + "</td></tr>" +
                "<tr><td colspan=\"2\"><div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" style = \"width: "+ Math.floor(100 * tasksDone / totalTasks) +"%\" aria-valuenow=\"" + Math.floor(100 * tasksDone / totalTasks) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\">" + Math.floor(100 * tasksDone / totalTasks) + "%</div></div></td></tr>"
        }
        
        // wrap up the table
        innerHTMLOfIssueList += "</table></li>";
    }
    // update issueList.innerHTML
    ISSUE_LIST.innerHTML = innerHTMLOfIssueList;
    pagination(totalIssues);
    return true;
}


async function getSearch(term) {
    searchTermFormat = term.replace(" ", "+")
    // show loading
    ISSUE_LIST.innerHTML = "Loading..."
    // get search results
    const SEARCH_URL = "https://api.github.com/search/issues?q=repo:" + REGEX + "+" + searchTermFormat + "+" + stateFilter + "&per_page=" + perPage + "&page=" + currentPage;
    const SEARCH_RESPONSE = await fetch(SEARCH_URL);
    const SEARCH_JSON = await SEARCH_RESPONSE.json();
    const SEARCH_RESULT = SEARCH_JSON.items
    const SEARCH_TOTAL_COUNT = SEARCH_JSON.total_count
    let innerHTMLOfIssueList = "";
    // iterate through array of issues
    for (let i = 0; i < SEARCH_RESULT.length; i++) {
        // issue title and number
        // 10/10/2019 update: I fixed the table so that it can now wrap text
        innerHTMLOfIssueList += "<li class = \"list-group-item\"><table width = \"100%\" style = \"margin: 0px; table-layout: fixed; word-wrap: break-word; max-width: 100%\">" +
            "<tr><td width = \"90%\"><h3 style = \"font-family: Helvetica, Arial, sans-serif\">" + SEARCH_RESULT[i].title + "</h3></td>" +
            "<td width = \"10%\" style = \"text-align: right\"><h4>#" + SEARCH_RESULT[i].number + "</h4></td></tr>";
        // labels
        innerHTMLOfIssueList += "<tr><td style = \"margin: 0px; table-layout: fixed; word-wrap: break-word; max-width: 100%\"><h6>Labels: "
        for (let j = 0; j < SEARCH_RESULT[i].labels.length; j++) {
            innerHTMLOfIssueList += "<em style = \"color: #" + SEARCH_RESULT[i].labels[j].color + "\">" + SEARCH_RESULT[i].labels[j].name + "</em>, ";
        }
        innerHTMLOfIssueList += "</h6></td></tr>"
        // status
        if (SEARCH_RESULT[i].state == "open") {
            innerHTMLOfIssueList += "<tr><td><h5 style = \"color: #00C000\">Open</h5></td></tr>";
        } else if (SEARCH_RESULT[i].state == "closed") {
            innerHTMLOfIssueList += "<tr><td><h5 style = \"color: #C00000\">Closed</h5></td></tr>";
        }

        // user, issue open time and comments count
        innerHTMLOfIssueList += "<tr><td width = \"90%\"><p>opened on "+ RESULT3[i].created_at.replace("T", " ").replace("Z", "") +" (UTC) by " + RESULT3[i].user.login +"</p></td>" +
        "<td width = \"10%\" style = \"text-align: right\"><img src = \"Comments-512.png\" width = 32 height = 32>"+ RESULT3[i].comments +"</td></tr>"
        + "<tr><td width = \"100%\"><p>" + (RESULT3[i].assignee != null? "Assignee: " + RESULT3[i].assignee: "No main assignee to issue") + "</p></td></tr>";
        
        // check whether progress bar is enabled
        // checkbox for progress bars
        // [ ] = not yet done
        // [x] = done
        if (SEARCH_RESULT[i].body != null && (SEARCH_RESULT[i].body.includes("[ ]") || SEARCH_RESULT[i].body.includes("[x]"))) {
            tasksDone = SEARCH_RESULT[i].body.split("[x]").length - 1;
            tasksNotDone = SEARCH_RESULT[i].body.split("[ ]").length - 1;
            totalTasks = tasksDone + tasksNotDone;
            innerHTMLOfIssueList += "<tr><td width = 50% style = \"text-align: left\">Progress:</td><td width = 50% style = \"text-align: right\">"+ tasksDone + "/" + totalTasks + "</td></tr>" +
                "<tr><td colspan=\"2\"><div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" style = \"width: "+ Math.floor(100 * tasksDone / totalTasks) +"%\" aria-valuenow=\"" + Math.floor(100 * tasksDone / totalTasks) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\">" + Math.floor(100 * tasksDone / totalTasks) + "%</div></div></td></tr>"
        }
        
        // wrap up the table
        innerHTMLOfIssueList += "</table></li>";
    }
    // update issueList.innerHTML
    ISSUE_LIST.innerHTML = "Search results found: " + SEARCH_TOTAL_COUNT + "<br>Clear search box and hit enter to show all results" + innerHTMLOfIssueList;
    pagination(SEARCH_TOTAL_COUNT)
}


async function getAverageTime() {
    const URL4 = "https://api.github.com/repos/" + REGEX + "/issues?state=closed&per_page=100"
    const RESPONSE4 = await fetch(URL4);
    const RESULT4 = await RESPONSE4.json();
    // get unix time of creation and closure of issue if issue is closed
    for (let i = 0; i < RESULT4.length; i++) {
        if (RESULT4[i].state == "closed") {
            const CREATED_UNIX_TIME = new Date(RESULT4[i].created_at).getTime() / 1000;
            const CLOSED_UNIX_TIME = new Date(RESULT4[i].closed_at).getTime() / 1000;
            // calculate seconds to solve the issue
            const SOLVING_TIME = CLOSED_UNIX_TIME - CREATED_UNIX_TIME;
            sigmaTimeToSolveIssue += SOLVING_TIME;
        }
        // calculate seconds to respond to the issue
        // this gives a 403 error
        const URL4A = RESULT4[i].comments_url;
        const RESPONSE4A = await fetch(URL4A);
        const RESULT4A = await RESPONSE4A.json();
        RESULT4A.length != 0? sigmaResponseTime += (new Date(RESULT4A[0].created_at).getTime() - new Date(RESULT4[i].created_at).getTime()) / 1000: {};
    }
    // get average issue solving time
    muTimeToSolveIssue = sigmaTimeToSolveIssue / 100;
    const DAYS = Math.floor(muTimeToSolveIssue / 86400);
    const HOURS = Math.floor((muTimeToSolveIssue % 86400) / 3600);
    const MINUTES = Math.floor((muTimeToSolveIssue % 3600) / 60);
    const SECONDS = Math.floor(muTimeToSolveIssue % 60);
    ISSUE_TIME.innerHTML = "Mean time to solve latest 100 closed issues:<br>" + DAYS + "d " + HOURS + "h " + MINUTES + "m " + SECONDS + "s<br>";
    
    //get average issue response time
    muResponseTime = sigmaResponseTime / 100;
    const DAYS_RESPONSE = Math.floor(muResponseTime / 86400);
    const HOURS_RESPONSE = Math.floor((muResponseTime % 86400) / 3600);
    const MINUTES_RESPONSE = Math.floor((muResponseTime % 3600) / 60);
    const SECONDS_RESPONSE = Math.floor(muResponseTime % 60);
    ISSUE_TIME.innerHTML += "Mean time to respond the latest 100 closed issues:<br>" + DAYS_RESPONSE + "d " + HOURS_RESPONSE + "h " + MINUTES_RESPONSE + "m " + SECONDS_RESPONSE + "s";
}


function pagination(numberOfIssues) {
    const TOTAL_NUMBER_OF_PAGES = Math.ceil(numberOfIssues / perPage);
    ISSUE_LIST.innerHTML += "<nav style=\"float:right\"><ul class = \"pagination\" style=\"float:right\">"
        + "<li class=\"page-item" + (currentPage == 1? " disabled": "") + "\"><a id = firstPage class=\"page-link\" href=\"#\">First page</a></li>"
        + "<li class=\"page-item" + (currentPage == 1? " disabled": "") + "\"><a id = previousPage class=\"page-link\" href=\"#\">Previous</a></li>"
        + "<li class=\"page-item disabled\"><a class=\"page-link\" href=\"#\">Page " + currentPage + " of " + TOTAL_NUMBER_OF_PAGES + "</a></li>"
        + "<li class=\"page-item" + (currentPage == TOTAL_NUMBER_OF_PAGES? " disabled": "") + "\"><a id = nextPage class=\"page-link\" href=\"#\">Next</a></li>"
        + "<li class=\"page-item" + (currentPage == TOTAL_NUMBER_OF_PAGES? " disabled": "") + "\"><a id = lastPage class=\"page-link\" href=\"#\">Last page</a></li>"
        + "</ul></nav>";
    const FIRST_PAGE = document.getElementById("firstPage"), PREVIOUS_PAGE = document.getElementById("previousPage"), NEXT_PAGE = document.getElementById("nextPage"), LAST_PAGE = document.getElementById("lastPage");
    FIRST_PAGE.addEventListener("click", () => {
        currentPage = 1;
        SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
    })
    PREVIOUS_PAGE.addEventListener("click", () => {
        currentPage -= 1;
        SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
    })
    NEXT_PAGE.addEventListener("click", () => {
        currentPage += 1;
        SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
    })
    LAST_PAGE.addEventListener("click", () => {
        currentPage = TOTAL_NUMBER_OF_PAGES;
        SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
    })
}


// added dropdown menu event listeners here
SEARCH_BAR.addEventListener("keyup", (event) => {
    event.keyCode == 13? SEARCH_BAR.value != ""? (currentPage = 1, getSearch(SEARCH_BAR.value)): (currentPage = 1, getRepos()): {};
})


OPEN.addEventListener("click", () => {
    stateFilter = "state:open"; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
})


CLOSED.addEventListener("click", () => {
    stateFilter = "state:closed"; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
})


ALL.addEventListener("click", () => {
    stateFilter = ""; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos();
})


TEN.addEventListener("click", () => {
    perPage = 10; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos()
})


THIRTY.addEventListener("click", () => {
    perPage = 30; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos()
})


FIFTY.addEventListener("click", () => {
    perPage = 50; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos()
})


HUNDRED.addEventListener("click", () => {
    perPage = 100; currentPage = 1;
    SEARCH_BAR.value != ""? getSearch(SEARCH_BAR.value): getRepos()
})


getRepos()? getAverageTime(): {};
