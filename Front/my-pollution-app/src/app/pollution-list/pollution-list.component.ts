import { PollutionFormComponent } from '../pollution-form/pollution-form.component';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PollutionService} from '../services/pollution.service';
import { Pollution } from '../models/pollution.model';
import { Store } from '@ngxs/store';
import { AddFavorite, RemoveFavorite, FavoritesState } from '../store/favorites.state';
import { Observable, fromEvent, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-pollution-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pollution-list.component.html',
  styleUrls: ['./pollution-list.component.css']
})
export class PollutionListComponent implements OnInit, AfterViewInit {
  pollutions$!: Observable<Pollution[]>;
  searchField$!: Observable<any>;
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef | null = null;
  
  favoritesIds: number[] = [];
  searchTerm = '';

  constructor(
    private pollutionService: PollutionService, 
    private store: Store,
    private router: Router
  ) {
    // Initialiser avec la liste complète
    this.pollutions$ = this.pollutionService.getPollutions();
  }

  ngOnInit() {
    this.pollutions$ = this.pollutionService.getPollutions();
    // Abonner aux IDs des favoris
    this.store.select(FavoritesState.getFavoriteIds).subscribe(ids => {
      this.favoritesIds = ids?.filter((id): id is number => id !== undefined) || [];
    });
  }

  ngAfterViewInit() {
    // Initialiser la recherche dynamique après que la vue soit initialisée
    if (this.searchInput) {
      this.searchField$ = fromEvent<any>(this.searchInput.nativeElement, 'keyup');
      
      this.pollutions$ = this.searchField$.pipe(
        // Extraire la valeur du champ
        map(event => event.target.value),
        // Attendre 300ms après que l'utilisateur arrête de taper
        debounceTime(300),
        // Ne pas émettre si la valeur n'a pas changé
        distinctUntilChanged(),
        // Afficher dans la console pour le debug
        map(term => {
          console.log('Recherche lancée pour:', term);
          this.searchTerm = term;
          return term;
        }),
        // Basculer vers la recherche
        switchMap(term =>
          this.pollutionService.searchPollutions(term).pipe(
            // En cas d'erreur, retourner une liste vide
            catchError(err => {
              console.error('Erreur lors de la recherche:', err);
              return of([]);
            })
          )
        ),
        // Démarrer avec la liste complète
        startWith([])
      );
      
      // Charger la liste initiale
      this.pollutions$ = this.pollutionService.getPollutions().pipe(
        switchMap(initialList => 
          this.searchField$.pipe(
            map(event => event.target.value),
            debounceTime(300),
            distinctUntilChanged(),
            map(term => {
              console.log('Terme de recherche:', term);
              return term;
            }),
            switchMap(term =>
              this.pollutionService.searchPollutions(term).pipe(
                catchError(() => of([]))
              )
            ),
            startWith(initialList)
          )
        )
      );
    }
  }

  isFavorite(id: number | undefined): boolean {
    return id ? this.favoritesIds.includes(id) : false;
  }

  toggleFavorite(pollution: Pollution) {
    if (pollution.id) {
      if (this.isFavorite(pollution.id)) {
        this.store.dispatch(new RemoveFavorite(pollution.id));
      } else {
        this.store.dispatch(new AddFavorite(pollution));
      }
    }
  }

  addNew() {
    this.router.navigate(['/pollution/new']);
  }

  edit(p: Pollution) {
    if (p.id) {
      this.router.navigate(['/pollution/edit', p.id]);
    }
  }


  delete(p: Pollution) {
    if (!p.id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pollution?')) {
      this.pollutionService.deletePollution(p.id).subscribe({
        next: () => {
          this.refreshList();
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }


  refreshList() {
    this.pollutions$ = this.pollutionService.getPollutions();
  }

  showDetails(p: Pollution) {
    if (p.id) {
      this.router.navigate(['/pollution', p.id]);
    }
  }


}
