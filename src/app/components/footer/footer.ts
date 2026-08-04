import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  readonly sourceCodeUrl = 'https://github.com/EvolvingLMMs-Lab/lmms-lab-blog';
}
