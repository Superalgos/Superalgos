<template>
    <div class="modal-uploader-overlay" v-if="getUploaderVisibility">
        <div id="uploader-main-div" class="uploader" >
            <div class="top-bar">
                <p  class="bold">Image Uploader</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeUploader">
            </div>

            <div id="upload-panel-body">
            <div id="choose-img-div">
                <button @click="openFileDialog">Choose Image</button>
                <input type="file" ref="fileInput" accept="image/*" @change="uploadImage" style="display: none">
            </div>

            <div
                @dragenter="onDragEnter"
                @dragover="onDragOver"
                @drop="onDrop"
                class="image-uploader"
            >
                <p id="drag-n-drop-text">Drag and Drop to Upload</p>
            </div>

            </div>
        </div>
    </div>
</template>

<script>

import store from '../../store/index'


export default {
    name: 'image-uploader-panel',
    data() {
    return {
        };
    },
    methods: {
        closeUploader() {
            store.commit("SHOW_IMAGE_UPLOADER", false);
            return store.state.showImageUploader;
        },
        openFileDialog() {
            this.$refs.fileInput.click()
        },
        uploadImage(event) {
            const file = event.target.files[0]
            // do something with the uploaded image file
            console.log(`Image uploaded: ${file.name}`)
        },
        onDragEnter(event) {
            // prevent default behavior
            event.preventDefault()
        },
        onDragOver(event) {
            // prevent default behavior
            event.preventDefault()
        },
        onDrop(event) {
            // prevent default behavior
            event.preventDefault()

            // get the dropped files
            const files = event.dataTransfer.files

            // do something with the dropped files
            console.log(`Files dropped: ${files.length}`)
        }
    },
    computed: {
        getUploaderVisibility() {
            return store.state.showImageUploader
        }
}
};
</script>

<style>
.modal-uploader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}
.uploader {
    background-color: rgb(240, 238, 238);
    border: solid 0.5px rgba(0, 0, 0, 0.479);
    border-radius: 20px;
    width: 35vw;
    height: 75vh;
    color: black;
}
/* Header Label */
#uploader-label-top {
    text-align: center;
    border-bottom: solid 1px black;
    font-weight: 600;
    font-size: 1.3vw;
    margin-top: 0px;
}
.bold {
    font-weight: 700;
}

#upload-panel-body {
    border-top: solid 1px black;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

}

.image-uploader {
    border: 2px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    width: 85%;
    height: 60%;
    position: relative;
}

#drag-n-drop-text {
    color: grey;
}

#choose-img-div {
    height: 10%;
    margin-top: 2%;
}


</style>