console.log( "- clssc_bklctr.js START" );

/****************/
/* MAIN HANDLER */
/****************/

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

  this.find_bib = function() {
    /* Calls bibfinder class to try to get bib, then continues processing.
     * Called by $(document).ready()
     */
    bibnum = clssc_bklctr_bibfinder.grab_bib();  // tries getting the bibnum up to 3 ways
    console.log( "- lctr; bibnum, " + bibnum );
    process_item_table();
    console.log( "- lctr; ending initial function: find_bib()" );
  }

  var process_item_table = function() {
    /* Updates items to show callnumber link if appropriate.
     * Called by find_bib()
     */
    console.log( "- lctr; in process_item_table(); bibnum is, " + bibnum );
    var rows = $( ".bibItemsEntry" );
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      bklctr_row_processor.process_item( row, bibnum );
    }
    console.log( "- lctr; ending process_item_table()" );
  }

};  // end namespace clssc_bklctr_handler, ```var clssc_bklctr_handler = new function() {```


/**************/
/* BIB-FINDER */
/**************/

var clssc_bklctr_bibfinder = new function() {

  var bibfinder_bibnum = null;

  this.grab_bib = function() {
    /* Grabs bib via #recordnum; then continues processing.
     * Called by clssc_bklctr_handler.find_bib
     */
    console.log( "- lctr; starting clssc_bklctr_bibfinder()" );
    var elmnt = document.querySelector( "#recordnum" );
    console.log( '- lctr; elmnt, ' + elmnt )
    if ( elmnt == null ) {
      check_holdings_html_for_bib();
    } else {
      var url_string = elmnt.href;
      var segments = url_string.split( "=" )[1];
      bibfinder_bibnum = segments.slice( 0,8 );
      console.log( "- lctr; bibfinder_bibnum, " + bibfinder_bibnum );
      if ( bibfinder_bibnum == null ) {
        check_holdings_html_for_bib();
      }
    }
    console.log( "- lctr; returning final bibfinder_bibnum, " + bibfinder_bibnum );
    return bibfinder_bibnum;
  }

  var check_holdings_html_for_bib = function() {
    /* Looks for presence of bib-page link (link may or may not contain bibnum).
     * Called by grab_bib() if bib is null.
     */
    var dvs = document.querySelectorAll(".additionalCopiesNav");  // first of two identical div elements
    var bibfinder_href_string = null;
    if ( dvs.length > 0 ) {
      console.log( "- lctr; in check_holdings_html_for_bib(); checking dvs" );
      var dv = dvs[0];
      var el = dv.children[0];  // the div contains a link with the bibnum
      bibfinder_href_string = el.toString();
      grab_bib_from_holdings_html( bibfinder_href_string );
    }
    console.log( "- lctr; in check_holdings_html_for_bib(); bibfinder_href_string, " + bibfinder_href_string );
    if ( bibfinder_bibnum == null && bibfinder_href_string != null ) {
      console.log( "- lctr; in check_holdings_html_for_bib(); no bib luck yet" );
      grab_bib_from_following_href( bibfinder_href_string );
    }
    console.log( "- lctr; end of check_holdings_html_for_bib()" );
  }

  var grab_bib_from_holdings_html = function( bibfinder_href_string ) {
    /* Tries to determine bibnum from holdings html; then continues processing.
     * Called by check_holdings_html_for_bib().
     */
    var segment = bibfinder_href_string.split("/")[4];  // eg ".b4069600"
    if ( segment.length == 9 && segment.slice( 0,2 ) == ".b" ) {
      bibnum = segment.slice( 1, 9 );  // updates module var
      console.log( "- lctr; in grab_bib_from_holdings_html(); bibnum, " + bibnum );
    }
    console.log( "- lctr; end of grab_bib_from_holdings_html()" );
  }

  var grab_bib_from_following_href = function( bibfinder_href_string ) {
    /* Tries to load bib-page and grab bib from permalink element; then continues processing.
     * Called by check_holdings_html_for_bib()
     */
    $.ajaxSetup( {async: false} );  // otherwise processing would immediately continue while $.get() makes it's request asynchronously
    $.get( bibfinder_href_string, function(data) {
      var div_temp = document.createElement( "div_temp" );
      div_temp.innerHTML = data;
      var nodes = div_temp.querySelectorAll( "#recordnum" );
      console.log( "- lctr; nodes.length, " + nodes.length );
      if ( nodes.length > 0 ) {
        var bib_temp = nodes[0].href.split( "=" )[1];
        bibfinder_bibnum = bib_temp.slice( 0,8 );  // updates module's var
        console.log( "- lctr; in grab_bib_from_following_href(); outside of $.get(); bibfinder_bibnum is, " + bibfinder_bibnum );
      } else {
        console.log( "- lctr; ah, the tricky multiple results page" );
      }
    } );
    console.log( "- lctr; end of grab_bib_from_following_href()" );
  }

};  // end namespace clssc_bklctr_bibfinder, ```var clssc_bklctr_bibfinder = new function() {```


/*****************/
/* ROW-PROCESSOR */
/*****************/

var bklctr_row_processor = new function() {
  /*
   * Class flow description:
   *   - Determines whether to show booklocator info
   *   - If so, and if bib still blank, grabs bib from where it would be on a multiple-results page
   *   - Grabs barcode
   *   - Makes call to the booklocator api
   *   - Finds relevant item
   *   - Grabs map-url and callnumber
   *   - Builds and displays callnumber map-link in row's html
   */

  var cell_position_map = { "location": 0, "callnumber": 1, "availability": 2, "barcode": 3 };
  var local_bibnum = null;
  var local_row = null;
  var trimmed_barcode = null;  // updated by extract_row_data()
  var valid_locations = [ 'ROCK', 'SCI' ];
  var bibutils_api_pattern = "https://apps.library.brown.edu/bibutils/bib/THE_BIB/";

  this.process_item = function( row, bibnum ) {
    /* Processes each row.
     * Called by clssc_bklctr_handler.process_item_table()
     */
    init( bibnum, row );
    var row_dict = extract_row_data( row );
    if ( evaluate_row_data(row_dict)["show_callnumber"] == true ) {
      if ( local_bibnum == null ) {
        local_bibnum = grab_ancestor_bib( row );
      }
      locator_data = hit_api();

      display_link();
    }
    row.deleteCell( cell_position_map["barcode"] );
  }

  var init = function( bibnum, row ) {
    /* Sets class variables.
     * Called by process_item()
     */
     local_bibnum = bibnum;
     local_row = row;
     return;
  }

  var extract_row_data = function( row ) {
    /* Takes row dom-object; extracts and returns fielded data.
     * First row.children[i] is a td-element.
     * Called by process_item()
     */
    var row_data = {};
    row_data["location"] = row.children[0].textContent.trim();
    row_data["availability"] = row.children[2].textContent.trim();
    var barcode = row.children[3].textContent.trim();
    row_data["barcode"] = barcode.split(" ").join("");
    trimmed_barcode = row_data["barcode"];
    var callnumber_node = row.children[1];
    row_data["callnumber"] = callnumber_node.childNodes[2].textContent.trim();
    var callnumber_child_nodes = callnumber_node.childNodes;
    for (var i = 0; i < callnumber_child_nodes.length; i++) {
      if ( callnumber_child_nodes[i].textContent.trim() == "field v" ) {
        if ( callnumber_child_nodes[i+1].textContent.trim() == "field #" ) {  // volume_year empty
          row_data["volume_year"] = "";
        } else {
          row_data["volume_year"] = callnumber_child_nodes[i+1].textContent.trim();
        }
      }
    };
    console.log( "- lctr; row_data, " + JSON.stringify(row_data, null, 4) );
    return row_data;
  }

  var evaluate_row_data = function( row_dict ) {
    /* Evaluates whether 'Request Scan' button should appear; returns boolean.
     * Called by process_item()
     */
    var row_evaluation = { "show_callnumber": false };
    var location = row_dict["location"];
    if ( valid_locations.indexOf(location) > -1 ) {
      if ( trimmed_barcode != null ) {
        row_evaluation["show_callnumber"] = true;
      }
    }
    console.log( "- lctr; row_evaluation, " + JSON.stringify(row_evaluation, null, 4) );
    return row_evaluation;
  }

  var grab_ancestor_bib = function( row ) {
    /* Grabs bib on results page.
     * Called by process_item()
     */
    var big_element = row.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;  // apologies to all sentient beings
    console.log( "- lctr; in grab_ancestor_bib(); big_element, `" + big_element + "`" );
    var temp_bibnum = big_element.querySelector( "input" ).value;
    console.log( "- lctr; in grab_ancestor_bib(); temp_bibnum, `" + temp_bibnum + "`" );
    return temp_bibnum;
  }

  var hit_api = function() {
    /* Hits booklocator api.
     * Called by process_item()
     */
    var full_api_url = bibutils_api_pattern.replace( "THE_BIB", local_bibnum );
    full_api_url = full_api_url + "?callback=?"
    console.log( "- lctr; in hit_api(); full_api_url, `" + full_api_url + "`" );

    $.getJSON( full_api_url, function(data) {
        console.log( data );
      }
    );

    booklocator_map_url = "http://google.com"
    console.log( "- lctr; in hit_api(); booklocator_map_url, `" + booklocator_map_url + "`" );



    console.log( "- lctr; leaving hit_api()" );
    return;
  }



  var display_link = function() {
    /* Displays link html.
     * Called by build_url()
     * Ends `jcblink_row_processor` processing.
     */
    console.log( "- lctr; starting display_link()" );
    var td = local_row.children[0];
    var dashes = document.createTextNode( " -- " );
    var a = document.createElement( "a" );
    a.href = booklocator_map_url;
    a.setAttribute( "class", "classic_booklocator_map" );
    var link_text = document.createTextNode( "the_callnumber" );
    a.appendChild( link_text );
    td.appendChild( dashes );
    td.appendChild( a );
    console.log( "- lctr; booklocator link added" );
  }

};  // end namespace bklctr_row_processor





/***********/
/* ON-LOAD */
/***********/

$(document).ready(
  function() {
    console.log( "- clssc_bklctr.js says document loaded" );
    clssc_bklctr_handler.find_bib();
  }
);


console.log( "- clssc_bklctr.js END" );
