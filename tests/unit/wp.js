'use strict';
var chai = require( 'chai' );
var sinon = require( 'sinon' );
chai.use( require( 'sinon-chai' ) );
var expect = chai.expect;

var WP = require( '../../' );

// Constructors, for use with instanceof checks
var WPRequest = require( '../../lib/constructors/wp-request' );

// HTTP transport, for stubbing
var httpTransport = require( '../../lib/http-transport' );

describe( 'wp', function() {

	var site;

	beforeEach(function() {
		site = new WP({ endpoint: 'endpoint/url' });
	});

	describe( 'constructor', function() {

		it( 'enforces new', function() {
			var wp1 = new WP({ endpoint: '/' });
			expect( wp1 instanceof WP ).to.be.true;
			var wp2 = WP({ endpoint: '/' });
			expect( wp2 instanceof WP ).to.be.true;
		});

		it( 'throws an error if no endpoint is provided', function() {
			expect(function() {
				new WP({ endpoint: '/' });
			}).not.to.throw();
			expect(function() {
				new WP();
			}).to.throw();
		});

		it( 'throws an error if a non-string endpoint is provided', function() {
			expect(function() {
				new WP({ endpoint: 42 });
			}).to.throw();
			expect(function() {
				new WP({ endpoint: [] });
			}).to.throw();
			expect(function() {
				new WP({ endpoint: { lob: 'ster' } });
			}).to.throw();
		});

		it( 'sets options on an instance variable', function() {
			var wp = new WP({
				endpoint: 'http://some.url.com/wp-json',
				username: 'fyodor',
				password: 'dostoyevsky'
			});
			expect( wp._options.endpoint ).to.equal( 'http://some.url.com/wp-json/' );
			expect( wp._options.username ).to.equal( 'fyodor' );
			expect( wp._options.password ).to.equal( 'dostoyevsky' );
		});

		describe( 'assigns default HTTP transport', function() {

			it( 'for GET requests', function() {
				sinon.stub( httpTransport, 'get' );
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json'
				});
				var query = site.root( '' );
				query.get();
				expect( httpTransport.get ).to.have.been.calledWith( query );
				httpTransport.get.restore();
			});

			it( 'for POST requests', function() {
				sinon.stub( httpTransport, 'post' );
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json'
				});
				var query = site.root( '' );
				var data = {};
				query.create( data );
				expect( httpTransport.post ).to.have.been.calledWith( query, data );
				httpTransport.post.restore();
			});

			it( 'for POST requests', function() {
				sinon.stub( httpTransport, 'post' );
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json'
				});
				var query = site.root( '' );
				var data = {};
				query.create( data );
				expect( httpTransport.post ).to.have.been.calledWith( query, data );
				httpTransport.post.restore();
			});

			it( 'for PUT requests', function() {
				sinon.stub( httpTransport, 'put' );
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json'
				});
				var query = site.root( 'a-resource' );
				var data = {};
				query.update( data );
				expect( httpTransport.put ).to.have.been.calledWith( query, data );
				httpTransport.put.restore();
			});

			it( 'for DELETE requests', function() {
				sinon.stub( httpTransport, 'delete' );
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json'
				});
				var query = site.root( 'a-resource' );
				var data = {
					force: true
				};
				query.delete( data );
				expect( httpTransport.delete ).to.have.been.calledWith( query, data );
				httpTransport.delete.restore();
			});

		});

		describe( 'custom HTTP transport methods', function() {

			it( 'can be set for an individual HTTP action', function() {
				sinon.stub( httpTransport, 'get' );
				var customGet = sinon.stub();
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json',
					transport: {
						get: customGet
					}
				});
				var query = site.root( '' );
				query.get();
				expect( httpTransport.get ).not.to.have.been.called;
				expect( customGet ).to.have.been.calledWith( query );
				httpTransport.get.restore();
			});

			it( 'can extend the default HTTP transport methods', function() {
				sinon.stub( httpTransport, 'get' );
				var customGet = sinon.spy(function() {
					WP.transport.get.apply( null, arguments );
				});
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json',
					transport: {
						get: customGet
					}
				});
				var query = site.root( '' );
				query.get();
				expect( customGet ).to.have.been.calledWith( query );
				expect( httpTransport.get ).to.have.been.calledWith( query );
				httpTransport.get.restore();
			});

			it( 'can be set for multiple HTTP actions', function() {
				sinon.stub( httpTransport, 'post' );
				sinon.stub( httpTransport, 'put' );
				var customPost = sinon.stub();
				var customPut = sinon.stub();
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json',
					transport: {
						post: customPost,
						put: customPut
					}
				});
				var query = site.root( 'a-resource' );
				var data = {};
				query.create( data );
				expect( httpTransport.post ).not.to.have.been.called;
				expect( customPost ).to.have.been.calledWith( query, data );
				query.update( data );
				expect( httpTransport.put ).not.to.have.been.called;
				expect( customPut ).to.have.been.calledWith( query, data );
				httpTransport.post.restore();
				httpTransport.put.restore();
			});

			it( 'only apply to a specific WP instance', function() {
				sinon.stub( httpTransport, 'get' );
				var customGet = sinon.stub();
				var site = new WP({
					endpoint: 'http://some.url.com/wp-json',
					transport: {
						get: customGet
					}
				});
				var site2 = new WP({
					endpoint: 'http://some.url.com/wp-json'
				});
				expect( site ).not.to.equal( site2 );
				var query = site2.root( '' );
				query.get();
				expect( httpTransport.get ).to.have.been.calledWith( query );
				expect( customGet ).not.to.have.been.called;
				httpTransport.get.restore();
			});

		});

	});

	describe( '.transport constructor property', function() {

		it( 'is defined', function() {
			expect( WP ).to.have.property( 'transport' );
		});

		it( 'is an object', function() {
			expect( WP.transport ).to.be.an( 'object' );
		});

		it( 'has methods for each http transport action', function() {
			expect( WP.transport.delete ).to.be.a( 'function' );
			expect( WP.transport.get ).to.be.a( 'function' );
			expect( WP.transport.head ).to.be.a( 'function' );
			expect( WP.transport.post ).to.be.a( 'function' );
			expect( WP.transport.put ).to.be.a( 'function' );
		});

		it( 'is frozen (properties cannot be modified directly)', function() {
			expect(function() {
				WP.transport.get = function() {};
			}).to.throw();
		});

	});

	describe( '.site() constructor method', function() {

		it( 'is a function', function() {
			expect( WP ).to.have.property( 'site' );
			expect( WP.site ).to.be.a( 'function' );
		});

		it( 'creates and returns a new WP instance', function() {
			var site = WP.site( 'endpoint/url' );
			expect( site instanceof WP ).to.be.true;
			expect( site._options.endpoint ).to.equal( 'endpoint/url/' );
		});

		it( 'can take a routes configuration object to bootstrap the returned instance', function() {
			var site = WP.site( 'endpoint/url', {
				'/wp/v2/posts': {
					namespace: 'wp/v2',
					methods: [ 'GET' ],
					endpoints: [ {
						methods: [ 'GET' ],
						args: {
							filter: { required: false }
						}
					} ]
				}
			});
			expect( site instanceof WP ).to.be.true;
			expect( site.posts ).to.be.a( 'function' );
			expect( site ).not.to.have.property( 'comments' );
			expect( site.posts() ).not.to.have.property( 'id' );
			expect( site.posts().filter ).to.be.a( 'function' );
			expect( site.posts().toString() ).to.equal( 'endpoint/url/wp/v2/posts' );
		});

	});

	describe( '.discover() constructor method', function() {

		it( 'is a function', function() {
			expect( WP ).to.have.property( 'discover' );
			expect( WP.discover ).to.be.a( 'function' );
		});

	});

	describe( '.prototype', function() {

		describe( '.namespace()', function() {

			it( 'is a function', function() {
				expect( site ).to.have.property( 'namespace' );
				expect( site.namespace ).to.be.a( 'function' );
			});

			it( 'returns a namespace object with relevant endpoint handler methods', function() {
				var wpV2 = site.namespace( 'wp/v2' );
				// Spot check
				expect( wpV2 ).to.be.an( 'object' );
				expect( wpV2 ).to.have.property( 'posts' );
				expect( wpV2.posts ).to.be.a( 'function' );
				expect( wpV2 ).to.have.property( 'comments' );
				expect( wpV2.comments ).to.be.a( 'function' );
			});

			it( 'passes options from the parent WP instance to the namespaced handlers', function() {
				site.auth( 'u', 'p' );
				var pages = site.namespace( 'wp/v2' ).pages();
				expect( pages._options ).to.be.an( 'object' );
				expect( pages._options ).to.have.property( 'username' );
				expect( pages._options.username ).to.equal( 'u' );
				expect( pages._options ).to.have.property( 'password' );
				expect( pages._options.password ).to.equal( 'p' );
			});

			it( 'permits the namespace to be stored in a variable without disrupting options', function() {
				site.auth( 'u', 'p' );
				var wpV2 = site.namespace( 'wp/v2' );
				var pages = wpV2.pages();
				expect( pages._options ).to.be.an( 'object' );
				expect( pages._options ).to.have.property( 'username' );
				expect( pages._options.username ).to.equal( 'u' );
				expect( pages._options ).to.have.property( 'password' );
				expect( pages._options.password ).to.equal( 'p' );
			});

			it( 'throws an error when provided no namespace', function() {
				expect(function() {
					site.namespace();
				}).to.throw();
			});

			it( 'throws an error when provided an unregistered namespace', function() {
				expect(function() {
					site.namespace( 'foo/baz' );
				}).to.throw();
			});

		});

		describe( '.bootstrap()', function() {

			beforeEach(function() {
				site.bootstrap({
					'/myplugin/v1/authors/(?P<name>[\\w-]+)': {
						namespace: 'myplugin/v1',
						methods: [ 'GET', 'POST' ],
						endpoints: [ {
							methods: [ 'GET' ],
							args: {
								name: { required: false }
							}
						} ]
					},
					'/wp/v2/customendpoint/(?P<thing>[\\w-]+)': {
						namespace: 'wp/v2',
						methods: [ 'GET', 'POST' ],
						endpoints: [ {
							methods: [ 'GET' ],
							args: {
								parent: { required: false }
							}
						} ]
					}
				});
			});

			it( 'is a function', function() {
				expect( site ).to.have.property( 'bootstrap' );
				expect( site.bootstrap ).to.be.a( 'function' );
			});

			it( 'is chainable', function() {
				expect( site.bootstrap() ).to.equal( site );
			});

			it( 'creates handlers for all provided route definitions', function() {
				expect( site.namespace( 'myplugin/v1' ) ).to.be.an( 'object' );
				expect( site.namespace( 'myplugin/v1' ) ).to.have.property( 'authors' );
				expect( site.namespace( 'myplugin/v1' ).authors ).to.be.a( 'function' );
				expect( site.namespace( 'wp/v2' ) ).to.be.an( 'object' );
				expect( site.namespace( 'wp/v2' ) ).to.have.property( 'customendpoint' );
				expect( site.namespace( 'wp/v2' ).customendpoint ).to.be.a( 'function' );
			});

			it( 'properly assigns setter methods for detected path parts', function() {
				var thingHandler = site.customendpoint();
				expect( thingHandler ).to.have.property( 'thing' );
				expect( thingHandler.thing ).to.be.a( 'function' );
				expect( thingHandler.thing( 'foobar' ).toString() ).to.equal( 'endpoint/url/wp/v2/customendpoint/foobar' );
			});

			it( 'assigns any mixins for detected GET arguments for custom namespace handlers', function() {
				var authorsHandler = site.namespace( 'myplugin/v1' ).authors();
				expect( authorsHandler ).to.have.property( 'name' );
				expect( authorsHandler ).not.to.have.ownProperty( 'name' );
				expect( authorsHandler.name ).to.be.a( 'function' );
				var customEndpoint = site.customendpoint();
				expect( customEndpoint ).to.have.property( 'parent' );
				expect( customEndpoint ).not.to.have.ownProperty( 'parent' );
				expect( customEndpoint.parent ).to.be.a( 'function' );
			});

			it( 'assigns handlers for wp/v2 routes to the instance object itself', function() {
				expect( site ).to.have.property( 'customendpoint' );
				expect( site.customendpoint ).to.be.a( 'function' );
				expect( site.namespace( 'wp/v2' ).customendpoint ).to.equal( site.customendpoint );
			});

		});

		describe( '.transport()', function() {

			it( 'is defined', function() {
				expect( site ).to.have.property( 'transport' );
			});

			it( 'is a function', function() {
				expect( site.transport ).to.be.a( 'function' );
			});

			it( 'is chainable', function() {
				expect( site.transport() ).to.equal( site );
			});

			it( 'sets transport methods on the instance', function() {
				sinon.stub( httpTransport, 'get' );
				var customGet = sinon.stub();
				site.transport({
					get: customGet
				});
				function cb() {}
				var query = site.root( '' );
				query.get( cb );
				expect( httpTransport.get ).not.to.have.been.called;
				expect( customGet ).to.have.been.calledWith( query, cb );
				httpTransport.get.restore();
			});

			it( 'does not impact or overwrite unspecified transport methods', function() {
				var originalMethods = Object.assign( {}, site._options.transport );
				site.transport({
					get: function() {},
					put: function() {}
				});
				var newMethods = Object.assign( {}, site._options.transport );
				expect( newMethods.delete ).to.equal( originalMethods.delete );
				expect( newMethods.post ).to.equal( originalMethods.post );

				expect( newMethods.get ).not.to.equal( originalMethods.get );
				expect( newMethods.put ).not.to.equal( originalMethods.put );
			});

		});

		describe( '.url()', function() {

			it( 'is defined', function() {
				expect( site ).to.have.property( 'url' );
				expect( site.url ).to.be.a( 'function' );
			});

			it( 'creates a basic WPRequest object bound to the provided URL', function() {
				var request = site.url( 'http://some.arbitrary.url' );
				expect( request instanceof WPRequest ).to.be.true;
				expect( request._options.endpoint ).to.equal( 'http://some.arbitrary.url' );
			});

			it( 'maps requests directly onto the provided URL', function() {
				var request = site.url( 'http://some.url.com/wp-json?filter[name]=some-slug' );
				var path = request.toString();
				expect( path ).to.equal( 'http://some.url.com/wp-json?filter[name]=some-slug' );
			});

			it( 'inherits whitelisted non-endpoint options from the parent WP instance', function() {
				var wp = new WP({
					endpoint: 'http://website.com/',
					identifier: 'some unique value'
				});
				var request = wp.url( 'http://new-endpoint.com/' );
				expect( request._options ).to.have.property( 'endpoint' );
				expect( request._options.endpoint ).to.equal( 'http://new-endpoint.com/' );
				expect( request._options ).not.to.have.property( 'identifier' );
			});

		});

		describe( '.root()', function() {

			beforeEach(function() {
				site = new WP({ endpoint: 'http://my.site.com/wp-json' });
			});

			it( 'is defined', function() {
				expect( site ).to.have.property( 'root' );
				expect( site.root ).to.be.a( 'function' );
			});

			it( 'creates a get request against the root endpoint', function() {
				var request = site.root();
				expect( request.toString() ).to.equal( 'http://my.site.com/wp-json/' );
			});

			it( 'takes a "path" argument to query a root-relative path', function() {
				var request = site.root( 'custom/endpoint' );
				expect( request.toString() ).to.equal( 'http://my.site.com/wp-json/custom/endpoint' );
			});

			it( 'creates a WPRequest object', function() {
				var pathRequest = site.root( 'some/collection/endpoint' );
				expect( pathRequest instanceof WPRequest ).to.be.true;
			});

			it( 'inherits options from the parent WP instance', function() {
				var wp = new WP({
					endpoint: 'http://cat.website.com/'
				});
				var request = wp.root( 'custom-path' );
				expect( request._options ).to.have.property( 'endpoint' );
				expect( request._options.endpoint ).to.equal( 'http://cat.website.com/' );
			});

		});

		describe( '.auth()', function() {

			beforeEach(function() {
				site = new WP({ endpoint: 'http://my.site.com/wp-json' });
			});

			it( 'is defined', function() {
				expect( site ).to.have.property( 'auth' );
				expect( site.auth ).to.be.a( 'function' );
			});

			it( 'sets the "auth" option to "true"', function() {
				expect( site._options ).not.to.have.property( 'auth' );
				site.auth();
				expect( site._options ).to.have.property( 'auth' );
				expect( site._options.auth ).to.be.true;
			});

			it( 'sets the username and password when provided as strings', function() {
				site.auth( 'user1', 'pass1' );
				expect( site._options ).to.have.property( 'username' );
				expect( site._options ).to.have.property( 'password' );
				expect( site._options.username ).to.equal( 'user1' );
				expect( site._options.password ).to.equal( 'pass1' );
				expect( site._options ).to.have.property( 'auth' );
				expect( site._options.auth ).to.be.true;
			});

			it( 'sets the username and password when provided in an object', function() {
				site.auth({
					username: 'user1',
					password: 'pass1'
				});
				expect( site._options ).to.have.property( 'username' );
				expect( site._options ).to.have.property( 'password' );
				expect( site._options.username ).to.equal( 'user1' );
				expect( site._options.password ).to.equal( 'pass1' );
				expect( site._options ).to.have.property( 'auth' );
				expect( site._options.auth ).to.be.true;
			});

			it( 'can update previously-set usernames and passwords', function() {
				site.auth({
					username: 'user1',
					password: 'pass1'
				}).auth({
					username: 'admin',
					password: 'sandwich'
				});
				expect( site._options ).to.have.property( 'username' );
				expect( site._options ).to.have.property( 'password' );
				expect( site._options.username ).to.equal( 'admin' );
				expect( site._options.password ).to.equal( 'sandwich' );
				expect( site._options ).to.have.property( 'auth' );
				expect( site._options.auth ).to.be.true;
			});

			it( 'sets the nonce when provided in an object', function() {
				site.auth({
					nonce: 'somenonce'
				});
				expect( site._options ).to.have.property( 'nonce' );
				expect( site._options.nonce ).to.equal( 'somenonce' );
				expect( site._options ).to.have.property( 'auth' );
				expect( site._options.auth ).to.be.true;
			});

			it( 'can update nonce credentials', function() {
				site.auth({
					nonce: 'somenonce'
				}).auth({
					nonce: 'refreshednonce'
				});
				expect( site._options ).to.have.property( 'nonce' );
				expect( site._options.nonce ).to.equal( 'refreshednonce' );
				expect( site._options ).to.have.property( 'auth' );
				expect( site._options.auth ).to.be.true;
			});

			it( 'passes authentication status to all subsequently-instantiated handlers', function() {
				site.auth({
					username: 'user',
					password: 'pass'
				});
				var req = site.root( '' );
				expect( req ).to.have.property( '_options' );
				expect( req._options ).to.be.an( 'object' );
				expect( req._options ).to.have.property( 'username' );
				expect( req._options.username ).to.equal( 'user' );
				expect( req._options ).to.have.property( 'password' );
				expect( req._options.password ).to.equal( 'pass' );
				expect( req._options ).to.have.property( 'password' );
				expect( req._options.auth ).to.equal( true );
			});

		});

		describe( '.registerRoute()', function() {

			it( 'is a function', function() {
				expect( site ).to.have.property( 'registerRoute' );
				expect( site.registerRoute ).to.be.a( 'function' );
			});

		});

	});

	describe( 'instance has endpoint accessors', function() {

		it( 'for the media endpoint', function() {
			expect( site ).to.have.property( 'media' );
			expect( site.media ).to.be.a( 'function' );
		});

		it( 'for the pages endpoint', function() {
			expect( site ).to.have.property( 'pages' );
			expect( site.pages ).to.be.a( 'function' );
		});

		it( 'for the posts endpoint', function() {
			expect( site ).to.have.property( 'posts' );
			expect( site.posts ).to.be.a( 'function' );
		});

		it( 'for the taxonomies endpoint', function() {
			expect( site ).to.have.property( 'taxonomies' );
			expect( site.taxonomies ).to.be.a( 'function' );
		});

		it( 'for the categories endpoint', function() {
			expect( site ).to.have.property( 'categories' );
			expect( site.categories ).to.be.a( 'function' );
		});

		it( 'for the tags endpoint', function() {
			expect( site ).to.have.property( 'tags' );
			expect( site.tags ).to.be.a( 'function' );
		});

		it( 'for the types endpoint', function() {
			expect( site ).to.have.property( 'types' );
			expect( site.types ).to.be.a( 'function' );
		});

		it( 'for the users endpoint', function() {
			expect( site ).to.have.property( 'users' );
			expect( site.users ).to.be.a( 'function' );
		});

	});

});
