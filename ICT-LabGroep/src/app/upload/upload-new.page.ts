import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController } from '@ionic/angular';
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { File } from "@ionic-native/file/ngx";
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import * as firebase from "firebase";

const STORAGE_KEY = 'my_images';


@Component({
  selector: 'app-upload',
  templateUrl: './upload2.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage implements OnInit {
        captureDataUrl: string;
        alertCtrl: AlertController;
        result;
      public myPhotosRef: any;
      public myPhoto: any;
      public myPhotoURL: any;
      ;

    constructor(private camera: Camera, private file: File, private filePath: FilePath, public navCtrl: NavController, public platform: Platform) {
     this.myPhotosRef = firebase.storage().ref('/images/');
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        if (!firebase.apps.length) {
        firebase.initializeApp({});
        }


      }


    async getPicture(sourceType){
        const cameraOptions: CameraOptions = {
          quality: 100,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          sourceType: sourceType
        };

        this.camera.getPicture(cameraOptions)
         .then((captureDataUrl) => {
           this.captureDataUrl = 'data:image/jpeg;base64,' + captureDataUrl;
        }, (err) => {
            console.log(err);
        });
        try {
                 //  let cameraInfo = await this.camera.getPicture(options);
                   let blobInfo = await this.makeFileIntoBlob(this.captureDataUrl);
                   let uploadInfo: any = await this.uploadToFirebase(blobInfo);

                   alert("File Upload Success " + uploadInfo.fileName);
                 } catch (e) {
                   console.log(e.message);
                   alert("File Upload Error " + e.message);
                 }
      }

    upload()
     {
        let storageRef = firebase.storage().ref();
        const filename = Math.floor(Date.now() / 1);
        const imageRef = storageRef.child(`images/${filename}.jpg`);

        imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL)
              .then((snapshot)=> {
                // Do something here when the data is succesfully uploaded!
                alert("File Upload Success");
                this.showSuccesfulUploadAlert();
              });
          }

    async showSuccesfulUploadAlert() {
           const alertController = document.querySelector('ion-alert-controller');
             await alertController.componentOnReady();

         let alert = await alertController.create({
           header: 'Uploaded!',
           subHeader: 'Picture is uploaded to Firebase',
           buttons: ['OK']
         });
        await alert.present();
         // clear the previous photo data in the variable

         this.captureDataUrl = "";
       }


    async pickImage() {
        const options: CameraOptions = {
          quality: 80,
          destinationType: this.camera.DestinationType.FILE_URI,
          encodingType: this.camera.EncodingType.JPEG,
          sourceType: this.camera.PictureSourceType.CAMERA,
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
