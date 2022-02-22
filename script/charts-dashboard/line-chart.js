new Chart(document.getElementById('activity-chart'), {
    type : 'line',
    data : {
        labels : ["January", "February", "March", "April", "May", "June", "July","August","September","October","November","December"],
        datasets : [{
            label : "Activity on repository over a year",
            data : [80,65,44,59, 80, 81, 56, 55, 40,12,51,63],
            backgroundColor: ['rgba(105, 0, 132, .2)'],
            borderColor: ['rgba(200, 99, 132, .7)'],
            borderWidth: 2
        }]
    },
    options : {
        responsive : true
    }
});