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

async function getNumberOfLines(){
  const localStorageURL = sessionStorage.getItem("url");
  const regex = localStorageURL.match(/(?<=github.com).*/g);

  const repoUrl = `https://api.github.com/repos${regex}`;
  const repoResponse = await fetch(repoUrl);
  const repoResult = await repoResponse.json();
  console.log(repoResult);

  // get list of contributors
  const contrisUrl = repoResult.contributors_url;
  const contriResponse = await fetch(contrisUrl);
  const contriResult = await contriResponse.json();
  console.log(contriResult);

  var listOfNames = [];
  var linesOfCodes = [];
  
  for(var i = 0;i<contriResult.length;i++){
    listOfNames.push(contriResult[i].login);
    linesOfCodes.push(contriResult[i].contributions);
  }

  console.log(listOfNames);
  console.log(linesOfCodes);

  var backgroundAlpha = 0.2;
  var borderAlpha = 0.2;

  var backgroundColours = [];
  var borderColors = [];

  for(var i = 0;i<listOfNames.length;i++){
       var r = getRandomArbitrary(0,255);
       var g = getRandomArbitrary(0,255);
       var b = getRandomArbitrary(0,255);

       var tempBackground = "rgba" + "(" + r + ", " + g + ", " + b + ", " + backgroundAlpha + ")"
       var tempBorder = "rgba" + "(" + r + ", " + g + ", " + b + ", " + borderAlpha + ")"

       backgroundColours.push(tempBackground);
       borderColors.push(tempBorder);

  }

  var ctx = document.getElementById("activity-file-chart").getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: listOfNames,
      datasets: [{
        label: '# of Lines of Code Contributed',
        data: linesOfCodes,
        backgroundColor: backgroundColours,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

}



getNumberOfLines();