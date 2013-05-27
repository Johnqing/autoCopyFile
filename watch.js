/**
 * 文件变化实时监控
 * User: liuqing
 * Date: 13-5-27
 * Time: 下午2:40
 */
var fs = require('fs'),
    path = require('path'),
    util = require("util"),
    walk = require('walk');

var mkdirs = module.exports.mkdirs = function(dirpath, mode, callback) {
    fs.mkdir(dirpath, mode, callback);
};
//copy a file
function baseCopyFile(src, dst, timeJson){
    var is = fs.createReadStream(src);
    var os = fs.createWriteStream(dst);
    is.pipe(os, function(err){
        if(err){
           console.log(err);
        }
    });
    fs.utimes(dst, timeJson.atime, timeJson.mtime, function(e){
        console.log(e);
    });
}

var copyFile = function(filename, basepath, copypath, timeJson) {
    var name = filename.split(basepath)[1];
    console.log('fs:'+name);
    baseCopyFile(filename, copypath + name, timeJson);
};
/**
 * 基础路径获取
 * @type {*}
 */
fs.readFile('package.json', function(err, data){
    if(err) throw err;
    var package = JSON.parse(data),
        basepath = package.basePath,
        isAutoCopy = package.isAutoCopy,
        copyPath = package.copyPath;

    //手动挡
    var notAutoCopy = function(root, fileStats){
        var fsName = fileStats.name;
        var fsPath = root.split(basepath)[1];
        fs.stat(copyPath + fsPath + '/' + fsName, function(err, stat){
           if(err){
               mkdirs(copyPath + fsPath, 0, function(e){
                  console.log(e);
               });
           }
          if(err || (fileStats.atime - stat.atime)/1000 > 60){
              copyFile(root + '/' + fsName, basepath, copyPath,{
                  'atime': fileStats.atime,
                  'mtime': fileStats.mtime
              });
          }
        });
    };
    //自动挡
    var autoCopy = function(root, fileStats){
        var filename = root + '/' + fileStats.name;
        fs.watch(filename,function(event, name){
            if(event === 'change') {
                copyFile(filename, basepath, copyPath);
            }
        });
    }
    // walk配置
    var walker  = walk.walk(basepath, { followLinks: false });
    walker.on('file', function(root, fileStats, next) {
        if(!isAutoCopy){
           notAutoCopy(root, fileStats);
        }else{
           autoCopy(root, fileStats);
        }
        next();
    });
});
