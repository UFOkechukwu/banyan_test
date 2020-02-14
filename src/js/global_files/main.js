//Main Page BASE URL
var base_url = window.location.origin + window.location.pathname;
if (window.location.href === base_url) {
    // history.pushState(null, '', "#login");
    history.pushState(null, '', "#main");

}

$('.modal').modal();
$('.tabs').tabs();

function LoadAppJS_CSS(filename, filetype) {
    if (filetype == "js") { //if filename is a external JavaScript file
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype == "css") { //if filename is an external CSS file
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}


function loadJSFileURL(file_url) {
    const scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = file_url;
    });

}

function loadHTMLAppView(element_id, html_url, js_url, on_success) {
    fetch(html_url /*, options */)
        .then((response) => response.text())
        .then((html) => {
            document.getElementById(element_id).innerHTML = html;
            if(js_url != null){
                loadJSFileURL(js_url)
                on_success();
            }else{
                on_success();
            }
        })
        .catch((error) => {
            console.warn(error);
        });
}



function editDataSource(){
    $('#data-source-input-modal').modal('open');
}


var HttpClient = function() {
    this.get = function(d_source, aCallback) {
        var anHttpRequest = new XMLHttpRequest();

        proxy_url = "https://cors-anywhere.herokuapp.com/";
        
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200){
                aCallback(anHttpRequest.responseText, d_source, 200);
            }else if (anHttpRequest.readyState == 4){
                aCallback("failed", d_source, anHttpRequest.status);
            }
                
        }

        if(d_source.url.includes("localhost")){
            anHttpRequest.open( "GET", d_source.url, true );   
        }else{
            anHttpRequest.open( "GET", proxy_url + d_source.url, true );   
        }
          
        anHttpRequest.setRequestHeader('Access-Control-Allow-Headers', '*');
        anHttpRequest.setRequestHeader('Access-Control-Allow-Origin', '*');



        anHttpRequest.send( null );


    }
}



