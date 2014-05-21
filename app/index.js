'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var AppGenerator = module.exports = function Appgenerator(args, options) {

  // prepare config object for creating paths
  var config = {};

  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  options['test-framework'] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', {
    as: 'app',
    options: {
      options: {
        'skip-message': options['skip-install-message'],
        'skip-install': options['skip-install']
      }
    }
  });

  // check for existence of config file for generator
  this.configFile = options.config;

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
  config.styles        = path.join(config.assets,  config.styles);
  config.fonts         = path.join(config.assets,  config.fonts);
  config.images        = path.join(config.assets,  config.images);
  config.scripts       = path.join(config.assets,  config.scripts);
  config.scriptsVendor = path.join(config.scripts, config.vendor);

  // gruntfile paths
  config.appStyles         = path.join(config.app, config.styles);
  config.appScripts        = path.join(config.app, config.scripts);
  config.appScriptsVendor  = path.join(config.app, config.scriptsVendor);
  config.appImages         = path.join(config.app, config.images);
  config.distStyles        = path.join(config.dist, config.styles);
  config.distFonts         = path.join(config.dist, config.fonts);
  config.distImages        = path.join(config.dist, config.images);
  config.distScripts       = path.join(config.dist, config.scripts);
  config.distScriptsVendor = path.join(config.dist, config.scriptsVendor);
  config.tmpStyles         = path.join(config.tmp, config.styles);
  config.tmpScripts        = path.join(config.tmp, config.scripts);

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

  this.options = options;

  this.pkg = require('../package.json');
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  if (!this.options['skip-welcome-message']) {
    this.log(yosay());
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
      name: 'Sass',
      value: 'includeSass',
      checked: true
    },{
      name: 'Slim',
      value: 'includeSlim',
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
      return answers.features.indexOf('includeSass') !== -1;
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
      return features.indexOf(feat) !== -1;
    }

	this.includeSlim = hasFeature('includeSlim');
    this.includeSass = hasFeature('includeSass');
    this.includeFoundation = hasFeature('includeFoundation');
    this.includeBootstrap = hasFeature('includeBootstrap');
    this.includeCoffeeScript = hasFeature('includeCoffeeScript');
    this.includeModernizr = hasFeature('includeModernizr');

    this.includeLibSass = answers.libsass;
    this.includeRubySass = !answers.libsass;

    if (this.includeFoundation && this.includeBootstrap) {
      this.log('Bootstrap and Foundation conflict, Bootstrap disabled.');
      this.includeBootstrap = false;
    }

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.template('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.template('_bower.json', 'bower.json');
  if (this.useComponents) {
    this.write('.bowerrc', '{"directory":"./' + this.components + '/"}');
  }
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', this.app + '/favicon.ico');
  this.copy('404.html',    this.app + '/404.html');
  this.copy('robots.txt',  this.app + '/robots.txt');
  this.copy('htaccess',    this.app + '/.htaccess');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  var css = 'main.' + (this.includeSass ? 's' : '') + 'css';
  this.copy(css, this.appStyles + '/' + css);
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  var ext = (this.includeSlim) ? 'slim' : 'html',
    indexFileName = 'index.' + ext;

  this.indexFile = this.readFileAsString(
    path.join(this.sourceRoot(), indexFileName)
  );
  this.indexFile = this.engine(this.indexFile, this);

  this.write('app/' + indexFileName, this.indexFile);
};

AppGenerator.prototype.app = function app() {
  this.mkdir(this.app);
  this.mkdir(this.appScripts);
  this.mkdir(this.appStyles);
  this.mkdir(this.appImages);

  this.template('_main.js', this.appScripts + '/main.' + ((this.includeCoffeeScript) ? "coffee" : "js"));
};

// create config.json for customization
AppGenerator.prototype.config = function config() {
  this.write('config.json', JSON.stringify(this.config));
};

AppGenerator.prototype.install = function () {
  if (this.options['skip-install']) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install'],
    callback: done
  });
};
