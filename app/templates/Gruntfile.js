// Generated on <%= (new Date).toISOString().split('T')[0] %> using
// <%= pkg.name %> <%= pkg.version %>
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Get configurable paths
  var config = grunt.file.readJSON('config.json', 'utf8');

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },<% if (includeCoffeeScript) { %>
      coffee: {
        files: ['<%%= config.appScripts %>/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['<%%= config.test %>/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['coffee:test', 'test:watch']
      },<% } else { %>
      js: {
        files: ['<%%= config.appScripts %>/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      jstest: {
        files: ['<%%= config.test %>/spec/{,*/}*.js'],
        tasks: ['test:watch']
      },<% } %>
      gruntfile: {
        files: ['Gruntfile.js']
      },<% if (includeSlim) { %>
      slim: {
        files: ['<%%= config.app %>/{,*/}*.slim'],
        tasks: ['slim']
      },<% } %><% if (includeSass) { %>
      sass: {
        files: ['<%%= config.appStyles %>/{,*/}*.{scss,sass}'],
        tasks: ['sass:server', 'autoprefixer']
      },<% } %>
      styles: {
        files: ['<%%= config.appStyles %>/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          '<%%= config.app %>/{,*/}*.html',
          '<%%= config.tmpStyles %>/{,*/}*.css',<% if (includeCoffeeScript) { %>
          '<%%= config.tmpScripts %>/{,*/}*.js',<% } %>
          '<%%= config.appImages %>/{,*/}*'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static(config.tmp),
              connect().use('/' + config.components, connect.static('./' + config.components)),
              connect.static(config.app)
            ];
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static(config.tmp),
              connect.static(config.test),
              connect().use('/' + config.components, connect.static('./' + config.components)),
              connect.static(config.app)
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%%= config.dist %>',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%%= config.tmp %>',
            '<%%= config.dist %>/*',
            '!<%%= config.dist %>/.git*'
          ]
        }]
      },
      server: '<%%= config.tmp %>'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%%= config.appScripts %>/{,*/}*.js',
        '!<%%= config.appScriptsVendor %>/*',
        '<%%= config.test %>/spec/{,*/}*.js'
      ]
    },<% if (testFramework === 'mocha') { %>

    // Mocha testing framework configuration options
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html']
        }
      }
    },<% } else if (testFramework === 'jasmine') { %>

    // Jasmine testing framework configuration options
    jasmine: {
      all: {
        options: {
          specs: '<%%= config.test %>/spec/{,*/}*.js'
        }
      }
    },<% } %><% if (includeCoffeeScript) { %>

    // Compiles CoffeeScript to JavaScript
    coffee: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.appScripts %>',
          src: '{,*/}*.{coffee,litcoffee,coffee.md}',
          dest: '<%%= config.tmpScripts %>',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: '<%%= config.test %>/spec',
          src: '{,*/}*.{coffee,litcoffee,coffee.md}',
          dest: '<%%= config.test %>/spec',
          ext: '.js'
        }]
      }
    },<% } %><% if (includeSass) { %>

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {<% if (includeLibSass) { %>
        sourceMap: true,
        includePaths: ['<%%= config.components %>']
        <% } else { %>
        loadPath: '<%%= config.components %>'
      <% } %>},
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.appStyles %>',
          src: ['*.{scss,sass}'],
          dest: '<%%= config.tmpStyles %>',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%%= config.appStyles %>',
          src: ['*.{scss,sass}'],
          dest: '<%%= config.tmpStyles %>',
          ext: '.css'
        }]
      }
    },<% } %>

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.tmpStyles %>',
          src: '{,*/}*.css',
          dest: '<%%= config.tmpStyles %>'
        }]
      }
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        ignorePath: /^<%= config.app %>\/|\.\.\//,
        src: ['<%%= config.app %>/index.html']<% if (includeFoundation) { %>,
        exclude: ['<%%= config.components %>/foundation/js/foundation.js']<% } %><% if (includeBootstrap) { %>,<% if (includeSass) { %>
        exclude: ['<%%= config.components %>/bootstrap-sass-official/assets/javascripts/bootstrap.js']<% } else { %>
        exclude: ['<%%= config.components %>/bootstrap/dist/js/bootstrap.js']<% } } %>
      }<% if (includeSass) { %>,
      sass: {
        src: ['<%%= config.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}<%%= config.components %>\//
      }<% } %>
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%%= config.distScripts %>/{,*/}*.js',
            '<%%= config.distStyles %>/{,*/}*.css',
            '<%%= config.distImages %>/{,*/}*.*',
            '<%%= config.distFonts %>/{,*/}*.*',
            '<%%= config.dist %>/*.{ico,png}'
          ]
        }
      }
    },<% if (includeSlim) { %>

    // Compile Slim to HTML
    slim: {
      app: {
        options: {
          pretty: true
        },
        files: [{
          expand: true,
          cwd:    '<%%= config.app %>',
          src:    '*.slim',
          dest:   '<%%= config.app %>',
          ext:    '.html'
        }]
      }
    },<% } %>

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%%= config.dist %>'
      },
      html: '<%%= config.app %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          '<%%= config.dist %>',
          '<%%= config.distImages %>',
          '<%%= config.distStyles %>'
        ]
      },
      html: ['<%%= config.dist %>/{,*/}*.html'],
      css: ['<%%= config.distStyles %>/{,*/}*.css']
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.appImages %>',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%%= config.distImages %>'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.appImages %>',
          src: '{,*/}*.svg',
          dest: '<%%= config.distImages %>'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%%= config.dist %>'
        }]
      }
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care
    // of minification. These next options are pre-configured if you do not
    // wish to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%%= config.distStyles %>/main.css': [
    //         '<%%= config.tmpStyles %>/{,*/}*.css',
    //         '<%%= config.appStyles %>/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%%= config.distScripts %>/scripts.js': [
    //         '<%%= config.distScripts %>/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%%= config.app %>',
          dest: '<%%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            '<%%= config.images %>/{,*/}*.webp',
            '{,*/}*.html',
            '<%%= config.fonts %>/{,*/}*.*'
          ]
        }, {
          src: 'node_modules/apache-server-configs/dist/.htaccess',
          dest: '<%%= config.dist %>/.htaccess'
        }<% if (includeBootstrap) { %>, {
          expand: true,
          dot: true,
          cwd: '<% if (includeSass) {
              %>bower_components/bootstrap-sass-official/assets/fonts/bootstrap<%
            } else {
              %><%%= config.components %>/bootstrap/dist/fonts<%
            } %>',
          src: '*',
          dest: '<%%= config.dist %>'
        }<% } %>]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%%= config.appStyles %>',
        dest: '<%%= config.tmpStyles %>',
        src: '{,*/}*.css'
      }
    },<% if (includeModernizr) { %>

    // Generates a custom Modernizr build that includes only the tests you
    // reference in your app
    modernizr: {
      dist: {
        devFile: '<%%= config.components %>/modernizr/modernizr.js',
        outputFile: '<%%= config.distScriptsVendor %>/modernizr.js',
        files: {
          src: [
            '<%%= config.distScripts %>/{,*/}*.js',
            '<%%= config.distStyles %>/{,*/}*.css',
            '!<%%= config.distScriptsVendor %>/*'
          ]
        },
        uglify: true
      }
    },<% } %>

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [<% if (includeSass) { %>
        'sass:server',<% } if (includeCoffeeScript) {  %>
        'coffee:dist',<% } %>
        'copy:styles'
      ],
      test: [<% if (includeCoffeeScript) { %>
        'coffee',<% } %>
        'copy:styles'
      ],
      dist: [<% if (includeCoffeeScript) { %>
        'coffee',<% } if (includeSass) { %>
        'sass',<% } %>
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    }
  });


  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',<% if (includeSlim) { %>
      'slim',<% } %>
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'concurrent:test',
        'autoprefixer'
      ]);
    }

    grunt.task.run([
      'connect:test',<% if (testFramework === 'mocha') { %>
      'mocha'<% } else if (testFramework === 'jasmine') { %>
      'jasmine'<% } %>
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',<% if (includeModernizr) { %>
    'modernizr',<% } %>
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
