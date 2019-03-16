export default function () {
  $(".ol-scale-line").mousedown(function(event){
    const target = $(this);
    target.addClass("drag");
    const eX = event.pageX - target.css("left").replace(/px/,"");
    const eY = event.pageY - target.css("top").replace(/px/,"");
    $(document).mousemove(function(event){
      target.find('.drag').css("left",event.pageX - eX).css("top",event.pageY - eY);
    });
    $(document).mouseup(function(){
      target.unbind("mousemove");
      target.removeClass("drag");
    });
  });
  /*
$(".handle").mousedown(function(event){
  const parent = $(this).parent();
  parent.addClass("drag");
  const eX = event.pageX - parent.css("left").replace(/px/,"");
  const eY = event.pageY - parent.css("top").replace(/px/,"");
  $(document).mousemove(function(event){
    $(this).parent('.drag').css("left",event.pageX - eX).css("top",event.pageY - eY);
  });
  $(document).mouseup(function(event){
    $("div.drag").unbind("mousemove");
    $("div.drag").removeClass("drag");
  });
});
*/

}
