document.addEventListener("DOMContentLoaded", () => {
  const planesContainer = document.getElementById("planes");
  let lastX,
    lastY,
    distance = 0,
    dashDistance = 35,
    planeDistance = 500,
    path = [],
    planes = [];
  let totalDistance = 0; // Total distance moved by cursor
  const dashes = [];

  planesContainer.addEventListener("mousemove", (e) => {
    if (lastX !== undefined && lastY !== undefined) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const segmentDistance = Math.sqrt(dx * dx + dy * dy);
      distance += segmentDistance;
      totalDistance += segmentDistance;

      if (distance >= dashDistance) {
        const dash = document.createElement("div");
        dash.classList.add("dash");
        dash.style.left = `${lastX}px`;
        dash.style.top = `${lastY}px`;
        dash.style.transform = `rotate(${
          (Math.atan2(dy, dx) * 180) / Math.PI
        }deg) translate(-50%, -50%)`;
        planesContainer.appendChild(dash);

        dashes.push(dash);

        setTimeout(() => {
          fadeOutDash(dash);
        }, 5000 + 250 * dashes.length); // Start fading after 5 seconds + 250ms for each dash

        path.push({ x: e.clientX, y: e.clientY });
        distance = 0; // Reset the distance after creating a dash
      }

      if (
        path.length === 0 ||
        (path[path.length - 1].x !== e.clientX &&
          path[path.length - 1].y !== e.clientY)
      ) {
        path.push({ x: e.clientX, y: e.clientY });
      }

      if (totalDistance >= planeDistance) {
        if (planes.length >= 10) {
          const oldestPlane = planes.shift();
          oldestPlane.element.style.transition = "opacity 1s ease-in-out";
          oldestPlane.element.style.opacity = 0;
          setTimeout(() => {
            oldestPlane.element.remove();
          }, 1000); // Remove the plane after it has faded out
        }

        const plane = document.createElement("img");
        plane.src = "assets/plane.svg";
        plane.classList.add("plane");
        plane.style.left = `${e.clientX}px`;
        plane.style.top = `${e.clientY}px`;

        // Calculate the initial rotation based on the direction of movement
        let initialAngle = 0;
        if (path.length > 1) {
          const p1 = path[path.length - 2];
          const p2 = path[path.length - 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          initialAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        }
        plane.style.transform = `rotate(${
          initialAngle + 90
        }deg) translate(-50%, -50%)`; // Set the initial rotation

        planesContainer.appendChild(plane);

        planes.push({
          element: plane,
          pathIndex: path.length - 1,
          lastAngle: initialAngle,
          distanceTraveled: 0,
          active: false,
        });
        totalDistance = 0; // Reset the total distance after creating a plane
      }
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  function fadeOutDash(dash) {
    dash.style.transition = "opacity 1s";
    dash.style.opacity = 0;
    setTimeout(() => {
      dash.remove();
    }, 1000); // Remove the dash after it has faded out

    // Check if any planes are near the dash and fade them out too
    planes.forEach((planeData) => {
      const plane = planeData.element;
      const planeRect = plane.getBoundingClientRect();
      const dashRect = dash.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(planeRect.left - dashRect.left, 2) +
          Math.pow(planeRect.top - dashRect.top, 2)
      );

      if (distance < 50) {
        // Adjust this threshold as needed
        plane.style.transition = "opacity 1s";
        plane.style.opacity = 0;
        setTimeout(() => {
          plane.remove();
        }, 1000); // Remove the plane after it has faded out
      }
    });
  }

  function interpolateAngle(currentAngle, targetAngle, factor) {
    let delta = targetAngle - currentAngle;
    if (delta > 180) {
      delta -= 360;
    } else if (delta < -180) {
      delta += 360;
    }
    return currentAngle + delta * factor;
  }

  function animatePlanes() {
    const speed = 0.5; // Adjust the speed to be 2x slower
    const rotationSpeed = 0.1; // Smoothing factor for rotation

    planes.forEach((planeData) => {
      const plane = planeData.element;
      const pathIndex = Math.floor(planeData.pathIndex);

      if (!planeData.active) {
        // Ensure the plane is properly rotated before fading in
        if (pathIndex < path.length - 1) {
          const p1 = path[pathIndex];
          const p2 = path[pathIndex + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          let targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
          planeData.lastAngle = targetAngle;
          plane.style.transform = `rotate(${
            planeData.lastAngle + 90
          }deg) translate(-50%, -50%)`;
        }

        planeData.distanceTraveled += speed;
        if (planeData.distanceTraveled >= 100) {
          setTimeout(() => {
            plane.style.opacity = 1; // Fade in the plane after 250ms delay
          }, 250);
          planeData.active = true;
        }
      }

      if (planeData.active && pathIndex < path.length - 1) {
        const p1 = path[pathIndex];
        const p2 = path[pathIndex + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = distance / speed;

        if (steps > 0) {
          const progress = planeData.pathIndex - pathIndex + 1 / steps;
          const x = p1.x + dx * progress;
          const y = p1.y + dy * progress;
          let targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

          planeData.lastAngle = interpolateAngle(
            planeData.lastAngle,
            targetAngle,
            rotationSpeed
          );

          plane.style.left = `${x}px`;
          plane.style.top = `${y}px`;
          plane.style.transform = `translate(-50%, -50%) rotate(${
            planeData.lastAngle + 90
          }deg)`; // Keep the plane centered

          planeData.pathIndex += 1 / steps;

          // Fade out the plane if it's about to catch up to the cursor
          if (planeData.pathIndex >= path.length - 2) {
            plane.style.opacity = 0;
          }
        } else {
          planeData.pathIndex = pathIndex + 1;
        }
      } else if (planeData.pathIndex >= path.length - 1) {
        plane.style.opacity = 0; // Ensure the plane is faded out when it catches up
      }
    });

    requestAnimationFrame(animatePlanes);
  }

  animatePlanes();
});
