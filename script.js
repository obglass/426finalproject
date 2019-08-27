$(document).ready(function() {

    let main = $('#main');
    var root_url = "http://comp426.cs.unc.edu:3001/";
    $('#bright').prop("checked", true);
    let gender = "bright";

    buildHome();

    //request from browser for authentication cookie from server
    $.ajax(root_url + '/sessions',
        {
            type: 'POST',
            xhrFields: { withCredentials: true },
            data: {
              "user": {
                "username": "jkwoods",
                "password": "730009124"
              }
            },
            error: () => {
                alert("error");
            }
        });

        let airports = [];

        $.ajax(root_url + "airports", //unfiltered
                                   {
                                       type: 'GET',
                                       dataType: 'json',
                                       xhrFields: {withCredentials: true},
                                       success: (response) => {
                                         console.log(response);
                                            airports = response;
                                       }
                                   });

  let currentAirportReceivePage = airports[0]; //added jess

  let currentName = "User";
  $('.rbutton').on('click', function() {

    gender = $(this).val();
    darkBrightHandler(gender);
  });

  $('#home').on("click", function() {
    buildHome();
    darkBrightHandler(gender);
  });

  // fulfill page
  $('#fulfill').on("click", function() {
    main.empty();

    main.append('<div id="fulfill_div_base"></div> ');
    fulfilldivbase = $('#fulfill_div_base');

    fulfilldivbase.append('<div id="fulfill_div"></div> ');
    fulfilldiv = $('#fulfill_div');

    fulfilldiv.append('<br></br>');
    fulfilldiv.append('<label class = "req_label"> CURRENT REQUESTS </label> ');

    requestlist = $('<div id="requestlist"></div>');
    newLine(fulfilldiv);
    fulfilldiv.append(requestlist);

    make_request_list(gender);
    $('#fulfill_div').append('<input type="button" id="sendUpdate" value="SEND ITEM"> </input>');

    $('#sendUpdate').on("click", function() {
      let data = { "ticket": {"last_name": currentName } }
      
        $.ajax(root_url + "tickets/" + $("input[name='fulfillButtony']:checked").val(), {
          type: 'PATCH',
          dataType: 'json',
          data: data,
          xhrFields: {withCredentials: true},
          success: (response) => {
            make_request_list(gender);
            darkBrightHandler(gender);
          }
        });
    });
	  darkBrightHandler(gender);
  });

  $("#sell").on("click", function(){
    main.empty();

    main.append('<div id="send_div"> </div> ');
    $('#flightlist').empty();

    //Populate send div
    senddiv = $('#send_div');
    senddiv.append('<div id="inputdiv"></div>');
    inputdiv = $('#inputdiv');

    senddiv.append('<label class = "req_label">Send a package!</label>');

    //jess autocomplete
    let autoCompleteDiv = $('<div class="autocomplete"></div>'); //added jess

    let airportDepart = $('<input type="text" id="depAirportInput" class="sendAirport" placeholder="Departure Airport" searchBar2> </input><br>');
    autoCompleteDiv.append(airportDepart);
    inputdiv.append(autoCompleteDiv);
    inputdiv.append('<br>');

    let airportName = "";
    //jess helper code
    let airportNames = new Array(airports.length -1);
    let airportsNotCYO = new Array(airports.length -1);

    let j = 0;
    for (let i=0; i < airports.length; i++) {
        if (airports[j].code == "CYO"){
        } else {
            airportsNotCYO[j] = airports[j];
            airportNames[j] = airports[j].name + " (" + airports[j].code + ")";
            j++;
        }
    }

    let currentAirportRequestPage = airportsNotCYO[0];
    //autocomplete #2 by jess - slightly different functionality
    $('[searchBar2]').on("keyup", function() {
        let term = $(this).val().toLowerCase();

            if (term != '') {
                $(".dropdown").remove();
                $(".temp").remove();
                    for (let i=0; i < airportNames.length; i++) {
                        let anlc = airportNames[i].toLowerCase();
                        if(anlc.includes(term)){
                            autoCompleteDiv.append('<button class="dropdown" id="r_' + airportsNotCYO[i].code + '">' + airportNames[i] + '</button><br class="temp" id="temp_' + airportsNotCYO[i].code + '">');

                            //on dropdown clicks, set current airport
                            $("#r_" + airportsNotCYO[i].code).on("click", function(){
                                currentAirportRequestPage = airportsNotCYO[i];
                                airportName = airportsNotCYO[i].name;

                                $("#depAirportInput").val(airportsNotCYO[i].name);
                                $(".dropdown").remove();
                                $(".temp").remove();

                                //remake flight list
                                make_flightlist_send_page(currentAirportRequestPage.id);
                            });
                        } else {
                            $("#r_" + airportsNotCYO[i].code).remove();
                            $("#temp_" + airportsNotCYO[i].code).remove();
                        }
                    }
            } else {
                $(".dropdown").remove();
                $(".temp").remove();
            }
    }); //end of autocomplete #2
    //inputdiv.append(airportDepart);

    let itemToSendInput = $('<input type="text" placeholder="Item to send"> </input>');
    inputdiv.append(itemToSendInput);
    let itemToSend = "";
    itemToSendInput.on("keyup", function() {
      itemToSend = $(this).val();
    });

    let askingPriceInput = $('<input type="text" placeholder="Request price"> </input>');
    inputdiv.append(askingPriceInput);
    let askPrice = 0;
    askingPriceInput.on("keyup", function() {
      askPrice = $(this).val();
    });
    newLine(senddiv);

    //List of flights
    senddiv.append('<div id = "flightlist"></div>');
    flightlist = $('#flightlist');
    make_flightlist_send_page(currentAirportRequestPage.id);

    // click event for send button -- adds a flight instance to it if one is not already chosen
    main.append('<input type="button" id="sendSubmit" value="SEND"> </input>');

    $('#sendSubmit').on("click", function() {
      // keep everything in here -- this fixed the glitch
        let airport_id = currentAirportRequestPage.id;
        let flight_id = $("input[name='flightS']:checked").val();

	if (flight_id == undefined) {
        	alert("Please choose a flight");
      	}  else {
        // keep this part
        $.ajax(root_url + "instances?filter[flight_id]=" + flight_id,
               {
               type: 'GET',
               dataType: 'json',
               xhrFields: {withCredentials: true},
               success: (response) => {
                 let instance = response[0]; //array should be exactly one instance
                 let instance_id = instance.id;
                 let data =  { "ticket" : {
                                   "first_name": itemToSend,
                                   "middle_name" : "",
                                   "last_name": currentName,
                                   "age" : 1,
                                   "gender" : gender,
                                   "is_purchased" : 0.0,
                                   "price_paid" : askPrice,
                                   "instance_id" : instance_id,
                                   "seat_id" : 5520
                                   }
                               }
                  if (itemToSend != "" && askPrice != "" && airport_id != "" && !Number.isNaN(parseInt(askPrice))) {
                    // POST new ticket with given info from user
                    $.ajax(root_url + "/tickets?" , {
                          type: 'POST',
                          dataType: 'json',
                          data: data,
                          xhrFields: {withCredentials: true},
                          success: (response) => {
                            $('#sell').click();
                          }
                     });
                 } else {
                   alert("Please fill in all input boxes with valid inputs to make a request.");
                 }
               }
        });
	}
    });
  darkBrightHandler(gender);
  });

  function newLine(x){
    x.append('<br></br>');
  }

  $("#receive").on("click", function(){
    main.empty();
    newLine(main);

    let recDiv = $('<div id="receive_div"> Pick Up </div> '); //main holder div for receive section
    main.append(recDiv);
    recDiv.append('<input type="text" placeholder="Airports Near You ..."> </input>'); //will change to drop down of airports or autocomplete - arrival airport on ticket

    let submitr = $("<button id=submit_rec_arrival> Submit </button>");
    recDiv.append(submitr);
    recDiv.append('<h2> Avalible/Unpurchsed Items <h2>');

    let closetAirport = "RDU"; //whatever value from search bar - placeholder for now - i will fix

      //when airport is submitted, generate all unpurchased tickets for which that is the arrival airport
    $("#submit_rec_arrival").on("click", function(){
        //get airport id
        let airport_id = 87590;

        //get all flights arriving at airport
        $.ajax(root_url + "flights", //couldn't get filtering to work for integers on flights?? .... idk fam
	       {
	       type: 'GET',
	       dataType: 'json',
	       xhrFields: {withCredentials: true},
	       success: (response) => {
		       let array = response;
            //find correct arrival ids
           for (let i=0; i<array.length; i++) { //filtering workaround
                if(array[i].arrival_id == airport_id){

                    //get instance of that flight
                    let flight_id = array[i].id;

                    $.ajax(root_url + "instances?filter[flight_id]=" + flight_id,
                       {
                           type: 'GET',
                           dataType: 'json',
                           xhrFields: {withCredentials: true},
                           success: (response) => {
                           let instance = response[0]; //array should be exactly one instance

                            let instance_id = instance.id;
                           //get tickets of that array

                            $.ajax(root_url + "tickets?filter[is_purchased]=0.0&filter[instance_id]=" + instance_id, //filtering ajax request on tickets
                               {
                                   type: 'GET',
                                   dataType: 'json',
                                   xhrFields: {withCredentials: true},
                                   success: (response) => {
                                    let tickets = response;
                                    if (tickets.length > 0){//if there exsist tickets

                                        //for each unpurchased ticket make new listing
                                        for (let i=0; i<tickets.length; i++) {
                                                let ticketDiv = $('<div class="ticketDiv" id="ticketDiv_' + tickets[i].id + '"></div> ');
                                                //div per ticket - id is "ticketDiv_<ticketID>"

                                                recDiv.append(ticketDiv);

                                                //make feilds for ticket request
                                                ticketDiv.append('<div class="itemName">' + tickets[i].first_name + '</div>');
                                                ticketDiv.append('<div class="itemPrice">'+ "Asking Price: $" + tickets[i].price_paid + '</div>');
                                       }
                                     }
                                   }
                               });
                           }
                       });
                }
           }
	       }
	   });
    });
	darkBrightHandler(gender);
  });

  $("#request").on("click", function(){
    main.empty();
    main.append('<div id="req_div"> </div> ');

    reqdiv = $('#req_div');
    newLine(reqdiv);
    reqdiv.append('<label class = "req_label"> MAKE A REQUEST!</label> ');
    newLine(reqdiv);

    let autoCompleteDiv = $('<div class="autocomplete"></div>'); //added jess

    // Make text boxes with options for user to fill in
    reqdiv.append('<div id="req_div_textholder"> </div> ');
    req_div_textholder = $('#req_div_textholder');

    let airportInput = $('<input type="text" id="airportInput" class="req" placeholder="Arrival airport" searchBar2> </input><br>'); // user types in arrival airport
    autoCompleteDiv.append(airportInput);  //new

    req_div_textholder.append(autoCompleteDiv);
    let airportName = "";

    //jess helper code
    console.log(airports.length);
    let airportNames = new Array(airports.length -1);
    let airportsNotCYO = new Array(airports.length -1);

    let j = 0;
    for (let i=0; i < airports.length; i++) {
        if (airports[j].code == "CYO"){
            //do nothing - we don't want to include this one
        } else {
            airportsNotCYO[j] = airports[j];
            airportNames[j] = airports[j].name + " (" + airports[j].code + ")";

            j++;
        }

    }

  let currentAirportRequestPage = airportsNotCYO[0];

      //autocomplete #2 by jess - slightly different functionality
    $('[searchBar2]').on("keyup", function() {
        let term = $(this).val().toLowerCase();

            if (term != '') {
                $(".dropdown").remove();
                $(".temp").remove();
                    for (let i=0; i < airportNames.length; i++) {
                        let anlc = airportNames[i].toLowerCase();
                        if(anlc.includes(term)){
                            autoCompleteDiv.append('<button class="dropdown" id="r_' + airportsNotCYO[i].code + '">' + airportNames[i] + '</button><br class="temp" id="temp_' + airportsNotCYO[i].code + '">');

                            //on dropdown clicks, set current airport
                            $("#r_" + airportsNotCYO[i].code).on("click", function(){
                                currentAirportRequestPage = airportsNotCYO[i];
                                airportName = airportsNotCYO[i].name;

                                $("#airportInput").val(airportsNotCYO[i].name);
                                $(".dropdown").remove();
                                $(".temp").remove();

                                //remake flight list
                                make_flight_list(currentAirportRequestPage.id);

                            });
                        } else {
                            $("#r_" + airportsNotCYO[i].code).remove();
                            $("#temp_" + airportsNotCYO[i].code).remove();
                        }
                    }
            } else {
                $(".dropdown").remove();
                $(".temp").remove();
            }
    }); //end of autocomplete #2

    let itemReqNameInput = $('<input type="text" id="itemRequestName" class="req" placeholder="Input item"> </input>');
    req_div_textholder.append(itemReqNameInput);
    let itemName = "";
    itemReqNameInput.on("keyup", function() {
      itemName = $(this).val();
    });

    let priceReqInput = $('<input type="text" id="reqPriceWilling" class="req" placeholder="Price bid"> </input>');
    req_div_textholder.append(priceReqInput);
    let priceWillReq = "";
    priceReqInput.on("keyup", function() {
      priceWillReq = $(this).val();
    });
    newLine(reqdiv);

    //List of flights going to that airport
    reqdiv.append('<div id = "req_flightlist"></div>');
    reqFlightList = $('#req_flightlist');

      // give user the option to add a new flight if their preference is not there
      let makeFlight = $('<input class="reqbutton" type="radio" name="flightNew" id="newFlight"> Add New Flight <br>');
      reqdiv.append(makeFlight);
      let inputDiv = $('<div id="newFlightInput"></div>');
      $('#newFlight').on("click", function(){
        inputDiv.empty();

        // option for flight arrival time
        reqdiv.append(inputDiv);
        addTimeDropdown();
        inputDiv.append('<br>');
        addDateDropdown();
        let submitButton = $('<input type="button" value="Submit" id="submitFlight"> </input>');
        inputDiv.append(submitButton);
        newLine(inputDiv);
        newLine(inputDiv);
        let arrTime;
        let depTime;

        // let the user submit their own arrival time, making a new flight
        $('#submitFlight').on("click", function() {

          // get hour, min, year, month, and date from user
          let hourSel = document.getElementById("hourSel").selectedIndex;
          let hour = document.getElementsByTagName("option")[hourSel].value;
          let minSel = document.getElementById("minSel").selectedIndex;
          let min = document.getElementsByTagName("option")[minSel].value;
          arrTime = hour + ":" + min;
          // console.log(arrTime);
          let dHour, depTime, depDay, depYear, depMonth, depDate;

          let yearSel = document.getElementById("yearSel").selectedIndex;
          let year = parseInt(document.getElementsByTagName("option")[yearSel].value) + 2018;
          let monthSel = document.getElementById("monthSel").selectedIndex;
          let month = document.getElementsByTagName("option")[monthSel+1].value;
          let day = document.getElementById("daySel").selectedIndex + 1;
          // let day = document.getElementsByTagName("option")[daySel+1].value;
          if (parseInt(day) < 11) {
            day = "0" + day.toString();
          }
          let date = year + "-" + month + "-" + day;
          // console.log(date);

          depYear = year;
          // make dep time 3 hours less than arrival
          if (parseInt(hour) < 3) {
            if (parseInt(hour) == 0) {
              depTime = "21:00";
            } else if (parseInt(hour) == 1) {
              depTime = "22:00";
            } else if (parseInt(hour) == 2) {
              depTime = "23:00";
            }
            if (parseInt(day) == 1) {
              if ((parseInt(month) == 2) || (parseInt(month) == 4) || (parseInt(month) == 6) || (parseInt(month) == 8) || (parseInt(month) == 9) || (parseInt(month) == 11)) {
                depDay = 31;
                depMonth = month - 1;
              } else if ((parseInt(month) == 5) || (parseInt(month) == 7) || (parseInt(month) == 10) || (parseInt(month) == 12)){
                depDay = 30;
                depMonth = month - 1
              } else if (parseInt(month) == 3) {
                if (year == 2019) {
                  depDay = 28;
                } else if (year = 2020) {
                  depDay = 29;
                }
                depMonth = 2
              } else if (parseInt(month) == 1) {
                depDay = 31;
                depYear = year - 1;
                depMonth = 12;
              }
            } else {
              depDay = parseInt(day) - 1;
            }
          } else {
              dHour = hour - 3;
              depTime = dHour + ":00";
              depDay = day;
              depMonth = month;
              depYear = year;
          }
          depDate = depYear + "-" + depMonth + "-" + depDay;

          // don't allow user to select past days or days that don't exist
          if ((parseInt(year) == 2018 && parseInt(month) < 12) ||  (parseInt(month) == 12 && parseInt(day) < 10)) {
            alert("You cannot choose a date that has already passed.");
          } else if (((parseInt(month) == 2) || (parseInt(month) == 4) || (parseInt(month) == 6) || (parseInt(month) == 9) || (parseInt(month) == 11)) && parseInt(day) == 31)  {
            alert("This date does not exist.");
          } else if ((parseInt(year) == 2019 && parseInt(month) == 2 && parseInt(day) > 28) || (parseInt(year) == 2020 && parseInt(month) == 2 && parseInt(day) > 29)) {
            alert("This date does not exist.");
          } else {
            let flightData = {
              "flight": {
                "departs_at":   depTime,
                "arrives_at":   arrTime,
                "number":       "request",
                "plane_id":     2249,
                "departure_id": 134212,
                "arrival_id":   currentAirportRequestPage.id
              }
            }
          // POST new flight to API
            $.ajax(root_url + "flights", {
               type: 'POST',
               dataType: 'json',
               data: flightData,
               xhrFields: {withCredentials: true},
               success: (response) => {
                 
                 // make new instance of the flight
                 let instanceData = {
                   "instance" : {
                     "flight_id": response.id,
                     "date":      date
                   }
                 }

                 $.ajax(root_url + "instances", {
                   type: 'POST',
                   dataType: 'json',
                    data: instanceData,
                   xhrFields: {withCredentials: true},
                   success: (response) => {
			make_flight_list(currentAirportRequestPage.id);
                   }
                 });
               }
            }); // end of ajax call for flights
          }
          // make_flight_list(currentAirportRequestPage.id);
        });

      });

    $('.reqbutton').on('click', function() {
       // console.log("here");
       chosenFlightValue = $(this).val();
       // console.log(chosenFlightValue);
    });

    // final request button
    let endDiv = $('<div id="endDiv"></div>');
    reqdiv.after(endDiv);
    endDiv.append('<input type="button" value="REQUEST" id="requestDone"> </input>');

    // click event for request button -- POST new ticket
    $('#requestDone').on("click", function(){
      // keep everything in here -- this fixed the glitch
      let airport_id = currentAirportRequestPage.id;
      let flight_id = $("input[name='flightR']:checked").val();
	    
      if (flight_id == undefined) {
        alert("Please choose a flight");
      }  else {
      $.ajax(root_url + "instances?filter[flight_id]=" + flight_id,
             {
             type: 'GET',
             dataType: 'json',
             xhrFields: {withCredentials: true},
             success: (response) => {
                 let instance = response[0]; //array should be exactly one instance
                 let instance_id;
                 if(instance!=null)instance_id = instance.id;

                 let data =  { "ticket" : {
                                   "first_name": itemName,
                                   "middle_name" : currentName,
                                   "last_name": "Request",
                                   "age" : 1,
                                   "gender" : gender,
                                   "is_purchased" : 1.0,
                                   "price_paid" : priceWillReq,
                                   "instance_id" : instance_id,
                                   "seat_id" : 5520
                                   }
                               }
                  if (itemName != "" && priceWillReq != "" && airport_id != ""  && !Number.isNaN(parseInt(priceWillReq))) {
                    // POST new ticket with given info from user
                    $.ajax(root_url + "/tickets?" , {
                          type: 'POST',
                          dataType: 'json',
                          data: data,
                          xhrFields: {withCredentials: true},
                          success: (response) => {
                            $('#request').click();
                          }
                     });
                 } else {
                   alert("Please fill in all input boxes with valid inputs to make a request.");
                 }
             }
        });
      }
    });
    darkBrightHandler(gender);
  });

  // function to load request list
    function make_request_list(gender) {
      $('#requestlist').empty();
      let matchArray = [];
      let instanceID, currentID;

      $.ajax(root_url + "tickets", {
         type: 'GET',
         dataType: 'json',
         xhrFields: {withCredentials: true},
         success: (response) => {
           let array = response;
           //find all requests where middle/last name is not the User and gender is correct
           for (let i = 0; i < array.length; i++ ) {
             if (array[i].gender == gender && array[i].is_purchased == true) {
              if (array[i].middle_name.includes("User")){
                //nothing
              } else {
                if (array[i].last_name.includes("User")){
                  //nothing
                } else {
                  if (array[i].last_name.length < 3){
                    matchArray.push(array[i]);
                  }
                }
              }

             }
           }
        // create text nodes of flight info, radio button to choose one, and append to list div for flights
        for (let j = 0; j < matchArray.length; j++) {
            let reqListDiv = $('<div id="indivRequest"></div>');
            instanceID = matchArray[j].instance_id;
            currentID = matchArray[j].id;
            let firstName = matchArray[j].first_name;
            let pricePay = matchArray[j].price_paid;
            $.ajax(root_url + "instances?filter[id]=" + matchArray[j].instance_id,
                   {
                   type: 'GET',
                   dataType: 'json',
                   xhrFields: {withCredentials: true},
                   success: (response) => {
                     let instarray = response;
                     let flight_id, dep_date;
                     // match the ticket with its instance object
                     for (let p = 0; p < instarray.length; p++) {
                         if (instarray[p].id == matchArray[j].instance_id) {
                           flight_id = instarray[p].flight_id;
                           dep_date = instarray[p].date;
                         }
                    }
                         // GET flight
                         $.ajax(root_url + "flights?filter[id]=" + flight_id, {
                                type: 'GET',
                                dataType: 'json',
                                xhrFields: {withCredentials: true},
                                success: (response) => {
                                  let flightarray = response;
                                  let dep_time, dep_id;
                                  // match the ticket with its flight object
                                  for (let m = 0; m < flightarray.length; m++) {
                                    if (flightarray[m].id == flight_id) {
                                      // console.log("flight_id: ");
                                      // console.log(flightarray[m].id);
                                      dep_time = flightarray[m].departs_at;
                                      dep_id = flightarray[m].departure_id;
                                    }
                                }
                                     // GET airport
                                    $.ajax(root_url + "airports?", {
                                           type: 'GET',
                                           dataType: 'json',
                                           xhrFields: {withCredentials: true},
                                           success: (response) => {
                                              for (let k = 0; k < response.length; k++) {
                                                let airport = response[k];
                                                if (airport.id == dep_id) {
                                                  let indivTick = $('<div class="indivTicket" id="indivTicket_' + currentID + '"></div>');
                                                  let fulfillButton = $('<input class="fulfillButton" type="radio" name="fulfillButtony" value="' + currentID + '"> Fulfill this Request: </input> <br></br>');
                                                  let item = $('<div id="itemName">' + "Item Requested: " + firstName + '</div>');
                                                  let compPrice = $('<div id="compPrice">' + "Compensation Price: $" + pricePay + '</div>');
                                                  let depDate = $('<div id="depDate">' + "Departure Date: " + dep_date + '</div>');
                                                  let depTime = $('<div id="depTime">' + "Departure Time: " + dep_time.slice(11, 16) + '</div>');
                                                  let depAir = $('<div id="depAir">' + "Departure Airport: " + airport.name + " (" + airport.code + ")" + '</div>');
                                                  indivTick.append(fulfillButton);
                                                  indivTick.append(item);
                                                  indivTick.append(compPrice);
                                                  indivTick.append(depDate);
                                                  indivTick.append(depTime);
                                                  indivTick.append(depAir);
                                                  $('#requestlist').append(indivTick);
                                                }
                                              }
                                          }
                                 });
                               // } // for loop flight
                             } // flight success
                        });
                      // } // instance for loop
                   }  // instance end
            }); // instance ajax call
        }  // end of for loop for matcharray
       }
     });
  } // end of make_request_list

  // function: repopulate receive list - new
  function make_receive_list(currentAirportReceivePage) {
    listDiv.empty(); //to prevent duplicates on multiple button click
    let airport_id = currentAirportReceivePage.id;

     //get all flights arriving at airport
     $.ajax(root_url + "flights", //couldn't get filtering to work for integers on flights?? .... idk fam
    {
        type: 'GET',
        dataType: 'json',
        xhrFields: {withCredentials: true},
        success: (response) => {
        let array = response;
         //find correct arrival ids
        for (let i=0; i<array.length; i++) { //filtering workaround
             if(array[i].arrival_id == airport_id){

                 let flight = array[i];
                 //get instance of that flight
                 let flight_id = flight.id;

                 $.ajax(root_url + "instances?filter[flight_id]=" + flight_id,
                    {
                        type: 'GET',
                        dataType: 'json',
                        xhrFields: {withCredentials: true},
                        success: (response) => {
                        let instance = response[0]; //array should be exactly one instance
                        let instance_id;

                        if(instance!=null)
                          instance_id = instance.id;
                        //get tickets of that array

                         $.ajax(root_url + "tickets?filter[is_purchased]=0.0&filter[gender]=" + gender + "&filter[instance_id]=" + instance_id, //filtering ajax request on tickets
                            {
                                type: 'GET',
                                dataType: 'json',
                                xhrFields: {withCredentials: true},
                                success: (response) => { //populate receive page ticket div

                                let tickets = response;
                                 if (tickets.length > 0){//if there exsist tickets

                                     //for each unpurchased ticket make new listing
                                     for (let i=0; i<tickets.length; i++) {
					if (tickets[i].middle_name.includes("User") || tickets[i].last_name.includes("User")) {
                                         //nothing
                                       } else {    
                                             let ticketDiv = $('<div class="ticketDiv" id="ticketDiv_' + tickets[i].id + '"></div> ');
                                             //div per ticket - id is "ticketDiv_<ticketID>"
                                             listDiv.append(ticketDiv);
                                             //make fields for ticket request
                                             ticketDiv.append('<div class="itemName">' + tickets[i].first_name + '</div>');
                                             ticketDiv.append('<div class="itemPrice">'+ "Asking Price: $" + tickets[i].price_paid + '</div>');
                                             ticketDiv.append('<div class="flightNum">'+ "Flight: " + flight.number + '</div>');
                                             ticketDiv.append('<div class="arrivalDate">'+ "Arrival Date: " + instance.date + '</div>');

                                             //arrival time string is weird - must be cut up
                                             let arrTime = flight.arrives_at;
                                             arrTime = arrTime.slice(11, 16);
                                             ticketDiv.append('<div class="arrivalTime">'+ "Arrival Time: " + arrTime + '</div>');

                                             //add purchase button
                                             let buyButton = $('<button class="buyButton" id="' + tickets[i].id + '">PURCHASE</button>');
                                             ticketDiv.append(buyButton);

                                             $("#" + tickets[i].id).on("click", function(){
                                                    let data = { "ticket":
                                                                {
                                                                    "middle_name": currentName,
                                                                    "is_purchased": 1.0
                                                                }
                                                               }

                                                    $.ajax(root_url + "tickets/" + tickets[i].id, {
                                                      type: 'PATCH',
                                                      dataType: 'json',
                                                      data: data,
                                                      xhrFields: {withCredentials: true},
                                                      success: (response) => {
                                                        // delete item
                                                        $("#ticketDiv_" + tickets[i].id).remove();

                                                      }
                                                    });
                                             });
				       }
                                     }
                                 }
                                }
                            });
                        }
                    });
             }
        }
        }

    });




  };


  // function to update flight list when new one is added
  function make_flight_list(airportid) {
    $('#req_flightlist').empty();
    let airport_id = airportid;
    let flight, currentflightId;
    let matchArray = [];

    $.ajax(root_url + "flights", {
       type: 'GET',
       dataType: 'json',
       xhrFields: {withCredentials: true},
       success: (response) => {
         // console.log(response);
         let array = response;

         //find correct arrival ids
         for (let i=0; i<array.length; i++) {
              if(array[i].arrival_id == airport_id){
                  //get instance of that flight
                  matchArray.push(array[i]);
                }
        }

      // create text nodes of flight info, radio button to choose one, and append to list div for flights
      for (let j = 0; j < matchArray.length; j++) {
          let flightDiv =  $('<div id="indivFlight"></div>');
          currentFlightId = matchArray[j].id;
          let arrivalid = airport_id;
          let arrivesat = matchArray[j].arrives_at;
          let instanceDate;

          // get arrival date
          $.ajax(root_url + "instances?filter[flight_id]=" + matchArray[j].id,
             {
             type: 'GET',
             dataType: 'json',
             xhrFields: {withCredentials: true},
             success: (response) => {
               // keep everything in here -- this fixed the glitch
               let inst = response[0];
               if(inst!=null) currentFlightId = inst.flight_id;
               instanceDate = inst.date;
               console.log(currentFlightId);
               flight = $('<input class="flightButtonReq" type="radio" name="flightR" id="'+ inst.flight_id + '" value="' +
               currentFlightId + '"> <label class="bold">Choose this Flight:</label> <br>');
               let arrtime = $('<div id="arrTime">' + "Arrival Time: " + arrivesat.slice(11, 16) + '</div>');
               let arrdate = $('<div id="arrDate">' + "Arrival Date: " + instanceDate.toString() + '</div>');
               flightDiv.append(flight);
               flightDiv.append(arrdate);
               flightDiv.append(arrtime);
               newLine(flightDiv);
               $('#req_flightlist').append(flightDiv);
             }
          });
      }
     }
   });
  }

  function make_flightlist_send_page(airportid) {
    $('#flightlist').empty();
    let airport_id = airportid;
    let flight, currentFlightId;

    let matchArray = [];
    $.ajax(root_url + "flights", {
       type: 'GET',
       dataType: 'json',
       xhrFields: {withCredentials: true},
       success: (response) => {
         // console.log(response);
         let array = response;

         //find correct arrival ids
         for (let i=0; i<array.length; i++) {
              if(array[i].departure_id == airport_id){
                  //get instance of that flight
                  matchArray.push(array[i]);
                }
         }

        // create text nodes of flight info, radio button to choose one, and append to list div for flights
        for (let j = 0; j < matchArray.length; j++) {
            let flightDiv =  $('<div id="indivFlight"></div>');
            currentFlightId = matchArray[j].id;
            let departureid = airport_id;
            let departsat = matchArray[j].departs_at;
            let instanceDate;

            // get date
            $.ajax(root_url + "instances?filter[flight_id]=" + matchArray[j].id,
               {
               type: 'GET',
               dataType: 'json',
               xhrFields: {withCredentials: true},
               success: (response) => {
                 // keep everything in here -- this fixed the glitch
                 currentFlightId = response[0].flight_id;
                 instanceDate = response[0].date;
                 flight = $('<input class="flightButtonSend" type="radio" name="flightS" id="'+ response[0].flight_id +'" value="' +
                 currentFlightId + '"> <label class="bold">Choose this Flight:</label> <br>');
                 let deptime = $('<div id="depTime">' + "Departure Time: " + departsat.slice(11, 16) + '</div>');
                 let depdate = $('<div id="depDate">' + "Departure Date: " + instanceDate.toString() + '</div>');
                 flightDiv.append(flight);
                 flightDiv.append(depdate);
                 flightDiv.append(deptime);
                 $('#flightlist').append(flightDiv);
               }
            });
        }
     }
   });
  }

  function addTimeDropdown() {
    let td = $('<td class="record-value"></td>');
    $('#newFlightInput').append(td);

    td.append("Arrival Time: ");
    // add hour dropdown
    let div = $('<div id="hourDiv" class="form-inline time-view"></div>');
    let selectTime = $('<select tabindex="0" id="hourSel" class="form-control x-select time-view">');
    td.append(div);
    div.append("Hour: ");
    div.append(selectTime);
    for (let i = 0; i < 24; i++) {
      if (i < 10) {
        let timeOpt = $('<option value="0' + i + '" id="hour0' + i + '" class="x-option time-view"></option>');
        let text = document.createTextNode("0" + i);
        timeOpt.append(text);
        selectTime.append(timeOpt);
      } else {
        let timeOpt = $('<option value="' + i + '" id="hour' + i + '" class="x-option time-view"></option>');
        selectTime.append(timeOpt);
        let text = document.createTextNode(i);
        timeOpt.append(text);
      }
    }

    // add minute dropdown
    let minDiv = $('<div id="minDiv" class="form-inline min-view"></div>');
    let selectMin = $('<select tabindex="0" id="minSel" class="form-control x-select min-view">');
    td.append(minDiv);
    minDiv.append("Min: ");
    minDiv.append(selectMin);
    for (let i = 0; i < 60; i++) {
      if (i < 10) {
        let timeOpt = $('<option value="0' + i + '" id="min0' + i + '" class="x-option min-view"></option>');
        let text = document.createTextNode("0" + i);
        timeOpt.append(text);
        selectMin.append(timeOpt);
      } else {
        let timeOpt = $('<option value="' + i + '" id="min' + i + '" class="x-option min-view"></option>');
        selectMin.append(timeOpt);
        let text = document.createTextNode(i);
        timeOpt.append(text);
      }
    }
  }

  function addDateDropdown() {
    let td = $('<td class="record-value"></td>');
    $('#newFlightInput').append(td);

    td.append("Arrival Date: ");
    // add year dropdown
    let yearDiv = $('<div id="yearDiv" class="form-inline year-view"></div>');
    let selectYear = $('<select tabindex="0" id="yearSel" class="form-control x-select year-view">');
    td.append(yearDiv);
    yearDiv.append("Year: ");
    yearDiv.append(selectYear);
    for (let i = 0; i < 3; i++) {
        let p = 2018 + i;
        let timeOpt = $('<option value="' + p + '" id="year' + i + '" class="x-option year-view"></option>');
        selectYear.append(timeOpt);
        let text = document.createTextNode(p);
        timeOpt.append(text);
    }

    // add month dropdown
    let monthDiv = $('<div id="monthDiv" class="form-inline month-view"></div>');
    let selectMonth = $('<select tabindex="0" id="monthSel" class="form-control x-select month-view">');
    td.append(monthDiv);
    monthDiv.append("Month: ");
    monthDiv.append(selectMonth);
    for (let i = 1; i < 13; i++) {
      if (i < 10) {
        let timeOpt = $('<option value="0' + i + '" id="month0' + i + '" class="x-option month-view"></option>');
        let text = document.createTextNode("0" + i);
        timeOpt.append(text);
        selectMonth.append(timeOpt);
      } else {
        let timeOpt = $('<option value="' + i + '" id="month' + i + '" class="x-option month-view"></option>');
        selectMonth.append(timeOpt);
        let text = document.createTextNode(i);
        timeOpt.append(text);
      }
    }

    // add day dropdown
    let dayDiv = $('<div id="dayDiv" class="form-inline day-view"></div>');
    let selectDay = $('<select tabindex="0" id="daySel" class="form-control x-select day-view">');
    td.append(dayDiv);
    dayDiv.append("Day: ");
    dayDiv.append(selectDay);
    for (let i = 1; i < 32; i++) {
      if (i < 10) {
        let timeOpt = $('<option value="0' + i + '" id="day0' + i + '" class="x-option min-view"></option>');
        let text = document.createTextNode("0" + i);
        timeOpt.append(text);
        selectDay.append(timeOpt);
      } else {
        let timeOpt = $('<option value="' + i + '" id="day' + i + '" class="x-option min-view"></option>');
        selectDay.append(timeOpt);
        let text = document.createTextNode(i);
        timeOpt.append(text);
      }
    }
  }

$("#pokemonButton").on("click", function(){ //third party api

        if (gender == "dark"){
            $.ajax("https://pokeapi.co/api/v2/type/17/", //dark type
            {
                type: 'GET',
                dataType: 'json',

                success: (response) => {
                    let pokemon = response.pokemon;
                    let numPokemon = pokemon.length;
                    let rand = Math.floor(Math.random() * numPokemon);

                    let pickedPokemon = pokemon[rand].pokemon.name;

                    if (pickedPokemon.includes("-")){
                        let splitArray = pickedPokemon.split("-");
                        pickedPokemon = splitArray[0];
                    }

                    currentName = pickedPokemon;
                    $("#currentPseudonym").text("Current Pseudonym: " + pickedPokemon);

                }
            });
        } else {
            $.ajax("https://pokeapi.co/api/v2/type/3/", //flying type
            {
                type: 'GET',
                dataType: 'json',

                success: (response) => {
                    let pokemon = response.pokemon;
                    let numPokemon = pokemon.length;
                    let rand = Math.floor(Math.random() * numPokemon);

                    let pickedPokemon = pokemon[rand].pokemon.name;

                    if (pickedPokemon.includes("-")){
                        let splitArray = pickedPokemon.split("-");
                        pickedPokemon = splitArray[0];
                    }

                    currentName = "User: " + pickedPokemon;
                    $("#currentPseudonym").text("Current Pseudonym: " + pickedPokemon);

                }
            });
        }
    });

  //jess - receive page
 $("#receive").on("click", function(){
   main.empty();

   let recDiv = $('<div id="receive_div"> </div>');
   let airportDiv = $('<div id="airport_div"> </div>');  // floating left
   let itemDiv = $('<div id="items_div"> </div>');  // floating right

   recDiv.append(airportDiv);
   recDiv.append(itemDiv);

   newLine(airportDiv, 4);
   airportDiv.append('<h1 id="search_airport">SEARCH AIRPORT</h1>');
   main.append(recDiv);

   let formDiv = $('<div></div>');
   airportDiv.append(formDiv);

   let autoCompleteDiv = $('<div class="autocomplete"><input id="myInput" type="text" name="myCountry" placeholder="Airports Near You ..." searchBar><br></div>');
   formDiv.append(autoCompleteDiv);

   listDiv = $('<div id="list_of_tickets"> </div> '); //all tickts go in here
   newLine(itemDiv, 2);
   itemDiv.append(listDiv);

   let searchResult = "";
   let airportNames = new Array(airports.length -1);
   let airportsNotCYO = new Array(airports.length -1);

   let j = 0;
   for (let i=0; i < airports.length; i++) {
       if (airports[j].code == "CYO"){
           //do nothing - we don't want to include this one
       } else {
           airportsNotCYO[j] = airports[j];
           airportNames[j] = airports[j].name + " (" + airports[j].code + ")";

           j++;
       }

   }

   currentAirportReceivePage = airportsNotCYO[0];

       //autocomplete
     $('[searchBar]').on("keyup", function() {

         let term = $(this).val().toLowerCase();

             if (term != '') {
                 $(".dropdown").remove();
                 $(".temp").remove();
                     for (let i=0; i < airportNames.length; i++) {
                         let anlc = airportNames[i].toLowerCase();
                         if(anlc.includes(term)){
                             autoCompleteDiv.append('<button class="dropdown" id="' + airportsNotCYO[i].code + '">' + airportNames[i] + '</button><br class="temp" id="temp_' + airportsNotCYO[i].code + '">');

                             //on dropdown clicks, set current airport
                             $("#" + airportsNotCYO[i].code).on("click", function(){
                                 $(".ticketDiv").remove();
                                 currentAirportReceivePage = airportsNotCYO[i];

                                 //get rid of dropdown once clicked - added
                                 $("#myInput").val(airportsNotCYO[i].name);
                                 $(".dropdown").remove();
                                 $(".temp").remove();

                                 make_receive_list(currentAirportReceivePage);
                             });
                       } else {
                           $("#" + airportsNotCYO[i].code).remove();
                           $("#temp_" + airportsNotCYO[i].code).remove();
                       }
                   }
           } else {
               $(".dropdown").remove();
               $(".temp").remove();
           }
   });
   darkBrightHandler(gender);
 });

 // populate the up for sale items on my things page
 function make_upForSale_list(gender, root_url) {
   $('#upForSale').empty();

   $.ajax(root_url + "tickets?filter[is_purchased]=0.0", //filtering ajax request on tickets
      {
          type: 'GET',
          dataType: 'json',
          xhrFields: {withCredentials: true},
          success: (response) => {
            let ticketArray = response;
            for (let i = 0; i < ticketArray.length; i++) {
              if (ticketArray[i].last_name.includes("User") && ticketArray[i].gender == gender) {
                $.ajax(root_url + "instances?filter[id]=" + ticketArray[i].instance_id, //filtering ajax request on tickets
                   {
                       type: 'GET',
                       dataType: 'json',
                       xhrFields: {withCredentials: true},
                       success: (response) => {
                          let instanceRay = response;
                          for (let j = 0; j < instanceRay.length; j++) {
                            if (instanceRay[j].id == ticketArray[i].instance_id) {
                              let date = instanceRay[j].date;
                              $.ajax(root_url + "flights?filter[id]=" + instanceRay[j].id, //filtering ajax request on tickets
                                 {
                                     type: 'GET',
                                     dataType: 'json',
                                     xhrFields: {withCredentials: true},
                                     success: (response) => {
                                       let flightRay = response;
                                       for (let p = 0; p < flightRay.length; p++) {
                                         if (flightRay[p].id == instanceRay[j].flight_id) {
                                           $.ajax(root_url + "airports?filter[id]=" + flightRay[p].departure_id, //filtering ajax request on tickets
                                              {
                                                  type: 'GET',
                                                  dataType: 'json',
                                                  xhrFields: {withCredentials: true},
                                                  success: (response) => {
                                                    let airRay = response;
                                                    for (let m = 0; m < airRay.length; m++) {
                                                      if (airRay[m].id == flightRay[p].departure_id) {
                                                        let indTick = $('<div id="indTick"></div>');
                                                        indTick.append(ticketArray[i]);
                                                        indTick.append('<div id="itemNameSale"> Item: ' + ticketArray[i].first_name + '</div>');
                                                        indTick.append('<div id="askingPriceSale"> Asking Price: ' + ticketArray[i].price_paid + '</div>');
                                                        indTick.append('<div id="depDateSale"> Depature Date: ' + date + '</div>');
                                                        indTick.append('<div id="depTimeSale"> Departure Time: ' + flightRay[p].departs_at.slice(11, 16) + '</div>');
                                                        indTick.append('<div id="depAirSale"> Departure Airport: ' + airRay[m].name + " (" + airRay[m].code + ")" + '</div>');
                                                        newLine(indTick);
                                                        $('#upForSale').append(indTick);
                                                    }
                                                 }
                                               }
                                            });
                                        }
                                   }
                               }
                            });
                           }
                        }
                     }
                 });
              }
            }
          }
     });
 }

 // populate the fulfilled items on my things page
 function make_fulfilled_list(gender, root_url) {
   $('#fulfilledReq').empty();

   $.ajax(root_url + "tickets?filter[is_purchased]=1.0", //filtering ajax request on tickets
      {
          type: 'GET',
          dataType: 'json',
          xhrFields: {withCredentials: true},
          success: (response) => {
            let ticketArray = response;
            for (let i = 0; i < ticketArray.length; i++) {
              if (ticketArray[i].last_name.includes("User") && ticketArray[i].gender == gender) {
                $.ajax(root_url + "instances?filter[id]=" + ticketArray[i].instance_id, //filtering ajax request on tickets
                   {
                       type: 'GET',
                       dataType: 'json',
                       xhrFields: {withCredentials: true},
                       success: (response) => {
                          let instanceRay = response;
                          for (let j = 0; j < instanceRay.length; j++) {
                            if (instanceRay[j].id == ticketArray[i].instance_id) {
                              let date = instanceRay[j].date;
                              $.ajax(root_url + "flights?filter[id]=" + instanceRay[j].id, //filtering ajax request on tickets
                                 {
                                     type: 'GET',
                                     dataType: 'json',
                                     xhrFields: {withCredentials: true},
                                     success: (response) => {
                                       let flightRay = response;
                                       for (let p = 0; p < flightRay.length; p++) {
                                         if (flightRay[p].id == instanceRay[j].flight_id) {
                                           $.ajax(root_url + "airports?filter[id]=" + flightRay[p].departure_id, //filtering ajax request on tickets
                                              {
                                                  type: 'GET',
                                                  dataType: 'json',
                                                  xhrFields: {withCredentials: true},
                                                  success: (response) => {
                                                    let airRay = response;
                                                    for (let m = 0; m < airRay.length; m++) {
                                                      if (airRay[m].id == flightRay[p].departure_id) {
                                                        let indFluff = $('<div id="indFluff"></div>');
                                                        indFluff.append(ticketArray[i]);
                                                        indFluff.append('<div id="itemNameFulfill"> Item: ' + ticketArray[i].first_name + '</div>');
                                                        indFluff.append('<div id="compFulfill"> Compensation: ' + ticketArray[i].price_paid + '</div>');
                                                        indFluff.append('<div id="depDateFulfill"> Depature Date: ' + date + '</div>');
                                                        indFluff.append('<div id="depTimeFulfill"> Departure Time: ' + flightRay[p].departs_at.slice(11, 16) + '</div>');
                                                        indFluff.append('<div id="depAirFulfill"> Departure Airport: ' + airRay[m].name + " (" + airRay[m].code + ")" + '</div>');
                                                        newLine(indFluff);
                                                        $('#fulfilledReq').append(indFluff);
                                                    }
                                                 }
                                               }
                                            });
                                        }
                                   }
                               }
                            });
                           }
                        }
                     }
                 });
              }
            }
          }
     });
 }

 // populate the ordered items on my things page
 function make_order_list(gender, root_url) {
   $('#order').empty();

   $.ajax(root_url + "tickets?filter[is_purchased]=1.0", //filtering ajax request on tickets
      {
          type: 'GET',
          dataType: 'json',
          xhrFields: {withCredentials: true},
          success: (response) => {
            let ticketArray = response;
            for (let i = 0; i < ticketArray.length; i++) {
              if (ticketArray[i].middle_name.includes("User") && ticketArray[i].last_name != "Request" && ticketArray[i].last_name != "" && ticketArray[i].gender == gender) {
                $.ajax(root_url + "instances?filter[id]=" + ticketArray[i].instance_id, //filtering ajax request on tickets
                   {
                       type: 'GET',
                       dataType: 'json',
                       xhrFields: {withCredentials: true},
                       success: (response) => {
                          let instanceRay = response;
                          for (let j = 0; j < instanceRay.length; j++) {
                            if (instanceRay[j].id == ticketArray[i].instance_id) {
                              let date = instanceRay[j].date;
                              $.ajax(root_url + "flights?filter[id]=" + instanceRay[j].id, //filtering ajax request on tickets
                                 {
                                     type: 'GET',
                                     dataType: 'json',
                                     xhrFields: {withCredentials: true},
                                     success: (response) => {
                                       let flightRay = response;
                                       for (let p = 0; p < flightRay.length; p++) {
                                         if (flightRay[p].id == instanceRay[j].flight_id) {
                                           $.ajax(root_url + "airports?filter[id]=" + flightRay[p].arrival_id, //filtering ajax request on tickets
                                              {
                                                  type: 'GET',
                                                  dataType: 'json',
                                                  xhrFields: {withCredentials: true},
                                                  success: (response) => {
                                                    let airRay = response;
                                                    for (let m = 0; m < airRay.length; m++) {
                                                      if (airRay[m].id == flightRay[p].arrival_id) {
                                                        let indFluff = $('<div id="indFluff"></div>');
                                                        indFluff.append(ticketArray[i]);
                                                        indFluff.append('<div id="itemNameOrder"> Item: ' + ticketArray[i].first_name + '</div>');
                                                        indFluff.append('<div id="priceOrder"> Price: ' + ticketArray[i].price_paid + '</div>');
                                                        indFluff.append('<div id="arrDateOrder"> Arrival Date: ' + date + '</div>');
                                                        indFluff.append('<div id="arrTimeOrder"> Arrival Time: ' + flightRay[p].arrives_at.slice(11, 16) + '</div>');
                                                        indFluff.append('<div id="arrAirOrder"> Arrival Airport: ' + airRay[m].name + " (" + airRay[m].code + ")" + '</div>');
                                                        newLine(indFluff);
                                                        $('#order').append(indFluff);
                                                    }
                                                 }
                                               }
                                            });
                                        }
                                   }
                               }
                            });
                           }
                        }
                     }
                 });
              }
            }
          }
     });
 }

 // populate the requests made for items on my things page
 function make_requestMade_list(gender, root_url) {
   $('#requestsMade').empty();

   $.ajax(root_url + "tickets?filter[is_purchased]=1.0", //filtering ajax request on tickets
      {
          type: 'GET',
          dataType: 'json',
          xhrFields: {withCredentials: true},
          success: (response) => {
            let ticketArray = response;
            for (let i = 0; i < ticketArray.length; i++) {
              if (ticketArray[i].last_name.includes("Request") && ticketArray[i].middle_name.includes("User") && ticketArray[i].gender == gender) {
                $.ajax(root_url + "instances?filter[id]=" + ticketArray[i].instance_id, //filtering ajax request on tickets
                   {
                       type: 'GET',
                       dataType: 'json',
                       xhrFields: {withCredentials: true},
                       success: (response) => {
                          let instanceRay = response;
                          for (let j = 0; j < instanceRay.length; j++) {
                            if (instanceRay[j].id == ticketArray[i].instance_id) {
                              let date = instanceRay[j].date;
                              $.ajax(root_url + "flights?filter[id]=" + instanceRay[j].id, //filtering ajax request on tickets
                                 {
                                     type: 'GET',
                                     dataType: 'json',
                                     xhrFields: {withCredentials: true},
                                     success: (response) => {
                                       let flightRay = response;
                                       for (let p = 0; p < flightRay.length; p++) {
                                         if (flightRay[p].id == instanceRay[j].flight_id) {
                                           $.ajax(root_url + "airports?filter[id]=" + flightRay[p].arrival_id, //filtering ajax request on tickets
                                              {
                                                  type: 'GET',
                                                  dataType: 'json',
                                                  xhrFields: {withCredentials: true},
                                                  success: (response) => {
                                                    let airRay = response;
                                                    for (let m = 0; m < airRay.length; m++) {
                                                      if (airRay[m].id == flightRay[p].arrival_id) {
                                                        let indFluff = $('<div id="indFluff"></div>');
                                                        indFluff.append(ticketArray[i]);
                                                        indFluff.append('<div id="itemNameReqMade"> Item: ' + ticketArray[i].first_name + '</div>');
                                                        indFluff.append('<div id="priceReqMade"> Price: ' + ticketArray[i].price_paid + '</div>');
                                                        indFluff.append('<div id="arrDateReqMade"> Arrival Date: ' + date + '</div>');
                                                        indFluff.append('<div id="arrTimeReqMade"> Arrival Time: ' + flightRay[p].arrives_at.slice(11, 16) + '</div>');
                                                        indFluff.append('<div id="arrAirReqMade"> Arrival Airport: ' + airRay[m].name + " (" + airRay[m].code + ")" + '</div>');
                                                        newLine(indFluff);
                                                        $('#requestsMade').append(indFluff);
                                                    }
                                                 }
                                               }
                                            });
                                        }
                                   }
                               }
                            });
                           }
                        }
                     }
                 });
              }
            }
          }
     });
 }

  function buildHome(){
    main.empty();
    main.append('<div id="mythingsdiv"></div>');
    mythingsdiv = $('#mythingsdiv');
	  
    darkBrightHandler(gender);

    mythingsdiv.append($('<div class = "client-items"></div>'));
    $('.client-items').append($('<h1 class = "sell"> Up For Sale </h1>'));
    $('.sell').append($('<div class = "mythings" id="upForSale"></div>'));
    make_upForSale_list(gender, root_url);

    $('.client-items').append($('<h1 class= "fulfill"> Fulfilled Requests </h1>'));
    $('.fulfill').append($('<div class = "mythings" id="fulfilledReq"></div>'));
    make_fulfilled_list(gender, root_url);

    $('.client-items').append($('<h1 class = "ordered"> Ordered </h1>'));
    $('.ordered').append($('<div class = "mythings"  id="order"></div>'));
    make_order_list(gender, root_url);

    $('.client-items').append($('<h1 class = "requestsMade"> Requests Made </h1>'));
    $('.requestsMade').append($('<div class = "mythings" id="requestsMade"></div>'));
    make_requestMade_list(gender, root_url);
  }

  function darkBrightHandler(gender){
  if (gender == "dark") {
    document.body.style.backgroundColor = "#282828";
    document.body.style.color = "white";
    if(document.getElementById("req_flightlist")!=null)
      document.getElementById("req_flightlist").style.backgroundColor = "rgba(0,0,0,0.5)";

    if(document.getElementById("newFlightInput")!=null)
      document.getElementById("newFlightInput").style.backgroundColor = "rgba(0,0,0,0.5)";

    if(document.getElementById("airport_div")!=null)
      document.getElementById("airport_div").style.backgroundColor = "rgba(0,0,0,0.5)";

    if(document.getElementById("items_div")!=null)
      document.getElementById("items_div").style.backgroundColor = "rgba(0,0,25,0.5)";

    if(document.getElementById("fulfill_div")!=null)
      document.getElementById("fulfill_div").style.backgroundColor = "rgba(30,0,60,0.5)";

    if(document.getElementById("inputdiv")!=null)
      document.getElementById("inputdiv").style.backgroundColor = "rgba(15,0,30,0.3)";

    if(document.getElementById("flightlist")!=null)
      document.getElementById("flightlist").style.backgroundColor = "rgba(15,0,30,0.3)";

    for(let i = 0; i < document.getElementsByClassName("indivTicket").length; i++){
      document.getElementsByClassName("indivTicket")[i].style.backgroundColor = "rgba(0,0,0,0.5)";
    }

    for(let i = 0; i < document.getElementsByClassName("mythings").length; i++){
      document.getElementsByClassName("mythings")[i].style.backgroundColor = "rgba(30,30,30,0.7)";
      document.getElementsByClassName("mythings")[i].style.color = "white";
    }

    for(let i = 0; i < document.getElementsByClassName("navbar-item").length; i++){
      document.getElementsByClassName("navbar-item")[i].style.color = "white";
    }
    document.getElementById("navdiv").style.color = "white";
  } else {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
    if(document.getElementById("req_flightlist")!=null)
      document.getElementById("req_flightlist").style.backgroundColor = "rgba(250,250,250,0.5)";

    if(document.getElementById("newFlightInput")!=null)
      document.getElementById("newFlightInput").style.backgroundColor = "rgba(250,250,250,0.5)";

    if(document.getElementById("airport_div")!=null)
      document.getElementById("airport_div").style.backgroundColor = "rgba(245, 245, 245, 0.5)";

    if(document.getElementById("items_div")!=null)
      document.getElementById("items_div").style.backgroundColor = "rgba(220, 220, 245, 0.5)";

    if(document.getElementById("fulfill_div")!=null)
      document.getElementById("fulfill_div").style.backgroundColor = "rgba(250,250,250,0.5)";

    if(document.getElementById("inputdiv")!=null)
      document.getElementById("inputdiv").style.backgroundColor = "rgba(200,200,200,0.3)";

    if(document.getElementById("flightlist")!=null)
      document.getElementById("flightlist").style.backgroundColor = "rgba(200,200,200,0.3)";

    for(let i = 0; i < document.getElementsByClassName("indivTicket").length; i++){
      document.getElementsByClassName("indivTicket")[i].style.backgroundColor = "rgba(250,250,250,0.7)";
    }

    for(let i = 0; i < document.getElementsByClassName("mythings").length; i++){
      document.getElementsByClassName("mythings")[i].style.backgroundColor = "rgba(200,200,200,0.3)";
      document.getElementsByClassName("mythings")[i].style.color = "rgba(30,30,30,0.8)";
    }

    for(let i = 0; i < document.getElementsByClassName("navbar-item").length; i++){
      document.getElementsByClassName("navbar-item")[i].style.color = "black";
    }
    document.getElementById("navdiv").style.color = "black";

  }
  }

});
