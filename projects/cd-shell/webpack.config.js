// const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

// module.exports = withModuleFederationPlugin({

//   remotes: {
//     "user": "http://localhost:4407/remoteEntry.js",    
//   },

//   shared: {
//     ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
//   },

// });

const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
module.exports = withModuleFederationPlugin({

  // Explicitly share packages:
  shared: share({
      "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
      "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
      "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },                     
      "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  }),

});
