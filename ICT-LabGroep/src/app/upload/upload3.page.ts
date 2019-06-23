import { Component, OnInit } from '@angular/core';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { File } from "@ionic-native/file/ngx";
import * as firebase from "firebase";



const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-upload',
  templateUrl: './upload2.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage implements OnInit {
    captureDataUrl: string;
    result;

    constructor(private camera: Camera, private file: File, public navCtrl: NavController) {}

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        if (!firebase.apps.length) {
        firebase.initializeApp({});
        }
      }


    async pickImage() {
        const options: CameraOptions = {
          quality: 80,
          destinationType: this.camera.DestinationType.FILE_URI,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE
        };
     try {
           let cameraInfo = await this.camera.getPicture(options);
           let blobInfo = await this.makeFileIntoBlob(cameraInfo);
           let uploadInfo: any = await this.uploadToFirebase(blobInfo);

           alert("File Upload Success " + uploadInfo.fileName);
         } catch (e) {
           console.log(e.message);
           alert("File Upload Error " + e.message);
         }
       }

    // FILE STUFF
      makeFileIntoBlob(_imagePath) {
      let url ="";
        // INSTALL PLUGIN - cordova plugin add cordova-plugin-file
        return new Promise((resolve, reject) => {
          let fileName = "";
          this.file
            .resolveLocalFilesystemUrl(_imagePath)
            .then(fileEntry => {
              let { name, nativeURL } = fileEntry;

              // get the path..
              let path = nativeURL.substring(0, nativeURL.lastIndexOf("/"));
              console.log("path", path);
              console.log("fileName", name);

              fileName = name;

              // we are provided the name, so now read the file into
              // a buffer
              return this.file.readAsArrayBuffer(path, name);
            })
            .then(buffer => {
              // get the buffer and make a blob to be saved
              let imgBlob = new Blob([buffer], {type: "image/jpeg"});
              try {
                    url = webkitURL.createObjectURL(imgBlob);
              }
              catch (e)
              {
                    url = URL.createObjectURL(imgBlob);
              }
              console.log(imgBlob.type, imgBlob.size);
              resolve({
                fileName,
                imgBlob
              });
            })
            .catch(e => reject(e));
        });
      }

      /**
         *
         * @param _imageBlobInfo
         */
        uploadToFirebase(_imageBlobInfo) {
          console.log("uploadToFirebase");
          return new Promise((resolve, reject) => {
            let fileRef = firebase.storage().ref("images/" + _imageBlobInfo.fileName);

            let uploadTask = fileRef.put(_imageBlobInfo.imgBlob);

            uploadTask.on(
              "state_changed",
              (_snapshot: any) => {
                console.log(
                  "snapshot progess " +
                    (_snapshot.bytesTransferred / _snapshot.totalBytes) * 100
                );
              },
              _error => {
                console.log(_error);
                reject(_error);
              },
              () => {
                // completion...
                resolve(uploadTask.snapshot);
              }
            );
          });
        }


}
