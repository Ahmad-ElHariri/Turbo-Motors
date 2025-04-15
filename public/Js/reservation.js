window.initMap = function () {
    const branches = {
      kantari: { lat: 33.8869, lng: 35.4785 },
      ashrafieh: { lat: 33.8889, lng: 35.5176 },
      sinelfil: { lat: 33.8716, lng: 35.5546 },
      airport: { lat: 33.8209, lng: 35.4884 }
    };
  
    const defaultCenter = branches.kantari;
  
    const map = new google.maps.Map(document.getElementById("map"), {
      center: defaultCenter,
      zoom: 12
    });
  
    const marker = new google.maps.Marker({
      map: map,
      position: defaultCenter,
      title: "Branch Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      }
    });
  
    const pickupSelect = document.getElementById("pickupLocation");
    const branchInfo = document.getElementById("branchInfo");
  
    pickupSelect.addEventListener("change", function () {
      const selected = this.value;
      const branch = branches[selected];
  
      if (branch) {
        map.setCenter(branch);
        marker.setPosition(branch);
        marker.setTitle(this.options[this.selectedIndex].text);
  
        branchInfo.innerHTML = `
          <h3>${this.options[this.selectedIndex].text}</h3>
          <p><strong>Latitude:</strong> ${branch.lat.toFixed(4)}, <strong>Longitude:</strong> ${branch.lng.toFixed(4)}</p>
        `;
      }
    });
  };
  