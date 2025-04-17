import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-business-address-map',
  templateUrl: './business-address-map.component.html',
})
export class BusinessAddressMapComponent implements AfterViewInit {
  @Output() addressSelected = new EventEmitter<string>();
  map: any;
  marker: any;

  ngAfterViewInit() {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map').setView([14.5995, 120.9842], 13); // Default Manila location
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', async (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map);

      // Reverse geocoding using Nominatim
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const address = data.display_name;
      this.addressSelected.emit(address);
    });
  }
}
