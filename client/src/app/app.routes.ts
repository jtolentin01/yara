import { Routes } from "@angular/router";
import { DashboardComponent } from "./views/dashboard/dashboard.component";
import { ToolsComponent } from "./views/tools/tools.component";
import { DownloadsComponent } from "./views/downloads/downloads.component";
import { BatchFormComponent } from "./app-components/batch-form/batch-form.component";
import { LoginComponent } from "./views/login/login.component";
import { LayoutComponent } from "./layout/layout.component";
import { UsersManagementComponent } from "./views/users-management/users-management.component";
import { AuthGuard } from "./services/auth-guard/auth.guard";
import { NoAuthGuard } from "./services/auth-guard-no/no-auth.guard";

const layoutRoutes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tools', component: ToolsComponent },
  { path: 'tools/:toolName', component: BatchFormComponent },
  { path: 'downloads', component: DownloadsComponent },
  {path: 'users-management', component: UsersManagementComponent}
];

const rootRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] }, // Protect login route with NoAuthGuard
];

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Default layout for main routes
    canActivate: [AuthGuard], // Protect layout routes
    children: layoutRoutes // Child routes using LayoutComponent
  },
  ...rootRoutes, // Routes that do not use LayoutComponent
  { path: '**', redirectTo: '/dashboard' }, // Redirect invalid routes to dashboard
];