let library = [];
let currentAlbums = [];

let currentAlbum = null;
let currentTrackIndex = -1;

const content = document.getElementById("content");
const audio = document.getElementById("audio");

fetch("albums.json")
.then(r => r.json())
.then(data => {

```
library = data.albums;
currentAlbums = library;

showAlbums(library);
```

});

function showAlbums(albums){

```
content.innerHTML = "";

albums.forEach(album => {

    content.innerHTML += `
    <div
        class="album"
        onclick="openAlbum('${album.id}')"
    >

        <img src="${album.cover}">
        <h3>${album.title}</h3>

    </div>
    `;
});
```

}

async function openAlbum(id){

```
const album =
    library.find(a => a.id === id);

const description =
    await fetch(album.description)
    .then(r => r.text());

content.innerHTML = `
    <button onclick="showAlbums(currentAlbums)">
        ← Назад
    </button>

    <div class="album-page">

        <img
            src="${album.cover}"
            class="album-cover-large"
        >

        <h1>${album.title}</h1>

        <p>${description}</p>

        <div id="tracks"></div>

    </div>
`;

const tracksDiv =
    document.getElementById("tracks");

album.tracks.forEach((track,index)=>{

    tracksDiv.innerHTML += `
    <div class="track">

        <img src="${album.cover}">

        <div class="track-info">

            <div class="track-title">
                ${track.title}
            </div>

            <div
                class="album-link"
                onclick="
                event.stopPropagation();
                openAlbum('${album.id}')
                "
            >
                ${album.title}
            </div>

        </div>

        <button
            onclick="
            playTrack(
            '${album.id}',
            ${index}
            )
            "
        >
            ▶
        </button>

    </div>
    `;

});
```

}

function playTrack(albumId, trackIndex){

```
const album =
    library.find(a => a.id === albumId);

if(!album) return;

const track =
    album.tracks[trackIndex];

currentAlbum = album;
currentTrackIndex = trackIndex;

audio.src = track.file;

document
    .getElementById("currentTrack")
    .textContent =
    track.title;

document
    .getElementById("playerCover")
    .src =
    album.cover;

audio.play();
```

}

function nextTrack(){

```
if(!currentAlbum) return;

const next =
    currentTrackIndex + 1;

if(next < currentAlbum.tracks.length){

    playTrack(
        currentAlbum.id,
        next
    );

    return;
}

playRandomTrack();
```

}

function previousTrack(){

```
if(!currentAlbum) return;

const prev =
    currentTrackIndex - 1;

if(prev >= 0){

    playTrack(
        currentAlbum.id,
        prev
    );

}
```

}

function playRandomTrack(){

```
const otherAlbums =
    library.filter(
        album =>
        album.id !== currentAlbum.id
    );

if(otherAlbums.length === 0)
    return;

const randomAlbum =
    otherAlbums[
        Math.floor(
            Math.random()
            *
            otherAlbums.length
        )
    ];

const randomTrack =
    Math.floor(
        Math.random()
        *
        randomAlbum.tracks.length
    );

playTrack(
    randomAlbum.id,
    randomTrack
);
```

}

audio.addEventListener(
"ended",
nextTrack
);

document
.getElementById("search")
.addEventListener(
"input",
e => {

```
const text =
    e.target.value
    .toLowerCase()
    .trim();

if(text === ""){

    showAlbums(library);

    return;

}

let html = "";

library.forEach(album=>{

    if(
        album.title
        .toLowerCase()
        .includes(text)
    ){

        html += `
        <div
            class="album"
            onclick="
            openAlbum('${album.id}')
            "
        >

            <img src="${album.cover}">
            <h3>${album.title}</h3>

        </div>
        `;

    }

    album.tracks.forEach(
    (track,index)=>{

        if(
            track.title
            .toLowerCase()
            .includes(text)
        ){

            html += `
            <div class="track">

                <img
                src="${album.cover}"
                >

                <div
                class="track-info"
                >

                    <div>
                        ${track.title}
                    </div>

                    <div
                    class="album-link"
                    onclick="
                    openAlbum(
                    '${album.id}'
                    )
                    "
                    >
                        ${album.title}
                    </div>

                </div>

                <button
                onclick="
                playTrack(
                '${album.id}',
                ${index}
                )
                "
                >
                ▶
                </button>

            </div>
            `;

        }

    });

});

content.innerHTML = html;
```

});
