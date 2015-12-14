console.log( "- sms.js START" );


var clssc_bklctr_handler = new function() {
  /* Namespaces function calls.
   *
   * See <http://stackoverflow.com/a/881611> for module-pattern reference.
   * Minimizes chances that a function here will interfere with a similarly-named function in another imported js file.
   * Only find_bib_items() can be called publicly, and only via ```clssc_bklctr_handler.find_bib_items();```.
   *
   * Controller class flow description:
   * - Attempts to grab bib from permalink page
   * - If bib null, attempts to grab bib from where it might be on a holdings-page
   * - If bib null, attempts to grab bib from bib-page's html, getting there via holdings page link
   * - If bib null, proceeds to item-rows processing
   * - Finds all item-rows and for each row:
   *   - Calls namespace `clssc_bklctr__row_processor` to process the row
   *     - If bib null, row-processing tries to grab bib from multiple-result-page's enclosing element's input field
   *     - The barcode is grabbed
   *     - The bib-api is called
   *       - The item containing the barcode is found, and the map-link grabbed
   *     - The book-locator html is built
   *     - The location html is updated
   *
   * Reference:
   * - items page: <http://josiah.brown.edu/record=b4069600>
   * - holdings page containing bib: <http://josiah.brown.edu/search~S7?/.b4069600/.b4069600/1,1,1,B/holdings~4069600&FF=&1,0,>
   * - holdings page without direct bib: <http://josiah.brown.edu/search~S7?/XAmerican+imago&searchscope=7&SORT=D/XAmerican+imago&searchscope=7&SORT=D&searchscope=07&SUBKEY=American+imago/1,53,53,B/holdings&FF=XAmerican+imago&2,2,>
   * - multiple results page: <http://josiah.brown.edu/search~S11/?searchtype=X&searcharg=zen&searchscope=11&sortdropdown=-&SORT=D&extended=1&SUBMIT=Search&searchlimits=&searchorigarg=tzen>
   */

  /* set globals, essentially class attributes */
  var bibnum = null;
  var api_url_pattern = "https://apps.library.brown.edu/bibutils/bib/THE_BIB/";
  var api_url_full = null;

  var grab_permalink_bib = function() {
    /* Grabs bib via #recordnum; then continues processing.
     * Called by check_already_run()
     */
    var elmnt = document.querySelector( "#recordnum" );
    update_console( 'elmnt, ' + elmnt )
    if ( elmnt == null ) {
      check_holdings_html_for_bib();
    } else {
      var url_string = elmnt.href;
      var segments = url_string.split( "=" )[1];
      bibnum = segments.slice( 0,8 );
      update_console( "- bibnum, " + bibnum );
      // if ( bibnum == null ) {
      //   check_holdings_html_for_bib();
      // } else {
      //   process_item_table();
      // }
    }
  }

  var update_console = function( note ) {
    console.log( "bklctr - " + note )
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
    console.log( "- clssc_bklctr.js says document loaded" );
    clssc_bklctr_handler.grab_permalink_bib();
  }
);


console.log( "- clssc_bklctr.js END" );
