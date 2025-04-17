window.initMap = function () {
    const branches = {
      kantari: {
        name: "Beirut City Centre Kantari - Lebanon",
        address: "Army Street, Beirut",
        lat: 33.8869,
        lng: 35.4785,
        hours: {
          Monday: "08:00 - 20:00",
          Tuesday: "08:00 - 20:00",
          Wednesday: "08:00 - 20:00",
          Thursday: "08:00 - 20:00",
          Friday: "08:00 - 20:00",
          Saturday: "08:00 - 17:00",
          Sunday: "10:00 - 17:00"
        }
      },
      ashrafieh: {
        name: "Beirut Ashrafieh - Lebanon",
        address: "Sassine Square, Beirut",
        lat: 33.8889,
        lng: 35.5176,
        hours: {
          Monday: "08:30 - 18:00",
          Tuesday: "08:30 - 18:00",
          Wednesday: "08:30 - 18:00",
          Thursday: "08:30 - 18:00",
          Friday: "08:30 - 18:00",
          Saturday: "08:30 - 13:00",
          Sunday: "Closed"
        }
      },
      sinelfil: {
        name: "Beirut Sin El Fil - Lebanon",
        address: "Main Street, Sin El Fil",
        lat: 33.8716,
        lng: 35.5546,
        hours: {
          Monday: "09:00 - 18:00",
          Tuesday: "09:00 - 18:00",
          Wednesday: "09:00 - 18:00",
          Thursday: "09:00 - 18:00",
          Friday: "09:00 - 18:00",
          Saturday: "09:00 - 14:00",
          Sunday: "Closed"
        }
      },
      airport: {
        name: "Beirut Rafic Hariri International Airport - Lebanon",
        address: "Airport Road, Beirut",
        lat: 33.8209,
        lng: 35.4884,
        hours: {
          Monday: "24 hours",
          Tuesday: "24 hours",
          Wednesday: "24 hours",
          Thursday: "24 hours",
          Friday: "24 hours",
          Saturday: "24 hours",
          Sunday: "24 hours"
        }
      }
    };
  
    const map = new google.maps.Map(document.getElementById("map"), {
      center: branches.kantari,
      zoom: 12
    });
  
    // Pickup marker (red)
    const pickupMarker = new google.maps.Marker({
      map: map,
      position: branches.kantari,
      title: "Pickup Location",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    });
  
    // Drop-off marker (blue)
    const dropoffMarker = new google.maps.Marker({
      map: map,
      position: branches.kantari,
      title: "Drop-off Location",
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      visible: false // initially hidden
    });
  
    const pickupSelect = document.getElementById("pickupLocation");
    const dropoffSelect = document.getElementById("dropoffLocation");
    const branchInfo = document.getElementById("branchInfo");
    const returnDiffCheck = document.getElementById("returnDiffCheck");
    const dropoffSection = document.getElementById("dropoffSection");
  
    // 🔴 Update pickup marker
    pickupSelect.addEventListener("change", function () {
      const key = this.value;
      const branch = branches[key];
  
      if (branch) {
        pickupMarker.setPosition(branch);
        pickupMarker.setTitle(branch.name);
        map.setCenter(branch);
  
        if (!returnDiffCheck.checked) {
          dropoffSelect.value = key;
          dropoffMarker.setVisible(false);
        }
  
        let hoursHtml = "";
        for (let day in branch.hours) {
          hoursHtml += `<li><strong>${day}:</strong> ${branch.hours[day]}</li>`;
        }
  
        branchInfo.innerHTML = `
          <h3>${branch.name}</h3>
          <p><strong>Address:</strong> ${branch.address}</p>
          <ul>${hoursHtml}</ul>
        `;
      }
    });
  
    // 🔵 Update drop-off marker
    dropoffSelect.addEventListener("change", function () {
      if (!returnDiffCheck.checked || !dropoffSelect.value) return;
    
      const key = this.value;
      const branch = branches[key];
      if (branch) {
        dropoffMarker.setPosition(branch);
        dropoffMarker.setTitle(branch.name);
        dropoffMarker.setVisible(true);
    
        // Optional: update branch info to show dropoff too
        let hoursHtml = "";
        for (let day in branch.hours) {
          hoursHtml += `<li><strong>${day}:</strong> ${branch.hours[day]}</li>`;
        }
    
        branchInfo.innerHTML = `
          <h3>${branch.name}</h3>
          <p><strong>Address:</strong> ${branch.address}</p>
          <ul>${hoursHtml}</ul>
        `;
      }
    });
    
  
    // Show/hide drop-off options and marker
    returnDiffCheck.addEventListener("change", function () {
      if (this.checked) {
        dropoffSection.style.display = "block";
        dropoffMarker.setVisible(true);
  
        // Set marker if dropoff was already selected
        const key = dropoffSelect.value;
        const branch = branches[key];
        if (branch) {
          dropoffMarker.setPosition(branch);
          dropoffMarker.setTitle(branch.name);
        }
      } else {
        dropoffSection.style.display = "none";
        const pickupKey = pickupSelect.value;
        dropoffSelect.value = pickupKey;
        dropoffMarker.setVisible(false);
      }
    });
  
    // Trigger initial state
    if (pickupSelect.value) {
      pickupSelect.dispatchEvent(new Event("change"));
    }

    if (returnDiffCheck.checked && dropoffSelect.value) {
      dropoffSelect.dispatchEvent(new Event("change"));
    }

    document.querySelector("form").addEventListener("submit", function () {
      const pickupLocation = document.querySelector("input[name='pickupLocation']").value;
      const dropoffLocation = document.querySelector("input[name='dropoffLocation']").value;
      const pickupDate = document.querySelector("input[name='pickupDate']").value;
      const pickupTime = document.querySelector("input[name='pickupTime']").value;
      const dropoffDate = document.querySelector("input[name='dropoffDate']").value;
      const dropoffTime = document.querySelector("input[name='dropoffTime']").value;
    
      const reservationData = {
        pickupLocation,
        dropoffLocation,
        pickupDateTime: `${pickupDate}T${pickupTime}`,
        dropoffDateTime: `${dropoffDate}T${dropoffTime}`
      };
    
      localStorage.setItem("reservationData", JSON.stringify(reservationData));
    });
  };
  