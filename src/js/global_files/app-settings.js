



function getGetDataSources() {
    var _default_source_urls = [
        {
            name:"Colorado Springs, Colorado",
            url: "http://access.weatherreach.com/HistoricalTable?StationID=429&TableTimeInt=1440&Range=Last%20Year",
            is_default:true,
            color:"#f8c471"
        },
        {
            name:"Louisville, Kentucky",
            url: "http://access.weatherreach.com/HistoricalTable?StationID=350&TableTimeInt=1440&Range=Last%20Year",
            is_default:true,
            color:"#8e44ad"
        },
        {
            name:"Forest Grove, Oregon",
            url: "http://access.weatherreach.com/HistoricalTable?StationID=219&TableTimeInt=1440&Range=Last%20Year",
            is_default:true,
            color:" #1abc9c"
        }              
    ];

    var stored_sources = JSON.parse(localStorage.getItem('stored_sources')) || [];
    _default_source_urls = _default_source_urls.concat(stored_sources);

    return _default_source_urls;
}

function removeElement(array, elem) {
    var index = array.indexOf(elem);
    if (index > -1) {
        array.splice(index, 1);
    }
}




