import { Routes } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ToolsComponent } from './views/tools/tools.component';
import { DownloadsComponent } from './views/downloads/downloads.component'; // Import your DownloadsComponent
import { BatchFormComponent } from './app-components/batch-form/batch-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tools', component: ToolsComponent }, 
  { path: 'tools/:toolName', component: BatchFormComponent },
  { path: 'downloads', component: DownloadsComponent },
  { path: '**', redirectTo: '/dashboard' },
];
