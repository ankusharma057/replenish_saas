
// import React, { useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { Button } from 'react-bootstrap';
// import L from 'leaflet'; // Leaflet library for creating maps
// import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// const MapComponent = ({ newLocation, setNewLocation }) => {
//   const [zoom, setZoom] = useState(12); // Initial zoom level
//   const [mapInstance, setMapInstance] = useState(null); // Store the map instance for direct manipulation
//   const [isStreetViewEnabled, setIsStreetViewEnabled] = useState(false);

//   // Function to handle zoom in
//   const handleZoomIn = () => {
//     if (mapInstance) {
//       const newZoom = mapInstance.getZoom() + 1;
//       mapInstance.setZoom(newZoom); // Update zoom level directly
//       setZoom(newZoom); // Update state
//     }
//   };

//   // Function to handle zoom out
//   const handleZoomOut = () => {
//     if (mapInstance) {
//       const newZoom = mapInstance.getZoom() - 1;
//       mapInstance.setZoom(newZoom); // Update zoom level directly
//       setZoom(newZoom); // Update state
//     }
//   };

//   // Function to toggle fullscreen
//   const handleFullScreen = () => {
//     const mapContainer = document.querySelector('.leaflet-container');
//     if (mapContainer) {
//       if (mapContainer.requestFullscreen) {
//         mapContainer.requestFullscreen();
//       } else if (mapContainer.mozRequestFullScreen) {
//         mapContainer.mozRequestFullScreen();
//       } else if (mapContainer.webkitRequestFullscreen) {
//         mapContainer.webkitRequestFullscreen();
//       }
//     }
//   };

//   // Initialize map instance once it's created
//   const whenMapCreated = (map) => {
//     setMapInstance(map); // Store map instance for later use
//   };

//   return (
//     <div className="map-container" style={{ width: '100%', height: '400px' }}>
//       <MapContainer
//         center={{ lat: newLocation.latitude, lng: newLocation.longitude }}
//         zoom={zoom}
//         style={{ width: '100%', height: '100%' }}
//         scrollWheelZoom={false}
//         whenCreated={whenMapCreated} // Store map instance when it's created
//       >
//         {/* OpenStreetMap Tile Layer */}
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap URL
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         {/* Marker for new location */}
//         <Marker position={{ lat: newLocation.latitude, lng: newLocation.longitude }}>
//           <Popup>
//             New Location: {newLocation.latitude}, {newLocation.longitude}
//           </Popup>
//         </Marker>
//       </MapContainer>

//       {/* Controls */}
//       <div className="controls" style={{ marginTop: '10px' }}>
//         {/* <Button variant="secondary" onClick={handleZoomIn}>+</Button> */}
//         {/* <Button variant="secondary" onClick={handleZoomOut}>-</Button> */}
//         <Button variant="secondary" onClick={handleFullScreen}>Full Screen</Button>
//         <Button variant="secondary" onClick={() => setIsStreetViewEnabled(!isStreetViewEnabled)}>
//           {isStreetViewEnabled ? "Exit Street View" : "Enter Street View"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default MapComponent;

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

const MapComponent = ({ newLocation, setNewLocation }) => {
  const [zoom, setZoom] = useState(12); // Initial zoom level
  const [mapInstance, setMapInstance] = useState(null); // Store the map instance for direct manipulation
  const [isStreetViewEnabled, setIsStreetViewEnabled] = useState(false);

  // Function to handle zoom in
  const handleZoomIn = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom() + 1;
      mapInstance.setZoom(newZoom); // Update zoom level directly
      setZoom(newZoom); // Update state
    }
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    if (mapInstance) {
      const newZoom = mapInstance.getZoom() - 1;
      mapInstance.setZoom(newZoom); // Update zoom level directly
      setZoom(newZoom); // Update state
    }
  };

  // Function to toggle fullscreen
  const handleFullScreen = () => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer.mozRequestFullScreen) {
        mapContainer.mozRequestFullScreen();
      } else if (mapContainer.webkitRequestFullscreen) {
        mapContainer.webkitRequestFullscreen();
      }
    }
  };

  // Initialize map instance once it's created
  const whenMapCreated = (map) => {
    setMapInstance(map); // Store map instance for later use
  };

  return (
    <div className="map-container" style={{ width: '100%', height: '400px' }}>
      <MapContainer
        center={{ lat: newLocation.latitude, lng: newLocation.longitude }}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
        whenCreated={whenMapCreated} // Store map instance when it's created
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap URL
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Marker for new location */}
        <Marker position={{ lat: newLocation.latitude, lng: newLocation.longitude }}>
          <Popup>
            New Location: {newLocation.latitude}, {newLocation.longitude}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Controls */}
      <div className="controls" style={{ marginTop: '10px', position: 'relative', zIndex: 10, marginLeft: '150px' }}>
        <Button variant="secondary" size="sm" onClick={handleFullScreen} style={{ marginLeft: '50px' }}>
          Full Screen
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setIsStreetViewEnabled(!isStreetViewEnabled)} style={{marginLeft: '20px'}}>
          {isStreetViewEnabled ? "Exit Street View" : "Enter Street View"}
        </Button>
      </div>
    </div>
  );
};

export default MapComponent;
