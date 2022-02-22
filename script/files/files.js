var saved_table = []

function formatText(text) {
    return text.substring(0,45) + "..."
}

function iconSelector(file_name) {
    switch(file_name.split(".")[1]) {
        case "py" :
          return "devicon-python-plain colored"
        case "js" :
          return "devicon-javascript-plain colored";
        case "java" :
          return "devicon-java-plain colored";
        case "c" :
          return "devicon-c-plain colored";
        case "css" :
            return "devicon-css3-plain colored";
        case "html" :
            return "devicon-html5-plain colored";
        case "gitignore" :
            return "devicon-git-plain colored";
        case "png" :
            return "fa fa-image fa-lg";
        default :
            return "fa fa-file";
           
      }
}

function getTimeTaken(time1, time2) {
    time1 = time1.split(":");
    time2 = time2.split(":");

    if(parseInt(time1[0]) < parseInt(time2[0])) {
      let hoursTaken = 0;
      let startHour = parseInt(time2[0]);
      let endHour = parseInt(time1[0])
      while(startHour != endHour) {
        hoursTaken += 1;
        startHour += 1;
        if(startHour >= 24) {
          startHour = 0;
        }
      }

      time1[0] = hoursTaken * 3600;
      time1[1] = time1[1] * 60 ;
      time1[2] = parseInt(time1[2]);

      totalSec = time1.reduce((a,b) => a+b, 0);
      return totalSec / 3600;


    } else {
      time1[0] = time1[0] * 3600;
      time1[1] = time1[1] * 60 ;
      time1[2] = parseInt(time1[2])

      time2[0] = time2[0] * 3600;
      time2[1] = time2[1] * 60 ;
      time2[2] = parseInt(time2[2]);    
    
      totalSec1 = time1.reduce((a,b) => a+b, 0);
      totalSec2 = time2.reduce((a,b) => a+b, 0);

      return Math.abs(totalSec1 - totalSec2) /3600;
    }

    
}


async function getData(owner, repo, folder_path) {
    let ret = []
    let api_call = ""
    let data = ""
    // if the data collected is for the whole repository
    if(folder_path == "") {
    // access tokens have been redacted
        api_call = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/?client_id=[REDACTED]&client_secret=[REDACTED]`);
        data = await api_call.json();
    // if the data collected is for a specific file
    } else {
        api_call = await fetch(folder_path);
        data = await api_call.json();
    }
    

    for(i = 0; i < data.length; i++) {
        let array = [];
        // get the file name
        array.push(data[i].name);
        // get the file url
        let file_url = data[i].url;

        let data_type = data[i].type;
        // get the file count 
        let file_count = "";
        // if the file is a folder then fetch the contents of the folder and count its length to get number of files
        if(data[i].type == "dir") {
            let api_call = await fetch(data[i].url);
            let json_data = await api_call.json();
            file_count = json_data.length;
        };
        
        let commit_call = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?path=${data[i].path}`);
        let commit_data = await commit_call.json();


        // get the latest commit 
        let latest_commit = ""
        try {
            if(commit_data[0].commit.message.length >= 45) {
                latest_commit = formatText(commit_data[0].commit.message);
            } else {
                latest_commit = commit_data[0].commit.message;
            }
        }
        catch(err) {
            latest_commit = "";
        }
        array.push(latest_commit);

        // get the date 
        let date = ""
        try {
            date = commit_data[0].commit.committer.date.replace("T",", ").replace("Z","");
        }
        catch(err) {
            date = "";
        }
        array.push(date);

        //get the average time
        let hoursTaken = []
        let average_time = 0

        if(commit_data.length > 1) {
            //console.log(commit_data[0].commit.committer.date.replace("T"," ").replace("Z","").split(" ")[1],commit_data[1].commit.committer.date.replace("T"," ").replace("Z","").split(" ")[1])
            hoursTaken = getTimeTaken(commit_data[0].commit.committer.date.replace("T"," ").replace("Z","").split(" ")[1],
                                      commit_data[1].commit.committer.date.replace("T"," ").replace("Z","").split(" ")[1]);
            average_time = Math.round(hoursTaken * 100) / 100 + " hours";
        } else if(commit_data.length == 1) {
            average_time = "only 1 commit at " + commit_data[0].commit.committer.date.replace("T"," ").replace("Z","").split(" ")[1];
        }

        array.push(average_time);
        

        // get the file count
        array.push(file_count);

        // get the commiter  
        let committer = ""
        try {
            committer = commit_data[0].commit.committer.name;
        }
        catch(err) {
            committer = "No committer";
        }
        array.push(committer);

        // get the main contributor 
        let contributor = ""
        try {
            contributor = commit_data[0].commit.author.name;
        }
        catch(err) {
            contributor = "No contributor";
        }
        array.push(contributor);

        // get the avatar for committer 
        let committer_avatar = ""
        try {
            committer_avatar = commit_data[0].committer.avatar_url;
        }
        catch(err) {
            committer_avatar = "/project/images/empty_avatar.png";
        }
        array.push(committer_avatar)

        // get the avatar for author  
        let author_avatar = ""
        try {
            author_avatar = commit_data[0].author.avatar_url;
        }
        catch(err) {
            author_avatar = "/project/images/empty_avatar.png";
        }
        array.push(author_avatar)

        // get the url for contributor
        let committer_url = ""
        try {
            committer_url = commit_data[0].committer.html_url;
        }
        catch(err) {
            committer_url = "#";
        }
        array.push(committer_url)

        // get the url for author
        let author_url = ""
        try {
            author_url = commit_data[0].author.html_url;
        }
        catch(err) {
            author_url = "#";
        }
        array.push(author_url);

        // push the data type to check if it is a folder
        array.push(data_type);

        // push the file url
        array.push(file_url)
        
        ret.push(array);
    }
    return ret;

}

function insertRow(file_name, 
    commits, 
    last_modified, 
    average_time,
    file_count,
    committer, 
    main_contributor,
    committer_avatar_url,
    contributor_avatar_url,
    committer_url,
    contributor_url,
    data_type,
    file_url) {
    $(document).ready(function() {
        var table = $("#fileTable").DataTable();

        table.row.add([file_name,
            commits,last_modified, average_time,
            file_count,committer,main_contributor,
            committer_avatar_url,contributor_avatar_url,
        committer_url, contributor_url,data_type,file_url]).draw(false);
    })
}

function loadTable(owner, repo) {
    let main_data = []
    $("#heading").replaceWith(function() {
        return "<h2 id='heading' class='file-title'><strong>" + repo + "'s files</strong></h2>"
    })

    $(document).ready(function() {
        // listener for back button
        if (window.history && window.history.pushState) {

            window.history.pushState('forward', null, './#forward');
        
            $(window).on('popstate', function() {
              window.history.pushState('forward', null, './#forward');
              table.clear().draw();
              previous_table = saved_table.pop();
              for(i = 0;i < previous_table.length;i++) {
                insertRow(previous_table[i][0],previous_table[i][1],previous_table[i][2],previous_table[i][3],previous_table[i][4],previous_table[i][5],
                    previous_table[i][6],previous_table[i][7],previous_table[i][8],previous_table[i][9],previous_table[i][10],previous_table[i][11],previous_table[i][12]);
              }
                $("#spinner").css('visibility','hidden');
                $("#spinner-background").css('visibility','hidden');

            });
        
          }
        // setup the table
        // set the commits column width to 40%
        var table = $("#fileTable").DataTable({
            "columnDefs":[
                {"width":"35%",
                "targets":1
            },
            {"width":"20%",
                "targets":2
            },
            {"width":"20%",
            "targets":0
        }],
            // automatically sort file_count in descending order
            "aaSorting": [[4,'desc']],
        
            "createdRow": function ( row, data, index ) {
                $("#spinner").css('visibility','hidden');
                $("#spinner-background").css('visibility','hidden');
                
                if(data[11] == "dir") {
                    $('td',row).eq(0).html(`<span class="fa fa-folder fa-lg"></span> ${data[0]}`);
                } else {
                    $('td',row).eq(0).html(`<i class="${iconSelector(data[0])}"></i>&nbsp&nbsp&nbsp${data[0]}`);
                    
                }
                
                $('td',row).eq(4).html(`<span class="badge badge-pill badge-danger" style="">${data[4]}</span>`).attr('align','center');
            }
        
        });

        // get the data from the row clicked
        $("#fileTable tbody").on('click','tr', function() {
            let row_data = table.row(this).data();
            if(row_data[11] == "dir") {
                // save the previous table data
                saved_table.push(table.rows().data());
                table.clear().draw();
                $("#spinner").css('visibility','visible');
                $("#spinner-background").css('visibility','visible');
                getData(owner, repo, row_data[12]).then((response) => {
                    response.forEach(i => {
                        insertRow(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9],i[10],i[11],i[12]);
                    })
                })

            } else {
                $(document).delegate('#fileTable tbody tr', 'click', function() {
                    $("#fileModal").modal("show");
                    $("#committer-img").attr("src",row_data[7]).attr("width",200).attr("height",200)
                    $("#contributor-img").attr("src",row_data[8]).attr("width",200).attr("height",200)
                    $("#committer-name").html(`<h3 id="committer-name" class="modal-text"><strong>${row_data[5]}</strong></h3>`)
                    $("#contributor-name").html(`<h3 id="contributor-name" class="modal-text"><strong>${row_data[6]}</strong></h3>`)
                    $("#view_committer_button").attr("href",row_data[9])
                    $("#view_contributor_button").attr("href",row_data[10]);
            
                })
            }

            $("#modal-close").click(function() {
                $("#fileModal").modal('hide')
            })

        })

        // add show event to modal
    })

    getData(owner,repo,"").then((response) => {

        response.forEach(i => {
            insertRow(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9],i[10],i[11],i[12]);
        })
        main_data = response;
    })
    

}
    
const localStorageURL = sessionStorage.getItem("url");
const regex = localStorageURL.match(/(?<=github.com).*/g);
const parameters = regex[0].split("/");
console.log(parameters[1],parameters[2])
//loadTable('tensorflow','tensorflow')
loadTable(parameters[1],parameters[2])
//loadTable("facebook","react")
//loadTable("freeCodeCamp","freeCodeCamp")
