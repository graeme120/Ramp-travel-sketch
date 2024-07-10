const svgFiles = [
  "assets/cloud1.svg",
  "assets/cloud2.svg",
  "assets/cloud3.svg",
  "assets/cloud4.svg",
  "assets/cloud5.svg",
];

const animationContainer = document.getElementById("animation-container");
const container = document.getElementById("container");
let moveToRight = true;
let lastMouseX = 0;

function createCloudElement(svgContent, moveRight) {
  const cloud = document.createElement("div");
  cloud.classList.add("cloud");
  cloud.style.animationName = moveRight ? "moveCloud" : "moveCloudLeft";
  cloud.innerHTML = svgContent;

  // Ensure the SVG content has proper width and height
  const svgElement = cloud.querySelector("svg");
  if (svgElement) {
    svgElement.style.width = "100%";
    svgElement.style.height = "100%";
  }

  // Apply a horizontal flip with 50% chance
  if (Math.random() < 0.5) {
    cloud.style.transform = "scaleX(-1)";
  }

  return cloud;
}

function loadSVG(file) {
  return fetch(file).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text();
  });
}

function animateCloud() {
  const randomIndex = Math.floor(Math.random() * svgFiles.length);
  loadSVG(svgFiles[randomIndex])
    .then((svgContent) => {
      const cloud = createCloudElement(svgContent, moveToRight);
      moveToRight = !moveToRight;
      animationContainer.appendChild(cloud);
      console.log(cloud); // Debugging: Check the cloud element
      setTimeout(() => {
        cloud.remove();
      }, 14000); // Remove the element after the animation completes
    })
    .catch((error) => {
      console.error("Error loading SVG:", error);
    });
}

function rotateContainers(event) {
  const { clientX } = event;
  const movementX = Math.abs(clientX - lastMouseX);

  if (movementX > 100) {
    const windowWidth = window.innerWidth;
    const rotation = (clientX / windowWidth - 0.5) * 30; // -15 to 15 degrees
    animationContainer.style.transform = `rotate(${rotation}deg)`;
    container.style.transform = `rotate(${rotation}deg)`;
    lastMouseX = clientX;
  }
}

window.addEventListener("mousemove", rotateContainers);

setInterval(animateCloud, 2000);
animateCloud(); // Start immediately
