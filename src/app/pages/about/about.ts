import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AboutComponent {
  readonly projects = [
    {
      name: 'OneVision Encoder',
      href: 'https://github.com/search?q=OneVision+Encoder+EvolvingLMMs-Lab&type=repositories',
    },
    { name: 'LMMs-Engine', href: 'https://github.com/EvolvingLMMs-Lab/lmms-engine' },
    {
      name: 'LLaVA-OneVision-2',
      href: 'https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2',
    },
    {
      name: 'LLaVA-OneVision-1.5',
      href: 'https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5',
    },
    {
      name: 'Multimodal-SAE',
      href: 'https://github.com/EvolvingLMMs-Lab/multimodal-sae',
    },
    { name: 'LLaVA-OneVision', href: 'https://github.com/LLaVA-VL/LLaVA-NeXT' },
    { name: 'LMMs-Eval', href: 'https://github.com/EvolvingLMMs-Lab/lmms-eval' },
  ];

  constructor() {
    inject(SeoService).setPage({
      title: 'About',
      description: 'About the LMMs-Lab research organization, its manifesto, and core projects.',
      path: '/about',
    });
  }
}
