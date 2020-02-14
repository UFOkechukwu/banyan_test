



function getGetDataSources() {
    var _default_source_urls = [
        {
            name:"Colorado Springs, Colorado",
            url: window.location.origin + "/banyan_test/src/views/app-controllers/data_colorado.html",
            is_default:true,
            color:"#f8c471"
        },
        {
            name:"Louisville, Kentucky",
            url: window.location.origin + "/banyan_test/src/views/app-controllers/data_louisville_ky.html",
            is_default:true,
            color:"#8e44ad"
        },
        {
            name:"Forest Grove, Oregon",
            url:window.location.origin + "/banyan_test/src/views/app-controllers/data_forest_grove.html",
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




