const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const editor = document.getElementById("editor");

const previewImage = document.getElementById("previewImage");

const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");

const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");

const formatSelect = document.getElementById("format");

const compressButton =
    document.getElementById("compressButton");

const downloadButton =
    document.getElementById("downloadButton");

const resetButton =
    document.getElementById("resetButton");

const result =
    document.getElementById("result");

const savingPercent =
    document.getElementById("savingPercent");


let selectedFile = null;
let compressedBlob = null;


/* -------------------------
   Format file size
------------------------- */

function formatSize(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (
            bytes / 1024
        ).toFixed(1) + " KB";
    }

    return (
        bytes /
        (1024 * 1024)
    ).toFixed(2) + " MB";
}


/* -------------------------
   Load image
------------------------- */

function loadImage(file) {

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a JPG, PNG or WebP image."
        );

        return;
    }


    selectedFile = file;

    originalSize.textContent =
        formatSize(file.size);

    compressedSize.textContent =
        "—";


    const reader =
        new FileReader();


    reader.onload = function(event) {

        previewImage.src =
            event.target.result;

        uploadArea.classList.add(
            "hidden"
        );

        editor.classList.remove(
            "hidden"
        );

        result.classList.add(
            "hidden"
        );

        downloadButton.classList.add(
            "hidden"
        );

        compressedBlob = null;

        compressButton.disabled =
            false;

        compressButton.textContent =
            "Compress Image";
    };


    reader.readAsDataURL(file);
}


/* -------------------------
   File selection
------------------------- */

fileInput.addEventListener(
    "change",
    function() {

        if (
            fileInput.files &&
            fileInput.files.length > 0
        ) {

            loadImage(
                fileInput.files[0]
            );
        }

    }
);


/* -------------------------
   Quality slider
------------------------- */

quality.addEventListener(
    "input",
    function() {

        qualityValue.textContent =
            quality.value + "%";

    }
);


/* -------------------------
   Get output format
------------------------- */

function getOutputFormat() {

    const selected =
        formatSelect.value;


    if (selected === "jpeg") {

        return {
            type: "image/jpeg",
            extension: "jpg"
        };
    }


    if (selected === "webp") {

        return {
            type: "image/webp",
            extension: "webp"
        };
    }


    if (selected === "png") {

        return {
            type: "image/png",
            extension: "png"
        };
    }


    /* AUTO */

    if (
        selectedFile.type ===
        "image/webp"
    ) {

        return {
            type: "image/webp",
            extension: "webp"
        };
    }


    if (
        selectedFile.type ===
        "image/png"
    ) {

        /*
         * PNG transparency is preserved
         * by keeping PNG in Auto mode.
         */

        return {
            type: "image/png",
            extension: "png"
        };
    }


    return {
        type: "image/jpeg",
        extension: "jpg"
    };
}


/* -------------------------
   Compress image
------------------------- */

compressButton.addEventListener(
    "click",
    function() {

        if (!selectedFile) {
            return;
        }


        compressButton.disabled =
            true;

        compressButton.textContent =
            "Compressing...";


        const image =
            new Image();


        image.onload =
            function() {

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    image.naturalWidth;

                canvas.height =
                    image.naturalHeight;


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                /*
                 * White background is used
                 * only for JPG because JPG
                 * doesn't support transparency.
                 */

                const output =
                    getOutputFormat();


                if (
                    output.type ===
                    "image/jpeg"
                ) {

                    ctx.fillStyle =
                        "#ffffff";

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


                /*
                 * PNG does not use the
                 * quality parameter in
                 * Canvas.toBlob().
                 */

                const compressionQuality =
                    output.type ===
                    "image/png"
                        ? undefined
                        : Number(
                            quality.value
                          ) / 100;


                canvas.toBlob(

                    function(blob) {

                        if (!blob) {

                            alert(
                                "This format is not supported by your browser."
                            );

                            compressButton.disabled =
                                false;

                            compressButton.textContent =
                                "Compress Image";

                            return;
                        }


                        compressedBlob =
                            blob;


                        compressedSize.textContent =
                            formatSize(
                                blob.size
                            );


                        const saved =
                            (
                                (
                                    selectedFile.size -
                                    blob.size
                                ) /
                                selectedFile.size
                            ) * 100;


                        const percentage =
                            Math.max(
                                0,
                                saved
                            );


                        savingPercent.textContent =
                            percentage.toFixed(
                                1
                            ) + "%";


                        result.classList.remove(
                            "hidden"
                        );


                        downloadButton.classList.remove(
                            "hidden"
                        );


                        compressButton.disabled =
                            false;

                        compressButton.textContent =
                            "Compress Again";

                    },

                    output.type,

                    compressionQuality

                );

            };


        image.onerror =
            function() {

                alert(
                    "Could not read this image."
                );

                compressButton.disabled =
                    false;

                compressButton.textContent =
                    "Compress Image";
            };


        image.src =
            previewImage.src;

    }
);


/* -------------------------
   Download
------------------------- */

downloadButton.addEventListener(
    "click",
    function() {

        if (!compressedBlob) {
            return;
        }


        const output =
            getOutputFormat();


        const url =
            URL.createObjectURL(
                compressedBlob
            );


        const link =
            document.createElement(
                "a"
            );


        const originalName =
            selectedFile.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                );


        link.href = url;


        link.download =
            "compressed-" +
            originalName +
            "." +
            output.extension;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }
);


/* -------------------------
   Reset
------------------------- */

resetButton.addEventListener(
    "click",
    function() {

        selectedFile = null;

        compressedBlob = null;

        fileInput.value = "";

        previewImage.src = "";

        uploadArea.classList.remove(
            "hidden"
        );

        editor.classList.add(
            "hidden"
        );

        result.classList.add(
            "hidden"
        );

        downloadButton.classList.add(
            "hidden"
        );

        compressedSize.textContent =
            "—";

        compressButton.disabled =
            false;

        compressButton.textContent =
            "Compress Image";

    }
);


/* -------------------------
   Drag & Drop
------------------------- */

uploadArea.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragging"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function() {

        uploadArea.classList.remove(
            "dragging"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragging"
        );


        const files =
            event.dataTransfer.files;


        if (
            files &&
            files.length > 0
        ) {

            loadImage(
                files[0]
            );
        }

    }
);