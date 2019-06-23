import { Component, OnInit, ViewChild, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController, ModalController, PopoverController  } from '@ionic/angular';
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { File } from "@ionic-native/file/ngx";
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import * as firebase from "firebase";
import * as THREE from 'three';
import * as webvrui from 'webvr-ui';
import VRControls from 'three-vrcontrols-module';
import VREffect from 'three-vreffect-module';
import 'firebase/auth';
import 'firebase/firestore';
import { SettingComponent } from '../setting/setting.component';
import { UploadPage } from '../upload/upload-new.page';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase ,AngularFireList ,AngularFireAction } from 'angularfire2/database';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit {

    captureDataUrl: string;
    alertCtrl: AlertController;
    result;
    public myPhotosRef: any;
    public myPhoto: any;
    public myPhotoURL: any;

    dataReturned:any;

    @ViewChild('cubeCanvas') cubeCanvas;

    private width: number = 350;
    private height: number = 400;

    private scene: THREE.Scene = new THREE.Scene();
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, this.width/this.height, 0.1, 1000);
    private renderer: THREE.WebGLRenderer;

    private controls: VRControls;
    private effect: VREffect;

    private cube: THREE.Mesh;
    private animationDisplay;
    private enterVR;
    public isAdmin = false;
    imagesSource:any;
    image;


  constructor(private cameras: Camera, private file: File, private filePath: FilePath, public navCtrl: NavController, public platform: Platform, private element: ElementRef, private ngRenderer: Renderer2, private popoverCtrl: PopoverController) {}

  ngOnInit(): void {
          //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
          //Add 'implements OnInit' to the class.
          if (!firebase.apps.length) {
          firebase.initializeApp({});
          }

         firebase.auth().onAuthStateChanged(user => {
                                         if (user){
                                              firebase
                                                  .firestore()
                                                  .doc(`/userProfile/${user.uid}`)
                                                  .get()
                                                  .then(userProfileSnapshot => {
                                                      this.isAdmin = userProfileSnapshot.data().isAdmin;
                                                      });
                                          }
                                         });

                     this.renderer = new THREE.WebGLRenderer({antialias: false, canvas: this.cubeCanvas.nativeElement});
                     this.controls = new VRControls(this.camera);
                     this.effect = new VREffect(this.renderer);

                     this.renderer.vr.enabled = true;
                     this.renderer.setSize(this.width, this.height);
                     this.renderer.setPixelRatio(window.devicePixelRatio);

                     this.cube = this.createCube(0.25, new THREE.Color('rgb(255,96,70)'));
                     this.cube.position.set(0, this.controls.userHeight, -0.8);
                     this.scene.add(this.cube);

                     this.controls.standing = true;
                     this.camera.position.y = this.controls.userHeight;

                     this.effect.setSize(this.width, this.height);

                     let loader: THREE.TextureLoader = new THREE.TextureLoader();

                     loader.load('assets/images/box.png', (texture) => {
                         this.initScene(texture);
                     });

                     window.addEventListener('resize', () => {
                         this.onResize();
                     });

                     window.addEventListener('vrdisplaypresentchange', () => {
                         this.onResize();
                     });


        }

  async addProjects(ev: any) {
      const popover = await this.popoverCtrl.create({
          component: UploadPage,
          event: ev,
          animated: true,
          showBackdrop: true
      });
      return await popover.present();
  }

       async getAllImages(){
       return new Promise((resolve, reject) => {
              firebase.storage().ref('/images/1560929116.jpg').getDownloadURL().then((url) => {
                  console.log(url)
                 var xhr = new XMLHttpRequest();
                 xhr.responseType = 'blob';
                 xhr.onload = function(event) {
                 var blob = xhr.response;
                  };
                 xhr.open('GET', url);
                 xhr.send();

                 var img = document.getElementById('myimg');
                 //img.src = url;
                 return url;
              })
            })
     }



       getImage(){
            return new Promise((resolve, reject) => {
                    firebase.storage().ref('/images/1559808975079.jpg'+`?alt=media&token=da8270fc-bce6-4be9-afef-82e1689fd654` ).getDownloadURL().then((url) => {
                        console.log(url);
                        return url;

                    })
                  })

        }

        getImages(){
              firebase.storage().ref().child('1559808975079.jpg').getDownloadURL().then((url) => {
              console.log(url);
              this.imagesSource = url;

                            })


                }

   async getPicture(sourceType){
           const cameraOptions: CameraOptions = {
             quality: 80,
             destinationType: this.cameras.DestinationType.DATA_URL,
             encodingType: this.cameras.EncodingType.JPEG,
             mediaType: this.cameras.MediaType.PICTURE,
             sourceType: sourceType
           };

           this.cameras.getPicture(cameraOptions)
            .then((captureDataUrl) => {
              this.captureDataUrl = 'data:image/jpeg;base64,' + captureDataUrl;
           }, (err) => {
               console.log(err);
           });
           try {
                    //  let cameraInfo = await this.cameras.getPicture(options);
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
           const filename = Math.floor(Date.now() / 1000);
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
             destinationType: this.cameras.DestinationType.FILE_URI,
             encodingType: this.cameras.EncodingType.JPEG,
             sourceType: this.cameras.PictureSourceType.CAMERA,
             mediaType: this.cameras.MediaType.PICTURE
           };
        try {
              let cameraInfo = await this.cameras.getPicture(options);
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

    initScene(texture): void {

              let skybox = this.createSky(5, texture);
              this.scene.add(skybox);

              let vrButtonOptions = {
                  color: 'white',
                  background: false,
                  corners: 'square'
              };

              this.enterVR = new webvrui.EnterVRButton(this.renderer.domElement, vrButtonOptions);
              this.ngRenderer.appendChild(this.element.nativeElement, this.enterVR.domElement);

              this.enterVR.getVRDisplay().then((display) => {

                  this.animationDisplay = display;
                  display.requestAnimationFrame(() => {
                      this.updates();
                  });

              })
              .catch(() => {

                  this.animationDisplay = window;
                  window.requestAnimationFrame(() => {
                      this.updates();
                  });

              });

          }

          updates(): void {

                  this.cube.rotateY(0.03);

                  if(this.enterVR.isPresenting()){
                      this.controls.updates();
                      this.renderer.render(this.scene, this.camera);
                      this.effect.render(this.scene, this.camera);
                  } else {
                      this.renderer.render(this.scene, this.camera);
                  }

                  this.animationDisplay.requestAnimationFrame(() => {
                      this.updates();
                  });

              }

          onResize(): void {
                  this.effect.setSize(this.width, this.height);
                  this.camera.aspect = this.width / this.height;
                  this.camera.updateProjectionMatrix();
              }

          createSky(size, texture): THREE.Mesh {

                  texture.wrapS = THREE.RepeatWrapping;
                  texture.wrapT = THREE.RepeatWrapping;
                  texture.repeat.set(size, size);

                  let geometry = new THREE.BoxGeometry(size, size, size);
                  let material = new THREE.MeshBasicMaterial({
                      color: 0xb5e8fc,
                      map: texture,
                      side: THREE.BackSide,
                  });

                  return new THREE.Mesh(geometry, material);

              }

           createCube(size, color): THREE.Mesh {

                   let geometry = new THREE.BoxGeometry(size, size, size);
                   let material = new THREE.MeshBasicMaterial({color});

                   return new THREE.Mesh(geometry, material);

               }



}
