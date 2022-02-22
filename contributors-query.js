let linesRepo = document.getElementById("lines-in-repo");
let updateTime = document.getElementById("update-time");

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

async function getRepos(){
    const localStorageURL = sessionStorage.getItem("url");
    const regex = localStorageURL.match(/(?<=github.com).*/g);

    const repoUrl = `https://api.github.com/repos${regex}`;
    const repoResponse = await fetch(repoUrl);
    const repoResult = await repoResponse.json();
    console.log(repoResult);

    // set repo name
    var repoHeading = document.getElementById("repo-name");
    repoHeading.innerHTML = repoResult.name;
    // get list of contributors
    const contrisUrl = repoResult.contributors_url;
    const contriResponse = await fetch(contrisUrl);
    const contriResult = await contriResponse.json();
    console.log(contriResult);

    // lines in repo

    // get commits

    var n = repoResult.commits_url.indexOf("{");

    const commitsUrl = repoResult.commits_url.substr(0,n);
    const commitResponse = await fetch(commitsUrl);
    const commitResult = await commitResponse.json();
    console.log(commitResult);

    var sum = 0

    for(var i = 0;i<contriResult.length;i++){
        sum += contriResult[i].contributions;
    }

    linesRepo.innerHTML = sum;

    // get most recent commiter

    var mostRecentCommit = document.getElementById("recent-commiter");

    var tempStr = commitResult[0].commit.committer.name + "(" + commitResult[0].commit.committer.date.substr(0,10) + ")";
    mostRecentCommit.innerHTML = tempStr;

    // var get average time

    var mostRecentDateStr = new Date(commitResult[0].commit.committer.date);
    console.log(typeof mostRecentDateStr);
    var lastRecentDateStr = new Date(commitResult[commitResult.length-1].commit.committer.date);

    //var recentDate = mostRecentDateStr.substr(8,2) + "-" +   mostRecentDateStr.substr(5,2) + "-" + mostRecentDateStr.substr(0,4);
    //var reDate = new Date(recentDate);

    //console.log(recentDate);
    //console.log(reDate);

    var diffDays = dateDiffInDays(lastRecentDateStr,mostRecentDateStr);
    
    if(diffDays < 0){
        diffDays = diffDays * -1;
    }

    var hours = Math.ceil(diffDays/commitResult.length*24)
    console.log(hours);

    updateTime.innerHTML = hours + "hrs";


}
getRepos();