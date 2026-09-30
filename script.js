const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const compressBtn = document.getElementById("compressBtn");

const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const format = document.getElementById("format");

const fileList = document.getElementById("fileList");
const results = document.getElementById("results");
const resultsList = document.getElementById("resultsList");
const savings = document.getElementById("savings");

const totalImages = document.getElementById("totalImages");
const totalOriginal = document.getElementById("totalOriginal");
const totalCompressed = document.getElementById("totalCompressed");
const totalSaved = document.getElementById("totalSaved");

let selectedFiles = [];


// -------------------------
// SIZE FORMAT
// -------------------------

function formatBytes(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}


// -------------------------
// SELECT FILES
// -------------------------

fileInput.addEventListener("change", function () {

    selectedFiles = Array.from(fileInput.files)
        .filter(file => file.type.startsWith("image/"));

    showFileList();

});


// -------------------------
// SHOW FILE LIST
// -------------------------

function showFileList() {

    fileList.innerHTML = "";

    selectedFiles.forEach(function (file) {

        const item = document.createElement("div");

        item.className = "file-item";

        item.innerHTML = `
            <span>🖼️ ${file.name}</span>
            <span>${formatBytes(file.size)}</span>
        `;

        fileList.appendChild(item);

    });

    compressBtn.disabled =
        selectedFiles.length === 0;

    if (selectedFiles.length > 0) {

        compressBtn.textContent =
            "Compress " +
            selectedFiles.length +
            (selectedFiles.length === 1
                ? " Image"
                : " Images");

    }

}


// -------------------------
// QUALITY
// -------------------------

quality.addEventListener("input", function () {

    qualityValue.textContent =
        quality.value + "%";

});


// -------------------------
// DRAG & DROP
// -------------------------

uploadBox.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadBox.classList.add("dragging");

});


uploadBox.addEventListener("dragleave", function () {

    uploadBox.classList.remove("dragging");

});


uploadBox.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadBox.classList.remove("dragging");

    selectedFiles =
        Array.from(event.dataTransfer.files)
        .filter(file => file.type.startsWith("image/"));

    showFileList();

});


// -------------------------
// COMPRESS ONE IMAGE
// -------------------------

function compressImage(file) {

    return new Promise(function (resolve, reject) {

        const image = new Image();

        image.onload = function () {

            const canvas =
                document.createElement("canvas");

            canvas.width =
                image.naturalWidth;

            canvas.height =
                image.naturalHeight;

            const ctx =
                canvas.getContext("2d");

            let outputFormat =
                format.value;


            // AUTO FORMAT

            if (outputFormat === "auto") {

                if (file.type === "image/webp") {
                    outputFormat = "webp";
                }

                else if (file.type === "image/png") {
                    outputFormat = "png";
                }

                else {
                    outputFormat = "jpeg";
                }

            }


            // WHITE BACKGROUND FOR JPG

            if (outputFormat === "jpeg") {

                ctx.fillStyle = "#ffffff";

                ctx.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }


            ctx.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );


            let mimeType =
                "image/jpeg";

            if (outputFormat === "webp") {
                mimeType = "image/webp";
            }

            if (outputFormat === "png") {
                mimeType = "image/png";
            }


            canvas.toBlob(
                function (blob) {

                    if (!blob) {
                        reject();
                        return;
                    }

                    resolve({
                        file: file,
                        blob: blob,
                        format: outputFormat
                    });

                },
                mimeType,
                Number(quality.value) / 100
            );

        };


        image.onerror = function () {
            reject();
        };


        image.src =
            URL.createObjectURL(file);

    });

}


// -------------------------
// COMPRESS ALL
// -------------------------

compressBtn.addEventListener("click", async function () {

    if (!selectedFiles.length) {
        return;
    }

    compressBtn.disabled = true;

    compressBtn.textContent =
        "Starting compression...";

    resultsList.innerHTML = "";

    results.style.display = "block";

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;


    // RESET SUMMARY

    totalImages.textContent =
        selectedFiles.length;

    totalOriginal.textContent =
        "Calculating...";

    totalCompressed.textContent =
        "Calculating...";

    totalSaved.textContent =
        "Calculating...";


    for (let i = 0; i < selectedFiles.length; i++) {

        // -------------------------
        // PROGRESS
        // -------------------------

        compressBtn.textContent =
            "Compressing " +
            (i + 1) +
            " / " +
            selectedFiles.length;


        try {

            const result =
                await compressImage(selectedFiles[i]);


            totalOriginalSize +=
                result.file.size;

            totalCompressedSize +=
                result.blob.size;


            const url =
                URL.createObjectURL(result.blob);


            const extension =
                result.format === "jpeg"
                    ? "jpg"
                    : result.format;


            const baseName =
                result.file.name
                    .replace(/\.[^/.]+$/, "");


            const item =
                document.createElement("div");

            item.className =
                "result-item";


            const saved =
                ((result.file.size -
                    result.blob.size) /
                    result.file.size) * 100;


            item.innerHTML = `

                <div class="result-image">

                    <img
                        src="${url}"
                        alt="Compressed image"
                    >

                </div>


                <div class="result-info">

                    <strong>
                        ${result.file.name}
                    </strong>


                    <p>

                        ${formatBytes(result.file.size)}

                        →

                        ${formatBytes(result.blob.size)}

                    </p>


                    <p class="saved">

                        ${
                            saved > 0
                            ? saved.toFixed(1) + "% smaller"
                            : "No size reduction"
                        }

                    </p>


                    <a
                        href="${url}"
                        download="${baseName}-compressed.${extension}"
                        class="download-btn"
                    >

                        ⬇ Download

                    </a>

                </div>

            `;


            resultsList.appendChild(item);


            // UPDATE SUMMARY LIVE

            const currentSaved =
                totalOriginalSize -
                totalCompressedSize;


            totalOriginal.textContent =
                formatBytes(totalOriginalSize);

            totalCompressed.textContent =
                formatBytes(totalCompressedSize);

            totalSaved.textContent =
                currentSaved > 0
                    ? formatBytes(currentSaved)
                    : "0 B";

        }

        catch {

            const error =
                document.createElement("p");

            error.textContent =
                "Could not compress " +
                selectedFiles[i].name;

            resultsList.appendChild(error);

        }

    }


    // -------------------------
    // FINAL SAVINGS
    // -------------------------

    const totalSavedPercent =
        totalOriginalSize > 0
            ? ((totalOriginalSize -
                totalCompressedSize) /
                totalOriginalSize) * 100
            : 0;


    savings.textContent =
        totalSavedPercent > 0
            ? totalSavedPercent.toFixed(1) +
              "% smaller overall"
            : "No overall reduction";


    // FINAL SUMMARY

    totalImages.textContent =
        selectedFiles.length;

    totalOriginal.textContent =
        formatBytes(totalOriginalSize);

    totalCompressed.textContent =
        formatBytes(totalCompressedSize);

    totalSaved.textContent =
        totalOriginalSize > totalCompressedSize
            ? formatBytes(
                totalOriginalSize -
                totalCompressedSize
            )
            : "0 B";


    // -------------------------
    // FINISHED
    // -------------------------

    compressBtn.disabled = false;

    compressBtn.textContent =
        "Compress Again";

});