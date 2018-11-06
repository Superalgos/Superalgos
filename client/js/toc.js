jQuery(window).ready(function(){
      var tocHTML  ='<div id="toc" class="toc_fixed">';
      tocHTML  +=     '<div class="toc_inner">';
      tocHTML  +=         '<div class="toc_item toc_separator">';
      tocHTML  +=             '<div class="toc_description">';
      tocHTML  +=                 '<i>Return to Home</i> - ';
      tocHTML  +=                 '<br>navigate to home page of the site';
      tocHTML  +=             '</div>';
      tocHTML  +=             '<a href="index.html" class="toc_icon with_title fa fa-home">';
      tocHTML  +=                 '<span class="toc_title">Home</span>';
      tocHTML  +=             '</a>';
      tocHTML  +=         '</div>';
      tocHTML  +=         '<div class="toc_item toc_separator">';
      tocHTML  +=             '<div class="toc_description">';
      tocHTML  +=                 '<i>Back to top</i> - ';
      tocHTML  +=                 '<br>scroll to top of the page';
      tocHTML  +=             '</div>';
      tocHTML  +=             '<a href="#" class="toc_up toc_icon with_title fa fa-arrow-up">';
      tocHTML  +=                 '<span class="toc_title">To Top</span>';
      tocHTML  +=             '</a>';
      tocHTML  +=         '</div>';
      tocHTML  +=         '<div class="toc_item toc_separator">';
      tocHTML  +=             '<div class="toc_description">  ';
      tocHTML  +=                 '<i>New TOC</i> - ';
      tocHTML  +=                 '<br>for Buttons section';
      tocHTML  +=             '</div>';
      tocHTML  +=             '<a href="#go_buttons" class="toc_icon with_title fa fa-check">';
      tocHTML  +=                 '<span class="toc_title">New TOC</span>';
      tocHTML  +=             '</a>';
      tocHTML  +=         '</div>';
      tocHTML  +=     '</div>';
      tocHTML  +='</div>';

      jQuery('body').append(tocHTML);

});

jQuery(document).ready(function () {
      jQuery('#toc .toc_up').click(function(e) {
            "use strict";
            jQuery('html,body').animate({
                  scrollTop: 0
            }, 'slow');
            e.preventDefault();
            return false;
      });
});

