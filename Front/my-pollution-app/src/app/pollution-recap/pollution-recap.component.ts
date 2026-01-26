import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pollution-recap.component.html',
  styleUrls: ['./pollution-recap.component.css']
})
export class PollutionRecapComponent {
  @Input() pollutionData: any;
  @Output() homeClicked = new EventEmitter<void>();

  goHome() {
    this.homeClicked.emit();
  }
}
