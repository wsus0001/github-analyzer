/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  /**
  * Returns a random integer between min (inclusive) and max (inclusive).
  * The value is no lower than min (or the next integer greater than min
  * if min isn't an integer) and no greater than max (or the next integer
  * lower than max if max isn't an integer).
  * Using Math.round() will give you a non-uniform distribution!
  */
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

async function generateActivityChart(){
    // get repo
    const localStorageURL = sessionStorage.getItem("url");
    const regex = localStorageURL.match(/(?<=github.com).*/g);

    const repoUrl = `https://api.github.com/repos${regex}`;
    const repoResponse = await fetch(repoUrl);
    const repoResult = await repoResponse.json();

     // get commits

     var n = repoResult.commits_url.indexOf("{");

     const commitsUrl = repoResult.commits_url.substr(0,n);
     const commitResponse = await fetch(commitsUrl);
     const commitResult = await commitResponse.json();
     console.log(commitResult);

     let sha = [];
    
    commitResult.forEach(i => {
        sha.push(i.sha);
    })

    let activityArray = [];

    for(let i = 0; i < sha.length; i++) {
        var date = commitResult[i].commit.committer.date.substr(0,10);
        const url = `https://api.github.com/repos${regex}/commits/`;
        const response = await fetch(url+sha[i]);
        const result = await response.json();
        var numOfLinesEdited = result.stats.additions;
        activityArray.push([numOfLinesEdited,date]);
        //console.log(result);
    }
    console.log(commitResult[0].commit.committer.date);
    console.log(activityArray);

    let datesArray = [];
    let linesChangedArray = [];


    var linesChanged = activityArray[activityArray.length-1][0];
    var previousDate = activityArray[activityArray.length-1][1];
    for(let i = activityArray.length-2;i>-1;i--){
        var temp = activityArray[i];
        if(temp[1] != previousDate){
            datesArray.push(previousDate);
            linesChangedArray.push(linesChanged);
            linesChanged = temp[0];
            previousDate = temp[1];
        }
        else{
            // adding together since the dates are the same
            linesChanged += temp[0];
        }
    }
    datesArray.push(previousDate);
    linesChangedArray.push(linesChanged);

    console.log(datesArray);

    new Chart(document.getElementById('activity-chart'), {
        type : 'line',
        data : {
            labels : datesArray,
            datasets : [{
                label : "Lines of codes added",
                data : linesChangedArray,
                backgroundColor: ['rgba(105, 0, 132, .2)'],
                borderColor: ['rgba(200, 99, 132, .7)'],
                borderWidth: 2
            }]
        },
        options : {
            responsive : true
        }
    });
}

generateActivityChart();