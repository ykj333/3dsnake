// ES6 모듈 방식으로 Three.js 임포트
import * as THREE from './three.module.min.js';

// 씬 생성
const scene = new THREE.Scene();

// 카메라 생성
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

// 렌더러 생성
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 그리드 설정
const gridSize = 20;
const gridDivisions = gridSize;
const cubeSize = 1;

// 그리드 헬퍼 생성
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
scene.add(gridHelper);

// 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// 재질 설정
const snakeHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const foodMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

// 뱀 설정
let snake = [];
let snakeSize = 1;
let direction = new THREE.Vector3(1, 0, 0);

// 뱀 머리 기하학
const snakeHeadGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
let snakeHead = new THREE.Mesh(snakeHeadGeometry, snakeHeadMaterial);
snakeHead.position.set(0, cubeSize / 2, 0);
snake.push(snakeHead);
scene.add(snakeHead);

// 음식 설정
const foodGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
let food = new THREE.Mesh(foodGeometry, foodMaterial);
placeFood();
scene.add(food);

// 이동 컨트롤
document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
        case 37: // 왼쪽 화살표
            if (direction.x === 0) direction.set(-1, 0, 0);
            break;
        case 38: // 위쪽 화살표
            if (direction.z === 0) direction.set(0, 0, -1);
            break;
        case 39: // 오른쪽 화살표
            if (direction.x === 0) direction.set(1, 0, 0);
            break;
        case 40: // 아래쪽 화살표
            if (direction.z === 0) direction.set(0, 0, 1);
            break;
    }
});

// 애니메이션 루프
let lastMoveTime = 0;
const moveInterval = 200; // 200ms마다 이동

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    if (currentTime - lastMoveTime > moveInterval) {
        lastMoveTime = currentTime;
        moveSnake();
    }

    updateCamera();
    renderer.render(scene, camera);
}
animate();

// 함수들
function moveSnake() {
    const newHeadPosition = snake[0].position.clone().add(direction.clone().multiplyScalar(cubeSize));

    if (checkCollision(newHeadPosition)) {
        alert("게임 오버!");
        resetGame();
        return;
    }

    const newHead = new THREE.Mesh(snakeHeadGeometry, snakeHeadMaterial);
    newHead.position.copy(newHeadPosition);
    snake.unshift(newHead);
    scene.add(newHead);

    if (newHead.position.distanceTo(food.position) < 0.5) {
        snakeSize++;
        placeFood();
    }

    if (snake.length > snakeSize) {
        const tail = snake.pop();
        scene.remove(tail);
    }
}

function checkCollision(position) {
    const halfGridSize = gridSize / 2;

    if (Math.abs(position.x) > halfGridSize || Math.abs(position.z) > halfGridSize) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (position.distanceTo(snake[i].position) < 0.1) {
            return true;
        }
    }

    return false;
}

function placeFood() {
    const maxPosition = (gridSize / 2) - (cubeSize / 2);
    const x = THREE.MathUtils.randInt(-maxPosition, maxPosition);
    const z = THREE.MathUtils.randInt(-maxPosition, maxPosition);
    food.position.set(x, cubeSize / 2, z);
}

function updateCamera() {
    const offset = new THREE.Vector3(0, 10, 10);
    camera.position.copy(snake[0].position).add(offset);
    camera.lookAt(snake[0].position);
}

function resetGame() {
    snake.forEach(segment => scene.remove(segment));
    snake = [];

    snakeSize = 1;
    direction.set(1, 0, 0);

    snakeHead = new THREE.Mesh(snakeHeadGeometry, snakeHeadMaterial);
    snakeHead.position.set(0, cubeSize / 2, 0);
    snake.push(snakeHead);
    scene.add(snakeHead);

    placeFood();
}
