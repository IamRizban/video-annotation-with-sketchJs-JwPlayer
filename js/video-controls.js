// defining global variables
var annotating_video_height = 0;
var annotating_video_width = 0;
var annotating_video = document.getElementById("annotating-video");
var annotation_storage_array = new Array();
var isAnnotationStored = false;
var JWplayerInstance = jwplayer("annotating-video");
JWplayerInstance.setup({
    file: "movie3.mp4",
    width: 854,
    height: 480
});
// when player stuck with any error
JWplayerInstance.on('setupError', function () {
    errMessage('Something went wrong! Please refresh your page.');
});
// function to activate/inactivate canvas
function startEndAnnotation() {
    // initialize canvas with sketch.js
    $('#canvas').sketch();
    // remove 'hide' class from canvas container and add 'show' class
    //  so that canvas could be activate
    if ($('.canvas_container').hasClass('hide')) {
        // show marker & make active
        $('.marker').removeClass('inactive').addClass('active');
        // show all hidden elements
        $('.marker, .eraser, .erase_all_annotations, .annotation_sizes, .annotation_colors, .annotation_shapes').show();
        // show canvas
        $('.canvas_container').removeClass('hide').addClass('show');
        // swap text 'Start' to 'Stop'
        $(".start_annotation").text('Stop Annotation');
        // pause the file & change text
        //annotating_video.pause();
        JWplayerInstance.pause();
    } else {
        annotating_video.controls = true;
        // inactivate marker
        $('.marker').removeClass('active').addClass('inactive');
        // hide all elements
        $('.marker, .eraser, .erase_all_annotations, .annotation_sizes, .annotation_colors, .annotation_shapes').hide();
        storeAnnotation();
        setTimeout(function () {
            $('.canvas_container').html('');
            $('.canvas_container').html('<canvas id="canvas" height="480" width="854"></canvas>'); //add it back to the container
            $('.canvas_container').removeClass('show').addClass('hide');
        }, 3000);
        // swap text 'Stop' to 'Start'
        $(".start_annotation").text('Start Annotation');
        // play the file & change text
        JWplayerInstance.play();
    }
}
// function to store annotation locally
function storeAnnotation() {
    var annotation_array = new Array();
    var canvas = document.getElementById('canvas');
    // get current time to set annotation start time
    annotation_array.annotation_start_time = JWplayerInstance.getPosition().toFixed(0);
    annotation_array.data_string = canvas.toDataURL();
    // store annotation in array, to retrieve back
    annotation_storage_array.push(annotation_array);
    // set true to this var, because annotation has been stored
    isAnnotationStored = true;

}
// function to erase all annotations
function eraseAllAnnotations() {
    // script to erase all annotations and reinitialize canvas    
    if (confirm("Are you sure you want to remove all annotations?")) {
        $('.canvas_container').html(''); //remove canvas from container
        $('.canvas_container').html('<canvas id="canvas" height="480" width="854"></canvas>'); //add it back to the container
        $('#canvas').sketch();
        $(".start_annotation").text('Start Annotation');
        $('.eraser').removeClass('active').addClass('inactive');
        $('.marker').removeClass('inactive').addClass('active');
        return true;
    } else {
        return false;
    }
}
// function to draw stored annotation
function drawStoredAnnotation(annotation_baase_64_string) {
    $('.annotation_image').attr('src', annotation_baase_64_string);
    setTimeout(function () {
        // make empty src attribute of image
        $('.annotation_image').attr('src', '');
    }, 3000);
}
//  display an error message 
function errMessage(msg) {
    // displays an error message for 5 seconds then clears it
    document.getElementById("errorMsg").textContent = msg;
    setTimeout("document.getElementById('errorMsg').textContent=''", 5000);
}
// script to contorls video & canvas
$(document).ready(function () {
    // script to activate/inactivate canvas
    $(".start_annotation").on("click", function () {
        startEndAnnotation();
    });
    // script to erase all annotations
    $('.erase_all_annotations').on("click", function () {
        eraseAllAnnotations();
    });
    // make active eraser and do inactive marker  when click on eraser
    $('.eraser').on('click', function () {
        $('.marker').removeClass('active').addClass('inactive');
        $('.eraser').removeClass('inactive').addClass('active');
    });
    // make active marker and do inactive eraser when click on marker
    $('.marker').on('click', function () {
        $('.eraser').removeClass('active').addClass('inactive');
        $('.marker').removeClass('inactive').addClass('active');
    });
    // event to track during playing of video
    JWplayerInstance.on('time', function () {
        video_current_playing_time = 0;
        // current running time
        var video_current_playing_time = parseInt(JWplayerInstance.getPosition().toFixed(0));
        if (isAnnotationStored) {
            var count = 0;
            for (count = 0; count < annotation_storage_array.length; count++) {
                if (video_current_playing_time == parseInt(annotation_storage_array[count]['annotation_start_time'])) {
                    drawStoredAnnotation(annotation_storage_array[count]['data_string']);
                }
            }
        }
    });
    // track full screen event
    JWplayerInstance.on('fullscreen', function () {
        // while screen become full then make canvas as equivalent of screen
        if ($('.annotation_image').hasClass('annotation_image_fullscreen')) {
            $('.annotation_image').removeClass('annotation_image_fullscreen');
        } else {
            $('.annotation_image').addClass('annotation_image_fullscreen');
        }
    });
});