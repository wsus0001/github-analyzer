jQuery.noConflict();

const timelineHeader = document.getElementById("header");
const timelineItems = document.getElementById("timeline-items");
const timelineDetails = document.getElementById("timeline-details");

let title = document.createElement("strong");
title.textContent = "Repository Timeline";

let timelineItem = "";
let timelineDetail = "";

const localStorageURL = sessionStorage.getItem("url");
const regex = localStorageURL.match(/(?<=github.com).*/g);

getCommits();

// Get each commit's sha from a repository and store them in an array
// url: https://api.github.com/repos/<owner>/<repository>/commits
async function getCommits() {
    const url = `https://api.github.com/repos${regex}/commits`;
    const response = await fetch(url);
    const result = await response.json();
    let sha = [];
    
    result.forEach(i => {
        sha.push(i.sha);
    })

    getStats(sha);
}

// Get the statistics of each commit based on its unique sha
async function getStats(array) {
    for(let i = 0; i < array.length; i++) {
        const url = `https://api.github.com/repos${regex}/commits/`;
        const response = await fetch(url+array[i]);
        const result = await response.json();

        // Each timeline node's layout
        timelineItem += 
            `<div class="timeline__item" id="item-${i}">
                <div class="timeline__content">
                    <h2>${result.commit.committer.date.match(/.+?(?=T)/)}</h2>
                    <p>
                        <img src="images/file-code.png" class="file-image">
                        <strong class="text-info">${result.files.length} File(s) Changed</strong>
                    </p>
                    <p>
                        <img src="images/file-plus.png" class="file-image">
                        <strong class="text-success">${result.stats.additions} Addition(s)</strong>
                    </p>
                    <p>
                        <img src="images/file-cross.png" class="file-image">
                        <strong class="text-danger">${result.stats.deletions} Deletion(s)</strong>
                    </p>
                </div>
            </div>`;
        
        // Each timeline detail split up into 3 parts so that the iteration in files can repeatedly add more rows in the table
        timelineDetail += 
            `<div id="details-${i}" class="details border border-secondary rounded">
                <div class="margin-around-border">
                    <h6><strong>Author: </strong>${result.commit.author.name}</h6>
                    <h6><strong>Committer: </strong>${result.commit.committer.name}</h6>
                    <table class="table table-hover">
                        <thead class="thead-dark">
                            <tr>
                                <th class="file">Filename</th>
                                <th class="status">Status</th>
                                <th class="additions">Additions</th>
                                <th class="additions">Deletions</th>
                                <th class="changes">Changes</th>
                            </tr>
                        </thead>
                        <tbody>`;

        result.files.forEach(file => {
            timelineDetail +=
                            `<tr>
                                <td class="file">${file.filename}</td>
                                <td class="status">${file.status}</td>
                                <td class="additions">${file.additions}</td>
                                <td class="deletions">${file.deletions}</td>
                                <td class="changes">${file.changes}</td>
                            </tr>`;
        });

        timelineDetail += 
                        `</tbody>
                    </table>
                </div>
            </div>`;
    }
    
    while(timelineHeader.firstChild)
        timelineHeader.removeChild(timelineHeader.firstChild);
    
    $(timelineHeader).append(title);
    $(timelineItems).append(timelineItem);
    $(timelineDetails).append(timelineDetail);

    // jQuery that changes the timeline to horizontal mode after loading all the nodes
    $('.timeline').timeline({
        forceVerticalMode: 1000,
        mode: 'horizontal',
        visibleItems: 4
    });
    
    // Hide the last table shown and display the correct table based on the timeline node selected
    let previousId = "-1";
    $('.timeline__item')
    .css('cursor', 'pointer')
    .click(
        function() {
            let currentId = "#details-" + this.id.slice(5);
            if(previousId != "-1")
                $(previousId).hide();
            previousId = currentId;
            $(currentId).show();
        }
    )
    .hover(
        function() {
            $(this).css('border', '3px solid transparent');
        },
        function() {
            $(this).css('border', '');
        }
    );
}