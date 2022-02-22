
let searchUser = document.getElementById("search-user");
let listRepos = document.getElementById("list-of-repos");

async function getUserRepos(userResult){
    const repoURL = userResult.repos_url;
    const repoResponse = await fetch(repoURL);
    const repoResult = await repoResponse.json();
    console.log(repoResult);

    var displayStr = "";
    for(var i = 0; i < repoResult.length;i++){
        var tempStr = "";
        //<li>Name: <span id = "user-full-name"></span> <br /></li>
        tempStr += "<li>Name: " + "<span>" + repoResult[i].name + "</span>" + "</li>"
        tempStr += "<li>Size: " + "<span>" + repoResult[i].size + "</span>" + "</li>"
        tempStr += "<li>Stargazers: " + "<span>" + repoResult[i].stargazers_count + "</span>" + "</li>"
        tempStr += "<li>" + "Url: " + "<a href = " + repoResult[i].html_url + ">" + repoResult[i].html_url + "</a>" + "</li>"
        tempStr += "<br />";
        displayStr += tempStr;
    }

    listRepos.innerHTML = displayStr;

}

async function getUserInfo(){
    const userUrl = "https://api.github.com/users/" + searchUser.value;
    const userResponse = await fetch(userUrl);
    const userResult = await userResponse.json();
    console.log(userResult);

    document.getElementById("user-full-name").innerHTML = userResult.name;
    document.getElementById("username").innerHTML = userResult.login;
    document.getElementById("user-location").innerHTML = userResult.location;
    document.getElementById("user-company").innerHTML = userResult.company;
    var tempStr = userResult.created_at;
    document.getElementById("user-date-joined").innerHTML = tempStr.substr(8,2) + "/" + tempStr.substr(5,2) + "/" + tempStr.substr(0,4);
    document.getElementById("user-bio").innerHTML = userResult.bio;
    document.getElementById("user-repos").innerHTML = userResult.public_repos;
    document.getElementById("user-url").innerHTML = "<a href = " + userResult.html_url + ">" + "   " + userResult.html_url + "</a>";

    getUserRepos(userResult);
}

