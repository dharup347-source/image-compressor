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

selectedFiles.forEach(function (file, index) {  

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
    "Compressing...";  


resultsList.innerHTML = "";  

results.style.display = "block";  

let totalOriginal = 0;  
let totalCompressed = 0;  


for (let i = 0; i < selectedFiles.length; i++) {  

    try {  

        const result =  
            await compressImage(selectedFiles[i]);  


        totalOriginal +=  
            result.file.size;  

        totalCompressed +=  
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
                <img src="${url}" alt="Compressed image">  
            </div>  

            <div class="result-info">  

                <strong>${result.file.name}</strong>  

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


const totalSaved =  
    ((totalOriginal -  
        totalCompressed) /  
        totalOriginal) * 100;  


savings.textContent =  
    totalSaved > 0  
        ? totalSaved.toFixed(1) +  
          "% smaller overall"  
        : "No overall reduction";  


compressBtn.disabled = false;  

compressBtn.textContent =  
    "Compress Again";

});