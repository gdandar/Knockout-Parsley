module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({
		jshint: {
			all: [ './knockout.parsley.js' ]
		},
		uglify: {
			options: {
				mangle: false
			},
			my_target: {
				files: {
					'./knockout.parsley.min.js': ['./knockout.parsley.js']
				}
			}
		}
	});

	grunt.registerTask('default', ['jshint', 'uglify']);
};