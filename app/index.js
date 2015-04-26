'use strict';

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

// prepare config object for creating paths
var config = {};

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: false
    });
    this.coffee = this.options.coffee;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.log(chalk.magenta(
        'Out of the box I include HTML5 Boilerplate, jQuery, and a ' +
        'Gruntfile.js to build your app.'
      ));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Foundation',
        value: 'includeFoundation',
        checked: true
    },{
      name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: false
    },{
        name: 'Jade',
      value: 'includeJade',
      checked: true
    },{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      },{
        name: 'CoffeeScript',
        value: 'includeCoffeeScript',
        checked: true
      },{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      when: function (answers) {
        return answers && answers.features &&
          answers.features.indexOf('includeSass') !== -1;
      },
      type: 'confirm',
      name: 'libsass',
      value: 'includeLibSass',
      message: 'Would you like to use libsass? Read up more at \n' +
        chalk.green('https://github.com/andrew/node-sass#node-sass'),
      default: false
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeJade = hasFeature('includeJade');
      this.includeSass = hasFeature('includeSass');
      this.includeCoffeeScript = hasFeature('includeCoffeeScript');
      this.includeFoundation = hasFeature('includeFoundation');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');

      this.includeLibSass = answers.libsass;
      this.includeRubySass = !answers.libsass;

      if (this.includeFoundation && this.includeBootstrap) {
        this.log('Bootstrap and Foundation conflict, Bootstrap disabled.');
        this.includeBootstrap = false;
      }

      done();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if (this.includeFoundation) {
      var f = 'foundation';
      bower.dependencies[f] = "~5.4.5";
    } else if (this.includeBootstrap) {
      var bs = 'bootstrap' + (this.includeSass ? '-sass-official' : '');
      bower.dependencies[bs] = '~3.2.0';
    } else {
      bower.dependencies.jquery = '~1.11.1';
    }

    if (this.includeModernizr) {
      bower.dependencies.modernizr = '~2.8.2';
    }

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  config: function() {

      // check for existence of config file for generator
    this.configFile = this.options.config;

    // set to false by default
    this.useAssets = false;
    this.useComponents = false;

    // attempt to load config if flag was set
    if (this.configFile) {
      try {
        config = require(this.configFile);
        if (config.assets.length) {
          this.useAssets = true;
        }
      } catch (e) {
        console.log('config file import failed: ' + e);
      }
    }

    // set flag for assets folder, used to determine the relative path in places
    if (config.assets !== undefined) {
      this.useAssets = (config.assets.length) ? true : false;
    }
    if (config.components !== undefined) {
      this.useComponents = (config.components.length) ? true : false;
    }

    // set empty if null, keeps it from breaking
    config              = config            || {'':''};

    // set directory names (with reasonable defaults)
    config.app        = config.app        || 'app';
    config.dist       = config.dist       || 'dist';
    config.tmp        = config.tmp        || '.tmp';
    config.test       = config.test       || 'test';
    config.components = config.components || 'bower_components';
    config.assets     = config.assets     || '';
    config.styles     = config.styles     || 'styles';
    config.scripts    = config.scripts    || 'scripts';
    config.fonts      = config.fonts      || 'fonts';
    config.images     = config.images     || 'images';
    config.vendor     = config.vendor     || 'vendor';

    this.fonts         = config.fonts;

    // base paths
    config.styles        = join(config.assets,  config.styles);
    config.fonts         = join(config.assets,  config.fonts);
    config.images        = join(config.assets,  config.images);
    config.scripts       = join(config.assets,  config.scripts);
    config.scriptsVendor = join(config.scripts, config.vendor);

    // gruntfile paths
    config.appStyles         = join(config.app, config.styles);
    config.appScripts        = join(config.app, config.scripts);
    config.appScriptsVendor  = join(config.app, config.scriptsVendor);
    config.appImages         = join(config.app, config.images);
    config.distStyles        = join(config.dist, config.styles);
    config.distFonts         = join(config.dist, config.fonts);
    config.distImages        = join(config.dist, config.images);
    config.distScripts       = join(config.dist, config.scripts);
    config.distScriptsVendor = join(config.dist, config.scriptsVendor);
    config.tmpStyles         = join(config.tmp, config.styles);
    config.tmpScripts        = join(config.tmp, config.scripts);

    // variables for html/usermin
    this.app           = config.app;
    this.appStyles     = config.appStyles;
    this.appImages     = config.appImages;
    this.appScripts    = config.appScripts;
    this.tmp           = config.tmp;
    this.components    = config.components;
    this.styles        = config.styles;
    this.scripts       = config.scripts;
    this.scriptsVendor = config.scriptsVendor;

    // make config object global
    this.config = config;

    this.write('config.json', JSON.stringify(this.config, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = 'main.' + (this.includeSass ? 's' : '') + 'css';
    this.template(css, 'app/styles/' + css);
  },

  writeIndex: function () {
    var ext = (this.includeJade) ? 'jade' : 'html',
      indexFileName = 'index.' + ext;

    this.indexFileName = indexFileName;

    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), indexFileName)),
      this
    );

    // wire Bootstrap plugins
    if (this.includeBootstrap && !this.includeSass) {
      var bs = 'bower_components/bootstrap/js/';

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/plugins.js',
        sourceFileList: [
          bs + 'affix.js',
          bs + 'alert.js',
          bs + 'dropdown.js',
          bs + 'tooltip.js',
          bs + 'modal.js',
          bs + 'transition.js',
          bs + 'button.js',
          bs + 'popover.js',
          bs + 'carousel.js',
          bs + 'scrollspy.js',
          bs + 'collapse.js',
          bs + 'tab.js'
        ],
        searchPath: '.'
      });
    }

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/main.js',
      sourceFileList: ['scripts/main.js'],
      searchPath: ['app', '.tmp']
    });
  },

  app: function () {
    this.directory('app');
    this.mkdir('app/scripts');
    this.mkdir('app/styles');
    this.mkdir('app/images');
    this.write('app/' + this.indexFileName, this.indexFile);

    if (this.coffee) {
      this.copy('main.coffee', 'app/scripts/main.coffee');
    } else {
      this.copy('main.js', 'app/scripts/main.js');
    }
  },

  install: function () {
    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  }
});
