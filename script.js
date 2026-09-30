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


// -----------------------------
// FILE SIZE FORMATTER
// -----------------------------

function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return (
        (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2) +
        " " +
        units[i]
    );
}


// -----------------------------
// FILE SELECTION
// -----------------------------

fileInput.addEventListener("change", function () {

    if (!fileInput.files.length) return;

    selectedFile = fileInput.files[0];

    showSelectedFile();

});


// -----------------------------
// SHOW ORIGINAL IMAGE
// -----------------------------

function showSelectedFile() {

    const imageURL = URL.createObjectURL(selectedFile);

    originalPreview.src = imageURL;

    originalSize.textContent =
        "Size: " + formatBytes(selectedFile.size);

    compressedPreview.removeAttribute("src");

    compressedSize.textContent = "—";

    savings.textContent = "Waiting...";

    results.style.display = "block";

    compressBtn.disabled = false;

}


// -----------------------------
// QUALITY SLIDER
// -----------------------------

quality.addEventListener("input", function () {

    qualityValue.textContent = quality.value + "%";

});


// -----------------------------
// DRAG & DROP
// -----------------------------

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

    const files = event.dataTransfer.files;

    if (!files.length) return;

    if (!files[0].type.startsWith("image/")) {

        alert("Please select an image file.");

        return;

    }

    selectedFile = files[0];

    showSelectedFile();

});


// -----------------------------
// COMPRESS IMAGE
// -----------------------------

compressBtn.addEventListener("click", function () {

    if (!selectedFile) return;

    compressBtn.disabled = true;
    compressBtn.textContent = "Compressing...";

    const img = new Image();

    img.onload = function () {

        const canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");

        let outputFormat = format.value;

        // AUTO FORMAT
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


        // JPG needs a white background
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
            img,
            0,
            0,
            canvas.width,
            canvas.height
        );


        let mimeType = "image/jpeg";

        if (outputFormat === "webp") {
            mimeType = "image/webp";
        }

        if (outputFormat === "png") {
            mimeType = "image/png";
        }


        let qualityValueNumber =
            Number(quality.value) / 100;


        canvas.toBlob(

            function (blob) {

                if (!blob) {

                    alert("Compression failed. Please try another image.");

                    compressBtn.disabled = false;
                    compressBtn.textContent = "Compress Image";

                    return;

                }

                compressedBlob = blob;


                // -----------------------------
                // UPDATE COMPRESSED PREVIEW
                // -----------------------------

                const compressedURL =
                    URL.createObjectURL(blob);

                compressedPreview.src =
                    compressedURL;


                compressedSize.textContent =
                    "Size: " + formatBytes(blob.size);


                // -----------------------------
                // SAVINGS
                // -----------------------------

                const percentage =
                    ((selectedFile.size - blob.size) /
                    selectedFile.size) * 100;


                if (percentage > 0) {

                    savings.textContent =
                        percentage.toFixed(1) +
                        "% smaller";

                }

                else {

                    savings.textContent =
                        "No size reduction";

                }


                // -----------------------------
                // DOWNLOAD
                // -----------------------------

                const extension =
                    outputFormat === "jpeg"
                        ? "jpg"
                        : outputFormat;

                const baseName =
                    selectedFile.name
                    .replace(/\.[^/.]+$/, "");

                downloadBtn.href =
                    compressedURL;

                downloadBtn.download =
                    baseName +
                    "-compressed." +
                    extension;


                compressBtn.disabled = false;

                compressBtn.textContent =
                    "Compress Again";

            },

            mimeType,

            qualityValueNumber

        );

    };


    img.onerror = function () {

        alert("Unable to read this image.");

        compressBtn.disabled = false;

        compressBtn.textContent =
            "Compress Image";

    };


    img.src =
        URL.createObjectURL(selectedFile);

});