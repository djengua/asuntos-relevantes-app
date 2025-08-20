import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotLoggedGuard } from './not-logged.guard';
import { LoggedGuard } from './logged.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
    canActivate: [NotLoggedGuard],
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [LoggedGuard],
  },
  {
    path: 'asunto-detalle/:id',
    loadChildren: () =>
      import('./asunto-relevante-detalle/asunto-relevante-detalle.module').then(
        (m) => m.AsuntoRelevanteDetallePageModule
      ),
    canActivate: [LoggedGuard],
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
