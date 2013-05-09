var extend = hexo.extend,
    util = hexo.util,
    fs = require('fs'),
    async = require('async');

extend.migrator.register('octopress', function(args){
  var source = args._.shift(),
      target = hexo.source_dir + '_posts/';

  if (!source){
    console.log('\nUsage: hexo migrate octopress <source>\n\nMore info: http://zespia.tw/hexo/docs/migrate.html\n');
  } else {
    async.waterfall([
      function(next) {
        postDir = source + '/source/_posts/';
        console.log('Migrating posts from %s.', postDir);
        fs.exists(postDir, function(exist) {
          if (exist) {
            fs.readdir(postDir, function(err, files){
              if (err) throw err;
              var result = [];
              async.forEach(files, function(item, _next){
                result.push(item);
                _next();
              }, function(){
                next(null, result);
              });
            });
          } else {
            console.log('The source directory does not exist!');
            process.exit();
          }
        });
      },
      function(posts, next) {
        async.forEach(posts, function(item, _next){
          var matches = [],
              newItem = item;
          if ((matches = item.match(/^\d{4}\-\d{2}\-\d{2}\-(.*)?.markdown$/)) !== null) {
            newItem = matches[1] + '.md';
          }
          fs.createReadStream(source + '/source/_posts/' + item).addListener("data", function(chunk) {
            fs.createWriteStream(target + newItem).end(chunk.toString().replace('categories:', 'tags:'));
          });
        }, function() {
          next();
        });
        next();
      }
    ],function(err, result){
      if (err) throw err;
      console.log('Migrate finish');
    });
  }
});