import { Routes } from '@angular/router';
import { LoginComponent } from './features/security/login/login.component';
import { ListComponent } from './features/contact/list/list.component';
import { CreateComponent } from './features/contact/create/create.component';
import { HomeComponent } from './features/contact/home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { CsvImportComponent } from './features/contact/csv-import/csv-import.component';

export const routes: Routes = [

    { path: '', redirectTo: '/contact-dashboard', pathMatch: 'full' },
    {
        path: 'login',
        component: LoginComponent,  // Directly reference the component if standalone
        // loadComponent: () => import('./features/security/login/login.component').then(m => m.LoginComponent) // For lazy loading
    },
    {
        path: 'contact-list',
        component: ListComponent,  
    },
    {
        path: 'contact-edit',
        component: CreateComponent,  
    },
    {
        path: 'contact-dashboard',
        component: HomeComponent,  
    },
    {
        path: 'contact-import',
        component: CsvImportComponent,  
    },
    {
        path: 'error',
        component: ErrorComponent
    }

];
