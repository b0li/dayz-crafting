const CACHE_NAME = 'dayz-crafting-v1';
const ASSETS = [
	'./',
	'./index.html',
	'./manifest.json',
	'./icon-192.png',
	'./icon-512.png',
	'./assets/img/logo.png',
];

// Install: cache all assets
self.addEventListener( 'install', ( e ) => {

	e.waitUntil(
		caches.open( CACHE_NAME ).then( ( cache ) => cache.addAll( ASSETS ) )
	);
	self.skipWaiting();

});

// Activate: clean old caches
self.addEventListener( 'activate', ( e ) => {

	e.waitUntil(
		caches.keys().then( ( keys ) => {
			return Promise.all(
				keys.filter( ( k ) => k !== CACHE_NAME ).map( ( k ) => caches.delete( k ) )
			);
		})
	);
	self.clients.claim();

});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener( 'fetch', ( e ) => {

	const isHtml = e.request.destination === 'document' ||
		e.request.url.endsWith( '.html' ) ||
		e.request.url.endsWith( '/' );

	if ( isHtml ) {

		e.respondWith(
			fetch( e.request ).then( ( response ) => {

				if ( response.status === 200 ) {

					const clone = response.clone();
					caches.open( CACHE_NAME ).then( ( cache ) => cache.put( e.request, clone ) );

				}

				return response;

			}).catch( () => {
				return caches.match( e.request ) || caches.match( './index.html' );
			})
		);

	} else {

		e.respondWith(
			caches.match( e.request ).then( ( cached ) => {

				return cached || fetch( e.request ).then( ( response ) => {

					if ( response.status === 200 ) {

						const clone = response.clone();
						caches.open( CACHE_NAME ).then( ( cache ) => cache.put( e.request, clone ) );

					}

					return response;

				});

			}).catch( () => {
				return caches.match( './index.html' );
			})
		);

	}

});
