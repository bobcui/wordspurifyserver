var http = require('http')
var fs = require('fs')
var url = require('url')
var querystring = require('querystring')
var lineReader = require('line-reader')
var argv = require('optimist').argv
var WordsPurifier = require('./wordsPurifier')

var host = argv.h || argv.host || '127.0.0.1'
var port = argv.p || argv.port || 5121
var badwordsFile = argv.f || argv.file || './badwords.txt'

var wordsPurifier = new WordsPurifier()

var loadBadWords = function(cb) {
    var words = []
    lineReader.eachLine(badwordsFile, function(line, last) {
        var word = line.trim()
        if (!!word) {
            words.push(word)
        }
        if (last) {
            wordsPurifier.init(words)
            if (!!cb) {
                cb()
            }
        }
    });
}

var mtime = fs.statSync(badwordsFile).mtime.getTime()

loadBadWords(function(){
    startServer()
    setInterval(checkBadWordsFile, 1000)
})

var checkBadWordsFile = function() {
    fs.stat(badwordsFile, function(err, stats){
        if (!!err) {
            console.error('stat file %s fail err=%j', badwordsFile, err)
        }
        else {
            var nowMTime = stats.mtime.getTime()
            if (nowMTime !== mtime) {
                mtime = nowMTime
                loadBadWords()
            }
        }
    })
}

/*
req: words=xxxxx&cmd=find|purifiy
res: JSON.stringify({
        'found':  true|false when cmd=find
        'words': 'purified words if cmd = purifiy'
    })
*/
var startServer = function() {
    http.createServer(function (req, res) {
        var query = querystring.parse(url.parse(req.url).query)
        var cmd = query.cmd || 'purifiy'
        var words = query.words || ''

        var result
        if (cmd === 'purify') {
            result = {
                'words': wordsPurifier.purify(words)
            }
        }
        else if (cmd === 'find') {
            result = {
                'found': wordsPurifier.find(words)
            }
        }
        else {
            res.statusCode = 400;
            res.end()
            return        
        }

        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.end(JSON.stringify(result))
    }).listen(port, host)
    console.info('words purify server listen on %s:%s', host, port)
}