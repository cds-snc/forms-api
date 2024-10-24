---
layout: null
---

importScripts( '{{ site.baseurl }}/cache-polyfill.js' );

var filesToCache = [
  // root
  '{{ site.baseurl }}/docs/',
  '{{ site.baseurl }}/docs/index.html',
  // css
  '{{ site.baseurl }}/docs/assets/css/main.css',
  '{{ site.baseurl }}/docs/assets/css/normalize.css',
  '{{ site.baseurl }}/docs/assets/css/syntax.css',
  // images
  '{{ site.baseurl }}/assets/img/octocat.png',
  // pages
  {% for page in site.documents %}'{{ site.baseurl }}{{ page.url }}',{% endfor %}
  // posts
  {% for post in site.posts %}'{{ site.baseurl }}{{ post.url }}',{% endfor %}
];

self.addEventListener( 'install', function( e ) {
  e.waitUntil(
    caches.open( '{{ site.cache_name }}' )
      .then( function( cache ) {
        return cache.addAll( filesToCache );
    })
  );
});

self.addEventListener( 'fetch', function( event ) {
  event.respondWith(
    caches.match( event.request ).then( function( response ) {
      return response || fetch( event.request );
    })
 );
});
