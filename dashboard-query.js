let numOfCommits = document.getElementById("number-of-commits");
let numOfBranches = document.getElementById("number-of-branches");
let numOfForks = document.getElementById("number-of-forks");
let numOfContributors = document.getElementById("number-of-contributors");

async function getRepos() {
    const localStorageURL = sessionStorage.getItem("url");
    const regex = localStorageURL.match(/(?<=github.com).*/g);

    const url = `https://api.github.com/repos${regex}`;
    console.log(url);
    const response = await fetch(url);
    const result = await response.json();
    console.log(result);
    console.log(typeof result);

    // GET CONTRIBUTORS  --------------------------------------
    
    var contributorsURL = result.contributors_url;
    console.log(contributorsURL);

    const contUrl = contributorsURL;
    const contResponse = await fetch(contUrl);
    const contResult = await contResponse.json();

    console.log(contResult);
    console.log(contResult.length);

    numOfContributors.innerHTML = contResult.length;

    // GET COMMITS -------------------------------

    var index = result.commits_url.indexOf("{");
    const commUrl = result.commits_url.substr(0,index);
    const commResponse = await fetch(commUrl);
    const commResult = await commResponse.json();
    numOfCommits.innerHTML = commResult.length;

    console.log(commResult);

    // GET NUMBER OF BRANCHES ----------------------------------
    
    var branchesURL = "";

    var index = result.branches_url.indexOf("{");
    const branchUrl = result.branches_url.substr(0,index);
    const branchResponse = await fetch(branchUrl);
    const branchResult = await branchResponse.json();
    numOfBranches.innerHTML = branchResult.length;

    console.log(branchResult);

    // GET NUMBER OF FORKS

    numOfForks.innerHTML = result.forks;


}

getRepos();