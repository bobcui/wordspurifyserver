var WordsPurifier = function(opts) {
    opts = opts || {}
    this.placeholder = opts.placeholder || '*'
    this.replaceMethod = opts.replaceMethod || allPurifier || prefixPurifier
}

module.exports = WordsPurifier

/*
hashTable = {
    'f': {
        'u': {
            'c': {
                'k': {
                    'word': 'fuck'
                    'placeholder': 'f**k'
                    'y': {
                        'o': {
                            'u': {
                                'word': 'fuckyou'
                                'placeholder': 'f*****u'
                            }
                        }
                    }
                }
            }
        }
    }
}
*/
WordsPurifier.prototype.init = function(words) {
    var wordsHashTable = {}
    var replaceMethod = this.replaceMethod.bind(null, this.placeholder)
    for (var i in words) {
        if (!!words[i]) {
            parseWord(words[i], replaceMethod, wordsHashTable)
        }
    }
    this.wordsHashTable = wordsHashTable
}

WordsPurifier.prototype.check = function(words) {
    return find(words, this.wordsHashTable, function(){
        return false
    })
}

WordsPurifier.prototype.purify = function(words) {
    var purified = [], charAt = 0
    var found = find(words, this.wordsHashTable, function(index, word, placeholder){
        purified.push(words.substring(charAt, index))
        if (charAt < index) {
            charAt = index
        }        
        purified.push(placeholder)
        charAt += word.length
        return true
    })

    if (!found) {
        return words
    }
    else {
        purified.push(words.substring(charAt))
        return purified.join('')
    }
}

var find = function(words, hashTable, foundFunc) {
    var length = words.length
    var found = false

    for (var i=0; i<length; ) {
        var word = null, placeholder = null, entry = hashTable

        for (var j=0; ; ++j) {
            entry = entry[words.charAt(i+j)]
            if (!!entry) {
                if (!!entry.word) {
                    word = entry.word
                    placeholder = entry.placeholder
                }
            }
            else {
                break
            }
        }

        if (!!word) {
            found = true
            if (!foundFunc(i, word, placeholder)) {
                break
            }
            i += word.length
        }
        else {
            ++i
        }
    }

    return found
}

var parseWord = function(word, replaceMethod, hashTable) {
    var length = word.length, character

    for (var i=0; i<length; ++i) {
        character = word.charAt(i)

        if (!hashTable[character]) {
            hashTable[character] = {}
        }

        hashTable = hashTable[character]
    }

    hashTable.word = word
    hashTable.placeholder = replaceMethod(word)
}

var allPurifier = function(placeholder, word) {
    var purified = []
    for (var i=0; i<word.length; ++i) {
        purified.push(placeholder)
    }
    return purified.join('')    
}

var prefixPurifier = function(placeholder, word) {
    var purified = []
    var first, last
    if (word.length <= 3) {
        first = last = placeholder
    }
    else {
        first = word.charAt(0)
        last = word.charAt(word.length-1)
    }

    purified.push(first)
    for (var i=1; i<word.length-1; ++i) {
        purified.push(placeholder)
    }
    purified.push(last)
    return purified.join('')
}
