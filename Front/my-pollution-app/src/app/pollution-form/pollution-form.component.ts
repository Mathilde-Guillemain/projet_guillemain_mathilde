import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PollutionService} from '../services/pollution.service';
import { ImageService } from '../services/image.service';
import { Pollution } from '../models/pollution.model';


@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './pollution-form.component.html',
  styleUrls: ['./pollution-form.component.css']
})
export class PollutionFormComponent {
  @Input() pollutionToEdit: Pollution | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput: ElementRef | null = null;
  
  pollutionForm: FormGroup;
  typesPollution = ['Plastique', 'Chimique', 'Dépôt sauvage', 'Eau', 'Air', 'Autre'];
  imagePreview: string | null = null;
  isUploadingImage = false;
  selectedFileName = '';

  constructor(
    private fb: FormBuilder, 
    private pollutionService: PollutionService,
    private imageService: ImageService
  ) {
    this.pollutionForm = this.fb.group({
      id: [null],
      titre: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      dateObservation: ['', Validators.required],
      lieu: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      photo: ['']
    });
  }

  ngOnChanges() {
    if (this.pollutionToEdit) {
      // Mapper les champs de l'API vers le formulaire
      const pollution = this.pollutionToEdit as any;
      
      this.pollutionForm.patchValue({
        id: pollution.id,
        titre: pollution.titre,
        type: pollution.type || pollution.type_pollution,
        description: pollution.description,
        dateObservation: pollution.dateObservation || pollution.date_observation || pollution.date,
        lieu: pollution.lieu,
        latitude: pollution.latitude,
        longitude: pollution.longitude,
        photo: pollution.photo || pollution.photo_url || pollution.photoUrl || ''
      });
      
      // Si l'édition a une photo, l'afficher
      const photoUrl = pollution.photo || pollution.photo_url || pollution.photoUrl;
      if (photoUrl) {
        this.imagePreview = photoUrl;
      }
    } else {
      this.pollutionForm.reset();
      this.imagePreview = null;
      this.selectedFileName = '';
    }
  }

  /**
   * Ouvrir le dialog de sélection de fichier
   */
  openFileDialog() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Gérer la sélection d'une image
   */
  onImageSelected(event: any) {
    const file: File = event.target.files?.[0];
    
    if (!file) return;
    
    // Valider le fichier
    if (!this.imageService.isValidImage(file)) {
      alert('Fichier invalide. Formats acceptés: JPG, PNG, GIF, WebP (Max 5MB)');
      return;
    }
    
    this.selectedFileName = file.name;
    this.isUploadingImage = true;
    
    // Convertir en base64
    this.imageService.convertToBase64(file).subscribe({
      next: (base64: string) => {
        // Optionnel: compresser l'image pour réduire la taille
        this.imageService.compressImage(base64, 0.85).subscribe({
          next: (compressedBase64: string) => {
            this.imagePreview = compressedBase64;
            this.pollutionForm.patchValue({ photo: compressedBase64 });
            this.isUploadingImage = false;
            console.log('Image convertie et compressée');
          },
          error: (err) => {
            console.error('Erreur compression:', err);
            // Fallback: utiliser l'image non compressée
            this.imagePreview = base64;
            this.pollutionForm.patchValue({ photo: base64 });
            this.isUploadingImage = false;
          }
        });
      },
      error: (err) => {
        alert('Erreur lors de la conversion de l\'image');
        console.error(err);
        this.isUploadingImage = false;
      }
    });
  }

  /**
   * Supprimer l'image sélectionnée
   */
  removeImage() {
    this.imagePreview = null;
    this.selectedFileName = '';
    this.pollutionForm.patchValue({ photo: '' });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit() {
    if (this.pollutionForm.invalid) return;

    const value = this.pollutionForm.value;
    // Adapter les noms de champs pour correspondre au modèle et à l'API
    const payload = {
      id: value.id,
      titre: value.titre,
      type_pollution: value.type,
      description: value.description,
      date_observation: value.dateObservation,
      lieu: value.lieu,
      latitude: Number(value.latitude),
      longitude: Number(value.longitude),
      photo_url: value.photo // La photo en base64
    };

    console.log('Sending pollution payload:', payload);

    if (payload.id) {
      this.pollutionService.updatePollution(payload.id, payload as any).subscribe({
        next: () => {
          this.pollutionForm.reset();
          this.imagePreview = null;
          this.selectedFileName = '';
          this.formSubmitted.emit();
        },
        error: (err) => {
          alert('Erreur lors de la modification');
          console.error(err);
        }
      });
    } else {
      this.pollutionService.addPollution(payload as any).subscribe({
        next: () => {
          this.pollutionForm.reset();
          this.imagePreview = null;
          this.selectedFileName = '';
          this.formSubmitted.emit();
        },
        error: (err) => {
          alert('Erreur lors de l\'ajout');
          console.error(err);
        }
      });
    }
  }


  cancel() {
    this.pollutionForm.reset();
    this.imagePreview = null;
    this.selectedFileName = '';
    this.formSubmitted.emit();
  }
}
