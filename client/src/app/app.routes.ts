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
import { ProfileComponent } from "./views/profile/profile.component";
import { AdminGuard } from "./services/admin-guard/admin-guard.guard";
import { TermsConditionComponent } from "./views/terms-condition/terms-condition.component";
import { DocumentationComponent } from "./views/documentation/documentation.component";
import { ParserComponent } from "./views/parser/parser.component";
import { ParserFormComponent } from "./app-components/parser-form/parser-form.component";
import { SettingsComponent } from "./views/settings/settings.component";

const layoutRoutes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tools', component: ToolsComponent },
  { path: 'tools/:toolName', component: BatchFormComponent },
  { path: 'parser/:parserName', component: ParserFormComponent},
  { path: 'parsers', component: ParserComponent},
  { path: 'downloads', component: DownloadsComponent },
  { path: 'users-management', component: UsersManagementComponent, canActivate: [AdminGuard] },
  { path: 'profile', component: ProfileComponent },
  { path: 'terms-condition', component: TermsConditionComponent },
  { path: 'documentation', component: DocumentationComponent },
  { path: 'settings', component: SettingsComponent}
];

const rootRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
];

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: layoutRoutes
  },
  ...rootRoutes,
  { path: '**', redirectTo: '/dashboard' },
];