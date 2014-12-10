var _ = require('underscore')
var http = require('http')
var url = require('url')
var querystring = require('querystring')
var geoip = require('geoip-lite')
var argv = require('optimist').argv

var host = argv.h || argv.host || '127.0.0.1'
var port = argv.p || argv.port || 5121
var badwordsFile = argv.f || argv.file || './badwords.txt'

/*
req: words=xxxxx&cmd=check|purifiy
res: JSON.stringify({
        'found':  true|false
        'words': 'purified words if cmd = replace'
    })
*/
http.createServer(function (req, res) {
    var query = querystring.parse(url.parse(req.url).query)
    var cmd = query.cmd || 'purifiy'
    var ips = query.ip || []
    if (_.isString(ips)) {
        ips = [query.ip]
    }

    var i, j, geo, ip, searchName, info, result={}
    for (i in ips) {
        info = {}
        ip = ips[i]
        geo = geoip.lookup(ip) || defaultGeoData
        for (j in search) {
            searchName = search[j]
            info[searchName] = geo[searchName]
        }
        result[ip] = info
    }

    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(JSON.stringify(result))
}).listen(port, host)

console.log('ip lookup server listen on %s:%s', host, port)