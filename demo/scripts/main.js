function toggleBackground(weather) {
    if (weather == 'yin' || weather == 'yun' || weather == 'mai')
        $('#base-body').css({
            'background-image': 'url(\'/images/dull-day.png\')'
        })
    else if (weather == 'yu')
        $('#base-body').css({
            'background-image': 'url(\'/images/rainy-day.png\')'
        })
    else if (weather == 'xue')
        $('#base-body').css({
            'background-image': 'url(\'/images/snowy-day.png\')'
        })
    else
        $('#base-body').css({
            'background-image': 'url(\'/images/sunny-day.png\')'
        })
}

// insert weather pictures
function insertPicture(weather) {
    var res = '<img class=\'current-picture\' src=\'';
    if (weather == 'qing') {
        res += '/images/sun.png'
    } if (weather == 'yu') {
        res += '/images/rain.png'
    } else if (weather == 'yun') {
        res += '/images/cloudy.png'
    } else if (weather == 'yin') {
        res += '/images/dull.png'
    } else if (weather == 'mai') {
        res += '/images/smog.png'
    } else if (weather == 'xue') {
        res += '/images/snow.png'
    } else if (weather == 'lei' ) {
        res += '/images/thunder.png';
    }
    return res + '\'>';
}

// Call the positioning API
function initPosition() {
    var url = 'https://restapi.amap.com/v3/ip';
    var key = '91613592bb6a1533e1df9caa40d23034';
    $.ajax({
        type: 'GET',
        url: url,
        data: 'key=' + key,
        dataType: 'json',
        success: function(json) {
            var res = json.city.substring(0, json.city.length - 1);
            $('#whereami').append(res);
        }
    });
}

function getDate(json, i) {
    var mon = json.data[i].date.substring(5, 7);
    var day = json.data[i].date.substring(8, 10);
    if (mon[0] == '0') mon = mon[1];
    if (day[0] == '0') day = day[1];
    return mon + '月' + day + '日';
}

// render the data of the next 6 days
function renderDaysToCome(json) {
    for (let i = 1; i < 7; ++i) {
        var mon = json.data[i].date.substring(5, 7);
        var day = json.data[i].date.substring(8, 10);
        if (mon[0] == '0') mon = mon[1];
        if (day[0] == '0') day = day[1];
        $('.session-' + i).html(
            getDate(json, i) + '</br>' +
            json.data[i].wea + '</br>' +
            json.data[i].tem2 + ' - ' + json.data[i].tem1 + '</br>' +
            insertPicture(json.data[i].wea_img)
        );
    }
}


// Call the weather API
function sendAjaxRequest() {
    var location = !$('#input-box').val() ? '' : $('#input-box').val();
    var url = 'https://www.tianqiapi.com/api/';
    var data = 'version=v1&appid=48143181&appsecret=p7KFTLtO&city=' + location;
    $.ajax({
        type: 'GET',
        url: url,
        data: data,
        dataType: 'json',
        success: function(json) {
            console.log(json);
            toggleBackground(json.data[0].wea_img);
            renderDaysToCome(json);
            initLineChart(json);
            $('#main-page-picture').html(insertPicture(json.data[0].wea_img));
            $('#city').text(json.city).attr('class', 'color: aliceblue');
            $('#weather').text(json.data[0].wea).attr('class', 'color: aliceblue');
            $('#temperature').text(json.data[0].tem2 + ' - ' + json.data[0].tem1).attr('class', 'color: aliceblue');
            $('#air').text(json.data[0].air).attr('class', 'color: aliceblue');
            $('#humidity').text(json.data[0].humidity).attr('class', 'color: aliceblue');
            $('#date').text(json.data[0].date).attr('class', 'color: aliceblue');
            $('#weekday').text(json.data[0].week).attr('class', 'color: aliceblue');
            $('#last-update').text(json.update_time).attr('class', 'color: aliceblue');
        },
        error: function() {
            alert('网络出了点小问题呐~');
        }
    });
}

function initLineChart(json) {
    $('#chart-box').css({
        'width': $(document).width() * 0.75,
        'height': $(document).height() * 0.55
    });
    var temperatureLine = echarts.init($('#chart-box').get(0));
    var Dates = new Array();
    var Temperature = new Array();
    for(let i = 0; i < 7; ++i) {
        Dates[i] = getDate(json, i);
        Temperature[i] = json.data[i].tem.substring(0, json.data[i].tem.length - 1);
    }
    var option = {
        title: {
            text: '七日气温变化趋势'
        },
        toolbox: {
            show: true,
            feature: {
                saveAsImage: {
                    show: true
                }
            }
        },
        legend: {
            data: ['日期']
        },
        xAxis: {
            data: Dates
        },
        yAxis: {},
        series: [{
            name: '气温',
            type: 'line',
            data: Temperature
        }],
        // grid:{
            // width: 300,
            // x: 50,
            // y: 50,
            // x2: 50,
            // y2: 60,
            // borderWidth: 10
        // }
    };
    temperatureLine.setOption(option);
}

$(document).ready(function() {
    initPosition();
    sendAjaxRequest();

    $('#submit-btn').click(function() {
        sendAjaxRequest();
    });

    $('#input-box').keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13')
            sendAjaxRequest();
    });

    $('.toggle-bar').click(function() {
        if (!$(this).hasClass('toggle-selected')) {
            if ($(this).index() == $('#btn-weather').index()) {
                $('#weather-today').siblings().hide();
                $('#weather-today').fadeIn('slow');
            } else if ($(this).index() == $('#btn-chart').index()) {
                $('#chart').siblings().hide();
                $('#chart').fadeIn('slow');
            } else {
                $('#days-to-come').siblings().hide();
                $('#days-to-come').fadeIn('slow');
            }
        }
        $(this).addClass('toggle-selected');
        $(this).siblings().removeClass('toggle-selected');
    });
});