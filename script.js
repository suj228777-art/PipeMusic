let library;
let currentAlbums = [];

const content = document.getElementById("content");

fetch("albums.json")
.then(r => r.json())
.then(data => {

    library = data.albums;
    currentAlbums = library;

    showAlbums(library);

});

function showAlbums(albums){

    content.innerHTML = "";

    albums.forEach(album => {

        content.innerHTML += `
            <div class="album"
                 onclick="openAlbum('${album.id}')">

                <img src="${album.cover}">
                <h3>${album.title}</h3>

            </div>
        `;
    });
}

async function openAlbum(id){

    const album =
        library.find(a => a.id === id);

    const desc =
        await fetch(album.description)
        .then(r => r.text());

    content.innerHTML = `
        <button onclick="showAlbums(currentAlbums)">
            ← Назад
        </button>

        <img
            src="${album.cover}"
            style="width:300px"
        >

        <h1>${album.title}</h1>

        <p>${desc}</p>

        <div id="tracks"></div>
    `;

    const tracksDiv =
        document.getElementById("tracks");

    album.tracks.forEach(track => {

        tracksDiv.innerHTML += `
            <div class="track">

                <img src="${album.cover}">

                <div class="track-info">

                    <div class="track-title">
                        ${track.title}
                    </div>

                    <div
                      class="album-link"
                      onclick="openAlbum('${album.id}')">

                      ${album.title}

                    </div>

                </div>

                <button
                  onclick="playTrack(
                  '${track.file}',
                  '${track.title}',
                  '${album.cover}'
                  )">

                  ▶

                </button>

            </div>
        `;
    });
}

function playTrack(file, title, cover){

    const audio =
        document.getElementById("audio");

    audio.src = file;

    document
        .getElementById("currentTrack")
        .textContent = title;

    document
        .getElementById("playerCover")
        .src = cover;

    audio.play();
}

document
.getElementById("search")
.addEventListener("input", e => {

    const text =
        e.target.value.toLowerCase();

    const result = [];

    library.forEach(album => {

        if(album.title
            .toLowerCase()
            .includes(text))
        {
            result.push(album);
            return;
        }

        const foundTrack =
            album.tracks.some(track =>
                track.title
                .toLowerCase()
                .includes(text)
            );

        if(foundTrack)
            result.push(album);
    });

    currentAlbums = result;

    showAlbums(result);
});
