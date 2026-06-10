let library = [];

let currentAlbums = [];

let currentAlbum = null;
let currentTrackIndex = -1;

const content = document.getElementById("content");
const audio = document.getElementById("audio");

loadLibrary();

async function loadLibrary() {

    const response =
        await fetch("albums.json");

    const data =
        await response.json();

    library = data.albums;
    currentAlbums = library;

    showAlbums(library);
}

function showAlbums(albums) {

    content.innerHTML = "";

    if (albums.length === 0) {

        content.innerHTML =
            "<h2>Ничего не найдено</h2>";

        return;
    }

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

async function openAlbum(albumId) {

    const album =
        library.find(a => a.id === albumId);

    let description = "";

    try {

        description =
            await fetch(album.description)
            .then(r => r.text());

    } catch {

        description =
            "Описание отсутствует.";

    }

    content.innerHTML = `
        <button onclick="showAlbums(currentAlbums)">
            ← Назад
        </button>

        <div class="album-page">

            <img
                src="${album.cover}"
                class="album-cover-large">

            <h1>${album.title}</h1>

            <p>${description}</p>

            <div id="tracks"></div>

        </div>
    `;

    const tracksDiv =
        document.getElementById("tracks");

    album.tracks.forEach((track, index) => {

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
                        openAlbum('${album.id}');
                        ">

                        ${album.title}

                    </div>

                </div>

                <button
                    onclick="
                    event.stopPropagation();
                    playTrack(
                    '${album.id}',
                    ${index}
                    );
                    ">

                    ▶

                </button>

            </div>
        `;
    });
}

function playTrack(albumId, trackIndex) {

    const album =
        library.find(a => a.id === albumId);

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
}

audio.addEventListener("ended", () => {

    if (!currentAlbum)
        return;

    const nextIndex =
        currentTrackIndex + 1;

    if (
        nextIndex <
        currentAlbum.tracks.length
    ) {

        playTrack(
            currentAlbum.id,
            nextIndex
        );

        return;
    }

    playRandomTrack();
});

function playRandomTrack() {

    const otherAlbums =
        library.filter(
            a => a.id !== currentAlbum.id
        );

    if (otherAlbums.length === 0)
        return;

    const randomAlbum =
        otherAlbums[
            Math.floor(
                Math.random() *
                otherAlbums.length
            )
        ];

    const randomTrackIndex =
        Math.floor(
            Math.random() *
            randomAlbum.tracks.length
        );

    playTrack(
        randomAlbum.id,
        randomTrackIndex
    );
}

document
.getElementById("search")
.addEventListener(
    "input",
    e => {

        const query =
            e.target.value
            .toLowerCase()
            .trim();

        if (query === "") {

            currentAlbums =
                library;

            showAlbums(library);

            return;
        }

        const results =
            library.filter(album => {

                const albumMatch =
                    album.title
                    .toLowerCase()
                    .includes(query);

                const trackMatch =
                    album.tracks.some(track =>
                        track.title
                        .toLowerCase()
                        .includes(query)
                    );

                return (
                    albumMatch ||
                    trackMatch
                );
            });

        currentAlbums =
            results;

        showAlbums(results);
    }
);
