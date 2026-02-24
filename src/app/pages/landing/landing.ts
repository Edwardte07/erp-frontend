import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landing',
  imports: [ButtonModule, InputTextModule, CardModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

}
