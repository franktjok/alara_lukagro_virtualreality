import { Component, OnInit, ViewChild, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';

import * as THREE from 'three';
import * as webvrui from 'webvr-ui';
import VRControls from 'three-vrcontrols-module';
import VREffect from 'three-vreffect-module';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Component({
  selector: 'app-web-vr',
  templateUrl: './web-vr.page.html',
  styleUrls: ['./web-vr.page.scss'],
})
export class WebVRPage implements OnInit {

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

  constructor(private element: ElementRef, private ngRenderer: Renderer2) { }

  ngOnInit() {
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
                  this.update();
              });

          })
          .catch(() => {

              this.animationDisplay = window;
              window.requestAnimationFrame(() => {
                  this.update();
              });

          });

      }

      update(): void {

              this.cube.rotateY(0.03);

              if(this.enterVR.isPresenting()){
                  this.controls.update();
                  this.renderer.render(this.scene, this.camera);
                  this.effect.render(this.scene, this.camera);
              } else {
                  this.renderer.render(this.scene, this.camera);
              }

              this.animationDisplay.requestAnimationFrame(() => {
                  this.update();
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
