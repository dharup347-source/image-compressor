const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const compressBtn = document.getElementById("compressBtn");

const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const format = document.getElementById("format");

const results = document.getElementById("results");

const originalPreview = document.getElementById("originalPreview");
const compressedPreview = document.getElementById("compressedPreview");

const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const savings = document.getElementById("savings");

const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;
let compressedBlob = null;
let originalURL = null;
let compressedURL = null;


// -------------------------
// FILE SIZE
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
// SELECT IMAGE
// -------------------------

fileInput.addEventListener("change", function () {

    if (!fileInput.files || !fileInput.files[0]) {
        return;
    }

    selectedFile = fileInput.files[0];

    displayOriginal();

});


// -------------------------
// DISPLAY ORIGINAL
// -------------------------

function displayOriginal() {

    if (originalURL) {
        URL.revokeObjectURL(originalURL);
    }

    originalURL = URL.createObjectURL(selectedFile);

    originalPreview.src = originalURL;

    originalSize.textContent =
        "Size: " + formatBytes(selectedFile.size);

    compressedPreview.removeAttribute("src");

    compressedSize.textContent = "—";

    savings.textContent = "Ready";

    results.style.display = "block";

    compressBtn.disabled = false;

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

    if (!event.dataTransfer.files.length) {
        return;
    }

    const file = event.dataTransfer.files[0];

    if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        return;
    }

    selectedFile = file;

    displayOriginal();

});


// -------------------------
// COMPRESS
// -------------------------

compressBtn.addEventListener("click", function () {

    if (!selectedFile) {
        return;
    }

    compressBtn.disabled = true;
    compressBtn.textContent = "Compressing...";

    const image = new Image();

    image.onload = function () {

        const canvas = document.createElement("canvas");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext("2d");

        let outputFormat = format.value;


        // AUTO
        if (outputFormat === "auto") {

            if (selectedFile.type === "image/webp") {
                outputFormat = "webp";
            }

            else if (selectedFile.type === "image/png") {
                outputFormat = "png";
            }

            else {
                outputFormat = "jpeg";
            }

        }


        // JPG BACKGROUND
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


        let mimeType;

        if (outputFormat === "webp") {
            mimeType = "image/webp";
        }

        else if (outputFormat === "png") {
            mimeType = "image/png";
        }

        else {
            mimeType = "image/jpeg";
        }


        const qualityNumber =
            Number(quality.value) / 100;


        canvas.toBlob(function (blob) {

            if (!blob) {

                alert(
                    "Your browser could not create the compressed image."
                );

                compressBtn.disabled = false;
                compressBtn.textContent = "Compress Image";

                return;
            }


            compressedBlob = blob;


            // -------------------------
            // COMPRESSED PREVIEW
            // -------------------------

            if (compressedURL) {
                URL.revokeObjectURL(compressedURL);
            }

            compressedURL =
                URL.createObjectURL(compressedBlob);

            compressedPreview.onload = function () {

                console.log(
                    "Compressed preview loaded successfully."
                );

            };

            compressedPreview.onerror = function () {

                console.log(
                    "Compressed preview failed to load."
                );

            };

            compressedPreview.src =
                compressedURL;


            // -------------------------
            // SIZE
            // -------------------------

            compressedSize.textContent =
                "Size: " +
                formatBytes(compressedBlob.size);


            // -------------------------
            // SAVINGS
            // -------------------------

            const saved =
                ((selectedFile.size - compressedBlob.size)
                / selectedFile.size) * 100;


            if (saved > 0) {

                savings.textContent =
                    saved.toFixed(1) + "% smaller";

            }

            else {

                savings.textContent =
                    "No size reduction";

            }


            // -------------------------
            // DOWNLOAD
            // -------------------------

            const extension =
                outputFormat === "jpeg"
                    ? "jpg"
                    : outputFormat;

            const fileName =
                selectedFile.name
                    .replace(/\.[^/.]+$/, "");

            downloadBtn.href =
                compressedURL;

            downloadBtn.download =
                fileName +
                "-compressed." +
                extension;


            compressBtn.disabled = false;

            compressBtn.textContent =
                "Compress Again";


        }, mimeType, qualityNumber);


    };


    image.onerror = function () {

        alert("Unable to read this image.");

        compressBtn.disabled = false;

        compressBtn.textContent =
            "Compress Image";

    };


    image.src =
        URL.createObjectURL(selectedFile);

});