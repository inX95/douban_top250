var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var firstPageUrl = 'https://movie.douban.com/top250';
var movies = [];

function requestAndSaveData(url) {
    superagent.get(url)
        .end(function (err, res) {
            if (err) {
                return console.error(err);
            }
            var $ = cheerio.load(res.text);
            var ep = new eventproxy();
            var items=$('.grid_view .item');

            ep.after('load completely!', items.length, function () {
                url = $('.next a').attr('href');
                if (url) {
                    url = firstPageUrl + url;
                    requestAndSaveData(url);
                }else {
                    saveData('data', movies);
                    console.log(movies);
                }
            });

            items.each(function () {
                movies.push({
                    title:$('.info .hd .title',this).text().trim(),
                    url:$('.hd a',this).attr('href'),
                    info:$('.info .bd p',this).text().trim(),
                    star:$('.info .bd .star .rating_num',this).text().trim(),
                    picUrl: $('.pic img', this).attr('src')
                });
                ep.emit('load completely!');
            });
        });
}

function saveData(path, movies) {
    fs.writeFile(path,JSON.stringify(movies,null,4),function (err) {
        if(err) {
            return console.err(err);
        }
        console.log('data saved successfully!');
    })
}

requestAndSaveData(firstPageUrl);

