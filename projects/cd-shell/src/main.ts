import { initFederation } from '@angular-architects/module-federation';
import { environment } from './environments/environment';


initFederation(environment.mfManifestPath)
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
