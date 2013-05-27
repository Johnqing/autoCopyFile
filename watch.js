/**
 * 文件变化实时监控
 * User: liuqing
 * Date: 13-5-27
 * Time: 下午2:40
 */
var fs = require('fs'),
    util = require("util"),
    walk = require('walk');


//copy a file
function baseCopyFile(src, dst){
    var is = fs.createReadStream(src);
    var os = fs.createWriteStream(dst);
    is.pipe(os, function(err){
        if(err){
           console.log(err);
        }
    });
}

var copyFile = function(filename, basepath, copypath) {
    var name = filename.split(basepath)[1];
    console.log(name);
    baseCopyFile(filename, copypath + name);
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
    // walk配置
    var walker  = walk.walk(basepath, { followLinks: false });

    walker.on('file', function(root, fileStats, next) {
        (function(filename){

            fs.watch(filename,function(event, name){
                if(event === 'change') {
                    copyFile(filename, basepath, copyPath);
                }
                console.log(isAutoCopy);
                if(isAutoCopy){
                    fs.unwatch(filename);
                }
            });
        })(root + '/' + fileStats.name);

        next();
    });
});
