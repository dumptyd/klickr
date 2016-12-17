(function($){
  $.fn.ripple = function(params) {
    var div = $('<div>');
    var diameter = params.diameter + 'px';
    var margin = -(params.diameter/2) + 'px';
    div.attr({class: 'ripple'});
    div.css({
      left: params.x,
      top: params.y
    });
    $(this).append(div);
    div.css('width');
    div.css('height');
    div.css('margin');
    div.css('display');
    div.css({
      margin: margin,
      height: diameter,
      width: diameter
    });

    setTimeout(function(){
      div.fadeOut(500, function(){
        $(this).remove();
      });
    }, 200);
    return this;
  }
  
  $.fn.attachRipple = function(params){
    $(this).on('click', function(e){
      $(this).ripple({
        x: e.pageX,
        y: e.pageY,
        diameter: params.diameter
      });
    });
  }
}(jQuery));