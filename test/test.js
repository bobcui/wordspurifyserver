var lineReader = require('line-reader')
var argv = require('optimist').argv
var WordsPurifier = require('../wordsPurifier')

var badwordsFile = argv.f || argv.file || '../badwords.txt'
var word = argv.w || argv.word || '习仲勋画传曝光习近平童年时代照片(图)'
var times = argv.t || argv.times || 1

var wordsPurifier = new WordsPurifier()

var words = []
lineReader.eachLine(badwordsFile, function(line, last) {
    var word = line.trim()
    if (!!word) {
        words.push(word)
    }
    if (last) {
        onFinishLoad()
    }
});

function onFinishLoad() {
    wordsPurifier.init(words)
    for (var i=0; i<times; ++i) {
        var w = wordsPurifier.purify(word)
    }
    console.log(w)
}