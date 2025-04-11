const _ = require('lodash');

const getLastParagraphIndex = (startingIndex, paragraph) => {
    let text = paragraph.toString().toLowerCase();
    let textLength = text.length;
    let counter = startingIndex;
    for (let x = startingIndex; x <= textLength; x++) {
        counter = x;
        if (text[x] === '.' || text[x] === '!' || text[x] === '?') {
            break;
        }
    }
    return counter + 1;
}

const getFirstParagraphIndex = (startingIndex, paragraph) => {
    let text = paragraph.toString().toLowerCase();
    let counter = startingIndex;
    let firstSentence = true;
    for (let x = startingIndex; x >= 0; x--) {
        counter = x;
        if (text[x] === '\n' || text[x] === '.' || text[x] === '!' || text[x] === '?') {
            firstSentence = false;
            break;
        }
    }
    return firstSentence ? counter : counter + 1;
}

const getPhrase = (paragraph, startingIndex) => {
    let firstPhraseIndex = getFirstParagraphIndex(startingIndex, paragraph);
    let lastPhraseIndex = getLastParagraphIndex(startingIndex, paragraph);
    return paragraph.toString().substring(firstPhraseIndex, lastPhraseIndex)
}

const findIndexes = (text, keyword) => {
    let count = 0, indexes = [];
    let index = text?.toString()?.toLowerCase()?.indexOf(keyword.toString()?.toLowerCase()) || -1;
    while (index !== -1) {
        count++;
        indexes.push(index)
        index = text.toString().toLowerCase().indexOf(keyword.toString().toLowerCase(), index + 1);
    }
    return { count, indexes }
}

exports.getlocationsAndPhrases = async (data, words) => {
    let results = []

    await Promise.all(Array.from(words).map(e => {
        let keyword = e;

        //title
        let title = findIndexes(data.title, keyword);
        if (title.count > 0) {
            let obj = {};
            obj.location = 'title';
            obj.keyword = keyword
            obj.phrase = data.title

            results.push(obj)
        }

        //bullets
        let bullets = findIndexes(data.bullets, keyword);
        if (bullets.count > 0) {

            for (let x in bullets.indexes) {
                let bulletIndex = bullets.indexes[x];
                let phrase = getPhrase(data.bullets, bulletIndex);

                let obj = {};
                obj.location = 'bullets';
                obj.keyword = keyword
                obj.phrase = phrase

                let findPhraseIndex = _.findIndex(results, e => e.location === 'bullets' && e.phrase.includes(phrase))
                if (findPhraseIndex > -1) {
                    results[findPhraseIndex].keyword = results[findPhraseIndex].keyword.includes(keyword) ? results[findPhraseIndex].keyword : results[findPhraseIndex].keyword + ", " + keyword;
                } else {
                    results.push(obj);
                }
            }
        }

        //desc
        let desc = findIndexes(data.description, keyword);
        if (desc.count > 0) {

            for (let x in desc.indexes) {
                let descIndex = desc.indexes[x];
                let phrase = getPhrase(data.description, descIndex);

                let obj = {};
                obj.location = 'description';
                obj.keyword = keyword
                obj.phrase = phrase

                let findPhraseIndex = _.findIndex(results, e => e.location === 'description' && e.phrase.includes(phrase))
                if (findPhraseIndex > -1) {
                    results[findPhraseIndex].keyword = results[findPhraseIndex].keyword.includes(keyword) ? results[findPhraseIndex].keyword : results[findPhraseIndex].keyword + ", " + keyword;
                } else {
                    results.push(obj);
                }
            }
        }

        //ebc Desc
        let ebcDesc = findIndexes(data.ebcDesc, keyword);
        if (ebcDesc.count > 0) {
            let obj = {};
            for (let x in ebcDesc.indexes) {
                let ebcDescIndex = ebcDesc.indexes[x];
                let phrase = getPhrase(data.ebcDesc, ebcDescIndex);

                obj.location = 'ebc';
                obj.keyword = keyword
                obj.phrase = phrase

                let findPhraseIndex = _.findIndex(results, e => e.location === 'ebc' && e.phrase.includes(phrase))
                if (findPhraseIndex > -1) {
                    results[findPhraseIndex].keyword = results[findPhraseIndex].keyword.includes(keyword) ? results[findPhraseIndex].keyword : results[findPhraseIndex] + ", " + keyword;
                } else {
                    results.push(obj);
                }
            }
        }
    }))

    return results;
}