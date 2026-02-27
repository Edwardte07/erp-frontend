import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ProgressBarModule, DividerModule],
  templateUrl: './group.html',
  styleUrl: './group.css',
})
export class Group {
  total = 12;
  avance = 65;
}