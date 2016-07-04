module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        curly: false,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        browser: true,
        expr: true,
        globals: {
          $: false,
          require: false,
          module: false,
          process: false
        }
      },
      files: ['Gruntfile.js', '*.js', 'routes/*.js']
    },

    jscs: {
      src: ['*.js'],
      options: {
        config: "../.jscsrc",
        esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
        verbose: true, // If you need output with rule names http://jscs.info/overview.html#verbose
        fix: true // Autofix code style violations when possible.
      }
    },

    jsdoc: {
      dist: {
        src: ['*.js'],
        options: {
          destination: 'doc'
        }
      }
    },

    watch: {
      options: {
      },
      js: {
        files: ['Gruntfile.js', '*.js'],
        tasks: 'js'
      }
    }
  });

  // Load dependencies
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', ['js', 'jsdoc']);
  grunt.registerTask('js', ['jshint', 'jscs']);

};
