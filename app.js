let client_id = "7c54b6c759954f4db09959ce5cebe0b0"

localStorage.setItem("client_id", client_id);

let bpmSlider = document.querySelector("#bpm-slider");
let bpmOutput = document.querySelector(".bpm-output");
let bpmCheck = document.querySelector("#bpm-check");
let playlists;
let songs = [];
let songContainers = []
let playButtons = []
let addButton = []
let songTitle = []
let songArtist = []
let songTempo = [];
let addToPlaylist;
let tracksInfoContainer;
let tracksTitle;
let tracksArtist;
let player =  document.createElement("iframe");
let select;
player.classList.add("player");
player.allow = "encrypted-media";
document.querySelector(".left-container").appendChild(player);

function onPageLoad(){
    console.log("Refresh")
    if(window.location.href.length > 60){
        localStorage.setItem("access_token", location.hash.substr(1).split('&')[0].split('=')[1]);
        window.location.href = "http://127.0.0.1:5500/index.html";
        
    }
    access_token = localStorage.getItem("access_token");
    console.log(access_token)
    if (access_token != undefined){
        document.querySelector(".request-container").classList.remove("hide");
        document.querySelector(".auth").classList.add("hide");
        let request = new XMLHttpRequest();
        request.open("GET", "https://api.spotify.com/v1/me/playlists", true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', 'Bearer ' + access_token);
        request.send();
        request.onload = function(){
            if ( this.status == 200 ){
                let data = JSON.parse(this.responseText);
                let playlists = [];
                select = document.createElement("select")
                select.size = 0;
                
                document.querySelector(".select").appendChild(select);
                for(let i = 0; i<data.items.length; i++){
                    playlists[i] = document.createElement("option"); 
                    playlists[i].value = data.items[i].id;
                    playlists[i].innerHTML = data.items[i].name;
                    document.querySelector("select").appendChild(playlists[i]);
                }
                addToPlaylist = data.items[0].id;
                document.querySelector("select").addEventListener("change", function(){
                    console.log(document.querySelector("select").value);
                    addToPlaylist = document.querySelector("select").value;
                })
                console.log(data.items)
            }
            else {
                Authenticate();
            }
        }
    }
}

document.querySelector(".button-auth").addEventListener("click", function(){
    Authenticate();
    
})

document.querySelector(".button-track").addEventListener("click", function(){
    getRecommendations();
})

bpmCheck.addEventListener("change", function(){
    if (bpmCheck.checked == true){
        bpmOutput.innerHTML = bpmSlider.value;
        bpmSlider.style.background
    }
    else{
        bpmOutput.innerHTML = "";
    }
})

bpmSlider.oninput = function() {
    bpmOutput.innerHTML = this.value;
  }

function Authenticate(){
    location = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=http://127.0.0.1:5500/index.html&scope=user-read-private%20user-read-email%20user-top-read%20playlist-modify-private%20playlist-modify-public&response_type=token"
}

function getRecommendations(){
    let request = new XMLHttpRequest();
    request.open("GET", "https://api.spotify.com/v1/me/top/artists?limit=5", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token);
    request.send(null)
    request.onload = function(){
        if ( this.status == 200 ){
            let data = JSON.parse(this.responseText);
            console.log(data);

            makeRecommendationsRequest(data);
            

        }
        else {
            console.log(this.responseText);
            alert(this.responseText);
        }
    }
}

function makeRecommendationsRequest(data){
    let query = "https://api.spotify.com/v1/recommendations?seed_artists=";
            
            for(let i = 0; i<5; i++){
                console.log(data.items[i].id);
                query += data.items[i].id;
                query += "%2C";
            }
            if(bpmCheck.checked == true){
                query += "&target_tempo=" + bpmSlider.value;
            }

            let recommendationRequest = new XMLHttpRequest();
            recommendationRequest.open("GET", query, true);
            recommendationRequest.setRequestHeader('Content-Type', 'application/json');
            recommendationRequest.setRequestHeader('Authorization', 'Bearer ' + access_token);
            recommendationRequest.send(null);
            recommendationRequest.onload = function(){
                if ( this.status == 200 ){
                    let data = JSON.parse(this.responseText); 
                    requestTrack(data.tracks);
                    
        
                }
                else {
                    console.log(this.responseText);
                    alert(this.responseText);
                }
            }
}

function requestTrack(tracks){
    query = "https://api.spotify.com/v1/audio-features?ids="
    for (let i=0; i<tracks.length;i++){
        query += tracks[i].id;
        query += "%2C";
    }


    let request = new XMLHttpRequest();
    request.open("GET", query, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token);
    request.send(null)
    request.onload = function(){
        if ( this.status == 200 ){
            let data = JSON.parse(this.responseText);
            console.log(data.audio_features)
            tracksInfoContainer = document.createElement("div");
            tracksInfoContainer.classList.add("info-container");

            tracksTitle = document.createElement("div");
            tracksTitle.textContent = "Title";
            tracksTitle.classList.add("info");
            tracksArtist = document.createElement("div");
            tracksArtist.textContent = "Artist";
            tracksArtist.classList.add("info");

            tracksInfoContainer.appendChild(tracksTitle);
            tracksInfoContainer.appendChild(tracksArtist);

            document.querySelector(".tracks-container").appendChild(tracksInfoContainer)

            for(let j = 0; j<20; j++){
                if(songs[j] === undefined){
                    songContainers[j] = document.createElement("div");
                    songContainers[j].classList.add("song-container");

                    playButtons[j] = document.createElement("i");
                    playButtons[j].classList.add("far", "fa-play-circle")
                    

                    songs[j] = document.createElement("div");
                    songs[j].classList.add("song");

                    addButton[j] = document.createElement("i");
                    addButton[j].classList.add("fas", "fa-check-circle");
                    
                    songTitle[j] = document.createElement("div");
                    songTitle[j].classList.add("song-title");
                    songTitle[j].textContent = tracks[j].name;
                    songs[j].appendChild(songTitle[j]);

                    songArtist[j] = document.createElement("div");
                    songArtist[j].classList.add("song-artist");
                    songArtist[j].textContent = tracks[j].artists[0].name
                    songs[j].appendChild(songArtist[j]);

                    songContainers[j].appendChild(playButtons[j]);
                    songContainers[j].appendChild(songs[j]);
                    songContainers[j].appendChild(addButton[j]);

                    document.querySelector(".tracks-container").appendChild(songContainers[j]);
                }
                
                //songs[j].textContent = "Song title: " + tracks[j].name + ", Artist: " + tracks[j].artists[0].name + " " + Math.round(data.audio_features[j].tempo);
                playButtons[j].addEventListener('click', function(){
                    player.src = "https://open.spotify.com/embed/track/" + tracks[j].id;
                })
                

                addButton[j].addEventListener('click', function(){
                    if(addToPlaylist != undefined){
                        AddTrack("POST", "https://api.spotify.com/v1/playlists/" + addToPlaylist + "/tracks?uris=" + tracks[j].uri)
                        addButton[j].style.display = "none";
                    }
                    else{
                        console.log("Please select a playlist to add to");
                    }
                })
                

            }

        }
        else {
            console.log(this.responseText);
            alert(this.responseText);
        }
    }
}

function AddTrack(method, query){
    let request = new XMLHttpRequest();
    request.open(method, query, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + access_token);
    request.send();
    request.onload = function(){
        if ( this.status == 201 ){
            console.log("Track added to playlist")

        }
        else {
            console.log(this.responseText);
            alert(this.responseText);
        }
    }
    
}