import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

class CylinderBox {
    constructor() {
        const divContainer = document.querySelector('#webgl-container');
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);
        renderer.setClearColor(0xffffff);
        this._renderer = renderer;


        const cssRenderer = new CSS3DRenderer({antialias: true});
        cssRenderer.domElement.style.position = 'absolute';
        cssRenderer.domElement.style.top = 0;
        document.body.appendChild(cssRenderer.domElement);
        this._cssRenderer = cssRenderer;


        const scene = new THREE.Scene();
        this._scene = scene;
        

        // var radius = window.innerHeight;
        var radius = 1000;
        this._initialRadius = radius;
        this._radius = this._initialRadius;
        this._maxRadius = this._initialRadius;
        console.log(this._radius);

        var imgRadius = this._maxRadius * 0.5;
        this._img_radius = imgRadius;

        const initialVerticesIndex = 3;
        this._verticesIndex = initialVerticesIndex;

        this._texture;
        this._offsetX = 0;

        this._flatInterval;
        this._deltaY = 0;
        this._cylinder = null;
        this._isCylinder = false;
        this._backLimitZ = 100;
        this._startMargin = 400;
        this._cameraLocationZ = 1200;

        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupImgModel();
        this._setupControls();

        window.addEventListener('wheel',this.onWheel.bind(this));
        document.getElementById('search-input').addEventListener('input', this.search.bind(this));

        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));
    }

    search() {
        this._isCylinder = true;

        var hash = document.getElementById('search-input').value;
        const children = this._cylinder.children;
        let targetChild;
        let targetIndex;
        for (var i = 0; i < children.length; i++) {
            if (children[i].element.innerHTML.includes(hash)) {
                targetChild = children[i];
                targetIndex = i;
                break;
            }
        }
        if (targetIndex !== undefined) {
            const frontIndex = 0;

            var rotationX = (frontIndex - targetIndex) / children.length * Math.PI * 2 + (Math.PI/2);
            console.log('search: '+targetIndex);
            this._offsetX = 8 * (frontIndex - targetIndex) / children.length;
            // this._cylinder.rotation.x = rotationX;
            new TWEEN.Tween(this._cylinder.rotation)
                .to({x: rotationX},1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(()=> {
                    for (var i = 0; i < children.length; i++) {
                        children[i].lookAt(0,0,0);
                        children[i].rotation.y = Math.PI;
                    }
                })
                .start();
            new TWEEN.Tween(this._texture.offset)
                .to({x: this._offsetX},1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(()=> {
                    this._material.needsUpdate = true;
                })
                .start();
        }
        
    }

    _setupControls() {
        const controls = new OrbitControls(this._camera,this._divContainer);
        this._controls = controls;
        this._controls.update();
    }    

    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            50,
            width / height,
            0.1,
            2000
        );
        camera.lookAt(0,0,0);
        // camera.position.x = window.innerWidth;
        camera.position.x = 0;
        camera.position.y = 0;
        // camera.position.z = 0;
        camera.position.z = this._radius + this._cameraLocationZ;
        this._camera = camera;
    }

    _setupLight() {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 0, this._radius+100);
        this._scene.add(light);
    }

    _setupModel() {
        const cylinder = new THREE.Group();
        const items = [...document.querySelectorAll('a')];

        for (let i=0; i<items.length; i++) {
            const item = items[i];
            const angle = (i / items.length) * Math.PI * 2;
            this._angle = angle;

            var element = new CSS3DObject(item);
            const x = 0;
            const y = Math.cos(angle) * this._radius;
            const z = Math.sin(angle) * this._radius;
            element.position.set(x,y,z);

            element.lookAt(0,0,0);
            element.rotation.y = Math.PI;
            cylinder.add(element);
        }
        this._cylinder = cylinder;
        this._scene.add(this._cylinder);
    }

    _setupImgModel() {
        const canvas = document.createElement('canvas');
        // canvas.width = window.innerWidth * 7.2;
        canvas.width = 12016;
        // canvas.height = window.innerHeight * 3;
        canvas.height = 2928;
        
        const aspectRatio = canvas.width / canvas.height;
        console.log('aspect: '+aspectRatio);
        // console.log(canvas.height);
        // document.body.prepend(canvas);
        
        const items = [...document.querySelectorAll('.img-container img')];
        
        const context = canvas.getContext('2d');
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        // context.strokeStyle= '#000000';
        // context.lineWidth = 2;
        // context.strokeRect(0,0,canvas.width, canvas.height);

     
        var leftX = -1200;
        var rightX = 600;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(Math.PI / 2);
        var canvasHeightTop = -canvas.height/2; // -2739/2 = -1869
        const imgInfos = [
            { positionX: leftX, positionY: canvasHeightTop-4200, styleWidth: '80%', ratio: 0.3 },
            { positionX: rightX-30, positionY: canvasHeightTop-3400, styleWidth: '80%', ratio: 0.15 },
            { positionX: leftX+100, positionY: canvasHeightTop-2800, styleWidth: '80%', ratio: 0.5 },
            { positionX: rightX+60, positionY: canvasHeightTop-2000, styleWidth: '100%', ratio: 0.25 },
            { positionX: leftX+80, positionY: canvasHeightTop-300, styleWidth: '100%', ratio: 0.3 },
            { positionX: rightX+50, positionY: canvasHeightTop+600, styleWidth: '100%', ratio: 0.3 },
            { positionX: leftX, positionY: canvasHeightTop+2400, styleWidth: '100%', ratio: 0.3 },
            { positionX: rightX, positionY: canvasHeightTop+2700, styleWidth: '100%', ratio: 0.2 },
        ];
        for (var i=0; i<items.length; i++) {
            items[i].style.width = imgInfos[i].styleWidth;
            items[i].style.filter = "grayscale(100%)";
            context.drawImage(
                items[i], 
                imgInfos[i].positionX, 
                imgInfos[i].positionY, 
                items[i].width * imgInfos[i].ratio, 
                items[i].height * imgInfos[i].ratio
            );

        }

        var canvasHeightTop2 = 2000;
        const imgInfos2 = [
            { positionX: leftX, positionY: canvasHeightTop2, styleWidth: '20%', ratio: 0.25 },
            { positionX: rightX-30, positionY: canvasHeightTop2+200, styleWidth: '80%', ratio: 0.15 },
            { positionX: leftX+100, positionY: canvasHeightTop2+1000, styleWidth: '100%', ratio: 0.5 },
            { positionX: rightX+60, positionY: canvasHeightTop2+800, styleWidth: '100%', ratio: 0.25 },
            { positionX: leftX+80, positionY: canvasHeightTop2+2500, styleWidth: '100%', ratio: 0.3 },
            { positionX: rightX+50, positionY: canvasHeightTop2+2000, styleWidth: '100%', ratio: 0.3 },
            { positionX: leftX, positionY: canvasHeightTop2+3300, styleWidth: '100%', ratio: 0.3 },
            { positionX: rightX, positionY: canvasHeightTop2+3200, styleWidth: '100%', ratio: 0.2 },
        ];
        for (var i=0; i<items.length; i++) {
            items[i].style.width = imgInfos[i].styleWidth;
            items[i].style.filter = "grayscale(100%)";
            context.drawImage(
                items[i], 
                imgInfos2[i].positionX, 
                imgInfos2[i].positionY, 
                items[i].width * imgInfos2[i].ratio, 
                items[i].height * imgInfos2[i].ratio
            );

        }

    //    const cylinderWidth = canvas.height;
    //    console.log('width: '+cylinderWidth);

        const texture = new THREE.CanvasTexture(canvas);
        this._texture = texture;
        // this._texture.center.set(0.5,0.5)
        
        const material = new THREE.MeshBasicMaterial({map:texture});
        this._material = material;
        const geometry = new THREE.CylinderGeometry(
            this._img_radius,
            this._img_radius,
            2500,
            // window.innerHeight * 2,
            // window.innerWidth * 1,
            256, 128, true
        );


        // -> set cylinder vertices
        const position = geometry.attributes.position;
        // console.log(position);
        for (let i=0; i<position.count; i++) {
            position.setX(i, position.getX(i)*this._verticesIndex);
            position.setZ(i, position.getZ(i)*1/2);
        }
        position.needsUpdate = true;

        this._imgGeometry = geometry;

        const imgCylinder = new THREE.Mesh(geometry,material);
        // var cylinderAspectRatio = this._img_radius * 2 / window.innerHeight;
        // console.log(cylinderAspectRatio);
        
        imgCylinder.rotation.z = Math.PI/2;
        this._imgCylinder = imgCylinder;
        this._scene.add(imgCylinder);
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width,height);
        // this._renderer.setSize(2500,1000);
        this._cssRenderer.setSize(width,height);
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        this._cssRenderer.render(this._scene, this._camera);
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
        this._controls.update();
    }

    update(time) {
        time *= 0.0005; //second unit
        if (this._isCylinder) {
            this.increaseRadius(time);
        }
        TWEEN.update();

        // --> remove objects back half of the cylinder
        for (var i=0; i<this._cylinder.children.length; i++) {
            this.removeBackObject(this._cylinder.children[i]);
        }
    }

    removeBackObject(object) {
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);
        if (worldPosition.z < this._backLimitZ) {
            object.visible = false;
        } else {
            object.visible = true;
        }
    }

    _updateModel() {
        const children = this._cylinder.children;
        for (let i=0; i<children.length; i++) {
            const child = children[i];
            const angle = (i / children.length) * Math.PI * 2;
            this._angle = angle;

            const x = 0;
            const y = Math.cos(angle) * this._radius;
            const z = Math.sin(angle) * this._radius;
            child.position.set(x,y,z);

            child.lookAt(0,0,0);
            child.rotation.y = Math.PI;

        }
    }

    onWheel(e) {
        // console.log('wheel: '+this._texture.offset.x);
        this._camera.position.set(0,0,this._radius+this._cameraLocationZ);

        // x: 앞뒤, y: 좌우, z: 위아래 
        this._cylinder.rotation.x += -e.deltaY * 0.0002;
        this._isCylinder = true;
        
        var deltaY = Math.abs(e.deltaY*0.03);

        var minRadiusRatio = 0.4;
        this._radius -= deltaY;
        // console.log('radius: '+this._radius);
        if (this._radius < this._initialRadius * minRadiusRatio) {
            this._radius = this._initialRadius * minRadiusRatio;
        }

        this._texture.wrapS = THREE.RepeatWrapping;
        this._texture.wrapT = THREE.RepeatWrapping;
        this._texture.offset.x += -e.deltaY  * 0.00025;
        this._texture.needsUpdate = true;
    }

    increaseRadius(time) {
        const alpha = 0.03;
        // -> text cylinder
        let oldValue = this._radius;
        let newValue = this._maxRadius;

        var smoothedValue = alpha * newValue + (1 - alpha) * oldValue;
        this._radius = smoothedValue;
        oldValue = smoothedValue;
        this._updateModel();

        this._camera.position.set(0,0,this._radius+this._cameraLocationZ);

        if (oldValue >= (newValue*0.95)) {
            this._isCylinder = false;
        }
    }
}

window.onload = function() {
    new CylinderBox();
    console.log('start js');
}