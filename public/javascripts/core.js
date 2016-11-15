$(document).ready(function(){

    $('[data-toggle="tooltip"]').tooltip();

    $('.dateTimeField').each(function() {
        $(this).text(formatDate($(this).text()));
    });

});

// Functions
function formatDate(dateStr) {

    var date = new Date(dateStr);

    //var month = date.getMonth() + 1; //months from 1-12
    //var day = date.getDate();
    //var year = date.getFullYear();

    //newdate = day + "/" + month + "/" + year;
    return date.toLocaleString();

    //var hours = date.hours;
    //var minutes = date.minutes;

    //var strTime = hours + ':' + minutes;
    //return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

// Function: insertAlertAfter
//      Use to show messages
// timeout: time to close the alert
// type: [warning, success, danger]
// selector: element used to refer the position
function insertAlertAfter(timeout, type, selector, title, text){

    var i = parseInt(Math.random()*100000);
    var id = "alert" + i;

    var html = "<div id='"+ id + "' class='alert alert-"+ type + " alert-dismissible' role='alert'>"
             + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"
             + "<span aria-hidden='true'>×</span></button><strong>" + title + "</strong>&nbsp;"
             + text
             + "</div>";

    $(html).insertAfter(selector);

    $("#" + id).css('display','none');

    $("#" + id).fadeIn(200);

    window.setTimeout(function () {
        $("#" + id).fadeOut(1000);
    }, timeout);

}
