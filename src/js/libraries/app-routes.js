

router.registerRoute("main", function (_args) {
    LoadMainAppContentPage(function () {
        loadHTMLAppView("main-content", "src/views/app-controllers/visualization_view.html", "src/views/app-controllers/visualization_view_controller.js", function () { });
    });
});





function LoadPage (location, cb) {
    $('#page-body').load(location, cb);
}

function LoadMainAppContentPage(on_success) {

    var did_not_load_main_app_content = document.getElementById("main-content") == null || document.getElementById("main-content").innerHTML.trim().length == 0;
    if(did_not_load_main_app_content){

        loadHTMLAppView("main-app-content-page", "src/views/app-main/index.html", null, function () {
            on_success();
            loadJSFileURL("src/views/app-main/app-main-controller.js");
        });
    }else{
        on_success();
    }
    
}
