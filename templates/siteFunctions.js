/*globals Buffer*/

// Node modules
var through = require('through2'),
  jade = require('jade');

// Custom variables
var site = require('./site');

/**
 * Take a file stream and render the jade data to html
 */
var applyTemplate = function () {

  return through.obj(function (file, enc, cb) {

    var data = {
      site: site,
      page: file.page,
      content: file.contents.toString()
    },
    template = 'src/_templates/' + file.page.template + '.jade';

    file.contents = new Buffer(jade.renderFile(template, data), 'utf8');

    this.push(file);
    cb();
  });

};

/**
 * Collects the posts, sorts them and adds them to the site variable
 */
var collectPosts = function () {

  // store the changes localy
  var posts = [],
    tags = [];

  return through.obj(function (file, enc, cb) {

    // collect the posts
    posts.push(file.page);
    posts[posts.length - 1].content = file.contents.toString();

    // store any tags within the pages
    if (file.page.tags) {
      file.page.tags.forEach(function (tag) {
        if (tags.indexOf(tag) === -1) {
          tags.push(tag);
        }
      });
    }

    this.push(file);
    cb();
  }, function (cb) {

    // sort the posts (newest at the top)
    posts.sort(function (a, b) {
      return b.date - a.date;
    });
    
    // saves the data to the global site variable
    site.posts = posts;
    site.tags = tags;
    cb();
  });
};

/**
 * Get the links from each file so that we can make a menu
 */
var collectPages = function () {

  var pages = [];

  return through.obj(function (file, enc, cb) {

    pages.push({
      title: file.page.title,
      link: file.page.link
    });

    cb();

  }, function (cb) {

    site.pages = pages;
    cb();

  });
};

module.exports = {
  applyTemplate: applyTemplate,
  collectPosts: collectPosts,
  collectPages: collectPages
};
