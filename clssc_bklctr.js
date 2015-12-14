console.log( "- sms.js START" );


var clssc_bklctr_handler = new function() {
  /* Namespaces function calls.
   *
   * See <http://stackoverflow.com/a/881611> for module-pattern reference.
   * Minimizes chances that a function here will interfere with a similarly-named function in another imported js file.
   * Only find_bib_items() can be called publicly, and only via ```sms_handler.find_bib_items();```.
   *
   * Class flow description:
   * - looks for existence of sms image. If image exists...
   *   - Grabs bib and builds blacklight sms link
   *   - Builds and displays image-link html
   *
   * Reference Josiah page:
   * - regular bib: <http://josiah.brown.edu/record=b3902979>
   */

  /* set globals, essentially class attributes */
  var bibnum = null;
  var sms_url_root = "https://search.library.brown.edu/catalog/sms?id=";
  var sms_url_full = null;
  var image_path = "/screens/smsbutton.gif";

  this.find_bib_items = function() {
    /* Checks to see if bib_items exist.
     * Called by document.ready()
     */
    var bib_section = document.getElementById( "bib_items" );
    var relevant_rows = bib_section.querySelectorAll( "tr.bibItemsEntry" );
    // if ( relevant_rows.length > 0 ) {
    //   console.log( "- bib-items found; sms link-builder js proceeding" );
    //   grab_bib();
    // } else {
    //   console.log( "- no bib-items found; hiding sms link-builder js will hide image and quit" );
    //   document.getElementById( "smsfeatures" ).style.visibility="hidden";
    // }
  }

  // var grab_bib = function() {
  //   /* Grabs bib via #recordnum; populates sms_url; continues processing.
  //    * Called by find_sms_image()
  //    */
  //   var elmnt = document.querySelector( "#recordnum" );
  //   if ( elmnt != null ) {
  //       var url_string = elmnt.href;
  //       var segments = url_string.split( "=" )[1];
  //       bibnum = segments.slice( 0,8 );
  //       console.log( "- bibnum, " + bibnum );
  //       sms_url_full = sms_url_root + bibnum;
  //       update_html();
  //   } else {
  //       console.log( "- no recordnum id, so no bib; exiting sms js" );
  //   }
  // }

  // var update_html = function() {
  //   /* Builds and displays link html.
  //    * Called by grab_bib()
  //    */
  //   console.log( "- starting sms build_html()" );
  //   var div = document.getElementById( "smsfeatures"  );
  //   div.style.visibility="hidden";
  //   var a = document.createElement( "a" );
  //   var img = document.createElement( "img" );
  //   a.appendChild( img );
  //   div.appendChild( a );
  //   update_attributes( a, img, div );
  //   div.style.visibility="visible";
  //   console.log( "- sms link added" );
  // }

  // var update_attributes = function(a, img, div) {
  //    Fleshes out elements (must happen after appendChild() calls).
  //    * Called by update_html()

  //   a.href = sms_url_full;
  //   a.setAttribute( "id", "sms_link" );
  //   img.setAttribute( "src", image_path );
  //   img.setAttribute( "border", "0" );
  // }

};  // end namespace clssc_bklctr_handler, ```var clssc_bklctr_handler = new function() {```




$(document).ready(
  function() {
    console.log( "- sms.js says document loaded" );
    clssc_bklctr_handler.find_bib_items();
  }
);


console.log( "- sms.js END" );
